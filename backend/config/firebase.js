import admin from 'firebase-admin';
import { config } from './config.js';

let firebaseApp;

try {
  // Initialize Firebase Admin SDK
  if (!admin.apps.length) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
      projectId: config.firebase.projectId,
    });
  } else {
    firebaseApp = admin.app();
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Continue without Firebase for development
  firebaseApp = null;
}

export const auth = firebaseApp ? admin.auth() : null;
export const db = firebaseApp ? admin.firestore() : null;

export default firebaseApp;