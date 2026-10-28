# Bericht: Marktstart der Website mit IGMG-Daten

Stand: 28.10.2026. Lauf „IGMG-Daten für den Marktstart der Wetzlar-Seite nutzen“. Plan: `/root/.claude/plans/root-claude-uploads-d2cbb575-0c84-5ded-cozy-llama.md`. Arbeitsbranch: `claude/peaceful-dirac-e7a06r`, Draft-PR umutcantezgel-cpu/IGMG#5.

## 1 Auftrag

Die Website der IGMG-Gemeinde Wetzlar (`web/`, Next.js 16.4, de/tr/en) geht an den Markt. Grundlage sind vier Crawl-Exporte vom 13.10.2026: igmg.org (1.301 Seiten) und igmgreisen.com (88 Seiten), je als Markdown und JSON. Ziel:

- Belegtes vom Dachverband übernehmen, mit Quelle und Stand.
- Die Seite mit dem Netz der IGMG verlinken (Fachvereine, IGMG Reisen, Gebetskalender, Freitagspredigten).
- Neue Bausteine bauen: „Aus dem Dachverband“, „Hadsch & Umra“, IGMG-Gebetszeiten, gekennzeichnete Erklärtexte.
- Die Seite für Suche und Antwortmaschinen profilieren (SEO, AEO, GEO).

## 2 Entscheidungen des Nutzers

**E-044 (27./28.10.2026, verbindlich):**

1. Die IGMG hat zugestimmt. Alle Texte schreibt der Lauf selbst; Fakten wie Zahlen und Kontakt kommen mit Quelle und Stand.
2. „Aus dem Dachverband“ zeigt Freitagspredigt und Gemeinschaftsthemen, keine politischen Pressemitteilungen.
3. Der IGMG-Gebetskalender (Wetzlar, ID 20238) ist die offizielle Quelle; gewünscht ist ein automatischer Abgleich.
4. Gründungsjahr der Gemeinde: 1978 (Beleg: IGMG-Artikel vom 07.04.2008, 30-Jahr-Feier).
5. Religiöse Erklärtexte schreibt der Agent; sie gehen sofort live, gekennzeichnet als „Entwurf zur Prüfung“, und der Imam gibt sie später frei. Verse, Hadithe und Bittgebete schreibt der Agent weiterhin nie.
6. `noindex`, solange der Konzept-Hinweis aktiv ist; danach indexierbar.
7. Vor dem Marktstart wird die Datenbank angeschlossen (GO-LIVE G1).

**E-045 (28.10.2026, KERN 1.2):** K-03 um die Bestandsrouten und `/hadsch-umra` (tr `/hac-umre`, en `/hajj-umrah`) ergänzt; K-08 (a) Tabellen aus Import oder IGMG-Abgleich; K-16 um WebSite und FAQPage, Organization mit Dachverband und Regionalverband.

**ADRs:** 0046 Inhalte vom Dachverband, 0047 KI-Regel 3 (gekennzeichnete Entwürfe auf der Website), 0048 IGMG-Gebetskalender (Abgleich, Lese-API, Näherung), 0049 Sichtbarkeit in Suche und Antwortmaschinen. Nachträge in 0008, 0012, 0019, 0030 (Kopf), 0032 und 0046.

## 3 Pakete und Commits

