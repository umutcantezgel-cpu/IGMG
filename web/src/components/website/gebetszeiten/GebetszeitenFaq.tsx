import { getLocale, getTranslations } from 'next-intl/server';
import { FaqAnsicht } from '@/components/website/bloecke/TextBloecke';
import type { Locale } from '@/i18n/routing';

/** Fragen der Gebetszeiten-Seite in fester Reihenfolge (Texte: `gebetszeitenFaq.<schluessel>.frage|antwort`). */
export const GEBETSZEITEN_FAQ = ['quelle', 'vorlaeufig', 'offiziell', 'anzeige'] as const;

/**
 * Fragen und Antworten in der Sprache der Seite (ADR 0048) – für die sichtbare Liste und für strukturierte Daten
 * (FAQPage, P8). Die erste Frage ist „Woher stammen die Gebetszeiten?“.
 */
export async function gebetszeitenFaq(sprache?: Locale): Promise<{ titel: string; eintraege: { frage: string; antwort: string }[] }> {
  const t = await getTranslations({ locale: sprache ?? ((await getLocale()) as Locale), namespace: 'gebetszeitenFaq' });
  return { titel: t('titel'), eintraege: GEBETSZEITEN_FAQ.map((s) => ({ frage: t(`${s}.frage`), antwort: t(`${s}.antwort`) })) };
}

/** Sichtbare Fragen unter der Seite: Baustein „Fragen und Antworten“ (native Aufklapper, ohne JavaScript). */
export async function GebetszeitenFaq() {
  const sprache = (await getLocale()) as Locale;
  const faq = await gebetszeitenFaq(sprache);
  // Texte stehen schon in der Seitensprache; als Deutsch und als Seitensprache eingetragen, damit kein Rückfall-Hinweis entsteht
  const text = (wert: string) => ({ de: wert, [sprache]: wert });
  return (
    <FaqAnsicht
      sprache={sprache}
      b={{
        typ: 'faq',
        id: 'gebetszeiten-faq',
        titel: text(faq.titel),
        eintraege: faq.eintraege.map((e) => ({ frage: text(e.frage), antwort: text(e.antwort) })),
      }}
    />
  );
}
