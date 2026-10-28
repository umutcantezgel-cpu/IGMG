import { describe, expect, it } from 'vitest';
import { HADSCH_UMRA_BEISPIEL, HADSCH_UMRA_QUELLE } from '../../drizzle/seeds/bereiche/hadsch-umra';
import { baueMenues } from '@/components/website/navigation';
import { pfadFuer } from '@/i18n/navigation';
import { ZIEL_VORSCHLAEGE } from '@/lib/cms/ziele';
import { abfluegeNachArt, aktuelleHinweise, flughaefen, kommendeAbfluege, zielFuer } from '@/lib/hadsch-umra/auswahl';
import { faqSeite } from '@/lib/seo/jsonld';
import { SEO_SEITEN } from '@/lib/seo/seiten';
import { FESTE_ZIELE } from '@/lib/seo/sitemap';
import { SEITENINHALT } from '@/lib/validierung/seiteninhalte';
import { abflug, hadschUmraZiel, programm, schema, video, type Abflug } from '@/lib/validierung/seiteninhalte/hadsch-umra';

/**
 * Seite „Hadsch & Umra“ (Plan Marktstart P4): Schema mit gültigen Standardwerten und ohne Preisfeld, Links nur ins
 * IGMG-Netzwerk, Filter für abgelaufene Hinweise und vergangene Abflüge, Linkziele mit Sprachhinweis, Seed nach den Regeln
 * (G-04, G-05, G-06) und die Einbindung (Route, Menü, Sitemap, Metadaten, CMS-Ziele). Daten fiktiv bzw. aus dem Seed.
 */
const inhalt = schema.parse(HADSCH_UMRA_BEISPIEL);

const abflugVon = (art: Abflug['art'], hin: string, rueck = hin): Abflug => ({ art, gruppe: { de: `Testgruppe ${hin}` }, hin, rueck });

describe('Schema hadsch-umra', () => {
  it('steht in der Registry; Standardwerte sind gültig, mit Platzhaltern und leeren Listen', () => {
    expect(SEITENINHALT['hadsch-umra']).toBe(schema);
    const standard = schema.parse({});
    expect(schema.safeParse(standard).success).toBe(true);
    expect(standard.einleitung.de).toMatch(/^\[.+\]$/);
    expect(standard.anmeldung.text.de).toMatch(/^\[.+\]$/);
    expect(standard.ansprechperson).toEqual({ name: '[Ansprechperson Hadsch & Umra – von der Gemeinde]', telefon: '[Telefonnummer]' });
    expect(standard.abfluege).toEqual({ quellen: [], eintraege: [] });
    for (const liste of [standard.hinweise, standard.programme, standard.unterlagen, standard.videos, standard.faq])
      expect(liste).toEqual([]);
    expect(standard.stand).toBe('');
  });

  it('Programme haben kein Preisfeld: ein mitgeschickter Preis fällt beim Prüfen weg', () => {
    expect(Object.keys(programm.shape).sort()).toEqual(['art', 'link', 'text', 'titel']);
    const geprueft = programm.parse({ art: 'umra', titel: { de: 'Testprogramm' }, link: 'reisenUmra', preis: '2395 €' });
    expect(geprueft).not.toHaveProperty('preis');
    expect(Object.keys(schema.shape.programme.unwrap().element.shape)).not.toContain('preis');
  });

  it('Links: Netzwerk-Schlüssel oder https-Adressen mit Host aus dem IGMG-Netzwerk; fremde Hosts und http abgewiesen', () => {
    expect(hadschUmraZiel.safeParse('reisenHadsch').success).toBe(true);
    expect(hadschUmraZiel.safeParse({ de: 'https://www.igmgreisen.com/kultur-turlari/', seitenSprache: 'tr' }).success).toBe(true);
    expect(hadschUmraZiel.safeParse('gibtEsNicht').success).toBe(false);
    expect(hadschUmraZiel.safeParse({ de: 'https://example.com/hadsch/' }).success).toBe(false);
    expect(hadschUmraZiel.safeParse({ de: 'http://www.igmgreisen.com/de/hadsch/' }).success).toBe(false);
    expect(hadschUmraZiel.safeParse({ de: 'https://www.igmgreisen.com/de/', tr: 'https://example.org/' }).success).toBe(false);
    expect(hadschUmraZiel.safeParse({ de: 'javascript:alert(1)' }).success).toBe(false);
    // Der Fehler steht am Feld der Adresse (für die Fehlerliste der Verwaltung)
    const fehler = schema.safeParse({ programme: [{ art: 'hadsch', titel: { de: 'Test' }, link: { de: 'https://example.com/' } }] });
    expect(fehler.success).toBe(false);
    expect(fehler.error?.issues.map((i) => i.path.join('.'))).toContain('programme.0.link.de');
  });

  it('Abflüge: Kalendertage, IATA-Kürzel, Rückflug nicht vor dem Hinflug', () => {
    expect(abflug.safeParse({ ...abflugVon('umra', '2027-01-10'), abflughafen: 'DUS/FRA', zielflughafen: 'JED' }).success).toBe(true);
    expect(abflug.safeParse({ ...abflugVon('umra', '2027-01-10'), abflughafen: 'Frankfurt' }).success).toBe(false);
    expect(abflug.safeParse(abflugVon('umra', '2027-02-30')).success).toBe(false);
    const rueckwaerts = abflug.safeParse(abflugVon('hadsch', '2027-05-20', '2027-05-01'));
    expect(rueckwaerts.success).toBe(false);
    expect(rueckwaerts.error?.issues[0]).toMatchObject({ path: ['rueck'], message: 'rueckVorHin' });
  });

  it('Videos: eine eingefügte YouTube-Adresse wird zur ID; fremde Adressen abgewiesen; höchstens zwölf', () => {
    for (const roh of ['https://youtu.be/ytTuELK2slU', 'https://www.youtube.com/watch?v=ytTuELK2slU', 'youtube.com/embed/ytTuELK2slU'])
      expect(video.parse({ youtubeId: roh, titel: { de: 'Test' } }).youtubeId).toBe('ytTuELK2slU');
    expect(video.safeParse({ youtubeId: 'https://vimeo.com/123456', titel: { de: 'Test' } }).success).toBe(false);
    const dreizehn = Array.from({ length: 13 }, () => ({ youtubeId: 'ytTuELK2slU', titel: { de: 'Test' } }));
    expect(schema.safeParse({ videos: dreizehn }).success).toBe(false);
  });
});

