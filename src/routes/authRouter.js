const express = require("express");
const { body, param } = require("express-validator");
const {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/authControllers");
const { validateRequest } = require("../middleware/validateMiddleware");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validateRequest,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validateRequest,
  login
);

router.post("/logout", logout);

router.get(
  "/verify/:token",
  [param("token").notEmpty().withMessage("Verification token is required")],
  validateRequest,
  verifyEmail
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  validateRequest,
  forgotPassword
);

router.post(
  "/reset-password/:token",
  [
    param("token").notEmpty().withMessage("Reset token is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validateRequest,
  resetPassword
);

module.exports = router;
