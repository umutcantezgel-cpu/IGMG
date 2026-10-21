import 'server-only';
import { and, asc, between, count, desc, eq, inArray, isNotNull, isNull, sql, sum } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import type { Mehrsprachig } from '@/lib/db/schema/typen';
import { einwilligungsLage } from '@/lib/konto/sechzehn';
import { darfInGruppe, type GruppenKontext } from '@/lib/rechte/gruppen';
import { ladeEinheitJson, ladeVerzeichnisJson } from '@/server/queries/lernapp/pakete';
import { istRichtung, pruefeLernappBezug, zerlegeRichtung, type LernappBezug, type RichtungId } from '../kurse';
import { lektionAusPaket, lektionImPaket } from '../paket/bauen';
import type { LernText } from '@/lib/db/schema/lernapp';
import { GRUPPEN_KURSE } from '../ereignisse/kurs';
import { lernappEinwilligung } from '../sync/server';
import {
  type Alterslage,
  abSechzehn,
  bestenliste,
  elternSehenLernwoche,
  type GruppenzielStand,
  gruppenziel,
  istWochenziel,
  lernwoche,
  type Platz,
  siehtBestenliste,
  tageAusKursen,
  type Woche,
  type WochenTag,
  wochenSumme,
  wocheVon,
} from './regeln';

/**
 * Gruppen, Familien, Zuweisungen und Bestenliste der Lern-App auf dem Server (L7-02; ADR 0043 Nr. 7/8; KERN 4.0 §5).
 * Jede Funktion prüft das Recht selbst (Gruppenkontext aus `ladeGruppenKontext`, `darfInGruppe`) und wirft sonst
 * `KeinGruppenZugang` – die Aufrufer (Route, Actions, Seiten) prüfen vorher Sitzung und Schalter
 * (`lernapp_gruppen`, für Bestenlisten zusätzlich `lernapp_rangliste`). Personendaten nur so weit nötig:
 *
 * - **Gruppenisolation:** Lehrkräfte sehen nur ihre Gruppen (Leitung `lehrkraft`), Lernende nur die eigenen, Eltern nur die
 *   Lernwoche ihres Kindes. Fremde Gruppen verhalten sich wie „gibt es nicht“.
 * - **Einwilligung:** Stand, Gruppenziel und Bestenliste zählen nur Konten, deren Einwilligung `lernapp` gilt
 *   (`lernappEinwilligung`, bei Kindern die der Eltern).
 * - **Kein Rückschluss auf religiöses Lernen (Art. 9, S-L3 M-1):** Bestenliste und Gruppenziel zählen nur XP aus den
 *   Sprachkursen (D-L04), der Stand der Lehrkraft nur die Kurse der Zuweisungen ihrer Gruppe (D-L03) – beides aus
 *   `lernapp_tag_kurs`. Nur die Lernwoche der Eltern liest die Tagessumme aller Kurse (`lernapp_tag`).
 * - **Bestenliste:** nur Konten ab 16 mit eigener Zustimmung und Einwilligung erscheinen – und nur diese sehen sie
 *   (gegenseitiger Kreis, `regeln.siehtBestenliste`).
 * - **Mitgliedschaft:** nur laufende (`bis` leer), wie `ladeGruppenKontext` – wer heute ausgetragen wurde, zählt nicht mehr.
 * - **Audit** ohne Inhalte: nur Kennungen, Kurs/Einheit und Schalterstände.
 */
export class KeinGruppenZugang extends Error {
  constructor() {
    super('Kein Zugang zu dieser Gruppe');
  }
}

/** Höchstens so viele Lern-App-Zuweisungen je Gruppe (Bremse gegen Massenanlage). */
export const ZUWEISUNGEN_JE_GRUPPE = 60;

// ——— Bausteine ———

type KontoAlter = { benutzerId: string; anzeigename: string; alter: Alterslage };

/** Anzeigename und Alterslage mehrerer Konten (Gemeinde-Profil und ggf. Lerndatensatz). */
async function kontenAlter(benutzerIds: readonly string[]): Promise<Map<string, KontoAlter>> {
  if (!benutzerIds.length) return new Map();
  const zeilen = await db
    .select({
      benutzerId: schema.kontoProfil.benutzerId,
      anzeigename: schema.kontoProfil.anzeigename,
      istKind: schema.kontoProfil.istKind,
      lernendeId: schema.lernende.id,
      sechzehnAm: schema.lernende.sechzehnAm,
    })
    .from(schema.kontoProfil)
    .leftJoin(schema.lernende, eq(schema.lernende.benutzerId, schema.kontoProfil.benutzerId))
    .where(inArray(schema.kontoProfil.benutzerId, [...new Set(benutzerIds)]));
  return new Map(
    zeilen.map((z) => [
      z.benutzerId,
      {
        benutzerId: z.benutzerId,
        anzeigename: z.anzeigename,
        alter: { istKind: z.istKind, hatLerndatensatz: z.lernendeId !== null, sechzehnAm: z.sechzehnAm },
      },
    ]),
  );
}

/** Alterslage eines Kontos (ohne Profil: vorsichtig Kind). */
export async function alterVon(benutzerId: string): Promise<KontoAlter> {
  return (
    (await kontenAlter([benutzerId])).get(benutzerId) ?? {
      benutzerId,
      anzeigename: '',
      alter: { istKind: true, hatLerndatensatz: false, sechzehnAm: null },
    }
  );
}

