# ApplyPro - AI-Powered Resume Builder & Job Application Tracker

## 🎯 Project Overview

ApplyPro is a SaaS platform that helps job seekers create professional, ATS-optimized resumes and track their job applications. The platform uses AI (Claude by Anthropic) to tailor resumes to specific job descriptions and enhance user-provided content.

**Live Site**: https://www.applypro.org
**Tech Stack**: Next.js 14, TypeScript, Prisma, PostgreSQL, Tailwind CSS, Paddle (payments), Resend (emails), Sentry (monitoring), PostHog (analytics)

---

## 🏗️ Project Structure

```
c:\ApplyPro/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication (NextAuth)
│   │   │   ├── register/         # User registration
│   │   │   └── [...nextauth]/    # OAuth & credentials login
│   │   ├── generate/             # AI resume generation (PAID - Sonnet)
│   │   ├── preview/              # Free resume preview (Haiku)
│   │   ├── build-resume/         # Builder feature APIs
│   │   │   ├── generate/         # Generate from builder (PAID)
│   │   │   ├── preview/          # Free preview from builder (Haiku)
│   │   │   └── progress/         # Save builder progress
│   │   ├── paddle-webhook/       # Paddle payment webhooks
│   │   ├── subscription/         # Subscription management
│   │   │   └── cancel/           # Cancel subscription
│   │   └── user/
│   │       └── subscription/     # Get user subscription info
│   ├── (pages)/                  # Page routes
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/            # User dashboard
│   │   ├── generate/             # Main resume generation (upload existing)
│   │   ├── build-resume/         # Build from scratch wizard
│   │   ├── tracker/              # Job application tracker
│   │   ├── pricing/              # Pricing page with Paddle checkout
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration page
│   │   ├── terms/                # Terms of service
│   │   ├── privacy/              # Privacy policy
│   │   └── coming-soon/          # Placeholder for future features
│   └── global-error.tsx          # Sentry error boundary
├── components/                   # React components
│   ├── PaddleCheckout.tsx        # Paddle payment integration
│   ├── CancelSubscriptionModal.tsx # Cancel subscription UI
│   └── PostHogProvider.tsx       # Analytics provider
├── lib/                          # Utility functions & business logic
│   ├── documentGenerator.ts      # PDF & DOCX generation (jsPDF, docx)
│   ├── authOptions.ts            # NextAuth configuration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── subscription-db.ts        # Subscription business logic
│   ├── tracker.ts                # Job tracker localStorage logic
│   ├── emailTemplates.ts         # Email templates (Resend)
│   └── utils.ts                  # General utilities
├── prisma/                       # Database
│   └── schema.prisma             # Database schema
├── public/                       # Static assets
├── sentry.*.config.ts            # Sentry configuration
├── instrumentation.ts            # Sentry server initialization
├── next.config.ts                # Next.js + Sentry config
└── tailwind.config.ts            # Tailwind CSS config
```

---

## 🎨 Core Features

### 1. **AI Resume Generation** (Main Feature)
- **Upload Existing Resume**: Users upload PDF/DOCX resume + paste job description
- **AI Tailoring**: Claude Sonnet tailors resume to job description
- **Three Outputs**:
  - Tailored Resume (optimized for specific job)
  - ATS-Optimized Resume (applicant tracking system friendly)
  - Cover Letter (personalized)
- **Multiple Templates**: Modern (two-column), Traditional (classic), ATS (simple)
- **Color Themes**: 6 color presets (Blue, Green, Purple, Red, Teal, Orange)
- **Downloads**: PDF and DOCX formats

### 2. **Resume Builder** (Build from Scratch)
- **7-Step Wizard**:
  1. Target Role (job title, industry, experience level)
  2. Personal Info (name, email, phone, location, LinkedIn)
  3. Education (degree, school, dates, GPA, highlights)
  4. Experience (company, title, dates, description)
  5. Skills (technical, soft, languages, certifications)
  6. Summary (optional - AI generates if blank)
  7. Preview & Download
- **Free AI Preview**: Uses Claude Haiku (cheapest model) to show enhanced preview
- **Auto-Save**: Progress saved to database
- **Template Selection**: Choose template and color before download
- **Smart Features**:
  - Suggested skills based on industry
  - Intelligent skill categorization
  - Professional preview matching PDF layout

