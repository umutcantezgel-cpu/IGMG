// Testkurs der Lern-App (PLAN §3.11, §13; ADR 0039 Nr. 11): je Zielsprache eine kleine Einheit mit neutralen
// Alltagssätzen, Übersetzungen für alle sechs Richtungen, die Übungstypen aus L1 (Auswahl, Wortbank, Paare; Lektionen l01,
// l02) und je eine Aufgabe der Typen aus L2-01 (Lektion l03: Bildkarte, Freitext, Hören ohne und mit Ton, Diktat,
// Minimalpaar, Lücke, Satzbau, Formen, im Arabischen Harakat).
// Nur für Beispielmodus, E2E und Tests – nie in der Produktion: `pnpm lernapp:import --testkurs` (Bau ohne Datenbank,
// scripts/bau-datenbank.mjs; E2E-Datenbank), nicht `pnpm db:seed`.
// - KEIN Religionsbezug, keine Formeln, keine Koran- oder Hadith-Wörter (KI-Regel 2, KERN 4.0 §2). Sätze mit höchstens drei
//   Wörtern (kein 4-Gramm möglich, KERN 4.0 §3 b/c).
// - Arabisch nur als Codepunkt-Escapes (KERN 4.0 §3: arabische Schrift nicht in Code-Dateien).
// - Audio: synthetische Töne in `drizzle/seeds/lernapp-testaudio/<sprache>/<einheit>-<sha16>.lpa` (erzeugt mit
//   `pnpm exec tsx scripts/lernapp/testaudio.ts`, ffmpeg nur lokal), Stimme `test:ton` – nie Rezitationen. Satz s0004
//   bekommt absichtlich keinen Ton (Hörübung „Audio folgt“, KERN 4.0 §4).
// - Bildkarten: Motive aus `inhalte/lernapp/symbole/symbole.json` (im Testkurs auch ohne Freigabe der Redaktion).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Datenbank } from '../../src/lib/db';
import { schema } from '../../src/lib/db';
import { type ImportBericht, importiereLernapp, type ImportQuelle } from '../../src/lib/lernapp/inhalt/import';
import type { SprachEinheitDatei, UebersetzungDatei } from '../../src/lib/lernapp/inhalt/schema';
import type { Sprache } from '../../src/lib/lernapp/kurse';
import { leseBuendelKopf, leseBuendelPfad } from '../../src/lib/lernapp/paket/buendel';
import { sha256Hex } from '../../src/lib/lernapp/paket/hash';

/** Ablage der synthetischen Testbündel (Route `/lern-app/audio/[...pfad]` liest dort ohne Blob-Speicher). */
export const TESTAUDIO_VERZEICHNIS = join(import.meta.dirname, 'lernapp-testaudio');
export const TEST_STIMME = 'test:ton';
const QUELLE = 'test:lernapp-testkurs';
const LIZENZ = 'CC-BY-SA-4.0' as const;

type Woerter = {
  w001: string;
  w002: string;
  w003: string;
  w004: string;
  w005: string;
  s0001: string;
  s0002: string;
  s0003: string;
  s0004: string;
};

/** Dieselben neutralen Inhalte in den drei Sprachen: Wasser, Brot, Haus, Buch, trinken; vier kurze Sätze. */
export const TEXTE: Record<Sprache, Woerter> = {
  de: {
    w001: 'Wasser',
    w002: 'Brot',
    w003: 'Haus',
    w004: 'Buch',
    s0001: 'Ich trinke Wasser.',
    s0002: 'Das Haus ist groß.',
    s0003: 'Das Buch ist neu.',
    w005: 'trinken',
    s0004: 'Das Brot ist frisch.',
  },
  tr: {
    w001: 'su',
    w002: 'ekmek',
    w003: 'ev',
    w004: 'kitap',
    s0001: 'Su içiyorum.',
    s0002: 'Ev büyük.',
    s0003: 'Kitap yeni.',
    w005: 'içmek',
    s0004: 'Ekmek taze.',
  },
  ar: {
    w001: '\u0645\u064E\u0627\u0621',
    w002: '\u062E\u064F\u0628\u0652\u0632',
    w003: '\u0628\u064E\u064A\u0652\u062A',
    w004: '\u0643\u0650\u062A\u064E\u0627\u0628',
    s0001:
      '\u0623\u064E\u0646\u064E\u0627 \u0623\u064E\u0634\u0652\u0631\u064E\u0628\u064F \u0627\u0644\u0652\u0645\u064E\u0627\u0621\u064E.',
    s0002: '\u0627\u0644\u0652\u0628\u064E\u064A\u0652\u062A\u064F \u0643\u064E\u0628\u0650\u064A\u0631\u064C.',
    s0003: '\u0627\u0644\u0652\u0643\u0650\u062A\u064E\u0627\u0628\u064F \u062C\u064E\u062F\u0650\u064A\u062F\u064C.',
    w005: '\u0634\u064E\u0631\u0650\u0628\u064E',
    s0004: '\u0627\u0644\u0652\u062E\u064F\u0628\u0652\u0632\u064F \u0637\u064E\u0627\u0632\u064E\u062C\u064C.',
  },
};

