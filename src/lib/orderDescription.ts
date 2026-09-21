import { OrderItemSnapshot } from '@/types/order';
import { formatMoney } from '@/lib/currency';

export function generateOrderDescription(
  items: OrderItemSnapshot[],
  note: string | undefined,
  customerName: string | undefined,
  customerContact: string | undefined,
  currency: string = 'NGN'
): string {
  const lines: string[] = [];
  lines.push('New order request:');
  for (const item of items) {
    const opts: string[] = [];
    if (item.color) opts.push(`Color: ${item.color}`);
    if (item.size) opts.push(`Size: ${item.size}`);
    const optsText = opts.length ? ` (${opts.join(', ')})` : '';
    lines.push(
      `- ${item.name} x${item.quantity}${optsText} — ${formatMoney(item.price * item.quantity, currency)}`
    );
  }
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  lines.push(`Total: ${formatMoney(total, currency)}`);
  if (customerName) lines.push(`Customer: ${customerName}`);
  if (customerContact) lines.push(`Contact: ${customerContact}`);
  if (note && note.trim()) lines.push(`Note: ${note.trim()}`);
  return lines.join('\n');
}
