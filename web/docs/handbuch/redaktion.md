# Handbuch für die Redaktion

Für alle, die auf der Website der Gemeinde Nachrichten, Seiten, Menüs und die Anzeige im Gebetsraum pflegen. Du brauchst kein Technikwissen. Die Schritte sind kurz.

**Stand:** 15.10.2026. **Nachrichten, Veranstaltungen, Ankündigungen, Medien, Seiten mit Bausteinen, Menüs, Weiterleitungen, Freigaben und Anzeige-Folien** gibt es in der Verwaltung; dieses Handbuch beschreibt die Bildschirme so, wie sie sind. Bildschirmfotos folgen (Marke **[Bildschirmfoto folgt]**). Eine Verwaltung für die **Abschnitte der Startseite** und für **Islamisches Wissen** gibt es nicht (siehe 5 und 7).

## 1. Das Wichtigste vorab

1. **Religiöse Texte schreibst du nicht.** Keine Koranverse, keine Hadithe, keine Bittgebete, keine Übersetzungen, keine Wortbedeutungen, keine Erklärungen zu Tajwid oder Fiqh. Das schreibt und prüft nur der Imam oder die Hoca. Im Seiten-Editor setzt du nur **Verweise** auf freigegebene Inhalte.
2. **Fotos von Personen** nur mit Einwilligung. Bei Kindern brauchen wir die Einwilligung der Eltern. Frage vor dem Hochladen [Ansprechperson – Vorstand]. In der Mediathek setzt du dafür „Auf dem Bild sind Personen erkennbar.“ und bestätigst die Zustimmung (siehe 9).
3. **Keine Namen und Daten von Kindern** in Nachrichten, Bildunterschriften und Bildnamen.
4. **Jedes Bild braucht einen Alt-Text** (was ist zu sehen?). Der hilft Menschen, die den Bildschirm vorlesen lassen.
5. **Rechte beachten:** Wer hat das Foto gemacht, und darf die Gemeinde es zeigen? Das trägst du bei „Bildrechte“ ein.

## 2. Anmelden

1. Öffne die Einladungs-E-Mail und tippe auf den Link.
2. Lege ein Passwort fest (mindestens 12 Zeichen).
3. Richte die **Zwei-Faktor-Anmeldung** ein (Authenticator-App, QR-Code scannen, Code eintippen, Ersatzcodes aufschreiben). Sie ist in der Verwaltung **Pflicht**.
4. Danach: Adresse `/verwaltung` → E-Mail, Passwort, Code.

Die Sitzung dauert höchstens **8 Stunden**. Danach meldest du dich neu an.

Die Rolle bestimmt, was du siehst. **Redaktion** darf Nachrichten, Veranstaltungen, Ankündigungen, Seiten, Menüs, Weiterleitungen, Anzeige, Medien und mehr. **Organisationsredaktion** darf nur Inhalte der **eigenen Organisation** ändern.

## 3. Nachrichten schreiben (Neuigkeiten)

