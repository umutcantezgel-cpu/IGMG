import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { and, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { seed as seedEntwuerfe, WISSEN_ENTWUERFE } from '../../drizzle/seeds/bereiche/wissen-entwuerfe';
import { schema, type Datenbank } from '@/lib/db';
import { INHALTSSTAND_SPERRE } from '@/lib/inhalt/sperre';
import { wendeStand2026An } from '@/lib/inhalt/stand-2026';
import { marktstartStaende, wendeStandMarktstartAn } from '@/lib/inhalt/stand-marktstart';

/**
 * Sperre der Inhaltsstände (Nachtrag ADR 0019 vom 28.10.2026) gegen echtes PostgreSQL mit zwei Sitzungen: Solange ein Lauf
 * die Sperre hält, warten die Stand-Migrationen und der Seed der KI-Entwürfe; zwei gleichzeitige Bauläufe legen jeden
 * Entwurf genau einmal an und protokollieren ihn genau einmal. PGlite kann das nicht zeigen (eine Sitzung, Sperren sind dort
 * wiedereintretend). Läuft nur mit `TEST_PG_URL` auf eine Testdatenbank (Name mit „test“); sie wird dabei geleert – wie
 * `wartung-sperre-postgres.test.ts`. Ohne die Variable ist die Suite übersprungen.
 */
const url = process.env.TEST_PG_URL;
/** So lange muss ein wartender Lauf mindestens warten, damit der Test „wartet“ von „war schon fertig“ unterscheidet. */
const WARTEZEIT_MS = 500;

/**
 * Migrationen einzeln anwenden (je eine Transaktion): `migrate` nimmt sonst alle in eine, und PostgreSQL erlaubt einen neuen
 * Enum-Wert (0008: Rolle „leitung“) erst nach dessen Commit (0013 nutzt ihn). PGlite prüft das nicht.
 */
async function migriereEinzeln(db: Datenbank) {
  const kopie = mkdtempSync(join(tmpdir(), 'igmg-mig-'));
  try {
    cpSync(join(import.meta.dirname, '../../drizzle/migrations'), kopie, { recursive: true });
    const pfad = join(kopie, 'meta/_journal.json');
    const journal = JSON.parse(readFileSync(pfad, 'utf8')) as { entries: unknown[] };
    for (let i = 1; i <= journal.entries.length; i++) {
      writeFileSync(pfad, JSON.stringify({ ...journal, entries: journal.entries.slice(0, i) }));
      await migrate(db, { migrationsFolder: kopie });
    }
  } finally {
    rmSync(kopie, { recursive: true, force: true });
  }
}

describe.skipIf(!url)('Sperre der Inhaltsstände gegen echtes PostgreSQL (zwei Sitzungen)', () => {
  let pool: Pool;
  let pg: Datenbank;

  beforeAll(async () => {
    if (!new URL(url!).pathname.includes('test')) throw new Error('TEST_PG_URL muss auf eine Testdatenbank zeigen (Name mit „test“).');
    pool = new Pool({ connectionString: url, max: 6 });
    pg = drizzle(pool, { schema, casing: 'snake_case' }) as unknown as Datenbank;
    await pg.execute(sql`drop schema if exists public cascade`);
    await pg.execute(sql`drop schema if exists drizzle cascade`);
    await pg.execute(sql`create schema public`);
    await migriereEinzeln(pg);
  });

  afterAll(async () => {
    await pool?.end();
  });

  beforeEach(async () => {
    await pg.execute(sql`truncate table seiteninhalt, audit_eintrag, einstellung, wissen_thema, freigabe, revision cascade`);
  });

  /** Hält die Sperre der Inhaltsstände in einer eigenen Transaktion (eigene Sitzung), bis `freigeben()` aufgerufen wird. */
  async function haltSperre() {
    let gehalten!: () => void;
    const bereit = new Promise<void>((r) => (gehalten = r));
    let freigeben!: () => void;
    const halt = new Promise<void>((r) => (freigeben = r));
    const ende = pg.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(${INHALTSSTAND_SPERRE}::bigint)`);
      gehalten();
      await halt;
    });
    await bereit;
    return { freigeben: () => freigeben(), ende };
  }

  /** War `lauf` fertig, solange die Sperre gehalten wurde? Und danach? */
  async function unterGehaltenerSperre(lauf: () => Promise<unknown>) {
    const sperre = await haltSperre();
    let fertig = false;
    const laeuft = lauf().then(() => {
      fertig = true;
    });
    await new Promise((r) => setTimeout(r, WARTEZEIT_MS));
    const waehrendDerSperre = fertig;
    sperre.freigeben();
    await sperre.ende;
    await laeuft;
    return { waehrendDerSperre, danach: fertig };
  }

  it.each([
    ['inhalte-marktstart', () => wendeStandMarktstartAn(pg)],
    ['inhalte-2026', () => wendeStand2026An(pg)],
    ['Seed wissen-entwuerfe', () => seedEntwuerfe(pg)],
  ])('%s wartet, solange ein anderer Lauf die Sperre hält, und läuft danach', async (_name, lauf) => {
    expect(await unterGehaltenerSperre(lauf)).toEqual({ waehrendDerSperre: false, danach: true });
  });

  it('zwei gleichzeitige Bauläufe: jeder Entwurf und jeder Bereich genau einmal angelegt und protokolliert', async () => {
    const [a, b] = await Promise.all([wendeStandMarktstartAn(pg), wendeStandMarktstartAn(pg)]);
    expect([...a.wissenEntwuerfe, ...b.wissenEntwuerfe].sort()).toEqual(WISSEN_ENTWUERFE.map((e) => e.slug).sort());
    const audit = schema.auditEintrag;
    const angelegt = await pg
      .select()
      .from(audit)
      .where(and(eq(audit.aktion, 'inhalt.angelegt'), eq(audit.zielTyp, 'wissen_thema')));
    expect(angelegt).toHaveLength(WISSEN_ENTWUERFE.length);
    const seiten = await pg.select().from(audit).where(eq(audit.zielTyp, 'seiteninhalt'));
    expect(seiten).toHaveLength(marktstartStaende().length);
    // Der zweite Lauf fand alles vor
    const zweiter = [a, b].find((e) => !e.wissenEntwuerfe.length);
    expect(zweiter && Object.values(zweiter.bereiche).every((x) => x === 'unveraendert')).toBe(true);
  });
});
