import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { JsonLd, jsonLdText } from '@/components/website/JsonLd';
import { brotkrumen, gepflegt, isoBerlin, moschee, nachricht, veranstaltung, type JsonLdObjekt } from '@/lib/seo/jsonld';

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

describe('moschee', () => {
  it('lässt Platzhalter und leere Werte weg; name und url bleiben', () => {
    const daten = moschee({ url: website, kontakt: { adresse: '[Adresse]', telefon: '[Telefonnummer]', email: '  ', social: {} } });
    expect(daten).toEqual({ '@context': 'https://schema.org', '@type': 'Mosque', name: 'IGMG Wetzlar', url: website });
  });

  it('übernimmt gepflegte Angaben, Koordinaten und nur https-Profile', () => {
    const daten = moschee({
      url: website,
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
      },
    });
    expect(daten.address).toEqual({ '@type': 'PostalAddress', streetAddress: 'Testweg 1, 35578 Wetzlar' });
    expect(daten.telephone).toBe('+49 000 0000');
    expect(daten.email).toBe('testperson@example.test');
    expect(daten.sameAs).toEqual(['https://facebook.example.test/testseite', 'https://youtube.example.test/testkanal']);
    expect(daten.geo).toEqual({ '@type': 'GeoCoordinates', latitude: 50.5, longitude: 8.5 });
  });

  it('eine Adresse mit Platzhalter im Text entfällt ganz', () => {
    const daten = moschee({ url: website, kontakt: { adresse: 'Testweg 1, [PLZ] Wetzlar' } });
    expect(daten).not.toHaveProperty('address');
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

  it('rendert genau ein Script-Element mit dem Typ application/ld+json', () => {
    const html = renderToStaticMarkup(createElement(JsonLd, { daten }));
    expect(html.startsWith('<script type="application/ld+json">')).toBe(true);
    expect(html.endsWith('</script>')).toBe(true);
    expect(html.split('</script>')).toHaveLength(2);
  });
});
