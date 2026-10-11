# Entscheidungen

Routine-Entscheidungen stehen hier kurz; folgenreiche zusätzlich als ADR (`web/docs/adr/` (bis P2 in `_lauf/adr/`)).
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

**E-012 · 2026-10-11 · KERN 1.1 – K-03 um `/suche` und `/offline` ergänzt**
Welle D verlangt eine Suche (ADR 0013), K-15 eine Offline-Seite; beide Adressen fehlten in K-03. Lokalisiert: `/suche` → tr `/arama`, en `/search`; `/offline` in allen Sprachen gleich. Keine weitere Änderung am Kern.

**E-013 · 2026-10-11 · ADRs 0002–0007, 0010–0016 angenommen (P1)**
Mehrsprachige Inhalte als JSONB (0002), eigene Rollentabelle statt Better-Auth-Organisationen (0003), Caching-Grenzen (0004), ein verschlüsseltes Eingangsmodul (0005), Tiptap-JSON (0006), Speicher-Adapter (0007), Push-Schutz (0010), Mailpit/Datei-Transport (0011), getrennte CSP öffentlich/Verwaltung (0012), PostgreSQL-Volltext (0013), lokale Schriftdateien (0014), Seeds mit Kennzeichnung (0015), Verwaltung nur Deutsch (0016). 0008 und 0009 folgen nach der Quellenrecherche.

**E-014 · 2026-10-11 · ADR 0008 (Gebetszeiten) und 0009 (Quran) angenommen**
Gebetszeiten: Import verbindlich, bis dahin adhan „Turkey“, Shafi, SeventhOfTheNight, Imsak = Fajr, sichtbar „berechnet“, Qibla ≈ 128,3°. Quran: Tanzil-Text nur nach menschlicher Zustimmung zu den Nutzungsbedingungen (M-036) per Import-Skript; bis dahin Platzhalter. Der Al-Fatiha-Text aus dem Bestand wird nicht verwendet (keine Quellenangabe, G-06).

**E-015 · 2026-10-11 · Standalone-Server mit HOSTNAME=0.0.0.0**
Befund im Fundament: Mit `HOSTNAME=127.0.0.1` bzw. `localhost` behandelt der standalone-Server von Next.js 16.4 die Rewrites von next-intl (Standardsprache ohne Präfix) bei abweichendem Host als externe Ziele → Weiterleitungsschleife (307 auf sich selbst). Mit `HOSTNAME=0.0.0.0` (wie im Docker-Image) bleiben die Rewrites intern; geprüft mit Host `localhost`, `127.0.0.1` und einem fremden Host-Header. Festlegung: Start-Skript und Dockerfile setzen `HOSTNAME=0.0.0.0`; BETRIEB.md nennt das als Pflicht.

**E-016 · 2026-10-11 · Stichprobe der Kundschafter-Blätter (P0.4) bestanden**
Drei Blätter, je drei Angaben gegen die Quelle geprüft:
- S04 (Veranstaltungen): `event.2.desc` = Events.tsx:178 ✓ · „Kommende Events“ = Events.dc.html:28 ✓ · sieben Kategorie-Schalter (:23–25, :51) ✓
- S11 (Kontakt): `contact.subtitle` de/tr/en = Contact.tsx:25/81/137 ✓ · `[Adresse]` als Designplatzhalter, Bestand als Beispielwert ✓ · Kartenknopf „Google Maps“ sprachunabhängig (Contact.tsx:257) ✓
- S20 (Voranmeldung): „Bitte füllen Sie die markierten Pflichtfelder aus.“ in FormWizard.dc.html ✓ · vier Schritte ✓ · Einwilligung ohne Link auf eine Erklärung (StudentRegistration.tsx:600 ff.) ✓
Kein Fehler → kein Blatt muss neu erstellt werden. Qualität der Blätter: Texte wörtlich mit Fundstelle, Personennamen als Platzhalter (A5) eingehalten.

**E-017 · 2026-10-11 · ADR 0017: Image-Bau gegen PGlite-Bau-Datenbank, frische Inhalte beim Start**
Der Docker-Bau scheiterte zunächst, weil `src/lib/db` beim Import verband. Jetzt: Verbindung erst beim ersten Zugriff; Bau mit `BAU_PGLITE=1` gegen eine PGlite-Datenbank aus Migrationen + Seeds; beim Start verfallen alle Inhalts-Tags (Prüfauftrag D04). Der Namensraum `verwaltung` wird immer aus `de.json` geladen (verhindert Prerender-Fehler der tr/en-Varianten der Verwaltungsseiten).

**E-018 · 2026-10-11 · Uhrzeiten in allen Sprachen im 24-Stunden-Format**
Deutsch „18:30 Uhr“ (Design D-10); Türkisch und Englisch „18:30“ ohne Zusatz (Bestand und Design liefern keine Fassung; 24-Stunden-Format ist in der Türkei üblich und für eine Gemeinde in Deutschland eindeutig). Umsetzung `src/lib/i18n/format.ts`, Prüfung in `tests/unit/i18n.test.ts`.

**E-019 · 2026-10-11 · Tor P2 bestanden; E2E bekommt eine eigene Datenbank**
Testläufer-Bericht `_lauf/belege/tore/tor-p2.md`: check, Integration, Build, E2E „Anmelden mit Zwei-Faktor“ (4/4), Startseite in drei Sprachen mit korrektem `lang`, Sicherheits-Header, kein Set-Cookie – alles grün. Befund des Testläufers: Die E2E-Läufe legen Einladungen/Testkonten in der Entwicklungsdatenbank an. Festlegung: E2E nutzt ab P3 eine eigene Datenbank `igmg_e2e` im selben PostgreSQL-Container (`E2E_DATABASE_URL`), die vor jedem Lauf frisch migriert und geseedet wird (Playwright globalSetup).
