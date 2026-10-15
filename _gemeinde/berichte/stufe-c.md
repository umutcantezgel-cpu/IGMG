# Endprüfung Stufe C: Gemeinde-Plattform, Stand `main` = 75cad0a

Ich habe nur gelesen und Tests ausgeführt; der Arbeitsbaum ist unverändert (`git status` leer). Meine Protokolle liegen unter `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/endpruefer/` (`e2e-quran.log`, `religion.txt`, `live-kopf.txt`).

## Eigene Nachprüfungen

1. **Galerie fehlt auf main:** `git show 75cad0a:_gemeinde/BERICHT.md` endet mit „## Galerie / [folgt nach der Nachabnahme]“. Die Galerie gibt es nur auf dem Branch (39f03da). Damit ist die Lücke aus k3 (Z-10) bestätigt.
2. **Centrifugo-Namensraum fehlt:** `betrieb/lokal/echtzeit/centrifugo.json` kennt nur `without_namespace`. Die App benutzt aber Kanäle mit dem Präfix `chat:` (`web/src/lib/echtzeit/centrifugo.ts:20`). Befund aus Z-20 bestätigt.
3. **Kein Audio-Rewrite:** Weder `vercel.json` noch `web/vercel.json` enthalten einen `/audio/*`-Rewrite. ADR 0029 verlangt ihn in Z. 15 und steht selbst noch auf „Status: vorgeschlagen“ (Z. 3). `lib/audio/speicher.ts:12-13` beschreibt die Route als Rückfall. Lücke aus Z-11 bestätigt.
4. **Fokusverlust nach Senden und Speichern:** Der Senden-Knopf wird gesperrt (`ChatFenster.tsx:378`, `disabled={gesperrt || sendet || !text.trim() …}`), ebenso der Speichern-Knopf (`AnwesenheitErfassen.tsx:130`, `disabled={sendet}`). F-1 und F-2 aus Z-07 sind im Code bestätigt.
5. **Push-Thema „ankuendigung“ ohne Versand:** Das Thema ist auswählbar, auch öffentlich (`gebetszeiten/page.tsx:316`). Versendet wird aber nur für Gebet (`abo.ts`, Takt), Gruppe/Chat/Unterricht (`gruppe.ts`) und die Probe (`api/push/abo/route.ts:67`). Es gibt keinen Aufrufer für das Thema. Lücke aus Z-01 bestätigt.
6. **Koran-Text und Grundtests:** `sha256sum web/daten/tanzil/quran-uthmani.xml` ergibt `5ea5cbab…b7468a`, genau wie `QUELLE.md:21`. Die Datei enthält 6236 `<aya>`. Die Unit-Tests `quran-daten`, `rechte/*` und `funktionen` laufen 52/52 grün.
7. **Religion-Prüfung:** `node _gemeinde/werkzeuge/religion-pruefung.mjs` endet mit rc=0 („grün: 5280 Dateien“). Der Produktionsbau liefert auf `/quran/1` `ausgaben:[]` und `rezitationen:[]`, zeigt also keinen ungeprüften Text.
8. **Z-16 (hatte kein Prüfer abgedeckt):** `playwright test -c playwright.lokal.config.ts` mit `quran.spec`, `quran-leser.spec` und `quran-offline.spec` gegen Server 3100 ergibt **49 grün, 1 übersprungen** (Offline nur auf Desktop, so gewollt), rc=0. Die zwei Fehlschläge in `quran-leser` aus `e2e-tor.log` (13.10.) sind damit behoben. Dazu laufen die Unit-Tests zu Audio, Rezitation und Leser 55/55 sowie die Integration `verwaltung-rezitationen` und `quran` 25/25.
9. **Ersatzbelege für Z-14 und Z-18:** Die Integration `verwaltung-cms`, `verwaltung-anzeige` und `chat` läuft 49/49 grün (16 + 10 + 23).
10. **S2/S3 fehlen:** In `_gemeinde/berichte/` liegt nur `S1-sicherheit.md` (geprüfter Stand 6b58403). Laut `AUFTRAG.md:510/512` waren S2 (in E4) und S3 (in E6) Pflicht. Befund aus Z-13 bestätigt.
11. **F-25…F-60 nirgends definiert:** Laut `AUFTRAG.md:506` sollten sie aus E0 kommen („LAGEBILD v2“). Es gibt nur das archivierte LAGEBILD mit F-01…F-24. Befund aus Z-02 bestätigt.
12. **Druck-Rückmeldung bei reduzierter Bewegung (Z-05):** Von 146 Stellen mit `active:scale-98` haben nur 31 die Variante `motion-reduce:active:scale-100`, 115 nicht. B-01 verlangt bei reduzierter Bewegung „nur Farbe“ (`_archiv/…/KERN.md:61`). Bestätigt.
13. **Veraltete Dokumentation (Z-10):** `PLAN.md` wurde zuletzt am 13.10. um 15:08 geändert (604ccf1). Die Zeilen O-B01, O-K05 und H-X01 stehen noch auf „in Arbeit“, die Zeile für O-F01 nennt „(dieser Commit)“ statt eines Hashes. `KERN.md:3` verweist auf `_werkstatt/`, und `KERN.md:62` meldet B-25 „noch nicht im Code“, obwohl es in `AnzeigeLive.tsx:49,164` steht.
14. **Geolocation und Live-Stand (Z-19):** Per curl liefert der Server 3100 `geolocation=(self)` nur auf `/gebetszeiten` und `/tr/namaz-vakitleri`; `/`, `/quran/1` und `/gebetszeiten/anzeige` haben `geolocation=()`. Live zeigt die canonical-Adresse auf `igmg-wetzlar.vercel.app`, `/audio/x.mp3` gibt 404 und `/api/health` 503 (ohne DB erwartet).
15. **Eigener neuer Befund (gering):** `/mein-bereich`, `/anmelden` und `/registrieren` antworten lokal **und live mit HTTP 200**, obwohl die Seite „Seite nicht gefunden“ zeigt (mit noindex). Das ist ein Soft-404; die Prüfer haben das als 404 beschrieben.
16. **Messweise des JS-Budgets:** Im Vorlauf wurde das JS-Budget mit der Lighthouse-Kennzahl gemessen (171–179 kB, `_archiv/…/ABNAHME.md:16`). Mit derselben Kennzahl liegen jetzt `/` bei 183,1 und `/gebetszeiten` bei 187,4 kB (`o3/lh-z08.md`). Das ist ein Rückschritt; o3 wertet stattdessen mit route-eigenem gzip.
17. **Wackliger Unit-Test:** `speicher-probe.test.ts` scheitert im Volllauf von k2 nach 10 s (`k2/unit-voll.log`), einzeln läuft er in 4,4 s grün.

