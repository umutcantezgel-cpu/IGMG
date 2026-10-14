# C-e2e · E2E-Suite gegen den Endstand f2a5f8d (Port 3700)

Prüfer: Haiku 5.5 nach E2E-Briefing (Scratchpad `e2e-brief.md`). Worktree `bau-head/web` auf f2a5f8d, `.next/standalone` frisch gebaut, nicht umgestellt. Keine Änderung an web/src oder Tests, kein Commit, kein Push.
Konfiguration: 2 Worker, Projekte `telefon` (Pixel 7, 390 px) und `desktop` (1440 px), Chromium über Umgebungsbrücke (siehe Einrichtung). Lauf 1 (Vollauf): 1195 s Wanduhr.

## Ergebnis Lauf 1 (Vollauf)

Gesamt: 538 bestanden, 19 fehlgeschlagen, 61 übersprungen, 0 flaky (618 Tests).

| Spec-Datei | Projekt | bestanden | fehlgeschlagen | übersprungen | Dauer (s) |
|---|---|--:|--:|--:|--:|
| barrierefreiheit.spec.ts | desktop | 69 | 0 | 0 | 326.7 |
| barrierefreiheit.spec.ts | telefon | 69 | 0 | 0 | 301.7 |
| bilder-an-inhalten.spec.ts | desktop | 1 | 0 | 0 | 16.6 |
| bilder-an-inhalten.spec.ts | telefon | 0 | 0 | 1 | 0.3 |
| datenschutz.spec.ts | desktop | 74 | 0 | 0 | 310.8 |
| datenschutz.spec.ts | telefon | 70 | 0 | 4 | 311.7 |
| formular-kontakt.spec.ts | desktop | 1 | 0 | 0 | 33.2 |
| formular-kontakt.spec.ts | telefon | 0 | 0 | 1 | 0.2 |
| formular-meldung.spec.ts | desktop | 1 | 0 | 0 | 23.8 |
| formular-meldung.spec.ts | telefon | 0 | 0 | 1 | 0.2 |
| formular-mitgliedsantrag.spec.ts | desktop | 0 | 1 | 0 | 34.2 |
| formular-mitgliedsantrag.spec.ts | telefon | 0 | 0 | 1 | 0.3 |
| formular-moschee-anfrage.spec.ts | desktop | 1 | 0 | 1 | 21.7 |
| formular-moschee-anfrage.spec.ts | telefon | 1 | 0 | 1 | 1.3 |
| formular-veranstaltungsanmeldung.spec.ts | desktop | 1 | 0 | 0 | 39.7 |
| formular-veranstaltungsanmeldung.spec.ts | telefon | 0 | 0 | 1 | 0.2 |
| formular-voranmeldung.spec.ts | desktop | 0 | 1 | 0 | 34.4 |
| formular-voranmeldung.spec.ts | telefon | 0 | 0 | 1 | 0.2 |
| formulare-ohne-skript.spec.ts | desktop | 2 | 0 | 0 | 2.1 |
| formulare-ohne-skript.spec.ts | telefon | 0 | 0 | 2 | 0.6 |
| pwa.spec.ts | desktop | 2 | 1 | 0 | 9.3 |
| pwa.spec.ts | telefon | 0 | 0 | 3 | 0.6 |
| quran.spec.ts | desktop | 20 | 8 | 0 | 73.1 |
| quran.spec.ts | telefon | 21 | 7 | 0 | 80.2 |
| startseite.spec.ts | desktop | 9 | 0 | 0 | 11.3 |
| startseite.spec.ts | telefon | 9 | 0 | 0 | 21.8 |
| suche.spec.ts | desktop | 4 | 0 | 0 | 8.0 |
| suche.spec.ts | telefon | 4 | 0 | 0 | 13.6 |
| veranstaltungen.spec.ts | desktop | 32 | 0 | 0 | 46.1 |
| veranstaltungen.spec.ts | telefon | 32 | 0 | 0 | 51.9 |
| verwaltung-ankuendigungen.spec.ts | desktop | 3 | 0 | 0 | 20.5 |
| verwaltung-ankuendigungen.spec.ts | telefon | 0 | 0 | 3 | 0.6 |
| verwaltung-anmeldung.spec.ts | desktop | 5 | 0 | 0 | 14.9 |
| verwaltung-anmeldung.spec.ts | telefon | 0 | 0 | 5 | 0.0 |
| verwaltung-audit.spec.ts | desktop | 2 | 0 | 0 | 18.3 |
| verwaltung-audit.spec.ts | telefon | 0 | 0 | 2 | 0.5 |
| verwaltung-benutzer.spec.ts | desktop | 2 | 0 | 0 | 26.5 |
| verwaltung-benutzer.spec.ts | telefon | 0 | 0 | 2 | 0.5 |
| verwaltung-eingaenge.spec.ts | desktop | 0 | 1 | 0 | 27.1 |
| verwaltung-eingaenge.spec.ts | telefon | 0 | 0 | 1 | 0.3 |
| verwaltung-gebetszeiten.spec.ts | desktop | 1 | 0 | 0 | 12.9 |
| verwaltung-gebetszeiten.spec.ts | telefon | 0 | 0 | 1 | 0.2 |
| verwaltung-kurse.spec.ts | desktop | 3 | 0 | 0 | 28.0 |
| verwaltung-kurse.spec.ts | telefon | 0 | 0 | 3 | 0.7 |
| verwaltung-medien.spec.ts | desktop | 1 | 0 | 0 | 12.9 |
| verwaltung-medien.spec.ts | telefon | 0 | 0 | 1 | 0.2 |
| verwaltung-neuigkeiten.spec.ts | desktop | 2 | 0 | 0 | 14.0 |
| verwaltung-neuigkeiten.spec.ts | telefon | 0 | 0 | 2 | 0.4 |
| verwaltung-passwort.spec.ts | desktop | 1 | 0 | 0 | 10.8 |
| verwaltung-passwort.spec.ts | telefon | 0 | 0 | 1 | 0.0 |
| verwaltung-postfach.spec.ts | desktop | 2 | 0 | 0 | 18.5 |
| verwaltung-postfach.spec.ts | telefon | 0 | 0 | 2 | 0.0 |
| verwaltung-seiteninhalte-organisationen.spec.ts | desktop | 3 | 0 | 0 | 31.7 |
| verwaltung-seiteninhalte-organisationen.spec.ts | telefon | 0 | 0 | 3 | 0.6 |
| verwaltung-seiteninhalte.spec.ts | desktop | 3 | 0 | 0 | 30.9 |
| verwaltung-seiteninhalte.spec.ts | telefon | 0 | 0 | 3 | 0.7 |
| verwaltung-styleguide.spec.ts | desktop | 2 | 0 | 0 | 19.2 |
| verwaltung-styleguide.spec.ts | telefon | 0 | 0 | 2 | 0.5 |
| verwaltung-tickets.spec.ts | desktop | 3 | 0 | 0 | 37.0 |
| verwaltung-tickets.spec.ts | telefon | 0 | 0 | 3 | 0.8 |
| verwaltung-uebersicht.spec.ts | desktop | 5 | 0 | 0 | 26.9 |
| verwaltung-uebersicht.spec.ts | telefon | 0 | 0 | 5 | 1.3 |
| verwaltung-veranstaltungen.spec.ts | desktop | 3 | 0 | 0 | 37.4 |
| verwaltung-veranstaltungen.spec.ts | telefon | 0 | 0 | 3 | 0.8 |
| welle-a/fehlerseiten.spec.ts | desktop | 2 | 0 | 0 | 5.7 |
| welle-a/fehlerseiten.spec.ts | telefon | 2 | 0 | 0 | 4.6 |
| welle-a/gebetszeiten.spec.ts | desktop | 3 | 0 | 0 | 15.5 |
| welle-a/gebetszeiten.spec.ts | telefon | 3 | 0 | 0 | 13.7 |
| welle-a/igmg-reiter.spec.ts | desktop | 2 | 0 | 0 | 6.8 |
| welle-a/igmg-reiter.spec.ts | telefon | 2 | 0 | 0 | 3.7 |
| welle-a/inhaltsseiten.spec.ts | desktop | 7 | 0 | 0 | 9.6 |
| welle-a/inhaltsseiten.spec.ts | telefon | 7 | 0 | 0 | 5.4 |
| welle-a/islamisches-wissen.spec.ts | desktop | 12 | 0 | 0 | 19.1 |
| welle-a/islamisches-wissen.spec.ts | telefon | 12 | 0 | 0 | 17.2 |
| welle-a/kontakt.spec.ts | desktop | 2 | 0 | 1 | 2.7 |
| welle-a/kontakt.spec.ts | telefon | 2 | 0 | 1 | 2.8 |
| welle-a/nachrichten.spec.ts | desktop | 9 | 0 | 0 | 16.4 |
| welle-a/nachrichten.spec.ts | telefon | 9 | 0 | 0 | 17.0 |
| **Summe** | desktop | 295 | 12 | 2 | 1454.3 |
| **Summe** | telefon | 243 | 7 | 59 | 857.1 |
| **Gesamt** | beide | 538 | 19 | 61 | Lauf 1195 s Wanduhr |

