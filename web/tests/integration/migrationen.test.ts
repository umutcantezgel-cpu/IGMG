import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { testDatenbank } from './hilfen/db';

const { client, db } = await testDatenbank();
afterAll(() => client.close());

describe('Migrationen (K-05)', () => {
  it('legen alle Tabellen an', async () => {
    const r = await db.execute<{ n: number }>(sql`select count(*)::int as n from information_schema.tables where table_schema = 'public'`);
    // 34 bis Lauf Gestaltung, + 62 Tabellen Lauf Gemeinde-Plattform (Migration 0008), + quran_vers_auswahl (0012)
    expect(r.rows[0]?.n).toBe(97);
  });

  it('Volltextspalten werden je Sprache erzeugt (ADR 0013)', async () => {
    await db.execute(
      sql`insert into veranstaltung (slug, titel, kategorie, beginn, klartext) values ('test', '{"de":"Testtermin"}', 'gemeinde', now(), '{"de":"Gemeinschaftliches Fastenbrechen","tr":"Toplu iftar yemekleri"}')`,
    );
    const de = await db.execute<{ n: number }>(
      sql`select count(*)::int as n from veranstaltung where suche_de @@ websearch_to_tsquery('german', 'Fastenbrechen')`,
    );
    const tr = await db.execute<{ n: number }>(
      sql`select count(*)::int as n from veranstaltung where suche_tr @@ websearch_to_tsquery('turkish', 'iftar')`,
    );
    expect(de.rows[0]?.n).toBe(1);
    expect(tr.rows[0]?.n).toBe(1);
  });

  it('Rollenzuweisung: Organisationsredaktion nur mit Organisation (Prüfbedingung)', async () => {
    await db.execute(
      sql`insert into "user" (id, name, email, email_verified) values ('u1', 'Testperson Eins', 'testperson.eins@example.test', true)`,
    );
    await expect(
      db.execute(sql`insert into rolle_zuweisung (benutzer_id, rolle) values ('u1', 'organisationsredaktion')`),
    ).rejects.toThrow();
    await expect(
      db.execute(sql`insert into rolle_zuweisung (benutzer_id, rolle, organisation) values ('u1', 'redaktion', 'gt')`),
    ).rejects.toThrow();
    await db.execute(sql`insert into rolle_zuweisung (benutzer_id, rolle, organisation) values ('u1', 'organisationsredaktion', 'gt')`);
    await expect(
      db.execute(sql`insert into rolle_zuweisung (benutzer_id, rolle, organisation) values ('u1', 'organisationsredaktion', 'gt')`),
    ).rejects.toThrow();
  });
});
