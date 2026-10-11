/**
 * Vor allen Tests (E-019, ADR 0017): Wartet auf den Server und lässt alle Inhalts-Caches verfallen, damit die
 * beim Bau gegen die Entwicklungsdatenbank vorgerenderten Seiten aus der frischen E2E-Datenbank neu entstehen.
 * Läuft der Server noch nicht (Reihenfolge webServer/globalSetup), übernimmt CACHE_ERNEUERN_BEIM_START.
 */
export default async function globalSetup() {
  const basis = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
  const token = process.env.WARTUNG_TOKEN ?? '';
  for (let i = 0; i < 20; i++) {
    try {
      const gesund = await fetch(`${basis}/api/health`);
      if (gesund.ok) {
        const antwort = await fetch(`${basis}/api/wartung/cache-erneuern`, {
          method: 'POST',
          headers: { authorization: `Bearer ${token}` },
        });
        if (!antwort.ok) throw new Error(`Cache-Erneuerung abgelehnt: HTTP ${antwort.status} (WARTUNG_TOKEN in .env prüfen)`);
        return;
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('Cache-Erneuerung')) throw e;
    }
    await new Promise((fertig) => setTimeout(fertig, 250));
  }
}
