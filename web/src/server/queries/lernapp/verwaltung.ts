import 'server-only';
import { asc, and, count, eq, inArray, isNotNull, isNull, notInArray, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Lektion } from '@/lib/lernapp/aufgaben/schema';
import { KRITISCHE_FEHLER, type Status } from '@/lib/lernapp/freigabe';
import { type KursId, KURSE, type RichtungId, STUFEN } from '@/lib/lernapp/kurse';
import { MATRIX, ROLLEN } from '@/lib/rechte/matrix';
import { baueEinheit, type Baustein, lektionImPaket } from '@/lib/lernapp/paket/bauen';
import {
  type EinheitZeile,
  type KursStand,
  leereZaehlung,
  pruefquote,
  type Pruefquote,
  standBaum,
  type StatusZaehlung,
} from '@/lib/lernapp/verwaltung/quoten';
import { formellisteFreigegeben, ladeBauEingaben } from './pakete';
import { zaehleOffeneLernappMeldungen } from './meldungen';

/**
 * Übersicht, Kursbaum und Vorschau der Lern-App-Verwaltung (L3-06, PLAN §7.1). Nur lesen.
 */

type ImportStand = { am?: string; dateien?: Record<string, unknown>; konflikte?: unknown[] };

export type Uebersicht = {
  baum: KursStand[];
  quoten: { gesamt: Pruefquote; jeSprache: Record<string, Pruefquote> };
  befunde: { meldungen: number; konflikte: number; kritisch: number; nachbessern: number };
  importe: { quelle: 'lernapp_import' | 'lernapp_testkurs'; am: string | null; dateien: number; konflikte: number }[];
  kurse: { id: string; version: number; aktiv: boolean; aktualisiertAm: Date }[];
  pruefende: { religioes: number; jeSprache: Record<string, number> };
};

/** Einträge (Lemmata, Sätze) je Einheit und Status – über das Schlüssel-Präfix `<kurs>.<stufe>.<einheit>`. */
async function eintraegeJeEinheit(): Promise<Map<string, StatusZaehlung>> {
  const prefix = (spalte: unknown) =>
    sql<string>`split_part(${spalte}, '.', 1) || '.' || split_part(${spalte}, '.', 2) || '.' || split_part(${spalte}, '.', 3)`;
  const [l, s] = await Promise.all([
    db
      .select({ einheit: prefix(schema.lernappLemma.schluessel), status: schema.lernappLemma.status, n: count() })
      .from(schema.lernappLemma)
      .groupBy(sql`1`, schema.lernappLemma.status),
    db
      .select({ einheit: prefix(schema.lernappSatz.schluessel), status: schema.lernappSatz.status, n: count() })
      .from(schema.lernappSatz)
      .groupBy(sql`1`, schema.lernappSatz.status),
  ]);
  const je = new Map<string, StatusZaehlung>();
  for (const z of [...l, ...s]) {
    const zaehlung = je.get(z.einheit) ?? leereZaehlung();
    zaehlung[z.status] += z.n;
    zaehlung.gesamt += z.n;
    je.set(z.einheit, zaehlung);
  }
  return je;
}

/** Kritische oder abgelehnte Sprachprüfungen zum aktuellen Hash, auch Audio (diese Einträge sind verborgen, bis korrigiert). */
async function kritischeBefunde(): Promise<number> {
  const p = schema.lernappPruefung;
  const kritisch = sql`(${p.urteil} = 'abgelehnt' or ${p.kategorie} in (${sql.join(
    KRITISCHE_FEHLER.map((k) => sql`${k}`),
    sql`, `,
  )}))`;
  let summe = 0;
  for (const [typ, t] of [
    ['lemma', schema.lernappLemma],
    ['satz', schema.lernappSatz],
    ['uebersetzung', schema.lernappUebersetzung],
  ] as const) {
    const [z] = await db
      .select({ n: sql<number>`count(distinct ${t.id})`.mapWith(Number) })
      .from(p)
      .innerJoin(t, and(sql`${p.inhaltId} = ${t.id}::text`, eq(p.inhaltHash, t.inhaltHash)))
      .where(and(eq(p.inhaltTyp, typ), sql`${p.art} <> 'religioes'`, kritisch));
    summe += z?.n ?? 0;
  }
  // Audio-Stichprobe: Prüfung zum Inhalts-Hash des Clips (`sha256`), der Clip ist dann im Paket verborgen
  const a = schema.lernappAudio;
  const [z] = await db
    .select({ n: sql<number>`count(distinct ${a.id})`.mapWith(Number) })
    .from(p)
    .innerJoin(a, and(sql`${p.inhaltId} = ${a.id}::text`, eq(p.inhaltHash, a.sha256)))
    .where(and(eq(p.inhaltTyp, 'audio'), sql`${p.art} <> 'religioes'`, kritisch));
  return summe + (z?.n ?? 0);
}