/** Gilt die Einwilligung `lernapp` (bei Kindern die der Eltern)? Je Konto. */
async function mitEinwilligung(konten: readonly { benutzerId: string; istKind: boolean }[], jetzt: Date): Promise<Set<string>> {
  const lagen = await Promise.all(
    konten.map(async (k) => [k.benutzerId, await lernappEinwilligung(k.benutzerId, { istKind: k.istKind }, jetzt)] as const),
  );
  return new Set(lagen.filter(([, l]) => l === 'erteilt').map(([id]) => id));
}

/** Wochen-XP je Konto für Bestenliste und Gruppenziel: nur aus den Sprachkursen (`lernapp_tag_kurs`, D-L04). */
async function wochenXp(benutzerIds: readonly string[], woche: Woche): Promise<Map<string, number>> {
  if (!benutzerIds.length) return new Map();
  const T = schema.lernappTagKurs;
  const zeilen = await db
    .select({ benutzerId: T.benutzerId, xp: sum(T.xp).mapWith(Number) })
    .from(T)
    .where(and(inArray(T.benutzerId, [...benutzerIds]), between(T.tag, woche.von, woche.bis), inArray(T.kurs, [...GRUPPEN_KURSE])))
    .groupBy(T.benutzerId);
  return new Map(zeilen.map((z) => [z.benutzerId, z.xp ?? 0]));
}

/** Lerntage eines Kontos in der Woche. */
async function wochenTage(benutzerId: string, woche: Woche): Promise<WochenTag[]> {
  const zeilen = await db
    .select({
      tag: schema.lernappTag.tag,
      xp: schema.lernappTag.xp,
      lektionen: schema.lernappTag.lektionen,
      pause: schema.lernappTag.pause,
    })
    .from(schema.lernappTag)
    .where(and(eq(schema.lernappTag.benutzerId, benutzerId), between(schema.lernappTag.tag, woche.von, woche.bis)));
  return lernwoche(woche, zeilen);
}

async function zustimmungen(benutzerIds: readonly string[]): Promise<Set<string>> {
  if (!benutzerIds.length) return new Set();
  const zeilen = await db
    .select({ id: schema.lernappRanglisteZustimmung.benutzerId })
    .from(schema.lernappRanglisteZustimmung)
    .where(inArray(schema.lernappRanglisteZustimmung.benutzerId, [...benutzerIds]));
  return new Set(zeilen.map((z) => z.id));
}

/** Laufende Mitglieder (`bis` leer, wie `ladeGruppenKontext`) einer aktiven Gruppe (aktive Lernende) mit Konto, sofern vorhanden. */
async function mitglieder(gruppeId: string) {
  return db
    .select({
      lernendeId: schema.lernende.id,
      name: schema.lernende.anzeigename,
      benutzerId: schema.lernende.benutzerId,
      istKind: schema.kontoProfil.istKind,
    })
    .from(schema.gruppenMitglied)
    .innerJoin(schema.gruppe, and(eq(schema.gruppe.id, schema.gruppenMitglied.gruppeId), eq(schema.gruppe.status, 'aktiv')))
    .innerJoin(schema.lernende, eq(schema.lernende.id, schema.gruppenMitglied.lernendeId))
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.lernende.benutzerId))
    .where(and(eq(schema.gruppenMitglied.gruppeId, gruppeId), eq(schema.lernende.status, 'aktiv'), isNull(schema.gruppenMitglied.bis)))
    .orderBy(asc(schema.lernende.anzeigename));
}

/** Platzierungen aus Konten (Zustimmung, Einwilligung, Wochen-XP) – nur ab 16 (`regeln.bestenliste`). */
async function platzierungen(benutzerIds: readonly string[], woche: Woche, heute: string, jetzt: Date): Promise<Platz[]> {
  const ids = [...new Set(benutzerIds)];
  const alter = await kontenAlter(ids);
  // Kinder und Konten unter 16 gar nicht erst weiter abfragen (Sperre im Code)
  const infrage = ids.filter((id) => {
    const a = alter.get(id);
    return a !== undefined && abSechzehn(a.alter, heute);
  });
  const [zu, xp, ein] = await Promise.all([
    zustimmungen(infrage),
    wochenXp(infrage, woche),
    mitEinwilligung(
      infrage.map((id) => ({ benutzerId: id, istKind: alter.get(id)!.alter.istKind })),
      jetzt,
    ),
  ]);
  return bestenliste(
    infrage.map((id) => ({
      benutzerId: id,
      anzeigename: alter.get(id)!.anzeigename,
      alter: alter.get(id)!.alter,
      zustimmung: zu.has(id),
      einwilligung: ein.has(id),
      wochenXp: xp.get(id) ?? 0,
    })),
    heute,
  );
}

/** Blick eines Kontos auf Bestenlisten: ab 16 (dann gibt es das Angebot) und ob es sie sieht (`regeln.siehtBestenliste`). */
export type Blick = { ab16: boolean; sieht: boolean };

