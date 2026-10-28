import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JsonLd, jsonLdText } from '@/components/website/JsonLd';
import {
  brotkrumen,
  FAQ_MAX,
  faqSeite,
  gemeindeGraph,
  gepflegt,
  isoBerlin,
  knotenId,
  nachricht,
  veranstaltung,
  type JsonLdGraph,
  type JsonLdKnoten,
  type JsonLdObjekt,
  type KontaktAngaben,
} from '@/lib/seo/jsonld';

/** Testdaten sind fiktiv (example.test, Testperson Eins). */
const website = 'https://example.test/';

describe('gepflegt', () => {
  it('leere Werte und Platzhalter in eckigen Klammern ergeben nichts', () => {
    for (const wert of [undefined, null, '', '   ', '[Adresse]', 'Musterweg 1, [PLZ] Wetzlar']) {
      expect(gepflegt(wert)).toBeUndefined();
    }
  });

  it('gepflegter Text wird getrimmt übernommen', () => {
    expect(gepflegt('  Testweg 1  ')).toBe('Testweg 1');
  });
});

describe('isoBerlin', () => {
  it('Sommerzeit: +02:00', () => {
    expect(isoBerlin('2026-07-01T10:00:00.000Z')).toBe('2026-07-01T12:00:00+02:00');
  });

  it('Winterzeit: +01:00', () => {
    expect(isoBerlin('2026-01-15T17:30:00.000Z')).toBe('2026-01-15T18:30:00+01:00');
  });

  it('Umstellung auf Sommerzeit am 29.03.2026 um 01:00 UTC', () => {
    expect(isoBerlin('2026-03-29T00:59:59.000Z')).toBe('2026-03-29T01:59:59+01:00');
    expect(isoBerlin('2026-03-29T01:00:00.000Z')).toBe('2026-03-29T03:00:00+02:00');
  });
});

/** Kontaktdaten wie der Seed (Beispielinhalt): Platzhalter, Beispiel-E-Mail des Schemas, Beispiel-Öffnungszeiten (M-019). */
const beispielKontakt: KontaktAngaben = {
  adresse: '[Adresse]',
  telefon: '[Telefonnummer]',
  email: 'info@igmg-wetzlar.de',
  oeffnungszeiten: [{ von: [1, 2, 3, 4, 5], start: '09:00', ende: '22:00', zeiten: '09:00–22:00 Uhr' }],
  social: {},
  istBeispiel: true,
};

/** Knoten eines Graphen nach Typ. */
function knoten(graph: JsonLdGraph, typ: string): JsonLdKnoten {
  const k = graph['@graph'].find((n) => n['@type'] === typ);
  if (!k) throw new Error(`Knoten ${typ} fehlt`);
  return k;
}

/** Alle Verweise `{ '@id': … }` (Objekte nur mit `@id`) in einem Wert, rekursiv. */
function verweise(wert: unknown): string[] {
  if (Array.isArray(wert)) return wert.flatMap(verweise);
  if (!wert || typeof wert !== 'object') return [];
  const o = wert as Record<string, unknown>;
  if (Object.keys(o).length === 1 && typeof o['@id'] === 'string') return [o['@id']];
  return Object.values(o).flatMap(verweise);
}

