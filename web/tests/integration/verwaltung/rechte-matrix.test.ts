import { randomUUID } from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import type { EingangArt } from '@/lib/eingaenge/arten';
import { EINGANG_AKTION, type Aktion, type OrganisationKuerzel } from '@/lib/rechte/matrix';
import { verwaltungsUmgebung } from '../hilfen/verwaltung';
import {
  ANMELDUNG_AKTIONEN,
  type Abweisung,
  alsAdministration,
  anmelden,
  ausgang,
  type Ausgang,
  benutzerDirekt,
  eingangDirekt,
  erlaubt,
  formular,
  idAusWeiterleitung,
  KEIN_RECHT_RUECKGABE,
  ladeAktionen,
  mediumDirekt,
  momentaufnahme,
  ORGANISATION_PRUEFEN,
  PERSONEN,
  type Person,
  type Pruefung,
  pruefeAbweisung,
  pruefeZulassung,
  type Ziel,
  ticketDirekt,
  unterhaltungMit,
} from './rechte-hilfen';

/**
 * Rechte-Matrix der Verwaltung über alle Server Actions (Paket C17, Z-06).
 *
 * Je Action steht hier, welche Matrix-Prüfungen sie laut Code vor dem Schreiben ausführt (Zeilen im Kommentar). Daraus
 * entsteht je Personengruppe und Ziel ein Fall: zugelassen genau dann, wenn `darf()` aus der Matrix jede Prüfung
 * bestätigt. Abgewiesen wird mit dem Fehler- bzw. Weiterleitungszustand der Action, und der Datenbestand bleibt
 * unverändert.
 *
 * Zugelassene Fälle führen die Action mit gültiger Eingabe auf einem eigenen Testdatensatz aus und prüfen die Wirkung.
 * Wo die Action schon bei der Eingabeprüfung endet, reicht dieser Abbruch als Nachweis, dass die Rechteprüfung bestanden
 * wurde (das steht im jeweiligen Fall). Abweichungen zwischen Matrix und Action sind als `it.fails` mit „BEFUND“
 * markiert.
 */
const { client, db } = await verwaltungsUmgebung();
afterAll(() => client.close());

type Werte = Record<string, string | string[]>;
type Aktionen = Awaited<ReturnType<typeof ladeAktionen>>;
type Aufbau = { aufruf: () => Promise<unknown>; zustand: () => Promise<string>; wirkung: (a: Ausgang) => Promise<void> };
type Ziele = { name: string; ziel?: Ziel }[];
type Fall = {
  aktion: string;
  datei: string;
  modus?: string;
  ziele: Ziele;
  pruefungen: (ziel: Ziel | undefined) => Pruefung[];
  abweisung: (p: Person, ziel: Ziel | undefined) => Abweisung;
  bekannt?: (p: Person, ziel: Ziel | undefined) => string | undefined;
  aufbau: (p: Person, ziel: Ziel | undefined) => Promise<Aufbau>;
};

const BEFUND_TICKET =
  'Die Matrix bindet ticket.* nicht an Organisationen. Die Action begrenzt Tickets zusätzlich auf die eigene Organisation (queries/verwaltung/tickets.ts, darfTicketOrganisation). Abweichung offen, siehe Rückgabe.';

const ORG_ZIELE: Ziele = [
  { name: 'Organisation gt (eigene)', ziel: { organisation: 'gt' } },
  { name: 'Organisation kt (fremde)', ziel: { organisation: 'kt' } },
  { name: 'ohne Organisation (allgemein)', ziel: { organisation: null } },
];
const OHNE_ZIEL: Ziele = [{ name: 'ohne Organisationsbezug' }];
const EINGANG_ZIELE: Ziele = [
  { name: 'Voranmeldung', ziel: { art: 'voranmeldung' } },
  { name: 'Anmeldung zu Veranstaltung der Organisation gt', ziel: { art: 'veranstaltungsanmeldung', organisation: 'gt' } },
  { name: 'Anmeldung zu Veranstaltung der Organisation kt', ziel: { art: 'veranstaltungsanmeldung', organisation: 'kt' } },
  { name: 'Anmeldung zu Veranstaltung ohne Organisation', ziel: { art: 'veranstaltungsanmeldung', organisation: null } },
  { name: 'Mitgliedsantrag', ziel: { art: 'mitgliedsantrag' } },
  { name: 'Kontakt', ziel: { art: 'kontakt' } },
  { name: 'Moschee-Anfrage', ziel: { art: 'moschee_anfrage' } },
];

const org = (z: Ziel | undefined): string => z?.organisation ?? '';
const orgOderNull = (z: Ziel | undefined): OrganisationKuerzel | null => z?.organisation ?? null;

function gesetzteOrganisation(z: Ziel | undefined): OrganisationKuerzel {
  if (!z?.organisation) throw new Error('Ziel ohne Organisation');
  return z.organisation;
}

/** Prüfungen einer Action auf Lesen und Schreiben; organisationsgebunden am Datensatz. */
function rechtsPruefungen(lesen: Aktion, recht: Aktion, z: Ziel | undefined, orgGebunden: boolean): Pruefung[] {
  return [{ aktion: lesen }, orgGebunden ? { aktion: recht, ziel: { organisation: orgOderNull(z) } } : { aktion: recht }];
}

async function zeilenZahl(tabelle: PgTable): Promise<number> {
  return (await db.select().from(tabelle)).length;
}

function rueckgabe(a: Ausgang): Record<string, unknown> {
  return (a.wert ?? {}) as Record<string, unknown>;
}

/** Inhaltsmodule mit Papierkorb: Veranstaltungen, Neuigkeiten und Ankündigungen (organisationsgebunden), Kurse. */
type InhaltModul = {
  datei: string;
  orgGebunden: boolean;
  lesen: Aktion;
  bearbeiten: Aktion;
  loeschen: Aktion;
  tabelle: PgTable;
  eingabe: (titel: string, organisation: string) => Werte;
  zeile: (id: string) => Promise<{ imPapierkorbSeit: Date | null } | undefined>;
  aktion: (a: Aktionen) => {
    speichern: (fd: FormData) => Promise<unknown>;
    inPapierkorb: (fd: FormData) => Promise<unknown>;
    wiederherstellen: (fd: FormData) => Promise<unknown>;
    endgueltigLoeschen: (fd: FormData) => Promise<unknown>;
  };
};

