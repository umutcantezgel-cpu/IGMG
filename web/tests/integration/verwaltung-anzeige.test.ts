import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Verwaltung › Anzeige (AUFTRAG 3.10, B-25) und „Vers des Tages“ (Kür K-A) gegen PGlite: Rechte (Redaktion pflegt,
 * religiöse Prüfung gibt frei, Leitung nichts), Verweise müssen im Import existieren, Vier-Augen-Freigabe für Vers und
 * Hadith, öffentlich nur Sichtbares und Geprüftes, Änderung des Verweises setzt die Freigabe zurück, Reihenfolge,
 * Löschen, Einstellung, Audit ohne Inhalte, Cache-Tag `anzeige`, Beispielmodus ohne Datenbank. Alle Texte sind
 * Platzhalter in eckigen Klammern – keine religiösen Inhalte.
 */
const { client, db } = await verwaltungsUmgebung();
const aktionen = await import('@/server/actions/anzeige');
const tagesvers = await import('@/server/actions/tagesvers');
const { ladeAnzeige } = await import('@/server/queries/anzeige');
const { ladeFolienListe, zaehleOffeneFolien } = await import('@/server/queries/verwaltung/anzeige');
const { ladeDesTages } = await import('@/server/queries/des-tages');
const route = await import('@/app/api/anzeige/route');
afterAll(() => client.close());

const REDAKTION = [{ rolle: 'redaktion' as const }];
const PRUEFUNG = [{ rolle: 'religioese_pruefung' as const }];
const ADMIN = [{ rolle: 'administration' as const }];

beforeAll(async () => {
  await db.insert(schema.quranQuelle).values({
    id: 'tanzil',
    bezeichnung: '[Quelle]',
    url: 'https://example.test',
    version: 'test',
    sha256: '0'.repeat(64),
    lizenz: '[Lizenz]',
  });
  await db.insert(schema.quranSure).values({ nr: 2, nameAr: '[Sure 2]', verseAnzahl: 3, quelleId: 'tanzil', nameUmschrift: '[Sure Zwei]' });
  await db.insert(schema.quranVers).values([
    { sure: 2, vers: 1, textAr: '[a1]' },
    { sure: 2, vers: 2, textAr: '[a2]' },
    { sure: 2, vers: 3, textAr: '[a3]' },
  ]);
  await db.insert(schema.quranAusgabe).values({
    id: 'test-de',
    sprache: 'de',
    titel: '[Ausgabe]',
    uebersetzer: '[Übersetzer]',
    quelle: '[Quelle]',
    version: '[Version]',
    lizenz: '[Lizenz]',
    url: 'https://example.test',
    sha256: 'a'.repeat(64),
    abgerufenAm: new Date('2026-01-01T00:00:00Z'),
    aktiv: true,
    freigegebenAm: new Date('2026-01-02T00:00:00Z'),
  });
  await db.insert(schema.quranUebersetzung).values([
    { ausgabeId: 'test-de', sure: 2, vers: 1, text: '[Ü1]' },
    { ausgabeId: 'test-de', sure: 2, vers: 2, text: '[Ü2]' },
  ]);
  await db.insert(schema.hadithSammlung).values({
    id: 'bukhari',
    name: { de: '[Sammlung]' },
    quelle: '[Quelle]',
    url: 'https://example.test',
    version: 'test',
    lizenz: '[Lizenz]',
    sha256: '0'.repeat(64),
  });
  await db.insert(schema.hadithBuch).values({ sammlungId: 'bukhari', nr: 1 });
  await db
    .insert(schema.hadith)
    .values({ sammlungId: 'bukhari', nummer: '7', sortierung: 70, buchNr: 1, textAr: '[h7]', textNormalisiert: '[h7]' });
  await db.insert(schema.hadithUebersetzung).values([
    { sammlungId: 'bukhari', nummer: '7', sprache: 'de', text: '[HÜ entwurf]', uebersetzer: '[X]', quelle: '[Q]', lizenz: '[L]' },
    {
      sammlungId: 'bukhari',
      nummer: '7',
      sprache: 'tr',
      text: '[HÜ geprüft]',
      uebersetzer: '[Y]',
      quelle: '[Q]',
      lizenz: '[L]',
      freigabe: 'geprueft',
    },
  ]);
});

