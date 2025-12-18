'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  Briefcase,
  Phone,
  Code,
  Brain,
  Users,
  Award,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  MessageSquare,
  Lightbulb,
  HelpCircle,
  ArrowLeft,
  Loader2,
  PlayCircle,
  Sparkles,
  Info,
} from 'lucide-react';

// Types
interface Question {
  question: string;
  suggestedAnswer: string;
  category: string;
  difficulty: string;
  tips: string;
}

interface TalkingPoint {
  point: string;
  evidence: string;
  relevance: string;
}

interface QuestionToAsk {
  question: string;
  purpose: string;
  category: string;
}

interface PrepData {
  questions: Question[];
  keyTalkingPoints: TalkingPoint[];
  questionsToAsk: QuestionToAsk[];
  companyInsights: string;
}

const interviewTypes = [
  {
    id: 'PHONE_SCREENING',
    name: 'Phone Screening',
    icon: Phone,
    description: 'Initial recruiter call',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  {
    id: 'TECHNICAL',
    name: 'Technical',
    icon: Code,
    description: 'Skills assessment',
    color: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  {
    id: 'BEHAVIORAL',
    name: 'Behavioral',
    icon: Brain,
    description: 'STAR method',
    color: 'bg-green-50 border-green-200 text-green-700',
  },
  {
    id: 'HR_CULTURE',
    name: 'HR/Culture Fit',
    icon: Users,
    description: 'Values alignment',
    color: 'bg-orange-50 border-orange-200 text-orange-700',
  },
  {
    id: 'FINAL_ROUND',
    name: 'Final Round',
    icon: Award,
    description: 'Executive interview',
    color: 'bg-red-50 border-red-200 text-red-700',
  },
];

export default function InterviewPrepPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Input state
  const [resumeContent, setResumeContent] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [selectedType, setSelectedType] = useState('BEHAVIORAL');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [error, setError] = useState('');
  const [isExtractingText, setIsExtractingText] = useState(false);

  // Results state
  const [prepId, setPrepId] = useState<string | null>(null);
  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [activeTab, setActiveTab] = useState('questions');
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([0]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/interview-prep');
    }
  }, [status, router]);

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

  // Extract text from TXT
  const extractTxtText = async (file: File): Promise<string> => {
    return await file.text();
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setError('');
    setIsExtractingText(true);

    try {
      const fileName = file.name.toLowerCase();
      let text = '';

      if (fileName.endsWith('.pdf')) {
        text = await extractPdfText(file);
      } else if (fileName.endsWith('.docx')) {
        text = await extractDocxText(file);
      } else if (fileName.endsWith('.txt')) {
        text = await extractTxtText(file);
      } else {
        setError('Unsupported file type. Please upload PDF, DOCX, or TXT.');
        setResumeFile(null);
        setIsExtractingText(false);
        return;
      }

      setResumeContent(text);
      setIsExtractingText(false);
    } catch (err) {
      console.error('Failed to extract text:', err);
      setError('Failed to read file. Please try another file.');
      setResumeFile(null);
      setResumeContent('');
      setIsExtractingText(false);
    }
  };

  // Generate interview prep
  const handleGenerate = async () => {
    if (!resumeContent || !jobDescription || !jobTitle) {
      setError('Please provide your resume, job description, and job title');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGenerationStep(1);

    try {
      // Simulate progress steps
      const progressInterval = setInterval(() => {
        setGenerationStep((prev) => (prev < 4 ? prev + 1 : prev));
      }, 2000);

      const response = await fetch('/api/interview-prep/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeContent,
          jobDescription,
          jobTitle,
          company,
          interviewType: selectedType,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate');
      }

      const result = await response.json();
      setPrepId(result.prepId);
      setPrepData(result.data);
      setGenerationStep(5);
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview preparation');
      setGenerationStep(0);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle question expansion
  const toggleQuestion = (index: number) => {
    setExpandedQuestions((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      introduction: 'bg-blue-100 text-blue-700',
      experience: 'bg-purple-100 text-purple-700',
      behavioral: 'bg-green-100 text-green-700',
      technical: 'bg-orange-100 text-orange-700',
      situational: 'bg-pink-100 text-pink-700',
      motivation: 'bg-cyan-100 text-cyan-700',
      culture_fit: 'bg-indigo-100 text-indigo-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
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
            <Brain className="w-10 h-10 text-blue-600" />
            Interview Preparation
          </h1>
          <p className="text-lg text-gray-600">
            Get AI-powered interview questions and answers tailored to your experience
          </p>
        </div>

        {!prepData ? (
          /* Input Form */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              {/* Resume Input */}
              <div className="mb-6">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Your Resume
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer"
                  >
                    <FileText className="w-10 h-10 mx-auto text-gray-400 mb-2" />
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

              {/* Job Description Input */}
              <div className="mb-6">
                <label className="flex items-center text-lg font-semibold text-gray-800 mb-3">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {jobDescription.length} characters
                </p>
              </div>

              {/* Job Title & Company */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., IT Officer"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Africa Health Sciences University"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Interview Type Selection */}
              <div className="mb-8">
                <label className="block text-lg font-semibold text-gray-800 mb-3">
                  Interview Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {interviewTypes.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        title={type.description}
                      >
                        <Icon
                          className={`w-6 h-6 mx-auto mb-2 ${
                            isSelected ? 'text-blue-600' : 'text-gray-400'
                          }`}
                        />
                        <p
                          className={`text-sm font-medium ${
                            isSelected ? 'text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          {type.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
                  <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !resumeContent || !jobDescription || !jobTitle}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {generationStep === 1 && 'Analyzing your resume...'}
                    {generationStep === 2 && 'Matching with job description...'}
                    {generationStep === 3 && 'Generating questions...'}
                    {generationStep === 4 && 'Creating suggested answers...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Interview Prep
                  </>
                )}
              </button>

              {/* Progress Indicators */}
              {isGenerating && (
                <div className="mt-6 space-y-2">
                  {[
                    'Analyzing your resume',
                    'Matching with job description',
                    'Generating questions',
                    'Creating suggested answers',
                  ].map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-center text-sm ${
                        generationStep > index + 1
                          ? 'text-green-600'
                          : generationStep === index + 1
                          ? 'text-blue-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {generationStep > index + 1 ? (
                        <Check className="w-4 h-4 mr-2" />
                      ) : generationStep === index + 1 ? (
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
          /* Results Section */
          <div className="max-w-5xl mx-auto">
            {/* Success Header */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Interview Prep is Ready!
              </h2>
              <p className="text-gray-600 mb-3">
                {jobTitle}
                {company && ` at ${company}`} •{' '}
                {interviewTypes.find((t) => t.id === selectedType)?.name} Interview
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                <Check className="w-4 h-4" />
                <span>Automatically saved to your account</span>
                <span>•</span>
                <Link
                  href="/interview-prep/saved"
                  className="font-semibold hover:underline"
                >
                  View all saved preps
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="flex border-b overflow-x-auto">
                {[
                  { id: 'questions', label: 'Questions', count: prepData.questions.length, icon: MessageSquare },
                  { id: 'talking-points', label: 'Key Points', count: prepData.keyTalkingPoints.length, icon: Lightbulb },
                  { id: 'ask-them', label: 'Ask Them', count: prepData.questionsToAsk.length, icon: HelpCircle },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-4 px-6 font-medium transition-colors flex items-center justify-center whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.label}
                      <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-200">
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {/* Questions Tab */}
                {activeTab === 'questions' && (
                  <div className="space-y-4">
                    {prepData.questions.map((q, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleQuestion(index)}
                          className="w-full p-4 flex items-start justify-between text-left hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-gray-500">
                                Q{index + 1}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(
                                  q.category
                                )}`}
                              >
                                {q.category.replace('_', ' ')}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(
                                  q.difficulty
                                )}`}
                              >
                                {q.difficulty}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900">{q.question}</p>
                          </div>
                          {expandedQuestions.includes(index) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0" />
                          )}
                        </button>

                        {expandedQuestions.includes(index) && (
                          <div className="px-4 pb-4 border-t bg-gray-50">
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-700 flex items-center">
                                  <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                                  Suggested Answer
                                </h4>
                                <button
                                  onClick={() =>
                                    copyToClipboard(q.suggestedAnswer, index)
                                  }
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                >
                                  {copiedIndex === index ? (
                                    <>
                                      <Check className="w-4 h-4 mr-1" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4 mr-1" />
                                      Copy
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {q.suggestedAnswer}
                              </p>
                            </div>

                            {q.tips && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-700">
                                  <strong>💡 Tip:</strong> {q.tips}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Talking Points Tab */}
                {activeTab === 'talking-points' && (
                  <div className="space-y-4">
                    {prepData.keyTalkingPoints.map((point, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-xl"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {point.point}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 mb-1">Evidence:</p>
                            <p className="text-gray-700">{point.evidence}</p>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-blue-600 mb-1">Why it matters:</p>
                            <p className="text-gray-700">{point.relevance}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Questions to Ask Tab */}
                {activeTab === 'ask-them' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
                      <p className="text-yellow-800">
                        <strong>Pro tip:</strong> Asking thoughtful questions shows genuine
                        interest and helps you evaluate if the role is right for you.
                      </p>
                    </div>
                    {prepData.questionsToAsk.map((q, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-xl"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs mb-2 ${
                                q.category === 'role'
                                  ? 'bg-blue-100 text-blue-700'
                                  : q.category === 'team'
                                  ? 'bg-green-100 text-green-700'
                                  : q.category === 'company'
                                  ? 'bg-purple-100 text-purple-700'
                                  : q.category === 'growth'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-pink-100 text-pink-700'
                              }`}
                            >
                              {q.category}
                            </span>
                            <p className="font-medium text-gray-900">{q.question}</p>
                            <p className="text-sm text-gray-600 mt-2">{q.purpose}</p>
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(q.question, index + 1000)
                            }
                            className="text-gray-400 hover:text-blue-600 ml-4"
                          >
                            {copiedIndex === index + 1000 ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 border-t bg-gray-50 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => {
                    setPrepData(null);
                    setPrepId(null);
                    setResumeFile(null);
                    setResumeContent('');
                    setJobDescription('');
                    setJobTitle('');
                    setCompany('');
                  }}
                  className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Prepare for Another Interview
                </button>
              </div>
            </div>

            {/* Company Insights */}
            {prepData.companyInsights && (
              <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                  Company Insights
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {prepData.companyInsights}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
