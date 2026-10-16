import 'server-only';
import { and, asc, count, eq, gte, inArray, isNull, notInArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/lib/db';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import type { Kursart } from '@/lib/lernen/verwaltung';

/**
 * Abfragen der Verwaltung „Gruppen“ (H-L01). Ohne Cache (Verwaltung ist dynamisch). Aufrufer prüfen vorher
 * `verlangeSeitenRecht('gruppe.lesen')`. Keine Chat-Inhalte (ADR 0026): Für den Chat zählt hier nur die Leitung (S-02).
 */
const g = schema.gruppe;

export type GruppenZeile = {
  id: string;
  name: string;
  kurs: string | null;
  kursart: Kursart | null;
  wochentage: number[];
  uhrzeitVon: string | null;
  uhrzeitBis: string | null;
  ort: string | null;
  status: 'aktiv' | 'archiviert';
  chatModus: 'aus' | 'nur_lehrkraft' | 'offen';
  leitung: number;
  mitglieder: number;
  naechsterTermin: string | null;
};

export async function ladeGruppenListe(ansicht: 'aktiv' | 'archiviert' = 'aktiv'): Promise<GruppenZeile[]> {
  const heute = berlinerDatum(new Date());
  const zeilen = await db
    .select({
      id: g.id,
      name: g.name,
      kurs: schema.kurs.titel,
      kursart: g.kursart,
      wochentage: g.wochentage,
      uhrzeitVon: g.uhrzeitVon,
      uhrzeitBis: g.uhrzeitBis,
      ort: g.ort,
      status: g.status,
      chatModus: g.chatModus,
    })
    .from(g)
    .leftJoin(schema.kurs, eq(schema.kurs.id, g.kursId))
    .where(eq(g.status, ansicht))
    .orderBy(asc(sql`${g.name}->>'de'`));
  const ids = zeilen.map((z) => z.id);
  if (!ids.length) return [];
  const [leitung, mitglieder, termine] = await Promise.all([
    db
      .select({ gruppeId: schema.gruppenLeitung.gruppeId, anzahl: count() })
      .from(schema.gruppenLeitung)
      .where(inArray(schema.gruppenLeitung.gruppeId, ids))
      .groupBy(schema.gruppenLeitung.gruppeId),
    db
      .select({ gruppeId: schema.gruppenMitglied.gruppeId, anzahl: count() })
      .from(schema.gruppenMitglied)
      .where(and(inArray(schema.gruppenMitglied.gruppeId, ids), isNull(schema.gruppenMitglied.bis)))
      .groupBy(schema.gruppenMitglied.gruppeId),
    db
      .select({ gruppeId: schema.unterrichtstermin.gruppeId, datum: sql<string>`min(${schema.unterrichtstermin.datum})` })
      .from(schema.unterrichtstermin)
      .where(
        and(
          inArray(schema.unterrichtstermin.gruppeId, ids),
          gte(schema.unterrichtstermin.datum, heute),
          eq(schema.unterrichtstermin.ausgefallen, false),
        ),
      )
      .groupBy(schema.unterrichtstermin.gruppeId),
  ]);
  const l = new Map(leitung.map((z) => [z.gruppeId, z.anzahl]));
  const m = new Map(mitglieder.map((z) => [z.gruppeId, z.anzahl]));
  const t = new Map(termine.map((z) => [z.gruppeId, z.datum]));
  return zeilen.map((z) => ({
    ...z,
    name: z.name.de,
    kurs: z.kurs?.de ?? null,
    leitung: l.get(z.id) ?? 0,
    mitglieder: m.get(z.id) ?? 0,
    naechsterTermin: t.get(z.id) ?? null,
  }));
}

export type GruppeDetail = typeof g.$inferSelect & {
  kurs: string | null;
  leitung: { benutzerId: string; name: string; rolle: 'lehrkraft' | 'aufsicht'; zweiFaktor: boolean; gesperrt: boolean }[];
  mitglieder: { lernendeId: string; anzeigename: string; sechzehnAm: string | null; seit: string; status: string }[];
  termine: { id: string; datum: string; beginn: string | null; ende: string | null; ausgefallen: boolean }[];
  termineKuenftig: number;
};

export async function ladeGruppe(id: string): Promise<GruppeDetail | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const [kopf] = await db
    .select({ gruppe: g, kurs: schema.kurs.titel })
    .from(g)
    .leftJoin(schema.kurs, eq(schema.kurs.id, g.kursId))
    .where(eq(g.id, id));
  if (!kopf) return null;
  const heute = berlinerDatum(new Date());
  const [leitung, mitglieder, termine, [{ anzahl }]] = await Promise.all([
    db
      .select({
        benutzerId: schema.gruppenLeitung.benutzerId,
        name: schema.user.name,
        rolle: schema.gruppenLeitung.rolle,
        zweiFaktor: schema.user.twoFactorEnabled,
        gesperrtAm: schema.user.gesperrtAm,
      })
      .from(schema.gruppenLeitung)
      .innerJoin(schema.user, eq(schema.user.id, schema.gruppenLeitung.benutzerId))
      .where(eq(schema.gruppenLeitung.gruppeId, id))
      .orderBy(asc(schema.gruppenLeitung.rolle), asc(schema.user.name)),
    db
      .select({
        lernendeId: schema.lernende.id,
        anzeigename: schema.lernende.anzeigename,
        sechzehnAm: schema.lernende.sechzehnAm,
        seit: schema.gruppenMitglied.seit,
        status: schema.lernende.status,
      })
      .from(schema.gruppenMitglied)
      .innerJoin(schema.lernende, eq(schema.lernende.id, schema.gruppenMitglied.lernendeId))
      .where(and(eq(schema.gruppenMitglied.gruppeId, id), isNull(schema.gruppenMitglied.bis)))
      .orderBy(asc(schema.lernende.anzeigename)),
    db
      .select({
        id: schema.unterrichtstermin.id,
        datum: schema.unterrichtstermin.datum,
        beginn: schema.unterrichtstermin.beginn,
        ende: schema.unterrichtstermin.ende,
        ausgefallen: schema.unterrichtstermin.ausgefallen,
      })
      .from(schema.unterrichtstermin)
      .where(and(eq(schema.unterrichtstermin.gruppeId, id), gte(schema.unterrichtstermin.datum, heute)))
      .orderBy(asc(schema.unterrichtstermin.datum), asc(schema.unterrichtstermin.beginn))
      .limit(8),
    db
      .select({ anzahl: count() })
      .from(schema.unterrichtstermin)
      .where(and(eq(schema.unterrichtstermin.gruppeId, id), gte(schema.unterrichtstermin.datum, heute))),
  ]);
  return {
    ...kopf.gruppe,
    kurs: kopf.kurs?.de ?? null,
    leitung: leitung.map((x) => ({ ...x, zweiFaktor: Boolean(x.zweiFaktor), gesperrt: x.gesperrtAm !== null })),
    mitglieder,
    termine,
    termineKuenftig: anzahl,
  };
}

