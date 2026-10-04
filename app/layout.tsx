import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/auth-context";
import { ResultsProvider } from "@/lib/results-context";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "HookLabs AI — Turn Weak Hooks Into Scroll-Stopping Hooks",
  description:
    "HookLabs AI analyzes your short-form video hooks and generates five high-retention alternatives designed for TikTok, Reels, and Shorts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-indigo-500 selection:text-white flex flex-col font-sans">
        <AuthProvider>
          <ResultsProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ResultsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
