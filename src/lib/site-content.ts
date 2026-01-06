import fs from 'fs/promises';
import path from 'path';

export type FaqItem = { question: string; answer: string };
export type SiteContent = { about: string; terms: string; shipping: string; faq: FaqItem[] };

export const defaults: SiteContent = {
  about: 'Arykteemah House brings considered products and dependable service together in one welcoming store. We select every item with care and aim to make every order feel simple, personal, and worthwhile.',
  terms: 'By placing an order, you confirm that your details are accurate and that you are authorised to use the payment method selected. Prices and availability may change without notice. We may cancel an order where payment cannot be verified or an item is unavailable.',
  shipping: 'Orders are processed within 1–3 business days. Delivery times vary by location and are shared once your order is confirmed. Please inspect your order on arrival and contact us promptly if it is damaged or incorrect. Eligible unused items may be returned within 7 days of delivery; contact us before sending a return.',
  faq: [
    { question: 'How do I place an order?', answer: 'Choose your product, select its options, and add it to your cart or use Buy Now to continue to payment.' },
    { question: 'How long does delivery take?', answer: 'Processing takes 1–3 business days. Delivery estimates depend on your destination.' },
    { question: 'Can I return an item?', answer: 'Eligible unused items may be returned within 7 days of delivery. Contact us before returning an item.' },
    { question: 'How can I contact support?', answer: 'Visit our Contact page and our team will be happy to help.' },
  ],
};

const contentPath = path.join(process.cwd(), '.site-content.json');
export async function getSiteContent(): Promise<SiteContent> { try { return { ...defaults, ...JSON.parse(await fs.readFile(contentPath, 'utf8')) }; } catch { return defaults; } }
export async function saveSiteContent(content: SiteContent) { await fs.writeFile(contentPath, JSON.stringify(content, null, 2), 'utf8'); }
