import 'server-only';
import { and, asc, desc, eq, gte, inArray } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { KIND_EINWILLIGUNGEN, type KindEinwilligung } from '@/lib/lernen/ansicht';
import type { GruppenKontext } from '@/lib/rechte/gruppen';

/**
 * Abfragen der Eltern-Seiten in „Mein Bereich › Kinder“ (AUFTRAG 3.5, ADR 0026). Eltern sehen nur ihre eigenen Kinder:
 * Jede Funktion prüft den Eltern-Kind-Bezug aus dem Gruppenkontext. Ohne Cache (Seiten sind dynamisch).
 */
export type KindKurz = {
  id: string;
  name: string;
  status: 'aktiv' | 'pausiert' | 'beendet';
  gruppen: { id: string; name: Mehrsprachig }[];
  naechster: { datum: string; beginn: string | null; ende: string | null; gruppe: Mehrsprachig } | null;
  fehltAm: string[];
  zugang: boolean;
};

/** Kinder des Elternkontos mit Gruppen, nächstem Termin, gemeldeten Fehltagen und Kinderzugang. */
export async function kinderDerEltern(kontext: GruppenKontext, heute: string): Promise<KindKurz[]> {
  const ids = [...kontext.kinder.keys()];
  if (!ids.length) return [];
  const gruppenIds = [...new Set([...kontext.kinder.values()].flatMap((g) => [...g]))];
  const [kinder, gruppen, termine, fehl] = await Promise.all([
    db
      .select({
        id: schema.lernende.id,
        name: schema.lernende.anzeigename,
        status: schema.lernende.status,
        benutzerId: schema.lernende.benutzerId,
      })
      .from(schema.lernende)
      .where(inArray(schema.lernende.id, ids))
      .orderBy(asc(schema.lernende.anzeigename)),
    gruppenIds.length
      ? db
          .select({ id: schema.gruppe.id, name: schema.gruppe.name })
          .from(schema.gruppe)
          .where(and(inArray(schema.gruppe.id, gruppenIds), eq(schema.gruppe.status, 'aktiv')))
      : [],
    gruppenIds.length
      ? db
          .select({
            gruppeId: schema.unterrichtstermin.gruppeId,
            datum: schema.unterrichtstermin.datum,
            beginn: schema.unterrichtstermin.beginn,
            ende: schema.unterrichtstermin.ende,
          })
          .from(schema.unterrichtstermin)
          .where(
            and(
              inArray(schema.unterrichtstermin.gruppeId, gruppenIds),
              gte(schema.unterrichtstermin.datum, heute),
              eq(schema.unterrichtstermin.ausgefallen, false),
            ),
          )
          .orderBy(asc(schema.unterrichtstermin.datum), asc(schema.unterrichtstermin.beginn))
          .limit(50)
      : [],
    db
      .select({ lernendeId: schema.fehlmeldung.lernendeId, datum: schema.fehlmeldung.datum })
      .from(schema.fehlmeldung)
      .where(and(inArray(schema.fehlmeldung.lernendeId, ids), gte(schema.fehlmeldung.datum, heute)))
      .orderBy(asc(schema.fehlmeldung.datum)),
  ]);
  const gruppeNach = new Map(gruppen.map((g) => [g.id, g]));
  return kinder.map((k) => {
    const eigene = [...(kontext.kinder.get(k.id) ?? [])].map((id) => gruppeNach.get(id)).filter((g) => g !== undefined);
    const t = termine.find((x) => eigene.some((g) => g.id === x.gruppeId));
    return {
      id: k.id,
      name: k.name,
      status: k.status,
      gruppen: eigene,
      naechster: t ? { datum: t.datum, beginn: t.beginn, ende: t.ende, gruppe: gruppeNach.get(t.gruppeId)!.name } : null,
      fehltAm: [...new Set(fehl.filter((f) => f.lernendeId === k.id).map((f) => f.datum))],
      zugang: k.benutzerId !== null,
    };
  });
}

export type EinwilligungStand = {
  art: KindEinwilligung;
  aktiv: boolean;
  erteiltAm: Date | null;
  durchMich: boolean;
  widerrufenAm: Date | null;
};

