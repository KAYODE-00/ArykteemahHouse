'use client';
import { useState } from 'react';
import type { FaqItem } from '@/lib/site-content';
export default function FaqAccordion({ items }: { items: FaqItem[] }) { const [open, setOpen] = useState<number | null>(0); return <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">{items.map((item, index) => <div key={`${item.question}-${index}`}><button onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index} className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left font-semibold text-gray-900"><span>{item.question}</span><span className="text-2xl font-normal">{open === index ? '−' : '+'}</span></button>{open === index && <p className="px-6 pb-5 leading-7 text-gray-600">{item.answer}</p>}</div>)}</div>; }
