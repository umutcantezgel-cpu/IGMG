// Seeds (ADR 0015): Inhalte aus Bestand und Design mit Quellenvermerk, Beispielinhalte gekennzeichnet.
// Idempotent (vorhandene Einträge mit gleichem Slug/Schlüssel bleiben unverändert). Die Seeds selbst: ./alle.ts.
// Aufruf: pnpm db:seed (DATABASE_URL oder PGlite).
import { holeDb } from '../../src/lib/db';
import { fuehreSeedsAus } from './alle';

fuehreSeedsAus(holeDb())
  .then(({ fehler }) => {
    console.log(fehler.length ? `Seeds mit Fehlern: ${fehler.join(', ')}` : 'Seeds fertig.');
    process.exit(fehler.length ? 1 : 0);
  })
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
