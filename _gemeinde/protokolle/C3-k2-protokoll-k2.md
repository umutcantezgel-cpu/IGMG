# Stufe C, zweite Nachprüfung – Prüfer k2 (Z-12, Z-13, Z-14, Z-20)

- Prüfling: `origin/main` = `origin/claude/trusting-lovelace-6nfolz` = HEAD = **90a8e37** (Arbeitsbaum `/home/user/IGMG`;
  der lokale Zweig `main` steht noch auf 71e263f, maßgeblich ist `origin/main`). Vorher: `C2-k2-protokoll-k2.md` (033ea6f).
- Node v24.21.0 (`scratchpad/node24`), pnpm 12.11.2, PostgreSQL 16.15 (Cluster aus `e2e-echt/start.sh`, lief schon), age 1.1.1,
  Docker Compose v5.6.0 (ohne Daemon). **Port 3100 nicht benutzt**; eigener Server nur auf **3142**, danach beendet.
- Repository unverändert: `git status --short` vorher und nachher leer. Eigener Produktionsbau NICHT im Repo, sondern aus
  `git archive 90a8e37 web betrieb` in `$O/baum` (node_modules kopiert, `.env` aus der Vorlage des P4-Arbeitsbaums mit Port
  3142), BUILD_ID siehe `$O/bau-id.txt`; nach den Prüfungen samt `.env` gelöscht. Hinweis: `web/.env` (08:51), `web/.next`
  (08:54) und `web/test-results` im Haupt-Arbeitsbaum stammen NICHT von k2, sondern vom parallel laufenden E2E-Lauf eines
  anderen Prüfers (Prozess `pnpm test:e2e … zugaenglichkeit-gemeinde …`); nicht angefasst.
- Ausgaben: `O=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c3/k2/`. Keine arabische
  Schrift in den Ausgaben (geprüft), keine Geheimnisse ausgegeben.

## Gelaufene Prüfungen