/** Liest Alter, eigene Zustimmung und Einwilligung `lernapp` des betrachtenden Kontos. */
export async function blickAufBestenlisten(benutzerId: string, heute: string, jetzt = new Date()): Promise<Blick> {
  const eigen = await alterVon(benutzerId);
  if (!abSechzehn(eigen.alter, heute)) return { ab16: false, sieht: false };
  const [zustimmung, einwilligung] = await Promise.all([
    hatZustimmung(benutzerId),
    lernappEinwilligung(benutzerId, { istKind: eigen.alter.istKind }, jetzt),
  ]);
  return { ab16: true, sieht: siehtBestenliste({ alter: eigen.alter, zustimmung, einwilligung: einwilligung === 'erteilt' }, heute) };
}

// ——— Einstellungen der Gruppe (Lehrkraft) ———

export type GruppenEinstellung = { wochenzielXp: number | null; bestenliste: boolean };

export async function gruppenEinstellung(gruppeId: string): Promise<GruppenEinstellung> {
  const [z] = await db
    .select({ wochenzielXp: schema.lernappGruppe.wochenzielXp, bestenliste: schema.lernappGruppe.bestenliste })
    .from(schema.lernappGruppe)
    .where(eq(schema.lernappGruppe.gruppeId, gruppeId));
  return z ?? { wochenzielXp: null, bestenliste: false };
}

function verlangeLehrkraft(kontext: GruppenKontext, gruppeId: string): void {
  // `aufgabe.bearbeiten` steht nur der Lehrkraft der Gruppe zu (nicht der Aufsicht, nicht Lernenden oder Eltern)
  if (!darfInGruppe(kontext, 'aufgabe.bearbeiten', gruppeId)) throw new KeinGruppenZugang();
}

/** Wochenziel setzen (null = kein Gruppenziel). Nur die Lehrkraft der Gruppe. */
export async function setzeWochenziel(kontext: GruppenKontext, gruppeId: string, ziel: number | null): Promise<void> {
  verlangeLehrkraft(kontext, gruppeId);
  if (ziel !== null && !istWochenziel(ziel)) throw new KeinGruppenZugang();
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.lernappGruppe)
      .values({ gruppeId, wochenzielXp: ziel, geaendertVon: kontext.benutzerId })
      .onConflictDoUpdate({
        target: schema.lernappGruppe.gruppeId,
        set: { wochenzielXp: ziel, geaendertVon: kontext.benutzerId, geaendertAm: new Date() },
      });
    await protokolliere(
      {
        benutzerId: kontext.benutzerId,
        aktion: 'lernapp.gruppenziel_geaendert',
        zielTyp: 'gruppe',
        zielId: gruppeId,
        details: { wochenziel: ziel },
      },
      tx,
    );
  });
}

/** Bestenliste der Gruppe ein- oder ausschalten. Nur die Lehrkraft; der Aufrufer prüft den Schalter `lernapp_rangliste`. */
export async function setzeGruppenBestenliste(kontext: GruppenKontext, gruppeId: string, an: boolean): Promise<void> {
  verlangeLehrkraft(kontext, gruppeId);
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.lernappGruppe)
      .values({ gruppeId, bestenliste: an, geaendertVon: kontext.benutzerId })
      .onConflictDoUpdate({
        target: schema.lernappGruppe.gruppeId,
        set: { bestenliste: an, geaendertVon: kontext.benutzerId, geaendertAm: new Date() },
      });
    await protokolliere(
      { benutzerId: kontext.benutzerId, aktion: 'lernapp.bestenliste_geaendert', zielTyp: 'gruppe', zielId: gruppeId, details: { an } },
      tx,
    );
  });
}

// ——— Zuweisungen ———

export type Zuweisung = {
  id: string;
  gruppeId: string;
  titel: string;
  kurs: RichtungId;
  einheit: string;
  lektion: string | null;
  faellig: string | null;
  erstelltAm: Date;
};

function alsZuweisung(z: {
  id: string;
  gruppeId: string;
  titel: string;
  faellig: string | null;
  bezug: unknown;
  erstelltAm: Date;
}): Zuweisung | null {
  const b = pruefeLernappBezug(z.bezug);
  if (!b?.einheit || !istRichtung(b.kurs)) return null;
  return {
    id: z.id,
    gruppeId: z.gruppeId,
    titel: z.titel,
    kurs: b.kurs,
    einheit: b.einheit,
    lektion: b.lektion ?? null,
    faellig: z.faellig,
    erstelltAm: z.erstelltAm,
  };
}

const lernappBezug = sql`${schema.aufgabe.bezug}->>'art' = 'lernapp'`;

async function zuweisungenIn(gruppenIds: readonly string[]): Promise<Zuweisung[]> {
  if (!gruppenIds.length) return [];
  const zeilen = await db
    .select({
      id: schema.aufgabe.id,
      gruppeId: schema.aufgabe.gruppeId,
      titel: schema.aufgabe.titel,
      faellig: schema.aufgabe.faellig,
      bezug: schema.aufgabe.bezug,
      erstelltAm: schema.aufgabe.erstelltAm,
    })
    .from(schema.aufgabe)
    .where(and(inArray(schema.aufgabe.gruppeId, [...gruppenIds]), lernappBezug))
    .orderBy(desc(schema.aufgabe.erstelltAm));
  return zeilen.flatMap((z) => {
    const w = alsZuweisung(z);
    return w ? [w] : [];
  });
}