/** Stand der vier Einwilligungen eines Kindes (aktiv = nicht widerrufen; sonst der letzte Widerruf). Nur eigenes Kind. */
export async function einwilligungenDesKindes(lernendeId: string, kontext: GruppenKontext): Promise<EinwilligungStand[] | null> {
  if (!kontext.kinder.has(lernendeId)) return null;
  const zeilen = await db
    .select({
      art: schema.kontoEinwilligung.art,
      erteiltAm: schema.kontoEinwilligung.erteiltAm,
      erteiltVon: schema.kontoEinwilligung.erteiltVon,
      widerrufenAm: schema.kontoEinwilligung.widerrufenAm,
    })
    .from(schema.kontoEinwilligung)
    .where(and(eq(schema.kontoEinwilligung.lernendeId, lernendeId), inArray(schema.kontoEinwilligung.art, [...KIND_EINWILLIGUNGEN])))
    .orderBy(desc(schema.kontoEinwilligung.erteiltAm));
  // Eigene Einwilligungen des Kindes ab 16 (D-11) sind seine Sache – die Elternansicht zeigt nur die der Eltern
  const [kind] = await db
    .select({ benutzerId: schema.lernende.benutzerId })
    .from(schema.lernende)
    .where(eq(schema.lernende.id, lernendeId));
  return KIND_EINWILLIGUNGEN.map((art) => {
    const eigene = zeilen.filter((z) => z.art === art && (kind?.benutzerId == null || z.erteiltVon !== kind.benutzerId));
    const aktiv = eigene.find((z) => z.widerrufenAm === null);
    const letzte = eigene[0];
    return {
      art,
      aktiv: Boolean(aktiv),
      erteiltAm: aktiv?.erteiltAm ?? null,
      durchMich: aktiv?.erteiltVon === kontext.benutzerId,
      widerrufenAm: aktiv ? null : (letzte?.widerrufenAm ?? null),
    };
  });
}

export type Kinderzugang = { benutzername: string | null; gesperrt: boolean } | null;

/**
 * Kinderzugang (Benutzername) eines eigenen Kindes; null ohne Zugang. Nie die synthetische Adresse. Nur Kinderzugänge
 * (`konto_profil.ist_kind`): Das eigene Konto einer/eines Jugendlichen (Einladung ab 16) ist kein Kinderzugang und gehört
 * nicht in die Hand der Eltern (D-11, S2/S3).
 */
export async function kinderzugang(lernendeId: string, kontext: GruppenKontext): Promise<Kinderzugang> {
  if (!kontext.kinder.has(lernendeId)) return null;
  const [z] = await db
    .select({ benutzername: schema.user.username, gesperrtAm: schema.user.gesperrtAm })
    .from(schema.lernende)
    .innerJoin(schema.user, eq(schema.user.id, schema.lernende.benutzerId))
    .innerJoin(schema.kontoProfil, and(eq(schema.kontoProfil.benutzerId, schema.user.id), eq(schema.kontoProfil.istKind, true)))
    .where(eq(schema.lernende.id, lernendeId));
  return z ? { benutzername: z.benutzername ?? null, gesperrt: z.gesperrtAm !== null } : null;
}

/**
 * Name und Status eines eigenen Kindes (Kopf der Detailseite); null für fremde Kinder. `eigenesKonto`: Die/der Lernende
 * hat ein eigenes Konto (kein Kinderzugang der Eltern).
 */
export async function kindKopf(lernendeId: string, kontext: GruppenKontext) {
  if (!kontext.kinder.has(lernendeId)) return null;
  const [k] = await db
    .select({
      id: schema.lernende.id,
      name: schema.lernende.anzeigename,
      status: schema.lernende.status,
      sechzehnAm: schema.lernende.sechzehnAm,
      benutzerId: schema.lernende.benutzerId,
      istKind: schema.kontoProfil.istKind,
    })
    .from(schema.lernende)
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.lernende.benutzerId))
    .where(eq(schema.lernende.id, lernendeId));
  if (!k) return null;
  const { benutzerId, istKind, ...rest } = k;
  return { ...rest, eigenesKonto: benutzerId !== null && istKind !== true };
}
