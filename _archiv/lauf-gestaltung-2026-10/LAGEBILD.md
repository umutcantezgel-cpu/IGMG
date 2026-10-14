# LAGEBILD – Bestand zu Beginn des letzten Laufs (Stand 2026-10-11, eingefroren 9ebb4bc)

Quellen: `berichte/E0-KUNDSCHAFTER-02.md` (Designsystem), `-03` (Ansichten, Inhalte), `-05` (Stack, Qualität), `-06` (Auslieferung), `E0-PRUEFER-01.md` (Werkzeuge), `protokolle/E0-PRUEFER-02-ausgangswerte.md` (Ausgangswerte Stufe B).

## 1. Stack in Kürze
- Next.js 16.4 (App Router, Cache Components, Turbopack, `output: 'standalone'`), React 19.3, Tailwind 4.3.3, Drizzle mit `pg` (Postgres) bzw. PGlite (Entwicklung, Tests, Bau ohne DB, ADR 0017), next-intl (de/tr/en, lokalisierte Pfade), better-auth (Passkey, TOTP), ALTCHA, ical-generator, nodemailer.
- Tests: unit 34 Dateien (558 Fälle, ≈ 6 s), integration 30 Dateien (429, PGlite je Datei), e2e 39 Specs × 2 Projekte (Playwright; braucht Postgres + Mailpit + Standalone-Build). Kein CI; Git-Hooks definiert, aber nicht installiert.
- Konventionen: `web/docs/MUSTER.md` §1–§9, deutsche Benennung, Server-Wrapper + Client-„Live“-Teil, Texte nur aus `messages`, Farben nur aus Tokens (bisher ohne Lint-Regel; geprüft per `_werkstatt/werkzeuge/freie-werte.mjs`).

## 2. Öffentliche Ansichten (26 Routen × 3 Sprachen) und Verwaltung
Siehe Tabelle in `berichte/E0-KUNDSCHAFTER-03.md` §1. Hauptansichten (K-009): Startseite · Gebetszeiten · Veranstaltungen · Veranstaltungsdetail · Nachrichten · Über uns · Projekte · Organisation (Ana Teşkilatı, inhaltsreichste der vier) · Korankurse · Voranmeldung · Kontakt · Startklar-Cockpit (neu). Verwaltung: Dashboard, Postfach, Tickets, Medien, Styleguide, Neuigkeiten, Veranstaltungen, Ankündigungen, Seiteninhalte, Kurse, Gebetszeiten, Eingänge, Benutzer, Audit, Einstellungen (Rechte: `src/lib/rechte/matrix.ts`).

## 3. Funktionsliste (Bestandsschutz – nach jeder Etappe und in Stufe C durchlaufen)
Jede Zeile: Kennung · Ablauf · Erwartung. Gegen den Server des jeweiligen Stands (E0: Port 3100), Telefon 390 und Desktop 1440, sofern nicht anders genannt.

