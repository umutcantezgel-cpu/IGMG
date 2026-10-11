# H-V07/V10 · Prüfung gemeinsamer Speicher (V-07) und Betrieb (V-10)

Stand: 2026-10-11 · Rolle: Prüfer, nur lesend · Branch `claude/blissful-edison-x3j16w`
Keine Builds, Server, Suiten, Messungen und keine Vercel-Werkzeuge. Pfade relativ zu `/home/user/IGMG`, `web/` ist die App.

Kennzeichnung: **Befund** = am Code oder an der Doku gesehen. **VERMUTUNG** = aus Kenntnis, im Repo nicht belegt. **OFFENE FRAGE** = für ein späteres Paket zu klären.

---

## Teil A · V-07 Gemeinsamer Speicher

### A1 Zustände

| Zustand | Ort | Beleg | instanzfest | Risiko |
|---|---|---|---|---|
| Sitzungen | Postgres-Tabelle `session` über den Drizzle-Adapter | `web/src/lib/auth/server.ts:21`; `web/src/lib/auth/optionen.ts:27-31` (8 h, `cookieCache.enabled: false`); `secondaryStorage` kommt im Code nicht vor (0 Treffer) | ja | gering. Jede Anfrage liest die Sitzung aus der DB, Sperren wirken sofort. |
| Konten, 2FA, Passkey, Reset-Links | Postgres `user`, `twoFactor`, `passkey`, `verification` (`web/src/lib/db/schema/auth.ts`) | `web/src/lib/auth/optionen.ts:55-58` | ja | gering. Passkeys sind über HTTP gesperrt (`optionen.ts:72`). |
| Ratenbegrenzung Better Auth | Postgres `rate_limit` | `web/src/lib/auth/optionen.ts:32-42` (`storage: 'database'`); `web/src/lib/db/schema/auth.ts:115` | ja | gering |
| Ratenbegrenzung Formulare und Anmeldung | Postgres `ratenbegrenzung`, ein atomares UPSERT mit `now()` der DB, Schlüssel per HMAC | `web/src/lib/validierung/ratenbegrenzung.ts:15-37`; `web/src/lib/db/schema/system.ts:31-36`; Aufruf `web/src/server/actions/anmeldung.ts:45-54` | ja | mittel. Mit `PROXY_VERTRAUEN=1` nimmt die Erkennung zuerst `X-Real-IP` (`web/src/lib/sicherheit/ip.ts:17-28`). Ob Vercel den Header überschreibt, ist im Repo nicht belegt (OFFENE FRAGE 3). |
| ALTCHA-Wiederverwendung | Postgres `verbrauchte_challenge`, `INSERT … ON CONFLICT DO NOTHING`, gezählt wird die Rückgabe | `web/src/lib/validierung/altcha.ts:61-66`; `system.ts:39-46`; Geheimnis aus der Umgebung `altcha.ts:15-19`; Pflicht vor jeder Formularverarbeitung `web/src/lib/formulare/verarbeiten.ts:70` | ja | gering. Alle sechs Formular-Aktionen laufen über `verarbeiteFormular` bzw. `pruefeEinsendung`. |
| Wartungssperren (Cron und Handaufruf) | Postgres-Advisory-Lock `pg_try_advisory_xact_lock` in einer Transaktion | `web/src/lib/wartung/sperre.ts:36-43`; genutzt in `web/src/app/api/wartung/loeschfristen/route.ts:18` und `…/mail-ausgang/route.ts:20` | ja, solange ein `pg`-Pool aktiv ist | gering. Ohne `pg`-Pool läuft die Aufgabe ohne Sperre, und das meldet nichts (`sperre.ts:27-30, 37`). |
| Migrationssperre | Postgres-Session-Advisory-Lock `pg_advisory_lock(4242017)` auf einer eigenen Verbindung, blockierend | `web/scripts/migriere-mit-sperre.mjs:10, 17-20, 25`; Aufruf `web/scripts/vercel-bau.mjs:11-13` | ja ohne Pooler, mit Transaktions-Pooler unsicher | hoch, falls die `-pooler`-Adresse aus ADR 0018 im Transaktionsmodus läuft. VERMUTUNG: Dann kann die Session-Sperre auf einer Backend-Verbindung hängen bleiben, die der Client danach nicht mehr bekommt, und ein zweiter Lauf wartet blockierend. OFFENE FRAGE 2. |
| Mail-Ausgang | Postgres `mail_ausgang` (Inhalt verschlüsselt), Reservierung über ein bedingtes UPDATE | `web/src/lib/db/schema/system.ts:48-65`; `web/src/lib/mail/ausgang.ts:120-167`, Reservierung `:135-141`; Sperre `api/wartung/mail-ausgang/route.ts:20` | ja | gering. Wiederholung nur einmal täglich (ADR 0021, Umkehrprobe). |
| Mail-Transport | Modul-Singleton `transporter`, nur Konfiguration, keine Daten | `web/src/lib/mail/transport.ts:21-32` | ja (ohne Daten) | gering |
| Medien | Vercel Blob (`BlobSpeicher`); Singleton `speicher()` ohne Daten | `web/src/lib/storage/index.ts:96, 118-128`; Startprüfung `web/src/lib/umgebung.ts:822-827` meldet `SPEICHER=dateisystem` auf Vercel als Fehler | ja | gering im Code. Die Sicherung ist offen (B4). |
| Datenbankpool | je Instanz `pg.Pool`, auf Vercel max. 5 Verbindungen, `attachDatabasePool` | `web/src/lib/db/index.ts:17-24, 41-46` | je Instanz gewollt | gering |