/** Legt über die Action als Administration an; die Weiterleitung nennt die neue ID. */
async function anlegenAlsAdmin(m: InhaltModul, organisation: string): Promise<string> {
  await alsAdministration();
  const a = await ladeAktionen();
  return idAusWeiterleitung(() => m.aktion(a).speichern(formular(m.eingabe('Testvorhanden', organisation))));
}

/** In den Papierkorb als Administration (Vorbereitung für Wiederherstellen und endgültiges Löschen). */
async function inPapierkorbAlsAdmin(m: InhaltModul, id: string): Promise<void> {
  const a = await ladeAktionen();
  await m.aktion(a).inPapierkorb(formular({ id }));
}

function inhaltFaelle(
  m: InhaltModul,
  namen: { speichern: string; inPapierkorb: string; wiederherstellen: string; endgueltigLoeschen: string },
): Fall[] {
  const zustand = () => momentaufnahme(db, [m.tabelle, schema.auditEintrag]);
  const ziele = m.orgGebunden ? ORG_ZIELE : OHNE_ZIEL;

  const bearbeiten: Fall = {
    aktion: namen.speichern,
    datei: m.datei,
    modus: 'bearbeiten',
    ziele,
    pruefungen: (z) => rechtsPruefungen(m.lesen, m.bearbeiten, z, m.orgGebunden),
    abweisung: () => KEIN_RECHT_RUECKGABE,
    aufbau: async (p, z) => {
      const id = await anlegenAlsAdmin(m, org(z));
      await anmelden(p);
      const vorher = JSON.stringify(await m.zeile(id));
      return {
        aufruf: async () => m.aktion(await ladeAktionen()).speichern(formular({ id, ...m.eingabe('Testgeaendert', org(z)) })),
        zustand,
        wirkung: async () => {
          expect(JSON.stringify(await m.zeile(id)), 'Speichern hat den Datensatz nicht geändert').not.toBe(vorher);
        },
      };
    },
  };

  const anlegen: Fall = {
    aktion: namen.speichern,
    datei: m.datei,
    modus: 'anlegen (Organisation des neuen Datensatzes)',
    ziele: ORG_ZIELE,
    pruefungen: (z) => rechtsPruefungen(m.lesen, m.bearbeiten, z, true),
    abweisung: (p) => (erlaubt(p, [{ aktion: m.lesen }]) ? ORGANISATION_PRUEFEN : KEIN_RECHT_RUECKGABE),
    aufbau: async (p, z) => {
      await anmelden(p);
      const vorher = await zeilenZahl(m.tabelle);
      return {
        aufruf: async () => m.aktion(await ladeAktionen()).speichern(formular(m.eingabe('Testneu', org(z)))),
        zustand,
        wirkung: async () => {
          expect(await zeilenZahl(m.tabelle), 'Anlegen hat keinen neuen Datensatz erzeugt').toBe(vorher + 1);
        },
      };
    },
  };

  const papierkorb: Fall = {
    aktion: namen.inPapierkorb,
    datei: m.datei,
    ziele,
    pruefungen: (z) => rechtsPruefungen(m.lesen, m.loeschen, z, m.orgGebunden),
    abweisung: () => 'werfen',
    aufbau: async (p, z) => {
      const id = await anlegenAlsAdmin(m, org(z));
      await anmelden(p);
      return {
        aufruf: async () => m.aktion(await ladeAktionen()).inPapierkorb(formular({ id })),
        zustand,
        wirkung: async () => {
          expect((await m.zeile(id))?.imPapierkorbSeit, 'Datensatz ist nach dem Papierkorb nicht markiert').toBeInstanceOf(Date);
        },
      };
    },
  };

  const wiederherstellen: Fall = {
    aktion: namen.wiederherstellen,
    datei: m.datei,
    ziele,
    pruefungen: (z) => rechtsPruefungen(m.lesen, m.bearbeiten, z, m.orgGebunden),
    abweisung: () => 'werfen',
    aufbau: async (p, z) => {
      const id = await anlegenAlsAdmin(m, org(z));
      await inPapierkorbAlsAdmin(m, id);
      await anmelden(p);
      return {
        aufruf: async () => m.aktion(await ladeAktionen()).wiederherstellen(formular({ id })),
        zustand,
        wirkung: async () => {
          expect((await m.zeile(id))?.imPapierkorbSeit, 'Datensatz ist nach dem Wiederherstellen noch im Papierkorb').toBeNull();
        },
      };
    },
  };

  const endgueltig: Fall = {
    aktion: namen.endgueltigLoeschen,
    datei: m.datei,
    ziele,
    pruefungen: (z) => rechtsPruefungen(m.lesen, m.loeschen, z, m.orgGebunden),
    abweisung: () => 'werfen',
    aufbau: async (p, z) => {
      const id = await anlegenAlsAdmin(m, org(z));
      await inPapierkorbAlsAdmin(m, id);
      await anmelden(p);
      return {
        aufruf: async () => m.aktion(await ladeAktionen()).endgueltigLoeschen(formular({ id })),
        zustand,
        wirkung: async () => {
          expect(await m.zeile(id), 'Datensatz wurde nicht endgültig gelöscht').toBeUndefined();
        },
      };
    },
  };

  return m.orgGebunden
    ? [bearbeiten, anlegen, papierkorb, wiederherstellen, endgueltig]
    : [bearbeiten, papierkorb, wiederherstellen, endgueltig];
}

const veranstaltung: InhaltModul = {
  datei: 'veranstaltungen',
  orgGebunden: true,
  lesen: 'veranstaltung.lesen',
  bearbeiten: 'veranstaltung.bearbeiten',
  loeschen: 'veranstaltung.loeschen',
  tabelle: schema.veranstaltung,
  eingabe: (titel, organisation) => ({ titelDe: titel, kategorie: 'gemeinde', datum: '2026-11-07', beginnZeit: '19:00', organisation }),
  zeile: (id) =>
    db
      .select()
      .from(schema.veranstaltung)
      .where(eq(schema.veranstaltung.id, id))
      .then((r) => r[0]),
  aktion: (a) => ({
    speichern: (fd) => a.veranstaltungen.speichereVeranstaltung({}, fd),
    inPapierkorb: (fd) => a.veranstaltungen.inPapierkorb(fd),
    wiederherstellen: (fd) => a.veranstaltungen.wiederherstellen(fd),
    endgueltigLoeschen: (fd) => a.veranstaltungen.endgueltigLoeschen(fd),
  }),
};

