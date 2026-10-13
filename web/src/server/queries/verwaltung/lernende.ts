import 'server-only';
import { and, asc, count, desc, eq, inArray, isNull, max, sql } from 'drizzle-orm';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { entschluessele } from '@/lib/krypto';
import type { LernendeDaten } from '@/lib/lernen/verwaltung';
import type { Angemeldet } from '@/lib/rechte/pruefe';

/**
 * Abfragen der Verwaltung „Lernende“ (H-L02). Datensparsam (G-07): Die Liste zeigt nur Vorname + Initial, Gruppe und
 * Alter; Personendaten werden nur in der Detailansicht entschlüsselt – jeder Abruf steht im Audit-Log
 * (`lernende.gelesen`, ohne Personendaten). Aufrufer prüfen vorher `verlangeSeitenRecht('lernende.lesen')`.
 */
const l = schema.lernende;

export type LernendeStatus = 'aktiv' | 'pausiert' | 'beendet';

export type LernendeZeile = {
  id: string;
  anzeigename: string;
  sechzehnAm: string | null;
  status: LernendeStatus;
  gruppen: { id: string; name: string }[];
  eltern: number;
  konto: boolean;
  aufgenommenAm: Date;
};

export const lernendeFilterSchema = z.object({
  status: z.enum(['aktiv', 'pausiert', 'beendet', 'alle']).catch('aktiv').default('aktiv'),
  gruppe: z.uuid().optional().catch(undefined),
});
export type LernendeFilter = z.infer<typeof lernendeFilterSchema>;

export async function ladeLernendeListe(filter: LernendeFilter): Promise<LernendeZeile[]> {
  const inGruppe = filter.gruppe
    ? inArray(
        l.id,
        db
          .select({ id: schema.gruppenMitglied.lernendeId })
          .from(schema.gruppenMitglied)
          .where(and(eq(schema.gruppenMitglied.gruppeId, filter.gruppe), isNull(schema.gruppenMitglied.bis))),
      )
    : undefined;
  const zeilen = await db
    .select({
      id: l.id,
      anzeigename: l.anzeigename,
      sechzehnAm: l.sechzehnAm,
      status: l.status,
      benutzerId: l.benutzerId,
      aufgenommenAm: l.aufgenommenAm,
    })
    .from(l)
    .where(and(filter.status === 'alle' ? undefined : eq(l.status, filter.status), inGruppe))
    .orderBy(asc(l.anzeigename));
  const ids = zeilen.map((z) => z.id);
  if (!ids.length) return [];
  const [gruppen, eltern] = await Promise.all([
    db
      .select({ lernendeId: schema.gruppenMitglied.lernendeId, id: schema.gruppe.id, name: schema.gruppe.name })
      .from(schema.gruppenMitglied)
      .innerJoin(schema.gruppe, eq(schema.gruppe.id, schema.gruppenMitglied.gruppeId))
      .where(and(inArray(schema.gruppenMitglied.lernendeId, ids), isNull(schema.gruppenMitglied.bis)))
      .orderBy(asc(sql`${schema.gruppe.name}->>'de'`)),
    db
      .select({ lernendeId: schema.elternKind.lernendeId, anzahl: count() })
      .from(schema.elternKind)
      .where(inArray(schema.elternKind.lernendeId, ids))
      .groupBy(schema.elternKind.lernendeId),
  ]);
  const g = new Map<string, { id: string; name: string }[]>();
  for (const x of gruppen) g.set(x.lernendeId, [...(g.get(x.lernendeId) ?? []), { id: x.id, name: x.name.de }]);
  const e = new Map(eltern.map((x) => [x.lernendeId, x.anzahl]));
  return zeilen.map((z) => ({
    id: z.id,
    anzeigename: z.anzeigename,
    sechzehnAm: z.sechzehnAm,
    status: z.status,
    gruppen: g.get(z.id) ?? [],
    eltern: e.get(z.id) ?? 0,
    konto: z.benutzerId !== null,
    aufgenommenAm: z.aufgenommenAm,
  }));
}

export type EinladungsStand = 'offen' | 'angenommen' | 'abgelaufen' | 'widerrufen';

