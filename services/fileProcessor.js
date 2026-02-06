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
        console.error("Error terminating worker:", e);
      }
    }
  }
};

/**
 * Main text extraction function that routes to appropriate extractor
 */
export const extractTextFromFile = async (file) => {
  const { buffer, mimetype, originalname } = file;

  try {
    let extractedText = "";

    if (mimetype === "application/pdf") {
      extractedText = await extractTextFromPDF(buffer);
    } else if (
      mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      extractedText = await extractTextFromDOCX(buffer);
    } else if (mimetype.startsWith("image/")) {
      extractedText = await extractTextFromImage(buffer);
    } else {
      throw new Error("Unsupported file type");
    }

    // Clean up extracted text
    extractedText = extractedText.replace(/\s+/g, " ").trim();

    if (!extractedText || extractedText.length < 10) {
      throw new Error("No meaningful text could be extracted from the file");
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
export const getFileTypeDescription = (mimetype) => {
  if (mimetype === "application/pdf") return "PDF";
  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "DOCX";
  if (mimetype.startsWith("image/")) return "Image";
  return "Unknown";
};
