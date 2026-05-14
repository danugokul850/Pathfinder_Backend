require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");



const { connectDatabase } = require("./config/database");
const redisClient = require("./config/redis"); // ✅ Fixed: Direct import
const { errorResponse, successResponse } = require("./utils/apiResponse.utils");

const authRoutes = require("./routes/authRouter");
const userRoutes = require("./routes/userRouter");
const roadmapRoutes = require("./routes/roadRouter");
const progressRoutes = require("./routes/progressRouter");
const problemRoutes = require("./routes/problemRouter");
const questionRoutes = require("./routes/questionsRouter");
const aiRoutes = require("./routes/aiRouter");

const app = express();
app.set('trust proxy', 1); 

// Rate limiter
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'https://genzpathfinder.netlify.app',
    'https://pathfinder-frontend-o7eb.onrender.com'    // ← add quotes, remove trailing slash
  ],
  credentials: true
}))
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Health check
app.get("/api/health", (_req, res) => 
  successResponse(res, "Pathfinder API is running", { status: "ok" })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/ai", aiRoutes);

// 404 handler
app.use((req, res) => 
  errorResponse(res, `Route not found: ${req.originalUrl}`, 404)
);

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);

  if (err.name === "ValidationError") {
    return errorResponse(res, "Validation error", 400, err.message);
  }

  if (err.name === "CastError") {
    return errorResponse(res, "Invalid resource identifier", 400, err.message);
  }

  return errorResponse(res, "Internal server error", 500, err.message);
});

// Connect to Redis function
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅ Connected to Redis Cloud");
    
    // Test connection
    await redisClient.ping();
    console.log("✅ Redis ping successful");
  } catch (error) {
    console.log("❌ Redis connection failed:", error.message);
    // Don't exit process, app can run without Redis
  }
};

// Start server function
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();
    
    // Connect to Redis (but don't block if it fails)
    await connectRedis();

    const PORT = Number(process.env.PORT) || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Pathfinder backend is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Handle Redis errors after connection
redisClient.on('error', (err) => {
  console.log('⚠️ Redis error:', err.message);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    if (redisClient.isOpen) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
// require("dotenv").config();
// const redisClient = require("../src/config/redis");

// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const compression = require("compression");
// const morgan = require("morgan");
// const rateLimit = require("express-rate-limit");
// const { connectDatabase } = require("../src/config/database");
// const { connectRedis } = require("./config/redis");
// const { errorResponse, successResponse } = require("./utils/apiResponse.utils");

// const authRoutes = require("../src/routes/authRouter");
// const userRoutes = require("../src/routes/userRouter");
// const roadmapRoutes = require("../src/routes/roadRouter");
// const progressRoutes = require("../src/routes/progressRouter");
// const problemRoutes = require("../src/routes/problemRouter");
// const questionRoutes = require("../src/routes/questionsRouter");
// const aiRoutes = require("../src/routes/aiRouter");

// const app = express();

// const limiter = rateLimit({
//   windowMs: Number(process.env.RATE_LIMIT_WINDOW) * 60 * 1000,
//   max: Number(process.env.RATE_LIMIT_MAX),
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     success: false,
//     message: "Too many requests, please try again later.",
//   },
// });

// app.use(helmet());
// app.use(compression());
// app.use(morgan("dev"));
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
//   })
// );
// app.use(express.json({ limit: "2mb" }));
// app.use(express.urlencoded({ extended: true }));
// app.use(limiter);

// app.get("/api/health", (_req, res) => successResponse(res, "Pathfinder API is running", { status: "ok" }));

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/roadmaps", roadmapRoutes);
// app.use("/api/progress", progressRoutes);
// app.use("/api/problems", problemRoutes);
// app.use("/api/questions", questionRoutes);
// app.use("/api/ai", aiRoutes);

// app.use((req, res) => errorResponse(res, `Route not found: ${req.originalUrl}`, 404));

// app.use((err, _req, res, _next) => {
//   console.error("Unhandled error:", err);

//   if (err.name === "ValidationError") {
//     return errorResponse(res, "Validation error", 400, err.message);
//   }

//   if (err.name === "CastError") {
//     return errorResponse(res, "Invalid resource identifier", 400, err.message);
//   }

//   return errorResponse(res, "Internal server error", 500, err.message);
// });

// const startServer = async () => {
//   await connectDatabase();
//   await connectRedis();

//   const PORT = Number(process.env.PORT);
//   app.listen(PORT, () => {
//     console.log(`🚀 Pathfinder backend is running on port ${PORT}`);
//   });
// };

// if (require.main === module) {
//   startServer();
// }

// module.exports = { app, startServer };
