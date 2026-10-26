# Stufe C – Gruppe „e2e“: Offline, Zugänglichkeit, Datenfluss (L8-05)

| | |
|---|---|
| Datum | 26.10.2026 |
| Stand | `fb10e4dd` (Branch `claude/trusting-lovelace-6nfolz`, Haupt-Checkout `/home/user/IGMG`). Die E2E-Belege stammen vom Stand `e06a648b` (Arbeitsbaum `l3-05`), die Wiederholung der Cüz-Tests vom Stand `f56f74bd`. Zwischen `e06a648b` und `fb10e4dd` ändern sich unter `web/` nur `tests/e2e/barrierefreiheit.spec.ts` und `tests/e2e/quran.spec.ts` (`git diff --stat e06a648b fb10e4dd -- web`). Der Anwendungscode der Belege ist also derselbe wie im geprüften Stand |
| Prüfer | Stufe C, Gruppe e2e |
| Kriterien | Z-L04 Offline, Z-L06 Zugänglichkeit, Z-L08 Datenfluss |
| Umfang | Sprachkurse A1–B1 in 6 Richtungen (L3-E16, 25.10.2026); B2/C1 offener Ausbau, nicht Gegenstand. Freigabe nach L3-E15 |
| Nicht im Stand | N8 (Branch `lernapp-n8`, `1c9727b4`, `6a9997c8`, `2b285cb1`, `db36bcb0`, `23af6310` auf `e06a648b`; noch nicht gemergt, Messung läuft). Wirkung auf die Belege: Abschnitt 6 |
| Live | `https://igmg-wetzlarer.vercel.app`, nur GET mit curl, 26.10.2026 12:13–12:20 UTC. Die Seiten tragen `data-bau="fb10e4ddd411"`, Live entspricht also dem geprüften Stand |
| Schrift | Diese Datei enthält keine arabische Schrift und keine religiösen Texte (KI-Regel 2, ADR 0040, `_lernapp/KERN.md` §2) |

## 0. Vorgehen, Befehle, Grenzen

- Ich habe nur gelesen und geprüft und nur diese Datei geschrieben. Kein git add, commit, stash, checkout oder merge. Die
  Arbeitsbäume unter `.claude/worktrees/` habe ich nicht angefasst: `l3-05` nur mit `git log` gelesen, den Branch
  `lernapp-n8` nur mit `git show` und `git diff` aus dem Haupt-Checkout.
- Ich habe keinen Bau, kein E2E, keinen Server und keine MCP-Werkzeuge gestartet. Die E2E-Ergebnisse stammen aus den
  Protokollen des vollen Tors, die ich ausgewertet habe. Ihre Abdeckung habe ich gegen den Quelltext der Specs geprüft.
- Eigene Rohdaten liegen unter `scratchpad/c-e2e/`:
  - `ergebnisse.tsv`: jede Ergebniszeile aus `e2e.log`, `e2e-rest.log` und `e2e-wdh1..3.log` mit Projekt, Spec:Zeile, Ergebnis
    und Dauer.
  - `live/`: Kopfzeilen und Antworten der Live-Abrufe.

| # | Befehl | Ergebnis |
|---|---|---|
| P1 | `python3 -I` liest `tor-final/e2e.log`, `e2e-rest.log` und `e2e-wdh1..3.log` und gleicht sie mit `e2e-liste.txt` ab | Alle 1.222 gelisteten Tests sind in Lauf 1 oder im Rest gelaufen: keiner fehlt, keiner doppelt |
| P2 | Zählung je Projekt | Lauf 1: 885 grün, 8 rot, 125 übersprungen (1.018 Tests). Rest: 201 grün, 1 rot, 2 übersprungen (204). Zusammen: **1.086 grün, 9 rot, 127 übersprungen** |
| P3 | Zählung nur `tests/e2e/lernapp/*.spec.ts` | 136 Tests (68 × 2 Projekte): **103 grün, 1 rot** (`gruppe.spec:155` desktop), 32 übersprungen. Davon 27 telefon (Tests nur für desktop) und 5 desktop (nur Tippen bzw. Bildschirmfotos) |
| L1 | `curl -s -D` (GET) auf 16 Lern-App-Seiten, Kursverzeichnis, Einheitenpaket, beide Service Worker, 3 Manifeste und 2 Modelldateien (Range 0–199) | siehe Abschnitte 3 und 5. Kein `Set-Cookie` in irgendeiner Antwort |
| L2 | `diff` von Live-`/sw.js` und Live-`/lern-app/sw.js` gegen `web/public/sw.js` und `web/public/lern-app/sw.js` | byte-gleich |
| G1 | `git log --grep N8`, `git diff fb10e4dd lernapp-n8 --stat`, `git show` der N8-Commits | Abschnitt 6 |
| C1 | Quelltextsuche: `setTimeout`/`setInterval` in `src/components/lernapp`, `src/lib/lernapp/{engine,oberflaeche}`; `speichereOffline(`; `microphone` in `src/lib/sicherheit/header.ts` | Abschnitte 3–5 |

Umgebung des Tors laut `scratchpad/tor-final.sh` und `tor-final-rest.sh`:

- Produktionsbau mit `E2E_ATTRAPPEN=1`.
- Alle Lern-App-Schalter an: `LERNAPP`, `SYNC`, `SPRECHEN`, `MELDUNGEN`, `GRUPPEN`, `RANGLISTE`.
- Wegwerf-Datenbank `igmg_lernapp_final_e2e` mit allen Inhalten (≈ 147.000 Einträge) und dem Testkurs.
- PostgreSQL und Mailpit; 2 Worker; `retries: 0` (`web/playwright.config.ts:30`).

## 1. Die E2E-Läufe

