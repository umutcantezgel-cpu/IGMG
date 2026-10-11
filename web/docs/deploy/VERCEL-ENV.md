# Umgebungsvariablen für Vercel

Stand: 11.10.2026. Zielgruppe: du aus dem Technik-Team, der die Variablen einträgt, und du aus dem Vorstand, der die Angaben prüft.

Dieses Dokument nennt jede Variable der App. Die Liste steht in `web/src/lib/umgebung.ts` (Liste `VARIABLEN`). Dieselbe Liste prüft die Startprüfung und das Startklar-Cockpit (ADR 0022, `web/docs/adr/0022-umgebung-und-betriebsart.md`). Ein Test sorgt dafür, dass jede Variable aus der Liste hier vorkommt (`web/tests/unit/vercel-env-doku.test.ts`).

**Nur Platzhalter.** Dieses Dokument enthält keine echten Werte, keine echten Adressen und keine Zugangsdaten. Trage echte Werte nur direkt in Vercel ein oder im Passwortmanager ab. Nie in Chats, E-Mails, Screenshots oder ins Repository.

## So liest du die Tabellen

- **Pflicht entwicklung / vorschau / produktion:** „ja“ heißt: Die Startprüfung meldet einen Fehler, wenn der Wert in dieser Betriebsart fehlt und die Variable gilt. „nein“ heißt: Der Wert ist nicht verpflichtend. Die Angabe „nein“ bedeutet nicht, dass die Variable überflüssig ist. Lies dafür die Spalte „gilt nur wenn“ und die Herkunft.
- **Betriebsarten:** `entwicklung` (lokal), `vorschau` (Vorschau auf Vercel), `produktion` (öffentliche Seite auf Vercel). Die Betriebsart legt `SITE_MODE` fest, sonst `VERCEL_ENV`, sonst `NODE_ENV` (ADR 0022).
- **Bereich auf Vercel:** Production, Preview oder Development. „–“ heißt: nicht auf Vercel setzen.
- **geheim:** „ja“ heißt: Der Wert ist ein Geheimnis. Trage ihn bei Vercel als **Sensitive** ein. Das geht nur für Preview und Production, nicht für Development (https://vercel.com/docs/environment-variables/sensitive-environment-variables; https://vercel.com/docs/cli/env).
- **Pflichtwert:** `PROXY_VERTRAUEN` muss in Vorschau und Produktion genau `1` sein.

## 1. Von Menschen eingetragen

Diese Variablen trägst du selbst ein. Die Werte stehen in Vercel je Bereich (Production und Preview).

| Name | Zweck | Pflicht entwicklung | Pflicht vorschau | Pflicht produktion | Bereich auf Vercel | gilt nur wenn | Beispiel | Herkunft | geheim |
|---|---|---|---|---|---|---|---|---|---|
| `APP_URL` | Öffentliche Adresse der Website; Grundlage für Links in Mails, Metadaten und Sicherheitsheader | nein | nein | ja | Production, Preview | – | `https://<domain der Gemeinde>` | Von Menschen (Domain, `web/docs/BETRIEB.md` § 2). In der Vorschau leer lassen: Die App nimmt dann die Branch-Adresse aus `VERCEL_BRANCH_URL`. Fehlen beide, ist das ein Fehler (`web/src/lib/umgebung.ts` Zeile 784–794). Muss `https://` sein. | nein |
| `BETTER_AUTH_URL` | Adresse der Anmeldung (Better Auth); fehlt sie, gilt `APP_URL` | nein | nein | nein | Production, Preview | – | `https://<domain der Gemeinde>` | Von Menschen. Gleich `APP_URL` halten; abweichend ist es eine Warnung (`umgebung.ts` Zeile 804–806). | nein |
| `SITE_MODE` | Betriebsart: `entwicklung`, `vorschau` oder `produktion`; leer heißt: aus `VERCEL_ENV` bzw. `NODE_ENV` | nein | nein | nein | Production, Preview, Development | – | `vorschau` | Von Menschen je Vercel-Bereich: Vorschau = `vorschau`, Produktion = `produktion` (ADR 0022; AUFTRAG V-03). Fehlt die Variable, meldet die Startprüfung einen Hinweis. | nein |
| `PROXY_VERTRAUEN` | Vertraut dem vorgeschalteten Proxy, damit Ratenbegrenzungen die echte Besucheradresse sehen (E-041) | nein | ja (Wert `1`) | ja (Wert `1`) | Production, Preview | – | `1` | Von Menschen. Auf Vercel `1`, weil Vercel `X-Forwarded-For` selbst setzt (`web/docs/BETRIEB.md` § 9; `web/.env.example`). | nein |
| `MAIL_TRANSPORT` | Mailweg: `smtp` (echter Dienst) oder `datei` (nur lokal) | nein | ja | ja | Production, Preview | – | `smtp` | Von Menschen. Im Betrieb immer `smtp`. In der Produktion ohne `SMTP_HOST` bricht der Versand mit einem Fehler ab (`web/src/lib/mail/transport.ts` Zeile 12–20). | nein |
| `MAIL_ABSENDER` | Absenderadresse der Mails, optional mit Anzeigename | nein | nein | ja | Production, Preview | – | `IGMG Wetzlar <noreply@<domain der Gemeinde>>` | Von Menschen. Die Domain braucht SPF, DKIM und DMARC (ML-10 in `_werkstatt/MENSCHEN.md`). Ohne Angabe nutzt der Code `noreply@example.test` (`web/src/lib/mail/transport.ts` Zeile 35). Eine Platzhalterdomain ist in der Produktion ein Fehler (`umgebung.ts` Zeile 813–819). | nein |
| `SMTP_HOST` | Mailserver (SMTP) | nein | ja | ja | Production, Preview | nur bei `MAIL_TRANSPORT=smtp` (im Betrieb immer) | `<smtp-host des Mailanbieters>` | Mailanbieter (ML-10, noch offen). Lokal Mailpit auf `localhost`. | nein |
| `SMTP_PORT` | Port des Mailservers | nein | nein | nein | Production, Preview | nur bei SMTP | `587` | Mailanbieter: 587 mit STARTTLS, 465 mit TLS. Standard 587. | nein |
| `SMTP_SECURE` | TLS direkt beim Verbindungsaufbau; `true` nur bei Port 465 | nein | nein | nein | Production, Preview | nur bei SMTP | `false` | Mailanbieter. Wert `true` oder `false`. | nein |
| `SMTP_USER` | Benutzername für den Mailversand | nein | nein | nein | Production, Preview | nur bei SMTP | `<Benutzername des Postfachs>` | Mailanbieter. Der Code führt diesen Wert nicht als Geheimnis (`umgebung.ts` Zeile 422–435); behandle ihn trotzdem wie ein Zugangsdatum. | nein |
| `SMTP_PASS` | Passwort für den Mailversand (mit `SMTP_USER`) | nein | ja | ja | Production, Preview | nur bei SMTP und gesetztem `SMTP_USER` | `<Passwort des Postfachs>` | Mailanbieter; vom Anbieter vergeben, nicht erzeugbar. | ja |
| `DATABASE_URL` | PostgreSQL-Verbindung für Inhalte, Konten, Eingänge und Audit | nein | ja | ja | Production, Preview | – | `postgres://<nutzer>:<…>@<host>:5432/<datenbank>` | Vercel Marketplace (Neon, Frankfurt, ADR 0018). Die Vorschau nutzt einen eigenen Neon-Zweig und nie die Produktionsdatenbank (AUFTRAG V-04). Zum Bau siehe Abschnitt „Was der Bau braucht“. Verbindung mit Pooler-Adresse und `sslmode=require` (ADR 0018). | ja |
| `SPEICHER` | Ablage der Medien: `dateisystem`, `s3` oder `blob` | nein | nein | nein | Production, Preview | – | `s3` | Von Menschen. Auf Vercel ist das Dateisystem schreibgeschützt; `dateisystem` ist dort ein Fehler der Startprüfung (ADR 0020). **Offene Frage:** Der Code hat einen Blob-Adapter (`web/src/lib/storage/index.ts` Zeile 96 und 124–125). Die Startprüfung meldet `blob` aber als „noch nicht angebunden“ (`umgebung.ts` Zeile 829–835). Die Technik klärt, welcher Stand gilt. | nein |
| `S3_ENDPUNKT` | Adresse eines S3-kompatiblen Speichers (außer AWS) | nein | nein | nein | Production, Preview | nur bei `SPEICHER=s3` | `https://<endpunkt des Speicheranbieters>` | Speicheranbieter. Bei AWS leer lassen. | nein |
| `S3_REGION` | Region des Speichers; Standard `eu-central-1` (Frankfurt) | nein | nein | nein | Production, Preview | nur bei `SPEICHER=s3` | `eu-central-1` | Speicheranbieter. | nein |
| `S3_BUCKET` | Name des Speicher-Buckets für die Medien | nein | ja | ja | Production, Preview | nur bei `SPEICHER=s3` | `<bucket-name>` | Speicheranbieter; Bucket in der EU. | nein |
| `S3_ZUGANG` | Zugangsschlüssel (Kennung) für den Speicher | nein | ja | ja | Production, Preview | nur bei `SPEICHER=s3` | `<Zugangsschlüssel-Kennung>` | Speicheranbieter; vom Anbieter vergeben, nicht erzeugbar. | ja |
| `S3_GEHEIMNIS` | Geheimer Zugangsschlüssel für den Speicher | nein | ja | ja | Production, Preview | nur bei `SPEICHER=s3` | `<geheimer Zugangsschlüssel>` | Speicheranbieter; vom Anbieter vergeben, nicht erzeugbar. | ja |
| `BLOB_READ_WRITE_TOKEN` | Zugang zu Vercel Blob (`SPEICHER=blob`) | nein | ja | ja | Production, Preview | nur bei `SPEICHER=blob` | `<von Vercel gesetzt>` | Vercel setzt ihn, sobald der Blob-Speicher mit dem Projekt verbunden ist (AUFTRAG V-05; ADR 0020). `vercel blob create-store` verbindet mit `--yes` das Projekt (https://vercel.com/docs/cli/blob). Den Namen des Tokens belegt die Vercel-Doku nicht [prüfen]. Die Region Frankfurt für Blob ist nicht belegt [prüfen]; die CLI nennt als Standard `iad1`. | ja |

## 2. Auf Vercel nicht setzen

Diese Variablen setzt der Docker-Betrieb oder das Bauskript. Auf Vercel würden sie bei jedem Kaltstart einer Instanz etwas tun (`web/docs/BETRIEB.md` § 9). Trage sie nicht ein. Die Startprüfung meldet `1` als Warnung.

| Name | Zweck | Pflicht entwicklung | Pflicht vorschau | Pflicht produktion | Bereich auf Vercel | gilt nur wenn | Beispiel | Herkunft | geheim |
|---|---|---|---|---|---|---|---|---|---|
| `MIGRATION_BEIM_START` | Wendet beim Start der App die Migrationen an | nein | nein | nein | – | – | `1` | Docker-Image setzt `1`. Auf Vercel nicht setzen (`web/docs/BETRIEB.md` § 9). Migrationen laufen auf Vercel im Bau unter Sperre (ADR 0019). | nein |
| `CACHE_ERNEUERN_BEIM_START` | Lässt beim Start die vorgerenderten Inhalte verfallen (ADR 0017) | nein | nein | nein | – | – | `0` | Docker-Image und `web/.env.example` setzen `0`. Auf Vercel nicht setzen. Tags verfallen dort über `updateTag` und `revalidateTag` (ADR 0019). | nein |
| `BAU_PGLITE` | Erlaubt den Bau ohne Produktionsdatenbank (vorgerenderte Seiten, ADR 0017) | nein | nein | nein | – | – | `1` | Setzt `web/scripts/vercel-bau.mjs` selbst. Nicht eintragen. | nein |
| `PGLITE_VERZEICHNIS` | Datenordner der eingebetteten Datenbank (PGlite); nur ohne `DATABASE_URL` | nein | nein | nein | Development (nur lokal) | nur ohne `DATABASE_URL` | `.pglite` | Lokal (Standard `.pglite`) für Entwicklung und Tests. Auf Vercel nicht setzen. | nein |

## 3. Von Vercel gesetzt

Diese Variablen setzt Vercel selbst. Trage sie nie von Hand ein (`web/.env.example` Zeilen 4–5). Die App liest `VERCEL`, `VERCEL_ENV`, `VERCEL_URL` und `VERCEL_BRANCH_URL`, um die Betriebsart und die Adresse abzuleiten (`web/src/lib/umgebung.ts`). `VERCEL_PROJECT_PRODUCTION_URL` steht nur in der Liste; der Code liest sie nicht.

| Name | Zweck | Pflicht entwicklung | Pflicht vorschau | Pflicht produktion | Bereich auf Vercel | gilt nur wenn | Beispiel | Herkunft | geheim |
|---|---|---|---|---|---|---|---|---|---|
| `VERCEL` | Kennzeichen, dass die App auf Vercel läuft | nein | nein | nein | Production, Preview, Development | – | `1` | Vercel setzt sie automatisch. Die App prüft `VERCEL=1` für `CRON_SECRET` und Datenbank-Pool (`web/src/lib/db/index.ts` Zeile 42). | nein |
| `VERCEL_ENV` | Vercel-Bereich des Deployments; Grundlage der Betriebsart | nein | nein | nein | Production, Preview, Development | – | `production` | Vercel setzt `production`, `preview` oder `development`. Die Betriebsart folgt daraus, wenn `SITE_MODE` leer ist (ADR 0022). | nein |
| `VERCEL_URL` | Adresse dieses Deployments, ohne `https://` | nein | nein | nein | Production, Preview, Development | – | `<deployment>.vercel.app` | Vercel setzt sie automatisch. Ohne Protokoll: Die Vercel-Doku beschreibt das für die verwandte Variable `REACT_APP_VERCEL_URL` (https://vercel.com/docs/llms-full.txt). | nein |
| `VERCEL_BRANCH_URL` | Adresse des Branch-Deployments, ohne `https://`; Grundlage der Vorschau-Adresse | nein | nein | nein | Production, Preview, Development | – | `<branch>-<projekt>.vercel.app` | Vercel setzt sie automatisch. Die App nutzt sie in der Vorschau, wenn `APP_URL` fehlt (ADR 0022). | nein |
| `VERCEL_PROJECT_PRODUCTION_URL` | Produktionsadresse des Vercel-Projekts, ohne `https://` | nein | nein | nein | Production, Preview, Development | – | `<projekt>.vercel.app` | Vercel setzt sie automatisch. | nein |

**Zusätzlich, nicht in der Liste `VARIABLEN`:**

- `VERCEL_REGION` setzt Vercel für laufende Funktionen. Die App liest sie nicht. Vercel nennt sie als Systemvariable (https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package, `getEnv()`).
- `VERCEL_GIT_COMMIT_MESSAGE` liest `web/scripts/vercel-ignore.mjs`, damit Zwischenstände ohne Vorschau-Bau bleiben (`web/docs/BETRIEB.md` § 9). Die Liste `VARIABLEN` nennt sie nicht. **Hinweis an die Technik:** Entscheide, ob die Liste sie aufnehmen soll.

## 4. Nur Docker oder lokal

Diese Variablen gelten für den Docker-Betrieb oder für die lokale Entwicklung. Auf Vercel setzt du sie nicht.

| Name | Zweck | Pflicht entwicklung | Pflicht vorschau | Pflicht produktion | Bereich auf Vercel | gilt nur wenn | Beispiel | Herkunft | geheim |
|---|---|---|---|---|---|---|---|---|---|
| `MIGRATIONEN_VERZEICHNIS` | Ordner mit den Migrationsdateien, wenn er vom Standard abweicht | nein | nein | nein | – | – | `/app/drizzle/migrations` | Docker-Image. Sonst nicht setzen. | nein |
| `MEDIEN_VERZEICHNIS` | Ordner für hochgeladene Medien im Dateisystem | nein | nein | nein | – | nur bei `SPEICHER=dateisystem` | `/app/.medien` | Docker-Image und lokal (Standard `.medien`). | nein |
| `PORT` | Port des Servers (Standalone und Docker) | nein | nein | nein | – | – | `3000` | Lokal und Docker (Standard 3000). Auf Vercel nicht nötig. | nein |
| `HOSTNAME` | Adresse, auf der der Standalone-Server lauscht | nein | nein | nein | – | – | `0.0.0.0` | Standalone-Server (Docker, `pnpm start:standalone`). | nein |

## 5. Geheimnisse

Diese Variablen sind Geheimnisse. Die ersten sechs erzeugt das Skript `pnpm geheimnisse:erzeugen`. Die übrigen trägt der Anbieter oder du selbst ein.

| Name | Zweck | Pflicht entwicklung | Pflicht vorschau | Pflicht produktion | Bereich auf Vercel | gilt nur wenn | Beispiel | Herkunft | geheim |
|---|---|---|---|---|---|---|---|---|---|
| `BETTER_AUTH_SECRET` | Schlüssel für Sitzungen und Anmeldung (Better Auth) | nein | ja | ja | Production, Preview | – | `<mindestens 32 Zeichen, nie ein echter Wert im Repository>` | `pnpm geheimnisse:erzeugen`. Erzeugbar, 44 Zeichen. | ja |
| `EINGANG_SCHLUESSEL` | AES-256-Schlüssel für die verschlüsselten Formulareingänge | nein | ja | ja | Production, Preview | – | `<32 Byte als Base64, 44 Zeichen, nie ein echter Wert im Repository>` | `pnpm geheimnisse:erzeugen`. Getrennt vom Datenbank-Backup sichern (`web/docs/BETRIEB.md` § 3). Ohne ihn sind die Eingänge nach einer Wiederherstellung nicht lesbar. | ja |
| `EINGANG_SCHLUESSEL_ID` | Kennung des aktuellen Eingangsschlüssels (für die Rotation) | nein | nein | nein | Production, Preview | – | `1` | Von Menschen. Standard `1` (`web/.env.example`); bei einer Rotation hochzählen. | nein |
| `EINGANG_SCHLUESSEL_ALT_<ID>` | Alter Eingangsschlüssel bei einer Rotation, damit ältere Eingänge lesbar bleiben. `<ID>` ist die alte Kennung. | nein | nein | nein | Production | nur bei einer Schlüsselrotation | `<32 Byte als Base64, nie ein echter Wert im Repository>` | Nur bei einer Rotation. Das Skript erzeugt diese Variable nicht; der bisherige Schlüssel bleibt zum Lesen. | ja |
| `RATE_GEHEIMNIS` | Geheimnis für den IP-Hash der Ratenbegrenzung (die IP steht nie im Klartext) | nein | ja | ja | Production, Preview | – | `<mindestens 32 Zeichen, nie ein echter Wert im Repository>` | `pnpm geheimnisse:erzeugen` (`scripts/geheimnisse-erzeugen.mjs`). | ja |
| `ALTCHA_GEHEIMNIS` | Geheimnis für die signierten ALTCHA-Aufgaben (Spam-Schutz der Formulare) | nein | ja | ja | Production, Preview | – | `<mindestens 32 Zeichen, nie ein echter Wert im Repository>` | `pnpm geheimnisse:erzeugen`. | ja |
| `WARTUNG_TOKEN` | Zugang zu den Wartungsrouten (POST, Bearer-Token), z. B. Cache-Erneuerung | nein | ja | ja | Production, Preview | – | `<mindestens 32 Zeichen, nie ein echter Wert im Repository>` | `pnpm geheimnisse:erzeugen` (64 Zeichen, URL-sicher). | ja |
| `CRON_SECRET` | Schutz der Cron-Aufrufe; Vercel schickt ihn als Bearer-Token mit | nein | nein | ja (nur auf Vercel, `VERCEL=1`) | Production | nur mit `VERCEL=1` | `<mindestens 32 Zeichen, nie ein echter Wert im Repository>` | `pnpm geheimnisse:erzeugen`. Vercel Cron nutzt den Wert selbst (AUFTRAG V-06). Nur Production: Vorschauen haben keine Crons (ADR 0021). | ja |

## 6. Geheimnisse erzeugen

Das Skript `web/scripts/geheimnisse-erzeugen.mjs` erzeugt die Werte aus einer sicheren Zufallsquelle. Es schreibt nie ins Repository und ruft keine Dienste auf. Es erzeugt diese sechs Variablen: `BETTER_AUTH_SECRET`, `EINGANG_SCHLUESSEL`, `RATE_GEHEIMNIS`, `ALTCHA_GEHEIMNIS`, `WARTUNG_TOKEN` und `CRON_SECRET`.

**Schritte für Vorschau und Produktion:**

1. Wechsle in den Ordner `web/`.
2. Erzeuge die Werte in eine **neue Datei außerhalb des Repositorys**:
   `pnpm geheimnisse:erzeugen --datei <pfad außerhalb des Repositorys>`.
   Die Datei bekommt die Rechte 600. Eine bestehende Datei überschreibt das Skript nie. Pfade im Repository lehnt es ab.
3. **Ohne `--datei` erscheinen die Werte auf dem Bildschirm.** Nutze diese Form nur, wenn niemand mitliest und nichts mitgeschrieben wird.
4. **Getrennte Werte für Vorschau und Produktion:** Erzeuge die Werte zweimal, in zwei Dateien. Nimm nie dieselben Werte in beiden Bereichen. `CRON_SECRET` brauchst du nur für Production (Abschnitt 5).
5. **Befehle für Vercel:** `pnpm geheimnisse:erzeugen --vercel` gibt nur Befehle aus, ohne Werte. Sie gelten nur für **Production**. Für die Vorschau ergänzt du die Befehle von Hand, zum Beispiel `vercel env add NAME preview` (https://vercel.com/docs/cli/env). Die CLI fragt den Wert ab.
6. Trage die Werte in Vercel ein, je Bereich, und setze **Sensitive** (Abschnitt Hinweis „So liest du die Tabellen“).
7. Lege die Werte im Passwortmanager ab. Lösche danach die Datei [Empfehlung].

**Regeln:** Die Werte nie in das Repository, in Berichte oder in Bildschirmfotos übernehmen (`geheimnisse-erzeugen.mjs`, Ausgabe am Ende). Bei einer Umstellung zählt der Wert aus Vercel, nicht die Datei.

**Prüfpunkt:** Alle Namen aus diesem Dokument stehen in Vercel. Die Werte sind verdeckt.

**Hinweis:** `pnpm geheimnisse:pruefen` gibt es laut `web/package.json`. Was es genau prüft, ist hier nicht belegt [prüfen].

## 7. Was der Bau braucht

Vercel führt bei jedem Deployment das Skript `vercel-build` aus. Die Datei `web/package.json` (Zeile 8) zeigt auf `node scripts/vercel-bau.mjs` (ADR 0019).

- **Mit `DATABASE_URL` der Umgebung:** Das Skript führt zuerst die Migration unter einer Sperre aus (`web/scripts/migriere-mit-sperre.mjs`, `pg_advisory_lock`). Danach baut es die App gegen diese Datenbank. Die vorgerenderten Seiten zeigen dann sofort die echten Inhalte dieser Umgebung.
- **Ohne `DATABASE_URL`:** Das Skript warnt im Bauprotokoll und baut mit Beispielinhalten aus einer Bau-Datenbank (ADR 0017). Setzt das Skript `BAU_PGLITE` selbst; du trägst nichts ein.
- **Was du trägst:** `DATABASE_URL` im Bereich **Preview** (der Neon-Zweig der Vorschau) und im Bereich **Production** (der Produktionszweig). Ohne sie ist die Vorschau mit Beispielinhalten gebaut. Das siehst du im Bauprotokoll.
- **Gute Zeile:** `[bau] Datenbank vorhanden (…)`. **Warnzeile:** `[bau] WARNUNG: DATABASE_URL fehlt`.
- **Migrationen sind additiv:** erweitern, dann umstellen, dann aufräumen, in getrennten Auslieferungen (ADR 0019).
- **Abweichung:** `web/docs/deploy/VERCEL.md` (Stand-Tabelle, Abschnitt 5.2 und 8) beschreibt noch den alten Stand von `vercel-build`. Die Datei `web/package.json` zeigt heute auf `scripts/vercel-bau.mjs`. Die Technik gleicht VERCEL.md an.

## 8. Offene Punkte

- **Blob-Adapter:** Der Code hat `BlobSpeicher` (`web/src/lib/storage/index.ts`), die Startprüfung meldet `blob` als nicht angebunden (`web/src/lib/umgebung.ts`). Die Technik entscheidet, welcher Stand gilt [prüfen].
- **Region Blob:** Frankfurt (`fra1`) für Vercel Blob ist nicht belegt; die CLI nennt `iad1` als Standard (https://vercel.com/docs/cli/blob) [prüfen].
- **Region Datenbank:** `aws-eu-central-1` laut ADR 0018 ist in der Vercel-Doku nicht belegt. Prüfe die Region im Neon-Dashboard [prüfen].
- **Cron auf Hobby:** Ob ein täglicher Lauf mit stündlicher Genauigkeit auf dem Hobby-Tarif gilt, ist nicht belegt [prüfen] (AUFTRAG V-06).
- **Liste:** `VERCEL_GIT_COMMIT_MESSAGE` fehlt in `VARIABLEN` (siehe Abschnitt 3).

## Belege

- `web/src/lib/umgebung.ts`: Liste `VARIABLEN`, Prüfregeln, Betriebsart.
- `web/.env.example`: Vorlage mit Kommentaren zu Vercel-Variablen.
- `web/docs/adr/0018` bis `0022`: Datenbank, Bau, Medien, Cron, Umgebung.
- `web/docs/BETRIEB.md` § 2, § 3, § 9.
- `web/scripts/vercel-bau.mjs`, `web/scripts/geheimnisse-erzeugen.mjs`, `web/scripts/vercel-ignore.mjs`.
- Vercel-Doku (nur gelesen): https://vercel.com/docs/cli/env, https://vercel.com/docs/cli/blob, https://vercel.com/docs/cli/install, https://vercel.com/docs/environment-variables/sensitive-environment-variables, https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package, https://vercel.com/docs/llms-full.txt.
