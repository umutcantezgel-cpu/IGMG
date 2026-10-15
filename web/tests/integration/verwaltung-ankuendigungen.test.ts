import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Integrationstests der Verwaltung „Ankündigungen“ (V04, E-033): Rechte je Rolle und Organisation, zweiter Faktor,
 * Eingabe und Links, Laufzeit, Papierkorb, Audit und Cache-Invalidierung über die Server Actions sowie der
 * Laufzeitfilter der öffentlichen Abfrage zu festen Zeitpunkten. Testdaten sind fiktiv (G-04).
 */
const { client, db } = await verwaltungsUmgebung();
const { speichereAnkuendigung, inPapierkorb, wiederherstellen, endgueltigLoeschen } = await import('@/server/actions/ankuendigungen');
const { sichtbareAnkuendigungen } = await import('@/server/queries/ankuendigungen');
const { ladeVerwaltungsListe, zustandAm } = await import('@/server/queries/verwaltung/ankuendigungen');
afterAll(() => client.close());

type Werte = Record<string, string | string[]>;

/** Gültige Formulareingabe (veröffentlicht, allgemein, mittlere Priorität); `zusatz` überschreibt einzelne Felder. */
function eingabe(titel: string, zusatz: Werte = {}): Werte {
  return {
    titelDe: titel,
    inhaltDe: 'Testtext für die Ankündigung.',
    prioritaet: 'mittel',
    organisation: '',
    status: 'veroeffentlicht',
    ...zusatz,
  };
}

const alsAdministration = (zweiFaktor = true) => angemeldetAls([{ rolle: 'administration' }], zweiFaktor);
const alsRedaktion = () => angemeldetAls([{ rolle: 'redaktion' }]);
const alsOrgGt = () => angemeldetAls([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);

/** Legt über die Action an. Das Anlegen endet mit einer Weiterleitung auf den neuen Datensatz. */
async function anlegen(werte: Werte): Promise<string> {
  const ergebnis: unknown = await speichereAnkuendigung({}, formular(werte)).catch((e: unknown) => e);
  const ziel = (ergebnis as { ziel?: string } | null)?.ziel ?? '';
  const treffer = /^\/verwaltung\/ankuendigungen\/([0-9a-f-]{36})\?angelegt=1$/.exec(ziel);
  expect(treffer, `Anlegen endete ohne Weiterleitung: ${ziel || 'kein Ziel'}`).not.toBeNull();
  return treffer![1];
}

/** Datensatz per ID; undefined, wenn es ihn nicht gibt. */
async function zeile(id: string) {
  const [treffer] = await db.select().from(schema.ankuendigung).where(eq(schema.ankuendigung.id, id)).limit(1);
  return treffer;
}

/** Alle Ankündigungen in fester Reihenfolge (Grundlage für „Datenbank unverändert“). */
function alleZeilen() {
  return db.select().from(schema.ankuendigung).orderBy(schema.ankuendigung.id);
}

/** Audit-Aktionen zu einer Ankündigung in Schreibreihenfolge. */
async function auditAktionen(id: string): Promise<string[]> {
  const eintraege = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id)).orderBy(schema.auditEintrag.id);
  return eintraege.map((e) => e.aktion);
}

