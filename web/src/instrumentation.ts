/**
 * Start des Servers (K-19): Im Betrieb (MIGRATION_BEIM_START=1, Docker) werden die versionierten
 * Migrationen angewendet, bevor Anfragen bedient werden. Fehler beenden den Start (kein Betrieb mit falschem Schema).
 * Danach (CACHE_ERNEUERN_BEIM_START=1) lässt der Server seine beim Bau erzeugten Inhalte verfallen (ADR 0017).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  // Ohne https-Adresse entfallen HSTS und upgrade-insecure-requests still (Tor A SP-A-17) – lokal (localhost) erlaubt
  const adresse = process.env.APP_URL ?? '';
  // Ohne APP_URL zeigten Links in Mails und kanonische Adressen auf localhost (Tor B/C SP-B B11) – Start abbrechen wie
  // bei fehlender DATABASE_URL. Bauläufe (Vorrendern) sind ausgenommen.
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build' && !adresse)
    throw new Error('[start] APP_URL fehlt (öffentliche Adresse, z. B. https://<domain>; BETRIEB.md 2).');
  if (process.env.NODE_ENV === 'production' && !adresse.startsWith('https://') && !/^http:\/\/(localhost|127\.0\.0\.1)[:/]/.test(adresse))
    console.warn(
      `[start] APP_URL ist nicht https (${adresse || 'leer'}): HSTS und upgrade-insecure-requests sind abgeschaltet (BETRIEB.md 2).`,
    );
  // Ratenbegrenzung braucht die Besucheradresse vom vertrauten Proxy (E-041); ohne ihn gilt ein gemeinsames Limit
  if (process.env.NODE_ENV === 'production' && process.env.PROXY_VERTRAUEN !== '1')
    console.error(
      '[start] PROXY_VERTRAUEN ist nicht 1: Formulare und Anmeldung teilen sich ein gemeinsames Limit (kein vertrauter Proxy). Hinter dem TLS-Proxy PROXY_VERTRAUEN=1 setzen (BETRIEB.md 5a).',
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
