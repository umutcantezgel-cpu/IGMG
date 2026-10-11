# PLAN – IGMG Wetzlar Web-App (Kern 1.1)

Stand: 2026-10-11 · Version 1 (vor Gegenprüfung) · Grundlage: Auftrag Abschnitte 0–18, freigegebener Plan, ADR 0001–0016, Lichtungen a/b/c, Blätter `_lauf/blaetter/`.

## 1 Pfade und Dateihoheit

**Struktur `web/` (K-18):** `src/app/[locale]/(website)/…` · `src/app/[locale]/verwaltung/…` · `src/app/api/…` (Route Handler) · `src/components/{ui,website,verwaltung}` · `src/lib/{db,auth,mail,storage,gebetszeiten,termine,rechte,audit,validierung,i18n,cache,krypto}` · `src/server/{actions,queries}` · `messages/` · `drizzle/` (Migrationen, `seeds/`) · `tests/{unit,integration,e2e,fixtures}` · `docs/`.

**Nur der Orchestrator schreibt (gemeinsame Dateien):** `package.json`, `pnpm-lock.yaml`, `next.config.ts`, `src/proxy.ts`, `src/i18n/*` (Routing mit **allen** lokalisierten Pfaden ab P2), `src/lib/db/schema/**`, `drizzle/migrations/**`, `src/lib/auth/**`, `src/lib/rechte/matrix.ts`, `src/lib/cache/tags.ts`, `src/app/globals.css` (Tokens), `src/app/[locale]/layout.tsx`, `src/app/[locale]/(website)/layout.tsx`, `src/app/[locale]/verwaltung/layout.tsx`, `messages/*.json`, `docs/MUSTER.md`, `docs/adr/**`, alle Laufdateien.
**Übersetzer** liefern `_lauf/eingang/<Kennung>.json`. **Testschreiber** schreiben nur unter `tests/`. **Baumeister** nur die in ihrem Paket genannten Dateien; braucht ein Paket eine Schema- oder Routing-Änderung, meldet es eine OFFENE FRAGE, der Orchestrator ergänzt vorab oder danach.

**Rollen/Modelle:** K = Kundschafter, B = Baumeister, Ü = Übersetzer, TS = Testschreiber, TL = Testläufer, DP = Darstellungsprüfer, SP = Sicherheitsprüfer, GP = Gegenprüfer, PL = Probeläufer – alle **Haiku 5.5**. O = Orchestrator **Opus 5.5** (Hauptsitzung). OU = Opus-Unteragent (nur Stufe 3 bei Kontextdruck, einmal P5-Prüfung).

## 2 Pakete

### P0 – Umgebung und Bestand (läuft)
| Kennung | Rolle | Stufe | Inhalt | Erlaubte Dateien | Abh. | Akzeptanz | Z |
|---|---|---|---|---|---|---|---|
| S01–S24, V00–V14, C01–C16, T01 | K | 1 | 56 Blätter (Seiten, Verwaltung, Komponenten, Tokens) | je `_lauf/blaetter/<Kennung>-*.md` | – | A1–A8 im Paket; Stichprobe 3×3 | Z-01–Z-05, Z-08 |
| X02 | O | 1 | Text-Inventar LanguageContext (maschinell) | `_lauf/eingang/bestand-languagecontext.*` | – | 165 Schlüssel × 3, fertig | Z-03 |

### P1 – Architektur und Plan
| Kennung | Rolle | Stufe | Inhalt | Dateien | Abh. | Akzeptanz | Z |
|---|---|---|---|---|---|---|---|
| P1-ADR | O | 3 | ADR 0001–0016 (+0008, 0009 nach Quellenbericht) | `_lauf/adr/*` | Erkundung | Denkprotokoll vollständig | alle |
| P1-L | O | 3 | Lichtungen a, b, c | `_lauf/lichtung/*` | – | ERGEBNIS.md je Lichtung | Z-01, Z-02, Z-06 |
| P1-GP1, P1-GP2 | GP | 2 | Plan angreifen (höchstens 2 Runden) | Rückgabe nur | PLAN v1 | Formular GP, ≤ 900 Wörter | alle |