/** Weitere angenommene Fassungen (Wortbank in die Sprache, Übersetzung in die Ausgangssprache). */
const ALTERNATIVEN: Partial<Record<Sprache, Partial<Record<keyof Woerter, string[]>>>> = {
  tr: { s0001: ['Ben su içiyorum.'], s0002: ['Ev büyüktür.'] },
};

/** Wörter nur einer Zielsprache, ohne Übersetzung (Minimalpaare: tr ü/u, de kurz/lang, ar ḥāʾ/hāʾ). */
const EIGENE: Record<Sprache, { m001: string; m002: string }> = {
  de: { m001: 'Stadt', m002: 'Staat' },
  tr: { m001: 'üç', m002: 'uç' },
  ar: { m001: '\u062D\u064E\u0627\u0644', m002: '\u0647\u064E\u0627\u0644' },
};

/** Texte ohne Clip (Hörübung „Audio folgt“). */
const OHNE_TON: readonly (keyof Woerter)[] = ['s0004'];

/** Motive der Bildkarten (Register `inhalte/lernapp/symbole/symbole.json`). */
const SYMBOL: Partial<Record<keyof Woerter, string>> = { w001: 'wasserglas', w003: 'haus', w004: 'buch' };

/** Formentabelle (Präsens von „trinken“) je Zielsprache: Köpfe, Formen (die erste ist vorgegeben). */
const FORMEN: Record<Sprache, { zeilen: string[]; spalte: string; formen: string[] }> = {
  de: { zeilen: ['ich', 'du', 'er'], spalte: 'Präsens', formen: ['trinke', 'trinkst', 'trinkt'] },
  tr: { zeilen: ['ben', 'sen', 'o'], spalte: 'şimdiki zaman', formen: ['içiyorum', 'içiyorsun', 'içiyor'] },
  ar: {
    zeilen: ['\u0623\u064E\u0646\u064E\u0627', '\u0623\u064E\u0646\u0652\u062A\u064E', '\u0647\u064F\u0648\u064E'],
    spalte: '\u0627\u0644\u0652\u0645\u064F\u0636\u064E\u0627\u0631\u0650\u0639',
    formen: [
      '\u0623\u064E\u0634\u0652\u0631\u064E\u0628\u064F',
      '\u062A\u064E\u0634\u0652\u0631\u064E\u0628\u064F',
      '\u064A\u064E\u0634\u0652\u0631\u064E\u0628\u064F',
    ],
  },
};

/** Lücke in Satz s0001 (Wort 1, das Verb): Ablenker für die Wahl; im Arabischen Freitext. */
const LUECKE_ABLENKER: Record<Sprache, string[] | null> = {
  de: ['trinkst', 'trinkt'],
  tr: ['içiyorsun', 'içiyor'],
  ar: null,
};

/** Harakat: falsch vokalisierte Schreibungen von w004 (gleiches Gerüst). */
const HARAKAT_VARIANTEN = ['\u0643\u064E\u062A\u064E\u0627\u0628', '\u0643\u0650\u062A\u0650\u0627\u0628'];

const THEMA = { de: 'Testeinheit: Alltag', tr: 'Test ünitesi: Gündelik hayat' };

const einheitVon = (kurs: Sprache) => `${kurs}.a1.e01`;

