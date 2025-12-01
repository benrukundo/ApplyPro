# ApplyPro Deployment Checklist

Use this checklist to ensure a smooth deployment to production.

## Pre-Deployment Checklist

### Code Ready
- [ ] All features tested locally
- [ ] Build succeeds without errors: `npm run build`
- [ ] No console errors in browser
- [ ] Linting passes: `npm run lint`
- [ ] All environment variables documented

### Security
- [ ] `.env.local` is in `.gitignore`
- [ ] No API keys committed to repository
- [ ] API routes validate all inputs
- [ ] No sensitive data in client-side code

### Environment Variables
- [ ] `ANTHROPIC_API_KEY` obtained from Anthropic Console
- [ ] `.env.local.example` is up to date
- [ ] `.env.production` configured (without actual keys)

## Deployment Steps

### 1. Git Repository Setup
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment"

# Add remote (GitHub, GitLab, etc.)
git remote add origin your-repo-url

# Push to main branch
git push -u origin main
```

### 2. Vercel Setup
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Click "Add New Project"
- [ ] Import your Git repository
- [ ] Select the repository

### 3. Configure Environment Variables in Vercel
Navigate to: Project Settings → Environment Variables

Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | Your Vercel domain | Production |
| `NEXT_PUBLIC_GUMROAD_URL` | `https://laurabi.gumroad.com/l/ykchtv` | Production, Preview, Development |

**Important**:
- Copy values exactly
- Don't include quotes unless they're part of the value
- Verify there are no extra spaces

### 4. Deploy
- [ ] Click "Deploy" in Vercel
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Check deployment logs for errors
- [ ] Visit deployed URL to verify it works

## Post-Deployment Steps

### 1. Test Core Features
- [ ] Homepage loads correctly
- [ ] Navigate to `/generate` page
- [ ] Upload a test resume (PDF or DOCX)
- [ ] Paste a job description
- [ ] Click "Analyze Resume - Free Preview"
- [ ] Verify preview results show correctly
- [ ] Click "Get Full Resume - $4.99" button

### 2. Configure Gumroad
- [ ] Log in to Gumroad
- [ ] Go to your product settings
- [ ] Find "Redirect URL" setting
- [ ] Set to: `https://your-actual-domain.vercel.app/success?payment=true`
- [ ] Save settings

### 3. Test Payment Flow
- [ ] Make a test purchase on Gumroad
- [ ] Verify redirect to success page works
- [ ] Paste resume text and job description
- [ ] Click "Generate Full Resume"
- [ ] Wait for generation (~10-30 seconds)
- [ ] Verify resume and cover letter display
- [ ] Test "Download as PDF" button
- [ ] Test "Download as DOCX" button
- [ ] Verify files download correctly

### 4. Monitor Initial Performance
- [ ] Check Vercel Analytics (if enabled)
- [ ] Monitor Anthropic API usage in console
- [ ] Test from different devices/browsers
- [ ] Test mobile responsiveness

## Optional Enhancements

### Custom Domain
- [ ] Purchase domain (if desired)
- [ ] Add domain in Vercel settings
- [ ] Update DNS records
- [ ] Update `NEXT_PUBLIC_APP_URL` environment variable
- [ ] Update Gumroad redirect URL

### Analytics
- [ ] Add Google Analytics (optional)
- [ ] Add Vercel Analytics (optional)
- [ ] Set up error monitoring (Sentry, etc.)

### Cost Monitoring
- [ ] Set up Anthropic API billing alerts
- [ ] Monitor first week's usage
- [ ] Adjust pricing if needed

## Troubleshooting

### Build Fails
1. Check error message in Vercel logs
2. Verify Node.js version compatibility
3. Ensure all dependencies are in `package.json`
4. Test build locally: `npm run build`

### API Errors After Deployment
1. Verify `ANTHROPIC_API_KEY` is set in Vercel
2. Check API key has sufficient credits
3. Review browser console for error details
4. Check Anthropic API status page

### Gumroad Redirect Not Working
1. Verify exact URL including `?payment=true`
2. Test in incognito mode
3. Check Gumroad product settings
4. Ensure payment was actually completed

### PDF/DOCX Downloads Not Working
1. Check browser console for errors
2. Verify libraries are installed
3. Test on different browsers
4. Check if content is being generated before download

## Success Metrics

After deployment, monitor:
- [ ] Preview requests per day
- [ ] Conversion rate (previews → purchases)
- [ ] API costs vs. revenue
- [ ] Average time to complete flow
- [ ] User feedback/issues

## Rollback Plan

If critical issues occur:
1. Revert to previous deployment in Vercel
2. Or roll back git commit and redeploy
3. Fix issues locally
4. Test thoroughly
5. Redeploy

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Anthropic Docs**: https://docs.anthropic.com
- **Project Docs**: See `CLAUDE.md` and `README.md`

---

## Quick Reference

**Vercel Dashboard**: https://vercel.com/dashboard
**Anthropic Console**: https://console.anthropic.com
**Gumroad Dashboard**: https://gumroad.com/dashboard

**Production URL**: `https://your-domain.vercel.app`
**Success Page**: `https://your-domain.vercel.app/success?payment=true`

---

Last Updated: 2025-12-01
