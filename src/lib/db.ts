import { neon } from '@neondatabase/serverless';
import { Product } from '@/types/product';
import { Order, OrderItemSnapshot } from '@/types/order';
import { Notification, NotificationType } from '@/types/notification';
import { ChatMessage, ChatSession, ChatSender } from '@/types/chat';

// The Neon client is created lazily so the app doesn't crash at import time
// when DATABASE_URL hasn't been configured yet (e.g. first run, before
// `npm run db:migrate` / `npm run db:seed`).
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL is not set. Add it to your environment and run `npm run db:migrate`.'
    );
  }
  return neon(process.env.DATABASE_URL);
}

function rowToProduct(row: any): Product {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description,
    price: Number(row.price),
    currency: row.currency,
    image: row.image,
    images: row.images ?? undefined,
    category: row.category,
    slug: row.slug,
    colors: row.colors ?? undefined,
    sizes: row.sizes ?? undefined,
    stock: row.stock ?? undefined,
  };
}

// ---------- Products ----------

export async function getAllProducts(): Promise<Product[]> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
  return rows.map(rowToProduct);
}

export async function getProductBySlugDb(slug: string): Promise<Product | undefined> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM products WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ? rowToProduct(rows[0]) : undefined;
}

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  images?: string[];
  category: string;
  slug: string;
  colors?: string[];
  sizes?: string[];
  stock?: number;
};

export async function createProduct(input: ProductInput): Promise<Product> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO products
      (name, description, price, currency, image, images, category, slug, colors, sizes, stock)
    VALUES (
      ${input.name}, ${input.description}, ${input.price}, ${input.currency},
      ${input.image}, ${input.images ?? []}, ${input.category}, ${input.slug},
      ${input.colors ?? []}, ${input.sizes ?? []}, ${input.stock ?? null}
    )
    RETURNING *`;
  return rowToProduct(rows[0]);
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>
): Promise<Product | undefined> {
  const sql = getSql();
  const existingRows = await sql`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  if (!existingRows[0]) return undefined;
  const current = rowToProduct(existingRows[0]);
  const merged: ProductInput = {
    name: input.name ?? current.name,
    description: input.description ?? current.description,
    price: input.price ?? current.price,
    currency: input.currency ?? current.currency,
    image: input.image ?? current.image,
    images: input.images ?? current.images,
    category: input.category ?? current.category,
    slug: input.slug ?? current.slug,
    colors: input.colors ?? current.colors,
    sizes: input.sizes ?? current.sizes,
    stock: input.stock ?? current.stock,
  };
  const rows = await sql`
    UPDATE products SET
      name = ${merged.name},
      description = ${merged.description},
      price = ${merged.price},
      currency = ${merged.currency},
      image = ${merged.image},
      images = ${merged.images ?? []},
      category = ${merged.category},
      slug = ${merged.slug},
      colors = ${merged.colors ?? []},
      sizes = ${merged.sizes ?? []},
      stock = ${merged.stock ?? null}
    WHERE id = ${id}
    RETURNING *`;
  return rowToProduct(rows[0]);
}

export async function deleteProduct(id: string): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM products WHERE id = ${id}`;
}

// ---------- Notifications ----------

function rowToNotification(row: any): Notification {
  return {
    id: String(row.id),
    type: row.type,
    title: row.title,
    body: row.body,
    read: row.read,
    createdAt: row.created_at,
    relatedId: row.related_id ?? undefined,
  };
}

export async function createNotification(params: {
  type: NotificationType;
  title: string;
  body: string;
  relatedId?: string;
}): Promise<Notification> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO notifications (type, title, body, related_id)
    VALUES (${params.type}, ${params.title}, ${params.body}, ${params.relatedId ?? null})
    RETURNING *`;
  return rowToNotification(rows[0]);
}

export async function listNotifications(limit = 100): Promise<Notification[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM notifications ORDER BY created_at DESC LIMIT ${limit}`;
  return rows.map(rowToNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  const sql = getSql();
  await sql`UPDATE notifications SET read = true WHERE id = ${id}`;
}

export async function unreadNotificationCount(): Promise<number> {
  const sql = getSql();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM notifications WHERE read = false`;
  return rows[0]?.count ?? 0;
}