| Lauf | Protokoll | Stand | Umfang | grün | rot | übersprungen |
|---|---|---|---|---|---|---|
| Lauf 1 (`pnpm test:e2e`, 10:06–10:49 UTC) | `tor-final/e2e.log` | `e06a648b` | telefon vollständig, desktop bis Test 1018. Danach endete die Hintergrundaufgabe an ihrer 2-h-Grenze, die Fehlerdetails am Ende des Laufs fehlen | 885 | 8 | 125 |
| Rest (`--project=desktop`, 150 Orte aus `e2e-rest.txt`, 11:17–11:31) | `tor-final/e2e-rest.log` | `e06a648b`, neu gebaut | die 204 offenen desktop-Tests | 201 | 1 | 2 |
| Wdh 1 (Cüz, 11:07) | `e2e-wdh1.log` | `e06a648b` | 10 | 5 | 5 | 0 |
| Wdh 2 (`gruppe.spec`, desktop) | `e2e-wdh2.log` | `e06a648b` | 2 | 2 | 0 | 0 |
| Wdh 3 (Cüz nach `f56f74bd`, 11:46) | `e2e-wdh3.log` | `f56f74bd`, neu gebaut | 12 | 12 | 0 | 0 |

Der erste Rest-Versuch um 11:06 lief nicht: `--project desktop <dateien>` wurde unter Playwright 1.64 als Projektliste
gelesen, es gab 0 Tests. Er ist kein Beleg. `e2e-rest.log` stammt aus dem zweiten Versuch.

## 2. Rote Tests und ihre Einordnung

| # | Spec:Zeile › Test | Projekt | Lauf 1 bzw. Rest | Wdh 1 | Wdh 2/3 | Bereich |
|---|---|---|---|---|---|---|
| 1 | `barrierefreiheit.spec.ts:176` › Quran, Cüz (de) ist barrierefrei | telefon | rot 35,3 s | rot 32,8 s („Test timeout of 30000ms exceeded“) | Wdh 3 grün 29,4 s | Website |
| 2 | dto. (tr) | telefon | rot 34,2 s | rot 31,7 s (Zeitgrenze) | grün 30,7 s | Website |
| 3 | dto. (en) | telefon | rot 31,4 s | rot 33,2 s (Zeitgrenze) | grün 28,9 s | Website |
| 4 | `quran.spec.ts:39` › /quran/cuz/30 … axe ohne Befund | telefon | rot 32,5 s | grün 28,3 s | grün 26,4 s | Website |
| 5 | `barrierefreiheit.spec.ts:176` › Quran, Cüz (de) | desktop | rot 32,5 s | rot 31,5 s (Zeitgrenze) | grün 30,0 s | Website |
| 6 | dto. (tr) | desktop | rot 32,8 s | rot 32,5 s (Zeitgrenze) | grün 28,8 s | Website |
| 7 | dto. (en) | desktop | rot 33,9 s | grün 28,7 s | grün 33,0 s | Website |
| 8 | `quran.spec.ts:39` › /quran/cuz/30 | desktop | Rest: rot 36,4 s | grün 25,2 s | grün 29,2 s | Website |
| 9 | `lernapp/gruppe.spec.ts:155` › Lehrkraft weist zu, Kind lernt ohne Bestenliste, Lehrkraft sieht „erledigt“ (Mein Bereich ≤ 230 KB) | desktop | rot 33,4 s | – | Wdh 2 grün 50,5 s (JS 181,9 KB gzip) | Lern-App (Z-L06, Z-L09) |

In Wdh 3 tragen die Tests die Zeilen `barrierefreiheit.spec.ts:181` und `quran.spec.ts:84`, weil `f56f74bd` Zeilen einfügt.

**Zählung:** Die Zusammenfassung nennt „7× Zeitgrenze“. Das ist nur Lauf 1. Mit dem Rest sind es **8 Cüz-Rote** (6 ×
barrierefreiheit, 2 × quran.spec) und dazu 1 × gruppe, also 9. Der PRÜFPUNKT (11:50) schreibt „9 rot: 7 Cüz + 1 gruppe“,
das ergibt nur 8. Richtig ist 8 + 1. Wdh 3 deckt alle 8 Cüz-Fälle ab: 12 Tests, nämlich die 8 vorher roten, dazu
`/en/quran/juz/1` und den 404-Test je Projekt.

**Cüz (1–8) – die Einordnung trägt.**

- Ursache ist die Testzeitgrenze von 30 s, nicht ein Prüfbefund:
  - Wdh 1 meldet für alle 5 Roten „Test timeout of 30000ms exceeded“.
  - Alle Roten liegen bei 31–36 s. Grüne Läufe derselben Tests brauchten 25–33 s, liegen also an der Grenze.
- `f56f74bd` ändert nur zwei Dinge: `test.slow()` für die Route mit `gross: true` und für Pfade `/(cuz|juz)/`. Die Prüfungen
  selbst (axe, lang, h1, Seitenscroll) bleiben unverändert, das zeigt der Diff.
- Danach Wdh 3: 12/12 grün. Ein Test (desktop en, 33,0 s) hätte die alte Grenze überschritten.
- Die Tests gehören zur Website (Koran-Seiten) und betreffen Z-L16, nicht diese Gruppe.
- Hinweis: Die Dauer stieg von 16–20 s (20.10.) auf 26–36 s. Das liegt vermutlich an der parallelen Last. Die Größe der
  Cüz-Seite (≈ 6.700 Elemente) bleibt ein Leistungsthema der Website.

**`gruppe.spec.ts:155` (9) – die Einordnung trägt nur eingeschränkt.** Für „rot unter voller Last, einzeln grün“ und
gegen einen Produktfehler spricht:

1. Es war **keine Testzeitgrenze**. Der Test setzt `test.setTimeout(300_000)` und schlug nach 33,4 s fehl. Gescheitert ist
   also eine Erwartung (Standard-`expect` 5 s) oder ein Schritt.
2. Der Fehler lag **vor der Budgetmessung**:
   - Die Zeile `Mein Bereich, Lehrkraft › Lern-App: JS … KB gzip`, die der Test mit `console.log` ausgibt, fehlt in
     `e2e.log`. In Wdh 2 steht sie.
   - Die Standardausgabe der Tests erscheint in `e2e.log` sonst, zum Beispiel zweimal „Gefundene Speicherschlüssel …“.
   - Gescheitert ist also Schritt 0 oder 1: Eltern-Einwilligung mit zwei axe-Prüfungen, oder Anmeldung der Lehrkraft mit
     Pflicht-Zweitfaktor bzw. Navigation zur Lern-App-Seite der Gruppe. axe am Ende und das Budget waren es nicht.
