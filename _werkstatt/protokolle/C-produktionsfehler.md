# Produktionsfehler C2 · Gegenprobe ohne Datenbank (2026-10-12)

Bau wie auf Vercel ohne `DATABASE_URL` (`node scripts/vercel-bau.mjs` mit `VERCEL=1`, also `db:bau-vorbereiten` und `next build` mit PGlite). Der Standalone-Server lief danach ohne `DATABASE_URL`, `BAU_PGLITE` und `PGLITE_VERZEICHNIS` (Port 3611, Kopie in `$SCRATCHPAD/pf-og`).

## Befunde aus der Produktion (Vercel-MCP, Laufzeitfehler)
1. Die ersten Abrufe von `/tr|en/opengraph-image/standard` endeten mit 500 und `DYNAMIC_SERVER_USAGE`. Ursache: `readFile` aus `node:fs/promises` im OG-Pfad, ungecacht und asynchron außerhalb von `'use cache'`. Bildrouten unter `[locale]` entstehen zur Laufzeit (ISR).
2. Auf `/de` erschien „DATABASE_URL fehlt“. Ursache: HTML-begrenzte Bots (WhatsApp, Slackbot, facebookexternalhit, Twitterbot, Bingbot …) umgehen die vorgerenderte Hülle.
3. Bei der Gegenprobe kam ein dritter Befund dazu: Die OG-Bilder von Beiträgen und Veranstaltungen entstehen zur Laufzeit und fragen die Datenbank ab.
   - Erst habe ich den Fehler nur abgefangen. Danach hing die Antwort (0 % CPU, nach über 3 Minuten keine Antwort).
   - Lösung: Zur Laufzeit ohne Datenbank wird gar nicht erst abgefragt (`datenbankVerfuegbar`), es gilt das Standardbild.

## Ergebnis am Fix-Stand (Ausgabe `gegenprobe.sh`)
```
== OG erste Anfrage je Pfad (frischer Server)
Bildpfade: opengraph-image-vegep3 opengraph-image-f0swox
200 image/png 55241B 0.397457s cache=MISS /opengraph-image/standard
200 image/png 48411B 0.347568s cache=MISS /tr/opengraph-image/standard
200 image/png 48656B 0.194589s cache=MISS /en/opengraph-image/standard
200 image/png 48411B 0.013392s cache=HIT /tr/opengraph-image/standard
200 image/png 55241B 0.206858s cache=MISS /nachrichten/gemeinschaftskueche-erweitert/opengraph-image-vegep3/beitrag
200 image/png 48411B 0.155647s cache=MISS /tr/nachrichten/neuer-imam-stellt-sich-vor/opengraph-image-vegep3/beitrag
200 image/png 48656B 0.168686s cache=MISS /en/nachrichten/gemeinschaftskueche-erweitert/opengraph-image-vegep3/beitrag
200 image/png 55241B 0.182358s cache=MISS /veranstaltungen/arabisch-sprachkurs/opengraph-image-f0swox/termin
200 image/png 48411B 0.159364s cache=MISS /tr/veranstaltungen/arabisch-sprachkurs/opengraph-image-f0swox/termin
200 image/png 55241B 0.115468s cache=MISS /nachrichten/gibt-es-nicht/opengraph-image-vegep3/beitrag
DATABASE_URL-fehlt: 1 · DYNAMIC_SERVER_USAGE: 0
== Bot- und Abruf-Probe
GET /tr                                    200 208189B cache=HIT pre=1              DBfehler+0
GET /en                                    200 206483B cache=HIT pre=1              DBfehler+0
GET /tr?x=1                                200 208189B cache=HIT pre=1              DBfehler+0
GET /tr RSC:1                              307 0B cache= pre=                       DBfehler+0
GET /tr RSC prefetch                       307 0B cache= pre=                       DBfehler+0
GET /tr segment /_tree                     307 0B cache= pre=                       DBfehler+0
GET /tr segment __PAGE__                   307 0B cache= pre=                       DBfehler+0
GET /tr?_rsc=abc RSC:1                     307 0B cache= pre=                       DBfehler+0
HEAD /tr                                   200 0B cache=HIT pre=1                   DBfehler+0
POST /tr form                              500 21439B cache=HIT pre=1               DBfehler+2
POST /tr multipart                         400 30B cache=HIT pre=1                  DBfehler+0
POST /tr Next-Action unbekannt             400 30B cache=HIT pre=1                  DBfehler+0
GET /tr UA Googlebot                       200 208189B cache=HIT pre=1              DBfehler+0
GET /tr UA Chrome (Browser)                200 208189B cache=HIT pre=1              DBfehler+0
GET /tr UA WhatsApp                        200 208189B cache=HIT pre=1              DBfehler+0
GET /tr UA facebookexternalhit             200 208189B cache=HIT pre=1              DBfehler+0
GET /tr UA Slackbot                        200 208189B cache=HIT pre=1              DBfehler+0
GET /tr UA Twitterbot                      200 208189B cache=HIT pre=1              DBfehler+0
GET /tr UA Bingbot                         200 208189B cache=HIT pre=1              DBfehler+0
GET /tr UA Discordbot                      200 208189B cache=HIT pre=1              DBfehler+0
GET /tr UA LinkedInBot                     200 208189B cache=HIT pre=1              DBfehler+0
GET /tr UA Chrome-Lighthouse               200 208189B cache=HIT pre=1              DBfehler+0
GET /tr/veranstaltungen UA WhatsApp        307 15B cache= pre=                      DBfehler+0
GET /tr/nachrichten UA Slackbot            307 12B cache= pre=                      DBfehler+0
GET /tr/veranstaltungen?x=1                307 19B cache= pre=                      DBfehler+0
GET /tr/nachrichten RSC:1                  307 12B cache= pre=                      DBfehler+0
== Bot-Durchlauf (WhatsApp-UA über alle vorgerenderten Seiten)
  404 /en/_
  404 /tr/_
HTTP 404: 2
HTTP 200: 130
DATABASE_URL-fehlt-Zeilen: 0
== Bekannte Grenzen
307 /tr/nachrichten/gibt-es-nicht
500 /veranstaltungen/gibt-es-nicht
200 /suche?q=moschee
DATABASE_URL-fehlt gesamt: 7 · DYNAMIC_SERVER_USAGE gesamt: 0
      6 ⨯ Error: DATABASE_URL fehlt (Betrieb braucht PostgreSQL).
      1 Error: The Server Reference ID did not match the expected format. Received "0000".
      1 Error: Invalid Server Actions request.
```

