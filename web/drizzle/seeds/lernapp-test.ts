// Testkurs der Lern-App (PLAN §3.11, §13; ADR 0039 Nr. 11): je Zielsprache eine kleine Einheit mit neutralen
// Alltagssätzen, Übersetzungen für alle sechs Richtungen und alle drei Übungstypen aus L1 (Auswahl, Wortbank, Paare).
// Nur für Beispielmodus, E2E und Tests – nie in der Produktion: `pnpm lernapp:import --testkurs` (Bau ohne Datenbank,
// scripts/bau-datenbank.mjs; E2E-Datenbank), nicht `pnpm db:seed`.
// - KEIN Religionsbezug, keine Formeln, keine Koran- oder Hadith-Wörter (KI-Regel 2, KERN 4.0 §2). Sätze mit höchstens drei
//   Wörtern (kein 4-Gramm möglich, KERN 4.0 §3 b/c).
// - Arabisch nur als Codepunkt-Escapes (KERN 4.0 §3: arabische Schrift nicht in Code-Dateien).
// - Audio: synthetische Töne in `drizzle/seeds/lernapp-testaudio/<sprache>/<einheit>-<sha16>.lpa` (erzeugt mit
//   `pnpm exec tsx scripts/lernapp/testaudio.ts`, ffmpeg nur lokal), Stimme `test:ton` – nie Rezitationen.
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

type Woerter = { w001: string; w002: string; w003: string; w004: string; s0001: string; s0002: string; s0003: string };

/** Dieselben neutralen Inhalte in den drei Sprachen: Wasser, Brot, Haus, Buch; drei kurze Sätze. */
export const TEXTE: Record<Sprache, Woerter> = {
  de: {
    w001: 'Wasser',
    w002: 'Brot',
    w003: 'Haus',
    w004: 'Buch',
    s0001: 'Ich trinke Wasser.',
    s0002: 'Das Haus ist groß.',
    s0003: 'Das Buch ist neu.',
  },
  tr: {
    w001: 'su',
    w002: 'ekmek',
    w003: 'ev',
    w004: 'kitap',
    s0001: 'Su içiyorum.',
    s0002: 'Ev büyük.',
    s0003: 'Kitap yeni.',
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
  },
};

/** Weitere angenommene Fassungen (Wortbank in die Sprache, Übersetzung in die Ausgangssprache). */
const ALTERNATIVEN: Partial<Record<Sprache, Partial<Record<keyof Woerter, string[]>>>> = {
  tr: { s0001: ['Ben su içiyorum.'], s0002: ['Ev büyüktür.'] },
};

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
    lemmata: (['w001', 'w002', 'w003', 'w004'] as const).map((w, i) => ({
      schluessel: k(w),
      lemma: t[w],
      wortart: 'nomen',
      frequenzRang: i + 1,
      quelle: QUELLE,
      lizenz: LIZENZ,
    })),
    saetze: (['s0001', 's0002', 's0003'] as const).map((s) => ({ schluessel: k(s), text: t[s], quelle: QUELLE, lizenz: LIZENZ })),
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

/** Texte der Zielsprache, die einen Clip bekommen (Lemmata und Sätze; kein Religionsbezug im Testkurs). */
export function testkursClipTexte(kurs: Sprache): string[] {
  return Object.values(TEXTE[kurs]);
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
