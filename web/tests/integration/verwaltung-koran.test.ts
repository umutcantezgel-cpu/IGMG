import { and, eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { darf } from '@/lib/rechte/matrix';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Verwaltung „Koran & Hadith“ (H-Q03/Q04, ADR 0030): Vier-Augen-Freigabe, Rücksetzen bei jeder Änderung, öffentliche
 * Abfragen liefern nur „geprüft“, Rechte (Redaktion nie, Administration laut Matrix ja), Cache-Tags nach Änderungen an
 * öffentlich Sichtbarem, Ausgaben-Freigabe, kuratierte Listen. Alle Texte und Wortformen sind Platzhalter in eckigen
 * Klammern – keine religiösen Inhalte.
 */
const { client, db } = await verwaltungsUmgebung();
const aktionen = await import('@/server/actions/koran');
const abfragen = await import('@/server/queries/verwaltung/koran');
const quran = await import('@/server/queries/quran');
const hadith = await import('@/server/queries/hadith');
afterAll(() => client.close());

const PRUEFUNG = [{ rolle: 'religioese_pruefung' as const }];
let formA = 0;
let formB = 0;

beforeAll(async () => {
  await db
    .insert(schema.quranQuelle)
    .values({
      id: 'tanzil',
      bezeichnung: '[Quelle]',
      url: 'https://example.test',
      version: 'test',
      sha256: '0'.repeat(64),
      lizenz: '[Lizenz]',
    });
  await db.insert(schema.quranSure).values({ nr: 1, nameAr: '[Sure 1]', verseAnzahl: 2, quelleId: 'tanzil', nameUmschrift: '[Sure Eins]' });
  await db.insert(schema.quranVers).values([
    { sure: 1, vers: 1, textAr: '[a] [b]' },
    { sure: 1, vers: 2, textAr: '[a]' },
  ]);
  const formen = await db
    .insert(schema.quranWortform)
    .values([
      { textAr: '[a]', vorkommen: 2 },
      { textAr: '[b]', vorkommen: 1 },
    ])
    .returning({ id: schema.quranWortform.id, textAr: schema.quranWortform.textAr });
  formA = formen.find((f) => f.textAr === '[a]')!.id;
  formB = formen.find((f) => f.textAr === '[b]')!.id;
  await db.insert(schema.quranWort).values([
    { sure: 1, vers: 1, pos: 1, textAr: '[a]', formId: formA },
    { sure: 1, vers: 1, pos: 2, textAr: '[b]', formId: formB },
    { sure: 1, vers: 2, pos: 1, textAr: '[a]', formId: formA },
  ]);
  await db.insert(schema.tajwidRegel).values({ schluessel: 'ghunnah', familie: 'ghunna', name: { de: 'Ghunna' }, sortierung: 0 });
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
  });
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
  await db.insert(schema.hadith).values(
    ['1', '2', '3'].map((nummer, i) => ({
      sammlungId: 'bukhari',
      nummer,
      sortierung: (i + 1) * 10,
      buchNr: 1,
      textAr: `[Hadith ${nummer}]`,
      textNormalisiert: `[Hadith ${nummer}]`,
    })),
  );
});

const bedeutung = async (sprache: 'de' | 'tr' = 'de') =>
  (
    await db
      .select()
      .from(schema.quranWortbedeutung)
      .where(and(eq(schema.quranWortbedeutung.formId, formA), eq(schema.quranWortbedeutung.sprache, sprache)))
  )[0];
const status = (art: string, kennung: string, ziel: string, grund = '') => formular({ art, kennung, ziel, grund });
const verlauf = async (typ: string) =>
  (await db.select().from(schema.freigabe).where(eq(schema.freigabe.inhaltTyp, typ))).map((f) => f.status);