**Ergebnis A1:** Alle Zustände, die Instanzen teilen müssen, liegen in Postgres oder im Blob-Speicher. Das bestätigt ADR 0018, Festlegungen (Punkt 4), für diese Zustände.

### A2 Prozessspeicher (`new Map`, `new Set`, `let`, `globalThis`)

Suche in `web/src` und `web/scripts` ohne Tests. Treffer, die über eine Anfrage hinaus Zustand halten:

| Fundstelle | Inhalt | Einordnung |
|---|---|---|
| `web/src/lib/db/index.ts:17-24, 41-50` | `globalThis.__igmgPool`, `__igmgDb` | harmlos: Verbindungspool je Instanz (gewollt) |
| `web/src/lib/mail/transport.ts:21` | Transporter | harmlos: Konfiguration |
| `web/src/lib/storage/index.ts:118` | Speicher-Singleton | harmlos: kein Datenstand |
| `web/src/lib/i18n/format.ts:10` | Map der Datumsformatierer | harmlos |
| `web/src/components/website/wissen/datum.ts:6` | Map der Datumsformatierer | harmlos |
| `web/src/lib/seo/og-bild.tsx:72` | Promise des Monogramms (statische Datei) | harmlos |
| `web/src/lib/zeit/useJetzt.ts:9-11` | Modulzustand der Uhr | harmlos (Browser) |
| `web/src/components/formular/altcha-laden.ts:12` | `globalThis.$altcha` | harmlos (Browser) |
| `web/src/lib/umgebung.ts:685` | konstante Map | harmlos |

Kein Treffer hält Daten, die Instanzen teilen müssten. Die übrigen `new Set`-Treffer sind lokale Variablen.

### A3 `'use cache'`, Tags und Invalidierung

