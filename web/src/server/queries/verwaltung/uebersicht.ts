import 'server-only';
import { and, count, desc, eq, gt, gte, inArray, isNotNull, isNull, lte, ne, or, sql, type SQL, type SQLWrapper } from 'drizzle-orm';
import type { KennzahlModul } from '@/components/verwaltung/uebersicht/sichtbarkeit';
import { db, schema } from '@/lib/db';
import type { OrganisationKuerzel } from '@/lib/rechte/matrix';
import { darf, organisationsFilter, type Angemeldet } from '@/lib/rechte/pruefe';
import { naechstesVorkommen } from '@/lib/termine';
import { zaehleNeueEingaenge } from './eingaenge';

/**
 * Übersicht der Verwaltung (Blatt V01, Paket C01): Kennzahlen je Modul und zwei Kurzlisten. Nur lesen, ohne Cache
 * (Verwaltungsseiten sind dynamisch). Jede Abfrage prüft ihr Leserecht selbst; die Organisationsredaktion sieht nur
 * Zahlen und Einträge ihrer Organisation (K-06). Keine Personendaten: weder Autor noch Kontakt noch Melder.
 * Aufrufer prüfen vorher `verlangeSeitenRecht('uebersicht.lesen')`.
 */
const v = schema.veranstaltung;
const n = schema.nachricht;
const an = schema.ankuendigung;
const tk = schema.ticket;
const pn = schema.postfachNachricht;
const ut = schema.unterhaltungTeilnehmer;

/** Länge der Kurzlisten (Blatt V01: „nächste 5“, „letzte 5“). */
const LISTEN_GROESSE = 5;

export type KommendeVeranstaltung = { id: string; titel: string; beginn: Date; ende: Date | null; ganztaegig: boolean };
export type LetzteNeuigkeit = { id: string; titel: string; status: 'entwurf' | 'veroeffentlicht'; datum: Date };
export type Uebersicht = {
  /** Kennzahl je angefragtem Modul; nicht angefragte Module fehlen. */
  kennzahlen: Partial<Record<KennzahlModul, number>>;
  /** Die nächsten Veranstaltungen (höchstens fünf); null ohne Leserecht „veranstaltung.lesen“. */
  kommend: KommendeVeranstaltung[] | null;
  /** Die letzten Neuigkeiten (höchstens fünf); null ohne Leserecht „nachricht.lesen“. */
  neuigkeiten: LetzteNeuigkeit[] | null;
};

/** Organisationsredaktion: nur Zeilen der eigenen Organisation. `null` = keine Einschränkung, leere Liste = nichts. */
function nurOrganisation(spalte: SQLWrapper, filter: readonly OrganisationKuerzel[] | null): SQL | undefined {
  if (filter === null) return undefined;
  return filter.length ? inArray(spalte, [...filter]) : sql`false`;
}

/** Veranstaltungen, die noch kommen (K-09): veröffentlicht, nicht im Papierkorb, mit nächstem Vorkommen ab `jetzt`. */
export async function ladeKommendeVeranstaltungen(a: Angemeldet, jetzt: Date): Promise<KommendeVeranstaltung[] | null> {
  if (!darf(a.rollen, 'veranstaltung.lesen')) return null;
  const zeilen = await db
    .select({
      id: v.id,
      titel: v.titel,
      beginn: v.beginn,
      ende: v.ende,
      ganztaegig: v.ganztaegig,
      wiederholung: v.wiederholung,
      ausnahmen: v.ausnahmen,
    })
    .from(v)
    .where(
      and(
        eq(v.status, 'veroeffentlicht'),
        isNull(v.imPapierkorbSeit),
        nurOrganisation(v.organisation, organisationsFilter(a.rollen, 'veranstaltung.bearbeiten')),
        // Vorauswahl: Serien immer prüfen, Einzeltermine nur, solange sie noch laufen oder bevorstehen
        or(isNotNull(v.wiederholung), gte(sql`coalesce(${v.ende}, ${v.beginn})`, jetzt)),
      ),
    );
  return zeilen
    .flatMap((z) => {
      const naechstes = naechstesVorkommen({ beginn: z.beginn, ende: z.ende, wiederholung: z.wiederholung, ausnahmen: z.ausnahmen }, jetzt);
      return naechstes ? [{ id: z.id, titel: z.titel.de, beginn: naechstes.beginn, ende: naechstes.ende, ganztaegig: z.ganztaegig }] : [];
    })
    .sort((x, y) => x.beginn.getTime() - y.beginn.getTime());
}

/** Kennzahl „Neuigkeiten“: Entwürfe, nicht im Papierkorb, im Rahmen der Organisationsredaktion. */
export async function zaehleEntwuerfe(a: Angemeldet): Promise<number> {
  if (!darf(a.rollen, 'nachricht.lesen')) return 0;
  const [{ anzahl }] = await db
    .select({ anzahl: count() })
    .from(n)
    .where(
      and(
        eq(n.status, 'entwurf'),
        isNull(n.imPapierkorbSeit),
        nurOrganisation(n.organisation, organisationsFilter(a.rollen, 'nachricht.bearbeiten')),
      ),
    );
  return anzahl;
}

