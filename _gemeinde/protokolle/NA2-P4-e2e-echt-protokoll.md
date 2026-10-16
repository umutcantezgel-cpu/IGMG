# P4 – Echte E2E ohne Docker und Wiederherstellungsprobe (Z-16, Z-17, Z-18, Z-20, Z-07)

Stand: 16.10.2026, Abschluss `e02121c` (maßgeblich: Lauf 3 und Abschnitt 4). Arbeitsbaum `/home/user/IGMG/.claude/worktrees/agent-a360d92e270ea9f2f`,
Branch `worktree-agent-a360d92e270ea9f2f`, Ausgang `2c11368` (FF auf `claude/trusting-lovelace-6nfolz`).
Alle Pfade unten relativ zu `E=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/e2e-echt`.

## 1 Umgebung

| Teil | Version / Ort |
|---|---|
| Node | v24.21.0 (`scratchpad/node24`), pnpm 12.11.2 |
| PostgreSQL | 16.15 (Ubuntu), Cluster `/var/lib/postgresql/igmg-e2e-echt/pgdata` (Verweis `$E/pgdata`), 127.0.0.1:5432, Rolle `igmg`/`igmg-lokal` (SUPERUSER wie `POSTGRES_USER` im Image), Datenbank `igmg`; Log `$E/pglog/postgres.log` |
| Mailpit | v1.27.11 (`scratchpad/mailpit/mailpit`), SMTP 127.0.0.1:1025, HTTP 127.0.0.1:8025, `MP_SMTP_AUTH_ACCEPT_ANY=1`, `MP_SMTP_AUTH_ALLOW_INSECURE=1`, Datenbank `$E/mailpit/mailpit.db` |
| Playwright | 1.64.0; erwartet Chromium-Revision 1248, vorhanden ist 1194 (Chromium 141.0.7390.37) unter `/opt/pw-browsers` → Ordner `$E/pw-browsers` mit Verweisen unter den erwarteten Namen, `PLAYWRIGHT_BROWSERS_PATH=$E/pw-browsers` |
| axe | @axe-core/playwright 4.13.0 |
| age | 1.1.1 (`/usr/bin/age`, `age-keygen`) |
| Next.js | 16.4.0, `output: 'standalone'`, Bau `pnpm build` gegen `igmg` (2 min 56 s bzw. 3 min 25 s) |

**Befehle zum Wiederholen**

```sh
E=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/e2e-echt
$E/start.sh            # PostgreSQL + Mailpit (idempotent; PID-Dateien in $E/pids); $E/stop.sh beendet nur diese
cd <arbeitsbaum>/web && export PATH=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/node24/bin:$PATH
pnpm db:migrate && pnpm db:seed && pnpm inhalte:import && pnpm build
PLAYWRIGHT_BROWSERS_PATH=$E/pw-browsers pnpm test:e2e      # legt igmg_e2e frisch an, Server auf 3100
```

- `web/.env` aus `.env.example`, Geheimnisse frisch mit `pnpm geheimnisse:erzeugen` (Werte nur in `$E/geheim.txt`,
  Modus 600; `.env` ist in git ignoriert). Abweichend von der Vorlage: `APP_URL`/`BETTER_AUTH_URL` `http://localhost:3100`,
  `MEDIEN_VERZEICHNIS=$E/medien` und `FUNKTION_KONTEN|LERNPLATTFORM|CHAT|HATIM|NEWSLETTER=an` (der E2E-Bau läuft als
  Produktion, ADR 0035; Echtzeit und Push bleiben aus – kein Centrifugo, kein VAPID).
- **Umgebungsbefund 1 – Datenordner:** `/tmp/claude-0` hat Modus 700 und wird vom Werkzeug zurückgesetzt (`chmod o+x` hielt
  nur Minuten; danach PANIC „could not open pg_control: Permission denied“). Der Cluster liegt deshalb unter
  `/var/lib/postgresql`, `$E/pgdata` ist ein Verweis. Meine kurzzeitigen `chmod o+x` an den Scratchpad-Ordnern habe ich
  zurückgenommen (wieder 700).
