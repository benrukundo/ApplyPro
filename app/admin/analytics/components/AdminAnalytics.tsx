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
  Calendar,
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

// Simple Line Chart Component
function SimpleLineChart({ data, height = 200 }: { data: Array<{ date: string; views: number }>; height?: number }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-slate-500">
        No data available
      </div>
    );
  }

  const maxViews = Math.max(...data.map(d => d.views), 1);
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1 || 1)) * 100,
    y: 100 - (d.views / maxViews) * 100,
    views: d.views,
    date: d.date,
  }));

  const pathD = points.length > 1 
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  const areaD = points.length > 1
    ? `M ${points[0].x},100 L ${points.map(p => `${p.x},${p.y}`).join(' L ')} L ${points[points.length - 1].x},100 Z`
    : '';

  return (
    <div className="relative" style={{ height }}>
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-slate-500">
        <span>{maxViews}</span>
        <span>{Math.round(maxViews / 2)}</span>
        <span>0</span>
      </div>
      
      {/* Chart area */}
      <div className="ml-14 h-full pr-4">
        <svg 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none" 
          className="w-full h-[calc(100%-2rem)]"
        >
          {/* Grid lines */}
          <line x1="0" y1="0" x2="100" y2="0" stroke="#334155" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,2" />
          <line x1="0" y1="100" x2="100" y2="100" stroke="#334155" strokeWidth="0.5" />
          
          {/* Area fill */}
          {points.length > 1 && (
            <path
              d={areaD}
              fill="url(#gradient)"
              opacity="0.3"
            />
          )}
          
          {/* Line */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          )}
          
          {/* Points */}
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="3"
              fill="#3b82f6"
              className="hover:r-5 transition-all cursor-pointer"
              vectorEffect="non-scaling-stroke"
            >
              <title>{`${point.date}: ${point.views} ${point.views === 1 ? 'view' : 'views'}`}</title>
            </circle>
          ))}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          {data.length > 0 && (
            <>
              <span>{formatDateShort(data[0].date)}</span>
              {data.length > 2 && (
                <span>{formatDateShort(data[Math.floor(data.length / 2)].date)}</span>
              )}
              <span>{formatDateShort(data[data.length - 1].date)}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper function for pluralization
function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}

export default function AdminAnalytics() {
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
        console.error('Failed to fetch analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Time Filter */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h1>
          <p className="text-slate-400">Track resume example performance and user engagement</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="bg-transparent text-sm text-white focus:outline-none cursor-pointer"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : !data ? (
        <div className="text-center py-20">
          <p className="text-slate-400">Failed to load analytics</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Eye className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm text-slate-400">Total Views</span>
              </div>
              <p className="text-3xl font-bold text-white">{data.summary.totalViews.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Last {days} days</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <MousePointer className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm text-slate-400">Previews</span>
              </div>
              <p className="text-3xl font-bold text-white">{data.summary.totalPreviews.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Last {days} days</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Download className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-sm text-slate-400">Template Uses</span>
              </div>
              <p className="text-3xl font-bold text-white">{data.summary.totalTemplateUses.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Last {days} days</p>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm text-slate-400">Conversion Rate</span>
              </div>
              <p className="text-3xl font-bold text-white">{data.summary.conversionRate}%</p>
              <p className="text-xs text-slate-500 mt-1">Views → Template</p>
            </div>
          </div>

          {/* Views Over Time Chart */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-slate-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                Views Over Time
              </h3>
            </div>
            <div className="p-6">
              <SimpleLineChart data={data.dailyViews} height={250} />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Top Examples */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Top Resume Examples
                </h3>
              </div>
              <div className="divide-y divide-slate-700">
                {data.topExamples.map((example, index) => (
                  <div key={example.slug} className="px-6 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-300">
                        {index + 1}
                      </span>
                      <span className="text-slate-200">{example.title}</span>
                    </div>
                    <span className="text-sm text-slate-400">
                      {example.views.toLocaleString()} {pluralize(example.views, 'view')}
                    </span>
                  </div>
                ))}
                {data.topExamples.length === 0 && (
                  <p className="px-6 py-4 text-slate-400 text-center">No data yet</p>
                )}
              </div>
            </div>

            {/* Top Categories */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  Top Categories
                </h3>
              </div>
              <div className="divide-y divide-slate-700">
                {data.topCategories.map((category, index) => (
                  <div key={category.slug} className="px-6 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-medium text-slate-300">
                        {index + 1}
                      </span>
                      <span className="text-slate-200">{category.name}</span>
                    </div>
                    <span className="text-sm text-slate-400">
                      {category.views.toLocaleString()} {pluralize(category.views, 'view')}
                    </span>
                  </div>
                ))}
                {data.topCategories.length === 0 && (
                  <p className="px-6 py-4 text-slate-400 text-center">No data yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Top Searches */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-700">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Search className="w-5 h-5 text-green-400" />
                Top Search Queries
              </h3>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {data.topSearches.map((search) => (
                  <span
                    key={search.query}
                    className="px-3 py-1.5 bg-slate-700 text-slate-300 rounded-full text-sm hover:bg-slate-600 transition-colors"
                    title={`${search.count} ${pluralize(search.count, 'search', 'searches')}`}
                  >
                    {search.query}
                    <span className="ml-2 text-slate-400">({search.count})</span>
                  </span>
                ))}
                {data.topSearches.length === 0 && (
                  <p className="text-slate-400">No searches yet</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
