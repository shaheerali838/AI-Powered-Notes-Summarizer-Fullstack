import express from 'express';
import { validateAuth } from '../middleware/validateInput.js';
import { getHistory, getSummary, deleteSummary } from '../controllers/historyController.js';

const router = express.Router();

// GET /api/history - Get user's summary history
router.get('/', validateAuth, getHistory);

// GET /api/history/:id - Get specific summary
router.get('/:id', validateAuth, getSummary);

// DELETE /api/history/:id - Delete specific summary
router.delete('/:id', validateAuth, deleteSummary);

export default router;