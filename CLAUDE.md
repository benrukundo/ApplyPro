# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ApplyPro is an AI-powered resume tailoring service that helps users customize their resumes for specific job applications. The app uses Next.js 16 with the App Router, React 19, TypeScript, and Tailwind CSS v4.

**Tech Stack:**
- Next.js 16 (App Router)
- Anthropic Claude API for AI generation
- NextAuth.js for authentication (Google OAuth)
- Prisma ORM with PostgreSQL database
- react-dropzone for file uploads (generate page only)
- mammoth for DOCX parsing (generate page only)
- pdf-parse for PDF parsing (generate page only)
- jsPDF for PDF generation
- docx for Word document generation
- file-saver for file downloads

## Development Commands

### Running the Development Server
```bash
npm run dev
```
Starts the development server at http://localhost:3000 with hot reload enabled.

### Building for Production
```bash
npm run build
```
Creates an optimized production build.

### Starting Production Server
```bash
npm start
```
Starts the production server (requires running `npm run build` first).

### Linting
```bash
npm run lint
```
Runs ESLint to check for code quality issues.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: v19.2.0
- **TypeScript**: v5
- **Styling**: Tailwind CSS v4 with PostCSS
- **Fonts**: Geist Sans and Geist Mono (via next/font)
- **Linting**: ESLint with Next.js config

## Architecture

### App Router Structure
This project uses the Next.js App Router (not Pages Router). All routes are defined in the `app/` directory:

- `app/layout.tsx` - Root layout component that wraps all pages, defines HTML structure and metadata
- `app/page.tsx` - Homepage with hero, how it works, and pricing sections
- `app/generate/page.tsx` - Resume generation page with file upload and job description input
- `app/coming-soon/page.tsx` - Coming soon page for payment system (redirects all purchase/subscribe buttons here)
- `app/pricing/page.tsx` - Detailed pricing page with plan comparison
- `app/globals.css` - Global styles with Tailwind CSS imports and CSS variables

### Key Features

**Homepage (`/`)**
- Hero section with gradient text
- "How It Works" - 3-step process explanation
- Pricing section with three tiers: Free, Pay-Per-Use ($4.99 for 3 resumes), Pro ($19.99/month)
- All purchase/subscribe buttons redirect to `/coming-soon` page
- CTA buttons linking to `/generate`

**Coming Soon Page (`/coming-soon`)**
- Displays when users click on any purchase or subscribe buttons
- Email notification signup form for launch updates
- Links to free features (ATS Checker, Templates)
- Professional waiting page explaining payment system is in development

**Generate Page (`/generate`)**
- Requires authentication with Google OAuth (NextAuth.js)
- Checks user subscription status before allowing generation
- Client-side component with file upload
- Drag & drop support for PDF and DOCX files
- Text extraction from uploaded resumes
- Job description textarea with character counter (min 100 chars)
- Two-column responsive layout
- Two buttons:
  - "Analyze Resume" - Calls `/api/preview` for free analysis preview
  - "Generate Full Resume" - Requires active subscription, generates full tailored resume
- Displays analysis results with match scores, keywords, and improvements
- Displays generated resume results with three versions:
  - Full tailored resume
  - ATS-optimized version
  - Cover letter
- Download options in PDF or DOCX format
- Template selection (Modern, Traditional, ATS-Optimized)
- Tracks usage count for subscription limits
- "Generate Another Resume" button to reset form

**Pricing Page (`/pricing`)**
- Detailed pricing comparison table
- Three pricing tiers:
  - Free: ATS Checker, Resume Score Dashboard, Job Application Tracker (up to 25 apps)
  - Pay-Per-Use: $4.99 for 3 AI-tailored resumes
  - Pro: $19.99/month for unlimited resumes (100/month fair use limit)
- All purchase/subscribe buttons redirect to `/coming-soon` page
- FAQ section with common questions
- Fair use policy explanation

**Success Page (`/success`)** (Legacy - may be deprecated)
- Previously used for Gumroad payment success redirects
- Now that payment is moved to coming soon page, this may not be actively used

### API Routes

