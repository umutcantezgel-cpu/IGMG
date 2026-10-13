import { describe, expect, it } from 'vitest';
import {
  fuehrtZuSchleife,
  istReservierterSlug,
  normalisierePfad,
  seitenAdressen,
  slugAusTitel,
  slugFehler,
  slugKollisionen,
  weiterleitungNachFehler,
  weiterleitungVonFehler,
} from '@/lib/cms/slugs';
import { istGueltigesZiel, routingZielFuer, seitenIdAusZiel } from '@/lib/cms/ziele';
import { pruefeMenue } from '@/lib/validierung/menue';
import { pruefeSeite } from '@/lib/validierung/seite';
import { weiterleitungSchema } from '@/lib/validierung/weiterleitung';

/**
 * Adressen des CMS (ADR 0032): reservierte Slugs (alle Routen in allen Sprachen, Verwaltung, API), Slug-Bildung,
 * Kollisionen je Sprache, interne Linkziele und Weiterleitungen (Format, reservierte Quellen, Schleifen).
 */
const UUID = '0b7e1c3a-5d2f-4c8e-9a61-2f3b4c5d6e7f';

describe('Slugs freier Seiten', () => {
  it('alle Routen der Website in allen Sprachen sowie Verwaltung und API sind reserviert', () => {
    for (const s of [
      'gebetszeiten',
      'namaz-vakitleri',
      'prayer-times',
      'kuran',
      'hakkimizda',
      'about-us',
      'verwaltung',
      'api',
      'medien',
      'tr',
      'en',
      'hesabim',
      'giris',
    ])
      expect(istReservierterSlug(s), s).toBe(true);
    expect(istReservierterSlug('unsere-moschee')).toBe(false);
    expect(slugFehler('kontakt')).toBe('reserviert');
  });

  it('Format: Kleinbuchstaben, Ziffern, einfache Bindestriche, höchstens 80 Zeichen', () => {
    expect(slugFehler('unsere-moschee')).toBeNull();
    expect(slugFehler('Unsere')).toBe('slug');
    expect(slugFehler('a--b')).toBe('slug');
    expect(slugFehler('-a')).toBe('slug');
    expect(slugFehler('a'.repeat(81))).toBe('zuLang');
  });

  it('Slug aus dem Titel; reservierte Wörter bekommen einen Zusatz', () => {
    expect(slugAusTitel('Über uns – Geschichte')).toBe('ueber-uns-geschichte');
    expect(slugAusTitel('Gençlik Teşkilatı')).toBe('genclik-teskilati');
    expect(slugAusTitel('Kontakt')).toBe('kontakt-seite');
    expect(slugAusTitel('!!!')).toBe('seite');
  });

  it('Adressen je Sprache: eigener Slug oder Rückfall auf den deutschen', () => {
    expect(seitenAdressen({ de: 'unsere-moschee', tr: 'camimiz', en: null })).toEqual({
      de: '/unsere-moschee',
      tr: '/tr/camimiz',
      en: '/en/unsere-moschee',
    });
  });

  it('Kollisionen je Sprache über die wirksamen Slugs', () => {
    const andere = [{ de: 'a', tr: 'camimiz', en: null }];
    expect(slugKollisionen({ de: 'b', tr: null, en: null }, andere)).toEqual([]);
    expect(slugKollisionen({ de: 'camimiz', tr: 'x', en: null }, andere)).toEqual([]);
    expect(slugKollisionen({ de: 'camimiz', tr: null, en: null }, andere)).toEqual(['tr']);
    expect(slugKollisionen({ de: 'a', tr: 'y', en: 'z' }, andere)).toEqual(['de']);
  });
});

describe('Interne Linkziele (Menüs, Knöpfe)', () => {
  it('Pfade der Website in deutscher Schreibweise, auch mit Parametern', () => {
    expect(routingZielFuer('/gebetszeiten')).toBe('/gebetszeiten');
    expect(routingZielFuer('/organisationen/ana-teskilati')).toEqual({
      pathname: '/organisationen/[organisation]',
      params: { organisation: 'ana-teskilati' },
    });
    expect(routingZielFuer('/namaz-vakitleri', 'tr')).toBe('/gebetszeiten');
    expect(routingZielFuer('/gibt-es-nicht')).toBeNull();
  });

  it('freie Seiten als seite:<uuid>; keine externen Adressen', () => {
    expect(seitenIdAusZiel(`seite:${UUID}`)).toBe(UUID);
    expect(istGueltigesZiel(`seite:${UUID}`)).toBe(true);
    expect(istGueltigesZiel('https://example.org')).toBe(false);
    expect(istGueltigesZiel('javascript:alert(1)')).toBe(false);
    expect(istGueltigesZiel('/')).toBe(true);
  });
});

