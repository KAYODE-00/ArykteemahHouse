'use client';

import { useEffect, useState } from 'react';
import { ChatMessage, ChatSession } from '@/types/chat';

export default function ChatPanel() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const loadSessions = async () => {
    const res = await fetch('/api/admin/chat/sessions');
    const data = await res.json();
    setSessions(data.sessions ?? []);
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const load = async () => {
      const res = await fetch(`/api/admin/chat/sessions/${selected}/messages`);
      const data = await res.json();
      setMessages(data.messages ?? []);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [selected]);

  const sendReply = async () => {
    if (!selected || !reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/chat/sessions/${selected}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: reply.trim() }),
      });
      const data = await res.json();
      if (data.message) setMessages((prev) => [...prev, data.message]);
      setReply('');
      loadSessions();
    } finally {
      setSending(false);
    }
  };

  const handOverToAI = async () => {
    if (!selected) return;
    await fetch(`/api/admin/chat/sessions/${selected}/release`, { method: 'POST' });
    loadSessions();
  };

  const selectedSession = sessions.find((s) => s.id === selected);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1 space-y-2">
        {sessions.length === 0 && <p className="text-sm text-gray-500">No conversations yet.</p>}
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={`w-full rounded-lg border p-3 text-left ${
              selected === s.id ? 'border-gray-900' : 'border-gray-200'
            } ${s.needsAttention ? 'bg-amber-50' : 'bg-white'}`}
          >
            <p className="truncate text-sm font-medium text-gray-900">
              {s.customerName || `Visitor ${s.id.slice(-6)}`}
            </p>
            <p className="text-xs text-gray-500">
              {s.needsAttention ? 'Needs your reply' : s.humanOverride ? 'You are handling this' : 'AI is handling this'}
            </p>
            <p className="text-xs text-gray-400">{new Date(s.updatedAt).toLocaleString()}</p>
          </button>
        ))}
      </div>

      <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white flex flex-col h-[560px]">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-gray-200 p-3">
              <p className="text-sm font-medium text-gray-900">
                {selectedSession?.customerName || `Visitor ${selected.slice(-6)}`}
              </p>
              {selectedSession?.humanOverride && (
                <button
                  onClick={handOverToAI}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Hand back to AI
                </button>
              )}
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                      m.sender === 'admin'
                        ? 'bg-gray-900 text-white'
                        : m.sender === 'ai'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-[#2F4538]/10 text-gray-900'
                    }`}
                  >
                    <p className="mb-0.5 text-[10px] uppercase tracking-wide opacity-60">
                      {m.sender}
                    </p>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-gray-200 p-3">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                placeholder="Reply as the store..."
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                onClick={sendReply}
                disabled={sending || !reply.trim()}
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
