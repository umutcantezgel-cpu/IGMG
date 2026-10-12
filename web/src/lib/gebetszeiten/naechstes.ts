import { GEBETE, type Gebet, type Tageszeiten } from './typen';

/**
 * Nächstes Gebet und Restzeit – läuft im Browser aus den zwischengespeicherten Tageszeiten (K-08).
 * Reine Funktionen ohne Serverabhängigkeit und ohne Zeitzonen-Paket im Browser (K-12).
 *
 * Ortszeit Europe/Berlin ohne Intl (H-L01): MEZ (UTC+1), Sommerzeit MESZ (UTC+2) nach der EU-Regel (seit 1996) vom
 * letzten Sonntag im März bis zum letzten Sonntag im Oktober, jeweils 01:00 UTC. Das erste Zeitzonen-Format kostete im
 * Browser auf schwachen Telefonen spürbar Rechenzeit direkt nach dem Laden (Leiste auf jeder Seite, Tagesbogen,
 * „Jetzt geöffnet“). Gleichwertigkeit mit Intl über alle Umstellungen 1996–2040: tests/unit/gebetszeiten/berlin-zeit.test.ts.
 */

/** 01:00 UTC am letzten Sonntag des Monats (Monat 0-basiert). */
function letzterSonntagUtc(jahr: number, monat: number): number {
  const letzterTag = new Date(Date.UTC(jahr, monat + 1, 0));
  return Date.UTC(jahr, monat, letzterTag.getUTCDate() - letzterTag.getUTCDay(), 1);
}

/** Abstand Europe/Berlin zu UTC in Millisekunden zum Zeitpunkt `ms` (+1 h bzw. +2 h). */
function versatzMs(ms: number): number {
  const jahr = new Date(ms).getUTCFullYear();
  return ms >= letzterSonntagUtc(jahr, 2) && ms < letzterSonntagUtc(jahr, 9) ? 7_200_000 : 3_600_000;
}

/** Wanduhr-Teile in Europe/Berlin (Wochentag 0 = Sonntag). */
export function berlinTeile(d: Date) {
  const w = new Date(d.getTime() + versatzMs(d.getTime()));
  return {
    j: w.getUTCFullYear(),
    m: w.getUTCMonth() + 1,
    t: w.getUTCDate(),
    h: w.getUTCHours(),
    min: w.getUTCMinutes(),
    s: w.getUTCSeconds(),
    wochentag: w.getUTCDay(),
  };
}

/** Uhrzeit „HH:MM“ (24 h) in Europe/Berlin. */
export function uhrzeitBerlin(d: Date): string {
  const w = berlinTeile(d);
  return `${String(w.h).padStart(2, '0')}:${String(w.min).padStart(2, '0')}`;
}

/** Abstand Europe/Berlin zu UTC in Millisekunden zum Zeitpunkt `d` (+1 h bzw. +2 h). */
function versatz(d: Date): number {
  return versatzMs(d.getTime());
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
  const w = berlinTeile(d);
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
