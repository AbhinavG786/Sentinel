import { Request, Response } from "express";
import { Type, GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY || "",
});

const analyzeIncident = async (req: Request, res: Response) => {
  const { incident } = req.body;

  // const prompt = `
  //   You are an incident analysis AI.
  //   Analyze the following incident and provide:
  //     1. A short summary (2 sentences)
  //     2. A possible cause
  //     3. Suggested resolution steps
  //   ${JSON.stringify(incident, null, 2)}
  // `;

  const prompt = `
    You are an intelligent incident analysis AI.
    Analyze the following incident and return a JSON object with:

    - summary: short summary (max 2 sentences)
    - root_cause: the most likely cause
    - resolution: recommended resolution steps
    - confidence: a number between 0 and 1 indicating certainty

    Incident:
    ${JSON.stringify(incident, null, 2)}
  `;

  try {
    const response: any = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
            },
            root_cause: {
              type: Type.STRING,
            },
            resolution: {
              type: Type.STRING,
            },
            confidence: {
              type: Type.NUMBER,
            },
          },
          required: ["summary", "root_cause", "resolution", "confidence"],
          propertyOrdering: [
            "summary",
            "root_cause",
            "resolution",
            "confidence",
          ],
        },
      },
    });

    console.log(JSON.parse(response.text));
    res.json({ result: JSON.parse(response.text) });
  } catch (error: any) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: "AI analysis failed" });
  }
};

export { analyzeIncident };
