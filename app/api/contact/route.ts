import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, subject, message } = await request.json();

    // Validate inputs
    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Subject mapping
    const subjectMap: Record<string, string> = {
      general: 'General Question',
      billing: 'Billing & Subscription',
      technical: 'Technical Issue',
      feature: 'Feature Request',
      refund: 'Refund Request',
      other: 'Other',
    };

    const subjectLine = `[ApplyPro Support] ${subjectMap[subject] || subject}`;

    // Send email to support
    await resend.emails.send({
      from: 'ApplyPro <noreply@applypro.org>',
      to: ['support@applypro.org'], // Change to your support email
      replyTo: email,
      subject: subjectLine,
      html: `
        <h2>New Support Request</h2>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subjectMap[subject] || subject}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br />')}</p>
        <hr />
        <p style="color: #666; font-size: 12px;">
          Reply directly to this email to respond to the customer.
        </p>
      `,
    });

    // Send confirmation to user
    await resend.emails.send({
      from: 'ApplyPro <noreply@applypro.org>',
      to: [email],
      subject: 'We received your message - ApplyPro Support',
      html: `
        <h2>Thanks for contacting ApplyPro!</h2>
        <p>Hi there,</p>
        <p>We've received your message and will get back to you within 24-48 hours.</p>
        <p><strong>Your message:</strong></p>
        <blockquote style="border-left: 3px solid #3b82f6; padding-left: 12px; color: #666;">
          ${message.replace(/\n/g, '<br />')}
        </blockquote>
        <p>Best regards,<br />The ApplyPro Team</p>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
