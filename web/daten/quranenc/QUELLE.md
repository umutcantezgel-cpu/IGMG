# QUELLE: QuranEnc (german_bubenheim, turkish_rwwad, english_rwwad)

## Status: NICHT GELADEN – Grund

Grund: Die QuranEnc-Seite war nicht erreichbar. Drei Anläufe auf `https://quranenc.com/api/v1/translations/list/de` scheiterten mit Timeout nach 60 s (0 Byte empfangen). Ein weiterer Versuch auf `https://quranenc.com/` scheiterte ebenfalls mit Timeout nach 60 s.

Versuchte Anläufe, Stand 2026-10-13 (UTC):
1. `curl --max-time 60` auf `/api/v1/translations/list/de`: Timeout nach 60 s.
2. Gleicher Aufruf: Timeout nach 60 s.
3. Gleicher Aufruf: Timeout nach 60 s.
4. `https://quranenc.com/`: Timeout nach 60 s.

Nicht versucht: `list/tr`, `list/en`, Volltexte der Ausgaben `german_bubenheim`, `turkish_rwwad`, `english_rwwad`. Das Anlaufbudget (3 Anläufe) war für diese Quelle erschöpft.

## Bedingungen (7 Punkte)

Nicht erfasst. Die Bedingungen von https://quranenc.com waren nicht abrufbar. Sie wurden nicht aus dem Gedächtnis ergänzt. Vor einer Übernahme sind sie wörtlich von der Seite zu kopieren.

## Offen

- OFFENE FRAGE: Zweiter Abruf der QuranEnc-Quelle zu einem späteren Zeitpunkt, mit Abruf der Bedingungen und der drei Ausgaben.
- Bis dahin dürfen keine QuranEnc-Übersetzungen eingebunden werden (Plan: Schalter je Ausgabe).
