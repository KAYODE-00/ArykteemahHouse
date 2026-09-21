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
  images: string[];
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
  images: [],
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
      images: p.images?.length ? p.images : [p.image],
      colors: (p.colors ?? []).join(', '),
      sizes: (p.sizes ?? []).join(', '),
      stock: p.stock !== undefined ? String(p.stock) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addImageFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const dataUrls = await Promise.all(Array.from(files).map(fileToDataUrl));
    setForm((f) => {
      const images = [...f.images, ...dataUrls];
      return { ...f, images, image: images[0] ?? '' };
    });
  };

  const addImageUrl = (url: string) => {
    const image = url.trim();
    if (!image) return;
    setForm((f) => {
      if (f.images.includes(image)) return f;
      const images = [...f.images, image];
      return { ...f, images, image: images[0] };
    });
  };

  const removeImage = (index: number) => setForm((f) => {
    const images = f.images.filter((_, imageIndex) => imageIndex !== index);
    return { ...f, images, image: images[0] ?? '' };
  });

  const makePrimary = (index: number) => setForm((f) => {
    const selected = f.images[index];
    const images = [selected, ...f.images.filter((_, imageIndex) => imageIndex !== index)];
    return { ...f, images, image: selected };
  });

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
        images: form.images,
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
          <label className="block text-xs font-medium text-gray-600 mb-1">Product images</label>
          <p className="mb-2 text-xs text-gray-500">Select several images at once. The first image is the main product image.</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => { addImageFiles(e.target.files); e.currentTarget.value = ''; }}
            className="block w-full text-xs text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
          <div className="mt-2 flex gap-2"><input id="image-url" placeholder="or paste an image URL" className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm" /><button type="button" onClick={() => { const input = document.getElementById('image-url') as HTMLInputElement; addImageUrl(input.value); input.value = ''; }} className="rounded-md border border-gray-300 px-3 text-xs font-semibold text-gray-700">Add</button></div>
          {form.images.length > 0 && <div className="mt-3 grid grid-cols-4 gap-2">{form.images.map((image, index) => <div key={`${image}-${index}`} className="relative"><button type="button" onClick={() => makePrimary(index)} title="Make main image" className={`block w-full overflow-hidden rounded-md border-2 ${index === 0 ? 'border-gray-900' : 'border-transparent'}`}><img src={image} alt={`Product preview ${index + 1}`} className="h-16 w-full object-cover" /></button><button type="button" onClick={() => removeImage(index)} aria-label={`Remove image ${index + 1}`} className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white">×</button>{index === 0 && <span className="mt-1 block text-center text-[10px] font-semibold text-gray-600">Main</span>}</div>)}</div>}
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
