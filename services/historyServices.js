// src/services/historyServices.js
import { db } from "../config/firebase.js";
import { logError, logSuccess } from "../utils/logger.js";

// Helper to get collection lazily
const getHistoryCollection = () => {
  const database = db();
  if (!database) {
    throw new Error("Firebase DB is not initialized. Check server logs for credential errors.");
  }
  return database.collection("history");
};

// Save a new summary
export const saveSummary = async (original, summary, keyPoints) => {
  try {
    const historyCollection = getHistoryCollection();
    const timestamp = new Date().toISOString();
    const docRef = await historyCollection.add({
      original,
      summary,
      keyPoints,
      timestamp,
    });

    logSuccess(`Summary saved with ID: ${docRef.id}`);

    return {
      id: docRef.id,
      original,
      summary,
      keyPoints,
      timestamp,
    };
  } catch (error) {
    logError("Error saving summary:", error);
    throw error;
  }
};

// Get all summaries (with optional pagination)
export const getHistory = async (page = 1, limit = 10) => {
  try {
    const historyCollection = getHistoryCollection();
    
    // Get total count
    const countSnapshot = await historyCollection.get();
    const total = countSnapshot.size;
    
    // Get paginated results
    const snapshot = await historyCollection
      .orderBy("timestamp", "desc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();
    
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    };
  } catch (error) {
    logError("Error fetching history:", error);
    throw error;
  }
};

// Delete a summary by ID
export const deleteHistory = async (id) => {
  try {
    const historyCollection = getHistoryCollection();
    await historyCollection.doc(id).delete();
    logSuccess(`Summary deleted: ${id}`);
    return { success: true };
  } catch (error) {
    logError("Error deleting summary:", error);
    throw error;
  }
};
