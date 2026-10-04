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

interface AuthErrorDetails {
  code: string;
  message: string;
  resolution: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  authErrorDetails: AuthErrorDetails | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseFirebaseError(error: unknown): AuthErrorDetails {
  const err = (error && typeof error === "object" ? error : {}) as {
    code?: string;
    message?: string;
  };
  const code = err.code || "unknown-error";
  const rawMessage = err.message || String(error);

  let resolution =
    "Check your Firebase Console configuration and verify .env.local contains valid keys.";

  if (code === "auth/unauthorized-domain") {
    resolution =
      "Your current browser domain is not authorized in Firebase. If you opened http://127.0.0.1:3000, please switch to http://localhost:3000, or add '127.0.0.1' to Firebase Console > Authentication > Settings > Authorized domains.";
  } else if (
    code === "auth/operation-not-allowed" ||
    code === "auth/configuration-not-found"
  ) {
    resolution =
      "Google Sign-In is not enabled in Firebase Console. Go to Firebase Console > Authentication > Sign-in method > click Google > toggle Enable > choose Support email > Save.";
  } else if (code === "auth/popup-blocked") {
    resolution =
      "The Google Sign-In popup was blocked by your browser. Please allow popups for this site, or try again.";
  } else if (code === "auth/invalid-api-key") {
    resolution =
      "The NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local is invalid. Please copy the exact apiKey from your Firebase Project Settings.";
  } else if (code === "auth/network-request-failed") {
    resolution =
      "Network connection to Google Firebase servers failed. Please check your internet connection and disable ad blockers or Brave Shields for localhost.";
  } else if (rawMessage.toLowerCase().includes("firestore") || code.includes("permission-denied")) {
    resolution =
      "Cloud Firestore database is missing or security rules have not been deployed. Please go to Firebase Console > Firestore Database and click Create Database.";
  }

  return {
    code,
    message: rawMessage,
    resolution,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isConfigured] = useState(() => isFirebaseConfigured());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(() => isFirebaseConfigured());
  const [authErrorDetails, setAuthErrorDetails] = useState<AuthErrorDetails | null>(null);

  // Catch redirect sign-in result on page load
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
            console.warn("Firestore profile sync warning:", err);
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
        setAuthErrorDetails(parseFirebaseError(err));
      });
  }, [isConfigured]);

  // Firebase auth state observer
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
          console.warn("Firestore profile sync warning:", err);
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

  // Real-time Firestore user profile sync
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
    setAuthErrorDetails(null);
    if (!isConfigured) {
      setAuthErrorDetails({
        code: "env/missing-configuration",
        message: "Firebase environment variables are not configured in .env.local",
        resolution: "Please populate your Firebase web credentials in .env.local and restart the development server.",
      });
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
          console.warn("Firestore user profile initialization notice:", firestoreErr);
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
          setAuthErrorDetails(parseFirebaseError(redirectErr));
          return;
        }
      }

      console.error("Sign-in failure details:", err);
      setAuthErrorDetails(parseFirebaseError(err));
    }
  }, [isConfigured]);

  const logout = useCallback(async () => {
    setAuthErrorDetails(null);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Sign-out failure:", err);
      setAuthErrorDetails(parseFirebaseError(err));
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
    setAuthErrorDetails(null);
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
        authErrorDetails,
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
