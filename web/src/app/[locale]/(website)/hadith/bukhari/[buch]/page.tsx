import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { BuchAnsicht } from '@/components/website/hadith/BuchAnsicht';
import { funktionAn } from '@/lib/funktionen';
import { buchNummer } from '@/lib/hadith/anzeige';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeHadithBuch, ladeHadithBuchNummern } from '@/server/queries/hadith';

export const ensureStatic = 'navigation';

type Parameter = { params: Promise<{ locale: string; buch: string }> };

/**
 * Beim Bau alle Bücher – aber nur mit eingeschaltetem Schalter `hadith_gesamt` (Umgebung, sonst Einstellung). Aus
 * (Produktion bis MN-06) oder ohne Import: nur der Platzhalter „_“, jede Buchadresse antwortet mit 404.
 */
export async function generateStaticParams() {
  const nummern = (await funktionAn('hadith_gesamt')) ? await ladeHadithBuchNummern() : [];
  return (nummern.length ? nummern.map(String) : ['_']).map((buch) => ({ buch }));
}

async function lade(roh: string) {
  const nr = buchNummer(roh);
  if (nr === null || !(await funktionAn('hadith_gesamt'))) return null;
  return ladeHadithBuch(nr);
}

export async function generateMetadata({ params }: Parameter): Promise<Metadata> {
  const { buch } = await params;
  const daten = await lade(buch);
  if (!daten) return {};
  const t = await getTranslations('hadith.buch');
  return metadatenFuer({
    pfad: { pathname: '/hadith/bukhari/[buch]', params: { buch: String(daten.buch.nr) } },
    titel: t('metaTitel', { titel: daten.buch.titelEn, nr: daten.buch.nr }),
    beschreibung: t('untertitel', { anzahl: daten.buch.anzahl }),
  });
}

/**
 * Buchseite /hadith/bukhari/[buch] = Teil 1 (AUFTRAG 3.3). Wie der Koran-Leser ohne umschließendes `<Suspense>`
 * (Abweichung von MUSTER 1, Z-08, N1): Alle Bücher sind vorgerendert (generateStaticParams, `ensureStatic =
 * 'navigation'`), andere Werte enden in notFound(). In einem Suspense-Rahmen lieferte React die ganze Seite ausgelagert
 * (`<div hidden>` mit `$RC`) und deckte sie gedrosselt auf (LCP).
 */
export default async function HadithBuchSeite({ params }: Parameter) {
  const { buch } = await params;
  const daten = await lade(buch);
  if (!daten) notFound();
  return <BuchAnsicht daten={daten} />;
}
