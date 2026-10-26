import { lateinWoerter } from '../../formelkandidat';
import { SPRACH_STUFEN, type Sprache } from '../../kurse';
import type { Leitfaden, TabuKategorie } from '../schema';
import { type KaikkiEintrag, ladeKaikki } from './daten';
import { type ArabischBekannt, arabischeKandidaten, arabischNormal, deutscheMorphemgrenze, tuerkischesLaengeresWort } from './sprache';
import type { SprachStufe, TextEintrag } from './texte';
import { Befunde } from './typen';

/**
 * Prüfer „Inhaltsleitfaden (Tabu-Lexikon, LM-09)“ (PLAN §6.4: Befund → Mensch). Regeln aus `rahmen/leitfaden.json`
 * (`pruefung`, `tabu.kategorien`):
 *
 * - **Normalisierung:** de NFC, klein, ß → ss, Bindestrich trennt zusätzlich in Teilwörter; tr NFC, türkisch klein, ohne
 *   Zirkumflex, Apostroph vor Endungen entfernt; ar wie der Wächter (ohne Zeichen, Alif- und Ya-Formen vereinheitlicht),
 *   Klitika und Pronomen-Suffixe abgetrennt; von einem bekannten Wort des Kernauszugs kein Klitikum, von einem Stichwort kein
 *   Suffix, dessen Rest ein Stichwort nur anderer Wortart ist (`arabischeKandidaten`).
 * - **Prüfarten:** `teil` (Form im Wort), `anfang` (Wort beginnt mit der Form), `wort` (genau die Form), `phrase` (Wortfolge
 *   im Satz). Ein Wort mit einer `ausnahme` trifft in dieser Kategorie nicht; `phrase_ausnahmen` werden vorher aus dem Satz
 *   entfernt. Mit `kontext` zählt ein Treffer nur, wenn im selben Satz ein Kontextwort (Art `anfang`) steht.
 * - **Teilwörter an Morphemgrenzen** (bekannte Wörter: Stichwort, Plural, Beugungsform im kaikki-Kernauszug, ohne Namen,
 *   Abkürzungen, Zeichen und Affixe): Eine `teil`-Form mitten im Wort trifft, wenn der Teil davor ein möglicher Vorderteil
 *   eines Kompositums ist (bekannte Wörter, Stämme, Vorsilben, Fugen: „Rot|wein“) oder das Wort sich nicht anders in Morpheme
 *   zerlegen lässt; ein Wort, das die Form nur zufällig enthält (das Verb fürs Buchstabieren: Stamm des Nomens + -ieren),
 *   trifft nicht. Türkisch `anfang`: Ist die Form selbst ein bekanntes Nomen, das Wort ein längeres bekanntes Wort mit
 *   Endungen, dessen Rest hinter der Form keine Endungskette ist, und treffen weder seine Definitionen (türkische Ausgabe)
 *   noch seine deutschen Übersetzungen die Kategorie, trifft es nicht (das Zahlwort 80). Endungsketten, Ableitungen, Verben
 *   aus dem Nomen (-la/-le) und längere Wörter, die über die Form definiert sind (Bombardierung), treffen weiter.
 * - **Arabisch:** Die Umschriften (DIN 31635) werden über `umschrift.din_zu_wiktionary` auf das Feld `rom` im kaikki-Kernauszug
 *   abgebildet (Wortanfang ohne Hamza zusätzlich mit ʔ, Nisba -ī auch als -iyy); Muster sind nur Seitentitel und Plural der
 *   gefundenen Einträge, verglichen als ganzes Wort nach Abtrennen der Klitika, als Wortanfang erst ab fünf Buchstaben.
 *   Die Muster entstehen zur Laufzeit und stehen nirgends geschrieben. `mehrdeutig` ergibt nur Hinweise. Umschriften ohne
 *   Eintrag im Kernauszug zählt der Bericht (ohne Wörter); sie bleiben der Sprachprüfung (LM-01).
 * - **Register aus kaikki:** geurteilt wird je Sprache und Wortform (Normalform wie oben) über alle Einträge, deren Stichwort
 *   oder Plural die Form ist. Ganz markiert ist ein Eintrag, wenn jede Bedeutung vulgar, offensive, derogatory, slur,
 *   pejorative oder ethnic trägt (Kategorie `fluchen_schimpfwoerter`) bzw. wenn er das Thema sex/sexuality und genau eine
 *   Bedeutung hat (`sexualitaet`); Verweise (form-of, alt-of) zählen nicht als Bedeutung. Eine unmarkierte Bedeutung hat keine
 *   Gebrauchsangabe (nur plural/singular). **Treffer** ist eine Form nur, wenn eine Wiktionary-Ausgabe (`q`) sie ganz markiert,
 *   dieselbe Ausgabe keinen Eintrag mit unmarkierter Bedeutung für sie hat und sie keine Beugungsform (`kf`) eines Lemmas ohne
 *   Register ist. Sonst ist der ganz markierte Eintrag ein Nebeneintrag. Er ergibt einen **Hinweis** („möglicher Treffer
 *   (mehrdeutig)“), wenn in einer Ausgabe die markierten Lesarten überwiegen: Lesart ist ein Eintrag mit Bedeutung, markiert,
 *   wenn seine Hauptbedeutung (die erste) das Register trägt; jedes Lemma ohne Register, dessen Beugungsform die Form ist,
 *   zählt in jeder Ausgabe als unmarkierte Lesart. Überwiegen die markierten Lesarten nicht, ist die Hauptlesart der Form
 *   unmarkiert und es bleibt still (z. B. ein Adjektiv-Eintrag neben dem Grundwortschatz-Nomen, ein Nomen gleich einer
 *   Präteritumform, ein Vorname neben einem Schimpfwort). Einträge mit nur teils markierten Bedeutungen ergeben allein
 *   nichts: ein Register an einer Nebenbedeutung ist kein Treffer, sonst wären Alltagswörter dauerhaft Fehlalarme
 *   (Entscheidung L3-02, Standard bis zur Antwort der Redaktion, LM-09). Die Ausgaben zählen einzeln, weil sie Register
 *   verschieden auszeichnen (die deutsche und die türkische lassen derbe Wörter oft ohne Angabe); ein unmarkierter Eintrag
 *   einer anderen Ausgabe machte sonst echte Register-Wörter zunichte.
 * - **Tipps:** Zitatblöcke sind Beispiele in der Zielsprache (wie im Paketbau, `tippAbschnitte`) und werden nur in ihr
 *   geprüft. Titel und übriger Fließtext werden in der Sprache des Tipps geprüft, in der Zielsprache nur die Wörter, die in der
 *   Tipp-Sprache kein bekanntes Wort sind (Stichwort, Plural oder Beugungsform im kaikki-Kernauszug; bekannte Wörter werden zu
 *   Lücken, über die keine Phrase greift). So trifft ein Wort der Tipp-Sprache keine gleich geschriebene Form der Zielsprache.
 *   Für Arabisch als Tipp-Sprache entfällt die Liste: Wörter in arabischer Schrift treffen keine Regel für de/tr, und die
 *   arabische Zerlegung übergeht lateinische Wörter.
 *
 * **Ergebnis:** `verboten` und `offene_frage` → `menschlich_klaeren`; `nur_sachlich` → `menschlich_klaeren` unter `ab_stufe` oder
 * in kindgeeigneten Einheiten, sonst Hinweis. Je Text und Kategorie zählt der stärkste Befund. Ausgaben nennen nur
 * Kategorie-IDs, nie die Wörter des Lexikons.
 */

