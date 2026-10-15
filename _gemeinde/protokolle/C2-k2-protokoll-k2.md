# Stufe C, Nachprüfung – Prüfer k2 (Z-12, Z-13, Z-14, Z-20)

- Prüfling: `main` = `origin/main` = **033ea6f** (Arbeitsbaum `/home/user/IGMG`, Branch `claude/trusting-lovelace-6nfolz`
  @ 38440af = 033ea6f + nur `_gemeinde/PRUEFPUNKT.md`, `git diff --stat 033ea6f HEAD`). Vorheriges Urteil: Stand 75cad0a,
  `_gemeinde/protokolle/C-k2-protokoll-k2.md`. Live-Produktion = 033ea6f (GitHub-Deployments 7098340184/7098349348,
  Status `success`, 2026-10-15T16:29Z).
- Node v24.21.0 (`scratchpad/node24`; `$HOME/.local/bin` enthält kein node, System-node ist v22, `engines` verlangt 24.x),
  pnpm 12.11.2. Repository unverändert (`git status --short` leer nach allen Läufen). Kein Server gestartet oder beendet.
- Ausgaben: `O=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c2/k2/`.

## Gelaufene Prüfungen

| # | Befehl | Ergebnis | Datei |
|---|---|---|---|
| 1 | `vitest run --project unit tests/unit/rechte/ funktionen echtzeit chat-regeln betrieb-sicherung` | 8 Dateien, **76/76 grün** (rechte: matrix 13, matrix-negativ 15, gruppen 9, gruppen-wahrheitstafel 2; funktionen 5; echtzeit 5; chat-regeln 22; betrieb-sicherung 5) | `$O/unit-z13-z20.log`, `.json` |
| 2 | `vitest run --project integration` startklar, verwaltung/startklar-aktion, chat, sicherheit-s2-chat, verwaltung-kinderschutz, mein-bereich-lernen, gemeinde-konten, loeschen-gemeinde, verwaltung-lernen | 9 Dateien, **141/141 grün**, 68 s (startklar 35, startklar-aktion 24, chat 23, s2-chat 12, kinderschutz 4, mein-bereich-lernen 14, gemeinde-konten 13, loeschen 2, verwaltung-lernen 14) | `$O/integration-z12-z14.log`, `.json` |
| 3 | `vitest run --project integration` verwaltung/rechte-matrix-gemeinde, gruppen-wahrheitstafel, verwaltung/rechte-matrix, sicherheit-s2-konten, sicherheit-n4-vier-augen, sicherheit-s3, sicherheit-s2-freigabe, verwaltung-benutzer, konten | 9 Dateien, **1819 grün + 2 erwartet fehlgeschlagen** (die bekannten BEFUND-Fälle Tickets), 254 s (matrix-gemeinde 882, rechte-matrix 868, wahrheitstafel 2 [756 Fälle], s2-konten 15, n4 13, s3 4, s2-freigabe 4, benutzer 17, konten 16) | `$O/integration-z13.log`, `.json` |
| 4 | `node _gemeinde/werkzeuge/wortlaut.mjs --basis b702c7c --stand 033ea6f --protokoll $O/wortlaut-b702c7c-033ea6f` | **rc=2**, 5 offene Einheiten „hoch“, 638 durch Ausnahme gedeckt | `$O/wortlaut-b702c7c-033ea6f.{md,json}`, `$O/wortlaut.log` |
| 5 | dasselbe gegen 539ae90 (Merge N3) und 69ad49c (Merge N4) | 539ae90 **rc=0** (0 offen); 69ad49c **rc=2** (5 offen) | `$O/wortlaut-b702c7c-539ae90.*`, `$O/wortlaut-b702c7c-69ad49c.*` |
| 6 | `SITE_MODE=produktion pnpm startklar --betriebsart produktion --pglite <Kopie web/.pglite-bau>` (env -i, keine Geheimnisse) | rc=1 (15 Fehler = Umgebungswerte, Konzept-Hinweis, Platzhalter Impressum/Datenschutz); Gemeinde-Plattform: **[OK] Funktionsschalter**, [OK] Moderationsprotokoll, **[OK] Religiöse Freigaben** „Kein religiöser Inhalt wartet auf die Prüfung.“, 3× [WARNUNG] lokaler Server nie gemeldet | `$O/startklar-produktion.txt` (Kopie danach gelöscht) |
| 7 | `docker compose config --quiet` / `--profile echtzeit config --quiet` (Kopie von `betrieb/lokal`, `.env` = `.env.beispiel`; Docker Compose v5.6.0, kein Daemon nötig) | **rc=0 / rc=0**, 6 Dienste | `$O/kit-compose-config.txt`, `$O/kit-dienste-umgebung.txt` |
| 8 | `sh -n`/`dash -n`/`bash -n` aller 6 Kit-Skripte, `node --check` echtzeit/pruefen.mjs + spiegel/spiegel.mjs, JSON `centrifugo.json`, YAML `docker-compose.yml` | alle ok | `$O/kit-syntax.txt` |
| 9 | `centrifugo checkconfig` (v6.5.1, Binärdatei aus `scratchpad/n3/centrifugo-dl`, startet keinen Server) | rc=0 (auch die alte Datei – checkconfig prüft nur die Form) | `$O/centrifugo-checkconfig.txt` |
| 10 | `centrifugo checksubtoken` mit dem Abo-Token aus `echtzeitTokens()` der App (Wegwerf-Schlüssel) | „valid subscription token for user "person-1" and channel "chat:kanal-9"“ rc=0; falscher Schlüssel → „signature is not valid“ rc=1 | `$O/centrifugo-checksubtoken.txt` |
| 11 | Simulation `sichern.sh` mit Platzhaltern (dash und bash, 8 Fälle) | Erfolg „ok“; pg_dump-, gzip-, age-Fehler, falscher Kopf, leer → je „fehler 0“, keine neue Datei, keine `.teil`, alte bleiben; auffällig klein → Datei bleibt, „fehler <Größe>“; Rotation SICHERUNG_TAGE=1 → 1 Datei | `$O/sicherung-simulation.txt` |
| 12 | `sichern.sh` mit **echtem gzip und echtem age 1.1.1** (pg_dump = Stand-in: alle 15 Migrationen, 80663 Bytes) | dash und bash: „sicherung ok 11716“, Kopf `age-encryption.org/v1`, `sha256sum -c` OK, `age -d` + `gunzip` == Eingabe (`cmp` ok), ohne privaten Schlüssel nicht entschlüsselbar; leerer Abzug mit echtem age (220 Bytes) → „FEHLER: zu klein“ | `$O/sicherung-echt-age.txt`, `$O/skripte/sicherung-echt.sh` (Wegwerf-Schlüssel gelöscht) |
| 13 | Wegwerf-Integrationstest (eigene Vitest-Konfiguration außerhalb des Repos): S-13 Tagesgrenze 200, S-12 erledigte Meldung 1 Jahr | **2/2 grün** | `$O/zusatz/chat-fristen.test.ts`, `$O/vitest.zusatz.mts`, `$O/zusatz-chat-fristen.log` |
| 14 | Nachstellung der N4-Gegenprüfung (`scratchpad/n4-pruef/m2-start.test.ts`, Pfad auf den Haupt-Checkout umgestellt, sonst unverändert; der Test erwartet den ERFOLG des Angriffs) | **alle 3 Angriffe scheitern** (3 rot = Angriff abgewehrt, siehe Z-13) | `$O/angriff/m2-start-nachstellung.test.ts`, `$O/angriff-nachstellung.log` |
| 15 | Live (curl, nur GET bzw. leeres POST) gegen `igmg-wetzlar.vercel.app` @ 033ea6f | `/anmelden`, `/registrieren`, `/mein-bereich`, `/mein-bereich/unterricht`: 200 „nicht gefunden“ + noindex, kein `<form>`; `/hatim`, `/newsletter` 404; `/api/mein/chat/…`, `/api/mein/echtzeit` 404; `POST /api/push/abo` 404 | `$O/live-schalter.txt` |

