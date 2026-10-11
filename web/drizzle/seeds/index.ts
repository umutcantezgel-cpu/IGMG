// Seeds (ADR 0015): Inhalte aus Bestand und Design mit Quellenvermerk, Beispielinhalte gekennzeichnet.
// Idempotent. Aufruf: pnpm db:seed (DATABASE_URL oder PGlite). Bereiche werden in P3/P4 ergänzt.
import { holeDb } from '../../src/lib/db';

type Seed = { name: string; lauf: (db: ReturnType<typeof holeDb>) => Promise<number> };
const SEEDS: Seed[] = [];

async function main() {
  const db = holeDb();
  for (const s of SEEDS) {
    const n = await s.lauf(db);
    console.log(`Seed ${s.name}: ${n}`);
  }
  console.log(`Seeds fertig (${SEEDS.length} Bereiche).`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
