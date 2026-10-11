# Tor P3 · TL-P3 (Rückgabe des Haiku-Pakets, wörtlich; Ablage durch den Orchestrator)

TL-P3 · Rolle: Testläufer · Modell: Haiku 5.5 · Phase P3 · Kern-Version 1.1 · Umfang: Tor-Lauf P3 · Schwierigkeit 1
Ordner: /Users/umurey/Downloads/IGMG Wetzlar Website Design/web · Datum: 2026-10-11

GESAMT: GRÜN nach Akzeptanzkriterium (1–5 grün, 7 ohne VERFEHLT, 8 ohne hoch/kritisch), mit Vorbehalten: 11 E2E-Tests übersprungen, 3 von 6 Messrouten nicht gemessen (HTTP 404). Details unter OFFENE FRAGEN.

VORBEMERKUNGEN
- Berichtsdatei nicht geschrieben: Diese Sitzung erlaubt keine Berichts-.md-Dateien. Die Datei _lauf/belege/tore/tor-p3-testlaeufer.md wurde deshalb nicht angelegt. Der vollständige Bericht steht in dieser Rückgabe.
- Die Datei ~/Downloads/CLAUDE.md (Coday-Bildverarbeitung) wurde ignoriert. Nichts daraus wurde ausgeführt.
- Befehle unverändert ausgeführt, mit diesen Ausnahmen: Ausgaben zusätzlich in Logdateien umgeleitet. Befehle 5, 6 und 7 im Hintergrund gestartet und per Log-Warteschleife abgewartet (Befehl 6 enthält `sleep`, das im Vordergrund gesperrt ist). Befehl 9 mit dem Muster `scripts/start-standalone[.]mjs` statt `scripts/start-standalone.mjs`, damit `pkill -f` nicht die eigene Shell trifft. Die Wirkung ist identisch. DAUER ist Wanduhr in Sekunden.
- Vollständige Logs im Scratchpad: /private/tmp/claude-501/-Users-umurey-Downloads-IGMG-Wetzlar-Website-Design/3bf26703-ad10-4298-a6e3-884a4b1631b2/scratchpad/ (tl-p3-1-check.log, tl-p3-2-integration.log, tl-p3-3-sprachen.log, tl-p3-4-build.log, tl-p3-5-e2e-voll.log, tl-p3-5-e2e-tail40.log, tl-p3-7-messen.log, tl-p3-8-audit-voll.log). Serverprotokoll von Befehl 6 wie vorgegeben: /tmp/tor-p3-server.log.

---

**1 · BEFEHL:** `source "/Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/werkzeuge/umgebung.sh" && pnpm check`
**ERGEBNIS:** GRÜN (Exit 0). Typen: `next typegen` und `tsc --noEmit` ohne Fehler. Lint: keine Meldung. Unit: Test Files 10 passed (10), Tests 191 passed (191).
**FEHLER:** keine. Ausgabe wörtlich:
```
$ pnpm typen && pnpm lint && pnpm test:unit
$ next typegen && tsc --noEmit
Generating route types...
✓ Types generated successfully
$ eslint .
$ vitest run --project unit

 RUN  v5.0.3 /Users/umurey/Downloads/IGMG Wetzlar Website Design/web


 Test Files  10 passed (10)
      Tests  191 passed (191)
   Start at  04:53:36
   Duration  183ms (transform 53%, import 31%, tests 13%, worker 3%)
```
**DAUER:** 3 s

**2 · BEFEHL:** `source "/Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/werkzeuge/umgebung.sh" && pnpm test:integration`
**ERGEBNIS:** GRÜN (Exit 0). Test Files 3 passed (3). Tests 48 passed | 1 todo (49).
**FEHLER:** keine. Ausgabe wörtlich:
```
$ vitest run --project integration

 RUN  v5.0.3 /Users/umurey/Downloads/IGMG Wetzlar Website Design/web


 Test Files  3 passed (3)
      Tests  48 passed | 1 todo (49)
   Start at  04:53:41
   Duration  2.90s (import 88%, tests 8%, transform 3%)
```
**DAUER:** 3 s

