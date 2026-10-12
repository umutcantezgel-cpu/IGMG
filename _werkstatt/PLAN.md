# PLAN – Letzter Lauf (Version 1.1, 2026-10-11)

Grundlage: KERN.md 1.1, LAGEBILD.md, ABNAHME.md 1.1, Plan der Planabnahme (`/root/.claude/plans/letzter-auftrag-igmg-sunny-starfish.md`), L0-Planprüfung (`berichte/L0-PRUEFER.md`, eingearbeitet).
- Ein Paket ist ein Auftrag mit Kennung, Rolle, Modell, Schreibrechten, Prüfstufe A, Muster/Maßstab, Kriterium (Z/V) und Rückgabe nach `pakete/briefings/ROLLEN.md`.
- Muster für alle Ansichtspakete: `pakete/REFERENZ.md` (Referenzansicht Startseite). Nicht-Ansichtspakete nennen ihren Maßstab in der Tabelle.
- Gemeinsame Dateien (`globals.css`, `messages/**`, `next.config.ts`, `vercel.json`, `package.json`, `Seitenrahmen.tsx`) schreibt nur Opus.

## Mengengerüst und Kapazität
- Pflicht ≈ 69 Pakete: ≈ 12 Opus und ≈ 57 Haiku, darin ≈ 12 Befundpakete H-B.
  - H-B-Schätzung: Obergrenze 2 × 12 Ansichten × 6 Kategorien. Erwartet ≈ 1 je Ansicht.
  - Etappentore und Endprüfung zählen nicht als Pakete.
- Kür 20 benannte Pakete (Haiku nach Referenz, Opus nur Abnahme).
- Kapazität: 4 Haiku-Plätze × ≈ 4 Wellen/Tag (Opus-Pakete belegen keine Haiku-Plätze). (57 + 20) ÷ 16 × 1,2 ≈ 6 Tage.
- Schwere Läufe nie parallel: Build, Suiten, Lighthouse, Bildsätze.
- Messungen gegen den eingefrorenen Ausgangsstand laufen auf Port 3100 (9ebb4bc). Opus-Entwicklung läuft auf `localhost:3200`.

## Kritischer Pfad
O-04 ✓ → E2-TOR ✓ → B-05-Nachweis (O-02) → Sichtabnahme Startseite → H-G01–G04/H-Z01–Z02 (Bausteine vor dem E3-Tor) → H-A02–A07, O-10–O-13 → E3-TOR → H-W, H-B → E4-TOR → Stufe C (inkl. Z-08-Paarmessung H-L01) → Endprüfung → ABSCHLUSS.
- Parallel dazu: O-05 ✓ → H-D01 ✓ → V-13 (Vorschauprüfung je Tor).
- Parallel dazu: E0-PRUEFER-03 → Z-02.

## Etappen und Pakete

### E0 Start und Erkundung (abgeschlossen mit E0-PRUEFER-03)
| Kennung | Rolle | Modell | Inhalt | Kriterium | Stand |
|---|---|---|---|---|---|
| E0-PRUEFER-01 | Prüfer | Haiku | Werkzeuge, Ausgangsstand einfrieren | – | ✓ a7456e9 |
| E0-KUNDSCHAFTER-02/03/05/06 | Kundschafter | Haiku | Designsystem · Ansichten/Inhalte · Stack/Qualität · Auslieferung | – | ✓ `berichte/` |
| E0-PRUEFER-02 | Prüfer | Haiku | Ausgangswerte Stufe B (11 Hauptansichten), Bilder in `bilder/e0/` | Z-04, Z-07–Z-09 | ✓ 280a76a |
| E0-PRUEFER-03 | Prüfer | Haiku | Funktionsliste F-01–F-24 aus LAGEBILD gegen Port 3100 | Z-02 | ✓ `berichte/E0-PRUEFER-03.md`, daf29ba |

