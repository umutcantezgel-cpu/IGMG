import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { solveChallenge } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { and, eq, like } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { db as appDb, type Datenbank, schema } from '@/lib/db';
import { textHash } from '@/lib/lernapp/paket/hash';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Verwaltung v1 der Lern-App (L3-06, PLAN §7, ADR 0041) gegen PGlite mit dem Testkurs: Rechte und Schalter jeder Action
 * (Negativfälle), Prüfsprachen, Stichprobe ziehen und beurteilen bis zur Entscheidung (bestanden veröffentlicht, kritisch
 * verbirgt sofort), Religionswächter für Eingaben, Meldungen (öffentliche Route mit ALTCHA und Grenze; Alternative,
 * Sperren, Erledigen), Audio-Studio (Sprecher mit Vereinbarung, Aufnahme nach Magic Bytes, nie vertonbar, Wahl der Stimme
 * wirkt auf die Pakete), Cockpit-Karte und Betriebszähler. Audit ohne Inhalte. Testdaten nur fiktiv und synthetisch.
 */
const ablage = mkdtempSync(join(tmpdir(), 'lernapp-verwaltung-'));
process.env.MEDIEN_VERZEICHNIS = ablage;
const { client, db } = await verwaltungsUmgebung();
const { lernappTestkurs } = await import('../../drizzle/seeds/lernapp-test');
const sprache = await import('@/server/actions/lernapp-sprachpruefung');
const meldungen = await import('@/server/actions/lernapp-meldungen');
const audio = await import('@/server/actions/lernapp-audio');
const meldungRoute = await import('@/app/api/lernapp/meldung/route');
const aufnahmeRoute = await import('@/app/[locale]/verwaltung/(geschuetzt)/lernapp/audio/aufnahme/[id]/route');
const { baueRichtung, ladeBauEingaben } = await import('@/server/queries/lernapp/pakete');
const { BLOECKE } = await import('@/server/queries/lernapp/bloecke');
const { ladeGesperrte } = await import('@/server/queries/lernapp/meldungen');
const { kandidaten, ladeWarteschlange } = await import('@/server/queries/lernapp/sprachpruefung');
const { ladeKursBaum, ladeLernappUebersicht, ladeVorschau } = await import('@/server/queries/lernapp/verwaltung');
const { ladeStudio } = await import('@/server/queries/lernapp/audio-studio');
const { lernappPruefen } = await import('@/lib/startklar/lernapp');
const { zaehleBetrieb, betriebsSumme } = await import('@/lib/lernapp/verwaltung/betrieb');
const { neueChallenge } = await import('@/lib/validierung/altcha');

afterAll(() => {
  rmSync(ablage, { recursive: true, force: true });
  return client.close();
});
beforeAll(async () => {
  await lernappTestkurs(appDb);
});
afterEach(() => {
  delete process.env.FUNKTION_LERNAPP;
  delete process.env.FUNKTION_LERNAPP_MELDUNGEN;
});

const ADMIN: RollenZuweisung[] = [{ rolle: 'administration' }];
const SPRACHE: RollenZuweisung[] = [{ rolle: 'sprachpruefung' }];
const BILDUNG: RollenZuweisung[] = [{ rolle: 'bildung' }];
const REDAKTION: RollenZuweisung[] = [{ rolle: 'redaktion' }];

async function mitSprachen(rollen: RollenZuweisung[], sprachen: ('de' | 'tr' | 'ar')[]): Promise<string> {
  const id = (await angemeldetAls(rollen))!;
  if (sprachen.length)
    await db
      .insert(schema.lernappPrueferSprache)
      .values(sprachen.map((s) => ({ benutzerId: id, sprache: s, ebene: 'muttersprache' as const })));
  return id;
}

async function audits(aktion: string) {
  return db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, aktion));
}

/** Vier aufeinanderfolgende Wörter aus dem gepinnten Tanzil-Text (nur im Speicher, nie im Repository). */
function koranWortfolge(): string {
  const xml = readFileSync(join(process.cwd(), 'daten/tanzil/quran-uthmani.xml'), 'utf8');
  const texte = [...xml.matchAll(/<aya index="\d+" text="([^"]+)"/g)].map((m) => m[1]!);
  const vers = texte.find((t) => t.split(/\s+/).length >= 6)!;
  return vers.split(/\s+/).slice(1, 5).join(' ');
}

describe('Rechte und Schalter (Negativfälle)', () => {
  const aufrufeJeAction = () => [
    () => sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.test', art: 'zieltext' })),
    () => sprache.eintragPruefen({}, formular({ stichprobe: '00000000-0000-0000-0000-000000000000', eintrag: 'x', urteil: 'ok' })),
    () => sprache.pruefsprachenSetzen({}, formular({ benutzerId: 'x' })),
    () => meldungen.meldungErledigen({}, formular({ id: '00000000-0000-0000-0000-000000000000' })),
    () => meldungen.alternativeErgaenzen({}, formular({ id: '00000000-0000-0000-0000-000000000000', alternative: 'x' })),
    () => meldungen.eintragSperren({}, formular({ id: '00000000-0000-0000-0000-000000000000', ziel: 'x' })),
    () => meldungen.eintragEntsperren({}, formular({ ziel: 'tr.a1.test.l01.a01', bestaetigt: '1' })),
    () => audio.sprecherAnlegen({}, formular({ name: 'Testperson Eins' })),
    () => audio.aufnahmeSpeichern({}, formular({ eintrag: 'tr.a1.test.w001' })),
    () => audio.aufnahmeVerwerfen({}, formular({ id: '00000000-0000-0000-0000-000000000000' })),
    () => audio.stimmeWaehlen({}, formular({ eintrag: 'tr.a1.test.w001', wahl: 'mensch' })),
  ];

  it('ohne Sitzung, ohne zweiten Faktor und ohne Rolle: keinRecht, nichts geschrieben', async () => {
    for (const [rollen, faktor] of [
      [null, true],
      [ADMIN, false],
      [[], true],
    ] as const) {
      await angemeldetAls(rollen as RollenZuweisung[] | null, faktor);
      for (const f of aufrufeJeAction()) expect(await f()).toEqual({ fehler: 'keinRecht' });
    }
    expect(await db.select().from(schema.lernappStichprobe)).toHaveLength(0);
  });

  it('Redaktion hat kein Lern-App-Recht; Sprachprüfung nur Lesen und Sprache prüfen', async () => {
    await angemeldetAls(REDAKTION);
    for (const f of aufrufeJeAction()) expect(await f()).toEqual({ fehler: 'keinRecht' });
    await mitSprachen(SPRACHE, ['tr']);
    expect(await sprache.pruefsprachenSetzen({}, formular({ benutzerId: 'x' }))).toEqual({ fehler: 'keinRecht' });
    expect(await meldungen.meldungErledigen({}, formular({ id: '00000000-0000-0000-0000-000000000000' }))).toEqual({ fehler: 'keinRecht' });
    expect(await audio.stimmeWaehlen({}, formular({ eintrag: 'tr.a1.test.w001', wahl: 'mensch' }))).toEqual({ fehler: 'keinRecht' });
    // Bildung bearbeitet, prüft aber keine Sprache (Recht fehlt)
    await angemeldetAls(BILDUNG);
    expect(
      await sprache.eintragPruefen({}, formular({ stichprobe: '00000000-0000-0000-0000-000000000000', eintrag: 'x', urteil: 'ok' })),
    ).toEqual({
      fehler: 'keinRecht',
    });
  });

  it('Schalter lernapp aus: Hinweis statt Wirkung', async () => {
    process.env.FUNKTION_LERNAPP = 'aus';
    await angemeldetAls(ADMIN);
    for (const f of aufrufeJeAction()) expect(await f()).toEqual({ fehler: 'aus' });
  });
});