- **Stellen:** 22 Direktiven in 11 Dateien: `web/src/server/queries/{ankuendigungen,kurse,gebetszeiten,einstellungen,wissen,nachrichten,seiteninhalte,veranstaltungen,suche,quran}.ts` und `web/src/lib/zeit/heute.ts:8`. `web/src/lib/medien/bild.ts:10` ist nur ein Kommentar. Tags: `web/src/lib/cache/tags.ts:5-37`.
- **Laufzeiten:** `cacheLife('max')` bei Einstellungen, Seiteninhalten, Wissen, Kursen, Quran. `hours` bei Nachrichten, Veranstaltungen, Suche, Ankündigungen. `days` bei Gebetszeiten.
- **Invalidierung:** `web/src/lib/cache/aktualisieren.ts:15-21` (`updateTag` sofort, `revalidateTag` nach 5 s über `after()`). Aufrufer in den Server Actions: `ankuendigungen.ts:90,123,140,153`; `kurse.ts:33` (Hilfsfunktion, aufgerufen `:111,139,156,170`); `gebetszeiten.ts:44,173,198`; `seiteninhalte.ts:95`; `seiteninhalte-organisationen.ts:89`; `neuigkeiten.ts:37` (Hilfsfunktion, aufgerufen `:133,166,182,194`); `veranstaltungen.ts:35` (aufgerufen `:114,145,160,172`); `medien.ts:50` (Definition), `:118,140,157,172`; `eingaenge.ts:72,109`; `startklar.ts:63`; `formulare/veranstaltungsanmeldung.tsx:109`.
- **Massenverfall:** `web/src/app/api/wartung/cache-erneuern/route.ts:12` (alle `START_TAGS`, `tags.ts:25-37`); `web/src/app/api/wartung/loeschfristen/route.ts:21-22` (Anmeldezahlen).
- **Ohne Invalidierung:** `web/src/server/actions/einstellungen.ts:19-36` (Löschfristen). Kein Befund: `ladeLoeschfristen` (`web/src/lib/eingaenge/fristen.ts`) ist nicht gecacht. `wissen`: Für `wissenThema` gibt es in `web/src` nur Lesezugriffe (`web/src/server/queries/wissen.ts`), kein Schreibweg in der Verwaltung. Der Verfall läuft nur über `cache-erneuern`.
- **Verhalten:** `web/next.config.ts` setzt keinen `cacheHandler` und keine `cacheHandlers`. Die lokale Next-Doku sagt: Der Standard-Cache liegt je Instanz im Speicher (`web/node_modules/next/dist/docs/01-app/02-guides/self-hosting.md:213`). `revalidateTag` wirkt auf der Instanz, die es aufruft (`self-hosting.md:281`; `how-revalidation-works.md:57`). Ob Vercel das für `'use cache'` ohne `remote` global löst, ist im Repo nicht belegt. `web/docs/BETRIEB.md:116` behauptet „Tag-Invalidierung gilt für alle Instanzen“, ohne Beleg.
- **Risiko:** hoch, bis belegt. Eine Änderung in der Verwaltung ist dann nicht auf allen Instanzen sofort sichtbar (ABNAHME Z-04, V-08). Prüfung im Paket Cache/V-08.
- **Nebenbefund:** `web/src/server/queries/suche.ts:47-49` cached `suche(begriff, sprache)` mit dem Suchbegriff als Schlüssel. Siehe B2.

### A4 Ergebnis V-07

- **Erfüllt** für Sitzungen, Ratenbegrenzung, ALTCHA-Wiederverwendung, Wartungssperren, Mail-Ausgang und Medien (Blob). ADR 0018 stimmt mit dem Code überein.
- **Offen:** (1) Cache-Invalidierung über Instanzen, Risiko hoch, nicht belegt (A3). (2) Migrationssperre bei Pooler-Adresse, Risiko hoch, wenn Transaktionsmodus (A1). (3) IP-Erkennung auf Vercel, Risiko mittel, nicht belegt (A1).
- Die V-Prüfliste sagt „Bestand (DB) – Beleg H-V07 offen“. Der Beleg für die DB-Zustände steht jetzt. Die drei Punkte bleiben offen.

---

## Teil B · V-10 Protokolle, Health, Backups, Rollback

### B1 Konsolenaufrufe: 49 in 21 Dateien (ohne Tests)

Bewertung je Aufruf. „Personendaten“ meint E-Mail, Name, Telefon, Formularinhalt, IP, Token oder Geheimnis.

