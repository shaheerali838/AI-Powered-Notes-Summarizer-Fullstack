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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          setIsGuest(currentUser.isAnonymous);

          if (!currentUser.isAnonymous) {
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
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  };

  const signUpWithEmail = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(result.user, { displayName });
    await setDoc(doc(db, "users", result.user.uid), {
      email,
      displayName: displayName || "",
      createdAt: new Date(),
      lastLoginAt: new Date(),
    });
    return result.user;
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
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
    return result.user;
  };

  const signInWithFacebook = async () => {
    const result = await signInWithPopup(auth, facebookProvider);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
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
