import { NextRequest, NextResponse } from 'next/server';
import { createPayment } from '@/lib/payment-store';
import { getProductBySlug } from '@/data/products';

export async function POST(request: NextRequest) {
  const { productSlug, quantity = 1, color, size } = await request.json();
  const product = getProductBySlug(productSlug);
  const safeQuantity = Math.max(1, Math.min(Number(quantity) || 1, product?.stock || 99));
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  const payment = await createPayment({ productSlug, productName: product.name, quantity: safeQuantity, color, size, amount: product.price * safeQuantity, currency: product.currency });
  const response = NextResponse.json({ id: payment.id });
  response.cookies.set(`payment_${payment.id}`, payment.buyerToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: `/payment/${payment.id}`, maxAge: 60 * 60 * 24 * 30 });
  return response;
}
