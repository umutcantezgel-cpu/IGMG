import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import { enthaeltArabisch } from '@/lib/lernapp/waechter/kern.mjs';
import { DACHVERBAND_BEISPIEL } from '../../drizzle/seeds/bereiche/dachverband';
import { BEISPIEL_NACHRICHTEN } from '../../drizzle/seeds/daten/nachrichten';
import { BEISPIEL_VERANSTALTUNG_DETAIL } from '../../drizzle/seeds/daten/veranstaltung-detail';
import { BEISPIEL_VERANSTALTUNGEN } from '../../drizzle/seeds/daten/veranstaltungen';
import { PROJEKTE_BEISPIEL } from '../../drizzle/seeds/bereiche/projekte';
import { ZEITLEISTE_EROEFFNUNG } from '../../drizzle/seeds/bereiche/ueber-uns';

/**
 * Wächter für Inhalte (Plan Marktstart, Welle 1 – Schutztests zuerst): Seeds (`drizzle/seeds/**`, Quelltext) und Texte
 * (`messages/bereiche/*.json`, `messages/{de,tr,en}.json`) enthalten
 * (a) keine deutschen Mobilnummern (G-04),
 * (b) keine arabische Schrift außer an den unten begründeten Stellen (G-06; Verse, Hadithe und Bittgebete schreibt kein
 *     Agent – Korantext kommt nur aus `web/daten`; Lern-App-Inhalte liegen nicht hier),
 * (c) zu jedem deutschen Platzhalter „[…]“ auch in Türkisch und Englisch einen Platzhalter an derselben Stelle (G-05),
 * (d) in Türkisch und Englisch kein ß/ä und keine deutschen Füllwörter (K-02). Platzhalter in eckigen Klammern sind
 *     redaktionelle Marker und zählen hier nicht; Eigennamen stehen begründet in der Ausnahmeliste,
 * (e) „Aus dem Dachverband“ (Marktstart P3, G-06): Freitagspredigten ohne Kurztext, keine Versangaben und keine
 *     Anführungszeichen (Zitate) in Titeln und Kurztexten.
 * Mehrsprachige Seed-Objekte `{ de, tr, en }` kommen aus den exportierten Konstanten (Import) und, für alle übrigen, aus
 * dem TypeScript-Syntaxbaum der Seed-Dateien (Zeichenketten, Konstanten derselben Datei, Aufrufe mit Zeichenketten).
 * Jede Ausnahme muss noch greifen – sonst wird sie gemeldet und gehört gelöscht.
 */
const WEB = join(import.meta.dirname, '..', '..');
const SPRACHEN = ['de', 'tr', 'en'] as const;
type Sprache = (typeof SPRACHEN)[number];

