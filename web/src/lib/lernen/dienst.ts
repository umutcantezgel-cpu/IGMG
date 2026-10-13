import 'server-only';
import { and, asc, desc, eq, gte, inArray, isNull, lte, or } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { verschluessele } from '@/lib/krypto';
import { darfInGruppe, type GruppenKontext } from '@/lib/rechte/gruppen';
import { tagPlus, termineDerSerie, vorbelegung, type AnwesenheitsStatus } from './termine';

/**
 * Unterricht der Lernplattform (AUFTRAG 3.5, ADR 0026): Termine, Anwesenheit, Fortschritt, Hifz, Fehlmeldungen.
 * Jede Funktion prüft das Gruppenrecht selbst; Lehrkräfte sehen nur ihre Gruppen, Eltern nur ihr Kind, Schüler nur sich.
 */
export class KeinGruppenRecht extends Error {
  constructor() {
    super('KEIN_GRUPPENRECHT');
  }
}

function pruefe(ok: boolean): void {
  if (!ok) throw new KeinGruppenRecht();
}

/** Legt die Termine der Serie bis `bis` an (idempotent); Standard: 8 Wochen ab heute. */
export async function erzeugeTermine(gruppeId: string, von = berlinerDatum(new Date()), bis = tagPlus(von, 56)): Promise<number> {
  const [g] = await db.select().from(schema.gruppe).where(eq(schema.gruppe.id, gruppeId));
  if (!g) return 0;
  const vorschlaege = termineDerSerie(g, von, bis);
  if (!vorschlaege.length) return 0;
  const neu = await db
    .insert(schema.unterrichtstermin)
    .values(vorschlaege.map((v) => ({ gruppeId, ...v })))
    .onConflictDoNothing()
    .returning({ id: schema.unterrichtstermin.id });
  return neu.length;
}

export type TerminKurz = {
  id: string;
  gruppeId: string;
  gruppe: string;
  datum: string;
  beginn: string | null;
  ende: string | null;
  ausgefallen: boolean;
};

/** Termine der geleiteten Gruppen (Lehrkraft „Heute“ und die nächsten Tage). */
export async function termineDerLeitung(kontext: GruppenKontext, von: string, bis: string): Promise<TerminKurz[]> {
  const gruppen = [...kontext.leitung.keys()];
  if (!gruppen.length) return [];
  const zeilen = await db
    .select({
      id: schema.unterrichtstermin.id,
      gruppeId: schema.unterrichtstermin.gruppeId,
      name: schema.gruppe.name,
      datum: schema.unterrichtstermin.datum,
      beginn: schema.unterrichtstermin.beginn,
      ende: schema.unterrichtstermin.ende,
      ausgefallen: schema.unterrichtstermin.ausgefallen,
    })
    .from(schema.unterrichtstermin)
    .innerJoin(schema.gruppe, eq(schema.gruppe.id, schema.unterrichtstermin.gruppeId))
    .where(
      and(
        inArray(schema.unterrichtstermin.gruppeId, gruppen),
        gte(schema.unterrichtstermin.datum, von),
        lte(schema.unterrichtstermin.datum, bis),
      ),
    )
    .orderBy(asc(schema.unterrichtstermin.datum), asc(schema.unterrichtstermin.beginn));
  return zeilen.map((z) => ({ ...z, gruppe: z.name.de ?? '' }));
}

/** Mitglieder einer Gruppe an einem Tag (Mitgliedschaft lief an dem Tag). */
async function mitgliederAm(gruppeId: string, datum: string) {
  return db
    .select({ id: schema.lernende.id, anzeigename: schema.lernende.anzeigename })
    .from(schema.gruppenMitglied)
    .innerJoin(schema.lernende, eq(schema.lernende.id, schema.gruppenMitglied.lernendeId))
    .where(
      and(
        eq(schema.gruppenMitglied.gruppeId, gruppeId),
        lte(schema.gruppenMitglied.seit, datum),
        or(isNull(schema.gruppenMitglied.bis), gte(schema.gruppenMitglied.bis, datum)),
        eq(schema.lernende.status, 'aktiv'),
      ),
    )
    .orderBy(asc(schema.lernende.anzeigename));
}

