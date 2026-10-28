import 'server-only';
import { and, desc, eq, gt, gte, inArray, lt, lte, ne, notInArray, sql } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import type { AbgleichStatus } from '@/lib/db/schema/gebetszeiten';
import { planeGebetszeitenHinweis } from '@/lib/mail/ausgang';
import { mitSperre } from '@/lib/wartung/sperre';
import { gebetszeitenEinstellung, type GebetszeitenEinstellung } from '@/lib/validierung/einstellungen';
import { monateVon, vergleiche, type BestandTag, type Konflikt, type LieferTag } from './abgleich-diff';
import { berlinerDatum } from './naechstes';
import { dateiQuelle } from './quellen/datei';
import { feedQuelle } from './quellen/igmg-feed';
import { pruefePlausibilitaet, type Auffaelligkeit, type HarterFehler } from './quellen/pruefung';
import { QuellenFehler, type GebetszeitenQuelle, type QuellenId } from './quellen/typen';
import { GEBETE } from './typen';
import { nurZeiten } from './vorrang';

/**
 * IGMG-Abgleich der Gebetszeiten (ADR 0048). Läuft nur aus dem Cron bzw. der Wartungsroute und aus der Verwaltung – nie
 * beim Seitenaufruf (K-14). Ablauf:
 * 1. Zeitraum: gestern bis Ende des Folgemonats bzw. `abgleich.tageVoraus` Tage.
 * 2. Abruf **außerhalb** der Sperre (offizieller Feed, sonst Jahresdatei; ohne beides tut der Lauf nichts), dann Plausibilität.
 * 3. Unter `mitSperre('gebetszeiten-abgleich')`: Bestand lesen, Diff (`abgleich-diff.ts`), in **einer** Transaktion
 *    Laufprotokoll, Upsert nur neuer und geänderter Tage (`quelle 'igmg'`, nie über einen Import der Gemeinde),
 *    Audit (`benutzerId: null`) und – nur beim Zustandswechsel – ein Mail-Hinweis an die Gebetszeiten-Verantwortlichen.
 * 4. Die Cache-Tags erneuert der Aufrufer, nur bei Änderungen (`monate`): die Route mit `revalidateTag`, eine Action mit
 *    `inhaltGeaendert`.
 * Lieferungen mit weicher Auffälligkeit (oder Freigabe „prüfen“) werden nicht geschrieben, sondern warten im Lauf auf die
 * Freigabe in der Verwaltung (`gebeLaufFrei`). Ein Trockenlauf (`trocken`) rechnet alles und schreibt nichts.
 */
export type AbgleichErgebnis = {
  status: AbgleichStatus | 'nicht_eingerichtet' | 'inaktiv' | 'uebersprungen';
  quelle: QuellenId | null;
  trocken: boolean;
  laufId: string | null;
  von: string | null;
  bis: string | null;
  tageGeprueft: number;
  tageNeu: number;
  tageGeaendert: number;
  konflikte: number;
  auffaellig: number;
  maxAbweichungMin: number;
  fehlerCode: string | null;
  /** Monate „JJJJ-MM“ mit geschriebenen Tagen – für die Cache-Tags */
  monate: string[];
};

/** Zustand für Mail-Hinweise: gemeldet wird nur ein Wechsel in einen Problemzustand. */
type Zustand = 'ok' | 'stoerung' | 'auffaellig' | 'abdeckung';
type LaufDetails = {
  zustand?: Zustand;
  /** nur in älteren Läufen gespeichert; der Konflikt-Hinweis vergleicht heute die Konflikte selbst (`neueKonflikte`) */
  konfliktKennung?: string;
  konflikte?: Konflikt[];
  konfliktTage?: LieferTag[];
  auffaellig?: Auffaelligkeit[];
  ausstehend?: LieferTag[];
  hart?: HarterFehler[];
};

const SPERRE = 'gebetszeiten-abgleich';
const AUFBEWAHRUNG_TAGE = 90;
const FEHLER_IN_FOLGE = 3;
const ABDECKUNG_MIN_TAGE = 14;

