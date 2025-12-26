import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export interface AdminContext {
  user: {
    id: string;
    email: string;
    name: string | null;
    isAdmin: boolean;
  };
}

// Middleware wrapper for admin API routes
export function withAdminAuth(
  handler: (request: NextRequest, context: AdminContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'Unauthorized - Please log in' },
          { status: 401 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
        },
      });

      if (!user || !user.isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' },
          { status: 403 }
        );
      }

      // Call the actual handler with admin context
      return handler(request, { user: { ...user, email: user.email! } });
    } catch (error) {
      console.error('Admin auth error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Simple check function for API routes that don't need the wrapper
export async function checkAdminAuth(): Promise<{
  isAdmin: boolean;
  user: { id: string; email: string; name: string | null } | null;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { isAdmin: false, user: null, error: 'Not authenticated' };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return { isAdmin: false, user: null, error: 'User not found' };
    }

    if (!user.isAdmin) {
      return { isAdmin: false, user: null, error: 'Not an admin' };
    }

    return { isAdmin: true, user: { id: user.id, email: user.email!, name: user.name } };
  } catch (error) {
    console.error('Admin check error:', error);
    return { isAdmin: false, user: null, error: 'Server error' };
  }
}
