import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
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

/** Buchstabenseite /elifbe/buchstaben/[buchstabe] (B-17). URL-Daten nur innerhalb von Suspense lesen (MUSTER 1). */
export default function BuchstabeSeite({ params }: { params: Promise<{ locale: string; buchstabe: string }> }) {
  return (
    <Suspense fallback={null}>
      <Buchstabe params={params} />
    </Suspense>
  );
}

async function Buchstabe({ params }: { params: Promise<{ locale: string; buchstabe: string }> }) {
  const { buchstabe } = await params;
  const b = buchstabeFuer(buchstabe);
  if (!b) notFound();
  return <BuchstabenAnsicht b={b} />;
}
