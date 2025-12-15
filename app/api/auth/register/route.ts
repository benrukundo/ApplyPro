import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { generateVerificationEmail } from "@/lib/emailTemplates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // If user exists and is verified with password, they already have an account
      if (existingUser.password && existingUser.emailVerified) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please login instead." },
          { status: 400 }
        );
      }

      // If user exists without password (Google OAuth), add password to allow both login methods
      if (!existingUser.password && existingUser.emailVerified) {
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            password: hashedPassword,
            name: existingUser.name || name.trim(),
          },
        });

        return NextResponse.json(
          { success: true, verified: true, message: "Password added to your existing account. You can now login." },
          { status: 200 }
        );
      }

      // If user exists but not verified, resend verification email
      if (existingUser.password && !existingUser.emailVerified) {
        await sendVerificationEmail(existingUser.id, normalizedEmail, existingUser.name || name.trim());
        return NextResponse.json(
          { success: true, verified: false, message: "A verification email has been sent. Please check your inbox." },
          { status: 200 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user (unverified)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: null, // Not verified yet
      },
    });

    // Send verification email
    await sendVerificationEmail(user.id, normalizedEmail, name.trim());

    return NextResponse.json(
      { success: true, verified: false, message: "Account created! Please check your email to verify your account." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}

async function sendVerificationEmail(userId: string, email: string, name: string) {
  // Generate verification token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Create new verification token
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  // Build verification URL
  const baseUrl = process.env.NEXTAUTH_URL || "https://applypro.org";
  const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  // Send email
  const emailHtml = generateVerificationEmail(verificationUrl, name);

  console.log("Attempting to send verification email to:", email);
  console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: "ApplyPro <support@applypro.org>",
    to: [email],
    subject: "Verify your email - ApplyPro",
    html: emailHtml,
  });

  if (error) {
    console.error("Resend API error:", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  console.log("Verification email sent successfully:", data?.id);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
