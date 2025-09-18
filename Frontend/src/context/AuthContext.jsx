// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider, facebookProvider } from "../config/firebaseClient";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
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
            try {
              const userRef = doc(db, "users", currentUser.uid);
              const userSnap = await getDoc(userRef);

              if (!userSnap.exists()) {
                await setDoc(userRef, {
                  email: currentUser.email,
                  displayName: currentUser.displayName || "",
                  photoURL: currentUser.photoURL || "",
                  createdAt: new Date(),
                  lastLoginAt: new Date(),
                });
              } else {
                // Update last login
                await setDoc(userRef, {
                  lastLoginAt: new Date(),
                }, { merge: true });
              }
            } catch (firestoreError) {
              console.error("Firestore operation failed:", firestoreError);
              // Don't throw here, allow user to continue
            }
          }
        } else {
          setUser(null);
          setIsGuest(false);
        }
      } catch (err) {
        console.error("Auth state change error:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Email sign-in error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      // Create Firestore user doc
      try {
        await setDoc(doc(db, "users", result.user.uid), {
          email,
          displayName: displayName || "",
          createdAt: new Date(),
          lastLoginAt: new Date(),
        });
      } catch (firestoreError) {
        console.error("Failed to create user document:", firestoreError);
        // Don't throw here, user account was created successfully
      }

      return result.user;
    } catch (error) {
      console.error("Email sign-up error:", error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create user document if it doesn't exist
      try {
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            provider: 'google',
            createdAt: new Date(),
            lastLoginAt: new Date(),
          });
        } else {
          await setDoc(userRef, {
            lastLoginAt: new Date(),
          }, { merge: true });
        }
      } catch (firestoreError) {
        console.error("Firestore operation failed:", firestoreError);
        // Don't throw here, user is signed in successfully
      }
      
      return result.user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Sign-in was cancelled");
      }
      throw new Error("Failed to sign in with Google");
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      
      // Create user document if it doesn't exist
      try {
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            provider: 'facebook',
            createdAt: new Date(),
            lastLoginAt: new Date(),
          });
        } else {
          await setDoc(userRef, {
            lastLoginAt: new Date(),
          }, { merge: true });
        }
      } catch (firestoreError) {
        console.error("Firestore operation failed:", firestoreError);
        // Don't throw here, user is signed in successfully
      }
      
      return result.user;
    } catch (error) {
      console.error("Facebook sign-in error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Sign-in was cancelled");
      }
      throw new Error("Failed to sign in with Facebook");
    }
  };

  const continueAsGuest = async () => {
    try {
      const result = await signInAnonymously(auth);
      setIsGuest(true);
      return result.user;
    } catch (error) {
      console.error("Anonymous sign-in error:", error);
      throw new Error("Failed to continue as guest");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsGuest(false);
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Failed to log out");
    }
  };

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const changeAuthMode = (mode) => {
    setAuthMode(mode);
  };

  // Helper function to convert Firebase error codes to user-friendly messages
  const getAuthErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return 'An error occurred. Please try again';
    }
  };

  const value = {
    user,
    loading,
    isGuest,
    authModalOpen,
    authMode,
    setAuthMode: changeAuthMode,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    continueAsGuest,
    logout,
    openAuthModal,
    closeAuthModal,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};