export type AnwesenheitsZeile = { lernendeId: string; name: string; status: AnwesenheitsStatus; erfasst: boolean; fehlmeldung: boolean };

/** Liste zur Erfassung (ein Bildschirm, B-23): Mitglieder mit Vorbelegung aus Fehlmeldungen. */
export async function anwesenheitsListe(terminId: string, kontext: GruppenKontext) {
  const [t] = await db.select().from(schema.unterrichtstermin).where(eq(schema.unterrichtstermin.id, terminId));
  if (!t) return null;
  pruefe(darfInGruppe(kontext, 'anwesenheit.erfassen', t.gruppeId));
  const mitglieder = await mitgliederAm(t.gruppeId, t.datum);
  const ids = mitglieder.map((m) => m.id);
  const [erfasst, fehl] = ids.length
    ? await Promise.all([
        db
          .select()
          .from(schema.anwesenheit)
          .where(and(eq(schema.anwesenheit.terminId, terminId), inArray(schema.anwesenheit.lernendeId, ids))),
        db
          .select({ lernendeId: schema.fehlmeldung.lernendeId })
          .from(schema.fehlmeldung)
          .where(and(eq(schema.fehlmeldung.datum, t.datum), inArray(schema.fehlmeldung.lernendeId, ids))),
      ])
    : [[], []];
  const erfasstNach = new Map(erfasst.map((e) => [e.lernendeId, e.status]));
  const fehlend = new Set(fehl.map((f) => f.lernendeId));
  const zeilen: AnwesenheitsZeile[] = mitglieder.map((m) => ({
    lernendeId: m.id,
    name: m.anzeigename,
    status: vorbelegung(erfasstNach.get(m.id) ?? null, fehlend.has(m.id)),
    erfasst: erfasstNach.has(m.id),
    fehlmeldung: fehlend.has(m.id),
  }));
  return { termin: t, zeilen };
}

export async function erfasseAnwesenheit(
  terminId: string,
  eintraege: readonly { lernendeId: string; status: AnwesenheitsStatus; notiz?: string }[],
  kontext: GruppenKontext,
): Promise<number> {
  const liste = await anwesenheitsListe(terminId, kontext);
  if (!liste) return 0;
  const erlaubt = new Set(liste.zeilen.map((z) => z.lernendeId));
  const gueltig = eintraege.filter((e) => erlaubt.has(e.lernendeId));
  for (const e of gueltig) {
    const notiz = e.notiz?.trim() ? verschluessele(e.notiz.trim().slice(0, 500)) : null;
    const werte = {
      status: e.status,
      notizVerschluesselt: notiz?.daten ?? null,
      schluesselId: notiz?.schluesselId ?? null,
      erfasstVon: kontext.benutzerId,
      erfasstAm: new Date(),
    };
    await db
      .insert(schema.anwesenheit)
      .values({ terminId, lernendeId: e.lernendeId, ...werte })
      .onConflictDoUpdate({ target: [schema.anwesenheit.terminId, schema.anwesenheit.lernendeId], set: werte });
  }
  return gueltig.length;
}

/** Termin ausfallen lassen oder Thema setzen (Leitung). */
export async function aendereTermin(
  terminId: string,
  kontext: GruppenKontext,
  aenderung: { ausgefallen?: boolean; thema?: string | null },
) {
  const [t] = await db
    .select({ gruppeId: schema.unterrichtstermin.gruppeId })
    .from(schema.unterrichtstermin)
    .where(eq(schema.unterrichtstermin.id, terminId));
  if (!t) return false;
  pruefe(darfInGruppe(kontext, 'anwesenheit.erfassen', t.gruppeId));
  await db
    .update(schema.unterrichtstermin)
    .set({
      ...(aenderung.ausgefallen !== undefined ? { ausgefallen: aenderung.ausgefallen } : {}),
      ...(aenderung.thema !== undefined ? { thema: aenderung.thema?.slice(0, 200) ?? null } : {}),
    })
    .where(eq(schema.unterrichtstermin.id, terminId));
  return true;
}

