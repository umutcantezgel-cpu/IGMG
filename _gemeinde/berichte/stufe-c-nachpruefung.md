# Endprüfung der Nachprüfung Stufe C, Stand `main` = 033ea6f

Ergebnis: 12 Kriterien erfüllt, 2 als AUSNAHME mit Ersatz, 7 teilweise. Vorher (75cad0a) waren es 7 erfüllt, 2 AUSNAHME und 12 teilweise. Formal ist die Abnahme damit noch nicht vollständig.

Ich habe nur gelesen und Tests ausgeführt. `git status` ist vorher und nachher leer, HEAD ist 38440af (Code wie 033ea6f), und ich habe keinen Server gestartet oder beendet. Server 3100 ist der Produktionsbau wie ein frischer Vercel-Import (BUILD_ID `dTw7sfZlgh7KNLbuC0WeA`, 17:14 UTC, ohne Datenbank). Node kommt aus `scratchpad/node24` (v24.21.0), weil `$HOME/.local/bin` kein node enthält. Den von Playwright angelegten Ordner `web/test-results` (in git ignoriert) habe ich in meinen Ordner verschoben. Alle Belege liegen unter `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c2/endpruefer/`.

## Eigene Nachprüfungen

1. **Erster Tab auf langen Hadith-Seiten (Z-08), selbst gemessen** mit `skripte/erster-tab.mjs`, 390 px, CPU 4×, je 3 Läufe (`erster-tab-cpu4.log`):
   - `/hadith/bukhari/56`: 968, 1048 und 928 ms.
   - `/hadith/bukhari/1`: 136–168 ms.
   - `/quran/2`: je 40 ms.
   - Ursache im Code bestätigt: `HadithListe.tsx:17` setzt `contentVisibility:'auto'`, und `ERSTER_TAB` ist nur in `LeserRahmen.tsx:61` eingebunden.
   - Damit ist der neue Befund von o3 bestätigt.
2. **Wortlaut (Z-12):** `wortlaut.mjs --basis b702c7c --stand 033ea6f` endet mit **rc=2**. 5 Einheiten „hoch“ sind offen, 638 durch eine Ausnahme gedeckt (`wortlaut-b702c7c-033ea6f.md:11`, `:1031-1036`).
   - Offen sind `verwaltung.mails.hinweis.*` und `verwaltung.mails.betroffen.hinweis` in `messages/de.json:530-541`.
   - Inhaltlich sind das Hinweis-Mails der Verwaltung ohne Namen und keine Rechtstexte; gemeldet werden sie wegen des Worts „Datenschutzgründen“.
3. **Lernkette (Z-17):** Den Wegwerf-Test der ersten Prüfung habe ich auf dem jetzigen Code wiederholt: 7/7 grün (`lernkette-033ea6f.log`).
   - Neu: `tests/integration/lernkette.test.ts` liegt seit 2759a4a (N4) im Repo.
   - Integrationsauswahl, 9 Dateien mit **98/98 grün** (`integration-auswahl.log`): lernkette, verwaltung-cms, verwaltung-anzeige, sicherheit-s2-freigabe, verwaltung-rezitationen, quran, formular-voranmeldung, verwaltung-aufnahme, chat.
4. **E2E gegen 3100** (`playwright.lokal.config.ts`, `e2e-oeffentlich.log`):
   - Koran (quran, quran-leser, quran-offline): **49 grün, 1 übersprungen**, gleich wie vor N1.
   - `gebetszeiten-mein-ort`: **6/6** (Standort erlaubt/abgelehnt, „nichts verlässt das Gerät“).
   - `hadith`: 33 grün, 1 übersprungen, **2 rot** in `hadith.spec.ts:212`. Die Nummernsuche „Bukhari 1“ findet nichts, weil `suche.ts:117` ohne Datenbank absichtlich `[]` liefert (`:66`).
   - Das ist eine Umgebungsfolge und besteht seit vor 75cad0a. Live gilt aber dasselbe: `/suche?q=Gebet`, `Ramadan` und `Moschee` zeigen „Keine Treffer“ (`live-suche-hadith.html`).
