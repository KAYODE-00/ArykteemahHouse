import { Suspense } from 'react';
import { products as staticProducts } from '@/data/products';
import { getAllProducts } from '@/lib/db';
import ProductGrid from '@/components/ProductGrid';
import Hero from '@/components/Hero';

interface HomeProps {
  searchParams: Promise<{ category?: string }>;
}

function ProductGridFallback() {
  return (
    <div>
      <div className="mb-8 flex flex-wrap gap-4 border-b border-gray-200 pb-4">
        <div className="h-6 w-16 animate-pulse rounded bg-gray-200"></div>
        <div className="h-6 w-20 animate-pulse rounded bg-gray-200"></div>
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square w-full rounded-lg bg-gray-200"></div>
            <div className="mt-4 h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="mt-2 h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const category = params.category || 'all';

  let products = staticProducts;
  try {
    const dbProducts = await getAllProducts();
    if (dbProducts.length > 0) products = dbProducts;
  } catch {
    // DATABASE_URL not configured yet, or DB unreachable — show the
    // starter catalog so the storefront never breaks.
  }

  return (
    <>
      <Hero featured={products.slice(0, 2)} />
      <div id="collection" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={<ProductGridFallback />}>
          <ProductGrid products={products} initialCategory={category} />
        </Suspense>
      </div>
    </>
  );
}
