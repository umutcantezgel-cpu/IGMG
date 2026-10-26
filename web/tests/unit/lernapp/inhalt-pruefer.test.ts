import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { testkursQuellen } from '../../../drizzle/seeds/lernapp-test';
import { INHALT_WURZEL, inhaltsdateien } from '../../../scripts/lernapp/inhaltsdateien';
import type { ImportQuelle } from '@/lib/lernapp/inhalt/import';
import { befundZeile, blockierende, menschlich, pruefeInhalte, type PruefOptionen, warnungen } from '@/lib/lernapp/inhalt/pruefer';
import { pruefeAusschluesse } from '@/lib/lernapp/inhalt/pruefer/ausschluss';
import { leereInhalte } from '@/lib/lernapp/inhalt/pruefer/dateien';
import { auszugsTabelle, ladeHaeufigkeit, ladeKaikki, pruefeAuszuege, pruefeKaikkiOhneBeispiele } from '@/lib/lernapp/inhalt/pruefer/daten';
import { nahePaare } from '@/lib/lernapp/inhalt/pruefer/dubletten';
import { nurMitClip } from '@/lib/lernapp/inhalt/pruefer/paketbau';
import { formelMusterZahl, pruefeReligionsbezug } from '@/lib/lernapp/inhalt/pruefer/religionsbezug';
import { arabischeKandidaten, arabischNormal } from '@/lib/lernapp/inhalt/pruefer/sprache';
import { baueTabuLexikon, tabuTreffer, tabuWoerter } from '@/lib/lernapp/inhalt/pruefer/tabu';
import type { TextEintrag } from '@/lib/lernapp/inhalt/pruefer/texte';
import { buchstabiert } from '@/lib/lernapp/inhalt/pruefer/uebersetzung';
import { vokalLuecken } from '@/lib/lernapp/inhalt/pruefer/vokalisierung';
import { ladeWaechter } from '@/lib/lernapp/inhalt/religion';
import { LeitfadenSchema } from '@/lib/lernapp/inhalt/schema';
import { TATOEBA_AUSSCHLUSS } from '@/lib/lernapp/inhalt/tatoeba';
import { textHash } from '@/lib/lernapp/paket/hash';

/**
 * Automatische Prüfer (PLAN §6.4, L3-02) am neutralen Testkurs und an veränderten Fassungen davon. Wörter des
 * Tabu-Lexikons, Koran-Wortlaut und Tatoeba-Sätze kommen zur Laufzeit aus `web/inhalte` bzw. `web/daten` – in dieser Datei
 * stehen weder Tabu-Wörter noch arabische Schrift (nur Codepunkt-Escapes).
 */
const DATEN = join(import.meta.dirname, '../../../daten');
const waechter = ladeWaechter(DATEN);
const RAHMEN = inhaltsdateien(INHALT_WURZEL, ['rahmen']);
const LEITFADEN = LeitfadenSchema.parse(JSON.parse(readFileSync(join(INHALT_WURZEL, 'rahmen/leitfaden.json'), 'utf8')));
const OPTIONEN: PruefOptionen = {
  praefix: 'testkurs/',
  pfadePruefen: false,
  zusatz: RAHMEN,
  web: null,
  auszuegePruefen: false,
  waechter,
  daten: DATEN,
};
const pruefe = (quellen: readonly ImportQuelle[], extra: PruefOptionen = {}) => pruefeInhalte(quellen, { ...OPTIONEN, ...extra });

// Jeder Prüferlauf baut die Indizes (kaikki, Tanzil, Hadith, Tabu-Lexikon) neu auf; unter Last dauert das länger als die
// 5 s der Vorgabe (Tor L2: 5,9 s bei Last 4 auf 4 Kernen).
vi.setConfig({ testTimeout: 30_000 });

type Json = {
  einheit: Record<string, unknown>;
  lemmata: Record<string, unknown>[];
  saetze: Record<string, unknown>[];
  lektionen: Record<string, unknown>[];
};
function geaendert(sprache: 'de' | 'tr' | 'ar', aendere: (d: Json) => void): ImportQuelle[] {
  return testkursQuellen().map((q) => {
    if (!q.pfad.includes(`sprache/${sprache}/`)) return q;
    const d = JSON.parse(q.text) as Json;
    aendere(d);
    return { pfad: q.pfad, text: JSON.stringify(d) };
  });
}
/** Testkurs-Quellen mit der Testeinheit an der Stelle einer Einheit des Rahmenplans (`<kurs>.a1.test` → `<kurs>.a1.e01`). */
const alsRahmenEinheit = (quellen: readonly ImportQuelle[]): ImportQuelle[] =>
  quellen.map((q) => ({
    pfad: q.pfad.replace(/\.a1\.test\.json$/, '.a1.e01.json'),
    text: q.text.replace(/\b(de|tr|ar)\.a1\.test\b/g, '$1.a1.e01'),
  }));
const von = (b: ReturnType<typeof pruefe>, pruefer: string, schwere = 'blockierend') =>
  b.befunde.filter((x) => x.pruefer === pruefer && x.schwere === schwere);
const ARABISCH = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFE]/;

const ordner: string[] = [];
const tempOrdner = () => {
  const o = mkdtempSync(join(tmpdir(), 'igmg-lernapp-pruefer-'));
  ordner.push(o);
  return o;
};
afterAll(() => ordner.forEach((o) => rmSync(o, { recursive: true, force: true })));

describe('Testkurs', () => {
  it('ist grün: keine blockierenden Befunde, nichts für Menschen', () => {
    const b = pruefe(testkursQuellen());
    expect(blockierende(b).map(befundZeile)).toEqual([]);
    expect(menschlich(b).map(befundZeile)).toEqual([]);
    expect(b.abgebrochen).toBe(false);
    expect(b.eintraege).toBeGreaterThan(50);
  });
});

describe('Satzlänge, Wortschatz, Lemma-Budget, Abdeckung', () => {
  it('A1: mehr als 8 Wörter in einem Satz sind blockierend', () => {
    const b = pruefe(geaendert('de', (d) => (d.saetze[0]!.text = 'Ich trinke heute am Morgen ein großes Glas kaltes Wasser.')));
    expect(von(b, 'satzlaenge').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.test\.s0001: 10 Wörter in einem Satz \(A1 höchstens 8\)/),
    ]);
  });

  it('Wörter weit über A1 (selten, kein Lemma) über der Toleranz sind blockierend', () => {
    const b = pruefe(geaendert('de', (d) => (d.saetze[0]!.text = 'Photosynthese und Kernspintomografie.')));
    expect(von(b, 'wortschatz').map(befundZeile)).toEqual([expect.stringMatching(/de\.a1\.test: .* über A1 \(2 von \d+; erlaubt ≤ 5 %\)/)]);
  });

  it('ein Lemma einer späteren Einheit derselben Stufe ist ein Vorgriff (Warnung), kein Wort über der Stufe', () => {
    const quellen = geaendert('de', (d) => (d.saetze[0]!.text = 'Kernspintomografie ist neu.'));
    const zweite = quellen
      .filter((q) => q.pfad.includes('sprache/de/'))
      .map((q) => {
        const d = JSON.parse(q.text.replaceAll('de.a1.test', 'de.a1.e02')) as Json;
        d.einheit.reihenfolge = 2;
        d.lemmata[0]!.lemma = 'Kernspintomografie';
        return { pfad: 'testkurs/sprache/de/a1/de.a1.e02.json', text: JSON.stringify(d) };
      });
    const b = pruefe([...quellen, ...zweite]);
    expect(von(b, 'wortschatz').map(befundZeile)).toEqual([]);
    expect(von(b, 'wortschatz', 'warnung').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.test: Vorgriff auf Lemmata späterer Einheiten in de\.a1\.test\.s0001/),
    ]);
  });

  it('Lemma-Budget der Einheit aus dem Rahmenplan', () => {
    // Testeinheit an der Stelle von de.a1.e01 (Budget 40 im Rahmenplan; die Testeinheit selbst steht nicht darin)
    const b = pruefe(
      alsRahmenEinheit(
        geaendert('de', (d) => {
          // Testkurs: 7 Lemmata (w001–w005, m001, m002); dazu w006–w043 → 45
          for (let i = 6; i <= 43; i++)
            d.lemmata.push({
              schluessel: `de.a1.test.w${String(i).padStart(3, '0')}`,
              lemma: `Testwort${i}`,
              quelle: 'test:x',
              lizenz: 'CC-BY-SA-4.0',
            });
        }),
      ),
    );
    expect(von(b, 'lemmabudget').map(befundZeile)).toEqual([expect.stringMatching(/de\.a1\.e01: 45 Lemmata, Budget der Einheit 40/)]);
  });

  it('eine Einheit, die nicht im Rahmenplan steht, ist blockierend; die Abdeckung je Stufe steht im Bericht', () => {
    // außerhalb des Testkurses (ohne Vorsilbe testkurs/): de.a2.e15 steht nicht im Rahmenplan; die Testeinheiten
    // `<kurs>.a1.test` gehören nicht zum Rahmenplan und ergeben keinen Befund
    const neu = testkursQuellen()
      .filter((q) => q.pfad.includes('sprache/de/'))
      .map((q) => ({
        pfad: 'sprache/de/a2/de.a2.e15.json',
        text: q.text.replaceAll('de.a1.test', 'de.a2.e15').replace('"stufe":"a1"', '"stufe":"a2"'),
      }));
    const b = pruefe([...testkursQuellen(), ...neu]);
    expect(von(b, 'abdeckung').map(befundZeile)).toEqual([expect.stringMatching(/de\.a2\.e15: Einheit steht nicht im Rahmenplan/)]);
    expect(b.abdeckung).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kurs: 'de', stufe: 'a1', einheiten: 0, einheitenRahmen: 12, budget: 600, vollstaendig: false }),
      ]),
    );
    // Quelle test: gehört nur in den Testkurs (Stufe C, L15-1)
    expect(von(b, 'lizenz').map((x) => x.datei)).toEqual(expect.arrayContaining(['sprache/de/a2/de.a2.e15.json']));
    expect(von(b, 'lizenz').every((x) => x.datei === 'sprache/de/a2/de.a2.e15.json')).toBe(true);
    expect(von(b, 'lizenz')[0]!.text).toMatch(/Quelle test: gehört nur in den Testkurs/);
    // in den Dateien des Testkurses (Vorsilbe testkurs/) ist die Quelle test: zulässig, auch an der Stelle von e01
    const imTestkurs = pruefe(alsRahmenEinheit(testkursQuellen()));
    expect(von(imTestkurs, 'lizenz')).toEqual([]);
  });
});