describe('Prüfsprachen', () => {
  it('setzt die Redaktion; nur für Personen mit Prüfrecht; Audit ohne Inhalte', async () => {
    const pruefer = (await angemeldetAls(SPRACHE))!;
    const ohne = (await angemeldetAls(REDAKTION))!;
    await angemeldetAls(BILDUNG);
    expect(await sprache.pruefsprachenSetzen({}, formular({ benutzerId: ohne, sprache_tr: 'muttersprache' }))).toEqual({
      fehler: 'keinPruefrecht',
    });
    expect(
      await sprache.pruefsprachenSetzen({}, formular({ benutzerId: pruefer, sprache_tr: 'muttersprache', sprache_de: 'sehr_gut' })),
    ).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const zeilen = await db.select().from(schema.lernappPrueferSprache).where(eq(schema.lernappPrueferSprache.benutzerId, pruefer));
    expect(zeilen.map((z) => `${z.sprache}:${z.ebene}`).sort()).toEqual(['de:sehr_gut', 'tr:muttersprache']);
    const [a] = await audits('lernapp.pruefsprachen_geaendert');
    expect(a).toMatchObject({ zielId: pruefer, details: { sprachen: 'de:sehr_gut,tr:muttersprache' } });
  });
});

describe('Stichprobe: ziehen, beurteilen, entscheiden', () => {
  let stichprobe = '';
  let pruefer = '';

  it('nur in der eigenen Prüfsprache; Größe, Einlauf und Startwert gespeichert', async () => {
    await mitSprachen(SPRACHE, ['de']);
    expect(await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.test', art: 'zieltext' }))).toEqual({ fehler: 'keinRecht' });
    pruefer = await mitSprachen(SPRACHE, ['tr']);
    const warte = await ladeWarteschlange(['tr']);
    expect(warte.find((w) => w.einheit === 'tr.a1.test' && w.art === 'zieltext')).toMatchObject({ ziehbar: true, letzte: null });
    const z = await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.test', art: 'zieltext' }));
    expect(z).toMatchObject({ gespeichert: expect.any(Number), id: expect.any(String) });
    stichprobe = z.id!;
    const [s] = await db.select().from(schema.lernappStichprobe).where(eq(schema.lernappStichprobe.id, stichprobe));
    // weniger als 20 Kandidaten: alle; Einlauf, weil noch keine Stichprobe dieser Sprache entschieden ist
    expect(s).toMatchObject({ sprache: 'tr', art: 'zieltext', einlauf: true, entscheidung: 'offen' });
    expect(s!.groesse).toBe(s!.auswahl.length);
    expect(s!.seed).toContain('tr.a1.test|zieltext|-|');
    expect(await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.test', art: 'zieltext' }))).toEqual({ fehler: 'offen' });
    const [a] = await audits('lernapp.stichprobe_gezogen');
    expect(a!.details).toMatchObject({ einheit: 'tr.a1.test', art: 'zieltext', groesse: s!.groesse });
  });

  it('Urteil: Kategorie Pflicht außer bei ok; Korrektur mit Wortfolge aus dem Koran rot; fremde Sprache abgewiesen', async () => {
    const [s] = await db.select().from(schema.lernappStichprobe).where(eq(schema.lernappStichprobe.id, stichprobe));
    const eintrag = s!.auswahl[0]!;
    await mitSprachen(SPRACHE, ['ar']);
    expect(await sprache.eintragPruefen({}, formular({ stichprobe, eintrag, urteil: 'ok' }))).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls(null);
    const id = (await angemeldetAls(SPRACHE))!;
    await db.insert(schema.lernappPrueferSprache).values({ benutzerId: id, sprache: 'tr', ebene: 'sehr_gut' });
    expect(await sprache.eintragPruefen({}, formular({ stichprobe, eintrag, urteil: 'korrektur', korrektur: 'x' }))).toMatchObject({
      feldFehler: { kategorie: 'kategorieFehlt' },
    });
    expect(
      await sprache.eintragPruefen(
        {},
        formular({ stichprobe, eintrag, urteil: 'korrektur', kategorie: 'zeichensetzung', korrektur: koranWortfolge() }),
      ),
    ).toMatchObject({ feldFehler: { korrektur: 'waechter_wortfolge' } });
    expect(await sprache.eintragPruefen({}, formular({ stichprobe, eintrag: 'tr.fremd', urteil: 'ok' }))).toEqual({
      fehler: 'nichtGefunden',
    });
    expect(await db.select().from(schema.lernappPruefung)).toHaveLength(0);
  });

  it('alle ok → bestanden: Einheit, Lektionen, Aufgaben und Zieltexte veröffentlicht, Kurs-Tag erneuert', async () => {
    const [s] = await db.select().from(schema.lernappStichprobe).where(eq(schema.lernappStichprobe.id, stichprobe));
    await angemeldetAls(null);
    const id = (await angemeldetAls(SPRACHE))!;
    await db.insert(schema.lernappPrueferSprache).values({ benutzerId: id, sprache: 'tr', ebene: 'muttersprache' });
    let letzte = {};
    for (const eintrag of s!.auswahl) letzte = await sprache.eintragPruefen({}, formular({ stichprobe, eintrag, urteil: 'ok' }));
    expect(letzte).toMatchObject({ hinweis: 'bestanden' });
    // Warteschlange zählt die beurteilten Einträge der Stichprobe (nicht die einer anderen Tabelle)
    const zeile = (await ladeWarteschlange(['tr'])).find((w) => w.einheit === 'tr.a1.test' && w.art === 'zieltext');
    expect(zeile?.letzte).toMatchObject({ id: stichprobe, entscheidung: 'bestanden', geprueft: s!.auswahl.length, aktuell: true });
    const [nachher] = await db.select().from(schema.lernappStichprobe).where(eq(schema.lernappStichprobe.id, stichprobe));
    expect(nachher).toMatchObject({ entscheidung: 'bestanden', ergebnis: { geprueft: s!.auswahl.length, kritisch: 0, leicht: 0 } });
    const [einheit] = await db.select().from(schema.lernappEinheit).where(eq(schema.lernappEinheit.schluessel, 'tr.a1.test'));
    expect(einheit!.status).toBe('veroeffentlicht');
    const saetze = await db.select().from(schema.lernappSatz).where(like(schema.lernappSatz.schluessel, 'tr.a1.test.%'));
    expect(saetze.every((x) => x.status === 'veroeffentlicht')).toBe(true);
    const aufgaben = await db
      .select({ status: schema.lernappAufgabe.status })
      .from(schema.lernappAufgabe)
      .where(like(schema.lernappAufgabe.schluessel, 'tr.a1.test.%'));
    expect(aufgaben.every((x) => x.status === 'veroeffentlicht')).toBe(true);
    expect(aufrufe.updateTag).toContain('lernapp-kurs-tr');
    const [a] = await audits('lernapp.stichprobe_entschieden');
    expect(a!.details).toMatchObject({ entscheidung: 'bestanden', kritisch: 0 });
    // Prüfschritte ohne Inhalte im Audit
    for (const x of await audits('lernapp.geprueft'))
      expect(Object.keys(x.details ?? {}).sort()).toEqual(['art', 'inhaltTyp', 'kategorie', 'urteil']);
    // zum selben Stand gibt es keine neue Stichprobe
    expect(await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.test', art: 'zieltext' }))).toEqual({ fehler: 'schonGezogen' });
    expect(pruefer).not.toBe('');
  });

  it('Übersetzung: kritisches Urteil verbirgt sofort, Entscheidung „nachbessern“, Übersetzungen bleiben unveröffentlicht', async () => {
    await mitSprachen(SPRACHE, ['de']);
    const z = await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.test', art: 'uebersetzung', richtung: 'tr-aus-de' }));
    expect(z.id).toEqual(expect.any(String));
    const [s] = await db.select().from(schema.lernappStichprobe).where(eq(schema.lernappStichprobe.id, z.id!));
    expect(s).toMatchObject({ sprache: 'de', richtungId: 'tr-aus-de' });
    const [erster, ...rest] = s!.auswahl;
    aufrufe.updateTag.length = 0;
    expect(
      await sprache.eintragPruefen(
        {},
        formular({ stichprobe: z.id!, eintrag: erster!, urteil: 'abgelehnt', kategorie: 'bedeutung', kommentar: 'Bedeutung falsch' }),
      ),
    ).toMatchObject({ hinweis: 'offen' });
    expect(aufrufe.updateTag).toContain('lernapp-kurs-tr');
    for (const eintrag of rest) await sprache.eintragPruefen({}, formular({ stichprobe: z.id!, eintrag, urteil: 'ok' }));
    const [nachher] = await db.select().from(schema.lernappStichprobe).where(eq(schema.lernappStichprobe.id, z.id!));
    expect(nachher).toMatchObject({ entscheidung: 'nachbessern', ergebnis: { kritisch: 1 } });
    const ue = await db
      .select({ status: schema.lernappUebersetzung.status })
      .from(schema.lernappUebersetzung)
      .innerJoin(schema.lernappSatz, eq(schema.lernappSatz.id, schema.lernappUebersetzung.satzId))
      .where(and(eq(schema.lernappUebersetzung.sprache, 'de'), like(schema.lernappSatz.schluessel, 'tr.a1.test.%')));
    expect(ue.every((x) => x.status === 'automatisch_geprueft')).toBe(true);
    const u = await ladeLernappUebersicht();
    expect(u.befunde.kritisch).toBeGreaterThanOrEqual(1);
    expect(u.befunde.nachbessern).toBe(1);
    expect(u.quoten.jeSprache.tr).toMatchObject({ bestanden: 1 });
    expect(u.quoten.jeSprache.tr!.geprueft).toBe(u.quoten.jeSprache.tr!.gezogen);
    expect(u.quoten.jeSprache.de).toMatchObject({ offen: 0, nachbessern: 1, geprueft: s!.auswahl.length });
  });

  it('gleichzeitige letzte Urteile: genau eine Entscheidung, ein Audit und eine neue Kursversion', async () => {
    await mitSprachen(SPRACHE, ['ar']);
    const z = await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.test', art: 'uebersetzung', richtung: 'tr-aus-ar' }));
    const [s] = await db.select().from(schema.lernappStichprobe).where(eq(schema.lernappStichprobe.id, z.id!));
    expect(s!.auswahl.length).toBeGreaterThanOrEqual(2);
    const vorletzter = s!.auswahl.at(-2)!;
    const letzter = s!.auswahl.at(-1)!;
    for (const eintrag of s!.auswahl.slice(0, -2)) await sprache.eintragPruefen({}, formular({ stichprobe: z.id!, eintrag, urteil: 'ok' }));
    const version = async () =>
      (await db.select({ v: schema.lernappKurs.version }).from(schema.lernappKurs).where(eq(schema.lernappKurs.id, 'tr')))[0]!.v;
    const vorher = await version();
    const ergebnisse = await Promise.all([
      sprache.eintragPruefen({}, formular({ stichprobe: z.id!, eintrag: vorletzter, urteil: 'ok' })),
      sprache.eintragPruefen({}, formular({ stichprobe: z.id!, eintrag: letzter, urteil: 'ok' })),
    ]);
    expect(ergebnisse.map((e) => e.hinweis)).toContain('bestanden');
    const [nachher] = await db.select().from(schema.lernappStichprobe).where(eq(schema.lernappStichprobe.id, z.id!));
    expect(nachher!.entscheidung).toBe('bestanden');
    expect((await audits('lernapp.stichprobe_entschieden')).filter((a) => a.zielId === z.id)).toHaveLength(1);
    expect(await version()).toBe(vorher + 1);
  });
});

describe('Meldungen: öffentliche Route und Bearbeitung', () => {
  beforeEach(async () => {
    await db.delete(schema.ratenbegrenzung);
  });
  async function altcha(): Promise<string> {
    const challenge = await neueChallenge();
    const solution = await solveChallenge({ challenge, deriveKey });
    return Buffer.from(JSON.stringify({ challenge, solution })).toString('base64');
  }
  const sende = (koerper: unknown, kopf: Record<string, string> = {}) =>
    meldungRoute.POST(
      new Request('https://example.test/api/lernapp/meldung', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'sec-fetch-site': 'same-origin', ...kopf },
        body: JSON.stringify(koerper),
      }),
    );

  it('ohne Konto: nur Aufgabe und Kategorie (Antwort verworfen), ALTCHA einmalig, keine Cookies', async () => {
    await angemeldetAls(null);
    const loesung = await altcha();
    const r = await sende({
      kurs: 'tr-aus-de',
      aufgabe: 'tr.a1.test.l02.a01',
      kategorie: 'antwort_richtig',
      altcha: loesung,
      antwort: 'Das Haus ist sehr groß.',
    });
    expect(r.status).toBe(201);
    expect(r.headers.get('set-cookie')).toBeNull();
    expect(r.headers.get('cache-control')).toContain('no-store');
    const [m] = await db.select().from(schema.lernappMeldung);
    expect(m).toMatchObject({
      aufgabeSchluessel: 'tr-aus-de:tr.a1.test.l02.a01',
      kategorie: 'antwort_richtig',
      antwort: null,
      status: 'offen',
    });
    // dieselbe Lösung noch einmal
    expect((await sende({ kurs: 'tr-aus-de', aufgabe: 'tr.a1.test.l02.a01', kategorie: 'sonstiges', altcha: loesung })).status).toBe(400);
    expect(await betriebsSumme('meldung', 1)).toBe(1);
  });

  it('Prüfungen: Ursprung, Schema, fremde Aufgabe, Schalter, Grenze je IP', async () => {
    await angemeldetAls(null);
    expect(
      (
        await sende(
          { kurs: 'tr-aus-de', aufgabe: 'tr.a1.test.l02.a01', kategorie: 'sonstiges', altcha: 'x' },
          { 'sec-fetch-site': 'cross-site' },
        )
      ).status,
    ).toBe(403);
    expect(
      (await sende({ kurs: 'tr-aus-de', aufgabe: 'tr.a1.test.l02.a01', kategorie: 'sonstiges', altcha: 'x', email: 'a@example.test' }))
        .status,
    ).toBe(400);
    expect((await sende({ kurs: 'tr-aus-de', aufgabe: 'ar.a1.test.l02.a01', kategorie: 'sonstiges', altcha: 'x' })).status).toBe(400);
    expect((await sende({ kurs: 'tr-aus-de', aufgabe: 'tr.a1.e09.l01.a01', kategorie: 'sonstiges', altcha: 'x' })).status).toBe(404);
    process.env.FUNKTION_LERNAPP_MELDUNGEN = 'aus';
    expect((await sende({ kurs: 'tr-aus-de', aufgabe: 'tr.a1.test.l02.a01', kategorie: 'sonstiges', altcha: 'x' })).status).toBe(404);
    delete process.env.FUNKTION_LERNAPP_MELDUNGEN;
    await db.delete(schema.ratenbegrenzung);
    const status: number[] = [];
    for (let i = 0; i < 11; i++)
      status.push((await sende({ kurs: 'tr-aus-de', aufgabe: 'tr.a1.test.l02.a01', kategorie: 'sonstiges', altcha: 'x' })).status);
    expect(status.slice(0, 10).every((s) => s === 400)).toBe(true);
    expect(status[10]).toBe(429);
  });

  it('angemeldet ab 16: die Antwort bleibt (höchstens 200 Zeichen)', async () => {
    await db.delete(schema.ratenbegrenzung);
    await angemeldetAls(ADMIN);
    const r = await sende({
      kurs: 'tr-aus-de',
      aufgabe: 'tr.a1.test.l02.a02',
      kategorie: 'antwort_richtig',
      altcha: await altcha(),
      antwort: '[Antwort]',
    });
    expect(r.status).toBe(201);
    const [m] = await db
      .select()
      .from(schema.lernappMeldung)
      .where(eq(schema.lernappMeldung.aufgabeSchluessel, 'tr-aus-de:tr.a1.test.l02.a02'));
    expect(m!.antwort).toBe('[Antwort]');
  });

  it('angemeldetes Kinderkonto (Z-L09, KERN 4.0 §5): Meldung möglich, Antwort verworfen, kein Antwortweg zum Kind', async () => {
    /** Konto der Gemeinde (Schüler) mit Zugang; `istKind` wie im Profil der Kinderanmeldung (fiktive Testperson). */
    const schueler = async (istKind: boolean) => {
      const id = (await angemeldetAls([]))!;
      await db.insert(schema.kontoProfil).values({ benutzerId: id, anzeigename: istKind ? '[Kind]' : '[Schüler]', istKind });
      await db.insert(schema.gemeindeRolle).values({ benutzerId: id, rolle: 'schueler' });
      return id;
    };
    const meldungZu = async (aufgabe: string) =>
      db
        .select()
        .from(schema.lernappMeldung)
        .where(eq(schema.lernappMeldung.aufgabeSchluessel, `tr-aus-de:${aufgabe}`));
    const ausgang = async () => ({
      mail: (await db.select().from(schema.mailAusgang)).length,
      push: (await db.select().from(schema.pushVersand)).length,
      chat: (await db.select().from(schema.chatNachricht)).length,
      postfach: (await db.select().from(schema.postfachNachricht)).length,
    });

    // Gegenprobe: dasselbe Konto ohne Kinderkennzeichen behält die Antwort – es liegt also nur an `istKind`
    await db.delete(schema.ratenbegrenzung);
    await schueler(false);
    const gross = await sende({
      kurs: 'tr-aus-de',
      aufgabe: 'tr.a1.test.l02.a03',
      kategorie: 'antwort_richtig',
      altcha: await altcha(),
      antwort: '[Antwort Schüler]',
    });
    expect(gross.status).toBe(201);
    expect((await meldungZu('tr.a1.test.l02.a03')).map((m) => m.antwort)).toEqual(['[Antwort Schüler]']);
    await db.delete(schema.lernappMeldung).where(eq(schema.lernappMeldung.aufgabeSchluessel, 'tr-aus-de:tr.a1.test.l02.a03'));

    // Kind: die Meldung kommt an, die eigene Antwort nie
    await db.delete(schema.ratenbegrenzung);
    const kind = await schueler(true);
    const r = await sende({
      kurs: 'tr-aus-de',
      aufgabe: 'tr.a1.test.l02.a03',
      kategorie: 'antwort_richtig',
      altcha: await altcha(),
      antwort: '[Antwort Kind]',
    });
    expect(r.status).toBe(201);
    expect(r.headers.get('set-cookie')).toBeNull();
    expect(await r.text()).toBe('');
    const [m] = await meldungZu('tr.a1.test.l02.a03');
    expect(m).toMatchObject({ kategorie: 'antwort_richtig', antwort: null, status: 'offen', erledigtVon: null });
    // Kein Antwortweg: die Meldung trägt weder Konto noch Adresse des Kindes, nur Aufgabe, Kategorie und Bearbeitung
    expect(Object.keys(m!).sort()).toEqual([
      'am',
      'antwort',
      'aufgabeSchluessel',
      'erledigtAm',
      'erledigtVon',
      'id',
      'kategorie',
      'status',
    ]);
    expect(JSON.stringify(m)).not.toContain(kind);
    expect(JSON.stringify(m)).not.toContain(kind.slice(0, 8));

    // Erledigen benachrichtigt niemanden: keine Mail, kein Push, kein Chat, kein Postfach, nichts nachgelagert
    const vorher = await ausgang();
    await angemeldetAls(BILDUNG);
    expect(await meldungen.meldungErledigen({}, formular({ id: m!.id }))).toMatchObject({ gespeichert: expect.any(Number) });
    expect(await ausgang()).toEqual(vorher);
    expect(aufrufe.nachher).toHaveLength(0);
    const [erledigt] = await meldungZu('tr.a1.test.l02.a03');
    expect(erledigt).toMatchObject({ status: 'erledigt', antwort: null });
  });

  it('Alternative ergänzen: an der Übersetzung (nach Ausgang) bzw. an der Aufgabe (nach Ziel); menschlich geprüft, neuer Hash', async () => {
    await angemeldetAls(BILDUNG);
    const [nachAusgang] = await db
      .select()
      .from(schema.lernappMeldung)
      .where(eq(schema.lernappMeldung.aufgabeSchluessel, 'tr-aus-de:tr.a1.test.l02.a01'));
    const [satz] = await db.select().from(schema.lernappSatz).where(eq(schema.lernappSatz.schluessel, 'tr.a1.test.s0002'));
    const [vorher] = await db
      .select()
      .from(schema.lernappUebersetzung)
      .where(and(eq(schema.lernappUebersetzung.satzId, satz!.id), eq(schema.lernappUebersetzung.sprache, 'de')));
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: nachAusgang!.id, alternative: vorher!.text }))).toMatchObject({
      feldFehler: { alternative: 'alternative_doppelt' },
    });
    // lateinische Formel der Formelliste (Wortlaut aus dem Leitfaden, nicht von Hand) an einem Eintrag ohne Religionsbezug: rot
    // wie im Inhaltsprüfer und im Paketbau (Gegenprüfung N2, Z-L10)
    const { FORMELN } = await import('@/lib/lernapp/formelliste');
    const formel = (id: string, teil = 0) =>
      FORMELN.liste
        .find((f) => f.id === id)!
        .begriff.split(',')
        [teil]!.trim();
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: nachAusgang!.id, alternative: `${formel('F-de-04')}.` }))).toMatchObject(
      {
        feldFehler: { alternative: 'waechter_formel' },
      },
    );
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: nachAusgang!.id, alternative: 'Das Gebäude ist groß.' }))).toMatchObject(
      {
        gespeichert: expect.any(Number),
      },
    );
    const [nachher] = await db.select().from(schema.lernappUebersetzung).where(eq(schema.lernappUebersetzung.id, vorher!.id));
    expect(nachher!.alternativen).toEqual([...vorher!.alternativen, 'Das Gebäude ist groß.']);
    expect(nachher!.inhaltHash).not.toBe(vorher!.inhaltHash);
    expect(nachher!.menschlichGeprueft).toBe(true);
    const [erledigt] = await db.select().from(schema.lernappMeldung).where(eq(schema.lernappMeldung.id, nachAusgang!.id));
    expect(erledigt).toMatchObject({ status: 'erledigt', antwort: null });

    const [nachZiel] = await db
      .select()
      .from(schema.lernappMeldung)
      .where(eq(schema.lernappMeldung.aufgabeSchluessel, 'tr-aus-de:tr.a1.test.l02.a02'));
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: nachZiel!.id, alternative: koranWortfolge() }))).toMatchObject({
      feldFehler: { alternative: 'waechter_wortfolge' },
    });
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: nachZiel!.id, alternative: formel('F-tr-03', 1) }))).toMatchObject({
      feldFehler: { alternative: 'waechter_formel' },
    });
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: nachZiel!.id, alternative: '[Fassung]' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const [aufgabe] = await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.schluessel, 'tr.a1.test.l02.a02'));
    expect(aufgabe!.daten.alternativen).toContain('[Fassung]');
    expect(aufgabe!.menschlichGeprueft).toBe(true);
    // Die Antwort wurde mit dem Erledigen gelöscht
    const [m2] = await db.select().from(schema.lernappMeldung).where(eq(schema.lernappMeldung.id, nachZiel!.id));
    expect(m2).toMatchObject({ status: 'erledigt', antwort: null });
  });

  it('Sperren: Aufgabe bzw. verwendeter Eintrag sofort gesperrt; fremde Einträge abgewiesen; keine Alternative für Auswahl', async () => {
    await angemeldetAls(BILDUNG);
    const [m] = await db
      .insert(schema.lernappMeldung)
      .values({ aufgabeSchluessel: 'tr-aus-de:tr.a1.test.l01.a01', kategorie: 'fehler_zieltext' })
      .returning();
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: m!.id, alternative: '[x]' }))).toEqual({ fehler: 'keineAlternative' });
    expect(await meldungen.eintragSperren({}, formular({ id: m!.id, ziel: 'de.a1.test.w001', bestaetigt: '1' }))).toEqual({
      fehler: 'nichtGefunden',
    });
    // ohne ausdrückliche Bestätigung (zweiter Schritt des Knopfs) wird nichts gesperrt
    expect(await meldungen.eintragSperren({}, formular({ id: m!.id, ziel: 'tr.a1.test.l01.a01' }))).toEqual({ fehler: 'bestaetigen' });
    const [vorher] = await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.schluessel, 'tr.a1.test.l01.a01'));
    expect(vorher!.status).not.toBe('gesperrt');
    aufrufe.updateTag.length = 0;
    expect(await meldungen.eintragSperren({}, formular({ id: m!.id, ziel: 'tr.a1.test.l01.a01', bestaetigt: '1' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const [a] = await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.schluessel, 'tr.a1.test.l01.a01'));
    expect(a!.status).toBe('gesperrt');
    expect(vorher!.status).not.toBe('gesperrt');
    expect(aufrufe.updateTag).toContain('lernapp-kurs-tr');
    // Audit nennt den Schlüssel des gesperrten Eintrags (kein Inhalt)
    const [audit] = (await audits('lernapp.meldung_bearbeitet')).filter((x) => x.zielId === m!.id);
    // Stand und Inhalts-Hash vor der Sperre für „Wieder freigeben“ (L3-06b)
    expect(audit!.details).toEqual({
      aktion: 'gesperrt',
      kategorie: 'fehler_zieltext',
      eintrag: 'tr.a1.test.l01.a01',
      vorher: vorher!.status,
      hash: vorher!.inhaltHash,
    });
  });

  it('Wieder freigeben (L3-06b): nur über Meldungen gesperrte, mit Bestätigung, Stand vorher, sofort wirksam, Audit', async () => {
    await angemeldetAls(BILDUNG);
    const [vorher] = (await audits('lernapp.meldung_bearbeitet')).filter((x) => x.details?.eintrag === 'tr.a1.test.l01.a01');
    const gesperrte = await ladeGesperrte();
    expect(gesperrte.map((g) => [g.schluessel, g.art, g.vorher])).toEqual([['tr.a1.test.l01.a01', 'aufgabe', vorher!.details!.vorher]]);
    // Vom Import gesperrt (nicht über eine Meldung): hier nicht freizugeben
    await db.update(schema.lernappLemma).set({ status: 'gesperrt' }).where(eq(schema.lernappLemma.schluessel, 'tr.a1.test.w002'));
    expect(await meldungen.eintragEntsperren({}, formular({ ziel: 'tr.a1.test.w002', bestaetigt: '1' }))).toEqual({
      fehler: 'nichtGefunden',
    });
    await db
      .update(schema.lernappLemma)
      .set({ status: 'automatisch_geprueft' })
      .where(eq(schema.lernappLemma.schluessel, 'tr.a1.test.w002'));
    // ohne ausdrückliche Bestätigung nichts
    expect(await meldungen.eintragEntsperren({}, formular({ ziel: 'tr.a1.test.l01.a01' }))).toEqual({ fehler: 'bestaetigenFreigabe' });
    aufrufe.updateTag.length = 0;
    expect(await meldungen.eintragEntsperren({}, formular({ ziel: 'tr.a1.test.l01.a01', bestaetigt: '1' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const [a] = await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.schluessel, 'tr.a1.test.l01.a01'));
    expect(a!.status).toBe(vorher!.details!.vorher);
    expect(aufrufe.updateTag).toContain('lernapp-kurs-tr');
    expect((await ladeVorschau('tr-aus-de', 'tr.a1.test.l01'))!.lektion.aufgaben.some((x) => x.schluessel === 'tr.a1.test.l01.a01')).toBe(
      true,
    );
    const [audit] = await audits('lernapp.eintrag_entsperrt');
    expect(audit).toMatchObject({
      zielTyp: 'lernapp_eintrag',
      zielId: 'tr.a1.test.l01.a01',
      details: { art: 'aufgabe', status: a!.status },
    });
    expect(await ladeGesperrte()).toEqual([]);
    expect(await meldungen.eintragEntsperren({}, formular({ ziel: 'tr.a1.test.l01.a01', bestaetigt: '1' }))).toEqual({
      fehler: 'nichtGefunden',
    });
    // für die Vorschau-Prüfung unten wieder gesperrt (wie vorher)
    await db.update(schema.lernappAufgabe).set({ status: 'gesperrt' }).where(eq(schema.lernappAufgabe.schluessel, 'tr.a1.test.l01.a01'));
  });
});

