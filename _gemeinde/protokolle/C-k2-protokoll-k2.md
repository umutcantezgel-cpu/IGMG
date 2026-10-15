# Stufe C – Prüfer k2 (Z-12, Z-13, Z-14, Z-15, Z-17, Z-18, Z-20)

- Prüfling: `origin/main` = **75cad0a** (Branch `claude/trusting-lovelace-6nfolz`, HEAD 0a008e1 – weicht von 75cad0a nur in
  `_gemeinde/.gitignore` und `_gemeinde/PRUEFPUNKT.md` ab, `git diff --stat 75cad0a HEAD`). Live-Produktion
  `igmg-wetzlar.vercel.app` = 75cad0a (GitHub-Deployments-API: „75cad0a Production – igmg-wetzlar 2026-10-14T18:48:09Z“).
- Repository unverändert (`git status --short` leer nach allen Läufen). Node 24.21.0 (`scratchpad/node24`), pnpm 12.11.2.
- Alle Ausgaben unter `O=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k2/`.
- Kein Server gestartet oder beendet. Der laufende Vorschau-Server 3100 (BAU_PGLITE, `.pglite-bau`) wurde nicht berührt;
  für `startklar` diente eine Kopie der Bau-Datenbank (danach gelöscht).

## Gelaufene Prüfungen (Befehl → Ergebnis → Protokoll)

| # | Befehl | Ergebnis | Datei |
|---|---|---|---|
| 1 | `pnpm exec vitest run --project unit` (voll) | 1437 grün + 3 erwartet fehlgeschlagen, 1 rot: `speicher-probe.test.ts` Zeitüberschreitung unter Last; einzeln wiederholt grün | `$O/unit-voll.log`, `$O/unit-voll.json`, `$O/unit-speicherprobe-einzeln.log` |
| 2 | `vitest run --project integration` mit 26 gezielten Dateien (Rechte, Chat, Kinderschutz, Konten, Lernen, CMS, Anzeige, Koran/Hadith/Elifbe, Startklar, Wartung) | **26/26 Dateien, 1207 grün + 2 erwartet fehlgeschlagen** (BEFUND-Fälle Tickets: Action strenger als Matrix), 301 s | `$O/integration-gezielt.log`, `.json` |
| 3 | Wegwerf-Integrationstest Lernkette (eigene Vitest-Konfiguration außerhalb des Repos, echtes Better Auth, eine PGlite-DB) | **7/7 grün** | `$O/kette/lernkette.test.ts`, `$O/vitest.kette.mts`, `$O/lernkette.log` |
| 4 | Eigene Wahrheitstafel `darfInGruppe` (5 Kontoarten × 14 Aktionen × 2 Gruppen × 3 Ziele) | 420 Fälle, **0 Verstöße** gegen ADR 0026 | `$O/skripte/gruppen-tafel.ts`, `$O/gruppen-tafel.txt` |
| 5 | `node _gemeinde/werkzeuge/wortlaut.mjs --basis b702c7c --stand 75cad0a --protokoll $O/wortlaut-b702c7c-75cad0a` | **rc=2**, 235 offene Einheiten „hoch“ (Auswertung unten) | `$O/wortlaut-b702c7c-75cad0a.{md,json}`, `$O/wortlaut.log` |
| 6 | `node _gemeinde/werkzeuge/religion-pruefung.mjs` | **rc=0**, „grün: 5280 Dateien“ | `$O/religion-pruefung.txt` |
| 7 | `SITE_MODE=produktion pnpm startklar --betriebsart produktion --pglite <Kopie .pglite-bau>` | rc=1 (15 Fehler = fehlende Umgebungswerte/Platzhalter); **Funktionsschalter OK**, Kette OK | `$O/startklar-produktion.txt` |
| 8 | `docker compose config --quiet` und `--profile echtzeit config` auf Kopie von `betrieb/lokal` mit `.env` = `.env.beispiel` | **rc=0 / rc=0**, 6 Dienste | `$O/kit-compose-config.txt` |
| 9 | `sh -n`, `dash -n`, `bash -n` für 6 Kit-Skripte; `node --check spiegel.mjs`; JSON von `centrifugo.json` | alle Syntax ok | (Ausgabe in diesem Protokoll) |
| 10 | Freigabestand der Bau-DB-Kopie (alle Spalten vom Typ `freigabe_status`, `quran_ausgabe`) | nur `tajwid_regel` 18× `entwurf`, sonst leer; 3 Ausgaben `aktiv=false`, `freigegeben_am=null` | `$O/freigabe-stand-baudb.txt` |
| 11 | Live: curl auf Konto-/Chat-/Push-/Kür-Adressen und `/quran/1` | Konto-Seiten „nicht gefunden“ + noindex ohne Formular, Chat-API 404, Push-POST 404, Hatim/Newsletter 404; `/quran/1` ohne Übersetzungstext | `$O/live-schalter.txt`, `$O/live-quran-1.html` |