3. Eine **Abhängigkeit über gemeinsame Konten ist ausgeschlossen**:
   - `beispielkonten()` legt je Aufruf eigene Zugänge mit zufälligem Präfix an (`tests/e2e/hilfen/gemeinde.ts:25–43`).
   - `E2E_BEISPIELKONTEN` war in der `.env` des Tors nicht gesetzt.
   - `konten.spec:168`, das kurz vorher den Zweitfaktor einer Lehrkraft einrichtet, betrifft also nicht dieselbe Lehrkraft.
4. Der Schwester-Test `gruppe.spec:317` lief im selben Lauf grün (46,0 s), danach in Wdh 2 nochmals (33,8 s).
5. Wdh 2 lief grün (50,5 s), und das Budget 181,9 KB ≤ 230 KB hält.

Dagegen spricht:

- Die **Fehlermeldung und der Trace sind verloren**. `test-results/` wurde gelöscht, und `test-results/ergebnis.json` ist
  vom Listing-Lauf überschrieben.
- Wdh 2 lief **allein** (1 Worker, frischer Server, frische Datenbank), also nicht unter vergleichbarer Last.

Ergebnis: Ein zeitabhängiger Wackler unter Last ist plausibel. Einen Hinweis auf einen Produktfehler gibt es nicht. Die
Ursache ist aber nicht belegt. Für Z-L06 (axe auf `/lern-app/*/gruppe` mit Daten) und Z-L09 steht der Beleg dieses Tests nur
auf dem Einzellauf.

## 3. Z-L04 Offline – **teilweise**

**Schwelle:**

- ohne Konto voll nutzbar;
- nach dem Speichern Lektion, Wiederholen und „Stufe offline speichern“ ohne Netz vollständig;
- Root-SW-Update behält `igmg-lernapp-*`;
- vorgesehen: E2E mit `setOffline` (telefon und desktop) und E2E zum Root-SW-Update.

**Belege (E2E, Stand `e06a648b` = Anwendungscode `fb10e4dd`):**

| Spec:Zeile › Test | telefon | desktop | Was der Test belegt |
|---|---|---|---|
| `lernapp/offline.spec.ts:11` › Einheit offline speichern, Netz abklemmen: Lektion vollständig spielbar, Fortschritt bleibt | grün 11,7 s | grün 9,3 s | Im Lernpfad wird „Einheit offline speichern“ gedrückt. Danach liegen im Vorrat `igmg-lernapp-schale …/ueben`, `igmg-lernapp-pakete …/tr.a1.test/<sha256>` und `igmg-lernapp-audio …/tr.a1.test-<16hex>.lpa`; in IndexedDB steht `pakete` mit `offline: true`. Dann wird das Netz von Seite und Kontext abgeklemmt (`route.abort('internetdisconnected')`, das erfasst auch die Anfragen des Service Workers; `/api/health` liefert „kein netz“). Lektion 1 läuft vollständig (4/4, 10 XP). Der Lernpfad aus dem Vorrat zeigt „geschafft“, und wieder online ist der Stand derselbe |
| `lernapp/quellen.spec.ts:71` › Lern-App offline: Quellen mit allen Namensnennungen aus dem Vorrat | grün 2,4 s | grün 2,2 s | Hülle samt Programmteilen im Vorrat; ohne Netz die Quellenseite und die Namensnennung je Satz aus einem Paket im Vorrat |
| `lernapp/regression.spec.ts:30` › Update des Root-Service-Workers behält die Vorräte der Lern-App | grün 4,6 s | grün 4,1 s | Zwei Root-SW-Updates. Ein veralteter Website-Vorrat wird geräumt, `igmg-lernapp-*` bleibt unverändert, die Scopes sind `['/', '/lern-app/']` |
| `lernapp/rahmen.spec.ts:204` › Service Worker: eigener Scope /lern-app/, Hülle vorgehalten, Anmeldung nie | übersprungen (einmal je Lauf) | grün 1,8 s | Scope `/lern-app/`; die Hülle (Start, Einstellungen, Quellen, …/ueben ohne Suchteil) ist vorgehalten; `anmelden` und `?l=` nie |
| `lernapp/rahmen.spec.ts:180` › Manifest je Oberflächensprache | übersprungen | grün 1,1 s | eine `id`, Scope `/lern-app/`, Symbole |
| Ohne Konto | | | Alle Spieler-Specs laufen ohne Anmeldung: `lektion`, `typen-a/b/wissen`, `wiederholen-einstufung`, `offline`, `netzprotokoll`, `spielelemente`, `koran`. Sie sind grün in den vorgesehenen Projekten (Abschnitt 4). Im Bau ohne Datenbank (`lernapp-ohne-db.txt`) liefern 16 Adressen 200 und `/lern-app` eine 308-Weiterleitung; Pakete 334/334 mit 200 und gleichem Hash |
| Website zum Vergleich | | | `pwa.spec.ts:14/22/45` desktop grün (Rest); `quran-offline.spec.ts:15` desktop grün |

**Live (12:13–12:20 UTC):**

- `/lern-app/sw.js`:
  - 200, `Cache-Control: no-cache`, CSP der Lern-App mit `connect-src 'self'`, `Cross-Origin-Embedder-Policy: require-corp`.
  - Vorräte `igmg-lernapp-schale-v<bau>`, `-pakete`, `-audio`, `-modelle` (`DAUERHAFT = [PAKETE, AUDIO, MODELLE]`).
  - Nie vorgehalten: `/api/**` und `/lern-app/<ui>/anmelden` (Kopf Z. 21, Code Z. 213).
