import type { WortDaten, ZeitenDaten } from '@/server/queries/quran';

/**
 * Statische JSON-Daten des Lesers (nur im Browser, lazy): Wortdaten je Sure und Zeiten je Rezitation. Jede Adresse
 * wird einmal geladen und dann aus dem Speicher der Seite bedient.
 */
const geladen = new Map<string, Promise<unknown>>();

function json<T>(url: string): Promise<T> {
  let p = geladen.get(url) as Promise<T> | undefined;
  if (!p) {
    p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<T>;
    });
    p.catch(() => geladen.delete(url));
    geladen.set(url, p);
  }
  return p;
}

export const ladeWoerter = (url: string) => json<WortDaten>(url);
export const ladeZeitenJson = (url: string) => json<ZeitenDaten>(url);
export const ladeAusgabeJson = (url: string) =>
  json<{ ausgabe: { id: string; sprache: string; titel: string; uebersetzer: string; ausstehend: boolean }; verse: [number, string][] }>(url);
