// src/utils/fileProcessor.js

export const SUPPORTED_FILE_TYPES = {
  text: [".txt", ".md", ".rtf", ".csv", ".tsv", ".log", ".json"],
  pdf: [".pdf"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".tiff"],
  document: [".docx", ".doc"],
};

export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

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
    errors.push(`File type ${extension} is not supported. Supported: PDF, DOCX, TXT, MD, Images`);
  }

  return errors;
};
