import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { db as appDb, schema } from '@/lib/db';
import { sha256Hex } from '@/lib/lernapp/paket/hash';
import { PaketSchema, VerzeichnisSchema, type Paket, type Verzeichnis } from '@/lib/lernapp/paket/typen';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Auslieferung des Wissenskurses gegen PGlite (Endabnahme Z-L02, ADR 0040 Nr. 5, KERN 4.0 §2.3, PLAN §6.7 Nr. 7):
 * Verzeichnis `/lern-app/pakete/islam` und Einheitenpaket `/lern-app/pakete/islam/<einheit>/<hash>` aus
 * `sichtbareWissensLektion`. Eine Lektion erscheint nur, wenn ALLE ihre Bausteine (Lektion, jede Aussage – auch ohne
 * Quizfrage –, jede Quizfrage) zwei Freigaben zum aktuellen Hash von zwei verschiedenen Personen mit der Rolle haben;
 * Verfasserin und Administration zählen nicht, eine Änderung des Hashes macht sie wieder unsichtbar. Im Paket: Quellenzeile
 * je Aussage, Prüfvermerk ohne Namen, kein Audio, keine arabische Schrift. Dazu die Testeinheit aus dem Seed (Vorführpfad
 * Station 6) und die Vorrender-Parameter. Testdaten nur Platzhalter in eckigen Klammern (KI-Regel 2).
 */
const { client, db } = await verwaltungsUmgebung();
const verzeichnisRoute = await import('@/app/lern-app/pakete/[kurs]/route');
const einheitRoute = await import('@/app/lern-app/pakete/[kurs]/[einheit]/[hash]/route');
const pakete = await import('@/server/queries/lernapp/pakete');
const { lektionReligioesSichtbar } = await import('@/server/queries/lernapp/religioes');
const { lernappTestWissen, TEST_WISSEN_EINHEIT, TEST_PRUEFKONTEN } = await import('../../drizzle/seeds/lernapp-test-wissen');
const benutzer = await import('@/server/actions/benutzer');
afterAll(() => client.close());
afterEach(() => {
  delete process.env.FUNKTION_LERNAPP;
  vi.unstubAllEnvs();
});

const kontext = <T extends Record<string, unknown>>(p: T) => ({ params: Promise.resolve(p) }) as never;
const anfrage = (pfad: string) => new Request(`https://example.test${pfad}`);
const h = (z: string) => z.repeat(64);
const E = 'islam.grund.e01';
const L = `${E}.l01`;

async function verzeichnis(): Promise<Verzeichnis> {
  const r = await verzeichnisRoute.GET(anfrage('/lern-app/pakete/islam'), kontext({ kurs: 'islam' }));
  expect(r.status).toBe(200);
  expect(r.headers.get('set-cookie')).toBeNull();
  return VerzeichnisSchema.parse(await r.json());
}

async function einheitAbrufen(einheit: string, hash: string) {
  return einheitRoute.GET(anfrage(`/lern-app/pakete/islam/${einheit}/${hash}`), kontext({ kurs: 'islam', einheit, hash }));
}

async function paket(einheit = E): Promise<{ paket: Paket; text: string; hash: string; antwort: Response }> {
  const e = (await verzeichnis()).einheiten.find((x) => x.schluessel === einheit);
  expect(e, `${einheit} im Verzeichnis`).toBeDefined();
  const antwort = await einheitAbrufen(einheit, e!.hash);
  expect(antwort.status).toBe(200);
  const text = await antwort.clone().text();
  expect(sha256Hex(text)).toBe(e!.hash);
  expect(new TextEncoder().encode(text).length).toBe(e!.bytes);
  return { paket: PaketSchema.parse(JSON.parse(text)), text, hash: e!.hash, antwort };
}

const einheitenImVerzeichnis = async () => (await verzeichnis()).einheiten.map((e) => e.schluessel);

