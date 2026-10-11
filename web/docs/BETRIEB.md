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
- `POST /api/wartung/loeschfristen` – löscht Eingänge nach Ablauf der Fristen (folgt in Welle C; täglich per Cron aufrufen).

## 5 Caching – was Betreuende wissen müssen

- Öffentliche Seiten sind statisch vorgerendert und werden nach Änderungen in der Verwaltung sofort neu erzeugt (zweistufig: sofort und nach 5 s, E-025).
- Der Seiten-Cache liegt im Container (`.next/server/app`). Ein Neustart verwirft ihn nicht, die Erneuerung beim Start macht ihn aber ungültig. **Nur eine App-Instanz betreiben** (mehrere Instanzen bräuchten einen gemeinsamen Cache-Handler).

## 5a Vorgeschalteter Proxy (TLS)

Die App erwartet einen Reverse-Proxy (z. B. Caddy oder nginx) für HTTPS. Er muss die Adresse der Besucherin bzw. des Besuchers **anhängen** (`X-Forwarded-For`, z. B. nginx `$proxy_add_x_forwarded_for`): Die Ratenbegrenzungen nutzen den letzten Eintrag (`src/lib/sicherheit/ip.ts`). Ohne Proxy-Header zählen alle Anfragen gemeinsam – das bremst eher zu viel als zu wenig.

## 6 Datensicherung

- Täglich: `docker compose exec db pg_dump -U igmg -Fc igmg > sicherung-$(date +%F).dump`
- Medien-Volume mitsichern.
- `EINGANG_SCHLUESSEL` separat und sicher aufbewahren (siehe Abschnitt 3).
- Wiederherstellung testen (mindestens einmal je Quartal).

## 7 Aktualisierungen

- Next.js-Sicherheitsupdates zeitnah einspielen (`pnpm view next version`, Paket-Update, `pnpm build`, Tests, neues Image).
- `pnpm audit --prod` vor jeder Aktualisierung des Images.

## 8 Entwicklung und Tests (für Entwickelnde)

- Dienste: `docker compose --profile entwicklung up -d db mailpit` (PostgreSQL 127.0.0.1:5432, Mailpit-Oberfläche 127.0.0.1:8025).
- `pnpm dev` (Port 3000), `pnpm check`, `pnpm test:integration` (PGlite je Testdatei), `pnpm test:e2e` (eigene Datenbank `igmg_e2e`, wird je Lauf frisch angelegt), `pnpm messen` (Lighthouse mobil gegen einen laufenden Produktionsserver auf Port 3100).
- Standalone-Server lokal: `pnpm build && PORT=3100 pnpm start:standalone` (setzt `HOSTNAME=0.0.0.0`, E-015).
