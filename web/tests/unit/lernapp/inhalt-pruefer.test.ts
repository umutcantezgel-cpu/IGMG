import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { testkursQuellen } from '../../../drizzle/seeds/lernapp-test';
import { INHALT_WURZEL, inhaltsdateien } from '../../../scripts/lernapp/inhaltsdateien';
import type { ImportQuelle } from '@/lib/lernapp/inhalt/import';
import { befundZeile, blockierende, menschlich, pruefeInhalte, type PruefOptionen, warnungen } from '@/lib/lernapp/inhalt/pruefer';
import { pruefeAusschluesse } from '@/lib/lernapp/inhalt/pruefer/ausschluss';
import { auszugsTabelle, ladeHaeufigkeit, pruefeAuszuege, pruefeKaikkiOhneBeispiele } from '@/lib/lernapp/inhalt/pruefer/daten';
import { nahePaare } from '@/lib/lernapp/inhalt/pruefer/dubletten';
import { arabischNormal } from '@/lib/lernapp/inhalt/pruefer/sprache';
import { baueTabuLexikon, tabuTreffer, tabuWoerter } from '@/lib/lernapp/inhalt/pruefer/tabu';
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
      expect.stringMatching(/de\.a1\.e01\.s0001: 10 Wörter in einem Satz \(A1 höchstens 8\)/),
    ]);
  });

  it('Wörter weit über A1 (selten, kein Lemma) über der Toleranz sind blockierend', () => {
    const b = pruefe(geaendert('de', (d) => (d.saetze[0]!.text = 'Photosynthese und Kernspintomografie.')));
    expect(von(b, 'wortschatz').map(befundZeile)).toEqual([expect.stringMatching(/de\.a1\.e01: .* über A1 \(2 von \d+; erlaubt ≤ 5 %\)/)]);
  });

  it('ein Lemma einer späteren Einheit derselben Stufe ist ein Vorgriff (Warnung), kein Wort über der Stufe', () => {
    const quellen = geaendert('de', (d) => (d.saetze[0]!.text = 'Kernspintomografie ist neu.'));
    const zweite = quellen
      .filter((q) => q.pfad.includes('sprache/de/'))
      .map((q) => {
        const d = JSON.parse(q.text.replaceAll('de.a1.e01', 'de.a1.e02')) as Json;
        d.einheit.reihenfolge = 2;
        d.lemmata[0]!.lemma = 'Kernspintomografie';
        return { pfad: 'testkurs/sprache/de/a1/de.a1.e02.json', text: JSON.stringify(d) };
      });
    const b = pruefe([...quellen, ...zweite]);
    expect(von(b, 'wortschatz').map(befundZeile)).toEqual([]);
    expect(von(b, 'wortschatz', 'warnung').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.e01: Vorgriff auf Lemmata späterer Einheiten in de\.a1\.e01\.s0001/),
    ]);
  });

  it('Lemma-Budget der Einheit aus dem Rahmenplan', () => {
    const b = pruefe(
      geaendert('de', (d) => {
        // Testkurs: 7 Lemmata (w001–w005, m001, m002); dazu w006–w043 → 45
        for (let i = 6; i <= 43; i++)
          d.lemmata.push({
            schluessel: `de.a1.e01.w${String(i).padStart(3, '0')}`,
            lemma: `Testwort${i}`,
            quelle: 'test:x',
            lizenz: 'CC-BY-SA-4.0',
          });
      }),
    );
    expect(von(b, 'lemmabudget').map(befundZeile)).toEqual([expect.stringMatching(/de\.a1\.e01: 45 Lemmata, Budget der Einheit 40/)]);
  });

  it('eine Einheit, die nicht im Rahmenplan steht, ist blockierend; die Abdeckung je Stufe steht im Bericht', () => {
    const neu = testkursQuellen()
      .filter((q) => q.pfad.includes('sprache/de/'))
      .map((q) => ({
        pfad: 'testkurs/sprache/de/a2/de.a2.e15.json',
        text: q.text.replaceAll('de.a1.e01', 'de.a2.e15').replace('"stufe":"a1"', '"stufe":"a2"'),
      }));
    const b = pruefe([...testkursQuellen(), ...neu]);
    expect(von(b, 'abdeckung').map(befundZeile)).toEqual([expect.stringMatching(/de\.a2\.e15: Einheit steht nicht im Rahmenplan/)]);
    expect(b.abdeckung).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kurs: 'de', stufe: 'a1', einheiten: 1, einheitenRahmen: 12, budget: 600, vollstaendig: false }),
      ]),
    );
  });
});