### E1 Plan
KERN 1.1 (✓ 44bd7ee) · PLAN 1.1 (dieses Dokument) · ABNAHME 1.1 · ADR 0018–0023 (✓ de04689) · L0-Planprüfung (✓ eine Runde, eingearbeitet).

### E2 Referenz und Kernsysteme
| Kennung | Rolle | Modell | Inhalt | Schreibrechte | Muster/Maßstab | Kriterium | Stand |
|---|---|---|---|---|---|---|---|
| O-01 | Opus | Opus | Designsystem-Skalen (K-005), `dark:` neutral | `globals.css` | K-005 | Z-03 | ✓ 6b15832 |
| O-02 | Opus | Opus | Bewegungssystem (K-007), Seitenwechsel B-05 | `globals.css`, `Seitenrahmen.tsx`, `Header.tsx` | K-007 | Z-05 | ✓ bis auf B-05-Nachweis (Produktions-Build, E2-TOR) |
| O-03 | Opus | Opus | SVG-Formsystem: Achtstern, Trenner, Zustandsgrafik, Lade-Achtstern (B-12), Achtstern-Band | `Icons.tsx`, `Zustandsgrafik.tsx`, `Seitenkopf.tsx` | K-008 | Z-06 | ✓ a7b7a66, c66465a |
| O-04 | Opus | Opus | Startseite mit Tagesbogen (B-06), alle Zustände | `page.tsx`, `website/start/*`, `lib/gebetszeiten/bogen.ts` | K-006, K-007 | Z-04, Z-05 | ✓ 6b15832 … b592670 |
| H-STYLE | Baumeister | Haiku | Styleguide-Spiegel der neuen Skalen | `verwaltung/styleguide/**`, Test | O-01 | Z-03 | ✓ e8ced5f |
| H-FIX1 | Baumeister | Haiku | iCal unabhängig von Prozess-TZ | `lib/termine/ical.ts`, Test | Tests unter TZ=UTC | Z-02 | ✓ 65bcb4b |
| H-FIX2 | – | – | `dark:` neutralisieren | – | O-01 | Z-09 | ✓ in O-01 (`@custom-variant`) |
| H-FIX3 | Baumeister | Haiku | Ganztagstermine an iCal (ML-08) | `server/queries/veranstaltungen.ts`, `server/ical/*`, Tests | RFC 5545 DATE | Z-02 | ✓ e6d900f |
| H-V01 | Baumeister | Haiku | ignore-Skript für ZWISCHENSTAND, regions/crons | `web/scripts/vercel-ignore.mjs` | Vercel-Doku | V-01 | ✓ 0c224da |
| H-V03 | Baumeister | Haiku | `lib/umgebung.ts`, `.env.example`, `geheimnisse:erzeugen`, Tests | `lib/umgebung.ts`, Skript, Tests | ADR 0022 | V-03 | ✓ c596742, 263cd1d |
| H-V06 | Baumeister | Haiku | Wartungsrouten GET + CRON_SECRET, Sperre, `mail-ausgang`, Tests | `app/api/wartung/**`, `lib/wartung/**`, Tests | ADR 0021 | V-06 | ✓ c596742 |
| E2-TOR | Prüfer + Opus | Haiku/Opus | Stufe B Startseite/Über uns, Sichtabnahme durch frischen Opus-Unteragenten (≥ 8, sechs Kategorien), Vorschau V-13, V-02 | – | REFERENZ, ABNAHME | Z-02, Z-04–Z-09, V-02, V-13 | ✓ `berichte/E2-TOR.md`, `E2-TOR2.md` (Wiederholung am sauberen Build, L-E09) |