const neuigkeit: InhaltModul = {
  datei: 'neuigkeiten',
  orgGebunden: true,
  lesen: 'nachricht.lesen',
  bearbeiten: 'nachricht.bearbeiten',
  loeschen: 'nachricht.loeschen',
  tabelle: schema.nachricht,
  eingabe: (titel, organisation) => ({ titelDe: titel, kategorie: 'gemeinde', organisation }),
  zeile: (id) =>
    db
      .select()
      .from(schema.nachricht)
      .where(eq(schema.nachricht.id, id))
      .then((r) => r[0]),
  aktion: (a) => ({
    speichern: (fd) => a.neuigkeiten.speichereNeuigkeit({}, fd),
    inPapierkorb: (fd) => a.neuigkeiten.inPapierkorb(fd),
    wiederherstellen: (fd) => a.neuigkeiten.wiederherstellen(fd),
    endgueltigLoeschen: (fd) => a.neuigkeiten.endgueltigLoeschen(fd),
  }),
};

const ankuendigung: InhaltModul = {
  datei: 'ankuendigungen',
  orgGebunden: true,
  lesen: 'ankuendigung.lesen',
  bearbeiten: 'ankuendigung.bearbeiten',
  loeschen: 'ankuendigung.loeschen',
  tabelle: schema.ankuendigung,
  eingabe: (titel, organisation) => ({
    titelDe: titel,
    inhaltDe: 'Testtext für die Ankündigung.',
    prioritaet: 'mittel',
    organisation,
    status: 'veroeffentlicht',
  }),
  zeile: (id) =>
    db
      .select()
      .from(schema.ankuendigung)
      .where(eq(schema.ankuendigung.id, id))
      .then((r) => r[0]),
  aktion: (a) => ({
    speichern: (fd) => a.ankuendigungen.speichereAnkuendigung({}, fd),
    inPapierkorb: (fd) => a.ankuendigungen.inPapierkorb(fd),
    wiederherstellen: (fd) => a.ankuendigungen.wiederherstellen(fd),
    endgueltigLoeschen: (fd) => a.ankuendigungen.endgueltigLoeschen(fd),
  }),
};

const kurs: InhaltModul = {
  datei: 'kurse',
  orgGebunden: false,
  lesen: 'kurs.lesen',
  bearbeiten: 'kurs.bearbeiten',
  loeschen: 'kurs.loeschen',
  tabelle: schema.kurs,
  eingabe: (titel) => ({ titelDe: titel }),
  zeile: (id) =>
    db
      .select()
      .from(schema.kurs)
      .where(eq(schema.kurs.id, id))
      .then((r) => r[0]),
  aktion: (a) => ({
    speichern: (fd) => a.kurse.speichereKurs({}, fd),
    inPapierkorb: (fd) => a.kurse.inPapierkorb(fd),
    wiederherstellen: (fd) => a.kurse.wiederherstellen(fd),
    endgueltigLoeschen: (fd) => a.kurse.endgueltigLoeschen(fd),
  }),
};

/** Medien: Hochladen und Ändern mit `medium.hochladen`, Papierkorb, Wiederherstellen und Löschen mit `medium.loeschen`. */
function medienFaelle(): Fall[] {
  const zustand = () => momentaufnahme(db, [schema.medium, schema.auditEintrag]);
  const zeile = async (id: string) => (await db.select().from(schema.medium).where(eq(schema.medium.id, id)))[0];
  return [
    {
      aktion: 'hochladen',
      datei: 'medien',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'medium.hochladen' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        await anmelden(p);
        return {
          // Ohne Datei endet die Action nach der Rechteprüfung mit „dateiFehlt“; gespeichert wird nichts.
          aufruf: async () => (await ladeAktionen()).medien.hochladen({}, formular({ altDe: 'Testbild' })),
          zustand,
          wirkung: async (a) => {
            expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen', feldFehler: { datei: 'dateiFehlt' } });
          },
        };
      },
    },
    {
      aktion: 'aendern',
      datei: 'medien',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'medium.hochladen' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        const id = await mediumDirekt(db, false);
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).medien.aendern({}, formular({ id, altDe: 'Neuer Alt-Text' })),
          zustand,
          wirkung: async () => {
            expect((await zeile(id))?.alt, 'Alt-Text wurde nicht geändert').toMatchObject({ de: 'Neuer Alt-Text' });
          },
        };
      },
    },
    {
      aktion: 'inPapierkorb',
      datei: 'medien',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'medium.loeschen' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        const id = await mediumDirekt(db, false);
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).medien.inPapierkorb(formular({ id })),
          zustand,
          wirkung: async (a) => {
            expect(a.weiter).toBe('/verwaltung/medien?meldung=papierkorb');
            expect((await zeile(id))?.imPapierkorbSeit).toBeInstanceOf(Date);
          },
        };
      },
    },
    {
      aktion: 'wiederherstellen',
      datei: 'medien',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'medium.loeschen' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        const id = await mediumDirekt(db, true);
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).medien.wiederherstellen(formular({ id })),
          zustand,
          wirkung: async (a) => {
            expect(a.weiter).toBe('/verwaltung/medien?ansicht=papierkorb&meldung=wiederhergestellt');
            expect((await zeile(id))?.imPapierkorbSeit).toBeNull();
          },
        };
      },
    },
    {
      aktion: 'endgueltigLoeschen',
      datei: 'medien',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'medium.loeschen' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        const id = await mediumDirekt(db, true);
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).medien.endgueltigLoeschen(formular({ id })),
          zustand,
          wirkung: async (a) => {
            expect(a.weiter).toBe('/verwaltung/medien?ansicht=papierkorb&meldung=geloescht');
            expect(await zeile(id), 'Medium wurde nicht endgültig gelöscht').toBeUndefined();
          },
        };
      },
    },
  ];
}

