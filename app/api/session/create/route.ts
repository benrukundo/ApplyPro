import { NextResponse } from "next/server";
import { createSession } from "@/lib/sessionStore";

export const dynamic = 'force-dynamic';

/**
 * POST /api/session/create
 * Creates a new payment session token
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    // Validate token
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    // Token should be a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(token)) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Create the session
    createSession(token);

    return NextResponse.json({
      success: true,
      token,
      message: "Session created successfully",
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
