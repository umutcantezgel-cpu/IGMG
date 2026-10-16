# Abschlussurteil Stufe C, Stand main = e68f658

**Ergebnis: 21 Kriterien erfüllt, 0 teilweise, 0 AUSNAHME als Hauptstatus.** Die Ausnahme-Vermerke bei Z-08, Z-09, Z-14, Z-16, Z-19 und Z-20 bleiben wie bisher.

Verlauf (erfüllt / AUSNAHME / teilweise): 75cad0a 7/2/12 → 033ea6f 12/2/7 → 90a8e37 19/0/2 → **e68f658 21/0/0**.

Die beiden offenen Fehler aus der Nachprüfung 2 sind behoben. Ich habe beides selbst am echten Server bestätigt:
- **Z-18:** „Frühere Fassungen“ der CMS-Seiten stürzt nicht mehr ab.
- **Z-07:** Der Fokus im Reihenfolge-Editor bleibt bei 390 px über der Speicherleiste (WCAG 2.4.11).

Einen Rückschritt bei Z-01 bis Z-21 habe ich nicht gefunden.

**Rahmen der Prüfung**
- Prüfzeit: 16.10.2026, 13:32–13:46 UTC.
- `git status --porcelain` war vorher und nachher leer; HEAD = origin/main = e68f658.
- Die lokale Ref `main` steht veraltet auf 71e263f. Das ist ein Vorfahr von e68f658; ich habe sie nicht angefasst.
- Im Repository habe ich nichts geändert.
- Belege liegen unter `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c4/` (im Folgenden `S4/`).

## Eigene Nachprüfungen

1. **Eigener Bau aus e68f658.**
   - `web/.env` aus dem Worktree agent-a360d92e270ea9f2f kopiert, dann `pnpm build` mit eigenem TMPDIR.
   - Ergebnis: rc=0, 1887 Seiten, BUILD_ID `CpE-PP1X-EfizAA6k8yPE` (`S4/bau.log`).

2. **Repo-E2E am echten Server** (PostgreSQL 16 und Mailpit, Port 3100, `igmg_e2e` frisch angelegt).
   - Befehl: `pnpm test:e2e tests/e2e/verwaltung-reihenfolge.spec.ts tests/e2e/cms.spec.ts tests/e2e/zugaenglichkeit-gemeinde.spec.ts`
   - Ergebnis: **18 grün, 2 übersprungen, 0 rot, 0 flaky**, rc=0 (`S4/e2e-repo.log`, `S4/e2e-repo-ergebnis.json`). Übersprungen sind nur die zwei cms-Tests auf dem Telefon, wie in der Spec vorgesehen.
   - `verwaltung-reihenfolge`: 8/8 auf Telefon und Desktop (Startseite, Wissen, Menü- und Baustein-Editor).
   - `cms.spec:43` (desktop) ist grün, mit den neuen Schritten „Frühere Fassungen“, axe, Ansehen und Zurückholen (`cms.spec.ts:107-142`).
   - `zugaenglichkeit-gemeinde`: 8/8. Das Senden des Kindes lief mit, weil die Prüfung um 15:36 Uhr Berliner Zeit lag.
   - Im Serverlog stehen kein `TypeError` und kein `⨯`.

