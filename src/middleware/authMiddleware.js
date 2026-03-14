const User = require("../models/users");
const { verifyToken } = require("../utils/jwtUtils");
const { errorResponse } = require("../utils/apiResponse.utils");

const verifyAuthToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return errorResponse(res, "Unauthorized: token missing", 401);
    }

    const token = header.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return errorResponse(res, "Unauthorized: user not found", 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    return errorResponse(res, "Unauthorized: invalid token", 401, error.message);
  }
};

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return errorResponse(res, "Forbidden: admin access required", 403);
  }
  return next();
};

module.exports = { verifyAuthToken, isAdmin };
