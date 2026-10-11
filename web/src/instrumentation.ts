/**
 * Start des Servers (K-19): Im Betrieb (MIGRATION_BEIM_START=1, Docker) werden die versionierten
 * Migrationen angewendet, bevor Anfragen bedient werden. Fehler beenden den Start (kein Betrieb mit falschem Schema).
 * Danach (CACHE_ERNEUERN_BEIM_START=1) lässt der Server seine beim Bau erzeugten Inhalte verfallen (ADR 0017).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  // Ohne https-Adresse entfallen HSTS und upgrade-insecure-requests still (Tor A SP-A-17) – lokal (localhost) erlaubt
  const adresse = process.env.APP_URL ?? '';
  if (process.env.NODE_ENV === 'production' && !adresse.startsWith('https://') && !/^http:\/\/(localhost|127\.0\.0\.1)[:/]/.test(adresse))
    console.warn(
      `[start] APP_URL ist nicht https (${adresse || 'leer'}): HSTS und upgrade-insecure-requests sind abgeschaltet (BETRIEB.md 2).`,
    );
  if (process.env.MIGRATION_BEIM_START === '1') {
    const { migriere } = await import('./lib/db/migration');
    await migriere();
  }
  if (process.env.CACHE_ERNEUERN_BEIM_START === '1') void erneuereNachStart();
}

/** Wartet, bis der Server antwortet, und ruft dann die geschützte Cache-Route auf (ohne den Start zu blockieren). */
async function erneuereNachStart() {
  const basis = `http://127.0.0.1:${process.env.PORT ?? '3000'}`;
  for (let versuch = 0; versuch < 60; versuch++) {
    await new Promise((fertig) => setTimeout(fertig, 1000));
    try {
      const gesund = await fetch(`${basis}/api/health`, { cache: 'no-store' });
      if (!gesund.ok) continue;
      const antwort = await fetch(`${basis}/api/wartung/cache-erneuern`, {
        method: 'POST',
        headers: { authorization: `Bearer ${process.env.WARTUNG_TOKEN ?? ''}` },
        cache: 'no-store',
      });
      if (!antwort.ok) console.error(`[start] Cache-Erneuerung abgelehnt: HTTP ${antwort.status} (WARTUNG_TOKEN prüfen)`);
      return;
    } catch {
      // Server lauscht noch nicht – erneut versuchen
    }
  }
  console.error('[start] Cache-Erneuerung nicht möglich: Server antwortete 60 s lang nicht.');
}
