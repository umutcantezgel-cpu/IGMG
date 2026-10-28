import { describe, expect, it } from 'vitest';
import {
  ART_DER_ORGANISATION,
  datumAnzeige,
  freitagAb,
  fuerOrganisation,
  gemeinschaftsthemen,
  giltNoch,
  linkFuer,
  neuesteHutba,
  sichtbareEintraege,
} from '@/lib/dachverband/auswahl';
import { SEITENINHALT } from '@/lib/validierung/seiteninhalte';
import {
  DACHVERBAND_ARTEN,
  DACHVERBAND_MAX,
  dachverbandEintrag,
  ohneZitat,
  schema,
  type DachverbandEintrag,
} from '@/lib/validierung/seiteninhalte/dachverband';
import { DACHVERBAND_BEISPIEL, DACHVERBAND_QUELLE } from '../../drizzle/seeds/bereiche/dachverband';

/**
 * „Aus dem Dachverband“ (Plan Marktstart P3, E-044 Nr. 2): Schema (keine Pressemitteilungen, nur Links zur IGMG, Hutba
 * ohne Kurztext, keine Zitate und Versangaben), Auswahl für die Seiten und der Seed.
 */
const IGMG = 'https://www.igmg.org';
const eintrag = (teil: Partial<DachverbandEintrag> & Pick<DachverbandEintrag, 'schluessel'>): DachverbandEintrag => ({
  art: 'kampagne',
  datum: '2026-10-01',
  titel: { de: `Titel ${teil.schluessel}` },
  url: `${IGMG}/${teil.schluessel}/`,
  sichtbar: true,
  herkunft: 'redaktion',
  ...teil,
});
const gueltig = (roh: unknown) => dachverbandEintrag.safeParse(roh).success;

