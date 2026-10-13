# Tor E2 – Protokoll (13.10.2026)

Stand: Branch `claude/trusting-lovelace-6nfolz` ab a0b13d9 (Merges Recht, Hadith, Elifbe, Koran-Leser, Konten/Mein Bereich-Kern,
CMS, Kür A, Lernen-Verwaltung, Koran-Verwaltung; Orchestrator-Arbeiten; S1 behoben) + Beispielmodus-Schutz.

| Prüfung | Ergebnis |
|---|---|
| Typen (`pnpm typen`) | grün |
| Lint (`eslint .`) | grün |
| Unit (`vitest --project unit`) | 1300 grün, 3 erwartet fehlgeschlagen; `speicher-probe` unter Last über 10 s (ohne Last grün) |
| Sprachen (`sprachen:pruefen`) | vollständig (2413 Schlüssel de/tr/en, 3547 Verwaltung) |
| Religion (`religion-pruefung.mjs`) | 0 Befunde (5137 Dateien) |
| Wortlaut (`wortlaut.mjs`, Basis b702c7c) | 0 offene Befunde (Ausnahmen G-01…G-05) |
| S1 Sicherheitsprüfung | 2 hoch, 4 mittel, 7 niedrig → alle behoben (`berichte/S1-sicherheit.md`), Nachweistests grün |
| Startklar (Produktion, Bau-DB) | Funktionsschalter sicher (alles mit Personendaten aus); übrige Fehler = Umgebung/Platzhalter wie im Vorlauf |
| Bau Produktion | grün (1399 Seiten) |
| Integration (`vitest --project integration`) | 1633 grün, 2 erwartet fehlgeschlagen, 4 übersprungen (56 Dateien, 31 min) |
| Befund Beispielmodus | Live und lokal: unbekannte Adressen → 500 statt 404 (ungeschützter Datenbankzugriff beim dynamischen Rendern: Einstellungen, Menüs über `zeitplanLebensdauer`, Seiteninhalte, Seiten, Veranstaltungen, Nachrichten, Wissen, Koran, Suche). Behoben durch `datenbankVerfuegbar()`-Schutz in den Ladern (2d46c6c, 1025d7e, 2bede6f, eceffd3). |
| Nachweis Beispielmodus | `next start` mit SITE_MODE=produktion ohne DATABASE_URL: 61 öffentliche Adressen (`scratchpad/pruefe-404.sh`) nur 200/404, 0 Serverfehler im Protokoll. Konto-Seiten mit ausgeschaltetem Schalter zeigen „Seite nicht gefunden“ im gestreamten Inhalt (Status 200, noindex) – Verhalten von Next.js bei `notFound()` innerhalb von Suspense. |
| Nachtrag Zusammenführung E3 (f8b6221) | Typen, Lint grün; Unit 1345 grün nach Nachtrag `AUDIO_BLOB_READ_WRITE_TOKEN` (36902f1) |
| E2E-Ersatzlauf öffentlich (`playwright.lokal.config.ts`, 3 Worker, telefon + desktop, gegen `next start` Produktion/Beispielmodus) | 684 grün, 10 übersprungen, 8 rot: Suche ×6 (Beispielmodus ohne Datenbank liefert absichtlich keine Treffer) und Wortkarte → Tajwid-Leiste ×2 (Testfehler: `getByText('Tajwid-Regel')` traf auch „Alle Tajwid-Regeln“). Nach Testkorrektur (`exact: true`) gegen denselben Bau mit Datenbank zur Laufzeit (BAU_PGLITE=1): suche + quran-leser 20/20 grün |
| Fast-Forward `main` | 8cbd2a6 (auf Wunsch des Nutzers, 13.10. 15:30 UTC); Vercel-Bereitstellung `dpl_62xCBiUubwEgaDqn3mh5bQmS1DP8` nach 160 s live, `/gibt-es-nicht` 404 statt 500 |