- **Umgebungsbefund 2 – PostgreSQL 16:** `drizzle-kit migrate` spielt alle offenen Migrationen in einer Transaktion ein;
  0013/0014 nutzen die in 0008 per `ALTER TYPE … ADD VALUE` ergänzten Werte von `rolle`. Auf einer frischen Datenbank
  bricht 16 mit „unsafe use of new value "leitung" of enum type rolle“ ab; PostgreSQL 17 erlaubt das, wenn der Typ in
  derselben Transaktion angelegt wurde (Release Notes 17, E.12.3.3: „Allow the use of an ENUM added via ALTER TYPE if
  the type was created in the same transaction“), PGlite 0.5.8 (= PostgreSQL 18.3) ebenso. Docker (`postgres:17-alpine`)
  ist nicht betroffen, Neon ebenso mit PostgreSQL ≥ 17 → keine Änderung an der App. Behoben in der Umgebung: `template1` trägt einmalig die
  Migrationen 0000–0012 (`web/tests/e2e/hilfen/vorlage-pg16.mjs`, gegengeprüft auf einem Wegwerf-Cluster: ohne Vorlage
  rc=1 mit der Meldung oben, mit Vorlage rc=0 und 15 Migrationen). Jede neue Datenbank (auch `igmg_e2e`) erbt sie,
  `drizzle-kit` spielt 0013/0014 ein. Folge: Datenbanken für Wiederherstellungen in diesem Cluster mit
  `TEMPLATE template0` anlegen.
- **Umgebungsbefund 3 – Fremdlast:** Der Container (4 Kerne, Xeon 2,1 GHz, 15 GB) wird mit den Paketen P1–P3 geteilt
  (deren Bauten, Unit- und Integrationsläufe laufen gleichzeitig). Folge in Lauf 1/2: ALTCHA-Lösungen im Browser über 20 s
  (Abschnitt 2.1, Zeile Formulare). Gemessen ohne Fremdlast mit `$E/diag/altcha-zeit.cjs` (Kontaktformular, PBKDF2, Kosten 5000):
  1 Seite 0,9–7,8 s, 2 Seiten parallel 1,4–8,5 s, mit 3 Dauerschleifen daneben 2,2–8,4 s (`$E/diag/altcha-zeit-*.txt`).
- **Umgebungsbefund 4 – Neustart:** Der Container wurde zwischen Lauf 2 und der Fortsetzung neu gestartet; `start.sh`
  hat PostgreSQL und Mailpit wieder hochgefahren (`$E/log/start-neu.log`), Daten und Bau blieben erhalten.
- **Uhr:** Kinder schreiben im Gruppenchat nur 08–20 Uhr Berliner Zeit (S-05). `$E/uhr/uhr.mjs` (Versatz der
  Prozessuhr) lag als Ausweg bereit, wurde aber **nicht** eingesetzt: Die Server-Uhr zu stellen hätte TOTP (Code aus
  der Testuhr gegen die gestellte Serveruhr) und Sitzungsabläufe (Datenbankuhr) verfälscht. Stattdessen lief der
  maßgebliche Lauf 3 innerhalb des Chatfensters.

## 2 E2E-Läufe (`pnpm test:e2e`, Projekte telefon 390 px und desktop 1440 px, 2 Worker)

| Lauf | Stand | Zeit (UTC) | ok | rot | übersprungen | Ablage |
|---|---|---|---|---|---|---|
| 1 | `2c11368` (Ausgang) | 15.10. 20:44–21:19 | 951 | 17 | 84 | `$E/lauf-1/` |
| 2 | `18e7f3c` + Entwürfe chat/zugaenglichkeit-gemeinde | 15.10. 21:26–22:05 | 967 | 10 | 85 | `$E/lauf-2/` |
| 3 vorab | `73a9e84` (vor 08 Uhr: Kind-Senden übersprungen) | 16.10. 03:54–04:21 | 975 | 0 | 89 | `$E/lauf-3-vorab/` |
| 3 abgebrochen | `73a9e84`, im Chatfenster | 16.10. 06:01–06:21 | 759 bis zum Abbruch | 1 (chat) | 83 bis zum Abbruch | `$E/lauf-3-abgebrochen/` (Abbruch durch meine zu knappe Zeitgrenze des Hintergrundbefehls, nicht durch Playwright) |
| **3** | **`168f2de`**, neu gebaut, im Chatfenster (Start 08:30 Uhr Berliner Zeit) | 16.10. 06:30–06:58 | **978** | **0** | 86 | `$E/lauf-3/` (rc=0) |

Je Lauf: `liste.txt` (Konsole mit rc), `ergebnis.json` (JSON-Bericht), `je-spec.md` (ok/rot/übersprungen je Spec und
Projekt, Gründe der Übersprünge, axe-Anmerkungen; erzeugt mit `$E/werkzeug/auswerten.py`), `fehlerspuren/` (Bildschirm,
Fehlerkontext, Trace der roten Tests).

