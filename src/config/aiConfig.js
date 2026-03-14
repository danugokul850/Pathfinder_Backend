const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_MODEL = "gemini-1.5-flash";

let modelInstance = null;

const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables");
  }

  if (!modelInstance) {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    modelInstance = client.getGenerativeModel({ model: GEMINI_MODEL });
  }

  return modelInstance;
};

module.exports = { getGeminiModel, GEMINI_MODEL };