| Schritt | Commit | Inhalt |
| --- | --- | --- |
| Fundament (Welle 0/1) | `fa75235` | E-044/E-045, KERN 1.2; URL-Schemas, Netzwerk-Verzeichnis (38 Ziele, 9 Hosts), `Verweisliste`, `Quellenzeile`, `NachKlick` (YouTube nach Klick), CSP `frame-src` für OpenStreetMap und youtube-nocookie, Entitätsdaten, Inhalte-Wächter |
| P6 Gebetszeiten | `76162f6` | Import repariert (İmsak/İkindi), „Tabelle einfügen“, Migration 0024, Abgleich-Route mit Cron, kalibrierte Näherung, Lese-API `/api/gebetszeiten/<JJJJ-MM>`, Startklar, ADR 0048 |
| P1 `/igmg` | `e2ff755` | Kennzahlen aus der Broschüre Juni 2026, Leitbild, Organe, Fachvereine, Zentralkontakt, Fragen, Reiter-Anker, ADR 0046 |
| P2 Gemeinde | `906ec1c` | Gründung 1978, Stationen 2008/2011, Vorstand „seit 1978“, Organisationen mit Dachverband-Verweis |
| P8 SEO/AEO/GEO | `dd28454` | Gemeinde-Graph (Organization, Mosque, WebSite), FAQPage, Metadaten je Seite, Indexierungs-Schranke, Sitemap je Sprache, `/llms.txt`, ADR 0049 |
| P3 Dachverband | `77e1cb6` | Seiteninhalt `dachverband`, Hutba-Feed (nur Titel, Datum, Link), Cron, Startseite, Nachrichten, Wissen, Organisationsseiten, Editor |
| P5 Erklärtexte | `89e4615` | Vier Wissensthemen als gekennzeichneter Entwurf, Schalter `website_wissen_vorschau`, `WissenErklaerung`, ADR 0047 |
| (Lern-App) | `699eb8a` | SRS-Testgenerator ohne Dubletten (unabhängig vom Lauf) |
| P4 Hadsch & Umra | `716f0ca` | Neue Seite mit Fristen, Programmen, Abflügen ab Frankfurt, Anmeldung, Unterlagen, Videos nach Klick, Fragen, Editor |
| P7 Querverlinkung | `ff906ad` | Fußblock „IGMG-Netzwerk“, Hasene-Kasten, Fördermitgliedschaft, Ramadan-Begleiter, Kalender, Quellen, Wissensvideos als Link |
| Nach dem Merge | `6bb4640` | `/igmg`: Zusatz der Kennzahl als eigenes `dd` (axe „definition-list“) |
| Welle 3 Doku | `93c1d66`, `aaf6f39`, `5f8b39a`, `9d9ee24`, Abgleich mit dem Code `8947452` | TR-Begriff „Din İstişare Kurulu“, `neu-uebersetzt.json`, Datenschutz-Entwurf YouTube/Karte, Verarbeitungsverzeichnis, GO-LIVE, BETRIEB, ABWEICHUNGEN, Redaktionshandbuch § 12, ADR-Nachträge, MENSCHEN, STATUS |
| Welle 3 Code | `2ca8c11`, `c73485d`, `f1e056e`, `ecfa3f8`, `9988717` | Stand-Migration `inhalte:marktstart` im Bau (nach `inhalte-2026`), `links:pruefen`, Startklar-Platzhalterprüfungen und `auslieferung.meta-beschreibung`, längere Meta-Beschreibungen, Wissensinseln schlanker (Themenseiten 187,5 → 184,3 kB) |
| Gegenprüfung | `b90a012`, `e3c124f`, `7f90a85` und Folgecommits | Befunde der unabhängigen Gegenprüfung behoben (Abschnitt 9), E-046 |

## 4 Was neu ist, Seite für Seite

- **Startseite `/`:** Untertitel „seit 1978“, Abschnitt „Aus dem Dachverband“ (Karte „Freitagspredigt vom {Datum}“ und bis zu drei Aktionen, sortierbar), Gemeinde-Graph als JSON-LD, eigener Metatitel.
- **`/igmg`:** sechs Kennzahlen mit Stand Juni 2026 und Quelle (518 und 350.000 gestrichen), Leitbild, Organe laut Satzung, elf Fachvereine, Zentralkontakt mit Website, „Mehr bei der IGMG“, organisatorische Fragen (FAQPage), Quellenzeile; Reiter per Anker verlinkbar.
- **`/ueber-uns` und `/vorstand`:** Gründung 1978, Stationen 2008 und 2011, Satz zum Regionalverband Hessen mit Link auf `/igmg`, Quellenzeile; Vorstand „seit 1978“.
- **Organisationsseiten:** Block „Teil der IGMG“ mit Verweis auf die IGMG-Seite, „eigenständig seit 2009“, Einträge „Aus dem Dachverband“ nach Art; AT-Texte ohne Anatolien-Deutung.
- **`/hadsch-umra` (neu):** Frist Hadsch 2027 (01.11.2026, blendet sich selbst aus), Programme als Links ohne Preise, Abflüge ab Frankfurt (Stand 13.10.2026), Anmeldung über IGMG Reisen, Unterlagen, fünf Videos nach Klick (youtube-nocookie), Fragen, Erklärteil aus dem Wissensthema; Querlinks von `/ramadan`, `/igmg` und aus dem Fuß.
- **`/gebetszeiten`:** Quellenzeile „Quelle: IGMG-Gebetskalender, Stand …“ bzw. „berechnet (vorläufig)“, Marke je gerechnetem Tag, Fragen zur Herkunft der Zeiten; Lese-API je Monat. In der Verwaltung: Tabelle einfügen, IGMG-Abgleich, Näherung.
- **`/nachrichten`:** Kasten „Aus dem Dachverband“ (nie als Nachricht der Gemeinde).
- **`/islamisches-wissen`:** Predigt-Karte, „Mehr beim Dachverband“, vier Erklärtexte mit Marke „Entwurf“, zwei Hadsch-Videos als Link.
- **`/ramadan`, `/kalender`, `/spenden`, `/mitglied-werden`:** Ramadan-Begleiter und „Umra im Ramadan“, Fitre-Hinweis „Bekanntgabe der IGMG“; Satz zur verbindlichen Bekanntgabe der Festtage durch die IGMG; Hasene-Kasten („Diese Spenden gehen nicht an die Gemeinde“); Kasten „Fördermitglied der IGMG“.
- **`/quellen`:** Abschnitt „Dachverband“ (Website, Broschüren, Satzung, Artikel 2008/2011, Hutba-Feed, Hasene, IGMG Reisen), Gebetskalender unter „Gebetszeiten“.
- **Fußzeile:** Block „IGMG-Netzwerk“, „Spenden“ → `/spenden`, „Hadsch & Umra“ im Schnellzugriff.
- **Suche und Antwortmaschinen:** Metatitel und -beschreibungen je Seite in drei Sprachen, `noindex, follow` auf Vercel solange der Konzept-Hinweis an ist, Sitemap je Sprachfassung, `/llms.txt` (404 bis zum Abschalten des Hinweises).

