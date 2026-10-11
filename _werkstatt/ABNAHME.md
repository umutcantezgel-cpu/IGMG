# ABNAHME – Kriterien Z-01 bis Z-12 (Version 1.0, 2026-10-11)

Je Kriterium: Messweg · Ausgangswert E0 · Zielwert · Stand · Beleg. „Erledigt“ ist nur, was geprüft ist; Kriterien sinken nie still.

| Z | Thema | Messweg | Ausgangswert E0 | Ziel | Stand | Beleg |
|---|---|---|---|---|---|---|
| Z-01 | Plan | Abgleich PLAN.md | 0 von ≈ 45 Pflicht | 100 % Pflicht, Kür bis leer oder Laufzeitende | offen | PLAN.md mit Commit-Kennungen |
| Z-02 | Bestand | Stufe C: Build, Typen, Lint, unit/integration, `sprachen:pruefen`, `geheimnisse:pruefen`, Funktionsliste F-01…F-24 | unit: 4 rot unter UTC (iCal, behoben), sonst grün; Funktionsliste: E0-PRUEFER-03 | mindestens so grün wie E0, keine Funktion schlechter, null neue Konsolenfehler | offen | `protokolle/` |
| Z-03 | Designsystem | `freie-werte.mjs` auf geänderten Dateien + Stichprobe | 617 Funde in 452 Dateien (Bestand) | 0 in geänderten Dateien (ohne UNANTASTBAR/Bildinhalte); jede neue Komponente nutzt das System | offen | Prüfliste |
| Z-04 | Gestaltung | Endprüfer bewertet Nachher-Bilder (Rubrik §10), Blindvergleich mit getrenntem Schlüssel | E0-Bildsatz `$SCRATCHPAD/bilder/e0-basis/` | jede Hauptansicht ≥ 8, keine Kategorie < 7, Nachher überall vorgezogen | offen | Bildsätze, Bewertung |
| Z-05 | Bewegung | Register-Abgleich, `bewegung.mjs` (reduziert, 5 Bilder, 4× Drosselung) | keine Animationen | jede Animation im Register; reduziert ohne Lage/Größe, alles sichtbar; Momente ≤ 5 % verworfene Bilder | offen | Messprotokoll |
| Z-06 | Grafik | `svg-pruefung.mjs` | 3 Inline-SVG, 2 Befunde (Icons.tsx, FehlerAnsicht.tsx) | eine Icon-Familie, alle SVG optimiert und zugänglich, keine doppelten IDs | offen | Prüfliste |
| Z-07 | Zugänglichkeit | axe WCAG 2.2 AA (390/1440), Tastaturdurchlauf Hauptaufgaben | siehe `protokolle/E0-PRUEFER-02-ausgangswerte.md` | 0 ernste/kritische Befunde; Tastatur mit sichtbarem Fokus; Kontraste | offen | Bericht |
| Z-08 | Leistung | Lighthouse mobil Median ×3, 11 (+ Cockpit) Hauptansichten | siehe `protokolle/E0-PRUEFER-02-ausgangswerte.md` | BUDGETS (Perf ≥ 90, A11y 100, BP/SEO ≥ 95, LCP ≤ 2,5 s, CLS ≤ 0,1, INP/TBT ≤ 200 ms, JS ≤ 180 KB gz, Bewegung ≤ 60 KB); keine Ansicht schlechter als E0 − Spanne | offen | Messprotokoll |
| Z-09 | Darstellung | Bildsatz 390/768/1440, Sprachen nach Stufe C (de, tr vollständig; en zwei Ansichten) | E0: kein Querscrollen (siehe Protokoll) | ohne Überlauf, abgeschnittenen oder überlappenden Text | offen | Bildsatz |
| Z-10 | Übergabe | Endprüfung | – | BERICHT, KERN, MENSCHEN, Anleitung Zusammenführen/Zurückrollen vollständig | offen | Dateien |
| Z-11 | Vercel | V-Prüfliste V-01…V-13, Build nach V-02 (preview + production), Vorschau per Vercel-MCP | V-01 teilweise (vercel.json ohne regions/crons/ignoreCommand), Rest offen | alle erfüllt; Vorschau ohne Build-/Laufzeitfehler auf Hauptansichten | offen | Prüfprotokoll, Dateien |
| Z-12 | Recht und Startklar | Prüfsuiten früherer Läufe (soweit vorhanden, L-E03), Wortlaut-Vergleich Rechtstexte, Cockpit, GO-LIVE.md, MENSCHEN.md | Cockpit/startklar/release:check fehlen (L-E02/L-E03) | grün; Wortlaut unverändert bis auf Hosting-Baustein v2; Cockpit mit allen Vercel-Punkten; jede Menschen-Aufgabe mit Ort und Aufwand | offen | Prüfprotokoll, Dateien |

