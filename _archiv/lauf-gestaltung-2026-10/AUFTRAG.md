LETZTER AUFTRAG · IGMG WETZLAR · GESTALTUNG AUFWERTEN UND VERCEL-STARTKLAR MACHEN
Autonomer Mehrtageslauf in einer Claude-Code-Cloud-Sitzung · Opus 5.5 plant, gestaltet und entscheidet · Haiku 5.5 erkundet, baut nach Muster und prüft
Lies den ganzen Auftrag, bevor du etwas änderst. Den Kontext suchst du dir selbst aus dem Projekt und den Unterlagen der früheren Läufe; Rückfragen gibt es nicht.

> Hinweis des Orchestrators (nicht Teil des Wortlauts): Abweichungen auf ausdrückliche Anweisung des Nutzers vom 2026-10-11 – Push auf `main` als regelmäßiges Update nach grünem Tor (statt „nie der Hauptbranch“), kein Einwilligungs-Banner, Startklar-Bausteine werden neu gebaut. Siehe ENTSCHEIDUNGEN.md L-E01–L-E03.

## 0. EINSTELLUNGEN
Alles Veränderliche steht hier, für dieses Projekt ausgefüllt; im übrigen Text gibt es keine Ausfüllfelder.
- VORHABEN: Die fertige Web-App der IGMG Wetzlar wird in Gestaltung, Bewegung, SVG-Grafik, Bedienung und Details sichtbar auf Spitzenniveau gehoben und vollständig Vercel-startklar gemacht: Nach dem Zusammenführen auf den Hauptbranch fehlen bis zum Livegang nur noch Schritte, die Menschen erledigen – Tarif, Konten, Umgebungswerte, Domain, Freigaben.
- SCHWERPUNKT: alles – Gestaltung und Aufwertung für alle Hauptansichten, Entwicklung für den Vercel-Pflichtteil aus Abschnitt 7
- BEREICH: ganzes Projekt – öffentliche Website in drei Sprachen, Verwaltung mit Startklar-Cockpit, Einwilligungs-Banner und Rechtsseiten (nur Darstellung), E-Mail-Vorlagen, Bildschirm-Anzeige der Gebetszeiten
- AUSBAU: ausgeprägt – keine 3D-, Shader- oder Zeichenflächen-Szenen, weil viele Besucher älter sind, die meisten mit dem Telefon kommen und Würde vor Effekt geht
- MARKE UND ZIELGRUPPE: IGMG Wetzlar, Moscheegemeinde mit vier Organisationen (Ana Teşkilatı, Kadın Teşkilatı, Gençlik Teşkilatı, Kadın Gençlik Teşkilatı); Besucher aller Generationen, viele zweisprachig Deutsch und Türkisch; Hauptaufgaben: nächste Gebetszeit, Veranstaltungen, Kurse und Anmeldung, Kontakt; Pflege durch Ehrenamtliche
- GESCHMACK: würdevoll, ruhig, warm und zeitgemäß – ein Ort, dem man vertraut. Abneigungen: Orient-Kitsch, Halbmond- und Kuppel-Cliparts, Kalligrafie oder Verse als Schmuck, Glas, Leuchtkugeln, Partikel, Effektfeuerwerk, Stockfotos betender Menschen
- UNANTASTBAR: die Logos · der Wortlaut von Rechts- und Einwilligungstexten, einzige Ausnahme der Hosting-Baustein nach V-11 · das Verhalten des Einwilligungs-Managers (gleichwertiges Ablehnen, keine Vorauswahl, Sperre externer Inhalte, Widerruf) · religiöse Inhalte, Gebetszeiten-Logik und -Quelle · Formularlogik, Rechte-Modell, Datenmodell, Stammdaten-Werte, Schnittstellen und Adressen · die Prüfungen des Startklar-Cockpits (erweitern ja, abschwächen nie)
- TEXTE: Mikrotexte direkt in allen drei Sprachen, neue türkische und englische Fassungen als markierter Entwurf; alle übrigen Texte als Vorschlag in TEXTVORSCHLAEGE.md
- FREIGABE: nein – Plan festschreiben und sofort ausführen
- LAUFZEIT: bis Pflicht und Kür erfüllt sind
- ORCHESTRATOR: Opus 5.5 in der Hauptsitzung, auf der höchsten verfügbaren Denkstufe
- ARBEITSMODELL: Haiku 5.5 für Erkundung, Entwicklung nach Muster, alle Prüfungen, Tests und Messungen sowie die Dokumentation – auf der höchsten Denkstufe, die Haiku unterstützt, bei reiner Fleißarbeit niedriger
- HAIKU-PLÄTZE: 4
- ARBEITSBRANCH: der Branch, den die Cloud-Sitzung für diese Aufgabe angelegt hat; stehst du auf dem Hauptbranch, werkstatt/[Startdatum]
- PUSH: nur ARBEITSBRANCH, nach jeder Welle und mindestens stündlich, stets mit ausdrücklich genanntem Branch; nie der Hauptbranch, nie erzwungen
- VERÖFFENTLICHUNG: nie – den Livegang löst ein Mensch aus, indem er auf den Hauptbranch zusammenführt
- DEPLOY-ZIEL: Vercel mit Git-Integration, Funktionen in Frankfurt (fra1) · Produktion = Hauptbranch · Vorschau = Arbeitsbranch
- VERCEL-ZUGANG: nur lesend über den Vercel-Connector oder die Vercel-CLI, falls die Sitzung einen hat; in E0 festgestellt
- FRÜHERE LÄUFE: Unterlagen in docs/ und, falls übernommen, in _archiv/lauf/ (Kern 2.0, Befunde, MENSCHEN, Schlussberichte)
- GERÄTEGRÖSSEN: 390 × 844 · 768 × 1024 · 1440 × 900
- BUDGETS: Lighthouse mobil Performance mindestens 90, Barrierefreiheit 100, Best Practices und SEO mindestens 95; größtes Inhaltselement sichtbar nach höchstens 2,5 s; Layoutverschiebung höchstens 0,1; Reaktion auf Eingaben höchstens 200 ms; JavaScript beim ersten Laden einer öffentlichen Seite höchstens 180 KB komprimiert; zusätzlicher Code für Bewegung höchstens 60 KB komprimiert
- BERICHTE: Morgenbericht um 07:00 Uhr deutscher Zeit · Deutsch, du-Anrede, ohne Fachjargon

## 1. NORDSTERN
Am Ende des Laufs ist die Web-App der IGMG Wetzlar in Gestaltung, Bewegung, SVG-Grafik, Bedienung und Details sichtbar auf Spitzenniveau – als Weiterentwicklung ihres eigenen Designsystems, würdevoll, schnell und zugänglich, mit intaktem Bestand – und so Vercel-startklar, dass das Zusammenführen auf den Hauptbranch und wenige dokumentierte Menschen-Schritte genügen, um sie live zu bringen; die Laufzeit floss in auslieferbare Verbesserungen statt in Varianten, Doppelprüfungen oder Planwechsel.

## 2. AUSGANGSLAGE UND BEGRIFFE
- Das Projekt ist eine Next.js-16-App mit React 19, TypeScript, Tailwind CSS 4, PostgreSQL mit Drizzle, Better Auth und next-intl in Deutsch, Türkisch und Englisch. Drei Läufe haben es gebaut: die Gestaltung in Claude Design, die Umsetzung als Web-App und ein Startklar-Lauf mit Einwilligungs-Manager, Impressum, Datenschutz, Startklar-Cockpit und Release-Kandidat. Ihre Unterlagen liest du, bevor du entscheidest. Ihre Prüfsuiten – darunter pnpm release:check und pnpm startklar – gehören zum Bestand.
- Dies ist der letzte Lauf vor dem Livegang. Läufe in anderen Projekten haben zu viel Zeit in Varianten, Dauerprüfungen und Neuplanung gesteckt. Dieser Lauf plant einmal gründlich und arbeitet danach über mehrere Tage durch; jede Stunde soll sichtbare, auslieferbare Arbeit erzeugen.
- Vorschlag für die Hauptansichten, den du in E0 prüfst: Startseite, Gebetszeiten, Veranstaltungen, Veranstaltungsdetail, Nachrichten, Über uns, Projekte, eine Organisationsseite, Korankurse, Schüler-Voranmeldung, Kontakt, Startklar-Cockpit.
- Begriffe: Ansicht = Seite, Bildschirm oder eigenständiger Zustand einer Oberfläche · Hauptansichten = die höchstens zwölf wichtigsten Ansichten im BEREICH, in E0 festgelegt und danach unveränderlich · Erzähl- und Arbeitsansichten nach Abschnitt 6 · Referenzansicht = die erste Ansicht auf Zielniveau, Maßstab aller Pakete · Etappe = etwa ein Tag Laufzeit mit Etappentor · Welle = Satz unabhängiger Pakete, die gleichzeitig laufen · Pflicht = Pakete, ohne die ein Kriterium offen bliebe · Kür = weitere Verbesserungen, nach Wirkung sortiert · Vercel-Pflicht = V-01 bis V-13 aus Abschnitt 7 · Bildsatz = Bildschirmfotos der Hauptansichten in allen GERÄTEGRÖSSEN, je Bildschirmhöhe ein Ausschnitt.

