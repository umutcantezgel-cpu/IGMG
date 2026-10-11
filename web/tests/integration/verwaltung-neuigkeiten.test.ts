import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Integrationstests der Verwaltung „Neuigkeiten“ (V03): Rechte je Rolle inklusive Organisationsredaktion, Linkprüfung im
 * Rich-Text, Veröffentlichung gegen die öffentliche Abfrage, Papierkorb, Slug, Zeitpunkte, Lesezeit, Cache und Audit.
 * Testdaten sind fiktiv (G-04); jeder Test legt seine Beiträge selbst an.
 */
const { client, db } = await verwaltungsUmgebung();
const { speichereNeuigkeit, inPapierkorb, wiederherstellen, endgueltigLoeschen } = await import('@/server/actions/neuigkeiten');
const { ladeNachricht, ladeNachrichten } = await import('@/server/queries/nachrichten');
const { ladeVerwaltungsListe, ladeNachrichtFuerVerwaltung } = await import('@/server/queries/verwaltung/neuigkeiten');
afterAll(() => client.close());

type Werte = Record<string, string | string[]>;

/** Gültige Formulareingabe; `zusatz` überschreibt einzelne Felder. */
function eingabe(titel: string, zusatz: Werte = {}): Werte {
  return { titelDe: titel, kategorie: 'gemeinde', ...zusatz };
}

/** Tiptap-JSON wie aus dem Editor: je Absatz ein Text, optional mit einem Link. */
function dokument(...absaetze: { text: string; href?: string }[]): string {
  return JSON.stringify({
    type: 'doc',
    content: absaetze.map((a) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: a.text, ...(a.href ? { marks: [{ type: 'link', attrs: { href: a.href } }] } : {}) }],
    })),
  });
}

const alsAdministration = (zweiFaktor = true) => angemeldetAls([{ rolle: 'administration' }], zweiFaktor);
const alsRedaktion = () => angemeldetAls([{ rolle: 'redaktion' }]);
const alsOrgGt = () => angemeldetAls([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);

/** Legt über die Action an. Das Anlegen endet mit einer Weiterleitung, deren Ziel die neue ID enthält. */
async function anlegen(werte: Werte): Promise<string> {
  const ergebnis: unknown = await speichereNeuigkeit({}, formular(werte)).catch((e: unknown) => e);
  const ziel = (ergebnis as { ziel?: string } | null)?.ziel ?? '';
  const treffer = /^\/verwaltung\/neuigkeiten\/([0-9a-f-]{36})\?angelegt=1$/.exec(ziel);
  expect(treffer, `Anlegen endete ohne Weiterleitung: ${ziel || 'kein Ziel'}`).not.toBeNull();
  return treffer![1];
}

/** Beitrag per ID; undefined, wenn es ihn nicht gibt. */
async function zeile(id: string) {
  const [treffer] = await db.select().from(schema.nachricht).where(eq(schema.nachricht.id, id)).limit(1);
  return treffer;
}

/** Alle Beiträge in fester Reihenfolge (Grundlage für „Datenbank unverändert“). */
function alleZeilen() {
  return db.select().from(schema.nachricht).orderBy(schema.nachricht.id);
}

/** Audit-Aktionen zu einem Beitrag in Schreibreihenfolge. */
async function auditAktionen(id: string): Promise<string[]> {
  const eintraege = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id)).orderBy(schema.auditEintrag.id);
  return eintraege.map((e) => e.aktion);
}

