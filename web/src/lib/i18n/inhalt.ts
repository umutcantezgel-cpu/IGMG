import type { Mehrsprachig } from '@/lib/db/schema/typen';

/** Sprachen der Website (K-02). */
export const SPRACHEN = ['de', 'tr', 'en'] as const;
export type Sprache = (typeof SPRACHEN)[number];

/**
 * Wählt den Text in der gewünschten Sprache; fehlt er, sichtbarer Rückfall auf Deutsch (K-02, ADR 0002).
 * `rueckfall` → Komponenten setzen lang="de" am Element und zeigen den Hinweis „Nur auf Deutsch verfügbar“.
 */
export function waehle(feld: Mehrsprachig | null | undefined, sprache: Sprache): { text: string; sprache: Sprache; rueckfall: boolean } {
  if (!feld) return { text: '', sprache: 'de', rueckfall: sprache !== 'de' };
  const wert = sprache === 'de' ? feld.de : feld[sprache];
  if (wert && wert.trim()) return { text: wert, sprache, rueckfall: false };
  return { text: feld.de ?? '', sprache: 'de', rueckfall: sprache !== 'de' };
}

/** Kurzform: nur der Text. */
export function text(feld: Mehrsprachig | null | undefined, sprache: Sprache): string {
  return waehle(feld, sprache).text;
}

/** Entfernt leere Sprachfassungen vor dem Speichern (ADR 0002). */
export function bereinige(feld: Mehrsprachig): Mehrsprachig {
  const aus: Mehrsprachig = { de: feld.de.trim() };
  if (feld.tr?.trim()) aus.tr = feld.tr.trim();
  if (feld.en?.trim()) aus.en = feld.en.trim();
  return aus;
}