const textFolie = (extra: Record<string, string | string[]> = {}) =>
  formular({ art: 'text', titelDe: '[Hinweis]', textDe: '[Text]', wochentage: [], ...extra });

async function anlegen(fd: FormData): Promise<string> {
  const r = await aktionen.legeFolieAn({}, fd).catch((e: { ziel?: string }) => e);
  const ziel = (r as { ziel?: string }).ziel;
  if (!ziel) throw new Error(`keine Weiterleitung: ${JSON.stringify(r)}`);
  return /\/verwaltung\/anzeige\/([0-9a-f-]{36})/.exec(ziel)![1];
}

describe('Folien anlegen und Rechte', () => {
  it('ohne Recht nichts; Leitung und religiöse Prüfung legen keine Folien an', async () => {
    await angemeldetAls(null);
    expect(await aktionen.legeFolieAn({}, textFolie())).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls([{ rolle: 'leitung' }]);
    expect(await aktionen.legeFolieAn({}, textFolie())).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls(PRUEFUNG);
    expect(await aktionen.legeFolieAn({}, textFolie())).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls(REDAKTION, false);
    expect(await aktionen.legeFolieAn({}, textFolie())).toEqual({ fehler: 'keinRecht' });
    expect(await db.select().from(schema.anzeigeFolie)).toHaveLength(0);
  });

  it('Redaktion legt eine Textfolie als Entwurf an; Audit ohne Inhalt; erst sichtbar geschaltet öffentlich', async () => {
    const wer = await angemeldetAls(REDAKTION);
    const id = await anlegen(textFolie({ wochentage: ['5'] }));
    const [z] = await db.select().from(schema.anzeigeFolie).where(eq(schema.anzeigeFolie.id, id));
    expect(z).toMatchObject({ art: 'text', status: 'entwurf', reihenfolge: 1, wochentage: [5], verfasstVon: wer });
    const [audit] = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id));
    expect(audit).toMatchObject({ aktion: 'inhalt.angelegt', zielTyp: 'anzeige_folie', details: { art: 'text' } });
    expect(JSON.stringify(audit.details)).not.toContain('[Hinweis]');
    expect((await ladeAnzeige()).folien).toHaveLength(0);

    await aktionen.setzeFolienStatus(formular({ id, schritt: 'veroeffentlichen' }));
    expect(aufrufe.updateTag).toContain('anzeige');
    const oeffentlich = await ladeAnzeige();
    expect(oeffentlich.folien).toMatchObject([{ id, art: 'text', titel: { de: '[Hinweis]' }, wochentage: [5] }]);
  });

  it('Fehler je Feld; Vers muss im Import stehen; Hadith muss es geben; Bild muss in der Mediathek sein', async () => {
    await angemeldetAls(REDAKTION);
    expect(await aktionen.legeFolieAn({}, formular({ art: 'text', wochentage: [] }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { titelDe: 'pflicht' },
    });
    expect(await aktionen.legeFolieAn({}, formular({ art: 'vers', stelle: '2:3-5', wochentage: [] }))).toMatchObject({
      feldFehler: { stelle: 'versUnbekannt' },
    });
    expect(await aktionen.legeFolieAn({}, formular({ art: 'hadith', nummer: '8', wochentage: [] }))).toMatchObject({
      feldFehler: { nummer: 'hadithUnbekannt' },
    });
    expect(
      await aktionen.legeFolieAn({}, formular({ art: 'bild', bildId: '00000000-0000-4000-8000-000000000000', wochentage: [] })),
    ).toMatchObject({ feldFehler: { bildId: 'bildFehlt' } });
  });
});

