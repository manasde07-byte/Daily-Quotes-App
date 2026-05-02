import { GoogleGenAI, Type } from "@google/genai";
import { Category, Quote } from "../types";

const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateQuotes(category: Category): Promise<Quote[]> {
  if (!API_KEY) {
    console.error("GEMINI_API_KEY is missing in this build!");
    throw new Error("এপিআই কি (API Key) পাওয়া যাচ্ছে না। অনুগ্রহ করে .env ফাইল চেক করুন।");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a poetic Bengali writer. Generate 10 unique, high-quality, and deeply meaningful Bengali quotes or status messages for the category: "${category}". 
      Add suitable and decorative emojis to each quote to make them visually appealing.
      The quotes should be emotionally resonant, grammatically correct, and suitable for sharing on social media like WhatsApp or Facebook.
      Do not include any English words unless absolutely necessary.
      Return the result strictly as a JSON array of strings.
      Ensure these quotes are different from common ones. 
      Unique Seed: ${Date.now()}-${Math.random().toString(36).substring(7)}`,
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

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    // Clean the response text in case it contains markdown code blocks
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let quotesText: string[];
    try {
      quotesText = JSON.parse(cleanedText) as string[];
    } catch (e) {
      console.error("JSON Parse Error. Raw text:", text);
      // Fallback: try to extract anything that looks like an array
      const match = cleanedText.match(/\[.*\]/s);
      if (match) {
        try {
          quotesText = JSON.parse(match[0]) as string[];
        } catch (innerError) {
          throw new Error("Could not parse quotes from AI response");
        }
      } else {
        throw new Error("Could not parse quotes from AI response");
      }
    }

    return quotesText.map((text, index) => ({
      id: `${category}-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      text: text.trim(),
      category,
    }));
  } catch (error: any) {
    console.error("Error generating quotes:", error);
    // Throw the actual error message to be caught by the UI
    throw new Error(error?.message || "Unknown API error");
  }
}
