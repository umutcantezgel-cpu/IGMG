import 'server-only';
import { and, asc, desc, eq, exists, inArray, isNull, ne, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import type { Angemeldet } from '@/lib/rechte/pruefe';

/**
 * Abfragen des internen Postfachs (C09, V09). Nicht gecacht – Verwaltungsseiten sind dynamisch.
 * Jede Abfrage nennt die Person, für die gelesen wird; Nicht-Teilnehmende erhalten nichts (fremde ID = null).
 * Aufrufer prüfen vorher `verlangeSeitenRecht('postfach.nutzen')` bzw. `verlangeRecht('postfach.nutzen')`.
 *
 * „Ungelesen“ ist abgeleitet: eine Nachricht eines anderen Kontos, die nach dem eigenen `gelesen_bis` entstand
 * (oder bei fehlendem `gelesen_bis`). Der Vergleich läuft in SQL, damit Mikrosekunden der Datenbank zählen.
 */
const u = schema.unterhaltung;
const t = schema.unterhaltungTeilnehmer;
const n = schema.postfachNachricht;
const nutzer = schema.user;
const rollen = schema.rolleZuweisung;

/** SQL-Bedingung: Nachricht (aus `postfach_nachricht`) ist für `benutzerId` ungelesen. Wirkt nur mit JOIN/Unterabfrage auf `unterhaltung_teilnehmer`. */
export function ungeleseneBedingung(benutzerId: string) {
  return sql`(${n.absenderId} is null or ${n.absenderId} <> ${benutzerId}) and (${t.gelesenBis} is null or ${n.erstelltAm} > ${t.gelesenBis})`;
}

export type UnterhaltungZeile = {
  id: string;
  betreff: string;
  letzteNachrichtAm: Date;
  vorschau: string;
  mit: string[];
  ungelesen: number;
};

export type UnterhaltungDetail = {
  id: string;
  betreff: string;
  ungelesen: number;
  mit: string[];
  nachrichten: {
    id: string;
    text: string;
    erstelltAm: Date;
    eigene: boolean;
    absenderName: string | null;
  }[];
};

export type EmpfaengerZeile = {
  id: string;
  name: string;
  rollen: { rolle: string; organisation: string | null }[];
};

/**
 * Unterhaltungen, an denen die Person teilnimmt: neueste Aktivität zuerst. Je Zeile die Zahl ungelesener
 * Nachrichten, die Teilnehmenden (ohne die Person selbst) und der Anfang der letzten Nachricht.
 */
export async function ladeUnterhaltungen(benutzerId: string): Promise<UnterhaltungZeile[]> {
  const ungelesen = sql<number>`(select count(*)::int from ${n} where ${n.unterhaltungId} = ${u.id} and ${ungeleseneBedingung(benutzerId)})`;
  const vorschau = sql<
    string | null
  >`(select left(${n.text}, 160) from ${n} where ${n.unterhaltungId} = ${u.id} order by ${n.erstelltAm} desc limit 1)`;
  const zeilen = await db
    .select({
      id: u.id,
      betreff: u.betreff,
      letzteNachrichtAm: u.letzteNachrichtAm,
      vorschau,
      ungelesen,
    })
    .from(t)
    .innerJoin(u, eq(u.id, t.unterhaltungId))
    .where(eq(t.benutzerId, benutzerId))
    .orderBy(desc(u.letzteNachrichtAm), asc(u.id));
  if (zeilen.length === 0) return [];
  const beteiligte = await db
    .select({ unterhaltungId: t.unterhaltungId, name: nutzer.name })
    .from(t)
    .innerJoin(nutzer, eq(nutzer.id, t.benutzerId))
    .where(
      and(
        inArray(
          t.unterhaltungId,
          zeilen.map((z) => z.id),
        ),
        ne(t.benutzerId, benutzerId),
      ),
    )
    .orderBy(asc(nutzer.name));
  return zeilen.map((z) => ({
    id: z.id,
    betreff: z.betreff,
    letzteNachrichtAm: z.letzteNachrichtAm,
    vorschau: z.vorschau ?? '',
    mit: beteiligte.filter((b) => b.unterhaltungId === z.id).map((b) => b.name),
    ungelesen: Number(z.ungelesen),
  }));
}

/** Eine Unterhaltung mit allen Nachrichten; null, wenn die Person nicht teilnimmt oder die ID ungültig ist. */
export async function ladeUnterhaltung(id: string, benutzerId: string): Promise<UnterhaltungDetail | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const [kopf] = await db
    .select({
      id: u.id,
      betreff: u.betreff,
      ungelesen: sql<number>`(select count(*)::int from ${n} where ${n.unterhaltungId} = ${u.id} and ${ungeleseneBedingung(benutzerId)})`,
    })
    .from(t)
    .innerJoin(u, eq(u.id, t.unterhaltungId))
    .where(and(eq(t.unterhaltungId, id), eq(t.benutzerId, benutzerId)))
    .limit(1);
  if (!kopf) return null;
  const nachrichten = await db
    .select({ id: n.id, text: n.text, erstelltAm: n.erstelltAm, absenderId: n.absenderId, absenderName: nutzer.name })
    .from(n)
    .leftJoin(nutzer, eq(nutzer.id, n.absenderId))
    .where(eq(n.unterhaltungId, id))
    .orderBy(asc(n.erstelltAm), asc(n.id));
  const mit = await db
    .select({ name: nutzer.name })
    .from(t)
    .innerJoin(nutzer, eq(nutzer.id, t.benutzerId))
    .where(and(eq(t.unterhaltungId, id), ne(t.benutzerId, benutzerId)))
    .orderBy(asc(nutzer.name));
  return {
    id: kopf.id,
    betreff: kopf.betreff,
    ungelesen: Number(kopf.ungelesen),
    mit: mit.map((m) => m.name),
    nachrichten: nachrichten.map((m) => ({
      id: m.id,
      text: m.text,
      erstelltAm: m.erstelltAm,
      eigene: m.absenderId === benutzerId,
      absenderName: m.absenderId === benutzerId ? null : (m.absenderName ?? null),
    })),
  };
}

