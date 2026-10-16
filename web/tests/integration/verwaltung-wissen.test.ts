import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { and, asc, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import * as schemaModul from '@/lib/db/schema';
import { BESTAND_VERMERK } from '@/lib/validierung/wissen';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Verwaltung „Islamisches Wissen“ (F-40, Plan §3.7 und §5, ADR 0030): Anlegen, Bearbeiten, Übersetzungen, Reihenfolge,
 * Revisionen, Papierkorb und endgültiges Löschen; religiöse Freigabe über die Warteschlange „Freigaben“ mit
 * Vier-Augen-Prinzip; jede inhaltliche Änderung setzt zurück; öffentlich nur „geprüft“ (Übersicht, Themenseite, Suche).
 * Der Bestand bleibt öffentlich (Migration 0015, Seed). Alle Texte sind neutrale Testtexte – keine religiösen Inhalte.
 */
const { client, db } = await verwaltungsUmgebung();
const aktionen = await import('@/server/actions/wissen');
const { entscheideFreigabe } = await import('@/server/actions/freigaben');
const oeffentlich = await import('@/server/queries/wissen');
const { suche } = await import('@/server/queries/suche');
const { ladeWarteschlange, ladeVerlauf } = await import('@/server/queries/verwaltung/freigaben');
const { ladeWissensListe, ladeWissensPruefVerlauf } = await import('@/server/queries/verwaltung/wissen');
const { religioeseFreigabeLage } = await import('@/lib/startklar/gemeinde');
const { loescheAbgelaufene } = await import('@/lib/eingaenge/loeschlauf');
afterAll(() => client.close());

const REDAKTION = [{ rolle: 'redaktion' as const }];
const PRUEFUNG = [{ rolle: 'religioese_pruefung' as const }];
const absatz = (text: string) => JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });

/** Fängt Weiterleitungen ab: `{ ziel }` oder `{ wert }`. */
async function ergebnis(aufruf: Promise<unknown>): Promise<{ ziel?: string; wert?: unknown }> {
  try {
    return { wert: await aufruf };
  } catch (e) {
    const ziel = (e as { ziel?: string }).ziel;
    if (ziel) return { ziel };
    throw e;
  }
}

/** Neues Thema über die Action; liefert die ID aus der Weiterleitung. */
async function anlegen(werte: Record<string, string>): Promise<string> {
  const r = await ergebnis(aktionen.speichereWissensThema({}, formular({ sichtbar: 'ja', ...werte })));
  const id = /\/verwaltung\/wissen\/([0-9a-f-]{36})\?angelegt=1$/.exec(r.ziel ?? '')?.[1];
  if (!id) throw new Error(`Anlegen ohne Weiterleitung: ${JSON.stringify(r)}`);
  return id;
}
const thema = async (id: string) => (await db.select().from(schema.wissenThema).where(eq(schema.wissenThema.id, id)))[0];
const freigeben = (id: string, entscheidung = 'freigeben', kommentar = '') =>
  ergebnis(entscheideFreigabe({}, formular({ inhaltTyp: 'wissen_thema', inhaltId: id, entscheidung, kommentar })));
const sichtbareSlugs = async () => (await oeffentlich.ladeWissensThemen()).map((t) => t.slug);
const revisionen = (id: string) =>
  db
    .select()
    .from(schema.revision)
    .where(and(eq(schema.revision.inhaltTyp, 'wissen_thema'), eq(schema.revision.inhaltId, id)))
    .orderBy(asc(schema.revision.erstelltAm));

