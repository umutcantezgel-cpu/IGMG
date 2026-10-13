import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { verschluessele } from '@/lib/krypto';
import { tagPlus } from '@/lib/lernen/termine';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Lernplattform-Unterricht (AUFTRAG 3.5): Termine aus der Serie, Anwesenheit mit Vorbelegung aus Fehlmeldungen,
 * Fortschritt und Hifz nur durch die Lehrkraft der Gruppe, Eltern nur für ihr Kind, Gruppenisolation.
 */
const { client, db } = await verwaltungsUmgebung();
const lernen = await import('@/lib/lernen/dienst');
const { ladeGruppenKontext } = await import('@/lib/rechte/gemeinde');
afterAll(() => client.close());

const heute = berlinerDatum(new Date());

async function person(name: string): Promise<string> {
  const id = randomUUID();
  await db.insert(schema.user).values({ id, name, email: `${id.slice(0, 8)}@example.test`, emailVerified: true });
  return id;
}
async function kind(name: string): Promise<string> {
  const v = verschluessele({ name });
  const [z] = await db
    .insert(schema.lernende)
    .values({ datenVerschluesselt: v.daten, schluesselId: v.schluesselId, anzeigename: name, sechzehnAm: '2031-01-01' })
    .returning({ id: schema.lernende.id });
  return z.id;
}

const p = {} as Record<'hoca' | 'aufsicht' | 'hocaB' | 'eltern', string>;
const l = {} as Record<'a' | 'b' | 'c', string>;
let gruppeA: string;
let gruppeB: string;

beforeAll(async () => {
  const wochentage = [0, 1, 2, 3, 4, 5, 6];
  [{ id: gruppeA }] = await db
    .insert(schema.gruppe)
    .values({ name: { de: 'Gruppe A' }, wochentage, uhrzeitVon: '10:00', uhrzeitBis: '12:00', beginn: tagPlus(heute, -14) })
    .returning({ id: schema.gruppe.id });
  [{ id: gruppeB }] = await db
    .insert(schema.gruppe)
    .values({ name: { de: 'Gruppe B' }, wochentage: [6] })
    .returning({ id: schema.gruppe.id });
  p.hoca = await person('Hoca A');
  p.aufsicht = await person('Aufsicht A');
  p.hocaB = await person('Hoca B');
  p.eltern = await person('Eltern A');
  await db.insert(schema.gruppenLeitung).values([
    { gruppeId: gruppeA, benutzerId: p.hoca, rolle: 'lehrkraft' },
    { gruppeId: gruppeA, benutzerId: p.aufsicht, rolle: 'aufsicht' },
    { gruppeId: gruppeB, benutzerId: p.hocaB, rolle: 'lehrkraft' },
  ]);
  l.a = await kind('Kind A');
  l.b = await kind('Kind B');
  l.c = await kind('Kind C');
  await db.insert(schema.gruppenMitglied).values([
    { gruppeId: gruppeA, lernendeId: l.a, seit: tagPlus(heute, -30) },
    { gruppeId: gruppeA, lernendeId: l.b, seit: tagPlus(heute, -30) },
    { gruppeId: gruppeB, lernendeId: l.c, seit: tagPlus(heute, -30) },
  ]);
  await db.insert(schema.elternKind).values({ elternId: p.eltern, lernendeId: l.a });
  await db.insert(schema.lehrplanStufe).values([
    { kursart: 'elifbe', reihenfolge: 1, titel: { de: 'Stufe 1' } },
    { kursart: 'elifbe', reihenfolge: 2, titel: { de: 'Stufe 2' } },
  ]);
  await db
    .insert(schema.quranQuelle)
    .values({ id: 'test', bezeichnung: 'Test', url: 'https://example.test', version: '1', sha256: 'x', lizenz: 'x' });
  await db.insert(schema.quranSure).values({ nr: 1, nameAr: 'x', verseAnzahl: 7, quelleId: 'test' });
});

describe('Termine', () => {
  it('erzeugt die Serie idempotent', async () => {
    const neu = await lernen.erzeugeTermine(gruppeA, tagPlus(heute, -7), tagPlus(heute, 7));
    expect(neu).toBe(15);
    expect(await lernen.erzeugeTermine(gruppeA, tagPlus(heute, -7), tagPlus(heute, 7))).toBe(0);
  });

  it('Lehrkraft sieht nur Termine ihrer Gruppen', async () => {
    const a = await lernen.termineDerLeitung(await ladeGruppenKontext(p.hoca), heute, heute);
    expect(a).toHaveLength(1);
    expect(a[0].gruppe).toBe('Gruppe A');
    expect(await lernen.termineDerLeitung(await ladeGruppenKontext(p.eltern), heute, heute)).toEqual([]);
  });
});

