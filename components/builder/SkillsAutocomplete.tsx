// components/builder/SkillsAutocomplete.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { X, Plus } from 'lucide-react';

interface SkillsAutocompleteProps {
  selectedSkills: string[];
  onAddSkill: (skill: string) => void;
  onRemoveSkill: (skill: string) => void;
  categorySlug?: string;
  maxSkills?: number;
  className?: string;
}

interface SkillSuggestion {
  id: string;
  name: string;
  category: string;
}

export function SkillsAutocomplete({
  selectedSkills,
  onAddSkill,
  onRemoveSkill,
  categorySlug,
  maxSkills = 15,
  className = '',
}: SkillsAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedValue = useDebounce(inputValue, 300);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        let url = '/api/skills?';
        if (debouncedValue) {
          url += `q=${encodeURIComponent(debouncedValue)}&`;
        }
        if (categorySlug) {
          url += `category=${categorySlug}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          // Filter out already selected skills
          const filtered = data.data.skills.filter(
            (s: SkillSuggestion) =>
              !selectedSkills.some(
                (selected) => selected.toLowerCase() === s.name.toLowerCase()
              )
          );
          setSuggestions(filtered.slice(0, 10));
        }
      } catch (error) {
        console.error('Skills fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue, categorySlug, selectedSkills]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddSkill = (skill: string) => {
    if (selectedSkills.length >= maxSkills) {
      alert(`Maximum ${maxSkills} skills allowed`);
      return;
    }

    const trimmedSkill = skill.trim();
    if (
      trimmedSkill &&
      !selectedSkills.some((s) => s.toLowerCase() === trimmedSkill.toLowerCase())
    ) {
      onAddSkill(trimmedSkill);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddSkill(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedSkills.length > 0) {
      onRemoveSkill(selectedSkills[selectedSkills.length - 1]);
    }
  };

  const categoryColors: Record<string, string> = {
    Technical: 'bg-blue-100 text-blue-800',
    'Soft Skills': 'bg-green-100 text-green-800',
    Tools: 'bg-purple-100 text-purple-800',
    Healthcare: 'bg-red-100 text-red-800',
    Finance: 'bg-amber-100 text-amber-800',
    Marketing: 'bg-pink-100 text-pink-800',
    Design: 'bg-indigo-100 text-indigo-800',
    Engineering: 'bg-orange-100 text-orange-800',
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected Skills */}
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white min-h-[52px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {selectedSkills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            {skill}
            <button
              onClick={() => onRemoveSkill(skill)}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedSkills.length === 0
              ? 'Type to add skills...'
              : selectedSkills.length >= maxSkills
                ? 'Max skills reached'
                : 'Add more skills...'
          }
          disabled={selectedSkills.length >= maxSkills}
          className="flex-1 min-w-[150px] outline-none text-sm disabled:bg-gray-50"
        />
      </div>

      {/* Counter */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>Press Enter to add custom skill</span>
        <span>
          {selectedSkills.length}/{maxSkills} skills
        </span>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b bg-gray-50">
            <p className="text-xs text-gray-500">Suggested skills</p>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleAddSkill(suggestion.name)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm text-gray-900">{suggestion.name}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      categoryColors[suggestion.category] ||
                      'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {suggestion.category}
                  </span>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
