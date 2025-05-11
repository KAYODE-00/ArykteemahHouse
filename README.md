# Arykteemah House

Arykteemah House is a modern e-commerce storefront built with Next.js, TypeScript, and Stripe. It offers product browsing, search and filtering, a persistent cart, and secure checkout.

## Features

- Browse products by category
- Search and filter the catalogue
- View detailed product pages with image galleries and options
- Manage a persistent shopping cart
- Complete payments through Stripe Checkout
- Use the site on mobile and desktop

## Technology

- Next.js with the App Router
- React and TypeScript
- Tailwind CSS
- Stripe

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with your Stripe credentials:

   ```env
   STRIPE_SECRET_KEY=your_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app` - application routes and API endpoints
- `src/components` - reusable interface components
- `src/contexts` - shared application state
- `src/data` - product catalogue data
- `src/lib` - integrations and utilities
- `public` - static assets

## Deployment

Deploy Arykteemah House to a Next.js-compatible platform and configure the Stripe environment variables for the target environment.