## Z-12 Recht/Startklar – **teilweise**

**Wortlaut** (`wortlaut.mjs`, Basis b702c7c = Laufbeginn, Stand 75cad0a): Rechtsbezogene Einträge 1853; gleich 711,
geändert 7, neu 1135, entfernt 0, verschoben 0; Ausnahmen greifen für 390 Einheiten; **235 offen „hoch“ → rc=2**.
- In Dateien, die es schon bei der Basis gab: 711 gleich, 7 geändert, 31 neu, 0 entfernt. Die 7 Änderungen sind
  Tabellenschreibweise (G-02) bzw. Pfad-/Formatänderungen im Hosting-Baustein v2 (A-01); die **eine offene Änderung** ist
  `web/docs/recht/VERARBEITUNGSVERZEICHNIS.md` (Abschnitt Mailanbieter): Wortdiff nur `|---|---|` → `| --- | --- |` und
  `` `_werkstatt/MENSCHEN.md` `` → `` `_archiv/lauf-gestaltung-2026-10/MENSCHEN.md` `` (Commits 58a3344, 9280fb3).
  Kein Bestandsrechtstext wurde inhaltlich geändert oder entfernt.
- 234 offene „neu“: neue Hinweistexte neuer Verwaltungsmodule, die einen Rechtsbegriff enthalten (z. B.
  `messages/verwaltung/lernen.json` 55, `seiten.json` 48, `anzeige.json` 26, `koran.json` 20, `rezitationen.json` 18,
  `menues.json` 12, …; dazu `de/en/tr.json` `start.fasten.vorschauHinweis`, `src/lib/konto/loeschen.ts` „Konto gelöscht“).
  Die Ausnahmen G-01…G-05 (Commit 23f3a96, Stand Tor E2 „0 offen“) decken diese nach dem Tor hinzugekommenen Dateien nicht ab.
  Inhaltlich sind es keine Änderungen an Rechtstexten; formal ist das Werkzeug aber **rot**, bis der Orchestrator
  Ausnahmen mit Grund nachträgt (Repo-Änderung, nicht Aufgabe des Prüfers).

**Neue Rechtstexte als Entwurf:** alle 8 Dateien in `web/docs/recht/entwuerfe/` tragen in Zeile 3
„> **ENTWURF – vor Veröffentlichung durch Datenschutz/Recht prüfen (MENSCHEN MN-11)**“ (datenschutz-v2-bausteine,
dsfa-lernplattform, einwilligungen, loeschkonzept, nutzungsbedingungen-konten, schutzkonzept-geruest,
verarbeitungsverzeichnis-ergaenzung, vereinbarung-rezitation); `web/docs/recht/datenschutz-hosting-v2.md:5` „Entwurf zur
fachlichen Prüfung. Nicht veröffentlicht.“; Wortlaut-Werkzeug: `v2_eingespielt: 0` von 23 Absätzen.

**Cockpit-Prüfungen** (`src/lib/startklar/gemeinde.ts`, dieselben Prüfungen wie `/verwaltung/startklar`):
- `pnpm startklar` Produktion (Kopie Bau-DB): Gemeinde-Plattform „[OK] Funktionsschalter – Alle Funktionen mit
  Personendaten sind aus“, „[OK] Moderationsprotokoll unverändert (0 Einträge)“, „[WARNUNG] Tägliche Sicherung /
  Wiederherstellungsprobe / Medienspiegel – lokaler Server hat sich noch nie gemeldet“, „[OK] Koran-Übersetzungen aktuell“.
  Die 15 Fehler sind Umgebungswerte (APP_URL, Geheimnisse, SMTP …), Konzept-Hinweis und Platzhalter in Impressum/Datenschutz –
  Menschenaufgaben laut MENSCHEN.