describe('Verwaltung › Ankündigungen › Rechte (V04)', () => {
  describe('Kriterium 1: ohne Anmeldung', () => {
    it('speichern liefert keinRecht und lässt die Datenbank unverändert', async () => {
      await alsAdministration();
      const bestand = await anlegen(eingabe('V04 Bestand ohne Anmeldung'));
      await angemeldetAls(null);
      const vorher = await alleZeilen();
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 Ohne Anmeldung')))).toEqual({ fehler: 'keinRecht' });
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 Ohne Anmeldung Bestand', { id: bestand })))).toEqual({
        fehler: 'keinRecht',
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('inPapierkorb, wiederherstellen und endgueltigLoeschen werfen KEIN_RECHT und ändern nichts', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('V04 Ohne Anmeldung Papierkorb'));
      await angemeldetAls(null);
      const vorher = await alleZeilen();
      await expect(inPapierkorb(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      await expect(wiederherstellen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      await expect(endgueltigLoeschen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
    });
  });

  describe('Kriterium 2: angemeldet ohne zweiten Faktor', () => {
    it('speichern liefert keinRecht, auch mit Administrationsrolle, und ändert nichts', async () => {
      await alsAdministration(false);
      const vorher = await alleZeilen();
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 Ohne zweiten Faktor')))).toEqual({ fehler: 'keinRecht' });
      expect(await alleZeilen()).toEqual(vorher);
      expect(aufrufe.updateTag).toEqual([]);
    });

    it('inPapierkorb, wiederherstellen und endgueltigLoeschen werfen KEIN_RECHT', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('V04 Zwei-Faktor Papierkorb'));
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
    describe(`Kriterium 3: ${name} ohne Ankündigungsrecht`, () => {
      it(`${name}: speichern liefert keinRecht und legt keine Zeile an`, async () => {
        await angemeldetAls([{ rolle }]);
        const vorher = await alleZeilen();
        expect(await speichereAnkuendigung({}, formular(eingabe(`V04 ${name} anlegen`)))).toEqual({ fehler: 'keinRecht' });
        expect(await alleZeilen()).toEqual(vorher);
      });

      it(`${name}: Papierkorb-Aktionen werfen KEIN_RECHT`, async () => {
        await alsAdministration();
        const offen = await anlegen(eingabe(`V04 ${name} offen`));
        const imPapierkorb = await anlegen(eingabe(`V04 ${name} Papierkorb`));
        await inPapierkorb(formular({ id: imPapierkorb }));
        await angemeldetAls([{ rolle }]);
        const vorher = await alleZeilen();
        await expect(inPapierkorb(formular({ id: offen }))).rejects.toThrow('KEIN_RECHT');
        await expect(wiederherstellen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
        await expect(endgueltigLoeschen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
        expect(await alleZeilen()).toEqual(vorher);
      });
    });
  }

  describe('Kriterium 4: Redaktion', () => {
    it('legt eine allgemeine Ankündigung ohne Organisation an', async () => {
      const benutzer = await alsRedaktion();
      const id = await anlegen(eingabe('V04 Redaktion allgemein'));
      const neu = await zeile(id);
      expect(neu?.organisation).toBeNull();
      expect(neu?.erstelltVon).toBe(benutzer);
    });

    it('legt eine Ankündigung mit Organisation an', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V04 Redaktion mit Organisation', { organisation: 'gt' }));
      expect((await zeile(id))?.organisation).toBe('gt');
    });

    it('bearbeitet eine bestehende Ankündigung', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V04 Redaktion vorher'));
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 Redaktion nachher', { id })))).toEqual({
        gespeichert: expect.any(Number),
      });
      expect((await zeile(id))?.titel).toMatchObject({ de: 'V04 Redaktion nachher' });
    });

    it('legt in den Papierkorb, stellt wieder her und löscht endgültig; das Audit hält jede Stufe fest', async () => {
      await alsRedaktion();
      const id = await anlegen(eingabe('V04 Redaktion Lebenszyklus'));
      await inPapierkorb(formular({ id }));
      expect((await zeile(id))?.imPapierkorbSeit).toBeInstanceOf(Date);
      await wiederherstellen(formular({ id }));
      expect((await zeile(id))?.imPapierkorbSeit).toBeNull();
      await inPapierkorb(formular({ id }));
      await endgueltigLoeschen(formular({ id }));
      expect(await zeile(id)).toBeUndefined();
      expect(await auditAktionen(id)).toEqual([
        'inhalt.angelegt',
        'inhalt.veroeffentlicht',
        'inhalt.papierkorb',
        'inhalt.wiederhergestellt',
        'inhalt.papierkorb',
        'inhalt.geloescht',
      ]);
    });
  });

  describe('Kriterium 5: Organisationsredaktion GT', () => {
    it('legt eine Ankündigung für GT an', async () => {
      await alsOrgGt();
      const id = await anlegen(eingabe('V04 GT anlegen', { organisation: 'gt' }));
      expect((await zeile(id))?.organisation).toBe('gt');
    });

    it('Anlegen für KT wird abgelehnt und legt nichts an', async () => {
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 GT fremd', { organisation: 'kt' })))).toEqual({
        fehler: 'pruefen',
        feldFehler: { organisation: 'organisation' },
        werte: expect.objectContaining({ organisation: 'kt' }),
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('Anlegen ohne Organisation (allgemein) wird abgelehnt und legt nichts an', async () => {
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 GT allgemein', { organisation: '' })))).toEqual({
        fehler: 'pruefen',
        feldFehler: { organisation: 'organisation' },
        werte: expect.objectContaining({ organisation: '' }),
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('bestehende KT-Ankündigung bearbeiten liefert keinRecht und ändert nichts', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('V04 KT bestehend', { organisation: 'kt' }));
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 KT durch GT geaendert', { id, organisation: 'kt' })))).toMatchObject({
        fehler: 'keinRecht',
      });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('bestehende allgemeine Ankündigung bearbeiten liefert keinRecht', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('V04 Allgemein bestehend'));
      await alsOrgGt();
      const vorher = await alleZeilen();
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 Allgemein durch GT', { id })))).toMatchObject({ fehler: 'keinRecht' });
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('KT-Ankündigung in den Papierkorb legen wirft KEIN_RECHT', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('V04 KT Papierkorb', { organisation: 'kt' }));
      await alsOrgGt();
      const vorher = await alleZeilen();
      await expect(inPapierkorb(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('KT-Ankündigung im Papierkorb wiederherstellen und endgültig löschen werfen KEIN_RECHT', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('V04 KT Papierkorb wiederherstellen', { organisation: 'kt' }));
      await inPapierkorb(formular({ id }));
      await alsOrgGt();
      const vorher = await alleZeilen();
      await expect(wiederherstellen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      await expect(endgueltigLoeschen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
    });

    it('eigene GT-Ankündigung nach KT verschieben wird abgelehnt und bleibt bei GT', async () => {
      await alsOrgGt();
      const id = await anlegen(eingabe('V04 GT verschieben', { organisation: 'gt' }));
      const vorher = await alleZeilen();
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 GT verschieben', { id, organisation: 'kt' })))).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { organisation: 'organisation' },
      });
      expect(await alleZeilen()).toEqual(vorher);
      expect((await zeile(id))?.organisation).toBe('gt');
    });

    it('bearbeitet, legt in den Papierkorb, stellt wieder her und löscht endgültig eigene GT-Ankündigungen', async () => {
      await alsOrgGt();
      const id = await anlegen(eingabe('V04 GT eigene', { organisation: 'gt' }));
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 GT eigene geaendert', { id, organisation: 'gt' })))).toEqual({
        gespeichert: expect.any(Number),
      });
      await inPapierkorb(formular({ id }));
      await wiederherstellen(formular({ id }));
      await inPapierkorb(formular({ id }));
      await endgueltigLoeschen(formular({ id }));
      expect(await zeile(id)).toBeUndefined();
    });

    it('Liste zeigt der Organisationsredaktion nur GT-Ankündigungen', async () => {
      await alsAdministration();
      const gt = await anlegen(eingabe('V04 Liste GT', { organisation: 'gt' }));
      const kt = await anlegen(eingabe('V04 Liste KT', { organisation: 'kt' }));
      const allgemein = await anlegen(eingabe('V04 Liste allgemein'));
      const nurGt = await ladeVerwaltungsListe(false, ['gt']);
      const ids = nurGt.map((z) => z.id);
      expect(ids).toContain(gt);
      expect(ids).not.toContain(kt);
      expect(ids).not.toContain(allgemein);
      expect(nurGt.every((z) => z.organisation === 'gt')).toBe(true);
      expect(await ladeVerwaltungsListe(false, [])).toEqual([]);
      expect((await ladeVerwaltungsListe(false, null)).map((z) => z.id)).toEqual(expect.arrayContaining([gt, kt, allgemein]));
    });
  });

  describe('Administration (Kontrollfälle zu den Negativtests)', () => {
    it('legt Ankündigungen in allen Organisationen an', async () => {
      await alsAdministration();
      for (const organisation of ['at', 'kt', 'gt', 'kgt'] as const) {
        const id = await anlegen(eingabe(`V04 Admin ${organisation}`, { organisation }));
        expect((await zeile(id))?.organisation).toBe(organisation);
      }
    });

    it('bearbeitet eine KT-Ankündigung und löscht sie über den Papierkorb endgültig', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('V04 Admin KT', { organisation: 'kt' }));
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 Admin KT geaendert', { id, organisation: 'kt' })))).toEqual({
        gespeichert: expect.any(Number),
      });
      await inPapierkorb(formular({ id }));
      await endgueltigLoeschen(formular({ id }));
      expect(await zeile(id)).toBeUndefined();
    });
  });

  describe('Angemeldet ohne Rolle', () => {
    it('speichern liefert keinRecht und Papierkorb-Aktionen werfen KEIN_RECHT', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('V04 Ohne Rolle Bestand'));
      await angemeldetAls([]);
      const vorher = await alleZeilen();
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 Ohne Rolle anlegen')))).toEqual({ fehler: 'keinRecht' });
      await expect(inPapierkorb(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
    });
  });
});