const MOBIL = /\+49\s?1[5-7]\d|\b01[5-7]\d/;
const PLATZHALTER = /\[[^\]\n]+\]/;
const PLATZHALTER_ALLE = /\[[^\]\n]+\]/g;
const DEUTSCH = /(?<![\p{L}\p{N}])(und|der|das|nicht|demnach|werden)(?![\p{L}\p{N}])/iu;
const UMLAUT = /[ßä]/i;
/** Versangabe wie „49:6“ und Anführungszeichen (Zitat) – unabhängig vom Schema formuliert, damit der Wächter selbst prüft. */
const VERSANGABE = /\b\d{1,3}\s?:\s?\d{1,3}\b/;
const ZITAT = /[„“”"«»‚]/;

/** Arabische Schrift ist hier erlaubt (Fundstelle `<datei>:<sprache>.<schlüssel>`). */
const ARABISCH_ERLAUBT: { ort: RegExp; grund: string }[] = [
  {
    ort: /^messages\/bereiche\/anzeige\.json:(de|tr|en)\.anzeige\.arabisch\.(imsak|gunes|ogle|ikindi|aksam|yatsi)$/,
    grund:
      'Namen der sechs Gebetszeiten in arabischer Schrift auf dem Bildschirm der Moschee (Design der Anzeige); Bezeichnungen, keine Verse, Hadithe oder Bittgebete.',
  },
  {
    ort: /^drizzle\/seeds\/lernapp-test\.ts:\d+$/,
    grund:
      'Testkurs der Lern-App (nur E2E, ADR 0039 Nr. 11): arabische Alltagswörter als Codepunkte, ohne Religionsbezug; Lern-App-Inhalte prüft der Religionswächter (KERN 4.0 §3), nicht dieser Test.',
  },
];

/** Deutsche Texte in tr/en mit Absicht (Fundstelle wie oben). */
const SPRACHE_ERLAUBT: { ort: RegExp; grund: string }[] = [
  {
    ort: /^messages\/(tr|en)\.json:(tr|en)\.hinweis\.(titelDe|textDe|blockDe|knopfDe|einmalDe|de\d)$/,
    grund: 'Der Konzept-Hinweis zeigt in jeder Sprache zusätzlich die deutsche Fassung (KonzeptHinweis.tsx, Seitenrahmen).',
  },
  {
    ort: /^messages\/en\.json:en\.sprachwahl\.(aendern|titelZweit)$/,
    grund: 'Die Sprachwahl ist zweisprachig beschriftet, damit Deutschsprachige von der englischen Seite zurückfinden.',
  },
];

/** Eigennamen, die vor der Sprachprüfung entfallen (sie bleiben in jeder Sprache gleich). */
const EIGENNAMEN: { muster: RegExp; grund: string }[] = [
  { muster: /\p{L}+straße/gu, grund: 'Straßennamen in Wetzlar (Formerstraße, Garbenheimerstraße, Philipsstraße) sind Eigennamen.' },
];

type Fund = { ort: string; wert: string };

const dateien = (ordner: string, endung: RegExp): string[] =>
  readdirSync(ordner).flatMap((n) => {
    const p = join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p, endung) : endung.test(n) ? [p] : [];
  });
const rel = (p: string) => relative(WEB, p).split('\\').join('/');

// ——— Texte (messages) ———

/** Flache Schlüssel einer Sprache: `<namensraum>.<pfad>` → Text. */
function flach(wert: unknown, pfad: string, ziel: Map<string, string>): Map<string, string> {
  if (typeof wert === 'string') ziel.set(pfad, wert);
  else if (Array.isArray(wert)) wert.forEach((w, i) => flach(w, `${pfad}.${i}`, ziel));
  else if (wert && typeof wert === 'object') for (const [k, w] of Object.entries(wert)) flach(w, pfad ? `${pfad}.${k}` : k, ziel);
  return ziel;
}

const lies = (p: string): unknown => JSON.parse(readFileSync(p, 'utf8'));
const TEXTQUELLEN: { datei: (s: Sprache) => string; texte: Record<Sprache, Map<string, string>> }[] = [
  ...dateien(join(WEB, 'messages', 'bereiche'), /\.json$/).map((p) => {
    const inhalt = lies(p) as Record<Sprache, unknown>;
    return {
      datei: () => rel(p),
      texte: Object.fromEntries(SPRACHEN.map((s) => [s, flach(inhalt[s], '', new Map())])) as Record<Sprache, Map<string, string>>,
    };
  }),
  {
    datei: (s: Sprache) => `messages/${s}.json`,
    texte: Object.fromEntries(SPRACHEN.map((s) => [s, flach(lies(join(WEB, 'messages', `${s}.json`)), '', new Map())])) as Record<
      Sprache,
      Map<string, string>
    >,
  },
];
/** Alle Texte mit Fundstelle `<datei>:<sprache>.<schlüssel>`; die Verwaltung (nur Deutsch, ADR 0016) ist nicht öffentlich. */
const TEXTE: (Fund & { sprache: Sprache; datei: string; schluessel: string })[] = TEXTQUELLEN.flatMap((q) =>
  SPRACHEN.flatMap((s) =>
    [...q.texte[s]]
      .filter(([k]) => !k.startsWith('verwaltung.'))
      .map(([schluessel, wert]) => ({ ort: `${q.datei(s)}:${s}.${schluessel}`, wert, sprache: s, datei: q.datei(s), schluessel })),
  ),
);