describe('Rechte (Matrix: Redaktion nie, Administration ja, religiöse Prüfung ja)', () => {
  it('Matrix: religioes.freigeben haben Administration und religioese_pruefung, nicht Redaktion/Bildung/Leitung', () => {
    expect(darf([{ rolle: 'administration' }], 'religioes.freigeben')).toBe(true);
    expect(darf([{ rolle: 'religioese_pruefung' }], 'religioes.freigeben')).toBe(true);
    for (const rolle of ['redaktion', 'bildung', 'leitung', 'organisationsredaktion', 'kinderschutz'] as const)
      expect(darf([{ rolle, organisation: 'at' }], 'religioes.freigeben')).toBe(false);
  });

  it('Redaktion und Bildung: weder erfassen noch freigeben, keine Ausgabe, keine Liste', async () => {
    for (const rolle of ['redaktion', 'bildung', 'leitung'] as const) {
      await angemeldetAls([{ rolle }]);
      expect(await aktionen.bedeutungSpeichern({}, formular({ formId: String(formA), sprache: 'de', bedeutung: '[x]' }))).toEqual({
        fehler: 'keinRecht',
      });
      expect(await aktionen.statusSetzen({}, status('tajwid_regel', 'ghunnah', 'geprueft'))).toEqual({ fehler: 'keinRecht' });
      expect(await aktionen.ausgabeFreigeben({}, formular({ id: 'test-de', bestaetigt: 'on' }))).toEqual({ fehler: 'keinRecht' });
      expect(await aktionen.listeHinzufuegen({}, formular({ liste: 'auswahl', nummer: '1' }))).toEqual({ fehler: 'keinRecht' });
      expect(
        await aktionen.hadithUebersetzungSpeichern(
          {},
          formular({ nummer: '1', sprache: 'de', text: '[x]', uebersetzer: '[x]', quelle: '[x]', lizenz: '[x]' }),
        ),
      ).toEqual({ fehler: 'keinRecht' });
    }
    expect(await db.select().from(schema.quranWortbedeutung)).toEqual([]);
    expect(aufrufe.updateTag).toEqual([]);
  });

  it('ohne zweiten Faktor kein Zugriff, auch nicht für die religiöse Prüfung', async () => {
    await angemeldetAls(PRUEFUNG, false);
    expect(await aktionen.bedeutungSpeichern({}, formular({ formId: String(formA), sprache: 'de', bedeutung: '[x]' }))).toEqual({
      fehler: 'keinRecht',
    });
  });
});

