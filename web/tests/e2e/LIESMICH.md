# E2E und Wiederherstellungsprobe ohne Docker

Kurzanleitung für Rechner ohne Docker-Daemon (Nacharbeit 2, P4). Ergebnis wie `docker compose --profile entwicklung up -d db
mailpit` plus `pnpm test:e2e` (docs/BETRIEB.md 8). Alle Befehle im Ordner `web/`, Node 24.

## 1 Dienste

- **PostgreSQL** (17 wie im Image; 16 geht für die Tests mit Abschnitt 1a), Port 5432, Rolle und Datenbank wie in
  `.env.example`:

  ```sh
  sudo -u postgres initdb -D <datenordner> -E UTF8 --locale=C.UTF-8 --auth-local=peer --auth-host=scram-sha-256
  sudo -u postgres pg_ctl -D <datenordner> -l <logdatei> -o "-p 5432 -c listen_addresses=localhost -c timezone=UTC" -w start
  sudo -u postgres psql -c "CREATE ROLE igmg LOGIN SUPERUSER PASSWORD 'igmg-lokal'"   # wie POSTGRES_USER im Image
  ```

  Der Datenordner muss für den Benutzer `postgres` erreichbar sein (nicht unter einem Ordner mit Modus 700 eines anderen
  Benutzers).

- **Mailpit** (Binärdatei v1.27, wie das Image `axllent/mailpit:v1.27`):

  ```sh
  MP_SMTP_AUTH_ACCEPT_ANY=1 MP_SMTP_AUTH_ALLOW_INSECURE=1 mailpit --smtp 127.0.0.1:1025 --listen 127.0.0.1:8025
  ```

### 1a Nur PostgreSQL 16

`drizzle-kit migrate` spielt alle offenen Migrationen in einer Transaktion ein. 0013/0014 nutzen Werte des Typs `rolle`,
die 0008 ergänzt; das erlaubt erst PostgreSQL 17 (Release Notes 17, E.12.3.3). Mit 16 einmal je Cluster, bevor die
erste Datenbank entsteht:

```sh
node tests/e2e/hilfen/vorlage-pg16.mjs postgres://igmg:igmg-lokal@127.0.0.1:5432/template1
```

Danach erbt jede neue Datenbank (auch `igmg_e2e`) die Migrationen 0000–0012; `drizzle-kit` spielt den Rest ein.
Datenbanken für Wiederherstellungen in diesem Cluster deshalb mit `TEMPLATE template0` anlegen (Abschnitt 3).

**Nur für Tests.** Produktion (Neon), Vorschau-Zweige und jeder eigene Server laufen mit **PostgreSQL 17** – nicht älter
(sonst bricht schon das erste Migrieren ab), nicht neuer als `pg_dump` im Sicherungs-Image (`postgres:17.6-alpine`):
docs/deploy/VERCEL.md 2.1, docs/BETRIEB.md 6a, docs/GO-LIVE.md G1.

## 2 App

1. `.env` aus `.env.example`, Geheimnisse frisch mit `pnpm geheimnisse:erzeugen`, `APP_URL`/`BETTER_AUTH_URL`
   `http://localhost:3100`. Für die Gemeinde-Plattform zusätzlich (der E2E-Bau läuft als Produktion, ADR 0035):

   ```sh
   FUNKTION_KONTEN=an
   FUNKTION_LERNPLATTFORM=an
   FUNKTION_CHAT=an
   FUNKTION_HATIM=an
   FUNKTION_NEWSLETTER=an
   FUNKTION_LERNAPP=an        # Lern-App (ADR 0035, in der Produktion bis zur Abnahme aus): tests/e2e/lernapp/*.spec.ts
   ```

   Eigene Datenbank oder eigener Port für parallele Läufe: `E2E_DATABASE_URL` (Name muss auf `_e2e` enden, z. B.
   `igmg_lernapp_a_e2e`, sonst bricht `scripts/e2e-datenbank.mjs` ab) und `E2E_PORT` (dann `APP_URL`/`BETTER_AUTH_URL`
   setzt `playwright.config.ts`). `tests/e2e/lernapp/rahmen.spec.ts` legt mit `LERNAPP_BILDER=<ordner>` zusätzlich
   Bildschirmfotos von Start und Einstellungen in de/tr/ar bei 390 und 1440 px ab.

2. Entwicklungsdatenbank füllen und bauen: `pnpm db:migrate && pnpm db:seed && pnpm inhalte:import && pnpm build`
   (standalone; die Schalter gelten auch beim Bau, weil Seiten vorgerendert werden).
3. `pnpm test:e2e` legt `igmg_e2e` frisch an (migriert, Seeds, Inhalte) und startet den Standalone-Server auf Port 3100.
   Ergebnis: `test-results/ergebnis.json`, Spuren rot gelaufener Tests in `test-results/`.
