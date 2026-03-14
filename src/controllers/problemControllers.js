const Problem = require("../models/problem");
const { successResponse, errorResponse } = require("../utils/apiResponse.utils");

const getPagination = (req) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  return { page, limit, skip: (page - 1) * limit };
};

const getProblems = async (req, res) => {
  try {
    const { topic, difficulty, company, platform, q } = req.query;
    const { page, limit, skip } = getPagination(req);

    const filter = {};
    if (topic) filter.topic = { $in: [new RegExp(topic, "i")] };
    if (difficulty) filter.difficulty = difficulty;
    if (platform) filter.platform = platform;
    if (company) filter.companies = { $in: [new RegExp(company, "i")] };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { companies: { $in: [new RegExp(q, "i")] } },
      ];
    }

    const [problems, total] = await Promise.all([
      Problem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Problem.countDocuments(filter),
    ]);

    return successResponse(res, "Problems fetched successfully", {
      items: problems,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch problems", 500, error.message);
  }
};

const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return errorResponse(res, "Problem not found", 404);
    return successResponse(res, "Problem fetched successfully", problem);
  } catch (error) {
    return errorResponse(res, "Failed to fetch problem", 500, error.message);
  }
};

const getProblemsByTopic = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { topic } = req.params;

    const filter = { topic: { $in: [new RegExp(topic, "i")] } };

    const [problems, total] = await Promise.all([
      Problem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Problem.countDocuments(filter),
    ]);

    return successResponse(res, "Topic-wise problems fetched successfully", {
      topic,
      items: problems,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch problems by topic", 500, error.message);
  }
};

const searchProblems = async (req, res) => {
  try {
    const { q } = req.query;
    const { page, limit, skip } = getPagination(req);

    if (!q) return errorResponse(res, "Search query 'q' is required", 400);

    const filter = {
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { topic: { $in: [new RegExp(q, "i")] } },
        { companies: { $in: [new RegExp(q, "i")] } },
      ],
    };

    const [problems, total] = await Promise.all([
      Problem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Problem.countDocuments(filter),
    ]);

    return successResponse(res, "Problem search completed", {
      query: q,
      items: problems,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return errorResponse(res, "Problem search failed", 500, error.message);
  }
};

const getCompanyWiseProblems = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const { companyName } = req.params;

    const filter = { companies: { $in: [new RegExp(companyName, "i")] } };
    const [problems, total] = await Promise.all([
      Problem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Problem.countDocuments(filter),
    ]);

    return successResponse(res, "Company-wise problems fetched", {
      company: companyName,
      items: problems,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch company-wise problems", 500, error.message);
  }
};

module.exports = {
  getProblems,
  getProblemById,
  getProblemsByTopic,
  searchProblems,
  getCompanyWiseProblems,
};
