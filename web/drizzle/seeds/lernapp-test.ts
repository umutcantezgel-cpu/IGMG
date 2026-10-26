// Testkurs der Lern-App (PLAN §3.11, §13; ADR 0039 Nr. 11): je Zielsprache eine kleine Einheit mit neutralen
// Alltagssätzen, Übersetzungen für alle sechs Richtungen, die Übungstypen aus L1 (Auswahl, Wortbank, Paare; Lektionen l01,
// l02) und je eine Aufgabe der Typen aus L2-01 (Lektion l03: Bildkarte, Freitext, Hören ohne und mit Ton, Diktat,
// Minimalpaar, Lücke, Satzbau, Formen, im Arabischen Harakat).
// Nur für E2E, Tests und einen Beispielmodus, der ihn ausdrücklich anfordert – nie in der Produktion: `pnpm lernapp:import
// --testkurs` (E2E-Datenbank; Bau ohne Datenbank nur mit LERNAPP_TESTKURS=1, scripts/bau-datenbank.mjs), nicht `pnpm db:seed`.
// - Eigener Ort (Stufe C, L15-1): Einheit `<kurs>.a1.test` statt eines Schlüssels der echten Inhalte – die Testeinheit ersetzt
//   nie eine echte Einheit (früher `<kurs>.a1.e01`), und ihre Töne hängen nur an Einträgen mit Quelle `test:…`
//   (`clipZulaessig`, audio/stimmen.ts). Reihenfolge 1 wie die Vorkurs-Einheiten `<kurs>.a1.e00-*`, vor der echten e01
//   (Reihenfolge 2): Im Lernpfad steht sie unter den ersten beiden Einheiten, die automatisch gespeichert werden (E2E).
// - KEIN Religionsbezug, keine Formeln, keine Koran- oder Hadith-Wörter (KI-Regel 2, KERN 4.0 §2). Sätze mit höchstens drei
//   Wörtern (kein 4-Gramm möglich, KERN 4.0 §3 b/c).
// - Arabisch nur als Codepunkt-Escapes (KERN 4.0 §3: arabische Schrift nicht in Code-Dateien).
// - L2-02: Lektion l04 mit je einer Aufgabe der Typen dialog, geschichte, lesen_fragen, grammatik_tipp, schrift_* (je Zielsprache
//   ihr Vorkurs-Typ; Arabisch auch Nachspuren), sprechen und schreiben. Die Sätze dafür (`SAETZE_L2`) haben keine Töne
//   (die Testbündel bleiben unverändert), außer sie wiederholen Sätze aus `TEXTE`.
// - Audio: synthetische Töne in `drizzle/seeds/lernapp-testaudio/<sprache>/<einheit>-<sha16>.lpa` (erzeugt mit
//   `pnpm exec tsx scripts/lernapp/testaudio.ts`, ffmpeg nur lokal), Stimme `test:ton` – nie Rezitationen. Satz s0004
//   bekommt absichtlich keinen Ton (Hörübung „Audio folgt“, KERN 4.0 §4).
// - Bildkarten: Motive aus `inhalte/lernapp/symbole/symbole.json` (im Testkurs auch ohne Freigabe der Redaktion).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import type { Datenbank } from '../../src/lib/db';
import { schema } from '../../src/lib/db';
import { type ImportBericht, importiereLernapp, type ImportQuelle } from '../../src/lib/lernapp/inhalt/import';
import type { SprachEinheitDatei, UebersetzungDatei } from '../../src/lib/lernapp/inhalt/schema';
import { type ImportStand, TESTKURS_STAND } from '../../src/lib/lernapp/inhalt/stand';
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

/** Dieselben neutralen Inhalte in den drei Sprachen: Wasser, Brot, Haus, Buch, trinken; vier kurze Sätze (nur Wörter der Stufe A1). */
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
    s0004: 'Das Haus ist neu.',
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
    s0004: 'Ev yeni.',
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
    s0004: '\u0627\u0644\u0652\u0628\u064E\u064A\u0652\u062A\u064F \u062C\u064E\u062F\u0650\u064A\u062F\u064C.',
  },
};

