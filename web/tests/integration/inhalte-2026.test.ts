import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import type { Datenbank } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { MIGRATION, wendeStand2026An } from '@/lib/inhalt/stand-2026';
import { fuehreStartklarAus, type Pruefung, type StartklarErgebnis } from '@/lib/startklar/pruefungen';
import { schema as projekteSchema } from '@/lib/validierung/seiteninhalte/projekte';
import { PROJEKTE_BEISPIEL } from '../../drizzle/seeds/bereiche/projekte';
import { testDatenbank } from './hilfen/db';

/**
 * Inhaltsmigration „Moschee 2026 fertiggestellt“ (scripts/inhalte-2026.ts) und die Cockpit-Prüfungen „Meilenstein
 * vergangen, aber offen“ und „Projekt-Platzhalter offen“ (AUFTRAG 3.9, E0-K05). Nur Beispielinhalte werden geändert,
 * mit Audit-Eintrag; ein zweiter Lauf ändert nichts. Daten fiktiv bzw. aus den Seeds.
 */
const { client, db: pgDb } = await testDatenbank();
const db = pgDb as unknown as Datenbank;
afterAll(() => client.close());

beforeEach(async () => {
  await db.execute(sql`truncate table seiteninhalt, audit_eintrag, einstellung cascade`);
});

/** Beispielstand vor 2026 (Auszug aus dem früheren Seed): in Planung, Meilensteine offen, Station „Zukunft“. */
const ALT_PROJEKTE = {
  projekt: { name: { de: 'Neue Fatih Moschee Projekt' }, status: 'in_planung', beginn: 2024, fertigstellung: 2026 },
  meilensteine: [
    { titel: { de: 'Genehmigungen erhalten' }, beschreibung: { de: '[Test]' }, datum: { de: 'März 2024' }, erledigt: true },
    { titel: { de: 'Grundsteinlegung' }, beschreibung: { de: '[Test]' }, datum: { de: 'September 2024' }, erledigt: false },
    { titel: { de: 'Eröffnung' }, beschreibung: { de: '[Test]' }, datum: { de: 'Januar 2026' }, erledigt: false },
  ],
};
const station = (de: string, reihenfolge: number) => ({
  kennzeichnung: { de },
  titel: { de: `${de} – [Test]` },
  bildbeschreibung: { de: 'Foto: [Test]' },
  reihenfolge,
  symbol: 'standort',
});
const ALT_UEBER_UNS = { zeitleiste: [station('2019', 4), station('Zukunft', 5)], werte: [] };

async function lege(bereich: string, inhalt: unknown, istBeispiel: boolean) {
  await db.insert(schema.seiteninhalt).values({ bereich, inhalt, istBeispiel, quelle: '[Test]' });
}
async function inhalt(bereich: string) {
  const [z] = await db.select().from(schema.seiteninhalt).where(eq(schema.seiteninhalt.bereich, bereich));
  return z;
}
const audits = () => db.select().from(schema.auditEintrag);

describe('Inhaltsmigration Stand 2026', () => {
  it('bringt Beispielinhalte auf den Seed-Stand, mit Audit; zweiter Lauf ändert nichts', async () => {
    await lege('projekte', ALT_PROJEKTE, true);
    await lege('ueber-uns', ALT_UEBER_UNS, true);
    expect(await wendeStand2026An(db)).toEqual({ projekte: 'aktualisiert', ueberUns: 'aktualisiert' });

    const p = projekteSchema.parse((await inhalt('projekte')).inhalt);
    expect(p.projekt).toMatchObject({ status: 'fertiggestellt', name: { de: 'Neue Fatih-Moschee' } });
    expect(p.meilensteine.every((m) => m.erledigt)).toBe(true);
    expect((await inhalt('projekte')).istBeispiel).toBe(true);
    const u = (await inhalt('ueber-uns')).inhalt as typeof ALT_UEBER_UNS;
    expect(u.zeitleiste.map((e) => e.kennzeichnung.de)).toEqual(['2019', '[Jahr – von der Gemeinde]']);
    expect(u.zeitleiste[1].titel.de).toBe('[Jahr – von der Gemeinde] – Eröffnung der neuen Fatih-Moschee');

    const eintraege = await audits();
    expect(eintraege.map((a) => [a.aktion, a.zielTyp, a.zielId]).sort()).toEqual([
      ['inhalt.geaendert', 'seiteninhalt', 'projekte'],
      ['inhalt.geaendert', 'seiteninhalt', 'ueber-uns'],
    ]);
    expect(eintraege.every((a) => a.benutzerId === null && (a.details as { migration: string }).migration === MIGRATION)).toBe(true);

    expect(await wendeStand2026An(db)).toEqual({ projekte: 'unveraendert', ueberUns: 'unveraendert' });
    expect(await audits()).toHaveLength(2);
  });

  it('Beispiel-Zeitleiste endet 2019 (ohne „Zukunft“): Eröffnung als letzte Station, mit Audit; zweiter Lauf ändert nichts', async () => {
    await lege('ueber-uns', { zeitleiste: [station('[Test-Gründung]', 1), station('2019', 4)], werte: [] }, true);
    expect(await wendeStand2026An(db)).toEqual({ projekte: 'fehlt', ueberUns: 'aktualisiert' });
    const u = (await inhalt('ueber-uns')).inhalt as typeof ALT_UEBER_UNS;
    expect(u.zeitleiste.map((e) => [e.kennzeichnung.de, e.reihenfolge])).toEqual([
      ['[Test-Gründung]', 1],
      ['2019', 4],
      ['[Jahr – von der Gemeinde]', 5],
    ]);
    expect(await audits()).toHaveLength(1);
    expect(await wendeStand2026An(db)).toEqual({ projekte: 'fehlt', ueberUns: 'unveraendert' });
    expect(await audits()).toHaveLength(1);
  });

  it('redaktionell gepflegte Inhalte (ist_beispiel = false) bleiben unberührt', async () => {
    await lege('projekte', ALT_PROJEKTE, false);
    await lege('ueber-uns', ALT_UEBER_UNS, false);
    expect(await wendeStand2026An(db)).toEqual({ projekte: 'redaktionell', ueberUns: 'redaktionell' });
    expect((await inhalt('projekte')).inhalt).toEqual(ALT_PROJEKTE);
    expect((await inhalt('ueber-uns')).inhalt).toEqual(ALT_UEBER_UNS);
    expect(await audits()).toEqual([]);
  });

  it('ohne gespeicherte Inhalte: nichts zu tun', async () => {
    expect(await wendeStand2026An(db)).toEqual({ projekte: 'fehlt', ueberUns: 'fehlt' });
    expect(await audits()).toEqual([]);
  });
});