5. **Datenfluss (Z-19):**
   - `Permissions-Policy` hat `geolocation=(self)` nur auf `/gebetszeiten`, `/tr/namaz-vakitleri` und `/en/prayer-times`, sonst `()`.
   - `skripte/fremd.mjs` (`fremd.log`) lud 14 Routen × 2 Breiten, alle mit Status 200. Ergebnis: **0 fremde Hosts, 0 Aufrufe von Geolocation, 0 von Push/Notification** ohne Klick.
6. **Religion (Z-15):**
   - `religion-pruefung.mjs` endet mit rc=0 („grün: 5358 Dateien“, `religion.txt`).
   - SHA-256 von `quran-uthmani.xml` beginnt mit `5ea5cbab9b4d0316` wie in QUELLE.md; die Datei hat 6236 `<aya`.
   - `git diff --stat 75cad0a 033ea6f -- web/daten` ist leer.
7. **Unit (Z-02):** `pnpm test:unit` ergibt 103 Dateien, **1488 grün + 3 erwartet fehlgeschlagen**, rc=0 (`unit-voll.log`).
8. **Unterlagen nach N4 (Z-10), neu bzw. bestätigt:**
   - `GO-LIVE.md:205` nennt „Migrationen 0000–0012“; es gibt aber `0013_sicherheit_s2_s3.sql` und `0014_vier_augen_n4.sql`. Der Vercel-Bau spielt alle aus dem Journal ein, die Zahl ist also nur veraltet.
   - `GO-LIVE.md:212` und `MENSCHEN.md:32` (MN-23) beschreiben noch die Vergabe von „kinderschutz“ nur durch „leitung“ und „die erste Person per `pnpm verwaltung:einladen`“. Das widerspricht `lib/rechte/schutzrollen.ts:8-21` (Administration beantragt, eine zweite Person bestätigt, Start-Ausnahme nur für die erste Leitung) und `actions/anmeldung.ts:259` (eine Einladung ergibt nur einen Antrag).
   - **Neu:** `handbuch/imam.md:59` sagt, die Warteschlange „Freigaben“ prüfe das Vier-Augen-Prinzip „noch nicht“. Seit N4 tut sie es (`actions/freigaben.ts:92-111`, S2b-1, Test grün).
9. **F-1/F-2 im Code (Z-07):**
   - Chat: `ChatFenster.tsx:211` setzt den Fokus vor dem Sperren ins Feld, `:221` auf die Statusmeldung, `:262` nach „Regeln bestätigen“; `:419` setzt `tabIndex={-1}`.
   - Anwesenheit: `AnwesenheitErfassen.tsx:49` bricht bei laufendem Speichern ab, `:133` nutzt `aria-disabled` statt `disabled`.
   - Bild `k1/bilder/gestell-chat-390-kind-3-nach-enter.png` angesehen: Der Ring liegt nach dem Senden im Feld.
   - Für die Lücke am Server habe ich `server-sicht3.log` geprüft: 9 Zeilen mit `gemeldete_person` und 24 mit `kinderschutz_pause`. Der Vorschau-DB fehlen also die Migrationen 0013/0014.
10. **Sicht (Z-04):** Ich habe `/quran/2` und `/hadith/bukhari/1` bei 1440 sowie `/gebetszeiten` und `/elifbe/buchstaben/be` bei 390 aufgenommen und angesehen (`bilder/`). Sie sind stimmig. Elifbe 390 entspricht im Aufbau `sicht2/bilder/elifbe-buchstabe-390-oben.png`; durch N1/N2 sehe ich keinen Rückschritt.
11. **Live:** GitHub-Deployment 7098340184 „Production – igmg-wetzlar“ steht auf 033ea6f, `success`. Live `/gebetszeiten` enthält `breite-nach-muster` (gibt es erst seit cbc2ff1). `/audio/x.mp3` antwortet 404, `/api/chat/…` 404, `/api/health` 503.
12. **Weitere Stichproben:**
    - 0 Treffer für die 27 alten freien Werte (`[30rem]`, `[17rem]`, `@min-[` …), für `active:scale-` und für `group-hover:translate` ohne `motion-safe:`.
    - `/var/run/docker.sock` fehlt, `pg_ctl` ist nicht installiert. Den Wiederherstellungstest kann man hier nicht ausführen.

