import type { SprachRegeln } from './normalisiere';

/**
 * Türkisch (PLAN §4.1): Kleinschreibung mit `toLocaleLowerCase('tr')` (I → ı, İ → i). Ohne Sonderzeichen geschriebene
 * Wörter (i/ı, ş/s, ğ/g, ç/c, ö/o, ü/u) werden mit Hinweis angenommen; der Apostroph der Eigennamen ist tolerant
 * (allgemeine Lockerung `apostroph`). Der Zirkumflex (â, î, û) ist nach der heutigen Rechtschreibung oft frei und fällt
 * still weg.
 */
const OHNE_SONDERZEICHEN: Record<string, string> = { ı: 'i', ş: 's', ğ: 'g', ç: 'c', ö: 'o', ü: 'u' };

export const REGELN_TR: SprachRegeln = {
  sprache: 'tr',
  klein: (text) => text.toLocaleLowerCase('tr'),
  still: (text) =>
    text
      .normalize('NFD')
      .replace(/([aiu])\u0302+/g, '$1')
      .normalize('NFC'),
  lockerungen: [{ hinweis: 'sonderzeichen', wende: (w) => w.replace(/[ışğçöü]/g, (z) => OHNE_SONDERZEICHEN[z] ?? z) }],
};
