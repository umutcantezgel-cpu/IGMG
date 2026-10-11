Kopfzeile: E0-KUNDSCHAFTER-06 · Rolle Kundschafter · Modell Haiku 5.5 · Stufe 1 · Kern vorläufig · Schreibrechte: nur `_werkstatt/berichte/E0-KUNDSCHAFTER-06.md` (neu) · Umfang: Auslieferung gegen die Vercel-Pflicht V-01–V-13.

Stand: Wurzel `/home/user/IGMG`. Begonnen auf Commit 10cd8ac; während der Erkundung wechselte HEAD auf 80a7d47, und in `web/` liegt unkommittierte V-06-Arbeit (Stand 18:05). Befund = gesehen. VERMUTUNG = nicht geprüft.

GEÄNDERTE DATEIEN
`/home/user/IGMG/_werkstatt/berichte/E0-KUNDSCHAFTER-06.md` (neu). Keine Projektdatei geändert.

WAS UND WARUM

1. Ist-Stand je Pflicht (Pfade relativ zu `web/`, sofern nicht anders angegeben)
- V-01 teilweise. `/home/user/IGMG/vercel.json:1–17` hat `$schema`, Service `web`, `rewrites`. Fehlt: `regions` (Auftrag: fra1), `crons`, `ignoreCommand` (je 0 Treffer). `package.json:107` `packageManager` pnpm@12.11.2; `:108–109` `engines.node` ">=24" (Auftrag: fest). Projekt-Node 24.x. `/home/user/IGMG/.vercelignore:1–4` schließt `_werkstatt`, `_archiv`, `_lauf` aus; `tests/` und Testkonfigurationen nicht.
- V-02 teilweise. `package.json:8` Skript `vercel-build` vorhanden. Fehlt: `VERCEL-ENV.md`, Beispielwerte, Bau-Nachweise für Vorschau und Produktion.
- V-03 fehlt. `SITE_MODE` nirgends im Code; `docs/deploy/` existiert nicht. `src/instrumentation.ts:9–21` prüft nur `APP_URL` (`:12`, wirft) und `PROXY_VERTRAUEN` (`:19–21`, nur Log). Keine Prüfung von DATABASE_URL, Speicher, CRON_SECRET. Geheimnisse entstehen von Hand (`docs/BETRIEB.md:17`). `NEXT_PUBLIC_*`: keine Nutzung.
- V-04 teilweise. Pool `src/lib/db/index.ts:21` (max 10). Kein `attachDatabasePool`; `@vercel/functions` nicht in `package.json`. Produktion wirft ohne DATABASE_URL (`:25–26`). Migration nur manuell (`docs/BETRIEB.md:111`) oder via `MIGRATION_BEIM_START`; `src/lib/db/migration.ts:7–17` ohne Sperre. Runbook fehlt.
- V-05 teilweise. Speicher-Default `dateisystem` (`src/lib/storage/index.ts:94–96`), S3-Adapter vorhanden (`:56–88`), kein Vercel Blob. Größen: 10 MB (`src/lib/medien/verarbeiten.ts:10`), 11 MB für Actions (`next.config.ts:23–24`). `docs/BETRIEB.md:112` nennt 4,5-MB-Grenze: Uploads darüber scheitern auf Vercel. Kein Direktupload, kein Browser-Verkleinern. Nur eine Bildvariante, max. 2560 px (`verarbeiten.ts:11, 71–89`). Metadaten-Bereinigung vorhanden.
- V-06 in Arbeit, unkommittiert. Bei Erkundungsbeginn ohne GET und ohne Cron. Jetzt `src/app/api/wartung/loeschfristen/route.ts:36` GET mit `cronErlaubt` (`src/lib/wartung/zugang.ts:19–23`, CRON_SECRET), `:43` POST mit WARTUNG_TOKEN; neu `api/wartung/mail-ausgang/`; Sperre `src/lib/wartung/sperre.ts` (`pg_try_advisory_xact_lock`). `vercel.json` hat noch keine `crons`, also läuft noch kein Cron.
- V-07 teilweise. Sitzungen, Ratenbegrenzung (`src/lib/validierung/ratenbegrenzung.ts:15–37`), ALTCHA-Verbrauch und Zeilensperren liegen in der DB. Lokal: Medien auf der Platte, solange `SPEICHER` nicht `s3` ist (`storage/index.ts:34–38`); Mail-Datei nur außerhalb Produktion (`src/lib/mail/transport.ts:12–17`). `src/lib/seo/og-bild.tsx:79` liest nur `public/`.
- V-08 gefährdet. `'use cache'` in 12 Dateien, Tags zentral (`src/lib/cache/tags.ts`), `updateTag`/`revalidateTag` in `src/lib/cache/aktualisieren.ts:16, 19`. Kein `'use cache: remote'`, kein `cacheHandlers`. Eigene Doku: Cache je Instanz, nur eine Instanz (`docs/BETRIEB.md:63, 112`). Medien: `max-age=86400` (`src/app/medien/[...schluessel]/route.ts:27`).
- V-09 teilweise. SSO-Schutz aktiv (`all_except_custom_domains`). noindex für Vorschau fehlt: `src/app/robots.ts:5–16` kennt keine Umgebung. Verwaltung hat noindex (`src/proxy.ts:29`). CSP `src/lib/sicherheit/header.ts:32–38` ohne `vercel.live`: Toolbar wird blockiert (VERMUTUNG, nicht im Vorschau-Test geprüft).
- V-10 teilweise. Health `src/app/api/health/route.ts:6–14` vorhanden (503 bei DB-Fehler). Konsolenausgaben nur bei Start und Migration (`instrumentation.ts:15–49`, `migration.ts:13`) und `src/app/global-error.tsx:19` (Browser). Laufzeit-Logs nicht geprüft. Audit ohne Personendaten (`src/lib/db/schema/system.ts:4`). Backup nur `pg_dump` für Docker (`docs/BETRIEB.md:86`).
- V-11 fehlt. Kein Startklar-Cockpit, kein `pnpm startklar`, kein `release:check` (`_werkstatt/ENTSCHEIDUNGEN.md` L-E02 bestätigt). Kein Verarbeitungsverzeichnis im Repo. Hosting-Baustein fehlt; `web/drizzle/seeds/bereiche/rechtliches.ts:40, 152, 178` nur Platzhalter.
- V-12 nur Dokumentation (Abschnitt 3). Projekt: `passwordProtection` aus. Tarif des Teams nicht abgefragt.
- V-13 fehlt. `docs/deploy/VERCEL.md`, `VERCEL-ENV.md` und `docs/GO-LIVE.md` existieren nicht. Lesender Vercel-Zugang funktioniert.