export type LernendeDetail = {
  id: string;
  anzeigename: string;
  sechzehnAm: string | null;
  status: LernendeStatus;
  aufgenommenAm: Date;
  aufgenommenVon: string | null;
  eingangId: string | null;
  /** Löschfrist nach dem Austritt (DSFA D-10), sonst null. */
  loeschenAb: Date | null;
  daten: LernendeDaten;
  gruppen: { id: string; name: string; seit: string }[];
  eltern: { benutzerId: string; name: string; email: string; sorgeberechtigt: boolean; bestaetigtAm: Date | null; gesperrt: boolean }[];
  einladungen: { id: string; name: string; email: string; art: string; laeuftAb: Date; stand: EinladungsStand; erstelltAm: Date }[];
  einwilligungen: {
    id: string;
    art: string;
    textVersion: string;
    sprache: string;
    erteiltAm: Date;
    erteiltVon: string | null;
    einvernehmen: boolean;
    widerrufenAm: Date | null;
  }[];
  kinderkonto: {
    benutzerId: string;
    benutzername: string | null;
    gesperrtAm: Date | null;
    erstelltAm: Date;
    letzteSitzung: Date | null;
  } | null;
};

function einladungsStand(e: { angenommenAm: Date | null; widerrufenAm: Date | null; laeuftAb: Date }, jetzt: number): EinladungsStand {
  if (e.angenommenAm) return 'angenommen';
  if (e.widerrufenAm) return 'widerrufen';
  return e.laeuftAb.getTime() <= jetzt ? 'abgelaufen' : 'offen';
}

/** Kopf ohne Entschlüsselung (für Actions). */
export async function ladeLernendeKopf(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const [k] = await db
    .select({ id: l.id, anzeigename: l.anzeigename, status: l.status, sechzehnAm: l.sechzehnAm, benutzerId: l.benutzerId })
    .from(l)
    .where(eq(l.id, id));
  return k ?? null;
}

/** Detail mit entschlüsselten Personendaten; schreibt `lernende.gelesen` (ohne Personendaten im Eintrag). */
export async function ladeLernendeDetail(id: string, leser: Angemeldet): Promise<LernendeDetail | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const [z0] = await db.select().from(l).where(eq(l.id, id));
  if (!z0) return null;
  const erteiler = db.$with('erteiler').as(db.select({ id: schema.user.id, name: schema.user.name }).from(schema.user));
  const [gruppen, eltern, einladungen, einwilligungen, konto] = await Promise.all([
    db
      .select({ id: schema.gruppe.id, name: schema.gruppe.name, seit: schema.gruppenMitglied.seit })
      .from(schema.gruppenMitglied)
      .innerJoin(schema.gruppe, eq(schema.gruppe.id, schema.gruppenMitglied.gruppeId))
      .where(and(eq(schema.gruppenMitglied.lernendeId, id), isNull(schema.gruppenMitglied.bis)))
      .orderBy(asc(sql`${schema.gruppe.name}->>'de'`)),
    db
      .select({
        benutzerId: schema.elternKind.elternId,
        name: schema.user.name,
        email: schema.user.email,
        sorgeberechtigt: schema.elternKind.sorgeberechtigt,
        bestaetigtAm: schema.elternKind.bestaetigtAm,
        gesperrtAm: schema.user.gesperrtAm,
      })
      .from(schema.elternKind)
      .innerJoin(schema.user, eq(schema.user.id, schema.elternKind.elternId))
      .where(eq(schema.elternKind.lernendeId, id))
      .orderBy(asc(schema.user.name)),
    db
      .select({
        id: schema.einladung.id,
        name: schema.einladung.name,
        email: schema.einladung.email,
        gemeindeRollen: schema.einladung.gemeindeRollen,
        laeuftAb: schema.einladung.laeuftAb,
        angenommenAm: schema.einladung.angenommenAm,
        widerrufenAm: schema.einladung.widerrufenAm,
        erstelltAm: schema.einladung.erstelltAm,
      })
      .from(schema.einladung)
      .where(eq(schema.einladung.lernendeId, id))
      .orderBy(desc(schema.einladung.erstelltAm)),
    db
      .with(erteiler)
      .select({
        id: schema.kontoEinwilligung.id,
        art: schema.kontoEinwilligung.art,
        textVersion: schema.kontoEinwilligung.textVersion,
        sprache: schema.kontoEinwilligung.sprache,
        erteiltAm: schema.kontoEinwilligung.erteiltAm,
        erteiltVon: erteiler.name,
        einvernehmen: schema.kontoEinwilligung.einvernehmenBestaetigt,
        widerrufenAm: schema.kontoEinwilligung.widerrufenAm,
      })
      .from(schema.kontoEinwilligung)
      .leftJoin(erteiler, eq(erteiler.id, schema.kontoEinwilligung.erteiltVon))
      .where(eq(schema.kontoEinwilligung.lernendeId, id))
      .orderBy(asc(schema.kontoEinwilligung.art), desc(schema.kontoEinwilligung.erteiltAm)),
    z0.benutzerId
      ? db
          .select({
            benutzerId: schema.user.id,
            benutzername: schema.user.displayUsername,
            gesperrtAm: schema.user.gesperrtAm,
            erstelltAm: schema.user.createdAt,
            letzteSitzung: max(schema.session.createdAt),
          })
          .from(schema.user)
          .leftJoin(schema.session, eq(schema.session.userId, schema.user.id))
          .where(eq(schema.user.id, z0.benutzerId))
          .groupBy(schema.user.id)
      : Promise.resolve([]),
  ]);
  await protokolliere({ benutzerId: leser.benutzerId, aktion: 'lernende.gelesen', zielTyp: 'lernende', zielId: id });
  const jetzt = Date.now();
  return {
    id: z0.id,
    anzeigename: z0.anzeigename,
    sechzehnAm: z0.sechzehnAm,
    status: z0.status,
    aufgenommenAm: z0.aufgenommenAm,
    aufgenommenVon: z0.aufgenommenVon,
    eingangId: z0.eingangId,
    loeschenAb: z0.loeschenAb,
    daten: entschluessele<LernendeDaten>(z0.datenVerschluesselt, z0.schluesselId),
    gruppen: gruppen.map((x) => ({ id: x.id, name: x.name.de, seit: x.seit })),
    eltern: eltern.map((x) => ({ ...x, gesperrt: x.gesperrtAm !== null })),
    einladungen: einladungen.map((x) => ({
      id: x.id,
      name: x.name,
      email: x.email,
      art: x.gemeindeRollen.find((r) => r !== 'gemeinde') ?? 'gemeinde',
      laeuftAb: x.laeuftAb,
      stand: einladungsStand(x, jetzt),
      erstelltAm: x.erstelltAm,
    })),
    einwilligungen,
    kinderkonto: konto[0] ?? null,
  };
}

