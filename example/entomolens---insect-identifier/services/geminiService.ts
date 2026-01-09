import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InsectData, DangerLevel } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = "gemini-2.5-flash";

const insectSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    commonName: { type: Type.STRING, description: "The common name of the insect." },
    scientificName: { type: Type.STRING, description: "The scientific classification name." },
    description: { type: Type.STRING, description: "A concise physical and behavioral description." },
    habitat: { type: Type.STRING, description: "Typical environment where this insect is found." },
    dangerLevel: { 
      type: Type.STRING, 
      enum: [DangerLevel.SAFE, DangerLevel.CAUTION, DangerLevel.DANGEROUS, DangerLevel.VENOMOUS],
      description: "Assessment of danger to humans." 
    },
    funFacts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Three interesting or unique facts about this insect."
    }
  },
  required: ["commonName", "scientificName", "description", "habitat", "dangerLevel", "funFacts"],
};

export const identifyInsect = async (base64Image: string): Promise<InsectData> => {
  try {
    // Remove the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG for simplicity, API handles others well usually
              data: base64Data,
            },
          },
          {
            text: "Identify this insect. If it is not an insect or bug, please return data indicating it is unknown or not an insect in the description, but still adhere to the schema format as best as possible (e.g., name: 'Not an insect').",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: insectSchema,
        systemInstruction: "You are an expert entomologist. Provide accurate, educational, and safety-conscious information about insects.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    const data = JSON.parse(text) as InsectData;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to identify the insect. Please try again with a clearer photo.");
  }
};