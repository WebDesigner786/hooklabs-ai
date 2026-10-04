"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";

export default function LandingPage() {
  const { user, signInWithGoogle, isConfigured, authError, clearAuthError } =
    useAuth();

  return (
    <div className="relative isolate overflow-hidden bg-zinc-950">
      {/* Background Subtle Glows */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="aspect-[1155/678] w-[68.4375rem] bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 opacity-30"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-14 text-center sm:px-6 sm:pt-24 lg:px-8">
        {/* Banner badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-medium text-indigo-300 backdrop-blur-sm mb-6">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>Engineered for TikTok, Reels & Shorts</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.15]">
          Turn Weak Hooks Into{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
            Scroll-Stopping Hooks.
          </span>
        </h1>

        {/* Supporting text */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-400">
          HookLabs AI analyzes your short-form video hooks and generates five
          high-retention alternatives designed for TikTok, Reels, and Shorts.
        </p>

        {/* Error Banner if auth failure */}
        {authError && (
          <div className="mx-auto mt-4 max-w-md rounded-lg border border-rose-800/80 bg-rose-950/50 p-3 text-xs text-rose-300 flex items-center justify-between">
            <span>{authError}</span>
            <button
              onClick={clearAuthError}
              className="text-rose-400 hover:text-white ml-2 text-sm font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {user ? (
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <span>Go to Dashboard</span>
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
          ) : (
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              disabled={!isConfigured}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.632 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.482 0 2.835.538 3.882 1.428l2.38-2.38C17.065 3.565 14.78 2.6 12.24 2.6 7.054 2.6 2.857 6.797 2.857 12s4.197 9.4 9.383 9.4c5.421 0 9.017-3.81 9.017-9.172 0-.616-.06-1.22-.172-1.943H12.24z" />
              </svg>
              <span>Login with Google — 10 Free Analyses</span>
            </button>
          )}

          <Link
            href="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/60 px-6 py-3.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            View Pricing
          </Link>
        </div>

        {!isConfigured && (
          <p className="mt-4 text-xs text-amber-400">
            Note: Set up your Firebase credentials in .env.local to enable Google
            Sign-In.
          </p>
        )}
      </section>

      {/* Interactive Demonstration Card: Hook -> Score -> Critique -> 5 Rewrites */}
      <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Live Product Demonstration
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-950/60 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-800/60">
              AI Analysis Output
            </span>
          </div>

          <div className="mt-6 space-y-6">
            {/* Original Hook */}
            <div>
              <p className="text-xs font-medium text-zinc-400">Original Hook (Submitted)</p>
              <div className="mt-1.5 rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-sm font-medium text-zinc-300">
                &ldquo;In this video I am going to show you 5 easy ways you can make money online.&rdquo;
              </div>
            </div>

            {/* Score & Critique Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-center items-center text-center">
                <span className="text-xs font-medium text-zinc-400">Retention Score</span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-amber-400">3.8</span>
                  <span className="text-xs text-zinc-500">/ 10</span>
                </div>
                <span className="mt-1 text-[11px] text-rose-400 font-medium">High Drop-off Risk</span>
              </div>

              <div className="sm:col-span-2 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <span className="text-xs font-medium text-zinc-400">Why It Loses Viewers</span>
                <p className="mt-1.5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Starting with an announcement signals low immediate value and triggers an automatic swipe before the viewer learns anything. It offers generic listicle advice with zero stakes or curiosity gap to hook skepticism.
                </p>
              </div>
            </div>

            {/* 5 Rewrites Preview */}
            <div>
              <p className="text-xs font-medium text-zinc-400 mb-2">5 High-Retention Viral Rewrites</p>
              <div className="space-y-2">
                {[
                  "I tested 5 online side hustles so you don't waste 6 months like I did.",
                  "If you have a laptop and 2 hours a day, stop scrolling right now.",
                  "Almost everyone teaching online income in 2026 is hiding this one rule.",
                  "This is the exact reason 90% of beginners fail at online income in their first 30 days.",
                  "Before you spend a single dollar on an online business, watch this.",
                ].map((rewrite, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/80 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-200"
                  >
                    <span>{rewrite}</span>
                    <span className="ml-3 shrink-0 rounded bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                      Option {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Built for Short-Form Creators
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Engineered around viewer retention psychology for TikTok, Reels, and Shorts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 mb-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">AI Hook Scoring</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Instant 0-10 retention score calibrated against patterns that trigger instant viewer drop-off within 2 seconds.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/20 mb-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Retention Critique</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Concise two-sentence surgical breakdown uncovering exactly why viewers scroll past your opening line.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-600/20 text-pink-400 border border-pink-500/20 mb-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">5 Viral Rewrites</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Five distinct psychological angles: curiosity gaps, pattern interrupts, open loops, and contrarian framing.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 mb-4">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">Spoken Rhythm</h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Short, punchy lines written specifically for natural spoken delivery on camera without tongue twisters.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-indigo-900/50 bg-gradient-to-b from-indigo-950/30 to-zinc-950 p-8 sm:p-12">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Start Optimizing Your Hooks Today
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400">
            Sign up now and get 10 free AI hook analyses instantly. No credit card required.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                Go to Dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                disabled={!isConfigured}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                Sign In with Google
              </button>
            )}
            <Link
              href="/pricing"
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              See Pricing Options
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