## 1. Kriterien

| Z | Thema | Status | Beleg |
|---|---|---|---|
| Z-01 | Plan | **teilweise** | 16 von 19 Pflichtzeilen und Kür A 8/8 sind belegt (k3). Es fehlen der Versand des Push-Themas „ankuendigung“ (Nachprüfung 5), die sortierbare Startseite (kein Modul, obwohl `handbuch/redaktion.md:91` es beschreibt) und eine Verwaltung für „Islamisches Wissen“, und `PLAN.md` ist seit 13.10. nicht nachgeführt (Nachprüfung 13). |
| Z-02 | Bestand | **teilweise** | Die Suiten liegen über E0 und Tor E2 (Unit 1438 + 3 erwartet fehlgeschlagen, Integration 1680; geprüft in `scratchpad/tor-f-check.log`/`tor-f-int.log`), und F-01…F-24 zeigen keinen echten Rückschritt; aber F-25…F-60 wurden nie definiert (Nachprüfung 11), und auf `/gebetszeiten/anzeige` gibt es eine neue, umgebungsbedingte Konsolenmeldung (404 Bild). |
| Z-03 | Designsystem | **teilweise** | `freie-werte.mjs` findet 27 freie Werte in geänderten Dateien statt 0, z. B. `KontoEinstieg.tsx:61` `30rem` und `MeinBereichRahmen.tsx:88` `17rem` (von mir gesehen). |
| Z-04 | Gestaltung | **erfüllt (mit Verfahrensvorbehalt)** | Laut `sichtabnahme-3.md` haben alle 19 Ansichten im Median ≥ 8 und keine Kategorie < 7, darunter alle 12 Pflichtansichten; ich habe 4 Bilder angesehen (sicht3 hadith-buch-1440-oben, gruppenchat-melden-390-oben; sicht2 anwesenheit-390-oben, surenansicht-1440-oben), sie sind stimmig und die Restbefunde sichtbar (vorausgewähltes „Unangemessener Inhalt“, inzwischen behoben, `ChatFenster.tsx:425`); Vorbehalte: Ein „Blindvergleich“ ist nicht dokumentiert, 14 Ansichten wurden ohne Neubewertung übernommen, die R3-Aufnahmen stammen von vor dem Feinschliff in 75cad0a, und „Mobil“ liegt überall bei 7. |
| Z-05 | Bewegung | **teilweise** | Register B-01…B-27 und der Block für reduzierte Bewegung sind vorhanden, es gibt 0 Lage-Keyframes und ≤ 4,9 % verworfene Bilder (unter Last gemessen, nachzumessen); aber 115 Druck-Skalierungen und 2 `group-hover:translate` ändern Größe bzw. Lage auch bei reduzierter Bewegung (Nachprüfung 12). |
| Z-06 | Grafik | **erfüllt** | Eine Icon-Familie (lucide-react), 0 doppelte IDs, 4.492 von 4.499 SVG verborgen und 7 mit Name; die 15 Befunde des Werkzeugs sind Fehlalarme (o2). |
| Z-07 | Zugänglichkeit | **teilweise** | axe ergibt 0/0 auf 44 öffentlichen Routen × 3 Breiten (o1) und auf 7 Konto-Routen (k1), Koran-Wörter sind voll mit Tastatur bedienbar; aber nach Senden bzw. Speichern geht der Fokus verloren (F-1/F-2, WCAG 2.4.3; Nachprüfung 4), und Senden als Kind ist nicht geprüft. |
| Z-08 | Leistung | **teilweise (LCP offen)** | CLS ≤ 0,001 und INP 7/7 ≤ 200 ms; LCP verfehlt aber auf 4 von 7 Routen (Hadith 4393 ms und Elifbe 4515 ms, weil der Konzept-Hinweis nach der Hydrierung erneut öffnet, laut `o3/lcp-sonde.md`; `/quran/1` 2508 und `/quran/2` 2541 ms), der erste Tab auf `/quran/2` dauert bei CPU 4× 5,9 s, die TBT auf `/quran/2` ist 665 ms, und das JS-Budget ist nach Vorlauf-Messweise auf `/` und `/gebetszeiten` überschritten (Nachprüfung 16); Mein Bereich gilt als AUSNAHME mit Bauausgabe 192–207 KiB. |
| Z-09 | Darstellung | **erfüllt (AUSNAHME echte Geräte/iOS)** | Der Bildsatz über 174 Größen in de/tr hat 0 Überlauf, bei 414 eigenen Überlaufmessungen ist max(scrollWidth − clientWidth) = 0, und in 66 Harakat-Messungen ist nichts beschnitten (o1); einzelne Seed-Inhalte bleiben auf tr-Seiten deutsch. |
| Z-10 | Übergabe | **teilweise** | Handbücher (6), GO-LIVE G1–G7 und VERCEL.md §10/§12 (Zusammenführen, Zurückrollen) sind vorhanden; aber BERICHT ist auf main ohne Galerie und noch Entwurf mit veraltetem Prüfstand (Nachprüfung 1), KERN.md und PLAN.md sind veraltet (Nachprüfung 13), und die Handbücher versprechen fehlende Funktionen (`redaktion.md:91`, `eltern.md:105`). |
| Z-11 | Vercel | **teilweise** | V-01…V-13 sind belegt, der Bau mit Daten ist grün (1866 und 2207 Seiten), und live laufen die Funktionen in fra1 mit Deployment success für 75cad0a (o2); der geforderte Audio-Rewrite fehlt aber, und die Abweichung ist nicht entschieden (Nachprüfung 3). |
| Z-12 | Recht/Startklar | **teilweise** | Die Bestandsrechtstexte sind inhaltlich unverändert und alle 8 Entwürfe markiert (Zeile 3 jeweils „ENTWURF“, von mir geprüft); aber `wortlaut.mjs` endet mit rc=2 (235 Einheiten ohne Ausnahme), und das Cockpit prüft keinen Stau offener religiöser Freigaben (die Prüfungen in `lib/startklar/gemeinde.ts` habe ich gesichtet). |
| Z-13 | Konten/Rechte | **teilweise** | Matrix-Unit 37/37 (bei mir grün), Integration 859 Fälle, alle S1-Befunde behoben; aber S2 und S3 haben nie stattgefunden (Nachprüfung 10), die 17 neuen Verwaltungs-Actions stehen nicht in der generierten Matrix, und die Gruppen-Wahrheitstafel liegt nur im Scratchpad. |
| Z-14 | Kinderschutz | **erfüllt** | S-01…S-18 haben jeweils einen Test oder Codebeleg, `chat.test.ts` läuft 23/23 (bei mir grün); einige Teilregeln sind nur im Code belegt, und eine E2E mit zwei Browsern fehlt. |
| Z-15 | Religiöse Inhalte | **erfüllt** | SHA-256 und 6236 Verse von mir nachgerechnet, Rundreise-Test grün, `religion-pruefung` rc=0, und die Produktion zeigt keine ungeprüfte Übersetzung (Nachprüfungen 6 und 7). |
| Z-16 | Koran/Rezitation | **teilweise** | E2E für Lesen, Lesemodus Übersetzung, Wortkarte, Tajwid und Offline läuft 49/50 grün (Nachprüfung 8, `endpruefer/e2e-quran.log`); für den Player mit aktiver Rezitation gibt es keine E2E, und die Werkstatt-Spec `verwaltung-rezitationen.spec.ts` lief nie (Docker-AUSNAHME), als Ersatz dienen Integration 16 und Unit 55. |
| Z-17 | Lernplattform | **AUSNAHME mit Ersatz** | Ein Wegwerf-Kettentest auf PGlite mit echtem Better Auth läuft 7/7 (`k2/lernkette.log`, von mir gelesen); eine Docker-E2E-Kette gibt es nicht, und der Ersatztest liegt nicht im Repo. |
| Z-18 | CMS | **AUSNAHME mit Ersatz** | Integration cms 16/16 und anzeige 10/10 (bei mir grün), die Oberflächen sind vorhanden; die E2E `cms.spec` und `verwaltung-anzeige.spec` liefen nie. |
| Z-19 | Standort/Datenfluss | **erfüllt** | Auf 63 Routen gibt es 0 Fremdanfragen, 0 Koordinaten im Netz und Geolocation nur auf den 3 Gebetszeiten-Routen (o2, Nachprüfung 14), Push wird ohne Klick 0-mal aufgerufen; der Klickweg zum Opt-in ist mangels VAPID nicht E2E-geprüft, die Zustellung ist AUSNAHME. |
| Z-20 | Betrieb | **teilweise** | Die Produktionsschalter sind sicher (funktionen 5/5, live 404 bzw. „nicht gefunden“), und `docker compose config` ergibt rc=0; aber dem Kit fehlt der Centrifugo-Namensraum `chat` (Nachprüfung 2), und der Wiederherstellungstest wurde nie ausgeführt. |
| Z-21 | Moschee 2026 | **erfüllt** | Auf den Pflichtseiten in de/tr/en steht 0-mal „geplant/Zukunft“ zum Gebäude, der Status ist „fertiggestellt“ und die Fakten sind Platzhalter (MN-08); die historische Nachricht „Bauarbeiten beginnen im Herbst“ (`seeds/daten/nachrichten.ts:184`, 2024) bleibt sichtbar. |

