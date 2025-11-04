import {Request,Response} from 'express'
import { Type, GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
});

const analyzeIncident= async (req: Request, res: Response) => {
  const { incident } = req.body;

  const prompt = `
    You are an incident analysis AI.
    Analyze the following incident and provide:
      1. A short summary (2 sentences)
      2. A possible cause
      3. Suggested resolution steps
    ${JSON.stringify(incident, null, 2)}
  `;

  try {
   const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
            },
            cause: {    
                type: Type.STRING,
            },
            resolution: {
                type: Type.STRING,
            }
          },
          propertyOrdering: ["summary", "cause", "resolution"],
        },
      },
    },
  });

  console.log(response.text);
    res.json({ result: response.text });
  } catch (error: any) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: "AI analysis failed" });
  }
};

export { analyzeIncident };