function tagPlus(datum: string, n: number): string {
  const [j, m, t] = datum.split('-').map(Number);
  return new Date(Date.UTC(j, m - 1, t + n)).toISOString().slice(0, 10);
}

/** Letzter Tag des Folgemonats. */
function endeFolgemonat(datum: string): string {
  const [j, m] = datum.split('-').map(Number);
  return new Date(Date.UTC(j, m + 1, 0)).toISOString().slice(0, 10);
}

export async function ladeEinstellungDirekt(): Promise<GebetszeitenEinstellung> {
  const [z] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, 'gebetszeiten'))
    .limit(1);
  const p = gebetszeitenEinstellung.safeParse(z?.wert ?? {});
  return p.success ? p.data : gebetszeitenEinstellung.parse({});
}

/** Eingerichtete Quelle: offizieller Feed vor Jahresdatei; ohne beides `null` (Abgleich tut nichts). */
export function eingerichteteQuelle(stadtId: string): GebetszeitenQuelle | null {
  const feed = feedQuelle();
  if (feed.bereit()) return feed;
  const datei = dateiQuelle({ stadtId });
  return datei.bereit() ? datei : null;
}

const leer = (o: Partial<AbgleichErgebnis>): AbgleichErgebnis => ({
  status: 'nicht_eingerichtet',
  quelle: null,
  trocken: false,
  laufId: null,
  von: null,
  bis: null,
  tageGeprueft: 0,
  tageNeu: 0,
  tageGeaendert: 0,
  konflikte: 0,
  auffaellig: 0,
  maxAbweichungMin: 0,
  fehlerCode: null,
  monate: [],
  ...o,
});

const konfliktSchluessel = (k: Konflikt) => `${k.datum}|${JSON.stringify(k.abweichungMin)}`;

/**
 * Neue Konflikte gegenüber dem letzten Lauf ohne Fehler: ein Tag mit dieser Abweichung stand dort noch nicht. Tage, die nur
 * vorne aus dem gleitenden Fenster fallen oder hinten neu hineinrücken (Tageslauf), sind kein neuer Konflikt – sonst käme der
 * Hinweis bei einem dauerhaften Import täglich (ADR 0048 Nr. 11).
 */
function neueKonflikte(konflikte: readonly Konflikt[], vorlauf: { bis: string | null; details: LaufDetails } | undefined): Konflikt[] {
  const bekannt = vorlauf?.details.konflikte ?? [];
  if (!vorlauf || !bekannt.length) return [...konflikte];
  const schluessel = new Set(bekannt.map(konfliktSchluessel));
  return konflikte.filter((k) => !schluessel.has(konfliktSchluessel(k)) && (!vorlauf.bis || k.datum <= vorlauf.bis));
}

/**
 * Eine Regel für echten Lauf und Trockenlauf: Änderungen mit Auffälligkeit (nur an neuen oder geänderten Tagen – schon
 * gespeicherte, einmal freigegebene Tage halten spätere Läufe nicht erneut an) oder mit Freigabe „prüfen“ warten auf die
 * Verwaltung.
 */
function relevanteAuffaelligkeiten(auffaellig: readonly Auffaelligkeit[], diff: { neu: LieferTag[]; geaendert: LieferTag[] }) {
  const daten = new Set([...diff.neu, ...diff.geaendert].map((d) => d.datum));
  return auffaellig.filter((f) => daten.has(f.datum));
}
const statusVon = (aenderungen: number, auffaellig: number, freigabe: string): AbgleichStatus =>
  aenderungen && (auffaellig || freigabe === 'pruefen') ? 'auffaellig' : aenderungen ? 'ok' : 'unveraendert';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Tage mit `quelle 'igmg'` schreiben – nie über einen Import der Gemeinde (Schutz auch gegen einen Import während des Laufs). */