- Takt erscheint nur mit `push`+`push_gebet` (gemeinde.ts:198–206); belegt in `tests/integration/startklar.test.ts:412–448`
  (Takt fehlt → Warnung, nach 15 min alt). Kette: `startklar.test.ts:465` (eingeschobene Zeile → Fehler). Schalter:
  `:392`, `:405`, `:412` (manueller Punkt mit Voraussetzungen = Freigabe durch Menschen). Integration startklar 34/34,
  startklar-aktion 24/24 grün.
- Lücke „Freigaben“: Das Cockpit prüft die Freigabe der Schalter durch Menschen (manueller Punkt), aber **keinen Stau offener
  religiöser Freigaben** (kein Treffer für `zur_pruefung`/`freigabe` in `src/lib/startklar/`).

## Z-13 Konten/Rechte – **teilweise**

- Unit `tests/unit/rechte/*`: 37/37 grün (matrix 13, matrix-negativ 15, gruppen 9). Generiert:
  `matrix-negativ.test.ts:30–48` (jede Rolle × jede nicht erlaubte Aktion × 2 Zuweisungen × 3 Ziele → `darf()` false),
  `matrix.test.ts:5–14` Admin-Ausschluss (`NIE_PER_ADMINISTRATION`, `src/lib/rechte/matrix.ts:124–128`, `:142`).
- Gruppen: `gruppen.test.ts:26–68` generiert über alle `GRUPPEN_AKTIONEN` nur für „fremd“, „fremde Gruppe“ und „Lehrkraft“;
  Schüler/Eltern/Aufsicht nur Stichproben (Schüler 5, Eltern 6, Aufsicht 4 von 14 Aktionen). **Ersatz durch eigene
  Wahrheitstafel** (`$O/gruppen-tafel.txt`): 420 Fälle, 0 Verstöße (Schüler nur eigene Daten, Eltern nur ihr Kind und
  Elternkanal, Aufsicht ohne Fortschritt, keine Rechte in fremden Gruppen).
- Integration `tests/integration/verwaltung/rechte-matrix.test.ts`: 859 Fälle grün (2 `it.fails` „BEFUND“: Tickets der
  Organisationsredaktion – Action strenger als Matrix, kein Leck). **Lücke:** Die generierte Action-Matrix deckt nur die 14
  Action-Dateien des Vorlaufs ab (`datei:`-Einträge); die 17 neuen Verwaltungs-Actions (anzeige, besondere-tage,
  einstellungen-spenden, freigaben, gemeinde-konten, gruppen, hatim, kinderschutz, koran, lehrplan, lernende, menues,
  newsletter, rezitationen, seiten, tagesvers, weiterleitungen) haben nur handgeschriebene Negativtests (alle grün, z. B.
  `verwaltung-lernen.test.ts:264`, `gemeinde-konten.test.ts:309`, `verwaltung-cms.test.ts:63/346/394`,
  `verwaltung-kinderschutz.test.ts:30`, `newsletter-anmeldung.test.ts:131`).
- S1 (`_gemeinde/berichte/S1-sicherheit.md`): 2 hoch, 0 kritisch → „Urteil nach Behebung: keine offenen Befunde hoch oder
  kritisch“. Nachweistests heute grün: H-1 `chat.test.ts:166`, H-2 `konten.test.ts:160`, M-2 `verwaltung-benutzer.test.ts:157`,
  M-4 `tests/unit/push.test.ts:96`, N-6 `loeschen-gemeinde.test.ts`; Code M-1 (`ladeKontoMitFaktor` in
  `api/mein/chat/[kanal]/route.ts:17`, `api/mein/echtzeit/route.ts:18`, `api/push/abo/route.ts:56`), M-3
  (`src/server/actions/konto.ts:232–236`).
- **S2 und S3 gab es nicht**: `_gemeinde/berichte/` enthält nur S1; `git log b702c7c..75cad0a` (308 Commits) nennt nur S1
  (4676a74). S1 prüfte Stand 6b58403; danach ohne Sicherheitsprüfung: Anzeige-CMS mit `/api/anzeige`, Vers/Hadith des Tages,
  Sicherheitsmail Passkey/2FA, D-14…D-17 (Migration 0012), Befundpakete der Sichtabnahme, Vercel-Import (Start ohne APP_URL).
  → „0 offene hohe/kritische aus S1–S3“ ist für S1 belegt, für S2/S3 **offen**.
