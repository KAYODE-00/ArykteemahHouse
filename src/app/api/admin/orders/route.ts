import { NextResponse } from 'next/server';
import { listOrders } from '@/lib/db';

export async function GET() {
  try {
    const orders = await listOrders();
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