/** Sätze der Lektion l04 (L2-02): Gruß, Frage, Antwort, Frage zur Geschichte, Schreibaufgabe – höchstens drei Wörter. */
type SaetzeL2 = { s0005: string; s0006: string; s0007: string; s0008: string; s0009: string };
export const SAETZE_L2: Record<Sprache, SaetzeL2> = {
  de: { s0005: 'Guten Morgen!', s0006: 'Wie geht es?', s0007: 'Danke, gut.', s0008: 'Was ist neu?', s0009: 'Schreibe über Wasser.' },
  tr: { s0005: 'Günaydın!', s0006: 'Nasılsın?', s0007: 'İyiyim, teşekkürler.', s0008: 'Ne yeni?', s0009: 'Su hakkında yaz.' },
  ar: {
    s0005: '\u0635\u064E\u0628\u064E\u0627\u062D\u064F \u0627\u0644\u0652\u062E\u064E\u064A\u0652\u0631\u0650!',
    s0006: '\u0643\u064E\u064A\u0652\u0641\u064E \u062D\u064E\u0627\u0644\u064F\u0643\u064E\u061F',
    s0007: '\u0628\u0650\u062E\u064E\u064A\u0652\u0631\u064D\u060C \u0634\u064F\u0643\u0652\u0631\u064B\u0627.',
    s0008: '\u0645\u064E\u0627 \u0627\u0644\u0652\u062C\u064E\u062F\u0650\u064A\u062F\u064F\u061F',
    s0009: '\u0627\u064F\u0643\u0652\u062A\u064F\u0628\u0652 \u0639\u064E\u0646\u0650 \u0627\u0644\u0652\u0645\u064E\u0627\u0621\u0650.',
  },
};

/** Schrift-Vorkurs je Zielsprache (L2-02): Lateinschrift für de, türkische Buchstaben für tr, arabische Buchstaben für ar. */
function schriftAufgaben(kurs: Sprache, k: (x: string) => string) {
  if (kurs === 'de')
    return [
      {
        schluessel: k('l04.a05'),
        typ: 'schrift_latein' as const,
        anweisung: 'waehleBuchstabe' as const,
        vorgabe: 'H_us',
        optionen: ['a', 'ä', 'o'],
        richtig: 0,
      },
    ];
  if (kurs === 'tr')
    return [
      {
        schluessel: k('l04.a05'),
        typ: 'schrift_tr' as const,
        anweisung: 'grossKlein' as const,
        vorgabe: 'ş',
        optionen: ['Ş', 'S', 'Ç'],
        richtig: 0,
      },
    ];
  return [
    { schluessel: k('l04.a05'), typ: 'schrift_ar' as const, art: 'erkennen' as const, ziel: 'be', ablenker: ['te', 'se'] },
    { schluessel: k('l04.a06'), typ: 'schrift_ar' as const, art: 'nachspuren' as const, ziel: 'elif' },
  ];
}

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

/** Schlüssel der Testeinheit je Zielsprache (eigener Ort, kollidiert mit keinem Schlüssel der echten Inhalte). */
export const testEinheit = (kurs: Sprache) => `${kurs}.a1.test`;
const einheitVon = testEinheit;

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
    einheit: { schluessel: e, reihenfolge: 1, thema: THEMA, kinderGeeignet: true },
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
    saetze: [
      ...(['s0001', 's0002', 's0003', 's0004'] as const).map((s) => ({ schluessel: k(s), text: t[s], quelle: QUELLE, lizenz: LIZENZ })),
      ...(Object.keys(SAETZE_L2[kurs]) as (keyof SaetzeL2)[]).map((s) => ({
        schluessel: k(s),
        text: SAETZE_L2[kurs][s],
        quelle: QUELLE,
        lizenz: LIZENZ,
      })),
    ],
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
      {
        schluessel: k('l04'),
        art: 'lektion',
        ziel: { de: 'Weitere Übungen', tr: 'Diğer alıştırmalar' },
        aufgaben: [
          {
            schluessel: k('l04.a01'),
            typ: 'dialog',
            zeilen: [
              { sprecher: 'a', satz: k('s0005') },
              { sprecher: 'b', satz: k('s0006') },
            ],
            antwort: k('s0007'),
            ablenker: [k('s0002'), k('s0003')],
          },
          {
            schluessel: k('l04.a02'),
            typ: 'geschichte',
            zeilen: [{ satz: k('s0001') }, { sprecher: 'a', satz: k('s0005') }, { satz: k('s0003') }],
            fragen: [{ nach: 2, frage: k('s0008'), antwort: k('w004'), ablenker: [k('w003')] }],
          },
          {
            schluessel: k('l04.a03'),
            typ: 'lesen_fragen',
            absaetze: [k('s0002'), k('s0003')],
            glossen: [k('w003'), k('w004')],
            fragen: [
              { art: 'rfn', aussage: k('s0002'), richtig: 'richtig' },
              { art: 'auswahl', frage: k('s0008'), antwort: k('w004'), ablenker: [k('w003')] },
            ],
          },
          { schluessel: k('l04.a04'), typ: 'grammatik_tipp', tipp: 't01' },
          ...schriftAufgaben(kurs, k),
          { schluessel: k('l04.a07'), typ: 'sprechen', satz: k('s0001') },
          {
            schluessel: k('l04.a08'),
            typ: 'schreiben',
            aufgabe: k('s0009'),
            woerter: { min: 2, max: 30 },
            pflichtwoerter: [t.w001],
            muster: [k('s0001')],
          },
        ],
      },
    ],
  };
}

