import { ExternalLink } from 'lucide-react';
import NextLink from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { sprachHinweis } from '@/components/website/dachverband/DachverbandKarte';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { netzwerkZiel, type NetzwerkSchluessel } from '@/lib/dachverband/netzwerk';

/** Externe Ziele des Blocks „IGMG-Netzwerk“ im Fuß, in dieser Reihenfolge (Plan Marktstart P7). */
export const FUSS_NETZWERK = ['igmg', 'reisen', 'hasene', 'gebetskalender', 'kinderclub'] as const satisfies readonly NetzwerkSchluessel[];

/**
 * Block „IGMG-Netzwerk“ im Fuß (Plan Marktstart P7, K-14): Links zum Dachverband, zu IGMG Reisen, Hasene, dem
 * IGMG-Gebetskalender für Wetzlar und dem Kinderclub, dazu „Mehr über die IGMG“ auf `/igmg`. Nur Links – keine Bilder,
 * keine Anfrage beim Aufruf. Adressen und Zielsprache aus dem Netzwerk-Verzeichnis (`netzwerkZiel`); weicht die Sprache
 * des Ziels von der Seite ab (Rückfall auf Deutsch, Kinderclub nur Türkisch), steht das Sprachkürzel sichtbar am Link,
 * `hrefLang` nennt die Zielsprache und der Linkname den ausgeschriebenen Hinweis (sichtbarer Text vorn, MUSTER §4).
 * Server-Komponente ohne Client-Code (K-12). Überschrift und Linkklasse kommen aus dem Fuß, damit alle Spalten gleich sind.
 */
export async function FussNetzwerk({ ueberschrift, linkKlasse }: { ueberschrift: (titel: string) => ReactNode; linkKlasse: string }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('dachverband');
  const texte = { aufDeutsch: t('aufDeutsch'), aufTuerkisch: t('aufTuerkisch') };
  const titel = t('netzwerk.titel');
  return (
    <nav aria-label={titel} data-fuss="netzwerk" className="flex flex-col gap-3">
      {ueberschrift(titel)}
      {/* Zwei Linkspalten nur, wo die Fußspalte breit genug ist (640–767 px: Fuß einspaltig; ab 1240 px: Fuß dreispaltig).
          Bei 390 px und im zweispaltigen Fuß brächen „IGMG – Dachverband“ und „IGMG-Gebetskalender Wetzlar“ sonst um. */}
      <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 md:grid-cols-1 menu:grid-cols-2">
        {FUSS_NETZWERK.map((schluessel) => {
          const ziel = netzwerkZiel(schluessel, sprache);
          const label = t(`netzwerk.links.${schluessel}`);
          const kuerzel = ziel.rueckfall ? t(`netzwerk.kuerzel.${ziel.zielSprache}`) : undefined;
          const hinweis = sprachHinweis(texte, ziel.zielSprache, sprache);
          const name = kuerzel ? `${label} ${kuerzel}${hinweis ? ` ${hinweis}` : ''}` : label;
          return (
            <li key={schluessel}>
              <a
                href={ziel.href}
                hrefLang={ziel.zielSprache}
                rel="noopener noreferrer"
                aria-label={`${name}: ${t('externeSeite')}`}
                className={`${linkKlasse} gap-x-1.5`}
              >
                <span>{label}</span>
                {kuerzel ? (
                  // inline-block: die Unterstreichung des Links läuft nicht durch das Kürzel
                  <span className="inline-block rounded-sm border border-gruen-100 px-1 text-16 leading-snug font-bold">{kuerzel}</span>
                ) : null}
                <ExternalLink aria-hidden className="size-4 shrink-0 text-gruen-100" />
              </a>
            </li>
          );
        })}
        <li>
          <NextLink href={pfadFuer('/igmg', sprache)} className={linkKlasse}>
            {t('netzwerk.mehr')}
          </NextLink>
        </li>
      </ul>
    </nav>
  );
}