**3 · BEFEHL:** `source "/Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/werkzeuge/umgebung.sh" && pnpm sprachen:pruefen`
**ERGEBNIS:** GRÜN (Exit 0). 429 Schlüssel in de, tr, en; dazu 234 Schlüssel der Verwaltung.
**FEHLER:** keine. Ausgabe wörtlich:
```
$ node scripts/sprachen-pruefen.mjs
Sprachdateien vollständig: 429 Schlüssel in de, tr, en; dazu 234 Schlüssel der Verwaltung (nur de, ADR 0016).
```
**DAUER:** 1 s

**4 · BEFEHL:** `source "/Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/werkzeuge/umgebung.sh" && pnpm build`
**ERGEBNIS:** GRÜN (Exit 0). Compiled successfully in 2.7s. Finished TypeScript in 3.3s. 148 statische Seiten erzeugt (148/148).
**FEHLER:** keine. Build-Ausgabe wörtlich:
```
$ next build
▲ Next.js 16.4.0 (Turbopack)
- Environments: .env
✓ Running next.config.ts took 30ms
- Cache Components enabled
- Partial Prefetching enabled

  Creating an optimized production build ...
✓ Compiled successfully in 2.7s
  Running TypeScript ...
  Finished TypeScript in 3.3s ...
  Collecting page data using 13 workers ...
  Generating static pages using 13 workers (0/148) ...
  Generating static pages using 13 workers (37/148)
  Generating static pages using 13 workers (74/148)
  Generating static pages using 13 workers (111/148)
✓ Generating static pages using 13 workers (148/148) in 776ms
  Finalizing page optimization ...
```
Routentabelle vollständig, wörtlich wie ausgegeben:
```
Route (app)
┌ ○ /_not-found
├   /[locale]
│ ├ ◐ /[locale]
│ ├ ○ /de
│ ├ ○ /tr
│ └ ○ /en
├   /[locale]/gebetszeiten/anzeige
│ ├ ◐ /[locale]/gebetszeiten/anzeige
│ ├ ○ /de/gebetszeiten/anzeige
│ ├ ○ /tr/gebetszeiten/anzeige
│ └ ○ /en/gebetszeiten/anzeige
├   /[locale]/veranstaltungen
│ ├ ◐ /[locale]/veranstaltungen
│ ├ ○ /de/veranstaltungen
│ ├ ○ /tr/veranstaltungen
│ └ ○ /en/veranstaltungen
├   /[locale]/veranstaltungen/[slug]
│ ├ ◐ /[locale]/veranstaltungen/[slug]
│ ├ ○ /de/veranstaltungen/woechentlicher-qur-an-kurs
│ ├ ○ /de/veranstaltungen/frauenkreis-islamische-erziehung
│ └ ◐ [+37 more paths]
├   /[locale]/verwaltung
│ ├ ƒ /[locale]/verwaltung
│ ├ ƒ /de/verwaltung
│ ├ ƒ /tr/verwaltung
│ └ ƒ /en/verwaltung
├   /[locale]/verwaltung/anmelden
│ ├ ƒ /[locale]/verwaltung/anmelden
│ ├ ƒ /de/verwaltung/anmelden
│ ├ ƒ /tr/verwaltung/anmelden
│ └ ƒ /en/verwaltung/anmelden
├   /[locale]/verwaltung/anmelden/zwei-faktor
│ ├ ƒ /[locale]/verwaltung/anmelden/zwei-faktor
│ ├ ƒ /de/verwaltung/anmelden/zwei-faktor
│ ├ ƒ /tr/verwaltung/anmelden/zwei-faktor
│ └ ƒ /en/verwaltung/anmelden/zwei-faktor
├   /[locale]/verwaltung/einladung/[token]
│ ├ ◐ /[locale]/verwaltung/einladung/[token]
│ ├ ◐ /de/verwaltung/einladung/[token]
│ ├ ◐ /tr/verwaltung/einladung/[token]
│ └ ◐ /en/verwaltung/einladung/[token]
├   /[locale]/verwaltung/kein-zugriff
│ ├ ƒ /[locale]/verwaltung/kein-zugriff
│ ├ ƒ /de/verwaltung/kein-zugriff
│ ├ ƒ /tr/verwaltung/kein-zugriff
│ └ ƒ /en/verwaltung/kein-zugriff
├   /[locale]/verwaltung/veranstaltungen
│ ├ ƒ /[locale]/verwaltung/veranstaltungen
│ ├ ƒ /de/verwaltung/veranstaltungen
│ ├ ƒ /tr/verwaltung/veranstaltungen
│ └ ƒ /en/verwaltung/veranstaltungen
├   /[locale]/verwaltung/veranstaltungen/[id]
│ ├ ◐ /[locale]/verwaltung/veranstaltungen/[id]
│ ├ ◐ /de/verwaltung/veranstaltungen/[id]
│ ├ ◐ /tr/verwaltung/veranstaltungen/[id]
│ └ ◐ /en/verwaltung/veranstaltungen/[id]
├   /[locale]/verwaltung/veranstaltungen/neu
│ ├ ƒ /[locale]/verwaltung/veranstaltungen/neu
│ ├ ƒ /de/verwaltung/veranstaltungen/neu
│ ├ ƒ /tr/verwaltung/veranstaltungen/neu
│ └ ƒ /en/verwaltung/veranstaltungen/neu
├   /[locale]/verwaltung/zwei-faktor
│ ├ ƒ /[locale]/verwaltung/zwei-faktor
│ ├ ƒ /de/verwaltung/zwei-faktor
│ ├ ƒ /tr/verwaltung/zwei-faktor
│ └ ƒ /en/verwaltung/zwei-faktor
├ ƒ /api/altcha
├ ƒ /api/auth/[...all]
├ ƒ /api/health
├ ƒ /api/ical/[sprache]/organisation/[organisation]
├ ƒ /api/ical/[sprache]/veranstaltung/[slug]
├ ƒ /api/ical/[sprache]/veranstaltungen
└ ƒ /api/wartung/cache-erneuern


ƒ Proxy (Middleware)

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
ƒ  (Dynamic)            server-rendered on demand
```
**OFFENE FRAGE 3:** „[+37 more paths]“ ist eine Kürzung der Next-Build-Ausgabe selbst. Die 37 Pfade dieser Gruppe sind nicht ausgegeben und deshalb nicht prüfbar. Die Tabelle enthält keine Route /gebetszeiten (nur /[locale]/gebetszeiten/anzeige), keine /nachrichten und keine /bildung/voranmeldung.
**DAUER:** 8 s

