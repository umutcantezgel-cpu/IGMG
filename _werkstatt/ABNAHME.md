# ABNAHME – Kriterien Z-01 bis Z-12 (Version 1.1, 2026-10-11)

Änderungen gegenüber 1.0 (L0-Planprüfung): Z-03 nach REFERENZ §5, Z-04 mit den sechs Kategorien, Z-12 nach L-E02, Belegpfade `.txt`, V-Prüfliste mit Stand.

Je Kriterium: Messweg · Ausgangswert E0 · Zielwert · Stand · Beleg. „Erledigt“ ist nur, was geprüft ist; Kriterien sinken nie still.

| Z | Thema | Messweg | Ausgangswert E0 | Ziel | Stand | Beleg |
|---|---|---|---|---|---|---|
| Z-01 | Plan | Abgleich PLAN.md | 0 von ≈ 69 Pflicht (PLAN 1.1) | 100 % Pflicht, Kür bis leer oder Laufzeitende | offen | PLAN.md mit Commit-Kennungen |
| Z-02 | Bestand | Stufe C: Build, Typen, Lint, unit/integration, `sprachen:pruefen`, `geheimnisse:pruefen`, Funktionsliste F-01…F-24 | unit: 4 rot unter UTC (iCal, behoben), sonst grün; Funktionsliste: E0-PRUEFER-03 | mindestens so grün wie E0, keine Funktion schlechter, null neue Konsolenfehler | offen | `protokolle/` |
| Z-03 | Designsystem | `freie-werte.mjs` auf geänderten Dateien + Stichprobe | 617 Funde in 452 Dateien (Bestand) | 0 Funde in jeder geänderten Datei (nicht nur „0 neue“; ohne UNANTASTBAR/Bildinhalte, Fehlalarme begründet), Stufe A je Paket; jede neue Komponente nutzt das System | offen | Prüfliste |
| Z-04 | Gestaltung | Endprüfer bewertet Nachher-Bilder (Rubrik §10: Typografie, Komposition, Farbe und Bild, Bewegung, Grafik, Details; Ansichtswert = Mittel der sechs), Blindvergleich mit getrenntem Schlüssel | E0-Bildsatz `bilder/e0/` (reduziert: `bilder/e0-reduziert/`) | jede Hauptansicht ≥ 8, keine Kategorie < 7, Nachher überall vorgezogen | offen | Bildsätze, Bewertung |
| Z-05 | Bewegung | Register-Abgleich, `bewegung.mjs` (reduziert, 5 Bilder, 4× Drosselung) | keine Animationen | jede Animation im Register; reduziert ohne Lage/Größe, alles sichtbar; Momente ≤ 5 % verworfene Bilder | offen | Messprotokoll |
| Z-06 | Grafik | `svg-pruefung.mjs` | 3 Inline-SVG, 2 Befunde (Icons.tsx, FehlerAnsicht.tsx) | eine Icon-Familie, alle SVG optimiert und zugänglich, keine doppelten IDs | offen | Prüfliste |
| Z-07 | Zugänglichkeit | axe WCAG 2.2 AA (390/1440), Tastaturdurchlauf Hauptaufgaben | siehe `protokolle/E0-PRUEFER-02-ausgangswerte.txt` | 0 ernste/kritische Befunde; Tastatur mit sichtbarem Fokus; Kontraste | offen | Bericht |
| Z-08 | Leistung | Lighthouse mobil Median ×3, 11 (+ Cockpit) Hauptansichten | siehe `protokolle/E0-PRUEFER-02-ausgangswerte.txt` | BUDGETS (Perf ≥ 90, A11y 100, BP/SEO ≥ 95, LCP ≤ 2,5 s, CLS ≤ 0,1, INP/TBT ≤ 200 ms, JS ≤ 180 KB gz, Bewegung ≤ 60 KB); keine Ansicht schlechter als E0 − Spanne | offen | Messprotokoll |
| Z-09 | Darstellung | Bildsatz 390/768/1440, Sprachen nach Stufe C (de, tr vollständig; en zwei Ansichten) | E0: kein Querscrollen (siehe Protokoll) | ohne Überlauf, abgeschnittenen oder überlappenden Text | offen | Bildsatz |
| Z-10 | Übergabe | Endprüfung | – | BERICHT, KERN, MENSCHEN, Anleitung Zusammenführen/Zurückrollen vollständig | offen | Dateien |
| Z-11 | Vercel | V-Prüfliste V-01…V-13, Build nach V-02 (preview + production), Vorschau per Vercel-MCP | V-01 teilweise (vercel.json ohne regions/crons/ignoreCommand), Rest offen | alle erfüllt; Vorschau ohne Build-/Laufzeitfehler auf Hauptansichten | offen | Prüfprotokoll, Dateien |
| Z-12 | Recht und Startklar | Vorhandene Prüfsuiten (L-E03) plus `pnpm startklar`/`pnpm release:check`, Wortlaut-Snapshot Rechts- und Einwilligungstexte (H-R01), Cockpit, GO-LIVE.md, MENSCHEN.md. Prüfungen eines Einwilligungs-Managers entfallen: Es gibt keinen (L-E02, ML-01) | Cockpit/startklar/release:check fehlen (L-E02/L-E03) | grün; Wortlaut unverändert bis auf Hosting-Baustein v2 (als Entwurf, nicht eingespielt); Cockpit mit allen Vercel-Punkten; jede Menschen-Aufgabe mit Ort und Aufwand | offen | Prüfprotokoll, Dateien |

