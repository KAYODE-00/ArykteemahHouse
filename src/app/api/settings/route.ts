import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({
      currency: settings.currency,
      bankName: settings.bankName,
      accountName: settings.accountName,
      accountNumber: settings.accountNumber,
      paymentInstructions: settings.paymentInstructions,
    });
  } catch {
    return NextResponse.json(
      { error: 'Store is not fully configured yet. Please contact us to complete your order.' },
      { status: 503 }
    );
  }
}