### 3. **Job Application Tracker**
- **Track Applications**: Company, position, status, dates
- **Status Workflow**: Saved → Applied → Interview → Offer → Rejected
- **Follow-ups**: Set reminder dates
- **Statistics Dashboard**: Total apps, success rate, etc.
- **localStorage-based**: No backend required
- **Free for all users**: 25 applications limit for free tier

### 4. **Subscription & Payments**
- **Three Plans**:
  - **Resume Pack** ($4.99 one-time): 3 resume generations
  - **Pro Monthly** ($19/month): 100 resumes/month
  - **Pro Yearly** ($149/year): 100 resumes/month, save 35%
- **Payment Provider**: Paddle (sandbox mode currently)
- **Features**:
  - Checkout overlay integration
  - Webhook handling for subscription lifecycle
  - Cancellation flow with confirmation modal
  - Usage tracking and limits
  - Fair use protection (cooldown, daily limits)

### 5. **Email Notifications** (Resend)
- Welcome email (new user signup)
- Email verification
- Subscription confirmation (after payment)
- Payment failed notification
- Usage alert (80% limit reached)
- Limit reached notification (100% used)
- Renewal reminder
- Subscription cancelled confirmation

### 6. **Authentication**
- **NextAuth.js** with multiple providers:
  - Google OAuth
  - GitHub OAuth
  - Email/Password (credentials)
- Email verification required
- Session management
- Protected routes

---

## 🗄️ Database Schema (Prisma)

### Key Models:

**User**
- id, name, email, emailVerified, image
- password (hashed), role
- Relationships: accounts, sessions, resumes, builderResumes, subscriptions

**Subscription**
- id, userId, paddleId, plan, status
- monthlyUsageCount, monthlyLimit
- currentPeriodEnd, cancelledAt
- Tracks: monthly/yearly/pay-per-use plans

**GeneratedResume**
- Stores generated resumes from upload feature
- resumeText, jobDescription, tailoredResume, atsResume, coverLetter
- template, color, createdAt

**BuilderResume**
- Stores resume builder progress
- targetJobTitle, formData (education, experience, skills)
- generatedResume, currentStep, isComplete

**UsageLog**
- Tracks each generation for analytics and abuse detection

**Account, Session, VerificationToken**
- NextAuth required models

---

## 🔑 Key Technologies

### Frontend
- **Next.js 14** (App Router, Server Components, Server Actions)
- **TypeScript** (strict mode)
- **Tailwind CSS** (styling)
- **Lucide React** (icons)
- **next-auth** (authentication)
- **PostHog** (analytics)

### Backend
- **Next.js API Routes** (serverless functions)
- **Prisma ORM** (PostgreSQL database)
- **Anthropic Claude API**:
  - **Claude Sonnet 4** (paid generations - high quality)
  - **Claude Haiku 3.5** (free previews - cost-effective)
- **Paddle API** (payment processing)
- **Resend API** (transactional emails)

### Document Generation
- **jsPDF** (PDF generation)
- **docx** (DOCX generation)
- **file-saver** (client-side file downloads)

### Monitoring & Analytics
- **Sentry** (error tracking, performance monitoring)
- **PostHog** (user analytics, event tracking)

---

## 💳 Payment Flow (Paddle)

1. **User clicks pricing plan** → PaddleCheckout component opens overlay
2. **User completes payment** → Paddle processes payment
3. **Webhook received** at `/api/paddle-webhook`:
   - Signature verification (HMAC SHA256)
   - Event handling: subscription.created, updated, canceled, etc.
   - Database updated (Subscription model)
   - Emails sent (confirmation, cancellation, etc.)
4. **User redirected to dashboard** with `?payment=success`
5. **Dashboard polls** `/api/user/subscription` to show updated status

### Paddle Events Handled:
- subscription.created
- subscription.updated
- subscription.canceled
- subscription.paused
- subscription.resumed
- subscription.past_due
- transaction.completed
- transaction.payment_failed

---

## 📧 Email System (Resend)

**Sending Address**: support@applypro.org

**Templates** (in `lib/emailTemplates.ts`):
1. `sendWelcomeEmail()` - New user welcome
2. `sendVerificationEmail()` - Email confirmation
3. `sendSubscriptionConfirmedEmail()` - Payment success
4. `sendSubscriptionCancelledEmail()` - Cancellation notice
5. `sendPaymentFailedEmail()` - Failed payment
6. `sendUsageAlertEmail()` - 80% usage warning
7. `sendLimitReachedEmail()` - 100% usage notice
8. `sendRenewalReminderEmail()` - Upcoming renewal

