const express = require("express");
const { body, param } = require("express-validator");
const {
  updateTopicProgress,
  updateProblemProgress,
  updateQuestionProgress,
  getOverallProgress,
  getDomainProgress,
} = require("../controllers/progressControllers");
const { verifyAuthToken } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");

const router = express.Router();

router.use(verifyAuthToken);

router.put(
  "/topic",
  [body("topicId").isMongoId().withMessage("Valid topicId is required")],
  validateRequest,
  updateTopicProgress
);

router.put(
  "/problem",
  [body("problemId").isMongoId().withMessage("Valid problemId is required")],
  validateRequest,
  updateProblemProgress
);

router.put(
  "/question",
  [
    body("questionId").isMongoId().withMessage("Valid questionId is required"),
    body("confidence")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Confidence must be between 1 and 5"),
  ],
  validateRequest,
  updateQuestionProgress
);

router.get("/overview", getOverallProgress);

router.get(
  "/domain/:domain",
  [
    param("domain")
      .isIn(["software-engineering", "ai-ml", "data-analytics"])
      .withMessage("Valid domain is required"),
  ],
  validateRequest,
  getDomainProgress
);

module.exports = router;
