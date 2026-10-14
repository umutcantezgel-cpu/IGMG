/**
 * Ob ein Datenzugriff möglich ist (ohne Verbindungsaufbau): mit DATABASE_URL, in Entwicklung und Tests (PGlite) und
 * beim Bau mit BAU_PGLITE=1 (ADR 0017). Nein nur zur Laufzeit des Beispielmodus (Vercel ohne Datenbank, ADR 0019) –
 * dort würde jeder Zugriff über `db` mit „DATABASE_URL fehlt“ scheitern. Ohne `server-only`, damit auch reine
 * Hilfsmodule (lib/seo/og-bild.tsx) es nutzen können.
 */
export function datenbankVerfuegbar(): boolean {
  return Boolean(process.env.DATABASE_URL) || process.env.NODE_ENV !== 'production' || process.env.BAU_PGLITE === '1';
}

/**
 * Beispielmodus auf Vercel (ADR 0019) – beim Bau (VERCEL=1 mit BAU_PGLITE=1, wie in next.config.ts) und zur Laufzeit
 * ohne Datenbank. Vorgerenderte Seiten blenden damit Verweise auf Routen aus, die erst zur Laufzeit Daten lesen und dort
 * ins Leere führen würden (z. B. ein Einzeltermin als .ics). Docker baut mit BAU_PGLITE ohne VERCEL und hat zur Laufzeit
 * eine Datenbank – dort nein.
 */
export function ohneLaufzeitDatenbank(): boolean {
  return (process.env.VERCEL === '1' && process.env.BAU_PGLITE === '1') || !datenbankVerfuegbar();
}
