# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ApplyPro is an AI-powered resume tailoring service that helps users customize their resumes for specific job applications. The app uses Next.js 16 with the App Router, React 19, TypeScript, and Tailwind CSS v4.

**Tech Stack:**
- Next.js 16 (App Router)
- Anthropic Claude API for AI generation
- Gumroad for payments
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
- `app/globals.css` - Global styles with Tailwind CSS imports and CSS variables

### Key Features

**Homepage (`/`)**
- Hero section with gradient text
- "How It Works" - 3-step process explanation
- Pricing section ($4.99 per resume)
- CTA buttons linking to `/generate`

**Generate Page (`/generate`)**
- Client-side component with file upload
- Drag & drop support for PDF and DOCX files
- Text extraction from uploaded resumes
- Job description textarea with character counter (min 100 chars)
- Two-column responsive layout
- Loading states and validation
- Calls `/api/preview` for free analysis
- Displays results with:
  - Match score with progress bar (color-coded: green >70%, yellow 50-70%, red <50%)
  - Top 5 improvements list
  - Missing ATS keywords as badges
  - Preview text of tailored resume
  - Gumroad purchase CTA for full resume (https://laurabi.gumroad.com/l/ykchtv)
- Saves resume text and job description to localStorage before Gumroad redirect
- "Try Another Resume" button to reset form

**Success Page (`/success`)**
- Verifies `?payment=true` URL parameter, redirects to home if missing
- Loads saved resume text and job description from localStorage
- Simple textareas for resume text and job description (no file upload)
- "Generate Full Resume" button calls `/api/generate`
- Shows loading state: "Generating your tailored resume..."
- Displays results:
  - Full tailored resume
  - Full cover letter
  - **PDF Download** (using jsPDF):
    - Professional formatting with blue header
    - Resume and cover letter on separate pages
    - Proper text wrapping and page breaks
    - Filename: `Resume_Tailored_YYYY-MM-DD.pdf`
  - **DOCX Download** (using docx library):
    - Word document with professional styling
    - Bold section headers
    - Proper paragraph spacing
    - Page break between resume and cover letter
    - Filename: `Resume_Tailored_YYYY-MM-DD.docx`
  - Loading states on download buttons
  - Error handling for download failures
  - "Generate Another Resume" button to reset
- Payment success banner with celebration emoji

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
- Generates complete tailored resume and cover letter after payment
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
  - `tailoredResume` (complete formatted resume)
  - `coverLetter` (personalized cover letter)
  - `matchScore` (0-100)
- Cost: ~$0.035 per generation (~99% profit margin at $4.99)
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
ANTHROPIC_API_KEY=your_api_key_here
```

**Note:** Get your API key from [Anthropic Console](https://console.anthropic.com/). The preview API uses Claude 3 Haiku model for cost-effective analysis (~$0.005 per preview).

## Important Notes

### Pricing & Economics
- Free preview uses Claude 3 Haiku (~$0.005 per analysis)
- Full resume generation uses Claude Sonnet 4 (~$0.035 per generation)
- Pricing: $4.99 per resume via Gumroad
- Profit margin: ~99% per paid generation
- Cost breakdown:
  - Input tokens: ~1500 × $3/M = $0.0045
  - Output tokens: ~2000 × $15/M = $0.03
  - Total: ~$0.035 per generation

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
- Gumroad account with product set up
- Vercel account (recommended) or other Next.js hosting

### Environment Variables Required

**Production (.env.production):**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_GUMROAD_URL=https://laurabi.gumroad.com/l/ykchtv
```

**Local Development (.env.local):**
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GUMROAD_URL=https://laurabi.gumroad.com/l/ykchtv
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
   - Add `NEXT_PUBLIC_APP_URL` with your Vercel domain
   - Add `NEXT_PUBLIC_GUMROAD_URL` with Gumroad product URL

4. **Deploy:**
   - Vercel will automatically deploy on push to main branch
   - First deployment may take 2-3 minutes
   - Check deployment logs for any errors

### Post-Deployment Configuration

1. **Update Gumroad Settings:**
   - Go to Gumroad product settings
   - Set redirect URL to: `https://your-domain.vercel.app/success?payment=true`
   - Test payment flow to ensure redirect works

2. **Test All Features:**
   - [ ] Homepage loads correctly
   - [ ] Generate page file upload works
   - [ ] Preview API returns results
   - [ ] Gumroad payment flow works
   - [ ] Success page generates resume
   - [ ] PDF download works
   - [ ] DOCX download works

3. **Monitor API Usage:**
   - Check Anthropic Console for API usage
   - Monitor costs (should be ~$0.005 per preview, ~$0.035 per full generation)
   - Set up billing alerts if needed

4. **Set up Domain (Optional):**
   - Add custom domain in Vercel settings
   - Update `NEXT_PUBLIC_APP_URL` environment variable
   - Update Gumroad redirect URL

### Security Checklist
- [ ] `.env.local` is in `.gitignore`
- [ ] `ANTHROPIC_API_KEY` is never exposed in client-side code
- [ ] API routes validate all inputs
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

**Gumroad redirect not working:**
- Ensure redirect URL matches exactly (including `?payment=true`)
- Check Gumroad product settings
- Test in incognito mode to avoid cached redirects

### Cost Management

**Expected Costs (per month):**
- 100 free previews: ~$0.50
- 20 paid generations: ~$0.70
- **Total API cost: ~$1.20/month**
- Revenue (20 sales): ~$99.80
- **Profit: ~$98.60 (98.8% margin)**

**To reduce costs:**
- Cache common job descriptions (if applicable)
- Implement rate limiting per user
- Monitor for abuse/spam usage
