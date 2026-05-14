const Groq = require("groq-sdk");

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

module.exports = { getGroqClient };