| # | Befehl | Ergebnis | Datei |
|---|---|---|---|
| 1 | `node _gemeinde/werkzeuge/wortlaut.mjs --basis b702c7c --stand 90a8e37 --protokoll $O/wortlaut` | **rc=0**, 0 offene Einheiten „hoch“, 690 durch Ausnahme gedeckt; Recht: 710 gleich, 8 geändert, 1203 neu, 0 entfernt | `$O/wortlaut.{md,json,log}` |
| 2 | Abgleich der Recht-Einträge 90a8e37 gegen den Lauf auf 033ea6f (`stufe-c2/k2/wortlaut-b702c7c-033ea6f.json`) | 70 neu/geändert, 0 weggefallen; alle mit Ausnahme (G-01, G-02, G-03, G-06, G-08, G-09, G-10) | `$O/delta-033ea6f.txt`, `$O/ausnahmen-neu.txt` |
| 3 | `vitest --project unit tests/unit/rechte/ funktionen next-patch chat-regeln chat-hinweise echtzeit betrieb-sicherung push-rueckfall push` | 12 Dateien, **101/101** (rechte 39, funktionen 5, next-patch 3, chat-regeln 22, chat-hinweise 4, echtzeit 5, betrieb-sicherung 5, push-rueckfall 11, push 7) | `$O/unit.{log,json}` |
| 4 | `vitest --project integration` verwaltung/rechte-matrix, verwaltung/rechte-matrix-gemeinde, rechte-matrix-mitglieder, gruppen-wahrheitstafel | 4 Dateien, **2302 grün + 2 erwartet fehlgeschlagen** (bekannte BEFUND-Fälle), 138 s: rechte-matrix 868, -gemeinde **981** (vorher 882), -mitglieder **453** (neu), Wahrheitstafel 2 | `$O/integration-z13.{log,json}` |
| 5 | `vitest --project integration` startklar, verwaltung/startklar-aktion, chat, sicherheit-s2-chat, push-zusammenfassung, push-ankuendigung, push, verwaltung-kinderschutz, mein-bereich-lernen, gemeinde-konten, loeschen-gemeinde, verwaltung-wissen, verwaltung-startseite, sicherheit-n4-vier-augen, -s2-konten, -s2-freigabe, -s3 | 17 Dateien, **238/238**, 253 s (startklar 35, startklar-aktion 24, chat 23, s2-chat 12, push-zusammenfassung 15, push-ankuendigung 7, push 9, kinderschutz 4, mein-bereich-lernen 14, gemeinde-konten 13, loeschen 2, wissen 24, startseite 20, n4 13, s2-konten 15, s2-freigabe 4, s3 4) | `$O/integration-z12-z14.{log,json}` |
| 6 | Wegwerf-Test `zusatz/neues-fremd.test.ts` (eigene Konfiguration `$O/vitest.zusatz.mts`, außerhalb des Repos) | **3/3**: fremder Elternkanal zählt nie (auch mit `ohne=<fremd>`), Gegenprobe zählt für die Eltern der fremden Gruppe 1; Konto ohne Gruppe: chat 0, `echtzeit: null`; Echtzeit-Tokens nie für fremde Kanäle | `$O/zusatz-neues-fremd.log` |
| 7 | Wegwerf-Test `zusatz/startklar-wissen.test.ts` | **1/1**: offenes Wissens-Thema seit 20 Tagen zählt als liegen geblieben, im Papierkorb nicht, nach Verlaufseintrag vor 3 Tagen nicht alt, geprüft → 0 | `$O/zusatz-startklar-wissen.log` |
| 8 | Gegenprobe S-09: `chat.test.ts` von 90a8e37 gegen den Code VOR dem Fix (`git archive 168f2de^` = 73a9e84) | **1 rot** („S-09: Entfernen hinterlässt Platzhalter“, `entfernt` undefiniert), 22 grün → der Test erkennt den Fehler | `$O/s09-gegenprobe-alt.log` |
| 9 | Startklar Produktion gegen `igmg` (`env -i`, `tsx scripts/startklar.ts --betriebsart produktion`, ohne `.env`) vor und nach der Wiederherstellungsprobe | rc=1 (Umgebungs-/Platzhalterfehler wie bisher); Gemeinde-Plattform: **[OK] Funktionsschalter** „Alle Funktionen mit Personendaten sind aus (Konten, Lernplattform, Chat, Push, Hatim, Newsletter)“, [OK] Religiöse Freigaben, [OK] Sicherung/Probe: vorher „05:35“ (P4), nachher **„11:01“** (mein Lauf) | `$O/startklar-produktion.txt`, `$O/startklar-produktion-nachher.txt` |
| 10 | `bash e2e-echt/wiederherstellung/lauf.sh $O/baum/web http://localhost:3142` (Skript unverändert, sha256 `8f288aec…` vorher = nachher) | **rc=0**, alle 8 Schritte wie in NA2-P4 §4 (Einzelheiten unten) | `$O/wiederherstellung-{vorher,nachher}.txt`, `$O/wiederherstellung-lauf.log` |
| 11 | Next-Patch: eigener Standalone-Bau 90a8e37, `GET /tr/unsere-moschee` (Fangroute, Sprach-Umleitung 308) mit und ohne Patch | mit Patch: Cache MISS **1×** `location: /tr/camimiz`; Gegenprobe (Patch-Zeile im gebauten Chunk der Kopie neutralisiert): MISS **2×** `location`, `fetch` sieht `"/tr/camimiz, /tr/camimiz"`; danach Original zurück, wieder 1× | `$O/next-patch-mit.txt`, `$O/next-patch-ohne.txt`, `$O/skripte/location.mjs` |
| 12 | `docker compose config --quiet` (beide Profile, Kopie von `betrieb/lokal` @ 90a8e37, `.env` = `.env.beispiel`), `sh -n` der 6 Kit-Skripte | rc=0 / rc=0, 6 Dienste; alle Skripte ok | `$O/kit-compose.txt` |
| 13 | Live-Abruf der Produktion (nur GET) | **nicht ausgeführt**: vom Berechtigungssystem abgelehnt („Production Reads“) | – |

## Z-12 Recht/Startklar – **erfüllt** (vorher teilweise)

- **Wortlaut rc=0** (vorher rc=2). Offene Einheiten „hoch“: 0. Gedeckt 690 (vorher 638). Treffer je Ausnahme:
  A-01 22, A-03 13, A-07 1, G-01 525, G-02 4, G-03 387, G-04 3, G-05 3, G-06 262, G-07 7, G-08 1, **G-09 3, G-10 1**.
