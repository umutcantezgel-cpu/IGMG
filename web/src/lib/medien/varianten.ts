/**
 * Bildvarianten (ADR 0020): Beim Hochladen entstehen WebP-Fassungen in festen Breiten unterhalb der Originalbreite.
 * Das Datenmodell bleibt unverändert (UNANTASTBAR): Varianten liegen unter `<schlüssel>.w<breite>.webp` neben dem
 * Original; für ältere Medien ohne Varianten liefert die Medienroute das Original. Reine Funktionen (auch im Browser).
 */
export const VARIANTEN = [480, 960, 1600, 2560] as const;
export type Variantenbreite = (typeof VARIANTEN)[number];

const MUSTER = /^(.+)\.w(480|960|1600|2560)\.webp$/;

export function variantenSchluessel(schluessel: string, breite: Variantenbreite): string {
  return `${schluessel}.w${breite}.webp`;
}

/** Schlüssel einer Variante → Original und Breite; sonst null. */
export function zerlegeVariante(schluessel: string): { original: string; breite: Variantenbreite } | null {
  const t = MUSTER.exec(schluessel);
  return t ? { original: t[1], breite: Number(t[2]) as Variantenbreite } : null;
}

/** Breiten, die für ein Bild dieser Breite entstehen (nur kleiner als das Original – nie hochskaliert). */
export function variantenBreiten(breite: number | null | undefined): Variantenbreite[] {
  return breite ? VARIANTEN.filter((w) => w < breite) : [];
}

/** srcset aus Varianten und Original, z. B. für `<img>` ohne Bildoptimierung (Vercel, Services-Modus). */
export function variantenSrcSet(url: string, breite: number): string {
  return [...variantenBreiten(breite).map((w) => `${url}.w${w}.webp ${w}w`), `${url} ${breite}w`].join(', ');
}
