"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";
import { useResults } from "@/lib/results-context";

export default function ResultsPage() {
  const { profile } = useAuth();
  const { analysis } = useResults();

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const credits = analysis?.creditsRemaining ?? profile?.creditsRemaining ?? 0;

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => {
        setCopiedIndex((current) => (current === index ? null : current));
      }, 2000);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  if (!analysis) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-white">No Analysis Found</h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400">
            You haven&apos;t analyzed a hook in this session yet. Submit an opening hook to see your retention score, critique, and viral rewrites.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              Analyze a Hook &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate score rating tier & visual properties
  const score = analysis.score;
  const percentage = Math.min(100, Math.max(0, (score / 10) * 100));

  let scoreTier = "Needs Improvement";
  let scoreColor = "text-amber-400";
  let meterBg = "bg-amber-500";
  let badgeBorder = "border-amber-700/50 bg-amber-950/30 text-amber-300";

  if (score >= 8.0) {
    scoreTier = "High Retention Potential";
    scoreColor = "text-emerald-400";
    meterBg = "bg-emerald-500";
    badgeBorder = "border-emerald-700/50 bg-emerald-950/30 text-emerald-300";
  } else if (score >= 6.0) {
    scoreTier = "Moderate Retention";
    scoreColor = "text-indigo-400";
    meterBg = "bg-indigo-500";
    badgeBorder = "border-indigo-700/50 bg-indigo-950/30 text-indigo-300";
  } else if (score < 4.5) {
    scoreTier = "High Drop-off Risk";
    scoreColor = "text-rose-400";
    meterBg = "bg-rose-500";
    badgeBorder = "border-rose-700/50 bg-rose-950/30 text-rose-300";
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Top Header & Navigation */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Retention Diagnostics
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Analysis Results
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300">
            <span>{credits} credits left</span>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <span>Analyze Another Hook</span>
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      <div className="space-y-8">
        {/* Original Submitted Hook */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
          <span className="text-xs font-medium text-zinc-400">Original Submitted Hook:</span>
          <p className="mt-1 text-sm font-medium text-zinc-200 italic">
            &ldquo;{analysis.originalHook}&rdquo;
          </p>
        </div>

        {/* SECTION 1: Your Hook Score */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 backdrop-blur-sm shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Performance Metric
              </span>
              <h2 className="mt-1 text-xl font-bold text-white">Your Hook Score</h2>
            </div>

            <div className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${badgeBorder}`}>
              {scoreTier}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-baseline sm:items-center gap-4">
            <div className="flex items-baseline gap-1">
              <span className={`text-5xl font-extrabold tracking-tight ${scoreColor}`}>
                {score.toFixed(1)}
              </span>
              <span className="text-lg text-zinc-500 font-semibold">/ 10</span>
            </div>

            {/* Visual Meter Bar */}
            <div className="w-full flex-1">
              <div
                className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden"
                role="progressbar"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-label={`Retention score ${score.toFixed(1)} out of 10`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${meterBg}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-zinc-500 font-mono">
                <span>0.0 (Instant Drop)</span>
                <span>5.0 (Average)</span>
                <span>10.0 (Elite Retention)</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: Why It Loses Viewers (Critique) */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Why It Loses Viewers</h2>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-zinc-300">
            {analysis.critique}
          </p>
        </section>

        {/* SECTION 3: Viral Rewrites */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Viral Rewrites</h2>
              <p className="text-xs text-zinc-400">
                5 retention-optimized alternatives built with distinct psychological framing.
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-400">5 Options</span>
          </div>

          <div className="space-y-3">
            {analysis.rewrites.map((rewrite, index) => {
              const isCopied = copiedIndex === index;
              return (
                <div
                  key={index}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 backdrop-blur-sm transition hover:border-zinc-700"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-zinc-800 text-xs font-bold text-zinc-300">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium leading-relaxed text-zinc-200">
                      {rewrite}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(rewrite, index)}
                    className={`shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 ${
                      isCopied
                        ? "bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-400"
                        : "border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white focus:ring-zinc-600"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Navigation CTA */}
        <div className="pt-4 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            <span>Analyze Another Hook</span>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
