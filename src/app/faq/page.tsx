import FaqPage from '@/components/FaqPage';
import { DEFAULT_SETTINGS, getSettings } from '@/lib/db';
export default async function Page() { const settings = await getSettings().catch(() => DEFAULT_SETTINGS); return <FaqPage {...settings.siteContent.faq} />; }
