import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { buchstabeFuer, SLUGS } from '@/lib/elifbe/alphabet';
import { BuchstabenAnsicht } from './BuchstabenAnsicht';

export const ensureStatic = 'navigation';

/** Alle 29 Buchstaben beim Bau (Slugs aus alphabet.ts). */
export function generateStaticParams() {
  return SLUGS.map((buchstabe) => ({ buchstabe }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; buchstabe: string }> }): Promise<Metadata> {
  const { buchstabe } = await params;
  const b = buchstabeFuer(buchstabe);
  if (!b) return {};
  const t = await getTranslations('elifbe.buchstabe');
  return metadatenFuer({
    pfad: { pathname: '/elifbe/buchstaben/[buchstabe]', params: { buchstabe: b.slug } },
    titel: `${b.elifbe} – ${t('kennung', { nr: b.nr })}`,
    beschreibung: t('untertitel', { name: b.elifbe }),
  });
}

/**
 * Buchstabenseite /elifbe/buchstaben/[buchstabe] (B-17). Wie der Koran-Leser ohne umschließendes `<Suspense>`
 * (Abweichung von MUSTER 1, Z-08, N1): Alle 29 Buchstaben sind vorgerendert, andere Werte enden in notFound(). In einem
 * Suspense-Rahmen lieferte React die ganze Seite ausgelagert (`<div hidden>` mit `$RC`) und deckte sie gedrosselt auf.
 */
export default async function BuchstabeSeite({ params }: { params: Promise<{ locale: string; buchstabe: string }> }) {
  const { buchstabe } = await params;
  const b = buchstabeFuer(buchstabe);
  if (!b) notFound();
  return <BuchstabenAnsicht b={b} />;
}