### P2 – Fundament (O, Stufe 3)
| Kennung | Inhalt | Akzeptanz | Z |
|---|---|---|---|
| F01 | create-next-app 16.4 nach `web/`; ADRs nach `web/docs/adr/`; `CLAUDE.md` (@AGENTS.md, E-002), `.mcp.json` | `pnpm build` grün | Z-10 |
| F02 | next.config: cacheComponents, partialPrefetching, reactCompiler, standalone, Header/CSP (ADR 0012), Bilder, Telemetrie aus, agentFeedback aus | Header per curl sichtbar | Z-06, Z-07 |
| F03 | i18n: routing mit allen K-03-Pfaden lokalisiert (de/tr/en), proxy (Locale + Verwaltung-CSP + Umleitungen), request.ts mit root-params, messages-Grundstock aus X02 | `/`, `/tr`, `/en` statisch (○) | Z-01, Z-03 |
| F04 | Tokens als `@theme` (aus T01), Schriften lokal (ADR 0014), shadcn/ui-Grundbausteine nach Tokens (Button, Input, Label, Select, Checkbox, RadioGroup, Textarea, Dialog, Sheet, Tabs, Badge, Table, Pagination, Tooltip, Sonner) | Styleguide-Seite rendert | Z-02, Z-08 |
| F05 | DB: Drizzle-Schema-Grundstock (alle Tabellen aus ADR 0002–0007, 0013, 0015), Migrationen, `src/lib/db` (PostgreSQL über `pg`, PGlite für Tests), Seeds-Gerüst | `pnpm db:migrate` + `pnpm db:seed` grün | Z-04, Z-07 |
| F06 | Auth: Better Auth (Drizzle, 2FA TOTP, Passkey, Einladung, Hook gegen Registrierung, DB-Rate-Limit), `src/lib/rechte` (Matrix, verlangeSitzung/verlangeRecht), Audit-Adapter | Unit-Tests Matrix grün | Z-06 |
| F07 | Adapter: Mail (smtp/datei), Speicher (Dateisystem/S3), Krypto (AES-GCM), Ratenbegrenzung, ALTCHA-Grundlage | Unit-Tests grün | Z-05, Z-07 |
| F08 | Tests: Vitest (unit/integration mit PGlite), Playwright + axe, Skripte `pnpm check`, `pnpm test:e2e`, `pnpm test:integration`; lint-staged, simple-git-hooks, Geheimnis-Prüfung (ADR 0010) | `pnpm check` grün | Z-10 |
| F09 | Verwaltung-Grundgerüst: Anmelden (Passwort → TOTP), 2FA einrichten, Einladung annehmen, Abmelden, leeres Dashboard | E2E „Anmelden mit Zwei-Faktor“ | Z-06 |
| F10 | Betrieb: Dockerfile (standalone), docker-compose (App, PostgreSQL, Mailpit), `/api/health`, `.env.example` | `docker compose up` + Health 200 | Z-11 |
| **Tor P2** | TL: `pnpm check`, `pnpm build`, E2E 2FA, curl `/`, `/tr`, `/en` | alles grün | – |

### P3 – Durchstich (Startseite + Veranstaltungen)
| Kennung | Rolle | Stufe | Inhalt | Erlaubte Dateien | Abh. | Akzeptanz | Z |
|---|---|---|---|---|---|---|---|
| D01 | O | 3 | Hülle: Header (Menüs, Telefonmenü, Sprachumschalter), PrayerTimesBar (nächstes Gebet im Browser), Breadcrumbs, Footer, PageHeader, Skip-Link, View Transitions | `src/components/website/{Header,PrayerTimesBar,Breadcrumbs,Footer,PageHeader,Sprachumschalter}*`, Layout | P2 | Blätter C01–C05 erfüllt, 390/1440 | Z-01, Z-02, Z-08 |
| D02 | O | 2 | EventCard, NewsCard, Beispielinhalt-Hinweis, RichText-Renderer | `src/components/website/{EventCard,NewsCard,RichText,Beispielhinweis}*` | D01 | C06, C07 | Z-02 |
| D03 | O | 3 | Termine-Bibliothek (rrule, Ausnahmen, Zeitzone, iCal) | `src/lib/termine/**`, `src/app/api/ical/**` | P2 | Unit-Tests DST, Ausnahmen | Z-10 |
| D04 | O | 3 | Startseite + Veranstaltungen Liste (Filter, leer) + Detail (Anmeldebereich als Platzhalter für B04) + Queries | `src/app/[locale]/(website)/{page.tsx,veranstaltungen/**}`, `src/server/queries/{startseite,veranstaltungen}.ts`, `drizzle/seeds/veranstaltungen.ts` | D01–D03 | S01, S04, S05 | Z-01, Z-02 |
| D05 | O | 3 | Verwaltungs-Shell (Seitennavigation, Kontomenü) + Modul Veranstaltungen (Liste, Formular, Wiederholung, Ausnahmen, Papierkorb, updateTag) | `src/app/[locale]/verwaltung/veranstaltungen/**`, `src/components/verwaltung/**`, `src/server/actions/veranstaltungen.ts` | D03 | V01-Shell, V02; Änderung sofort öffentlich | Z-04 |
| D06 | Ü | 1 | tr/en für neue Schlüssel aus D01–D05 | `_lauf/eingang/D06.json` | D01–D05 | Stichprobe 10 % | Z-03 |
| D07 | TS | 2 | Unit-Tests Termine + Rechte-Matrix (aus Kriterien) | `tests/unit/{termine,rechte}/**` | D03 | Negativfälle | Z-10 |
| D08 | TS | 2 | Integration Server Actions Veranstaltungen × alle Rollen | `tests/integration/veranstaltungen.test.ts` | D05 | erlaubt/abgelehnt/ungültig | Z-06 |
| D09 | TS | 2 | E2E Startseite, Veranstaltungen, Verwaltung Veranstaltung anlegen → öffentlich sichtbar; Sprachwechsel bleibt auf Seite; Tastatur | `tests/e2e/{startseite,veranstaltungen,verwaltung-veranstaltungen}.spec.ts` | D04, D05 | 3 Sprachen, 390/1440 | Z-01, Z-04, Z-08 |
| **Tor P3** | TL, DP, SP | – | volle Suite + build; DP Startseite/Veranstaltungen/Detail × 390/1440; SP für D05; Lighthouse 3 Routen | – | – | grün; danach `docs/MUSTER.md` | – |

