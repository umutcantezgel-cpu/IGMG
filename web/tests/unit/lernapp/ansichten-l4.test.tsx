import type { ReactElement } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';
import { AbgeschlosseneStufen } from '@/components/lernapp/AbgeschlosseneStufen';
import Geschichte from '@/components/lernapp/aufgaben/Geschichte';
import { LektionsArtMarke } from '@/components/lernapp/LektionsArtMarke';
import LesenFragen, { LANGER_TEXT } from '@/components/lernapp/aufgaben/LesenFragen';
import { type AufgabenProps, type SpielerTexte, STANDARD_OPTIONEN } from '@/components/lernapp/typen';
import { ablauf, abschnittsEnde, zeilenBis } from '@/lib/lernapp/aufgaben/auswertung/geschichte';
import { type Aufgabe, AufgabeSchema, type ImplementierterTyp } from '@/lib/lernapp/aufgaben/schema';
import { leiteAbzeichenAb } from '@/lib/lernapp/ereignisse/abzeichen';
import {
  abgeschlosseneStufen,
  EINHEITEN_JE_STUFE,
  lektionsTeile,
  pruefsteinDerStufe,
  stufenZaehler,
  zielspracheVon,
} from '@/lib/lernapp/ereignisse/stufen';
import { type Ereignis, EreignisSchema } from '@/lib/lernapp/ereignisse/typen';
import { vereinige } from '@/lib/lernapp/ereignisse/zusammenfuehren';
import { formatiere } from '@/lib/lernapp/format';
import { SPRACH_STUFEN } from '@/lib/lernapp/kurse';
import { stufenJeKurs } from '@/lib/lernapp/oberflaeche/fortschritt';
import { abschnitte } from '@/lib/lernapp/oberflaeche/kursverzeichnis';
import { VERZEICHNIS_FORMAT } from '@/lib/lernapp/paket/kennungen';
import type { Verzeichnis } from '@/lib/lernapp/paket/typen';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';

/**
 * L4-03: Abzeichen je Stufe (ADR 0043 Nr. 5 „Stufe je Kurs abgeschlossen“) und Geschichten-/Lese-Ansichten für längere
 * Texte (PLAN §4 `geschichte`, `lesen_fragen`; A2–B1). Nur synthetische Testdaten: neutrale Alltagssätze, Arabisch nur als
 * Codepunkt-Escapes; keine echten Kursinhalte.
 */

const zwei = (n: number) => String(n).padStart(2, '0');
const pruefstein = (kurs: string, stufe: string, e: number) => ({ kurs, lektion: `${kurs}.${stufe}.e${zwei(e)}.l08`, art: 'pruefstein' });
/** alle Prüfsteine einer Stufe (Zahl nach Rahmenplan) */
const stufeGanz = (kurs: string, stufe: (typeof SPRACH_STUFEN)[number]) =>
  Array.from({ length: EINHEITEN_JE_STUFE[stufe] }, (_, i) => pruefstein(kurs, stufe, i + 1));

