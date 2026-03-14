const { errorResponse } = require("../utils/apiResponse.utils");

const restrictTo = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return errorResponse(res, "Forbidden: insufficient permissions", 403);
  }
  return next();
};

module.exports = { restrictTo };
