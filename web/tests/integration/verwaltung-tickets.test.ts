import { and, eq, isNull, like, or } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import type { RollenZuweisung } from '@/lib/rechte/matrix';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Integrationstests der Verwaltung „Tickets“ (V10, K-06, G-07): Recht je Rolle und zweiter Faktor, Status und Priorität
 * nur mit `ticket.bearbeiten`, Organisationsgrenze der Organisationsredaktion in Abfragen und Actions, Kontaktangaben nur
 * mit Recht und mit Audit (ohne Inhalt), Kommentare, Audit ohne Freitext, Filter und Zähler.
 * Jede Testperson meldet sich über die Hilfen der Sitzung an; Datensätze legt jeder Test selbst an.
 */
const { client, db } = await verwaltungsUmgebung();
const actions = await import('@/server/actions/tickets');
const q = await import('@/server/queries/verwaltung/tickets');
const { ladeAngemeldet } = await import('@/lib/rechte/pruefe');
afterAll(() => client.close());

type Werte = Record<string, string | string[]>;

/** Gültige Formulareingabe für das Anlegen; `zusatz` überschreibt einzelne Felder. */
function eingabe(titel: string, zusatz: Werte = {}): Werte {
  return { titel, beschreibung: 'Testbeschreibung für das Ticket', prioritaet: 'mittel', organisation: '', ...zusatz };
}

/** Meldet die Testperson mit diesen Rollen an und liefert den Angemeldeten mit Rollen aus der Datenbank. */
async function als(rollen: RollenZuweisung[], zweiFaktor = true) {
  await angemeldetAls(rollen, zweiFaktor);
  return (await ladeAngemeldet())!;
}
const alsAdministration = (zweiFaktor = true) => als([{ rolle: 'administration' }], zweiFaktor);
const alsRedaktion = () => als([{ rolle: 'redaktion' }]);
const alsOrg = (organisation: 'at' | 'kt' | 'gt' | 'kgt') => als([{ rolle: 'organisationsredaktion', organisation }]);

/** Legt über die Action an. Das Anlegen endet mit einer Weiterleitung, deren Ziel die neue ID enthält. */
async function anlegen(werte: Werte): Promise<string> {
  const ergebnis: unknown = await actions.neuesTicket({}, formular(werte)).catch((e: unknown) => e);
  const ziel = (ergebnis as { ziel?: string } | null)?.ziel ?? '';
  const treffer = /^\/verwaltung\/tickets\/([0-9a-f-]{36})\?angelegt=1$/.exec(ziel);
  expect(treffer, `Anlegen endete ohne Weiterleitung: ${ziel || 'kein Ziel'}`).not.toBeNull();
  return treffer![1];
}

/** Ticket direkt in der Datenbank (so schreibt das öffentliche Meldeformular später, C10b). */
async function ticketDirekt(werte: Partial<typeof schema.ticket.$inferInsert> = {}): Promise<string> {
  const [neu] = await db
    .insert(schema.ticket)
    .values({ titel: 'Testticket direkt', beschreibung: 'Testbeschreibung direkt', ...werte })
    .returning({ id: schema.ticket.id });
  return neu.id;
}

async function zeile(id: string) {
  const [treffer] = await db.select().from(schema.ticket).where(eq(schema.ticket.id, id)).limit(1);
  return treffer;
}

/** Alle Tickets in fester Reihenfolge (Grundlage für „Datenbank unverändert“). */
function alleTickets() {
  return db.select().from(schema.ticket).orderBy(schema.ticket.nummer);
}

/** Audit-Einträge zu einem Ticket in Schreibreihenfolge. */
function auditZu(id: string) {
  return db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, id)).orderBy(schema.auditEintrag.id);
}

const MELDER = {
  vorname: 'Testperson',
  nachname: 'Eins',
  telefon: '0000 000000',
  email: 'testperson.eins@example.test',
  rueckmeldung: true,
  rueckmeldeArt: 'telefon',
} as const;

