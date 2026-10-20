// PWA-Symbole der Lern-App (ADR 0037 Nr. 8): Achtstern aus der Formensprache der Website (KERN 3.0, `Achtstern` in
// src/components/website/Icons.tsx) als weiße 2-px-Linie im 24er-Raster auf Grün – kein Logo, keine Schrift. Farben aus
// den Tokens (gruen-800 Fläche, weiß Linie, wie scripts/pwa-symbole.mjs). Ausgabe: public/lern-app/symbole/*.png (einmal
// erzeugen, mit einchecken). Aufruf: node scripts/lernapp-symbole.mjs
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const GRUEN = '#065f46';
const WEISS = '#ffffff';
/** Achtstern im 24er-Raster (Mittelpunkt 12/12), derselbe Pfad wie `Achtstern` der Website. */
const ACHTSTERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';

/** SVG 512×512; `rand` = Sicherheitsabstand für „maskable“ (Inhalt in der inneren 80-%-Zone). */
function svg(rand) {
  const s = 512;
  const innen = s - 2 * rand;
  // Der Stern füllt 17 von 24 Rastereinheiten; im Symbol nimmt er 70 % der Innenfläche ein
  const massstab = (innen * 0.7) / 17;
  const versatz = rand + innen / 2 - 12 * massstab;
  const radius = rand ? 0 : Math.round(s * 0.18);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <rect width="${s}" height="${s}" rx="${radius}" fill="${GRUEN}"/>
  <g transform="translate(${versatz} ${versatz}) scale(${massstab})">
    <path d="${ACHTSTERN}" fill="none" stroke="${WEISS}" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="12" cy="12" r="2.2" fill="${WEISS}"/>
  </g>
</svg>`;
}

await mkdir('public/lern-app/symbole', { recursive: true });
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
    .toFile(`public/lern-app/symbole/${name}`);
}
console.log('Symbole der Lern-App erzeugt:', ziele.map(([n]) => n).join(', '));
