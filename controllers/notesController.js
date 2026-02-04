/**
 * Handle file upload and processing
 */
export const uploadFileController = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      // Import responseFormatter mainly for error cases
      const { formatErrorResponse } = await import(
        "../utils/responseFormatter.js"
      );
      return res
        .status(400)
        .json(formatErrorResponse("No file uploaded", 400));
    }

    // Lazy load dependencies to improve cold start
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
        mimetype
      )}, ${(size / 1024 / 1024).toFixed(2)}MB)`
    );

    // Extract text from file
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

    // Summarize extracted text
    let summary, keyPoints;
    try {
      const summaryResult = await summarizeWithGemini(extractedText);
      summary = summaryResult.summary;
      keyPoints = summaryResult.keyPoints;
      console.log("✅ Text summarized successfully");
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

    // Save to history
    try {
      await saveSummary(extractedText, summary, keyPoints);
      console.log("✅ Summary saved to history");
    } catch (saveError) {
      console.error("⚠️ Failed to save to history:", saveError);
      // Don't fail the request if history save fails
    }

    // Return formatted response
    const response = formatFileUploadResponse(
      originalname,
      extractedText,
      summary,
      keyPoints
    );

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Upload controller error:", error);
    // Dynamic import might confuse formatErrorResponse usage if not careful,
    // safe fallback if imports failed
    res.status(500).json({ error: "Internal server error occurred" });
  }
};