describe('gemeindeGraph', () => {
  const graph = gemeindeGraph({ basis: 'https://example.test', kontakt: beispielKontakt, sprache: 'de' });
  const organisation = knoten(graph, 'Organization');
  const moschee = knoten(graph, 'Mosque');
  const website = knoten(graph, 'WebSite');

  it('drei Knoten unter einem Kontext; jeder Verweis zeigt auf einen Knoten des Graphen', () => {
    expect(graph['@context']).toBe('https://schema.org');
    expect(graph['@graph'].map((k) => k['@type'])).toEqual(['Organization', 'Mosque', 'WebSite']);
    expect([organisation['@id'], moschee['@id'], website['@id']]).toEqual([
      'https://example.test/#organisation',
      'https://example.test/#moschee',
      'https://example.test/#website',
    ]);
    expect(organisation.location).toEqual({ '@id': moschee['@id'] });
    expect(website.publisher).toEqual({ '@id': organisation['@id'] });
    const ids = new Set(graph['@graph'].map((k) => k['@id']));
    expect(verweise(graph['@graph']).filter((id) => !ids.has(id))).toEqual([]);
    // Ein Schrägstrich am Ende der Basis ändert die Kennungen nicht
    expect(knotenId('https://example.test/', 'moschee')).toBe(moschee['@id']);
  });

  it('Organisation „IGMG Wetzlar“: Gründung, Dachverband laut Impressum, Regionalverband nur mit Namen, Ort', () => {
    expect(organisation).toMatchObject({
      name: 'IGMG Wetzlar',
      url: 'https://example.test/',
      foundingDate: '1978',
      areaServed: { '@type': 'City', name: 'Wetzlar' },
      memberOf: { '@type': 'Organization', name: 'IGMG Regionalverband Hessen' },
      parentOrganization: {
        '@type': 'Organization',
        name: 'Islamische Gemeinschaft Millî Görüş e.V.',
        alternateName: 'IGMG',
        url: 'https://www.igmg.org/',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Colonia-Allee 3',
          postalCode: '51067',
          addressLocality: 'Köln',
          addressCountry: 'DE',
        },
      },
    });
    expect(organisation.alternateName).toContain('Fatih-Moschee Wetzlar');
  });

  it('Platzhalter und die Beispiel-E-Mail des Schemas entfallen; ohne Profile kein sameAs', () => {
    expect(organisation).not.toHaveProperty('telephone');
    expect(organisation).not.toHaveProperty('email');
    expect(organisation).not.toHaveProperty('sameAs');
  });

  it('Moschee „Fatih-Moschee Wetzlar“: Ort, Bundesland und Land ohne die Platzhalter-Straße; Beispiel-Öffnungszeiten entfallen', () => {
    expect(moschee.name).toBe('Fatih-Moschee Wetzlar');
    expect(moschee.alternateName).toEqual(['Wetzlar Fatih Camii', 'Fatih Mosque Wetzlar']);
    expect(moschee.address).toEqual({
      '@type': 'PostalAddress',
      addressLocality: 'Wetzlar',
      addressRegion: 'Hessen',
      addressCountry: 'DE',
    });
    expect(moschee).not.toHaveProperty('openingHoursSpecification');
    expect(moschee).not.toHaveProperty('geo');
  });

  it('der Name der Moschee folgt der Seitensprache', () => {
    expect(knoten(gemeindeGraph({ basis: 'https://example.test', kontakt: {}, sprache: 'tr' }), 'Mosque').name).toBe('Wetzlar Fatih Camii');
    expect(knoten(gemeindeGraph({ basis: 'https://example.test', kontakt: {}, sprache: 'en' }), 'Mosque').name).toBe(
      'Fatih Mosque Wetzlar',
    );
  });

  it('Website in drei Sprachen mit Beschreibung ohne Platzhalter', () => {
    expect(website).toMatchObject({ name: 'IGMG Wetzlar', url: 'https://example.test/', inLanguage: ['de', 'tr', 'en'] });
    expect(String(website.description)).toContain('Wetzlar');
    expect(String(website.description)).not.toMatch(/[[\]]/);
  });

  it('übernimmt gepflegte Angaben: Straße und PLZ, Telefon, E-Mail, Koordinaten, Öffnungszeiten und nur https-Profile', () => {
    const gepflegterGraph = gemeindeGraph({
      basis: 'https://example.test',
      sprache: 'de',
      kontakt: {
        adresse: 'Testweg 1, 35578 Wetzlar',
        telefon: '+49 000 0000',
        email: 'testperson@example.test',
        social: {
          facebook: 'https://facebook.example.test/testseite',
          instagram: 'http://instagram.example.test/testseite',
          youtube: 'https://youtube.example.test/testkanal',
        },
        koordinaten: { breite: 50.5, laenge: 8.5 },
        oeffnungszeiten: [
          { von: [6, 0], start: '08:00', ende: '22:00', zeiten: '08:00–22:00 Uhr' },
          { von: [1], start: '', ende: '', zeiten: 'nach Absprache' },
          { von: [2], start: '09:00', ende: '17:00', zeiten: '[Zeiten]' },
        ],
        istBeispiel: false,
      },
    });
    const o = knoten(gepflegterGraph, 'Organization');
    const m = knoten(gepflegterGraph, 'Mosque');
    expect(o.telephone).toBe('+49 000 0000');
    expect(o.email).toBe('testperson@example.test');
    expect(o.sameAs).toEqual(['https://facebook.example.test/testseite', 'https://youtube.example.test/testkanal']);
    expect(m.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Testweg 1',
      postalCode: '35578',
      addressLocality: 'Wetzlar',
      addressRegion: 'Hessen',
      addressCountry: 'DE',
    });
    expect(m.geo).toEqual({ '@type': 'GeoCoordinates', latitude: 50.5, longitude: 8.5 });
    expect(m.openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['https://schema.org/Saturday', 'https://schema.org/Sunday'],
        opens: '08:00',
        closes: '22:00',
      },
    ]);
  });

  it('Adresse ohne Postleitzahl: ganzer Text als Straße; mit Platzhalter im Text entfällt die Straße ganz', () => {
    const ohnePlz = knoten(gemeindeGraph({ basis: 'https://example.test', kontakt: { adresse: 'Testweg 1' }, sprache: 'de' }), 'Mosque');
    expect(ohnePlz.address).toMatchObject({ streetAddress: 'Testweg 1', addressLocality: 'Wetzlar' });
    expect(ohnePlz.address).not.toHaveProperty('postalCode');
    const teilweise = knoten(
      gemeindeGraph({ basis: 'https://example.test', kontakt: { adresse: 'Testweg 1, [PLZ] Wetzlar' }, sprache: 'de' }),
      'Mosque',
    );
    expect(teilweise.address).not.toHaveProperty('streetAddress');
  });
});

