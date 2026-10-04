import { GoogleGenAI, Type } from "@google/genai";
import { HookAnalysis } from "./types";
import { validateGeminiAnalysis } from "./validation";

export const GEMINI_SYSTEM_PROMPT = `You are HookLabs AI, an expert short-form video retention strategist.

Your job is to analyze a creator's opening hook for TikTok, Instagram Reels, and YouTube Shorts.

Your objective is to maximize viewer retention during the first seconds of a short-form video.

Analyze the supplied hook for:
- clarity
- curiosity
- emotional tension
- pattern interruption
- specificity
- open loops
- audience relevance
- immediate value
- retention potential

Return ONLY valid JSON.

Do not use Markdown.
Do not use code fences.
Do not add commentary before or after the JSON.
Do not add additional keys.

The JSON MUST have exactly this structure:

{
  "score": 0,
  "critique": "",
  "rewrites": [
    "",
    "",
    "",
    "",
    ""
  ]
}

Rules:

1. "score"
   - Must be a number from 0 to 10.
   - Use decimals when useful.
   - Never return text such as "8/10".
   - Return only the numeric value.

2. "critique"
   - Must contain EXACTLY 2 sentences.
   - Explain specifically why the original hook may fail to retain viewers.
   - Focus on practical retention weaknesses.
   - Do not praise the hook unnecessarily.
   - Do not use bullet points.

3. "rewrites"
   - Must contain EXACTLY 5 strings.
   - Each rewrite must be a genuinely different hook.
   - Do not simply replace a few words from the original.
   - Use psychological framing such as:
     * curiosity gaps
     * pattern interrupts
     * open loops
     * unexpected claims
     * specific stakes
     * tension
     * contrarian framing
     * direct audience relevance
   - Keep hooks concise and suitable for spoken short-form video.
   - Do not fabricate statistics or factual claims that were not provided.
   - Do not make misleading promises.
   - Do not include numbering inside the strings.
   - Do not include quotation marks around the hook text itself.

If the submitted hook is extremely short, unclear, or weak, still return the required JSON structure.

NEVER return invalid JSON.`;

/**
 * Analyzes a short-form video hook using Gemini API with structured JSON output.
 */
export async function analyzeHookWithGemini(hook: string): Promise<HookAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Opening hook to analyze:\n"${hook}"`,
      config: {
        systemInstruction: GEMINI_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.NUMBER,
              description: "Numeric retention score from 0 to 10",
            },
            critique: {
              type: Type.STRING,
              description: "Exactly two sentences explaining retention weaknesses",
            },
            rewrites: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: "Exactly 5 distinct viral hook rewrites",
            },
          },
          required: ["score", "critique", "rewrites"],
          propertyOrdering: ["score", "critique", "rewrites"],
        },
        temperature: 0.3,
      },
    });

    const rawText = response.text?.trim() || "";
    if (!rawText) {
      throw new Error("Empty response received from Gemini API.");
    }

    // Strip any markdown code fences if inadvertently present
    const sanitized = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/, "")
      .trim();

    const parsedJson = JSON.parse(sanitized);
    const validation = validateGeminiAnalysis(parsedJson);

    if (!validation.valid || !validation.data) {
      throw new Error(validation.error || "AI returned malformed analysis.");
    }

    return validation.data;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    throw new Error(`Gemini analysis error: ${msg}`);
  }
}