describe('Wortbedeutungen: Vier-Augen-Freigabe und Rücksetzen', () => {
  let hoca = '';
  it('Entwurf: gespeichert, nicht öffentlich, keine Cache-Erneuerung', async () => {
    hoca = (await angemeldetAls(PRUEFUNG))!;
    const z = await aktionen.bedeutungSpeichern(
      {},
      formular({ formId: String(formA), sprache: 'de', bedeutung: '[Bedeutung A]', wurzel: '[W]' }),
    );
    expect(z).toMatchObject({ status: 'entwurf' });
    expect(await bedeutung()).toMatchObject({ freigabe: 'entwurf', verfasstVon: hoca, bedeutung: '[Bedeutung A]' });
    expect(aufrufe.updateTag).toEqual([]);
    expect((await quran.ladeWortDaten(1))!.bedeutungen).toEqual({});
  });

  it('Pflichtfeld und unbekannte Wortform', async () => {
    await angemeldetAls(PRUEFUNG);
    expect(await aktionen.bedeutungSpeichern({}, formular({ formId: String(formA), sprache: 'de', bedeutung: ' ' }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { bedeutung: 'pflicht' },
    });
    expect(await aktionen.bedeutungSpeichern({}, formular({ formId: '999999', sprache: 'de', bedeutung: '[x]' }))).toEqual({
      fehler: 'nichtGefunden',
    });
  });

  it('Einreichen; die verfassende Person darf nicht selbst freigeben (Vier-Augen)', async () => {
    const b = await bedeutung();
    await angemeldetAls(PRUEFUNG); // andere Person darf einreichen (Recht zum Bearbeiten)
    expect(await aktionen.statusSetzen({}, status('quran_wortbedeutung', b.id, 'zur_pruefung'))).toMatchObject({ status: 'zur_pruefung' });
    expect(await abfragen.zaehleOffeneFreigaben(hoca)).toBe(0);
    expect(await abfragen.zaehleOffeneFreigaben('jemand-anders')).toBe(1);
    // Freigeben aus dem Entwurf ist kein erlaubter Schritt; zurück zum Entwurf nur mit Grund
    expect(await aktionen.statusSetzen({}, status('quran_wortbedeutung', b.id, 'entwurf'))).toMatchObject({ fehler: 'grundFehlt' });
  });

  it('Freigabe durch eine zweite Person: öffentlich sichtbar, Tag „quran“ erneuert', async () => {
    const b = await bedeutung();
    const pruefer = (await angemeldetAls(PRUEFUNG))!;
    expect(await aktionen.statusSetzen({}, status('quran_wortbedeutung', b.id, 'geprueft'))).toMatchObject({ status: 'geprueft' });
    expect(await bedeutung()).toMatchObject({ freigabe: 'geprueft', geprueftVon: pruefer, verfasstVon: hoca });
    expect(aufrufe.updateTag).toEqual(['quran']);
    expect((await quran.ladeWortDaten(1))!.bedeutungen[formA]).toEqual({ de: { b: '[Bedeutung A]', wurzel: '[W]' } });
    // Ein zweites Freigeben ist kein Übergang
    expect(await aktionen.statusSetzen({}, status('quran_wortbedeutung', b.id, 'geprueft'))).toEqual({ fehler: 'uebergang' });
  });

  it('Vier-Augen auch beim Zurücksetzen: Wer ändert, verfasst neu und darf danach nicht selbst freigeben', async () => {
    const autor = (await angemeldetAls(PRUEFUNG))!;
    // Speichern ohne Änderung lässt die Freigabe stehen und erneuert nichts
    expect(
      await aktionen.bedeutungSpeichern({}, formular({ formId: String(formA), sprache: 'de', bedeutung: '[Bedeutung A]', wurzel: '[W]' })),
    ).toMatchObject({ status: 'geprueft' });
    expect(aufrufe.updateTag).toEqual([]);
    // Jede Änderung setzt auf „zur Prüfung“ zurück – und das Öffentliche verschwindet sofort
    expect(
      await aktionen.bedeutungSpeichern({}, formular({ formId: String(formA), sprache: 'de', bedeutung: '[Bedeutung A2]', wurzel: '[W]' })),
    ).toMatchObject({ status: 'zur_pruefung' });
    expect(await bedeutung()).toMatchObject({ freigabe: 'zur_pruefung', verfasstVon: autor, geprueftVon: null, geprueftAm: null });
    expect(aufrufe.updateTag).toEqual(['quran']);
    expect((await quran.ladeWortDaten(1))!.bedeutungen).toEqual({});
    const b = await bedeutung();
    expect(await aktionen.statusSetzen({}, status('quran_wortbedeutung', b.id, 'geprueft'))).toEqual({ fehler: 'vierAugen' });
  });

  it('Administration darf laut Matrix freigeben – ebenfalls nur fremde Einträge', async () => {
    const b = await bedeutung();
    await angemeldetAls([{ rolle: 'administration' }]);
    expect(await aktionen.statusSetzen({}, status('quran_wortbedeutung', b.id, 'geprueft'))).toMatchObject({ status: 'geprueft' });
    expect((await quran.ladeWortDaten(1))!.bedeutungen[formA]).toEqual({ de: { b: '[Bedeutung A2]', wurzel: '[W]' } });
  });

  it('Freigabe aufheben mit Grund; Verlauf und Audit vollständig', async () => {
    const b = await bedeutung();
    await angemeldetAls(PRUEFUNG);
    expect(await aktionen.statusSetzen({}, status('quran_wortbedeutung', b.id, 'entwurf', '[Grund der Prüfung]'))).toMatchObject({
      status: 'entwurf',
    });
    expect(aufrufe.updateTag).toEqual(['quran']);
    expect(await verlauf('quran_wortbedeutung')).toEqual(['zur_pruefung', 'geprueft', 'zur_pruefung', 'geprueft', 'entwurf']);
    const audit = (await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielTyp, 'quran_wortbedeutung'))).map(
      (z) => z.aktion,
    );
    expect(audit).toContain('religioes.freigegeben');
    expect(audit).toContain('religioes.zurueckgewiesen');
    expect(JSON.stringify(await db.select().from(schema.auditEintrag))).not.toContain('[Bedeutung');
  });

  it('Bedeutung an einer Stelle: öffentlich nur geprüft, unbekannte Stelle abgelehnt', async () => {
    await angemeldetAls(PRUEFUNG);
    expect(
      await aktionen.ortSpeichern({}, formular({ sure: '1', vers: '2', pos: '1', sprache: 'tr', bedeutung: '[Ort]', einreichen: '1' })),
    ).toMatchObject({
      status: 'zur_pruefung',
    });
    expect(await aktionen.ortSpeichern({}, formular({ sure: '1', vers: '2', pos: '9', sprache: 'tr', bedeutung: '[Ort]' }))).toEqual({
      fehler: 'nichtGefunden',
    });
    expect((await quran.ladeWortDaten(1))!.orte).toEqual({});
    await angemeldetAls(PRUEFUNG);
    expect(await aktionen.statusSetzen({}, status('quran_wortbedeutung_ort', '1|2|1|tr', 'geprueft'))).toMatchObject({
      status: 'geprueft',
    });
    expect((await quran.ladeWortDaten(1))!.orte).toEqual({ '2:1': { tr: '[Ort]' } });
    const detail = await abfragen.ladeWortform(1, formA);
    expect(detail?.orte).toMatchObject([{ sure: 1, vers: 2, pos: 1, status: 'geprueft' }]);
    expect(detail?.stellen).toEqual([
      { vers: 1, pos: 1 },
      { vers: 2, pos: 1 },
    ]);
    expect(detail?.naechste).toBe(formB);
  });

  it('Fortschritt je Sure und Werkstattliste', async () => {
    const { suren } = await abfragen.ladeSurenFortschritt();
    expect(suren).toEqual([expect.objectContaining({ nr: 1, formen: 2, de: 0, tr: 0, offen: 0 })]);
    const liste = await abfragen.ladeSureWoerter(1, 'alle', 1);
    expect(liste?.woerter.map((w) => [w.formId, w.hier, w.vers, w.pos])).toEqual([
      [formA, 2, 1, 1],
      [formB, 1, 1, 2],
    ]);
    expect(liste?.zahlen).toEqual({ alle: 2, fehlt: 2, pruefung: 0 });
  });
});