describe('Schema', () => {
  it('ist in der Registry; Standard: leere Liste, die beim erneuten Lesen gültig bleibt', () => {
    expect(SEITENINHALT.dachverband).toBe(schema);
    expect(schema.parse({})).toEqual({ eintraege: [] });
    expect(schema.safeParse(schema.parse({})).success).toBe(true);
  });

  it('Arten ohne „pressemitteilung“ (E-044 Nr. 2); eine Pressemitteilung wird abgewiesen', () => {
    expect(DACHVERBAND_ARTEN).toEqual(['hutba', 'kampagne', 'bildung', 'jugend', 'frauen', 'frauenjugend']);
    expect(gueltig(eintrag({ schluessel: 'pm-1', art: 'pressemitteilung' as never }))).toBe(false);
  });

  it('Adressen: nur https und Hosts aus dem IGMG-Netzwerk (auch für tr/en)', () => {
    expect(gueltig(eintrag({ schluessel: 'ok-1' }))).toBe(true);
    expect(gueltig(eintrag({ schluessel: 'ok-2', url: 'https://www.hasene.org/de/' }))).toBe(true);
    expect(gueltig(eintrag({ schluessel: 'http-1', url: 'http://www.igmg.org/x/' }))).toBe(false);
    expect(gueltig(eintrag({ schluessel: 'fremd-1', url: 'https://example.org/x/' }))).toBe(false);
    expect(gueltig(eintrag({ schluessel: 'fremd-2', url: 'https://igmg.org.example.org/' }))).toBe(false);
    expect(gueltig(eintrag({ schluessel: 'js-1', url: 'javascript:alert(1)' }))).toBe(false);
    expect(gueltig(eintrag({ schluessel: 'tr-1', urlTr: 'https://example.org/tr/' }))).toBe(false);
  });

  it('Datum: Kalendertag oder Monat; Kennung nach Muster; Standardwerte für sichtbar und Herkunft', () => {
    expect(gueltig(eintrag({ schluessel: 'monat', datum: '2026-01' }))).toBe(true);
    for (const datum of ['2026-13', '2026-02-30', '26-10-01', '2026/10/01', ''])
      expect(gueltig(eintrag({ schluessel: 'datum', datum })), datum).toBe(false);
    for (const schluessel of ['ab', 'Gross', 'mit leer', 'ü-umlaut', 'x'.repeat(81)])
      expect(gueltig(eintrag({ schluessel })), schluessel).toBe(false);
    const ohne = dachverbandEintrag.parse({
      schluessel: 'neu',
      art: 'bildung',
      datum: '2026-04',
      titel: { de: 'T' },
      url: `${IGMG}/qalam/`,
    });
    expect(ohne).toMatchObject({ sichtbar: true, herkunft: 'redaktion' });
    expect(gueltig(eintrag({ schluessel: 'bis', gueltigBis: '2026-11-31' }))).toBe(false);
  });

  it('Freitagspredigt ohne Kurztext (G-06): Fehler am Feld der Sprache; leerer Kurztext ist erlaubt', () => {
    const p = dachverbandEintrag.safeParse(eintrag({ schluessel: 'hutba-1', art: 'hutba', kurztext: { de: '', tr: 'Özet' } }));
    expect(p.success).toBe(false);
    expect(p.error?.issues.map((i) => [i.path.join('.'), i.message])).toEqual([['kurztext.tr', 'hutbaOhneKurztext']]);
    expect(gueltig(eintrag({ schluessel: 'hutba-2', art: 'hutba', kurztext: { de: '' } }))).toBe(true);
    expect(gueltig(eintrag({ schluessel: 'kampagne-1', kurztext: { de: 'Eigener Text.' } }))).toBe(true);
  });

  it('keine Versangaben und keine Anführungszeichen in Titel und Kurztext', () => {
    expect(ohneZitat('Rechte und Pflichten in sozialen Medien')).toBe(true);
    expect(ohneZitat('Kaaba: Orientierung für Körper und Geist')).toBe(true);
    expect(ohneZitat('Women’s Organisation')).toBe(true);
    for (const text of ['Sure 49:6', 'vgl. 2 : 255', '„Zitat“', '"Zitat"', '«Zitat»', 'Er sagte: “Hallo”'])
      expect(ohneZitat(text), text).toBe(false);
    const p = dachverbandEintrag.safeParse(
      eintrag({ schluessel: 'zitat', titel: { de: 'Titel', en: 'See 49:12' }, kurztext: { de: '„x“' } }),
    );
    expect(p.error?.issues.map((i) => i.path.join('.')).sort()).toEqual(['kurztext.de', 'titel.en']);
  });

  it(`Liste: höchstens ${DACHVERBAND_MAX} Einträge, jede Kennung nur einmal`, () => {
    const viele = Array.from({ length: DACHVERBAND_MAX + 1 }, (_, i) => eintrag({ schluessel: `e-${i}` }));
    expect(schema.safeParse({ eintraege: viele }).success).toBe(false);
    expect(schema.safeParse({ eintraege: viele.slice(0, DACHVERBAND_MAX) }).success).toBe(true);
    const doppelt = schema.safeParse({ eintraege: [eintrag({ schluessel: 'gleich' }), eintrag({ schluessel: 'gleich' })] });
    expect(doppelt.error?.issues.map((i) => [i.path.join('.'), i.message])).toEqual([['eintraege.1.schluessel', 'doppelt']]);
  });
});

