import localFont from 'next/font/local';

/**
 * Oberflächenschrift der arabischen Oberfläche (ADR 0044): Noto Sans Arabic 400/700, Teilmenge „arabic“, selbst
 * gehostet aus @fontsource/noto-sans-arabic 5.3.0 (`pnpm schriften:kopieren`, src/fonts/QUELLE.md). Nur im
 * Wurzel-Layout der Lern-App; als Variable `--schrift-arabisch-ui`, die `--font-arabisch-ui` in globals.css aufnimmt.
 * Ohne Vorladen (ADR 0044 Fortschreibung Nr. 2: next/font lädt je Route vor, nicht je Sprache – sonst auch in de/tr).
 * `unicode-range` wie Amiri (arabischer Block): Latein kommt aus der Textschrift.
 */
export const schriftArabischUi = localFont({
  src: [
    { path: '../../fonts/noto-sans-arabic-arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../../fonts/noto-sans-arabic-arabic-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  declarations: [
    { prop: 'font-family', value: 'schriftArabischUi' },
    {
      prop: 'unicode-range',
      value:
        'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC',
    },
  ],
  variable: '--schrift-arabisch-ui',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
});
