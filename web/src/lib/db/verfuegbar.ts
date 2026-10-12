/**
 * Ob ein Datenzugriff möglich ist (ohne Verbindungsaufbau): mit DATABASE_URL, in Entwicklung und Tests (PGlite) und
 * beim Bau mit BAU_PGLITE=1 (ADR 0017). Nein nur zur Laufzeit des Beispielmodus (Vercel ohne Datenbank, ADR 0019) –
 * dort würde jeder Zugriff über `db` mit „DATABASE_URL fehlt“ scheitern. Ohne `server-only`, damit auch reine
 * Hilfsmodule (lib/seo/og-bild.tsx) es nutzen können.
 */
export function datenbankVerfuegbar(): boolean {
  return Boolean(process.env.DATABASE_URL) || process.env.NODE_ENV !== 'production' || process.env.BAU_PGLITE === '1';
}