describe('Stufe abgeschlossen je Kurs (stufen.ts)', () => {
  it('Lektionsschlüssel, Zielsprache und Prüfstein der Stufe', () => {
    expect(lektionsTeile('tr-aus-de.a2.e03.l08')).toEqual({ kurs: 'tr-aus-de', stufe: 'a2', einheit: 'e03' });
    expect(lektionsTeile('tr-aus-de.a2')).toBeNull();
    expect(zielspracheVon('ar-aus-tr')).toBe('ar');
    expect(zielspracheVon('islam')).toBeNull();
    expect(pruefsteinDerStufe('tr-aus-de', 'tr-aus-de.b1.e07.l08', 'pruefstein')).toEqual({ stufe: 'b1', einheit: 'e07' });
    // andere Art, fremder Kurs im Schlüssel, Wissenskurs, keine Sprachstufe
    expect(pruefsteinDerStufe('tr-aus-de', 'tr-aus-de.b1.e07.l03', 'lektion')).toBeNull();
    expect(pruefsteinDerStufe('tr-aus-de', 'ar-aus-de.b1.e07.l08', 'pruefstein')).toBeNull();
    expect(pruefsteinDerStufe('islam', 'islam.grund.e01.l08', 'pruefstein')).toBeNull();
    expect(pruefsteinDerStufe('tr-aus-de', 'tr-aus-de.grund.e01.l08', 'pruefstein')).toBeNull();
  });

  it('erst mit allen Einheiten der Stufe; dieselbe Einheit zählt einmal; je Kurs getrennt', () => {
    const zaehle = stufenZaehler();
    const a2 = stufeGanz('de-aus-tr', 'a2');
    a2.slice(0, -1).forEach((p) => expect(zaehle(p.kurs, p.lektion, p.art)).toBeNull());
    // Wiederholung eines Prüfsteins schließt die Stufe nicht ab
    expect(zaehle(a2[0]!.kurs, a2[0]!.lektion, 'pruefstein')).toBeNull();
    // dieselbe Stufe in einem anderen Kurs zählt dort, nicht hier
    expect(zaehle('tr-aus-de', a2.at(-1)!.lektion.replace('de-aus-tr', 'tr-aus-de'), 'pruefstein')).toBeNull();
    expect(zaehle(a2.at(-1)!.kurs, a2.at(-1)!.lektion, 'pruefstein')).toBe('a2');
  });

  it('abgeschlossene Stufen je Kurs in der Reihenfolge A1 … C1; Kurse ohne Stufe fehlen', () => {
    const lektionen = [
      ...stufeGanz('tr-aus-de', 'b1'),
      ...stufeGanz('tr-aus-de', 'a1'),
      ...stufeGanz('ar-aus-de', 'a2').slice(1),
      { kurs: 'tr-aus-de', lektion: 'tr-aus-de.a2.e01.l01', art: 'lektion' },
    ];
    const fertig = abgeschlosseneStufen(lektionen);
    expect([...fertig]).toEqual([['tr-aus-de', ['a1', 'b1']]]);
    // Fortschritt: Reihenfolge der Kurse wie `RICHTUNGEN`
    const beide = stufenJeKurs([...stufeGanz('de-aus-ar', 'a1'), ...lektionen]);
    expect(beide).toEqual([
      { kurs: 'tr-aus-de', stufen: ['a1', 'b1'] },
      { kurs: 'de-aus-ar', stufen: ['a1'] },
    ]);
    expect(stufenJeKurs([])).toEqual([]);
  });

  it('das Abzeichen „Stufe“ folgt derselben Regel (eines je Stufe, gleich in welchem Kurs)', () => {
    let seq = 0;
    const ereignisse: Ereignis[] = stufeGanz('ar-aus-tr', 'a1').map((p, i) =>
      EreignisSchema.parse({
        geraet: '00000000-0000-4000-8000-00000000000c',
        seq: seq++,
        am: `2026-09-${zwei(i + 1)}T10:00:00.000Z`,
        tag: `2026-09-${zwei(i + 1)}`,
        art: 'lektion',
        daten: { ...p, richtig: 4, gesamt: 5 },
      }),
    );
    const abzeichen = leiteAbzeichenAb(vereinige(ereignisse));
    expect(abzeichen.get('stufe-a1')?.tag).toBe(`2026-09-${zwei(EINHEITEN_JE_STUFE.a1)}`);
    expect(abzeichen.has('stufe-a2')).toBe(false);
    expect(abgeschlosseneStufen(ereignisse.map((e) => (e.art === 'lektion' ? e.daten : { kurs: '', lektion: '', art: '' })))).toEqual(
      new Map([['ar-aus-tr', ['a1']]]),
    );
  });
});

// ——— Ansichten (Server-Rendering, Semantik) ———

const TEXTE: SpielerTexte = {
  spieler: de.spieler,
  aufgaben: de.aufgaben,
  tastatur: de.tastatur,
  aufgaben2: de.aufgaben2,
  ansichten: de.ansichten,
  sprechen: de.sprechen,
  schreiben: de.schreiben,
};
const nichts = () => undefined;