describe('Dubletten', () => {
  it('exakt gleicher Satz ist blockierend, umgestellte Wörter sind nahe Dubletten', () => {
    const exakt = pruefe(geaendert('de', (d) => (d.saetze[2]!.text = 'Das Haus ist groß!')));
    expect(von(exakt, 'dubletten').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.test\.s0003: Satz doppelt \(gleich de\.a1\.test\.s0002\)/),
    ]);
    const nahe = pruefe(geaendert('de', (d) => (d.saetze[2]!.text = 'Groß ist das Haus.')));
    expect(von(nahe, 'dubletten', 'warnung').map(befundZeile)).toEqual([
      expect.stringMatching(/s0003: fast gleich wie de\.a1\.test\.s0002 \(Jaccard 1\.00\)/),
    ]);
    expect(von(nahe, 'dubletten').map(befundZeile)).toEqual([expect.stringMatching(/2 von 9 Sätzen fast gleich/)]);
  });

  it('Präfix-Filter findet dieselben Paare wie der Vergleich aller Paare', () => {
    const woerter = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'];
    const saetze = Array.from({ length: 300 }, (_, i) => ({
      datei: 'x',
      schluessel: `s${i}`,
      menge: [...new Set(Array.from({ length: 10 }, (_, j) => woerter[(i * 7 + j * (i % 5 === 0 ? 1 : 3)) % 12]!))],
    }));
    const jaccard = (a: string[], b: string[]) => {
      const s = new Set(a);
      const n = b.filter((x) => s.has(x)).length;
      return n / (a.length + b.length - n);
    };
    const alle: string[] = [];
    for (let i = 0; i < saetze.length; i++)
      for (let j = 0; j < i; j++) if (jaccard(saetze[i]!.menge, saetze[j]!.menge) >= 0.9) alle.push(`${j}-${i}`);
    expect(alle.length).toBeGreaterThan(100);
    expect(
      nahePaare(saetze)
        .map(([a, b]) => `${a}-${b}`)
        .sort(),
    ).toEqual(alle.sort());
  });
});

describe('Abgleich-Selbsttest', () => {
  it('Ablenker mit gleicher Übersetzung, Wortbank-Ablenker aus der Lösung und doppelte Alternativen sind blockierend', () => {
    const quellen = geaendert('de', (d) => {
      // l01.a03: Wortbank „Ich trinke Wasser.“ mit dem Ablenker „Wasser“
      (d.lektionen[0]!.aufgaben as Record<string, unknown>[])[2]!.ablenker = ['Wasser'];
    }).map((q) => {
      if (!q.pfad.includes('uebersetzung/de-aus-tr/')) return q;
      const u = JSON.parse(q.text) as { eintraege: { bezug: string; text: string; alternativen?: string[] }[] };
      // w002 (Ablenker in l01.a01) bekommt dieselbe Übersetzung wie das Ziel w001; s0002 eine doppelte Alternative
      const w001 = u.eintraege.find((e) => e.bezug.endsWith('.w001'))!;
      u.eintraege.find((e) => e.bezug.endsWith('.w002'))!.text = w001.text;
      const s0002 = u.eintraege.find((e) => e.bezug.endsWith('.s0002'))!;
      s0002.alternativen = [`${s0002.text} `.trim().toUpperCase()];
      return { pfad: q.pfad, text: JSON.stringify(u) };
    });
    const zeilen = von(pruefe(quellen), 'abgleich').map(befundZeile);
    expect(zeilen).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/de\.a1\.test\.s0002@de-aus-tr: Alternative 1 gleich dem Haupttext/),
        expect.stringMatching(/de\.a1\.test\.l01\.a01: Ablenker mit gleicher Übersetzung wie das Ziel \(de-aus-tr\)/),
        expect.stringMatching(/de\.a1\.test\.l01\.a02: Paare: gleiche Übersetzung zu de\.a1\.test\.w001 \(de-aus-tr\)/),
        expect.stringMatching(/de\.a1\.test\.l01\.a03: Wortbank: Ablenker ist ein Wort der Lösung/),
      ]),
    );
  });
});

describe('Abgleich-Selbsttest: Vorlagen aus L2-01 (Lektion l03)', () => {
  type Aufgaben = Record<string, unknown>[];
  it('Lücke, Freitext, Satzbau und Harakat mit zufällig richtigem Ablenker bzw. doppelter Alternative sind blockierend', () => {
    const de = geaendert('de', (d) => {
      const l03 = d.lektionen[2]!.aufgaben as Aufgaben;
      l03[1]!.alternativen = ['brot']; // frei: Ziel „Brot“
      // minimalpaare: Ablenker mit gleichem Schlüssel wie das Ziel lehnt schon das Schema ab
      l03[6]!.ablenker = ['trinke', 'trinkt']; // luecke: „Ich trinke Wasser.“, Wort 1
      l03[7]!.alternativen = ['das Haus ist groß']; // satzbau: gleich dem Zielsatz
    });
    const ar = geaendert('ar', (d) => {
      const w004 = d.lemmata.find((l) => String(l.schluessel).endsWith('.w004'))!.lemma as string;
      const l03 = d.lektionen[2]!.aufgaben as Aufgaben;
      l03[9]!.varianten = [w004]; // harakat: Variante = Ziel
    }).filter((q) => q.pfad.includes('sprache/ar/'));
    const zeilen = von(pruefe([...de.filter((q) => !q.pfad.includes('sprache/ar/')), ...ar]), 'abgleich').map(befundZeile);
    expect(zeilen).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/de\.a1\.test\.l03\.a02: Alternative gleich dem Zieltext/),
        expect.stringMatching(/de\.a1\.test\.l03\.a07: Lücke: Ablenker gleich dem fehlenden Wort/),
        expect.stringMatching(/de\.a1\.test\.l03\.a08: Alternative gleich dem Zieltext/),
        expect.stringMatching(/ar\.a1\.test\.l03\.a10: Harakat: Variante gleich dem Ziel/),
      ]),
    );
    expect(zeilen).toHaveLength(4);
  });

  it('eigene Texte der Vorlagen werden auf Vokalisierung geprüft; ein Motiv ohne Freigabe blockiert außerhalb des Testkurses', () => {
    const ar = pruefe(
      geaendert('ar', (d) => {
        // Lücke im Arabischen als Freitext: eine Alternative ohne Vokalzeichen
        (d.lektionen[2]!.aufgaben as Aufgaben)[6]!.alternativen = ['\u0627\u0634\u0631\u0628'];
      }),
    );
    expect(von(ar, 'vokalisierung').map(befundZeile)).toEqual([expect.stringMatching(/ar\.a1\.test\.l03\.a07: nicht voll vokalisiert/)]);
    const register = { pfad: 'testkurs/symbole/symbole.json', text: readFileSync(join(INHALT_WURZEL, 'symbole/symbole.json'), 'utf8') };
    const frei = pruefe([...testkursQuellen(), register]);
    expect(von(frei, 'symbole')).toEqual([]);
    const echt = pruefe([...geaendert('de', (d) => (d.lemmata[0]!.quelle = 'redaktion')), register]);
    expect(von(echt, 'symbole').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.test\.w001: Motiv wasserglas ohne Freigabe der Redaktion \(LM-34\)/),
    ]);
  });
});

describe('Übersetzung: Kopie des Zieltexts und falsche Schrift (Stufe C, Befund G1)', () => {
  type U = { status: string; eintraege: { bezug: string; text: string; alternativen?: string[] }[] };
  /** Übersetzungsdatei einer Richtung im Testkurs ändern. */
  const uebersetzt = (richtung: string, aendere: (u: U) => void, quellen: ImportQuelle[] = testkursQuellen()) =>
    quellen.map((q) => {
      if (!q.pfad.includes(`uebersetzung/${richtung}/`)) return q;
      const u = JSON.parse(q.text) as U;
      aendere(u);
      return { pfad: q.pfad, text: JSON.stringify(u) };
    });
  const eintrag = (u: U, endung: string) => u.eintraege.find((e) => e.bezug.endsWith(endung))!;

  it('der Zieltext als Übersetzung oder Alternative (ab drei Wörtern) ist für freigegebene Einheiten blockierend', () => {
    const quellen = uebersetzt('de-aus-tr', (u) => {
      // wie de.b1.e04.s0071: der deutsche Satz steht als „türkische“ Übersetzung
      eintrag(u, '.s0001').text = 'Ich trinke Wasser.';
      eintrag(u, '.s0002').alternativen = ['das haus ist groß'];
    });
    expect(von(pruefe(quellen), 'uebersetzung').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.test\.s0001@de-aus-tr: Übersetzung gleich dem Zieltext \(nicht übersetzt\)$/),
      expect.stringMatching(/de\.a1\.test\.s0002@de-aus-tr: Alternative 1 gleich dem Zieltext \(nicht übersetzt\)$/),
    ]);
  });

  it('im Entwurf ist derselbe Treffer eine Warnung', () => {
    const b = pruefe(
      uebersetzt('de-aus-tr', (u) => {
        u.status = 'entwurf';
        eintrag(u, '.s0001').text = 'Ich trinke Wasser.';
      }),
    );
    expect(von(b, 'uebersetzung')).toEqual([]);
    expect(von(b, 'uebersetzung', 'warnung').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.test\.s0001@de-aus-tr: Übersetzung gleich/),
    ]);
  });

  it('kein Befund: Gleichheit unter drei Wörtern (Lehnwort, Name, kurze Wendung), Buchstabiersätze, Zahlen in *-aus-ar', () => {
    // de s0004 als Buchstabiersatz; seine Übersetzungen bleiben Lateinschrift (auch in de-aus-ar)
    let quellen = geaendert('de', (d) => (d.saetze.find((s) => String(s.schluessel).endsWith('.s0004'))!.text = 'Jan. J – A – N.'));
    quellen = uebersetzt(
      'de-aus-tr',
      (u) => {
        eintrag(u, '.w001').text = 'Wasser';
        eintrag(u, '.s0007').text = 'Danke, gut.';
        eintrag(u, '.s0004').text = 'Jan. J – A – N.';
      },
      quellen,
    );
    quellen = uebersetzt('de-aus-ar', (u) => (eintrag(u, '.s0004').text = 'J – A – N.'), quellen);
    quellen = uebersetzt('tr-aus-ar', (u) => (eintrag(u, '.s0002').alternativen = ['3.']), quellen);
    const b = pruefe(quellen);
    expect([...von(b, 'uebersetzung'), ...von(b, 'uebersetzung', 'warnung')].map(befundZeile)).toEqual([]);
  });

  it('lateinische Schrift in *-aus-ar und arabische in *-aus-de/*-aus-tr sind blockierend', () => {
    let quellen = uebersetzt('de-aus-ar', (u) => (eintrag(u, '.w002').text = 'Brot'));
    quellen = uebersetzt('tr-aus-de', (u) => (eintrag(u, '.w003').alternativen = ['Haus \u0628\u064E\u064A\u0652\u062A']), quellen);
    expect(von(pruefe(quellen), 'uebersetzung').map(befundZeile).sort()).toEqual([
      expect.stringMatching(/de\.a1\.test\.w002@de-aus-ar: Übersetzung in falscher Schrift \(Ausgangssprache ar\)$/),
      expect.stringMatching(/tr\.a1\.test\.w003@tr-aus-de: Alternative 1 in falscher Schrift \(Ausgangssprache de\)$/),
    ]);
  });

  it('Buchstabiersatz: mindestens drei Einzelbuchstaben mit Strich', () => {
    expect(buchstabiert('Konrad. K – O – N – R – A – D.')).toBe(true);
    expect(buchstabiert('Can: C-A-N.')).toBe(true);
    expect(buchstabiert('Schreib mir eine E-Mail.')).toBe(false);
    expect(buchstabiert('Wir fahren mit der U-Bahn.')).toBe(false);
    expect(buchstabiert('A – B')).toBe(false);
  });
});