### P4 – Wellen
**Welle A – öffentliche Seiten** (Baumeister je Seite folgen MUSTER „Seite“; Seeds je Seite aus den Blättern mit `quelle`, ADR 0015)
| Kennung | Rolle | Stufe | Inhalt | Erlaubte Dateien (zusätzlich je eigener Seed `drizzle/seeds/<bereich>.ts`, Query `src/server/queries/<bereich>.ts`) | Blatt | Z |
|---|---|---|---|---|---|---|
| A01 | B | 2 | Nachrichten Liste (Filter, leer) | `(website)/nachrichten/page.tsx` | S06 | Z-01, Z-02 |
| A02 | B | 2 | Nachricht Detail (ähnliche Artikel) | `(website)/nachrichten/[slug]/**` | S07 | Z-01, Z-02 |
| A03 | B | 2 | Über uns | `(website)/ueber-uns/**` | S08 | Z-01, Z-02 |
| A04 | B | 2 | Vorstand + PersonCard | `(website)/vorstand/**`, `components/website/PersonCard*` | S09, C10 | Z-01, Z-02 |
| A05 | B | 2 | Projekte (Spendenangaben aus Seiteninhalt, 3D-Platzhalter) | `(website)/projekte/**` | S10 | Z-01, Z-02 |
| A06 | B | 2 | Kontakt (Seite, Karte erst nach Klick; Formularfläche für B03) | `(website)/kontakt/**`, `components/website/KarteNachKlick*` | S11 | Z-01, Z-07 |
| A07 | B | 2 | IGMG + OrgCard | `(website)/igmg/**`, `components/website/OrgCard*` | S12, C08 | Z-01, Z-02 |
| A08 | B | 2 | OrganizationPage-Komponente | `components/website/OrganizationPage*` | C11 | Z-02 |
| A09 | B | 2 | Route `/organisationen/[organisation]` + 4 Datensätze | `(website)/organisationen/**` | S15–S18 | Z-01, Z-02 |
| A10 | B | 2 | Korankurse + CourseCard | `(website)/bildung/korankurse/**`, `components/website/CourseCard*` | S19, C09 | Z-01, Z-02 |
| A11 | B | 2 | Islamisches Wissen Übersicht | `(website)/islamisches-wissen/page.tsx` | S14 | Z-01 |
| A12 | B | 2 | Islamisches Wissen Thema `[thema]` | `(website)/islamisches-wissen/[thema]/**` | S14 | Z-01 |
| A13 | O | 3 | Gebetszeiten-Bibliothek (Import CSV/JSON, adhan, nächstes Gebet, DST, Qibla) | `src/lib/gebetszeiten/**`, `src/server/queries/gebetszeiten.ts` | ADR 0008 | Unit-Tests | Z-10 |
| A14 | B | 2 | Gebetszeiten Tabs Heute + Monat (druckbar, Ramadan) | `(website)/gebetszeiten/page.tsx`, `components/website/gebetszeiten/{Heute,Monat}*` | S02 | Z-01, Z-02 |
| A15 | B | 2 | Gebetszeiten Tabs Qibla + Einstellungen (Kompass nach Klick) | `components/website/gebetszeiten/{Qibla,Einstellungen}*` | S02 | Z-01, Z-07 |
| A16 | B | 3→O | Anzeige Moschee-Bildschirm (fernlesbar, Mitternacht, offline) | `(website)/gebetszeiten/anzeige/**` | S03 | Z-01 |
| A17 | B | 1 | Impressum + Datenschutz (markierte Entwürfe) | `(website)/{impressum,datenschutz}/**` | S23 | Z-01 |
| A18 | B | 2 | not-found, error, global-error, `/offline` | `src/app/[locale]/{not-found,error}.tsx`, `src/app/global-error.tsx`, `(website)/offline/**` | S24 | Z-01 |
| A19–A21 | Ü | 1 | tr/en je Seitengruppe (Moschee · Islam/Bildung · Organisationen/Recht) | `_lauf/eingang/A19…A21.json` | A01–A18 | Z-03 |
| A22 | TS | 2 | Unit-Tests Gebetszeiten (Import, Berechnung, nächstes Gebet, Sommerzeit) | `tests/unit/gebetszeiten/**` | A13 | Z-10 |
| A23 | TS | 2 | E2E Routenlauf Welle A × 3 Sprachen + axe 390/1440 | `tests/e2e/welle-a/**` | A01–A18 | Z-01, Z-08 |
| **Tor A** | TL, DP, SP | – | volle Suite + build; DP alle neuen Seiten; SP Route Handler | – | – | – |

