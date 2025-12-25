// app/components/SkillAutocomplete.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, X, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { debounce } from '@/lib/utils';

interface Skill {
  name: string;
  category?: string;
  source?: string;
}

interface SkillAutocompleteProps {
  selectedSkills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  category?: 'technical' | 'soft' | 'languages' | 'certifications';
  industry?: string;
  placeholder?: string;
  maxSkills?: number;
  label?: string;
  helperText?: string;
}

export default function SkillAutocomplete({
  selectedSkills,
  onAddSkill,
  onRemoveSkill,
  category,
  industry,
  placeholder = 'Type to search skills...',
  maxSkills = 20,
  label,
  helperText,
}: SkillAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Skill[]>([]);
  const [popularSkills, setPopularSkills] = useState<string[]>([]);
  const [industrySkills, setIndustrySkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load initial suggestions
  useEffect(() => {
    const loadInitialSkills = async () => {
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (industry) params.set('industry', industry);

        const response = await fetch(`/api/skills?${params}`);
        const data = await response.json();

        if (data.suggestions) {
          setSuggestions(data.suggestions);
        }
        if (data.popular) {
          setPopularSkills(data.popular.slice(0, 10));
        }
        if (data.industrySkills) {
          setIndustrySkills(data.industrySkills);
        }
      } catch (error) {
        console.error('Error loading skills:', error);
      }
    };

    loadInitialSkills();
  }, [category, industry]);

  // Search skills
  const searchSkills = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: '8',
      });
      if (category) params.set('category', category);

      const response = await fetch(`/api/skills?${params}`);
      const data = await response.json();

      if (data.results) {
        // Filter out already selected skills
        const filtered = data.results.filter(
          (skill: Skill) => !selectedSkills.includes(skill.name)
        );
        setSuggestions(filtered);
      }
    } catch (error) {
      console.error('Error searching skills:', error);
    } finally {
      setIsLoading(false);
    }
  }, [category, selectedSkills]);

  const debouncedSearch = useCallback(
    debounce((q: string) => searchSkills(q), 200),
    [searchSkills]
  );

  useEffect(() => {
    if (query) {
      debouncedSearch(query);
    } else {
      setSuggestions([]);
    }
  }, [query, debouncedSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        Math.min(prev + 1, suggestions.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleAddSkill(suggestions[selectedIndex].name);
      } else if (query.trim()) {
        handleAddSkill(query.trim());
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleAddSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill) && selectedSkills.length < maxSkills) {
      onAddSkill(skill);
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(-1);
      inputRef.current?.focus();
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get suggested skills to show (filter out selected)
  const availablePopularSkills = popularSkills.filter(
    (skill) => !selectedSkills.includes(skill)
  );
  const availableIndustrySkills = industrySkills.filter(
    (skill) => !selectedSkills.includes(skill)
  );

  const showDropdown = isFocused && (
    suggestions.length > 0 ||
    (query.length === 0 && (availablePopularSkills.length > 0 || availableIndustrySkills.length > 0))
  );

  return (
    <div className="space-y-3">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {maxSkills && (
            <span className="ml-2 text-gray-400 font-normal">
              ({selectedSkills.length}/{maxSkills})
            </span>
          )}
        </label>
      )}

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {selectedSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 shadow-sm"
            >
              {skill}
              <button
                onClick={() => onRemoveSkill(skill)}
                className="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
              >
                <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={selectedSkills.length >= maxSkills}
            className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto"
          >
            {/* Search Results */}
            {query && suggestions.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Search Results
                </p>
                {suggestions.map((skill, index) => (
                  <button
                    key={skill.name}
                    onClick={() => handleAddSkill(skill.name)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    type="button"
                  >
                    <span className="font-medium">{skill.name}</span>
                    {skill.category && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {skill.category}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Add Custom Skill */}
            {query && !suggestions.find((s) => s.name.toLowerCase() === query.toLowerCase()) && (
              <div className="p-2 border-t border-gray-100">
                <button
                  onClick={() => handleAddSkill(query)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add "{query}" as custom skill</span>
                </button>
              </div>
            )}

            {/* Industry Skills */}
            {!query && availableIndustrySkills.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <p className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Recommended for {industry}
                </p>
                <div className="flex flex-wrap gap-1.5 px-2 py-2">
                  {availableIndustrySkills.slice(0, 8).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleAddSkill(skill)}
                      className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                      type="button"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Skills */}
            {!query && availablePopularSkills.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <p className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Popular Skills
                </p>
                <div className="flex flex-wrap gap-1.5 px-2 py-2">
                  {availablePopularSkills.slice(0, 8).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleAddSkill(skill)}
                      className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                      type="button"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {helperText && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}

      {/* Max reached warning */}
      {selectedSkills.length >= maxSkills && (
        <p className="text-sm text-amber-600 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          Maximum skills reached. Remove some to add more.
        </p>
      )}
    </div>
  );
}
