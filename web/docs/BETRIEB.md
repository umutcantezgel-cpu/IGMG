# BETRIEB – IGMG Wetzlar Web-App

Stand: Durchstich P3 (wird bis P5 vervollständigt). Zielgruppe: die Person, die den Server betreut.
Alle Platzhalter in eckigen Klammern sind von der Gemeinde zu füllen (`_lauf/MENSCHEN.md`).

## 1 Bausteine

| Baustein      | Zweck                                            | Wo                                                                                     |
| ------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| App           | Next.js 16.4 (standalone), Port 3000             | Docker-Image aus `web/Dockerfile`                                                      |
| PostgreSQL 17 | Inhalte, Konten, Eingänge (verschlüsselt), Audit | `docker compose` Dienst `db`, Volume `db-daten`                                        |
| Medien        | hochgeladene Bilder                              | Volume `medien` (`MEDIEN_VERZEICHNIS=/app/.medien`) oder S3-kompatibel (`SPEICHER=s3`) |
| E-Mail        | Bestätigungen, Benachrichtigungen, Einladungen   | SMTP (`MAIL_TRANSPORT=smtp`); lokal Mailpit                                            |

## 2 Erstinstallation

1. `.env` aus `.env.example` anlegen und **alle** Geheimnisse neu erzeugen (je `openssl rand -base64 32`, `WARTUNG_TOKEN` mit `openssl rand -base64 48`). `.env` nie ins Repository.
2. `APP_URL` und `BETTER_AUTH_URL` auf die echte HTTPS-Adresse setzen (erst dann aktiviert die App HSTS und `upgrade-insecure-requests`).
3. `docker compose --profile betrieb up -d --build`
   - Beim Start wendet die App alle Migrationen an (`MIGRATION_BEIM_START=1`, im Image gesetzt). Schlägt eine Migration fehl, startet die App nicht.
   - Danach lässt sie alle vorgerenderten Inhalte verfallen (`CACHE_ERNEUERN_BEIM_START=1`, ADR 0017): Das Image wird gegen eine Bau-Datenbank mit Beispielinhalten gebaut; die erste Anfrage je Seite rendert aus der echten Datenbank neu.
4. Health-Check: `curl -s http://127.0.0.1:3000/api/health` → `{"status":"ok"}` (prüft auch die Datenbank).
5. Erstes Administrationskonto (M-052): `docker compose exec app node … ` bzw. lokal `pnpm verwaltung:einladen --email <adresse> --name "<Name>" --rolle administration` – gibt den Einladungslink aus. Die Person legt ihr Passwort fest und richtet die Zwei-Faktor-Anmeldung ein (Pflicht).

## 3 Pflichtwerte in `.env`

| Variable                                      | Bedeutung                                                                                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `APP_URL`, `BETTER_AUTH_URL`                  | öffentliche Adresse (https)                                                                                                                                                    |
| `DATABASE_URL`                                | PostgreSQL-Verbindung                                                                                                                                                          |
| `BETTER_AUTH_SECRET`                          | Sitzungsschlüssel                                                                                                                                                              |
| `EINGANG_SCHLUESSEL`, `EINGANG_SCHLUESSEL_ID` | AES-256-Schlüssel für Formulardaten (32 Byte, Base64) und seine Kennung – **getrennt vom Datenbank-Backup sichern**, sonst sind Eingänge nach einer Wiederherstellung unlesbar |
| `RATE_GEHEIMNIS`, `ALTCHA_GEHEIMNIS`          | Spam-Schutz                                                                                                                                                                    |
| `WARTUNG_TOKEN`                               | Zugang zu Wartungsrouten (mind. 32 Zeichen)                                                                                                                                    |
| `MAIL_*`, `SMTP_*`                            | Mailversand                                                                                                                                                                    |

## 4 Wartungsrouten

Alle mit `Authorization: Bearer <WARTUNG_TOKEN>`; ohne gültiges Token antworten sie mit 401.

