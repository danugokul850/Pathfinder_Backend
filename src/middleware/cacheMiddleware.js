const { getCache, setCache, deleteCache } = require("../utils/cache.utils");

const defaultKeyBuilder = (req) => req.originalUrl;

const cacheMiddleware = (keyBuilder = defaultKeyBuilder, expiry = 300) => async (req, res, next) => {
  try {
    const cacheKey = keyBuilder(req);
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
      return res.status(200).json(cachedData);
    }

    const originalJson = res.json.bind(res);
    res.json = (payload) => {
      if (res.statusCode < 400) {
        setCache(cacheKey, payload, expiry).catch(() => {
          // Cache failures should never block API responses.
        });
      }
      return originalJson(payload);
    };

    return next();
  } catch (_error) {
    return next();
  }
};

const clearCache = (keysOrPatterns = []) => (req, res, next) => {
  res.on("finish", async () => {
    if (res.statusCode >= 400) return;
    await Promise.all(keysOrPatterns.map((key) => deleteCache(typeof key === "function" ? key(req) : key)));
  });
  next();
};

module.exports = { cacheMiddleware, clearCache };
