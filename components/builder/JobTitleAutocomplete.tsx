// components/builder/JobTitleAutocomplete.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Briefcase } from 'lucide-react';

interface JobTitleAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (example: { title: string; slug: string; categorySlug: string }) => void;
  placeholder?: string;
  className?: string;
}

interface Suggestion {
  id: string;
  title: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  experienceLevel: string;
}

export function JobTitleAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Enter job title (e.g., Software Engineer)',
  className = '',
}: JobTitleAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedValue = useDebounce(value, 300);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/examples/autocomplete?q=${encodeURIComponent(debouncedValue)}`
        );
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.data);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue]);

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

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (suggestion: Suggestion) => {
    onChange(suggestion.title);
    setIsOpen(false);
    if (onSelect) {
      onSelect({
        title: suggestion.title,
        slug: suggestion.slug,
        categorySlug: suggestion.categorySlug,
      });
    }
  };

  const experienceLevelColors: Record<string, string> = {
    ENTRY: 'bg-green-100 text-green-700',
    MID: 'bg-blue-100 text-blue-700',
    SENIOR: 'bg-purple-100 text-purple-700',
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSelect(suggestion)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  selectedIndex === index ? 'bg-blue-50' : ''
                }`}
              >
                <div>
                  <p className="font-medium text-gray-900">{suggestion.title}</p>
                  <p className="text-sm text-gray-500">{suggestion.categoryName}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    experienceLevelColors[suggestion.experienceLevel] ||
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  {suggestion.experienceLevel === 'ENTRY'
                    ? 'Entry'
                    : suggestion.experienceLevel === 'MID'
                      ? 'Mid'
                      : 'Senior'}
                </span>
              </button>
            ))}
          </div>
          <div className="border-t p-2 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Select to pre-fill with example content
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
