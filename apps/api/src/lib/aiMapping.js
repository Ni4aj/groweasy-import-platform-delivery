import { GoogleGenAI } from "@google/genai";
import { buildMappingPrompt } from "./prompts.js";

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey,
});

export async function getAIHeaderMapping(headers) {

  // Nothing to map
  if (!headers || headers.length === 0) {
    return {};
  }

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  const prompt = buildMappingPrompt(headers);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  let text = response.text.trim();

  // Remove markdown if Gemini wraps JSON
  text = text
    .replace(/^```json/i, "")
    .replace(/^```/i, "")
    .replace(/```$/i, "")
    .trim();

  try {

    const mapping = JSON.parse(text);

    return mapping;

  } catch (error) {

    console.log("Gemini Response:");
    console.log(text);

    throw new Error("Gemini returned invalid JSON.");

  }

}