describe('Paketbau-Probe (Stufe C, Z-L14 Nacharbeit 3)', () => {
  type Aufgaben = Record<string, unknown>[];

  it('verworfene Aufgaben (Satzbau, Harakat, Lücke) sind je Richtung blockierend, mit dem Grund des Paketbaus', () => {
    const de = geaendert('de', (d) => {
      // l03.a08 Satzbau „Das Haus ist groß.“: eine Fassung aus anderen Wörtern als den Kacheln
      (d.lektionen[2]!.aufgaben as Aufgaben)[7]!.alternativen = ['Das Haus ist sehr groß.'];
    });
    const ar = geaendert('ar', (d) => {
      const l03 = d.lektionen[2]!.aufgaben as Aufgaben;
      // l03.a10 Harakat zu w004: eine Variante mit Alif am Ende (anderes Gerüst)
      l03[9]!.varianten = ['\u0643\u064E\u062A\u064E\u0627\u0628', '\u0643\u0650\u062A\u064E\u0627\u0628\u064B\u0627'];
      // l03.a07 Lücke (Wort 1, das Verb): zwei Ablenker, die sich nur in den Vokalzeichen unterscheiden
      l03[6]!.ablenker = ['\u062A\u064E\u0634\u0652\u0631\u064E\u0628\u064F', '\u062A\u064F\u0634\u0652\u0631\u064E\u0628\u064F'];
    }).filter((q) => q.pfad.includes('sprache/ar/'));
    const zeilen = von(pruefe([...de.filter((q) => !q.pfad.includes('sprache/ar/')), ...ar]), 'paketbau').map(befundZeile);
    expect(zeilen.sort()).toEqual([
      expect.stringMatching(/ar\.a1\.test\.l03\.a07: Paketbau verwirft die Aufgabe \(ar-aus-de\): Optionen doppelt$/),
      expect.stringMatching(/ar\.a1\.test\.l03\.a07: Paketbau verwirft die Aufgabe \(ar-aus-tr\): Optionen doppelt$/),
      expect.stringMatching(/ar\.a1\.test\.l03\.a10: Paketbau verwirft die Aufgabe \(ar-aus-de\): Optionen mit verschiedenem Gerüst$/),
      expect.stringMatching(/ar\.a1\.test\.l03\.a10: Paketbau verwirft die Aufgabe \(ar-aus-tr\): Optionen mit verschiedenem Gerüst$/),
      expect.stringMatching(/de\.a1\.test\.l03\.a08: Paketbau verwirft die Aufgabe \(de-aus-ar\): Fassung 2 passt nicht zu den Kacheln$/),
      expect.stringMatching(/de\.a1\.test\.l03\.a08: Paketbau verwirft die Aufgabe \(de-aus-tr\): Fassung 2 passt nicht zu den Kacheln$/),
    ]);
  });

  it('im Entwurf ist eine verworfene Aufgabe eine Warnung; eine fehlende Übersetzung nennt den Verweis als Grund', () => {
    const quellen = geaendert('de', (d) => {
      (d as Json & { status: string }).status = 'entwurf';
      (d.lektionen[2]!.aufgaben as Aufgaben)[7]!.alternativen = ['Das Haus ist sehr groß.'];
    });
    const b = pruefe(quellen);
    expect(von(b, 'paketbau')).toEqual([]);
    expect(von(b, 'paketbau', 'warnung').map(befundZeile)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/de\.a1\.test\.l03\.a08: Paketbau verwirft die Aufgabe \(de-aus-tr\): Fassung 2 passt nicht/),
        expect.stringMatching(/de\.a1\.test\.l03\.a08: Paketbau verwirft die Aufgabe \(de-aus-ar\): Fassung 2 passt nicht/),
      ]),
    );
    // Übersetzung von s0001 fehlt in de-aus-tr: die Wortbank l01.a03 (Ziel und Übersetzung nötig) fällt dort weg
    const ohne = pruefe(
      testkursQuellen().map((q) => {
        if (!q.pfad.includes('uebersetzung/de-aus-tr/')) return q;
        const u = JSON.parse(q.text) as { eintraege: { bezug: string }[] };
        u.eintraege = u.eintraege.filter((e) => !e.bezug.endsWith('.s0001'));
        return { pfad: q.pfad, text: JSON.stringify(u) };
      }),
    );
    expect(von(ohne, 'paketbau').map(befundZeile)).toEqual([
      expect.stringMatching(
        /de\.a1\.test\.l01\.a03: Paketbau verwirft die Aufgabe \(de-aus-tr\): Verweis ohne Übersetzung \(de\.a1\.test\.s0001\)$/,
      ),
    ]);
  });

  it('ein fehlender Tipp in einer Ausgangssprache ist nur im Testkurs (keine arabischen Tipps) eine Warnung, sonst blockierend', () => {
    const tippFehlt = [
      expect.stringMatching(
        /de\.a1\.test\.l04\.a04: Paketbau lässt die Aufgabe weg \(de-aus-ar\): Tipp t01 fehlt für die Ausgangssprache ar$/,
      ),
      expect.stringMatching(
        /tr\.a1\.test\.l04\.a04: Paketbau lässt die Aufgabe weg \(tr-aus-ar\): Tipp t01 fehlt für die Ausgangssprache ar$/,
      ),
    ];
    expect(von(pruefe(testkursQuellen()), 'paketbau', 'warnung').map(befundZeile).sort()).toEqual(tippFehlt);
    // dieselben Dateien als echte Inhalte (ohne die Vorsilbe des Testkurses): freigegeben, also blockierend
    const echt = pruefe(
      testkursQuellen().map((q) => ({ ...q, pfad: q.pfad.replace(/^testkurs\//, '') })),
      { praefix: '' },
    );
    expect(von(echt, 'paketbau', 'warnung')).toEqual([]);
    expect(von(echt, 'paketbau').map(befundZeile).sort()).toEqual(tippFehlt);
  });

  it('fehlt einer freigegebenen Einheit die Übersetzungsdatei einer Richtung, ist das blockierend, auch je Aufgabe; im Entwurf nicht', () => {
    const ohneDatei = (quellen: ImportQuelle[]) => quellen.filter((q) => !q.pfad.includes('uebersetzung/de-aus-tr/'));
    const zeilen = von(pruefe(ohneDatei(testkursQuellen())), 'paketbau').map(befundZeile);
    expect(zeilen[0]).toMatch(/de\.a1\.test: Übersetzungsdatei der Richtung de-aus-tr fehlt \(freigegebene Einheit\)$/);
    expect(zeilen.slice(1)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/de\.a1\.test\.l01\.a03: Paketbau verwirft die Aufgabe \(de-aus-tr\): Verweis ohne Übersetzung/),
      ]),
    );
    expect(zeilen.length).toBeGreaterThan(10);
    expect(zeilen.every((z) => z.includes('de-aus-tr'))).toBe(true);
    // Entwurf ohne Übersetzungsdatei (wie B2): die Richtung wird nicht geprüft
    const entwurf = pruefe(ohneDatei(geaendert('de', (d) => ((d as Json & { status: string }).status = 'entwurf'))));
    expect(von(entwurf, 'paketbau')).toEqual([]);
    expect(von(entwurf, 'paketbau', 'warnung').filter((x) => x.text.includes('de-aus-tr'))).toEqual([]);
  });

  it('Hör-Aufgaben ohne Vorgabe, die nur mit Clip spielbar sind, sind ausgenommen', () => {
    const quellen = geaendert('de', (d) => {
      const a = (d.lektionen[3]!.aufgaben as Aufgaben).find((x) => x.typ === 'schrift_latein')!;
      delete a.vorgabe;
      a.hoeren = 'de.a1.test.w003';
    });
    expect(von(pruefe(quellen), 'paketbau')).toEqual([]);
    expect(
      nurMitClip({
        schluessel: 'de.a1.test.l04.a05',
        typ: 'schrift_latein',
        anweisung: 'waehleBuchstabe',
        hoeren: 'de.a1.test.w003',
        optionen: ['a', 'b'],
        richtig: 0,
      }),
    ).toBe(true);
    expect(
      nurMitClip({
        schluessel: 'de.a1.test.l04.a05',
        typ: 'schrift_latein',
        anweisung: 'waehleBuchstabe',
        vorgabe: 'H_us',
        optionen: ['a', 'b'],
        richtig: 0,
      }),
    ).toBe(false);
  });
});