describe('Audio-Studio', () => {
  const PDF = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n');
  /** Synthetische Bytes mit WebM-Kopf (EBML) – kein echtes Audio, der Server prüft nur die Magic Bytes. */
  const webm = (n: number) => Buffer.concat([Buffer.from([0x1a, 0x45, 0xdf, 0xa3]), Buffer.alloc(n, 7)]);
  let sprecherId = '';

  it('Sprecher nur mit Vereinbarung (PDF), B1 und B2 getrennt', async () => {
    await angemeldetAls(ADMIN);
    expect(await audio.sprecherAnlegen({}, formular({ name: '[Sprecherin A]' }))).toMatchObject({ feldFehler: { datei: 'dateiFehlt' } });
    // Prüfung ohne Bildpipeline (lib/medien/typ.ts, kein sharp): Bild → „kein PDF“, Unbekanntes → Typfehler
    const mitDatei = (bytes: Buffer, name: string) => {
      const f = formular({ name: '[Sprecherin A]' });
      f.set('datei', new File([new Uint8Array(bytes)], name));
      return audio.sprecherAnlegen({}, f);
    };
    const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32)]);
    expect(await mitDatei(png, 'bild.png')).toMatchObject({ feldFehler: { datei: 'keinPdf' } });
    expect(await mitDatei(Buffer.from('<svg/>xxxxxxxxxxxx'), 'vereinbarung.pdf')).toMatchObject({ feldFehler: { datei: 'datei_typ' } });
    const fd = formular({ name: '[Sprecherin A]', b1: '1' });
    fd.set('datei', new File([new Uint8Array(PDF)], 'vereinbarung.pdf', { type: 'application/pdf' }));
    expect(await audio.sprecherAnlegen({}, fd)).toMatchObject({ gespeichert: expect.any(Number) });
    const [s] = await db.select().from(schema.lernappSprecher);
    expect(s).toMatchObject({ name: '[Sprecherin A]', kiSyntheseErlaubt: true, klonenErlaubt: false });
    // PDF unverändert, Schlüssel mit Inhalts-Hash wie in der Medien-Pipeline der Website (gleiche Datei = gleiches Medium)
    const [vereinbarung] = await db.select().from(schema.medium).where(eq(schema.medium.id, s!.vereinbarungMediumId!));
    expect(vereinbarung).toMatchObject({
      typ: 'application/pdf',
      groesse: PDF.length,
      schluessel: `${createHash('sha256').update(PDF).digest('hex').slice(0, 16)}/vereinbarung.pdf`,
    });
    sprecherId = s!.id;
  });

  it('Aufnahme: Magic Bytes, Ablage unter Inhalts-Hash, neue ersetzt alte; nie für Religionsbezug', async () => {
    await angemeldetAls(BILDUNG);
    const sende = (eintrag: string, daten: Buffer) => {
      const fd = formular({ eintrag, sprecher: sprecherId, dauerMs: '1200' });
      fd.set('datei', new File([new Uint8Array(daten)], 'aufnahme.webm'));
      return audio.aufnahmeSpeichern({}, fd);
    };
    expect(await sende('tr.a1.test.w001', Buffer.from('keine audiodatei'))).toEqual({ fehler: 'audio_format' });
    expect(await sende('tr.a1.test.w001', webm(100))).toMatchObject({ hinweis: 'neu' });
    expect(await sende('tr.a1.test.w001', webm(100))).toMatchObject({ hinweis: 'unveraendert' });
    expect(await sende('tr.a1.test.w001', webm(200))).toMatchObject({ hinweis: 'ersetzt' });
    const aufnahmen = await db.select().from(schema.lernappAufnahme);
    expect(aufnahmen).toHaveLength(1);
    expect(aufnahmen[0]!.pfad).toMatch(/^lernapp\/aufnahmen\/tr\/[0-9a-f]{16}-[0-9a-f]{16}\.webm$/);
    expect(aufnahmen[0]!.bytes).toBe(204);
    // Religionsbezug: nie vertonbar (KERN 4.0 §4)
    await db.update(schema.lernappSatz).set({ religionsbezug: true }).where(eq(schema.lernappSatz.schluessel, 'tr.a1.test.s0004'));
    expect(await sende('tr.a1.test.s0004', webm(50))).toEqual({ fehler: 'nichtVertonbar' });
    expect(await sende('islam.grund.e01.s0001', webm(50))).toEqual({ fehler: 'nichtGefunden' });
    const studio = await ladeStudio('tr', 'alle', 0);
    expect(studio.eintraege.some((e) => e.schluessel === 'tr.a1.test.s0004')).toBe(false);
    await db.update(schema.lernappSatz).set({ religionsbezug: false }).where(eq(schema.lernappSatz.schluessel, 'tr.a1.test.s0004'));
    // Anhören nur mit Recht
    const ctx = { params: Promise.resolve({ locale: 'de', id: aufnahmen[0]!.id }) } as never;
    const r = await aufnahmeRoute.GET(new Request('https://example.test/'), ctx);
    expect(r.status).toBe(200);
    expect(r.headers.get('content-type')).toBe('audio/webm');
    expect(Buffer.from(await r.arrayBuffer()).length).toBe(204);
    await angemeldetAls(REDAKTION);
    expect((await aufnahmeRoute.GET(new Request('https://example.test/'), ctx)).status).toBe(403);
    const [a] = await audits('lernapp.aufnahme_gespeichert');
    expect(Object.keys(a!.details ?? {}).sort()).toEqual(['ersetzt', 'groesse', 'sprache', 'typ']);
  });

  it('Wahl Sprachausgabe ↔ Mensch je Clip wirkt auf den Paketbau', async () => {
    await angemeldetAls(BILDUNG);
    const [lemma] = await db.select().from(schema.lernappLemma).where(eq(schema.lernappLemma.schluessel, 'tr.a1.test.w001'));
    const hash = textHash(lemma!.lemma);
    const [test] = await db
      .select()
      .from(schema.lernappAudio)
      .where(and(eq(schema.lernappAudio.sprache, 'tr'), eq(schema.lernappAudio.textHash, hash)));
    expect(test).toBeDefined();
    // gebündelte menschliche Aufnahme (wie nach der Audio-Kette)
    await db.insert(schema.lernappAudio).values({ ...test!, id: undefined, stimme: `mensch:${sprecherId}`, sprecherId });
    const stimme = async () => (await ladeBauEingaben('tr-aus-de', 'tr.a1.test'))[0]!.audio.get(hash)!.stimme;
    expect(await stimme()).toBe(`mensch:${sprecherId}`);
    expect(await audio.stimmeWaehlen({}, formular({ eintrag: 'tr.a1.test.w001', wahl: 'sprachausgabe' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    expect(await stimme()).toBe('test:ton');
    expect(aufrufe.updateTag).toContain('lernapp-kurs-tr');
    await audio.stimmeWaehlen({}, formular({ eintrag: 'tr.a1.test.w001', wahl: 'mensch' }));
    expect(await stimme()).toBe(`mensch:${sprecherId}`);
  });

  it('kritisches Audio-Urteil (Aussprache) verbirgt den Clip im Paket sofort; die nächste Stimme greift; Übersicht zählt es', async () => {
    const kritischVorher = (await ladeLernappUebersicht()).befunde.kritisch;
    await mitSprachen(SPRACHE, ['tr']);
    const z = await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.test', art: 'audio' }));
    expect(z.id).toEqual(expect.any(String));
    const [s] = await db.select().from(schema.lernappStichprobe).where(eq(schema.lernappStichprobe.id, z.id!));
    const alle = await kandidaten('tr.a1.test', 'audio');
    const eintrag = s!.auswahl.includes('tr.a1.test.w001') ? 'tr.a1.test.w001' : s!.auswahl[0]!;
    const k = alle.find((x) => x.schluessel === eintrag)!;
    const hash = textHash(k.text);
    const imPaket = async () => (await ladeBauEingaben('tr-aus-de', 'tr.a1.test'))[0]!.audio.get(hash);
    expect((await imPaket())?.stimme).toBe(k.clip!.stimme);
    await angemeldetAls(null);
    const id = (await angemeldetAls(SPRACHE))!;
    await db.insert(schema.lernappPrueferSprache).values({ benutzerId: id, sprache: 'tr', ebene: 'muttersprache' });
    expect(
      await sprache.eintragPruefen({}, formular({ stichprobe: z.id!, eintrag, urteil: 'abgelehnt', kategorie: 'aussprache' })),
    ).toMatchObject({ gespeichert: expect.any(Number) });
    const [p] = await db.select().from(schema.lernappPruefung).where(eq(schema.lernappPruefung.stichprobeId, z.id!));
    expect(p).toMatchObject({ inhaltTyp: 'audio', inhaltId: k.inhaltId, inhaltHash: k.inhaltHash, kategorie: 'aussprache' });
    // Der beurteilte Clip ist verborgen: eine andere Stimme oder „Audio folgt“ (kein Eintrag)
    expect((await imPaket())?.stimme).not.toBe(k.clip!.stimme);
    if (eintrag === 'tr.a1.test.w001') expect((await imPaket())?.stimme).toBe('test:ton');
    expect(aufrufe.updateTag).toContain('lernapp-kurs-tr');
    // Audio-Studio: der beurteilte Clip ist gesperrt und nie die wirksame Stimme (Restmangel L3-06)
    const studio = (await ladeStudio('tr', 'alle', 0)).eintraege.find((e) => e.schluessel === eintrag)!;
    expect(studio.clips.find((c) => c.id === k.inhaltId)?.gesperrt).toBe(true);
    expect(studio.clips.filter((c) => c.id !== k.inhaltId).every((c) => !c.gesperrt)).toBe(true);
    expect(studio.wirksam).not.toBe(k.clip!.stimme);
    expect(studio.wirksam).toBe((await imPaket())?.stimme ?? null);
    // Kandidat bleibt (Stichprobe stabil); die Übersicht zählt den Befund
    expect((await kandidaten('tr.a1.test', 'audio')).find((x) => x.schluessel === eintrag)?.inhaltId).toBe(k.inhaltId);
    expect((await ladeLernappUebersicht()).befunde.kritisch).toBe(kritischVorher + 1);
  });
});

describe('Vorschau, Cockpit und Betriebszähler', () => {
  it('Vorschau baut Entwürfe als Lektion; gesperrte Aufgaben fehlen', async () => {
    await db.update(schema.lernappSatz).set({ status: 'entwurf' }).where(eq(schema.lernappSatz.schluessel, 'de.a1.test.s0002'));
    const v = await ladeVorschau('de-aus-tr', 'de.a1.test.l02');
    expect(v?.lektion.schluessel).toBe('de-aus-tr.a1.test.l02');
    expect(v!.lektion.aufgaben.length).toBeGreaterThan(0);
    const tr = await ladeVorschau('tr-aus-de', 'tr.a1.test.l01');
    expect(tr!.lektion.aufgaben.some((a) => a.schluessel === 'tr.a1.test.l01.a01')).toBe(false);
    expect(await ladeVorschau('tr-aus-de', 'tr.a1.e09.l01')).toBeNull();
    // Baum: Aufgaben je Lektion gezählt (je Lektion mindestens eine im Testkurs)
    const baum = await ladeKursBaum('tr');
    const lektionen = baum.flatMap((a) => a.einheiten.flatMap((e) => e.lektionen));
    expect(lektionen.length).toBeGreaterThan(0);
    for (const l of lektionen) expect(l.aufgaben, l.schluessel).toBeGreaterThan(0);
  });

  it('Cockpit-Karte: Schalter, Blob, Prüfende, Einheiten, Meldungen, Grenzen', async () => {
    await zaehleBetrieb('sync_grenze_jeTag');
    expect(await betriebsSumme('sync_grenze_', 7)).toBe(1);
    const liste: { id: string; status: string; meldung: string }[] = [];
    await lernappPruefen(db as unknown as Datenbank, { FUNKTION_LERNAPP: 'an' }, true, new Date(), (p) => liste.push(p));
    const je = Object.fromEntries(liste.map((p) => [p.id, p]));
    expect(je['lernapp.schalter']!.status).toBe('ok');
    expect(je['lernapp.blob']!.status).toBe('warnung');
    expect(je['lernapp.pruefende-religioes']!.status).toBe('warnung');
    expect(je['lernapp.pruefende-unabhaengig']!.status).toBe('ok');
    expect(je['lernapp.pruefende-sprache']!.status).toBe('ok');
    expect(je['lernapp.einheiten']!.meldung).toMatch(/veröffentlicht/);
    expect(je['lernapp.grenzen']!.status).toBe('hinweis');
    const aus: { id: string; status: string; meldung: string }[] = [];
    await lernappPruefen(db as unknown as Datenbank, { FUNKTION_LERNAPP: 'aus' }, true, new Date(), (p) => aus.push(p));
    expect(aus.map((p) => p.id)).toEqual(['lernapp.schalter']);
    // L3-E12b (Nutzer 21.10.2026): in der Produktion standardmäßig an – kein „bis zur Abnahme“ mehr; abschalten über die
    // Umgebung bringt den Abmelde-Worker (S-L3 N-4)
    expect(aus[0]!.status).toBe('hinweis');
    expect(aus[0]!.meldung).not.toMatch(/Abnahme/);
    expect(aus[0]!.meldung).toContain('L3-E12b');
    expect(aus[0]!.meldung).toContain('Abmelde-Worker');
    const standard: { id: string; status: string; meldung: string }[] = [];
    await lernappPruefen(db as unknown as Datenbank, { SITE_MODE: 'produktion' }, true, new Date(), (p) => standard.push(p));
    // Produktion ohne Angaben: die drei Schalter ohne Personendaten an (IN_PRODUKTION_AN), alle übrigen aus
    expect(standard.find((p) => p.id === 'lernapp.schalter')).toMatchObject({
      status: 'ok',
      meldung:
        'Eingeschaltet: Lern-App, Einheiten vor der Stichprobe (mit Hinweis), Fehlermeldungen. Ausgeschaltet: Sprechübungen, Abgleich, Gruppen.',
    });
  });

  it('Cockpit-Hinweis: religiöse Prüfung zusammen mit Administration oder Lern-App-Redaktion (Unabhängigkeit, ADR 0040)', async () => {
    const pruefen = async () => {
      const liste: { id: string; status: string; meldung: string }[] = [];
      await lernappPruefen(db as unknown as Datenbank, { FUNKTION_LERNAPP: 'an' }, true, new Date(), (p) => liste.push(p));
      return liste.find((p) => p.id === 'lernapp.pruefende-unabhaengig')!;
    };
    /** Zahl der Prüfenden, die zählen (Karte „Religiöse Prüfung (zwei Personen)“). */
    const zaehlende = async () => {
      const liste: { id: string; meldung: string }[] = [];
      await lernappPruefen(db as unknown as Datenbank, { FUNKTION_LERNAPP: 'an' }, true, new Date(), (p) => liste.push(p));
      return Number(/(\d+) Person/.exec(liste.find((p) => p.id === 'lernapp.pruefende-religioes')!.meldung)?.[1]);
    };
    await angemeldetAls([{ rolle: 'religioese_pruefung' }]);
    expect((await pruefen()).status).toBe('ok');
    const vorher = await zaehlende();
    await angemeldetAls([{ rolle: 'religioese_pruefung' }, { rolle: 'administration' }]);
    const einer = await pruefen();
    expect(einer.status).toBe('hinweis');
    expect(einer.meldung).toMatch(/^1 Person mit der Rolle/);
    expect(einer.meldung).toMatch(/zählt nie als religiöse Freigabe/);
    // Stufe C N2: ein Konto mit Administration zählt auch in der Karte der Prüfenden nicht mit – ebenso in der Übersicht
    // der Lern-App („Religiöse Prüfung: n Personen“, Gegenprüfung N2)
    expect(await zaehlende()).toBe(vorher);
    expect((await ladeLernappUebersicht()).pruefende.religioes).toBe(vorher);
    await angemeldetAls([{ rolle: 'religioese_pruefung' }, ...BILDUNG]);
    expect((await pruefen()).meldung).toMatch(/^2 Personen mit der Rolle/);
    // gesperrte Konten zählen nicht
    const gesperrt = (await angemeldetAls([{ rolle: 'religioese_pruefung' }, ...ADMIN]))!;
    await db.update(schema.user).set({ gesperrtAm: new Date() }).where(eq(schema.user.id, gesperrt));
    expect((await pruefen()).meldung).toMatch(/^2 Personen/);
    const zaehlendeNachher = await zaehlende();
    expect((await ladeLernappUebersicht()).pruefende.religioes).toBe(zaehlendeNachher);
    // ein gesperrtes Konto nur mit der Rolle zählt in beiden nicht
    const nurGesperrt = (await angemeldetAls([{ rolle: 'religioese_pruefung' }]))!;
    await db.update(schema.user).set({ gesperrtAm: new Date() }).where(eq(schema.user.id, nurGesperrt));
    expect(await zaehlende()).toBe(zaehlendeNachher);
    expect((await ladeLernappUebersicht()).pruefende.religioes).toBe(zaehlendeNachher);
  });
});

describe('Abfragen in Blöcken und gebündelt (Restmängel L3-06)', () => {
  afterEach(() => {
    BLOECKE.groesse = 10_000;
    vi.restoreAllMocks();
  });

  it('Paketbau und Warteschlange: gleiches Ergebnis mit Blöcken der Größe 1 (Parametergrenze)', async () => {
    const pakete = async () => (await baueRichtung('tr-aus-de', true)).map((r) => r.hash);
    const warte = () => ladeWarteschlange(['de', 'tr', 'ar']);
    const [p1, w1] = [await pakete(), await warte()];
    expect(p1.length).toBeGreaterThan(0);
    BLOECKE.groesse = 1;
    expect(await pakete()).toEqual(p1);
    expect(await warte()).toEqual(w1);
  });

  it('Warteschlange: wenige Abfragen unabhängig von Einheiten × Art × Richtung, gleiche Kandidaten wie je Einheit', async () => {
    const select = vi.spyOn(db, 'select');
    const warte = await ladeWarteschlange(['de', 'tr', 'ar']);
    const abfragen = select.mock.calls.length;
    select.mockRestore();
    expect(warte.length).toBeGreaterThan(6);
    // Einheiten, Stichproben, Zählung, Zieltexte (2), Übersetzungen (2), Clips und Wahlen je Sprache (≤ 6)
    expect(abfragen).toBeLessThanOrEqual(13);
    for (const w of warte)
      expect((await kandidaten(w.einheit, w.art, w.richtung)).length, `${w.einheit} ${w.art} ${w.richtung}`).toBe(w.kandidaten);
  });

  it('Audio-Studio: zwei Abfragen für Texte und Clip-Zahlen, Text-Hash ohne Datenbank', async () => {
    const execute = vi.spyOn(db, 'execute');
    const studio = await ladeStudio('tr', 'alle', 0);
    expect(execute).toHaveBeenCalledTimes(1);
    const sqlText = (execute.mock.calls[0]![0] as unknown as { queryChunks: { value?: string[] }[] }).queryChunks
      .flatMap((c) => c.value ?? [])
      .join('');
    expect(sqlText).toContain('lernapp_lemma');
    expect(sqlText).not.toContain('sha256');
    for (const e of studio.eintraege) {
      const [lemma] = await db
        .select({ text: schema.lernappLemma.lemma })
        .from(schema.lernappLemma)
        .where(eq(schema.lernappLemma.schluessel, e.schluessel));
      const [satz] = await db
        .select({ text: schema.lernappSatz.text })
        .from(schema.lernappSatz)
        .where(eq(schema.lernappSatz.schluessel, e.schluessel));
      expect(e.textHash, e.schluessel).toBe(textHash((lemma ?? satz)!.text));
    }
  });
});

describe('Befunde der Prüfenden und Export der Korrekturen (L3-06b)', () => {
  it('offen nur zum aktuellen Hash, jüngste Prüfung je Person, Kommentar zu ok zählt; Export je Kurs/Einheit ohne Personendaten', async () => {
    const { baueKorrekturExport, EXPORT_FORMAT, ladeBefunde, ladeKorrigiert } = await import('@/server/queries/lernapp/korrekturen');
    const person = (await angemeldetAls(SPRACHE))!;
    const lemma = async (schluessel: string) =>
      (await db.select().from(schema.lernappLemma).where(eq(schema.lernappLemma.schluessel, schluessel)))[0]!;
    const [w1, w3, w4] = [await lemma('de.a1.test.w001'), await lemma('de.a1.test.w003'), await lemma('de.a1.test.w004')];
    const p = schema.lernappPruefung;
    const vor = (min: number) => new Date(Date.now() - min * 60_000);
    await db.insert(p).values([
      // offen: Korrektur zum aktuellen Hash
      {
        inhaltTyp: 'lemma',
        inhaltId: w1.id,
        inhaltHash: w1.inhaltHash,
        art: 'sprache_ziel',
        pruefendeId: person,
        urteil: 'korrektur',
        kategorie: 'natuerlichkeit',
        korrektur: '[Vorschlag]',
        kommentar: '[Kommentar]',
        am: vor(5),
      },
      // erledigt: älterer Stand (anderer Hash)
      {
        inhaltTyp: 'lemma',
        inhaltId: w1.id,
        inhaltHash: 'f'.repeat(64),
        art: 'sprache_ziel',
        pruefendeId: person,
        urteil: 'abgelehnt',
        kategorie: 'bedeutung',
        am: vor(60),
      },
      // aufgehoben: dieselbe Person später „ok“ ohne Kommentar
      {
        inhaltTyp: 'lemma',
        inhaltId: w3.id,
        inhaltHash: w3.inhaltHash,
        art: 'sprache_ziel',
        pruefendeId: person,
        urteil: 'abgelehnt',
        kategorie: 'grammatik',
        am: vor(10),
      },
      {
        inhaltTyp: 'lemma',
        inhaltId: w3.id,
        inhaltHash: w3.inhaltHash,
        art: 'sprache_ziel',
        pruefendeId: person,
        urteil: 'ok',
        am: vor(1),
      },
      // „ok“ mit Kommentar: ein Befund für die Redaktion
      {
        inhaltTyp: 'lemma',
        inhaltId: w4.id,
        inhaltHash: w4.inhaltHash,
        art: 'sprache_ziel',
        pruefendeId: person,
        urteil: 'ok',
        kommentar: '[Hinweis]',
        am: vor(2),
      },
    ]);
    const befunde = (await ladeBefunde({ kurs: 'de' })).filter((b) => b.schluessel.startsWith('de.a1.test.w00'));
    expect(befunde.map((b) => [b.schluessel, b.urteil, b.korrektur, b.kommentar])).toEqual([
      ['de.a1.test.w001', 'korrektur', '[Vorschlag]', '[Kommentar]'],
      ['de.a1.test.w004', 'ok', null, '[Hinweis]'],
    ]);
    expect(befunde[0]).toMatchObject({ kurs: 'de', einheit: 'de.a1.test', sprache: 'de', text: w1.lemma, art: 'sprache_ziel' });
    expect(await ladeBefunde({ kurs: 'tr' })).not.toEqual(expect.arrayContaining([expect.objectContaining({ kurs: 'de' })]));

    // menschliche Korrektur an einer Aufgabe (wie „Fassung ergänzen“)
    const [aufgabe] = await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.schluessel, 'de.a1.test.l01.a01'));
    await db
      .update(schema.lernappAufgabe)
      .set({ menschlichGeprueft: true, verfasstVon: person, daten: { ...aufgabe!.daten, alternativen: ['[Fassung B]'] } })
      .where(eq(schema.lernappAufgabe.id, aufgabe!.id));
    const korrigiert = await ladeKorrigiert({ kurs: 'de' });
    expect(korrigiert).toContainEqual(
      expect.objectContaining({ inhaltTyp: 'aufgabe', schluessel: 'de.a1.test.l01.a01', alternativen: ['[Fassung B]'] }),
    );

    const exp = baueKorrekturExport(await ladeBefunde(), await ladeKorrigiert(), new Date('2026-10-21T12:00:00Z'));
    expect(exp.format).toBe(EXPORT_FORMAT);
    const de = exp.kurse.find((k) => k.kurs === 'de')!.einheiten.find((e) => e.einheit === 'de.a1.test')!;
    expect(de.befunde.find((b) => b.schluessel === 'de.a1.test.w001')).toEqual({
      inhaltTyp: 'lemma',
      art: 'sprache_ziel',
      urteil: 'korrektur',
      kategorie: 'natuerlichkeit',
      korrektur: '[Vorschlag]',
      kommentar: '[Kommentar]',
      am: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      schluessel: 'de.a1.test.w001',
      inhaltHash: w1.inhaltHash,
      sprache: 'de',
      text: w1.lemma,
    });
    expect(de.korrigiert.map((k) => k.schluessel)).toContain('de.a1.test.l01.a01');
    // ohne Personendaten: keine Kennung der Prüfenden oder Verfasser, keine Prüfungs-Kennungen
    const json = JSON.stringify(exp);
    expect(json).not.toContain(person);
    expect(json).not.toMatch(/pruefende|verfasst|benutzer|"id"/);
    // Aufruf für die Inhalts-Pipeline
    expect(readFileSync(join(process.cwd(), 'package.json'), 'utf8')).toContain('"lernapp:export-korrekturen": "tsx');
    expect(readFileSync(join(process.cwd(), 'scripts/lernapp/export-korrekturen.ts'), 'utf8')).toContain(
      'baueKorrekturExport(befunde, korrigiert',
    );
  });
});