/** Eingänge: Recht `verwaltung.betreten` und das Bearbeitungsrecht der Eingangsart (Anmeldungen organisationsgebunden). */
function eingangPruefung(z: Ziel | undefined): Pruefung[] {
  const art = z?.art;
  if (!art) throw new Error('Ziel ohne Eingangsart');
  const bearbeiten = EINGANG_AKTION[art].bearbeiten;
  return [
    { aktion: 'verwaltung.betreten' },
    art === 'veranstaltungsanmeldung' ? { aktion: bearbeiten, ziel: { organisation: orgOderNull(z) } } : { aktion: bearbeiten },
  ];
}

async function eingangFuer(p: Person, z: Ziel | undefined): Promise<string> {
  const art: EingangArt | undefined = z?.art;
  if (!art) throw new Error('Ziel ohne Eingangsart');
  const id = await eingangDirekt(db, art, orgOderNull(z));
  await anmelden(p);
  return id;
}

function eingangFaelle(): Fall[] {
  const zustand = () => momentaufnahme(db, [schema.eingang, schema.eingangNotiz, schema.mailAusgang, schema.auditEintrag]);
  const status = async (id: string) => (await db.select().from(schema.eingang).where(eq(schema.eingang.id, id)))[0]?.status;
  return [
    {
      aktion: 'setzeStatus',
      datei: 'eingaenge',
      ziele: EINGANG_ZIELE,
      pruefungen: eingangPruefung,
      abweisung: () => 'werfen',
      aufbau: async (p, z) => {
        const id = await eingangFuer(p, z);
        return {
          aufruf: async () => (await ladeAktionen()).eingaenge.setzeStatus(formular({ id, status: 'in_bearbeitung' })),
          zustand,
          wirkung: async () => {
            expect(await status(id), 'Status wurde nicht geändert').toBe('in_bearbeitung');
          },
        };
      },
    },
    {
      aktion: 'notizHinzufuegen',
      datei: 'eingaenge',
      ziele: EINGANG_ZIELE,
      pruefungen: eingangPruefung,
      abweisung: () => 'werfen',
      aufbau: async (p, z) => {
        const id = await eingangFuer(p, z);
        return {
          aufruf: async () => (await ladeAktionen()).eingaenge.notizHinzufuegen(formular({ id, text: 'Testnotiz ohne Personendaten' })),
          zustand,
          wirkung: async () => {
            expect(await db.select().from(schema.eingangNotiz).where(eq(schema.eingangNotiz.eingangId, id)), 'Notiz fehlt').toHaveLength(1);
          },
        };
      },
    },
    {
      aktion: 'endgueltigLoeschen',
      datei: 'eingaenge',
      ziele: EINGANG_ZIELE,
      pruefungen: eingangPruefung,
      abweisung: () => 'werfen',
      aufbau: async (p, z) => {
        const id = await eingangFuer(p, z);
        return {
          aufruf: async () => (await ladeAktionen()).eingaenge.endgueltigLoeschen(formular({ id })),
          zustand,
          wirkung: async (a) => {
            expect(a.weiter).toBe('/verwaltung/eingaenge?geloescht=1');
            expect(await db.select().from(schema.eingang).where(eq(schema.eingang.id, id)), 'Eingang wurde nicht gelöscht').toHaveLength(0);
          },
        };
      },
    },
  ];
}

/** Postfach: `postfach.nutzen` (alle Rollen). Antworten nur für Teilnehmende; Gelesen-Markierung still. */
function postfachFaelle(): Fall[] {
  const zustand = () => momentaufnahme(db, [schema.unterhaltung, schema.unterhaltungTeilnehmer, schema.postfachNachricht]);
  return [
    {
      aktion: 'neueUnterhaltung',
      datei: 'postfach',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'postfach.nutzen' }],
      abweisung: () => KEIN_RECHT_RUECKGABE,
      aufbau: async (p) => {
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).postfach.neueUnterhaltung({}, formular({})),
          zustand,
          wirkung: async (a) => {
            expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen' });
          },
        };
      },
    },
    {
      aktion: 'antworten',
      datei: 'postfach',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'postfach.nutzen' }],
      abweisung: () => KEIN_RECHT_RUECKGABE,
      aufbau: async (p) => {
        const subjekt = await anmelden(p);
        const id = await unterhaltungMit(db, await benutzerDirekt(db), subjekt);
        return {
          // Teilnahme ist gegeben; die leere Antwort endet bei der Eingabeprüfung, ohne zu schreiben.
          aufruf: async () => (await ladeAktionen()).postfach.antworten({}, formular({ unterhaltungId: id })),
          zustand,
          wirkung: async (a) => {
            expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen' });
          },
        };
      },
    },
    {
      aktion: 'markiereGelesen',
      datei: 'postfach',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'postfach.nutzen' }],
      abweisung: () => 'stumm',
      aufbau: async (p) => {
        const subjekt = await anmelden(p);
        const id = await unterhaltungMit(db, await benutzerDirekt(db), subjekt);
        return {
          aufruf: async () => (await ladeAktionen()).postfach.markiereGelesen(id),
          zustand,
          wirkung: async () => {
            const [teilnahme] = await db
              .select()
              .from(schema.unterhaltungTeilnehmer)
              .where(
                and(eq(schema.unterhaltungTeilnehmer.unterhaltungId, id), eq(schema.unterhaltungTeilnehmer.benutzerId, subjekt ?? '')),
              );
            expect(teilnahme, 'Teilnahme fehlt').toBeDefined();
            expect(teilnahme?.gelesenBis, 'Unterhaltung wurde nicht als gelesen markiert').toBeInstanceOf(Date);
          },
        };
      },
    },
  ];
}

