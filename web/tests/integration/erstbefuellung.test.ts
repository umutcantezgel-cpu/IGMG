import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { fuehreSeedsAus } from '../../drizzle/seeds/alle';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { ERSTBEFUELLUNG_MERKER, fuehreErstbefuellungAus, VON_BAU, type SeedLauf } from '@/lib/wartung/erstbefuellung';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Erstbefüllung im Vercel-Bau (E-047, Nachtrag ADR 0019 vom 28.10.2026): Die Seeds laufen genau einmal (Merker in
 * `einstellung`), auch wenn `ERSTBEFUELLUNG=1` stehen bleibt; ein gescheiterter Seed setzt keinen Merker. Die erste
 * Einladung entsteht nur ohne Konto mit Rolle Administration; ein neuer Bau widerruft die offene Bau-Einladung, sodass
 * nur der neueste Link gilt. Der Link führt über die echte Abfrage der Annahmeseite zur Einladung. Daten fiktiv.
 */
const { client, db: pgDb } = await verwaltungsUmgebung();
// Nach der Prüfumgebung laden (Ersatz für next/server)
const { ladeGueltigeEinladung } = await import('@/server/queries/einladung');
const db = pgDb as unknown as Datenbank;
afterAll(() => client.close());

beforeEach(async () => {
  await db.execute(sql`truncate table einstellung, einladung, rolle_zuweisung, "user", audit_eintrag cascade`);
});

const BASIS = 'https://igmg-test.vercel.app';
const PERSON = { email: 'person@example.test', name: 'Testperson Eins' };
const nurSeed = { seed: true, einladung: null };
const nurEinladung = { seed: false, einladung: PERSON };

/** Ersatz für die Seeds: zählt die Läufe, schreibt eine Zeile, scheitert auf Wunsch. */
function zaehlSeeds(fehler: string[] = []) {
  const zaehler = { laeufe: 0 };
  const lauf: SeedLauf = async (d) => {
    zaehler.laeufe++;
    await d
      .insert(schema.einstellung)
      .values({ schluessel: 'allgemein', wert: { konzepthinweis: true } })
      .onConflictDoNothing();
    return { fehler };
  };
  return { zaehler, lauf };
}

const merker = () => db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, ERSTBEFUELLUNG_MERKER));
const tokenAus = (link: string) => link.slice(link.lastIndexOf('/') + 1);

describe('Seeds einmalig', () => {
  it('erster Bau spielt ein und setzt den Merker; jeder weitere Bau tut nichts', async () => {
    const s = zaehlSeeds();
    const jetzt = new Date('2026-10-28T20:00:00Z');
    expect(await fuehreErstbefuellungAus(db, nurSeed, { seeds: s.lauf, basis: BASIS, jetzt })).toEqual({
      seed: 'eingespielt',
      einladung: { art: 'nicht_angefordert' },
    });
    expect(await merker()).toMatchObject([{ wert: { am: '2026-10-28T20:00:00.000Z', ergebnis: 'eingespielt' }, geaendertVon: VON_BAU }]);
    expect((await fuehreErstbefuellungAus(db, nurSeed, { seeds: s.lauf, basis: BASIS })).seed).toBe('schon_erfolgt');
    expect(s.zaehler.laeufe).toBe(1);
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'einstellung.geaendert'));
    expect(audit).toMatchObject([
      { benutzerId: null, zielId: ERSTBEFUELLUNG_MERKER, details: { quelle: VON_BAU, ergebnis: 'eingespielt' } },
    ]);
  });

  it('gescheiterter Seed: Fehler, kein Merker – der nächste Bau versucht es erneut', async () => {
    const kaputt = zaehlSeeds(['nachrichten']);
    await expect(fuehreErstbefuellungAus(db, nurSeed, { seeds: kaputt.lauf, basis: BASIS })).rejects.toThrow(
      'Seeds mit Fehlern: nachrichten',
    );
    expect(await merker()).toEqual([]);
    const heil = zaehlSeeds();
    expect((await fuehreErstbefuellungAus(db, nurSeed, { seeds: heil.lauf, basis: BASIS })).seed).toBe('eingespielt');
    expect(heil.zaehler.laeufe).toBe(1);
  });

  it('Datenbank mit Konten, aber ohne Merker: keine Seeds (sie brächten Gelöschtes zurück), nur der Merker', async () => {
    await db.insert(schema.user).values({ id: 'u1', name: 'Testperson Eins', email: PERSON.email, emailVerified: true });
    const s = zaehlSeeds();
    expect((await fuehreErstbefuellungAus(db, nurSeed, { seeds: s.lauf, basis: BASIS })).seed).toBe('konten_vorhanden');
    expect(s.zaehler.laeufe).toBe(0);
    expect(await merker()).toMatchObject([{ wert: { ergebnis: 'konten_vorhanden' } }]);
    expect((await fuehreErstbefuellungAus(db, nurSeed, { seeds: s.lauf, basis: BASIS })).seed).toBe('schon_erfolgt');
  });

  it(
    'mit den echten Seeds: Konzept-Hinweis an, Beispielinhalte da, zweiter Lauf legt Gelöschtes nicht neu an',
    { timeout: 120_000 },
    async () => {
      await db.execute(sql`truncate table veranstaltung, nachricht, seiteninhalt, wissen_thema cascade`);
      const still = { log: () => undefined, error: console.error };
      const seeds: SeedLauf = (d) => fuehreSeedsAus(d, still);
      expect((await fuehreErstbefuellungAus(db, nurSeed, { seeds, basis: BASIS })).seed).toBe('eingespielt');
      const [allgemein] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'allgemein'));
      expect(allgemein.wert).toMatchObject({ konzepthinweis: true });
      const nachrichten = await db.select({ id: schema.nachricht.id }).from(schema.nachricht);
      expect(nachrichten.length).toBeGreaterThan(0);
      await db.execute(sql`truncate table nachricht cascade`);
      expect((await fuehreErstbefuellungAus(db, nurSeed, { seeds, basis: BASIS })).seed).toBe('schon_erfolgt');
      expect(await db.select({ id: schema.nachricht.id }).from(schema.nachricht)).toEqual([]);
    },
  );
});

