import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { canUserGenerate } from "@/lib/subscription-db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          allowed: false, 
          reason: "Authentication required" 
        },
        { status: 401 }
      );
    }

    const result = await canUserGenerate(session.user.id);

    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error("Error in can-generate API:", error);
    return NextResponse.json(
      { 
        allowed: false, 
        reason: "Unable to verify subscription" 
      },
      { status: 500 }
    );
  }
}
