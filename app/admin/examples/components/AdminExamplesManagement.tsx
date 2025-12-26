'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  FileText,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  Loader2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { examples: number };
}

interface Example {
  id: string;
  title: string;
  slug: string;
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR';
  summary: string;
  skills: string[];
  viewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  };
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  byLevel: {
    entry: number;
    mid: number;
    senior: number;
  };
}

const levelLabels = {
  ENTRY: { label: 'Entry Level', color: 'bg-green-500/20 text-green-400' },
  MID: { label: 'Mid Level', color: 'bg-blue-500/20 text-blue-400' },
  SENIOR: { label: 'Senior Level', color: 'bg-purple-500/20 text-purple-400' },
};

export default function AdminExamplesManagement() {
  const [examples, setExamples] = useState<Example[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchExamples();
  }, [page, selectedCategory, selectedLevel, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchExamples();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchExamples = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedLevel) params.set('level', selectedLevel);
      if (selectedStatus) params.set('status', selectedStatus);

      const res = await fetch(`/api/admin/examples?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setExamples(data.examples);
      setCategories(data.categories);
      setStats(data.stats);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
    } catch (err) {
      setError('Failed to load examples');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === examples.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(examples.map(e => e.id)));
    }
  };

  const performBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedIds.size === 0) return;
    
    if (action === 'delete' && !confirm(`Are you sure you want to permanently delete ${selectedIds.size} example(s)?`)) {
      return;
    }

    setActionLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/admin/examples/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          ids: Array.from(selectedIds),
        }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      setSuccess(data.message);
      setSelectedIds(new Set());
      fetchExamples();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleExampleStatus = async (example: Example) => {
    try {
      const res = await fetch(`/api/admin/examples/${example.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !example.isActive }),
      });

      if (!res.ok) throw new Error('Failed to update');
      
      setSuccess(`"${example.title}" ${example.isActive ? 'deactivated' : 'activated'}`);
      fetchExamples();
    } catch (err) {
      setError('Failed to update example');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-500" />
                  Resume Examples
                </h1>
                <p className="text-gray-400 text-sm">
                  {stats?.total || 0} total examples across {categories.length} categories
                </p>
              </div>
            </div>
            <Link
              href="/admin/examples/new"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Example
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Active</p>
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Entry Level</p>
              <p className="text-2xl font-bold text-green-400">{stats.byLevel.entry}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Mid Level</p>
              <p className="text-2xl font-bold text-blue-400">{stats.byLevel.mid}</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-400 text-sm">Senior Level</p>
              <p className="text-2xl font-bold text-purple-400">{stats.byLevel.senior}</p>
            </div>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-400">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto">
              <XCircle className="w-4 h-4 text-red-400" />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-400">{success}</p>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <XCircle className="w-4 h-4 text-green-400" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search examples..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat._count.examples})
                </option>
              ))}
            </select>

            {/* Level Filter */}
            <select
              value={selectedLevel}
              onChange={(e) => { setSelectedLevel(e.target.value); setPage(1); }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="ENTRY">Entry Level</option>
              <option value="MID">Mid Level</option>
              <option value="SENIOR">Senior Level</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6 flex items-center justify-between">
            <p className="text-blue-400">
              {selectedIds.size} example(s) selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => performBulkAction('activate')}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Activate
              </button>
              <button
                onClick={() => performBulkAction('deactivate')}
                disabled={actionLoading}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-sm flex items-center gap-2"
              >
                <EyeOff className="w-4 h-4" />
                Deactivate
              </button>
              <button
                onClick={() => performBulkAction('delete')}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Examples Table */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
            </div>
          ) : examples.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No examples found</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <button onClick={selectAll} className="p-1 hover:bg-gray-600 rounded">
                        {selectedIds.size === examples.length ? (
                          <CheckSquare className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Views</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {examples.map((example) => (
                    <tr key={example.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelect(example.id)}
                          className="p-1 hover:bg-gray-600 rounded"
                        >
                          {selectedIds.has(example.id) ? (
                            <CheckSquare className="w-5 h-5 text-blue-500" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{example.title}</p>
                          <p className="text-sm text-gray-500">{example.slug}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span 
                          className="px-2 py-1 rounded text-xs"
                          style={{ 
                            backgroundColor: example.category.color ? `${example.category.color}20` : '#3b82f620',
                            color: example.category.color || '#3b82f6'
                          }}
                        >
                          {example.category.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${levelLabels[example.experienceLevel].color}`}>
                          {levelLabels[example.experienceLevel].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-gray-400">
                          <BarChart3 className="w-4 h-4" />
                          {example.viewCount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleExampleStatus(example)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            example.isActive 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {example.isActive ? (
                            <>
                              <Eye className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/resume-examples/${example.category.slug}/${example.slug}`}
                            target="_blank"
                            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                            title="View on site"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </Link>
                          <Link
                            href={`/admin/examples/${example.id}/edit`}
                            className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="px-3 py-1 bg-gray-700 rounded">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
