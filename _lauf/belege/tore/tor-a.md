# Tor A – Abnahme Welle A (öffentliche Seiten)

Stand 2026-10-11, vorläufig (Darstellungsprüfung läuft). Rückgaben: `_lauf/belege/welle-a/Axx.md` (Personennamen aus dem Bestand geschwärzt, E-005).

## L1 je Paket (5 Prüfungen × 0–2, Freigabe ab 8/10 ohne eine 0)

Prüfungen: **V** Vollständigkeit gegen Blatt/Kriterien · **M** Muster und Regeln (MUSTER, K-xx, G-xx) · **P** Prüfungen belegt (Typen, Lint, Sprachen, Seed, curl, Bildschirmfotos) · **D** Darstellung (Darstellungsprüfer, 390/1440) · **B** Bericht (Formular vollständig, ehrlich, Fundstellen)

| Paket | Inhalt | V | M | P | D | B | Summe | Ergebnis | Nacharbeit durch O |
|---|---|---|---|---|---|---|---|---|---|
| A01 | Nachrichten-Liste | 2 | 1 | 2 | – | 2 | – | vorläufig frei | Linktext „Weiterlesen“ (SEO 90) → sr-only-Kontext |
| A02 | Nachrichtendetail | 2 | 2 | 2 | – | 2 | – | vorläufig frei | – |
| A03 | Über uns | 2 | 2 | 2 | – | 2 | – | vorläufig frei | – |
| A04 | Vorstand + PersonCard | 2 | 2 | 2 | – | 2 | – | vorläufig frei | Bestandsnamen im Bericht geschwärzt |
| A05 | Projekte | 2 | 2 | 2 | – | 2 | – | vorläufig frei | – |
| A06 | Kontakt, Karte nach Klick | 2 | 2 | 1 | – | 2 | – | vorläufig frei | Klickstrecke ungeprüft (keine Koordinaten); CSP `frame-src` für OSM erst mit M-010 |
| A07 | IGMG + OrgCard | 2 | 2 | 1 | – | 2 | – | vorläufig frei | nur Dev-Server geprüft |
| A08 | OrganizationPage | 2 | 2 | 1 | – | 2 | – | vorläufig frei | Sichtprüfung erst mit A09 |
| A09 | Organisationsseiten | 2 | 2 | 1 | – | 2 | – | vorläufig frei | – |
| A10 | Korankurse + CourseCard | 2 | 2 | 2 | – | 2 | – | vorläufig frei | Kursstatus-Feld → Welle C (V06) |
| A11 | Islamisches Wissen Übersicht | 2 | 2 | 1 | – | **0** | – | **nicht frei nach L1** → von O nachgeprüft | leerer Bericht; Code von O geprüft, axe/Datenschutz über Routentabellen grün |
| A12 | Wissen-Thema | 2 | 1 | 1 | – | 2 | – | vorläufig frei | Inselogik doppelt (`ThemaInsel`/`WissenInsel`) – technische Schuld; Bedienung → A23b |
| A14 | Gebetszeiten-Seite | 2 | 1 | 2 | – | 2 | – | vorläufig frei | Vorabruf der Anzeige (+16 kB) → `prefetch={false}`; verschachtelte tabpanel |
| A15 | Qibla + Einstellungen | 2 | 1 | 1 | – | 2 | – | vorläufig frei | tabpanel doppelt, toter Link „Standort ändern“ entfernt |
| A17 | Impressum, Datenschutz (Entwurf) | 2 | 2 | 2 | – | 2 | – | vorläufig frei | – |
| A18 | 404, Fehler, Offline | 2 | 1 | 1 | – | 2 | – | vorläufig frei | Fehlergrenzen +20 kB je Route → E-030; Soft-404 der Sammelroute offen |

## Gemeinsame Prüfungen (Orchestrator)

- `pnpm check`: Typen, Lint, 226 Unit-Tests grün (inkl. `bundle-regeln`).
- `pnpm test:integration`: 66/66.
- `pnpm sprachen:pruefen`: 922 Schlüssel in de/tr/en vollständig.
- E2E Routenlauf (`barrierefreiheit.spec.ts` + `datenschutz.spec.ts`, alle 19 Routen × 3 Sprachen × 390/1440): **234 bestanden, 0 fehlgeschlagen**, 4 übersprungen.
- Leistung (`pnpm messen`, devtools): alle Messrouten 166–173 kB JS, Perf. 98–99, LCP 1,6–1,9 s, CLS ≤ 0,002 (E-030; vorher 184–206 kB).

## Darstellungsprüfung DP-A1…A3 – Befunde der Stufe hoch und Bearbeitung