2. Umgebungsvariablen (`process.env` in `web/src` und `web/scripts`)
Pflicht:
- APP_URL: `instrumentation.ts:12` wirft in Produktion (außer Bau); sonst Fallback localhost (`app/[locale]/layout.tsx:16`, `lib/seo/metadaten.ts:10`).
- DATABASE_URL: `lib/db/index.ts:19, 25–26` wirft beim ersten Zugriff; Health 503.
- BETTER_AUTH_SECRET: `lib/auth/server.ts:12–13` wirft beim Laden.
- EINGANG_SCHLUESSEL (32 Byte): `lib/krypto/index.ts:12–14`; Formulare brechen.
- RATE_GEHEIMNIS, ALTCHA_GEHEIMNIS (≥ 32): `krypto/index.ts:55–57`, `lib/validierung/altcha.ts:16–17`; Formulare brechen.
- WARTUNG_TOKEN, CRON_SECRET (≥ 32): `lib/wartung/zugang.ts:9–10, 20–21`; sonst 401.
- SPEICHER (Default dateisystem), S3_BUCKET, S3_ENDPUNKT, S3_REGION (Default eu-central-1), S3_ZUGANG, S3_GEHEIMNIS: `lib/storage/index.ts:60–63, 94–96`; leer heißt Zugriffsfehler.
- MAIL_TRANSPORT, SMTP_HOST, SMTP_PORT (587), SMTP_SECURE, SMTP_USER, SMTP_PASS: `lib/mail/transport.ts:13–17, 26–29`; ohne SMTP_HOST wirft der Produktionsversand, die Mail bleibt im Ausgang.
- MAIL_ABSENDER: Default `noreply@example.test` (`transport.ts:35`). Befund: Platzhalterdomain bei fehlendem Wert.
Optional: BETTER_AUTH_URL (`lib/auth/optionen.ts:10`), EINGANG_SCHLUESSEL_ID (Default 1) und EINGANG_SCHLUESSEL_ALT_<ID> (`krypto:16, 23`), MEDIEN_VERZEICHNIS (`storage:96`), MIGRATIONEN_VERZEICHNIS (`migration.ts:12`), PROXY_VERTRAUEN (`lib/sicherheit/ip.ts:14`).
Auf Vercel nicht setzen: MIGRATION_BEIM_START (`instrumentation.ts:23`), CACHE_ERNEUERN_BEIM_START (`:27`), BAU_PGLITE (`db/index.ts:25`), PGLITE_VERZEICHNIS (`:32`).
Von Vercel: VERCEL (`next.config.ts:36`). Nur Entwicklung und Skripte: PORT, HOSTNAME, E2E_DATABASE_URL, ENTWICKLUNG_DATABASE_URL, INVENTAR_NUR, SCHWERE_SPUR_SPERRE, SCHWERE_SPUR_LAST. Next-intern: NODE_ENV, NEXT_PHASE, NEXT_RUNTIME.
Nicht im Code: SITE_MODE, VERCEL_ENV, NEXT_PUBLIC_*.

