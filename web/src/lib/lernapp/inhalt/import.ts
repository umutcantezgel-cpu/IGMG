import 'server-only';
import { and, eq, inArray, like, notInArray, or, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import type { Datenbank, Transaktion } from '@/lib/db';
import { schema } from '@/lib/db';
import { zerlege } from '../abgleich/tokens';
import type { Status } from '../freigabe';
import { type KursId, RICHTUNGEN, SPRACH_STUFEN, type Sprache, zerlegeRichtung } from '../kurse';
import { inhaltHash, sha256Hex } from '../paket/hash';
import { ladeWaechter, pruefeReligion } from './religion';
import { symbolFehler } from '../symbole';
import { pruefeInhaltDatei, type InhaltDatei, type SprachEinheitDatei, type UebersetzungDatei, verweiseVon } from './schema';
import { pruefeTatoebaAusschluss } from './tatoeba';
import { type DateiStand, fuehreEntfernte, type ImportStand as Stand, type Konflikt } from './stand';

/**
 * Import der Lern-App-Inhalte (PLAN §6.6, ADR 0041 Nr. 6/7): idempotent über den SHA-256 je Datei und den `inhaltHash` je
 * Eintrag.
 *
 * - **unverändert** (gleicher Hash): Status bleibt. Ausnahme: `entwurf` wird zu `automatisch_geprueft`, wenn die Datei das
 *   meldet (Prüfer und Gegenprüfung inzwischen grün). Nie zurück von `veroeffentlicht`.
 * - **geändert** (neuer Hash): Felder, Hash und Status der Datei. Prüfungen und Freigaben gelten nur ihrem Hash und zählen
 *   damit nicht mehr (KERN 4.0 §2.3) – die Änderung setzt sie zurück.
 * - **menschlich geprüft** (`menschlichGeprueft`): eingefroren. Ein abweichender KI-Stand überschreibt nicht, sondern wird als
 *   Konflikt vermerkt (Ergebnis und Einstellung `<stand>.konflikte`), bis die Redaktion entscheidet (ADR 0041 Nr. 6).
 * - **entfernt** (Eintrag fehlt in seiner Datei, oder die Datei fehlt): Status `gesperrt` – das Enum hat kein
 *   „archiviert“; gesperrt heißt nie sichtbar. Ein gesperrter Eintrag wird nur durch einen neuen Hash wieder freigegeben.
 *   Aufgaben, Lemmata und Sätze, die in ihrer Datei fehlen, führt der Stand unter `entfernt` (`stand.ts`), auch wenn sie
 *   schon vorher gesperrt waren; „Wieder freigeben“ in der Verwaltung bietet sie nicht an (L3-06b).
 * - Jede Änderung erhöht `lernapp_kurs.version` des Kurses. Caches verfallen beim Start (`TAG.lernapp` in `START_TAGS`)
 *   bzw. durch den Bau, der den Import vor `next build` ausführt.
 *
 * Läuft in einer Transaktion; Verweise auf unbekannte Lemmata oder Sätze brechen alles ab. Vorher prüft der
 * Religionswächter alle Dateien (`religion.ts`: Formel-Lexikon mit Kennzeichen, Koran- und Hadith-4-Gramme) – ein Befund
 * bricht den Import ab, auch im Vercel-Bau (S-L1 M-3). Eine Übersetzung übernimmt `religionsbezug` ihres Zieleintrags.
 * Ebenso bricht ab, wer einen der Tatoeba-Sätze mit Koran- oder Hadith-4-Gramm übernimmt (`tatoeba.ts`, L3-02).
 */

export type ImportQuelle = { pfad: string; text: string };

export type { Konflikt } from './stand';

export type ImportBericht = {
  dateien: number;
  uebersprungen: number;
  neu: number;
  geaendert: number;
  unveraendert: number;
  gesperrt: number;
  konflikte: Konflikt[];
  kurse: KursId[];
};

export class ImportFehler extends Error {
  constructor(readonly fehler: string[]) {
    super(`Import abgebrochen:\n${fehler.join('\n')}`);
  }
}

export type Vorher = { id: string; inhaltHash: string; status: Status; menschlichGeprueft: boolean };
export type Entscheidung = 'neu' | 'gleich' | 'aendern' | 'konflikt';

/** Entscheidung je Baustein (auch der Wissens-Import, `wissen-import.ts`). */
export function entscheide(v: Vorher | undefined, hash: string): Entscheidung {
  if (!v) return 'neu';
  if (v.inhaltHash === hash) return 'gleich';
  return v.menschlichGeprueft ? 'konflikt' : 'aendern';
}

/** Status bei gleichem Hash: nur `entwurf` → `automatisch_geprueft`, wenn die Datei es meldet. */
export function statusBeiGleich(alt: Status, datei: Status): Status | null {
  return alt === 'entwurf' && datei === 'automatisch_geprueft' ? datei : null;
}

export const verfasstVon = (quelle: string | undefined) =>
  quelle && (quelle.startsWith('ki:') || quelle.startsWith('test:')) ? quelle : null;

class Lauf {
  bericht: ImportBericht = { dateien: 0, uebersprungen: 0, neu: 0, geaendert: 0, unveraendert: 0, gesperrt: 0, konflikte: [], kurse: [] };
  private readonly geaenderteKurse = new Set<KursId>();

  constructor(readonly tx: Transaktion) {}

  zaehle(e: Entscheidung, kurs: KursId) {
    if (e === 'neu') this.bericht.neu++;
    else if (e === 'aendern') this.bericht.geaendert++;
    else if (e === 'gleich') this.bericht.unveraendert++;
    if (e === 'neu' || e === 'aendern') this.geaenderteKurse.add(kurs);
  }

  gesperrt(anzahl: number, kurs: KursId) {
    this.bericht.gesperrt += anzahl;
    if (anzahl) this.geaenderteKurse.add(kurs);
  }

  konflikt(k: Konflikt) {
    this.bericht.konflikte.push(k);
  }

  kurseFertig(): KursId[] {
    return [...this.geaenderteKurse].sort();
  }
}

/** Kurs, Richtungen und Abschnitt anlegen, falls sie fehlen (vorhandene bleiben, auch `aktiv`). */
async function sichereKurs(tx: Transaktion, kurs: Sprache, stufe: (typeof SPRACH_STUFEN)[number]): Promise<string> {
  await tx.insert(schema.lernappKurs).values({ id: kurs, art: 'sprache', zielsprache: kurs, aktiv: true }).onConflictDoNothing();
  const richtungen = RICHTUNGEN.filter((r) => zerlegeRichtung(r).ziel === kurs).map((r) => ({
    id: r,
    kursId: kurs,
    ausgangssprache: zerlegeRichtung(r).ausgang,
    aktiv: true,
  }));
  await tx.insert(schema.lernappRichtung).values(richtungen).onConflictDoNothing();
  const reihenfolge = SPRACH_STUFEN.indexOf(stufe) + 1;
  await tx.insert(schema.lernappAbschnitt).values({ kursId: kurs, stufe, reihenfolge }).onConflictDoNothing();
  const [a] = await tx
    .select({ id: schema.lernappAbschnitt.id })
    .from(schema.lernappAbschnitt)
    .where(and(eq(schema.lernappAbschnitt.kursId, kurs), eq(schema.lernappAbschnitt.stufe, stufe)));
  return a!.id;
}

type VorherSpalten = 'id' | 'inhaltHash' | 'status' | 'menschlichGeprueft';
export const vorherSpalten = <T extends Record<VorherSpalten, AnyPgColumn>>(t: T): Pick<T, VorherSpalten> => ({
  id: t.id,
  inhaltHash: t.inhaltHash,
  status: t.status,
  menschlichGeprueft: t.menschlichGeprueft,
});

async function importiereSprache(l: Lauf, d: SprachEinheitDatei, pfad: string): Promise<void> {
  const { tx } = l;
  const kurs = d.kurs;
  const status: Status = d.status;
  const abschnittId = await sichereKurs(tx, kurs, d.stufe);
  const E = d.einheit;

  // Einheit
  const einheitHash = inhaltHash({
    schluessel: E.schluessel,
    thema: E.thema,
    kannBeschreibungen: E.kannBeschreibungen ?? [],
    symbol: E.symbol ?? null,
    nurFuerAusgang: E.nurFuerAusgang ?? null,
  });
  const [ev] = await tx
    .select({ ...vorherSpalten(schema.lernappEinheit) })
    .from(schema.lernappEinheit)
    .where(eq(schema.lernappEinheit.schluessel, E.schluessel));
  const ee = entscheide(ev, einheitHash);
  l.zaehle(ee, kurs);
  const einheitWerte = {
    abschnittId,
    reihenfolge: E.reihenfolge,
    thema: E.thema,
    kannBeschreibungen: E.kannBeschreibungen ?? [],
    symbol: E.symbol ?? null,
    nurFuerAusgang: E.nurFuerAusgang ?? null,
  };
  let einheitId: string;
  if (!ev) {
    const [neu] = await tx
      .insert(schema.lernappEinheit)
      .values({ schluessel: E.schluessel, ...einheitWerte, inhaltHash: einheitHash, status, verfasstVon: null })
      .returning({ id: schema.lernappEinheit.id });
    einheitId = neu!.id;
  } else {
    einheitId = ev.id;
    if (ee === 'aendern')
      await tx
        .update(schema.lernappEinheit)
        .set({ ...einheitWerte, inhaltHash: einheitHash, status })
        .where(eq(schema.lernappEinheit.id, ev.id));
    else {
      if (ee === 'konflikt')
        l.konflikt({
          tabelle: 'lernapp_einheit',
          schluessel: E.schluessel,
          datei: pfad,
          hashDatenbank: ev.inhaltHash,
          hashDatei: einheitHash,
        });
      // Reihenfolge und Abschnitt sind Ordnung, nicht Inhalt (ohne Einfluss auf Hash und Prüfungen)
      const neuStatus = ee === 'gleich' ? statusBeiGleich(ev.status, status) : null;
      await tx
        .update(schema.lernappEinheit)
        .set({ abschnittId, reihenfolge: E.reihenfolge, ...(neuStatus ? { status: neuStatus } : {}) })
        .where(eq(schema.lernappEinheit.id, ev.id));
    }
  }

  // Lemmata
  const lemmaVorher = new Map(
    (
      await tx
        .select({ schluessel: schema.lernappLemma.schluessel, ...vorherSpalten(schema.lernappLemma) })
        .from(schema.lernappLemma)
        .where(like(schema.lernappLemma.schluessel, `${E.schluessel}.%`))
    ).map((z) => [z.schluessel, z]),
  );
  for (const lm of d.lemmata) {
    const werte = {
      kursId: kurs,
      lemma: lm.lemma,
      wortart: lm.wortart ?? null,
      merkmale: lm.merkmale ?? {},
      formen: lm.formen ?? {},
      stufe: d.stufe,
      frequenzRang: lm.frequenzRang ?? null,
      symbol: lm.symbol ?? null,
      religionsbezug: lm.religionsbezug ?? false,
      quelle: lm.quelle,
      lizenz: lm.lizenz,
      namensnennung: lm.namensnennung ?? null,
    };
    const hash = inhaltHash({ schluessel: lm.schluessel, ...werte });
    const v = lemmaVorher.get(lm.schluessel);
    const e = entscheide(v, hash);
    l.zaehle(e, kurs);
    if (e === 'neu')
      await tx
        .insert(schema.lernappLemma)
        .values({ schluessel: lm.schluessel, ...werte, inhaltHash: hash, status, verfasstVon: verfasstVon(lm.quelle) });
    else if (e === 'aendern')
      await tx
        .update(schema.lernappLemma)
        .set({ ...werte, inhaltHash: hash, status, verfasstVon: verfasstVon(lm.quelle) })
        .where(eq(schema.lernappLemma.id, v!.id));
    else if (e === 'konflikt')
      l.konflikt({ tabelle: 'lernapp_lemma', schluessel: lm.schluessel, datei: pfad, hashDatenbank: v!.inhaltHash, hashDatei: hash });
    else if (statusBeiGleich(v!.status, status))
      await tx.update(schema.lernappLemma).set({ status }).where(eq(schema.lernappLemma.id, v!.id));
  }
  await sperreFehlende(
    l,
    kurs,
    schema.lernappLemma,
    like(schema.lernappLemma.schluessel, `${E.schluessel}.%`),
    d.lemmata.map((x) => x.schluessel),
  );

  // Sätze
  const satzVorher = new Map(
    (
      await tx
        .select({ schluessel: schema.lernappSatz.schluessel, ...vorherSpalten(schema.lernappSatz) })
        .from(schema.lernappSatz)
        .where(like(schema.lernappSatz.schluessel, `${E.schluessel}.%`))
    ).map((z) => [z.schluessel, z]),
  );
  for (const s of d.saetze) {
    const werte = {
      kursId: kurs,
      einheitId,
      text: s.text,
      tokens: s.tokens ?? zerlege(s.text),
      stufe: d.stufe,
      religionsbezug: s.religionsbezug ?? false,
      quelle: s.quelle,
      lizenz: s.lizenz,
      namensnennung: s.namensnennung ?? null,
    };
    const { einheitId: _e, ...hashWerte } = werte;
    const hash = inhaltHash({ schluessel: s.schluessel, ...hashWerte });
    const v = satzVorher.get(s.schluessel);
    const e = entscheide(v, hash);
    l.zaehle(e, kurs);
    if (e === 'neu')
      await tx
        .insert(schema.lernappSatz)
        .values({ schluessel: s.schluessel, ...werte, inhaltHash: hash, status, verfasstVon: verfasstVon(s.quelle) });
    else if (e === 'aendern')
      await tx
        .update(schema.lernappSatz)
        .set({ ...werte, inhaltHash: hash, status, verfasstVon: verfasstVon(s.quelle) })
        .where(eq(schema.lernappSatz.id, v!.id));
    else if (e === 'konflikt')
      l.konflikt({ tabelle: 'lernapp_satz', schluessel: s.schluessel, datei: pfad, hashDatenbank: v!.inhaltHash, hashDatei: hash });
    else if (statusBeiGleich(v!.status, status))
      await tx.update(schema.lernappSatz).set({ status }).where(eq(schema.lernappSatz.id, v!.id));
  }
  await sperreFehlende(
    l,
    kurs,
    schema.lernappSatz,
    like(schema.lernappSatz.schluessel, `${E.schluessel}.%`),
    d.saetze.map((x) => x.schluessel),
  );

  // Lektionen und Aufgaben
  const lektionVorher = new Map(
    (
      await tx
        .select({ schluessel: schema.lernappLektion.schluessel, ...vorherSpalten(schema.lernappLektion) })
        .from(schema.lernappLektion)
        .where(eq(schema.lernappLektion.einheitId, einheitId))
    ).map((z) => [z.schluessel, z]),
  );
  const aufgabeVorher = new Map(
    (
      await tx
        .select({ schluessel: schema.lernappAufgabe.schluessel, ...vorherSpalten(schema.lernappAufgabe) })
        .from(schema.lernappAufgabe)
        .where(like(schema.lernappAufgabe.schluessel, `${E.schluessel}.%`))
    ).map((z) => [z.schluessel, z]),
  );
  for (const [i, lk] of d.lektionen.entries()) {
    const werte = { einheitId, art: lk.art, reihenfolge: i + 1, ziel: lk.ziel ?? {}, kinderGeeignet: lk.kinderGeeignet ?? true };
    const hash = inhaltHash({ schluessel: lk.schluessel, art: werte.art, ziel: werte.ziel, kinderGeeignet: werte.kinderGeeignet });
    const v = lektionVorher.get(lk.schluessel);
    const e = entscheide(v, hash);
    l.zaehle(e, kurs);
    let lektionId: string;
    if (e === 'neu') {
      const [neu] = await tx
        .insert(schema.lernappLektion)
        .values({ schluessel: lk.schluessel, ...werte, inhaltHash: hash, status, verfasstVon: null })
        .returning({ id: schema.lernappLektion.id });
      lektionId = neu!.id;
    } else {
      lektionId = v!.id;
      if (e === 'aendern')
        await tx
          .update(schema.lernappLektion)
          .set({ ...werte, inhaltHash: hash, status })
          .where(eq(schema.lernappLektion.id, v!.id));
      else {
        if (e === 'konflikt')
          l.konflikt({ tabelle: 'lernapp_lektion', schluessel: lk.schluessel, datei: pfad, hashDatenbank: v!.inhaltHash, hashDatei: hash });
        const neuStatus = e === 'gleich' ? statusBeiGleich(v!.status, status) : null;
        await tx
          .update(schema.lernappLektion)
          .set({ einheitId, reihenfolge: i + 1, ...(neuStatus ? { status: neuStatus } : {}) })
          .where(eq(schema.lernappLektion.id, v!.id));
      }
    }
    for (const [j, a] of lk.aufgaben.entries()) {
      const { schluessel, typ, ...daten } = a;
      const hash = inhaltHash({ schluessel, typ, daten });
      const va = aufgabeVorher.get(schluessel);
      const ea = entscheide(va, hash);
      l.zaehle(ea, kurs);
      if (ea === 'neu')
        await tx
          .insert(schema.lernappAufgabe)
          .values({ lektionId, schluessel, typ, daten, reihenfolge: j + 1, inhaltHash: hash, status, verfasstVon: null });
      else if (ea === 'aendern')
        await tx
          .update(schema.lernappAufgabe)
          .set({ lektionId, typ, daten, reihenfolge: j + 1, inhaltHash: hash, status })
          .where(eq(schema.lernappAufgabe.id, va!.id));
      else {
        if (ea === 'konflikt')
          l.konflikt({ tabelle: 'lernapp_aufgabe', schluessel, datei: pfad, hashDatenbank: va!.inhaltHash, hashDatei: hash });
        const neuStatus = ea === 'gleich' ? statusBeiGleich(va!.status, status) : null;
        await tx
          .update(schema.lernappAufgabe)
          .set({ lektionId, reihenfolge: j + 1, ...(neuStatus ? { status: neuStatus } : {}) })
          .where(eq(schema.lernappAufgabe.id, va!.id));
      }
    }
  }
  await sperreFehlende(
    l,
    kurs,
    schema.lernappAufgabe,
    like(schema.lernappAufgabe.schluessel, `${E.schluessel}.%`),
    d.lektionen.flatMap((x) => x.aufgaben.map((a) => a.schluessel)),
  );
  await sperreFehlende(
    l,
    kurs,
    schema.lernappLektion,
    eq(schema.lernappLektion.einheitId, einheitId),
    d.lektionen.map((x) => x.schluessel),
  );
}

type Sperrbar =
  | typeof schema.lernappLemma
  | typeof schema.lernappSatz
  | typeof schema.lernappLektion
  | typeof schema.lernappAufgabe
  | typeof schema.lernappUebersetzung
  | typeof schema.lernappTipp
  | typeof schema.lernappEinheit;

/** Einträge im Bereich, die in der Datei fehlen, sperren (außer menschlich geprüften: Konfliktfreiheit vor Löschung). */
async function sperreFehlende(
  l: Lauf,
  kurs: KursId,
  tabelle: Sperrbar,
  bereich: ReturnType<typeof eq>,
  vorhanden: readonly string[],
  spalte: 'schluessel' | 'id' = 'schluessel',
): Promise<void> {
  const t = tabelle as typeof schema.lernappSatz;
  const s = spalte === 'id' ? t.id : t.schluessel;
  const bedingungen = [bereich, sql`${t.status} <> 'gesperrt'`, eq(t.menschlichGeprueft, false)];
  if (vorhanden.length) bedingungen.push(notInArray(s, [...vorhanden]));
  const r = await l.tx
    .update(t)
    .set({ status: 'gesperrt' })
    .where(and(...bedingungen))
    .returning({ id: t.id });
  l.gesperrt(r.length, kurs);
}

async function importiereUebersetzung(l: Lauf, d: UebersetzungDatei, pfad: string): Promise<void> {
  const { tx } = l;
  const { ziel, ausgang } = zerlegeRichtung(d.richtung);
  const status: Status = d.status;
  const [einheit] = await tx
    .select({ id: schema.lernappEinheit.id })
    .from(schema.lernappEinheit)
    .where(eq(schema.lernappEinheit.schluessel, d.einheit));
  if (!einheit) throw new ImportFehler([`${pfad}: Einheit ${d.einheit} unbekannt`]);

  const bezuege = d.eintraege.map((e) => e.bezug);
  const [lemmata, saetze] = await Promise.all([
    bezuege.length
      ? tx
          .select({
            id: schema.lernappLemma.id,
            schluessel: schema.lernappLemma.schluessel,
            religionsbezug: schema.lernappLemma.religionsbezug,
          })
          .from(schema.lernappLemma)
          .where(inArray(schema.lernappLemma.schluessel, bezuege))
      : [],
    bezuege.length
      ? tx
          .select({
            id: schema.lernappSatz.id,
            schluessel: schema.lernappSatz.schluessel,
            religionsbezug: schema.lernappSatz.religionsbezug,
          })
          .from(schema.lernappSatz)
          .where(inArray(schema.lernappSatz.schluessel, bezuege))
      : [],
  ]);
  const lemmaId = new Map(lemmata.map((z) => [z.schluessel, z.id]));
  const satzId = new Map(saetze.map((z) => [z.schluessel, z.id]));
  /** Kennzeichen des Zieleintrags: Die Übersetzung erbt es (S-L1, Gegenprüfung: Ablenker aus verborgenen Einträgen). */
  const zielBezug = new Map([...lemmata, ...saetze].map((z) => [z.schluessel, z.religionsbezug]));
  const unbekannt = bezuege.filter((b) => !lemmaId.has(b) && !satzId.has(b));
  if (unbekannt.length) throw new ImportFehler(unbekannt.map((b) => `${pfad}: Bezug ${b} unbekannt`));

  // Vorhandene Übersetzungen der Einheit in diese Sprache (über Satz der Einheit bzw. Lemma-Schlüssel)
  const vorher = await tx
    .select({
      ...vorherSpalten(schema.lernappUebersetzung),
      lemma: schema.lernappLemma.schluessel,
      satz: schema.lernappSatz.schluessel,
    })
    .from(schema.lernappUebersetzung)
    .leftJoin(schema.lernappLemma, eq(schema.lernappLemma.id, schema.lernappUebersetzung.lemmaId))
    .leftJoin(schema.lernappSatz, eq(schema.lernappSatz.id, schema.lernappUebersetzung.satzId))
    .where(
      and(
        eq(schema.lernappUebersetzung.sprache, ausgang),
        or(
          like(schema.lernappLemma.schluessel, `${d.einheit}.%`),
          like(schema.lernappSatz.schluessel, `${d.einheit}.%`),
          inArray(schema.lernappLemma.schluessel, bezuege),
          inArray(schema.lernappSatz.schluessel, bezuege),
        ),
      ),
    );
  const vorherJe = new Map(vorher.map((z) => [z.lemma ?? z.satz ?? '', z]));
  const behalten: string[] = [];
  for (const u of d.eintraege) {
    const werte = {
      sprache: ausgang,
      text: u.text,
      alternativen: u.alternativen ?? [],
      religionsbezug: (u.religionsbezug ?? false) || (zielBezug.get(u.bezug) ?? false),
      quelle: u.quelle,
      lizenz: u.lizenz,
      namensnennung: u.namensnennung ?? null,
    };
    const hash = inhaltHash({ bezug: u.bezug, ...werte });
    const v = vorherJe.get(u.bezug);
    const e = entscheide(v, hash);
    l.zaehle(e, ziel);
    const bezug = lemmaId.has(u.bezug) ? { lemmaId: lemmaId.get(u.bezug)!, satzId: null } : { lemmaId: null, satzId: satzId.get(u.bezug)! };
    if (e === 'neu') {
      const [neu] = await tx
        .insert(schema.lernappUebersetzung)
        .values({ ...bezug, ...werte, inhaltHash: hash, status, verfasstVon: verfasstVon(u.quelle) })
        .returning({ id: schema.lernappUebersetzung.id });
      behalten.push(neu!.id);
      continue;
    }
    behalten.push(v!.id);
    if (e === 'aendern')
      await tx
        .update(schema.lernappUebersetzung)
        .set({ ...werte, inhaltHash: hash, status, verfasstVon: verfasstVon(u.quelle) })
        .where(eq(schema.lernappUebersetzung.id, v!.id));
    else if (e === 'konflikt')
      l.konflikt({
        tabelle: 'lernapp_uebersetzung',
        schluessel: `${u.bezug}@${ausgang}`,
        datei: pfad,
        hashDatenbank: v!.inhaltHash,
        hashDatei: hash,
      });
    else if (statusBeiGleich(v!.status, status))
      await tx.update(schema.lernappUebersetzung).set({ status }).where(eq(schema.lernappUebersetzung.id, v!.id));
  }
  const imBereich = vorher.filter((z) => (z.lemma ?? z.satz ?? '').startsWith(`${d.einheit}.`)).map((z) => z.id);
  if (imBereich.length)
    await sperreFehlende(l, ziel, schema.lernappUebersetzung, inArray(schema.lernappUebersetzung.id, imBereich), behalten, 'id');

  // Tipps
  const tippVorher = new Map(
    (
      await tx
        .select({ schluessel: schema.lernappTipp.schluessel, ...vorherSpalten(schema.lernappTipp) })
        .from(schema.lernappTipp)
        .where(and(eq(schema.lernappTipp.einheitId, einheit.id), eq(schema.lernappTipp.ausgangssprache, ausgang)))
    ).map((z) => [z.schluessel, z]),
  );
  for (const [i, t] of d.tipps.entries()) {
    const werte = {
      einheitId: einheit.id,
      ausgangssprache: ausgang,
      reihenfolge: i + 1,
      titel: t.titel ?? null,
      inhalt: t.inhalt as never,
      religionsbezug: t.religionsbezug ?? false,
      quelle: t.quelle ?? null,
    };
    const hash = inhaltHash({
      schluessel: t.schluessel,
      ausgangssprache: ausgang,
      titel: werte.titel,
      inhalt: t.inhalt,
      religionsbezug: werte.religionsbezug,
      quelle: werte.quelle,
    });
    const v = tippVorher.get(t.schluessel);
    const e = entscheide(v, hash);
    l.zaehle(e, ziel);
    if (e === 'neu')
      await tx
        .insert(schema.lernappTipp)
        .values({ schluessel: t.schluessel, ...werte, inhaltHash: hash, status, verfasstVon: verfasstVon(t.quelle) });
    else if (e === 'aendern')
      await tx
        .update(schema.lernappTipp)
        .set({ ...werte, inhaltHash: hash, status })
        .where(eq(schema.lernappTipp.id, v!.id));
    else if (e === 'konflikt')
      l.konflikt({ tabelle: 'lernapp_tipp', schluessel: t.schluessel, datei: pfad, hashDatenbank: v!.inhaltHash, hashDatei: hash });
    else if (statusBeiGleich(v!.status, status))
      await tx.update(schema.lernappTipp).set({ status }).where(eq(schema.lernappTipp.id, v!.id));
  }
  await sperreFehlende(
    l,
    ziel,
    schema.lernappTipp,
    and(eq(schema.lernappTipp.einheitId, einheit.id), eq(schema.lernappTipp.ausgangssprache, ausgang))!,
    d.tipps.map((t) => t.schluessel),
  );
}

/** Höchstzahl Schlüssel je Verweis-Abfrage (deutlich unter der Parametergrenze des PostgreSQL-Protokolls). */
export const VERWEISE_JE_ABFRAGE = 5000;

/** Verweise aller Aufgaben der importierten Einheiten müssen auf Lemmata oder Sätze zeigen, die es gibt. */
async function pruefeVerweise(tx: Transaktion, dateien: readonly { pfad: string; d: SprachEinheitDatei }[]): Promise<void> {
  const verweise = new Map<string, string>();
  for (const { pfad, d } of dateien)
    for (const l of d.lektionen) for (const a of l.aufgaben) for (const v of verweiseVon(a)) verweise.set(v, `${pfad}: ${a.schluessel}`);
  if (!verweise.size) return;
  const liste = [...verweise.keys()];
  // In Blöcken abfragen: Das PostgreSQL-Protokoll zählt Parameter mit 16 Bit (höchstens 32.767 je Abfrage). Bei mehr
  // Verweisen lief die Abfrage über und meldete jeden Verweis als unbekannt (Import aller Stufen ab B1, 25.10.2026).
  const bekannt = new Set<string>();
  for (let i = 0; i < liste.length; i += VERWEISE_JE_ABFRAGE) {
    const block = liste.slice(i, i + VERWEISE_JE_ABFRAGE);
    const [lemmata, saetze] = await Promise.all([
      tx.select({ s: schema.lernappLemma.schluessel }).from(schema.lernappLemma).where(inArray(schema.lernappLemma.schluessel, block)),
      tx.select({ s: schema.lernappSatz.schluessel }).from(schema.lernappSatz).where(inArray(schema.lernappSatz.schluessel, block)),
    ]);
    for (const z of [...lemmata, ...saetze]) bekannt.add(z.s);
  }
  const fehlen = liste.filter((v) => !bekannt.has(v));
  if (fehlen.length) throw new ImportFehler(fehlen.map((v) => `${verweise.get(v)} verweist auf unbekanntes ${v}`));
}

/** Schlüssel der Lemmata, Sätze und Aufgaben einer Sprachdatei. */
function schluesselDerDatei(d: SprachEinheitDatei): Set<string> {
  return new Set([
    ...d.lemmata.map((x) => x.schluessel),
    ...d.saetze.map((x) => x.schluessel),
    ...d.lektionen.flatMap((x) => x.aufgaben.map((a) => a.schluessel)),
  ]);
}

/**
 * Als entfernt geführte Schlüssel einer Einheit (Stand `entfernt`, L3-06b): Lemmata, Sätze und Aufgaben im Bereich der
 * Einheit (wie `sperreFehlende`), die nicht in `inDatei` stehen und nicht menschlich geprüft sind – gleich, ob der Import sie
 * eben gesperrt hat oder ob sie schon gesperrt waren.
 */
async function entfernteDerEinheit(tx: Transaktion, einheit: string, inDatei: ReadonlySet<string>): Promise<string[]> {
  const tabellen = [schema.lernappLemma, schema.lernappSatz, schema.lernappAufgabe] as unknown as (typeof schema.lernappSatz)[];
  const zeilen = [];
  for (const t of tabellen)
    zeilen.push(
      ...(await tx
        .select({ s: t.schluessel })
        .from(t)
        .where(and(like(t.schluessel, `${einheit}.%`), eq(t.menschlichGeprueft, false)))),
    );
  return zeilen.map((z) => z.s).filter((x) => !inDatei.has(x));
}

/** Entfernte Dateien: Einheit (Sprache) bzw. Übersetzungen und Tipps der Richtung (Übersetzung) sperren. */
async function entfernteDateien(l: Lauf, entfernt: readonly DateiStand[]): Promise<void> {
  for (const s of entfernt) {
    const kurs = s.einheit.split('.')[0] as KursId;
    const [einheit] = await l.tx
      .select({ id: schema.lernappEinheit.id })
      .from(schema.lernappEinheit)
      .where(eq(schema.lernappEinheit.schluessel, s.einheit));
    if (!einheit) continue;
    if (s.art === 'sprache') {
      await sperreFehlende(l, kurs, schema.lernappEinheit, eq(schema.lernappEinheit.id, einheit.id), []);
      continue;
    }
    if (!s.richtung) continue;
    const { ausgang } = zerlegeRichtung(s.richtung as (typeof RICHTUNGEN)[number]);
    const ids = await l.tx
      .select({ id: schema.lernappUebersetzung.id })
      .from(schema.lernappUebersetzung)
      .leftJoin(schema.lernappLemma, eq(schema.lernappLemma.id, schema.lernappUebersetzung.lemmaId))
      .leftJoin(schema.lernappSatz, eq(schema.lernappSatz.id, schema.lernappUebersetzung.satzId))
      .where(
        and(
          eq(schema.lernappUebersetzung.sprache, ausgang),
          or(like(schema.lernappLemma.schluessel, `${s.einheit}.%`), like(schema.lernappSatz.schluessel, `${s.einheit}.%`)),
        ),
      );
    if (ids.length)
      await sperreFehlende(
        l,
        kurs,
        schema.lernappUebersetzung,
        inArray(
          schema.lernappUebersetzung.id,
          ids.map((z) => z.id),
        ),
        [],
        'id',
      );
    await sperreFehlende(
      l,
      kurs,
      schema.lernappTipp,
      and(eq(schema.lernappTipp.einheitId, einheit.id), eq(schema.lernappTipp.ausgangssprache, ausgang))!,
      [],
    );
  }
}

/** Dateien lesen und prüfen; Fehler sammeln (Schema, Pfad). */
export function leseDateien(quellen: readonly ImportQuelle[]): { pfad: string; sha: string; datei: InhaltDatei }[] {
  const fehler: string[] = [];
  const ergebnis: { pfad: string; sha: string; datei: InhaltDatei }[] = [];
  for (const q of quellen) {
    let roh: unknown;
    try {
      roh = JSON.parse(q.text);
    } catch {
      fehler.push(`${q.pfad}: kein JSON`);
      continue;
    }
    const p = pruefeInhaltDatei(roh);
    if (!p.ok) {
      fehler.push(...p.fehler.map((f) => `${q.pfad}: ${f}`));
      continue;
    }
    // Bildkarten: nur Motive aus dem Register, ohne Freigabe der Redaktion nur im Testkurs (Inhaltsleitfaden §5, LM-34)
    if (p.datei.art === 'sprache')
      for (const l of p.datei.daten.lemmata) {
        const f = l.symbol ? symbolFehler(l.symbol, l.quelle) : null;
        if (f) fehler.push(`${q.pfad}: ${l.schluessel}: ${f}`);
      }
    ergebnis.push({ pfad: q.pfad, sha: sha256Hex(q.text), datei: p.datei });
  }
  // Schlüssel sind über alle Dateien eindeutig (Einheiten, Lemmata, Sätze, Lektionen, Aufgaben)
  const gesehen = new Map<string, string>();
  for (const { pfad, datei } of ergebnis) {
    if (datei.art !== 'sprache') continue;
    const d = datei.daten;
    for (const k of [
      d.einheit.schluessel,
      ...d.lemmata.map((x) => x.schluessel),
      ...d.saetze.map((x) => x.schluessel),
      ...d.lektionen.map((x) => x.schluessel),
      ...d.lektionen.flatMap((x) => x.aufgaben.map((a) => a.schluessel)),
    ]) {
      const vorher = gesehen.get(k);
      if (vorher && vorher !== pfad) fehler.push(`${pfad}: Schlüssel ${k} auch in ${vorher}`);
      gesehen.set(k, pfad);
    }
  }
  if (fehler.length) throw new ImportFehler(fehler);
  return ergebnis;
}

/**
 * Inhalte importieren. `standSchluessel` trennt Quellen (Inhalte `lernapp_import`, Testkurs `lernapp_testkurs`): Entfernte
 * Dateien erkennt der Import nur innerhalb derselben Quelle.
 */
export async function importiereLernapp(
  db: Datenbank,
  quellen: readonly ImportQuelle[],
  {
    erzwingen = false,
    standSchluessel = 'lernapp_import',
    jetzt = new Date(),
  }: { erzwingen?: boolean; standSchluessel?: string; jetzt?: Date } = {},
): Promise<ImportBericht> {
  const dateien = leseDateien(quellen);
  const religion = [...pruefeTatoebaAusschluss(dateien), ...pruefeReligion(dateien, ladeWaechter())];
  if (religion.length) throw new ImportFehler(religion);
  return db.transaction(async (tx) => {
    const [z] = await tx.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, standSchluessel));
    const alt = (z?.wert as Stand | undefined) ?? { dateien: {}, konflikte: [], am: '' };
    const l = new Lauf(tx);
    l.bericht.dateien = dateien.length;
    const offen = dateien.filter((d) => erzwingen || alt.dateien[d.pfad]?.sha !== d.sha);
    l.bericht.uebersprungen = dateien.length - offen.length;

    const sprache = offen.flatMap((d) => (d.datei.art === 'sprache' ? [{ pfad: d.pfad, d: d.datei.daten }] : []));
    const uebersetzung = offen.flatMap((d) => (d.datei.art === 'uebersetzung' ? [{ pfad: d.pfad, d: d.datei.daten }] : []));
    for (const s of sprache) await importiereSprache(l, s.d, s.pfad);
    await pruefeVerweise(tx, sprache);
    for (const u of uebersetzung) await importiereUebersetzung(l, u.d, u.pfad);

    const neuStand: Stand = { dateien: {}, konflikte: l.bericht.konflikte, am: jetzt.toISOString() };
    for (const d of dateien)
      neuStand.dateien[d.pfad] =
        d.datei.art === 'sprache'
          ? { sha: d.sha, art: 'sprache', einheit: d.datei.daten.einheit.schluessel }
          : { sha: d.sha, art: 'uebersetzung', einheit: d.datei.daten.einheit, richtung: d.datei.daten.richtung };
    const entfernteStaende = Object.entries(alt.dateien)
      .filter(([pfad]) => !neuStand.dateien[pfad])
      .map(([, s]) => s);
    await entfernteDateien(l, entfernteStaende);

    // Als entfernt geführte Einträge (L3-06b): neu ermittelt für bearbeitete und für entfernte Sprachdateien (deren Einheit
    // es in keiner Datei mehr gibt); ein Stand ohne diese Liste (vor L3-06b) wird einmal für alle Sprachdateien ergänzt.
    const sprachDateien = dateien.flatMap((d) => (d.datei.art === 'sprache' ? [d.datei.daten] : []));
    const neuEntfernt = new Map<string, string[]>();
    for (const d of alt.entfernt ? sprache.map((x) => x.d) : sprachDateien)
      neuEntfernt.set(d.einheit.schluessel, await entfernteDerEinheit(tx, d.einheit.schluessel, schluesselDerDatei(d)));
    const einheitenMitDatei = new Set(sprachDateien.map((d) => d.einheit.schluessel));
    for (const st of entfernteStaende)
      if (st.art === 'sprache' && !einheitenMitDatei.has(st.einheit))
        neuEntfernt.set(st.einheit, await entfernteDerEinheit(tx, st.einheit, new Set()));
    neuStand.entfernt = fuehreEntfernte(alt.entfernt ?? [], neuEntfernt);
    if (!erzwingen && !offen.length) neuStand.konflikte = alt.konflikte;

    const kurse = l.kurseFertig();
    if (kurse.length)
      await tx
        .update(schema.lernappKurs)
        .set({ version: sql`${schema.lernappKurs.version} + 1` })
        .where(inArray(schema.lernappKurs.id, kurse));
    l.bericht.kurse = kurse;
    await tx
      .insert(schema.einstellung)
      .values({ schluessel: standSchluessel, wert: neuStand })
      .onConflictDoUpdate({ target: schema.einstellung.schluessel, set: { wert: neuStand, geaendertAm: jetzt } });
    return l.bericht;
  });
}