function props<T extends ImplementierterTyp>(aufgabe: Aufgabe, teil: Partial<AufgabenProps<T>> = {}): AufgabenProps<T> {
  return {
    aufgabe,
    texte: TEXTE.aufgaben,
    sprache: 'de',
    ziffern: 'oestlich',
    gesperrt: false,
    auswertung: null,
    antwort: null,
    setzeAntwort: nichts,
    gibAb: nichts,
    melde: nichts,
    tastatur: TEXTE.tastatur,
    weitere: TEXTE,
    ueberspringe: nichts,
    nurUeberspringen: nichts,
    optionen: STANDARD_OPTIONEN,
    ...teil,
  } as unknown as AufgabenProps<T>;
}

async function vorrendern(ui: ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(ui);
  let html = '';
  for await (const teil of prelude) html += String(teil);
  return html;
}
const anzahl = (html: string, muster: RegExp) => [...html.matchAll(muster)].length;
const ohneKommentare = (html: string) => html.replaceAll('<!-- -->', '');

const deT = (text: string) => ({ text, sprache: 'de' as const });
const trT = (text: string) => ({ text, sprache: 'tr' as const });

/** Längere Geschichte (B1-artig): zwölf neutrale Alltagszeilen, Fragen nach der fünften und nach der letzten Zeile. */
const ALLTAG = [
  'Am Morgen steht Lena früh auf.',
  'Sie öffnet das Fenster.',
  'Draußen regnet es ein wenig.',
  'Sie trinkt ein Glas Wasser.',
  'Dann packt sie ihre Tasche.',
  'Der Bus kommt pünktlich.',
  'Im Bus liest sie ein Buch.',
  'An der Schule wartet ihr Freund.',
  'Zusammen gehen sie in die Klasse.',
  'Die erste Stunde ist Mathematik.',
  'Mittags essen sie Brot und Suppe.',
  'Am Nachmittag scheint die Sonne.',
];
const LANGE_GESCHICHTE = {
  typ: 'geschichte',
  schluessel: 'de.b1.e04.a001',
  karten: ['de-aus-tr:de.b1.e04.s0001'],
  titel: deT('Ein Schultag'),
  zeilen: ALLTAG.map((z, i) => ({ zeile: deT(z), ...(i === 0 ? { uebersetzung: trT('Sabah Lena erken kalkar.') } : {}) })),
  fragen: [
    { nach: 4, frage: deT('Was packt Lena?'), optionen: [deT('ihre Tasche'), deT('ein Fenster')], richtig: 0 },
    { nach: 11, frage: deT('Wann scheint die Sonne?'), optionen: [deT('am Morgen'), deT('am Nachmittag')], richtig: 1 },
  ],
} as const satisfies Aufgabe;

