import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { waehle, type Sprache } from '@/lib/i18n/inhalt';
import { ohnePlatzhalter } from '@/lib/inhalt/platzhalter';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';

/** Gebietsschema je Sprache für Zahlen und Beträge: Deutsch und Türkisch „1.200“, Englisch „1,200“ (wie im Bestand). */
const GEBIET: Record<Sprache, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/**
 * True, wenn ein angezeigtes Feld nur deutsch vorliegt; dann zeigt die Seite den Hinweis „Nur auf Deutsch verfügbar“ (K-02).
 * Felder, von denen ohne die Platzhalter „[…]“ nichts bleibt, erscheinen nicht und zählen darum nicht.
 */
export function brauchtRueckfall(sprache: Sprache, felder: (Mehrsprachig | null | undefined)[]): boolean {
  return felder.some((feld) => {
    const w = waehle(feld, sprache);
    return w.rueckfall && ohnePlatzhalter(w.text) !== '';
  });
}

/** Meilensteine, die öffentlich erscheinen: nur solche mit Titel (ein Titel, der nur Platzhalter ist, zählt nicht). */
export function sichtbareMeilensteine(inhalt: ProjekteInhalt, sprache: Sprache): ProjekteInhalt['meilensteine'] {
  return inhalt.meilensteine.filter((m) => ohnePlatzhalter(waehle(m.titel, sprache).text) !== '');
}

/** Ganze Zahl mit Tausendertrennzeichen in der Sprache der Seite. */
export function zahl(wert: number, sprache: Sprache): string {
  return new Intl.NumberFormat(GEBIET[sprache]).format(wert);
}

/** Euro-Betrag ohne Nachkommastellen (450.000 € in Deutsch, €450,000 in Englisch). */
export function betrag(wert: number, sprache: Sprache): string {
  return new Intl.NumberFormat(GEBIET[sprache], { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(wert);
}

/**
 * Fortschritt in ganzen Prozent (0–100) aus gesammeltem Betrag und Ziel. Liefert null, solange einer der beiden Werte
 * fehlt: Dann wird kein Prozentwert angezeigt (G-05, Beträge sind Fakten der Gemeinde).
 */
export function fortschritt(gesammelt: number | null, ziel: number | null): number | null {
  if (gesammelt === null || ziel === null || ziel <= 0) return null;
  return Math.min(100, Math.max(0, Math.round((gesammelt / ziel) * 100)));
}
