import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const filename = file.name;
    const fileType = file.type;
    const fileSize = file.size;
    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();

    // Max file size check (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (fileSize > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: "File size exceeds 10MB limit" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let extractedText = "";

    // Handle text files
    if (['.txt', '.md', '.rtf'].includes(extension)) {
      extractedText = await file.text();
    }
    // Handle images with basic placeholder (OCR would require additional setup)
    else if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'].includes(extension)) {
      extractedText = "[Image file uploaded - OCR processing not available. Please paste text manually.]";
    }
    // Handle PDF files (basic placeholder - full PDF parsing requires additional libraries)
    else if (extension === '.pdf') {
      extractedText = "[PDF file uploaded - text extraction not available. Please paste text manually.]";
    }
    // Handle DOCX files (basic placeholder)
    else if (extension === '.docx') {
      extractedText = "[DOCX file uploaded - text extraction not available. Please paste text manually.]";
    }
    else {
      return new Response(
        JSON.stringify({ error: `Unsupported file type: ${extension}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate simple summary
    let summary = "";
    let keyPoints: string[] = [];

    if (extractedText && extractedText.trim().length > 0 && !extractedText.startsWith('[')) {
      const sentences = extractedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      
      if (sentences.length <= 3) {
        summary = extractedText;
        keyPoints = sentences.slice(0, 3).map(s => s.trim());
      } else {
        const firstSentence = sentences[0];
        const middleSentence = sentences[Math.floor(sentences.length / 2)];
        const lastSentence = sentences[sentences.length - 1];
        
        summary = `${firstSentence.trim()}. ${middleSentence.trim()}. ${lastSentence.trim()}.`;
        keyPoints = sentences.slice(0, Math.min(5, sentences.length)).map(s => s.trim());
      }
    } else {
      summary = extractedText;
    }

    const data = {
      filename,
      extractedText,
      summary,
      keyPoints,
      fileType,
      fileSize,
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process file",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});