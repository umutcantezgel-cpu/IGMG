import type { BereichsSeed } from './typ';

/**
 * Seed „nachrichten-mehr“ (Welle A, Paket A01). Alle Beiträge aus dem Bestand stehen bereits in
 * daten/nachrichten.ts: News.tsx 6 von 6 und NewsSection.tsx 4 von 4 (geprüft nach Titel und Slug). Dieser Seed
 * ergänzt deshalb nichts und liefert 0. Er bleibt idempotent und ohne Personendaten (G-04).
 */
export const seed: BereichsSeed = async () => 0;
