import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db } from "./firebase/client";
import { UserProfile } from "./types";

/**
 * Ensures a Firestore user document exists upon authentication.
 * Never overwrites existing user data or credits.
 * Recovers gracefully with a starter profile if Firestore is unavailable.
 */
export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const fallbackProfile: UserProfile = {
    uid: user.uid,
    email: user.email || "",
    tier: "free",
    creditsRemaining: 10,
    createdAt: new Date().toISOString(),
  };

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: user.uid,
        email: data.email || user.email || "",
        tier: data.tier || "free",
        creditsRemaining:
          typeof data.creditsRemaining === "number" ? data.creditsRemaining : 0,
        createdAt: data.createdAt,
      };
    }

    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || "",
      tier: "free",
      creditsRemaining: 10,
      createdAt: serverTimestamp(),
    });

    return fallbackProfile;
  } catch (err) {
    console.warn("Firestore sync warning in ensureUserProfile:", err);
    return fallbackProfile;
  }
}

/**
 * Retrieves the current user profile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return null;
    }

    const data = snap.data();
    return {
      uid,
      email: data.email || "",
      tier: data.tier || "free",
      creditsRemaining:
        typeof data.creditsRemaining === "number" ? data.creditsRemaining : 0,
      createdAt: data.createdAt,
    };
  } catch (err) {
    console.warn("Could not retrieve user profile from Firestore:", err);
    return null;
  }
}

/**
 * Subscribes to real-time updates for a user's profile document.
 */
export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
  try {
    const userRef = doc(db, "users", uid);
    return onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) {
          callback(null);
          return;
        }
        const data = snap.data();
        callback({
          uid,
          email: data.email || "",
          tier: data.tier || "free",
          creditsRemaining:
            typeof data.creditsRemaining === "number"
              ? data.creditsRemaining
              : 0,
          createdAt: data.createdAt,
        });
      },
      (err) => {
        console.warn("Firestore user subscription warning:", err);
      }
    );
  } catch (err) {
    console.warn("Could not attach Firestore profile listener:", err);
    return () => {};
  }
}
