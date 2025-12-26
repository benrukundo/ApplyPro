import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminApi';

export async function GET() {
  const { isAdmin, user, error } = await checkAdminAuth();

  if (!isAdmin) {
    return NextResponse.json(
      { authenticated: false, isAdmin: false, error },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    isAdmin: true,
    user: {
      id: user?.id,
      email: user?.email,
      name: user?.name,
    },
  });
}
