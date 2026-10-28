import { NETZWERK } from '@/lib/dachverband/netzwerk';
import type { GebetszeitenMonat } from '@/server/queries/gebetszeiten';
import { GEBETE, type Tageszeiten, type Zeitquelle } from './typen';

/**
 * Lese-API `/api/gebetszeiten/<JJJJ-MM>` (ADR 0048): öffentliche Monatsdaten als JSON für Widgets, den Moschee-Bildschirm
 * und eine spätere App. Reine Hilfen für die Route: erlaubte Monate (±12 Monate um heute, sonst 404 – kein Fluten des
 * Caches), vorgerenderte Monate (Vormonat bis +12) und der Aufbau der Antwort mit Quelle und Stand.
 */
const MONAT = /^(\d{4})-(0[1-9]|1[0-2])$/;
export const API_SPANNE_MONATE = 12;

export function monatPlus(jahrMonat: string, n: number): string {
  const [j, m] = jahrMonat.split('-').map(Number);
  const d = new Date(Date.UTC(j, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Vorgerenderte Monate: Vormonat bis zwölf Monate voraus. */
export function vorgerenderteMonate(heute: string): string[] {
  const jetzt = heute.slice(0, 7);
  return Array.from({ length: API_SPANNE_MONATE + 2 }, (_, i) => monatPlus(jetzt, i - 1));
}

/** Gültiges Format und höchstens zwölf Monate vor oder nach dem laufenden Monat. */
export function monatErlaubt(monat: string, heute: string): boolean {
  if (!MONAT.test(monat)) return false;
  const jetzt = heute.slice(0, 7);
  return monat >= monatPlus(jetzt, -API_SPANNE_MONATE) && monat <= monatPlus(jetzt, API_SPANNE_MONATE);
}

export type ApiTag = Tageszeiten & { datum: string; quelle: Zeitquelle };
export type ApiAntwort = {
  monat: string;
  ort: string;
  zeitzone: 'Europe/Berlin';
  quelle: GebetszeitenMonat['quelle'];
  /** Stand der IGMG-Zeiten (JJJJ-MM-TT) oder null */
  stand: string | null;
  /** Gerechnete Tage sind vorläufig, solange die Gemeinde die Zeiten nicht bestätigt hat */
  bestaetigt: boolean;
  /** Herkunft der Tage mit Quelle „igmg“ */
  quellenangabe: { name: string; url: string } | null;
  tage: ApiTag[];
};

export function apiAntwort(daten: GebetszeitenMonat, ort: string): ApiAntwort {
  const mitIgmg = daten.tage.some((t) => t.quelle === 'igmg');
  return {
    monat: daten.monat,
    ort,
    zeitzone: 'Europe/Berlin',
    quelle: daten.quelle,
    stand: daten.stand,
    bestaetigt: daten.bestaetigt,
    quellenangabe: mitIgmg ? { name: 'IGMG-Gebetskalender', url: NETZWERK.gebetskalender.url.de } : null,
    tage: daten.tage.map((t) => ({ datum: t.datum, ...Object.fromEntries(GEBETE.map((g) => [g, t[g]])), quelle: t.quelle }) as ApiTag),
  };
}

/** Kopfzeilen: öffentlich lesbar von jeder Herkunft (nur GET, ohne Cookies), fünf Minuten im Browser. */
export const API_KOPFZEILEN = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'public, max-age=300',
} as const;
