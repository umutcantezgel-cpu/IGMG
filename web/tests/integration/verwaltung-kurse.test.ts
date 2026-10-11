import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { darf, type RollenZuweisung } from '@/lib/rechte/matrix';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Integrationstests „Verwaltung › Kurse“ (V06, K-02, K-05, K-06, K-07). Geprüft werden die Server Actions speichereKurs,
 * inPapierkorb, wiederherstellen und endgueltigLoeschen sowie die Abfragen ladeKursListe, ladeKursFuerVerwaltung und die
 * öffentliche Abfrage ladeKurse: Rechte je Rolle, Validierung, Anlegen und Ändern, Veröffentlichen, Papierkorb, Audit.
 * Testdaten sind erkennbar fiktiv (G-04).
 */
const { client, db } = await verwaltungsUmgebung();
const { speichereKurs, inPapierkorb, wiederherstellen, endgueltigLoeschen } = await import('@/server/actions/kurse');
const { ladeKursListe, ladeKursFuerVerwaltung } = await import('@/server/queries/verwaltung/kurse');
const { ladeKurse } = await import('@/server/queries/kurse');
afterAll(() => client.close());

type Werte = Record<string, string | string[]>;

/** Gültige Eingabe: nur der deutsche Titel ist Pflicht; `zusatz` überschreibt einzelne Felder. */
function eingabe(titel: string, zusatz: Werte = {}): Werte {
  return { titelDe: titel, ...zusatz };
}

const alsAdministration = (zweiFaktor = true) => angemeldetAls([{ rolle: 'administration' }], zweiFaktor);
const alsBildung = () => angemeldetAls([{ rolle: 'bildung' }]);

/** Legt über die Action an. Das Anlegen endet mit einer Weiterleitung, deren Ziel die neue ID trägt. */
async function anlegen(werte: Werte): Promise<string> {
  const ergebnis: unknown = await speichereKurs({}, formular(werte)).catch((e: unknown) => e);
  const ziel = (ergebnis as { ziel?: string } | null)?.ziel ?? '';
  const treffer = /^\/verwaltung\/kurse\/([0-9a-f-]{36})\?angelegt=1$/.exec(ziel);
  expect(treffer, `Anlegen endete ohne Weiterleitung: ${ziel || 'kein Ziel'}`).not.toBeNull();
  return treffer![1];
}

/** Kurs per ID; undefined, wenn es ihn nicht gibt. */
async function zeile(id: string) {
  const [treffer] = await db.select().from(schema.kurs).where(eq(schema.kurs.id, id)).limit(1);
  return treffer;
}

/** Alle Kurse in fester Reihenfolge (Grundlage für „Datenbank unverändert“). */
function alleZeilen() {
  return db.select().from(schema.kurs).orderBy(schema.kurs.id);
}

/** Audit-Aktionen zu einem Kurs in Schreibreihenfolge. */
async function auditAktionen(id: string): Promise<string[]> {
  const eintraege = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id)).orderBy(schema.auditEintrag.id);
  return eintraege.map((e) => e.aktion);
}

/** Rollen ohne Kursrecht: Sie dürfen weder speichern noch in den Papierkorb legen, wiederherstellen oder löschen. */
const ohneKursrecht: { name: string; rollen: RollenZuweisung[] }[] = [
  { name: 'Redaktion', rollen: [{ rolle: 'redaktion' }] },
  { name: 'Organisationsredaktion GT', rollen: [{ rolle: 'organisationsredaktion', organisation: 'gt' }] },
  { name: 'Mitgliederverwaltung', rollen: [{ rolle: 'mitgliederverwaltung' }] },
  { name: 'ohne Rolle', rollen: [] },
];

