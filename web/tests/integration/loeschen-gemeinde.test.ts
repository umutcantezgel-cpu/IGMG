import { eq, sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { KETTEN_ANFANG, kettenHash, pruefeKette } from '@/lib/chat/hashkette';
import { verschluessele } from '@/lib/krypto';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Löschfristen der Gemeinde-Plattform (DSFA D-04, D-05, D-10, D-13, D-16) gegen PGlite (D-14 und inaktive Konten:
 * `datenschutz-konten.test.ts`): Lernende nach Ablauf,
 * offene Meldungen nach 12 Monaten, Moderationsprotokoll nach 3 Jahren mit neuem Kettenanker, nicht zustellbare Mails,
 * Audit nach 12 Monaten. Idempotent. Testdaten fiktiv.
 */
const { client, db } = await verwaltungsUmgebung();
const { gemeindeLoeschlauf, PROTOKOLL_ANKER } = await import('@/lib/loeschen/gemeinde');
afterAll(() => client.close());

const JETZT = new Date('2026-10-13T03:00:00Z');
const tageVor = (n: number) => new Date(JETZT.getTime() - n * 86_400_000);

async function lernende(loeschenAb: Date | null) {
  const v = verschluessele({ name: '[Kind]' });
  const [z] = await db
    .insert(schema.lernende)
    .values({ datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: '[Kind] K.', loeschenAb })
    .returning({ id: schema.lernende.id });
  return z.id;
}

async function protokoll(zeitpunkt: Date, vorgaenger: string) {
  const inhalt = { kanalId: null, nachrichtId: null, akteurId: null, aktion: 'notfallpause' as const, grund: '[Test]' };
  const hash = kettenHash(vorgaenger, { ...inhalt, zeitpunkt: zeitpunkt.toISOString() });
  await db.insert(schema.moderationsprotokoll).values({ ...inhalt, zeitpunkt, vorgaengerHash: vorgaenger, hash });
  return hash;
}

async function kette() {
  const zeilen = await db.select().from(schema.moderationsprotokoll).orderBy(schema.moderationsprotokoll.id);
  const [anker] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, PROTOKOLL_ANKER));
  return { zeilen, anfang: (anker?.wert as { hash?: string } | undefined)?.hash ?? KETTEN_ANFANG };
}

describe('Löschlauf der Gemeinde-Plattform', () => {
  it('löscht nur Fälliges und ist idempotent; die Hash-Kette bleibt mit dem Anker prüfbar', async () => {
    const faellig = await lernende(tageVor(1));
    const spaeter = await lernende(new Date(JETZT.getTime() + 86_400_000));
    const aktiv = await lernende(null);

    const v = verschluessele({ an: 'niemand@beispiel.invalid' });
    await db.insert(schema.mailAusgang).values([
      { vorlage: 'test', datenVerschluesselt: v.daten, schluesselId: v.schluesselId, versuche: 6, erstelltAm: tageVor(40) },
      { vorlage: 'test', datenVerschluesselt: v.daten, schluesselId: v.schluesselId, versuche: 2, erstelltAm: tageVor(40) },
      { vorlage: 'test', datenVerschluesselt: v.daten, schluesselId: v.schluesselId, versuche: 6, erstelltAm: tageVor(5) },
    ]);
    await db.insert(schema.auditEintrag).values([
      { aktion: 'test.alt', zeitpunkt: tageVor(400) },
      { aktion: 'test.neu', zeitpunkt: tageVor(10) },
    ]);
    const [g] = await db
      .insert(schema.gruppe)
      .values({ name: { de: '[Gruppe]', tr: '[Grup]', en: '[Group]' } })
      .returning({ id: schema.gruppe.id });
    const [k] = await db.insert(schema.chatKanal).values({ gruppeId: g.id, art: 'gruppe' }).returning({ id: schema.chatKanal.id });
    const kontext = verschluessele({ nachrichten: [] });
    const meldung = {
      kanalId: k.id,
      grund: 'sonstiges' as const,
      kontextVerschluesselt: kontext.daten,
      schluesselId: kontext.schluesselId,
    };
    await db.insert(schema.chatMeldung).values([
      { ...meldung, status: 'offen', erstelltAm: tageVor(400) },
      { ...meldung, status: 'in_bearbeitung', erstelltAm: tageVor(100) },
    ]);
    const h1 = await protokoll(tageVor(4 * 365), KETTEN_ANFANG);
    const h2 = await protokoll(tageVor(3 * 365 + 5), h1);
    await protokoll(tageVor(30), h2);

    const r = await gemeindeLoeschlauf(JETZT);
    expect(r).toEqual({
      lernende: 1,
      kinderkonten: 0,
      offeneMeldungen: 1,
      protokoll: 2,
      mails: 1,
      audit: 1,
      nachweise: 0,
      inaktivGewarnt: 0,
      inaktivGeloescht: 0,
      lernappProfile: 0,
      lernappAbgaben: 0,
      lernappVerdichtet: 0,
    });

    const rest = (await db.select({ id: schema.lernende.id }).from(schema.lernende)).map((z) => z.id);
    expect(rest).not.toContain(faellig);
    expect(rest).toEqual(expect.arrayContaining([spaeter, aktiv]));
    expect((await db.select().from(schema.auditEintrag)).map((a) => a.aktion)).not.toContain('test.alt');
    expect(await db.select().from(schema.chatMeldung)).toHaveLength(1);

    // Verbleibend: Eintrag von vor 30 Tagen und der neue Löschlauf-Eintrag; Kette ab Anker h2 intakt
    const { zeilen, anfang } = await kette();
    expect(anfang).toBe(h2);
    expect(zeilen.map((z) => z.aktion)).toEqual(['notfallpause', 'loeschlauf']);
    expect(
      pruefeKette(
        zeilen.map((z) => ({ ...z, zeitpunkt: z.zeitpunkt.toISOString() })),
        anfang,
      ),
    ).toBeNull();
    expect(pruefeKette(zeilen.map((z) => ({ ...z, zeitpunkt: z.zeitpunkt.toISOString() })))).toBe(0);

    expect(await gemeindeLoeschlauf(JETZT)).toEqual({
      lernende: 0,
      kinderkonten: 0,
      offeneMeldungen: 0,
      protokoll: 0,
      mails: 0,
      audit: 0,
      nachweise: 0,
      inaktivGewarnt: 0,
      inaktivGeloescht: 0,
      lernappProfile: 0,
      lernappAbgaben: 0,
      lernappVerdichtet: 0,
    });
  });

  it('außerhalb des Löschlaufs bleibt das Protokoll unveränderlich (Trigger)', async () => {
    await expect(db.execute(sql`delete from moderationsprotokoll`)).rejects.toThrow();
  });
});