## 5 Tests und Zahlen (aus den Paketberichten)

| Stand | Ergebnis |
| --- | --- |
| Vor dem Lauf | Unit 196 Dateien, 3.744 Tests |
| Fundament | Unit 203 Dateien, 3.808 Tests; `sprachen:pruefen` 3.334 Schlüssel; CSP-Fälle 2/2 |
| P1 | Unit 206/3.871; Integration 19/19 und 59/59 |
| P2 | Unit 204/3.824; Integration 79 Tests grün |
| P6 | Unit 211/3.889; Integration 5 Dateien, 1.106 Tests; Näherung gegen IGMG-Tabelle Aachen 10/2026: höchstens 1 Minute (Turkey: Yatsı im Mittel 4,65 Min.) |
| P8 | Unit 205/3.831; Integration 111/111; `seo.spec` gegen den Bau: 1.158 Sitemap-Adressen, 108 `lastmod`; mit `VERCEL=1` überall `noindex, follow` und `/llms.txt` 404 |
| P3 | Unit 220/4.035; Integration 11/11, 146/146 und Rechte-Matrix 1.543; E2E `dachverband.spec` 12/12, Barrierefreiheit 18/18 |
| P5 | Unit 219/4.013; Integration 148/148 (Schalter aus: 12 Themen, an: 16 mit 4 gekennzeichnet) |
| P4 | Unit 223/4.079; E2E `hadsch-umra.spec` 18/18, mit Barrierefreiheit und Datenschutz 66/66 |
| P7 | Unit 223/4.070; E2E `querverlinkung.spec` 18/18; Barrierefreiheit/Datenschutz 115 grün, 8 rot (6 × axe auf `/igmg`, behoben in `6bb4640`; 2 × Zeitgrenze `/anmelden` ohne Datenbank) |
| Zusammengeführt (`6bb4640`) | Unit 224 Dateien, 4.092 Tests; `sprachen:pruefen` grün; Integration vor P4/P7: 97 Dateien, 4.001 Tests |
| Welle 3 Doku | Unit `inhalte-waechter`, `igmg-seed`, `wissen-entwuerfe` 37/37; `seiteninhalte-grenzen`, `inhalte-waechter`, `startklar-meilensteine` 45/45; Integration `startklar`, `inhalte-2026`, `verwaltung-seiteninhalte` 77/77; `sprachen:pruefen` 3.561 Schlüssel |
| Welle 3 Code | Unit 226/4.112; Integration 98/4.015; `seo.spec` über 1.161 Sitemap-Adressen grün; E2E 15 Specs: 711 grün, 20 rot nur ohne Laufzeit-Datenbank (`/anmelden` u. a., am Ausgangsstand ebenso) |
| **Endstand nach der Gegenprüfung** (`4009ed8`) | `pnpm check` grün: Unit 228 Dateien, 4.134 Tests; `sprachen:pruefen` 3.563 Schlüssel; Integration 98 Dateien, 4.029 Tests (2 Dateien ohne `TEST_PG_URL` übersprungen); `vercel-build` ohne `VERCEL` grün; Standalone-Server (`SITE_MODE=vorschau`): 14 Stichproben 200 (`/`, `/igmg`, `/hadsch-umra`, `/ramadan`, `/spenden`, `/gebetszeiten`, `/islamisches-wissen`, `/suche`, `/tr/hac-umre`, `/en/hajj-umrah`, `/llms.txt`, `/sitemap.xml`, `/robots.txt`, `/api/gebetszeiten/2026-11`); Vercel (beide Projekte) und Netlify grün |

