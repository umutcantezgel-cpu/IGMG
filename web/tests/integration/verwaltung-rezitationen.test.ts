import { createHash, randomBytes } from 'node:crypto';
import { mkdtempSync, readFileSync } from 'node:fs';
import { access, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { leseMetadaten } from '@/lib/quran/metadaten';
import { leseTanzil } from '@/lib/quran/tanzil';
import { woerter } from '@/lib/quran/woerter';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Verwaltung › Rezitationen und Werkstatt (O-Q02, H-Q05, H-Q06, ADR 0029): Rechte (nur rezitation.bearbeiten, ohne
 * zweiten Faktor nichts), Aktivieren nur mit Vereinbarung (Action und Datenbank), Audio nur über Magic Bytes und mit
 * Inhalts-Hash, Verszeiten → öffentliche Zeiten-Route, Wortzeiten erst nach Bestätigung öffentlich, Auslieferung mit
 * Byte-Bereichen, Import lizenzierter Sätze. Testdaten: nur synthetische Bytes (keine Rezitationen), Koran-Text aus
 * den Repository-Daten (Tanzil).
 */
const verzeichnis = mkdtempSync(join(tmpdir(), 'igmg-rezitation-'));
process.env.MEDIEN_VERZEICHNIS = verzeichnis;
delete process.env.SPEICHER;
const { client, db } = await verwaltungsUmgebung();
const aktionen = await import('@/server/actions/rezitationen');
const abfragen = await import('@/server/queries/verwaltung/rezitationen');
const quran = await import('@/server/queries/quran');
const { GET: zeitenRoute } = await import('@/app/api/quran/[sure]/zeiten/[rezitation]/route');
const { GET: audioRoute } = await import('@/app/audio/[...pfad]/route');
const { POST: eingangRoute } = await import('@/app/api/verwaltung/rezitationen/eingang/route');
const { legeAudioAb, AudioFehler } = await import('@/lib/audio/ablage');
const { AUDIO_MAX_BYTES } = await import('@/lib/audio/format');
const { importiereRezitation, ImportFehler } = await import('@/lib/audio/import');
const { speicher } = await import('@/lib/storage');
afterAll(async () => {
  await client.close();
  await rm(verzeichnis, { recursive: true, force: true });
});

const DATEN = join(import.meta.dirname, '../../daten');
const PDF = Buffer.from('%PDF-1.4\n%Testvereinbarung (synthetisch)\n1 0 obj\n<<>>\nendobj\n');
/** Synthetische Ogg-Datei: gültige Magic Bytes, sonst Zufall (kein Ton, keine Rezitation). */
const ogg = () => Buffer.concat([Buffer.from('OggS'), Buffer.from([0, 2, 0, 0, 0, 0, 0, 0]), randomBytes(256)]);
const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex');
const vorhanden = (pfad: string) =>
  access(pfad).then(
    () => true,
    () => false,
  );

/** Anlegen leitet weiter → ID aus dem Ziel. */
async function anlegen(felder: Record<string, string>): Promise<string> {
  const e = await aktionen.rezitationAnlegen({}, formular(felder)).then(
    (z) => z,
    (f: { ziel?: string }) => f,
  );
  const ziel = (e as { ziel?: string }).ziel ?? '';
  const id = ziel.match(/^\/verwaltung\/rezitationen\/([a-z0-9-]+)\?angelegt=1$/)?.[1];
  if (!id) throw new Error(`keine Weiterleitung: ${JSON.stringify(e)}`);
  return id;
}

/** Audio wie der Browser: Eingang (Route) und Übernahme (Action). */
async function hochladen(id: string, sure: number, daten: Buffer, kopf: Record<string, string> = { 'sec-fetch-site': 'same-origin' }) {
  const antwort = await eingangRoute(
    new Request('http://localhost/api/verwaltung/rezitationen/eingang', { method: 'POST', body: new Uint8Array(daten), headers: kopf }),
  );
  const json = (await antwort.json().catch(() => ({}))) as { eingang?: string; fehler?: string };
  if (!json.eingang) return { status: antwort.status, ...json };
  return {
    status: antwort.status,
    ...(await aktionen.audioUebernehmen({}, formular({ rezitationId: id, sure: String(sure), eingang: json.eingang, dauerMs: '5000' }))),
  };
}

const zeiten = async (sure: number, id: string) => {
  const a = await zeitenRoute(new Request(`http://localhost/api/quran/${sure}/zeiten/${id}`), {
    params: Promise.resolve({ sure: String(sure), rezitation: id }),
  });
  return a.status === 200 ? ((await a.json()) as { audio: { pfad: string }[]; verse: number[][]; woerter: number[][] }) : null;
};
const holeAudio = (pfad: string, range?: string) =>
  audioRoute(new Request(`http://localhost${pfad}`, { headers: range ? { range } : {} }), {
    params: Promise.resolve({ pfad: pfad.replace(/^\/audio\//, '').split('/') }),
  });

beforeAll(async () => {
  const lies = (p: string) => readFileSync(join(DATEN, p), 'utf8');
  const suren = leseTanzil(lies('tanzil/quran-uthmani.xml'));
  const { suren: meta } = leseMetadaten(lies('tanzil/quran-data.xml'));
  await db.insert(schema.quranQuelle).values({
    id: 'tanzil',
    bezeichnung: 'Tanzil (Test)',
    url: 'https://tanzil.net',
    version: '1.1',
    sha256: '0'.repeat(64),
    lizenz: 'CC BY 3.0',
  });
  await db.insert(schema.quranSure).values(
    suren.map((s) => ({
      nr: s.nr,
      nameAr: s.nameAr,
      verseAnzahl: s.verse.length,
      quelleId: 'tanzil',
      nameUmschrift: meta[s.nr - 1].umschrift,
    })),
  );
  // Verse und Wörter nur für Al-Fatiha und Sure 108 (genug für Werkstatt und Raster)
  const auswahl = suren.filter((s) => s.nr === 1 || s.nr === 108);
  await db.insert(schema.quranVers).values(auswahl.flatMap((s) => s.verse.map((v) => ({ sure: s.nr, vers: v.nr, textAr: v.textAr }))));
  const alle = auswahl.flatMap((s) => s.verse.flatMap((v) => woerter(v.textAr).map((w) => ({ sure: s.nr, vers: v.nr, ...w }))));
  const formen = await db
    .insert(schema.quranWortform)
    .values([...new Set(alle.map((w) => w.text))].map((textAr) => ({ textAr })))
    .returning({ id: schema.quranWortform.id, textAr: schema.quranWortform.textAr });
  const formId = new Map(formen.map((f) => [f.textAr, f.id]));
  await db
    .insert(schema.quranWort)
    .values(alle.map((w) => ({ sure: w.sure, vers: w.vers, pos: w.pos, textAr: w.text, formId: formId.get(w.text)! })));
});

const wortzahl = async (sure: number, vers: number) =>
  (
    await db
      .select()
      .from(schema.quranWort)
      .where(and(eq(schema.quranWort.sure, sure), eq(schema.quranWort.vers, vers)))
  ).length;

let id = '';

describe('Rechte', () => {
  it('ohne rezitation.bearbeiten oder ohne zweiten Faktor: nichts geht, nichts wird geschrieben', async () => {
    for (const [rollen, zweiFaktor] of [
      [[{ rolle: 'redaktion' }], true],
      [[{ rolle: 'bildung' }], true],
      [[{ rolle: 'kinderschutz' }], true],
      [[{ rolle: 'religioese_pruefung' }], false],
      [null, true],
    ] as const) {
      await angemeldetAls(rollen === null ? null : [...rollen], zweiFaktor);
      expect(await aktionen.rezitationAnlegen({}, formular({ nameDe: 'Test', rezitator: '[R]', art: 'eigen', lizenz: '[L]' }))).toEqual({
        fehler: 'keinRecht',
      });
      expect(await aktionen.freigabeSetzen({}, formular({ id: 'x-test', an: '1' }))).toEqual({ fehler: 'keinRecht' });
      expect(await aktionen.verszeitenSpeichern({}, formular({ rezitationId: 'x-test', sure: '1', verse: '[]' }))).toEqual({
        fehler: 'keinRecht',
      });
      expect(await aktionen.wortzeitenBestaetigen({}, formular({ rezitationId: 'x-test', sure: '1', vers: '1' }))).toEqual({
        fehler: 'keinRecht',
      });
      const r = await eingangRoute(
        new Request('http://localhost/api/verwaltung/rezitationen/eingang', {
          method: 'POST',
          body: new Uint8Array(ogg()),
          headers: { 'sec-fetch-site': 'same-origin' },
        }),
      );
      expect(r.status).toBe(403);
    }
    expect(await db.select().from(schema.quranRezitation)).toEqual([]);
  });
});

describe('Anlegen, Vereinbarung, Freigabe', () => {
  it('religiöse Prüfung legt an; Kennung aus dem Namen, doppelte Kennung abgelehnt', async () => {
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    id = await anlegen({
      nameDe: 'Eigene Rezitation 2026',
      nameTr: 'Kendi tilavetimiz',
      rezitator: '[Rezitator]',
      art: 'eigen',
      lizenz: '[Lizenz]',
    });
    expect(id).toBe('eigene-rezitation-2026');
    const [r] = await db.select().from(schema.quranRezitation).where(eq(schema.quranRezitation.id, id));
    expect(r).toMatchObject({
      aktiv: false,
      standard: false,
      art: 'eigen',
      name: { de: 'Eigene Rezitation 2026', tr: 'Kendi tilavetimiz' },
    });
    expect(await aktionen.rezitationAnlegen({}, formular({ nameDe: 'X', rezitator: '[R]', art: 'eigen', lizenz: '[L]' }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { nameDe: 'zuKurz' },
    });
    expect(
      await aktionen.rezitationAnlegen({}, formular({ nameDe: 'Andere', rezitator: '[R]', art: 'eigen', lizenz: '[L]', kennung: id })),
    ).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { kennung: 'kennungVergeben' },
    });
    // gleicher Name ohne Kennung → nächste freie Kennung
    expect(await anlegen({ nameDe: 'Eigene Rezitation 2026', rezitator: '[R]', art: 'lizenziert', lizenz: '[L]' })).toBe(`${id}-2`);
  });

  it('Aktivieren ohne Vereinbarung: Action lehnt ab, Datenbank auch', async () => {
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    expect(await aktionen.freigabeSetzen({}, formular({ id, an: '1' }))).toEqual({ fehler: 'ohneVereinbarung' });
    await expect(db.update(schema.quranRezitation).set({ aktiv: true }).where(eq(schema.quranRezitation.id, id))).rejects.toThrow();
    expect(await aktionen.standardSetzen({}, formular({ id }))).toEqual({ fehler: 'nichtAktiv' });
  });

  it('Vereinbarung nur als PDF; danach aktivieren (wird Standard), öffentlich sichtbar, Lösen erst nach Deaktivieren', async () => {
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    const keinPdf = formular({ id });
    keinPdf.append('datei', new File([new Uint8Array(ogg())], 'ton.ogg'));
    expect(await aktionen.vereinbarungSetzen({}, keinPdf)).toMatchObject({ fehler: 'pruefen', feldFehler: { datei: 'datei_typ' } });
    expect(await aktionen.vereinbarungSetzen({}, formular({ id }))).toMatchObject({ feldFehler: { datei: 'dateiFehlt' } });
    const fd = formular({ id });
    fd.append('datei', new File([new Uint8Array(PDF)], 'Vereinbarung Rezitation.pdf'));
    expect(await aktionen.vereinbarungSetzen({}, fd)).toMatchObject({ gespeichert: expect.any(Number) });
    const [r] = await db.select().from(schema.quranRezitation).where(eq(schema.quranRezitation.id, id));
    const [m] = await db.select().from(schema.medium).where(eq(schema.medium.id, r.vereinbarungMediumId!));
    expect(m.typ).toBe('application/pdf');
    expect(await vorhanden(join(verzeichnis, m.schluessel))).toBe(true);
    // Die zweite Rezitation verknüpft dieselbe Datei aus den Medien
    expect(await aktionen.vereinbarungSetzen({}, formular({ id: `${id}-2`, mediumId: m.id }))).toMatchObject({
      gespeichert: expect.any(Number),
    });

    aufrufe.updateTag.length = 0;
    expect(await aktionen.freigabeSetzen({}, formular({ id, an: '1' }))).toMatchObject({ gespeichert: expect.any(Number) });
    expect(aufrufe.updateTag).toEqual(expect.arrayContaining(['rezitationen', `rezitation:${id}`]));
    expect((await quran.ladeRezitationen()).map((z) => [z.id, z.standard])).toEqual([[id, true]]);
    expect(await aktionen.vereinbarungLoesen({}, formular({ id }))).toEqual({ fehler: 'aktiv' });

    // Zweite aktivieren und als Standard festlegen, dann wieder abschalten
    expect(await aktionen.freigabeSetzen({}, formular({ id: `${id}-2`, an: '1' }))).toMatchObject({ gespeichert: expect.any(Number) });
    expect(await aktionen.standardSetzen({}, formular({ id: `${id}-2` }))).toMatchObject({ gespeichert: expect.any(Number) });
    expect((await quran.ladeRezitationen()).map((z) => [z.id, z.standard])).toEqual([
      [`${id}-2`, true],
      [id, false],
    ]);
    expect(await aktionen.freigabeSetzen({}, formular({ id: `${id}-2`, an: '0' }))).toMatchObject({ gespeichert: expect.any(Number) });
    expect(await aktionen.vereinbarungLoesen({}, formular({ id: `${id}-2` }))).toMatchObject({ gespeichert: expect.any(Number) });
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id));
    expect(audit.map((a) => a.aktion)).toEqual(expect.arrayContaining(['inhalt.angelegt', 'inhalt.veroeffentlicht']));
  });
});

describe('Werkstatt: Audio, Verszeiten, Wortzeiten', () => {
  let pfad = '';

  it('Eingang: nur eigener Ursprung, nur Audio (Magic Bytes)', async () => {
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    expect((await hochladen(id, 108, ogg(), { 'sec-fetch-site': 'cross-site' })).status).toBe(403);
    expect(await hochladen(id, 108, PDF)).toMatchObject({ status: 415, fehler: 'audio_format' });
    expect(await hochladen(id, 108, Buffer.alloc(0))).toMatchObject({ status: 400 });
    // Eingang ohne Audio direkt im Speicher (z. B. Direkt-Upload): die Action prüft die Bytes erneut
    await speicher().schreibe('eingang/audio-00000000-0000-4000-8000-000000000001', PDF, 'application/octet-stream');
    expect(
      await aktionen.audioUebernehmen(
        {},
        formular({ rezitationId: id, sure: '108', eingang: 'eingang/audio-00000000-0000-4000-8000-000000000001' }),
      ),
    ).toEqual({ fehler: 'audio_format' });
    expect(await aktionen.audioUebernehmen({}, formular({ rezitationId: id, sure: '108', eingang: 'eingang/../medien/x' }))).toEqual({
      fehler: 'eingang',
    });
    expect(await db.select().from(schema.quranAudio)).toEqual([]);
  });

  it('Größe höchstens 60 MB', async () => {
    const gross = Buffer.alloc(AUDIO_MAX_BYTES + 1);
    gross.write('OggS');
    const e = await legeAudioAb({ rezitationId: id, sure: 108, roh: gross }).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(AudioFehler);
    expect(e).toMatchObject({ grund: 'zuGross' });
  });

  it('übernimmt eine Sure-Datei unter dem Inhalts-Hash; Eingang ist danach weg', async () => {
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    const daten = ogg();
    expect(await hochladen(id, 108, daten)).toMatchObject({ status: 200, gespeichert: expect.any(Number), hinweis: 'neu' });
    const [a] = await db.select().from(schema.quranAudio).where(eq(schema.quranAudio.rezitationId, id));
    pfad = a.pfad;
    expect(a).toMatchObject({ sure: 108, vers: 0, mime: 'audio/ogg', bytes: daten.length, sha256: sha(daten), dauerMs: 5000 });
    expect(a.pfad).toBe(`/audio/${id}/108-000-${sha(daten).slice(0, 16)}.ogg`);
    expect(readFileSync(join(verzeichnis, a.pfad.slice(1)))).toEqual(daten);
    // Jeder Eingang ist nach der Übernahme entfernt (auch der abgelehnte)
    expect(await readdir(join(verzeichnis, 'eingang'))).toEqual([]);
    // Gleiche Datei noch einmal: unverändert
    expect(await hochladen(id, 108, daten)).toMatchObject({ hinweis: 'unveraendert' });
  });

  it('Verszeiten: geprüft gespeichert und von der öffentlichen Zeiten-Route geliefert', async () => {
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    const sende = (verse: unknown) =>
      aktionen.verszeitenSpeichern({}, formular({ rezitationId: id, sure: '108', verse: JSON.stringify(verse) }));
    expect(await sende([[1, 0, 1000]])).toEqual({ fehler: 'verse_anzahl' });
    expect(
      await sende([
        [1, 0, 1000],
        [2, 900, 2000],
        [3, 2000, 3000],
      ]),
    ).toEqual({ fehler: 'verse_reihenfolge' });
    expect(
      await sende([
        [1, 0, 1000],
        [2, 1000, 2000],
        [3, 2000, 9000],
      ]),
    ).toEqual({ fehler: 'verse_dauer' });
    expect(await sende('kein json')).toEqual({ fehler: 'verse_anzahl' });
    expect(
      await sende([
        [1, 300, 1650],
        [2, 1650, 3350],
        [3, 3350, 4700],
      ]),
    ).toMatchObject({ gespeichert: expect.any(Number) });
    const z = await zeiten(108, id);
    expect(z?.audio.map((a) => a.pfad)).toEqual([pfad]);
    expect(z?.verse).toEqual([
      [1, 300, 1650],
      [2, 1650, 3350],
      [3, 3350, 4700],
    ]);
    expect(z?.woerter).toEqual([]);
  });

  it('Wortzeiten: ungeprüft gespeichert, erst nach Bestätigung öffentlich; neue Versgrenze setzt die Prüfung zurück', async () => {
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    const n = await wortzahl(108, 1);
    expect(n).toBeGreaterThan(1);
    const anfaenge = Array.from({ length: n }, (_, i) => 300 + i * 200);
    const sende = (a: unknown, vers = '1') =>
      aktionen.wortzeitenSpeichern({}, formular({ rezitationId: id, sure: '108', vers, anfaenge: JSON.stringify(a) }));
    expect(await sende(anfaenge.slice(1))).toEqual({ fehler: 'woerter_anzahl' });
    expect(await sende(anfaenge.map((a) => a - 300))).toEqual({ fehler: 'woerter_fenster' });
    expect(await sende([...anfaenge.slice(0, -1), anfaenge.at(-2)! + 10])).toEqual({ fehler: 'woerter_reihenfolge' });
    expect(await sende(anfaenge)).toMatchObject({ gespeichert: expect.any(Number) });
    const zeilen = await db.select().from(schema.quranWortzeit).where(eq(schema.quranWortzeit.rezitationId, id));
    expect(zeilen).toHaveLength(n);
    expect(zeilen.every((z) => z.quelle === 'mitklopfen' && !z.geprueft)).toBe(true);
    expect(zeilen.find((z) => z.pos === n)?.endeMs).toBe(1650);
    expect((await zeiten(108, id))?.woerter).toEqual([]);

    expect(await aktionen.wortzeitenBestaetigen({}, formular({ rezitationId: id, sure: '108', vers: '2' }))).toEqual({
      fehler: 'unvollstaendig',
    });
    expect(await aktionen.wortzeitenBestaetigen({}, formular({ rezitationId: id, sure: '108', vers: '1' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const oeffentlich = (await zeiten(108, id))?.woerter ?? [];
    expect(oeffentlich).toHaveLength(n);
    expect(oeffentlich[0]).toEqual([1, 1, 300, 500]);

    // Vers 1 bekommt ein neues Fenster → Wortzeiten wieder ungeprüft, nicht mehr öffentlich
    expect(
      await aktionen.verszeitenSpeichern(
        {},
        formular({
          rezitationId: id,
          sure: '108',
          verse: JSON.stringify([
            [1, 250, 1700],
            [2, 1700, 3350],
            [3, 3350, 4700],
          ]),
        }),
      ),
    ).toMatchObject({ hinweis: '2' });
    expect((await zeiten(108, id))?.woerter).toEqual([]);
  });

  it('Auslieferung: aktive Rezitation öffentlich mit Byte-Bereichen; unbekannte Pfade 404', async () => {
    await angemeldetAls(null);
    const ganz = await holeAudio(pfad);
    expect(ganz.status).toBe(200);
    expect(ganz.headers.get('content-type')).toBe('audio/ogg');
    expect(ganz.headers.get('accept-ranges')).toBe('bytes');
    expect(ganz.headers.get('cache-control')).toBe('public, max-age=86400');
    const teil = await holeAudio(pfad, 'bytes=0-3');
    expect(teil.status).toBe(206);
    expect(teil.headers.get('content-range')).toMatch(/^bytes 0-3\/\d+$/);
    expect(Buffer.from(await teil.arrayBuffer()).toString()).toBe('OggS');
    expect((await holeAudio(pfad, 'bytes=999999-')).status).toBe(416);
    expect((await holeAudio(`/audio/${id}/108-000-${'0'.repeat(16)}.ogg`)).status).toBe(404);
    expect((await holeAudio('/audio/../geheim.ogg')).status).toBe(404);
  });

  it('nicht aktive Rezitation: Audio nur für die Werkstatt', async () => {
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    expect(await aktionen.freigabeSetzen({}, formular({ id, an: '0' }))).toMatchObject({ gespeichert: expect.any(Number) });
    expect((await holeAudio(pfad)).headers.get('cache-control')).toBe('private, no-store');
    await angemeldetAls([{ rolle: 'redaktion' }]);
    expect((await holeAudio(pfad)).status).toBe(404);
    await angemeldetAls(null);
    expect((await holeAudio(pfad)).status).toBe(404);
    expect(await zeiten(108, id)).toBeNull();
  });

  it('neue Datei ersetzt die alte samt ihren Zeiten', async () => {
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    expect(await hochladen(id, 108, ogg())).toMatchObject({ hinweis: 'ersetzt' });
    expect(await vorhanden(join(verzeichnis, pfad.slice(1)))).toBe(false);
    expect(await db.select().from(schema.quranVerszeit).where(eq(schema.quranVerszeit.rezitationId, id))).toEqual([]);
    expect(await db.select().from(schema.quranWortzeit).where(eq(schema.quranWortzeit.rezitationId, id))).toEqual([]);
  });

  it('Liste und Suren-Raster zeigen die Vollständigkeit', async () => {
    const liste = await abfragen.ladeRezitationsListe();
    expect(liste.find((z) => z.id === id)).toMatchObject({ mitAudio: 1, mitVerszeiten: 0, mitWortzeiten: 0 });
    const r = await abfragen.ladeRezitation(id);
    expect(r?.suren).toHaveLength(114);
    expect(r?.suren.find((s) => s.nr === 108)).toMatchObject({ audio: 'sure', stufe: 'audio' });
    expect(r?.suren.find((s) => s.nr === 1)).toMatchObject({ stufe: 'leer' });
    const w = await abfragen.ladeWerkstatt(id, 108);
    expect(w?.verse).toHaveLength(3);
    expect(w?.verse[0].woerter.length).toBe(await wortzahl(108, 1));
    expect(await abfragen.ladeWerkstatt(id, 115)).toBeNull();
    expect(await abfragen.ladeWerkstatt('../x', 1)).toBeNull();
  });
});

describe('Import lizenzierter Sätze (H-Q06)', () => {
  const ordner = join(verzeichnis, 'satz');
  const dateien = [ogg(), ogg(), ogg()];
  const lizenz = Buffer.from('%PDF-1.4\n%Lizenz (synthetisch)\n');
  const manifest = (ueber: Record<string, unknown> = {}) => ({
    format: 1,
    rezitation: 'lizenz-satz',
    name: { de: '[Lizenzierter Satz]' },
    rezitator: '[Rezitator]',
    lizenz: '[Lizenz]',
    lizenzdatei: { datei: 'LIZENZ.pdf', sha256: sha(lizenz) },
    dateien: dateien.map((d, i) => ({ sure: 108, vers: i + 1, datei: `108${i + 1}.ogg`, sha256: sha(d), dauerMs: 2000 + i })),
    quranAlign: { datei: 'align.json', sha256: '' },
    ...ueber,
  });
  const schreibe = async (m: Record<string, unknown>, align?: unknown) => {
    const a = Buffer.from(JSON.stringify(align ?? []));
    const mit = { ...m, ...(m.quranAlign ? { quranAlign: { datei: 'align.json', sha256: sha(a) } } : {}) };
    await writeFile(join(ordner, 'align.json'), a);
    await writeFile(join(ordner, 'manifest.json'), JSON.stringify(mit));
    return join(ordner, 'manifest.json');
  };

  beforeAll(async () => {
    await mkdir(ordner, { recursive: true });
    await writeFile(join(ordner, 'LIZENZ.pdf'), lizenz);
    for (const [i, d] of dateien.entries()) await writeFile(join(ordner, `108${i + 1}.ogg`), d);
  });

  it('importiert inaktiv mit Dateien je Vers, Verszeiten und ungeprüften quran-align-Zeiten; wiederholbar', async () => {
    const n = await wortzahl(108, 1);
    const align = [{ surah: 108, ayah: 1, segments: Array.from({ length: n }, (_, i) => [i, i + 1, i * 300, (i + 1) * 300]) }];
    const pfad = await schreibe(manifest(), align);
    const b = await importiereRezitation({ manifestPfad: pfad });
    expect(b).toMatchObject({
      rezitation: 'lizenz-satz',
      angelegt: true,
      dateien: { neu: 3, ersetzt: 0, unveraendert: 0 },
      verszeiten: 3,
      wortzeiten: n,
    });
    const [r] = await db.select().from(schema.quranRezitation).where(eq(schema.quranRezitation.id, 'lizenz-satz'));
    expect(r).toMatchObject({ art: 'lizenziert', aktiv: false, vereinbarungMediumId: null });
    const w = await db.select().from(schema.quranWortzeit).where(eq(schema.quranWortzeit.rezitationId, 'lizenz-satz'));
    expect(w.every((z) => z.quelle === 'quran_align' && !z.geprueft)).toBe(true);
    // Zweiter Lauf: nichts ändert sich
    expect(await importiereRezitation({ manifestPfad: pfad })).toMatchObject({
      angelegt: false,
      dateien: { neu: 0, ersetzt: 0, unveraendert: 3 },
      verszeiten: 0,
      wortzeiten: 0,
    });
    // Werkstatt: Wortzeiten bestätigen; ein neuer Import überschreibt geprüfte Zeiten nicht
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    expect(await aktionen.wortzeitenBestaetigen({}, formular({ rezitationId: 'lizenz-satz', sure: '108', vers: '1' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const anders = [{ surah: 108, ayah: 1, segments: Array.from({ length: n }, (_, i) => [i, i + 1, i * 310, (i + 1) * 310]) }];
    const b3 = await importiereRezitation({ manifestPfad: await schreibe(manifest(), anders) });
    expect(b3.wortzeiten).toBe(0);
    expect(b3.hinweise.join(' ')).toContain('geprüfte Zeiten bleiben');
    const b4 = await importiereRezitation({ manifestPfad: await schreibe(manifest(), anders), ueberschreibeGeprueft: true });
    expect(b4.wortzeiten).toBe(n);
    // Vereinbarung fehlt → nie aktiv
    expect(await aktionen.freigabeSetzen({}, formular({ id: 'lizenz-satz', an: '1' }))).toEqual({ fehler: 'ohneVereinbarung' });
  });

  it('lehnt ab: eigene Rezitation, fehlende Lizenzdatei, falscher Hash, Nicht-Audio, unbekannter Vers; trocken schreibt nichts', async () => {
    const fehler = async (m: Record<string, unknown>) => {
      const e = await importiereRezitation({ manifestPfad: await schreibe(m) }).catch((x: unknown) => x);
      expect(e).toBeInstanceOf(ImportFehler);
      return (e as InstanceType<typeof ImportFehler>).fehler.join('\n');
    };
    expect(await fehler(manifest({ rezitation: id, quranAlign: undefined }))).toContain('Import nur in lizenzierte Rezitationen');
    expect(await fehler(manifest({ lizenzdatei: { datei: 'FEHLT.pdf', sha256: sha(lizenz) }, quranAlign: undefined }))).toContain(
      'Lizenzdatei FEHLT.pdf: fehlt',
    );
    expect(
      await fehler(manifest({ quranAlign: undefined, dateien: [{ sure: 108, vers: 1, datei: '1081.ogg', sha256: sha(ogg()) }] })),
    ).toContain('SHA-256 stimmt nicht');
    expect(
      await fehler(manifest({ quranAlign: undefined, dateien: [{ sure: 108, vers: 1, datei: 'LIZENZ.pdf', sha256: sha(lizenz) }] })),
    ).toContain('Magic Bytes');
    expect(
      await fehler(manifest({ quranAlign: undefined, dateien: [{ sure: 108, vers: 9, datei: '1081.ogg', sha256: sha(dateien[0]) }] })),
    ).toContain('Vers 9 gibt es nicht');
    const vorher = await db.select().from(schema.quranAudio);
    const t = await importiereRezitation({
      manifestPfad: await schreibe(manifest({ rezitation: 'trocken-test', quranAlign: undefined })),
      trocken: true,
    });
    expect(t.angelegt).toBe(true);
    expect(await db.select().from(schema.quranRezitation).where(eq(schema.quranRezitation.id, 'trocken-test'))).toEqual([]);
    expect(await db.select().from(schema.quranAudio)).toEqual(vorher);
  });
});
