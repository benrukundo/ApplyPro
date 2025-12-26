'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Eye, 
  MousePointer, 
  Download,
  TrendingUp,
  Search,
  Loader2,
  Calendar
} from 'lucide-react';

interface AnalyticsSummary {
  summary: {
    totalViews: number;
    totalPreviews: number;
    totalTemplateUses: number;
    conversionRate: string;
  };
  topExamples: Array<{ slug: string; title: string; views: number }>;
  topCategories: Array<{ slug: string; name: string; views: number }>;
  topSearches: Array<{ query: string; count: number }>;
  dailyViews: Array<{ date: string; views: number }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/analytics/summary?days=${days}`);
        const result = await response.json();
        setData(result);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Examples Analytics</h1>
            <p className="text-gray-600 mt-1">Track how users interact with your resume examples</p>
          </div>
          
          {/* Time Period Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Total Views</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data.summary.totalViews.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MousePointer className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-600">Previews</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data.summary.totalPreviews.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Template Uses</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data.summary.totalTemplateUses.toLocaleString()}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm text-gray-600">Conversion Rate</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {data.summary.conversionRate}%
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top Examples */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Top Resume Examples
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {data.topExamples.map((example, index) => (
                <div key={example.slug} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{example.title}</span>
                  </div>
                  <span className="text-sm text-gray-500">{example.views.toLocaleString()} views</span>
                </div>
              ))}
              {data.topExamples.length === 0 && (
                <p className="px-6 py-4 text-gray-500 text-center">No data yet</p>
              )}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Top Categories
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {data.topCategories.map((category, index) => (
                <div key={category.slug} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{category.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{category.views.toLocaleString()} views</span>
                </div>
              ))}
              {data.topCategories.length === 0 && (
                <p className="px-6 py-4 text-gray-500 text-center">No data yet</p>
              )}
            </div>
          </div>

          {/* Top Searches */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden lg:col-span-2">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-green-600" />
                Top Search Queries
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {data.topSearches.map((search) => (
                  <span
                    key={search.query}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {search.query}
                    <span className="ml-2 text-gray-400">({search.count})</span>
                  </span>
                ))}
                {data.topSearches.length === 0 && (
                  <p className="text-gray-500">No searches yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