export type Kursart = (typeof schema.kursartEnum.enumValues)[number];

/** Fortschritt einer Gruppe je Stufe der Kursart (Lehrkraft). */
export async function fortschrittDerGruppe(gruppeId: string, kursart: Kursart, kontext: GruppenKontext) {
  pruefe(darfInGruppe(kontext, 'fortschritt.erfassen', gruppeId));
  const heute = berlinerDatum(new Date());
  const [mitglieder, stufen] = await Promise.all([
    mitgliederAm(gruppeId, heute),
    db.select().from(schema.lehrplanStufe).where(eq(schema.lehrplanStufe.kursart, kursart)).orderBy(asc(schema.lehrplanStufe.reihenfolge)),
  ]);
  const ids = mitglieder.map((m) => m.id);
  const stand =
    ids.length && stufen.length
      ? await db
          .select()
          .from(schema.lernfortschritt)
          .where(
            and(
              inArray(schema.lernfortschritt.lernendeId, ids),
              inArray(
                schema.lernfortschritt.stufeId,
                stufen.map((s) => s.id),
              ),
            ),
          )
      : [];
  const nach = new Map(stand.map((s) => [`${s.lernendeId}|${s.stufeId}`, s.status]));
  return {
    stufen: stufen.map((s) => ({ id: s.id, reihenfolge: s.reihenfolge, titel: s.titel })),
    lernende: mitglieder.map((m) => ({
      id: m.id,
      name: m.anzeigename,
      stand: Object.fromEntries(stufen.map((s) => [s.id, nach.get(`${m.id}|${s.id}`) ?? null])),
    })),
  };
}

export async function setzeFortschritt(
  gruppeId: string,
  lernendeId: string,
  stufeId: string,
  status: (typeof schema.fortschrittStatusEnum.enumValues)[number] | null,
  kontext: GruppenKontext,
): Promise<boolean> {
  pruefe(darfInGruppe(kontext, 'fortschritt.erfassen', gruppeId));
  const mitglieder = await mitgliederAm(gruppeId, berlinerDatum(new Date()));
  if (!mitglieder.some((m) => m.id === lernendeId)) return false;
  if (status === null) {
    await db
      .delete(schema.lernfortschritt)
      .where(and(eq(schema.lernfortschritt.lernendeId, lernendeId), eq(schema.lernfortschritt.stufeId, stufeId)));
    return true;
  }
  const werte = { status, datum: berlinerDatum(new Date()), lehrkraftId: kontext.benutzerId };
  await db
    .insert(schema.lernfortschritt)
    .values({ lernendeId, stufeId, ...werte })
    .onConflictDoUpdate({ target: [schema.lernfortschritt.lernendeId, schema.lernfortschritt.stufeId], set: werte });
  return true;
}

/** Hifz: geprüften Abschnitt eintragen (Lehrkraft der Gruppe). */
export async function trageHifzEin(
  gruppeId: string,
  e: { lernendeId: string; sure: number; vonVers: number; bisVers: number; bewertung: number | null },
  kontext: GruppenKontext,
): Promise<boolean> {
  pruefe(darfInGruppe(kontext, 'fortschritt.erfassen', gruppeId));
  const [sure] = await db.select({ verse: schema.quranSure.verseAnzahl }).from(schema.quranSure).where(eq(schema.quranSure.nr, e.sure));
  if (!sure || e.vonVers < 1 || e.bisVers < e.vonVers || e.bisVers > sure.verse) return false;
  if (e.bewertung !== null && (e.bewertung < 1 || e.bewertung > 5)) return false;
  const mitglieder = await mitgliederAm(gruppeId, berlinerDatum(new Date()));
  if (!mitglieder.some((m) => m.id === e.lernendeId)) return false;
  await db.insert(schema.hifzEintrag).values({ ...e, lehrkraftId: kontext.benutzerId });
  return true;
}

