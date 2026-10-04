import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-xs text-zinc-500">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-indigo-600/80 text-[10px] font-bold text-white">
            H
          </div>
          <span className="font-semibold text-zinc-400">HookLabs AI</span>
          <span>&copy; {new Date().getFullYear()} HookLabs. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6 text-zinc-400">
          <Link href="/pricing" className="hover:text-zinc-200 transition">
            Pricing
          </Link>
          <a
            href="https://ai.google.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-zinc-200 transition"
          >
            Powered by Gemini 1.5 Flash
          </a>
        </div>
      </div>
    </footer>
  );
}
