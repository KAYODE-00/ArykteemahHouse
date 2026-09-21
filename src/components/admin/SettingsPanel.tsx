'use client';

import { useEffect, useState } from 'react';
import { StoreSettings } from '@/lib/db';

export default function SettingsPanel() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => setSettings(data.settings));
  }, []);

  const save = async (partial: Partial<StoreSettings>) => {
    setSaving(true);
    setSaved(false);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial),
    });
    const data = await res.json();
    setSettings(data.settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  if (!settings) return <p className="text-sm text-gray-500">Loading...</p>;

  return (
    <div className="max-w-xl space-y-8">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Chat assistant</h2>
        <p className="text-sm text-gray-500 mb-4">
          Choose who answers new customer chat messages by default.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => save({ aiMode: 'ai' })}
            className={`flex-1 rounded-md border px-4 py-3 text-sm font-medium ${
              settings.aiMode === 'ai'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            AI is in charge
          </button>
          <button
            onClick={() => save({ aiMode: 'human' })}
            className={`flex-1 rounded-md border px-4 py-3 text-sm font-medium ${
              settings.aiMode === 'human'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 text-gray-700'
            }`}
          >
            I'll handle chats myself
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Even while AI is in charge, any chat that touches money or that the AI can&apos;t
          answer confidently gets flagged here for you automatically.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!settings) return;
          save({
            currency: settings.currency,
            bankName: settings.bankName,
            accountName: settings.accountName,
            accountNumber: settings.accountNumber,
            paymentInstructions: settings.paymentInstructions,
          });
        }}
        className="rounded-lg border border-gray-200 bg-white p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-gray-900">Payment details</h2>
        <p className="text-sm text-gray-500">
          Shown to customers at checkout so they can pay by bank transfer.
        </p>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="NGN">Naira (₦)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="GBP">British Pound (£)</option>
            <option value="EUR">Euro (€)</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Used for order totals shown to customers at checkout.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bank name</label>
          <input
            value={settings.bankName}
            onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Account name</label>
          <input
            value={settings.accountName}
            onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Account number</label>
          <input
            value={settings.accountNumber}
            onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Instructions shown to customers
          </label>
          <textarea
            value={settings.paymentInstructions}
            onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })}
            rows={2}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
