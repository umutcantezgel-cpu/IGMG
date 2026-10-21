import { SPRACH_STUFEN, type Sprache } from '../../kurse';
import type { Leitfaden, TabuKategorie } from '../schema';
import { type KaikkiEintrag, ladeKaikki } from './daten';
import { arabischeKandidaten, arabischNormal } from './sprache';
import type { SprachStufe, TextEintrag } from './texte';
import { Befunde } from './typen';

/**
 * Prüfer „Inhaltsleitfaden (Tabu-Lexikon, LM-09)“ (PLAN §6.4: Befund → Mensch). Regeln aus `rahmen/leitfaden.json`
 * (`pruefung`, `tabu.kategorien`):
 *
 * - **Normalisierung:** de NFC, klein, ß → ss, Bindestrich trennt zusätzlich in Teilwörter; tr NFC, türkisch klein, ohne
 *   Zirkumflex, Apostroph vor Endungen entfernt; ar wie der Wächter (ohne Zeichen, Alif- und Ya-Formen vereinheitlicht),
 *   Klitika und Pronomen-Suffixe abgetrennt.
 * - **Prüfarten:** `teil` (Form im Wort), `anfang` (Wort beginnt mit der Form), `wort` (genau die Form), `phrase` (Wortfolge
 *   im Satz). Ein Wort mit einer `ausnahme` trifft in dieser Kategorie nicht; `phrase_ausnahmen` werden vorher aus dem Satz
 *   entfernt. Mit `kontext` zählt ein Treffer nur, wenn im selben Satz ein Kontextwort (Art `anfang`) steht.
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
 *   Register ist. Sonst ist der ganz markierte Eintrag ein Nebeneintrag und ergibt nur einen Hinweis (z. B. ein Adjektiv-Eintrag
 *   neben dem Grundwortschatz-Nomen, ein Nomen gleich einer Präteritumform). Einträge mit nur teils markierten Bedeutungen
 *   ergeben nichts: ein Register an einer Nebenbedeutung ist kein Treffer, sonst wären Alltagswörter dauerhaft Fehlalarme
 *   (Entscheidung L3-02, Standard bis zur Antwort der Redaktion, LM-09). Die Ausgaben zählen einzeln, weil sie Register
 *   verschieden auszeichnen (die deutsche und die türkische lassen derbe Wörter oft ohne Angabe); ein unmarkierter Eintrag
 *   einer anderen Ausgabe machte sonst echte Register-Wörter zum Hinweis.
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

export type RegisterTreffer = { kategorie: string; /** Treffer; sonst Hinweis (Nebeneintrag) */ voll: boolean };

export type TabuLexikon = {
  kategorien: Kategorie[];
  /** Register aus kaikki je Sprache: Wortform → Kategorien (geurteilt über alle Einträge der Form) */
  register: Record<Sprache, Map<string, RegisterTreffer[]>>;
  /** Bekannte Wortformen (Stichwort, Plural, Beugungsformen) im kaikki-Kernauszug – für den Fließtext der Tipps */
  bekannt: Record<'de' | 'tr', Set<string>>;
  /** Umschriften ohne Muster je Kategorie (nur Anzahl, ohne Wörter) */
  ohneMuster: Map<string, number>;
};

// ——— Normalisierung ———

const ZIRKUMFLEX: Record<string, string> = { â: 'a', î: 'i', û: 'u', Â: 'a', Î: 'i', Û: 'u' };

