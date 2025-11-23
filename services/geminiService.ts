import { GoogleGenAI, Type, SchemaType } from "@google/genai";

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDashboardInsight = async (dataContext: string) => {
  try {
    const model = "gemini-2.5-flash";
    
    const response = await ai.models.generateContent({
      model,
      contents: `Analyze this municipal dashboard data and provide a concise executive summary and 3 actionable recommendations for city officials. 
      
      Data Context:
      ${dataContext}
      
      Format the response as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A brief 2-sentence executive summary of the city's current status." },
            recommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of 3 specific actionable recommendations."
            }
          }
        }
      }
    });

    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Error generating insights:", error);
    return null;
  }
};