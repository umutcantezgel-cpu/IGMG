import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { wissenAnzeige } from '@/components/website/wissen/anzeige';
import { wissenInhalt } from '@/components/website/wissen/inhalt';

/**
 * Islamisches Wissen ohne Platzhalter der Gemeinde (Vorstellung 23.11.2026): Autorzeile nur mit gepflegtem Namen, Videos
 * nur mit YouTube-ID (sonst gäbe es nichts anzusehen), Experten nur mit gepflegtem Namen – ihre übrigen Angaben leer,
 * solange sie Platzhalter sind. Nichts wird erfunden; die Daten bleiben, wie sie sind.
 */
const INHALT = wissenInhalt.parse({
  artikel: [
    {
      schluessel: 'a1',
      thema: 'allah',
      titel: { de: 'Erster Artikel', tr: 'İlk makale' },
      autor: '[Name – Autor/in 1]',
      lesezeit: '5 min',
      datum: '2024-01-15',
    },
    { schluessel: 'a2', thema: 'quran', titel: { de: 'Zweiter Artikel' }, autor: 'Testperson Eins', lesezeit: '8 min' },
  ],
  videos: [
    { schluessel: 'v1', thema: 'islam', titel: { de: 'Ohne Quelle' }, dauer: '5 min', beschreibung: { de: 'Beschreibung eins.' } },
    {
      schluessel: 'v2',
      thema: 'fivestoesarz',
      titel: { de: 'Mit Quelle', en: 'With source' },
      dauer: '',
      beschreibung: { de: 'Ein Film. Gezeigt am [Datum – von der Gemeinde].' },
      youtubeId: 'ytTuELK2slU',
    },
  ],
  experten: [
    {
      schluessel: 'e1',
      name: '[Name – Gelehrte/r 1]',
      fachgebiet: { de: '[Fachgebiet]' },
      institution: '[Institution]',
      bio: { de: '[Bio]' },
      anzahlArtikel: '[Anzahl]',
    },
    {
      schluessel: 'e2',
      name: 'Testperson Zwei',
      fachgebiet: { de: 'Koranwissenschaft' },
      institution: '[Institution]',
      bio: { de: '[Bio]' },
      anzahlArtikel: '3',
    },
  ],
});
const TEXTE = { vorschau: (titel: string) => `Vorschaubild: ${titel}`, youtube: 'Auf YouTube ansehen' };

describe('wissenAnzeige', () => {
  it('Artikel bleiben alle; ein Autorenname als Platzhalter ergibt null, ein gepflegter Name bleibt (in tr/en mit lang="de")', () => {
    const de = wissenAnzeige(INHALT, 'de', TEXTE).artikel;
    expect(de.map((a) => a.schluessel)).toEqual(['a1', 'a2']);
    expect(de[0].autor).toBeNull();
    expect(de[1].autor).toEqual({ text: 'Testperson Eins', lang: undefined });
    expect(de[1].datum).toBe('');
    const tr = wissenAnzeige(INHALT, 'tr', TEXTE).artikel;
    expect(tr[0].titel).toEqual({ text: 'İlk makale', lang: undefined });
    expect(tr[1].autor).toEqual({ text: 'Testperson Eins', lang: 'de' });
  });

  it('Videos nur mit YouTube-ID: Link fertig vom Server, Beschreibung ohne den Satz mit Platzhalter', () => {
    const videos = wissenAnzeige(INHALT, 'de', TEXTE).videos;
    expect(videos.map((v) => v.schluessel)).toEqual(['v2']);
    expect(videos[0].vorschau).toBe('Vorschaubild: Mit Quelle');
    expect(videos[0].beschreibung.text).toBe('Ein Film.');
    const link = renderToStaticMarkup(<>{videos[0].link}</>);
    expect(link).toContain('href="https://www.youtube.com/watch?v=ytTuELK2slU"');
    expect(link).toContain('aria-label="Auf YouTube ansehen: Mit Quelle"');
  });

  it('Experten nur mit gepflegtem Namen; Angaben, die noch Platzhalter sind, kommen leer an', () => {
    const experten = wissenAnzeige(INHALT, 'en', TEXTE).experten;
    expect(experten).toEqual([
      {
        schluessel: 'e2',
        name: { text: 'Testperson Zwei', lang: 'de' },
        fachgebiet: { text: 'Koranwissenschaft', lang: 'de' },
        institution: { text: '', lang: 'de' },
        bio: { text: '', lang: 'de' },
        anzahlArtikel: { text: '3', lang: 'de' },
      },
    ]);
  });

  it('nirgends bleibt ein Platzhalter in eckigen Klammern', () => {
    for (const sprache of ['de', 'tr', 'en'] as const) {
      const { artikel, videos, experten } = wissenAnzeige(INHALT, sprache, TEXTE);
      // Alle Zeichenketten der Anzeige-Daten (ohne das fertige Link-Element der Videos)
      const texte = JSON.stringify({ artikel, videos: videos.map((v) => ({ ...v, link: null })), experten }, (_k, wert: unknown) =>
        typeof wert === 'string' ? wert.replace(/[[\]]/g, (z) => (z === '[' ? '⟦' : '⟧')) : wert,
      );
      expect(texte).not.toMatch(/⟦[^⟧]*⟧/);
    }
  });
});
