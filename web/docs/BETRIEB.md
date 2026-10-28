# BETRIEB – IGMG Wetzlar Web-App

Stand: Durchstich P3 (wird bis P5 vervollständigt), Nachtrag 28.10.2026 (Marktstart IGMG: § 4, 4c, 4d, 5b, 8, 9, 9a). Zielgruppe: die Person, die den Server betreut.
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

- `POST /api/wartung/cache-erneuern` – alle Inhalts-Caches verfallen lassen (läuft automatisch beim Start). Manuell nötig nur, wenn Inhalte direkt in der Datenbank geändert wurden. Gezielt mit `?tag=<tag>` (mehrfach möglich; erlaubt sind die Start-Tags aus `src/lib/cache/tags.ts` und je Lern-App-Kurs `lernapp-kurs-<kurs>`, z. B. `?tag=lernapp-kurs-koran`): Dann verfallen nur diese, die übrigen Caches bleiben warm. Unbekannte Tags → 400. Hinweis: `lernapp` verfallen zu lassen baut beim nächsten Abruf alle Kursverzeichnisse neu (kalt je Richtung ≈ 2–4 s Rechenzeit, Einheit für Einheit mit Pause dazwischen, längste Blockade des Servers ≤ 0,4 s; vor Stufe C N6 ≈ 10 s am Stück). Dasselbe löst der Tag `einstellungen` aus (jede gespeicherte Einstellung, z. B. Gebetszeiten-Import, Spenden, Startklar), weil die Lern-App ihre Schalter über `ladeEinstellung('funktionen')` liest und Next die Tags innerer Caches an den äußeren Eintrag weitergibt. Messung: `pnpm exec tsx --conditions=react-server --env-file-if-exists=.env scripts/lernapp/paketbau-messen.ts`.
- `POST /api/wartung/loeschfristen` – Löschlauf (C16, G-07): löscht Eingänge, deren Frist abgelaufen ist (samt Einwilligungen, Notizen und Mail-Ausgang; Audit-Eintrag `eingang.frist_geloescht` ohne Personendaten), versendete Mails nach 30 Tagen, verbrauchte ALTCHA-Aufgaben und alte Zähler der Ratenbegrenzung. Antwort: Anzahl gelöschter Einträge. **Täglich per Cron aufrufen**, z. B. `15 3 * * * curl -fsS -X POST -H "Authorization: Bearer $WARTUNG_TOKEN" https://<domain>/api/wartung/loeschfristen`.
- Fristen je Eingangsart: Verwaltung › Einstellungen (Vorgabe 180 Tage nach Abschluss, Veranstaltungsanmeldungen 30 Tage nach dem Termin; M-050). Die Frist beginnt, wenn ein Eingang „Erledigt“ oder „Abgelehnt“ wird. Nicht abgeschlossene Eingänge werden spätestens 365 Tage nach Eingang gelöscht; Wiederöffnen setzt diese Höchstfrist neu (365 Tage ab dann). Angaben aus öffentlichen Meldungen (Tickets) werden 180 Tage nach „Gelöst“ bzw. „Geschlossen“ entfernt. Abgelaufene, widerrufene und angenommene Einladungen werden nach 30 Tagen gelöscht, abgelaufene Passwort-Links sofort.

- `POST /api/wartung/gebetszeiten-abgleich` – Abgleich mit dem IGMG-Gebetskalender (ADR 0048): holt die nächsten Tage (Standard 60) über den offiziellen Zugang (`GEBETSZEITEN_IGMG_URL`, optional `GEBETSZEITEN_IGMG_SCHLUESSEL`) bzw. die Jahresdatei, prüft sie und übernimmt nur Änderungen; Tabellen der Gemeinde werden nie überschrieben. `?trocken=1` prüft und meldet, ohne zu schreiben; `?nurAktiv=1` läuft nur, wenn der Abgleich in der Verwaltung eingeschaltet ist (so ruft ihn der lokale Takt). Antwort mit Status (`ok`, `unveraendert`, `auffaellig`, `freigegeben`, `fehler`, `nicht_eingerichtet`, `inaktiv`, `uebersprungen`), `no-store`; danach verfallen die betroffenen Monate im Cache. Der Cron ruft `GET` mit `CRON_SECRET` und läuft nur bei eingeschaltetem Abgleich.
- `POST /api/wartung/dachverband-abgleich` – Freitagspredigten aus dem RSS-Feed der IGMG (ADR 0046): übernimmt nur Titel, Datum und Link als neue Einträge (`herkunft: feed`) in den Seiteninhalt `dachverband`, Audit `dachverband.abgleich`. `?trocken=1` schreibt nichts. Ein Feed-Fehler schreibt ebenfalls nichts. Cron: `GET` mit `CRON_SECRET`.
- Öffentlich, ohne Token: `GET /api/gebetszeiten/<JJJJ-MM>` – Monatszeiten als JSON mit Quelle und Stand, für den Vormonat bis 12 Monate voraus (sonst 404), CORS nur `GET`, `Cache-Control: public, max-age=300`.

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

