import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserSubscription } from "@/lib/subscription-db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const subscriptionInfo = await getUserSubscription(session.user.id);

    return NextResponse.json({
      success: true,
      subscription: subscriptionInfo,
    });
  } catch (error) {
    console.error("[Subscription API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch subscription", details: errorMessage },
      { status: 500 }
    );
  }
}
