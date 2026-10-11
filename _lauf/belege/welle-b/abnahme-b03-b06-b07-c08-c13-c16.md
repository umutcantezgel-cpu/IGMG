# Abnahme (L1) · B03, B06, B07 · C08, C13, C14, C15, C16 · 2026-10-11

Prüfungen je Paket: (1) Auftrag/Akzeptanz · (2) Muster/Architektur · (3) Tests · (4) Texte/Platzhalter (G-05, K-02) · (5) Bericht ehrlich und vollständig. 0–2 Punkte, Freigabe ab 8/10 ohne eine 0.

| Paket | 1 | 2 | 3 | 4 | 5 | Summe | Ergebnis |
|---|---|---|---|---|---|---|---|
| B03 Kontaktformular (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen; Einwilligungstext → M-083 |
| B06 Mitglied werden (Haiku) | 2 | 2 | 1 | 2 | 2 | 9 | angenommen; E2E deckte ALTCHA-Rennen auf (Befund O, behoben im gemeinsamen `AltchaFeld`), Benachrichtigungs-Betreff vereinheitlicht |
| B07 Webseite für Moscheen (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen; meldete den 500-Fehler ohne JavaScript im gemeinsamen Muster (→ E-032) |
| C08 Eingänge + C16 Löschfristen (Orchestrator) | 2 | 2 | 2 | 2 | – | – | Stufe 3, eigene Arbeit; Integration 13/13, E2E Ablauf grün |
| C13 Audit-Log (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen; E2E zeigte fehlenden Audit-Eintrag bei der ersten Anmeldung (Befund O, behoben in `anmeldung.ts`) |
| C14 Styleguide (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen |
| C15 Rich-Text-Editor (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen; Einbau mit C02/C03/C04, E2E dann dort |

## Belege
- `pnpm check`: Typen und Lint ohne Befund; Unit 26 Dateien, 450 bestanden + 3 erwartete Fehlschläge
- `pnpm test:integration`: 11 Dateien, 131/131
- `pnpm build`: grün; öffentliche Formularseiten statisch (○ /de|tr|en/kontakt, mitglied-werden, webseite-fuer-moscheen) – `build-b03-b07-c.log`, `build-3.log`
- E2E Lauf 1 (`e2e-b03-b07-c.log`): 351 bestanden, 10 Fehlschläge → Ursachen: Anmeldegrenze je IP bei zwei Workern (Testumgebung), ALTCHA-Rennen, `<noscript>` in Chromium ohne JS, Audit-Lücke, zwei Testannahmen
- E2E Lauf 2 (`e2e-b03-b07-c-2.log`): 360 bestanden, 1 Fehlschlag (Betreff „Mitgliedsantrag“ statt „Mitgliedsanfrage“) → behoben; Nachlauf der betroffenen Specs 6/6 grün
- Lighthouse mobil (`_lauf/belege/lighthouse/2026-10-11-06-17/`, `…-06-20/`): alle 9 Routen P 98–99, A/BP/SEO 100, JS 168,9–172,5 kB (Budget 180), LCP 1,6–1,9 s
- Abweichungen: A-S11b, A-S21, A-S22, A-F01, A-V08, A-V13, A-V14, A-V15 (`web/docs/ABWEICHUNGEN.md`); Entscheidungen E-032–E-034; MENSCHEN M-083–M-087