### E3 Ausführung I (Ansichten und Auslieferung)
| Kennung | Rolle | Modell | Inhalt | Schreibrechte | Muster/Maßstab | Abhängig von | Kriterium | Stand |
|---|---|---|---|---|---|---|---|---|
| O-05 | Opus | Opus | `attachDatabasePool`, `vercel-build` mit/ohne DB, Migrationssperre, Instrumentation | `lib/db/index.ts`, `scripts/vercel-bau.mjs`, `scripts/migriere-mit-sperre.mjs`, `instrumentation.ts` | ADR 0018/0019 | – | V-04 | ✓ 0c224da |
| O-06 | Opus | Opus | Blob privat, Bildvarianten, Verkleinern im Browser, `MedienBild` srcset | `lib/storage/**`, `lib/medien/**`, `app/medien/**`, Medien-Aktionen/-Formulare | ADR 0020 | O-05 | V-05 | ✓ 47ed617 |
| O-07 | Opus | Opus | `lib/startklar/pruefungen.ts` | `lib/startklar/**`, Test | Kern 2.0 | H-V03 | Z-12, V-11 | ✓ c596742, 8df9556 |
| O-08 | Opus | Opus | Momente B-07 Weg der Gemeinde, B-08 Meilensteinlinie, B-09 Familie der vier | `ueber-uns/Zeitleiste`, `projekte/Meilensteine`, `organisation/FamilieDerVier`, `ErstesSichtbarwerden` | K-007 | O-02 | Z-04, Z-05 | ✓ 280a76a, 80a7d47, 588472a |
| O-10 | Opus | Opus | Über uns als Gesamtansicht (Komposition um B-07) | `(website)/ueber-uns/**`, `website/ueber-uns/**` | REFERENZ | Sichtabnahme Start | Z-04 | ✓ 05dbf97 |
| O-11 | Opus | Opus | Projekte als Gesamtansicht (um B-08) | `(website)/projekte/**`, `website/projekte/**` | REFERENZ | Sichtabnahme Start | Z-04 | ✓ 5732e90 |
| O-12 | Opus | Opus | Organisationsseite als Gesamtansicht (um B-09) | `organisation/**`, `OrganizationPage.tsx` | REFERENZ | Sichtabnahme Start | Z-04 | ✓ 9e5d730 |
| O-13 | Opus | Opus | Gemeinsame Elemente Karte → Detail (B-05 Morph) für Veranstaltungen und Nachrichten | `EventCard`, `NewsCard`, Detailköpfe (nach H-A02/H-A04) | K-007 | B-05-Nachweis, H-A02, H-A04 | Z-05 | ✓ 5bca4db (Nachweis E3-TOR) |
| H-A01 | Baumeister | Haiku | Gebetszeiten | `(website)/gebetszeiten/page.tsx`, `website/gebetszeiten/**` (ohne `anzeige/`) | REFERENZ | – | Z-03, Z-04 | ✓ 8454895 |
| H-A02 | Baumeister | Haiku | Veranstaltungen und Detail (zusammengelegt nach L0), Ganztags-Anzeige statt „00:00 Uhr“ | `(website)/veranstaltungen/**`, `website/veranstaltungen/{Leerzustand,TeilenKnopf,VeranstaltungsFilter}`, `EventCard` | REFERENZ | – | Z-03, Z-04 | ✓ f63e3d9 |
| H-A04 | Baumeister | Haiku | Nachrichten und Detail, Überlauf 390/768 aus E0 | `(website)/nachrichten/**`, `website/nachrichten/**`, `NewsCard` (nur Überlauf) | REFERENZ | – | Z-03, Z-04, Z-09 | ✓ 3efe7c3 |
| H-A05 | Baumeister | Haiku | Korankurse | `(website)/bildung/korankurse/**`, `website/korankurse/**`, `CourseCard` | REFERENZ | – | Z-03, Z-04 | ✓ 7e5101a |
| H-A06 | Baumeister | Haiku | Schüler-Voranmeldung samt Formular-Bausteinen (FormWizard, Felder, Rückmeldung; B-11/B-12, früher H-Z03) | `(website)/bildung/voranmeldung/**`, `website/formulare/VoranmeldungFormular.tsx`, `components/formular/**` (Darstellung, Logik UNANTASTBAR) | REFERENZ | – | Z-03–Z-05 | ✓ 966db8c |
| H-A07 | Baumeister | Haiku | Kontakt | `(website)/kontakt/**`, `website/kontakt/**` | REFERENZ, H-A06 | H-A06 | Z-03, Z-04 | ✓ 15f1013 |
| H-S01 | Baumeister | Haiku | Cockpit-UI `/verwaltung/startklar` | `verwaltung/(geschuetzt)/startklar/**`, `components/verwaltung/startklar/**`, `server/actions/startklar.ts` | Kern 2.0 | O-07 | Z-12, V-11 | ✓ 0cd8173 |
| H-S02 | Baumeister | Haiku | `pnpm startklar`, `pnpm release:check`, Tests | `scripts/startklar.ts`, `scripts/release-check.mjs`, Tests | Kern 2.0 | O-07 | Z-12 | ✓ 8df9556 |
| E3-TOR | Prüfer + Opus | Haiku/Opus | Stufe B der fertigen Ansichten, Sichtabnahme (Opus), Vorschau | – | ABNAHME | alle E3-Pakete | Z-02–Z-09, V-13 | ✓ `berichte/E3-TOR.md` (bedingt bestanden, Maßnahmen ae274ac, cf0d4d9), Sichtabnahme E3 (`berichte/SICHTABNAHME-E3.md`) |