describe('Auswahl', () => {
  const liste: DachverbandEintrag[] = [
    eintrag({ schluessel: 'hutba-alt', art: 'hutba', datum: '2026-10-09' }),
    eintrag({ schluessel: 'thema-monat', datum: '2026-10' }),
    eintrag({ schluessel: 'hutba-neu', art: 'hutba', datum: '2026-10-23' }),
    eintrag({ schluessel: 'hutba-aus', art: 'hutba', datum: '2026-10-30', sichtbar: false }),
    eintrag({ schluessel: 'frauen-1', art: 'frauen', datum: '2026-03-26' }),
    eintrag({ schluessel: 'abgelaufen', datum: '2026-10-20', gueltigBis: '2026-10-27' }),
    eintrag({ schluessel: 'heute-letzter', datum: '2026-10-03', gueltigBis: '2026-10-28' }),
    eintrag({ schluessel: 'jugend-1', art: 'jugend', datum: '2026-04-13' }),
  ];
  const HEUTE = '2026-10-28';

  it('sichtbare Einträge: Schalter an, nicht abgelaufen (Ablauftag zählt mit), neueste zuerst, Monat wie Monatsanfang', () => {
    expect(giltNoch({ gueltigBis: HEUTE }, HEUTE)).toBe(true);
    expect(giltNoch({ gueltigBis: '2026-10-27' }, HEUTE)).toBe(false);
    expect(giltNoch({}, HEUTE)).toBe(true);
    expect(sichtbareEintraege(liste, HEUTE).map((e) => e.schluessel)).toEqual([
      'hutba-neu',
      'hutba-alt',
      'heute-letzter',
      'thema-monat',
      'jugend-1',
      'frauen-1',
    ]);
  });

  it('neueste Hutba: ausgeblendete zählen nicht; ohne Hutba null', () => {
    expect(neuesteHutba(liste, HEUTE)?.schluessel).toBe('hutba-neu');
    expect(
      neuesteHutba(
        liste.filter((e) => e.art !== 'hutba'),
        HEUTE,
      ),
    ).toBeNull();
  });

  it('Gemeinschaftsthemen: alles außer Hutba, höchstens die gewünschte Anzahl', () => {
    expect(gemeinschaftsthemen(liste, HEUTE, 3).map((e) => e.schluessel)).toEqual(['heute-letzter', 'thema-monat', 'jugend-1']);
  });

  it('Organisationen: KT Frauen, GT Jugend, KGT junge Frauen, AT nichts', () => {
    expect(ART_DER_ORGANISATION).toEqual({ at: null, kt: 'frauen', gt: 'jugend', kgt: 'frauenjugend' });
    expect(fuerOrganisation(liste, 'kt', HEUTE).map((e) => e.schluessel)).toEqual(['frauen-1']);
    expect(fuerOrganisation(liste, 'gt', HEUTE).map((e) => e.schluessel)).toEqual(['jugend-1']);
    expect(fuerOrganisation(liste, 'kgt', HEUTE)).toEqual([]);
    expect(fuerOrganisation(liste, 'at', HEUTE)).toEqual([]);
  });

  it('Link je Sprache: eigene Fassung, sonst Deutsch mit Rückfall; Netzwerk-Ziele mit ihren Sprachen', () => {
    const e = eintrag({ schluessel: 'x', url: `${IGMG}/x/`, urlEn: `${IGMG}/en/x/` });
    expect(linkFuer(e, 'de')).toEqual({ href: `${IGMG}/x/`, zielSprache: 'de', rueckfall: false });
    expect(linkFuer(e, 'en')).toEqual({ href: `${IGMG}/en/x/`, zielSprache: 'en', rueckfall: false });
    expect(linkFuer(e, 'tr')).toEqual({ href: `${IGMG}/x/`, zielSprache: 'de', rueckfall: true });
    // Begleiter: eine Seite mit Heften in drei Sprachen – kein Sprachhinweis
    const begleiter = eintrag({ schluessel: 'ry', url: `${IGMG}/ramazan-yoldasim/` });
    expect(linkFuer(begleiter, 'tr')).toMatchObject({ zielSprache: 'tr', rueckfall: false });
    // Kinderclub: nur Türkisch, auch von der deutschen Seite
    expect(linkFuer(eintrag({ schluessel: 'kc', url: 'https://www.igmgcocuk.org' }), 'de')).toMatchObject({
      zielSprache: 'tr',
      rueckfall: true,
    });
  });

  it('Freitag am oder nach einem Tag; Datum für die Anzeige', () => {
    expect(freitagAb('2026-10-22')).toBe('2026-10-23');
    expect(freitagAb('2026-10-23')).toBe('2026-10-23');
    expect(freitagAb('2026-10-24')).toBe('2026-10-30');
    expect(freitagAb('2026-12-28')).toBe('2027-01-01');
    expect(datumAnzeige('2026-10-23', 'de')).toBe('23. Oktober 2026');
    expect(datumAnzeige('2026-10-23', 'tr')).toBe('23 Ekim 2026');
    expect(datumAnzeige('2026-10-23', 'en')).toBe('23 October 2026');
    expect(datumAnzeige('2026-01', 'de')).toBe('Januar 2026');
  });
});

