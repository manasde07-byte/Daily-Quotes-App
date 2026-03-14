import { GoogleGenAI, Type } from "@google/genai";
import { Category, Quote } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateQuotes(category: Category): Promise<Quote[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 10 unique and meaningful Bengali quotes/status for the category: ${category}. 
      The quotes should be in Bengali language. 
      Return them as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    const quotesText = JSON.parse(response.text || "[]") as string[];
    return quotesText.map((text, index) => ({
      id: `${category}-${Date.now()}-${index}`,
      text,
      category,
    }));
  } catch (error) {
    console.error("Error generating quotes:", error);
    return [];
  }
}
