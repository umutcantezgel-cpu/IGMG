# Endprüfung der zweiten Nachprüfung Stufe C, Stand `main` = 90a8e37

**Ergebnis: 19 Kriterien erfüllt, 2 teilweise (Z-07, Z-18), 0 AUSNAHME als Hauptstatus.** Auf 033ea6f waren es 12 erfüllt, 2 AUSNAHME und 7 teilweise. Die Ausnahme „Docker-E2E“ entfällt, weil die echten E2E-Läufe mit PostgreSQL 16 und Mailpit gelaufen sind. Zwei Fehler habe ich selbst am Server nachgestellt:
- Die Seite „Frühere Fassungen“ der CMS-Seiten stürzt ab, sobald es eine Fassung gibt.
- Der Reihenfolge-Editor verletzt WCAG 2.4.11 bei 390 px.

Prüfzeit: 16.10.2026, etwa 11:35–11:50 UTC.

`git status --porcelain` war vorher und nachher leer, HEAD ist 90a8e37. Im Repository habe ich nichts geändert. Für die Nachstellung habe ich den vorhandenen Standalone-Bau `web/.next` (BUILD_ID `hQZX3v2_…`, gebaut von k1 aus 90a8e37) auf Port 3170 gestartet, mit eigener Datenbank `igmg_endpr_e2e`. Danach war der Server beendet und die Datenbank gelöscht. Übrig sind nur `igmg` und `igmg_e2e`.

Die Reste `web/.env`, `web/.next` und `web/test-results` (08:51–09:00) stammen von k1, nicht von mir. Der Server auf 3100 lief nicht. Belege liegen unter `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c3/endpruefer/` (im Folgenden `E/`).

## Eigene Nachprüfungen

1. **Z-18: Absturz der Seiten-Revisionen nachgestellt.**
   - Eigene Spec `E/spec/ep.spec.ts` (desktop): Seite neu anlegen, dann `/verwaltung/seiten/<id>/revisionen` öffnen.
   - Ergebnis: Die Fehlerseite „Ein Fehler ist aufgetreten“ kommt mit **HTTP 200**, im Serverlog steht `TypeError: Cannot read properties of null (reading 'titel')` (`E/logs/ep.jsonl`, `E/logs/ep-lauf.txt`).
   - Ursache im Code: `seiten/[id]/revisionen/page.tsx:65` gibt für jede nicht angesehene Zeile `null` an `inhaltVon` (`:35`); `:77` liest dann `inhalt.titel?.de`. Der Fehler besteht seit 47ca859.
   - In `tests/e2e` gibt es keinen einzigen Treffer für „revisionen“.
   - Das Handbuch `redaktion.md:87` verspricht genau diese Funktion.
2. **Z-07: WCAG 2.4.11 nachgestellt** (`E/logs/ep.jsonl`, Bild `E/bilder/startseite-enter-2-telefon.png`).
   - Bei 390 px liegt der fokussierte Knopf „Nach unten: Unsere neue Moschee“ nach dem 2. Enter bei y=795–843. Die Speicherleiste beginnt bei 727; die Mitte des Knopfs ist verdeckt.
   - Bei 1440 px ist er bei y=774–822 zu sehen; die Leiste beginnt bei 818.
   - Code: `ReihenfolgeEditor.tsx:75-82` ruft nur `focus()` auf und scrollt nicht.
   - In `MenueEditor.tsx:84-89` und `BausteinListe.tsx:186-192` steht dasselbe Muster. Dort ist der Fehler **nicht belegt**: Die IDs dort hängen an der Stelle, deshalb könnte der Fokus dort mitwandern.
3. **Z-12:** `wortlaut.mjs --basis b702c7c --stand 90a8e37` endet mit **rc=0**.
   - 0 Einheiten „hoch“ offen, 690 durch Ausnahmen gedeckt.
   - Recht: 710 gleich, 8 geändert, 1203 neu, 0 entfernt (`E/wortlaut.md`).