## Z-12 Recht/Startklar – **teilweise** (vorher teilweise)

**Wortlaut** (Basis b702c7c, Stand 033ea6f): 1872 Rechtseinträge; gleich 711, geändert 7, neu 1154, entfernt 0,
verschoben 0. **rc=2, 5 offene Einheiten „hoch“** (vorher 235):
`messages/de.json` · `verwaltung.mails.hinweis.betreff|text|knopf|hinweis` und `verwaltung.mails.betroffen.hinweis`
(`web/messages/de.json:530–541`). Herkunft: N4 – `hinweis` aus c38977e, `betroffen` aus 9cf309d (`git log -S`). Beleg der
Herkunft: Merge N3 539ae90 → rc=0, Merge N4 69ad49c → rc=2 (Lauf 5). Die Ausnahme G-06
(`_gemeinde/werkzeuge/wortlaut.mjs:566–575`) deckt nur `messages/verwaltung/*.json`; die neuen Verwaltungs-Mailvorlagen
liegen in `messages/de.json`. Inhaltlich keine Rechtstexte (Hinweis-Mails ohne Namen an Leitung/Kinderschutz bzw. an die
betroffene Person), formal aber ohne begründete Ausnahme → Werkzeug rot. Abhilfe: G-06 um `messages/de.json`
`verwaltung.mails.(hinweis|betroffen).*` erweitern (Repo-Änderung, nicht Aufgabe des Prüfers).

