import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import { kontaktInhalt } from '@/lib/validierung/seiteninhalte';
import { schema as organisationSchema } from '@/lib/validierung/seiteninhalte/organisation';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * C05 (Z-03, K-06, K-07, G-05, G-07): Kontaktdaten und die vier Organisationsseiten. Die Organisationsredaktion ändert
 * nur die eigene Organisation (Recht am Ziel, serverseitig), Redaktion und Administration alle. Die Prüfung läuft über
 * das Schema des Bereichs (Feldfehler mit Pfad), Speichern protokolliert ohne Personendaten und ist sofort öffentlich.
 */
const { client, db } = await verwaltungsUmgebung();
const actions = await import('@/server/actions/seiteninhalte-organisationen');
const q = await import('@/server/queries/verwaltung/seiteninhalte-organisationen');
const oeffentlich = await import('@/server/queries/seiteninhalte');
afterAll(() => client.close());

const kontaktJson = (aenderung: Record<string, unknown> = {}) => JSON.stringify({ ...kontaktInhalt.parse({}), ...aenderung });
const orgJson = (aenderung: Record<string, unknown> = {}) => JSON.stringify({ ...organisationSchema.parse({}), ...aenderung });
const zeileZu = async (bereich: string) => (await db.select().from(schema.seiteninhalt).where(eq(schema.seiteninhalt.bereich, bereich)))[0];
const auditZu = (bereich: string) => db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, bereich));

beforeEach(() => {
  aufrufe.updateTag.length = 0;
});

describe('Vor dem ersten Speichern', () => {
  it('fehlende Zeile: Standardwerte mit Platzhaltern, Verwaltung sieht „Beispielangaben“', async () => {
    const stand = await q.ladeSeiteninhaltFuerVerwaltung('kontakt');
    expect(stand).toMatchObject({ vorhanden: false, istBeispiel: true, lesbar: true });
    expect(stand.inhalt.adresse).toBe('[Adresse]');
    expect(stand.inhalt.oeffnungszeiten).toEqual([]);
  });

  it('unlesbar gespeicherter Inhalt: Standardwerte, lesbar = false', async () => {
    await db
      .insert(schema.seiteninhalt)
      .values({ bereich: 'organisation-kadin-genclik-teskilati', inhalt: { beschreibung: 42 }, istBeispiel: false });
    const stand = await q.ladeSeiteninhaltFuerVerwaltung('organisation-kadin-genclik-teskilati');
    expect(stand).toMatchObject({ vorhanden: true, lesbar: false });
    expect(stand.inhalt.beschreibung).toEqual({ de: '[Beschreibung]' });
  });
});

describe('Kontaktdaten', () => {
  it('Speichern legt die Zeile an, entfernt unbekannte Felder, protokolliert ohne Personendaten und wirkt öffentlich', async () => {
    const id = await angemeldetAls([{ rolle: 'administration' }]);
    const ergebnis = await actions.speichereKontakt(
      {},
      formular({ inhalt: kontaktJson({ adresse: 'Testadresse 1, 00000 Testort', telefon: '+49 000 0000001', rolle: 'administration' }) }),
    );
    expect(ergebnis).toEqual({ gespeichert: expect.any(Number) });
    const zeile = await zeileZu('kontakt');
    expect(zeile).toMatchObject({ bereich: 'kontakt', istBeispiel: false, quelle: 'verwaltung', aktualisiertVon: id });
    expect(zeile.inhalt).toMatchObject({ adresse: 'Testadresse 1, 00000 Testort' });
    expect(zeile.inhalt).not.toHaveProperty('rolle');
    expect(aufrufe.updateTag).toContain('seiteninhalt:kontakt');

    const audit = await auditZu('kontakt');
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ aktion: 'inhalt.geaendert', zielTyp: 'seiteninhalt', benutzerId: id, details: null });

    const oeffentlich1 = await oeffentlich.ladeSeiteninhalt('kontakt');
    expect(oeffentlich1.adresse).toBe('Testadresse 1, 00000 Testort');
    expect(oeffentlich1.istBeispiel).toBe(false);
  });

  it('ungültige Adressen (http, javascript) werden mit Feldfehler am Pfad abgelehnt; nichts wird geändert', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    for (const adresse of ['http://beispiel.example.test/seite', 'javascript:alert(1)']) {
      const ergebnis = await actions.speichereKontakt({}, formular({ inhalt: kontaktJson({ social: { facebook: adresse } }) }));
      expect(ergebnis).toEqual({ fehler: 'pruefen', feldFehler: { 'social.facebook': 'url' } });
    }
    expect(aufrufe.updateTag).toEqual([]);
    expect((await zeileZu('kontakt')).inhalt).not.toHaveProperty('social.facebook');
  });

  it('Koordinaten nur als Zahlen; Deutsch in Öffnungszeiten ist Pflicht', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const koordinaten = await actions.speichereKontakt(
      {},
      formular({ inhalt: kontaktJson({ koordinaten: { breite: 'abc', laenge: 9.7 } }) }),
    );
    expect(koordinaten).toMatchObject({ fehler: 'pruefen', feldFehler: { 'koordinaten.breite': 'zahl' } });
    const zeiten = await actions.speichereKontakt(
      {},
      formular({
        inhalt: kontaktJson({
          oeffnungszeiten: [{ tage: { de: '   ' }, zeiten: '09:00–22:00 Uhr', von: [1], start: '09:00', ende: '22:00' }],
        }),
      }),
    );
    expect(zeiten).toMatchObject({ fehler: 'pruefen', feldFehler: { 'oeffnungszeiten.0.tage.de': 'pflicht' } });
  });

  it('unlesbare Eingabe (kein JSON) wird abgewiesen', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    expect(await actions.speichereKontakt({}, formular({ inhalt: '{kaputt' }))).toEqual({ fehler: 'unlesbar' });
  });

  it('ohne Recht, ohne Anmeldung, ohne zweiten Faktor und für die Organisationsredaktion: keinRecht', async () => {
    await angemeldetAls([{ rolle: 'bildung' }]);
    expect(await actions.speichereKontakt({}, formular({ inhalt: kontaktJson() }))).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls(null);
    expect(await actions.speichereKontakt({}, formular({ inhalt: kontaktJson() }))).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls([{ rolle: 'administration' }], false);
    expect(await actions.speichereKontakt({}, formular({ inhalt: kontaktJson() }))).toEqual({ fehler: 'keinRecht' });
    await angemeldetAls([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
    expect(await actions.speichereKontakt({}, formular({ inhalt: kontaktJson() }))).toEqual({ fehler: 'keinRecht' });
    expect(aufrufe.updateTag).toEqual([]);
  });
});