3. **Eigene Probe** `S4/spec/ep4.spec.ts` + `ep4.config.ts`.
   - Eigener Server auf Port 3174, eigene Datenbank `igmg_endpr4_e2e`, Breiten 390 und 1440 px.
   - **Z-18:** auf beiden Breiten grün (`S4/logs/ep4-lauf1.txt`, `S4/logs/ep4-lauf1.jsonl`).
     - Ablauf: Seite anlegen, zweimal Titel und Text ändern (3 Fassungen), dann „Frühere Fassungen“ über den Link im Editor öffnen.
     - Liste: 3 Zeilen, je mit Titel und „1 Baustein“, die oberste trägt „Aktuelle Fassung“. Die Fehlergrenze erscheint nicht.
     - Ansehen der ältesten Fassung: Ihr Absatz ist sichtbar, der Absatz der dritten Fassung nicht.
     - Zurückholen: Die Bestätigung erscheint, danach gibt es 4 Zeilen. Die oberste trägt Titel 1 und den Vermerk „aus einer früheren Fassung zurückgeholt“; der Editor zeigt wieder Titel 1.
     - **axe (WCAG 2.2 AA): 0 Befunde** auf Liste und Ansicht, auf beiden Breiten.
     - Bilder: `S4/bilder/revisionen-liste-*.png`, `S4/bilder/revisionen-ansicht-*.png`.
     - Gegenprobe mit einer beschädigten Fassung (JSON `null`, direkt in die Datenbank geschrieben): Liste und Ansicht zeigen 0× „Ein Fehler ist aufgetreten“.
     - Zurückholen genau dieser Fassung: Der Server weist kontrolliert ab (`⨯ KeinRecht: KEIN_RECHT`, kein TypeError mehr), die Seite bleibt unverändert. Die Nutzerin sieht aber die allgemeine Fehlerseite (`S4/bilder/zurueckholen-kaputt-desktop.png`). Das ist ein niedriger Restpunkt, siehe unten.
   - **Z-07, erster Lauf rot – Ursache lag in meiner Probe, nicht in der App.**
     - Meine Eckpunkte lagen 2 px vom Rand. Bei 8 px Eckenradius liegen sie außerhalb der Knopfform, `elementFromPoint` trifft dort `div.flex gap-2`, also das Elternelement. Das passierte auch auf dem Desktop im ersten Schritt, mit 107 px Abstand zur Leiste.
     - Außerdem wechselt der Fokus am Listenende wie dokumentiert auf „Nach oben“.
     - Belege: `S4/logs/ep4-lauf1.jsonl`, Bilder `S4/bilder/lauf1-*`.
   - **Z-07, zweiter Lauf grün**, mit Eckpunkten innerhalb der Rundung (0,3·r + 2 px) und Gegenknopf (`S4/logs/ep4-lauf2.txt`, `S4/logs/ep4.jsonl`). Gemessen nach dem Ende des weichen Scrollens, dreimal Enter „Nach unten“ auf „Unsere neue Moschee“:

     | Breite | Knopf (y) Schritt 1 / 2 / 3 | Unterkante Fokusring | Oberkante Leiste | Fenster |
     |---|---|---|---|---|
     | 390 px | 530–578 / 663–711 / 663–711 | 582 / 715 / 715 | 727 | 844 |
     | 1440 px | 663–711 / 754–802 / 754–802 | 715 / 806 / 806 | 818 | 900 |

     - In allen Schritten sind Mitte und alle 4 Ecken frei.
     - `:focus-visible` greift; der Fokusring ist 2 px durchgezogen mit 2 px Abstand.
     - Die Live-Region sagt an: „Unsere neue Moschee steht jetzt an Stelle 5 von 5.“
     - **axe: 0 Befunde** vor und nach dem Verschieben, auf beiden Breiten.
     - Bild: `S4/bilder/startseite-enter-3-telefon.png` (Fokusring vollständig über „Reihenfolge speichern“).
     - Direkt nach dem Tastendruck, also vor dem Ende des weichen Scrollens, liegt der Knopf kurz falsch: Telefon Schritt 2 bei 717–765 (die Leiste beginnt bei 727), Schritt 3 bei 874–922. Er ist nach höchstens rund 0,5 s im Bild. Bei reduzierter Bewegung scrollt die App ohne Animation (`behavior: 'auto'`, `speicherleiste.ts:39-40`).

