import path from "path";

/**
 * Extract text from Plain Text / Markdown / CSV / RTF / JSON buffer
 */
export const extractTextFromPlainText = (buffer) => {
  try {
    const raw = buffer.toString("utf-8");
    // Strip simple RTF header tokens if present
    if (raw.startsWith("{\\rtf")) {
      return raw.replace(/\\([a-z]{1,32}[0-9]*|'[\da-f]{2}|[\r\n\t ])|[{}\\]/gi, " ");
    }
    return raw;
  } catch (error) {
    throw new Error(`Text extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from PDF buffer
 */
export const extractTextFromPDF = async (buffer) => {
  try {
    const { default: pdf } = await import("pdf-parse-debugging-disabled");
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    throw new Error(`PDF extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from DOCX buffer
 */
export const extractTextFromDOCX = async (buffer) => {
  try {
    const { default: mammoth } = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error(`DOCX extraction failed: ${error.message}`);
  }
};

/**
 * Extract text from image buffer using OCR
 */
export const extractTextFromImage = async (buffer) => {
  let worker;
  try {
    const { createWorker } = await import("tesseract.js");
    worker = await createWorker("eng", 1, {
      corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@v5/tesseract-core.wasm.js",
    });
    const {
      data: { text },
    } = await worker.recognize(buffer);
    return text.trim();
  } catch (error) {
    throw new Error(`OCR extraction failed: ${error.message}`);
  } finally {
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        console.error("Error terminating OCR worker:", e);
      }
    }
  }
};

/**
 * Main text extraction function that routes to appropriate extractor
 */
export const extractTextFromFile = async (file) => {
  const { buffer, mimetype = "", originalname = "" } = file;
  const ext = path.extname(originalname).toLowerCase();

  try {
    let extractedText = "";

    if (mimetype === "application/pdf" || ext === ".pdf") {
      extractedText = await extractTextFromPDF(buffer);
    } else if (
      mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimetype === "application/msword" ||
      ext === ".docx" ||
      ext === ".doc"
    ) {
      extractedText = await extractTextFromDOCX(buffer);
    } else if (mimetype.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tiff"].includes(ext)) {
      extractedText = await extractTextFromImage(buffer);
    } else if (
      mimetype.startsWith("text/") ||
      mimetype === "application/json" ||
      mimetype === "application/rtf" ||
      [".txt", ".md", ".rtf", ".csv", ".tsv", ".log", ".json"].includes(ext)
    ) {
      extractedText = extractTextFromPlainText(buffer);
    } else {
      // Fallback attempt text decoding
      extractedText = extractTextFromPlainText(buffer);
    }

    // Clean up whitespace while preserving paragraphs
    extractedText = extractedText.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();

    if (!extractedText || extractedText.length < 5) {
      throw new Error("No readable text could be extracted from this file.");
    }

    return extractedText;
  } catch (error) {
    console.error(`Text extraction error for ${originalname}:`, error);
    throw error;
  }
};

/**
 * Get file type description for response
 */
export const getFileTypeDescription = (mimetype, originalname = "") => {
  const ext = path.extname(originalname).toLowerCase();
  if (mimetype === "application/pdf" || ext === ".pdf") return "PDF";
  if (
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimetype === "application/msword" ||
    ext === ".docx" ||
    ext === ".doc"
  )
    return "DOCX";
  if (mimetype.startsWith("image/") || [".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"].includes(ext))
    return "Image";
  if (
    mimetype.startsWith("text/") ||
    [".txt", ".md", ".rtf", ".csv", ".tsv", ".log", ".json"].includes(ext)
  )
    return "Text Document";
  return "Document";
};
