import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate statistics
    const stats = {
      total: applications.length,
      saved: applications.filter(app => app.status === 'saved').length,
      applied: applications.filter(app => app.status === 'applied').length,
      interview: applications.filter(app => app.status === 'interview').length,
      offer: applications.filter(app => app.status === 'offer').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      responseRate: 0,
      averageResponseTime: 0,
      applicationsByMonth: [] as Array<{ month: string; count: number }>,
    };

    // Calculate response rate
    const totalResponded = stats.interview + stats.offer + stats.rejected;
    const totalApplied = stats.applied + totalResponded;
    if (totalApplied > 0) {
      stats.responseRate = Math.round((totalResponded / totalApplied) * 100);
    }

    // Calculate average response time (days from applied to any response)
    const respondedApps = applications.filter(app =>
      app.status !== 'saved' && app.status !== 'applied' && app.appliedAt
    );

    if (respondedApps.length > 0) {
      const totalResponseTime = respondedApps.reduce((sum, app) => {
        const responseTime = app.updatedAt.getTime() - (app.appliedAt.getTime() || app.createdAt.getTime());
        return sum + responseTime;
      }, 0);

      stats.averageResponseTime = Math.round(totalResponseTime / respondedApps.length / (1000 * 60 * 60 * 24));
    }

    // Group by month
    const monthGroups: { [key: string]: number } = {};
    applications.forEach(app => {
      const date = new Date(app.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthGroups[monthKey] = (monthGroups[monthKey] || 0) + 1;
    });

    stats.applicationsByMonth = Object.entries(monthGroups)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching job application stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
