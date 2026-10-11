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

## Nachtrag 2026-10-11 (Tor B/C, SP-C2)

- **Größe:** Next.js begrenzt Action-Anfragen standardmäßig auf 1 MB, und der Proxy puffert nur 10 MB. Bilder bis zur App-Grenze von 10 MB kamen deshalb nicht oder gekürzt an (B9). `experimental.serverActions.bodySizeLimit` und `experimental.proxyClientMaxBodySize` stehen jetzt auf 11 MB. Der Reverse-Proxy begrenzt öffentliche Pfade enger (BETRIEB.md 5b).
- **Verwendung:** `verwendungVon` sucht Bildknoten strukturell mit `jsonb_path_exists` (`$.** ? (@.type == "image" && @.attrs.mediumId == $id)`), in Neuigkeiten (`inhalt`) und Veranstaltungen (`beschreibung`), in allen Sprachen und jeder Tiefe. Die frühere Textsuche (LIKE) fand wegen des Leerzeichens in `jsonb::text` nie einen Treffer (B1).
- **Browser-Cache:** `public, max-age=86400` statt einem Jahr `immutable` (C11b: zunächst 7 Tage). Die Bildoptimierung von Next.js übernimmt dieses Höchstalter für ihre Kopien und lässt sich nicht invalidieren; nach Papierkorb oder Löschung verfallen alle Kopien damit binnen eines Tages (K-05, B7).
- **PDF-Metadaten** (Autor, Ersteller, XMP) bleiben erhalten, nur Bilder werden neu kodiert (B8). Das Upload-Formular weist darauf hin; ob die App sie entfernen soll, fragt M-097.
- **Papierkorb (H2–H4):** Dieselbe Datei noch einmal hochzuladen meldet, dass sie im Papierkorb liegt, statt dorthin weiterzuleiten. Alt-Text und Bildrechte lassen sich im Papierkorb nicht ändern. Scheitert der Datenbankeintrag nach dem Schreiben der Datei, wird die Datei wieder entfernt.

## Nachtrag 2026-10-11 (C11b, Bilder an Inhalten)

- **Bilder an Inhalten:** Neuigkeiten, Veranstaltungen und Kurse verweisen über `bildId` auf ein Bild; Neuigkeiten können zusätzlich Bildknoten im Text haben. Gespeichert wird nur ein vorhandenes Bild außerhalb des Papierkorbs, kein PDF (`bildFehlerFuer`, Fehler `bildUngueltig`).
- **Öffentliche Abfragen** liefern Adresse, Maße und Alt-Text je Sprache (`ladeBilder`, Tag `medien`). Ein Bild im Papierkorb fällt weg, dann erscheint der Platzhalter.
- **Darstellung** über `getImageProps` (ohne Client-JavaScript, E-030) und die Bildoptimierung (`localPatterns` `/medien/**`).
- **Auswahl** in der Verwaltung: Die Formularseite lädt `ladeBildAuswahl()` (höchstens 300 Bilder) und gibt die Liste an den Dialog weiter; eine eigene Schnittstelle gibt es nicht.
