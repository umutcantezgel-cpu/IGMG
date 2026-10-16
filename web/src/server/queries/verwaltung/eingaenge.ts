import 'server-only';
import { and, count, desc, eq, inArray, ne, or, sql, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { EINGANG_ARTEN, leseRecht, type EingangArt, type EingangStatus } from '@/lib/eingaenge/arten';
import { entschluessele } from '@/lib/krypto';
import { darf, organisationsFilter, type Angemeldet } from '@/lib/rechte/pruefe';
import type { OrganisationKuerzel } from '@/lib/rechte/matrix';

/**
 * Verwaltung „Eingänge“ (C08, V08, ADR 0005, G-07). Ohne Cache (Verwaltung ist dynamisch).
 * Datensparsam: Die Liste zeigt keine Personendaten (nur Art, Status, Datum, Bezug – bei Anmeldungen die Veranstaltung,
 * bei Voranmeldungen der gewünschte Kurs, F-44). Erst das Detail entschlüsselt –
 * und jeder Abruf schreibt `eingang.gelesen` ins Audit-Log. Die Organisationsredaktion sieht Anmeldungen nur zu
 * Veranstaltungen ihrer Organisation.
 */
export const SEITENGROESSE = 50;
const e = schema.eingang;
const v = schema.veranstaltung;
/** Gewünschter Kurs einer Voranmeldung (F-44): `eingang.bezug_id` → `kurs.id`. */
const k = schema.kurs;
const kursBezug = and(eq(e.art, 'voranmeldung'), eq(k.id, e.bezugId));

/** Welche Arten darf die Person lesen? Für Anmeldungen zusätzlich die Organisationen (null = alle). */
export function sichtbarkeit(a: Angemeldet): { arten: EingangArt[]; anmeldungOrgs: OrganisationKuerzel[] | null } {
  const arten = EINGANG_ARTEN.filter((art) => darf(a.rollen, leseRecht(art)));
  const anmeldungOrgs = arten.includes('veranstaltungsanmeldung')
    ? organisationsFilter(a.rollen, leseRecht('veranstaltungsanmeldung'))
    : null;
  return { arten, anmeldungOrgs };
}

function sichtbarBedingung(a: Angemeldet): SQL | undefined {
  const { arten, anmeldungOrgs } = sichtbarkeit(a);
  if (!arten.length) return sql`false`;
  const andere = arten.filter((art) => art !== 'veranstaltungsanmeldung');
  const teile: SQL[] = [];
  if (andere.length) teile.push(inArray(e.art, andere));
  if (arten.includes('veranstaltungsanmeldung')) {
    teile.push(
      anmeldungOrgs === null
        ? eq(e.art, 'veranstaltungsanmeldung')
        : anmeldungOrgs.length
          ? and(eq(e.art, 'veranstaltungsanmeldung'), inArray(v.organisation, anmeldungOrgs))!
          : sql`false`,
    );
  }
  return or(...teile);
}

export const listenFilterSchema = z.object({
  art: z.enum(EINGANG_ARTEN).optional().catch(undefined),
  status: z.enum(['neu', 'in_bearbeitung', 'erledigt', 'abgelehnt', 'offen']).optional().catch(undefined),
  seite: z.coerce.number().int().min(1).max(10_000).catch(1).default(1),
});
export type ListenFilter = z.infer<typeof listenFilterSchema>;

export type EingangZeile = {
  id: string;
  art: EingangArt;
  status: EingangStatus;
  sprache: string;
  anzahl: number;
  erstelltAm: Date;
  loeschenAb: Date | null;
  bezugTitel: string | null;
  /** Voranmeldung: gewünschter Kurs (nur, wenn es ihn noch gibt). */
  kursId: string | null;
  organisation: OrganisationKuerzel | null;
};

export async function ladeEingangsListe(filter: ListenFilter, a: Angemeldet): Promise<{ zeilen: EingangZeile[]; gesamt: number }> {
  const bedingung = and(
    sichtbarBedingung(a),
    filter.art ? eq(e.art, filter.art) : undefined,
    filter.status === 'offen'
      ? and(ne(e.status, 'erledigt'), ne(e.status, 'abgelehnt'))
      : filter.status
        ? eq(e.status, filter.status)
        : undefined,
  );
  const [zeilen, [{ anzahl }]] = await Promise.all([
    db
      .select({
        id: e.id,
        art: e.art,
        status: e.status,
        sprache: e.sprache,
        anzahl: e.anzahl,
        erstelltAm: e.erstelltAm,
        loeschenAb: e.loeschenAb,
        titel: v.titel,
        organisation: v.organisation,
        kursId: k.id,
        kursTitel: k.titel,
      })
      .from(e)
      .leftJoin(v, and(eq(e.art, 'veranstaltungsanmeldung'), eq(v.id, e.bezugId)))
      .leftJoin(k, kursBezug)
      .where(bedingung)
      .orderBy(desc(e.erstelltAm))
      .limit(SEITENGROESSE)
      .offset((filter.seite - 1) * SEITENGROESSE),
    db
      .select({ anzahl: count() })
      .from(e)
      .leftJoin(v, and(eq(e.art, 'veranstaltungsanmeldung'), eq(v.id, e.bezugId)))
      .where(bedingung),
  ]);
  return {
    gesamt: anzahl,
    zeilen: zeilen.map((z) => ({
      id: z.id,
      art: z.art,
      status: z.status,
      sprache: z.sprache,
      anzahl: z.anzahl,
      erstelltAm: z.erstelltAm,
      loeschenAb: z.loeschenAb,
      bezugTitel: z.titel?.de ?? z.kursTitel?.de ?? null,
      kursId: z.kursId ?? null,
      organisation: z.organisation ?? null,
    })),
  };
}

/** Offene (neue) Eingänge, die die Person sehen darf – Zähler der Seitenleiste und Übersicht. */
export async function zaehleNeueEingaenge(a: Angemeldet): Promise<number> {
  const [{ anzahl }] = await db
    .select({ anzahl: count() })
    .from(e)
    .leftJoin(v, and(eq(e.art, 'veranstaltungsanmeldung'), eq(v.id, e.bezugId)))
    .where(and(sichtbarBedingung(a), eq(e.status, 'neu')));
  return anzahl;
}

export type EingangDetail = EingangZeile & {
  daten: Record<string, unknown>;
  erledigtAm: Date | null;
  bezugId: string | null;
  einwilligungen: { textSchluessel: string; textVersion: string; sprache: string; erteiltAm: Date }[];
  notizen: { id: string; text: string; autorName: string | null; erstelltAm: Date }[];
};

/** Kopfdaten ohne Entschlüsselung (für Rechteprüfung in Actions). null = unbekannt oder nicht sichtbar. */
export async function ladeEingangKopf(id: string, a: Angemeldet): Promise<EingangZeile | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const [z0] = await db
    .select({
      id: e.id,
      art: e.art,
      status: e.status,
      sprache: e.sprache,
      anzahl: e.anzahl,
      erstelltAm: e.erstelltAm,
      loeschenAb: e.loeschenAb,
      titel: v.titel,
      organisation: v.organisation,
      kursId: k.id,
      kursTitel: k.titel,
    })
    .from(e)
    .leftJoin(v, and(eq(e.art, 'veranstaltungsanmeldung'), eq(v.id, e.bezugId)))
    .leftJoin(k, kursBezug)
    .where(and(eq(e.id, id), sichtbarBedingung(a)))
    .limit(1);
  if (!z0) return null;
  const { titel, kursTitel, ...rest } = z0;
  return {
    ...rest,
    bezugTitel: titel?.de ?? kursTitel?.de ?? null,
    kursId: z0.kursId ?? null,
    organisation: z0.organisation ?? null,
  };
}

