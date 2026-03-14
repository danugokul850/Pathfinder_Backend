const crypto = require("crypto");
const User = require("../models/users");
const { hashPassword, comparePassword } = require("../utils/hashUtils");
const { generateToken } = require("../utils/jwtUtils");
const { successResponse, errorResponse } = require("../utils/apiResponse.utils");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return errorResponse(res, "Email already registered", 400);
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomBytes(24).toString("hex");

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationToken,
    });

    const token = generateToken(user._id);
    return successResponse(
      res,
      "Registration successful",
      {
        user,
        token,
        verificationToken,
      },
      201
    );
  } catch (error) {
    return errorResponse(res, "Registration failed", 500, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const token = generateToken(user._id);
    return successResponse(res, "Login successful", { token, user });
  } catch (error) {
    return errorResponse(res, "Login failed", 500, error.message);
  }
};

const logout = async (_req, res) => successResponse(res, "Logout successful", null);

const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return errorResponse(res, "Invalid verification token", 400);
    }

    user.isEmailVerified = true;
    user.verificationToken = null;
    await user.save();

    return successResponse(res, "Email verified successfully", { user });
  } catch (error) {
    return errorResponse(res, "Email verification failed", 500, error.message);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return errorResponse(res, "No user found with this email", 404);
    }

    const resetPasswordToken = crypto.randomBytes(24).toString("hex");
    user.resetPasswordToken = resetPasswordToken;
    await user.save();

    // Dev mode flow selected by user: returning token in response.
    return successResponse(res, "Password reset token generated", { resetPasswordToken });
  } catch (error) {
    return errorResponse(res, "Forgot password request failed", 500, error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ resetPasswordToken: token });
    if (!user) {
      return errorResponse(res, "Invalid reset token", 400);
    }

    user.password = await hashPassword(password);
    user.resetPasswordToken = null;
    await user.save();

    return successResponse(res, "Password reset successful", null);
  } catch (error) {
    return errorResponse(res, "Reset password failed", 500, error.message);
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
