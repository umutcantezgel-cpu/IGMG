import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { QuranUebersicht } from './QuranUebersicht';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('quranSeite');
  return metadatenFuer({ pfad: '/quran', titel: t('titel'), beschreibung: t('untertitel') });
}

/** Übersicht Quran (Design Quran.dc.html, Blatt S13): alle Suren als Raster; jede Sure führt zu /quran/[sure]. */
export default function QuranEinstieg() {
  return <QuranUebersicht />;
}