describe('Organisationen', () => {
  it('Organisationsredaktion GT darf GT, nicht KT (Recht am Ziel in der Action)', async () => {
    await angemeldetAls([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
    const gt = await actions.speichereOrganisation(
      'gt',
      {},
      formular({ inhalt: orgJson({ beschreibung: { de: 'Testbeschreibung GT Eins' } }) }),
    );
    expect(gt).toEqual({ gespeichert: expect.any(Number) });
    const kt = await actions.speichereOrganisation(
      'kt',
      {},
      formular({ inhalt: orgJson({ beschreibung: { de: 'Testbeschreibung KT Eins' } }) }),
    );
    expect(kt).toEqual({ fehler: 'keinRecht' });
    expect(await zeileZu('organisation-kadin-teskilati')).toBeUndefined();
    expect(await zeileZu('organisation-genclik-teskilati')).toMatchObject({ quelle: 'verwaltung' });
  });

  it('Redaktion und Administration dürfen alle vier Organisationen', async () => {
    const rollen: RollenZuweisung[][] = [[{ rolle: 'redaktion' }], [{ rolle: 'administration' }]];
    for (const r of rollen) {
      await angemeldetAls(r);
      for (const org of ['at', 'kt', 'gt', 'kgt'] as const) {
        expect(await actions.speichereOrganisation(org, {}, formular({ inhalt: orgJson() }))).toEqual({ gespeichert: expect.any(Number) });
      }
    }
  });

  it('unbekannte Organisation wird abgewiesen und nichts gespeichert', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    expect(await actions.speichereOrganisation('xx' as never, {}, formular({ inhalt: orgJson() }))).toEqual({ fehler: 'keinRecht' });
  });

  it('Anzahl, Symbol und Textlängen werden nach dem Schema geprüft', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const neun = Array.from({ length: 9 }, () => ({ symbol: 'star', titel: { de: 'Testtitel' }, text: { de: 'Testtext' } }));
    expect(await actions.speichereOrganisation('at', {}, formular({ inhalt: orgJson({ aktivitaeten: neun }) }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { aktivitaeten: 'zuViele' },
    });
    const symbol = [{ symbol: 'rakete', titel: { de: 'Testtitel' }, text: { de: 'Testtext' } }];
    expect(await actions.speichereOrganisation('at', {}, formular({ inhalt: orgJson({ aktivitaeten: symbol }) }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { 'aktivitaeten.0.symbol': 'ungueltig' },
    });
  });

  it('Speichern ist sofort öffentlich lesbar; Cache-Tag und Audit ohne Personendaten', async () => {
    const id = await angemeldetAls([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
    await actions.speichereOrganisation('gt', {}, formular({ inhalt: orgJson({ mission: { de: 'Testmission GT Eins' } }) }));
    expect(aufrufe.updateTag).toContain('seiteninhalt:organisation-genclik-teskilati');
    const oeff = await oeffentlich.ladeSeiteninhalt('organisation-genclik-teskilati');
    expect(oeff.mission.de).toBe('Testmission GT Eins');
    expect(oeff.istBeispiel).toBe(false);
    const audit = await auditZu('organisation-genclik-teskilati');
    expect(audit.at(-1)).toMatchObject({ aktion: 'inhalt.geaendert', zielTyp: 'seiteninhalt', benutzerId: id, details: null });
  });
});
