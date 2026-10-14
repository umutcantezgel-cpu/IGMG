# H-STYLE · Styleguide-Spiegel (Rückgabe, vom Orchestrator abgelegt)

=== H-STYLE · Bericht (Baumeister) ===

GEÄNDERTE DATEIEN
- /home/user/IGMG/web/src/components/verwaltung/styleguide/tokens.ts (erweitert: neue Listen, ABSCHNITTE um raster, bewegung, ebenen ergänzt)
- /home/user/IGMG/web/src/components/verwaltung/styleguide/Typografie.tsx (Anzeigestufen display-1/-2, Zeilenhöhen)
- /home/user/IGMG/web/src/components/verwaltung/styleguide/Abstaende.tsx (Abschnittsabstände als Tokenkarten mit Vorschau)
- /home/user/IGMG/web/src/app/[locale]/verwaltung/(geschuetzt)/styleguide/page.tsx (Raster, Bewegung, Ebenen eingebunden)
- /home/user/IGMG/web/messages/verwaltung/styleguide.json (nur Deutsch; nav, typografie, abstaende, raster, bewegung, ebenen)
- /home/user/IGMG/web/tests/unit/styleguide-tokens.test.ts
- Neu: /home/user/IGMG/web/src/components/verwaltung/styleguide/Raster.tsx, Bewegung.tsx, Ebenen.tsx
- Neu: /home/user/IGMG/web/src/components/verwaltung/styleguide/BewegungsVorschau.tsx ('use client', nur Strings als Props)

WAS UND WARUM
- tokens.ts: ANZEIGESTUFEN (--text-display-1/-2, Muster text-display-1/-2), ABSCHNITTSABSTAENDE (--spacing-abschnitt[-klein], py-abschnitt[-klein]), ZEILENHOEHEN (--leading-ueberschrift/-einleitung), BREITEN (--container-inhalt/-text/-einleitung), HALTEPUNKTE (--breakpoint-md/-verwaltung/-menu), KURVEN (--ease-*), DAUERN (--dauer-*, aus :root), EBENEN (--ebene-*, aus :root).
- Die Vollständigkeitsprüfung verlangt alle Namen je Präfix. Deshalb sind auch --container-inhalt/-text, --breakpoint-md/-menu und --leading-ueberschrift aufgenommen, obwohl der Auftrag sie nicht nannte.
- Bewegung: vier Dauern und drei Kurven mit Wert und Zweck aus K-007 (Register-Nummern B-01 bis B-12). Jede Zeile hat eine Vorschau. Sie bewegt sich nur nach Knopfdruck (useState), nie von selbst. Dauer und Kurve kommen aus der Klasse, reduzierte Bewegung regelt globals.css (transition-duration 0,01 ms mit !important). Die Komponente prüft das nicht selbst.
- Ebenen: fünf Ebenen aufsteigend mit Klasse z-(--ebene-…), Wert und Verwendung. Die Zuordnung „bisher z-50/z-60/z-[100]“ stammt aus dem Code (Header, Seitenrahmen, Kopfmenüs, shadcn-Overlays).
- Raster und Breiten: nur Darstellung der Tokens, damit die Liste vollständig auf der Seite steht.
- Test: Vollständigkeit für --text- (text-anzeige-* bleibt ausgenommen), --spacing, --leading-, --container-, --breakpoint-, --ease-, :root (--dauer-, --ebene-). Werte gegen globals.css, clamp-Grenzen gegen das Token, Klassen gegen den Token, Texte für alle neuen Schlüssel. Keine Prüfung abgeschwächt.

GEMEINSAME DATEIEN
- Keine Änderung nötig. globals.css unverändert. Die Abweichungen zwischen K-005/K-007 und globals.css stehen unter OFFENE FRAGEN.