Prüfung je Anfrage am frischen Server: 8 OG-Bilder (Standard de/tr/en, Beitrag de/tr, Termin de, unbekannte Slugs) liefern 200 image/png mit 0 Zeilen „DATABASE_URL fehlt“.

## Einordnung
- **OG-Bilder:** Alle liefern bei der ersten Anfrage 200, auch die Unterseiten und unbekannte Slugs (Standardbild). Es gibt 0 × `DYNAMIC_SERVER_USAGE` und keine hängende Antwort.
- **Bots:** Alle Bot-UAs bekommen die vorgerenderte Hülle (200, Cache-Treffer) mit 0 DB-Fehlern. Der WhatsApp-Durchlauf über 132 Routen ergibt 130 × 200 und 0 DB-Fehler. Die 2 × 404 betreffen `/_`, den Platzhalter aus `generateStaticParams` bei leerer Liste, und sind gewollt.
- **Verbleibende DB-Fehler** sind die bekannten Grenzen des Beispielmodus (ADR 0019, Nachtrag 2026-10-12):
  - POST ohne `Next-Action` auf `/tr` (500).
  - Unbekannte Termin-Slugs (500 statt 404).
  - Die Suche mit Begriff: Die Hülle kommt mit 200, der Ergebnisteil scheitert.
  - Alle drei enden mit dem Anschluss der Datenbank.

## Produktion nach dem Fast-Forward (Vercel-MCP, nur lesend)
- main → 58a3344 um 10:48 UTC. Deployment `dpl_2yJkXGasRVpVRaB7L2KvW7Wjibsm` ist READY in fra1, Aliase `igmg-five.vercel.app` und `igmg-codays-projects.vercel.app`.
- Laufzeitfehler seit 10:51 UTC: keine. Bis 10:57 UTC gab es noch keinen Abruf; vor dem ABSCHLUSS lese ich erneut.
- Einordnung des 24-h-Clusters „DATABASE_URL fehlt“ (1041×) nach Deployment, Abfrage 16 h:
  - `dpl_DF7tp…` (Stand vor dem Cache-Profil-Fix vom 11.10.): 183 Zeilen, fast nur Segment-Abrufe.
  - `dpl_5Tvd5…` (71e263f) und `dpl_6TbZ2…` (1ca46e0): je 4 Zeilen, alle auf `/`. Das ist der Bot-Fall (Befund 2), behoben mit 58a3344.
- Unverändert und erwartet sind die Startprüfungs-Meldungen `[start] …` (fehlende Variablen, Menschen-Aufgaben ML) und „BETTER_AUTH_SECRET fehlt“ auf `/verwaltung/anmelden`. Die Verwaltung braucht Datenbank und Geheimnisse, Runbook Abschnitt 4.
- Nachtrag 15:35 UTC: main → fc08263 (Endstand mit Nacharbeit: JS /gebetszeiten, Menü- und Reiter-INP). `dpl_HgAErFQuAZ8JsDAnqZTLJVzjjx1P` ist READY in fra1. Laufzeitfehler seit 10:51 UTC: keine (`get_runtime_errors`). Laufzeitprotokoll der letzten 5 h ohne Einträge, also kaum Abrufe.
