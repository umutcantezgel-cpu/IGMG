import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Rollen-Integrationstests der Verwaltung „Veranstaltungen“ (D08). Geprüft werden die Akzeptanzkriterien 1–11 gegen
 * die Server Actions speichereVeranstaltung, inPapierkorb, wiederherstellen und endgueltigLoeschen: Recht je Rolle,
 * zweiter Faktor, Organisationsrecht, Validierung, Slug, Bearbeiten, Cache, Papierkorb und Audit.
 * Jede Rolle hat eine eigene Testperson; Datensätze legt jeder Test selbst an.
 */
const { client, db } = await verwaltungsUmgebung();
const { speichereVeranstaltung, inPapierkorb, wiederherstellen, endgueltigLoeschen } = await import('@/server/actions/veranstaltungen');
afterAll(() => client.close());

type Werte = Record<string, string | string[]>;

/** Gültige Formulareingabe; `zusatz` überschreibt einzelne Felder. */
function eingabe(titel: string, zusatz: Werte = {}): Werte {
  return { titelDe: titel, kategorie: 'gemeinde', datum: '2026-11-07', beginnZeit: '19:00', ...zusatz };
}

const alsAdministration = (zweiFaktor = true) => angemeldetAls([{ rolle: 'administration' }], zweiFaktor);
const alsRedaktion = () => angemeldetAls([{ rolle: 'redaktion' }]);
const alsOrgGt = () => angemeldetAls([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);

/** Legt über die Action an. Das Anlegen endet mit einer Weiterleitung, deren Ziel die neue ID enthält. */
async function anlegen(werte: Werte): Promise<string> {
  const ergebnis: unknown = await speichereVeranstaltung({}, formular(werte)).catch((e: unknown) => e);
  const ziel = (ergebnis as { ziel?: string } | null)?.ziel ?? '';
  const treffer = /^\/verwaltung\/veranstaltungen\/([0-9a-f-]{36})\?angelegt=1$/.exec(ziel);
  expect(treffer, `Anlegen endete ohne Weiterleitung: ${ziel || 'kein Ziel'}`).not.toBeNull();
  return treffer![1];
}

/** Veranstaltung per ID; undefined, wenn es sie nicht gibt. */
async function zeile(id: string) {
  const [treffer] = await db.select().from(schema.veranstaltung).where(eq(schema.veranstaltung.id, id)).limit(1);
  return treffer;
}

/** Alle Veranstaltungen in fester Reihenfolge (Grundlage für „Datenbank unverändert“). */
function alleZeilen() {
  return db.select().from(schema.veranstaltung).orderBy(schema.veranstaltung.id);
}

/** Audit-Aktionen zu einer Veranstaltung in Schreibreihenfolge. */
async function auditAktionen(id: string): Promise<string[]> {
  const eintraege = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id)).orderBy(schema.auditEintrag.id);
  return eintraege.map((e) => e.aktion);
}