### 2.1 Rote Specs: Einordnung und Behebung

| Spec (Projekt) | Lauf 1 | Lauf 2 | Ursache | Einordnung | Behebung (Commit) | Lauf 3 |
|---|---|---|---|---|---|---|
| suche ×2 (beide) | rot | ok | GET-Formular schickt mit Bereichsfilter `&bereich=alle` mit | veralteter Test | Adresse darf ihn tragen (`a284875`) | ok |
| welle-a/gebetszeiten Qibla (telefon) | rot | ok | Knopf der Server-Vorschau ohne Aktion – Druck ging vor dem Laden des Kompasses verloren | App | Knopf bis zum Laden gesperrt, Unit `qibla-vorschau` (`35fad01`) | ok |
| cms (desktop) | rot | ok | 308 der Fangroute mit doppelter `location`-Kopfzeile beim Cache-MISS (Next 16.4.0, nur `next start`/standalone/Docker) | App (Framework) | `patches/next@16.4.0.patch`, Dockerfile kopiert `patches/`, Unit `next-patch` (`18e7f3c`) | ok |
| konten Kinderzugang, Lehrkraft (desktop) | rot | ok | `scripts/beispielkonten.ts` brach unter `react-server` ab (Chat-Dienst zog next-intl über den Mail-Ausgang) | App (Skript) | Mail-Ausgang dynamisch geladen, Unit `skripte-react-server` (`35fad01`) | ok |
| mein-bereich-lernen ×2 (desktop) | rot | rot | Lauf 1: wie konten (Beispielkonten); Lauf 2: fremde/erfundene Adresse gibt 200 statt 404 | Lauf 1 App; Lauf 2 veralteter Test | Lauf 2: Next-Verhalten bei Cache Components (notFound im Stream → 200 + `noindex`, Doku „Streaming“ › Status codes); Spec prüft die sichtbare Seite „nicht gefunden“ und `noindex` (`29b9c7d`) | ok |
| konten Registrieren (desktop) | rot | rot | Lauf 1: ALTCHA-Kontrollkästchen mitgezählt; Lauf 2: Bestätigung verlangt seit S1 H-2 das Passwort | veralteter Test | Einwilligung gezielt (`a284875`), Passwort eintragen (`29b9c7d`) | ok |
| verwaltung-koran (desktop) | rot | ok | Adresse vor dem Seitenwechsel gelesen | fehlerhafter Test | erst nach der Navigation lesen (`a284875`) | ok |
| verwaltung-lernen (desktop) | rot | ok | Gruppenformular: `<select>` nach Fehler auf Standard zurückgesetzt (Chat danach „aus“) | App | Auswahl bleibt erhalten, Prüfung in der Spec (`35fad01`) | ok |
| formular-kontakt, -mitgliedsantrag, -moschee-anfrage, -veranstaltungsanmeldung, -meldung, verwaltung-eingaenge (desktop) | 4 rot | 4 rot | ALTCHA-Lösung > 20 s im vollen Lauf; einzeln und zusammen mit dem schwersten eigenen Test grün (`$E/einzel/a1.txt`, `a2.txt`) | Umgebung (Fremdlast, Befund 3) | keine App-Änderung; Wartezeit der Tests 60 s (`hilfen/altcha.ts`, `2b04f32`) | ok |
| chat (desktop) | – | rot | Kind: „Regeln bestätigen“ fest erwartet, Beispielkonten haben sie schon bestätigt | Test (neu) | Regeln nur, falls offen (`29b9c7d`) | s. nächste Zeile |
| chat (desktop), erster Lauf 3 im Chatfenster (abgebrochen, `$E/lauf-3-abgebrochen/`) | – | – | Leitung entfernt die Nachricht des Kindes; beim Kind bleibt sie stehen (20 s, 5 Abrufe). Der Abruf liefert nur Nachrichten nach der letzten ID, der Browser hängt nur Unbekanntes an – eine entfernte Nachricht blieb in jedem offenen Fenster bis zum Neuladen sichtbar (S-09, DSFA R-04) | **App** | `ladeNachrichten(…, nachId, abId)` liefert `entfernt` (IDs zwischen erster angezeigter und letzter bekannter Nachricht), Route nimmt `ab`, ChatFenster setzt den Platzhalter; Integration `chat.test` „S-09“ erweitert (rot ohne Fix); neu gebaut (`168f2de`); gezielt 08:28 Uhr grün (`$E/einzel/a5.txt`) | ok |
| zugaenglichkeit-gemeinde Kind (beide) | – | rot | wie chat | Test (neu) | dito (`29b9c7d`) | ok |
| lernkette (desktop) | – | – (neu) | frischer Kinderzugang: außerhalb 08–20 Uhr geht „geschlossen“ den Regeln vor (`schreibGrund`) | Test (neu) | Regeln nur im Fenster, sonst Grenze vermerkt (`2b04f32`); Probe 05:5x Uhr grün mit Vermerk (`$E/einzel/a4.txt`) | ok |

