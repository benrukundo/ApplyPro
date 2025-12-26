'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Linkedin,
  ArrowLeft,
  Loader2,
  Sparkles,
  BookOpen,
  Search,
  Award,
  Lightbulb,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Briefcase,
  Eye,
  Target,
} from 'lucide-react';

export default function ViewOptimizationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [optimization, setOptimization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('headline');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [expandedTips, setExpandedTips] = useState<number[]>([0]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/linkedin-optimizer/saved');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchOptimization = async () => {
      if (!session?.user?.id || !id) return;

      try {
        const response = await fetch(`/api/linkedin/${id}`);
        if (response.ok) {
          const data = await response.json();
          setOptimization(data.data);
        } else {
          router.push('/linkedin-optimizer/saved');
        }
      } catch (err) {
        console.error('Failed to fetch optimization:', err);
        router.push('/linkedin-optimizer/saved');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptimization();
  }, [session?.user?.id, id, router]);

  const copyToClipboard = async (text: string, itemId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(itemId);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const toggleTip = (index: number) => {
    setExpandedTips((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'technical': return 'bg-blue-100 text-blue-700';
      case 'soft': return 'bg-purple-100 text-purple-700';
      case 'industry': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStrategyLabel = (strategy: string) => {
    switch (strategy) {
      case 'visibility': return 'Best for Visibility';
      case 'job_search': return 'Best for Job Search';
      case 'thought_leadership': return 'Best for Thought Leadership';
      default: return strategy;
    }
  };

  const getStrategyIcon = (strategy: string) => {
    switch (strategy) {
      case 'visibility': return <Eye className="w-4 h-4" />;
      case 'job_search': return <Search className="w-4 h-4" />;
      case 'thought_leadership': return <Award className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0077B5]" />
      </div>
    );
  }

  if (!optimization) {
    return null;
  }

  const overallScore = Math.round(
    (optimization.consistencyScore +
      optimization.keywordsMatch +
      optimization.experienceAlign +
      optimization.skillsCoverage) / 4
  );

  const suggestedHeadlines = optimization.suggestedHeadlines || [];
  const missingKeywords = optimization.missingKeywords || [];
  const skillsToAdd = optimization.skillsToAdd || [];
  const experienceTips = optimization.experienceTips || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/linkedin-optimizer/saved"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Saved Optimizations
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Score Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Linkedin className="w-7 h-7 mr-3 text-[#0077B5]" />
                LinkedIn Profile Analysis
              </h1>
              {optimization.targetRole && (
                <p className="text-gray-600 mt-1 flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Target: {optimization.targetRole}
                </p>
              )}
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">Consistency</p>
              <p className={`text-2xl font-bold ${getScoreColor(optimization.consistencyScore)}`}>
                {optimization.consistencyScore}%
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">Keywords</p>
              <p className={`text-2xl font-bold ${getScoreColor(optimization.keywordsMatch)}`}>
                {optimization.keywordsMatch}%
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">Experience</p>
              <p className={`text-2xl font-bold ${getScoreColor(optimization.experienceAlign)}`}>
                {optimization.experienceAlign}%
              </p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600">Skills</p>
              <p className={`text-2xl font-bold ${getScoreColor(optimization.skillsCoverage)}`}>
                {optimization.skillsCoverage}%
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {[
              { id: 'headline', label: 'Headlines', icon: Sparkles, count: suggestedHeadlines.length },
              { id: 'about', label: 'About', icon: BookOpen },
              { id: 'keywords', label: 'Keywords', icon: Search, count: missingKeywords.length },
              { id: 'skills', label: 'Skills', icon: Award, count: skillsToAdd.length },
              { id: 'tips', label: 'Tips', icon: Lightbulb, count: experienceTips.length },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] py-4 px-3 font-medium transition-colors flex items-center justify-center ${
                    activeTab === tab.id
                      ? 'text-[#0077B5] border-b-2 border-[#0077B5] bg-blue-50'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* Headlines Tab */}
            {activeTab === 'headline' && (
              <div className="space-y-4">
                {suggestedHeadlines.map((headline: any, index: number) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-xl hover:border-[#0077B5] transition-colors">
                    <div className="flex justify-between mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        headline.strategy === 'visibility' ? 'bg-purple-100 text-purple-700' :
                        headline.strategy === 'job_search' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {getStrategyIcon(headline.strategy)}
                        <span className="ml-1">{getStrategyLabel(headline.strategy)}</span>
                      </span>
                      <button
                        onClick={() => copyToClipboard(headline.headline, `headline-${index}`)}
                        className="text-gray-400 hover:text-[#0077B5]"
                      >
                        {copiedItem === `headline-${index}` ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-lg font-medium mb-2">{headline.headline}</p>
                    <p className="text-sm text-gray-600">{headline.explanation}</p>
                    <p className="text-xs text-gray-400 mt-2">{headline.headline.length}/220 characters</p>
                  </div>
                ))}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div>
                <div className="flex justify-between mb-4">
                  <h3 className="font-semibold text-lg">Optimized About Section</h3>
                  <button
                    onClick={() => copyToClipboard(optimization.optimizedAbout || '', 'about')}
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
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 whitespace-pre-line text-gray-800 leading-relaxed">
                  {optimization.optimizedAbout}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {optimization.optimizedAbout?.length || 0}/2600 characters
                </p>
              </div>
            )}

            {/* Keywords Tab */}
            {activeTab === 'keywords' && (
              <div>
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-yellow-800">
                    <strong>Add these keywords</strong> to improve search visibility.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {missingKeywords.map((keyword: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl flex justify-between">
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium mr-2">{keyword.keyword}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(keyword.priority)}`}>
                            {keyword.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{keyword.context}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(keyword.keyword, `kw-${index}`)}
                        className="text-gray-400 hover:text-[#0077B5]"
                      >
                        {copiedItem === `kw-${index}` ? (
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
                    <strong>Add these skills</strong> to boost profile visibility!
                  </p>
                </div>
                <div className="space-y-3">
                  {skillsToAdd.map((skill: any, index: number) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl flex justify-between items-center">
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
                        className="text-gray-400 hover:text-[#0077B5]"
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
              </div>
            )}

            {/* Tips Tab */}
            {activeTab === 'tips' && (
              <div className="space-y-4">
                {experienceTips.map((tip: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleTip(index)}
                      className="w-full p-4 flex justify-between items-center hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <Briefcase className="w-5 h-5 text-[#0077B5] mr-3" />
                        <span className="font-medium">{tip.section}</span>
                      </div>
                      {expandedTips.includes(index) ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                    {expandedTips.includes(index) && (
                      <div className="p-4 border-t bg-gray-50 space-y-3">
                        <div>
                          <p className="text-sm font-medium text-red-600">⚠️ Issue:</p>
                          <p className="text-gray-700">{tip.currentIssue}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600">✅ Suggestion:</p>
                          <p className="text-gray-700">{tip.suggestion}</p>
                        </div>
                        <div>
                          <div className="flex justify-between">
                            <p className="text-sm font-medium text-[#0077B5]">💡 Example:</p>
                            <button onClick={() => copyToClipboard(tip.example, `tip-${index}`)}>
                              {copiedItem === `tip-${index}` ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <p className="bg-white p-3 rounded-lg border mt-1">{tip.example}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t bg-gray-50 flex justify-center gap-4 flex-wrap">
            <a
              href="https://www.linkedin.com/in/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-[#0077B5] text-white font-semibold rounded-xl hover:bg-[#006097] flex items-center"
            >
              <Linkedin className="w-5 h-5 mr-2" />
              Open LinkedIn
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
            <Link
              href="/linkedin-optimizer"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
            >
              New Analysis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
