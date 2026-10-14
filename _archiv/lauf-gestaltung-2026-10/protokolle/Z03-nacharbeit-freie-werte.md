# Werte außerhalb des Designsystems · 2026-10-12-06-37

Geprüft: 8 Dateien · Funde: 52 (Tailwind-Klammerwert 18, Hex-Farbe 10, px-Literal in Style 24)

| Datei | Zeile | Art | Fund | Zeile (Auszug) |
|---|---|---|---|---|
| web/src/app/globals.css | 107 | Tailwind-Klammerwert | `leading-[1.55]` | `/* Zeilenhöhe für Einleitungen in 20 px (statt leading-[1.55]) */` |
| web/src/app/globals.css | 109 | Tailwind-Klammerwert | `md:py-[72px]` | `/* Abschnittsabstände (statt md:py-[72px]/md:py-[88px]): 48 → 88 px und 40 → 72 px */` |
| web/src/app/globals.css | 109 | Tailwind-Klammerwert | `md:py-[88px]` | `/* Abschnittsabstände (statt md:py-[72px]/md:py-[88px]): 48 → 88 px und 40 → 72 px */` |
| web/src/app/globals.css | 112 | Tailwind-Klammerwert | `max-w-[760px]` | `/* Lesebreite für Einleitungen (statt max-w-[760px]) */` |
| web/src/app/globals.css | 114 | Tailwind-Klammerwert | `max-w-[880px]` | `/* Textspalte im Seitenkopf (statt max-w-[880px]) */` |
| web/src/app/globals.css | 127 | Tailwind-Klammerwert | `grid-cols-[repeat(…)]` | `/* Raster (Kern K-005, statt grid-cols-[repeat(…)]): Karten ab 340 px, Kacheln ab 260 px, je so viele Spalten wie passen */` |
| web/src/app/globals.css | 165 | Hex-Farbe | `#0e3929` | `* (#0e3929 = --color-gruen-950; Daten-URI kennt keine CSS-Variablen). Nie hinter Text. Regelmäßiger Achtstern auf` |
| web/src/app/globals.css | 214 | Tailwind-Klammerwert | `z-50/z-60/z-[100]` | `/* Ebenen (statt z-50/z-60/z-[100]): als z-(--ebene-kopf) usw. */` |
| web/src/app/globals.css | 680 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='ankuendigung'] [data-kategorie]:not([data-kategorie='ankuendigung']),` |
| web/src/app/globals.css | 681 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='veranstaltung'] [data-kategorie]:not([data-kategorie='veranstaltung']),` |
| web/src/app/globals.css | 682 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='religioes'] [data-kategorie]:not([data-kategorie='religioes']),` |
| web/src/app/globals.css | 683 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='soziales'] [data-kategorie]:not([data-kategorie='soziales']),` |
| web/src/app/globals.css | 684 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='neuigkeiten'] [data-kategorie]:not([data-kategorie='neuigkeiten']),` |
| web/src/app/globals.css | 685 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='gebet'] [data-kategorie]:not([data-kategorie='gebet']),` |
| web/src/app/globals.css | 686 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='bildung'] [data-kategorie]:not([data-kategorie='bildung']),` |
| web/src/app/globals.css | 687 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='gemeinde'] [data-kategorie]:not([data-kategorie='gemeinde']),` |
| web/src/app/globals.css | 688 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='kultur'] [data-kategorie]:not([data-kategorie='kultur']),` |
| web/src/app/globals.css | 689 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='jugend'] [data-kategorie]:not([data-kategorie='jugend']),` |
| web/src/app/globals.css | 690 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='frauen'] [data-kategorie]:not([data-kategorie='frauen']) {` |
| web/src/app/[locale]/layout.tsx | 27 | Hex-Farbe | `#0e3929` | `themeColor: '#0e3929',` |
| web/src/lib/mail/vorlagen/Rahmen.tsx | 39 | px-Literal in Style | `margin: 0` | `margin: 0,` |
| web/src/lib/mail/vorlagen/Rahmen.tsx | 40 | px-Literal in Style | `padding: 0` | `padding: 0,` |
| web/src/lib/mail/vorlagen/Rahmen.tsx | 80 | px-Literal in Style | `padding: 0` | `padding: 0,` |
| web/src/lib/mail/vorlagen/index.tsx | 63 | px-Literal in Style | `margin: 0` | `<p data-skip-in-text="true" style={{ margin: 0, fontSize: M.textKlein, lineHeight: '1.5', color: F.tinte2, wordBreak: 'break-all' }}>` |
| web/src/lib/mail/vorlagen/index.tsx | 83 | px-Literal in Style | `margin: 0` | `<p style={{ margin: 0, fontSize: M.textKlein, color: F.tinte2 }}>{t.kontakt}</p>` |
| web/src/lib/mail/vorlagen/farben.ts | 6 | Hex-Farbe | `#0e3929` | `tiefgruen: '#0e3929',` |
| web/src/lib/mail/vorlagen/farben.ts | 7 | Hex-Farbe | `#047857` | `gruen: '#047857',` |
| web/src/lib/mail/vorlagen/farben.ts | 8 | Hex-Farbe | `#1d1a17` | `tinte: '#1d1a17',` |
| web/src/lib/mail/vorlagen/farben.ts | 9 | Hex-Farbe | `#514c46` | `tinte2: '#514c46',` |
| web/src/lib/mail/vorlagen/farben.ts | 10 | Hex-Farbe | `#f3f0e9` | `sand: '#f3f0e9',` |
| web/src/lib/mail/vorlagen/farben.ts | 11 | Hex-Farbe | `#fcfaf6` | `papier: '#fcfaf6',` |
| web/src/lib/mail/vorlagen/farben.ts | 12 | Hex-Farbe | `#dfdad2` | `linie: '#dfdad2',` |
| web/src/lib/mail/vorlagen/farben.ts | 13 | Hex-Farbe | `#ffffff` | `weiss: '#ffffff',` |
| web/src/lib/mail/vorlagen/farben.ts | 22 | px-Literal in Style | `'14px'` | `textKlein: '14px',` |
| web/src/lib/mail/vorlagen/farben.ts | 23 | px-Literal in Style | `'16px'` | `text: '16px',` |
| web/src/lib/mail/vorlagen/farben.ts | 24 | px-Literal in Style | `'24px'` | `titel: '24px',` |
| web/src/lib/mail/vorlagen/farben.ts | 25 | px-Literal in Style | `'20px'` | `knopfZeile: '20px',` |
| web/src/lib/mail/vorlagen/farben.ts | 26 | px-Literal in Style | `'48px'` | `knopfHoehe: '48px',` |
| web/src/lib/mail/vorlagen/farben.ts | 27 | px-Literal in Style | `'8px'` | `radiusKnopf: '8px',` |
| web/src/lib/mail/vorlagen/farben.ts | 28 | px-Literal in Style | `'12px'` | `radius: '12px',` |
| web/src/lib/mail/vorlagen/farben.ts | 29 | px-Literal in Style | `'4px'` | `abstand1: '4px',` |
| web/src/lib/mail/vorlagen/farben.ts | 30 | px-Literal in Style | `'12px'` | `abstand3: '12px',` |
| web/src/lib/mail/vorlagen/farben.ts | 31 | px-Literal in Style | `'16px'` | `abstand4: '16px',` |
| web/src/lib/mail/vorlagen/farben.ts | 32 | px-Literal in Style | `'20px'` | `abstand5: '20px',` |
| web/src/lib/mail/vorlagen/farben.ts | 33 | px-Literal in Style | `'24px'` | `abstand6: '24px',` |
| web/src/lib/mail/vorlagen/farben.ts | 34 | px-Literal in Style | `'32px'` | `abstand8: '32px',` |
| web/src/lib/mail/vorlagen/farben.ts | 35 | px-Literal in Style | `'14px'` | `knopfSenkrecht: '14px',` |
| web/src/lib/mail/vorlagen/farben.ts | 36 | px-Literal in Style | `'600px'` | `breite: '600px',` |
| web/src/lib/mail/vorlagen/farben.ts | 37 | px-Literal in Style | `'480px'` | `schmal: '480px',` |
| web/src/lib/mail/vorlagen/farben.ts | 38 | px-Literal in Style | `'2px'` | `akzent: '2px',` |
| web/src/lib/mail/vorlagen/farben.ts | 39 | px-Literal in Style | `'1px'` | `haar: '1px',` |
| web/src/lib/mail/vorlagen/farben.ts | 40 | px-Literal in Style | `'0px'` | `aus: '0px',` |
