import 'server-only';
import { and, asc, eq, gte, inArray, isNull } from 'drizzle-orm';
import { chatName } from '@/lib/chat/regeln';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { EIGENE_EINWILLIGUNG_FRIST_TAGE, einwilligungGilt, einwilligungsLage, type EinwilligungsLage } from '@/lib/konto/sechzehn';
import { tagPlus } from '@/lib/lernen/termine';
import { lernwegKursart, lernwegStand, type FortschrittStatus, type KursartSchluessel } from '@/lib/lernen/ansicht';
import { darfInGruppe, type GruppenKontext, type LeitungsRolle } from '@/lib/rechte/gruppen';

/**
 * Abfragen für „Meine Gruppe“ (Schüler, Eltern, Leitung) und den Lernweg der Schüler-Startseite (B-24).
 * Jede Funktion prüft das Gruppenrecht (`gruppe.sehen`, eigener Lerndatensatz). Ohne Cache.
 */
export type GruppenAnsicht = {
  id: string;
  name: Mehrsprachig;
  ort: string | null;
  wochentage: number[];
  uhrzeitVon: string | null;
  uhrzeitBis: string | null;
  chatModus: 'aus' | 'nur_lehrkraft' | 'offen';
  chatVon: string;
  chatBis: string;
  leitung: { name: string; rolle: LeitungsRolle }[];
  termine: { id: string; datum: string; beginn: string | null; ende: string | null; ausgefallen: boolean }[];
};

/** Gruppe für Mitglieder, Eltern eines Mitglieds und Leitung; sonst null (kein Unterschied zu „gibt es nicht“). */
export async function gruppeAnsicht(gruppeId: string, kontext: GruppenKontext, heute: string): Promise<GruppenAnsicht | null> {
  if (!/^[0-9a-f-]{36}$/i.test(gruppeId) || !darfInGruppe(kontext, 'gruppe.sehen', gruppeId)) return null;
  const [[g], leitung, termine] = await Promise.all([
    db
      .select()
      .from(schema.gruppe)
      .where(and(eq(schema.gruppe.id, gruppeId), eq(schema.gruppe.status, 'aktiv'))),
    db
      .select({ rolle: schema.gruppenLeitung.rolle, anzeigename: schema.kontoProfil.anzeigename, name: schema.user.name })
      .from(schema.gruppenLeitung)
      .innerJoin(schema.user, eq(schema.user.id, schema.gruppenLeitung.benutzerId))
      .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.gruppenLeitung.benutzerId))
      .where(eq(schema.gruppenLeitung.gruppeId, gruppeId)),
    db
      .select({
        id: schema.unterrichtstermin.id,
        datum: schema.unterrichtstermin.datum,
        beginn: schema.unterrichtstermin.beginn,
        ende: schema.unterrichtstermin.ende,
        ausgefallen: schema.unterrichtstermin.ausgefallen,
      })
      .from(schema.unterrichtstermin)
      .where(and(eq(schema.unterrichtstermin.gruppeId, gruppeId), gte(schema.unterrichtstermin.datum, heute)))
      .orderBy(asc(schema.unterrichtstermin.datum), asc(schema.unterrichtstermin.beginn))
      .limit(5),
  ]);
  if (!g) return null;
  return {
    id: g.id,
    name: g.name,
    ort: g.ort,
    wochentage: g.wochentage,
    uhrzeitVon: g.uhrzeitVon,
    uhrzeitBis: g.uhrzeitBis,
    chatModus: g.chatModus,
    chatVon: g.chatVon,
    chatBis: g.chatBis,
    leitung: leitung
      .map((l) => ({ name: chatName(l.anzeigename ?? l.name), rolle: l.rolle }))
      .sort((a, b) => (a.rolle === b.rolle ? a.name.localeCompare(b.name, 'de') : a.rolle === 'lehrkraft' ? -1 : 1)),
    termine,
  };
}

export type LernwegStation = { id: string; reihenfolge: number; titel: Mehrsprachig; status: FortschrittStatus | null };
export type Lernweg = {
  kursart: KursartSchluessel;
  stationen: LernwegStation[];
  aktuell: number;
  erreicht: number;
  geschafft: boolean;
  /** Weitere Kursarten mit Einträgen (kurz: erreichte von allen Stufen). */
  weitere: { kursart: KursartSchluessel; erreicht: number; gesamt: number }[];
};

/**
 * Lernweg eines Lerndatensatzes (B-24): Stufen der Kursart mit dem jüngsten Eintrag und ihr Stand. Nur für den eigenen
 * Datensatz (Schüler) oder ein eigenes Kind (Eltern); sonst null.
 */