- `/sw.js` (Root):
  - 200; `activate` löscht nur Vorräte ohne das Präfix `igmg-lernapp-`.
  - Code: `namen.filter((n) => !n.startsWith(VERSION) && n !== KORAN && !n.startsWith(LERNAPP))`.
  - Beide Worker sind byte-gleich mit dem Stand.
- Manifeste `/lern-app/{de,tr,ar}/manifest.webmanifest`:
  - je 200, `id` und `scope` `/lern-app/`, `start_url` `/lern-app/<ui>`, `display` standalone, 3 Symbole.
  - `dir` ist `rtl` nur in ar.
- Ohne Konto in der Produktion:
  - `/lern-app/de/anmelden` und `/lern-app/de/gruppe` liefern 404 (Schalter aus).
  - Start, Lernpfad, Üben, Wiederholen, Tipps, Einstufung, Fortschritt, Wortschatz, Einstellungen und Quellen liefern 200,
    ohne `Set-Cookie`.

**Lücken:**

1. **„Stufe offline speichern“ gibt es nicht.** ABNAHME Z-L04, ADR 0039 Nr. 12, ADR 0038 Nr. 9 und PLAN §3.5 verlangen ein
   bewusstes Speichern der ganzen Stufe mit Ring nach Bytes (B-27). Umgesetzt ist dagegen:
   - „Einheit offline speichern“ je Station: `OfflineEinheit.tsx:91` ruft `speichereOffline(sp, kurs, [einheit], …)`.
   - Das automatische Speichern der aktuellen und der nächsten Einheit: `kursverzeichnis.ts:128` `aktuelleUndNaechste`,
     `LernpfadInsel.tsx:107–115`, `UebenInsel.tsx:146`.
   - Die UI-Texte kennen nur `lernpfad.offline` = „Einheit offline speichern“.
   - In `ENTSCHEIDUNGEN.md` steht keine Entscheidung, die die Schwelle auf „Einheit“ ändert.
   - Für diese Stelle der Schwelle gibt es daher auch keinen E2E-Beleg.
   - `speichereOffline` nimmt schon eine Liste von Einheiten. Es fehlt nur der Knopf je Stufe samt Test.
2. **„Wiederholen ohne Netz“ ist nicht per E2E belegt.**
   - `offline.spec` spielt nur Lektion 1.
   - Wiederholen läuft nur online: `netzprotokoll.spec:27`, `wiederholen-einstufung.spec:164`.
   - Der Code hält `…/wiederholen` beim Speichern zwar vor (`components/lernapp/offline.ts:32`), ein Lauf ohne Netz fehlt aber.
3. **Der Root-SW-Test prüft nur den Vorrat der Hülle.**
   - Ohne gespeicherte Einheit enthält `vorher` nur `igmg-lernapp-schale-v…`.
   - Dass `-pakete`, `-audio` und `-modelle` bleiben, folgt aus der Präfixregel im Code, nicht aus dem Test.
4. **`setOffline` ist durch Routen-Abklemmen ersetzt.** Begründet: `setOffline` erfasst die Anfragen des Workers nicht
   (Belege S1/S6). Das Abklemmen ist strenger, die Abweichung vom Wortlaut trägt.
5. **N8** ändert den Lernpfad und „offline speichern“. Die Belege oben gelten bis zum erneuten Lauf nur für den Stand ohne
   N8 (Abschnitt 6).

**Nacharbeit:**

1. Entweder „Stufe offline speichern“ umsetzen: Knopf je Stufe (unter N8 etwa im Kopf der Stufe), Ring nach Bytes über alle
   Einheiten und Bündel der Stufe, `persist()` erst dort. Dazu ein E2E auf telefon und desktop: Stufe speichern, abklemmen,
   eine Lektion einer anderen Einheit derselben Stufe spielen und eine Wiederholungsrunde drehen.

   Oder eine ausdrückliche Entscheidung festhalten (ENTSCHEIDUNGEN, Fortschreibung ADR 0039 Nr. 12, Wortlaut in ABNAHME),
   dass „Einheit offline speichern“ zusammen mit dem automatischen Speichern der aktuellen und nächsten Einheit die Stufe
   ersetzt.
2. `offline.spec.ts` erweitern: nach der Lektion ohne Netz `…/wiederholen` bis „fertig“.
3. `regression.spec.ts:30` erweitern: vor dem Root-SW-Update eine Einheit speichern oder `igmg-lernapp-pakete` und `-audio`
   anlegen, dann vergleichen.
4. Nach dem Merge von N8 die Liste aus Abschnitt 6 erneut laufen lassen.

## 4. Z-L06 Zugänglichkeit – **teilweise**

**Schwelle:**

- axe: 0 ernste und kritische Befunde auf allen Lern-App-Routen × 3 UI-Sprachen × 2 Breiten;
- jeder Übungstyp per Tastatur, Ziehen nie nötig;
- keine Zeitgrenzen;
- Protokoll der Screenreader-Prüfung; LM-19 ist sonst vorgesehene UMGEBUNGSAUSNAHME mit Ersatzbeleg.

Routen der Lern-App (`src/app/lern-app/**`):

- Start, Lernpfad, Üben (Spieler), Wiederholen, Tipps, Einstufung;
- Anmelden, Einstellungen, Fortschritt, Gruppe, Quellen, Wortschatz;
- nicht gefunden.

**(a) axe auf dem geprüften Stand:** E2E, WCAG 2.0/2.1/2.2 A/AA, gezählt werden ernste und kritische Befunde.