**Ausnahmen begründet?** Ja, Stichprobe aller 7 Änderungen und der G-06…G-08-Fälle:
- Die 7 geänderten Einträge: A-01 (2, Hosting-Baustein v2: Tabellenschreibweise und Pfad `_werkstatt/…` → `_archiv/…`),
  G-02 (4, nur Tabellenschreibweise), G-08 (1, Abschnitt Mailanbieter: Tabellenschreibweise + Archivpfad). Kein
  Bestandsrechtstext inhaltlich geändert, keiner entfernt.
- G-06 (229): nur Dateien `messages/verwaltung/{lernen 56, seiten 48, anzeige 26, koran 20, rezitationen 18, menues 12,
  hatim 8, besondereTage 7, newsletter 7, spenden 7, weiterleitungen 6, freigaben 5, kinderschutz 3, audit 2,
  sicherheit 2, gemeindeImBlick 1, ankuendigungen 1}.json`; die 12 Einträge mit „Einwilligung/Datenschutz/Widerruf“ sind
  Beschriftungen der Verwaltung (z. B. „Widerrufen“, „Einwilligungen“, Audit „Einwilligung für ein Kind erteilt“).
- G-07 (7): `bloecke.nurDeutsch` (de/tr/en), `start.fasten.vorschauHinweis` (de/tr/en), „Konto gelöscht“ (loeschen.ts).
- A-01 v2-Baustein: `v2_eingespielt: 0` von 23 Absätzen (nicht ausgeliefert).

**Entwürfe markiert:** alle 8 Dateien in `web/docs/recht/entwuerfe/` Zeile 3 „> **ENTWURF – vor Veröffentlichung durch
Datenschutz/Recht prüfen (MENSCHEN MN-11)…**“; `web/docs/recht/datenschutz-hosting-v2.md:5` „Entwurf zur fachlichen
Prüfung. Nicht veröffentlicht.“; `git diff --stat 75cad0a 033ea6f -- web/docs/recht/` leer (unverändert).

**Cockpit (startklar):** Integration startklar **35/35**, startklar-aktion **24/24**. Neue Prüfung „Religiöse Freigaben“:
`web/src/lib/startklar/gemeinde.ts:81–82` (`FREIGABE_STAU_TAGE = 14`), `:92–148` (`religioeseFreigabeLage`: alle 7 Tabellen
mit `freigabeSpalten()` – quran_wortbedeutung, quran_wortbedeutung_ort, tajwid_regel, hadith_uebersetzung, elifbe_lektion,
besonderer_tag, anzeige_folie – plus freie Seiten über den letzten Verlaufseintrag; vollständig gegen
`grep freigabeSpalten src/lib/db/schema`), `:311–326` (Warnung ab > 14 Tagen, sonst ok mit Zahl). Test
`tests/integration/startklar.test.ts:465–525` (ok leer; 2 offen ohne Stau; maßgeblich jüngste Einreichung; Folie über
`aktualisiertAm` + Seite über Verlauf → Warnung „2 … seit mehr als 14 Tagen“, „insgesamt 4 offen“; nach Entscheidung ok) –
grün. Real gegen die Bau-DB: „[OK] Religiöse Freigaben – Kein religiöser Inhalt wartet auf die Prüfung.“ (Lauf 6). Übrige
Cockpit-Prüfungen wie zuvor grün: Schalter `:392/:405/:412`, Takt `:427`, Sicherung/Probe/Spiegel `:427`, S-02 `:450`,
Kette `:528`.