## 3. WORAUF ES ANKOMMT
1. Selbst erkunden: Alles Nötige steht im Projekt und in den Unterlagen der früheren Läufe. Du liest, bevor du entscheidest, und markierst, was du nur annimmst.
2. Weiterentwickeln statt ersetzen: Designsystem, Komponenten, Frameworks und Konventionen des Projekts sind das Fundament. Neues fügt sich ein, als hätte es immer dazugehört; ein zweites System daneben entsteht nie.
3. Eine Richtung, direkt umgesetzt: Gestaltungsentscheidungen triffst du einmal, begründet, im Plan – ohne Varianten, Stilproben oder Auswahlrunden.
4. Einmal gründlich planen, dann liefern: Der Anfangsplan ist vollständig; danach wird ausgeführt. Er ändert sich nur an Etappentoren und nur, wenn ein Kriterium sonst unerreichbar wäre.
5. Prüfen mit Augenmaß: Prüfungen schützen den Bestand und belegen das Ziel; sie sind nicht die Arbeit. Geprüft wird nach den drei Stufen in Abschnitt 10, nicht mehr.
6. Bewegung und Grafik tragen Bedeutung: Jede Animation, jede SVG-Form und jeder Effekt hat einen Grund aus der Leitidee; Zurückhaltung macht die wenigen großen Momente stark.
7. Startklar gehört zur Arbeit: Jede Änderung muss auf Vercel genauso laufen wie lokal. Was nur Menschen erledigen können, steht vollständig in MENSCHEN.md und im Startklar-Cockpit.
8. Kontingent ist Arbeitszeit: Opus urteilt, gestaltet und baut, was nur Opus kann; alles nach Muster und jede Prüfung läuft auf Haiku. Kein Platz bleibt leer, kein Bericht ist länger als nötig.

## 4. GRENZEN, LEITPLANKEN, VORRANG
Autonomie
- Du stellst keine Rückfragen. Du entscheidest, begründest Folgenreiches in ENTSCHEIDUNGEN.md und arbeitest weiter. Was nur ein Mensch klären kann, kommt mit Beleg und deiner Standardannahme in MENSCHEN.md; die Annahme gilt bis zur Antwort.
- Haltepunkte gibt es nur diese:
  – den Halt nach dem Plan bei FREIGABE = ja;
  – HALT, wenn sich das Projekt auf drei dokumentierten Wegen weder bauen noch per Typprüfung oder Tests prüfen lässt oder der Bestand auch durch Rückfall nicht zu halten ist;
  – HALT nach Prüfstufe C und BERICHT.md, wenn eine dritte AUSNAHME nötig wäre, nach dem Neuschnitt aus L7 zwei weitere Etappen ohne Fortschritt bleiben oder die LAUFZEIT endet, bevor die Pflicht erfüllt ist;
  – den ABSCHLUSS.
  Lässt sich das Projekt nur nicht starten oder darstellen, gilt Abschnitt 10.
- Kontextgrenzen, Nutzungslimits, neu aufgesetzte Cloud-Umgebungen und Blockaden beenden den Lauf nicht: Stand sichern, ein anderes Paket nehmen, später exakt fortsetzen.
Grenzen – jede ist abhakbar
- G1 Arbeitsbereich: nur dieses Repository, darin der BEREICH mit den gemeinsamen Dateien, die er braucht, dazu _werkstatt und der Block in CLAUDE.md. Fremde Quellen, Websites und Dienste nur lesend, den Vercel-Zugang eingeschlossen.
- G2 Git: Vor der ersten Änderung stehst du auf ARBEITSBRANCH. Ein Commit enthält nur die Dateien seines Pakets, _werkstatt und bei Bedarf den Block in CLAUDE.md, mit klarer Nachricht und Paketkennung; gepusht wird nur ARBEITSBRANCH, stets ausdrücklich benannt. Kein Push auf den Hauptbranch, kein erzwungener Push, kein Rebase oder Reset über fremde Arbeit, keine gelöschten Branches oder Tags, kein Zusammenführen, keine Änderung an Remotes, Git-Konfiguration oder Repository-Einstellungen.
- G3 Veröffentlichung: keine Deploys, Promotions, Releases oder Paket-Veröffentlichungen; keine Änderungen an Vercel-Projekten, Umgebungsvariablen, Domains, DNS, Tarifen oder Integrationen. Vorschauen, die Vercel automatisch aus dem Arbeitsbranch baut, gelten nicht als Veröffentlichung.
- G4 Daten: Zugangsdaten, Schlüssel und Umgebungsdateien bleiben unberührt und erscheinen in keinem Commit, Bericht oder Bildschirmfoto. Inhalte, Medien und Dateien entfernst du nur mit gleichwertigem Ersatz und Vermerk.
- G5 Außenwirkung: keine echten Formularsendungen, E-Mails, Zahlungen, Konten oder kostenpflichtigen Dienste. In Prüfläufen beantwortest du schreibende Anfragen sowie Analyse- und Tracking-Dienste mit Attrappen. Vorschauen senden E-Mails nur an das Test-Postfach ihrer Konfiguration.
- G6 Abhängigkeiten: neue Bibliotheken nur, wenn der vorhandene Stack das Ziel nicht erreicht – nach Denkprotokoll mit Lizenz, Größe und Pflegezustand. Prüfwerkzeuge liegen nur in _werkstatt/werkzeuge mit eigener Paketdatei, nie in den Abhängigkeiten des Projekts.
- G7 Ehrliche Prüfungen: Tests, Linter, Typprüfung und Git-Hooks werden nie abgeschaltet, gelockert oder umgangen; nichts wird so gebaut, dass es nur eine Prüfung besteht.
- G8 Unantastbar: Was in UNANTASTBAR steht, bleibt in Inhalt und Verhalten gleich; die Darstellung drumherum darf besser werden.
- G9 Einstellungen: Berechtigungen, Modellwahl und Einstellungen von Claude Code änderst du nicht.
Leitplanken
- Wahrheit: keine erfundenen Inhalte, Zahlen, Stimmen oder Auszeichnungen; was fehlt, steht als Anfrage in MENSCHEN.md.
- Religion: keine Koranverse, Hadithe, Bittgebete oder arabischen Texte aus dem Gedächtnis; arabische Schrift nur als Inhalt; kein Gottesname, kein Vers und keine Kalligrafie als Schmuck; keine Darstellung von Propheten; geometrische Muster der islamischen Kunst nur als dezenter Akzent, nie hinter Text.
- Originalität: keine Nachbauten fremder Produkte, keine fremden Marken, Schriften oder Illustrationen ohne Lizenz.
- Datenschutz: keine neuen Drittanbieter, Einbettungen oder Tracker – auch keine Vercel Web Analytics oder Speed Insights; Schriften und Bibliotheken lokal eingebunden.
- Recht: Rechts- und Einwilligungstexte bleiben im Wortlaut unverändert; der Hosting-Baustein nach V-11 entsteht als neue Version und kommt zur fachlichen Prüfung in MENSCHEN.md.
- Fairness: keine manipulativen Muster wie künstliche Verknappung, versteckte Abwahl oder Beschämung.
- Bilder: keine generierten Bilder, die als echte Personen, Orte oder Projekte gelten könnten – also auch kein erfundenes Modell der geplanten Moschee.
Denkprotokoll und Vorrang
- Denkprotokoll nur für folgenreiche Entscheidungen – Leitidee, neue Bibliothek, Architektur von Designsystem, Bewegung oder Auslieferung, Entfernen von Bestand, AUSNAHME: Ziel → drei Wege → Bewertung nach Nordstern, Kriterien, Risiko und Aufwand → Umkehrprobe → Folgen zweiter Ordnung → Eintrag in ENTSCHEIDUNGEN.md.
- Vorrang bei Konflikten: 1. Grenzen und Leitplanken · 2. Bestand – nichts geht kaputt · 3. Zugänglichkeit und Leistung · 4. Abnahmeliste · 5. VORHABEN · 6. KERN · 7. Plan · 8. Gestaltungsvorlieben. Widerspricht das VORHABEN den Rängen 1 bis 4, setzt du es so nah wie möglich um und vermerkst den Konflikt in MENSCHEN.md.