4. **Code gelesen.**
   - Z-18:
     - `seiten/[id]/revisionen/page.tsx:20` (`inhaltVon` gibt für jede Nicht-Objekt-Fassung `{}` zurück).
     - Dieselbe Datei `:48`, `:88-89` und `:125`.
     - `queries/verwaltung/seiten.ts:141/144`: `jsonb_typeof`-Prüfung, liefert sonst `null`.
     - `actions/seiten.ts:355-367`.
     - `wissen/[id]/revisionen/page.tsx` ist gleich abgesichert.
   - Z-07:
     - `speicherleiste.ts:16-41` (`scroll-padding-bottom` = Leistenhöhe + `--spacing`·4; danach `focus({preventScroll})` und `scrollIntoView('nearest')`).
     - Eingebunden in `ReihenfolgeEditor.tsx:60/67`, `MenueEditor.tsx` und `BausteinListe.tsx`.
   - In den geänderten Zeilen stehen 0 freie Farb- oder Pixelwerte (grep).

5. **Wortlaut (Z-12).**
   - Befehl: `node _gemeinde/werkzeuge/wortlaut.mjs --basis b702c7c --stand e68f658` → **rc=0** (`S4/wortlaut.log`, `.md`, `.json`).
   - 0 Einheiten „hoch“ offen, 690 durch Ausnahmen gedeckt.
   - Recht: 710 gleich, 0 verschoben, 8 geändert, 1203 neu, 0 entfernt. Das ist derselbe Stand wie auf 90a8e37.
   - `ergebnis_hash` `9762275d…` ist identisch mit dem der Gegenprüfung.

6. **Religion (Z-15).**
   - `node _gemeinde/werkzeuge/religion-pruefung.mjs` → **rc=0**: „grün: 5489 Dateien“ (`S4/religion.txt`). Auf 90a8e37 waren es 5466 Dateien; dazugekommen sind Protokolle.
   - SHA-256 von `web/daten/tanzil/quran-uthmani.xml` beginnt mit `5ea5cbab9b4d0316`, die Datei hat 6236 `<aya`.
   - `git diff 90a8e37 e68f658 -- web/daten web/drizzle` ist leer.

7. **Live (Z-11).**
   - e68f658 wurde um 13:31:22 gepusht. Deployment **7120369414 „Production – igmg-wetzlar“, sha e68f658, `success` um 13:37:32Z** (beim 5. Abruf, nach rund 4 min Warten). Dazu 7120371725 „Production – igmg“ mit `success` (`S4/deploy-warten.log`, `S4/dep-sha.json`).
   - Stichprobe (`S4/live.txt`, `S4/live/`):

     | Pfad | Status | Inhalt / Vermerk |
     |---|---|---|
     | `/` | 200 | h1 „IGMG Wetzlar“ |
     | `/quran/2` | 200 | h1 „Al-Baqara“ |
     | `/hadith/bukhari/56` | 200 | 200 Nummern-Anker |
     | `/suche?q=Gebet` | 200 | `noindex`, „4 Treffer“, Hinweis zur Suche ohne Datenbank |
     | `/anmelden` | **404** | `noindex`, „Seite nicht gefunden“ |
     | `/verwaltung` | 200 | `noindex`, „Verwaltung noch nicht eingerichtet“ (MN-00) |

   - Die Kurskarten-Klassen aus 432fb3b stehen live 6× auf `/bildung/korankurse`, vor dem Deploy 0×. Der neue Stand ist also ausgeliefert.
   - `/audio/x.mp3` antwortet 404 über `iad1::fra1`. `/registrieren` und `/mein-bereich` antworten 404.
   - `/api/health` antwortet 503, weil keine Datenbank angebunden ist (MN-00); das ist erwartet.