## Z-13 Konten/Rechte – **erfüllt** (vorher teilweise)

- **Generierte Matrix:** Unit rechte 39/39 (matrix 13, matrix-negativ 15, gruppen 9, gruppen-wahrheitstafel 2).
  Integration: `rechte-matrix.test.ts` 868 (15 Action-Dateien des Vorlaufs, Vollständigkeitsprüfung `:1143`),
  **`rechte-matrix-gemeinde.test.ts` 882** (17 Action-Dateien des Laufs × 11 Personengruppen inkl. Leitung, religiöse
  Prüfung, Kinderschutz; Spion auf `verlangeRecht`, Datenbestand unverändert bei Abweisung; Vollständigkeit `:254–258`
  „jede exportierte Action der Gemeinde-Plattform ist erfasst“ grün). Zusammen 32 von 40 Dateien in `src/server/actions`.
- **Gruppen im Repo:** `tests/hilfen/gruppen-soll.ts` (Soll nach ADR 0026, nur Typ-Import aus dem Code) gegen
  `darfInGruppe` (Unit, 420 Fälle + Mehrfachbezug) und gegen `verlangeGruppenRecht` mit Datenbank (Integration, 6 Kontoarten
  inkl. Administration × 14 Aktionen × 3 Gruppen inkl. archivierter × 3 Ziele = 756 Fälle) – beide grün.
- **S1–S3 ohne offene hoch/kritisch:** S1 (`berichte/S1-sicherheit.md`) 0 offen; Nachweise grün (H-1 `chat.test.ts:166`,
  H-2 `konten.test.ts`, M-2 `verwaltung-benutzer.test.ts`). S2/S3 (`berichte/S2-S3-sicherheit.md`): 22 Befunde, davon
  3× „hoch“ nach Gegenprüfung (S2a-5, S2a-2, S2b-2) und 8× „mittel“ – alle behoben, „Offen hoch/kritisch: 0“. Offen nur
  „niedrig“: S2b-7, S3-5, S3-6, S3-7; S3-4 teilweise (Restrisiken §4).
