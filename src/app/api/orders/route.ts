import { NextRequest, NextResponse } from 'next/server';
import { createOrder, createNotification, getSettings } from '@/lib/db';
import { generateOrderDescription } from '@/lib/orderDescription';
import { OrderItemSnapshot } from '@/types/order';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items: OrderItemSnapshot[] = body.items;
    const note: string | undefined = body.note;
    const customerName: string | undefined = body.customerName;
    const customerContact: string | undefined = body.customerContact;
    const receiptDataUrl: string | undefined = body.receiptDataUrl;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 });
    }

    // Keep the stored receipt image to a sane size (~5MB base64).
    if (receiptDataUrl && receiptDataUrl.length > 7_000_000) {
      return NextResponse.json({ error: 'Receipt file is too large' }, { status: 400 });
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const settings = await getSettings();
    const description = generateOrderDescription(
      items,
      note,
      customerName,
      customerContact,
      settings.currency
    );

    const order = await createOrder({
      items,
      customerName,
      customerContact,
      note,
      receiptDataUrl,
      description,
      total,
      currency: settings.currency,
    });

    await createNotification({
      type: 'order',
      title: `New order #${order.id}${customerName ? ` from ${customerName}` : ''}`,
      body: description,
      relatedId: order.id,
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit order' },
      { status: 500 }
    );
  }
}
