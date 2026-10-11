import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { QuranAnsicht } from './QuranAnsicht';
import { ladeSeitenStand } from './stand';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('quranSeite');
  return metadatenFuer({ pfad: '/quran', titel: t('titel'), beschreibung: t('untertitel') });
}

/** Einstieg Quran (Design Quran.dc.html, Blatt S13): zeigt Sure 1; die übrigen Suren führen zu /quran/[sure]. */
export default async function QuranEinstieg() {
  const stand = await ladeSeitenStand('1');
  if (!stand) notFound();
  return <QuranAnsicht stand={stand} uebersicht />;
}