**Welle B – Formulare und E-Mails**
| Kennung | Rolle | Stufe | Inhalt | Erlaubte Dateien | Blatt | Z |
|---|---|---|---|---|---|---|
| B01 | B | 2 | FormWizard (Fortschritt, Schritte, Fehlerzusammenfassung, Fokus) | `components/website/FormWizard*` | C12 | Z-05, Z-08 |
| B02 | O | 3 | Formular-Infrastruktur: ALTCHA-Route + Widget, Honigtopf, Ratenbegrenzung, Einwilligung, Eingang verschlüsselt, Mail-Ausgang | `src/lib/validierung/basis.ts`, `src/server/actions/formular-basis.ts`, `src/app/api/altcha/**`, `components/website/{Altcha,Honigtopf}*` | ADR 0005 | Z-05, Z-07 |
| B03 | B | 2 | Kontaktformular | `src/lib/validierung/kontakt.ts`, `src/server/actions/kontakt.ts`, `components/website/formulare/Kontakt*` | S11 | Z-05 |
| B04 | B | 2 | Veranstaltungsanmeldung mit Platzzahl | `…/veranstaltungsanmeldung.ts`, `components/website/formulare/Veranstaltungsanmeldung*` | S05 | Z-05 |
| B05 | B | 3→O | Schüler-Voranmeldung (4 Schritte, Kinderdaten) | `…/voranmeldung.ts`, `(website)/bildung/voranmeldung/**`, `components/website/formulare/Voranmeldung*` | S20 | Z-05 |
| B06 | B | 2 | Mitglied werden (3 Schritte) | `…/mitgliedsantrag.ts`, `(website)/mitglied-werden/**`, `components/website/formulare/Mitgliedsantrag*` | S21 | Z-05 |
| B07 | B | 2 | Webseite für Moscheen (3 Schritte) | `…/moschee-anfrage.ts`, `(website)/webseite-fuer-moscheen/**`, `components/website/formulare/MoscheeAnfrage*` | S22 | Z-05 |
| B08 | B | 2 | Mail-Vorlagen Bestätigung (5 Formulare, Texte aus messages) | `src/lib/mail/vorlagen/bestaetigung-*.tsx` | – | Z-05 |
| B09 | B | 2 | Mail-Vorlagen Benachrichtigung, Einladung, Anmeldung, 2FA, Passwort | `src/lib/mail/vorlagen/{benachrichtigung,einladung,anmeldung,zwei-faktor,passwort}*.tsx` | – | Z-05 |
| B10 | Ü | 1 | tr/en Formulare + Mails | `_lauf/eingang/B10.json` | B01–B09 | Z-03 |
| B11 | TS | 2 | E2E je Formular: Erfolg, Fehler, Honigtopf, Rate, Einwilligung, beide Mails in Mailpit | `tests/e2e/formulare/**` | B03–B09 | Z-05 |
| B12 | TS | 2 | Integration Formular-Actions (ungültig, Spam, Rate, Verschlüsselung) | `tests/integration/formulare/**` | B02–B07 | Z-05, Z-06 |
| **Tor B** | TL, DP, SP | – | volle Suite + build; DP Formularseiten inkl. Zustände; SP S1–S8 für alle Form-Actions | – | – | – |

