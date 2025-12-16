import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { trackGeneration } from "@/lib/subscription-db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const success = await trackGeneration(session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to track generation" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error("Error in track-generation API:", error);
    return NextResponse.json(
      { error: "Failed to track generation" },
      { status: 500 }
    );
  }
}
