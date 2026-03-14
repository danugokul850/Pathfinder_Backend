const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/apiResponse.utils");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed", 400, errors.array());
  }
  return next();
};

module.exports = { validateRequest };
