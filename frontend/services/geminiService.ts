import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types";

const getGeminiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeReceiptImage = async (base64Image: string): Promise<ReceiptData> => {
  try {
    const ai = getGeminiClient();
    
    // We strip the data URL prefix if present to get just the base64 string
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const prompt = `
      Analyze this receipt image. 
      Extract the following information:
      1. A list of items purchased. For each item, provide the full name, price, and a suggested category (e.g., Groceries, Dining, Tools, etc.).
      2. The total amount paid.
      3. The date of the transaction (in YYYY-MM-DD format if possible).
      
      Return the data in a structured JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg", // Assuming JPEG for simplicity, can detect from header
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                },
              },
            },
            total: { type: Type.NUMBER },
            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as ReceiptData;

  } catch (error) {
    console.error("Error analyzing receipt:", error);
    throw error;
  }
};