| Datei:Zeile | Ausgabe | Personendaten oder Geheimnis möglich? | Risiko |
|---|---|---|---|
| `web/src/app/global-error.tsx:19` | `console.error(error)` im Browser (Client-Komponente) | nur, falls ein Fehlertext Daten trägt; Server-Fehler kommen ohne Detail beim Client an | gering (Browser des Betrachters) |
| `web/src/instrumentation.ts:16` | `[start] VARIABLE: Meldung` (Fehler) | nein: nur Variablennamen | gering |
| `web/src/instrumentation.ts:17` | dieselbe Form (Warnung) | nein | gering |
| `web/src/instrumentation.ts:43` | Cache-Erneuerung abgelehnt, HTTP-Status | nein | gering |
| `web/src/instrumentation.ts:49` | Zeitüberschreitung beim Start | nein | gering |
| `web/src/lib/db/migration.ts:13` | `console.warn` bei erfolgreicher Migration (Niveau zu hoch) | nein | gering |
| `web/scripts/inventar.mjs:230` | Status oder Fehlertext einer Seitenprüfung | nein (öffentliche Seiten) | gering |
| `web/scripts/inventar.mjs:321` | Zähler und Pfad | nein | gering |
| `web/scripts/vercel-ignore.mjs:7` | Hinweis Zwischenstand | nein | gering |
| `web/scripts/vercel-ignore.mjs:10` | Umgebung des Baus | nein | gering |
| `web/scripts/geheimnisse-erzeugen.mjs:100` | „Geschrieben … Die Werte wurden nicht ausgegeben“ | nein | gering |
| `web/scripts/geheimnisse-erzeugen.mjs:105` | Kopf der Vercel-Befehle, ohne Werte | nein | gering |
| `web/scripts/geheimnisse-erzeugen.mjs:106` | Vercel-Befehle, ohne Werte | nein | gering |
| `web/scripts/geheimnisse-erzeugen.mjs:108` | Hinweis, Werte nicht ins Repository | nein | gering |
| `web/scripts/geheimnisse-erzeugen.mjs:115` | `Fehler: ${message}` | nein (Optionsfehler) | gering |
| `web/scripts/sprachen-pruefen.mjs:104` | Zahl der Befunde | nein | gering |
| `web/scripts/sprachen-pruefen.mjs:105` | Befunde mit Schlüsselnamen | nein | gering |
| `web/scripts/sprachen-pruefen.mjs:108` | Zähler | nein | gering |
| `web/scripts/geheimnis-pruefung.mjs:107` | Zahl der Befunde | nein | gering |
| `web/scripts/geheimnis-pruefung.mjs:108` | Datei, Zeile und Musterart. Bei E-Mail nur die Domain | nein: der Treffer selbst wird nicht ausgegeben (`:96-102`) | gering |
| `web/scripts/geheimnis-pruefung.mjs:111` | „ohne Befund“ | nein | gering |
| `web/scripts/auth-schema.mjs:18` | „auth.ts aktualisiert“ | nein | gering |
| `web/scripts/migriere-mit-sperre.mjs:14` | `DATABASE_URL fehlt.` (ohne Wert) | nein | gering |
| `web/scripts/migriere-mit-sperre.mjs:23` | „Migrationen angewendet“ | nein | gering |
| `web/scripts/pwa-symbole.mjs:37` | erzeugte Symbole | nein | gering |
| `web/scripts/schwer.mjs:14` | Aufrufhilfe | nein | gering |
| `web/scripts/schwer.mjs:63` | Sperre nicht frei | nein | gering |
| `web/scripts/schwer.mjs:73` | Name des Sperrhalters aus der PID-Datei | nein (Prozessname) | gering |
| `web/scripts/schwer.mjs:83` | Systemlast | nein | gering |
| `web/scripts/schwer.mjs:87` | `Start … ${befehl.join(' ')}`: gibt die Argumente des Befehls aus | nur, wenn ein Geheimnis als Argument übergeben wird (Entwicklungswerkzeug) | gering |
| `web/scripts/schwer.mjs:96` | Ende mit Signal oder Code | nein | gering |
| `web/scripts/schwer.mjs:101` | Befehl nicht startbar, Fehlermeldung | nein | gering |
| `web/scripts/vercel-bau.mjs:12` | „Datenbank vorhanden (Umgebung)“ | nein | gering |
| `web/scripts/vercel-bau.mjs:16` | Warnung: `DATABASE_URL fehlt` (ohne Wert) | nein | gering |
| `web/scripts/vercel-bau.mjs:17` | Hinweis auf das Runbook | nein | gering |
| `web/scripts/bau-datenbank.mjs:13` | Verzeichnis der Bau-Datenbank | nein | gering |
| `web/scripts/schriften-kopieren.mjs:30` | Zähler | nein | gering |
| `web/scripts/altcha-kopieren.mjs:15` | Version des Werkzeugs | nein | gering |
| `web/scripts/messen.mjs:24` | übersprungene öffentliche Seite mit Status | nein | gering |
| `web/scripts/messen.mjs:81` | Messwerte | nein | gering |
| `web/scripts/messen.mjs:106` | Pfad der Zusammenfassung | nein | gering |
| `web/scripts/start-standalone.mjs:12` | Hinweis, Build fehlt | nein | gering |
| `web/scripts/quran-import.ts:19` | Fehlertext des Imports (Hash-Abgleich) | nein | gering |
| `web/scripts/quran-import.ts:70` | Zahl der Suren und Verse, öffentlicher Hash | nein | gering |
| `web/scripts/quran-import.ts:71` | Hinweis Cache erneuern | nein | gering |
| `web/scripts/einladen.ts:23` | `fehler(text)`: Eingabefehler mit dem Eingabewert (z. B. Organisationskürzel) | nein, außer Eingabewerte selbst | gering |
| `web/scripts/einladen.ts:61` | **Einladungslink mit Einmal-Token** auf stdout (Ausnahme `--nur_token`) | ja, Token | gering bis mittel (Terminal des Verwaltenden) |
| `web/scripts/einladen.ts:65` | `e.message`. Bei einem DB-Fehler enthält sie die Drizzle-Parameter (E-Mail, Name), siehe B2 | ja, bei DB-Fehlern | gering (Terminal des Verwaltenden) |
| `web/scripts/e2e-datenbank.mjs:40` | Name der Test-Datenbank | nein | gering |

