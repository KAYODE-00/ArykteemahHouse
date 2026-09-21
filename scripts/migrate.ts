// Creates all tables needed by the store. Safe to run multiple times.
// Usage: npm run db:migrate   (requires DATABASE_URL in the environment)
import { neon } from '@neondatabase/serverless';
import { loadEnvConfig } from '@next/env';

// `tsx` does not load Next.js .env.local files by itself.
loadEnvConfig(process.cwd());

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Add it to .env.local (or your shell) first.');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price NUMERIC NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      image TEXT NOT NULL,
      images TEXT[] DEFAULT '{}',
      category TEXT NOT NULL DEFAULT 'uncategorized',
      slug TEXT NOT NULL UNIQUE,
      colors TEXT[] DEFAULT '{}',
      sizes TEXT[] DEFAULT '{}',
      stock INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      items JSONB NOT NULL,
      customer_name TEXT,
      customer_contact TEXT,
      note TEXT,
      receipt_data_url TEXT,
      description TEXT NOT NULL,
      total NUMERIC NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'pending_review',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      related_id TEXT,
      read BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      customer_name TEXT,
      human_override BOOLEAN NOT NULL DEFAULT false,
      needs_attention BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
      sender TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`;

  console.log('Migration complete: products, orders, notifications, settings, chat_sessions, chat_messages');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
