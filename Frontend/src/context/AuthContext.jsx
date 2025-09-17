// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config/firebaseClient";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // 'login' | 'signup'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          setIsGuest(currentUser.isAnonymous);

          // Create user doc if not anonymous
          if (!currentUser.isAnonymous) {
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
              await setDoc(userRef, {
                email: currentUser.email,
                displayName: currentUser.displayName || "",
                createdAt: new Date(),
              });
            }
          }
        } else {
          setUser(null);
          setIsGuest(false);
        }
      } catch (err) {
        console.error("🔥 Firestore error in AuthContext:", err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const signUpWithEmail = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });

    // Create Firestore user doc
    await setDoc(doc(db, "users", result.user.uid), {
      email,
      displayName,
      createdAt: new Date(),
    });

    return result.user;
  };

  const continueAsGuest = async () => {
    const result = await signInAnonymously(auth);
    setIsGuest(true);
    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
    setIsGuest(false);
  };

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => setAuthModalOpen(false);

  const value = {
    user,
    loading,
    isGuest,
    authModalOpen,
    authMode,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
    logout,
    openAuthModal,
    closeAuthModal,
    isAuthenticated: !!user || isGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