describe('Bestand bleibt öffentlich (nichts verschwindet)', () => {
  it('Migration 0015 setzt veröffentlichte Themen auf „geprüft“ mit Vermerk; Entwürfe bleiben Entwurf', async () => {
    const ordner = join(import.meta.dirname, '../../drizzle/migrations');
    const kopie = mkdtempSync(join(tmpdir(), 'igmg-mig-'));
    try {
      cpSync(ordner, kopie, { recursive: true });
      const journal = JSON.parse(readFileSync(join(kopie, 'meta/_journal.json'), 'utf8')) as { entries: { tag: string }[] };
      journal.entries = journal.entries.filter((e) => e.tag < '0015');
      writeFileSync(join(kopie, 'meta/_journal.json'), JSON.stringify(journal));
      const alt = new PGlite();
      const altDb = drizzle(alt, { schema: schemaModul, casing: 'snake_case' });
      try {
        await migrate(altDb, { migrationsFolder: kopie });
        // Stand vor F-40: ohne Freigabespalten
        await altDb.execute(sql`insert into wissen_thema (slug, kategorie, titel, status) values
          ('bestand-test', 'thema', '{"de":"Testthema Bestand"}', 'veroeffentlicht'),
          ('entwurf-test', 'thema', '{"de":"Testthema Entwurf"}', 'entwurf')`);
        await migrate(altDb, { migrationsFolder: ordner });
        const zeilen = await altDb
          .select({ slug: schema.wissenThema.slug, freigabe: schema.wissenThema.freigabe, geprueftVon: schema.wissenThema.geprueftVon })
          .from(schema.wissenThema)
          .orderBy(asc(schema.wissenThema.slug));
        expect(zeilen).toEqual([
          { slug: 'bestand-test', freigabe: 'geprueft', geprueftVon: null },
          { slug: 'entwurf-test', freigabe: 'entwurf', geprueftVon: null },
        ]);
        const vermerk = await altDb.select().from(schema.freigabe).where(eq(schema.freigabe.inhaltTyp, 'wissen_thema'));
        expect(vermerk).toHaveLength(1);
        expect(vermerk[0]).toMatchObject({ art: 'religioes', status: 'geprueft', von: null, kommentar: BESTAND_VERMERK });
      } finally {
        await alt.close();
      }
    } finally {
      rmSync(kopie, { recursive: true, force: true });
    }
  });

  it('Seed „wissen“: alle zwölf Themen öffentlich, als Bestand gekennzeichnet', async () => {
    const { seed } = await import('../../drizzle/seeds/bereiche/wissen');
    await seed(db as never);
    expect(await sichtbareSlugs()).toHaveLength(12);
    const liste = await ladeWissensListe();
    expect(liste.filter((z) => z.bestand && z.oeffentlich)).toHaveLength(12);
    const vermerke = await db
      .select()
      .from(schema.freigabe)
      .where(and(eq(schema.freigabe.inhaltTyp, 'wissen_thema'), eq(schema.freigabe.kommentar, BESTAND_VERMERK)));
    expect(vermerke).toHaveLength(12);
    // Bestand ohne Einzelprüfung steht nicht in der Warteschlange
    expect((await ladeWarteschlange()).filter((e) => e.inhaltTyp === 'wissen_thema')).toEqual([]);
  });
});

