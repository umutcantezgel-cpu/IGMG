# ADR 0018 – Datenbank auf Vercel: Postgres in Frankfurt, Pool mit `attachDatabasePool`

- Status: angenommen · 2026-10-11 · Letzter Lauf (Kern K-013, AUFTRAG V-04, V-07) · Bezug: ADR 0001, ADR 0017, ADR 0019

## Ziel

Die App läuft auf Vercel Functions (Fluid compute, mehrere Instanzen, Instanzen werden eingefroren). Sie braucht eine Postgres-Datenbank in der EU, Verbindungen, die beim Einfrieren nicht hängen bleiben, und Vorschauen, die nie die Produktionsdatenbank berühren.

## Wege

1. **Neon über den Vercel Marketplace (aws-eu-central-1, Frankfurt)**, vorhandener `pg`-Pool + `attachDatabasePool` aus `@vercel/functions`; Vorschauen auf Neon-Branches (Integration legt sie je Vorschau an).
2. **Serverless-Treiber** (`@neondatabase/serverless` über HTTP/WebSocket) statt `pg`.
3. **Eigener Postgres-Server** (z. B. bei einem EU-Hoster) mit PgBouncer.

## Bewertung

Weg 2 bindet die App an einen Anbieter und ersetzt den Treiber in Code und Tests (PGlite/pg-Zweig in `src/lib/db`); Weg 3 verlagert Betrieb, Backups und Pooling auf die Gemeinde. **Weg 1 gewählt:** keine Codeänderung am Zugriff (Drizzle über `pg`), nur Pool-Einstellungen; Datenbank in Frankfurt, Backups/PITR beim Anbieter, Branches für Vorschauen. Der Docker-Weg (ADR 0017) bleibt unverändert lauffähig.

## Festlegungen

- `src/lib/db/index.ts`: Auf Vercel (`VERCEL=1`) kleiner Pool (`max: 5`, `idleTimeoutMillis: 5000`) und `attachDatabasePool(pool)` – Vercel schließt ruhende Verbindungen, bevor die Instanz eingefroren wird. Außerhalb von Vercel unverändert (`max: 10`).
- Neue Abhängigkeit `@vercel/functions` 3.9.x (Apache-2.0, ≈ 180 KB entpackt, eine Abhängigkeit `@vercel/oidc`, von Vercel gepflegt) – G6: der vorhandene Stack kann ruhende Verbindungen vor dem Einfrieren nicht schließen.
- Verbindungszeichenfolge: `DATABASE_URL` mit Pooler-Adresse (`-pooler`) und `sslmode=require`; Region der Datenbank = Region der Funktionen (fra1, ADR 0019/`vercel.json`).
- Vorschauen: `DATABASE_URL` nur im Bereich *Preview* über die Neon-Integration (Branch je Vorschau). Die Startprüfung (`lib/umgebung.ts`) meldet eine Vorschau ohne eigene Datenbank als Hinweis, nie als Fehler.
- Gemeinsamer Zustand liegt bereits in der Datenbank (Sitzungen, Ratenfenster, ALTCHA, Sperren, Mail-Ausgang) – nichts hängt am Dateisystem einer Instanz (V-07); Medien siehe ADR 0020.

## Umkehrprobe

Falsch, wenn unter Last Verbindungen ausgehen (zu viele Instanzen × `max`). Dann `max` senken oder auf Weg 2 wechseln; beides bleibt hinter `src/lib/db` verborgen.

## Folgen zweiter Ordnung

- Kalte Instanzen bauen beim ersten Zugriff eine Verbindung auf (+ ≈ 20–50 ms in Frankfurt).
- Neon-Branches kosten nach Ablauf des Kontingents; die Integration räumt Branches gelöschter Vorschauen auf (Runbook `docs/deploy/VERCEL.md`).
