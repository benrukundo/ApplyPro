'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDropzone } from 'react-dropzone';
import Link from 'next/link';
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Target,
  Search,
  Briefcase,
  XCircle,
  AlertTriangle,
  Lock,
  Download,
  Palette,
  Check,
} from 'lucide-react';
import { 
  generatePDF, 
  generateDOCX, 
  generateCoverLetterPDF, 
  generateCoverLetterDOCX,
  type ColorPreset 
} from '@/lib/documentGenerator';
import { trackEvent } from '@/components/PostHogProvider';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_JOB_DESC_LENGTH = 100;

// Color presets for Modern template
const colorPresets = [
  { key: 'blue' as ColorPreset, name: 'Blue', hex: '#2563eb', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-600', accent: 'bg-blue-600' },
  { key: 'green' as ColorPreset, name: 'Green', hex: '#16a34a', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-600', accent: 'bg-green-600' },
  { key: 'purple' as ColorPreset, name: 'Purple', hex: '#9333ea', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-600', accent: 'bg-purple-600' },
  { key: 'red' as ColorPreset, name: 'Red', hex: '#dc2626', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-600', accent: 'bg-red-600' },
  { key: 'teal' as ColorPreset, name: 'Teal', hex: '#0d9488', bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-600', accent: 'bg-teal-600' },
  { key: 'orange' as ColorPreset, name: 'Orange', hex: '#ea580c', bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-600', accent: 'bg-orange-600' },
];

interface PreviewData {
  overallScore: number;
  atsScore: number;
  keywordScore: number;
  experienceScore: number;
  skillsScore: number;
  matchedKeywords: string[];
  missingKeywords: Array<{ keyword: string; priority: string; context: string }>;
  improvements: Array<{ issue: string; fix: string; impact: string }>;
  strengths: string[];
  insights: string[];
  previewText: string;
  keywordStats: {
    matched: number;
    total: number;
  };
}

interface SubscriptionInfo {
  plan: 'free' | 'monthly' | 'yearly' | 'pay-per-use' | null;
  status: 'active' | 'cancelled' | 'failed' | null;
  monthlyUsageCount: number;
  monthlyLimit: number;
  daysUntilReset: number;
  isActive: boolean;
}

interface GeneratedResume {
  fullResume: string;
  atsOptimizedResume: string;
  coverLetter: string;
  matchScore: number;
}

export default function GeneratePage() {
  const { data: session, status: sessionStatus } = useSession();

  // Subscription state
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');

  // Resume input state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [apiError, setApiError] = useState<string>('');
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx'>('pdf');
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'traditional' | 'ats'>('modern');
  const [selectedColor, setSelectedColor] = useState(colorPresets[0]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load subscription info only when user is logged in
  useEffect(() => {
    const loadSubscription = async () => {
      if (!session?.user?.id) {
        setSubscription(null);
        return;
      }

      setIsLoadingSubscription(true);
      try {
        const response = await fetch('/api/user/subscription');
        const data = await response.json();

        if (response.ok) {
          setSubscription(data.subscription);
        } else {
          setSubscriptionError(data.error || 'Failed to load subscription');
        }
      } catch (err) {
        console.error('Error loading subscription:', err);
        setSubscriptionError('Failed to load subscription info');
      } finally {
        setIsLoadingSubscription(false);
      }
    };

    loadSubscription();
  }, [session?.user?.id]);

  // Extract text from PDF
  const extractPdfText = async (file: File): Promise<string> => {
    const pdfParse = (await import('pdf-parse' as any)).default;
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return data.text;
  };

  // Extract text from DOCX
  const extractDocxText = async (file: File): Promise<string> => {
    const mammoth = (await import('mammoth' as any)).default;
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError('');
    setIsExtracting(true);

    const file = acceptedFiles[0];

    if (!file) {
      setIsExtracting(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB');
      setIsExtracting(false);
      return;
    }

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (
      fileType !== 'application/pdf' &&
      fileType !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' &&
      !fileName.endsWith('.pdf') &&
      !fileName.endsWith('.docx')
    ) {
      setError('Please upload a PDF or DOCX file');
      setIsExtracting(false);
      return;
    }

    try {
      setResumeFile(file);

      let text = '';
      if (fileName.endsWith('.pdf')) {
        text = await extractPdfText(file);
      } else if (fileName.endsWith('.docx')) {
        text = await extractDocxText(file);
      }

      setResumeText(text);
      setIsExtracting(false);
    } catch (err) {
      console.error('Error extracting text:', err);
      setError('Failed to read file. Please try another file.');
      setResumeFile(null);
      setResumeText('');
      setIsExtracting(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // Free analysis - no auth required
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setApiError('');
    setPreviewData(null);

    try {
      const response = await fetch('/api/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze resume');
      }

      // Track free analysis
      trackEvent('resume_analyzed', {
        overall_score: data.overallScore,
        ats_score: data.atsScore,
        matched_keywords_count: data.matchedKeywords?.length || 0,
      });

      setPreviewData(data);
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setApiError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Download handler using documentGenerator
const handleDownload = async (type: 'resume' | 'cover', format: 'pdf' | 'docx') => {
  console.log('=== DOWNLOAD DEBUG ===');
  console.log('Type:', type);
  console.log('Format:', format);
  console.log('Selected Template:', selectedTemplate);
  console.log('Generated Resume object:', generatedResume);
  console.log('Full Resume length:', generatedResume?.fullResume?.length || 0);
  console.log('Full Resume first 500 chars:', generatedResume?.fullResume?.substring(0, 500));
  console.log('======================');

  setIsDownloading(true);
  setError('');

  try {
    const timestamp = new Date().toISOString().split('T')[0];

    // Determine content based on type
    let content = '';
    if (type === 'cover') {
      content = generatedResume?.coverLetter || '';
    } else {
      content = generatedResume?.fullResume || '';
    }

    if (!content) {
      throw new Error('No content available to download');
    }

    let blob: Blob;
    let fileName: string;

    if (type === 'cover') {
      // Cover letter
      if (format === 'pdf') {
        blob = await generateCoverLetterPDF(content, 'modern', selectedColor.key);
        fileName = `Cover_Letter_${timestamp}.pdf`;
      } else {
        blob = await generateCoverLetterDOCX(content, 'modern', selectedColor.key);
        fileName = `Cover_Letter_${timestamp}.docx`;
      }
    } else {
      // Resume with selected template
      const templateName = selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1);
      const baseName = `${templateName}_Resume`;

      if (format === 'pdf') {
        blob = await generatePDF(content, selectedTemplate, selectedColor.key);
        fileName = `${baseName}_${timestamp}.pdf`;
      } else {
        blob = await generateDOCX(content, selectedTemplate, selectedColor.key);
        fileName = `${baseName}_${timestamp}.docx`;
      }
    }

    // Download the blob
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Track download
    trackEvent('resume_downloaded', {
      type: type,
      format: format,
      template: selectedTemplate,
      color: selectedColor.key,
    });

  } catch (err) {
    console.error('Error generating document:', err);
    setError(`Failed to download ${format.toUpperCase()}. Please try again.`);
  } finally {
    setIsDownloading(false);
  }
};

  // Paid generation - requires auth + subscription
  const handleGenerate = async () => {
    if (!session?.user?.id) {
      window.location.href = '/login?callbackUrl=/generate';
      return;
    }

    if (!subscription?.isActive) {
      setError('Please purchase a subscription to generate resumes.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const checkResponse = await fetch('/api/user/can-generate');
      const checkData = await checkResponse.json();

      if (!checkData.allowed) {
        setError(checkData.reason || 'You cannot generate a resume at this time.');
        setIsLoading(false);
        return;
      }

      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      const generateData = await generateResponse.json();

      if (!generateResponse.ok) {
        throw new Error(generateData.error || 'Failed to generate resume');
      }

      try {
        localStorage.setItem('applypro_resume_text', resumeText);
        localStorage.setItem('applypro_job_description', jobDescription);
        localStorage.setItem('applypro_generated_content', JSON.stringify(generateData));
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }

      // Track successful resume generation
      trackEvent('resume_generated', {
        match_score: generateData.matchScore,
        plan: subscription.plan,
        usage_count: subscription.monthlyUsageCount + 1,
        usage_limit: subscription.monthlyLimit,
      });

      setGeneratedResume(generateData);
      setShowResults(true);

      setTimeout(() => {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      console.error('Error generating resume:', err);

      // Track generation failure
      trackEvent('resume_generation_failed', {
        error: err instanceof Error ? err.message : 'Unknown error',
        plan: subscription?.plan,
      });

      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const canGenerate = session?.user?.id && subscription?.isActive;

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {session?.user && subscription?.isActive && (
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-md">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {subscription.plan === 'monthly'
                    ? 'Pro Monthly'
                    : subscription.plan === 'yearly'
                      ? 'Pro Yearly'
                      : 'Pay-Per-Use'}
                </p>
                <p className="text-xs text-gray-600">
                  {subscription.monthlyUsageCount}/{subscription.monthlyLimit} resumes used
                </p>
              </div>
            </div>
          )}

          {!session?.user && (
            <Link
              href="/login?callbackUrl=/generate"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Sign In
            </Link>
          )}

          {session?.user && !subscription?.isActive && !isLoadingSubscription && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade to Pro
            </Link>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
          Resume Analyzer & Generator
        </h1>
        <p className="text-xl text-gray-600 text-center mb-4">
          Upload your resume and paste a job description to get started
        </p>
        <p className="text-center text-green-600 font-medium mb-12">
           Free analysis available  no sign-up required
        </p>

        {/* Build From Scratch Option */}
<div className="max-w-2xl mx-auto mb-12">
  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6 text-center">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Don't have a resume yet?
    </h3>
    <p className="text-gray-600 mb-4">
      No problem! We'll guide you step-by-step to create a professional resume from scratch.
    </p>
    <Link
      href="/build-resume"
      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
    >
      <Sparkles className="w-5 h-5" />
      Build Resume From Scratch
    </Link>
  </div>
</div>


        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Upload & Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Your Resume
              </h2>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  isDragActive
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900 mb-1">
                  {isDragActive ? 'Drop your file here' : 'Drag your resume here'}
                </p>
                <p className="text-sm text-gray-600">or click to select (PDF or DOCX)</p>
                <p className="text-xs text-gray-500 mt-2">Max 5MB</p>
              </div>

              {resumeFile && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-800">{resumeFile.name}</span>
                </div>
              )}

              {isExtracting && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                  <span className="text-sm text-blue-800">Extracting text from file...</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase className="w-6 h-6 text-blue-600" />
                Job Description
              </h2>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-48 p-4 border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none resize-none text-gray-700"
              />

              <p className="text-sm text-gray-600 mt-2">
                {jobDescription.length} characters (
                {Math.max(0, MIN_JOB_DESC_LENGTH - jobDescription.length)} more needed)
              </p>
            </div>
          </div>

          {/* Right: Preview & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ready?</h2>

              <button
                onClick={handleAnalyze}
                disabled={!resumeText || jobDescription.length < MIN_JOB_DESC_LENGTH || isAnalyzing}
                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze Resume (Free)
                  </>
                )}
              </button>

              <button
                onClick={handleGenerate}
                disabled={!resumeText || jobDescription.length < MIN_JOB_DESC_LENGTH || isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Full Resume
                    {!canGenerate && <Lock className="w-4 h-4 ml-1" />}
                  </>
                )}
              </button>

              {!session?.user ? (
                <p className="text-xs text-gray-600 text-center">
                  <Link href="/login?callbackUrl=/generate" className="text-blue-600 hover:underline">
                    Sign in
                  </Link>{' '}
                  and subscribe to generate tailored resumes
                </p>
              ) : !subscription?.isActive ? (
                <p className="text-xs text-gray-600 text-center">
                  <Link href="/pricing" className="text-blue-600 hover:underline">
                    Upgrade to Pro
                  </Link>{' '}
                  to generate tailored resumes
                </p>
              ) : (
                <p className="text-xs text-gray-600 text-center">
                  Generating will use 1 of your {subscription.monthlyLimit} monthly resumes
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 text-sm">{error}</p>
                  {error.includes('subscription') && (
                    <Link
                      href="/pricing"
                      className="text-red-600 text-sm font-medium hover:underline mt-1 inline-block"
                    >
                      View pricing plans 
                    </Link>
                  )}
                </div>
              </div>
            )}

            {apiError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{apiError}</p>
              </div>
            )}

            {subscriptionError && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-800 text-sm">{subscriptionError}</p>
              </div>
            )}

            {previewData && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Analysis Results
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">Overall Match</p>
                      <p className="text-2xl font-bold text-blue-600">{previewData.overallScore}%</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">ATS Score</p>
                      <p className="text-2xl font-bold text-green-600">{previewData.atsScore}%</p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Matched Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {previewData.matchedKeywords.slice(0, 5).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-semibold"
                        >
                          {keyword}
                        </span>
                      ))}
                      {previewData.matchedKeywords.length > 5 && (
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-semibold">
                          +{previewData.matchedKeywords.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {!canGenerate && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-gray-900 mb-2">
                        Want a tailored resume that matches this job?
                      </p>
                      <Link
                        href={session?.user ? '/pricing' : '/login?callbackUrl=/generate'}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        {session?.user ? 'Upgrade to Generate' : 'Sign In to Generate'}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Generated Resume Results Section */}
        {showResults && generatedResume && (
          <div id="results-section" className="mt-16 pt-16 border-t-2 border-gray-200">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
                Your Tailored Resume is Ready!
              </h2>
              <p className="text-xl text-gray-600">
                Match Score: <span className="font-bold text-blue-600">{generatedResume.matchScore}%</span>
              </p>
            </div>

            {/* Template & Color Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Resume Template</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => {
                    setSelectedTemplate('modern');
                    trackEvent('template_selected', { template: 'modern' });
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate === 'modern'
                      ? `${selectedColor.border} ${selectedColor.bg}`
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">Modern</div>
                  <div className="text-xs text-gray-600">Two-column with color accents</div>
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate('traditional');
                    trackEvent('template_selected', { template: 'traditional' });
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate === 'traditional'
                      ? 'border-gray-600 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">Traditional</div>
                  <div className="text-xs text-gray-600">Classic single-column</div>
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate('ats');
                    trackEvent('template_selected', { template: 'ats' });
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTemplate === 'ats'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">ATS-Optimized</div>
                  <div className="text-xs text-gray-600">Machine-readable format</div>
                </button>
              </div>

              {/* Color Picker - Only for Modern template */}
              {selectedTemplate === 'modern' && (
                <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Palette className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-700">Customize Color</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorPresets.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => {
                          setSelectedColor(color);
                          trackEvent('color_selected', { color: color.key });
                        }}
                        className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                          selectedColor.name === color.name
                            ? `${color.border} ${color.bg} shadow-md`
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        title={color.name}
                      >
                        <div
                          className="h-5 w-5 rounded-full shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span
                          className={`text-sm font-medium ${
                            selectedColor.name === color.name ? color.text : 'text-gray-600'
                          }`}
                        >
                          {color.name}
                        </span>
                        {selectedColor.name === color.name && (
                          <Check className={`h-4 w-4 ${color.text}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-4">Select Download Format</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setDownloadFormat('pdf')}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    downloadFormat === 'pdf'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  PDF Format
                </button>
                <button
                  onClick={() => setDownloadFormat('docx')}
                  className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                    downloadFormat === 'docx'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  DOCX Format
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Resume with Selected Template */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className={`w-6 h-6 ${selectedColor.text}`} />
                  {selectedTemplate === 'modern' && 'Modern Resume'}
                  {selectedTemplate === 'traditional' && 'Traditional Resume'}
                  {selectedTemplate === 'ats' && 'ATS Resume'}
                </h3>
                <div className="bg-gray-50 p-6 rounded-xl max-h-96 overflow-y-auto border border-gray-200">
                  <div className="text-gray-800 whitespace-pre-wrap font-serif text-sm leading-relaxed">
                    {generatedResume.fullResume}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload('resume', downloadFormat)}
                  disabled={isDownloading}
                  className={`mt-4 w-full px-6 py-3 ${selectedColor.accent} text-white rounded-lg font-semibold hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2`}
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download as {downloadFormat.toUpperCase()}
                    </>
                  )}
                </button>
              </div>

              {/* Cover Letter */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-purple-600" />
                  Cover Letter
                </h3>
                <div className="bg-gray-50 p-6 rounded-xl max-h-96 overflow-y-auto border border-gray-200">
                  <div className="text-gray-800 whitespace-pre-wrap font-serif text-sm leading-relaxed">
                    {generatedResume.coverLetter}
                  </div>
                </div>
                <button
                  onClick={() => handleDownload('cover', downloadFormat)}
                  disabled={isDownloading}
                  className="mt-4 w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download as {downloadFormat.toUpperCase()}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => {
                  setShowResults(false);
                  setGeneratedResume(null);
                  setPreviewData(null);
                  setResumeFile(null);
                  setResumeText('');
                  setJobDescription('');
                }}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Generate Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