describe('Arabisch: Vokalisierung vollständig', () => {
  it('voll vokalisierte Sätze des Testkurses haben keine Lücken; Pausa am Wortende ist nur ein Hinweis', () => {
    expect(vokalLuecken('\u0627\u0644\u0652\u0628\u064E\u064A\u0652\u062A\u064F \u0643\u064E\u0628\u0650\u064A\u0631\u064C.')).toEqual([]);
    expect(vokalLuecken('\u0628\u064E\u064A\u0652\u062A').map((l) => l.art)).toEqual(['ende']);
    // Artikel vor Sonnenbuchstabe (Schadda), langer Vokal nach Kasra, Alif maqsura
    expect(
      vokalLuecken('\u0627\u0644\u0634\u0651\u064E\u0645\u0652\u0633\u064F \u0641\u0650\u064A \u0639\u064E\u0644\u064E\u0649'),
    ).toEqual([]);
  });

  it('fehlende Zeichen, Schadda ohne Vokal und Zeichen ohne Buchstaben werden gemeldet (nur Position und Codepunkt)', () => {
    expect(vokalLuecken('\u0627\u0644\u0628\u064A\u062A')).toEqual([
      { wort: 1, zeichen: 3, codepunkt: 'U+0628', art: 'fehlt' },
      { wort: 1, zeichen: 4, codepunkt: 'U+064A', art: 'fehlt' },
      { wort: 1, zeichen: 5, codepunkt: 'U+062A', art: 'ende' },
    ]);
    expect(vokalLuecken('\u0645\u064F\u062F\u0651\u064E\u0631\u0651\u0633\u064C').map((l) => l.art)).toEqual(['schadda']);
    expect(vokalLuecken('\u064E\u0628\u064E').map((l) => l.art)).toEqual(['ohne_buchstabe']);
  });

  it('im Kurs: nicht vokalisierter Satz ist blockierend, die Meldung enthält keine arabische Schrift', () => {
    const b = pruefe(geaendert('ar', (d) => (d.saetze[1]!.text = '\u0627\u0644\u0628\u064A\u062A \u0643\u0628\u064A\u0631.')));
    const zeilen = von(b, 'vokalisierung').map(befundZeile);
    expect(zeilen).toEqual([
      expect.stringMatching(/ar\.a1\.test\.s0002: nicht voll vokalisiert: Wort 1, Zeichen 3 \(U\+0628\): ohne Vokalzeichen/),
    ]);
    expect(zeilen.join('\n')).not.toMatch(ARABISCH);
  });
});

describe('kindgeeignet (A1–B1 Pflicht)', () => {
  it('Einheit ohne bzw. mit false und ausgenommene Lektion sind blockierend', () => {
    const b = pruefe(
      geaendert('tr', (d) => {
        delete d.einheit.kinderGeeignet;
        d.lektionen[0]!.kinderGeeignet = false;
      }),
    );
    expect(von(b, 'kinder').map(befundZeile)).toEqual([
      expect.stringMatching(/tr\.a1\.test: A1: einheit\.kinderGeeignet: true ist Pflicht/),
      expect.stringMatching(/tr\.a1\.test\.l01: A1: Lektion darf nicht ausgenommen sein/),
    ]);
  });

  it('Rahmenplan: Einheit in A1 mit kinderGeeignet false ist blockierend', () => {
    const rahmen = RAHMEN.map((q) =>
      q.pfad === 'rahmen/tr.rahmen.json' ? { pfad: q.pfad, text: q.text.replace('"kinderGeeignet": true', '"kinderGeeignet": false') } : q,
    );
    const b = pruefe(testkursQuellen(), { zusatz: rahmen });
    expect(von(b, 'kinder').map(befundZeile)).toEqual([
      expect.stringMatching(/rahmen\/tr\.rahmen\.json: tr\.a1\.e01: A1: kinderGeeignet muss true sein/),
    ]);
  });
});

describe('Lizenz und Herkunft', () => {
  const tatoeba = readFileSync(join(DATEN, 'tatoeba/saetze_deu.tsv'), 'utf8')
    .split('\n')
    .slice(1)
    .map((z) => z.split('\t'))
    .find((z) => z[3] !== '\\N' && z[8] === '0' && !z[9]?.includes('@') && z[2]!.split(' ').length <= 6)!;
  const [id, , text, benutzer] = tatoeba as [string, string, string, string];
  const mitTatoeba = (satz: Record<string, unknown>) =>
    pruefe(
      geaendert('de', (d) =>
        Object.assign(d.saetze[0]!, {
          text,
          quelle: `tatoeba:${id}`,
          lizenz: 'CC-BY-2.0-FR',
          namensnennung: `Satz #${id} von ${benutzer}`,
          ...satz,
        }),
      ),
    );

  it('Tatoeba-Satz wie im Auszug mit Namensnennung ist in Ordnung', () => {
    expect(von(mitTatoeba({}), 'lizenz').map(befundZeile)).toEqual([]);
  });

  it('falsche Namensnennung, verändert ohne Vermerk, falsche Lizenz, ausgeschlossene ID sind blockierend', () => {
    expect(von(mitTatoeba({ namensnennung: 'Tatoeba' }), 'lizenz').map(befundZeile)).toEqual([
      expect.stringMatching(/Namensnennung „Satz #\d+ von .*“ fehlt/),
    ]);
    expect(von(mitTatoeba({ text: `${text} Heute.` }), 'lizenz').map(befundZeile)).toEqual([
      expect.stringMatching(/Text weicht vom Tatoeba-Satz \d+ ab/),
    ]);
    expect(von(mitTatoeba({ text: `${text} Heute.`, namensnennung: `Satz #${id} von ${benutzer}, bearbeitet` }), 'lizenz')).toEqual([]);
    expect(von(mitTatoeba({ lizenz: 'CC0-1.0' }), 'lizenz').map(befundZeile)).toEqual([
      expect.stringMatching(/Lizenz CC0-1\.0 statt CC-BY-2\.0-FR/),
    ]);
    const aus = [...TATOEBA_AUSSCHLUSS][0]!;
    expect(von(mitTatoeba({ quelle: `tatoeba:${aus}`, namensnennung: `Satz #${aus}` }), 'lizenz').map(befundZeile)).toEqual([
      expect.stringMatching(new RegExp(`Tatoeba-Satz ${aus} ausgeschlossen`)),
    ]);
  });

  it('eigene Inhalte nur unter CC BY-SA 4.0; Wiktionary mit Namensnennung; ausgeschlossene Quellen', () => {
    const b = pruefe(
      geaendert('de', (d) => {
        Object.assign(d.saetze[0]!, { lizenz: 'CC-BY-4.0', namensnennung: '[Name]' });
        Object.assign(d.lemmata[0]!, { quelle: 'wiktionary:en:Wasser', lizenz: 'CC-BY-SA-4.0' });
        Object.assign(d.lemmata[1]!, { quelle: 'ki:l3/shamela-auszug', lizenz: 'CC-BY-SA-4.0' });
      }),
    );
    expect(von(b, 'lizenz').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.test\.w001: Namensnennung für Wiktionary-Daten fehlt/),
      expect.stringMatching(/de\.a1\.test\.s0001: eigene Inhalte stehen unter CC BY-SA 4\.0 \(nicht CC-BY-4\.0/),
    ]);
    expect(von(b, 'ausschluss').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.test\.w002: ausgeschlossene Quelle: al-Maktaba al-Shamila/),
    ]);
  });
});