describe('Anlegen, Freigabe, öffentlich nur „geprüft“', () => {
  let id = '';

  it('Redaktion legt an: Entwurf, nicht öffentlich, Revision und Audit', async () => {
    const autor = await angemeldetAls(REDAKTION);
    id = await anlegen({
      slug: 'testthema',
      titelDe: 'Testthema',
      titelEn: 'Test topic',
      kurztextDe: 'Kurzer Testtext',
      inhaltDe: absatz('Testabsatz'),
    });
    expect(await thema(id)).toMatchObject({
      freigabe: 'entwurf',
      status: 'veroeffentlicht',
      verfasstVon: autor,
      titel: { de: 'Testthema', en: 'Test topic' },
      klartext: { de: 'Testthema\nKurzer Testtext\nTestabsatz', en: 'Test topic' },
    });
    expect(await sichtbareSlugs()).not.toContain('testthema');
    expect(await oeffentlich.ladeWissensThema('testthema')).toBeNull();
    expect(await revisionen(id)).toHaveLength(1);
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id));
    expect(audit.map((a) => a.aktion)).toEqual(['inhalt.angelegt']);
    // Neues, nicht öffentliches Thema: kein Cache betroffen
    expect(aufrufe.updateTag).toEqual([]);
  });

  it('Adresse doppelt oder ungültig: Feldfehler, nichts angelegt', async () => {
    await angemeldetAls(REDAKTION);
    const vorher = (await ladeWissensListe()).length;
    const doppelt = await aktionen.speichereWissensThema({}, formular({ slug: 'testthema', titelDe: 'Testthema zwei' }));
    expect(doppelt).toMatchObject({ fehler: 'pruefen', feldFehler: { slug: 'slugVergeben' } });
    const falsch = await aktionen.speichereWissensThema({}, formular({ slug: 'Test Thema', titelDe: '' }));
    expect(falsch).toMatchObject({ fehler: 'pruefen', feldFehler: { slug: 'slug', titelDe: 'pflicht' } });
    expect((await ladeWissensListe()).length).toBe(vorher);
  });

  it('zur Prüfung geben: Verlauf, Warteschlange mit allen Sprachen, weiter nicht öffentlich', async () => {
    const autor = await angemeldetAls(REDAKTION);
    const r = await aktionen.speichereWissensThema(
      {},
      formular({
        id,
        titelDe: 'Testthema',
        titelEn: 'Test topic',
        kurztextDe: 'Kurzer Testtext',
        inhaltDe: absatz('Testabsatz'),
        sichtbar: 'ja',
        einreichen: 'ja',
      }),
    );
    expect(r).toMatchObject({ gespeichert: expect.any(Number), freigabe: 'zur_pruefung' });
    expect((await thema(id)).freigabe).toBe('zur_pruefung');
    expect((await ladeWissensPruefVerlauf(id))[0]).toMatchObject({ status: 'zur_pruefung', von: 'Testperson Eins' });
    const eintrag = (await ladeWarteschlange()).find((e) => e.inhaltId === id);
    expect(eintrag).toMatchObject({ inhaltTyp: 'wissen_thema', art: 'religioes', titel: 'Testthema', eingereichtVon: 'Testperson Eins' });
    expect(eintrag?.angaben).toEqual(
      expect.arrayContaining([
        { label: 'adresse', wert: '/islamisches-wissen/testthema' },
        { label: 'titel_en', wert: 'Test topic', lang: 'en' },
        { label: 'kurztext_de', wert: 'Kurzer Testtext', lang: 'de' },
      ]),
    );
    expect(eintrag?.text).toMatchObject({ type: 'doc' });
    expect(await sichtbareSlugs()).not.toContain('testthema');
    // Cockpit: offene religiöse Freigabe gezählt
    expect((await religioeseFreigabeLage(db as never, new Date())).offen).toBeGreaterThanOrEqual(1);
    expect(autor).toBeTruthy();
  });

  it('Redaktion darf nicht freigeben; die religiöse Prüfung gibt frei → öffentlich (Übersicht, Themenseite, Suche)', async () => {
    await angemeldetAls(REDAKTION);
    expect(await freigeben(id)).toEqual({ wert: { fehler: 'nurReligioesePruefung' } });
    const pruefer = await angemeldetAls(PRUEFUNG);
    expect(await freigeben(id)).toEqual({ ziel: '/verwaltung/freigaben?erledigt=freigeben' });
    expect(await thema(id)).toMatchObject({ freigabe: 'geprueft', geprueftVon: pruefer });
    expect(aufrufe.updateTag).toContain('wissen');
    expect(await sichtbareSlugs()).toContain('testthema');
    expect(await oeffentlich.ladeWissensThema('testthema')).toMatchObject({ slug: 'testthema', kurztext: { de: 'Kurzer Testtext' } });
    expect(await oeffentlich.ladeWissensSlugs()).toContain('testthema');
    expect((await suche('Testabsatz', 'de')).map((t) => t.slug)).toContain('testthema');
    expect((await ladeVerlauf()).find((v) => v.inhaltId === id)).toMatchObject({ titel: 'Testthema', status: 'geprueft' });
    expect((await ladeWissensListe()).find((z) => z.id === id)).toMatchObject({ bestand: false, oeffentlich: true });
  });

  it('unverändert gespeichert: bleibt geprüft, keine neue Fassung', async () => {
    await angemeldetAls(REDAKTION);
    const vorher = (await revisionen(id)).length;
    const r = await aktionen.speichereWissensThema(
      {},
      formular({
        id,
        titelDe: 'Testthema',
        titelEn: 'Test topic',
        kurztextDe: 'Kurzer Testtext',
        inhaltDe: absatz('Testabsatz'),
        sichtbar: 'ja',
      }),
    );
    expect(r).toMatchObject({ freigabe: 'geprueft' });
    expect((await revisionen(id)).length).toBe(vorher);
    expect(aufrufe.updateTag).toEqual([]);
    expect(await sichtbareSlugs()).toContain('testthema');
  });

  it('ausblenden ist keine inhaltliche Änderung: bleibt geprüft, nicht mehr öffentlich; wieder einblenden', async () => {
    await angemeldetAls(REDAKTION);
    const felder = { id, titelDe: 'Testthema', titelEn: 'Test topic', kurztextDe: 'Kurzer Testtext', inhaltDe: absatz('Testabsatz') };
    expect(await aktionen.speichereWissensThema({}, formular(felder))).toMatchObject({ freigabe: 'geprueft' });
    expect(await thema(id)).toMatchObject({ freigabe: 'geprueft', status: 'entwurf' });
    expect(aufrufe.updateTag).toContain('wissen');
    expect(await sichtbareSlugs()).not.toContain('testthema');
    await angemeldetAls(REDAKTION);
    expect(await aktionen.speichereWissensThema({}, formular({ ...felder, sichtbar: 'ja' }))).toMatchObject({ freigabe: 'geprueft' });
    expect(await sichtbareSlugs()).toContain('testthema');
  });

  it('jede inhaltliche Änderung setzt auf „zur Prüfung“ zurück: sofort nicht mehr öffentlich', async () => {
    const autor = await angemeldetAls(REDAKTION);
    const r = await aktionen.speichereWissensThema(
      {},
      formular({
        id,
        titelDe: 'Testthema',
        titelTr: 'Test konusu',
        titelEn: 'Test topic',
        kurztextDe: 'Kurzer Testtext',
        inhaltDe: absatz('Testabsatz'),
        sichtbar: 'ja',
      }),
    );
    expect(r).toMatchObject({ freigabe: 'zur_pruefung' });
    expect(await thema(id)).toMatchObject({ freigabe: 'zur_pruefung', verfasstVon: autor, geprueftVon: null, geprueftAm: null });
    expect(aufrufe.updateTag).toContain('wissen');
    expect(await sichtbareSlugs()).not.toContain('testthema');
    expect((await suche('Testabsatz', 'de')).map((t) => t.slug)).not.toContain('testthema');
    expect((await ladeWissensListe()).find((z) => z.id === id)?.uebersetzung).toEqual({ gesamt: 3, tr: 1, en: 1 });
  });

  it('Zurückweisen mit Kommentar: Entwurf, Kommentar im Prüfverlauf', async () => {
    await angemeldetAls(PRUEFUNG);
    expect(await freigeben(id, 'zurueckweisen')).toMatchObject({ wert: { fehler: 'pruefen' } });
    expect(await freigeben(id, 'zurueckweisen', 'Bitte Testtext prüfen')).toEqual({ ziel: '/verwaltung/freigaben?erledigt=zurueckweisen' });
    expect((await thema(id)).freigabe).toBe('entwurf');
    expect((await ladeWissensPruefVerlauf(id))[0]).toMatchObject({ status: 'entwurf', kommentar: 'Bitte Testtext prüfen' });
  });

  it('frühere Fassung zurückholen: Inhalt zurück, Revision mit Vermerk; geprüft → zur Prüfung', async () => {
    // Erst wieder freigeben lassen (Redaktion reicht ein, Prüfung gibt frei)
    await angemeldetAls(REDAKTION);
    await aktionen.speichereWissensThema(
      {},
      formular({
        id,
        titelDe: 'Testthema',
        titelTr: 'Test konusu',
        titelEn: 'Test topic',
        kurztextDe: 'Kurzer Testtext',
        inhaltDe: absatz('Testabsatz'),
        sichtbar: 'ja',
        einreichen: 'ja',
      }),
    );
    await angemeldetAls(PRUEFUNG);
    await freigeben(id);
    expect((await thema(id)).freigabe).toBe('geprueft');
    const erste = (await revisionen(id))[0];
    const wer = await angemeldetAls(REDAKTION);
    const r = await ergebnis(aktionen.wissensRevisionWiederherstellen(formular({ revisionId: erste.id })));
    expect(r.ziel).toBe(`/verwaltung/wissen/${id}?wiederhergestellt=1`);
    expect(await thema(id)).toMatchObject({ freigabe: 'zur_pruefung', verfasstVon: wer, titel: { de: 'Testthema', en: 'Test topic' } });
    expect((await thema(id)).titel.tr).toBeUndefined();
    expect((await revisionen(id)).some((v) => v.kommentar === 'wiederhergestellt')).toBe(true);
    expect(await sichtbareSlugs()).not.toContain('testthema');
  });
});