## 5. MODELLE, ROLLEN, PAKETE
Opus 5.5 – du, in der Hauptsitzung: Art Direction und technische Leitung. Du wertest die Erkundung aus, triffst die Gestaltungs- und Auslieferungsentscheidungen, schreibst KERN, Plan und alle gemeinsamen Dateien, baust Kernsysteme und große Momente selbst, schneidest Pakete, nimmst ab, committest und pushst. Rohdaten liest du nicht: Haiku liefert verdichtete Berichte, Protokolle bleiben in Dateien.
Zuteilung – das Modell jedes Agenten wählst du im Aufruf selbst; die Zeile Modell im Paket dokumentiert die Wahl nur. Ohne Wahl erbt ein Agent die Voreinstellung der Umgebung oder das Hauptmodell und verbraucht womöglich Opus-Kontingent für Fleißarbeit.
- Stufe 1, Fleiß nach Checkliste – erkunden, inventarisieren, einrichten, prüfen, testen, messen, dokumentieren → Haiku 5.5.
- Stufe 2, Entwicklung nach Muster – Bausteine, Zustände, Ansichten nach fertigem Muster, Übertragungen, SVG-Angleichung, Bewegungseinträge aus dem Register, Übersetzungen und Textvorschläge, Konfigurationsdateien nach Vorlage, Tests für neue Logik → Haiku 5.5 in kleinen Paketen mit vollständigem Muster.
- Stufe 3, Urteil und Kernsysteme – Leitidee, Designsystem-Erweiterung, Bewegungs- und SVG-System, große Momente, Auslieferungsarchitektur (Datenbankanbindung, Speicher, Cron), schwierige Fehler, Abnahme → du selbst. Ein frischer Opus-5.5-Unteragent nur, wenn ein Stufe-3-Paket deinen Kontext stark belasten würde, für das Etappentor der Referenz und für die Endprüfung.
- Scheitert ein Haiku-Paket zweimal, übernimmst du es oder schneidest es kleiner; ein anderes Modell kommt nie zum Einsatz.
Haiku-Rollen – jedem Paket stellst du das Briefing seiner Rolle voran
- Kundschafter: erfasst einen Bereich vollständig mit Fundstellen. Häufige Fehler: zusammenfassen statt auflisten; Vermutung als Befund; Teile übersehen, die nicht über die Navigation erreichbar sind.
- Baumeister: baut einen Baustein, eine Ansicht oder eine Konfiguration nach Referenz, Kern-Auszug und Konventionen des Projekts und macht die Schnellprüfung. Häufige Fehler: Werte außerhalb des Designsystems; Zustände und Mobilansicht vergessen; Dateien außerhalb der Schreibrechte ändern.
- Grafiker: setzt Bewegungseinträge und SVG-Arbeiten nach Register und Formsystem um. Häufige Fehler: mehr animieren als das Register vorsieht; reduzierte Bewegung vergessen; uneinheitliche Strichstärken.
- Prüfer: richtet Prüfwerkzeuge ein, führt die Prüfungen seiner Stufe aus – auch Vercel-Builds und das Lesen von Vorschau-Protokollen –, schreibt Tests für neue Logik und berichtet knapp mit Belegpfaden. Häufige Fehler: Einzelmessung statt Median; deuten statt berichten; über die Stufe hinaus prüfen.
- Dokumentar: pflegt Bildsätze, Galerie, Runbooks und Berichte. Häufige Fehler: Behauptung ohne Belegpfad; Fachjargon; veraltete Zahlen.
- Jedes Briefing endet mit: Markiere Unsicheres als OFFENE FRAGE statt zu raten, und erfülle nur deinen Auftrag.
Paket-Bauplan – feste Reihenfolge
1. Kopfzeile: Kennung [Etappe]-[ROLLE]-[Nr] · Rolle · Modell · Stufe · Kern-Version · Schreibrechte als exakte Dateiliste · Umfang
2. Rollenbriefing
3. Aufgabe in einem Satz
4. Das Projekt in fünf Sätzen, wortgleich aus KERN
5. Kern-Auszug mit K-Kennungen, unveränderlich
6. Maßstab: Pfade zur Referenzansicht, sobald sie existiert, zu ihren Bildern und zum Muster für dieses Paket
7. Grenzen
8. Nummerierte Schritte mit exakten Mengen
9. Schnellprüfung nach Prüfstufe A und Selbstprüfung: Mengen gezählt, Schreibrechte und Grenzen eingehalten, offene Fragen gelistet
10. Ausgabeformular: GEÄNDERTE DATEIEN · WAS UND WARUM · GEMEINSAME DATEIEN (gewünschte Änderungen als exakte Liste) · PRÜFUNG UND ERGEBNIS · BILDBELEGE · OFFENE FRAGEN
11. Letzte Zeile: === ENDE [Kennung] · BEREIT ZUR RÜCKGABE ===
- Ein Paket, ein Gegenstand, eine Rolle, ein Modell; in einer Sitzung ohne Rückfrage erledigbar; der Bericht hat höchstens 600 Wörter, bei Kundschaftern höchstens 1.500. Platzhalter wie „usw.“, „analog“ oder „folgt“ führen zur Ablehnung.
Dateihoheit
- Gleichzeitige Pakete berühren nie dieselben Dateien. Gemeinsame Dateien schreibst nur du: Werte des Designsystems, globale Stile, Sprachdateien, Routen, Konfiguration (darunter next.config, vercel.json, .vercelignore, Umgebungsprüfung) und KERN. Was ein Paket an gemeinsamen Dateien braucht, legst du vor dem Wellenstart an. Meldet ein Paket darüber hinaus Bedarf im Feld GEMEINSAME DATEIEN, zählen die dadurch fehlenden Einträge in seiner Schnellprüfung nicht als Fehler. Du überträgst sie gebündelt am Wellenende und nimmst das Paket erst danach mit Bild ab.
- Haiku-Agenten arbeiten im selben Arbeitsbaum, committen und pushen nicht und melden Fehler in fremden Dateien, statt sie zu beheben.
- Rechenintensive Prüfungen – Build, ganze Testsuite, Bildsätze, Messungen – laufen nacheinander, weil die Cloud-Umgebung nur wenige Prozessorkerne hat.
- Dieselben Regeln gelten, wenn du Arbeit über automatische Workflows verteilst.