describe('Dubletten', () => {
  it('exakt gleicher Satz ist blockierend, umgestellte Wörter sind nahe Dubletten', () => {
    const exakt = pruefe(geaendert('de', (d) => (d.saetze[2]!.text = 'Das Haus ist groß!')));
    expect(von(exakt, 'dubletten').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.e01\.s0003: Satz doppelt \(gleich de\.a1\.e01\.s0002\)/),
    ]);
    const nahe = pruefe(geaendert('de', (d) => (d.saetze[2]!.text = 'Groß ist das Haus.')));
    expect(von(nahe, 'dubletten', 'warnung').map(befundZeile)).toEqual([
      expect.stringMatching(/s0003: fast gleich wie de\.a1\.e01\.s0002 \(Jaccard 1\.00\)/),
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
        expect.stringMatching(/de\.a1\.e01\.s0002@de-aus-tr: Alternative 1 gleich dem Haupttext/),
        expect.stringMatching(/de\.a1\.e01\.l01\.a01: Ablenker mit gleicher Übersetzung wie das Ziel \(de-aus-tr\)/),
        expect.stringMatching(/de\.a1\.e01\.l01\.a02: Paare: gleiche Übersetzung zu de\.a1\.e01\.w001 \(de-aus-tr\)/),
        expect.stringMatching(/de\.a1\.e01\.l01\.a03: Wortbank: Ablenker ist ein Wort der Lösung/),
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
        expect.stringMatching(/de\.a1\.e01\.l03\.a02: Alternative gleich dem Zieltext/),
        expect.stringMatching(/de\.a1\.e01\.l03\.a07: Lücke: Ablenker gleich dem fehlenden Wort/),
        expect.stringMatching(/de\.a1\.e01\.l03\.a08: Alternative gleich dem Zieltext/),
        expect.stringMatching(/ar\.a1\.e01\.l03\.a10: Harakat: Variante gleich dem Ziel/),
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
    expect(von(ar, 'vokalisierung').map(befundZeile)).toEqual([expect.stringMatching(/ar\.a1\.e01\.l03\.a07: nicht voll vokalisiert/)]);
    const register = { pfad: 'testkurs/symbole/symbole.json', text: readFileSync(join(INHALT_WURZEL, 'symbole/symbole.json'), 'utf8') };
    const frei = pruefe([...testkursQuellen(), register]);
    expect(von(frei, 'symbole')).toEqual([]);
    const echt = pruefe([...geaendert('de', (d) => (d.lemmata[0]!.quelle = 'redaktion')), register]);
    expect(von(echt, 'symbole').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.e01\.w001: Motiv wasserglas ohne Freigabe der Redaktion \(LM-34\)/),
    ]);
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
      expect.stringMatching(/ar\.a1\.e01\.s0002: nicht voll vokalisiert: Wort 1, Zeichen 3 \(U\+0628\): ohne Vokalzeichen/),
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
      expect.stringMatching(/tr\.a1\.e01: A1: einheit\.kinderGeeignet: true ist Pflicht/),
      expect.stringMatching(/tr\.a1\.e01\.l01: A1: Lektion darf nicht ausgenommen sein/),
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
      expect.stringMatching(/de\.a1\.e01\.w001: Namensnennung für Wiktionary-Daten fehlt/),
      expect.stringMatching(/de\.a1\.e01\.s0001: eigene Inhalte stehen unter CC BY-SA 4\.0 \(nicht CC-BY-4\.0/),
    ]);
    expect(von(b, 'ausschluss').map(befundZeile)).toEqual([
      expect.stringMatching(/de\.a1\.e01\.w002: ausgeschlossene Quelle: al-Maktaba al-Shamila/),
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
      expect.stringMatching(/de\.a1\.e01\.s0001: Inhaltsleitfaden: Treffer \(Regel nur_sachlich\) – menschlich_klaeren \[gluecksspiel\]$/),
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

  it('Register: Alltagswort mit ganz markiertem Nebeneintrag ist kein Treffer (nur Hinweis), teils markiert gar nichts', () => {
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
    expect(registerVon('Die Quarpe ist rot.', lexikon)).toEqual(['fluchen_schimpfwoerter (Hinweis)']);
    expect(registerVon('Er klumm hoch.', lexikon)).toEqual(['fluchen_schimpfwoerter (Hinweis)']);
    expect(registerVon('Ein Glumpf.', lexikon)).toEqual(['fluchen_schimpfwoerter']);
    expect(registerVon('Zwei Glumpfe.', lexikon)).toEqual(['fluchen_schimpfwoerter (Hinweis)']);
    expect(registerVon('Der Wobbel.', lexikon)).toEqual([]);
  });

  it('Register am gepinnten Auszug: Grundwortschatz (Rang ≤ 500) ist kein Treffer, echte Register-Wörter bleiben es', () => {
    const lexikon = baueTabuLexikon(LEITFADEN, DATEN);
    for (const sprache of ['de', 'tr', 'ar'] as const) {
      const voll = (grenze: number) =>
        [...ladeHaeufigkeit(sprache, DATEN)].filter(([w, rang]) => {
          const form = sprache === 'ar' ? arabischNormal(w) : tabuWoerter(w, sprache).join(' ');
          return rang <= grenze && (lexikon.register[sprache].get(form) ?? []).some((r) => r.voll);
        }).length;
      expect(voll(500), sprache).toBe(0);
      if (sprache !== 'ar') expect(voll(2000), sprache).toBeGreaterThan(0);
    }
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
        .befunde.filter((x) => x.pruefer === 'tabu' && x.ort === 'tr.a1.e01.de.t01')
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
        /tr\.a1\.e01\.s0001: Religionsbezug-Kandidat ohne Kennzeichen religionsbezug: true – menschlich_klaeren \[R-09\]/,
      ),
    ]);
    const mit = pruefe(geaendert('tr', (d) => Object.assign(d.saetze[0]!, { text: `Bu ${r09.tr}.`, religionsbezug: true })));
    expect(von(mit, 'religionsbezug', 'mensch').map(befundZeile)).toEqual([
      expect.stringMatching(/Religionsbezug vor Stufe A2 – menschlich_klaeren \[R-09\]/),
    ]);
  });

  it('Prüfstein mit gekennzeichnetem Eintrag und Clip für gekennzeichneten Text sind blockierend', () => {
    const quellen = geaendert('de', (d) => {
      d.saetze[1]!.religionsbezug = true;
      d.lektionen.push({
        schluessel: 'de.a1.e01.l09',
        art: 'pruefstein',
        aufgaben: [{ schluessel: 'de.a1.e01.l09.a01', typ: 'wortbank', anweisung: 'uebersetze', satz: 'de.a1.e01.s0002', nach: 'ausgang' }],
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
          buendel: 'lernapp/audio/de/de.a1.e01-0123456789abcdef.lpa',
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
      expect.stringMatching(/de\.a1\.e01\.l09\.a01: Prüfstein verweist auf einen Eintrag mit Religionsbezug/),
      expect.stringMatching(
        /audio-manifest\/de\.json: clips\.0: Clip für de\.a1\.e01\.s0002 \(Religionsbezug bzw\. Wissenskurs: nie Sprachausgabe/,
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
      expect.stringMatching(/de\.a1\.e01\.w001: Symbol kanne fehlt in symbole\/symbole\.json/),
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
