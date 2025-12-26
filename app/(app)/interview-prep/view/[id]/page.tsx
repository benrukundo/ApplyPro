'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  MessageSquare,
  Lightbulb,
  HelpCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Phone,
  Code,
  Users,
  Award,
} from 'lucide-react';

// Types (same as main page)
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

interface InterviewPrepData {
  id: string;
  jobTitle: string;
  company: string | null;
  interviewType: string;
  questions: Question[];
  keyTalkingPoints: TalkingPoint[];
  questionsToAsk: QuestionToAsk[];
  companyInsights: string | null;
  createdAt: string;
  mockSessions: any[];
}

const interviewTypeIcons: Record<string, any> = {
  PHONE_SCREENING: Phone,
  TECHNICAL: Code,
  BEHAVIORAL: Brain,
  HR_CULTURE: Users,
  FINAL_ROUND: Award,
};

export default function ViewInterviewPrepPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [prepData, setPrepData] = useState<InterviewPrepData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('questions');
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([0]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/interview-prep/saved');
    }
  }, [status, router]);

  // Load prep data
  useEffect(() => {
    const loadPrep = async () => {
      if (!session?.user?.id || !id) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/interview-prep/${id}`);
        if (response.ok) {
          const result = await response.json();
          setPrepData(result.data);
        } else {
          setError('Interview prep not found');
        }
      } catch (err) {
        console.error('Error loading prep:', err);
        setError('Failed to load interview prep');
      } finally {
        setIsLoading(false);
      }
    };

    loadPrep();
  }, [session?.user?.id, id]);

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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !prepData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Interview prep not found'}
          </h2>
          <Link
            href="/interview-prep/saved"
            className="text-blue-600 hover:underline"
          >
            Back to Saved Preps
          </Link>
        </div>
      </div>
    );
  }

  const Icon = interviewTypeIcons[prepData.interviewType] || Brain;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/interview-prep/saved"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Saved Preps
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {prepData.jobTitle}
                </h1>
                {prepData.company && (
                  <p className="text-gray-600 flex items-center gap-1 mt-1">
                    <Briefcase className="w-4 h-4" />
                    {prepData.company}
                  </p>
                )}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              {prepData.interviewType.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(prepData.createdAt)}</span>
            </div>
            {prepData.mockSessions.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="font-medium text-green-600">
                  {prepData.mockSessions.length} mock interview{prepData.mockSessions.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
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
              const TabIcon = tab.icon;
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
                  <TabIcon className="w-4 h-4 mr-2" />
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
    </div>
  );
}
