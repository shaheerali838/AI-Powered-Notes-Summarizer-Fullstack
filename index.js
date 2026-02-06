import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import serverless from "serverless-http";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" } 
}));

// CORS configuration
const isProd = process.env.NODE_ENV === "production";
const PROD_ORIGIN = process.env.PROD_ORIGIN || "https://ai-powered-notes-summarizer.vercel.app";

const allowedOrigins = [
  PROD_ORIGIN,
  "https://ai-powered-notes-summarizer.vercel.app",
  "http://localhost:5173",
  "http://localhost:5000",
  "http://localhost:3000",
];

app.use(cors({
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
}));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Helper function to create lazy-loaded route middleware
// Prevents Firebase initialization during cold starts
function lazyLoadRoute(importPath) {
  let routerCache = null;
  
  return async (req, res, next) => {
    if (!routerCache) {
      const module = await import(importPath);
      routerCache = module.default;
    }
    return routerCache(req, res, next);
  };
}

// Health check routes
app.get("/", (req, res) => {
  res.json({ 
    status: "API is working",
    environment: isProd ? "production" : "development",
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API routes with lazy loading (Firebase initialization on first access only)
app.use("/api/summarize", lazyLoadRoute("./routes/summarize.js"));
app.use("/api/history", lazyLoadRoute("./routes/history.js"));
app.use("/api/notes", lazyLoadRoute("./routes/notes.js"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  
  const statusCode = err.statusCode || 500;
  const message = isProd ? "Internal server error" : err.message;
  
  res.status(statusCode).json({ 
    error: message,
    ...(isProd ? {} : { stack: err.stack })
  });
});

// Local development server (runs when file is executed directly)
// Vercel will import this file as a module instead
import { pathToFileURL } from 'url';

const runningAsScript = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (runningAsScript) {
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`✅ Server running in ${isProd ? 'production' : 'development'} mode`);
    console.log(`✅ Listening on http://localhost:${PORT}`);
    console.log(`✅ Press Ctrl+C to stop\n`);
  });
}

// Export for Vercel serverless deployment
export default serverless(app);
export { app };
