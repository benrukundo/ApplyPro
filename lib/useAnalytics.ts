'use client';

import { useCallback } from 'react';
import { trackEvent as postHogTrack } from '@/components/PostHogProvider';

type AnalyticsEvent = 
  | 'example_view'
  | 'example_preview'
  | 'example_use_template'
  | 'category_view'
  | 'search_query'
  | 'search_result_click'
  | 'skill_suggestion_used'
  | 'builder_started_from_example';

interface TrackEventParams {
  event: AnalyticsEvent;
  exampleId?: string;
  exampleSlug?: string;
  exampleTitle?: string;
  categoryId?: string;
  categorySlug?: string;
  categoryName?: string;
  searchQuery?: string;
  searchResultCount?: number;
  metadata?: Record<string, any>;
}

export function useAnalytics() {
  const track = useCallback(async (params: TrackEventParams) => {
    try {
      // Track in PostHog (if available)
      if (typeof postHogTrack === 'function') {
        postHogTrack(params.event, {
          example_slug: params.exampleSlug,
          example_title: params.exampleTitle,
          category_slug: params.categorySlug,
          category_name: params.categoryName,
          search_query: params.searchQuery,
          ...params.metadata,
        });
      }

      // Track in our database
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
    } catch (error) {
      // Silently fail - analytics should not break the app
      // eslint-disable-next-line no-console
      console.error('Analytics error:', error);
    }
  }, []);

  return { track };
}
