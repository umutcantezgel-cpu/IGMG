# ADR 0023 – Auslieferung statischer Dateien und OG-Bilder auf Vercel

- Status: angenommen · 2026-10-11 · Letzter Lauf (Kern K-013, AUFTRAG V-08) · Bezug: ADR 0012

## Ziel

Statische Dateien (Logos, Symbole, Schriften) sollen lange im Cache liegen; Open-Graph-Bilder dürfen zur Laufzeit nicht von der Platte lesen (auf Vercel liegt `public/` nicht im Funktions-Dateisystem).

## Wege

1. **Cache-Header für `public/bilder` und `public/symbole`** in `next.config.ts` (`Cache-Control: public, max-age=31536000, immutable` nur für versionierte Pfade, sonst 1 Tag + `stale-while-revalidate`), OG-Bild lädt das Symbol per `import`/`fetch(new URL(..., import.meta.url))`.
2. Alles über Vercels Standard-Header laufen lassen.
3. Dateien in einen Blob-Speicher verschieben.

## Bewertung

**Weg 1 gewählt:** kleine, lokale Änderung; Dateinamen ohne Versionsanteil bekommen keine „immutable“-Zusage.

## Festlegungen

- Header-Regeln in `next.config.ts` (`headers()`), getrennt nach versionierten (`/_next/static`, Schriften mit Hash) und unversionierten Pfaden.
- `src/lib/seo/og-bild.tsx`: Symbol und Schrift per Modul-Import statt `readFile(process.cwd()/public/…)`.

## Umkehrprobe

Falsch, wenn eine Datei unter gleichem Namen ersetzt wird und Besucher die alte sehen – deshalb kein `immutable` für unversionierte Pfade.

## Folgen zweiter Ordnung

- Ein neues Logo braucht einen neuen Dateinamen, damit es sofort überall erscheint (BETRIEB.md).
