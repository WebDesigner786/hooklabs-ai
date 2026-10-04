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
 */
export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: user.uid,
      email: data.email || user.email || "",
      tier: data.tier || "free",
      creditsRemaining: typeof data.creditsRemaining === "number" ? data.creditsRemaining : 0,
      createdAt: data.createdAt,
    };
  }

  const initialProfile: UserProfile = {
    uid: user.uid,
    email: user.email || "",
    tier: "free",
    creditsRemaining: 10,
    createdAt: serverTimestamp() as unknown as string,
  };

  await setDoc(userRef, {
    uid: initialProfile.uid,
    email: initialProfile.email,
    tier: initialProfile.tier,
    creditsRemaining: initialProfile.creditsRemaining,
    createdAt: serverTimestamp(),
  });

  return initialProfile;
}

/**
 * Retrieves the current user profile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
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
    creditsRemaining: typeof data.creditsRemaining === "number" ? data.creditsRemaining : 0,
    createdAt: data.createdAt,
  };
}

/**
 * Subscribes to real-time updates for a user's profile document.
 */
export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
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
        creditsRemaining: typeof data.creditsRemaining === "number" ? data.creditsRemaining : 0,
        createdAt: data.createdAt,
      });
    },
    (err) => {
      console.error("Firestore user subscription error:", err);
    }
  );
}
