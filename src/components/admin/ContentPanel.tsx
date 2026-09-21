'use client';

import { useEffect, useState } from 'react';
import { SiteContent, StoreSettings } from '@/lib/db';

export default function ContentPanel() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  useEffect(() => { fetch('/api/admin/settings').then((r) => r.json()).then((data) => setContent(data.settings?.siteContent)); }, []);
  const update = (path: string, value: string) => setContent((current) => {
    if (!current) return current;
    const copy = structuredClone(current) as SiteContent;
    const parts = path.split('.'); let target: any = copy;
    for (let i = 0; i < parts.length - 1; i++) target = target[Number.isNaN(Number(parts[i])) ? parts[i] : Number(parts[i])];
    target[Number.isNaN(Number(parts.at(-1))) ? parts.at(-1)! : Number(parts.at(-1))] = value;
    return copy;
  });
  const updateValues = (value: string) => setContent((current) => current ? { ...current, about: { ...current.about, values: value.split('\n').map((item) => item.trim()).filter(Boolean) } } : current);
  const save = async () => { if (!content) return; setSaving(true); const response = await fetch('/api/admin/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteContent: content }) }); setSaving(false); setNotice(response.ok ? 'Saved. Changes are live.' : 'Could not save changes. Check database setup.'); setTimeout(() => setNotice(''), 3000); };
  if (!content) return <p className="text-sm text-gray-500">Loading content editor...</p>;
  const Text = ({ label, path, multiline = false }: { label: string; path: string; multiline?: boolean }) => { const value = path.split('.').reduce<any>((o, k) => o?.[Number.isNaN(Number(k)) ? k : Number(k)], content) ?? ''; return <label className="block text-sm font-medium text-gray-700">{label}{multiline ? <textarea value={value} rows={4} onChange={(e) => update(path, e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-normal" /> : <input value={value} onChange={(e) => update(path, e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-normal" />}</label>; };
  return <div className="max-w-3xl space-y-7"><div><h1 className="text-xl font-semibold text-gray-900">Site pages</h1><p className="mt-1 text-sm text-gray-500">Edit the content shown on About, FAQ, Terms, and Shipping pages.</p></div>
    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5"><h2 className="font-semibold">About page</h2><Text label="Eyebrow" path="about.eyebrow" /><Text label="Heading" path="about.title" /><Text label="Introduction" path="about.intro" multiline /><Text label="Story" path="about.story" multiline /><label className="block text-sm font-medium text-gray-700">Values (one per line)<textarea value={content.about.values.join('\n')} rows={3} onChange={(e) => updateValues(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-normal" /></label></section>
    <section className="space-y-4 rounded-lg border border-gray-200 bg-white p-5"><h2 className="font-semibold">FAQ page</h2><Text label="Heading" path="faq.title" /><Text label="Introduction" path="faq.intro" multiline />{content.faq.items.map((_, i) => <div key={i} className="grid gap-3 border-t pt-4"><Text label={`Question ${i + 1}`} path={`faq.items.${i}.question`} /><Text label="Answer" path={`faq.items.${i}.answer`} multiline /></div>)}</section>
    {(['terms', 'shipping'] as const).map((kind) => <section key={kind} className="space-y-4 rounded-lg border border-gray-200 bg-white p-5"><h2 className="font-semibold capitalize">{kind === 'terms' ? 'Terms & Conditions' : 'Shipping & Returns'}</h2><Text label="Heading" path={`${kind}.title`} /><Text label="Introduction" path={`${kind}.intro`} multiline />{kind === 'terms' && <Text label="Last updated" path="terms.updated" />}{content[kind].sections.map((_, i) => <div key={i} className="grid gap-3 border-t pt-4"><Text label={`Section ${i + 1} heading`} path={`${kind}.sections.${i}.heading`} /><Text label="Section text" path={`${kind}.sections.${i}.body`} multiline /></div>)}</section>)}
    <div className="sticky bottom-4 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-lg"><button onClick={save} disabled={saving} className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving...' : 'Save page content'}</button><span className="text-sm text-gray-600">{notice}</span></div></div>;
}