- Offener S1-Hinweis (funktional, kein Sicherheitsbefund): Centrifugo-Namensraum `chat` fehlt (siehe Z-20).

## Z-14 Kinderschutz – **erfüllt** (jede Maßnahme mit Test oder Beleg)

| S | Maßnahme | Test (alle grün in diesem Lauf) | Code-/Bildbeleg |
|---|---|---|---|
| S-01 | nur Gruppen-/Elternkanal, keine DM, keine eigenen Gruppen | `chat.test.ts:85`, `:91`; `lernen-ansicht.test.ts` „Kanäle (S-01)“ | `src/lib/db/schema/chat.ts:10` (Enum nur `gruppe`/`eltern`), `:17–24` (Kanal gehört zu genau einer Gruppe, eindeutig je Art); Gruppen anlegen nur `gruppe.bearbeiten` = Bildung/Administration (`matrix.ts:206–207`, `actions/gruppen.ts:44`) |
| S-02 | ≥ 2 Erwachsene | `chat.test.ts:121`; `chat-regeln.test.ts:61–76` (zuWenigeErwachsene); `verwaltung-lernen.test.ts:121`; `startklar.test.ts:450` | `src/lib/chat/regeln.ts:17–18`; `dienst.ts:63` (gesperrte zählen nicht, N-3) |
| S-03 | unter 16 nur mit Elterneinwilligung, Widerruf sofort | `chat.test.ts:134`, `:148` (D-11), `:166` (H-1); `mein-bereich-lernen.test.ts:213`, `:250`; `sechzehn.test.ts` | `regeln.ts:124` (`leseGrund` vor allen anderen Gründen), `dienst.ts:189–194` |
| S-04 | Mindestalter 10, keine Kindergartengruppen | `chat.test.ts:129`; `chat-regeln.test.ts:78`; `lernen-verwaltung.test.ts:189–195` (9 → Fehler); `verwaltung-lernen.test.ts:79` | `regeln.ts:19–20`; `src/lib/validierung/lernen.ts:37–41` (`min(10)`) |
| S-05 | nur Text ≤ 500, keine Bilder/Dateien, Links nur Text | `chat.test.ts:204`, `:92`+`:103` (URL kommt als reiner Text zurück); `chat-regeln.test.ts:29` | Schema `chat.ts:28–42` (nur `textVerschluesselt`, keine Anhänge); Action nur `string` (`actions/chat.ts:49–53`); Anzeige als Text in `<p>` ohne Verlinkung (`components/chat/ChatFenster.tsx:308–315`) |
| S-06 | 08–20 Uhr, sonst nur lesen | `chat.test.ts:193`; `chat-regeln.test.ts:36`; `lernen-verwaltung.test.ts:196–197` (07:00/21:00 → Fehler) | `regeln.ts:53–54`; `validierung/lernen.ts:47` (`chatFensterGueltig`) |
| S-07 | Melden in zwei Schritten, Hilfehinweis | `chat.test.ts:232` (Melden, Kontext) | `ChatFenster.tsx:297–305` (Schritt 1 „Melden“), `:397–500` (Schritt 2 Dialog mit Grund, Freitext, „Meldung senden“), `:496`/`:547–556` (Hilfe 116 111); Bild `scratchpad/sicht3/bilder/gruppenchat-melden-390-oben.png` (Sichtabnahme R3: 8) |
| S-08 | an Lehrkräfte + `kinderschutz`, Mail ohne Inhalt | `chat.test.ts:296` (Empfänger ohne gemeldete Person, D-02); `verwaltung-kinderschutz.test.ts:52` (Liste ohne Inhalte) | `src/server/actions/chat.ts:91–103` (Mail-Daten nur `art`+`pfad`), `src/lib/mail/ausgang.ts:156–166` (Text nur aus Vorlage), `messages/de.json:516` |
| S-09 | Entfernen, Stumm, Pause, Mitglied entfernen – mit Grund | `chat.test.ts:222`, `:256`, `:296`, `:311`; `mein-bereich-lernen.test.ts:440`, `:467`; `verwaltung-kinderschutz.test.ts:66` | `dienst.ts:301`, `:371`, `:407`, `:444`; `actions/chat.ts:110` (Grund 3–300) |
| S-10 | Hash-Kette, unveränderlich | `chat.test.ts:273` (UPDATE/DELETE scheitern, Kette intakt); `chat-regeln.test.ts:94–125`; `startklar.test.ts:465`; `loeschen-gemeinde.test.ts` (Anker) | `src/lib/chat/hashkette.ts`; `dienst.ts:277` |
| S-11 | Admin liest keine Chats; Kinderschutz nur ±10 mit Audit | `chat.test.ts:114`, `:244`; `verwaltung-kinderschutz.test.ts:30`, `:47`, `:52`; `matrix.test.ts:5–14`; `verwaltung-benutzer.test.ts:157` (M-2) | `matrix.ts:124–128`; `regeln.ts:15–16` (`MELDUNG_KONTEXT = 10`) |
| S-12 | Nachrichten 90 T / 30 T nach Ende; Meldungen 1 Jahr | `chat.test.ts:319` (Nachrichten); `loeschen-gemeinde.test.ts:71–96` (offene Meldungen nach 12 Monaten); `wartung-cron.test.ts:83–84` | `regeln.ts:11–14`; `dienst.ts:615` (erledigt → `now() + 365 days`), `:650–680` (Löschlauf). Erledigt+1 Jahr nur Codebeleg |
| S-13 | 10/Minute, 200/Tag | `chat.test.ts:209` (11. Nachricht → `rate`) | `regeln.ts:8–10`; `dienst.ts:243–256` (Tagesgrenze nur Codebeleg) |
| S-14 | keine Lesebestätigung/Online-Anzeige; Vorname + Initial | `chat.test.ts:101` (kein Feld `gelesen`, „Ali K.“); `chat-regeln.test.ts:50`; `konto-regeln.test.ts` „(S-14)“ | `dienst.ts:186`; keine Treffer für presence/online/typing in `components/chat`, `lib/chat`, `lib/echtzeit`; `centrifugo.json` ohne Presence |
| S-15 | kindgerechte Regeln bestätigen | `chat.test.ts:187`; `chat-regeln.test.ts` (regelnFehlen) | `regeln.ts:21–22` (Version), `ChatFenster.tsx:53–56`, `:543` |
| S-16 | verschlüsselt, nie in Push/Mail/Logs | `chat.test.ts:109`; `mein-bereich-lernen.test.ts:487` (Push-Nutzlast nur `art/pfad/sprache`, keine Namen) | `actions/chat.ts:57` + `src/lib/echtzeit/centrifugo.ts:34–37` (Signal `{neu:true}`), Mail S-08, Audit nur IDs (`actions/chat.ts:105`, `:144`, `:152`) |
| S-17 | Notfall-Pause | `chat.test.ts:263`; `verwaltung-kinderschutz.test.ts:30`, `:66` | `dienst.ts:88`, `:629` |
| S-18 | Sperren beendet alle Sitzungen | `gemeinde-konten.test.ts:77–97` (3 Sitzungen → 0, Reset-Links weg); `verwaltung-benutzer.test.ts` „Sperren: Sitzungen enden“ | `src/server/actions/gemeinde-konten.ts:91–100`, `src/lib/konto/loeschen.ts:144` |

