import { NextRequest, NextResponse } from 'next/server';
import { trackEvent, AnalyticsEvent } from '@/lib/analytics';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getServerSession(authOptions);

    const {
      event,
      exampleId,
      exampleSlug,
      exampleTitle,
      categoryId,
      categorySlug,
      categoryName,
      searchQuery,
      searchResultCount,
      metadata,
    } = body;

    // Validate event type
    const validEvents: AnalyticsEvent[] = [
      'example_view',
      'example_preview',
      'example_use_template',
      'category_view',
      'search_query',
      'search_result_click',
      'skill_suggestion_used',
      'builder_started_from_example',
    ];

    if (!event || !validEvents.includes(event)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Get request metadata
    const referrer = request.headers.get('referer') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Generate or get session ID from cookie
    const sessionId = request.cookies.get('analytics_session')?.value || 
      crypto.randomUUID();

    await trackEvent({
      event,
      exampleId,
      exampleSlug,
      exampleTitle,
      categoryId,
      categorySlug,
      categoryName,
      searchQuery,
      searchResultCount,
      userId: session?.user?.id,
      sessionId,
      referrer,
      userAgent,
      metadata,
    });

    const response = NextResponse.json({ success: true });

    // Set session cookie if not exists
    if (!request.cookies.get('analytics_session')) {
      response.cookies.set('analytics_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Analytics track error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