**Integration Points**:
- `/api/auth/register` → Verification email
- `/lib/authOptions.ts` (OAuth) → Welcome email
- `/api/paddle-webhook` → Payment emails
- `/api/generate` → Usage emails
- `/api/subscription/cancel` → Cancellation email

---

## 🎨 Document Generation (The Complex Part)

### How It Works:

1. **User generates content** (AI or builder)
2. **Content is parsed** by `parseResumeToStructure()` into structured data:
   ```typescript
   {
     name: string,
     contact: { email, phone, location, linkedin },
     summary: string,
     experience: [{ title, company, location, period, achievements[] }],
     education: [{ degree, school, period, details }],
     skills: { technical[], soft[], languages[] }
   }
   ```
3. **Template functions generate documents**:
   - `generateModernPDF()` / `generateModernDOCX()` - Two-column layout
   - `generateTraditionalPDF()` / `generateTraditionalDOCX()` - Classic single-column
   - `generateATSPDF()` / `generateATSDOCX()` - Simple ATS-friendly

### Modern Template Layout:

**PDF & DOCX:**
- **Left Sidebar** (65mm / 28%): Colored background
  - Contact
  - Education
  - Skills (categorized)
  - Certifications
  - Languages
- **Right Column** (remaining / 72%): Main content
  - Name (large, bold, colored)
  - Professional Summary
  - Professional Experience (with dates and bullets)
- **Top Accent Bar**: Colored bar across top

### Key Parsing Features:
- **Date Detection**: Multiple formats (Month YYYY, MM/YYYY, YYYY)
- **Section Detection**: ## headers, ALL CAPS, or keywords
- **Smart Categorization**: Auto-categorizes skills as technical/soft
- **Deduplication**: Removes duplicate job titles, company names
- **Proper Capitalization**: Handles acronyms (ICT, MBA, PhD) and title case

---

## 🔐 Authentication & Authorization

### Auth Flow:
1. **Registration**: Email/password with email verification required
2. **OAuth**: Google or GitHub (auto-verified)
3. **Session**: JWT-based sessions via NextAuth
4. **Protected Routes**: Redirect to login if not authenticated

### User Roles:
- **user** (default): Regular access
- **admin**: Full access (not currently used)

---

## 📊 Subscription Management

### Business Logic (`lib/subscription-db.ts`):

**Fair Use Limits**:
- Monthly/Yearly: 100 resumes per month
- Pay-Per-Use: 3 resumes total
- Cooldown: 30 seconds between generations
- Daily Alert: 50 resumes/day triggers notification
- Daily Suspend: 150 resumes/day auto-suspends account

**Key Functions**:
- `getUserSubscription()` - Get subscription with auto-reset
- `canUserGenerate()` - Check if user can generate
- `trackGeneration()` - Log generation to UsageLog

**Monthly Reset**:
- Checks if current month ≠ last reset month
- Auto-resets `monthlyUsageCount` to 0
- Updates `lastResetDate`

---

## 🚀 Key User Journeys

### Journey 1: Upload & Tailor (Main Feature)
1. User lands on homepage → "Tailor Your Resume"
2. Upload existing resume (PDF/DOCX)
3. Paste job description
4. Select template & color
5. Click "Generate Tailored Resume"
6. **Preview shows** (requires subscription for downloads):
   - Tailored Resume
   - ATS-Optimized Resume
   - Cover Letter
7. Download all three formats (PDF & DOCX)

### Journey 2: Build from Scratch
1. User clicks "Build from Scratch"
2. 7-step wizard collects information
3. Click "Generate Free Preview" (uses Claude Haiku - FREE)
4. See beautiful AI-enhanced preview with watermark
5. To download → Subscribe
6. Download PDF/DOCX with all formatting

### Journey 3: Subscription Purchase
1. User clicks "View Pricing"
2. Choose plan (Resume Pack / Pro Monthly / Pro Yearly)
3. Click purchase → Paddle overlay opens
4. Complete payment
5. Webhook updates database
6. User redirected to dashboard
7. Dashboard polls and shows "Active Subscription"

---

## 💡 Smart Features

