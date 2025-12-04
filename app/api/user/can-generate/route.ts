import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { canGenerateResume } from "@/lib/subscription-db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          allowed: false,
          reason: "Please sign in to generate resumes",
        },
        { status: 200 }
      );
    }

    const result = await canGenerateResume(session.user.id);

    return NextResponse.json({
      allowed: result.allowed,
      reason: result.reason,
      subscriptionInfo: result.subscriptionInfo,
    });
  } catch (error) {
    console.error("[Can Generate API] Error:", error);
    return NextResponse.json(
      {
        allowed: false,
        reason: "Error checking subscription status",
      },
      { status: 200 }
    );
  }
}
