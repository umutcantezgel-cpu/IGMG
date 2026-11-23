# ADR 0051: Rundgang in der Vorführung ohne Datenbank

Datum: 23.11.2026 · Status: angenommen · Bezug: ADR 0016 (Verwaltung), ADR 0019 (Beispielmodus ohne Datenbank), ADR 0050

## Anlass

Die Testadresse läuft als Vorführung ohne Datenbank (ADR 0019). Ohne Datenbank gibt es keine Konten: Wer auf „Anmelden“
klickte, sah nur den Hinweis „Verwaltung noch nicht eingerichtet“. Auftrag des Nutzers am Tag der Vorstellung: „Es ist
eine Testversion – mach, dass man das Design einfach alles begutachten kann.“ Eine Datenbank soll dafür nicht
eingerichtet werden.

## Entscheidung

1. **Rundgang statt Hinweis.** Im Beispielmodus (`datenbankVerfuegbar()` ist falsch) zeigt jede Adresse der Verwaltung den
   Rundgang (`src/components/verwaltung/rundgang/Rundgang.tsx`): 62 Bildschirme hinter der Anmeldung in acht Bereichen –
   Verwaltung, „Mein Bereich“ (Eltern, Kind) und Unterricht (Lehrkraft) –, je als Aufnahme für Computer (1440 px) und
   Handy (390 px), mit Titel und einem Satz Nutzen. Mit verbundener Datenbank erscheint er nicht; dort steht die
   Anmeldung.
2. **Aufnahmen statt Attrappe.** Die Bilder sind echte Aufnahmen aus der Testumgebung (Produktionsbau, PostgreSQL, alle
   Funktionsschalter an). Eine klickbare Attrappe der Verwaltung ohne Datenbank hieße, jede Seite ein zweites Mal mit
   erfundenen Daten zu bauen – und sie sähe irgendwann anders aus als das Original.
3. **Nur Beispieldaten, und das steht oben auf der Seite.** Gezeigt werden die Beispielinhalte der Seeds und die
   Beispielkonten aus `scripts/beispielkonten.ts` (ohne Präfix). Keine echten Personen, keine erfundenen Angaben der
   Gemeinde; Platzhalter „[…]“ bleiben in den Aufnahmen der Verwaltung sichtbar, denn dort trägt die Gemeinde sie ein.
4. **Ohne Client-JavaScript.** Sprungmarken zu den Bereichen, jede Aufnahme in einem Rahmen mit eigener Laufleiste; der
   Link im Rahmen öffnet die Datei in voller Größe und macht den Rahmen mit der Tastatur erreichbar. Bilder laden erst
   in der Nähe des sichtbaren Bereichs (`loading="lazy"`), Breite und Höhe stehen fest (`aufnahmen.ts`).
5. **Dateien** unter `public/vorfuehrung/<id>-<desktop|telefon>.jpg` (124 Dateien, 19 MB), von Suchmaschinen
   ausgenommen (`robots.ts`); die Verwaltung selbst ist ohnehin `noindex`. Texte nur deutsch in
   `messages/verwaltung/rundgang.json` (ADR 0016).

## Folgen

- Die Aufnahmen altern: Ändert sich eine Seite der Verwaltung, zeigt der Rundgang den alten Stand, bis neu aufgenommen
  wird. Das ist für eine Vorführung hinnehmbar; mit dem Anschluss der Datenbank entfällt der Rundgang von selbst.
  Entfernen: Ordner `public/vorfuehrung/`, `src/components/verwaltung/rundgang/`, `messages/verwaltung/rundgang.json`
  samt Eintrag in `messages/verwaltung/index.ts`, `tests/unit/rundgang.test.ts`.
- „Mein Bereich“ ist auf der Testadresse weiter nicht erreichbar (Konten aus, ADR 0035); der Rundgang zeigt ihn.
- Das Startklar-Cockpit in der Aufnahme zeigt den Stand der Testumgebung (lokale Adresse, Platzhalter-Absender), nicht den
  der Gemeinde – der Erklärtext sagt das.

## Prüfung

- `tests/unit/rundgang.test.ts`: jede Aufnahme mit beiden Dateien, Titel und Text in genau einem Bereich; keine Datei ohne
  Eintrag.
- `tests/e2e/konten-ohne-datenbank.spec.ts`: ohne Laufzeit-Datenbank zeigt `/verwaltung` und `/verwaltung/anmelden` den
  Rundgang, die Sprungmarke führt zum Bereich, das Bild lädt, kein waagrechtes Scrollen (Telefon und Computer).
