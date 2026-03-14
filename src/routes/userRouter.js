const express = require("express");
const { body } = require("express-validator");
const {
  getProfile,
  updateProfile,
  selectCareerPath,
  markProblemSolved,
  markQuestionPracticed,
  markTopicCompleted,
  saveItem,
  getProgress,
  getSavedItems,
} = require("../controllers/userControllers");
const { verifyAuthToken } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateMiddleware");

const router = express.Router();

router.use(verifyAuthToken);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

router.post(
  "/career-path",
  [
    body("domain")
      .isIn(["software-engineering", "ai-ml", "data-analytics"])
      .withMessage("Valid domain is required"),
    body("path").notEmpty().withMessage("Path is required"),
    body("experience")
      .isIn(["beginner", "intermediate", "advanced"])
      .withMessage("Valid experience is required"),
  ],
  validateRequest,
  selectCareerPath
);

router.post(
  "/solved-problem",
  [body("problemId").isMongoId().withMessage("Valid problemId is required")],
  validateRequest,
  markProblemSolved
);

router.post(
  "/practiced-question",
  [
    body("questionId").isMongoId().withMessage("Valid questionId is required"),
    body("confidence")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Confidence must be between 1 and 5"),
  ],
  validateRequest,
  markQuestionPracticed
);

router.post(
  "/completed-topic",
  [body("topicId").isMongoId().withMessage("Valid topicId is required")],
  validateRequest,
  markTopicCompleted
);

router.post(
  "/save-item",
  [
    body("type").isIn(["problem", "question", "resource"]).withMessage("Invalid save item type"),
    body("problemId").if(body("type").equals("problem")).isMongoId(),
    body("questionId").if(body("type").equals("question")).isMongoId(),
    body("title").if(body("type").equals("resource")).notEmpty(),
    body("link").if(body("type").equals("resource")).isURL(),
  ],
  validateRequest,
  saveItem
);

router.get("/progress", getProgress);
router.get("/saved-items", getSavedItems);

module.exports = router;
