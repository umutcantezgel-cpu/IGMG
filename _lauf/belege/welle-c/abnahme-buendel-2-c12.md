# Abnahme (L1) · Welle C Bündel 2 (C01, C02, C03, C06, C09, C10) und C12 · 2026-10-11

Prüfungen je Paket: (1) Auftrag/Akzeptanz · (2) Muster/Architektur (Recht im Server, Organisationsfilter, Audit ohne Personendaten) · (3) Tests · (4) Texte/Platzhalter · (5) Bericht ehrlich und vollständig. 0–2 Punkte, Freigabe ab 8/10 ohne eine 0.

| Paket | 1 | 2 | 3 | 4 | 5 | Summe | Ergebnis |
|---|---|---|---|---|---|---|---|
| C01 Übersicht (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen |
| C02 Neuigkeiten (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen; Papierkorb serverseitig gesperrt |
| C03 Ankündigungen + öffentlicher Block (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen; meldete Papierkorb-Lücke bei Veranstaltungen (behoben, E-036) |
| C06 Kurse (Haiku) | 2 | 2 | 2 | 2 | 2 | 10 | angenommen |
| C09 Postfach (Haiku) | 2 | 2 | 1 | 2 | 2 | 9 | angenommen; E2E-Spec mit ungültiger Fixture-Signatur und doppeldeutigem Locator (behoben) |
| C10 Tickets (Haiku) | 2 | 2 | 1 | 2 | 2 | 9 | angenommen; E2E-Locator gegen versteckte Vorseite (behoben) |
| C12 Benutzer und Rollen (Orchestrator) | 2 | 2 | 2 | 2 | – | – | Stufe 3; Sperren mit Migration 0005, Hook und zweiter Sicherung; Gegenprobe des Sperrfilters im Mail-Ausgang |

## Orchestrator-Befunde und Nacharbeiten
- Papierkorb-Löschlauf nach 30 Tagen fehlte (C02/C03/C06) → `leerePapierkorb()` im Löschlauf (E-036)
- `speichereVeranstaltung` prüfte den Papierkorb nicht serverseitig (C03/C06) → `fehler: 'imPapierkorb'`
- Passwortwechsel landete über „Anmelden“ auf der Übersicht (neue Sitzung, Neurendern mit altem Cookie; per Diagnose-Spec nachgestellt) → Weiterleitung `/verwaltung/konto?passwort=geaendert`
- Vorbereitung C10b: `pruefeEinsendung()` aus `verarbeiteFormular` herausgelöst (Formular-Integration 43/43 unverändert grün), Empfänger `recht:<aktion>`, Melderdaten-Löschung nach 180 Tagen (E-037)

## Belege
- `pnpm check`: Typen und Lint ohne Befund; Unit 26 Dateien, 450 + 3 erwartete Fehlschläge
- `pnpm test:integration`: 18 Dateien, 355/355; danach Einzelläufe Löschlauf 15/15, Benutzer 14/14
- `pnpm build`: grün (`build-buendel-2*.log`)
- E2E (`e2e-buendel-2b.log`): 378 bestanden, 3 Fehlschläge (Testlocators, Passwort-Weiterleitung) → behoben; Nachlauf (`e2e-nachlauf.log` + Tickets): Benutzer 2/2, Postfach 2/2, Tickets 3/3
- Lighthouse `/nachrichten`, `/tr/haberler`: P 99, A/BP/SEO 100, JS 168,9 kB (`_lauf/belege/lighthouse/2026-10-11-07-09/`)
- Abweichungen A-V01b (aktualisiert), A-V03, A-V04, A-S06b, A-V06, A-V09, A-V10, A-V12; Entscheidungen E-035–E-037; MENSCHEN M-088–M-092