describe('Inhaltsleitfaden (Tabu-Lexikon) → menschlich_klaeren, Ausgabe nur mit Kategorie-ID', () => {
  const kategorie = LEITFADEN.tabu.kategorien.find((k) => k.id === 'gluecksspiel')!;
  const wort = kategorie.formen.de.wort![0]!;

  it('ein Treffer in A1 geht an Menschen; die Meldung nennt die Kategorie, nicht das Wort', () => {
    const b = pruefe(geaendert('de', (d) => (d.saetze[0]!.text = `Das ist ${wort[0]!.toUpperCase()}${wort.slice(1)}.`)));
    const zeilen = von(b, 'tabu', 'mensch').map(befundZeile);
    expect(zeilen).toEqual([
      expect.stringMatching(/de\.a1\.test\.s0001: Inhaltsleitfaden: Treffer \(Regel nur_sachlich\) – menschlich_klaeren \[gluecksspiel\]$/),
    ]);
    expect(zeilen.join('\n').toLowerCase()).not.toContain(wort.toLowerCase());
    expect(blockierende(b)).toEqual(blockierende(b).filter((x) => x.pruefer !== 'tabu'));
  });

  it('Ausnahmen, Phrasen-Ausnahmen und Kontext greifen; Arabisch über kaikki-Muster zur Laufzeit', () => {
    const lexikon = baueTabuLexikon(LEITFADEN, DATEN);
    const alkohol = LEITFADEN.tabu.kategorien.find((k) => k.id === 'alkohol_rauschmittel')!;
    const ausnahme = alkohol.formen.de.ausnahmen![0]!;
    expect(tabuTreffer(`Wir sehen ${ausnahme}.`, 'de', lexikon).filter((t) => t.kategorie === 'alkohol_rauschmittel')).toEqual([]);
    const hund = LEITFADEN.tabu.kategorien.find((k) => k.id === 'hund_im_haus')!;
    const tier = hund.formen.de.anfang![0]!;
    expect(tabuTreffer(`Der ${tier} läuft im Park.`, 'de', lexikon).map((t) => t.kategorie)).not.toContain('hund_im_haus');
    expect(tabuTreffer(`Der ${tier} schläft in der ${hund.formen.de.kontext![0]}.`, 'de', lexikon).map((t) => t.kategorie)).toContain(
      'hund_im_haus',
    );
    // arabisches Muster aus dem Lexikon (zur Laufzeit aus web/daten/kaikki gebildet), mit Klitikum wa-
    const muster = [...lexikon.kategorien.find((k) => k.id === 'gluecksspiel')!.ar.muster.ganz][0]!;
    expect(muster).toBeDefined();
    expect(tabuTreffer(`\u0648${muster}`, 'ar', lexikon).map((t) => t.kategorie)).toContain('gluecksspiel');
    expect(tabuTreffer('\u0630\u0647\u0628\u062A \u0625\u0644\u0649 \u0627\u0644\u0633\u0648\u0642', 'ar', lexikon)).toEqual([]);
  });

  // Register aus kaikki: Urteil je Wortform über alle Einträge (erfundene Wörter in einem eigenen Kernauszug)
  const REGISTER = ['fluchen_schimpfwoerter', 'sexualitaet'];
  const registerVon = (text: string, lexikon: ReturnType<typeof baueTabuLexikon>) =>
    tabuTreffer(text, 'de', lexikon)
      .filter((t) => REGISTER.includes(t.kategorie))
      .map((t) => `${t.kategorie}${t.hinweis ? ' (Hinweis)' : ''}`);
  const eigenerAuszug = (eintraege: Record<string, unknown>[]) => {
    const d = tempOrdner();
    mkdirSync(join(d, 'kaikki'));
    writeFileSync(join(d, 'kaikki/kaikki-kern-de-top20000.jsonl'), eintraege.map((e) => JSON.stringify({ l: 'de', ...e })).join('\n'));
    return baueTabuLexikon(LEITFADEN, d);
  };

  it('Register: echtes Register-Wort bleibt Treffer, auch neben unmarkierten Einträgen anderer Ausgaben', () => {
    const lexikon = eigenerAuszug([
      {
        w: 'Zorpel',
        q: 'en',
        pos: 'noun',
        gl: [
          ['x', 'vulgar'],
          ['y', 'derogatory'],
        ],
        mk: ['vulgar', 'derogatory'],
      },
      { w: 'Zorpel', q: 'de', pos: 'noun', gl: [['x', '']] },
      { w: 'Plinse', q: 'de', pos: 'noun', gl: [['x', '']], mk: ['thema:sex'] },
      { w: 'Plinse', q: 'de', pos: 'noun', gl: [['y', 'obsolete']] },
      { w: 'Fnord', q: 'en', pos: 'noun', pl: ['Fnorde'], gl: [['x', 'vulgar']], mk: ['vulgar'] },
    ]);
    expect(registerVon('Das ist ein Zorpel.', lexikon)).toEqual(['fluchen_schimpfwoerter']);
    // eine Bedeutung mit Gebrauchsangabe (hier: obsolete) ist keine unmarkierte Bedeutung
    expect(registerVon('Das ist eine Plinse.', lexikon)).toEqual(['sexualitaet']);
    expect(registerVon('Das sind Fnorde.', lexikon)).toEqual(['fluchen_schimpfwoerter']);
  });

  it('Register: Alltagswort mit Nebeneintrag ohne überwiegend markierte Lesarten meldet nichts, teils markiert ebenso', () => {
    const lexikon = eigenerAuszug([
      // Adjektiv-Eintrag ganz markiert, Nomen derselben Ausgabe unmarkiert
      { w: 'quarpe', q: 'en', pos: 'adj', gl: [['x', 'vulgar']], mk: ['vulgar'] },
      {
        w: 'Quarpe',
        q: 'en',
        pos: 'noun',
        gl: [
          ['y', ''],
          ['z', 'colloquial'],
        ],
      },
      // Nomen ganz markiert, dieselbe Form ist Präteritum eines Verbs ohne Register
      { w: 'Klumm', q: 'de', pos: 'noun', gl: [['x', 'derogatory']], mk: ['derogatory'] },
      { w: 'klimmen', q: 'en', pos: 'verb', kf: [['klumm', 'past']], gl: [['y', '']] },
      // über den Plural: der Plural ist zugleich ein unmarkiertes Wort derselben Ausgabe
      { w: 'Glumpf', q: 'en', pos: 'noun', pl: ['Glumpfe'], gl: [['x', 'offensive']], mk: ['offensive'] },
      { w: 'Glumpfe', q: 'en', pos: 'noun', gl: [['y', '']] },
      // nur teils markiert
      {
        w: 'Wobbel',
        q: 'en',
        pos: 'noun',
        gl: [
          ['x', 'vulgar'],
          ['y', ''],
        ],
        mk: ['vulgar'],
      },
    ]);
    expect(registerVon('Die Quarpe ist rot.', lexikon)).toEqual([]);
    expect(registerVon('Er klumm hoch.', lexikon)).toEqual([]);
    expect(registerVon('Ein Glumpf.', lexikon)).toEqual(['fluchen_schimpfwoerter']);
    expect(registerVon('Zwei Glumpfe.', lexikon)).toEqual([]);
    expect(registerVon('Der Wobbel.', lexikon)).toEqual([]);
  });

  it('Register: Nebeneintrag, dessen markierte Lesarten in einer Ausgabe überwiegen, ergibt einen Hinweis', () => {
    const lexikon = eigenerAuszug([
      // de: Interjektion ganz markiert neben unmarkiertem Nomen (1:1); en: Nomen mit markierter Hauptbedeutung (1:0)
      { w: 'Frulle', q: 'de', pos: 'intj', gl: [['x', 'derogatory']], mk: ['derogatory'] },
      {
        w: 'Frulle',
        q: 'de',
        pos: 'noun',
        gl: [
          ['y', ''],
          ['z', ''],
        ],
      },
      {
        w: 'Frulle',
        q: 'en',
        pos: 'noun',
        gl: [
          ['x', 'derogatory vulgar'],
          ['z', ''],
        ],
        mk: ['derogatory', 'vulgar'],
      },
      // de ganz markiert; en unmarkiert und mit sich selbst als Beugungsform (keine fremde Lesart wie ein Präteritum)
      { w: 'Absteiper', q: 'de', pos: 'noun', gl: [['x', 'derogatory']], mk: ['derogatory'] },
      { w: 'Absteiper', q: 'en', pos: 'noun', kf: [['Absteiper', 'nominative singular']], gl: [['y', '']] },
      // dasselbe mit Präteritum eines anderen Verbs: die fremde Lesart wiegt in jeder Ausgabe, still
      { w: 'Klumm', q: 'de', pos: 'noun', gl: [['x', 'derogatory']], mk: ['derogatory'] },
      { w: 'klimmen', q: 'en', pos: 'verb', kf: [['klumm', 'past']], gl: [['y', '']] },
    ]);
    expect(registerVon('Halt die Frulle.', lexikon)).toEqual(['fluchen_schimpfwoerter (Hinweis)']);
    expect(registerVon('Eine Absteiper.', lexikon)).toEqual(['fluchen_schimpfwoerter (Hinweis)']);
    expect(registerVon('Er klumm hoch.', lexikon)).toEqual([]);
  });

  it('Register am gepinnten Auszug: Grundwortschatz (Rang ≤ 500) ist kein Treffer, echte Register-Wörter bleiben es', () => {
    const lexikon = baueTabuLexikon(LEITFADEN, DATEN);
    for (const sprache of ['de', 'tr', 'ar'] as const) {
      const voll = (grenze: number) =>
        [...ladeHaeufigkeit(sprache, DATEN)].filter(([w, rang]) => {
          const form = sprache === 'ar' ? arabischNormal(w) : tabuWoerter(w, sprache).join(' ');
          return rang <= grenze && (lexikon.register[sprache].get(form) ?? []).length > 0;
        }).length;
      expect(voll(500), sprache).toBe(0);
      if (sprache !== 'ar') expect(voll(2000), sprache).toBeGreaterThan(0);
    }
  });

  // Wiederkehrende Fehlalarme (L3-07): Teilwörter nur an Morphemgrenzen, bekannte arabische Wörter nicht zerlegen, Register-
  // Nebeneinträge nur bei überwiegend markierten Lesarten. Je Fall ein Fehlalarm ohne Befund und eine Gegenprobe; Tabu-Formen
  // nur aus dem Leitfaden bzw. dem Kernauszug zur Laufzeit.
  describe('Fehlalarme: Morphemgrenzen, bekannte Wörter, Register', () => {
    const lexikon = baueTabuLexikon(LEITFADEN, DATEN);
    const formen = (id: string) => LEITFADEN.tabu.kategorien.find((k) => k.id === id)!.formen;
    const kategorien = (text: string, sprache: 'de' | 'tr' | 'ar') =>
      tabuTreffer(text, sprache, lexikon).map((t) => `${t.kategorie}${t.hinweis ? ' (Hinweis)' : ''}`);
    // Arabisch nur als Codepunkte: Artikel, wa-, bi-l-, wa-l-, ka-l-, Pronomen-Suffix -hu
    const AL = '\u0627\u0644';
    const KLITIKA = ['\u0648', `\u0628${AL}`, AL, `\u0648${AL}`, `\u0643${AL}`];
    const HU = '\u0647';

    it('de: Teilwort mitten in einem anderen Wort trifft nicht (Verb fürs Buchstabieren), im Kompositum weiter', () => {
      const teil = formen('alkohol_rauschmittel').de.teil!.find((x) => 'buchstabieren'.includes(x))!;
      expect(teil).toBeDefined();
      for (const satz of ['Kannst du deinen Namen buchstabieren?', 'Er buchstabiert langsam.', 'Buchstabiere bitte!'])
        expect(kategorien(satz, 'de'), satz).not.toContain('alkohol_rauschmittel');
      for (const wort of [teil, `Weizen${teil}`, `Frei${teil}`, `${teil}krug`, `Malz${teil}`])
        expect(kategorien(`Das ist ${wort}.`, 'de'), wort).toContain('alkohol_rauschmittel');
    });

    it('tr: Zahlwort 80 trifft die Form an seinem Anfang nicht, Endungen und Ableitungen der Form treffen weiter', () => {
      const anfang = formen('sexualitaet').tr.anfang!.find((a) => 'seksen'.startsWith(a))!;
      expect(anfang).toBeDefined();
      for (const satz of ['Dedem seksen yaşında.', 'Seksende emekli oldu.', 'Sekseni geçti.'])
        expect(kategorien(satz, 'tr'), satz).not.toContain('sexualitaet');
      for (const wort of [anfang, `${anfang}i`, `${anfang}ten`, `${anfang}üel`])
        expect(kategorien(`Bu ${wort}.`, 'tr'), wort).toContain('sexualitaet');
      // ein längeres Wort, dessen eigene Definition die Kategorie trifft (Bombardierung), bleibt ein Treffer
      const bombe = formen('gewalt_waffen').tr.anfang!.find((a) => a.length === 5 && a.startsWith('bomb'))!;
      for (const wort of [`${bombe}rdıman`, `${bombe}rdımanı`, `${bombe}ladı`])
        expect(kategorien(`Bu ${wort}.`, 'tr'), wort).toContain('gewalt_waffen');
    });

    it('ar: die weibliche Form von „groß“ wird nicht in ka- und Rest zerlegt; der Rest mit anderen Klitika trifft weiter', () => {
      const KABIRA = '\u0643\u0628\u064A\u0631\u0629';
      for (const text of [KABIRA, `${AL}${KABIRA}`, `\u0627\u0644\u063A\u0631\u0641\u0629 ${KABIRA}`, `\u0648${KABIRA}`])
        expect(kategorien(text, 'ar')).not.toContain('alkohol_rauschmittel');
      const rest = KABIRA.slice(1);
      for (const k of KLITIKA) expect(kategorien(`${k}${rest}`, 'ar')).toContain('alkohol_rauschmittel');
      // alle arabischen Muster der Kategorie (aus kaikki zur Laufzeit) treffen mit Klitika; das Pronomen-Suffix nur an Mustern
      // ohne Tāʾ marbūṭa (normalisiert als Hāʾ): dort steht vor dem Suffix Tāʾ, und diese Form trifft nicht (vorbestehende
      // Lücke, alt wie neu; s. it.todo unten) – ein Suffix hinter dem Hāʾ wäre keine wirkliche Form
      const muster = [...lexikon.kategorien.find((k) => k.id === 'alkohol_rauschmittel')!.ar.muster.ganz];
      expect(muster.length).toBeGreaterThan(3);
      const ohneTaMarbuta = muster.filter((m) => !m.endsWith(HU));
      expect(ohneTaMarbuta.length).toBeGreaterThan(3);
      for (const m of muster) for (const k of KLITIKA) expect(kategorien(`${k}${m}`, 'ar')).toContain('alkohol_rauschmittel');
      for (const m of ohneTaMarbuta) expect(kategorien(`${m}${HU}`, 'ar')).toContain('alkohol_rauschmittel');
      // andere Prüfer rufen die Zerlegung ohne bekannte Wörter auf: unverändert
      expect(arabischeKandidaten(arabischNormal(KABIRA))).toContain(arabischNormal(rest));
    });

    // Vorbestehende Lücke (nicht Folge der Klitika-Regel): Muster mit Tāʾ marbūṭa + Pronomen-Suffix (Tāʾ vor -hu, „sein …“)
    it.todo('ar: Muster mit Tāʾ marbūṭa treffen auch mit Pronomen-Suffix (Tāʾ statt Tāʾ marbūṭa vor dem Suffix)');

    it('ar: die Staatsangehörigkeit ist nicht das Adjektiv, dessen Nisba sie ist; das Adjektiv trifft weiter', () => {
      const STAATSANGEHOERIGKEIT = '\u062C\u0646\u0633\u064A\u0629';
      for (const text of [STAATSANGEHOERIGKEIT, `${AL}${STAATSANGEHOERIGKEIT}`, `\u0648${AL}${STAATSANGEHOERIGKEIT}`])
        expect(kategorien(text, 'ar').filter((k) => k.startsWith('sexualitaet'))).toEqual([]);
      const adjektiv = STAATSANGEHOERIGKEIT.slice(0, -1);
      for (const k of ['', ...KLITIKA]) expect(kategorien(`${k}${adjektiv}`, 'ar')).toContain('sexualitaet');
    });

    it('Register: Alltagswörter mit unmarkierter Hauptlesart melden nichts, auch keinen Hinweis', () => {
      expect(kategorien('Benim bir kız kardeşim var.', 'tr')).toEqual([]);
      expect(kategorien('Kızım okula gidiyor.', 'tr')).toEqual([]);
      expect(kategorien('Hiç param yok.', 'tr')).toEqual([]);
      expect(kategorien('Der Koffer ist schwer.', 'de')).toEqual([]);
      expect(kategorien('Sie schrieb einen Brief.', 'de')).toEqual([]);
      for (const satz of [
        'Niemand ist da.',
        'Der Mensch lebt.',
        'Wir putzen die Küche.',
        'Er spricht Französisch.',
        'Das Kleid ist elegant.',
      ])
        expect(kategorien(satz, 'de'), satz).toEqual([]);
      // Gegenprobe: ganz markierte Register-Wörter des Auszugs bleiben Treffer
      for (const sprache of ['de', 'tr'] as const) {
        const treffer = [...lexikon.register[sprache]].filter(([, k]) => k.includes('fluchen_schimpfwoerter')).map(([f]) => f);
        expect(treffer.length, sprache).toBeGreaterThan(10);
        expect(kategorien(treffer[0]!, sprache), sprache).toContain('fluchen_schimpfwoerter');
      }
    });

    it('Register: Nebeneinträge mit überwiegend markierten Lesarten melden einen Hinweis, nie im Grundwortschatz', () => {
      const hinweis = (sprache: 'de' | 'tr', f: string, k: string) =>
        kategorien(sprache === 'tr' ? `Bu ${f}.` : `Das ist ${f}.`, sprache).includes(`${k} (Hinweis)`);
      // de: derbe Form, deren Nomen die deutsche Ausgabe ohne Angabe als „Mund“ führt (Interjektion und englische Hauptbedeutung derb)
      const de = ladeKaikki('de', DATEN);
      const derb = de.find(
        (e) =>
          e.q === 'de' &&
          e.pos === 'noun' &&
          e.gl?.[0]?.[0] === 'Mund' &&
          de.some((x) => x.w === e.w && x.q === 'de' && x.pos === 'intj' && x.mk?.includes('derogatory')),
      );
      expect(derb).toBeDefined();
      expect(hinweis('de', tabuWoerter(derb!.w, 'de')[0]!, 'fluchen_schimpfwoerter')).toBe(true);
      // tr: Vulgärform, deren englische Ausgabe überwiegend vulgar führt (Nebenbedeutung „slag, dross“)
      const vulgaer = ladeKaikki('tr', DATEN).find(
        (e) => e.q === 'en' && e.mk?.includes('vulgar') && e.gl?.some(([g]) => g === 'slag, dross'),
      );
      expect(vulgaer).toBeDefined();
      expect(hinweis('tr', tabuWoerter(vulgaer!.w, 'tr')[0]!, 'fluchen_schimpfwoerter')).toBe(true);
      // tr: Plural eines Register-Treffers (sexualitaet), den eine andere Ausgabe ohne Thema als Beugungsform führt
      const plural = [...lexikon.registerHinweise.tr].find(
        ([f, ks]) => ks.includes('sexualitaet') && /l[ae]r$/.test(f) && lexikon.register.tr.get(f.slice(0, -3))?.includes('sexualitaet'),
      );
      expect(plural).toBeDefined();
      expect(hinweis('tr', plural![0], 'sexualitaet')).toBe(true);
      // kein Hinweis im Grundwortschatz (Rang ≤ 1000)
      for (const sprache of ['de', 'tr'] as const) {
        const haeufig = [...ladeHaeufigkeit(sprache, DATEN)].filter(
          ([w, rang]) => rang <= 1000 && lexikon.registerHinweise[sprache].has(tabuWoerter(w, sprache).join(' ')),
        );
        expect(haeufig.length, sprache).toBe(0);
      }
    });
  });

  describe('Tipps: Fließtext in der Tipp-Sprache, Zitatblock in der Zielsprache', () => {
    const lexikon = baueTabuLexikon(LEITFADEN, DATEN);
    // Register-Treffer der Zielsprache tr, die im Deutschen sonst nichts treffen: einmal ein bekanntes deutsches Wort, einmal nicht
    const kandidaten = [...lexikon.register.tr.keys()]
      .filter((f) => /^\p{Ll}+$/u.test(f) && tabuTreffer(f, 'de', lexikon).length === 0)
      .filter((f) => JSON.stringify(tabuTreffer(f, 'tr', lexikon)) === '[{"kategorie":"fluchen_schimpfwoerter","hinweis":false}]')
      .sort();
    const auchDeutsch = kandidaten.find((f) => lexikon.bekannt.de.has(f))!;
    const nurTuerkisch = kandidaten.find((f) => !lexikon.bekannt.de.has(f))!;
    const tipp = (absatz: string, beispiel: string) =>
      testkursQuellen().map((q) => {
        if (!q.pfad.includes('uebersetzung/tr-aus-de/')) return q;
        const d = JSON.parse(q.text) as { tipps: { inhalt: { content: unknown[] } }[] };
        d.tipps[0]!.inhalt.content = [
          { type: 'paragraph', content: [{ type: 'text', text: absatz }] },
          { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: beispiel }] }] },
        ];
        return { pfad: q.pfad, text: JSON.stringify(d) };
      });
    const tippBefunde = (quellen: ImportQuelle[]) =>
      pruefe(quellen)
        .befunde.filter((x) => x.pruefer === 'tabu' && x.ort === 'tr.a1.test.de.t01')
        .map((x) => `${x.schwere} ${x.kategorie}`);

    it('ein deutsches Wort im Fließtext trifft keine gleich geschriebene türkische Form', () => {
      expect(auchDeutsch).toBeDefined();
      expect(tippBefunde(tipp(`Wir treffen uns ${auchDeutsch} Montag.`, 'Merhaba.'))).toEqual([]);
    });

    it('dieselbe Form im Zitatblock (Beispiel in der Zielsprache) trifft', () => {
      expect(tippBefunde(tipp('Wir treffen uns morgen.', `${auchDeutsch}.`))).toEqual(['mensch fluchen_schimpfwoerter']);
    });

    it('ein eingestreutes Wort der Zielsprache im Fließtext trifft weiter', () => {
      expect(nurTuerkisch).toBeDefined();
      expect(tippBefunde(tipp(`Das Wort „${nurTuerkisch}“ sagt man nicht.`, 'Merhaba.'))).toEqual(['mensch fluchen_schimpfwoerter']);
    });
  });
});

