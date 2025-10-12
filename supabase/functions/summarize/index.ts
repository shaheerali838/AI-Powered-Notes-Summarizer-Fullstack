import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SummarizeRequest {
  text: string;
}

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

    const { text }: SummarizeRequest = await req.json();

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid or empty text input" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate a simple extractive summary
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let summary = "";
    let keyPoints: string[] = [];

    if (sentences.length <= 3) {
      summary = text;
      keyPoints = sentences.slice(0, 3).map(s => s.trim());
    } else {
      // Extract first, middle, and last sentences
      const firstSentence = sentences[0];
      const middleSentence = sentences[Math.floor(sentences.length / 2)];
      const lastSentence = sentences[sentences.length - 1];
      
      summary = `${firstSentence.trim()}. ${middleSentence.trim()}. ${lastSentence.trim()}.`;
      
      // Extract key points (first 5 sentences)
      keyPoints = sentences.slice(0, Math.min(5, sentences.length)).map(s => s.trim());
    }

    const data = {
      original: text,
      summary: summary,
      keyPoints: keyPoints,
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Summarization error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate summary",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});