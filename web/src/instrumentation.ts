import { pruefeUmgebung, vercelProduktionsHost } from './lib/umgebung';

/**
 * Start des Servers (K-19): Die gemeinsame Umgebungsprüfung (lib/umgebung.ts, ADR 0022) meldet Fehlendes verständlich;
 * nur eine fehlende öffentliche Adresse in Produktion bricht den Start ab (Links in Mails und kanonische Adressen
 * zeigten sonst auf localhost, Tor B/C SP-B B11) – außer auf Vercel, das die Produktionsadresse des Projekts selbst liefert.
 * Im Docker-Betrieb (MIGRATION_BEIM_START=1) werden die Migrationen angewendet, danach (CACHE_ERNEUERN_BEIM_START=1)
 * verfallen die beim Bau erzeugten Inhalte (ADR 0017). Auf Vercel migriert der Bau (ADR 0019); Selbstaufrufe über
 * 127.0.0.1 und Migrationen beim Kaltstart entfallen dort.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
    const { betriebsart, befunde } = pruefeUmgebung(process.env);
    for (const b of befunde) {
      const zeile = `[start] ${b.variable}: ${b.meldung}`;
      if (b.schwere === 'fehler') console.error(zeile);
      else if (b.schwere === 'warnung') console.warn(zeile);
    }
    // Auf Vercel gilt ohne APP_URL die Produktionsadresse des Projekts (frischer Import läuft ohne Eintrag)
    if (betriebsart === 'produktion' && !process.env.APP_URL && !vercelProduktionsHost(process.env))
      throw new Error('[start] APP_URL fehlt (öffentliche Adresse, z. B. https://<domain>; docs/deploy/VERCEL-ENV.md).');
  }
  const aufVercel = process.env.VERCEL === '1';
  if (process.env.MIGRATION_BEIM_START === '1' && !aufVercel) {
    const { migriere } = await import('./lib/db/migration');
    await migriere();
  }
  if (process.env.CACHE_ERNEUERN_BEIM_START === '1' && !aufVercel) void erneuereNachStart();
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