1. Verwaltung → **„Neuigkeiten“** → **„Neue Nachricht“**. [Bildschirmfoto folgt]
2. Fülle aus:
   - **Titel** und **Kurztext** (höchstens 400 Zeichen; erscheint auf den Karten),
   - **Text** (Enter macht einen neuen Absatz; Links nur mit https://, mailto:, tel: oder als Seite dieser Website, zum Beispiel /kontakt),
   - **Kategorie**, **Organisation** (nur bei Organisationsredaktion die eigene),
   - **Bild** aus der Mediathek,
   - **Schlagwörter**, durch Kommas getrennt.
3. **Status:** „Entwurf“ (nicht öffentlich) oder „Veröffentlicht“.
4. **Veröffentlichen am:** leer lassen = erscheint sofort beim Speichern. Mit Datum und Uhrzeit erscheint sie später.
5. **Empfohlen** oder **Wichtig** hebt die Nachricht hervor.
6. **Übersetzungen (Türkisch, Englisch)** sind optional. Fehlt eine, zeigt die Website den deutschen Text mit dem Hinweis „Nur auf Deutsch verfügbar“. Die Zeilenzahl muss wie im Deutschen sein.
7. Tippe auf **„Speichern“**. Mit **„Öffentlich ansehen“** prüfst du das Ergebnis.

**Papierkorb:** „In den Papierkorb“ nimmt eine Nachricht aus der Website. Nach **30 Tagen** wird sie endgültig gelöscht. Bis dahin kannst du sie **wiederherstellen**.

**Veranstaltungen** und **Ankündigungen** funktionieren ähnlich (Verwaltung → „Veranstaltungen“, „Ankündigungen“).

**Benachrichtigung bei Ankündigungen:** Ist Web Push in der Gemeinde eingeschaltet, geht beim **ersten Veröffentlichen** einer Ankündigung ein Hinweis **ohne Inhalt** („Neue Ankündigung der Moschee“) an alle, die Ankündigungen abonniert haben. Hat die Ankündigung einen späteren Beginn („Sichtbar ab“), geht der Hinweis erst dann hinaus – dafür muss der Takt des lokalen Servers laufen. Auslösen können **Redaktion** und **Administration**; die Organisationsredaktion veröffentlicht ohne Hinweis. Erneutes Veröffentlichen derselben Ankündigung innerhalb von drei Tagen sendet nicht noch einmal.

## 4. Seiten bauen mit Bausteinen

Mit dem Seiten-Editor baust du freie Seiten aus **Bausteinen**, zum Beispiel „Moscheeführung“ oder „Ramadan-Hinweise“, ohne Entwickler. [Bildschirmfoto folgt]

**So legst du eine Seite an:**

1. Verwaltung → **„Seiten“** → **„Neue Seite“**.
2. Gib **Titel** und **Adresse** (Slug) an. Erlaubt sind Kleinbuchstaben, Ziffern und Bindestriche. Einige Adressen sind **reserviert** (zum Beispiel /quran, /hadith); die Plattform sagt es dir.
3. Tippe auf **„Baustein hinzufügen“** und wähle einen Baustein.
4. Fülle den Baustein aus. Verschiebe Bausteine mit **„Nach oben“** und **„Nach unten“**; „Entfernen“ lässt sich mit „Rückgängig“ zurücknehmen.
5. Türkisch und Englisch trägst du je Baustein ein; der **Übersetzungsstand** steht beim Baustein (zum Beispiel „1 von 2 übersetzt“).
6. **Speichern** legt eine **Fassung** an (siehe 4.2).

### 4.1 Die Blöcke

| Baustein                    | Wofür                                                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Text                        | Absätze, Zwischenüberschriften, Listen und Links                                                                                              |
| Bild                        | ein Foto aus der Mediathek mit Beschreibung                                                                                                   |
| Bildergalerie               | mehrere Fotos in einem ruhigen Raster                                                                                                         |
| Hinweis mit Knopf           | hervorgehobener Kasten, der zu einer anderen Seite führt (zum Beispiel „Jetzt anmelden“)                                                      |
| Fragen und Antworten        | aufklappbare Fragen mit Antworten                                                                                                             |
| Trennlinie                  | Linie mit Achtstern zwischen zwei Abschnitten                                                                                                 |
| Spalten                     | zwei oder drei Textkästen nebeneinander                                                                                                       |
| Nächste Termine             | die nächsten Veranstaltungen, automatisch aktuell                                                                                             |
| Neueste Nachrichten         | die neuesten Beiträge, automatisch aktuell                                                                                                    |
| Kontakt                     | Adresse, Telefon, E-Mail und Öffnungszeiten                                                                                                   |
| Datei zum Herunterladen     | ein PDF aus der Mediathek, zum Beispiel ein Flyer                                                                                             |
| Gebetszeiten heute          | die heutigen Gebetszeiten der Moschee, kompakt                                                                                                |
| Koranvers, Hadith (Verweis) | **nur Verweise** auf Einträge der Datenbank; der Text erscheint erst nach der **Freigabe**. Du wählst den Eintrag aus, du schreibst ihn nicht |

Einen Baustein „Karte“ gibt es nicht.

### 4.2 Entwurf, Prüfung, Veröffentlichen, Zeitplan

1. Eine neue Seite ist ein **Entwurf**. Niemand sieht sie.
2. Mit **„Vorschau-Link erzeugen“** erhältst du einen Link, der **24 Stunden** gilt und die gespeicherte Fassung ohne Anmeldung zeigt. Gib ihn nur an die Person, die lesen soll.
3. **„Zur Prüfung geben“** gibt die Seite an eine zweite Person [Wer prüft? – Vorstand].
4. Die Prüfperson **gibt frei** (die Seite wird veröffentlicht) oder **weist zurück** – mit Kommentar.
5. **Zeitplan:** „Veröffentlichen am“ – mit Datum und Uhrzeit erscheint die Seite automatisch zu diesem Zeitpunkt. Ein automatisches Ende gibt es nicht; nimm die Seite dann von Hand zurück.
6. **Frühere Fassungen:** Jedes Speichern legt eine Fassung an; die letzten 30 bleiben. Unter **„Frühere Fassungen“** holst du eine zurück („Diese Fassung zurückholen“).

Enthält die Seite Vers- oder Hadith-Blöcke, ist zusätzlich die **religiöse Freigabe** nötig (siehe 7).

## 5. Menüs und Startseite

- **Menüs:** Verwaltung → **„Menüs“**. Wähle das Menü: **Hauptmenü (Kopf)** aus Gruppen (höchstens 6 Gruppen mit je 12 Einträgen) oder **Schnellzugriff (Fuß)** (höchstens 12 Einträge). „Gruppe hinzufügen“, „Eintrag hinzufügen“; die Reihenfolge änderst du mit „Nach oben“ und „Nach unten“. Jeder Eintrag zeigt auf eine Seite der Website. [Bildschirmfoto folgt] Gibt es kein Menü in der Datenbank, nutzt die Website das feste Standardmenü.
- **Startseite:** Die Abschnitte der Startseite und ihre Reihenfolge sind fest; einen Bildschirm „Startseite“ gibt es in der Verwaltung nicht. Was dort erscheint, steuerst du über die Inhalte selbst: Bei den Nachrichten macht „Empfohlen“ einen Beitrag bis zu 30 Tage nach der Veröffentlichung zum Aufmacher (sonst steht der neueste oben); dazu kommen die nächsten Veranstaltungen und die Seiteninhalte.

## 6. Weiterleitungen

Wenn sich die Adresse einer Seite ändert, leite die **alte Adresse** auf die neue um. So laufen alte Links und Lesezeichen weiter.

1. Verwaltung → **„Weiterleitungen“** → **„Neue Weiterleitung“**. [Bildschirmfoto folgt]
2. **Alte Adresse** eintragen (zum Beispiel `/alte-seite`).
3. **Neue Adresse** eintragen (eine Adresse dieser Website, zum Beispiel `/gebetszeiten`).
4. „Weiterleitung speichern“. Sie gilt ab sofort. Öffne die alte Adresse selbst und prüfe, dass sie ankommt.

Keine Schleifen: Leitet die neue Adresse wieder zurück, lehnt die Plattform die Weiterleitung ab.

## 7. Freigaben

Es gibt **zwei Arten** der Freigabe:

| Art              | Wofür                                                                                                                                                                                                             | Wer gibt frei                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Redaktionell** | freie Seiten, die zur Prüfung gegeben wurden (Nachrichten, Veranstaltungen und Ankündigungen haben keinen Prüfschritt)                                                                                            | eine zweite Person, die Seiten veröffentlichen darf [Wer? – Vorstand] |
| **Religiös**     | Wortbedeutungen, Tajwid-Texte, Hadith-Übersetzungen, besondere Tage, Vers- und Hadith-Listen, Folien mit Vers oder Hadith, Seiten mit Vers- oder Hadith-Bausteinen; Elifbe-Lektionen, wenn sie zur Prüfung stehen | **nur** die Rolle „religiöse Prüfung“ (Imam, Hoca)                    |

Der Weg: **Entwurf → zur Prüfung → geprüft**. Eine Änderung an einem geprüften Eintrag setzt die Freigabe zurück. **Öffentlich** ist nur, was **geprüft** ist. Für **Elifbe-Lektionen** und die Texte unter **„Islamisches Wissen“** gibt es in der Verwaltung keine Bearbeitung.

Unter Verwaltung → **„Freigaben“** siehst du, was wartet, und den Verlauf. Zur Prüfung gibst du einen Inhalt dort, wo du ihn bearbeitest (zum Beispiel bei Seiten „Zur Prüfung geben“). Redaktionelle Freigaben für Seiten erteilt, wer Seiten veröffentlichen darf; die religiöse Freigabe erteilst du **nicht**. [Bildschirmfoto folgt]

## 8. Anzeige-Folien im Gebetsraum

Der Bildschirm im Gebetsraum zeigt die Gebetszeiten und dazwischen **Folien**. Du pflegst sie unter Verwaltung → **„Anzeige“**. [Bildschirmfoto folgt]

1. **„Neue Folie“** → **Art** wählen: Text, Bild, Veranstaltung, Spende, Hinweis; **Koranvers** und **Hadith** nur als Verweis (sichtbar erst nach der religiösen Freigabe durch eine zweite Person).
2. Fülle die Folie aus. Halte den Text **kurz**: wenige Zeilen, große Schrift, Alt-Text beim Bild.
3. **Zeitplan:** Von/Bis (Datum, Uhrzeit) und **Wochentage**. Kein Tag gewählt = jeden Tag.
4. **Reihenfolge** in der Liste mit „Nach oben“ und „Nach unten“ festlegen.
5. **Status:** Entwurf oder Sichtbar.

**Gut zu wissen:**

- Im **Gebetsfenster** (vom Ezan bis zur Iqama plus Ruhezeit, vorgesehen 15 Minuten) zeigt der Bildschirm **keine Folien**.
- **Iqama-Abstände**, Ruhezeit und **Freitagsmodus** stehen unter Anzeige → „Einstellungen“ und werden nach den Angaben des Imams gepflegt [MN-14]. Ohne Iqama-Angabe zeigt die Anzeige keine Iqama. Am Freitag wechselt die Anzeige in den **Freitagsmodus**. Änderungen übernimmt der Bildschirm spätestens nach fünf Minuten.
- Fällt das Internet aus, läuft die Anzeige mit den gespeicherten Zeiten weiter.
- Prüfe eine neue Folie am Bildschirm: Wird sie lesbar von hinten im Raum angezeigt?

## 9. Medien (Bilder und PDF)

1. Verwaltung → **„Medien“** → **Hochladen**. Bilder werden verkleinert; Standort und Kamera-Angaben (EXIF/GPS) werden entfernt. PDF-Dateien bis 10 MB.
2. **Alt-Text** auf Deutsch, Türkisch, Englisch (Pflicht).
3. **Bildrechte** eintragen, zum Beispiel „Foto: [Name], mit Erlaubnis“.
4. Bei Fotos mit Personen „Auf dem Bild sind Personen erkennbar.“ setzen und bestätigen, dass die abgebildeten Personen zugestimmt haben (bei Kindern unter 16 die Eltern). Ohne diese Bestätigung speichert die Plattform das Bild nicht; die Bestätigung wird mit Datum gespeichert.
5. Ein Bild, das **verwendet** wird, kannst du nicht in den Papierkorb legen. Entferne es zuerst aus den Inhalten, in denen es steht.
6. **Papierkorb:** nach 30 Tagen endgültig gelöscht.

**Widerruft jemand die Einwilligung für ein Foto?** Entferne das Foto aus allen Inhalten, lege es in den Papierkorb **und** lösche es endgültig. Sage der Technik Bescheid, damit die Kopie auf dem lokalen Server auch gelöscht wird.

## 10. Checkliste vor dem Veröffentlichen

- ☐ Keine religiösen Texte von mir; Vers/Hadith nur als Verweis.
- ☐ Keine Namen oder Daten von Kindern.
- ☐ Fotos mit Personen: Einwilligung liegt vor.
- ☐ Alt-Text bei jedem Bild.
- ☐ Rechtschreibung geprüft; Türkisch und Englisch, wenn vorhanden, von jemandem gegengelesen.
- ☐ Links geprüft.
- ☐ Auf dem Telefon angesehen (Vorschau).
- ☐ Bei Veranstaltungen: Datum, Uhrzeit und Ort stimmen.

## 11. Wenn etwas nicht klappt

| Problem                             | Was du tust                                                      |
| ----------------------------------- | ---------------------------------------------------------------- |
| Speichern geht nicht, rote Hinweise | Lies die Hinweise an den Feldern und korrigiere                  |
| Du siehst einen Menüpunkt nicht     | Deine Rolle erlaubt es nicht; frage die Administration           |
| Seite ist nicht öffentlich          | Status prüfen: Entwurf? Zeitplan in der Zukunft? Freigabe offen? |
| Etwas ist weg                       | Papierkorb oder „Verlauf“ (Revisionen) ansehen                   |
| Passwort oder Zwei-Faktor           | Administration bittet, es zurückzusetzen                         |

**Kontakte:** Administration [Name, Telefon] · Technik [Name, Telefon] · Imam/Hoca für religiöse Freigaben [Name].