**Welle C – Verwaltung** (MUSTER „Verwaltungsmodul“)
| Kennung | Rolle | Stufe | Inhalt | Erlaubte Dateien (`src/app/[locale]/verwaltung/<modul>/**`, `src/server/actions/<modul>.ts`, `components/verwaltung/<modul>/**`) | Blatt | Z |
|---|---|---|---|---|---|---|
| C01 | B | 2 | Übersicht (Kacheln, Listen) | modul `uebersicht` | V01 | Z-04 |
| C02 | B | 2 | Neuigkeiten (Rich-Text, Bild, Status, Papierkorb) | `neuigkeiten` | V03 | Z-04 |
| C03 | B | 2 | Ankündigungen | `ankuendigungen` | V04 | Z-04 |
| C04 | B | 2 | Seiteninhalte I: Über uns, Vorstand, Projekte, Spendenangaben | `seiteninhalte` (Teil I) | V05 | Z-04 |
| C05 | B | 2 | Seiteninhalte II: Organisationen, Kontaktdaten | `seiteninhalte/organisationen`, `…/kontakt` | V05 | Z-04 |
| C06 | B | 2 | Kurse | `kurse` | V06 | Z-04 |
| C07 | O | 3 | Gebetszeiten (Import mit Vorschau, Berechnung, Quelle umschalten) | `gebetszeiten` | V07 | Z-04 |
| C08 | O | 3 | Eingänge (Liste, Detail, Status, Notiz, Export CSV/JSON, echte Löschung, Audit) | `eingaenge` | V08 | Z-04, Z-07 |
| C09 | B | 2 | Nachrichten (internes Postfach) | `nachrichten` | V09 | Z-04 |
| C10 | B | 2 | Tickets (Meldungen, Status, Kommentare, intern) | `tickets` | V10 | Z-04, Z-05 |
| C11 | O | 3 | Medien (Upload-Pipeline, Alt-Text, Papierkorb, Verwendung) | `medien`, `src/app/medien/**` | V11 | Z-04 |
| C12 | O | 3 | Benutzer und Rollen (Einladen, Rollen, Sperren, 2FA-Status, Konto) | `benutzer`, `konto` | V12 | Z-04, Z-06 |
| C13 | B | 2 | Audit-Log (Filter, Seiten) | `audit` | V13 | Z-07 |
| C14 | B | 1 | Styleguide aus Tokens | `styleguide` | V14 | Z-04 |
| C15 | B | 2 | Rich-Text-Editor (Tiptap, nur Verwaltung) | `components/verwaltung/RichTextEditor*` | ADR 0006 | Z-04 |
| C16 | O | 3 | Löschfristen-Route + Einstellungen | `src/app/api/wartung/**`, modul `einstellungen` | ADR 0005 | Z-07 |
| C17 | TS | 2 | Integration: alle Verwaltungs-Actions × Rollen (generiert aus Matrix) | `tests/integration/verwaltung/**` | C01–C16 | Z-06 |
| C18 | TS | 2 | E2E je Modul (anlegen → öffentlich sichtbar; Eingang sichten, exportieren, löschen) | `tests/e2e/verwaltung/**` | C01–C16 | Z-04, Z-07 |
| C19 | PL | 2 | Probeläufer: fünf Aufgaben | Rückgabe | C01–C16 | Z-04 |
| **Tor C** | TL, DP, SP | – | volle Suite + build; DP Verwaltung 1440/390; SP alle Actions | – | – | – |

**Welle D – Quran, Wissen, Suche, PWA, SEO**
| Kennung | Rolle | Stufe | Inhalt | Erlaubte Dateien | Z |
|---|---|---|---|---|---|
| D-Q1 | O | 3 | Quran-Datenimport nach ADR 0009 (Buildzeit-Skript, Lizenzvermerk) | `scripts/quran-import.mjs`, `drizzle/seeds/quran.ts` | Z-01 |
| D-Q2 | B | 2 | `/quran` (Surenliste, Audio-Zustand als Platzhalter) | `(website)/quran/page.tsx` | Z-01, Z-02 |
| D-Q3 | B | 2 | `/quran/[sure]` (Arabisch rtl, Amiri, Übersetzung oder Platzhalter) | `(website)/quran/[sure]/**` | Z-01 |
| D-S1 | O | 3 | Suche (SQL, Seite, Header-Link) | `src/server/queries/suche.ts`, `(website)/suche/**` | Z-01 |
| D-P1 | O | 3 | PWA: Manifest, Monogramm-Symbole, Service Worker, Offline-Gebetszeiten | `src/app/manifest.ts`, `public/sw.js`, `components/website/ServiceWorker*` | Z-01 |
| D-O1 | B | 2 | SEO: Metadaten + hreflang je Seite (Hilfsfunktion aus MUSTER) | `src/lib/seo/**` + `generateMetadata` in den Seiten (Ausnahme Dateihoheit: nur der Export) | Z-01 |
| D-O2 | B | 2 | sitemap.ts, robots.ts | `src/app/{sitemap,robots}.ts` | Z-01 |
| D-O3 | B | 2 | JSON-LD (Mosque, Organization, Event, NewsArticle, BreadcrumbList) | `src/components/website/JsonLd*`, `src/lib/seo/jsonld.ts` | Z-01 |
| D-O4 | B | 2 | OG-Bilder | `src/app/[locale]/**/opengraph-image.tsx` | Z-01 |
| D-T1 | TS | 2 | E2E Welle D + T8 Netzwerkprotokoll aller Routen | `tests/e2e/welle-d/**`, `tests/e2e/datenschutz/**` | Z-07 |
| **Tor D** | TL, DP, SP | – | volle Suite + build | – | – |