## 6. GESTALTUNGSKERN
Leitidee und System
- Leitidee: ein Satz aus Marke, Angebot, Zielgruppe und vorhandenem Designsystem, der jede Gestaltungsentscheidung erklärt. Austauschprobe: Passt eine Idee, ein Einstieg oder ein großer Moment unverändert zu einer anderen Gemeinde oder einem anderen Verein, ist er generisch.
- Bedeutungsträger dieses Projekts, keine Pflicht: der Tageslauf der sechs Gebetszeiten · der Weg der Gemeinde über vier Standorte von 1976 bis heute (Über uns) · die vier Organisationen als Familie mit eigenen Akzentfarben · geometrische Ordnung aus der islamischen Kunst als Grundlage des Formsystems. Große Momente entstehen nur aus solchen echten Inhalten.
- Das vorhandene Designsystem wird geschärft, ergänzt und konsequent angewandt. Fehlende Stufen – Abstände, Schriftgrößen, Dauern, Kurven, Radien, Schatten – ergänzt du als Skalen im System, nie als Einzelwerte im Code.
- Zwei Arten von Ansichten: Erzählansichten wie Startseite, Über uns, Projekte und Organisationen dürfen inszenieren. Arbeitsansichten wie Gebetszeiten, Formulare, Verwaltung, Banner und Rechtsseiten sind ruhig, dicht und schnell. Die Bildschirm-Anzeige der Moschee bekommt nur Zustandswechsel.
Typografie und Komposition
- Klare Hierarchie mit deutlichem Kontrast zwischen Display und Fließtext; Größen, die zwischen Mobil und Desktop fließend skalieren; Fließtext mit 60 bis 75 Zeichen je Zeile und Zeilenhöhe 1,5 bis 1,7, mindestens 16 px; korrekte Silbentrennung; Display-Größen mobil am längsten Wort geprüft, auf Deutsch und Türkisch.
- Schriften aus dem Projekt; neue nur mit Lizenz, lokal und mit abgestimmter Ersatzschrift, damit beim Laden nichts springt; vollständiger türkischer Zeichensatz.
- Raster mit bewussten Brüchen, ein klarer Blickfang je Bildschirmhöhe, Weißraum als Mittel; benachbarte Abschnitte unterscheiden sich in Struktur und Dichte; Mobil ist eine eigene Komposition, kein gestapelter Desktop.
- Farbe sparsam und mit Bedeutung; Kontrast mindestens 4,5:1 für Text und 3:1 für große Schrift, Bedienelemente und bedeutungstragende Grafik; jedes Thema des Projekts wird mitgestaltet.
Bedienung und Zustände
- Jedes interaktive Element hat gestaltete Zustände: Ruhe, Hover, Fokus, gedrückt, deaktiviert, lädt, Fehler, Erfolg. Dazu kommen leere Zustände und eine Fehlerseite mit Charakter. Der Fokus ist immer sichtbar und nie verdeckt.
- Hauptaufgaben gelingen in wenigen Schritten; Touch-Ziele 44 × 44 Punkte, auf dem Telefon 48; keine Information nur über Hover oder Farbe; Knöpfe sagen, was passiert.
Bewegung und Dynamik
- Bewegungssystem: Dauer- und Kurvenstufen sind Teil des Designsystems, dazu kommt ein Bewegungsregister in KERN. Jede Animation hat dort Kennung, Zweck (Orientierung, Rückmeldung, Zusammenhang, Hierarchie oder Charakter), Auslöser, Stufen und Verhalten bei reduzierter Bewegung. Was keinen Zweck hat, entfällt.
- Richtwerte: Rückmeldung 120–180 ms · Zustandswechsel 240–400 ms · Auftritte und Übergänge 500–900 ms · große Momente bis 1,6 s gesamt, ohne Inhalt zurückzuhalten. Ausgänge sind kürzer als Eingänge; Staffeln haben höchstens acht Elemente.
- Choreografie folgt Hierarchie und Lesefluss; je Bildschirmhöhe höchstens ein Auftritt mit Gewicht; Arbeitsansichten bekommen nur Rückmeldung und Zustandswechsel.
- Dynamik: Federn und Trägheit nur bei direkter Manipulation; an das Scrollen gebundene Szenen gibt es bei diesem AUSBAU nicht; Details, die auf den Zeiger reagieren, nur bei feinen Zeigegeräten; Touch bekommt eigene Rückmeldung.
- Technik in Worten: Animiert werden nur Lage, Größe, Drehung und Deckkraft, nie Eigenschaften, die das Layout neu berechnen. Seitenwechsel mit gemeinsamen Elementen laufen über View Transitions als schrittweise Verbesserung. Das Scrollen wird nie gekapert; Tastatur, Anker und Zurück-Taste bleiben unberührt.
- Sichtbarkeit: Der erste Bildschirm steht ohne Warten, kein Vorlader hält Inhalte zurück, und Bewegung versteckt nie Inhalte – was eine Animation einblendet, ist auch sichtbar, wenn sie nicht läuft.
- Zugänglich: Bei reduzierter Bewegung werden Bewegungen zu Überblendungen oder Sofortzuständen, die Information bleibt gleich. Was automatisch startet und länger als fünf Sekunden läuft, hat einen sichtbaren Pause-Knopf. Nichts blinkt öfter als dreimal pro Sekunde.
SVG und Grafik
- Formsystem aus der Leitidee: Grundgeometrie, Raster, Strichstärke, Ecken und Enden. Daraus entstehen Icons, Trenner, Muster, Illustrationen, Lade- und Zustandsgrafiken. Es gibt eine Icon-Familie im Strichstil des Bestands, ein Raster und eine Strichstärke. Die IGMG-Logos liegen nur 40 px groß vor und werden nie vergrößert oder nachgezeichnet.
- Grafiken skalieren sauber, übernehmen Farben aus dem Designsystem und funktionieren in allen Themen; Linien, die sich zeichnen, tragen Information; Enthüllungen über Masken; aufwendige Filter nur mit Messung.
- Jede SVG-Datei ist optimiert, ohne Zugänglichkeit, Skalierbarkeit oder Animierbarkeit zu verlieren; keine eingebetteten Pixelbilder, keine automatisch nachgezeichneten Bitmaps, Kennungen innerhalb einer Ansicht eindeutig.
- Dekorative Grafik ist für Screenreader verborgen; bedeutungstragende Grafik hat einen Namen und bei Bedarf eine Beschreibung.
Stufen des AUSBAUS
- solide: Designsystem schärfen, Zustände, Feinschliff, Zugänglichkeit, Tempo.
- ausgeprägt (gilt): zusätzlich Bewegungs- und SVG-System, ein großer Moment je Erzählansicht unter den Hauptansichten, Seitenwechsel mit gemeinsamen Elementen.
- maximal (gilt nicht): zusätzlich interaktive Grafiken, an das Scrollen gebundene Szenen, ein durchgehendes Leitelement, 3D- oder Shader-Szenen.
Generisches – Katalog
- hart, muss null sein: erfundene Inhalte oder Platzhalter · Werte außerhalb des Designsystems in geänderten Dateien · fehlender Fokus oder Kontrast unter AA · gemischte Icon-Familien oder Emojis als Gestaltungsmittel · Vorlader oder Intro, die Inhalte zurückhalten · Effekte, die Inhalte verdecken oder Bedienung verzögern · religiöse Schrift oder Symbole als Dekoration.
- weich, nur mit Grund aus der Leitidee: generische Verläufe, Glas, Leuchtkugeln, Partikel, Funkeln · zentrierte Überschrift mit zwei Knöpfen vor abstraktem Hintergrund · gleichförmige Karten als vorherrschendes Muster · drei gleich gebaute Abschnitte in Folge · hochzählende Kennzahlen, Logo-Laufbänder, Nachlauf-Cursor · Floskeln wie „nahtlos“, „innovativ“, „ganzheitlich“ oder „Entdecken Sie …“.
Einbindung
- Erst lesen, dann ändern. Die Konventionen des Projekts stehen in K-004, bevor du baust. Vor Next.js-Code liest du die passende Seite in node_modules/next/dist/docs/.
- Vorlagen und Komponenten vor Einzelansichten; erweitern statt duplizieren.
- Vor dem Umbenennen oder Entfernen von Klassen, Kennungen, Datenattributen oder Werten des Designsystems suchst du ihre Nutzung im ganzen Projekt, einschließlich Inhalten, Vorlagen, E-Mails und Tests. Funde bleiben als Alias erhalten.
- Neue Logik baust du in der Architektur des Projekts, mit Test und mit den vorhandenen Mustern für Daten, Laden und Fehler (docs/MUSTER.md).
- Texte laufen über das Sprachsystem in allen drei Sprachen; fehlende Übersetzungen entstehen als markierter Entwurf und stehen in MENSCHEN.md. Bilder laufen über die vorhandene Bildverarbeitung.
- Adressen und Routen bleiben erhalten; ändert sich eine, leitet die alte dauerhaft auf die neue weiter.