Zusätzlich ohne `console`, aber mit Ausgabe: `web/scripts/geheimnisse-erzeugen.mjs:102` schreibt ohne `--datei` die **Geheimniswerte auf stdout** (`process.stdout.write`). Das ist beabsichtigt (Runbook §4.3 verlangt die Konsole), liegt aber in Shell-Verlauf und Sitzungsprotokollen. Risiko: mittel.

### B2 Protokolle ohne Konsolenaufruf

Next gibt unbehandelte Anfragefehler mit `console.error(error)` aus (`web/node_modules/next/dist/server/next-server.js:433`). Die Meldung kürzt Next dabei nicht; `format-server-error` ändert nur bekannte React-Meldungen. `web/src/instrumentation.ts` setzt kein `onRequestError`. Der Text eines unbehandelten Fehlers landet damit im Laufzeitprotokoll.

1. **Drizzle-Fehler mit Parametern (Risiko mittel).** `drizzle-orm@0.45.4` hängt in `DrizzleQueryError` die Parameter an die Meldung (`…/drizzle-orm/errors.js:12-13`: `params: ${params}`). Schreibwege mit Klartext-Personendaten ohne `catch`:
   - Einladung: `web/src/server/actions/benutzer.ts:80-83` (E-Mail, Name)
   - Interne Tickets: `web/src/server/actions/tickets.ts:49-52` (Titel, Beschreibung); Kommentare `:151` (Text)
   - Postfach: `web/src/server/actions/postfach.ts:55, 87` (Nachrichtentext)
   - Konten: Anlage über `auth.api.signUpEmail` bei der Einladungsannahme. Dort liegt ein `try` mit leerem `catch` (`web/src/server/actions/anmeldung.ts:182-196`), der Fehler wird verschluckt. Protokollierung der Better-Auth-Fehler siehe Punkt 2.

   Verschlüsselt und damit unkritisch: Formulareingänge (`datenVerschluesselt`), Mail-Ausgang, öffentliche Meldung (`melderVerschluesselt`, `web/src/server/actions/formulare/meldung.tsx`), Notizen (`eingang_notiz.textVerschluesselt`).

