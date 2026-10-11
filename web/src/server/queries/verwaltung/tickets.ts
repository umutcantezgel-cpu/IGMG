import 'server-only';
import { and, asc, count, desc, eq, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { entschluessele } from '@/lib/krypto';
import type { OrganisationKuerzel } from '@/lib/rechte/matrix';
import { darf, organisationsFilter, type Angemeldet } from '@/lib/rechte/pruefe';
import {
  melderSchema,
  type ListenFilter,
  type Melder,
  type TicketPrioritaet,
  type TicketStatus,
  type TicketTyp,
} from '@/lib/validierung/ticket';

/**
 * Verwaltung „Tickets“ (V10, ADR 0005, G-07). Ohne Cache: Verwaltungsseiten sind dynamisch (ADR 0016).
 * Aufrufer prüfen vorher das Lese- bzw. Schreibrecht.
 *
 * Organisationsbezug (K-06): Die Matrix bindet `ticket.*` nicht an Organisationen. Die Organisationsredaktion sieht und
 * bearbeitet deshalb nur Tickets ihrer Organisation oder ohne Organisation; diese Grenze leitet das Modul aus
 * `organisationsFilter` ab und setzt sie in jeder Abfrage und in jeder Action selbst durch.
 *
 * Kontaktangaben der meldenden Person (`melder_verschluesselt`) erscheinen nur im Detail, nur mit `ticket.bearbeiten`,
 * und jeder Abruf steht im Audit-Log (`ticket.gelesen`, ohne Inhalt). Liste und Zähler lesen sie nie.
 */
const t = schema.ticket;
const k = schema.ticketKommentar;
const u = schema.user;

/** Organisationen, auf die die Person bei Tickets beschränkt ist (null = alle). */
export function ticketOrganisationen(a: Angemeldet): OrganisationKuerzel[] | null {
  return organisationsFilter(a.rollen, 'ticket.lesen');
}

/** Liegt ein Ticket dieser Organisation innerhalb der Grenze der Person? null = ohne Organisation (immer erlaubt). */
export function darfTicketOrganisation(a: Angemeldet, organisation: OrganisationKuerzel | null): boolean {
  const filter = ticketOrganisationen(a);
  return filter === null || organisation === null || filter.includes(organisation);
}

/** Anlegen: `ticket.anlegen` (alle Rollen laut Matrix), innerhalb der Organisationsgrenze. */
export function darfAnlegen(a: Angemeldet, organisation: OrganisationKuerzel | null): boolean {
  return darf(a.rollen, 'ticket.anlegen') && darfTicketOrganisation(a, organisation);
}

/** Status und Priorität ändern: nur `ticket.bearbeiten` (Matrix: Administration), innerhalb der Organisationsgrenze. */
export function darfBearbeiten(a: Angemeldet, organisation: OrganisationKuerzel | null): boolean {
  return darf(a.rollen, 'ticket.bearbeiten', { organisation }) && darfTicketOrganisation(a, organisation);
}

/**
 * Kommentieren: `ticket.anlegen` oder `ticket.bearbeiten` (Matrix). Mitarbeit am Vorgang ist dasselbe Recht wie das
 * Anlegen; die Matrix gibt es allen Rollen, daher kommentieren alle, die das Ticket sehen dürfen.
 */
export function darfKommentieren(a: Angemeldet, organisation: OrganisationKuerzel | null): boolean {
  return (
    (darf(a.rollen, 'ticket.anlegen') || darf(a.rollen, 'ticket.bearbeiten', { organisation })) && darfTicketOrganisation(a, organisation)
  );
}

/** Sichtbarkeit in Abfragen: null = keine Einschränkung, sonst eigene Organisationen oder ohne Organisation. */
function sichtbar(a: Angemeldet): SQL | undefined {
  const filter = ticketOrganisationen(a);
  if (filter === null) return undefined;
  return or(isNull(t.organisation), filter.length ? inArray(t.organisation, filter) : sql`false`);
}

export type TicketZeile = {
  id: string;
  nummer: number;
  titel: string;
  typ: TicketTyp;
  kategorie: string | null;
  organisation: OrganisationKuerzel | null;
  prioritaet: TicketPrioritaet;
  status: TicketStatus;
  erstelltAm: Date;
  aktualisiertAm: Date;
};

/** Liste nach Suchfiltern (Status, Priorität, Typ), neueste zuerst. Ohne Kontaktangaben und ohne Beschreibung. */
export async function ladeTicketListe(filter: ListenFilter, a: Angemeldet): Promise<TicketZeile[]> {
  return db
    .select({
      id: t.id,
      nummer: t.nummer,
      titel: t.titel,
      typ: t.typ,
      kategorie: t.kategorie,
      organisation: t.organisation,
      prioritaet: t.prioritaet,
      status: t.status,
      erstelltAm: t.erstelltAm,
      aktualisiertAm: t.aktualisiertAm,
    })
    .from(t)
    .where(
      and(
        sichtbar(a),
        filter.status ? eq(t.status, filter.status) : undefined,
        filter.prioritaet ? eq(t.prioritaet, filter.prioritaet) : undefined,
        filter.typ ? eq(t.typ, filter.typ) : undefined,
      ),
    )
    .orderBy(desc(t.erstelltAm), desc(t.nummer));
}

/** Offene Tickets (offen oder in Bearbeitung), die die Person sehen darf – Zähler der Seitenleiste. */
export async function zaehleOffeneTickets(a: Angemeldet): Promise<number> {
  const [zeile] = await db
    .select({ n: count() })
    .from(t)
    .where(and(sichtbar(a), inArray(t.status, ['offen', 'in_bearbeitung'])));
  return zeile?.n ?? 0;
}

export type TicketKopf = {
  id: string;
  nummer: number;
  organisation: OrganisationKuerzel | null;
  status: TicketStatus;
  prioritaet: TicketPrioritaet;
  geschlossenAm: Date | null;
};

/** Kopfdaten für Actions (Rechteprüfung, alter Stand). null = unbekannt oder für diese Person nicht sichtbar. */
export async function ladeTicketKopf(id: string, a: Angemeldet): Promise<TicketKopf | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const [kopf] = await db
    .select({
      id: t.id,
      nummer: t.nummer,
      organisation: t.organisation,
      status: t.status,
      prioritaet: t.prioritaet,
      geschlossenAm: t.geschlossenAm,
    })
    .from(t)
    .where(and(eq(t.id, id), sichtbar(a)))
    .limit(1);
  return kopf ?? null;
}