4. **Z-15:**
   - `religion-pruefung.mjs` endet mit rc=0 („grün: 5466 Dateien“, `E/religion.txt`).
   - SHA-256 von `quran-uthmani.xml` beginnt mit `5ea5cbab9b4d0316`, die Datei hat 6236 `<aya`.
   - `git diff 033ea6f 90a8e37 -- web/daten` ist leer.
   - Alle öffentlichen Wege zeigen nur Themen mit Freigabe „geprueft“: `queries/wissen.ts:25-29` (Liste, Themenseite, Slugs, auch `sitemap.ts:63`), Volltextsuche `suche.ts:78` und Titelindex `titelindex-bau.ts:32`.
   - Ausnahme mit Absicht: Migration 0015 und der Seed führen die 12 Bestandsthemen als „geprüft ohne Prüfperson“, mit Vermerk. Es sind nur Titel; dokumentiert in `imam.md:72`.
5. **Z-02 Unit:** 114 Dateien, **1582 grün + 3 erwartet fehlgeschlagen**. Das stimmt mit dem Tor überein (`E/unit.log`).
   - `skripte-react-server` war im ersten Lauf rot, weil mein langer TMPDIR einen zu langen Socket-Pfad ergab (`listen EINVAL`). Mit normalem TMPDIR ist er grün (`E/unit-skripte.log`).
6. **Integration, eigene Auswahl:** alle grün.
   - 91/91 in `verwaltung-wissen`, `verwaltung-startseite`, `verwaltung-cms`, `push-zusammenfassung`, `lernkette` (mit Schritt 7 „Fortschritt“, `lernkette.test.ts:239`) und `formular-voranmeldung`.
   - Dazu `rechte-matrix-mitglieder` und `chat` mit **476/476** (`E/integration-auswahl.log`, `E/integration-rechte-chat.log`).
7. **Z-02, Empfehlung von k3 befolgt:** `wartung-sperre-postgres` mit `TEST_PG_URL` gegen eine eigene Wegwerf-Datenbank laufen lassen.
   - Der Lauf bricht in `beforeAll` mit `55P04 unsafe use of new value "leitung" of enum type rolle` ab (`E/wartung-sperre-postgres.log`).
   - Das ist die bekannte Grenze von PostgreSQL 16 (vgl. `e2e-echt/start.sh:9-12`), kein Codefehler.
   - Die Übersprung-Ausnahme bleibt also bestehen, bis PostgreSQL 17 verfügbar ist. Die Datenbank ist wieder gelöscht.
8. **Z-11 live:**
   - Deployment 7115139439 „Production – igmg-wetzlar“ steht auf 90a8e37.
   - `/` antwortet 200; `/anmelden`, `/registrieren` und `/mein-bereich` antworten 404 mit `noindex`.
   - `/api/mein/neues` und `/audio/x.mp3` antworten 404 und laufen über `iad1::fra1`; `/hatim` antwortet 404.
   - `/suche?q=Bukhari+1` zeigt „1 Treffer“.
   - Der Kopf-Link „Anmelden“ führt auf `/verwaltung/anmelden` (200, „Verwaltung noch nicht eingerichtet“), ist also kein toter Link.
9. **Z-02, Z-16, Z-17, Z-18, Z-20: Belege der Prüfer gegengeprüft.**
   - `lauf-tor/ergebnis.json`: 983 erwartet, 95 übersprungen, 0 unerwartet, 0 flaky.
   - Je Spec erwartet: quran-player 7, cms 2, lernkette 1, verwaltung-anzeige 3, verwaltung-rezitationen 2.
   - `git diff d5b2b76 90a8e37 -- web` ist leer.
   - Log der Wiederherstellungsprobe von k2: 3× „Sicherung ok“, 3× „Probe ok“, 5× „Probe FEHLER“ (die gewollten Fehlerfälle), `lauf.sh rc=0`.
10. **Z-08:** `ERSTER_TAB` ist in `BuchAnsicht.tsx:65` eingebunden.
11. **Z-10:** Die vermerkten Altstände bestätigt.
    - `PLAN.md:42` steht noch auf „in …“ (in Arbeit).
    - `BERICHT.md:3` nennt 75cad0a, `ABNAHME.md:6` nennt 033ea6f.
    - `imam.md:63` sagt „freigeben dürfen nur Sie“; laut `matrix.ts:141` hat die Administration aber alle Aktionen außer Chat.
