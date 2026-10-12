import 'server-only';
import { EINGANG_PRAEFIX } from './direkt';

/** Direkt-Upload ist nur mit Vercel Blob aktiv (ADR 0020); lokal und mit S3 bleibt der Weg über die Server Action. */
export function direktUploadAktiv(): boolean {
  return process.env.SPEICHER === 'blob';
}

const AUFBEWAHRUNG_MS = 24 * 3_600_000;

/**
 * Räumt Eingänge auf, die nie übernommen wurden (Formular abgebrochen), älter als 24 Stunden. Teil des täglichen
 * Löschlaufs; ohne Vercel Blob nichts zu tun. Höchstens `budgetMs` lang: Danach bricht der Abbruch die Anfragen ab
 * (auch die Wiederholungen des SDK), damit eine Störung des Speichers den Löschlauf nicht aufhält. Gibt die Anzahl
 * entfernter Dateien zurück.
 */
export async function raeumeDirektEingaengeAuf(jetzt = new Date(), budgetMs = 20_000): Promise<number> {
  if (!direktUploadAktiv()) return 0;
  const { del, list } = await import('@vercel/blob');
  const abbruch = new AbortController();
  const uhr = setTimeout(() => abbruch.abort(), budgetMs);
  const grenze = jetzt.getTime() - AUFBEWAHRUNG_MS;
  let cursor: string | undefined;
  let weg = 0;
  try {
    do {
      const seite = await list({ prefix: EINGANG_PRAEFIX, cursor, limit: 1000, abortSignal: abbruch.signal });
      const alt = seite.blobs.filter((b) => new Date(b.uploadedAt).getTime() < grenze).map((b) => b.pathname);
      if (alt.length) {
        await del(alt, { abortSignal: abbruch.signal });
        weg += alt.length;
      }
      cursor = seite.hasMore ? seite.cursor : undefined;
    } while (cursor);
  } finally {
    clearTimeout(uhr);
  }
  return weg;
}
