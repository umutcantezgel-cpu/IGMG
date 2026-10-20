import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Religionswächter der Lern-App (KERN 4.0 §3, ADR 0040 Nr. 6): Erlaubnisse nur zusammen mit dem 4-Gramm-Abgleich gegen
 * Tanzil und Bukhari. Positivproben kommen zur Laufzeit aus `web/daten` (nie von Hand geschrieben, KI-Regel 2) und werden
 * per Codepunkt-Ersetzung in eine Schreibung „aus dem Gedächtnis“ gebracht; Negativproben sind neutrale Alltagssätze als
 * Codepunkt-Folgen. Keine arabische Schrift in dieser Datei.
 */
const WURZEL = join(import.meta.dirname, '../../../..');
const WERKZEUG = join(WURZEL, '_gemeinde/werkzeuge/religion-pruefung.mjs');

type Index = { koran: Map<number, string>; hadith: Map<number, string> };
type Treffer = { korpus: 'koran' | 'hadith'; stelle: string } | null;
type Werkzeug = {
  ARABISCH: RegExp;
  normalisiere: (t: string) => string;
  woerter: (t: string) => string[];
  ladeIndex: (wurzel?: string) => Index;
  vierGrammTreffer: (t: string, i: Index) => Treffer;
  loeseCodepunkte: (t: string) => string;
  pruefeDatei: (pfad: string, inhalt: string, holeIndex: () => Index) => string[];
  ladeLexikon: (wurzel?: string) => { arabisch: { name: string }[]; latein: { name: string }[] };
  lexikonTreffer: (t: string, l: ReturnType<Werkzeug['ladeLexikon']>) => { name: string } | null;
  LEXIKON_VERWEISE: readonly unknown[];
};
const w = (await import(pathToFileURL(WERKZEUG).href)) as Werkzeug;

const beginn = Date.now();
const index = w.ladeIndex(WURZEL);
const indexDauer = Date.now() - beginn;
const hole = () => index;

/** Neutrale Alltagssätze (Markt, Wetter, Studium, Auto, Bibliothek, Fußball, Getränke; einer voll vokalisiert). */
const NEUTRAL = [
  '\u0630\u0647\u0628\u062A \u0625\u0644\u0649 \u0627\u0644\u0633\u0648\u0642 \u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u062E\u0628\u0632 \u0648\u0627\u0644\u062D\u0644\u064A\u0628',
  '\u0627\u0644\u0637\u0642\u0633 \u0627\u0644\u064A\u0648\u0645 \u062C\u0645\u064A\u0644 \u062C\u062F\u0627 \u0641\u064A \u0627\u0644\u0642\u0631\u064A\u0629',
  '\u064A\u062F\u0631\u0633 \u0623\u062E\u064A \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0641\u064A \u0627\u0644\u062C\u0627\u0645\u0639\u0629 \u0643\u0644 \u064A\u0648\u0645',
  '\u0647\u0630\u0647 \u0627\u0644\u0633\u064A\u0627\u0631\u0629 \u0627\u0644\u062D\u0645\u0631\u0627\u0621 \u062C\u062F\u064A\u062F\u0629 \u0648\u0633\u0631\u064A\u0639\u0629',
  '\u0625\u0646\u0647\u0627 \u062A\u0642\u0631\u0623 \u0643\u062A\u0627\u0628\u0627 \u0641\u064A \u0627\u0644\u0645\u0643\u062A\u0628\u0629 \u0645\u0639 \u0635\u062F\u064A\u0642\u062A\u0647\u0627',
  '\u0646\u062D\u0646 \u0646\u0644\u0639\u0628 \u0643\u0631\u0629 \u0627\u0644\u0642\u062F\u0645 \u0628\u0639\u062F \u0627\u0644\u0645\u062F\u0631\u0633\u0629',
  '\u0627\u0644\u0634\u0627\u064A \u0633\u0627\u062E\u0646 \u0648\u0627\u0644\u0642\u0647\u0648\u0629 \u0628\u0627\u0631\u062F\u0629',
  '\u0630\u064E\u0647\u064E\u0628\u0652\u062A\u064F \u0625\u0650\u0644\u064E\u0649 \u0627\u0644\u0633\u0651\u064F\u0648\u0642\u0650 \u0644\u0650\u0634\u0650\u0631\u0627\u0621\u0650 \u0627\u0644\u0652\u062E\u064F\u0628\u0652\u0632\u0650 \u0648\u0627\u0644\u0652\u062D\u064E\u0644\u0650\u064A\u0628\u0650',
];

