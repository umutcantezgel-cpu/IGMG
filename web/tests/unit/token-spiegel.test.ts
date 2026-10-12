import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EINTRITT } from '@/lib/gebetszeiten/bogen';
import { MAILFARBE, MAILMASS } from '@/lib/mail/vorlagen/farben';
import { OG_FARBEN } from '@/lib/seo/og-bild';

/**
 * Spiegel der Tokens für Medien ohne CSS-Variablen (Z-03, REFERENZ §1): E-Mail (MAILFARBE, MAILMASS), OG-Bild
 * (OG_FARBEN) und die Browser-Metadaten (themeColor). Jeder Wert muss genau einem Token aus src/app/globals.css
 * entsprechen; ändert sich ein Token, schlägt dieser Test an.
 */

const WEB = join(import.meta.dirname, '..', '..');
const CSS = readFileSync(join(WEB, 'src', 'app', 'globals.css'), 'utf8');
const THEMA = /@theme \{([\s\S]*?)\n\}/.exec(CSS)?.[1] ?? '';
const token = new Map<string, string>();
for (const zeile of THEMA.split('\n')) {
  const m = /^\s*(--[\w-]+):\s*(.+?);/.exec(zeile);
  if (m?.[1] && m[2]) token.set(m[1], m[2].trim().toLowerCase());
}
const wert = (name: string) => {
  const w = token.get(name);
  if (!w) throw new Error(`Token ${name} fehlt in globals.css`);
  return w;
};
/** rem oder px eines Tokens in px (1rem = 16 px). */
const px = (name: string) => {
  const w = wert(name);
  if (w.endsWith('rem')) return `${Number.parseFloat(w) * 16}px`;
  return w;
};
const spacing = (n: number) => `${Number.parseFloat(wert('--spacing')) * 16 * n}px`;

describe('Token-Spiegel für Medien ohne CSS-Variablen', () => {
  it('MAILFARBE entspricht den Farb-Tokens', () => {
    const zuordnung: Record<keyof typeof MAILFARBE, string> = {
      tiefgruen: '--color-gruen-950',
      gruen: '--color-gruen-700',
      tinte: '--color-tinte',
      tinte2: '--color-tinte-2',
      sand: '--color-sand',
      papier: '--color-papier',
      linie: '--color-linie',
      weiss: '--color-weiss',
    };
    for (const [schluessel, name] of Object.entries(zuordnung)) {
      expect(MAILFARBE[schluessel as keyof typeof MAILFARBE].toLowerCase(), `${schluessel} = ${name}`).toBe(wert(name));
    }
  });

  it('MAILMASS besteht aus Schrift-, Radius- und Abstands-Tokens plus fünf festen Maßen des Mailrahmens', () => {
    expect(MAILMASS.text).toBe(px('--text-16'));
    expect(MAILMASS.titel).toBe(px('--text-24'));
    expect(MAILMASS.radiusKnopf).toBe(px('--radius-md'));
    expect(MAILMASS.radius).toBe(px('--radius-lg'));
    expect(MAILMASS.abstand1).toBe(spacing(1));
    expect(MAILMASS.abstand3).toBe(spacing(3));
    expect(MAILMASS.abstand4).toBe(spacing(4));
    expect(MAILMASS.abstand5).toBe(spacing(5));
    expect(MAILMASS.abstand6).toBe(spacing(6));
    expect(MAILMASS.abstand8).toBe(spacing(8));
    expect(MAILMASS.knopfSenkrecht).toBe(spacing(3.5));
    expect(MAILMASS.knopfHoehe).toBe(spacing(12));
    // Feste Maße des Mailrahmens (keine Website-Tokens); neue Werte müssen hier bewusst ergänzt werden
    const rahmen = { breite: '600px', schmal: '480px', akzent: '2px', haar: '1px', aus: '0px' };
    for (const [schluessel, w] of Object.entries(rahmen)) expect(MAILMASS[schluessel as keyof typeof MAILMASS]).toBe(w);
    expect(Object.keys(MAILMASS).sort()).toEqual(
      [
        'text',
        'titel',
        'radiusKnopf',
        'radius',
        'abstand1',
        'abstand3',
        'abstand4',
        'abstand5',
        'abstand6',
        'abstand8',
        'knopfSenkrecht',
        'knopfHoehe',
        ...Object.keys(rahmen),
      ].sort(),
    );
  });

  it('OG_FARBEN entspricht den Farb-Tokens', () => {
    const zuordnung: Record<keyof typeof OG_FARBEN, string> = {
      papier: '--color-papier',
      tinte: '--color-tinte',
      tinte2: '--color-tinte-2',
      gruen800: '--color-gruen-800',
      gruen700: '--color-gruen-700',
      gruen100: '--color-gruen-100',
    };
    for (const [schluessel, name] of Object.entries(zuordnung)) {
      expect(OG_FARBEN[schluessel as keyof typeof OG_FARBEN].toLowerCase(), `${schluessel} = ${name}`).toBe(wert(name));
    }
  });

  it('themeColor der Browser-Metadaten ist --color-gruen-950', () => {
    const layout = readFileSync(join(WEB, 'src', 'app', '[locale]', 'layout.tsx'), 'utf8');
    const m = /themeColor:\s*'(#[0-9a-fA-F]{6})'/.exec(layout);
    expect(m?.[1]?.toLowerCase()).toBe(wert('--color-gruen-950'));
  });

  it('EINTRITT (Tagesbogen, Färbung im Takt) entspricht --ease-eintritt', () => {
    expect(wert('--ease-eintritt')).toBe(`cubic-bezier(${EINTRITT.join(', ')})`);
  });
});