/** Einheiten, die im Kurs ausgeliefert werden (Kursverzeichnis wie in der App), mit Thema. */
export async function einheitenVon(kurs: RichtungId): Promise<{ schluessel: string; stufe: string; thema: LernText }[]> {
  const json = await ladeVerzeichnisJson(kurs);
  if (!json) return [];
  const v = JSON.parse(json) as { einheiten: { schluessel: string; stufe: string; reihenfolge: number; thema: LernText }[] };
  return v.einheiten.map((e) => ({ schluessel: e.schluessel, stufe: e.stufe, thema: e.thema }));
}

/** Thema einer Einheit (für Listen; null, wenn sie nicht ausgeliefert wird). */
export async function themenVon(kurse: readonly RichtungId[]): Promise<Map<string, LernText>> {
  const themen = new Map<string, LernText>();
  for (const k of new Set(kurse)) for (const e of await einheitenVon(k)) themen.set(`${k}|${e.schluessel}`, e.thema);
  return themen;
}

export type LektionWahl = {
  /** Schlüssel der Datenbank (`aufgabe.bezug.lektion`) */
  schluessel: string;
  /** Schlüssel im Paket (Adresse der Übung: `/lern-app/<ui>/<kurs>/ueben?l=<paket>`) */
  paket: string;
  /** Position in der Einheit, ab 1 („Lektion 2“) */
  nr: number;
  art: string;
};

/** Lektionen einer ausgelieferten Einheit in der Reihenfolge des Pakets (leer, wenn sie nicht ausgeliefert wird). */
export async function lektionenVon(kurs: RichtungId, einheit: string): Promise<LektionWahl[]> {
  const paket = await ladeEinheitJson(kurs, einheit);
  if (!paket) return [];
  const p = JSON.parse(paket.json) as { lektionen: { schluessel: string; art: string }[] };
  return p.lektionen.flatMap((l, i) => {
    const db = lektionAusPaket(l.schluessel);
    return db && db.richtung === kurs ? [{ schluessel: db.schluessel, paket: l.schluessel, nr: i + 1, art: l.art }] : [];
  });
}

export type ZuweisungsDetail = {
  thema: LernText | null;
  /** Schlüssel der Lektion im Paket (für den Link) und ihre Nummer; null bei ganzer Einheit */
  paketLektion: string | null;
  nr: number | null;
};

/**
 * Thema und Lektionsnummer je Zuweisung (Schlüssel: Zuweisungs-ID). Wird eine Lektion nicht mehr ausgeliefert, bleibt
 * ihr Paket-Schlüssel erhalten (abgeleitet aus dem Datenbank-Schlüssel), die Nummer fehlt.
 */
export async function zuweisungsDetails(
  liste: readonly Pick<Zuweisung, 'id' | 'kurs' | 'einheit' | 'lektion'>[],
): Promise<Map<string, ZuweisungsDetail>> {
  const themen = await themenVon(liste.map((z) => z.kurs));
  const lektionen = new Map<string, LektionWahl[]>();
  for (const z of liste) {
    const k = `${z.kurs}|${z.einheit}`;
    if (z.lektion && !lektionen.has(k)) lektionen.set(k, await lektionenVon(z.kurs, z.einheit));
  }
  return new Map(
    liste.map((z) => {
      const k = `${z.kurs}|${z.einheit}`;
      const l = z.lektion ? (lektionen.get(k) ?? []).find((x) => x.schluessel === z.lektion) : undefined;
      const paketLektion = z.lektion ? (l?.paket ?? lektionImPaket(z.kurs, zerlegeRichtung(z.kurs).ziel, z.lektion)) : null;
      return [z.id, { thema: themen.get(k) ?? null, paketLektion, nr: l?.nr ?? null }];
    }),
  );
}

/**
 * Einheit (oder Lektion) der Gruppe zuweisen (L3-E05): nur die Lehrkraft, nur Sprachkurse, nur ausgelieferte Einheiten.
 * Der Erledigt-Vermerk entsteht beim Abgleich der Lernenden (`vermerkeZuweisungen`).
 */
export async function weiseZu(
  kontext: GruppenKontext,
  gruppeId: string,
  eingabe: { kurs: string; einheit: string; lektion?: string; faellig: string | null; titel: string },
): Promise<string> {
  verlangeLehrkraft(kontext, gruppeId);
  const bezug = pruefeLernappBezug({
    art: 'lernapp',
    kurs: eingabe.kurs,
    einheit: eingabe.einheit,
    ...(eingabe.lektion ? { lektion: eingabe.lektion } : {}),
  });
  if (!bezug?.einheit || !istRichtung(bezug.kurs)) throw new UngueltigeZuweisung('bezug');
  if (!(await einheitenVon(bezug.kurs)).some((e) => e.schluessel === bezug.einheit)) throw new UngueltigeZuweisung('einheit');
  if (bezug.lektion && !(await lektionenVon(bezug.kurs, bezug.einheit)).some((l) => l.schluessel === bezug.lektion))
    throw new UngueltigeZuweisung('einheit');
  const [{ n } = { n: 0 }] = await db
    .select({ n: count() })
    .from(schema.aufgabe)
    .where(and(eq(schema.aufgabe.gruppeId, gruppeId), lernappBezug));
  if (n >= ZUWEISUNGEN_JE_GRUPPE) throw new UngueltigeZuweisung('grenze');
  if (
    (await zuweisungenIn([gruppeId])).some(
      (z) => z.kurs === bezug.kurs && z.einheit === bezug.einheit && z.lektion === (bezug.lektion ?? null),
    )
  )
    throw new UngueltigeZuweisung('doppelt');
  return db.transaction(async (tx) => {
    const [z] = await tx
      .insert(schema.aufgabe)
      .values({
        gruppeId,
        titel: eingabe.titel.slice(0, 200),
        faellig: eingabe.faellig,
        bezug: bezug satisfies LernappBezug,
        erstelltVon: kontext.benutzerId,
      })
      .returning({ id: schema.aufgabe.id });
    await protokolliere(
      {
        benutzerId: kontext.benutzerId,
        aktion: 'lernapp.zuweisung_angelegt',
        zielTyp: 'gruppe',
        zielId: gruppeId,
        details: { aufgabe: z!.id, kurs: bezug.kurs, einheit: bezug.einheit ?? null },
      },
      tx,
    );
    return z!.id;
  });
}

