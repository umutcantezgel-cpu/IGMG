import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { testDatenbank } from './hilfen/db';

const { client, db } = await testDatenbank();
afterAll(() => client.close());

describe('Migrationen (K-05)', () => {
  it('legen alle Tabellen an', async () => {
    const r = await db.execute<{ n: number }>(sql`select count(*)::int as n from information_schema.tables where table_schema = 'public'`);
    // 34 bis Lauf Gestaltung, + 62 Tabellen Lauf Gemeinde-Plattform (Migration 0008), + quran_vers_auswahl (0012),
    // + rollen_antrag (0013, Vier-Augen-Prinzip für Schutzrollen), + mail_zusammenfassung (0016, F-38),
    // + 20 Inhaltstabellen (0018), 6 Nutzungstabellen (0019), 2 Tabellen des Audio-Studios (0020) und 3 Gruppentabellen
    // (0021) der Lern-App, + lernapp_tag_kurs (0022, Tagessummen je Kurs, S-L3 M-1), + gebetszeit_abgleich (0024, ADR 0048)
    expect(r.rows[0]?.n).toBe(132);
  });

  it('IGMG-Abgleich: 0024 ergänzt den Enum-Wert igmg, keine Migration nutzt ihn als Literal (ADR 0048)', async () => {
    const ordner = join(import.meta.dirname, '../../drizzle/migrations');
    const ohneKommentar = (datei: string) =>
      readFileSync(join(ordner, datei), 'utf8')
        .split('\n')
        .filter((z) => !z.startsWith('--') || z.startsWith('--> statement-breakpoint'))
        .join('\n');
    const nutzer = readdirSync(ordner).filter((d) => /^\d{4}_.*\.sql$/.test(d) && d.slice(0, 4) >= '0024');
    for (const datei of nutzer) {
      const ohneEnum = ohneKommentar(datei).replace(`ALTER TYPE "public"."gebetszeit_quelle" ADD VALUE 'igmg' BEFORE 'berechnet';`, '');
      expect(ohneEnum, datei).not.toMatch(/'igmg'/);
    }
    const werte = await db.execute<{ w: string }>(sql`select unnest(enum_range(null::gebetszeit_quelle))::text as w`);
    expect(werte.rows.map((z) => z.w)).toEqual(['import', 'igmg', 'berechnet']);
  });

  it('Lern-App: 0017 ergänzt nur Enum-Werte, spätere Migrationen nutzen sie nicht als Literal (PostgreSQL 16)', async () => {
    const ordner = join(import.meta.dirname, '../../drizzle/migrations');
    const ohneKommentar = (datei: string) =>
      readFileSync(join(ordner, datei), 'utf8')
        .split('\n')
        .filter((z) => !z.startsWith('--') || z.startsWith('--> statement-breakpoint'))
        .join('\n');
    const anweisungen = ohneKommentar('0017_lernapp_rolle.sql')
      .split('--> statement-breakpoint')
      .map((a) => a.trim())
      .filter(Boolean);
    expect(anweisungen).toEqual([
      `ALTER TYPE "public"."rolle" ADD VALUE 'sprachpruefung';`,
      `ALTER TYPE "public"."konto_einwilligung_art" ADD VALUE 'lernapp';`,
    ]);
    const spaeter = readdirSync(ordner).filter((d) => /^\d{4}_.*\.sql$/.test(d) && d.slice(0, 4) > '0017');
    expect(spaeter.length).toBeGreaterThanOrEqual(2);
    for (const datei of spaeter) expect(ohneKommentar(datei), datei).not.toMatch(/'sprachpruefung'|'lernapp'/);
    const rollen = await db.execute<{ w: string }>(sql`select unnest(enum_range(null::rolle))::text as w`);
    expect(rollen.rows.map((z) => z.w)).toContain('sprachpruefung');
    const arten = await db.execute<{ w: string }>(sql`select unnest(enum_range(null::konto_einwilligung_art))::text as w`);
    expect(arten.rows.map((z) => z.w)).toContain('lernapp');
  });

  it('Lern-App: Übersetzung und Beleg haben genau einen Bezug; Sprecher nur mit Vereinbarung', async () => {
    await db.execute(sql`insert into lernapp_kurs (id, art, zielsprache) values ('tr', 'sprache', 'tr')`);
    const [satz] = (
      await db.execute<{ id: string }>(
        sql`insert into lernapp_satz (kurs_id, schluessel, text, stufe, quelle, lizenz, inhalt_hash) values ('tr', 'tr.a1.e01.s0001', '[Satz]', 'a1', 'redaktion', 'CC BY-SA 4.0', ${'e'.repeat(64)}) returning id`,
      )
    ).rows;
    await expect(
      db.execute(
        sql`insert into lernapp_uebersetzung (sprache, text, quelle, lizenz, inhalt_hash) values ('de', '[Satz]', 'redaktion', 'CC BY-SA 4.0', 'x')`,
      ),
    ).rejects.toThrow();
    await db.execute(
      sql`insert into lernapp_uebersetzung (satz_id, sprache, text, quelle, lizenz, inhalt_hash) values (${satz.id}, 'de', '[Satz]', 'redaktion', 'CC BY-SA 4.0', 'x')`,
    );
    // je Richtung (Ausgangssprache) genau eine Übersetzung
    await expect(
      db.execute(
        sql`insert into lernapp_uebersetzung (satz_id, sprache, text, quelle, lizenz, inhalt_hash) values (${satz.id}, 'de', '[Satz 2]', 'redaktion', 'CC BY-SA 4.0', 'y')`,
      ),
    ).rejects.toThrow();
    await expect(db.execute(sql`insert into lernapp_sprecher (name) values ('[Sprecherin]')`)).rejects.toThrow();
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
