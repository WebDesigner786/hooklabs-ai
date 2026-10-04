export type UserTier = "free" | "pay-as-you-go" | "pro";

export interface UserProfile {
  uid: string;
  email: string;
  tier: UserTier;
  creditsRemaining: number;
  createdAt: string | number | { seconds: number; nanoseconds: number };
}

export interface HookAnalysis {
  score: number;
  critique: string;
  rewrites: string[];
}

export interface AnalyzeRequest {
  hook: string;
}

export interface AnalyzeResponse {
  score: number;
  critique: string;
  rewrites: string[];
  creditsRemaining: number;
}

export interface ApiErrorResponse {
  error: string;
}

export interface StoredAnalysis {
  originalHook: string;
  score: number;
  critique: string;
  rewrites: string[];
  creditsRemaining: number;
  timestamp: number;
}
