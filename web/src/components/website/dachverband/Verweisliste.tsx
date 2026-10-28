import { ExternalLink } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { netzwerkZiel, type NetzwerkSchluessel } from '@/lib/dachverband/netzwerk';
import { waehle } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { Verweis } from '@/lib/validierung/url';

/** Ein Eintrag: Schlüssel aus dem IGMG-Netzwerk (Texte aus `dachverband.ziele`) oder ein gepflegter Verweis (Seiteninhalt). */
export type VerweisEintrag = NetzwerkSchluessel | Verweis;

type Zeile = {
  schluessel: string;
  href: string;
  zielSprache: Locale;
  titel: { text: string; lang?: 'de' };
  beschreibung?: { text: string; lang?: 'de' };
};

const istNetzwerk = (e: VerweisEintrag): e is NetzwerkSchluessel => typeof e === 'string';

/**
 * Liste externer Verweise zum Dachverband (Plan Marktstart, K-14): nur Links, keine Bilder, keine Anfragen beim Aufruf.
 * Server-Komponente ohne Client-JavaScript (K-12). Jeder Link nennt die Sprache des Ziels (`hrefLang`); weicht sie von der
 * Seitensprache ab, steht der Hinweis sichtbar daneben („(auf Deutsch)“, „(auf Türkisch)“). Linkname mit Kontext nach
 * MUSTER §4 (sichtbarer Text vorn), Klickziel 48 px. Gepflegte Verweise fallen je Feld sichtbar auf Deutsch zurück (K-02).
 */
export async function Verweisliste({
  eintraege,
  mitBeschreibung = true,
  className,
}: {
  eintraege: readonly VerweisEintrag[];
  mitBeschreibung?: boolean;
  className?: string;
}) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('dachverband');
  const hinweis: Partial<Record<Locale, string>> = { de: t('aufDeutsch'), tr: t('aufTuerkisch') };

  const zeilen: Zeile[] = eintraege.map((e, i) => {
    if (istNetzwerk(e)) {
      const ziel = netzwerkZiel(e, sprache);
      return {
        schluessel: e,
        href: ziel.href,
        zielSprache: ziel.zielSprache,
        titel: { text: t(`ziele.${e}.titel`) },
        beschreibung: { text: t(`ziele.${e}.beschreibung`) },
      };
    }
    const titel = waehle(e.titel, sprache);
    const beschreibung = e.beschreibung ? waehle(e.beschreibung, sprache) : undefined;
    const eigene = e.url[sprache];
    return {
      schluessel: `verweis-${i}`,
      href: eigene ?? e.url.de,
      // Ohne eigene Adresse gilt die deutsche Seite
      zielSprache: eigene ? sprache : 'de',
      titel: { text: titel.text, ...(titel.rueckfall ? { lang: 'de' as const } : {}) },
      ...(beschreibung?.text
        ? { beschreibung: { text: beschreibung.text, ...(beschreibung.rueckfall ? { lang: 'de' as const } : {}) } }
        : {}),
    };
  });

  return (
    <ul className={cn('flex flex-col', className)}>
      {zeilen.map((z) => {
        const sprachHinweis = z.zielSprache !== sprache ? hinweis[z.zielSprache] : undefined;
        const sichtbar = sprachHinweis ? `${z.titel.text} ${sprachHinweis}` : z.titel.text;
        return (
          <li key={z.schluessel} className="flex min-w-0 flex-col border-t border-linie py-2">
            <a
              href={z.href}
              hrefLang={z.zielSprache}
              rel="noopener noreferrer"
              aria-label={`${sichtbar}: ${t('externeSeite')}`}
              className="inline-flex min-h-12 flex-wrap items-center gap-x-2 self-start font-bold text-gruen-700 underline underline-offset-3 transition duration-(--dauer-rueckmeldung) hover:decoration-2"
            >
              <span lang={z.titel.lang}>{z.titel.text}</span>
              {sprachHinweis ? <span className="font-normal text-tinte-2">{sprachHinweis}</span> : null}
              <ExternalLink aria-hidden className="size-4 shrink-0" />
            </a>
            {mitBeschreibung && z.beschreibung ? (
              <p lang={z.beschreibung.lang} className="max-w-text text-16 text-tinte-2">
                {z.beschreibung.text}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