describe('Verwaltung › Veranstaltungen › Rollen (D08)', () => {
  describe('Kriterium 1: ohne Anmeldung', () => {
    it('speichern liefert keinRecht und lässt die Datenbank unverändert', async () => {
      await angemeldetAls(null);
      const vorher = await alleZeilen();
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 Ohne Anmeldung')))).toEqual({ fehler: 'keinRecht' });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('inPapierkorb, wiederherstellen und endgueltigLoeschen werfen KEIN_RECHT und ändern nichts', async () => {
      await alsAdministration();
      const offen = await anlegen(eingabe('D08 Ohne Anmeldung offen'));
      const imPapierkorb = await anlegen(eingabe('D08 Ohne Anmeldung Papierkorb'));
      await inPapierkorb(formular({ id: imPapierkorb }));
      const vorher = await alleZeilen();
      await angemeldetAls(null);
      await expect(inPapierkorb(formular({ id: offen }))).rejects.toThrow('KEIN_RECHT');
      await expect(wiederherstellen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
      await expect(endgueltigLoeschen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
    });
  });

  describe('Kriterium 2: angemeldet ohne zweiten Faktor', () => {
    it('speichern liefert keinRecht, auch mit Administrationsrolle, und ändert nichts', async () => {
      await alsAdministration(false);
      const vorher = await alleZeilen();
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 Ohne zweiten Faktor')))).toEqual({ fehler: 'keinRecht' });
      expect(await alleZeilen()).toEqual(vorher);
      expect(aufrufe.updateTag).toEqual([]);
    });

    it('inPapierkorb, wiederherstellen und endgueltigLoeschen werfen KEIN_RECHT und ändern nichts', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('D08 Zwei-Faktor Papierkorb'));
      await inPapierkorb(formular({ id }));
      const vorher = await alleZeilen();
      await alsAdministration(false);
      await expect(inPapierkorb(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      await expect(wiederherstellen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      await expect(endgueltigLoeschen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
    });
  });

  for (const { rolle, name } of [
    { rolle: 'bildung', name: 'Bildung' },
    { rolle: 'mitgliederverwaltung', name: 'Mitgliederverwaltung' },
  ] as const) {
    describe(`Kriterium 3: ${name} ohne Veranstaltungsrecht`, () => {
      it(`${name}: speichern liefert keinRecht und legt keine Zeile an`, async () => {
        await angemeldetAls([{ rolle }]);
        const vorher = await alleZeilen();
        expect(await speichereVeranstaltung({}, formular(eingabe(`D08 ${name} anlegen`)))).toEqual({ fehler: 'keinRecht' });
        expect(await alleZeilen()).toEqual(vorher);
      });

      it(`${name}: inPapierkorb, wiederherstellen und endgueltigLoeschen werfen KEIN_RECHT`, async () => {
        await alsAdministration();
        const offen = await anlegen(eingabe(`D08 ${name} offen`));
        const imPapierkorb = await anlegen(eingabe(`D08 ${name} Papierkorb`));
        await inPapierkorb(formular({ id: imPapierkorb }));
        await angemeldetAls([{ rolle }]);
        const vorher = await alleZeilen();
        await expect(inPapierkorb(formular({ id: offen }))).rejects.toThrow('KEIN_RECHT');
        await expect(inPapierkorb(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
        await expect(wiederherstellen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
        await expect(endgueltigLoeschen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
        expect(await alleZeilen()).toEqual(vorher);
      });
    });
  }

  describe('Kriterium 4: Redaktion', () => {
    it('legt eine allgemeine Veranstaltung ohne Organisation an', async () => {
      const benutzer = await alsRedaktion();
      const id = await anlegen(eingabe('D08 Redaktion allgemein', { organisation: '' }));
      const neu = await zeile(id);
      expect(neu?.organisation).toBeNull();
      expect(neu?.erstelltVon).toBe(benutzer);
    });

    it('legt eine Veranstaltung mit Organisation an', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Redaktion mit Organisation', { organisation: 'gt' }));
      expect((await zeile(id))?.organisation).toBe('gt');
    });

    it('bearbeitet eine bestehende Veranstaltung', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Redaktion vorher'));
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 Redaktion nachher', { id })))).toEqual({
        gespeichert: expect.any(Number),
      });
      expect((await zeile(id))?.titel).toMatchObject({ de: 'D08 Redaktion nachher' });
    });

    it('legt in den Papierkorb, stellt wieder her und löscht endgültig', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Redaktion Lebenszyklus'));
      await inPapierkorb(formular({ id }));
      expect((await zeile(id))?.imPapierkorbSeit).toBeInstanceOf(Date);
      await wiederherstellen(formular({ id }));
      expect((await zeile(id))?.imPapierkorbSeit).toBeNull();
      await inPapierkorb(formular({ id }));
      await endgueltigLoeschen(formular({ id }));
      expect(await zeile(id)).toBeUndefined();
      expect(await auditAktionen(id)).toEqual([
        'inhalt.angelegt',
        'inhalt.papierkorb',
        'inhalt.wiederhergestellt',
        'inhalt.papierkorb',
        'inhalt.geloescht',
      ]);
    });
  });

  describe('Kriterium 5: Organisationsredaktion GT', () => {
    it('legt eine Veranstaltung mit Organisation GT an', async () => {
      await alsOrgGt();
      const id = await anlegen(eingabe('D08 GT anlegen', { organisation: 'gt' }));
      expect((await zeile(id))?.organisation).toBe('gt');
    });

    it('Anlegen für Organisation KT wird abgelehnt und legt nichts an', async () => {
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 GT fremd', { organisation: 'kt' })))).toEqual({
        fehler: 'pruefen',
        feldFehler: { organisation: 'organisation' },
        werte: expect.objectContaining({ organisation: 'kt' }),
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('Anlegen ohne Organisation (allgemein) wird abgelehnt und legt nichts an', async () => {
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 GT allgemein', { organisation: '' })))).toEqual({
        fehler: 'pruefen',
        feldFehler: { organisation: 'organisation' },
        werte: expect.objectContaining({ organisation: '' }),
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('bestehende KT-Veranstaltung bearbeiten liefert keinRecht und ändert nichts', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('D08 KT bestehend', { organisation: 'kt' }));
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 KT durch GT geaendert', { id, organisation: 'kt' })))).toMatchObject({
        fehler: 'keinRecht',
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('bestehende allgemeine Veranstaltung (ohne Organisation) bearbeiten liefert keinRecht', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('D08 Allgemein bestehend'));
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 Allgemein durch GT', { id })))).toMatchObject({ fehler: 'keinRecht' });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('KT-Veranstaltung in den Papierkorb legen wirft KEIN_RECHT', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('D08 KT Papierkorb', { organisation: 'kt' }));
      await alsOrgGt();
      const vorher = await alleZeilen();
      await expect(inPapierkorb(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('KT-Veranstaltung im Papierkorb wiederherstellen und endgültig löschen werfen KEIN_RECHT', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('D08 KT Papierkorb wiederherstellen', { organisation: 'kt' }));
      await inPapierkorb(formular({ id }));
      await alsOrgGt();
      const vorher = await alleZeilen();
      await expect(wiederherstellen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      await expect(endgueltigLoeschen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('eigene GT-Veranstaltung nach KT verschieben wird abgelehnt und bleibt bei GT', async () => {
      await alsOrgGt();
      const id = await anlegen(eingabe('D08 GT verschieben', { organisation: 'gt' }));
      const vorher = await alleZeilen();
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 GT verschieben', { id, organisation: 'kt' })))).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { organisation: 'organisation' },
      });
      expect(await alleZeilen()).toEqual(vorher);
      expect((await zeile(id))?.organisation).toBe('gt');
    });

    it('bearbeitet, legt in den Papierkorb, stellt wieder her und löscht endgültig eigene GT-Veranstaltungen', async () => {
      await alsOrgGt();
      const id = await anlegen(eingabe('D08 GT eigene', { organisation: 'gt' }));
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 GT eigene geaendert', { id, organisation: 'gt' })))).toEqual({
        gespeichert: expect.any(Number),
      });
      await inPapierkorb(formular({ id }));
      await wiederherstellen(formular({ id }));
      await inPapierkorb(formular({ id }));
      await endgueltigLoeschen(formular({ id }));
      expect(await zeile(id)).toBeUndefined();
    });
  });

  describe('Angemeldet ohne Rolle', () => {
    it('speichern liefert keinRecht und Papierkorb-Aktionen werfen KEIN_RECHT', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('D08 Ohne Rolle Bestand'));
      await angemeldetAls([]);
      const vorher = await alleZeilen();
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 Ohne Rolle anlegen')))).toEqual({ fehler: 'keinRecht' });
      await expect(inPapierkorb(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
    });
  });

  describe('Administration (Kontrollfälle zu den Negativtests)', () => {
    it('legt Veranstaltungen in allen Organisationen an', async () => {
      await alsAdministration();
      for (const organisation of ['at', 'kt', 'gt', 'kgt'] as const) {
        const id = await anlegen(eingabe(`D08 Admin ${organisation}`, { organisation }));
        expect((await zeile(id))?.organisation).toBe(organisation);
      }
    });

    it('bearbeitet eine KT-Veranstaltung und löscht sie über den Papierkorb endgültig', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('D08 Admin KT', { organisation: 'kt' }));
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 Admin KT geaendert', { id, organisation: 'kt' })))).toEqual({
        gespeichert: expect.any(Number),
      });
      await inPapierkorb(formular({ id }));
      await endgueltigLoeschen(formular({ id }));
      expect(await zeile(id)).toBeUndefined();
    });
  });

  describe('Kriterium 6: Validierung', () => {
    it('leerer Titel liefert feldFehler titelDe pflicht, legt nichts an und nennt die Eingaben in werte', async () => {
      await alsRedaktion();
      const vorher = await alleZeilen();
      expect(await speichereVeranstaltung({}, formular(eingabe('')))).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { titelDe: 'pflicht' },
        werte: { titelDe: '', kategorie: 'gemeinde' },
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('fehlendes Titelfeld (Schlüssel fehlt ganz) liefert ebenfalls feldFehler titelDe pflicht', async () => {
      await alsRedaktion();
      const vorher = await alleZeilen();
      const ohneTitel: Werte = { kategorie: 'gemeinde', datum: '2026-11-07', beginnZeit: '19:00' };
      expect(await speichereVeranstaltung({}, formular(ohneTitel))).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { titelDe: 'pflicht' },
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('Endzeit vor Startzeit liefert feldFehler endeZeit endeVorBeginn und legt nichts an', async () => {
      await alsRedaktion();
      const vorher = await alleZeilen();
      expect(
        await speichereVeranstaltung({}, formular(eingabe('D08 Endzeit vor Beginn', { beginnZeit: '19:00', endeZeit: '18:00' }))),
      ).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { endeZeit: 'endeVorBeginn' },
        werte: { beginnZeit: '19:00', endeZeit: '18:00' },
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('ungültige eigene Regel (FREQ=HOURLY) liefert Fehler an whRoh und whArt und legt nichts an', async () => {
      await alsRedaktion();
      const vorher = await alleZeilen();
      expect(
        await speichereVeranstaltung({}, formular(eingabe('D08 Regel ungueltig', { whArt: 'eigene', whRoh: 'FREQ=HOURLY' }))),
      ).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { whRoh: 'regel', whArt: 'regel' },
        werte: { whArt: 'eigene', whRoh: 'FREQ=HOURLY' },
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('eigene Regel ohne Roh-Regel liefert Fehler an whRoh und legt nichts an', async () => {
      await alsRedaktion();
      const vorher = await alleZeilen();
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 Regel leer', { whArt: 'eigene', whRoh: '' })))).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { whRoh: 'regel' },
        werte: { whArt: 'eigene', whRoh: '' },
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('gültige eigene Regel wird angelegt (Gegenprobe zur Regelprüfung)', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Regel gueltig', { whArt: 'eigene', whRoh: 'FREQ=WEEKLY;BYDAY=TU' }));
      expect((await zeile(id))?.wiederholung).toBe('FREQ=WEEKLY;BYDAY=TU');
    });
  });

  describe('Kriterium 7: Slug', () => {
    it('zwei Veranstaltungen mit gleichem Titel erhalten die Slugs „d08-slug-vortrag“ und „d08-slug-vortrag-2“', async () => {
      await alsRedaktion();
      const erste = await anlegen(eingabe('D08 Slug Vortrag'));
      const zweite = await anlegen(eingabe('D08 Slug Vortrag'));
      expect((await zeile(erste))?.slug).toBe('d08-slug-vortrag');
      expect((await zeile(zweite))?.slug).toBe('d08-slug-vortrag-2');
    });

    it('Bearbeiten ohne Titeländerung behält den eigenen Slug', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Slug Bearbeiten'));
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 Slug Bearbeiten', { id })))).toEqual({
        gespeichert: expect.any(Number),
      });
      expect((await zeile(id))?.slug).toBe('d08-slug-bearbeiten');
    });
  });

  describe('Kriterium 8: Bearbeiten', () => {
    it('Titeländerung ändert die Zeile, protokolliert inhalt.geaendert und liefert gespeichert', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Titel vorher'));
      expect(await speichereVeranstaltung({}, formular(eingabe('D08 Titel nachher', { id })))).toEqual({ gespeichert: expect.any(Number) });
      expect((await zeile(id))?.titel).toMatchObject({ de: 'D08 Titel nachher' });
      expect(await auditAktionen(id)).toEqual(['inhalt.angelegt', 'inhalt.geaendert']);
    });

    it('Wechsel von Entwurf zu Veröffentlicht protokolliert zusätzlich inhalt.veroeffentlicht', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Entwurf zu veroeffentlicht'));
      expect(
        await speichereVeranstaltung({}, formular(eingabe('D08 Entwurf zu veroeffentlicht', { id, status: 'veroeffentlicht' }))),
      ).toEqual({ gespeichert: expect.any(Number) });
      expect((await zeile(id))?.status).toBe('veroeffentlicht');
      expect(await auditAktionen(id)).toEqual(['inhalt.angelegt', 'inhalt.geaendert', 'inhalt.veroeffentlicht']);
    });

    it('Bearbeiten einer bereits veröffentlichten Veranstaltung protokolliert kein weiteres inhalt.veroeffentlicht', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Schon veroeffentlicht', { status: 'veroeffentlicht' }));
      await speichereVeranstaltung({}, formular(eingabe('D08 Schon veroeffentlicht geaendert', { id, status: 'veroeffentlicht' })));
      expect(await auditAktionen(id)).toEqual(['inhalt.angelegt', 'inhalt.veroeffentlicht', 'inhalt.geaendert']);
    });
  });

  describe('Kriterium 9: Cache', () => {
    it('Anlegen ruft updateTag mit veranstaltungen und veranstaltung:<id> auf und plant genau eine Nachlauf-Invalidierung', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Cache anlegen'));
      expect(aufrufe.updateTag).toEqual(['veranstaltungen', `veranstaltung:${id}`]);
      expect(aufrufe.nachher).toHaveLength(1);
      expect(aufrufe.revalidateTag).toEqual([]);
    });

    it('Bearbeiten ruft dieselben Tags auf und plant genau eine Nachlauf-Invalidierung', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Cache bearbeiten'));
      await alsRedaktion();
      await speichereVeranstaltung({}, formular(eingabe('D08 Cache bearbeitet', { id })));
      expect(aufrufe.updateTag).toEqual(['veranstaltungen', `veranstaltung:${id}`]);
      expect(aufrufe.nachher).toHaveLength(1);
      expect(aufrufe.revalidateTag).toEqual([]);
    });

    it('In den Papierkorb legen ruft Tags auf, plant die Nachlauf-Invalidierung und ruft refresh auf', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Cache Papierkorb'));
      await alsRedaktion();
      await inPapierkorb(formular({ id }));
      expect(aufrufe.updateTag).toEqual(['veranstaltungen', `veranstaltung:${id}`]);
      expect(aufrufe.nachher).toHaveLength(1);
      expect(aufrufe.refresh).toBe(1);
    });

    it('Wiederherstellen ruft Tags auf, plant die Nachlauf-Invalidierung und ruft refresh auf', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Cache wiederherstellen'));
      await inPapierkorb(formular({ id }));
      await alsRedaktion();
      await wiederherstellen(formular({ id }));
      expect(aufrufe.updateTag).toEqual(['veranstaltungen', `veranstaltung:${id}`]);
      expect(aufrufe.nachher).toHaveLength(1);
      expect(aufrufe.refresh).toBe(1);
    });

    it('Endgültig löschen ruft Tags auf, plant die Nachlauf-Invalidierung und ruft refresh auf', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Cache loeschen'));
      await inPapierkorb(formular({ id }));
      await alsRedaktion();
      await endgueltigLoeschen(formular({ id }));
      expect(aufrufe.updateTag).toEqual(['veranstaltungen', `veranstaltung:${id}`]);
      expect(aufrufe.nachher).toHaveLength(1);
      expect(aufrufe.refresh).toBe(1);
    });
  });

  describe('Kriterium 10: Papierkorb', () => {
    it('inPapierkorb setzt imPapierkorbSeit, protokolliert inhalt.papierkorb und ruft refresh auf', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Papierkorb setzen'));
      await alsRedaktion();
      await inPapierkorb(formular({ id }));
      expect((await zeile(id))?.imPapierkorbSeit).toBeInstanceOf(Date);
      expect(await auditAktionen(id)).toEqual(['inhalt.angelegt', 'inhalt.papierkorb']);
      expect(aufrufe.refresh).toBe(1);
    });

    it('endgueltigLoeschen einer nicht im Papierkorb liegenden Veranstaltung wirft KEIN_RECHT und löscht nichts', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Nicht im Papierkorb'));
      await alsRedaktion();
      const vorher = await alleZeilen();
      await expect(endgueltigLoeschen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
      expect(await auditAktionen(id)).toEqual(['inhalt.angelegt']);
      expect(aufrufe.updateTag).toEqual([]);
    });

    it('aus dem Papierkorb endgültig gelöscht: Zeile weg, Audit inhalt.geloescht', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('D08 Endgueltig loeschen'));
      await inPapierkorb(formular({ id }));
      await endgueltigLoeschen(formular({ id }));
      expect(await zeile(id)).toBeUndefined();
      expect(await auditAktionen(id)).toEqual(['inhalt.angelegt', 'inhalt.papierkorb', 'inhalt.geloescht']);
    });
  });

  describe('Kriterium 11: Audit ohne Personendaten', () => {
    it('Audit-Einträge der Aktionen tragen in details keine Zeichenkette mit @ und halten die handelnde Person fest', async () => {
      const benutzer = await alsRedaktion();
      const id = await anlegen(eingabe('D08 Audit Details'));
      await speichereVeranstaltung({}, formular(eingabe('D08 Audit Details geaendert', { id })));
      await inPapierkorb(formular({ id }));
      await endgueltigLoeschen(formular({ id }));
      const eigene = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id)).orderBy(schema.auditEintrag.id);
      expect(eigene.map((e) => e.aktion)).toEqual(['inhalt.angelegt', 'inhalt.geaendert', 'inhalt.papierkorb', 'inhalt.geloescht']);
      expect(eigene.every((e) => e.benutzerId === benutzer)).toBe(true);
      const alle = await db.select().from(schema.auditEintrag).orderBy(schema.auditEintrag.id);
      const mitMail = alle.filter(
        (e) => e.details !== null && Object.values(e.details).some((wert) => typeof wert === 'string' && wert.includes('@')),
      );
      expect(mitMail).toEqual([]);
    });
  });
});