### P5 – Härtung und Übergabe
| Kennung | Rolle | Inhalt | Z |
|---|---|---|---|
| H01 | TL | Lighthouse 6 Routen, Bundle-Größen; O repariert | Z-09 |
| H02 | B | LIZENZEN.md aus Lizenz-Scan (`pnpm licenses list`) | Z-11 |
| H03 | B | README, BETRIEB.md (Backup, Updates, Schlüssel), .env.example vollständig | Z-11 |
| H04 | B | HANDBUCH-VERWALTUNG.md (einfache Sprache, Bildschirmfotos) | Z-11 |
| H05 | TL | Docker-Probelauf, Health, `pnpm audit`, Geheimnis-Suchlauf | Z-06, Z-11 |
| H06 | OU | Unabhängige Prüfung Sicherheit/Datenschutz/Architektur | Z-06, Z-07 |
| H07 | O | Befunde entscheiden, Reparaturpakete, Abnahme, Schlussbericht | Z-01–Z-12 |

## 3 Wellen, Schichten, kritischer Pfad
- **Schicht** = ein Workflow-Lauf mit bis zu 6 gleichzeitigen Haiku-Paketen (≈ 10–20 min je Paket).
- **Kritischer Pfad:** P2 (F01–F10, Orchestrator) → D01–D05 (Orchestrator) → Tor P3 → MUSTER.md → Welle A (A13 zuerst) → Welle B (B02 zuerst) → Welle C (C08, C11, C12) → Welle D → P5. Der Orchestrator ist Engpass bei Stufe 3; während er baut, laufen Haiku-Pakete aus dem Vorrat (Übersetzungen, Tests, Prüfungen, Seeds).
- **Parallel möglich:** Welle A und Teile von Welle B (B01, B08, B09) teilen keine Dateien; Welle C startet nach Tor B, weil Eingänge B02 brauchen.

## 4 Kapazitätsrechnung
| Phase | Haiku-Pakete | Orchestrator-Pakete |
|---|---|---|
| P0 | 56 (+7 Erkundung) | 2 |
| P1 | 2 | 3 |
| P2 | 1 (Tor) | 10 |
| P3 | 4 + 3 Prüfer | 5 |
| Welle A | 21 + 3 Prüfer | 2 |
| Welle B | 10 + 3 Prüfer | 2 |
| Welle C | 13 + 3 Prüfer | 5 |
| Welle D | 7 + 3 Prüfer | 3 |
| P5 | 5 + 1 OU | 1 |
| **Summe** | **≈ 140 Haiku** (inkl. P0) | **≈ 33 Opus** |
Schichten (ohne P0): (≈ 84 Pakete ÷ (6 Plätze × 1 Paket je Platz und Schicht)) = 14 Schichten **+ 20 % Puffer ≈ 17 Schichten**; erwartete Reparaturpakete (≈ 25 %) sind im Puffer enthalten. Modellanteil nach Paketen ≈ 80 % Haiku / 20 % Opus; nach Code-Zeilen eher 50/50, weil Fundament und Stufe 3 beim Orchestrator liegen.

## 5 Nebelkarte
| Punkt | Lage | Wirkung × Unsicherheit | Gegenmaßnahme / Lichtung |
|---|---|---|---|
| next-intl + Cache Components statisch | **gesichert** (Lichtung a) | hoch × niedrig | Muster: Provider im Layout, Link ohne `locale` |
| Better Auth 2FA + Einladung | **gesichert** (Lichtung b) | hoch × niedrig | eigene 2FA-Pflicht; TOTP-Wiederverwendung prüfen (SP) |
| Bildreferenzen | **gesichert** (Lichtung c, 238 Bilder) | mittel × niedrig | – |
| Prerender braucht erreichbare DB beim Build (Docker) | **riskant** | hoch × mittel | F10 klärt: Build gegen DB im Compose-Netz oder Build beim Start; Notlösung `generateStaticParams` mit Mindestwert + Laufzeit-Cache |
| PGlite nur eine Verbindung (Dev-Server + Tests) | angenommen | mittel × mittel | Docker-PostgreSQL für Dev/E2E, PGlite nur Unit/Integration (je Testdatei eigene Instanz) |
| `experimental.sri` mit Turbopack | unbekannt | niedrig × mittel | im Durchstich prüfen, sonst ohne |
| CSP-Nonce in Verwaltung mit Radix-Styles | unbekannt | mittel × mittel | Tor P3 SP; Notlösung `style-src 'unsafe-inline'` nur Verwaltung |
| Turkish-Volltext in PGlite | unbekannt | niedrig × mittel | `suchkonfig()` mit Rückfall `simple` |
| JS-Budget 180 kB bei Header/Menüs/PrayerTimesBar | riskant | hoch × mittel | Client-Inseln klein halten, Radix nur wo nötig, Messung schon im Durchstich |
| Haiku-Qualität bei großen Formularen | riskant | mittel × mittel | Pakete ≤ 400 Zeilen; B05 beim Orchestrator; FEHLERSTATISTIK |
| Next.js-Sicherheitsupdate 14.10.2026 | gesichert (angekündigt) | hoch × niedrig | Sofortpaket, Tor-Kurzlauf |
| Quran-Lizenzen | unbekannt | mittel × hoch | ADR 0009, Platzhalter bis Klärung |
| Gebetszeiten-Methode | angenommen („Turkey“) | mittel × hoch | sichtbar „berechnet“, Import vorbereitet, MENSCHEN M-017 |

