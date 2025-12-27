# ApplyPro - AI-Powered Resume Builder & Job Application Tracker

![ApplyPro](https://img.shields.io/badge/ApplyPro-AI%20Resume%20Builder-blue?style=for-the-badge&logo=nextdotjs)
![Live](https://img.shields.io/badge/Live-applypro.org-green?style=flat&logo=vercel)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript)
![Dodo Payments](https://img.shields.io/badge/Dodo%20Payments-Ready-green?style=flat)

ApplyPro is a comprehensive AI-powered SaaS platform that helps job seekers create professional, ATS-optimized resumes and track their job applications. Using Claude AI, it provides intelligent resume tailoring, a complete resume builder, and advanced job application management tools.

## 🚀 Live Demo

**🌐 [applypro.org](https://www.applypro.org)** - Try it now!

## ✨ Core Features

### 🎯 AI Resume Generation
- **Upload & Tailor**: Upload existing resume + paste job description
- **AI Optimization**: Claude Sonnet 4 creates job-specific resumes
- **Three Outputs**: Tailored Resume + ATS-Optimized Resume + Cover Letter
- **Multiple Templates**: Modern (two-column), Traditional, ATS-Optimized
- **Export Formats**: PDF and DOCX downloads

### 🏗️ Resume Builder (Build from Scratch)
- **7-Step Wizard**: Complete guided resume creation
- **Free AI Preview**: See results before subscribing (Claude Haiku)
- **Smart Features**: Industry-specific skills, intelligent categorization
- **Auto-Save**: Progress saved to database
- **Professional Templates**: Choose design and color themes

### 📊 Job Application Tracker
- **Track Applications**: Company, position, status, follow-ups
- **Status Workflow**: Saved → Applied → Interview → Offer → Rejected
- **Statistics Dashboard**: Success rates and analytics
- **Free for All**: 25 applications limit (no subscription required)

### 🎨 Modern UI/UX
- **Responsive Navigation**: 
  - Desktop sidebar with collapsible sections
  - Mobile-optimized drawer navigation
  - Top header with user profile dropdown (desktop)
  - Bottom navigation with user menu (mobile)
- **Professional Interface**: Gradient backgrounds, smooth animations, modern design
- **Consistent Branding**: Blue/purple gradient theme throughout
- **Account Settings**: Complete profile, password, and subscription management

### 💳 Advanced Subscription Management
- **Three Plans**:
  - **Resume Pack**: $4.99 (3 resume generations)
  - **Pro Monthly**: $19/month (100 resumes)
  - **Pro Yearly**: $149/year (100 resumes, save 35%)
- **Payment Provider**: Dodo Payments (production-ready)
- **Customer Portal**: Direct billing management access
- **Cancel Auto-Renewal**: Pause/resume subscription anytime
- **Smart Credits**: Intelligent credit priority management

### ⚙️ Complete Account Management
- **Profile Settings**: Update name, view email, manage avatar
- **Password Management**: Change password with validation
- **Account Deletion**: Secure account deletion with confirmation
- **Subscription Overview**: View plan, usage, and billing details
- **OAuth Support**: Special handling for Google/GitHub accounts

### 📧 Email Notifications
- Welcome emails, verification, payment confirmations
- Usage alerts, renewal reminders, subscription updates
- Professional templates via Resend API

### 🔐 Authentication
- NextAuth.js with Google, GitHub, and email/password
- Email verification required
- Secure session management

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router, Server Components)
- **TypeScript** (strict mode)
- **Tailwind CSS** (responsive design)
- **Lucide React** (icons)
- **PostHog** (analytics)

### Backend
- **Next.js API Routes** (serverless functions)
- **Prisma ORM** + PostgreSQL database
- **Anthropic Claude API**:
  - **Sonnet 4**: Paid resume generations (~$0.035 each)
  - **Haiku 3.5**: Free previews (~$0.0001 each)
- **Dodo Payments** (subscription & one-time payments)
- **Resend** (transactional emails)

### Document Processing
- **File Upload**: react-dropzone, mammoth, pdf-parse
- **Document Generation**: jsPDF, docx, file-saver
- **Template Engine**: Custom layout system for PDFs/DOCX

### Infrastructure
- **Deployment**: Vercel (recommended)
- **Database**: PostgreSQL (via Prisma)
- **Monitoring**: Sentry (error tracking)
- **Analytics**: PostHog (user analytics)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or hosted)
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- Dodo Payments account ([Get one here](https://dodopayments.com/))
- Resend account for emails ([Get one here](https://resend.com/))

## 🔧 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/benrukundo/ApplyPro.git
   cd ApplyPro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Copy the example file and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   ```bash
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/applypro"

   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"

   # AI (Anthropic)
   ANTHROPIC_API_KEY="sk-ant-api03-..."

   # Payments (Dodo)
   DODO_PAYMENTS_API_KEY="sk_test_..."
   NEXT_PUBLIC_DODO_PRICE_MONTHLY="price_..."
   NEXT_PUBLIC_DODO_PRICE_YEARLY="price_..."
   NEXT_PUBLIC_DODO_PRICE_PAY_PER_USE="price_..."

   # Email (Resend)
   RESEND_API_KEY="re_..."

   # Analytics (PostHog)
   NEXT_PUBLIC_POSTHOG_KEY="phc_..."
   NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"

   # Monitoring (Sentry)
   SENTRY_AUTH_TOKEN="..."
   NEXT_PUBLIC_SENTRY_DSN="..."
   ```

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Push schema to database
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/applypro` |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | `your-random-secret-string` |
| `NEXTAUTH_URL` | Your application URL | `http://localhost:3000` |
| `ANTHROPIC_API_KEY` | Anthropic API key (server-side only) | `sk-ant-api03-...` |
| `DODO_PAYMENTS_API_KEY` | Dodo Payments API key | `sk_test_...` |
| `NEXT_PUBLIC_DODO_PRICE_*` | Dodo product IDs (client-side) | `price_abc123...` |
| `RESEND_API_KEY` | Resend email API key | `re_abc123...` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog analytics key | `phc_abc123...` |
| `SENTRY_AUTH_TOKEN` | Sentry monitoring token | `sntrys_...` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (client-side) | `https://abc123@sentry.io/123` |

### OAuth Providers (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789-abc...` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-...` |
| `GITHUB_ID` | GitHub OAuth app ID | `Iv1.abc123...` |
| `GITHUB_SECRET` | GitHub OAuth client secret | `ghp_...` |

### Security Notes

- Never commit `.env.local` to version control
- API keys should never be exposed to the browser (no `NEXT_PUBLIC_` prefix)
- Use `NEXT_PUBLIC_` prefix only for variables that need client-side access
- Store secrets securely and rotate them regularly

## 📁 Project Structure

```
applypro/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API Routes
│   │   ├── admin/                # Admin utilities
│   │   │   └── sync-customer/    # Customer ID sync for billing portal
│   │   ├── auth/                 # NextAuth authentication
│   │   ├── dodo-checkout/        # Dodo payment integration
│   │   ├── dodo-portal/          # Customer billing portal access
│   │   ├── dodo-webhook/         # Dodo payment webhooks
│   │   ├── subscription/         # Subscription management
│   │   │   ├── cancel-renewal/   # Pause/resume auto-renewal
│   │   │   └── schedule-change/  # Plan upgrades
│   │   └── user/                 # User management endpoints
│   │       ├── subscription/     # Get subscription info
│   │       ├── profile/          # Update profile (name)
│   │       ├── password/         # Change password
│   │       └── account/          # Delete account
│   ├── (app)/                    # Authenticated app pages
│   │   ├── dashboard/            # User dashboard
│   │   │   └── subscription/     # Complete billing management
│   │   ├── settings/             # Account settings page
│   │   ├── generate/             # AI resume generation
│   │   ├── build-resume/         # Resume builder wizard
│   │   ├── tracker/              # Job application tracker
│   │   ├── ats-checker/          # ATS resume checker
│   │   ├── interview-prep/       # Interview preparation
│   │   └── linkedin-optimizer/   # LinkedIn profile optimizer
│   ├── (public)/                 # Public pages
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/              # Subscription plans
│   │   ├── faq/                  # Frequently asked questions
│   │   ├── login/ & signup/      # Authentication
│   │   ├── terms/ & privacy/     # Legal pages
│   │   └── contact/              # Contact form
│   ├── components/               # Shared React components
│   │   ├── AppNavigation.tsx     # Main app sidebar
│   │   ├── TopHeader.tsx         # Desktop top header with user menu
│   │   ├── MobileUserMenu.tsx    # Mobile bottom user menu
│   │   ├── Navbar.tsx            # Public site navbar
│   │   └── Footer.tsx            # Site footer
│   └── global-error.tsx          # Sentry error boundary
├── components/                   # Feature components
│   ├── CreditDisplay.tsx         # Smart credit management UI
│   ├── DodoCheckout.tsx          # Dodo payment integration
│   └── PostHogProvider.tsx       # Analytics provider
├── lib/                          # Business logic & utilities
│   ├── documentGenerator.ts      # PDF/DOCX generation
│   ├── subscription-db.ts        # Subscription logic
│   ├── emailTemplates.ts         # Email templates (Resend)
│   └── authOptions.ts            # NextAuth configuration
├── prisma/                       # Database
│   └── schema.prisma             # Prisma schema
├── public/                       # Static assets
└── package.json
```

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. **Push to Git:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository
   - Configure environment variables in Vercel dashboard

3. **Set Environment Variables in Vercel:**
   - `DATABASE_URL` (PostgreSQL connection string)
   - `ANTHROPIC_API_KEY`
   - `DODO_PAYMENTS_API_KEY`
   - `NEXT_PUBLIC_DODO_PRICE_*` (product IDs)
   - `RESEND_API_KEY`
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `SENTRY_AUTH_TOKEN`
   - OAuth credentials (if using social login)

4. **Deploy:**
   - Vercel will automatically build and deploy
   - Set up PostgreSQL database (Vercel Postgres or external provider)
   - Run `npx prisma db push` to deploy schema

5. **Configure Dodo Payments:**
   - Set webhook URL to: `https://your-domain.vercel.app/api/dodo-webhook`
   - Configure product IDs in environment variables

### Alternative Hosting

The app can be deployed to any platform that supports Next.js:
- Netlify (with serverless functions)
- Railway
- AWS Amplify
- DigitalOcean App Platform
- Self-hosted on VPS

### Database Setup

**PostgreSQL is required** for full functionality:
- Vercel Postgres (recommended for Vercel deployments)
- Supabase
- PlanetScale
- AWS RDS
- Self-hosted PostgreSQL

See [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) for detailed technical documentation.

## 💰 Pricing & Economics

### API Costs (Anthropic Claude)
- **Free Preview**: ~$0.0001 per analysis (Claude Haiku 3.5)
- **Full Resume Generation**: ~$0.035 per generation (Claude Sonnet 4)
- **Builder Preview**: ~$0.0001 per preview (Claude Haiku 3.5)

### Revenue Model
- **Resume Pack**: $4.99 (3 generations) - $0.011/generation after costs
- **Pro Monthly**: $19/month (100 generations) - $0.19/generation after costs
- **Pro Yearly**: $149/year (100 generations) - $1.49/generation after costs

### Profit Margins
- **Resume Pack**: ~99.8% profit margin
- **Pro Monthly**: ~99% profit margin
- **Pro Yearly**: ~99% profit margin (35% discount for customers)
- **Example**: 100 monthly subscribers = $1,900 revenue - $20 costs = **$1,880 profit**

## 🧪 Testing

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

### Lint Code
```bash
npm run lint
```

## 📚 Key Features Walkthrough

### 1. Homepage (`/`)
- Value proposition and benefits
- Feature showcase (AI generation, builder, tracker)
- Pricing information with plan comparisons
- Social proof and testimonials
- CTA to generate or build resume

### 2. AI Resume Generation (`/generate`)
- Upload existing resume (PDF/DOCX) or paste text
- Paste job description or LinkedIn URL
- Get free preview with:
  - Match score (0-100)
  - Top improvements and suggestions
  - Missing ATS keywords analysis
  - Preview of tailored resume (watermarked)
- Direct checkout with Dodo Payments

### 3. Resume Builder (`/build-resume`)
- 7-step guided wizard:
  1. Target job details
  2. Personal information
  3. Education history
  4. Work experience
  5. Skills (auto-categorized)
  6. Professional summary
  7. Template selection
- Free AI preview at any step
- Auto-save progress to database
- Professional templates with color themes

### 4. Job Application Tracker (`/tracker`)
- Add/edit job applications
- Status workflow management
- Follow-up reminders
- Statistics dashboard
- Cross-device sync (localStorage)
- Free for all users (25 application limit)

### 5. Subscription Dashboard (`/dashboard/subscription`)
- Current plan details and usage
- Payment method management
- Customer portal access (Dodo)
- Cancel/resume auto-renewal
- Billing history and invoices
- Smart credit display and management

### 6. Post-Payment Success
- Full resume generation (paid)
- Complete tailored resume + ATS version + cover letter
- Download as PDF or DOCX
- Professional formatting and templates

### 7. Account Settings (`/settings`)
- View current subscription plan with upgrade options
- Edit profile information (first/last name)
- Update account avatar display
- Change password with validation
- OAuth account detection (Google/GitHub)
- Secure account deletion with confirmation modal
- Real-time success/error feedback

## 🔒 Security

### Payment Security
- Dodo Payments handles all payment processing and PCI compliance
- Webhook signature verification (HMAC SHA256)
- Customer portal access with secure session tokens
- No credit card data stored locally

### API Security
- Session-based authentication on all protected endpoints
- Server-side subscription verification before content access
- Rate limiting via cooldown periods and usage tracking
- Input validation and sanitization on all API routes
- Abuse detection and auto-suspension for excessive usage

### Content Protection
- Free previews include watermarks and selection restrictions
- Text selection disabled (`userSelect: none`)
- Copy/paste blocked (`onCopy` prevented)
- Right-click disabled (`onContextMenu` prevented)
- Downloads require active subscription + available credits

### Data Security
- API keys stored in environment variables (never in code)
- Database encryption and secure connections
- User data encrypted at rest
- GDPR-compliant data handling

## 🐛 Troubleshooting

### Common Issues

**Database Connection Error**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running (for local development)
- Check database credentials and permissions

**API Error: Model not found**
- Verify Anthropic API key has access to Claude models
- Check API key credits and billing status
- Ensure `ANTHROPIC_API_KEY` is set correctly

**Payment Integration Issues**
- Confirm Dodo Payments API key is valid
- Check product IDs match Dodo dashboard
- Verify webhook URL is correctly configured
- Test with Dodo's sandbox environment first

**Build Fails**
- Ensure Node.js version 18+
- Clear cache: `rm -rf node_modules .next`
- Reinstall: `npm install`
- Check for TypeScript errors

**Webhook Not Receiving Events**
- Confirm webhook URL is accessible from Dodo
- Check webhook signature verification
- Review server logs for webhook processing errors

**Customer Portal Access Issues**
- Ensure customer ID is synced (use `/api/admin/sync-customer`)
- Check Dodo Payments dashboard for customer status
- Verify portal session creation is working

## 📝 License

This project is proprietary and confidential.

## 🤝 Support

For issues or questions:
- Check [CLAUDE.md](./CLAUDE.md) for detailed documentation
- Review troubleshooting section above
- Contact: [your-email@example.com]

## 🎯 Future Enhancements

- [x] Complete account settings page
- [x] Profile and password management
- [x] Modern navigation system
- [x] User menu with avatar display
- [x] FAQ page with contact form
- [ ] Multiple resume templates
- [ ] LinkedIn profile optimization
- [ ] Batch processing for multiple jobs
- [ ] Analytics dashboard
- [ ] Email delivery of resumes
- [ ] Resume history and storage
- [ ] Team/collaboration features

---

Built with ❤️ using Next.js
