import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  ADMIN_COOKIE_MAX_AGE,
  checkAdminPassword,
  createAdminSessionCookieValue,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password || !checkAdminPassword(password)) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }
    const cookieValue = await createAdminSessionCookieValue();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 });
  }
}
