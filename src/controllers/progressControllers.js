const User = require("../models/users");
const Topic = require("../models/topic");
const Problem = require("../models/problem");
const Question = require("../models/question");
const Roadmap = require("../models/roadmap");
const { successResponse, errorResponse } = require("../utils/apiResponse.utils");

const updateTopicProgress = async (req, res) => {
  try {
    const { topicId, completed = true } = req.body;
    const topic = await Topic.findById(topicId);
    if (!topic) return errorResponse(res, "Topic not found", 404);

    const user = await User.findById(req.user._id);
    const index = user.topicsCompleted.findIndex((entry) => String(entry.topicId) === topicId);

    if (completed && index === -1) {
      user.topicsCompleted.push({ topicId, completedAt: new Date() });
      user.stats.totalTopics += 1;
    }

    if (!completed && index >= 0) {
      user.topicsCompleted.splice(index, 1);
      user.stats.totalTopics = Math.max(user.stats.totalTopics - 1, 0);
    }

    await user.save();
    return successResponse(res, "Topic progress updated", {
      totalTopics: user.stats.totalTopics,
      completedTopics: user.topicsCompleted.length,
    });
  } catch (error) {
    return errorResponse(res, "Failed to update topic progress", 500, error.message);
  }
};

const updateProblemProgress = async (req, res) => {
  try {
    const { problemId, solved = true } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) return errorResponse(res, "Problem not found", 404);

    const user = await User.findById(req.user._id);
    const index = user.problemsSolved.findIndex((entry) => String(entry.problemId) === problemId);

    if (solved && index === -1) {
      user.problemsSolved.push({ problemId, solvedAt: new Date() });
      user.stats.totalProblems += 1;
    }

    if (!solved && index >= 0) {
      user.problemsSolved.splice(index, 1);
      user.stats.totalProblems = Math.max(user.stats.totalProblems - 1, 0);
    }

    await user.save();
    return successResponse(res, "Problem progress updated", {
      totalProblems: user.stats.totalProblems,
      solvedProblems: user.problemsSolved.length,
    });
  } catch (error) {
    return errorResponse(res, "Failed to update problem progress", 500, error.message);
  }
};

const updateQuestionProgress = async (req, res) => {
  try {
    const { questionId, confidence = 3, practiced = true } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return errorResponse(res, "Question not found", 404);

    const user = await User.findById(req.user._id);
    const existing = user.questionsPracticed.find((entry) => String(entry.questionId) === questionId);

    if (practiced && !existing) {
      user.questionsPracticed.push({ questionId, confidence, practicedAt: new Date() });
      user.stats.totalQuestions += 1;
    }

    if (practiced && existing) {
      existing.confidence = confidence;
      existing.practicedAt = new Date();
    }

    if (!practiced && existing) {
      user.questionsPracticed = user.questionsPracticed.filter(
        (entry) => String(entry.questionId) !== questionId
      );
      user.stats.totalQuestions = Math.max(user.stats.totalQuestions - 1, 0);
    }

    await user.save();
    return successResponse(res, "Question progress updated", {
      totalQuestions: user.stats.totalQuestions,
      practicedQuestions: user.questionsPracticed.length,
    });
  } catch (error) {
    return errorResponse(res, "Failed to update question progress", 500, error.message);
  }
};

const getOverallProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const roadmap = user.career.path
      ? await Roadmap.findOne({ path: user.career.path })
      : await Roadmap.findOne({ domain: user.career.domain });

    const totalTopicCount = roadmap ? roadmap.topics.length : 0;
    const totalSolved = user.problemsSolved.length;
    const totalPracticed = user.questionsPracticed.length;
    const totalCompleted = user.topicsCompleted.length;

    const overview = {
      domain: user.career.domain,
      path: user.career.path,
      stats: user.stats,
      completion: {
        topics: {
          done: totalCompleted,
          total: totalTopicCount,
          percent: totalTopicCount ? Math.round((totalCompleted / totalTopicCount) * 100) : 0,
        },
        problemsSolved: totalSolved,
        questionsPracticed: totalPracticed,
      },
    };

    return successResponse(res, "Overall progress fetched", overview);
  } catch (error) {
    return errorResponse(res, "Failed to fetch overall progress", 500, error.message);
  }
};

const getDomainProgress = async (req, res) => {
  try {
    const { domain } = req.params;
    const user = await User.findById(req.user._id);

    const totalDomainTopics = await Topic.countDocuments({ domain, isActive: true });
    const completedTopicIds = user.topicsCompleted.map((entry) => entry.topicId);

    const completedInDomain = await Topic.countDocuments({
      _id: { $in: completedTopicIds },
      domain,
    });

    return successResponse(res, "Domain progress fetched", {
      domain,
      totalTopics: totalDomainTopics,
      completedTopics: completedInDomain,
      percent: totalDomainTopics ? Math.round((completedInDomain / totalDomainTopics) * 100) : 0,
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch domain progress", 500, error.message);
  }
};

module.exports = {
  updateTopicProgress,
  updateProblemProgress,
  updateQuestionProgress,
  getOverallProgress,
  getDomainProgress,
};