describe('Vier-Augen-Prinzip (seit N4 auch in der Warteschlange)', () => {
  it('wer verfasst hat, gibt nicht selbst frei; eine zweite Person schon', async () => {
    const imam = await angemeldetAls(PRUEFUNG);
    const id = await anlegen({ slug: 'testthema-vier-augen', titelDe: 'Testthema Vier Augen', einreichen: 'ja' });
    expect(await thema(id)).toMatchObject({ freigabe: 'zur_pruefung', verfasstVon: imam });
    expect(await freigeben(id)).toEqual({ wert: { fehler: 'vierAugen' } });
    expect((await thema(id)).freigabe).toBe('zur_pruefung');
    const zweite = await angemeldetAls(PRUEFUNG);
    expect(await freigeben(id)).toEqual({ ziel: '/verwaltung/freigaben?erledigt=freigeben' });
    expect(await thema(id)).toMatchObject({ freigabe: 'geprueft', geprueftVon: zweite });
    expect(await sichtbareSlugs()).toContain('testthema-vier-augen');
  });
});

describe('Reihenfolge, Papierkorb, endgültig löschen', () => {
  it('Reihenfolge speichern: öffentlich in neuer Reihenfolge; unvollständig → veraltet; ungültig → pruefen', async () => {
    await angemeldetAls(REDAKTION);
    const ids = (await ladeWissensListe()).map((z) => z.id);
    const umgekehrt = [...ids].reverse();
    expect(await aktionen.speichereWissensReihenfolge({}, formular({ ordnung: JSON.stringify(umgekehrt) }))).toEqual({
      gespeichert: expect.any(Number),
    });
    expect((await ladeWissensListe()).map((z) => z.id)).toEqual(umgekehrt);
    expect(aufrufe.updateTag).toContain('wissen');
    // Dieselbe Reihenfolge noch einmal: gespeichert, aber kein Verfall des Caches und kein Audit-Eintrag
    aufrufe.updateTag.length = 0;
    const auditVorher = (await db.select().from(schema.auditEintrag)).length;
    expect(await aktionen.speichereWissensReihenfolge({}, formular({ ordnung: JSON.stringify(umgekehrt) }))).toEqual({
      gespeichert: expect.any(Number),
    });
    expect(aufrufe.updateTag).toEqual([]);
    expect(await db.select().from(schema.auditEintrag)).toHaveLength(auditVorher);
    const slugs = await sichtbareSlugs();
    expect(slugs[0]).toBe('testthema-vier-augen');
    // Reihenfolge ist keine inhaltliche Änderung: Freigaben bleiben
    expect((await ladeWissensListe()).filter((z) => z.freigabe === 'geprueft').length).toBeGreaterThanOrEqual(13);
    expect(await aktionen.speichereWissensReihenfolge({}, formular({ ordnung: JSON.stringify(ids.slice(1)) }))).toEqual({
      fehler: 'veraltet',
    });
    expect(await aktionen.speichereWissensReihenfolge({}, formular({ ordnung: '[1,2]' }))).toEqual({ fehler: 'pruefen' });
    expect(await aktionen.speichereWissensReihenfolge({}, formular({ ordnung: JSON.stringify([ids[0], ids[0]]) }))).toEqual({
      fehler: 'pruefen',
    });
  });

  it('Papierkorb: sofort nicht öffentlich; wiederherstellen; endgültig löschen nur aus dem Papierkorb', async () => {
    await angemeldetAls(REDAKTION);
    const [z] = await db.select().from(schema.wissenThema).where(eq(schema.wissenThema.slug, 'testthema-vier-augen'));
    // Nicht im Papierkorb: endgültig löschen verboten
    await expect(aktionen.wissensThemaEndgueltigLoeschen(formular({ id: z.id }))).rejects.toThrow('KEIN_RECHT');
    await aktionen.wissensThemaInPapierkorb(formular({ id: z.id }));
    expect(await sichtbareSlugs()).not.toContain('testthema-vier-augen');
    expect((await ladeWissensListe(true)).map((x) => x.id)).toEqual([z.id]);
    await aktionen.wissensThemaWiederherstellen(formular({ id: z.id }));
    expect(await sichtbareSlugs()).toContain('testthema-vier-augen');
    await aktionen.wissensThemaInPapierkorb(formular({ id: z.id }));
    await aktionen.wissensThemaEndgueltigLoeschen(formular({ id: z.id }));
    expect(await thema(z.id)).toBeUndefined();
    expect(await revisionen(z.id)).toEqual([]);
    expect(await db.select().from(schema.freigabe).where(eq(schema.freigabe.inhaltId, z.id))).toEqual([]);
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, z.id));
    expect(audit.map((a) => a.aktion)).toContain('inhalt.geloescht');
  });

  it('im Papierkorb keine Entscheidung der religiösen Prüfung (gefälschtes Formular); nach dem Wiederherstellen wieder', async () => {
    await angemeldetAls(PRUEFUNG);
    const id = await anlegen({ slug: 'testthema-papierkorb-pruefung', titelDe: 'Testthema Papierkorb', einreichen: 'ja' });
    await aktionen.wissensThemaInPapierkorb(formular({ id }));
    await angemeldetAls(PRUEFUNG);
    expect(await freigeben(id)).toEqual({ wert: { fehler: 'nichtMehrOffen' } });
    expect(await freigeben(id, 'zurueckweisen', 'Bitte überarbeiten')).toEqual({ wert: { fehler: 'nichtMehrOffen' } });
    expect(await thema(id)).toMatchObject({ freigabe: 'zur_pruefung', geprueftVon: null });
    // Im Prüfverlauf nur der Antrag, keine Entscheidung
    const verlauf = await db.select().from(schema.freigabe).where(eq(schema.freigabe.inhaltId, id));
    expect(verlauf.map((f) => f.status)).toEqual(['zur_pruefung']);
    await aktionen.wissensThemaWiederherstellen(formular({ id }));
    expect(await freigeben(id)).toEqual({ ziel: '/verwaltung/freigaben?erledigt=freigeben' });
    expect((await thema(id)).freigabe).toBe('geprueft');
  });

  it('Löschlauf: nach 30 Tagen im Papierkorb endgültig gelöscht (mit Revisionen)', async () => {
    await angemeldetAls(REDAKTION);
    const id = await anlegen({ slug: 'testthema-alt', titelDe: 'Testthema alt' });
    await db
      .update(schema.wissenThema)
      .set({ imPapierkorbSeit: new Date(Date.now() - 31 * 86_400_000) })
      .where(eq(schema.wissenThema.id, id));
    await loescheAbgelaufene();
    expect(await thema(id)).toBeUndefined();
    expect(await revisionen(id)).toEqual([]);
  });
});

