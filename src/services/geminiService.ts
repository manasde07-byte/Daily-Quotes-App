import { GoogleGenAI, Type } from "@google/genai";
import { Category, Quote } from "../types";

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const GROK_API_KEY = (import.meta as any).env?.VITE_GROK_API_KEY || process.env.GROK_API_KEY || "";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function generateWithGrok(category: Category): Promise<string[]> {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROK_API_KEY}`
    },
    body: JSON.stringify({
      model: "grok-beta",
      messages: [
        {
          role: "system",
          content: "You are a poetic Bengali writer. Return ONLY a JSON array of 10 unique, high-quality, and deeply meaningful Bengali quotes or status messages with decorative emojis for the requested category."
        },
        {
          role: "user",
          content: `Category: ${category}. Ensure no English words and use unique metaphors.`
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Grok API Error");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Grok might return an object with a field, or just the array. 
  // Let's try to find an array in it.
  const parsed = JSON.parse(content);
  if (Array.isArray(parsed)) return parsed;
  if (parsed.quotes && Array.isArray(parsed.quotes)) return parsed.quotes;
  
  // Fallback to extraction
  const match = content.match(/\[.*\]/s);
  if (match) return JSON.parse(match[0]);
  
  throw new Error("Could not parse Grok response");
}

export async function generateQuotes(category: Category): Promise<Quote[]> {
  // Use Grok if available and Gemini fails, or just prioritize one.
  // For now, let's prefer Gemini but allow Grok as a secondary option if Gemini key is missing or it fails.
  
  if (!GEMINI_API_KEY && !GROK_API_KEY) {
    throw new Error("No AI API Keys found. Please configure GEMINI_API_KEY or GROK_API_KEY.");
  }

  try {
    let quotesText: string[] = [];

    if (GEMINI_API_KEY) {
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
        if (text) {
          const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
          try {
            quotesText = JSON.parse(cleanedText) as string[];
          } catch (e) {
            const match = cleanedText.match(/\[.*\]/s);
            if (match) quotesText = JSON.parse(match[0]);
          }
        }
      } catch (geminiError) {
        console.error("Gemini failed:", geminiError);
        if (!GROK_API_KEY) throw geminiError;
        // Fall through to Grok
      }
    }

    if (quotesText.length === 0 && GROK_API_KEY) {
      quotesText = await generateWithGrok(category);
    }

    if (quotesText.length === 0) {
      throw new Error("Failed to generate quotes from any provider.");
    }

    return quotesText.map((text, index) => ({
      id: `${category}-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
      text: text.trim(),
      category,
    }));
  } catch (error: any) {
    console.error("Error generating quotes:", error);
    throw new Error(error?.message || "Unknown API error");
  }
}
