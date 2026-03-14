const User = require("../models/users");
const Topic = require("../models/topic");
const Problem = require("../models/problem");
const Question = require("../models/question");
const Roadmap = require("../models/roadmap");
const { successResponse, errorResponse } = require("../utils/apiResponse.utils");

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

const updateStreakStats = (user) => {
  const now = new Date();
  const lastActive = user.stats.lastActive ? new Date(user.stats.lastActive) : null;

  if (!lastActive) {
    user.stats.streak = 1;
    user.stats.lastActive = now;
    return;
  }

  if (isSameDay(now, lastActive)) {
    user.stats.lastActive = now;
    return;
  }

  const dayDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24));
  user.stats.streak = dayDiff === 1 ? user.stats.streak + 1 : 1;
  user.stats.lastActive = now;
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("savedItems.problems")
      .populate("savedItems.questions")
      .populate("topicsCompleted.topicId")
      .select("-password");

    return successResponse(res, "Profile fetched successfully", user);
  } catch (error) {
    return errorResponse(res, "Failed to fetch profile", 500, error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const allowedTopLevel = ["name"];
    const update = {};

    allowedTopLevel.forEach((field) => {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    });

    if (req.body.college) {
      if (req.body.college.name !== undefined) update["college.name"] = req.body.college.name;
      if (req.body.college.year !== undefined) update["college.year"] = req.body.college.year;
      if (req.body.college.branch !== undefined) update["college.branch"] = req.body.college.branch;
    }

    if (req.body.career) {
      if (req.body.career.domain !== undefined) update["career.domain"] = req.body.career.domain;
      if (req.body.career.path !== undefined) update["career.path"] = req.body.career.path;
      if (req.body.career.experience !== undefined) update["career.experience"] = req.body.career.experience;
    }

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    return successResponse(res, "Profile updated successfully", user);
  } catch (error) {
    return errorResponse(res, "Failed to update profile", 500, error.message);
  }
};

const selectCareerPath = async (req, res) => {
  try {
    const { domain, path, experience } = req.body;

    const user = await User.findById(req.user._id);
    user.career.domain = domain;
    user.career.path = path;
    user.career.experience = experience;
    await user.save();

    return successResponse(res, "Career path selected successfully", user.career);
  } catch (error) {
    return errorResponse(res, "Failed to select career path", 500, error.message);
  }
};

const markProblemSolved = async (req, res) => {
  try {
    const { problemId } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) return errorResponse(res, "Problem not found", 404);

    const user = await User.findById(req.user._id);
    const alreadySolved = user.problemsSolved.some((entry) => String(entry.problemId) === problemId);

    if (!alreadySolved) {
      user.problemsSolved.push({ problemId, solvedAt: new Date() });
      user.stats.totalProblems += 1;
    }

    updateStreakStats(user);
    await user.save();

    return successResponse(res, "Problem marked as solved", {
      totalProblems: user.stats.totalProblems,
      streak: user.stats.streak,
    });
  } catch (error) {
    return errorResponse(res, "Failed to mark problem solved", 500, error.message);
  }
};

const markQuestionPracticed = async (req, res) => {
  try {
    const { questionId, confidence = 3 } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return errorResponse(res, "Question not found", 404);

    const user = await User.findById(req.user._id);
    const existing = user.questionsPracticed.find((entry) => String(entry.questionId) === questionId);

    if (existing) {
      existing.confidence = confidence;
      existing.practicedAt = new Date();
    } else {
      user.questionsPracticed.push({ questionId, confidence, practicedAt: new Date() });
      user.stats.totalQuestions += 1;
    }

    updateStreakStats(user);
    await user.save();

    return successResponse(res, "Question marked as practiced", {
      totalQuestions: user.stats.totalQuestions,
      streak: user.stats.streak,
    });
  } catch (error) {
    return errorResponse(res, "Failed to mark question practiced", 500, error.message);
  }
};

const markTopicCompleted = async (req, res) => {
  try {
    const { topicId } = req.body;
    const topic = await Topic.findById(topicId);
    if (!topic) return errorResponse(res, "Topic not found", 404);

    const user = await User.findById(req.user._id);
    const alreadyDone = user.topicsCompleted.some((entry) => String(entry.topicId) === topicId);

    if (!alreadyDone) {
      user.topicsCompleted.push({ topicId, completedAt: new Date() });
      user.stats.totalTopics += 1;
    }

    updateStreakStats(user);
    await user.save();

    return successResponse(res, "Topic marked as completed", {
      totalTopics: user.stats.totalTopics,
      streak: user.stats.streak,
    });
  } catch (error) {
    return errorResponse(res, "Failed to mark topic completed", 500, error.message);
  }
};

const saveItem = async (req, res) => {
  try {
    const { type, problemId, questionId, title, link, resourceType } = req.body;
    const user = await User.findById(req.user._id);

    if (type === "problem") {
      const problem = await Problem.findById(problemId);
      if (!problem) return errorResponse(res, "Problem not found", 404);
      user.savedItems.problems.addToSet(problemId);
      problem.savedBy.addToSet(req.user._id);
      await problem.save();
    } else if (type === "question") {
      const question = await Question.findById(questionId);
      if (!question) return errorResponse(res, "Question not found", 404);
      user.savedItems.questions.addToSet(questionId);
    } else if (type === "resource") {
      user.savedItems.resources.push({
        title,
        link,
        type: resourceType || "other",
      });
    } else {
      return errorResponse(res, "Invalid save item type", 400);
    }

    await user.save();
    return successResponse(res, "Item saved successfully", user.savedItems);
  } catch (error) {
    return errorResponse(res, "Failed to save item", 500, error.message);
  }
};

const getProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("topicsCompleted.topicId", "name domain")
      .select("-password");

    const domainRoadmap = user.career.path
      ? await Roadmap.findOne({ path: user.career.path })
      : await Roadmap.findOne({ domain: user.career.domain });

    const totalRoadmapTopics = domainRoadmap ? domainRoadmap.topics.length : 0;
    const completedTopics = user.topicsCompleted.length;
    const topicCompletionPercent =
      totalRoadmapTopics > 0 ? Math.round((completedTopics / totalRoadmapTopics) * 100) : 0;

    return successResponse(res, "Progress fetched successfully", {
      stats: user.stats,
      domain: user.career.domain,
      path: user.career.path,
      completedTopics,
      totalRoadmapTopics,
      topicCompletionPercent,
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch progress", 500, error.message);
  }
};

const getSavedItems = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("savedItems.problems")
      .populate("savedItems.questions")
      .select("savedItems");

    return successResponse(res, "Saved items fetched successfully", user.savedItems);
  } catch (error) {
    return errorResponse(res, "Failed to fetch saved items", 500, error.message);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  selectCareerPath,
  markProblemSolved,
  markQuestionPracticed,
  markTopicCompleted,
  saveItem,
  getProgress,
  getSavedItems,
};
