// src/utils/fileProcessor.js
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const SUPPORTED_FILE_TYPES = {
  text: [".txt", ".md", ".rtf"],
  pdf: [".pdf"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
  document: [".docx"],
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const validateFile = (file) => {
  const errors = [];

  if (file.size > MAX_FILE_SIZE) {
    errors.push(
      `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }

  const extension = "." + file.name.split(".").pop().toLowerCase();
  const allSupportedTypes = [
    ...SUPPORTED_FILE_TYPES.text,
    ...SUPPORTED_FILE_TYPES.pdf,
    ...SUPPORTED_FILE_TYPES.image,
    ...SUPPORTED_FILE_TYPES.document,
  ];

  if (!allSupportedTypes.includes(extension)) {
    errors.push(`File type ${extension} is not supported`);
  }

  return errors;
};

export const processFile = async (file, onProgress = () => {}) => {
  const extension = "." + file.name.split(".").pop().toLowerCase();

  try {
    onProgress(10);

    if (SUPPORTED_FILE_TYPES.text.includes(extension)) {
      const text = await processTextFile(file, onProgress);
      return { text, fileType: "text" };
    } else if (SUPPORTED_FILE_TYPES.pdf.includes(extension)) {
      const text = await processPdfFile(file, onProgress);
      return { text, fileType: "pdf" };
    } else if (SUPPORTED_FILE_TYPES.image.includes(extension)) {
      const text = await processImageFile(file, onProgress);
      return { text, fileType: "image" };
    } else if (SUPPORTED_FILE_TYPES.document.includes(extension)) {
      const text = await processDocxFile(file, onProgress);
      return { text, fileType: "document" };
    }

    throw new Error(`Unsupported file type: ${extension}`);
  } catch (error) {
    console.error("File processing error:", error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
};

const processTextFile = async (file, onProgress) => {
  onProgress(50);
  const text = await file.text();
  onProgress(100);
  return text;
};

const processPdfFile = async (file, onProgress) => {
  const arrayBuffer = await file.arrayBuffer();
  onProgress(30);

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
    onProgress(30 + (i / pdf.numPages) * 60);
  }

  onProgress(100);
  return fullText.trim();
};

const processImageFile = async (file, onProgress) => {
  onProgress(30);

  const formData = new FormData();
  formData.append("file", file);

  // Use Firebase Cloud Functions or configured API URL
  const rawApiUrl = import.meta.env.VITE_APP_API_URL || "/api";
  const API_URL = rawApiUrl.replace(/\/+$/, "");

  // Send image to backend upload endpoint which handles OCR and returns extractedText
  const res = await fetch(`${API_URL}/notes/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  onProgress(100);

  if (!res.ok) {
    // backend may return { error: "..." } or a message field
    const message =
      data.message || data.error || `Upload failed with status ${res.status}`;
    throw new Error(message);
  }

  // upload handler returns `extractedText` when successful
  const extracted = data.extractedText || data.text || "";
  return extracted.trim();
};

const processDocxFile = async (file, onProgress) => {
  const arrayBuffer = await file.arrayBuffer();
  onProgress(50);

  const result = await mammoth.extractRawText({ arrayBuffer });
  onProgress(100);

  return result.value;
};

export const processMultipleFiles = async (files, onProgress = () => {}) => {
  const results = [];
  const totalFiles = files.length;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileProgress = (progress) => {
      const overallProgress = (i / totalFiles) * 100 + progress / totalFiles;
      onProgress(Math.round(overallProgress));
    };

    try {
      const text = await processFile(file, fileProgress);
      results.push({
        fileName: file.name,
        text: text,
        success: true,
      });
    } catch (error) {
      results.push({
        fileName: file.name,
        error: error.message,
        success: false,
      });
    }
  }

  return results;
};
