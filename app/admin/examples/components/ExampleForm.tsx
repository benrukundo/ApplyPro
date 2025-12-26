'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ExampleFormProps {
  exampleId?: string;
}

export default function ExampleForm({ exampleId }: ExampleFormProps) {
  const router = useRouter();
  const isEditing = !!exampleId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    categoryId: '',
    experienceLevel: 'MID' as 'ENTRY' | 'MID' | 'SENIOR',
    summary: '',
    bulletPoints: [''],
    skills: [''],
    metaTitle: '',
    metaDescription: '',
    salaryRange: '',
    jobOutlook: '',
    writingTips: [''],
    commonMistakes: [''],
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchExample();
    }
  }, [exampleId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/examples?limit=1');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories.map((c: any) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchExample = async () => {
    try {
      const res = await fetch(`/api/admin/examples/${exampleId}`);
      if (!res.ok) throw new Error('Failed to fetch example');
      
      const data = await res.json();
      const ex = data.example;
      
      setFormData({
        title: ex.title,
        slug: ex.slug,
        categoryId: ex.categoryId,
        experienceLevel: ex.experienceLevel,
        summary: ex.summary,
        bulletPoints: ex.bulletPoints.length > 0 ? ex.bulletPoints : [''],
        skills: ex.skills.length > 0 ? ex.skills : [''],
        metaTitle: ex.metaTitle || '',
        metaDescription: ex.metaDescription || '',
        salaryRange: ex.salaryRange || '',
        jobOutlook: ex.jobOutlook || '',
        writingTips: ex.writingTips.length > 0 ? ex.writingTips : [''],
        commonMistakes: ex.commonMistakes.length > 0 ? ex.commonMistakes : [''],
        isActive: ex.isActive,
      });
    } catch (err) {
      setError('Failed to load example');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: isEditing ? prev.slug : generateSlug(value),
    }));
  };

  const handleArrayAdd = (field: 'bulletPoints' | 'skills' | 'writingTips' | 'commonMistakes') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const handleArrayRemove = (field: 'bulletPoints' | 'skills' | 'writingTips' | 'commonMistakes', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleArrayChange = (
    field: 'bulletPoints' | 'skills' | 'writingTips' | 'commonMistakes',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Clean up arrays - remove empty strings
      const cleanedData = {
        ...formData,
        bulletPoints: formData.bulletPoints.filter(b => b.trim()),
        skills: formData.skills.filter(s => s.trim()),
        writingTips: formData.writingTips.filter(t => t.trim()),
        commonMistakes: formData.commonMistakes.filter(m => m.trim()),
      };

      const url = isEditing
        ? `/api/admin/examples/${exampleId}`
        : '/api/admin/examples';
      
      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setSuccess(data.message);
      
      // Redirect after successful save
      setTimeout(() => {
        if (isEditing) {
          // After editing, go back to list
          router.push('/admin/examples');
        } else {
          // After creating, go to edit page
          router.push(`/admin/examples/${data.example.id}/edit`);
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/examples"
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">
              {isEditing ? 'Edit Resume Example' : 'Add Resume Example'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-400">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="e.g., Software Engineer"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  placeholder="software-engineer"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Experience Level *
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    experienceLevel: e.target.value as 'ENTRY' | 'MID' | 'SENIOR' 
                  }))}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ENTRY">Entry Level</option>
                  <option value="MID">Mid Level</option>
                  <option value="SENIOR">Senior Level</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Summary *
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                required
                rows={4}
                placeholder="Professional summary for this role..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-400">
                Active (visible on website)
              </label>
            </div>
          </div>

          {/* Bullet Points */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Experience Bullet Points</h2>
              <button
                type="button"
                onClick={() => handleArrayAdd('bulletPoints')}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Point
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.bulletPoints.map((point, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => handleArrayChange('bulletPoints', index, e.target.value)}
                    placeholder={`Bullet point ${index + 1}...`}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.bulletPoints.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('bulletPoints', index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Skills</h2>
              <button
                type="button"
                onClick={() => handleArrayAdd('skills')}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-1 bg-gray-700 rounded-lg overflow-hidden">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                    placeholder="Skill..."
                    className="px-3 py-1.5 bg-transparent border-none focus:outline-none w-32"
                  />
                  {formData.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('skills', index)}
                      className="p-1 text-red-400 hover:bg-red-500/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* SEO & Meta */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">SEO & Additional Info</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="SEO title..."
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={formData.salaryRange}
                  onChange={(e) => setFormData(prev => ({ ...prev, salaryRange: e.target.value }))}
                  placeholder="e.g., $80,000 - $120,000"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Meta Description
              </label>
              <textarea
                value={formData.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                rows={2}
                placeholder="SEO description..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Job Outlook
              </label>
              <textarea
                value={formData.jobOutlook}
                onChange={(e) => setFormData(prev => ({ ...prev, jobOutlook: e.target.value }))}
                rows={2}
                placeholder="Career outlook and growth potential..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Writing Tips */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Writing Tips</h2>
              <button
                type="button"
                onClick={() => handleArrayAdd('writingTips')}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Tip
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.writingTips.map((tip, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => handleArrayChange('writingTips', index, e.target.value)}
                    placeholder={`Writing tip ${index + 1}...`}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.writingTips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('writingTips', index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Common Mistakes</h2>
              <button
                type="button"
                onClick={() => handleArrayAdd('commonMistakes')}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Mistake
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.commonMistakes.map((mistake, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={mistake}
                    onChange={(e) => handleArrayChange('commonMistakes', index, e.target.value)}
                    placeholder={`Common mistake ${index + 1}...`}
                    className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.commonMistakes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('commonMistakes', index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Link
              href="/admin/examples"
              className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg transition-colors"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isEditing ? 'Save Changes' : 'Create Example'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