4. Passt die Chromium-Version unter `PLAYWRIGHT_BROWSERS_PATH` nicht zu `@playwright/test`, einen eigenen Ordner mit den
   erwarteten Namen (`chromium-<rev>`, `chromium_headless_shell-<rev>`, siehe `playwright-core/browsers.json`) als
   Verweise auf die vorhandenen Browser anlegen und `PLAYWRIGHT_BROWSERS_PATH` darauf setzen.

Hinweise:

- Kinder schreiben im Gruppenchat nur im Chatfenster der Gruppe (08–20 Uhr Berliner Zeit, S-05). `chat.spec.ts`,
  `zugaenglichkeit-gemeinde.spec.ts` und `lernkette.spec.ts` prüfen außerhalb davon den gesperrten Zustand und
  überspringen das Senden des Kindes bzw. die Regeln-Bestätigung mit Begründung – den vollen Lauf daher zwischen 08 und
  19 Uhr starten.
- ALTCHA rechnet im Browser (Proof-of-Work); die Tests warten bis 60 s (`hilfen/altcha.ts`). Auf 4 Kernen ohne Fremdlast
  dauert eine Lösung 1–9 s; laufen nebenher Bauten, deutlich länger.
- Mit Cache Components antworten Seiten als Stream mit 200; ein `notFound()` mitten im Stream bleibt bei 200 mit
  `noindex` (Next-Doku „Streaming“, Abschnitt Status codes). Die Specs prüfen deshalb, was der Browser zeigt
  („Seite nicht gefunden“, `noindex`), nicht den Statuscode.
- Dasselbe gilt für Fehler und Weiterleitungen in der Verwaltung: Ihre Seiten sind teilweise vorgerendert (◐ im Bau,
  Antwortkopf `x-nextjs-postponed: 1`). Status 200 und Kopfzeilen gehen mit der statischen Hülle hinaus, bevor Sitzung
  und Daten gelesen sind. Ein Fehler beim Rendern erscheint danach als Fehlergrenze „Ein Fehler ist aufgetreten“ – mit
  HTTP 200 (Next-Doku `node_modules/next/dist/docs/01-app/02-guides/streaming.md`, „Error handling mid-stream“ und
  „The HTTP contract“; `01-app/03-api-reference/03-file-conventions/loading.md`, „Status codes“). Auch die Weiterleitung ohne
  Anmeldung kommt im Stream (`NEXT_REDIRECT`), nicht als 307 (Nacharbeit 3, gemessen am Standalone-Bau). Ein Absturz
  fällt deshalb nur am sichtbaren Inhalt auf, nicht am Statuscode – Specs prüfen Überschriften und Inhalte.

## 3 Wiederherstellungsprobe (`betrieb/lokal/sicherung`)

Die Skripte erwarten die Pfade des Containers. Ohne sie zu ändern:

1. Leserolle wie docs/BETRIEB.md 6a anlegen (mit SELECT auf die Sequenzen in `public` **und** `drizzle`, sonst bricht
   `pg_dump` ab), Wegwerf-Schlüssel `age-keygen -o schluessel.txt`.
2. Vorübergehend `/daten` (leerer Ordner), `/sicherung` → `betrieb/lokal/sicherung` und – falls `initdb`/`pg_ctl` nicht
   im PATH des Benutzers `postgres` liegen – Verweise in `/usr/local/bin` anlegen.
3. `SICHERUNG_DATABASE_URL=<Leserolle> AGE_EMPFAENGER=<age1…> WARTUNG_TOKEN=<aus .env> APP_URL=<laufende App> sh /sicherung/sichern.sh`
   → „Sicherung ok“; danach `sh /sicherung/probe.sh` → „Probe ok“ (mit `sh -x` steht die Tabellenzahl im Protokoll).
4. Entschlüsseln wie LIESMICH „Wiederherstellen im Ernstfall“ (`age -d … | gunzip | psql`) in eine leere Datenbank
   (`CREATE DATABASE … TEMPLATE template0` – bei PostgreSQL 16 nicht aus der Vorlage aus 1a).
5. Fehlerfall: die neueste Sicherung abschneiden (`head -c 2000`), leeren (0 Bytes, Prüfsumme neu) oder entfernen →
   `probe.sh` meldet „Probe FEHLER: keine unversehrte, vollständige Sicherung“, das Cockpit zeigt die Probe als Fehler
   (`melden.sh` → `/api/wartung/lokal-meldung`, gespeichert in `einstellung.lokaler_server`).
6. Danach alles wieder entfernen (`/daten`, `/sicherung`, die Verweise, Schlüssel, Leserolle).
