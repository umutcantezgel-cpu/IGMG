import { randomUUID } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Löschfristen der Lern-App (KERN 4.0 §6, ADR 0038 Nr. 10) gegen PGlite: Lernstand 12 Monate nach der letzten Aktivität
 * (Profil mit Ereignissen, Karten und Lerntagen über die Fremdschlüssel), Schreibabgaben 12 Monate nach der Abgabe;
 * Konto löschen kaskadiert alles. Idempotent. Testdaten fiktiv, Texte neutral.
 */
const { client, db } = await verwaltungsUmgebung();
const { gemeindeLoeschlauf, GEMEINDE_FRISTEN } = await import('@/lib/loeschen/gemeinde');
afterAll(() => client.close());

const JETZT = new Date('2026-10-17T03:00:00Z');
const TAG = 86_400_000;
const tageVor = (n: number) => new Date(JETZT.getTime() - n * TAG);

async function konto(name: string): Promise<string> {
  const id = randomUUID();
  await db.insert(schema.user).values({ id, name: `Testperson ${name}`, email: `testperson.${id}@example.test`, emailVerified: true });
  return id;
}

/** Profil mit je einem Ereignis, einer Karte und einem Lerntag. */
async function lernstand(benutzerId: string, zuletztAktivAm: Date): Promise<void> {
  await db.insert(schema.lernappProfil).values({ benutzerId, zuletztAktivAm });
  await db.insert(schema.lernappEreignis).values({
    benutzerId,
    geraet: randomUUID(),
    seq: 1,
    am: zuletztAktivAm,
    tag: zuletztAktivAm.toISOString().slice(0, 10),
    art: 'xp',
    daten: { xp: 10 },
  });
  await db.insert(schema.lernappKarte).values({ benutzerId, karte: 'tr-aus-de:tr.l.00001', zustand: { stabilitaet: 1 } });
  await db.insert(schema.lernappTag).values({ benutzerId, tag: zuletztAktivAm.toISOString().slice(0, 10), xp: 10 });
}

async function abgabe(benutzerId: string, eingereichtAm: Date, loeschenAb: Date): Promise<string> {
  const v = verschluessele('[Text einer Schreibübung]');
  const [z] = await db
    .insert(schema.lernappSchreibabgabe)
    .values({
      benutzerId,
      aufgabeSchluessel: 'de.b1.e01.l06.a01',
      textVerschluesselt: v.daten,
      schluesselId: v.schluesselId,
      eingereichtAm,
      loeschenAb,
    })
    .returning({ id: schema.lernappSchreibabgabe.id });
  return z.id;
}

const anzahl = async (tabelle: string, benutzerId: string) =>
  (await db.execute<{ n: number }>(sql`select count(*)::int as n from ${sql.identifier(tabelle)} where benutzer_id = ${benutzerId}`))
    .rows[0]?.n;

describe('Löschlauf der Lern-App', () => {
  it('Fristen: 12 Monate Inaktivität, Schreibabgaben 12 Monate', () => {
    expect(GEMEINDE_FRISTEN.lernappInaktivMonate).toBe(12);
    expect(GEMEINDE_FRISTEN.lernappAbgabeMonate).toBe(12);
  });

  it('löscht inaktive Lernstände samt Ereignissen, Karten und Lerntagen und alte Schreibabgaben – idempotent', async () => {
    const inaktiv = await konto('Inaktiv');
    const aktiv = await konto('Aktiv');
    const knapp = await konto('Knapp');
    await lernstand(inaktiv, new Date('2025-10-16T03:00:00Z')); // länger als 12 Monate
    await lernstand(aktiv, tageVor(3));
    await lernstand(knapp, new Date('2025-10-18T03:00:00Z')); // noch keine 12 Monate
    const alt = await abgabe(aktiv, tageVor(370), tageVor(5));
    const ohneFrist = await abgabe(aktiv, new Date('2025-10-16T00:00:00Z'), new Date('2027-01-01T00:00:00Z'));
    const neu = await abgabe(aktiv, tageVor(10), new Date(JETZT.getTime() + 355 * TAG));

    const r = await gemeindeLoeschlauf(JETZT);
    expect(r.lernappProfile).toBe(1);
    expect(r.lernappAbgaben).toBe(2);
    for (const tabelle of ['lernapp_profil', 'lernapp_ereignis', 'lernapp_karte', 'lernapp_tag']) {
      expect(await anzahl(tabelle, inaktiv), tabelle).toBe(0);
      expect(await anzahl(tabelle, aktiv), tabelle).toBe(1);
      expect(await anzahl(tabelle, knapp), tabelle).toBe(1);
    }
    const reste = (await db.select({ id: schema.lernappSchreibabgabe.id }).from(schema.lernappSchreibabgabe)).map((z) => z.id);
    expect(reste).toEqual([neu]);
    expect(reste).not.toContain(alt);
    expect(reste).not.toContain(ohneFrist);
    // Das Konto selbst bleibt (nur der Lernstand ist gelöscht)
    expect(await db.select().from(schema.user).where(eq(schema.user.id, inaktiv))).toHaveLength(1);

    const zweiter = await gemeindeLoeschlauf(JETZT);
    expect(zweiter.lernappProfile).toBe(0);
    expect(zweiter.lernappAbgaben).toBe(0);
  });

  it('Konto löschen kaskadiert Lernstand und Schreibabgaben (Art. 17)', async () => {
    const weg = await konto('Weg');
    await lernstand(weg, tageVor(1));
    await abgabe(weg, tageVor(1), new Date(JETZT.getTime() + 300 * TAG));
    await db.delete(schema.user).where(eq(schema.user.id, weg));
    for (const tabelle of ['lernapp_profil', 'lernapp_ereignis', 'lernapp_karte', 'lernapp_tag', 'lernapp_schreibabgabe'])
      expect(await anzahl(tabelle, weg), tabelle).toBe(0);
  });

  it('Ereignisse sind je Konto, Gerät und Folgenummer eindeutig; doppeltes Senden ändert nichts', async () => {
    const k = await konto('Doppelt');
    await db.insert(schema.lernappProfil).values({ benutzerId: k });
    const geraet = randomUUID();
    const ereignis = {
      benutzerId: k,
      geraet,
      seq: 7,
      am: tageVor(1),
      tag: '2026-10-16',
      art: 'lektion' as const,
      daten: { lektion: 'tr.a1.e01.l01' },
    };
    const erst = await db
      .insert(schema.lernappEreignis)
      .values(ereignis)
      .onConflictDoNothing()
      .returning({ id: schema.lernappEreignis.id });
    const noch = await db
      .insert(schema.lernappEreignis)
      .values(ereignis)
      .onConflictDoNothing()
      .returning({ id: schema.lernappEreignis.id });
    expect(erst).toHaveLength(1);
    expect(noch).toHaveLength(0);
    // Ohne Profil kein Ereignis (Fremdschlüssel): Abgleich legt das Profil zuerst an
    await expect(db.insert(schema.lernappEreignis).values({ ...ereignis, benutzerId: await konto('OhneProfil') })).rejects.toThrow();
  });
});
