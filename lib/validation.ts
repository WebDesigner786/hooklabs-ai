import { HookAnalysis } from "./types";

export const MAX_HOOK_LENGTH = 500;
export const MIN_HOOK_LENGTH = 3;

export interface ValidationResult<T> {
  valid: boolean;
  error?: string;
  data?: T;
}

/**
 * Validates the creator's submitted opening hook.
 */
export function validateHookInput(rawHook: unknown): ValidationResult<string> {
  if (typeof rawHook !== "string") {
    return { valid: false, error: "Hook must be a valid text string." };
  }

  const trimmed = rawHook.trim();

  if (trimmed.length < MIN_HOOK_LENGTH) {
    return { valid: false, error: "Please enter an opening hook of at least 3 characters." };
  }

  if (trimmed.length > MAX_HOOK_LENGTH) {
    return {
      valid: false,
      error: `Hook exceeds the maximum allowed length of ${MAX_HOOK_LENGTH} characters.`,
    };
  }

  return { valid: true, data: trimmed };
}

/**
 * Normalizes text to strictly enforce exactly two sentences.
 */
export function normalizeTwoSentences(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  // Split into sentences by punctuation marks (. ! ?) followed by space or end
  const matches = cleaned.match(/[^.!?]+[.!?]+(\s|$)/g);

  if (matches && matches.length >= 2) {
    return (matches[0].trim() + " " + matches[1].trim()).trim();
  }

  if (matches && matches.length === 1) {
    const s1 = matches[0].trim();
    return `${s1} Add immediate tension or an open loop in the opening second to prevent viewers from scrolling away.`;
  }

  // Fallback if no sentence punctuation exists
  const trimmed = cleaned.replace(/[.!?]+$/, "");
  return `${trimmed}. It lacks an immediate curiosity gap or pattern interrupt to sustain viewer retention.`;
}

/**
 * Cleans individual rewrite strings (removes leading numbers, surrounding quotes).
 */
export function cleanRewriteString(text: string): string {
  let cleaned = text.trim();
  // Remove leading numbers like "1. ", "1) ", "- "
  cleaned = cleaned.replace(/^(\d+[\.\)]|\-|\*)\s*/, "");
  // Remove surrounding single or double quotes
  cleaned = cleaned.replace(/^["'“](.*)["'”]$/, "$1");
  return cleaned.trim();
}

/**
 * Validates and normalizes Gemini's structured response.
 */
export function validateGeminiAnalysis(raw: unknown): ValidationResult<HookAnalysis> {
  if (!raw || typeof raw !== "object") {
    return { valid: false, error: "Invalid analysis payload returned by AI service." };
  }

  const candidate = raw as Record<string, unknown>;

  // 1. Validate Score
  let numericScore: number;
  if (typeof candidate.score === "number") {
    numericScore = candidate.score;
  } else if (typeof candidate.score === "string") {
    numericScore = parseFloat(candidate.score);
  } else {
    return { valid: false, error: "AI output is missing a valid numeric score." };
  }

  if (isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
    return { valid: false, error: "Score must be a number between 0 and 10." };
  }

  // Round to 1 decimal place
  const score = Math.round(numericScore * 10) / 10;

  // 2. Validate Critique
  if (typeof candidate.critique !== "string" || candidate.critique.trim().length === 0) {
    return { valid: false, error: "AI output is missing a valid critique string." };
  }
  const critique = normalizeTwoSentences(candidate.critique);

  // 3. Validate Rewrites
  if (!Array.isArray(candidate.rewrites)) {
    return { valid: false, error: "AI output must contain an array of rewrites." };
  }

  const cleanedRewrites = candidate.rewrites
    .map((item) => (typeof item === "string" ? cleanRewriteString(item) : ""))
    .filter((str) => str.length > 0);

  if (cleanedRewrites.length !== 5) {
    return {
      valid: false,
      error: `Expected exactly 5 rewrites, but received ${cleanedRewrites.length}.`,
    };
  }

  return {
    valid: true,
    data: {
      score,
      critique,
      rewrites: cleanedRewrites,
    },
  };
}
