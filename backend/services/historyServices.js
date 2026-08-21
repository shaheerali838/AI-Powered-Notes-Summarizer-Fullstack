// src/services/historyServices.js
import { db } from "../config/firebase.js";
import { logError, logSuccess, logInfo } from "../utils/logger.js";

// Helper to get collection lazily
const getHistoryCollection = () => {
  const database = db();
  if (!database) {
    return null;
  }
  return database.collection("history");
};

// Save a new summary
export const saveSummary = async (original, summary, keyPoints) => {
  const timestamp = new Date().toISOString();
  const fallbackId = Date.now().toString();

  try {
    const historyCollection = getHistoryCollection();
    if (!historyCollection) {
      logInfo("Firebase DB is not initialized. Summary returned without server-side persistence.");
      return {
        id: fallbackId,
        original,
        summary,
        keyPoints,
        timestamp,
      };
    }

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
    logError("Error saving summary to Firestore:", error);
    return {
      id: fallbackId,
      original,
      summary,
      keyPoints,
      timestamp,
    };
  }
};

// Get all summaries (with optional pagination)
export const getHistory = async (page = 1, limit = 10) => {
  try {
    const historyCollection = getHistoryCollection();
    if (!historyCollection) {
      return {
        items: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasMore: false,
        },
      };
    }
    
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
        hasMore: page * limit < total,
      },
    };
  } catch (error) {
    logError("Error fetching history:", error);
    return {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }
};

// Delete a summary by ID
export const deleteHistory = async (id) => {
  try {
    const historyCollection = getHistoryCollection();
    if (!historyCollection) {
      return { success: true };
    }
    await historyCollection.doc(id).delete();
    logSuccess(`Summary deleted: ${id}`);
    return { success: true };
  } catch (error) {
    logError("Error deleting summary:", error);
    return { success: false, error: error.message };
  }
};
