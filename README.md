# HookLabs AI — Short-Form Video Retention Strategist

Turn weak video hooks into scroll-stopping hooks. HookLabs AI analyzes creator opening hooks for TikTok, Instagram Reels, and YouTube Shorts using Google Gemini 1.5 Flash, providing a retention score (0-10), a surgical 2-sentence drop-off critique, and 5 psychological viral rewrites.

---

## 1. Project Overview

HookLabs AI is a production-grade Micro-SaaS built for short-form video creators. It analyzes the first 1-3 spoken seconds of video scripts to maximize viewer retention and prevent audience drop-off.

### Core Workflow
1. **User Authenticates:** Google Sign-In via Firebase Authentication.
2. **First-Time Setup:** Automatic creation of a `users/{uid}` document with 10 free analysis credits.
3. **Hook Submission:** User enters their opening hook into the dashboard.
4. **Server-Side Verification:** `/api/analyze` verifies the user's session token and independent Firestore credit balance (`creditsRemaining > 0`).
5. **AI Retention Analysis:** Server invokes Google Gemini 1.5 Flash using structured JSON output.
6. **Credit Enforcement:** Server atomically decrements 1 credit only upon successful AI analysis.
7. **Results Display:** Displays numerical retention score, visual meter, 2-sentence critique, and 5 distinct rewrites with one-click clipboard copying.

---

## 2. Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, React 19)
- **Language:** TypeScript (Strict type safety)
- **Styling:** Tailwind CSS (Dark SaaS aesthetic, mobile responsive)
- **Authentication:** Firebase Authentication (Google Sign-In)
- **Database:** Google Cloud Firestore (Modular SDK v9+)
- **AI Engine:** Google Gemini API (`gemini-1.5-flash` via `@google/genai`)
- **Hosting / Deployment:** Vercel

---

## 3. Local Setup

### Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or pnpm

### Installation
```bash
git clone <repository-url>
cd hooklabs-ai
npm install
```

### Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Firebase web app keys and your Gemini API key (see sections below).

### Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. **Authentication:**
   - Go to **Build > Authentication > Sign-in method**.
   - Enable the **Google** provider.
   - Add your local and production domains to **Authorized domains** (e.g., `localhost`, your Vercel deployment URL).
3. **Cloud Firestore:**
   - Go to **Build > Firestore Database > Create Database**.
   - Choose production mode.
4. **Web App Credentials:**
   - In Project Settings, click **Add app** (Web `</>`).
   - Copy the configuration parameters into `.env.local`:
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## 5. Gemini API Setup

1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Add your key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   > **Note:** Never prefix `GEMINI_API_KEY` with `NEXT_PUBLIC_`. The key is only accessed server-side inside route handlers.

---

## 6. Required Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client & Server | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client & Server | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client & Server | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Client & Server | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client & Server | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client & Server | Firebase Web App ID |
| `GEMINI_API_KEY` | Server-only | Google Gemini API Key |
| `GEMINI_MODEL` | Server-only | Optional: override model (defaults to `gemini-1.5-flash`) |

---

## 7. Cloud Firestore Security Rules Deployment

Deploy the included `firestore.rules` file to protect user documents and enforce credit immutability:

### Using Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase use --add <your-firebase-project-id>
firebase deploy --only firestore:rules
```

### Security Guarantees:
- **Ownership enforcement:** Users can only read their own profile (`users/{userId}`).
- **Initial document creation:** Users can only create a profile with `tier: "free"` and `creditsRemaining: 10`.
- **Credit tamper protection:** Client-side updates cannot increase credits, modify tier, or change account ownership.
- **Server authority:** Credit decrementing is authoritatively validated server-side.

---

## 8. Vercel Deployment

1. Push your repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/), select **Add New > Project** and import the repository.
3. In **Settings > Environment Variables**, add all environment variables listed in Section 6.
4. Click **Deploy**.
5. Copy your assigned Vercel URL (e.g. `https://hooklabs-ai.vercel.app`) and add it to **Authorized domains** in the Firebase Console under **Authentication > Settings > Authorized domains**.

---

## 9. Verification & Scripts

- `npm run dev`: Starts local Turbopack development server.
- `npm run build`: Compiles production Next.js bundle and verifies TypeScript types.
- `npm run start`: Runs compiled production server.
- `npm run lint`: Runs ESLint validation.