// Verse und Hadithe aus web/daten
const tanzil = readFileSync(join(WURZEL, 'web/daten/tanzil/quran-uthmani.xml'), 'utf8');
const VERSE = [...tanzil.matchAll(/<sura index="(\d+)"[^>]*>([\s\S]*?)<\/sura>/g)].flatMap((s) =>
  [...s[2].matchAll(/<aya index="(\d+)" text="([^"]*)"/g)].map((a) => ({ stelle: `${s[1]}:${a[1]}`, text: a[2] })),
);
const HADITHE = (
  JSON.parse(readFileSync(join(WURZEL, 'web/daten/hadith/ara-bukhari.json'), 'utf8')) as {
    hadiths: { hadithnumber: number; text: string }[];
  }
).hadiths;

const ZEICHEN = /[\u064B-\u065F\u06D6-\u06ED\u0640]/g;
/** Ohne Vokal- und Koranzeichen, hochgestelltes Alif weggelassen, Alif wasla als Alif. */
const ohneZeichen = (t: string) =>
  t
    .replace(/\u0670/g, '')
    .replace(ZEICHEN, '')
    .replace(/\u0671/g, '\u0627');
/** Vereinfachte Schreibung: hochgestelltes Alif als Alif (Waw mit Alif als Alif, nach Alif maqsura weg), kleines Waw/Ya als Buchstabe. */
const vereinfacht = (t: string) =>
  t
    .replace(/\u0648\u0670/g, '\u0627')
    .replace(/([\u0649\u064A])\u0670/g, '$1')
    .replace(/\u0640?\u0670/g, '\u0627')
    .replace(/\u06E5/g, '\u0648')
    .replace(/[\u06E6\u06E7]/g, '\u064A')
    .replace(ZEICHEN, '')
    .replace(/\u0671/g, '\u0627');
const alsCodepunkte = (t: string) => [...t].map((c) => `\\u${c.codePointAt(0)!.toString(16).padStart(4, '0')}`).join('');

/** Jedes 97. Verspaar mit mindestens vier Wörtern: vier Wörter aus der Mitte. */
const PROBEN = VERSE.filter((v, i) => i % 97 === 0)
  .map((v) => ({ stelle: v.stelle, roh: v.text.split(/\s+/).filter((x) => w.woerter(x).length) }))
  .filter((v) => v.roh.length >= 4)
  .map((v) => {
    const a = Math.floor((v.roh.length - 4) / 2);
    return { stelle: v.stelle, text: v.roh.slice(a, a + 4).join(' ') };
  });

describe('Normalisierung', () => {
  it('ohne Harakat, Tatweel und Koranzeichen; Alif-Formen, Alif wasla, Hamza-Träger, Ta marbuta, Alif maqsura vereinheitlicht', () => {
    // Harakat und Tatweel
    expect(w.normalisiere('\u0643\u064E\u062A\u064E\u0640\u0640\u0628\u064E')).toBe('\u0643\u062A\u0628');
    // Alif mit Hamza oben/unten, Madda, Wasla → Alif
    for (const alif of ['\u0623', '\u0625', '\u0622', '\u0671']) expect(w.normalisiere(alif)).toBe('\u0627');
    // Zerlegte Schreibung gleich der zusammengesetzten
    expect(w.normalisiere('\u0627\u0654')).toBe(w.normalisiere('\u0623'));
    expect(w.normalisiere('\u0648\u0654')).toBe('\u0648');
    // Ta marbuta → Ha, Alif maqsura (auch persisches Ya) → Ya
    expect(w.normalisiere('\u0629')).toBe('\u0647');
    expect(w.normalisiere('\u0649')).toBe('\u064A');
    expect(w.normalisiere('\u06CC')).toBe('\u064A');
    // Koranzeichen U+06D6–U+06ED fallen weg
    expect(w.normalisiere('\u0645\u06D6\u0646\u06ED')).toBe('\u0645\u0646');
    // Präsentationsformen
    expect(w.normalisiere('\uFEE1\uFEE6')).toBe('\u0645\u0646');
  });

  it('Wörter: unsichtbare Zeichen und Satzzeichen trennen nicht bzw. fallen weg', () => {
    expect(w.woerter('\u0645\u200C\u0646 {n} \u0645\u0646\u060C abc')).toEqual(['\u0645\u0646', '\u0645\u0646']);
    expect(w.loeseCodepunkte('a\\u0645\\u{646}b')).toBe('a\u0645\u0646b');
  });
});

