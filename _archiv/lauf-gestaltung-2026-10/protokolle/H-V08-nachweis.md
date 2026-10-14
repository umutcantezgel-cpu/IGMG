# H-V08 · Nachweis: Änderungen in der Verwaltung sind sofort öffentlich sichtbar

- Prüfer: Paket H-V08 (Rolle Prüfer). Lauf gestartet 2026-10-11T23:34:28.209Z (UTC), beendet 2026-10-11T23:35:42.566Z.
- Server: http://127.0.0.1:3500 (eingefrorener Build, Ordner `head/standalone`), PID 24497, Start Sun Oct 11 21:23:47 2026, Health 200.
- Anmeldestand: `head/verwaltung-werkzeug/verwaltung-state.json` (Origin 127.0.0.1:3500). Der Bericht H-BILD-HEAD.md fehlt im Repo und im Scratchpad; der Anmeldestand war gültig (Verwaltungslisten laden ohne Weiterleitung).
- Zeitbasis: Node-Zeit, UTC, Millisekunden. T0 = erster Zeitpunkt, an dem die Erfolgsmeldung „Die Änderungen wurden gespeichert.“ im Verwaltungsformular steht.
- Abrufe: je Abruf ein frischer, nicht angemeldeter Browser-Kontext (kein Cookie, kein Browser-Cache). Erstabruf sofort nach T0, danach jede 1 s bis 30 s, bis der Text sichtbar ist.
- „Sichtbar“: der Text „Gemeinschaftsküche erweitert (V08-Test)“ bzw. „Arabisch Sprachkurs (V08-Test)“ steht im sichtbaren Textkörper der Seite. Prüfung alle 100 ms bis 3 s nach dem Ladeereignis.
- Grenze: nur EINE Instanz (lokal). Ob das über alle Instanzen auf Vercel gilt, ist nicht geprüft (ADR 0024, offene Frage).
- Messung: 3 Läufe, Median. Gebetszeiten nicht geändert.

## Schritt 1 · Ausgangswert (öffentlich, frischer Kontext)
Zeitstempel: 2026-10-11T23:34:31.311Z · Erwartung: alter Titel sichtbar, kein Testzusatz · Bilder: `01-ausgang-*.jpg`

| Ziel | Seite | Zeitstempel (UTC) | HTTP | Alter Titel sichtbar (ohne Testzusatz) | H1 |
|---|---|---|---|---|---|
| nachricht | Detailseite | 2026-10-11T23:34:31.312Z | 200 | ja | Gemeinschaftsküche erweitert |
| nachricht | Liste /nachrichten | 2026-10-11T23:34:31.710Z | 200 | ja | Nachrichten |
| nachricht | Startseite (Neuigkeiten-Block) | 2026-10-11T23:34:32.210Z | 200 | ja | IGMG Wetzlar |
| veranstaltung | Detailseite | 2026-10-11T23:34:32.787Z | 200 | ja | Arabisch Sprachkurs |
| veranstaltung | Liste /veranstaltungen | 2026-10-11T23:34:33.732Z | 200 | ja | Veranstaltungen |
| veranstaltung | Startseite (Veranstaltungs-Block) | 2026-10-11T23:34:34.421Z | 200 | ja | IGMG Wetzlar |

## Neuigkeit: Speichern und Sichtbarkeit (Median aus 3 Läufen)
Erwartung: Erfolgsmeldung, neuer Titel auf allen drei Seiten, Erstabruf ≤ 2 s nach T0. Bilder: `02-verwaltung-*.jpg`, `03-*.jpg` (Lauf 1).

| Lauf | Klick Speichern (UTC) | T0 (UTC) | Feld vorher | Feld nachher |
|---|---|---|---|---|
| 1 | 2026-10-11T23:34:45.216Z | 2026-10-11T23:34:46.459Z | Gemeinschaftsküche erweitert | Gemeinschaftsküche erweitert (V08-Test) |
| 2 | 2026-10-11T23:35:18.418Z | 2026-10-11T23:35:19.069Z | Gemeinschaftsküche erweitert | Gemeinschaftsküche erweitert (V08-Test) |
| 3 | 2026-10-11T23:35:30.901Z | 2026-10-11T23:35:31.566Z | Gemeinschaftsküche erweitert | Gemeinschaftsküche erweitert (V08-Test) |