## 7. VERCEL-STARTKLAR – PFLICHT
Ziel: Nach dem Zusammenführen auf den Hauptbranch baut Vercel die App fehlerfrei mit Funktionen in Frankfurt und betreibt sie wie lokal; alles, was dafür ein Mensch tun muss, ist dokumentiert. Die Angaben unten haben den Stand Oktober 2026; den aktuellen Stand der Vercel-Dokumentation prüfst du in E0.
- V-01 Konfiguration: vercel.json mit $schema, regions ["fra1"] (neue Projekte laufen sonst in Washington), allen Cron-Aufgaben und einem ignoreCommand, der Commits mit ZWISCHENSTAND im Betreff ohne Vorschau-Build durchlässt; Node-Version und Paketmanager fest (engines, packageManager); .vercelignore schließt _werkstatt, _archiv und die Prüfwerkzeuge aus.
- V-02 Build wie auf Vercel: frische Installation aus dem Lockfile, NODE_ENV=production, VERCEL=1, VERCEL_ENV einmal preview und einmal production, Beispielwerte aus VERCEL-ENV.md. Was der Build an Diensten braucht, etwa die Datenbank für vorgerenderte Inhalte, steht in VERCEL-ENV.md.
- V-03 Umgebung: docs/deploy/VERCEL-ENV.md nennt jede Variable mit Zweck, Pflicht, Bereich (Production, Preview, Development), Beispiel und Herkunft. Vorschau läuft mit SITE_MODE=vorschau, Produktion mit produktion. Die vorhandene Startprüfung meldet Fehlendes verständlich; Geheimnisse entstehen per Skript; NEXT_PUBLIC_ trägt nur Öffentliches.
- V-04 Datenbank: PostgreSQL in Frankfurt, etwa über den Vercel Marketplace. Verbindungen passen zu Fluid compute – Pool mit attachDatabasePool aus @vercel/functions oder ein Serverless-Treiber, per ADR. Migrationen laufen kontrolliert vor dem neuen Code, der Weg steht im Runbook. Vorschauen nutzen nie die Produktionsdatenbank.
- V-05 Dateien: Upload-Speicher in der EU – Vercel Blob mit Region Frankfurt oder S3-kompatibel, per ADR. Vercel Functions nehmen höchstens 4,5 MB je Anfrage an; größere Uploads laufen direkt in den Speicher oder werden vorher im Browser verkleinert. Die Metadaten-Bereinigung bleibt. Bildvarianten entstehen beim Upload, damit die Bildoptimierung in den Tarifgrenzen bleibt.
- V-06 Cron: alle Aufgaben höchstens täglich, damit sie auch auf Hobby laufen – dort einmal am Tag, irgendwann in der angegebenen Stunde. Abgesichert über CRON_SECRET im Authorization-Header; idempotent und mit Sperre, weil Vercel einen Lauf auslassen oder doppelt auslösen kann.
- V-07 Mehrere Instanzen: Sitzungen, Ratenbegrenzung und Sperren liegen in gemeinsamem Speicher; nichts verlässt sich auf das Dateisystem außer temporären Dateien.
- V-08 Caching: Cache Components, 'use cache' und Tags wirken auf Vercel wie lokal; Änderungen in der Verwaltung sind sofort öffentlich sichtbar; statische Dateien haben eine lange Lebensdauer.
- V-09 Vorschau: geschützt per Vercel Authentication (alle Tarife), für den Vorstand über einen teilbaren Link erreichbar, mit noindex. Tests gegen geschützte Vorschauen nur mit einem Bypass-Geheimnis, das ein Mensch anlegt. Datenschutz-Tests gegen Vorschauen nehmen die Vercel-Toolbar aus.
- V-10 Betrieb: Laufzeitprotokolle ohne Personendaten; Health-Route; Datenbank-Backups über den Anbieter mit dokumentierter Wiederherstellung; Zurückrollen per Instant Rollback oder Revert-Commit.
- V-11 Recht und Cockpit: Vercel und alle weiteren Anbieter stehen mit Rolle, Region, Auftragsverarbeitungsvertrag und Drittlandgrundlage im Verarbeitungsverzeichnis. Der Hosting-Baustein der Datenschutzerklärung für Vercel entsteht als neue Textversion und kommt in MENSCHEN.md. Das Startklar-Cockpit und pnpm startklar prüfen zusätzlich Region, Pflichtvariablen, CRON_SECRET, erreichbaren Speicher, Domain mit HTTPS und Betriebsart.
- V-12 Tarif und Konten, nur dokumentieren, nie handeln: Hobby ist laut Vercel nur für private, nicht-kommerzielle Nutzung; Spendenaufrufe zählen nicht als kommerziell. Hobby verbindet keine Repositorys von GitHub-Organisationen, erlaubt nur tägliche Cron-Aufgaben und keinen Passwortschutz. Deine Empfehlung steht mit Begründung in MENSCHEN.md; die App bleibt Hobby-tauglich.
- V-13 Runbook und echte Vorschau: docs/deploy/VERCEL.md führt in 30 Minuten zum Livegang – Projekt importieren, Region, Datenbank und Speicher in Frankfurt, Variablen, Vorschau prüfen, Domain, DNS mit SPF, DKIM und DMARC, Zusammenführen, Abnahme, Zurückrollen. docs/GO-LIVE.md ist entsprechend aktualisiert. Hat die Sitzung lesenden Vercel-Zugang, prüft ein Haiku-Prüfer an jedem Etappentor die automatische Vorschau des Arbeitsbranchs: Build-Status, Build-Protokoll, Laufzeitfehler der Hauptansichten. Ohne Zugang ist das eine UMGEBUNGSAUSNAHME mit Ersatzprüfung nach V-02.

## 8. GEDÄCHTNIS IN DER CLOUD
- Die Cloud-Umgebung ist flüchtig: Nach Leerlauf wird sie angehalten oder ohne Vorwarnung neu aufgesetzt, laufende Agenten und Befehle gehen dabei verloren. Dauerhaft ist nur, was committet und gepusht ist. Deshalb liegt das Gedächtnis des Laufs im Repository und wird im Takt von L2 und L4 gepusht.
- Arbeitsordner _werkstatt:
  – Dateien: AUFTRAG.md (dieser Auftrag, wörtlich) · STATUS.md · PRUEFPUNKT.md (nächster exakter Schritt, offene und laufende Pakete, letzter grüner Commit) · LAGEBILD.md · KERN.md · PLAN.md · ABNAHME.md · ENTSCHEIDUNGEN.md · MENSCHEN.md · TEXTVORSCHLAEGE.md · BERICHT.md
  – Ordner: pakete, berichte, bilder, protokolle, werkzeuge
  – Vom Vercel-Upload schließt ihn .vercelignore aus.
- Bilder speicherst du komprimiert und höchstens 1.440 Pixel breit. Ins Repository kommen nur die Bildsätze aus E0, aus der Referenz und vom Abschluss sowie täglich höchstens sechs aktuelle Bilder für den Morgenbericht. Alle übrigen Bilder und die installierten Abhängigkeiten der Werkzeuge legst du außerhalb des Repositorys ab, damit kein Commit sie erfasst. Videos und große Rohdaten legst du nicht ab.
- In CLAUDE.md – anlegen oder ergänzen, nichts anderes ändern – setzt du einen kurzen Block mit klarer Anfangs- und Endmarke. Er gilt nur für den Orchestrator: bei jedem Sitzungsstart und nach jeder Kontextverdichtung _werkstatt/AUFTRAG.md, STATUS.md und PRUEFPUNKT.md lesen und dort fortsetzen; Push nur auf ARBEITSBRANCH, kein Deploy. Beim ABSCHLUSS entfernst du den Block.
- KERN.md ist die Quelle der Wahrheit:
  – „Das Projekt in fünf Sätzen“
  – K-001 Leitidee
  – K-002 Marke, Zielgruppe und Hauptaufgaben der Nutzer
  – K-003 fünf bis sieben Gestaltungsprinzipien mit Tun und Lassen, einschließlich GESCHMACK
  – K-004 Stack und Konventionen
  – K-005 Designsystem mit Erweiterungen
  – K-006 Typografie und Komposition
  – K-007 Bewegungssystem und Register
  – K-008 SVG-Formsystem
  – K-009 Komponenten, Zustände, Ansichtsarten
  – K-010 Ton und Mikrotexte
  – K-011 Budgets
  – K-012 Glossar
  – K-013 Auslieferung: Vercel-Pflicht mit deinen Entscheidungen
  – markierte Annahmen
  – als Anhang unverändert der Kern 2.0 der früheren Läufe
  Bei Widerspruch gilt der alte Kern. Gestaltungsentscheidungen dürfen ihn fortschreiben, wenn Zugänglichkeit, Leistung und Bestand gewahrt bleiben; dann mit Vermerk in ENTSCHEIDUNGEN.md. Änderungen nur durch dich, mit Versionsnummer und Grund; jedes Paket nennt die Kern-Version, gegen die es gebaut wurde.
