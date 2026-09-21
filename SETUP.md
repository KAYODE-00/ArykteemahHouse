# ArykteemahHouse — setup

This build replaces Stripe with a bank-transfer + receipt flow, adds a Neon
Postgres–backed product catalog, an admin dashboard, and a Groq-powered
customer chat widget with human hand-off.

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in:

- `DATABASE_URL` — a Neon Postgres connection string (create a free project
  at https://neon.tech, then copy the pooled connection string).
- `ADMIN_PASSWORD` — the password for `/admin/login`.
- `ADMIN_SESSION_SECRET` — any long random string (`openssl rand -hex 32`).
- `GROQ_API_KEY` — from https://console.groq.com/keys. Without this, the
  chat widget still works but every message is routed straight to you
  instead of being answered by AI.

## 3. Create the database tables

```bash
npm run db:migrate
```

## 4. (Optional) Seed the starter catalog

Loads the original 8 demo products into the database so the store isn't
empty on first run. Skip this if you'd rather add your own products from
the admin dashboard.

```bash
npm run db:seed
```

## 5. Run it

```bash
npm run dev
```

- Storefront: http://localhost:3000
- Admin: http://localhost:3000/admin/login

## What changed from the original template

- **No Stripe.** `/checkout/pay` shows your bank account details (copyable),
  and lets the customer attach a receipt image + note. That gets saved as an
  order and shows up in the admin Notifications tab as a description of
  exactly what they picked (product, color, size, quantity, total).
- **Products live in Neon**, not the static `src/data/products.ts` file.
  That file is now only a fallback (used if the DB isn't configured yet) and
  the source for `npm run db:seed`. Add/edit/delete products from
  `/admin` → Products.
- **Customer chat widget** (bottom-right bubble on the storefront) talks to
  Groq using your product catalog as context. Any message about money
  (discounts, refunds, bank details, etc.) or anything the AI isn't
  confident about gets flagged to you in `/admin` → Notifications and
  `/admin` → Chat, and that conversation pauses for AI until you reply or
  hit "Hand back to AI".
- **Admin auth only** — customers never need to sign in. `/admin/*` and
  `/api/admin/*` are protected by a signed cookie (`middleware.ts`); every
  other route is open.
- **Uploaded images** (product photos, payment receipts) are stored as
  base64 data URLs directly in Postgres to avoid needing separate file
  storage. That's fine for a small catalog; if you outgrow it, swap in
  Vercel Blob or S3 and store a URL instead.

## Notes / things worth doing before going live

- `ADMIN_PASSWORD` is compared in plain text server-side — fine for a
  single-admin store, but consider hashing it if you ever add more admins.
- There's no automated stock decrement on order confirmation — stock is
  informational only right now.
- `next.config.ts` now allows images from any `https` host so admin-added
  product URLs always work; the trade-off is Next's image optimizer is
  bypassed for non-Unsplash hosts (see `ProductImage.tsx`).