| Seite | URL | Lauf 1 (s) | Lauf 2 (s) | Lauf 3 (s) | Median (s) | Abrufe je Lauf | Erstabruf sichtbar und Start ≤ 2 s (alle Läufe) | HTTP (Lauf 1) | x-nextjs-cache (Lauf 1) | Cache-Control (Lauf 1) |
|---|---|---|---|---|---|---|---|---|---|---|
| Detailseite | /nachrichten/gemeinschaftskueche-erweitert | 1.78 | 1.70 | 1.40 | 1.70 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |
| Liste /nachrichten | /nachrichten | 2.54 | 1.60 | 1.41 | 1.60 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |
| Startseite (Neuigkeiten-Block) | / | 2.51 | 1.55 | 1.20 | 1.55 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |

### Rückbau (Erwartung: alter Titel zurück, Testzusatz weg, Erstabruf ≤ 2 s)

| Lauf | Klick Rückbau (UTC) | T0 (UTC) | Feld nach Rückbau |
|---|---|---|---|
| 1 | 2026-10-11T23:35:02.252Z | 2026-10-11T23:35:02.745Z | Gemeinschaftsküche erweitert |
| 2 | 2026-10-11T23:35:25.310Z | 2026-10-11T23:35:25.796Z | Gemeinschaftsküche erweitert |
| 3 | 2026-10-11T23:35:36.519Z | 2026-10-11T23:35:36.860Z | Gemeinschaftsküche erweitert |

| Seite | URL | Lauf 1 (s) | Lauf 2 (s) | Lauf 3 (s) | Median (s) | Abrufe je Lauf | Erstabruf sichtbar und Start ≤ 2 s (alle Läufe) | HTTP (Lauf 1) | x-nextjs-cache (Lauf 1) | Cache-Control (Lauf 1) |
|---|---|---|---|---|---|---|---|---|---|---|
| Detailseite | /nachrichten/gemeinschaftskueche-erweitert | 1.65 | 1.34 | 1.05 | 1.34 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |
| Liste /nachrichten | /nachrichten | 2.27 | 1.24 | 0.88 | 1.24 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |
| Startseite (Neuigkeiten-Block) | / | 2.30 | 1.37 | 0.94 | 1.37 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |

## Veranstaltung: Speichern und Sichtbarkeit (Median aus 3 Läufen)
Erwartung: Erfolgsmeldung, neuer Titel auf allen drei Seiten, Erstabruf ≤ 2 s nach T0. Bilder: `02-verwaltung-*.jpg`, `03-*.jpg` (Lauf 1).

| Lauf | Klick Speichern (UTC) | T0 (UTC) | Feld vorher | Feld nachher |
|---|---|---|---|---|
| 1 | 2026-10-11T23:34:54.539Z | 2026-10-11T23:34:55.031Z | Arabisch Sprachkurs | Arabisch Sprachkurs (V08-Test) |
| 2 | 2026-10-11T23:35:21.823Z | 2026-10-11T23:35:22.154Z | Arabisch Sprachkurs | Arabisch Sprachkurs (V08-Test) |
| 3 | 2026-10-11T23:35:33.961Z | 2026-10-11T23:35:34.280Z | Arabisch Sprachkurs | Arabisch Sprachkurs (V08-Test) |

| Seite | URL | Lauf 1 (s) | Lauf 2 (s) | Lauf 3 (s) | Median (s) | Abrufe je Lauf | Erstabruf sichtbar und Start ≤ 2 s (alle Läufe) | HTTP (Lauf 1) | x-nextjs-cache (Lauf 1) | Cache-Control (Lauf 1) |
|---|---|---|---|---|---|---|---|---|---|---|
| Detailseite | /veranstaltungen/arabisch-sprachkurs | 2.42 | 1.82 | 1.19 | 1.82 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |
| Liste /veranstaltungen | /veranstaltungen | 2.13 | 1.79 | 1.26 | 1.79 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |
| Startseite (Veranstaltungs-Block) | / | 2.20 | 2.12 | 1.22 | 2.12 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |

