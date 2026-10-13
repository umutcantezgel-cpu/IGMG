import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bogenArt } from '@/components/website/start/bogenwahl';
import { ramadanImFenster } from '@/components/website/start/ramadan-fenster';
import { tagPlus } from '@/lib/kalender/raster';

/**
 * Startseite im Ramadan (Vorführpfad Station 1, B-20 statt B-06): Der Server rechnet die Ramadan-Tage des Fensters über
 * den Hidschri-Kalender (umalqura, vorläufig), der Browser vergleicht nur das heutige Datum. Ramadan 1448 nach umalqura:
 * 8. Februar bis 9. März 2027 (berechnet, kann von der Bekanntgabe abweichen – MN-15).
 */
const fenster = (von: string, tage = 47) => Array.from({ length: tage }, (_, i) => tagPlus(von, i));

describe('ramadanImFenster (Server, Hidschri-Logik)', () => {
  it('außerhalb des Ramadan: leer (Herbst 2026)', () => {
    expect(ramadanImFenster(fenster('2026-10-12'))).toEqual([]);
  });

  it('Fenster vor Ramadan-Beginn: genau die Tage ab dem 1. Ramadan', () => {
    const tage = ramadanImFenster(fenster('2027-01-20'));
    expect(tage[0]).toBe('2027-02-08');
    expect(tage).toContain('2027-02-20');
    expect(tage).not.toContain('2027-02-07');
    // fortlaufend, ohne Lücke
    tage.forEach((d, i) => i > 0 && expect(d).toBe(tagPlus(tage[i - 1], 1)));
  });

  it('Fenster über das Ende: der Bayram gehört nicht mehr dazu', () => {
    const tage = ramadanImFenster(fenster('2027-03-01', 20));
    expect(tage.at(-1)! >= '2027-03-08' && tage.at(-1)! <= '2027-03-09').toBe(true);
    expect(tage).not.toContain('2027-03-11');
  });
});

describe('bogenArt (Browser, ohne Kalender)', () => {
  const ramadan = ['2027-02-08', '2027-02-09', '2027-02-10'];

  it('im Ramadan: Fastenbogen, mit und ohne Vorschau-Schalter', () => {
    expect(bogenArt({ heute: '2027-02-09', ramadan, vorschau: false, gewaehlt: false })).toBe('fasten');
    expect(bogenArt({ heute: '2027-02-09', ramadan, vorschau: true, gewaehlt: true })).toBe('fasten');
  });

  it('außerhalb: Tagesbogen; Vorschau nur mit Schalter UND Wahl der Vorführung', () => {
    expect(bogenArt({ heute: '2027-02-07', ramadan, vorschau: false, gewaehlt: false })).toBe('tag');
    expect(bogenArt({ heute: '2027-02-07', ramadan, vorschau: false, gewaehlt: true })).toBe('tag');
    expect(bogenArt({ heute: '2027-02-07', ramadan, vorschau: true, gewaehlt: false })).toBe('tag');
    expect(bogenArt({ heute: '2027-02-07', ramadan, vorschau: true, gewaehlt: true })).toBe('fasten-vorschau');
  });

  it('das Datum des Browsers entscheidet, nicht der Referenztag der statischen Seite', () => {
    // Seite am Vortag gebaut (Referenz 07.02.), im Browser ist schon der 1. Ramadan
    expect(bogenArt({ heute: '2027-02-08', ramadan, vorschau: false, gewaehlt: false })).toBe('fasten');
  });
});

describe('Bauweise der Startseite', () => {
  const quelle = (p: string) => readFileSync(join(import.meta.dirname, '..', '..', 'src', p), 'utf8');

  it('StartBogen ist eine Client-Insel ohne islamischen Kalender, Cookies oder Header', () => {
    const s = quelle('components/website/start/StartBogen.tsx');
    expect(s.startsWith("'use client'")).toBe(true);
    expect(s).not.toMatch(/gebetszeiten\/hijri|ramadan-fenster|next\/headers|document\.cookie/);
  });

  it('Tagesbogen (Server) liest den Schalter ramadan_vorschau und rechnet die Ramadan-Tage', () => {
    const s = quelle('components/website/start/Tagesbogen.tsx');
    expect(s).toMatch(/funktionAn\('ramadan_vorschau'\)/);
    expect(s).toMatch(/ramadanImFenster\(/);
    expect(s).not.toMatch(/next\/headers|cookies\(|headers\(/);
  });
});