describe('Religionsbezug', () => {
  const r09 = LEITFADEN.religionsbezug.orte_ereignisse.find((o) => o.id === 'R-09')!;

  it('Begriff aus dem Leitfaden ohne Kennzeichen → menschlich_klaeren; mit Kennzeichen unter ab_stufe ebenso', () => {
    const ohne = pruefe(geaendert('tr', (d) => (d.saetze[0]!.text = `Bu ${r09.tr}.`)));
    expect(von(ohne, 'religionsbezug', 'mensch').map(befundZeile)).toEqual([
      expect.stringMatching(
        /tr\.a1\.test\.s0001: Religionsbezug-Kandidat ohne Kennzeichen religionsbezug: true – menschlich_klaeren \[R-09\]/,
      ),
    ]);
    const mit = pruefe(geaendert('tr', (d) => Object.assign(d.saetze[0]!, { text: `Bu ${r09.tr}.`, religionsbezug: true })));
    expect(von(mit, 'religionsbezug', 'mensch').map(befundZeile)).toEqual([
      expect.stringMatching(/Religionsbezug vor Stufe A2 – menschlich_klaeren \[R-09\]/),
    ]);
  });

  // Arabisch: bekannte Wörter nicht zerlegen, Hamza vergleichen (Codepunkte; Begriffe aus dem Leitfaden über kaikki)
  const religionsbezugAr = (...saetze: string[]) => {
    const texte: TextEintrag[] = saetze.map((text, i) => ({
      datei: 'sprache/ar/a1/ar.a1.test.json',
      ort: `s${i}`,
      sprache: 'ar',
      text,
      kurs: 'ar',
      stufe: 'a1',
      einheit: 'ar.a1.test',
      art: 'satz',
      religionsbezug: false,
      kinder: true,
    }));
    const inhalte = { ...leereInhalte(), leitfaden: { pfad: 'rahmen/leitfaden.json', daten: LEITFADEN } };
    const befunde = pruefeReligionsbezug(inhalte, texte, DATEN).liste;
    return saetze.map((_, i) => befunde.filter((b) => b.ort === `s${i}`).map((b) => b.kategorie));
  };

  it('Arabisch: „weit“ ist nicht bi- + Fest; das Fest mit Artikel bzw. ohne Klitikum trifft weiter', () => {
    const WEIT = '\u0628\u0639\u064A\u062F';
    const [weit, weitArtikel, weitWeiblich, fest, festArtikel] = religionsbezugAr(
      `\u0627\u0644\u0628\u064A\u062A ${WEIT}`,
      `\u0627\u0644${WEIT}`,
      `${WEIT}\u0629`,
      WEIT.slice(1),
      `\u0627\u0644${WEIT.slice(1)}`,
    );
    expect([weit, weitArtikel, weitWeiblich]).toEqual([[], [], []]);
    expect(fest).toEqual(expect.arrayContaining(['R-06', 'R-08']));
    expect(festArtikel).toEqual(expect.arrayContaining(['R-06', 'R-08']));
  });

  it('Arabisch: „vor/vorn“ (Alif mit Hamza oben) trifft R-10 nicht; Hamza unten oder Alif ohne Zeichen trifft weiter', () => {
    const MAM = '\u0645\u0627\u0645';
    const [vorn, vornVokalisiert, unten, ohne, artikel] = religionsbezugAr(
      `\u0623${MAM}`,
      `\u0623\u064E\u0645\u064E\u0627\u0645\u064E \u0627\u0644\u0628\u064E\u064A\u0652\u062A\u0650`,
      `\u0625${MAM}`,
      `\u0627${MAM}`,
      `\u0627\u0644\u0625${MAM}`,
    );
    expect([vorn, vornVokalisiert]).toEqual([[], []]);
    for (const x of [unten, ohne, artikel]) expect(x).toEqual(['R-10']);
  });

  describe('Formeln der Formelliste (Stufe C N2, Z-L10)', () => {
    type Formel = (typeof LEITFADEN.religionsbezug.formeln.liste)[number];
    const leitfaden = (status: 'gesperrt' | 'freigegeben', zusatz: Formel[] = []) => ({
      ...LEITFADEN,
      religionsbezug: {
        ...LEITFADEN.religionsbezug,
        formeln: { ...LEITFADEN.religionsbezug.formeln, status, liste: [...LEITFADEN.religionsbezug.formeln.liste, ...zusatz] },
      },
    });
    /** Befunde (Schwere und Meldung) je Text; nur die Formel `id`. */
    const befunde = (
      l: ReturnType<typeof leitfaden>,
      id: string,
      texte: { text: string; sprache: 'de' | 'tr' | 'ar'; religionsbezug?: boolean }[],
    ) => {
      const liste = pruefeReligionsbezug(
        { ...leereInhalte(), leitfaden: { pfad: 'rahmen/leitfaden.json', daten: l } },
        texte.map((t, i) => ({
          datei: `sprache/${t.sprache}/b1/${t.sprache}.b1.e01.json`,
          ort: `s${i}`,
          sprache: t.sprache,
          text: t.text,
          kurs: t.sprache,
          stufe: 'b1' as const,
          einheit: `${t.sprache}.b1.e01`,
          art: 'satz' as const,
          religionsbezug: t.religionsbezug ?? false,
          kinder: true,
        })),
        DATEN,
      ).liste;
      return texte.map((_, i) => befunde0(liste.filter((b) => b.ort === `s${i}` && b.kategorie === id)));
    };
    const befunde0 = (l: { schwere: string; text: string }[]) => l.map((b) => `${b.schwere}: ${b.text.split(' – ')[0]}`);

    it('Lateinschrift (F-tr): ohne Kennzeichen blockierend, solange die Liste gesperrt ist; mit Kennzeichen an Menschen', () => {
      const formel = LEITFADEN.religionsbezug.formeln.liste.find((f) => f.id === 'F-tr-04')!;
      const satz = `Yarın gelirim, ${formel.begriff}.`;
      const [ohne, mit] = befunde(leitfaden('gesperrt'), 'F-tr-04', [
        { text: satz, sprache: 'tr' },
        { text: satz, sprache: 'tr', religionsbezug: true },
      ]);
      expect(ohne).toEqual(['blockierend: Formel aus der Formelliste ohne Kennzeichen religionsbezug: true']);
      expect(mit).toEqual(['mensch: Formel bei gesperrter Formelliste']);
      // freigegebene Liste: wie die R-Kandidaten (ohne Kennzeichen an Menschen, mit Kennzeichen nichts)
      const [frei, freiMit] = befunde(leitfaden('freigegeben'), 'F-tr-04', [
        { text: satz, sprache: 'tr' },
        { text: satz, sprache: 'tr', religionsbezug: true },
      ]);
      expect(frei).toEqual(['mensch: Religionsbezug-Kandidat ohne Kennzeichen religionsbezug: true']);
      expect(freiMit).toEqual([]);
    });

    // Arabisch: ein Formelname, den kaikki nur mit Thema Religion führt (Umschrift aus den Daten, nie von Hand)
    const kaikki = ladeKaikki('ar', DATEN);
    const religioes = (e: (typeof kaikki)[number]) => (e.mk ?? []).some((x) => /^thema:(?:islam|religion)$/i.test(x));
    const name = kaikki.find(
      (e) =>
        e.rom &&
        /^[a-zāīūḥṣḍṭẓʕʔ]{4,}$/u.test(e.rom) &&
        !e.rom.startsWith('ʔ') &&
        e.kanon &&
        /[\u064E\u064F\u0650]/.test(e.kanon) &&
        !e.kanon.endsWith('\u0629') &&
        religioes(e) &&
        kaikki.filter((x) => x.rom && [e.rom, `ʔ${e.rom}`].includes(x.rom)).every(religioes),
    )!;
    const F_AR: Formel = { id: 'F-ar-98', sprache: 'ar', begriff: name?.rom ?? '' };

    it('Arabisch (F-ar über die Umschrift): blockierend; Vokale und Tāʾ marbūṭa schärfen das Muster', () => {
      expect(name).toBeDefined();
      const kanon = name.kanon!;
      const VOKALE = ['\u064E', '\u064F', '\u0650'];
      const erster = [...kanon].findIndex((z) => VOKALE.includes(z));
      const andererVokal = [...kanon].map((z, i) => (i === erster ? VOKALE[(VOKALE.indexOf(z) + 1) % 3]! : z)).join('');
      const [vokalisiert, ohneVokale, widerspruch, taMarbuta, pronomen, gekennzeichnet] = befunde(
        leitfaden('gesperrt', [F_AR]),
        'F-ar-98',
        [
          { text: kanon, sprache: 'ar' },
          { text: name.w, sprache: 'ar' },
          { text: andererVokal, sprache: 'ar' },
          { text: `${kanon}\u0629`, sprache: 'ar' },
          { text: `${kanon}\u0647`, sprache: 'ar' },
          { text: kanon, sprache: 'ar', religionsbezug: true },
        ],
      );
      const rot = ['blockierend: Formel aus der Formelliste ohne Kennzeichen religionsbezug: true'];
      expect(vokalisiert).toEqual(rot);
      expect(ohneVokale).toEqual(rot);
      expect(pronomen).toEqual(rot);
      // anderer Vokal an derselben Stelle: anderes Wort; Tāʾ marbūṭa ist kein abgetrenntes Pronomen
      expect(widerspruch).toEqual([]);
      expect(taMarbuta).toEqual([]);
      expect(gekennzeichnet).toEqual(['mensch: Formel bei gesperrter Formelliste']);
    });

    it('Arabisch: Namen, die kaikki auch als Alltagswort führt, zählen nicht (Leitfaden: Salām, Qasam)', () => {
      const salam = kaikki.find((e) => e.rom === 'salām' && e.kanon)!;
      const qasam = kaikki.find((e) => e.rom === 'qasam' && e.kanon)!;
      expect(salam.mk ?? []).not.toContainEqual(expect.stringMatching(/religion|islam/i));
      expect(befunde(leitfaden('gesperrt'), 'F-ar-01', [{ text: salam.kanon!, sprache: 'ar' }])).toEqual([[]]);
      expect(befunde(leitfaden('gesperrt'), 'F-ar-17', [{ text: qasam.kanon!, sprache: 'ar' }])).toEqual([[]]);
    });

    it('Wirksamkeit an der echten Liste festgehalten (Gegenprüfung N2): F-ar heute 0 von 17, F-de und F-tr alle', () => {
      // Ändert sich diese Zahl (neue Daten oder Namen), muss die Aussage in ABNAHME und Bericht mitwandern: Heute schützt
      // arabische Formeln nur das Formel-Lexikon des Wächters, der Prüfer erkennt keine (nicht in kaikki, deutscher Zusatz,
      // als Alltagswort mehrdeutig).
      const zahl = formelMusterZahl(LEITFADEN, DATEN);
      const ar = LEITFADEN.religionsbezug.formeln.liste.filter((f) => f.sprache === 'ar').map((f) => f.id);
      expect(ar).toHaveLength(17);
      expect(ar.filter((id) => (zahl.get(id) ?? 0) > 0)).toEqual([]);
      const latein = LEITFADEN.religionsbezug.formeln.liste.filter((f) => f.sprache !== 'ar').map((f) => f.id);
      expect(latein.filter((id) => !((zahl.get(id) ?? 0) > 0))).toEqual([]);
      // der deutsche Zusatz („-Gruß“) fällt vor der Auflösung weg: Ein Formelname aus den Daten wirkt auch mit Zusatz
      const mitZusatz: Formel = { ...F_AR, id: 'F-ar-97', begriff: `${F_AR.begriff}-Gruß` };
      const z = formelMusterZahl(leitfaden('gesperrt', [F_AR, mitZusatz]), DATEN);
      expect(z.get('F-ar-98')).toBeGreaterThan(0);
      expect(z.get('F-ar-97')).toBe(z.get('F-ar-98'));
    });
  });

  it('Prüfstein mit gekennzeichnetem Eintrag und Clip für gekennzeichneten Text sind blockierend', () => {
    const quellen = geaendert('de', (d) => {
      d.saetze[1]!.religionsbezug = true;
      d.lektionen.push({
        schluessel: 'de.a1.test.l09',
        art: 'pruefstein',
        aufgaben: [
          { schluessel: 'de.a1.test.l09.a01', typ: 'wortbank', anweisung: 'uebersetze', satz: 'de.a1.test.s0002', nach: 'ausgang' },
        ],
      });
    });
    const satz = (JSON.parse(quellen.find((q) => q.pfad.includes('sprache/de/'))!.text) as Json).saetze[1]!.text as string;
    const h = textHash(satz);
    const manifest = {
      format: 'igmg-lernapp-audio-manifest',
      version: 1,
      sprache: 'de',
      stimmen: [{ id: 'test:ton', art: 'test', bezeichnung: '[Ton]', namensnennung: '[keine]' }],
      clips: [
        {
          textHash: h,
          buendel: 'lernapp/audio/de/de.a1.test-0123456789abcdef.lpa',
          versatz: 0,
          laenge: 1,
          dauerMs: 1,
          stimme: 'test:ton',
          sha256: h,
          format: 'webm-opus',
        },
      ],
    };
    const b = pruefe([...quellen, { pfad: 'testkurs/audio-manifest/de.json', text: JSON.stringify(manifest) }]);
    expect(von(b, 'religionsbezug').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.test\.l09\.a01: Prüfstein verweist auf einen Eintrag mit Religionsbezug/),
      expect.stringMatching(
        /audio-manifest\/de\.json: clips\.0: Clip für de\.a1\.test\.s0002 \(Religionsbezug bzw\. Wissenskurs: nie Sprachausgabe/,
      ),
    ]);
  });
});

