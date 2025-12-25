// components/builder/PrefillBanner.tsx
'use client';

import { X, Sparkles, CheckCircle } from 'lucide-react';

interface PrefillBannerProps {
  exampleTitle: string;
  onApply: () => void;
  onDismiss: () => void;
  isApplied: boolean;
}

export function PrefillBanner({
  exampleTitle,
  onApply,
  onDismiss,
  isApplied,
}: PrefillBannerProps) {
  if (isApplied) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div className="flex-1">
            <p className="text-green-800 font-medium">
              Template applied successfully!
            </p>
            <p className="text-green-600 text-sm">
              We've pre-filled your resume with the {exampleTitle} template.
              Feel free to customize it.
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="text-green-600 hover:text-green-800 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Sparkles className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-gray-900 font-medium">
            Use "{exampleTitle}" Template?
          </p>
          <p className="text-gray-600 text-sm">
            Pre-fill your resume with professional content from this example.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            No thanks
          </button>
          <button
            onClick={onApply}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Apply Template
          </button>
        </div>
      </div>
    </div>
  );
}
