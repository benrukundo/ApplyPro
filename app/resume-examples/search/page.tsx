'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Loader2,
  Filter,
  X,
  Briefcase,
  TrendingUp,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import { debounce } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  summary: string;
  experienceLevel: string;
  skills: string[];
  viewCount: number;
  salaryRange: string | null;
  category: {
    name: string;
    slug: string;
    icon: string;
    color: string;
  };
  url: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  hasMore: boolean;
}

const EXPERIENCE_LEVELS = [
  { value: '', label: 'All Levels' },
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'MID', label: 'Mid Level' },
  { value: 'SENIOR', label: 'Senior Level' },
];

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [levelFilter, setLevelFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = useCallback(
    async (searchQuery: string, newSearch = true) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setTotal(0);
        return;
      }

      setIsLoading(true);
      const currentOffset = newSearch ? 0 : offset;

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          limit: '20',
          offset: currentOffset.toString(),
        });

        if (levelFilter) params.set('level', levelFilter);

        const response = await fetch(`/api/examples/search?${params}`);
        const data: SearchResponse = await response.json();

        if (newSearch) {
          setResults(data.results);
          setOffset(20);
        } else {
          setResults((prev) => [...prev, ...data.results]);
          setOffset((prev) => prev + 20);
        }

        setTotal(data.total);
        setHasMore(data.hasMore);

        router.replace(`/resume-examples/search?q=${encodeURIComponent(searchQuery)}`, {
          scroll: false,
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [offset, levelFilter, router]
  );

  const debouncedSearch = useCallback(
    debounce((q: string) => performSearch(q, true), 300),
    [performSearch]
  );

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (query !== initialQuery) {
      debouncedSearch(query);
    }
  }, [query, debouncedSearch, initialQuery]);

  useEffect(() => {
    if (query.length >= 2) {
      performSearch(query, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelFilter]);

  const loadMore = () => {
    performSearch(query, false);
  };

  const experienceLevelColors: Record<string, string> = {
    ENTRY: 'bg-green-100 text-green-700',
    MID: 'bg-blue-100 text-blue-700',
    SENIOR: 'bg-purple-100 text-purple-700',
  };

  const experienceLevelLabels: Record<string, string> = {
    ENTRY: 'Entry Level',
    MID: 'Mid Level',
    SENIOR: 'Senior Level',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-20">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Search Resume Examples
          </h1>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by job title, skill, or industry..."
              className="w-full pl-12 pr-12 py-4 text-gray-900 rounded-xl border-0 shadow-lg focus:ring-4 focus:ring-white/30 focus:outline-none text-lg"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setTotal(0);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {total > 0 && (
            <p className="text-center mt-4 text-blue-100">
              Found <span className="font-semibold text-white">{total}</span> resume examples
              {query && (
                <>
                  {' '}
                  for &quot;<span className="font-semibold text-white">{query}</span>&quot;
                </>
              )}
            </p>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {levelFilter && (
            <button
              onClick={() => setLevelFilter('')}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm"
            >
              {experienceLevelLabels[levelFilter]}
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Experience Level</h3>
            <div className="flex flex-wrap gap-2">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setLevelFilter(level.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    levelFilter === level.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {isLoading && results.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            {query.length >= 2 ? (
              <>
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">No results found</h2>
                <p className="text-gray-600">Try searching with different keywords or browse our categories.</p>
                <Link
                  href="/resume-examples"
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse All Examples
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Start searching</h2>
                <p className="text-gray-600">Enter at least 2 characters to search resume examples.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.url}
                  className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{result.category.icon}</span>
                    <span className="text-sm text-gray-500">{result.category.name}</span>
                  </div>

                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                    {result.title}
                  </h3>

                  <span className={`inline-block text-xs px-2 py-1 rounded-full mb-3 ${experienceLevelColors[result.experienceLevel]}`}>
                    {experienceLevelLabels[result.experienceLevel]}
                  </span>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{result.summary}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {result.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{skill}</span>
                    ))}
                    {result.skills.length > 3 && <span className="text-xs text-gray-500">+{result.skills.length - 3}</span>}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {result.viewCount.toLocaleString()} views
                    </span>
                    {result.salaryRange && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {result.salaryRange}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More Results
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