export function sprachDatei(kurs: Sprache): SprachEinheitDatei {
  const e = einheitVon(kurs);
  const t = TEXTE[kurs];
  const k = (x: string) => `${e}.${x}`;
  return {
    format: 'igmg-lernapp-sprache',
    version: 1,
    status: 'automatisch_geprueft',
    kurs,
    stufe: 'a1',
    einheit: { schluessel: e, reihenfolge: 1, thema: THEMA },
    lemmata: [
      ...(['w001', 'w002', 'w003', 'w004', 'w005'] as const).map((w, i) => ({
        schluessel: k(w),
        lemma: t[w],
        wortart: w === 'w005' ? 'verb' : 'nomen',
        frequenzRang: i + 1,
        ...(SYMBOL[w] ? { symbol: SYMBOL[w] } : {}),
        quelle: QUELLE,
        lizenz: LIZENZ,
      })),
      ...(['m001', 'm002'] as const).map((m) => ({ schluessel: k(m), lemma: EIGENE[kurs][m], quelle: QUELLE, lizenz: LIZENZ })),
    ],
    saetze: (['s0001', 's0002', 's0003', 's0004'] as const).map((s) => ({ schluessel: k(s), text: t[s], quelle: QUELLE, lizenz: LIZENZ })),
    lektionen: [
      {
        schluessel: k('l01'),
        art: 'lektion',
        ziel: { de: 'Erste Wörter', tr: 'İlk kelimeler' },
        aufgaben: [
          { schluessel: k('l01.a01'), typ: 'auswahl', anweisung: 'waehleUebersetzung', ziel: k('w001'), ablenker: [k('w002'), k('w003')] },
          { schluessel: k('l01.a02'), typ: 'paare', lemmata: [k('w001'), k('w002'), k('w003'), k('w004')] },
          {
            schluessel: k('l01.a03'),
            typ: 'wortbank',
            anweisung: 'uebersetze',
            satz: k('s0001'),
            nach: 'ziel',
            ...(ALTERNATIVEN[kurs]?.s0001 ? { alternativen: ALTERNATIVEN[kurs].s0001 } : {}),
            ablenker: [t.w003],
          },
          { schluessel: k('l01.a04'), typ: 'auswahl', anweisung: 'waehleWort', ziel: k('w004'), ablenker: [k('w001'), k('w003')] },
        ],
      },
      {
        schluessel: k('l02'),
        art: 'lektion',
        ziel: { de: 'Kurze Sätze', tr: 'Kısa cümleler' },
        aufgaben: [
          { schluessel: k('l02.a01'), typ: 'wortbank', anweisung: 'uebersetze', satz: k('s0002'), nach: 'ausgang' },
          { schluessel: k('l02.a02'), typ: 'wortbank', anweisung: 'uebersetze', satz: k('s0003'), nach: 'ziel', ablenker: [t.w002] },
          { schluessel: k('l02.a03'), typ: 'auswahl', anweisung: 'waehleUebersetzung', ziel: k('w003'), ablenker: [k('w004')] },
        ],
      },
      {
        schluessel: k('l03'),
        art: 'lektion',
        ziel: { de: 'Neue Übungen', tr: 'Yeni alıştırmalar' },
        aufgaben: [
          { schluessel: k('l03.a01'), typ: 'bild_wort', ziel: k('w003'), ablenker: [k('w004'), k('w001')] },
          { schluessel: k('l03.a02'), typ: 'frei', ziel: k('w002'), nach: 'ziel' },
          // s0004 hat keinen Ton: „Audio folgt“, die Aufgabe wird übersprungen
          {
            schluessel: k('l03.a03'),
            typ: 'hoeren_waehlen',
            anweisung: 'waehleGehoertes',
            ziel: k('s0004'),
            ablenker: [k('s0002'), k('s0003')],
          },
          {
            schluessel: k('l03.a04'),
            typ: 'hoeren_waehlen',
            anweisung: 'waehleBedeutung',
            ziel: k('w001'),
            ablenker: [k('w002'), k('w003')],
          },
          { schluessel: k('l03.a05'), typ: 'hoeren_schreiben', ziel: k('w004') },
          { schluessel: k('l03.a06'), typ: 'minimalpaare', ziel: k('m001'), ablenker: [k('m002')] },
          {
            schluessel: k('l03.a07'),
            typ: 'luecke',
            ziel: k('s0001'),
            wort: 1,
            ...(LUECKE_ABLENKER[kurs] ? { ablenker: LUECKE_ABLENKER[kurs] } : {}),
          },
          { schluessel: k('l03.a08'), typ: 'satzbau', ziel: k('s0002') },
          {
            schluessel: k('l03.a09'),
            typ: 'formen',
            lemma: k('w005'),
            zeilen: FORMEN[kurs].zeilen,
            spalten: [FORMEN[kurs].spalte],
            zellen: FORMEN[kurs].formen.map((f, i) => ({ zeile: i, spalte: 0, loesungen: [f], ...(i === 0 ? { vorgabe: true } : {}) })),
          },
          ...(kurs === 'ar' ? [{ schluessel: k('l03.a10'), typ: 'harakat' as const, ziel: k('w004'), varianten: HARAKAT_VARIANTEN }] : []),
        ],
      },
    ],
  };
}