async function schreibeTage(tx: Tx, tage: readonly LieferTag[], laufId: string | null) {
  if (!tage.length) return;
  const t = schema.gebetszeitTag;
  await tx
    .insert(t)
    .values(tage.map((d) => ({ datum: d.datum, ...nurZeiten(d), quelle: 'igmg' as const, abgleichId: laufId, importId: null })))
    .onConflictDoUpdate({
      target: t.datum,
      set: {
        ...Object.fromEntries(GEBETE.map((g) => [g, sql.raw(`excluded."${g}"`)])),
        quelle: sql`excluded."quelle"`,
        abgleichId: sql`excluded."abgleich_id"`,
        importId: null,
        aktualisiertAm: sql`now()`,
      },
      setWhere: ne(t.quelle, 'import'),
    });
}

/** Die letzten Läufe (neueste zuerst) für Zustand, Fehlerfolge und Konflikt-Kennung. */
async function letzteLaeufe(tx: Tx | typeof db, anzahl: number) {
  return tx
    .select({
      id: schema.gebetszeitAbgleich.id,
      status: schema.gebetszeitAbgleich.status,
      bis: schema.gebetszeitAbgleich.bis,
      details: schema.gebetszeitAbgleich.details,
    })
    .from(schema.gebetszeitAbgleich)
    .orderBy(desc(schema.gebetszeitAbgleich.gestartet))
    .limit(anzahl);
}

/** Tage aus Tabellen (Import oder IGMG) in den nächsten `n` Tagen. */
async function tabellenTage(tx: Tx, heute: string, n: number): Promise<number> {
  const t = schema.gebetszeitTag;
  const [z] = await tx
    .select({ anzahl: sql<number>`count(*)::int` })
    .from(t)
    .where(and(gte(t.datum, heute), lte(t.datum, tagPlus(heute, n - 1)), ne(t.quelle, 'berechnet')));
  return Number(z?.anzahl ?? 0);
}

/** Läufe nach 90 Tagen löschen; der letzte erfolgreiche bleibt. */
async function raeumeAuf(tx: Tx, jetzt: Date) {
  const a = schema.gebetszeitAbgleich;
  const [erfolg] = await tx
    .select({ id: a.id })
    .from(a)
    .where(inArray(a.status, ['ok', 'unveraendert', 'freigegeben']))
    .orderBy(desc(a.gestartet))
    .limit(1);
  const grenze = new Date(jetzt.getTime() - AUFBEWAHRUNG_TAGE * 86_400_000);
  await tx.delete(a).where(and(lt(a.gestartet, grenze), erfolg ? notInArray(a.id, [erfolg.id]) : undefined));
}