**JavaScript beim ersten Laden** (gzip, Grenze 180 kB; Messung Welle 3 gegen den Ausgangsstand `9cb7e75`):

| Seite | `9cb7e75` | vor Welle 3 | nach Welle 3 |
| --- | --- | --- | --- |
| `/` | 165,1 | 165,2 | 165,2 |
| `/gebetszeiten` | 171,9 | 171,9 | 171,9 |
| `/igmg` | 162,5 | 162,8 | 162,8 |
| `/hadsch-umra` | – (neu) | 162,5 | 162,5 |
| `/islamisches-wissen` | 178,5 | 179,1 | 177,4 |
| Themenseiten `/islamisches-wissen/<thema>` | **186,8** | **187,5** | **184,3** |

Die Themenseiten lagen schon vor dem Lauf über der Grenze (Bestand); Welle 3 hat den Zuwachs zurückgenommen und 2,5 kB darunter gespart (Marke, YouTube-Link und Leer-Grafik rendert der Server). Nächster Schritt wäre, die Dialoginhalte erst beim Öffnen zu laden.

**Nicht gelaufen:** das volle `pnpm test:e2e` (braucht Docker mit Postgres 17 und Mailpit), Lighthouse (`pnpm messen`, kein passender Headless-Browser), die Videowiedergabe in einem echten Browser (nur per curl: alle fünf Videos `playableInEmbed`).

## 6 8-Wort-Abgleich gegen die Crawls

Einmaliger Abgleich am 28.10.2026, im Speicher, ohne Entpacken:

- **Geprüft:** alle neuen oder geänderten Texte seit `9cb7e75`: 979 Texte aus `messages/{de,tr,en}.json` und `messages/bereiche/*.json` (ohne Verwaltung) und 612 neue Zeichenketten mit mindestens vier Wörtern aus `drizzle/seeds/`. Zusammen 1.591 Texte, davon 721 mit mindestens acht Wörtern.
- **Gegen:** beide Markdown-Crawls, 1.387 Dateien (1.300 von igmg.org, 87 von igmgreisen.com), 449.537 verschiedene Folgen von acht Wörtern. Verglichen wurde klein geschrieben, ohne Satzzeichen und ohne Adressen.
- **Ergebnis:** 6 Treffer, alle erlaubt:
  - 2 englische Titel von Freitagspredigten in `dachverband.ts` („Kaaba: The Qibla of Our Bodies and Our Hearts“, „Mawlid al-Nabi: Upholding the Legacy of the Prophet of Mercy“) – Titel dürfen wörtlich stehen.
  - 3 Titel von Quellen in den Quellenlisten der Wissens-Entwürfe (Beschluss des Gelehrtenrats 2013, Freitagspredigt zu Zakat und Fitra 2014, „Islamische Feste – Zeiten des Gedenkens und Feierns“).
  - 1 Eigenname: „des Europäischen Rates für Fatwa und Forschung (ECFR)“.
- Fließtext ohne Treffer. Die Paketberichte melden dasselbe (P1, P2, P4, P8: 0 Treffer; P3 und P5 nur Titel und Eigennamen).

## 7 Offene Menschen-Punkte

Alle in `_lauf/MENSCHEN.md` § 8; vor dem Livegang `web/docs/GO-LIVE.md` C6–C14.