Übersprungen (61), alle durch die Suite so vorgesehen:
- 58 telefon: Verwaltungs-, Formular-, Anmelde- und Prüfabläufe „nur einmal je Lauf“ (Projekt desktop).
- 1 telefon und 1 desktop: Karte im Kontakt erst mit bestätigten Koordinaten (offene Frage M-010, `welle-a/kontakt.spec.ts`).
- 1 desktop: `formular-moschee-anfrage.spec.ts`, Test nur im Telefon-Rahmen.

## Fehlschläge und Einordnung (Lauf 1)

Screenshots liegen unter `web/test-results/<Testordner>/test-failed-1.png` im Worktree; Kopie des Laufs 1: `scratchpad/e2e/lauf1-test-results/`.

### c · veraltete Erwartung durch gewollte Gestaltungsänderung (14)
`tests/e2e/quran.spec.ts`, je Projekt telefon und desktop (7 + 7):
- Platzhalter sichtbar, ohne Quelle kein arabischer Verstext (Zeile 61; de und tr)
- Zählzeile mit Strich, Audio ist deaktiviert (Zeile 68; de und tr)
- Surenliste mit fünf Suren, aria-current an Sure 1 (Zeile 74; de und tr)
- Blättern: Nächste Sura führt weiter, Vorherige fehlt auf Sure 1 (Zeile 104)

