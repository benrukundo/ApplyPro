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

    console.log("=== License Verification Request ===");
    console.log("License key received:", licenseKey?.substring(0, 8) + "...");

    // Validate input
    if (!licenseKey || typeof licenseKey !== "string") {
      console.error("Invalid license key input");
      return NextResponse.json(
        { valid: false, error: "License key is required" },
        { status: 400 }
      );
    }

    // Check environment variables
    const productId = process.env.GUMROAD_PRODUCT_ID;
    const applicationSecret = process.env.GUMROAD_APPLICATION_SECRET;

    console.log("Environment variables check:");
    console.log("- GUMROAD_PRODUCT_ID exists:", !!productId);
    console.log("- GUMROAD_PRODUCT_ID value:", productId);
    console.log("- GUMROAD_APPLICATION_SECRET exists:", !!applicationSecret);
    console.log("- GUMROAD_APPLICATION_SECRET length:", applicationSecret?.length || 0);

    if (!productId || !applicationSecret) {
      console.error("Gumroad credentials not configured");
      return NextResponse.json(
        { valid: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Check if license has already been used
    if (isLicenseUsed(licenseKey)) {
      console.log("License already used:", licenseKey.substring(0, 8) + "...");
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

    console.log("=== Gumroad API Request ===");
    console.log("URL: https://api.gumroad.com/v2/licenses/verify");
    console.log("Method: POST");
    console.log("Content-Type: application/x-www-form-urlencoded");
    console.log("Request body:");
    console.log("  product_id:", productId);
    console.log("  license_key:", licenseKey.substring(0, 8) + "...");
    console.log("Full body string:", formData.toString());

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

    console.log("=== Gumroad API Response ===");
    console.log("Status code:", gumroadResponse.status);
    console.log("Status text:", gumroadResponse.statusText);
    console.log("Headers:", Object.fromEntries(gumroadResponse.headers.entries()));

    const responseText = await gumroadResponse.text();
    console.log("Raw response body:", responseText);

    let gumroadData: GumroadVerifyResponse;
    try {
      gumroadData = JSON.parse(responseText);
      console.log("Parsed response:", JSON.stringify(gumroadData, null, 2));
    } catch (parseError) {
      console.error("Failed to parse Gumroad response as JSON:", parseError);
      console.error("Response text was:", responseText);
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid response from Gumroad API",
        },
        { status: 500 }
      );
    }

    console.log("Gumroad success status:", gumroadData.success);

    // Check if license is valid
    if (!gumroadData.success) {
      console.log("License verification failed");
      console.log("Gumroad error:", gumroadData);
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
    console.error("=== ERROR in License Verification ===");
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    console.error("Full error object:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Failed to verify license. Please try again or contact support.",
      },
      { status: 500 }
    );
  }
}