### 2.2 Lauf 3 – Übersprünge

Alle 86 Übersprünge sind feste Regeln der Specs, keine Zeit- oder Umgebungsfolge: Abläufe mit Anmeldung, Formulare und
Verwaltung nur einmal je Lauf (im Projekt desktop), Zwischenablage nur Chromium-Desktop, Telefon-/Desktop-only-Prüfungen,
Kontaktkarte erst mit bestätigten Koordinaten (M-010). Liste mit Gründen: `$E/lauf-3/je-spec.md`.

## 3 Z-07 am echten Server

Feste Spec `web/tests/e2e/zugaenglichkeit-gemeinde.spec.ts` (axe-core/playwright 4.13, Tags wcag2a/2aa/21a/21aa/22aa;
ernst/kritisch lässt den Test scheitern, alle Befunde stehen als Anmerkung `axe` im JSON-Bericht), Konten aus den
E2E-Hilfen (`hilfen/gemeinde.ts` über `scripts/beispielkonten.ts`, `hilfen/konto.ts` per Einladung, Kinderschutz über
`hilfen/schutzrolle.ts` wirksam). Lauf 3, beide Breiten, im Chatfenster (08:30 Uhr):

| Ort | 390 px ernst/krit. · mittel/gering | 1440 px ernst/krit. · mittel/gering | Fokus per Tastatur |
|---|---|---|---|
| Anwesenheit erfassen / nach dem Speichern | 0 · 0 / 0 · 0 | 0 · 0 / 0 · 0 | Enter auf „Speichern“ → Meldung „gespeichert“, Fokus bleibt auf „Speichern“ |
| Gruppenchat Leitung / nach dem Senden | 0 · 0 / 0 · 0 | 0 · 0 / 0 · 0 | Tab auf „Senden“, Enter → Nachricht im Verlauf, Fokus im leeren Feld |
| Gruppenchat Kind: Regeln / offen / nach dem Senden | 0 · 0 / 0 · 0 / 0 · 0 | 0 · 0 / 0 · 0 / 0 · 0 | Regeln per Enter → Fokus im Feld; Senden per Knopf und per Enter im Feld → Fokus im leeren Feld |
| Verwaltung › Kinderschutz / „alle“ | 0 · 0 / 0 · 0 | 0 · 0 / 0 · 0 | – |
| Verwaltung › Gruppen / Gruppe / nach dem Speichern | 0 · 0 / 0 · 0 / 0 · 0 | 0 · 0 / 0 · 0 / 0 · 0 | Enter auf „Speichern“ → Fokus auf der Meldung „gespeichert“ |
| Verwaltung › Freigaben | 0 · 0 | 0 · 0 | – |

Ergebnis: **0 ernste oder kritische Befunde**, auch keine mittleren oder geringen. Zusätzlich `barrierefreiheit.spec.ts`
(147 Prüfungen je Breite) grün. Außerhalb des Fensters (Lauf 3 vorab, 05:54 Uhr) prüfte die Spec den gesperrten Zustand
des Kindes (axe 0 · 0) und übersprang nur das Senden.

`_gemeinde/werkzeuge/a11y.mjs` berichtigt (`0b5cf57`): Seiten mit Fehlerinhalt – „Seite nicht gefunden“, Fehlergrenze
(Titel aus den Sprachdateien), Fehlerhülle von Next – zählen auch bei HTTP 200 nicht mehr als 0/0, sondern als FEHLER
(eigene Tabellenzeile, Exit-Code 1); ebenso HTTP ≥ 400. Absichtliche Fehlerseiten-Routen tragen `"fehlerseite": true`
(`routen-stufe-c.json`). Probe: `$E/a11y/probe-a11y.md` (404 ohne Merker → FEHLER, mit Merker → gewertet).

## 4 Z-20 Wiederherstellungsprobe (`betrieb/lokal/sicherung`, Skripte unverändert)

