export type OrderItemSnapshot = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
};

export type OrderStatus = 'pending_review' | 'confirmed' | 'rejected';

export type Order = {
  id: string;
  items: OrderItemSnapshot[];
  customerName?: string;
  customerContact?: string;
  note?: string;
  receiptDataUrl?: string;
  description: string;
  total: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
};
