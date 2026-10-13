// Inhaltsmigration „Moschee 2026 fertiggestellt“ (AUFTRAG 3.9, E0-K05): bringt Beispielinhalte (ist_beispiel = true) der
// Seiten „projekte“ und „ueber-uns“ auf den Stand der Seeds. Redaktionell gespeicherte Inhalte bleiben unberührt.
// Idempotent, mit Audit-Eintrag je Änderung. Logik und Tests: src/lib/inhalt/stand-2026.ts,
// tests/unit/inhalte-2026.test.ts, tests/integration/inhalte-2026.test.ts.
// Aufruf: pnpm inhalte:2026 (DATABASE_URL oder PGlite). Danach Cache erneuern (Tag seiteninhalt, BETRIEB.md).
import { holeDb } from '@/lib/db';
import { wendeStand2026An } from '@/lib/inhalt/stand-2026';

const TEXT = {
  aktualisiert: 'auf Stand 2026 gebracht (Audit-Eintrag geschrieben)',
  unveraendert: 'bereits auf Stand 2026',
  redaktionell: 'redaktionell gepflegt – nicht verändert',
  fehlt: 'nicht vorhanden – nichts zu tun',
} as const;

wendeStand2026An(holeDb())
  .then((ergebnis) => {
    console.log(`[inhalte-2026] projekte: ${TEXT[ergebnis.projekte]}`);
    console.log(`[inhalte-2026] ueber-uns: ${TEXT[ergebnis.ueberUns]}`);
    process.exit(0);
  })
  .catch((e) => {
    console.error('[inhalte-2026] Fehler:', e instanceof Error ? e.message : e);
    process.exit(1);
  });
