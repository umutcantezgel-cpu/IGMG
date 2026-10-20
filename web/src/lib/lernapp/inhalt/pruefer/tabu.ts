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
 * - **Register aus kaikki:** Einträge mit vulgar, offensive, derogatory, slur, pejorative oder ethnic treffen die Kategorie
 *   `fluchen_schimpfwoerter`, mit Thema sex/sexuality die Kategorie `sexualitaet` – aber nur, wenn alle Bedeutungen des
 *   Eintrags so markiert sind. Ein Register an einer Nebenbedeutung (z. B. eines Grundwortschatz-Worts) ist kein Treffer;
 *   sonst wären Alltagswörter dauerhaft Fehlalarme (Entscheidung L3-02, Standard bis zur Antwort der Redaktion, LM-09).
 *
 * **Ergebnis:** `verboten` und `offene_frage` → `menschlich_klaeren`; `nur_sachlich` → `menschlich_klaeren` unter `ab_stufe` oder
 * in kindgeeigneten Einheiten, sonst Hinweis. Ausgaben nennen nur Kategorie-IDs, nie die Wörter des Lexikons.
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

export type TabuLexikon = {
  kategorien: Kategorie[];
  /** Register-Treffer aus kaikki je Sprache: Wortform → {Kategorie, alle Bedeutungen markiert} */
  register: Record<Sprache, Map<string, { kategorie: string; voll: boolean }>>;
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

const REGISTER_SCHIMPF = /^(?:vulgar|offensive|derogatory|slur|pejorative|ethnic)$/;
const REGISTER_SEX = /^thema:(?:sex|sexuality)$/;

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

  const register = { de: new Map(), tr: new Map(), ar: new Map() } as TabuLexikon['register'];
  const vorhanden = new Set(kategorien.map((k) => k.id));
  for (const sprache of ['de', 'tr', 'ar'] as const)
    for (const e of ladeKaikki(sprache, daten)) {
      const mk = e.mk ?? [];
      const kategorie = mk.some((m) => REGISTER_SCHIMPF.test(m))
        ? 'fluchen_schimpfwoerter'
        : mk.some((m) => REGISTER_SEX.test(m))
          ? 'sexualitaet'
          : null;
      if (!kategorie || !vorhanden.has(kategorie)) continue;
      const gl = (e.gl ?? []).filter(([, r]) => !/form-of|alt-of/.test(r ?? ''));
      const voll =
        gl.length > 0 &&
        (kategorie === 'sexualitaet'
          ? gl.length === 1
          : gl.every(([, r]) => /vulgar|offensive|derogatory|slur|pejorative|ethnic/.test(r ?? '')));
      if (!voll) continue;
      for (const w of [e.w, ...(e.pl ?? [])]) {
        const f = sprache === 'ar' ? arabischNormal(w) : tabuWoerter(w, sprache).join(' ');
        if (!f || f.includes(' ')) continue;
        const alt = register[sprache].get(f);
        if (!alt || (!alt.voll && voll)) register[sprache].set(f, { kategorie, voll });
      }
    }
  return { kategorien, register, ohneMuster };
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

/** Treffer eines Texts: Kategorie und ob er nur ein Hinweis ist (mehrdeutig, Nebenbedeutung). */
export function tabuTreffer(text: string, sprache: Sprache, lexikon: TabuLexikon): { kategorie: string; hinweis: boolean }[] {
  const tokens = tabuWoerter(text, sprache);
  const ergebnis = new Map<string, boolean>();
  for (const k of lexikon.kategorien) {
    if (sprache === 'ar') {
      const t = trifftArabisch(k.ar, tokens);
      if (t) ergebnis.set(k.id, (ergebnis.get(k.id) ?? true) && t === 'mehrdeutig');
    } else if (trifftLatein(k[sprache], tokens)) ergebnis.set(k.id, false);
  }
  const register = lexikon.register[sprache];
  for (const t of tokens) {
    const kandidaten = sprache === 'ar' ? arabischeKandidaten(t) : [t];
    for (const c of kandidaten) {
      const r = register.get(c);
      if (r) ergebnis.set(r.kategorie, (ergebnis.get(r.kategorie) ?? true) && !r.voll);
    }
  }
  return [...ergebnis].map(([kategorie, hinweis]) => ({ kategorie, hinweis }));
}

/** Tabu-Prüfung aller Texte (Befunde `mensch` bzw. `warnung`, nur mit Kategorie-ID). */
export function pruefeTabu(texte: readonly TextEintrag[], lexikon: TabuLexikon): Befunde {
  const b = new Befunde('tabu');
  const regeln = new Map(lexikon.kategorien.map((k) => [k.id, k]));
  const gemeldet = new Set<string>();
  for (const t of texte) {
    const sprachen = t.art === 'tipp' ? [...new Set([t.sprache, t.kurs])] : [t.sprache];
    for (const sprache of sprachen)
      for (const { kategorie, hinweis } of tabuTreffer(t.text, sprache, lexikon)) {
        const schluessel = `${t.datei}|${t.ort}|${kategorie}`;
        if (gemeldet.has(schluessel)) continue;
        gemeldet.add(schluessel);
        const k = regeln.get(kategorie);
        const unterStufe = k?.abStufe ? SPRACH_STUFEN.indexOf(t.stufe) < SPRACH_STUFEN.indexOf(k.abStufe) : false;
        const mensch =
          !hinweis &&
          (!k || k.regel === 'verboten' || k.regel === 'offene_frage' || (k.regel === 'nur_sachlich' && (unterStufe || t.kinder)));
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