export async function gleicheAb(
  o: {
    jetzt?: Date;
    trocken?: boolean;
    /** Cron: nur, wenn der Abgleich in der Verwaltung eingeschaltet ist */
    nurWennAktiv?: boolean;
    /** Tests und Verwaltung: eingesetzte Quelle; Standard: eingerichtete Quelle */
    quelle?: GebetszeitenQuelle | null;
    signal?: AbortSignal;
  } = {},
): Promise<AbgleichErgebnis> {
  const jetzt = o.jetzt ?? new Date();
  const trocken = o.trocken === true;
  const einstellung = await ladeEinstellungDirekt();
  const { abgleich } = einstellung;
  if (o.nurWennAktiv && !abgleich.aktiv) return leer({ status: 'inaktiv', trocken });
  const quelle = o.quelle === undefined ? eingerichteteQuelle(abgleich.stadtId) : o.quelle;
  if (!quelle) return leer({ status: 'nicht_eingerichtet', trocken });

  const heute = berlinerDatum(jetzt);
  const von = tagPlus(heute, -1);
  const bisFolgemonat = endeFolgemonat(heute);
  const bisVoraus = tagPlus(heute, abgleich.tageVoraus);
  const bis = bisFolgemonat > bisVoraus ? bisFolgemonat : bisVoraus;
  const basis = { quelle: quelle.id, trocken, von, bis };

  // Abruf außerhalb der Sperre (bis zu 30 s Netz), dann Plausibilität
  let tage: LieferTag[] = [];
  let fehlerCode: string | null = null;
  let hart: HarterFehler[] = [];
  let auffaellig: Auffaelligkeit[] = [];
  let sha256: string | null = null;
  let quellStand: string | null = null;
  try {
    const lieferung = await quelle.hole({ von, bis, stadtId: abgleich.stadtId, signal: o.signal });
    sha256 = lieferung.sha256;
    quellStand = lieferung.stand;
    tage = lieferung.tage.filter((t) => t.datum >= von && t.datum <= bis);
    const ort = lieferung.ort.id
      ? { geliefert: lieferung.ort.id, erwartet: abgleich.stadtId }
      : { geliefert: lieferung.ort.name, erwartet: abgleich.stadtName };
    const bericht = pruefePlausibilitaet(tage, { einstellung, ort });
    hart = bericht.hart;
    auffaellig = bericht.auffaellig;
    if (hart.length) fehlerCode = 'plausibilitaet';
  } catch (fehler) {
    fehlerCode = fehler instanceof QuellenFehler ? fehler.code : 'unbekannt';
  }

  if (trocken) {
    if (fehlerCode) return leer({ ...basis, status: 'fehler', fehlerCode, tageGeprueft: tage.length });
    const bestand = await db
      .select()
      .from(schema.gebetszeitTag)
      .where(and(gte(schema.gebetszeitTag.datum, von), lte(schema.gebetszeitTag.datum, bis)));
    const diff = vergleiche(new Map(bestand.map((b) => [b.datum, b as BestandTag])), tage);
    const relevant = relevanteAuffaelligkeiten(auffaellig, diff);
    return leer({
      ...basis,
      status: statusVon(diff.neu.length + diff.geaendert.length, relevant.length, abgleich.freigabe),
      tageGeprueft: tage.length,
      tageNeu: diff.neu.length,
      tageGeaendert: diff.geaendert.length,
      konflikte: diff.konflikte.length,
      auffaellig: relevant.length,
      maxAbweichungMin: diff.maxAbweichungMin,
    });
  }

  const lauf = await mitSperre(SPERRE, async () =>
    db.transaction(async (tx) => {
      const vorher = await letzteLaeufe(tx, FEHLER_IN_FOLGE - 1);
      const vorherDetails = (vorher[0]?.details ?? {}) as LaufDetails;
      // Vergleich der Konflikte mit dem letzten Lauf, der Konflikte kennen konnte (ohne Fehler)
      const [vorlaufOhneFehler] = await tx
        .select({ bis: schema.gebetszeitAbgleich.bis, details: schema.gebetszeitAbgleich.details })
        .from(schema.gebetszeitAbgleich)
        .where(ne(schema.gebetszeitAbgleich.status, 'fehler'))
        .orderBy(desc(schema.gebetszeitAbgleich.gestartet))
        .limit(1);
      const vorherZustand: Zustand = vorherDetails.zustand ?? 'ok';
      const details: LaufDetails = {};
      let status: AbgleichStatus;
      let zustand: Zustand;
      let diff = { neu: [] as LieferTag[], geaendert: [] as LieferTag[], konflikte: [] as Konflikt[], maxAbweichungMin: 0 };
      let relevant: Auffaelligkeit[] = [];

      if (fehlerCode) {
        status = 'fehler';
        details.hart = hart.slice(0, 20);
        // Fehlschläge in Folge, diesen eingeschlossen (gemeldet ab dem dritten)
        const ersterOhneFehler = vorher.findIndex((v) => v.status !== 'fehler');
        const fehlerFolge = 1 + (ersterOhneFehler === -1 ? vorher.length : ersterOhneFehler);
        zustand = fehlerFolge >= FEHLER_IN_FOLGE ? 'stoerung' : vorherZustand;
      } else {
        const t = schema.gebetszeitTag;
        const bestand = await tx
          .select()
          .from(t)
          .where(and(gte(t.datum, von), lte(t.datum, bis)));
        diff = vergleiche(new Map(bestand.map((b) => [b.datum, b as BestandTag])), tage);
        const aenderungen = diff.neu.length + diff.geaendert.length;
        relevant = relevanteAuffaelligkeiten(auffaellig, diff);
        if (statusVon(aenderungen, relevant.length, abgleich.freigabe) === 'auffaellig') {
          status = 'auffaellig';
          details.auffaellig = relevant.slice(0, 60);
          details.ausstehend = [...diff.neu, ...diff.geaendert];
          zustand = 'auffaellig';
        } else {
          status = aenderungen ? 'ok' : 'unveraendert';
          zustand = 'ok';
        }
      }
      if (diff.konflikte.length) {
        details.konflikte = diff.konflikte.slice(0, 400);
        details.konfliktTage = tage.filter((d) => diff.konflikte.some((k) => k.datum === d.datum));
      }

      const [zeile] = await tx
        .insert(schema.gebetszeitAbgleich)
        .values({
          quelle: quelle.id,
          status,
          gestartet: jetzt,
          beendet: new Date(),
          von,
          bis,
          tageGeprueft: tage.length,
          tageNeu: status === 'ok' ? diff.neu.length : 0,
          tageGeaendert: status === 'ok' ? diff.geaendert.length : 0,
          konflikte: diff.konflikte.length,
          maxAbweichungMin: diff.maxAbweichungMin,
          fehlerCode,
          inhaltSha256: sha256,
          quellStand: quellStand?.slice(0, 120) ?? null,
          details,
        })
        .returning({ id: schema.gebetszeitAbgleich.id });

      const geschrieben = status === 'ok' ? [...diff.neu, ...diff.geaendert] : [];
      await schreibeTage(tx, geschrieben, zeile.id);
      if (zustand === 'ok' && abgleich.aktiv && (await tabellenTage(tx, berlinerDatum(jetzt), ABDECKUNG_MIN_TAGE)) < ABDECKUNG_MIN_TAGE)
        zustand = 'abdeckung';
      await tx
        .update(schema.gebetszeitAbgleich)
        .set({ details: { ...details, zustand } })
        .where(eq(schema.gebetszeitAbgleich.id, zeile.id));

      await protokolliere(
        {
          benutzerId: null,
          aktion: 'gebetszeiten.abgleich',
          zielTyp: 'gebetszeiten',
          zielId: zeile.id,
          details: {
            quelle: quelle.id,
            status,
            neu: geschrieben.length ? diff.neu.length : 0,
            geaendert: geschrieben.length ? diff.geaendert.length : 0,
            konflikte: diff.konflikte.length,
            maxAbweichungMin: diff.maxAbweichungMin,
            fehler: fehlerCode,
          },
        },
        tx,
      );
      if (zustand !== 'ok' && zustand !== vorherZustand) await planeGebetszeitenHinweis({ art: zustand }, tx);
      if (
        !fehlerCode &&
        neueKonflikte(
          diff.konflikte,
          vorlaufOhneFehler && { bis: vorlaufOhneFehler.bis, details: (vorlaufOhneFehler.details ?? {}) as LaufDetails },
        ).length
      )
        await planeGebetszeitenHinweis({ art: 'konflikte' }, tx);
      await raeumeAuf(tx, jetzt);
      return { laufId: zeile.id, status, diff, relevant, monate: monateVon(geschrieben) };
    }),
  );
  if (lauf.uebersprungen) return leer({ ...basis, status: 'uebersprungen' });
  const { laufId, status, diff, relevant, monate } = lauf.ergebnis;
  return leer({
    ...basis,
    status,
    laufId,
    tageGeprueft: tage.length,
    tageNeu: diff.neu.length,
    tageGeaendert: diff.geaendert.length,
    konflikte: diff.konflikte.length,
    auffaellig: fehlerCode ? auffaellig.length : relevant.length,
    maxAbweichungMin: diff.maxAbweichungMin,
    fehlerCode,
    monate,
  });
}

