import express from "express";
import summaryController from "../controllers/summaryController.js";

const router = express.Router();

router.post("/", summaryController.generateSummary);
router.get("/history", summaryController.getHistory);
router.get("/:id", summaryController.getSummaryById);
router.delete("/:id", summaryController.deleteSummary);

export default router;