12. **Z-04:** Angesehen habe ich k1 `startseite-1440.png` sowie eigene Live-Bilder `E/bilder/live-suche-gebet-390.jpg` (mit dem Hinweis zur Suche ohne Datenbank) und `E/bilder/live-wissen-1440.jpg`. Sie passen zum Design; einen Rückschritt sehe ich nicht.
13. **Absturz `/verwaltung/lernende/[id]`:** Er entsteht nur durch die Testdaten.
    - `scripts/beispielkonten.ts:111` speichert als Geburtsdatum `'[fiktiv]'`.
    - Echte Eingaben prüft `voranmeldung.ts:14-18` (Muster JJJJ-MM-TT).

## Kriterien

| Z | Thema | Status | Beleg |
|---|---|---|---|
| Z-01 | Plan | **erfüllt** | F-38, F-40 und F-44 sind gebaut, mit serverseitiger Rechteprüfung, Migrationen 0015/0016 und Tests (k3); die Integration zu Wissen, Startseite, Push-Zusammenfassung und Voranmeldung ist bei mir grün (91/91). Formal fehlt nur der Nachtrag in `PLAN.md:42`. |
| Z-02 | Bestand | **erfüllt** | Unit 1582+3 (eigener Lauf), Integration 3265 im Tor, E2E 983/0/95 auf dem Code von 90a8e37 (gegengeprüft). `wartung-sperre-postgres` bleibt eine Umgebungsausnahme, weil es auf PostgreSQL 16 nicht migriert (eigener Versuch, 55P04). |
| Z-03 | Designsystem | **erfüllt** | 86 geänderte Dateien, 1 Fehlalarm (regulärer Ausdruck), 0 freie Werte (o2). |
| Z-04 | Gestaltung | **erfüllt** (Verfahrensvorbehalt wie bisher) | Die neuen Module Startseite und Wissen sowie die Suche sind im Bild stimmig (eigene Sichtung); ein Blindvergleich ist weiterhin nicht dokumentiert. |
| Z-05 | Bewegung | **erfüllt** | Bei reduzierter Bewegung 0 Größen- oder Lageänderungen, `tritt-auf` dann nur als Überblendung (o2). |
| Z-06 | Grafik | **erfüllt** | Nur Lucide-Symbole, Werkzeugfehler 0, 0 doppelte IDs (o2). |
| Z-07 | Zugänglichkeit | **teilweise** | Chat, Anwesenheit, Kind-Senden und Koran per Tastatur sind jetzt am Server belegt, axe 0 auf 233 Aufrufen (k1). Aber: 2.4.11 im Reihenfolge-Editor bei 390 px ist verletzt (selbst nachgestellt), und auf der abstürzenden Revisionsseite der Seiten ist axe nicht prüfbar. |
| Z-08 | Leistung | **erfüllt** (Laborersatz, TBT unter AUSNAHME A-01) | LCP ≤ 2,5 s auf 16/16 Medianen, INP 64–96 ms, erster Tab auf Hadith-Seiten 16–32 ms statt rund 1 s (o3); `ERSTER_TAB` im Code bestätigt. |
| Z-09 | Darstellung | **erfüllt** (AUSNAHME echte Geräte/iOS) | 84 Messungen, 0 Überlauf, 0 Abschnitte (o2). |
| Z-10 | Übergabe | **erfüllt** (Nachführung offen) | GO-LIVE G1/G2/G4, MN-23 und die Handbücher entsprechen N4 und dem Code (k3, 7/7). Noch veraltet: PLAN/BERICHT/ABNAHME, die Funktionsliste (sie meldet zu wenig) und `imam.md:63` (alle selbst gesehen). |
| Z-11 | Vercel | **erfüllt** (Abweichung L2-E06) | Produktion 90a8e37 `success`; 404 der Konto-Seiten, fra1 auf dynamischen Routen und Treffer der Nummernsuche live selbst geprüft. |
| Z-12 | Recht/Startklar | **erfüllt** | Wortlaut rc=0 mit 0 offenen Einheiten (eigener Lauf); Startklar „Religiöse Freigaben“ erfasst jetzt auch `wissen_thema` (k2). |
| Z-13 | Konten/Rechte | **erfüllt** | Die generierte Matrix deckt alle Actions ab, auch die Mitglieder-Actions; `rechte-matrix-mitglieder` ist bei mir grün (453 von 476). S2/S3 ohne offenen Befund „hoch“. |
| Z-14 | Kinderschutz | **erfüllt** (AUSNAHME Push-Zustellung) | S-01…S-18 belegt; S-09 mit Gegenprobe; `chat.test` bei mir grün; F-38 überträgt nur Anzahlen (k2). |
| Z-15 | Religiöse Inhalte | **erfüllt** | `religion-pruefung` rc=0, SHA und 6236 Verse gleich, `web/daten` unverändert. Kein ungeprüftes Wissensthema wird öffentlich (alle 5 Wege selbst geprüft). Vermerk: 12 Bestandstitel gelten als „geprüft ohne Prüfperson“. |
| Z-16 | Koran/Rezitation | **erfüllt** (AUSNAHME echte Rezitation MN-03, Geräte) | Player-E2E mit Testton 7/7, Werkstatt 2/2 und Offline 1/1 echt gelaufen (k1; im Tor gegengeprüft). |
| Z-17 | Lernplattform | **erfüllt** | `lernkette.spec` echt grün; den Schritt „Fortschritt“ belegen die E2E-Erweiterung von k1 und `lernkette.test.ts:239` (bei mir grün). |
| Z-18 | CMS | **teilweise** | Anlegen, Veröffentlichen, Freigabe, Zeitplan, Menü, Weiterleitung und Anzeige mit Vier-Augen-Prinzip laufen echt (k1). Aber „Frühere Fassungen“ der Seiten stürzt immer ab, sobald es eine Fassung gibt (selbst nachgestellt, `page.tsx:65/77`). Zurückholen ist für Seiten damit nicht bedienbar. |
| Z-19 | Standort/Datenfluss | **erfüllt** (AUSNAHME Push, Centrifugo) | 0 fremde Hosts, 0 Geolocation- und 0 Push-Aufrufe ohne Klick, die Gegenprobe greift (o2). |
| Z-20 | Betrieb | **erfüllt** (Umgebung PostgreSQL 16, Centrifugo nicht live) | Wiederherstellungsprobe echt: 99/99 Tabellen, 5/5 Fehlerfälle erkannt (k2; Log gegengeprüft); Produktionsschalter aus; Wirkung des Next-Patches mit Gegenprobe. |
| Z-21 | Moschee 2026 | **erfüllt** | 0 Aussagen „geplant“ zum Gebäude (o2). |

