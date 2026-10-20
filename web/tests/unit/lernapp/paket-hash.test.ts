import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { inhaltHash, istHash, kanonisch, kanonischGeprueft, sha256Hex, textHash } from '@/lib/lernapp/paket/hash';

/** Inhalts-Hashes und kanonisches JSON (ADR 0039 Nr. 1): Reihenfolge der Schlüssel egal, Werte nicht. */
describe('kanonisches JSON', () => {
  it('sortiert Schlüssel rekursiv, behält Listen, lässt undefined weg', () => {
    expect(kanonisch({ b: 1, a: { d: [3, 1], c: 'x' }, u: undefined })).toBe('{"a":{"c":"x","d":[3,1]},"b":1}');
  });

  it('gleicher Inhalt in anderer Schlüsselreihenfolge → gleicher Hash (Eigenschaft)', () => {
    fc.assert(
      fc.property(fc.dictionary(fc.string({ maxLength: 8 }), fc.oneof(fc.string(), fc.integer(), fc.boolean())), (o) => {
        const umgedreht = Object.fromEntries(Object.entries(o).reverse());
        expect(inhaltHash(umgedreht)).toBe(inhaltHash(o));
      }),
    );
  });

  it('jede Änderung eines Werts ändert den Hash', () => {
    const a = { schluessel: 'tr.a1.e01.s0001', text: 'Su içiyorum.' };
    expect(inhaltHash({ ...a, text: 'Su içiyorum!' })).not.toBe(inhaltHash(a));
    expect(inhaltHash({ ...a, tokens: [] })).not.toBe(inhaltHash(a));
  });

  it('nicht endliche Zahlen werden abgelehnt', () => {
    expect(() => kanonischGeprueft({ a: Number.NaN })).toThrow(/nicht endlich/);
    expect(() => inhaltHash({ a: [1, Infinity] })).toThrow();
  });
});

describe('SHA-256', () => {
  it('liefert 64 Hex-Zeichen und ist stabil', () => {
    expect(sha256Hex('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(istHash(sha256Hex('abc'))).toBe(true);
    expect(istHash('ABC')).toBe(false);
    expect(sha256Hex(new TextEncoder().encode('abc'))).toBe(sha256Hex('abc'));
  });

  it('Text-Hash vereinheitlicht nur die Unicode-Normalform (NFC)', () => {
    expect(textHash('Gru\u0308n')).toBe(textHash('Grün'));
    expect(textHash('grün')).not.toBe(textHash('Grün'));
  });
});
