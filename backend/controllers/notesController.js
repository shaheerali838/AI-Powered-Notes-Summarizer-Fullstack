/**
 * Handle file upload and processing
 */
export const uploadFileController = async (req, res) => {
  try {
    if (!req.file) {
      const { formatErrorResponse } = await import(
        "../utils/responseFormatter.js"
      );
      return res
        .status(400)
        .json(formatErrorResponse("No file uploaded", 400));
    }

    const { tone = "academic", length = "balanced", model } = req.body || {};

    const [
      { extractTextFromFile, getFileTypeDescription },
      { summarizeWithGemini },
      { saveSummary },
      { formatFileUploadResponse, formatErrorResponse },
    ] = await Promise.all([
      import("../services/fileProcessor.js"),
      import("../services/summarizerService.js"),
      import("../services/historyServices.js"),
      import("../utils/responseFormatter.js"),
    ]);

    const { originalname, mimetype, size } = req.file;

    console.log(
      `📁 Processing file: ${originalname} (${getFileTypeDescription(
        mimetype,
        originalname
      )}, ${(size / 1024 / 1024).toFixed(2)}MB)`
    );

    let extractedText;
    try {
      extractedText = await extractTextFromFile(req.file);
      console.log(`✅ Text extracted: ${extractedText.length} characters`);
    } catch (extractionError) {
      console.error("❌ Text extraction failed:", extractionError);
      return res
        .status(422)
        .json(
          formatErrorResponse(
            `Text extraction failed: ${extractionError.message}`,
            422
          )
        );
    }

    let summary, keyPoints, usedModel;
    try {
      const summaryResult = await summarizeWithGemini(extractedText, { tone, length, model });
      summary = summaryResult.summary;
      keyPoints = summaryResult.keyPoints;
      usedModel = summaryResult.model;
      console.log("✅ Text summarized successfully with " + usedModel);
    } catch (summaryError) {
      console.error("❌ Summarization failed:", summaryError);
      return res
        .status(500)
        .json(
          formatErrorResponse(
            `Summarization failed: ${summaryError.message}`,
            500
          )
        );
    }

    try {
      await saveSummary(extractedText, summary, keyPoints);
      console.log("✅ Summary saved to history");
    } catch (saveError) {
      console.error("⚠️ Failed to save to history:", saveError);
    }

    const response = formatFileUploadResponse(
      originalname,
      extractedText,
      summary,
      keyPoints
    );

    res.status(200).json({ ...response, model: usedModel });
  } catch (error) {
    console.error("❌ Upload controller error:", error);
    res.status(500).json({ error: "Internal server error occurred" });
  }
};