describe('Index aus web/daten (einmal je Lauf, schnell)', () => {
  it('enthält Koran- und Hadith-4-Gramme und baut in wenigen Sekunden', () => {
    expect(index.koran.size).toBeGreaterThan(70_000);
    expect(index.hadith.size).toBeGreaterThan(200_000);
    expect(indexDauer).toBeLessThan(15_000);
  });
});

describe('Positivproben aus Tanzil (Koran-4-Gramm ab 4 Wörtern)', () => {
  it(`erkennt ${PROBEN.length} Proben im Uthmani-Text, ohne Zeichen und vereinfacht`, () => {
    expect(PROBEN.length).toBeGreaterThan(40);
    const verfehlt: string[] = [];
    for (const p of PROBEN)
      for (const [art, text] of [
        ['uthmani', p.text],
        ['ohne', ohneZeichen(p.text)],
        ['vereinfacht', vereinfacht(p.text)],
      ] as const) {
        const t = w.vierGrammTreffer(text, index);
        if (t?.korpus !== 'koran') verfehlt.push(`${p.stelle}/${art}`);
      }
    expect(verfehlt).toEqual([]);
  });

  it('Tatweel und unsichtbare Zeichen im Wort umgehen den Wächter nicht', () => {
    const probe = ohneZeichen(PROBEN[3].text);
    const gestreckt = [...probe].join('\u0640').replace(/\u0640 \u0640/g, ' ');
    const unsichtbar = [...probe].join('\u200C').replace(/\u200C \u200C/g, ' ');
    expect(w.vierGrammTreffer(gestreckt, index)?.korpus).toBe('koran');
    expect(w.vierGrammTreffer(unsichtbar, index)?.korpus).toBe('koran');
  });

  it('drei Wörter sind kein Treffer (Schwelle 4)', () => {
    const drei = ohneZeichen(PROBEN[5].text).split(' ').slice(0, 3).join(' ');
    // Drei Wörter können zufällig in einem längeren 4-Gramm stecken, sind aber selbst nie eine Folge aus 4 Wörtern
    expect(w.vierGrammTreffer(drei, index)).toBeNull();
  });
});

describe('Positivproben aus dem Bukhari-Bestand (Hadith-4-Gramm)', () => {
  it('erkennt Ausschnitte aus 6 Wörtern ohne Vokalzeichen', () => {
    const proben = HADITHE.filter((h, i) => i % 251 === 0)
      .map((h) => w.woerter(h.text))
      .filter((x) => x.length >= 12);
    expect(proben.length).toBeGreaterThan(20);
    const verfehlt = proben.filter((x) => {
      const a = Math.floor(x.length / 2) - 3;
      return w.vierGrammTreffer(x.slice(a, a + 6).join(' '), index) === null;
    });
    expect(verfehlt).toEqual([]);
  });
});

describe('Negativproben: neutrale Alltagssätze', () => {
  it.each(NEUTRAL.map((s, i) => [i + 1, s]))('Satz %i ist kein Treffer', (_, satz) => {
    expect(w.vierGrammTreffer(satz as string, index)).toBeNull();
  });
});