## Ausgangswerte E0 (Kurzfassung, `protokolle/E0-PRUEFER-02-ausgangswerte.txt`)
- 11 Hauptansichten, Port 3100 (9ebb4bc), Lighthouse mobil Median ×3: Performance 85–92 (Spanne je Route 80–94), A11y/BP/SEO 100, LCP 1816–2263 ms, CLS ≤ 0,001, TBT 285–458 ms, JS 168–174,1 kB gz.
- axe WCAG 2.2 AA: 0 Verstöße (390/1440), je 1 „unklar“ auf 8 Routen. Bildsatz: kein Querscrollen; `/nachrichten` 9 (390) bzw. 4 (768) Textelemente ragen über den rechten Rand (ohne Querscrollen).
- **Messbedingung:** gemessen unter Last (Load 2,2–4,5 auf 4 Kernen, Entwicklungsserver parallel). Der frühere Lauf (09:07, ruhig) hatte Performance 98–99. Für Z-08 werden Ausgangsstand (Port 3100) und Nachher in Stufe C **unmittelbar nacheinander unter gleichen, ruhigen Bedingungen** gemessen; maßgeblich ist dieser Paarvergleich, die BUDGETS gelten absolut.

## UMGEBUNGSAUSNAHMEN (mit Ersatz)
- **UA-01 Echte Geräte:** keine Telefone/Tablets in der Cloud → Ersatz: Chromium-Emulation 390/768/1440, Drosselung 4× für Bildraten.
- **UA-02 Docker-E2E:** kein Docker → Ersatz: Postgres 16 per apt (machbar, E0-PRUEFER-01) + Mailpit-Binärdatei; sonst Integrationssuite auf PGlite + Playwright-Rauchtest gegen Standalone-Server mit PGlite.
- **UA-03 Verwaltungsflüsse auf der Vorschau:** Produktion/Vorschau ohne Datenbank und ohne Konten (G3/G5) → Ersatz: Verwaltungsflüsse lokal gegen PGlite (`anmeldung.mjs`), Vorschau nur öffentliche Ansichten.
- **UA-04 Chromium-Version:** Playwright 1.64 erwartet Chromium 156, vorinstalliert ist 141 (Installation nicht erlaubt) → Ersatz: Chromium 141 für alle Läufe, vorher und nachher gleich.

## V-Prüfliste (Stand)
| V | Kurz | Stand |
|---|---|---|
| V-01 | vercel.json ($schema, regions fra1, crons, ignoreCommand), engines/packageManager, .vercelignore | teilweise |
| V-02 | Build wie auf Vercel (preview, production) | offen |
| V-03 | VERCEL-ENV.md, SITE_MODE, Startprüfung, Geheimnisse per Skript | offen |
| V-04 | Postgres Frankfurt, attachDatabasePool, Migration vor Code, keine Prod-DB in Vorschau | offen |
| V-05 | Blob Frankfurt, Direkt-Upload > 4,5 MB, Metadaten-Bereinigung, Varianten | offen |
| V-06 | Cron täglich, CRON_SECRET, idempotent mit Sperre | offen |
| V-07 | gemeinsamer Speicher für Sitzungen, Raten, Sperren | Bestand (DB) – zu belegen |
| V-08 | Caching wie lokal, sofort sichtbar, lange Lebensdauer statischer Dateien | offen |
| V-09 | Vorschau geschützt, teilbarer Link, noindex, Toolbar in Tests ausgenommen | teilweise (Vercel Authentication aktiv) |
| V-10 | Protokolle ohne Personendaten, Health, Backups, Rollback | teilweise (Health vorhanden) |
| V-11 | Verarbeitungsverzeichnis, Hosting-Baustein v2, Cockpit/startklar-Prüfungen | offen |
| V-12 | Tarif-Empfehlung in MENSCHEN | offen |
| V-13 | Runbook VERCEL.md, GO-LIVE.md, Vorschauprüfung je Tor | offen |