## Verbleibende Lücken

### Technisch, nach Wichtigkeit
1. **HOCH (Z-18): Absturz der Seiten-Revisionen.**
   - In `page.tsx:77` auf `inhalt?.titel?.de` umstellen (oder `inhaltVon(null)` gibt `{}` zurück).
   - In `cms.spec.ts` einen Schritt „Frühere Fassungen öffnen, Fassung zurückholen“ ergänzen.
   - Prüfen, warum die Fehlergrenze HTTP 200 liefert.
2. **MITTEL (Z-07): 2.4.11 im Reihenfolge-Editor.**
   - In `ReihenfolgeEditor.tsx:75-82` nach dem Fokussieren `scrollIntoView({block:'nearest'})` aufrufen, dazu eine E2E-Prüfung „Fokus über der Leiste“.
   - Menü- und Baustein-Editor einmal gezielt messen; dort ist der Fehler bisher nur vermutet.
3. **NIEDRIG:**
   - `/verwaltung/lernende/[id]` gegen ungültige Daten absichern, oder in `beispielkonten.ts:111` ein gültiges fiktives Datum eintragen.
   - Die Kurskarten-Aktion bricht bei 390 px auf zwei Zeilen um (ohne Überlauf).
   - Auf `/suche` dauert der Tab ins Suchfeld im vollen Headless-Chromium manchmal ~300 ms; vermutlich ein Artefakt, in ML-27 im Feld bestätigen.
4. **Testlücken im Repo:**
   - Der Schritt „Fortschritt“ fehlt in `lernkette.spec.ts`.
   - Startklar hat keinen Testfall für den Zweig `wissen_thema`.
   - `/api/mein/neues` wird nicht mit fremdem Kanal getestet.
   - Zeitplan und Seiten-Freigabe gibt es nur in der Prüfer-Spec.
   - `wartung-sperre-postgres` braucht PostgreSQL 17 oder eine Variante mit Vorlage.