8. **Tor plausibilisiert, keine Rückschritte gegenüber Nachprüfung 2 (na2).**

   | Prüfung | na2 (90a8e37) | na3 (a59ce95 = Code von e68f658) | Erklärung |
   |---|---|---|---|
   | Unit | 1582 + 3 | 1584 + 3 | +2 neue Fälle in `reihenfolge-editor.test` |
   | Integration | 3265 | 3269 (+2/4 übersprungen) | +4: cms 2, startklar 1, push 1 |
   | E2E | 983 / 0 / 95 | 991 / 0 / 95 | +8 = 4 neue Tests × 2 Projekte, laut `e2e-na3-lauf.log` |

   - Unverändert gegenüber na2: Sweep (`diff sweep-na2.txt sweep-na3.txt` leer: 41×200, 20×404, 0×5xx), Crawl 1315 (1290×200, 25×307 auf OG-Bildern), Import-Bau 1887 Seiten, Vorschau-Bau 2228 Seiten.
   - check, Sprachen, Religion und Wortlaut haben rc=0 (`tor-voll-na3.log`).
   - Die Gegenprüfung `n3-gegen` hat 8/8 und eine Gegenprobe mit dem alten Verhalten (rot); ihr Beleg für den Absturz beim Zurückholen beschädigter Fassungen stammt von vor a59ce95 und ist inzwischen behoben.

9. **Aufräumen.**
   - Gelöscht: `web/.env`, `web/.next`, `web/test-results`, `scratchpad/tmp-abschluss` und meine Datenbank `igmg_endpr4_e2e`.
   - Mein Server und Playwright sind beendet; die Ports 3100 und 3174 sind frei.
   - PostgreSQL und Mailpit laufen weiter wie vorgefunden. Übrig sind die Datenbanken `igmg` und `igmg_e2e`, wie vorher.
   - Die ignorierten Reste in `web/` (`.mail`, `.pglite-bau`, `.suchindex.json`) stammen von vor 13:32, also nicht von mir.

## Kriterien

