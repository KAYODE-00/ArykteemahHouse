# Arykteemah

Arykteemah is a modern storefront and admin platform for an e-commerce business built with Next.js 16, React 19, and TypeScript. It replaces a typical Stripe checkout flow with a bank-transfer order process, a PostgreSQL-backed product catalog, and a lightweight admin dashboard for managing products, orders, site content, and chat conversations.

## Overview

This project is designed for a small-to-medium online store that wants to:

- Sell products from a managed catalog instead of a static file
- Accept payment via bank transfer rather than a card gateway
- Collect customer receipts and order details before confirmation
- Manage orders, notifications, and product data through a protected admin area
- Offer AI-powered product support while keeping a human fallback path for sensitive conversations

The storefront is customer-facing and open to the public, while the admin area is protected by signed cookies and middleware-based route guarding.

## Features

### Storefront

- Product catalog with category browsing and product detail pages
- Add-to-cart and cart sidebar workflow
- Product options such as color and size selection
- Bank transfer payment flow with account details and copyable information
- Receipt upload and order submission for payment verification
- Responsive storefront layout for mobile and desktop

### Admin dashboard

- Protected login at /admin/login
- Product management: create, edit, and delete catalog items
- Order review and order status updates
- Notifications panel for customer activity and escalations
- Content pages management for basic site content
- Store settings management, including payment account details
- Chat session handling with human override and escalation to staff

### AI support and customer chat

- Chat widget embedded on the storefront
- Uses Groq’s API to answer product and store questions with catalog context
- Detects money-related or sensitive inquiries and escalates them to a human
- Creates admin notifications when a chat needs attention
- Allows staff to hand the conversation back to AI after responding

### Database-powered catalog

- Product data stored in Neon Postgres rather than only in src/data/products.ts
- Migration script creates all required tables
- Seed script loads the starter catalog into the database
- Runtime falls back to the static starter catalog if the database is not configured yet

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Neon Postgres via @neondatabase/serverless
- Groq API for AI chat responses
- Signed-cookie authentication for admin access

## Project Structure

```text
Arykteemah/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   ├── checkout/
│   │   ├── faq/
│   │   ├── product/
│   │   ├── about/
│   │   ├── shipping/
│   │   ├── terms/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── admin/
│   │   ├── Header.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ChatWidget.tsx
│   │   └── ...
│   ├── contexts/
│   │   └── CartContext.tsx
│   ├── data/
│   │   └── products.ts
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── groq.ts
│   │   ├── currency.ts
│   │   └── ...
│   └── types/
│       ├── product.ts
│       ├── order.ts
│       ├── chat.ts
│       └── notification.ts
├── scripts/
│   ├── migrate.ts
│   └── seed.ts
├── public/
├── middleware.ts
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── README.md
├── SETUP.md
├── .env.local
└── .gitignore
```

## Environment Variables

Create a .env.local file in the project root with the following values:

```env
DATABASE_URL=postgresql://your-neon-connection-string
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_SESSION_SECRET=some-long-random-string
GROQ_API_KEY=your-groq-api-key
```

### Variable descriptions

- DATABASE_URL: Neon Postgres connection string for the database used by products, orders, chat, notifications, and settings
- ADMIN_PASSWORD: password used to authenticate into the admin login page
- ADMIN_SESSION_SECRET: long random string used to sign admin cookies
- GROQ_API_KEY: API key for the AI chat integration; if not set, chat falls back to manual human handling

A secure session secret can be generated with:

```bash
openssl rand -hex 32
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env.local
```

If there is no .env.example file yet, create .env.local manually with the variables shown above.

3. Run the database migration to create required tables:

```bash
npm run db:migrate
```

4. Seed the starter catalog (optional but recommended on first run):

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

The app will be available at:

- Storefront: http://localhost:3000
- Admin login: http://localhost:3000/admin/login

## Database Setup

This project expects a Postgres database, and it is configured for Neon serverless Postgres via @neondatabase/serverless.

The migration script creates the following tables:

- products
- orders
- notifications
- settings
- chat_sessions
- chat_messages

These tables support catalog data, payment receipts, chat history, and admin configuration.

## Admin Workflow

After starting the app:

1. Open /admin/login
2. Sign in using the ADMIN_PASSWORD value
3. Use the dashboard to manage:
   - Notification review
   - Product catalog updates
   - Chat session moderation
   - Site settings including banking information
   - Basic content page editing

The middleware in middleware.ts protects all /admin and /api/admin routes. Customers do not need to log in to browse or purchase.

## Checkout and Order Flow

The storefront checkout process is intentionally different from a Stripe-based flow:

1. Customer adds items to cart
2. Customer proceeds to /checkout/pay
3. Store banking details are loaded from the settings table
4. Customer transfers funds to the provided account
5. Customer uploads proof of payment (receipt or screenshot)
6. Customer submits the order along with optional contact details and notes
7. Order is saved in the database and appears in the admin dashboard

Order records include:

- selected cart items
- customer name and contact details
- payment note and receipt image
- generated order description
- total amount and currency
- order status

## Chat Behavior

The customer chat widget uses the store catalog as context and can answer product questions while staying within the catalog’s known bounds.

It is designed to escalate when:

- the customer asks about discounts, negotiation, refunds, or other money issues
- the customer asks for order status or payment-related help
- the question cannot be answered confidently from the catalog
- the customer appears frustrated or the message needs human intervention

When this happens, the conversation is routed to the admin dashboard and notifications are generated.

## Important Notes

- The app falls back to src/data/products.ts if the database is not yet configured, which keeps the storefront working during first-time setup.
- Product images and receipt uploads are stored as base64 data URLs in Postgres to keep the setup simple and self-contained.
- The admin password is checked in plain text on the server. This is acceptable for a single-admin setup but should be upgraded for more complex deployments.
- The project uses a custom Next.js configuration that allows external image hosts, which is required for some product image sources.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:migrate
npm run db:seed
```

## Deployment

This app is ready for a standard Next.js deployment target such as Vercel or another Node-compatible platform.

Before deployment, make sure you set all required environment variables in your hosting provider:

- DATABASE_URL
- ADMIN_PASSWORD
- ADMIN_SESSION_SECRET
- GROQ_API_KEY

If you deploy without a database connection, product pages and admin features may not work correctly until the database is reachable.

## Additional Documentation

There is a more focused setup guide in SETUP.md with project-specific notes covering the original template migration and operational caveats.

## License

This project is intended for internal storefront use and is not a public framework template by default. Please confirm licensing for any third-party assets, photos, branding, or product content used in production.