### 1. Free AI Preview (Builder)
- **Cost Optimization**: Uses Claude Haiku (~$0.0001/request)
- **No Subscription Required**: Gets users excited about quality
- **Conversion Strategy**: See beautiful preview → Want to download → Subscribe
- **Watermark Protection**: Can't copy/paste or select text

### 2. Intelligent Skill Categorization
Auto-categorizes skills in resumes:
- Programming Languages: JavaScript, Python, Java, etc.
- Frontend Technologies: React, Vue, HTML5, CSS3
- Backend Development: Node.js, API Design, Database
- Leadership & Management: Team Management, Agile, Strategic Planning

### 3. Usage Tracking & Fair Use
- **Monthly Reset**: Usage resets on 1st of each month
- **Cooldown**: 30 seconds between generations (prevents spam)
- **Abuse Detection**: Auto-suspend if 150+ generations/day
- **Visual Indicators**: Dashboard shows usage (47/100), days until reset

### 4. Multi-Template Support
Three professional templates:
- **Modern**: Two-column, colored sidebar, professional
- **Traditional**: Classic single-column, serif font
- **ATS**: Simple, keyword-optimized, machine-readable

### 5. Post-Payment Polling
- After payment, dashboard polls `/api/user/subscription` every 1.5s
- Max 10 attempts (15 seconds total)
- Ensures subscription shows immediately after payment
- Clears `?payment=success` query param when done

---

## 🔒 Security Features

### Payment Security:
- Paddle handles all payment processing
- Webhook signature verification (HMAC SHA256)
- No credit card data stored locally

### Content Protection:
- Free previews have watermark
- Text selection disabled (`userSelect: none`)
- Copy/paste blocked (`onCopy` prevented)
- Right-click disabled (`onContextMenu` prevented)
- Downloads require active subscription + remaining credits

### API Security:
- Session validation on all protected endpoints
- Server-side subscription verification before downloads
- Rate limiting via cooldown periods
- Abuse detection and auto-suspension

---

## 📈 Analytics & Monitoring

### PostHog Events Tracked:
- `builder_step_completed` - User completes builder step
- `builder_resume_generated` - Preview generated
- `builder_resume_downloaded` - File downloaded
- `builder_preview_generated` - Free preview created
- `subscription_cancelled` - User cancels subscription
- `subscription_cancel_failed` - Cancellation error

### Sentry Monitoring:
- All errors auto-reported with stack traces
- Source maps uploaded for debugging
- Custom error pages (`app/global-error.tsx`)
- Performance monitoring enabled

---

## 🌐 Environment Variables

### Required:
```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://www.applypro.org"

# OAuth Providers
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_ID="..."
GITHUB_SECRET="..."

# AI (Anthropic Claude)
ANTHROPIC_API_KEY="..."

# Payments (Paddle)
PADDLE_API_KEY="..."
PADDLE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN="..."
NEXT_PUBLIC_PADDLE_ENV="sandbox" # or "production"
NEXT_PUBLIC_PADDLE_PRICE_MONTHLY="pri_..."
NEXT_PUBLIC_PADDLE_PRICE_YEARLY="pri_..."
NEXT_PUBLIC_PADDLE_PRICE_PAY_PER_USE="pri_..."

# Email (Resend)
RESEND_API_KEY="re_..."

# Monitoring
SENTRY_AUTH_TOKEN="..."
NEXT_PUBLIC_SENTRY_DSN="..."

# Analytics
NEXT_PUBLIC_POSTHOG_KEY="..."
NEXT_PUBLIC_POSTHOG_HOST="..."
```

---

## 🛠️ Development Setup

```bash
# Clone repository
git clone https://github.com/benrukundo/ApplyPro.git
cd ApplyPro

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in all required environment variables

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev

# Open browser
http://localhost:3000
```

---

## 🚢 Deployment

**Platform**: Vercel

**Build Command**: `npm run build`
**Output Directory**: `.next`
**Install Command**: `npm install`

**Environment Variables**: All env vars must be added to Vercel project settings

**Domain**: www.applypro.org (configured in Vercel + DNS)

---

## 🎯 Business Model

### Pricing Strategy:
1. **Freemium**: Free job tracker, ATS checker, resume score
2. **Pay-Per-Use**: $4.99 for 3 resumes (trying before subscribing)
3. **Subscription**: $19/month or $149/year for power users

### Revenue Streams:
- One-time purchases (Resume Packs)
- Monthly recurring ($19/month)
- Annual subscriptions ($149/year)