5. **Unterlagen nachführen:**
   - `PLAN.md:42`, `BERICHT.md:3/:75`, `ABNAHME.md:6`.
   - `funktionsliste-gemeinde.md:30/31/37/38/41/47/79`.
   - `imam.md:63` (auch die Administration darf freigeben).
   - `KERN.md:65` (B-22 um `NeuesHinweis.tsx` ergänzen).
6. **Umgebung:**
   - k1-Reste löschen: `web/.env`, `web/.next`, `web/test-results` und `scratchpad/tmp-k1`.
   - `K/PROTOKOLL-k1.md` fertigstellen.
   - Den Import-Bau auf 3100 wieder starten, falls er gebraucht wird.

### Nur Menschen
- **MN-00:** Produktionsdatenbank, Geheimnisse und SMTP. Erst danach gehen Konten, Verwaltung, CMS und die Volltextsuche live, und die Mail-Zusammenfassung wird zugestellt.
- **Neu zu bestätigen:**
  - Die 12 Wissens-Bestandstitel gelten als „geprüft ohne Prüfperson“; die religiöse Prüfung sollte sie bestätigen. Ich empfehle einen Eintrag in MENSCHEN.
  - L2-E06 (Audio über die Route) ist weiterhin nur vom Orchestrator entschieden.
- **MN-10, MN-11, MN-21, MN-22, MN-23:** Schutzkonzept, DSFA, Datenschutz v2 (mit dem offenen Prüfvermerk in `datenschutz-v2-bausteine.md`), Löschfristen und Sicherungsschlüssel.
- **MN-20, MN-24:** Konten für die religiöse Freigabe.
- **MN-02, MN-04, MN-05, MN-07:** Übersetzungen, Tajwid, Wortbedeutungen und Elifbe freigeben.
- **MN-03, MN-03b:** Rezitation aufnehmen und die Vereinbarung schließen.
- **MN-01, MN-06:** Lizenzen.
- **MN-08:** Moschee-Fakten.
- **MN-09, MN-13, MN-14, MN-15:** Jahrestabelle, Bankdaten, Iqama- und Freitagszeiten, Kandil- und Bayram-Tage.
- **MN-12, MN-18:** lokaler Server und Takt, dort die Wiederherstellungsprobe auf PostgreSQL 17.
- **MN-16, MN-17:** Lehrkräfte einladen, VAPID-Schlüssel.
- **MN-19:** echte Geräte und iOS.
- **MN-25, MN-26:** kleine Entscheidungen aus den Paketen.
- Alte Vercel-Projekte löschen.

## Gesamturteil

Die Nacharbeit 2 hat fast alle Lücken von 033ea6f wirklich geschlossen:
- F-38, F-40 und F-44 sind gebaut.
- Der erste Tab auf Hadith-Seiten ist schnell.
- Wortlaut und Wiederherstellungsprobe sind grün.
- Die Unterlagen stimmen mit N4 überein.
- Vor allem laufen die E2E jetzt echt: 983 grün, 0 rot.

Deshalb sind jetzt 19 von 21 Kriterien erfüllt, auf 033ea6f waren es 12. Gerade diese echten Läufe haben aber zwei Fehler gefunden, die ich selbst nachgestellt habe. Der eine ist alt und bisher übersehen: „Frühere Fassungen“ der CMS-Seiten stürzt immer ab. Der andere ist neu: Im Reihenfolge-Editor verdeckt bei 390 px die Speicherleiste den Fokus (2.4.11).

Beide lassen sich mit wenigen Zeilen beheben. Formal ist die Abnahme aber erst vollständig, wenn Z-07 und Z-18 mit einer E2E-Prüfung nachgewiesen sind. Ehrlich lautet die Übergabe: „Öffentliche Website fertig und live; Gemeinde-Plattform gebaut, sicherheitsgeprüft und echt Ende-zu-Ende getestet – nach dem Fix dieser zwei Fehler, MN-00 und den Freigaben aus MENSCHEN.md freigabereif.“