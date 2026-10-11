import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { waehle, type Sprache } from '@/lib/i18n/inhalt';

/** Gebietsschema je Sprache für Zahlen und Beträge: Deutsch und Türkisch „1.200“, Englisch „1,200“ (wie im Bestand). */
const GEBIET: Record<Sprache, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/** True, wenn ein angezeigtes Feld nur deutsch vorliegt; dann zeigt die Seite den Hinweis „Nur auf Deutsch verfügbar“ (K-02). */
export function brauchtRueckfall(sprache: Sprache, felder: (Mehrsprachig | null | undefined)[]): boolean {
  return felder.some((feld) => {
    const w = waehle(feld, sprache);
    return w.rueckfall && w.text !== '';
  });
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