**Zählung:** 7 erfüllt, 2 AUSNAHME mit Ersatz, 12 teilweise. Davon ist bei Z-08 das LCP-Teilkriterium offen. In `_gemeinde/ABNAHME.md` stehen noch fast überall „offen“ und keine Belege.

## 2. Lücken vor der Übergabe an die Gemeinde

### Technisch noch zu tun (nach Wichtigkeit)

1. **Sicherheitsprüfung S2/S3 nachholen (Z-13).** Sie umfasst Chat, Push, `/api/anzeige`, CMS, die 17 neuen Verwaltungs-Actions und die Sicherheitsmail. Die generierte Matrix muss diese Actions und die Gruppenrechte im Repo abdecken. Das ist Voraussetzung, bevor eine Funktion mit Personendaten eingeschaltet wird.
2. **E2E einmal echt laufen lassen (Z-16, Z-17, Z-18).** In einer Docker-Umgebung mit Mailpit und eigener DB: `verwaltung-rezitationen`, `cms`, `verwaltung-anzeige`, `mein-bereich-lernen` und `formular-voranmeldung`. Den Lernketten-Ersatztest ins Repo übernehmen und eine Player-E2E mit Testton-Rezitation ergänzen.
3. **LCP und Eingabe (Z-08).**
   - Den Konzept-Hinweis nach der Hydrierung nicht erneut öffnen (`KonzeptHinweis.tsx`); das betrifft Hadith und Elifbe.
   - Auf `/quran/*` das blockierende CSS verkleinern.
   - Den ersten Tab auf `/quran/2` beschleunigen (5,9 s). Vermutete Ursache laut o3: `content-visibility:auto` zusammen mit `tabIndex` je Vers.
   - Die lange Aufgabe aus `anreichern.ts` aufteilen.
   - Das JS-Budget mit der Messweise des Vorlaufs wieder unter 180 kB bringen.
