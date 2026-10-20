import type { ReactElement } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';
import Dialog from '@/components/lernapp/aufgaben/Dialog';
import Geschichte from '@/components/lernapp/aufgaben/Geschichte';
import GrammatikTipp from '@/components/lernapp/aufgaben/GrammatikTipp';
import LesenFragen from '@/components/lernapp/aufgaben/LesenFragen';
import SchriftAr from '@/components/lernapp/aufgaben/SchriftAr';
import SchriftWahl from '@/components/lernapp/aufgaben/SchriftWahl';
import Schreiben from '@/components/lernapp/schreiben/Schreiben';
import Sprechen from '@/components/lernapp/sprechen/Sprechen';
import { Spieler } from '@/components/lernapp/Spieler';
import { type AufgabenProps, type SpielerTexte, STANDARD_OPTIONEN } from '@/components/lernapp/typen';
import { BUCHSTABEN as ELIFBE, buchstabeFuer } from '@/lib/elifbe/alphabet';
import { erlaubt } from '@/lib/elifbe/silben';
import { bewerte } from '@/lib/lernapp/aufgaben/bewerte';
import { ablauf, bewerteGeschichte } from '@/lib/lernapp/aufgaben/geschichte';
import { glosseFuer, glossenVerzeichnis, richtigJeFrage, stuecke } from '@/lib/lernapp/aufgaben/lesen_fragen';
import { type Aufgabe, AufgabeSchema, type ImplementierterTyp, LektionSchema } from '@/lib/lernapp/aufgaben/schema';
import { pruefeText, wortzahl } from '@/lib/lernapp/aufgaben/schreiben';
import { BUCHSTABEN, formMoeglich, SILBEN_ARTEN, schriftOptionen, silbeMoeglich } from '@/lib/lernapp/aufgaben/schrift_ar';
import { ohneTonLoesbar } from '@/lib/lernapp/aufgaben/schrift_wahl';
import { pruefe, starte, ueberspringe, weiter, zusammenfassung } from '@/lib/lernapp/engine/sitzung';
import { EreignisEntwurfSchema } from '@/lib/lernapp/ereignisse/typen';
import { tippAbschnitte } from '@/lib/lernapp/paket/bauen';
import { ABGABE_AKTIV, bereiteAbgabe } from '@/lib/lernapp/schreiben/abgabe';
import de from '../../../messages/lernapp/de.json';
import {
  DIALOG,
  GESCHICHTE,
  LEKTION_B,
  LESEN,
  SCHREIBEN,
  SCHRIFT_AR,
  SCHRIFT_LATEIN,
  SCHRIFT_TR,
  SPRECHEN,
  TIPP,
} from './hilfen/lektion-b';

/**
 * Übungstypen aus L2-02 (PLAN §4, §4.2–§4.4): Zod je Typ, reine Bewertung, Ablauf in der Sitzung (Selbstbewertung,
 * Überspringen ohne Wertung) und die Semantik der Komponenten im Server-Rendering (Rollen, `lang`/`dir`, Tastaturhinweise).
 */
