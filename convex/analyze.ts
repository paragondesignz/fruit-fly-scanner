"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { buildBiosecurityPrompt, buildSystemInstruction } from "./lib/promptBuilder";

const BIOSECURITY_SCHEMA = {
  type: "object",
  properties: {
    qflyLikelihood: {
      type: "string",
      enum: ["ALERT", "UNLIKELY", "UNCERTAIN"],
      description:
        "ALERT if features match any target species. UNLIKELY if clear exclusion. UNCERTAIN if poor image.",
    },
    confidence: { type: "number", description: "Confidence 0.0-1.0" },
    matchingFeatures: {
      type: "array",
      items: { type: "string" },
      description: "Features matching biosecurity threat species",
    },
    excludingFeatures: {
      type: "array",
      items: { type: "string" },
      description: "Features ruling out threat species",
    },
    species: { type: "string", description: "Identified species" },
    commonName: { type: "string", description: "Common name" },
    scientificName: { type: "string", description: "Scientific name" },
    reasoning: { type: "string", description: "Brief explanation" },
    reportingAdvice: {
      type: "string",
      description: "Reporting instructions if ALERT",
    },
  },
  required: ["qflyLikelihood", "confidence", "species", "reasoning"],
};

export const analyzeImage = action({
  args: {
    image: v.string(), // base64 encoded image
    mimeType: v.string(),
  },
  handler: async (ctx, args): Promise<{
    species: string;
    confidence: number;
    qflyLikelihood: "ALERT" | "UNLIKELY" | "UNCERTAIN";
    matchingFeatures: string[];
    excludingFeatures: string[];
    reasoning: string;
    commonName?: string;
    scientificName?: string;
    reportingAdvice?: string;
  }> => {
    // Get API key from environment
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    // Fetch species from database
    const speciesList = await ctx.runQuery(api.species.list);

    if (speciesList.length === 0) {
      throw new Error("No species configured. Please seed the database first.");
    }

    // Build dynamic prompt from species data
    const biosecurityPrompt = buildBiosecurityPrompt(speciesList);
    const systemInstruction = buildSystemInstruction(speciesList);

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(args.mimeType)) {
      throw new Error("Invalid image type. Use JPEG, PNG, or WebP.");
    }

    // Call Gemini API using fetch (more reliable in Convex actions)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: args.mimeType,
                    data: args.image,
                  },
                },
                {
                  text: biosecurityPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: BIOSECURITY_SCHEMA,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    // Extract text from response
    const responseText =
      result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    // Parse JSON response
    let jsonString = responseText.trim();
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    } else if (!jsonString.startsWith("{")) {
      const jsonStart = jsonString.indexOf("{");
      const jsonEnd = jsonString.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonString = jsonString.substring(jsonStart, jsonEnd + 1);
      }
    }

    const parsed = JSON.parse(jsonString);

    return {
      species: parsed.species || "Unknown",
      confidence: Math.min(Math.max(parsed.confidence || 0, 0), 1),
      qflyLikelihood: parsed.qflyLikelihood || "UNCERTAIN",
      matchingFeatures: parsed.matchingFeatures || [],
      excludingFeatures: parsed.excludingFeatures || [],
      reasoning: parsed.reasoning || "",
      commonName: parsed.commonName,
      scientificName: parsed.scientificName,
      reportingAdvice: parsed.reportingAdvice,
    };
  },
});
