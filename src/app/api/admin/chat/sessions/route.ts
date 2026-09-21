import { NextResponse } from 'next/server';
import { listChatSessions } from '@/lib/db';

export async function GET() {
  try {
    const sessions = await listChatSessions();
    return NextResponse.json({ sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
