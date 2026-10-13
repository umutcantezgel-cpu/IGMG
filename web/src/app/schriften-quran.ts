import localFont from 'next/font/local';

/**
 * Koranschrift Amiri Quran (OFL 1.1, src/fonts/quran/QUELLE.md) für die Koran-Seiten. Eigenes Modul neben
 * `schriften.ts`: Das Wurzellayout lädt `schriften.ts` auf jeder Seite; diese Schrift wird nur dort eingebunden und
 * vorgeladen, wo eine Koran-Seite das Modul importiert (next/font lädt je Route, die das Modul nutzt).
 * Der Name der Schriftfamilie ist fest (`schriftQuran`), das Token `--font-quran` in globals.css nennt ihn; die
 * Optionen müssen Literale sein.
 */
export const schriftQuran = localFont({
  src: [{ path: '../fonts/quran/amiri-quran-arabic-400-normal.woff2', weight: '400', style: 'normal' }],
  declarations: [
    { prop: 'font-family', value: 'schriftQuran' },
    {
      prop: 'unicode-range',
      value:
        'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0897-08E1,U+08E3-08FF,U+200C-200E,U+2010-2011,U+204F,U+2E41,U+FB50-FDFF,U+FE70-FE74,U+FE76-FEFC',
    },
  ],
  variable: '--schrift-quran',
  display: 'swap',
  preload: true,
  adjustFontFallback: false,
});