const TEXTE: SpielerTexte = {
  spieler: de.spieler,
  aufgaben: de.aufgaben,
  aufgaben2: de.aufgaben2,
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
    weitere: TEXTE,
    ueberspringe: nichts,
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

describe('Schemas (Zod je Typ)', () => {
  it('alle Beispielaufgaben und die Lektion sind gültig', () => {
    for (const a of LEKTION_B.aufgaben) expect(AufgabeSchema.safeParse(a).success, a.typ).toBe(true);
    expect(LektionSchema.safeParse(LEKTION_B).success).toBe(true);
  });

  it.each([
    ['dialog: richtig außerhalb', { ...DIALOG, richtig: 5 }],
    ['dialog: unbekannte Person', { ...DIALOG, verlauf: [{ sprecher: 'x', zeile: DIALOG.verlauf[0].zeile }] }],
    ['geschichte: Frage nach dem Ende', { ...GESCHICHTE, fragen: [{ ...GESCHICHTE.fragen[0], nach: 9 }] }],
    ['geschichte: Fragen nicht in Reihenfolge', { ...GESCHICHTE, fragen: [GESCHICHTE.fragen[1], GESCHICHTE.fragen[0]] }],
    ['lesen: Text in zwei Sprachen', { ...LESEN, text: [LESEN.text[0], { text: 'ev', sprache: 'tr' }] }],
    ['lesen: Glosse doppelt', { ...LESEN, glossen: [LESEN.glossen[0], { ...LESEN.glossen[0], wort: 'haus' }] }],
    ['lesen: Aussage ohne gültige Antwort', { ...LESEN, fragen: [{ art: 'rfn', aussage: LESEN.text[0], richtig: 'vielleicht' }] }],
    ['tipp: ohne Abschnitt', { ...TIPP, abschnitte: [] }],
    ['schrift_ar: unbekannter Buchstabe', { ...SCHRIFT_AR, ziel: 'xx' }],
    ['schrift_ar: ohne Ablenker', { ...SCHRIFT_AR, ablenker: undefined }],
    ['schrift_ar: Ablenker gleich Ziel', { ...SCHRIFT_AR, ablenker: ['be'] }],
    ['schrift_ar: zuordnen ohne Form', { ...SCHRIFT_AR, art: 'zuordnen' }],
    ['schrift_ar: Anfangsform bei Dal', { ...SCHRIFT_AR, art: 'zuordnen', ziel: 'dal', ablenker: ['be'], form: 'anfang' }],
    ['schrift_ar: Schadda auf Elif', { ...SCHRIFT_AR, art: 'lesen', ziel: 'elif', ablenker: ['be'], vokal: 'shadda' }],
    ['schrift_ar: nachspuren mit Ablenkern', { ...SCHRIFT_AR, art: 'nachspuren' }],
    ['schrift_tr: weder Vorgabe noch Hörbeispiel', { ...SCHRIFT_TR, vorgabe: undefined }],
    ['sprechen: ohne Zielsatz', { ...SPRECHEN, vorgabe: undefined }],
    ['schreiben: max < min', { ...SCHREIBEN, woerter: { min: 10, max: 5 } }],
    ['schreiben: Muster in anderer Sprache', { ...SCHREIBEN, muster: [{ text: 'Sabah su içerim.', sprache: 'tr' }] }],
  ])('%s → ungültig', (_, a) => {
    expect(AufgabeSchema.safeParse(a).success).toBe(false);
  });

  it('schrift_ar: Buchstabenliste gleich dem Elifbe; Formen und Silben wie alphabet.ts/silben.ts', () => {
    expect([...BUCHSTABEN]).toEqual(ELIFBE.map((b) => b.slug));
    for (const s of BUCHSTABEN) {
      const b = buchstabeFuer(s)!;
      expect(formMoeglich(s, 'anfang')).toBe(b.verbindetLinks && b.verbindetRechts);
      expect(formMoeglich(s, 'ende')).toBe(b.verbindetRechts);
      for (const v of SILBEN_ARTEN) expect(silbeMoeglich(s, v), `${s}/${v}`).toBe(erlaubt(b, v));
    }
  });
});

describe('Bewertung je Typ (rein)', () => {
  it('dialog, schrift_ar, schrift_tr, schrift_latein nach Index', () => {
    expect(bewerte(DIALOG as Aufgabe, { typ: 'dialog', wahl: 0 }).urteil).toBe('richtig');
    const falsch = bewerte(DIALOG as Aufgabe, { typ: 'dialog', wahl: 2 });
    expect(falsch).toMatchObject({ urteil: 'falsch', loesung: 'Danke, gut.', karten: [{ karte: DIALOG.karten[0], urteil: 'falsch' }] });
    expect(bewerte(SCHRIFT_AR as Aufgabe, { typ: 'schrift_ar', wahl: 0 }).urteil).toBe('richtig');
    expect(bewerte(SCHRIFT_AR as Aufgabe, { typ: 'schrift_ar', wahl: 1 }).urteil).toBe('falsch');
    expect(schriftOptionen(SCHRIFT_AR)).toEqual(['be', 'te', 'se']);
    expect(
      bewerte({ ...SCHRIFT_AR, art: 'nachspuren', ablenker: undefined } as Aufgabe, { typ: 'schrift_ar', spur: 'papier' }).urteil,
    ).toBe('richtig');
    expect(bewerte(SCHRIFT_TR as Aufgabe, { typ: 'schrift_tr', wahl: 0 })).toMatchObject({ urteil: 'richtig', loesung: 'Ş' });
    expect(bewerte(SCHRIFT_LATEIN as Aufgabe, { typ: 'schrift_latein', wahl: 2 }).urteil).toBe('falsch');
    expect(ohneTonLoesbar(SCHRIFT_TR)).toBe(true);
  });

  it('geschichte: Ablauf mit eingestreuten Fragen; richtig nur ohne Fehlversuch, Fragekarten einzeln', () => {
    expect(ablauf(GESCHICHTE)).toEqual([
      { art: 'zeile', index: 0 },
      { art: 'zeile', index: 1 },
      { art: 'frage', index: 0 },
      { art: 'zeile', index: 2 },
      { art: 'frage', index: 1 },
    ]);
    const a = GESCHICHTE as unknown as Parameters<typeof bewerteGeschichte>[0];
    expect(bewerteGeschichte(a, { typ: 'geschichte', wahlen: [0, 1] }).urteil).toBe('richtig');
    const halb = bewerteGeschichte(a, { typ: 'geschichte', wahlen: [1, 1] });
    expect(halb.urteil).toBe('falsch');
    expect(halb.karten).toEqual([
      { karte: 'de-aus-tr:de.a1.e01.w001', urteil: 'falsch' },
      { karte: 'de-aus-tr:de.a1.e02.s0002', urteil: 'falsch' },
    ]);
    expect(bewerteGeschichte(a, { typ: 'geschichte', wahlen: [0] }).urteil).toBe('falsch');
  });

  it('lesen_fragen: Auswahl und „richtig/falsch/nicht im Text“; Glossen über die Vergleichsform', () => {
    const a = LESEN as unknown as Parameters<typeof richtigJeFrage>[0];
    expect(richtigJeFrage(a, [0, 1, 2])).toEqual([true, true, true]);
    expect(bewerte(LESEN as Aufgabe, { typ: 'lesen_fragen', wahlen: [0, 1, 2] }).urteil).toBe('richtig');
    expect(bewerte(LESEN as Aufgabe, { typ: 'lesen_fragen', wahlen: [0, 0, 2] }).urteil).toBe('falsch');
    const v = glossenVerzeichnis(LESEN, 'de');
    expect(glosseFuer(v, 'HAUS', 'de')?.text).toBe('ev');
    expect(glosseFuer(v, 'Tisch', 'de')).toBeNull();
    const s = stuecke('Im Garten, am Abend.');
    expect(s.map((x) => x.text).join('')).toBe('Im Garten, am Abend.');
    expect(s.filter((x) => x.wort).map((x) => x.text)).toEqual(['Im', 'Garten', 'am', 'Abend']);
  });

  it('schreiben: nur Länge und Pflichtwörter automatisch; die Note kommt aus der Selbsteinschätzung', () => {
    expect(wortzahl('Am Morgen trinke ich Wasser.', 'de')).toBe(5);
    expect(pruefeText(SCHREIBEN, 'Wasser.')).toMatchObject({ woerter: 1, laenge: 'kurz', laengeOk: false, pflicht: [true, false] });
    expect(pruefeText(SCHREIBEN, 'Am Morgen trinke ich Wasser und lese Bücher.')).toMatchObject({
      laenge: 'passt',
      pflicht: [true, false],
    });
    expect(pruefeText(SCHREIBEN, 'Morgens Wasserglas, dann ein Buch lesen.').pflicht).toEqual([true, true]);
    const r = bewerte(SCHREIBEN as Aufgabe, { typ: 'schreiben', selbst: 'schwer' });
    expect(r).toMatchObject({ urteil: 'richtig', selbst: 'schwer' });
  });

  it('schreiben: Abgabe an die Lehrkraft vorbereitet, aber nicht aktiv (L7)', () => {
    expect(ABGABE_AKTIV).toBe(false);
    const ok = {
      kurs: 'de-aus-tr',
      aufgabe: SCHREIBEN.schluessel,
      text: 'Am Morgen trinke ich Wasser.',
      woerter: 5,
      pruefliste: { aufgabe: 2 as const },
      selbst: 'gut' as const,
    };
    expect(bereiteAbgabe(ok)).toMatchObject({ kurs: 'de-aus-tr', woerter: 5 });
    expect(bereiteAbgabe({ ...ok, text: '   ' })).toBeNull();
    expect(bereiteAbgabe({ ...ok, pruefliste: { aufgabe: 4 as 3 } })).toBeNull();
  });

  it('sprechen: Selbstbewertung – „noch üben“ kommt wieder, sonst angenommen', () => {
    expect(bewerte(SPRECHEN as Aufgabe, { typ: 'sprechen', selbst: 'nochmal' })).toMatchObject({ urteil: 'falsch', selbst: 'nochmal' });
    expect(bewerte(SPRECHEN as Aufgabe, { typ: 'sprechen', selbst: 'gut' })).toMatchObject({ urteil: 'richtig', selbst: 'gut' });
  });
});

describe('Paketbau: Tipp als Karte', () => {
  it('Überschriften beginnen Abschnitte, Absätze und Listen werden Text, Zitatblöcke Beispiele der Zielsprache', () => {
    const doc = {
      type: 'doc' as const,
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Einleitung' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Regel' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Satz ' }, { type: 'hardBreak' }, { type: 'text', text: 'zwei' }] },
        {
          type: 'bulletList',
          content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Punkt' }] }] }],
        },
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ev büyük.' }] }] },
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Leer' }] },
      ],
    };
    expect(tippAbschnitte(doc, 'tr')).toEqual([
      { absaetze: ['Einleitung'] },
      { ueberschrift: 'Regel', absaetze: ['Satz zwei', 'Punkt'], beispiele: [{ ziel: { text: 'Ev büyük.', sprache: 'tr' } }] },
    ]);
  });
});