// ——— Seeds (Quelltext) ———

const SEED_DATEIEN = dateien(join(WEB, 'drizzle', 'seeds'), /\.ts$/);
const SEED_ZEILEN: Fund[] = SEED_DATEIEN.flatMap((p) =>
  readFileSync(p, 'utf8')
    .split('\n')
    .map((wert, i) => ({ ort: `${rel(p)}:${i + 1}`, wert })),
);

type Mehrsprachig = { ort: string; werte: Partial<Record<Sprache, string>> };

/** Text eines Werts: Zeichenkette oder Liste von Zeichenketten (Absätze). */
const alsText = (w: unknown): string | undefined =>
  typeof w === 'string' ? w : Array.isArray(w) && w.every((x) => typeof x === 'string') ? w.join('\n') : undefined;

/** Mehrsprachige Objekte (mit `de` und `tr` oder `en`) in importierten Seed-Konstanten. */
function ausKonstanten(wert: unknown, ort: string, ziel: Mehrsprachig[] = []): Mehrsprachig[] {
  if (Array.isArray(wert)) wert.forEach((w, i) => ausKonstanten(w, `${ort}[${i}]`, ziel));
  else if (wert && typeof wert === 'object') {
    const o = wert as Record<string, unknown>;
    const werte = Object.fromEntries(SPRACHEN.flatMap((s) => (alsText(o[s]) === undefined ? [] : [[s, alsText(o[s])]])));
    if ('de' in werte && ('tr' in werte || 'en' in werte)) ziel.push({ ort, werte });
    for (const [k, w] of Object.entries(o)) ausKonstanten(w, `${ort}.${k}`, ziel);
  }
  return ziel;
}

/** Mehrsprachige Objektliterale im Syntaxbaum einer Seed-Datei; nicht auflösbare Werte entfallen. */
function ausQuelltext(datei: string): Mehrsprachig[] {
  const quelle = ts.createSourceFile(datei, readFileSync(datei, 'utf8'), ts.ScriptTarget.Latest, true);
  const konstanten = new Map<string, ts.Expression>();
  const sammle = (n: ts.Node): void => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.initializer) konstanten.set(n.name.text, n.initializer);
    n.forEachChild(sammle);
  };
  sammle(quelle);
  const text = (n: ts.Expression, tiefe = 0): string | undefined => {
    if (tiefe > 5) return undefined;
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
    if (ts.isTemplateExpression(n)) return n.head.text + n.templateSpans.map((s) => ` ${s.literal.text}`).join('');
    if (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isSatisfiesExpression(n)) return text(n.expression, tiefe + 1);
    if (ts.isIdentifier(n)) {
      const k = konstanten.get(n.text);
      return k ? text(k, tiefe + 1) : undefined;
    }
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const [l, r] = [text(n.left, tiefe + 1), text(n.right, tiefe + 1)];
      return l === undefined || r === undefined ? undefined : l + r;
    }
    const teile = ts.isArrayLiteralExpression(n) ? n.elements : ts.isCallExpression(n) ? n.arguments : undefined;
    if (!teile) return undefined;
    const t = teile.map((e) => text(e, tiefe + 1));
    return t.length && t.every((x) => x !== undefined) ? t.join('\n') : undefined;
  };
  const gefunden: Mehrsprachig[] = [];
  const geh = (n: ts.Node): void => {
    if (ts.isObjectLiteralExpression(n)) {
      const werte: Partial<Record<Sprache, string>> = {};
      for (const p of n.properties) {
        if (!ts.isPropertyAssignment(p) || !(ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) continue;
        const s = p.name.text as Sprache;
        if (!SPRACHEN.includes(s)) continue;
        const t = text(p.initializer);
        if (t !== undefined) werte[s] = t;
      }
      if ('de' in werte && ('tr' in werte || 'en' in werte))
        gefunden.push({ ort: `${rel(datei)}:${quelle.getLineAndCharacterOfPosition(n.getStart()).line + 1}`, werte });
    }
    n.forEachChild(geh);
  };
  geh(quelle);
  return gefunden;
}

