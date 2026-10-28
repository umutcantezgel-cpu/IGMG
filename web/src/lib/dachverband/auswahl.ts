import type { Locale } from '@/i18n/routing';
import type { DachverbandArt, DachverbandEintrag } from '@/lib/validierung/seiteninhalte/dachverband';
import { NETZWERK, NETZWERK_SCHLUESSEL, netzwerkZiel } from './netzwerk';

/**
 * Auswahl der Einträge „Aus dem Dachverband“ (Plan Marktstart P3): reine Funktionen ohne Datenbank und ohne Uhr – das
 * heutige Datum (Europe/Berlin, JJJJ-MM-TT) gibt der Aufrufer mit (statische Seiten: `heuteBerlin()`).
 */

/** Kürzel der vier Organisationen (Enum `organisation`, D-06). */
export type OrganisationKuerzel = 'at' | 'kt' | 'gt' | 'kgt';

/**
 * Art je Organisation: Frauenorganisation → KT, Jugendorganisation → GT, Frauenjugendorganisation → KGT. Die AT hat keine
 * eigene Art beim Dachverband; ihre Seite zeigt deshalb keinen Abschnitt.
 */
export const ART_DER_ORGANISATION: Record<OrganisationKuerzel, DachverbandArt | null> = {
  at: null,
  kt: 'frauen',
  gt: 'jugend',
  kgt: 'frauenjugend',
};

/** Ist der Eintrag am Tag `heute` noch gültig? `gueltigBis` zählt einschließlich. */
export function giltNoch(eintrag: Pick<DachverbandEintrag, 'gueltigBis'>, heute: string): boolean {
  return !eintrag.gueltigBis || eintrag.gueltigBis >= heute;
}

/**
 * Sichtbare Einträge (Schalter „sichtbar“ an, nicht abgelaufen), neueste zuerst. Ein Monat (JJJJ-MM) zählt wie der
 * Monatsanfang; bei gleichem Datum bleibt die gespeicherte Reihenfolge.
 */
export function sichtbareEintraege(eintraege: readonly DachverbandEintrag[], heute: string): DachverbandEintrag[] {
  return eintraege
    .map((e, i) => ({ e, i }))
    .filter(({ e }) => e.sichtbar && giltNoch(e, heute))
    .sort((a, b) => (a.e.datum === b.e.datum ? a.i - b.i : a.e.datum < b.e.datum ? 1 : -1))
    .map(({ e }) => e);
}

/** Neueste sichtbare Freitagspredigt oder `null`. */
export function neuesteHutba(eintraege: readonly DachverbandEintrag[], heute: string): DachverbandEintrag | null {
  return sichtbareEintraege(eintraege, heute).find((e) => e.art === 'hutba') ?? null;
}

/** Sichtbare Gemeinschaftsthemen (alle Arten außer Hutba), neueste zuerst, höchstens `anzahl`. */
export function gemeinschaftsthemen(eintraege: readonly DachverbandEintrag[], heute: string, anzahl: number): DachverbandEintrag[] {
  return sichtbareEintraege(eintraege, heute)
    .filter((e) => e.art !== 'hutba')
    .slice(0, anzahl);
}

/** Sichtbare Einträge für eine Organisationsseite (leer bei der AT oder ohne passende Einträge). */
export function fuerOrganisation(
  eintraege: readonly DachverbandEintrag[],
  kuerzel: OrganisationKuerzel,
  heute: string,
): DachverbandEintrag[] {
  const art = ART_DER_ORGANISATION[kuerzel];
  return art ? sichtbareEintraege(eintraege, heute).filter((e) => e.art === art) : [];
}

/**
 * Linkziel für eine Seitensprache: eigene Fassung (`urlTr`, `urlEn`), sonst – wenn die Adresse ein Ziel des IGMG-Netzwerks
 * ist – dessen Sprachen (z. B. Begleiter mit Material in drei Sprachen), sonst die deutsche Seite mit Rückfall-Hinweis.
 */
export function linkFuer(
  eintrag: Pick<DachverbandEintrag, 'url' | 'urlTr' | 'urlEn'>,
  sprache: Locale,
): { href: string; zielSprache: Locale; rueckfall: boolean } {
  const eigene = sprache === 'tr' ? eintrag.urlTr : sprache === 'en' ? eintrag.urlEn : undefined;
  if (eigene) return { href: eigene, zielSprache: sprache, rueckfall: false };
  const netz = NETZWERK_SCHLUESSEL.find((k) => NETZWERK[k].url.de === eintrag.url);
  if (netz) return netzwerkZiel(netz, sprache);
  return { href: eintrag.url, zielSprache: 'de', rueckfall: sprache !== 'de' };
}

/** Kalendertag + n Tage (JJJJ-MM-TT, ohne Zeitzone). */
export function tagPlus(datum: string, n: number): string {
  const [j, m, t] = datum.split('-').map(Number);
  return new Date(Date.UTC(j, m - 1, t + n)).toISOString().slice(0, 10);
}

/** Freitag am oder nach dem Kalendertag (JJJJ-MM-TT): Datum der Freitagspredigt einer Woche. */
export function freitagAb(datum: string): string {
  const [j, m, t] = datum.split('-').map(Number);
  const wochentag = new Date(Date.UTC(j, m - 1, t)).getUTCDay();
  return tagPlus(datum, (5 - wochentag + 7) % 7);
}

const LOCALE: Record<Locale, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/** Datum für die Anzeige: Tag „23. Oktober 2026“ bzw. Monat „Januar 2026“ (Mittag UTC hält den Kalendertag stabil). */
export function datumAnzeige(datum: string, sprache: Locale): string {
  const tag = datum.length === 10;
  const zeitpunkt = new Date(`${tag ? datum : `${datum}-15`}T12:00:00Z`);
  return new Intl.DateTimeFormat(LOCALE[sprache], {
    timeZone: 'Europe/Berlin',
    ...(tag ? { day: 'numeric' } : {}),
    month: 'long',
    year: 'numeric',
  }).format(zeitpunkt);
}
