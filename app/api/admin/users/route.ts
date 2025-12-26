import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requester = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isAdmin: true, isSuperAdmin: true },
    });

    if (!requester?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        isSuperAdmin: true,
        adminCreatedAt: true,
        adminCreatedBy: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
      orderBy: [
        { isSuperAdmin: 'desc' },
        { adminCreatedAt: 'desc' },
      ],
    });

    const adminsWithCreators = await Promise.all(
      admins.map(async (admin) => {
        let createdByName: string | null = null;

        if (admin.adminCreatedBy) {
          const creator = await prisma.user.findUnique({
            where: { id: admin.adminCreatedBy },
            select: { name: true, email: true },
          });
          createdByName = creator?.name || creator?.email || 'Unknown';
        }

        return {
          ...admin,
          createdByName,
        };
      })
    );

    return NextResponse.json({
      admins: adminsWithCreators,
      total: admins.length,
      requesterIsSuperAdmin: requester.isSuperAdmin || false,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}
