# Verifikation Marktstart IGMG – Welle 3 (Code)

Stand 28.10.2026, gegen den Arbeitsstand `claude/peaceful-dirac-e7a06r` (6bb4640) plus die Welle-3-Commits. Alle Befehle in `web/`.
Umgebung: Node 22.22.0, pnpm 12, PGlite (ohne Docker), Chromium unter `/opt/pw-browsers/chromium`, Ausgangsproxy der Sitzung.

## Ergebnis auf einen Blick

| Prüfung | Ergebnis |
|---|---|
| `pnpm typen` | grün |
| `pnpm lint` | grün |
| `pnpm test:unit` | 226 Dateien, 4112 bestanden, 3 erwartet rot, 1 todo |
| `pnpm sprachen:pruefen` | grün (3561 Schlüssel in de, tr, en) |
| `pnpm test:integration` (voll) | 98 Dateien bestanden, 1 übersprungen; 4015 Tests bestanden, 2 erwartet rot, 4 übersprungen (1348 s) |
| `pnpm vercel-build` ohne `VERCEL` | Exit 0 (2146 Seiten; Bau-Datenbank mit allen Seeds) |
| Standalone-Server (`scripts/start-standalone.mjs`, Port 3100) | läuft; Stichproben siehe unten |
| E2E (15 Specs, `playwright.lokal.config.ts`, telefon + desktop) | 748 Tests: 711 bestanden, 22 rot, 15 übersprungen (30,3 min); 20 davon Umgebungsgrenze, 2 behoben und einzeln grün nachgeprüft |
| `pnpm links:pruefen --quellen` | 77 Adressen aus 116 Quelldateien: 0 Fehler, 23 Warnungen, 54 ok (`../links/2026-10-28-12-46-quellen.md`) |
| `pnpm links:pruefen http://localhost:3100 --max 40` (Crawl) | 39 externe Adressen aus 40 Seiten: 0 Fehler, 1 Warnung (camiahaber.com 403) (`../links/2026-10-28-13-39.md`) |
| Stand-Migration gegen eine Kopie der Bau-Datenbank | `inhalte:2026` und `inhalte:marktstart` laden unter `--conditions=react-server`; alle Bereiche „bereits auf Stand“ |

## E2E im Einzelnen

Specs: seo, datenschutz, barrierefreiheit, hadsch-umra, gebetszeiten-quelle, dachverband, querverlinkung, wissen-entwuerfe,
gemeinde-fakten, welle-a/igmg-reiter, welle-a/igmg-inhalte, welle-a/inhaltsseiten, erzaehlung, sicht-oeffentlich, pwa.

| Spec | bestanden | rot |
|---|---|---|
| seo (desktop; alle 1161 Sitemap-Adressen) | 5 | 0 |
| datenschutz | 263 | 20 (Umgebungsgrenze, s. u.) |
| barrierefreiheit (axe) | 300 | 0 |
| hadsch-umra | 18 | 0 |
| gebetszeiten-quelle | 6 | 0 |
| dachverband | 12 | 0 |
| querverlinkung | 18 | 0 |
| wissen-entwuerfe | 16 | 0 |
| gemeinde-fakten | 8 | 2 → behoben, Nachlauf 10/10 grün |
| igmg-reiter | 4 | 0 |
| igmg-inhalte | 8 | 0 |
| inhaltsseiten | 14 | 0 |
| erzaehlung | 16 | 0 |
| sicht-oeffentlich | 20 | 0 |
| pwa | 3 | 0 |

- **Umgebungsgrenze (20 rot):** `/anmelden`, `/registrieren` und `/passwort-vergessen` antworten im Bau ohne Datenbank mit 404
  (Beispielmodus: Konto-Routen brauchen die Laufzeit-Datenbank). Je drei Sprachen und zwei Geräte sowie „Nach dem Besuch aller
  Routen“ (besucht diese Routen ebenfalls). Am Ausgangsstand 9cb7e75 antworten dieselben Routen ebenso mit 404. Das volle
  `pnpm test:e2e` mit Docker (Postgres 17, Mailpit) lief hier nicht.
- **Behoben (2 rot):** `gemeinde-fakten.spec.ts` suchte den Link „Mehr über die IGMG“ seitenweit; seit P7 steht derselbe Link
  auch im Fuß (Block „IGMG-Netzwerk“). Die Suche ist jetzt auf den Hauptinhalt beschränkt (`getByRole('main')`).
- **seo.spec:** grün ohne die drei Ausnahmen für feste Texte (elifbe en Buchstaben, elifbe tr Lektion 8, meldung tr). Die Ausnahmen
  für Beispielinhalte der Seeds bleiben mit Begründung (die Gemeinde ersetzt sie vor dem Start).

## Stichproben am Standalone-Server

| Adresse | Antwort |
|---|---|
| `/sitemap.xml` | 200, `application/xml`, 1161 `<loc>`, 108 `<lastmod>`, hreflang je Eintrag; `/hadsch-umra` und `/tr/hac-umre` enthalten |
| `/robots.txt` | 200; `Allow: /`, `Disallow` für Verwaltung (3 Sprachen), `/api/`, Suche (3 Sprachen); Sitemap-Zeile |
| `/llms.txt` | 200 (13 020 Byte; Schranke ohne `VERCEL` aus): Fakten mit Quelle, Gründung 1978, Dachverband, Regionalverband Hessen |
| `/api/gebetszeiten/2026-11` | 200, JSON: `monat`, `ort` Wetzlar, `zeitzone` Europe/Berlin, `quelle` „berechnet“, `bestaetigt` false, 30 Tage |
| JSON-LD auf `/` | ein Graph: `Organization` (IGMG Wetzlar, `parentOrganization` Islamische Gemeinschaft Millî Görüş e.V., `foundingDate` 1978), `Mosque` (Fatih-Moschee Wetzlar), `WebSite` |