### Cost Structure:
- **AI Costs**:
  - Free preview: Claude Haiku (~$0.0001 per preview)
  - Paid generation: Claude Sonnet (~$0.003 per generation)
- **Infrastructure**: Vercel (hosting), PostgreSQL (database)
- **SaaS Tools**: Paddle (payment processing fees), Resend (email sends)

---

## 🐛 Known Issues & Future Improvements

### Current Limitations:
1. Job tracker is localStorage-based (not synced across devices)
2. No team/collaboration features
3. No resume versioning/history
4. Paddle in sandbox mode (not live payments yet)

### Planned Features:
1. Resume history & versioning
2. Job board integrations (LinkedIn, Indeed)
3. Interview preparation tips
4. Salary negotiation guides
5. Portfolio builder
6. Team accounts (recruiters)

---

## 📝 Recent Major Updates

### Latest Changes (December 2025):
1. **Cancel Subscription Flow**: Modal, API endpoint, Paddle integration
2. **Free AI Preview**: Claude Haiku for non-subscribers to see quality
3. **Improved Document Generation**: Complete rewrite with better parser
4. **Email Notifications**: 8 automated email templates
5. **Build-Resume Security**: Strict download protection, watermarks
6. **Modern Template**: Two-column layout matching across PDF/DOCX/Preview

### Recent UI/UX Fixes (December 2025):
1. **ATS Checker Page Redesign**:
   - Removed duplicate page footer (global layout handles this)
   - Added gradient + mesh background for visual consistency
   - Updated dropzone to match Generate page styling
   - Streamlined content and removed redundant sections
   - Improved results display with cleaner cards and better visual hierarchy
   - Removed unused dark mode classes for cleaner code
   - Stronger upgrade CTA after results with feature highlights
   - Fixed overall page structure and spacing

2. **Pricing Page Improvements**:
   - Redesigned with gradient + mesh background for consistency
   - Enhanced Pro Monthly card with stronger visual emphasis (scale, shadows, ring)
   - Added 'BEST VALUE' badge to yearly plan
   - Added trust signals (money-back guarantee, secure payment, cancel anytime)
   - Added free tools notice banner highlighting ATS Checker, Resume Builder, Job Tracker
   - Converted FAQ to accordion style with smooth animations
   - Improved card hover states and shadows throughout
   - Added color-coded checkmarks per plan (blue, purple, green themes)
   - Better button styling with gradients and improved CTAs

3. **Navigation Cleanup**:
   - Removed redundant 'Back to Home' links from all pages (navbar handles this)
   - Cleaned up unused ArrowLeft imports
   - Improved professional appearance with cleaner layouts
   - Consistent navigation experience across the application

4. **Code Quality Improvements**:
   - Removed duplicate footer code and unused imports
   - Improved TypeScript compilation and error handling
   - Better responsive design and mobile optimization
   - Enhanced accessibility and user experience

---

## 🤝 How to Contribute

1. **Check Issues**: Look for open issues or create new ones
2. **Branch Naming**: `feature/name` or `fix/issue-name`
3. **Commit Messages**: Use conventional commits
4. **Testing**: Test all three templates (Modern, Traditional, ATS)
5. **Pull Request**: Describe changes, attach screenshots

---

## 📞 Support & Contact

- **Email**: support@applypro.org
- **GitHub**: https://github.com/benrukundo/ApplyPro
- **Website**: https://www.applypro.org
- **Sentry**: https://sentry.io (error tracking)

---

## 📚 Additional Resources

### Documentation:
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs
- Anthropic Claude: https://docs.anthropic.com
- Paddle: https://developer.paddle.com
- NextAuth: https://next-auth.js.org

### Code Style:
- TypeScript strict mode
- ESLint + Prettier configured
- Tailwind CSS for styling (no custom CSS)
- Server Components by default, Client Components when needed

---

**Last Updated**: December 20, 2025
**Version**: 1.0.0
**Status**: Active Development

---

## Quick Start for New Developers

1. Read this document fully
2. Set up local environment (see Development Setup)
3. Explore the codebase starting with:
   - `app/page.tsx` (landing page)
   - `app/generate/page.tsx` (main resume feature)
   - `lib/documentGenerator.ts` (PDF/DOCX generation)
4. Test the user flows (upload resume, build from scratch, subscribe)
5. Ask questions in team chat or create GitHub issues

Welcome to ApplyPro! 🎉
