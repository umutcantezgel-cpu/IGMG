import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { QuranAnsicht } from '../QuranAnsicht';
import { ladeSeitenStand, surenNummern } from '../stand';

export const ensureStatic = 'navigation';

/** Beim Bau alle Suren (ohne Import 1 bis 5); mindestens ein Wert, sonst Platzhalter „_“. */
export async function generateStaticParams() {
  const nummern = (await surenNummern()).map(String);
  return (nummern.length ? nummern : ['_']).map((sure) => ({ sure }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; sure: string }> }): Promise<Metadata> {
  const { sure } = await params;
  const stand = await ladeSeitenStand(sure);
  if (!stand) return {};
  const t = await getTranslations('quranSeite');
  return metadatenFuer({
    pfad: { pathname: '/quran/[sure]', params: { sure: String(stand.nr) } },
    titel: t('titelSure', { name: stand.name }),
    beschreibung: t('untertitel'),
  });
}

/** Surenansicht /quran/[sure] (Blatt S13). URL-Daten nur innerhalb von Suspense lesen (MUSTER 1). */
export default function QuranSurePage({ params }: { params: Promise<{ locale: string; sure: string }> }) {
  return (
    <Suspense fallback={null}>
      <QuranSure params={params} />
    </Suspense>
  );
}

async function QuranSure({ params }: { params: Promise<{ locale: string; sure: string }> }) {
  const { sure } = await params;
  const stand = await ladeSeitenStand(sure);
  if (!stand) notFound();
  return <QuranAnsicht stand={stand} />;
}
