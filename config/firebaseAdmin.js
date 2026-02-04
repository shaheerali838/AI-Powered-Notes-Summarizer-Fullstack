import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// check if keys exist before trying to use them
if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_PROJECT_ID) {
  console.error(
    "❌ MISSING ENV VARIABLES: Check FIREBASE_PRIVATE_KEY and FIREBASE_PROJECT_ID in your .env file."
  );
  // Don't crash hard, but warn explicitly
}

// Handle private key:
// 1. Replace literal \n with actual newlines
// 2. Remove surrounding quotes (common Vercel/env issue)
let privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (privateKey) {
  // Remove starting/ending quotes if they exist (e.g. "key" or 'key')
  if (
    (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
    (privateKey.startsWith("'") && privateKey.endsWith("'"))
  ) {
    privateKey = privateKey.slice(1, -1);
  }
} else {
  console.error("❌ FIREBASE_PRIVATE_KEY is missing or empty.");
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error.message);
    // process.exit(1); // Don't crash the server, just log error
  }
}

// Export db safely - might be undefined if init failed
const db = admin.apps.length ? admin.firestore() : null;

export { admin, db };
