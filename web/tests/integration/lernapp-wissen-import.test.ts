import { randomUUID } from 'node:crypto';
import { and, eq, like, notLike, sql } from 'drizzle-orm';
import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import { db as appDb, schema } from '@/lib/db';
import { religioeseLage } from '@/lib/lernapp/freigabe';
import { sha256Hex } from '@/lib/lernapp/paket/hash';
import { PaketSchema, VerzeichnisSchema } from '@/lib/lernapp/paket/typen';
import type { IslamEinheitDatei } from '@/lib/lernapp/inhalt/schema';
import { WISSENS_QUELLEN } from '@/lib/lernapp/inhalt/wissen-quellen';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Wissens-Import (`lib/lernapp/inhalt/wissen-import.ts`, ADR 0040 Nr. 2/4/5) mit allen echten Inhaltsdateien
 * `inhalte/lernapp/islam/**` gegen PGlite: Bestand und Abbildung wie im Vertrag (`queries/lernapp/wissen.ts`), Status
 * „Entwurf“ ohne Prüfungen, idempotent, eine Änderung setzt die Freigaben ihres Bausteins zurück (die Bestätigung eines
 * unveränderten Belegs bleibt), menschlich Geprüftes wird nie überschrieben, Entferntes gesperrt, Fremdeinheiten (Testeinheit
 * aus dem Seed) bleiben unberührt. Ohne zwei Freigaben liefert der Paketbau nichts davon aus. Änderungen an den Dateien nur an
 * Kennzeichen (strittig) und durch Weglassen – kein neuer religiöser Text (KI-Regel 2).
 */
const { client, db } = await verwaltungsUmgebung();
const { importiereWissen } = await import('@/lib/lernapp/inhalt/wissen-import');
const { ImportFehler } = await import('@/lib/lernapp/inhalt/import');
const { inhaltsdateien } = await import('../../scripts/lernapp/inhaltsdateien');
const religioes = await import('@/server/queries/lernapp/religioes');
const pakete = await import('@/server/queries/lernapp/pakete');
const { lernappTestWissen, TEST_WISSEN_EINHEIT } = await import('../../drizzle/seeds/lernapp-test-wissen');
afterAll(() => client.close());
afterEach(() => vi.unstubAllEnvs());
const verzeichnisRoute = await import('@/app/lern-app/pakete/[kurs]/route');
const einheitRoute = await import('@/app/lern-app/pakete/[kurs]/[einheit]/[hash]/route');

const ECHT = inhaltsdateien(undefined, ['islam']);
const STAND = { standSchluessel: 'lernapp_wissen_test' };
const E01 = 'islam/taharah/islam.grund.e01.json';
/** Datei wie gespeichert (ohne die Standardwerte des Schemas, z. B. `strittig` fehlt statt `false`). */
const datei = (pfad: string) => JSON.parse(ECHT.find((q) => q.pfad === pfad)!.text) as IslamEinheitDatei;
/** Echte Quellen, eine Datei geändert (bzw. ohne die genannten Dateien). */
const mit = (pfad: string, d: IslamEinheitDatei) => ECHT.map((q) => (q.pfad === pfad ? { ...q, text: JSON.stringify(d) } : q));

const echteEinheit = notLike(schema.lernappEinheit.schluessel, `${TEST_WISSEN_EINHEIT}%`);
const anzahl = async (tabelle: string, bedingung = sql`true`) =>
  (await db.execute<{ n: number }>(sql`select count(*)::int as n from ${sql.identifier(tabelle)} where ${bedingung}`)).rows[0]?.n;
const echt = sql`schluessel not like ${`${TEST_WISSEN_EINHEIT}%`}`;
const version = async () =>
  (await db.select({ v: schema.lernappKurs.version }).from(schema.lernappKurs).where(eq(schema.lernappKurs.id, 'islam')))[0]?.v;
const aussage = async (s: string) => (await db.select().from(schema.lernappAussage).where(eq(schema.lernappAussage.schluessel, s)))[0]!;
const belegeVon = async (aussageId: string) =>
  db
    .select({ id: schema.lernappBeleg.id, inhaltHash: schema.lernappBeleg.inhaltHash })
    .from(schema.lernappBeleg)
    .where(eq(schema.lernappBeleg.aussageId, aussageId))
    .orderBy(schema.lernappBeleg.passage, schema.lernappBeleg.id);
