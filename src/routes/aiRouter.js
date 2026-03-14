const express = require("express");
const { body, param } = require("express-validator");
const {
  sendMessage,
  getChatHistory,
  getChatById,
  deleteChat,
  getExplanation,
  generateQuestions,
  careerAdvice,
} = require("../controllers/aiControllers");
const { verifyAuthToken } = require("../middleware/authMiddleware");
const { aiRateLimit } = require("../middleware/aiRateLimitMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");

const router = express.Router();

router.use(verifyAuthToken);

router.post(
  "/chat",
  [body("message").notEmpty().withMessage("Message is required")],
  validateRequest,
  aiRateLimit,
  sendMessage
);

router.get("/chats", getChatHistory);

router.get(
  "/chat/:chatId",
  [param("chatId").isMongoId().withMessage("Valid chatId is required")],
  validateRequest,
  getChatById
);

router.delete(
  "/chat/:chatId",
  [param("chatId").isMongoId().withMessage("Valid chatId is required")],
  validateRequest,
  deleteChat
);

router.post(
  "/explain-problem",
  [body("problemLink").isURL().withMessage("Valid problem link is required")],
  validateRequest,
  aiRateLimit,
  getExplanation
);

router.post(
  "/generate-questions",
  [
    body("topic").notEmpty().withMessage("Topic is required"),
    body("difficulty")
      .optional()
      .isIn(["Easy", "Medium", "Hard"])
      .withMessage("Difficulty must be Easy/Medium/Hard"),
    body("count").optional().isInt({ min: 1, max: 15 }).withMessage("Count must be 1-15"),
  ],
  validateRequest,
  aiRateLimit,
  generateQuestions
);

router.post("/career-advice", aiRateLimit, careerAdvice);

module.exports = router;