- **Stichprobe – 3 behobene Befunde im Code nachverfolgt, Regressionstest vorhanden und grün:**
  1. **S2a-2 (hoch) Pause der Rolle kinderschutz:** Spalte `chat_kanal.kinderschutz_pause`
     (`src/lib/db/schema/chat.ts:39`); `pausiereAlsKinderschutz` setzt sie (`src/lib/chat/dienst.ts:366–386`, `:378`);
     `setzeKanalPause` ändert nur bei `kinderschutzPause = false`, frisch in der Transaktion, sonst `keinRecht`
     (`dienst.ts:466–500`, Bedingung `:484`), Fortsetzen durch die Leitung → `planeHinweis` an kinderschutz (`:497`).
     Test `tests/integration/sicherheit-s2-chat.test.ts:163–204` (Dienst, `chat.pausiereKanal`, `lehrkraft.kanalPauseSetzen`,
     erneutes Pausieren überschreibt nicht; Hinweis-Mail nur `{art, pfad}`) – grün.
  2. **S2a-5 (hoch) D-02 nach dem Löschlauf:** `meldeNachricht` speichert `gemeldetePerson` und `gegenLeitung`
     (`dienst.ts:551–565`, Schema `chat.ts:125–126`); `fuerLeitungSichtbar` (`src/server/queries/mein-bereich/unterricht.ts:43–60`)
     filtert für Liste, Zahl, Kontext; `moderiereMeldung` arbeitet nur auf dieser Auswahl (`src/server/actions/lehrkraft.ts:102–103`).
     Test `sicherheit-s2-chat.test.ts:218–286` (Meldung gegen Lehrkraft vor und nach `chatLoeschlauf` unsichtbar, Abschluss
     → `fehler=nichtMoeglich`, Status bleibt `offen`) – grün.
  3. **S2b-3 (mittel) M-2 / Schutzrollen inkl. N4-Umgehung (A):** `src/lib/rechte/schutzrollen.ts:34` (`START_MERKER`),
     `:53–63` (`schutzrollenRegel`: nie mit Administration, nie selbst), `:73–86` (gestartet = Merker oder Leitung),
     `:115–167` (`vergibVerwaltungsrollen`: kinderschutz immer, Leitung nach Start nur als `rollen_antrag`).
     Tests `sicherheit-s2-konten.test.ts:382ff.` und `sicherheit-n4-vier-augen.test.ts:106–237` – grün. Zusätzlich
     **unabhängig:** Nachstellung des Gegenprüfers gegen main (Lauf 14): Entzug der Leitung nur beantragt
     (`entzugBeantragt: ['leitung']`), neue Leitung für das Zweitkonto nur beantragt (`zweit rollen []`), Bestätigung
     `keinRecht`, Drittkonto ohne Kinderschutz (`meldung.chat.lesen false`), Mails an Betroffene und Schutzrollen;
     Eltern-Einladung an Zweitadresse `{ ok: true, wartet: true }` ohne Mail; `elternBezugBeenden` nur
     `meldung=elternBeendenBeantragt`.
  Außerdem S2b-2 (hoch): `src/server/actions/kinder.ts:49–65` (`eigenesKonto`), `:113`, `:246`; Test
  `sicherheit-s2-konten.test.ts:271–304` grün. S3-1: `src/lib/auth/optionen.ts:67` (`storeIdentifier` mit Hash);
  `sicherheit-s3.test.ts:46` grün.
- Restbemerkungen (niedrig, kein Sicherheitsbefund): (a) Die 8 Action-Dateien des Mitgliederbereichs (`chat`, `kinder`,
  `konto`, `lehrkraft`, `mein-bereich`, `schueler`, `unterricht`, `formulare/`) stehen in keiner generierten
  Action-Matrix; ihre Bausteine (`verlangeKontoRecht`, `ladeGruppenKontext`, `darfInGruppe`) sind generiert geprüft, die
  Zuordnung je Action nur handgeschrieben (chat, s2-chat, mein-bereich-lernen, lernkette …). Darunter 4 exportierte
  Verwaltungs-Actions in `src/server/actions/chat.ts:142–180` (`bearbeiteChatMeldung`, `schalteNotfallpause`,
  `entferneAlsKinderschutzAction`, `pausiereAlsKinderschutzAction`) – geschützt durch `verlangeRecht`, aber im Code
  nirgends aufgerufen und ohne Test. (b) `src/lib/rechte/gruppen.ts:3` sagt „jede Action ruft zuerst
  `verlangeGruppenRecht`“ – tatsächlich ruft keine Action diese Funktion (`grep` nur Definition `gemeinde.ts:159`); die
  Actions setzen dieselben drei Bausteine einzeln ein.

## Z-14 Kinderschutz – **erfüllt** (vorher erfüllt; durch N4 verbessert, nichts verschlechtert)

`chat.test.ts` unverändert seit 75cad0a (`git diff --stat` leer) → alle Zeilenbelege aus `C-k2-protokoll-k2.md` für
`chat.test.ts` gelten weiter; **23/23 grün**; `chat-regeln` 22/22; `src/lib/chat/regeln.ts` unverändert.

