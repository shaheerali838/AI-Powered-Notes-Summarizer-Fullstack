import { createWorker } from "tesseract.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!req.file && !req.body.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const buffer = req.file ? req.file.buffer : Buffer.from(req.body.file, "base64");

    const worker = await createWorker("eng");
    const {
      data: { text },
    } = await worker.recognize(buffer);
    await worker.terminate();

    res.status(200).json({ text });
  } catch (err) {
    console.error("OCR error:", err);
    res.status(500).json({ error: "Failed to process OCR", details: err.message });
  }
}
