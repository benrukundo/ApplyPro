import { NextRequest, NextResponse } from "next/server";
import { isLicenseUsed, markLicenseAsUsed } from "@/lib/licenseStore";

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
 * Verifies a Gumroad license key and marks it as used
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

    // Check if license has already been used
    if (isLicenseUsed(licenseKey)) {
      return NextResponse.json(
        {
          valid: false,
          error: "This license key has already been used. Please purchase again for another resume.",
        },
        { status: 403 }
      );
    }

    // Verify license with Gumroad API
    const formData = new URLSearchParams();
    formData.append("product_id", productId);
    formData.append("license_key", licenseKey);

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

    const gumroadData: GumroadVerifyResponse = await gumroadResponse.json();

    console.log("Gumroad verification response:", {
      success: gumroadData.success,
      licenseKey: licenseKey.substring(0, 8) + "...",
    });

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

    // Mark license as used
    markLicenseAsUsed(licenseKey, gumroadData.purchase.email);

    console.log("License verified and marked as used:", {
      email: gumroadData.purchase.email,
      timestamp: gumroadData.purchase.sale_timestamp,
    });

    return NextResponse.json({
      valid: true,
      email: gumroadData.purchase.email,
      message: "License verified successfully",
    });
  } catch (error) {
    console.error("Error verifying license:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Failed to verify license. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
