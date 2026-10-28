import { describe, expect, it } from 'vitest';
import { ausOrganisation, organisationInhalt } from '@/components/verwaltung/seiteninhalte-organisationen/OrganisationFormular';
import { NETZWERK_SCHLUESSEL, netzwerkZiel } from '@/lib/dachverband/netzwerk';
import { ENTITAET } from '@/lib/seo/entitaet';
import { DACHVERBAND_ZIELE, schema as organisationSchema } from '@/lib/validierung/seiteninhalte/organisation';
import { schema as ueberUnsSchema } from '@/lib/validierung/seiteninhalte/ueber-uns';
import { schema as vorstandSchema } from '@/lib/validierung/seiteninhalte/vorstand';
import { ORGANISATIONEN_BEISPIEL } from '../../drizzle/seeds/bereiche/organisationen';
import { ARTIKEL_2011, UEBER_UNS_BEISPIEL, UEBER_UNS_QUELLE, ZEITLEISTE_EROEFFNUNG } from '../../drizzle/seeds/bereiche/ueber-uns';
import { VORSTAND_BEISPIEL, VORSTAND_QUELLE } from '../../drizzle/seeds/bereiche/vorstand';
import organisationenTexte from '../../messages/bereiche/organisationen.json';
import ueberUnsTexte from '../../messages/bereiche/ueber-uns.json';
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import tr from '../../messages/tr.json';

/**
 * Fakten der Gemeinde (Plan Marktstart, Paket P2; E-044 Nr. 4): Gründungsjahr 1978 überall gleich (Über uns, Vorstand,
 * Entitätsdaten), Stationen 2008 und 2011 vor der Eröffnung als letzter Station, Restplatzhalter bleiben (G-05),
 * Organisationen mit Verweis zum Dachverband und ohne Anatolien-Deutung, Startseite und Fußzeile ohne unbelegte Aussagen.
 * Die Seeds liefern die Daten; Datenbankfälle (Speichern, Rückfall) stehen in tests/integration.
 */
const SPRACHEN = ['de', 'tr', 'en'] as const;
const PLATZHALTER = /\[[^\]]+\]/;
const VOLLER_NAME = {
  de: 'Islamischen Gemeinschaft Millî Görüş (IGMG)',
  tr: 'İslam Toplumu Millî Görüş (IGMG)',
  en: 'Islamic Community Millî Görüş (IGMG)',
} as const;

describe('Über uns: Gründungsjahr und Weg der Gemeinde', () => {
  const inhalt = ueberUnsSchema.parse(UEBER_UNS_BEISPIEL);
  const texte = JSON.stringify(inhalt);
  const sortiert = [...inhalt.zeitleiste].sort((a, b) => a.reihenfolge - b.reihenfolge);

  it('kein Platzhalter für das Gründungsjahr mehr; 1978 wie in den Entitätsdaten, in allen Sprachen', () => {
    expect(texte).not.toMatch(/Gründungsjahr|Kuruluş yılı|Founding year/);
    expect(ENTITAET.gruendung).toBe('1978');
    const erste = sortiert[0];
    expect(erste.kennzeichnung).toEqual({ de: '1978', tr: '1978', en: '1978' });
    for (const s of SPRACHEN) expect(erste.titel[s]).toMatch(/^1978 - .*Formerstraße/);
    for (const s of SPRACHEN) {
      expect(inhalt.geschichte.absaetze[0].absatz[s]).toContain('1978');
      expect(inhalt.gemeinschaft.absaetze[0].absatz[s]).toContain('1978');
    }
  });

  it('Stationen 2008 und 2011 mit Ort Wetzlar und Fotoplatzhalter in drei Sprachen, vor 2019', () => {
    const marken = sortiert.map((e) => e.kennzeichnung.de);
    expect(marken.indexOf('2008')).toBeGreaterThan(marken.indexOf('Wachstumsphase'));
    expect(marken.indexOf('2011')).toBe(marken.indexOf('2008') + 1);
    expect(marken.indexOf('2019')).toBe(marken.indexOf('2011') + 1);
    for (const jahr of ['2008', '2011']) {
      const station = sortiert.find((e) => e.kennzeichnung.de === jahr);
      expect(station?.ort).toEqual({ de: 'Wetzlar', tr: 'Wetzlar', en: 'Wetzlar' });
      expect(station?.bild).toBeUndefined();
      for (const s of SPRACHEN) {
        expect(station?.titel[s]).toMatch(new RegExp(`^${jahr} - `));
        expect(station?.bildbeschreibung[s]).toMatch(PLATZHALTER);
      }
    }
  });

  it('die Eröffnung bleibt letzte Station; ihr Jahr und Foto bleiben Platzhalter (B-07, MN-08)', () => {
    expect(sortiert.at(-1)?.titel.de).toBe(ZEITLEISTE_EROEFFNUNG.titel.de);
    expect(ZEITLEISTE_EROEFFNUNG.reihenfolge).toBe(Math.max(...inhalt.zeitleiste.map((e) => e.reihenfolge)));
    expect(new Set(inhalt.zeitleiste.map((e) => e.reihenfolge)).size).toBe(inhalt.zeitleiste.length);
    for (const s of SPRACHEN) expect(ZEITLEISTE_EROEFFNUNG.kennzeichnung[s]).toMatch(/^\[[^\]]+\]$/);
  });

  it('Absatz zu 2008 und 2011 in drei Sprachen, Quelle mit beiden IGMG-Berichten', () => {
    const absatz = inhalt.geschichte.absaetze.find((a) => a.absatz.de.includes('2008'));
    for (const s of SPRACHEN) {
      expect(absatz?.absatz[s]).toContain('2008');
      expect(absatz?.absatz[s]).toContain('2011');
      expect(absatz?.absatz[s]).toContain('Wetzlar');
    }
    expect(UEBER_UNS_QUELLE).toContain(ENTITAET.gruendungBeleg);
    expect(UEBER_UNS_QUELLE).toContain(ARTIKEL_2011);
    expect(ARTIKEL_2011).toMatch(/^https:\/\/www\.igmg\.org\/.*tag-der-offenen-moschee-2011-in-wetzlar\/$/);
  });

  it('Einordnung in den Dachverband: voller Name, Regionalverband Hessen und Link in jeder Sprache', () => {
    for (const s of SPRACHEN) {
      const satz = ueberUnsTexte[s].ueberUns.dachverband;
      expect(satz).toContain(VOLLER_NAME[s]);
      expect(satz).toContain('Hessen');
      expect(satz).toMatch(/<link>[^<]+<\/link>$/);
      expect(ueberUnsTexte[s].ueberUns.quelle).toMatch(/2008.*2011/);
    }
  });
});