## 4c Gebetszeiten aus dem IGMG-Gebetskalender (ADR 0048)

- **Vorrang je Tag:** Import der Gemeinde (auch „Tabelle einfügen“) vor IGMG-Abgleich vor IGMG-Jahresdatei vor Rechnung. Die Rechnung ist standardmäßig die kalibrierte Näherung „IGMG (angenähert)“ (Einstellung `rueckfall: naeherung`), öffentlich als „berechnet (vorläufig)“ gekennzeichnet.
- **Zugang:** Ohne offiziellen Zugang (M-100) tut der Abgleich nichts. Die interne Schnittstelle von igmg.org wird nicht genutzt und nicht umgangen. Eine gelieferte Jahresdatei liegt unter `web/daten/igmg-gebetskalender/<stadtId>-<jahr>.csv` mit `QUELLE.md` (SHA-256, Abrufdatum, ADR 0025); Startklar `inhalte.gebetszeiten-datei` warnt 60 Tage vor ihrem Ende.
- **Hinweis-Mails** an die Konten mit dem Recht `gebetszeiten.bearbeiten`: bei Störung nach drei Fehlschlägen in Folge, bei auffälligen Werten (Freigabe nötig), bei weniger als 14 Tagen Abdeckung und bei neuen Konflikten mit dem Import der Gemeinde.
- **Laufprotokoll:** Tabelle `gebetszeit_abgleich` ohne Personendaten; Läufe älter als 90 Tage werden gelöscht, der letzte erfolgreiche bleibt.
- **Kalibrieren:** `pnpm gebetszeiten:kalibrieren --datei <igmg-tabelle> [--pglite] [--ausgabe <bericht.md>]` vergleicht die Näherung mit einer IGMG-Tabelle und schlägt Winkel und Temkin je Gebet vor. Das Skript schreibt nie in die Einstellungen; übernommen wird in der Verwaltung (Gebetszeiten › Näherung, ab 14 IGMG-Tagen). Bericht vom 28.10.2026: `docs/berichte/gebetszeiten-kalibrierung-2026-10-28.md` (Aachen, Oktober; Sommer nicht belegt).
- **Startklar-IDs:** `inhalte.gebetszeiten-abdeckung` (30 Tage aus Tabellen; unter 7 in der Produktion Fehler), `inhalte.gebetszeiten-abgleich` (Alter des letzten Laufs, Fehlschläge), `inhalte.gebetszeiten-konflikte`, `inhalte.gebetszeiten-datei`, `inhalte.gebetszeiten-igmg-zugang`.

## 4d Inhalte vom Dachverband, Linkprüfung und Inhaltsstände (ADR 0046)

