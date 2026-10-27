import 'server-only';
import { and, eq, inArray, like, notInArray, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import type { Datenbank, Transaktion } from '@/lib/db';
import { schema } from '@/lib/db';
import type { Status } from '../freigabe';
import { EIGENE_STUFEN } from '../kurse';
import { inhaltHash, sha256Hex } from '../paket/hash';
import {
  type Entscheidung,
  entscheide,
  type ImportBericht,
  ImportFehler,
  type ImportQuelle,
  type Konflikt,
  statusBeiGleich,
  verfasstVon,
  vorherSpalten,
} from './import';
import { ISLAM_WERKE, type IslamEinheitDatei, type IslamWerk, pruefeWeitereDatei } from './schema';
import { fuehreEntfernte } from './stand';
import { WISSENS_QUELLEN } from './wissen-quellen';

/**
 * Import des Wissenskurses (`web/inhalte/lernapp/islam/<bereich>/<einheit>.json`, ADR 0040 Nr. 2/4/5, PLAN §6.7) in die
 * Tabellen, die der Paketbau liest (`server/queries/lernapp/wissen.ts`, Vertrag dort und in `wissen-vertrag.test.ts`):
 *
 * - Kurs `islam` (Art `wissen`, Inhalt Deutsch, aktiv), Abschnitt je Stufe (Reihenfolge wie `EIGENE_STUFEN`), Einheit (Thema,
 *   „Ich kann …“, Symbol), Lektion (`ziel.de` = Titel, „für Kinder geeignet“), Aussage (Text, Meinung, „strittig“, „für Kinder
 *   geeignet“, Herkunft), Beleg (`stelle.kitab` = Kapitel, Band, Seite, Passage, Zitatbereich, Art; Werk über
 *   `lernapp_quelle`), Quizfrage (`daten` = die Quizfrage der Datei ohne `schluessel`, `typ`, `aussage`, `quelle`, `lizenz`;
 *   `aussageId` = die Aussage mit dem Schlüssel `aussage` in derselben Einheit).
 * - Quellen: eine Zeile je Werk (`kurz` = Registerschlüssel) mit Werk, Verfasser, Todesjahr und Version-URI aus
 *   `wissen-quellen.ts` (aus `daten/hanafi-quellen/QUELLE.md`) und der Ausgabe der Belege (je Werk einheitlich, sonst Abbruch).
 * - Idempotent wie der Sprach-Import (`import.ts`): SHA-256 je Datei (Stand in der Einstellung `lernapp_wissen_import`),
 *   `inhaltHash` je Baustein. Neu → angelegt mit dem Status der Datei (`entwurf`), ohne Prüfungen. Gleich → Status bleibt.
 *   Geändert → Felder, Hash und Status der Datei; Freigaben gelten nur ihrem Hash und zählen damit nicht mehr (KERN 4.0 §2.3).
 *   Menschlich geprüft → nie überschrieben, sondern als Konflikt vermerkt (Bericht und Stand).
 * - Belege haben keinen Schlüssel: je Aussage nach Hash abgeglichen – gleiche bleiben (ihre Bestätigung „am Original geprüft“
 *   gilt weiter), neue kommen dazu, fehlende entfallen.
 * - Entfernt: Lektionen, Aussagen und Quizfragen, die in der Datei ihrer Einheit fehlen, und alles einer Einheit, deren Datei
 *   fehlt → `gesperrt` (nie sichtbar; zurück nur mit neuem Hash). Nur Einheiten aus Dateien bzw. aus dem Stand – andere
 *   Einheiten des Kurses (z. B. die Testeinheit `islam.grund.test`) bleiben unberührt.
 * - Verfasser (`verfasstVon`): der KI-Lauf aus `quelle`; Einheit und Lektion tragen den Lauf der ersten Aussage der Datei.
 *   Jede Änderung erhöht die Version des Kurses.
 * - Verweise auf Koran und Hadith (`verweise`) werden nicht übernommen: Dafür gibt es noch keine Spalte und keine Anzeige.
 *
 * Eine Transaktion; Schema-, Pfad- und Schlüsselfehler brechen alles ab (`ImportFehler`). Läuft im Bau nach dem
 * Sprach-Import (`scripts/lernapp/import.ts`).
 */

export type WissenImportBericht = ImportBericht & { belegeEntfernt: number };

type DateiStand = { sha: string; art: 'wissen'; einheit: string };
type WissenStand = { dateien: Record<string, DateiStand>; konflikte: Konflikt[]; am: string; entfernt?: string[] };

/** Zeilen je Einfügeanweisung (deutlich unter der Parametergrenze des PostgreSQL-Protokolls). */
const JE_ANWEISUNG = 500;

type Gelesen = { pfad: string; sha: string; d: IslamEinheitDatei };

/** Dateien lesen und prüfen (Schema, Ablageort, keine arabische Schrift); Schlüssel und Ausgabe je Werk über alle Dateien. */
export function leseWissensDateien(quellen: readonly ImportQuelle[]): Gelesen[] {
  const fehler: string[] = [];
  const ergebnis: Gelesen[] = [];
  for (const q of quellen) {
    let roh: unknown;
    try {
      roh = JSON.parse(q.text);
    } catch {
      fehler.push(`${q.pfad}: kein JSON`);
      continue;
    }
    const p = pruefeWeitereDatei(q.pfad, roh);
    if (!p.ok) fehler.push(...p.fehler.map((f) => `${q.pfad}: ${f}`));
    else if (p.datei.art !== 'islam') fehler.push(`${q.pfad}: keine Datei des Wissenskurses`);
    else ergebnis.push({ pfad: q.pfad, sha: sha256Hex(q.text), d: p.datei.daten });
  }
  const gesehen = new Map<string, string>();
  const ausgabe = new Map<string, string>();
  for (const { pfad, d } of ergebnis) {
    const schluessel = [
      d.einheit.schluessel,
      ...d.lektionen.flatMap((l) => [l.schluessel, ...l.aussagen.map((a) => a.schluessel), ...l.aufgaben.map((a) => a.schluessel)]),
    ];
    for (const k of schluessel) {
      const vorher = gesehen.get(k);
      if (vorher && vorher !== pfad) fehler.push(`${pfad}: Schlüssel ${k} auch in ${vorher}`);
      gesehen.set(k, pfad);
    }
    // eine Zeile `lernapp_quelle` je Werk: Die Zitierform muss in allen Belegen gleich sein
    for (const b of d.lektionen.flatMap((l) => l.aussagen.flatMap((a) => a.belege))) {
      const bisher = ausgabe.get(b.werk);
      if (bisher === undefined) ausgabe.set(b.werk, b.ausgabe);
      else if (bisher !== b.ausgabe) fehler.push(`${pfad}: Ausgabe von ${b.werk} weicht ab („${b.ausgabe}“ statt „${bisher}“)`);
    }
  }
  if (fehler.length) throw new ImportFehler([...new Set(fehler)]);
  return ergebnis;
}

class Lauf {
  bericht: WissenImportBericht = {
    dateien: 0,
    uebersprungen: 0,
    neu: 0,
    geaendert: 0,
    unveraendert: 0,
    gesperrt: 0,
    konflikte: [],
    kurse: [],
    belegeEntfernt: 0,
  };
  geaendert = false;

  constructor(readonly tx: Transaktion) {}

  zaehle(e: Entscheidung, anzahl = 1) {
    if (e === 'neu') this.bericht.neu += anzahl;
    else if (e === 'aendern') this.bericht.geaendert += anzahl;
    else if (e === 'gleich') this.bericht.unveraendert += anzahl;
    if (e === 'neu' || e === 'aendern') this.geaendert = true;
  }

  gesperrt(anzahl: number) {
    this.bericht.gesperrt += anzahl;
    if (anzahl) this.geaendert = true;
  }

  konflikt(k: Konflikt) {
    this.bericht.konflikte.push(k);
  }
}

type Sperrbar = typeof schema.lernappEinheit | typeof schema.lernappLektion | typeof schema.lernappAussage | typeof schema.lernappAufgabe;

/** Bausteine einer Tabelle unter dem Schlüssel `praefix.…` (bzw. `praefix` selbst), die nicht in `behalten` stehen, sperren. */
async function sperreFehlende(l: Lauf, tabelle: Sperrbar, bedingung: ReturnType<typeof eq>, behalten: readonly string[]) {
  const t = tabelle as typeof schema.lernappAussage;
  const bedingungen = [bedingung, sql`${t.status} <> 'gesperrt'`, eq(t.menschlichGeprueft, false)];
  if (behalten.length) bedingungen.push(notInArray(t.schluessel, [...behalten]));
  const r = await l.tx
    .update(t)
    .set({ status: 'gesperrt' })
    .where(and(...bedingungen))
    .returning({ id: t.id });
  l.gesperrt(r.length);
}

/** Zeilen in Blöcken einfügen; Kennungen in der Reihenfolge der Zeilen. */
async function fuegeEin<T extends Sperrbar | typeof schema.lernappBeleg>(
  tx: Transaktion,
  tabelle: T,
  zeilen: readonly T['$inferInsert'][],
): Promise<string[]> {
  const ids: string[] = [];
  for (let i = 0; i < zeilen.length; i += JE_ANWEISUNG) {
    const t = tabelle as typeof schema.lernappBeleg;
    const r = await tx
      .insert(t)
      .values(zeilen.slice(i, i + JE_ANWEISUNG) as (typeof schema.lernappBeleg.$inferInsert)[])
      .returning({ id: t.id });
    ids.push(...r.map((x) => x.id));
  }
  return ids;
}

/** Hash eines Belegs: Fundstelle wie angezeigt (Passage, Kapitel, Band, Seite, Ausgabe) samt Zitatbereich und Art. */
function belegWerte(b: IslamEinheitDatei['lektionen'][number]['aussagen'][number]['belege'][number]) {
  const stelle = {
    kitab: b.kapitel,
    ...(b.band !== undefined ? { band: String(b.band) } : {}),
    ...(b.seite !== undefined ? { seite: String(b.seite) } : {}),
  };
  const werte = { passage: b.passage, stelle, zitatVon: b.zitatVon ?? null, zitatBis: b.zitatBis ?? null, art: b.art };
  return { werte, hash: inhaltHash({ ...werte, ausgabe: b.ausgabe }) };
}

async function importiereEinheit(l: Lauf, g: Gelesen, abschnitte: ReadonlyMap<string, string>, quellen: ReadonlyMap<string, string>) {
  const { tx } = l;
  const { d, pfad } = g;
  const status: Status = d.status;
  const E = d.einheit;
  const unter = (spalte: AnyPgColumn) => like(spalte, `${E.schluessel}.%`);
  // Einheit und Lektion: der KI-Lauf der ersten Aussage der Datei
  const lauf = verfasstVon(d.lektionen[0]?.aussagen[0]?.quelle);
  const konflikt = (tabelle: string, schluessel: string, hashDatenbank: string, hashDatei: string) =>
    l.konflikt({ tabelle, schluessel, datei: pfad, hashDatenbank, hashDatei });

  // Einheit
  const einheitWerte = {
    abschnittId: abschnitte.get(d.stufe)!,
    reihenfolge: E.reihenfolge,
    thema: E.thema,
    kannBeschreibungen: E.kannBeschreibungen ?? [],
    symbol: E.symbol ?? null,
  };
  const einheitHash = inhaltHash({
    schluessel: E.schluessel,
    thema: E.thema,
    kannBeschreibungen: einheitWerte.kannBeschreibungen,
    symbol: einheitWerte.symbol,
  });
  const [ev] = await tx
    .select({ ...vorherSpalten(schema.lernappEinheit) })
    .from(schema.lernappEinheit)
    .where(eq(schema.lernappEinheit.schluessel, E.schluessel));
  const ee = entscheide(ev, einheitHash);
  l.zaehle(ee);
  let einheitId: string;
  if (!ev)
    einheitId = (
      await fuegeEin(tx, schema.lernappEinheit, [
        { schluessel: E.schluessel, ...einheitWerte, inhaltHash: einheitHash, status, verfasstVon: lauf },
      ])
    )[0]!;
  else {
    einheitId = ev.id;
    if (ee === 'konflikt') konflikt('lernapp_einheit', E.schluessel, ev.inhaltHash, einheitHash);
    const neuStatus = ee === 'gleich' ? statusBeiGleich(ev.status, status) : null;
    await tx
      .update(schema.lernappEinheit)
      .set(
        ee === 'aendern'
          ? { ...einheitWerte, inhaltHash: einheitHash, status, verfasstVon: lauf }
          : // Reihenfolge und Abschnitt sind Ordnung, nicht Inhalt (ohne Einfluss auf Hash und Prüfungen)
            { abschnittId: einheitWerte.abschnittId, reihenfolge: E.reihenfolge, ...(neuStatus ? { status: neuStatus } : {}) },
      )
      .where(eq(schema.lernappEinheit.id, ev.id));
  }

  // Vorher: alles unter dem Schlüssel der Einheit
  const nachSchluessel = <T extends { schluessel: string }>(zeilen: T[]) => new Map(zeilen.map((z) => [z.schluessel, z]));
  const [lektionVorher, aussageVorher, aufgabeVorher] = await Promise.all([
    tx
      .select({ schluessel: schema.lernappLektion.schluessel, ...vorherSpalten(schema.lernappLektion) })
      .from(schema.lernappLektion)
      .where(unter(schema.lernappLektion.schluessel))
      .then(nachSchluessel),
    tx
      .select({ schluessel: schema.lernappAussage.schluessel, ...vorherSpalten(schema.lernappAussage) })
      .from(schema.lernappAussage)
      .where(unter(schema.lernappAussage.schluessel))
      .then(nachSchluessel),
    tx
      .select({ schluessel: schema.lernappAufgabe.schluessel, ...vorherSpalten(schema.lernappAufgabe) })
      .from(schema.lernappAufgabe)
      .where(unter(schema.lernappAufgabe.schluessel))
      .then(nachSchluessel),
  ]);
  const vorhandeneAussagen = [...aussageVorher.values()].map((a) => a.id);
  const belegVorher = vorhandeneAussagen.length
    ? await tx
        .select({
          id: schema.lernappBeleg.id,
          aussageId: schema.lernappBeleg.aussageId,
          inhaltHash: schema.lernappBeleg.inhaltHash,
          menschlichGeprueft: schema.lernappBeleg.menschlichGeprueft,
          passage: schema.lernappBeleg.passage,
        })
        .from(schema.lernappBeleg)
        .where(inArray(schema.lernappBeleg.aussageId, vorhandeneAussagen))
    : [];

  // Lektionen (einzeln: ihre Kennung braucht jede Aussage und Quizfrage)
  const lektionId = new Map<string, string>();
  for (const [i, lk] of d.lektionen.entries()) {
    const ziel = { de: lk.titel };
    const werte = { einheitId, art: 'lektion' as const, reihenfolge: i + 1, ziel, kinderGeeignet: lk.kinderGeeignet };
    const hash = inhaltHash({ schluessel: lk.schluessel, ziel, kinderGeeignet: lk.kinderGeeignet });
    const v = lektionVorher.get(lk.schluessel);
    const e = entscheide(v, hash);
    l.zaehle(e);
    if (!v) {
      const [id] = await fuegeEin(tx, schema.lernappLektion, [
        { schluessel: lk.schluessel, ...werte, inhaltHash: hash, status, verfasstVon: lauf },
      ]);
      lektionId.set(lk.schluessel, id!);
      continue;
    }
    lektionId.set(lk.schluessel, v.id);
    if (e === 'konflikt') konflikt('lernapp_lektion', lk.schluessel, v.inhaltHash, hash);
    const neuStatus = e === 'gleich' ? statusBeiGleich(v.status, status) : null;
    await tx
      .update(schema.lernappLektion)
      .set(
        e === 'aendern'
          ? { ...werte, inhaltHash: hash, status, verfasstVon: lauf }
          : { einheitId, reihenfolge: i + 1, ...(neuStatus ? { status: neuStatus } : {}) },
      )
      .where(eq(schema.lernappLektion.id, v.id));
  }

  // Aussagen: neue in Blöcken, geänderte einzeln
  const aussageId = new Map<string, string>();
  /** Aussagen, deren Belege abgeglichen werden (nicht bei einem Konflikt: dann bleibt der menschlich geprüfte Stand) */
  const mitBelegen: { schluessel: string; belege: IslamEinheitDatei['lektionen'][number]['aussagen'][number]['belege']; quelle: string }[] =
    [];
  const neueAussagen: (typeof schema.lernappAussage.$inferInsert)[] = [];
  for (const lk of d.lektionen)
    for (const [j, a] of lk.aussagen.entries()) {
      const inhalt = { text: a.text, meinung: a.meinung ?? null, strittig: a.strittig, kinderGeeignet: a.kinderGeeignet };
      const hash = inhaltHash({ schluessel: a.schluessel, ...inhalt });
      const werte = { lektionId: lektionId.get(lk.schluessel)!, reihenfolge: j + 1, ...inhalt, quelle: a.quelle };
      const v = aussageVorher.get(a.schluessel);
      const e = entscheide(v, hash);
      l.zaehle(e);
      if (e !== 'konflikt') mitBelegen.push({ schluessel: a.schluessel, belege: a.belege, quelle: a.quelle });
      if (!v) {
        neueAussagen.push({ schluessel: a.schluessel, ...werte, inhaltHash: hash, status, verfasstVon: verfasstVon(a.quelle) });
        continue;
      }
      aussageId.set(a.schluessel, v.id);
      if (e === 'konflikt') konflikt('lernapp_aussage', a.schluessel, v.inhaltHash, hash);
      const neuStatus = e === 'gleich' ? statusBeiGleich(v.status, status) : null;
      await tx
        .update(schema.lernappAussage)
        .set(
          e === 'aendern'
            ? { ...werte, inhaltHash: hash, status, verfasstVon: verfasstVon(a.quelle) }
            : { lektionId: werte.lektionId, reihenfolge: j + 1, ...(neuStatus ? { status: neuStatus } : {}) },
        )
        .where(eq(schema.lernappAussage.id, v.id));
    }
  const neueIds = await fuegeEin(tx, schema.lernappAussage, neueAussagen);
  neueAussagen.forEach((a, i) => aussageId.set(a.schluessel, neueIds[i]!));

  // Belege je Aussage nach Hash abgleichen
  const belegeJe = new Map<string, typeof belegVorher>();
  for (const b of belegVorher) if (b.aussageId) belegeJe.set(b.aussageId, [...(belegeJe.get(b.aussageId) ?? []), b]);
  const neueBelege: (typeof schema.lernappBeleg.$inferInsert)[] = [];
  const entfallen: string[] = [];
  for (const a of mitBelegen) {
    const id = aussageId.get(a.schluessel)!;
    const offen = [...(belegeJe.get(id) ?? [])];
    for (const b of a.belege) {
      const { werte, hash } = belegWerte(b);
      const i = offen.findIndex((x) => x.inhaltHash === hash);
      if (i >= 0) {
        offen.splice(i, 1);
        l.zaehle('gleich');
        continue;
      }
      l.zaehle('neu');
      neueBelege.push({
        aussageId: id,
        quelleId: quellen.get(b.werk)!,
        ...werte,
        inhaltHash: hash,
        status,
        verfasstVon: verfasstVon(a.quelle),
      });
    }
    for (const x of offen)
      if (x.menschlichGeprueft) konflikt('lernapp_beleg', `${a.schluessel}#${x.passage}`, x.inhaltHash, '');
      else entfallen.push(x.id);
  }
  await fuegeEin(tx, schema.lernappBeleg, neueBelege);
  if (entfallen.length) {
    await tx.delete(schema.lernappBeleg).where(inArray(schema.lernappBeleg.id, entfallen));
    l.bericht.belegeEntfernt += entfallen.length;
    l.geaendert = true;
  }

  // Quizfragen
  const neueAufgaben: (typeof schema.lernappAufgabe.$inferInsert)[] = [];
  for (const lk of d.lektionen)
    for (const [j, q] of lk.aufgaben.entries()) {
      const { schluessel, typ, aussage, quelle, lizenz: _lizenz, ...daten } = q;
      const hash = inhaltHash({ schluessel, typ, aussage, daten });
      const werte = {
        lektionId: lektionId.get(lk.schluessel)!,
        typ,
        daten,
        reihenfolge: j + 1,
        aussageId: aussageId.get(aussage) ?? null,
        quelle,
      };
      const v = aufgabeVorher.get(schluessel);
      const e = entscheide(v, hash);
      l.zaehle(e);
      if (!v) {
        neueAufgaben.push({ schluessel, ...werte, inhaltHash: hash, status, verfasstVon: verfasstVon(quelle) });
        continue;
      }
      if (e === 'konflikt') konflikt('lernapp_aufgabe', schluessel, v.inhaltHash, hash);
      const neuStatus = e === 'gleich' ? statusBeiGleich(v.status, status) : null;
      await tx
        .update(schema.lernappAufgabe)
        .set(
          e === 'aendern'
            ? { ...werte, inhaltHash: hash, status, verfasstVon: verfasstVon(quelle) }
            : { lektionId: werte.lektionId, reihenfolge: j + 1, ...(neuStatus ? { status: neuStatus } : {}) },
        )
        .where(eq(schema.lernappAufgabe.id, v.id));
    }
  await fuegeEin(tx, schema.lernappAufgabe, neueAufgaben);

  // In der Datei fehlende Bausteine der Einheit sperren
  const quiz = d.lektionen.flatMap((x) => x.aufgaben.map((a) => a.schluessel));
  await sperreFehlende(l, schema.lernappAufgabe, unter(schema.lernappAufgabe.schluessel), quiz);
  await sperreFehlende(l, schema.lernappAussage, unter(schema.lernappAussage.schluessel), [...aussageId.keys()]);
  await sperreFehlende(l, schema.lernappLektion, unter(schema.lernappLektion.schluessel), [...lektionId.keys()]);
}

/** Alles einer Einheit, deren Datei fehlt, sperren (außer menschlich geprüften Bausteinen). */
async function sperreEinheit(l: Lauf, einheit: string) {
  const unter = (spalte: AnyPgColumn) => like(spalte, `${einheit}.%`);
  await sperreFehlende(l, schema.lernappAufgabe, unter(schema.lernappAufgabe.schluessel), []);
  await sperreFehlende(l, schema.lernappAussage, unter(schema.lernappAussage.schluessel), []);
  await sperreFehlende(l, schema.lernappLektion, unter(schema.lernappLektion.schluessel), []);
  await sperreFehlende(l, schema.lernappEinheit, eq(schema.lernappEinheit.schluessel, einheit), []);
}

/** Quizfragen einer Einheit, die nicht in der Datei stehen (Stand `entfernt`: „Wieder freigeben“ bietet sie nicht an). */
async function entfernteQuizfragen(tx: Transaktion, einheit: string, inDatei: ReadonlySet<string>): Promise<string[]> {
  const t = schema.lernappAufgabe;
  const zeilen = await tx
    .select({ s: t.schluessel })
    .from(t)
    .where(and(like(t.schluessel, `${einheit}.%`), eq(t.menschlichGeprueft, false)));
  return zeilen.map((z) => z.s).filter((s) => !inDatei.has(s));
}

/** Kurs, Abschnitte und Quellen anlegen bzw. nachführen; Kennungen der Abschnitte je Stufe und der Quellen je Werk. */
async function sichereKurs(tx: Transaktion, dateien: readonly Gelesen[]) {
  await tx
    .insert(schema.lernappKurs)
    .values({ id: 'islam', art: 'wissen', zielsprache: 'de', aktiv: true })
    .onConflictDoUpdate({ target: schema.lernappKurs.id, set: { aktiv: true } });
  const abschnitte = new Map<string, string>();
  for (const stufe of new Set(dateien.map((g) => g.d.stufe))) {
    await tx
      .insert(schema.lernappAbschnitt)
      .values({ kursId: 'islam', stufe, reihenfolge: EIGENE_STUFEN.indexOf(stufe) + 1 })
      .onConflictDoNothing();
    const [a] = await tx
      .select({ id: schema.lernappAbschnitt.id })
      .from(schema.lernappAbschnitt)
      .where(and(eq(schema.lernappAbschnitt.kursId, 'islam'), eq(schema.lernappAbschnitt.stufe, stufe)));
    abschnitte.set(stufe, a!.id);
  }
  const ausgaben = new Map<IslamWerk, string>();
  for (const b of dateien.flatMap((g) => g.d.lektionen.flatMap((l) => l.aussagen.flatMap((a) => a.belege))))
    if (!ausgaben.has(b.werk)) ausgaben.set(b.werk, b.ausgabe);
  const quellen = new Map<string, string>();
  for (const [werk, ausgabe] of ausgaben) {
    const r = WISSENS_QUELLEN[werk];
    const werte = {
      werk: r.werk,
      autor: r.autor,
      todesjahr: r.todesjahr,
      ausgabe,
      art: ISLAM_WERKE[werk].art,
      openitiUri: r.openitiUri,
    };
    const [q] = await tx
      .insert(schema.lernappQuelle)
      .values({ kurz: werk, ...werte })
      .onConflictDoUpdate({ target: schema.lernappQuelle.kurz, set: werte })
      .returning({ id: schema.lernappQuelle.id });
    quellen.set(werk, q!.id);
  }
  return { abschnitte, quellen };
}

/**
 * Wissenskurs importieren. `standSchluessel` trennt Quellen (Tests nutzen eigene); entfernte Dateien erkennt der Import nur
 * innerhalb derselben Quelle.
 */
export async function importiereWissen(
  db: Datenbank,
  quellen: readonly ImportQuelle[],
  {
    erzwingen = false,
    standSchluessel = 'lernapp_wissen_import',
    jetzt = new Date(),
  }: { erzwingen?: boolean; standSchluessel?: string; jetzt?: Date } = {},
): Promise<WissenImportBericht> {
  const dateien = leseWissensDateien(quellen);
  return db.transaction(async (tx) => {
    const [z] = await tx.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, standSchluessel));
    const alt = (z?.wert as WissenStand | undefined) ?? { dateien: {}, konflikte: [], am: '' };
    const l = new Lauf(tx);
    l.bericht.dateien = dateien.length;
    const offen = dateien.filter((g) => erzwingen || alt.dateien[g.pfad]?.sha !== g.sha);
    l.bericht.uebersprungen = dateien.length - offen.length;

    if (offen.length) {
      const { abschnitte, quellen: quelleIds } = await sichereKurs(tx, offen);
      for (const g of offen) await importiereEinheit(l, g, abschnitte, quelleIds);
    }

    const neuStand: WissenStand = { dateien: {}, konflikte: l.bericht.konflikte, am: jetzt.toISOString() };
    for (const g of dateien) neuStand.dateien[g.pfad] = { sha: g.sha, art: 'wissen', einheit: g.d.einheit.schluessel };
    const mitDatei = new Set(dateien.map((g) => g.d.einheit.schluessel));
    const entfernteEinheiten = [
      ...new Set(
        Object.entries(alt.dateien)
          .filter(([pfad, s]) => !neuStand.dateien[pfad] && !mitDatei.has(s.einheit))
          .map(([, s]) => s.einheit),
      ),
    ];
    for (const e of entfernteEinheiten) await sperreEinheit(l, e);

    const neuEntfernt = new Map<string, string[]>();
    for (const g of offen)
      neuEntfernt.set(
        g.d.einheit.schluessel,
        await entfernteQuizfragen(tx, g.d.einheit.schluessel, new Set(g.d.lektionen.flatMap((x) => x.aufgaben.map((a) => a.schluessel)))),
      );
    for (const e of entfernteEinheiten) neuEntfernt.set(e, await entfernteQuizfragen(tx, e, new Set()));
    neuStand.entfernt = fuehreEntfernte(alt.entfernt ?? [], neuEntfernt);
    if (!erzwingen && !offen.length) neuStand.konflikte = alt.konflikte;

    if (l.geaendert) {
      await tx
        .update(schema.lernappKurs)
        .set({ version: sql`${schema.lernappKurs.version} + 1` })
        .where(eq(schema.lernappKurs.id, 'islam'));
      l.bericht.kurse = ['islam'];
    }
    await tx
      .insert(schema.einstellung)
      .values({ schluessel: standSchluessel, wert: neuStand })
      .onConflictDoUpdate({ target: schema.einstellung.schluessel, set: { wert: neuStand, geaendertAm: jetzt } });
    return l.bericht;
  });
}