export function uebersetzungDatei(ziel: Sprache, ausgang: Sprache): UebersetzungDatei {
  const e = einheitVon(ziel);
  const t: Record<string, string> = { ...TEXTE[ausgang], ...SAETZE_L2[ausgang] };
  const schluessel = Object.keys(t);
  return {
    format: 'igmg-lernapp-uebersetzung',
    version: 1,
    status: 'automatisch_geprueft',
    richtung: `${ziel}-aus-${ausgang}` as UebersetzungDatei['richtung'],
    einheit: e,
    eintraege: schluessel.map((s) => ({
      bezug: `${e}.${s}`,
      text: t[s],
      ...(ALTERNATIVEN[ausgang]?.[s as keyof Woerter] ? { alternativen: ALTERNATIVEN[ausgang][s as keyof Woerter] } : {}),
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
                content: [
                  { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: ausgang === 'de' ? '[Regel]' : '[Kural]' }] },
                  { type: 'paragraph', content: [{ type: 'text', text: ausgang === 'de' ? '[Tipp folgt]' : '[İpucu gelecek]' }] },
                  // Zitatblock = Beispiel in der Zielsprache (Übungstyp grammatik_tipp, paket/bauen.ts tippAbschnitte)
                  { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: TEXTE[ziel].s0001 }] }] },
                ],
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

/**
 * Stand `lernapp_testkurs` aus der Zeit vor Stufe C bereinigen (dauerhafte Entwicklungsdatenbanken): Damals lag die
 * Testeinheit unter `<kurs>.a1.e01`, dem Schlüssel der echten Einheit. Ohne Bereinigung hielte der Import die alten Pfade für
 * entfernt und sperrte die echte Einheit samt Übersetzungen und Tipps (`entfernteDateien` → `sperreFehlende`); die Liste
 * `entfernt` führte zudem Schlüssel der echten Einheit. Es bleibt nur, was zur Testeinheit `<kurs>.a1.test` gehört.
 * Rückgabe: die Einheiten der alten Einträge – deren Zeilen hatte der alte Testkurs überschrieben; `scripts/lernapp/import.ts`
 * importiert die echten Inhalte dann einmal erzwungen neu.
 */
async function bereinigeAltenStand(db: Datenbank): Promise<string[]> {
  const [z] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, TESTKURS_STAND));
  const stand = z?.wert as ImportStand | undefined;
  if (!stand?.dateien) return [];
  const eigen = (['de', 'tr', 'ar'] as const).map(testEinheit);
  const fremd = Object.entries(stand.dateien).filter(([, d]) => !eigen.includes(d.einheit));
  const entfernt = stand.entfernt?.filter((x) => eigen.some((e) => x.startsWith(`${e}.`)));
  if (!fremd.length && entfernt?.length === stand.entfernt?.length) return [];
  const alt = new Set(fremd.map(([pfad]) => pfad));
  const neu: ImportStand = {
    ...stand,
    dateien: Object.fromEntries(Object.entries(stand.dateien).filter(([pfad]) => !alt.has(pfad))),
    konflikte: (stand.konflikte ?? []).filter((k) => !alt.has(k.datei)),
    ...(entfernt ? { entfernt } : {}),
  };
  await db.update(schema.einstellung).set({ wert: neu }).where(eq(schema.einstellung.schluessel, TESTKURS_STAND));
  return [...new Set(fremd.map(([, d]) => d.einheit))].sort();
}

/**
 * Testkurs importieren (eigener Stand `lernapp_testkurs`) und die Clips der Testbündel eintragen. `alteEinheiten`: echte
 * Einheiten, die ein Stand aus der Zeit vor Stufe C noch dem Testkurs zuschrieb (siehe `bereinigeAltenStand`).
 */
export async function lernappTestkurs(db: Datenbank): Promise<{ bericht: ImportBericht; clips: number; alteEinheiten: string[] }> {
  const alteEinheiten = await bereinigeAltenStand(db);
  const bericht = await importiereLernapp(db, testkursQuellen(), { standSchluessel: TESTKURS_STAND });
  const clips = testbuendel();
  for (const c of clips)
    await db
      .insert(schema.lernappAudio)
      .values(c)
      .onConflictDoUpdate({
        target: [schema.lernappAudio.sprache, schema.lernappAudio.textHash, schema.lernappAudio.stimme],
        set: { buendel: c.buendel, versatz: c.versatz, laenge: c.laenge, dauerMs: c.dauerMs, sha256: c.sha256 },
      });
  return { bericht, clips: clips.length, alteEinheiten };
}
