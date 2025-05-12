import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export type PaymentRecord = {
  id: string;
  productSlug: string;
  productName: string;
  quantity: number;
  color?: string;
  size?: string;
  amount: number;
  currency: string;
  buyerToken: string;
  note?: string;
  receipt?: { filename: string; contentType: string; storedName: string };
  createdAt: string;
};

const storeDir = path.join(process.cwd(), '.payments');
const recordsFile = path.join(storeDir, 'records.json');

async function records(): Promise<PaymentRecord[]> {
  try {
    return JSON.parse(await fs.readFile(recordsFile, 'utf8'));
  } catch {
    return [];
  }
}

async function save(recordsToSave: PaymentRecord[]) {
  await fs.mkdir(storeDir, { recursive: true });
  await fs.writeFile(recordsFile, JSON.stringify(recordsToSave, null, 2), 'utf8');
}

export async function createPayment(record: Omit<PaymentRecord, 'id' | 'buyerToken' | 'createdAt'>) {
  const payment: PaymentRecord = {
    ...record,
    id: crypto.randomUUID(),
    buyerToken: crypto.randomBytes(32).toString('hex'),
    createdAt: new Date().toISOString(),
  };
  const all = await records();
  all.push(payment);
  await save(all);
  return payment;
}

export async function getPayment(id: string) {
  return (await records()).find((record) => record.id === id);
}

export async function allPayments() {
  return records();
}

export async function attachProof(id: string, note: string, receipt?: { filename: string; contentType: string; data: string }) {
  const all = await records();
  const payment = all.find((record) => record.id === id);
  if (!payment) return undefined;
  payment.note = note.trim() || undefined;
  if (receipt) {
    const extension = path.extname(receipt.filename).slice(0, 12);
    const storedName = `${id}-${crypto.randomUUID()}${extension}`;
    await fs.mkdir(storeDir, { recursive: true });
    await fs.writeFile(path.join(storeDir, storedName), Buffer.from(receipt.data, 'base64'));
    payment.receipt = { filename: path.basename(receipt.filename), contentType: receipt.contentType, storedName };
  }
  await save(all);
  return payment;
}

export async function receiptFile(payment: PaymentRecord) {
  if (!payment.receipt) return undefined;
  return fs.readFile(path.join(storeDir, payment.receipt.storedName));
}
