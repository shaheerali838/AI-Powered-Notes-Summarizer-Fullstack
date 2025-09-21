import { db } from '../config/firebase.js';
import { formatError } from '../utils/responseFormatter.js';

export class HistoryService {
  static async saveSummary(userId, summaryData) {
    if (!db) {
      throw formatError('Database not available', 503);
    }
    
    try {
      const docRef = await db
        .collection('users')
        .doc(userId)
        .collection('summaries')
        .add({
          ...summaryData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving summary:', error);
      throw formatError('Failed to save summary', 500);
    }
  }
  
  static async getUserHistory(userId, limit = 50) {
    if (!db) {
      throw formatError('Database not available', 503);
    }
    
    try {
      const snapshot = await db
        .collection('users')
        .doc(userId)
        .collection('summaries')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      const summaries = [];
      snapshot.forEach(doc => {
        summaries.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return summaries;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw formatError('Failed to fetch history', 500);
    }
  }
  
  static async getSummary(userId, summaryId) {
    if (!db) {
      throw formatError('Database not available', 503);
    }
    
    try {
      const doc = await db
        .collection('users')
        .doc(userId)
        .collection('summaries')
        .doc(summaryId)
        .get();
      
      if (!doc.exists) {
        throw formatError('Summary not found', 404);
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      console.error('Error fetching summary:', error);
      if (error.status === 404) throw error;
      throw formatError('Failed to fetch summary', 500);
    }
  }
  
  static async deleteSummary(userId, summaryId) {
    if (!db) {
      throw formatError('Database not available', 503);
    }
    
    try {
      await db
        .collection('users')
        .doc(userId)
        .collection('summaries')
        .doc(summaryId)
        .delete();
      
      return true;
    } catch (error) {
      console.error('Error deleting summary:', error);
      throw formatError('Failed to delete summary', 500);
    }
  }
  
  static async updateSummary(userId, summaryId, updateData) {
    if (!db) {
      throw formatError('Database not available', 503);
    }
    
    try {
      await db
        .collection('users')
        .doc(userId)
        .collection('summaries')
        .doc(summaryId)
        .update({
          ...updateData,
          updatedAt: new Date()
        });
      
      return true;
    } catch (error) {
      console.error('Error updating summary:', error);
      throw formatError('Failed to update summary', 500);
    }
  }
}