| S | Stand 75cad0a | Änderung durch N4 (033ea6f) | Beleg heute (grün) |
|---|---|---|---|
| S-01 | Test + Code | **besser:** archivierte Gruppe schließt Kanäle, Kontext nur aktive Gruppen (S2a-1) | `sicherheit-s2-chat.test.ts:95–161`; Wahrheitstafel (archivierte Gruppe); `dienst.ts:69–77`, `rechte/gemeinde.ts:118–155` |
| S-02 | Test + Code | unverändert | `chat.test.ts:121`, `startklar.test.ts:450`, `dienst.ts:70` |
| S-03 | Test + Code | **besser:** Chat-Push an Kinder nur mit gültiger Einwilligung „Gruppenchat“ (S2a-8); D-11-Übergang (S2a-6) | `chat.test.ts:134/148/166`; `mein-bereich-lernen` 14/14; `sicherheit-s2-konten.test.ts:306`; `push/gruppe.ts` `kindDarfChat` |
| S-04 | Test + Code | unverändert | `chat.test.ts:129`, `regeln.ts:19–20` |
| S-05 | Test + Code | unverändert | `chat.test.ts:204` |
| S-06 | Test + Code | unverändert | `chat.test.ts:193`, `regeln.ts:53–54` |
| S-07 | Test + Code + Bild | unverändert (ChatFenster nur Fokus/Tokens, N2) | `chat.test.ts:232` |
| S-08 | Test + Code | **besser:** Meldung gegen die Leitung bleibt ihr verborgen, auch nach dem Löschlauf (S2a-5) | `sicherheit-s2-chat.test.ts:218–286`; `chat.test.ts:296` |
| S-09 | Test + Code | **besser:** Leitung entfernt eigene Nachrichten nicht selbst (S2a-7); Pause von kinderschutz nicht aufhebbar (S2a-2) | `sicherheit-s2-chat.test.ts:288–300`, `:163–204`; `dienst.ts:317–330`, `:466–500` |
| S-10 | Test + Code | unverändert | `chat.test.ts:273`, `startklar.test.ts:528`, `loeschen-gemeinde` 2/2 |
| S-11 | Test + Code | **besser:** Administration/Bildung macht sich nicht zu Lehrkraft/Aufsicht/Eltern (S2a-4/S2b-4); Rolle kinderschutz nur im Vier-Augen-Prinzip (S2b-3) | `sicherheit-s2-konten.test.ts:111–190`; `sicherheit-n4-vier-augen` 13/13; `verwaltung-kinderschutz` 4/4 |
| S-12 | Test (Nachrichten, offene Meldungen) + Code (erledigt + 1 Jahr) | **besser:** Löschen des Kinderzugangs entfernt Chat-Texte (S2b-6); erledigt + 1 Jahr jetzt durch Wegwerf-Test belegt | `chat.test.ts:319`; `$O/zusatz/chat-fristen.test.ts` „S-12“ (loeschenAb ≈ +365 T, Löschlauf erst danach) |
| S-13 | Test (Minute) + Code (Tag) | **besser:** Zählen und Einfügen unter `pg_advisory_xact_lock` (S2a-3); Tagesgrenze jetzt durch Wegwerf-Test belegt | `sicherheit-s2-chat.test.ts:206–216` (40 parallel → 10); `$O/zusatz/chat-fristen.test.ts` „S-13“ (200. ok, 201. `rate`); `dienst.ts:251–284` |
| S-14 | Test + Code | unverändert; neue Hinweis-Mails ohne Namen | `chat.test.ts:101`; keine Treffer presence/online/typing; `centrifugo.json` Namensraum `chat` mit `presence: false`, `join_leave: false` |
| S-15 | Test + Code | unverändert | `chat.test.ts:187` |
| S-16 | Test + Code | unverändert; Hinweis-Mail `kanal_fortgesetzt` nur `{art, pfad}` | `chat.test.ts:109`; `sicherheit-s2-chat.test.ts:198–203`; `centrifugo.ts:35–47` (`{ neu: true }`) |
| S-17 | Test + Code | **besser:** Pause durch kinderschutz eigens vermerkt; in der Notfall-Pause Chat-Push nur an die Leitung | `chat.test.ts:263`; `verwaltung-kinderschutz` 4/4; `push/gruppe.ts` (`nurLeitung`) |
| S-18 | Test + Code | unverändert; zusätzlich Schalter `konten` wirkt auf Chat-Actions (S3-3) | `gemeinde-konten.test.ts:77–97` (13/13); `actions/chat.ts:44–45` |

Weiter offen (kein Kriterium, Docker-E2E): E2E „zwei Browser + Melden“ fehlt; `mein-bereich-lernen.spec.ts:143–` prüft
nur Senden mit einem Browser. Restrisiko laut S2-S3 §4.4: entfernte Texte werden für kinderschutz nicht aufbewahrt.

## Z-20 Betrieb – **teilweise** (vorher teilweise)