export class UngueltigeZuweisung extends Error {
  constructor(readonly grund: 'bezug' | 'einheit' | 'grenze' | 'doppelt') {
    super(`Zuweisung ungültig: ${grund}`);
  }
}

/** Zuweisung entfernen (samt Erledigt-Vermerken). Nur die Lehrkraft der Gruppe, nur Lern-App-Zuweisungen. */
export async function entferneZuweisung(kontext: GruppenKontext, aufgabeId: string): Promise<string> {
  const [a] = await db
    .select({ gruppeId: schema.aufgabe.gruppeId })
    .from(schema.aufgabe)
    .where(and(eq(schema.aufgabe.id, aufgabeId), lernappBezug));
  if (!a) throw new KeinGruppenZugang();
  verlangeLehrkraft(kontext, a.gruppeId);
  await db.transaction(async (tx) => {
    await tx.delete(schema.aufgabe).where(eq(schema.aufgabe.id, aufgabeId));
    await protokolliere(
      {
        benutzerId: kontext.benutzerId,
        aktion: 'lernapp.zuweisung_entfernt',
        zielTyp: 'gruppe',
        zielId: a.gruppeId,
        details: { aufgabe: aufgabeId },
      },
      tx,
    );
  });
  return a.gruppeId;
}

export type MeineZuweisung = Zuweisung & { gruppe: Mehrsprachig; erledigt: boolean };

/** Zuweisungen der eigenen Gruppen (Schülerkonto) mit Erledigt-Vermerk. */
export async function meineZuweisungen(kontext: GruppenKontext): Promise<MeineZuweisung[]> {
  if (!kontext.eigeneLernendeId || !kontext.eigeneGruppen.size) return [];
  const gruppen = [...kontext.eigeneGruppen];
  const [liste, namen, erledigt] = await Promise.all([
    zuweisungenIn(gruppen),
    db.select({ id: schema.gruppe.id, name: schema.gruppe.name }).from(schema.gruppe).where(inArray(schema.gruppe.id, gruppen)),
    db
      .select({ aufgabeId: schema.aufgabeErledigt.aufgabeId })
      .from(schema.aufgabeErledigt)
      .where(eq(schema.aufgabeErledigt.lernendeId, kontext.eigeneLernendeId)),
  ]);
  const name = new Map(namen.map((g) => [g.id, g.name]));
  const fertig = new Set(erledigt.map((e) => e.aufgabeId));
  return liste
    .map((z) => ({ ...z, gruppe: name.get(z.gruppeId) ?? { de: '' }, erledigt: fertig.has(z.id) }))
    .sort((a, b) => Number(a.erledigt) - Number(b.erledigt) || (a.faellig ?? '9999').localeCompare(b.faellig ?? '9999'));
}

// ——— Stand der Gruppe (Lehrkraft) ———

export type StandZeile = {
  lernendeId: string;
  name: string;
  /** hat ein eigenes Konto (Kinderzugang oder ab 16) */
  konto: boolean;
  /** Einwilligung `lernapp` gilt – nur dann gibt es Zahlen */
  einwilligung: boolean;
  /** nur aus den Kursen der Zuweisungen dieser Gruppe (D-L03) */
  woche: { xp: number; lektionen: number; lerntage: number } | null;
  erledigt: number | null;
};

export type StandDerGruppe = {
  name: Mehrsprachig;
  woche: Woche;
  einstellung: GruppenEinstellung;
  zuweisungen: (Zuweisung & { erledigt: number })[];
  zeilen: StandZeile[];
  /** Kurse, aus denen der Stand zählt: die der Zuweisungen dieser Gruppe */
  kurse: RichtungId[];
  ziel: GruppenzielStand | null;
};

/**
 * Stand der Gruppe für die Lehrkraft (KERN 4.0 §5): je Lernende/r Wochen-XP, Lektionen, Lerntage und erledigte
 * Zuweisungen – nur mit Einwilligung `lernapp`; ohne sie nur Name und Hinweis. Nur die Lehrkraft der Gruppe. XP,
 * Lektionen und Lerntage zählen nur aus den Kursen, die dieser Gruppe zugewiesen sind (D-L03, S-L3 M-1); ohne Zuweisung
 * gibt es nur Nullen. Das Gruppenziel zählt wie für die Lernenden nur die Sprachkurse.
 */
