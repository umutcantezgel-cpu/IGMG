# ADR 0013 – Volltextsuche in drei Sprachen

- Status: angenommen · 2026-10-11 · P1 · Bezug: Welle D, K-02, K-03, K-12

## Ziel
Besucher finden Veranstaltungen, Nachrichten, Seiten und Wissensartikel in ihrer Sprache – ohne externen Suchdienst.

## Wege
1. **PostgreSQL-Volltext** mit generierten `tsvector`-Spalten je Sprache und GIN-Index.
2. **Clientseitige Suche** über einen statisch erzeugten Index (JSON).
3. **Externer Suchdienst** (Meilisearch o. Ä.).

## Bewertung
Weg 3 ist ein weiterer Dienst für Ehrenamtliche (Betrieb). Weg 2 belastet das JS-Budget (K-12). **Weg 1 gewählt** (Auftrag: „Suche über PostgreSQL-Volltext“).

## Festlegungen
- Je durchsuchbarer Tabelle Spalten `suche_de tsvector generated always as (to_tsvector('german', …))`, `suche_tr … ('turkish', …)`, `suche_en … ('english', …)` aus Titel und Klartext (`klartext jsonb` wird beim Speichern aus dem Rich-Text erzeugt), GIN-Index je Spalte; Rückfall: fehlt tr/en, wird der deutsche Text mit `'simple'` indiziert.
- Abfrage mit `websearch_to_tsquery(<konfig>, $1)` (parametrisiert) und `ts_rank`; nur veröffentlichte Inhalte.
- Route `/suche` (tr `/arama`, en `/search`) – **Ergänzung zu K-03** → KERN 1.1 (ENTSCHEIDUNGEN E-012). Statische Hülle, Ergebnisse dynamisch in `<Suspense>` (ADR 0004); Suchfeld im Header als Link zur Suchseite (kein Client-JS nötig).
- Prüfung in PGlite: `select cfgname from pg_ts_config` – fehlt `turkish`, wird in Tests `'simple'` genutzt (Konfiguration über Funktion `suchkonfig(locale)`).

## Umkehrprobe
Falsch, wenn Tippfehlertoleranz gefordert wird – dann `pg_trgm` ergänzen (in PostgreSQL und PGlite verfügbar).

## Folgen zweiter Ordnung
- Migrationen enthalten generierte Spalten (Drizzle `generatedAlwaysAs` mit `sql`).
