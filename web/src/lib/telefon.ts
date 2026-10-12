/**
 * Anrufbare Telefonnummer (H-B10; H-B03 und H-B14 nutzen dieselbe Funktion in Welle 2).
 * Platzhalter in eckigen Klammern (G-05, z. B. „[Telefonnummer]“) ergeben keinen Link; sonst entsteht ein tel:-Ziel
 * nur aus Ziffern und Pluszeichen, damit Leerzeichen, Klammern und Striche die Wahl nicht stören.
 * Ohne Wert oder ohne eine einzige Ziffer gibt es ebenfalls keinen Link.
 */
export function telefonHref(wert: string | null | undefined): string | null {
  const roh = wert?.trim() ?? '';
  if (!roh || roh.startsWith('[')) return null;
  const nummer = roh.replace(/[^0-9+]/g, '');
  return /\d/.test(nummer) ? `tel:${nummer}` : null;
}