/** Tickets: `ticket.anlegen` (alle Rollen), `ticket.bearbeiten` (nur Administration), `ticket.lesen` (alle Rollen). */
function ticketFaelle(): Fall[] {
  const zustand = () => momentaufnahme(db, [schema.ticket, schema.ticketKommentar]);
  const befund = (p: Person, z: Ziel | undefined) =>
    p.name === 'Organisationsredaktion gt' && z?.organisation === 'kt' ? BEFUND_TICKET : undefined;
  return [
    {
      aktion: 'neuesTicket',
      datei: 'tickets',
      ziele: ORG_ZIELE,
      pruefungen: () => [{ aktion: 'ticket.anlegen' }],
      abweisung: () => KEIN_RECHT_RUECKGABE,
      bekannt: befund,
      aufbau: async (p, z) => {
        await anmelden(p);
        const vorher = await zeilenZahl(schema.ticket);
        return {
          aufruf: async () =>
            (await ladeAktionen()).tickets.neuesTicket(
              {},
              formular({ titel: 'Testticket', beschreibung: 'Testbeschreibung', prioritaet: 'mittel', organisation: org(z) }),
            ),
          zustand,
          wirkung: async () => {
            expect(await zeilenZahl(schema.ticket), 'Ticket wurde nicht angelegt').toBe(vorher + 1);
          },
        };
      },
    },
    {
      aktion: 'aendereTicket',
      datei: 'tickets',
      ziele: ORG_ZIELE,
      pruefungen: (z) => [{ aktion: 'ticket.bearbeiten', ziel: { organisation: orgOderNull(z) } }],
      abweisung: () => KEIN_RECHT_RUECKGABE,
      aufbau: async (p, z) => {
        const id = await ticketDirekt(db, { organisation: orgOderNull(z) });
        await anmelden(p);
        return {
          aufruf: async () =>
            (await ladeAktionen()).tickets.aendereTicket({}, formular({ id, status: 'in_bearbeitung', prioritaet: 'hoch' })),
          zustand,
          wirkung: async () => {
            const [zeile] = await db.select().from(schema.ticket).where(eq(schema.ticket.id, id));
            expect(zeile?.status, 'Status des Tickets wurde nicht geändert').toBe('in_bearbeitung');
          },
        };
      },
    },
    {
      aktion: 'kommentiereTicket',
      datei: 'tickets',
      ziele: ORG_ZIELE,
      pruefungen: () => [{ aktion: 'ticket.lesen' }, { aktion: 'ticket.anlegen' }],
      abweisung: () => KEIN_RECHT_RUECKGABE,
      bekannt: befund,
      aufbau: async (p, z) => {
        const id = await ticketDirekt(db, { organisation: orgOderNull(z) });
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).tickets.kommentiereTicket({}, formular({ id, text: 'Testkommentar' })),
          zustand,
          wirkung: async () => {
            expect(
              await db.select().from(schema.ticketKommentar).where(eq(schema.ticketKommentar.ticketId, id)),
              'Kommentar fehlt',
            ).toHaveLength(1);
          },
        };
      },
    },
  ];
}

/** Seiteninhalte: `seiteninhalt.*` (Redaktion, Administration), Organisationsseiten mit Organisationsbezug. */
function seiteninhaltFaelle(): Fall[] {
  const zustand = () => momentaufnahme(db, [schema.seiteninhalt, schema.auditEintrag]);
  return [
    {
      aktion: 'speichereSeiteninhalt',
      datei: 'seiteninhalte',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'seiteninhalt.lesen' }, { aktion: 'seiteninhalt.bearbeiten' }],
      abweisung: () => KEIN_RECHT_RUECKGABE,
      aufbau: async (p) => {
        await anmelden(p);
        return {
          // Ein unbekannter Bereich endet nach der Rechteprüfung mit „nichtGefunden“; gespeichert wird nichts.
          aufruf: async () =>
            (await ladeAktionen()).seiteninhalte.speichereSeiteninhalt({}, formular({ bereich: 'unbekannt', inhalt: '{}' })),
          zustand,
          wirkung: async (a) => {
            expect(rueckgabe(a)).toMatchObject({ fehler: 'nichtGefunden' });
          },
        };
      },
    },
    {
      // Marktstart P3: „Jetzt aus dem Feed holen“ (Aus dem Dachverband). Der Feed antwortet hier mit 404 (kein Netz,
      // keine Wiederholung): Es wird nichts geschrieben; ab dem zweiten erlaubten Aufruf greift die Ratenbegrenzung.
      aktion: 'holeDachverbandFeed',
      datei: 'seiteninhalte',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'seiteninhalt.bearbeiten' }],
      abweisung: () => KEIN_RECHT_RUECKGABE,
      aufbau: async (p) => {
        await anmelden(p);
        return {
          aufruf: async () => {
            vi.stubGlobal('fetch', async () => new Response('', { status: 404 }));
            try {
              return await (await ladeAktionen()).seiteninhalte.holeDachverbandFeed({}, formular({}));
            } finally {
              vi.unstubAllGlobals();
            }
          },
          zustand,
          wirkung: async (a) => {
            const r = rueckgabe(a) as { fehler?: string; ergebnis?: { status: string } };
            if (r.fehler) expect(r.fehler).toBe('zuOft');
            else expect(r.ergebnis).toMatchObject({ status: 'fehler' });
          },
        };
      },
    },
    {
      aktion: 'speichereKontakt',
      datei: 'seiteninhalte-organisationen',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'seiteninhalt.bearbeiten' }],
      abweisung: () => KEIN_RECHT_RUECKGABE,
      aufbau: async (p) => {
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).seiteninhalteOrganisationen.speichereKontakt({}, formular({})),
          zustand,
          wirkung: async (a) => {
            expect(rueckgabe(a)).toMatchObject({ fehler: 'unlesbar' });
          },
        };
      },
    },
    {
      aktion: 'speichereOrganisation',
      datei: 'seiteninhalte-organisationen',
      ziele: [
        { name: 'Organisation gt (eigene)', ziel: { organisation: 'gt' } },
        { name: 'Organisation kt (fremde)', ziel: { organisation: 'kt' } },
      ],
      pruefungen: (z) => [{ aktion: 'organisationsinhalt.bearbeiten', ziel: { organisation: orgOderNull(z) } }],
      abweisung: () => KEIN_RECHT_RUECKGABE,
      aufbau: async (p, z) => {
        await anmelden(p);
        return {
          aufruf: async () =>
            (await ladeAktionen()).seiteninhalteOrganisationen.speichereOrganisation(gesetzteOrganisation(z), {}, formular({})),
          zustand,
          wirkung: async (a) => {
            expect(rueckgabe(a)).toMatchObject({ fehler: 'unlesbar' });
          },
        };
      },
    },
  ];
}