describe('Tajwid-Regeltexte', () => {
  it('Name und Kurztext erst nach Prüfung öffentlich; bis dahin der Fachbegriff aus dem Import', async () => {
    await angemeldetAls(PRUEFUNG);
    expect(
      await aktionen.tajwidSpeichern(
        {},
        formular({ schluessel: 'ghunnah', nameDe: '[Name geändert]', nameTr: '[Ad]', kurzDe: '', kurzTr: '[nur tr]', einreichen: '1' }),
      ),
    ).toMatchObject({ fehler: 'pruefen', feldFehler: { kurzDe: 'deFehlt' } });
    expect(
      await aktionen.tajwidSpeichern(
        {},
        formular({ schluessel: 'ghunnah', nameDe: '[Name geändert]', nameTr: '[Ad]', kurzDe: '[Kurz]', einreichen: '1' }),
      ),
    ).toMatchObject({ status: 'zur_pruefung' });
    expect(aufrufe.updateTag).toEqual([]);
    const vorher = (await quran.ladeTajwidRegeln()).find((r) => r.schluessel === 'ghunnah');
    expect(vorher).toMatchObject({ name: { de: 'Ghunna' }, kurz: null, erklaerung: null });
    await angemeldetAls(PRUEFUNG);
    expect(await aktionen.statusSetzen({}, status('tajwid_regel', 'ghunnah', 'geprueft'))).toMatchObject({ status: 'geprueft' });
    expect(aufrufe.updateTag).toEqual(['tajwid']);
    const nachher = (await quran.ladeTajwidRegeln()).find((r) => r.schluessel === 'ghunnah');
    expect(nachher).toMatchObject({ name: { de: '[Name geändert]', tr: '[Ad]' }, kurz: { de: '[Kurz]' } });
  });

  it('Erklärung als Rich-Text; Änderung setzt zurück', async () => {
    await angemeldetAls(PRUEFUNG);
    const doc = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: '[Erklärung]' }] }] });
    expect(
      await aktionen.tajwidSpeichern(
        {},
        formular({ schluessel: 'ghunnah', nameDe: '[Name geändert]', nameTr: '[Ad]', kurzDe: '[Kurz]', erklaerungDe: doc }),
      ),
    ).toMatchObject({ status: 'zur_pruefung' });
    expect(aufrufe.updateTag).toEqual(['tajwid']);
    expect((await quran.ladeTajwidRegeln()).find((r) => r.schluessel === 'ghunnah')?.kurz).toBeNull();
  });
});