type LateinRegeln = {
  teil: string[];
  anfang: string[];
  wort: Set<string>;
  phrase: string[][];
  ausnahmen: string[];
  phraseAusnahmen: string[][];
  kontext: string[];
};
type ArMuster = { ganz: Set<string>; anfang: string[] };
type ArRegeln = { muster: ArMuster; mehrdeutig: ArMuster; phrase: ArMuster[][]; kontext: ArMuster | null };
type Kategorie = {
  id: string;
  regel: TabuKategorie['regel'];
  abStufe: SprachStufe | null;
  de: LateinRegeln;
  tr: LateinRegeln;
  ar: ArRegeln;
};

/** Bedeutung einer türkischen Wortform im Kernauszug: Definitionen (tr) und deutsche Übersetzungen bzw. Definitionen (de) */
type Bedeutung = { tr: string[]; de: string[] };

export type TabuLexikon = {
  kategorien: Kategorie[];
  /** Register aus kaikki je Sprache: Wortform → Kategorien der Treffer (geurteilt über alle Einträge der Form) */
  register: Record<Sprache, Map<string, string[]>>;
  /** Register-Hinweise je Sprache: Wortform → Kategorien, deren Nebeneintrag nur einen Hinweis ergibt (markierte Lesarten überwiegen) */
  registerHinweise: Record<Sprache, Map<string, string[]>>;
  /** Bekannte Wortformen (Stichwort, Plural, Beugungsformen) im kaikki-Kernauszug – für den Fließtext der Tipps */
  bekannt: Record<'de' | 'tr', Set<string>>;
  /**
   * Bekannte Wortformen ohne Namen, Abkürzungen, Zeichen und Affixe – für Teilwörter an Morphemgrenzen (sonst zerlegte z. B.
   * ein Kfz-Kennzeichen ein Verb an der falschen Stelle)
   */
  woerter: Record<'de' | 'tr', Set<string>>;
  /** Bekannte arabische Wörter (ohne Namen usw.) für die Zerlegung in Klitika und Wort (`arabischeKandidaten`) */
  arabisch: ArabischBekannt;
  /** Bedeutungen türkischer Wortformen (Definitionen der türkischen Ausgabe, deutsche Übersetzungen) – für `anfang` */
  bedeutungen: Map<string, Bedeutung>;
  /** Umschriften ohne Muster je Kategorie (nur Anzahl, ohne Wörter) */
  ohneMuster: Map<string, number>;
};