## 1. Kriterien

| Z | Thema | Status | Beleg |
|---|---|---|---|
| Z-01 | Plan | **teilweise** | Die Ankündigungs-Mitteilung wird jetzt versendet (`ankuendigungen.ts:97-98`, Takt `route.ts:28`, 60/60 laut k3). Zwei Pflichtfunktionen sind aber nicht gebaut: F-38 Push-Rückfall (`funktionsliste-gemeinde.md:40`) und F-40 sortierbare Startseiten-Abschnitte und Pflege „Islamisches Wissen“ (`:42`). Dazu gibt es weder einen ENTSCHEIDUNGEN-Eintrag noch einen Vermerk in ADR 0034:24. F-44 ist teilweise, und `PLAN.md:38` führt N1/N2/N4 ohne Commit als „in Arbeit“ (letzte Änderung c812fc7). |
| Z-02 | Bestand | **erfüllt** | Unit 1488+3 (eigener Lauf) und Integration 2638 grün (k3) liegen über E0. F-01…F-24 sind wie im Vorlauf, F-25…F-60 sind jetzt definiert, auf 45 Routen gibt es 0 neue Konsolenfehler (k3). F-20 ist nur über die Integration belegt. |
| Z-03 | Designsystem | **erfüllt** | 0 freie Werte in 628 geänderten Dateien; 89 Ausnahmen sind belegt, 56 Funde sind Fehlalarme (o2). Mein grep auf die 27 alten Muster ergibt 0 Treffer. |
| Z-04 | Gestaltung | **erfüllt (Verfahrensvorbehalt wie bisher)** | Das Urteil aus sichtabnahme-3 gilt weiter. Meine 4 Aufnahmen nach N1/N2 zeigen keinen Rückschritt. Ein „Blindvergleich“ ist weiterhin nicht dokumentiert. |
| Z-05 | Bewegung | **erfüllt** | Bei reduzierter Bewegung bleiben 60/60 gedrückte Knöpfe und 74 Hover-Ziele ohne Größen- oder Lageänderung, in Ruhe 0 % verworfene Bilder bei CPU 4× (o2). `active:scale-` kommt 0-mal vor (eigener grep). |
| Z-06 | Grafik | **erfüllt** | Eine Icon-Familie (lucide-react 1.55.0), Werkzeugfehler 0, zur Laufzeit 0 ungeklärte SVG und 0 doppelte IDs (o2). |
| Z-07 | Zugänglichkeit | **teilweise** | Koran-Wörter sind per Tastatur erfüllt (k1). F-1/F-2 sind im Code (von mir gelesen) und im Prüfgestell mit Gegenprobe gegen 75cad0a behoben. Am Server fehlen aber der Nachweis für Chat, Anwesenheit und Kind-Senden sowie axe auf diesen Routen und 3 Verwaltungsrouten: Der Vorschau-DB fehlen 0013/0014, und das Prüfkonto `.invalid` ist gesperrt. Das ist kein Fall der Umgebungsausnahmen, sondern ein Rüstschritt des Orchestrators. |
| Z-08 | Leistung | **teilweise** | LCP liegt im Erstbesuch auf 7/7 und im Wiederbesuch auf 7/7 Routen bei ≤ 2,5 s (1815–2267 ms), CLS ≤ 0,001, JS 166–179,3 kB, TBT ohne Rückschritt gegenüber A-01, INP 7/7 (o3). Offen ist der erste Tab auf Hadith-Seiten mit 100 Karten: 928–1048 ms bei CPU 4× (selbst gemessen). Mein Bereich ist eine AUSNAHME; Ersatz ist die Bauausgabe mit 173–201 KiB. |
| Z-09 | Darstellung | **erfüllt (AUSNAHME echte Geräte/iOS)** | 16 Routen × 3 Breiten × 2 Bewegungsmodi ergeben 0 Überlauf (o2). |
| Z-10 | Übergabe | **teilweise** | Galerie, KERN-Verweise und VERCEL §0/§10/§12/§14 stimmen jetzt (k3). Veraltet sind: BERICHT und ABNAHME (Stand 75cad0a, b241611), `GO-LIVE.md:205/212`, `MENSCHEN.md:32` und `imam.md:59` (widersprechen N4, eigene Prüfung 8), `kinderschutz.md` (ohne die Bestätigung von Anträgen) und PLAN. |
| Z-11 | Vercel | **erfüllt (Abweichung L2-E06)** | Audio läuft über die Route, entschieden in ENTSCHEIDUNGEN L2-E06; ADR 0029:3 ist „angenommen“, beide `vercel.json` enthalten 0-mal „audio“. Live 033ea6f ist `success`, die Funktionen laufen in fra1. Entschieden hat der Orchestrator, nicht der Nutzer; eine Bestätigung durch den Nutzer wird empfohlen. |
| Z-12 | Recht/Startklar | **teilweise** | Die Rechtstexte sind seit 75cad0a unverändert, alle 8 Entwürfe tragen in Zeile 3 „ENTWURF“, und die Cockpit-Prüfung „Religiöse Freigaben“ gibt es (`gemeinde.ts:81-82`). Aber `wortlaut.mjs` endet mit rc=2: 5 neue Mailtexte aus N4 ohne Ausnahme, ein Rückschritt gegenüber N3 (rc=0). Rein formal; eine Repo-Änderung an G-06 behebt es. |
| Z-13 | Konten/Rechte | **erfüllt** | S2/S3 liegen vor mit 0 offenen Befunden „hoch“ oder „kritisch“ (`S2-S3-sicherheit.md:20`). Die generierte Matrix umfasst 17 Dateien × 11 Personengruppen mit Vollständigkeitsprüfung, die Gruppen-Wahrheitstafel liegt im Repo (k2). Restbemerkung niedrig: Die Actions des Mitgliederbereichs sind nur handgeschrieben getestet. |
| Z-14 | Kinderschutz | **erfüllt** | S-01…S-18 haben jeweils einen Test oder Beleg; N4 hat 9 Regeln verbessert und keine verschlechtert (k2). `chat.test.ts` ist im eigenen Lauf grün. |
| Z-15 | Religiöse Inhalte | **erfüllt** | SHA, 6236 Verse und `religion-pruefung` rc=0 mit 5358 Dateien selbst nachgeprüft; `web/daten` ist unverändert. |
| Z-16 | Koran/Rezitation | **teilweise** | Die Koran-E2E bleibt nach N1 bei 49 grün und 1 übersprungen (eigener Lauf). Eine E2E für den Player mit aktiver Rezitation gibt es weiterhin nicht. Die Werkstatt-Spec lief nie (AUSNAHME Docker-E2E); Ersatz ist `verwaltung-rezitationen` (grün). |
| Z-17 | Lernplattform | **AUSNAHME (Docker-E2E) mit Ersatz** | Der Kettentest liegt jetzt im Repo (`lernkette.test.ts`, 2759a4a) und ist bei mir 7/7 grün; auch der alte Wegwerf-Test läuft auf 033ea6f 7/7. Eine Docker-E2E-Kette ist nicht gelaufen. |
| Z-18 | CMS | **AUSNAHME (Docker-E2E) mit Ersatz** | `verwaltung-cms`, `verwaltung-anzeige` und `sicherheit-s2-freigabe` sind grün (eigener Lauf). `cms.spec` und `verwaltung-anzeige.spec` sind nie gelaufen. |
| Z-19 | Standort/Datenfluss | **erfüllt** | Geolocation nur auf den 3 Gebetszeiten-Routen; 0 Fremdanfragen, 0 Geolocation- und 0 Push-Aufrufe auf 28 Seitenaufrufen; E2E „Mein Ort“ 6/6 (alles eigene Prüfungen). Die Zustellung ist AUSNAHME. |
| Z-20 | Betrieb | **teilweise** | Centrifugo-Namensraum `chat` vorhanden (eigene Prüfung), checkconfig/checksubtoken, compose config, Rundlauf von `sichern.sh` mit echtem age, Produktionsschalter sicher (k2, live von mir bestätigt). Offen bleibt: `probe.sh` (Wiederherstellung) wurde nie ausgeführt; es gibt weder Docker-Daemon noch Postgres. |
| Z-21 | Moschee 2026 | **erfüllt** | 0 Aussagen „geplant“ zum Gebäude auf `/`, `/projekte`, `/ueber-uns` und den tr/en-Seiten. Die 2 Treffer auf `/` betreffen Ramadan-Aktivitäten (eigener curl). |