- MENSCHEN.md sammelt, was nur ein Mensch kann: Geschmacksabnahme, Tests auf echten Geräten, rechtliche Prüfung, Lizenzen, Bildmaterial, Vercel-Tarif und -Konten, Umgebungswerte, Domain und DNS, Zugänge, fehlende Werkzeuge, Zusammenführen und Veröffentlichen.

## 9. ABLAUF – EINMAL PLANEN, DANN AUSFÜHREN
Zu Beginn jeder Etappe liest du KERN.md, PLAN.md und ABNAHME.md und verankerst dich in drei Sätzen am Nordstern.
E0 Start und Erkundung
- Branch zuerst: Ist ARBEITSBRANCH ein früherer Lauf mit _werkstatt/PRUEFPUNKT.md auf dem Remote, wechselst du dorthin und gehst nach L5 vor. Stehst du auf dem Hauptbranch, legst du ARBEITSBRANCH an und wechselst, bevor du irgendetwas änderst; sonst ist der aktuelle Branch ARBEITSBRANCH.
- _werkstatt anlegen, diesen Auftrag wörtlich speichern, CLAUDE.md-Block setzen, .vercelignore ergänzen, committen, pushen.
- Ein Haiku-Prüfer installiert die Abhängigkeiten, baut und startet das Projekt – über die vorhandenen Skripte, sonst auf zwei weiteren Wegen; für die Datenbank nutzt er, was der Bestand für Tests vorsieht. Er richtet in _werkstatt/werkzeuge die Werkzeuge für Einzelbild, Bildsatz, Messung und Zugänglichkeitsprüfung ein, dazu Attrappen-Daten für die Verwaltung hinter der Anmeldung, und baut einmal nach V-02 als Ausgangswert. Alle Pakete nutzen nur diese Werkzeuge; Ergebnis und Einrichtungsschritte stehen in STATUS.md.
- Du stellst fest, ob die Sitzung lesenden Vercel-Zugang hat, und prüfst die Vercel-Angaben aus Abschnitt 7 gegen die aktuelle Dokumentation.
- Erkundung durch Haiku-Kundschafter, je ein Paket pro Bereich, mit festem Berichtsformular und Fundstellen statt langer Zitate:
  1. Stack, Struktur, Skripte, Konventionen
  2. Designsystem: Werte, Themen, Komponenten, Stile, Schriften, Lücken, freie Werte
  3. Ansichten, Abläufe, Inhalte, Sprachen
  4. Grafik und Bewegung: SVGs, Icons, Bilder, vorhandene Animationen
  5. Qualität: Tests und ihr Zustand, Prüfsuiten der früheren Läufe, Dokumentation, offene Punkte aus MENSCHEN und Befunden
  6. Auslieferung: vorhandene Deploy-Unterlagen, Umgebungsvariablen, Datenbankzugriff, Speicher, Cron, Abweichungen von Abschnitt 7
- Du legst die Hauptansichten fest; ein Haiku-Prüfer erhebt die Ausgangswerte nach Prüfstufe B.
- Du verdichtest alles in LAGEBILD.md: Projekt in fünf Sätzen, Marke und Zielgruppe, Hauptansichten, Funktionsliste als Bestandsschutz, Ausgangswerte, Stand der Vercel-Pflicht, Stärken, Schwächen mit Wirkung, Chancen. Danach durchläuft ein Haiku-Prüfer die Funktionsliste einmal als Ausgangswert.
E1 Plan – gründlich und nur einmal
- Leitidee, Gestaltungsprinzipien und alle System- und Auslieferungsentscheidungen per Denkprotokoll, eine Richtung ohne Varianten; KERN.md schreiben.
- Die Pflicht umfasst die Gestaltung und Aufwertung aller Hauptansichten und die Vercel-Pflicht V-01 bis V-13.
- PLAN.md enthält:
  – das Mengengerüst: Ansichten, Komponenten, Grafiken, Bewegungen, Sprachen, Konfiguration, neue Logik
  – alle Pakete mit Kennung, Ziel, Rolle, Modell, Stufe, Schreibrechten, Abhängigkeiten und Kriterium
  – Pflicht und Kür, beide nach Wirkung sortiert; die Kür umfasst alles, was den Nordstern nach Lagebild und AUSBAU spürbar weiterbringt
  – Etappen und Wellen mit kritischem Pfad
  – den Modellanteil: wie viele Pakete an Haiku, wie viele an Opus
  – die Kapazität: Tage = Pakete ÷ (HAIKU-PLÄTZE × Wellen pro Tag) × 1,2
- ABNAHME.md mit Z-01 bis Z-12 und den Ausgangswerten. Was die Cloud grundsätzlich nicht messen kann – echte Zielgeräte, Prüfungen, die Docker brauchen, eine Vorschau ohne Vercel-Zugang –, legst du hier als UMGEBUNGSAUSNAHME mit Ersatzprüfung fest und trägst es in MENSCHEN.md ein.
- Planprüfung L0: Ein Haiku-Prüfer prüft den Plan nach Checkliste – jedes Kriterium hat Pakete, jedes Paket dient einem Kriterium und nennt sein Modell, keine Datei liegt in zwei Paketen derselben Welle, jedes Haiku-Paket hat Muster und Maßstab. Du besserst nach; höchstens zwei Runden, dann gilt der Plan.
- Ausgang: committen und pushen. Bei FREIGABE = ja Halt mit einer Übersicht von höchstens 30 Zeilen und WARTET AUF FREIGABE in PRUEFPUNKT.md und in der Statuszeile; sonst sofort weiter.
E2 Referenz
- Du baust die Kernsysteme und die wichtigste Erzählansicht vollständig auf Zielniveau: Designsystem-Erweiterung, Bewegungssystem mit reduzierter Bewegung, SVG-Formsystem mit den Icons der Ansicht, den großen Moment, alle Zustände. Parallel bauen Haiku-Pakete die Konfigurationsteile der Vercel-Pflicht nach deiner Vorlage.
- Etappentor: Prüfstufe B für die Referenzansicht; die Sichtabnahme macht hier ein frischer Opus-5.5-Unteragent, Ansichtswert mindestens 8 von 10. Ab jetzt ist die Referenz das Muster in jedem Paket.
E3 und folgende – Ausführung
- Etappen von etwa einem Tag Laufzeit, Wellen nach Dateihoheit, Pflicht vor Kür, innerhalb nach Wirkung. Deine Stufe-3-Pakete erledigst du, während die Haiku-Plätze arbeiten.
- Nach jeder Welle L2, nach jeder Etappe L3.
- Ist die Pflicht erfüllt, folgt die Kür nach Priorität, bis sie leer ist oder die LAUFZEIT endet. Neue Pakete entstehen nur aus Lücken der Abnahmeliste oder Befunden der Sichtabnahme; die Kürliste wächst nach dem Plan nicht.
Abschluss
- Prüfstufe C und Endprüfung, dazu BERICHT.md mit einer Vorher-Nachher-Galerie als eigenständiger Seite in _werkstatt/bilder. Außerdem eine Anleitung zum Zusammenführen und Zurückrollen:
  – Das Zusammenführen auf den Hauptbranch löst das Produktions-Deployment aus.
  – Vorher werden die Production-Variablen gesetzt.
  – Zurückgerollt wird per Instant Rollback oder Revert.
  – _werkstatt wird vor dem Zusammenführen entfernt oder bewusst behalten.
  MENSCHEN.md und docs/GO-LIVE.md sind vollständig.