// ——— Normalisierung ———

/**
 * Wörter eines Texts in der Normalform des Leitfadens (de mit Teilwörtern am Bindestrich). Lateinschrift wie
 * `formelkandidat.ts` `lateinWoerter` (dieselbe Zerlegung für Formel-Kandidaten in Paketbau und Verwaltung).
 */
export function tabuWoerter(text: string, sprache: Sprache): string[] {
  if (sprache === 'ar')
    return text
      .normalize('NFC')
      .split(/\s+/u)
      .flatMap((w) => arabischNormal(w).split(/[^\u0621-\u064A\u0671-\u06D3]+/u))
      .filter(Boolean);
  return lateinWoerter(text, sprache);
}

const form = (f: string, sprache: 'de' | 'tr') => tabuWoerter(f, sprache).join(' ');

function lateinRegeln(f: TabuKategorie['formen']['de'], sprache: 'de' | 'tr'): LateinRegeln {
  const liste = (x?: string[]) => (x ?? []).map((y) => form(y, sprache)).filter(Boolean);
  const phrasen = (x?: string[]) => (x ?? []).map((y) => tabuWoerter(y, sprache)).filter((p) => p.length);
  return {
    teil: liste(f.teil),
    anfang: liste(f.anfang),
    wort: new Set(liste(f.wort)),
    phrase: phrasen(f.phrase),
    ausnahmen: liste(f.ausnahmen),
    phraseAusnahmen: phrasen(f.phrase_ausnahmen),
    kontext: liste(f.kontext),
  };
}

// ——— Arabisch: Umschrift → kaikki → Muster ———

const leer = (): ArMuster => ({ ganz: new Set(), anfang: [] });

/** Varianten einer DIN-Umschrift im Alphabet von Wiktionary (`rom`). */
function romVarianten(umschrift: string, tabelle: Record<string, string>): string[] {
  let r = umschrift.normalize('NFC').toLowerCase();
  for (const [din, wikt] of Object.entries(tabelle)) r = r.split(din.toLowerCase()).join(wikt);
  // Artikel, auch angeglichen (aš-, an-, …) und nach Vokal (l-)
  r = r.replace(/^(?:a[lšṣṭḍẓṯḏnrstdz]-|l-)/u, '');
  const varianten = new Set([r]);
  if (/^[aiuāīū]/.test(r)) varianten.add(`ʔ${r}`);
  for (const v of [...varianten]) if (v.endsWith('ī')) varianten.add(`${v.slice(0, -1)}iyy`);
  return [...varianten];
}

function musterAus(eintraege: readonly KaikkiEintrag[], muster: ArMuster): void {
  for (const e of eintraege)
    for (const w of [e.w, ...(e.pl ?? [])]) {
      const n = arabischNormal(w);
      if (n.length < 2) continue;
      muster.ganz.add(n);
      if (n.length >= 5) muster.anfang.push(n);
    }
}

/** kaikki-Einträge (ar) nach `rom`. */
function nachRom(daten: string): Map<string, KaikkiEintrag[]> {
  const m = new Map<string, KaikkiEintrag[]>();
  for (const e of ladeKaikki('ar', daten)) {
    if (!e.rom) continue;
    const k = e.rom.normalize('NFC').toLowerCase();
    m.set(k, [...(m.get(k) ?? []), e]);
  }
  return m;
}

/** Muster einer (ein- oder mehrwortigen) Umschrift; null, wenn ein Wort keinen Eintrag hat. */
function arabischeMuster(umschrift: string, rom: Map<string, KaikkiEintrag[]>, tabelle: Record<string, string>): ArMuster[] | null {
  const ergebnis: ArMuster[] = [];
  for (const wort of umschrift.split(/\s+/).filter(Boolean)) {
    const eintraege = romVarianten(wort, tabelle).flatMap((v) => rom.get(v) ?? []);
    if (!eintraege.length) return null;
    const m = leer();
    musterAus(eintraege, m);
    ergebnis.push(m);
  }
  return ergebnis;
}

// ——— Register aus kaikki: je Wortform über alle Einträge ———

const REGISTER_SCHIMPF = /^(?:vulgar|offensive|derogatory|slur|pejorative|ethnic)$/;
const REGISTER_SEX = /^thema:(?:sex|sexuality)$/;
const ANGABE_SCHIMPF = /vulgar|offensive|derogatory|slur|pejorative|ethnic/;
/** Angaben einer Bedeutung, die keine Gebrauchsangabe sind */
const GRAMMATIK = new Set(['plural', 'singular']);
const ohneAngabe = (r: string | undefined) => (r ?? '').split(/\s+/).every((x) => !x || GRAMMATIK.has(x));

/** Lesarten einer Wortform in einer Ausgabe: Einträge, deren Hauptbedeutung das Register trägt (je Kategorie), und übrige. */
type Lesarten = { markiert: Map<string, number>; ohne: number };