describe('Geschichte: längere Texte in Abschnitten (L4-03)', () => {
  it('die Fragen teilen die Geschichte in Abschnitte; Stand „Zeile n von m“', () => {
    expect(AufgabeSchema.safeParse(LANGE_GESCHICHTE).success).toBe(true);
    const s = ablauf(LANGE_GESCHICHTE);
    expect(s).toHaveLength(14);
    expect(abschnittsEnde(s, 0)).toBe(5); // Frage nach Zeile 5
    expect(s[5]).toEqual({ art: 'frage', index: 0 });
    expect(abschnittsEnde(s, 5)).toBe(13); // nächste Frage am Ende
    expect(abschnittsEnde(s, 13)).toBe(13);
    expect(zeilenBis(s, 0)).toBe(1);
    expect(zeilenBis(s, 5)).toBe(5);
    expect(zeilenBis(s, 13)).toBe(12);
    // ohne Fragen: „Bis zum Ende“ deckt alles auf
    const ohne = ablauf({ zeilen: LANGE_GESCHICHTE.zeilen, fragen: [] });
    expect(abschnittsEnde(ohne, 0)).toBe(11);
  });

  it('Server-Rendering: erste Zeile, „Weiter lesen“ und „Bis zur nächsten Frage lesen“, Stand als Text', async () => {
    const html = ohneKommentare(await vorrendern(<Geschichte {...props<'geschichte'>(LANGE_GESCHICHTE as Aufgabe)} />));
    expect(html).toContain(ALLTAG[0]);
    expect(html).not.toContain(ALLTAG[1]);
    expect(html).toContain(`>${de.aufgaben2.geschichte.weiterLesen}</button>`);
    expect(html).toContain(`>${de.ansichten.geschichte.bisZurFrage}</button>`);
    expect(html).not.toContain(de.ansichten.geschichte.bisZumEnde);
    expect(html).toContain(formatiere(de.ansichten.geschichte.stand, { n: 1, gesamt: 12 }, 'de'));
    expect(anzahl(html, /type="radio"/g)).toBe(0);
  });

  it('kurze Geschichte mit einer Zeile: kein Sprung, kein Stand', async () => {
    const kurz = { ...LANGE_GESCHICHTE, zeilen: [LANGE_GESCHICHTE.zeilen[0]], fragen: [] } as unknown as Aufgabe;
    const html = await vorrendern(<Geschichte {...props<'geschichte'>(kurz)} />);
    expect(html).not.toContain(de.ansichten.geschichte.bisZurFrage);
    expect(html).not.toContain(de.ansichten.geschichte.bisZumEnde);
    expect(html).not.toContain('Zeile 1 von');
  });
});

/** Längerer Lesetext (B1-artig): fünf Absätze, zehn Glossen; Wörter stehen mehrmals im Text. */
const ABSAETZE = [
  'Familie Kaya wohnt in einem Haus am Rand der Stadt.',
  'Hinter dem Haus liegt ein Garten mit einem Apfelbaum.',
  'Im Sommer sitzt die Familie oft im Garten und trinkt Tee.',
  'Die Kinder spielen mit dem Ball, der Hund schläft unter dem Baum.',
  'Am Abend gehen alle ins Haus und essen zusammen.',
];
const GLOSSEN: [string, string][] = [
  ['Haus', 'ev'],
  ['Rand', 'kenar'],
  ['Stadt', 'şehir'],
  ['Garten', 'bahçe'],
  ['Apfelbaum', 'elma ağacı'],
  ['Sommer', 'yaz'],
  ['Tee', 'çay'],
  ['Ball', 'top'],
  ['Hund', 'köpek'],
  ['Abend', 'akşam'],
];
const LANGER_LESETEXT = {
  typ: 'lesen_fragen',
  schluessel: 'de.b1.e05.a002',
  titel: deT('Familie Kaya'),
  text: ABSAETZE.map(deT),
  glossen: GLOSSEN.map(([wort, glosse]) => ({ wort, glosse: trT(glosse) })),
  fragen: [
    { art: 'auswahl', frage: deT('Wo liegt der Garten?'), optionen: [deT('hinter dem Haus'), deT('in der Stadt')], richtig: 0 },
    { art: 'rfn', aussage: deT('Der Hund spielt mit dem Ball.'), richtig: 'falsch' },
  ],
} as const satisfies Aufgabe;

/** Arabischer Lesetext nur als Codepunkt-Escapes (KI-Regel 2): „Ich trinke Wasser.“, „Das Buch ist neu.“, zwei Glossen. */
const AR_WASSER = '\u0645\u064E\u0627\u0621';
const AR_KITAB = '\u0643\u0650\u062A\u064E\u0627\u0628';
const AR_LESETEXT = {
  typ: 'lesen_fragen',
  schluessel: 'ar.a2.e02.a003',
  text: [
    {
      text: '\u0623\u064E\u0646\u064E\u0627 \u0623\u064E\u0634\u0652\u0631\u064E\u0628\u064F \u0627\u0644\u0652\u0645\u064E\u0627\u0621\u064E.',
      sprache: 'ar',
    },
    { text: `\u0627\u0644\u0652${AR_KITAB}\u064F \u062C\u064E\u062F\u0650\u064A\u062F\u064C.`, sprache: 'ar' },
  ],
  glossen: [
    { wort: AR_WASSER, glosse: deT('Wasser') },
    { wort: AR_KITAB, glosse: deT('Buch') },
  ],
  fragen: [{ art: 'rfn', aussage: deT('Das Buch ist alt.'), richtig: 'falsch' }],
} as const satisfies Aufgabe;