describe('Dateien: Erlaubnis nur mit Wächter, Wissen/Koran-Pfad/Komponenten/Werkstatt nie', () => {
  const koranZeile = (p: (typeof PROBEN)[number]) => `  "titel": "${ohneZeichen(p.text)}",`;

  it('Oberfläche ar.json und Sprachkurs-Inhalte: neutral grün, Koran-Wortlaut rot mit Fundstelle', () => {
    for (const pfad of [
      'web/messages/lernapp/ar.json',
      'web/inhalte/lernapp/sprache/ar/a1/e01.json',
      'web/inhalte/lernapp/uebersetzung/de-aus-ar/a1/e01.json',
      'web/inhalte/lernapp/aussprache/ar.json',
    ]) {
      expect(w.pruefeDatei(pfad, NEUTRAL.map((s) => `  "x": "${s}",`).join('\n'), hole), pfad).toEqual([]);
      // Fundstelle: eine Stelle mit diesem Wortlaut (bei Wiederholungen im Koran nicht unbedingt die Probe selbst)
      // (in ar.json kann zusätzlich das Formel-Lexikon treffen, z. B. bei der Basmala)
      const befunde = w.pruefeDatei(pfad, `{\n${koranZeile(PROBEN[0])}\n}`, hole).filter((x) => x.includes('4-Gramm'));
      expect(befunde, pfad).toHaveLength(1);
      expect(befunde[0], pfad).toMatch(new RegExp(`^${pfad.replace(/\./g, '\\.')}:2: Koran-4-Gramm \\(Sure \\d+:\\d+\\)$`));
    }
  });

  it('Codepunkt-Folgen in erlaubten und anderen Dateien umgehen den Wächter nicht', () => {
    const escaped = alsCodepunkte(ohneZeichen(PROBEN[1].text));
    expect(w.pruefeDatei('web/messages/lernapp/ar.json', `  "x": "${escaped}"`, hole)).toHaveLength(1);
    expect(w.pruefeDatei('web/src/lib/lernapp/x.ts', `const s = '${escaped}';`, hole)).toHaveLength(1);
    expect(w.pruefeDatei('web/src/components/lernapp/Tastatur.tsx', `const s = '${alsCodepunkte(NEUTRAL[0])}';`, hole)).toEqual([]);
  });

  it('nie erlaubt: Wissenskurs, Koran-Pfad, Komponenten, Werkstatt, Rahmenpläne – auch neutrale Sätze', () => {
    for (const pfad of [
      'web/inhalte/lernapp/islam/grund/e01.json',
      'web/inhalte/lernapp/koran/pfad.json',
      'web/src/components/lernapp/Kopf.tsx',
      '_lernapp/lehrplan/kontrast-ar-aus-de.md',
      'web/inhalte/lernapp/rahmen/ar.json',
      'web/messages/lernapp/de.json',
    ])
      expect(w.pruefeDatei(pfad, `x\n${NEUTRAL[1]}`, hole), pfad).toHaveLength(1);
  });

  it('Tests und Daten bleiben erlaubt; Meldungen enthalten keine arabische Schrift', () => {
    expect(w.pruefeDatei('web/tests/unit/x.test.ts', PROBEN[2].text, hole)).toEqual([]);
    expect(w.pruefeDatei('web/daten/tanzil/x.xml', PROBEN[2].text, hole)).toEqual([]);
    const befunde = [
      ...w.pruefeDatei('web/inhalte/lernapp/islam/x.json', NEUTRAL[0], hole),
      ...w.pruefeDatei('web/messages/lernapp/ar.json', koranZeile(PROBEN[4]), hole),
    ];
    expect(befunde).toHaveLength(2);
    expect(befunde.join('\n')).not.toMatch(w.ARABISCH);
  });
});

