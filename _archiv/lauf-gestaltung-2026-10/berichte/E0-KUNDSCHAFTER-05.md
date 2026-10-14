# E0-KUNDSCHAFTER-05 · Stack und Qualität (Rückgabe, vom Orchestrator abgelegt)

E0-KUNDSCHAFTER-05 · Bericht (Stand 2026-10-11, Lauf „Gestaltung aufwerten und Vercel-startklar machen“). Der Bericht ist nicht als Datei abgelegt, sondern hier zurückgegeben.

GEÄNDERTE DATEIEN
Keine. Rohausgaben liegen im Scratchpad (unit-utc.log, unit-berlin.log, list-unit.txt, list-int.txt, list-e2e.txt, sprachen.log, geheimnis.log).

WAS UND WARUM

1. Konventionen
- MUSTER (web/docs/MUSTER.md): §1 öffentliche Seite :6–16, §2 Queries :18–24, §3 Links :26–32, §4 Komponente :34–44, §5 Server Action :45–57, §6 Formular :59–68, §6a öffentliches Formular :70–80, §6b FormWizard :82–90, §7 Verwaltungsmodul :92–99, §8 Route Handler :101–106, §9 Tests :108–117.
- Beispielbausteine existieren alle (Pfade unter web/src): rechte/pruefe.ts:71 (verlangeRecht), formulare/ohne-skript.ts:14, formulare/verarbeiten.ts:93, cache/aktualisieren.ts:15, cache/tags.ts:5, zeit/heute.ts:7. Abweichungen: lib/rechte hat keine index.ts. LeisteLive liegt in components/website/leiste/ (MUSTER.md:41 nennt nur den Dateinamen).
- web/CLAUDE.md:7–12 und web/AGENTS.md:3–5: Next.js-16-Docs in node_modules/next/dist/docs lesen, Texte nur aus messages, Farben nur aus Tokens, Rechte serverseitig, öffentliche Seiten ohne Cookies und Header.
- ESLint (web/eslint.config.mjs): eigene Regeln :11–12 (no-explicit-any, unused vars mit _-Präfix), :13–24 jsx-a11y, :25 no-console (nur warn und error), :32–41 Ignorierungen (u. a. src/components/ui). Keine Regel gegen freie Werte, Hex-Farben oder Texte ohne messages. Diese Prüfung gibt es nur im Orchestrator-Werkzeug _werkstatt/werkzeuge/freie-werte.mjs.
- Hex-Literale außerhalb der Tokens: components/verwaltung/anmeldung/QrCode.tsx:18–19 (ohne Begründung). Technisch bedingt: app/manifest.ts:16–17, app/[locale]/layout.tsx:25, lib/mail/vorlagen/farben.ts:6–10, lib/seo/og-bild.tsx:61–63.
- Prettier (web/.prettierrc.json): singleQuote, printWidth 140, trailingComma all, Tailwind-Sortierung für cn und cva. .prettierignore u. a. messages/*.json, src/components/ui. lint-staged (web/package.json:115): prettier und eslint --max-warnings 0.
- tsconfig (web/tsconfig.json): strict :7, Pfad "@/*" auf src/* :21–23, include :25–32 umfasst auch tests und scripts.
- Benennung: deutsche Ordner und Dateien. Server-Wrapper mit Client-Teil: components/website/start/Tagesbogen.tsx:6 importiert TagesbogenLive; PrayerTimesBar.tsx:6 bindet leiste/LeisteLive ein. Suffixe Live, Insel, Filter, Knopf. 26 Dateien mit 'use client' in components/website und components/formular.

2. Tests
| Suite | Ort | Dateien | Fälle | Befehl | Dauer |
|---|---|---|---|---|---|
| unit | web/tests/unit | 34 | 558 im Lauf (vitest list: 288 Einträge, it.each nicht einzeln) | pnpm test:unit | ca. 6 s |
| integration | web/tests/integration (PGlite je Datei) | 30 | 429 (list) | pnpm test:integration | nicht gemessen |
| e2e | web/tests/e2e | 39 Specs | 309 x 2 Projekte = 618 (list) | pnpm test:e2e | nicht gemessen |
- Coverage: pnpm test:abdeckung, Schwelle 80 % für src/lib (vitest.config.mts:42–45), nicht Teil von pnpm check.
- E2E: Projekte telefon (390 px) und desktop (1440 px), playwright.config.ts:41–44. webServer führt scripts/e2e-datenbank.mjs (igmg_e2e wird neu angelegt, migriert, geseedet) und start-standalone.mjs auf Port 3100 aus (:45–47; braucht vorherigen pnpm build). web/.env fehlt jetzt. Nötig sind DATABASE_URL, WARTUNG_TOKEN, PostgreSQL (docker-compose.yml:6–22) und Mailpit auf 127.0.0.1:8025 (docker-compose.yml:24–33).
- Hilfen e2e: konto.ts:19–39 angemeldetesKonto (Einladung über pnpm verwaltung:einladen, Anmeldung, TOTP aus data-testid totp-geheimnis mit otpauth, :33–35). konto.ts:10–13 eigene Absenderadresse je Test (Ratenbegrenzung). einladung.ts:5–13 Attrappen testperson.<hex>@example.test und Testpasswort. global-setup.ts:6–24 wartet auf /api/health und erneuert Caches mit Bearer-Token.
- Hilfen integration: db.ts (frische PGlite je Datei), umgebung.ts (Zufallsgeheimnisse, MAIL_TRANSPORT=datei), verwaltung.ts (Mocks für next/*, angemeldetAls(rollen, zweiFaktor)).
- Abläufe e2e: öffentliche Seiten, Welle A, Barrierefreiheit (axe), Datenschutz, 7 Formular-Specs, 17 verwaltung-Specs (u. a. Anmeldung, Benutzer, Medien, Veranstaltungen). Mailpit wird per API abgefragt (formular-kontakt.spec.ts:13–23).

3. Besondere Prüftests
- bundle-regeln.test.ts: prüft Quelltext, keine kB-Messung. Client-Code öffentlicher Seiten darf cn, next-intl und @/i18n/routing nicht importieren (:35). Nur global-error.tsx als Fehlergrenze (:39–43). Das JS-Budget 180 kB steht nur in messen.mjs:12.
- styleguide-tokens.test.ts (278 Zeilen): tokens.ts gegen den @theme-Block in globals.css (Werte :68–93, Vollständigkeit :95–109, Klassen :111–123, Kontrast :125–142), Texte in messages/verwaltung/styleguide.json (:156–277).
- i18n.test.ts (35 Zeilen): Rückfall auf Deutsch (:5–17), Datum und Uhrzeit fest in Europe/Berlin (lib/i18n/format.ts:7). Grün in UTC und Berlin.
- sprachen-pruefen.mjs: Schlüsselgleichheit de/tr/en, Platzhalter {…}, leere Werte, Namensraum-Überschneidungen, verwaltung.* nur de. Lauf: rc 0, 1166 Schlüssel.
- messen.mjs: Lighthouse 13.5 mobil, je Route zwei Läufe, devtools (maßgeblich) und simulate (:41–43). Routen (:19): /, /gebetszeiten, /veranstaltungen, erstes Detail, /nachrichten, /bildung/voranmeldung. Schwellen (:12): Performance ≥ 90, Barrierefreiheit 100, Best Practices und SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0,1, TBT ≤ 200 ms, JS ≤ 180 kB (:55). Ausgabe nach _lauf/release/belege/lighthouse/<Zeit>/ (:31), Exit 1 bei Verfehlung (:107).
  - Befund: kein Median aus drei Läufen, den ROLLEN.md für Prüfer verlangt.
  - Befund: frühere Ergebnisse liegen unter _lauf/belege/lighthouse/, das Skript schreibt nach _lauf/release/.
- geheimnis-pruefung.mjs: Modi --staged, --push, --alles (:9–25). Prüft verbotene Pfade (:27–35), Schlüsselmuster (:37–50), E-Mail-Domains (:54–64). Lauf --alles: ohne Befund.
  - Befund: Git-Hooks sind nicht aktiv (.git/hooks enthält nur Beispiele). web/package.json:111–114 definiert pre-commit und pre-push, ein prepare-Skript fehlt (VERMUTUNG: deshalb nie installiert).

4. CI
- Kein .github im Repo-Wurzelverzeichnis und in web/, keine Workflow-Dateien. Bei Push und PR läuft nichts automatisch.
- Vercel: vercel.json mit Service web (root web). Build ist vercel-build (web/package.json:8): Bau-Datenbank, dann next build. Keine Lint- oder Testschritte. .vercelignore schließt _lauf, _werkstatt, _archiv aus.

5. Budgets und frühere Messwerte
- Budget K-12 (_lauf/KERN.md:29) entspricht messen.mjs:12.
- Jüngster vollständiger Lauf _lauf/belege/lighthouse/2026-10-11-09-07/ergebnis.md, alle sechs Routen erfüllt: Performance 98–99, Barrierefreiheit 100, Best Practices 100, SEO 100, LCP 1586–1885 ms, CLS 0–0,002, TBT 17–100 ms, JS 168–174,1 kB. Engster Wert: /gebetszeiten mit 174,1 kB.
- Ad-hoc-Lauf 2026-10-11-09-09 (/suche?q=Gebetszeiten): SEO 63 wegen is-crawlable. VERMUTUNG: beabsichtigt, nicht geprüft.
- Früher verfehlt: Läufe 04-15 bis 04-33 mit JS 181–206 kB, behoben laut _lauf/BERICHT.md:12 (166–173 kB). Siehe auch _lauf/STATUS.md:30.
- web/docs enthält keine Lighthouse- oder Bundle-Messwerte, nur Einzelangaben (docs/adr/0005-formularaufbau.md:44–45, docs/MUSTER.md:77).

6. Barrierefreiheit (Muster mit Fundstelle)
- Sprunglink: components/website/Seitenrahmen.tsx:54–59, website/fehler/FehlerAnsicht.tsx:16–19, app/[locale]/verwaltung/(geschuetzt)/layout.tsx:59–62. Ziel: main id="inhalt" tabIndex -1 (Seitenrahmen.tsx:65).
- Fokusverwaltung: nach Aktion Fokus auf die Rückmeldung (verwaltung/veranstaltungen/VeranstaltungsFormular.tsx:163, verwaltung/seiteninhalte/Rahmen.tsx:39). Dialoge: verwaltung/medienwahl/MedienWahlDialog.tsx:72, :80 (Fokus zurück zum Auslöser). Sichtbarer Fokus: globals.css:219–222.
- aria-live und role=status: components/formular/Rueckmeldung.tsx:25 (alert), :56 und :84 (status); verwaltung/veranstaltungen/VeranstaltungsFormular.tsx:583; app/[locale]/(website)/suche/page.tsx:96; website/nachrichten/NachrichtenFilter.tsx:62.
- Formularfehler-Zusammenfassung: components/formular/Rueckmeldung.tsx:9–49 (tabIndex -1, role=alert, Sprungverweise :37). Feldfehler über aria-invalid und aria-describedby (formular/Felder.tsx:49, :163–164).
- Reduzierte Bewegung: globals.css:312–322 (@media prefers-reduced-motion) und motion-reduce-Klassen in website/OrgCard.tsx:70, website/igmg/IGMGTabs.tsx:70, website/wissen/WissenInsel.tsx:216, website/gebetszeiten/QiblaKompass.tsx:115. Befund: keine JS-Abfrage von prefers-reduced-motion in src.
- Test: tests/e2e/barrierefreiheit.spec.ts (axe, drei Sprachen, zwei Breiten).

PRÜFUNG UND ERGEBNIS
- pnpm test:unit mit TZ=UTC: 558 Fälle, 549 grün, 6 rot, 3 bekannte Fehlschläge (it.fails, FIXME A22-1, tests/unit/gebetszeiten/hohe-breite-imsak-yatsi.test.ts:120, :125, :130; zählen als grün). Rot:
  - tests/unit/styleguide-tokens.test.ts:100 und :106 (unabhängig von TZ): globals.css enthält text-display-1/-2 (:102–105) und --spacing-abschnitt/-klein (:109–110), die tokens.ts und der Test nicht kennen. Ursache: unkommittierte Änderung an globals.css (git: M). Im HEAD sind diese Tokens nicht vorhanden.
  - tests/unit/termine.test.ts:115 und :127, tests/unit/termine-grenzfaelle.test.ts:205 und :237: iCal-Zeiten um 2 Stunden verschoben (nur bei UTC).
- pnpm test:unit mit TZ=Europe/Berlin: 558 Fälle, 553 grün, 2 rot (styleguide-tokens.test.ts:100 und :106), 3 bekannte. Die iCal-Tests bestehen nur in Berlin.
- iCal-Ursache (geprüft mit dem projekteigenen ical-generator): Die Bibliothek schreibt die Wanduhrzeit der Prozesszone. 19:00 MESZ erscheint bei TZ=UTC als 17:00 mit TZID=Europe/Berlin. Betroffen: src/lib/termine/ical.ts:41–68 (Stempel-Korrektur :74–85), genutzt von src/server/ical/veranstaltungen.ts. Docker setzt TZ=UTC (docker-compose.yml:13, :51). VERMUTUNG: der iCal-Export im Container ist um 1–2 Stunden verschoben. Nicht im Container geprüft, Vercel-Zeitzone ungeprüft.
- pnpm sprachen:pruefen: grün. geheimnis-pruefung --alles: ohne Befund.
- Nicht ausgeführt: lint und typen (Auftrag), Build, Integrations- und E2E-Tests, messen (schwere Läufe; E0-PRUEFER-01 läuft parallel).

GEMEINSAME DATEIEN
Keine berührt. Betroffen wären web/src/app/globals.css (Opus), components/verwaltung/styleguide/tokens.ts mit tests/unit/styleguide-tokens.test.ts und web/src/lib/termine/ical.ts.

OFFENE FRAGEN
1. Styleguide: neue Tokens (text-display-*, spacing-abschnitt*) in tokens.ts und Test aufnehmen, oder aus globals.css zurücknehmen?
2. iCal-Zeitzone: Korrektur in ical.ts und Prüfung im Container. Eigenes Paket?
3. Median-Vorgabe: soll messen.mjs drei Läufe je Route machen? Heute nicht.
4. /suche mit SEO 63: ist noindex beabsichtigt?
5. web/.env fehlt: E2E braucht Konfiguration und Mailpit.
6. Git-Hooks aktivieren? Der Hook-Befehl `cd web && …` passt nur bei Installation aus dem Repo-Wurzelverzeichnis.

=== ENDE E0-KUNDSCHAFTER-05 · BEREIT ZUR RÜCKGABE ===