const freigaben = async (id: string) => {
  const f = await religioes.ladeFreigabe('aussage', id);
  return religioeseLage(f!.baustein, f!.pruefungen).freigaben.length;
};

async function person() {
  const id = randomUUID();
  await db.insert(schema.user).values({ id, name: '[Testperson]', email: `wi.${id}@example.test`, emailVerified: true });
  await db.insert(schema.rolleZuweisung).values({ benutzerId: id, rolle: 'religioese_pruefung' });
  return id;
}

/** Freigabe „ok“ zum aktuellen Hash mit allen aktuellen Belegen bestätigt. */
async function freigeben(wer: string, schluessel: string) {
  const a = await aussage(schluessel);
  const belege = await belegeVon(a.id);
  await db.insert(schema.lernappPruefung).values({
    inhaltTyp: 'aussage',
    inhaltId: a.id,
    inhaltHash: a.inhaltHash,
    art: 'religioes',
    pruefendeId: wer,
    urteil: 'ok',
    belegeGeprueft: belege.map((b) => ({ belegId: b.id, inhaltHash: b.inhaltHash })),
    am: new Date('2026-10-27T08:00:00Z'),
  });
}

const BESTAND = { einheiten: 26, lektionen: 146, aussagen: 2124, belege: 4603, quizfragen: 1041 };
const ALLE = Object.values(BESTAND).reduce((a, b) => a + b, 0);

