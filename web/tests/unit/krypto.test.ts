import { beforeAll, describe, expect, it } from 'vitest';
import { entschluessele, gleich, sha256, verschluessele, zufallsToken } from '@/lib/krypto';

beforeAll(() => {
  process.env.EINGANG_SCHLUESSEL = Buffer.alloc(32, 3).toString('base64');
  process.env.EINGANG_SCHLUESSEL_ID = '1';
});

describe('Verschlüsselung der Eingänge (ADR 0005)', () => {
  it('ver- und entschlüsselt verlustfrei, Chiffrat enthält keinen Klartext', () => {
    const daten = { vorname: 'Testperson', nachname: 'Eins', kind: { geburtsdatum: '2018-01-01' } };
    const { daten: paket, schluesselId } = verschluessele(daten);
    expect(paket.toString('utf8')).not.toContain('Testperson');
    expect(entschluessele(paket, schluesselId)).toEqual(daten);
  });

  it('erkennt Manipulation (GCM-Tag)', () => {
    const { daten: paket, schluesselId } = verschluessele({ a: 1 });
    paket[paket.length - 1] ^= 0xff;
    expect(() => entschluessele(paket, schluesselId)).toThrow();
  });

  it('gleiche Daten ergeben verschiedene Chiffrate (zufälliger IV)', () => {
    expect(verschluessele({ a: 1 }).daten.equals(verschluessele({ a: 1 }).daten)).toBe(false);
  });

  it('lehnt unbekannte Schlüssel-IDs ab', () => {
    const { daten: paket } = verschluessele({ a: 1 });
    expect(() => entschluessele(paket, 99)).toThrow();
  });

  it('Hilfsfunktionen', () => {
    expect(sha256('abc')).toHaveLength(64);
    expect(zufallsToken()).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(gleich('abc', 'abc')).toBe(true);
    expect(gleich('abc', 'abd')).toBe(false);
    expect(gleich('abc', 'abcd')).toBe(false);
  });
});