### Rückbau (Erwartung: alter Titel zurück, Testzusatz weg, Erstabruf ≤ 2 s)

| Lauf | Klick Rückbau (UTC) | T0 (UTC) | Feld nach Rückbau |
|---|---|---|---|
| 1 | 2026-10-11T23:35:10.126Z | 2026-10-11T23:35:11.066Z | Arabisch Sprachkurs |
| 2 | 2026-10-11T23:35:28.001Z | 2026-10-11T23:35:28.339Z | Arabisch Sprachkurs |
| 3 | 2026-10-11T23:35:38.744Z | 2026-10-11T23:35:39.143Z | Arabisch Sprachkurs |

| Seite | URL | Lauf 1 (s) | Lauf 2 (s) | Lauf 3 (s) | Median (s) | Abrufe je Lauf | Erstabruf sichtbar und Start ≤ 2 s (alle Läufe) | HTTP (Lauf 1) | x-nextjs-cache (Lauf 1) | Cache-Control (Lauf 1) |
|---|---|---|---|---|---|---|---|---|---|---|
| Detailseite | /veranstaltungen/arabisch-sprachkurs | 1.40 | 1.00 | 0.86 | 1.00 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |
| Liste /veranstaltungen | /veranstaltungen | 1.41 | 1.35 | 1.46 | 1.41 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |
| Startseite (Veranstaltungs-Block) | / | 1.67 | 1.18 | 1.46 | 1.46 | 1 / 1 / 1 | ja | 200 | MISS | s-maxage=3600, stale-while-revalidate=82800 |

## Endzustand
| Ziel | Titel im Formular | Gleich Ausgangswert |
|---|---|---|
| nachricht | Gemeinschaftsküche erweitert | ja |
| veranstaltung | Arabisch Sprachkurs | ja |

## Schritt 4 · Gebetszeit-Korrektur
Nicht durchgeführt. Auftrag: Gebetszeiten-Logik unantastbar, nicht ändern.

## Schritt 6 · Cache-Header (curl -sI)
Erwartung laut ADR 0023 und `web/next.config.ts`: `/bilder/*` und `/symbole/*` mit `public, max-age=86400, stale-while-revalidate=604800`, ohne `immutable`; `/_next/static/*` versioniert.

| Pfad | Statuszeile | Cache-Control | Prüfung |
|---|---|---|---|
| /bilder/logos/logo-igmg-wetzlar.png | HTTP/1.1 200 OK | public, max-age=86400, stale-while-revalidate=604800 | entspricht ADR 0023 (1 Tag + SWR, kein immutable) |
| /symbole/symbol-192.png | HTTP/1.1 200 OK | public, max-age=86400, stale-while-revalidate=604800 | entspricht ADR 0023 (1 Tag + SWR, kein immutable) |
| /_next/static/chunks/1zefyuwh5o6dn.css | HTTP/1.1 200 OK | public, max-age=31536000, immutable | versioniert, immutable |
| /de | HTTP/1.1 307 Temporary Redirect | – | Weiterleitung (307), kein eigener Cache-Header |
| / | HTTP/1.1 200 OK | s-maxage=3600, stale-while-revalidate=82800 | – |

Vollständige Kopfzeilen (ohne Set-Cookie): `H-V08-roh.json`.

## Hinweise
- Vorlauf (Rohdaten H-V08-vorlauf-roh.json): Ein erster Lauf hat die Prüfung einmal direkt nach dem Ladeereignis gemacht. Dabei war der Text der Detailseite beim Ausgangstitel kurz leer und wurde als „nicht sichtbar“ gewertet. Der Vorlauf hat die Titel gesetzt und wieder zurückgesetzt. Seine Werte gehen nicht in die Ergebnisse ein; die Messung ist danach auf Abfrage innerhalb von 3 s nach dem Ladeereignis umgestellt.

## Bildbelege
Ordner: `/home/user/IGMG/_werkstatt/bilder/H-V08`. Dateien: `01-ausgang-*` (Ausgang), `02-verwaltung-*` (Speichern im Formular), `03-*` (nach Speichern, Lauf 1), `05-verwaltung-rueckbau-*` und `05-rueckbau-*` (Rückbau, Lauf 1).

