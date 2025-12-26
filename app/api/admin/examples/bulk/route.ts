import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { action, ids } = await request.json();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true, isSuperAdmin: true },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No examples selected' }, { status: 400 });
    }

    let result;
    let message;

    switch (action) {
      case 'activate':
        result = await prisma.resumeExample.updateMany({
          where: { id: { in: ids } },
          data: { isActive: true },
        });
        message = `${result.count} example(s) activated`;
        break;

      case 'deactivate':
        result = await prisma.resumeExample.updateMany({
          where: { id: { in: ids } },
          data: { isActive: false },
        });
        message = `${result.count} example(s) deactivated`;
        break;

      case 'delete':
        if (!user.isSuperAdmin) {
          return NextResponse.json(
            { error: 'Only Super Admins can permanently delete examples' },
            { status: 403 }
          );
        }
        result = await prisma.resumeExample.deleteMany({
          where: { id: { in: ids } },
        });
        message = `${result.count} example(s) deleted permanently`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message,
      count: result.count,
    });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }
}
