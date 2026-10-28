/**
 * Indexierungs-Schranke (Nutzerentscheidung E-044 Nr. 6, ADR 0049): Solange der Konzept-Hinweis „Alle angezeigten Daten
 * sind fiktiv“ eingeschaltet ist, gehört die Live-Website nicht in Suchmaschinen und Antwortmaschinen. Sie bekommt dann
 * `noindex, follow` (Layout) und `/llms.txt` antwortet mit 404. Sobald der Hinweis aus ist (Seed oder Verwaltung), wird
 * sie ohne weiteren Eingriff indexierbar. Nur auf Vercel (`VERCEL=1`): Lokal, in E2E-Läufen und bei Lighthouse
 * (`pnpm messen`) fehlt die Variable, dort bleiben Metadaten und Messwerte unberührt. `robots.txt` sperrt bewusst nichts
 * zusätzlich – sonst sähe der Crawler das `noindex` nie.
 */
import type { UmgebungsWerte } from '@/lib/umgebung';

/** robots-Angabe für Seiten außerhalb des Index; Links bleiben verfolgbar. */
export const NOINDEX = { index: false, follow: true } as const;

/** Ob die Schranke greift: Konzept-Hinweis eingeschaltet (Einstellung „allgemein“) und Betrieb auf Vercel. */
export function indexierungGesperrt(konzepthinweis: boolean, env: UmgebungsWerte = process.env): boolean {
  return konzepthinweis && env.VERCEL === '1';
}
