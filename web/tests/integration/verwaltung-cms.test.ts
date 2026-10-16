import { and, eq, sql } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Integrationstests CMS (ADR 0032, ADR 0030): Seiten mit Revisionen, Veröffentlichen nur mit Recht, Organisations-
 * redaktion nur eigene Organisation, Zeitplan, öffentliche Abfrage samt Sprach-Rückfall, religiöse Freigabe nur mit
 * Rolle, Weiterleitungen (Ziel, Schleife, reservierte Quelle), Menüs und signierte Vorschau. Testdaten fiktiv (G-04).
 */
const { client, db } = await verwaltungsUmgebung();
const seitenActions = await import('@/server/actions/seiten');
const { speichereSeite, seiteInPapierkorb, revisionWiederherstellen, erzeugeVorschau } = seitenActions;
const { speichereWeiterleitung, loescheWeiterleitung } = await import('@/server/actions/weiterleitungen');
const { speichereMenue, menueZuruecksetzen } = await import('@/server/actions/menues');
const { entscheideFreigabe } = await import('@/server/actions/freigaben');
const { ladeSeite, ladeWeiterleitung } = await import('@/server/queries/seiten');
const { ladeFussMenue, ladeKopfMenue } = await import('@/server/queries/menues');
const { ladeRevisionen, ladeSeitenListe } = await import('@/server/queries/verwaltung/seiten');
const { ladeWarteschlange } = await import('@/server/queries/verwaltung/freigaben');
const { REVISIONEN_JE_INHALT } = await import('@/lib/cms/revision');
const { hashVonToken } = await import('@/lib/cms/vorschau');
afterAll(() => client.close());

type Werte = Record<string, string>;
const text = (t: string) => JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: t }] }] });
const textBlock = (id: string, t: string) => ({ typ: 'text', id, inhalt: { de: JSON.parse(text(t)) } });
const versBlock = (id: string, von = 1) => ({ typ: 'vers', id, sure: 1, von, bis: von, uebersetzung: true });
const bloecke = (...b: unknown[]) => JSON.stringify(b);

const alsAdministration = () => angemeldetAls([{ rolle: 'administration' }]);
const alsRedaktion = () => angemeldetAls([{ rolle: 'redaktion' }]);
const alsOrgGt = () => angemeldetAls([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
const alsImam = () => angemeldetAls([{ rolle: 'religioese_pruefung' }]);
const alsLeitung = () => angemeldetAls([{ rolle: 'leitung' }]);

/** Anlegen über die Action; endet mit einer Weiterleitung, deren Ziel die neue ID trägt. */
async function anlegen(werte: Werte): Promise<string> {
  const ergebnis: unknown = await speichereSeite({}, formular({ bloecke: bloecke(textBlock('einleitung', 'Hallo')), ...werte })).catch(
    (e: unknown) => e,
  );
  const ziel = (ergebnis as { ziel?: string } | null)?.ziel ?? '';
  const treffer = /^\/verwaltung\/seiten\/([0-9a-f-]{36})\?angelegt=1/.exec(ziel);
  expect(treffer, `Anlegen endete ohne Weiterleitung: ${JSON.stringify(ergebnis)}`).not.toBeNull();
  return treffer![1];
}

async function zeile(id: string) {
  const [z] = await db.select().from(schema.seite).where(eq(schema.seite.id, id)).limit(1);
  return z;
}
const revisionen = (id: string) =>
  db
    .select()
    .from(schema.revision)
    .where(and(eq(schema.revision.inhaltTyp, 'seite'), eq(schema.revision.inhaltId, id)));
const auditAktionen = async (id: string) =>
  (await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id)).orderBy(schema.auditEintrag.id)).map(
    (e) => e.aktion,
  );