async function person(rolle: 'religioese_pruefung' | 'administration') {
  const id = randomUUID();
  await db.insert(schema.user).values({ id, name: '[Testperson]', email: `w.${id}@example.test`, emailVerified: true });
  await db.insert(schema.rolleZuweisung).values({ benutzerId: id, rolle });
  return id;
}

const ids = { lektion: '', s01: '', s02: '', b01: '', b02: '', q01: '', q02: '' };
const hash = { lektion: h('2'), s01: h('3'), s02: h('4'), b01: h('5'), b02: h('6'), q01: h('7'), q02: h('8') };
let p1 = '';
let p2 = '';
let admin = '';
let verfasserin = '';

beforeAll(async () => {
  [p1, p2, admin, verfasserin] = await Promise.all([
    person('religioese_pruefung'),
    person('religioese_pruefung'),
    person('administration'),
    person('religioese_pruefung'),
  ]);
  await db.insert(schema.lernappKurs).values({ id: 'islam', art: 'wissen', zielsprache: 'de', aktiv: true });
  const [abschnitt] = await db
    .insert(schema.lernappAbschnitt)
    .values({ kursId: 'islam', stufe: 'grund', reihenfolge: 1 })
    .returning({ id: schema.lernappAbschnitt.id });
  const [einheit] = await db
    .insert(schema.lernappEinheit)
    .values({
      abschnittId: abschnitt!.id,
      schluessel: E,
      reihenfolge: 1,
      thema: { de: '[Thema – Platzhalter]' },
      inhaltHash: h('1'),
      verfasstVon: 'ki:test',
      status: 'automatisch_geprueft',
    })
    .returning({ id: schema.lernappEinheit.id });
  const [lektion] = await db
    .insert(schema.lernappLektion)
    .values({
      einheitId: einheit!.id,
      schluessel: L,
      reihenfolge: 1,
      ziel: { de: '[Lektion – Platzhalter]' },
      kinderGeeignet: true,
      inhaltHash: hash.lektion,
      verfasstVon: 'ki:test',
      status: 'automatisch_geprueft',
    })
    .returning({ id: schema.lernappLektion.id });
  ids.lektion = lektion!.id;
  const [quelle] = await db
    .insert(schema.lernappQuelle)
    .values({ kurz: 'quduri', werk: '[Werk A]', autor: '[Autor A]', ausgabe: '[Ausgabe 1997]', art: 'fiqh' })
    .returning({ id: schema.lernappQuelle.id });
  const aussage = async (schluessel: string, nr: number, inhaltHash: string, verfasstVon: string) =>
    (
      await db
        .insert(schema.lernappAussage)
        .values({ lektionId: ids.lektion, schluessel, text: `[Aussage ${nr} – Platzhalter]`, reihenfolge: nr, inhaltHash, verfasstVon })
        .returning({ id: schema.lernappAussage.id })
    )[0]!.id;
  ids.s01 = await aussage(`${L}.s01`, 1, hash.s01, 'ki:test');
  // s02: ohne Quizfrage, zuletzt von einer Person mit der Rolle bearbeitet (Verfasserin)
  ids.s02 = await aussage(`${L}.s02`, 2, hash.s02, verfasserin);
  const beleg = async (aussageId: string, inhaltHash: string, seite: string) =>
    (
      await db
        .insert(schema.lernappBeleg)
        .values({
          aussageId,
          quelleId: quelle!.id,
          passage: 'quduri.ms0042',
          stelle: { kitab: '[Kitab]', bab: '[Bab]', band: '1', seite },
          inhaltHash,
          verfasstVon: 'ki:test',
        })
        .returning({ id: schema.lernappBeleg.id })
    )[0]!.id;
  ids.b01 = await beleg(ids.s01, hash.b01, '12');
  ids.b02 = await beleg(ids.s02, hash.b02, '13');
  const aufgabe = async (schluessel: string, nr: number, typ: string, daten: Record<string, unknown>, inhaltHash: string) =>
    (
      await db
        .insert(schema.lernappAufgabe)
        .values({ lektionId: ids.lektion, schluessel, typ, daten, reihenfolge: nr, aussageId: ids.s01, inhaltHash, verfasstVon: 'ki:test' })
        .returning({ id: schema.lernappAufgabe.id })
    )[0]!.id;
  ids.q01 = await aufgabe(
    `${L}.q01`,
    1,
    'wahr_falsch',
    { behauptung: '[Behauptung – Platzhalter]', richtig: true, begruendung: '[Begründung – Platzhalter]' },
    hash.q01,
  );
  ids.q02 = await aufgabe(
    `${L}.q02`,
    2,
    'fallfrage',
    { fall: '[Fall – Platzhalter]', frage: '[Frage – Platzhalter]', optionen: ['[A]', '[B]', '[C]'], richtig: 2 },
    hash.q02,
  );
});