describe('Wissens-Import mit allen echten Inhaltsdateien', () => {
  it('legt Kurs, Abschnitte, Quellen und alle Bausteine im Status „Entwurf“ ohne Prüfungen an; die Testeinheit bleibt', async () => {
    expect(ECHT).toHaveLength(26);
    expect(await lernappTestWissen(appDb, new Date('2026-10-23T12:00:00Z'))).not.toBeNull();
    const pruefungenVorher = await anzahl('lernapp_pruefung');
    const b = await importiereWissen(appDb, ECHT, STAND);
    expect(b).toMatchObject({ dateien: 26, uebersprungen: 0, neu: ALLE, geaendert: 0, gesperrt: 0, konflikte: [], kurse: ['islam'] });
    expect(await anzahl('lernapp_einheit', echt)).toBe(BESTAND.einheiten);
    expect(await anzahl('lernapp_lektion', echt)).toBe(BESTAND.lektionen);
    expect(await anzahl('lernapp_aussage', echt)).toBe(BESTAND.aussagen);
    expect(await anzahl('lernapp_aufgabe', echt)).toBe(BESTAND.quizfragen);
    expect(await anzahl('lernapp_beleg', sql`passage not like 'test_quelle%'`)).toBe(BESTAND.belege);
    for (const t of ['lernapp_einheit', 'lernapp_lektion', 'lernapp_aussage', 'lernapp_aufgabe'])
      expect(await anzahl(t, sql`${echt} and (status <> 'entwurf' or verfasst_von not like 'ki:%')`), t).toBe(0);
    expect(await anzahl('lernapp_pruefung')).toBe(pruefungenVorher);
    // Kurs aktiv, Abschnitte in der Reihenfolge der Stufen
    const [kurs] = await db.select().from(schema.lernappKurs).where(eq(schema.lernappKurs.id, 'islam'));
    expect(kurs).toMatchObject({ art: 'wissen', zielsprache: 'de', aktiv: true });
    const abschnitte = await db
      .select({ stufe: schema.lernappAbschnitt.stufe, reihenfolge: schema.lernappAbschnitt.reihenfolge })
      .from(schema.lernappAbschnitt)
      .where(eq(schema.lernappAbschnitt.kursId, 'islam'))
      .orderBy(schema.lernappAbschnitt.reihenfolge);
    expect(abschnitte).toEqual([
      { stufe: 'grund', reihenfolge: 1 },
      { stufe: 'aufbau', reihenfolge: 2 },
      { stufe: 'vertiefung', reihenfolge: 3 },
    ]);
    // Quellen je Werk aus dem Register, Ausgabe aus den Belegen
    const quellen = await db.select().from(schema.lernappQuelle).where(notLike(schema.lernappQuelle.kurz, 'test_%'));
    expect(quellen.map((q) => q.kurz).sort()).toEqual([
      'fiqh_akbar',
      'hidaya',
      'ikhtiyar',
      'nur_al_idah',
      'quduri',
      'radd_al_muhtar',
      'tahawiyya',
    ]);
    for (const q of quellen) {
      const r = WISSENS_QUELLEN[q.kurz as keyof typeof WISSENS_QUELLEN];
      expect(q).toMatchObject({ werk: r.werk, autor: r.autor, todesjahr: r.todesjahr, art: r.art, openitiUri: r.openitiUri });
    }
    expect(quellen.find((q) => q.kurz === 'quduri')?.ausgabe).toBe(datei(E01).lektionen[0]!.aussagen[0]!.belege[1]!.ausgabe);
    // Abbildung wie im Vertrag: Lektion, Aussage, Beleg, Quizfrage
    const d = datei(E01);
    const [l01] = await db.select().from(schema.lernappLektion).where(eq(schema.lernappLektion.schluessel, d.lektionen[0]!.schluessel));
    expect(l01).toMatchObject({ ziel: { de: d.lektionen[0]!.titel }, kinderGeeignet: d.lektionen[0]!.kinderGeeignet, reihenfolge: 1 });
    const a01 = d.lektionen[0]!.aussagen[0]!;
    expect(await aussage(a01.schluessel)).toMatchObject({
      text: a01.text,
      strittig: a01.strittig ?? false,
      reihenfolge: 1,
      quelle: a01.quelle,
    });
    const belege = await db
      .select()
      .from(schema.lernappBeleg)
      .where(eq(schema.lernappBeleg.aussageId, (await aussage(a01.schluessel)).id));
    expect(belege.map((x) => x.passage).sort()).toEqual(a01.belege.map((x) => x.passage).sort());
    const b0 = belege.find((x) => x.passage === a01.belege[0]!.passage)!;
    expect(b0.stelle).toEqual({ kitab: a01.belege[0]!.kapitel, band: String(a01.belege[0]!.band), seite: String(a01.belege[0]!.seite) });
    expect(b0).toMatchObject({ zitatVon: a01.belege[0]!.zitatVon, zitatBis: a01.belege[0]!.zitatBis, art: 'sinngemaess' });
    const q01 = d.lektionen[0]!.aufgaben[0]!;
    const [aufgabe] = await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.schluessel, q01.schluessel));
    const { schluessel: _s, typ: _t, aussage: ziel, quelle: _q, lizenz: _l, ...daten } = q01;
    expect(aufgabe).toMatchObject({ typ: q01.typ, daten, aussageId: (await aussage(ziel)).id });
    // jede Quizfrage hängt an einer Aussage derselben Einheit
    const fremd = await db.execute<{ n: number }>(sql`
      select count(*)::int as n from lernapp_aufgabe q
      join lernapp_lektion lq on lq.id = q.lektion_id
      left join lernapp_aussage a on a.id = q.aussage_id
      left join lernapp_lektion la on la.id = a.lektion_id
      where q.schluessel like 'islam.%' and q.schluessel not like ${`${TEST_WISSEN_EINHEIT}%`}
        and (la.einheit_id is null or la.einheit_id <> lq.einheit_id)`);
    expect(fremd.rows[0]?.n).toBe(0);
    // Testeinheit aus dem Seed unverändert
    const [test] = await db.select().from(schema.lernappEinheit).where(eq(schema.lernappEinheit.schluessel, TEST_WISSEN_EINHEIT));
    expect(test?.status).toBe('automatisch_geprueft');
  });

  it('ohne zwei Freigaben liefert der Paketbau nichts davon aus (nur die Testeinheit mit Testfreigaben)', async () => {
    expect((await pakete.baueKurs('islam', true)).map((r) => r.paket.einheit.schluessel)).toEqual([TEST_WISSEN_EINHEIT]);
  });

  it('Vorschau an (L3-E22): Verzeichnis mit allen 26 Einheiten als Entwurf, Paket über die Route mit passendem Hash; aus: nur die Testeinheit', async () => {
    const kontext = <T extends Record<string, unknown>>(p: T) => ({ params: Promise.resolve(p) }) as never;
    const anfrage = (pfad: string) => new Request(`https://example.test${pfad}`);
    const verzeichnis = async () => {
      const r = await verzeichnisRoute.GET(anfrage('/lern-app/pakete/islam'), kontext({ kurs: 'islam' }));
      expect(r.status).toBe(200);
      return VerzeichnisSchema.parse(await r.json());
    };
    // Standard der Tests: aus (tests/integration/hilfen/umgebung.ts)
    expect((await verzeichnis()).einheiten.map((e) => e.schluessel)).toEqual([TEST_WISSEN_EINHEIT]);
    vi.stubEnv('FUNKTION_LERNAPP_WISSEN_VORSCHAU', 'an');
    const v = await verzeichnis();
    const echteEinheiten = v.einheiten.filter((e) => e.schluessel !== TEST_WISSEN_EINHEIT);
    expect(echteEinheiten).toHaveLength(BESTAND.einheiten);
    expect(echteEinheiten.every((e) => e.vorschau === true)).toBe(true);
    expect(echteEinheiten.reduce((n, e) => n + e.lektionen, 0)).toBe(BESTAND.lektionen);
    // Testeinheit: l01 mit Testfreigaben geprüft, die Gegenprobe l02 (nur eine Freigabe) kommt als Entwurf
    expect(v.einheiten.find((e) => e.schluessel === TEST_WISSEN_EINHEIT)).toMatchObject({ vorschau: true, lektionen: 2 });
    // Reihenfolge: Stufen grund → aufbau → vertiefung
    const stufen = v.einheiten.map((e) => e.stufe);
    expect(stufen).toEqual(
      [...stufen].sort((a, b) => ['grund', 'aufbau', 'vertiefung'].indexOf(a) - ['grund', 'aufbau', 'vertiefung'].indexOf(b)),
    );
    const e01 = v.einheiten.find((e) => e.schluessel === 'islam.grund.e01')!;
    const antwort = await einheitRoute.GET(
      anfrage(`/lern-app/pakete/islam/islam.grund.e01/${e01.hash}`),
      kontext({ kurs: 'islam', einheit: 'islam.grund.e01', hash: e01.hash }),
    );
    expect(antwort.status).toBe(200);
    const text = await antwort.text();
    expect(sha256Hex(text)).toBe(e01.hash);
    const paket = PaketSchema.parse(JSON.parse(text));
    expect(paket.vorschau).toBe(true);
    expect(Object.values(paket.wissen ?? {}).every((x) => 'entwurf' in x && x.entwurf === true)).toBe(true);
    expect(paket.lektionen.map((l) => l.schluessel)).toEqual(datei(E01).lektionen.map((l) => l.schluessel));
    // Quellenzeile mit Werk und Verfasser aus dem Register
    expect(paket.wissen?.[paket.lektionen[0]!.schluessel]?.aussagen[0]?.quelle).toContain(`${WISSENS_QUELLEN.nur_al_idah.werk} (`);
    // Vorrendern im Beispielmodus: alle Einheiten mit den Hashes des Verzeichnisses
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('BAU_PGLITE', '1');
    expect((await pakete.ladePaketParameter()).filter((p) => p.kurs === 'islam')).toEqual(
      v.einheiten.map((e) => ({ kurs: 'islam', einheit: e.schluessel, hash: e.hash })),
    );
    // wieder aus: der alte Entwurfs-Hash antwortet 404
    vi.stubEnv('FUNKTION_LERNAPP_WISSEN_VORSCHAU', 'aus');
    const aus = await einheitRoute.GET(
      anfrage(`/lern-app/pakete/islam/islam.grund.e01/${e01.hash}`),
      kontext({ kurs: 'islam', einheit: 'islam.grund.e01', hash: e01.hash }),
    );
    expect(aus.status).toBe(404);
  });

  it('die Prüfwarteschlange zeigt die importierten Aussagen mit Stand 0/2', async () => {
    const wer = await person();
    const liste = await religioes.ladeReligioeseBausteine(wer);
    const a01 = datei(E01).lektionen[0]!.aussagen[0]!.schluessel;
    expect(liste.find((x) => x.typ === 'aussage' && x.schluessel === a01)).toMatchObject({ stand: 0, status: 'entwurf', kurs: 'islam' });
    expect(liste.filter((x) => x.kurs === 'islam' && x.typ === 'aussage' && !x.schluessel.startsWith(TEST_WISSEN_EINHEIT))).toHaveLength(
      BESTAND.aussagen,
    );
  });

  it('zweiter Lauf: alles übersprungen; erzwungen: alles gleich, nichts neu oder geändert', async () => {
    const v = await version();
    expect(await importiereWissen(appDb, ECHT, STAND)).toMatchObject({ uebersprungen: 26, neu: 0, geaendert: 0, gesperrt: 0, kurse: [] });
    expect(await importiereWissen(appDb, ECHT, { ...STAND, erzwingen: true })).toMatchObject({
      uebersprungen: 0,
      neu: 0,
      geaendert: 0,
      unveraendert: ALLE,
      gesperrt: 0,
      belegeEntfernt: 0,
      kurse: [],
    });
    expect(await version()).toBe(v);
  });

  it('Änderung: neuer Hash, die zwei Freigaben zählen nicht mehr; unveränderte Belege und Aussagen behalten ihre Freigaben', async () => {
    const d = datei(E01);
    const [a, b, c] = [d.lektionen[0]!.aussagen[0]!, d.lektionen[0]!.aussagen[1]!, d.lektionen[0]!.aussagen[2]!];
    const [p1, p2] = [await person(), await person()];
    for (const wer of [p1, p2]) for (const s of [a, b, c]) await freigeben(wer, s.schluessel);
    const vorher = { a: await aussage(a.schluessel), belegeA: await belegeVon((await aussage(a.schluessel)).id) };
    const belegeC = await belegeVon((await aussage(c.schluessel)).id);
    for (const s of [a, b, c]) expect(await freigaben((await aussage(s.schluessel)).id), s.schluessel).toBe(2);
    const v = await version();
    // a: Kennzeichnung „strittig“ geändert; c: ein Beleg weniger
    const neu = structuredClone(d);
    neu.lektionen[0]!.aussagen[0]!.strittig = !a.strittig;
    const weg = neu.lektionen[0]!.aussagen[2]!.belege.pop()!;
    const r = await importiereWissen(appDb, mit(E01, neu), STAND);
    expect(r).toMatchObject({ uebersprungen: 25, geaendert: 1, belegeEntfernt: 1, gesperrt: 0, konflikte: [], kurse: ['islam'] });
    expect(await version()).toBe(v! + 1);
    const nachher = await aussage(a.schluessel);
    expect(nachher.inhaltHash).not.toBe(vorher.a.inhaltHash);
    expect(nachher).toMatchObject({ strittig: !a.strittig, status: 'entwurf', id: vorher.a.id });
    expect(await freigaben(nachher.id)).toBe(0);
    // die Belege von a sind dieselben Zeilen (gleiche Kennung und gleicher Hash)
    expect(await belegeVon(nachher.id)).toEqual(vorher.belegeA);
    // b unverändert: zählt weiter; c: der verbliebene Beleg ist bestätigt → zählt weiter, der entfallene ist weg
    expect(await freigaben((await aussage(b.schluessel)).id)).toBe(2);
    const cNachher = await belegeVon((await aussage(c.schluessel)).id);
    expect(cNachher).toHaveLength(belegeC.length - 1);
    for (const x of cNachher) expect(belegeC).toContainEqual(x);
    expect(await freigaben((await aussage(c.schluessel)).id)).toBe(2);
    expect(weg.passage).toMatch(/\.ms\d+$/);
  });

  it('menschlich geprüft: nie überschrieben, sondern als Konflikt vermerkt', async () => {
    const d = datei(E01);
    const b = d.lektionen[0]!.aussagen[1]!;
    const vorher = await aussage(b.schluessel);
    await db.update(schema.lernappAussage).set({ menschlichGeprueft: true }).where(eq(schema.lernappAussage.id, vorher.id));
    const neu = structuredClone(d);
    neu.lektionen[0]!.aussagen[0]!.strittig = !d.lektionen[0]!.aussagen[0]!.strittig;
    neu.lektionen[0]!.aussagen[2]!.belege.pop();
    neu.lektionen[0]!.aussagen[1]!.strittig = !b.strittig;
    const r = await importiereWissen(appDb, mit(E01, neu), STAND);
    expect(r.konflikte).toEqual([
      expect.objectContaining({ tabelle: 'lernapp_aussage', schluessel: b.schluessel, datei: E01, hashDatenbank: vorher.inhaltHash }),
    ]);
    expect(r.geaendert).toBe(0);
    expect(await aussage(b.schluessel)).toMatchObject({ inhaltHash: vorher.inhaltHash, strittig: b.strittig ?? false });
    const [stand] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, STAND.standSchluessel));
    expect((stand?.wert as { konflikte: unknown[] }).konflikte).toHaveLength(1);
    await db.update(schema.lernappAussage).set({ menschlichGeprueft: false }).where(eq(schema.lernappAussage.id, vorher.id));
  });

  it('entfernte Lektion (mit Aussagen und Quizfragen) → gesperrt und als entfernt geführt', async () => {
    const d = datei(E01);
    const letzte = d.lektionen.at(-1)!;
    const neu = { ...d, lektionen: d.lektionen.slice(0, -1) };
    const r = await importiereWissen(appDb, mit(E01, neu), STAND);
    expect(r.gesperrt).toBe(1 + letzte.aussagen.length + letzte.aufgaben.length);
    // die übrigen Aussagen von e01 l01 tragen wieder den Stand der Datei (a geändert zurück, b gleich)
    expect(r.geaendert).toBe(1);
    const unter = (t: typeof schema.lernappAussage | typeof schema.lernappAufgabe | typeof schema.lernappLektion) =>
      and(like(t.schluessel, `${letzte.schluessel}%`), eq(t.status, 'gesperrt'));
    expect((await db.select().from(schema.lernappLektion).where(unter(schema.lernappLektion))).length).toBe(1);
    expect((await db.select().from(schema.lernappAussage).where(unter(schema.lernappAussage))).length).toBe(letzte.aussagen.length);
    expect((await db.select().from(schema.lernappAufgabe).where(unter(schema.lernappAufgabe))).length).toBe(letzte.aufgaben.length);
    const [stand] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, STAND.standSchluessel));
    expect((stand?.wert as { entfernt: string[] }).entfernt).toEqual(letzte.aufgaben.map((a) => a.schluessel).sort());
  });

  it('entfernte Datei → ihre Einheit samt Bausteinen gesperrt; andere Einheiten und die Testeinheit unberührt', async () => {
    const pfad = 'islam/zakat/islam.aufbau.e04.json';
    const d = datei(pfad);
    const r = await importiereWissen(
      appDb,
      ECHT.filter((q) => q.pfad !== pfad),
      STAND,
    );
    const lektionen = d.lektionen.length;
    const aussagen = d.lektionen.reduce((n, l) => n + l.aussagen.length, 0);
    const quiz = d.lektionen.reduce((n, l) => n + l.aufgaben.length, 0);
    expect(r.gesperrt).toBe(1 + lektionen + aussagen + quiz);
    const [e] = await db.select().from(schema.lernappEinheit).where(eq(schema.lernappEinheit.schluessel, d.einheit.schluessel));
    expect(e?.status).toBe('gesperrt');
    expect(await anzahl('lernapp_einheit', sql`${echt} and status = 'gesperrt'`)).toBe(1);
    const [test] = await db.select().from(schema.lernappEinheit).where(eq(schema.lernappEinheit.schluessel, TEST_WISSEN_EINHEIT));
    expect(test?.status).toBe('automatisch_geprueft');
    expect(await anzahl('lernapp_einheit', sql`${echt}`)).toBe(BESTAND.einheiten);
    expect((await db.select().from(schema.lernappEinheit).where(echteEinheit)).length).toBe(BESTAND.einheiten);
  });

  it('kaputte Dateien brechen alles ab, ohne etwas zu schreiben', async () => {
    const v = await version();
    const d = datei(E01);
    // falscher Ablageort
    await expect(
      importiereWissen(appDb, [...ECHT.slice(1), { pfad: 'islam/akaid/islam.grund.e01.json', text: JSON.stringify(d) }], STAND),
    ).rejects.toBeInstanceOf(ImportFehler);
    // abweichende Ausgabe eines Werks
    const anders = structuredClone(d);
    anders.lektionen[0]!.aussagen[0]!.belege[0]!.ausgabe = '[andere Ausgabe]';
    await expect(importiereWissen(appDb, mit(E01, anders), STAND)).rejects.toThrow(/Ausgabe von/);
    // arabische Schrift
    const arabisch = structuredClone(d);
    arabisch.lektionen[0]!.titel = `${d.lektionen[0]!.titel} ب`;
    await expect(importiereWissen(appDb, mit(E01, arabisch), STAND)).rejects.toBeInstanceOf(ImportFehler);
    expect(await version()).toBe(v);
  });
});
