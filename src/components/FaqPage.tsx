'use client';

import { useState } from 'react';
import { FaqItem } from '@/lib/db';

export default function FaqPage({ title, intro, items }: { title: string; intro: string; items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return <section className="bg-[#fbfaf7] py-16 sm:py-24"><div className="mx-auto max-w-3xl px-5 text-center"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#526653]">Help centre</p><h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl text-[#1b1b18] sm:text-5xl">{title}</h1><p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-gray-600">{intro}</p><div className="mt-12 text-left">{items.map((item, index) => <div key={`${item.question}-${index}`} className="border-t border-[#dedbd2]"><button onClick={() => setOpen(open === index ? null : index)} className="flex w-full items-center justify-between gap-5 py-6 text-left text-base font-semibold text-[#1b1b18]"><span>{item.question}</span><span className="text-2xl font-normal text-[#526653]">{open === index ? '−' : '+'}</span></button>{open === index && <p className="-mt-2 pb-6 pr-10 leading-7 text-gray-600">{item.answer}</p>}</div>)}</div></div></section>;
}