/** Fehlmeldung der Eltern für ein eigenes Kind (heute oder künftig, höchstens 60 Tage voraus). */
export async function meldeFehlen(
  lernendeId: string,
  datum: string,
  grund: (typeof schema.fehlmeldungGrundEnum.enumValues)[number],
  kontext: GruppenKontext,
): Promise<boolean> {
  pruefe(kontext.kinder.has(lernendeId));
  const heute = berlinerDatum(new Date());
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum) || datum < heute || datum > tagPlus(heute, 60)) return false;
  await db.insert(schema.fehlmeldung).values({ lernendeId, datum, grund, erstelltVon: kontext.benutzerId });
  return true;
}

/** Übersicht eines Kindes für Eltern bzw. eines Schülers für sich selbst. */
export async function lernendenUebersicht(lernendeId: string, kontext: GruppenKontext) {
  const eigen = kontext.eigeneLernendeId === lernendeId;
  pruefe(eigen || kontext.kinder.has(lernendeId));
  const heute = berlinerDatum(new Date());
  const gruppen = await db
    .select({
      id: schema.gruppe.id,
      name: schema.gruppe.name,
      uhrzeitVon: schema.gruppe.uhrzeitVon,
      uhrzeitBis: schema.gruppe.uhrzeitBis,
      ort: schema.gruppe.ort,
    })
    .from(schema.gruppenMitglied)
    .innerJoin(schema.gruppe, eq(schema.gruppe.id, schema.gruppenMitglied.gruppeId))
    .where(and(eq(schema.gruppenMitglied.lernendeId, lernendeId), isNull(schema.gruppenMitglied.bis), eq(schema.gruppe.status, 'aktiv')));
  const gruppenIds = gruppen.map((g) => g.id);
  const [naechste, anwesenheit, fortschritt, hifz, fehlmeldungen] = await Promise.all([
    gruppenIds.length
      ? db
          .select()
          .from(schema.unterrichtstermin)
          .where(and(inArray(schema.unterrichtstermin.gruppeId, gruppenIds), gte(schema.unterrichtstermin.datum, heute)))
          .orderBy(asc(schema.unterrichtstermin.datum))
          .limit(5)
      : [],
    db
      .select({ datum: schema.unterrichtstermin.datum, status: schema.anwesenheit.status })
      .from(schema.anwesenheit)
      .innerJoin(schema.unterrichtstermin, eq(schema.unterrichtstermin.id, schema.anwesenheit.terminId))
      .where(eq(schema.anwesenheit.lernendeId, lernendeId))
      .orderBy(desc(schema.unterrichtstermin.datum))
      .limit(20),
    db
      .select({
        status: schema.lernfortschritt.status,
        datum: schema.lernfortschritt.datum,
        kursart: schema.lehrplanStufe.kursart,
        reihenfolge: schema.lehrplanStufe.reihenfolge,
        titel: schema.lehrplanStufe.titel,
      })
      .from(schema.lernfortschritt)
      .innerJoin(schema.lehrplanStufe, eq(schema.lehrplanStufe.id, schema.lernfortschritt.stufeId))
      .where(eq(schema.lernfortschritt.lernendeId, lernendeId))
      .orderBy(asc(schema.lehrplanStufe.kursart), asc(schema.lehrplanStufe.reihenfolge)),
    db
      .select()
      .from(schema.hifzEintrag)
      .where(eq(schema.hifzEintrag.lernendeId, lernendeId))
      .orderBy(desc(schema.hifzEintrag.datum))
      .limit(20),
    db
      .select({ datum: schema.fehlmeldung.datum, grund: schema.fehlmeldung.grund })
      .from(schema.fehlmeldung)
      .where(and(eq(schema.fehlmeldung.lernendeId, lernendeId), gte(schema.fehlmeldung.datum, heute)))
      .orderBy(asc(schema.fehlmeldung.datum)),
  ]);
  return { gruppen, naechste, anwesenheit, fortschritt, hifz, fehlmeldungen };
}