- **A (vor dem Livegang zwingend):** M-099 schriftliche Zustimmung der IGMG; M-100 offizieller Datenzugang Gebetszeiten; M-101 Imam prüft die vier Erklärtexte und „Bedeutung“/Leitbild; M-111 Datenschutzerklärung YouTube und Karte; M-114 Wissens-Vorschau beim Start.
- **B:** M-102 muttersprachliche Prüfung tr/en; M-103 Regionalverband Hessen; M-104 Ansprechperson und Seminartermine Hadsch & Umra; M-106 Fitre-Betrag; M-109 Unternehmensprofile und Webmaster-Konten; M-110 KI-Crawler; M-113 Positivliste „Aus dem Dachverband“; M-115 zuständige Regionalstelle; M-118 Jahre der Vorstand-Chronik; M-119 Satzungs-Zusammenfassung und Hasene-Text; M-120 Fitre-Linie (E-046).
- **C:** M-105 englischer Name der AT; M-107 jährliche Pflege; M-108 tip.igmg.org, YouTube, Apps; M-112 Moscheeverzeichnis; M-116 Tonsprache der Videos; M-117 Fotos 2008/2011.
- **Beantwortet bzw. fortgeschrieben:** M-025 und M-069 (1978), M-032 und M-074 (Broschüre Juni 2026, Zentralkontakt), M-017, M-017a, M-017b, M-082 (IGMG-Gebetskalender), M-012, M-019, M-020, M-075.

## 8 Risiken

- **Gebetszeiten:** Ohne offiziellen Zugang (M-100) läuft kein Abgleich. Bis dahin gelten eingefügte Tabellen oder die Näherung. Sie ist nur an einem Monat kalibriert (Aachen, Oktober); Sommer und hohe Breiten sind nicht belegt. Gespeicherte Einstellungen ohne `rueckfall` rechnen jetzt mit der Näherung statt Turkey (bis 5 Minuten anders bei Yatsı).
- **JS-Budget:** `/islamisches-wissen` hat 2,6 kB Luft; die Themenseiten liegen mit 184,3 kB über der Grenze (Bestand: 186,8 kB vor dem Lauf).
- **Indexierung:** Die Schranke wirkt nur mit `VERCEL=1`; bei eigenem Hosting mit Docker wäre die Seite trotz Konzept-Hinweis indexierbar (ADR 0049).
- **Beispielmodus:** Ohne Datenbank friert „Aus dem Dachverband“ auf dem Stand des Baus ein (datierte Überschrift). Gespeicherte Inhalte der Redaktion übernimmt die Stand-Migration nicht (`[Gründungsjahr]`, 1975 von Hand nachziehen).
- **Externe Abhängigkeiten:** Ändert die IGMG das Feed-Format oder sperrt den Abruf, endet der Abgleich mit `fehler` (sichtbar über Startklar nach 14 Tagen). Hadsch-Termine und Broschüren-Pfade ändern sich jährlich; camiahaber.com antwortet Bots mit 403.
- **Vercel-Tarif:** vier Crons; das Kontingent des Tarifs prüfen (GO-LIVE C8).
- **Videos:** Wiedergabe über youtube-nocookie nur per curl belegt, nicht in einem echten Browser.
- **Wissens-Vorschau:** Der Schalter zeigt jedes Thema „zur Prüfung“, auch Texte der Redaktion (gekennzeichnet, ohne „KI“). Die Verwaltungsliste zeigt solche Themen als „nicht öffentlich“.
- **Begriffe:** Türkisch „Gelehrtenrat“ ist vereinheitlicht; Englisch („Religious Advisory Council“ / „council of scholars“) und „Ramadan-Begleiter“ sind noch uneinheitlich (M-102).
- **Parallele Bauten:** Gleichzeitige `vercel-build`-Läufe ohne Datenbank teilen `/tmp/igmg-pglite-bau` und stören sich (BETRIEB § 8).

## 9 Unabhängige Gegenprüfung (28.10.2026)

Nach Welle 3 hat ein eigener Workflow den ganzen Branch gegen `9cb7e75` geprüft: acht Bereichsprüfer (Gebetszeiten, Dachverband, SEO, Hadsch & Umra, `/igmg` und Gemeinde, Wissen und Einbettung, Welle-3-Code, Inhalte und Regeln), je Bereich ein Skeptiker, der jeden Fund zu widerlegen versuchte. 29 Funde; drei Skeptiker fielen an der Nutzungsgrenze aus, ihre Funde wurden beim Beheben zuerst am Code geprüft. Behoben in einem zweiten Workflow (drei Pakete in Worktrees, je mit Skeptiker und Nachbesserung) und von Hand; jeder Fix hat einen Test, der am alten Stand scheitert.

**Behoben** (Schwere nach Gegenprüfung):