Ablauf: `$E/wiederherstellung/lauf.sh <web> http://localhost:3100` (eigener Standalone-Server gegen `igmg` auf Port 3100,
danach beendet). Die Container-Pfade werden vorübergehend nachgestellt und per `trap` wieder entfernt: `/daten` (leer),
`/sicherung` → `betrieb/lokal/sicherung`, `/usr/local/bin/initdb` und `pg_ctl` → PostgreSQL 16 (im PATH von `su postgres`).
Leserolle `igmg_sicherung` mit Zufallspasswort wie BETRIEB.md 6a, Wegwerf-Schlüssel mit `age-keygen` (age 1.1.1), danach
Rolle, Schlüssel und Kopien gelöscht. Protokolle: `$E/wiederherstellung/lauf-1-rechte-fehlen.log`, `lauf.log`.

1. **Erster Versuch (15.10., 22:07 UTC) – Befund:** Mit den Rechten aus BETRIEB.md 6a brach `pg_dump` ab: „permission
   denied for sequence __drizzle_migrations_id_seq“. `sichern.sh` meldete korrekt „Sicherung FEHLER: pg_dump“, legte keine
   Datei an und schickte `{"sicherung":{"ok":false}}` ans Cockpit; `probe.sh` meldete „Probe FEHLER“. Ursache in der
   Doku: SELECT auf Sequenzen nur im Schema `public`. Behoben in BETRIEB.md 6a (Sequenzen auch in `drizzle`,
   Standardrechte für neue Sequenzen) – `f3eaea8`.
2. **Zweiter Versuch (16.10., 03:33–03:35 UTC) mit den berichtigten Rechten:**

| Schritt | Ergebnis |
|---|---|
| Quelle `igmg` | 98 Tabellen in `public` |
| `sichern.sh` | „Sicherung ok“, `igmg-20261016-0333.sql.gz.age` 7 225 496 Bytes + `.sha256`; Cockpit `sicherung.ok = true` |
| Entschlüsseln (Vorstand-Weg) | 99 `CREATE TABLE` (98 `public` + `drizzle.__drizzle_migrations`) |
| Wiederherstellen in leere DB (`CREATE DATABASE … TEMPLATE template0`) | `psql -v ON_ERROR_STOP=1` rc=0; Tabellen 98/98, `quran_vers` 6236/6236, `hadith` 7580/7580, `user` 14/14, Migrationen 15/15, `session` 1/0 (Inhalt bewusst nicht gesichert) |
| `probe.sh` (Gutfall) | `[ 98 -gt 50 ]` → „Probe ok“, Meldung `probe.ok = true, bytes 7225496`, `/tmp/probe` danach entfernt |
| Fehlerfall: abgeschnitten (2000 Bytes, Prüfsumme alt) | „Probe FEHLER: keine unversehrte, vollständige Sicherung“, Cockpit `probe.ok = false` |
| Fehlerfall: abgeschnitten, Prüfsumme neu (unter 4096 Bytes) | „Probe FEHLER …“ |
| Fehlerfall: leer (0 Bytes, Prüfsumme passend) | „Probe FEHLER …“ |
| Fehlerfall: neueste < Hälfte der vorigen (3 612 652 statt 7 225 496 Bytes, Prüfsumme passend) | „Probe FEHLER …“ |
| Fehlerfall: keine Sicherung | „Probe FEHLER …“, Cockpit `probe.ok = false` |
| Gutfall zum Schluss | „Sicherung ok“, „Probe ok“, Cockpit beide `ok = true` |

`melden.sh` → `POST /api/wartung/lokal-meldung` (Bearer `WARTUNG_TOKEN` über die Standardeingabe) kam jedes Mal an:
gelesen aus `einstellung.lokaler_server` der Datenbank `igmg`. Nach dem Lauf: `/daten`, `/sicherung`, die Verweise,
`/tmp/probe`, die Rolle und die Testdatenbank sind entfernt (geprüft).

## 5 Verbleibende Grenzen (mit Beleg)

- **Echtzeit und Push:** Centrifugo und VAPID sind in dieser Umgebung nicht eingerichtet (keine Drittanbieter, kein
  lokaler Server). Der Chat ist über den Pflichtweg Abruf geprüft (ADR 0027); echte Push-Zustellung und das
  Echtzeit-Signal sind nicht geprüft (`pwa.spec.ts` prüft nur Anmeldung/Abmeldung ohne Zustellung).
