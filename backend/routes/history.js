// src/routes/history.js
import express from "express";
import { getHistory, deleteHistory } from "../services/historyServices.js";
import { validatePagination } from "../utils/validators.js";
import { formatPaginatedResponse, formatSuccessResponse, formatErrorResponse } from "../utils/responseFormatter.js";

const router = express.Router();

// GET all history (with pagination)
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Validate pagination parameters
    const validation = validatePagination(page, limit);
    if (!validation.valid) {
      return res.status(400).json(formatErrorResponse(validation.errors.join(', '), 400));
    }
    
    const result = await getHistory(validation.page, validation.limit);
    res.json(formatPaginatedResponse(
      result.items,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total
    ));
  } catch (err) {
    res.status(500).json(formatErrorResponse(err.message, 500));
  }
});

// DELETE history item by id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteHistory(id);
    res.json(formatSuccessResponse({ id }, "History item deleted successfully"));
  } catch (err) {
    res.status(500).json(formatErrorResponse(err.message, 500));
  }
});

export default router;