PRÜFUNG UND ERGEBNIS
- pnpm exec vitest run --project unit tests/unit/styleguide-tokens.test.ts: grün, 99 von 99 (vorher 2 Fehler bei Zeile 100 und 106).
- pnpm exec tsc --noEmit -p .: ohne Fehler (Log: $S/hstyle-tsc.log, leer).
- pnpm exec eslint auf die 9 geänderten Dateien: ohne Befund. Prettier auf meine Dateien ausgeführt.
- Tailwind-Probe gegen die kompilierte globals.css: alle neuen Klassen werden erzeugt (text-display-1/-2, leading-*, py-abschnitt[-klein], max-w-inhalt/-text/-einleitung, ease-*, duration-(--dauer-*), z-(--ebene-*), translate-x-28, transition-transform).
- freie-werte.mjs: keine Befunde in den neuen Dateien. Treffer in tokens.ts sind die vorhandenen Token-Werte, die die Seite anzeigt.
- Dev-Server 3200: /verwaltung/styleguide wird ohne Übersetzungsfehler kompiliert (dev-3200.log).
- Nicht geprüft: Verhalten der Vorschau im Browser, axe, E2E (tests/e2e/verwaltung-styleguide.spec.ts), Sichtprüfung. Alle brauchen eine Anmeldung. Die Vorschau ist nur per Code-Lektüre und CSS-Ausgabe geprüft.
- Kein Build, kein Commit, kein Push.

BILDBELEGE
- Keine. Das Bild $S/hstyle-styleguide-1440.jpg zeigt die Anmeldeseite, nicht den Styleguide. Bitte nicht verwenden.
- Grund: Die Test-Sitzung in $S/verwaltung-state.json (Cookie gültig bis 2026-10-12 01:24Z) gehört zur Datenbank auf 3100. Der 3200-Server nimmt sie nicht an. Eine neue Sitzung braucht eine Einladung in $S/pglite-dev. Die habe ich nicht angelegt. Der Dev-Server hält diese PGlite-Datenbank offen, und laut LIESMICH gilt „nur ein Prozess je Datenbank“. Ein paralleler Schreibzugriff könnte die Dev-DB beschädigen. anmeldung.mjs verweigert den Lauf aus demselben Grund.

OFFENE FRAGEN
1. Bild nachholen: Soll 3200 kurz gestoppt werden? Dann: DB_VERZEICHNIS=$S/pglite-dev node _werkstatt/werkzeuge/anmeldung.mjs einladen (Server gestoppt), danach 3200 starten, anmeldung.mjs anmelden --basis http://127.0.0.1:3200 und einzelbild mit --basis http://127.0.0.1:3200 (nicht localhost, sonst passt die Cookie-Domain nicht). Das überschreibt $S/verwaltung-state.json.
2. Abschnittsabstand klein: K-005 nennt 40 bis 64 px. globals.css setzt clamp bis 4.5rem = 72 px (Kommentar „40 → 72 px“). Die Seite zeigt den Wert aus globals.css. Welcher Wert gilt?
3. --staffel: 60ms (globals.css :root) passt nicht zu K-007 B-06 („Marken staffeln ≤ 6 × 80 ms“). Nicht auf der Seite aufgenommen.
4. --ebene-toast (70) ist im Code bisher nicht verwendet. Die Zweckangabe „Kurze Rückmeldungen über Dialogen“ ist ein Vorschlag, K-005 nennt keinen Zweck.
5. Zur Kenntnis: Beim Aufruf von /verwaltung/anmelden meldet das Dev-Log einen Next-Hinweis zu uncached data außerhalb von Suspense (dev-3200.log, Zeile 391). Das betrifft die Anmeldeseite, nicht diese Änderung.
6. Aufräumen nötig: Mein Lauf des Werkzeugs freie-werte.mjs hat zwei Dateien in den Repo-Ordner geschrieben: /home/user/IGMG/_werkstatt/protokolle/werkzeug-freie-werte-2026-10-11-17-42.json und .md. Außerhalb meiner Schreibrechte. Das Löschen wurde vom Berechtigungssystem abgelehnt. Bitte entfernen oder bestätigen.

=== ENDE H-STYLE · BEREIT ZUR RÜCKGABE ===