const SEED_OBJEKTE: Mehrsprachig[] = [
  ...ausKonstanten(BEISPIEL_NACHRICHTEN, 'BEISPIEL_NACHRICHTEN'),
  ...ausKonstanten(BEISPIEL_VERANSTALTUNGEN, 'BEISPIEL_VERANSTALTUNGEN'),
  ...ausKonstanten(BEISPIEL_VERANSTALTUNG_DETAIL, 'BEISPIEL_VERANSTALTUNG_DETAIL'),
  ...ausKonstanten(PROJEKTE_BEISPIEL, 'PROJEKTE_BEISPIEL'),
  ...ausKonstanten(ZEITLEISTE_EROEFFNUNG, 'ZEITLEISTE_EROEFFNUNG'),
  ...SEED_DATEIEN.flatMap(ausQuelltext),
];

// ——— Regeln ———

/** Sprachbefund eines tr/en-Texts ohne Platzhalter und Eigennamen; sonst null. */
function sprachBefund(wert: string, genutzt: Set<number>): string | null {
  let rest = wert.replace(PLATZHALTER_ALLE, ' ');
  EIGENNAMEN.forEach(({ muster }, i) => {
    const ohne = rest.replace(muster, ' ');
    if (ohne !== rest) genutzt.add(i);
    rest = ohne;
  });
  return (UMLAUT.exec(rest) ?? DEUTSCH.exec(rest))?.[0] ?? null;
}

const fundText = (f: Fund) => `${f.ort} – ${f.wert.trim().slice(0, 100)}`;

