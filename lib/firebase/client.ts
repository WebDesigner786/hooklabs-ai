import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const rawAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
const rawProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export function isFirebaseConfigured(): boolean {
  return Boolean(
    rawApiKey &&
    rawAuthDomain &&
    rawProjectId &&
    rawApiKey !== "your_firebase_api_key_here" &&
    !rawApiKey.includes("MockKey")
  );
}

// Fallback config prevents Firebase initialization from crashing Next.js static prerendering
const activeConfig = isFirebaseConfigured()
  ? {
      apiKey: rawApiKey!,
      authDomain: rawAuthDomain!,
      projectId: rawProjectId!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    }
  : {
      apiKey: "AIzaSyMockKeyForBuildStaticPrerendering00",
      authDomain: "hooklabs-placeholder.firebaseapp.com",
      projectId: "hooklabs-placeholder",
      storageBucket: "hooklabs-placeholder.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:0000000000000000000000",
    };

const app: FirebaseApp = !getApps().length
  ? initializeApp(activeConfig)
  : getApp();

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, auth, db, googleProvider };