## 2. Verbleibende Lücken

### Technisch, nach Wichtigkeit

1. **Unterlagen nach N4 nachführen (Z-10).** Das wiegt am schwersten, weil Menschen damit den Go-Live machen.
   - `GO-LIVE.md:212` und `MENSCHEN.md:32` an das Vier-Augen-Prinzip anpassen: zuerst die Leitung (Start-Ausnahme), dann beantragt die Administration „kinderschutz“ und eine zweite Person bestätigt.
   - `GO-LIVE.md:205` auf „alle Migrationen (bis 0014)“ ändern.
   - `imam.md:59` und `kinderschutz.md` (Anträge bestätigen) aktualisieren.
   - BERICHT, ABNAHME und PLAN (N1/N2/N4 mit Hashes) auf 033ea6f bringen.
2. **Den Nachweis von Z-07 am Server nachholen.** Dazu `scratchpad/pglite-sicht` mit 0013/0014 migrieren, den Vorschau-Server neu starten und ein Verwaltungs-Prüfkonto mit zustellbarer Adresse (`.test`) anlegen. Dann k1 (a) und (b) wiederholen, inklusive Kind-Senden zwischen 08 und 20 Uhr. `a11y.mjs` sollte Fehlerseiten mit HTTP 200 nicht mehr als 0/0 zählen.
3. **Erster Tab auf Hadith-Buch- und Teilseiten (Z-08).** `ERSTER_TAB` dort einbinden (38 Seiten mit je 100 Karten), danach `/hadith/bukhari/56` und `/56/teil/2` nachmessen. `/gebetszeiten` hat nur 0,7 kB Luft zum JS-Budget.
4. **Zwei nicht gebaute Pflichtfunktionen (Z-01).** F-38 und F-40 entweder bauen oder die Abweichung in ENTSCHEIDUNGEN festhalten und vom Nutzer bestätigen lassen; ADR 0034 Nr. 6 als „nicht umgesetzt“ kennzeichnen.
5. **Wortlaut auf rc=0 (Z-12).** G-06 um `messages/de.json` › `verwaltung.mails.{hinweis,betroffen}.*` erweitern, mit Begründung.
6. **Wiederherstellungstest (Z-20).** `probe.sh` in einer Umgebung mit Docker oder Postgres ausführen, spätestens auf dem lokalen Server (MN-12).
7. **E2E-Lücken (Z-16, Z-17, Z-18).** Eine Player-E2E mit Testton-Rezitation schreiben. Einmal echt in Docker mit Mailpit laufen lassen: `verwaltung-rezitationen`, `cms`, `verwaltung-anzeige`, `mein-bereich-lernen` (mit den neuen Fokusprüfungen) und `formular-voranmeldung`.
8. **Kleinigkeiten:**
   - Im Beispielmodus zeigt die Suche live immer „Keine Treffer“, auch der angebotene Filter „Hadith“ mit Nummernsuche (`suche.ts:66-67`, `:117`). Ohne Datenbank sollte ein Hinweis erscheinen oder der Filter ausgeblendet werden.
   - Soft-404 (HTTP 200) auf `/mein-bereich`, `/anmelden` und `/registrieren`.
   - Derselbe Text steht nach „geschlossen“ doppelt als `role=status` da.
   - `/verwaltung` schickt Konten ohne Rolle auf „Zwei-Faktor einrichten“ (`pruefe.ts:68-69`).
   - Die Actions des Mitgliederbereichs fehlen in der generierten Matrix; 4 ungenutzte Kinderschutz-Actions (`actions/chat.ts:142-180`) haben keinen Test; der Kommentar `rechte/gruppen.ts:3` stimmt nicht.
   - VERCEL.md nennt das Projekt „igmg“ statt „igmg-wetzlar“ und den Stand 11.10.

