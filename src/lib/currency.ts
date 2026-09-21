const SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
};

export function currencySymbol(code: string): string {
  const symbol = SYMBOLS[code?.toUpperCase()];
  return symbol ?? `${code} `;
}

export function formatMoney(amount: number, code: string): string {
  return `${currencySymbol(code)}${amount.toFixed(2)}`;
}
