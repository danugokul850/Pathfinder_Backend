const { getRedisClient, isRedisReady } = require("../config/redis");
const { errorResponse } = require("../utils/apiResponse.utils");

const inMemoryCounter = new Map();

const getDateKey = () => new Date().toISOString().split("T")[0];

const aiRateLimit = async (req, res, next) => {
  try {
    const userId = String(req.user._id);
    const dateKey = getDateKey();
    const maxRequests = Number(process.env.AI_RATE_LIMIT_MAX);

    if (isRedisReady()) {
      const redis = getRedisClient();
      const key = `ai_rate_limit:${userId}:${dateKey}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, 86400);

      if (count > maxRequests) {
        return errorResponse(
          res,
          `Daily AI usage limit exceeded. Max ${maxRequests} requests/day for free users.`,
          429
        );
      }

      return next();
    }

    const memoryKey = `${userId}:${dateKey}`;
    const currentCount = inMemoryCounter.get(memoryKey) || 0;
    if (currentCount >= maxRequests) {
      return errorResponse(
        res,
        `Daily AI usage limit exceeded. Max ${maxRequests} requests/day for free users.`,
        429
      );
    }

    inMemoryCounter.set(memoryKey, currentCount + 1);
    return next();
  } catch (error) {
    return errorResponse(res, "Rate limiter failed", 500, error.message);
  }
};

module.exports = { aiRateLimit };