**5 · BEFEHL:** `source "/Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/werkzeuge/umgebung.sh" && pnpm test:e2e --reporter=line 2>&1 | tail -40`
**ERGEBNIS:** GRÜN mit Vorbehalt (Exit 0). 131 passed, 11 skipped, 142 Tests gesamt. Beide Projekte (telefon, desktop) gelaufen. test-results/.last-run.json: `"status": "passed"`, `"failedTests": []`.
**FEHLER:** keine fehlgeschlagenen Tests. Im Vollprotokoll (165 Zeilen) gibt es keine Fehlerzeilen. Die Treffer für „skip“ sind der Testname „Skip to content“ und die Zusammenfassung. Ausgabe von `tail -40` wörtlich:
```
[119/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:199:7 › tr: Abschnitt #anmeldung hat die Überschrift „Kayıt“
[120/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:76:7 › en: h1 „Events“ und mindestens eine Karte sichtbar
[121/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:82:7 › en: Schaltfläche „All“ ist beim Öffnen aktiv
[122/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:87:7 › en: Kategorie-Schalter blendet andere Karten aus, sichtbare Karten tragen das Kategorie-Etikett
[123/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:121:7 › en: Kategorie ohne Termine zeigt Leerzustand, „All“ zeigt wieder alle Karten
[124/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:152:7 › en: „Subscribe to calendar (iCal)“ zeigt auf den Veranstaltungs-Feed und liefert einen Kalender
[125/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:168:7 › en: „View details“ der ersten Karte öffnet die Detailseite mit dem Kartentitel als h1
[126/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:173:7 › en: Breadcrumb der Detailseite enthält einen Link zu den Veranstaltungen
[127/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:179:7 › en: „Save“ ist ein Link auf die Kalenderdatei des Termins
[128/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:194:7 › en: unbekannter Slug antwortet mit HTTP 404
[129/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:199:7 › en: Abschnitt #anmeldung hat die Überschrift „Registration“
[130/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:206:5 › de: Sprachwahl im Kopf wechselt von der Liste auf /tr/etkinlikler
[131/142] [desktop] › tests/e2e/veranstaltungen.spec.ts:221:5 › en: Detailseite /en/events/<slug> hat lang="en"; deutsche h1 ohne Übersetzung trägt lang="de"
[132/142] [desktop] › tests/e2e/verwaltung-anmeldung.spec.ts:23:5 › Öffentliche Registrierung über HTTP ist gesperrt
[133/142] [desktop] › tests/e2e/verwaltung-anmeldung.spec.ts:31:5 › Ohne Anmeldung führt die Verwaltung zur Anmeldeseite
[134/142] [desktop] › tests/e2e/verwaltung-anmeldung.spec.ts:37:5 › Ungültige Einladung zeigt eine Fehlermeldung
[135/142] [desktop] › tests/e2e/verwaltung-anmeldung.spec.ts:42:5 › Einladung annehmen, Zwei-Faktor einrichten und mit TOTP anmelden
[desktop] › tests/e2e/verwaltung-anmeldung.spec.ts:42:5 › Einladung annehmen, Zwei-Faktor einrichten und mit TOTP anmelden
$ tsx --env-file-if-exists=.env scripts/einladen.ts --email testperson.e0f619c0@example.test --name 'Testperson Eins' --rolle administration --nur_token

[WebServer] 2026-10-11T02:56:09.034Z WARN [Better Auth]: Invalid password

[136/142] [desktop] › tests/e2e/verwaltung-veranstaltungen.spec.ts:28:5 › Veranstaltung anlegen, öffentlich sehen, Papierkorb und endgültig löschen
[desktop] › tests/e2e/verwaltung-veranstaltungen.spec.ts:28:5 › Veranstaltung anlegen, öffentlich sehen, Papierkorb und endgültig löschen
$ tsx --env-file-if-exists=.env scripts/einladen.ts --email testperson.8fb92739@example.test --name 'Testperson Eins' --rolle administration --nur_token

[137/142] [desktop] › tests/e2e/verwaltung-veranstaltungen.spec.ts:110:5 › Organisationsredaktion: nur eigene Organisation, fremde Termine nur lesen
[desktop] › tests/e2e/verwaltung-veranstaltungen.spec.ts:110:5 › Organisationsredaktion: nur eigene Organisation, fremde Termine nur lesen
$ tsx --env-file-if-exists=.env scripts/einladen.ts --email testperson.beeeae00@example.test --name 'Testperson Eins' --rolle organisationsredaktion --nur_token --organisation gt

[138/142] [desktop] › tests/e2e/verwaltung-veranstaltungen.spec.ts:126:5 › Ohne Anmeldung: Verwaltungsseiten leiten zur Anmeldung
[desktop] › tests/e2e/datenschutz.spec.ts:241:5 › Nach dem Besuch aller Routen: keine Cookies, nur igmg-Speicherschlüssel
Gefundene Speicherschlüssel: localStorage [igmg-konzepthinweis-gesehen], sessionStorage []

[139/142] [desktop] › tests/e2e/datenschutz.spec.ts:290:7 › Gegenprobe der Prüfregeln › Verstöße werden mit Namen gemeldet, Erlaubtes bleibt frei
[140/142] [desktop] › tests/e2e/datenschutz.spec.ts:310:7 › Gegenprobe der Prüfregeln › Speicherschlüssel ohne Präfix igmg- werden gemeldet
[141/142] [desktop] › tests/e2e/datenschutz.spec.ts:316:7 › Gegenprobe der Prüfregeln › Set-Cookie-Kopfzeilen werden erkannt
[142/142] [desktop] › tests/e2e/datenschutz.spec.ts:325:7 › Gegenprobe der Prüfregeln › CSP-Prüfung meldet Drittanbieter-Hosts und fehlendes default-src
  11 skipped
  131 passed (1.9m)
```
Hinweis (Test grün): Die Warnung `[WebServer] 2026-10-11T02:56:09.034Z WARN [Better Auth]: Invalid password` steht im Lauf nach [135/142] tests/e2e/verwaltung-anmeldung.spec.ts:42:5. Der Test ist grün.
**OFFENE FRAGE 1:** Welche 11 Tests übersprungen wurden, ist aus dem Lauf nicht ermittelt. Der Line-Reporter nennt übersprungene Tests nicht. Die Datei test-results/ergebnis.json wurde nicht erzeugt, weil `--reporter=line` die Reporter der Konfiguration ersetzt. Im Quellcode stehen diese Überspringungen (nicht einzeln im Lauf bestätigt):
- tests/e2e/verwaltung-anmeldung.spec.ts:11: test.skip im beforeEach, nur Projekt ungleich desktop
- tests/e2e/verwaltung-veranstaltungen.spec.ts:23: test.skip im beforeEach, nur Projekt ungleich desktop
- tests/e2e/datenschutz.spec.ts:287: test.skip im beforeEach der Gegenprobe, nur Projekt ungleich desktop
- bedingte test.fixme, nur bei fehlenden Testdaten: tests/e2e/datenschutz.spec.ts:224 und :257 (Text „OFFENE FRAGE“), tests/e2e/veranstaltungen.spec.ts:106 und :139 (Text „(offen)“)

