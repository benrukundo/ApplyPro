/**
 * Email template for license key delivery
 */
export function generateLicenseKeyEmail(
  licenseKey: string,
  remainingUses: number,
  purchaserName: string,
  purchaserEmail: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your ApplyPro License Key</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f7f7f7;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #3B82F6 0%, #4F46E5 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 10px;
    }
    .subtitle {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 30px;
    }
    .license-box {
      background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
      border: 2px solid #3B82F6;
      border-radius: 12px;
      padding: 30px;
      margin: 30px 0;
      text-align: center;
    }
    .license-label {
      font-size: 14px;
      font-weight: 600;
      color: #3B82F6;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .license-key {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
      font-family: 'Courier New', monospace;
      letter-spacing: 2px;
      word-break: break-all;
      margin: 15px 0;
      padding: 15px;
      background-color: #ffffff;
      border-radius: 8px;
      border: 1px dashed #3B82F6;
    }
    .usage-badge {
      display: inline-block;
      background-color: #10B981;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 10px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3B82F6 0%, #4F46E5 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      margin: 30px 0;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: scale(1.05);
    }
    .info-box {
      background-color: #FEF3C7;
      border-left: 4px solid #F59E0B;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .info-title {
      font-weight: 600;
      color: #92400E;
      margin-bottom: 10px;
      font-size: 16px;
    }
    .steps {
      margin: 30px 0;
    }
    .step {
      display: flex;
      align-items: start;
      margin-bottom: 20px;
    }
    .step-number {
      background-color: #3B82F6;
      color: #ffffff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 15px;
      flex-shrink: 0;
    }
    .step-content {
      flex: 1;
    }
    .step-title {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 5px;
    }
    .step-description {
      color: #6b7280;
      font-size: 14px;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-text {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 15px;
    }
    .support-link {
      color: #3B82F6;
      text-decoration: none;
      font-weight: 600;
    }
    .divider {
      height: 1px;
      background-color: #e5e7eb;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1 class="logo">ApplyPro</h1>
    </div>

    <!-- Content -->
    <div class="content">
      <h2 class="greeting">Thank you for your purchase, ${purchaserName}! 🎉</h2>
      <p class="subtitle">Your license key is ready to use. Let's help you land your dream job!</p>

      <!-- License Key Box -->
      <div class="license-box">
        <div class="license-label">Your License Key</div>
        <div class="license-key">${licenseKey}</div>
        <div class="usage-badge">✓ ${remainingUses} Resume Generations Included</div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="https://applypro.org/generate" class="cta-button">
          Generate Your Resume →
        </a>
      </div>

      <!-- Important Note -->
      <div class="info-box">
        <div class="info-title">💡 Important: Save This Email!</div>
        <p style="margin: 0; color: #92400E; font-size: 14px;">
          You can use your license key anytime to generate tailored resumes. Each key includes 3 resume generations - perfect for applying to multiple positions!
        </p>
      </div>

      <div class="divider"></div>

      <!-- How to Use -->
      <h3 style="color: #1f2937; margin-bottom: 20px;">How to Use Your License Key:</h3>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">Go to ApplyPro</div>
            <div class="step-description">Visit <a href="https://applypro.org/generate" style="color: #3B82F6;">applypro.org/generate</a></div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">Upload & Enter Details</div>
            <div class="step-description">Paste your resume and the job description you're applying for</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">Enter Your License Key</div>
            <div class="step-description">Use the license key above and click "Verify & Generate" to instantly create your tailored resume</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- Features Included -->
      <h3 style="color: #1f2937; margin-bottom: 15px;">What's Included:</h3>
      <ul style="color: #6b7280; line-height: 1.8;">
        <li>✅ <strong>3 Resume Generations</strong> - Perfect for multiple job applications</li>
        <li>✅ <strong>AI-Powered Optimization</strong> - Claude AI tailors your resume</li>
        <li>✅ <strong>ATS-Friendly Format</strong> - Beat applicant tracking systems</li>
        <li>✅ <strong>Custom Cover Letters</strong> - Personalized for each position</li>
        <li>✅ <strong>Match Score Analysis</strong> - See how well you fit the role</li>
        <li>✅ <strong>Instant Delivery</strong> - Get results in minutes</li>
      </ul>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text">
        Need help? Contact us at <a href="mailto:support@applypro.org" class="support-link">support@applypro.org</a>
      </p>
      <p class="footer-text" style="font-size: 12px; color: #9ca3af;">
        © ${new Date().getFullYear()} ApplyPro. All rights reserved.
      </p>
      <p class="footer-text" style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
        You're receiving this email because you purchased ApplyPro from Gumroad.<br>
        License sent to: ${purchaserEmail}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Email template for reminder about remaining uses
 */
export function generateReminderEmail(
  licenseKey: string,
  remainingUses: number,
  purchaserEmail: string
): string {
  const isLastUse = remainingUses === 0;
  const title = isLastUse
    ? "You've Used All Your Resume Generations"
    : `You Have ${remainingUses} Resume Generation${remainingUses === 1 ? "" : "s"} Left`;

  const message = isLastUse
    ? "Thanks for using ApplyPro! You've successfully generated all 3 tailored resumes. Ready to apply to more positions? Purchase another license to continue."
    : `You have ${remainingUses} more resume generation${remainingUses === 1 ? "" : "s"} available with your license key.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ApplyPro Usage Reminder</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f7f7f7;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: ${isLastUse ? "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)" : "linear-gradient(135deg, #3B82F6 0%, #4F46E5 100%)"};
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #ffffff;
      margin: 0;
    }
    .content {
      padding: 40px 30px;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 15px;
      text-align: center;
    }
    .message {
      font-size: 16px;
      color: #6b7280;
      margin-bottom: 30px;
      text-align: center;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #3B82F6 0%, #4F46E5 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1 class="logo">ApplyPro</h1>
    </div>
    <div class="content">
      <h2 class="title">${title}</h2>
      <p class="message">${message}</p>
      <div style="text-align: center;">
        ${isLastUse
          ? `<a href="https://laurabi.gumroad.com/l/ykchtv" class="cta-button">Buy More Resumes - $4.99</a>`
          : `<a href="https://applypro.org/generate" class="cta-button">Generate Another Resume</a>`
        }
      </div>
      ${!isLastUse ? `<p style="text-align: center; color: #6b7280; margin-top: 20px;">Your license key: <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${licenseKey}</code></p>` : ""}
    </div>
    <div class="footer">
      <p>Need help? Contact <a href="mailto:support@applypro.org" style="color: #3B82F6;">support@applypro.org</a></p>
      <p style="margin-top: 10px;">© ${new Date().getFullYear()} ApplyPro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
