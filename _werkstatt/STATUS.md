STATUS · Branch claude/blissful-edison-x3j16w · Etappe 0/5 · Welle 0 · Pflicht 0/– · Kür 0/– · Kriterien 0/12 · Ausnahmen 0 · Bestand grün · Vercel grün (Produktion ohne DB) · Nächster Schritt: E0 Einrichtung und Erkundung

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
