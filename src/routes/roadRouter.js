const express = require("express");
const { param, query } = require("express-validator");
const {
  getRoadmaps,
  getRoadmapByPath,
  getTopicsForWeek,
  getTopicDetails,
} = require("../controllers/roadmapControllers");
const { validateRequest } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get(
  "/",
  [
    query("domain")
      .optional()
      .isIn(["software-engineering", "ai-ml", "data-analytics"])
      .withMessage("Invalid domain filter"),
  ],
  validateRequest,
  getRoadmaps
);

router.get(
  "/:path/week/:week",
  [
    param("path").notEmpty().withMessage("Path is required"),
    param("week").isInt({ min: 1 }).withMessage("Week must be a positive integer"),
  ],
  validateRequest,
  getTopicsForWeek
);

router.get(
  "/topic/:topicId",
  [param("topicId").isMongoId().withMessage("Valid topicId is required")],
  validateRequest,
  getTopicDetails
);

router.get(
  "/:path",
  [param("path").notEmpty().withMessage("Path is required")],
  validateRequest,
  getRoadmapByPath
);

module.exports = router;