| Z | Thema | Status | Beleg |
|---|---|---|---|
| Z-01 | Plan | **erfüllt** | wie stufe-c-nachpruefung-2, keine Regression laut Tor: Integration 3269 grün; `PLAN.md:42` ist inzwischen „fertig“ und um Stufe C (3) und Nacharbeit 3 ergänzt |
| Z-02 | Bestand | **erfüllt** | Tor: Unit 1584+3, Integration 3269, E2E 991/0/95 (+8 neu), Bau 1887/2228; eigener Teillauf 18/0. `wartung-sperre-postgres` bleibt Umgebungsausnahme (PostgreSQL 16) |
| Z-03 | Designsystem | **erfüllt** | wie stufe-c-nachpruefung-2, keine Regression laut Tor: check/lint rc=0; 0 freie Werte in den geänderten Zeilen (eigener grep) |
| Z-04 | Gestaltung | **erfüllt** (Verfahrensvorbehalt wie bisher) | wie stufe-c-nachpruefung-2, keine Regression laut Tor: Sweep und Crawl identisch mit na2; Kurskarte jetzt ausgewogen zweizeilig bei 48 px Höhe (`n3/kurskarte-messung.json`) |
| Z-05 | Bewegung | **erfüllt** | wie stufe-c-nachpruefung-2, keine Regression laut Tor: Das neue weiche Scrollen fällt bei reduzierter Bewegung weg (`speicherleiste.ts:39-40`; Gegenprüfung mit reduzierter Bewegung grün) |
| Z-06 | Grafik | **erfüllt** | wie stufe-c-nachpruefung-2, keine Regression laut Tor: keine Änderung an Symbolen oder SVG |
| Z-07 | Zugänglichkeit | **erfüllt** (vorher teilweise) | Selbst nachgeprüft: 2.4.11 bei 390 und 1440 px nach 3× Enter, Fokusring 12 px über der Leiste, Mitte und Ecken frei, `:focus-visible`, axe 0 (`S4/logs/ep4.jsonl`). Repo-Spec 8/8 inkl. Menü- und Baustein-Editor; axe 0 auf „Frühere Fassungen“ |
| Z-08 | Leistung | **erfüllt** (Laborersatz, TBT unter AUSNAHME A-01) | wie stufe-c-nachpruefung-2, keine Regression laut Tor: keine Änderung an öffentlichen Skripten außer Klassen der Kurskarte |
| Z-09 | Darstellung | **erfüllt** (AUSNAHME echte Geräte/iOS) | wie stufe-c-nachpruefung-2, keine Regression laut Tor: Kurskarten de/tr/en bei 390/768/1440 alle 48 px ohne Überlauf (n3); Sweep identisch mit na2 |
| Z-10 | Übergabe | **erfüllt** (Nachführung: ABNAHME und BERICHT noch auf 90a8e37) | Nachgeführt sind `imam.md` 4.1 (auch die Administration darf freigeben), Funktionsliste, KERN B-22, MENSCHEN MN-28/29, PLAN und LIESMICH (Erklärung zu HTTP 200 bei der Fehlergrenze) |
| Z-11 | Vercel | **erfüllt** (Abweichung L2-E06, jetzt MN-29) | Production igmg-wetzlar e68f658 `success` (7120369414); Live-Stichprobe wie erwartet, `/anmelden` 404; neue Kurskarten-Klassen live |
| Z-12 | Recht/Startklar | **erfüllt** | Wortlaut rc=0, 0 offene Einheiten (eigener Lauf, Hash identisch); Startklar-Zweig `wissen_thema` jetzt im Repo getestet (`startklar.test.ts`) |
| Z-13 | Konten/Rechte | **erfüllt** | wie stufe-c-nachpruefung-2, keine Regression laut Tor: Integration 3269 grün; `revisionWiederherstellen` prüft Rechte unverändert (`seiten.ts:348-354`); `/verwaltung/lernende/[id]` stürzt bei ungültigem Datum nicht mehr ab (432fb3b) |
| Z-14 | Kinderschutz | **erfüllt** (AUSNAHME Push-Zustellung) | wie stufe-c-nachpruefung-2, keine Regression laut Tor; `zugaenglichkeit-gemeinde` mit Kind-Chat selbst grün; `/api/mein/neues` jetzt mit fremdem Kanal getestet |
| Z-15 | Religiöse Inhalte | **erfüllt** | `religion-pruefung` rc=0 (5489 Dateien, eigener Lauf); SHA und 6236 Verse gleich; `web/daten` unverändert; MN-28 für die 12 Bestandsthemen eingetragen |
| Z-16 | Koran/Rezitation | **erfüllt** (AUSNAHME echte Rezitation MN-03, Geräte) | wie stufe-c-nachpruefung-2, keine Regression laut Tor: E2E 991/0, `/quran/2` live 200 |
| Z-17 | Lernplattform | **erfüllt** | wie stufe-c-nachpruefung-2, keine Regression laut Tor; `lernkette.spec` enthält jetzt den Schritt „Fortschritt“ (1acab0c) und ist im Tor grün |
| Z-18 | CMS | **erfüllt** (vorher teilweise) | Selbst nachgeprüft: 3 Fassungen öffnen, ansehen, zurückholen, Vermerk, Editor-Titel zurück; axe 0; beschädigte Fassung ohne Absturz der Liste und Ansicht. Repo-E2E `cms.spec:43` grün; Integration mit fremden Formen |
| Z-19 | Standort/Datenfluss | **erfüllt** (AUSNAHME Push, Centrifugo) | wie stufe-c-nachpruefung-2, keine Regression laut Tor: keine Änderung an Datenflüssen |
| Z-20 | Betrieb | **erfüllt** (Umgebung PostgreSQL 16, Centrifugo nicht live) | wie stufe-c-nachpruefung-2, keine Regression laut Tor: keine Änderung an Betrieb oder Sicherung; `beispielkonten.ts` mit gültigem fiktivem Datum |
| Z-21 | Moschee 2026 | **erfüllt** | wie stufe-c-nachpruefung-2, keine Regression laut Tor: keine Inhaltsänderung |

## Verbleibende Lücken

