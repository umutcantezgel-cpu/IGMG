# Rückgabe R2 Organisationsseiten

GEÄNDERTE DATEIEN
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/organisation/OrganizationPage.tsx (geändert)
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/organisation/stil.ts (geändert: Konstante MEHR_LINK)
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/organisation/OrgTermine.tsx (neu)
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/organisation/OrgMeldungen.tsx (neu)
- web/messages/bereiche/organisationen.json: unverändert
- NEU ÜBERSETZT: keine. „Mehr erfahren“ und „Weiterlesen“ (karten) existieren bereits in de, tr und en.

UMSETZUNG (kurz)
- Missionskarte (A1/A2, W1/W2, Y1/Y4, Z1/Z2): Ursache war flex-1 (Basis 0) zusammen mit overflow-hidden. Die Karte schrumpfte unter ihren Inhalt, das Band fiel auf 0 px und der Text wurde abgeschnitten. Jetzt: Missionskarte ohne flex-1, mit shrink-0 und Höhe am Inhalt. Band h-1.5 in der Organisationsfarbe, shrink-0. Die Vision-Karte füllt den Rest.
- Aktivitäten-Titel (A3, W3, Y2, Z3): font-text font-bold tracking-normal.
- Kommende Veranstaltungen (A4, W4, Y3, Z4): EventCards durch die kompakte Liste OrgTermine ersetzt. Titel serifenlos fett, Datumspille mit Kalendersymbol, Uhrzeit mit Uhrsymbol, Kurztext, Trennlinien, Link „Mehr erfahren: Titel“ mit min-h-12. Datum über terminDatum (EventCard.tsx, nutzt datumLang), Uhrzeit über zeitspanne (beide aus format.ts). Leerzustand, Props und Auswahl (drei kommende je Organisation) unverändert.
- Aktuelle Nachrichten (Befund 5): NewsCard durch die kompakte Liste OrgMeldungen ersetzt (Datum, Titel, Kurztext, Trennlinien, „Weiterlesen: Titel“). Kategorie, Lesezeit und Bildplatzhalter entfallen, wie im Design.
- Abstand der Abschnitte gap-3 (12 px), wie im Design.
- Aufrufer, Props und Datenfilter unverändert. Keine Hex-Werte, keine festen Texte im JSX, kein 'use client', cn nur in Server-Komponenten.

PRÜFUNGEN
- `cd web && pnpm exec tsc --noEmit -p .`: Exit 0, keine Ausgabe, 0 Fehler (zuletzt 07:19, nach allen Änderungen).
- `pnpm exec eslint` (4 Dateien): Exit 0, keine Befunde.
- `pnpm exec prettier --check` (4 Dateien): „All matched files use Prettier code style!“ (vorher prettier --write nur auf diesen Dateien).
- `pnpm sprachen:pruefen`: Exit 0, „Sprachdateien vollständig: 923 Schlüssel in de, tr, en“. Die Zahl stieg durch Schlüssel eines anderen Arbeitsgangs; R2 hat keine Schlüssel ergänzt.
- Bildschirmfotos Dev-Server (app-bilder.mjs, 390 und 1440):
  - Vorher (07:04): Ana Teşkilatı und Kadın Gençlik Teşkilatı.
  - Nachher (07:06, nach allen Änderungen, fehlerfrei): Ana Teşkilatı und Kadın Teşkilatı. Akzentband sichtbar, Missionstext vollständig, Terminliste wie im Design. Die Nachrichtenliste ist dort leer, geprüft wurde daher nur der Leerzustand.
  - Kopien: /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/app/tor-a-reparatur/R2/ (vorher-*.png, nachher-*.png).
  - Testaufbau ohne Datenbank, mit dem kompilierten Stylesheet des Dev-Servers: vorher Band 0 px und Text 11,4 px über der Karte; nachher Band 6 px, unterer Innenabstand 24 px, kein Überlauf bei 390 und 1440.
  - Nicht möglich: Gençlik Teşkilatı, Kadın Gençlik Teşkilatı, Startseite und /nachrichten liefern seit 07:07 einen Serverfehler (drizzle: „Cannot read properties of undefined (reading 'replace')“, Digest 1399067744). Verursacht durch einen anderen Arbeitsgang an web/src/server/queries/nachrichten.ts und web/src/lib/db/schema/inhalte.ts (neue Spalte nachricht.schlagwoerter). 40 Versuche bis 07:17 ohne Erfolg.

ABWEICHUNGEN VOM DESIGN (mit Grund)
- Datum: datumLang schreibt den Monat aus („19. Dezember 2024“), das Design kürzt („Dez.“). Grund: vorgeschriebene Formatierer aus format.ts (D-10).
- Uhrzeit: zeitspanne zeigt eine Endzeit, wenn sie gepflegt ist („18:30–20:00 Uhr“). Grund: Formatierer und Datenmodell.
- Link „Mehr erfahren: Titel“ je Termin: im Design nicht vorhanden. Ergänzt wegen der Vorgabe (Link zur Detailseite, Muster „Sichtbarer Text: Titel“).
- Missionsband: h-1.5-Element mit overflow-hidden statt border-top wie im Design. Optisch gleich; der Befund verlangt den Balken wie im Kontakt-Block.

OFFENE FRAGEN
- Sichtprüfung von Gençlik Teşkilatı und Kadın Gençlik Teşkilatı mit Daten sowie der Nachrichtenliste mit Einträgen steht aus. Nach Behebung des Datenbankfehlers wiederholen: `cd web && node ../_lauf/werkzeuge/app-bilder.mjs http://127.0.0.1:3000 "../_lauf/belege/app/tor-a-reparatur/R2" /organisationen/genclik-teskilati=genclik /organisationen/kadin-genclik-teskilati=kadin-genclik`
- Den Fehler bitte dem Verantwortlichen melden: Die Spalte schlagwoerter braucht eine Migration, sonst bricht ladeNachrichten ab.
- Nicht im Auftrag und nicht geändert: globale Befunde G1 (Kartenkopf-Abstand außerhalb der Listen), G2 (Symbol in JetztGeoeffnet.tsx), G3 (Fußzeilen-Überschrift) und der fehlende Kontakt-Button ohne E-Mail.
- Dateien anderer Arbeitsgänge, nicht von R2 geändert: NewsCard.tsx, nachrichten.ts, inhalte.ts, kurse.ts u. a.

=== ENDE R2 · BEREIT ZUR RÜCKGABE ===