- `POST /api/wartung/cache-erneuern` – alle Inhalts-Caches verfallen lassen (läuft automatisch beim Start). Manuell nötig nur, wenn Inhalte direkt in der Datenbank geändert wurden.
- `POST /api/wartung/loeschfristen` – Löschlauf (C16, G-07): löscht Eingänge, deren Frist abgelaufen ist (samt Einwilligungen, Notizen und Mail-Ausgang; Audit-Eintrag `eingang.frist_geloescht` ohne Personendaten), versendete Mails nach 30 Tagen, verbrauchte ALTCHA-Aufgaben und alte Zähler der Ratenbegrenzung. Antwort: Anzahl gelöschter Einträge. **Täglich per Cron aufrufen**, z. B. `15 3 * * * curl -fsS -X POST -H "Authorization: Bearer $WARTUNG_TOKEN" https://<domain>/api/wartung/loeschfristen`.
- Fristen je Eingangsart: Verwaltung › Einstellungen (Vorgabe 180 Tage nach Abschluss, Veranstaltungsanmeldungen 30 Tage nach dem Termin; M-050). Die Frist beginnt, wenn ein Eingang „Erledigt“ oder „Abgelehnt“ wird. Nicht abgeschlossene Eingänge werden spätestens 365 Tage nach Eingang gelöscht; Wiederöffnen setzt diese Höchstfrist neu (365 Tage ab dann). Angaben aus öffentlichen Meldungen (Tickets) werden 180 Tage nach „Gelöst“ bzw. „Geschlossen“ entfernt. Abgelaufene, widerrufene und angenommene Einladungen werden nach 30 Tagen gelöscht, abgelaufene Passwort-Links sofort.

## 4a Konten (Kurzfassung)

- Konten entstehen nur per Einladung (Verwaltung › Benutzer und Rollen, oder `pnpm verwaltung:einladen` für das erste Administrationskonto).
- „Passwort vergessen“ verschickt einen Link (60 Minuten gültig) über den Mail-Ausgang – dafür muss SMTP eingerichtet sein. Ohne Mail: Administration setzt „Zwei-Faktor zurücksetzen“ bzw. lädt neu ein.
- Gesperrte Konten können sich nicht anmelden, erhalten keine Benachrichtigungen und keine Links.

## 4b Quran-Text (ADR 0009)

- Ohne Import zeigen `/quran` und die Surenseiten Platzhalter. So bleibt es, bis die Gemeinde die Tanzil-Nutzungsbedingungen angenommen und die Datei heruntergeladen hat (M-036).
- **Import:** Datei nach `web/daten/quran/` legen; sie ist nicht im Repository. Ihren SHA-256-Wert in MENSCHEN.md eintragen, dann:
  `pnpm quran:import daten/quran/<datei>.xml --sha256 <wert> --version "<Tanzil-Version>" --abruf <JJJJ-MM-TT>`.
  Das Skript bricht ab, wenn der Wert nicht passt, und übernimmt die Texte unverändert.
- **Danach** den Cache erneuern (`POST /api/wartung/cache-erneuern`) oder die App neu starten.
- **Übersetzungen** nur mit geklärter Lizenz (M-036b); bis dahin Platzhalter.

## 5 Caching – was Betreuende wissen müssen

- Öffentliche Seiten sind statisch vorgerendert und werden nach Änderungen in der Verwaltung sofort neu erzeugt (zweistufig: sofort und nach 5 s, E-025).
- Der Seiten-Cache liegt im Container (`.next/server/app`). Ein Neustart verwirft ihn nicht, die Erneuerung beim Start macht ihn aber ungültig. **Nur eine App-Instanz betreiben** (mehrere Instanzen bräuchten einen gemeinsamen Cache-Handler).

## 5a Vorgeschalteter Proxy (TLS)

Die App erwartet einen Reverse-Proxy (z. B. Caddy oder nginx) für HTTPS. Für die Ratenbegrenzungen muss er die Adresse der Besucherin bzw. des Besuchers übergeben, und die App muss ihm ausdrücklich vertrauen (E-041):

- `PROXY_VERTRAUEN=1` setzen (nur hinter dem Proxy!).
- Der Proxy **überschreibt** `X-Real-IP` mit der Gegenstelle – nginx: `proxy_set_header X-Real-IP $remote_addr;`, Caddy: `header_up X-Real-IP {remote_host}` – und hängt `X-Forwarded-For` an (`$proxy_add_x_forwarded_for`). Die App nimmt zuerst `X-Real-IP`, sonst den letzten `X-Forwarded-For`-Eintrag.
- Ohne `PROXY_VERTRAUEN=1` wertet die App keine Adress-Header aus (Next.js reicht vom Client gesetzte Werte unverändert durch) und alle Anfragen teilen sich ein Limit; der Start meldet das im Log.
- Better Auth speichert keine IP-Adressen (Sitzungen, Ratenzähler).

## 5b Am Proxy begrenzen (Tor A, Sicherheitsprüfung)

