import { HistoryService } from '../services/historyService.js';
import { formatResponse, formatError } from '../utils/responseFormatter.js';

export const getHistory = async (req, res, next) => {
  try {
    const { user, isGuest } = req;
    
    if (isGuest || !user) {
      return res.json(formatResponse(
        true,
        'Guest users have no persistent history',
        []
      ));
    }
    
    const limit = parseInt(req.query.limit) || 50;
    const history = await HistoryService.getUserHistory(user.uid, limit);
    
    res.json(formatResponse(
      true,
      'History retrieved successfully',
      history,
      { count: history.length, limit }
    ));
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req, res, next) => {
  try {
    const { user, isGuest } = req;
    const { id } = req.params;
    
    if (isGuest || !user) {
      throw formatError('Authentication required', 401);
    }
    
    const summary = await HistoryService.getSummary(user.uid, id);
    
    res.json(formatResponse(
      true,
      'Summary retrieved successfully',
      summary
    ));
  } catch (error) {
    next(error);
  }
};

export const deleteSummary = async (req, res, next) => {
  try {
    const { user, isGuest } = req;
    const { id } = req.params;
    
    if (isGuest || !user) {
      throw formatError('Authentication required', 401);
    }
    
    await HistoryService.deleteSummary(user.uid, id);
    
    res.json(formatResponse(
      true,
      'Summary deleted successfully'
    ));
  } catch (error) {
    next(error);
  }
};