type Typ = 'lektion' | 'aussage' | 'aufgabe';
const BAUSTEINE: { typ: Typ; id: () => string; hash: keyof typeof hash; beleg?: () => { belegId: string; inhaltHash: string } }[] = [
  { typ: 'lektion', id: () => ids.lektion, hash: 'lektion' },
  { typ: 'aussage', id: () => ids.s01, hash: 's01', beleg: () => ({ belegId: ids.b01, inhaltHash: hash.b01 }) },
  { typ: 'aussage', id: () => ids.s02, hash: 's02', beleg: () => ({ belegId: ids.b02, inhaltHash: hash.b02 }) },
  { typ: 'aufgabe', id: () => ids.q01, hash: 'q01' },
  { typ: 'aufgabe', id: () => ids.q02, hash: 'q02' },
];

/** Freigabe „ok“ einer Person zum aktuellen Hash (mit bestätigten Belegen) für die gewählten Bausteine. */
async function freigeben(wer: string, am: Date, nur?: (b: (typeof BAUSTEINE)[number]) => boolean) {
  for (const b of BAUSTEINE.filter((x) => !nur || nur(x)))
    await db.insert(schema.lernappPruefung).values({
      inhaltTyp: b.typ,
      inhaltId: b.id(),
      inhaltHash: hash[b.hash],
      art: 'religioes',
      pruefendeId: wer,
      urteil: 'ok',
      belegeGeprueft: b.beleg ? [b.beleg()] : [],
      am,
    });
}

