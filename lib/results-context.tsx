"use client";

import React, { createContext, useContext, useState } from "react";
import { StoredAnalysis } from "./types";

interface ResultsContextType {
  analysis: StoredAnalysis | null;
  setAnalysis: (data: StoredAnalysis) => void;
  clearAnalysis: () => void;
}

const ResultsContext = createContext<ResultsContextType | undefined>(undefined);

const STORAGE_KEY = "hooklabs_latest_analysis";

export function ResultsProvider({ children }: { children: React.ReactNode }) {
  const [analysis, setAnalysisState] = useState<StoredAnalysis | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StoredAnalysis;
        if (
          parsed &&
          typeof parsed.score === "number" &&
          Array.isArray(parsed.rewrites)
        ) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not retrieve stored analysis from session storage:", e);
    }
    return null;
  });

  const setAnalysis = (data: StoredAnalysis) => {
    setAnalysisState(data);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save analysis to session storage:", e);
    }
  };

  const clearAnalysis = () => {
    setAnalysisState(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear session storage:", e);
    }
  };

  return (
    <ResultsContext.Provider value={{ analysis, setAnalysis, clearAnalysis }}>
      {children}
    </ResultsContext.Provider>
  );
}

export function useResults() {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error("useResults must be used within a ResultsProvider");
  }
  return context;
}
