import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDNzDcVZEIeJAA0Q5PaBgX0znhV5D__XMw",
  authDomain: "ai-notes-summarize.firebaseapp.com",
  projectId: "ai-notes-summarize",
  storageBucket: "ai-notes-summarize.firebasestorage.app",
  messagingSenderId: "696698406364",
  appId: "1:696698406364:web:0966bce6c1b80dd0f87b19",
  measurementId: "G-F84DDJYG12",
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default app;