Ursache: Die Kür-Welle A (Commit 85fe3e4, `_werkstatt/berichte/K-10.md` Zeilen 32–36) hat `/quran` von der Sure-1-Ansicht auf eine Übersicht mit Raster umgestellt (`QuranUebersicht.tsx`). Platzhalter, Zählzeile, aria-current und Blättern gibt es seither nur auf `/quran/[sure]` (`QuranAnsicht.tsx`). Die Anwendung zeigt auf `/quran` die Übersicht richtig; der Test erwartet noch die alte Sure-1-Ansicht. Test ist zu aktualisieren (Entscheidung Opus). Nichts geändert.

### a · Umgebung: ALTCHA-Rechenzeit (3 Tests)
- `tests/e2e/formular-mitgliedsantrag.spec.ts:33` (desktop): Lauf 1 rot, Wiederholung 1 rot, Wiederholung 2 rot. Das versteckte Feld `altcha` bleibt 20 s leer, das Widget zeigt „Wird überprüft…“.
- `tests/e2e/formular-voranmeldung.spec.ts:30` (desktop): Lauf 1 rot, Wiederholung 1 rot, Wiederholung 2 grün.
- `tests/e2e/verwaltung-eingaenge.spec.ts:25` (desktop): Lauf 1 rot, Wiederholung 1 grün.