describe('Rechte (wissen.bearbeiten)', () => {
  it.each([
    ['ohne Sitzung', null, true],
    ['ohne Rolle', [], true],
    ['ohne zweiten Faktor', [{ rolle: 'administration' as const }], false],
    ['Bildung', [{ rolle: 'bildung' as const }], true],
    ['Leitung', [{ rolle: 'leitung' as const }], true],
    ['Organisationsredaktion', [{ rolle: 'organisationsredaktion' as const, organisation: 'gt' as const }], true],
    ['Kinderschutz', [{ rolle: 'kinderschutz' as const }], true],
  ])('%s: verboten, nichts geändert', async (_n, rollen, zweiFaktor) => {
    await angemeldetAls(rollen, zweiFaktor);
    const vorher = await db.select().from(schema.wissenThema);
    expect(await aktionen.speichereWissensThema({}, formular({ slug: 'testthema-verboten', titelDe: 'Testthema' }))).toEqual({
      fehler: 'keinRecht',
    });
    expect(await aktionen.speichereWissensReihenfolge({}, formular({ ordnung: '[]' }))).toEqual({ fehler: 'keinRecht' });
    await expect(aktionen.wissensThemaInPapierkorb(formular({ id: vorher[0].id }))).rejects.toThrow('KEIN_RECHT');
    await expect(aktionen.wissensRevisionWiederherstellen(formular({ revisionId: vorher[0].id }))).rejects.toThrow('KEIN_RECHT');
    expect(await db.select().from(schema.wissenThema)).toEqual(vorher);
  });

  it('Administration und religiöse Prüfung dürfen pflegen', async () => {
    for (const rollen of [[{ rolle: 'administration' as const }], PRUEFUNG]) {
      await angemeldetAls(rollen);
      expect(await aktionen.speichereWissensThema({}, formular({ titelDe: '' }))).toMatchObject({ fehler: 'pruefen' });
    }
  });
});
