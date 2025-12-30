
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY || '';

export const transformImageToHajj = async (
  base64Image: string,
  customPrompt?: string
): Promise<string> => {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is set.");
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Refined prompt to ensure face consistency while changing clothes and background
  const prompt = customPrompt || "Maintain the exact face, facial structure, and identity of the person in the image. Change their clothing to white Ihram garments as worn by pilgrims in Mecca performing Hajj. The background MUST be the Grand Mosque (Masjid al-Haram) specifically showing the Kaaba area in Mecca. Ensure the lighting is natural, the perspective is realistic, and the overall image looks respectful and high-quality.";

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1] || base64Image,
    },
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          imagePart,
          { text: prompt }
        ]
      },
    });

    let generatedImageUrl = '';
    
    // Iterate through parts to find the image
    const candidates = response.candidates;
    if (candidates && candidates.length > 0 && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error("The AI did not return an edited image. Please try again.");
    }

    return generatedImageUrl;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to transform image.");
  }
};
