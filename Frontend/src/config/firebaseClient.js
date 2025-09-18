import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNzDcVZEIeJAA0Q5PaBgX0znhV5D__XMw",
  authDomain: "ai-notes-summarize.firebaseapp.com",
  projectId: "ai-notes-summarize",
  storageBucket: "ai-notes-summarize.appspot.com",
  messagingSenderId: "696698406364",
  appId: "1:696698406364:web:0966bce6c1b80dd0f87b19",
};

// Initialize Firebase only once
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Providers with proper configuration
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.setCustomParameters({
  display: "popup",
});

export default app;
