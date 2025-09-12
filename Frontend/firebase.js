// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNzDcVZEIeJAA0Q5PaBgX0znhV5D__XMw",
  authDomain: "ai-notes-summarize.firebaseapp.com",
  projectId: "ai-notes-summarize",
  storageBucket: "ai-notes-summarize.firebasestorage.app",
  messagingSenderId: "696698406364",
  appId: "1:696698406364:web:0966bce6c1b80dd0f87b19",
  measurementId: "G-F84DDJYG12",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