describe('Inhalte-Wächter: Seeds und Texte', () => {
  it('die Prüfung greift (Seeds, Bereichsdateien und Hauptdateien gefunden, Seed-Objekte erkannt)', () => {
    expect(SEED_DATEIEN.length).toBeGreaterThan(10);
    expect(TEXTQUELLEN.length).toBeGreaterThan(40);
    expect(SEED_OBJEKTE.length).toBeGreaterThan(200);
    expect(SEED_OBJEKTE.some((o) => o.ort.startsWith('PROJEKTE_BEISPIEL'))).toBe(true);
    // Gegenprobe der Regeln
    expect(MOBIL.test('Tel. +49 151 2345678')).toBe(true);
    expect(MOBIL.test('0176 1234567')).toBe(true);
    expect(MOBIL.test('+49 221 942240-100')).toBe(false);
    expect(enthaeltArabisch('\\u0627')).toBe(true);
    expect(sprachBefund('Formerstraße, Wetzlar', new Set())).toBeNull();
    expect(sprachBefund('[Zahl fehlt: Regionalverbände] bölge', new Set())).toBeNull();
    expect(sprachBefund('bir toplumu demnach tanımlar', new Set())).toBe('demnach');
    expect(sprachBefund('Under the order of the day', new Set())).toBeNull();
    expect(VERSANGABE.test('Sure Hudschurat, 49:6')).toBe(true);
    expect(VERSANGABE.test('Infak – barmherzig wirtschaften')).toBe(false);
    expect(ZITAT.test('„Zitat“')).toBe(true);
    expect(ZITAT.test('Women’s Organisation')).toBe(false);
    expect(DACHVERBAND_BEISPIEL.eintraege?.some((e) => e.art === 'hutba')).toBe(true);
  });

  it('(a) keine deutschen Mobilnummern (G-04)', () => {
    const funde = [...SEED_ZEILEN, ...TEXTE].filter((f) => MOBIL.test(f.wert));
    expect(funde.map(fundText)).toEqual([]);
  });

  it('(b) keine arabische Schrift außer an den begründeten Stellen (G-06)', () => {
    const genutzt = new Set<number>();
    const funde = [...SEED_ZEILEN, ...TEXTE].filter((f) => {
      if (!enthaeltArabisch(f.wert)) return false;
      const i = ARABISCH_ERLAUBT.findIndex((a) => a.ort.test(f.ort));
      if (i >= 0) genutzt.add(i);
      return i < 0;
    });
    expect(funde.map(fundText)).toEqual([]);
    expect(ARABISCH_ERLAUBT.filter((_, i) => !genutzt.has(i)).map((a) => `Ausnahme ohne Treffer: ${a.ort}`)).toEqual([]);
  });

  it('(c) Platzhalter-Parität: deutscher Platzhalter → auch Türkisch und Englisch mit Platzhalter (Texte)', () => {
    const funde: string[] = [];
    for (const q of TEXTQUELLEN)
      for (const [schluessel, de] of q.texte.de)
        if (PLATZHALTER.test(de) && !schluessel.startsWith('verwaltung.'))
          for (const s of ['tr', 'en'] as const)
            if (!PLATZHALTER.test(q.texte[s].get(schluessel) ?? ''))
              funde.push(`${q.datei(s)}:${s}.${schluessel} – de: ${de.slice(0, 80)}`);
    expect(funde).toEqual([]);
  });

  it('(c) Platzhalter-Parität in mehrsprachigen Seed-Objekten { de, tr, en }', () => {
    const funde = SEED_OBJEKTE.flatMap(({ ort, werte }) =>
      PLATZHALTER.test(werte.de ?? '')
        ? (['tr', 'en'] as const)
            .filter((s) => s in werte && !PLATZHALTER.test(werte[s] ?? ''))
            .map((s) => `${ort} ${s}: ${werte[s]?.slice(0, 80)}`)
        : [],
    );
    expect(funde).toEqual([]);
  });

  it('(d) Türkisch und Englisch ohne ß/ä und ohne deutsche Füllwörter (Texte und Seeds)', () => {
    const genutztEigen = new Set<number>();
    const genutzt = new Set<number>();
    const funde: string[] = [];
    for (const t of TEXTE) {
      if (t.sprache === 'de') continue;
      const befund = sprachBefund(t.wert, genutztEigen);
      if (!befund) continue;
      const i = SPRACHE_ERLAUBT.findIndex((a) => a.ort.test(t.ort));
      if (i >= 0) genutzt.add(i);
      else funde.push(`${t.ort} „${befund}“ – ${t.wert.slice(0, 80)}`);
    }
    for (const { ort, werte } of SEED_OBJEKTE)
      for (const s of ['tr', 'en'] as const) {
        const befund = werte[s] === undefined ? null : sprachBefund(werte[s], genutztEigen);
        if (befund) funde.push(`${ort} ${s} „${befund}“ – ${werte[s]?.slice(0, 80)}`);
      }
    expect(funde).toEqual([]);
    expect([
      ...SPRACHE_ERLAUBT.filter((_, i) => !genutzt.has(i)).map((a) => `Ausnahme ohne Treffer: ${a.ort}`),
      ...EIGENNAMEN.filter((_, i) => !genutztEigen.has(i)).map((e) => `Eigenname ohne Treffer: ${e.muster}`),
    ]).toEqual([]);
  });

  it('(e) Aus dem Dachverband: Freitagspredigten ohne Kurztext, keine Versangaben und keine Anführungszeichen (G-06)', () => {
    const funde = (DACHVERBAND_BEISPIEL.eintraege ?? []).flatMap((e) => {
      const f: string[] = [];
      if (e.art === 'hutba' && SPRACHEN.some((s) => e.kurztext?.[s]?.trim())) f.push(`${e.schluessel}: Hutba mit Kurztext`);
      for (const [feld, texte] of [
        ['titel', e.titel],
        ['kurztext', e.kurztext],
      ] as const)
        for (const s of SPRACHEN) {
          const text = texte?.[s];
          if (text && (VERSANGABE.test(text) || ZITAT.test(text))) f.push(`${e.schluessel} ${feld}.${s}: ${text.slice(0, 80)}`);
        }
      return f;
    });
    expect(funde).toEqual([]);
  });
});
