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