export async function ladeLernappUebersicht(): Promise<Uebersicht> {
  const einheiten = await db
    .select({
      schluessel: schema.lernappEinheit.schluessel,
      status: schema.lernappEinheit.status,
      kurs: schema.lernappAbschnitt.kursId,
      stufe: schema.lernappAbschnitt.stufe,
    })
    .from(schema.lernappEinheit)
    .innerJoin(schema.lernappAbschnitt, eq(schema.lernappAbschnitt.id, schema.lernappEinheit.abschnittId));
  const eintraege = await eintraegeJeEinheit();
  const zeilen: EinheitZeile[] = einheiten.map((e) => ({
    kurs: e.kurs,
    stufe: e.stufe,
    schluessel: e.schluessel,
    status: e.status,
    eintraege: eintraege.get(e.schluessel) ?? leereZaehlung(),
  }));

  const s = schema.lernappStichprobe;
  // Beurteilte Einträge je Stichprobe als eigene, gruppierte Abfrage: In einer Abfrage ohne Join setzt Drizzle Spalten in
  // `sql` unqualifiziert ein – ein Unterabfrage-Verweis auf `s.id` träfe dann die `id` der Prüfungen.
  const p = schema.lernappPruefung;
  const [stichproben, zaehlung] = await Promise.all([
    db.select({ id: s.id, sprache: s.sprache, art: s.art, entscheidung: s.entscheidung, groesse: s.groesse }).from(s),
    db
      .select({ stichprobeId: p.stichprobeId, n: sql<number>`count(distinct ${p.inhaltId})`.mapWith(Number) })
      .from(p)
      .where(isNotNull(p.stichprobeId))
      .groupBy(p.stichprobeId),
  ]);
  const beurteilt = new Map(zaehlung.map((z) => [z.stichprobeId, z.n]));
  const proben = stichproben.map((x) => ({ ...x, geprueft: beurteilt.get(x.id) ?? 0 }));
  const jeSprache: Record<string, Pruefquote> = {};
  for (const sprache of ['de', 'tr', 'ar']) jeSprache[sprache] = pruefquote(proben.filter((p) => p.sprache === sprache));

  const einstellungen = await db
    .select({ schluessel: schema.einstellung.schluessel, wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(inArray(schema.einstellung.schluessel, ['lernapp_import', 'lernapp_testkurs']));
  const importe = (['lernapp_import', 'lernapp_testkurs'] as const).flatMap((quelle) => {
    const w = einstellungen.find((e) => e.schluessel === quelle)?.wert as ImportStand | undefined;
    return w ? [{ quelle, am: w.am || null, dateien: Object.keys(w.dateien ?? {}).length, konflikte: (w.konflikte ?? []).length }] : [];
  });

  const kurse = await db
    .select({
      id: schema.lernappKurs.id,
      version: schema.lernappKurs.version,
      aktiv: schema.lernappKurs.aktiv,
      aktualisiertAm: schema.lernappKurs.aktualisiertAm,
    })
    .from(schema.lernappKurs)
    .orderBy(asc(schema.lernappKurs.id));

  // Religiöse Prüfung: nur Personen, deren Freigabe zählt – nicht gesperrt und ohne Administration (Altbestand vor Stufe C
  // N2, `freigabe.ts` `zaehltReligioes`); gleiche Bedingung wie im Startklar-Cockpit (`startklar/lernapp.ts`)
  const administration = db
    .select({ id: schema.rolleZuweisung.benutzerId })
    .from(schema.rolleZuweisung)
    .where(eq(schema.rolleZuweisung.rolle, 'administration'));
  const [religioes] = await db
    .select({ n: sql<number>`count(distinct ${schema.rolleZuweisung.benutzerId})`.mapWith(Number) })
    .from(schema.rolleZuweisung)
    .innerJoin(schema.user, eq(schema.user.id, schema.rolleZuweisung.benutzerId))
    .where(
      and(
        eq(schema.rolleZuweisung.rolle, 'religioese_pruefung'),
        isNull(schema.user.gesperrtAm),
        notInArray(schema.rolleZuweisung.benutzerId, administration),
      ),
    );
  const sprachPruefende = await db
    .select({ sprache: schema.lernappPrueferSprache.sprache, n: count() })
    .from(schema.lernappPrueferSprache)
    .groupBy(schema.lernappPrueferSprache.sprache);

  return {
    baum: standBaum(zeilen, KURSE, STUFEN),
    quoten: { gesamt: pruefquote(proben), jeSprache },
    befunde: {
      meldungen: await zaehleOffeneLernappMeldungen(),
      konflikte: importe.reduce((n, i) => n + i.konflikte, 0),
      kritisch: await kritischeBefunde(),
      nachbessern: proben.filter((p) => p.entscheidung === 'nachbessern').length,
    },
    importe,
    kurse: kurse.sort((a, b) => KURSE.indexOf(a.id as KursId) - KURSE.indexOf(b.id as KursId)),
    pruefende: {
      religioes: religioes?.n ?? 0,
      jeSprache: Object.fromEntries(sprachPruefende.map((z) => [z.sprache, z.n])),
    },
  };
}

export type BaumLektion = { schluessel: string; art: string; status: Status; aufgaben: number };
export type BaumEinheit = {
  schluessel: string;
  thema: Record<string, string>;
  status: Status;
  nurFuerAusgang: string | null;
  lektionen: BaumLektion[];
};
export type BaumAbschnitt = { stufe: string; einheiten: BaumEinheit[] };

/** Baum Abschnitt (Stufe) → Einheit → Lektion eines Kurses. */
export async function ladeKursBaum(kurs: KursId): Promise<BaumAbschnitt[]> {
  const abschnitte = await db
    .select({ id: schema.lernappAbschnitt.id, stufe: schema.lernappAbschnitt.stufe })
    .from(schema.lernappAbschnitt)
    .where(eq(schema.lernappAbschnitt.kursId, kurs))
    .orderBy(asc(schema.lernappAbschnitt.reihenfolge));
  if (!abschnitte.length) return [];
  const einheiten = await db
    .select({
      id: schema.lernappEinheit.id,
      abschnittId: schema.lernappEinheit.abschnittId,
      schluessel: schema.lernappEinheit.schluessel,
      thema: schema.lernappEinheit.thema,
      status: schema.lernappEinheit.status,
      nurFuerAusgang: schema.lernappEinheit.nurFuerAusgang,
    })
    .from(schema.lernappEinheit)
    .where(
      inArray(
        schema.lernappEinheit.abschnittId,
        abschnitte.map((a) => a.id),
      ),
    )
    .orderBy(asc(schema.lernappEinheit.reihenfolge), asc(schema.lernappEinheit.schluessel));
  // Aufgaben je Lektion über einen Join mit Gruppierung (eine Unterabfrage mit `${lektion.id}` stünde ohne Join
  // unqualifiziert da und zählte falsch)
  const lektionen = einheiten.length
    ? await db
        .select({
          id: schema.lernappLektion.id,
          einheitId: schema.lernappLektion.einheitId,
          schluessel: schema.lernappLektion.schluessel,
          art: schema.lernappLektion.art,
          status: schema.lernappLektion.status,
          aufgaben: sql<number>`count(${schema.lernappAufgabe.id})`.mapWith(Number),
        })
        .from(schema.lernappLektion)
        .leftJoin(schema.lernappAufgabe, eq(schema.lernappAufgabe.lektionId, schema.lernappLektion.id))
        .where(
          inArray(
            schema.lernappLektion.einheitId,
            einheiten.map((e) => e.id),
          ),
        )
        .groupBy(schema.lernappLektion.id)
        .orderBy(asc(schema.lernappLektion.reihenfolge), asc(schema.lernappLektion.schluessel))
    : [];
  return abschnitte.map((a) => ({
    stufe: a.stufe,
    einheiten: einheiten
      .filter((e) => e.abschnittId === a.id)
      .map((e) => ({
        schluessel: e.schluessel,
        thema: e.thema as Record<string, string>,
        status: e.status,
        nurFuerAusgang: e.nurFuerAusgang,
        lektionen: lektionen
          .filter((l) => l.einheitId === e.id)
          .map((l) => ({ schluessel: l.schluessel, art: l.art, status: l.status, aufgaben: l.aufgaben })),
      })),
  }));
}

/**
 * Lektion für die Vorschau im echten Spieler (PLAN §7.1): Entwürfe und automatisch geprüfte Einträge sichtbar, ohne Hinweis;
 * gesperrte nie. Sprachprüfungen bleiben außen vor (die Vorschau zeigt den Entwurf), die religiöse Freigabe nicht: Einträge
 * mit Religionsbezug erscheinen auch hier erst mit zwei Freigaben und freigegebener Formelliste (KERN 4.0 §2.3). Kein
 * Ereignis, keine Speicherung.
 */
export async function ladeVorschau(richtung: RichtungId, lektion: string): Promise<{ lektion: Lektion; warnungen: string[] } | null> {
  const einheit = lektion.split('.').slice(0, 3).join('.');
  const [eingabe] = await ladeBauEingaben(richtung, einheit);
  if (!eingabe) return null;
  const vorschau = <T extends Baustein>(b: T): T => ({
    ...b,
    status: b.status === 'gesperrt' ? 'gesperrt' : 'veroeffentlicht',
    pruefungen: b.pruefungen.filter((p) => p.art === 'religioes'),
  });
  const ergebnis = baueEinheit(
    {
      ...eingabe,
      einheit: vorschau(eingabe.einheit),
      lektionen: eingabe.lektionen.map((l) => ({ ...vorschau(l), aufgaben: l.aufgaben.map(vorschau) })),
      eintraege: new Map([...eingabe.eintraege].map(([k, v]) => [k, vorschau(v)])),
      uebersetzungen: new Map([...eingabe.uebersetzungen].map(([k, v]) => [k, vorschau(v)])),
      tipps: eingabe.tipps.map(vorschau),
    },
    { ungeprueftZeigen: true, formellisteFrei: await formellisteFreigegeben() },
  );
  const kurs = einheit.split('.')[0] as KursId;
  const gesucht = lektionImPaket(richtung, kurs, lektion);
  const l = ergebnis?.paket.lektionen.find((x) => x.schluessel === gesucht);
  return l ? { lektion: l, warnungen: ergebnis?.warnungen ?? [] } : null;
}

/** Personen, die Sprache prüfen dürfen (über ihre Rollen), mit ihren Prüfsprachen. */
export async function ladePruefende(): Promise<
  { id: string; name: string; email: string; rollen: string[]; sprachen: Record<string, string> }[]
> {
  const r = schema.rolleZuweisung;
  const kandidaten = await db
    .select({ id: schema.user.id, name: schema.user.name, email: schema.user.email, rolle: r.rolle })
    .from(r)
    .innerJoin(schema.user, eq(schema.user.id, r.benutzerId))
    .where(
      inArray(
        r.rolle,
        ROLLEN.filter((x) => MATRIX[x].has('lernapp.sprache.pruefen')),
      ),
    )
    .orderBy(asc(schema.user.name));
  const je = new Map<string, { id: string; name: string; email: string; rollen: string[]; sprachen: Record<string, string> }>();
  for (const k of kandidaten) {
    const e = je.get(k.id) ?? { id: k.id, name: k.name, email: k.email, rollen: [], sprachen: {} };
    e.rollen.push(k.rolle);
    je.set(k.id, e);
  }
  if (je.size) {
    const sprachen = await db
      .select()
      .from(schema.lernappPrueferSprache)
      .where(inArray(schema.lernappPrueferSprache.benutzerId, [...je.keys()]));
    for (const s of sprachen) je.get(s.benutzerId)!.sprachen[s.sprache] = s.ebene;
  }
  return [...je.values()];
}