describe('Lesetext: Glossar, Tastatur und Sprünge (L4-03)', () => {
  it('langer Text: Sprung zu den Fragen und zurück, Glossar mit allen Wörtern, Wort-Knöpfe ohne offene Glosse', async () => {
    expect(AufgabeSchema.safeParse(LANGER_LESETEXT).success).toBe(true);
    const html = ohneKommentare(await vorrendern(<LesenFragen {...props<'lesen_fragen'>(LANGER_LESETEXT as Aufgabe)} />));
    // jedes Vorkommen eines Worts mit Glosse ist ein Knopf: Haus ×3, Garten ×2, die übrigen je einmal
    const knoepfe = anzahl(html, /<button [^>]*aria-expanded="false"/g);
    expect(knoepfe).toBe(13);
    expect(knoepfe).toBeGreaterThanOrEqual(LANGER_TEXT.woerter);
    expect(html).not.toContain('aria-controls=');
    expect(html).toContain(`>${de.ansichten.lesen.zuDenFragen}</button>`);
    expect(html).toContain(`>${de.ansichten.lesen.zumText}</button>`);
    // Überschriften als Sprungziele (programmatisch fokussierbar)
    expect(anzahl(html, /<h3 [^>]*tabindex="-1"/g)).toBe(2);
    // Glossar: aufklappbar, Anzahl in der Oberflächensprache, Wörter mit lang/dir des Texts, Bedeutung mit ihrer Sprache
    expect(html).toContain(`>${formatiere(de.ansichten.lesen.woerter, { n: 10 }, 'de')}</summary>`);
    expect(anzahl(html, /<dt lang="de" dir="ltr"/g)).toBe(10);
    expect(html).toContain('<span lang="tr" dir="ltr">elma ağacı</span>');
    // lesbare Zeilenlänge
    expect(anzahl(html, /<p lang="de" dir="ltr" class="max-w-text /g)).toBe(5);
  });

  it('kurzer Text: keine Sprünge (wenige Tabstopps), Glossar trotzdem', async () => {
    const kurz = { ...LANGER_LESETEXT, text: [deT(ABSAETZE[0]!)] } as unknown as Aufgabe;
    const html = ohneKommentare(await vorrendern(<LesenFragen {...props<'lesen_fragen'>(kurz)} />));
    expect(html).not.toContain(de.ansichten.lesen.zuDenFragen);
    expect(html).not.toContain(de.ansichten.lesen.zumText);
    expect(html).toContain('<details');
  });

  it('Arabisch (RTL): Absätze und Glossar-Wörter mit lang="ar" dir="rtl" in der Kursschrift, Oberfläche arabisch', async () => {
    expect(AufgabeSchema.safeParse(AR_LESETEXT).success).toBe(true);
    const arTexte = { ...TEXTE, aufgaben2: ar.aufgaben2, ansichten: ar.ansichten } as unknown as SpielerTexte;
    const html = ohneKommentare(
      await vorrendern(<LesenFragen {...props<'lesen_fragen'>(AR_LESETEXT as Aufgabe, { weitere: arTexte, sprache: 'ar' })} />),
    );
    expect(anzahl(html, /<p lang="ar" dir="rtl" class="max-w-text font-arabic text-arabisch-3"/g)).toBe(2);
    expect(anzahl(html, /<dt lang="ar" dir="rtl" class="[^"]*font-arabic/g)).toBe(2);
    // „Wasser“ steht mit Artikel und Endung im Text: kein Knopf (Varianten liefert der Inhalt); das Buch-Wort ebenso
    // – das Glossar zeigt beide Wörter trotzdem
    expect(html).toContain(`>${AR_KITAB}</dt>`);
    expect(html).toContain(`>${formatiere(ar.ansichten.lesen.woerter, { n: 2 }, 'ar')}</summary>`);
  });
});

describe('Fortschritt: abgeschlossene Stufen je Kurs', () => {
  const texte = { stufen: de.ansichten.stufen, ziel: de.kurse.ziel, fuer: de.kurse.fuer, namen: de.lernpfad.stufe };

  it('je Kurs der Name in der Oberflächensprache und die Stufen; ohne Stufe nichts', async () => {
    const html = ohneKommentare(
      await vorrendern(
        <AbgeschlosseneStufen
          ui="de"
          ziffern="oestlich"
          texte={texte}
          stufen={[
            { kurs: 'tr-aus-de', stufen: ['a1', 'a2'] },
            { kurs: 'ar-aus-de', stufen: ['a1'] },
          ]}
        />,
      ),
    );
    expect(html).toContain(`>${de.ansichten.stufen.titel}</h2>`);
    expect(html).toContain(de.ansichten.stufen.text);
    expect(html).toContain(`>${formatiere(de.ansichten.stufen.kurs, { ziel: 'Türkisch', fuer: 'für Deutschsprachige' }, 'de')}</span>`);
    expect(anzahl(html, /<li [^>]*data-stufe=/g)).toBe(3);
    expect(html).not.toMatch(/zertifikat erhalten|urkunde/i);
    expect(await vorrendern(<AbgeschlosseneStufen ui="de" ziffern="oestlich" texte={texte} stufen={[]} />)).toBe('');
  });
});

describe('Lernpfad: Geschichte und Prüfstein an den Lektionen (L4-03)', () => {
  it('die Art kommt aus dem Paketkopf bis zur Lektion; eine Marke nur für Geschichte und Prüfstein, Text aus der Oberfläche', async () => {
    const v: Verzeichnis = {
      format: VERZEICHNIS_FORMAT,
      version: 1,
      kurs: 'tr-aus-de',
      kursId: 'tr',
      zielsprache: 'tr',
      ausgangssprache: 'de',
      stand: 1,
      einheiten: [
        {
          schluessel: 'tr.a2.e01',
          stufe: 'a2',
          reihenfolge: 1,
          thema: { de: '[Thema]' },
          hash: '0'.repeat(64),
          bytes: 1,
          lektionen: 3,
          hinweis: false,
          audio: [],
        },
      ],
    };
    const arten = ['lektion', 'geschichte', 'pruefstein'] as const;
    const kopf = { lektionen: arten.map((art, i) => ({ schluessel: `tr-aus-de.a2.e01.l0${i + 1}`, art })), tipps: [] };
    const lektionen = abschnitte(v, new Set(), new Map([['tr.a2.e01', kopf]]))[0]?.stationen[0]?.lektionen ?? [];
    expect(lektionen.map((l) => l.art)).toEqual(arten);
    const [ohne, geschichte, pruefstein] = await Promise.all(
      lektionen.map((l) => vorrendern(<LektionsArtMarke art={l.art} texte={de.ansichten.stufen.art} />)),
    );
    expect(ohne).toBe('');
    expect(geschichte).toContain(`>${de.ansichten.stufen.art.geschichte}</span>`);
    expect(pruefstein).toContain(`>${de.ansichten.stufen.art.pruefstein}</span>`);
    // andere Oberflächensprache: der Text kommt aus den übergebenen Nachrichten
    expect(await vorrendern(<LektionsArtMarke art="geschichte" texte={ar.ansichten.stufen.art} />)).toContain(
      `>${ar.ansichten.stufen.art.geschichte}</span>`,
    );
    for (const art of ['wiederholung', 'schrift', 'schreiben', 'sprechen'] as const)
      expect(await vorrendern(<LektionsArtMarke art={art} texte={de.ansichten.stufen.art} />)).toBe('');
  });
});
