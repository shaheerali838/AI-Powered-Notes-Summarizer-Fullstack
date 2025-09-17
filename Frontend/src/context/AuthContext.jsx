// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
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
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'signup'

  const googleProvider = new GoogleAuthProvider();
  const facebookProvider = new FacebookAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setIsGuest(user.isAnonymous);

        // Create user document if it doesn't exist
        if (!user.isAnonymous) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, "users", user.uid), {
              email: user.email,
              displayName: user.displayName,
              createdAt: new Date(),
            });
          }
        }
      } else {
        setUser(null);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      return result.user;
    } catch (error) {
      console.error("Facebook sign in error:", error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Email sign in error:", error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update profile with display name
      await updateProfile(result.user, { displayName });

      // Create user document in Firestore
      await setDoc(doc(db, "users", result.user.uid), {
        email,
        displayName,
        createdAt: new Date(),
      });

      return result.user;
    } catch (error) {
      console.error("Email sign up error:", error);
      throw error;
    }
  };

  const continueAsGuest = async () => {
    try {
      const result = await signInAnonymously(auth);
      setIsGuest(true);
      return result.user;
    } catch (error) {
      console.error("Guest sign in error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsGuest(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const value = {
    user,
    loading,
    isGuest,
    authModalOpen,
    authMode,
    signInWithGoogle,
    signInWithFacebook,
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