describe('Vers- und Hadith-Folien: religiöse Freigabe (Vier-Augen)', () => {
  let vers = '';

  it('Redaktion legt an und reicht ein; öffentlich erst nach Freigabe durch eine zweite Person', async () => {
    await angemeldetAls(REDAKTION);
    vers = await anlegen(formular({ art: 'vers', stelle: '2:1-2', einreichen: '1', wochentage: [] }));
    await aktionen.setzeFolienStatus(formular({ id: vers, schritt: 'veroeffentlichen' }));
    expect((await ladeAnzeige()).folien.map((f) => f.id)).not.toContain(vers);
    // Redaktion darf nicht freigeben
    expect(await aktionen.folienFreigabe({}, formular({ id: vers, ziel: 'geprueft' }))).toEqual({ fehler: 'keinRecht' });

    const pruefer = await angemeldetAls(PRUEFUNG);
    expect(await zaehleOffeneFolien(pruefer!)).toBe(1);
    expect(await aktionen.folienFreigabe({}, formular({ id: vers, ziel: 'geprueft' }))).toMatchObject({ freigabe: 'geprueft' });
    const folie = (await ladeAnzeige()).folien.find((f) => f.id === vers);
    expect(folie).toMatchObject({
      art: 'vers',
      sure: 2,
      sureName: '[Sure Zwei]',
      verse: [
        { nr: 1, textAr: '[a1]' },
        { nr: 2, textAr: '[a2]' },
      ],
    });
    // Übersetzung nur aus der freigegebenen Ausgabe, mit Versnummern bei mehreren Versen
    expect(folie?.art === 'vers' && folie.uebersetzung).toEqual({ de: { text: '(1) [Ü1] (2) [Ü2]', quelle: '[Übersetzer]' } });
    const verlauf = await db.select().from(schema.freigabe).where(eq(schema.freigabe.inhaltId, vers));
    expect(verlauf.map((v) => v.status).sort()).toEqual(['geprueft', 'zur_pruefung']);
  });

  it('wer zuletzt verfasst hat, gibt nicht selbst frei – auch nicht die Administration', async () => {
    const admin = await angemeldetAls(ADMIN);
    const id = await anlegen(formular({ art: 'hadith', nummer: '7', einreichen: '1', wochentage: [] }));
    expect(await aktionen.folienFreigabe({}, formular({ id, ziel: 'geprueft' }))).toEqual({ fehler: 'vierAugen' });
    expect(await zaehleOffeneFolien(admin!)).toBe(0);
    await angemeldetAls(PRUEFUNG);
    expect(await aktionen.folienFreigabe({}, formular({ id, ziel: 'geprueft' }))).toMatchObject({ freigabe: 'geprueft' });
    await angemeldetAls(REDAKTION);
    await aktionen.setzeFolienStatus(formular({ id, schritt: 'veroeffentlichen' }));
    const h = (await ladeAnzeige()).folien.find((f) => f.id === id);
    // Nur die geprüfte Übersetzung (tr) verlässt die Datenbank, nie der Entwurf (de)
    expect(h?.art === 'hadith' && h.uebersetzung).toEqual({ tr: { text: '[HÜ geprüft]', quelle: '[Y]' } });
  });

  it('Zurückweisen nur mit Grund; Änderung des Verweises setzt „geprüft“ zurück, der Zeitplan nicht', async () => {
    await angemeldetAls(REDAKTION);
    // nur Zeitplan: Freigabe bleibt
    expect(
      await aktionen.speichereFolie({}, formular({ id: vers, art: 'vers', stelle: '2:1-2', von: '2026-10-01T08:00', wochentage: ['1'] })),
    ).toMatchObject({ freigabe: 'geprueft' });
    // anderer Vers: zurück zur Prüfung, nicht mehr öffentlich
    expect(await aktionen.speichereFolie({}, formular({ id: vers, art: 'vers', stelle: '2:3', wochentage: [] }))).toMatchObject({
      freigabe: 'zur_pruefung',
    });
    expect((await ladeAnzeige()).folien.map((f) => f.id)).not.toContain(vers);
    await angemeldetAls(PRUEFUNG);
    expect(await aktionen.folienFreigabe({}, formular({ id: vers, ziel: 'entwurf', grund: 'x' }))).toEqual({
      fehler: 'grundFehlt',
      feldFehler: { grund: 'grundFehlt' },
    });
    expect(await aktionen.folienFreigabe({}, formular({ id: vers, ziel: 'entwurf', grund: '[Grund]' }))).toMatchObject({
      freigabe: 'entwurf',
    });
    // Textfolien kennen keine religiöse Freigabe
    const [text] = await db.select().from(schema.anzeigeFolie).where(eq(schema.anzeigeFolie.art, 'text'));
    expect(await aktionen.folienFreigabe({}, formular({ id: text.id, ziel: 'zur_pruefung' }))).toEqual({ fehler: 'keinRecht' });
  });
});