/** Aufnahme eines Eingangs: vorhandene Lernende und Stand ihrer Einladungen (ohne Personendaten außer dem Anzeigenamen). */
export async function ladeAufnahme(eingangId: string): Promise<{
  lernendeId: string;
  anzeigename: string;
  einladungen: { stand: EinladungsStand }[];
  elternKonten: number;
} | null> {
  if (!z.uuid().safeParse(eingangId).success) return null;
  const [x] = await db.select({ id: l.id, anzeigename: l.anzeigename }).from(l).where(eq(l.eingangId, eingangId));
  if (!x) return null;
  const [einladungen, [{ anzahl }]] = await Promise.all([
    db
      .select({
        angenommenAm: schema.einladung.angenommenAm,
        widerrufenAm: schema.einladung.widerrufenAm,
        laeuftAb: schema.einladung.laeuftAb,
      })
      .from(schema.einladung)
      .where(eq(schema.einladung.lernendeId, x.id)),
    db.select({ anzahl: count() }).from(schema.elternKind).where(eq(schema.elternKind.lernendeId, x.id)),
  ]);
  const jetzt = Date.now();
  return {
    lernendeId: x.id,
    anzeigename: x.anzeigename,
    einladungen: einladungen.map((e) => ({ stand: einladungsStand(e, jetzt) })),
    elternKonten: anzahl,
  };
}

/** Lernende ab 16 ohne eigenes Konto – Auswahl für die Einladung „Schüler ab 16“ (nur Anzeigename). */
export async function ladeLernendeFuerEinladung(
  heute: string,
): Promise<{ id: string; anzeigename: string; ab16: boolean; konto: boolean }[]> {
  const zeilen = await db
    .select({ id: l.id, anzeigename: l.anzeigename, sechzehnAm: l.sechzehnAm, benutzerId: l.benutzerId })
    .from(l)
    .where(eq(l.status, 'aktiv'))
    .orderBy(asc(l.anzeigename));
  return zeilen.map((x) => ({
    id: x.id,
    anzeigename: x.anzeigename,
    ab16: x.sechzehnAm !== null && x.sechzehnAm <= heute,
    konto: x.benutzerId !== null,
  }));
}
