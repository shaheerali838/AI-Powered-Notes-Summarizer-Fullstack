const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors");

admin.initializeApp();

const { summarizeText } = require("./handlers/summarize");
const { uploadFile } = require("./handlers/upload");

// ✅ Allow your frontend domain + localhost for development
const allowedOrigins = [
  "https://ai-powered-notes-summarizer.vercel.app",
  "http://localhost:5173",
];

const corsHandler = cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

exports.api = functions
  .runWith({
    timeoutSeconds: 540,
    memory: "2GB",
  })
  .https.onRequest(async (req, res) => {
    const origin = req.headers.origin;

    // ✅ Handle preflight (OPTIONS) request immediately
    if (req.method === "OPTIONS") {
      if (allowedOrigins.includes(origin)) {
        res.set("Access-Control-Allow-Origin", origin);
      }
      res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.set("Access-Control-Allow-Credentials", "true");
      res.status(204).send("");
      return;
    }

    // ✅ All other requests go through corsHandler
    corsHandler(req, res, async () => {
      try {
        const path = req.path || req.url;

        if (path === "/summarize" || path === "/api/summarize") {
          await handleSummarize(req, res, origin);
        } else if (path === "/notes/upload" || path === "/api/notes/upload") {
          await handleUpload(req, res, origin);
        } else {
          res.status(404).json({ error: "Endpoint not found", path });
        }
      } catch (err) {
        console.error("API Error:", err);
        res.status(500).json({
          error: "Internal server error",
          message: err.message,
        });
      }
    });
  });

// ✅ Summarization handler
async function handleSummarize(req, res, origin) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      res.status(400).json({ error: "Invalid or empty text input" });
      return;
    }

    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error("Token verification failed:", error);
      }
    }

    const result = await summarizeText(text);

    if (userId) {
      try {
        await admin
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("summaries")
          .add({
            originalContent: text,
            summarizedContent: result.summary,
            keyPoints: result.keyPoints,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            wordCount: text.split(" ").length,
          });
      } catch (dbError) {
        console.error("Error saving to Firestore:", dbError);
      }
    }

    if (allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }

    res.status(200).json({
      original: text,
      summary: result.summary,
      keyPoints: result.keyPoints,
    });
  } catch (error) {
    console.error("Summarization error:", error);
    res.status(500).json({
      error: "Failed to generate summary",
      message: error.message,
    });
  }
}

// ✅ Upload handler
async function handleUpload(req, res, origin) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error("Token verification failed:", error);
      }
    }

    const result = await uploadFile(req);

    if (userId && result.extractedText) {
      try {
        await admin
          .firestore()
          .collection("users")
          .doc(userId)
          .collection("summaries")
          .add({
            originalContent: result.extractedText,
            summarizedContent: result.summary,
            keyPoints: result.keyPoints || [],
            filename: result.filename,
            fileType: result.fileType,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
      } catch (dbError) {
        console.error("Error saving to Firestore:", dbError);
      }
    }

    if (allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: "Failed to process file",
      message: error.message,
    });
  }
}
