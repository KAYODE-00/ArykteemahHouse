import { NextRequest, NextResponse } from 'next/server';
import { updateProduct, deleteProduct, ProductInput } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input: Partial<ProductInput> = {};
    if (body.name !== undefined) input.name = body.name;
    if (body.description !== undefined) input.description = body.description;
    if (body.price !== undefined) input.price = Number(body.price);
    if (body.currency !== undefined) input.currency = body.currency;
    if (body.image !== undefined) input.image = body.image;
    if (body.images !== undefined) input.images = body.images;
    if (body.category !== undefined) input.category = body.category;
    if (body.slug !== undefined) input.slug = body.slug;
    if (body.colors !== undefined) input.colors = body.colors;
    if (body.sizes !== undefined) input.sizes = body.sizes;
    if (body.stock !== undefined) input.stock = body.stock === '' ? undefined : Number(body.stock);

    const product = await updateProduct(id, input);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
