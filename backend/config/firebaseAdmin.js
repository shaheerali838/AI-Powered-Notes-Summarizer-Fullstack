import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let isInitialized = false;
let dbInstance = null;

function initializeFirebase() {
  if (isInitialized) {
    return dbInstance;
  }

  if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_PROJECT_ID) {
    console.warn(
      "⚠️ Firebase Admin credentials not fully configured in .env. Server-side Firestore history will be disabled (client Firestore remains active)."
    );
    isInitialized = true;
    return null;
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
    isInitialized = true;
    return null;
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
      console.warn("⚠️ Firebase Admin initialization failed:", error.message);
      isInitialized = true;
      return null;
    }
  }

  try {
    dbInstance = admin.firestore();
  } catch (err) {
    console.warn("⚠️ Firestore instance creation failed:", err.message);
  }

  isInitialized = true;
  return dbInstance;
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
  return admin.apps.length ? admin : null;
}

export { getAdmin as admin, getDb as db };