/**
 * Detail mit entschlüsselten Formulardaten, Einwilligungen und Notizen. Schreibt `eingang.gelesen` (G-07) –
 * ohne Personendaten in den Details. null = unbekannt oder für diese Person nicht sichtbar (kein Audit).
 */
export async function ladeEingangDetail(id: string, a: Angemeldet): Promise<EingangDetail | null> {
  const kopf = await ladeEingangKopf(id, a);
  if (!kopf) return null;
  const [roh] = await db
    .select({ daten: e.datenVerschluesselt, schluesselId: e.schluesselId, erledigtAm: e.erledigtAm, bezugId: e.bezugId })
    .from(e)
    .where(eq(e.id, id));
  const [einwilligungen, notizen] = await Promise.all([
    db
      .select({
        textSchluessel: schema.einwilligung.textSchluessel,
        textVersion: schema.einwilligung.textVersion,
        sprache: schema.einwilligung.sprache,
        erteiltAm: schema.einwilligung.erteiltAm,
      })
      .from(schema.einwilligung)
      .where(eq(schema.einwilligung.eingangId, id)),
    db
      .select({
        id: schema.eingangNotiz.id,
        text: schema.eingangNotiz.textVerschluesselt,
        schluesselId: schema.eingangNotiz.schluesselId,
        autorName: schema.user.name,
        erstelltAm: schema.eingangNotiz.erstelltAm,
      })
      .from(schema.eingangNotiz)
      .leftJoin(schema.user, eq(schema.user.id, schema.eingangNotiz.autorId))
      .where(eq(schema.eingangNotiz.eingangId, id))
      .orderBy(schema.eingangNotiz.erstelltAm),
  ]);
  await protokolliere({ benutzerId: a.benutzerId, aktion: 'eingang.gelesen', zielTyp: 'eingang', zielId: id, details: { art: kopf.art } });
  return {
    ...kopf,
    daten: entschluessele<Record<string, unknown>>(roh.daten, roh.schluesselId),
    erledigtAm: roh.erledigtAm,
    bezugId: roh.bezugId,
    einwilligungen,
    notizen: notizen.map((n) => ({
      id: n.id,
      text: entschluessele<string>(n.text, n.schluesselId),
      autorName: n.autorName,
      erstelltAm: n.erstelltAm,
    })),
  };
}

