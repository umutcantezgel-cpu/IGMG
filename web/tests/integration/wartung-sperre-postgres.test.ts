import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { sql, eq } from 'drizzle-orm';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema, type Datenbank } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { mitSperre, sperrSchluessel } from '@/lib/wartung/sperre';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * V-06: Die Sperre gegen echtes PostgreSQL mit zwei Sitzungen. Advisory-Locks gelten je Sitzung; PGlite kann das nicht
 * zeigen (eine Sitzung). Läuft nur mit `TEST_PG_URL` auf eine Testdatenbank (Name mit „test“); sie wird dabei geleert.
 * Ohne die Variable ist die Suite übersprungen. Beispiel: `TEST_PG_URL=postgres://postgres@127.0.0.1:5432/igmg_test`.
 */
const url = process.env.TEST_PG_URL;
const CRON = randomBytes(32).toString('base64');

const { client } = await verwaltungsUmgebung();
const loesch = await import('@/app/api/wartung/loeschfristen/route');
const mail = await import('@/app/api/wartung/mail-ausgang/route');
afterAll(() => client.close());

describe.skipIf(!url)('Sperre gegen echtes PostgreSQL (zwei Sitzungen)', () => {
  let pool: Pool;
  let pg: Datenbank;
  let vorher: unknown;
  const globalDb = globalThis as unknown as { __igmgDb?: unknown };
  const vorherCron = process.env.CRON_SECRET;

  beforeAll(async () => {
    if (!new URL(url!).pathname.includes('test')) throw new Error('TEST_PG_URL muss auf eine Testdatenbank zeigen (Name mit „test“).');
    pool = new Pool({ connectionString: url, max: 6 });
    pg = drizzle(pool, { schema, casing: 'snake_case' }) as unknown as Datenbank;
    // Frischer Stand: auch das Migrationsprotokoll (Schema „drizzle“) leeren, sonst hält drizzle die Migrationen für angewendet
    await pg.execute(sql`drop schema if exists public cascade`);
    await pg.execute(sql`drop schema if exists drizzle cascade`);
    await pg.execute(sql`create schema public`);
    await migrate(pg, { migrationsFolder: join(import.meta.dirname, '../../drizzle/migrations') });
    vorher = globalDb.__igmgDb;
    globalDb.__igmgDb = pg; // App-Datenbank = PostgreSQL-Pool, damit die Routen die echte Sperre nutzen
    process.env.CRON_SECRET = CRON;
  });

  afterAll(async () => {
    globalDb.__igmgDb = vorher;
    process.env.CRON_SECRET = vorherCron;
    await pool?.end();
  });

  const anfrage = () => new Request('https://example.test/api/wartung', { method: 'GET', headers: { authorization: `Bearer ${CRON}` } });

  /** Hält die Sperre `name` in einer eigenen Transaktion, bis `freigeben()` aufgerufen wird. */
  async function haltSperre(name: string) {
    let gehalten!: () => void;
    const bereit = new Promise<void>((r) => (gehalten = r));
    let freigeben!: () => void;
    const halt = new Promise<void>((r) => (freigeben = r));
    const laeuft = pg.transaction(async (tx) => {
      await tx.execute(sql`select pg_try_advisory_xact_lock(${sperrSchluessel(name).toString()}::bigint)`);
      gehalten();
      await halt;
    });
    await bereit;
    return { freigeben: () => freigeben(), ende: laeuft };
  }

  it('zweiter Lauf wird übersprungen, solange der erste die Sperre hält; danach ist sie wieder frei', async () => {
    const erster = await haltSperre('belegt-test');
    expect(await mitSperre('belegt-test', async () => 'zweiter', pg)).toEqual({ uebersprungen: true });
    erster.freigeben();
    await erster.ende;
    expect(await mitSperre('belegt-test', async () => 'dritter', pg)).toEqual({ uebersprungen: false, ergebnis: 'dritter' });
  });

  it('die Sperre endet auch bei einem Fehler der Arbeit (Rollback gibt sie frei)', async () => {
    await expect(
      mitSperre(
        'fehler-test',
        async () => {
          throw new Error('Testfehler');
        },
        pg,
      ),
    ).rejects.toThrow('Testfehler');
    expect(await mitSperre('fehler-test', async () => 'danach', pg)).toEqual({ uebersprungen: false, ergebnis: 'danach' });
  });

  it('Cron-Lauf der Löschfristen: belegt → uebersprungen, die fällige Arbeit bleibt liegen; frei → läuft', async () => {
    const p = verschluessele({ name: 'Testperson Zehn' });
    const [z] = await pg
      .insert(schema.eingang)
      .values({ art: 'kontakt', datenVerschluesselt: p.daten, schluesselId: p.schluesselId, loeschenAb: new Date(Date.now() - 86_400_000) })
      .returning({ id: schema.eingang.id });

    const sperre = await haltSperre('loeschfristen');
    const belegt = await loesch.GET(anfrage());
    expect(belegt.status).toBe(200);
    expect(await belegt.json()).toEqual({ uebersprungen: true });
    expect(await pg.select().from(schema.eingang).where(eq(schema.eingang.id, z.id))).toHaveLength(1);
    sperre.freigeben();
    await sperre.ende;

    const frei = await (await loesch.GET(anfrage())).json();
    expect(frei.geloeschteEingaenge).toBeGreaterThanOrEqual(1);
    expect(await pg.select().from(schema.eingang).where(eq(schema.eingang.id, z.id))).toHaveLength(0);
  });

  it('Cron-Lauf des Mail-Ausgangs: belegt → uebersprungen, die offene Mail bleibt offen', async () => {
    const p = verschluessele({ an: 'testperson.sperre@example.test', daten: { art: 'kontakt' } });
    const [z] = await pg
      .insert(schema.mailAusgang)
      .values({
        vorlage: 'bestaetigung',
        sprache: 'de',
        datenVerschluesselt: p.daten,
        schluesselId: p.schluesselId,
        naechsterVersuch: new Date(Date.now() - 60_000),
      })
      .returning({ id: schema.mailAusgang.id });

    const sperre = await haltSperre('mail-ausgang');
    expect(await (await mail.GET(anfrage())).json()).toEqual({ uebersprungen: true });
    const [offen] = await pg.select().from(schema.mailAusgang).where(eq(schema.mailAusgang.id, z.id));
    expect(offen.gesendetAm).toBeNull();
    sperre.freigeben();
    await sperre.ende;

    expect(await (await mail.GET(anfrage())).json()).toMatchObject({ gesendet: 1, fehler: 0 });
  });
});
