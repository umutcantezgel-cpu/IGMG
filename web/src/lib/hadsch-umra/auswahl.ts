import type { Locale } from '@/i18n/routing';
import { netzwerkZiel } from '@/lib/dachverband/netzwerk';
import type { Abflug, AbflugArt, HadschUmraZiel, Hinweis } from '@/lib/validierung/seiteninhalte/hadsch-umra';

/**
 * Auswahl für die Seite „Hadsch & Umra“ (Plan Marktstart P4): reine Funktionen ohne Datenbank und ohne Uhr – der Tag kommt
 * als Kalendertag JJJJ-MM-TT aus `heuteBerlin()` (statische Seite, stündlich neu). Vergleiche als Text genügen, weil alle
 * Daten im Format JJJJ-MM-TT vorliegen.
 */

/** Hinweise, deren letzter Tag `bis` noch nicht vorbei ist (inklusive heute), nach Frist sortiert. */
export function aktuelleHinweise<H extends Pick<Hinweis, 'bis'>>(hinweise: readonly H[], heute: string): H[] {
  return hinweise.filter((h) => h.bis >= heute).sort((a, b) => a.bis.localeCompare(b.bis));
}

/** Abflüge, deren Abflugtag heute oder später ist (vergangene Abflüge entfallen), nach Abflug sortiert. */
export function kommendeAbfluege<A extends Pick<Abflug, 'hin'>>(abfluege: readonly A[], heute: string): A[] {
  return abfluege.filter((a) => a.hin >= heute).sort((a, b) => a.hin.localeCompare(b.hin));
}

/** Kommende Abflüge je Art (Hadsch zuerst); Arten ohne Abflug entfallen. */
export function abfluegeNachArt(abfluege: readonly Abflug[], heute: string): { art: AbflugArt; eintraege: Abflug[] }[] {
  const kommend = kommendeAbfluege(abfluege, heute);
  return (['hadsch', 'umra'] as const)
    .map((art) => ({ art, eintraege: kommend.filter((a) => a.art === art) }))
    .filter((g) => g.eintraege.length > 0);
}

/** Linkziel für eine Seitensprache: Adresse (Rückfall auf die deutsche), Sprache des Ziels und ob sie abweicht. */
export function zielFuer(ziel: HadschUmraZiel, sprache: Locale): { href: string; zielSprache: Locale; rueckfall: boolean } {
  if (typeof ziel === 'string') return netzwerkZiel(ziel, sprache);
  // Die Hauptadresse `de` hat die Sprache `seitenSprache` (Standard Deutsch); tr/en sind eigene Fassungen
  const eigene = sprache === 'de' ? undefined : ziel[sprache];
  const zielSprache = eigene ? sprache : (ziel.seitenSprache ?? 'de');
  return { href: eigene ?? ziel.de, zielSprache, rueckfall: zielSprache !== sprache };
}

/** Flughafen-Codes einer Angabe („DUS/FRA“ → [„DUS“, „FRA“]); leer ohne Angabe. */
export function flughaefen(angabe: string | undefined): string[] {
  return angabe ? angabe.split('/').filter(Boolean) : [];
}