export async function standDerGruppe(
  kontext: GruppenKontext,
  gruppeId: string,
  heute: string,
  jetzt = new Date(),
): Promise<StandDerGruppe> {
  verlangeLehrkraft(kontext, gruppeId);
  const woche = wocheVon(heute);
  const [einstellung, liste, zuweisungen, [gruppenZeile]] = await Promise.all([
    gruppenEinstellung(gruppeId),
    mitglieder(gruppeId),
    zuweisungenIn([gruppeId]),
    db.select({ name: schema.gruppe.name }).from(schema.gruppe).where(eq(schema.gruppe.id, gruppeId)),
  ]);
  const konten = liste.filter((m) => m.benutzerId !== null);
  const ein = await mitEinwilligung(
    konten.map((m) => ({ benutzerId: m.benutzerId!, istKind: m.istKind ?? true })),
    jetzt,
  );
  const mitDaten = konten.filter((m) => ein.has(m.benutzerId!));
  const ids = mitDaten.map((m) => m.benutzerId!);
  const kurse = [...new Set(zuweisungen.map((z) => z.kurs))].sort();
  const T = schema.lernappTagKurs;
  const [tage, xpGruppe, erledigtZeilen] = await Promise.all([
    ids.length && kurse.length
      ? db
          .select({ benutzerId: T.benutzerId, tag: T.tag, xp: T.xp, lektionen: T.lektionen })
          .from(T)
          .where(and(inArray(T.benutzerId, ids), between(T.tag, woche.von, woche.bis), inArray(T.kurs, kurse)))
      : [],
    wochenXp(ids, woche),
    zuweisungen.length
      ? db
          .select({ aufgabeId: schema.aufgabeErledigt.aufgabeId, lernendeId: schema.aufgabeErledigt.lernendeId })
          .from(schema.aufgabeErledigt)
          .where(
            inArray(
              schema.aufgabeErledigt.aufgabeId,
              zuweisungen.map((z) => z.id),
            ),
          )
      : [],
  ]);
  const mitDatenLernende = new Set(mitDaten.map((m) => m.lernendeId));
  // Erledigt-Vermerke nur von Lernenden mit Einwilligung zählen
  const erledigt = erledigtZeilen.filter((e) => mitDatenLernende.has(e.lernendeId));
  const zeilen: StandZeile[] = liste.map((m) => {
    const mit = m.benutzerId !== null && ein.has(m.benutzerId);
    return {
      lernendeId: m.lernendeId,
      name: m.name,
      konto: m.benutzerId !== null,
      einwilligung: mit,
      woche: mit ? wochenSumme(lernwoche(woche, tageAusKursen(tage.filter((t) => t.benutzerId === m.benutzerId)))) : null,
      erledigt: mit ? erledigt.filter((e) => e.lernendeId === m.lernendeId).length : null,
    };
  });
  return {
    name: gruppenZeile?.name ?? { de: '' },
    woche,
    einstellung,
    zuweisungen: zuweisungen.map((z) => ({ ...z, erledigt: erledigt.filter((e) => e.aufgabeId === z.id).length })),
    zeilen,
    kurse,
    ziel: gruppenziel(
      einstellung.wochenzielXp,
      ids.map((id) => xpGruppe.get(id) ?? 0),
    ),
  };
}

// ——— Ansicht für Lernende (Lern-App, Mein Bereich) ———

export type GruppenAnsicht = {
  id: string;
  name: Mehrsprachig;
  ziel: GruppenzielStand | null;
  /** Die Gruppe hat eine Bestenliste, der Schalter ist an und das eigene Konto ab 16 (Angebot zur Zustimmung). */
  bestenlisteAn: boolean;
  /** null: keine Bestenliste (aus, unter 16, Schalter aus) oder nicht sichtbar (ohne eigene Zustimmung und Einwilligung) */
  bestenliste: Platz[] | null;
};

/**
 * Eigene Gruppen (als Lernende/r): Gruppenziel ohne Namen; Bestenliste nur, wenn sie eingeschaltet ist, der Schalter
 * `lernapp_rangliste` an ist (`rangliste`) und das eigene Konto sie sieht – ab 16 mit eigener Zustimmung und
 * Einwilligung (gegenseitiger Kreis). Fremde Gruppen kommen nie vor.
 */
export async function eigeneGruppen(
  kontext: GruppenKontext,
  heute: string,
  { rangliste, jetzt = new Date() }: { rangliste: boolean; jetzt?: Date },
): Promise<GruppenAnsicht[]> {
  const ids = [...kontext.eigeneGruppen];
  if (!ids.length) return [];
  const woche = wocheVon(heute);
  const [blick, gruppen] = await Promise.all([
    rangliste ? blickAufBestenlisten(kontext.benutzerId, heute, jetzt) : ({ ab16: false, sieht: false } satisfies Blick),
    db.select({ id: schema.gruppe.id, name: schema.gruppe.name }).from(schema.gruppe).where(inArray(schema.gruppe.id, ids)),
  ]);
  return Promise.all(
    gruppen.map(async (g) => {
      if (!darfInGruppe(kontext, 'gruppe.sehen', g.id)) throw new KeinGruppenZugang();
      const [einstellung, liste] = await Promise.all([gruppenEinstellung(g.id), mitglieder(g.id)]);
      const konten = liste.flatMap((m) => (m.benutzerId ? [{ benutzerId: m.benutzerId, istKind: m.istKind ?? true }] : []));
      const ein = einstellung.wochenzielXp !== null ? await mitEinwilligung(konten, jetzt) : new Set<string>();
      const xp = await wochenXp([...ein], woche);
      const an = blick.ab16 && einstellung.bestenliste;
      return {
        id: g.id,
        name: g.name,
        ziel: gruppenziel(
          einstellung.wochenzielXp,
          [...ein].map((id) => xp.get(id) ?? 0),
        ),
        bestenlisteAn: an,
        bestenliste:
          an && blick.sieht
            ? await platzierungen(
                konten.map((k) => k.benutzerId),
                woche,
                heute,
                jetzt,
              )
            : null,
      };
    }),
  );
}

