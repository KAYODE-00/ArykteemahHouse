import { NextRequest, NextResponse } from 'next/server';
import {
  ensureChatSession,
  addChatMessage,
  listChatMessages,
  getSettings,
  flagSessionAttention,
  setSessionOverride,
  createNotification,
  getAllProducts,
} from '@/lib/db';
import { getAIReply, looksLikeMoneyTalk } from '@/lib/groq';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
  }
  try {
    await ensureChatSession(sessionId);
    const messages = await listChatMessages(sessionId);
    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId: string = body.sessionId;
    const message: string = body.message;

    if (!sessionId || !message?.trim()) {
      return NextResponse.json({ error: 'sessionId and message are required' }, { status: 400 });
    }

    const session = await ensureChatSession(sessionId);
    await addChatMessage({ sessionId, sender: 'customer', content: message.trim() });

    const settings = await getSettings();
    const humanMode = settings.aiMode === 'human' || session.humanOverride;

    if (humanMode) {
      await flagSessionAttention(sessionId);
      await createNotification({
        type: 'chat_message',
        title: 'New customer message (awaiting reply)',
        body: message.trim(),
        relatedId: sessionId,
      });
      return NextResponse.json({ waitingForHuman: true });
    }

    // AI is in charge for this session.
    const [history, products] = await Promise.all([
      listChatMessages(sessionId),
      getAllProducts().catch(() => []),
    ]);

    const moneyTalk = looksLikeMoneyTalk(message);
    const ai = await getAIReply(history, products);
    const needsHuman = moneyTalk || ai.needsHuman;

    await addChatMessage({ sessionId, sender: 'ai', content: ai.reply });

    if (needsHuman) {
      await setSessionOverride(sessionId, true);
      await createNotification({
        type: 'chat_escalation',
        title: 'Customer chat needs your attention',
        body: message.trim(),
        relatedId: sessionId,
      });
    }

    return NextResponse.json({ reply: ai.reply, needsHuman });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: error.message || 'Chat failed' }, { status: 500 });
  }
}