| Bereich | Fund | Schwere | Commit |
| --- | --- | --- | --- |
| Wissen / Stand-Migration | Endgültig gelöschte KI-Entwürfe kamen mit jedem Bau zurück; jetzt Merker `wissen_entwuerfe_angelegt`, Audit nur für Eingefügtes, Transaktionssperre 4242018 | hoch | `8e2c5cb` |
| Inhalte | Fitre-Widerspruch zwischen `/ramadan` und Wissens-Entwurf; nach E-046 nennen Entwurf und Hasene-Kasten beide Wege, M-120 | hoch | `c871651` |
| Gebetszeiten | Erledigte Konflikte erschienen wieder, „IGMG-Werte übernehmen“ griff auf alte Läufe | mittel | `b90a012` |
| Gebetszeiten | Freigegebene auffällige Tage hielten jeden Folgelauf an (tägliche Freigabe und Mail) | mittel | `b90a012` |
| Gebetszeiten | Konflikt-Mail täglich durch das gleitende Fenster | mittel | `b90a012` |
| Gebetszeiten | Startklar „ok“, obwohl die Quelle „Berechnung“ alle Tabellen ignoriert | mittel | `b90a012` |
| Dachverband | Editor scheiterte nach „Jetzt aus dem Feed holen“ an der Obergrenze | mittel | `e3c124f` |
| Wissen | Neu angelegtes, eingereichtes Thema öffentlich ohne Cache-Erneuerung | mittel | `8e2c5cb` |
| `/igmg` (Verwaltung) | Kennzahl verlor beim Leeren Art und Zusatz | mittel | `af8907b` |
| Datenschutz | Klick-Hinweis und Entwurf verschwiegen die Speicherung durch YouTube nach dem Klick; Entwurf erreicht bestehende Datenbanken (nur Beispielinhalt) | mittel | `c871651` |
| Dachverband (`/igmg`) | Camia als „frühere Zeitschrift“ statt laufender Zeitung (Broschüre 2026, S. 100) | mittel | `c871651` |
| Gebetszeiten | Trockenlauf meldete anderen Status als der echte Lauf | niedrig | `b90a012` |
| Dachverband | Rückfall-Hinweis innerhalb `lang="de"`; „19:30 Uhr“ als Versangabe gesperrt | niedrig | `e3c124f` |
| Hadsch & Umra | Feste „Regionalstelle Hessen“ trotz offenem M-115; Unterlagen-Angaben (Sprache, Ausgabe); fehlender Hinweis „(auf Englisch)“ | niedrig | `e3c124f` |
| SEO | Mehrzeilige Adresse im JSON-LD falsch zerlegt | niedrig | `af8907b` |
| `/igmg` | Fehler bei Nachkommazahl ohne Feldbezug; fremder Anker setzte den Reiter zurück | niedrig | `af8907b`, `1811d8c` |
| Suche | Titel-Suche ohne Datenbank zeigte Entwürfe ohne Marke | niedrig | `8e2c5cb` |
| `/igmg` | Sabah Ülkesi als deutschsprachig ausgewiesen | niedrig | `c871651`, `3bcffb3` |

**Verworfen** (Skeptiker oder Prüfung am Code): RSS-Regex mit quadratischer Laufzeit (nur bei manipuliertem igmg.org, Bau bricht sauber ab), eingefügte Tabelle ohne Ortszeile (zwei Abweichungen von der Anleitung nötig), Sitemap in `robots.txt` unter der Schranke (gewollt, ADR 0049), FAQ-Frist Hadsch 2027 (datiert und sachlich richtig), Kasten „Umra im Ramadan“ (belegt), „toter Klick“ der Reiter (mit echtem React nicht nachstellbar; die Vereinfachung bleibt).

**Nebenbefund ohne Handlungsbedarf:** Auf einer frischen PostgreSQL-**16**-Datenbank bricht die Migration ab („unsafe use of new value … rolle“, alle offenen Migrationen in einer Transaktion). Bekannt und dokumentiert (VERCEL.md 2.1, GO-LIVE G1, `tests/e2e/LIESMICH.md` 1a): Neon und Docker laufen mit PostgreSQL 17, das diesen Fall erlaubt. Nachgestellt am 28.10.2026 mit einem lokalen 16er-Cluster.

**Hinweis Stand-Migration:** Geänderte Texte der Wissens-Entwürfe (Fitre-Absatz) erreichen bestehende Datenbanken nicht, weil die Migration Entwürfe nur einmal anlegt; neue Datenbanken (`db:seed`) haben den neuen Text (GO-LIVE C9, von Hand nachziehen).