describe('Seiten: Rechte, Revisionen, Veröffentlichung', () => {
  it('ohne Anmeldung oder nur mit Leserecht: keinRecht, nichts gespeichert', async () => {
    await angemeldetAls(null);
    expect(await speichereSeite({}, formular({ titelDe: 'CMS Ohne', bloecke: '[]' }))).toEqual({ fehler: 'keinRecht' });
    await alsLeitung();
    expect(await speichereSeite({}, formular({ titelDe: 'CMS Leitung', bloecke: '[]' }))).toEqual({ fehler: 'keinRecht' });
    expect(await db.select().from(schema.seite)).toHaveLength(0);
  });

  it('Anlegen schreibt eine Revision, jedes Speichern eine weitere; es bleiben die letzten 30', async () => {
    await alsRedaktion();
    const id = await anlegen({ titelDe: 'CMS Revisionen', slugDe: 'cms-revisionen' });
    expect(await revisionen(id)).toHaveLength(1);
    expect(await auditAktionen(id)).toEqual(['inhalt.angelegt']);
    expect(aufrufe.updateTag).toEqual(expect.arrayContaining(['seiten', `seite:${id}`]));
    for (let i = 0; i < REVISIONEN_JE_INHALT + 2; i++)
      expect(
        await speichereSeite(
          {},
          formular({ id, titelDe: `CMS Revisionen ${i}`, bloecke: bloecke(textBlock('einleitung', `Fassung ${i}`)) }),
        ),
      ).toMatchObject({
        gespeichert: expect.any(Number),
      });
    const alle = await revisionen(id);
    expect(alle).toHaveLength(REVISIONEN_JE_INHALT);
    expect(alle.some((r) => (r.inhalt as { titel: { de: string } }).titel.de === `CMS Revisionen ${REVISIONEN_JE_INHALT + 1}`)).toBe(true);
  });

  it('frühere Fassung wiederherstellen: Titel und Bausteine zurück, neue Revision', async () => {
    await alsRedaktion();
    const id = await anlegen({ titelDe: 'CMS Alt', slugDe: 'cms-wieder' });
    await speichereSeite({}, formular({ id, titelDe: 'CMS Neu', bloecke: bloecke(textBlock('einleitung', 'Neu')) }));
    const [erste] = (await revisionen(id)).filter((r) => (r.inhalt as { titel: { de: string } }).titel.de === 'CMS Alt');
    await expect(revisionWiederherstellen(formular({ revisionId: erste.id }))).rejects.toThrow(
      `NEXT_REDIRECT:/verwaltung/seiten/${id}?wiederhergestellt=1`,
    );
    expect((await zeile(id)).titel.de).toBe('CMS Alt');
    expect(await revisionen(id)).toHaveLength(3);
    expect(await auditAktionen(id)).toContain('inhalt.revision_wiederhergestellt');
  });

  it('Liste „Frühere Fassungen“ (Z-18): Titel und Zahl der Bausteine je Fassung; andere Formen ergeben null statt Absturz', async () => {
    await alsRedaktion();
    const id = await anlegen({ titelDe: 'CMS Liste', slugDe: 'cms-liste' });
    expect(
      await speichereSeite(
        {},
        formular({ id, titelDe: 'CMS Liste 2', bloecke: bloecke(textBlock('einleitung', 'A'), textBlock('zweiter', 'B')) }),
      ),
    ).toMatchObject({ gespeichert: expect.any(Number) });
    // Fremde bzw. alte Momentaufnahmen: kein Objekt, Titel ohne Deutsch, Bausteine kein Array
    for (const inhalt of [sql`'null'::jsonb`, 'Text', [1, 2], { titel: { tr: 'Başlık' }, bloecke: { a: 1 } }, { titel: { de: 7 } }])
      await db.insert(schema.revision).values({ inhaltTyp: 'seite', inhaltId: id, inhalt, erstelltAm: new Date('2026-01-01T00:00:00Z') });
    const liste = await ladeRevisionen('seite', id);
    expect(liste).toHaveLength(7);
    expect(liste.slice(0, 2).map((r) => [r.titelDe, r.bausteine])).toEqual([
      ['CMS Liste 2', 2],
      ['CMS Liste', 1],
    ]);
    expect(liste.slice(2).map((r) => [r.titelDe, r.bausteine])).toEqual(Array.from({ length: 5 }, () => [null, null]));
  });

  it('Veröffentlichen macht die Seite öffentlich (je Sprache mit Rückfall und eigenem Slug), Papierkorb nimmt sie weg', async () => {
    await alsRedaktion();
    const id = await anlegen({
      titelDe: 'CMS Öffentlich',
      titelTr: 'CMS Açık',
      slugDe: 'cms-oeffentlich',
      slugTr: 'cms-acik',
      status: 'veroeffentlicht',
    });
    expect((await zeile(id)).status).toBe('veroeffentlicht');
    expect((await ladeSeite('de', 'cms-oeffentlich'))?.art).toBe('seite');
    expect((await ladeSeite('tr', 'cms-acik'))?.art).toBe('seite');
    // Deutscher Slug in der türkischen Fassung → Umleitung auf den türkischen; Englisch ohne eigenen Slug → Rückfall
    expect(await ladeSeite('tr', 'cms-oeffentlich')).toEqual({ art: 'umleitung', nach: '/tr/cms-acik' });
    expect((await ladeSeite('en', 'cms-oeffentlich'))?.art).toBe('seite');
    expect(await auditAktionen(id)).toEqual(['inhalt.angelegt', 'inhalt.veroeffentlicht']);
    await seiteInPapierkorb(formular({ id }));
    expect(await ladeSeite('de', 'cms-oeffentlich')).toBeNull();
  });

  it('Entwürfe sind nicht öffentlich; reservierte und doppelte Adressen werden abgewiesen', async () => {
    await alsRedaktion();
    await anlegen({ titelDe: 'CMS Entwurf', slugDe: 'cms-entwurf' });
    expect(await ladeSeite('de', 'cms-entwurf')).toBeNull();
    const reserviert = await speichereSeite({}, formular({ titelDe: 'X', slugDe: 'gebetszeiten', bloecke: '[]' }));
    expect(reserviert.feldFehler?.slugDe).toBe('reserviert');
    const doppelt = await speichereSeite({}, formular({ titelDe: 'X', slugDe: 'cms-entwurf', bloecke: '[]' }));
    expect(doppelt.feldFehler?.slugDe).toBe('slugVergeben');
    const sprache = await speichereSeite({}, formular({ titelDe: 'X', slugDe: 'cms-x', slugEn: 'cms-entwurf', bloecke: '[]' }));
    expect(sprache.feldFehler?.slugEn).toBe('slugVergeben');
  });

  it('Zeitplan: geplante Seite erst ab ihrem Zeitpunkt öffentlich, in der Liste „geplant“', async () => {
    await alsRedaktion();
    const id = await anlegen({
      titelDe: 'CMS Geplant',
      slugDe: 'cms-geplant',
      status: 'veroeffentlicht',
      veroeffentlichenAm: '2099-01-01T10:00',
    });
    expect(await ladeSeite('de', 'cms-geplant')).toBeNull();
    const liste = await ladeSeitenListe(false, null, new Date());
    expect(liste.find((z) => z.id === id)?.anzeige).toBe('geplant');
    expect(liste.find((z) => z.id === id)?.anzeige).not.toBe('veroeffentlicht');
    expect(
      await speichereSeite(
        {},
        formular({ id, titelDe: 'CMS Geplant', status: 'veroeffentlicht', veroeffentlichenAm: '2020-01-01T10:00', bloecke: '[]' }),
      ),
    ).toMatchObject({
      gespeichert: expect.any(Number),
    });
    expect((await ladeSeite('de', 'cms-geplant'))?.art).toBe('seite');
  });

  it('Organisationsredaktion: nur eigene Organisation anlegen, bearbeiten und veröffentlichen', async () => {
    await alsRedaktion();
    const fremd = await anlegen({ titelDe: 'CMS AT', slugDe: 'cms-at', organisation: 'at' });
    await alsOrgGt();
    const eigen = await anlegen({ titelDe: 'CMS GT', slugDe: 'cms-gt', organisation: 'gt', status: 'veroeffentlicht' });
    expect((await zeile(eigen)).status).toBe('veroeffentlicht');
    const anlegenFremd = await speichereSeite({}, formular({ titelDe: 'CMS AT 2', organisation: 'at', bloecke: '[]' }));
    expect(anlegenFremd.feldFehler?.organisation).toBe('organisation');
    const allgemein = await speichereSeite({}, formular({ titelDe: 'CMS Allgemein', organisation: '', bloecke: '[]' }));
    expect(allgemein.feldFehler?.organisation).toBe('organisation');
    expect(await speichereSeite({}, formular({ id: fremd, titelDe: 'Übernommen', organisation: 'gt', bloecke: '[]' }))).toMatchObject({
      fehler: 'keinRecht',
    });
    // Eigene Seite nicht in eine fremde Organisation verschieben
    const verschoben = await speichereSeite({}, formular({ id: eigen, titelDe: 'CMS GT', organisation: 'at', bloecke: '[]' }));
    expect(verschoben.feldFehler?.organisation).toBe('organisation');
    await expect(seiteInPapierkorb(formular({ id: fremd }))).rejects.toThrow('KEIN_RECHT');
    expect((await zeile(fremd)).titel.de).toBe('CMS AT');
    // Liste nur mit eigener Organisation
    const liste = await ladeSeitenListe(false, ['gt'], new Date());
    expect(liste.every((z) => z.organisation === 'gt')).toBe(true);
  });

  it('signierte Vorschau: Token nur als Hash, 24 Stunden gültig', async () => {
    await alsRedaktion();
    const id = await anlegen({ titelDe: 'CMS Vorschau', slugDe: 'cms-vorschau' });
    const r = await erzeugeVorschau({}, formular({ id }));
    const token = /^\/verwaltung\/vorschau\/([A-Za-z0-9_-]{43})$/.exec(r.url ?? '')?.[1];
    expect(token).toBeDefined();
    const zeilen = await db.select().from(schema.vorschauToken).where(eq(schema.vorschauToken.inhaltId, id));
    expect(zeilen).toHaveLength(1);
    expect(zeilen[0].tokenHash).toBe(hashVonToken(token!));
    expect(zeilen[0].tokenHash).not.toContain(token!);
    const dauer = zeilen[0].laeuftAb.getTime() - zeilen[0].erstelltAm.getTime();
    expect(dauer).toBeGreaterThan(23.9 * 3600_000);
    expect(dauer).toBeLessThan(24.1 * 3600_000);
    await alsLeitung();
    expect(await erzeugeVorschau({}, formular({ id }))).toEqual({ fehler: 'keinRecht' });
  });
});