// ---------- Orders ----------

function rowToOrder(row: any): Order {
  return {
    id: String(row.id),
    items: row.items,
    customerName: row.customer_name ?? undefined,
    customerContact: row.customer_contact ?? undefined,
    note: row.note ?? undefined,
    receiptDataUrl: row.receipt_data_url ?? undefined,
    description: row.description,
    total: Number(row.total),
    currency: row.currency,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function createOrder(params: {
  items: OrderItemSnapshot[];
  customerName?: string;
  customerContact?: string;
  note?: string;
  receiptDataUrl?: string;
  description: string;
  total: number;
  currency: string;
}): Promise<Order> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO orders
      (items, customer_name, customer_contact, note, receipt_data_url, description, total, currency, status)
    VALUES (
      ${JSON.stringify(params.items)}::jsonb, ${params.customerName ?? null},
      ${params.customerContact ?? null}, ${params.note ?? null},
      ${params.receiptDataUrl ?? null}, ${params.description}, ${params.total},
      ${params.currency}, 'pending_review'
    )
    RETURNING *`;
  return rowToOrder(rows[0]);
}

export async function listOrders(limit = 100): Promise<Order[]> {
  const sql = getSql();
  const rows = await sql`SELECT * FROM orders ORDER BY created_at DESC LIMIT ${limit}`;
  return rows.map(rowToOrder);
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const sql = getSql();
  await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
}

// ---------- Settings ----------

export type StoreSettings = {
  aiMode: 'ai' | 'human';
  currency: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentInstructions: string;
  siteContent: SiteContent;
};

export type FaqItem = { question: string; answer: string };

export type SiteContent = {
  about: { eyebrow: string; title: string; intro: string; story: string; values: string[] };
  terms: { title: string; updated: string; intro: string; sections: { heading: string; body: string }[] };
  shipping: { title: string; intro: string; sections: { heading: string; body: string }[] };
  faq: { title: string; intro: string; items: FaqItem[] };
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  about: {
    eyebrow: 'Our story', title: 'Made for the way you live.',
    intro: 'Arykteemah brings together considered everyday pieces and a warm, personal shopping experience.',
    story: 'We believe the things you choose should feel useful, lasting, and distinctly yours. Our collection is selected with care so finding something you love feels simple.',
    values: ['Thoughtful selection', 'Quality you can feel', 'Service that feels personal'],
  },
  terms: {
    title: 'Terms & Conditions', updated: 'Last updated: January 2026',
    intro: 'These terms explain how purchases from Arykteemah work.',
    sections: [
      { heading: 'Orders & payment', body: 'Orders are confirmed after we receive and verify payment. Please provide accurate contact and delivery details at checkout.' },
      { heading: 'Product information', body: 'We aim to keep product descriptions and images accurate. Colours may vary slightly depending on your screen.' },
      { heading: 'Availability', body: 'Products are subject to availability. If an item cannot be fulfilled, we will contact you with the available options.' },
    ],
  },
  shipping: {
    title: 'Shipping & Returns', intro: 'Clear delivery updates and a straightforward return process.',
    sections: [
      { heading: 'Delivery', body: 'Delivery times and fees are confirmed when your order is placed. We will contact you when your order is on its way.' },
      { heading: 'Returns', body: 'If there is a problem with your order, contact us as soon as possible with your order details and photos where relevant.' },
      { heading: 'Damaged or incorrect items', body: 'Please notify us within 48 hours of delivery so we can review the issue and make it right.' },
    ],
  },
  faq: {
    title: 'Frequently asked questions', intro: 'A few helpful answers before you place your order.',
    items: [
      { question: 'How do I place an order?', answer: 'Add your chosen items to cart, complete checkout, and follow the payment instructions shown.' },
      { question: 'How will I know my order is confirmed?', answer: 'We will confirm your order once payment has been verified.' },
      { question: 'Can I return an item?', answer: 'Please see our Shipping & Returns policy or contact us with your order details.' },
      { question: 'Can I get help before ordering?', answer: 'Absolutely. Use the chat button and our team will be happy to help.' },
    ],
  },
};

export const DEFAULT_SETTINGS: StoreSettings = {
  aiMode: 'ai',
  currency: 'NGN',
  bankName: 'Your Bank Name',
  accountName: 'Your Store Name Ltd',
  accountNumber: '0000000000',
  paymentInstructions:
    'Transfer the exact total shown, then submit your receipt below so we can confirm your order.',
  siteContent: DEFAULT_SITE_CONTENT,
};

export async function getSettings(): Promise<StoreSettings> {
  const sql = getSql();
  const rows = await sql`SELECT value FROM settings WHERE key = 'store' LIMIT 1`;
  if (!rows[0]) return DEFAULT_SETTINGS;
  const saved = rows[0].value as Partial<StoreSettings>;
  return { ...DEFAULT_SETTINGS, ...saved, siteContent: { ...DEFAULT_SITE_CONTENT, ...saved.siteContent } };
}

export async function updateSettings(
  partial: Partial<StoreSettings>
): Promise<StoreSettings> {
  const sql = getSql();
  const current = await getSettings();
  const merged = { ...current, ...partial };
  await sql`
    INSERT INTO settings (key, value)
    VALUES ('store', ${JSON.stringify(merged)}::jsonb)
    ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(merged)}::jsonb`;
  return merged;
}

// ---------- Chat ----------

function rowToSession(row: any): ChatSession {
  return {
    id: String(row.id),
    customerName: row.customer_name ?? undefined,
    humanOverride: row.human_override,
    needsAttention: row.needs_attention,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToMessage(row: any): ChatMessage {
  return {
    id: String(row.id),
    sessionId: String(row.session_id),
    sender: row.sender,
    content: row.content,
    createdAt: row.created_at,
  };
}

export async function ensureChatSession(sessionId: string): Promise<ChatSession> {
  const sql = getSql();
  const existing = await sql`SELECT * FROM chat_sessions WHERE id = ${sessionId} LIMIT 1`;
  if (existing[0]) return rowToSession(existing[0]);
  const rows = await sql`
    INSERT INTO chat_sessions (id) VALUES (${sessionId})
    ON CONFLICT (id) DO NOTHING
    RETURNING *`;
  if (rows[0]) return rowToSession(rows[0]);
  const fetched = await sql`SELECT * FROM chat_sessions WHERE id = ${sessionId} LIMIT 1`;
  return rowToSession(fetched[0]);
}

export async function listChatSessions(): Promise<ChatSession[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM chat_sessions ORDER BY needs_attention DESC, updated_at DESC LIMIT 100`;
  return rows.map(rowToSession);
}

