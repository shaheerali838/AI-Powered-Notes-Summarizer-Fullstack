import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import serverless from "serverless-http";

import summarizeRoutes from "./routes/summarize.js";
import historyRoutes from "./routes/history.js";
import notesRoutes from "./routes/notes.js";

dotenv.config();

const app = express();

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

app.use("/api/summarize", summarizeRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/notes", notesRoutes);

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

app.listen(3000, () => {
  console.log(`Server is running on port ${3000}`);
});
// ✅ EXPORT HANDLER FOR VERCEL
export default serverless(app);
