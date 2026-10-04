"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";

export function Navbar() {
  const { user, profile, logout, signInWithGoogle, isConfigured } = useAuth();
  const pathname = usePathname();

  const credits = profile?.creditsRemaining ?? 10;
  const isZeroCredits = credits <= 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white transition hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
                />
              </svg>
            </div>
            <span>
              HookLabs <span className="text-indigo-400">AI</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-5 sm:flex">
            {user && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition ${
                  pathname === "/dashboard"
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/pricing"
              className={`text-sm font-medium transition ${
                pathname === "/pricing"
                  ? "text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Pricing
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Credit Badge */}
              <div
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                  isZeroCredits
                    ? "border-rose-800/80 bg-rose-950/40 text-rose-300"
                    : "border-indigo-800/80 bg-indigo-950/40 text-indigo-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isZeroCredits ? "bg-rose-400" : "bg-emerald-400"
                  }`}
                />
                <span>
                  {credits} {credits === 1 ? "credit" : "credits"}
                </span>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-700"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/pricing"
                className="hidden text-sm font-medium text-zinc-400 hover:text-white sm:inline-block px-3 py-1.5"
              >
                Pricing
              </Link>
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                disabled={!isConfigured}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V13.4h6.887C18.2 15.632 15.645 18 12.24 18c-3.315 0-6-2.685-6-6s2.685-6 6-6c1.482 0 2.835.538 3.882 1.428l2.38-2.38C17.065 3.565 14.78 2.6 12.24 2.6 7.054 2.6 2.857 6.797 2.857 12s4.197 9.4 9.383 9.4c5.421 0 9.017-3.81 9.017-9.172 0-.616-.06-1.22-.172-1.943H12.24z" />
                </svg>
                <span>Login with Google</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
