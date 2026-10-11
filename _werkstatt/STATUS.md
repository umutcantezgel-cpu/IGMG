STATUS · Branch claude/blissful-edison-x3j16w · Etappe 3/5 (E3-Tor ausgewertet im Workflow, HEAD-Bilder in Arbeit) · Welle 9 · Pflicht 50/≈70 · Kür 5/20 · Kriterien 0/12 · Ausnahmen 0 · Bestand grün (Unit 755/755, Integration E3 grün, geheimnisse:pruefen grün seit 8d79ddc) · Vercel grün (Branch-Vorschauen READY) · Nächster Schritt: Auswertung + Bilder → Sichtabnahme-Workflow (frische Opus-Prüfer) → Befundpakete → check auf HEAD → Fast-Forward auf main

# STATUS – Letzter Lauf (Gestaltung + Vercel-startklar)

## Vorhaben in drei Sätzen
1. Die Web-App der IGMG Wetzlar bekommt ein geschärftes Designsystem mit Bewegungs- und SVG-Formsystem, vier große Momente aus echten Inhalten (Tagesbogen der Gebetszeiten, Weg der Gemeinde, Projekt-Meilensteine, Familie der vier Organisationen) und durchgehend gestaltete Zustände – würdevoll, ruhig, schnell.
2. Sie wird so Vercel-startklar, dass Datenbank (Neon, Frankfurt), Speicher (Vercel Blob, Frankfurt), Cron, Vorschau-Schutz und Umgebungsprüfung im Code stehen und nur noch Konten, Werte und Domain von Menschen kommen.
3. Fehlende Startklar-Bausteine des abgebrochenen Release-Laufs (Cockpit, `pnpm startklar`, `pnpm release:check`, SITE_MODE, Umgebungsprüfung) entstehen neu; ein Einwilligungs-Banner entfällt, weil es keine Drittanbieter gibt.

## Einstellungen als Annahmen
- ARBEITSBRANCH `claude/blissful-edison-x3j16w`; geprüfte Stände per Fast-Forward auch auf `main` (Anweisung des Nutzers, L-E01); nie erzwungen.
- Haiku-Plätze 4 (Agent-Werkzeug, Modell haiku); Workflow-Werkzeug mit Parallelität 2 nur für Prüf-Fächer.
- Vercel: lesender Zugang über Vercel-MCP vorhanden (Projekt `igmg`, prj_texCeXPLaac0TJIJguJJxEpMo7Dx, Team team_2CbCrbfjCqDwpPhWm0nOWRT0, Produktion igmg-five.vercel.app).
- Gerätegrößen 390×844 · 768×1024 · 1440×900; Budgets nach AUFTRAG §0.
- Zeitzone der Cloud: UTC; Morgenbericht 07:00 deutsche Zeit = 05:00 UTC (Sommerzeit bis 25.10.).

## Einrichtung (für neu aufgesetzte Umgebungen wiederholen)
1. Node 24: `S=/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad` (oder neuer Scratchpad-Pfad); `curl -sSfL https://nodejs.org/dist/v24.21.0/node-v24.21.0-linux-x64.tar.xz | tar -xJ --strip-components=1 -C $S/node24`; `export PATH=$S/node24/bin:$PATH`.
2. pnpm: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --version` (12.11.2 aus `packageManager`).
3. Abhängigkeiten: `cd web && pnpm install --frozen-lockfile`.
4. Vercel CLI (für V-02): `mkdir -p $S/vcli && cd $S/vcli && npm init -y && npm i vercel@latest`.
5. Prüfwerkzeuge: `_werkstatt/werkzeuge` – Abhängigkeiten nach `$S/werkzeuge-nm` (siehe `_werkstatt/werkzeuge/LIESMICH.md`).
6. Chromium: `/opt/pw-browsers` (vorinstalliert).

## Verlauf (eine Zeile je Stunde)
- 2026-10-11 17:05 UTC · E0 begonnen: _werkstatt angelegt, Auftrag gespeichert.
- 2026-10-11 17:40 UTC · E0: Werkzeuge und Ausgangsstand eingefroren (9ebb4bc, Port 3100); Kundschafter 02/03/05 abgelegt; E2 vorgezogen: Designsystem-Skalen, Bewegungssystem, Tagesbogen (6b15832); H-FIX1 iCal-Zeitzone (65bcb4b).
- 2026-10-11 18:15 UTC · E0 abgeschlossen (Ausgangswerte, LAGEBILD); E1: PLAN, ABNAHME, ADR 0018–0023; E2: alle vier großen Momente (Tagesbogen, Weg der Gemeinde, Meilensteinlinie, Familie der vier), SVG-Formsystem, Styleguide-Spiegel, iCal-Zeitzone und Ganztagstermine; E2-Tor (Stufe B) läuft.
- 2026-10-11 19:10 UTC · L0-Planprüfung eingearbeitet (PLAN 1.1, ABNAHME 1.1); H-A01 Gebetszeiten, H-A02 Veranstaltungen, H-A04 Nachrichten, H-A06 Voranmeldung + Formular-Bausteine fertig; Formular-Integrationstests: Ursache Rechenzeit der ALTCHA-Lösungen (L-E07); E2-Tor maß einen veralteten Build (L-E09, Zwischenspeicher für Builds aus); Welle 4 läuft (Korankurse, Kontakt, Header, Leiste).
- 2026-10-11 19:50 UTC · Alle Ansichtspakete fertig (Gebetszeiten bis Kontakt), Über uns/Projekte/Organisation als Gesamtansichten, Kopf/Fuß/Leiste/Fehlerseiten; Seitenwechsel mit eigenem startViewTransition und Morph Karte → Detail (L-E10, O-13); E2-Tor am sauberen Build wiederholt; geteilter Cache für Inhaltsabfragen (ADR 0024) und direkte Migrationsverbindung; E3-Tor läuft.
- 2026-10-11 20:20 UTC · H-D05 Runbook/ENV gegen Code, V-10 umgesetzt (Datenbankfehler ohne Personendaten, Health-Zeitlimit), H-W02 Bildschirm-Anzeige, H-W03 Verwaltungs-Hülle + 30 Seitenköpfe, Leiste mit fester Breite (kein Verschieben nach Hydrierung) und „morgen“, Startseite volle Terminreihen, Fuß zweispaltig; JS-Vergleich E0/E3 +7,8 kB gz (Grenze 180 kB, H-L01); H-W01 und Kür K-01 laufen.
- 2026-10-11 21:18 UTC · Kür K-01/K-02/K-03/K-08/K-15, H-W01–W03, Suche Wortteile (F-14), Beispielmodus ohne Datenbank (Produktionsbefund 755 Laufzeitfehler), Styleguide-Spiegel, geheimnisse:pruefen grün; Nutzungslimit 20:50–21:10 brach E3-TOR-Bericht und HEAD-Bilder ab – E3-Lauf selbst fertig (20:57), Fortsetzung als Workflow (ultracode); Routen-Cache von 3100 bereinigt.
