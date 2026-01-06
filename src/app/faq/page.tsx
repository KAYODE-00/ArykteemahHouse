import FaqAccordion from '@/components/FaqAccordion';
import { getSiteContent } from '@/lib/site-content';
export const dynamic = 'force-dynamic';
export default async function FaqPage() { const content = await getSiteContent(); return <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6"><p className="text-sm font-semibold uppercase tracking-widest text-gray-500">Help centre</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">Frequently asked questions</h1><p className="mt-4 mb-10 text-lg text-gray-600">Everything you need to know about shopping with Arykteemah House.</p><FaqAccordion items={content.faq} /></main>; }
