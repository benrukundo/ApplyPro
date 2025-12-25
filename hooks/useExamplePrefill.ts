// hooks/useExamplePrefill.ts
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ExampleData {
  title: string;
  summary: string;
  bulletPoints: string[];
  skills: string[];
  category: {
    name: string;
    slug: string;
  };
}

interface PrefillData {
  jobTitle: string;
  summary: string;
  experiences: {
    title: string;
    bullets: string[];
  }[];
  skills: string[];
  source: 'example' | 'none';
  exampleTitle?: string;
}

export function useExamplePrefill() {
  const searchParams = useSearchParams();
  const [prefillData, setPrefillData] = useState<PrefillData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const template = searchParams.get('template');
    const category = searchParams.get('category');

    if (template) {
      fetchExampleData(template, category);
    }
  }, [searchParams]);

  const fetchExampleData = async (slug: string, categorySlug?: string | null) => {
    setIsLoading(true);
    setError(null);

    try {
      // Try to find the example
      const response = await fetch(
        `/api/builder/prefill?slug=${slug}${categorySlug ? `&category=${categorySlug}` : ''}`
      );

      if (!response.ok) {
        throw new Error('Example not found');
      }

      const data = await response.json();

      if (data.success && data.data) {
        const example: ExampleData = data.data;

        setPrefillData({
          jobTitle: example.title,
          summary: example.summary,
          experiences: [
            {
              title: example.title,
              bullets: example.bulletPoints,
            },
          ],
          skills: example.skills,
          source: 'example',
          exampleTitle: example.title,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load example');
      setPrefillData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const clearPrefill = () => {
    setPrefillData(null);
  };

  return {
    prefillData,
    isLoading,
    error,
    clearPrefill,
    hasPrefill: !!prefillData,
  };
}
