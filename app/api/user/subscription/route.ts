import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserSubscription } from "@/lib/subscription-db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const subscription = await getUserSubscription(session.user.id);

    if (!subscription) {
      return NextResponse.json(
        { error: "Failed to load subscription info" },
        { status: 500 }
      );
    }

    return NextResponse.json({ subscription }, { status: 200 });
    
  } catch (error) {
    console.error("Error in subscription API:", error);
    return NextResponse.json(
      { error: "Failed to load subscription" },
      { status: 500 }
    );
  }
}