describe('Verwaltung › Neuigkeiten (V03)', () => {
  describe('Rechte: Anmeldung, zweiter Faktor, Rollen', () => {
    it('ohne Anmeldung: speichern liefert keinRecht, Papierkorb-Aktionen werfen KEIN_RECHT, nichts ändert sich', async () => {
      await alsAdministration();
      const offen = await anlegen(eingabe('V03 Ohne Anmeldung offen'));
      const imPapierkorb = await anlegen(eingabe('V03 Ohne Anmeldung Papierkorb'));
      await inPapierkorb(formular({ id: imPapierkorb }));
      await angemeldetAls(null);
      const vorher = await alleZeilen();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Ohne Anmeldung neu')))).toEqual({ fehler: 'keinRecht' });
      await expect(inPapierkorb(formular({ id: offen }))).rejects.toThrow('KEIN_RECHT');
      await expect(wiederherstellen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
      await expect(endgueltigLoeschen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('angemeldet ohne zweiten Faktor: auch Administration bekommt keinRecht', async () => {
      await alsAdministration(false);
      const vorher = await alleZeilen();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Ohne zweiten Faktor')))).toEqual({ fehler: 'keinRecht' });
      expect(await alleZeilen()).toEqual(vorher);
      expect(aufrufe.updateTag).toEqual([]);
    });

    it('angemeldet ohne Rolle: keinRecht', async () => {
      await angemeldetAls([]);
      const vorher = await alleZeilen();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Ohne Rolle')))).toEqual({ fehler: 'keinRecht' });
      expect(await alleZeilen()).toEqual(vorher);
    });

    for (const { rolle, name } of [
      { rolle: 'bildung', name: 'Bildung' },
      { rolle: 'mitgliederverwaltung', name: 'Mitgliederverwaltung' },
    ] as const) {
      it(`${name} ohne Nachrichtenrecht: anlegen liefert keinRecht, Papierkorb-Aktionen werfen KEIN_RECHT`, async () => {
        await alsAdministration();
        const offen = await anlegen(eingabe(`V03 ${name} offen`));
        const imPapierkorb = await anlegen(eingabe(`V03 ${name} Papierkorb`));
        await inPapierkorb(formular({ id: imPapierkorb }));
        await angemeldetAls([{ rolle }]);
        const vorher = await alleZeilen();
        expect(await speichereNeuigkeit({}, formular(eingabe(`V03 ${name} anlegen`)))).toEqual({ fehler: 'keinRecht' });
        await expect(inPapierkorb(formular({ id: offen }))).rejects.toThrow('KEIN_RECHT');
        await expect(wiederherstellen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
        await expect(endgueltigLoeschen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
        expect(await alleZeilen()).toEqual(vorher);
      });
    }
  });

  describe('Redaktion', () => {
    it('legt einen allgemeinen Beitrag ohne Organisation an und setzt den Ersteller', async () => {
      const benutzer = await alsRedaktion();
      const id = await anlegen(eingabe('V03 Redaktion allgemein', { organisation: '' }));
      const neu = await zeile(id);
      expect(neu?.organisation).toBeNull();
      expect(neu?.erstelltVon).toBe(benutzer);
      expect(neu?.kategorie).toBe('gemeinde');
    });

    it('legt einen Beitrag mit Organisation an', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Redaktion mit Organisation', { organisation: 'kt' }));
      expect((await zeile(id))?.organisation).toBe('kt');
    });

    it('bearbeitet einen bestehenden Beitrag', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Redaktion vorher'));
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Redaktion nachher', { id })))).toEqual({ gespeichert: expect.any(Number) });
      expect((await zeile(id))?.titel).toMatchObject({ de: 'V03 Redaktion nachher' });
    });

    it('legt in den Papierkorb, stellt wieder her und löscht endgültig (Audit in dieser Reihenfolge)', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Redaktion Lebenszyklus'));
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

    it('ein Beitrag im Papierkorb wird nicht geändert; das Formular bleibt bei der Meldung „imPapierkorb“', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Papierkorb gesperrt'));
      await inPapierkorb(formular({ id }));
      const vorher = await alleZeilen();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Papierkorb geaendert', { id })))).toMatchObject({ fehler: 'imPapierkorb' });
      expect(await alleZeilen()).toEqual(vorher);
    });
  });

  describe('Organisationsredaktion GT', () => {
    it('legt einen Beitrag der eigenen Organisation GT an', async () => {
      await alsOrgGt();
      const id = await anlegen(eingabe('V03 GT anlegen', { organisation: 'gt' }));
      expect((await zeile(id))?.organisation).toBe('gt');
    });

    it('Anlegen für Organisation KT wird abgelehnt und legt nichts an', async () => {
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 GT fremd', { organisation: 'kt' })))).toEqual({
        fehler: 'pruefen',
        feldFehler: { organisation: 'organisation' },
        werte: expect.objectContaining({ organisation: 'kt' }),
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('Anlegen ohne Organisation (allgemein) wird abgelehnt und legt nichts an', async () => {
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 GT allgemein', { organisation: '' })))).toEqual({
        fehler: 'pruefen',
        feldFehler: { organisation: 'organisation' },
        werte: expect.objectContaining({ organisation: '' }),
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('bestehender KT-Beitrag: bearbeiten liefert keinRecht und ändert nichts', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('V03 KT bestehend', { organisation: 'kt' }));
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 KT durch GT geaendert', { id, organisation: 'kt' })))).toMatchObject({
        fehler: 'keinRecht',
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('bestehender allgemeiner Beitrag: bearbeiten liefert keinRecht', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('V03 Allgemein bestehend'));
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Allgemein durch GT', { id })))).toMatchObject({ fehler: 'keinRecht' });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('KT-Beitrag in den Papierkorb legen, wiederherstellen und endgültig löschen wirft KEIN_RECHT', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('V03 KT Papierkorb', { organisation: 'kt' }));
      await alsOrgGt();
      const vorher = await alleZeilen();
      await expect(inPapierkorb(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
      await alsAdministration();
      await inPapierkorb(formular({ id }));
      await alsOrgGt();
      await expect(wiederherstellen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      await expect(endgueltigLoeschen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
    });

    it('eigenen GT-Beitrag nach KT verschieben wird abgelehnt und bleibt bei GT', async () => {
      await alsOrgGt();
      const id = await anlegen(eingabe('V03 GT verschieben', { organisation: 'gt' }));
      const vorher = await alleZeilen();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 GT verschieben', { id, organisation: 'kt' })))).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { organisation: 'organisation' },
      });
      expect(await alleZeilen()).toEqual(vorher);
      expect((await zeile(id))?.organisation).toBe('gt');
    });

    it('bearbeitet, legt in den Papierkorb, stellt wieder her und löscht endgültig eigene GT-Beiträge', async () => {
      await alsOrgGt();
      const id = await anlegen(eingabe('V03 GT eigene', { organisation: 'gt' }));
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 GT eigene geaendert', { id, organisation: 'gt' })))).toEqual({
        gespeichert: expect.any(Number),
      });
      await inPapierkorb(formular({ id }));
      await wiederherstellen(formular({ id }));
      await inPapierkorb(formular({ id }));
      await endgueltigLoeschen(formular({ id }));
      expect(await zeile(id)).toBeUndefined();
    });

    it('Listen und Einzelabfrage sehen nur die eigene Organisation', async () => {
      await alsAdministration();
      const gt = await anlegen(eingabe('V03 Liste GT', { organisation: 'gt' }));
      const kt = await anlegen(eingabe('V03 Liste KT', { organisation: 'kt' }));
      const allgemein = await anlegen(eingabe('V03 Liste allgemein'));
      const nurGt = await ladeVerwaltungsListe(false, ['gt']);
      expect(nurGt.map((z) => z.id)).toContain(gt);
      for (const fremd of [kt, allgemein]) expect(nurGt.map((z) => z.id)).not.toContain(fremd);
      expect(nurGt.every((z) => z.organisation === 'gt')).toBe(true);
      expect(await ladeVerwaltungsListe(false, [])).toEqual([]);
      const alle = (await ladeVerwaltungsListe(false, null)).map((z) => z.id);
      expect(alle).toEqual(expect.arrayContaining([gt, kt, allgemein]));
      expect(await ladeNachrichtFuerVerwaltung(kt, ['gt'])).toBeNull();
      expect((await ladeNachrichtFuerVerwaltung(gt, ['gt']))?.id).toBe(gt);
    });
  });

  describe('Rich-Text und Links', () => {
    it('unerlaubter Link (javascript:) wird abgelehnt und nichts gespeichert', async () => {
      await alsRedaktion();
      const vorher = await alleZeilen();
      expect(
        await speichereNeuigkeit(
          {},
          formular(eingabe('V03 Link unzulaessig', { inhaltDe: dokument({ text: 'Hier', href: 'javascript:alert(1)' }) })),
        ),
      ).toMatchObject({ fehler: 'pruefen', feldFehler: { inhaltDe: 'link' } });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('http (ohne s) und protokollrelative Adressen werden ebenfalls abgelehnt', async () => {
      await alsRedaktion();
      for (const href of ['http://example.test/', '//example.test/']) {
        expect(
          await speichereNeuigkeit({}, formular(eingabe('V03 Link fremd', { inhaltDe: dokument({ text: 'Hier', href }) }))),
        ).toMatchObject({ fehler: 'pruefen', feldFehler: { inhaltDe: 'link' } });
      }
    });

    it('https-Adressen und Seiten dieser Website werden angenommen; der Text bleibt erhalten', async () => {
      await alsRedaktion();
      const id = await anlegen(
        eingabe('V03 Link erlaubt', {
          inhaltDe: dokument(
            { text: 'Mehr auf der Seite des Verbands', href: 'https://example.test/' },
            { text: 'Kontakt', href: '/kontakt' },
          ),
        }),
      );
      const gespeichert = (await zeile(id))?.inhalt?.de;
      expect(JSON.stringify(gespeichert)).toContain('https://example.test/');
      expect(JSON.stringify(gespeichert)).toContain('/kontakt');
    });

    // Bildknoten und Titelbild: tests/integration/bilder-an-inhalten.test.ts (C11b)

    it('kein gültiges JSON im Textfeld: Fehler richtext', async () => {
      await alsRedaktion();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Kein JSON', { inhaltDe: 'kein json {' })))).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { inhaltDe: 'richtext' },
      });
    });

    it('leerer Text ist kein Inhalt (null), übersetzter Text ohne deutschen Text wird abgelehnt', async () => {
      await alsRedaktion();
      // Der Editor liefert einen leeren Absatz ohne Textknoten (ein leerer Textknoten wäre ungültig)
      const leer = JSON.stringify({ type: 'doc', content: [{ type: 'paragraph' }] });
      const id = await anlegen(eingabe('V03 Leerer Text', { inhaltDe: leer }));
      expect((await zeile(id))?.inhalt).toBeNull();
      expect(
        await speichereNeuigkeit({}, formular(eingabe('V03 Nur Englisch', { inhaltEn: dokument({ text: 'English body' }) }))),
      ).toMatchObject({ fehler: 'pruefen', feldFehler: { inhaltDe: 'pflicht' } });
    });
  });

  describe('Validierung', () => {
    it('leerer Titel liefert feldFehler titelDe pflicht und legt nichts an', async () => {
      await alsRedaktion();
      const vorher = await alleZeilen();
      expect(await speichereNeuigkeit({}, formular(eingabe('')))).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { titelDe: 'pflicht' },
        werte: { titelDe: '', kategorie: 'gemeinde' },
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('Übersetzung ohne deutschen Kurztext wird abgelehnt', async () => {
      await alsRedaktion();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Kurztext EN', { kurztextEn: 'Short text' })))).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { kurztextDe: 'pflicht' },
      });
    });

    it('Schlagwörter: Übersetzung mit anderer Anzahl wird abgelehnt', async () => {
      await alsRedaktion();
      expect(
        await speichereNeuigkeit(
          {},
          formular(eingabe('V03 Schlagwoerter', { schlagwoerterDe: 'Gebet, Bildung', schlagwoerterEn: 'Prayer' })),
        ),
      ).toMatchObject({ fehler: 'pruefen', feldFehler: { schlagwoerterEn: 'uebersetzungZeilen' } });
    });

    it('ungültiges Veröffentlichungsdatum (30. Februar) liefert Fehler datum', async () => {
      await alsRedaktion();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Datum', { veroeffentlichtAm: '2026-02-30T10:00' })))).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { veroeffentlichtAm: 'datum' },
      });
    });

    it('Lesezeit außerhalb des Bereichs und unbekannte Kategorie werden abgelehnt', async () => {
      await alsRedaktion();
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Lesezeit', { lesezeit: '0' })))).toMatchObject({
        feldFehler: { lesezeit: 'zahl' },
      });
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Kategorie', { kategorie: 'unbekannt' })))).toMatchObject({
        feldFehler: { kategorie: 'pflicht' },
      });
    });
  });

  describe('Slug', () => {
    it('zwei Beiträge mit gleichem Titel erhalten „v03-slug-meldung“ und „v03-slug-meldung-2“', async () => {
      await alsRedaktion();
      const erste = await anlegen(eingabe('V03 Slug Meldung'));
      const zweite = await anlegen(eingabe('V03 Slug Meldung'));
      expect((await zeile(erste))?.slug).toBe('v03-slug-meldung');
      expect((await zeile(zweite))?.slug).toBe('v03-slug-meldung-2');
    });

    it('Bearbeiten ohne Änderung der Adresse behält den Slug', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Slug Bearbeiten'));
      expect(await speichereNeuigkeit({}, formular(eingabe('V03 Slug Bearbeiten', { id })))).toEqual({ gespeichert: expect.any(Number) });
      expect((await zeile(id))?.slug).toBe('v03-slug-bearbeiten');
    });

    it('ein Titel ohne lateinische Buchstaben erhält den Slug „nachricht“', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('日本語'));
      expect((await zeile(id))?.slug).toBe('nachricht');
    });
  });

  describe('Veröffentlichen und öffentliche Abfrage', () => {
    it('Entwurf ist öffentlich nicht sichtbar; Veröffentlichen macht ihn für die öffentliche Abfrage sichtbar', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Oeffentlich pruefen', { kurztextDe: 'Kurz.' }));
      expect(await ladeNachricht('v03-oeffentlich-pruefen')).toBeNull();
      expect((await ladeNachrichten()).map((n) => n.id)).not.toContain(id);

      await alsRedaktion();
      expect(
        await speichereNeuigkeit({}, formular(eingabe('V03 Oeffentlich pruefen', { id, status: 'veroeffentlicht', kurztextDe: 'Kurz.' }))),
      ).toEqual({ gespeichert: expect.any(Number) });
      const oeffentlich = await ladeNachricht('v03-oeffentlich-pruefen');
      expect(oeffentlich?.id).toBe(id);
      expect(oeffentlich?.kurztext?.de).toBe('Kurz.');
      expect((await ladeNachrichten()).map((n) => n.id)).toContain(id);
      expect(aufrufe.updateTag).toEqual(['nachrichten', `nachricht:${id}`]);
    });

    it('Papierkorb blendet den Beitrag öffentlich und in der Liste aus; Wiederherstellen macht ihn wieder sichtbar', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Papierkorb oeffentlich', { status: 'veroeffentlicht' }));
      expect(await ladeNachricht('v03-papierkorb-oeffentlich')).not.toBeNull();

      await alsRedaktion();
      await inPapierkorb(formular({ id }));
      expect(await ladeNachricht('v03-papierkorb-oeffentlich')).toBeNull();
      expect((await ladeVerwaltungsListe(false)).map((z) => z.id)).not.toContain(id);
      expect((await ladeVerwaltungsListe(true)).map((z) => z.id)).toContain(id);

      await alsRedaktion();
      await wiederherstellen(formular({ id }));
      expect(await ladeNachricht('v03-papierkorb-oeffentlich')).not.toBeNull();
      expect((await ladeVerwaltungsListe(false)).map((z) => z.id)).toContain(id);
    });

    it('endgültig gelöschter Beitrag ist öffentlich nicht mehr abrufbar', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Endgueltig oeffentlich', { status: 'veroeffentlicht' }));
      await inPapierkorb(formular({ id }));
      await endgueltigLoeschen(formular({ id }));
      expect(await ladeNachricht('v03-endgueltig-oeffentlich')).toBeNull();
    });

    it('Veröffentlichen ohne Datum setzt den Zeitpunkt „jetzt“; ein Entwurf bekommt keinen', async () => {
      await alsRedaktion();
      const entwurf = await anlegen(eingabe('V03 Zeitpunkt Entwurf'));
      expect((await zeile(entwurf))?.veroeffentlichtAm).toBeNull();
      const vorher = Date.now();
      const veroeffentlicht = await anlegen(eingabe('V03 Zeitpunkt jetzt', { status: 'veroeffentlicht' }));
      const am = (await zeile(veroeffentlicht))?.veroeffentlichtAm;
      expect(am).toBeInstanceOf(Date);
      expect(Math.abs((am as Date).getTime() - vorher)).toBeLessThan(60_000);
    });

    it('ein gesetzter Zeitpunkt wird als Berliner Wanduhrzeit gespeichert (19:00 MEZ = 18:00 UTC)', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Zeitpunkt fest', { status: 'veroeffentlicht', veroeffentlichtAm: '2026-11-07T19:00' }));
      expect((await zeile(id))?.veroeffentlichtAm?.toISOString()).toBe('2026-11-07T18:00:00.000Z');
    });

    it('Bearbeiten mit leerem Datum behält einen früher gesetzten Veröffentlichungszeitpunkt', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Zeitpunkt behalten', { status: 'veroeffentlicht', veroeffentlichtAm: '2026-11-07T19:00' }));
      await speichereNeuigkeit({}, formular(eingabe('V03 Zeitpunkt behalten', { id, status: 'veroeffentlicht', veroeffentlichtAm: '' })));
      expect((await zeile(id))?.veroeffentlichtAm?.toISOString()).toBe('2026-11-07T18:00:00.000Z');
    });
  });

  describe('Lesezeit und Suche', () => {
    it('ohne Angabe wird die Lesezeit aus dem deutschen Text berechnet (400 Wörter ergeben 2 Minuten)', async () => {
      await alsRedaktion();
      const text = Array.from({ length: 400 }, (_, i) => `wort${i}`).join(' ');
      const id = await anlegen(eingabe('V03 Lesezeit berechnet', { inhaltDe: dokument({ text }) }));
      expect((await zeile(id))?.lesezeit).toBe(2);
    });

    it('eine angegebene Lesezeit wird übernommen', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Lesezeit angegeben', { lesezeit: '7', inhaltDe: dokument({ text: 'Kurz.' }) }));
      expect((await zeile(id))?.lesezeit).toBe(7);
    });

    it('die Suchspalte enthält Titel, Kurztext, Text und Schlagwörter', async () => {
      await alsRedaktion();
      const id = await anlegen(
        eingabe('V03 Suche Titel', {
          kurztextDe: 'Kurztext Suche',
          inhaltDe: dokument({ text: 'Absatz Suche' }),
          schlagwoerterDe: 'Suchbegriff',
        }),
      );
      const klartext = (await zeile(id))?.klartext;
      expect(klartext?.de).toContain('V03 Suche Titel');
      expect(klartext?.de).toContain('Kurztext Suche');
      expect(klartext?.de).toContain('Absatz Suche');
      expect(klartext?.de).toContain('Suchbegriff');
    });

    it('Schlagwörter werden je Sprache in Listen zerlegt', async () => {
      await alsRedaktion();
      const id = await anlegen(
        eingabe('V03 Schlagwort Liste', {
          schlagwoerterDe: 'Gebet, Bildung',
          schlagwoerterTr: 'Dua, Eğitim',
          schlagwoerterEn: 'Prayer, Education',
        }),
      );
      expect((await zeile(id))?.schlagwoerter).toEqual([
        { de: 'Gebet', tr: 'Dua', en: 'Prayer' },
        { de: 'Bildung', tr: 'Eğitim', en: 'Education' },
      ]);
    });
  });

  describe('Cache und Audit', () => {
    it('Anlegen ruft updateTag mit nachrichten und nachricht:<id> auf und plant eine Nachlauf-Invalidierung', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Cache anlegen'));
      expect(aufrufe.updateTag).toEqual(['nachrichten', `nachricht:${id}`]);
      expect(aufrufe.nachher).toHaveLength(1);
      expect(aufrufe.revalidateTag).toEqual([]);
    });

    it('Papierkorb, Wiederherstellen und endgültiges Löschen rufen Tags und refresh auf', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V03 Cache Papierkorb'));
      await alsRedaktion();
      await inPapierkorb(formular({ id }));
      expect(aufrufe.updateTag).toEqual(['nachrichten', `nachricht:${id}`]);
      expect(aufrufe.refresh).toBe(1);
      await alsRedaktion();
      await wiederherstellen(formular({ id }));
      expect(aufrufe.updateTag).toEqual(['nachrichten', `nachricht:${id}`]);
      expect(aufrufe.refresh).toBe(1);
      await inPapierkorb(formular({ id }));
      await alsRedaktion();
      await endgueltigLoeschen(formular({ id }));
      expect(aufrufe.updateTag).toEqual(['nachrichten', `nachricht:${id}`]);
      expect(aufrufe.refresh).toBe(1);
    });

    it('Audit: Aktionen je Beitrag, handelnde Person gesetzt, keine Personendaten und kein Freitext in details', async () => {
      const benutzer = await alsRedaktion();
      const id = await anlegen(eingabe('V03 Audit Details', { status: 'veroeffentlicht' }));
      await speichereNeuigkeit({}, formular(eingabe('V03 Audit Details geaendert', { id, status: 'veroeffentlicht' })));
      await inPapierkorb(formular({ id }));
      await endgueltigLoeschen(formular({ id }));
      expect(await auditAktionen(id)).toEqual([
        'inhalt.angelegt',
        'inhalt.veroeffentlicht',
        'inhalt.geaendert',
        'inhalt.papierkorb',
        'inhalt.geloescht',
      ]);
      const eigene = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id));
      expect(eigene.every((e) => e.benutzerId === benutzer)).toBe(true);
      expect(eigene.every((e) => e.zielTyp === 'nachricht')).toBe(true);
      const alle = await db.select().from(schema.auditEintrag);
      const mitPersonendaten = alle.filter(
        (e) => e.details !== null && Object.values(e.details).some((wert) => typeof wert === 'string' && wert.includes('@')),
      );
      expect(mitPersonendaten).toEqual([]);
    });
  });
});