describe('S-L1 M-3: Umgehungen des Wächters', () => {
  const zeichen = (n: number) => String.fromCharCode(n);
  const SHY = zeichen(0xad);
  const CGJ = zeichen(0x34f);
  const probe = ohneZeichen(PROBEN[6].text);
  const vier = probe.split(' ');
  /** Ein Zeichen in die Mitte jedes Worts setzen (zerreißt die Wörter ohne Normalisierung). */
  const mitZeichen = (z: string) => vier.map((x) => `${x.slice(0, 1)}${z}${x.slice(1)}`).join(' ');
  const SPRACHE = 'web/inhalte/lernapp/sprache/ar/a1/e01.json';

  it('Codepunkte eines neutralen Worts im Wissenskurs, im Koran-Pfad und in Textdateien der Werkstatt sind Rot', () => {
    const neutral = alsCodepunkte(NEUTRAL[0]!.split(' ')[0]!);
    for (const pfad of ['web/inhalte/lernapp/islam/probe.json', 'web/inhalte/lernapp/koran/pfad.json', '_lernapp/probe.md'])
      expect(w.pruefeDatei(pfad, `{ "x": "${neutral}" }`, hole), pfad).toHaveLength(1);
    // Werkzeuge der Werkstatt dürfen Zeichenbereiche als Codepunkte tragen (nur ohne 4-Gramm)
    expect(w.pruefeDatei('_lernapp/werkzeuge/x.mjs', `const b = /[${alsCodepunkte(NEUTRAL[0]!.slice(0, 2))}]/;`, hole)).toEqual([]);
  });

  it('vier Wörter auf zwei Zeilen bzw. in zwei Feldern (Dialog) sind Rot', () => {
    const zwei = `{\n  "a": "${vier.slice(0, 2).join(' ')}",\n  "b": "${vier.slice(2).join(' ')}"\n}`;
    expect(w.pruefeDatei(SPRACHE, zwei, hole)).toHaveLength(1);
    const dialog = `[\n  { "sprecher": "a",\n    "text": "${vier.slice(0, 3).join(' ')}" },\n  { "sprecher": "b",\n    "text": "${vier[3]}" }\n]`;
    expect(w.pruefeDatei(SPRACHE, dialog, hole)).toEqual([
      expect.stringMatching(new RegExp(`^${SPRACHE.replace(/\./g, '\\.')}:3: Koran-4-Gramm`)),
    ]);
  });

  it('weicher Trennstrich, U+034F, Zeilentrenner und Homoglyphen im Wort umgehen den Wächter nicht', () => {
    expect(w.vierGrammTreffer(mitZeichen(SHY), index)?.korpus).toBe('koran');
    expect(w.vierGrammTreffer(mitZeichen(CGJ), index)?.korpus).toBe('koran');
    expect(w.vierGrammTreffer(mitZeichen(zeichen(0x2028)), index)?.korpus).toBe('koran');
    expect(w.pruefeDatei(SPRACHE, `"x": "${mitZeichen(SHY)}"`, hole)).toHaveLength(1);
    const mitHa = PROBEN.map((p) => ohneZeichen(p.text)).find((t) => t.includes(zeichen(0x647)));
    expect(mitHa).toBeDefined();
    for (const ersatz of [0x6c1, 0x6be, 0x6d5])
      expect(w.vierGrammTreffer(mitHa!.replaceAll(zeichen(0x647), zeichen(ersatz)), index)?.korpus).toBe('koran');
  });

  it('HTML-Entitäten, fromCharCode/fromCodePoint und Prozent-Kodierung in Code sind Rot', () => {
    const cps = [...probe].map((c) => c.codePointAt(0)!);
    const entitaeten = cps.map((n) => (n === 32 ? ' ' : `&#x${n.toString(16)};`)).join('');
    const dezimal = cps.map((n) => (n === 32 ? ' ' : `&#${n};`)).join('');
    expect(w.pruefeDatei('web/src/components/lernapp/Kopf.tsx', `<p>${entitaeten}</p>`, hole)).toHaveLength(1);
    expect(w.pruefeDatei('web/src/lib/lernapp/x.ts', `const s = '${dezimal}';`, hole)).toHaveLength(1);
    expect(w.pruefeDatei('web/src/lib/lernapp/x.ts', `const s = String.fromCharCode(${cps.join(', ')});`, hole)).toHaveLength(1);
    expect(
      w.pruefeDatei(
        'web/src/lib/lernapp/x.ts',
        `const s = String.fromCodePoint(${cps.map((n) => `0x${n.toString(16)}`).join(',')});`,
        hole,
      ),
    ).toHaveLength(1);
    expect(w.pruefeDatei('web/src/lib/lernapp/x.ts', `const u = '/suche?q=${encodeURIComponent(probe)}';`, hole)).toHaveLength(1);
    // neutrale Codepunkte in Komponenten bleiben erlaubt (z. B. Bildschirmtastatur)
    const neutral = [...NEUTRAL[1]!].map((c) => c.codePointAt(0)!);
    expect(w.pruefeDatei('web/src/components/lernapp/Tastatur.tsx', `const s = String.fromCharCode(${neutral.join(', ')});`, hole)).toEqual(
      [],
    );
  });
});

