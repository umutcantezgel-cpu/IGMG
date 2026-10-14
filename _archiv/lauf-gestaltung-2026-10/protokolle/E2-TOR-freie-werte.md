# Werte außerhalb des Designsystems · 2026-10-11-18-50

Geprüft: 30 Dateien · Funde: 91 (Tailwind-Klammerwert 37, Hex-Farbe 45, px-Literal in Style 6, Farbfunktion 3)

| Datei | Zeile | Art | Fund | Zeile (Auszug) |
|---|---|---|---|---|
| web/src/app/globals.css | 106 | Tailwind-Klammerwert | `leading-[1.55]` | `/* Zeilenhöhe für Einleitungen in 20 px (statt leading-[1.55]) */` |
| web/src/app/globals.css | 108 | Tailwind-Klammerwert | `md:py-[72px]` | `/* Abschnittsabstände (statt md:py-[72px]/md:py-[88px]): 48 → 88 px und 40 → 72 px */` |
| web/src/app/globals.css | 108 | Tailwind-Klammerwert | `md:py-[88px]` | `/* Abschnittsabstände (statt md:py-[72px]/md:py-[88px]): 48 → 88 px und 40 → 72 px */` |
| web/src/app/globals.css | 111 | Tailwind-Klammerwert | `max-w-[760px]` | `/* Lesebreite für Einleitungen (statt max-w-[760px]) */` |
| web/src/app/globals.css | 113 | Tailwind-Klammerwert | `max-w-[880px]` | `/* Textspalte im Seitenkopf (statt max-w-[880px]) */` |
| web/src/app/globals.css | 124 | Tailwind-Klammerwert | `grid-cols-[repeat(…)]` | `/* Raster (Kern K-005, statt grid-cols-[repeat(…)]): Karten ab 340 px, Kacheln ab 260 px, je so viele Spalten wie passen */` |
| web/src/app/globals.css | 139 | Hex-Farbe | `#0e3929` | `* (#0e3929 = --color-gruen-950; Daten-URI kennt keine CSS-Variablen). Nie hinter Text.` |
| web/src/app/globals.css | 179 | Tailwind-Klammerwert | `z-50/z-60/z-[100]` | `/* Ebenen (statt z-50/z-60/z-[100]): als z-(--ebene-kopf) usw. */` |
| web/src/app/globals.css | 413 | Hex-Farbe | `#fff` | `background: #fff;` |
| web/src/app/globals.css | 460 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='ankuendigung'] [data-kategorie]:not([data-kategorie='ankuendigung']),` |
| web/src/app/globals.css | 461 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='veranstaltung'] [data-kategorie]:not([data-kategorie='veranstaltung']),` |
| web/src/app/globals.css | 462 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='religioes'] [data-kategorie]:not([data-kategorie='religioes']),` |
| web/src/app/globals.css | 463 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='soziales'] [data-kategorie]:not([data-kategorie='soziales']),` |
| web/src/app/globals.css | 464 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='neuigkeiten'] [data-kategorie]:not([data-kategorie='neuigkeiten']),` |
| web/src/app/globals.css | 465 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='gebet'] [data-kategorie]:not([data-kategorie='gebet']),` |
| web/src/app/globals.css | 466 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='bildung'] [data-kategorie]:not([data-kategorie='bildung']),` |
| web/src/app/globals.css | 467 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='gemeinde'] [data-kategorie]:not([data-kategorie='gemeinde']),` |
| web/src/app/globals.css | 468 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='kultur'] [data-kategorie]:not([data-kategorie='kultur']),` |
| web/src/app/globals.css | 469 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='jugend'] [data-kategorie]:not([data-kategorie='jugend']),` |
| web/src/app/globals.css | 470 | Tailwind-Klammerwert | `[data-kategorie]:not` | `[data-filter='frauen'] [data-kategorie]:not([data-kategorie='frauen']) {` |
| web/src/components/verwaltung/styleguide/tokens.ts | 33 | Hex-Farbe | `#0e3929` | `{ name: '--color-gruen-950', wert: '#0e3929', gruppe: 'marke', schluessel: 'gruen950', klasse: 'bg-gruen-950' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 34 | Hex-Farbe | `#065f46` | `{ name: '--color-gruen-800', wert: '#065f46', gruppe: 'marke', schluessel: 'gruen800', klasse: 'bg-gruen-800' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 35 | Hex-Farbe | `#047857` | `{ name: '--color-gruen-700', wert: '#047857', gruppe: 'marke', schluessel: 'gruen700', klasse: 'bg-gruen-700' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 36 | Hex-Farbe | `#d3f0e2` | `{ name: '--color-gruen-100', wert: '#d3f0e2', gruppe: 'marke', schluessel: 'gruen100', klasse: 'bg-gruen-100' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 37 | Hex-Farbe | `#ebf9f2` | `{ name: '--color-gruen-50', wert: '#ebf9f2', gruppe: 'marke', schluessel: 'gruen50', klasse: 'bg-gruen-50' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 38 | Hex-Farbe | `#1d1a17` | `{ name: '--color-tinte', wert: '#1d1a17', gruppe: 'neutral', schluessel: 'tinte', klasse: 'bg-tinte' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 39 | Hex-Farbe | `#514c46` | `{ name: '--color-tinte-2', wert: '#514c46', gruppe: 'neutral', schluessel: 'tinte2', klasse: 'bg-tinte-2' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 40 | Hex-Farbe | `#68625b` | `{ name: '--color-tinte-3', wert: '#68625b', gruppe: 'neutral', schluessel: 'tinte3', klasse: 'bg-tinte-3' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 41 | Hex-Farbe | `#8c857c` | `{ name: '--color-rand', wert: '#8c857c', gruppe: 'neutral', schluessel: 'rand', klasse: 'bg-rand', kontrast: '≥ 3:1' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 42 | Hex-Farbe | `#dfdad2` | `{ name: '--color-linie', wert: '#dfdad2', gruppe: 'neutral', schluessel: 'linie', klasse: 'bg-linie' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 43 | Hex-Farbe | `#f3f0e9` | `{ name: '--color-sand', wert: '#f3f0e9', gruppe: 'neutral', schluessel: 'sand', klasse: 'bg-sand' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 44 | Hex-Farbe | `#fcfaf6` | `{ name: '--color-papier', wert: '#fcfaf6', gruppe: 'neutral', schluessel: 'papier', klasse: 'bg-papier' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 45 | Hex-Farbe | `#ffffff` | `{ name: '--color-weiss', wert: '#ffffff', gruppe: 'neutral', schluessel: 'weiss', klasse: 'bg-weiss' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 46 | Hex-Farbe | `#af2b25` | `{ name: '--color-fehler', wert: '#af2b25', gruppe: 'status', schluessel: 'fehler', klasse: 'bg-fehler' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 47 | Hex-Farbe | `#ffedea` | `{ name: '--color-fehler-toenung', wert: '#ffedea', gruppe: 'status', schluessel: 'fehlerToenung', klasse: 'bg-fehler-toenung' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 48 | Hex-Farbe | `#81520a` | `{ name: '--color-warnung', wert: '#81520a', gruppe: 'status', schluessel: 'warnung', klasse: 'bg-warnung' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 49 | Hex-Farbe | `#fef2d9` | `{ name: '--color-warnung-toenung', wert: '#fef2d9', gruppe: 'status', schluessel: 'warnungToenung', klasse: 'bg-warnung-toenung' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 50 | Hex-Farbe | `#225899` | `{ name: '--color-info', wert: '#225899', gruppe: 'status', schluessel: 'info', klasse: 'bg-info' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 51 | Hex-Farbe | `#e9f3ff` | `{ name: '--color-info-toenung', wert: '#e9f3ff', gruppe: 'status', schluessel: 'infoToenung', klasse: 'bg-info-toenung' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 52 | Hex-Farbe | `#047857` | `{ name: '--color-org-at', wert: '#047857', gruppe: 'organisationen', schluessel: 'orgAt', klasse: 'bg-org-at' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 53 | Hex-Farbe | `#065f46` | `{ name: '--color-org-at-text', wert: '#065f46', gruppe: 'organisationen', schluessel: 'orgAtText', klasse: 'bg-org-at-text' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 54 | Hex-Farbe | `#e7f8f0` | `{ name: '--color-org-at-toenung', wert: '#e7f8f0', gruppe: 'organisationen', schluessel: 'orgAtToenung', klasse: 'bg-org-at-toenung' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 55 | Hex-Farbe | `#592e81` | `{ name: '--color-org-kt', wert: '#592e81', gruppe: 'organisationen', schluessel: 'orgKt', klasse: 'bg-org-kt' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 56 | Hex-Farbe | `#592e81` | `{ name: '--color-org-kt-text', wert: '#592e81', gruppe: 'organisationen', schluessel: 'orgKtText', klasse: 'bg-org-kt-text' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 57 | Hex-Farbe | `#f7f0ff` | `{ name: '--color-org-kt-toenung', wert: '#f7f0ff', gruppe: 'organisationen', schluessel: 'orgKtToenung', klasse: 'bg-org-kt-toenung' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 58 | Hex-Farbe | `#9b255a` | `{ name: '--color-org-kgt', wert: '#9b255a', gruppe: 'organisationen', schluessel: 'orgKgt', klasse: 'bg-org-kgt' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 59 | Hex-Farbe | `#9b255a` | `{ name: '--color-org-kgt-text', wert: '#9b255a', gruppe: 'organisationen', schluessel: 'orgKgtText', klasse: 'bg-org-kgt-text' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 60 | Hex-Farbe | `#ffeef3` | `{ name: '--color-org-kgt-toenung', wert: '#ffeef3', gruppe: 'organisationen', schluessel: 'orgKgtToenung', klasse: 'bg-org-kgt-toenung' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 61 | Hex-Farbe | `#008c98` | `{ name: '--color-org-gt', wert: '#008c98', gruppe: 'organisationen', schluessel: 'orgGt', klasse: 'bg-org-gt', kontrast: '4,03:1' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 62 | Hex-Farbe | `#006177` | `{ name: '--color-org-gt-text', wert: '#006177', gruppe: 'organisationen', schluessel: 'orgGtText', klasse: 'bg-org-gt-text' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 63 | Hex-Farbe | `#e6f7fd` | `{ name: '--color-org-gt-toenung', wert: '#e6f7fd', gruppe: 'organisationen', schluessel: 'orgGtToenung', klasse: 'bg-org-gt-toenung' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 64 | Hex-Farbe | `#225899` | `{ name: '--color-tag-bildung', wert: '#225899', gruppe: 'tags', schluessel: 'tagBildung', klasse: 'bg-tag-bildung' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 65 | Hex-Farbe | `#e9f3ff` | `{ name: '--color-tag-bildung-bg', wert: '#e9f3ff', gruppe: 'tags', schluessel: 'tagBildungBg', klasse: 'bg-tag-bildung-bg' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 66 | Hex-Farbe | `#81520a` | `{ name: '--color-tag-veranstaltung', wert: '#81520a', gruppe: 'tags', schluessel: 'tagVeranstaltung', klasse: 'bg-tag-veranstaltung' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 69 | Hex-Farbe | `#fef2d9` | `wert: '#fef2d9',` |
| web/src/components/verwaltung/styleguide/tokens.ts | 74 | Hex-Farbe | `#006177` | `{ name: '--color-tag-jugend', wert: '#006177', gruppe: 'tags', schluessel: 'tagJugend', klasse: 'bg-tag-jugend' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 75 | Hex-Farbe | `#e6f7fd` | `{ name: '--color-tag-jugend-bg', wert: '#e6f7fd', gruppe: 'tags', schluessel: 'tagJugendBg', klasse: 'bg-tag-jugend-bg' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 76 | Hex-Farbe | `#af2b25` | `{ name: '--color-tag-wichtig', wert: '#af2b25', gruppe: 'tags', schluessel: 'tagWichtig', klasse: 'bg-tag-wichtig' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 77 | Hex-Farbe | `#ffedea` | `{ name: '--color-tag-wichtig-bg', wert: '#ffedea', gruppe: 'tags', schluessel: 'tagWichtigBg', klasse: 'bg-tag-wichtig-bg' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 78 | Hex-Farbe | `#065f46` | `{ name: '--color-tag-neuigkeiten', wert: '#065f46', gruppe: 'tags', schluessel: 'tagNeuigkeiten', klasse: 'bg-tag-neuigkeiten' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 79 | Hex-Farbe | `#ebf9f2` | `{ name: '--color-tag-neuigkeiten-bg', wert: '#ebf9f2', gruppe: 'tags', schluessel: 'tagNeuigkeitenBg', klasse: 'bg-tag-neuigkeiten-bg' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 80 | Hex-Farbe | `#514c46` | `{ name: '--color-tag-gemeinde', wert: '#514c46', gruppe: 'tags', schluessel: 'tagGemeinde', klasse: 'bg-tag-gemeinde' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 81 | Hex-Farbe | `#f3f0e9` | `{ name: '--color-tag-gemeinde-bg', wert: '#f3f0e9', gruppe: 'tags', schluessel: 'tagGemeindeBg', klasse: 'bg-tag-gemeinde-bg' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 144 | px-Literal in Style | `'4px'` | `{ name: '--radius-sm', wert: '4px', klasse: 'rounded-sm', schluessel: 'sm' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 145 | px-Literal in Style | `'8px'` | `{ name: '--radius-md', wert: '8px', klasse: 'rounded-md', schluessel: 'md' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 146 | px-Literal in Style | `'12px'` | `{ name: '--radius-lg', wert: '12px', klasse: 'rounded-lg', schluessel: 'lg' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 147 | px-Literal in Style | `'999px'` | `{ name: '--radius-pill', wert: '999px', klasse: 'rounded-pill', schluessel: 'pill' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 153 | Farbfunktion | `rgba(2` | `{ name: '--shadow-s1', wert: '0 1px 2px rgba(29, 26, 23, 0.06)', klasse: 'shadow-s1', schluessel: 's1' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 154 | Farbfunktion | `rgba(2` | `{ name: '--shadow-s2', wert: '0 6px 20px rgba(29, 26, 23, 0.1)', klasse: 'shadow-s2', schluessel: 's2' },` |
| web/src/components/verwaltung/styleguide/tokens.ts | 155 | Farbfunktion | `rgba(2` | `{ name: '--shadow-s3', wert: '0 24px 64px rgba(29, 26, 23, 0.22)', klasse: 'shadow-s3', schluessel: 's3' },` |
| web/src/components/website/CourseCard.tsx | 57 | Tailwind-Klammerwert | `h-[150px]` | `<MedienBild bild={bild} sprache={sprache} sizes={SIZES_RASTER} className="h-[150px] border-b border-linie" />` |
| web/src/components/website/CourseCard.tsx | 59 | Tailwind-Klammerwert | `h-[150px]` | `<Bildplatzhalter beschriftung={t('foto', { titel })} className="h-[150px] border-b border-linie" />` |
| web/src/components/website/CourseCard.tsx | 71 | Tailwind-Klammerwert | `pt-[3px]` | `<dt className="flex pt-[3px] text-gruen-700">` |
| web/src/components/website/CourseCard.tsx | 82 | Tailwind-Klammerwert | `pt-[3px]` | `<dt className="flex pt-[3px] text-gruen-700">` |
| web/src/components/website/CourseCard.tsx | 94 | Tailwind-Klammerwert | `size-[18px]` | `<Info aria-hidden className="mt-0.5 size-[18px] shrink-0 text-tag-bildung" />` |
| web/src/components/website/EventCard.tsx | 67 | Tailwind-Klammerwert | `pt-[3px]` | `<dt className="flex pt-[3px] text-gruen-700">` |
| web/src/components/website/EventCard.tsx | 129 | Tailwind-Klammerwert | `px-[18px]` | `className="inline-flex min-h-12 flex-auto items-center justify-center gap-2 rounded-md bg-gruen-700 px-[18px] font-bold text-weiss no-underline hover:bg-gruen-8` |
| web/src/components/website/EventCard.tsx | 138 | Tailwind-Klammerwert | `px-[18px]` | `className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-[18px] font-bold text-gruen-800 no-underline ` |
| web/src/components/website/Header.tsx | 42 | Tailwind-Klammerwert | `text-[22px]` | `<span className="font-display text-[22px] leading-none font-semibold whitespace-nowrap">IGMG Wetzlar</span>` |
| web/src/components/website/KonzeptHinweis.tsx | 69 | Tailwind-Klammerwert | `w-[calc(100%-32px)]` | `className="m-auto w-[calc(100%-32px)] max-w-[680px] rounded-lg bg-papier p-0 text-tinte shadow-s3 backdrop:bg-tinte/55"` |
| web/src/components/website/KonzeptHinweis.tsx | 69 | Tailwind-Klammerwert | `max-w-[680px]` | `className="m-auto w-[calc(100%-32px)] max-w-[680px] rounded-lg bg-papier p-0 text-tinte shadow-s3 backdrop:bg-tinte/55"` |
| web/src/components/website/NewsCard.tsx | 57 | px-Literal in Style | `"88px"` | `<MedienBild bild={bild} sprache={sprache} sizes="88px" className="size-22 shrink-0 rounded-md border border-linie" />` |
| web/src/components/website/NewsCard.tsx | 127 | Tailwind-Klammerwert | `max-w-[62ch]` | `<Text feld={n.kurztext} sprache={sprache} als="p" className="max-w-[62ch] text-pretty text-tinte-2" />` |
| web/src/components/website/NewsCard.tsx | 143 | Tailwind-Klammerwert | `h-[180px]` | `<MedienBild bild={bild} sprache={sprache} sizes={SIZES_RASTER} className="h-[180px] border-b border-linie" />` |
| web/src/components/website/NewsCard.tsx | 145 | Tailwind-Klammerwert | `h-[180px]` | `<Bildplatzhalter beschriftung={t('fotoBeitrag')} className="h-[180px] border-b border-linie" />` |
| web/src/components/website/OrgCard.tsx | 76 | Tailwind-Klammerwert | `leading-[1.25]` | `<h3 className="text-24 leading-[1.25] text-balance break-words">` |
| web/src/components/website/OrgCard.tsx | 82 | Tailwind-Klammerwert | `underline-offset-[5px]` | `'text-tinte underline underline-offset-[5px] after:absolute after:inset-0 after:rounded-lg after:content-[""]',` |
| web/src/components/website/ueber-uns/Zeitleiste.tsx | 45 | Tailwind-Klammerwert | `flex-[1_1_320px]` | `<div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2">` |
| web/src/components/website/ueber-uns/Zeitleiste.tsx | 62 | Tailwind-Klammerwert | `flex-[0_1_280px]` | `<div className="relative h-35 flex-[0_1_280px] overflow-hidden rounded-md border border-linie">` |
| web/src/components/website/ueber-uns/Zeitleiste.tsx | 63 | px-Literal in Style | `"280px"` | `<Image src={e.bild} alt={bild.text} fill sizes="280px" className="object-cover" />` |
| web/src/components/website/ueber-uns/Zeitleiste.tsx | 66 | Tailwind-Klammerwert | `flex-[0_1_280px]` | `<Bildflaeche beschriftung={bild.text} lang={bild.lang} className="h-35 flex-[0_1_280px]" />` |