**Preview Analysis (`POST /api/preview`)**
- Generates a free preview analysis using Claude API
- Input: `resumeText` and `jobDescription`
- Uses `claude-3-haiku-20240307` model for cost efficiency
- Max 500 tokens to keep costs low (~$0.005 per call)
- Returns:
  - `matchScore` (0-100)
  - `improvements` (top 5 specific suggestions)
  - `missingKeywords` (3 ATS keywords)
  - `previewText` (100-word preview of tailored resume)
- Includes comprehensive error handling and input validation

**Full Resume Generation (`POST /api/generate`)**
- Generates complete tailored resume and cover letter for authenticated users with active subscriptions
- Requires authentication via NextAuth.js
- Checks subscription status and usage limits before generation
- Input: `resumeText` and `jobDescription`
- Uses `claude-sonnet-4-20250514` for high quality
- Max 4000 tokens for complete content
- Comprehensive prompt with expert resume writing instructions:
  - Maintains all truthful information from original
  - Optimizes for ATS with job description keywords
  - Quantifies achievements
  - Uses strong action verbs
  - Professional formatting
  - Tailored cover letter (250-350 words)
- Returns:
  - `fullResume` (complete formatted resume)
  - `atsOptimizedResume` (ATS-friendly version)
  - `coverLetter` (personalized cover letter)
  - `matchScore` (0-100)
- Tracks generation in database for usage limits
- Cost: ~$0.035 per generation
- Advanced error handling with fallback parsing
- Content quality validation

### Path Aliases
The project uses `@/*` as an alias for root-level imports (configured in `tsconfig.json`):
```typescript
import Component from "@/components/Component"
```

### Styling Approach
- Tailwind CSS v4 with the new PostCSS plugin (`@tailwindcss/postcss`)
- Global CSS variables for theming (`--background`, `--foreground`)
- Dark mode support via `prefers-color-scheme`
- Inline theme configuration using `@theme inline` in `globals.css`

