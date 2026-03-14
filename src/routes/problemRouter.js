const express = require("express");
const { param } = require("express-validator");
const {
  getProblems,
  getProblemById,
  getProblemsByTopic,
  searchProblems,
  getCompanyWiseProblems,
} = require("../controllers/problemControllers");
const { validateRequest } = require("../middleware/validateMiddleware");

const router = express.Router();

router.get("/", getProblems);
router.get("/search", searchProblems);

router.get(
  "/topic/:topic",
  [param("topic").notEmpty().withMessage("Topic is required")],
  validateRequest,
  getProblemsByTopic
);

router.get(
  "/company/:companyName",
  [param("companyName").notEmpty().withMessage("Company name is required")],
  validateRequest,
  getCompanyWiseProblems
);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Valid problem id is required")],
  validateRequest,
  getProblemById
);

module.exports = router;