4. **Centrifugo-Namensraum `chat` ergänzen und Wiederherstellungstest ausführen (Z-20).** Den Namensraum in `betrieb/lokal/echtzeit/centrifugo.json` eintragen und `sicherung/probe.sh` auf echtem Docker laufen lassen.
5. **Keine leeren Versprechen (Z-01, Z-10).** Das Push-Thema „ankuendigung“ entweder versenden oder aus der Auswahl nehmen; Besucher abonnieren sonst etwas, das nie kommt. Die Handbücher an den Ist-Stand anpassen (Verwaltung › Startseite, Freigabe von Wissensthemen und Elifbe-Lektionen, Mail-Erinnerung) oder die Funktionen bauen.
6. **Fokus behalten (Z-07, F-1/F-2).** Nach Senden und Speichern den Fokus halten, etwa ins Feld bzw. auf eine Statusmeldung setzen. Senden als Kind zwischen 08 und 20 Uhr nachprüfen.
7. **Übergabepapiere abschließen (Z-10).** Galerie per Fast-Forward auf main bringen, BERICHT mit Stand Z-01…Z-21 und aktuellem Prüfstand fertigstellen, ABNAHME.md mit Belegen füllen, PLAN.md nachführen und die Verweise in KERN.md korrigieren. VERCEL.md §14 verweist für ML-09 auf das falsche MENSCHEN.md.
8. **Audio-Auslieferung entscheiden (Z-11).** Die Route statt des Rewrites in ENTSCHEIDUNGEN festhalten und ADR 0029 nachführen (Status, Nr. 1).
9. **Rechtstexte und Cockpit (Z-12).** Für die 234 neuen Verwaltungstexte Wortlaut-Ausnahmen mit Grund eintragen. Eine Cockpit-Prüfung für den Stau offener religiöser Freigaben ergänzen.
10. **Funktionsliste (Z-02).** F-25…F-60 nachholen oder die Abweichung festhalten. Die Erwartungen in `funktionsliste.mjs` für F-03 und F-08 anpassen.
11. **Bewegung (Z-05).** Bei reduzierter Bewegung keine Druck-Skalierung mehr: global in CSS oder an den 115 Stellen; dazu die 2 `group-hover:translate`. Die Bildraten in Ruhe nachmessen.
12. **Freie Werte (Z-03).** Die 27 freien Werte durch Tokens ersetzen oder als Ausnahme begründen.
13. **Kleinigkeiten:**
    - Soft-404 (HTTP 200) auf `/mein-bereich`, `/anmelden` und `/registrieren` beheben.
    - Den wackligen `speicher-probe.test.ts` robust machen.
    - `svg-pruefung.mjs:51` auf die Kurzform von `aria-hidden` anpassen.
    - Den Zeilenabstand der Hadith-Texte angleichen (`HadithListe.tsx:72`).
    - Das Koranwort auf der Elifbe-Seite in Amiri Quran setzen.