/** Ticket mit verschlüsselten Kontaktangaben (G-07); IDs für die Melderprüfungen. */
let mitMelder = '';

beforeAll(async () => {
  const p = verschluessele(MELDER);
  mitMelder = await ticketDirekt({
    titel: 'Testticket mit Meldung',
    typ: 'information',
    melderVerschluesselt: p.daten,
    schluesselId: p.schluesselId,
  });
});

describe('Verwaltung › Tickets (V10, K-06, G-07)', () => {
  describe('Kriterium 1: ohne Anmeldung', () => {
    it('anlegen, ändern und kommentieren liefern keinRecht und ändern nichts', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('Ohne Anmeldung vorhanden'));
      await angemeldetAls(null);
      const vorher = await alleTickets();
      expect(await actions.neuesTicket({}, formular(eingabe('Ohne Anmeldung neu')))).toEqual({ fehler: 'keinRecht' });
      expect(await actions.aendereTicket({}, formular({ id, status: 'geloest', prioritaet: 'hoch' }))).toEqual({ fehler: 'keinRecht' });
      expect(await actions.kommentiereTicket({}, formular({ id, text: 'Ohne Anmeldung' }))).toEqual({ fehler: 'keinRecht' });
      expect(await alleTickets()).toEqual(vorher);
    });
  });

  describe('Kriterium 2: angemeldet ohne zweiten Faktor', () => {
    it('alle drei Actions liefern keinRecht, auch mit Administrationsrolle', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('Zwei-Faktor vorhanden'));
      await alsAdministration(false);
      const vorher = await alleTickets();
      expect(await actions.neuesTicket({}, formular(eingabe('Zwei-Faktor neu')))).toEqual({ fehler: 'keinRecht' });
      expect(await actions.aendereTicket({}, formular({ id, status: 'geloest', prioritaet: 'hoch' }))).toEqual({ fehler: 'keinRecht' });
      expect(await actions.kommentiereTicket({}, formular({ id, text: 'Ohne zweiten Faktor' }))).toEqual({ fehler: 'keinRecht' });
      expect(await alleTickets()).toEqual(vorher);
    });
  });

  describe('Kriterium 3: Rechte je Rolle laut Matrix', () => {
    it('Matrix: ticket.bearbeiten nur Administration; anlegen und lesen für alle Rollen außer Sprachprüfung', async () => {
      const { darf, MATRIX, ROLLEN } = await import('@/lib/rechte/matrix');
      for (const rolle of ROLLEN) {
        const zuweisung: RollenZuweisung = { rolle, organisation: rolle === 'organisationsredaktion' ? 'at' : null };
        expect(darf([zuweisung], 'ticket.bearbeiten')).toBe(rolle === 'administration');
        expect(darf([zuweisung], 'ticket.anlegen')).toBe(MATRIX[rolle].has('ticket.anlegen'));
        // Sprachprüfung ohne die Grundrechte der Verwaltung (S-L1 N-6, ADR 0041 Nr. 1): keine Tickets
        const ohneGrundrechte = rolle === 'sprachpruefung';
        expect(MATRIX[rolle].has('ticket.lesen')).toBe(!ohneGrundrechte);
      }
    });

    it('Sprachprüfung: legt keine Tickets an und kommentiert nicht (ohne ticket.lesen und ticket.anlegen)', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('Rolle Sprachprüfung vorhanden'));
      const vorher = await alleTickets();
      await als([{ rolle: 'sprachpruefung' }]);
      expect(await actions.neuesTicket({}, formular(eingabe('Rolle Sprachprüfung neu')))).toEqual({ fehler: 'keinRecht' });
      expect(await actions.kommentiereTicket({}, formular({ id, text: 'Kommentar Sprachprüfung' }))).toEqual({
        fehler: 'keinRecht',
      });
      expect(await alleTickets()).toEqual(vorher);
    });

    for (const { rolle, name } of [
      { rolle: 'redaktion', name: 'Redaktion' },
      { rolle: 'bildung', name: 'Bildung' },
      { rolle: 'mitgliederverwaltung', name: 'Mitgliederverwaltung' },
    ] as const) {
      describe(`${name}`, () => {
        it(`${name}: sieht Tickets, legt an und kommentiert`, async () => {
          await alsAdministration();
          const id = await anlegen(eingabe(`Rolle ${name} vorhanden`));
          const a = await als([{ rolle }]);
          expect((await q.ladeTicketListe({}, a)).map((z) => z.id)).toContain(id);
          const neuId = await anlegen(eingabe(`Rolle ${name} neu`));
          expect((await zeile(neuId))?.typ).toBe('intern');
          expect(await actions.kommentiereTicket({}, formular({ id, text: `Kommentar ${name}` }))).toEqual({
            gespeichert: expect.any(Number),
          });
        });

        it(`${name}: Status und Priorität ändern liefert keinRecht und ändert nichts`, async () => {
          await alsAdministration();
          const id = await anlegen(eingabe(`Rolle ${name} Status`));
          await als([{ rolle }]);
          const vorher = await alleTickets();
          expect(await actions.aendereTicket({}, formular({ id, status: 'geschlossen', prioritaet: 'dringend' }))).toEqual({
            fehler: 'keinRecht',
          });
          expect(await alleTickets()).toEqual(vorher);
        });
      });
    }
  });

  describe('Kriterium 4: Status und Priorität nur mit ticket.bearbeiten', () => {
    it('ändert Status und Priorität und protokolliert jedes Feld mit altem und neuem Wert', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('Status vorhanden'));
      expect(await actions.aendereTicket({}, formular({ id, status: 'in_bearbeitung', prioritaet: 'hoch' }))).toEqual({
        gespeichert: expect.any(Number),
      });
      expect(await zeile(id)).toMatchObject({ status: 'in_bearbeitung', prioritaet: 'hoch', geschlossenAm: null });
      expect(aufrufe.refresh).toBeGreaterThanOrEqual(1);
      const aenderungen = (await auditZu(id)).filter((e) => e.aktion === 'ticket.geaendert');
      expect(aenderungen.map((e) => e.details)).toEqual([
        { feld: 'status', von: 'offen', nach: 'in_bearbeitung' },
        { feld: 'prioritaet', von: 'mittel', nach: 'hoch' },
      ]);
    });

    it('unveränderte Werte schreiben weder Ticket noch Audit-Eintrag', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('Unverändert vorhanden'));
      await actions.aendereTicket({}, formular({ id, status: 'in_bearbeitung', prioritaet: 'hoch' }));
      const vorherAudit = (await auditZu(id)).length;
      const vorherZeile = await zeile(id);
      await actions.aendereTicket({}, formular({ id, status: 'in_bearbeitung', prioritaet: 'hoch' }));
      expect((await auditZu(id)).length).toBe(vorherAudit);
      expect(await zeile(id)).toEqual(vorherZeile);
    });

    it('Abschluss (gelöst oder geschlossen) setzt geschlossenAm, bleibt beim Wechsel gelöst → geschlossen; Wiederöffnen hebt es auf', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('Abschluss vorhanden'));
      await actions.aendereTicket({}, formular({ id, status: 'geloest', prioritaet: 'mittel' }));
      const geloestAm = (await zeile(id))?.geschlossenAm;
      expect(geloestAm).toBeInstanceOf(Date);
      await actions.aendereTicket({}, formular({ id, status: 'geschlossen', prioritaet: 'mittel' }));
      expect((await zeile(id))?.geschlossenAm).toEqual(geloestAm);
      await actions.aendereTicket({}, formular({ id, status: 'offen', prioritaet: 'mittel' }));
      expect((await zeile(id))?.geschlossenAm).toBeNull();
    });

    it('unbekannter Status ist ein Feldfehler, nichts wird gespeichert', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('Ungültig vorhanden'));
      const vorher = await alleTickets();
      expect(await actions.aendereTicket({}, formular({ id, status: 'erfunden', prioritaet: 'hoch' }))).toEqual({
        fehler: 'pruefen',
        feldFehler: { status: 'ungueltig' },
        werte: expect.objectContaining({ status: 'erfunden' }),
      });
      expect(await alleTickets()).toEqual(vorher);
    });

    it('unbekannte oder ungültige Kennung ist nicht gefunden', async () => {
      await alsAdministration();
      expect(
        await actions.aendereTicket({}, formular({ id: '00000000-0000-4000-8000-000000000000', status: 'geloest', prioritaet: 'hoch' })),
      ).toEqual({ fehler: 'nichtGefunden' });
      expect(await actions.aendereTicket({}, formular({ id: 'kein-uuid', status: 'geloest', prioritaet: 'hoch' }))).toEqual({
        fehler: 'nichtGefunden',
      });
    });
  });

  describe('Kriterium 5: Organisationsredaktion GT', () => {
    it('sieht nur Tickets der eigenen Organisation oder ohne Organisation', async () => {
      await alsAdministration();
      const at = await anlegen(eingabe('Org AT vorhanden', { organisation: 'at' }));
      const kt = await anlegen(eingabe('Org KT vorhanden', { organisation: 'kt' }));
      const gt = await anlegen(eingabe('Org GT vorhanden', { organisation: 'gt' }));
      const allgemein = await anlegen(eingabe('Org Allgemein vorhanden', { organisation: '' }));
      const a = await alsOrg('gt');
      const ids = (await q.ladeTicketListe({}, a)).map((z) => z.id);
      expect(ids).toEqual(expect.arrayContaining([gt, allgemein]));
      expect(ids).not.toContain(at);
      expect(ids).not.toContain(kt);
      expect(await q.ladeTicketDetail(kt, a)).toBeNull();
      expect(await q.ladeTicketDetail(gt, a)).not.toBeNull();
      expect(await q.ladeTicketDetail(allgemein, a)).not.toBeNull();
    });

    it('kommentiert nur eigene und allgemeine Tickets; fremde sind nicht gefunden', async () => {
      await alsAdministration();
      const kt = await anlegen(eingabe('Kommentar KT vorhanden', { organisation: 'kt' }));
      const allgemein = await anlegen(eingabe('Kommentar Allgemein vorhanden', { organisation: '' }));
      await alsOrg('gt');
      expect(await actions.kommentiereTicket({}, formular({ id: kt, text: 'Fremd' }))).toEqual({ fehler: 'nichtGefunden' });
      expect(await actions.kommentiereTicket({}, formular({ id: allgemein, text: 'Allgemein' }))).toEqual({
        gespeichert: expect.any(Number),
      });
    });

    it('legt nur in der eigenen Organisation oder ohne Organisation an', async () => {
      await alsOrg('gt');
      const vorher = await alleTickets();
      expect(await actions.neuesTicket({}, formular(eingabe('GT fremd', { organisation: 'kt' })))).toEqual({
        fehler: 'pruefen',
        feldFehler: { organisation: 'organisation' },
        werte: expect.objectContaining({ organisation: 'kt' }),
      });
      expect(await alleTickets()).toEqual(vorher);
      const eigen = await anlegen(eingabe('GT eigen anlegen', { organisation: 'gt' }));
      expect((await zeile(eigen))?.organisation).toBe('gt');
      const ohneOrg = await anlegen(eingabe('GT allgemein anlegen', { organisation: '' }));
      expect((await zeile(ohneOrg))?.organisation).toBeNull();
    });

    it('ändert Status und Priorität nicht, auch nicht an eigenen Tickets', async () => {
      await alsOrg('gt');
      const eigen = await anlegen(eingabe('GT Status anlegen', { organisation: 'gt' }));
      const vorher = await alleTickets();
      expect(await actions.aendereTicket({}, formular({ id: eigen, status: 'geloest', prioritaet: 'hoch' }))).toEqual({
        fehler: 'keinRecht',
      });
      expect(await alleTickets()).toEqual(vorher);
    });

    it('zählt nur sichtbare offene Tickets', async () => {
      const a = await alsOrg('gt');
      const sichtbar = or(isNull(schema.ticket.organisation), eq(schema.ticket.organisation, 'gt'));
      const offen = await db
        .select({ id: schema.ticket.id })
        .from(schema.ticket)
        .where(and(sichtbar, or(eq(schema.ticket.status, 'offen'), eq(schema.ticket.status, 'in_bearbeitung'))));
      expect(await q.zaehleOffeneTickets(a)).toBe(offen.length);
    });
  });

  describe('Kriterium 6: Kontaktangaben der meldenden Person (G-07)', () => {
    it('erscheinen nie in der Liste', async () => {
      const a = await alsAdministration();
      const liste = await q.ladeTicketListe({}, a);
      expect(liste.some((z) => z.id === mitMelder)).toBe(true);
      const text = JSON.stringify(liste);
      expect(text).not.toContain('testperson.eins@example.test');
      expect(text).not.toContain('0000 000000');
      expect(text).not.toContain('Testperson');
    });

    it('ohne Recht ticket.bearbeiten: „verborgen“ und kein Abruf im Audit-Log', async () => {
      const a = await als([{ rolle: 'redaktion' }]);
      const d = await q.ladeTicketDetail(mitMelder, a);
      expect(d?.melder).toEqual({ art: 'verborgen' });
      expect((await auditZu(mitMelder)).filter((e) => e.aktion === 'ticket.gelesen')).toHaveLength(0);
    });

    it('mit Recht: Angaben lesbar, jeder Abruf wird ohne Inhalt protokolliert', async () => {
      const a = await alsAdministration();
      const d = await q.ladeTicketDetail(mitMelder, a);
      expect(d?.melder).toEqual({ art: 'lesbar', daten: MELDER });
      const gelesen = (await auditZu(mitMelder)).filter((e) => e.aktion === 'ticket.gelesen');
      expect(gelesen).toHaveLength(1);
      expect(gelesen[0]?.details).toEqual({ feld: 'melder' });
      expect(gelesen[0]?.benutzerId).toBe(a.benutzerId);
      expect(JSON.stringify(gelesen)).not.toContain('Testperson');
      await q.ladeTicketDetail(mitMelder, a);
      expect((await auditZu(mitMelder)).filter((e) => e.aktion === 'ticket.gelesen')).toHaveLength(2);
    });

    it('ohne Kontaktangaben: „keiner“ und kein Abruf', async () => {
      const a = await alsAdministration();
      const ohne = await ticketDirekt();
      expect((await q.ladeTicketDetail(ohne, a))?.melder).toEqual({ art: 'keiner' });
      expect((await auditZu(ohne)).filter((e) => e.aktion === 'ticket.gelesen')).toHaveLength(0);
    });

    it('nicht entschlüsselbare Angaben: „unlesbar“, der Abruf bleibt protokolliert', async () => {
      const a = await alsAdministration();
      const kaputt = await ticketDirekt({ melderVerschluesselt: Buffer.from('keine gueltigen Daten, nur Bytes'), schluesselId: 1 });
      expect((await q.ladeTicketDetail(kaputt, a))?.melder).toEqual({ art: 'unlesbar' });
      expect((await auditZu(kaputt)).filter((e) => e.aktion === 'ticket.gelesen')).toHaveLength(1);
    });

    it('fehlende Schlüssel-ID: „unlesbar“ ohne Entschlüsselung', async () => {
      const a = await alsAdministration();
      const p = verschluessele(MELDER);
      const ohneSchluessel = await ticketDirekt({ melderVerschluesselt: p.daten, schluesselId: null });
      expect((await q.ladeTicketDetail(ohneSchluessel, a))?.melder).toEqual({ art: 'unlesbar' });
    });
  });

  describe('Kriterium 7: Kommentare im Verlauf', () => {
    it('speichert Text und Kennzeichnung; das Audit-Log hält den Text nicht fest', async () => {
      const a = await alsAdministration();
      const id = await anlegen(eingabe('Kommentar vorhanden'));
      const text = 'Testkommentar Heizung prüfen';
      expect(await actions.kommentiereTicket({}, formular({ id, text, intern: 'on' }))).toEqual({ gespeichert: expect.any(Number) });
      const d = await q.ladeTicketDetail(id, a);
      expect(d?.kommentare).toEqual([expect.objectContaining({ text, intern: true, autorName: 'Testperson Eins' })]);
      const audit = (await auditZu(id)).filter((e) => e.aktion === 'ticket.kommentiert');
      expect(audit).toHaveLength(1);
      expect(audit[0]?.details).toEqual({ intern: true });
      expect(JSON.stringify(audit)).not.toContain(text);
    });

    it('ohne Häkchen ist der Kommentar nicht intern', async () => {
      const a = await alsAdministration();
      const id = await anlegen(eingabe('Nicht intern vorhanden'));
      await actions.kommentiereTicket({}, formular({ id, text: 'Für Meldende bestimmt' }));
      const d = await q.ladeTicketDetail(id, a);
      expect(d?.kommentare[0]?.intern).toBe(false);
      expect((await auditZu(id)).find((e) => e.aktion === 'ticket.kommentiert')?.details).toEqual({ intern: false });
    });

    it('leerer und zu langer Text sind Feldfehler, nichts wird gespeichert', async () => {
      await alsAdministration();
      const id = await anlegen(eingabe('Fehler Kommentar vorhanden'));
      const vorher = await db.select().from(schema.ticketKommentar).where(eq(schema.ticketKommentar.ticketId, id));
      expect(await actions.kommentiereTicket({}, formular({ id, text: '   ' }))).toEqual({
        fehler: 'pruefen',
        feldFehler: { text: 'pflicht' },
        werte: expect.objectContaining({ text: '   ' }),
      });
      expect(await actions.kommentiereTicket({}, formular({ id, text: 'x'.repeat(2001) }))).toEqual({
        fehler: 'pruefen',
        feldFehler: { text: 'zuLang' },
        werte: expect.objectContaining({ id }),
      });
      expect(await db.select().from(schema.ticketKommentar).where(eq(schema.ticketKommentar.ticketId, id))).toEqual(vorher);
    });

    it('Kommentare stehen in Schreibreihenfolge', async () => {
      const a = await alsAdministration();
      const id = await anlegen(eingabe('Reihenfolge vorhanden'));
      for (const text of ['Erster Kommentar', 'Zweiter Kommentar']) {
        await actions.kommentiereTicket({}, formular({ id, text, intern: 'on' }));
        await new Promise((fertig) => setTimeout(fertig, 5));
      }
      const d = await q.ladeTicketDetail(id, a);
      expect(d?.kommentare.map((k) => k.text)).toEqual(['Erster Kommentar', 'Zweiter Kommentar']);
    });
  });

  describe('Kriterium 8: Anlegen', () => {
    it('legt intern, offen und mit Vorgabepriorität an; Audit ohne Details', async () => {
      await alsRedaktion();
      const id = await anlegen({ titel: 'Anlegen vorhanden', beschreibung: 'Testbeschreibung', kategorie: '', organisation: '' });
      expect(await zeile(id)).toMatchObject({
        typ: 'intern',
        status: 'offen',
        prioritaet: 'mittel',
        kategorie: null,
        organisation: null,
        geschlossenAm: null,
        erstelltVon: expect.any(String),
      });
      const audit = await auditZu(id);
      expect(audit.map((e) => e.aktion)).toEqual(['ticket.angelegt']);
      expect(audit[0]?.details).toBeNull();
    });

    it('Pflichtfelder, Länge und Auswahl werden als Feldfehler gemeldet', async () => {
      await alsAdministration();
      const vorher = await alleTickets();
      expect(await actions.neuesTicket({}, formular({ titel: '', beschreibung: 'x', prioritaet: 'mittel' }))).toMatchObject({
        feldFehler: { titel: 'pflicht' },
      });
      expect(await actions.neuesTicket({}, formular({ titel: 'x', beschreibung: '', prioritaet: 'mittel' }))).toMatchObject({
        feldFehler: { beschreibung: 'pflicht' },
      });
      expect(await actions.neuesTicket({}, formular({ titel: 'x', beschreibung: 'x', prioritaet: 'riesig' }))).toMatchObject({
        feldFehler: { prioritaet: 'ungueltig' },
      });
      expect(await actions.neuesTicket({}, formular({ titel: 'x'.repeat(161), beschreibung: 'x', prioritaet: 'mittel' }))).toMatchObject({
        feldFehler: { titel: 'zuLang' },
      });
      expect(await actions.neuesTicket({}, formular({ titel: 'x', beschreibung: 'x', organisation: 'xx' }))).toMatchObject({
        feldFehler: { organisation: 'ungueltig' },
      });
      expect(await alleTickets()).toEqual(vorher);
    });
  });

  describe('Kriterium 9: Filter und Zähler', () => {
    it('filtert nach Status, Priorität und Typ, auch kombiniert', async () => {
      const a = await alsAdministration();
      await ticketDirekt({ titel: 'Filter A', status: 'geloest', prioritaet: 'dringend', typ: 'wunsch' });
      await ticketDirekt({ titel: 'Filter B', status: 'offen', prioritaet: 'dringend', typ: 'wunsch' });
      await ticketDirekt({ titel: 'Filter C', status: 'geloest', prioritaet: 'niedrig', typ: 'beschwerde' });
      const titel = async (filter: Parameters<typeof q.ladeTicketListe>[0]) =>
        (await q.ladeTicketListe(filter, a)).map((z) => z.titel).filter((t) => t.startsWith('Filter '));
      expect((await titel({ status: 'geloest' })).sort()).toEqual(['Filter A', 'Filter C']);
      expect((await titel({ prioritaet: 'dringend' })).sort()).toEqual(['Filter A', 'Filter B']);
      expect(await titel({ typ: 'wunsch', status: 'offen' })).toEqual(['Filter B']);
      expect(await titel({ typ: 'beschwerde', prioritaet: 'dringend' })).toEqual([]);
    });

    it('zählt offene Tickets (offen oder in Bearbeitung) für die Administration', async () => {
      const a = await alsAdministration();
      const offen = await db
        .select({ id: schema.ticket.id })
        .from(schema.ticket)
        .where(or(eq(schema.ticket.status, 'offen'), eq(schema.ticket.status, 'in_bearbeitung')));
      expect(await q.zaehleOffeneTickets(a)).toBe(offen.length);
    });
  });

  describe('Kriterium 10: Audit ohne Freitext', () => {
    it('Ticket-Einträge tragen nur Feldnamen, Werte und Kennzeichen, nie Titel, Beschreibung oder Kommentartext', async () => {
      const eintraege = await db.select().from(schema.auditEintrag).where(like(schema.auditEintrag.aktion, 'ticket.%'));
      expect(eintraege.length).toBeGreaterThan(0);
      const erlaubteAktionen = ['ticket.angelegt', 'ticket.geaendert', 'ticket.kommentiert', 'ticket.gelesen'];
      for (const e of eintraege) {
        expect(erlaubteAktionen).toContain(e.aktion);
        for (const [schluessel, wert] of Object.entries(e.details ?? {})) {
          expect(['feld', 'von', 'nach', 'intern']).toContain(schluessel);
          if (typeof wert === 'string') expect(wert).not.toMatch(/Test|Bitte|Kommentar/);
        }
      }
    });
  });
});