| Spec:Zeile › Test | Routen | Sprachen × Breiten | Ergebnis |
|---|---|---|---|
| `rahmen.spec.ts:84` › axe: Start, Einstellungen, Quellen, Gruppe, nicht gefunden | Start, Einstellungen, Quellen, Gruppe (Hülle), 404, jeweils mit Überlauf 0 | de/tr/ar × 390 (telefon) und 1440 (desktop) | 6/6 grün (8,5–11,3 s) |
| `lektion.spec.ts:91` › axe <ui>: Lernpfad und Spieler (Aufgabe und Rückmeldung) | Lernpfad (echte Einheiten und Testeinheit), Spieler vor und nach der Antwort | de/tr/ar × 390/1440 | 6/6 grün (10,1–12,8 s) |
| `spielelemente.spec.ts:25`, `:102` | Fortschritt und Einstellungen (de); Fortschritt mit Stufen (de, ar); Lernpfad mit abgeschlossener Stufe (de) | de/ar × 390/1440 | 4/4 grün |
| `koran.spec.ts:36` | Koran-Kurs mit „Bedeutung folgt“ | de × 390/1440 | 2/2 grün |
| `typen-wissen.spec.ts:250/262/328`, `koran.spec.ts:126` | Wissen-Lernpfad, 5 Wissenstypen, ar-Oberfläche, Koran-Lektion | de bzw. ar × 1440 | grün |
| `typen-a.spec.ts:357/369`, `typen-b.spec.ts:329/380` | axe je Übungstyp im Spieler | de und ar × 1440 | grün |
| `wiederholen-einstufung.spec.ts:56` | Einstufung (Start, Frage) | de × 1440 | grün |
| `melden.spec.ts:26` | Rückmeldeblatt, Melde-Dialog | de × 1440 | grün |
| `gruppe.spec.ts:155` | Gruppe der Lern-App mit Daten (de/tr/ar) und Lehrkraft-Seite (de/tr/en) je bei 390 und 1440 px; Eltern-Einwilligung | im desktop-Projekt mit beiden Breiten | Lauf 1 rot, **Wdh 2 grün** (Abschnitt 2) |

**(b) Volle Routenmatrix, älterer Stand:**

- `a11y.mjs` am 24.10.2026 (`leistung.md` §6, `scratchpad/l8-leistung/lauf1/a11y.md`):
  - 136 Prüfungen (68 Routen × 2 Breiten), 0 kritisch, 0 ernst, 0 mittel, 0 gering, kein Überlauf.
  - Die Routen umfassen auch Wiederholen, Einstufung, Tipps, Fortschritt, Wortschatz, Anmelden, Wissen und Koran in
    de/tr/ar.
- Dazu 22 Nachprüfungen nach B-1 (`L8-02-gegen-1/-2`).
- Stand `4d00cadf`/`fc95e675` mit dem Testkurs als `a1.e01`, also vor N1, N3, N6 und N7 und ohne echte Inhalte.
- Mit echten Inhalten gibt es nur Lighthouse-Zugänglichkeit 100 auf den 6 Routen der N6-Messung (`leistung.md` C.3).

**(c) Tastatur je Übungstyp:** 25 von 26 Typen sind im E2E nur mit der Tastatur gespielt (desktop):

| Spec:Zeile | Typen | desktop |
|---|---|---|
| `lektion.spec.ts:27` | auswahl, paare, wortbank; Live-Region, Ergebnis | grün 8,3 s |
| `typen-a.spec.ts:357` (de) | bild_wort, frei, hoeren_waehlen, hoeren_schreiben, minimalpaare, luecke, satzbau, formen | grün 14,5 s |
| `typen-a.spec.ts:369` (ar, RTL) | harakat, frei mit Bildschirmtastatur, luecke als Freitext | grün 13,8 s |
| `typen-b.spec.ts:329` (de) | dialog, geschichte, lesen_fragen, grammatik_tipp, schrift_tr, sprechen, schreiben | grün 18,2 s (Rest) |
| `typen-b.spec.ts:380` (ar) | dialog, geschichte, schrift_ar (erkennen, nachspuren), sprechen, schreiben | grün 18,7 s (Rest) |
| `typen-wissen.spec.ts:250` | wahr_falsch, zuordnen, reihenfolge, fallfrage, koran_wort | grün 10,5 s |

Per Tippen (telefon) sind grün: `lektion:79`, `typen-a:363/375`, `typen-b:329/380`, `typen-wissen:256/262`.

- `schrift_latein` ist nur als Unit belegt (`tests/unit/lernapp/typen-b.test.tsx`). Es nutzt dieselbe Komponente
  `SchriftWahl` wie das per E2E geprüfte `schrift_tr`.
- Ziehen ist nie nötig. Nachspuren zeigt auf jedem Gerät den Knopf „auf Papier geschrieben“ (`Nachspuren.tsx:166–174`, ohne
  Gerätebedingung). Im E2E zeichnet desktop allerdings mit dem Zeiger, und telefon tippt den Knopf.

**(d) Keine Zeitgrenzen:** Belegt durch Quelltextsuche, einen eigenen Test gibt es nicht. Die einzigen Zeitgeber der
Lern-App-Oberfläche sind:

- `offline.ts:21`: Warten auf den Worker, 30 s;
- `sprechen/erkennung.ts:135`: Zeitgrenze für Antworten des Workers;
- `sprechen/aufnahme.ts:68`: Höchstlänge einer Aufnahme `MAX_AUFNAHME_MS = 15_000`. Die Aufnahme stoppt dann von selbst,
  lässt sich wiederholen und überspringen („kann gerade nicht sprechen“). Das ist keine Antwortfrist;
- `DatenInsel.tsx:63`: Freigabe einer Objekt-URL.

Es gibt keine Antwortfrist und keinen Countdown.

**(e) Screenreader:** Die Prüfung ist LM-19, **UMGEBUNGSAUSNAHME** (`MENSCHEN.md`: offen). Als Ersatzbeleg dienen:

- Alle Lern-App-E2E sprechen Bedienelemente über Rolle und zugänglichen Namen an (`getByRole`).
- Sie prüfen die Ansagen der Live-Region (`lektion:27`, `typen-*`, `melden:26`, `wiederholen-einstufung`) und die Führung
  des Fokus (`toBeFocused` nach Prüfen, Ergebnis, Meldung, Schreibprüfung).
- Dazu kommt axe nach WCAG 2.2 AA.

**Lücken:**