describe('Freigaben: redaktionell und religiös', () => {
  it('Seite mit Koranvers: ohne Rolle geht sie in die religiöse Prüfung; nur religiöse Prüfung gibt frei', async () => {
    await alsRedaktion();
    const id = await anlegen({
      titelDe: 'CMS Vers',
      slugDe: 'cms-vers',
      status: 'veroeffentlicht',
      bloecke: bloecke(versBlock('vers000001')),
    });
    expect((await zeile(id)).status).toBe('entwurf');
    expect(await ladeSeite('de', 'cms-vers')).toBeNull();
    const offen = (await ladeWarteschlange()).find((e) => e.inhaltId === id);
    expect(offen).toMatchObject({ inhaltTyp: 'seite', art: 'religioes' });
    expect(await auditAktionen(id)).toContain('inhalt.zur_pruefung');

    // Redaktion (ohne religioes.freigeben) darf nicht freigeben
    expect(await entscheideFreigabe({}, formular({ inhaltTyp: 'seite', inhaltId: id, entscheidung: 'freigeben' }))).toEqual({
      fehler: 'nurReligioesePruefung',
    });
    // Zurückweisen braucht einen Kommentar
    await alsImam();
    const ohneKommentar = await entscheideFreigabe({}, formular({ inhaltTyp: 'seite', inhaltId: id, entscheidung: 'zurueckweisen' }));
    expect(ohneKommentar.feldFehler?.kommentar).toBe('kommentarPflicht');
    await expect(entscheideFreigabe({}, formular({ inhaltTyp: 'seite', inhaltId: id, entscheidung: 'freigeben' }))).rejects.toThrow(
      'NEXT_REDIRECT:/verwaltung/freigaben?erledigt=freigeben',
    );
    expect((await zeile(id)).status).toBe('veroeffentlicht');
    expect((await ladeSeite('de', 'cms-vers'))?.art).toBe('seite');
    expect(await auditAktionen(id)).toEqual(expect.arrayContaining(['freigabe.erteilt', 'inhalt.veroeffentlicht']));
    expect((await ladeWarteschlange()).some((e) => e.inhaltId === id)).toBe(false);

    // Nur Text geändert: bleibt veröffentlicht; Vers geändert: zurück in die Prüfung, nicht mehr öffentlich
    await alsRedaktion();
    await speichereSeite(
      {},
      formular({
        id,
        titelDe: 'CMS Vers 2',
        status: 'veroeffentlicht',
        bloecke: bloecke(versBlock('vers000001'), textBlock('text000001', 'Zusatz')),
      }),
    );
    expect((await zeile(id)).status).toBe('veroeffentlicht');
    const r = await speichereSeite(
      {},
      formular({ id, titelDe: 'CMS Vers 3', status: 'veroeffentlicht', bloecke: bloecke(versBlock('vers000001', 2)) }),
    );
    expect(r.hinweis).toBe('religioesePruefung');
    expect((await zeile(id)).status).toBe('entwurf');
    expect(await ladeSeite('de', 'cms-vers')).toBeNull();
  });

  it('religiöse Prüfung veröffentlicht Seiten mit Vers direkt (mit Eintrag im Verlauf)', async () => {
    await alsAdministration();
    const id = await anlegen({
      titelDe: 'CMS Vers Admin',
      slugDe: 'cms-vers-admin',
      status: 'veroeffentlicht',
      bloecke: bloecke(versBlock('vers000002')),
    });
    expect((await zeile(id)).status).toBe('veroeffentlicht');
    const verlauf = await db.select().from(schema.freigabe).where(eq(schema.freigabe.inhaltId, id));
    expect(verlauf.map((v) => [v.art, v.status])).toEqual([['religioes', 'geprueft']]);
  });

  it('redaktionelle Prüfung: Antrag, Zurückweisen mit Kommentar, Freigeben veröffentlicht', async () => {
    await alsOrgGt();
    const id = await anlegen({ titelDe: 'CMS Prüfung', slugDe: 'cms-pruefung', organisation: 'gt', status: 'zur_pruefung' });
    expect((await zeile(id)).status).toBe('entwurf');
    expect((await ladeWarteschlange()).find((e) => e.inhaltId === id)?.art).toBe('redaktion');
    await alsRedaktion();
    await expect(
      entscheideFreigabe(
        {},
        formular({ inhaltTyp: 'seite', inhaltId: id, entscheidung: 'zurueckweisen', kommentar: 'Bitte Bild ergänzen' }),
      ),
    ).rejects.toThrow('NEXT_REDIRECT:/verwaltung/freigaben?erledigt=zurueckweisen');
    expect((await zeile(id)).status).toBe('entwurf');
    expect(await entscheideFreigabe({}, formular({ inhaltTyp: 'seite', inhaltId: id, entscheidung: 'freigeben' }))).toEqual({
      fehler: 'nichtMehrOffen',
    });
    await alsOrgGt();
    await speichereSeite({}, formular({ id, titelDe: 'CMS Prüfung', organisation: 'gt', status: 'zur_pruefung', bloecke: '[]' }));
    await alsRedaktion();
    await entscheideFreigabe({}, formular({ inhaltTyp: 'seite', inhaltId: id, entscheidung: 'freigeben' })).catch(() => undefined);
    expect((await zeile(id)).status).toBe('veroeffentlicht');
    const verlauf = await db.select().from(schema.freigabe).where(eq(schema.freigabe.inhaltId, id)).orderBy(schema.freigabe.am);
    expect(verlauf.map((v) => v.status)).toEqual(['zur_pruefung', 'entwurf', 'zur_pruefung', 'geprueft']);
    expect(verlauf[1].kommentar).toBe('Bitte Bild ergänzen');
  });

  it('religiöse Inhalte anderer Module (Tajwid-Regel): nur mit Rolle religiöse Prüfung', async () => {
    await db
      .insert(schema.tajwidRegel)
      .values({ schluessel: 'cms-test', familie: 'test', name: { de: '[Testregel]' }, freigabe: 'zur_pruefung' });
    expect((await ladeWarteschlange()).find((e) => e.inhaltTyp === 'tajwid_regel')).toMatchObject({
      inhaltId: 'cms-test',
      art: 'religioes',
    });
    await alsRedaktion();
    expect(await entscheideFreigabe({}, formular({ inhaltTyp: 'tajwid_regel', inhaltId: 'cms-test', entscheidung: 'freigeben' }))).toEqual({
      fehler: 'nurReligioesePruefung',
    });
    const imam = await alsImam();
    await expect(
      entscheideFreigabe({}, formular({ inhaltTyp: 'tajwid_regel', inhaltId: 'cms-test', entscheidung: 'freigeben' })),
    ).rejects.toThrow('NEXT_REDIRECT:/verwaltung/freigaben?erledigt=freigeben');
    const [regel] = await db.select().from(schema.tajwidRegel).where(eq(schema.tajwidRegel.schluessel, 'cms-test'));
    expect(regel).toMatchObject({ freigabe: 'geprueft', geprueftVon: imam });
    expect(aufrufe.updateTag).toContain('tajwid');
    expect(await entscheideFreigabe({}, formular({ inhaltTyp: 'tajwid_regel', inhaltId: 'cms-test', entscheidung: 'freigeben' }))).toEqual({
      fehler: 'nichtMehrOffen',
    });
  });
});