export async function setSessionOverride(sessionId: string, override: boolean): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE chat_sessions
    SET human_override = ${override}, needs_attention = ${override ? true : false}, updated_at = now()
    WHERE id = ${sessionId}`;
}

export async function clearSessionAttention(sessionId: string): Promise<void> {
  const sql = getSql();
  await sql`UPDATE chat_sessions SET needs_attention = false WHERE id = ${sessionId}`;
}

export async function flagSessionAttention(sessionId: string): Promise<void> {
  const sql = getSql();
  await sql`
    UPDATE chat_sessions SET needs_attention = true, updated_at = now() WHERE id = ${sessionId}`;
}

export async function touchSession(sessionId: string): Promise<void> {
  const sql = getSql();
  await sql`UPDATE chat_sessions SET updated_at = now() WHERE id = ${sessionId}`;
}

export async function addChatMessage(params: {
  sessionId: string;
  sender: ChatSender;
  content: string;
}): Promise<ChatMessage> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO chat_messages (session_id, sender, content)
    VALUES (${params.sessionId}, ${params.sender}, ${params.content})
    RETURNING *`;
  await touchSession(params.sessionId);
  return rowToMessage(rows[0]);
}

export async function listChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM chat_messages WHERE session_id = ${sessionId} ORDER BY created_at ASC`;
  return rows.map(rowToMessage);
}
