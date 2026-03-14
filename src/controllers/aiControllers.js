const AIChat = require("../models/Aimodel");
const User = require("../models/users");
const aiService = require("../Services/aiServices");
const { successResponse, errorResponse } = require("../utils/apiResponse.utils");

const getPagination = (req) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  return { page, limit, skip: (page - 1) * limit };
};

const sendMessage = async (req, res) => {
  try {
    const { message, chatId, context = {} } = req.body;
    const userId = req.user._id;

    let chat;
    if (chatId) {
      chat = await AIChat.findOne({ _id: chatId, userId });
      if (!chat) return errorResponse(res, "Chat not found", 404);
    } else {
      chat = await AIChat.create({
        userId,
        title: message.slice(0, 40),
        context,
        messages: [],
      });
      await User.findByIdAndUpdate(userId, { $addToSet: { aiChats: chat._id } });
    }

    const aiReply = await aiService.generateResponse(message, context, chat.messages);

    chat.context = { ...chat.context, ...context };
    chat.messages.push({ role: "user", content: message, timestamp: new Date() });
    chat.messages.push({ role: "assistant", content: aiReply, timestamp: new Date() });
    await chat.save();

    return successResponse(res, "AI response generated", {
      chatId: chat._id,
      title: chat.title,
      message: aiReply,
    });
  } catch (error) {
    return errorResponse(res, "Failed to generate AI response", 500, error.message);
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const userId = req.user._id;

    const [chats, total] = await Promise.all([
      AIChat.find({ userId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("title updatedAt context messages"),
      AIChat.countDocuments({ userId }),
    ]);

    const items = chats.map((chat) => ({
      _id: chat._id,
      title: chat.title,
      updatedAt: chat.updatedAt,
      context: chat.context,
      preview: chat.messages.length ? chat.messages[chat.messages.length - 1].content.slice(0, 90) : "",
      totalMessages: chat.messages.length,
    }));

    return successResponse(res, "Chat history fetched", {
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return errorResponse(res, "Failed to fetch chat history", 500, error.message);
  }
};

const getChatById = async (req, res) => {
  try {
    const chat = await AIChat.findOne({ _id: req.params.chatId, userId: req.user._id });
    if (!chat) return errorResponse(res, "Chat not found", 404);

    return successResponse(res, "Chat fetched successfully", chat);
  } catch (error) {
    return errorResponse(res, "Failed to fetch chat", 500, error.message);
  }
};

const deleteChat = async (req, res) => {
  try {
    const deleted = await AIChat.findOneAndDelete({ _id: req.params.chatId, userId: req.user._id });
    if (!deleted) return errorResponse(res, "Chat not found", 404);

    await User.findByIdAndUpdate(req.user._id, { $pull: { aiChats: req.params.chatId } });
    return successResponse(res, "Chat deleted successfully", null);
  } catch (error) {
    return errorResponse(res, "Failed to delete chat", 500, error.message);
  }
};

const getExplanation = async (req, res) => {
  try {
    const { problemLink } = req.body;
    const explanation = await aiService.explainProblem(problemLink);
    return successResponse(res, "Problem explanation generated", { explanation });
  } catch (error) {
    return errorResponse(res, "Failed to explain problem", 500, error.message);
  }
};

const generateQuestions = async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;
    const questions = await aiService.generateQuestions(topic, difficulty, count);
    return successResponse(res, "Interview questions generated", { questions });
  } catch (error) {
    return errorResponse(res, "Failed to generate interview questions", 500, error.message);
  }
};

const careerAdvice = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    const advice = await aiService.getCareerAdvice({
      name: user.name,
      college: user.college,
      career: user.career,
      stats: user.stats,
    });

    return successResponse(res, "Career advice generated", { advice });
  } catch (error) {
    return errorResponse(res, "Failed to generate career advice", 500, error.message);
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  getChatById,
  deleteChat,
  getExplanation,
  generateQuestions,
  careerAdvice,
};
