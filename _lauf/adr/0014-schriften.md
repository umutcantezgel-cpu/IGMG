# ADR 0014 – Schriften selbst gehostet

- Status: angenommen · 2026-10-11 · P1 · Bezug: K-04, K-11, K-12, K-14, G-09, Laufbuch D-02

## Ziel
Atkinson Hyperlegible Next (Text, 400/700), Source Serif 4 (Überschriften, 600), Amiri (Arabisch, 400/700) – ohne Anfrage an Google beim Seitenaufruf, reproduzierbar baubar (auch offline in Docker), mit gutem LCP/CLS.

## Wege
1. **`next/font/google`** – lädt die Dateien zur Buildzeit von Google und liefert sie selbst aus.
2. **`next/font/local`** mit im Repo abgelegten WOFF2-Dateien (aus den offiziellen OFL-Quellen) und Lizenztexten.
3. **@fontsource-Pakete** + CSS-Import.

## Bewertung
Weg 1: Build hängt vom Netz und von Googles aktuellem Dateistand ab (Docker-Build offline scheitert). Weg 3: zusätzliche Pakete, kein `next/font`-Preload/Fallback-Metrik. **Weg 2 gewählt:** reproduzierbar, `next/font` erzeugt Fallback-Metriken (CLS), Preload nur für Text- und Überschriftenschrift; Amiri ohne Preload, nur auf Seiten mit arabischem Inhalt.

## Festlegungen
- Dateien unter `web/src/fonts/` (WOFF2, Subsets latin + latin-ext; Amiri zusätzlich arabic) mit `OFL.txt` je Schrift; einmalige Beschaffung über die Google-Fonts-Download-Quelle bzw. die offiziellen GitHub-Releases der Schriften (Quelle in LIZENZEN.md).
- CSS-Variablen `--font-text`, `--font-display`, `--font-arabic` wie in `design/tokens/typography.css`; Fallback-Kette aus dem Design.
- `display: 'swap'`, `adjustFontFallback` aktiv.

## Umkehrprobe
Falsch, wenn eine Schriftlizenz das Einbetten verbietet – OFL 1.1 erlaubt es ausdrücklich.

## Folgen zweiter Ordnung
- LIZENZEN.md führt die drei Schriften mit OFL 1.1 als Lizenz-Ausnahme (ADR 0001).