### TypeScript Configuration
- Target: ES2017
- Strict mode enabled
- JSX mode: `react-jsx` (uses React 19's new JSX transform)
- Module resolution: `bundler` (optimized for modern bundlers)

## Environment Variables

The project requires the following environment variables in `.env.local`:

```bash
# Anthropic API
ANTHROPIC_API_KEY=your_api_key_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database
DATABASE_URL=your_postgresql_connection_string
```

**Note:**
- Get your Anthropic API key from [Anthropic Console](https://console.anthropic.com/)
- Set up Google OAuth credentials at [Google Cloud Console](https://console.cloud.google.com/)
- Use a PostgreSQL database (can use services like Neon, Supabase, or Railway)

## Important Notes

### Pricing & Economics
- Free preview uses Claude 3 Haiku (~$0.005 per analysis)
- Full resume generation uses Claude Sonnet 4 (~$0.035 per generation)
- Pricing (when payment system launches):
  - Free: ATS Checker, Job Tracker (up to 25 applications)
  - Pay-Per-Use: $4.99 for 3 resume generations
  - Pro Monthly: $19.99/month for unlimited (100/month fair use)
  - Pro Yearly: $199/year (17% savings)
- Cost breakdown per generation:
  - Input tokens: ~1500 × $3/M = $0.0045
  - Output tokens: ~2000 × $15/M = $0.03
  - Total: ~$0.035 per generation
- **Note:** Payment system is currently in development. All purchase buttons redirect to `/coming-soon` page.

### File Upload Constraints
- Maximum file size: 5MB
- Supported formats: PDF (.pdf) and DOCX (.docx)
- Text extraction is performed client-side using mammoth (DOCX) and pdf-parse (PDF)

### Next.js 16 Features
This project uses Next.js 16, which may have different conventions than older versions. Refer to the latest Next.js documentation when making changes.

### React 19
The project uses React 19, which includes new features and may have different patterns than React 18. Be mindful of breaking changes.

### Tailwind CSS v4
Uses the new Tailwind CSS v4 architecture with PostCSS plugin. Configuration is done via CSS (`@theme inline`) rather than a separate config file.

### Font Optimization
Uses next/font for automatic font optimization with Geist font family. Font variables are applied at the body level and can be referenced in Tailwind classes.

## Deployment Guide

### Prerequisites
- Anthropic API key from [Anthropic Console](https://console.anthropic.com/)
- Google Cloud Platform account for OAuth setup
- PostgreSQL database (Neon, Supabase, Railway, etc.)
- Vercel account (recommended) or other Next.js hosting

### Environment Variables Required

**Production (.env.production):**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_production_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=your_postgresql_connection_string
```

**Local Development (.env.local):**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_dev_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=your_postgresql_connection_string
```

### Vercel Deployment Steps

1. **Push to Git Repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Select the repository

3. **Configure Environment Variables:**
   - In Vercel project settings → Environment Variables
   - Add `ANTHROPIC_API_KEY` (keep secret, don't expose to browser)
   - Add `NEXTAUTH_URL` with your Vercel domain
   - Add `NEXTAUTH_SECRET` (generate with `openssl rand -base64 32`)
   - Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - Add `DATABASE_URL` with PostgreSQL connection string

4. **Set up Database:**
   - Run Prisma migrations: `npx prisma migrate deploy`
   - Generate Prisma client: `npx prisma generate`

5. **Deploy:**
   - Vercel will automatically deploy on push to main branch
   - First deployment may take 2-3 minutes
   - Check deployment logs for any errors

### Post-Deployment Configuration

1. **Configure Google OAuth:**
   - Add production URL to authorized redirect URIs in Google Cloud Console
   - Format: `https://your-domain.vercel.app/api/auth/callback/google`

2. **Test All Features:**
   - [ ] Homepage loads correctly
   - [ ] Google OAuth login works
   - [ ] Generate page requires authentication
   - [ ] Preview API returns results
   - [ ] Full resume generation works for authenticated users
   - [ ] Coming soon page displays for payment buttons
   - [ ] PDF download works
   - [ ] DOCX download works

3. **Monitor API Usage:**
   - Check Anthropic Console for API usage
   - Monitor costs (should be ~$0.005 per preview, ~$0.035 per full generation)
   - Set up billing alerts if needed

4. **Set up Domain (Optional):**
   - Add custom domain in Vercel settings
   - Update `NEXTAUTH_URL` environment variable
   - Update Google OAuth authorized redirect URIs

### Security Checklist
- [ ] `.env.local` is in `.gitignore`
- [ ] `ANTHROPIC_API_KEY` is never exposed in client-side code
- [ ] `NEXTAUTH_SECRET` is secure and unique
- [ ] Database connection string is secure
- [ ] API routes validate all inputs and check authentication
- [ ] Rate limiting considered for production (can add middleware)
- [ ] CORS headers configured if needed

### Troubleshooting

**Build fails:**
- Check Node.js version (requires 18+)
- Ensure all dependencies in package.json
- Check build logs for specific errors

**API errors in production:**
- Verify `ANTHROPIC_API_KEY` is set in Vercel environment variables
- Check API key has sufficient credits
- Review API error logs in browser console

**Authentication issues:**
- Verify Google OAuth credentials are correct
- Check authorized redirect URIs in Google Cloud Console
- Ensure `NEXTAUTH_URL` matches your domain
- Verify `NEXTAUTH_SECRET` is set

**Database connection errors:**
- Verify `DATABASE_URL` is correct
- Check database service is running
- Ensure Prisma migrations are applied

### Cost Management

**Expected Costs (per month) - Once Payment System Launches:**
- 100 free previews: ~$0.50
- 50 full generations: ~$1.75
- Database hosting: ~$0-5 (depends on provider)
- **Total API cost: ~$2.25-7.25/month**
- Revenue estimate (10 Pro subscribers): ~$199.90/month
- **Profit: ~$192-197/month**

**Current Status:**
- Payment system is in development
- All purchase/subscribe buttons redirect to `/coming-soon` page
- Users can still use free preview features

**To reduce costs:**
- Cache common job descriptions (if applicable)
- Implement rate limiting per user
- Monitor for abuse/spam usage
- Track usage metrics in database