1. **Die volle Matrix ist auf dem geprüften Stand nicht belegt.**
   - Ohne axe auf diesem Stand sind Wiederholen, Tipps, Wortschatz und Anmelden der Lern-App. Für sie gibt es nur den Lauf
     vom 24.10. mit dem Testkurs.
   - Ebenso fehlen Fortschritt in tr sowie Einstufung in tr/ar und bei 390 px.
   - Seitdem kamen N1, N3 (Auslieferung von Wissen und Koran), N6 (Spieler), N7 und die echten Inhalte hinzu, mit Tipps und
     Wortschatz echter Einheiten.
2. Der axe-Beleg für die Gruppe mit Daten steht nur auf dem Einzellauf `gruppe.spec:155` (Abschnitt 2).
3. Für `schrift_latein` gibt es den Tastaturweg nur als Unit-Test. Der Knopf „auf Papier geschrieben“ wird im E2E nicht mit
   der Tastatur ausgelöst.
4. N8 ändert das DOM des Lernpfads: `<details>`/`<summary>` je Stufe, Stationen erst beim Aufklappen,
   `content-visibility`. Dazu ändert N8 den Spieler (`ladeLektion`, Lexikon erst bei Bedarf). axe im Lernpfad und die
   Tastaturwege gelten bis zum erneuten Lauf nur ohne N8.
5. Die Screenreader-Prüfung LM-19 steht aus (UMGEBUNGSAUSNAHME mit dem Ersatz oben).

**Nacharbeit:**

1. Nach dem Merge von N8 einmal `a11y.mjs` (`_lernapp/werkzeuge/leistung/`, 68 Routen × 2 Breiten) auf dem Merge-Bau mit
   echten Inhalten laufen lassen. Dabei Wiederholen mit Karten, Tipps einer echten Einheit, Wortschatz mit Einträgen und
   Anmelden einschließen. Das schließt die Matrix.
2. Die E2E `lektion.spec:91`, `rahmen.spec:84`, `spielelemente.spec`, `koran.spec`, `typen-*.spec` und `gruppe.spec` (unter
   Last, Trace behalten) auf dem Merge-Stand wiederholen.
3. Optional: ein E2E-Tastaturweg für `schrift_latein` (Vorkurs `de-aus-ar` bzw. `tr-aus-ar`) und „auf Papier geschrieben“
   mit Enter auf desktop.
4. LM-19 bleibt bei Menschen.

## 5. Z-L08 Datenfluss – **erfüllt**

**Schwelle:**

- ohne Konto nur GET an den eigenen Ursprung, keine Cookies;
- POST nur durch ausdrückliche Handlung (anonyme Meldung);
- 0 Drittanfragen, auch nach dem Laden des Modells;
- Sprachaufnahmen verlassen das Gerät nie;
- Header-Prüfung je Bereich.

**Belege (E2E, Stand `e06a648b` = Anwendungscode `fb10e4dd`, Schalter `SYNC` an):**

| Spec:Zeile › Test | Projekt | Ergebnis | Was der Test belegt |
|---|---|---|---|
| `lernapp/netzprotokoll.spec.ts:10` › ohne Konto: nur GET an den eigenen Ursprung, keine API, keine Cookies | desktop (telefon übersprungen: „einmal je Lauf genügt“) | grün 8,2 s | Der Test hört auf `context.on('request')` und erfasst so Seiten und Service Worker. Weg: Start, Lernpfad, Einheit offline speichern, Lektion 1, Einstellung ändern, Wiederholen, Tipps, Start. Erwartet: mehr als 10 Anfragen, keine ohne GET oder an fremde Ursprünge, keine unter `/api/` (auch nicht `/api/lernapp/sitzung`), Anfragen des Workers vorhanden, `context.cookies()` leer |
| `lernapp/melden.spec.ts:26` › melden aus dem Rückmeldeblatt, ALTCHA erst nach dem Klick, nur Aufgabe und Kategorie | desktop | grün 20,3 s | Bis zum Klick auf „melden“ gibt es 0 Anfragen an `/api/`. Erst danach folgt `GET /api/altcha`; POST nur beim Senden, nur mit Aufgabe und Kategorie |
| `lernapp/typen-b.spec.ts:329`, `:380` | desktop (Rest) | grün 18,2 s / 18,7 s | Sprechen mit Testmikrofon und Attrappen-Worker. Während Laden, Aufnahme und Auswertung gibt es keine Anfrage außer GET; die eigene Aufnahme spielt über eine `blob:`-Adresse |
| `lernapp/typen-b.spec.ts:471` › Mikrofon nur auf …/ueben und …/wiederholen; Modelldateien vom eigenen Ursprung | desktop (Rest) | grün 690 ms | `Permissions-Policy` `microphone=(self)` nur dort. Worker, ORT-`.wasm` und Encoder kommen vom eigenen Ursprung mit CSP `'wasm-unsafe-eval'`, COEP und `immutable`; `asyncify.wasm` liefert 404; Lizenztexte neben den Gewichten |
| `lernapp/regression.spec.ts:16` › crossOriginIsolated … nicht auf der Website | beide | grün 2,3 s / 3,1 s | COOP/COEP im ganzen `/lern-app` |

**Modell wirklich geladen:**

- **Rauchtest N4** (`scratchpad/sprechen-rauchtest-n4.json`, 26.10.2026 05:18, nach den N4-Änderungen an
  `sprechen/modell.ts` und `vorrat.ts`):
  - Echter Worker und Service Worker, Varianten A und B `ok: true`.
  - 11 Dateien je genau einmal vom eigenen Ursprung; `fremd: []`, CSP-Verstöße 0, Konsole 0.
  - Erkennung online.
  - Danach ohne Netz ein neuer Worker aus dem Vorrat, `offlineAmServer: []`.
- **`whisper-netz.mjs` Lauf 3** (24.10., Produktionsbau, `leistung.md` §7):
  - Vor dem Klick 0 Anfragen unter `/lern-app/modelle/`.
  - Nach dem Klick 10/10 Dateien je einmal, „bereit“ nach 7 s.
  - Nur GET, keine fremden Ursprünge.