describe('Religionswächter auch für Aussprache, Wissenskurs und Koran-Pfad', () => {
  const tanzil = readFileSync(join(DATEN, 'tanzil/quran-uthmani.xml'), 'utf8');
  const vers = [...tanzil.matchAll(/<aya index="(\d+)" text="([^"]*)"/g)].map((a) => a[2]!).find((t) => t.split(/\s+/).length >= 8)!;
  const VIER = vers
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/\u0671/g, '\u0627')
    .split(/\s+/)
    .slice(2, 6)
    .join(' ');

  it('Aussprache mit Koran-4-Gramm ist blockierend (Meldung ohne Schrift)', () => {
    const datei = {
      format: 'igmg-lernapp-aussprache',
      version: 1,
      sprache: 'ar',
      eintraege: [{ text: VIER, ersatz: VIER, quelle: 'redaktion' }],
    };
    const b = pruefe([...testkursQuellen(), { pfad: 'testkurs/aussprache/ar.json', text: JSON.stringify(datei) }]);
    const zeilen = von(b, 'religion').map(befundZeile);
    expect(zeilen).toEqual([expect.stringMatching(/aussprache\/ar\.json: eintraege\.0: Koran-4-Gramm \(Sure \d+:\d+\)/)]);
    expect(zeilen.join('\n')).not.toMatch(ARABISCH);
  });

  it('Wissenskurs mit arabischer Schrift und unbekannte Dateien sind Schemafehler', () => {
    const islam = {
      format: 'igmg-lernapp-islam',
      version: 1,
      kurs: 'islam',
      bereich: 'taharah',
      stufe: 'grund',
      einheit: { schluessel: 'islam.grund.e01', reihenfolge: 1, thema: { de: VIER } },
      lektionen: [
        {
          schluessel: 'islam.grund.e01.l01',
          titel: '[Lektion]',
          kinderGeeignet: true,
          aussagen: [
            {
              schluessel: 'islam.grund.e01.l01.a01',
              text: '[Aussage]',
              belege: [{ werk: 'quduri', kapitel: '[Kapitel]', ausgabe: '[Ausgabe]', passage: 'quduri.ms0001' }],
              quelle: 'ki:l6/x',
              lizenz: 'CC-BY-SA-4.0',
            },
          ],
        },
      ],
    };
    const b = pruefe([
      ...testkursQuellen(),
      { pfad: 'testkurs/islam/taharah/islam.grund.e01.json', text: JSON.stringify(islam) },
      { pfad: 'testkurs/sonstiges/x.json', text: '{}' },
    ]);
    const zeilen = von(b, 'schema').map(befundZeile);
    expect(zeilen).toEqual([
      expect.stringMatching(/islam\/taharah\/islam\.grund\.e01\.json: einheit\.thema\.de: arabische Schrift nicht erlaubt/),
      expect.stringMatching(/sonstiges\/x\.json: keine vorgesehene Inhaltsdatei/),
    ]);
    expect(zeilen.join('\n')).not.toMatch(ARABISCH);
  });
});

