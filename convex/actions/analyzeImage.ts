"use node";

import { action } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { GoogleGenAI, Type } from "@google/genai";
import { getSpeciesReferenceImages } from "../lib/imageSearch";
import { validateImageMagicBytes } from "../lib/security";

// Validate API key exists
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set");
}

// Initialize Gemini AI with v1beta API for Gemini 3 support
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

interface AnalysisResult {
  // Primary Asian hornet detection fields
  asianHornetLikelihood?: "ALERT" | "UNLIKELY" | "UNCERTAIN";
  matchingFeatures?: string[];
  excludingFeatures?: string[];
  // Standard fields
  species: string;
  confidence: number;
  isThreat: boolean;
  threatLevel: "safe" | "low" | "medium" | "high";
  reasoning: string;
  anatomicalFeatures: string[];
  commonName?: string;
  scientificName?: string;
  family?: string;
  order?: string;
  habitat?: string;
  behavior?: string;
  ecologicalRole?: string;
  distribution?: string;
  size?: string;
  diet?: string;
  lifecycle?: string;
  similarSpecies?: string[];
  interestingFacts?: string[];
  safetyInfo?: string;
  // NZ biosecurity fields
  isNativeToNZ?: boolean;
  invasiveRisk?: "none" | "low" | "moderate" | "high" | "critical";
  nzStatus?: string;
  reportingAdvice?: string;
}

// Dynamic reference images are now handled by ./lib/imageSearch.ts

// ============================================================================
// SPEED OPTIMIZATIONS for Gemini 2.5 Flash
// - Using structured output schema for faster parsing (no JSON extraction needed)
// - Concise prompts optimized for quick pattern matching
// - See: https://ai.google.dev/gemini-api/docs/structured-output
// ============================================================================

// Structured output schema for biosecurity mode - enables native JSON response
const BIOSECURITY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    asianHornetLikelihood: {
      type: Type.STRING,
      enum: ["ALERT", "UNLIKELY", "UNCERTAIN"],
      description: "ALERT if 3+ features match or yellow legs + dark thorax. UNLIKELY if clear exclusion. UNCERTAIN if poor image."
    },
    confidence: { type: Type.NUMBER, description: "Confidence 0.0-1.0" },
    matchingFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Features matching Asian hornet"
    },
    excludingFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Features ruling out Asian hornet"
    },
    species: { type: Type.STRING, description: "Identified species" },
    commonName: { type: Type.STRING, description: "Common name" },
    scientificName: { type: Type.STRING, description: "Scientific name" },
    reasoning: { type: Type.STRING, description: "Brief explanation" },
    anatomicalFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Visible anatomical features"
    },
    similarSpecies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Species this could be confused with"
    },
    safetyInfo: { type: Type.STRING, description: "Safety advice" },
    reportingAdvice: { type: Type.STRING, description: "Reporting instructions if ALERT" }
  },
  required: ["asianHornetLikelihood", "confidence", "species", "reasoning"]
};

// Structured output schema for entomology mode
const ENTOMOLOGY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    species: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    reasoning: { type: Type.STRING },
    anatomicalFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
    commonName: { type: Type.STRING },
    scientificName: { type: Type.STRING },
    family: { type: Type.STRING },
    order: { type: Type.STRING },
    habitat: { type: Type.STRING },
    behavior: { type: Type.STRING },
    ecologicalRole: { type: Type.STRING },
    distribution: { type: Type.STRING },
    size: { type: Type.STRING },
    diet: { type: Type.STRING },
    lifecycle: { type: Type.STRING },
    similarSpecies: { type: Type.ARRAY, items: { type: Type.STRING } },
    interestingFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
    safetyInfo: { type: Type.STRING }
  },
  required: ["species", "confidence", "reasoning"]
};