- Im Code: `allowRemoteModels: false` (`src/lib/lernapp/sprechen/modell.ts:91`).

**Live: Kopfzeilen je Bereich** (GET, 12:13–12:20 UTC). In keiner Antwort steht `Set-Cookie`.

| Bereich | Adresse | Status | Wesentliche Kopfzeilen |
|---|---|---|---|
| Seite | `/lern-app/de` (ebenso tr, ar, Lernpfad, Tipps, Einstufung, Fortschritt, Wortschatz, Einstellungen, Quellen) | 200 | CSP `default-src 'self'; connect-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; worker-src 'self'; form-action 'self'; frame-ancestors 'none'`; `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'`; COOP same-origin, COEP require-corp; `Permissions-Policy … microphone=()`; `Cache-Control: public, max-age=0, must-revalidate` |
| Üben, Wiederholen | `/lern-app/de/tr-aus-de/ueben`, `…/wiederholen` | 200 | wie oben, aber `microphone=(self)` |
| Kursverzeichnis | `/lern-app/pakete/tr-aus-de` | 200 JSON, 42 Einheiten | `max-age=0, must-revalidate` (Netz zuerst), CSP und COEP der Lern-App |
| Einheitenpaket | `/lern-app/pakete/tr-aus-de/tr.a1.e01/7f428832…bf1c9` | 200, 114.911 B | `Cache-Control: public, max-age=31536000, immutable` |
| Service Worker | `/lern-app/sw.js` | 200 | `no-cache`, CSP mit `connect-src 'self'` |
| Modelle | `/lern-app/modelle/whisper-base-64da572/onnx/encoder_model_quantized.onnx` (Range) | 206 | `immutable`, COEP |
| Manifest | `/lern-app/de/manifest.webmanifest` | 200 | `application/manifest+json` |

- Die HTML der Seiten Start, Lernpfad und Üben verweist nur auf den eigenen Ursprung.
- `http://www.w3.org` kommt vor, aber nur als SVG-Namensraum und löst keine Anfrage aus.

**Lücken (nicht blockierend):**

1. Das Netzprotokoll läuft nur im desktop-Projekt. Das ist so gewollt, das Verhalten hängt nicht von der Breite ab.
2. Das Laden des echten Modells ist auf einem Next-Produktionsbau nur am 24.10. belegt, also vor N4. Nach N4 belegt es der
   Rauchtest ohne Next-Bau, und das E2E nutzt die Attrappe. Die bauliche Sperre wirkt im Browser, live geprüft: CSP
   `connect-src 'self'` auf Seite, Worker und Modellen, dazu `allowRemoteModels: false`.
3. `sprechen()` in `typen-b.spec.ts` (Z. 292–295) filtert nur die Methode, nicht den Ursprung. Das deckt die CSP ab.

**Nacharbeit:**

1. Nach dem Merge von N8 `netzprotokoll.spec` und `melden.spec` wiederholen, weil Lernpfad, „offline speichern“ und Spieler
   sich ändern.
2. Optional: in `sprechen()` zusätzlich den Ursprung prüfen wie in `netzprotokoll.spec`, und `whisper-netz.mjs` einmal auf
   dem Merge-Bau laufen lassen.

Hinweis außerhalb der Schwelle: Die Antworten tragen `access-control-allow-origin: *`, die Voreinstellung von Vercel für
statische Inhalte. Bei öffentlichen Inhalten ohne Cookies ist das unbedenklich.

## 6. N8 – welche Belege nach dem Merge erneut gelten müssen

**Stand von N8** (`git log --grep N8`; `git diff fb10e4dd lernapp-n8`): fünf Commits auf `e06a648b`.

| Commit | Änderung |
|---|---|
| `1c9727b4` | Lernpfad nur mit der aktuellen Stufe aufgeklappt; Karten erst in Sichtweite (`content-visibility`); Spieler prüft nur die gespielte Lektion; „offline speichern“ in Häppchen (`nachgeben()` mit `scheduler.yield` vor jedem Paket und Bündel in `speichereOffline`) |
| `6a9997c8` | `LernpfadStufen` als eigene Ansicht |
| `2b285cb1` | Paketköpfe nur für sichtbare Stufen; nach „offline speichern“ wird nur die Station neu berechnet (`onGespeichert` statt `meldeStand`); `geschafftJeEinheit` |
| `db36bcb0` | Zahlen ohne `Intl` |
| `23af6310` | Lexikon der Lektion erst bei der ersten Textbewertung |

- Geändert werden `LernpfadInsel.tsx`, `OfflineEinheit.tsx`, `lokal/vorrat.ts`, `lokal/pakete.ts`, `UebenInsel.tsx`,
  `kursverzeichnis.ts`, `format.ts`, `engine/sitzung.ts`, `globals.css` und je ein neuer Schlüssel in
  `messages/lernapp/{de,tr,ar}.json`.
- N8 ändert **keine E2E-Spec** und keinen Service Worker.
- Ein Bericht zu N8 steht noch nicht in `leistung.md`.
- Unter `scratchpad/tmp-n8/` liegen nur Mess- und Bauprotokolle (`sitzung/bau-A.log`, `probe-a/*.json`), kein E2E-Ergebnis.

**Nach dem Merge erneut grün nötig:**

