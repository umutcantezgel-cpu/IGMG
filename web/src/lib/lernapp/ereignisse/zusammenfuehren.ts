import { vergleicheBewertungen } from '../srs';
import type { Ereignis } from './typen';

/**
 * Zusammenführung (ADR 0038 Nr. 4): Ereignisse werden über (benutzer bzw. profil, geraet, seq) vereinigt – idempotent,
 * kommutativ, assoziativ. Die Funktion arbeitet innerhalb eines Profils bzw. Kontos; der Aufrufer trennt nach Profil.
 *
 * Gleicher Schlüssel mit anderem Inhalt darf nicht vorkommen (ein Gerät vergibt jede Nummer einmal). Kommt es doch vor,
 * gewinnt deterministisch die kanonisch kleinere Fassung; so bleibt die Vereinigung ein Halbverband.
 */

export const ereignisSchluessel = (e: Pick<Ereignis, 'geraet' | 'seq'>): string => `${e.geraet}#${e.seq}`;

/** Reihenfolge der Ereignisse: Zeit, Gerät, Nummer (dieselbe Ordnung wie beim Nachspielen der Karten). */
export const vergleicheEreignisse = (a: Pick<Ereignis, 'am' | 'geraet' | 'seq'>, b: Pick<Ereignis, 'am' | 'geraet' | 'seq'>): number =>
  vergleicheBewertungen(a, b);

/** JSON mit sortierten Schlüsseln (stabil für Vergleich und Hash). */
export function kanonisch(wert: unknown): string {
  if (wert === null || typeof wert !== 'object') return JSON.stringify(wert) ?? 'null';
  if (Array.isArray(wert)) return `[${wert.map(kanonisch).join(',')}]`;
  const eintraege = Object.entries(wert as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${eintraege.map(([k, v]) => `${JSON.stringify(k)}:${kanonisch(v)}`).join(',')}}`;
}

/** Vereinigung beliebig vieler Listen; Ergebnis ohne Doppelte, sortiert nach `vergleicheEreignisse`. */
export function vereinige(...listen: ReadonlyArray<readonly Ereignis[]>): Ereignis[] {
  const nachSchluessel = new Map<string, { e: Ereignis; k: string }>();
  for (const liste of listen) {
    for (const e of liste) {
      const s = ereignisSchluessel(e);
      const k = kanonisch(e);
      const vorhanden = nachSchluessel.get(s);
      if (!vorhanden || k < vorhanden.k) nachSchluessel.set(s, { e, k });
    }
  }
  return [...nachSchluessel.values()]
    .sort((a, b) => vergleicheEreignisse(a.e, b.e) || (a.k < b.k ? -1 : a.k > b.k ? 1 : 0))
    .map((x) => x.e);
}

/** Ereignisse aus `eingang`, deren Schlüssel in `vorhanden` fehlt (für das Übernehmen beim Abgleich). */
export function fehlende(vorhanden: readonly Pick<Ereignis, 'geraet' | 'seq'>[], eingang: readonly Ereignis[]): Ereignis[] {
  const bekannt = new Set(vorhanden.map(ereignisSchluessel));
  return eingang.filter((e) => !bekannt.has(ereignisSchluessel(e)));
}