/**
 * Einträge einer Wortform: ganz markierte je Ausgabe (`q`) mit Kategorien, Ausgaben mit unmarkierter Bedeutung, Lesarten je
 * Ausgabe (für die Hinweise der Nebeneinträge).
 */
type FormSicht = { ganz: Map<string, Set<string>>; unmarkiert: Set<string>; lesarten: Map<string, Lesarten> };

/** Register einer Sprache: Treffer und Hinweise (Nebeneinträge mit überwiegend markierten Lesarten), je Wortform Kategorien. */
type RegisterSprache = { treffer: Map<string, string[]>; hinweise: Map<string, string[]> };

const normalCache = new Map<string, Map<string, string>>();
/** Normalform eines Worts aus dem Kernauszug (wie die Wörter der Texte); null, wenn es mehr als ein Wort ergibt. */
function einzeln(w: string, sprache: Sprache): string | null {
  let cache = normalCache.get(sprache);
  if (!cache) normalCache.set(sprache, (cache = new Map()));
  let f = cache.get(w);
  if (f === undefined) {
    f = sprache === 'ar' ? arabischNormal(w) : tabuWoerter(w, sprache).join(' ');
    cache.set(w, f);
  }
  return f && !f.includes(' ') && (sprache !== 'ar' || /^[\u0621-\u064A\u0671-\u06D3]+$/u.test(f)) ? f : null;
}

/** Wortarten des Kernauszugs, die keine Wörter im Sinne der Zerlegung sind */
const KEINE_WOERTER = new Set(['name', 'abbrev', 'character', 'symbol', 'prefix', 'suffix', 'intj', 'phrase', 'contraction', 'unknown']);

const bekanntCache = new Map<string, Set<string>>();
/**
 * Bekannte Wortformen einer Sprache (Stichwort, Plural, Beugungsformen des kaikki-Kernauszugs) in der Normalform des
 * Leitfadens; `nurWoerter`: ohne Namen, Abkürzungen, Zeichen und Affixe (`KEINE_WOERTER`). Einmal je Prozess wie die
 * Auszüge selbst (`ladeKaikki`).
 */
export function bekannteFormen(sprache: Sprache, daten: string, nurWoerter = false): Set<string> {
  const schluessel = `${sprache}|${daten}|${nurWoerter}`;
  const fertig = bekanntCache.get(schluessel);
  if (fertig) return fertig;
  const bekannt = new Set<string>();
  for (const e of ladeKaikki(sprache, daten))
    if (!nurWoerter || !KEINE_WOERTER.has(e.pos ?? 'unknown'))
      for (const w of [e.w, ...(e.pl ?? []), ...(e.kf ?? []).map(([f]) => f)]) {
        const f = einzeln(w, sprache);
        if (f) bekannt.add(f);
      }
  bekanntCache.set(schluessel, bekannt);
  return bekannt;
}

const wortartenCache = new Map<string, Map<string, Set<string>>>();
/**
 * Bekannte arabische Wörter für die Zerlegung (`arabischeKandidaten`): alle Formen und die Wortarten der Stichwörter (ohne
 * Namen usw.); auch für den Religionsbezug-Prüfer.
 */
export function arabischBekannt(daten: string): ArabischBekannt {
  let wortarten = wortartenCache.get(daten);
  if (!wortarten) {
    wortarten = new Map();
    for (const e of ladeKaikki('ar', daten))
      if (e.pos && !KEINE_WOERTER.has(e.pos))
        for (const w of [e.w, ...(e.pl ?? [])]) {
          const f = einzeln(w, 'ar');
          if (f) wortarten.set(f, (wortarten.get(f) ?? new Set<string>()).add(e.pos));
        }
    wortartenCache.set(daten, wortarten);
  }
  return { formen: bekannteFormen('ar', daten, true), wortarten };
}

const bedeutungCache = new Map<string, Map<string, Bedeutung>>();
/** Bedeutungen der türkischen Wortformen (Stichwort, Plural, Beugungsformen); einmal je Prozess. */
function tuerkischeBedeutungen(daten: string): Map<string, Bedeutung> {
  const fertig = bedeutungCache.get(daten);
  if (fertig) return fertig;
  const bedeutungen = new Map<string, Bedeutung>();
  for (const e of ladeKaikki('tr', daten)) {
    const tr = e.q === 'tr' ? (e.gl ?? []).filter(([, r]) => !/form-of|alt-of/.test(r ?? '')).map(([g]) => g) : [];
    const de = [...(e.q === 'de' ? (e.gl ?? []).map(([g]) => g) : []), ...(e.ue ?? []).filter(([l]) => l === 'de').map(([, w]) => w)];
    if (!tr.length && !de.length) continue;
    for (const w of [e.w, ...(e.pl ?? []), ...(e.kf ?? []).map(([f]) => f)]) {
      const f = einzeln(w, 'tr');
      if (!f) continue;
      const b = bedeutungen.get(f) ?? { tr: [], de: [] };
      bedeutungen.set(f, b);
      b.tr.push(...tr);
      b.de.push(...de);
    }
  }
  bedeutungCache.set(daten, bedeutungen);
  return bedeutungen;
}

