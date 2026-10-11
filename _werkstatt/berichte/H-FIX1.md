# H-FIX1 · iCal-Zeitzone (Rückgabe, vom Orchestrator abgelegt)

Ursache: ical-generator liest ein normales Date mit den Gettern des Prozesses, sobald eine Zeitzone gesetzt ist; unter UTC steht 19:00 MESZ dann als 17:00 in der Datei. Zusätzlich schreibt die Kalenderzeitzone DTSTAMP und LAST-MODIFIED ohne „Z“ in Ortszeit, und `stempelInUtc` las diese Ziffern erneut als Berlin-Zeit, was nur in Berlin selbst stimmte.

GEÄNDERTE DATEIEN
- /home/user/IGMG/web/src/lib/termine/ical.ts
- /home/user/IGMG/web/tests/unit/termine.test.ts

WAS UND WARUM
- ical.ts: Beginn und Ende gehen als TZDate in Europe/Berlin hinein (`berlin()`, @date-fns/tz ist bereits Abhängigkeit, kein neues Paket). Der Kalender hat keine `timezone`-Option mehr, damit DTSTAMP, CREATED und LAST-MODIFIED als UTC mit „Z“ erscheinen. `stempelInUtc` (Regex-Rückumrechnung über Ortszeit) entfällt. `mitZeitzone()` setzt VTIMEZONE, TIMEZONE-ID und X-WR-TIMEZONE (`ZEITZONE_KOPF`) vor das erste Ereignis, ohne Ereignis vor END:VCALENDAR. Unverändert: `untilInUtc`, EXDATE-Format, Inhalte der Termine.
- Die alte Rückumrechnung wäre am 25.10. in der doppelt vorkommenden Stunde falsch gewesen: Ortszeit 02:30 wird von TZDate als 01:30 UTC gelesen, der Stempel 00:30 UTC wäre um eine Stunde verrutscht. Der neue Test deckt das ab.
- Keine Erwartung geändert. Die vier Fehlschläge unter UTC hatten richtige Erwartungen (Berliner Wanduhr); geändert hat sich nur die Implementierung.
- termine.test.ts: neuer describe-Block „iCal: Ausgabe unabhängig von der Zeitzone des Prozesses“ mit drei Tests. (1) Gleiche Datei in UTC, Europe/Berlin, America/New_York und Asia/Tokyo; `process.env.TZ` wird zur Laufzeit gesetzt und danach wiederhergestellt, die lokale Stunde belegt den Wechsel. Feste Werte: Sommer (19:00 MESZ, EXDATE, Stempel), Winter (19:00 MEZ = 18:00 UTC), Umstellungstag 29.03. (03:30 MESZ), Serie über beide Umstellungen (UNTIL 01.11. 23:59:59 MEZ = 22:59:59 UTC), Stempel 25.10. um 00:30 und 01:30 UTC. (2) Ein Feed ohne Termine bleibt gültig. (3) Die Zeitzone wird nach dem Test wiederhergestellt. Gegen den alten ical.ts schlägt der Vergleich fehl.

GEMEINSAME DATEIEN
- keine. `web/src/server/ical/*` unverändert, dort sind die Zeitpunkte bereits UTC-Instants.

PRÜFUNG UND ERGEBNIS
- `TZ=UTC pnpm test:unit`: 557 bestanden, 3 expected fail, 2 fehlgeschlagen (fremde Datei, siehe unten), gesamt 562. Die drei termine-Dateien sind grün.
- `TZ=Europe/Berlin pnpm test:unit`: identisch (557 bestanden, dieselben 2 fremden Fehlschläge).
- `TZ=America/New_York pnpm exec vitest run --project unit` für termine.test.ts, termine-grenzfaelle.test.ts und termine-regel.test.ts: 60 von 60 grün. Gleiches Ergebnis unter UTC, Berlin und Asia/Tokyo.
- `pnpm exec eslint` für ical.ts und die drei Testdateien: ohne Befund. `prettier --check`: sauber.
- `pnpm exec tsc --noEmit -p .`: Exit 0, keine Fehler.
- Rohprotokolle liegen im Scratchpad (`/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/h-fix1/`), nicht im Repo.

BILDBELEGE
- nicht zutreffend, keine Oberfläche.

OFFENE FRAGEN
1. Ganztagstermine: `ganztaegig` fehlt in `VeranstaltungsDaten` (web/src/server/queries/veranstaltungen.ts) und wird in `alsTermine` (web/src/server/ical/veranstaltungen.ts) nicht übergeben. Im Abo erscheinen Ganztagstermine deshalb als Termin um 00:00 Ortszeit. Das ist kein Zeitzonenfehler und die Query-Datei liegt nicht in meinen Schreibrechten, deshalb nicht geändert. Soll das ein eigenes Paket werden?
2. Fremde Datei: `web/tests/unit/styleguide-tokens.test.ts` (2 Tests) schlägt in beiden Läufen fehl. Die Token-Liste passt nicht zu `web/src/app/globals.css`, die gerade im Arbeitsbaum geändert wird. Gehört zur laufenden Arbeit an globals.css.
3. Bestand, nicht geändert: Ohne `aktualisiertAm` ist DTSTAMP der Beginn des Termins. RFC 5545 meint den Zeitpunkt, zu dem das Objekt erzeugt wurde. Soll das angepasst werden?

=== ENDE H-FIX1 · BEREIT ZUR RÜCKGABE ===
