import { randomUUID } from 'node:crypto';
import type { PgTable } from 'drizzle-orm/pg-core';
import { expect } from 'vitest';
import { schema } from '@/lib/db';
import type { EingangArt } from '@/lib/eingaenge/arten';
import { verschluessele } from '@/lib/krypto';
import { darf, type Aktion, type OrganisationKuerzel, type RollenZuweisung } from '@/lib/rechte/matrix';
import { angemeldetAls, formular, type verwaltungsUmgebung } from '../hilfen/verwaltung';

/**
 * Gemeinsame Bausteine der Rechte-Matrix-Tests der Verwaltung (Paket C17, Z-06).
 * Erwartung je Fall: `darf()` aus der Matrix (web/src/lib/rechte/matrix.ts) über die Matrix-Prüfungen, die die Action
 * laut Code ausführt. Die Zuordnung Action → Matrix-Prüfung ist in `rechte-matrix.test.ts` je Action dokumentiert.
 * Testdaten sind fiktiv (G-04): „Testperson …“ und Adressen unter @example.test.
 */
export type Datenbank = Awaited<ReturnType<typeof verwaltungsUmgebung>>['db'];
export { formular };

/** Angemeldete Person aus der Matrix-Sicht. `rollen: null` = ohne Sitzung. */
export type Person = { name: string; rollen: RollenZuweisung[] | null; zweiFaktor: boolean };

/** Alle Personengruppen, die jeder Fall durchläuft (Rollen × Sitzungszustand). */
export const PERSONEN: Person[] = [
  { name: 'ohne Sitzung', rollen: null, zweiFaktor: true },
  { name: 'ohne zweiten Faktor', rollen: [{ rolle: 'administration' }], zweiFaktor: false },
  { name: 'ohne Rolle', rollen: [], zweiFaktor: true },
  { name: 'Administration', rollen: [{ rolle: 'administration' }], zweiFaktor: true },
  { name: 'Redaktion', rollen: [{ rolle: 'redaktion' }], zweiFaktor: true },
  { name: 'Organisationsredaktion gt', rollen: [{ rolle: 'organisationsredaktion', organisation: 'gt' }], zweiFaktor: true },
  { name: 'Bildung', rollen: [{ rolle: 'bildung' }], zweiFaktor: true },
  { name: 'Mitgliederverwaltung', rollen: [{ rolle: 'mitgliederverwaltung' }], zweiFaktor: true },
];

/** Ziel eines Falls: Organisation des Datensatzes und, für Eingänge, die Eingangsart. */
export type Ziel = { organisation?: OrganisationKuerzel | null; art?: EingangArt };

/** Eine Matrix-Prüfung der Action: ein Recht, bei organisationsgebundenen Rechten am Ziel. */
export type Pruefung = { aktion: Aktion; ziel?: { organisation?: OrganisationKuerzel | null } };

/** Erwartung aus der Matrix: zugelassen genau dann, wenn jede Prüfung der Action `darf()` besteht. */
export function erlaubt(p: Person, pruefungen: Pruefung[]): boolean {
  if (p.rollen === null || !p.zweiFaktor) return false;
  const rollen = p.rollen;
  return pruefungen.every((pr) => darf(rollen, pr.aktion, pr.ziel));
}

/** Ergebnis eines Aufrufs: Rückgabewert, Weiterleitung, Rechte-Abweisung (KEIN_RECHT) oder unerwarteter Fehler. */
export type Ausgang = { wert?: unknown; kein?: boolean; weiter?: string; fehler?: unknown };

export async function ausgang(aufruf: () => Promise<unknown>): Promise<Ausgang> {
  try {
    return { wert: await aufruf() };
  } catch (e) {
    const meldung = e instanceof Error ? e.message : '';
    if (meldung === 'KEIN_RECHT') return { kein: true };
    if (meldung.startsWith('NEXT_REDIRECT:')) return { weiter: meldung.slice('NEXT_REDIRECT:'.length) };
    return { fehler: e };
  }
}

/**
 * Erwartete Abweisung: `werfen` = KEIN_RECHT wird geworfen; `stumm` = Rückgabe ohne Fehler und ohne Wirkung
 * (Gelesen-Markierung); sonst ein Rückgabeobjekt der Action (z. B. `{ fehler: 'keinRecht' }`).
 */
export type Abweisung = 'werfen' | 'stumm' | { wert: Record<string, unknown> };

export const KEIN_RECHT_RUECKGABE: Abweisung = { wert: { fehler: 'keinRecht' } };
export const ORGANISATION_PRUEFEN: Abweisung = { wert: { fehler: 'pruefen', feldFehler: { organisation: 'organisation' } } };