/** Für den Export: entschlüsselte Datensätze der gefilterten Liste (ohne Seitenbegrenzung, höchstens 5000). */
export async function ladeFuerExport(filter: Omit<ListenFilter, 'seite'> & { id?: string }, a: Angemeldet) {
  const zeilen = await db
    .select({
      id: e.id,
      art: e.art,
      status: e.status,
      sprache: e.sprache,
      erstelltAm: e.erstelltAm,
      daten: e.datenVerschluesselt,
      schluesselId: e.schluesselId,
      titel: v.titel,
      kursTitel: k.titel,
    })
    .from(e)
    .leftJoin(v, and(eq(e.art, 'veranstaltungsanmeldung'), eq(v.id, e.bezugId)))
    .leftJoin(k, kursBezug)
    .where(
      and(
        sichtbarBedingung(a),
        filter.id ? eq(e.id, filter.id) : undefined,
        filter.art ? eq(e.art, filter.art) : undefined,
        filter.status === 'offen'
          ? and(ne(e.status, 'erledigt'), ne(e.status, 'abgelehnt'))
          : filter.status
            ? eq(e.status, filter.status)
            : undefined,
      ),
    )
    .orderBy(desc(e.erstelltAm))
    .limit(5000);
  return zeilen.map((z) => ({
    id: z.id,
    art: z.art,
    status: z.status,
    sprache: z.sprache,
    erstelltAm: z.erstelltAm.toISOString(),
    bezug: z.titel?.de ?? z.kursTitel?.de ?? '',
    daten: entschluessele<Record<string, unknown>>(z.daten, z.schluesselId),
  }));
}
