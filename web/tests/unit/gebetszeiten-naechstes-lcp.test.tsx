import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { GebetszeitenSeite, type GebetszeitenSeiteTexte } from '@/components/website/gebetszeiten/GebetszeitenSeite';
import { naechstesSchluessel, ZEIT_BREITE, ZEIT_PLATZHALTER } from '@/components/website/gebetszeiten/zeiten';
import { zeitpunkt } from '@/lib/gebetszeiten/naechstes';
import type { GebetszeitTag } from '@/lib/gebetszeiten/typen';

/**
 * Z-08 (N1, Gegenprüfung): Auf /gebetszeiten war beim Wiederbesuch (Konzept-Hinweis schon gesehen) die Uhrzeit des
 * nächsten Gebets das LCP-Element. Sie stand erst nach der Hydrierung da, weil der Block über `key={wechsel ?? 'ohne'}`
 * beim ersten Wert neu eingehängt wurde (neues Element = neuer, später LCP-Kandidat, LCP ≈ 4,2 s). Jetzt steht schon im
 * statischen HTML ein Platzhalter in einem Feld so breit wie jede Uhrzeit (unsichtbares Muster „88:88“ in tabellarischen
 * Ziffern, `breite-nach-muster`), und der erste Wert ersetzt nur den Text desselben Elements.
 * Die Zeiten sind feste Beispielwerte; der Browser-Zustand nach der Hydrierung wird über `useJetzt` nachgestellt.
 */
const zustand = vi.hoisted(() => ({ jetzt: null as Date | null }));
vi.mock('@/lib/zeit/useJetzt', () => ({ useJetzt: () => zustand.jetzt }));

const tage: GebetszeitTag[] = [
  { datum: '2026-10-11', quelle: 'import', imsak: '06:05', gunes: '07:42', ogle: '13:24', ikindi: '16:22', aksam: '18:58', yatsi: '20:28' },
  { datum: '2026-10-12', quelle: 'import', imsak: '06:07', gunes: '07:44', ogle: '13:23', ikindi: '16:20', aksam: '18:56', yatsi: '20:26' },
];
const namen = { imsak: 'Imsak', gunes: 'Güneş', ogle: 'Öğle', ikindi: 'İkindi', aksam: 'Akşam', yatsi: 'Yatsı' };
const texte: GebetszeitenSeiteTexte = {
  naechstesMorgen: '{name} (morgen)',
  uhr: '{zeit} Uhr',
  verbleibt: 'verbleibt: {zeit}',
  restStunden: '{stunden} Std. {minuten} Min.',
  restMinuten: '{minuten} Min.',
  naechstesTag: 'Nächstes Gebet',
  badgeInfo: 'Info',
  listeHeute: 'Heute',
  bogenTitel: 'Tagesbogen',
  bogenBeschreibung: 'Beschreibung',
  bogenLocale: 'de-DE',
  namen,
  beschreibungen: namen,
  ansichtAria: 'Ansicht',
  tabs: { heute: 'Heute', ort: 'Ort', monat: 'Monat', qibla: 'Qibla', einstellungen: 'Einstellungen' },
};

/** Markup der Seite mit der Browserzeit `jetzt` (null = statisches HTML bzw. Hydrierung). */
function markup(jetzt: Date | null, uhr = texte.uhr) {
  zustand.jetzt = jetzt;
  return renderToStaticMarkup(
    <GebetszeitenSeite
      tage={tage}
      referenz="2026-10-11"
      texte={{ ...texte, uhr }}
      panels={{ ort: null, monat: null, qibla: null, einstellungen: null }}
      tabSymbole={{ heute: null, ort: null, monat: null, qibla: null, einstellungen: null }}
    />,
  );
}

/** Der Bereich „nächstes Gebet“ (bis zum Ende der Section). */
const bereich = (html: string) => html.slice(html.indexOf('<section aria-labelledby="gz-naechstes"'), html.indexOf('</section>') + 10);
/** Feld der großen Uhrzeit: Breitenmuster und sichtbarer Text. */
const feld = (html: string) =>
  /<span data-muster="([^"]*)" class="breite-nach-muster text-48[^"]*"><span>([^<]*)<\/span><\/span>/.exec(bereich(html));
const uhrzeit = (html: string) => feld(html)?.[2];

describe('Nächstes Gebet: Platzhalter in der Größe der Uhrzeit (Z-08)', () => {
  const vorher = markup(null);
  const nachher = markup(zeitpunkt('2026-10-11', '15:00'));

  it('statisches HTML: Platzhalter statt einer Uhrzeit, im Format der Zeit', () => {
    expect(uhrzeit(vorher)).toBe(`${ZEIT_PLATZHALTER} Uhr`);
    expect(uhrzeit(vorher)).not.toMatch(/\d/);
  });

  it('das Feld ist so breit wie jede Uhrzeit: Muster in Ziffern, keine gültige Uhrzeit, vor und nach der Hydrierung gleich', () => {
    expect(feld(vorher)?.[1]).toBe(`${ZEIT_BREITE} Uhr`);
    expect(feld(nachher)?.[1]).toBe(feld(vorher)?.[1]);
    expect(ZEIT_BREITE).toMatch(/^\d\d:\d\d$/);
    expect(Number(ZEIT_BREITE.slice(0, 2))).toBeGreaterThan(23);
    expect(ZEIT_PLATZHALTER.replace(/–/g, '8')).toBe(ZEIT_BREITE);
  });

  it('nach der Hydrierung: die Zeit des nächsten Gebets, gleich viele Zeichen wie der Platzhalter', () => {
    expect(uhrzeit(nachher)).toBe('16:22 Uhr');
    expect(uhrzeit(nachher)!.replace(/\d/g, '–')).toBe(uhrzeit(vorher));
  });

  it('nur die Texte wechseln: gleiche Elemente und Klassen (keine Einblendung beim ersten Wert)', () => {
    const geruest = (html: string) => bereich(html).replace(/>[^<]*</g, '><');
    expect(geruest(nachher)).toBe(geruest(vorher));
    expect(bereich(nachher)).not.toContain('blendet-ein');
  });

  it('Sprachen ohne „Uhr“ (tr, en): nur der Platzhalter', () => {
    expect(uhrzeit(markup(null, '{zeit}'))).toBe(ZEIT_PLATZHALTER);
    expect(uhrzeit(markup(zeitpunkt('2026-10-11', '15:00'), '{zeit}'))).toBe('16:22');
  });
});

describe('naechstesSchluessel: kein neues Element beim ersten Wert (B-10, Z-08)', () => {
  it('Hydrierung und erster Wert behalten denselben Schlüssel', () => {
    expect(naechstesSchluessel(null, false)).toBe(naechstesSchluessel('ikindi-heute', false));
  });

  it('jeder echte Wechsel ergibt einen neuen Schlüssel (Einblendung startet neu)', () => {
    const erster = naechstesSchluessel('ikindi-heute', false);
    const zweiter = naechstesSchluessel('aksam-heute', true);
    const dritter = naechstesSchluessel('yatsi-heute', true);
    expect(new Set([erster, zweiter, dritter]).size).toBe(3);
  });

  it('die Seite setzt den Schlüssel des Blocks über naechstesSchluessel', () => {
    const code = readFileSync(
      join(import.meta.dirname, '..', '..', 'src', 'components', 'website', 'gebetszeiten', 'GebetszeitenSeite.tsx'),
      'utf8',
    );
    expect(code).toContain('key={naechstesSchluessel(wechsel, gewechselt)}');
    expect(code).not.toMatch(/key=\{wechsel \?\?/);
  });
});
