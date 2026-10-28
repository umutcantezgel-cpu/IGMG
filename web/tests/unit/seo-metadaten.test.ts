import { describe, expect, it } from 'vitest';
import { enthaeltArabisch } from '@/lib/lernapp/waechter/kern.mjs';
import { indexierungGesperrt, NOINDEX } from '@/lib/seo/indexierung';
import { llmsText } from '@/lib/seo/llms';
import { SEO_SEITEN } from '@/lib/seo/seiten';
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import seo from '../../messages/bereiche/seo.json';
import tr from '../../messages/tr.json';

/**
 * Metadaten für Suche und Antwortmaschinen (ADR 0049): Metatitel höchstens 45 Zeichen (mit der Vorlage „%s · IGMG
 * Wetzlar“ höchstens 60; die Startseite ohne Vorlage höchstens 60), Beschreibungen 120–155 Zeichen mit Ortsbezug und ohne
 * Platzhalter, die Indexierungs-Schranke und der Inhalt von /llms.txt.
 */
const SPRACHEN = ['de', 'tr', 'en'] as const;
const VORLAGE = ' · IGMG Wetzlar';

describe('Namensraum seo', () => {
  const routen = Object.keys(seo.de.seo).filter((k) => k !== 'llms') as (keyof typeof seo.de.seo)[];

  it('jede Seite aus SEO_SEITEN hat Titel und Beschreibung in allen Sprachen', () => {
    for (const { schluessel } of SEO_SEITEN) for (const s of SPRACHEN) expect(seo[s].seo[schluessel], `${s}.${schluessel}`).toBeDefined();
  });

  it('Titel: höchstens 60 Zeichen samt Vorlage; Beschreibung 120–155 Zeichen, mit „Wetzlar“, ohne Platzhalter', () => {
    const befunde: string[] = [];
    for (const s of SPRACHEN)
      for (const r of routen) {
        const { titel, beschreibung } = seo[s].seo[r] as { titel: string; beschreibung: string };
        const gesamt = r === 'start' ? titel.length : titel.length + VORLAGE.length;
        if (gesamt > 60) befunde.push(`${s}.${r}.titel: ${gesamt} Zeichen`);
        if (beschreibung.length < 120 || beschreibung.length > 155) befunde.push(`${s}.${r}.beschreibung: ${beschreibung.length} Zeichen`);
        if (!beschreibung.includes('Wetzlar')) befunde.push(`${s}.${r}.beschreibung ohne „Wetzlar“`);
        if (/[[\]]/.test(titel + beschreibung)) befunde.push(`${s}.${r}: Platzhalter`);
      }
    expect(befunde).toEqual([]);
  });

  it('Titel und Beschreibungen sind je Sprache eindeutig (kein doppelter Inhalt zwischen Seiten)', () => {
    for (const s of SPRACHEN) {
      const eintraege = routen.map((r) => seo[s].seo[r] as { titel: string; beschreibung: string });
      expect(new Set(eintraege.map((e) => e.titel)).size, s).toBe(eintraege.length);
      expect(new Set(eintraege.map((e) => e.beschreibung)).size, s).toBe(eintraege.length);
    }
  });

  it('meta.beschreibung (Standard des Layouts) ist gepflegt, übersetzt und nennt Wetzlar und 1978', () => {
    const texte = [de, tr, en].map((m) => m.meta.beschreibung);
    for (const t of texte) {
      expect(t).not.toMatch(/[[\]]/);
      expect(t.length).toBeGreaterThanOrEqual(120);
      expect(t.length).toBeLessThanOrEqual(155);
      expect(t).toContain('Wetzlar');
      expect(t).toContain('1978');
    }
    expect(new Set(texte).size).toBe(3);
    expect(texte).not.toContain(seo.de.seo.start.beschreibung);
  });
});

describe('Indexierungs-Schranke', () => {
  it('greift nur mit Konzept-Hinweis auf Vercel', () => {
    expect(indexierungGesperrt(true, { VERCEL: '1' })).toBe(true);
    expect(indexierungGesperrt(true, {})).toBe(false);
    expect(indexierungGesperrt(false, { VERCEL: '1' })).toBe(false);
    expect(indexierungGesperrt(false, {})).toBe(false);
  });

  it('noindex, aber Links bleiben verfolgbar', () => {
    expect(NOINDEX).toEqual({ index: false, follow: true });
  });
});

describe('llms.txt', () => {
  const text = llmsText('https://example.test/');
  const zeilen = text.split('\n');

  it('Kopf nach llmstxt.org: Name, Kurzbeschreibung als Zitat, Fakten mit Quelle', () => {
    expect(zeilen[0]).toBe('# IGMG Wetzlar');
    expect(zeilen[2]).toBe(`> ${de.meta.beschreibung}`);
    expect(text).toContain(`## ${seo.de.seo.llms.fakten}`);
    expect(text).toContain('Fatih-Moschee Wetzlar (Wetzlar Fatih Camii; Fatih Mosque Wetzlar)');
    expect(text).toMatch(/1978 \(Quelle: https:\/\/www\.igmg\.org\//);
    expect(text).toContain('[Islamische Gemeinschaft Millî Görüş e.V. (IGMG)](https://www.igmg.org/), Colonia-Allee 3, 51067 Köln');
    expect(text).toContain('IGMG Regionalverband Hessen (Stand: 07.04.2008;');
  });

  it('je Sprache die Seiten mit eigenem Titel, absoluter Adresse und Beschreibung', () => {
    for (const m of [de, tr, en]) expect(zeilen).toContain(`## ${m.meta.sprache}`);
    expect(text).toContain(
      `- [${seo.tr.seo.gebetszeiten.titel}](https://example.test/tr/namaz-vakitleri): ${seo.tr.seo.gebetszeiten.beschreibung}`,
    );
    expect(text).toContain(`- [${seo.en.seo.start.titel}](https://example.test/en): `);
    expect(zeilen.filter((z) => z.startsWith('- [')).length).toBe(SEO_SEITEN.length * 3 + 1);
    expect(text).toContain('(https://example.test/sitemap.xml)');
    expect(text.endsWith('\n')).toBe(true);
  });

  it('ohne Platzhalter, Mobilnummern und arabische Schrift', () => {
    // Nach dem Entfernen der Markdown-Links bleiben keine eckigen Klammern
    expect(text.replace(/\[[^\]\n]+\]\(https:\/\/[^)\s]+\)/g, '')).not.toMatch(/[[\]]/);
    expect(text).not.toMatch(/\+49\s?1[5-7]\d|\b01[5-7]\d/);
    expect(enthaeltArabisch(text)).toBe(false);
  });
});