describe('Vorstand: Führung seit dem Gründungsjahr', () => {
  const inhalt = vorstandSchema.parse(VORSTAND_BEISPIEL);

  it('fuehrungSeit und die erste Amtszeit beginnen 1978; 1975 kommt nicht mehr vor', () => {
    expect(inhalt.fuehrungSeit).toBe(ENTITAET.gruendung);
    expect(inhalt.vorsitzende[0]).toMatchObject({ von: '1978', bis: '1979' });
    expect(Math.min(...inhalt.vorsitzende.map((a) => Number(a.von)))).toBe(1978);
    expect(JSON.stringify(inhalt)).not.toContain('1975');
    expect(VORSTAND_QUELLE).toContain(ENTITAET.gruendungBeleg);
  });

  it('Namen bleiben Platzhalter (G-04)', () => {
    for (const p of [...inhalt.vorstand, ...inhalt.vorsitzende]) expect(p.name).toMatch(/^\[[^\]]+\]$/);
  });
});

describe('Organisationen: Verweis zum Dachverband und eigene Texte', () => {
  const seiten = Object.fromEntries(ORGANISATIONEN_BEISPIEL.map((s) => [s.slug, organisationSchema.parse(s.inhalt)]));

  it('jede Organisation verweist auf ihre Seite bei der IGMG (AT auf die Selbstdarstellung)', () => {
    expect(Object.fromEntries(Object.entries(seiten).map(([slug, i]) => [slug, i.dachverband]))).toEqual({
      'ana-teskilati': 'selbstdarstellung',
      'kadin-teskilati': 'frauenorganisation',
      'genclik-teskilati': 'jugendorganisation',
      'kadin-genclik-teskilati': 'frauenjugendorganisation',
    });
    expect(netzwerkZiel('frauenorganisation', 'de').href).toBe('https://www.igmg.org/frauenorganisation/');
    expect(netzwerkZiel('jugendorganisation', 'tr')).toEqual({
      href: 'https://www.igmg.org/jugendorganisation/',
      zielSprache: 'de',
      rueckfall: true,
    });
    for (const s of ORGANISATIONEN_BEISPIEL) expect(s.quelle).toContain('struktur-fachvereine-und-kooperationen');
  });

  it('die Auswahl besteht nur aus Schlüsseln des IGMG-Netzwerks', () => {
    for (const z of DACHVERBAND_ZIELE) expect(NETZWERK_SCHLUESSEL).toContain(z);
  });

  it('AT ohne Anatolien-Deutung (de, tr, en), Name beim ersten Nennen voll ausgeschrieben', () => {
    const at = seiten['ana-teskilati'];
    const alle = [at.beschreibung, at.mission, at.vision, ...at.aktivitaeten.flatMap((a) => [a.titel, a.text])];
    for (const feld of alle) for (const s of SPRACHEN) expect(feld[s] ?? '').not.toMatch(/Anatoli|Anadolu/i);
    for (const s of SPRACHEN) expect(at.beschreibung[s]).toContain(VOLLER_NAME[s]);
  });

  it('KT, GT und KGT: eigenständig seit 2009, mit vollem Namen der IGMG, in drei Sprachen', () => {
    for (const slug of ['kadin-teskilati', 'genclik-teskilati', 'kadin-genclik-teskilati']) {
      for (const s of SPRACHEN) {
        const text = seiten[slug].beschreibung[s] ?? '';
        expect(text).toContain('2009');
        expect(text).toContain(VOLLER_NAME[s]);
        expect(text.length).toBeLessThanOrEqual(1200);
      }
    }
  });

  it('ältere Inhalte ohne Feld und unbekannte Schlüssel ergeben „kein Verweis“, der übrige Inhalt bleibt', () => {
    const alt = { ...ORGANISATIONEN_BEISPIEL[1].inhalt, dachverband: undefined };
    expect(organisationSchema.parse(alt).dachverband).toBeNull();
    const umbenannt = organisationSchema.safeParse({ ...ORGANISATIONEN_BEISPIEL[1].inhalt, dachverband: 'gibtEsNicht' });
    expect(umbenannt.success).toBe(true);
    expect(umbenannt.data?.dachverband).toBeNull();
    expect(umbenannt.data?.beschreibung.de).toBe(seiten['kadin-teskilati'].beschreibung.de);
    expect(organisationSchema.parse({}).dachverband).toBeNull();
  });

  it('Formular: Inhalt → Formwerte → Inhalt verliert kein Feld (auch nicht den Verweis)', () => {
    for (const inhalt of Object.values(seiten)) {
      const zustand = ausOrganisation(inhalt);
      const aktivitaeten = inhalt.aktivitaeten.map((a) => ({
        symbol: a.symbol,
        titel: { de: a.titel.de, tr: a.titel.tr ?? '', en: a.titel.en ?? '' },
        text: { de: a.text.de, tr: a.text.tr ?? '', en: a.text.en ?? '' },
      }));
      const zeilen = inhalt.oeffnungszeiten.map((z) => ({ de: z.de, tr: z.tr ?? '', en: z.en ?? '' }));
      const zurueck = organisationSchema.parse(organisationInhalt(zustand, aktivitaeten, zeilen));
      expect(zurueck).toEqual(inhalt);
      expect(Object.keys(organisationInhalt(zustand, aktivitaeten, zeilen)).sort()).toEqual(Object.keys(inhalt).sort());
    }
    const ohne = ausOrganisation(organisationSchema.parse({}));
    expect(ohne.dachverband).toBe('');
    expect(organisationInhalt(ohne, [], []).dachverband).toBeNull();
  });

  it('Texte der Zeile „Teil der IGMG“ in drei Sprachen', () => {
    for (const s of SPRACHEN) {
      const t = organisationenTexte[s].organisation.dachverband;
      expect(t.titel).toContain('IGMG');
      expect(t.mehr).toContain('IGMG');
    }
  });
});

describe('Startseite und Fußzeile: nur Belegtes (G-05)', () => {
  const haupt = { de, tr, en };

  it('Einleitung der Startseite nennt Moschee, Gemeinde und 1978; ähnliche Länge wie bisher (LCP-Element)', () => {
    for (const s of SPRACHEN) {
      const text = haupt[s].start.untertitel;
      expect(text).toContain(haupt[s].meta.moscheeName);
      expect(text).toContain('IGMG');
      expect(text).toContain(ENTITAET.gruendung);
      expect(text).not.toMatch(/Herzen|kalbinde|heart of/i);
      expect(text.length).toBeGreaterThanOrEqual(100);
      expect(text.length).toBeLessThanOrEqual(160);
    }
  });

  it('Fußzeile: offen für alle Menschen, nicht nur für Muslime', () => {
    expect(de.fuss.beschreibung).toContain('allen Menschen offen');
    for (const s of SPRACHEN) expect(haupt[s].fuss.beschreibung).not.toMatch(/Muslimen|Müslümanlara|all Muslims/);
  });
});