// ——— Familie ———

/** Bestätigte, sorgeberechtigte Eltern-Kind-Bezüge zu aktiven Lernenden (wie bei der Einwilligung `lernapp` der Eltern). */
const bestaetigtesKind = (elternId: string) =>
  and(
    eq(schema.elternKind.elternId, elternId),
    eq(schema.elternKind.sorgeberechtigt, true),
    isNotNull(schema.elternKind.bestaetigtAm),
    eq(schema.lernende.status, 'aktiv'),
  );

/** Hat das Konto mindestens ein Kind mit bestätigtem, sorgeberechtigtem Bezug? (Familie, Familienschalter) */
export async function hatBestaetigtesKind(elternId: string): Promise<boolean> {
  const [z] = await db
    .select({ id: schema.elternKind.lernendeId })
    .from(schema.elternKind)
    .innerJoin(schema.lernende, eq(schema.lernende.id, schema.elternKind.lernendeId))
    .where(bestaetigtesKind(elternId))
    .limit(1);
  return z !== undefined;
}

/** Kinder (Konten) einer Familie: bestätigte, sorgeberechtigte Eltern-Kind-Bezüge mit Konto des Kindes. */
async function kinderKonten(elternId: string): Promise<string[]> {
  const zeilen = await db
    .select({ benutzerId: schema.lernende.benutzerId })
    .from(schema.elternKind)
    .innerJoin(schema.lernende, eq(schema.lernende.id, schema.elternKind.lernendeId))
    .where(and(bestaetigtesKind(elternId), isNotNull(schema.lernende.benutzerId)));
  return zeilen.flatMap((z) => (z.benutzerId ? [z.benutzerId] : []));
}

/**
 * Familien, zu denen ein Konto gehört: die eigene (als Elternteil mit bestätigtem, sorgeberechtigtem Bezug) und die der
 * eigenen Eltern (ebenso nur bestätigt und sorgeberechtigt).
 */
async function familienVon(benutzerId: string, kontext: GruppenKontext): Promise<string[]> {
  const eltern = new Set<string>();
  if (kontext.kinder.size && (await hatBestaetigtesKind(benutzerId))) eltern.add(benutzerId);
  if (kontext.eigeneLernendeId) {
    const zeilen = await db
      .select({ elternId: schema.elternKind.elternId })
      .from(schema.elternKind)
      .where(
        and(
          eq(schema.elternKind.lernendeId, kontext.eigeneLernendeId),
          eq(schema.elternKind.sorgeberechtigt, true),
          isNotNull(schema.elternKind.bestaetigtAm),
        ),
      );
    for (const z of zeilen) eltern.add(z.elternId);
  }
  return [...eltern];
}

/** `bestenliste` null: eingeschaltet, aber erst mit eigener Zustimmung und Einwilligung sichtbar (gegenseitiger Kreis). */
export type FamilienAnsicht = { eigene: boolean; bestenliste: Platz[] | null };

/**
 * Bestenlisten der Familien eines Kontos (ADR 0043 Nr. 8): nur eingeschaltete, nur für Konten ab 16, nur Mitglieder ab 16
 * mit Zustimmung – und sichtbar nur, wenn das eigene Konto selbst zugestimmt hat und seine Einwilligung gilt. Eltern sehen
 * hier nie Kinder unter 16 (Sperre im Code); die Lernwoche des Kindes steht in Mein Bereich.
 */
export async function familienBestenlisten(kontext: GruppenKontext, heute: string, jetzt = new Date()): Promise<FamilienAnsicht[]> {
  const blick = await blickAufBestenlisten(kontext.benutzerId, heute, jetzt);
  if (!blick.ab16) return [];
  const familien = await familienVon(kontext.benutzerId, kontext);
  if (!familien.length) return [];
  const an = await db
    .select({ elternId: schema.lernappFamilie.elternId })
    .from(schema.lernappFamilie)
    .where(and(inArray(schema.lernappFamilie.elternId, familien), eq(schema.lernappFamilie.bestenliste, true)));
  const woche = wocheVon(heute);
  return Promise.all(
    an.map(async ({ elternId }) => ({
      eigene: elternId === kontext.benutzerId,
      bestenliste: blick.sieht ? await platzierungen([elternId, ...(await kinderKonten(elternId))], woche, heute, jetzt) : null,
    })),
  );
}

/** Ist die Bestenliste der eigenen Familie eingeschaltet? */
export async function familienBestenlisteAn(elternId: string): Promise<boolean> {
  const [z] = await db
    .select({ an: schema.lernappFamilie.bestenliste })
    .from(schema.lernappFamilie)
    .where(eq(schema.lernappFamilie.elternId, elternId));
  return z?.an ?? false;
}

