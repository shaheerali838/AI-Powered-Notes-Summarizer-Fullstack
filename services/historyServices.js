// src/services/historyServices.js
import { db } from "../config/firebase.js";

// Helper to get collection lazily
const getHistoryCollection = () => {
  if (!db) {
    throw new Error("Firebase DB is not initialized. Check server logs for credential errors.");
  }
  return db.collection("history");
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

    return {
      id: docRef.id,
      original,
      summary,
      keyPoints,
      timestamp,
    };
  } catch (error) {
    console.error("Error saving summary:", error);
    throw error;
  }
};

// Get all summaries
export const getHistory = async () => {
  try {
    const historyCollection = getHistoryCollection();
    const snapshot = await historyCollection.orderBy("timestamp", "desc").get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching history:", error);
    // Return empty array if DB fails (or rethrow if critical)
    // For now, rethrowing so the frontend sees the error
    throw error;
  }
};

// Delete a summary by ID
export const deleteHistory = async (id) => {
  const historyCollection = getHistoryCollection();
  await historyCollection.doc(id).delete();
  return { success: true };
};