/**
 * Freigabe eines auffälligen Laufs in der Verwaltung: die gelieferten Tage werden gegen den heutigen Bestand neu verglichen
 * (Importe der Gemeinde bleiben unberührt) und geschrieben; der Lauf steht danach auf „freigegeben“.
 */
export async function gebeLaufFrei(laufId: string, benutzerId: string): Promise<{ tage: number; monate: string[] } | null> {
  return db.transaction(async (tx) => {
    const a = schema.gebetszeitAbgleich;
    const [lauf] = await tx
      .select()
      .from(a)
      .where(and(eq(a.id, laufId), eq(a.status, 'auffaellig')))
      .limit(1);
    const ausstehend = ((lauf?.details ?? {}) as LaufDetails).ausstehend ?? [];
    if (!lauf || !ausstehend.length) return null;
    const t = schema.gebetszeitTag;
    const daten = ausstehend.map((d) => d.datum);
    const bestand = await tx.select().from(t).where(inArray(t.datum, daten));
    const diff = vergleiche(new Map(bestand.map((b) => [b.datum, b as BestandTag])), ausstehend);
    const geschrieben = [...diff.neu, ...diff.geaendert];
    await schreibeTage(tx, geschrieben, lauf.id);
    await tx
      .update(a)
      .set({
        status: 'freigegeben',
        tageNeu: diff.neu.length,
        tageGeaendert: diff.geaendert.length,
        details: { ...(lauf.details ?? {}), zustand: 'ok' },
      })
      .where(eq(a.id, lauf.id));
    await protokolliere(
      {
        benutzerId,
        aktion: 'gebetszeiten.abgleich',
        zielTyp: 'gebetszeiten',
        zielId: lauf.id,
        details: { status: 'freigegeben', neu: diff.neu.length, geaendert: diff.geaendert.length, maxAbweichungMin: diff.maxAbweichungMin },
      },
      tx,
    );
    return { tage: geschrieben.length, monate: monateVon(geschrieben) };
  });
}

