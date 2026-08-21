import multer from "multer";
import path from "path";

// Configure storage in memory
const storage = multer.memoryStorage();

// Allowed file extensions and mimetypes
const ALLOWED_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".rtf",
  ".csv",
  ".tsv",
  ".log",
  ".json",
  ".pdf",
  ".docx",
  ".doc",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".bmp",
  ".tiff",
  ".webp",
]);

const ALLOWED_MIMETYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/rtf",
  "application/rtf",
  "text/tab-separated-values",
  "application/json",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/webp",
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mimetype = file.mimetype;

  if (ALLOWED_MIMETYPES.has(mimetype) || ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type (${ext || mimetype}). Supported types: PDF, DOCX, TXT, MD, RTF, CSV, Images.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
});

export const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File size too large. Maximum allowed size is 15MB.",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        error: "Unexpected file field name in upload request.",
      });
    }
  }

  if (error && error.message) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  return res.status(500).json({
    success: false,
    error: "File upload failed.",
  });
};

export const uploadFile = upload.single("file");
