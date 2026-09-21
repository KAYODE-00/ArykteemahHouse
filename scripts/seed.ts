// Seeds the database with the store's original starter catalog.
// Safe to run once after db:migrate. Skips products whose slug already exists.
// Usage: npm run db:seed
import { neon } from '@neondatabase/serverless';
import { loadEnvConfig } from '@next/env';

// `tsx` does not load Next.js .env.local files by itself.
loadEnvConfig(process.cwd());
import { products } from '../src/data/products';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Add it to .env.local (or your shell) first.');
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  let inserted = 0;
  for (const p of products) {
    const existing = await sql`SELECT id FROM products WHERE slug = ${p.slug} LIMIT 1`;
    if (existing[0]) continue;
    await sql`
      INSERT INTO products
        (name, description, price, currency, image, images, category, slug, colors, sizes, stock)
      VALUES (
        ${p.name}, ${p.description}, ${p.price}, ${p.currency}, ${p.image},
        ${p.images ?? []}, ${p.category}, ${p.slug}, ${p.colors ?? []},
        ${p.sizes ?? []}, ${p.stock ?? null}
      )`;
    inserted++;
  }

  console.log(`Seed complete: inserted ${inserted} new product(s) (${products.length - inserted} already existed).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
