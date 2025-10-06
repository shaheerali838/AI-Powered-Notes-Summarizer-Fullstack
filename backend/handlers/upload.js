const Busboy = require("busboy");
const path = require("path");
const os = require("os");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const { summarizeText } = require("./summarize");

const SUPPORTED_FILE_TYPES = {
  text: [".txt", ".md", ".rtf"],
  pdf: [".pdf"],
  image: [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
  document: [".docx"],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

async function uploadFile(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();
    let fileData = null;

    busboy.on("file", (fieldname, file, info) => {
      const { filename, mimeType } = info;
      const extension = path.extname(filename).toLowerCase();

      const filepath = path.join(tmpdir, filename);
      const writeStream = fs.createWriteStream(filepath);

      let fileSize = 0;
      file.on("data", (data) => {
        fileSize += data.length;
        if (fileSize > MAX_FILE_SIZE) {
          file.resume();
          reject(new Error("File size exceeds 10MB limit"));
          return;
        }
      });

      file.pipe(writeStream);

      writeStream.on("finish", () => {
        fileData = {
          filepath,
          filename,
          extension,
          mimeType,
          fileSize,
        };
      });

      writeStream.on("error", (error) => {
        reject(error);
      });
    });

    busboy.on("finish", async () => {
      if (!fileData) {
        reject(new Error("No file uploaded"));
        return;
      }

      try {
        const extractedText = await extractTextFromFile(fileData);

        let summary = "";
        let keyPoints = [];

        if (extractedText && extractedText.trim().length > 0) {
          const summaryResult = await summarizeText(extractedText);
          summary = summaryResult.summary;
          keyPoints = summaryResult.keyPoints;
        }

        fs.unlinkSync(fileData.filepath);

        resolve({
          filename: fileData.filename,
          extractedText,
          summary,
          keyPoints,
          fileType: fileData.mimeType,
          fileSize: fileData.fileSize,
        });
      } catch (error) {
        if (fs.existsSync(fileData.filepath)) {
          fs.unlinkSync(fileData.filepath);
        }
        reject(error);
      }
    });

    busboy.on("error", (error) => {
      reject(error);
    });

    req.pipe(busboy);
  });
}

async function extractTextFromFile(fileData) {
  const { filepath, extension } = fileData;

  try {
    if (SUPPORTED_FILE_TYPES.text.includes(extension)) {
      return await extractTextFromTextFile(filepath);
    } else if (SUPPORTED_FILE_TYPES.pdf.includes(extension)) {
      return await extractTextFromPdf(filepath);
    } else if (SUPPORTED_FILE_TYPES.image.includes(extension)) {
      return await extractTextFromImage(filepath);
    } else if (SUPPORTED_FILE_TYPES.document.includes(extension)) {
      return await extractTextFromDocx(filepath);
    } else {
      throw new Error(`Unsupported file type: ${extension}`);
    }
  } catch (error) {
    console.error("Text extraction error:", error);
    throw new Error(`Failed to extract text from file: ${error.message}`);
  }
}

async function extractTextFromTextFile(filepath) {
  const text = fs.readFileSync(filepath, "utf8");
  return text.trim();
}

async function extractTextFromPdf(filepath) {
  const dataBuffer = fs.readFileSync(filepath);
  const data = await pdfParse(dataBuffer);
  return data.text.trim();
}

async function extractTextFromImage(filepath) {
  try {
    const processedImagePath = filepath + "_processed.png";

    await sharp(filepath)
      .grayscale()
      .normalise()
      .sharpen()
      .toFile(processedImagePath);

    const result = await Tesseract.recognize(processedImagePath, "eng", {
      logger: (m) => console.log(m),
    });

    if (fs.existsSync(processedImagePath)) {
      fs.unlinkSync(processedImagePath);
    }

    return result.data.text.trim();
  } catch (error) {
    console.error("OCR error:", error);
    throw new Error("Failed to extract text from image");
  }
}

async function extractTextFromDocx(filepath) {
  const result = await mammoth.extractRawText({ path: filepath });
  return result.value.trim();
}

module.exports = { uploadFile };