- **Neue/erweiterte Ausnahmen begründet** (`_gemeinde/werkzeuge/wortlaut.mjs:566–578` G-06, `:601–607` G-09, `:609–618` G-10;
  Herkunft 9757df3, 56d013c, f562b1d, 731e838). Alle gedeckten Texte gelesen (`$O/ausnahmen-neu.txt`):
  - G-06 erweitert um `messages/verwaltung/{startseite,wissen}.json` (31 neue Bedientexte: „Reihenfolge speichern“, Feldhinweise,
    Papierkorb- und Revisionshinweise) und `messages/de.json` › `verwaltung.mails.{hinweis,betroffen}.*` (5 Hinweis-Mails ohne
    Namen/Inhalte) – die Abhilfe aus der Nachprüfung §2 Nr. 5. Keine Rechts- oder Einwilligungstexte.
  - G-09: `suche.statisch.hinweis` (de/tr/en) – Bedienhinweis der Suche ohne Datenbank. Kein Rechtsinhalt.
  - G-10: einziger GEÄNDERTER Eintrag außerhalb von A-01/G-02/G-08: `kurse.formular.verfuegbarkeitHinweis`, vorher „Zur Voranmeldung“,
    jetzt „Für diesen Kurs voranmelden“ (F-44). Bedienhinweis. Die Bedingung ist eng (Datei, Schlüssel, Textbestandteil).
- **Bestandstexte unverändert:** 710 gleich; die 8 Änderungen sind A-01 (2), G-02 (4), G-08 (1) (Tabellenschreibweise/Archivpfad,
  wie zuvor) und G-10 (1). `git diff --stat 033ea6f 90a8e37 -- web/docs/recht/` → nur `entwuerfe/datenschutz-v2-bausteine.md`
  (+11/−1: Abschnitte „Zusammenfassung per E-Mail“, „Hinweis in Mein Bereich“, Speicherschlüssel `igmg-mitteilung-mein-bereich`,
  Prüfhinweis „[prüfen: Rechtsgrundlage der Zusammenfassung …]“ für MN-11).
- **Entwürfe markiert:** alle 8 Dateien in `web/docs/recht/entwuerfe/` tragen in Zeile 3 „> **ENTWURF – vor Veröffentlichung durch
  Datenschutz/Recht prüfen (MENSCHEN MN-11)…**“; `web/docs/recht/datenschutz-hosting-v2.md:5` „Entwurf zur fachlichen Prüfung. Nicht
  veröffentlicht.“