describe('Weiterleitungen', () => {
  it('Ziel muss existieren, Quelle darf keine Seite treffen, keine Schleifen', async () => {
    await alsRedaktion();
    await anlegen({ titelDe: 'CMS Ziel', slugDe: 'cms-ziel', status: 'veroeffentlicht' });
    expect(await speichereWeiterleitung({}, formular({ von: '/cms-alt-a', nach: '/cms-ziel', code: '308' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    expect(await ladeWeiterleitung('/cms-alt-a')).toEqual({ nach: '/cms-ziel', code: 308 });
    // Kette erlaubt, Rückweg ergibt eine Schleife
    expect(await speichereWeiterleitung({}, formular({ von: '/cms-alt-b', nach: '/cms-alt-a', code: '301' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    const [a] = await db.select().from(schema.weiterleitung).where(eq(schema.weiterleitung.von, '/cms-alt-a'));
    const schleife = await speichereWeiterleitung({}, formular({ id: a.id, von: '/cms-alt-a', nach: '/cms-alt-b', code: '308' }));
    expect(schleife.feldFehler?.nach).toBe('schleife');
    expect((await speichereWeiterleitung({}, formular({ von: '/cms-alt-c', nach: '/gibt-es-nicht' }))).feldFehler?.nach).toBe(
      'zielUnbekannt',
    );
    expect((await speichereWeiterleitung({}, formular({ von: '/gebetszeiten', nach: '/cms-ziel' }))).feldFehler?.von).toBe('reserviert');
    expect((await speichereWeiterleitung({}, formular({ von: '/cms-ziel', nach: '/kontakt' }))).feldFehler?.von).toBe('seiteVorhanden');
    expect((await speichereWeiterleitung({}, formular({ von: '/cms-alt-a', nach: '/kontakt' }))).feldFehler?.von).toBe('vonVergeben');
    // Ziele in anderen Sprachen und mit Parametern
    expect(await speichereWeiterleitung({}, formular({ von: '/tr/eski', nach: '/tr/namaz-vakitleri' }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    expect(aufrufe.updateTag).toContain('weiterleitungen');
    await loescheWeiterleitung(formular({ id: a.id }));
    expect(await ladeWeiterleitung('/cms-alt-a')).toBeNull();
  });

  it('nur mit Recht weiterleitung.bearbeiten', async () => {
    await alsOrgGt();
    expect(await speichereWeiterleitung({}, formular({ von: '/cms-org', nach: '/kontakt' }))).toEqual({ fehler: 'keinRecht' });
  });
});

describe('Menüs', () => {
  it('Fußmenü speichern: freie Seiten und Bereiche, öffentlich je Sprache aufgelöst; Standard wiederherstellen', async () => {
    await alsRedaktion();
    const id = await anlegen({ titelDe: 'CMS Menü', slugDe: 'cms-menue', slugEn: 'cms-menu', status: 'veroeffentlicht' });
    const entwurf = await anlegen({ titelDe: 'CMS Menü Entwurf', slugDe: 'cms-menue-entwurf' });
    const eintraege = [
      { titel: { de: 'Unsere Seite', en: 'Our page' }, beschreibung: { de: '' }, ziel: `seite:${id}` },
      { titel: { de: 'Entwurf' }, beschreibung: { de: '' }, ziel: `seite:${entwurf}` },
      { titel: { de: 'Gebetszeiten' }, beschreibung: { de: '' }, ziel: '/gebetszeiten' },
    ];
    expect(await speichereMenue({}, formular({ schluessel: 'fuss', eintraege: JSON.stringify(eintraege) }))).toMatchObject({
      gespeichert: expect.any(Number),
    });
    expect(aufrufe.updateTag).toContain('menue');
    // Entwürfe erscheinen erst nach Veröffentlichung
    expect((await ladeFussMenue('de'))?.map((m) => [m.titel, m.href])).toEqual([
      ['Unsere Seite', '/cms-menue'],
      ['Gebetszeiten', '/gebetszeiten'],
    ]);
    expect((await ladeFussMenue('en'))?.map((m) => m.href)).toEqual(['/en/cms-menu', '/en/prayer-times']);
    expect((await ladeFussMenue('tr'))?.[0]).toMatchObject({ titel: 'Unsere Seite', titelLang: 'de' });
    expect(await db.select().from(schema.revision).where(eq(schema.revision.inhaltTyp, 'menue'))).toHaveLength(1);

    // Ziel unbekannt, falsches Format
    const fehlend = await speichereMenue(
      {},
      formular({
        schluessel: 'fuss',
        eintraege: JSON.stringify([{ ...eintraege[0], ziel: 'seite:0b7e1c3a-5d2f-4c8e-9a61-2f3b4c5d6e7f' }]),
      }),
    );
    expect(fehlend.fehler).toBe('zielUnbekannt');
    const extern = await speichereMenue(
      {},
      formular({ schluessel: 'fuss', eintraege: JSON.stringify([{ ...eintraege[2], ziel: 'https://example.org' }]) }),
    );
    expect(extern.feldFehler?.['0.ziel']).toBe('zielUngueltig');

    await menueZuruecksetzen(formular({ schluessel: 'fuss' }));
    expect(await ladeFussMenue('de')).toBeNull();
  });

  it('Kopfmenü mit Gruppen; ohne Recht menue.bearbeiten keinRecht', async () => {
    await alsRedaktion();
    const gruppen = [
      { titel: { de: 'Moschee' }, kinder: [{ titel: { de: 'Kontakt' }, beschreibung: { de: 'Schreiben Sie uns' }, ziel: '/kontakt' }] },
    ];
    await speichereMenue({}, formular({ schluessel: 'kopf', eintraege: JSON.stringify(gruppen) }));
    expect(await ladeKopfMenue('de')).toEqual([
      {
        titel: 'Moschee',
        titelLang: undefined,
        kinder: [{ titel: 'Kontakt', titelLang: undefined, beschreibung: 'Schreiben Sie uns', href: '/kontakt', ziel: '/kontakt' }],
      },
    ]);
    await alsOrgGt();
    expect(await speichereMenue({}, formular({ schluessel: 'kopf', eintraege: JSON.stringify(gruppen) }))).toEqual({ fehler: 'keinRecht' });
    await expect(menueZuruecksetzen(formular({ schluessel: 'kopf' }))).rejects.toThrow('KEIN_RECHT');
  });
});