describe('Verwaltung › Ankündigungen › Eingabe, Link und Laufzeit', () => {
  it('leerer Titel liefert feldFehler titelDe pflicht und legt nichts an', async () => {
    await alsRedaktion();
    const vorher = await alleZeilen();
    expect(await speichereAnkuendigung({}, formular(eingabe('')))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { titelDe: 'pflicht' },
      werte: { titelDe: '' },
    });
    expect(await alleZeilen()).toEqual(vorher);
  });

  it('fehlender Titel und fehlender Text liefern jeweils pflicht', async () => {
    await alsRedaktion();
    expect(await speichereAnkuendigung({}, formular({ inhaltDe: 'Text ohne Titel' }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { titelDe: 'pflicht' },
    });
    expect(await speichereAnkuendigung({}, formular({ titelDe: 'Titel ohne Text' }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { inhaltDe: 'pflicht' },
    });
  });

  it('Text über 500 Zeichen wird abgelehnt, genau 500 Zeichen werden angenommen', async () => {
    await alsRedaktion();
    const vorher = await alleZeilen();
    expect(await speichereAnkuendigung({}, formular(eingabe('V04 Text zu lang', { inhaltDe: 'x'.repeat(501) })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { inhaltDe: 'zuLang' },
    });
    expect(await alleZeilen()).toEqual(vorher);
    const id = await anlegen(eingabe('V04 Text genau 500', { inhaltDe: 'x'.repeat(500) }));
    expect((await zeile(id))?.inhalt.de).toHaveLength(500);
  });

  it('Titel über 120 Zeichen wird abgelehnt', async () => {
    await alsRedaktion();
    expect(await speichereAnkuendigung({}, formular(eingabe('T'.repeat(121))))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { titelDe: 'zuLang' },
    });
  });

  it('Uhrzeit ohne Datum wird abgelehnt', async () => {
    await alsRedaktion();
    expect(await speichereAnkuendigung({}, formular(eingabe('V04 Uhrzeit ohne Datum', { sichtbarAbZeit: '08:00' })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { sichtbarAbDatum: 'datumFehlt' },
    });
  });

  it('ungültiges Kalenderdatum (30. Februar) wird abgelehnt', async () => {
    await alsRedaktion();
    expect(await speichereAnkuendigung({}, formular(eingabe('V04 Kein Kalendertag', { sichtbarAbDatum: '2026-02-30' })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { sichtbarAbDatum: 'datum' },
    });
  });

  it('Ende gleich oder vor dem Beginn liefert feldFehler laeuftAbDatum laufzeit und legt nichts an', async () => {
    await alsRedaktion();
    const vorher = await alleZeilen();
    const beginn = { sichtbarAbDatum: '2026-11-10', sichtbarAbZeit: '08:00' };
    expect(
      await speichereAnkuendigung(
        {},
        formular(eingabe('V04 Laufzeit gleich', { ...beginn, laeuftAbDatum: '2026-11-10', laeuftAbZeit: '08:00' })),
      ),
    ).toMatchObject({ fehler: 'pruefen', feldFehler: { laeuftAbDatum: 'laufzeit' } });
    expect(
      await speichereAnkuendigung(
        {},
        formular(eingabe('V04 Laufzeit vorher', { ...beginn, laeuftAbDatum: '2026-11-10', laeuftAbZeit: '07:59' })),
      ),
    ).toMatchObject({ fehler: 'pruefen', feldFehler: { laeuftAbDatum: 'laufzeit' } });
    expect(await alleZeilen()).toEqual(vorher);
  });

  it('Beginn und Ende mit Uhrzeit werden als Berliner Wanduhrzeit gespeichert', async () => {
    await alsRedaktion();
    const id = await anlegen(
      eingabe('V04 Berliner Zeit', {
        sichtbarAbDatum: '2026-11-10',
        sichtbarAbZeit: '08:00',
        laeuftAbDatum: '2026-11-12',
        laeuftAbZeit: '18:30',
      }),
    );
    const gespeichert = await zeile(id);
    expect(gespeichert?.sichtbarAb).toEqual(new Date('2026-11-10T08:00:00+01:00'));
    expect(gespeichert?.laeuftAb).toEqual(new Date('2026-11-12T18:30:00+01:00'));
  });

  it('ohne Uhrzeit gilt 00:00 Uhr am Beginn und 23:59 Uhr am Ablauftag', async () => {
    await alsRedaktion();
    const id = await anlegen(eingabe('V04 Ohne Uhrzeit', { sichtbarAbDatum: '2026-11-10', laeuftAbDatum: '2026-11-12' }));
    const gespeichert = await zeile(id);
    expect(gespeichert?.sichtbarAb).toEqual(new Date('2026-11-10T00:00:00+01:00'));
    expect(gespeichert?.laeuftAb).toEqual(new Date('2026-11-12T23:59:00+01:00'));
  });

  it('ohne Datum bleiben Beginn und Ende offen (NULL)', async () => {
    await alsRedaktion();
    const id = await anlegen(eingabe('V04 Offen'));
    expect((await zeile(id))?.sichtbarAb).toBeNull();
    expect((await zeile(id))?.laeuftAb).toBeNull();
  });

  it('unerlaubte Links werden abgelehnt und legen nichts an', async () => {
    await alsRedaktion();
    const vorher = await alleZeilen();
    for (const link of [
      'javascript:alert(1)',
      '//evil.example/x',
      'http://example.test/seite',
      'data:text/html,Hallo',
      '/\\evil.example',
    ]) {
      expect(await speichereAnkuendigung({}, formular(eingabe('V04 Unerlaubter Link', { link })))).toMatchObject({
        fehler: 'pruefen',
        feldFehler: { link: 'link' },
      });
    }
    expect(await alleZeilen()).toEqual(vorher);
  });

  it('erlaubte Links werden gespeichert: https, mailto und ein Pfad der Website', async () => {
    await alsRedaktion();
    for (const link of ['https://example.test/seite', 'mailto:verwaltung@example.test', '/veranstaltungen']) {
      const id = await anlegen(eingabe('V04 Erlaubter Link', { link }));
      expect((await zeile(id))?.link).toBe(link);
    }
  });

  it('ein Eintrag im Papierkorb lässt sich über eine direkte Anfrage nicht speichern', async () => {
    await alsRedaktion();
    const id = await anlegen(eingabe('V04 Papierkorb nicht speichern'));
    await inPapierkorb(formular({ id }));
    const vorher = await alleZeilen();
    expect(await speichereAnkuendigung({}, formular(eingabe('V04 Papierkorb geaendert', { id })))).toMatchObject({
      fehler: 'imPapierkorb',
    });
    expect(await alleZeilen()).toEqual(vorher);
  });

  it('unbekannte ID liefert nichtGefunden', async () => {
    await alsRedaktion();
    expect(
      await speichereAnkuendigung({}, formular(eingabe('V04 Unbekannt', { id: '6f0c9a2e-3b1d-4c5e-8f70-112233445566' }))),
    ).toMatchObject({ fehler: 'nichtGefunden' });
  });
});

describe('Verwaltung › Ankündigungen › Cache', () => {
  it('Anlegen ruft updateTag mit ankuendigungen auf und plant genau eine Nachlauf-Invalidierung (Veröffentlichen: dazu die Benachrichtigung)', async () => {
    await alsRedaktion();
    await anlegen(eingabe('V04 Cache anlegen', { status: 'entwurf' }));
    expect(aufrufe.updateTag).toEqual(['ankuendigungen']);
    expect(aufrufe.nachher).toHaveLength(1);
    // ADR 0034: Beim Veröffentlichen folgt nach der Antwort zusätzlich der Push „Ankündigung“ (push-ankuendigung.test.ts)
    await alsRedaktion();
    await anlegen(eingabe('V04 Cache veröffentlichen'));
    expect(aufrufe.updateTag).toEqual(['ankuendigungen']);
    expect(aufrufe.nachher).toHaveLength(2);
  });

  it('Papierkorb und Wiederherstellen rufen updateTag mit ankuendigungen auf', async () => {
    await alsRedaktion();
    const id = await anlegen(eingabe('V04 Cache Papierkorb'));
    aufrufe.updateTag.length = 0;
    await inPapierkorb(formular({ id }));
    expect(aufrufe.updateTag).toEqual(['ankuendigungen']);
    aufrufe.updateTag.length = 0;
    await wiederherstellen(formular({ id }));
    expect(aufrufe.updateTag).toEqual(['ankuendigungen']);
  });

  it('ein Validierungsfehler ruft keinen Cache-Tag auf', async () => {
    await alsRedaktion();
    await speichereAnkuendigung({}, formular(eingabe('')));
    expect(aufrufe.updateTag).toEqual([]);
  });
});

describe('Zustand der Ankündigung (zustandAm)', () => {
  const beginn = new Date('2026-11-10T08:00:00+01:00');
  const ende = new Date('2026-11-20T23:59:00+01:00');
  const mitten = new Date('2026-11-15T12:00:00+01:00');

  it('ein Entwurf bleibt Entwurf, auch innerhalb der Laufzeit', () => {
    expect(zustandAm({ status: 'entwurf', sichtbarAb: beginn, laeuftAb: ende }, mitten)).toBe('entwurf');
  });

  it('veröffentlicht vor dem Beginn ist geplant', () => {
    expect(zustandAm({ status: 'veroeffentlicht', sichtbarAb: beginn, laeuftAb: ende }, new Date('2026-11-01T10:00:00+01:00'))).toBe(
      'geplant',
    );
  });

  it('genau zum Beginn und innerhalb der Laufzeit ist aktiv', () => {
    expect(zustandAm({ status: 'veroeffentlicht', sichtbarAb: beginn, laeuftAb: ende }, beginn)).toBe('aktiv');
    expect(zustandAm({ status: 'veroeffentlicht', sichtbarAb: beginn, laeuftAb: ende }, mitten)).toBe('aktiv');
  });

  it('genau zum Ende ist abgelaufen, ohne Beginn und Ende ist veröffentlicht sofort aktiv', () => {
    expect(zustandAm({ status: 'veroeffentlicht', sichtbarAb: beginn, laeuftAb: ende }, ende)).toBe('abgelaufen');
    expect(zustandAm({ status: 'veroeffentlicht', sichtbarAb: null, laeuftAb: null }, mitten)).toBe('aktiv');
  });
});

describe('Verwaltung › Ankündigungen › Laufzeitfilter der öffentlichen Abfrage (E-033)', () => {
  const zeitpunkt = {
    vor: new Date('2026-11-01T10:00:00+01:00'),
    genauBeginn: new Date('2026-11-10T08:00:00+01:00'),
    waehrend: new Date('2026-11-15T12:00:00+01:00'),
    genauEnde: new Date('2026-11-20T23:59:00+01:00'),
    nachher: new Date('2026-11-21T00:00:00+01:00'),
  };

  beforeAll(async () => {
    await db.insert(schema.ankuendigung).values([
      {
        titel: { de: 'F-zeitfenster' },
        inhalt: { de: 'Sichtbar vom 10. bis 20. November.' },
        status: 'veroeffentlicht',
        prioritaet: 'mittel',
        sichtbarAb: new Date('2026-11-10T08:00:00+01:00'),
        laeuftAb: new Date('2026-11-20T23:59:00+01:00'),
      },
      {
        titel: { de: 'F-offen' },
        inhalt: { de: 'Ohne Beginn und ohne Ende.' },
        status: 'veroeffentlicht',
        prioritaet: 'niedrig',
      },
      {
        titel: { de: 'F-hoch-frueh' },
        inhalt: { de: 'Hohe Priorität, Beginn am 11. November.' },
        status: 'veroeffentlicht',
        prioritaet: 'hoch',
        sichtbarAb: new Date('2026-11-11T08:00:00+01:00'),
      },
      {
        titel: { de: 'F-hoch-spaet' },
        inhalt: { de: 'Hohe Priorität, Beginn am 12. November.' },
        status: 'veroeffentlicht',
        prioritaet: 'hoch',
        sichtbarAb: new Date('2026-11-12T08:00:00+01:00'),
      },
      { titel: { de: 'F-entwurf' }, inhalt: { de: 'Nur ein Entwurf.' }, status: 'entwurf', prioritaet: 'hoch' },
      {
        titel: { de: 'F-papierkorb' },
        inhalt: { de: 'Im Papierkorb.' },
        status: 'veroeffentlicht',
        prioritaet: 'hoch',
        imPapierkorbSeit: new Date(),
      },
    ]);
  });

  /** Titel der Testdatensätze dieses Blocks in Anzeigereihenfolge (fremde Testdaten bleiben außen vor). */
  async function sichtbar(jetzt: Date): Promise<string[]> {
    return (await sichtbareAnkuendigungen(jetzt)).map((a) => a.titel.de).filter((t) => t.startsWith('F-'));
  }

  it('vor dem Beginn ist nur die offene Ankündigung sichtbar', async () => {
    expect(await sichtbar(zeitpunkt.vor)).toEqual(['F-offen']);
  });

  it('genau zum Beginn ist die Ankündigung sichtbar (sichtbarAb ≤ jetzt)', async () => {
    expect(await sichtbar(zeitpunkt.genauBeginn)).toEqual(['F-zeitfenster', 'F-offen']);
  });

  it('während der Laufzeit: Priorität hoch zuerst, innerhalb der Stufe die neueste zuerst', async () => {
    expect(await sichtbar(zeitpunkt.waehrend)).toEqual(['F-hoch-spaet', 'F-hoch-frueh', 'F-zeitfenster', 'F-offen']);
  });

  it('genau zum Ende ist die Ankündigung nicht mehr sichtbar (jetzt < laeuftAb)', async () => {
    expect(await sichtbar(zeitpunkt.genauEnde)).toEqual(['F-hoch-spaet', 'F-hoch-frueh', 'F-offen']);
  });

  it('nach dem Ende bleibt sie ausgeblendet', async () => {
    expect(await sichtbar(zeitpunkt.nachher)).toEqual(['F-hoch-spaet', 'F-hoch-frueh', 'F-offen']);
  });

  it('Entwürfe und Einträge im Papierkorb sind zu keinem Zeitpunkt sichtbar', async () => {
    for (const jetzt of Object.values(zeitpunkt)) {
      const titel = await sichtbar(jetzt);
      expect(titel).not.toContain('F-entwurf');
      expect(titel).not.toContain('F-papierkorb');
    }
  });

  it('die Verwaltungsliste ordnet aktuelle Ankündigungen nach Zustand, Entwürfe danach, Papierkorb getrennt', async () => {
    const titel = (await ladeVerwaltungsListe(false, null, zeitpunkt.vor)).map((z) => z.titel);
    const lage = (t: string) => titel.indexOf(t);
    expect(lage('F-offen')).toBeLessThan(lage('F-hoch-frueh'));
    expect(lage('F-hoch-frueh')).toBeLessThan(lage('F-zeitfenster'));
    expect(lage('F-zeitfenster')).toBeLessThan(lage('F-entwurf'));
    expect(titel).not.toContain('F-papierkorb');
    const papierkorb = (await ladeVerwaltungsListe(true, null, zeitpunkt.vor)).map((z) => z.titel);
    expect(papierkorb).toContain('F-papierkorb');
    expect(papierkorb).not.toContain('F-offen');
  });
});
