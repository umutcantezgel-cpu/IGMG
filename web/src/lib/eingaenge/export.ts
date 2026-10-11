/**
 * Export der Eingänge (C08, G-07): CSV (UTF-8 mit BOM, Semikolon für Excel in deutscher Einstellung) und JSON.
 * Zellen, die mit = + - @ (oder Tab/CR) beginnen, bekommen ein führendes Apostroph (Schutz vor Formel-Injektion).
 */
export type ExportZeile = {
  id: string;
  art: string;
  status: string;
  sprache: string;
  erstelltAm: string;
  bezug: string;
  daten: Record<string, unknown>;
};

function zelle(wert: unknown): string {
  let t = Array.isArray(wert)
    ? wert.join('; ')
    : wert === null || wert === undefined
      ? ''
      : typeof wert === 'object'
        ? JSON.stringify(wert)
        : String(wert);
  if (/^[=+\-@\t\r]/.test(t)) t = `'${t}`;
  return /[";\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
}

export function alsCsv(zeilen: ExportZeile[]): string {
  const felder = [...new Set(zeilen.flatMap((z) => Object.keys(z.daten)))];
  const kopf = ['id', 'art', 'status', 'sprache', 'eingegangen', 'bezug', ...felder];
  const koerper = zeilen.map((z) =>
    [z.id, z.art, z.status, z.sprache, z.erstelltAm, z.bezug, ...felder.map((f) => z.daten[f])].map(zelle).join(';'),
  );
  return `﻿${[kopf.map(zelle).join(';'), ...koerper].join('\r\n')}\r\n`;
}

export function alsJson(zeilen: ExportZeile[]): string {
  return JSON.stringify(zeilen, null, 2);
}
