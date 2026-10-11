import { GEBETE, type Gebet, type Tageszeiten } from './typen';

/**
 * Nächstes Gebet und Restzeit – läuft im Browser aus den zwischengespeicherten Tageszeiten (K-08).
 * Reine Funktionen ohne Serverabhängigkeit; Zeitzone nur über Intl (kein Zeitzonen-Paket im Browser, K-12).
 */
const ZONE = 'Europe/Berlin';
const teileFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** Wanduhr-Teile in Europe/Berlin. */
function teile(d: Date) {
  const t = Object.fromEntries(teileFormat.formatToParts(d).map((p) => [p.type, p.value]));
  return { j: +t.year, m: +t.month, t: +t.day, h: +t.hour, min: +t.minute, s: +t.second };
}

/** Abstand Europe/Berlin zu UTC in Millisekunden zum Zeitpunkt `d` (+1 h bzw. +2 h). */
function versatz(d: Date): number {
  const w = teile(d);
  return Date.UTC(w.j, w.m - 1, w.t, w.h, w.min, w.s) - Math.floor(d.getTime() / 1000) * 1000;
}

/** Zeitpunkt aus Kalenderdatum „JJJJ-MM-TT“ und Ortszeit „HH:MM“ in Europe/Berlin (auch an Umstellungstagen). */
export function zeitpunkt(datum: string, zeit: string): Date {
  const [j, m, t] = datum.split('-').map(Number);
  const [h, min] = zeit.split(':').map(Number);
  const alsUtc = Date.UTC(j, m - 1, t, h, min, 0);
  const erster = alsUtc - versatz(new Date(alsUtc));
  // zweiter Schritt: Versatz am Ergebnis prüfen (Zeitumstellung zwischen Schätzung und Ergebnis)
  return new Date(alsUtc - versatz(new Date(erster)));
}

/** Kalenderdatum in Europe/Berlin für einen Zeitpunkt. */
export function berlinerDatum(d: Date): string {
  const w = teile(d);
  return `${w.j}-${String(w.m).padStart(2, '0')}-${String(w.t).padStart(2, '0')}`;
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