describe('Auswahl: Hinweise und Abflüge nach dem Tag', () => {
  it('Hinweise bis einschließlich ihres Tages, danach ausgeblendet; nach Frist sortiert', () => {
    const hinweise = [
      { text: { de: 'Später' }, bis: '2026-12-01' },
      { text: { de: 'Heute' }, bis: '2026-11-01' },
      { text: { de: 'Gestern' }, bis: '2026-10-31' },
    ];
    expect(aktuelleHinweise(hinweise, '2026-11-01').map((h) => h.text.de)).toEqual(['Heute', 'Später']);
    expect(aktuelleHinweise(hinweise, '2026-12-02')).toEqual([]);
    // Seed: die Frist für Hadsch 2027 erscheint bis zum 1. November 2026
    expect(aktuelleHinweise(inhalt.hinweise, '2026-10-28')).toHaveLength(1);
    expect(aktuelleHinweise(inhalt.hinweise, '2026-11-02')).toEqual([]);
  });

  it('Abflüge ab dem Abflugtag ausgeblendet erst am Folgetag; nach Abflug sortiert und nach Art gruppiert', () => {
    const liste = [abflugVon('umra', '2027-03-22'), abflugVon('hadsch', '2027-05-05'), abflugVon('umra', '2026-12-23')];
    expect(kommendeAbfluege(liste, '2026-12-23').map((a) => a.hin)).toEqual(['2026-12-23', '2027-03-22', '2027-05-05']);
    expect(kommendeAbfluege(liste, '2026-12-24').map((a) => a.hin)).toEqual(['2027-03-22', '2027-05-05']);
    expect(abfluegeNachArt(liste, '2026-12-24').map((g) => [g.art, g.eintraege.length])).toEqual([
      ['hadsch', 1],
      ['umra', 1],
    ]);
    expect(abfluegeNachArt(liste, '2027-06-01')).toEqual([]);
  });

  it('Seed: am 28.10.2026 alle acht Abflüge sichtbar, ab dem 5.10.2027 keiner mehr', () => {
    expect(kommendeAbfluege(inhalt.abfluege.eintraege, '2026-10-28')).toHaveLength(8);
    expect(abfluegeNachArt(inhalt.abfluege.eintraege, '2026-10-28').map((g) => [g.art, g.eintraege.length])).toEqual([
      ['hadsch', 3],
      ['umra', 5],
    ]);
    expect(kommendeAbfluege(inhalt.abfluege.eintraege, '2027-01-01').map((a) => a.hin)).toEqual([
      '2027-03-22',
      '2027-04-28',
      '2027-05-03',
      '2027-05-05',
      '2027-06-29',
      '2027-10-04',
    ]);
    expect(kommendeAbfluege(inhalt.abfluege.eintraege, '2027-10-05')).toEqual([]);
  });

  it('Flughafen-Kürzel einer Angabe', () => {
    expect(flughaefen('DUS/FRA')).toEqual(['DUS', 'FRA']);
    expect(flughaefen('FRA')).toEqual(['FRA']);
    expect(flughaefen(undefined)).toEqual([]);
  });
});

