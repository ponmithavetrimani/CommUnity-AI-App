import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || ""
);

export const geminiModel =
  genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

export const analyzeRiskWithGemini =
  async (travelData: any) => {
    try {
      const prompt = `
Analyze this travel data and determine risk level.

${JSON.stringify(travelData, null, 2)}

Return:
1. Risk Level
2. Reason
3. Recommended Action
`;

      const result =
        await geminiModel.generateContent(
          prompt
        );

      return result.response.text();
    } catch (error) {
      console.error(error);
      return "Risk analysis failed";
    }
  };