/** Wörter eines Texts in der Normalform des Leitfadens (de mit Teilwörtern am Bindestrich). */
export function tabuWoerter(text: string, sprache: Sprache): string[] {
  const t = text.normalize('NFC');
  if (sprache === 'ar')
    return t
      .split(/\s+/u)
      .flatMap((w) => arabischNormal(w).split(/[^\u0621-\u064A\u0671-\u06D3]+/u))
      .filter(Boolean);
  if (sprache === 'tr')
    return t
      .replace(/[âîûÂÎÛ]/g, (z) => ZIRKUMFLEX[z]!)
      .toLocaleLowerCase('tr')
      .replace(/['’]/g, '')
      .split(/[^\p{L}\p{N}-]+/u)
      .flatMap((w) => (w.includes('-') ? [w, ...w.split('-')] : [w]))
      .filter(Boolean);
  return t
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .split(/[^\p{L}\p{N}-]+/u)
    .flatMap((w) => (w.includes('-') ? [w.replace(/-/g, ''), ...w.split('-')] : [w]))
    .filter(Boolean);
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

/** Einträge einer Wortform: ganz markierte je Ausgabe (`q`) mit Kategorien, Ausgaben mit unmarkierter Bedeutung. */
type FormSicht = { ganz: Map<string, Set<string>>; unmarkiert: Set<string> };

type RegisterSprache = { register: Map<string, RegisterTreffer[]>; bekannt: Set<string> };
const registerCache = new Map<string, RegisterSprache>();

/**
 * Register und bekannte Wortformen (nur de/tr) einer Sprache aus dem kaikki-Kernauszug; einmal je Prozess wie die Auszüge
 * selbst (`ladeKaikki`).
 */
function registerAus(sprache: Sprache, daten: string, vorhanden: ReadonlySet<string>): RegisterSprache {
  const schluessel = `${sprache}|${daten}|${[...vorhanden].sort().join(',')}`;
  const fertig = registerCache.get(schluessel);
  if (fertig) return fertig;
  const normalformen = new Map<string, string>();
  const normal = (w: string) => {
    let f = normalformen.get(w);
    if (f === undefined) {
      f = sprache === 'ar' ? arabischNormal(w) : tabuWoerter(w, sprache).join(' ');
      normalformen.set(w, f);
    }
    return f;
  };
  const einzeln = (w: string) => {
    const f = normal(w);
    return f && !f.includes(' ') ? f : null;
  };
  const formen = new Map<string, FormSicht>();
  /** Beugungsformen von Lemmata ohne Register (mit unmarkierter Bedeutung) */
  const gebeugt = new Set<string>();
  const bekannt = new Set<string>();
  for (const e of ladeKaikki(sprache, daten)) {
    const stichwoerter = [e.w, ...(e.pl ?? [])];
    const beugungen = (e.kf ?? []).map(([f]) => f);
    if (sprache !== 'ar')
      for (const w of [...stichwoerter, ...beugungen]) {
        const f = einzeln(w);
        if (f) bekannt.add(f);
      }
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
      for (const w of beugungen) {
        const f = einzeln(w);
        if (f) gebeugt.add(f);
      }
    if (!ganz && !unmarkiert) continue;
    for (const w of stichwoerter) {
      const f = einzeln(w);
      if (!f) continue;
      const sicht = formen.get(f) ?? { ganz: new Map<string, Set<string>>(), unmarkiert: new Set<string>() };
      formen.set(f, sicht);
      if (ganz && kategorie) sicht.ganz.set(e.q, (sicht.ganz.get(e.q) ?? new Set<string>()).add(kategorie));
      else sicht.unmarkiert.add(e.q);
    }
  }
  const register = new Map<string, RegisterTreffer[]>();
  for (const [f, { ganz, unmarkiert }] of formen) {
    if (!ganz.size) continue;
    const kategorien = new Map<string, boolean>();
    for (const [q, ks] of ganz)
      for (const k of ks) kategorien.set(k, (kategorien.get(k) ?? false) || (!gebeugt.has(f) && !unmarkiert.has(q)));
    register.set(
      f,
      [...kategorien].map(([kategorie, voll]) => ({ kategorie, voll })),
    );
  }
  const ergebnis = { register, bekannt };
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
  const de = registerAus('de', daten, vorhanden);
  const tr = registerAus('tr', daten, vorhanden);
  const ar = registerAus('ar', daten, vorhanden);
  return {
    kategorien,
    register: { de: de.register, tr: tr.register, ar: ar.register },
    bekannt: { de: de.bekannt, tr: tr.bekannt },
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

/** Trifft die Kategorie den Satz (Latein)? */
function trifftLatein(r: LateinRegeln, alle: string[]): boolean {
  const tokens = ohnePhrasen(alle, r.phraseAusnahmen);
  const wortTreffer = tokens.some((t) => {
    if (r.ausnahmen.some((a) => t.includes(a))) return false;
    return r.wort.has(t) || r.anfang.some((a) => t.startsWith(a)) || r.teil.some((x) => t.includes(x));
  });
  const treffer = wortTreffer || r.phrase.some((p) => enthaeltFolge(tokens, p) >= 0);
  if (!treffer) return false;
  return !r.kontext.length || alle.some((t) => r.kontext.some((k) => t.startsWith(k)));
}

const passtArabisch = (m: ArMuster, token: string) =>
  arabischeKandidaten(token).some((k) => m.ganz.has(k) || m.anfang.some((a) => k.startsWith(a)));

function trifftArabisch(r: ArRegeln, tokens: string[]): 'treffer' | 'mehrdeutig' | null {
  const kontextOk = !r.kontext || tokens.some((t) => passtArabisch(r.kontext!, t));
  if (!kontextOk) return null;
  if (tokens.some((t) => passtArabisch(r.muster, t))) return 'treffer';
  for (const p of r.phrase)
    for (let i = 0; i + p.length <= tokens.length; i++) if (p.every((m, j) => passtArabisch(m, tokens[i + j]!))) return 'treffer';
  if (tokens.some((t) => passtArabisch(r.mehrdeutig, t))) return 'mehrdeutig';
  return null;
}

type Treffer = { kategorie: string; hinweis: boolean };

/** Treffer einer Wortfolge in der Normalform der Sprache (leere Wörter sind Lücken und treffen nichts). */
function trefferInWoertern(tokens: string[], sprache: Sprache, lexikon: TabuLexikon): Treffer[] {
  const ergebnis = new Map<string, boolean>();
  for (const k of lexikon.kategorien) {
    if (sprache === 'ar') {
      const t = trifftArabisch(k.ar, tokens);
      if (t) ergebnis.set(k.id, (ergebnis.get(k.id) ?? true) && t === 'mehrdeutig');
    } else if (trifftLatein(k[sprache], tokens)) ergebnis.set(k.id, false);
  }
  const register = lexikon.register[sprache];
  for (const t of tokens) {
    if (!t) continue;
    const kandidaten = sprache === 'ar' ? arabischeKandidaten(t) : [t];
    for (const c of kandidaten)
      for (const r of register.get(c) ?? []) ergebnis.set(r.kategorie, (ergebnis.get(r.kategorie) ?? true) && !r.voll);
  }
  return [...ergebnis].map(([kategorie, hinweis]) => ({ kategorie, hinweis }));
}

/** Treffer eines Texts: Kategorie und ob er nur ein Hinweis ist (mehrdeutig, Nebeneintrag). */
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
        hinweis
          ? 'Inhaltsleitfaden: möglicher Treffer (mehrdeutig bzw. Nebenbedeutung)'
          : 'Inhaltsleitfaden: nur sachlich, nicht als Normalität',
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