| Kriterium | Spec:Zeile | Projekte | Warum |
|---|---|---|---|
| Z-L04 | `lernapp/offline.spec.ts:11` | telefon + desktop | Der Knopf „Einheit offline speichern“ (Häppchen, `onGespeichert`), die Station der Testeinheit über `testStation()` (nur sichtbar, wenn ihre Stufe aufgeklappt ist), Lektion ohne Netz (`ladeLektion`) und „geschafft“ im Lernpfad aus dem Vorrat (`koepfeAusDemVorrat` nur für aufgeklappte Stufen) |
| Z-L04 | `lernapp/quellen.spec.ts:71` | telefon + desktop | Vorrat und Zahlenformat |
| Z-L04 | `lernapp/regression.spec.ts:30` | telefon + desktop | Root-SW, Teil der Suite (Worker unverändert) |
| Z-L04 | `lernapp/rahmen.spec.ts:180`, `:204` | desktop | Manifest, Service Worker, Hülle |
| Z-L04, Z-L08 | `lernapp/netzprotokoll.spec.ts:10` | desktop | Lernpfad, offline speichern, Lektion, Wiederholen, Tipps |
| Z-L08 | `lernapp/melden.spec.ts:26` | desktop | Spieler |
| Z-L06 | `lernapp/lektion.spec.ts:27`, `:79`, `:91` | beide | Tastaturweg, Tippen, axe im Lernpfad mit `<details>`/`<summary>` in de/tr/ar × 2 |
| Z-L06 | `lernapp/spielelemente.spec.ts:25`, `:102` | beide | Lernpfad mit abgeschlossener Stufe |
| Z-L06 | `lernapp/typen-a/typen-b/typen-wissen.spec.ts`, `wiederholen-einstufung.spec.ts`, `koran.spec.ts`, `audio-buendel.spec.ts` | beide | Spieler (`UebenInsel`, Lexikon in `sitzung.ts`), Lernpfad von Wissen und Koran |
| Z-L06 | `a11y.mjs` (68 × 2) | – | volle Matrix (Abschnitt 4, Nacharbeit 1) |
| alle | Unit `leistung-n8.test.ts`, `lernpfad-stufen.test.tsx`, `format.test.ts`, `sitzung.test.ts` | – | neue bzw. geänderte Tests aus N8 |

**Achtung beim Merge:** `lernapp-n8` zweigt von `e06a648b` ab. `git diff fb10e4dd lernapp-n8` zeigt deshalb, dass die Zeilen
mit `test.slow` aus `f56f74bd` in `barrierefreiheit.spec.ts` und `quran.spec.ts` sowie die Galerie aus `13513c84` fehlen.
Ein echter Drei-Wege-Merge behält beide. Nach dem Merge prüfen, dass `test.slow` noch da ist, sonst werden die 8 Cüz-Tests
wieder rot.

## 7. Schlusstabelle

| Z | Thema | Status | Kurzbeleg | Lücken | Nacharbeit (Kern) |
|---|---|---|---|---|---|
| Z-L04 | Offline | **teilweise** | `offline.spec:11` (telefon 11,7 s, desktop 9,3 s grün), `quellen.spec:71` (beide grün), `regression.spec:30` Root-SW (beide grün), `rahmen.spec:180/204` (desktop grün); live: `/lern-app/sw.js` und `/sw.js` 200 und byte-gleich, Präfixregel `igmg-lernapp-`, 3 Manifeste 200 | „Stufe offline speichern“ fehlt (nur „Einheit offline speichern“ und automatisch aktuelle und nächste Einheit), keine Entscheidung dazu; Wiederholen ohne Netz nicht im E2E; Root-SW-Test nur mit dem Vorrat der Hülle; N8 nicht im Stand | Stufe speichern umsetzen samt E2E oder die Schwelle per Entscheidung ändern; `offline.spec` um Wiederholen erweitern; Root-SW-Test mit gespeicherter Einheit; nach N8 erneut laufen lassen |
| Z-L06 | Zugänglichkeit | **teilweise** (Screenreader: UMGEBUNGSAUSNAHME LM-19 mit Ersatzbeleg) | axe im E2E: `rahmen:84` 6/6, `lektion:91` 6/6, `spielelemente` 4/4, `koran:36` 2/2, je Typ (desktop), `gruppe:155` (Wdh 2 grün); volle Matrix 136 + 22 am 24.10. (Testkurs); 25/26 Übungstypen per Tastatur im E2E grün; keine Antwortfrist im Code | volle Matrix nicht auf dem geprüften Stand (Wiederholen, Tipps, Wortschatz, Anmelden; tr-Fortschritt; Einstufung tr/ar/390); `gruppe:155` nur einzeln grün; `schrift_latein` nur Unit; N8 ändert Lernpfad und Spieler; LM-19 offen | `a11y.mjs` 68 × 2 auf dem Merge-Bau mit N8 und echten Inhalten; E2E nach N8 wiederholen; optional Tastatur-E2E für `schrift_latein` und den Papier-Knopf |
| Z-L08 | Datenfluss | **erfüllt** | `netzprotokoll.spec:10` (desktop grün: nur GET, eigener Ursprung, inkl. Worker, keine API, keine Cookies); `melden.spec:26` (API erst nach dem Klick, POST nur beim Senden); `typen-b:329/380/471`; Rauchtest N4 (`fremd: []`, 0 CSP-Verstöße, offline 0 Serveranfragen); live Kopfzeilen je Bereich ohne `Set-Cookie`, CSP `connect-src 'self'`, Mikrofon nur auf Üben und Wiederholen | Modell-Netzprotokoll auf einem Next-Bau nur vom 24.10. (nach N4 nur der Rauchtest); Sprechen-Test prüft nur die Methode; nur desktop | nach N8 `netzprotokoll.spec` und `melden.spec` wiederholen; optional Ursprung in `sprechen()` prüfen und `whisper-netz.mjs` auf dem Merge-Bau |

**Rote Tests:** 9 von 1.222.

- 8 Website-Tests auf Cüz-Seiten: Zeitgrenze 30 s. `f56f74bd` verdreifacht die Grenze, die Prüfungen bleiben gleich; Wdh 3
  12/12 grün. Die Einordnung trägt.
- 1 Lern-App-Test, `gruppe.spec:155` desktop:
  - Er scheiterte nach 33,4 s vor der Budgetmessung, an einer Erwartung und nicht an der Zeitgrenze von 300 s.
  - Einzeln lief er grün, eine Abhängigkeit über gemeinsame Konten ist ausgeschlossen. Die Ursache ist nicht belegt, weil
    Meldung und Trace verloren sind.
  - Die Einordnung „unter Last“ ist plausibel, trägt aber nur eingeschränkt. Nach N8 unter Last mit Trace wiederholen.
