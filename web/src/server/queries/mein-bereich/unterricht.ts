import 'server-only';
import { and, asc, count, desc, eq, gte, inArray, isNotNull, isNull, lt, lte, ne, notExists, or } from 'drizzle-orm';
import { chatName } from '@/lib/chat/regeln';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import type { KursartSchluessel } from '@/lib/lernen/ansicht';
import { darfInGruppe, type GruppenKontext, type LeitungsRolle } from '@/lib/rechte/gruppen';

/**
 * Abfragen der Lehrkraft-Seiten in „Mein Bereich › Unterricht“ (AUFTRAG 3.5). Ohne Cache (Seiten sind dynamisch).
 * Jede Funktion prüft das Gruppenrecht selbst: Lehrkräfte und Aufsicht sehen nur ihre Gruppen (ADR 0026).
 */
const OFFEN = ['offen', 'in_bearbeitung'] as const;

export type GruppeKurz = {
  id: string;
  name: Mehrsprachig;
  rolle: LeitungsRolle;
  ort: string | null;
  wochentage: number[];
  uhrzeitVon: string | null;
  uhrzeitBis: string | null;
  chatModus: 'aus' | 'nur_lehrkraft' | 'offen';
  lernende: number;
  offeneMeldungen: number;
};

/** Laufende Mitgliedschaften aktiver Lernender (heute). */
function mitgliedHeute(heute: string) {
  return and(
    lte(schema.gruppenMitglied.seit, heute),
    or(isNull(schema.gruppenMitglied.bis), gte(schema.gruppenMitglied.bis, heute)),
    eq(schema.lernende.status, 'aktiv'),
  );
}

/**
 * Meldungen, die die Gruppenleitung bearbeiten darf (D-02, S2/S3): nur über bekannte Lernende oder Eltern – nie über
 * eigene Nachrichten, nie über jemanden aus der Leitung (zum Zeitpunkt der Meldung oder heute) und nie über Unbekannte
 * (z. B. nach dem Löschlauf). Grundlage ist die bei der Meldung gespeicherte Person, nicht die (löschbare) Nachricht.
 * Alle übrigen Meldungen sieht nur die Rolle kinderschutz.
 */
function fuerLeitungSichtbar(benutzerId: string) {
  return and(
    isNotNull(schema.chatMeldung.gemeldetePerson),
    eq(schema.chatMeldung.gegenLeitung, false),
    ne(schema.chatMeldung.gemeldetePerson, benutzerId),
    notExists(
      db
        .select({ id: schema.gruppenLeitung.benutzerId })
        .from(schema.gruppenLeitung)
        .where(
          and(
            eq(schema.gruppenLeitung.gruppeId, schema.chatKanal.gruppeId),
            eq(schema.gruppenLeitung.benutzerId, schema.chatMeldung.gemeldetePerson),
          ),
        ),
    ),
  );
}

/** Offene Meldungen je Gruppe, die dieses Konto bearbeiten darf (`fuerLeitungSichtbar`). */
async function offeneMeldungenZahl(gruppen: string[], benutzerId: string): Promise<Map<string, number>> {
  if (!gruppen.length) return new Map();
  const zeilen = await db
    .select({ gruppeId: schema.chatKanal.gruppeId, zahl: count() })
    .from(schema.chatMeldung)
    .innerJoin(schema.chatKanal, eq(schema.chatKanal.id, schema.chatMeldung.kanalId))
    .where(
      and(inArray(schema.chatKanal.gruppeId, gruppen), inArray(schema.chatMeldung.status, [...OFFEN]), fuerLeitungSichtbar(benutzerId)),
    )
    .groupBy(schema.chatKanal.gruppeId);
  return new Map(zeilen.map((z) => [z.gruppeId, z.zahl]));
}

/** Gruppen, die das Konto leitet oder beaufsichtigt (Übersicht „Unterricht“). */
export async function gruppenDerLeitung(kontext: GruppenKontext, heute: string): Promise<GruppeKurz[]> {
  const ids = [...kontext.leitung.keys()];
  if (!ids.length) return [];
  const [gruppen, mitglieder, meldungen] = await Promise.all([
    db
      .select({
        id: schema.gruppe.id,
        name: schema.gruppe.name,
        ort: schema.gruppe.ort,
        wochentage: schema.gruppe.wochentage,
        uhrzeitVon: schema.gruppe.uhrzeitVon,
        uhrzeitBis: schema.gruppe.uhrzeitBis,
        chatModus: schema.gruppe.chatModus,
      })
      .from(schema.gruppe)
      .where(inArray(schema.gruppe.id, ids)),
    db
      .select({ gruppeId: schema.gruppenMitglied.gruppeId, zahl: count() })
      .from(schema.gruppenMitglied)
      .innerJoin(schema.lernende, eq(schema.lernende.id, schema.gruppenMitglied.lernendeId))
      .where(and(inArray(schema.gruppenMitglied.gruppeId, ids), mitgliedHeute(heute)))
      .groupBy(schema.gruppenMitglied.gruppeId),
    offeneMeldungenZahl(ids, kontext.benutzerId),
  ]);
  const zahl = new Map(mitglieder.map((m) => [m.gruppeId, m.zahl]));
  return gruppen
    .map((g) => ({
      ...g,
      rolle: kontext.leitung.get(g.id)!,
      lernende: zahl.get(g.id) ?? 0,
      offeneMeldungen: meldungen.get(g.id) ?? 0,
    }))
    .sort((a, b) => (a.name.de ?? '').localeCompare(b.name.de ?? '', 'de'));
}

