// app/sitemap.ts
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

// Generate sitemap at request time to avoid build-time DB requirements
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://applypro.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/builder`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resume-examples`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ats-checker`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  let examplePages: MetadataRoute.Sitemap = [];

  try {
    const categories = await prisma.jobCategory.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    categoryPages = categories.map((category) => ({
      url: `${baseUrl}/resume-examples/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.warn('Sitemap categories fetch failed, returning static pages only:', error);
  }

  try {
    const examples = await prisma.resumeExample.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        category: {
          select: { slug: true },
        },
      },
    });

    examplePages = examples.map((example) => ({
      url: `${baseUrl}/resume-examples/${example.category.slug}/${example.slug}`,
      lastModified: example.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.warn('Sitemap examples fetch failed, returning static pages only:', error);
  }

  return [...staticPages, ...categoryPages, ...examplePages];
}
