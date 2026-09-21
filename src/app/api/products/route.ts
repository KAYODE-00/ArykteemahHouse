import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/db';
import { products as staticProducts } from '@/data/products';

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ products: staticProducts, fallback: true });
  }
}
