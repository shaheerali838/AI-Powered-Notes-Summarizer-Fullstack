import express from "express";
import dotenv from "dotenv";
import summarizeRoutes from "./routes/summarize.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use("/api/summarize", summarizeRoutes);
// app.use(cors());

// Health Check
app.get("/", (req, res) => {
  res.send("✅ API is working!");
});

export default app;