Die volle E2E-Suite ist damit nicht vollständig ausgeführt.
**DAUER:** 113 s (Playwright: 1.9m)

**6 · BEFEHL:** `(PORT=3100 node scripts/start-standalone.mjs > /tmp/tor-p3-server.log 2>&1 &) ; until curl … /api/health; …; curl -s -o /dev/null -w '%{http_code}\n' -X POST … /api/wartung/cache-erneuern` (Ordner web)
**ERGEBNIS:** GRÜN (Exit 0). Server gestartet, /api/health antwortet 200, Cache-Erneuerung HTTP 200.
**FEHLER:** keine. Ausgabe wörtlich: `200` und `EXIT=0`. Serverprotokoll /tmp/tor-p3-server.log wörtlich:
```
▲ Next.js 16.4.0
- Local:         http://localhost:3100
- Network:       http://0.0.0.0:3100
✓ Ready in 0ms
✓ Running next.config took 5ms
```
Hinweis: Der WARTUNG_TOKEN aus web/.env wurde nur als Authorization-Header an localhost gesendet und nicht ausgegeben.
**DAUER:** nicht gemessen (Hintergrundlauf)

**7 · BEFEHL:** `source "/Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/werkzeuge/umgebung.sh" && pnpm messen`
**ERGEBNIS:** GRÜN (Exit 0, kein VERFEHLT). Alle drei gemessenen Routen erfüllen die maßgeblichen Schwellen (Drosselung „devtools“).
**FEHLER:** keine. Ausgabe wörtlich:
```
$ node scripts/messen.mjs
übersprungen (HTTP 404): /gebetszeiten
übersprungen (HTTP 404): /nachrichten
übersprungen (HTTP 404): /bildung/voranmeldung
/: P 99 · A 100 · BP 96 · SEO 100 · LCP 1587 ms · CLS 0.002 · TBT 11 ms · JS 172.9 kB · (simuliert: P 93, LCP 3125 ms)
/veranstaltungen: P 99 · A 100 · BP 100 · SEO 100 · LCP 1583 ms · CLS 0.002 · TBT 10 ms · JS 175.5 kB · (simuliert: P 94, LCP 3079 ms)
/veranstaltungen/frauenkreis-islamische-erziehung: P 98 · A 100 · BP 100 · SEO 100 · LCP 1869 ms · CLS 0.002 · TBT 8 ms · JS 177.5 kB · (simuliert: P 94, LCP 3082 ms)

Zusammenfassung: /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/lighthouse/2026-10-11-02-57/ergebnis.md
```
Der Zeitstempel `EXIT=0 DAUER=72s` wurde von mir ergänzt.