describe('Seed', () => {
  const inhalt = schema.parse(DACHVERBAND_BEISPIEL);

  it('ist gültig und nennt die Quellen (Feed, Crawl, Seiten der Gemeinschaftsthemen)', () => {
    expect(inhalt.eintraege.length).toBeGreaterThanOrEqual(15);
    expect(DACHVERBAND_QUELLE).toContain('/category/irschad/freitagspredigt/feed/');
    for (const e of inhalt.eintraege)
      expect(DACHVERBAND_QUELLE, e.schluessel).toContain(e.art === 'hutba' ? 'freitagspredigt' : new URL(e.url).pathname);
  });

  it('Freitagspredigten: Freitag als Datum, ohne Kurztext, Herkunft Feed, Kennung = Adressteil; neueste vom 23.10.2026', () => {
    const hutbas = inhalt.eintraege.filter((e) => e.art === 'hutba');
    expect(hutbas.length).toBeGreaterThanOrEqual(10);
    for (const h of hutbas) {
      expect(new Date(`${h.datum}T12:00:00Z`).getUTCDay(), h.schluessel).toBe(5);
      expect(h.kurztext).toBeUndefined();
      expect(h.herkunft).toBe('feed');
      expect(h.url).toBe(`${IGMG}/${h.schluessel}/`);
    }
    expect(neuesteHutba(inhalt.eintraege, '2026-10-28')).toMatchObject({
      titel: { de: 'Mit Würde gegen Islamfeindlichkeit' },
      url: `${IGMG}/vorurteile-und-gesellschaftlicher-frieden-2/`,
      datum: '2026-10-23',
    });
    expect(hutbas.find((h) => h.schluessel === 'rechte-und-pflichten-in-sozialen-medien')).toMatchObject({
      datum: '2026-10-09',
      urlTr: `${IGMG}/tr/sosyal-medyada-kul-hakki/`,
      urlEn: `${IGMG}/en/the-rights-of-others-on-social-media/`,
    });
  });

  it('Gemeinschaftsthemen mit eigenem Kurztext in drei Sprachen; KT zeigt Bayram unter Nachbarn, AT nichts', () => {
    const themen = inhalt.eintraege.filter((e) => e.art !== 'hutba');
    expect(themen.map((e) => e.schluessel)).toEqual(
      expect.arrayContaining([
        'tag-der-offenen-moschee-2026',
        'emissionsfreie-woche-2026',
        'ramadan-begleiter-2026',
        'bayram-unter-nachbarn-2026',
      ]),
    );
    for (const t of themen) {
      expect(t.kurztext?.de, t.schluessel).toBeTruthy();
      expect(t.kurztext?.tr, t.schluessel).toBeTruthy();
      expect(t.kurztext?.en, t.schluessel).toBeTruthy();
      expect(t.titel.tr && t.titel.en, t.schluessel).toBeTruthy();
    }
    expect(fuerOrganisation(inhalt.eintraege, 'kt', '2026-10-28').map((e) => e.titel.de)).toEqual(['Bayram unter Nachbarn']);
    expect(fuerOrganisation(inhalt.eintraege, 'at', '2026-10-28')).toEqual([]);
    expect(gemeinschaftsthemen(inhalt.eintraege, '2026-10-28', 3).map((e) => e.schluessel)).toEqual([
      'tag-der-offenen-moschee-2026',
      'emissionsfreie-woche-2026',
      'klima-ratgeber-2026',
    ]);
  });

  it('nichts Politisches: keine Pressemitteilung zu Wahlen oder Politik, keine SES Academy', () => {
    const alles = JSON.stringify(inhalt).toLowerCase();
    for (const wort of ['wahl', 'pressemitteilung', 'ses academy', 'csd', 'hessen muss']) expect(alles, wort).not.toContain(wort);
  });
});