describe('Verwaltung › Kurse › Rechte je Rolle (K-06)', () => {
  it('Matrix: nur Administration und Bildung haben kurs.lesen, kurs.bearbeiten und kurs.loeschen', () => {
    for (const rolle of ['administration', 'bildung'] as const) {
      expect(darf([{ rolle }], 'kurs.lesen')).toBe(true);
      expect(darf([{ rolle }], 'kurs.bearbeiten')).toBe(true);
      expect(darf([{ rolle }], 'kurs.loeschen')).toBe(true);
    }
    for (const rolle of ['redaktion', 'organisationsredaktion', 'mitgliederverwaltung'] as const) {
      expect(darf([{ rolle, organisation: 'gt' }], 'kurs.lesen')).toBe(false);
    }
  });

  it('ohne Anmeldung: speichern liefert keinRecht, Papierkorb-Aktionen werfen KEIN_RECHT, nichts ändert sich', async () => {
    await alsBildung();
    const id = await anlegen(eingabe('V06 Ohne Anmeldung'));
    await angemeldetAls(null);
    const vorher = await alleZeilen();
    expect(await speichereKurs({}, formular(eingabe('V06 Ohne Anmeldung geaendert', { id })))).toEqual({ fehler: 'keinRecht' });
    await expect(inPapierkorb(formular({ id }))).rejects.toThrow('KEIN_RECHT');
    await expect(wiederherstellen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
    await expect(endgueltigLoeschen(formular({ id }))).rejects.toThrow('KEIN_RECHT');
    expect(await alleZeilen()).toEqual(vorher);
  });

  it('angemeldet ohne zweiten Faktor: auch mit Administrationsrolle keine Änderung und kein Cache-Aufruf', async () => {
    await alsAdministration();
    const id = await anlegen(eingabe('V06 Zweiter Faktor'));
    await alsAdministration(false);
    const vorher = await alleZeilen();
    expect(await speichereKurs({}, formular(eingabe('V06 Zweiter Faktor geaendert', { id })))).toEqual({ fehler: 'keinRecht' });
    await expect(inPapierkorb(formular({ id }))).rejects.toThrow('KEIN_RECHT');
    expect(await alleZeilen()).toEqual(vorher);
    expect(aufrufe.updateTag).toEqual([]);
  });

  for (const { name, rollen } of ohneKursrecht) {
    it(`${name}: speichern liefert keinRecht, Papierkorb-Aktionen werfen KEIN_RECHT, die Datenbank bleibt unverändert`, async () => {
      await alsAdministration();
      const id = await anlegen(eingabe(`V06 ${name} Bestand`));
      const imPapierkorb = await anlegen(eingabe(`V06 ${name} Papierkorb`));
      await inPapierkorb(formular({ id: imPapierkorb }));
      await angemeldetAls(rollen);
      const vorher = await alleZeilen();
      expect(await speichereKurs({}, formular(eingabe(`V06 ${name} neu`)))).toEqual({ fehler: 'keinRecht' });
      expect(await speichereKurs({}, formular(eingabe(`V06 ${name} geaendert`, { id })))).toEqual({ fehler: 'keinRecht' });
      await expect(inPapierkorb(formular({ id }))).rejects.toThrow('KEIN_RECHT');
      await expect(wiederherstellen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
      await expect(endgueltigLoeschen(formular({ id: imPapierkorb }))).rejects.toThrow('KEIN_RECHT');
      expect(await alleZeilen()).toEqual(vorher);
    });
  }

  it('Bildung: anlegen, ändern, in den Papierkorb legen, wiederherstellen und endgültig löschen', async () => {
    const benutzer = await alsBildung();
    const id = await anlegen(eingabe('V06 Bildung Lebenszyklus'));
    expect((await zeile(id))?.erstelltVon).toBe(benutzer);
    expect(await speichereKurs({}, formular(eingabe('V06 Bildung geaendert', { id })))).toEqual({ gespeichert: expect.any(Number) });
    await inPapierkorb(formular({ id }));
    await wiederherstellen(formular({ id }));
    await inPapierkorb(formular({ id }));
    await endgueltigLoeschen(formular({ id }));
    expect(await zeile(id)).toBeUndefined();
  });

  it('Administration: dieselben Rechte; Kurse sind nicht organisationsgebunden', async () => {
    await alsAdministration();
    const id = await anlegen(eingabe('V06 Admin Kurs'));
    expect(await speichereKurs({}, formular(eingabe('V06 Admin Kurs geaendert', { id })))).toEqual({ gespeichert: expect.any(Number) });
    await inPapierkorb(formular({ id }));
    await endgueltigLoeschen(formular({ id }));
    expect(await zeile(id)).toBeUndefined();
  });
});

describe('Verwaltung › Kurse › Validierung (K-02, K-07)', () => {
  it('leerer Titel: feldFehler titelDe „pflicht“, Eingaben bleiben in werte, nichts wird angelegt', async () => {
    await alsBildung();
    const vorher = await alleZeilen();
    expect(await speichereKurs({}, formular(eingabe('', { zielgruppeDe: 'Testgruppe Eins' })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { titelDe: 'pflicht' },
      werte: { titelDe: '', zielgruppeDe: 'Testgruppe Eins' },
    });
    expect(await alleZeilen()).toEqual(vorher);
  });

  it('fehlender Titel (Schlüssel fehlt ganz) liefert ebenfalls „pflicht“', async () => {
    await alsBildung();
    const vorher = await alleZeilen();
    expect(await speichereKurs({}, formular({ zielgruppeDe: 'Testgruppe Eins' }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { titelDe: 'pflicht' },
    });
    expect(await alleZeilen()).toEqual(vorher);
  });

  it('Übersetzung ohne deutschen Text liefert deFehlt am deutschen Feld und legt nichts an', async () => {
    await alsBildung();
    const vorher = await alleZeilen();
    expect(await speichereKurs({}, formular(eingabe('V06 Ohne Deutsch', { beschreibungTr: 'Testtext in Türkisch' })))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { beschreibungDe: 'deFehlt' },
    });
    expect(await alleZeilen()).toEqual(vorher);
  });

  it('Inhaltsliste: Übersetzung mit anderer Zeilenzahl liefert uebersetzungZeilen; gleiche Zahl wird angelegt', async () => {
    await alsBildung();
    const vorher = await alleZeilen();
    expect(
      await speichereKurs({}, formular(eingabe('V06 Zeilen ungleich', { inhalteDe: 'Tajwid\nHifz', inhalteTr: 'Tecvid' }))),
    ).toMatchObject({ fehler: 'pruefen', feldFehler: { inhalteTr: 'uebersetzungZeilen' } });
    expect(await alleZeilen()).toEqual(vorher);
    const id = await anlegen(eingabe('V06 Zeilen gleich', { inhalteDe: 'Tajwid\nHifz', inhalteTr: 'Tecvid\r\nHifz-TR' }));
    expect((await zeile(id))?.inhalte).toEqual([
      { de: 'Tajwid', tr: 'Tecvid' },
      { de: 'Hifz', tr: 'Hifz-TR' },
    ]);
  });

  it('ungültige Auswahl und Zahlen: verfuegbarkeit, status, plaetze, sortierung und slug liefern je einen Fehlerschlüssel', async () => {
    await alsBildung();
    const vorher = await alleZeilen();
    expect(await speichereKurs({}, formular(eingabe('V06 Ungueltig', { verfuegbarkeit: 'offen' })))).toMatchObject({
      feldFehler: { verfuegbarkeit: 'ungueltig' },
    });
    expect(await speichereKurs({}, formular(eingabe('V06 Ungueltig', { status: 'archiviert' })))).toMatchObject({
      feldFehler: { status: 'ungueltig' },
    });
    expect(await speichereKurs({}, formular(eingabe('V06 Ungueltig', { plaetze: '0' })))).toMatchObject({
      feldFehler: { plaetze: 'zahl' },
    });
    expect(await speichereKurs({}, formular(eingabe('V06 Ungueltig', { plaetze: 'viele' })))).toMatchObject({
      feldFehler: { plaetze: 'zahl' },
    });
    expect(await speichereKurs({}, formular(eingabe('V06 Ungueltig', { sortierung: '-1' })))).toMatchObject({
      feldFehler: { sortierung: 'zahl' },
    });
    expect(await speichereKurs({}, formular(eingabe('V06 Ungueltig', { slug: 'Kurs Eins' })))).toMatchObject({
      feldFehler: { slug: 'slug' },
    });
    expect(await speichereKurs({}, formular({ id: 'nicht-uuid', titelDe: 'V06 Ungueltige ID' }))).toMatchObject({
      fehler: 'pruefen',
      feldFehler: { id: 'ungueltig' },
    });
    expect(await alleZeilen()).toEqual(vorher);
  });
});

describe('Verwaltung › Kurse › Anlegen und Ändern (V06)', () => {
  it('legt alle Angaben ab: mehrsprachige Texte, Liste, Zahlen, Schalter und Adresse aus dem Titel', async () => {
    const benutzer = await alsBildung();
    const id = await anlegen(
      eingabe('V06 Alles Testkurs Ä', {
        titelTr: 'Test Kursu',
        titelEn: 'Test course',
        beschreibungDe: 'Erster Absatz.\r\n\r\nZweiter Absatz.',
        zielgruppeDe: 'Testgruppe Eins',
        alterDe: '6 bis 12 Jahre',
        zeitenDe: 'Samstag 13:00 bis 15:00 Uhr',
        zeitenEn: 'Saturday 1:00 to 3:00 PM',
        dauerDe: '2 Stunden',
        ortDe: 'Testraum',
        leitungDe: '[Name der Lehrkraft]',
        kostenDe: 'Kostenlos',
        hinweisDe: 'Testhinweis',
        inhalteDe: 'Tajwid\n\nHifz',
        inhalteTr: 'Tecvid\nHifz-TR',
        plaetze: '12',
        verfuegbarkeit: 'ohne_anmeldung',
        empfohlen: 'on',
        sortierung: '5',
        status: 'entwurf',
      }),
    );
    const z = await zeile(id);
    expect(z).toMatchObject({
      slug: 'v06-alles-testkurs-ae',
      titel: { de: 'V06 Alles Testkurs Ä', tr: 'Test Kursu', en: 'Test course' },
      beschreibung: { de: 'Erster Absatz.\n\nZweiter Absatz.' },
      zielgruppe: { de: 'Testgruppe Eins' },
      alter: { de: '6 bis 12 Jahre' },
      zeiten: { de: 'Samstag 13:00 bis 15:00 Uhr', en: 'Saturday 1:00 to 3:00 PM' },
      dauer: { de: '2 Stunden' },
      ort: { de: 'Testraum' },
      leitung: { de: '[Name der Lehrkraft]' },
      kosten: { de: 'Kostenlos' },
      hinweis: { de: 'Testhinweis' },
      plaetze: 12,
      verfuegbarkeit: 'ohne_anmeldung',
      empfohlen: true,
      sortierung: 5,
      status: 'entwurf',
      bildId: null,
      erstelltVon: benutzer,
      aktualisiertVon: benutzer,
    });
    expect(z?.inhalte).toEqual([
      { de: 'Tajwid', tr: 'Tecvid' },
      { de: 'Hifz', tr: 'Hifz-TR' },
    ]);
  });

  it('ohne Angaben: nicht gefüllte Felder bleiben leer, Standardwerte gelten', async () => {
    await alsBildung();
    const id = await anlegen(eingabe('V06 Nur Titel'));
    expect(await zeile(id)).toMatchObject({
      beschreibung: null,
      zielgruppe: null,
      plaetze: null,
      verfuegbarkeit: 'voranmeldung',
      sortierung: 0,
      empfohlen: false,
      status: 'entwurf',
      inhalte: [],
    });
  });

  it('gleicher Titel ergibt eine zweite, eindeutige Adresse; Bearbeiten ohne Adressänderung behält sie', async () => {
    await alsBildung();
    const erste = await anlegen(eingabe('V06 Adresse Kurs'));
    const zweite = await anlegen(eingabe('V06 Adresse Kurs'));
    expect((await zeile(erste))?.slug).toBe('v06-adresse-kurs');
    expect((await zeile(zweite))?.slug).toBe('v06-adresse-kurs-2');
    await speichereKurs({}, formular(eingabe('V06 Adresse Kurs geaendert', { id: zweite })));
    expect((await zeile(zweite))?.slug).toBe('v06-adresse-kurs-2');
  });

  it('Bearbeiten: protokolliert inhalt.geaendert, lässt den Status stehen und ruft updateTag mit kurse auf', async () => {
    await alsBildung();
    const id = await anlegen(eingabe('V06 Bearbeiten'));
    await alsBildung();
    expect(await speichereKurs({}, formular(eingabe('V06 Bearbeitet', { id })))).toEqual({ gespeichert: expect.any(Number) });
    expect((await zeile(id))?.titel).toMatchObject({ de: 'V06 Bearbeitet' });
    expect((await zeile(id))?.status).toBe('entwurf');
    expect(await auditAktionen(id)).toEqual(['inhalt.angelegt', 'inhalt.geaendert']);
    expect(aufrufe.updateTag).toEqual(['kurse']);
    expect(aufrufe.nachher).toHaveLength(1);
  });

  it('Anlegen ruft updateTag mit kurse auf und plant genau eine Nachlauf-Invalidierung', async () => {
    await alsBildung();
    await anlegen(eingabe('V06 Cache anlegen'));
    expect(aufrufe.updateTag).toEqual(['kurse']);
    expect(aufrufe.nachher).toHaveLength(1);
    expect(aufrufe.revalidateTag).toEqual([]);
  });
});

describe('Verwaltung › Kurse › Veröffentlichen und Papierkorb (K-05)', () => {
  it('Entwurf erscheint nicht auf der öffentlichen Seite; Veröffentlichen zeigt ihn mit dem Anmeldeweg der Verfügbarkeit', async () => {
    await alsBildung();
    const id = await anlegen(eingabe('V06 Oeffentlich Register', { verfuegbarkeit: 'voranmeldung', zeitenDe: 'Samstag' }));
    expect((await ladeKurse()).map((k) => k.id)).not.toContain(id);
    // Ein gesendetes Formular ersetzt alle Felder: die Zeiten müssen beim Veröffentlichen erneut mitgeschickt werden.
    await speichereKurs(
      {},
      formular(eingabe('V06 Oeffentlich Register', { id, verfuegbarkeit: 'voranmeldung', zeitenDe: 'Samstag', status: 'veroeffentlicht' })),
    );
    expect((await ladeKurse()).find((k) => k.id === id)).toMatchObject({
      titel: { de: 'V06 Oeffentlich Register' },
      zeiten: { de: 'Samstag' },
      anmeldeweg: 'register',
    });
    expect(await auditAktionen(id)).toEqual(['inhalt.angelegt', 'inhalt.geaendert', 'inhalt.veroeffentlicht']);
  });

  it('Verfügbarkeit „ohne Anmeldung“ ergibt join, „geschlossen“ ergibt closed', async () => {
    await alsBildung();
    const offen = await anlegen(eingabe('V06 Join', { verfuegbarkeit: 'ohne_anmeldung', status: 'veroeffentlicht' }));
    const zu = await anlegen(eingabe('V06 Geschlossen', { verfuegbarkeit: 'geschlossen', status: 'veroeffentlicht' }));
    const kurse = await ladeKurse();
    expect(kurse.find((k) => k.id === offen)?.anmeldeweg).toBe('join');
    expect(kurse.find((k) => k.id === zu)?.anmeldeweg).toBe('closed');
  });

  it('Reihenfolge: veröffentlichte Kurse erscheinen nach Sortierung', async () => {
    await alsBildung();
    const spaet = await anlegen(eingabe('V06 Reihenfolge spaet', { sortierung: '20', status: 'veroeffentlicht' }));
    const frueh = await anlegen(eingabe('V06 Reihenfolge frueh', { sortierung: '10', status: 'veroeffentlicht' }));
    const reihenfolge = (await ladeKurse()).map((k) => k.id).filter((x) => x === frueh || x === spaet);
    expect(reihenfolge).toEqual([frueh, spaet]);
  });

  it('Papierkorb: nicht öffentlich und in der Papierkorb-Liste; Wiederherstellen macht wieder öffentlich', async () => {
    await alsBildung();
    const id = await anlegen(eingabe('V06 Papierkorb oeffentlich', { status: 'veroeffentlicht' }));
    expect((await ladeKurse()).some((k) => k.id === id)).toBe(true);
    await inPapierkorb(formular({ id }));
    expect((await ladeKurse()).some((k) => k.id === id)).toBe(false);
    expect((await ladeKursListe(true)).some((z) => z.id === id)).toBe(true);
    expect((await ladeKursListe(false)).some((z) => z.id === id)).toBe(false);
    await wiederherstellen(formular({ id }));
    expect((await ladeKurse()).some((k) => k.id === id)).toBe(true);
    expect(await auditAktionen(id)).toEqual(['inhalt.angelegt', 'inhalt.veroeffentlicht', 'inhalt.papierkorb', 'inhalt.wiederhergestellt']);
  });

  it('im Papierkorb lässt sich nichts ändern; endgültig löschen gelingt nur aus dem Papierkorb', async () => {
    await alsBildung();
    const id = await anlegen(eingabe('V06 Papierkorb gesperrt'));
    const andererKurs = await anlegen(eingabe('V06 Nicht im Papierkorb'));
    await inPapierkorb(formular({ id }));
    expect(await speichereKurs({}, formular(eingabe('V06 Papierkorb gesperrt geaendert', { id })))).toMatchObject({
      fehler: 'imPapierkorb',
    });
    expect((await zeile(id))?.titel).toMatchObject({ de: 'V06 Papierkorb gesperrt' });
    await expect(endgueltigLoeschen(formular({ id: andererKurs }))).rejects.toThrow('KEIN_RECHT');
    expect(await zeile(andererKurs)).toBeDefined();
  });

  it('endgültig löschen aus dem Papierkorb entfernt den Kurs und protokolliert inhalt.geloescht', async () => {
    await alsBildung();
    const id = await anlegen(eingabe('V06 Endgueltig'));
    await inPapierkorb(formular({ id }));
    await endgueltigLoeschen(formular({ id }));
    expect(await zeile(id)).toBeUndefined();
    expect(await auditAktionen(id)).toEqual(['inhalt.angelegt', 'inhalt.papierkorb', 'inhalt.geloescht']);
    expect((await ladeKurse()).some((k) => k.id === id)).toBe(false);
  });

  it('unbekannte ID beim Bearbeiten liefert nichtGefunden und legt nichts an', async () => {
    await alsBildung();
    const vorher = await alleZeilen();
    expect(await speichereKurs({}, formular(eingabe('V06 Unbekannt', { id: '00000000-0000-4000-8000-000000000000' })))).toMatchObject({
      fehler: 'nichtGefunden',
    });
    expect(await alleZeilen()).toEqual(vorher);
  });
});

describe('Verwaltung › Kurse › Abfragen der Verwaltung', () => {
  it('ladeKursListe trennt aktive Kurse und Papierkorb und liefert deutsche Texte', async () => {
    await alsBildung();
    const aktiv = await anlegen(eingabe('V06 Liste aktiv', { zielgruppeDe: 'Erwachsene', zeitenDe: 'Montag' }));
    const weg = await anlegen(eingabe('V06 Liste Papierkorb'));
    await inPapierkorb(formular({ id: weg }));
    const aktivListe = await ladeKursListe(false);
    const papierkorbListe = await ladeKursListe(true);
    expect(aktivListe.find((z) => z.id === aktiv)).toMatchObject({
      titel: 'V06 Liste aktiv',
      zielgruppe: 'Erwachsene',
      zeiten: 'Montag',
      status: 'entwurf',
      verfuegbarkeit: 'voranmeldung',
      imPapierkorbSeit: null,
    });
    expect(aktivListe.some((z) => z.id === weg)).toBe(false);
    expect(papierkorbListe.find((z) => z.id === weg)?.imPapierkorbSeit).toBeInstanceOf(Date);
    expect(papierkorbListe.some((z) => z.id === aktiv)).toBe(false);
  });

  it('ladeKursFuerVerwaltung: ungültige oder unbekannte ID ergibt null, bekannte ID den Datensatz', async () => {
    await alsBildung();
    const id = await anlegen(eingabe('V06 Abfrage'));
    expect(await ladeKursFuerVerwaltung('kein-uuid')).toBeNull();
    expect(await ladeKursFuerVerwaltung('00000000-0000-4000-8000-000000000000')).toBeNull();
    expect((await ladeKursFuerVerwaltung(id))?.titel).toMatchObject({ de: 'V06 Abfrage' });
  });
});

describe('Verwaltung › Kurse › Audit ohne Personendaten (G-07)', () => {
  it('Audit-Einträge tragen zielTyp kurs, die handelnde Person und keine Details', async () => {
    const benutzer = await alsBildung();
    const id = await anlegen(eingabe('V06 Audit', { status: 'veroeffentlicht' }));
    await speichereKurs({}, formular(eingabe('V06 Audit geaendert', { id })));
    await inPapierkorb(formular({ id }));
    await endgueltigLoeschen(formular({ id }));
    const eigene = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id)).orderBy(schema.auditEintrag.id);
    expect(eigene.map((e) => e.aktion)).toEqual([
      'inhalt.angelegt',
      'inhalt.veroeffentlicht',
      'inhalt.geaendert',
      'inhalt.papierkorb',
      'inhalt.geloescht',
    ]);
    expect(eigene.every((e) => e.zielTyp === 'kurs' && e.benutzerId === benutzer && e.details === null)).toBe(true);
  });
});
