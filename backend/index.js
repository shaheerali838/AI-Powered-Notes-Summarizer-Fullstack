import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import serverless from "serverless-http";
import { pathToFileURL } from "url";

import requestLogger from "./middleware/requestLogger.js";
import rateLimiter from "./middleware/rateLimiter.js";
import { logSuccess, logInfo } from "./utils/logger.js";
import { IS_PRODUCTION } from "./config/constants.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Trust proxy (important for rate limiting and getting real IP)
app.set("trust proxy", 1);

// Security middleware - must be first
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Compression middleware - compress all responses
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Balance between speed and compression ratio
  }),
);

// Request logging - log all requests
if (!IS_PRODUCTION || process.env.ENABLE_REQUEST_LOGGING === "true") {
  app.use(requestLogger);
}

// CORS configuration
const PROD_ORIGIN =
  process.env.PROD_ORIGIN || "https://ai-powered-notes-summarizer.vercel.app";

const allowedOrigins = [
  PROD_ORIGIN,
  "https://ai-powered-notes-summarizer.vercel.app",
  "http://localhost:5173",
  "http://localhost:5000",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
    ],
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting - apply to all routes
app.use(rateLimiter);

// Helper function to create lazy-loaded route middleware
// Prevents Firebase initialization during cold starts
function lazyLoadRoute(importPath) {
  let routerCache = null;

  return async (req, res, next) => {
    try {
      if (!routerCache) {
        const module = await import(importPath);
        routerCache = module.default;
      }
      return routerCache(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
}

// Health check routes
app.get("/", (req, res) => {
  res.json({
    status: "API is working",
    environment: IS_PRODUCTION ? "production" : "development",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
  });
});

// API routes with lazy loading (Firebase initialization on first access only)
app.use("/api/summarize", lazyLoadRoute("./routes/summarize.js"));
app.use("/api/history", lazyLoadRoute("./routes/history.js"));
app.use("/api/notes", lazyLoadRoute("./routes/notes.js"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
    method: req.method,
    statusCode: 404,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);

  const statusCode = err.statusCode || 500;
  const message = IS_PRODUCTION ? "Internal server error" : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(!IS_PRODUCTION && { stack: err.stack }),
    statusCode,
  });
});

// Local development server (runs when file is executed directly)
// Vercel will import this file as a module instead
const runningAsScript =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (runningAsScript) {
  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    logSuccess(`Server started successfully`);
    logInfo(`Environment: ${IS_PRODUCTION ? "production" : "development"}`);
    logInfo(`Listening on http://localhost:${PORT}`);
    logInfo(`Health check: http://localhost:${PORT}/health`);
    logInfo(`Press Ctrl+C to stop\n`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the running server and retry.`,
      );
      return;
    }
    console.error("Server failed to start:", error);
  });
}

// Export for Vercel serverless deployment
export default serverless(app);
export { app };