- **Ratenbegrenzung am Proxy** zusätzlich zur App: `GET /api/altcha`, Formular-Schritte (POST auf öffentliche Seiten mit `Next-Action`-Header) und Anfragen an unbekannte Adressen (die App rendert und speichert je unbekannter Adresse eine 404-Antwort im Cache). Richtwert: 60 Anfragen je Minute und IP.
- **X-Forwarded-For:** Der Proxy muss die Besucheradresse **anhängen** und darf vom Client gesendete Werte nicht ungeprüft durchreichen; ohne Proxy kann ein Client die Adresse frei setzen und die Formular-Ratenbegrenzung umgehen (siehe 5a).
- **SMTP ist Pflicht:** Im Betrieb (`NODE_ENV=production`) gibt es keinen Datei-Transport; fehlt `SMTP_HOST`, bleiben Mails im Ausgang und werden wiederholt (Log: „SMTP_HOST fehlt“).
- **https:** Ohne `APP_URL` startet die App im Betrieb nicht (Links in Mails); mit `http://…` warnt sie beim Start, und HSTS sowie `upgrade-insecure-requests` sind aus.
- **Größe von Anfragen:** Die App nimmt Action-Anfragen bis 11 MB an (Medien-Upload bis 10 MB, ADR 0007). Am Proxy enger begrenzen und nur die Verwaltung freigeben – nginx: `client_max_body_size 1m;` und in `location /verwaltung/ { client_max_body_size 11m; }`; Caddy: `request_body { max_size 1MB }` mit eigener Regel für `/verwaltung/*`.
- **Bestätigungsmails:** Höchstens 3 je Empfängeradresse und 24 Stunden über alle Formulare (Schutz Dritter, Tor B/C); weitere Einsendungen gelten, nur die Bestätigung entfällt.
- **Karte nach Klick (Kontakt):** Erst wenn die Koordinaten bestätigt sind (M-010), in `src/lib/sicherheit/header.ts` für die öffentliche CSP `frame-src https://www.openstreetmap.org` ergänzen und die Gegenprobe in `tests/e2e/datenschutz.spec.ts` (Startseiten-CSP ohne Drittanbieter) für diese eine Ausnahme anpassen.

## 6 Datensicherung

- Täglich: `docker compose exec db pg_dump -U igmg -Fc igmg > sicherung-$(date +%F).dump`
- Medien-Volume mitsichern.
- `EINGANG_SCHLUESSEL` separat und sicher aufbewahren (siehe Abschnitt 3).
- Wiederherstellung testen (mindestens einmal je Quartal).

## 7 Aktualisierungen

- Next.js-Sicherheitsupdates zeitnah einspielen (`pnpm view next version`, Paket-Update, `pnpm build`, Tests, neues Image).
- `pnpm audit --prod` vor jeder Aktualisierung des Images.
- Nach einem Update von `altcha`: `pnpm altcha:kopieren` (Worker unter `public/altcha/`, sonst schlägt `pnpm check` fehl).

## 8 Entwicklung und Tests (für Entwickelnde)

- Dienste: `docker compose --profile entwicklung up -d db mailpit` (PostgreSQL 127.0.0.1:5432, Mailpit-Oberfläche 127.0.0.1:8025).
- `pnpm dev` (Port 3000), `pnpm check`, `pnpm test:integration` (PGlite je Testdatei), `pnpm test:e2e` (eigene Datenbank `igmg_e2e`, wird je Lauf frisch angelegt), `pnpm messen` (Lighthouse mobil gegen einen laufenden Produktionsserver auf Port 3100).
- Standalone-Server lokal: `pnpm build && PORT=3100 pnpm start:standalone` (setzt `HOSTNAME=0.0.0.0`, E-015).

## 9 Betrieb auf Vercel (Services)

Alternative zu Docker: ein Vercel-Projekt mit `vercel.json` im Repository-Wurzelverzeichnis. Einziger Service ist `web` (Wurzel `web/`, Next.js), öffentlich über die Rewrite `/(.*)`. Bindings gibt es nicht – die App ruft keine anderen Services auf. Schritt-für-Schritt-Anleitung zum Livegang: `docs/deploy/VERCEL.md`, Checkliste `docs/GO-LIVE.md`, Variablen `docs/deploy/VERCEL-ENV.md`.

