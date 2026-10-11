/**
 * Start des Servers (K-19): Im Betrieb (MIGRATION_BEIM_START=1, Docker) werden die versionierten
 * Migrationen angewendet, bevor Anfragen bedient werden. Fehler beenden den Start (kein Betrieb mit falschem Schema).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.MIGRATION_BEIM_START !== '1') return;
  const { migriere } = await import('./lib/db/migration');
  await migriere();
}
