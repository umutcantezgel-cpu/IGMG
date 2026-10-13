# ADR 0020 – Medienspeicher auf Vercel: Vercel Blob (Frankfurt), Direkt-Upload und Bildvarianten

- Status: angenommen, umgesetzt (Speicher, Varianten, Verkleinern im Browser; Direkt-Upload für PDF seit 2026-10-12) · 2026-10-11 · Letzter Lauf (Kern K-013, AUFTRAG V-05) · Bezug: ADR 0007

## Ziel

Auf Vercel ist das Dateisystem schreibgeschützt (außer `/tmp`), Funktionen nehmen höchstens 4,5 MB je Anfrage an, und die Bildoptimierung (`/_next/image`) ist im Services-Modus nicht verfügbar (404). Uploads müssen in einen EU-Speicher, größere Dateien dürfen nicht durch die Funktion, Metadaten werden weiter entfernt, und jedes Gerät bekommt eine passende Bildgröße.

## Wege

1. **Vercel Blob (Region fra1, privat)** als neuer `BlobSpeicher` hinter `src/lib/storage`; Browser lädt direkt hoch (`@vercel/blob/client`, Berechtigung serverseitig), danach verarbeitet eine Server Action die Datei (Download, `verarbeiteDatei` mit EXIF-Bereinigung, Varianten 480/960/1600/2560 als WebP, Rohdatei löschen).
2. **S3-kompatibler EU-Speicher** über den vorhandenen S3-Weg (`SPEICHER=s3`) mit vorab signierten Upload-URLs.
3. **Verkleinern im Browser** auf < 4,5 MB, dann wie bisher über die Server Action.

## Bewertung

Weg 3 allein löst Dateisystem und Varianten nicht. Weg 2 funktioniert ebenfalls und bleibt als Alternative im Code (Docker, andere Hoster). **Gewählt: Speicher nach Weg 1 (Vercel Blob), Upload nach Weg 3** – Bilder über 4 MB verkleinert schon der Browser (gleiche Kantenlänge wie der Server), danach läuft die vorhandene Server Action mit Typprüfung, EXIF-Bereinigung und Varianten unverändert. Der Direkt-Upload in den Speicher (`@vercel/blob/client`, Token-Route) bleibt der nächste Schritt, falls große PDF-Aushänge nötig werden (Umkehrprobe).

## Festlegungen

- `SPEICHER=blob` mit `BLOB_READ_WRITE_TOKEN`; `SPEICHER=dateisystem` auf Vercel ist ein Fehler der Startprüfung.
- Upload auf Vercel: Grenze 4,2 MB je Anfrage (mit Rand zu den 4,5 MB von Vercel Functions). Bilder darüber verkleinert der Browser auf höchstens 2560 px als WebP (`MedienFormulare.tsx`). PDF darüber lädt der Browser mit `SPEICHER=blob` direkt in Vercel Blob (Nachtrag 2026-10-12, Weg 1 für PDF, AUFTRAG V-05): Die Route `/verwaltung/medien/direkt` stellt nach Sitzung, zweitem Faktor und Recht `medium.hochladen` ein kurzlebiges Upload-Token für genau einen Eingangsschlüssel `eingang/<uuid>.pdf` aus (nur PDF, höchstens 10 MB, kein Überschreiben, gültig 10 Minuten, ohne Rückruf von Vercel). Die Server Action `hochladen` übernimmt den Eingang, prüft ihn wie jeden Upload (`verarbeiteDatei`: Magic Bytes, Größe), speichert unter dem Hash-Schlüssel und entfernt den Eingang. Nie übernommene Eingänge räumt der tägliche Löschlauf nach 24 Stunden ab (`raeumeDirektEingaengeAuf`). Die CSP der Verwaltung erlaubt dafür `connect-src https://vercel.com`, nur mit `SPEICHER=blob`; die öffentlichen Seiten bleiben bei `'self'`. Ohne Vercel Blob (lokal, Docker, S3) gilt die Grenze des Servers (10 MB), eine zu große PDF-Datei wird dort mit Meldung abgelehnt.
- Speicher privat (`access: 'private'`), Auslieferung nur über `/medien/…` – Papierkorb und Löschung wirken sofort.
- Varianten: 480, 960, 1600, 2560 px Breite (nur kleiner als das Original, nie hochskaliert), WebP, unter `<schlüssel>.w<breite>.webp` neben dem Original – das Datenmodell bleibt unverändert (UNANTASTBAR). Die Medienroute liefert eine fehlende Variante (Medien von vor dieser Entscheidung) als Original aus. `MedienBild` baut auf Vercel daraus `srcset`/`sizes` (`variantenSrcSet`). Logos bleiben feste PNG (nie hochskaliert).
- Löschen (Verwaltung, Löschlauf) entfernt Original und Varianten (`loescheMitVarianten`).
- Bildoptimierung von Vercel bleibt aus (`images.unoptimized` auf Vercel) – die Varianten ersetzen sie und halten die Tarifgrenzen ein.

## Umkehrprobe

Falsch, wenn Blob in der gewählten Region nicht verfügbar ist oder die Kosten den Rahmen sprengen – dann `SPEICHER=s3` mit einem EU-Anbieter (Weg 2), ohne Änderung an den Aufrufern. Falsch auch, wenn PDF-Aushänge regelmäßig größer als 4 MB sind – dann Direkt-Upload (`@vercel/blob/client`, Token nur mit `medium.hochladen`, danach Verarbeitung per Server Action).

## Folgen zweiter Ordnung

- Datenschutz: Vercel Blob als Auftragsverarbeiter im Verarbeitungsverzeichnis (V-11).
- Löschfristen gelten auch für Blob-Dateien (Löschlauf ruft den Speicher, nicht das Dateisystem).
