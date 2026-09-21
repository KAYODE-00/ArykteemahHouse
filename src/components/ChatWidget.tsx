'use client';

import { useEffect, useRef, useState } from 'react';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';

type LocalMessage = {
  id: string;
  sender: 'customer' | 'ai' | 'admin';
  content: string;
};

function getOrCreateSessionId(): string {
  const key = 'arh_chat_session_id';
  let id = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    if (typeof window !== 'undefined') localStorage.setItem(key, id);
  }
  return id;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [waitingForHuman, setWaitingForHuman] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  const fetchMessages = async (id: string) => {
    try {
      const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(
          data.messages.map((m: any) => ({ id: m.id, sender: m.sender, content: m.content }))
        );
      }
    } catch {
      // ignore transient errors
    }
  };

  useEffect(() => {
    if (!open || !sessionId) return;
    fetchMessages(sessionId);
    pollRef.current = setInterval(() => fetchMessages(sessionId), 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !sessionId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    setMessages((prev) => [...prev, { id: `local_${Date.now()}`, sender: 'customer', content: text }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [...prev, { id: `local_ai_${Date.now()}`, sender: 'ai', content: data.reply }]);
      }
      setWaitingForHuman(Boolean(data.waitingForHuman || data.needsHuman));
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `local_err_${Date.now()}`, sender: 'ai', content: "Sorry, that didn't send — please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="flex h-[480px] w-80 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl sm:w-96">
          <div className="flex items-center justify-between bg-[#1B1B18] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Chat with us</p>
              {waitingForHuman && (
                <p className="text-xs text-gray-300">A team member will reply shortly</p>
              )}
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1 hover:opacity-75">
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-gray-500">
                Have a question about sizing, colors, or an order? Ask away.
              </p>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    m.sender === 'customer'
                      ? 'bg-[#1B1B18] text-white'
                      : m.sender === 'admin'
                        ? 'bg-[#2F4538]/10 text-[#1B1B18]'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-gray-200 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder="Type a message..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1B1B18] text-white disabled:opacity-40"
              aria-label="Send message"
            >
              <FiSend className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1B1B18] text-white shadow-xl transition-transform hover:scale-105"
          aria-label="Open chat"
        >
          <FiMessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