- **Projekteinstellung:** Root Directory leer (Services aus `/vercel.json`) oder `web` (Next.js mit `web/vercel.json`, gleiche Einstellungen); siehe `docs/deploy/VERCEL.md` Abschnitt 0. Funktionen laufen in Frankfurt (`regions: ["fra1"]`), Node 24 (`engines.node` 24.x).
- **Bau (ADR 0019):** Skript `vercel-build` → `scripts/vercel-bau.mjs`. Mit `DATABASE_URL` der Umgebung: Migration unter Sperre (`scripts/migriere-mit-sperre.mjs`), dann `next build` gegen diese Datenbank – vorgerenderte Seiten zeigen sofort die echten Inhalte. Ohne `DATABASE_URL`: Bau mit Beispielinhalten aus einer PGlite-Bau-Datenbank (ADR 0017) und Warnung im Bauprotokoll. Migrationen nur additiv (erweitern → umstellen → aufräumen).
- **Zwischenstände:** Commits mit Betreff „ZWISCHENSTAND …“ erzeugen keine Vorschau (`ignoreCommand` des Service, `scripts/vercel-ignore.mjs`); die Produktion baut immer.
- **Startprüfung:** `src/lib/umgebung.ts` meldet fehlende oder falsche Variablen beim Start (Funktionsprotokoll), im Startklar-Cockpit und in `pnpm startklar`. Auf Vercel entfallen Migration beim Kaltstart und Cache-Erneuerung beim Start (dort lauscht kein Server auf 127.0.0.1; Tags verfallen über `updateTag`/`revalidateTag`).
- **Datenbank (ADR 0018):** Neon über den Vercel Marketplace in Frankfurt; Vorschauen auf eigenen Branches. Der Pool ist auf Vercel klein (`max: 5`) und mit `attachDatabasePool` an den Lebenszyklus der Instanz gebunden.
- **Medien (ADR 0020):** `SPEICHER=blob` mit `BLOB_READ_WRITE_TOKEN` (Vercel Blob, Frankfurt). Das Dateisystem ist auf Vercel schreibgeschützt; `SPEICHER=dateisystem` meldet die Startprüfung als Fehler.
- **Weitere Variablen:** wie in Abschnitt 3, dazu `PROXY_VERTRAUEN=1` (Vercel setzt `X-Forwarded-For` selbst), `CRON_SECRET` (Cron), `SITE_MODE` optional (sonst aus `VERCEL_ENV`). **Nicht** setzen: `MIGRATION_BEIM_START`, `CACHE_ERNEUERN_BEIM_START`, `BAU_PGLITE`.
- **Cron (ADR 0021):** `vercel.json` ruft täglich `/api/wartung/loeschfristen` (01:00 UTC) und `/api/wartung/mail-ausgang` (02:00 UTC) per `GET` mit `Authorization: Bearer <CRON_SECRET>` auf; je Aufgabe eine Postgres-Sperre, Läufe sind idempotent. `POST` mit `WARTUNG_TOKEN` bleibt für Docker und Handbetrieb.
- **Vorschauen (ADR 0022):** `robots.txt` sperrt alles, jede Antwort trägt `X-Robots-Tag: noindex`; Zugang über Vercel Authentication bzw. einen teilbaren Link.
- **Grenzen:** Anfragen an Vercel Functions sind auf 4,5 MB begrenzt. Die Verwaltung nimmt auf Vercel deshalb Anfragen bis 4,2 MB an. Größere Bilder verkleinert der Browser vorher. Mit `SPEICHER=blob` lädt der Browser PDF-Dateien über 4,2 MB (bis 10 MB) direkt in Vercel Blob; die Berechtigung gibt `/verwaltung/medien/direkt`, Übernahme und Prüfung macht die Server Action `hochladen` (ADR 0020, Nachtrag 2026-10-12; `docs/deploy/VERCEL.md` 3.4). Ohne Blob lehnt sie größere PDFs mit Hinweis ab. Inhaltsabfragen liegen mit `'use cache: remote'` im geteilten Cache aller Instanzen, die Tag-Invalidierung wirkt dort überall (ADR 0024); Suche und Tagesdatum bleiben bei `'use cache'` je Instanz.
- **Bilder:** Im Services-Modus bindet Vercel die Bildoptimierung `/_next/image` nicht an (Antwort 404). Beim Bau auf Vercel (`VERCEL=1`) liefert `next/image` die Dateien unoptimiert aus (`images.unoptimized` in `next.config.ts`); Bildvarianten entstehen beim Hochladen (ADR 0020).
- Lokal alle Services zusammen starten: `vercel dev` im Repository-Wurzelverzeichnis.