### E4 Ausführung II (Bausteine, Zustände, Auslieferung, Dokumente)
Die Bausteine H-G und die Zustände H-Z laufen vor dem E3-Tor (L0), damit sich die Bausteine nach den Ansichtsbildern nicht mehr ändern.
| Kennung | Rolle | Modell | Inhalt | Schreibrechte | Muster/Maßstab | Kriterium | Stand |
|---|---|---|---|---|---|---|---|
| H-G01 | Baumeister | Haiku | Header und Mobilmenü (B-03) | `Header.tsx`, `website/kopf/**` | REFERENZ, K-007 | Z-04, Z-05 | ✓ 67a4b0e |
| H-G02 | Baumeister | Haiku | Footer | `Footer.tsx`, `website/fuss/**` | REFERENZ | Z-04 | ✓ d6a2121 |
| H-G03 | Baumeister | Haiku | PrayerTimesBar, Gebetszeit-Wechsel B-10 | `PrayerTimesBar.tsx`, `website/leiste/**` | K-007 B-10 | Z-05 | ✓ 53b9bc5 |
| H-G04 | Baumeister | Haiku | Seitenkopf/PageHeader/Breadcrumbs vereinheitlichen | `Seitenkopf.tsx`, `PageHeader.tsx`, `Breadcrumbs.tsx` | REFERENZ | Z-03, Z-04 | ✓ 58f9840 (Rest nach O-03) |
| H-Z01 | Grafiker/Baumeister | Haiku | Fehlerseiten mit Charakter (Pflicht nach AUFTRAG §6): 404, `error`, `global-error` mit Zustandsgrafik | `app/**/not-found.tsx`, `error.tsx`, `global-error.tsx`, `website/fehler/**` | K-008 | Z-04, Z-06 | ✓ a8a377f (+ Offline-Grafik) |
| H-Z02 | Grafiker/Baumeister | Haiku | Offline-Seite, Lade-Zustände (B-12) | `(website)/offline/**`, `loading.tsx` | K-008 | Z-04–Z-06 | ✓ Offline-Grafik a8a377f; Lade-Achtstern in allen Absendeknöpfen (966db8c); Detailseiten mit Suspense ohne Platzhalter, Seitenwechsel wartet auf neuen Inhalt (5bca4db) |
| H-W01 | Baumeister | Haiku | E-Mail-Vorlagen | `lib/mail/vorlagen/**` | REFERENZ (Farben, Schrift) | Z-04 | ✓ `berichte/H-W01.md`, be3025e (ML-17 Postfachprüfung) |
| H-W02 | Baumeister | Haiku | Bildschirm-Anzeige: nur Zustandswechsel | `(website)/gebetszeiten/anzeige/**`, `website/anzeige/**` | K-007 B-10 | Z-05 | ✓ `berichte/H-W02.md`, f10b55c |
| H-W03 | Baumeister | Haiku | Verwaltungs-Hülle (Feinschliff, `verwaltung:`-Breakpoint, Übersicht) | `components/verwaltung/shell/**`, `uebersicht/**`, Postfach-Rahmen | REFERENZ | Z-03 | ✓ `berichte/H-W03.md`, e3c9b8e; Seitenköpfe 4bf9571 |
| H-D01 | Dokumentar | Haiku | `docs/deploy/VERCEL.md` (30-Minuten-Runbook) | Datei | AUFTRAG V-13 | V-13 | ✓ `berichte/H-D01.md`, 290aaeb |
| H-D02 | Dokumentar | Haiku | `VERCEL-ENV.md`, Verarbeitungsverzeichnis, Hosting-Baustein v2, ML-09–ML-12 | Dateien | AUFTRAG V-03, V-11, V-12 | V-03, V-11, V-12 | ✓ 0cd8173 |
| H-D03 | Dokumentar | Haiku | `docs/GO-LIVE.md` | Datei | Kern 2.0 | Z-12 | ✓ 290aaeb (Opus) |
| H-D05 | Dokumentar | Haiku | Runbook und Umgebungsdoku gegen den Code (Datensicherung, Protokolle, Cache, direkte Migrationsverbindung) | `docs/deploy/*`, `GO-LIVE.md`, MENSCHEN ML-14–16 | AUFTRAG V-10, V-13 | V-10, V-13 | ✓ `berichte/H-D05.md`, f08432e |
| H-D04 | Dokumentar | Haiku | MENSCHEN-Abschluss (jede Aufgabe mit Ort und Aufwand) | `MENSCHEN.md` | AUFTRAG §12 | Z-10, Z-12 | ✓ `berichte/H-D04.md`, 1f1c2d8 (Reihenfolge zum Livegang, ML-22–25) |
| H-V07 | Prüfer | Haiku | Beleg gemeinsamer Zustand: Sitzungen, Raten, ALTCHA, Sperren in der DB; nichts im Prozessspeicher, das Instanzen teilen müssten | – (Bericht) | AUFTRAG V-07 | V-07 | ✓ Bericht `protokolle/H-V07-V10-pruefung.md` |
| H-V08 | Prüfer + Baumeister | Haiku | Caching wie lokal: `revalidateTag` nach Verwaltungsänderung lokal im Produktions-Build sofort sichtbar; Cache-Header statischer Dateien (ADR 0023 ✓ abd187e) belegen | Bericht, ggf. Tests | ADR 0023, AUFTRAG V-08 | V-08 | ✓ `berichte/H-V08.md` (18/18 sichtbar beim ersten Abruf), ADR 0024 d26e8bc |
| H-V10 | Prüfer | Haiku | Protokolle ohne Personendaten (alle `console.*`/Logger-Aufrufe), Health-Route, Backups/PITR und Rollback im Runbook | – (Bericht) | AUFTRAG V-10 | V-10 | ✓ Bericht `protokolle/H-V07-V10-pruefung.md`; Datenbankfehler gekürzt (`lib/db/fehler.ts`), Health mit Zeitlimit 352d1bb; Runbook § 13/16 (H-D05) |
| H-R01 | Prüfer | Haiku | Wortlaut-Snapshot der Rechts- und Einwilligungstexte: Hash je Text E0 (9ebb4bc) gegen jetzt | `protokolle/` | G6 | Z-12 | ✓ `berichte/H-R01.md`, 024f67d (alle Rechtstexte unverändert) |
| H-L01 | Prüfer + Baumeister | Haiku | Leistung: Paarmessung Ausgangsstand/Nachher unter ruhigen Bedingungen, Budgets (JS ≤ 180 KB gz, TBT), Ursachen beheben | Bericht, Befundpakete | ABNAHME Z-08 (E0-Spanne 80–94) | Z-08 | Ursachen behoben in drei Teilen (6701f1c, 9b8ffd0, e0c8e9f; `berichte/H-L01.md`); Nachmessung verschränkt ×5 am Endstand fa5c005 (Stufe C Schritt 12, `berichte/STUFE-C2.md`) |
| H-BILD | Dokumentar | Opus | E0-Bilder ins Repo (`bilder/e0/`, `bilder/e0-reduziert/`) | `_werkstatt/bilder/**` | AUFTRAG §8 | Z-04, Z-10 | ✓ (dieser Stand) |
| H-B… | Baumeister | Haiku | Befundpakete aus den Sichtabnahmen (≤ 2 je Ansicht und Kategorie), ≈ 12 | je Befund | REFERENZ | Z-04 | ✓ H-B01–B14 + Welle 0 (`berichte/H-B*.md`, Noten 7,5–8,5; f44119b); H-C01–C13 aus Sichtabnahme E4 ✓ (Noten 8–8,5; f0685ed, cd37656, 0dc2e7c, 5d19108) |
| E4-TOR | Prüfer + Opus | Haiku/Opus | Stufe B, Sichtabnahme, Vorschau | – | ABNAHME | Z-02–Z-09, Z-11 | ✓ Bildsatz E4 (127a9e7), Sichtabnahme E4 (Ø 7,16 → 13 H-C-Pakete, `berichte/SICHTABNAHME-E4.md`), H-L01 Paarmessung (`berichte/H-L01.md`) |