### Nur Menschen (MENSCHEN.md)

- **MN-00:** Produktionsdatenbank und Geheimnisse. Erst danach gehen Verwaltung, CMS, Konten und die Suche live (jetzt „Keine Treffer“).
- **MN-10, MN-11, MN-21, MN-22, MN-23:** Schutzkonzept, DSFA, Datenschutz v2, Löschfristen, Sicherungsschlüssel. Die Kinderschutz-Rollen folgen jetzt dem Vier-Augen-Ablauf (erst die Leitung, dann Anträge).
- **MN-20, MN-24:** zwei Konten für die religiöse Freigabe.
- **MN-02, MN-04, MN-05, MN-07:** Übersetzungen, Tajwid, Wortbedeutungen und Elifbe freigeben.
- **MN-03, MN-03b:** Rezitation aufnehmen und die Vereinbarung schließen.
- **MN-01, MN-06:** Lizenzen.
- **MN-08:** Moschee-Fakten.
- **MN-09, MN-13, MN-14, MN-15:** Jahrestabelle, Bankdaten, Iqama- und Freitagszeiten, Kandil- und Bayram-Tage.
- **MN-12, MN-18:** lokaler Server und Takt, dort auch die Wiederherstellungsprobe ausführen.
- **MN-16, MN-17:** Lehrkräfte einladen, VAPID-Schlüssel.
- **MN-19:** echte Geräte, besonders iOS mit Tajwid.
- **MN-25, MN-26:** kleine Entscheidungen aus den Paketen.
- **Neu zu bestätigen:** L2-E06 (Audio über die Route) und die Behandlung von F-38/F-40.
- Alte Vercel-Projekte löschen.