const registerCache = new Map<string, RegisterSprache>();

/**
 * Register einer Sprache aus dem kaikki-Kernauszug: Wortform → Kategorien der Treffer bzw. der Hinweise; einmal je Prozess.
 * Lesart einer Form ist ein Eintrag mit Bedeutung (Stichwort oder Plural), beurteilt nach seiner Hauptbedeutung (der ersten,
 * Wiktionary ordnet nach Gebrauch). Ein Lemma ohne Register, dessen Beugungsform (`kf`) die Form ist, zählt in jeder Ausgabe
 * als Lesart ohne Register, weil die Ausgaben Beugungsformen verschieden vollständig führen (das Präteritum von „schreiben“
 * steht nur in der englischen).
 */
function registerAus(sprache: Sprache, daten: string, vorhanden: ReadonlySet<string>): RegisterSprache {
  const schluessel = `${sprache}|${daten}|${[...vorhanden].sort().join(',')}`;
  const fertig = registerCache.get(schluessel);
  if (fertig) return fertig;
  const formen = new Map<string, FormSicht>();
  /** Beugungsformen von Lemmata ohne Register (mit unmarkierter Bedeutung) */
  const gebeugt = new Set<string>();
  /** je Beugungsform: Anzahl Lemmata ohne Register, deren Stichwort und Plural sie nicht ist (fremde Lesarten) */
  const gebeugtFremd = new Map<string, number>();
  for (const e of ladeKaikki(sprache, daten)) {
    const stichwoerter = new Set([e.w, ...(e.pl ?? [])].map((w) => einzeln(w, sprache)).filter((f) => f !== null));
    const beugungen = new Set((e.kf ?? []).map(([w]) => einzeln(w, sprache)).filter((f) => f !== null));
    const mk = e.mk ?? [];
    const gefunden = mk.some((m) => REGISTER_SCHIMPF.test(m))
      ? 'fluchen_schimpfwoerter'
      : mk.some((m) => REGISTER_SEX.test(m))
        ? 'sexualitaet'
        : null;
    const kategorie = gefunden && vorhanden.has(gefunden) ? gefunden : null;
    const gl = (e.gl ?? []).filter(([, r]) => !/form-of|alt-of/.test(r ?? ''));
    const ganz =
      kategorie !== null &&
      gl.length > 0 &&
      (kategorie === 'sexualitaet' ? gl.length === 1 : gl.every(([, r]) => ANGABE_SCHIMPF.test(r ?? '')));
    const unmarkiert = !ganz && gl.some(([, r]) => ohneAngabe(r));
    if (unmarkiert && !gefunden)
      for (const f of beugungen) {
        gebeugt.add(f);
        if (!stichwoerter.has(f)) gebeugtFremd.set(f, (gebeugtFremd.get(f) ?? 0) + 1);
      }
    if (!gl.length) continue;
    // Hauptbedeutung mit Register: erste Bedeutung mit Schimpf-Angabe bzw. der Eintrag ganz markiert (sexualitaet)
    const hauptMarkiert = gefunden === 'sexualitaet' ? gl.length === 1 : gefunden !== null && ANGABE_SCHIMPF.test(gl[0]![1] ?? '');
    for (const f of stichwoerter) {
      const sicht = formen.get(f) ?? { ganz: new Map<string, Set<string>>(), unmarkiert: new Set<string>(), lesarten: new Map() };
      formen.set(f, sicht);
      if (ganz && kategorie) sicht.ganz.set(e.q, (sicht.ganz.get(e.q) ?? new Set<string>()).add(kategorie));
      else if (unmarkiert) sicht.unmarkiert.add(e.q);
      const l = sicht.lesarten.get(e.q) ?? { markiert: new Map<string, number>(), ohne: 0 };
      sicht.lesarten.set(e.q, l);
      if (!hauptMarkiert) l.ohne++;
      else if (kategorie) l.markiert.set(kategorie, (l.markiert.get(kategorie) ?? 0) + 1);
    }
  }
  const treffer = new Map<string, string[]>();
  const hinweise = new Map<string, string[]>();
  for (const [f, { ganz, unmarkiert, lesarten }] of formen) {
    if (!ganz.size) continue;
    const t = new Set<string>();
    if (!gebeugt.has(f)) for (const [q, ks] of ganz) if (!unmarkiert.has(q)) for (const k of ks) t.add(k);
    if (t.size) treffer.set(f, [...t]);
    // Nebeneintrag (Beugungsform eines Lemmas ohne Register, unmarkierter Eintrag derselben Ausgabe): ein Hinweis nur, wenn in
    // einer Ausgabe die Lesarten mit Register überwiegen; sonst ist die Hauptlesart unmarkiert und es bleibt still
    const fremd = gebeugtFremd.get(f) ?? 0;
    const h = new Set<string>();
    for (const ks of ganz.values())
      for (const k of ks)
        if (!t.has(k) && [...lesarten.values()].some(({ markiert, ohne }) => (markiert.get(k) ?? 0) > ohne + fremd)) h.add(k);
    if (h.size) hinweise.set(f, [...h]);
  }
  const ergebnis = { treffer, hinweise };
  registerCache.set(schluessel, ergebnis);
  return ergebnis;
}

