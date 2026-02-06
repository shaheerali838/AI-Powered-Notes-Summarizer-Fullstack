import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let isInitialized = false;
let dbInstance = null;

function initializeFirebase() {
  if (isInitialized) {
    return;
  }

  if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_PROJECT_ID) {
    console.error(
      "❌ MISSING ENV VARIABLES: Check FIREBASE_PRIVATE_KEY and FIREBASE_PROJECT_ID in your .env file."
    );
    throw new Error("Firebase credentials not configured");
  }

  let privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (privateKey) {
    if (
      (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
      (privateKey.startsWith("'") && privateKey.endsWith("'"))
    ) {
      privateKey = privateKey.slice(1, -1);
    }
  } else {
    console.error("❌ FIREBASE_PRIVATE_KEY is missing or empty.");
    throw new Error("Firebase private key not configured");
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
      throw error;
    }
  }

  dbInstance = admin.firestore();
  isInitialized = true;
}

function getDb() {
  if (!isInitialized) {
    initializeFirebase();
  }
  return dbInstance;
}

function getAdmin() {
  if (!isInitialized) {
    initializeFirebase();
  }
  return admin;
}

export { getAdmin as admin, getDb as db };