// Concise prompts - model handles structure via schema
const BIOSECURITY_PROMPT = `Detect Asian hornet (Vespa velutina / yellow-legged hornet) in this image. This is a BIOSECURITY threat - err on the side of caution.

KEY FEATURES (any 2+ = ALERT):
- Yellow/orange leg tips (tarsi) on dark legs - THE KEY DISTINGUISHING FEATURE
- Dark brown/black velvety thorax (NOT yellow striped)
- Dark abdomen with single yellow-orange band on 4th segment
- Orange face with dark eyes
- Size: 20-30mm (larger than common wasps)

NEST FEATURES (any = ALERT):
- Large papery nest (can reach 80cm)
- Teardrop/spherical shape
- Side entrance hole
- High location (trees, under eaves)

COMMON LOOKALIKES (NOT Asian hornet):
- German wasp: Has yellow/black STRIPES on thorax
- Common wasp: Has distinct yellow/black banding throughout
- Paper wasp: Much more slender body
- European hornet: Yellow/brown striped, not dark
- Bees: Fuzzy/hairy body

CRITICAL RULES:
1. If you see yellow-tipped legs on a dark-bodied hornet = ALERT
2. If the thorax appears dark/velvety (not striped) = Consider ALERT
3. If image quality is poor but subject COULD be Asian hornet = ALERT
4. When in doubt = ALERT (false positives are acceptable, false negatives are NOT)
5. Only mark UNLIKELY if you can clearly see features that EXCLUDE Asian hornet`;

const GENERAL_ENTOMOLOGY_PROMPT = `Identify this insect. Provide species, taxonomy, habitat, behavior, and interesting facts.`;

