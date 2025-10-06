const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

admin.initializeApp();

const { summarizeText } = require("./handlers/summarize");
const { uploadFile } = require("./handlers/upload");

exports.api = functions
  .runWith({
    timeoutSeconds: 540,
    memory: "2GB",
  })
  .https.onRequest(async (req, res) => {
    cors(req, res, async () => {
      if (req.method === "OPTIONS") {
        res.status(200).send();
        return;
      }

      const path = req.path || req.url;

      if (path === "/summarize" || path === "/api/summarize") {
        await handleSummarize(req, res);
      } else if (path === "/notes/upload" || path === "/api/notes/upload") {
        await handleUpload(req, res);
      } else {
        res.status(404).json({ error: "Endpoint not found", path });
      }
    });
  });

async function handleSummarize(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Invalid text input" });
      return;
    }

    if (text.trim().length === 0) {
      res.status(400).json({ error: "Text cannot be empty" });
      return;
    }

    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
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

async function handleUpload(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    let userId = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
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

    res.status(200).json(result);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      error: "Failed to process file",
      message: error.message,
    });
  }
}
