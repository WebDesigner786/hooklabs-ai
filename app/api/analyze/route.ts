import { NextRequest, NextResponse } from "next/server";
import { validateHookInput } from "@/lib/validation";
import { analyzeHookWithGemini } from "@/lib/gemini";
import {
  verifyFirebaseIdToken,
  getServerUserProfile,
  createInitialServerUserProfile,
  decrementServerUserCredit,
  ServerUserProfile,
} from "@/lib/firebase/server";
import { AnalyzeResponse, ApiErrorResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
): Promise<NextResponse<AnalyzeResponse | ApiErrorResponse>> {
  try {
    // 1. Authenticate user from Authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in." },
        { status: 401 }
      );
    }

    const idToken = authHeader.substring(7).trim();
    if (!idToken) {
      return NextResponse.json(
        { error: "Invalid authentication token." },
        { status: 401 }
      );
    }

    let verifiedUser;
    try {
      verifiedUser = await verifyFirebaseIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: "Your session is invalid or expired. Please sign in again." },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || !("hook" in body)) {
      return NextResponse.json(
        { error: "Missing required 'hook' field in request body." },
        { status: 400 }
      );
    }

    const hookInput = (body as { hook: unknown }).hook;
    const inputValidation = validateHookInput(hookInput);

    if (!inputValidation.valid || !inputValidation.data) {
      return NextResponse.json(
        { error: inputValidation.error || "Invalid hook input." },
        { status: 400 }
      );
    }

    const cleanHook = inputValidation.data;

    // 3. Retrieve user profile and verify credits safely
    let userProfile: ServerUserProfile | null = null;
    try {
      userProfile = await getServerUserProfile(verifiedUser.uid, idToken);
    } catch (lookupErr) {
      console.warn("Server Firestore lookup warning (using resilient fallback):", lookupErr);
      userProfile = {
        uid: verifiedUser.uid,
        email: verifiedUser.email,
        tier: "free",
        creditsRemaining: 10,
      };
    }

    // If profile document does not yet exist, create it with initial free credits
    if (!userProfile) {
      try {
        userProfile = await createInitialServerUserProfile(
          verifiedUser.uid,
          verifiedUser.email,
          idToken
        );
      } catch (createErr) {
        console.warn("Server Firestore user doc creation notice:", createErr);
        userProfile = {
          uid: verifiedUser.uid,
          email: verifiedUser.email,
          tier: "free",
          creditsRemaining: 10,
        };
      }
    }

    // 4. Verify credits > 0
    if (userProfile.creditsRemaining <= 0) {
      return NextResponse.json(
        {
          error:
            "Your analyses are used up. View pricing to continue optimizing hooks.",
        },
        { status: 403 }
      );
    }

    // 5. Call Gemini API server-side
    let analysis;
    try {
      analysis = await analyzeHookWithGemini(cleanHook);
    } catch (geminiError: unknown) {
      console.error("Gemini analysis execution failed:", geminiError);
      const geminiMsg =
        geminiError instanceof Error ? geminiError.message : String(geminiError);
      return NextResponse.json(
        {
          error: `AI Hook Analysis error: ${geminiMsg}`,
        },
        { status: 500 }
      );
    }

    // 6. Decrement 1 credit ONLY after successful Gemini response
    let updatedCredits = userProfile.creditsRemaining - 1;
    try {
      updatedCredits = await decrementServerUserCredit(
        verifiedUser.uid,
        idToken,
        userProfile.creditsRemaining
      );
    } catch (decrementErr) {
      console.warn("Failed to decrement credit in Firestore:", decrementErr);
      // Still return the analysis result even if decrement failed to record in Firestore,
      // but ensure client response reflects the single usage
      updatedCredits = Math.max(0, userProfile.creditsRemaining - 1);
    }

    // 7. Return successful response
    return NextResponse.json({
      score: analysis.score,
      critique: analysis.critique,
      rewrites: analysis.rewrites,
      creditsRemaining: updatedCredits,
    });
  } catch (unexpectedError: unknown) {
    console.error("Unhandled error in /api/analyze:", unexpectedError);
    const msg =
      unexpectedError instanceof Error
        ? unexpectedError.message
        : "An unexpected error occurred while processing your request.";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