### E5 Kür und Abschluss
Kür nach Wirkung, je ein Haiku-Paket nach Referenz, 20 benannt. Inhalte werden nicht erfunden. „Islamisches Wissen“ und „Quran-Seiten“ gestalten nur die Darstellung vorhandener, belegter Inhalte, ohne Verse als Schmuck (G7).
1. Vorstand · 2. IGMG · 3. Webseite für Moscheen · 4. Suche (Ergebnisse, leer) · 5. OG-Bilder · 6. Druckansicht Gebetszeiten · 7. Choreografie des Mobilmenüs · 8. Islamisches Wissen (Übersicht) · 9. Islamisches Wissen (Thema) · 10. Quran-Übersicht · 11. Quran-Sure (Lesesatz) · 12. Mitglied werden (Formular) · 13. Meldung (Formular) · 14. Impressum/Datenschutz (Lesesatz, Wortlaut unverändert) · 15. Anmeldung Verwaltung (Login, Zwei-Faktor) · 16. Verwaltung: Listen und Leerzustände · 17. Verwaltung: Formular-Rückmeldungen · 18. Veranstaltungsanmeldung (Formular im Detail) · 19. Kalender-Abo-Hinweis · 20. Druckansicht Veranstaltung.

Danach Stufe C (Haiku), BERICHT.md mit Galerie (Dokumentar), Endprüfung durch frischen Opus-Unteragenten, CLAUDE.md-Block entfernen, ABSCHLUSS.

