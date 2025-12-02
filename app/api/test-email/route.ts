import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateLicenseKeyEmail } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

/**
 * GET /api/test-email?to=email@example.com
 * Test endpoint to verify Resend email delivery
 *
 * Usage:
 * GET /api/test-email?to=youremail@example.com
 *
 * This endpoint can be removed after testing in production
 */
export async function GET(request: NextRequest) {
  try {
    // Get email from query params
    const searchParams = request.nextUrl.searchParams;
    const toEmail = searchParams.get("to");

    if (!toEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing 'to' query parameter. Usage: /api/test-email?to=email@example.com",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "RESEND_API_KEY environment variable not configured",
        },
        { status: 500 }
      );
    }

    // Initialize Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Generate test email
    const testLicenseKey = "TEST-" + Math.random().toString(36).substring(2, 15).toUpperCase();
    const emailHtml = generateLicenseKeyEmail(
      testLicenseKey,
      3,
      "Test User",
      toEmail
    );

    console.log("=== Sending Test Email ===");
    console.log("To:", toEmail);
    console.log("Test License Key:", testLicenseKey);
    console.log("Timestamp:", new Date().toISOString());

    // Send test email
    const { data, error } = await resend.emails.send({
      from: "ApplyPro <noreply@send.applypro.org>",
      to: [toEmail],
      replyTo: "support@applypro.org",
      subject: "[TEST] Your ApplyPro License Key - 3 Resume Generations",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to send test email",
          details: error,
        },
        { status: 500 }
      );
    }

    console.log("Test email sent successfully!");
    console.log("Message ID:", data?.id);

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully!",
      to: toEmail,
      testLicenseKey,
      messageId: data?.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in test-email endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/test-email
 * Test endpoint with JSON body
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to: toEmail } = body;

    if (!toEmail) {
      return NextResponse.json(
        { success: false, error: "Missing 'to' field in request body" },
        { status: 400 }
      );
    }

    // Redirect to GET handler logic
    const url = new URL(request.url);
    url.searchParams.set("to", toEmail);

    return GET(
      new NextRequest(url, {
        method: "GET",
      })
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON body",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }
}
