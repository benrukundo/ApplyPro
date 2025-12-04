import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { trackGeneration, canGenerateResume } from "@/lib/subscription-db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check if user can generate before tracking
    const canGenerate = await canGenerateResume(session.user.id);
    if (!canGenerate.allowed) {
      return NextResponse.json(
        {
          error: "Cannot generate resume",
          reason: canGenerate.reason,
          subscriptionInfo: canGenerate.subscriptionInfo,
        },
        { status: 403 }
      );
    }

    // Track the generation
    await trackGeneration(session.user.id);

    return NextResponse.json({
      success: true,
      message: "Generation tracked successfully",
    });
  } catch (error) {
    console.error("[Track Generation API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to track generation", details: errorMessage },
      { status: 500 }
    );
  }
}