/** Konten, die eine Gruppe leiten dürfen: Gemeinde-Rolle `lehrkraft`, nicht gesperrt, noch nicht in der Leitung. */
export async function ladeLeitungsAuswahl(gruppeId: string): Promise<{ id: string; name: string; zweiFaktor: boolean }[]> {
  const vorhanden = db
    .select({ id: schema.gruppenLeitung.benutzerId })
    .from(schema.gruppenLeitung)
    .where(eq(schema.gruppenLeitung.gruppeId, gruppeId));
  const zeilen = await db
    .select({ id: schema.user.id, name: schema.user.name, zweiFaktor: schema.user.twoFactorEnabled })
    .from(schema.gemeindeRolle)
    .innerJoin(schema.user, eq(schema.user.id, schema.gemeindeRolle.benutzerId))
    .where(and(eq(schema.gemeindeRolle.rolle, 'lehrkraft'), isNull(schema.user.gesperrtAm), notInArray(schema.user.id, vorhanden)))
    .orderBy(asc(schema.user.name));
  return zeilen.map((x) => ({ ...x, zweiFaktor: Boolean(x.zweiFaktor) }));
}

/** Ist das Konto eine Lehrkraft (Gemeinde-Rolle) und nicht gesperrt? */
export async function istLehrkraft(benutzerId: string): Promise<boolean> {
  const [z] = await db
    .select({ id: schema.gemeindeRolle.id })
    .from(schema.gemeindeRolle)
    .innerJoin(schema.user, eq(schema.user.id, schema.gemeindeRolle.benutzerId))
    .where(
      and(eq(schema.gemeindeRolle.benutzerId, benutzerId), eq(schema.gemeindeRolle.rolle, 'lehrkraft'), isNull(schema.user.gesperrtAm)),
    )
    .limit(1);
  return Boolean(z);
}

/** Aktive Lernende, die noch nicht (aktiv) in der Gruppe sind – Auswahl zum Zuordnen (nur Anzeigename). */
export async function ladeMitgliedsAuswahl(gruppeId: string): Promise<{ id: string; anzeigename: string; sechzehnAm: string | null }[]> {
  const drin = db
    .select({ id: schema.gruppenMitglied.lernendeId })
    .from(schema.gruppenMitglied)
    .where(and(eq(schema.gruppenMitglied.gruppeId, gruppeId), isNull(schema.gruppenMitglied.bis)));
  return db
    .select({ id: schema.lernende.id, anzeigename: schema.lernende.anzeigename, sechzehnAm: schema.lernende.sechzehnAm })
    .from(schema.lernende)
    .where(and(eq(schema.lernende.status, 'aktiv'), notInArray(schema.lernende.id, drin)))
    .orderBy(asc(schema.lernende.anzeigename));
}

/** Kurse (nicht im Papierkorb) für die Auswahl im Gruppenformular. */
export async function ladeKursAuswahl(): Promise<{ id: string; titel: string }[]> {
  const zeilen = await db
    .select({ id: schema.kurs.id, titel: schema.kurs.titel })
    .from(schema.kurs)
    .where(isNull(schema.kurs.imPapierkorbSeit))
    .orderBy(asc(schema.kurs.sortierung), asc(schema.kurs.slug));
  return zeilen.map((k) => ({ id: k.id, titel: k.titel.de }));
}

/** Aktive Gruppen für Auswahllisten (Aufnahme, Lernende); mit Kurs, damit die Aufnahme die passende Gruppe vorbelegt (F-44). */
export async function ladeGruppenAuswahl(): Promise<{ id: string; name: string; kursId: string | null }[]> {
  const zeilen = await db
    .select({ id: g.id, name: g.name, kursId: g.kursId })
    .from(g)
    .where(eq(g.status, 'aktiv'))
    .orderBy(asc(sql`${g.name}->>'de'`));
  return zeilen.map((x) => ({ id: x.id, name: x.name.de, kursId: x.kursId }));
}
