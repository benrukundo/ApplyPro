import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { generateLicenseKeyEmail } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendLicenseEmailRequest {
  email: string;
  licenseKey: string;
  purchaserName?: string;
  remainingUses?: number;
}

/**
 * POST /api/send-license-email
 * Sends license key email to purchaser via Resend
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendLicenseEmailRequest = await request.json();
    const {
      email,
      licenseKey,
      purchaserName = "Valued Customer",
      remainingUses = 3,
    } = body;

    // Validate input
    if (!email || !licenseKey) {
      return NextResponse.json(
        { success: false, error: "Email and license key are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { success: false, error: "Email service not configured" },
        { status: 500 }
      );
    }

    // Generate email HTML
    const emailHtml = generateLicenseKeyEmail(
      licenseKey,
      remainingUses,
      purchaserName,
      email
    );

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "ApplyPro <noreply@send.applypro.org>",
      to: [email],
      replyTo: "support@applypro.org",
      subject: "Your ApplyPro License Key - 3 Resume Generations",
      html: emailHtml,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to send email", details: error },
        { status: 500 }
      );
    }

    console.log("License key email sent successfully:", {
      to: email,
      licenseKey: licenseKey.substring(0, 8) + "...",
      messageId: data?.id,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: data?.id,
    });
  } catch (error) {
    console.error("Error in send-license-email API:", error);
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