## Wellen (Takt L2)
- Welle = bis zu 4 Haiku-Pakete mit disjunkten Schreibrechten + Opus-Arbeit.
- Nach jeder Welle:
  1. Gemeinsame Dateien übertragen (Opus).
  2. Build durch Haiku-Prüfer.
  3. Commit und Push des Arbeitsbranchs.
  4. Bei Grün und `pnpm check` grün: Fast-Forward auf `main` (L-E01), danach das Produktions-Deployment per Vercel-MCP lesen.
- Stündlich (L4): STATUS, PRÜFPUNKT, Commit `ZWISCHENSTAND …`.

## Offene Punkte
- B-05 (React `<ViewTransition>`) löste im Entwicklungsserver nicht aus. Nachweis im Produktions-Build (E2-TOR); ohne Unterstützung bleibt der Wechsel ohne Überblendung, und der Register-Eintrag wird angepasst.
- Lighthouse schwankt durch parallele Arbeit. Deshalb Paarmessung in Stufe C (H-L01).
- Produktion läuft ohne Datenbank: Jeder Push auf `main` muss den PGlite-Rückfall im Bau erhalten.
- Formular-Integrationstests liefen unter Last in die Zeitgrenze. Ursache: echte ALTCHA-Aufgaben, bis ≈ 40 s je Lösung bei Last 4–5. Die Grenze wurde angehoben (L-E07), keine Prüfung abgeschwächt.

