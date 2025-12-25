// components/builder/SmartSuggestions.tsx
'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, Plus, ChevronDown, ChevronUp } from 'lucide-react';

interface SmartSuggestionsProps {
  jobTitle: string;
  currentBullets: string[];
  onAddBullet: (bullet: string) => void;
  onAddSkill: (skill: string) => void;
  currentSkills: string[];
}

interface Suggestions {
  bullets: string[];
  skills: string[];
  tips: string[];
}

export function SmartSuggestions({
  jobTitle,
  currentBullets,
  onAddBullet,
  onAddSkill,
  currentSkills,
}: SmartSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'bullets' | 'skills' | 'tips'>('bullets');

  useEffect(() => {
    if (jobTitle && jobTitle.length > 2) {
      fetchSuggestions();
    }
  }, [jobTitle]);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/builder/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle }),
      });

      const data = await response.json();
      if (data.success) {
        setSuggestions({
          bullets: data.data.matchedExample?.bulletPoints || [],
          skills: data.data.suggestedSkills || [],
          tips: data.data.tips || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!jobTitle || !suggestions) {
    return null;
  }

  const unusedBullets = suggestions.bullets.filter(
    (b) => !currentBullets.some((cb) => cb.toLowerCase() === b.toLowerCase())
  );

  const unusedSkills = suggestions.skills.filter(
    (s) => !currentSkills.some((cs) => cs.toLowerCase() === s.toLowerCase())
  );

  if (unusedBullets.length === 0 && unusedSkills.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-amber-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <span className="font-medium text-gray-900">
            Smart Suggestions for {jobTitle}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('bullets')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'bullets'
                  ? 'bg-amber-200 text-amber-800'
                  : 'text-gray-600 hover:bg-amber-100'
              }`}
            >
              Achievements ({unusedBullets.length})
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'skills'
                  ? 'bg-amber-200 text-amber-800'
                  : 'text-gray-600 hover:bg-amber-100'
              }`}
            >
              Skills ({unusedSkills.length})
            </button>
            <button
              onClick={() => setActiveTab('tips')}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'tips'
                  ? 'bg-amber-200 text-amber-800'
                  : 'text-gray-600 hover:bg-amber-100'
              }`}
            >
              Tips
            </button>
          </div>

          {/* Content */}
          {activeTab === 'bullets' && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {unusedBullets.length > 0 ? (
                unusedBullets.map((bullet, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 bg-white rounded-lg border border-amber-100 group"
                  >
                    <p className="flex-1 text-sm text-gray-700">{bullet}</p>
                    <button
                      onClick={() => onAddBullet(bullet)}
                      className="flex-shrink-0 p-1 text-amber-600 hover:bg-amber-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Add to resume"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  All suggestions have been added!
                </p>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {unusedSkills.length > 0 ? (
                unusedSkills.map((skill, index) => (
                  <button
                    key={index}
                    onClick={() => onAddSkill(skill)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-amber-200 rounded-full text-sm text-gray-700 hover:bg-amber-100 hover:border-amber-300 transition-colors group"
                  >
                    {skill}
                    <Plus className="w-3 h-3 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 w-full">
                  All skills have been added!
                </p>
              )}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-2">
              {suggestions.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-white rounded-lg border border-amber-100"
                >
                  <span className="text-amber-500">💡</span>
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
