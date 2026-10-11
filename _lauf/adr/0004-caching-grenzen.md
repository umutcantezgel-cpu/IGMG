# ADR 0004 – Caching-Grenzen (statisch, gecacht, je Anfrage)

- Status: angenommen · 2026-10-11 · P1 · Kern 1.0 · Bezug: K-01, K-08, K-12, K-14, Z-04, Z-09 · Grundlage: Lichtung (a), Doku `node_modules/next/dist/docs/01-app` (use-cache, cacheLife, updateTag, ensureStatic)

## Ziel
Öffentliche Seiten sind statisch bzw. aus dem Cache schnell (K-12), lesen keine Cookies (K-01) und zeigen Änderungen aus der Verwaltung sofort ohne Neustart (Z-04).

## Wege
1. **Alles dynamisch** je Anfrage, Datenbank direkt.
2. **Cache Components:** Datenfunktionen mit `'use cache'` + `cacheLife('max')` + `cacheTag`, Server Actions der Verwaltung rufen `updateTag`; Seiten mit `ensureStatic`.
3. **Klassisches ISR** mit `revalidate`-Zeiten.

## Bewertung
Weg 1 verfehlt K-12 und belastet die DB; Weg 3 ist mit `cacheComponents` abgelöst und zeigt Änderungen verzögert. **Weg 2 gewählt** (Kern K-01), in Lichtung (a) bestätigt.

## Festlegungen
| Bereich | Rendering | Daten | Invalidierung |
|---|---|---|---|
| Öffentliche Inhaltsseiten (Über uns, Vorstand, Projekte, IGMG, Organisationen, Korankurse, Impressum, Datenschutz) | statisch, `export const ensureStatic = 'navigation'` | Query-Funktionen in `src/server/queries/*` mit `'use cache'`, `cacheLife('max')`, `cacheTag('seiteninhalt:<bereich>')` | `updateTag` in der Server Action |
| Listen (Veranstaltungen, Nachrichten, Startseite) | statisch, `ensureStatic = 'navigation'` | wie oben, Tags `veranstaltungen`, `nachrichten`, `ankuendigungen` | `updateTag` (Liste + Einzel-Tag) |
| Detailseiten `[slug]` | statische Hülle, `generateStaticParams` mit allen veröffentlichten Slugs; unbekannte Slugs werden bei Bedarf gerendert und gecacht; nicht gefunden → `notFound()` | `'use cache'`, Tag `veranstaltung:<id>` | `updateTag` |
| Gebetszeiten | statisch; Tageszeiten des Monats aus Cache-Funktion (`gebetszeiten:<jjjj-mm>`) | „Nächstes Gebet/Restzeit“ rechnet der Browser (K-08) | `updateTag` beim Import/Umstellen |
| Suche `/suche` | statische Hülle + dynamischer Ergebnisteil in `<Suspense>` (liest `searchParams`) | DB-Volltext je Anfrage | – |
| Formulare (Seiten) | statisch; Absenden über Server Action (immer dynamisch) | – | – |
| ALTCHA-Challenge, iCal, Abo-Feeds, Health, Löschfristen | Route Handler | iCal/Feeds mit `'use cache'` + Tags; Challenge nie gecacht | – |
| Verwaltung `/verwaltung/**` | je Anfrage (liest Sitzungs-Cookie), Teile in `<Suspense>` | direkt | – |

- Datum/Zeit: kein `new Date()` im Prerender außerhalb von Cache-Funktionen mit Argument (Build-Abbruch laut Doku); „heute“ wird als Argument (Datum in Europe/Berlin) übergeben bzw. im Browser bestimmt.
- Cache-Tags zentral in `src/lib/cache/tags.ts` (keine Freitext-Tags).
- Header auf öffentlichen Seiten zeigt **keinen** Anmeldezustand (statisch „Anmelden“ → `/verwaltung`); der Anmeldezustand erscheint nur in der Verwaltung. Abweichung vom Design (Zustand `loggedIn`) → ABWEICHUNGEN.md.
- Die Verwaltung ist nur auf Deutsch: `/verwaltung/**`; `/tr/…` und `/en/…`-Varianten leitet der Proxy auf `/verwaltung/**` um.

## Umkehrprobe
Falsch, wenn der Cache auf mehreren Instanzen auseinanderläuft (In-Memory-Cache je Instanz): dann `cacheHandlers` mit gemeinsamem Speicher. Für den geplanten Betrieb auf **einer** Instanz (docker-compose) reicht der Standard; vermerkt in BETRIEB.md.

## Folgen zweiter Ordnung
- Jede Verwaltungs-Action muss die richtigen Tags aktualisieren → Integrationstest „Änderung sofort öffentlich sichtbar“ je Modul (Z-04).
- Builds brauchen eine erreichbare Datenbank (Prerender liest Inhalte); Dockerfile/BETRIEB beschreiben das (Build gegen Seed-DB oder `generateStaticParams` mit Mindestparameter).
