import { NextRequest, NextResponse } from 'next/server';
import { listChatMessages, addChatMessage, setSessionOverride, clearSessionAttention } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = await listChatMessages(id);
    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { content } = await request.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }
    // An admin reply means this thread is being handled by a human now.
    await setSessionOverride(id, true);
    const message = await addChatMessage({ sessionId: id, sender: 'admin', content: content.trim() });
    await clearSessionAttention(id);
    return NextResponse.json({ message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
