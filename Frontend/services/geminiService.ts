
import { GoogleGenAI } from "@google/genai";
import { SurveyData } from "../types";

export async function generatePersonalizedMessage(data: SurveyData): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    A student named ${data.name} (Branch: ${data.branch}) just filled out a survey for "Khaoo Gully" delivery.
    They order food ${data.orderFrequency} and currently use ${data.currentApps.join(', ')}.
    They'd switch for ${data.convincingFactors.join(' and ')}.
    Their pickup spot is ${data.pickupSpot} at ${data.hostel}, ${data.campus}.
    Favorite spot: ${data.restaurant1}.
    
    Task: Write a highly energetic, witty, and short "Foodie Persona" thank you message (max 20 words). 
    Tone: Street-smart, campus legend, slightly sarcastic. 
    Format: A catchy title like "THE GULLY GLUTTON" followed by a one-sentence vibe check mentioning their habits or location.
    Include 2 relevant emojis. Use campus slang.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || "CAMPUS LEGEND: Your taste buds are elite. Khaoo Gully is coming to serve the crown! 🍔👑";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "STREET FOOD SQUAD: You've got the vision. Let's get these deliveries sorted! 🍕🚀";
  }
}
