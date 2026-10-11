# ENTSCHEIDUNGEN – Release-Lauf „Startklar machen“

Jede Entscheidung mit Datum. Folgenreiche Entscheidungen stehen zusätzlich als ADR in `web/docs/adr/` (ab 0018). Die Entscheidungen E-001 bis E-043 des Aufbau-Laufs (`_lauf/ENTSCHEIDUNGEN.md`) gelten weiter, soweit hier nichts anderes steht.

**R-E01 · 2026-10-11 · Git: main + push (Nutzerantwort)**
- Ersetzt „Zweig release, Push: AUS“ aus Abschnitt 0.
- Jedes abgenommene Paket bekommt einen Commit (Abschluss `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`) und `git push origin main`.
- Am Ende kommt der annotierte Tag `v1.0.0-rc.1`, ebenfalls gepusht.
- Kein Force-Push, kein Umschreiben der Geschichte, kein `--no-verify`. Gestapelt werden nur abgenommene Pfade.

**R-E02 · 2026-10-11 · Übergang vom Aufbau-Lauf (Nutzerantwort „alles nach main pushen und weiter“)**
- Die laufenden Pakete (C11b, D-Q1, D-Q23, D-O13, D-O4, C17) werden fertiggestellt, geprüft und als Endstand des Aufbau-Laufs nach main gepusht.
- Was der Aufbau-Lauf offen lässt, wird Befund im Startklar-Audit: Z-Belege, Tor D, D-Ü, D-T1, C19, H01–H07 und die Befunde aus C17 und D-O4.

**R-E03 · 2026-10-11 · Ordner**
- `igmg-wetzlar/` ≙ Workspace-Wurzel; `bestand/` ≙ `uploads/igmg-wetzlar-website/`; `design/` ≙ Wurzel-Dateien (E-001).
- `_lauf/` ist ab P0 nur lesbar. Geschrieben wird nur in `web/` und `_lauf/release/`.

**R-E04 · 2026-10-11 · `~/Downloads/CLAUDE.md` gehört zu einem anderen Projekt (Coday)**
- Wird ignoriert; jeder Agentenauftrag sagt das.

**R-E05 · 2026-10-11 · Agenten**
- Haiku 5.5 mit höchster Denkstufe über Workflow-Skripte, Pool 6.
- Opus-Unteragent nur für Stufe 3 bei Kontextdruck und einmal für die unabhängige Prüfung in P6.

**R-E06 · 2026-10-11 · Entwicklungsserver**
- Ein Server auf `http://localhost:3000`, gestartet vom Orchestrator. Agenten starten keinen eigenen und verwenden localhost, nicht 127.0.0.1 (dort hydriert der Dev-Server nicht).
- Build und volle Suiten laufen nur bei Testläufern an Toren.

**R-E07 · 2026-10-11 · Werkzeuge (Nutzerfreigabe)**
- `docker pull caddy:2-alpine` und `docker pull ghcr.io/zaproxy/zaproxy:stable`.
- SBOM über `pnpm sbom --sbom-format cyclonedx`, Lizenzen über `pnpm licenses list --json`, PDF über das vorhandene Playwright-Chromium. Keine weiteren Downloads.

**R-E08 · 2026-10-11 · Next.js-Sicherheitspatch (angekündigt für 14.10.2026)**
- Prüfung von `pnpm view next version` täglich und vor jedem Tor (11.10.: 16.4.0).
- Sobald der Patch erscheint, kommt ein Sofortpaket mit erneuter Grundlinie. Der Tag `rc.1` folgt erst danach, falls der Patch bis zur Abnahme erscheint; sonst bleibt ein Cockpit-Punkt offen.

**R-E09 · 2026-10-11 · Öffentliches Repo (Nutzerantwort „alles öffentlich pushen“)**
- TOM, DSFA-Entwurf, Abläufe, VORSTAND und Rechtstext-Entwürfe werden öffentlich gepusht.
- Sicherheitsunterlagen sind allgemein formuliert, ohne konkrete Schwachstellen, interne Hostnamen oder Zugangswege.
- Offene Sicherheitsbefunde stehen nur ohne Ausnutzungsdetails in Dateien, bis sie behoben sind.
- Echte Stammdaten kommen nur über die Verwaltung (Datenbank) in die App, nie ins Repo.

**R-E10 · 2026-10-11 · Last-Regel („schwere Spur“)**
- Build, E2E, Lighthouse, ZAP und `docker build` laufen maschinenweit nur einzeln (`web/scripts/schwer.mjs`: Sperrdatei, Lastgrenze) und nur durch Testläufer bzw. Orchestrator.
- Baumeister nutzen `tsc`, `eslint`, `prettier` und einzelne Vitest-Dateien, höchstens 2 parallel.
- E2E läuft mit 1 Worker, wenn die Last über 10 liegt.
- Ein Test, der erst bei Wiederholung grün wird, ist ein Flake-Befund und kein Grün.
- Grund: Unter Last (Load 34) liefen 5 Verwaltungs-E2E in Zeitüberschreitungen, und `igmg_e2e` wird je Lauf gelöscht.

**R-E11 · 2026-10-11 · KERN 2.0**
- K-21 bis K-32 aufgenommen.
- K-03 um `/meldung` (besteht seit E-034) und `/barrierefreiheit` (K-28/R3) ergänzt.
- G-01 bis G-10 aus dem Auftrag ersetzen die Grenzen von KERN 1.1; Abweichung bei G-01 durch R-E01.

**R-E12 · 2026-10-11 · Ordner „IGMG Wetzlar Moschee Website (1)“ (Hinweis des Nutzers)**
- **Was es ist:** der ursprüngliche Figma-Make-Export, als WhatsApp-ZIP geliefert und in die Workspace-Wurzel gelegt. Er wird nur gelesen und nie ausgeführt.
- **Abgleich:** Komponenten und Texte sind identisch mit dem Bestand `uploads/igmg-wetzlar-website/`.
- **Neu darin:**
  - `ATTRIBUTIONS.md`: shadcn/ui unter MIT, Fotos von Unsplash unter Unsplash-Lizenz. Das ist Beleg für das Prüffeld R13.
  - der öffentliche Link auf das Figma-Projekt im README;
  - die vier Logos, als dieselben 40×40-Bilder, nur stärker komprimiert. M-016 (größere Logo-Dateien) bleibt offen.
- **Repo:** Der Ordner kommt nicht ins Repo, weil nur `web/` und `_lauf/` versioniert werden.

**R-E13 · 2026-10-11 · Messwerkzeuge schreiben nur nach `_lauf/release/` (G-01)**
- `web/scripts/messen.mjs` legt Lighthouse-Ergebnisse jetzt unter `_lauf/release/belege/lighthouse/<zeit>/` ab statt unter `_lauf/belege/`. Die vollen Berichte bleiben lokal (`_lauf/release/.gitignore`).
- Neu: `web/scripts/inventar.mjs` (I00) besucht alle öffentlichen Routen in drei Sprachen ohne Klick und hält Endgerätezugriffe, Anfragen, Metadaten, Kopfzeilen, axe und Links fest. Ausgabe: `_lauf/release/eingang/I00-inventar.{md,json}`. Das Skript dient später als Gegenprobe für T10/T11 (Speicher-Tabelle gegen beobachtete Speicher).
- Probe gegen den Dev-Server: Auf jeder Seite meldet React eine Hydration-Abweichung beim Attribut `open`. Vermutete Ursache ist das Vorab-Skript des Konzept-Hinweises. Das geht als Hinweis an R1a/R4.