| Befund | Seite(n) | Status |
|---|---|---|
| Serifen statt Sans an Kartentiteln/Labels (h3/h4) | Kontakt (Anfahrt), Vorstand (PersonCard), Organisationen (Aktivitäten) | **behoben** (R1, R2: `font-text font-bold tracking-normal`) |
| Kennzahlen wie Monospace | IGMG | **behoben** (R1: ohne `tabular-nums`) |
| Missionskarte: Akzentband fehlt, Text abgeschnitten | 4 Organisationsseiten | **behoben** (R2: ohne `flex-1`/Schrumpfen, Band 6 px; Prod-Bildschirmfoto `_lauf/belege/app/tor-a-nach/`) |
| Termine als große Karten statt Liste; Nachrichten ebenso | 4 Organisationsseiten | **behoben** (R2: `OrgTermine`, `OrgMeldungen` nach OrganizationPage.dc.html) |
| Hinweisbox und dritter Kurs fehlen | Korankurse | **behoben** (O: Felder `kurs.hinweis`, `kurs.verfuegbarkeit`, Migration 0003/0004, Seed aus Bestand) |
| Kategorie „Ankündigung“ blau statt rot | Nachrichten | **behoben** (R1: Token tag-wichtig) |
| Schlagwörter-Block fehlt | Nachrichtendetail | **behoben strukturell** (O: Feld `nachricht.schlagwoerter`, Block erscheint mit Daten; Beispielbeiträge ohne Schlagwörter, G-05) |
| Autor, Aufrufe, Kommentare, „Profil ansehen“, Newsletter | Nachrichten, Nachrichtendetail | **bewusst nicht** (keine Datenquelle, Zählung widerspräche G-07, Newsletter ohne Anbieter/Einwilligung): A-S06/A-S07, Entscheidung M-081 |
| Standortauswahl fehlt | Gebetszeiten | **bewusst** (fester Standort, GPS wäre personenbezogen): A-S02 |
| Entwurfshinweis zusätzlich | Impressum, Datenschutz | **bewusst** (G-08): A-S23 |

Mittel/niedrig behoben: Chronik-Karten nicht gestreckt, Errungenschaften als Kreise, Projektkarten-Innenabstand mobil, Symbol „Geschlossen“ (Ban). Offen (niedrig, kosmetisch): Kartenkopf-Abstände (G1), Abstand zur Fußzeile 96/86 px, Zeilenhöhe Optionsbeschreibungen, Umbrüche durch `text-wrap: balance`, Titelschrift ≈ 2 % schmaler (abgeleitete Schrift, ADR 0014).

## Sicherheitsprüfung SP-A (17 Befunde) – Stand der Bearbeitung

| Befund | Schwere | Status |
|---|---|---|
| SP-A-01 Eingänge ohne Löschfrist | hoch | teilweise: `loeschenAb` beim Anlegen (Anmeldungen einmaliger Termine +30 Tage); Löschroute und Fristen je Art → **C08** (Freigabe-Blocker, Z-07) |
| SP-A-02 Rechtstexte ungeprüft | hoch | Freigabe-Blocker bei der Gemeinde (M-079, M-021); Entwurf aktualisiert (Voranmeldung, keine internen Verweise) |
| SP-A-03 X-Forwarded-For | mittel | BETRIEB 5a/5b (Proxy hängt an, Begrenzung am Proxy); Code-seitige Proxy-Vertrauensliste → P5-Härtung |
| SP-A-04 `javascript:` in Social-Links | mittel | **behoben** (`HTTPS_URL`, nur https mit Host) |
| SP-A-05 Soft-404, Cache je Zufallsadresse | mittel | **behoben** (Sammelroute `notFound()` → 404); Cache-Wachstum: Begrenzung am Proxy (BETRIEB 5b); `dynamicParams` mit Cache Components nicht zulässig |
| SP-A-06 Datei-Transport als stiller Fallback | mittel | **behoben** (im Betrieb nur SMTP, sonst Fehler und Wiederholung) |
| SP-A-07 Kein Audit beim Anlegen | mittel | **behoben** (`eingang.angelegt` ohne Personendaten, Integrationstest) |
| SP-A-08 Geplante Nachrichten vorab abrufbar | mittel | **behoben** (gleiche Sichtbarkeitsregel für Detail und Slugs) |
| SP-A-09 Karte nach Klick vs. CSP | mittel | offen bis Koordinaten (M-010): Freigabe `frame-src` in BETRIEB 5b beschrieben |
| SP-A-10 `'unsafe-inline'` | mittel | bewusst (ADR 0012, statische Seiten ohne Nonce); Restrisiko dokumentiert, durch SP-A-04 entschärft |
| SP-A-11 Cache-Invalidierung künftiger Verwaltungsaktionen | mittel | Regel MUSTER 5 (`inhaltGeaendert`) – gilt für Welle C |
| SP-A-12 Zeit im `'use cache'` | niedrig | akzeptiert (Profile hours/days, Fenster deckt „heute“) |
| SP-A-13 Merker Konzept-Hinweis | niedrig | Merker für eine vom Nutzer bestätigte Anzeige; Bewertung als notwendig in M-079 aufgenommen |
| SP-A-14 Schritte/Challenge ohne Limit | niedrig | Begrenzung am Proxy (BETRIEB 5b) |
| SP-A-15 Beschriftung „Google Maps“ | niedrig | **behoben** („Zur Karte“, A-S11a) |
| SP-A-16 Rich-Text-Link `/\host` | niedrig | **behoben** (Regel + Unit-Test) |
| SP-A-17 HSTS nur mit https-APP_URL | niedrig | **behoben** (Warnung beim Start, BETRIEB 5b) |

## Offene Befunde

1. 404 ohne HTML-Inhalt (niedrig): Status jetzt überall 404, der lokalisierte Inhalt erscheint mit JavaScript (A-S24a).
2. Gebetszeiten-Berechnung Imsak/Yatsı (A22-1, M-082): Entscheidung der Gemeinde.
3. Löschfristen (SP-A-01) mit C08, Rechtstexte (SP-A-02) bei der Gemeinde – Freigabe-Blocker vor dem Livebetrieb, kein Blocker für Tor A.