describe('Reihenfolge, Löschen, Einstellung', () => {
  it('verschieben nummeriert lückenlos; löschen entfernt die Folie mit Audit', async () => {
    await angemeldetAls(REDAKTION);
    const vorher = (await ladeFolienListe()).map((f) => f.id);
    await aktionen.verschiebeFolie(formular({ id: vorher[1], richtung: 'hoch' }));
    const nachher = await ladeFolienListe();
    expect(nachher.map((f) => f.id)).toEqual([vorher[1], vorher[0], ...vorher.slice(2)]);
    expect(nachher.map((f) => f.reihenfolge)).toEqual(nachher.map((_, i) => i + 1));
    const weg = await aktionen.loescheFolie(formular({ id: vorher[0] })).catch((e: { ziel?: string }) => e.ziel);
    expect(weg).toBe('/verwaltung/anzeige?geloescht=1');
    expect((await ladeFolienListe()).map((f) => f.id)).not.toContain(vorher[0]);
    const [audit] = await db
      .select()
      .from(schema.auditEintrag)
      .where(and(eq(schema.auditEintrag.zielId, vorher[0]), eq(schema.auditEintrag.aktion, 'inhalt.geloescht')));
    expect(audit).toBeDefined();
  });

  it('Einstellung: Iqama je Gebet (leer = ausgeblendet), Fehler je Feld, öffentlich über den Tag „anzeige“', async () => {
    await angemeldetAls(PRUEFUNG);
    expect(await aktionen.speichereAnzeigeEinstellung({}, formular({}))).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls(REDAKTION);
    const felder = {
      iqama_imsak: '',
      iqama_ogle: '10',
      iqama_ikindi: '',
      iqama_aksam: '5',
      iqama_yatsi: '',
      ruheNachIqamaMin: '15',
      ruheOhneIqamaMin: '20',
      freitagAktiv: 'on',
      freitagVorMin: '45',
      freitagNachMin: '60',
      folienDauerSek: '12',
    };
    expect(await aktionen.speichereAnzeigeEinstellung({}, formular({ ...felder, ruheNachIqamaMin: '99' }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { ruheNachIqamaMin: 'bereich' },
    });
    expect(await aktionen.speichereAnzeigeEinstellung({}, formular(felder))).toMatchObject({ gespeichert: expect.any(Number) });
    expect(aufrufe.updateTag).toContain('anzeige');
    expect((await ladeAnzeige()).einstellung).toMatchObject({ iqama: { ogle: 10, aksam: 5 }, freitag: { aktiv: true } });
    const antwort = await route.GET();
    expect(await antwort.json()).toMatchObject({ einstellung: { iqama: { ogle: 10 } }, folien: expect.any(Array) });
  });

  it('Beispielmodus ohne Datenbank: leere Folien und Standard, nie ein Absturz', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('BAU_PGLITE', '');
    try {
      expect(await ladeAnzeige()).toEqual({
        folien: [],
        einstellung: {
          iqama: {},
          ruheNachIqamaMin: 15,
          ruheOhneIqamaMin: 20,
          freitag: { aktiv: true, vorMin: 45, nachMin: 60 },
          folienDauerSek: 12,
        },
        // Kennung der Gebetszeiten (ADR 0048): die Anzeige lädt neu, sobald sie sich ändert
        gebetszeitenStand: expect.stringMatching(/^[0-9a-f]{16}$/),
      });
      expect(await ladeDesTages('2026-10-13')).toEqual({ vers: null, hadith: null });
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

describe('Vers des Tages (K-A)', () => {
  it('nur wer Verse bearbeiten und religiös freigeben darf; nur importierte Verse; Startseite zeigt sie nach Datum', async () => {
    expect(await ladeDesTages('2026-10-13')).toEqual({ vers: null, hadith: null });
    await angemeldetAls(REDAKTION);
    expect(await tagesvers.versHinzufuegen({}, formular({ liste: 'des-tages', stelle: '2:1' }))).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls(ADMIN);
    expect(await tagesvers.versHinzufuegen({}, formular({ liste: 'des-tages', stelle: '2:9' }))).toMatchObject({
      feldFehler: { stelle: 'versUnbekannt' },
    });
    expect(await tagesvers.versHinzufuegen({}, formular({ liste: 'des-tages', stelle: '2:1-2' }))).toMatchObject({
      feldFehler: { stelle: 'stelle' },
    });
    expect(await tagesvers.versHinzufuegen({}, formular({ liste: 'des-tages', stelle: '2:1' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    expect(await tagesvers.versHinzufuegen({}, formular({ liste: 'des-tages', stelle: '2:1' }))).toMatchObject({
      feldFehler: { stelle: 'versVorhanden' },
    });
    expect(aufrufe.updateTag).toContain('quran');
    const d = await ladeDesTages('2026-10-13');
    expect(d.vers).toMatchObject({ sure: 2, verse: [{ nr: 1, textAr: '[a1]' }], uebersetzung: { de: { text: '[Ü1]' } } });
    expect(d.hadith).toBeNull();
    // Hadith des Tages kommt aus der Liste der Hadith-Verwaltung
    await db.insert(schema.hadithAuswahl).values({ liste: 'des-tages', sammlungId: 'bukhari', nummer: '7', reihenfolge: 1 });
    expect((await ladeDesTages('2026-10-13')).hadith).toMatchObject({ nummer: '7', uebersetzung: { tr: { text: '[HÜ geprüft]' } } });
    expect((await ladeDesTages('2026-10-13')).hadith?.uebersetzung.de).toBeUndefined();

    await tagesvers.versHinzufuegen({}, formular({ liste: 'des-tages', stelle: '2:2' }));
    expect(await tagesvers.versVerschieben({}, formular({ liste: 'des-tages', stelle: '2:2', richtung: 'hoch' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const liste = await db.select().from(schema.quranVersAuswahl).orderBy(schema.quranVersAuswahl.reihenfolge);
    expect(liste.map((z) => `${z.sure}:${z.vers}`)).toEqual(['2:2', '2:1']);
    const tage = new Set([(await ladeDesTages('2026-10-13')).vers?.verse[0].nr, (await ladeDesTages('2026-10-14')).vers?.verse[0].nr]);
    expect(tage).toEqual(new Set([1, 2]));
    expect(await tagesvers.versEntfernen({}, formular({ liste: 'des-tages', stelle: '2:2' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const verlauf = await db.select().from(schema.freigabe).where(eq(schema.freigabe.inhaltTyp, 'quran_vers_auswahl'));
    expect(verlauf.map((v) => v.kommentar)).toEqual(expect.arrayContaining(['hinzugefuegt 2:1', 'nach_oben 2:2', 'entfernt 2:2']));
  });
});