describe('faqSeite', () => {
  const eintrag = (n: number) => ({
    frage: { de: `Testfrage ${n}?`, tr: `Test sorusu ${n}?` },
    antwort: { de: `Testantwort ${n}.`, tr: `Test cevabı ${n}.` },
  });

  it('FAQPage mit Fragen und Antworten in der Seitensprache', () => {
    expect(faqSeite([eintrag(1)], 'tr')).toEqual({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: 'tr',
      mainEntity: [{ '@type': 'Question', name: 'Test sorusu 1?', acceptedAnswer: { '@type': 'Answer', text: 'Test cevabı 1.' } }],
    });
  });

  it('Rückfall auf Deutsch wird an der Frage gekennzeichnet', () => {
    expect(faqSeite([eintrag(1)], 'en')?.mainEntity).toEqual([
      { '@type': 'Question', name: 'Testfrage 1?', acceptedAnswer: { '@type': 'Answer', text: 'Testantwort 1.' }, inLanguage: 'de' },
    ]);
  });

  it('ohne Platzhalter, ohne ausgeblendete Einträge, höchstens zehn; ohne verwertbaren Eintrag null', () => {
    expect(faqSeite([], 'de')).toBeNull();
    expect(faqSeite([{ frage: { de: 'Testfrage?' }, antwort: { de: '[Antwort fehlt]' } }], 'de')).toBeNull();
    expect(faqSeite([{ ...eintrag(1), sichtbar: false }], 'de')).toBeNull();
    const viele = faqSeite(
      Array.from({ length: 12 }, (_, i) => eintrag(i + 1)),
      'de',
    );
    expect(viele?.mainEntity).toHaveLength(FAQ_MAX);
    expect(FAQ_MAX).toBe(10);
  });
});

describe('veranstaltung', () => {
  const termin = {
    url: 'https://example.test/veranstaltungen/testtermin-eins',
    name: 'Testtermin Eins',
    beginn: '2026-07-01T10:00:00.000Z',
    ende: '2026-07-01T12:00:00.000Z',
    vergangen: false,
    veranstalter: 'Testorganisation Eins',
  };

  it('Pflichtfelder, Zeiten in Berlin, Ort und Status für kommende Termine', () => {
    expect(veranstaltung({ ...termin, ort: 'Testsaal Eins', adresse: '[Adresse]' })).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: 'Testtermin Eins',
      url: termin.url,
      startDate: '2026-07-01T12:00:00+02:00',
      endDate: '2026-07-01T14:00:00+02:00',
      location: { '@type': 'Place', name: 'Testsaal Eins' },
      eventStatus: 'https://schema.org/EventScheduled',
      organizer: { '@type': 'Organization', name: 'Testorganisation Eins' },
    });
  });

  it('vergangene Termine tragen keinen Status', () => {
    expect(veranstaltung({ ...termin, vergangen: true })).not.toHaveProperty('eventStatus');
  });

  it('ohne Ort und Anschrift keine location; ohne Ende kein endDate', () => {
    const daten = veranstaltung({ ...termin, ende: null });
    expect(daten).not.toHaveProperty('location');
    expect(daten).not.toHaveProperty('endDate');
  });

  it('Anschrift allein ergibt eine location mit Postanschrift', () => {
    expect(veranstaltung({ ...termin, adresse: 'Testweg 1, 35578 Wetzlar' }).location).toEqual({
      '@type': 'Place',
      address: { '@type': 'PostalAddress', streetAddress: 'Testweg 1, 35578 Wetzlar' },
    });
  });

  it('Beschreibung mit Platzhalter entfällt', () => {
    expect(veranstaltung({ ...termin, beschreibung: 'Kurztext [Text fehlt: Kurztext]' })).not.toHaveProperty('description');
  });
});