/** Anzahl erfasster Anwesenheiten je Termin (Hinweis „erfasst“ in den Listen). */
export async function erfassteAnwesenheiten(terminIds: string[]): Promise<Map<string, number>> {
  if (!terminIds.length) return new Map();
  const zeilen = await db
    .select({ terminId: schema.anwesenheit.terminId, zahl: count() })
    .from(schema.anwesenheit)
    .where(inArray(schema.anwesenheit.terminId, terminIds))
    .groupBy(schema.anwesenheit.terminId);
  return new Map(zeilen.map((z) => [z.terminId, z.zahl]));
}

export type TerminZeile = {
  id: string;
  datum: string;
  beginn: string | null;
  ende: string | null;
  ausgefallen: boolean;
  thema: string | null;
  erfasst: number;
};

export type GruppeFuerLeitung = Omit<GruppeKurz, 'lernende' | 'offeneMeldungen'> & {
  /** Kursart der Gruppe aus der Verwaltung (Migration 0011), bei älteren Gruppen leer. */
  kursart: KursartSchluessel | null;
  chatMindestalter: number;
  chatVon: string;
  chatBis: string;
  lernende: { id: string; name: string; fehltAm: string[] }[];
  leitung: { name: string; rolle: LeitungsRolle; ich: boolean }[];
  kommende: TerminZeile[];
  vergangene: TerminZeile[];
  offeneMeldungen: number;
};

/** Gruppenkopf für die Leitung: Lernende (Vorname + Initial), Leitung, kommende und letzte Termine. Fremde Gruppe: null. */
export async function gruppeFuerLeitung(gruppeId: string, kontext: GruppenKontext, heute: string): Promise<GruppeFuerLeitung | null> {
  const rolle = kontext.leitung.get(gruppeId);
  if (!rolle) return null;
  const [[g], mitglieder, leitung, kommende, vergangene, meldungen] = await Promise.all([
    db.select().from(schema.gruppe).where(eq(schema.gruppe.id, gruppeId)),
    db
      .select({ id: schema.lernende.id, name: schema.lernende.anzeigename })
      .from(schema.gruppenMitglied)
      .innerJoin(schema.lernende, eq(schema.lernende.id, schema.gruppenMitglied.lernendeId))
      .where(and(eq(schema.gruppenMitglied.gruppeId, gruppeId), mitgliedHeute(heute)))
      .orderBy(asc(schema.lernende.anzeigename)),
    db
      .select({
        id: schema.gruppenLeitung.benutzerId,
        rolle: schema.gruppenLeitung.rolle,
        anzeigename: schema.kontoProfil.anzeigename,
        name: schema.user.name,
      })
      .from(schema.gruppenLeitung)
      .innerJoin(schema.user, eq(schema.user.id, schema.gruppenLeitung.benutzerId))
      .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.gruppenLeitung.benutzerId))
      .where(eq(schema.gruppenLeitung.gruppeId, gruppeId)),
    db
      .select()
      .from(schema.unterrichtstermin)
      .where(and(eq(schema.unterrichtstermin.gruppeId, gruppeId), gte(schema.unterrichtstermin.datum, heute)))
      .orderBy(asc(schema.unterrichtstermin.datum), asc(schema.unterrichtstermin.beginn))
      .limit(8),
    db
      .select()
      .from(schema.unterrichtstermin)
      .where(and(eq(schema.unterrichtstermin.gruppeId, gruppeId), lt(schema.unterrichtstermin.datum, heute)))
      .orderBy(desc(schema.unterrichtstermin.datum), desc(schema.unterrichtstermin.beginn))
      .limit(3),
    offeneMeldungenZahl([gruppeId], kontext.benutzerId),
  ]);
  if (!g) return null;
  const ids = mitglieder.map((m) => m.id);
  const [fehl, erfasst] = await Promise.all([
    ids.length
      ? db
          .select({ lernendeId: schema.fehlmeldung.lernendeId, datum: schema.fehlmeldung.datum })
          .from(schema.fehlmeldung)
          .where(and(inArray(schema.fehlmeldung.lernendeId, ids), gte(schema.fehlmeldung.datum, heute)))
          .orderBy(asc(schema.fehlmeldung.datum))
      : [],
    erfassteAnwesenheiten([...kommende, ...vergangene].map((t) => t.id)),
  ]);
  const fehltAm = new Map<string, string[]>();
  for (const f of fehl) fehltAm.set(f.lernendeId, [...new Set([...(fehltAm.get(f.lernendeId) ?? []), f.datum])]);
  const zeile = (t: typeof schema.unterrichtstermin.$inferSelect): TerminZeile => ({
    id: t.id,
    datum: t.datum,
    beginn: t.beginn,
    ende: t.ende,
    ausgefallen: t.ausgefallen,
    thema: t.thema,
    erfasst: erfasst.get(t.id) ?? 0,
  });
  return {
    id: g.id,
    name: g.name,
    rolle,
    kursart: g.kursart,
    ort: g.ort,
    wochentage: g.wochentage,
    uhrzeitVon: g.uhrzeitVon,
    uhrzeitBis: g.uhrzeitBis,
    chatModus: g.chatModus,
    chatMindestalter: g.chatMindestalter,
    chatVon: g.chatVon,
    chatBis: g.chatBis,
    lernende: mitglieder.map((m) => ({ ...m, fehltAm: fehltAm.get(m.id) ?? [] })),
    leitung: leitung
      .map((l) => ({ name: chatName(l.anzeigename ?? l.name), rolle: l.rolle, ich: l.id === kontext.benutzerId }))
      .sort((a, b) => (a.rolle === b.rolle ? a.name.localeCompare(b.name, 'de') : a.rolle === 'lehrkraft' ? -1 : 1)),
    kommende: kommende.map(zeile),
    vergangene: vergangene.map(zeile),
    offeneMeldungen: meldungen.get(gruppeId) ?? 0,
  };
}