- **PostgreSQL 16 statt 17:** nur Testumgebung, über die Vorlage `template1` (Befund 2). Produktion, Vorschau und eigener
  Server: PostgreSQL 17 (VERCEL.md 2.1, BETRIEB.md 6a, GO-LIVE G1, tests/e2e/LIESMICH.md 1a).
- **Chromium-Revision:** Playwright 1.64 erwartet 1248, gelaufen ist Chromium 141 (Revision 1194) über Verweise.
- **„Nicht gefunden“ in Mein Bereich mit HTTP 200:** Mit Cache Components beginnt die Antwort als Stream; ein
  `notFound()` danach bleibt bei 200 und setzt `noindex` (Next-Doku „Streaming“ › Status codes). Sichtbar ist die Seite
  „nicht gefunden“ ohne Daten, kein Unterschied zwischen fremd und erfunden; die Specs prüfen das. Ein echter 404 hieße,
  die Prüfung vor jede Suspense-Grenze zu ziehen – nicht Teil dieses Pakets (offener Punkt für die Endprüfung).
- **Fremdlast:** Bei parallelen Bauten anderer Pakete dauert ALTCHA länger; die Tests warten bis 60 s.
- **Formatierung außerhalb von `web/`:** `_gemeinde/werkzeuge/*.mjs|json` und `web/pnpm-workspace.yaml` waren schon vor
  dem Paket nicht im Prettier-Stil (Ausgangsstand ebenso gemeldet); nicht angefasst.

## 6 Anleitung im Repo

`web/tests/e2e/LIESMICH.md` „E2E und Wiederherstellungsprobe ohne Docker“ (Dienste, PostgreSQL-16-Vorlage, `.env`,
Bau, Lauf, Chromium-Verweise, Chatfenster-Hinweis, ALTCHA, Soft-404, Wiederherstellungsprobe mit Fehlerfällen), Verweis in
`web/docs/BETRIEB.md` 8. PostgreSQL 17 in `web/docs/deploy/VERCEL.md` 2.1, `web/docs/GO-LIVE.md` G1, `web/docs/BETRIEB.md`
6a. Werkzeuge dieses Laufs (nicht im Repo): `$E/start.sh`, `$E/stop.sh`, `$E/wiederherstellung/lauf.sh`,
`$E/werkzeug/auswerten.py`, `$E/diag/altcha-zeit.cjs`, `$E/lauf-3/starten.sh`.

## 7 Commits, Prüfungen, Aufräumen

Commits im Branch `worktree-agent-a360d92e270ea9f2f` (Basis `claude/trusting-lovelace-6nfolz`):
`0b5cf57` a11y.mjs · `a284875` drei Specs · `35fad01` drei App-Fehler · `18e7f3c` Next-Patch · `29b9c7d` neue Specs,
Hilfen, Vorlage, Anleitung (Entwurf) · `f3eaea8` Leserolle (BETRIEB 6a) · `2b04f32` ALTCHA-Wartezeit, Lernkette ·
`73a9e84` PostgreSQL 17 in den Unterlagen · `168f2de` Chat: Entfernen erreicht offene Fenster (S-09) · `e02121c` Abschluss.

Prüfungen am Stand `e02121c`: `pnpm typen` rc=0; ESLint aller geänderten `.ts/.tsx/.mjs` unter `web/` rc=0; Prettier
der geänderten Dateien unter `web/` sauber (außer den vorbestehenden in Abschnitt 5); Unit `next-patch`,
`qibla-vorschau`, `skripte-react-server` 7/7; Integration `chat` 23/23 (S-09 rot ohne Fix), `sicherheit-s2-chat`,
`verwaltung-lernen` (zusammen 49/49 vor dem Fix); `pnpm sprachen:pruefen` vollständig (keine neuen Schlüssel);
`religion-pruefung.mjs` rc=0 (Arbeitsbaum und Vorgabe); `wortlaut.mjs --basis b702c7c --stand e02121c` rc=0
(Befunde „hoch“ offen 0; Protokoll `scratchpad/wortlaut-P4.md`).

Aufräumen: eigener Next-Server (PID aus `$E/pids/server-eigen.pid`) beendet; `web/.next` und `web/test-results` des
Arbeitsbaums gelöscht; Bau-Temp `scratchpad/tmp-P4` gelöscht; keine PGlite-Kopien angelegt. **PostgreSQL und Mailpit
laufen weiter** (`$E/pids/postgres.pid`, `$E/pids/mailpit.pid`); Datenbanken `igmg` (Entwicklung, Stand nach Z-20) und
`igmg_e2e` (Stand Lauf 3).
