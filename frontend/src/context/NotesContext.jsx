// src/context/NotesContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebaseClient";

const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within NotesProvider");
  return context;
};

export const NotesProvider = ({ children }) => {
  const [originalNotes, setOriginalNotes] = useState("");
  const [summaryOutput, setSummaryOutput] = useState(null);
  const [currentNote, setCurrentNote] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [summaryHistory, setSummaryHistory] = useState([]);
  const [uploadedNotes, setUploadedNotes] = useState([]);
  const [error, setError] = useState("");
  const { user, isGuest, loading: authLoading } = useAuth();

  // FIX 1: Change default from "/api" to "" (empty string)
  // This prevents the double "/api/api" issue locally
  const rawApiUrl = import.meta.env.VITE_APP_API_URL || "";
  const API_URL = rawApiUrl.replace(/\/+$/, "");

  // Upload file to backend
  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const headers = {};
      if (user && !isGuest) {
        try {
          const token = await user.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        } catch (tokenError) {
          console.error("Failed to get auth token:", tokenError);
        }
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // FIX 2: Added "/api" prefix here to match backend route
      const response = await fetch(`${API_URL}/api/notes/upload`, {
        method: "POST",
        headers,
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to upload file");
      }

      const data = await response.json();

      // Store the uploaded note data
      const noteData = {
        id: Date.now().toString(),
        filename: data.filename,
        extractedText: data.extractedText,
        summary: data.summary,
        keyPoints: data.keyPoints || [],
        uploadedAt: new Date(),
        fileType: file.type,
        fileSize: file.size,
      };

      setCurrentNote(noteData);

      // Add to uploaded notes history
      setUploadedNotes((prev) => [noteData, ...prev]);

      // Save to storage based on user type
      try {
        if (user && !isGuest) {
          await saveSummaryToFirestore({
            originalContent: data.extractedText,
            summarizedContent: data.summary,
            keyPoints: data.keyPoints || [],
            filename: data.filename,
            fileType: file.type,
            fileSize: file.size,
          });
        } else {
          saveSummaryToSessionStorage({
            originalContent: data.extractedText,
            summarizedContent: data.summary,
            keyPoints: data.keyPoints || [],
            filename: data.filename,
            fileType: file.type,
            fileSize: file.size,
          });
          fetchHistoryFromSessionStorage();
        }
      } catch (saveError) {
        console.error("Failed to save uploaded note:", saveError);
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      console.error("Upload Error:", err);
      return { success: false, error: err.message };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Save summary to Firestore
  const saveSummaryToFirestore = async (summaryData) => {
    if (!user || isGuest) return null;

    try {
      const docRef = await addDoc(
        collection(db, "users", user.uid, "summaries"),
        {
          ...summaryData,
          createdAt: new Date(),
          fileType: summaryData.fileType || "text",
        },
      );
      return docRef.id;
    } catch (error) {
      console.error("Error saving summary to Firestore:", error);
      throw error;
    }
  };

  // Save summary to sessionStorage (guest)
  const saveSummaryToSessionStorage = (summaryData) => {
    try {
      const guestSummaries = JSON.parse(
        sessionStorage.getItem("guestSummaries") || "[]",
      );
      const newSummary = {
        id: Date.now().toString(),
        ...summaryData,
        createdAt: new Date(),
        fileType: summaryData.fileType || "text",
      };
      guestSummaries.unshift(newSummary);
      if (guestSummaries.length > 10) guestSummaries.splice(10);
      sessionStorage.setItem("guestSummaries", JSON.stringify(guestSummaries));
      return newSummary.id;
    } catch (error) {
      console.error("Error saving to sessionStorage:", error);
      return null;
    }
  };

  // Fetch history (Firestore)
  const fetchHistoryFromFirestore = () => {
    if (!user || isGuest || authLoading) return;

    try {
      const q = query(
        collection(db, "users", user.uid, "summaries"),
        orderBy("createdAt", "desc"),
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const history = [];
          querySnapshot.forEach((doc) => {
            history.push({ id: doc.id, ...doc.data() });
          });
          setSummaryHistory(history);
        },
        (error) => {
          console.error("Error fetching history:", error);
          setError("Failed to load history");
        },
      );

      return unsubscribe;
    } catch (error) {
      console.error("Error setting up Firestore listener:", error);
      setError("Failed to setup history sync");
    }
  };

  // Fetch history (sessionStorage)
  const fetchHistoryFromSessionStorage = () => {
    try {
      const guestSummaries = JSON.parse(
        sessionStorage.getItem("guestSummaries") || "[]",
      );
      setSummaryHistory(guestSummaries);
    } catch (error) {
      console.error("Error fetching from sessionStorage:", error);
      setSummaryHistory([]);
    }
  };

  // Fetch history based on user type
  const fetchHistory = () => {
    if (authLoading) return;

    if (user && !isGuest) return fetchHistoryFromFirestore();
    if (isGuest) fetchHistoryFromSessionStorage();
    else setSummaryHistory([]);
  };

  // Generate summary
  const generateSummary = async () => {
    // 1. Validation
    if (!originalNotes.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    // 2. Setup State
    setIsGenerating(true);
    setError("");

    try {
      // 3. Define Headers
      const headers = { "Content-Type": "application/json" };

      if (user && !isGuest) {
        try {
          const token = await user.getIdToken();
          headers["Authorization"] = `Bearer ${token}`;
        } catch (tokenError) {
          console.error("Failed to get auth token:", tokenError);
        }
      }

      // 4. API Call (Corrected URL)
      // Your backend routes are served at /api/summarize
      // We ensure the URL includes /api/summarize
      const response = await fetch(`${API_URL}/api/summarize`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: originalNotes }),
      });

      // 5. Error Handling
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        const errorMessage =
          errorData.details ||
          errorData.error ||
          errorData.message ||
          "Failed to generate summary";

        throw new Error(errorMessage);
      }

      // 6. Process Success Response
      const response_data = await response.json();

      // Handle nested response structure (backend returns {success: true, data: {...}})
      const data = response_data.data || response_data;

      // Validate API response has required fields
      if (!data.summary || typeof data.summary !== "string") {
        console.error("Invalid API response:", response_data);
        throw new Error(
          "API response is missing the summary field. Please check your backend API.",
        );
      }

      const summaryData = {
        originalContent: originalNotes, // Use the actual user input instead of potentially undefined data.original
        summarizedContent: data.summary, // Now validated to exist
        keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
        wordCount: originalNotes ? originalNotes.split(" ").length : 0,
      };

      setSummaryOutput({
        summary: data.summary,
        keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
        original: originalNotes, // Use originalNotes instead of data.original
      });

      // 7. Save to History
      try {
        if (user && !isGuest) await saveSummaryToFirestore(summaryData);
        else {
          saveSummaryToSessionStorage(summaryData);
          fetchHistoryFromSessionStorage();
        }
      } catch (saveError) {
        console.error("Failed to save summary:", saveError);
        // Don't throw - let the user see their summary even if save fails
        setError(
          "Summary generated but failed to save to history: " +
            saveError.message,
        );
      }
    } catch (err) {
      // 8. Catch & Display Errors
      setError(err.message);
      console.error("API Error:", err);
    } finally {
      // 9. Cleanup
      setIsGenerating(false);
    }
  };

  // Delete summary
  const deleteSummary = async (id) => {
    try {
      if (user && !isGuest) {
        await deleteDoc(doc(db, "users", user.uid, "summaries", id));
      } else {
        const guestSummaries = JSON.parse(
          sessionStorage.getItem("guestSummaries") || "[]",
        );
        const updatedSummaries = guestSummaries.filter(
          (item) => item.id !== id,
        );
        sessionStorage.setItem(
          "guestSummaries",
          JSON.stringify(updatedSummaries),
        );
        setSummaryHistory(updatedSummaries);
      }
    } catch (err) {
      setError("Failed to delete summary");
      console.error("Error deleting summary:", err);
    }
  };

  // Load summary
  const loadSummary = (summaryItem) => {
    setOriginalNotes(summaryItem.originalContent || summaryItem.original || "");
    setSummaryOutput({
      summary: summaryItem.summarizedContent || summaryItem.summary,
      keyPoints: summaryItem.keyPoints || [],
      original: summaryItem.originalContent || summaryItem.original,
    });
    setError("");
  };

  const clearNotes = () => {
    setOriginalNotes("");
    setSummaryOutput(null);
    setCurrentNote(null);
    setError("");
  };

  useEffect(() => {
    if (authLoading) return;

    let unsubscribe;
    if (user && !isGuest) unsubscribe = fetchHistory();
    else fetchHistory();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isGuest, authLoading]);

  return (
    <NotesContext.Provider
      value={{
        originalNotes,
        setOriginalNotes,
        summaryOutput,
        setSummaryOutput,
        currentNote,
        setCurrentNote,
        isGenerating,
        isUploading,
        uploadProgress,
        summaryHistory,
        uploadedNotes,
        error,
        uploadFile,
        generateSummary,
        fetchHistory,
        deleteSummary,
        loadSummary,
        clearNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
