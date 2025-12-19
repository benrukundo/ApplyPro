'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Linkedin,
  ArrowLeft,
  Eye,
  Trash2,
  Loader2,
  Calendar,
  Target,
  AlertCircle,
} from 'lucide-react';

interface SavedOptimization {
  id: string;
  targetRole: string | null;
  currentHeadline: string | null;
  consistencyScore: number;
  keywordsMatch: number;
  experienceAlign: number;
  skillsCoverage: number;
  createdAt: string;
}

export default function SavedOptimizationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [optimizations, setOptimizations] = useState<SavedOptimization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/linkedin-optimizer/saved');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchOptimizations = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/linkedin/list');
        if (response.ok) {
          const data = await response.json();
          setOptimizations(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch optimizations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOptimizations();
  }, [session?.user?.id]);

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      const response = await fetch(`/api/linkedin/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setOptimizations((prev) => prev.filter((o) => o.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleteId(null);
    }
  };

  const getOverallScore = (opt: SavedOptimization) => {
    return Math.round(
      (opt.consistencyScore + opt.keywordsMatch + opt.experienceAlign + opt.skillsCoverage) / 4
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0077B5]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link
            href="/linkedin-optimizer"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to LinkedIn Optimizer
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <Linkedin className="w-10 h-10 text-[#0077B5]" />
            Saved LinkedIn Optimizations
          </h1>
          <p className="text-lg text-gray-600">
            Review your previous LinkedIn profile analyses
          </p>
        </div>

        {/* Optimizations Grid */}
        {optimizations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Linkedin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No saved optimizations yet
            </h3>
            <p className="text-gray-600 mb-6">
              Analyze your LinkedIn profile to get personalized optimization recommendations.
            </p>
            <Link
              href="/linkedin-optimizer"
              className="inline-flex items-center px-6 py-3 bg-[#0077B5] text-white font-semibold rounded-xl hover:bg-[#006097]"
            >
              Optimize Your Profile
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {optimizations.map((opt) => {
              const overallScore = getOverallScore(opt);
              return (
                <div
                  key={opt.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b bg-gradient-to-r from-[#0077B5] to-[#00A0DC]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-white">
                        <Linkedin className="w-5 h-5 mr-2" />
                        <span className="font-medium">Profile Analysis</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(overallScore)}`}>
                        {overallScore}%
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4">
                    {opt.targetRole && (
                      <div className="flex items-center text-gray-700 mb-3">
                        <Target className="w-4 h-4 mr-2 text-[#0077B5]" />
                        <span className="font-medium">{opt.targetRole}</span>
                      </div>
                    )}

                    {opt.currentHeadline && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        &quot;{opt.currentHeadline}&quot;
                      </p>
                    )}

                    {/* Score Breakdown */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Consistency</p>
                        <p className="font-bold text-gray-900">{opt.consistencyScore}%</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Keywords</p>
                        <p className="font-bold text-gray-900">{opt.keywordsMatch}%</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Experience</p>
                        <p className="font-bold text-gray-900">{opt.experienceAlign}%</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">Skills</p>
                        <p className="font-bold text-gray-900">{opt.skillsCoverage}%</p>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(opt.createdAt)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/linkedin-optimizer/view/${opt.id}`}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-[#0077B5] text-white rounded-lg hover:bg-[#006097]"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Link>
                      <button
                        onClick={() => deleteId === opt.id ? handleDelete(opt.id) : setDeleteId(opt.id)}
                        disabled={deleteId === opt.id}
                        className={`px-4 py-2 ${deleteId === opt.id ? 'bg-red-600 text-white' : 'border border-red-300 text-red-600'} rounded-lg hover:bg-red-50 disabled:opacity-50`}
                      >
                        {deleteId === opt.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create New Button */}
        {optimizations.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/linkedin-optimizer"
              className="inline-flex items-center px-6 py-3 bg-[#0077B5] text-white font-semibold rounded-xl hover:bg-[#006097]"
            >
              Optimize Another Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