describe('Hadith: Übersetzungen und kuratierte Listen', () => {
  it('Übersetzung nur zu importierten Hadithen; öffentlich nur geprüft', async () => {
    await angemeldetAls(PRUEFUNG);
    const felder = {
      sprache: 'de',
      text: '[Übersetzung]',
      uebersetzer: '[Übersetzer]',
      quelle: '[eigene Übersetzung]',
      lizenz: '[Rechte]',
    };
    expect(await aktionen.hadithUebersetzungSpeichern({}, formular({ ...felder, nummer: '99' }))).toMatchObject({
      feldFehler: { nummer: 'unbekannt' },
    });
    expect(await aktionen.hadithUebersetzungSpeichern({}, formular({ ...felder, nummer: 'x1' }))).toMatchObject({
      feldFehler: { nummer: 'nummer' },
    });
    expect(await aktionen.hadithUebersetzungSpeichern({}, formular({ ...felder, nummer: '1', einreichen: '1' }))).toMatchObject({
      status: 'zur_pruefung',
    });
    await angemeldetAls(PRUEFUNG);
    expect(await aktionen.listeHinzufuegen({}, formular({ liste: 'auswahl', nummer: '1' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    expect(aufrufe.updateTag).toEqual(['hadith']);
    expect((await hadith.ladeHadithAuswahl()).hadithe[0].uebersetzungen).toEqual([]);
    expect(await aktionen.statusSetzen({}, status('hadith_uebersetzung', 'bukhari|1|de', 'geprueft'))).toMatchObject({
      status: 'geprueft',
    });
    expect((await hadith.ladeHadithAuswahl()).hadithe[0].uebersetzungen).toMatchObject([{ sprache: 'de', text: '[Übersetzung]' }]);
  });

  it('Listen: hinzufügen, doppelt, unbekannt, verschieben, entfernen; „des-tages“ getrennt', async () => {
    await angemeldetAls(PRUEFUNG);
    for (const nummer of ['2', '3']) await aktionen.listeHinzufuegen({}, formular({ liste: 'auswahl', nummer }));
    expect(await aktionen.listeHinzufuegen({}, formular({ liste: 'auswahl', nummer: '2' }))).toMatchObject({
      feldFehler: { nummer: 'vorhanden' },
    });
    expect(await aktionen.listeHinzufuegen({}, formular({ liste: 'auswahl', nummer: '7' }))).toMatchObject({
      feldFehler: { nummer: 'unbekannt' },
    });
    expect(await aktionen.listeHinzufuegen({}, formular({ liste: 'fremd', nummer: '2' }))).toMatchObject({
      feldFehler: { liste: 'ungueltig' },
    });
    await aktionen.listeVerschieben({}, formular({ liste: 'auswahl', nummer: '3', richtung: 'hoch' }));
    expect(await abfragen.listenNummern('auswahl')).toEqual(['1', '3', '2']);
    await aktionen.listeEntfernen({}, formular({ liste: 'auswahl', nummer: '1' }));
    expect(await abfragen.listenNummern('auswahl')).toEqual(['3', '2']);
    expect((await hadith.ladeHadithAuswahl()).hadithe.map((h) => h.nummer)).toEqual(['3', '2']);
    await aktionen.listeHinzufuegen({}, formular({ liste: 'des-tages', nummer: '2' }));
    const listen = await abfragen.ladeHadithListen();
    expect(listen['des-tages'].map((e) => e.nummer)).toEqual(['2']);
    expect(listen.auswahl.map((e) => e.nummer)).toEqual(['3', '2']);
    expect(await verlauf('hadith_auswahl')).toHaveLength(6);
  });
});

describe('Übersetzungsausgaben', () => {
  it('Freigabe nur mit Bestätigung; danach öffentlich; Standard je Sprache; Ausschalten nimmt sie zurück', async () => {
    await angemeldetAls(PRUEFUNG);
    expect(await quran.ladeAusgaben(false)).toEqual([]);
    expect(await aktionen.ausgabeStandard({}, formular({ id: 'test-de' }))).toEqual({ fehler: 'nichtFreigegeben' });
    expect(await aktionen.ausgabeFreigeben({}, formular({ id: 'test-de' }))).toMatchObject({ fehler: 'bestaetigen' });
    expect(await aktionen.ausgabeFreigeben({}, formular({ id: 'gibt-es-nicht', bestaetigt: 'on' }))).toEqual({ fehler: 'nichtGefunden' });
    expect(await aktionen.ausgabeFreigeben({}, formular({ id: 'test-de', bestaetigt: 'on' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    expect(aufrufe.updateTag).toEqual(['quran']);
    expect((await quran.ladeAusgaben(false)).map((a) => [a.id, a.ausstehend, a.standard])).toEqual([['test-de', false, false]]);
    expect(await aktionen.ausgabeStandard({}, formular({ id: 'test-de' }))).toMatchObject({ gespeichert: expect.any(Number) });
    expect((await quran.ladeAusgaben(false))[0].standard).toBe(true);
    const [verwaltet] = await abfragen.ladeAusgabenVerwaltung();
    expect(verwaltet).toMatchObject({ id: 'test-de', aktiv: true, standard: true, freigegebenVon: 'Testperson Eins' });
    expect(await verlauf('quran_ausgabe')).toEqual(['geprueft']);
    expect(await aktionen.ausgabeDeaktivieren({}, formular({ id: 'test-de' }))).toMatchObject({ gespeichert: expect.any(Number) });
    expect(await quran.ladeAusgaben(false)).toEqual([]);
    const [aus] = await db.select().from(schema.quranAusgabe);
    expect(aus).toMatchObject({ aktiv: false, standard: false, freigegebenVon: null, freigegebenAm: null });
  });

  it('Übersicht: Zahlen je Art, veraltete Abrufe (älter als 90 Tage), offene Einträge mit Ziel', async () => {
    const pruefer = (await angemeldetAls(PRUEFUNG))!;
    const u = await abfragen.ladeKoranUebersicht(pruefer, new Date('2026-10-13T00:00:00Z'));
    expect(u.ausgaben).toEqual({ gesamt: 1, freigegeben: 0, veraltet: 1 });
    expect(u.arten.tajwid_regel.zur_pruefung).toBe(1);
    expect(u.offen.find((o) => o.art === 'tajwid_regel')).toMatchObject({ pfad: '/verwaltung/koran/tajwid/ghunnah', eigen: false });
    expect(u.listen).toEqual({ auswahl: 2, 'des-tages': 1 });
  });
});