describe('Erstes Verwaltungskonto', () => {
  it('ohne Administration: Einladung mit Rolle administration, 72 h, nur der Hash gespeichert, Link gültig', async () => {
    const jetzt = new Date();
    const e = await fuehreErstbefuellungAus(db, nurEinladung, { seeds: zaehlSeeds().lauf, basis: BASIS, jetzt });
    expect(e.seed).toBe('nicht_angefordert');
    if (e.einladung.art !== 'angelegt') throw new Error(`erwartet: angelegt, war: ${e.einladung.art}`);
    expect(e.einladung.link).toMatch(/^https:\/\/igmg-test\.vercel\.app\/verwaltung\/einladung\/[\w-]{43}$/);
    expect(e.einladung.laeuftAb.getTime() - jetzt.getTime()).toBe(72 * 3_600_000);
    expect(e.einladung.widerrufen).toBe(0);
    const token = tokenAus(e.einladung.link);
    const [zeile] = await db.select().from(schema.einladung);
    expect(zeile).toMatchObject({ ...PERSON, rollen: [{ rolle: 'administration' }], gemeindeRollen: [], erstelltVon: VON_BAU });
    expect(zeile.tokenHash).not.toContain(token);
    expect(await ladeGueltigeEinladung(token)).toMatchObject({ id: zeile.id, email: PERSON.email });
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, 'einladung.erstellt'));
    expect(audit).toMatchObject([{ benutzerId: null, zielId: zeile.id, details: { rollen: 1, quelle: VON_BAU } }]);
    expect(JSON.stringify(audit)).not.toContain(PERSON.email);
  });

  it('erneuter Bau ohne Annahme: alte Bau-Einladung widerrufen, nur der neue Link gilt', async () => {
    const seeds = zaehlSeeds().lauf;
    const erst = await fuehreErstbefuellungAus(db, nurEinladung, { seeds, basis: BASIS });
    const zweit = await fuehreErstbefuellungAus(db, nurEinladung, { seeds, basis: BASIS });
    if (erst.einladung.art !== 'angelegt' || zweit.einladung.art !== 'angelegt') throw new Error('erwartet: zweimal angelegt');
    expect(zweit.einladung.widerrufen).toBe(1);
    expect(await ladeGueltigeEinladung(tokenAus(erst.einladung.link))).toBeNull();
    expect(await ladeGueltigeEinladung(tokenAus(zweit.einladung.link))).not.toBeNull();
  });

  it('Einladungen von Kommandozeile oder Verwaltung bleiben unberührt', async () => {
    await db.insert(schema.einladung).values({
      email: 'andere@example.test',
      name: 'Testperson Zwei',
      rollen: [{ rolle: 'redaktion' }],
      tokenHash: 'h'.repeat(64),
      laeuftAb: new Date(Date.now() + 3_600_000),
      erstelltVon: 'kommandozeile',
    });
    await fuehreErstbefuellungAus(db, nurEinladung, { seeds: zaehlSeeds().lauf, basis: BASIS });
    const [cli] = await db.select().from(schema.einladung).where(eq(schema.einladung.erstelltVon, 'kommandozeile'));
    expect(cli.widerrufenAm).toBeNull();
  });

  it('mit Konto in Rolle Administration: keine neue Einladung, offene Bau-Einladung widerrufen', async () => {
    const erst = await fuehreErstbefuellungAus(db, nurEinladung, { seeds: zaehlSeeds().lauf, basis: BASIS });
    if (erst.einladung.art !== 'angelegt') throw new Error('erwartet: angelegt');
    await db.insert(schema.user).values({ id: 'u1', name: 'Testperson Eins', email: PERSON.email, emailVerified: true });
    await db.insert(schema.rolleZuweisung).values({ benutzerId: 'u1', rolle: 'administration' });
    expect((await fuehreErstbefuellungAus(db, nurEinladung, { seeds: zaehlSeeds().lauf, basis: BASIS })).einladung).toEqual({
      art: 'konto_vorhanden',
      widerrufen: 1,
    });
    const zeilen = await db.select().from(schema.einladung);
    expect(zeilen).toHaveLength(1);
    expect(zeilen[0].widerrufenAm).not.toBeNull();
    expect(await ladeGueltigeEinladung(tokenAus(erst.einladung.link))).toBeNull();
    expect((await fuehreErstbefuellungAus(db, nurEinladung, { seeds: zaehlSeeds().lauf, basis: BASIS })).einladung).toEqual({
      art: 'konto_vorhanden',
      widerrufen: 0,
    });
  });
});