/** Lexikon aus dem Leitfaden und dem kaikki-Kernauszug bauen (einmal je Lauf). */
export function baueTabuLexikon(leitfaden: Leitfaden, daten: string): TabuLexikon {
  const tabelle = leitfaden.umschrift.din_zu_wiktionary;
  const rom = nachRom(daten);
  const ohneMuster = new Map<string, number>();
  const kategorien: Kategorie[] = leitfaden.tabu.kategorien.map((k) => {
    const ar: ArRegeln = { muster: leer(), mehrdeutig: leer(), phrase: [], kontext: null };
    const zaehleFehlend = () => ohneMuster.set(k.id, (ohneMuster.get(k.id) ?? 0) + 1);
    for (const u of k.formen.ar.umschrift ?? []) {
      const m = arabischeMuster(u, rom, tabelle);
      if (!m) zaehleFehlend();
      else if (m.length === 1) {
        for (const x of m[0]!.ganz) ar.muster.ganz.add(x);
        ar.muster.anfang.push(...m[0]!.anfang);
      } else ar.phrase.push(m);
    }
    for (const u of k.formen.ar.phrase ?? []) {
      const m = arabischeMuster(u, rom, tabelle);
      if (m) ar.phrase.push(m);
      else zaehleFehlend();
    }
    for (const { umschrift } of k.formen.ar.mehrdeutig ?? []) {
      const m = arabischeMuster(umschrift, rom, tabelle);
      if (m?.length === 1) {
        for (const x of m[0]!.ganz) ar.mehrdeutig.ganz.add(x);
        ar.mehrdeutig.anfang.push(...m[0]!.anfang);
      } else if (!m) zaehleFehlend();
    }
    if (k.formen.ar.kontext_umschrift?.length) {
      ar.kontext = leer();
      for (const u of k.formen.ar.kontext_umschrift) {
        const m = arabischeMuster(u, rom, tabelle);
        if (m) for (const x of m) for (const g of x.ganz) ar.kontext.ganz.add(g);
      }
    }
    const ab = k.ab_stufe ? (k.ab_stufe.toLowerCase() as SprachStufe) : null;
    return { id: k.id, regel: k.regel, abStufe: ab, de: lateinRegeln(k.formen.de, 'de'), tr: lateinRegeln(k.formen.tr, 'tr'), ar };
  });

  const vorhanden = new Set(kategorien.map((k) => k.id));
  const register = {
    de: registerAus('de', daten, vorhanden),
    tr: registerAus('tr', daten, vorhanden),
    ar: registerAus('ar', daten, vorhanden),
  };
  return {
    kategorien,
    register: { de: register.de.treffer, tr: register.tr.treffer, ar: register.ar.treffer },
    registerHinweise: { de: register.de.hinweise, tr: register.tr.hinweise, ar: register.ar.hinweise },
    bekannt: { de: bekannteFormen('de', daten), tr: bekannteFormen('tr', daten) },
    woerter: { de: bekannteFormen('de', daten, true), tr: bekannteFormen('tr', daten, true) },
    arabisch: arabischBekannt(daten),
    bedeutungen: tuerkischeBedeutungen(daten),
    ohneMuster,
  };
}

// ——— Abgleich ———

const passtPhrasenwort = (token: string, p: string) =>
  token === p || (p.length >= 4 && token.startsWith(p.slice(0, -2)) && token.length <= p.length + 3);

function enthaeltFolge(tokens: readonly string[], phrase: readonly string[]): number {
  for (let i = 0; i + phrase.length <= tokens.length; i++) if (phrase.every((p, j) => passtPhrasenwort(tokens[i + j]!, p))) return i;
  return -1;
}

function ohnePhrasen(tokens: string[], phrasen: readonly string[][]): string[] {
  let t = tokens;
  for (const p of phrasen) {
    let i = enthaeltFolge(t, p);
    while (i >= 0) {
      t = [...t.slice(0, i), ...t.slice(i + p.length)];
      i = enthaeltFolge(t, p);
    }
  }
  return t;
}

/**
 * Wissen für Teilwörter an Morphemgrenzen: bekannte Wörter (`TabuLexikon.woerter`) und Bedeutungen türkischer Wörter.
 * `null`: strenger Abgleich ohne Morphologie (für die Bedeutungen selbst).
 */
