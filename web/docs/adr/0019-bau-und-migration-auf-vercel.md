# ADR 0019 – Bau und Migration auf Vercel

- Status: angenommen · 2026-10-11 · Letzter Lauf (Kern K-013, AUFTRAG V-02, V-04, V-08) · Bezug: ADR 0017, ADR 0018

## Ziel

Auf Vercel soll jeder Bau die Inhalte der Datenbank seiner Umgebung vorrendern (Produktion: echte Inhalte, Vorschau: Inhalte des Neon-Branches). Migrationen laufen kontrolliert vor dem neuen Code; ohne Datenbank bleibt der Bau trotzdem grün.

## Wege

1. **Migration im Bau unter Sperre, dann `next build` gegen die Datenbank** (mit `DATABASE_URL`); ohne Datenbank der PGlite-Bau aus ADR 0017.
2. **Migration bei jedem Kaltstart** (`MIGRATION_BEIM_START=1`) wie im Docker-Betrieb.
3. **Migration von Hand** (Runbook) vor dem Zusammenführen.

## Bewertung

Weg 2 vervielfacht Migrationsläufe (jede neue Instanz), verlängert Kaltstarts und braucht den Migrationsordner im Funktions-Bundle. Weg 3 vergisst man. **Weg 1 gewählt:** eine Migration je Bau, unter `pg_advisory_lock`, vor dem Vorrendern – und die vorgerenderten Seiten zeigen sofort die echten Inhalte (kein Seed-Notbehelf, keine Cache-Erneuerung nach dem Start).

## Festlegungen

- `package.json` › `vercel-build` → `node scripts/vercel-bau.mjs`:
  - mit `DATABASE_URL`: `scripts/migriere-mit-sperre.mjs` (eigene Verbindung, `pg_advisory_lock(<fester Schlüssel>)`, Drizzle-Migrator auf `drizzle/migrations`, Sperre lösen), danach `next build`;
  - ohne `DATABASE_URL`: Warnung im Bauprotokoll, `pnpm db:bau-vorbereiten`, `BAU_PGLITE=1 … next build` (Beispielinhalte, wie bisher).
- Migrationen sind **additiv** (erweitern → umstellen → aufräumen in getrennten Auslieferungen), weil die alte Produktion während des Baus weiterläuft und bis zur Umschaltung auf dem neuen Schema arbeitet. Runbook: `docs/deploy/VERCEL.md`.
- `src/instrumentation.ts`: auf Vercel keine Migration beim Start und kein Selbstaufruf zur Cache-Erneuerung (Selbstaufrufe über 127.0.0.1 erreichen auf Vercel keine Instanz; Tags verfallen dort global über `revalidateTag`/`updateTag`). Docker unverändert (ADR 0017).
- Docker und lokal: unverändert (`MIGRATION_BEIM_START`, ADR 0017).

## Umkehrprobe

Falsch, wenn ein Bau mit Migration fehlschlägt, nachdem die Migration angewendet wurde – dann läuft die alte Produktion auf dem neuen Schema. Gerade deshalb nur additive Migrationen; Zurückrollen per Instant Rollback ist ohne Schemarückbau möglich.

## Folgen zweiter Ordnung

- Vorschau-Baus migrieren ihren Neon-Branch; ein Branch ohne Integration (gleiche `DATABASE_URL` wie Produktion) wäre gefährlich → Startklar-Prüfung „Vorschau nutzt nicht die Produktionsdatenbank“ (Cockpit, `pnpm startklar`).
- Der Bau braucht Netz zur Datenbank (Vercel-Bauumgebung hat es).

## Nachtrag 2026-10-11 (Prüfung H-V07/V10)

- Die Migrationssperre ist eine Sitzungssperre (`pg_advisory_lock`). Hinter einem Pooler im Transaktionsmodus (Neon-Adresse mit `-pooler`) kann jede Anweisung auf einer anderen Serververbindung laufen; Sperren und Entsperren träfen dann womöglich verschiedene Sitzungen. `scripts/migriere-mit-sperre.mjs` nimmt deshalb `DATABASE_URL_UNPOOLED` (setzt die Neon-Integration zusammen mit `DATABASE_URL`) vor `DATABASE_URL` und warnt im Bauprotokoll, wenn nur eine Pooler-Adresse vorhanden ist. Die App selbst bleibt beim Pooler (ADR 0018).

## Nachtrag 2026-10-11 (Beispielmodus ohne Datenbank)

