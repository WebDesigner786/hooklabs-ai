import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "";
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "";

export function isFirebaseConfigured(): boolean {
  return Boolean(
    apiKey &&
    authDomain &&
    projectId &&
    apiKey !== "your_firebase_api_key_here" &&
    !apiKey.includes("MockKey")
  );
}

// Fallback config prevents Firebase initialization from crashing Next.js static prerendering
const activeConfig = isFirebaseConfigured()
  ? {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
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
googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.setCustomParameters({ prompt: "select_account" });

export { app, auth, db, googleProvider };