## 6 Vorab-Scheitern (Pre-Mortem)
„Der Lauf ist gescheitert, weil …“
1. **… die öffentlichen Seiten am Ende doch dynamisch waren** (ein `headers()`-Aufruf im Layout, Datum im Prerender). Frühwarnzeichen: `ƒ` oder `◐` statt `○` in der Build-Ausgabe. Gegenmaßnahme: `ensureStatic` auf allen Inhaltsseiten; Tor prüft die Build-Tabelle.
2. **… Z-02 nicht erreicht wurde, weil Haiku-Baumeister das Design frei interpretierten.** Frühwarnzeichen: DP-Befunde „hoch“ > 2 je Seite im Tor A. Gegenmaßnahme: Seitenblatt + Referenzbild in jedem Paket, MUSTER mit Beispiel, Reparatur sofort.
3. **… der Kontext des Orchestrators voll lief und der Lauf den Faden verlor.** Frühwarnzeichen: lange Pakettexte im Verlauf, Wiederholungen. Gegenmaßnahme: Rückgaben über Schemas kurz halten, STATUS-Prüfpunkt nach jedem Paket, Stufe-3-Pakete bei Bedarf an OU.

## 7 Tore
Jedes Tor: TL führt `pnpm check`, `pnpm test:integration`, `pnpm test:e2e`, `pnpm build` aus und zitiert; DP prüft neue Seiten gegen Referenzen; SP prüft neue Actions/Routen (S1–S8). Befunde → Reparaturpakete (höchstens 2 Runden je Paket, dann Orchestrator). Danach: STATUS, Nebelkarte, Zielabstand (Z-Tabelle), KERN prüfen.

---

## 8 Revision v2 (nach Gegenprüfung Runde 1, `_lauf/belege/gegenpruefung-runde-1.md`)

### 8.1 Entscheidungen zu den Lücken
| Nr. | Befund | Entscheidung |
|---|---|---|
| L1 | Kontaktformular ohne Artboard | Der Auftrag (Abschnitt 9) verlangt es ausdrücklich. B03 leitet es aus den Formular-Mustern des Designs ab (FormWizard-Feldstil, einstufig); Abweichung „kein Artboard“ in ABWEICHUNGEN.md. |
| L2 | Veranstaltungsanmeldung ohne Feldliste | Festgelegt (E-020): Name, E-Mail, Telefon (optional), Personenzahl (1–10), Einwilligung. Zustände „ausgebucht“ und „Anmeldung geschlossen“ abgeleitet. ALTCHA unsichtbar im Formular. |
| L3 | Welle D ohne Übersetzung | Neues Paket **D-Ü** (Ü, Stufe 1) nach D-Q2…D-O4. |
| L4 | Baumeister und Sprachdateien | Regel (MUSTER): Baumeister liefern neue Schlüssel als `_lauf/eingang/<Kennung>.json` (de, tr, en; neue tr/en markiert); der Orchestrator führt sie vor der Abnahme zusammen. Bis dahin greift der deutsche Rückfall in `src/i18n/request.ts`; `pnpm sprachen:pruefen` macht Lücken sichtbar. |
| L5 | Sicherheitsupdate ohne Paket | Paket **F11** (O, Stufe 2) am 14.10.2026: Next.js-Patch einspielen, Build + E2E-Kurzlauf, Advisories prüfen. |
| L6 | Tickets: öffentlich oder intern | Tickets entstehen in der Verwaltung (Abschnitt 9). Für Z-05 erfüllt das Ticket-Formular: Zod, Erfolg/Fehler, Ratenbegrenzung je Konto, Spam-Schutz durch Anmeldung + Rate, Einwilligung der meldenden Person (Häkchen mit Textversion, falls Personendaten der meldenden Person erfasst werden), Bestätigung an die anlegende Person, Benachrichtigung an die zuständige Rolle (E-021). |
| L7 | ABWEICHUNGEN.md ohne Schreiber | Orchestrator führt `web/docs/ABWEICHUNGEN.md`; Baumeister melden Abweichungen im Ausgabeformular. |
| L8 | Messrouten | T7 nennt sie: Startseite, Gebetszeiten, Veranstaltungen, Veranstaltungsdetail, Nachrichten, Voranmeldung. Messung ab Tor P3 auf allen vorhandenen davon. |
| L9 | T1–T9 nicht definiert | Befehlstabelle in Abschnitt 8.3. |
| L10 | Fehlende Tests | Neue Pakete **TS-U1** (Unit: validierung, seo, mail/vorlagen) in Welle B und D; D-T1 umfasst axe für /quran und /suche. |
| L11 | Verwaltungs-Queries | Jedes Welle-C-Paket darf `src/server/queries/verwaltung/<modul>.ts` anlegen. |
| L12 | Einstellungen | Kein eigenes Modul: Löschfristen in „Eingänge“, Gebetszeiten-Einstellungen in „Gebetszeiten“, Konzept-Hinweis und Kontaktdaten in „Seiteninhalte“. C16 = nur Wartungsroute. Zählung bleibt 14 Module. |
| L13 | Lokalisierte Pfade, Logos | Pfade in `src/i18n/routing.ts` (P2) festgelegt, neue Übersetzungen → MENSCHEN M-061. Logos liegen in `web/public/bilder/logos/` (P2). |
| L14 | Quran-Import ohne Datei | D-Q1: Ohne Datei (oder ohne passenden Hash) bleiben Surenseiten Platzhalter; Build und Seeds laufen ohne Datei grün. |

