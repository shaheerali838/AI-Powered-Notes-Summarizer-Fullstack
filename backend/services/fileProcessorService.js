import mammoth from "mammoth";
// import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import { createWorker } from "tesseract.js";
import { formatError } from "../utils/responseFormatter.js";

// Configure PDF.js for Node.js environment
if (typeof globalThis === "undefined") {
  global.globalThis = global;
}

export class FileProcessorService {
  static async processFile(file) {
    const { buffer, mimetype, originalname } = file;

    try {
      switch (mimetype) {
        case "text/plain":
          return await this.processTextFile(buffer);

        case "application/pdf":
          return await this.processPdfFile(buffer);

        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          return await this.processDocxFile(buffer);

        case "image/jpeg":
        case "image/png":
        case "image/gif":
        case "image/bmp":
        case "image/webp":
          return await this.processImageFile(buffer);

        default:
          throw formatError(`Unsupported file type: ${mimetype}`, 400);
      }
    } catch (error) {
      console.error(`File processing error for ${originalname}:`, error);
      throw formatError(`Failed to process file: ${error.message}`, 500);
    }
  }

  static async processTextFile(buffer) {
    try {
      const text = buffer.toString("utf-8");
      return text.trim();
    } catch (error) {
      throw formatError("Failed to read text file", 500);
    }
  }

  static async processPdfFile(buffer) {
    try {
      const uint8Array = new Uint8Array(buffer);
      const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      return fullText.trim();
    } catch (error) {
      console.error("PDF processing error:", error);
      throw formatError("Failed to extract text from PDF", 500);
    }
  }

  static async processDocxFile(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    } catch (error) {
      console.error("DOCX processing error:", error);
      throw formatError("Failed to extract text from DOCX file", 500);
    }
  }

  static async processImageFile(buffer) {
    let worker;
    try {
      worker = await createWorker("eng");
      const {
        data: { text },
      } = await worker.recognize(buffer);
      return text.trim();
    } catch (error) {
      console.error("OCR processing error:", error);
      throw formatError("Failed to extract text from image using OCR", 500);
    } finally {
      if (worker) {
        await worker.terminate();
      }
    }
  }
}
