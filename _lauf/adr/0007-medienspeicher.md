# ADR 0007 – Medienspeicher

- Status: angenommen · 2026-10-11 · P1 · Kern 1.0 · Bezug: K-10, K-13, K-14, G-07, Z-04, Z-06

## Ziel
Bilder (und PDFs für Aushänge) werden nur in der Verwaltung hochgeladen, nach Typ und Größe geprüft, mit Pflicht-Alt-Text versehen und über next/image ausgeliefert – lokal in der Entwicklung, S3-kompatibel im Betrieb, ohne Anfragen an Dritte beim Seitenaufruf.

## Wege
1. **Speicher-Adapter** (Schnittstelle) mit Implementierungen Dateisystem und S3; Auslieferung über eine eigene Route unter der eigenen Herkunft.
2. **Direkt öffentliche S3-URLs** (Bucket-Domain) in next/image `remotePatterns`.
3. **Bilder in der Datenbank** (bytea).

## Bewertung
Weg 2 erzeugt Anfragen an eine fremde Herkunft (T8: nur eigene Herkunft) und bindet an einen Anbieter. Weg 3 bläht Backups und DB auf. **Weg 1 gewählt.**

## Festlegungen
- `src/lib/storage/index.ts`: `interface Speicher { schreibe(schluessel, daten, typ); lies(schluessel): Stream; loesche(schluessel); existiert(schluessel) }`; `dateisystem.ts` (Verzeichnis `MEDIEN_VERZEICHNIS`, Standard `web/.medien/`, in .gitignore) und `s3.ts` (`@aws-sdk/client-s3`, Endpunkt/Region/Bucket aus `.env`, nur serverseitig).
- Upload: Server Action, nur Rollen mit `medium.hochladen`; Größe ≤ 10 MB; Typ über **Magic Bytes** (JPEG, PNG, WebP, AVIF; PDF nur für Aushänge), nicht über Dateiendung; SVG verboten (Skriptgefahr). Bilder werden beim Upload mit sharp neu kodiert (entfernt EXIF/GPS – Datenschutz) und auf max. 2560 px Kante begrenzt.
- Tabelle `medium(id, schluessel, typ, groesse, breite, hoehe, alt jsonb {de pflicht, tr?, en?}, bildrechte text, erstellt_von, erstellt_am, im_papierkorb_seit)`.
- Auslieferung: Route Handler `GET /medien/[...schluessel]` streamt aus dem Adapter mit `Cache-Control: public, max-age=31536000, immutable` (Schlüssel enthält Inhalts-Hash); next/image nutzt `localPatterns` für `/medien/**`.
- Löschen: Papierkorb 30 Tage (K-05); endgültig löschen entfernt Datei und Zeile; Verwendungsprüfung verhindert das Löschen genutzter Medien.

## Umkehrprobe
Falsch, wenn sehr viele große Videos gespeichert werden sollen (Bandbreite). Videos sind nicht beauftragt; Islamisches Wissen › Videos bleibt Platzhalter.

## Folgen zweiter Ordnung
- Backups müssen das Medienverzeichnis bzw. den Bucket einschließen (BETRIEB.md).
- sharp (LGPL-Binärteil) wird genutzt – Lizenzhinweis ADR 0001.
