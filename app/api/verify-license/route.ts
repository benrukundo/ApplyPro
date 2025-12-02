import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

interface GumroadVerifyResponse {
  success: boolean;
  uses: number;
  purchase: {
    email: string;
    sale_timestamp: string;
    refunded: boolean;
    chargebacked: boolean;
    subscription_cancelled_at?: string;
    subscription_failed_at?: string;
  };
}

/**
 * POST /api/verify-license
 * Verifies a Gumroad license key and tracks usage (up to 3 uses)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licenseKey } = body;

    // Validate input
    if (!licenseKey || typeof licenseKey !== "string") {
      return NextResponse.json(
        { valid: false, error: "License key is required" },
        { status: 400 }
      );
    }

    // Check environment variables
    const productId = process.env.GUMROAD_PRODUCT_ID;
    const applicationSecret = process.env.GUMROAD_APPLICATION_SECRET;

    if (!productId || !applicationSecret) {
      console.error("Gumroad credentials not configured");
      return NextResponse.json(
        { valid: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Verify license with Gumroad API and increment usage count
    const formData = new URLSearchParams();
    formData.append("product_id", productId);
    formData.append("license_key", licenseKey);
    formData.append("increment_uses_count", "true");

    const gumroadResponse = await fetch(
      "https://api.gumroad.com/v2/licenses/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    const responseText = await gumroadResponse.text();

    let gumroadData: GumroadVerifyResponse;
    try {
      gumroadData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse Gumroad response:", parseError);
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid response from Gumroad API",
        },
        { status: 500 }
      );
    }

    // Check if license is valid
    if (!gumroadData.success) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid license key. Please check your purchase email and try again.",
        },
        { status: 401 }
      );
    }

    // Check if purchase was refunded or chargebacked
    if (gumroadData.purchase.refunded) {
      return NextResponse.json(
        {
          valid: false,
          error: "This license key is from a refunded purchase and cannot be used.",
        },
        { status: 403 }
      );
    }

    if (gumroadData.purchase.chargebacked) {
      return NextResponse.json(
        {
          valid: false,
          error: "This license key is from a chargebacked purchase and cannot be used.",
        },
        { status: 403 }
      );
    }

    // Check if license has exceeded usage limit (3 resumes)
    // Gumroad increments uses before returning, so check if uses > 3
    if (gumroadData.uses > 3) {
      return NextResponse.json(
        {
          valid: false,
          error: "License key limit reached. You've used all 3 resume generations. Purchase again to create more tailored resumes.",
          uses: gumroadData.uses,
          remaining: 0,
        },
        { status: 403 }
      );
    }

    // Calculate remaining uses (3 total - current uses)
    const remainingUses = 3 - gumroadData.uses;

    return NextResponse.json({
      valid: true,
      email: gumroadData.purchase.email,
      message: "License verified successfully",
      uses: gumroadData.uses,
      remaining: remainingUses,
    });
  } catch (error) {
    console.error("License verification error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Failed to verify license. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