## Statusnachweis (Stand 2026-10-12 15:15 UTC)
Pflicht erledigt 70 von ≈ 70:
- die 69 vom 07:10-Stand,
- dazu Stufe C mit Endstand-Messung und Nacharbeit (`berichte/STUFE-C3.md`):
  - Endstand 58a3344, Nacharbeit 4331b03, 01589e8, 76eda7a, 466ddfb, 6e1b46a, de91dcd;
  - release:check auf HEAD bestanden;
  - main → fc08263.

Ebenfalls umgesetzt:
- Befundwelle H-E aus der Sichtabnahme C2 (14 Pakete, bis 8e93ef8).
- Produktionsfehler des Beispielmodus (ce6e6a5).

Offen ist nur noch der Abschlussschritt: Sichtabnahme C3 als Vorprüfung für Z-04, dann die Endprüfung. Ausnahmen: 1 (A-01, L-E14). Kür 20 von 20.

### Stand 2026-10-12 07:10 UTC
Pflicht erledigt 69 von ≈ 70: die 66 vom 02:10-Stand plus E4-TOR mit Sichtabnahme E4 und H-C01–C13 (5d19108), H-D04 (1f1c2d8) und H-L01 (Ursachen I–III; Nachmessung läuft). Offen ist nur noch die Endprüfung nach Stufe C: erste Messung 5d19108 in `berichte/STUFE-C.md`, Nacharbeit fa5c005, Nachmessung `berichte/STUFE-C2.md`. Kür 20 von 20.

### Stand 2026-10-12 02:10 UTC
Pflicht erledigt 66 von ≈ 70: die 50 unten plus E3-TOR, H-V08 und H-B01–B14. Offen: H-L01, E4-TOR (Sichtabnahme E4 + H-C), H-D04, Stufe C mit Endprüfung. Kür 20 von 20 (K-01–K-20; K-09/K-11/K-13/K-17 in den Berichten K-08, K-10, K-12, K-16).

### Stand 2026-10-11 19:50 UTC
Pflicht erledigt 50 von ≈ 70:
- E0: 6
- E2: 10 (O-02 zählt erst mit dem B-05-Nachweis am Produktions-Build)
- E3: 16 (O-05–O-08, O-10–O-13, H-A01/02/04–07, H-S01/02)
- E4: 18 (H-G01–G04, H-Z01, H-Z02, H-D01–D03, H-D05, H-BILD, H-V07, H-V10, H-R01, H-W01–W03, E0-PRUEFER-03)

In Arbeit: Workflow wf_fb525305-e2a (E3-Tor-Auswertung in vier Bereichen + Bilder von bc4b5b7). E3-TOR-Lauf fertig 20:57 (Bericht durch Nutzungslimit abgebrochen, Auswertung im Workflow). Kür fertig: K-01 Vorstand (daf29ba), K-02 IGMG (bc4b5b7), K-03 Webseite für Moscheen (0954781), K-08 Islamisches Wissen und K-15 Anmeldung (e5f9ab7). Zusätzlich aus Befunden: Suche findet Wortteile (F-14, e7bd4a9), Beispielmodus ohne Datenbank (4fdf313, ADR 0019 Nachtrag), Leiste ohne Verschieben (f10b55c). Neu entschieden: L-E09 (Build ohne Turbopack-Zwischenspeicher), L-E10 (eigener Seitenwechsel), ADR 0024 (geteilter Cache). Kür 5 von 20.