/** Kurzliste „Aktuelle Neuigkeiten“: nach Veröffentlichung, sonst Anlage (wie die öffentliche Liste), ohne Papierkorb. */
export async function ladeLetzteNeuigkeiten(a: Angemeldet, grenze = LISTEN_GROESSE): Promise<LetzteNeuigkeit[] | null> {
  if (!darf(a.rollen, 'nachricht.lesen')) return null;
  // Rohausdruck: die Spalte dekodiert den Wert als Zeitpunkt (sonst kommt Text zurück)
  const datum = sql<Date>`coalesce(${n.veroeffentlichtAm}, ${n.erstelltAm})`.mapWith(n.erstelltAm);
  const zeilen = await db
    .select({ id: n.id, titel: n.titel, status: n.status, datum })
    .from(n)
    .where(and(isNull(n.imPapierkorbSeit), nurOrganisation(n.organisation, organisationsFilter(a.rollen, 'nachricht.bearbeiten'))))
    .orderBy(desc(datum))
    .limit(grenze);
  return zeilen.map((z) => ({ id: z.id, titel: z.titel.de, status: z.status, datum: z.datum }));
}

/**
 * Kennzahl „Ankündigungen“: veröffentlicht, nicht im Papierkorb und im Anzeigefenster
 * (sichtbarAb ≤ jetzt < laeuftAb; ein fehlender Rand ist offen).
 */
export async function zaehleAktiveAnkuendigungen(a: Angemeldet, jetzt: Date): Promise<number> {
  if (!darf(a.rollen, 'ankuendigung.lesen')) return 0;
  const [{ anzahl }] = await db
    .select({ anzahl: count() })
    .from(an)
    .where(
      and(
        eq(an.status, 'veroeffentlicht'),
        isNull(an.imPapierkorbSeit),
        or(isNull(an.sichtbarAb), lte(an.sichtbarAb, jetzt)),
        or(isNull(an.laeuftAb), gt(an.laeuftAb, jetzt)),
        nurOrganisation(an.organisation, organisationsFilter(a.rollen, 'ankuendigung.bearbeiten')),
      ),
    );
  return anzahl;
}

/** Kennzahl „Tickets“: offen oder in Bearbeitung. Nur die Zahl, keine Melder- oder Zuweisungsdaten. */
export async function zaehleOffeneTickets(a: Angemeldet): Promise<number> {
  if (!darf(a.rollen, 'ticket.lesen')) return 0;
  const [{ anzahl }] = await db
    .select({ anzahl: count() })
    .from(tk)
    .where(
      and(inArray(tk.status, ['offen', 'in_bearbeitung']), nurOrganisation(tk.organisation, organisationsFilter(a.rollen, 'ticket.lesen'))),
    );
  return anzahl;
}

/**
 * Kennzahl „Nachrichten“ (Postfach): Nachrichten anderer in den eigenen Unterhaltungen, die nach der Lesemarke
 * `gelesenBis` liegen (ohne Lesemarke: alle). Eigene Nachrichten zählen nicht.
 */
export async function zaehleUngelesenePostfach(a: Angemeldet): Promise<number> {
  if (!darf(a.rollen, 'postfach.nutzen')) return 0;
  const [{ anzahl }] = await db
    .select({ anzahl: count() })
    .from(pn)
    .innerJoin(ut, and(eq(ut.unterhaltungId, pn.unterhaltungId), eq(ut.benutzerId, a.benutzerId)))
    .where(and(or(isNull(pn.absenderId), ne(pn.absenderId, a.benutzerId)), or(isNull(ut.gelesenBis), gt(pn.erstelltAm, ut.gelesenBis))));
  return anzahl;
}

/**
 * Übersicht für die Startseite. `zeigen` nennt die Module, deren Kennzahl die Seite zeigt (nur freigegebene Module);
 * die Kurzlisten erscheinen unabhängig davon, aber nur mit dem jeweiligen Leserecht.
 */
export async function ladeUebersicht(a: Angemeldet, zeigen: ReadonlySet<KennzahlModul>, jetzt = new Date()): Promise<Uebersicht> {
  const zahl = (aktiv: boolean, fn: () => Promise<number>) => (aktiv ? fn() : Promise.resolve(0));
  const [kommende, neuigkeiten, entwuerfe, ankuendigungen, eingaenge, postfach, tickets] = await Promise.all([
    ladeKommendeVeranstaltungen(a, jetzt),
    ladeLetzteNeuigkeiten(a),
    zahl(zeigen.has('neuigkeiten'), () => zaehleEntwuerfe(a)),
    zahl(zeigen.has('ankuendigungen'), () => zaehleAktiveAnkuendigungen(a, jetzt)),
    zahl(zeigen.has('eingaenge'), () => zaehleNeueEingaenge(a)),
    zahl(zeigen.has('postfach'), () => zaehleUngelesenePostfach(a)),
    zahl(zeigen.has('tickets'), () => zaehleOffeneTickets(a)),
  ]);
  const kennzahlen: Partial<Record<KennzahlModul, number>> = {};
  if (zeigen.has('veranstaltungen')) kennzahlen.veranstaltungen = kommende?.length ?? 0;
  if (zeigen.has('neuigkeiten')) kennzahlen.neuigkeiten = entwuerfe;
  if (zeigen.has('ankuendigungen')) kennzahlen.ankuendigungen = ankuendigungen;
  if (zeigen.has('eingaenge')) kennzahlen.eingaenge = eingaenge;
  if (zeigen.has('postfach')) kennzahlen.postfach = postfach;
  if (zeigen.has('tickets')) kennzahlen.tickets = tickets;
  return { kennzahlen, kommend: kommende?.slice(0, LISTEN_GROESSE) ?? null, neuigkeiten };
}
