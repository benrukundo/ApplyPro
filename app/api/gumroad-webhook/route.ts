import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/gumroad-webhook
 * Webhook endpoint for Gumroad purchase notifications
 * Automatically sends license key email to purchaser
 */
export async function POST(request: NextRequest) {
  try {
    // Parse form-urlencoded body from Gumroad
    const formData = await request.formData();

    // Extract purchase data
    const purchaseData = {
      email: formData.get("email") as string,
      licenseKey: formData.get("license_key") as string,
      productId: formData.get("product_id") as string,
      productName: formData.get("product_name") as string,
      fullName: formData.get("full_name") as string,
      saleId: formData.get("sale_id") as string,
      saleTimestamp: formData.get("sale_timestamp") as string,
      test: formData.get("test") as string,
      refunded: formData.get("refunded") as string,
    };

    // Log webhook event
    console.log("=== Gumroad Webhook Received ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Sale ID:", purchaseData.saleId);
    console.log("Email:", purchaseData.email);
    console.log("Product:", purchaseData.productName);
    console.log("License Key:", purchaseData.licenseKey?.substring(0, 8) + "...");
    console.log("Test Mode:", purchaseData.test === "true");
    console.log("Refunded:", purchaseData.refunded === "true");

    // Validate required fields
    if (!purchaseData.email || !purchaseData.licenseKey) {
      console.error("Missing required fields:", {
        hasEmail: !!purchaseData.email,
        hasLicenseKey: !!purchaseData.licenseKey,
      });
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if this is for our product (optional validation)
    const expectedProductId = process.env.GUMROAD_PRODUCT_ID;
    if (expectedProductId && purchaseData.productId !== expectedProductId) {
      console.warn("Webhook for different product:", {
        received: purchaseData.productId,
        expected: expectedProductId,
      });
      // Still process it, just log the warning
    }

    // Skip sending email for refunded purchases
    if (purchaseData.refunded === "true") {
      console.log("Skipping email for refunded purchase");
      return NextResponse.json({
        success: true,
        message: "Webhook received (refunded, no email sent)",
      });
    }

    // Send license key email
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://applypro.org";
      const emailResponse = await fetch(`${baseUrl}/api/send-license-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: purchaseData.email,
          licenseKey: purchaseData.licenseKey,
          purchaserName: purchaseData.fullName || "Valued Customer",
          remainingUses: 3,
        }),
      });

      const emailResult = await emailResponse.json();

      if (!emailResponse.ok) {
        console.error("Failed to send license email:", emailResult);
        // Don't fail the webhook - user still gets license key on Gumroad
        return NextResponse.json({
          success: true,
          warning: "Webhook processed but email failed to send",
          emailError: emailResult.error,
        });
      }

      console.log("License email sent successfully:", emailResult.messageId);
    } catch (emailError) {
      console.error("Error sending license email:", emailError);
      // Don't fail the webhook - user still gets license key on Gumroad
      return NextResponse.json({
        success: true,
        warning: "Webhook processed but email sending encountered an error",
      });
    }

    // Return success to Gumroad
    return NextResponse.json({
      success: true,
      message: "Webhook processed and email sent",
    });
  } catch (error) {
    console.error("=== Gumroad Webhook Error ===");
    console.error("Error:", error);
    console.error("Stack:", error instanceof Error ? error.stack : "No stack");

    // Return 200 to Gumroad even on error to prevent retries
    // We log the error for debugging but don't want Gumroad to keep retrying
    return NextResponse.json(
      {
        success: false,
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 200 } // Return 200 to prevent Gumroad retries
    );
  }
}

/**
 * GET /api/gumroad-webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Gumroad webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
