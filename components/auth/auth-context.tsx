"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase/client";
import { ensureUserProfile, subscribeToUserProfile } from "@/lib/firestore";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapFirebaseErrorMessage(error: { code?: string; message?: string }): string {
  const code = error.code || "";
  switch (code) {
    case "auth/unauthorized-domain":
      return "Domain not authorized: If browsing via http://127.0.0.1:3000 or a network IP, please switch to http://localhost:3000, or add your current domain in Firebase Console > Authentication > Settings > Authorized domains.";
    case "auth/operation-not-allowed":
    case "auth/configuration-not-found":
      return "Google Sign-In is not enabled: In Firebase Console, go to Authentication > Sign-in method, click Google, and enable it.";
    case "auth/popup-blocked":
      return "Popup blocked: Your browser blocked the Google Sign-In popup. Please allow popups for this site and try again.";
    case "auth/invalid-api-key":
      return "Invalid Firebase API Key: Please verify NEXT_PUBLIC_FIREBASE_API_KEY in .env.local.";
    case "auth/network-request-failed":
      return "Network connection to Firebase failed: Please check your internet connection or disable ad-blockers that may block Google Firebase services.";
    default:
      if (error.message) {
        return `${error.message} (${code || "auth-error"})`;
      }
      return "Could not sign in with Google. Please check your network connection and try again.";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isConfigured] = useState(() => isFirebaseConfigured());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(() => isFirebaseConfigured());
  const [authError, setAuthError] = useState<string | null>(null);

  // Check for redirect result on mount (for browsers that block popups)
  useEffect(() => {
    if (!isConfigured) return;

    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          setUser(result.user);
          try {
            const userDoc = await ensureUserProfile(result.user);
            setProfile(userDoc);
          } catch (err) {
            console.warn("Could not sync Firestore profile upon redirect:", err);
            setProfile({
              uid: result.user.uid,
              email: result.user.email || "",
              tier: "free",
              creditsRemaining: 10,
              createdAt: new Date().toISOString(),
            });
          }
        }
      })
      .catch((err: unknown) => {
        console.error("Redirect sign-in error:", err);
        const error = err as { code?: string; message?: string };
        setAuthError(mapFirebaseErrorMessage(error));
      });
  }, [isConfigured]);

  // Auth state listener
  useEffect(() => {
    if (!isConfigured) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await ensureUserProfile(currentUser);
          setProfile(userDoc);
        } catch (err) {
          console.warn("Firestore user sync notice:", err);
          // Set in-memory profile so user is not blocked from dashboard
          setProfile((existing) =>
            existing || {
              uid: currentUser.uid,
              email: currentUser.email || "",
              tier: "free",
              creditsRemaining: 10,
              createdAt: new Date().toISOString(),
            }
          );
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isConfigured]);

  // Set up real-time listener for user profile updates
  useEffect(() => {
    if (!user) {
      return;
    }

    const unsubscribe = subscribeToUserProfile(user.uid, (updatedProfile) => {
      if (updatedProfile) {
        setProfile(updatedProfile);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    if (!isConfigured) {
      setAuthError(
        "Firebase environment variables are not configured yet. Please check .env.local."
      );
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setUser(result.user);
        try {
          const userDoc = await ensureUserProfile(result.user);
          setProfile(userDoc);
        } catch (firestoreErr) {
          console.warn("Firestore profile creation notice:", firestoreErr);
          // If Firestore is still being set up or rules pending, allow login with starter profile
          setProfile({
            uid: result.user.uid,
            email: result.user.email || "",
            tier: "free",
            creditsRemaining: 10,
            createdAt: new Date().toISOString(),
          });
        }
      }
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (
        error.code === "auth/popup-closed-by-user" ||
        error.code === "auth/cancelled-popup-request"
      ) {
        return;
      }

      // If browser blocked popup, attempt redirect sign-in
      if (error.code === "auth/popup-blocked") {
        console.warn("Popup blocked. Attempting redirect sign-in fallback...");
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr: unknown) {
          const rError = redirectErr as { code?: string; message?: string };
          setAuthError(mapFirebaseErrorMessage(rError));
          return;
        }
      }

      console.error("Sign-in failure:", err);
      setAuthError(mapFirebaseErrorMessage(error));
    }
  }, [isConfigured]);

  const logout = useCallback(async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Sign-out failure:", err);
      setAuthError("Failed to log out. Please try again.");
    }
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken(true);
    } catch (err) {
      console.error("Failed to get ID token:", err);
      return null;
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured,
        signInWithGoogle,
        logout,
        getIdToken,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
