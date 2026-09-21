'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NotificationsPanel from './NotificationsPanel';
import ProductsPanel from './ProductsPanel';
import ChatPanel from './ChatPanel';
import SettingsPanel from './SettingsPanel';
import ContentPanel from './ContentPanel';

type Tab = 'notifications' | 'products' | 'chat' | 'content' | 'settings';

const TABS: { id: Tab; label: string }[] = [
  { id: 'notifications', label: 'Notifications' },
  { id: 'products', label: 'Products' },
  { id: 'chat', label: 'Chat' },
  { id: 'content', label: 'Site pages' },
  { id: 'settings', label: 'Settings' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('notifications');

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-lg font-bold text-gray-900">Store admin</p>
            <p className="text-xs text-gray-500">Arykteemah</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {tab === 'notifications' && <NotificationsPanel />}
        {tab === 'products' && <ProductsPanel />}
        {tab === 'chat' && <ChatPanel />}
        {tab === 'content' && <ContentPanel />}
        {tab === 'settings' && <SettingsPanel />}
      </main>
    </div>
  );
}