Einordnung: Zeitgrenze durch ALTCHA-Rechenzeit (L-E07: Lösung je nach zufälligem Zähler 8 bis 39 s). Die Erwartung im Test hat 20 s. Keine Änderung an Tests.

### a · Zeitpunkt, nicht reproduziert (1)
- `tests/e2e/quran.spec.ts:96` Surwahl (desktop): Seitentitel direkt nach dem Klick leer (`page.title()` ohne Warten). Projekt telefon bestanden; Wiederholung einzeln grün. Einordnung: Timing unter 2 Workern.

### b? · offen (1)
- `tests/e2e/pwa.spec.ts:22` offline (desktop): erwartet „Sie sind offline“, erhalten h1 „Veranstaltungen“ (14 Abfragen, 5 s). Lauf 1 rot, Wiederholung 1 rot mit gleicher Meldung, also reproduzierbar.
  Befund: Der Vorrat (`public/sw.js`, Installationsschritt) hält nur die Offline-Seiten und die Gebetszeiten vor, `/veranstaltungen` nicht. `public/sw.js` ist seit 9ebb4bc unverändert (git). Ob die App (b) oder die Browser-Abweichung (Chromium 141 statt erwarteter 156 bei Playwright 1.64) ursächlich ist, lässt sich hier nicht entscheiden. Vergleich mit dem Ausgangsstand nicht möglich (kein E0-Build mit Postgres, Briefing).

## Wiederholungen (Umgebungsfälle einzeln, je Datei höchstens zweimal)

| Datei (desktop, 1 Worker) | Lauf 1 | Wiederholung 1 | Wiederholung 2 |
|---|---|---|---|
| formular-mitgliedsantrag | rot | rot | rot |
| formular-voranmeldung | rot | rot | grün |
| verwaltung-eingaenge | rot | grün | – |
| Diagnose: pwa offline | rot | rot | – |
| Diagnose: quran Surwahl | rot | grün | – |

Die Diagnose-Läufe zählen nicht als Umgebungswiederholung. Protokolle: `scratchpad/e2e/wdh1-*.log`, `wdh2-*.log`.

## Einrichtung (ohne Werte)

- Postgres 16 (Cluster 16/main, lief bereits): Rolle `igmg` mit CREATEDB angelegt, zufälliges Passwort nur in `scratchpad/e2e/e2e.env` (Modus 600). Datenbank `igmg` angelegt, Anmeldung über TCP geprüft. `igmg_e2e` legt die Suite selbst an und bleibt.
- Mailpit v1.27.0 (linux amd64) aus dem GitHub-Release v1.27.0 per curl geladen (9,9 MB). Die gh-API ist für `axllent/mailpit` nicht freigeschaltet, eine Prüfsumme wird nicht veröffentlicht. Gestartet mit SMTP 127.0.0.1:1025 und HTTP 127.0.0.1:8025, Log `scratchpad/e2e/mailpit.log`.
- Laufzeitwerte: `scratchpad/e2e/umgebung.sh` lädt die Testgeheimnisse (`dev-geheimnisse.env`) und die Passwortdatei, ohne Werte auszugeben. Gesetzt: DATABASE_URL (E2E-Rolle, Datenbank `igmg`, die Suite leitet `igmg_e2e` ab), SMTP_HOST, SMTP_PORT, MAIL_TRANSPORT=smtp, MAIL_ABSENDER (Code-Standard), E2E_PORT=3700. Nicht gesetzt: EINGANG_SCHLUESSEL_ID (optional, Standard 1).
- Browser: Playwright 1.64 erwartet Chromium 156 (Revision 1248), installiert ist 141 (1194). Wrapper in `scratchpad/e2e/pw-browsers/` leiten auf die vorhandenen Binaries um (PLAYWRIGHT_BROWSERS_PATH). Nichts installiert.
- pnpm: Wrapper `scratchpad/e2e/bin/pnpm` ruft `corepack pnpm` auf, weil die Startskripte `pnpm` per Namen aufrufen.
- JSON-Ausgabe über `PLAYWRIGHT_JSON_OUTPUT_NAME=test-results/ergebnis.json`, weil `--reporter` die Dateiangabe der Konfiguration überschreibt.
- Serverhinweise beim Start: MAIL_TRANSPORT und MAIL_ABSENDER fehlten (gesetzt); APP_URL zeigt auf localhost (durch die Konfiguration vorgegeben, bleibt).
- Rauchlauf `startseite.spec.ts`, desktop: 9 von 9 grün.