describe('Wissenskurs: Verzeichnis und Einheitenpaket nur mit zwei Freigaben', () => {
  it('ohne Freigaben: Verzeichnis ohne Einheiten, Einheitenroute 404', async () => {
    const v = await verzeichnis();
    expect(v).toMatchObject({ kurs: 'islam', kursId: 'islam', zielsprache: 'de', ausgangssprache: null, einheiten: [] });
    expect((await einheitAbrufen(E, h('0'))).status).toBe(404);
    expect(await pakete.baueKurs('islam', true)).toEqual([]);
  });

  it('eine Freigabe je Baustein: nicht im Verzeichnis, nicht im Paket', async () => {
    await freigeben(p1, new Date('2026-10-20T08:00:00Z'));
    expect(await einheitenImVerzeichnis()).toEqual([]);
    expect(await lektionReligioesSichtbar(ids.lektion)).toBe(false);
  });

  it('Administration und Verfasserin zählen nicht als zweite Freigabe', async () => {
    await freigeben(admin, new Date('2026-10-20T09:00:00Z'));
    // die Verfasserin von s02 gibt alles frei – für s02 zählt sie nicht, also fehlt dort die zweite Freigabe
    await freigeben(verfasserin, new Date('2026-10-20T09:30:00Z'));
    expect(await einheitenImVerzeichnis()).toEqual([]);
    expect(await lektionReligioesSichtbar(ids.lektion)).toBe(false);
    expect(await pakete.baueKurs('islam', true)).toEqual([]);
  });

  it('zwei Personen für alle Bausteine → im Verzeichnis und im Paket (Quellenzeile, Prüfvermerk, kein Audio)', async () => {
    // zweite Person für alles außer der Aussage ohne Quizfrage: Die Lektion bleibt verborgen (alle Bausteine)
    await freigeben(p2, new Date('2026-10-21T10:00:00Z'), (b) => b.hash !== 's02');
    expect(await einheitenImVerzeichnis()).toEqual([]);
    await freigeben(p2, new Date('2026-10-22T11:00:00Z'), (b) => b.hash === 's02');
    expect(await lektionReligioesSichtbar(ids.lektion)).toBe(true);

    const { paket: p, text, antwort } = await paket();
    expect(antwort.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect(antwort.headers.get('vercel-cache-tag')).toBe('lernapp,lernapp-kurs-islam,einstellungen');
    expect(p).toMatchObject({ kurs: 'islam', zielsprache: 'de', ausgangssprache: 'de', eintraege: {}, tipps: [], audio: [] });
    expect(p.lektionen.map((l) => l.schluessel)).toEqual([L]);
    const [l] = p.lektionen;
    expect(l).toMatchObject({ kurs: 'islam', titel: '[Lektion – Platzhalter]' });
    expect(l!.aufgaben.map((a) => a.typ)).toEqual(['wahr_falsch', 'fallfrage']);
    const quelle = '[Werk A] ([Autor A]), [Kitab] › [Bab], [Ausgabe 1997], Bd. 1, S. 12';
    expect(l!.aufgaben[0]).toMatchObject({ aussage: '[Behauptung – Platzhalter]', wahr: true, sprache: 'de', quelle });
    expect(l!.aufgaben[1]).toMatchObject({ fall: '[Fall – Platzhalter]', richtig: 2, quelle });
    // Prüfvermerk: Tag, an dem der letzte Baustein seine zweite Freigabe bekam; ohne Namen und Kennungen der Prüfenden
    expect(p.wissen).toEqual({
      [L]: {
        geprueftAm: '2026-10-22',
        kinderGeeignet: true,
        aussagen: [
          { schluessel: `${L}.s01`, text: '[Aussage 1 – Platzhalter]', quelle },
          { schluessel: `${L}.s02`, text: '[Aussage 2 – Platzhalter]', quelle: quelle.replace('S. 12', 'S. 13') },
        ],
      },
    });
    for (const wer of [p1, p2, admin, verfasserin]) expect(text).not.toContain(wer);
    // kein Audio: Bündelliste leer, kein Audio-Verweis in Lektionen und Aussagen (keine Sprachausgabe, KERN 4.0 §4)
    expect(JSON.stringify([p.lektionen, p.wissen])).not.toMatch(/"(audio|stimme|clip)"\s*:/);
    expect(text).not.toMatch(/[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/);
  });

  it('Änderung des Hashes (Aussage oder Beleg) → wieder unsichtbar, die alte Adresse antwortet 404', async () => {
    const { hash: alt } = await paket();
    await db
      .update(schema.lernappBeleg)
      .set({ inhaltHash: h('9') })
      .where(eq(schema.lernappBeleg.id, ids.b02));
    expect(await einheitenImVerzeichnis()).toEqual([]);
    expect((await einheitAbrufen(E, alt)).status).toBe(404);
    await db.update(schema.lernappBeleg).set({ inhaltHash: hash.b02 }).where(eq(schema.lernappBeleg.id, ids.b02));
    expect(await einheitenImVerzeichnis()).toEqual([E]);
    await db
      .update(schema.lernappAussage)
      .set({ text: '[Aussage 1 – geändert]', inhaltHash: h('a') })
      .where(eq(schema.lernappAussage.id, ids.s01));
    expect(await einheitenImVerzeichnis()).toEqual([]);
    expect((await einheitAbrufen(E, alt)).status).toBe(404);
    expect(await lektionReligioesSichtbar(ids.lektion)).toBe(false);
    // zurück zum geprüften Stand: wieder sichtbar unter derselben Adresse (gleicher Inhalt, gleicher Hash)
    await db
      .update(schema.lernappAussage)
      .set({ text: '[Aussage 1 – Platzhalter]', inhaltHash: hash.s01 })
      .where(eq(schema.lernappAussage.id, ids.s01));
    expect((await paket()).hash).toBe(alt);
  });

  it('Quizfrage mit einer Aussage aus einer anderen Einheit → diese Einheit weder im Verzeichnis noch als Paket', async () => {
    // e02: Lektion, eigene Aussage und Quizfrage mit zwei Freigaben – die Quizfrage verweist aber auf s01 aus e01. Würde der
    // Verweis aufgelöst, nennte das Verzeichnis (alle Einheiten) einen Hash, den die Einheitenroute (nur e02) nie liefert.
    const E2 = 'islam.grund.e02';
    const [abschnitt] = await db.select({ id: schema.lernappAbschnitt.id }).from(schema.lernappAbschnitt);
    const [einheit] = await db
      .insert(schema.lernappEinheit)
      .values({
        abschnittId: abschnitt!.id,
        schluessel: E2,
        reihenfolge: 2,
        thema: { de: '[Thema 2 – Platzhalter]' },
        inhaltHash: h('b'),
        verfasstVon: 'ki:test',
        status: 'automatisch_geprueft',
      })
      .returning({ id: schema.lernappEinheit.id });
    const [lektion] = await db
      .insert(schema.lernappLektion)
      .values({
        einheitId: einheit!.id,
        schluessel: `${E2}.l01`,
        reihenfolge: 1,
        ziel: { de: '[Lektion 2 – Platzhalter]' },
        inhaltHash: h('c'),
        verfasstVon: 'ki:test',
        status: 'automatisch_geprueft',
      })
      .returning({ id: schema.lernappLektion.id });
    const [quelle] = await db.select({ id: schema.lernappQuelle.id }).from(schema.lernappQuelle);
    const [aussage] = await db
      .insert(schema.lernappAussage)
      .values({
        lektionId: lektion!.id,
        schluessel: `${E2}.l01.s01`,
        text: '[Aussage – Platzhalter]',
        reihenfolge: 1,
        inhaltHash: h('d'),
        verfasstVon: 'ki:test',
      })
      .returning({ id: schema.lernappAussage.id });
    const stelle = { kitab: '[Kitab]', seite: '20' };
    const [beleg] = await db
      .insert(schema.lernappBeleg)
      .values({
        aussageId: aussage!.id,
        quelleId: quelle!.id,
        passage: 'quduri.ms0043',
        stelle,
        inhaltHash: h('e'),
        verfasstVon: 'ki:test',
      })
      .returning({ id: schema.lernappBeleg.id });
    const [aufgabe] = await db
      .insert(schema.lernappAufgabe)
      .values({
        lektionId: lektion!.id,
        schluessel: `${E2}.l01.q01`,
        typ: 'wahr_falsch',
        daten: { behauptung: '[Behauptung – Platzhalter]', richtig: true, begruendung: '[Begründung – Platzhalter]' },
        reihenfolge: 1,
        aussageId: ids.s01,
        inhaltHash: h('f'),
        verfasstVon: 'ki:test',
      })
      .returning({ id: schema.lernappAufgabe.id });
    for (const wer of [p1, p2])
      await db.insert(schema.lernappPruefung).values(
        [
          { inhaltTyp: 'lektion' as const, inhaltId: lektion!.id, inhaltHash: h('c'), belegeGeprueft: [] },
          {
            inhaltTyp: 'aussage' as const,
            inhaltId: aussage!.id,
            inhaltHash: h('d'),
            belegeGeprueft: [{ belegId: beleg!.id, inhaltHash: h('e') }],
          },
          { inhaltTyp: 'aufgabe' as const, inhaltId: aufgabe!.id, inhaltHash: h('f'), belegeGeprueft: [] },
        ].map((x) => ({ ...x, art: 'religioes' as const, pruefendeId: wer, urteil: 'ok' as const, am: new Date('2026-10-22T12:00:00Z') })),
      );
    expect(await einheitenImVerzeichnis()).toEqual([E]);
    expect((await pakete.baueKurs('islam', true)).map((r) => r.paket.einheit.schluessel)).toEqual([E]);
    expect((await pakete.baueKurs('islam', true, E2)).length).toBe(0);
    // mit einer eigenen Aussage derselben Einheit wird sie sichtbar – Verzeichnis und Route liefern denselben Hash
    await db.update(schema.lernappAufgabe).set({ aussageId: aussage!.id }).where(eq(schema.lernappAufgabe.id, aufgabe!.id));
    expect(await einheitenImVerzeichnis()).toEqual([E, E2]);
    await paket(E2);
    await db.delete(schema.lernappEinheit).where(eq(schema.lernappEinheit.id, einheit!.id));
    expect(await einheitenImVerzeichnis()).toEqual([E]);
  });

  it('Rolle religioese_pruefung entzogen oder Konto gelöscht → Lektion sofort unsichtbar (Kurs-Tag erneuert)', async () => {
    const tag = 'lernapp-kurs-islam';
    const { hash: alt } = await paket();
    // dritte Prüferin gibt alles frei; dann wird p2 die Rolle entzogen (vor dem Start der Schutzrollen: sofort)
    const p3 = await person('religioese_pruefung');
    await freigeben(p3, new Date('2026-10-22T12:00:00Z'));
    await angemeldetAls([{ rolle: 'administration' }]);
    expect(await benutzer.rollenSpeichern({}, formular({ id: p2, rollen: 'redaktion' }))).toEqual({ ok: true });
    expect(aufrufe.updateTag).toContain(tag);
    expect(await einheitenImVerzeichnis()).toEqual([E]);
    // Konto p3 gelöscht → nur noch p1 zählt
    aufrufe.updateTag.length = 0;
    await expect(benutzer.kontoLoeschen(formular({ id: p3 }))).rejects.toThrow('NEXT_REDIRECT:/verwaltung/benutzer?meldung=geloescht');
    expect(aufrufe.updateTag).toContain(tag);
    expect(await einheitenImVerzeichnis()).toEqual([]);
    expect((await einheitAbrufen(E, alt)).status).toBe(404);
    // Rolle wieder vergeben → p2 zählt wieder, gleiche Adresse
    aufrufe.updateTag.length = 0;
    expect(await benutzer.rollenSpeichern({}, formular({ id: p2, rollen: 'religioese_pruefung' }))).toEqual({ ok: true });
    expect(aufrufe.updateTag).toContain(tag);
    expect((await paket()).hash).toBe(alt);
    // andere Rollen ändern ohne religiöse Prüfung: kein neuer Bau
    aufrufe.updateTag.length = 0;
    expect(await benutzer.rollenSpeichern({}, formular({ id: admin, rollen: ['administration', 'redaktion'] }))).toEqual({ ok: true });
    expect(aufrufe.updateTag).not.toContain(tag);
  });

  it('Zurückziehen (Status gesperrt) und Schalter lernapp aus → nicht ausgeliefert', async () => {
    const { hash: alt } = await paket();
    await db.update(schema.lernappAufgabe).set({ status: 'gesperrt' }).where(eq(schema.lernappAufgabe.id, ids.q02));
    expect(await einheitenImVerzeichnis()).toEqual([]);
    await db.update(schema.lernappAufgabe).set({ status: 'automatisch_geprueft' }).where(eq(schema.lernappAufgabe.id, ids.q02));
    process.env.FUNKTION_LERNAPP = 'aus';
    expect((await verzeichnisRoute.GET(anfrage('/x'), kontext({ kurs: 'islam' }))).status).toBe(404);
    expect((await einheitAbrufen(E, alt)).status).toBe(404);
  });

  it('Vorrendern: im Beispielmodus alle Wissens-Einheiten mit dem Hash des Verzeichnisses, sonst die erste', async () => {
    const v = await verzeichnis();
    const erwartet = v.einheiten.map((e) => ({ kurs: 'islam', einheit: e.schluessel, hash: e.hash }));
    expect((await pakete.ladePaketParameter()).filter((p) => p.kurs === 'islam')).toEqual(erwartet.slice(0, 1));
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('BAU_PGLITE', '1');
    expect((await pakete.ladePaketParameter()).filter((p) => p.kurs === 'islam')).toEqual(erwartet);
  });
});

describe('Testeinheit aus dem Seed (Vorführpfad Station 6)', () => {
  it('zeigt die Lektion mit Testfreigaben zweier Prüfkonten; die Gegenprobe mit nur einer Freigabe fehlt; idempotent', async () => {
    const am = new Date('2026-10-23T12:00:00Z');
    expect(await lernappTestWissen(appDb, am)).toEqual({ lektionen: 2, freigaben: expect.any(Number) });
    const erster = await paket(TEST_WISSEN_EINHEIT);
    expect(erster.paket.lektionen.map((l) => l.schluessel)).toEqual([`${TEST_WISSEN_EINHEIT}.l01`]);
    expect(erster.paket.lektionen[0]!.aufgaben.map((a) => a.typ)).toEqual(['wahr_falsch', 'zuordnen', 'reihenfolge', 'fallfrage']);
    expect(erster.paket.wissen?.[`${TEST_WISSEN_EINHEIT}.l01`]).toMatchObject({ geprueftAm: '2026-10-23', kinderGeeignet: true });
    expect(erster.paket.wissen?.[`${TEST_WISSEN_EINHEIT}.l01`]?.aussagen.map((a) => a.strittig ?? false)).toEqual([false, true, false]);
    // Zuordnen und Reihenfolge mit ihrer inhaltlichen Frage; die Quizfragen der strittigen Aussage s02 tragen die Kennzeichnung
    const [, zuordnen, reihenfolge, fallfrage] = erster.paket.lektionen[0]!.aufgaben;
    expect(zuordnen).toMatchObject({ frage: '[Ordne zu – Platzhalter]', strittig: true });
    expect(reihenfolge).toMatchObject({ frage: '[Ordne – Platzhalter]', strittig: true });
    expect(fallfrage).not.toHaveProperty('strittig');
    for (const k of TEST_PRUEFKONTEN) expect(erster.text).not.toContain(k);
    // zweiter Lauf: dieselbe Auslieferung
    await lernappTestWissen(appDb, am);
    expect((await paket(TEST_WISSEN_EINHEIT)).hash).toBe(erster.hash);
  });

  it('verweigert die Testfreigaben in der Produktion mit eigener Datenbank und auf der öffentlichen Test-Domain', async () => {
    vi.stubEnv('SITE_MODE', 'produktion');
    vi.stubEnv('BAU_PGLITE', '');
    expect(await lernappTestWissen(appDb)).toBeNull();
    // Vercel-Bau (Beispielmodus): nur mit ausdrücklich angefordertem Testkurs
    vi.stubEnv('BAU_PGLITE', '1');
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('LERNAPP_TESTKURS', '');
    expect(await lernappTestWissen(appDb)).toBeNull();
    vi.stubEnv('LERNAPP_TESTKURS', '1');
    expect(await lernappTestWissen(appDb, new Date('2026-10-23T12:00:00Z'))).not.toBeNull();
  });
});
