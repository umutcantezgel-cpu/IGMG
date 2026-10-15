import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BuchAnsicht } from '@/components/website/hadith/BuchAnsicht';
import { funktionAn } from '@/lib/funktionen';
import { buchNummer, teilNummer } from '@/lib/hadith/anzeige';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeHadithBuch, ladeHadithBuchTeile } from '@/server/queries/hadith';

export const ensureStatic = 'navigation';

type Parameter = { params: Promise<{ locale: string; buch: string; teil: string }> };

/**
 * Teile 2…n der langen Bücher (je bis zu 100 Hadithe), nur mit eingeschaltetem Schalter `hadith_gesamt`. Aus oder
 * ohne Import: nur der Platzhalter „_“, jede Teiladresse antwortet mit 404. Teil 1 ist die Buchseite selbst.
 */
export async function generateStaticParams() {
  const buecher = (await funktionAn('hadith_gesamt')) ? await ladeHadithBuchTeile() : [];
  const parameter = buecher.flatMap((b) => Array.from({ length: b.teile - 1 }, (_, i) => ({ buch: String(b.nr), teil: String(i + 2) })));
  return parameter.length ? parameter : [{ buch: '_', teil: '_' }];
}

async function lade(rohBuch: string, rohTeil: string) {
  const nr = buchNummer(rohBuch);
  const teil = teilNummer(rohTeil);
  if (nr === null || teil === null || !(await funktionAn('hadith_gesamt'))) return null;
  return ladeHadithBuch(nr, teil);
}

export async function generateMetadata({ params }: Parameter): Promise<Metadata> {
  const { buch, teil } = await params;
  const daten = await lade(buch, teil);
  if (!daten) return {};
  const t = await getTranslations('hadith.buch');
  return metadatenFuer({
    pfad: { pathname: '/hadith/bukhari/[buch]/teil/[teil]', params: { buch: String(daten.buch.nr), teil: String(daten.teil) } },
    titel: t('metaTitelTeil', { titel: daten.buch.titelEn, nr: daten.buch.nr, teil: daten.teil }),
    beschreibung: `${t('untertitel', { anzahl: daten.buch.anzahl })} ${t('teilHinweis', { teile: daten.teile })}`,
  });
}

/**
 * Teilseite /hadith/bukhari/[buch]/teil/[teil] (AUFTRAG 3.3). Wie die Buchseite ohne umschließendes `<Suspense>`
 * (Abweichung von MUSTER 1, Begründung dort): alle Teile sind vorgerendert.
 */
export default async function HadithBuchTeilSeite({ params }: Parameter) {
  const { buch, teil } = await params;
  const daten = await lade(buch, teil);
  if (!daten) notFound();
  return <BuchAnsicht daten={daten} />;
}