- Befund in der Produktion ohne `DATABASE_URL` (Vercel-Laufzeitfehler, 7 h): 755 × „DATABASE_URL fehlt“, fast nur Segment-Abrufe (`*.segments/_tree.segment.rsc`). Ursache: Die Cache-Profile (`hours`: Erneuerung stündlich, Ablauf nach einem Tag) lösen Erneuerungen im Hintergrund aus, die ohne Datenbank scheitern. Nach Ablauf (`expire`) müsste eine Anfrage synchron neu erzeugen – mit Fehlerseite.
- Entscheidung: Im Beispielmodus (`VERCEL=1` und `BAU_PGLITE=1`, gesetzt von `scripts/vercel-bau.mjs`) überschreibt `next.config.ts` alle Cache-Profile, auch die eingebauten Namen, mit „dauerhaft“ (Erneuerung nach einem Jahr, Ablauf nach zwei). Die Inhalte stammen dort unveränderlich aus der Bau-Datenbank; ein neuer Bau aktualisiert sie. Mit Datenbank und unter Docker (BAU_PGLITE ohne VERCEL) gelten die Vorgaben von Next unverändert.
- Folge: Datumsabhängige Teile (heute, kommende Termine, das 45-Tage-Fenster der Gebetszeiten) bleiben im Beispielmodus auf dem Stand des Baus. Das ist kein Betriebszustand – der Beispielmodus endet mit dem Anschluss der Datenbank (Runbook Abschnitt 4).

## Nachtrag 2026-10-12 (Beispielmodus: Linkvorschauen und OG-Bilder)

- **Befund 1 (Laufzeitfehler der Produktion):** Die ersten Abrufe von `/opengraph-image/standard` unter `/tr` und `/en` endeten mit 500 und `DYNAMIC_SERVER_USAGE`. Bildrouten unter `[locale]` werden mit Cache Components zur Laufzeit erzeugt (ISR). `lib/seo/og-bild.tsx` las Monogramm und Schriften mit `readFile` aus `node:fs/promises`, also ungecacht und asynchron außerhalb von `'use cache'`. Next wertet das als dynamische Datenquelle.
- **Entscheidung 1:** Die festen Dateien werden synchron gelesen (`readFileSync`, Next-Doku Cache Components, „Predictable values“) und im Prozess gemerkt. Im OG-Pfad steht kein asynchroner Dateizugriff außerhalb von `'use cache'`. Das gilt mit und ohne Datenbank.
- **Befund 2:** Auf `/de` erschien „DATABASE_URL fehlt“. Ursache waren Abrufe von „HTML-begrenzten“ Bots (WhatsApp, Slackbot, facebookexternalhit, Twitterbot, Bingbot …). Für diese Bots umgeht Next die vorgerenderte Hülle und rendert neu, und ohne Datenbank scheitert das. Linkvorschauen bekamen 500.
- **Entscheidung 2:** Nur im Beispielmodus setzt `next.config.ts` die Option `htmlLimitedBots` auf ein Muster, das auf keinen echten Bot passt. Bots bekommen dann dieselbe vorgerenderte Hülle wie Browser. Titel, Beschreibung und `og:*` stehen dort schon im `<head>`. Mit Datenbank gilt die Vorgabe von Next.
- **Entscheidung 3:** Die OG-Bilder von Beiträgen und Veranstaltungen entstehen zur Laufzeit (ISR). Zur Laufzeit des Beispielmodus fragen sie die Datenbank gar nicht erst ab und zeigen das Standardbild (`inhaltOderStandard` in `lib/seo/og-bild.tsx`, Bedingung `datenbankVerfuegbar` in `lib/db/verfuegbar.ts`, dieselbe wie in `lib/db/index.ts`). Abfangen allein reichte nicht: Nach einer scheiternden `'use cache'`-Abfrage hing die Antwort in der Gegenprobe ohne Datenbank (0 % CPU, keine Antwort). Auf Vercel liefe sie bis zum Funktionslimit. Mit Datenbank, in Entwicklung und beim Bau wird normal geladen, und ein Fehler geht weiter.
- **Bekannte Grenzen des Beispielmodus** (alle enden mit dem Anschluss der Datenbank, Runbook Abschnitt 4):
  - ~~Unbekannte Slugs von Beiträgen und Veranstaltungen zeigen eine Fehlerseite~~ – behoben: Die Lader prüfen `datenbankVerfuegbar` und liefern „nicht gefunden“ (Stand 14.10.2026, gemessen im Lauf wie ein frischer Import).
  - Die Suche mit Begriff (`/suche?q=…`) braucht die Datenbank.
  - ~~POST-Anfragen ohne `Next-Action` enden mit 500~~ – im Lauf vom 14.10.2026 nicht mehr nachstellbar.
  - Alle Schreibwege (Formulare, Verwaltung) brauchen die Datenbank. `/api/altcha` antwortet ohne `ALTCHA_GEHEIMNIS` mit 503 statt 500.
  - Kalender-Abos (`/api/ical/…`): Feiertage nur berechnet („vorläufig“), Veranstaltungen leer; der Einzeltermin als .ics wird auf vorgerenderten Seiten nicht angeboten (`ohneLaufzeitDatenbank` in `lib/db/verfuegbar.ts`). `/medien/…` antwortet mit 404.