/** Ist die Person Teilnehmer dieser Unterhaltung? */
export async function istTeilnehmer(unterhaltungId: string, benutzerId: string): Promise<boolean> {
  const [treffer] = await db
    .select({ id: t.unterhaltungId })
    .from(t)
    .where(and(eq(t.unterhaltungId, unterhaltungId), eq(t.benutzerId, benutzerId)))
    .limit(1);
  return Boolean(treffer);
}

/**
 * Mögliche Empfänger einer neuen Nachricht: Konten mit Verwaltungszugang (mindestens eine Rolle) und eingerichtetem
 * zweiten Faktor, nicht gesperrt (C12), ohne die Person selbst.
 */
export async function ladeEmpfaenger(benutzerId: string): Promise<EmpfaengerZeile[]> {
  const konten = await db
    .select({ id: nutzer.id, name: nutzer.name })
    .from(nutzer)
    .where(
      and(
        eq(nutzer.twoFactorEnabled, true),
        isNull(nutzer.gesperrtAm),
        ne(nutzer.id, benutzerId),
        exists(db.select({ id: rollen.id }).from(rollen).where(eq(rollen.benutzerId, nutzer.id))),
      ),
    )
    .orderBy(asc(nutzer.name), asc(nutzer.id));
  if (konten.length === 0) return [];
  const zuweisungen = await db
    .select({ benutzerId: rollen.benutzerId, rolle: rollen.rolle, organisation: rollen.organisation })
    .from(rollen)
    .where(
      inArray(
        rollen.benutzerId,
        konten.map((k) => k.id),
      ),
    );
  return konten.map((k) => ({
    id: k.id,
    name: k.name,
    rollen: zuweisungen.filter((z) => z.benutzerId === k.id).map((z) => ({ rolle: z.rolle, organisation: z.organisation })),
  }));
}

/** Zähler für die Seitenleiste: ungelesene Nachrichten in allen Unterhaltungen der Person. */
export async function zaehleUngelesene(a: Angemeldet): Promise<number> {
  const [zeile] = await db
    .select({ anzahl: sql<number>`count(*)::int` })
    .from(n)
    .innerJoin(t, and(eq(t.unterhaltungId, n.unterhaltungId), eq(t.benutzerId, a.benutzerId)))
    .where(ungeleseneBedingung(a.benutzerId));
  return zeile?.anzahl ?? 0;
}
