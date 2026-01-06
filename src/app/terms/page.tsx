import { getSiteContent } from '@/lib/site-content';
export const dynamic = 'force-dynamic';
export default async function TermsPage() { const { terms } = await getSiteContent(); return <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6"><p className="text-sm font-semibold uppercase tracking-widest text-gray-500">Legal</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">Terms & conditions</h1><p className="mt-8 whitespace-pre-line leading-8 text-gray-600">{terms}</p></main>; }