describe('Linkziele mit Sprache', () => {
  it('Netzwerk-Schlüssel: Adresse je Sprache, Englisch fällt auf Deutsch zurück (IGMG Reisen ohne Englisch)', () => {
    expect(zielFuer('reisenHadsch', 'tr')).toEqual({ href: 'https://www.igmgreisen.com/hac/', zielSprache: 'tr', rueckfall: false });
    expect(zielFuer('reisenHadsch', 'en')).toEqual({ href: 'https://www.igmgreisen.com/de/hadsch/', zielSprache: 'de', rueckfall: true });
    // Begleiter in allen Sprachen: kein Rückfall
    expect(zielFuer('umreYoldasim', 'en').rueckfall).toBe(false);
  });

  it('eigene Adresse nur auf Türkisch: Hinweis auf Deutsch und Englisch, nicht auf Türkisch', () => {
    const kultur = { de: 'https://www.igmgreisen.com/kultur-turlari/', seitenSprache: 'tr' } as const;
    expect(zielFuer(kultur, 'de')).toEqual({ href: kultur.de, zielSprache: 'tr', rueckfall: true });
    expect(zielFuer(kultur, 'tr')).toEqual({ href: kultur.de, zielSprache: 'tr', rueckfall: false });
    expect(zielFuer(kultur, 'en')).toMatchObject({ zielSprache: 'tr', rueckfall: true });
  });

  it('eigene Adresse mit Fassungen: jede Sprache ihre Adresse, ohne Fassung die deutsche', () => {
    const ziel = { de: 'https://www.igmg.org/a/', en: 'https://www.igmg.org/en/a/' };
    expect(zielFuer(ziel, 'de')).toEqual({ href: ziel.de, zielSprache: 'de', rueckfall: false });
    expect(zielFuer(ziel, 'en')).toEqual({ href: ziel.en, zielSprache: 'en', rueckfall: false });
    expect(zielFuer(ziel, 'tr')).toEqual({ href: ziel.de, zielSprache: 'de', rueckfall: true });
  });
});