Lücke (kein Kriterium): Die im AUFTRAG §6 genannte E2E „Chat und Push: zwei Browser-Kontexte + Melden“ existiert nicht
(`grep` in `tests/e2e` ohne Chat-Spec).

## Z-15 Religiöse Inhalte – **erfüllt**

- SHA: `tests/unit/quran-daten.test.ts:21–25` grün; unabhängig `sha256sum web/daten/tanzil/quran-uthmani.xml` =
  `5ea5cbab…468a` = `web/daten/tanzil/QUELLE.md:21`; `grep -c "<aya "` = 6236.
- Rundreise: `quran-daten.test.ts:40–48` (alle 6236 Verse verlustfrei, 77433 Wörter) grün; Tajwid-Bereiche `:50`, Übersetzungen
  6236 `:77`; `quran-tanzil.test.ts` 8/8.
- Freigabe-Logik (nur „geprueft“ öffentlich): `religioese-freigabe.test.ts` 15/15 (Rücksetzen bei Änderung `:24`, Vier-Augen
  `:51`); Integration grün: `verwaltung-koran.test.ts` 18 (`:138` Entwurf nicht öffentlich, `:171` erst nach zweiter Person,
  `:223`, `:261`, `:300`), `quran.test.ts:163/172/191`, `hadith.test.ts:112`, `elifbe.test.ts:88`,
  `verwaltung-besondere-tage.test.ts:92/117/133`, `verwaltung-anzeige.test.ts:144–188`, `verwaltung-cms.test.ts:200–291`.
  Öffentliche Lader filtern `freigabe = 'geprueft'`: `server/queries/quran.ts:337/350`, `hadith.ts:97/136`,
  `elifbe.ts:104`, `kalender.ts:39`, `anzeige.ts:50`, `bloecke.ts:98`, `religioese-verweise.ts:112`.