2. **Better-Auth-Logger (Risiko mittel; Inhalt VERMUTUNG).** Das Standardniveau ist `warn`. Ausgegeben wird mit `console.error(…, ...args)` (`web/node_modules/.pnpm/@better-auth+core…/dist/env/logger.mjs:57-66`). Mehrere Aufrufe übergeben den Fehler selbst, z. B. `logger.error(…, error)` in `better-auth/dist/api/routes/session.mjs`. Die App setzt im Anmeldeoptionen-Objekt (`web/src/lib/auth/optionen.ts`) keine `logger`-Option. Ob dabei Parameter wie E-Mail landen, ist nicht geprüft.

3. **Tokens im Pfad oder in der Query (Risiko mittel).**
   - Einladung: Token im Pfad, `web/src/app/[locale]/verwaltung/einladung/[token]/page.tsx:7-8`.
   - Passwort-Link: Better Auth baut `reset-password/${token}?callbackURL=…` (`better-auth/dist/…`). Angefordert wird mit `redirectTo: …/passwort-neu` (`web/src/server/actions/anmeldung.ts:216`). Die Seite liest `?token=` (`web/src/app/[locale]/verwaltung/passwort-neu/page.tsx:10`).
   - Beides sind Einmal-Token mit Ablauf (Reset 60 min, `web/src/lib/auth/server.ts:25`; Einladung `gueltigTage`). Ob die Plattform Pfad und Query speichert, ist VERMUTUNG (Paket Vercel).

4. **Suchbegriff in der URL (gering).** `…/suche?q=` (`web/src/app/[locale]/(website)/suche/page.tsx:90`), dazu der Cache-Schlüssel aus A3.

5. **Audit-Protokoll (Datenbank).** Geprüft, ohne Personendaten. Die Details enthalten nur Enums, Zähler und Schlüsselnamen. Der Eintrag `ersatzcode` ist ein Wahrheitswert (`web/src/server/actions/anmeldung.ts:93, 111`). Fehlversuche ohne Adresse (`anmeldung.ts:65, 105`). IP wird nie gespeichert (`optionen.ts:46-48`).

6. **Mail-Fehler (kein Risiko).** Der Fehlertext im Mail-Ausgang ist nur `e.name` (`web/src/lib/mail/ausgang.ts:160`). Versandfehler beim Anmelden werden verschluckt (`web/src/server/actions/anmeldung.ts:220`).

7. **HMAC statt Klartext.** Ratenschlüssel und Anmeldesperre für Konten arbeiten mit HMAC (`web/src/lib/krypto/index.ts:54-58`; `web/src/server/actions/anmeldung.ts:50`). Keine IP und keine E-Mail im Klartext.

### B3 Health-Route

`web/src/app/api/health/route.ts:6-13`:
- prüft mit `select 1` die Datenbank,
- liefert `{"status":"ok"}` oder HTTP 503 mit `{"status":"fehler"}`, jeweils `no-store`,
- gibt keine Details, Versionen oder Geheimnisse aus, und der Fehler wird verschluckt (`:11`).

Lücken:
- (a) Kein Zeitlimit für die Abfrage (`:9`). Antwortet die Datenbank nicht, hängt die Anfrage bis zum Funktionslimit.
- (b) Kein Blick auf Cron-Läufe, offene Mails (`mail_ausgang`, nicht versendet) oder den Speicher.
- (c) Das Runbook nennt keinen Prüfer und keine Frequenz (`web/docs/deploy/VERCEL.md` §11, §15 nur als Einzelprüfung).

