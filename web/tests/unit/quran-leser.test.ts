import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ausgabeFuer, istFreigegeben, sichtbareAusgaben, type AusgabeZeile } from '@/lib/quran/ausgaben';
import {
  arabischeZahl,
  maskiere,
  satzLaenge,
  teileMitVersatz,
  VERSENDE,
  versEndeHtml,
  versHtml,
  versListeHtml,
  VOLLSATZ_GRENZE,
  wortHtml,
} from '@/lib/quran/satz';
import { passt, sucheNormal, surenSchluessel } from '@/lib/quran/suche';
import { bereinige, TAJWID_FAMILIEN, type TajwidSegment } from '@/lib/quran/tajwid';
import { leseTanzil } from '@/lib/quran/tanzil';
import { woerter } from '@/lib/quran/woerter';

/**
 * Koran-Leser (O-Q01, H-Q01, H-Q02): Kontrast der Tajwid-Farben, Satz mit Wort-Versatz und Tajwid-Abschnitten,
 * Sichtbarkeit der Übersetzungen, Surensuche. Arabischer Text nur aus den Daten unter web/daten (ADR 0030).
 */
const WEB = join(import.meta.dirname, '..', '..');
const CSS = readFileSync(join(WEB, 'src', 'app', 'globals.css'), 'utf8');
const THEMA = /@theme \{([\s\S]*?)\n\}/.exec(CSS)?.[1] ?? '';
const token = (name: string) => new RegExp(`${name}:\\s*(#[0-9a-f]{6})`, 'i').exec(THEMA)?.[1] ?? '';

