import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bildTitel, ohneEmoji, terminZeile, titelSchriftgroesse } from '@/lib/seo/og-bild';

describe('Open-Graph-Bilder: Titel (K-14, K-16)', () => {
  it('wählt die Schriftgröße nach Gesamtlänge (höchstens drei Zeilen)', () => {
    expect(titelSchriftgroesse('Ramadan 2025')).toBe(96);
    expect(titelSchriftgroesse('Gemeinschaft Wetzlar')).toBe(96); // 20 Zeichen
    expect(titelSchriftgroesse('Gemeinschaft Wetzlar!')).toBe(64); // 21 Zeichen
    expect(titelSchriftgroesse('ab '.repeat(20).trim())).toBe(64); // 59
    expect(titelSchriftgroesse('ab '.repeat(25).trim())).toBe(48); // 74
    expect(titelSchriftgroesse('ab '.repeat(35).trim())).toBe(40); // 104
  });

  it('verkleinert nach dem längsten Wort, damit kein Kompositum über den Rand läuft', () => {
    expect(titelSchriftgroesse('Gemeinschaftsküche')).toBe(96); // 18 Zeichen in einem Wort
    expect(titelSchriftgroesse('Gemeinschaftsveranstaltung')).toBe(64); // 26
    expect(titelSchriftgroesse('Gemeinschaftsverantwortungsübernahme')).toBe(48); // 36
    expect(titelSchriftgroesse('Gemeinschaftsverantwortungsübernahmeveranstaltung')).toBe(40); // 49
  });

  it('entfernt Emoji und lässt ©, ® , ™ und türkische Buchstaben stehen', () => {
    expect(ohneEmoji('Ramadan 🌙 2025')).toBe('Ramadan 2025');
    expect(ohneEmoji('Familie 👨‍👩‍👧 Treffen')).toBe('Familie Treffen');
    expect(ohneEmoji('Ein © Zeichen ™ İstanbul ğ')).toBe('Ein © Zeichen ™ İstanbul ğ');
  });

  it('lässt kurze Titel unverändert und kürzt lange an einer Wortgrenze mit „…“', () => {
    expect(bildTitel('  Kurzer Titel  ')).toBe('Kurzer Titel');
    const lang = Array.from({ length: 60 }, () => 'Wort').join(' ');
    const gekuerzt = bildTitel(lang, 180);
    expect(gekuerzt.endsWith('Wort…')).toBe(true);
    expect([...gekuerzt].length).toBeLessThanOrEqual(181);
    expect(gekuerzt).not.toContain(' …');
  });

  it('schneidet ohne passende Wortgrenze hart ab', () => {
    expect(bildTitel('a'.repeat(200), 50)).toBe(`${'a'.repeat(50)}…`);
  });
});

describe('Open-Graph-Bilder: Termin', () => {
  it('formatiert Datum und Zeitspanne wie auf den Seiten (Europe/Berlin)', () => {
    const beginn = new Date('2025-08-02T16:30:00Z');
    expect(terminZeile(beginn, new Date('2025-08-02T18:00:00Z'), 'de')).toBe('Sa., 2. August 2025, 18:30–20:00 Uhr');
    expect(terminZeile(beginn, null, 'de')).toBe('Sa., 2. August 2025, 18:30 Uhr');
    expect(terminZeile(beginn, null, 'en')).toContain('18:30');
  });
});

describe('Open-Graph-Texte (Namensraum ogBild)', () => {
  type OgBild = { art: Record<string, string>; alt: Record<string, string> };
  const lade = (sprache: 'de' | 'tr' | 'en'): OgBild =>
    JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', 'messages', `${sprache}.json`), 'utf8')).ogBild as OgBild;
  const schluessel = (objekt: object, praefix = ''): string[] =>
    Object.entries(objekt).flatMap(([k, v]) =>
      typeof v === 'object' && v !== null ? schluessel(v, `${praefix}${k}.`) : [`${praefix}${k}`],
    );

  it('hat in Deutsch, Türkisch und Englisch dieselben Schlüssel', () => {
    const de = schluessel(lade('de')).sort();
    expect(de).toEqual(['alt.nachricht', 'alt.standard', 'alt.veranstaltung', 'art.nachricht', 'art.veranstaltung']);
    expect(schluessel(lade('tr')).sort()).toEqual(de);
    expect(schluessel(lade('en')).sort()).toEqual(de);
  });

  it('nennt Titel und Zeit als Platzhalter in den Alt-Texten', () => {
    for (const sprache of ['de', 'tr', 'en'] as const) {
      expect(lade(sprache).alt.nachricht).toContain('{titel}');
      expect(lade(sprache).alt.veranstaltung).toContain('{zeit}');
    }
  });
});