### Nur Menschen können das (MENSCHEN.md)

- **MN-00:** Produktionsdatenbank und Geheimnisse in Vercel. Ohne sie bleiben Verwaltung, CMS und Konten aus, und `/api/health` liefert 503.
- **MN-10, MN-11, MN-21, MN-22, MN-23:** Schutzkonzept, DSFA, Datenschutz v2, Einwilligungen, Löschfristen, Sicherungsschlüssel und zwei Personen mit Rolle Kinderschutz. Erst danach dürfen Konten, Lernplattform und Chat eingeschaltet werden.
- **MN-20, MN-24:** Zwei Konten mit religiöser Freigabe (Imam und Hoca).
- **MN-02, MN-04, MN-05, MN-07:** Übersetzungen, Tajwid-Texte, Wortbedeutungen und Elifbe-Inhalte freigeben.
- **MN-03, MN-03b:** Rezitation aufnehmen und die Vereinbarung unterschreiben.
- **MN-01, MN-06:** Lizenzen bestätigen; Rechtsprüfung des Bukhari-Volltexts (empfohlen).
- **MN-08:** Moschee-Fakten, darunter Adresse und Koordinaten. Davon hängt auch die Karte auf `/kontakt` ab.
- **MN-09, MN-13, MN-14, MN-15:** Jahrestabelle, Bankdaten, Iqama- und Freitagszeiten, Kandil- und Bayram-Tage.
- **MN-12, MN-18:** Lokaler Server und Minutentakt.
- **MN-16, MN-17:** Lehrkräfte einladen, VAPID-Schlüssel setzen, Push-Themen bestätigen.
- **MN-19:** Prüfung auf echten Geräten, besonders iOS/Safari mit Tajwid.
- **MN-25, MN-26:** Kleine Entscheidungen aus den Paketen.
- Alte Vercel-Projekte (igmg-ldk, web, spiegel) löschen (PRÜFPUNKT).