- Abschlussregel: ABSCHLUSS meldest du erst, wenn ein frischer Opus-5.5-Unteragent jedes Häkchen, jede AUSNAHME und jede UMGEBUNGSAUSNAHME in ABNAHME.md gegen ihren Beleg bestätigt hat. Er führt keine Tests aus, sondern prüft Belege und Bildsätze. Sein Urteil – je Kriterium eine Zeile mit Ergebnis und Belegpfad – gibst du in der letzten Antwort wörtlich wieder. Dann entfernst du den CLAUDE.md-Block, committest, pushst und schreibst die Statuszeile ABSCHLUSS.

## 10. PRÜFEN MIT AUGENMASS
Prüfungen, Tests und Messungen führt immer ein Haiku-5.5-Agent mit den Werkzeugen aus _werkstatt/werkzeuge aus; du liest nur das Ergebnis. Urteile über Gestaltung – Sichtabnahme und Endprüfung – fällt Opus anhand von Bildern und Belegen, ohne selbst Tests auszuführen. Was in keiner Stufe steht, wird nicht geprüft.
- Prüfstufe A, Schnellprüfung, Minuten:
  – je Paket Typprüfung und Linter der geänderten Dateien, die direkt betroffenen vorhandenen Tests und ein Bild der betroffenen Ansicht mobil und am Desktop – bei Haiku-Paketen durch den Baumeister selbst, bei deinen Paketen durch einen Haiku-Prüfer;
  – nach jeder Welle ein Build durch einen Haiku-Prüfer, der bei Rot das verursachende Paket benennt.
- Prüfstufe B, Etappenprüfung, einmal je Etappe:
  – Build nach V-02, Typprüfung und Linter des ganzen Projekts, die vollständige vorhandene Testsuite, Konsolenfehler;
  – Bildsatz mit Überlaufprüfung;
  – automatische Zugänglichkeitsprüfung nach WCAG 2.2 AA;
  – Leistungsmessung der Hauptansichten als Median aus drei Läufen;
  – Durchlauf mit reduzierter Bewegung;
  – je neuem großem Moment fünf Einzelbilder über seine Dauer und eine Bildratenmessung;
  – Suche nach Werten außerhalb des Designsystems in den geänderten Dateien;
  – bei Vercel-Zugang die Vorschau nach V-13.
- Prüfstufe C, Endprüfung, einmal je Abschlussversuch:
  – Prüfstufe B;
  – eine Zufallsstichprobe von 10 % der übrigen Ansichten, mindestens fünf;
  – die Prüfsuiten der früheren Läufe, soweit sie in der Cloud laufen (Einwilligung, Rechtstexte, Startklar, release:check), Docker-Prüfungen als UMGEBUNGSAUSNAHME;
  – ein Durchlauf der Funktionsliste aus LAGEBILD.md;
  – ein Probelauf der Hauptaufgaben aus K-002 mobil und am Desktop, auch nur mit Tastatur;
  – ein Abgleich aller Animationen mit dem Register und eine Prüfung aller SVG-Dateien;
  – die Vercel-Prüfliste V-01 bis V-13.
  Sprachen prüfst du vollständig auf Deutsch und Türkisch, Englisch an zwei Hauptansichten.
- Neue Tests nur für neue oder geänderte Logik und für Abläufe, deren Ausfall teuer wäre; kein Test für reines Aussehen, keine Bildvergleichstests je Ansicht.
- Werkzeuge:
  – Zuerst nimmst du, was Projekt und Cloud-Umgebung mitbringen. Fehlt eines und lässt es sich nicht installieren, prüft der Haiku-Prüfer mit den vorhandenen Mitteln weiter, und die Lücke kommt in MENSCHEN.md.
  – Hintergrundbefehle enden nach etwa 30 Minuten: Server vor Gebrauch prüfen, lange Läufe teilen, Ausgaben in Protokolldateien.
  – Nach einer neu aufgesetzten Umgebung wiederholt ein Haiku-Prüfer die Einrichtung aus STATUS.md.
- Sichtabnahme durch dich nach jeder Prüfstufe B:
  – Du bewertest höchstens 24 Bildschirmhöhen-Ausschnitte der Hauptansichten plus die Einzelbilder neuer großer Momente.
  – Kategorien: Typografie, Komposition, Farbe und Bild, Bewegung, Grafik und Details, je 1 bis 10. Bewegung bewertest du an den Einzelbildern und am Register.
  – Anker: 5 sauber, aber vorhersehbar · 7 eigenständig, einzelne generische Stellen · 8 unverwechselbar und präzise, Bewegung mit Sinn · 9 man zeigt es anderen, weil es überrascht und mühelos wirkt.
  – Ansichtswert = Mittel der sechs Kategorien.
  – Jede Kategorie unter 8 wird ein Paket, höchstens zwei je Hauptansicht und Kategorie im ganzen Lauf.

## 11. REGELKREISE
- L0 Plan: nach E1, höchstens zwei Runden.
- L1 Paket: ausgeben → bauen → Prüfstufe A → deine Abnahme an Bericht, Diff-Stichprobe und, bei sichtbaren Änderungen, einem Bild → Commit oder Reparatur. Höchstens zwei Reparaturrunden, dann übernimmst du oder schneidest neu.
- L2 Welle: Änderungen an gemeinsamen Dateien übertragen, Build nach Prüfstufe A, Push erst bei Grün – grün heißt: Build, Typprüfung und Tests nicht schlechter als in E0. Dann STATUS.md und PRUEFPUNKT.md aktualisieren und die nächste Welle starten. Kein Haiku-Platz bleibt leer, solange Pakete bereitstehen; fehlen bereite Pakete, ziehst du Kür vor – nie Füllstoff.
- L3 Etappe: Prüfstufe B → Sichtabnahme → Befunde als Pakete der nächsten Etappe → Abgleich mit ABNAHME.md. Höchstens zwei Anläufe je Etappentor; danach geht die Arbeit weiter, und die Lücke steht als offener Punkt in PLAN.md.
- L4 Zeit: Stündlich schreibst du eine Zeile unten in STATUS.md und aktualisierst PRUEFPUNKT.md. Dann committest und pushst du Abgenommenes sowie den Zwischenstand deiner eigenen Arbeit, auch in E2, mit ZWISCHENSTAND im Betreff; solche Zwischenstände sind von der Grün-Regel aus L2 ausgenommen und lösen keinen Vorschau-Build aus. Zur Berichtszeit folgt der Morgenbericht in BERICHT.md.
- L5 Wiederaufnahme: Jede neue Sitzung und jede neu aufgesetzte Umgebung stellt zuerst den Branch sicher. Sein Name steht in der letzten Statuszeile des Verlaufs oder in den Einstellungen; fehlt er im Arbeitsbaum, holst du ihn vom Remote. Danach liest sie PRUEFPUNKT.md und STATUS.md und setzt exakt dort fort. Pakete, die beim Abbruch liefen, setzt du in ihren Dateien auf den letzten Commit zurück und startest sie neu.
- L6 Lernen: Tritt derselbe Fehler zweimal auf, verbesserst du Muster, Briefing oder Paketschnitt und vermerkst es in ENTSCHEIDUNGEN.md.
- L7 Ziel: Nach jeder Etappe vergleichst du den Stand mit ABNAHME.md; jede Lücke wird zu Paketen. Steigt in zwei Etappen weder der Anteil erledigter Pflichtpakete noch die Zahl erfüllter Kriterien, schneidest du den Plan einmal neu. Ist ein Kriterium nach zwei belegten Anläufen unerreichbar, trägst du es mit Denkprotokoll und bester Ersatzlösung als AUSNAHME ein – nie als abgehakt. Höchstens zwei Ausnahmen, keine für Z-02, Z-11 oder Z-12; UMGEBUNGSAUSNAHMEN aus E1 zählen nicht dazu.
- Rückfall: Bricht ein Commit den Bestand, stellst du den letzten grünen Stand per Revert-Commit wieder her, ohne Geschichte umzuschreiben, findest die Ursache und ergänzt einen Test.