- **Hutba-Pflege:** Freitagspredigten kommen täglich aus dem Feed. Einträge in der Verwaltung **ausblenden statt löschen** – gelöschte Feed-Einträge holt der nächste Abgleich zurück. Höchstens 60 Einträge; darüber fallen die ältesten Feed-Einträge weg, die nicht mehr im Feed stehen. In der Verwaltung höchstens ein Abruf je 5 Minuten. Startklar `inhalte.dachverband-aktuell` warnt, wenn die neueste sichtbare Predigt älter als 14 Tage ist; abgelaufene sichtbare Einträge sind ein Hinweis. Ändert die IGMG das Feed-Format oder sperrt sie den Abruf, endet der Abgleich mit `fehler` und schreibt nichts.
- **Linkprüfung:** `pnpm links:pruefen [basis]` (gegen einen laufenden Server) bzw. `pnpm links:pruefen --quellen` (statisch aus dem Code, ohne Server) prüft die externen Ziele (`NETZWERK` in `src/lib/dachverband/netzwerk.ts`, Stand 2026-10-27) und die Links der Seiteninhalte; Bericht unter `_lauf/belege/links/`. Hinter einem Pflicht-Proxy mit `NODE_USE_ENV_PROXY=1` starten (Node ≥ 22.21). Läuft nicht im Bau. Jährlich (M-107) und vor dem Livegang (GO-LIVE C13). Antworten wie 403 hinter einer Bot-Abfrage (bisher camiahaber.com) im Browser nachsehen. Wird ein Netzwerk-Schlüssel umbenannt, werden gespeicherte Verweise der Organisationsseiten (`DACHVERBAND_ZIELE`) still zu `null`.
- **Jährliche Pflege** über Verwaltung › Seiteninhalte: Kennzahlen und Broschüren-Pfade auf `/igmg` nach der neuen Broschüre; Abflüge, Fristen und Programme auf `/hadsch-umra` nach der Ausschreibung von IGMG Reisen (vergangene Abflüge und Hinweise blenden sich über das Tagesdatum aus; die Seite wird stündlich neu erzeugt). YouTube-IDs der Wissensvideos (`/islamisches-wissen`) lassen sich nur über Seed oder Stand-Migration ändern.
- **Inhaltsstände (Stand-Migration):** `pnpm inhalte:marktstart` bringt neue Beispielstände in eine bestehende Datenbank (IGMG, Über uns, Vorstand, vier Organisationen, Aus dem Dachverband, Hadsch & Umra, Entwurf der Datenschutzerklärung, Wissens-Entwürfe, Wissensvideos). Ersetzt nur Zeilen mit `istBeispiel = true`, legt fehlende Bereiche an, schreibt ein Audit, ist idempotent und läuft unter einer Transaktionssperre (ADR 0019, Nachtrag 2026-10-28). Wissens-Entwürfe bekommt jede Datenbank nur einmal (Merker `wissen_entwuerfe_angelegt` in `einstellung`): endgültig Gelöschtes legt sie nicht neu an. Auf Vercel läuft sie im Bau mit Datenbank automatisch; mit Docker nach dem Update einmal von Hand, danach `POST /api/wartung/cache-erneuern` ohne `tag`, weil Seiteninhalte und Wissen betroffen sind. Vorbild für spätere Stände: `inhalte:2026`.
- **Wissens-Vorschau:** Startklar `gemeinde.wissen-vorschau` meldet, wie viele Entwürfe öffentlich sichtbar sind (ADR 0047). Abschalten: `FUNKTION_WEBSITE_WISSEN_VORSCHAU=aus` und neu bereitstellen, oder Einstellung `funktionen` und danach Cache erneuern.
- **Sichtbarkeit in der Suche (ADR 0049):** Solange der Konzept-Hinweis an ist, tragen auf Vercel (`VERCEL=1`) alle Seiten `noindex, follow` und `/llms.txt` antwortet mit 404; die Schranke folgt der Einstellung `allgemein` (Tag `einstellungen`). Mit Docker gilt sie nicht. Nach Inhaltsreleases `E2E_BASIS=https://<domain> pnpm exec playwright test tests/e2e/seo.spec.ts --project desktop` gegen die Produktion laufen lassen.

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
- **Karte und Videos nach Klick:** erledigt am 28.10.2026 (ADR 0012, Nachtrag). Jede CSP enthält `frame-src 'self' https://www.openstreetmap.org https://www.youtube-nocookie.com` (`RAHMEN_QUELLEN` in `src/lib/sicherheit/header.ts`); `tests/e2e/datenschutz.spec.ts` kennt genau diese Ausnahme samt Gegenfall. Die Karte erscheint erst mit bestätigten Koordinaten (M-010). Einen weiteren Host nur mit Nachtrag zu ADR 0012 und Datenschutz-Prüfung (M-111) aufnehmen.

## 6 Datensicherung

