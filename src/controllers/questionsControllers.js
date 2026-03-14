const Question = require("../models/question");
const { successResponse, errorResponse } = require("../utils/apiResponse.utils");

const getPagination = (req) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  return { page, limit, skip: (page - 1) * limit };
};

const getQuestions = async (req, res) => {
  try {
    const { category, domain, difficulty } = req.query;
    const { page, limit, skip } = getPagination(req);

    const filter = {};
    if (category) filter.category = category;
    if (domain) filter.domain = domain;
    if (difficulty) filter.difficulty = difficulty;

    const [questions, total] = await Promise.all([
      Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Question.countDocuments(filter),
    ]);

    return successResponse(res, "Questions fetched successfully", {
      items: questions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch questions", 500, error.message);
  }
};

const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return errorResponse(res, "Question not found", 404);

    return successResponse(res, "Question fetched successfully", question);
  } catch (error) {
    return errorResponse(res, "Failed to fetch question", 500, error.message);
  }
};

const getQuestionsByCompany = async (req, res) => {
  try {
    const { companyName } = req.params;
    const { page, limit, skip } = getPagination(req);

    const filter = { companies: { $in: [new RegExp(companyName, "i")] } };

    const [questions, total] = await Promise.all([
      Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Question.countDocuments(filter),
    ]);

    return successResponse(res, "Company-wise questions fetched", {
      company: companyName,
      items: questions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch company-wise questions", 500, error.message);
  }
};

const getQuestionsByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    const { page, limit, skip } = getPagination(req);

    const filter = { topic: { $in: [new RegExp(topic, "i")] } };

    const [questions, total] = await Promise.all([
      Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Question.countDocuments(filter),
    ]);

    return successResponse(res, "Topic-wise questions fetched", {
      topic,
      items: questions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch topic-wise questions", 500, error.message);
  }
};

module.exports = {
  getQuestions,
  getQuestionById,
  getQuestionsByCompany,
  getQuestionsByTopic,
};
