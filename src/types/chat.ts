export type ChatSender = 'customer' | 'ai' | 'admin';

export type ChatMessage = {
  id: string;
  sessionId: string;
  sender: ChatSender;
  content: string;
  createdAt: string;
};

export type ChatSession = {
  id: string;
  customerName?: string;
  humanOverride: boolean;
  needsAttention: boolean;
  createdAt: string;
  updatedAt: string;
};