/** Termin einer Gruppe (Anwesenheitsseite prüft damit, dass Termin und Gruppe der Adresse zusammengehören). */
export async function terminDerGruppe(gruppeId: string, terminId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(terminId)) return null;
  const [t] = await db
    .select()
    .from(schema.unterrichtstermin)
    .where(and(eq(schema.unterrichtstermin.id, terminId), eq(schema.unterrichtstermin.gruppeId, gruppeId)));
  return t ?? null;
}

export type HifzZeile = {
  id: string;
  name: string;
  sure: number;
  vonVers: number;
  bisVers: number;
  bewertung: number | null;
  datum: string;
};

/** Letzte Hifz-Einträge der Lernenden einer Gruppe (nur Lehrkraft der Gruppe). */
export async function hifzDerGruppe(gruppeId: string, kontext: GruppenKontext, heute: string): Promise<HifzZeile[] | null> {
  if (!darfInGruppe(kontext, 'fortschritt.erfassen', gruppeId)) return null;
  return db
    .select({
      id: schema.hifzEintrag.id,
      name: schema.lernende.anzeigename,
      sure: schema.hifzEintrag.sure,
      vonVers: schema.hifzEintrag.vonVers,
      bisVers: schema.hifzEintrag.bisVers,
      bewertung: schema.hifzEintrag.bewertung,
      datum: schema.hifzEintrag.datum,
    })
    .from(schema.hifzEintrag)
    .innerJoin(schema.lernende, eq(schema.lernende.id, schema.hifzEintrag.lernendeId))
    .innerJoin(
      schema.gruppenMitglied,
      and(eq(schema.gruppenMitglied.lernendeId, schema.hifzEintrag.lernendeId), eq(schema.gruppenMitglied.gruppeId, gruppeId)),
    )
    .where(mitgliedHeute(heute))
    .orderBy(desc(schema.hifzEintrag.datum), desc(schema.hifzEintrag.id))
    .limit(10);
}

export type MeldungKurz = {
  id: string;
  grund: (typeof schema.chatMeldungGrundEnum.enumValues)[number];
  status: 'offen' | 'in_bearbeitung';
  erstelltAm: Date;
  kanalId: string;
  kanalArt: 'gruppe' | 'eltern';
  nachrichtId: number | null;
  /** Gemeldete Person (für Stummschalten), bei der Meldung gespeichert – bleibt auch nach dem Löschlauf. */
  absenderId: string | null;
  absenderName: string | null;
  /** Lerndatensatz des Absenders in dieser Gruppe (für „Mitglied entfernen“). */
  absenderLernendeId: string | null;
  /** Absender gehört zur Gruppenleitung (dann kein Stummschalten durch die andere Leitung). */
  absenderIstLeitung: boolean;
  nachrichtEntfernt: boolean;
};