## 3. Gesamturteil

Die öffentliche Website auf 75cad0a ist fertig für die Öffentlichkeit. Koran, Hadith, Elifbe, Gebetszeiten mit „Mein Ort“ und die Moschee-2026-Seiten sind live, in drei Sprachen, bei axe ohne Befund und ohne Datenabfluss. Die religiösen Inhalte sind sauber abgesichert; das habe ich selbst nachgeprüft (SHA, Religion-Prüfung, 49 grüne Koran-E2E).

Der Plattformteil ist gebaut und auf Integrationsebene breit getestet: Konten, Lernplattform, Chat mit Kinderschutz, CMS und Anzeige. Er lief aber nie Ende zu Ende in einer echten Umgebung mit Datenbank, und die geplanten Sicherheitsprüfungen S2 und S3 haben nicht stattgefunden. Er muss deshalb ausgeschaltet bleiben, bis S2/S3, die E2E-Läufe und die Freigaben aus MENSCHEN.md vorliegen.

Formal ist der Lauf nicht vollständig abgenommen: 7 Kriterien erfüllt, 2 als Umgebungsausnahme mit Ersatz, 12 teilweise. Am schwersten wiegen das verfehlte LCP auf 4 von 7 Messrouten, die nicht gelieferte Ankündigungs-Mitteilung, das wirkungslose Echtzeit-Signal im Server-Kit und Übergabepapiere, die auf main noch Entwurf bzw. veraltet sind.

Ehrlich gegenüber der Gemeinde ist diese Übergabe: „Öffentliche Website fertig; Gemeinde-Plattform vorbereitet, aber noch nicht freigabereif.“