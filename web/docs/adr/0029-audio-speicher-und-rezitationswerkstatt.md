# ADR 0029 – Audio-Speicher, Direkt-Upload und Rezitations-Werkstatt

- Status: vorgeschlagen (Lauf Gemeinde-Plattform) · Bezug: Plan „Gemeinde-Plattform“ §2.5, §3.2, §4 (B-13), §6 (MN-03, MN-03b, MN-19), §7 (Z-16, Risiken) · ersetzt die Audio-Platzhalter aus ADR 0009

## Kontext

- Der Plan verlangt Rezitation auf zwei Wegen (Entscheidung des Nutzers): eigene Aufnahmen, zuerst Fatiha und Cüz 30, sowie die Erlaubnis eines bekannten Rezitators.
- Ohne geklärte Rechte und Stimme wird nichts aktiviert. Testdaten bestehen nur aus synthetischen Tönen.
- Die Upload-Grenze für Server-Routen liegt bei 4,5 MB. Aufnahmen sind größer.
- Eigene Aufnahmen brauchen einen Abgleich mit Versen und Wörtern.
- Risiko: Safari zerreißt arabische Ligaturen an Spans. Tajwid-Färbung wird in WebKit geprüft (MN-19).

## Entscheidung

1. **Speicher:** öffentlicher Vercel-Blob-Speicher `audio` in fra1. Pfade tragen den Inhalts-Hash und werden über den Rewrite `/audio/*` in `vercel.json` ausgeliefert. Die CSP bleibt `'self'`.
   - E0 prüft Range-Anfragen.
   - Rückfall: Blob-Domain in `media-src` und ein Verarbeitungsverzeichnis.
2. **Upload direkt vom Browser** über `@vercel/blob/client` mit einer Token-Route, die die Rechte prüft. Erlaubt sind m4a, mp3, ogg und webm, geprüft über Magic Bytes. Höchstens 60 MB je Sure.
3. **Werkstatt** unter `/verwaltung/quran/rezitationen/[id]/abgleich/[sure]`:
   1. Aufnahme im Browser (MediaRecorder). `microphone=(self)` gilt nur in der Verwaltung (§2.10).
   2. Wellenform aus `decodeAudioData`.
   3. Versgrenzen aus den Stillephasen.
   4. Mitklopfen der Wortanfänge bei 0,6- bis 0,8-facher Geschwindigkeit, mit Einrasten.
   5. Prüfwiedergabe.
   - Reihenfolge: Fatiha, dann Suren 78 bis 114. Die Liste zeigt die Vollständigkeit; ein Suren-Raster zeigt Aufnahme oder Upload je Sure.
4. **Aktivierung** nur mit hinterlegter Vereinbarung über Rechte und Stimme. Die Datenbank erzwingt das. Die Quellenzeile im Player nennt Rezitator und Lizenz.
5. **Lizenzierte Gesamtrezitation** wird per Import übernommen (`scripts/rezitation-import.ts`) mit quran-align-Zeiten, umschaltbar (MN-03b).
6. **Aligner auf dem lokalen Server** (K-B): liefert nur Vorschläge. Ein Mensch bestätigt sie.
7. **Testdaten:** nur synthetische Töne, nie Rezitationen.
8. **Tabellen:** `quran_rezitation` (eigen oder lizenziert; Vereinbarung Pflicht), `quran_audio`, `quran_verszeit`, `quran_wortzeit`.

## Alternativen

- Upload über eine Server-Route: verworfen (4,5-MB-Grenze).
- Automatischer Aligner ohne Bestätigung: verworfen (K-B nur als Vorschlag).
- Sprachausgabe (TTS) statt Rezitation: ausgeschlossen („bewusst abgelehnt“).
- Fremde Rezitationen ohne Erlaubnis einbinden: verworfen (MN-03b). Bis dahin gilt „Rezitation folgt“ bzw. nur die eigene Rezitation.
- Blob-Domain direkt statt Rewrite: nur als Rückfall vorgesehen, falls Range-Anfragen über den Rewrite scheitern.

## Folgen

- Jeder Import braucht eine Lizenzdatei im Manifest (Pflicht).
- Schalter `rezitation_<id>` (ADR 0035) je Rezitation.
- Tests: Magic-Byte-Prüfung, Größenlimit, Vereinbarungspflicht in der Datenbank, E2E „Werkstatt-Mitklopfen“, Testton im Player. Z-16 verlangt E2E für Player (beliebige Rezitation) und Werkstatt.
- MENSCHEN: MN-03 (Aufnahmen Fatiha und Cüz 30, Vereinbarung durch Imam oder Hafız; Standard „Rezitation folgt“) und MN-03b (Erlaubnis eines bekannten Rezitators oder Verlags; Standard „nur eigene“).
- Die Vereinbarung selbst ist kein Entwurf dieser ADR. Ihr Wortlaut ist ein Rechtstext (Plan §5).