describe('Anwesenheit (B-23)', () => {
  it('Fehlmeldung der Eltern belegt „entschuldigt“ vor; Erfassung nur für Mitglieder', async () => {
    const elternKontext = await ladeGruppenKontext(p.eltern);
    expect(await lernen.meldeFehlen(l.a, heute, 'krank', elternKontext)).toBe(true);
    await expect(lernen.meldeFehlen(l.b, heute, 'krank', elternKontext)).rejects.toThrow();
    const [termin] = await lernen.termineDerLeitung(await ladeGruppenKontext(p.hoca), heute, heute);
    const liste = (await lernen.anwesenheitsListe(termin.id, await ladeGruppenKontext(p.aufsicht)))!;
    expect(liste.zeilen.map((z) => [z.name, z.status])).toEqual([
      ['Kind A', 'entschuldigt'],
      ['Kind B', 'anwesend'],
    ]);
    const gespeichert = await lernen.erfasseAnwesenheit(
      termin.id,
      [
        { lernendeId: l.a, status: 'entschuldigt' },
        { lernendeId: l.b, status: 'verspaetet', notiz: 'Bus' },
        { lernendeId: l.c, status: 'anwesend' },
      ],
      await ladeGruppenKontext(p.hoca),
    );
    expect(gespeichert).toBe(2);
    const zeile = await db.select().from(schema.anwesenheit).where(eq(schema.anwesenheit.lernendeId, l.b));
    expect(Buffer.from(zeile[0].notizVerschluesselt!).toString('utf8')).not.toContain('Bus');
  });

  it('fremde Lehrkraft und Eltern dürfen nicht erfassen (Gruppenisolation)', async () => {
    const [termin] = await lernen.termineDerLeitung(await ladeGruppenKontext(p.hoca), heute, heute);
    await expect(lernen.anwesenheitsListe(termin.id, await ladeGruppenKontext(p.hocaB))).rejects.toThrow();
    await expect(lernen.anwesenheitsListe(termin.id, await ladeGruppenKontext(p.eltern))).rejects.toThrow();
  });
});

describe('Fortschritt und Hifz', () => {
  it('nur die Lehrkraft (nicht die Aufsicht) setzt Fortschritt', async () => {
    const [stufe] = await db.select().from(schema.lehrplanStufe).where(eq(schema.lehrplanStufe.reihenfolge, 1));
    expect(await lernen.setzeFortschritt(gruppeA, l.a, stufe.id, 'sicher', await ladeGruppenKontext(p.hoca))).toBe(true);
    await expect(lernen.setzeFortschritt(gruppeA, l.a, stufe.id, 'abgeschlossen', await ladeGruppenKontext(p.aufsicht))).rejects.toThrow();
    expect(await lernen.setzeFortschritt(gruppeA, l.c, stufe.id, 'sicher', await ladeGruppenKontext(p.hoca))).toBe(false);
    const f = await lernen.fortschrittDerGruppe(gruppeA, 'elifbe', await ladeGruppenKontext(p.hoca));
    expect(f.stufen).toHaveLength(2);
    expect(f.lernende.find((x) => x.id === l.a)?.stand[stufe.id]).toBe('sicher');
  });

  it('Hifz prüft Sure und Verse gegen den Koran', async () => {
    const k = await ladeGruppenKontext(p.hoca);
    expect(await lernen.trageHifzEin(gruppeA, { lernendeId: l.a, sure: 1, vonVers: 1, bisVers: 7, bewertung: 5 }, k)).toBe(true);
    expect(await lernen.trageHifzEin(gruppeA, { lernendeId: l.a, sure: 1, vonVers: 1, bisVers: 8, bewertung: 5 }, k)).toBe(false);
    expect(await lernen.trageHifzEin(gruppeA, { lernendeId: l.a, sure: 1, vonVers: 1, bisVers: 3, bewertung: 6 }, k)).toBe(false);
  });

  it('Eltern sehen ihr Kind, nicht andere', async () => {
    const k = await ladeGruppenKontext(p.eltern);
    const u = await lernen.lernendenUebersicht(l.a, k);
    expect(u.gruppen.map((g) => g.name.de)).toEqual(['Gruppe A']);
    expect(u.fortschritt).toHaveLength(1);
    expect(u.hifz).toHaveLength(1);
    expect(u.fehlmeldungen).toHaveLength(1);
    await expect(lernen.lernendenUebersicht(l.b, k)).rejects.toThrow();
  });
});
