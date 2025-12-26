'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/lib/useAnalytics';

interface AnalyticsTrackerProps {
  event: 'example_view' | 'category_view';
  exampleId?: string;
  exampleSlug?: string;
  exampleTitle?: string;
  categoryId?: string;
  categorySlug?: string;
  categoryName?: string;
}

export default function AnalyticsTracker({
  event,
  exampleId,
  exampleSlug,
  exampleTitle,
  categoryId,
  categorySlug,
  categoryName,
}: AnalyticsTrackerProps) {
  const { track } = useAnalytics();

  useEffect(() => {
    // Track page view on mount
    track({
      event,
      exampleId,
      exampleSlug,
      exampleTitle,
      categoryId,
      categorySlug,
      categoryName,
    });
  }, [event, exampleId, exampleSlug, exampleTitle, categoryId, categorySlug, categoryName, track]);

  // This component doesn't render anything
  return null;
}
