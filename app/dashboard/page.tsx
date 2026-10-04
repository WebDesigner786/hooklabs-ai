"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";
import { useResults } from "@/lib/results-context";
import { MAX_HOOK_LENGTH, MIN_HOOK_LENGTH } from "@/lib/validation";
import { db } from "@/lib/firebase/client";
import { doc, setDoc } from "firebase/firestore";

export default function DashboardPage() {
  const { user, profile, loading, getIdToken, updateCredits } = useAuth();
  const { setAnalysis } = useResults();
  const router = useRouter();

  const [hook, setHook] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect unauthenticated users to home
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const credits = profile?.creditsRemaining ?? 10;
  const isZeroCredits = credits <= 0;
  const charCount = hook.length;
  const isOverLength = charCount > MAX_HOOK_LENGTH;
  const isTooShort = charCount > 0 && charCount < MIN_HOOK_LENGTH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = hook.trim();

    if (!trimmed) {
      setError("Please enter a short-form video opening hook to analyze.");
      return;
    }

    if (trimmed.length < MIN_HOOK_LENGTH) {
      setError(`Opening hook must be at least ${MIN_HOOK_LENGTH} characters long.`);
      return;
    }

    if (trimmed.length > MAX_HOOK_LENGTH) {
      setError(`Opening hook exceeds maximum length of ${MAX_HOOK_LENGTH} characters.`);
      return;
    }

    if (isZeroCredits) {
      router.push("/pricing");
      return;
    }

    setAnalyzing(true);

    try {
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error("Unable to obtain authentication token. Please re-login.");
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ hook: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 403) {
          setError("Your free analyses are used up. View pricing to continue.");
        } else {
          setError(data.error || "Failed to analyze hook. Please try again.");
        }
        setAnalyzing(false);
        return;
      }

      // Update credits in context immediately and sync with Firestore
      if (typeof data.creditsRemaining === "number") {
        updateCredits(data.creditsRemaining);
        if (user) {
          setDoc(
            doc(db, "users", user.uid),
            { creditsRemaining: data.creditsRemaining },
            { merge: true }
          ).catch((e) => console.warn("Firestore client sync notice:", e));
        }
      }

      // Store analysis safely in context & session storage
      setAnalysis({
        originalHook: trimmed,
        score: data.score,
        critique: data.critique,
        rewrites: data.rewrites,
        creditsRemaining: data.creditsRemaining,
        timestamp: Date.now(),
      });

      // Navigate to results
      router.push("/results");
    } catch (err: unknown) {
      console.error("Analysis request error:", err);
      const msg = err instanceof Error ? err.message : "Network error";
      setError(msg || "A connection error occurred. Please try again.");
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-xs text-zinc-400">Loading your creator workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Banner / Credit Status */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Current Balance
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                isZeroCredits ? "text-rose-400" : "text-white"
              }`}
            >
              {credits}
            </span>
            <span className="text-xs text-zinc-400">
              {credits === 1 ? "analysis credit" : "analysis credits"} remaining
            </span>
          </div>
        </div>

        {isZeroCredits ? (
          <Link
            href="/pricing"
            className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-500"
          >
            Get More Credits
          </Link>
        ) : (
          <Link
            href="/pricing"
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
          >
            Upgrade Plan &rarr;
          </Link>
        )}
      </div>

      {/* Main Analysis Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Analyze Your Hook
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-400">
            Paste the first 1-3 spoken seconds of your TikTok, Reel, or Short script.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="hook-input"
              className="block text-xs font-medium text-zinc-300 mb-2"
            >
              Opening Hook Script
            </label>
            <div className="relative">
              <textarea
                id="hook-input"
                rows={4}
                value={hook}
                onChange={(e) => {
                  setHook(e.target.value);
                  if (error) setError(null);
                }}
                disabled={analyzing}
                placeholder="Paste your video hook here... (e.g., 'Stop scrolling if you want to make an extra $1,000 this month.')"
                className={`w-full rounded-xl border bg-zinc-950 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 transition focus:outline-none focus:ring-2 disabled:opacity-50 resize-none ${
                  isOverLength
                    ? "border-rose-500 focus:ring-rose-500"
                    : "border-zinc-800 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
            </div>

            {/* Character counter & length indicators */}
            <div className="mt-2 flex items-center justify-between text-xs">
              <span
                className={`${
                  isTooShort
                    ? "text-amber-400"
                    : isOverLength
                    ? "text-rose-400"
                    : "text-zinc-500"
                }`}
              >
                {isOverLength
                  ? `Exceeds max limit by ${charCount - MAX_HOOK_LENGTH} characters`
                  : isTooShort
                  ? `Min ${MIN_HOOK_LENGTH} characters required`
                  : "Keep it punchy (1-2 sentences recommended)"}
              </span>
              <span
                className={`font-mono ${
                  isOverLength ? "font-bold text-rose-400" : "text-zinc-500"
                }`}
              >
                {charCount}/{MAX_HOOK_LENGTH}
              </span>
            </div>
          </div>

          {/* Validation & Error Messaging */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-800/80 bg-rose-950/40 p-4 text-xs sm:text-sm text-rose-300 flex items-start justify-between"
            >
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 shrink-0 text-rose-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
              {isZeroCredits && (
                <Link
                  href="/pricing"
                  className="ml-3 shrink-0 underline font-semibold text-rose-200 hover:text-white"
                >
                  View Pricing
                </Link>
              )}
            </div>
          )}

          {/* Zero Credits Warning Box */}
          {isZeroCredits && (
            <div className="rounded-xl border border-amber-800/60 bg-amber-950/30 p-4 text-xs text-amber-300 flex items-center justify-between">
              <div>
                <p className="font-semibold text-amber-200">
                  Zero credits remaining
                </p>
                <p className="mt-0.5 text-zinc-400">
                  Your free analyses are used up. Upgrade your plan or purchase credits to continue.
                </p>
              </div>
              <Link
                href="/pricing"
                className="shrink-0 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-amber-400 transition ml-4"
              >
                Get More Credits
              </Link>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {isZeroCredits ? (
              <Link
                href="/pricing"
                className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                Get More Credits
              </Link>
            ) : (
              <button
                type="submit"
                disabled={analyzing || !hook.trim() || isOverLength}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Analyze Hook</span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
