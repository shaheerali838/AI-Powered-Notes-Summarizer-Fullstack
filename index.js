import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import serverless from "serverless-http";

// ⚠️ DO NOT import routes that depend on Firebase here
// They will be lazy-loaded to avoid cold start timeouts

dotenv.config();

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const PROD_ORIGIN = process.env.PROD_ORIGIN || "https://ai-powered-notes-summarizer.vercel.app";

const allowedOrigins = [
  PROD_ORIGIN,
  "https://ai-powered-notes-summarizer.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsOptions = {
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
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.get("/", (req, res) => {
  res.json({ status: "API is working" });
});

// Helper function to create lazy-loaded route middleware
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

// Lazy-load routes to avoid Firebase initialization on cold start
app.use("/api/summarize", lazyLoadRoute("./routes/summarize.js"));
app.use("/api/history", lazyLoadRoute("./routes/history.js"));
app.use("/api/notes", lazyLoadRoute("./routes/notes.js"));

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// ✅ EXPORT HANDLER FOR VERCEL
export default serverless(app);