describe('nachricht', () => {
  const logo = 'https://example.test/bilder/logos/logo-igmg-wetzlar.png';

  it('NewsArticle mit Berliner Zeit, Bild, Herausgeber und Sprache', () => {
    expect(
      nachricht({
        url: 'https://example.test/nachrichten/testbeitrag-eins',
        headline: 'Testbeitrag Eins',
        datePublished: '2026-01-15T17:30:00.000Z',
        bild: 'https://example.test/medien/testbild.webp',
        logo,
        sprache: 'de',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: 'Testbeitrag Eins',
      url: 'https://example.test/nachrichten/testbeitrag-eins',
      datePublished: '2026-01-15T18:30:00+01:00',
      image: 'https://example.test/medien/testbild.webp',
      inLanguage: 'de',
      publisher: { '@type': 'Organization', name: 'IGMG Wetzlar', logo: { '@type': 'ImageObject', url: logo } },
    });
  });

  it('dateModified nur, wenn ein Änderungsdatum gepflegt ist; kein Autor', () => {
    const ohne = nachricht({ url: website, headline: 'Testbeitrag Eins', datePublished: '2026-01-15T17:30:00.000Z', logo, sprache: 'de' });
    expect(ohne).not.toHaveProperty('dateModified');
    expect(ohne).not.toHaveProperty('author');
    const mit = nachricht({
      url: website,
      headline: 'Testbeitrag Eins',
      datePublished: '2026-01-15T17:30:00.000Z',
      dateModified: '2026-02-01T09:00:00.000Z',
      logo,
      sprache: 'de',
    });
    expect(mit.dateModified).toBe('2026-02-01T10:00:00+01:00');
  });
});

describe('brotkrumen', () => {
  it('nummeriert ab 1; der letzte Eintrag ohne Adresse', () => {
    expect(
      brotkrumen([
        { name: 'Startseite', url: website },
        { name: 'Testseite Eins', url: 'https://example.test/testseite' },
        { name: 'Aktuelle Seite' },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Startseite', item: website },
        { '@type': 'ListItem', position: 2, name: 'Testseite Eins', item: 'https://example.test/testseite' },
        { '@type': 'ListItem', position: 3, name: 'Aktuelle Seite' },
      ],
    });
  });
});

describe('JsonLd-Ausgabe', () => {
  const daten: JsonLdObjekt = { '@context': 'https://schema.org', '@type': 'Thing', name: 'Testtext </script><script>alert(1)</script>' };

  it('maskiert „<“ als \\u003c; der Text bleibt gültiges JSON mit gleichem Inhalt', () => {
    const text = jsonLdText(daten);
    expect(text).not.toContain('<');
    expect(text).toContain('\\u003c/script>');
    expect(JSON.parse(text)).toEqual(daten);
  });

  it('maskiert „<“ auch in einem @graph', () => {
    const graph: JsonLdGraph = { '@context': 'https://schema.org', '@graph': [{ '@type': 'Thing', name: 'Testtext </script><!--' }] };
    const text = jsonLdText(graph);
    expect(text).not.toContain('<');
    expect(JSON.parse(text)).toEqual(graph);
    const html = renderToStaticMarkup(createElement(JsonLd, { daten: graph }));
    expect(html.split('</script>')).toHaveLength(2);
    expect(html).not.toContain('<!--');
  });

  it('rendert genau ein Script-Element mit dem Typ application/ld+json', () => {
    const html = renderToStaticMarkup(createElement(JsonLd, { daten }));
    expect(html.startsWith('<script type="application/ld+json">')).toBe(true);
    expect(html.endsWith('</script>')).toBe(true);
    expect(html.split('</script>')).toHaveLength(2);
  });
});
