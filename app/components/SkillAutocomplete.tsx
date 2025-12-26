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

// Category-specific labels for the dropdown
const getCategoryLabel = (category?: string): string => {
  switch (category) {
    case 'technical':
      return 'Popular Technical Skills';
    case 'soft':
      return 'Popular Soft Skills';
    case 'languages':
      return 'Common Languages';
    case 'certifications':
      return 'Popular Certifications';
    default:
      return 'Popular Skills';
  }
};

// Category-specific placeholder text
const getPlaceholderText = (category?: string): string => {
  switch (category) {
    case 'technical':
      return 'Type a skill and press Enter (e.g., JavaScript, Excel, Figma...)';
    case 'soft':
      return 'Type a skill and press Enter (e.g., Leadership, Communication...)';
    case 'languages':
      return 'Type a language and press Enter (e.g., Kinyarwanda, Swahili...)';
    case 'certifications':
      return 'Type a certification and press Enter (e.g., AWS Certified, PMP...)';
    default:
      return 'Type and press Enter to add...';
  }
};

export default function SkillAutocomplete({
  selectedSkills,
  onAddSkill,
  onRemoveSkill,
  category,
  industry,
  placeholder,
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

  // Use custom placeholder or generate based on category
  const inputPlaceholder = placeholder || getPlaceholderText(category);

  // Load initial suggestions based on category
  useEffect(() => {
    const loadInitialSkills = async () => {
      try {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (industry) params.set('industry', industry);

        const response = await fetch(`/api/skills?${params}`);
        const data = await response.json();

        if (data.popular) {
          setPopularSkills(data.popular);
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
        limit: '6',
      });
      if (category) params.set('category', category);

      const response = await fetch(`/api/skills?${params}`);
      const data = await response.json();

      if (data.results) {
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

  // Handle adding a skill
  const handleAddSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    if (trimmedSkill && !selectedSkills.includes(trimmedSkill) && selectedSkills.length < maxSkills) {
      onAddSkill(trimmedSkill);
      setQuery('');
      setSuggestions([]);
      setSelectedIndex(-1);
      inputRef.current?.focus();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const maxIndex = suggestions.length; // +1 for "Add custom" option
      setSelectedIndex((prev) => Math.min(prev + 1, maxIndex - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      
      // If a suggestion is selected, use it
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleAddSkill(suggestions[selectedIndex].name);
      } else if (query.trim()) {
        // Otherwise, add the typed text as a custom entry
        handleAddSkill(query.trim());
      }
    } else if (e.key === 'Tab' && query.trim()) {
      // Tab also adds the current input
      e.preventDefault();
      handleAddSkill(query.trim());
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === ',' || e.key === ';') {
      // Comma or semicolon to add and continue
      e.preventDefault();
      if (query.trim()) {
        handleAddSkill(query.trim());
      }
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
        setSelectedIndex(-1);
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

  // Check if current query matches any suggestion exactly
  const queryMatchesSuggestion = suggestions.some(
    (s) => s.name.toLowerCase() === query.toLowerCase()
  );

  // Show dropdown when focused and either has suggestions or popular skills
  const showDropdown = isFocused && (
    query.length > 0 || 
    availablePopularSkills.length > 0 || 
    availableIndustrySkills.length > 0
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
            placeholder={inputPlaceholder}
            disabled={selectedSkills.length >= maxSkills}
            className="w-full pl-4 pr-24 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          
          {/* Right side: Loading or Add button */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading && (
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
            )}
            {query.trim() && !isLoading && selectedSkills.length < maxSkills && (
              <button
                onClick={() => handleAddSkill(query.trim())}
                type="button"
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </div>

        {/* Hint text */}
        {isFocused && query.trim() && !queryMatchesSuggestion && selectedSkills.length < maxSkills && (
          <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</span>
            <span>to add &quot;{query.trim()}&quot;</span>
            <span className="mx-1">•</span>
            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">,</span>
            <span>to add and continue</span>
          </p>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto"
          >
            {/* Current Input as First Option (if typing) */}
            {query.trim() && !queryMatchesSuggestion && !selectedSkills.includes(query.trim()) && (
              <div className="p-2 border-b border-gray-100">
                <button
                  onClick={() => handleAddSkill(query.trim())}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    selectedIndex === -1 || selectedIndex >= suggestions.length
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  type="button"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add &quot;<strong>{query.trim()}</strong>&quot;</span>
                </button>
              </div>
            )}

            {/* Search Results / Suggestions */}
            {query && suggestions.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Suggestions
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
                  </button>
                ))}
              </div>
            )}

            {/* Industry Skills - Only show for technical skills when not searching */}
            {!query && availableIndustrySkills.length > 0 && category === 'technical' && (
              <div className="p-2">
                <p className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Recommended for {industry}
                </p>
                <div className="flex flex-wrap gap-1.5 px-2 py-2">
                  {availableIndustrySkills.slice(0, 8).map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleAddSkill(skill)}
                      className="px-3 py-1.5 text-sm bg-amber-50 text-amber-700 rounded-full hover:bg-amber-100 transition-colors border border-amber-200"
                      type="button"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Category-Specific Popular Skills */}
            {!query && availablePopularSkills.length > 0 && (
              <div className={`p-2 ${availableIndustrySkills.length > 0 && category === 'technical' ? 'border-t border-gray-100' : ''}`}>
                <p className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {getCategoryLabel(category)}
                </p>
                <div className="flex flex-wrap gap-1.5 px-2 py-2">
                  {availablePopularSkills.slice(0, 10).map((skill) => (
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

            {/* Empty state when searching with no results */}
            {query && suggestions.length === 0 && !isLoading && (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No suggestions found for &quot;{query}&quot;</p>
                <p className="text-xs mt-1">Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Enter</kbd> to add it anyway</p>
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
