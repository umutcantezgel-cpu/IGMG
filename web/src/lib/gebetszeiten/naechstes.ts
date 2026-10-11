import { TZDate } from '@date-fns/tz';
import { GEBETE, type Gebet, type Tageszeiten } from './typen';

/**
 * Nächstes Gebet und Restzeit – läuft im Browser aus den zwischengespeicherten Tageszeiten (K-08).
 * Reine Funktionen ohne Serverabhängigkeit.
 */
const ZONE = 'Europe/Berlin';

/** Zeitpunkt aus Kalenderdatum „JJJJ-MM-TT“ und Ortszeit „HH:MM“ in Europe/Berlin. */
export function zeitpunkt(datum: string, zeit: string): Date {
  const [j, m, t] = datum.split('-').map(Number);
  const [h, min] = zeit.split(':').map(Number);
  return new Date(new TZDate(j, m - 1, t, h, min, 0, ZONE).getTime());
}

/** Kalenderdatum in Europe/Berlin für einen Zeitpunkt. */
export function berlinerDatum(d: Date): string {
  const z = new TZDate(d.getTime(), ZONE);
  return `${z.getFullYear()}-${String(z.getMonth() + 1).padStart(2, '0')}-${String(z.getDate()).padStart(2, '0')}`;
}

export type NaechstesGebet = { gebet: Gebet; zeitpunkt: Date; restMs: number; morgen: boolean };

/**
 * Nächstes Gebet ab `jetzt`. Nach Yatsı ist Imsak des Folgetags das nächste Gebet (braucht `morgen`).
 * Der Sonnenaufgang (Güneş) zählt wie im Design als Zeit, nicht als Gebet – er wird übersprungen, wenn `ohneGunes`.
 */
export function naechstesGebet(
  heute: { datum: string; zeiten: Tageszeiten },
  morgen: { datum: string; zeiten: Tageszeiten } | null,
  jetzt: Date,
  ohneGunes = false,
): NaechstesGebet | null {
  for (const g of GEBETE) {
    if (ohneGunes && g === 'gunes') continue;
    const z = zeitpunkt(heute.datum, heute.zeiten[g]);
    if (z.getTime() > jetzt.getTime()) return { gebet: g, zeitpunkt: z, restMs: z.getTime() - jetzt.getTime(), morgen: false };
  }
  if (!morgen) return null;
  const z = zeitpunkt(morgen.datum, morgen.zeiten.imsak);
  return { gebet: 'imsak', zeitpunkt: z, restMs: z.getTime() - jetzt.getTime(), morgen: true };
}

/** Restzeit als Stunden und Minuten (aufgerundet auf volle Minuten). */
export function restzeit(restMs: number): { stunden: number; minuten: number } {
  const minutenGesamt = Math.max(0, Math.ceil(restMs / 60_000));
  return { stunden: Math.floor(minutenGesamt / 60), minuten: minutenGesamt % 60 };
}
