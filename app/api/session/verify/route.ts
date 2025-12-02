import { NextResponse } from "next/server";
import { verifyAndUseSession } from "@/lib/sessionStore";

export const dynamic = 'force-dynamic';

/**
 * POST /api/session/verify
 * Verifies a session token and marks it as used
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    // Validate token
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 400 }
      );
    }

    // Verify and use the session
    const result = verifyAndUseSession(token);

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          error: result.reason || "Session verification failed",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: "Session verified successfully",
    });
  } catch (error) {
    console.error("Error verifying session:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to verify session" },
      { status: 500 }
    );
  }
}
