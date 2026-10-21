import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { solveChallenge } from 'altcha-lib';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';
import { and, eq, like } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
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
const { ladeBauEingaben } = await import('@/server/queries/lernapp/pakete');
const { ladeWarteschlange } = await import('@/server/queries/lernapp/sprachpruefung');
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
    () => sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.e01', art: 'zieltext' })),
    () => sprache.eintragPruefen({}, formular({ stichprobe: '00000000-0000-0000-0000-000000000000', eintrag: 'x', urteil: 'ok' })),
    () => sprache.pruefsprachenSetzen({}, formular({ benutzerId: 'x' })),
    () => meldungen.meldungErledigen({}, formular({ id: '00000000-0000-0000-0000-000000000000' })),
    () => meldungen.alternativeErgaenzen({}, formular({ id: '00000000-0000-0000-0000-000000000000', alternative: 'x' })),
    () => meldungen.eintragSperren({}, formular({ id: '00000000-0000-0000-0000-000000000000', ziel: 'x' })),
    () => audio.sprecherAnlegen({}, formular({ name: 'Testperson Eins' })),
    () => audio.aufnahmeSpeichern({}, formular({ eintrag: 'tr.a1.e01.w001' })),
    () => audio.aufnahmeVerwerfen({}, formular({ id: '00000000-0000-0000-0000-000000000000' })),
    () => audio.stimmeWaehlen({}, formular({ eintrag: 'tr.a1.e01.w001', wahl: 'mensch' })),
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
    expect(await audio.stimmeWaehlen({}, formular({ eintrag: 'tr.a1.e01.w001', wahl: 'mensch' }))).toEqual({ fehler: 'keinRecht' });
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
    expect(await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.e01', art: 'zieltext' }))).toEqual({ fehler: 'keinRecht' });
    pruefer = await mitSprachen(SPRACHE, ['tr']);
    const warte = await ladeWarteschlange(['tr']);
    expect(warte.find((w) => w.einheit === 'tr.a1.e01' && w.art === 'zieltext')).toMatchObject({ ziehbar: true, letzte: null });
    const z = await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.e01', art: 'zieltext' }));
    expect(z).toMatchObject({ gespeichert: expect.any(Number), id: expect.any(String) });
    stichprobe = z.id!;
    const [s] = await db.select().from(schema.lernappStichprobe).where(eq(schema.lernappStichprobe.id, stichprobe));
    // weniger als 20 Kandidaten: alle; Einlauf, weil noch keine Stichprobe dieser Sprache entschieden ist
    expect(s).toMatchObject({ sprache: 'tr', art: 'zieltext', einlauf: true, entscheidung: 'offen' });
    expect(s!.groesse).toBe(s!.auswahl.length);
    expect(s!.seed).toContain('tr.a1.e01|zieltext|-|');
    expect(await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.e01', art: 'zieltext' }))).toEqual({ fehler: 'offen' });
    const [a] = await audits('lernapp.stichprobe_gezogen');
    expect(a!.details).toMatchObject({ einheit: 'tr.a1.e01', art: 'zieltext', groesse: s!.groesse });
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
    const zeile = (await ladeWarteschlange(['tr'])).find((w) => w.einheit === 'tr.a1.e01' && w.art === 'zieltext');
    expect(zeile?.letzte).toMatchObject({ id: stichprobe, entscheidung: 'bestanden', geprueft: s!.auswahl.length, aktuell: true });
    const [nachher] = await db.select().from(schema.lernappStichprobe).where(eq(schema.lernappStichprobe.id, stichprobe));
    expect(nachher).toMatchObject({ entscheidung: 'bestanden', ergebnis: { geprueft: s!.auswahl.length, kritisch: 0, leicht: 0 } });
    const [einheit] = await db.select().from(schema.lernappEinheit).where(eq(schema.lernappEinheit.schluessel, 'tr.a1.e01'));
    expect(einheit!.status).toBe('veroeffentlicht');
    const saetze = await db.select().from(schema.lernappSatz).where(like(schema.lernappSatz.schluessel, 'tr.a1.e01.%'));
    expect(saetze.every((x) => x.status === 'veroeffentlicht')).toBe(true);
    const aufgaben = await db
      .select({ status: schema.lernappAufgabe.status })
      .from(schema.lernappAufgabe)
      .where(like(schema.lernappAufgabe.schluessel, 'tr.a1.e01.%'));
    expect(aufgaben.every((x) => x.status === 'veroeffentlicht')).toBe(true);
    expect(aufrufe.updateTag).toContain('lernapp-kurs-tr');
    const [a] = await audits('lernapp.stichprobe_entschieden');
    expect(a!.details).toMatchObject({ entscheidung: 'bestanden', kritisch: 0 });
    // Prüfschritte ohne Inhalte im Audit
    for (const x of await audits('lernapp.geprueft'))
      expect(Object.keys(x.details ?? {}).sort()).toEqual(['art', 'inhaltTyp', 'kategorie', 'urteil']);
    // zum selben Stand gibt es keine neue Stichprobe
    expect(await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.e01', art: 'zieltext' }))).toEqual({ fehler: 'schonGezogen' });
    expect(pruefer).not.toBe('');
  });

  it('Übersetzung: kritisches Urteil verbirgt sofort, Entscheidung „nachbessern“, Übersetzungen bleiben unveröffentlicht', async () => {
    await mitSprachen(SPRACHE, ['de']);
    const z = await sprache.stichprobeZiehen({}, formular({ einheit: 'tr.a1.e01', art: 'uebersetzung', richtung: 'tr-aus-de' }));
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
      .where(and(eq(schema.lernappUebersetzung.sprache, 'de'), like(schema.lernappSatz.schluessel, 'tr.a1.e01.%')));
    expect(ue.every((x) => x.status === 'automatisch_geprueft')).toBe(true);
    const u = await ladeLernappUebersicht();
    expect(u.befunde.kritisch).toBeGreaterThanOrEqual(1);
    expect(u.befunde.nachbessern).toBe(1);
    expect(u.quoten.jeSprache.tr).toMatchObject({ bestanden: 1 });
    expect(u.quoten.jeSprache.tr!.geprueft).toBe(u.quoten.jeSprache.tr!.gezogen);
    expect(u.quoten.jeSprache.de).toMatchObject({ offen: 0, nachbessern: 1, geprueft: s!.auswahl.length });
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
      aufgabe: 'tr.a1.e01.l02.a01',
      kategorie: 'antwort_richtig',
      altcha: loesung,
      antwort: 'Das Haus ist sehr groß.',
    });
    expect(r.status).toBe(201);
    expect(r.headers.get('set-cookie')).toBeNull();
    expect(r.headers.get('cache-control')).toContain('no-store');
    const [m] = await db.select().from(schema.lernappMeldung);
    expect(m).toMatchObject({
      aufgabeSchluessel: 'tr-aus-de:tr.a1.e01.l02.a01',
      kategorie: 'antwort_richtig',
      antwort: null,
      status: 'offen',
    });
    // dieselbe Lösung noch einmal
    expect((await sende({ kurs: 'tr-aus-de', aufgabe: 'tr.a1.e01.l02.a01', kategorie: 'sonstiges', altcha: loesung })).status).toBe(400);
    expect(await betriebsSumme('meldung', 1)).toBe(1);
  });

  it('Prüfungen: Ursprung, Schema, fremde Aufgabe, Schalter, Grenze je IP', async () => {
    await angemeldetAls(null);
    expect(
      (
        await sende(
          { kurs: 'tr-aus-de', aufgabe: 'tr.a1.e01.l02.a01', kategorie: 'sonstiges', altcha: 'x' },
          { 'sec-fetch-site': 'cross-site' },
        )
      ).status,
    ).toBe(403);
    expect(
      (await sende({ kurs: 'tr-aus-de', aufgabe: 'tr.a1.e01.l02.a01', kategorie: 'sonstiges', altcha: 'x', email: 'a@example.test' }))
        .status,
    ).toBe(400);
    expect((await sende({ kurs: 'tr-aus-de', aufgabe: 'ar.a1.e01.l02.a01', kategorie: 'sonstiges', altcha: 'x' })).status).toBe(400);
    expect((await sende({ kurs: 'tr-aus-de', aufgabe: 'tr.a1.e09.l01.a01', kategorie: 'sonstiges', altcha: 'x' })).status).toBe(404);
    process.env.FUNKTION_LERNAPP_MELDUNGEN = 'aus';
    expect((await sende({ kurs: 'tr-aus-de', aufgabe: 'tr.a1.e01.l02.a01', kategorie: 'sonstiges', altcha: 'x' })).status).toBe(404);
    delete process.env.FUNKTION_LERNAPP_MELDUNGEN;
    await db.delete(schema.ratenbegrenzung);
    const status: number[] = [];
    for (let i = 0; i < 11; i++)
      status.push((await sende({ kurs: 'tr-aus-de', aufgabe: 'tr.a1.e01.l02.a01', kategorie: 'sonstiges', altcha: 'x' })).status);
    expect(status.slice(0, 10).every((s) => s === 400)).toBe(true);
    expect(status[10]).toBe(429);
  });

  it('angemeldet ab 16: die Antwort bleibt (höchstens 200 Zeichen)', async () => {
    await db.delete(schema.ratenbegrenzung);
    await angemeldetAls(ADMIN);
    const r = await sende({
      kurs: 'tr-aus-de',
      aufgabe: 'tr.a1.e01.l02.a02',
      kategorie: 'antwort_richtig',
      altcha: await altcha(),
      antwort: '[Antwort]',
    });
    expect(r.status).toBe(201);
    const [m] = await db
      .select()
      .from(schema.lernappMeldung)
      .where(eq(schema.lernappMeldung.aufgabeSchluessel, 'tr-aus-de:tr.a1.e01.l02.a02'));
    expect(m!.antwort).toBe('[Antwort]');
  });

  it('Alternative ergänzen: an der Übersetzung (nach Ausgang) bzw. an der Aufgabe (nach Ziel); menschlich geprüft, neuer Hash', async () => {
    await angemeldetAls(BILDUNG);
    const [nachAusgang] = await db
      .select()
      .from(schema.lernappMeldung)
      .where(eq(schema.lernappMeldung.aufgabeSchluessel, 'tr-aus-de:tr.a1.e01.l02.a01'));
    const [satz] = await db.select().from(schema.lernappSatz).where(eq(schema.lernappSatz.schluessel, 'tr.a1.e01.s0002'));
    const [vorher] = await db
      .select()
      .from(schema.lernappUebersetzung)
      .where(and(eq(schema.lernappUebersetzung.satzId, satz!.id), eq(schema.lernappUebersetzung.sprache, 'de')));
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: nachAusgang!.id, alternative: vorher!.text }))).toMatchObject({
      feldFehler: { alternative: 'alternative_doppelt' },
    });
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
      .where(eq(schema.lernappMeldung.aufgabeSchluessel, 'tr-aus-de:tr.a1.e01.l02.a02'));
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: nachZiel!.id, alternative: koranWortfolge() }))).toMatchObject({
      feldFehler: { alternative: 'waechter_wortfolge' },
    });
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: nachZiel!.id, alternative: '[Fassung]' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const [aufgabe] = await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.schluessel, 'tr.a1.e01.l02.a02'));
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
      .values({ aufgabeSchluessel: 'tr-aus-de:tr.a1.e01.l01.a01', kategorie: 'fehler_zieltext' })
      .returning();
    expect(await meldungen.alternativeErgaenzen({}, formular({ id: m!.id, alternative: '[x]' }))).toEqual({ fehler: 'keineAlternative' });
    expect(await meldungen.eintragSperren({}, formular({ id: m!.id, ziel: 'de.a1.e01.w001' }))).toEqual({ fehler: 'nichtGefunden' });
    aufrufe.updateTag.length = 0;
    expect(await meldungen.eintragSperren({}, formular({ id: m!.id, ziel: 'tr.a1.e01.l01.a01' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const [a] = await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.schluessel, 'tr.a1.e01.l01.a01'));
    expect(a!.status).toBe('gesperrt');
    expect(aufrufe.updateTag).toContain('lernapp-kurs-tr');
    const [audit] = (await audits('lernapp.meldung_bearbeitet')).filter((x) => x.zielId === m!.id);
    expect(audit!.details).toEqual({ aktion: 'gesperrt', kategorie: 'fehler_zieltext' });
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
    const fd = formular({ name: '[Sprecherin A]', b1: '1' });
    fd.set('datei', new File([new Uint8Array(PDF)], 'vereinbarung.pdf', { type: 'application/pdf' }));
    expect(await audio.sprecherAnlegen({}, fd)).toMatchObject({ gespeichert: expect.any(Number) });
    const [s] = await db.select().from(schema.lernappSprecher);
    expect(s).toMatchObject({ name: '[Sprecherin A]', kiSyntheseErlaubt: true, klonenErlaubt: false });
    sprecherId = s!.id;
  });

  it('Aufnahme: Magic Bytes, Ablage unter Inhalts-Hash, neue ersetzt alte; nie für Religionsbezug', async () => {
    await angemeldetAls(BILDUNG);
    const sende = (eintrag: string, daten: Buffer) => {
      const fd = formular({ eintrag, sprecher: sprecherId, dauerMs: '1200' });
      fd.set('datei', new File([new Uint8Array(daten)], 'aufnahme.webm'));
      return audio.aufnahmeSpeichern({}, fd);
    };
    expect(await sende('tr.a1.e01.w001', Buffer.from('keine audiodatei'))).toEqual({ fehler: 'audio_format' });
    expect(await sende('tr.a1.e01.w001', webm(100))).toMatchObject({ hinweis: 'neu' });
    expect(await sende('tr.a1.e01.w001', webm(100))).toMatchObject({ hinweis: 'unveraendert' });
    expect(await sende('tr.a1.e01.w001', webm(200))).toMatchObject({ hinweis: 'ersetzt' });
    const aufnahmen = await db.select().from(schema.lernappAufnahme);
    expect(aufnahmen).toHaveLength(1);
    expect(aufnahmen[0]!.pfad).toMatch(/^lernapp\/aufnahmen\/tr\/[0-9a-f]{16}-[0-9a-f]{16}\.webm$/);
    expect(aufnahmen[0]!.bytes).toBe(204);
    // Religionsbezug: nie vertonbar (KERN 4.0 §4)
    await db.update(schema.lernappSatz).set({ religionsbezug: true }).where(eq(schema.lernappSatz.schluessel, 'tr.a1.e01.s0004'));
    expect(await sende('tr.a1.e01.s0004', webm(50))).toEqual({ fehler: 'nichtVertonbar' });
    expect(await sende('islam.grund.e01.s0001', webm(50))).toEqual({ fehler: 'nichtGefunden' });
    const studio = await ladeStudio('tr', 'alle', 0);
    expect(studio.eintraege.some((e) => e.schluessel === 'tr.a1.e01.s0004')).toBe(false);
    await db.update(schema.lernappSatz).set({ religionsbezug: false }).where(eq(schema.lernappSatz.schluessel, 'tr.a1.e01.s0004'));
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
    const [lemma] = await db.select().from(schema.lernappLemma).where(eq(schema.lernappLemma.schluessel, 'tr.a1.e01.w001'));
    const hash = textHash(lemma!.lemma);
    const [test] = await db
      .select()
      .from(schema.lernappAudio)
      .where(and(eq(schema.lernappAudio.sprache, 'tr'), eq(schema.lernappAudio.textHash, hash)));
    expect(test).toBeDefined();
    // gebündelte menschliche Aufnahme (wie nach der Audio-Kette)
    await db.insert(schema.lernappAudio).values({ ...test!, id: undefined, stimme: `mensch:${sprecherId}`, sprecherId });
    const stimme = async () => (await ladeBauEingaben('tr-aus-de', 'tr.a1.e01'))[0]!.audio.get(hash)!.stimme;
    expect(await stimme()).toBe(`mensch:${sprecherId}`);
    expect(await audio.stimmeWaehlen({}, formular({ eintrag: 'tr.a1.e01.w001', wahl: 'sprachausgabe' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    expect(await stimme()).toBe('test:ton');
    expect(aufrufe.updateTag).toContain('lernapp-kurs-tr');
    await audio.stimmeWaehlen({}, formular({ eintrag: 'tr.a1.e01.w001', wahl: 'mensch' }));
    expect(await stimme()).toBe(`mensch:${sprecherId}`);
  });
});

describe('Vorschau, Cockpit und Betriebszähler', () => {
  it('Vorschau baut Entwürfe als Lektion; gesperrte Aufgaben fehlen', async () => {
    await db.update(schema.lernappSatz).set({ status: 'entwurf' }).where(eq(schema.lernappSatz.schluessel, 'de.a1.e01.s0002'));
    const v = await ladeVorschau('de-aus-tr', 'de.a1.e01.l02');
    expect(v?.lektion.schluessel).toBe('de-aus-tr.a1.e01.l02');
    expect(v!.lektion.aufgaben.length).toBeGreaterThan(0);
    const tr = await ladeVorschau('tr-aus-de', 'tr.a1.e01.l01');
    expect(tr!.lektion.aufgaben.some((a) => a.schluessel === 'tr.a1.e01.l01.a01')).toBe(false);
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
    expect(je['lernapp.pruefende-sprache']!.status).toBe('ok');
    expect(je['lernapp.einheiten']!.meldung).toMatch(/veröffentlicht/);
    expect(je['lernapp.grenzen']!.status).toBe('hinweis');
    const aus: { id: string }[] = [];
    await lernappPruefen(db as unknown as Datenbank, { FUNKTION_LERNAPP: 'aus' }, true, new Date(), (p) => aus.push(p));
    expect(aus.map((p) => p.id)).toEqual(['lernapp.schalter']);
  });
});
