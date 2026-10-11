# Abnahme (L1) · Bündel 3 (C04, C05, C10b, A23b, B10) und C07, C11, „Passwort vergessen“ · 2026-10-11

| Paket | 1 | 2 | 3 | 4 | 5 | Summe | Ergebnis |
|---|---|---|---|---|---|---|---|
| C04 Seiteninhalte I (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen (Integration 19/19) |
| C05 Seiteninhalte II – Kontakt, Organisationen (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen (12/12); meldete doppelte Quelle der Öffnungszeiten → behoben (A-S11c) |
| C10b Öffentliche Meldung (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen (10/10); Link auf der Kontaktseite durch den Orchestrator |
| A23b E2E Bedienabläufe Welle A (Haiku) | 2 | 2 | 2 | – | 2 | – | angenommen: 34/34 je Projekt; Befund Linkname „Weiterlesen : …“ → NewsCard behoben, Test aktiviert; Befund Karte ohne Koordinaten = gewolltes Verhalten (skip mit Grund) |
| B10 Übersetzungsprüfung (Haiku) | 2 | – | – | 2 | 2 | – | 186 Texte je Sprache geprüft, 8 Korrekturen eingespielt, dazu „Gizlilik bildirimi“ einheitlich und türkischer Betreff ohne Doppelpossessiv; religiöser Begriff → M-094 |
| C07 Gebetszeiten-Verwaltung (Orchestrator) | 2 | 2 | 2 | 2 | – | – | Stufe 3; Integration 6/6, E-039 |
| C11 Medien (Orchestrator) | 2 | 2 | 2 | 2 | – | – | Stufe 3; Integration 8/8 (EXIF entfernt, SVG abgelehnt, Pfadausbruch 404, Verwendungsschutz), E-038; Dublettenfehler selbst gefunden |
| Passwort vergessen (Orchestrator) | 2 | 2 | 2 | 2 | – | – | Integration 3/3, E2E-Spec mit Mailpit; gesperrte Konten ohne Link |

## Belege
- `pnpm check`: Unit 453 + 3 erwartete Fehlschläge, Typen und Lint ohne Befund
- `pnpm test:integration`: 24 Dateien, 414/414
- `pnpm build`: grün (`build-buendel-3.log`), /meldung statisch
- E2E (`e2e-buendel-3.log`): 534 Tests, 473 bestanden, 57 übersprungen (Projekt telefon für Verwaltungsabläufe), 4 Fehlschläge → 3 Testlocators (C04/C05-Specs) und 1 echter Fehler (Medien: Navigation aus einem Effekt lief nach dem Zurückkehren erneut, per Diagnose-Spec nachgestellt) → behoben; Nachlauf (`e2e-nachlauf-3.log`) 10/10
- Lighthouse (`_lauf/belege/lighthouse/2026-10-11-07-49/`): /meldung, /tr/bildirim, /kontakt, /nachrichten, / – P 99, A/BP/SEO 100, JS 168,9–169,7 kB