type Morphologie = { woerter: ReadonlySet<string>; bedeutungen: ReadonlyMap<string, Bedeutung> } | null;

/** Trifft die `teil`-Form das Wort an einer Morphemgrenze (`deutscheMorphemgrenze`; tr hat keine `teil`-Formen)? */
function teilTrifft(t: string, x: string, sprache: 'de' | 'tr', m: Morphologie): boolean {
  for (let i = t.indexOf(x); i >= 0; i = t.indexOf(x, i + 1))
    if (!m || sprache !== 'de' || deutscheMorphemgrenze(t, i, m.woerter)) return true;
  return false;
}

/**
 * Türkisch: Ist das Wort `t` (beginnt mit der `anfang`-Form `a`) ein anderes, sachfremdes Wort? Es muss als längeres bekanntes
 * Wort mit Endungen lesbar sein (`tuerkischesLaengeresWort`), dieses Wort muss Definitionen der türkischen Ausgabe haben, und
 * weder sie noch seine deutschen Übersetzungen treffen die Kategorie (das Zahlwort 80 ja; das Wort für Bombardierung,
 * definiert über „bomba“, nein).
 */
function tuerkischSachfremd(k: Kategorie, t: string, a: string, m: NonNullable<Morphologie>): boolean {
  const lang = tuerkischesLaengeresWort(t, a, m.woerter);
  const b = lang ? m.bedeutungen.get(lang) : undefined;
  if (!b?.tr.length) return false;
  return (
    !b.tr.some((g) => woerterTreffen(k, 'tr', tabuWoerter(g, 'tr'), null)) &&
    !b.de.some((g) => woerterTreffen(k, 'de', tabuWoerter(g, 'de'), null))
  );
}

/** Trifft die Kategorie ein Wort (ohne Phrasen und Kontext)? */
function wortTrifft(k: Kategorie, sprache: 'de' | 'tr', t: string, m: Morphologie): boolean {
  const r = k[sprache];
  if (r.ausnahmen.some((a) => t.includes(a))) return false;
  return (
    r.wort.has(t) ||
    r.anfang.some((a) => t.startsWith(a) && !(m && sprache === 'tr' && tuerkischSachfremd(k, t, a, m))) ||
    r.teil.some((x) => teilTrifft(t, x, sprache, m))
  );
}

/** Trifft die Kategorie ein Wort oder eine Phrase der Wortfolge (ohne Kontext)? */
function woerterTreffen(k: Kategorie, sprache: 'de' | 'tr', alle: string[], m: Morphologie): boolean {
  const r = k[sprache];
  const tokens = ohnePhrasen(alle, r.phraseAusnahmen);
  return tokens.some((t) => wortTrifft(k, sprache, t, m)) || r.phrase.some((p) => enthaeltFolge(tokens, p) >= 0);
}

/** Trifft die Kategorie den Satz (Latein)? */
function trifftLatein(k: Kategorie, sprache: 'de' | 'tr', alle: string[], m: Morphologie): boolean {
  if (!woerterTreffen(k, sprache, alle, m)) return false;
  const r = k[sprache];
  return !r.kontext.length || alle.some((t) => r.kontext.some((x) => t.startsWith(x)));
}

/** Passt ein Muster auf ein Wort (`kandidaten`: seine Lesarten ohne Klitika)? */
const passtArabisch = (m: ArMuster, kandidaten: readonly string[]) =>
  kandidaten.some((k) => m.ganz.has(k) || m.anfang.some((a) => k.startsWith(a)));

/** `woerter`: je Wort die Lesarten ohne Klitika (`arabischeKandidaten` mit den bekannten Wörtern). */
function trifftArabisch(r: ArRegeln, woerter: readonly string[][]): 'treffer' | 'mehrdeutig' | null {
  const kontextOk = !r.kontext || woerter.some((k) => passtArabisch(r.kontext!, k));
  if (!kontextOk) return null;
  if (woerter.some((k) => passtArabisch(r.muster, k))) return 'treffer';
  for (const p of r.phrase)
    for (let i = 0; i + p.length <= woerter.length; i++) if (p.every((m, j) => passtArabisch(m, woerter[i + j]!))) return 'treffer';
  if (woerter.some((k) => passtArabisch(r.mehrdeutig, k))) return 'mehrdeutig';
  return null;
}

type Treffer = { kategorie: string; hinweis: boolean };