- Täglich: `docker compose exec db pg_dump -U igmg -Fc igmg > sicherung-$(date +%F).dump`
- Medien-Volume mitsichern.
- `EINGANG_SCHLUESSEL` separat und sicher aufbewahren (siehe Abschnitt 3).
- Wiederherstellung testen (mindestens einmal je Quartal).

## 6a Sicherung über den lokalen Server: Leserolle (S3)

Der lokale Helfer-Server (`betrieb/lokal`, ADR 0036) sichert die Neon-Datenbank mit einer **eigenen Rolle nur zum
Lesen** – nie mit dem Zugang aus `DATABASE_URL` der Website.

```sql
-- in Neon (SQL-Editor), als Eigentümer der Datenbank; Name und Passwort frei wählen (Passwort zufällig, mind. 32 Zeichen)
CREATE ROLE igmg_sicherung LOGIN PASSWORD '<zufällig>';
GRANT CONNECT ON DATABASE <datenbank> TO igmg_sicherung;
GRANT USAGE ON SCHEMA public, drizzle TO igmg_sicherung;
GRANT SELECT ON ALL TABLES IN SCHEMA public, drizzle TO igmg_sicherung;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public, drizzle TO igmg_sicherung;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO igmg_sicherung;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO igmg_sicherung;
```

- PostgreSQL-Version: Neon und jeder eigene Server mit **17** (wie `postgres:17-alpine` in `docker-compose.yml`). 16 bricht
  beim ersten Migrieren einer frischen Datenbank ab (Migrationen 0013/0014, VERCEL.md 2.1); eine höhere Hauptversion
  kann `pg_dump` 17 aus dem Sicherungs-Image (`postgres:17.6-alpine`) nicht sichern – dann zuerst das Image anheben.
- `pg_dump` braucht SELECT auf alle Tabellen und Sequenzen – auch auf `drizzle.__drizzle_migrations_id_seq`; ohne sie
  bricht die Sicherung mit „permission denied for sequence“ ab (Wiederherstellungsprobe P4, Nacharbeit 2). Sitzungen, Einmal-Links und Ratenzähler (`session`, `verification`,
  `ratenbegrenzung`, `rate_limit`) sichert `sichern.sh` nur als Struktur, ohne Inhalt.
- Einmal-Links (Passwort vergessen, Bestätigungen) stehen in `verification` nur als SHA-256 – wer die Leserolle kennt,
  kann damit kein Konto übernehmen. Sitzungs-Cookies sind mit `BETTER_AUTH_SECRET` signiert, das nur bei Vercel liegt.
- Die Zugangsdaten bekommt nur der Dienst `sicherung` (`docker-compose.yml` reicht jedem Dienst nur seine eigenen Werte
  aus `.env` durch); `.env` mit `chmod 600` schützen. Passwort der Rolle nach einem Wechsel im Gemeindehaus erneuern.
- „Sicherung ok“ im Cockpit heißt: `pg_dump`, `gzip` und `age` sind gelungen und die Datei hat die Mindestgröße. Behalten
  werden die 30 neuesten gültigen Sicherungen (`SICHERUNG_TAGE`); Fehlschläge zählen nicht mit.

## 7 Aktualisierungen

- Next.js-Sicherheitsupdates zeitnah einspielen (`pnpm view next version`, Paket-Update, `pnpm build`, Tests, neues Image).
- `pnpm audit --prod` vor jeder Aktualisierung des Images.
- Nach einem Update von `altcha`: `pnpm altcha:kopieren` (Worker unter `public/altcha/`, sonst schlägt `pnpm check` fehl).
- **Patch an Next.js 16.4.2** (`patches/next@16.4.2.patch`, seit 16.4.0 unverändert, eingetragen in `pnpm-workspace.yaml` › `patchedDependencies`,
  Nacharbeit 2, P4): Beim frischen Rendern einer Seite (Cache-MISS unter `next start`/standalone/Docker) hängte Next
  Kopfzeilen wie `location` und `link` doppelt an; eine Weiterleitung der CMS-Fangroute führte so auf „/ziel, /ziel“
  (404). Der Patch überspringt nur Werte, die schon gleich gesetzt sind; Vercel ist nicht betroffen, schadet aber nicht.
  `tests/unit/next-patch.test.ts` prüft, dass die installierte Fassung den Patch trägt. **Bei jedem Next-Update:** prüfen,
  ob der Fehler in der neuen Fassung behoben ist; dann Patch und Eintrag entfernen, sonst den Patch neu erzeugen
  (`pnpm patch next`, `pnpm patch-commit`).

