const { getGeminiModel } = require("../config/aiConfig");
const {
  PROBLEM_EXPLANATION_PROMPT,
  INTERVIEW_QUESTION_GENERATOR,
  CAREER_ADVICE_PROMPT,
  CODE_HELPER_PROMPT,
} = require("../constants/aiPrompts");

const askGemini = async (prompt) => {
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  return result.response.text();
};

const generateResponse = async (userMessage, context = {}, history = []) => {
  const recentHistory = history.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n");

  const prompt = `${CODE_HELPER_PROMPT}

Context:
- Domain: ${context.domain || "Not provided"}
- Topic: ${context.topic || "Not provided"}

Recent chat history:
${recentHistory || "No previous conversation"}

User question:
${userMessage}`;

  return askGemini(prompt);
};

const explainProblem = async (problemLink) => {
  const prompt = `${PROBLEM_EXPLANATION_PROMPT}

Problem Link: ${problemLink}

If the exact problem content is not accessible from the link alone, give a general interview-ready framework to approach such problems.`;

  return askGemini(prompt);
};

const generateQuestions = async (topic, difficulty = "Medium", count = 5) => {
  const prompt = `${INTERVIEW_QUESTION_GENERATOR}

Generate ${count} ${difficulty} interview questions for topic: ${topic}.
Return strict JSON array with this shape only:
[
  {
    "question": "...",
    "expectedAnswer": "...",
    "tips": "..."
  }
]`;

  const raw = await askGemini(prompt);
  try {
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (_error) {
    return [{ question: raw, expectedAnswer: "", tips: "" }];
  }
};

const getCareerAdvice = async (userProfile) => {
  const prompt = `${CAREER_ADVICE_PROMPT}

Student profile:
${JSON.stringify(userProfile, null, 2)}

Give:
1) 4-week plan
2) Priority topics
3) Interview prep checklist
4) Resume + project suggestions
5) Common mistakes to avoid`;

  return askGemini(prompt);
};

const summarizeContent = async (content) => {
  const prompt = `Summarize this content for a college student in bullet points with action items:\n\n${content}`;
  return askGemini(prompt);
};

module.exports = {
  generateResponse,
  explainProblem,
  generateQuestions,
  getCareerAdvice,
  summarizeContent,
};