/** Relative Leuchtdichte und Kontrastverhältnis nach WCAG 2.x. */
function leuchtdichte(hex: string): number {
  const kanal = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [1, 3, 5].map((i) => kanal(Number.parseInt(hex.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function kontrast(a: string, b: string): number {
  const [hell, dunkel] = [leuchtdichte(a), leuchtdichte(b)].sort((x, y) => y - x);
  return (hell + 0.05) / (dunkel + 0.05);
}

const suren = leseTanzil(readFileSync(join(WEB, 'daten', 'tanzil', 'quran-uthmani.xml'), 'utf8'));
const tajwidRoh = JSON.parse(readFileSync(join(WEB, 'daten', 'quran-tajweed', 'tajwid-tanzil-1.1.json'), 'utf8')) as [
  number,
  number,
  TajwidSegment[],
][];
const tajwidJe = new Map(tajwidRoh.map(([s, v, seg]) => [`${s}:${v}`, seg]));
const vers = (s: number, v: number) => {
  const text = suren[s - 1].verse[v - 1].textAr;
  return { text, tajwid: bereinige(text, tajwidJe.get(`${s}:${v}`) ?? []).segmente };
};
/** Tags entfernen, Entitäten zurück: der reine Text des Satzes. */
const nurText = (html: string) => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');

describe('Tajwid-Farben (globals.css): Kontrast ≥ 4,5:1 auf Papier, Weiß und Sand', () => {
  it.each(TAJWID_FAMILIEN)('--color-tajwid-%s', (familie) => {
    const farbe = token(`--color-tajwid-${familie}`);
    expect(farbe, `Token --color-tajwid-${familie} fehlt`).toMatch(/^#[0-9a-f]{6}$/i);
    for (const grund of ['--color-papier', '--color-weiss', '--color-sand']) {
      expect(kontrast(farbe, token(grund)), `${familie} auf ${grund}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('jede Familie hat ein eigenes Muster (nicht nur Farbe, WCAG 1.4.1)', () => {
    // Linienstil (+ Dicke) der Unterstreichung; „Nicht gesprochen“ hat statt einer Linie einen kurzen Strich mittig unter
    // der Glyphe (Hintergrundbild in currentColor, Sichtabnahme S-2)
    const muster = TAJWID_FAMILIEN.map((f) => {
      const regel = new RegExp(`\\.tj-${f} \\{([^}]*)\\}`).exec(CSS)?.[1] ?? '';
      const strich = /background-image:\s*linear-gradient\(currentColor, currentColor\)/.test(regel);
      if (strich) return `strich|${/background-size:\s*([^;]+);/.exec(regel)?.[1]}|${/text-decoration-line:\s*(\w+)/.exec(regel)?.[1]}`;
      return `${/text-decoration-style:\s*(\w+)/.exec(regel)?.[1]}|${/text-decoration-thickness:\s*([\d.]+em)/.exec(regel)?.[1] ?? 'grund'}`;
    });
    expect(muster.every((m) => !m.startsWith('undefined') && !m.includes('|undefined'))).toBe(true);
    expect(new Set(muster).size).toBe(TAJWID_FAMILIEN.length);
    // Der Strich ersetzt die Unterstreichung, er kommt nicht zusätzlich dazu
    expect(muster.find((m) => m.startsWith('strich'))).toMatch(/\|none$/);
  });
});

describe('Satz: Wörter mit Versatz und Tajwid-Abschnitte', () => {
  it('Arabisches Versende und Ziffern entstehen aus Codepunkten', () => {
    expect(VERSENDE.codePointAt(0)).toBe(0x06dd);
    expect([...arabischeZahl(286)].map((z) => z.codePointAt(0))).toEqual([0x0662, 0x0668, 0x0666]);
    expect(versEndeHtml(7)).toBe(`<span class="versende">${VERSENDE}${String.fromCodePoint(0x0667)}</span>`);
  });

  it('Versatz je Teil in Codepunkten; Wortnummern wie quran_wort', () => {
    const { text } = vers(2, 255);
    const teile = teileMitVersatz(text);
    for (const t of teile)
      expect(
        Array.from(text)
          .slice(t.versatz, t.versatz + Array.from(t.text).length)
          .join(''),
      ).toBe(t.text);
    expect(teile.filter((t) => t.pos !== null).map((t) => t.text)).toEqual(woerter(text).map((w) => w.text));
  });

  it('Abschnitte eines Worts beachten den Versatz; ein Segment über die Wortgrenze wird am Wort abgeschnitten', () => {
    const { text } = vers(1, 1);
    const [w1, w2] = teileMitVersatz(text);
    const ende1 = w1.versatz + Array.from(w1.text).length;
    // Ein Segment vom letzten Zeichen des ersten bis zum ersten Zeichen des zweiten Worts (über das Leerzeichen)
    const segment: TajwidSegment = [ende1 - 1, w2.versatz + 1, 'madd_2'];
    const html1 = wortHtml(w1.text, [segment], w1.versatz);
    const html2 = wortHtml(w2.text, [segment], w2.versatz);
    expect(html1.endsWith(`<b class="tj tj-madd">${Array.from(w1.text).at(-1)}</b>`)).toBe(true);
    expect(html2.startsWith(`<b class="tj tj-madd">${Array.from(w2.text)[0]}</b>`)).toBe(true);
    expect(nurText(html1)).toBe(w1.text);
    expect(nurText(html2)).toBe(w2.text);
  });

  it('versHtml: Spans mit Wortnummer, Tajwid nur an Graphem-Grenzen, Text unverändert (ganze Sure 2)', () => {
    let tajwidAbschnitte = 0;
    for (let v = 1; v <= 286; v++) {
      const { text, tajwid } = vers(2, v);
      const html = versHtml(teileMitVersatz(text), tajwid);
      expect(nurText(html)).toBe(text);
      const spans = [...html.matchAll(/<span data-w=(\d+)>/g)].map((m) => Number(m[1]));
      expect(spans).toEqual(woerter(text).map((w) => w.pos));
      tajwidAbschnitte += (html.match(/<b class="tj tj-(ghunna|ikhfa|iqlab|qalqala|madd|stumm)">/g) ?? []).length;
      // Kein Abschnitt beginnt mit einem Vokalzeichen (Harakat bleiben am Buchstaben)
      for (const m of html.matchAll(/<b class="tj tj-\w+">(.)/gu)) expect(m[1]).not.toMatch(/\p{M}/u);
    }
    expect(tajwidAbschnitte).toBeGreaterThan(1000);
  });

  it('ohne Tajwid bleibt der Vers ungefärbt (lieber ungefärbt als falsch)', () => {
    const { text } = vers(1, 2);
    expect(versHtml(teileMitVersatz(text), null)).not.toContain('<b');
  });

  it('versListeHtml: Anker, Sprache und Richtung, Übersetzung maskiert, schlichter Satz mit data-roh', () => {
    const { text, tajwid } = vers(1, 1);
    const v = { nr: 1, teile: teileMitVersatz(text), tajwid, uebersetzung: 'A <b>&' };
    const voll = versListeHtml(1, [v], false);
    expect(voll).toContain('<li class=vers id=v1 data-v=1><p class=vers-ar lang=ar dir=rtl><span data-w=1>');
    expect(voll).toContain('<p class=vers-ue>A &lt;b&gt;&amp;</p>');
    expect(versListeHtml(1, [v], true)).toContain('id=v1-1 ');
    const schlicht = versListeHtml(1, [{ ...v, uebersetzung: null }], false, false);
    expect(schlicht).toBe(`<li class=vers id=v1 data-v=1><p class=vers-ar lang=ar dir=rtl data-roh>${maskiere(text)}</p></li>`);
  });

  it('nur Al-Baqara liegt über der Grenze des vollen Satzes', () => {
    const laengen = suren.map((s) =>
      satzLaenge(s.verse.map((v) => ({ nr: v.nr, teile: teileMitVersatz(v.textAr), tajwid: [], uebersetzung: null }))),
    );
    expect(laengen.filter((l) => l > VOLLSATZ_GRENZE).length).toBe(1);
    expect(laengen[1]).toBeGreaterThan(VOLLSATZ_GRENZE);
  });
});

describe('Sichtbarkeit der Übersetzungen (ADR 0030, MN-02)', () => {
  const zeile = (id: string, sprache: string, aktiv: boolean, frei: boolean, standard = false): AusgabeZeile => ({
    id,
    sprache,
    titel: id,
    uebersetzer: '[Übersetzer]',
    aktiv,
    standard,
    freigegebenAm: frei ? '2026-10-13T00:00:00Z' : null,
  });
  const alle = [
    zeile('de-entwurf', 'de', false, false),
    zeile('de-frei', 'de', true, true),
    zeile('tr-aktiv-ohne-freigabe', 'tr', true, false),
    zeile('en-frei-inaktiv', 'en', false, true),
  ];

  it('freigegeben heißt aktiv und mit Freigabedatum', () => {
    expect(alle.map(istFreigegeben)).toEqual([false, true, false, false]);
  });

  it('Produktion: nur aktiv und freigegeben', () => {
    expect(sichtbareAusgaben(alle, false).map((a) => a.id)).toEqual(['de-frei']);
    expect(ausgabeFuer(sichtbareAusgaben(alle, false), 'tr')).toBeNull();
  });

  it('Entwicklung/Vorschau: alle, freigegebene zuerst, die übrigen mit Hinweis „ausstehend“', () => {
    const sichtbar = sichtbareAusgaben(alle, true);
    expect(sichtbar.map((a) => [a.id, a.ausstehend])).toEqual([
      ['de-frei', false],
      ['de-entwurf', true],
      ['tr-aktiv-ohne-freigabe', true],
      ['en-frei-inaktiv', true],
    ]);
    expect(ausgabeFuer(sichtbar, 'de')?.id).toBe('de-frei');
    expect(ausgabeFuer(sichtbar, 'tr')?.ausstehend).toBe(true);
  });

  it('Standard vor anderen freigegebenen derselben Sprache', () => {
    const zwei = [zeile('de-b', 'de', true, true), zeile('de-a', 'de', true, true, true)];
    expect(ausgabeFuer(sichtbareAusgaben(zwei, false), 'de')?.id).toBe('de-a');
  });
});

describe('Surensuche', () => {
  const schluessel = (nr: number) =>
    surenSchluessel(['', 'Al-Faatiha', 'Al-Baqara'][nr] ?? 'Yaseen', suren[nr === 36 ? 35 : nr - 1].nameAr);

  it('lange Vokale, Bindestriche und q/k werden gleich behandelt', () => {
    expect(sucheNormal('Al-Faatiha')).toBe(sucheNormal('al fatiha'));
    expect(passt('fatiha', 1, schluessel(1))).toBe(true);
    expect(passt('Bakara', 2, schluessel(2))).toBe(true);
    expect(passt('Yasin', 36, schluessel(36))).toBe(true);
  });

  it('Nummern treffen genau, der arabische Name trifft ohne Vokalzeichen', () => {
    expect(passt('2', 2, schluessel(2))).toBe(true);
    expect(passt('2', 22, 'x')).toBe(false);
    expect(passt(suren[1].nameAr, 2, schluessel(2))).toBe(true);
    expect(passt('', 7, 'x')).toBe(true);
    expect(passt('zzz', 2, schluessel(2))).toBe(false);
  });
});