- **Cockpit:** startklar 35/35, startklar-aktion 24/24. Die Prüfung „Religiöse Freigaben“ wurde für F-40 um `wissen_thema` erweitert
  (`web/src/lib/startklar/gemeinde.ts:109`, `:119–122` ohne Papierkorb, `:138`); damit sind alle 8 Tabellen mit `freigabeSpalten()`
  erfasst (gegen `grep freigabeSpalten() src/lib/db/schema`: quran ×3, hadith, elifbe, anzeige_folie, besonderer_tag, wissen_thema).
  Live gegen `igmg`: „[OK] Religiöse Freigaben“. **Lücke (niedrig):** `startklar.test.ts` hat keinen Fall für `wissen_thema`
  (`grep wissen` leer); meine Wegwerf-Probe (#7) belegt das Verhalten.

## Z-13 Konten/Rechte – **erfüllt** (bestätigt; Restbemerkungen der Vorprüfung behoben)

- **S1–S3:** `S2-S3-sicherheit.md:20` „Offen hoch/kritisch: 0“; S1 und S2/S3 seit 033ea6f unverändert (`git diff --stat` leer).
- **Generierte Matrix jetzt vollständig über alle Actions:** `rechte-matrix-mitglieder.test.ts` (neu, 453 Fälle: 8 Dateien ×
  9 Personengruppen × jede Action, dazu je Schalter) schließt die Restbemerkung (a). Vollständigkeit `:379–401`: „jede exportierte
  Action der acht Dateien ist erfasst“ und **„jede Datei unter src/server/actions gehört zu genau einer Matrix“** – beide grün.
- **Neue Actions erfasst:** `startseite` (3: speichereStartseite, startseiteZuruecksetzen, startseiteRevisionWiederherstellen) und
  `wissen` (6) in `verwaltung/rechte-matrix-gemeinde.test.ts:210–221` (9 von 9 exportierten Funktionen beider Dateien);
  `benachrichtigungen.speichereZusammenfassung` in `rechte-matrix-mitglieder.test.ts:152` (Soll `ohneKind`, Schalter `konten` und
  `push`). Im JSON-Bericht u. a. „Schüler (Kinderkonto): abgewiesen“, „Lehrkraft ohne zweiten Faktor: abgewiesen“, „Schalter „push“
  aus: abgewiesen“ und für alle 6 Wissens-Actions „Kinderschutz: abgewiesen“ – grün.
- **Weitere Restbemerkungen behoben:** die 4 ungenutzten Kinderschutz-Doppel in `actions/chat.ts` sind entfernt (Diff 033ea6f→90a8e37,
  Kopfkommentar `:28–32` verweist auf `kinderschutz.ts`/`lehrkraft.ts`); `rechte/gruppen.ts:3–7` beschreibt den Ablauf jetzt richtig.
- **Stichproben im Code nachverfolgt:**
  1. `setzeReligioesenStatus` (Papierkorb), `web/src/server/actions/freigaben.ts`: `zielZeile` für `wissen_thema` verlangt
     `isNull(imPapierkorbSeit)` (`:89–91`); dieselbe Bedingung steckt im SELECT (`:110`) und im UPDATE (`:116`), Vier-Augen `:113`;
     Ergebnis `nichtGefunden` → `nichtMehrOffen` (`:224`, `:247`). Warteschlange zeigt nur Themen außerhalb des Papierkorbs
     (`queries/verwaltung/freigaben.ts:140`); öffentlich nur veröffentlicht + geprüft + nicht im Papierkorb (`queries/wissen.ts:26–30`,
     Suche `lib/suche/titelindex-bau.ts:32`). Test `verwaltung-wissen.test.ts:359–373` (gefälschtes Formular im Papierkorb →
     `nichtMehrOffen`, Status bleibt `zur_pruefung`, nach Wiederherstellen freigebbar) – grün.
  2. `speichereZusammenfassung` (Kinderkonto), `web/src/server/actions/benachrichtigungen.ts:23–38`: Schalter `konten` (`:25`) und
     `push` (`:26`), `verlangeKontoRecht()` (`:27`), `!hatZugang(k) || k.istKind` → KeinRecht (`:28`), zweite Sperre über
     `zusammenfassungsLage` (`:31–33`, Grund `kind` → KeinRecht; `lib/push/zusammenfassung-mail.ts:50`). Auch beim täglichen Planen
     erneut geprüft (`lib/push/zusammenfassung.ts:81`) und beim Versand (`zusammenfassungEmpfaenger`, `zusammenfassung-mail.ts:63–72`).
     Tests: Matrix „Schüler (Kinderkonto): abgewiesen“; `push-zusammenfassung.test.ts:171` und `:352` – grün.
  3. `/api/mein/neues` (fremder Kanal), `web/src/app/api/mein/neues/route.ts`: ohne Schalter `konten` 404 (`:25`), ohne Sitzung/Faktor
     401 (`:26–27`); `ohne` wird nur als UUID-Form angenommen (`:32`) und kann Kanäle nur AUSSCHLIESSEN; Zählung nur über die Gruppen
     des eigenen Kontexts (`lib/push/neues.ts:34–38`, `:75`) mit Leserecht je Kanal (`leseLage`, `:85`); Echtzeit-Tokens nur aus
     `lesbareKanaele(kontext)` (`route.ts:45–48`, `neues.ts:51–61`); Antwort nur Anzahlen. Der Repo-Test deckt Nichtmitglied und den
     eigenen offenen Kanal ab (`push-zusammenfassung.test.ts:206–207`, `:422–455`), aber nicht `ohne=<fremder Kanal>` und fremde
     Echtzeit-Abos – das belegt meine Wegwerf-Probe #6 (3/3, mit Gegenprobe).
- **Restbemerkung (niedrig, kein Befund):** Für die neue Angriffsfläche von Nacharbeit 2 (F-38-Route, Wissen/Startseite) gibt es keinen
  eigenen S-Bericht; abgedeckt durch die generierte Matrix, die Modultests und meine Proben.

## Z-14 Kinderschutz – **erfüllt** (S-09 verbessert, S-16 nicht verschlechtert)

- **S-01…S-18:** Belege aus `C2-k2-protokoll-k2.md` (Tabelle) gelten weiter; die zugehörigen Suiten sind heute grün: chat 23/23,
  chat-regeln 22/22, chat-hinweise 4/4, sicherheit-s2-chat 12/12, verwaltung-kinderschutz 4/4, gemeinde-konten 13/13,
  loeschen-gemeinde 2/2, mein-bereich-lernen 14/14, startklar 35/35, n4 13/13, s2-konten 15/15. `lib/chat/regeln.ts` unverändert.
- **S-09 (entfernte Nachricht in offenen Fenstern):** `ladeNachrichten(kanal, kontext, nachId, abId)` (`lib/chat/dienst.ts:200–273`)
  liefert nach den Rechteprüfungen (`:206`, Lesegrund) zusätzlich `entfernt` = nur IDs entfernter Nachrichten desselben Kanals
  zwischen `abId` und `nachId` (`:235–252`, `isNotNull(entferntAm)` `:246`); Route nimmt `ab` (`app/api/mein/chat/[kanal]/route.ts`),
  `ChatFenster.tsx:128` schickt `&ab=`, `:142–149` setzt den Platzhalter. Test `chat.test.ts:256–275` grün auf 90a8e37 und **rot auf
  73a9e84** (Gegenprobe #8). E2E `chat.spec.ts:96–101` (zwei Browser, Leitung entfernt, Kind sieht Platzhalter) im Tor-Lauf
  (`e2e-echt/lauf-tor/ergebnis.json`, 08:16–08:45 UTC, im Chatfenster) **desktop passed**, ebenso Lauf 3.
- **F-38 und S-16 („Text … nie in Push, Mail oder Logs“, AUFTRAG.md:324):**
  - Mail-Zusammenfassung: Ausgangszeile nur mit Empfänger-Platzhalter `zusammenfassung:<Konto>` und verschlüsselten Anzahlen
    (`lib/push/zusammenfassung.ts:85–86`); Adresse erst beim Versand; Mail aus festen Texten + Anzahlen, `zahlAusDaten` lässt nur
    ganze Zahlen 0–9999 durch (`zusammenfassung-mail.ts:83–90`, `:93–108`). Test `push-zusammenfassung.test.ts:318–329`: HTML und
    Text enthalten weder Nachrichtentext noch Gruppen-, Personen- oder Ankündigungsnamen – grün.
  - Hinweis „Neues“: `/api/mein/neues` liefert nur `{stand, neu: {ankuendigung, chat, unterricht}, echtzeit}` (Test `:433`
    `not.toContain('Geheim')`, Probe #6); Browser-Mitteilung nur Titel + Anzahlen (`components/mein-bereich/NeuesHinweis.tsx:62–64`),
    nur nach Klick/Erlaubnis und bei nicht fokussiertem Fenster.
  - Logs: kein `console.*` in `lib/push/{rueckfall,neues,zusammenfassung,zusammenfassung-mail}.ts`, der Route, `NeuesHinweis.tsx`,
    der Mail-Vorlage und `actions/benachrichtigungen.ts` (grep leer). Neuer Audit-Eintrag `unterricht.termin_geaendert` nur mit IDs
    und Flag (`actions/lehrkraft.ts`, Diff).
  - Zählung respektiert S-03/S-17 (Leserecht inkl. Einwilligung und Notfall-Pause über `leseLage`, `neues.ts:15–16`, `:85`); Kinder
    bekommen keine Mail (`zusammenfassung-mail.ts:50`). **Ergebnis: keine Verschlechterung von S-16.**
- Weiter UMGEBUNGSAUSNAHME: echte Push-Zustellung (kein VAPID), Centrifugo-Signal live.

## Z-20 Betrieb – **erfüllt** (vorher teilweise)

- **Wiederherstellungsprobe nachvollzogen und selbst wiederholt** (NA2-P4 §4 gelesen; Skript `e2e-echt/wiederherstellung/lauf.sh`
  unverändert; Kit `betrieb/lokal/sicherung` unverändert seit 033ea6f und e02121c, `git diff --stat` leer). Empfänger der Meldungen:
  mein eigener Standalone-Server 90a8e37 auf Port 3142 gegen `igmg`. Ablauf 09:00:14–09:01:39 UTC (`$O/wiederherstellung-lauf.log`):

  | Schritt | Ergebnis (mein Lauf) | P4 (03:33 UTC) |
  |---|---|---|
  | Quelle `igmg` | 99 Tabellen `public`, Migrationen 17 | 98 / 15 |
  | `sichern.sh` (Leserolle, echtes pg_dump/gzip/age) | „Sicherung ok“ `igmg-20261016-0900.sql.gz.age` 7 226 411 Bytes + `.sha256`; Cockpit `sicherung.ok = true` | ok |
  | Entschlüsseln (Wegwerf-Schlüssel) | 100 `CREATE TABLE` (99 + drizzle) | 99 |
  | Einspielen in leere DB (`TEMPLATE template0`) | `psql -v ON_ERROR_STOP=1` rc=0; Tabellen 99/99, quran_vers 6236/6236, hadith 7580/7580, user 14/14, Migrationen 17/17, session 1/0 | entspr. |
  | `probe.sh` Gutfall | `[ 99 -gt 50 ]` → „Probe ok“, Cockpit `probe.ok = true`, `/tmp/probe` entfernt | ok |
  | Fehlerfälle: abgeschnitten (Prüfsumme alt) / abgeschnitten + Prüfsumme neu (< 4096) / leer / neueste < ½ der vorigen (3 613 109 statt 7 226 419) / keine Sicherung | jeweils „Probe FEHLER: keine unversehrte, vollständige Sicherung“, Cockpit `probe.ok = false` | gleich |
  | Gutfall zum Schluss | „Sicherung ok“, „Probe ok“, Cockpit beide `ok = true` (7 226 408 Bytes, 09:01:36/39 UTC) | gleich |

- **Nichts zurückgeblieben** (`$O/wiederherstellung-nachher.txt`): `/daten`, `/sicherung`, `/usr/local/bin/initdb`,
  `/usr/local/bin/pg_ctl`, `/tmp/probe` existieren nicht; Rollen nur `igmg, postgres` (keine `igmg_sicherung`); Datenbanken wie vorher
  (`igmg, igmg_e2e, postgres, template0, template1`, keine `igmg_wiederhergestellt`); `pg_default_acl` in `igmg` 0 Einträge wie vorher;
  `e2e-echt/wiederherstellung/` enthält wieder nur `lauf-1-rechte-fehlen.log`, `lauf.log`, `lauf.sh` (Schlüssel und Kopien gelöscht);
  Prozesse des Benutzers postgres: nur der Hauptcluster (PID 1358 seit 03:21), kein Probe-Cluster. Bleibende, gewollte Wirkung:
  `einstellung.lokaler_server` in `igmg` trägt jetzt meine Zeiten (09:01 UTC); Startklar zeigt „Letzte Sicherung/Probe: 11:01“.
- **Produktionsschalter sicher:** `funktionen.test.ts` 5/5 (`IN_PRODUKTION_AN = ['hadith_gesamt']`, `lib/funktionen-regeln.ts:26`;
  Datei seit 033ea6f unverändert); Startklar Produktion „[OK] Funktionsschalter … aus (Konten, Lernplattform, Chat, Push, Hatim,
  Newsletter)“; die neuen F-38-Wege hängen an `konten` (Route 404, `route.ts:25`) und `push` (Action `:26`, Planung laut Test
  `push-zusammenfassung.test.ts:378`). Live-Abruf nicht möglich (Berechtigung abgelehnt) – Beleg nur Code/Tests/Startklar.
- **Next-Patch:** Unit `next-patch` 3/3 (installierte Fassung 16.4.0 trägt den Patch in CJS und ESM). **Wirkung belegt:** im
  eigenen Standalone-Bau steht der Patch minifiziert in `.next/server/chunks/ssr/0ndd_next_dist_1-…js`; mit Patch 308 mit genau
  einer `location`, ohne (Gegenprobe, nur in der Kopie) doppelte `location` beim MISS, `fetch` liefert `"/tr/camimiz, /tr/camimiz"` –
  genau der Fehler aus Lauf 1 (`cms.spec` desktop rot, in Lauf 3 und Tor-Lauf grün). `pnpm-workspace.yaml:12–13`
  (`patchedDependencies`), `Dockerfile:11–12` kopiert `patches/`.
- **Kit lauffähig:** compose config beide Profile rc=0 (6 Dienste), `sh -n` aller Kit-Skripte ok; Centrifugo-Prüfungen
  (checkconfig/checksubtoken) aus der Vorprüfung gelten, Kit unverändert.
- **Grenzen (UMGEBUNG):** Kein Docker-Daemon → Skripte außerhalb ihres Containers mit nachgestellten Pfaden (unverändert); PostgreSQL 16
  statt 17 (nur Testumgebung, BETRIEB 6a/GO-LIVE G1 nennen 17); laufender Centrifugo nicht geprüft; Produktions-DB = MN-00.

## Aufräumen

Eigener Server (Port 3142) beendet (`/api/health` → keine Verbindung), keine Prozesse aus `$O/baum` mehr. Gelöscht: `$O/baum`
(Export, node_modules-Kopie, Bau, `.env` mit Geheimnissen, `.next/standalone/.env`), `$O/alt` (Gegenprobe S-09), Chunk-Kopie,
`$O/tmp`, `$O/medien`. Im Repository nichts verändert; `git status --short` leer.