3. Vercel-Dokumentation (Abfrage über search_vercel_documentation)
- regions: Konfiguration über `regions` in vercel.json (https://vercel.com/docs/functions/configuring-functions/region). Hobby: „Hobby plans support any single region“ (https://vercel.com/docs/project-configuration/vercel-ts), also fra1 zulässig. Default iad1 (https://vercel.com/docs/llms-full.txt). Wirkung neben `services` nicht belegt: OFFENE FRAGE.
- ignoreCommand: Exit 1 baut, Exit 0 überspringt den Build (https://vercel.com/docs/project-configuration/vercel-ts). Auftragslogik passt.
- Cron: Vercel sendet GET mit `Authorization: Bearer <CRON_SECRET>` (https://vercel.com/docs/cron-jobs/manage-cron-jobs). Konform. Hobby-Frequenz: nicht gefunden.
- Request-Body 4,5 MB: nicht gefunden (drei Suchen). Quelle nur `BETRIEB.md:112`.
- attachDatabasePool für `pg` (https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package). Fehlt im Repo.
- Blob: Standardregion iad1, Wahl mit `--region` (https://vercel.com/docs/cli/blob). Client-Upload über `handleUploadUrl` (https://vercel.com/docs/vercel-blob/using-blob-sdk). fra1 nicht belegt.
- Schutz: Header `x-vercel-protection-bypass` (https://vercel.com/docs/security/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation); teilbarer Link mit `ttl` bis 63072000 s (https://vercel.com/docs/rest-api/aliases/update-the-protection-bypass-for-a-url). Vercel Authentication „alle Tarife“: nicht belegt.
- Rollback: „On the hobby plan, rollbacks are limited to the immediately preceding production deployment“ (https://vercel.com/docs/cli/rollback). Abweichung zu V-10.
- Node: `engines.node` „24.x“ legt die Version fest (https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). Repo: ">=24", Abweichung.
- packageManager: Corepack-Hinweis `ENABLE_EXPERIMENTAL_COREPACK=1` (https://vercel.com/docs/builds/configure-a-build). OFFENE FRAGE.
- `.vercelignore` liegt im Projektwurzelverzeichnis (https://vercel.com/docs/deployments/vercel-ignore). Wirkung bei Git-Deployments nicht belegt.
- Services: `services` mit `root` (https://vercel.com/docs/project-configuration/vercel-toml). Die Seite https://vercel.com/docs/services/experimental nennt `experimentalServices`. Projekt-Framework `services`: konform.
- Toolbar-CSP: `script-src`, `style-src`, `frame-src https://vercel.live` (https://vercel.com/docs/vercel-toolbar/managing-toolbar). Repo fehlt: Abweichung.
- Cache: `'use cache: remote'` nutzt den Vercel Runtime Cache (https://vercel.com/docs/runtime-cache); `expireTag` wirkt global binnen 300 ms (https://vercel.com/docs/functions/functions-api-reference/vercel-functions-package). Repo ohne `remote`: Abweichung zu V-08.
- `vercel-build`: Doku für den Node-Function-Build (https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration). Vorrang bei Next.js nicht belegt.
- Neon: Installation über Marketplace (https://vercel.com/docs/storage). Frankfurt nicht belegt.
- Hobby-Bedingungen, GitHub-Organisationen: nicht gefunden.

4. Projekt (`get_project`, nur lesend, prj_texCeXPLaac0TJIJguJJxEpMo7Dx)
framework `services`; nodeVersion `24.x`; passwordProtection aus; ssoProtection an (`all_except_custom_domains`); Domains igmg-five.vercel.app und igmg-codays-projects.vercel.app; letztes Deployment READY, Vorschau. `live: false` (Bedeutung offen). Function-Region fehlt in der Antwort. Nichts geändert.

5. Abweichungen vom Auftrag
- AUFTRAG §2 nennt Cockpit, `startklar` und `release:check` als Bestand; sie fehlen (L-E02).
- V-01 fra1 ist auf Hobby erlaubt, aber nicht konfiguriert.
- V-08: Auftrag „lange Lebensdauer“, Code einen Tag (ADR 0007 bewusst).
- V-10: Rollback auf Hobby nur eine Stufe.
- `docs/BETRIEB.md:63` („nur eine Instanz“) widerspricht V-07/V-08.

PRÜFUNG UND ERGEBNIS
Lektüre der Dateien, grep auf `process.env`, Routen und Schlüsselwörter, ca. 25 Doku-Abfragen, `get_project` lesend. Kein Build, keine Änderung an Vercel. Ohne Doku-Fundstelle: 4,5 MB, Hobby-Cron-Frequenz, Hobby-Bedingungen, Vercel-Authentication-Tarif.

BILDBELEGE
keine.

OFFENE FRAGEN
1. 4,5-MB-Grenze und Hobby-Cron (Frequenz, Stundenfenster) auf vercel.com gegenprüfen.
2. Wirken `regions` und `crons` top-level im Services-Modus; welcher Schlüssel gilt (`services` oder `experimentalServices`)?
3. `ignoreCommand` bei flachem Clone: Git-Historie vorhanden?
4. Gilt `.vercelignore` für Git-Deployments? Was umfasst „Prüfwerkzeuge“?
5. Blob-Region fra1, Neon Frankfurt, Vorschau-Branches.
6. Hobby-Bedingungen, Tarif des Teams, Tarif von Vercel Authentication (V-12).
7. Medien-Cache: ein Tag oder lange Lebensdauer?
8. `'use cache: remote'` für mehrere Instanzen (V-08): ADR nötig.
9. Mail-Wiederholung nur täglich über den Mail-Cron: akzeptabel?
10. Laufzeit-Logs ohne Personendaten: ungeprüft.
11. MAIL_ABSENDER-Default in Produktion: Startprüfung ergänzen?
12. Vorrang `vercel-build` bei Next.js im Vorschau-Protokoll prüfen.

=== ENDE E0-KUNDSCHAFTER-06 · BEREIT ZUR RÜCKGABE ===
