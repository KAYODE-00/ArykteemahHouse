'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { formatMoney } from '@/lib/currency';

type FormState = {
  id?: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  category: string;
  slug: string;
  image: string;
  colors: string;
  sizes: string;
  stock: string;
};

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  currency: 'NGN',
  category: '',
  slug: '',
  image: '',
  colors: '',
  sizes: '',
  stock: '',
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch('/api/admin/products');
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (p: Product) => {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: String(p.price),
      currency: p.currency,
      category: p.category,
      slug: p.slug,
      image: p.image,
      colors: (p.colors ?? []).join(', '),
      sizes: (p.sizes ?? []).join(', '),
      stock: p.stock !== undefined ? String(p.stock) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageFile = async (file: File | null) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    setForm((f) => ({ ...f, image: dataUrl }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        currency: form.currency,
        category: form.category,
        slug: form.slug,
        image: form.image,
        colors: form.colors ? form.colors.split(',').map((c) => c.trim()).filter(Boolean) : [],
        sizes: form.sizes ? form.sizes.split(',').map((s) => s.trim()).filter(Boolean) : [],
        stock: form.stock,
      };
      const res = await fetch(
        form.id ? `/api/admin/products/${form.id}` : '/api/admin/products',
        {
          method: form.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');
      setForm(EMPTY_FORM);
      await load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-2 space-y-4 rounded-lg border border-gray-200 bg-white p-5 h-fit"
      >
        <h2 className="text-sm font-semibold text-gray-900">
          {form.id ? 'Edit product' : 'Add a product'}
        </h2>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
            <input
              required
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
            <input
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Slug (optional)
            </label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="auto from name"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
          <input
            value={form.image.startsWith('data:') ? '' : form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            placeholder="or paste an image URL"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          {form.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image} alt="Preview" className="mt-2 h-20 w-20 rounded-md object-cover" />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Colors (comma separated)
            </label>
            <input
              value={form.colors}
              onChange={(e) => setForm({ ...form, colors: e.target.value })}
              placeholder="Black, Pink, White"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Sizes (comma separated)
            </label>
            <input
              value={form.sizes}
              onChange={(e) => setForm({ ...form, sizes: e.target.value })}
              placeholder="S, M, L, XL"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : form.id ? 'Save changes' : 'Add product'}
          </button>
          {form.id && (
            <button
              type="button"
              onClick={() => setForm(EMPTY_FORM)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="lg:col-span-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-gray-500">No products yet — add your first one.</p>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.image} alt={p.name} className="h-12 w-12 rounded-md object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatMoney(p.price, p.currency)} · {p.category}
                    {p.stock !== undefined ? ` · ${p.stock} in stock` : ''}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(p)}
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
