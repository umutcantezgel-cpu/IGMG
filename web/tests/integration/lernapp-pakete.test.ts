import { randomUUID } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { and, eq, inArray, like } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { db as appDb, schema } from '@/lib/db';
import { kanonisch, sha256Hex } from '@/lib/lernapp/paket/hash';
import { PaketSchema, VerzeichnisSchema, type Paket, type Verzeichnis } from '@/lib/lernapp/paket/typen';
import { aufrufe, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Kurspakete und Audio-Route der Lern-App (ADR 0039, ADR 0040 Nr. 5, ADR 0041 Nr. 2/8) gegen PGlite mit dem Testkurs:
 * Pakete enthalten nur Ausgeliefertes (Status, Sprachprüfung, zwei religiöse Freigaben, Schalter `lernapp_ungeprueft`),
 * Zurückziehen ruft `updateTag` und wirkt sofort, Routen mit Kopfzeilen nach S5, Schalter `lernapp` aus → 404.
 */
const { client, db } = await verwaltungsUmgebung();
const { lernappTestkurs, TESTAUDIO_VERZEICHNIS } = await import('../../drizzle/seeds/lernapp-test');
const pakete = await import('@/server/queries/lernapp/pakete');
const verzeichnisRoute = await import('@/app/lern-app/pakete/[kurs]/route');
const einheitRoute = await import('@/app/lern-app/pakete/[kurs]/[einheit]/[hash]/route');
const audioRoute = await import('@/app/lern-app/audio/[...pfad]/route');
const { zieheZurueck } = await import('@/lib/lernapp/veroeffentlichen');
afterAll(() => client.close());

beforeAll(async () => {
  await lernappTestkurs(appDb);
});
afterEach(() => {
  delete process.env.FUNKTION_LERNAPP;
  delete process.env.FUNKTION_LERNAPP_UNGEPRUEFT;
  delete process.env.LERNAPP_BLOB_BASIS;
  vi.unstubAllGlobals();
});

const kontext = <T extends Record<string, unknown>>(p: T) => ({ params: Promise.resolve(p) }) as never;
const anfrage = (pfad: string, kopf: Record<string, string> = {}) => new Request(`https://example.test${pfad}`, { headers: kopf });

async function verzeichnis(kurs: string): Promise<Verzeichnis> {
  const r = await verzeichnisRoute.GET(anfrage(`/lern-app/pakete/${kurs}`), kontext({ kurs }));
  expect(r.status).toBe(200);
  return VerzeichnisSchema.parse(await r.json());
}

async function paket(kurs: string, einheit = `${kurs.slice(0, 2)}.a1.test`): Promise<{ paket: Paket; hash: string; antwort: Response }> {
  const v = await verzeichnis(kurs);
  const e = v.einheiten.find((x) => x.schluessel === einheit)!;
  const antwort = await einheitRoute.GET(
    anfrage(`/lern-app/pakete/${kurs}/${einheit}/${e.hash}`),
    kontext({ kurs, einheit, hash: e.hash }),
  );
  expect(antwort.status).toBe(200);
  const text = await antwort.clone().text();
  expect(sha256Hex(text)).toBe(e.hash);
  expect(new TextEncoder().encode(text).length).toBe(e.bytes);
  return { paket: PaketSchema.parse(JSON.parse(text)), hash: e.hash, antwort };
}

const aufgabenSchluessel = (p: Paket) => p.lektionen.flatMap((l) => l.aufgaben.map((a) => a.schluessel));
const setzeStatus = async (
  tabelle: typeof schema.lernappSatz | typeof schema.lernappLemma,
  muster: string,
  status: 'veroeffentlicht' | 'automatisch_geprueft',
) => db.update(tabelle).set({ status }).where(like(tabelle.schluessel, muster));

describe('Kursverzeichnis und Einheitenpaket', () => {
  it('alle sechs Richtungen: eine Einheit mit Hash, Größe, Hinweis und Audio-Bündel; Paket kanonisch und unter seinem Hash', async () => {
    for (const kurs of ['tr-aus-de', 'ar-aus-de', 'de-aus-tr', 'ar-aus-tr', 'de-aus-ar', 'tr-aus-ar']) {
      const v = await verzeichnis(kurs);
      expect(v).toMatchObject({ kurs, zielsprache: kurs.slice(0, 2), ausgangssprache: kurs.slice(-2) });
      expect(v.einheiten).toHaveLength(1);
      const e = v.einheiten[0]!;
      expect(e).toMatchObject({ schluessel: `${kurs.slice(0, 2)}.a1.test`, stufe: 'a1', lektionen: 4, hinweis: true });
      expect(e.audio).toEqual([
        { adresse: expect.stringMatching(new RegExp(`^/lern-app/audio/${kurs.slice(0, 2)}/`)), bytes: expect.any(Number) },
      ]);
      const { paket: p } = await paket(kurs);
      expect(kanonisch(p)).toBe(JSON.stringify(JSON.parse(kanonisch(p))));
      // l01/l02: 7 Aufgaben; l03: je eine Aufgabe der Typen aus L2-01 (Zielsprache ar mit harakat)
      expect(aufgabenSchluessel(p).filter((k) => !k.includes('.l04.'))).toHaveLength(kurs.startsWith('ar') ? 17 : 16);
      // L2-02: je ein Übungstyp in l04; der Tipp nur, wo es einen gibt (Ausgangssprache de/tr), Schrift je Zielsprache
      const ziel = kurs.slice(0, 2);
      const typen = p.lektionen.find((l) => l.schluessel.endsWith('.l04'))!.aufgaben.map((a) => a.typ);
      expect(typen).toEqual([
        'dialog',
        'geschichte',
        'lesen_fragen',
        ...(kurs.endsWith('-ar') ? [] : ['grammatik_tipp']),
        ...(ziel === 'de' ? ['schrift_latein'] : ziel === 'tr' ? ['schrift_tr'] : ['schrift_ar', 'schrift_ar']),
        'sprechen',
        'schreiben',
      ]);
    }
  });

  it('L2-02: Aufgaben aus den Vorlagen – Zieltexte mit Übersetzung, Optionen der Zielsprache, Karten je Richtung, Tipp als Karte', async () => {
    const { paket: p } = await paket('tr-aus-de');
    const l04 = p.lektionen.find((l) => l.schluessel === 'tr-aus-de.a1.test.l04')!;
    const [dialog, geschichte, lesen, tipp, schrift, sprechen, schreiben] = l04.aufgaben;
    expect(dialog).toMatchObject({
      typ: 'dialog',
      karten: ['tr-aus-de:tr.a1.test.s0007'],
      verlauf: [
        { sprecher: 'a', zeile: { text: 'Günaydın!', sprache: 'tr' }, uebersetzung: { text: 'Guten Morgen!', sprache: 'de' } },
        { sprecher: 'b', zeile: { text: 'Nasılsın?', sprache: 'tr' } },
      ],
      optionen: [{ text: 'İyiyim, teşekkürler.' }, { text: 'Ev büyük.' }, { text: 'Kitap yeni.' }],
      richtig: 0,
    });
    expect(geschichte).toMatchObject({ typ: 'geschichte', fragen: [{ nach: 2, karte: 'tr-aus-de:tr.a1.test.w004', richtig: 0 }] });
    expect(lesen).toMatchObject({
      typ: 'lesen_fragen',
      glossen: [{ wort: 'ev', glosse: { text: 'Haus', sprache: 'de' } }, { wort: 'kitap' }],
    });
    expect(tipp).toMatchObject({
      typ: 'grammatik_tipp',
      sprache: 'de',
      titel: '[Testtipp]',
      abschnitte: [{ ueberschrift: '[Regel]', absaetze: ['[Tipp folgt]'], beispiele: [{ ziel: { text: 'Su içiyorum.', sprache: 'tr' } }] }],
    });
    expect(schrift).toMatchObject({
      typ: 'schrift_tr',
      vorgabe: { text: 'ş', sprache: 'tr' },
      optionen: [{ text: 'Ş' }, { text: 'S' }, { text: 'Ç' }],
    });
    expect(sprechen).toMatchObject({
      typ: 'sprechen',
      karten: ['tr-aus-de:tr.a1.test.s0001'],
      vorgabe: { text: 'Su içiyorum.', sprache: 'tr' },
    });
    expect(schreiben).toMatchObject({
      typ: 'schreiben',
      woerter: { min: 2, max: 30 },
      pflichtwoerter: ['su'],
      muster: [{ text: 'Su içiyorum.' }],
    });
    // Arabisch: Buchstaben über Schlüssel (keine Wörter), Nachspuren ohne Ablenker
    const ar = (await paket('ar-aus-de')).paket.lektionen.find((l) => l.schluessel.endsWith('.l04'))!.aufgaben;
    expect(ar.filter((a) => a.typ === 'schrift_ar')).toEqual([
      { typ: 'schrift_ar', schluessel: 'ar.a1.test.l04.a05', art: 'erkennen', ziel: 'be', ablenker: ['te', 'se'] },
      { typ: 'schrift_ar', schluessel: 'ar.a1.test.l04.a06', art: 'nachspuren', ziel: 'elif' },
    ]);
  });

  it('Lektionen, Aufgaben, Karten je Richtung, Audio nur an Zieltexten, Herkunft je Eintrag, Tipps der Ausgangssprache', async () => {
    const { paket: p } = await paket('tr-aus-de');
    expect(p.lektionen.map((l) => l.schluessel)).toEqual([
      'tr-aus-de.a1.test.l01',
      'tr-aus-de.a1.test.l02',
      'tr-aus-de.a1.test.l03',
      'tr-aus-de.a1.test.l04',
    ]);
    expect(p.lektionen[0]).toMatchObject({ kurs: 'tr-aus-de', zielsprache: 'tr', ausgangssprache: 'de', titel: 'Erste Wörter' });
    const [a01, a02, a03] = p.lektionen[0]!.aufgaben;
    expect(a01).toMatchObject({
      typ: 'auswahl',
      karten: ['tr-aus-de:tr.a1.test.w001'],
      vorgabe: { text: 'su', sprache: 'tr' },
      richtig: 0,
    });
    expect(a01?.typ === 'auswahl' && a01.vorgabe?.audio?.buendel).toMatch(/^\/lern-app\/audio\/tr\/tr\.a1\.test-[0-9a-f]{16}\.lpa$/);
    expect(a01?.typ === 'auswahl' && a01.optionen.map((o) => o.text)).toEqual(['Wasser', 'Brot', 'Haus']);
    expect(a02?.typ === 'paare' && a02.paare.map((x) => [x.links.text, x.rechts.text, x.karte])).toEqual([
      ['su', 'Wasser', 'tr-aus-de:tr.a1.test.w001'],
      ['ekmek', 'Brot', 'tr-aus-de:tr.a1.test.w002'],
      ['ev', 'Haus', 'tr-aus-de:tr.a1.test.w003'],
      ['kitap', 'Buch', 'tr-aus-de:tr.a1.test.w004'],
    ]);
    expect(a03).toMatchObject({
      typ: 'wortbank',
      sprache: 'tr',
      loesungen: ['Su içiyorum.', 'Ben su içiyorum.'],
      vorgabe: { text: 'Ich trinke Wasser.', sprache: 'de' },
    });
    // In die Ausgangssprache: Lösungen mit Alternativen der Übersetzung, Ablenker aus anderen Übersetzungen der Einheit
    const zurueck = p.lektionen[1]!.aufgaben[0]!;
    expect(zurueck).toMatchObject({
      typ: 'wortbank',
      sprache: 'de',
      loesungen: ['Das Haus ist groß.'],
      vorgabe: { text: 'Ev büyük.', sprache: 'tr' },
    });
    expect(zurueck.typ === 'wortbank' && zurueck.kacheln.length).toBeGreaterThan(4);
    expect(p.eintraege['tr.a1.test.s0001']).toMatchObject({
      sprache: 'tr',
      quelle: 'test:lernapp-testkurs',
      lizenz: 'CC-BY-SA-4.0',
      stimme: 'test:ton',
      hinweis: true,
    });
    expect(p.eintraege['tr.a1.test.s0001@de']).toMatchObject({ sprache: 'de', text: 'Ich trinke Wasser.' });
    expect(p.eintraege['tr.a1.test.s0001@de']?.stimme).toBeUndefined();
    expect(p.tipps.map((t) => t.schluessel)).toEqual(['tr.a1.test.de.t01']);
    expect((await paket('de-aus-ar')).paket.tipps).toEqual([]);
    expect(p.lizenz).toBe('CC-BY-SA-4.0');
  });

  it('Lektion l03: je eine Aufgabe der Typen aus L2-01, Bildkarte aus dem Register, Hörübung ohne Ton ohne audio', async () => {
    const { paket: p } = await paket('tr-aus-de');
    const l03 = p.lektionen[2]!;
    expect(l03.aufgaben.map((a) => a.typ)).toEqual([
      'bild_wort',
      'frei',
      'hoeren_waehlen',
      'hoeren_waehlen',
      'hoeren_schreiben',
      'minimalpaare',
      'luecke',
      'satzbau',
      'formen',
    ]);
    const [bild, frei, ohneTon, mitTon, diktat, paar, luecke, satzbau, formen] = l03.aufgaben;
    expect(bild).toMatchObject({
      typ: 'bild_wort',
      bild: { symbol: 'haus' },
      optionen: [{ text: 'ev' }, { text: 'kitap' }, { text: 'su' }],
    });
    expect(frei).toMatchObject({ vorgabe: { text: 'Brot', sprache: 'de' }, sprache: 'tr', loesungen: ['ekmek'] });
    expect(ohneTon?.typ === 'hoeren_waehlen' && ohneTon.hoeren).toEqual({ text: 'Ev yeni.', sprache: 'tr' });
    expect(mitTon?.typ === 'hoeren_waehlen' && mitTon.hoeren.audio?.buendel).toMatch(/^\/lern-app\/audio\/tr\//);
    expect(diktat).toMatchObject({ hoeren: { text: 'kitap' }, loesungen: ['kitap'] });
    expect(paar).toMatchObject({ hoeren: { text: 'üç' }, optionen: [{ text: 'üç' }, { text: 'uç' }] });
    expect(luecke).toMatchObject({
      vor: 'Su ',
      nach: '.',
      optionen: ['içiyorum', 'içiyorsun', 'içiyor'],
      hilfe: { text: 'Ich trinke Wasser.' },
    });
    expect(satzbau).toMatchObject({ kacheln: ['Ev', 'büyük'], vorgabe: { text: 'Das Haus ist groß.' } });
    expect(formen).toMatchObject({ titel: { text: 'içmek' }, zeilen: ['ben', 'sen', 'o'], zellen: [{ vorgabe: true }, {}, {}] });
    const ar = (await paket('ar-aus-de')).paket.lektionen[2]!.aufgaben;
    expect(ar.map((a) => a.typ).at(-1)).toBe('harakat');
    expect(ar.find((a) => a.typ === 'luecke')).not.toHaveProperty('optionen');
  });

  it('Schalter lernapp_ungeprueft aus: nur veröffentlichte Einträge; veröffentlicht ohne Hinweis', async () => {
    process.env.FUNKTION_LERNAPP_UNGEPRUEFT = 'aus';
    expect((await verzeichnis('tr-aus-de')).einheiten).toEqual([]);
    for (const t of [
      schema.lernappEinheit,
      schema.lernappLektion,
      schema.lernappAufgabe,
      schema.lernappLemma,
      schema.lernappSatz,
      schema.lernappTipp,
    ])
      await db
        .update(t as typeof schema.lernappSatz)
        .set({ status: 'veroeffentlicht' })
        .where(like((t as typeof schema.lernappSatz).schluessel, 'tr.%'));
    const ids = (
      await db.select({ id: schema.lernappSatz.id }).from(schema.lernappSatz).where(like(schema.lernappSatz.schluessel, 'tr.%'))
    ).map((z) => z.id);
    const lids = (
      await db.select({ id: schema.lernappLemma.id }).from(schema.lernappLemma).where(like(schema.lernappLemma.schluessel, 'tr.%'))
    ).map((z) => z.id);
    await db
      .update(schema.lernappUebersetzung)
      .set({ status: 'veroeffentlicht' })
      .where(and(eq(schema.lernappUebersetzung.sprache, 'de'), inArray(schema.lernappUebersetzung.satzId, ids)));
    await db
      .update(schema.lernappUebersetzung)
      .set({ status: 'veroeffentlicht' })
      .where(and(eq(schema.lernappUebersetzung.sprache, 'de'), inArray(schema.lernappUebersetzung.lemmaId, lids)));
    const v = await verzeichnis('tr-aus-de');
    expect(v.einheiten).toHaveLength(1);
    expect(v.einheiten[0]?.hinweis).toBe(false);
    // tr-aus-ar hat noch ungeprüfte Übersetzungen ins Arabische → ohne Schalter nur Aufgaben ohne Übersetzung: aus l03 die
    // Typen aus L2-01, die keine brauchen, aus l04 die Typen aus L2-02 (Übersetzungen dort nur als Hilfe; Glossen fallen
    // weg; einen Tipp gibt es aus dem Arabischen nicht)
    expect((await verzeichnis('tr-aus-ar')).einheiten.map((e) => e.lektionen)).toEqual([2]);
    const nurZiel = (await paket('tr-aus-ar')).paket.lektionen.flatMap((l) => l.aufgaben);
    expect(nurZiel.map((a) => a.schluessel)).toEqual([
      'tr.a1.test.l03.a05',
      'tr.a1.test.l03.a06',
      'tr.a1.test.l03.a07',
      'tr.a1.test.l03.a08',
      'tr.a1.test.l03.a09',
      'tr.a1.test.l04.a01',
      'tr.a1.test.l04.a02',
      'tr.a1.test.l04.a03',
      'tr.a1.test.l04.a05',
      'tr.a1.test.l04.a07',
      'tr.a1.test.l04.a08',
    ]);
    expect(nurZiel.filter((a) => a.schluessel.includes('.l04.')).map((a) => a.typ)).toEqual([
      'dialog',
      'geschichte',
      'lesen_fragen',
      'schrift_tr',
      'sprechen',
      'schreiben',
    ]);
    expect(JSON.stringify(nurZiel)).not.toMatch(/"sprache":"ar"/);
    delete process.env.FUNKTION_LERNAPP_UNGEPRUEFT;
    expect((await verzeichnis('tr-aus-ar')).einheiten[0]?.hinweis).toBe(true);
    await setzeStatus(schema.lernappSatz, 'tr.%', 'automatisch_geprueft');
    await setzeStatus(schema.lernappLemma, 'tr.%', 'automatisch_geprueft');
  });

  it('kritischer Sprachbefund zum aktuellen Hash verbirgt den Eintrag und die Aufgaben, die ihn brauchen', async () => {
    const vorher = await paket('de-aus-tr');
    const [s] = await db.select().from(schema.lernappSatz).where(eq(schema.lernappSatz.schluessel, 'de.a1.test.s0001'));
    const pruefer = randomUUID();
    await db
      .insert(schema.user)
      .values({ id: pruefer, name: 'Testperson Sprache', email: `p.${pruefer}@example.test`, emailVerified: true });
    // Befund zu einem alten Hash zählt nicht
    await db.insert(schema.lernappPruefung).values({
      inhaltTyp: 'satz',
      inhaltId: s!.id,
      inhaltHash: 'f'.repeat(64),
      art: 'sprache_ziel',
      pruefendeId: pruefer,
      urteil: 'abgelehnt',
    });
    expect((await paket('de-aus-tr')).hash).toBe(vorher.hash);
    await db.insert(schema.lernappPruefung).values({
      inhaltTyp: 'satz',
      inhaltId: s!.id,
      inhaltHash: s!.inhaltHash,
      art: 'sprache_ziel',
      pruefendeId: pruefer,
      urteil: 'korrektur',
      kategorie: 'grammatik',
    });
    const nachher = await paket('de-aus-tr');
    expect(nachher.hash).not.toBe(vorher.hash);
    expect(aufgabenSchluessel(nachher.paket)).not.toContain('de.a1.test.l01.a03');
    expect(nachher.paket.eintraege['de.a1.test.s0001']).toBeUndefined();
    await db.delete(schema.lernappPruefung).where(eq(schema.lernappPruefung.inhaltId, s!.id));
  });

  it('Religionsbezug: unsichtbar ohne zwei religiöse Freigaben, danach sichtbar – nie mit Audio', async () => {
    const [l] = await db
      .update(schema.lernappLemma)
      .set({ religionsbezug: true })
      .where(eq(schema.lernappLemma.schluessel, 'tr.a1.test.w002'))
      .returning();
    const ohne = (await paket('tr-aus-de')).paket;
    expect(ohne.eintraege['tr.a1.test.w002']).toBeUndefined();
    const a01 = ohne.lektionen[0]!.aufgaben[0]!;
    expect(a01.typ === 'auswahl' && a01.optionen.map((o) => o.text)).toEqual(['Wasser', 'Haus']);
    const paare = ohne.lektionen[0]!.aufgaben[1]!;
    expect(paare.typ === 'paare' && paare.paare.map((x) => x.links.text)).toEqual(['su', 'ev', 'kitap']);
    // Wortbank-Ablenker kommen nie aus der Übersetzung eines verborgenen Zieleintrags (Gegenprüfung L1)
    const zurueck = ohne.lektionen[1]!.aufgaben[0]!;
    expect(zurueck.typ === 'wortbank' && zurueck.kacheln.map((k) => k.toLocaleLowerCase('de'))).not.toContain('brot');

    // Eine Freigabe genügt nicht; die Administration ersetzt keine Prüfung
    const person = async (rolle: 'religioese_pruefung' | 'administration') => {
      const id = randomUUID();
      await db.insert(schema.user).values({ id, name: 'Testperson Prüfung', email: `r.${id}@example.test`, emailVerified: true });
      await db.insert(schema.rolleZuweisung).values({ benutzerId: id, rolle });
      return id;
    };
    const frei = async (id: string) =>
      db
        .insert(schema.lernappPruefung)
        .values({ inhaltTyp: 'lemma', inhaltId: l!.id, inhaltHash: l!.inhaltHash, art: 'religioes', pruefendeId: id, urteil: 'ok' });
    await frei(await person('religioese_pruefung'));
    await frei(await person('administration'));
    expect((await paket('tr-aus-de')).paket.eintraege['tr.a1.test.w002']).toBeUndefined();
    await frei(await person('religioese_pruefung'));
    const mit = (await paket('tr-aus-de')).paket;
    expect(mit.eintraege['tr.a1.test.w002']).toMatchObject({ text: 'ekmek' });
    expect(mit.eintraege['tr.a1.test.w002']?.stimme).toBeUndefined();
    const ekmek = mit.lektionen[0]!.aufgaben[1]!;
    expect(ekmek.typ === 'paare' && ekmek.paare.find((x) => x.links.text === 'ekmek')?.links.audio).toBeUndefined();
    await db.update(schema.lernappLemma).set({ religionsbezug: false }).where(eq(schema.lernappLemma.id, l!.id));
  });

  it('Einheit nur für eine Ausgangssprache und gesperrte Übersetzungen wirken je Richtung', async () => {
    await db.update(schema.lernappEinheit).set({ nurFuerAusgang: 'ar' }).where(eq(schema.lernappEinheit.schluessel, 'tr.a1.test'));
    expect((await verzeichnis('tr-aus-de')).einheiten).toEqual([]);
    expect((await verzeichnis('tr-aus-ar')).einheiten).toHaveLength(1);
    await db.update(schema.lernappEinheit).set({ nurFuerAusgang: null }).where(eq(schema.lernappEinheit.schluessel, 'tr.a1.test'));
    const ids = (
      await db.select({ id: schema.lernappSatz.id }).from(schema.lernappSatz).where(eq(schema.lernappSatz.schluessel, 'tr.a1.test.s0002'))
    ).map((z) => z.id);
    await db
      .update(schema.lernappUebersetzung)
      .set({ status: 'gesperrt' })
      .where(and(eq(schema.lernappUebersetzung.sprache, 'de'), inArray(schema.lernappUebersetzung.satzId, ids)));
    expect(aufgabenSchluessel((await paket('tr-aus-de')).paket)).not.toContain('tr.a1.test.l02.a01');
    expect(aufgabenSchluessel((await paket('tr-aus-ar')).paket)).toContain('tr.a1.test.l02.a01');
  });

  it('Zurückziehen: Status gesperrt, Kursstand steigt, updateTag(lernapp-kurs-<id>), alter Hash 404', async () => {
    const vorher = await paket('de-aus-ar');
    const stand = (await verzeichnis('de-aus-ar')).stand;
    aufrufe.updateTag.length = 0;
    expect(await zieheZurueck('lektion', 'de.a1.test.l02')).toBe(true);
    expect(aufrufe.updateTag).toEqual(['lernapp-kurs-de']);
    const v = await verzeichnis('de-aus-ar');
    expect(v.stand).toBe(stand + 1);
    // vier Lektionen (l01–l04), eine zurückgezogen
    expect(v.einheiten[0]?.lektionen).toBe(3);
    const alt = await einheitRoute.GET(anfrage('/'), kontext({ kurs: 'de-aus-ar', einheit: 'de.a1.test', hash: vorher.hash }));
    expect(alt.status).toBe(404);
    expect(await zieheZurueck('uebersetzung', 'de.a1.test.w004@ar')).toBe(true);
    expect(aufgabenSchluessel((await paket('de-aus-ar')).paket)).not.toContain('de.a1.test.l01.a04');
    expect(await zieheZurueck('satz', 'xx.a1.e01.s0001')).toBe(false);
  });
});

describe('Routen', () => {
  it('Verzeichnis: unbekannter Kurs 404, Wissen und Koran-Arabisch ohne Einheiten (nichts ohne zwei Freigaben)', async () => {
    expect((await verzeichnisRoute.GET(anfrage('/'), kontext({ kurs: 'en-aus-de' }))).status).toBe(404);
    expect((await verzeichnis('islam')).einheiten).toEqual([]);
    expect((await verzeichnis('koran')).einheiten).toEqual([]);
    const r = await verzeichnisRoute.GET(anfrage('/'), kontext({ kurs: 'tr-aus-de' }));
    expect(r.headers.get('content-type')).toBe('application/json; charset=utf-8');
    expect(r.headers.get('set-cookie')).toBeNull();
  });

  it('Einheitenpaket: unveränderlich mit CDN-Kopfzeilen und Tag; falscher Hash oder fremde Einheit 404', async () => {
    const { antwort, hash } = await paket('ar-aus-tr');
    expect(antwort.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect(antwort.headers.get('vercel-cdn-cache-control')).toBe('max-age=31536000');
    // Kurs-Tag (Zurückziehen) und `einstellungen` (Schalter): keine Jahreskopie überdauert sie (S-L1 N-3)
    expect(antwort.headers.get('vercel-cache-tag')).toBe('lernapp,lernapp-kurs-ar,einstellungen');
    expect(antwort.headers.get('x-content-type-options')).toBe('nosniff');
    expect((await einheitRoute.GET(anfrage('/'), kontext({ kurs: 'ar-aus-tr', einheit: 'ar.a1.test', hash: '0'.repeat(64) }))).status).toBe(
      404,
    );
    expect((await einheitRoute.GET(anfrage('/'), kontext({ kurs: 'ar-aus-tr', einheit: 'tr.a1.test', hash }))).status).toBe(404);
    expect((await einheitRoute.GET(anfrage('/'), kontext({ kurs: 'islam', einheit: 'islam.grund.e01', hash }))).status).toBe(404);
  });

  it('Schalter lernapp aus → 404 für Verzeichnis, Paket und Audio; Parameter mit Platzhalter', async () => {
    const { hash } = await paket('tr-aus-de');
    process.env.FUNKTION_LERNAPP = 'aus';
    expect((await verzeichnisRoute.GET(anfrage('/'), kontext({ kurs: 'tr-aus-de' }))).status).toBe(404);
    expect((await einheitRoute.GET(anfrage('/'), kontext({ kurs: 'tr-aus-de', einheit: 'tr.a1.test', hash }))).status).toBe(404);
    const datei = audioDatei('tr');
    expect((await audioRoute.GET(anfrage('/'), kontext({ pfad: ['tr', datei] }))).status).toBe(404);
    expect(await pakete.ladePaketParameter()).toEqual([{ kurs: 'tr-aus-de', einheit: 'tr.a1.e00', hash: '0'.repeat(64) }]);
    delete process.env.FUNKTION_LERNAPP;
    expect(await pakete.ladePaketParameter()).toContainEqual({ kurs: 'tr-aus-de', einheit: 'tr.a1.test', hash });
  });
});

const audioDatei = (sprache: string) => readdirSync(join(TESTAUDIO_VERZEICHNIS, sprache)).find((d) => d.endsWith('.lpa'))!;

describe('Audio-Route', () => {
  it('Testbündel aus dem Dateisystem: ganz (200) mit Kopfzeilen nach S5, ohne Cookies', async () => {
    const datei = audioDatei('tr');
    const r = await audioRoute.GET(anfrage(`/lern-app/audio/tr/${datei}`), kontext({ pfad: ['tr', datei] }));
    expect(r.status).toBe(200);
    const bytes = new Uint8Array(await r.arrayBuffer());
    expect(bytes).toEqual(new Uint8Array(readFileSync(join(TESTAUDIO_VERZEICHNIS, 'tr', datei))));
    expect(r.headers.get('content-length')).toBe(String(bytes.length));
    expect(r.headers.get('cache-control')).toBe('public, max-age=31536000, immutable');
    expect(r.headers.get('vercel-cdn-cache-control')).toBe('max-age=31536000');
    expect(r.headers.get('vercel-cache-tag')).toBe('lernapp-audio,lernapp-audio-tr,lernapp,lernapp-kurs-tr,einstellungen');
    expect(r.headers.get('accept-ranges')).toBe('bytes');
    expect(r.headers.get('set-cookie')).toBeNull();
    expect(r.headers.get('vary')).toBeNull();
  });

  it('Byte-Bereiche 206 und 416; unbekannte oder ungültige Pfade 404', async () => {
    const datei = audioDatei('de');
    const teil = await audioRoute.GET(anfrage('/', { range: 'bytes=0-99' }), kontext({ pfad: ['de', datei] }));
    expect(teil.status).toBe(206);
    expect(teil.headers.get('content-range')).toMatch(/^bytes 0-99\/\d+$/);
    // Teilantworten hält das CDN nie vor (S-L1 N-4)
    expect(teil.headers.get('vercel-cdn-cache-control')).toBe('no-store');
    expect(teil.headers.get('vercel-cache-tag')).toBeNull();
    expect((await teil.arrayBuffer()).byteLength).toBe(100);
    const daneben = await audioRoute.GET(anfrage('/', { range: 'bytes=99999999-' }), kontext({ pfad: ['de', datei] }));
    expect(daneben.status).toBe(416);
    expect(daneben.headers.get('cache-control')).toBe('no-store');
    for (const pfad of [
      ['de', 'de.a1.test-0000000000000000.lpa'],
      ['de', '..', datei],
      ['xx', datei],
      ['ar', datei],
    ])
      expect((await audioRoute.GET(anfrage('/'), kontext({ pfad }))).status, pfad.join('/')).toBe(404);
  });

  it('mit Blob-Speicher: genau ein Abruf ohne head(), Range durchgereicht, Blob-404 → 404', async () => {
    process.env.LERNAPP_BLOB_BASIS = 'https://lernapp.example.test/';
    const abrufe: { url: string; range: string | null }[] = [];
    vi.stubGlobal('fetch', async (url: string, init: RequestInit) => {
      const range = new Headers(init.headers).get('range');
      abrufe.push({ url, range });
      if (url.includes('fehlt')) return new Response('nicht da', { status: 404 });
      return new Response(new Uint8Array(10), {
        status: range ? 206 : 200,
        headers: { 'content-length': '10', ...(range ? { 'content-range': 'bytes 0-9/50' } : {}) },
      });
    });
    const datei = 'tr.a1.test-0123456789abcdef.lpa';
    const r = await audioRoute.GET(anfrage('/', { range: 'bytes=0-9' }), kontext({ pfad: ['tr', datei] }));
    expect(r.status).toBe(206);
    expect(r.headers.get('content-range')).toBe('bytes 0-9/50');
    expect(r.headers.get('vercel-cdn-cache-control')).toBe('no-store');
    expect(abrufe).toEqual([{ url: `https://lernapp.example.test/lernapp/audio/tr/${datei}`, range: 'bytes=0-9' }]);
    const ganz = await audioRoute.GET(anfrage('/'), kontext({ pfad: ['tr', datei] }));
    expect(ganz.status).toBe(200);
    expect(ganz.headers.get('vercel-cache-tag')).toBe('lernapp-audio,lernapp-audio-tr,lernapp,lernapp-kurs-tr,einstellungen');
    expect(abrufe).toHaveLength(2);
    // Pfad mit gültiger Form, den es im Blob nicht gibt („fehlt“ lässt die Attrappe 404 antworten)
    process.env.LERNAPP_BLOB_BASIS = 'https://fehlt.example.test';
    expect((await audioRoute.GET(anfrage('/'), kontext({ pfad: ['tr', datei] }))).status).toBe(404);
  });
});

/** Cache Storage im Arbeitsspeicher (wie im Browser: nur ganze 200-Antworten, Schlüssel = Adresse). */
function vorratImSpeicher(): CacheStorage & { inhalt: Map<string, Map<string, Response>> } {
  const inhalt = new Map<string, Map<string, Response>>();
  const schluessel = (r: RequestInfo | URL) => (typeof r === 'string' ? r : r instanceof URL ? r.pathname : new URL(r.url).pathname);
  return {
    inhalt,
    async open(name: string) {
      const c = inhalt.get(name) ?? new Map<string, Response>();
      inhalt.set(name, c);
      return {
        async match(r: RequestInfo | URL) {
          return c.get(schluessel(r))?.clone();
        },
        async put(r: RequestInfo | URL, antwort: Response) {
          if (antwort.status !== 200) throw new TypeError('nur 200');
          c.set(schluessel(r), antwort.clone());
        },
        async delete(r: RequestInfo | URL) {
          return c.delete(schluessel(r));
        },
      } as unknown as Cache;
    },
  } as unknown as CacheStorage & { inhalt: Map<string, Map<string, Response>> };
}

describe('Client: Pakete und Bündel auf dem Gerät (lokal/pakete.ts)', async () => {
  const lokal = await import('@/lib/lernapp/lokal/pakete');
  const { arbeitsspeicher } = await import('@/lib/lernapp/lokal/db');
  const { textHash } = await import('@/lib/lernapp/paket/hash');
  const { schneideClip } = await import('@/lib/lernapp/paket/buendel');

  /** Abruf gegen die Route Handler; `abrufe` zählt die Netzanfragen. */
  function routenAbruf(manipuliert = false) {
    const abrufe: string[] = [];
    const abruf = async (adresse: string, init?: RequestInit) => {
      abrufe.push(adresse);
      expect(new Headers(init?.headers).get('range')).toBeNull();
      const teile = adresse.split('/').filter(Boolean);
      if (teile[1] === 'audio') return audioRoute.GET(anfrage(adresse), kontext({ pfad: teile.slice(2) }));
      if (teile.length === 3) return verzeichnisRoute.GET(anfrage(adresse), kontext({ kurs: teile[2] }));
      const r = await einheitRoute.GET(anfrage(adresse), kontext({ kurs: teile[2], einheit: teile[3], hash: teile[4] }));
      return manipuliert && r.ok ? new Response((await r.text()).replace('"lizenz"', '"lizenz" '), { status: 200 }) : r;
    };
    return { abruf, abrufe };
  }

  it('Verzeichnis Netz zuerst, Paket mit Hash-Prüfung in den Vorrat, offline aus dem Vorrat; manipulierte Bytes verworfen', async () => {
    const sp = arbeitsspeicher();
    const vorrat = vorratImSpeicher();
    const { abruf, abrufe } = routenAbruf();
    const v = await lokal.ladeVerzeichnis('tr-aus-de', { abruf, vorrat });
    expect(v?.einheiten).toHaveLength(1);
    const e = v!.einheiten[0]!;
    const p = await lokal.ladePaket(sp, 'tr-aus-de', e, { abruf, vorrat });
    expect(p?.einheit.schluessel).toBe('tr.a1.test');
    expect(await sp.lies('pakete', ['tr-aus-de', 'tr.a1.test'])).toMatchObject({ hash: e.hash, bytes: e.bytes, offline: false });
    // offline: kein Netz, Verzeichnis und Paket aus dem Vorrat
    const offline = async () => {
      throw new TypeError('offline');
    };
    expect(await lokal.ladeVerzeichnis('tr-aus-de', { abruf: offline, vorrat })).toEqual(v);
    expect(await lokal.ladePaket(sp, 'tr-aus-de', e, { abruf: offline, vorrat })).toEqual(p);
    expect(abrufe).toHaveLength(2);
    // Bytes, die nicht zum Hash passen, werden nicht gespeichert
    const leer = vorratImSpeicher();
    expect(await lokal.ladePaket(arbeitsspeicher(), 'tr-aus-de', e, { abruf: routenAbruf(true).abruf, vorrat: leer })).toBeNull();
    expect(leer.inhalt.get(lokal.VORRAT_PAKETE)?.size ?? 0).toBe(0);
    // ohne Cache Storage geht es weiter (nur ohne Vorrat)
    expect(await lokal.ladePaket(arbeitsspeicher(), 'tr-aus-de', e, { abruf, vorrat: null })).toEqual(p);
  });

  it('Bündel ganz ohne Range, Clip per Blob.slice; offline speichern mit Ring nach Bytes; Aufräumen nach neuem Hash', async () => {
    const sp = arbeitsspeicher();
    const vorrat = vorratImSpeicher();
    const { abruf } = routenAbruf();
    const v = (await lokal.ladeVerzeichnis('tr-aus-de', { abruf, vorrat }))!;
    const e = v.einheiten[0]!;
    const fortschritt: number[] = [];
    const r = await lokal.speichereOffline(sp, 'tr-aus-de', v.einheiten, { abruf, vorrat, fortschritt: (g) => fortschritt.push(g) });
    expect(r).toMatchObject({ einheiten: 1, fehlgeschlagen: [], bytes: e.bytes + e.audio[0]!.bytes });
    expect(fortschritt.at(-1)).toBe(r.bytes);
    expect(await sp.lies('pakete', ['tr-aus-de', 'tr.a1.test'])).toMatchObject({ offline: true });

    const p = (await lokal.paketImVorrat('tr-aus-de', e, { vorrat }))!;
    const buendel = (await lokal.ladeBuendel(e.audio[0]!.adresse, { abruf: async () => Response.error(), vorrat }))!;
    expect(buendel.size).toBe(e.audio[0]!.bytes);
    const kopf = await lokal.buendelKopf(buendel);
    const text = Object.values(p.eintraege).find((x) => x.sprache === 'tr' && x.stimme)!.text;
    const clip = (await lokal.clipAus(buendel, textHash(text), kopf))!;
    const c = kopf.clips.find((x) => x.textHash === textHash(text))!;
    expect(clip.type).toBe('audio/webm');
    expect(clip.size).toBe(c.laenge);
    expect(new Uint8Array(await clip.arrayBuffer())).toEqual(new Uint8Array(await schneideClip(buendel, c).arrayBuffer()));
    expect(await lokal.clipAus(buendel, '0'.repeat(64), kopf)).toBeNull();

    // Neuer Stand im Verzeichnis: das alte Paket verlässt den Vorrat; eine offline gespeicherte Einheit behält ihren Eintrag
    // (alter Hash, `offline`) bis zum Nachladen und wird zum Neuladen gemeldet (vorrat.ts, Restliste L8 a)
    const neu = { ...v, einheiten: [{ ...e, hash: 'f'.repeat(64) }] };
    expect(await lokal.raeumeAuf(sp, neu, { vorrat })).toEqual(neu.einheiten);
    expect(await sp.lies('pakete', ['tr-aus-de', 'tr.a1.test'])).toMatchObject({ hash: e.hash, offline: true });
    expect(await lokal.paketImVorrat('tr-aus-de', e, { vorrat })).toBeNull();
  });
});
