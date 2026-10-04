import { UserTier } from "../types";

export interface VerifiedUser {
  uid: string;
  email: string;
}

export interface ServerUserProfile {
  uid: string;
  email: string;
  tier: UserTier;
  creditsRemaining: number;
}

const FIREBASE_API_KEY =
  process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";

/**
 * Cryptographically verifies the Firebase ID token using Google Identity Toolkit REST API.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedUser> {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("Missing or invalid authorization token.");
  }

  if (!FIREBASE_API_KEY) {
    throw new Error("Server Firebase API configuration is missing.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.error?.message || "Invalid or expired session.";
    throw new Error(`Authentication failed: ${message}`);
  }

  const data = await response.json();
  const user = data.users?.[0];

  if (!user || !user.localId) {
    throw new Error("Unable to identify user from session token.");
  }

  return {
    uid: user.localId,
    email: user.email || "",
  };
}

/**
 * Retrieves the user profile from Cloud Firestore via REST API using the user's verified token.
 */
export async function getServerUserProfile(
  uid: string,
  idToken: string
): Promise<ServerUserProfile | null> {
  if (!FIREBASE_PROJECT_ID) {
    throw new Error("Server Firebase Project ID configuration is missing.");
  }

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Firestore lookup error: ${err?.error?.message || response.statusText}`
    );
  }

  const doc = await response.json();
  const fields = doc.fields || {};

  const creditsVal = fields.creditsRemaining?.integerValue;
  const creditsRemaining =
    creditsVal !== undefined ? parseInt(creditsVal, 10) : 0;
  const tier = (fields.tier?.stringValue as UserTier) || "free";
  const email = fields.email?.stringValue || "";

  return {
    uid,
    email,
    tier,
    creditsRemaining: isNaN(creditsRemaining) ? 0 : creditsRemaining,
  };
}

/**
 * Creates the initial user profile document in Firestore if it doesn't already exist.
 */
export async function createInitialServerUserProfile(
  uid: string,
  email: string,
  idToken: string
): Promise<ServerUserProfile> {
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}`;
  const body = {
    fields: {
      uid: { stringValue: uid },
      email: { stringValue: email },
      tier: { stringValue: "free" },
      creditsRemaining: { integerValue: "10" },
      createdAt: { timestampValue: new Date().toISOString() },
    },
  };

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to initialize user document: ${err?.error?.message || response.statusText}`
    );
  }

  return {
    uid,
    email,
    tier: "free",
    creditsRemaining: 10,
  };
}

/**
 * Decrements one credit atomically via Firestore REST API under security rules.
 */
export async function decrementServerUserCredit(
  uid: string,
  idToken: string,
  currentCredits: number
): Promise<number> {
  const newCredits = Math.max(0, currentCredits - 1);
  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${uid}?updateMask.fieldPaths=creditsRemaining`;

  const body = {
    fields: {
      creditsRemaining: { integerValue: String(newCredits) },
    },
  };

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to decrement credits: ${err?.error?.message || response.statusText}`
    );
  }

  return newCredits;
}
