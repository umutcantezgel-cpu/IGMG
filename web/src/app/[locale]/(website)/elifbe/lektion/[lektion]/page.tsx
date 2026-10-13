import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { LEKTIONEN, lektionFuer } from '@/lib/elifbe/lektionen';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { LektionAnsicht } from './LektionAnsicht';

export const ensureStatic = 'navigation';

export function generateStaticParams() {
  return LEKTIONEN.map((l) => ({ lektion: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; lektion: string }> }): Promise<Metadata> {
  const { lektion } = await params;
  const l = lektionFuer(lektion);
  if (!l) return {};
  const t = await getTranslations('elifbe');
  return metadatenFuer({
    pfad: { pathname: '/elifbe/lektion/[lektion]', params: { lektion: l.slug } },
    titel: `${t(`lektionen.${l.schluessel}.titel`)} – ${t('lektion.kennung', { nr: l.nr, anzahl: LEKTIONEN.length })}`,
    beschreibung: t('lektion.untertitel', { kurz: t(`lektionen.${l.schluessel}.kurz`) }),
  });
}

/** Lektion /elifbe/lektion/[lektion]: berechnete Silbentafel und Lesereihen (MUSTER 1: Parameter in Suspense). */
export default function LektionSeite({ params }: { params: Promise<{ locale: string; lektion: string }> }) {
  return (
    <Suspense fallback={null}>
      <Lektion params={params} />
    </Suspense>
  );
}

async function Lektion({ params }: { params: Promise<{ locale: string; lektion: string }> }) {
  const { lektion } = await params;
  const l = lektionFuer(lektion);
  if (!l) notFound();
  return <LektionAnsicht lektion={l} />;
}
