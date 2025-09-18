// src/config/firebaseClient.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDNzDcVZEIeJAA0Q5PaBgX0znhV5D__XMw",
  authDomain: "ai-notes-summarize.firebaseapp.com",
  projectId: "ai-notes-summarize",
  storageBucket: "ai-notes-summarize.firebasestorage.app",
  messagingSenderId: "696698406364",
  appId: "1:696698406364:web:0966bce6c1b80dd0f87b19",
  measurementId: "G-F84DDJYG12",
};

// Initialize app only once
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);

// Configure auth providers
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Configure Google provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Configure Facebook provider
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

export default app;
