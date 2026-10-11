# Entscheidungen

Routine-Entscheidungen stehen hier kurz; folgenreiche zusätzlich als ADR (`_lauf/adr/` bis P2, danach `web/docs/adr/`).
Format: Kennung · Datum · Quelle · Entscheidung · Grund.

## Nutzer-Festlegungen (überschreiben den Auftrag)

**E-001 · 2026-10-11 · Nutzer („der Workspace ist alles, was wir haben!“) · Projektort = Workspace**
Workspace `/Users/umurey/Downloads/IGMG Wetzlar Website Design`. Logische Zuordnung ohne Verschieben:
design/ ≙ Wurzel (*.dc.html, tokens/, assets/, readme.md, SKILL.md, support.js, styles.css); bestand/ ≙ `uploads/igmg-wetzlar-website/`. Zweitkopie `uploads/IGMG_Wetzlar_Website_Code/` und `uploads/IGMG Wetzlar Moschee Website.make` nur als Referenz. Geschrieben wird nur in `web/` und `_lauf/` (plus `.git/`). Kein `UEBERGABE.md` vorhanden – das Bündel liegt bereits exportiert vor, der Ladeschritt aus Abschnitt 7 entfällt.

**E-002 · 2026-10-11 · Nutzer („irrelevant, fang an“) · ~/Downloads/CLAUDE.md wird ignoriert**
Die Datei beschreibt ein anderes Projekt (Coday-Bildverarbeitung) und wird nie ausgeführt. Jeder Agentenauftrag enthält den Hinweis; `web/CLAUDE.md` wiederholt ihn.

**E-003 · 2026-10-11 · Nutzer · Docker darf gestartet werden**
Docker Desktop per `open -a Docker`. Bis PostgreSQL in Docker läuft: PGlite. Lizenz-/Anmeldedialoge übernimmt der Nutzer.

**E-004 · 2026-10-11 · Nutzer („arbeite immer nur im Main und push immer alles“) · Git nur main, immer pushen**
Repository in der Workspace-Wurzel (design + bestand + web + _lauf), Zweig `main`, Remote `origin = https://github.com/umutcantezgel-cpu/IGMG.git`. Nach jedem abgenommenen Paket Commit und `git push origin main`. Ersetzt „Arbeitszweig aufbau“ und „Push: AUS“ aus Abschnitt 0 sowie „kein git push“ aus G-01. Weiterhin: kein Force-Push, kein Umschreiben der Geschichte.

**E-005 · 2026-10-11 · Orchestrator (mit Plan freigegeben) · Schutz für das öffentliche Repository**
`gh repo view` zeigt `visibility: PUBLIC`. Daher: (a) `uploads/IGMG Wetzlar Moschee Website.make` (vollständiger Figma-Make-Chat mit Konto-IDs) bleibt über `.git/info/exclude` draußen, bis der Nutzer sie freigibt; (b) Pre-Push-Prüfung auf Geheimnisse, `.env*` (außer `.env.example`), PGlite-Daten, Mail-Ausgaben, Formulardaten; (c) Personennamen aus dem Bestand nicht in Seeds, sondern `[Name – Funktion]`, Originalwerte zur Bestätigung in MENSCHEN.md; (d) Empfehlung an den Nutzer, das Repo privat zu stellen (M-002).

## Laufentscheidungen

**E-006 · 2026-10-11 · pnpm über corepack nach ~/.local/bin**
`/usr/local/bin` gehört root; `corepack enable --install-directory ~/.local/bin pnpm` ohne sudo. Version beim Einrichten: pnpm 12.11.2. Alle Befehle setzen `PATH="$HOME/.local/bin:$PATH"`.

**E-007 · 2026-10-11 · ADR-Ablage bis P2 in `_lauf/adr/`**
`create-next-app` verlangt einen leeren Zielordner; ADRs ziehen in P2 per `git mv` nach `web/docs/adr/`.

**E-008 · 2026-10-11 · Haiku-Pakete als Workflow-Skripte**
Unteragenten laufen als Workflow mit `model: 'haiku'`, `effort: 'max'`, Pool mit genau 6 gleichzeitigen Agenten. Gemeinsamer Arbeitsbaum ohne Worktrees; Dateihoheit verhindert Konflikte.

**E-009 · 2026-10-11 · Orchestrator (nach Blockade durch die Sicherheitsprüfung „PII“) · Nur web/ und _lauf/ im Repository**
Das Einchecken des ganzen Workspace in das öffentliche Repo wurde von der automatischen Sicherheitsprüfung wegen Personendaten blockiert (Bestand und Design enthalten Namen aus Figma Make, teils möglicherweise echte Vorstandsnamen). Sicherere Form von E-004: Das Repository in der Wurzel versioniert über `.git/info/exclude` nur `web/` und `_lauf/`; Bestand und Design bleiben lokal und werden nur gelesen. MENSCHEN.md nennt keine Personennamen, sondern Fundstellen. Ob Bestand und Design doch ins Repo sollen, steht als M-003 in MENSCHEN.md.

**E-010 · 2026-10-11 · Bildbelege bleiben lokal**
Bildreferenzen und App-Bildschirmfotos (`_lauf/belege/**/*.png`) werden nicht versioniert: Sie sind groß (Hunderte Bilder) und zeigen Beispielnamen aus dem Design – im öffentlichen Repo unerwünscht (E-005/E-009). Versioniert werden die Berichte (`index.json`, Prüfberichte) mit Dateinamen; die Bilder lassen sich mit `_lauf/werkzeuge/referenz/render.mjs` jederzeit neu erzeugen.

**E-011 · 2026-10-11 · Lichtung (c) gelungen – Bildreferenzen per Hülle**
Die Artboards sind 1280 px breit gebaut; eine direkte 390-px-Ansicht zeigt das Desktop-Layout. Das Werkzeug `_lauf/werkzeuge/referenz/render.mjs` bindet jedes Artboard wie 08/09 per `dc-import` in einen Rahmen fester Breite (390 bzw. 1440 px) ein und setzt Eigenschaften als Attribute (kebab-case). React 18.3.1 von unpkg wird lokal zwischengespeichert (gleiche Bytes, SRI gültig); Google Fonts werden beim Rendern geladen. Probe: Events bei 390/1440 und state=leer ohne Fehler.
