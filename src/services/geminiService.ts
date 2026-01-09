import { GoogleGenAI, Type } from "@google/genai"

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set")
}

const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

export interface AnalysisResult {
  species: string
  confidence: number
  qflyLikelihood: 'ALERT' | 'UNLIKELY' | 'UNCERTAIN'
  matchingFeatures: string[]
  excludingFeatures: string[]
  reasoning: string
  commonName?: string
  scientificName?: string
  reportingAdvice?: string
}

const BIOSECURITY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    qflyLikelihood: {
      type: Type.STRING,
      enum: ["ALERT", "UNLIKELY", "UNCERTAIN"],
      description: "ALERT if features match any target species. UNLIKELY if clear exclusion. UNCERTAIN if poor image."
    },
    confidence: { type: Type.NUMBER, description: "Confidence 0.0-1.0" },
    matchingFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Features matching biosecurity threat species"
    },
    excludingFeatures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Features ruling out threat species"
    },
    species: { type: Type.STRING, description: "Identified species" },
    commonName: { type: Type.STRING, description: "Common name" },
    scientificName: { type: Type.STRING, description: "Scientific name" },
    reasoning: { type: Type.STRING, description: "Brief explanation" },
    reportingAdvice: { type: Type.STRING, description: "Reporting instructions if ALERT" }
  },
  required: ["qflyLikelihood", "confidence", "species", "reasoning"]
}

const BIOSECURITY_PROMPT = `Detect BIOSECURITY THREAT FRUIT FLIES in this image. New Zealand MPI requires reporting of THREE species. Err on the side of caution.

=== SPECIES 1: QUEENSLAND FRUIT FLY (Bactrocera tryoni) ===
KEY FEATURES (any 2+ = ALERT):
- Body size ~7mm (smaller than housefly)
- Reddish-brown coloring with distinctive yellow markings
- Clear wings with dark brown costal band
- Yellow scutellum (shield on rear thorax) - KEY FEATURE
- Wasp-like narrow waist
- Abdomen with yellow and brown banding
RECENT DETECTION: Mt Roskill, Auckland

=== SPECIES 2: ORIENTAL FRUIT FLY (Bactrocera dorsalis) ===
KEY FEATURES (any 2+ = ALERT):
- Body size ~8mm (slightly larger than Q-fly)
- Mostly dark/black thorax with yellow markings
- Clear wings with dark costal band
- Distinct dark "T" shaped marking on abdomen
- Yellow scutellum
- Yellow lateral stripes on thorax

=== SPECIES 3: SPOTTED-WING DROSOPHILA (Drosophila suzukii / SWD) ===
KEY FEATURES (any 2+ = ALERT):
- Small body ~2-3mm (vinegar fly size)
- Males: distinctive dark spot on each wing - KEY FEATURE
- Light brown/tan body with red eyes
- Attacks FRESH soft fruit (unlike other vinegar flies)
- Females: large serrated ovipositor
- Found on berries, cherries, grapes, stone fruit

=== FRUIT DAMAGE INDICATORS (any = ALERT) ===
- Small puncture marks on fruit skin
- Soft spots around puncture points
- Larvae (maggots) in fruit
- Premature fruit drop

=== COMMON LOOKALIKES (NOT threats) ===
- House fly: Much larger (8-12mm), grey, no wing markings
- Blow fly: Metallic blue/green coloring
- Common vinegar fly: No wing spots, attacks ROTTING fruit only
- Native NZ flies: Different patterns

=== CRITICAL RULES ===
1. If features match ANY of the three target species = ALERT
2. Specify WHICH species if identifiable
3. Fruit damage consistent with fruit fly = ALERT
4. Poor image quality but COULD be threat species = ALERT
5. When in doubt = ALERT (false positives acceptable, false negatives are NOT)
6. Only mark UNLIKELY if clear exclusion features`

const SYSTEM_INSTRUCTION = `You are a fruit fly biosecurity specialist for New Zealand MPI. Your job is to detect THREE target pest species that threaten NZ's $6 billion horticulture industry.

TARGET SPECIES (all must be reported to MPI):
1. Queensland Fruit Fly (Bactrocera tryoni) - RECENT DETECTION in Mt Roskill, Auckland
2. Oriental Fruit Fly (Bactrocera dorsalis) - Major global pest
3. Spotted-wing Drosophila (Drosophila suzukii) - Attacks fresh soft berries

CRITICAL: This is a biosecurity screening tool. Your PRIMARY goal is to NEVER miss any of these three species.
- FALSE POSITIVES are acceptable and expected
- FALSE NEGATIVES are DANGEROUS and unacceptable

When analyzing images:
1. Check against ALL THREE target species
2. If features match ANY target species, set qflyLikelihood to ALERT
3. In the species field, specify which target species (if identifiable)
4. Only mark UNLIKELY if clear exclusion features present
5. When genuinely uncertain, always choose ALERT

REPORTING ADVICE: If ALERT, advise user to call MPI hotline 0800 80 99 66 immediately.`

export async function analyzeImage(base64Image: string, mimeType: string): Promise<AnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured")
  }

  const result = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
        {
          text: BIOSECURITY_PROMPT,
        },
      ],
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: BIOSECURITY_SCHEMA,
    }
  })

  const responseText = result.text
  if (!responseText) {
    throw new Error("Empty response from AI")
  }

  // Extract JSON from response
  let jsonString = responseText.trim()
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonString = jsonMatch[1].trim()
  } else if (!jsonString.startsWith('{')) {
    const jsonStart = jsonString.indexOf('{')
    const jsonEnd = jsonString.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      jsonString = jsonString.substring(jsonStart, jsonEnd + 1)
    }
  }

  const parsed = JSON.parse(jsonString) as AnalysisResult

  return {
    species: parsed.species || 'Unknown',
    confidence: Math.min(Math.max(parsed.confidence || 0, 0), 1),
    qflyLikelihood: parsed.qflyLikelihood || 'UNCERTAIN',
    matchingFeatures: parsed.matchingFeatures || [],
    excludingFeatures: parsed.excludingFeatures || [],
    reasoning: parsed.reasoning || '',
    commonName: parsed.commonName,
    scientificName: parsed.scientificName,
    reportingAdvice: parsed.reportingAdvice,
  }
}