/** Gebetszeiten: alle Actions verlangen `gebetszeiten.bearbeiten` (nur Redaktion und Administration). */
function gebetszeitenFaelle(): Fall[] {
  const zustand = () => momentaufnahme(db, [schema.einstellung, schema.gebetszeitTag, schema.auditEintrag]);
  const recht = (): Pruefung[] => [{ aktion: 'gebetszeiten.bearbeiten' }];
  const einfach = (aktion: string, aufruf: (a: Aktionen) => Promise<unknown>, wirkung: (a: Ausgang) => void): Fall => ({
    aktion,
    datei: 'gebetszeiten',
    ziele: OHNE_ZIEL,
    pruefungen: recht,
    abweisung: () => 'werfen',
    aufbau: async (p) => {
      await anmelden(p);
      return {
        aufruf: async () => aufruf(await ladeAktionen()),
        zustand,
        wirkung: async (a) => {
          wirkung(a);
        },
      };
    },
  });
  return [
    einfach(
      'speichereQuelle',
      (a) => a.gebetszeiten.speichereQuelle({}, formular({})),
      (a) => expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen' }),
    ),
    einfach(
      'speichereBerechnung',
      (a) => a.gebetszeiten.speichereBerechnung({}, formular({})),
      (a) => expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen' }),
    ),
    einfach(
      'pruefeImport',
      (a) => a.gebetszeiten.pruefeImport({}, formular({})),
      (a) => expect(rueckgabe(a)).toMatchObject({ fehler: 'datei' }),
    ),
    einfach(
      'uebernehmeImport',
      (a) => a.gebetszeiten.uebernehmeImport({}, formular({})),
      (a) => expect(rueckgabe(a).importFehler, 'Leere Datei muss als Importfehler enden').toBeDefined(),
    ),
    einfach(
      'entferneImport',
      (a) => a.gebetszeiten.entferneImport(formular({ id: randomUUID() })),
      (a) => expect(a.weiter).toBe('/verwaltung/gebetszeiten?entfernt=1'),
    ),
    // IGMG-Abgleich und Näherung (Marktstart P6, ADR 0048)
    einfach(
      'speichereAbgleich',
      (a) => a.gebetszeiten.speichereAbgleich({}, formular({})),
      (a) => expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen' }),
    ),
    einfach(
      'gleicheJetztAb',
      (a) => a.gebetszeiten.gleicheJetztAb({}, formular({})),
      // Ohne GEBETSZEITEN_IGMG_URL und ohne Jahresdatei tut der Abgleich nichts; ab dem zweiten Aufruf greift die Grenze
      (a) => expect([undefined, 'zuOft']).toContain((rueckgabe(a) as { fehler?: string }).fehler),
    ),
    einfach(
      'gebeAbgleichFrei',
      (a) => a.gebetszeiten.gebeAbgleichFrei({}, formular({})),
      (a) => expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen' }),
    ),
    einfach(
      'uebernehmeKonflikte',
      (a) => a.gebetszeiten.uebernehmeKonflikte({}, formular({})),
      (a) => expect(rueckgabe(a)).toMatchObject({ uebernommen: 0 }),
    ),
    einfach(
      'schlageNaeherungVor',
      (a) => a.gebetszeiten.schlageNaeherungVor({}, formular({})),
      (a) => expect(rueckgabe(a)).toMatchObject({ fehler: 'zuWenigeTage' }),
    ),
    einfach(
      'uebernehmeNaeherung',
      (a) => a.gebetszeiten.uebernehmeNaeherung({}, formular({})),
      (a) => expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen' }),
    ),
  ];
}

/** Startklar-Cockpit (V-11, ML-03): Konzept-Hinweis schalten nur mit `einstellung.bearbeiten`. */
function startklarFaelle(): Fall[] {
  return [
    {
      aktion: 'setzeKonzepthinweis',
      datei: 'startklar',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'einstellung.bearbeiten' }],
      abweisung: () => KEIN_RECHT_RUECKGABE,
      aufbau: async (p) => {
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).startklar.setzeKonzepthinweis({}, formular({ konzepthinweis: 'false' })),
          zustand: () => momentaufnahme(db, [schema.einstellung]),
          wirkung: async (a) => {
            expect(rueckgabe(a)).not.toMatchObject({ fehler: 'keinRecht' });
          },
        };
      },
    },
  ];
}

function einstellungenFaelle(): Fall[] {
  return [
    {
      aktion: 'speichereLoeschfristen',
      datei: 'einstellungen',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'einstellung.bearbeiten' }],
      abweisung: () => KEIN_RECHT_RUECKGABE,
      aufbau: async (p) => {
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).einstellungen.speichereLoeschfristen({}, formular({})),
          zustand: () => momentaufnahme(db, [schema.einstellung]),
          wirkung: async (a) => {
            expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen' });
          },
        };
      },
    },
  ];
}