## 3. Gesamturteil

Die Nacharbeit N1–N4 hat die meisten Lücken der ersten Prüfung wirklich geschlossen:
- S2/S3 sind durchgeführt, ohne offenen Befund „hoch“ oder „kritisch“, und die Angriffe der Gegenprüfung sind abgewehrt.
- LCP liegt auf allen 7 Messrouten unter 2,5 s, das JS-Budget ist wieder unter 180 kB.
- Fokus, Bewegung und freie Werte sind behoben, das Server-Kit hat den Centrifugo-Namensraum, und die Audio-Abweichung ist entschieden.

Die öffentliche Website auf 033ea6f ist live, sauber und für die Öffentlichkeit fertig. Die Zahl der Kriterien „teilweise“ ist von 12 auf 7 gesunken.

Formal ist die Abnahme aber noch nicht vollständig:
- Chat und Anwesenheit sind per Tastatur nur im Prüfgestell belegt, nicht am Server.
- Der erste Tab auf langen Hadith-Seiten blockiert rund 1 s.
- Zwei Pflichtfunktionen sind weder gebaut noch entschieden.
- Der Wortlaut-Lauf ist rot, und der Wiederherstellungstest lief nie.

Am meisten Sorge macht mir, dass GO-LIVE und MENSCHEN dem neuen Vier-Augen-Ablauf widersprechen; genau danach arbeiten die Menschen beim Go-Live. Ehrlich lautet die Übergabe weiter: „Öffentliche Website fertig; Gemeinde-Plattform gebaut und sicherheitsgeprüft, aber erst nach Datenbank, Freigaben aus MENSCHEN.md und einem echten E2E-Lauf freigabereif.“