## 8 Entwicklung und Tests (für Entwickelnde)

- Dienste: `docker compose --profile entwicklung up -d db mailpit` (PostgreSQL 127.0.0.1:5432, Mailpit-Oberfläche 127.0.0.1:8025).
- `pnpm dev` (Port 3000), `pnpm check`, `pnpm test:integration` (PGlite je Testdatei), `pnpm test:e2e` (eigene Datenbank `igmg_e2e`, wird je Lauf frisch angelegt), `pnpm messen` (Lighthouse mobil gegen einen laufenden Produktionsserver auf Port 3100).
- Standalone-Server lokal: `pnpm build && PORT=3100 pnpm start:standalone` (setzt `HOSTNAME=0.0.0.0`, E-015).
- Ohne Docker (PostgreSQL und Mailpit als Programme, auch PostgreSQL 16): `tests/e2e/LIESMICH.md` – E2E-Lauf und Wiederherstellungsprobe (`betrieb/lokal/sicherung/probe.sh`).
- **Nicht parallel bauen:** Gleichzeitige `pnpm vercel-build`-Läufe ohne Datenbank (etwa in mehreren Git-Worktrees) teilen sich das Verzeichnis `igmg-pglite-bau` im Temp-Ordner (`/tmp/igmg-pglite-bau`). Das Aufräumen am Ende eines Baus (`rmSync` in `scripts/vercel-bau.mjs`) löscht dabei die Arbeitskopien des anderen Baus, der dann scheitert. Baue nacheinander.

## 9 Betrieb auf Vercel (Services)

Alternative zu Docker: ein Vercel-Projekt mit `vercel.json` im Repository-Wurzelverzeichnis. Einziger Service ist `web` (Wurzel `web/`, Next.js), öffentlich über die Rewrite `/(.*)`. Bindings gibt es nicht – die App ruft keine anderen Services auf. Schritt-für-Schritt-Anleitung zum Livegang: `docs/deploy/VERCEL.md`, Checkliste `docs/GO-LIVE.md`, Variablen `docs/deploy/VERCEL-ENV.md`.