export function pruefeAbweisung(a: Ausgang, erwartet: Abweisung): void {
  if (erwartet === 'werfen') {
    expect(a, 'Erwartet: Abweisung mit KEIN_RECHT').toEqual({ kein: true });
    return;
  }
  if (erwartet === 'stumm') {
    expect(a, 'Erwartet: stille Abweisung ohne Fehler und ohne Weiterleitung').toEqual({ wert: undefined });
    return;
  }
  expect(a.kein, 'Abweisung über Rückgabe erwartet, stattdessen KEIN_RECHT geworfen').toBeUndefined();
  expect(a.weiter, 'Abweisung über Rückgabe erwartet, stattdessen Weiterleitung').toBeUndefined();
  expect(a.wert).toMatchObject(erwartet.wert);
}

/** Zugelassen: kein KEIN_RECHT, kein unerwarteter Fehler, keine Rückgabe „keinRecht“. Die Wirkung prüft der Fall. */
export function pruefeZulassung(a: Ausgang): void {
  expect(a.kein, 'Zugelassen erwartet, die Rechteprüfung hat aber mit KEIN_RECHT abgewiesen').toBeUndefined();
  expect(a.fehler, 'Zugelassen erwartet, unerwarteter Fehler der Action').toBeUndefined();
  expect((a.wert as { fehler?: unknown } | undefined)?.fehler, 'Zugelassen erwartet, Rückgabe meldet „keinRecht“').not.toBe('keinRecht');
}

/** Momentaufnahme der genannten Tabellen (sortiert, damit sie sich vergleichen lässt). */
export async function momentaufnahme(db: Datenbank, tabellen: PgTable[]): Promise<string> {
  const teile: string[] = [];
  for (const tabelle of tabellen) {
    const zeilen = await db.select().from(tabelle);
    teile.push(
      zeilen
        .map((z) => JSON.stringify(z))
        .sort()
        .join('\n'),
    );
  }
  return teile.join('\n§\n');
}

/** Meldet die Person an (Rollen und zweiter Faktor wie im Fall). Liefert die Konto-ID oder null ohne Sitzung. */
export async function anmelden(p: Person): Promise<string | null> {
  return angemeldetAls(p.rollen, p.zweiFaktor);
}

/** Meldet als Administration an, um Fixtures über die Actions anzulegen. */
export async function alsAdministration(): Promise<void> {
  await angemeldetAls([{ rolle: 'administration' }]);
}

/** Leitet aus einer Weiterleitung die ID des neuen Datensatzes ab (`…/<id>?angelegt=1`). */
export async function idAusWeiterleitung(aufruf: () => Promise<unknown>): Promise<string> {
  const a = await ausgang(aufruf);
  const treffer = /\/([0-9a-f-]{36})\?angelegt=1$/.exec(a.weiter ?? '');
  if (!treffer) throw new Error(`Anlegen ohne Weiterleitung: ${JSON.stringify(a.wert ?? a.fehler ?? null)}`);
  return treffer[1];
}

/** Konto direkt in der Datenbank (fiktiv). */
export async function benutzerDirekt(
  db: Datenbank,
  rollen: RollenZuweisung[] = [],
  werte: Partial<typeof schema.user.$inferInsert> = {},
): Promise<string> {
  const id = randomUUID();
  await db.insert(schema.user).values({
    id,
    name: 'Testperson Zwei',
    email: `testperson.${id.slice(0, 8)}@example.test`,
    emailVerified: true,
    twoFactorEnabled: false,
    ...werte,
  });
  if (rollen.length)
    await db
      .insert(schema.rolleZuweisung)
      .values(rollen.map((r) => ({ benutzerId: id, rolle: r.rolle, organisation: r.organisation ?? null })));
  return id;
}

/** Veranstaltung direkt in der Datenbank (für Anmeldungen, ohne Action). */
export async function veranstaltungDirekt(db: Datenbank, organisation: OrganisationKuerzel | null): Promise<string> {
  const [z] = await db
    .insert(schema.veranstaltung)
    .values({
      slug: `test-${randomUUID().slice(0, 8)}`,
      titel: { de: 'Testveranstaltung' },
      kategorie: 'jugend',
      organisation,
      beginn: new Date(Date.now() + 5 * 86_400_000),
      status: 'veroeffentlicht',
      anmeldungAktiv: true,
    })
    .returning({ id: schema.veranstaltung.id });
  return z.id;
}

