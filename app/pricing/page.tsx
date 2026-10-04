"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-context";

export default function PricingPage() {
  const { user, profile, signInWithGoogle, isConfigured } = useAuth();
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const handlePaidTierClick = (tierName: string) => {
    setModalMessage(
      `Billing for the ${tierName} plan is being configured for the upcoming production release. In the meantime, you can explore the platform with your 10 free analysis credits!`
    );
  };

  const currentTier = profile?.tier || "free";
  const creditsRemaining = profile?.creditsRemaining ?? 10;

  return (
    <div className="relative isolate px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl"
        aria-hidden="true"
      >
        <div
          className="aspect-[1155/678] w-[60rem] bg-gradient-to-tr from-indigo-500/20 to-purple-600/20 opacity-25"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3 py-1 text-xs font-medium text-indigo-300">
          Simple, Transparent Pricing
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
          Supercharge Your Video Retention
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-zinc-400">
          Every plan includes our specialized Gemini retention analysis, retention critique, and 5 viral rewrites for short-form creators.
        </p>
      </div>

      {/* User balance banner if logged in */}
      {user && (
        <div className="mx-auto mt-8 max-w-md rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-center">
          <p className="text-xs text-zinc-400">
            You are signed in as <span className="font-semibold text-zinc-200">{user.email}</span>
          </p>
          <p className="mt-1 text-sm font-medium text-white">
            Current plan: <span className="uppercase text-indigo-400 font-bold">{currentTier}</span> &bull; Balance: <span className="text-emerald-400 font-bold">{creditsRemaining} credits</span>
          </p>
        </div>
      )}

      {/* 3 Pricing Cards */}
      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
        {/* TIER 1: FREE */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Free</h2>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
                Starter
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Ideal for creators testing out hook optimization.
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-white">$0</span>
              <span className="text-xs text-zinc-500">forever</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span><strong>10 AI hook analyses</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span>Basic hook scoring (0-10)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span>5 rewrites per analysis</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span>2-sentence retention critique</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700"
              >
                Go to Dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                disabled={!isConfigured}
                className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                Get Started Free
              </button>
            )}
          </div>
        </div>

        {/* TIER 2: PAY-AS-YOU-GO */}
        <div className="relative flex flex-col justify-between rounded-2xl border-2 border-indigo-500/70 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-sm shadow-xl shadow-indigo-950/50">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3.5 py-0.5 text-[11px] font-bold text-white uppercase tracking-wider">
            Most Flexible
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Pay-As-You-Go</h2>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              For active creators needing extra credits without recurring commitments.
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-white">$9</span>
              <span className="text-xs text-zinc-500">one-time</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span><strong>Additional analysis credits</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span>Flexible on-demand usage</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span>No recurring subscription</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span>Full access to 5 viral rewrites</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => handlePaidTierClick("Pay-As-You-Go")}
              className="w-full inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              Buy Credit Pack
            </button>
          </div>
        </div>

        {/* TIER 3: PRO */}
        <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-sm">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Pro</h2>
              <span className="rounded-full bg-purple-950/60 border border-purple-800/60 px-2.5 py-0.5 text-[11px] font-semibold text-purple-300">
                Creators & Agencies
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              High volume analyses for daily posting and creative teams.
            </p>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-white">$29</span>
              <span className="text-xs text-zinc-500">/ month</span>
            </div>

            <ul className="mt-6 space-y-3 text-xs text-zinc-300">
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span><strong>Higher monthly usage allowance</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span>Priority creator workflow</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span>Designed for frequent video creators</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="h-4 w-4 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                </svg>
                <span>Cancel anytime</span>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => handlePaidTierClick("Pro")}
              className="w-full inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

      {/* Honest Billing Notice Modal */}
      {modalMessage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 mb-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white">Billing Setup Notice</h3>
            <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {modalMessage}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalMessage(null)}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