/** Treffer einer Wortfolge in der Normalform der Sprache (leere Wörter sind Lücken und treffen nichts). */
function trefferInWoertern(tokens: string[], sprache: Sprache, lexikon: TabuLexikon): Treffer[] {
  const ergebnis = new Map<string, boolean>();
  const kandidaten = tokens.map((t) => (!t ? [] : sprache === 'ar' ? arabischeKandidaten(t, lexikon.arabisch) : [t]));
  for (const k of lexikon.kategorien) {
    if (sprache === 'ar') {
      const t = trifftArabisch(k.ar, kandidaten);
      if (t) ergebnis.set(k.id, (ergebnis.get(k.id) ?? true) && t === 'mehrdeutig');
    } else if (trifftLatein(k, sprache, tokens, { woerter: lexikon.woerter[sprache], bedeutungen: lexikon.bedeutungen }))
      ergebnis.set(k.id, false);
  }
  for (const c of kandidaten.flat()) {
    for (const kategorie of lexikon.registerHinweise[sprache].get(c) ?? []) if (!ergebnis.has(kategorie)) ergebnis.set(kategorie, true);
    for (const kategorie of lexikon.register[sprache].get(c) ?? []) ergebnis.set(kategorie, false);
  }
  return [...ergebnis].map(([kategorie, hinweis]) => ({ kategorie, hinweis }));
}

/** Treffer eines Texts: Kategorie und ob er nur ein Hinweis ist (mehrdeutig, Register-Nebeneintrag). */
export function tabuTreffer(text: string, sprache: Sprache, lexikon: TabuLexikon): Treffer[] {
  return trefferInWoertern(tabuWoerter(text, sprache), sprache, lexikon);
}

/**
 * Wörter eines Tipp-Fließtexts für die Prüfung in der Zielsprache: Was in der Tipp-Sprache ein bekanntes Wort ist, wird zur
 * Lücke; übrig bleiben die eingestreuten Wörter der Zielsprache (Arabisch als Tipp-Sprache: ohne Liste, s. o.).
 */
export function zielWoerter(text: string, tippSprache: Sprache, ziel: Sprache, lexikon: TabuLexikon): string[] {
  const bekannt = tippSprache === 'ar' ? null : lexikon.bekannt[tippSprache];
  return text
    .split(/\s+/u)
    .filter(Boolean)
    .flatMap((stueck) => {
      const eigen = bekannt ? tabuWoerter(stueck, tippSprache) : [];
      return eigen.length && eigen.every((w) => bekannt!.has(w)) ? [''] : tabuWoerter(stueck, ziel);
    });
}

/** Treffer eines Texts in seiner Sprache; Tipps wie oben (Zitatblock in der Zielsprache, Fließtext je Sprache). */
export function tabuTrefferEintrag(t: TextEintrag, lexikon: TabuLexikon): Treffer[] {
  if (t.art !== 'tipp' || t.sprache === t.kurs) return tabuTreffer(t.text, t.sprache, lexikon);
  if (t.beispiel) return tabuTreffer(t.text, t.kurs, lexikon);
  return [
    ...tabuTreffer(t.text, t.sprache, lexikon),
    ...trefferInWoertern(zielWoerter(t.text, t.sprache, t.kurs, lexikon), t.kurs, lexikon),
  ];
}

/** Tabu-Prüfung aller Texte (Befunde `mensch` bzw. `warnung`, nur mit Kategorie-ID). */
export function pruefeTabu(texte: readonly TextEintrag[], lexikon: TabuLexikon): Befunde {
  const b = new Befunde('tabu');
  const regeln = new Map(lexikon.kategorien.map((k) => [k.id, k]));
  // je Datei, Ort und Kategorie ein Befund; ein Treffer schlägt einen Hinweis (Tipps haben mehrere Texte je Ort)
  const befunde = new Map<string, { t: TextEintrag; kategorie: string; hinweis: boolean }>();
  for (const t of texte)
    for (const { kategorie, hinweis } of tabuTrefferEintrag(t, lexikon)) {
      const schluessel = `${t.datei}|${t.ort}|${kategorie}`;
      const alt = befunde.get(schluessel);
      if (!alt) befunde.set(schluessel, { t, kategorie, hinweis });
      else if (alt.hinweis && !hinweis) befunde.set(schluessel, { ...alt, t, hinweis });
    }
  for (const { t, kategorie, hinweis } of befunde.values()) {
    const k = regeln.get(kategorie);
    const unterStufe = k?.abStufe ? SPRACH_STUFEN.indexOf(t.stufe) < SPRACH_STUFEN.indexOf(k.abStufe) : false;
    const mensch =
      !hinweis && (!k || k.regel === 'verboten' || k.regel === 'offene_frage' || (k.regel === 'nur_sachlich' && (unterStufe || t.kinder)));
    if (mensch) b.mensch(t.datei, `Inhaltsleitfaden: Treffer (Regel ${k?.regel ?? 'verboten'}) – menschlich_klaeren`, t.ort, kategorie);
    else
      b.warnung(
        t.datei,
        hinweis ? 'Inhaltsleitfaden: möglicher Treffer (mehrdeutig)' : 'Inhaltsleitfaden: nur sachlich, nicht als Normalität',
        t.ort,
        kategorie,
      );
  }
  for (const [kategorie, n] of lexikon.ohneMuster)
    b.warnung(
      'rahmen/leitfaden.json',
      `${n} arabische Umschriften ohne Eintrag im kaikki-Kernauszug (Sprachprüfung, LM-01)`,
      undefined,
      kategorie,
    );
  return b;
}