describe('Sitzung: Selbstbewertung und Überspringen ohne Wertung', () => {
  const lektion = { ...LEKTION_B, aufgaben: [TIPP, SPRECHEN, SCHREIBEN] as unknown as Aufgabe[] };

  it('Tipp ohne Wertung, Sprechen mit Note aus der Selbstbewertung (selbst: true), Schreiben angenommen', () => {
    let s = starte(lektion);
    const alle = [];
    let r = ueberspringe(s);
    expect(r.ereignisse).toEqual([]);
    s = r.sitzung;
    r = pruefe(s, { typ: 'sprechen', selbst: 'schwer' });
    expect(r.ereignisse).toEqual([
      {
        art: 'bewertung',
        daten: { karte: SPRECHEN.karten[0], note: 'schwer', kurs: 'de-aus-tr', aufgabe: SPRECHEN.schluessel, selbst: true },
      },
    ]);
    alle.push(...r.ereignisse);
    r = weiter(r.sitzung);
    r = pruefe(r.sitzung, { typ: 'schreiben', selbst: 'nochmal' });
    expect(r.ereignisse[0]).toMatchObject({ daten: { note: 'nochmal', selbst: true } });
    alle.push(...r.ereignisse);
    r = weiter(r.sitzung);
    alle.push(...r.ereignisse);
    expect(r.sitzung.phase).toBe('fertig');
    // Tipp zählt nicht in die Quote; Schreiben wird angenommen (nicht wiederholt)
    expect(zusammenfassung(r.sitzung)).toMatchObject({ richtig: 2, gesamt: 2 });
    for (const e of alle) expect(EreignisEntwurfSchema.safeParse(e).success).toBe(true);
  });

  it('„Ich kann gerade nicht sprechen“ überspringt ohne Wertung; nur Übersprungenes ergibt eine Lektion ohne Fehler', () => {
    const s = starte({ ...lektion, aufgaben: [SPRECHEN as unknown as Aufgabe] });
    const r = ueberspringe(s);
    expect(r.sitzung.phase).toBe('fertig');
    expect(zusammenfassung(r.sitzung).gesamt).toBe(0);
    const ereignis = r.ereignisse.find((e) => e.art === 'lektion');
    expect(ereignis?.daten).toMatchObject({ richtig: 1, gesamt: 1 });
    expect(r.ereignisse.some((e) => e.art === 'bewertung')).toBe(false);
  });

  it('„noch üben“ beim Sprechen: die Aufgabe kommt am Ende noch einmal', () => {
    const s = starte({ ...lektion, aufgaben: [SPRECHEN as unknown as Aufgabe] });
    const r = pruefe(s, { typ: 'sprechen', selbst: 'nochmal' });
    expect(r.sitzung.reihe).toEqual([0, 0]);
  });
});