/** Benutzer: Einladen und Widerrufen mit `benutzer.einladen`, Konten mit `benutzer.bearbeiten` (nur Administration). */
function benutzerFaelle(): Fall[] {
  const zustand = () => momentaufnahme(db, [schema.user, schema.rolleZuweisung, schema.einladung, schema.auditEintrag]);
  const konto = async (id: string) => (await db.select().from(schema.user).where(eq(schema.user.id, id)))[0];
  return [
    {
      aktion: 'einladen',
      datei: 'benutzer',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'benutzer.einladen' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).benutzer.einladen({}, formular({})),
          zustand,
          wirkung: async (a) => {
            expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen' });
          },
        };
      },
    },
    {
      aktion: 'einladungWiderrufen',
      datei: 'benutzer',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'benutzer.einladen' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        await anmelden(p);
        return {
          // Unbekannte Einladung: Die Action leitet trotzdem zur Liste weiter und ändert nichts.
          aufruf: async () => (await ladeAktionen()).benutzer.einladungWiderrufen(formular({ id: randomUUID() })),
          zustand,
          wirkung: async (a) => {
            expect(a.weiter).toBe('/verwaltung/benutzer?meldung=widerrufen');
          },
        };
      },
    },
    {
      aktion: 'rollenSpeichern',
      datei: 'benutzer',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'benutzer.bearbeiten' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        const ziel = await benutzerDirekt(db, [{ rolle: 'redaktion' }]);
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).benutzer.rollenSpeichern({}, formular({ id: ziel, rollen: 'bildung' })),
          zustand,
          wirkung: async () => {
            const rollen = await db.select().from(schema.rolleZuweisung).where(eq(schema.rolleZuweisung.benutzerId, ziel));
            expect(
              rollen.map((r) => r.rolle),
              'Rollen wurden nicht geändert',
            ).toEqual(['bildung']);
          },
        };
      },
    },
    {
      aktion: 'kontoSperren',
      datei: 'benutzer',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'benutzer.bearbeiten' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        const ziel = await benutzerDirekt(db);
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).benutzer.kontoSperren(formular({ id: ziel })),
          zustand,
          wirkung: async (a) => {
            expect(a.weiter).toBe(`/verwaltung/benutzer/${ziel}?meldung=gesperrt`);
            expect((await konto(ziel))?.gesperrtAm).toBeInstanceOf(Date);
          },
        };
      },
    },
    {
      aktion: 'kontoEntsperren',
      datei: 'benutzer',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'benutzer.bearbeiten' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        const ziel = await benutzerDirekt(db, [], { gesperrtAm: new Date() });
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).benutzer.kontoEntsperren(formular({ id: ziel })),
          zustand,
          wirkung: async (a) => {
            expect(a.weiter).toBe(`/verwaltung/benutzer/${ziel}?meldung=entsperrt`);
            expect((await konto(ziel))?.gesperrtAm, 'Konto ist noch gesperrt').toBeNull();
          },
        };
      },
    },
    {
      aktion: 'zweiFaktorZuruecksetzen',
      datei: 'benutzer',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'benutzer.bearbeiten' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        const ziel = await benutzerDirekt(db, [], { twoFactorEnabled: true });
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).benutzer.zweiFaktorZuruecksetzen(formular({ id: ziel })),
          zustand,
          wirkung: async (a) => {
            expect(a.weiter).toBe(`/verwaltung/benutzer/${ziel}?meldung=zweiFaktor`);
            expect((await konto(ziel))?.twoFactorEnabled, 'Zwei-Faktor wurde nicht zurückgesetzt').toBe(false);
          },
        };
      },
    },
    {
      aktion: 'kontoLoeschen',
      datei: 'benutzer',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'benutzer.bearbeiten' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        const ziel = await benutzerDirekt(db);
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).benutzer.kontoLoeschen(formular({ id: ziel })),
          zustand,
          wirkung: async (a) => {
            expect(a.weiter).toBe('/verwaltung/benutzer?meldung=geloescht');
            expect(await konto(ziel), 'Konto wurde nicht gelöscht').toBeUndefined();
          },
        };
      },
    },
    {
      aktion: 'passwortAendern',
      datei: 'benutzer',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'verwaltung.betreten' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).benutzer.passwortAendern({}, formular({})),
          zustand,
          wirkung: async (a) => {
            expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen' });
          },
        };
      },
    },
    {
      aktion: 'ersatzcodesErzeugen',
      datei: 'benutzer',
      ziele: OHNE_ZIEL,
      pruefungen: () => [{ aktion: 'verwaltung.betreten' }],
      abweisung: () => 'werfen',
      aufbau: async (p) => {
        await anmelden(p);
        return {
          aufruf: async () => (await ladeAktionen()).benutzer.ersatzcodesErzeugen({}, formular({})),
          zustand,
          wirkung: async (a) => {
            expect(rueckgabe(a)).toMatchObject({ fehler: 'pruefen' });
          },
        };
      },
    },
  ];
}

/** Alle Fälle der Rechte-Matrix: je Action die Matrix-Prüfungen aus dem Code. */
const FAELLE: Fall[] = [
  ...inhaltFaelle(veranstaltung, {
    speichern: 'speichereVeranstaltung',
    inPapierkorb: 'inPapierkorb',
    wiederherstellen: 'wiederherstellen',
    endgueltigLoeschen: 'endgueltigLoeschen',
  }),
  ...inhaltFaelle(neuigkeit, {
    speichern: 'speichereNeuigkeit',
    inPapierkorb: 'inPapierkorb',
    wiederherstellen: 'wiederherstellen',
    endgueltigLoeschen: 'endgueltigLoeschen',
  }),
  ...inhaltFaelle(ankuendigung, {
    speichern: 'speichereAnkuendigung',
    inPapierkorb: 'inPapierkorb',
    wiederherstellen: 'wiederherstellen',
    endgueltigLoeschen: 'endgueltigLoeschen',
  }),
  ...inhaltFaelle(kurs, {
    speichern: 'speichereKurs',
    inPapierkorb: 'inPapierkorb',
    wiederherstellen: 'wiederherstellen',
    endgueltigLoeschen: 'endgueltigLoeschen',
  }),
  ...medienFaelle(),
  ...eingangFaelle(),
  ...postfachFaelle(),
  ...ticketFaelle(),
  ...seiteninhaltFaelle(),
  ...gebetszeitenFaelle(),
  ...einstellungenFaelle(),
  ...startklarFaelle(),
  ...benutzerFaelle(),
];

for (const fall of FAELLE) {
  describe(`${fall.datei}.${fall.aktion}${fall.modus ? ` (${fall.modus})` : ''}`, () => {
    for (const { name, ziel } of fall.ziele) {
      for (const p of PERSONEN) {
        const darfJa = erlaubt(p, fall.pruefungen(ziel));
        const titel = `${p.name} · ${name}: ${darfJa ? 'zugelassen' : 'abgewiesen'}`;
        const pruefung = async () => {
          const aufbau = await fall.aufbau(p, ziel);
          const vorher = await aufbau.zustand();
          const ergebnis = await ausgang(aufbau.aufruf);
          if (darfJa) {
            pruefeZulassung(ergebnis);
            await aufbau.wirkung(ergebnis);
          } else {
            pruefeAbweisung(ergebnis, fall.abweisung(p, ziel));
            expect(await aufbau.zustand(), 'Der Datenbestand hat sich bei der Abweisung verändert').toBe(vorher);
          }
        };
        const befund = darfJa ? fall.bekannt?.(p, ziel) : undefined;
        if (befund) it.fails(`${titel} – BEFUND: ${befund}`, pruefung);
        else it(titel, pruefung);
      }
    }
  });
}