### 8.2 Reihenfolge und Konflikte
- A13 (Gebetszeiten-Bibliothek) ist **erledigt** (vor D01), D03 (Termine) **erledigt**.
- Abhängigkeiten ergänzt: A14…A16, A22 nach A13 · A09 nach A08 · C02 nach C15 · B03…B07 nach B02 · D-Ü nach allen Welle-D-Paketen.
- Gemeinsame Dateien je Paar genau einem Paket zugeordnet: Nachrichten-Query/Seed → **A01** (liefert Liste und Detail), A02 nutzt sie; Wissen-Query/Seed → **A11**; Gebetszeiten-Query → **O** (A13); A15 liefert nur Komponenten, **A14** bindet sie ein (A14 nach A15); Seiteninhalte-Actions getrennt: `seiteninhalte-moschee.ts` (C04) und `seiteninhalte-organisationen.ts` (C05); `src/lib/seo/jsonld.ts` → **D-O3**; `generateMetadata` schreibt jedes Seitenpaket selbst nach MUSTER (D-O1 prüft nur und ergänzt `src/lib/seo/metadaten.ts`).
- Kontakt- und Veranstaltungsseite: B03/B04 dürfen die Seiten aus A06/D04 ändern (andere Welle, nicht gleichzeitig).
- Z-03 und Verwaltung: Der Auftrag legt die Verwaltung auf Deutsch fest (Abschnitt 0); Z-03 wird auf die Website-Texte bezogen, der Abgleich nimmt `verwaltung` aus. Rückfrage zur Bestätigung in MENSCHEN (M-062), Kriterium wird nicht gesenkt.
- E-010 gilt nur für `_lauf/belege/`; Bildschirmfotos im Handbuch (`web/docs/handbuch/`) zeigen nur Testdaten und werden versioniert.

### 8.3 Prüfbefehle (T1–T9)
| T | Befehl / Werkzeug | Tor |
|---|---|---|
| T1 | `pnpm check` (typegen + tsc, eslint, Unit) | jedes Paket, jedes Tor |
| T2 | `pnpm test:unit`, `pnpm test:abdeckung` (src/lib ≥ 80 %) | jedes Tor |
| T3 | `pnpm test:integration` (PGlite je Datei, alle Rollen) | jedes Tor |
| T4 | `pnpm test:e2e` (eigene DB `igmg_e2e`, Mailpit) | jedes Tor |
| T5 | E2E-Spezifikation `tests/e2e/barrierefreiheit.spec.ts` (axe, Routen × 3 Sprachen × 390/1440) | ab Tor P3 |
| T6 | `_lauf/werkzeuge/app-bilder.mjs` + Darstellungsprüfer | ab Tor P3 |
| T7 | `pnpm messen` (Lighthouse CI mobil, 6 Messrouten) + Bundle-Größe | ab Tor P3 |
| T8 | E2E-Spezifikation `tests/e2e/datenschutz.spec.ts` (Netzwerk nur eigene Herkunft, Cookies) | **ab Tor P3, jedes Tor** |
| T9 | `pnpm build`, `docker compose build app` + Health, `pnpm audit --audit-level high`, `pnpm geheimnisse:pruefen` | P2, P5, jedes Tor (audit) |

### 8.4 Risiken (Ergänzung)
- **Commits:** nur der Orchestrator, seriell, `git add` nur für Paketdateien, Hooks prüfen vor Commit und Push.
- **Engpass Orchestrator:** Stufe-3-Pakete C08 (Eingänge), C11 (Medien), C12 (Benutzer) gehen bei Kontextdruck an einen Opus-Unteragenten (OU); Stufe-2-Formulare (B03, B04, B06, B07) an Haiku nach MUSTER.
- **Späte Gates:** T8 und Bundle-Budget laufen ab Tor P3 in jedem Tor.