Hinweis: Der lokale Bau lief ohne `APP_URL`, die absoluten Adressen in Sitemap, robots und JSON-LD zeigen deshalb auf
`http://localhost:3000`. Auf Vercel setzt die Umgebung die Produktionsadresse.

## JavaScript beim ersten Laden (K-12, Grenze 180 kB gzip)

Methode wie P3/P7: `pnpm vercel-build` ohne `VERCEL`, Standalone-Server, Chromium (390 × 844), alle beim Laden geholten Skripte
(einschließlich der Vorab-Ladungen verlinkter Routen) einzeln mit gzip -9 gemessen. Der Ausgangsstand 9cb7e75 lief in einem
eigenen temporären Worktree; die Bauten liefen nacheinander.

| Seite | 9cb7e75 (Ausgang) | 6bb4640 (vor Welle 3) | Welle 3 (Ende) |
|---|---|---|---|
| `/` | 165,1 | 165,2 | 165,2 |
| `/gebetszeiten` | 171,9 | 171,9 | 171,9 |
| `/igmg` | 162,5 | 162,8 | 162,8 |
| `/hadsch-umra` | – (neu) | 162,5 | 162,5 |
| `/islamisches-wissen` | 178,5 | 179,1 | 177,4 |
| `/islamisches-wissen/<thema>` (fivestoesarz, islam) | **186,8** | **187,5** | **184,3** |

- **Bestandsbefund:** Die Themenseiten lagen schon am Ausgangsstand mit 186,8 kB über der Grenze von 180 kB.
- **Unser Anteil** an der Steigerung auf 187,5 kB: +0,4 kB im Bündel der Übersicht (Marke „Entwurf“ mit Zeichen, YouTube-Link
  mit Zeichen; die Themenseite lädt es über die Vorab-Ladung des Links „Islamisches Wissen“), +0,1 kB in der Insel der
  Themenseite (YouTube-Link), +0,1 kB im gemeinsamen Bündel (Kalibrierung der Gebetszeiten aus P6, nicht verändert).
- **Reduziert (Welle 3):** Marke „Entwurf“, YouTube-Link (`VideoLink`) und die Zustandsgrafik „leer“ rendert jetzt der Server
  und gibt sie den Inseln `WissenInsel` und `ThemaInsel` fertig mit; sie liegen nicht mehr im Client-Bundle. Ergebnis: Themenseite
  184,3 kB (−2,5 kB gegenüber dem Ausgang), Übersicht 177,4 kB (−1,1 kB). Die Themenseite bleibt über 180 kB; das ist Bestand und
  braucht eine eigene Entscheidung (z. B. die Dialoginhalte nachladen), nicht im Alleingang umgebaut.
- Rohdaten: Messdateien je Bündel im Scratchpad der Sitzung (`w3-messung-basis.txt`, `-stand1.txt`, `-stand3.txt`).

## Stand-Migration (Smoke-Test)

- Kopie der Bau-Datenbank (`.pglite-bau`, frisch mit allen Seeds): `pnpm inhalte:2026` → „bereits auf Stand 2026“ für projekte und
  ueber-uns; `pnpm inhalte:marktstart` → alle neun Bereiche, die Wissensvideos und die Entwürfe „bereits auf Stand Marktstart“ bzw.
  „alle vorhanden“. Damit sind die Seeds Fixpunkte auch nach dem Umweg über jsonb.
- Die Fälle mit altem Beispielstand, redaktionellen Zeilen, fehlenden Bereichen und der Reihenfolge `inhalte-2026` → Marktstart
  decken `tests/integration/inhalte-marktstart.test.ts` (6 Fälle) und `tests/unit/inhalte-marktstart.test.ts` (10 Fälle) ab.

## Linkprüfung (`--quellen`)

- 0 Fehler. Eine Kommentarzeile mit `http://igmg.org/kontakt` in `netzwerk.ts` war im ersten Lauf ein Fehlalarm; Kommentarzeilen
  in Code-Dateien zählen seitdem nicht mehr.
- 23 Warnungen: 20 × github.com mit 403 (der Ausgangsproxy dieser Sitzung beantwortet github.com mit 403, auch per `curl` –
  Umgebungsgrenze), camiahaber.com 403 (Bot-Schutz, wie erwartet), `opensource.org/license/isc-license-txt` → `/license/isc` und
  `tatoeba.org` → `/en/` (umgezogen, Verweise in den Lizenzangaben bei Gelegenheit aktualisieren).
- Proxy: Node-fetch nutzt `HTTPS_PROXY` nicht von selbst. `undici` liegt nur als Unterabhängigkeit im Lockfile; das Skript braucht
  es nicht: Hinter einem Pflicht-Proxy mit `NODE_USE_ENV_PROXY=1` starten (Node ≥ 22.21). Hier lief es so.
