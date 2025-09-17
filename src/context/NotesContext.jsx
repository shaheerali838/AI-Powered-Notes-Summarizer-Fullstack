import { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../config/firebase';

const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within NotesProvider");
  return context;
};

export const NotesProvider = ({ children }) => {
  const { user, isGuest } = useAuth();
  const [originalNotes, setOriginalNotes] = useState("");
  const [summaryOutput, setSummaryOutput] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryHistory, setSummaryHistory] = useState([]);
  const [error, setError] = useState("");

  // Mock AI summarization function
  const mockSummarize = (text) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        let summary = '';
        
        if (sentences.length <= 3) {
          summary = text;
        } else {
          const firstSentence = sentences[0];
          const middleSentence = sentences[Math.floor(sentences.length / 2)];
          const lastSentence = sentences[sentences.length - 1];
          
          summary = `${firstSentence.trim()}. ${middleSentence.trim()}. ${lastSentence.trim()}.`;
        }
        
        // Generate key points
        const words = text.split(' ').filter(w => w.length > 3);
        const keyPoints = [];
        for (let i = 0; i < Math.min(5, Math.floor(words.length / 10)); i++) {
          const startIdx = Math.floor(Math.random() * (words.length - 5));
          keyPoints.push(`${i + 1}. ${words.slice(startIdx, startIdx + 5).join(' ')}...`);
        }
        
        resolve({
          summary,
          keyPoints
        });
      }, 2000);
    });
  };

  // Generate summary
  const generateSummary = async () => {
    if (!originalNotes.trim()) {
      setError("Please enter some text to summarize");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const result = await mockSummarize(originalNotes);
      
      setSummaryOutput({
        summary: result.summary,
        keyPoints: result.keyPoints || [],
        original: originalNotes,
      });

      // Save to history if user is authenticated
      if (user && !isGuest) {
        await saveToHistory({
          original: originalNotes,
          summary: result.summary,
          keyPoints: result.keyPoints || [],
          fileType: 'text',
          timestamp: new Date(),
        });
      } else {
        // Add to session history for guests
        addToSessionHistory({
          id: Date.now().toString(),
          original: originalNotes,
          summary: result.summary,
          keyPoints: result.keyPoints || [],
          fileType: 'text',
          timestamp: new Date(),
        });
      }
    } catch (err) {
      setError(err.message);
      console.error("Summarization Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save to Firestore for authenticated users
  const saveToHistory = async (summaryData) => {
    try {
      const docRef = await addDoc(collection(db, 'summaries'), {
        ...summaryData,
        userId: user.uid,
        timestamp: summaryData.timestamp,
      });
      
      const newSummary = {
        id: docRef.id,
        ...summaryData,
      };
      
      setSummaryHistory(prev => [newSummary, ...prev]);
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  };

  // Add to session history for guests
  const addToSessionHistory = (summaryData) => {
    setSummaryHistory(prev => [summaryData, ...prev]);
  };

  // Fetch history from Firestore
  const fetchHistory = async () => {
    if (!user || isGuest) {
      setSummaryHistory([]);
      return;
    }
    
    try {
      const q = query(
        collection(db, 'summaries'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const history = [];
      
      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      setSummaryHistory(history);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  // Delete summary
  const deleteSummary = async (id) => {
    try {
      if (user && !isGuest) {
        await deleteDoc(doc(db, 'summaries', id));
      }
      setSummaryHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error deleting summary:", err);
    }
  };

  // Load summary from history
  const loadSummary = (historyItem) => {
    setOriginalNotes(historyItem.original);
    setSummaryOutput({
      summary: historyItem.summary,
      keyPoints: historyItem.keyPoints || [],
      original: historyItem.original,
    });
  };

  const clearNotes = () => {
    setOriginalNotes("");
    setSummaryOutput(null);
    setError("");
  };

  // Fetch history when user changes
  useEffect(() => {
    if (user) {
      fetchHistory();
    } else {
      setSummaryHistory([]);
    }
  }, [user, isGuest]);

  return (
    <NotesContext.Provider
      value={{
        originalNotes,
        setOriginalNotes,
        summaryOutput,
        setSummaryOutput,
        isGenerating,
        summaryHistory,
        error,
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