/**
 * Konflikte auflösen: Für die Tage des letzten Konflikts gelten danach die IGMG-Werte (`quelle 'igmg'`) statt des Imports.
 * Bewusste Handlung in der Verwaltung mit Audit; der andere Weg bleibt „Import entfernen“.
 */
export async function uebernimmKonflikte(benutzerId: string): Promise<{ tage: number; monate: string[] }> {
  return db.transaction(async (tx) => {
    const a = schema.gebetszeitAbgleich;
    // Wie die Anzeige (`ladeAbgleichStand`): nur der jüngste Lauf ohne Fehler zählt; ein späterer Lauf ohne Konflikte
    // (etwa nach „Import entfernen“) hat sie erledigt
    const [lauf] = await tx
      .select({ id: a.id, konflikte: a.konflikte, details: a.details })
      .from(a)
      .where(ne(a.status, 'fehler'))
      .orderBy(desc(a.gestartet))
      .limit(1);
    const tage = lauf && lauf.konflikte > 0 ? (((lauf.details ?? {}) as LaufDetails).konfliktTage ?? []) : [];
    if (!lauf || !tage.length) return { tage: 0, monate: [] };
    const t = schema.gebetszeitTag;
    await tx
      .insert(t)
      .values(tage.map((d) => ({ datum: d.datum, ...nurZeiten(d), quelle: 'igmg' as const, abgleichId: lauf.id, importId: null })))
      .onConflictDoUpdate({
        target: t.datum,
        set: {
          ...Object.fromEntries(GEBETE.map((g) => [g, sql.raw(`excluded."${g}"`)])),
          quelle: sql`excluded."quelle"`,
          abgleichId: sql`excluded."abgleich_id"`,
          importId: null,
          aktualisiertAm: sql`now()`,
        },
      });
    await tx.update(a).set({ konflikte: 0 }).where(gt(a.konflikte, 0));
    await protokolliere(
      { benutzerId, aktion: 'gebetszeiten.konflikt_uebernommen', zielTyp: 'gebetszeiten', zielId: lauf.id, details: { tage: tage.length } },
      tx,
    );
    return { tage: tage.length, monate: monateVon(tage) };
  });
}
