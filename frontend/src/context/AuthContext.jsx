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
import {
  auth,
  db,
  googleProvider,
  facebookProvider,
} from "../config/firebaseClient";

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
  const [authMode, setAuthMode] = useState("login");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setLoading(true);
        if (currentUser) {
          setUser(currentUser);
          setIsGuest(currentUser.isAnonymous);

          // Only create/update user record if not anonymous
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
                await setDoc(
                  userRef,
                  { lastLoginAt: new Date() },
                  { merge: true }
                );
              }
            } catch (dbError) {
              console.error("Database error:", dbError);
              // Don't block auth if DB fails
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
      console.error("Error signing in with email:", error);
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
      if (displayName && result.user) {
        try {
          await updateProfile(result.user, { displayName });
        } catch (profileErr) {
          console.warn("Could not update profile displayName:", profileErr);
        }
      }
      try {
        await setDoc(doc(db, "users", result.user.uid), {
          email,
          displayName: displayName || "",
          createdAt: new Date(),
          lastLoginAt: new Date(),
        });
      } catch (dbErr) {
        console.warn("Could not create user document in Firestore:", dbErr);
      }
      return result.user;
    } catch (error) {
      console.error("Error signing up with email:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Add error handling for popup closed by user
      if (!result) throw new Error("Popup closed by user");

      try {
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            provider: "google",
            createdAt: new Date(),
            lastLoginAt: new Date(),
          });
        } else {
          await setDoc(userRef, { lastLoginAt: new Date() }, { merge: true });
        }
      } catch (dbError) {
        console.error("Error saving user data:", dbError);
        // Continue even if DB operation fails
      }

      return result.user;
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Popup closed before completing sign-in");
      }
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);

      try {
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            provider: "facebook",
            createdAt: new Date(),
            lastLoginAt: new Date(),
          });
        } else {
          await setDoc(userRef, { lastLoginAt: new Date() }, { merge: true });
        }
      } catch (dbError) {
        console.error("Error saving user data:", dbError);
      }

      return result.user;
    } catch (error) {
      console.error("Error signing in with Facebook:", error);
      throw error;
    }
  };

  const continueAsGuest = async () => {
    try {
      const result = await signInAnonymously(auth);
      setIsGuest(true);
      return result.user;
    } catch (error) {
      console.error("Error continuing as guest:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsGuest(false);
    } catch (error) {
      console.error("Error logging out:", error);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        authModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithFacebook,
        continueAsGuest,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
