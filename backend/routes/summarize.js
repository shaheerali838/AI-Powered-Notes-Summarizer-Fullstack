import express from 'express';
import { validateText, validateAuth } from '../middleware/validateInput.js';
import { summarizeText } from '../controllers/summarizeController.js';

const router = express.Router();

// POST /api/summarize - Generate summary from text
router.post('/', validateAuth, validateText, summarizeText);

export default router;