- **Projekteinstellung:** Root Directory leer (Services aus `/vercel.json`) oder `web` (Next.js mit `web/vercel.json`, gleiche Einstellungen); siehe `docs/deploy/VERCEL.md` Abschnitt 0. Funktionen laufen in Frankfurt (`regions: ["fra1"]`), Node 24 (`engines.node` 24.x).
- **Bau (ADR 0019):** Skript `vercel-build` → `scripts/vercel-bau.mjs`. Mit `DATABASE_URL` der Umgebung: Migration unter Sperre (`scripts/migriere-mit-sperre.mjs`), dann `next build` gegen diese Datenbank – vorgerenderte Seiten zeigen sofort die echten Inhalte. Ohne `DATABASE_URL`: Bau mit Beispielinhalten aus einer PGlite-Bau-Datenbank (ADR 0017) und Warnung im Bauprotokoll. Migrationen nur additiv (erweitern → umstellen → aufräumen).
- **Zwischenstände:** Commits mit Betreff „ZWISCHENSTAND …“ erzeugen keine Vorschau (`ignoreCommand` des Service, `scripts/vercel-ignore.mjs`); die Produktion baut immer.
- **Startprüfung:** `src/lib/umgebung.ts` meldet fehlende oder falsche Variablen beim Start (Funktionsprotokoll), im Startklar-Cockpit und in `pnpm startklar`. Auf Vercel entfallen Migration beim Kaltstart und Cache-Erneuerung beim Start (dort lauscht kein Server auf 127.0.0.1; Tags verfallen über `updateTag`/`revalidateTag`).
- **Datenbank (ADR 0018):** Neon über den Vercel Marketplace in Frankfurt; Vorschauen auf eigenen Branches. Der Pool ist auf Vercel klein (`max: 5`) und mit `attachDatabasePool` an den Lebenszyklus der Instanz gebunden.
- **Medien (ADR 0020):** `SPEICHER=blob` mit `BLOB_READ_WRITE_TOKEN` (Vercel Blob, Frankfurt). Das Dateisystem ist auf Vercel schreibgeschützt; `SPEICHER=dateisystem` meldet die Startprüfung als Fehler.
- **Weitere Variablen:** wie in Abschnitt 3, dazu `PROXY_VERTRAUEN=1` (Vercel setzt `X-Forwarded-For` selbst), `CRON_SECRET` (Cron), `SITE_MODE` optional (sonst aus `VERCEL_ENV`). **Nicht** setzen: `MIGRATION_BEIM_START`, `CACHE_ERNEUERN_BEIM_START`, `BAU_PGLITE`.
- **Cron (ADR 0021):** `vercel.json` ruft täglich vier Routen per `GET` mit `Authorization: Bearer <CRON_SECRET>` auf (Tabelle in § 9a); je Aufgabe eine Postgres-Sperre, Läufe sind idempotent. `POST` mit `WARTUNG_TOKEN` bleibt für Docker und Handbetrieb. Die Zahl der Crons kann je Vercel-Tarif begrenzt sein (GO-LIVE C8).
- **Vorschauen (ADR 0022):** `robots.txt` sperrt alles, jede Antwort trägt `X-Robots-Tag: noindex`; Zugang über Vercel Authentication bzw. einen teilbaren Link.
- **Grenzen:** Anfragen an Vercel Functions sind auf 4,5 MB begrenzt. Die Verwaltung nimmt auf Vercel deshalb Anfragen bis 4,2 MB an. Größere Bilder verkleinert der Browser vorher. Mit `SPEICHER=blob` lädt der Browser PDF-Dateien über 4,2 MB (bis 10 MB) direkt in Vercel Blob; die Berechtigung gibt `/verwaltung/medien/direkt`, Übernahme und Prüfung macht die Server Action `hochladen` (ADR 0020, Nachtrag 2026-10-12; `docs/deploy/VERCEL.md` 3.4). Ohne Blob lehnt sie größere PDFs mit Hinweis ab. Inhaltsabfragen liegen mit `'use cache: remote'` im geteilten Cache aller Instanzen, die Tag-Invalidierung wirkt dort überall (ADR 0024); Suche und Tagesdatum bleiben bei `'use cache'` je Instanz.
- **Bilder:** Im Services-Modus bindet Vercel die Bildoptimierung `/_next/image` nicht an (Antwort 404). Beim Bau auf Vercel (`VERCEL=1`) liefert `next/image` die Dateien unoptimiert aus (`images.unoptimized` in `next.config.ts`); Bildvarianten entstehen beim Hochladen (ADR 0020).
- Lokal alle Services zusammen starten: `vercel dev` im Repository-Wurzelverzeichnis.

## 9a Wiederkehrende Aufgaben (Crons und lokaler Takt)

Gleiche Liste in `vercel.json` und `web/vercel.json`. Der lokale Takt (`betrieb/lokal/takt/takt.sh`, ADR 0036) ruft dieselben Routen per `POST` mit `WARTUNG_TOKEN`; seine Uhrzeiten richten sich nach der Uhr des Takt-Containers.

| Route                                | Vercel-Cron (UTC)    | Lokaler Takt            | Wirkung                                                                             |
| ------------------------------------ | -------------------- | ----------------------- | ----------------------------------------------------------------------------------- |
| `/api/wartung/loeschfristen`         | `0 1 * * *` (01:00)  | 03:17                   | Löschfristen (§ 4)                                                                  |
| `/api/wartung/mail-ausgang`          | `0 2 * * *` (02:00)  | alle 5 Minuten          | Mail-Ausgang                                                                        |
| `/api/wartung/dachverband-abgleich`  | `0 4 * * *` (04:00)  | 05:13                   | Freitagspredigten aus dem Hutba-Feed (§ 4d)                                         |
| `/api/wartung/gebetszeiten-abgleich` | `0 20 * * *` (20:00) | 21:07 mit `?nurAktiv=1` | IGMG-Gebetszeiten, nur wenn der Abgleich in der Verwaltung eingeschaltet ist (§ 4c) |

20:00 UTC ist 21:00 Uhr in Wetzlar im Winter und 22:00 Uhr im Sommer; 04:00 UTC ist 05:00 bzw. 06:00 Uhr.
