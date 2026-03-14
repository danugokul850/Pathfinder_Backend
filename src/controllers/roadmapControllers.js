const Roadmap = require("../models/roadmap");
const Topic = require("../models/topic");
const { successResponse, errorResponse } = require("../utils/apiResponse.utils");

const getPagination = (req) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  return { page, limit, skip: (page - 1) * limit };
};

const getRoadmaps = async (req, res) => {
  try {
    const { domain } = req.query;
    const { page, limit, skip } = getPagination(req);

    const filter = {};
    if (domain) filter.domain = domain;

    const [roadmaps, total] = await Promise.all([
      Roadmap.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Roadmap.countDocuments(filter),
    ]);

    return successResponse(res, "Roadmaps fetched successfully", {
      items: roadmaps,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch roadmaps", 500, error.message);
  }
};

const getRoadmapByPath = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ path: req.params.path }).populate("topics.topicId");
    if (!roadmap) return errorResponse(res, "Roadmap not found", 404);

    return successResponse(res, "Roadmap fetched successfully", roadmap);
  } catch (error) {
    return errorResponse(res, "Failed to fetch roadmap", 500, error.message);
  }
};

const getTopicsForWeek = async (req, res) => {
  try {
    const { path, week } = req.params;
    const weekNumber = Number(week);

    const roadmap = await Roadmap.findOne({ path }).populate("topics.topicId");
    if (!roadmap) return errorResponse(res, "Roadmap not found", 404);

    const topicsForWeek = roadmap.topics
      .filter((entry) => entry.week === weekNumber)
      .sort((a, b) => a.order - b.order);

    return successResponse(res, "Weekly topics fetched successfully", {
      path,
      week: weekNumber,
      topics: topicsForWeek,
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch weekly topics", 500, error.message);
  }
};

const getTopicDetails = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    if (!topic) return errorResponse(res, "Topic not found", 404);

    return successResponse(res, "Topic details fetched successfully", topic);
  } catch (error) {
    return errorResponse(res, "Failed to fetch topic details", 500, error.message);
  }
};

module.exports = {
  getRoadmaps,
  getRoadmapByPath,
  getTopicsForWeek,
  getTopicDetails,
};