describe('Seed hadsch-umra (Stand 13.10.2026)', () => {
  const alleTexte = JSON.stringify(HADSCH_UMRA_BEISPIEL);

  it('gültig, mit Stand, Quelle und den belegten Fakten', () => {
    expect(inhalt.stand).toBe('2026-10-13');
    expect(inhalt.abfluege.stand).toBe('2026-10-13');
    expect(inhalt.abfluege.quellen).toEqual(['reisenHadsch', 'reisenUmra']);
    expect(inhalt.hinweise).toEqual([expect.objectContaining({ bis: '2026-11-01', link: 'reisenHadsch' })]);
    expect(inhalt.programme.map((p) => p.link)).toEqual([
      'reisenHadsch',
      'reisenUmra',
      'reisenUmraBedingungen',
      { de: 'https://www.igmgreisen.com/kultur-turlari/', seitenSprache: 'tr' },
    ]);
    expect(inhalt.anmeldung.stelle).toBe('reisenZweigstellen');
    expect(inhalt.unterlagen.map((u) => u.url)).toEqual(['reisenDokumente', 'reisenDokumente', 'umreYoldasim']);
    expect(inhalt.videos.map((v) => v.youtubeId)).toEqual(['ytTuELK2slU', 'vkaJ9HxrJuo', 'eYOO4BNqx0Q', 'y_pz3asmjck', '2IMALB-98ag']);
    expect(inhalt.faq.length).toBeGreaterThanOrEqual(5);
    expect(inhalt.faq.length).toBeLessThanOrEqual(7);
    expect(HADSCH_UMRA_QUELLE).toContain('Crawl 13.10.2026');
    // Jede Sprache für alle Texte
    for (const e of [inhalt.einleitung, inhalt.anmeldung.text, ...inhalt.faq.flatMap((f) => [f.frage, f.antwort])])
      expect(e.tr && e.en, e.de).toBeTruthy();
  });

  it('Ansprechperson als Platzhalter, keine Telefonnummern (G-04), keine Preise außer den belegten Anzahlungen', () => {
    expect(inhalt.ansprechperson.name).toBe('[Ansprechperson Hadsch & Umra – von der Gemeinde]');
    expect(inhalt.ansprechperson.telefon).toBe('[Telefonnummer]');
    expect(alleTexte).not.toMatch(/\+49|\b0\d{3,4}[ /-]?\d{3,}/);
    // Beträge nur im Anmeldetext (Anzahlung laut IGMG Reisen), nirgends sonst
    const ohneAnmeldung = JSON.stringify({ ...inhalt, anmeldung: null });
    expect(ohneAnmeldung).not.toMatch(/€|EUR|\d\.\d{3}/);
    expect(JSON.stringify(inhalt.anmeldung.text)).toMatch(/2\.500 €/);
  });

  it('nichts Veraltetes, nichts Religiöses aus den Quellen (G-06): kein Rundschreiben von 2014, keine arabische Schrift, keine Versangaben', () => {
    expect(alleTexte).not.toMatch(/tebligat/i);
    expect(alleTexte).not.toMatch(/[؀-ۿ]/);
    expect(alleTexte).not.toMatch(/\b\d{1,3}\s?:\s?\d{1,3}\b/);
    expect(alleTexte).not.toMatch(/Lebbeyk|Labbaik|Talbiya/i);
  });

  it('FAQPage nur mit gepflegten Fragen: die Frage mit Platzhalter (Seminartermine) fehlt in den strukturierten Daten', () => {
    const faq = faqSeite(inhalt.faq, 'de');
    expect(faq?.['@type']).toBe('FAQPage');
    expect((faq?.mainEntity as unknown[]).length).toBe(inhalt.faq.length - 1);
    expect(JSON.stringify(faq)).not.toMatch(/Vorbereitungsseminare|von der Gemeinde\]/);
    expect(faqSeite(inhalt.faq, 'en')?.inLanguage).toBe('en');
  });
});

describe('Einbindung', () => {
  it('Route in drei Sprachen (K-03, E-045)', () => {
    expect(pfadFuer('/hadsch-umra', 'de')).toBe('/hadsch-umra');
    expect(pfadFuer('/hadsch-umra', 'tr')).toBe('/tr/hac-umre');
    expect(pfadFuer('/hadsch-umra', 'en')).toBe('/en/hajj-umrah');
  });

  it('Menü: Gruppe „Islam“ direkt nach Ramadan; Sitemap, Metadaten und CMS-Ziele kennen die Seite', () => {
    const islam = baueMenues((k) => k, String).find((m) => m.schluessel === 'islam');
    const schluessel = islam?.punkte.map((p) => p.schluessel) ?? [];
    expect(schluessel.indexOf('hadsch-umra')).toBe(schluessel.indexOf('ramadan') + 1);
    expect(islam?.punkte.find((p) => p.schluessel === 'hadsch-umra')).toMatchObject({ label: 'hadschUmra', beschreibung: 'bHadschUmra' });
    expect(FESTE_ZIELE).toContain('/hadsch-umra');
    expect(SEO_SEITEN).toContainEqual({ pfad: '/hadsch-umra', schluessel: 'hadschUmra' });
    expect(ZIEL_VORSCHLAEGE).toContain('/hadsch-umra');
  });
});