describe('Organisationsgrenze der Tickets (dokumentierte Regel über die Matrix hinaus)', () => {
  const organisationsredaktionGt: Person = {
    name: 'Organisationsredaktion gt',
    rollen: [{ rolle: 'organisationsredaktion', organisation: 'gt' }],
    zweiFaktor: true,
  };

  it('neues Ticket der Organisation kt wird abgewiesen, die Datenbank bleibt unverändert', async () => {
    await anmelden(organisationsredaktionGt);
    const vorher = await momentaufnahme(db, [schema.ticket]);
    const ergebnis = await ausgang(async () =>
      (await ladeAktionen()).tickets.neuesTicket(
        {},
        formular({ titel: 'Testticket', beschreibung: 'Testbeschreibung', prioritaet: 'mittel', organisation: 'kt' }),
      ),
    );
    pruefeAbweisung(ergebnis, ORGANISATION_PRUEFEN);
    expect(await momentaufnahme(db, [schema.ticket])).toBe(vorher);
  });

  it('Kommentar zu einem Ticket der Organisation kt wird als nichtGefunden beantwortet', async () => {
    const id = await ticketDirekt(db, { organisation: 'kt' });
    await anmelden(organisationsredaktionGt);
    const ergebnis = await ausgang(async () =>
      (await ladeAktionen()).tickets.kommentiereTicket({}, formular({ id, text: 'Testkommentar' })),
    );
    pruefeAbweisung(ergebnis, { wert: { fehler: 'nichtGefunden' } });
  });
});

/**
 * Aktionen mit einer Regel über die Matrix hinaus: `rollenAntragEntscheiden` (Vier-Augen-Prinzip für Schutzrollen,
 * S2/S3) verlangt `verwaltung.betreten` und zusätzlich eine wirksame Rolle Leitung oder Kinderschutz ohne Administration,
 * nicht die beantragende und nicht die betroffene Person. Keine Personengruppe der Liste erfüllt das – alle werden
 * abgewiesen; die zweite Person (Leitung) ist zugelassen. Weitere Fälle: tests/integration/sicherheit-s2-konten.test.ts.
 */
const SONDERREGEL_AKTIONEN = ['benutzer.rollenAntragEntscheiden'];

describe('benutzer.rollenAntragEntscheiden (Vier-Augen-Prinzip, Regel über die Matrix hinaus)', () => {
  async function antrag(): Promise<string> {
    const ziel = await benutzerDirekt(db);
    const [a] = await db
      .insert(schema.rollenAntrag)
      .values({ benutzerId: ziel, rolle: 'kinderschutz', beantragtVon: null })
      .returning({ id: schema.rollenAntrag.id });
    return a.id;
  }
  const zustand = () => momentaufnahme(db, [schema.rollenAntrag, schema.rolleZuweisung, schema.auditEintrag]);

  for (const p of PERSONEN) {
    it(`${p.name}: abgewiesen`, async () => {
      const id = await antrag();
      await anmelden(p);
      const vorher = await zustand();
      const e = await ausgang(async () =>
        (await ladeAktionen()).benutzer.rollenAntragEntscheiden(formular({ id, entscheidung: 'bestaetigen' })),
      );
      pruefeAbweisung(e, 'werfen');
      expect(await zustand(), 'Der Datenbestand hat sich bei der Abweisung verändert').toBe(vorher);
    });
  }

  it('Leitung als zweite Person: zugelassen, die Rolle wird wirksam', async () => {
    const id = await antrag();
    const [{ benutzerId }] = await db
      .select({ benutzerId: schema.rollenAntrag.benutzerId })
      .from(schema.rollenAntrag)
      .where(eq(schema.rollenAntrag.id, id));
    await anmelden({ name: 'Leitung', rollen: [{ rolle: 'leitung' }], zweiFaktor: true });
    const e = await ausgang(async () =>
      (await ladeAktionen()).benutzer.rollenAntragEntscheiden(formular({ id, entscheidung: 'bestaetigen' })),
    );
    expect(e.weiter).toBe('/verwaltung/gemeinde-im-blick?rollenantrag=bestaetigt#rollenantraege');
    const rollen = await db
      .select({ rolle: schema.rolleZuweisung.rolle })
      .from(schema.rolleZuweisung)
      .where(and(eq(schema.rolleZuweisung.benutzerId, benutzerId), eq(schema.rolleZuweisung.rolle, 'kinderschutz')));
    expect(rollen).toHaveLength(1);
  });
});

describe('Vollständigkeit: jede exportierte Server Action ist erfasst', () => {
  it('stimmt mit den Fällen der Matrix und der Anmeldung überein', async () => {
    const a = await ladeAktionen();
    const funktionen = (datei: string, modul: object) =>
      Object.entries(modul)
        .filter(([, wert]) => typeof wert === 'function')
        .map(([name]) => `${datei}.${name}`);
    const exportiert = [
      ...funktionen('veranstaltungen', a.veranstaltungen),
      ...funktionen('neuigkeiten', a.neuigkeiten),
      ...funktionen('ankuendigungen', a.ankuendigungen),
      ...funktionen('kurse', a.kurse),
      ...funktionen('medien', a.medien),
      ...funktionen('eingaenge', a.eingaenge),
      ...funktionen('postfach', a.postfach),
      ...funktionen('tickets', a.tickets),
      ...funktionen('seiteninhalte', a.seiteninhalte),
      ...funktionen('seiteninhalte-organisationen', a.seiteninhalteOrganisationen),
      ...funktionen('gebetszeiten', a.gebetszeiten),
      ...funktionen('einstellungen', a.einstellungen),
      ...funktionen('startklar', a.startklar),
      ...funktionen('benutzer', a.benutzer),
      ...funktionen('anmeldung', a.anmeldung),
    ].sort();
    const erfasst = [...new Set([...FAELLE.map((f) => `${f.datei}.${f.aktion}`), ...ANMELDUNG_AKTIONEN, ...SONDERREGEL_AKTIONEN])].sort();
    expect(erfasst).toEqual(exportiert);
  });
});
