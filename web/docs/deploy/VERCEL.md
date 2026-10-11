# Vercel: Vom Entwurf zum Livegang in etwa 30 Minuten

Stand: 11.10.2026. Zielgruppe: du aus dem Technik-Team und du aus dem Vorstand, der die Abnahme macht.

Dieses Dokument führt dich Schritt für Schritt von der fertigen Vorschau bis zur öffentlichen Seite unter deiner Domain. Die Summe der Zeitschätzungen liegt bei rund 35 bis 40 Minuten. Das Ziel laut Auftrag sind 30 Minuten (AUFTRAG V-13). Dazu kommen Wartezeiten, vor allem für die DNS-Einträge (Abschnitte 6 und 7).

## Bevor du anfängst

Du brauchst:

- ein Konto im Vercel-Team, das das Projekt `igmg` verwaltet,
- Zugriff auf das GitHub-Repository,
- Zugang zur Verwaltung deiner Domain (dort, wo die Domain registriert ist),
- einen Passwortmanager für die Geheimnisse aus Abschnitt 4,
- den Mailanbieter. Er ist noch offen, siehe `web/docs/GO-LIVE.md` und MENSCHEN.md.

Bitte keine Geheimnisse in Chats, E-Mails, Screenshots oder ins Repository kopieren.

## So liest du dieses Dokument

- **Ort:** Wo du klickst. Die Angabe „Team › Projekt › Settings › …“ meint: im Vercel-Dashboard zuerst das Team wählen, dann das Projekt `igmg`, dann im Menü „Settings“ den genannten Punkt.
- **[prüfen]:** Diese Angabe konnte ich nicht gegen die Vercel-Dokumentation belegen. Bitte beim ersten Durchgang am Bildschirm bestätigen, nicht raten. Das gilt für alle Menüpfade, weil die Vercel-Doku für sie keine Fundstelle lieferte.
- **Belege:** Verweise wie `web/docs/BETRIEB.md` § 9 zeigen auf den Ort im Repository. Vercel-Angaben haben die Dokumentations-Adresse dabei.
- **Prüfpunkt:** „Das siehst du, wenn es geklappt hat.“

## Zeitplan

| Abschnitt | Was                                                                     | Aufwand           | Wer                    |
| --------- | ----------------------------------------------------------------------- | ----------------- | ---------------------- |
| 1         | Projekt prüfen (Region, Node, Stammordner)                              | 3 min             | Technik                |
| 2         | Datenbank in Frankfurt                                                  | 5 min             | Technik                |
| 3         | Dateispeicher in Frankfurt                                              | 3 min             | Technik                |
| 4         | Umgebungsvariablen und Geheimnisse                                      | 6 min             | Technik                |
| 5         | Vorschau prüfen und Link für den Vorstand                               | 4 min             | Technik, dann Vorstand |
| 6         | Domain verbinden                                                        | 3 min + Wartezeit | Technik                |
| 7         | E-Mail-DNS (SPF, DKIM, DMARC)                                           | 3 min + Wartezeit | Technik                |
| 8 bis 10  | Migrationen, Crons und Zusammenführen auf `main`                        | 3 min             | Technik                |
| 11        | Schnellprüfung der Hauptseiten (die volle Abnahme steht in GO-LIVE, E2) | 5 min             | Vorstand               |
| 12        | Zurückrollen                                                            | 3 min (Übung)     | Technik                |

Die Zeiten sind Schätzungen **[prüfen: beim ersten Durchgang messen]**.

## Stand: Was im Code schon da ist

Alle Code-Bausteine für den Livegang sind vorhanden (Stand 2026-10-11, Branch `claude/blissful-edison-x3j16w`). Was bleibt, sind die Schritte in diesem Runbook – Konten, Werte, Domain.

| Baustein                                                                                                 | Stand                                                               | Beleg                                                             |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `vercel.json` (Repository-Wurzel) mit Dienst `web`, `regions` (fra1), `crons`, `ignoreCommand` im Dienst | vorhanden, geprüft mit der Konfigurationsprüfung der Vercel CLI     | `/vercel.json`; ADR 0021                                          |
| Bau nach ADR 0019 (`vercel-build` → `scripts/vercel-bau.mjs`, Migration unter Sperre)                    | vorhanden; Vorschau-Bau grün (ohne Datenbank: Warnung im Protokoll) | `web/package.json`; ADR 0019                                      |
| Vercel Blob (`SPEICHER=blob`), Bildvarianten, Verkleinern im Browser                                     | vorhanden                                                           | `web/src/lib/storage/index.ts`; ADR 0020                          |
| Betriebsart `SITE_MODE`, Umgebungsprüfung beim Start                                                     | vorhanden                                                           | `web/src/lib/umgebung.ts`, `web/src/instrumentation.ts`; ADR 0022 |
| `pnpm geheimnisse:erzeugen`                                                                              | vorhanden                                                           | `web/package.json`, Zeile 26                                      |
| Crons: Löschfristen 01:00 UTC, Mail-Ausgang 02:00 UTC                                                    | vorhanden                                                           | `/vercel.json`, Abschnitt `crons`; ADR 0021                       |
| Inhalte im geteilten Cache (`'use cache: remote'`)                                                       | vorhanden; Kosten im Tarif **[prüfen]**                             | `web/src/server/queries/`; ADR 0024                               |
| `noindex` für Vorschauen (robots.txt, `X-Robots-Tag`)                                                    | vorhanden                                                           | `web/src/app/robots.ts`, `web/src/lib/sicherheit/header.ts`       |
| Startklar-Cockpit (`/verwaltung/startklar`) und `pnpm startklar`                                         | vorhanden                                                           | `web/src/lib/startklar/pruefungen.ts`                             |
| `docs/deploy/VERCEL-ENV.md`                                                                              | vorhanden                                                           | ADR 0022                                                          |

## 1. Projekt prüfen (3 Minuten)

Das Projekt `igmg` ist bereits als Services-Projekt importiert. Du musst es nicht neu anlegen. Prüfe nur die Einstellungen.

**1.1 Stammordner leer lassen**

- **Ort:** Team › Projekt `igmg` › Settings › General **[prüfen]**, Feld „Root Directory“.
- **Aufwand:** 1 Minute.
- **Regel:** Das Feld bleibt leer, weil Vercel `vercel.json` nur im Stamm des Repositorys liest (`web/docs/BETRIEB.md` § 9, erster Punkt).
- **Das siehst du, wenn es geklappt hat:** Das Feld ist leer.