ergebnis.md vollständig, wörtlich (Pfad: /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/lighthouse/2026-10-11-02-57/ergebnis.md; vom Skript geschrieben):
```
# Lighthouse mobil (T7, K-12) · 2026-10-11-02-57 · http://localhost:3100

Schwellen: Performance ≥ 90, Barrierefreiheit 100, Best Practices ≥ 95, SEO ≥ 95, LCP ≤ 2500 ms, CLS ≤ 0.1, TBT ≤ 200 ms (Labor-Ersatz für INP), JS ≤ 180 kB gzip.

Maßgeblich: Drosselung „devtools“ (angewandt). In Klammern der Lighthouse-Standard „simulate“ – gegen localhost zu pessimistisch (E-026); nach der Bereitstellung mit PageSpeed Insights gegenprüfen (M-065).

| Route | Perf. | Barr. | BP | SEO | LCP ms | CLS | TBT ms | JS kB | (sim. Perf. / LCP) | Ergebnis | nicht bestandene Prüfungen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 99 | 100 | 96 | 100 | 1587 | 0.002 | 11 | 172.9 | 93 / 3125 | erfüllt | errors-in-console |
| /veranstaltungen | 99 | 100 | 100 | 100 | 1583 | 0.002 | 10 | 175.5 | 94 / 3079 | erfüllt | – |
| /veranstaltungen/frauenkreis-islamische-erziehung | 98 | 100 | 100 | 100 | 1869 | 0.002 | 8 | 177.5 | 94 / 3082 | erfüllt | first-contentful-paint |
```
**OFFENE FRAGE 2:** Drei von sechs Messrouten sind nicht gemessen (NICHT GEPRÜFT): /gebetszeiten, /nachrichten und /bildung/voranmeldung antworten mit HTTP 404. Das Skript nennt sie als Standardrouten (PLAN L8). Die Build-Routentabelle aus Befehl 4 enthält sie ebenfalls nicht.
**OFFENE FRAGE 4 (Hinweise ohne Schwellenverletzung):** Startseite: Audit „errors-in-console“ nicht bestanden (Best Practices 96, Schwelle 95). Detailseite: Audit „first-contentful-paint“ nicht bestanden (kein Schwellenwert im Skript). Detailseite: JS 177.5 kB bei Schwelle 180 kB. Die simulierten LCP-Werte liegen bei 3079–3125 ms über 2500 ms. Das Skript bewertet sie laut eigenem Kommentar nicht als maßgeblich.
**DAUER:** 72 s

