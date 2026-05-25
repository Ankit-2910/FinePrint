// ============================================================================
// /api/analyze.js  —  Vercel serverless function
// ----------------------------------------------------------------------------
// The browser calls THIS endpoint (same origin); this function calls Gemini.
// The GEMINI_API_KEY lives only here (a Vercel environment variable) and is
// never exposed to the client. Thinking is disabled and the output budget is
// large so a full contract analysis returns complete, valid JSON.
// ============================================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing 'prompt' in request body." });
  }

  const KEY = process.env.GEMINI_API_KEY;
  if (!KEY) {
    return res
      .status(500)
      .json({ error: "Server is missing GEMINI_API_KEY. Add it in Vercel → Settings → Environment Variables." });
  }

  const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 16384,            // generous: one big analysis JSON
            responseMimeType: "application/json", // forces clean, fence-free JSON
            thinkingConfig: { thinkingBudget: 0 }, // disable "thinking" so it doesn't eat the budget
          },
        }),
      }
    );

    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.error?.message || "Gemini API error" });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
