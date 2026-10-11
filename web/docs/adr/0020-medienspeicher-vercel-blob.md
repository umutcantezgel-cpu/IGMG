# ADR 0020 – Medienspeicher auf Vercel: Vercel Blob (Frankfurt), Direkt-Upload und Bildvarianten

- Status: angenommen · 2026-10-11 · Letzter Lauf (Kern K-013, AUFTRAG V-05) · Bezug: ADR 0007

## Ziel

Auf Vercel ist das Dateisystem schreibgeschützt (außer `/tmp`), Funktionen nehmen höchstens 4,5 MB je Anfrage an, und die Bildoptimierung (`/_next/image`) ist im Services-Modus nicht verfügbar (404). Uploads müssen in einen EU-Speicher, größere Dateien dürfen nicht durch die Funktion, Metadaten werden weiter entfernt, und jedes Gerät bekommt eine passende Bildgröße.

## Wege

1. **Vercel Blob (Region fra1, privat)** als neuer `BlobSpeicher` hinter `src/lib/storage`; Browser lädt direkt hoch (`@vercel/blob/client`, Berechtigung serverseitig), danach verarbeitet eine Server Action die Datei (Download, `verarbeiteDatei` mit EXIF-Bereinigung, Varianten 480/960/1600/2560 als WebP, Rohdatei löschen).
2. **S3-kompatibler EU-Speicher** über den vorhandenen S3-Weg (`SPEICHER=s3`) mit vorab signierten Upload-URLs.
3. **Verkleinern im Browser** auf < 4,5 MB, dann wie bisher über die Server Action.

## Bewertung

Weg 3 allein löst Dateisystem und Varianten nicht. Weg 2 funktioniert ebenfalls und bleibt als Alternative im Code (Docker, andere Hoster). **Weg 1 gewählt:** ein Klick in Vercel (Marketplace/Storage), Region Frankfurt, kein eigener Schlüsselbetrieb; die vorhandene Speicher-Schnittstelle nimmt den neuen Speicher auf.

## Festlegungen

- `SPEICHER=blob` mit `BLOB_READ_WRITE_TOKEN`; `SPEICHER=dateisystem` auf Vercel ist ein Fehler der Startprüfung.
- Direkt-Upload nur für angemeldete Konten mit Medienrecht (Token-Ausgabe prüft Sitzung, Zwei-Faktor, Rolle, Dateityp, Größe ≤ 25 MB).
- Varianten: 480, 960, 1600, 2560 px Breite (nie hochskaliert), WebP; `MedienBild` baut daraus `srcset`/`sizes`. Bestehende Medien ohne Varianten bekommen das Original als Rückfall. Logos bleiben feste PNG (nie hochskaliert).
- Bildoptimierung von Vercel bleibt aus (`images.unoptimized` auf Vercel) – die Varianten ersetzen sie und halten die Tarifgrenzen ein.

## Umkehrprobe

Falsch, wenn Blob in der gewählten Region nicht verfügbar ist oder die Kosten den Rahmen sprengen – dann `SPEICHER=s3` mit einem EU-Anbieter (Weg 2), ohne Änderung an den Aufrufern.

## Folgen zweiter Ordnung

- Datenschutz: Vercel Blob als Auftragsverarbeiter im Verarbeitungsverzeichnis (V-11).
- Löschfristen gelten auch für Blob-Dateien (Löschlauf ruft den Speicher, nicht das Dateisystem).
