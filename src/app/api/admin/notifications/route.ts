import { NextResponse } from 'next/server';
import { listNotifications } from '@/lib/db';

export async function GET() {
  try {
    const notifications = await listNotifications();
    return NextResponse.json({ notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