describe('S-L1 M-3: Formel-Lexikon (KERN 4.0 §3 a)', () => {
  const lexikon = w.ladeLexikon(WURZEL);
  /** Wörter einer Stelle aus dem Tanzil-Text in vereinfachter Schreibung (wie aus dem Gedächtnis). */
  const stelle = (ref: string, von: number, bis: number) =>
    vereinfacht(
      VERSE.find((v) => v.stelle === ref)!
        .text.split(/\s+/)
        .slice(von - 1, bis)
        .join(' '),
    );

  it('löst alle Verweise in den Tanzil-Text auf; arabische Formeln treffen auch mit Vorsilbe, neutrale Sätze nie', () => {
    expect(lexikon.arabisch.length).toBe(w.LEXIKON_VERWEISE.length);
    for (const [ref, von, bis] of [
      ['1:2', 1, 2],
      ['2:70', 14, 16],
      ['18:39', 6, 8],
      ['23:91', 23, 24],
      ['29:45', 18, 19],
      ['6:54', 7, 8],
    ] as const)
      expect(w.lexikonTreffer(`${NEUTRAL[2]} ${stelle(ref, von, bis)}`, lexikon), ref).not.toBeNull();
    const name = stelle('1:1', 2, 2);
    expect(w.lexikonTreffer(`${zeichen(0x648)}${name}`, lexikon)?.name).toBe('Gottesname');
    expect(w.lexikonTreffer(alsCodepunkte(name), lexikon)?.name).toBe('Gottesname');
    for (const satz of NEUTRAL) expect(w.lexikonTreffer(satz, lexikon)).toBeNull();
    function zeichen(n: number) {
      return String.fromCharCode(n);
    }
  });

  it('deutsche und türkische Begriffe treffen, Alltagswörter nicht', () => {
    for (const t of [
      'Das Gebet am Abend',
      'Wir beten.',
      'die Moschee',
      'Inschallah!',
      'Camiye gidiyoruz.',
      'İMAM',
      'Ramazan ayı',
      'oruç tutmak',
      `Ko${String.fromCharCode(0xad)}ran`,
    ])
      expect(w.lexikonTreffer(t, lexikon), t).not.toBeNull();
    for (const t of [
      'Ich habe ihn gebeten.',
      'Rote Bete',
      'iki saat süren toplantı',
      'şirketi kuran kişi',
      'Hocamız geldi.',
      'duvar',
      'Sureti',
      'hacim',
      'Das Wetter ist schön.',
    ])
      expect(w.lexikonTreffer(t, lexikon), t).toBeNull();
  });

  it('in der Oberfläche ar.json ist ein Lexikon-Treffer Rot; Meldungen ohne arabische Schrift', () => {
    const befunde = w.pruefeDatei('web/messages/lernapp/ar.json', `{\n  "x": "${stelle('1:2', 1, 2)}"\n}`, hole);
    expect(befunde).toEqual(['web/messages/lernapp/ar.json:2: Formel-Lexikon (Hamdala) – in der Oberfläche nie erlaubt']);
    expect(befunde.join('\n')).not.toMatch(w.ARABISCH);
  });
});

describe('ganzes Werkzeug', () => {
  it('läuft über das Repository in höchstens 30 s', () => {
    const start = Date.now();
    const lauf = spawnSync(process.execPath, [WERKZEUG], { cwd: WURZEL, encoding: 'utf8', timeout: 60_000 });
    const dauer = Date.now() - start;
    expect(`${lauf.stdout}${lauf.stderr}`).toMatch(/Religion-Prüfung (grün|ROT)/);
    expect(dauer).toBeLessThan(30_000);
    // Die Grenze von 30 s prüft die Zeile oben; Vitest selbst bricht erst nach 60 s ab (sonst nach 5 s, unter Plattenlast)
  }, 60_000);
});
