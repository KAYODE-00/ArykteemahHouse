import Link from 'next/link';
import { SiteContent } from '@/lib/db';

export function PolicyPage({ content, kind }: { content: SiteContent['terms'] | SiteContent['shipping']; kind: 'terms' | 'shipping' }) {
  return <section className="bg-[#fbfaf7] py-16 sm:py-24"><div className="mx-auto max-w-3xl px-5">
    <Link href="/" className="text-sm font-medium text-[#526653] hover:underline">← Back to shop</Link>
    <p className="mt-10 text-xs font-semibold uppercase tracking-[0.2em] text-[#526653]">{kind === 'terms' ? 'Legal' : 'Customer care'}</p>
    <h1 className="mt-3 font-[family-name:var(--font-fraunces)] text-4xl font-medium text-[#1b1b18] sm:text-5xl">{content.title}</h1>
    {'updated' in content && <p className="mt-3 text-sm text-gray-500">{content.updated}</p>}
    <p className="mt-6 text-lg leading-8 text-gray-600">{content.intro}</p>
    <div className="mt-12 space-y-9">{content.sections.map((section) => <article key={section.heading} className="border-t border-[#dedbd2] pt-7"><h2 className="text-xl font-semibold text-[#1b1b18]">{section.heading}</h2><p className="mt-3 whitespace-pre-line leading-7 text-gray-600">{section.body}</p></article>)}</div>
  </div></section>;
}

export function AboutPage({ content }: { content: SiteContent['about'] }) {
  return <section className="bg-[#fbfaf7] py-16 sm:py-24"><div className="mx-auto max-w-5xl px-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#526653]">{content.eyebrow}</p><h1 className="mt-4 max-w-3xl font-[family-name:var(--font-fraunces)] text-5xl leading-tight text-[#1b1b18] sm:text-6xl">{content.title}</h1><p className="mt-7 max-w-2xl text-xl leading-8 text-gray-600">{content.intro}</p><div className="mt-16 grid gap-10 border-t border-[#dedbd2] pt-10 md:grid-cols-[1.3fr_1fr]"><p className="whitespace-pre-line text-lg leading-8 text-gray-600">{content.story}</p><div className="rounded-2xl bg-[#e9eee8] p-7"><p className="text-sm font-semibold text-[#1b1b18]">What guides us</p><ul className="mt-5 space-y-4">{content.values.map((value) => <li key={value} className="border-b border-[#cfd9cd] pb-4 text-[#405442]">{value}</li>)}</ul></div></div></div></section>;
}
