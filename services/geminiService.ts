
import { GoogleGenAI, Type } from "@google/genai";
import { DEFAULT_AI_PROMPT } from "../constants";

export const generateSubSteps = async (taskTitle: string): Promise<string[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: DEFAULT_AI_PROMPT(taskTitle),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return [];
  } catch (error) {
    console.error("AI Generation Error:", error);
    return ["데이터 로드 실패. 수동으로 단계를 추가해보세요."];
  }
};
