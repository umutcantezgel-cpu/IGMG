// PWA-Symbole (D-P1): neutrales Monogramm „W“ (Wetzlar) aus Linien, ohne Schrift und ohne das IGMG-Logo nachzuzeichnen.
// Farben aus den Tokens (gruen-800 Fläche, weiß Linie). Ausgabe: public/symbole/*.png (einmal erzeugen, mit einchecken).
// Aufruf: node scripts/pwa-symbole.mjs
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const GRUEN = '#065f46';
const WEISS = '#ffffff';

/** SVG 512×512; `rand` = Sicherheitsabstand für „maskable“ (Inhalt in der inneren 80-%-Zone). */
function svg(rand) {
  const s = 512;
  const innen = s - 2 * rand;
  const p = (x, y) => `${rand + x * innen},${rand + y * innen}`;
  const linie = Math.round(innen * 0.085);
  const radius = rand ? 0 : Math.round(s * 0.18);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${radius}" fill="${GRUEN}"/>
  <polyline points="${p(0.2, 0.3)} ${p(0.34, 0.72)} ${p(0.5, 0.42)} ${p(0.66, 0.72)} ${p(0.8, 0.3)}"
    fill="none" stroke="${WEISS}" stroke-width="${linie}" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

await mkdir('public/symbole', { recursive: true });
const ziele = [
  ['symbol-192.png', 192, 0],
  ['symbol-512.png', 512, 0],
  ['symbol-maskable-512.png', 512, 51],
  ['apple-touch-icon.png', 180, 0],
];
for (const [name, groesse, rand] of ziele) {
  await sharp(Buffer.from(svg(rand)))
    .resize(groesse, groesse)
    .png({ compressionLevel: 9 })
    .toFile(`public/symbole/${name}`);
}
console.log('Symbole erzeugt:', ziele.map(([n]) => n).join(', '));