## Ausgangswerte E0 (Kurzfassung, `protokolle/E0-PRUEFER-02-ausgangswerte.txt`)
- 11 Hauptansichten, Port 3100 (9ebb4bc), Lighthouse mobil Median ×3: Performance 85–92 (Spanne je Route 80–94), A11y/BP/SEO 100, LCP 1816–2263 ms, CLS ≤ 0,001, TBT 285–458 ms, JS 168–174,1 kB gz.
- axe WCAG 2.2 AA: 0 Verstöße (390/1440), je 1 „unklar“ auf 8 Routen. Bildsatz: kein Querscrollen; `/nachrichten` 9 (390) bzw. 4 (768) Textelemente ragen über den rechten Rand (ohne Querscrollen).
- **Messbedingung:** gemessen unter Last (Load 2,2–4,5 auf 4 Kernen, Entwicklungsserver parallel). Der frühere Lauf (09:07, ruhig) hatte Performance 98–99. Für Z-08 werden Ausgangsstand (Port 3100) und Nachher in Stufe C **unmittelbar nacheinander unter gleichen, ruhigen Bedingungen** gemessen; maßgeblich ist dieser Paarvergleich, die BUDGETS gelten absolut.

## UMGEBUNGSAUSNAHMEN (mit Ersatz)
- **UA-01 Echte Geräte:** keine Telefone/Tablets in der Cloud → Ersatz: Chromium-Emulation 390/768/1440, Drosselung 4× für Bildraten.
- **UA-02 Docker-E2E:** kein Docker → Ersatz: Postgres 16 per apt (machbar, E0-PRUEFER-01) + Mailpit-Binärdatei; sonst Integrationssuite auf PGlite + Playwright-Rauchtest gegen Standalone-Server mit PGlite.
- **UA-03 Verwaltungsflüsse auf der Vorschau:** Produktion/Vorschau ohne Datenbank und ohne Konten (G3/G5) → Ersatz: Verwaltungsflüsse lokal gegen PGlite (`anmeldung.mjs`), Vorschau nur öffentliche Ansichten.
- **UA-04 Chromium-Version:** Playwright 1.64 erwartet Chromium 156, vorinstalliert ist 141 (Installation nicht erlaubt) → Ersatz: Chromium 141 für alle Läufe, vorher und nachher gleich.

## V-Prüfliste (Stand 2026-10-12 04:50 UTC; Beleg der Endprüfung: `berichte/STUFE-C.md`, Schritt 10/11)
| V | Kurz | Stand |
|---|---|---|
| V-01 | vercel.json ($schema, regions fra1, crons, ignoreCommand), engines/packageManager, .vercelignore | erfüllt (0c224da; per `validateConfig` der CLI geprüft) – Bestätigung im E2-TOR |
| V-02 | Build wie auf Vercel (preview, production) | erfüllt je Fast-Forward (`vercel build --prod` in Archivkopie: 8da8efe, 25e8040, 6596a6e, f44119b, 560161e; Protokolle `$SCRATCHPAD/ff/vorab-*.log`); Endstand preview + production in Stufe C Schritt 10 |
| V-03 | VERCEL-ENV.md, SITE_MODE, Startprüfung, Geheimnisse per Skript | erfüllt (c596742, 263cd1d, 0cd8173) – Beleg Stufe C |
| V-04 | Postgres Frankfurt, attachDatabasePool, Migration vor Code, keine Prod-DB in Vorschau | Code erfüllt (0c224da, Sperre lokal 8/8); Konto: Menschen (ML) |
| V-05 | Blob Frankfurt, große Uploads, Metadaten-Bereinigung, Varianten | Code erfüllt (47ed617; Verkleinern im Browser statt Direkt-Upload, ADR 0020 rev.) |
| V-06 | Cron täglich, CRON_SECRET, idempotent mit Sperre | erfüllt (c596742, 0c224da) |
| V-07 | gemeinsamer Speicher für Sitzungen, Raten, Sperren | erfüllt (Bestand in der DB; Beleg `protokolle/H-V07-V10-pruefung.md`) |
| V-08 | Caching wie lokal, sofort sichtbar, lange Lebensdauer statischer Dateien | erfüllt (Cache-Header abd187e, ADR 0024 d26e8bc; „sofort sichtbar“ 18/18 `berichte/H-V08.md`) |
| V-09 | Vorschau geschützt, teilbarer Link, noindex, Toolbar in Tests ausgenommen | erfüllt im Code (noindex 263cd1d, CSP ohne Toolbar); Vercel Authentication im Projekt aktiv (MCP 11.10.); teilbarer Link: Menschen (ML-23) |
| V-10 | Protokolle ohne Personendaten, Health, Backups, Rollback | erfüllt (`protokolle/H-V07-V10-pruefung.md`, `lib/db/fehler.ts`, Health mit Zeitlimit 352d1bb, Runbook §§ 12–13, 16; ML-14–16) |
| V-11 | Verarbeitungsverzeichnis, Hosting-Baustein v2, Cockpit/startklar-Prüfungen | erfüllt als Entwurf (0cd8173, 8df9556); Freigabe: Menschen (ML-11, ML-12) |
| V-12 | Tarif-Empfehlung in MENSCHEN | erfüllt (ML-09) |
| V-13 | Runbook VERCEL.md, GO-LIVE.md, Vorschauprüfung je Tor | Dokumente erfüllt (290aaeb, f08432e); Produktion je Fast-Forward per Vercel-MCP gelesen (READY; zuletzt 71e263f, dpl_5Tvd5XVW2BYimH1u2Bos6MeHBMa3). Das Laufzeitprotokoll zeigt seit 11.10. 19:28 UTC keine Ausnahmefehler, nur die gewollten Meldungen der Startprüfung über fehlende Menschen-Werte. Vorschau des Arbeitsbranchs e0c8e9f READY in fra1 (`protokolle/C-vercel-mcp.md`) |