- Datenstand (Kopie Bau-DB): `tajwid_regel` 18× `entwurf`, alle übrigen Freigabe-Tabellen leer; `quran_ausgabe` 3 Ausgaben
  `aktiv=false`, `freigegeben_am=null`. Live `/quran/1`: kein Übersetzungstext (0 Treffer „Allerbarmer“, keine Übersetzernamen),
  nur Hinweis „Für diese Sprache ist noch keine Übersetzung freigegeben“.
- `religion-pruefung.mjs`: rc=0, „grün: 5280 Dateien“.

## Z-17 Lernplattform – **AUSNAHME (Docker-E2E) mit Ersatzbeleg**

- E2E: Es gibt keine durchgehende Lernketten-Spec; nur Teilstücke: `tests/e2e/formular-voranmeldung.spec.ts` (Mailpit),
  `verwaltung-lernen.spec.ts`, `mein-bereich-lernen.spec.ts` (Anwesenheit, Eltern-Abmeldung). Alle brauchen eine eigene
  E2E-Datenbank (`pnpm verwaltung:einladen` bzw. Beispielkonten) → Docker-E2E; im Lauf nie ausgeführt
  (`scratchpad/e2e-tor.log` enthält nur öffentliche Specs, 684 grün).
- **Ersatz 1 (neu, dieser Prüfer):** `$O/kette/lernkette.test.ts` – ein Ablauf auf einer DB mit echtem Better Auth, nur über
  die Server Actions/Abfragen der Oberflächen: 1 Voranmeldung (öffentliches Formular, ALTCHA, verschlüsselt) → 2 Bildung legt
  Gruppe/Leitung/Termine an und nimmt auf (Einladung) → 3 Eltern nehmen die Einladung an (Token aus der Mail, `eltern_kind`
  bestätigt) → 4 Einwilligung „Kinderzugang“, Zugang angelegt, Kind meldet sich per Benutzername an → 5 Kind sieht seine
  Gruppe, Lehrkraft sieht das Kind → 6 Eltern melden morgen ab (vorbelegt „entschuldigt“), Lehrkraft erfasst heute
  „anwesend“, Eltern dürfen nicht erfassen, Eltern und Kind sehen die Anwesenheit → 7 Lehrkraft setzt Fortschritt „sicher“,
  Eltern dürfen nicht, Eltern und Kind sehen die Stufe. **7/7 grün** (`$O/lernkette.log`).
- Ersatz 2 (Repo-Integration, grün): `formular-voranmeldung.test.ts:101`, `verwaltung-aufnahme.test.ts:109/161`,
  `verwaltung-lernen.test.ts:79/121/154/176`, `mein-bereich-lernen.test.ts:213/284`, `lernen.test.ts:94/126/143`.
- Ersatz 3 (Bild): Sichtabnahme R2 mit Beispielkonten: schueler-start 8, eltern-kind 8, anwesenheit 8
  (`_gemeinde/berichte/sichtabnahme-2.md:21–23`; `scratchpad/sicht2/bilder/anwesenheit-390.png`, `eltern-kind-390.png`).

## Z-18 CMS – **AUSNAHME (Docker-E2E) mit Ersatzbeleg**

- Integration `verwaltung-cms.test.ts` 16/16: Rechte `:63`, Revision `:71` (letzte 30) und Wiederherstellen `:91`,
  Veröffentlichen je Sprache `:104`, Entwurf nicht öffentlich `:124`, **Zeitplan** `:136`, Organisationsredaktion `:159`,
  signierte Vorschau `:182`, **Freigaben** redaktionell/religiös `:200–291`, **Weiterleitung** `:317/:346`, **Menüs** `:353/:394`.