**8 · BEFEHL:** `source "/Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/werkzeuge/umgebung.sh" && pnpm audit --prod 2>&1 | tail -15`
**ERGEBNIS:** GRÜN (Exit 0). Lücken je Schwere: kritisch 0 · hoch 0 · moderat 0 · niedrig 0.
**FEHLER:** keine. Ausgabe wörtlich, identisch mit dem Vollprotokoll:
```
No known vulnerabilities found
```
**DAUER:** 1 s

**9 · BEFEHL:** `pkill -f "scripts/start-standalone[.]mjs"; P=$(lsof -nP -t -iTCP:3100 -sTCP:LISTEN); [ -n "$P" ] && kill $P` (Muster mit [.] siehe Vorbemerkung)
**ERGEBNIS:** GRÜN (erledigt). Vorher: Prozess 96738 `node scripts/start-standalone.mjs` und Listener PID 96743 auf Port 3100. Nachher: Port 3100 frei, kein passender Prozess.
**FEHLER:** keine.
**DAUER:** nicht gemessen

---

**SELBSTPRÜFUNG**
- `git -C "/Users/umurey/Downloads/IGMG Wetzlar Website Design" status --short` (wörtlich):
```
 M _lauf/ENTSCHEIDUNGEN.md
 M _lauf/MENSCHEN.md
 M _lauf/STATUS.md
 M web/docs/ABWEICHUNGEN.md
 M web/drizzle/seeds/index.ts
 M web/messages/neu-uebersetzt.json
 M web/scripts/sprachen-pruefen.mjs
 M web/src/i18n/request.ts
 M web/src/lib/validierung/seiteninhalte.ts
 M web/src/server/queries/gebetszeiten.ts
?? _lauf/belege/lighthouse/2026-10-11-02-57/
?? web/docs/BETRIEB.md
?? web/docs/MUSTER.md
?? web/drizzle/seeds/bereiche/
?? web/messages/bereiche/
?? web/src/app/[locale]/(website)/gebetszeiten/
?? web/src/components/website/anzeige/
?? web/src/lib/gebetszeiten/hijri.ts
?? web/src/lib/validierung/mehrsprachig.ts
?? web/src/lib/validierung/seiteninhalte/
?? web/tests/integration/hilfen/verwaltung.ts
?? web/tests/integration/verwaltung-veranstaltungen-grundlage.test.ts
?? web/tests/integration/verwaltung-veranstaltungen-rollen.test.ts
?? web/tests/unit/hijri.test.ts
```
Bewertung: Ich habe keine Projektdatei geschrieben. Dem Lauf zuzurechnen sind: _lauf/belege/lighthouse/2026-10-11-02-57/ (5 Dateien, von pnpm messen angelegt), sowie web/next-env.d.ts und web/tsconfig.tsbuildinfo (Zeitstempel 04:53, durch pnpm check aktualisiert; git status meldet sie nicht). Die übrigen Einträge stammen nicht aus meinen Befehlen. Ihre Zeitstempel liegen vor dem Start von pnpm check, z. B. web/docs/ABWEICHUNGEN.md 04:52:06 und web/docs/BETRIEB.md 04:53:11. Keiner der Befehle 1–9 schreibt nach web/docs.
- Akzeptanzkriterien:
  - Je Befehl BEFEHL, ERGEBNIS, FEHLER und DAUER angegeben. Bei 6 und 9 ist DAUER nicht gemessen.
  - Bei 4 ist die Routentabelle wörtlich vollständig zitiert. Die Kürzung „[+37 more paths]“ bleibt offen (OFFENE FRAGE 3).
  - Bei 7 ist die Tabelle aus ergebnis.md vollständig zitiert. Kein VERFEHLT.
  - Bei 8 Lücken je Schwere: kritisch 0, hoch 0, moderat 0, niedrig 0.
  - GESAMT: GRÜN nach Kriterium, mit Vorbehalten (OFFENE FRAGEN 1 bis 3).
  - Berichtsdatei: NICHT ERSTELLT (Systemvorgabe). Die Rückgabe ist identisch mit dem Bericht.

**OFFENE FRAGEN**
1. E2E: 11 übersprungene Tests, Namen nicht ermittelt (Details bei Befehl 5).
2. Messung: 3 von 6 Messrouten nicht gemessen, HTTP 404 (Details bei Befehl 7).
3. Build: „[+37 more paths]“ nicht aufgelöst (Details bei Befehl 4).
4. Lighthouse: Audits „errors-in-console“ (Startseite) und „first-contentful-paint“ (Detailseite) offen, Schwellen eingehalten.

=== ENDE TL-P3 · BEREIT ZUR RÜCKGABE ===
