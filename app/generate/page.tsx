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
  ShoppingCart,
  Target,
  Search,
  Briefcase,
  Award,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Zap,
  Star,
  Lock,
  Download,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_JOB_DESC_LENGTH = 100;

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
}


export default function GeneratePage() {
  const { data: session } = useSession();

  // Subscription state
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState('');

  // Resume input state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [apiError, setApiError] = useState<string>('');
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Load subscription info
  useEffect(() => {
    const loadSubscription = async () => {
      if (!session?.user?.id) {
        setIsLoadingSubscription(false);
        return;
      }

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse = (await import('pdf-parse' as any)).default;
    const arrayBuffer = await file.arrayBuffer();
    const data = await pdfParse(Buffer.from(arrayBuffer));
    return data.text;
  };

  // Extract text from DOCX
  const extractDocxText = async (file: File): Promise<string> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 5MB');
      setIsExtracting(false);
      return;
    }

    // Validate file type
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

      // Extract text based on file type
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

  const handleAnalyze = async () => {
    setIsLoading(true);
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

      setPreviewData(data);
    } catch (err) {
      console.error('Error analyzing resume:', err);
      setApiError(
        err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle generation with subscription check
  const handleGenerate = async () => {
    // Check authentication
    if (!session?.user?.id) {
      window.location.href = '/login?callbackUrl=/generate';
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Check if user can generate
      const checkResponse = await fetch('/api/user/can-generate');
      const checkData = await checkResponse.json();

      if (!checkData.allowed) {
        setError(checkData.reason || 'You cannot generate a resume at this time.');
        setIsLoading(false);
        return;
      }

      // Generate resume
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

      // Track generation in database
      await fetch('/api/user/track-generation', {
        method: 'POST',
      });

      // Save data to localStorage for backup
      try {
        localStorage.setItem('applypro_resume_text', resumeText);
        localStorage.setItem('applypro_job_description', jobDescription);
        localStorage.setItem('applypro_generated_content', JSON.stringify(generateData));
      } catch (err) {
        console.error('Error saving to localStorage:', err);
      }

      // Show results on the same page
      setGeneratedResume(generateData);
      setShowResults(true);

      // Scroll to results
      setTimeout(() => {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err) {
      console.error('Error generating resume:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (!session && isLoadingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">
            Please sign in with your Google account to generate tailored resumes.
          </p>
          <Link
            href="/login?callbackUrl=/generate"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In with Google
          </Link>
        </div>
      </div>
    );
  }

  // Check if no subscription
  if (!subscription?.isActive && !isLoadingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active Subscription</h2>
          <p className="text-gray-600 mb-6">
            You don't have an active subscription. Please upgrade to generate tailored resumes.
          </p>
          <Link
            href="/pricing"
            className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header with subscription info */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Subscription badge */}
          {subscription?.isActive && (
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
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Generate Your Resume</h1>
        <p className="text-xl text-gray-600 text-center mb-12">
          Upload your resume and paste a job description to get a tailored resume
        </p>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Upload & Input */}
          <div className="space-y-6">
            {/* Resume Upload */}
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

            {/* Job Description */}
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
                {jobDescription.length} characters ({Math.max(0, MIN_JOB_DESC_LENGTH - jobDescription.length)} more needed)
              </p>
            </div>
          </div>

          {/* Right: Preview & Actions */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ready?</h2>

              <button
                onClick={handleAnalyze}
                disabled={!resumeText || jobDescription.length < MIN_JOB_DESC_LENGTH || isLoading}
                className="w-full px-6 py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Analyze Resume
                  </>
                )}
              </button>

              <button
                onClick={handleGenerate}
                disabled={
                  !resumeText ||
                  jobDescription.length < MIN_JOB_DESC_LENGTH ||
                  isLoading ||
                  !subscription?.isActive
                }
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
                  </>
                )}
              </button>

              <p className="text-xs text-gray-600 text-center">
                Generating will use 1 of your monthly resumes
              </p>
            </div>

            {/* Error Messages */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
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

            {/* Preview */}
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
                        <span key={idx} className="px-2 py-1 bg-purple-200 text-purple-800 rounded text-xs font-semibold">
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
                Here's your optimized resume tailored to the job description
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Full Resume */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Tailored Resume
                </h3>
                <div className="bg-gray-50 p-6 rounded-xl max-h-96 overflow-y-auto border border-gray-200">
                  <div className="text-gray-800 whitespace-pre-wrap font-serif text-sm leading-relaxed">
                    {generatedResume.fullResume}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(generatedResume.fullResume));
                    element.setAttribute('download', 'tailored-resume.txt');
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Resume
                </button>
              </div>

              {/* ATS Optimized Resume */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-green-600" />
                  ATS-Optimized Version
                </h3>
                <div className="bg-gray-50 p-6 rounded-xl max-h-96 overflow-y-auto border border-gray-200">
                  <div className="text-gray-800 whitespace-pre-wrap font-serif text-sm leading-relaxed">
                    {generatedResume.atsOptimizedResume}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(generatedResume.atsOptimizedResume));
                    element.setAttribute('download', 'ats-optimized-resume.txt');
                    element.style.display = 'none';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="mt-4 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download ATS Version
                </button>
              </div>
            </div>

            {/* Generate Another Button */}
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