- **Centrifugo-Namensraum – behoben:** `betrieb/lokal/echtzeit/centrifugo.json:11–31` Namensraum `chat` (Trenner Standard
  „:“), alle `allow_*` false, `presence/join_leave/history` aus, `without_namespace` ohne Abo/Veröffentlichen; App
  `web/src/lib/echtzeit/centrifugo.ts:20` `chat:<id>`. Unit `echtzeit.test.ts:49–89` liest die Datei und prüft gegen
  `kanalName` – grün. `centrifugo checkconfig` rc=0; `checksubtoken` bestätigt das Abo-Token der App für `chat:kanal-9`
  mit dem HMAC-Schlüssel, den Compose als `CENTRIFUGO_CLIENT_TOKEN_HMAC_SECRET_KEY` übergibt
  (`docker-compose.yml:72`). Ein laufender Centrifugo (`echtzeit/pruefen.mjs`, 7 Prüfungen) wurde nicht gestartet –
  UMGEBUNGSAUSNAHME „Centrifugo ohne öffentliche Adresse“, Ersatz wie hier.
- **docker compose config:** beide Profile rc=0; je Dienst nur eigene Werte (caddy nur `ECHTZEIT_DOMAIN`, centrifugo nur
  `CENTRIFUGO_*`, sicherung ohne SMTP/Blob) – S3-4 bestätigt; `WARTUNG_TOKEN` per Standardeingabe (`sicherung/melden.sh:4`,
  `takt/takt.sh:8`).
- **sichern.sh (gelesen, `betrieb/lokal/sicherung/sichern.sh:1–61`):** `set -eu`; Kette pg_dump → gzip → age mit
  Statusdateien je Schritt (`:30–42`), fehlende Statusdatei zählt als Fehler; Mindestgröße 4096 (`:44`) und age-Kopf
  (`:45`); erst danach `mv` aus `.teil` und `sha256sum` (`:47–48`); Rotation nur über die N neuesten gültigen Dateien
  (`:51–53`); auffällig klein (< ½ der vorigen) → Datei bleibt, Meldung „fehler“ (`:55–59`); `fehler()` löscht `.teil`,
  meldet und endet mit 0 (`:21–26`). `session`, `verification`, `ratenbegrenzung`, `rate_limit` nur als Struktur
  (`:32–33`). Logik durch Simulation (Lauf 11), echten age/gzip-Rundlauf (Lauf 12) und Unit `betrieb-sicherung` 5/5 belegt.
  Kein Fehler in der Logik gefunden.
- **Produktionsschalter sicher:** `funktionen.test.ts` 5/5 (`IN_PRODUKTION_AN = ['hadith_gesamt']`,
  `src/lib/funktionen-regeln.ts:26`); startklar Produktion „[OK] Funktionsschalter – Alle Funktionen mit Personendaten sind
  aus“; live @ 033ea6f alles aus (Lauf 15).
- **Lücke (unverändert):** Der Wiederherstellungstest `betrieb/lokal/sicherung/probe.sh` (Abzug in eine Wegwerf-Postgres
  einspielen, > 50 Tabellen) ist weiterhin **nie ausgeführt** – kein Docker-Daemon (`/var/run/docker.sock` fehlt), einen
  Postgres-Server zu starten ist dem Prüfer untersagt. Ersatz: Logik gelesen (`probe.sh:9–29`), Entschlüsseln/Entpacken
  mit echtem age belegt (Lauf 12), Cockpit-Auswertung der Probe-Meldung getestet (`startklar.test.ts:427`). Die
  Umgebungsausnahmen des AUFTRAG (§7) nennen nur Docker-E2E, nicht den Wiederherstellungstest → offen statt erfüllt.

## Nebenbefunde
- N4 hat nach dem N3-Stand rc=0 neue Verwaltungs-Mailtexte eingeführt, ohne die Wortlaut-Ausnahmen nachzuziehen
  (S2-S3-Bericht §5 nennt keinen Wortlaut-Lauf) → Ursache des rc=2 in Z-12.
- `bearbeiteChatMeldung` u. a. in `actions/chat.ts:142–180` sind ungenutzt (siehe Z-13 Restbemerkung a).