/** Zustand der Kontaktangaben im Detail: nicht vorhanden, für diese Person verborgen, unlesbar oder lesbar. */
export type MelderAnsicht = { art: 'keiner' } | { art: 'verborgen' } | { art: 'unlesbar' } | { art: 'lesbar'; daten: Melder };

export type KommentarZeile = {
  id: string;
  text: string;
  intern: boolean;
  autorName: string | null;
  erstelltAm: Date;
};

export type TicketDetail = TicketZeile & {
  beschreibung: string;
  geschlossenAm: Date | null;
  erstellerName: string | null;
  zugewiesenName: string | null;
  melder: MelderAnsicht;
  kommentare: KommentarZeile[];
};

async function nameVon(benutzerId: string | null): Promise<string | null> {
  if (!benutzerId) return null;
  const [treffer] = await db.select({ name: u.name }).from(u).where(eq(u.id, benutzerId)).limit(1);
  return treffer?.name ?? null;
}

async function ladeKommentare(ticketId: string): Promise<KommentarZeile[]> {
  return db
    .select({ id: k.id, text: k.text, intern: k.intern, autorName: u.name, erstelltAm: k.erstelltAm })
    .from(k)
    .leftJoin(u, eq(u.id, k.autorId))
    .where(eq(k.ticketId, ticketId))
    .orderBy(asc(k.erstelltAm), asc(k.id));
}

/**
 * Kontaktangaben für das Detail. Nur mit `ticket.bearbeiten` entschlüsselt; der Abruf wird vorher protokolliert
 * (lieber kein Zugriff als ein unprotokollierter, G-07). Die Angaben selbst stehen nie im Audit-Log.
 */
async function melderAnsicht(
  roh: { id: string; organisation: OrganisationKuerzel | null; melderVerschluesselt: Buffer | null; schluesselId: number | null },
  a: Angemeldet,
): Promise<MelderAnsicht> {
  if (!roh.melderVerschluesselt) return { art: 'keiner' };
  if (!darfBearbeiten(a, roh.organisation)) return { art: 'verborgen' };
  await protokolliere({
    benutzerId: a.benutzerId,
    aktion: 'ticket.gelesen',
    zielTyp: 'ticket',
    zielId: roh.id,
    details: { feld: 'melder' },
  });
  if (roh.schluesselId === null) return { art: 'unlesbar' };
  try {
    const pruefung = melderSchema.safeParse(entschluessele<unknown>(roh.melderVerschluesselt, roh.schluesselId));
    return pruefung.success ? { art: 'lesbar', daten: pruefung.data } : { art: 'unlesbar' };
  } catch {
    return { art: 'unlesbar' };
  }
}

/** Ein Ticket mit Verlauf. null = unbekannt oder für diese Person nicht sichtbar. */
export async function ladeTicketDetail(id: string, a: Angemeldet): Promise<TicketDetail | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const [roh] = await db
    .select({
      id: t.id,
      nummer: t.nummer,
      titel: t.titel,
      beschreibung: t.beschreibung,
      typ: t.typ,
      kategorie: t.kategorie,
      organisation: t.organisation,
      prioritaet: t.prioritaet,
      status: t.status,
      erstelltAm: t.erstelltAm,
      aktualisiertAm: t.aktualisiertAm,
      geschlossenAm: t.geschlossenAm,
      erstelltVon: t.erstelltVon,
      zugewiesenAn: t.zugewiesenAn,
      melderVerschluesselt: t.melderVerschluesselt,
      schluesselId: t.schluesselId,
    })
    .from(t)
    .where(and(eq(t.id, id), sichtbar(a)))
    .limit(1);
  if (!roh) return null;
  const melder = await melderAnsicht(roh, a);
  const [erstellerName, zugewiesenName, kommentare] = await Promise.all([
    nameVon(roh.erstelltVon),
    nameVon(roh.zugewiesenAn),
    ladeKommentare(roh.id),
  ]);
  return {
    id: roh.id,
    nummer: roh.nummer,
    titel: roh.titel,
    beschreibung: roh.beschreibung,
    typ: roh.typ,
    kategorie: roh.kategorie,
    organisation: roh.organisation,
    prioritaet: roh.prioritaet,
    status: roh.status,
    erstelltAm: roh.erstelltAm,
    aktualisiertAm: roh.aktualisiertAm,
    geschlossenAm: roh.geschlossenAm,
    erstellerName,
    zugewiesenName,
    melder,
    kommentare,
  };
}