### B4 Backups und Wiederherstellung

Im Runbook vorhanden: Ort (Neon-Konsole, „[prüfen]“), Zweck und Prüfpunkt (`web/docs/deploy/VERCEL.md` §13, Zeilen 335-340). Der Schlüssel `EINGANG_SCHLUESSEL` wird getrennt gesichert (§13; §4.3, Zeile 181). GO-LIVE E4 (`web/docs/GO-LIVE.md:169-173`): Wiederherstellung einmal testen, 30 Minuten, Wer: Technik.

Lücken:
1. **Keine Schritte für die Wiederherstellung.** Es fehlt, wie man einen Zeitpunkt wählt, einen Zweig erzeugt und die Adresse umstellt oder die Daten zurückspielt. Nur der Ort, mit „[prüfen]“.
2. **Aufbewahrungsdauer nicht belegt** (`VERCEL.md:337`).
3. **Medien nicht gesichert.** Vercel Blob: „nicht geregelt [prüfen]“ (`VERCEL.md:340`). Die Löschfristen gelten auch für Blob-Dateien (ADR 0020).
4. **Export nur für Docker.** `pg_dump` steht in `web/docs/BETRIEB.md:86`, nur für `docker compose`. Für Neon gibt es keinen Befehl, und es ist offen, ob ein Export außerhalb des Anbieters nötig ist.
5. **Rhythmus und Verantwortung.** BETRIEB §6 nennt „einmal je Quartal“ (Docker-Betrieb). Für Vercel gibt es keinen Eintrag in `_werkstatt/MENSCHEN.md` (Suche ohne Treffer außer ML-09).
6. **Nur einmalig eingeplant.** E4 ist eine Einmalaufgabe, keine wiederkehrende Prüfung.

### B5 Instant Rollback

- **Ort und Schritte** vorhanden: `VERCEL.md` §12, Zeilen 321-325 (Menü „Instant Rollback“, „[prüfen: Menüname]“). Auf Hobby nur das unmittelbar vorige Produktions-Deployment. Ein älterer Stand geht über einen Revert-Commit. Ob Hobby mehr erlaubt, ist „[prüfen]“ (`VERCEL.md:323`).
- **Revert-Commit:** Zeilen 327-329. Die Schritte bestehen aus einem Satz („Die Technik macht einen Revert-Commit auf main“). Es fehlen Ablauf, Prüfung und Hinweise zu Cron, Cache und Blob.
- **Datenbank:** Zeile 331. Ein Rollback setzt nur den Code zurück. Migrationen sind additiv (§8). Das ist klar beschrieben.
- **Übung:** Zeile 333, nicht ausgeführt. GO-LIVE E3 (`web/docs/GO-LIVE.md:163-167`) ist offen, 15 Minuten.

### B6 Dokumentation: veraltete Aussagen (Nebenbefunde für den Dokumentar)

| Runbook | Aussage | Code |
|---|---|---|
| `web/docs/deploy/VERCEL.md:126` | `blob` gibt es im Code noch nicht | `web/src/lib/storage/index.ts:96` (`BlobSpeicher`), `:124-125` (Schalter `blob`); `web/.env.example:21` ist gleich veraltet |
| `VERCEL.md:176` | `pnpm geheimnisse:erzeugen` fehlt in `package.json` | `web/package.json:26` vorhanden |
| `VERCEL.md:197` und `:264` | `vercel-build` zeigt noch auf die alte Zeile, Umstellung offen | `web/package.json:8` nutzt `node scripts/vercel-bau.mjs` |
| `VERCEL.md:213-215` | Vorschauen-Sperre „noch nicht umgesetzt“ | `web/src/app/robots.ts:10` sperrt Vorschauen |
| `VERCEL.md:273-275` | Crons „noch nicht in vercel.json“; Vorschlag `15 3 * * *` | `vercel.json:12-15` (01:00 und 02:00 UTC, wie `web/docs/BETRIEB.md:114`) |
| `web/docs/BETRIEB.md:116` | Tag-Invalidierung gilt für alle Instanzen | ohne Beleg, siehe A3 |
| `web/docs/deploy/VERCEL-ENV.md:34` | Beispiel `DATABASE_URL` mit Port `:5432` | ADR 0018 verlangt die Pooler-Adresse (`-pooler`); Abweichung für Paket V-04 |

