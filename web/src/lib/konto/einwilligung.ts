import { createHash } from 'node:crypto';

/**
 * Textversion einer Einwilligung (Art. 7 Abs. 1 DSGVO: Nachweis, welchem Wortlaut zugestimmt wurde). Gespeichert wird
 * in `konto_einwilligung.text_version` die Version des Wortlauts und der SHA-256 genau des angezeigten Texts:
 * `<version>+sha256:<64 Hex-Zeichen>`. Ändert sich ein Zeichen, ändert sich der Hash – auch ohne neue Versionsnummer.
 */
export const KONTO_EINWILLIGUNG_VERSION = '2026-10';

export function textVersion(version: string, text: string): string {
  const hash = createHash('sha256').update(text, 'utf8').digest('hex');
  return `${version}+sha256:${hash}`;
}

/** Zerlegt eine Textversion; null, wenn das Format nicht passt. */
export function leseTextVersion(wert: string): { version: string; sha256: string } | null {
  const m = /^(.+)\+sha256:([0-9a-f]{64})$/.exec(wert);
  return m ? { version: m[1], sha256: m[2] } : null;
}
