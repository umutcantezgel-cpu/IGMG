import { createHash } from 'node:crypto';

/**
 * Hash-Kette des Moderationsprotokolls (S-10): Jede Zeile trägt SHA-256(Vorgänger-Hash ‖ Inhalt). Eine nachträgliche
 * Änderung oder Lücke fällt bei der Prüfung auf (Cockpit). Der erste Vorgänger ist „0“ × 64.
 */
export const KETTEN_ANFANG = '0'.repeat(64);

export type ProtokollInhalt = {
  zeitpunkt: string;
  kanalId: string | null;
  nachrichtId: number | null;
  akteurId: string | null;
  aktion: string;
  grund: string;
};

export function kettenHash(vorgaenger: string, e: ProtokollInhalt): string {
  const inhalt = JSON.stringify([e.zeitpunkt, e.kanalId, e.nachrichtId, e.akteurId, e.aktion, e.grund]);
  return createHash('sha256').update(`${vorgaenger}|${inhalt}`, 'utf8').digest('hex');
}

/**
 * Prüft eine Kette in ID-Reihenfolge; liefert die erste fehlerhafte Position oder null. `anfang` ist nach einem
 * Löschlauf (Frist 3 Jahre, D-04) der Hash des zuletzt gelöschten Eintrags, sonst „0“ × 64.
 */
export function pruefeKette(
  zeilen: readonly (ProtokollInhalt & { vorgaengerHash: string; hash: string })[],
  anfang: string = KETTEN_ANFANG,
): number | null {
  let vorher = anfang;
  for (let i = 0; i < zeilen.length; i++) {
    const z = zeilen[i];
    if (z.vorgaengerHash !== vorher || kettenHash(z.vorgaengerHash, z) !== z.hash) return i;
    vorher = z.hash;
  }
  return null;
}