---

## C · Ergebnis V-10

- **Health:** erfüllt. Keine Details nach außen. Lücken in B3 (Zeitlimit, Umfang, Verantwortliche).
- **Runbook:** teilweise. Rollback mit Ort und Schritten, Übung offen. Wiederherstellung ohne Schritte, Blob ungesichert, Export nur für Docker.
- **Protokolle:** teilweise. Die 49 Konsolenaufrufe sind bis auf Skriptausgaben unbedenklich. Das eigentliche Risiko liegt in unbehandelten Fehlern (Drizzle-Parameter, Better-Auth-Logger) und in Tokens im Pfad.

## D · Abhilfe (nur Text, nicht umgesetzt)

1. Fehler der Schreibwege kürzen: Drizzle-Fehler vor dem Auslösen auf Code und Tabelle reduzieren (Hülle um `benutzer.ts`, `tickets.ts`, `postfach.ts` und den Better-Auth-Adapter). Test: eine erzwungene DB-Fehlermeldung darf keine E-Mail-Muster enthalten.
2. Tokens nicht im Pfad oder in der Query: Einladung und Passwort-Link über Fragment (`#`) oder ein POST-Formular übergeben. Bis dahin die Aufbewahrung der Plattformprotokolle klären.
3. Better-Auth-Logger einschränken (Niveau `error`, Argumente kürzen), über eine `logger`-Option in `web/src/lib/auth/optionen.ts`.
4. Health: Zeitlimit für `select 1` (wenige Sekunden). Optional ein interner Hinweis bei offenem Mail-Ausgang.
5. `geheimnisse-erzeugen.mjs`: Standard auf `--datei`, Ausgabe auf stdout nur mit ausdrücklicher Option. `einladen.ts`: Link mit Warnhinweis, `e.message` kürzen.
6. Migrationssperre: `pg_try_advisory_xact_lock` in einer Transaktion (wie `sperre.ts`), oder Migrationen über eine direkte Verbindung ohne Pooler.
7. Runbook: Schritte für die Wiederherstellung (Zeitpunkt, Zweig, Umschalten, Prüfung), Blob-Sicherung, Verantwortliche und Rhythmus in MENSCHEN.md, Revert-Schritte mit Cron und Cache, Prüfer und Frequenz für `/api/health`, Übung Instant Rollback.
8. Die veralteten Stellen aus B6 korrigieren.

## E · Offene Fragen

1. `'use cache'` ohne `remote` auf Vercel: Wirken `updateTag` und `revalidateTag` auf alle Instanzen? (Paket Cache/V-08)
2. Ist die `-pooler`-Adresse von Neon im Transaktionsmodus? Dann muss die Migrationssperre umgebaut werden. (Paket V-04)
3. Überschreibt Vercel `X-Real-IP`, oder hängt es nur `X-Forwarded-For` an? (Paket Sicherheit/V-09)
4. Speichern die Vercel-Zugriffsprotokolle Pfad und Query (also Tokens), und wie lange? (Paket Vercel)
5. Aufbewahrungsdauer der Neon-Wiederherstellung im gewählten Tarif. (Menschen, ML)
6. Welche Argumente übergibt Better Auth bei Datenbankfehlern an den Logger? (Vertiefung)

---

Umgebung: Keine Builds, Server, Suiten oder Messungen. Keine Projektdatei geändert, kein Commit, kein Push, keine Vercel-Werkzeuge.
