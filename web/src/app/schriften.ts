import localFont from 'next/font/local';

/**
 * Selbst gehostete Schriften (K-04, ADR 0014, Laufbuch D-02).
 * Je Schrift zwei Aufrufe mit gleichem font-family-Namen: Grundzeichensatz (mit Fallback-Metrik, Preload)
 * und Erweiterung (latin-ext: ş, ğ, İ …) per unicode-range – der Browser lädt sie nur bei Bedarf.
 * Die Optionen müssen Literale sein (next/font wertet sie zur Buildzeit statisch aus).
 */

export const schriftText = localFont({
  src: [
    { path: '../fonts/atkinson-hyperlegible-next-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/atkinson-hyperlegible-next-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  declarations: [
    { prop: 'font-family', value: 'schriftText' },
    { prop: 'unicode-range', value: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' },
  ],
  variable: '--schrift-text',
  display: 'swap',
  adjustFontFallback: 'Arial',
});

export const schriftTextErweitert = localFont({
  src: [
    { path: '../fonts/atkinson-hyperlegible-next-latin-ext-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/atkinson-hyperlegible-next-latin-ext-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  declarations: [
    { prop: 'font-family', value: 'schriftText' },
    { prop: 'unicode-range', value: 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF' },
  ],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

export const schriftTitel = localFont({
  src: [{ path: '../fonts/source-serif-4-latin-600-normal.woff2', weight: '600', style: 'normal' }],
  declarations: [
    { prop: 'font-family', value: 'schriftTitel' },
    { prop: 'unicode-range', value: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' },
  ],
  variable: '--schrift-titel',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

export const schriftTitelErweitert = localFont({
  src: [{ path: '../fonts/source-serif-4-latin-ext-600-normal.woff2', weight: '600', style: 'normal' }],
  declarations: [
    { prop: 'font-family', value: 'schriftTitel' },
    { prop: 'unicode-range', value: 'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF' },
  ],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

export const schriftArabisch = localFont({
  src: [
    { path: '../fonts/amiri-arabic-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/amiri-arabic-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  declarations: [
    { prop: 'font-family', value: 'schriftArabisch' },
    { prop: 'unicode-range', value: 'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC' },
  ],
  variable: '--schrift-arabisch',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
});

/** Alle Klassen für das <html>-Element (Variablen + Erweiterungs-Faces). */
export const schriftKlassen = [
  schriftText.variable,
  schriftTextErweitert.className,
  schriftTitel.variable,
  schriftTitelErweitert.className,
  schriftArabisch.variable,
].join(' ');