describe('Cockpit: Projekte', () => {
  const jetzt = new Date('2026-10-13T08:00:00Z');
  const pruefe = () => fuehreStartklarAus({ env: { NODE_ENV: 'development' }, db, dnsPruefen: false, speicherPruefen: false, jetzt });
  const befund = (e: StartklarErgebnis, id: string): Pruefung => {
    const p = e.pruefungen.find((x) => x.id === id);
    if (!p) throw new Error(`Prüfung ${id} fehlt`);
    return p;
  };

  it('alter Stand: vergangene offene Meilensteine und Platzhalter → gelb', async () => {
    await lege('projekte', ALT_PROJEKTE, true);
    const e = await pruefe();
    const m = befund(e, 'inhalte.meilensteine');
    expect(m.status).toBe('warnung');
    expect(m.meldung).toContain('„Grundsteinlegung“ (September 2024)');
    expect(m.meldung).toContain('„Eröffnung“ (Januar 2026)');
    expect(m.meldung).not.toContain('Genehmigungen');
    expect(befund(e, 'inhalte.projekt-platzhalter').status).toBe('warnung');
  });

  it('Seed-Stand 2026: Meilensteine in Ordnung, Platzhalter der Gemeinde noch offen (gelb, kein Fehler)', async () => {
    await lege('projekte', projekteSchema.parse(PROJEKTE_BEISPIEL), true);
    const e = await pruefe();
    expect(befund(e, 'inhalte.meilensteine').status).toBe('ok');
    expect(befund(e, 'inhalte.projekt-platzhalter').status).toBe('warnung');
    expect(e.pruefungen.filter((p) => p.id.startsWith('inhalte.') && p.status === 'fehler')).toEqual([]);
  });

  it('ohne Platzhalter und ohne offene Meilensteine: beides grün; ohne Inhalt: Platzhalter gelb', async () => {
    const fertig = projekteSchema.parse({
      projekt: {
        name: { de: 'Testmoschee' },
        ort: { de: 'Teststraße 1' },
        beschreibung: { de: 'Test' },
        kapazitaet: { wert: 1, einheit: { de: 'Plätze' } },
      },
      spende: { titel: { de: 'Spenden' }, text: { de: 'Test' }, bankverbindung: { de: 'DE00 0000 0000 0000 0000 00' } },
      unterstuetzung: { titel: { de: 'Test' }, text: { de: 'Test' }, dank: { de: 'Danke' } },
      meilensteine: [{ titel: { de: 'Eröffnung' }, beschreibung: { de: 'Test' }, datum: { de: 'Januar 2026' }, erledigt: true }],
    });
    await lege('projekte', fertig, false);
    const e = await pruefe();
    expect(befund(e, 'inhalte.meilensteine').status).toBe('ok');
    expect(befund(e, 'inhalte.projekt-platzhalter').status).toBe('ok');

    await db.execute(sql`truncate table seiteninhalt`);
    const leer = await pruefe();
    expect(befund(leer, 'inhalte.meilensteine').status).toBe('ok');
    expect(befund(leer, 'inhalte.projekt-platzhalter').status).toBe('warnung');
  });
});