**1.2 Region Frankfurt**

- **Ort:** Team › Projekt `igmg` › Settings › Functions **[prüfen]**, Bereich „Function Region“.
- **Aufwand:** 1 Minute.
- **Regel:** Die Funktionen sollen in `fra1` (Frankfurt) laufen (AUFTRAG V-01). Ohne Angabe nutzt Vercel die Standardregion `iad1` (Washington; AUFTRAG V-01; https://vercel.com/docs/llms-full.txt). Die Konfiguration beschreibt https://vercel.com/docs/functions/configuring-functions/region. Auf dem Hobby-Tarif ist jede einzelne Region erlaubt (https://vercel.com/docs/project-configuration/vercel-ts), also auch `fra1`.
- **Offen:** Ob die Region im Services-Modus auch über `vercel.json` gilt, ist nicht geklärt **[prüfen]** (`_werkstatt/berichte/E0-KUNDSCHAFTER-06.md`, offene Frage 2). Im Repository steht `"regions": ["fra1"]` bereits in `/vercel.json` (Zeile 3).
- **Das siehst du, wenn es geklappt hat:** „fra1“ bzw. Frankfurt steht als Funktionsregion.

**1.3 Node-Version festlegen**

- **Ort:** Team › Projekt `igmg` › Settings › General **[prüfen]**, Feld „Node.js Version“.
- **Aufwand:** 1 Minute.
- **Regel:** Vercel unterstützt eine feste Version wie `24.x` (https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). `web/package.json` legt `24.x` bereits fest (Zeile 114, Feld `engines`). Prüfe nur, dass das Feld in Vercel dazu passt.
- **Das siehst du, wenn es geklappt hat:** `24.x`.

**1.4 Produktionsbranch ist `main`**

- **Ort:** Team › Projekt `igmg` › Settings › Git **[prüfen]**, Feld „Production Branch“.
- **Aufwand:** 1 Minute.
- **Regel:** Jeder Stand auf `main` wird zur Produktion (`_werkstatt/ENTSCHEIDUNGEN.md` L-E01).
- **Das siehst du, wenn es geklappt hat:** Dort steht `main`.

## 2. Datenbank in Frankfurt (5 Minuten)

Die Datenbank ist PostgreSQL. Wir nutzen Neon über den Vercel Marketplace. Der Marketplace richtet die Datenbank für das Projekt ein (https://vercel.com/docs/storage; https://vercel.com/docs/cli/install).

**2.1 Neon installieren**

- **Ort:** Team › Projekt `igmg` › Storage **[prüfen]**, dann „Marketplace“ bzw. „Create Database“, Anbieter „Neon“ **[prüfen]**.
- **Alternative auf der Kommandozeile:** `vercel install neon` (https://vercel.com/docs/cli/install).
- **Aufwand:** 2 Minuten.
- **Regel:** Die Datenbank liegt in Frankfurt, Region `aws-eu-central-1` (ADR 0018, Weg 1). **Die Region ist in der Vercel-Doku nicht belegt [prüfen]**: Wähle sie im Dialog und lies sie im Neon-Dashboard nach.
- **Das siehst du, wenn es geklappt hat:** Die Datenbank ist im Projekt unter Storage aufgeführt, und die Region in Neon zeigt Frankfurt **[prüfen]**.

**2.2 Vorschau-Zweige anlegen lassen**

- **Ort:** Im Neon-Dialog oder unter Team › Projekt › Storage **[prüfen]**: Einstellung zu Branches bzw. Vorschau.
- **Aufwand:** 2 Minuten.
- **Regel:** Jede Vorschau bekommt einen eigenen Datenbank-Zweig. Die Vorschau darf nie die Produktionsdatenbank berühren (ADR 0018, Festlegungen; AUFTRAG V-04). Ob die Integration das automatisch tut **[prüfen]**, die Vercel-Doku nennt das nicht.
- **Das siehst du, wenn es geklappt hat:** In Neon gibt es einen Zweig, dessen Name zur Vorschau passt, und die Produktion hat einen eigenen Zweig.

**2.3 Verbindungsadresse bereitstellen**

- **Regel:** Die Adresse heißt `DATABASE_URL`. Diese Adresse nutzt die Zwischenstelle „Pooler“ (eine Verbindungsbündelung für viele gleichzeitige Anfragen), erkennbar am Namensteil `-pooler`, und `sslmode=require` (ADR 0018, Festlegungen).
- **Wo:** Die Adresse trägst du in Abschnitt 4 als Variable ein, getrennt für Produktion und Vorschau.
- **Prüfung ohne Geheimnis:** Vergleiche nur den Namen des Zweigs und den Servernamen, nie das Passwort. Der Servername der Produktion und der Vorschau dürfen sich nicht gleichen.

**2.4 Direkte Verbindung für die Migration**

- **Regel:** Zusätzlich `DATABASE_URL_UNPOOLED`: dieselbe Datenbank, aber ohne `-pooler` im Servernamen. Der Bau nimmt diese Adresse für die Migrationssperre (`web/scripts/migriere-mit-sperre.mjs`). Die Sperre ist eine Sitzungssperre und braucht eine direkte Verbindung (ADR 0019, Nachtrag). Die App selbst bleibt beim Pooler (ADR 0018).
- **Wo:** Die Neon-Integration setzt sie nach ADR 0019 zusammen mit `DATABASE_URL` **[prüfen: ob die Integration das tut]**. Fehlt sie in Abschnitt 4, trägst du sie wie `DATABASE_URL` ein.
- **Prüfpunkt:** Das Bauprotokoll zeigt `[migration] Verbindung: direkt (DATABASE_URL_UNPOOLED)`. Die Warnung „Nur eine Pooler-Adresse vorhanden“ darf nicht erscheinen.

## 3. Dateispeicher in Frankfurt (3 Minuten)

Hochgeladene Bilder brauchen einen Speicher, der nicht auf der Festplatte des Servers liegt. Auf Vercel ist das Dateisystem schreibgeschützt (ADR 0020, Ziel). Der Zielspeicher ist Vercel Blob (ADR 0020, Weg 1).

**3.1 Blob-Speicher anlegen**

- **Ort:** Team › Projekt `igmg` › Storage **[prüfen]**, dann „Blob“ bzw. „Create Blob Store“ **[prüfen]**.
- **Alternative auf der Kommandozeile:** `vercel blob create-store <name> --access private --region fra1` **[prüfen: `fra1` ist für Blob nicht belegt]**. Die Vercel-Doku nennt als Standardregion `iad1` (https://vercel.com/docs/cli/blob).
- **Zugriff:** privat (`private`). Das schreibt ADR 0020 vor, und die CLI verlangt diese Angabe.
- **Aufwand:** 3 Minuten.
- **Das siehst du, wenn es geklappt hat:** Ein Blob-Speicher mit privatem Zugriff ist im Projekt verbunden, und die Region zeigt Frankfurt **[prüfen]**.

**3.2 Verbindung zur Produktion und zur Vorschau**

- **Regel:** Vercel setzt `BLOB_READ_WRITE_TOKEN` selbst, sobald der Speicher verbunden ist (`web/.env.example` Zeilen 40–41). Du musst den Token nicht eintragen.
- **Prüfpunkt:** `BLOB_READ_WRITE_TOKEN` steht in den Umgebungsvariablen für Production und Preview.

**3.3 Speicher-Schalter setzen**

- **Ziel:** `SPEICHER=blob` in Production und Preview (ADR 0020, Festlegungen; `web/docs/BETRIEB.md` § 9).
- **Stand:** Der Blob-Adapter ist eingebaut (`web/src/lib/storage/index.ts`, Klasse `BlobSpeicher`, Auswahl über `SPEICHER=blob`). Die Startprüfung meldet auf Vercel nur `dateisystem` als Fehler (`web/src/lib/umgebung.ts`, Funktion `pruefeZusammenhaenge`).
- **Prüfpunkt:** In der Vorschau lässt sich ein Testbild über die Verwaltung hochladen und erscheint danach auf der Seite (`web/docs/GO-LIVE.md`, B2).

**3.4 Größe der Uploads**

- **Regel:** Auf Vercel nimmt die App Anfragen bis 4,2 MB an (`web/src/app/[locale]/verwaltung/(geschuetzt)/medien/page.tsx`, Konstante `GRENZE_VERCEL`). Größere Bilder verkleinert der Browser auf höchstens 2560 px als WebP (`web/src/components/verwaltung/medien/MedienFormulare.tsx`). Größere PDF-Dateien lehnt die Verwaltung mit einer Meldung ab. Außerhalb von Vercel gilt die Grenze von 10 MB (`web/src/lib/medien/verarbeiten.ts`, `MAX_BYTES`).
- **Grund:** `web/docs/BETRIEB.md` § 9 nennt für Vercel-Funktionen eine Grenze von 4,5 MB pro Anfrage. Die Vercel-Doku dazu habe ich **nicht gegengeprüft [prüfen]**. Der direkte Upload in den Speicher ist die nächste Stufe, falls große PDF-Aushänge nötig werden (ADR 0020, Umkehrprobe).
- **Prüfpunkt:** Ein Foto von etwa 6 MB lässt sich hochladen, der Browser verkleinert es vorher. Ein PDF von etwa 6 MB wird mit einer Meldung zur Größe abgelehnt.

## 4. Umgebungsvariablen und Geheimnisse (6 Minuten)

Umgebungsvariablen sind Einstellungen, die Vercel dem Programm mitgibt, zum Beispiel die Adresse der Datenbank. Jede Variable gilt nur für einen Bereich: Production (die öffentliche Seite), Preview (die Vorschau) oder Development. Den Bereich legst du beim Eintragen fest (https://vercel.com/docs/environment-variables/manage-across-environments).

**4.1 Wo du sie einträgst**

- **Ort:** Team › Projekt `igmg` › Settings › Environment Variables **[prüfen]**.
- **Aufwand:** 4 Minuten für die Liste, dazu die Geheimnisse aus Abschnitt 4.3.
- **Sensible Werte:** Setze bei Geheimnissen die Option „Sensitive“ **[prüfen: Menüname]**. Vercel zeigt sensible Werte danach nicht mehr an. Diese Option gibt es nur für Production und Preview, nicht für Development (https://vercel.com/docs/cli/env).

**4.2 Die wichtigsten Variablen**

Die vollständige Liste mit Zweck, Pflicht, Bereich und Beispiel steht in `web/docs/deploy/VERCEL-ENV.md`. Die wichtigsten Werte stehen hier:

| Variable                                                          | Wozu                                                 | Production                       | Preview                                                                                                            |
| ----------------------------------------------------------------- | ---------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `SITE_MODE`                                                       | Betriebsart                                          | `produktion`                     | `vorschau` (ADR 0022; AUFTRAG V-03)                                                                                |
| `APP_URL`                                                         | öffentliche Adresse, mit `https`                     | `https://[deine-domain.de]`      | weglassen; die App nimmt dann die Vorschau-Adresse (ADR 0022)                                                      |
| `BETTER_AUTH_URL`                                                 | Anmelde-Adresse, gleich wie `APP_URL`                | `https://[deine-domain.de]`      | weglassen; die App nimmt dann die Vorschau-Adresse (`web/src/lib/auth/optionen.ts`, Zeile 12). Nicht leer anlegen. |
| `DATABASE_URL`                                                    | Datenbank (Pooler-Adresse mit `-pooler`)             | Zweig Produktion                 | Zweig Vorschau (ADR 0018)                                                                                          |
| `DATABASE_URL_UNPOOLED`                                           | Direkte Verbindung für die Migration (Abschnitt 2.4) | Zweig Produktion, ohne `-pooler` | Zweig Vorschau, ohne `-pooler`                                                                                     |
| `BETTER_AUTH_SECRET`                                              | Anmeldung                                            | Geheimnis                        | eigenes Geheimnis                                                                                                  |
| `EINGANG_SCHLUESSEL`, `EINGANG_SCHLUESSEL_ID`                     | Verschlüsselung der Formulareingänge                 | Geheimnis                        | eigenes Geheimnis                                                                                                  |
| `RATE_GEHEIMNIS`, `ALTCHA_GEHEIMNIS`                              | Spam-Schutz                                          | Geheimnis                        | eigenes Geheimnis                                                                                                  |
| `WARTUNG_TOKEN`                                                   | Wartungsaufrufe, mind. 32 Zeichen                    | Geheimnis                        | eigenes Geheimnis                                                                                                  |
| `CRON_SECRET`                                                     | Schutz der Crons, mind. 32 Zeichen                   | Geheimnis                        | nicht nötig (Crons laufen nur in Produktion, Abschnitt 9)                                                          |
| `SPEICHER`                                                        | Ort der Medien                                       | `blob`                           | `blob`                                                                                                             |
| `BLOB_READ_WRITE_TOKEN`                                           | Zugang zum Blob-Speicher                             | Vercel setzt ihn                 | Vercel setzt ihn                                                                                                   |
| `MAIL_TRANSPORT`                                                  | Mailversand                                          | `smtp`                           | `smtp`                                                                                                             |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Zugang zum Mailanbieter                              | Anbieterwerte                    | Anbieterwerte oder leer **[prüfen]**                                                                               |
| `MAIL_ABSENDER`                                                   | Absenderadresse                                      | `[noreply@deine-domain.de]`      | `[noreply@deine-domain.de]`                                                                                        |
| `PROXY_VERTRAUEN`                                                 | Vertrauen in den Vercel-Proxy                        | `1`                              | `1`                                                                                                                |

Die Quellen: `web/docs/BETRIEB.md` §§ 2, 3, 9; `web/.env.example`; `web/src/lib/umgebung.ts`; ADR 0018 bis 0022.

**Nicht setzen**, weil Vercel bei jedem Kaltstart einer Instanz etwas tun würde (`web/docs/BETRIEB.md` § 9, Zeile 110):

- `MIGRATION_BEIM_START`
- `CACHE_ERNEUERN_BEIM_START`
- `BAU_PGLITE`, `PGLITE_VERZEICHNIS`

**`MAIL_ABSENDER` ist wichtig.** Ohne Eintrag nimmt die App `noreply@example.test` (`web/src/lib/mail/transport.ts` Zeile 35). Das ist eine Platzhalteradresse und darf nie in Produktion stehen.

Die Variablen `VERCEL`, `VERCEL_ENV`, `VERCEL_URL`, `VERCEL_BRANCH_URL` und `VERCEL_PROJECT_PRODUCTION_URL` setzt Vercel selbst. Trage sie nie von Hand ein (`web/.env.example` Zeilen 4–5).

**4.3 Geheimnisse erzeugen**

- **Befehl:** `pnpm geheimnisse:erzeugen --datei <pfad außerhalb des Repositorys>` (Eintrag in `web/package.json`, Zeile 26). Ohne `--datei` erscheinen die Werte auf dem Bildschirm. Nutze deshalb `--datei`.
- **Ohne Skript:** Erzeuge jedes Geheimnis einzeln mit `openssl rand -base64 32`. Für `WARTUNG_TOKEN` nimm `openssl rand -base64 48` (`web/docs/BETRIEB.md` § 2, Schritt 1). `CRON_SECRET` und `WARTUNG_TOKEN` brauchen mindestens 32 Zeichen (`web/src/lib/wartung/zugang.ts`, Funktionen `wartungErlaubt` und `cronErlaubt`).
- **Regeln:**
  - Kopiere die Werte direkt aus der Konsole in das Feld in Vercel.
  - Lege sie im Passwortmanager ab.
  - Lege `EINGANG_SCHLUESSEL` zusätzlich getrennt vom Datenbank-Backup ab. Ohne diesen Schlüssel sind die Formulareingänge nach einer Wiederherstellung nicht lesbar (`web/docs/BETRIEB.md` § 3 und § 6).
  - Vorschau und Produktion bekommen **eigene** Werte. Das ist eine Empfehlung dieses Runbooks, keine Vorgabe aus der Vercel-Doku.
- **Prüfpunkt:** Alle Namen aus `VERCEL-ENV.md` stehen in Vercel. Die Werte sind verdeckt.

**4.4 Öffentliche Variablen**

- Nur Werte mit dem Präfix `NEXT_PUBLIC_` dürfen öffentlich sein. Die App hat heute keine solchen Werte (`web/.env.example` Zeile 2; AUFTRAG V-03).

## 5. Vorschau prüfen und Link für den Vorstand (4 Minuten)

**5.1 Vorschau entsteht**

- **Regel:** Ein Stand auf dem Arbeitsbranch erzeugt eine Vorschau mit eigener Adresse. Das setzt die Git-Verbindung des Projekts voraus **[prüfen: Git-Integration aktiv]**.
- **Ort:** Team › Projekt `igmg` › Deployments **[prüfen]**.
- **Prüfpunkt:** Der Eintrag steht unter „Preview“ und hat den Status „Ready“ **[prüfen: Statusbezeichnung]**.

**5.2 Build-Protokoll lesen**

- **Ort:** Deployments › Eintrag anklicken › Build Logs **[prüfen]**.
- **Gute Zeile:** `[bau] Datenbank vorhanden (production)` bzw. `(preview)`, danach `[migration] Migrationen angewendet.` (ADR 0019, `web/scripts/vercel-bau.mjs`, `web/scripts/migriere-mit-sperre.mjs`). `vercel-build` zeigt auf dieses Skript (`web/package.json`, Zeile 8).
- **Warnzeile:** `[bau] WARNUNG: DATABASE_URL fehlt` (`web/scripts/vercel-bau.mjs`). Ist sie sichtbar, fehlt die Datenbank-Variable im Bereich Preview oder Production. Der Bau bleibt dann grün, und die Seite wird mit Beispielinhalten gebaut.

**5.3 Vercel-Schutz für die Vorschau**

- **Was es ist:** Vercel Authentication schützt die Vorschau. Wer die Adresse öffnet, muss sich bei Vercel anmelden (https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication).
- **Ort:** Team › Projekt `igmg` › Settings › Deployment Protection **[prüfen]**.
- **Stand:** Der Schutz ist im Projekt aktiv. Die Projektabfrage vom 11.10.2026 zeigt `ssoProtection` als eingeschaltet (`_werkstatt/berichte/E0-KUNDSCHAFTER-06.md`, Abschnitt 4).
- **Tarif:** Ob der Schutz auf allen Tarifen zur Verfügung steht, ist **nicht belegt [prüfen]**. AUFTRAG V-09 sagt „alle Tarife“.
- **Prüfpunkt:** Die Vorschau-Adresse im privaten Fenster öffnen. Es erscheint eine Vercel-Anmeldung, bevor die Seite kommt.

**5.4 Teilbarer Link für den Vorstand**

- **Ort:** Deployments › Vorschau-Eintrag › Share bzw. Schutz-Link **[prüfen: Menüname]**.
- **Gültigkeit:** Der Link kann befristet werden. Die höchste Laufzeit beträgt 63072000 Sekunden, also zwei Jahre. Ohne Angabe läuft er nie ab (https://vercel.com/docs/rest-api/aliases/update-the-protection-bypass-for-a-url).
- **Empfehlung:** Wähle eine Frist, etwa 30 Tage. Die Empfehlung ist keine Vorgabe der Dokumentation.
- **Prüfpunkt:** Den Link im privaten Fenster öffnen. Die Seite erscheint, ohne dass du dich anmelden musst **[prüfen: Konto-Anforderung]**.

**5.5 Suchmaschinen aussperren**

- **Regel:** Vorschauen sollen nicht in Suchmaschinen auftauchen. Dafür sorgen `robots.txt` mit `Disallow: /` und die Kopfzeile `X-Robots-Tag: noindex, nofollow` (ADR 0022).
- **Stand:** Umgesetzt. `web/src/app/robots.ts` (Zeile 10) sperrt in der Betriebsart `vorschau` alles. `web/src/lib/sicherheit/header.ts` (Funktion `noindexHeader`) setzt die Kopfzeile nur dort (AUFTRAG V-09).
- **Prüfpunkt:** Die Adresse `/robots.txt` der Vorschau zeigt `Disallow: /`.

## 6. Domain verbinden (3 Minuten + Wartezeit)

**6.1 Domain im Projekt eintragen**

- **Ort:** Team › Projekt `igmg` › Settings › Domains **[prüfen]** › „Add“.
- **Eintrag:** `[deine-domain.de]`. Ob zusätzlich `www.[deine-domain.de]` eingetragen wird und wie die Weiterleitung läuft, entscheidet der Vorstand **[prüfen: Weiterleitung in Vercel]**.
- **Aufwand:** 1 Minute.

**6.2 DNS-Eintrag übernehmen**

- **Regel:** Vercel zeigt dir den genauen Eintrag, den du bei deiner Domainverwaltung setzen musst, zum Beispiel einen A-Eintrag oder einen CNAME. Übernimm den angezeigten Wert genau. Die Vercel-Doku nennt als Beispiel einen CNAME `www` auf `cname.vercel-dns-0.com`, wenn Vercel die Nameserver führt (https://vercel.com/docs/domains/set-up-custom-domain).
- **Achtung:** Die Werte in diesem Dokument sind Platzhalter. Nimm nur den Wert, den Vercel im Dialog zeigt.

**6.3 Eintrag bei der Domainverwaltung setzen**

- **Ort:** Dort, wo die Domain registriert ist, unter „DNS“ bzw. „DNS-Einstellungen“ **[prüfen: Name des Menüs beim jeweiligen Anbieter]**.
- **Typ, Name, Wert:** Übernimm sie aus Vercel.
- **Aufwand:** 2 Minuten, danach Wartezeit **[prüfen: Dauer]**.

**6.4 HTTPS**

- **Regel:** Nach dem Eintrag stellt Vercel ein Zertifikat für die Domain automatisch aus (https://vercel.com/docs/platforms/multi-tenant-platforms/configuring-domains). Der Ablauf ist **im Dashboard nicht geprüft [prüfen]**.
- **Wichtig:** `APP_URL` und `BETTER_AUTH_URL` zeigen erst dann auf `https://[deine-domain.de]`, wenn die Adresse mit HTTPS läuft. Die App schaltet HSTS und `upgrade-insecure-requests` erst ein, wenn die öffentliche Adresse mit `https://` beginnt (`web/src/lib/sicherheit/header.ts`, Zeilen 9, 29 und 62; `web/docs/BETRIEB.md` § 2, Schritt 2).
- **Prüfpunkt:** `https://[deine-domain.de]` öffnet mit Schloss-Symbol. In Vercel steht die Domain als gültig **[prüfen: Statustext]**.

## 7. E-Mail-DNS: SPF, DKIM und DMARC (3 Minuten + Wartezeit)

Ohne diese Einträge können Mails von deiner Domain im Spam landen oder abgewiesen werden. Die Prüfregeln beschreiben RFC 7208, 6376 und 7489. Die Einträge stehen bei der Domainverwaltung, also an derselben Stelle wie in Abschnitt 6.

Was sie bedeuten:

- **SPF:** Eine Liste der Server, die im Namen deiner Domain Mails verschicken dürfen (RFC 7208). Pro Domain gibt es nur einen SPF-Eintrag.
- **DKIM:** Eine digitale Unterschrift jeder Mail, deren Schlüssel im DNS steht (RFC 6376).
- **DMARC:** Eine Regel dazu, was ein Empfänger tut, wenn SPF oder DKIM nicht passen, und ein Bericht darüber (RFC 7489).

**Der Mailanbieter ist noch offen.** Die Werte kommen vom Anbieter. Die folgenden Zeilen sind nur Platzhalter in eckigen Klammern. Übernimm sie nicht:

| Typ | Name                     | Wert (Platzhalter)                             |
| --- | ------------------------ | ---------------------------------------------- |
| TXT | `[@]`                    | `[v=spf1 include:<Anbieter> ~all]`             |
| TXT | `[<Auswahl>._domainkey]` | `[Wert vom Mailanbieter, beginnt mit v=DKIM1]` |
| TXT | `[_dmarc]`               | `[v=DMARC1; p=none; rua=mailto:<Adresse>]`     |

- Beginne DMARC mit `p=none`. So siehst du zuerst nur die Berichte, ohne dass Mails abgewiesen werden. Die Verschärfung ist eine spätere Entscheidung **[Empfehlung]**.
- **Prüfpunkt:** Der Mailanbieter zeigt die Domain als verifiziert **[prüfen: Anzeige beim Anbieter]**. Eine Testmail aus der Produktion kommt mit dem Absender `[noreply@deine-domain.de]` an.
- **Abstimmung:** `MAIL_ABSENDER` (Abschnitt 4) muss zur Domain passen.

## 8. Migrationen: Datenbank-Änderungen nur additiv

- **Regel:** Jede Datenbank-Änderung ist zuerst additiv: erst erweitern, dann umstellen, dann aufräumen, in getrennten Auslieferungen. Die alte Version läuft während des Baus weiter und braucht das alte Schema (ADR 0019, Festlegungen und Umkehrprobe).
- **Heutiger Weg:** Der Bau führt die Migration selbst aus, unter einer Sperre und vor dem Bau der Seiten (`web/scripts/vercel-bau.mjs`, `web/scripts/migriere-mit-sperre.mjs`; ADR 0019). Dafür ist kein Handgriff nötig.
- **Notweg (nur Technik):** `pnpm db:migrate` liest nur `DATABASE_URL` (`web/drizzle.config.ts`, Zeile 4) und setzt keine Sperre. Nutze ihn nur, wenn der Bau ausfällt, und stimme es vorher mit der Technik ab.
- **Vorschau:** Der Bau der Vorschau migriert nur den Datenbank-Zweig der Vorschau (ADR 0019, Folgen).

## 8a. Inhalte im Cache (ADR 0024)

- **Was:** Die öffentlichen Inhalte (Gebetszeiten, Veranstaltungen, Nachrichten, Kurse, Seiteninhalte und weitere) liegen im Cache. Die Abfragen in `web/src/server/queries/` nutzen `'use cache: remote'` (20 Stellen). Die Suche (`web/src/server/queries/suche.ts`) und die Heute-Anzeige (`web/src/lib/zeit/heute.ts`) bleiben bei `'use cache'`. Laut ADR 0024 legt Vercel die Einträge im Runtime Cache ab; die Vercel-Doku dazu habe ich **nicht gegengeprüft [prüfen]**.
- **Warum:** Mit `'use cache'` hält jede Instanz einen eigenen Speicher. Eine Änderung in der Verwaltung wäre dann nicht sofort auf allen Instanzen sichtbar (ADR 0024, Kontext).
- **Ungültig machen:** Die Verwaltung ruft `updateTag` bzw. `revalidateTag` auf (`web/src/lib/cache/aktualisieren.ts`). Die Tags stehen in `web/src/lib/cache/tags.ts`.
- **Kosten und Grenzen:** Ob der Runtime Cache im gewählten Tarif Kosten oder Grenzen hat, ist **nicht geprüft [prüfen]**. Die Tarif-Entscheidung steht in ML-09 (`_werkstatt/MENSCHEN.md`). Werden die Grenzen zu eng, geht es zurück auf `'use cache'` mit kurzer Laufzeit (ADR 0024, Umkehrprobe).
- **Prüfpunkt:** Ein Termin wird in der Verwaltung geändert und erscheint danach auf der öffentlichen Seite. Den Nachweis über mehrere Instanzen gibt es nur mit Datenbank in der Vorschau (ADR 0024, Folgen).

## 9. Wiederkehrende Aufgaben (Crons)

- **Was läuft:** Die Löschfristen und der erneute Versand des Mail-Ausgangs, täglich nachts (ADR 0021, Ziel).
- **Routen:** `/api/wartung/loeschfristen` und `/api/wartung/mail-ausgang` (`web/src/app/api/wartung/`).
- **Wann:** Vercel ruft die Crons nur in der Produktion auf (https://vercel.com/docs/cron-jobs/quickstart). Die Vorschau hat keine Crons (ADR 0021, Folgen).
- **Absicherung:** Vercel sendet `Authorization: Bearer <CRON_SECRET>`. Die App prüft diesen Wert (https://vercel.com/docs/cron-jobs/manage-cron-jobs; `web/src/lib/wartung/zugang.ts` Zeilen 19–23).
- **Zeitplan:** In `/vercel.json` (Repository-Wurzel) unter `crons`, in UTC: Löschfristen um 01:00 UTC (`0 1 * * *`), Mail-Ausgang um 02:00 UTC (`0 2 * * *`) (ADR 0021; `web/docs/BETRIEB.md` § 9).
- **Hobby-Tarif:** Der Auftrag sagt „einmal am Tag, irgendwann in der angegebenen Stunde“ (AUFTRAG V-06). **Die Vercel-Doku für diese Frequenz habe ich nicht gefunden [prüfen].** Der Tarif gehört zu ML-09 in `_werkstatt/MENSCHEN.md`.
- **Stand:** Eingetragen (`/vercel.json`, Zeilen 12–15).
- **Prüfen:** Team › Projekt `igmg` › Cron Jobs **[prüfen]**, oder auf der Kommandozeile `vercel crons ls` (https://vercel.com/docs/cli/crons). `vercel crons run <Pfad>` funktioniert nur, wenn schon eine Produktion mit dem Cron existiert.

## 10. Zusammenführen auf `main`

**Voraussetzungen:**

- Die Vorschau ist grün (Abschnitt 5.2), und die Schnellprüfung aus Abschnitt 11 ist durch.
- Lokal ist `pnpm check` grün, und der Bau wie auf Vercel läuft ohne Fehler (AUFTRAG V-02; `_werkstatt/ENTSCHEIDUNGEN.md` L-E01).

**Ablauf:**

1. Auf GitHub öffnest du einen Pull Request von der Arbeitsbranche nach `main`.
2. Du führst ihn mit „Merge“ zusammen. Das muss ohne Erzwingen gehen, also als Fast-Forward. Erzwungene Pushes auf `main` sind verboten (L-E01).
3. Der Stand auf `main` startet ein Produktions-Deployment **(L-E01)**.

- **Prüfpunkt:** Team › Projekt `igmg` › Deployments: Der neueste Eintrag steht unter „Production“ und ist „Ready“ **[prüfen: Statusbezeichnung]**.
- **Cache erneuern** (nur, wenn das Bauprotokoll `[bau] WARNUNG: DATABASE_URL fehlt` zeigt, der Bau also mit Beispielinhalten lief): `curl -fsS -X POST -H "Authorization: Bearer $WARTUNG_TOKEN" https://[deine-domain.de]/api/wartung/cache-erneuern` (`web/src/app/api/wartung/cache-erneuern/route.ts`). Läuft der Bau gegen die echte Datenbank, entfällt der Schritt (ADR 0019, Ziel). **Die Technik entscheidet im Einzelfall.**

## 11. Schnellprüfung der Hauptseiten (5 Minuten, Vorstand)

Die volle Abnahme mit Unterschrift steht in `web/docs/GO-LIVE.md`, Punkt E2 (30 Minuten).

Die zwölf Hauptansichten (`_werkstatt/KERN.md` Zeile 87). Öffne sie auf dem Handy und auf dem Computer. Die Adressen gelten ohne Sprachkürzel, denn Deutsch ist die Standardsprache (`web/src/i18n/routing.ts` Zeilen 11–13).

| Seite                | Adresse (Platzhalter)           | Das siehst du, wenn es geklappt hat                                               |
| -------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| Startseite           | `/`                             | Großer Bereich oben (Hero), darunter die Gebetszeiten-Leiste, keine Fehlermeldung |
| Gebetszeiten         | `/gebetszeiten`                 | Zeiten für heute stehen da                                                        |
| Veranstaltungen      | `/veranstaltungen`              | Liste der Termine                                                                 |
| Veranstaltungsdetail | `/veranstaltungen/[ein Termin]` | Termin mit Beschreibung                                                           |
| Nachrichten          | `/nachrichten`                  | Liste der Beiträge                                                                |
| Über uns             | `/ueber-uns`                    | Texte und Bilder vollständig                                                      |
| Projekte             | `/projekte`                     | Projekte mit Stand                                                                |
| Organisationsseite   | `/organisationen/[name]`        | Seite einer Organisation                                                          |
| Korankurse           | `/bildung/korankurse`           | Kursinformationen                                                                 |
| Schüler-Voranmeldung | `/bildung/voranmeldung`         | Formular lässt sich öffnen (senden nicht testen)                                  |
| Kontakt              | `/kontakt`                      | Adresse und Karte, die Karte lädt erst nach einem Klick                           |
| Startklar-Cockpit    | `/verwaltung/startklar`         | Alle Punkte grün, oder ein Punkt nennt Grund und Ort                              |

Zusätzlich prüfen:

- `/impressum` und `/datenschutz`: Keine eckigen Klammern mehr sichtbar (Platzhalter gefüllt).
- `/api/health`: Die Antwort ist `{"status":"ok"}` (`web/docs/BETRIEB.md` § 2, Schritt 4; `web/src/app/api/health/route.ts`).
- `/verwaltung/anmelden`: Die Anmeldeseite öffnet sich.
- Beim ersten Besuch erscheint **kein** Hinweisfenster „Alle angezeigten Daten sind fiktiv“. Das muss vorher abgeschaltet sein (ML-03 in MENSCHEN.md, siehe `web/docs/GO-LIVE.md`).

## 12. Zurückrollen (Übung 3 Minuten)

**Der schnelle Weg: Instant Rollback**

- **Ort:** Team › Projekt `igmg` › Deployments › die letzte gute Produktion › Menü „…“ › „Instant Rollback“ **[prüfen: Menüname]**.
- **Einschränkung auf Hobby:** Auf diesem Tarif geht nur der Rückgriff auf das unmittelbar vorige Produktions-Deployment (https://vercel.com/docs/cli/rollback). Für einen älteren Stand bleibt auf Hobby der Weg über einen Revert-Commit (L-E01). **[prüfen: ob auf Hobby ein Promote älterer Stände möglich ist]**
- **Auf der Kommandozeile:** `vercel rollback <Adresse-oder-ID>`. Ein Rückgriff auf ältere Stände per Adresse ist in der Doku für Pro und Enterprise beschrieben **[prüfen: auf Hobby]** (https://vercel.com/docs/deployments/rollback-production-deployment).
- **Prüfpunkt:** `https://[deine-domain.de]` zeigt wieder den alten Stand.

**Der Weg über Git: Revert-Commit**

- **Regel:** Ist die Produktion rot, macht die Technik einen Revert-Commit auf `main` (L-E01).
- **Prüfpunkt:** Der Revert-Commit läuft als neues Produktions-Deployment durch, und die Hauptseiten zeigen den alten Stand.

**Wichtig:** Ein Rollback setzt nur den Code zurück, nicht die Datenbank. Deshalb sind Migrationen additiv (Abschnitt 8, ADR 0019, Umkehrprobe).

**Übung:** Die Technik geht den Ablauf einmal am Bildschirm durch, bis zum Menü „Instant Rollback“, und löst ihn nicht aus. Vorstand informieren.

## 13. Datensicherung und Wiederherstellung

**Was gesichert ist:**

- **Datenbank (Neon):** Die Sicherung und die Wiederherstellung auf einen früheren Zeitpunkt (Point-in-Time Recovery) liegen beim Anbieter (ADR 0018, Festlegungen). Die Aufbewahrungsdauer im Tarif ist **nicht belegt [prüfen]** (ML-15).
- **Eingangsschlüssel:** `EINGANG_SCHLUESSEL` getrennt sichern (`web/docs/BETRIEB.md` §§ 3 und 6). Ohne ihn sind die Formulareingänge nach einer Wiederherstellung nicht lesbar.
- **Medien (Vercel Blob):** Im Code gibt es keine Kopie der Dateien. Die Löschfristen gelten auch für Blob-Dateien (ADR 0020, Folgen). Eine regelmäßige Kopie ist eine Menschen-Aufgabe (ML-14).

**Datenbank auf einen früheren Stand bringen** (nur die Technik; die Schritte vorher am Bildschirm durchgehen):

1. Neon-Konsole öffnen und das Projekt der Produktion wählen. Den Zeitpunkt für die Wiederherstellung suchen **[prüfen: Menüname, z. B. „Restore“ oder „Backup“]**.
2. Aus diesem Zeitpunkt einen **neuen Zweig** erzeugen. Den Produktionszweig nicht überschreiben **[prüfen: Menüname]**.
3. Den neuen Zweig prüfen (Prüfpunkt unten).
4. Die Produktion auf den neuen Zweig zeigen lassen: `DATABASE_URL` und `DATABASE_URL_UNPOOLED` im Bereich Production (Abschnitt 4) umstellen. Danach ein neues Produktions-Deployment starten **[prüfen: ob Vercel dafür ein neues Deployment verlangt]**.
5. `/api/health` prüfen (`{"status":"ok"}`). Dann den Cache erneuern (Abschnitt 10, `cache-erneuern`). Ob die Erneuerung auf allen Instanzen wirkt, ist nach ADR 0024 vorgesehen, aber nicht getestet **[prüfen]**.

**Was nach dem Zurückstellen fehlt oder doppelt auftritt:**

- Alles nach dem gewählten Zeitpunkt fehlt: Anmeldungen, Eingänge, Änderungen und Konten.
- Mails, die nach dem Zeitpunkt versendet wurden, können im Mail-Ausgang wieder offen stehen und ein zweites Mal rausgehen **[VERMUTUNG, prüfen]** (Tabelle `mail_ausgang`, `web/src/lib/db/schema/system.ts`, Zeile 49).
- Die Zweige der Vorschau bleiben unberührt.

**Export außerhalb des Anbieters:** Im Repository gibt es einen `pg_dump`-Befehl nur für den Docker-Betrieb (`web/docs/BETRIEB.md` § 6). Für Neon gibt es keinen Befehl. Ob ein Export nötig ist, ist offen (ML-15).

**Wiederherstellung testen:** Für den Docker-Betrieb nennt `web/docs/BETRIEB.md` § 6 einmal je Quartal. Für Vercel ist kein Rhythmus festgelegt (ML-15). Einmal vor dem Livegang: GO-LIVE E4. Teste nur auf einem Zweig, nie auf der Produktion. Prüfpunkt: Der Zweig mit dem Stand von gestern lässt sich lesen.

## 14. Tarif und Konten

- Die Frage nach dem Tarif (Hobby oder kostenpflichtig) und den Konten entscheidet der Vorstand. Die Empfehlung dazu soll in **MENSCHEN.md** stehen (AUFTRAG V-12).
- **Stand:** In MENSCHEN.md steht die Empfehlung als **ML-09** (Pro, mit Begründung). Die Entscheidung liegt beim Vorstand.

## 15. Wenn etwas nicht klappt

| Was du siehst                                                                | Wahrscheinliche Ursache                                                 | Was du tust                                                                                                                                                                                    |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bauprotokoll zeigt „[bau] WARNUNG: DATABASE_URL fehlt“ (der Bau bleibt grün) | Die Datenbank-Variable fehlt im Bereich Preview oder Production         | Die Seite zeigt Beispielinhalte. Abschnitt 4 prüfen, Technik informieren                                                                                                                       |
| Build rot, Meldung zu einem unbekannten Schlüssel (z. B. „services“)         | Der Schlüssel in `vercel.json` passt nicht zur Vercel-Doku **[prüfen]** | Technik informieren. Offene Frage laut `_werkstatt/berichte/E0-KUNDSCHAFTER-06.md` (Frage 2)                                                                                                   |
| Seite zeigt Fehlermeldung nach dem Start                                     | Eine Variable fehlt oder ist falsch                                     | Technik informieren. Die Startprüfung schreibt den Namen ins Funktionsprotokoll (`[start] NAME: …`, `web/src/instrumentation.ts`)                                                              |
| Bestätigungsmail kommt nicht                                                 | `SMTP_HOST` fehlt oder der Anbieter lehnt ab                            | Die Mail bleibt im Mail-Ausgang. Sie wird bei der nächsten Anfrage mit Versand oder im täglichen Lauf erneut versucht, höchstens sechsmal (`web/src/lib/mail/ausgang.ts`). Technik informieren |
| `/api/health` antwortet mit Fehler 503                                       | Datenbank nicht erreichbar                                              | Neon-Status prüfen, Technik informieren (`web/src/app/api/health/route.ts`)                                                                                                                    |
| Vorschau zeigt echte Produktionsdaten                                        | Die Vorschau hängt an der Produktionsdatenbank                          | Sofort stoppen. Vorschau-Adresse nicht weitergeben. Technik informieren                                                                                                                        |
| Datei lässt sich nicht hochladen (PDF über 4,2 MB)                           | Auf Vercel nimmt die App Anfragen bis 4,2 MB an (Abschnitt 3.4)         | Bilder verkleinert der Browser selbst. PDF kleiner speichern oder Technik informieren                                                                                                          |

## 16. Protokolle

- **Wo:** Laufzeitprotokolle der Funktionen und das Bauprotokoll bei Vercel. Die Skripte in `web/scripts/` geben zusätzlich Text auf der Konsole aus.
- **Was dort landet:**
  - Startprüfung: Variablennamen und Meldungen, keine Werte (`web/src/instrumentation.ts`).
  - Unbehandelte Fehler bei Anfragen: Next schreibt den vollen Fehlertext mit `console.error` ins Protokoll (`web/node_modules/next/dist/server/next-server.js`, Zeile 433). Die App hat keinen eigenen Fehlerbericht (`onRequestError` fehlt in `web/src/instrumentation.ts`).
  - Datenbankfehler mit Parametern: Die Meldung von drizzle-orm 0.45.4 hängt die Parameter der Abfrage an (`drizzle-orm/errors.js`, Zeilen 12–13). Ohne Abfangen betrifft das die Schreibwege für Einladungen (`web/src/server/actions/benutzer.ts`), Tickets (`web/src/server/actions/tickets.ts`) und das Postfach (`web/src/server/actions/postfach.ts`). Dort stehen dann E-Mail-Adressen, Namen oder Nachrichtentexte im Protokoll. **Offen:** Fehler vor dem Protokoll kürzen (Abhilfe aus H-V07/V10, Punkt 1).
  - Tokens: Der Einladungslink trägt den Token im Pfad (`web/src/app/[locale]/verwaltung/einladung/[token]/page.tsx`). Der Passwort-Link trägt ihn im Pfad der Anmelde-Adresse und die Seite liest ihn aus der Abfrage (`?token=`, `web/src/app/[locale]/verwaltung/passwort-neu/page.tsx`). Ob die Plattform beides in Zugriffsprotokollen speichert, ist **nicht belegt [prüfen]**.
- **Aufbewahrung:** Wie lange Vercel die Protokolle im gewählten Tarif behält, ist **nicht belegt [prüfen]**. Die Festlegung ist eine Menschen-Aufgabe (ML-16).
- **Zugriff:** Nur die Technik liest die Protokolle. Stelle die Rollen im Vercel-Team entsprechend ein **[prüfen: Menüname]**. Kopiere keine Protokollzeilen in Chats, E-Mails oder Tickets. Vorher Zeilen mit E-Mail-Adressen, Namen oder Tokens schwärzen.
- **Health:** `/api/health` gibt keine Details aus (`web/src/app/api/health/route.ts`). Die Datenbankabfrage hat kein Zeitlimit (Zeile 9). Hängt die Datenbank, hängt die Anfrage bis zum Funktionslimit. Das ist eine offene Entwicklungsaufgabe, kein Schritt für das Runbook.

## Verweise

- `web/docs/GO-LIVE.md`: die Checkliste aller Punkte vor dem Livegang, mit Ort, Aufwand und Verantwortlichen.
- MENSCHEN.md: Aufgaben, die nur ein Mensch erledigen kann.
- `web/docs/BETRIEB.md`: Betrieb mit Docker und Betrieb auf Vercel (§ 9).
- `web/docs/adr/0017` bis `0024`: die Entscheidungen zu Datenbank, Bau, Speicher, Crons, Umgebung, Auslieferung und Cache.
- `web/docs/deploy/VERCEL-ENV.md`: alle Umgebungsvariablen mit Pflicht je Betriebsart.
