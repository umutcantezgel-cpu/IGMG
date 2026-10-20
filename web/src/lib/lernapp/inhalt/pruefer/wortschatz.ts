import { SPRACH_STUFEN, type Sprache } from '../../kurse';
import type { Inhalte } from './dateien';
import { type KaikkiEintrag, ladeHaeufigkeit, ladeKaikki } from './daten';
import { arabischNormal, grundformKandidaten, istZahlOderZeichen, lemmaSchluessel, saetzeVon, vergleichsform, woerterVon } from './sprache';
import type { SprachStufe } from './texte';
import { Befunde } from './typen';

/**
 * Prüfer „Wortschatz“, „Satzlänge“ und „Lemma-Budget“ (PLAN §6.4, blockierend).
 *
 * **Stufen-Wortschatz:** Je Einheit dürfen höchstens {@link HOECHSTENS_UEBER_STUFE} der Wörter ihrer Sätze über der Stufe
 * liegen (mindestens ein Wort, für kleine Einheiten). Ein Wort ist
 * - *bekannt*, wenn es (über die Grundform-Kandidaten, `sprache.ts`) ein Lemma des Kurses aus dieser oder einer früheren
 *   Einheit ist, ein Lemma, das der kaikki-Kernauszug als Grundform nennt, oder in der Häufigkeitsliste innerhalb der
 *   Schwelle der Stufe liegt ({@link RANG_SCHWELLE}; Standard bis zur Messung an echten Einheiten, L3-07);
 * - *Vorgriff* (Warnung), wenn sein Lemma erst in einer späteren Einheit derselben Stufe eingeführt wird;
 * - *über der Stufe*, wenn sein Lemma zu einer höheren Stufe gehört oder es weder Lemma noch häufig genug ist.
 * Namen aus dem Leitfaden, Zahlen und Platzhalter zählen nicht.
 *
 * **Satzlänge:** A1 ≤ 8, A2 ≤ 12, B1 ≤ 18, B2 ≤ 25, C1 ≤ 35 Wörter je Satz (ein Eintrag kann mehrere Sätze tragen).
 *
 * **Lemma-Budget:** Lemmata ohne Religionsbezug je Einheit höchstens `lemmaBudget` des Rahmenplans, je Stufe höchstens
 * das Budget der Stufe (Leitfaden: Einträge mit Religionsbezug zählen nie zum Budget).
 */

export const SATZLAENGE: Record<SprachStufe, number> = { a1: 8, a2: 12, b1: 18, b2: 25, c1: 35 };
export const HOECHSTENS_UEBER_STUFE = 0.05;
/** Höchster Häufigkeitsrang (Wortformen) je Stufe, der ohne Lemma als bekannt gilt. */
export const RANG_SCHWELLE: Record<Sprache, Record<SprachStufe, number>> = {
  de: { a1: 3000, a2: 6000, b1: 12_000, b2: 25_000, c1: 50_000 },
  tr: { a1: 4000, a2: 8000, b1: 15_000, b2: 30_000, c1: 50_000 },
  ar: { a1: 4000, a2: 8000, b1: 15_000, b2: 30_000, c1: 50_000 },
};

type LemmaOrt = { schluessel: string; stufe: number; ordnung: number };

const stufenIndex = (s: SprachStufe) => SPRACH_STUFEN.indexOf(s);

/** Häufigkeit in der Vergleichsform (ar ohne Zeichen). */
function vergleichsRaenge(sprache: Sprache, daten: string): Map<string, number> {
  const roh = ladeHaeufigkeit(sprache, daten);
  const ergebnis = new Map<string, number>();
  for (const [wort, rang] of roh) {
    const f = sprache === 'ar' ? arabischNormal(wort) : vergleichsform(wort, sprache);
    if (!ergebnis.has(f) || ergebnis.get(f)! > rang) ergebnis.set(f, rang);
  }
  return ergebnis;
}

/** Wortform → Grundformen (Vergleichsform) aus dem kaikki-Kernauszug (Seitentitel, Plural, Stammformen, kanonische Form). */
function kaikkiGrundformen(sprache: Sprache, daten: string): Map<string, Set<string>> {
  const ergebnis = new Map<string, Set<string>>();
  const eintragen = (form: string, lemma: string) => {
    const f = vergleichsform(form, sprache);
    if (!f) return;
    if (!ergebnis.has(f)) ergebnis.set(f, new Set());
    ergebnis.get(f)!.add(lemma);
  };
  for (const e of ladeKaikki(sprache, daten) as KaikkiEintrag[]) {
    const lemma = vergleichsform(e.w, sprache);
    eintragen(e.w, lemma);
    if (e.kanon) eintragen(e.kanon, lemma);
    for (const p of e.pl ?? []) eintragen(p, lemma);
    for (const [form] of e.kf ?? []) eintragen(form, lemma);
  }
  return ergebnis;
}

export type WortschatzOptionen = { daten: string; namen: ReadonlySet<string> };

