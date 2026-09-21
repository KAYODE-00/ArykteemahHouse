import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, createProduct, ProductInput } from '@/lib/db';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: ProductInput = {
      name: body.name,
      description: body.description ?? '',
      price: Number(body.price),
      currency: body.currency || 'USD',
      image: body.image,
      images: body.images ?? (body.image ? [body.image] : []),
      category: body.category || 'uncategorized',
      slug: body.slug ? slugify(body.slug) : slugify(body.name),
      colors: body.colors ?? [],
      sizes: body.sizes ?? [],
      stock: body.stock !== undefined && body.stock !== '' ? Number(body.stock) : undefined,
    };

    if (!input.name || !input.image || Number.isNaN(input.price)) {
      return NextResponse.json(
        { error: 'name, price, and image are required' },
        { status: 400 }
      );
    }

    const product = await createProduct(input);
    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
