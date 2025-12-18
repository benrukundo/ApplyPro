'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  Calendar,
  Briefcase,
  Phone,
  Code,
  Users,
  Award,
  Trash2,
  Eye,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface SavedPrep {
  id: string;
  jobTitle: string;
  company: string | null;
  interviewType: string;
  createdAt: string;
  _count: {
    mockSessions: number;
  };
}

const interviewTypeIcons: Record<string, any> = {
  PHONE_SCREENING: Phone,
  TECHNICAL: Code,
  BEHAVIORAL: Brain,
  HR_CULTURE: Users,
  FINAL_ROUND: Award,
};

const interviewTypeColors: Record<string, string> = {
  PHONE_SCREENING: 'bg-blue-100 text-blue-700 border-blue-200',
  TECHNICAL: 'bg-purple-100 text-purple-700 border-purple-200',
  BEHAVIORAL: 'bg-green-100 text-green-700 border-green-200',
  HR_CULTURE: 'bg-orange-100 text-orange-700 border-orange-200',
  FINAL_ROUND: 'bg-red-100 text-red-700 border-red-200',
};

export default function SavedInterviewPrepsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [preps, setPreps] = useState<SavedPrep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/interview-prep/saved');
    }
  }, [status, router]);

  // Load saved preps
  useEffect(() => {
    const loadPreps = async () => {
      if (!session?.user?.id) return;

      setIsLoading(true);
      try {
        const response = await fetch('/api/interview-prep/list');
        if (response.ok) {
          const data = await response.json();
          setPreps(data.data);
        } else {
          setError('Failed to load saved interview preps');
        }
      } catch (err) {
        console.error('Error loading preps:', err);
        setError('Failed to load saved interview preps');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreps();
  }, [session?.user?.id]);

  // Delete prep
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this interview preparation?')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/interview-prep/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPreps(preps.filter((p) => p.id !== id));
      } else {
        setError('Failed to delete interview prep');
      }
    } catch (err) {
      console.error('Error deleting prep:', err);
      setError('Failed to delete interview prep');
    } finally {
      setDeletingId(null);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
            <Brain className="w-10 h-10 text-blue-600" />
            Saved Interview Preps
          </h1>
          <p className="text-lg text-gray-600">
            Review your saved interview preparations anytime
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Empty State */}
        {preps.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Saved Interview Preps Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Generate your first interview preparation to get started
            </p>
            <Link
              href="/interview-prep"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Create Interview Prep
            </Link>
          </div>
        ) : (
          /* List of Saved Preps */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {preps.map((prep) => {
              const Icon = interviewTypeIcons[prep.interviewType] || Brain;
              const colorClass = interviewTypeColors[prep.interviewType] || 'bg-gray-100 text-gray-700 border-gray-200';

              return (
                <div
                  key={prep.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <div className={`p-4 border-b-2 ${colorClass.split(' ')[2]}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-2 rounded-lg ${colorClass.split(' ')[0]}`}>
                        <Icon className={`w-5 h-5 ${colorClass.split(' ')[1]}`} />
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}
                      >
                        {prep.interviewType.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {prep.jobTitle}
                    </h3>
                    {prep.company && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {prep.company}
                      </p>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(prep.createdAt)}</span>
                    </div>

                    {prep._count.mockSessions > 0 && (
                      <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700">
                        {prep._count.mockSessions} mock interview{prep._count.mockSessions > 1 ? 's' : ''} completed
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/interview-prep/view/${prep.id}`}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(prep.id)}
                        disabled={deletingId === prep.id}
                        className="px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {deletingId === prep.id ? (
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
        {preps.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              href="/interview-prep"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Create New Interview Prep
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