## Rohdaten

`C-e2e.json` ist die Roh-JSON des Laufs 1. Das Passwort der E2E-Rolle stand darin in der Konfigurations-Ausgabe (webServer-Umgebung) und ist durch `[***]` ersetzt. Geprüft: keine Geheimniswerte mehr enthalten.

## OFFENE FRAGEN

1. Quran-Tests (14): Erwartungen an den K-10-Stand anpassen (Entscheidung Opus, Tests nicht geändert).
2. pwa offline: App-Befund (b) oder Browser-Abweichung? Wiederholung mit Chromium 156 nötig.
3. ALTCHA-Zeitgrenze 20 s in drei Formular-Tests: anheben nach L-E07 oder auf schnellerem Lauf prüfen. Mitgliedsantrag ist nach zwei Wiederholungen rot.
4. Surwahl-Titel: einmal rot, einmal grün. Ursache Timing, niedrige Priorität.

## Einordnung durch den Orchestrator (Opus, 09:00 UTC)

- **quran.spec.ts (14, Klasse c):** Die Erwartungen waren veraltet, weil Kür K-10 `/quran` zur Übersicht gemacht hat. Behoben in b90ca33.
  - Die Übersicht hat jetzt eigene Prüfungen: 200, Sprache, genau eine h1, fünf Suren ohne Auswahl, kein Querscrollen, axe.
  - Platzhalter, Zählzeile, `aria-current` und Blättern prüft die Suite jetzt auf `/quran/1` und `/tr/kuran/1`. Keine Prüfung ist entfallen.
- **pwa.spec.ts:22 offline (Klasse a, Umgebung UA-04):** Nachgestellt mit `$SCRATCHPAD/pwa-probe.mjs`. Ergebnis:
  - Offline liefert der Service Worker `/veranstaltungen` mit 200 aus (`fromServiceWorker` true). Der Vorrat enthält die Seite nicht, er hat nur `/offline`, `/tr/offline`, `/en/offline`, `/gebetszeiten` und `/gebetszeiten/anzeige`.
  - Ein `fetch` aus der Seite scheitert dagegen. Die Offline-Emulation von Playwright wirkt bei Chromium 141 also nicht auf den Service Worker: Er holt die Seite aus dem Netz.
  - Am Ausgangsstand 3100 (9ebb4bc) zeigt dieselbe Probe dasselbe Bild (h1 „Veranstaltungen“).
  - Das ist keine Änderung der App, `public/sw.js` ist seit E0 unverändert. Ersatzbeleg: Vorrat und Fallback-Logik von `sw.js` wie oben gelesen. Die Prüfung „Verwaltung nie vorgehalten“ ist grün.
- **ALTCHA-Rechenzeit (Klasse a, L-E07):** Mitgliedsantrag, Voranmeldung und Verwaltung-Eingänge auf desktop. Sie liefen parallel zu fünf Opus-Prüfern und einem zweiten Browser (Last 4–6). Am Endstand werden sie bei ruhiger Last einzeln wiederholt.
