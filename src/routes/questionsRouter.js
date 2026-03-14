const express = require("express");
const { param } = require("express-validator");
const {
  getQuestions,
  getQuestionById,
  getQuestionsByCompany,
  getQuestionsByTopic,
} = require("../controllers/questionsControllers");
const { validateRequest } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", getQuestions);

router.get(
  "/company/:companyName",
  [param("companyName").notEmpty().withMessage("Company name is required")],
  validateRequest,
  getQuestionsByCompany
);

router.get(
  "/topic/:topic",
  [param("topic").notEmpty().withMessage("Topic is required")],
  validateRequest,
  getQuestionsByTopic
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Valid question id is required")],
  validateRequest,
  getQuestionById
);

module.exports = router;