describe('Komponenten (Server-Rendering, Semantik)', () => {
  it('dialog: Verlauf als Liste mit lang/dir, Antworten als Radiogruppe mit Tastenhinweis', async () => {
    const html = await vorrendern(<Dialog {...props<'dialog'>(DIALOG as Aufgabe)} />);
    expect(html).toMatch(/<ol aria-label="Gespräch"/);
    expect(anzahl(html, /<li /g)).toBe(2);
    expect(html).toContain('<span lang="de" dir="ltr">Guten Morgen!</span>');
    expect(html).toContain('<details');
    expect(html).toContain('Du antwortest als Person A.');
    expect(anzahl(html, /type="radio"/g)).toBe(3);
    expect(html).toMatch(/<fieldset[^>]*aria-describedby=/);
  });

  it('geschichte: erste Zeile sichtbar, „Weiter lesen“, noch keine Frage', async () => {
    const html = await vorrendern(<Geschichte {...props<'geschichte'>(GESCHICHTE as Aufgabe)} />);
    expect(html).toContain('Das Kind steht früh auf.');
    expect(html).not.toContain('Ich trinke Wasser.');
    expect(html).toContain('>Weiter lesen</button>');
    expect(anzahl(html, /type="radio"/g)).toBe(0);
  });

  it('lesen_fragen: Wörter mit Glosse als Knöpfe, Fragen als Radiogruppen, Aussagen mit drei festen Antworten', async () => {
    const html = await vorrendern(<LesenFragen {...props<'lesen_fragen'>(LESEN as Aufgabe)} />);
    expect(anzahl(html, /<button type="button" aria-expanded="false"/g)).toBe(2);
    expect(html).toContain('Steht nicht im Text');
    expect(anzahl(html, /type="radio"/g)).toBe(3 + 3 + 3);
    expect(html).toMatch(/<p lang="de" dir="ltr"/);
  });

  it('grammatik_tipp: Karte mit Überschriften in der Sprache der Erklärung, Beispiele mit lang, „Verstanden“', async () => {
    const html = await vorrendern(<GrammatikTipp {...props<'grammatik_tipp'>(TIPP as Aufgabe)} />);
    expect(html).toMatch(/<article[^>]*lang="tr" dir="ltr"/);
    expect(html).toMatch(/<h3[^>]*>Almancada isimler/);
    expect(html).toContain('<span lang="de" dir="ltr">das Haus</span>');
    expect(html).toContain('Verstanden – weiter');
  });

  it('schrift_ar: Buchstabe aus Codepunkten (rtl, neutrale Beschriftung), Namen aus den Texten', async () => {
    const html = await vorrendern(<SchriftAr {...props<'schrift_ar'>(SCHRIFT_AR as Aufgabe)} />);
    expect(html).toMatch(/role="img" aria-label="Arabischer Buchstabe" lang="ar" dir="rtl"/);
    expect(html).toContain(String.fromCodePoint(0x0628));
    for (const n of ['Bā', 'Tā', 'Thā']) expect(html).toContain(n);
  });

  it('schrift_tr: Vorgabe groß, Optionen als Radiogruppe', async () => {
    const html = await vorrendern(<SchriftWahl {...props<'schrift_tr'>(SCHRIFT_TR as Aufgabe)} />);
    expect(html).toContain('<span lang="tr" dir="ltr">ş</span>');
    expect(anzahl(html, /type="radio"/g)).toBe(3);
  });

  it('sprechen: Zielsatz in seiner Sprache, Aufnahme-Knopf, „Ich kann gerade nicht sprechen“, keine Abschrift', async () => {
    const html = await vorrendern(<Sprechen {...props<'sprechen'>(SPRECHEN as Aufgabe)} />);
    expect(html).toContain('<span lang="de" dir="ltr">Ich trinke Wasser.</span>');
    expect(html).toContain('>Aufnehmen</button>');
    expect(html).toContain(de.sprechen.kannNicht);
  });

  it('schreiben: Textfeld mit lang/dir und spellcheck, Zähler, Hinweis „bleibt auf dem Gerät“', async () => {
    const html = await vorrendern(<Schreiben {...props<'schreiben'>(SCHREIBEN as Aufgabe)} />);
    const feld = /<textarea[^>]*>/.exec(html)?.[0] ?? '';
    for (const attr of ['lang="de"', 'dir="ltr"', 'spellcheck', 'aria-describedby=']) expect(feld.toLowerCase()).toContain(attr);
    expect(html).toContain('0 Wörter – Ziel: 5 bis 40 Wörter');
    expect(html).toContain(de.schreiben.lokal);
  });

  it('Spieler: ohne „Prüfen“ bei Tipp, Sprechen und Schreiben; Sprechaufgaben fallen mit „Sprechübungen aus“ weg', async () => {
    const tipp = await vorrendern(
      <Spieler lektion={{ ...LEKTION_B, aufgaben: [TIPP as Aufgabe] }} texte={TEXTE} sprache="de" onEreignis={nichts} />,
    );
    expect(tipp).not.toContain('type="submit"');
    expect(tipp).toMatch(/<h2[^>]*>Tipp<\/h2>/);
    const ohne = await vorrendern(
      <Spieler
        lektion={{ ...LEKTION_B, aufgaben: [SPRECHEN as Aufgabe, DIALOG as Aufgabe] }}
        texte={TEXTE}
        sprache="de"
        onEreignis={nichts}
        optionen={{ ...STANDARD_OPTIONEN, sprechen: false }}
      />,
    );
    expect(ohne).toContain('Aufgabe 1 von 1');
    expect(ohne).toMatch(/<h2[^>]*>Wähle die passende Antwort\.<\/h2>/);
  });
});