export async function lernwegVon(lernendeId: string, kontext: GruppenKontext): Promise<Lernweg | null> {
  if (kontext.eigeneLernendeId !== lernendeId && !kontext.kinder.has(lernendeId)) return null;
  const eintraege = await db
    .select({
      stufeId: schema.lernfortschritt.stufeId,
      status: schema.lernfortschritt.status,
      datum: schema.lernfortschritt.datum,
      kursart: schema.lehrplanStufe.kursart,
    })
    .from(schema.lernfortschritt)
    .innerJoin(schema.lehrplanStufe, eq(schema.lehrplanStufe.id, schema.lernfortschritt.stufeId))
    .where(eq(schema.lernfortschritt.lernendeId, lernendeId));
  const kursart = lernwegKursart(eintraege);
  const kursarten = [...new Set([kursart, ...eintraege.map((e) => e.kursart)])];
  const stufen = await db
    .select({
      id: schema.lehrplanStufe.id,
      kursart: schema.lehrplanStufe.kursart,
      reihenfolge: schema.lehrplanStufe.reihenfolge,
      titel: schema.lehrplanStufe.titel,
    })
    .from(schema.lehrplanStufe)
    .where(inArray(schema.lehrplanStufe.kursart, kursarten))
    .orderBy(asc(schema.lehrplanStufe.reihenfolge));
  const stand = Object.fromEntries(eintraege.map((e) => [e.stufeId, e.status]));
  const eigene = stufen.filter((s) => s.kursart === kursart);
  const lage = lernwegStand(eigene, stand);
  if (!lage) return null;
  return {
    kursart,
    stationen: eigene.map((s) => ({ id: s.id, reihenfolge: s.reihenfolge, titel: s.titel, status: stand[s.id] ?? null })),
    ...lage,
    weitere: kursarten
      .filter((k) => k !== kursart)
      .map((k) => {
        const alle = stufen.filter((s) => s.kursart === k);
        return { kursart: k, gesamt: alle.length, erreicht: alle.filter((s) => stand[s.id] === 'abgeschlossen').length };
      }),
  };
}

/** Eigene Gruppen eines Schülers mit dem nächsten (nicht ausgefallenen) Termin – für die Startseite. */
export async function meineGruppen(kontext: GruppenKontext, heute: string) {
  const ids = [...kontext.eigeneGruppen];
  if (!ids.length) return [];
  const [gruppen, termine] = await Promise.all([
    db
      .select({ id: schema.gruppe.id, name: schema.gruppe.name, ort: schema.gruppe.ort, chatModus: schema.gruppe.chatModus })
      .from(schema.gruppe)
      .where(and(inArray(schema.gruppe.id, ids), eq(schema.gruppe.status, 'aktiv'))),
    db
      .select({
        gruppeId: schema.unterrichtstermin.gruppeId,
        datum: schema.unterrichtstermin.datum,
        beginn: schema.unterrichtstermin.beginn,
        ende: schema.unterrichtstermin.ende,
      })
      .from(schema.unterrichtstermin)
      .where(
        and(
          inArray(schema.unterrichtstermin.gruppeId, ids),
          gte(schema.unterrichtstermin.datum, heute),
          eq(schema.unterrichtstermin.ausgefallen, false),
        ),
      )
      .orderBy(asc(schema.unterrichtstermin.datum), asc(schema.unterrichtstermin.beginn))
      .limit(20),
  ]);
  return gruppen.map((g) => ({ ...g, naechster: termine.find((t) => t.gruppeId === g.id) ?? null }));
}

export type EigeneEinwilligung = {
  art: 'gruppenchat' | 'push_kind';
  /** Von der Person selbst erteilt (aktiv). */
  eigen: Date | null;
  /** Von den Eltern erteilt (aktiv). */
  eltern: Date | null;
  /** Zählt die Einwilligung heute (D-11)? */
  gilt: boolean;
};

export type EigeneEinwilligungen = {
  lage: Exclude<EinwilligungsLage, 'eltern'>;
  /** Ab diesem Tag zählt nur die eigene Einwilligung (16. Geburtstag + 30 Tage). */
  ab: string;
  arten: EigeneEinwilligung[];
};

/**
 * Einwilligungen ab 16 (DSFA D-11): Für Gruppenchat und Push zählt nach dem Übergang nur die eigene Einwilligung.
 * Für Schüler unter 16 (oder ohne bekanntes Datum) null – dort entscheiden die Eltern.
 */
export async function eigeneEinwilligungen(kontext: GruppenKontext, heute: string): Promise<EigeneEinwilligungen | null> {
  if (!kontext.eigeneLernendeId) return null;
  const lernendeId = kontext.eigeneLernendeId;
  const [l] = await db.select({ sechzehnAm: schema.lernende.sechzehnAm }).from(schema.lernende).where(eq(schema.lernende.id, lernendeId));
  const lage = einwilligungsLage(l?.sechzehnAm ?? null, heute);
  if (lage === 'eltern' || !l?.sechzehnAm) return null;
  const zeilen = await db
    .select({
      art: schema.kontoEinwilligung.art,
      erteiltVon: schema.kontoEinwilligung.erteiltVon,
      erteiltAm: schema.kontoEinwilligung.erteiltAm,
    })
    .from(schema.kontoEinwilligung)
    .where(
      and(
        eq(schema.kontoEinwilligung.lernendeId, lernendeId),
        inArray(schema.kontoEinwilligung.art, ['gruppenchat', 'push_kind']),
        isNull(schema.kontoEinwilligung.widerrufenAm),
      ),
    );
  return {
    lage,
    ab: tagPlus(l.sechzehnAm, EIGENE_EINWILLIGUNG_FRIST_TAGE),
    arten: (['gruppenchat', 'push_kind'] as const).map((art) => {
      const aktiv = zeilen.filter((z) => z.art === art);
      return {
        art,
        eigen: aktiv.find((z) => z.erteiltVon === kontext.benutzerId)?.erteiltAm ?? null,
        eltern: aktiv.find((z) => z.erteiltVon !== kontext.benutzerId)?.erteiltAm ?? null,
        gilt: einwilligungGilt(lage, aktiv, kontext.benutzerId),
      };
    }),
  };
}

/** Einwilligungslage eines Kindes für die Elternansicht (D-11): ab wann zählt die Zustimmung des Kindes selbst? */
export function lageFuerEltern(sechzehnAm: string | null, heute: string): { lage: EinwilligungsLage; ab: string | null } {
  return { lage: einwilligungsLage(sechzehnAm, heute), ab: sechzehnAm ? tagPlus(sechzehnAm, EIGENE_EINWILLIGUNG_FRIST_TAGE) : null };
}
