import { prisma } from '@/lib/prisma';

// Event types for resume examples
export type AnalyticsEvent = 
  | 'example_view'
  | 'example_preview'
  | 'example_use_template'
  | 'category_view'
  | 'search_query'
  | 'search_result_click'
  | 'skill_suggestion_used'
  | 'builder_started_from_example';

export interface AnalyticsEventData {
  event: AnalyticsEvent;
  exampleId?: string;
  exampleSlug?: string;
  exampleTitle?: string;
  categoryId?: string;
  categorySlug?: string;
  categoryName?: string;
  searchQuery?: string;
  searchResultCount?: number;
  userId?: string;
  sessionId?: string;
  referrer?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

// Track event in database
export async function trackEvent(data: AnalyticsEventData): Promise<void> {
  try {
    await (prisma as any).analyticsEvent.create({
      data: {
        event: data.event,
        exampleId: data.exampleId,
        exampleSlug: data.exampleSlug,
        exampleTitle: data.exampleTitle,
        categoryId: data.categoryId,
        categorySlug: data.categorySlug,
        categoryName: data.categoryName,
        searchQuery: data.searchQuery,
        searchResultCount: data.searchResultCount,
        userId: data.userId,
        sessionId: data.sessionId,
        referrer: data.referrer,
        userAgent: data.userAgent,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    // Log error but don't throw - analytics should not break the app
    // eslint-disable-next-line no-console
    console.error('Analytics tracking error:', error);
  }
}

// Get analytics summary
export async function getAnalyticsSummary(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [
    totalViews,
    totalPreviews,
    totalTemplateUses,
    topExamples,
    topCategories,
    topSearches,
    dailyViews,
  ] = await Promise.all([
    // Total example views
    (prisma as any).analyticsEvent.count({
      where: {
        event: 'example_view',
        createdAt: { gte: startDate },
      },
    }),

    // Total previews
    (prisma as any).analyticsEvent.count({
      where: {
        event: 'example_preview',
        createdAt: { gte: startDate },
      },
    }),

    // Total template uses
    (prisma as any).analyticsEvent.count({
      where: {
        event: 'example_use_template',
        createdAt: { gte: startDate },
      },
    }),

    // Top examples by views
    (prisma as any).analyticsEvent.groupBy({
      by: ['exampleSlug', 'exampleTitle'],
      where: {
        event: 'example_view',
        exampleSlug: { not: null },
        createdAt: { gte: startDate },
      },
      _count: true,
      orderBy: { _count: { exampleSlug: 'desc' } },
      take: 10,
    }),

    // Top categories
    (prisma as any).analyticsEvent.groupBy({
      by: ['categorySlug', 'categoryName'],
      where: {
        event: { in: ['example_view', 'category_view'] },
        categorySlug: { not: null },
        createdAt: { gte: startDate },
      },
      _count: true,
      orderBy: { _count: { categorySlug: 'desc' } },
      take: 10,
    }),

    // Top search queries
    (prisma as any).analyticsEvent.groupBy({
      by: ['searchQuery'],
      where: {
        event: 'search_query',
        searchQuery: { not: null },
        createdAt: { gte: startDate },
      },
      _count: true,
      orderBy: { _count: { searchQuery: 'desc' } },
      take: 10,
    }),

    // Daily views for chart
    (prisma as any).$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as views
      FROM analytics_events
      WHERE event = 'example_view'
        AND "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    ` as Promise<Array<{ date: Date; views: bigint }>>,
  ]);

  return {
    summary: {
      totalViews,
      totalPreviews,
      totalTemplateUses,
      conversionRate: totalViews > 0 
        ? ((totalTemplateUses / totalViews) * 100).toFixed(2) 
        : '0',
    },
    topExamples: (topExamples as any[]).map((e: any) => ({
      slug: e.exampleSlug,
      title: e.exampleTitle,
      views: e._count,
    })),
    topCategories: (topCategories as any[]).map((c: any) => ({
      slug: c.categorySlug,
      name: c.categoryName,
      views: c._count,
    })),
    topSearches: (topSearches as any[]).map((s: any) => ({
      query: s.searchQuery,
      count: s._count,
    })),
    dailyViews: (dailyViews as any[]).map((d: any) => ({
      date: d.date,
      views: Number(d.views),
    })),
  };
}
