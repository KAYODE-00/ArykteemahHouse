'use client';

import { useEffect, useState } from 'react';
import { Notification } from '@/types/notification';
import { Order } from '@/types/order';

const TYPE_LABEL: Record<string, string> = {
  order: 'Order',
  chat_escalation: 'Chat needs you',
  chat_message: 'New chat message',
};

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const load = async () => {
    const [nRes, oRes] = await Promise.all([
      fetch('/api/admin/notifications'),
      fetch('/api/admin/orders'),
    ]);
    const nData = await nRes.json();
    const oData = await oRes.json();
    setNotifications(nData.notifications ?? []);
    setOrders(oData.orders ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/admin/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const setOrderStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/orders/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: status as Order['status'] } : o)));
  };

  const orderFor = (notification: Notification) =>
    notification.type === 'order' ? orders.find((o) => o.id === notification.relatedId) : undefined;

  if (loading) return <p className="text-sm text-gray-500">Loading...</p>;

  if (notifications.length === 0) {
    return <p className="text-sm text-gray-500">No notifications yet.</p>;
  }

  return (
    <div className="space-y-3">
      {notifications.map((n) => {
        const order = orderFor(n);
        const isExpanded = expandedOrder === n.id;
        return (
          <div
            key={n.id}
            className={`rounded-lg border p-4 ${
              n.read ? 'border-gray-200 bg-white' : 'border-gray-900 bg-white shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {TYPE_LABEL[n.type] ?? n.type}
                  </span>
                  {!n.read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-900" aria-label="unread" />
                  )}
                </div>
                <p className="mt-1 text-sm font-semibold text-gray-900">{n.title}</p>
                <pre className="mt-1 whitespace-pre-wrap font-sans text-sm text-gray-600">
                  {n.body}
                </pre>
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </p>

                {order && (
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : n.id)}
                      className="text-xs font-medium text-gray-700 underline"
                    >
                      {isExpanded ? 'Hide details' : 'View receipt & status'}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 space-y-3 rounded-md bg-gray-50 p-3">
                        {order.receiptDataUrl ? (
                          <a href={order.receiptDataUrl} target="_blank" rel="noreferrer">
                            {order.receiptDataUrl.startsWith('data:image') ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={order.receiptDataUrl}
                                alt="Payment receipt"
                                className="max-h-64 rounded-md border border-gray-200"
                              />
                            ) : (
                              <span className="text-xs font-medium text-gray-700 underline">
                                Open receipt file
                              </span>
                            )}
                          </a>
                        ) : (
                          <p className="text-xs text-gray-500">No receipt attached.</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-600">Status:</span>
                          <select
                            value={order.status}
                            onChange={(e) => setOrderStatus(order.id, e.target.value)}
                            className="rounded-md border border-gray-300 px-2 py-1 text-xs"
                          >
                            <option value="pending_review">Pending review</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {!n.read && (
                <button
                  onClick={() => markRead(n.id)}
                  className="shrink-0 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
