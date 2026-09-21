import { PolicyPage } from '@/components/ContentPage';
import { DEFAULT_SETTINGS, getSettings } from '@/lib/db';
export default async function Page() { const settings = await getSettings().catch(() => DEFAULT_SETTINGS); return <PolicyPage content={settings.siteContent.terms} kind="terms" />; }
