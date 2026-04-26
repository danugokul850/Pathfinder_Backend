const redisClient = require("../config/redis");
const { errorResponse } = require("../utils/apiResponse.utils");

const inMemoryCounter = new Map();

const getDateKey = () => new Date().toISOString().split("T")[0];

// Check if redis is connected using the actual client status
const isRedisConnected = () => {
  try {
    return redisClient.isOpen && redisClient.isReady;
  } catch {
    return false;
  }
};

const aiRateLimit = async (req, res, next) => {
  try {
    const userId = String(req.user._id);
    const dateKey = getDateKey();
    const maxRequests = Number(process.env.AI_RATE_LIMIT_MAX) || 50;

    if (isRedisConnected()) {
      try {
        const key = `ai_rate_limit:${userId}:${dateKey}`;
        const count = await redisClient.incr(key);
        if (count === 1) await redisClient.expire(key, 86400);

        if (count > maxRequests) {
          return errorResponse(
            res,
            `Daily AI usage limit exceeded. Max ${maxRequests} requests/day.`,
            429
          );
        }

        return next();
      } catch (redisErr) {
        // Redis op failed — fall through to in-memory
        console.log("Redis rate limit error, falling back to memory:", redisErr.message);
      }
    }

    // Fallback: in-memory rate limiting
    const memoryKey = `${userId}:${dateKey}`;
    const currentCount = inMemoryCounter.get(memoryKey) || 0;

    if (currentCount >= maxRequests) {
      return errorResponse(
        res,
        `Daily AI usage limit exceeded. Max ${maxRequests} requests/day.`,
        429
      );
    }

    inMemoryCounter.set(memoryKey, currentCount + 1);
    return next();

  } catch (error) {
    // Don't block the request if rate limiter itself fails
    console.error("Rate limiter error:", error.message);
    return next();
  }
};

module.exports = { aiRateLimit };