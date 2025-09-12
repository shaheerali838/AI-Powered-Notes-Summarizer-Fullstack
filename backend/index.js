import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import summaryRoutes from "./src/routes/summaryRoutes.js";
import historyRoutes from "./src/routes/historyRoutes.js";
import errorHandler from "./src/middleware/errorHandler.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/summarize", summaryRoutes);
app.use("/api/history", historyRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "Server is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