export const analyzeInsectImage = action({
  args: {
    storageId: v.id("_storage"),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    userAgent: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    mode: v.optional(v.union(v.literal("biosecurity"), v.literal("entomology"))), // Analysis mode
    privacyConsentGiven: v.optional(v.boolean()),
    locationSharingConsent: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<string> => {
    try {
      // Get the image from Convex storage
      const imageBlob = await ctx.storage.get(args.storageId);
      if (!imageBlob) {
        throw new Error("Image not found in storage");
      }

      // Convert blob to ArrayBuffer
      const arrayBuffer = await imageBlob.arrayBuffer();
      
      // SECURITY: Strict size limits
      const maxSizeBytes = 20 * 1024 * 1024; // 20MB limit
      if (arrayBuffer.byteLength > maxSizeBytes) {
        throw new Error(`Image too large: ${(arrayBuffer.byteLength / (1024 * 1024)).toFixed(1)}MB. Max size: 20MB`);
      }

      // Minimum size check (avoid tiny files that might be malicious)
      const minSizeBytes = 100; // 100 bytes minimum
      if (arrayBuffer.byteLength < minSizeBytes) {
        throw new Error("Image too small - file may be corrupted");
      }

      // SECURITY: Validate image magic bytes
      const uint8 = new Uint8Array(arrayBuffer);
      const validation = validateImageMagicBytes(uint8);
      
      if (!validation.valid) {
        throw new Error("Invalid image file - file header does not match JPEG, PNG, or WebP format");
      }

      const mimeType = validation.mimeType || 'image/jpeg';

      console.log(`Image Analysis - Size: ${(arrayBuffer.byteLength / 1024).toFixed(2)}KB`);
      console.log(`Image Analysis - Validated MIME type: ${mimeType}`);
      console.log(`Image Analysis - First 10 bytes: ${Array.from(uint8.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);

      // Convert to base64 for API
      const base64Data = Buffer.from(arrayBuffer).toString('base64');

      // Select prompt based on analysis mode
      const analysisMode = args.mode || "biosecurity"; // Default to biosecurity mode
      const selectedPrompt = analysisMode === "entomology" ? GENERAL_ENTOMOLOGY_PROMPT : BIOSECURITY_PROMPT;

      console.log(`Analysis mode: ${analysisMode}`);

      // SPEED OPTIMIZATION: Using Gemini 2.5 Flash for fast responses
      // - 2.5 Flash is optimized for high-throughput, low-latency tasks
      // - Structured output eliminates JSON parsing overhead
      // - No thinking config needed for pattern matching tasks
      const modelName = 'gemini-2.5-flash';
      console.log(`Using model: ${modelName}`);

      // Select system instruction and schema based on mode
      const systemInstruction = analysisMode === "entomology"
        ? `You are an expert entomologist. Identify insects accurately and provide educational information.`
        : `You are an Asian hornet (Vespa velutina) detection specialist for New Zealand biosecurity. Your job is to protect NZ's native pollinators from this invasive species.

CRITICAL: This is a biosecurity screening tool. Your PRIMARY goal is to NEVER miss a real Asian hornet.
- FALSE POSITIVES are acceptable and expected (we want people to report suspicious insects)
- FALSE NEGATIVES are DANGEROUS and unacceptable (a missed hornet could establish a colony)

When analyzing images:
1. Look for the key features: yellow leg tips, dark velvety thorax, orange band on abdomen
2. If ANY key features are present, lean toward ALERT
3. Only mark UNLIKELY if you can clearly identify features that EXCLUDE Asian hornet (e.g., clear yellow stripes on thorax = German wasp)
4. Poor image quality or partial views should bias toward ALERT, not UNLIKELY
5. When genuinely uncertain, always choose ALERT`;

      const responseSchema = analysisMode === "entomology" ? ENTOMOLOGY_SCHEMA : BIOSECURITY_SCHEMA;

      // Optimized for speed:
      // - Structured output (responseMimeType + responseSchema) for instant JSON parsing
      // - No thinking config (pattern matching doesn't need deep reasoning)
      // - Gemini 2.5 Flash for low latency
      // - Timeout to prevent hanging
      const GEMINI_TIMEOUT_MS = 30000; // 30 second timeout
      
      const geminiPromise = genAI.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: selectedPrompt,
            },
          ],
        },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema,
        }
      });

      // Race between Gemini response and timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Analysis timed out. Please try again.")), GEMINI_TIMEOUT_MS);
      });

      const result = await Promise.race([geminiPromise, timeoutPromise]);

      if (!result) {
        throw new Error("No response object from Gemini");
      }

      // Get response text
      const responseText = result.text;
      console.log("Gemini response received, length:", responseText?.length);
      
      if (!responseText) {
        console.error("Empty response from Gemini");
        throw new Error("Empty response from Gemini - please try again");
      }

      // Extract JSON from response - handles both pure JSON and markdown-wrapped JSON
      let jsonString = responseText.trim();
      
      // Check if response contains markdown code block
      const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonString = jsonMatch[1].trim();
        console.log("Extracted JSON from markdown code block");
      } else if (!jsonString.startsWith('{')) {
        // Try to find JSON object in the response
        const jsonStart = jsonString.indexOf('{');
        const jsonEnd = jsonString.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
          console.log("Extracted JSON object from response text");
        }
      }

      // Parse JSON
      let analysisResult: AnalysisResult;
      try {
        analysisResult = JSON.parse(jsonString) as AnalysisResult;
        console.log("Parsed result - species:", analysisResult.species, "likelihood:", analysisResult.asianHornetLikelihood);
      } catch (parseError) {
        console.error("Failed to parse response. Raw:", responseText.substring(0, 300));
        console.error("Attempted to parse:", jsonString.substring(0, 300));
        throw new Error("Failed to parse AI response - please try again");
      }

      // Determine threat level from Asian hornet likelihood
      const likelihood = analysisResult.asianHornetLikelihood || "UNCERTAIN";
      let derivedThreatLevel: "safe" | "low" | "medium" | "high" = "safe";
      let derivedIsThreat = false;

      if (likelihood === "ALERT") {
        derivedThreatLevel = "high";
        derivedIsThreat = true;
      } else if (likelihood === "UNCERTAIN") {
        derivedThreatLevel = "medium";
        derivedIsThreat = true; // Err on side of caution
      } else {
        derivedThreatLevel = analysisResult.threatLevel || "safe";
        derivedIsThreat = Boolean(analysisResult.isThreat);
      }

      // Validate and sanitize the analysis result
      const sanitizedResult = {
        species: analysisResult.species || "Unknown",
        confidence: Math.min(Math.max(analysisResult.confidence || 0, 0), 1),
        isThreat: derivedIsThreat,
        threatLevel: derivedThreatLevel,
        reasoning: analysisResult.reasoning || "No reasoning provided",
        anatomicalFeatures: Array.isArray(analysisResult.anatomicalFeatures)
          ? analysisResult.anatomicalFeatures.slice(0, 10)
          : [],
        // Asian hornet specific fields
        asianHornetLikelihood: likelihood,
        matchingFeatures: Array.isArray(analysisResult.matchingFeatures)
          ? analysisResult.matchingFeatures
          : [],
        excludingFeatures: Array.isArray(analysisResult.excludingFeatures)
          ? analysisResult.excludingFeatures
          : [],
        // Enhanced information fields
        commonName: analysisResult.commonName || analysisResult.species || "Unknown",
        scientificName: analysisResult.scientificName || "",
        family: analysisResult.family || "",
        order: analysisResult.order || "",
        habitat: analysisResult.habitat || "",
        behavior: analysisResult.behavior || "",
        ecologicalRole: analysisResult.ecologicalRole || "",
        distribution: analysisResult.distribution || "",
        // New detailed fields
        size: analysisResult.size || "",
        diet: analysisResult.diet || "",
        lifecycle: analysisResult.lifecycle || "",
        similarSpecies: Array.isArray(analysisResult.similarSpecies)
          ? analysisResult.similarSpecies.slice(0, 5)
          : [],
        interestingFacts: Array.isArray(analysisResult.interestingFacts)
          ? analysisResult.interestingFacts.slice(0, 5)
          : [],
        safetyInfo: analysisResult.safetyInfo || "",
        // NZ biosecurity fields
        isNativeToNZ: analysisResult.isNativeToNZ ?? true, // Default to native if not specified
        invasiveRisk: ['none', 'low', 'moderate', 'high', 'critical'].includes(analysisResult.invasiveRisk || '')
          ? analysisResult.invasiveRisk as "none" | "low" | "moderate" | "high" | "critical"
          : "none",
        nzStatus: analysisResult.nzStatus || "",
        reportingAdvice: analysisResult.reportingAdvice || ""
      };

      // Store result immediately so user sees it fast
      const detectionId = await ctx.runMutation(internal.detections.storeDetectionInternal, {
        storageId: args.storageId,
        species: sanitizedResult.species,
        confidence: sanitizedResult.confidence,
        isThreat: sanitizedResult.isThreat,
        threatLevel: sanitizedResult.threatLevel,
        latitude: args.latitude,
        longitude: args.longitude,
        aiResponse: JSON.stringify(sanitizedResult),
        analysisFeatures: sanitizedResult.anatomicalFeatures,
        referenceImages: [], // Empty initially, updated async
        userAgent: args.userAgent,
        sessionId: args.sessionId,
        privacyConsentGiven: args.privacyConsentGiven,
        locationSharingConsent: args.locationSharingConsent,
      });

      // FIRE-AND-FORGET: Fetch reference images in background
      // Don't await - return immediately so user sees result
      // Use a timeout to prevent hanging background tasks
      const REFERENCE_IMAGE_TIMEOUT_MS = 10000; // 10 second timeout for reference images
      
      (async () => {
        try {
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("Reference image fetch timed out")), REFERENCE_IMAGE_TIMEOUT_MS);
          });
          
          const fetchPromise = getSpeciesReferenceImages({
            species: sanitizedResult.species,
            scientificName: sanitizedResult.scientificName,
            commonName: sanitizedResult.commonName,
          });
          
          const referenceImages = await Promise.race([fetchPromise, timeoutPromise]);
          
          if (referenceImages.length > 0) {
            await ctx.runMutation(internal.detections.updateReferenceImages, {
              detectionId,
              referenceImages,
            });
            console.log(`✅ Updated ${referenceImages.length} reference images for detection ${detectionId}`);
          }
        } catch (imgError) {
          console.error("Failed to fetch reference images:", imgError);
          // Don't fail - this is background task
        }
      })();

      // Return immediately - don't wait for reference images
      return detectionId;

    } catch (error) {
      console.error("Image analysis error:", error);

      // Store error result in database
      const errorId = await ctx.runMutation(internal.detections.storeDetectionInternal, {
        storageId: args.storageId,
        species: "Analysis Failed",
        confidence: 0.0,
        isThreat: false,
        threatLevel: "safe",
        latitude: args.latitude,
        longitude: args.longitude,
        aiResponse: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        analysisFeatures: [],
        referenceImages: [],
        userAgent: args.userAgent,
        sessionId: args.sessionId,
        privacyConsentGiven: args.privacyConsentGiven,
        locationSharingConsent: args.locationSharingConsent,
      });

      return errorId;
    }
  },
});

// Helper action to upload image to storage (called from frontend)
export const uploadImage = action({
  args: {},
  handler: async (ctx): Promise<string> => {
    // This returns the upload URL for the frontend to use
    return await ctx.storage.generateUploadUrl();
  },
});