describe('Weiterleitungen', () => {
  it('Pfade werden vereinheitlicht', () => {
    expect(normalisierePfad(' alte-seite/ ')).toBe('/alte-seite');
    expect(weiterleitungSchema.parse({ von: '/alt/', nach: 'unsere-moschee', code: '301' })).toMatchObject({
      von: '/alt',
      nach: '/unsere-moschee',
      code: 301,
    });
  });

  it('Quelle: keine Startseite, keine bestehende Route, kein Dateiname', () => {
    expect(weiterleitungVonFehler('/alte-seite')).toBeNull();
    expect(weiterleitungVonFehler('/tr/eski-sayfa')).toBeNull();
    expect(weiterleitungVonFehler('/gebetszeiten')).toBe('reserviert');
    expect(weiterleitungVonFehler('/tr/namaz-vakitleri/2025')).toBe('reserviert');
    expect(weiterleitungVonFehler('/verwaltung/x')).toBe('reserviert');
    expect(weiterleitungVonFehler('/')).toBe('pfad');
    expect(weiterleitungVonFehler('/alt.html')).toBe('pfad');
    expect(weiterleitungVonFehler('/a?b=1')).toBe('pfad');
    expect(weiterleitungNachFehler('https://example.org')).toBe('pfad');
  });

  it('Schleifen werden erkannt, auch über Ketten und beim Ersetzen einer Regel', () => {
    expect(fuehrtZuSchleife([], { von: '/a', nach: '/a' })).toBe(true);
    expect(fuehrtZuSchleife([{ von: '/b', nach: '/a' }], { von: '/a', nach: '/b' })).toBe(true);
    expect(
      fuehrtZuSchleife(
        [
          { von: '/b', nach: '/c' },
          { von: '/c', nach: '/a' },
        ],
        { von: '/a', nach: '/b' },
      ),
    ).toBe(true);
    expect(fuehrtZuSchleife([{ von: '/b', nach: '/c' }], { von: '/a', nach: '/b' })).toBe(false);
    // Die neue Regel ersetzt die alte mit derselben Quelle: /a → /d statt /a → /b
    expect(
      fuehrtZuSchleife(
        [
          { von: '/a', nach: '/b' },
          { von: '/b', nach: '/a' },
        ],
        { von: '/a', nach: '/d' },
      ),
    ).toBe(false);
    const kette = Array.from({ length: 25 }, (_, i) => ({ von: `/k${i}`, nach: `/k${i + 1}` }));
    expect(fuehrtZuSchleife(kette, { von: '/start', nach: '/k0' })).toBe(true);
  });

  it('Schema meldet gleiche Quelle und Ziel als Schleife', () => {
    const p = weiterleitungSchema.safeParse({ von: '/x', nach: '/x/', code: '308' });
    expect(p.success).toBe(false);
    expect(p.error!.issues.map((i) => i.message)).toContain('schleife');
  });
});

describe('Formulare: Seite und Menü', () => {
  const bloecke = JSON.stringify([{ typ: 'trenner', id: 'trenner001' }]);

  it('Seite: reservierte Slugs werden beim Speichern abgewiesen', () => {
    const p = pruefeSeite({ titelDe: 'Kontakt', slugDe: 'kontakt', bloecke });
    expect(p.ok).toBe(false);
    if (!p.ok) expect(p.feldFehler.slugDe).toBe('reserviert');
    const tr = pruefeSeite({ titelDe: 'Seite', slugTr: 'namaz-vakitleri', bloecke });
    expect(!tr.ok && tr.feldFehler.slugTr).toBe('reserviert');
  });

  it('Seite: Fehler in Feldern und Bausteinen gemeinsam, kaputtes JSON als Fehler', () => {
    const p = pruefeSeite({
      titelDe: '',
      bloecke: JSON.stringify([{ typ: 'bild', id: 'bild000001', mediumId: '', alt: { de: '' }, unterschrift: { de: '' } }]),
    });
    expect(p.ok).toBe(false);
    if (!p.ok) {
      expect(p.feldFehler.titelDe).toBe('pflicht');
      expect(p.feldFehler['block:bild000001:mediumId']).toBe('bildFehlt');
      expect(p.feldFehler['block:bild000001:alt.de']).toBe('pflicht');
    }
    const kaputt = pruefeSeite({ titelDe: 'A', bloecke: '{nicht json' });
    expect(!kaputt.ok && kaputt.feldFehler.bloecke).toBe('ungueltig');
  });

  it('Seite: Zeitpunkt „veröffentlichen am“ muss ein echtes Datum sein', () => {
    expect(pruefeSeite({ titelDe: 'A', bloecke, veroeffentlichenAm: '2026-02-30T10:00' }).ok).toBe(false);
    expect(pruefeSeite({ titelDe: 'A', bloecke, veroeffentlichenAm: '2026-11-01T10:00', status: 'veroeffentlicht' }).ok).toBe(true);
  });

  it('Menü: Kopf mit Gruppen, Fuß als Liste, nur gültige Ziele', () => {
    const punkt = { titel: { de: 'Gebetszeiten' }, beschreibung: { de: '' }, ziel: '/gebetszeiten' };
    expect(pruefeMenue('kopf', JSON.stringify([{ titel: { de: 'Islam' }, kinder: [punkt] }])).ok).toBe(true);
    expect(pruefeMenue('fuss', JSON.stringify([punkt])).ok).toBe(true);
    const leer = pruefeMenue('kopf', JSON.stringify([{ titel: { de: 'Leer' }, kinder: [] }]));
    expect(!leer.ok && leer.feldFehler['0.kinder']).toBe('gruppeLeer');
    const extern = pruefeMenue('fuss', JSON.stringify([{ ...punkt, ziel: 'https://example.org' }]));
    expect(!extern.ok && extern.feldFehler['0.ziel']).toBe('zielUngueltig');
    expect(pruefeMenue('seitenleiste', '[]').ok).toBe(false);
  });
});