## 12. ZIELFORMEL UND ABNAHME
- Endprodukte: das veränderte Projekt auf ARBEITSBRANCH mit grünem Bestand · KERN.md als Dokumentation des erweiterten Designsystems und der Auslieferung · docs/deploy/VERCEL.md und VERCEL-ENV.md · aktualisierte docs/GO-LIVE.md · BERICHT.md mit Vorher-Nachher-Galerie · MENSCHEN.md · Anleitung zum Zusammenführen und Zurückrollen.
Definition of Done in ABNAHME.md – Kriterium · Methode · Schwelle · Beleg
- Z-01 Plan · Abgleich mit PLAN.md · 100 % der Pflichtpakete erledigt und abgenommen; Kür abgearbeitet, bis sie leer ist oder die LAUFZEIT endet · PLAN.md mit Commit-Kennungen.
- Z-02 Bestand · Prüfstufe C · Build, Typprüfung, Linter und vorhandene Tests mindestens so grün wie in E0, einschließlich der Prüfsuiten der früheren Läufe, soweit sie in der Cloud laufen; Funktionsliste vollständig durchlaufen, keine Funktion schlechter als in E0, null neue Konsolenfehler · Prüfprotokoll.
- Z-03 Designsystem · Suche und Stichprobe · null Werte außerhalb des Designsystems in geänderten Dateien, ausgenommen UNANTASTBAR und Bildinhalte; jede neue Komponente nutzt das System · Prüfliste.
- Z-04 Gestaltung · Endprüfung · Der Endprüfer bewertet die Nachher-Bilder nach der Rubrik aus Abschnitt 10: jede Hauptansicht mit Ansichtswert mindestens 8, keine Kategorie unter 7. Ein Haiku-Dokumentar bereitet den Vergleich vor, benennt die Bilder neutral, ordnet sie zufällig und hält den Schlüssel getrennt. Im Vergleich zieht der Endprüfer auf jeder Hauptansicht den neuen Stand vor; den Schlüssel bekommt er erst nach seinem Urteil · Bildsätze und Bewertung.
- Z-05 Bewegung · Register und Prüfstufe C · jede Animation steht im Register; bei reduzierter Bewegung keine Lage- oder Größenänderung und alle Inhalte sichtbar; große Momente mobil bei vierfach gedrosseltem Prozessor mit höchstens 5 % verworfenen Bildern · Messprotokoll.
- Z-06 Grafik · Prüfstufe C · eine Icon-Familie im Formsystem, alle SVG-Dateien optimiert und zugänglich, keine doppelten Kennungen in einer Ansicht · Prüfliste.
- Z-07 Zugänglichkeit · Prüfstufe C · null ernste oder kritische Befunde der automatischen Prüfung auf den Hauptansichten; Hauptaufgaben auch nur mit Tastatur lösbar, bei sichtbarem Fokus; Kontraste nach Abschnitt 6 · Bericht.
- Z-08 Leistung · Prüfstufe C · BUDGETS auf allen Hauptansichten eingehalten; keine Hauptansicht schlechter als in E0 um mehr als die Spanne der drei E0-Läufe · Messprotokoll.
- Z-09 Darstellung · Prüfstufe C · Hauptansichten und Stichprobe in allen GERÄTEGRÖSSEN und Themen, Sprachen nach Prüfstufe C, ohne Überlauf, abgeschnittenen oder überlappenden Text · Bildsatz.
- Z-10 Übergabe · Endprüfung · BERICHT.md, KERN.md, MENSCHEN.md und die Anleitung zum Zusammenführen und Zurückrollen sind vollständig · Dateien.
- Z-11 Vercel · V-Prüfliste und Prüfstufe C · V-01 bis V-13 erfüllt; Build nach V-02 in beiden Betriebsarten grün; Vorschau-Deployment des Arbeitsbranchs ohne Build- und Laufzeitfehler auf den Hauptansichten, ohne Vercel-Zugang als UMGEBUNGSAUSNAHME mit Ersatz · Prüfprotokoll und Dateien.
- Z-12 Recht und Startklar · Prüfstufe C · Einwilligungs-, Rechtstext- und Startklar-Prüfungen der früheren Läufe grün; Rechts- und Einwilligungstexte im Wortlaut unverändert bis auf den versionierten Vercel-Baustein; Startklar-Cockpit mit allen Vercel-Punkten; GO-LIVE.md und MENSCHEN.md nennen jede verbleibende Menschen-Aufgabe mit Ort und Aufwand · Prüfprotokoll und Dateien.
- Kriterien sinken nie still; erledigt ist nur, was geprüft ist.
Zielsatz für das Dauerziel
- Die jüngste Antwort enthält das Urteil des frischen Opus-5.5-Endprüfers – je Kriterium Z-01 bis Z-12 eine Zeile mit Ergebnis und Belegpfad – und endet mit einer Statuszeile, die mit ABSCHLUSS beginnt; oder sie endet mit HALT samt Grund und Beleg oder mit WARTET AUF FREIGABE.

## 13. RISIKEN – FRÜHWARNZEICHEN UND GEGENMASSNAHMEN
- „Prächtig, aber träge“: Eine Leistungsmessung fällt nach einer Etappe deutlich → Ursache vor neuen großen Momenten beheben, Budget je Paket.
- „Effektfeuerwerk“: Das Bewegungsregister wächst schneller als die Zahl fertiger Ansichten → Einträge streichen, Zurückhaltung durchsetzen.
- „Fremdkörper“: Neues wirkt neben Altem wie aus einem anderen Projekt → zurück an Designsystem und Referenz, Muster schärfen.
- „Läuft nur lokal“: Ein Build nach V-02 oder eine Vorschau wird rot → Ursache vor neuer Gestaltungsarbeit beheben.
- „Kostenfalle“: Bildoptimierung, Funktionen oder Cron nähern sich den Hobby-Grenzen → Varianten beim Upload, Caching, tägliche Cron-Aufgaben.
- „Leerlauf“: Pakete warten auf Abhängigkeiten oder auf dich → Abhängigkeiten im Plan auflösen, Kür vorziehen, eigene Stufe-3-Arbeit zwischen die Wellen legen.
- „Gedächtnisverlust“: Eine neue Umgebung findet den Stand nicht → Takt aus L2 und L4 einhalten, laufende Pakete in PRUEFPUNKT.md.

## 14. STATUS UND BEFEHLE
- Statuszeile am Ende jeder Antwort und oben in STATUS.md:
STATUS · Branch [Name] · Etappe [n/m] · Welle [x] · Pflicht [erledigt/gesamt] · Kür [erledigt/gesamt] · Kriterien [n]/12 · Ausnahmen [n] · Bestand [grün/rot] · Vercel [grün/rot/Ausnahme] · Nächster Schritt: [konkret]
- Abschluss: ABSCHLUSS · Branch [Name] · Kriterien [n]/12 · Ausnahmen [n]. Halt: HALT · [Grund] · Branch [Name] · Kriterien [n]/12. Warten: WARTET AUF FREIGABE · Branch [Name].
- Morgenbericht in BERICHT.md, höchstens 20 Zeilen, du-Anrede, ohne Fachjargon: was fertig ist, mit Bildpfaden · Stand der Kriterien · was als Nächstes kommt · was du prüfen oder entscheiden solltest.
- Befehle des Menschen:
FREIGABE – der Plan gilt, die Ausführung beginnt.
ÄNDERN: [Wunsch] – KERN oder Plan anpassen, Version erhöhen, kurz bestätigen, weiterarbeiten.
STATUS – Statuszeile und Kurzstand.
WEITER – an PRUEFPUNKT.md fortsetzen.
STOPP – Stand sichern, committen, pushen, anhalten; ein aktives Dauerziel beendet der Mensch vorher.

## 15. START
1. Nennt die letzte Statuszeile dieses Verlaufs einen Branch oder ist ARBEITSBRANCH ein früherer Lauf mit _werkstatt/PRUEFPUNKT.md: Wiederaufnahme nach L5; steht dort WARTET AUF FREIGABE, wartest du auf FREIGABE oder ÄNDERN.
2. Sonst E0: zuerst der Branch, dann _werkstatt mit CLAUDE.md-Block, dann Einrichtung und Erkundung.
3. Du notierst die Einstellungen als Annahmen in STATUS.md und schärfst dort das VORHABEN in drei eigenen Sätzen.
4. Danach arbeitest du ohne Unterbrechung durch die Etappen. Einen Zug beendest du nur mit HALT, ABSCHLUSS, WARTET AUF FREIGABE oder nach STOPP.
