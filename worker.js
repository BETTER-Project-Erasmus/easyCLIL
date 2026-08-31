// Cloudflare Worker — secure proxy between easyCLIL and the Anthropic API.
// The API key lives only here, as a secret set in the Cloudflare dashboard
// (Workers & Pages > your worker > Settings > Variables > add "ANTHROPIC_API_KEY"
// as an *encrypted* variable). It is never sent to the browser.

// IMPORTANT: replace "*" below with your actual GitHub Pages origin once you
// know it (e.g. "https://yourusername.github.io") to stop other sites from
// using your worker (and your API credits) for free.
const ALLOWED_ORIGIN = "*";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders() });
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const { methodology, context, filledFields, emptyFields } = payload;

    if (!emptyFields || !Array.isArray(emptyFields) || emptyFields.length === 0) {
      return jsonResponse({ error: "No empty fields to complete" }, 400);
    }

    const textFields = emptyFields.filter((f) => f.type !== "url");
    const urlFields = emptyFields.filter((f) => f.type === "url");

    const textFieldList = textFields.map((f) => `"${f.id}" (${f.label})`).join(", ") || "none";
    const urlFieldList = urlFields.map((f) => `"${f.id}" (${f.label})`).join(", ") || "none";

    const systemPrompt = `You are helping a teacher complete a CLIL (Content and Language Integrated Learning) lesson preparation sheet, using the "${methodology || "unspecified"}" methodology.

The teacher has already written the core of the lesson themselves — treat this as ground truth, stay consistent with it, and never contradict it.
Already filled in by the teacher: ${JSON.stringify(filledFields || {})}

Context selected by the teacher:
- Country: ${context?.country || "not specified"}. If specified, use web search to check this country's current educational policies and national curriculum where relevant to the fields below, rather than relying only on prior knowledge.
- Student level (CEFR): ${context?.level || "not specified"}. Adapt the complexity of your suggestions to this level.
- Subject: ${context?.subject || "not specified"}
- Topic: ${context?.topic || "not specified"}

Complete the following text fields, identified by their id: ${textFieldList}
For each, write a concise, concrete, pedagogically sound suggestion (2-4 sentences) in English.

Also try to complete the following link fields, identified by their id: ${urlFieldList}
For each, use web search to find a real, currently accessible picture, video, or website relevant to the topic and the country's context. Only provide a URL you actually found through search (one you can cite) — NEVER invent or guess a URL. If you cannot find a suitable real link for a given field, return an empty string "" for that field rather than a fabricated one.

Reply with a single JSON object only — no markdown formatting, no code fences, no explanation, no text before or after. The object's keys must be exactly the field ids listed above (both text and link fields).`;

    try {
      const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1500,
          system: systemPrompt,
          messages: [
            { role: "user", content: "Complete the requested fields now, as a single JSON object." },
          ],
          tools: [
            {
              type: "web_search_20250305",
              name: "web_search",
              max_uses: 3,
            },
          ],
        }),
      });

      if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        return jsonResponse({ error: "Anthropic API error", details: errText }, 502);
      }

      const data = await apiResponse.json();

      // With web search enabled, the response can contain several content
      // blocks (tool calls, intermediate text). The final answer is the
      // last text block.
      const textBlocks = (data.content || []).filter((b) => b.type === "text");
      const lastText = textBlocks.length ? textBlocks[textBlocks.length - 1] : null;

      if (!lastText) {
        return jsonResponse({ error: "No text response from the model" }, 502);
      }

      let suggestions;
      try {
        const cleaned = lastText.text.replace(/^```json\s*|```\s*$/g, "").trim();
        suggestions = JSON.parse(cleaned);
      } catch (e) {
        return jsonResponse({ error: "Could not parse AI response as JSON", raw: lastText.text }, 502);
      }

      // Collect any web search source URLs used, for transparency.
      const sources = [];
      textBlocks.forEach((block) => {
        (block.citations || []).forEach((c) => {
          if (c.url && !sources.includes(c.url)) sources.push(c.url);
        });
      });

      return jsonResponse({ suggestions, sources });
    } catch (error) {
      return jsonResponse({ error: "Worker error", details: String(error) }, 500);
    }
  },
};
