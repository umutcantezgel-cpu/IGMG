# Gemeinsames Briefing für Bau-Pakete (Lauf „Gemeinde-Plattform“)

Du baust ein Paket der IGMG-Wetzlar-Web-App (Next.js 16.4, React 19, TypeScript, Tailwind 4, Drizzle, Better Auth,
next-intl). Der freigegebene Plan steht in `_gemeinde/AUFTRAG.md` – lies die Abschnitte, die dein Paket nennt.
Arbeite selbstständig bis zum Ende, ohne Rückfragen; offene Fakten werden Platzhalter in eckigen Klammern.

## Umgebung (einmal je Arbeitsbaum)
```bash
S=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad
export PATH=$S/node24/bin:$PATH        # Node 24.21; pnpm über corepack
cd <arbeitsbaum>/web
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install --frozen-lockfile   # Store ist lokal, geht schnell
pnpm db:bau-vorbereiten                # PGlite-Datenbank .pglite-bau mit Seeds + Koran/Tajwid/Übersetzungen/Bukhari (~30 s)
```
- Entwicklungsserver mit Daten: `PGLITE_VERZEICHNIS=.pglite-bau pnpm dev --port <dein Port>`; nach der Sichtprüfung beenden.
  Sichtprüfung per Playwright (Chromium unter `/opt/pw-browsers`, nie `playwright install`) mit Bildschirmfotos 390 und 1440 px
  in deinen Scratchpad. Lies die Fotos an (Read-Tool) und verbessere, bis es hochwertig aussieht.
- **Nicht** ausführen (das macht der Orchestrator am Tor, die Maschine hat 4 Kerne): `pnpm build`, die ganze Unit-/Integrationssuite,
  die ganze E2E-Suite. Erlaubt: `pnpm typen`, `npx eslint <deine Dateien>`, `npx prettier --write <deine Dateien>`,
  `TZ=UTC npx vitest run --project unit <deine Tests>`, `npx vitest run --project integration <deine Tests>`, `pnpm sprachen:pruefen`.

## Regeln (hart)
1. **Religion:** Du schreibst nie Koranverse, Hadithe, Bittgebete, Übersetzungen, Wortbedeutungen, Tajwid- oder Fiqh-Erklärungen.
   Arabisch nur aus der Datenbank (importierte Dateien in `web/daten/**`) oder aus Unicode-Codepunkten (Alphabet, Harakat).
   Fehlende religiöse Texte: ehrlicher Platzhalter („[Erklärung – von der Lehrkraft, Freigabe ausstehend]“). Öffentlich nur `geprueft`.
2. **Texte** nur aus `messages`: öffentliche Seiten in deiner Bereichsdatei `web/messages/bereiche/<bereich>.json` (`{de,tr,en}`, schon registriert);
   Verwaltung nur Deutsch in `web/messages/verwaltung/<modul>.json` (registrieren in `messages/verwaltung/index.ts`). Türkisch und Englisch
   vollständig schreiben (gute, natürliche Sprache). `pnpm sprachen:pruefen` grün.
3. **Gestaltung:** Farben, Maße, Schriften nur über Tokens in `web/src/app/globals.css` (keine Hex-Werte, keine freien px in Klassen).
   Bestehende Bausteine nutzen (`Seitenrahmen`, `PageHeader`, `Breadcrumbs`, Karten, `Zustandsgrafik`). Formensprache: Achtstern, 24-px-Raster,
   2-px-Strich, keine Mondsichel, keine Kuppel-Grafik, keine hochzählenden Zahlen. Bewegung nur CSS, immer mit `prefers-reduced-motion`-Variante.
4. **Muster:** `web/docs/MUSTER.md` (öffentliche Seiten statisch mit `ensureStatic`, `'use cache: remote'` + `TAG.…`, Client-Inseln ohne next-intl,
   Adressen mit `pfadFuer`, Links mit `@/i18n/link`). Vor Next.js-Code die passende Seite in `node_modules/next/dist/docs/` lesen.
5. **Sicherheit:** Jede Server Action und dynamische Seite prüft serverseitig (`src/lib/rechte/*`). Öffentliche Seiten lesen nie Cookies/Header.
   Keine Drittanbieter, keine Tracker, keine externen Schriften/CDNs. Keine Geheimnisse in Dateien.
6. **Barrierefreiheit:** Klickziele ≥ 48 px, sichtbarer Fokus, `lang`/`dir` an arabischem Text, Tastaturbedienung, `aria`-Namen.
7. **Dateihoheit:** Nur die Dateien deines Pakets. Gemeinsame Dateien (globals.css, routing.ts, messages/{de,tr,en}.json, next.config.ts,
   proxy.ts, package.json, Schema/Migrationen, matrix.ts, module.ts, tags.ts, funktionen.ts, Header.tsx, navigation.ts, Seitenrahmen.tsx)
   nur, wenn dein Paket es ausdrücklich erlaubt – dann minimal und im Abschlussbericht genannt. Routen stehen schon in `src/i18n/routing.ts`.
8. **Tests:** Unit für reine Funktionen (`web/tests/unit/…`), Integration (PGlite) für Server Actions/Queries mit Rechten, E2E-Spec schreiben
   (`web/tests/e2e/…`, läuft der Orchestrator). Neue öffentliche Routen in die Routentabellen von `tests/e2e/barrierefreiheit.spec.ts` und
   `tests/e2e/datenschutz.spec.ts` eintragen.
9. **Commit** im eigenen Arbeitsbaum auf dem eigenen Branch (nicht pushen), Nachricht deutsch, endet mit:
   ```
   Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_016dbB4xQKibKeh2kst9UZWW
   ```
   Kein Modellname sonst in Commits oder Code.

## Abschlussbericht (Antwort an den Orchestrator, knapp)
Branch + Commit-SHA, Dateien, geänderte gemeinsame Dateien, Tests (was lief, Ergebnis), Bildschirmfotos (Pfade), offene Punkte/MENSCHEN-Fragen.