/**
 * Offene Meldungen der Gruppe für die Moderation (S-07…S-09): nur Gruppenleitung, nur Meldungen über Lernende oder
 * Eltern (D-02, `fuerLeitungSichtbar`). Ohne Inhalte – den Kontext lädt erst die Einzelansicht (`meldungsKontext`,
 * mit Protokoll); auch sie und der Abschluss (`moderiereMeldung`) gehen nur über diese Auswahl.
 */
export async function offeneMeldungen(gruppeId: string, kontext: GruppenKontext): Promise<MeldungKurz[] | null> {
  if (!darfInGruppe(kontext, 'chat.moderieren', gruppeId)) return null;
  const zeilen = await db
    .select({
      id: schema.chatMeldung.id,
      grund: schema.chatMeldung.grund,
      status: schema.chatMeldung.status,
      erstelltAm: schema.chatMeldung.erstelltAm,
      kanalId: schema.chatKanal.id,
      kanalArt: schema.chatKanal.art,
      nachrichtId: schema.chatMeldung.nachrichtId,
      absenderId: schema.chatMeldung.gemeldetePerson,
      nachrichtDa: schema.chatNachricht.id,
      entferntAm: schema.chatNachricht.entferntAm,
      anzeigename: schema.kontoProfil.anzeigename,
      name: schema.user.name,
    })
    .from(schema.chatMeldung)
    .innerJoin(schema.chatKanal, eq(schema.chatKanal.id, schema.chatMeldung.kanalId))
    .leftJoin(schema.chatNachricht, eq(schema.chatNachricht.id, schema.chatMeldung.nachrichtId))
    .leftJoin(schema.user, eq(schema.user.id, schema.chatMeldung.gemeldetePerson))
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.chatMeldung.gemeldetePerson))
    .where(
      and(eq(schema.chatKanal.gruppeId, gruppeId), inArray(schema.chatMeldung.status, [...OFFEN]), fuerLeitungSichtbar(kontext.benutzerId)),
    )
    .orderBy(asc(schema.chatMeldung.erstelltAm));
  const absender = [...new Set(zeilen.map((z) => z.absenderId).filter((x): x is string => Boolean(x)))];
  const leitung = new Set(
    (
      await db
        .select({ id: schema.gruppenLeitung.benutzerId })
        .from(schema.gruppenLeitung)
        .where(eq(schema.gruppenLeitung.gruppeId, gruppeId))
    ).map((z) => z.id),
  );
  const lernende = absender.length
    ? await db
        .select({ id: schema.lernende.id, benutzerId: schema.lernende.benutzerId })
        .from(schema.lernende)
        .innerJoin(
          schema.gruppenMitglied,
          and(
            eq(schema.gruppenMitglied.lernendeId, schema.lernende.id),
            eq(schema.gruppenMitglied.gruppeId, gruppeId),
            isNull(schema.gruppenMitglied.bis),
          ),
        )
        .where(inArray(schema.lernende.benutzerId, absender))
    : [];
  const lernendeNach = new Map(lernende.map((l) => [l.benutzerId, l.id]));
  return zeilen.map((z) => ({
    id: z.id,
    grund: z.grund,
    status: z.status as MeldungKurz['status'],
    erstelltAm: z.erstelltAm,
    kanalId: z.kanalId,
    kanalArt: z.kanalArt,
    nachrichtId: z.nachrichtId,
    absenderId: z.absenderId,
    absenderName: z.absenderId ? chatName(z.anzeigename ?? z.name ?? '') : null,
    absenderLernendeId: z.absenderId ? (lernendeNach.get(z.absenderId) ?? null) : null,
    absenderIstLeitung: z.absenderId !== null && leitung.has(z.absenderId),
    // Vom Löschlauf entfernt (Zeile fehlt) zählt wie entfernt: nichts mehr zu entfernen
    nachrichtEntfernt: z.entferntAm !== null || z.nachrichtDa === null,
  }));
}

/**
 * Status beider Kanäle einer Gruppe (Moderation: pausieren/fortsetzen; eine Pause der Rolle kinderschutz kann die Leitung
 * nicht aufheben). Legt fehlende Kanäle nicht an.
 */
export async function kanalStatus(gruppeId: string) {
  return db
    .select({
      id: schema.chatKanal.id,
      art: schema.chatKanal.art,
      status: schema.chatKanal.status,
      kinderschutzPause: schema.chatKanal.kinderschutzPause,
    })
    .from(schema.chatKanal)
    .where(eq(schema.chatKanal.gruppeId, gruppeId))
    .orderBy(asc(schema.chatKanal.art));
}