| ID | Ablauf | Erwartung |
|---|---|---|
| F-01 | `/` öffnen | 200; Leiste mit sechs Zeiten, „Nächstes Gebet“ + Restzeit nach Hydrierung; Hero mit H1 „IGMG Wetzlar“, Knöpfe „Gemeinde beitreten“ → `/mitglied-werden`, „Mehr erfahren“ → `/ueber-uns`; bis zu 6 kommende Veranstaltungen; Aufmacher + 3 Neuigkeiten |
| F-02 | Leiste auf jeder Seite außer `/gebetszeiten` (Telefon: „Alle Zeiten anzeigen“ klappt die Liste auf, `aria-expanded` wechselt) | sichtbar, Link „Alle Gebetszeiten“ → `/gebetszeiten` |
| F-03 | `/gebetszeiten`: Tabs (Heute/Monat/Einstellungen), Monatstabelle, Qibla-Kompass | Tabs per Tastatur bedienbar, Monat wechselt, keine Leiste |
| F-04 | `/gebetszeiten/anzeige` | Vollbild, Esc/X schließt, Sprache wechselt alle 10 s |
| F-05 | `/veranstaltungen`: Kategoriefilter | Karten anderer Kategorien verschwinden; „Alle“ zeigt wieder alle |
| F-06 | Veranstaltungsdetail mit `anmeldungAktiv` | Formular (Name, E-Mail, Telefon, Personen, Einwilligung, ALTCHA); Pflichtfehler ohne Eingaben mit Fehlerzusammenfassung (Fokus); iCal-Download liefert `text/calendar` mit TZID Europe/Berlin |
| F-07 | `/nachrichten`: Filter, Ankündigungen; Detail mit ähnlichen Artikeln | Filter wirkt, Detail 200 |
| F-08 | `/ueber-uns`, `/projekte`, `/vorstand`, `/igmg` (Tabs) | 200, Inhalte aus Seiteninhalten |
| F-09 | `/organisationen/<slug>` für alle vier | 200, Akzentfarbe der Organisation, Termine der Organisation |
| F-10 | `/bildung/korankurse` | Kurskarten; „register“ → Voranmeldung, „join“ → `/kontakt#karte`, „closed“ ohne Aktion |
| F-11 | `/bildung/voranmeldung` | Vier Schritte, Weiter/Zurück, Pflichtprüfung je Schritt; ohne JS sendbar (MUSTER §6a) |
| F-12 | `/kontakt` | Formular mit Pflichtprüfung; Karte lädt erst nach Klick (OpenStreetMap) |
| F-13 | `/mitglied-werden`, `/webseite-fuer-moscheen`, `/meldung` | Formulare mit Pflichtprüfung |
| F-14 | `/suche?q=Gebet` | Ergebnisse, noindex |
| F-15 | Sprachwahl im Kopf (de → tr → en) | gleiche Seite in anderer Sprache, lokalisierter Pfad |
| F-16 | Unbekannte Adresse | 404-Seite (noindex) mit Weg zurück |
| F-17 | `/offline` und Service Worker | Offline-Seite 200; `sw.js` hält Startseite und Gebetszeiten vor |
| F-18 | Mobilmenü (390) | öffnet/schließt, Fokus bleibt im Menü, Esc schließt |
| F-19 | Sprunglink „Zum Inhalt“ | erster Tab-Halt, springt zu `#inhalt` |
| F-20 | Verwaltung: Einladung → Passwort → TOTP → Anmeldung → Dashboard | gelingt (Werkzeug `anmeldung.mjs`) |
| F-21 | Verwaltung: Veranstaltung anlegen/bearbeiten (Entwurf), Medien hochladen (< 4 MB) | gespeichert, Rückmeldung mit Fokus |
| F-22 | `/api/health` | 200 |
| F-23 | iCal-Abo je Organisation (`/api/ical/...`) | gültiger Kalender, Zeiten unabhängig von der Prozess-Zeitzone (H-FIX1) |
| F-24 | Konzept-Hinweis beim ersten Besuch | Dialog, schließbar, erscheint danach nicht wieder (Merker im Gerät) |

## 4. Designsystem – Ausgangslage
- Tokens vollständig für Farbe, Schrift (16–48 + Anzeige), Radien, Schatten, Container, zwei Breakpoints; Kontraste erfüllt (Ausnahme: `ring-ring/50` in ungenutzten shadcn-Dateien, 2,92:1).
- Lücken: keine Bewegungs-, Ebenen- oder fluide Skala; ≈ 319 freie Klammerwerte in 112 Dateien (Werkzeug zählt 617 Funde inkl. Hex/px); `dark:` in 7 shadcn-Dateien schaltete mit dem System um; `animate-in`-Klassen ohne Wirkung (kein Plugin); keine SVG-Dateien, keine Animationen; Logos 40-px-PNG.
- Behoben in E2 (O-01/O-02/O-03): siehe ENTSCHEIDUNGEN L-E05/L-E06.

## 5. Qualität – Ausgangslage
- `pnpm test:unit` unter TZ=UTC: 4 iCal-Tests rot (behoben, H-FIX1); unter Berlin grün. `sprachen:pruefen` grün (1.166 Schlüssel je Sprache), `geheimnisse:pruefen --alles` ohne Befund.
- Lighthouse des früheren Laufs (2026-10-11 09:07, `_lauf/belege/lighthouse/`): Performance 98–99, A11y/BP/SEO 100, LCP 1,6–1,9 s, CLS ≤ 0,002, JS 168–174 kB. Ausgangswerte dieses Laufs (Median ×3, Port 3100): `protokolle/E0-PRUEFER-02-ausgangswerte.md`.

## 6. Auslieferung (Vercel) – Ausgangslage
Siehe `berichte/E0-KUNDSCHAFTER-06.md` und PLAN (H-V01/03/06, O-05/O-06). Kurz: Services-Projekt `igmg` baut `main` über `vercel-build` (PGlite-Bau, Produktion ohne DB, Beispielinhalte); keine Pool-Anbindung `attachDatabasePool`, Migration bei jedem Kaltstart, Selbstaufruf in `instrumentation.ts`, Dateisystem-Speicher, Uploads > 4,5 MB scheitern, Wartungsrouten nur POST + WARTUNG_TOKEN, kein Cron für den Mail-Ausgang, kein noindex auf Vorschauen, ein APP_URL für alle Umgebungen, `/_next/image` im Services-Modus 404 (daher `images.unoptimized` auf Vercel).

## 7. Inhalte – Ausgangslage
Alles Beispielinhalte (`istBeispiel`), Platzhalter in eckigen Klammern. Offene Inhaltsfragen: MENSCHEN ML-03 … ML-07.
