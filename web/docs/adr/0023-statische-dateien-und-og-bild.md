# ADR 0023 – Auslieferung statischer Dateien und OG-Bilder auf Vercel

- Status: angenommen, umgesetzt · 2026-10-11 · Letzter Lauf (Kern K-013, AUFTRAG V-08) · Bezug: ADR 0012

## Ziel

Statische Dateien (Logos, Symbole, Schriften) sollen lange im Cache liegen; Open-Graph-Bilder müssen auch auf Vercel ihr Symbol finden.

## Wege

1. **Cache-Header für `public/bilder` und `public/symbole`** in `next.config.ts` (`Cache-Control: public, max-age=31536000, immutable` nur für versionierte Pfade, sonst 1 Tag + `stale-while-revalidate`), OG-Bild lädt das Symbol per `import`/`fetch(new URL(..., import.meta.url))`.
2. Alles über Vercels Standard-Header laufen lassen.
3. Dateien in einen Blob-Speicher verschieben.

## Bewertung

**Weg 1 gewählt:** kleine, lokale Änderung; Dateinamen ohne Versionsanteil bekommen keine „immutable“-Zusage.

## Festlegungen

- Header-Regeln in `next.config.ts` (`headers()`), getrennt nach versionierten (`/_next/static`, Schriften mit Hash) und unversionierten Pfaden.
- `src/lib/seo/og-bild.tsx` bleibt bei `readFile(join(process.cwd(), 'public', …))`: genau dieser Weg steht in der Next-Doku (`opengraph-image.md`), und Next verfolgt ihn beim Bau mit (Output File Tracing). Die OG-Bilder werden zudem beim Bau vorgerendert. Ein Modul-Import ist nicht nötig.

## Umkehrprobe

Falsch, wenn eine Datei unter gleichem Namen ersetzt wird und Besucher die alte sehen – deshalb kein `immutable` für unversionierte Pfade.

## Folgen zweiter Ordnung

- Ein neues Logo braucht einen neuen Dateinamen, damit es sofort überall erscheint (BETRIEB.md).