describe('Bildkarten', () => {
  it('Lemma mit unbekanntem Symbol ist blockierend', () => {
    const symbole = {
      format: 'igmg-lernapp-symbole',
      version: 1,
      // die Motive des Testkurses (wasserglas, haus, buch) und eines mehr; `kanne` fehlt
      symbole: Object.fromEntries(
        ['tasse', 'wasserglas', 'haus', 'buch'].map((id) => [
          id,
          {
            motiv: id,
            gruppe: 'test',
            quelle: 'lucide:coffee@1.0.0',
            lizenz: 'ISC',
            freigegeben: false,
            elemente: [{ art: 'path', d: 'M4 4h16v16H4z' }],
          },
        ]),
      ),
    };
    const b = pruefe([
      ...geaendert('de', (d) => (d.lemmata[0]!.symbol = 'kanne')),
      { pfad: 'testkurs/symbole/symbole.json', text: JSON.stringify(symbole) },
    ]);
    expect(von(b, 'symbole').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.test\.w001: Symbol kanne fehlt in symbole\/symbole\.json/),
    ]);
  });
});

describe('gepinnte Auszüge (Prüfsumme vor jedem Lauf) und kaikki ohne Beispiele', () => {
  it('web/daten: alle Auszüge wie in QUELLE.md, kein examples/ref in kaikki', () => {
    expect(pruefeAuszuege(DATEN).liste).toEqual([]);
    expect(pruefeKaikkiOhneBeispiele(DATEN).liste).toEqual([]);
  });

  it('abweichende Prüfsumme, ungepinnte Datei und Beispiele werden gemeldet; der Lauf bricht ab', () => {
    const d = tempOrdner();
    for (const o of ['tatoeba', 'kaikki', 'haeufigkeit']) mkdirSync(join(d, o));
    const tabelle = (datei: string, sha: string, bytes: number) =>
      `# QUELLE\n\n## Dateien\n\n| Datei | Bytes | Zeilen | SHA-256 |\n|---|---|---|---|\n| \`${datei}\` | ${bytes} | 1 | \`${sha}\` |\n\n## Pflichten\n`;
    writeFileSync(join(d, 'tatoeba/a.tsv'), 'x\n');
    writeFileSync(join(d, 'tatoeba/QUELLE.md'), tabelle('a.tsv', '0'.repeat(64), 2));
    writeFileSync(join(d, 'haeufigkeit/b.tsv'), 'y\n');
    writeFileSync(join(d, 'haeufigkeit/QUELLE.md'), tabelle('b.tsv', textHash('y\n'), 2));
    writeFileSync(join(d, 'haeufigkeit/c.tsv'), 'z\n');
    writeFileSync(join(d, 'kaikki/k.jsonl'), '{"w":"x","gl":[["y",""]],"examples":[]}\n');
    writeFileSync(join(d, 'kaikki/QUELLE.md'), tabelle('k.jsonl', textHash('{"w":"x","gl":[["y",""]],"examples":[]}\n'), 40));
    expect(auszugsTabelle(readFileSync(join(d, 'tatoeba/QUELLE.md'), 'utf8'))).toEqual([
      { datei: 'a.tsv', bytes: 2, sha256: '0'.repeat(64) },
    ]);
    expect(pruefeAuszuege(d).liste.map(befundZeile)).toEqual([
      'web/daten/tatoeba/a.tsv: SHA-256 weicht von QUELLE.md ab – Auszug verändert?',
      'web/daten/haeufigkeit/c.tsv: nicht in QUELLE.md gepinnt',
    ]);
    expect(pruefeKaikkiOhneBeispiele(d).liste.map(befundZeile)).toEqual([
      'web/daten/kaikki/k.jsonl: Zeile 1: Schlüssel examples (Beispiele/Zitate nie übernehmen)',
    ]);
    const b = pruefe(testkursQuellen(), { auszuegePruefen: true, daten: d });
    expect(b.abgebrochen).toBe(true);
    expect(b.befunde.every((x) => x.pruefer === 'daten')).toBe(true);
  });
});

describe('Ausschlüsse im Repository (OpenITI, Quranic Arabic Corpus)', () => {
  it('Dateinamen und Markierungen werden gemeldet, Tests und gewöhnliche Dateien nicht', () => {
    const web = tempOrdner();
    const schreibe = (pfad: string, text: string) => {
      mkdirSync(join(web, pfad, '..'), { recursive: true });
      writeFileSync(join(web, pfad), text);
    };
    const openiti = ['#'.repeat(6), 'OpenITI#'].join('');
    const qac = ['(1:1:1:1)', '\tx\tN\tSTEM'].join('');
    schreibe('daten/a/0428Autor.Titel.Version-ara1', 'x');
    schreibe('inhalte/lernapp/x.txt', `${openiti}\n`);
    schreibe('daten/b.tsv', `kopf\n${qac}\n`);
    schreibe('tests/c.txt', `${openiti}\n`);
    schreibe('src/d.ts', 'const x = 1;\n');
    const dateien = ['daten/a/0428Autor.Titel.Version-ara1', 'inhalte/lernapp/x.txt', 'daten/b.tsv', 'tests/c.txt', 'src/d.ts'];
    expect(pruefeAusschluesse(web, dateien).liste.map(befundZeile)).toEqual([
      'web/daten/a/0428Autor.Titel.Version-ara1: OpenITI-Datei im Repository (CC BY-NC-SA, nur lokal, ADR 0045 Nr. 12)',
      'web/inhalte/lernapp/x.txt: OpenITI-Markierung (Volltext nie im Repository, ADR 0045 Nr. 12)',
      'web/daten/b.tsv: Daten des Quranic Arabic Corpus (ADR 0045 Nr. 13)',
    ]);
  });

  it('das Repository selbst ist frei davon', () => {
    expect(pruefeAusschluesse(join(import.meta.dirname, '../../..')).liste.map(befundZeile)).toEqual([]);
  });
});

describe('Ausgaben ohne arabische Schrift', () => {
  it('alle Meldungen eines Laufs mit arabischen Befunden sind frei von arabischer Schrift', () => {
    const b = pruefe(
      geaendert('ar', (d) => {
        d.saetze[1]!.text = '\u0627\u0644\u0628\u064A\u062A \u0643\u0628\u064A\u0631.';
        Object.assign(d.lemmata[0]!, { quelle: 'wiktionary:en:\u0645\u0627\u0621', lizenz: 'CC-BY-4.0', namensnennung: '[x]' });
      }),
    );
    const zeilen = b.befunde.map(befundZeile);
    expect(zeilen.length).toBeGreaterThan(2);
    expect(zeilen.join('\n')).not.toMatch(ARABISCH);
    expect(warnungen(b).length + blockierende(b).length).toBeGreaterThan(0);
  });
});
