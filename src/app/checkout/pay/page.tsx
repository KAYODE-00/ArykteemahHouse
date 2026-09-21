'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { FiCheck, FiCopy, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { formatMoney } from '@/lib/currency';

type BankDetails = {
  currency: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentInstructions: string;
};

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
        <span className="text-sm font-semibold text-gray-900">{value}</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="ml-3 flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
        >
          {copied ? <FiCheck className="h-3.5 w-3.5" /> : <FiCopy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function PayPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const total = getTotalPrice();

  const [bank, setBank] = useState<BankDetails | null>(null);
  const [bankError, setBankError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [note, setNote] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0 && !orderId) {
      router.push('/');
    }
  }, [items, router, orderId]);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setBankError(data.error);
        else setBank(data);
      })
      .catch(() => setBankError('Could not load payment details. Please try again shortly.'));
  }, []);

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const receiptDataUrl = receiptFile ? await fileToDataUrl(receiptFile) : undefined;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            color: i.selectedColor,
            size: i.selectedSize,
          })),
          customerName: customerName || undefined,
          customerContact: customerContact || undefined,
          note: note || undefined,
          receiptDataUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit order');
      setOrderId(data.orderId);
      clearCart();
    } catch (err: any) {
      setError(err.message || 'Something went wrong submitting your order');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full mx-auto px-4 py-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order received</h1>
          <p className="text-gray-600 mb-2">
            Thanks{customerName ? `, ${customerName}` : ''} — we&apos;ve got your order and receipt.
          </p>
          <p className="text-sm text-gray-500 mb-8">Order reference: #{orderId}</p>
          <p className="text-sm text-gray-600 mb-8">
            We&apos;ll confirm your payment shortly. Feel free to use the chat bubble if you have
            any questions in the meantime.
          </p>
          <Link
            href="/"
            className="block w-full rounded-lg bg-gray-900 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-gray-800"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete your payment</h1>
      <p className="text-gray-600 mb-8">
        Send a bank transfer for the total below, then submit your receipt so we can confirm it.
      </p>

      <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
        <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
          <span>Amount to transfer</span>
          <span>{formatMoney(total, bank?.currency ?? 'NGN')}</span>
        </div>

        {bankError && (
          <p className="text-sm text-red-600">{bankError}</p>
        )}
        {bank && (
          <div className="space-y-4">
            <CopyField label="Bank name" value={bank.bankName} />
            <CopyField label="Account name" value={bank.accountName} />
            <CopyField label="Account number" value={bank.accountNumber} />
            {bank.paymentInstructions && (
              <p className="text-sm text-gray-600">{bank.paymentInstructions}</p>
            )}
          </div>
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Submit your receipt</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone or email
            </label>
            <input
              value={customerContact}
              onChange={(e) => setCustomerContact(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
              placeholder="Optional — so we can reach you"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment receipt / screenshot
          </label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-800"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Extra note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none"
            placeholder="Delivery address, timing, anything else we should know"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-lg bg-gray-900 px-6 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <FiLoader className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit order'
          )}
        </button>
      </div>
    </div>
  );
}