/**
 * Bestenliste der Familie ein- oder ausschalten: nur ein Elternkonto mit mindestens einem Kind mit bestätigtem,
 * sorgeberechtigtem Bezug (wie `kinderKonten`, `familienVon` und `lernwocheDesKindes`).
 */
export async function setzeFamilienBestenliste(kontext: GruppenKontext, an: boolean): Promise<void> {
  if (!kontext.kinder.size || !(await hatBestaetigtesKind(kontext.benutzerId))) throw new KeinGruppenZugang();
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.lernappFamilie)
      .values({ elternId: kontext.benutzerId, bestenliste: an })
      .onConflictDoUpdate({ target: schema.lernappFamilie.elternId, set: { bestenliste: an, geaendertAm: new Date() } });
    await protokolliere(
      {
        benutzerId: kontext.benutzerId,
        aktion: 'lernapp.familie_bestenliste_geaendert',
        zielTyp: 'konto',
        zielId: kontext.benutzerId,
        details: { an },
      },
      tx,
    );
  });
}

// ——— Eigene Zustimmung zur Bestenliste ———

export async function hatZustimmung(benutzerId: string): Promise<boolean> {
  return (await zustimmungen([benutzerId])).has(benutzerId);
}

/** Zustimmen (nur ab 16; sonst `KeinGruppenZugang`). Wiederholtes Zustimmen ändert nichts. */
export async function stimmeZu(benutzerId: string, heute: string, textVersion: string): Promise<void> {
  const eigen = await alterVon(benutzerId);
  if (!abSechzehn(eigen.alter, heute)) throw new KeinGruppenZugang();
  await db.transaction(async (tx) => {
    const neu = await tx
      .insert(schema.lernappRanglisteZustimmung)
      .values({ benutzerId, textVersion })
      .onConflictDoNothing()
      .returning({ id: schema.lernappRanglisteZustimmung.benutzerId });
    if (neu.length)
      await protokolliere(
        { benutzerId, aktion: 'lernapp.bestenliste_zustimmung', zielTyp: 'konto', zielId: benutzerId, details: { erteilt: true } },
        tx,
      );
  });
}

/** Ausblenden: Zustimmung zurücknehmen – sofort, ohne Verlauf; unabhängig von Alter und Schaltern (Austritt jederzeit). */
export async function blendeAus(benutzerId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const weg = await tx
      .delete(schema.lernappRanglisteZustimmung)
      .where(eq(schema.lernappRanglisteZustimmung.benutzerId, benutzerId))
      .returning({ id: schema.lernappRanglisteZustimmung.benutzerId });
    if (weg.length)
      await protokolliere(
        { benutzerId, aktion: 'lernapp.bestenliste_zustimmung', zielTyp: 'konto', zielId: benutzerId, details: { erteilt: false } },
        tx,
      );
  });
}

// ——— Eltern: Lernwoche des Kindes ———

export type LernwocheKind =
  | { art: 'woche'; woche: Woche; tage: WochenTag[]; summe: { xp: number; lektionen: number; lerntage: number } }
  | { art: 'keinKonto' | 'einwilligung' | 'selbst' };

/**
 * Lernwoche eines eigenen Kindes (KERN 4.0 §5): nur mit Eltern-Kind-Bezug (sonst `KeinGruppenZugang`), nur mit
 * Einwilligung `lernapp`, nur bis zum Ende des Übergangs nach dem 16. Geburtstag (`elternSehenLernwoche`). Keine
 * Bestenliste, keine Einzelergebnisse.
 */
export async function lernwocheDesKindes(
  kontext: GruppenKontext,
  lernendeId: string,
  heute: string,
  jetzt = new Date(),
): Promise<LernwocheKind> {
  if (!kontext.kinder.has(lernendeId)) throw new KeinGruppenZugang();
  // nur bestätigte, sorgeberechtigte Eltern (wie bei der Einwilligung `lernapp` und den Familien)
  const [bezug] = await db
    .select({ id: schema.elternKind.lernendeId })
    .from(schema.elternKind)
    .where(
      and(
        eq(schema.elternKind.elternId, kontext.benutzerId),
        eq(schema.elternKind.lernendeId, lernendeId),
        eq(schema.elternKind.sorgeberechtigt, true),
        isNotNull(schema.elternKind.bestaetigtAm),
      ),
    );
  if (!bezug) throw new KeinGruppenZugang();
  const [k] = await db
    .select({ benutzerId: schema.lernende.benutzerId, sechzehnAm: schema.lernende.sechzehnAm, istKind: schema.kontoProfil.istKind })
    .from(schema.lernende)
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.lernende.benutzerId))
    .where(eq(schema.lernende.id, lernendeId));
  if (!k?.benutzerId) return { art: 'keinKonto' };
  if (!elternSehenLernwoche(einwilligungsLage(k.sechzehnAm, heute))) return { art: 'selbst' };
  if ((await lernappEinwilligung(k.benutzerId, { istKind: k.istKind ?? true }, jetzt)) !== 'erteilt') return { art: 'einwilligung' };
  const woche = wocheVon(heute);
  const tage = await wochenTage(k.benutzerId, woche);
  return { art: 'woche', woche, tage, summe: wochenSumme(tage) };
}
