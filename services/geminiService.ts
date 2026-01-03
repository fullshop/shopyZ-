import { GoogleGenAI } from "@google/genai";
import { Message, Product, Language } from "../types";

export class GeminiService {
  private getClient(): GoogleGenAI {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getChatResponse(messages: Message[], contextProducts: Product[], lang: Language = 'EN'): Promise<string> {
    const ai = this.getClient();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are a professional shopping assistant for "shopyZ Algeria". 
        Language to use: ${lang}. 
        Respond exclusively in ${lang === 'AR' ? 'Arabic' : lang === 'FR' ? 'French' : 'English'}.
        
        Available Products: ${JSON.stringify(contextProducts)}
        
        Rules:
        1. Be polite and sophisticated.
        2. Recommend specific products from the list above.
        3. Prices are in Algerian Dinars (DZD).
        4. Keep responses concise and formatted with markdown.`,
      },
    });

    const lastUserMessage = messages[messages.length - 1].text;
    const response = await chat.sendMessage({ message: lastUserMessage });
    return response.text || "I'm sorry, I couldn't process that request.";
  }

  async generateProductPitch(product: Product, lang: Language = 'EN'): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a 2-sentence persuasive sales pitch for this product in ${lang === 'AR' ? 'Arabic' : lang === 'FR' ? 'French' : 'English'}:
      Product: ${product.name}
      Description: ${product.description}
      Category: ${product.category}.
      Note: Price is in DZD.`,
    });
    return response.text || product.description;
  }

  async generateAIDescription(name: string, category: string, lang: Language = 'EN'): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional, engaging, and high-end boutique product description for:
      Name: ${name}
      Category: ${category}
      Language: ${lang === 'AR' ? 'Arabic' : lang === 'FR' ? 'French' : 'English'}.
      Style: Minimalist but luxurious.
      Length: 2-3 compelling sentences. Do not use generic filler. Focus on quality and lifestyle.`,
    });
    return response.text || "";
  }
}

export const geminiService = new GeminiService();