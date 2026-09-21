import { Product } from '@/types/product';
import { ChatMessage } from '@/types/chat';
import { formatMoney } from '@/lib/currency';

// Keep this aligned with a model enabled for the store's Groq account.
const GROQ_MODEL = 'openai/gpt-oss-20b';

// Anything that suggests the customer wants to talk price, payment, or a
// deal that isn't already on the price tag — the AI should not be the one
// negotiating this, so we hand it to the store owner.
const MONEY_KEYWORDS =
  /\b(discount|negotiat|refund|money back|bank|account number|transfer|wire|price match|lower the price|reduce the price|can you do|best price|deposit|installment|pay later|cash on delivery|receipt|chargeback|dispute)\b/i;

export function looksLikeMoneyTalk(message: string): boolean {
  return MONEY_KEYWORDS.test(message);
}

function buildCatalogSummary(products: Product[]): string {
  return products
    .slice(0, 40)
    .map((p) => {
      const opts: string[] = [];
      if (p.colors?.length) opts.push(`colors: ${p.colors.join(', ')}`);
      if (p.sizes?.length) opts.push(`sizes: ${p.sizes.join(', ')}`);
      if (p.stock !== undefined) opts.push(`stock: ${p.stock}`);
      return `- ${p.name} (${p.category}) — ${formatMoney(p.price, p.currency)}${
        opts.length ? ` [${opts.join('; ')}]` : ''
      }: ${p.description}`;
    })
    .join('\n');
}

export type AIReply = {
  reply: string;
  needsHuman: boolean;
};

export async function getAIReply(
  history: ChatMessage[],
  products: Product[]
): Promise<AIReply> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return {
      reply:
        "Thanks for your message! Our team will jump in shortly to help you out.",
      needsHuman: true,
    };
  }

  const system = `You are a friendly, concise shopping assistant for an online store. Answer questions about products, sizing, colors, availability, and general store info using ONLY the catalog context below. Keep replies short (2-4 sentences), warm, and helpful.

Catalog:
${buildCatalogSummary(products)}

You must respond with ONLY a JSON object of the shape {"reply": string, "needs_human": boolean}. Set needs_human to true whenever: the customer asks for a discount/price negotiation, refund, custom deal, order status/payment help, complains about an order, asks something the catalog above doesn't answer, or seems frustrated. Otherwise set it to false. Never invent products, prices, or policies that aren't in the catalog.`;

  const messages = [
    { role: 'system', content: system },
    ...history.slice(-10).map((m) => ({
      role: m.sender === 'customer' ? 'user' : 'assistant',
      content: m.content,
    })),
  ];

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      throw new Error(`Groq API error: ${res.status}`);
    }

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? '{}';
    let parsed: { reply?: string; needs_human?: boolean } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { reply: raw.trim() || "Let me get someone from our team to help with that.", needsHuman: true };
    }

    return {
      reply: parsed.reply?.trim() || "Let me get someone from our team to help with that.",
      needsHuman: Boolean(parsed.needs_human),
    };
  } catch {
    return {
      reply: "I'm having a little trouble right now — I've let our team know so they can help you directly.",
      needsHuman: true,
    };
  }
}
