# H-FIX3 · Ganztagstermine iCal (Rückgabe, vom Orchestrator abgelegt)

=== H-FIX3 · Ganztägige Termine im iCal-Export ===

GEÄNDERTE DATEIEN
- /home/user/IGMG/web/src/server/queries/veranstaltungen.ts: `VeranstaltungsDaten` hat jetzt `ganztaegig: boolean`; `zuDaten` übernimmt `v.ganztaegig`. Cache-Schlüssel, Tags und `'use cache'`-Aufrufe unverändert.
- /home/user/IGMG/web/src/server/ical/veranstaltungen.ts: `alsTermine` reicht `ganztaegig` an `erzeugeKalender` weiter. Alle Feeds und die Einzel-.ics laufen über diese Funktion.
- /home/user/IGMG/web/src/lib/termine/ical.ts: ganztägige Termine als DATE-Werte. DTEND ist exklusiv und liegt am Folgetag. Ohne Ende dauert der Termin einen Tag. Mit Ende gilt der Tagesbeginn nach dem letzten Tag, ein Ende bis 12 h neben Mitternacht wird dorthin gerundet. Serien schreiben UNTIL und EXDATE als Datum. Neue interne Hilfen: `tagesbeginn`, `ganztaegigEnde`, `ganztaegigeSerie`.
- /home/user/IGMG/web/tests/unit/termine.test.ts: 8 neue Tests (einzeln, Gegenprobe ohne Kennzeichen, mehrtägig, Zeitumstellung am 25.10., Ende ohne Dauer, Serie, UNTIL in UTC, Zeitzonen-Block).
- /home/user/IGMG/web/tests/unit/ical-veranstaltungen.test.ts (neu): 5 Tests für die Verdrahtung `kalenderAntwort` → Feed. next-intl/server ist gemockt. Enthält einen Zeitzonen-Vergleich.

WAS UND WARUM
- Das Feld existiert: `veranstaltung.ganztaegig` (boolean, not null, default false), in `web/src/lib/db/schema/inhalte.ts:32` und in `drizzle/migrations/0000_grundstock.sql:281`. Schema und Migrationen habe ich nicht angefasst.
- Ursache bestätigt: Das Feld fehlte in der Query und in `alsTermine`, daher kam `allDay` nie an.
- Zeitzonen-Probe: Mit `berlin()` (TZDate) schreibt ical-generator in allen Zonen das Berliner Datum. Mit einem gewöhnlichen Date springt der Tag unter UTC und America/New_York um einen Tag zurück.
- Serien: UNTIL und EXDATE mit Uhrzeit (TZID) an einem DATE-Beginn verletzen RFC 5545 3.3.10. Jetzt stehen dort Datumswerte. Ein UNTIL mit UTC-Zeitpunkt wird auf das Ortszeit-Datum gebracht.
- Prüfung per Mutation: Ohne Verdrahtung schlagen 4 der neuen Feed-Tests fehl. Mit Date statt TZDate in `berlin()` schlagen 15 Tests fehl, darunter die Zeitzonen-Tests.

GEMEINSAME DATEIEN
- keine. globals.css, messages, next.config.ts, vercel.json und package.json habe ich nicht berührt.
- Im Arbeitsbaum liegen Änderungen anderer Pakete (u. a. globals.css, OrgKarte.tsx, Zeitleiste.tsx, WegBeobachter.tsx). Die habe ich nicht angefasst.

PRÜFUNG UND ERGEBNIS
- `TZ=UTC pnpm test:unit`: 35 Dateien, 599 Tests grün (3 erwartete Fehlschläge in der Suite, nicht von mir).
- `TZ=Europe/Berlin pnpm test:unit`: 35 Dateien, 599 Tests grün.
- Termin- und iCal-Dateien (73 Tests) unter TZ=Pacific/Auckland und TZ=America/New_York: grün.
- Integration, TZ=UTC: bilder-an-inhalten, formular-veranstaltungsanmeldung, verwaltung-veranstaltungen-grundlage, verwaltung-veranstaltungen-rollen, verwaltung-uebersicht. 5 Dateien, 81 Tests grün.
- Kein Integrationstest für die iCal-Route vorhanden (`grep -rn ical web/tests/integration` leer). Deshalb keine Erweiterung, sondern die Unit-Datei oben.
- `pnpm exec tsc --noEmit -p .`: ohne Fehler.
- `pnpm exec eslint` auf die 5 geänderten Dateien: ohne Befund.
- `pnpm exec prettier --check`: ohne Befund. Die Testdateien habe ich mit `--write` formatiert, nur meine Zeilen waren betroffen.
- Nicht gebaut, nicht committet, nicht gepusht.
- Hinweis: Der Cache der Veranstaltungsliste (`'use cache`, stündlich) kann in einem laufenden Prozess noch Einträge ohne das neue Feld halten. Dann behandelt der Export den Termin als zeitgebunden, bis der Cache erneuert ist. Nach einem Build ist das nicht der Fall.

BILDBELEGE
- Nicht zutreffend (keine Seite geändert).

OFFENE FRAGEN
1. Mehrtägige ganztägige Termine: Das Formular setzt `ende` für ganztägige Termine immer auf null (`web/src/lib/validierung/veranstaltung.ts`, `zuDatensatz`, Zeile mit `const ende = !e.ganztaegig && e.endeZeit ? …`). Eine Konvention für das Ende ganztägiger Termine in der Datenbank ist daher nicht festgelegt. Die Ausgabe nimmt an: `ende` ist der Tagesbeginn nach dem letzten Tag. Sollen mehrtägige ganztägige Termine in der Verwaltung möglich sein? Dann braucht das Formular ein Enddatum.
2. Befund außerhalb meines Auftrags (nicht geändert): Die öffentliche Karte zeigt ganztägige Termine mit „00:00 Uhr“. Gesehen im Code: `web/src/components/website/EventCard.tsx:64` und `:118` mit `zeitspanne` aus `web/src/lib/i18n/format.ts:48`. Im Browser nicht geprüft. Das Feld `ganztaegig` ist jetzt in `VeranstaltungsDaten` verfügbar, ein eigenes Paket könnte die Anzeige darauf stellen.
3. Aufräumen: Ein Fehlbefehl von mir hat `/unit-utc.log` im Wurzelverzeichnis angelegt (232 Byte, außerhalb des Projekts). Das Löschen hat die Sicherheitsprüfung abgelehnt, ich habe es nicht erneut versucht. Bitte manuell entfernen: `rm /unit-utc.log`.

=== ENDE H-FIX3 · BEREIT ZUR RÜCKGABE ===