/** Eingang direkt in der Datenbank. Anmeldungen hängen an einer Veranstaltung der angegebenen Organisation. */
export async function eingangDirekt(db: Datenbank, art: EingangArt, organisation: OrganisationKuerzel | null): Promise<string> {
  const bezugId = art === 'veranstaltungsanmeldung' ? await veranstaltungDirekt(db, organisation) : null;
  const daten = art === 'veranstaltungsanmeldung' ? { name: 'Testperson Sieben' } : { vorname: 'Testperson', motivation: 'Test' };
  const verschluesselt = verschluessele(daten);
  const [z] = await db
    .insert(schema.eingang)
    .values({ art, status: 'neu', datenVerschluesselt: verschluesselt.daten, schluesselId: verschluesselt.schluesselId, bezugId })
    .returning({ id: schema.eingang.id });
  return z.id;
}

/** Ticket direkt in der Datenbank (so schreibt das Meldeformular, C10b). */
export async function ticketDirekt(db: Datenbank, werte: Partial<typeof schema.ticket.$inferInsert> = {}): Promise<string> {
  const [neu] = await db
    .insert(schema.ticket)
    .values({ titel: 'Testticket', beschreibung: 'Testbeschreibung', status: 'offen', prioritaet: 'mittel', ...werte })
    .returning({ id: schema.ticket.id });
  return neu.id;
}

/** Medium direkt in der Datenbank (ohne Datei; die Actions der Medien prüfen nur Zeile und Wirkung). */
export async function mediumDirekt(db: Datenbank, imPapierkorb: boolean): Promise<string> {
  const id = randomUUID();
  const [z] = await db
    .insert(schema.medium)
    .values({
      schluessel: `testbild/${id}.jpg`,
      typ: 'image/jpeg',
      groesse: 10,
      breite: 40,
      hoehe: 30,
      alt: { de: 'Testbild' },
      dateiname: 'testbild.jpg',
      imPapierkorbSeit: imPapierkorb ? new Date() : null,
    })
    .returning({ id: schema.medium.id });
  return z.id;
}

/**
 * Unterhaltung mit einer Nachricht des anderen Kontos. Ist `subjektId` gesetzt, nimmt die Person teil und hat
 * die Nachricht noch nicht gelesen (`gelesen_bis` leer).
 */
export async function unterhaltungMit(db: Datenbank, andererId: string, subjektId: string | null): Promise<string> {
  const [u] = await db
    .insert(schema.unterhaltung)
    .values({ betreff: 'Testbetreff', erstelltVon: andererId })
    .returning({ id: schema.unterhaltung.id });
  const teilnehmer = [andererId, ...(subjektId ? [subjektId] : [])];
  await db.insert(schema.unterhaltungTeilnehmer).values(teilnehmer.map((benutzerId) => ({ unterhaltungId: u.id, benutzerId })));
  await db.insert(schema.postfachNachricht).values({ unterhaltungId: u.id, absenderId: andererId, text: 'Testnachricht' });
  return u.id;
}

/** Anmeldung und Konto (nicht rollengeschützt): im Test `rechte-anmeldung.test.ts` geprüft, hier für die Vollständigkeitsprüfung gelistet. */
export const ANMELDUNG_AKTIONEN = [
  'anmeldung.anmelden',
  'anmeldung.zweiFaktorPruefen',
  'anmeldung.zweiFaktorStarten',
  'anmeldung.zweiFaktorBestaetigen',
  'anmeldung.abmelden',
  'anmeldung.einladungAnnehmen',
  'anmeldung.passwortVergessen',
  'anmeldung.passwortNeuSetzen',
];

/** Die Actions der Verwaltung, erst nach der Testumgebung geladen (sonst bekäme die Action keine Testdatenbank). */
let aktionenCache: Awaited<ReturnType<typeof ladeAktionenNeu>> | undefined;
async function ladeAktionenNeu() {
  return {
    veranstaltungen: await import('@/server/actions/veranstaltungen'),
    neuigkeiten: await import('@/server/actions/neuigkeiten'),
    ankuendigungen: await import('@/server/actions/ankuendigungen'),
    kurse: await import('@/server/actions/kurse'),
    medien: await import('@/server/actions/medien'),
    eingaenge: await import('@/server/actions/eingaenge'),
    postfach: await import('@/server/actions/postfach'),
    tickets: await import('@/server/actions/tickets'),
    seiteninhalte: await import('@/server/actions/seiteninhalte'),
    seiteninhalteOrganisationen: await import('@/server/actions/seiteninhalte-organisationen'),
    gebetszeiten: await import('@/server/actions/gebetszeiten'),
    einstellungen: await import('@/server/actions/einstellungen'),
    benutzer: await import('@/server/actions/benutzer'),
    anmeldung: await import('@/server/actions/anmeldung'),
  };
}
export async function ladeAktionen() {
  aktionenCache ??= await ladeAktionenNeu();
  return aktionenCache;
}