- `verwaltung-anzeige.test.ts` 10/10: **Anzeige-Folie** anlegen/sichtbar `:110`, Vers-/Hadith-Folie Vier-Augen `:147/:174/:188`,
  Reihenfolge `:214`, Iqama-Einstellung `:231`, Beispielmodus `:259`, Vers des Tages `:282`. Unit: `cms-adressen` 15,
  `cms-bloecke` 17, `anzeige-folien` 19, `anzeige-plan` 5.
- „Ohne Entwickler“: Oberflächen vorhanden – `verwaltung/(geschuetzt)/seiten/{page,neu,[id],[id]/revisionen}`, `menues`,
  `weiterleitungen`, `freigaben/{page,seite/[id]}`, `anzeige/{page,neu,[id],einstellungen}`; Modul-Registrierung
  `components/verwaltung/shell/module.ts:17–21, 46, 109`. Sichtabnahme R3: seiten-editor 8, seiten-editor-bestand 8.
- E2E `tests/e2e/cms.spec.ts:22` (Seite → öffentlich, Menü, Weiterleitung) und `verwaltung-anzeige.spec.ts:21/65` existieren,
  brauchen aber `angemeldetesKonto` → `pnpm verwaltung:einladen` gegen eine eigene DB (`tests/e2e/hilfen/einladung.ts:5–10`);
  gegen den laufenden PGlite-Server nicht möglich (ein Prozess je DB; Bau-DB hat 0 Konten) → nicht ausgeführt.

## Z-20 Betrieb – **teilweise**

- Produktionsschalter sicher: `tests/unit/funktionen.test.ts` 5/5 (Produktion ohne Angaben alles aus außer
  `IN_PRODUKTION_AN = ['hadith_gesamt']`, Nutzerentscheidung 13.10.); `startklar` Produktion „[OK] Funktionsschalter“;
  `startklar.test.ts:392`; `vercel-import.test.ts` 7/7; live: `/anmelden`, `/registrieren`, `/mein-bereich` zeigen
  „nicht gefunden“ + noindex ohne Formular, `/api/mein/chat/…` 404, `POST /api/push/abo` 404, `/hatim`, `/newsletter` 404.
- Kit: `docker compose config` beide Profile rc=0 (mit `.env.beispiel` als `.env`, in einer Kopie); Syntax aller Skripte ok.
- **Befund (funktional, mittel):** `betrieb/lokal/echtzeit/centrifugo.json` definiert nur `channel.without_namespace`, die App
  nutzt aber Kanäle `chat:<id>` (`web/src/lib/echtzeit/centrifugo.ts:21`; `tests/unit/echtzeit.test.ts` erwartet
  `channel: 'chat:kanal-9'`). Centrifugo v6.5.1 (`betrieb/lokal/docker-compose.yml:47`) weist Kanäle eines nicht konfigurierten
  Namensraums ab („unknown channel“) → Echtzeit-Signal des Kits wirkt nicht; der Abruf bleibt (Fallback). Schon in S1
  („Hinweise für kommende Pakete“) gemeldet, nicht behoben. Nicht durch eine Umgebungsausnahme gedeckt (Konfigurationsfehler).
  Nicht mit laufendem Centrifugo verifiziert (kein Docker-Daemon) – Einstufung aus Konfiguration und Centrifugo-Namensraumregel.
- Wiederherstellungstest (`betrieb/lokal/sicherung/probe.sh`): **nicht ausführbar** – kein Docker-Daemon
  (`/var/run/docker.sock` fehlt), Postgres-Server starten ist dem Prüfer untersagt. Ersatz: Syntax ok, Ablauf gelesen
  (Prüfsumme, age-Kopf, Einspielen in Wegwerf-DB, > 50 Tabellen), Auswertung der Meldungen im Cockpit getestet
  (`startklar.test.ts:427`). ABNAHME nennt als Ausnahme nur Docker-E2E → hier **offen** (Umgebung) statt erfüllt.

## Nebenbefunde
- `tests/unit/speicher-probe.test.ts` läuft in der Gesamtsuite gelegentlich über 10 s (bekannt aus Tor E2), einzeln grün.
- S1-Hinweis `eltern_kind` ohne Filter auf `bestaetigtAm`: heute einziger Schreibweg `src/lib/konto/einladung.ts:41–42`
  setzt `bestaetigtAm` → kein Leck.
