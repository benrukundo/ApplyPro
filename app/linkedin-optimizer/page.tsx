'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { extractTextFromPDF } from '@/lib/pdfExtractor';
import {
  Linkedin,
  FileText,
  Target,
  Upload,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Search,
  Award,
  Lightbulb,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Briefcase,
  Eye,
} from 'lucide-react';

// Types
interface Headline {
  headline: string;
  strategy: string;
  explanation: string;
}

interface Keyword {
  keyword: string;
  priority: string;
  context: string;
}

interface Skill {
  skill: string;
  category: string;
  reason: string;
}

interface ExperienceTip {
  section: string;
  currentIssue: string;
  suggestion: string;
  example: string;
}

interface Analysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
}

interface OptimizationData {
  scores: {
    consistency: number;
    keywords: number;
    experience: number;
    skills: number;
    overall: number;
  };
  analysis: Analysis;
  suggestedHeadlines: Headline[];
  optimizedAbout: string;
  missingKeywords: Keyword[];
  skillsToAdd: Skill[];
  experienceTips: ExperienceTip[];
}

export default function LinkedInOptimizerPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Input state
  const [resumeContent, setResumeContent] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [currentHeadline, setCurrentHeadline] = useState('');
  const [currentAbout, setCurrentAbout] = useState('');
  const [targetRole, setTargetRole] = useState('');

  // UI state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [error, setError] = useState('');
  const [savedCount, setSavedCount] = useState(0);
  const [isExtractingText, setIsExtractingText] = useState(false);

  // Results state
  const [optimizationId, setOptimizationId] = useState<string | null>(null);
  const [optimizationData, setOptimizationData] = useState<OptimizationData | null>(null);
  const [activeTab, setActiveTab] = useState('headline');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [expandedTips, setExpandedTips] = useState<number[]>([0]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/linkedin-optimizer');
    }
  }, [status, router]);

  // Fetch saved optimizations count
  useEffect(() => {
    const fetchCount = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/linkedin/list');
        if (response.ok) {
          const data = await response.json();
          setSavedCount(data.data?.length || 0);
        }
      } catch (err) {
        console.error('Failed to fetch saved count:', err);
      }
    };

    fetchCount();
  }, [session?.user?.id]);

  // Handle file upload - Use client-side extraction for PDFs
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setError('');
    setIsExtractingText(true);

    try {
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.pdf')) {
        // Extract PDF text on client side using pdf.js
        const text = await extractTextFromPDF(file);
        setResumeContent(text);
      } else {
        // For DOCX and TXT, use server-side extraction
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/extract-text', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to extract text');
        }

        const data = await response.json();
        setResumeContent(data.text);
      }
      setIsExtractingText(false);
    } catch (err: any) {
      console.error('Failed to extract text:', err);
      setError(err.message || 'Failed to read file. Please try DOCX format instead.');
      setResumeFile(null);
      setResumeContent('');
      setIsExtractingText(false);
    }
  };

  // Analyze LinkedIn profile
  const handleAnalyze = async () => {
    if (!resumeContent) {
      setError('Please upload your resume first');
      return;
    }

    if (!currentHeadline && !currentAbout) {
      setError('Please provide your current LinkedIn headline or about section');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setAnalysisStep(1);

    try {
      const progressInterval = setInterval(() => {
        setAnalysisStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 2500);

      const response = await fetch('/api/linkedin/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeContent,
          linkedinUrl,
          currentHeadline,
          currentAbout,
          targetRole,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze');
      }

      const result = await response.json();
      setOptimizationId(result.optimizationId);
      setOptimizationData(result.data);
      setAnalysisStep(5);
      setSavedCount((prev) => prev + 1);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze LinkedIn profile');
      setAnalysisStep(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, itemId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  // Toggle tip expansion
  const toggleTip = (index: number) => {
    setExpandedTips((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get score background
  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical':
        return 'bg-blue-100 text-blue-700';
      case 'soft':
        return 'bg-purple-100 text-purple-700';
      case 'industry':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get strategy icon
  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'visibility':
        return <Eye className="w-4 h-4" />;
      case 'job_search':
        return <Search className="w-4 h-4" />;
      case 'thought_leadership':
        return <Award className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  // Get strategy label
  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case 'visibility':
        return 'Best for Visibility';
      case 'job_search':
        return 'Best for Job Search';
      case 'thought_leadership':
        return 'Best for Thought Leadership';
      default:
        return strategy;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
            <Linkedin className="w-10 h-10 text-[#0077B5]" />
            LinkedIn Profile Optimizer
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Align your LinkedIn profile with your resume for maximum visibility
          </p>

          {/* View Saved Button */}
          {savedCount > 0 && (
            <Link
              href="/linkedin-optimizer/saved"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#0077B5] text-[#0077B5] font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-sm"
            >
              <Eye className="w-5 h-5" />
              <span>View Saved Optimizations</span>
              <span className="px-2 py-0.5 bg-[#0077B5] text-white text-xs font-bold rounded-full">
                {savedCount}
              </span>
            </Link>
          )}
        </div>

        {!optimizationData ? (
          /* Input Form */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {/* Resume Upload */}
              <div className="mb-6">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <FileText className="w-5 h-5 mr-2 text-[#0077B5]" />
                  Your Resume
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#0077B5] transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">
                      {resumeFile ? resumeFile.name : 'Drop your resume here or click to upload'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">PDF, DOCX, or TXT</p>
                  </label>
                </div>
                {isExtractingText && (
                  <p className="text-sm text-blue-600 mt-2 flex items-center">
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Extracting text from file...
                  </p>
                )}
                {resumeContent && !isExtractingText && (
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    Resume loaded ({resumeContent.length} characters)
                  </p>
                )}
              </div>

              {/* LinkedIn URL (Optional) */}
              <div className="mb-6">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <Linkedin className="w-5 h-5 mr-2 text-[#0077B5]" />
                  LinkedIn Profile URL
                  <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/your-profile"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B5] focus:border-transparent"
                />
              </div>

              {/* Current Headline */}
              <div className="mb-6">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <Sparkles className="w-5 h-5 mr-2 text-[#0077B5]" />
                  Current LinkedIn Headline
                </label>
                <input
                  type="text"
                  value={currentHeadline}
                  onChange={(e) => setCurrentHeadline(e.target.value)}
                  placeholder="e.g., IT Officer | E-Health Systems Specialist"
                  maxLength={220}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B5] focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {currentHeadline.length}/220 characters
                </p>
              </div>

              {/* Current About Section */}
              <div className="mb-6">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <BookOpen className="w-5 h-5 mr-2 text-[#0077B5]" />
                  Current LinkedIn About Section
                </label>
                <textarea
                  value={currentAbout}
                  onChange={(e) => setCurrentAbout(e.target.value)}
                  placeholder="Paste your current LinkedIn About section here..."
                  className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B5] focus:border-transparent resize-none"
                  maxLength={2600}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {currentAbout.length}/2600 characters
                </p>
              </div>

              {/* Target Role */}
              <div className="mb-8">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <Target className="w-5 h-5 mr-2 text-[#0077B5]" />
                  Target Role
                  <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g., Health Informatics Manager"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0077B5] focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Optimizes your profile for this specific role
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeContent || (!currentHeadline && !currentAbout)}
                className="w-full py-4 bg-[#0077B5] text-white font-semibold rounded-xl hover:bg-[#006097] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {analysisStep === 1 && 'Analyzing your resume...'}
                    {analysisStep === 2 && 'Comparing with LinkedIn...'}
                    {analysisStep === 3 && 'Identifying optimization opportunities...'}
                    {analysisStep === 4 && 'Generating recommendations...'}
                    {analysisStep === 0 && 'Analyzing...'}
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Analyze & Optimize Profile
                  </>
                )}
              </button>

              {/* Progress Indicators */}
              {isAnalyzing && (
                <div className="mt-6 space-y-2">
                  {[
                    'Analyzing your resume',
                    'Comparing with LinkedIn profile',
                    'Identifying optimization opportunities',
                    'Generating recommendations',
                  ].map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-center text-sm ${
                        analysisStep > index + 1
                          ? 'text-green-600'
                          : analysisStep === index + 1
                          ? 'text-[#0077B5]'
                          : 'text-gray-400'
                      }`}
                    >
                      {analysisStep > index + 1 ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : analysisStep === index + 1 ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <div className="w-4 h-4 mr-2 rounded-full border-2 border-current" />
                      )}
                      {step}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Results Section - Continuing in next part */
          <div className="max-w-5xl mx-auto">
            {/* Success Header with Scores */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                LinkedIn Analysis Complete!
              </h2>
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  <Check className="w-4 h-4" />
                  <span>Automatically saved to your account</span>
                  <span>•</span>
                  <Link
                    href="/linkedin-optimizer/saved"
                    className="font-semibold hover:underline"
                  >
                    View all saved optimizations
                  </Link>
                </div>
              </div>

              {/* Score Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Overall</p>
                  <p className={`text-3xl font-bold ${getScoreColor(optimizationData.scores.overall)}`}>
                    {optimizationData.scores.overall}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Consistency</p>
                  <p className={`text-2xl font-bold ${getScoreColor(optimizationData.scores.consistency)}`}>
                    {optimizationData.scores.consistency}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Keywords</p>
                  <p className={`text-2xl font-bold ${getScoreColor(optimizationData.scores.keywords)}`}>
                    {optimizationData.scores.keywords}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Experience</p>
                  <p className={`text-2xl font-bold ${getScoreColor(optimizationData.scores.experience)}`}>
                    {optimizationData.scores.experience}%
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Skills</p>
                  <p className={`text-2xl font-bold ${getScoreColor(optimizationData.scores.skills)}`}>
                    {optimizationData.scores.skills}%
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs - Part 1 */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex border-b overflow-x-auto">
                {[
                  { id: 'headline', label: 'Headlines', icon: Sparkles },
                  { id: 'about', label: 'About Section', icon: BookOpen },
                  { id: 'keywords', label: 'Keywords', icon: Search },
                  { id: 'skills', label: 'Skills', icon: Award },
                  { id: 'tips', label: 'Experience Tips', icon: Lightbulb },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 min-w-[120px] py-4 px-4 font-medium transition-colors flex items-center justify-center ${
                        activeTab === tab.id
                          ? 'text-[#0077B5] border-b-2 border-[#0077B5] bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {/* Headlines Tab */}
                {activeTab === 'headline' && (
                  <div className="space-y-4">
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-blue-800">
                        <strong>Pro tip:</strong> Your headline is the first thing recruiters see.
                        Choose one that matches your goals!
                      </p>
                    </div>
                    {optimizationData.suggestedHeadlines.map((headline, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-xl hover:border-[#0077B5] transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                            headline.strategy === 'visibility'
                              ? 'bg-purple-100 text-purple-700'
                              : headline.strategy === 'job_search'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {getStrategyIcon(headline.strategy)}
                            <span className="ml-1">{getStrategyLabel(headline.strategy)}</span>
                          </span>
                          <button
                            onClick={() => copyToClipboard(headline.headline, `headline-${index}`)}
                            className="text-gray-400 hover:text-[#0077B5] p-2"
                          >
                            {copiedItem === `headline-${index}` ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          {headline.headline}
                        </p>
                        <p className="text-sm text-gray-600">{headline.explanation}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {headline.headline.length}/220 characters
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* About Section Tab */}
                {activeTab === 'about' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Optimized About Section
                      </h3>
                      <button
                        onClick={() => copyToClipboard(optimizationData.optimizedAbout, 'about')}
                        className="flex items-center px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006097]"
                      >
                        {copiedItem === 'about' ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy to Clipboard
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="whitespace-pre-line text-gray-800 leading-relaxed">
                        {optimizationData.optimizedAbout}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {optimizationData.optimizedAbout?.length || 0}/2600 characters
                    </p>
                  </div>
                )}

                {/* Keywords Tab */}
                {activeTab === 'keywords' && (
                  <div>
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-yellow-800">
                        <strong>Add these keywords</strong> to your profile to improve search visibility
                        and match rate with job postings.
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {optimizationData.missingKeywords.map((keyword, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-xl flex items-start justify-between"
                        >
                          <div>
                            <div className="flex items-center mb-2">
                              <span className="font-semibold text-gray-900 mr-2">
                                {keyword.keyword}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(keyword.priority)}`}>
                                {keyword.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{keyword.context}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(keyword.keyword, `keyword-${index}`)}
                            className="text-gray-400 hover:text-[#0077B5] p-1"
                          >
                            {copiedItem === `keyword-${index}` ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div>
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-800">
                        <strong>Add these skills</strong> to your LinkedIn profile.
                        Endorsements help boost your profile visibility!
                      </p>
                    </div>
                    <div className="space-y-3">
                      {optimizationData.skillsToAdd.map((skill, index) => (
                        <div
                          key={index}
                          className="p-4 border border-gray-200 rounded-xl flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <span className={`px-3 py-1 rounded-full text-sm mr-3 ${getCategoryColor(skill.category)}`}>
                              {skill.category}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{skill.skill}</p>
                              <p className="text-sm text-gray-600">{skill.reason}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(skill.skill, `skill-${index}`)}
                            className="text-gray-400 hover:text-[#0077B5] p-2"
                          >
                            {copiedItem === `skill-${index}` ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const allSkills = optimizationData.skillsToAdd.map(s => s.skill).join(', ');
                        copyToClipboard(allSkills, 'all-skills');
                      }}
                      className="mt-4 w-full py-3 border border-[#0077B5] text-[#0077B5] rounded-xl hover:bg-blue-50"
                    >
                      {copiedItem === 'all-skills' ? 'Copied All Skills!' : 'Copy All Skills'}
                    </button>
                  </div>
                )}

                {/* Experience Tips Tab */}
                {activeTab === 'tips' && (
                  <div className="space-y-4">
                    {optimizationData.experienceTips.map((tip, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleTip(index)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50"
                        >
                          <div className="flex items-center">
                            <Briefcase className="w-5 h-5 text-[#0077B5] mr-3" />
                            <span className="font-medium text-gray-900">{tip.section}</span>
                          </div>
                          {expandedTips.includes(index) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {expandedTips.includes(index) && (
                          <div className="px-4 pb-4 border-t bg-gray-50">
                            <div className="mt-4 space-y-4">
                              <div>
                                <p className="text-sm font-medium text-red-600 mb-1">
                                  ⚠️ Current Issue:
                                </p>
                                <p className="text-gray-700">{tip.currentIssue}</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-green-600 mb-1">
                                  ✅ Suggestion:
                                </p>
                                <p className="text-gray-700">{tip.suggestion}</p>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-medium text-[#0077B5]">
                                    💡 Example:
                                  </p>
                                  <button
                                    onClick={() => copyToClipboard(tip.example, `tip-${index}`)}
                                    className="text-gray-400 hover:text-[#0077B5]"
                                  >
                                    {copiedItem === `tip-${index}` ? (
                                      <Check className="w-4 h-4 text-green-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                                <p className="text-gray-700 bg-white p-3 rounded-lg border">
                                  {tip.example}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t bg-gray-50 flex flex-wrap gap-4 justify-center">
                <a
                  href="https://www.linkedin.com/in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-[#0077B5] text-white font-semibold rounded-xl hover:bg-[#006097] flex items-center"
                >
                  <Linkedin className="w-5 h-5 mr-2" />
                  Open LinkedIn to Edit
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
                <button
                  onClick={() => {
                    setOptimizationData(null);
                    setOptimizationId(null);
                    setResumeFile(null);
                    setResumeContent('');
                    setCurrentHeadline('');
                    setCurrentAbout('');
                    setLinkedinUrl('');
                    setTargetRole('');
                  }}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
                >
                  Analyze Another Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