### Technisch
1. **NIEDRIG (Z-18):** Wer eine beschädigte Fassung zurückholt, sieht die allgemeine Fehlerseite statt einer eigenen Meldung. Die Daten bleiben unverändert. Erreichbar ist das nur mit von Hand manipulierten Daten in der Datenbank.
2. **NIEDRIG (Z-07/Z-18):** Die Zeitstempel der Fassungen sind minutengenau. Mehrere Fassungen aus derselben Minute haben deshalb gleiche Namen, z. B. „Ansehen: Fassung vom … 15:38 Uhr“ (`S4/bilder/revisionen-ansicht-desktop.png`). axe meldet nichts; Sekunden oder eine laufende Nummer wären eindeutiger.
3. **HINWEIS (Z-07):** Beim weichen Scrollen liegt der Fokus für ungefähr 0,3–0,5 s noch unter der Leiste. Bei reduzierter Bewegung scrollt die App sofort.
4. **Testlücken (weiterhin):**
   - Zeitplan und Seiten-Freigabe sind nur in der Prüfer-Spec abgedeckt.
   - `wartung-sperre-postgres` braucht PostgreSQL 17.
   - Die Verzögerung beim Tab ins Suchfeld auf `/suche` soll im Feld bestätigt werden (ML-27).
5. **Unterlagen:** `ABNAHME.md` und `BERICHT.md` mit diesem Urteil nachführen (beide stehen noch auf 90a8e37 mit 19/2).

### Nur Menschen
- **MN-00:** Produktionsdatenbank, Geheimnisse und SMTP. Erst danach laufen Konten, Verwaltung, CMS und Volltextsuche live, und `/api/health` meldet 200.
- **MN-28:** Die 12 Bestandsthemen von „Islamisches Wissen“ religiös bestätigen.
- **MN-29:** L2-E06 (Audio über die eigene Route) bestätigen.
- **MN-10, MN-11, MN-21, MN-22, MN-23:** Schutzkonzept, DSFA, Datenschutz v2, Löschfristen und Sicherungsschlüssel.
- **MN-20, MN-24:** Konten für die religiöse Freigabe.
- **MN-02, MN-04, MN-05, MN-07:** Übersetzungen, Tajwid, Wortbedeutungen und Elifbe freigeben.
- **MN-03, MN-03b:** Rezitation aufnehmen und die Vereinbarung schließen.
- **MN-01, MN-06:** Lizenzen.
- **MN-08:** Moschee-Fakten.
- **MN-09, MN-13, MN-14, MN-15:** Jahrestabelle, Bankdaten, Iqama- und Freitagszeiten, Kandil- und Bayram-Tage.
- **MN-12, MN-18:** lokaler Server, dort die Wiederherstellungsprobe auf PostgreSQL 17.
- **MN-16, MN-17:** Lehrkräfte einladen, VAPID-Schlüssel.
- **MN-19:** echte Geräte und iOS.
- **MN-25, MN-26:** kleine Entscheidungen aus den Paketen.
- Alte Vercel-Projekte löschen.

## Gesamturteil

Die Nacharbeit 3 hat beide Restfehler der Nachprüfung 2 behoben, mit Tests im Repository. Ich habe das unabhängig am echten Server bestätigt: „Frühere Fassungen“ lässt sich öffnen, ansehen und zurückholen, und der Fokus im Reihenfolge-Editor bleibt bei 390 px vollständig über der Speicherleiste, jeweils mit axe 0. Damit sind alle 21 Kriterien erfüllt. Tor, Wortlaut, Religionsprüfung und die Live-Produktion auf e68f658 zeigen keinen Rückschritt; offen sind nur zwei niedrige Feinheiten bei beschädigten oder minutengleichen Fassungen und das Nachführen von ABNAHME und BERICHT. Ehrlich lautet die Übergabe: Die öffentliche Website ist fertig und live; die Gemeinde-Plattform ist gebaut, geprüft und echt Ende-zu-Ende getestet. Freigabereif ist sie, sobald MN-00 und die Freigaben aus MENSCHEN.md erledigt sind.