export function pruefeWortschatz(
  inhalte: Inhalte,
  { daten, namen }: WortschatzOptionen,
): { wortschatz: Befunde; satzlaenge: Befunde; lemmabudget: Befunde } {
  const wortschatz = new Befunde('wortschatz');
  const satzlaenge = new Befunde('satzlaenge');
  const lemmabudget = new Befunde('lemmabudget');
  const jeKurs = new Map<Sprache, typeof inhalte.sprache>();
  for (const x of inhalte.sprache) jeKurs.set(x.daten.kurs, [...(jeKurs.get(x.daten.kurs) ?? []), x]);

  for (const [kurs, dateien] of jeKurs) {
    // Lemmata des Kurses mit Stufe und Reihenfolge der einführenden Einheit
    const lemmata = new Map<string, LemmaOrt[]>();
    for (const { daten: d } of dateien)
      for (const l of d.lemmata) {
        const ort = { schluessel: l.schluessel, stufe: stufenIndex(d.stufe), ordnung: stufenIndex(d.stufe) * 1000 + d.einheit.reihenfolge };
        for (const k of new Set([...lemmaSchluessel(l.lemma, kurs), ...Object.values(l.formen ?? {}).map((f) => vergleichsform(f, kurs))]))
          lemmata.set(k, [...(lemmata.get(k) ?? []), ort]);
      }
    const raenge = vergleichsRaenge(kurs, daten);
    const grundformen = kaikkiGrundformen(kurs, daten);

    /** Frühestes Lemma zu einem Wort (direkt, über Grundform-Kandidaten oder kaikki), sonst null. */
    const lemmaVon = (form: string): LemmaOrt | null => {
      const kandidaten = new Set(grundformKandidaten(form, kurs));
      for (const k of [...kandidaten]) for (const g of grundformen.get(k) ?? []) kandidaten.add(g);
      let bestes: LemmaOrt | null = null;
      for (const k of kandidaten) for (const o of lemmata.get(k) ?? []) if (!bestes || o.ordnung < bestes.ordnung) bestes = o;
      return bestes;
    };
    const rangVon = (form: string): number => {
      let bester = Infinity;
      for (const k of grundformKandidaten(form, kurs)) bester = Math.min(bester, raenge.get(k) ?? Infinity);
      return bester;
    };

    for (const { pfad, daten: d } of dateien) {
      const ordnung = stufenIndex(d.stufe) * 1000 + d.einheit.reihenfolge;
      const schwelle = RANG_SCHWELLE[kurs][d.stufe];
      let gesamt = 0;
      let ueber = 0;
      const ueberJeSatz = new Map<string, number>();
      const vorgriffe = new Set<string>();
      for (const s of d.saetze) {
        for (const satz of saetzeVon(s.text)) {
          const n = woerterVon(satz).length;
          if (n > SATZLAENGE[d.stufe])
            satzlaenge.blockierend(
              pfad,
              `${n} Wörter in einem Satz (${d.stufe.toUpperCase()} höchstens ${SATZLAENGE[d.stufe]})`,
              s.schluessel,
            );
        }
        if (s.religionsbezug) continue;
        for (const wort of s.tokens ?? woerterVon(s.text)) {
          const form = vergleichsform(wort, kurs);
          if (!form || istZahlOderZeichen(wort) || namen.has(form)) continue;
          gesamt++;
          const lemma = lemmaVon(form);
          let istUeber = false;
          if (lemma) {
            if (lemma.stufe > stufenIndex(d.stufe)) istUeber = true;
            else if (lemma.ordnung > ordnung) vorgriffe.add(s.schluessel);
          } else if (rangVon(form) > schwelle) istUeber = true;
          if (istUeber) {
            ueber++;
            ueberJeSatz.set(s.schluessel, (ueberJeSatz.get(s.schluessel) ?? 0) + 1);
          }
        }
      }
      // kleine Einheiten: ein Wort über der Stufe ist immer erlaubt (sonst wäre 1 von 18 schon zu viel)
      if (ueber > Math.max(1, Math.floor(HOECHSTENS_UEBER_STUFE * gesamt))) {
        const beispiele = [...ueberJeSatz.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([k, n]) => `${k} (${n})`)
          .join(', ');
        wortschatz.blockierend(
          pfad,
          `${((100 * ueber) / gesamt).toFixed(1)} % der Wörter über ${d.stufe.toUpperCase()} (${ueber} von ${gesamt}; erlaubt ≤ 5 %); meiste in ${beispiele}`,
          d.einheit.schluessel,
        );
      }
      if (vorgriffe.size)
        wortschatz.warnung(
          pfad,
          `Vorgriff auf Lemmata späterer Einheiten in ${[...vorgriffe].slice(0, 5).join(', ')}`,
          d.einheit.schluessel,
        );
    }

    // Lemma-Budget je Einheit und je Stufe (nur mit Rahmenplan)
    const rahmen = inhalte.rahmen.get(kurs)?.daten;
    if (!rahmen) continue;
    const budgetEinheit = new Map(rahmen.stufen.flatMap((st) => st.einheiten.map((e) => [e.schluessel, e.lemmaBudget] as const)));
    const jeStufe = new Map<SprachStufe, number>();
    for (const { pfad, daten: d } of dateien) {
      const anzahl = d.lemmata.filter((l) => !l.religionsbezug).length;
      jeStufe.set(d.stufe, (jeStufe.get(d.stufe) ?? 0) + anzahl);
      const budget = budgetEinheit.get(d.einheit.schluessel);
      if (budget !== undefined && anzahl > budget)
        lemmabudget.blockierend(pfad, `${anzahl} Lemmata, Budget der Einheit ${budget} (Rahmenplan)`, d.einheit.schluessel);
    }
    for (const st of rahmen.stufen) {
      const anzahl = jeStufe.get(st.stufe) ?? 0;
      if (anzahl > st.lemmaBudget)
        lemmabudget.blockierend(
          inhalte.rahmen.get(kurs)!.pfad,
          `${kurs}.${st.stufe}: ${anzahl} Lemmata, Budget der Stufe ${st.lemmaBudget}`,
        );
    }
  }
  return { wortschatz, satzlaenge, lemmabudget };
}
