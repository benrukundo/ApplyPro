# ApplyPro - AI Resume Tailoring Service

ApplyPro is an AI-powered SaaS application that helps job seekers tailor their resumes to specific job descriptions. Using Claude AI, it analyzes resumes and job postings to create optimized, ATS-friendly resumes and cover letters.

## 🚀 Features

- **Free Preview Analysis**: Get instant feedback with match score, improvements, and missing keywords
- **AI-Tailored Resumes**: Generate complete, professionally formatted resumes optimized for specific jobs
- **Cover Letter Generation**: Receive personalized cover letters for each application
- **Multiple Export Formats**: Download as PDF or DOCX
- **ATS Optimization**: Keywords and formatting designed to pass Applicant Tracking Systems
- **Simple Payment Flow**: One-time payment of $4.99 per resume via Gumroad

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI**: Anthropic Claude API (Haiku for preview, Sonnet 4 for full generation)
- **Payments**: Gumroad
- **File Processing**: react-dropzone, mammoth, pdf-parse
- **Document Generation**: jsPDF, docx, file-saver
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key ([Get one here](https://console.anthropic.com/))
- Gumroad account for payment processing

## 🔧 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/applypro.git
   cd applypro
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create `.env.local` file in the root directory:
   ```bash
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_GUMROAD_URL=https://laurabi.gumroad.com/l/ykchtv
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (keep secret!) | `sk-ant-...` |
| `NEXT_PUBLIC_APP_URL` | Your application URL | `http://localhost:3000` or `https://your-domain.com` |
| `NEXT_PUBLIC_GUMROAD_URL` | Your Gumroad product URL | `https://laurabi.gumroad.com/l/ykchtv` |

### Security Notes

- Never commit `.env.local` to version control
- `ANTHROPIC_API_KEY` should never be exposed to the browser
- Use `NEXT_PUBLIC_` prefix only for variables that need to be accessible in the browser

## 📁 Project Structure

```
applypro/
├── app/
│   ├── api/
│   │   ├── preview/          # Free preview analysis endpoint
│   │   └── generate/         # Full resume generation endpoint
│   ├── generate/             # Resume upload & preview page
│   ├── success/              # Post-payment resume generation page
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage
│   └── globals.css           # Global styles
├── public/                   # Static assets
├── .env.local               # Local environment variables (not committed)
├── .env.local.example       # Environment variables template
├── .env.production          # Production environment template
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
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)
   - `NEXT_PUBLIC_GUMROAD_URL`

4. **Deploy:**
   - Vercel will automatically build and deploy
   - Get your production URL

5. **Update Gumroad:**
   - Set redirect URL to: `https://your-domain.vercel.app/success?payment=true`

### Alternative Hosting

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- DigitalOcean App Platform

See [CLAUDE.md](./CLAUDE.md) for detailed deployment instructions.

## 💰 Pricing & Economics

### API Costs
- **Free Preview**: ~$0.005 per analysis (Claude Haiku)
- **Full Resume**: ~$0.035 per generation (Claude Sonnet 4)

### Revenue Model
- **Price**: $4.99 per resume
- **Profit Margin**: ~99% (after AI costs)
- **Example**: 20 sales/month = $99.80 revenue - $1.20 costs = **$98.60 profit**

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
- How it works (3 steps)
- Pricing information
- CTA to generate page

### 2. Generate Page (`/generate`)
- Upload resume (PDF/DOCX) or paste text
- Paste job description
- Get free preview with:
  - Match score (0-100)
  - Top 5 improvements
  - Missing ATS keywords
  - Preview of tailored resume
- Payment link to Gumroad

### 3. Success Page (`/success?payment=true`)
- Post-payment resume generation
- Full tailored resume
- Personalized cover letter
- Download as PDF or DOCX

## 🔒 Security

- API keys stored in environment variables
- Input validation on all API routes
- Rate limiting consideration for production
- No sensitive data in client-side code
- Secure payment processing via Gumroad

## 🐛 Troubleshooting

### Common Issues

**API Error: Model not found**
- Check your Anthropic API key has access to required models
- Verify key has sufficient credits

**Build fails**
- Ensure Node.js version 18+
- Delete `node_modules` and `.next`, then reinstall:
  ```bash
  rm -rf node_modules .next
  npm install
  ```

**Downloads not working**
- Check browser console for errors
- Ensure jsPDF and docx packages are installed

## 📝 License

This project is proprietary and confidential.

## 🤝 Support

For issues or questions:
- Check [CLAUDE.md](./CLAUDE.md) for detailed documentation
- Review troubleshooting section above
- Contact: [your-email@example.com]

## 🎯 Future Enhancements

- [ ] Multiple resume templates
- [ ] LinkedIn profile optimization
- [ ] Batch processing for multiple jobs
- [ ] Analytics dashboard
- [ ] Email delivery of resumes
- [ ] Resume history and storage

---

Built with ❤️ using Next.js and Claude AI