export function uebersetzungDatei(ziel: Sprache, ausgang: Sprache): UebersetzungDatei {
  const e = einheitVon(ziel);
  const t = TEXTE[ausgang];
  const schluessel = Object.keys(t) as (keyof Woerter)[];
  return {
    format: 'igmg-lernapp-uebersetzung',
    version: 1,
    status: 'automatisch_geprueft',
    richtung: `${ziel}-aus-${ausgang}` as UebersetzungDatei['richtung'],
    einheit: e,
    eintraege: schluessel.map((s) => ({
      bezug: `${e}.${s}`,
      text: t[s],
      ...(ALTERNATIVEN[ausgang]?.[s] ? { alternativen: ALTERNATIVEN[ausgang][s] } : {}),
      quelle: QUELLE,
      lizenz: LIZENZ,
    })),
    // Tipps nur als Platzhalter in de und tr (arabische Tipps entstehen mit den Inhalten, L3)
    tipps:
      ausgang === 'ar'
        ? []
        : [
            {
              schluessel: `${e}.${ausgang}.t01`,
              titel: ausgang === 'de' ? '[Testtipp]' : '[Test ipucu]',
              inhalt: {
                type: 'doc',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: ausgang === 'de' ? '[Tipp folgt]' : '[İpucu gelecek]' }] }],
              },
              quelle: QUELLE,
            },
          ],
  };
}

/** Alle Dateien des Testkurses als Import-Quellen (Pfade wie unter `web/inhalte/lernapp/`, Vorsilbe `testkurs/`). */
export function testkursQuellen(): ImportQuelle[] {
  const kurse: Sprache[] = ['de', 'tr', 'ar'];
  const quellen: ImportQuelle[] = kurse.map((k) => ({
    pfad: `testkurs/sprache/${k}/a1/${einheitVon(k)}.json`,
    text: JSON.stringify(sprachDatei(k)),
  }));
  for (const ziel of kurse)
    for (const ausgang of kurse)
      if (ziel !== ausgang)
        quellen.push({
          pfad: `testkurs/uebersetzung/${ziel}-aus-${ausgang}/a1/${einheitVon(ziel)}.json`,
          text: JSON.stringify(uebersetzungDatei(ziel, ausgang)),
        });
  return quellen;
}

/** Texte der Zielsprache, die einen Clip bekommen (Lemmata und Sätze außer `OHNE_TON`; kein Religionsbezug im Testkurs). */
export function testkursClipTexte(kurs: Sprache): string[] {
  const t = TEXTE[kurs];
  return [...(Object.keys(t) as (keyof Woerter)[]).filter((k) => !OHNE_TON.includes(k)).map((k) => t[k]), ...Object.values(EIGENE[kurs])];
}

/** Testbündel einlesen: Clips je Sprache für `lernapp_audio` (Stimme `test:ton`). */
export function testbuendel(verzeichnis = TESTAUDIO_VERZEICHNIS) {
  const zeilen: (typeof schema.lernappAudio.$inferInsert)[] = [];
  for (const sprache of ['de', 'tr', 'ar'] as const) {
    let dateien: string[] = [];
    try {
      dateien = readdirSync(join(verzeichnis, sprache)).filter((d) => d.endsWith('.lpa'));
    } catch {
      continue;
    }
    for (const datei of dateien) {
      const pfad = leseBuendelPfad(`${sprache}/${datei}`);
      if (!pfad) throw new Error(`Testbündel mit ungültigem Namen: ${sprache}/${datei}`);
      const bytes = new Uint8Array(readFileSync(join(verzeichnis, sprache, datei)));
      if (sha256Hex(bytes).slice(0, 16) !== pfad.sha16) throw new Error(`Testbündel ${datei}: Name passt nicht zum Inhalt`);
      const kopf = leseBuendelKopf(bytes, bytes.length);
      for (const c of kopf.clips)
        zeilen.push({
          sprache,
          textHash: c.textHash,
          stimme: TEST_STIMME,
          buendel: datei,
          versatz: c.versatz,
          laenge: c.laenge,
          dauerMs: c.dauerMs,
          sha256: sha256Hex(bytes.subarray(c.versatz, c.versatz + c.laenge)),
        });
    }
  }
  return zeilen;
}

/** Testkurs importieren (eigener Stand `lernapp_testkurs`) und die Clips der Testbündel eintragen. */
export async function lernappTestkurs(db: Datenbank): Promise<{ bericht: ImportBericht; clips: number }> {
  const bericht = await importiereLernapp(db, testkursQuellen(), { standSchluessel: 'lernapp_testkurs' });
  const clips = testbuendel();
  for (const c of clips)
    await db
      .insert(schema.lernappAudio)
      .values(c)
      .onConflictDoUpdate({
        target: [schema.lernappAudio.sprache, schema.lernappAudio.textHash, schema.lernappAudio.stimme],
        set: { buendel: c.buendel, versatz: c.versatz, laenge: c.laenge, dauerMs: c.dauerMs, sha256: c.sha256 },
      });
  return { bericht, clips: clips.length };
}
