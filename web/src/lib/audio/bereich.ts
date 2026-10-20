/**
 * Byte-Bereiche der Audio-Routen (ADR 0029, ADR 0039 Fortschreibung S5): rein und ohne Dateizugriff, damit Routen, die nur
 * den Bereich brauchen (`/lern-app/audio/[...pfad]`), `speicher.ts` mit seinem dynamischen Dateizugriff nicht in ihre
 * Ablaufverfolgung ziehen (sonst verfolgt der Bau das ganze Projekt).
 */

/** Byte-Bereich aus `Range: bytes=a-b` (nur ein Bereich); null = ganze Datei, 'ungueltig' = 416. */
export function leseBereich(kopf: string | null, groesse: number): { start: number; ende: number } | null | 'ungueltig' {
  if (!kopf) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(kopf.trim());
  if (!m || (m[1] === '' && m[2] === '')) return 'ungueltig';
  let start: number;
  let ende: number;
  if (m[1] === '') {
    // Suffix: die letzten n Byte
    start = Math.max(0, groesse - Number(m[2]));
    ende = groesse - 1;
  } else {
    start = Number(m[1]);
    ende = m[2] === '' ? groesse - 1 : Math.min(Number(m[2]), groesse - 1);
  }
  if (start >= groesse || start > ende) return 'ungueltig';
  return { start, ende };
}
