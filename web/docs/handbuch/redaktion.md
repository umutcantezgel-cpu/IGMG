# Handbuch für die Redaktion

Für alle, die auf der Website der Gemeinde Nachrichten, Seiten, Menüs und die Anzeige im Gebetsraum pflegen. Du brauchst kein Technikwissen. Die Schritte sind kurz.

**Stand:** 15.10.2026, Abschnitt 12 vom 28.10.2026. **Nachrichten, Veranstaltungen, Ankündigungen, Medien, Seiten mit Bausteinen, Menüs, Startseite, Islamisches Wissen, Weiterleitungen, Freigaben und Anzeige-Folien** gibt es in der Verwaltung; dieses Handbuch beschreibt die Bildschirme so, wie sie sind. Bildschirmfotos folgen (Marke **[Bildschirmfoto folgt]**).

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

**Benachrichtigung bei Ankündigungen:** Ist Web Push in der Gemeinde eingeschaltet, geht beim **ersten Veröffentlichen** einer Ankündigung ein Hinweis **ohne Inhalt** („Neue Ankündigung der Moschee“) an alle, die Ankündigungen abonniert haben. Hat die Ankündigung einen späteren Beginn („Sichtbar ab“), geht der Hinweis erst dann hinaus, und zwar ein bis zwei Minuten danach: Zuerst wird die Nachrichtenseite aufgefrischt, damit die Ankündigung dort schon steht, wenn jemand den Hinweis antippt. Dafür muss der Takt des lokalen Servers laufen. Auslösen können **Redaktion** und **Administration**; die Organisationsredaktion veröffentlicht ohne Hinweis. Erneutes Veröffentlichen derselben Ankündigung innerhalb von drei Tagen sendet nicht noch einmal.

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

## 5. Menüs, Startseite und Islamisches Wissen

- **Menüs:** Verwaltung → **„Menüs“**. Wähle das Menü: **Hauptmenü (Kopf)** aus Gruppen (höchstens 6 Gruppen mit je 12 Einträgen) oder **Schnellzugriff (Fuß)** (höchstens 12 Einträge). „Gruppe hinzufügen“, „Eintrag hinzufügen“; die Reihenfolge änderst du mit „Nach oben“ und „Nach unten“. Jeder Eintrag zeigt auf eine Seite der Website. [Bildschirmfoto folgt] Gibt es kein Menü in der Datenbank, nutzt die Website das feste Standardmenü.
- **Startseite:** Verwaltung → **„Startseite“**. [Bildschirmfoto folgt] Oben steht immer der **Kopf mit dem Tagesbogen**; er lässt sich nicht verschieben. Darunter legst du die Reihenfolge der Abschnitte fest: **Unsere neue Moschee**, **Veranstaltungen**, **Neuigkeiten**, **Aus dem Dachverband** (Freitagspredigt und Aktionen der IGMG, siehe 12.3) und **Vers und Hadith des Tages** (dieser erscheint nur, wenn die religiöse Prüfung Einträge freigegeben hat). In einer schon gespeicherten Reihenfolge steht „Aus dem Dachverband“ zuerst ganz unten; verschiebe ihn bei Bedarf.
  1. Verschiebe einen Abschnitt mit **„Nach oben“** und **„Nach unten“** (geht auch mit der Tastatur: Tab bis zum Knopf, dann Enter; der Bildschirmleser sagt die neue Stelle an).
  2. Nimm den Haken bei **„Anzeigen“** weg, wenn ein Abschnitt vorübergehend nicht erscheinen soll.
  3. Tippe auf **„Reihenfolge speichern“**. Die Startseite zeigt die neue Reihenfolge sofort, in allen Sprachen.
  4. **Frühere Fassungen:** Die letzten zehn Fassungen stehen darunter; mit „Zurückholen“ gilt eine wieder. **„Standardreihenfolge wiederherstellen“** entfernt deine Reihenfolge; dann gilt wieder die Standardreihenfolge (alle Abschnitte wie oben genannt). Dieselbe Standardreihenfolge gilt, solange die Website ohne Datenbank läuft.

  Was **in** den Abschnitten steht, steuerst du über die Inhalte selbst: Bei den Nachrichten macht „Empfohlen“ einen Beitrag bis zu 30 Tage nach der Veröffentlichung zum Aufmacher (sonst steht der neueste oben); dazu kommen die nächsten Veranstaltungen und die Seiteninhalte.

- **Islamisches Wissen:** Verwaltung → **„Islamisches Wissen“**. [Bildschirmfoto folgt] Hier stehen die Themen der Seite „Islamisches Wissen“ mit dem Stand der religiösen Prüfung, ob sie öffentlich sind, und dem Übersetzungsstand (zum Beispiel „TR 1 von 3“).
  1. **„Neues Thema“**: Adresse (Kurzname, zum Beispiel „testthema“; lässt sich später nicht ändern), Titel, Kurztext und Einführung, unter „Übersetzungen“ Türkisch und Englisch.
  2. **Religiöse Texte schreibst du nicht** (siehe 1). Ein Thema wird erst öffentlich, wenn die religiöse Prüfung es freigegeben hat: „Speichern und zur Prüfung geben“ legt es dem Imam oder der Hoca vor (siehe 7).
  3. **Jede Änderung** an Titel, Kurztext oder Einführung eines geprüften Themas geht zurück in die Prüfung; bis zur Freigabe ist das Thema **nicht öffentlich**.
  4. **„Auf der Website zeigen, sobald es geprüft ist“**: ohne Haken bleibt ein Thema verborgen, auch wenn es geprüft ist (keine Prüfung nötig).
  5. **Reihenfolge:** Ansicht „Reihenfolge“, „Nach oben“ und „Nach unten“, dann „Reihenfolge speichern“. Das ist keine inhaltliche Änderung.
  6. **Frühere Fassungen** beim Thema; **Papierkorb** (30 Tage), endgültig löschen nur aus dem Papierkorb und nach einer Rückfrage.
  7. Themen mit dem Vermerk **„Bestand, nicht einzeln geprüft“** stammen von der bisherigen Website und bleiben öffentlich, bis jemand sie ändert.

## 6. Weiterleitungen

Wenn sich die Adresse einer Seite ändert, leite die **alte Adresse** auf die neue um. So laufen alte Links und Lesezeichen weiter.

1. Verwaltung → **„Weiterleitungen“** → **„Neue Weiterleitung“**. [Bildschirmfoto folgt]
2. **Alte Adresse** eintragen (zum Beispiel `/alte-seite`).
3. **Neue Adresse** eintragen (eine Adresse dieser Website, zum Beispiel `/gebetszeiten`).
4. „Weiterleitung speichern“. Sie gilt ab sofort. Öffne die alte Adresse selbst und prüfe, dass sie ankommt.

Keine Schleifen: Leitet die neue Adresse wieder zurück, lehnt die Plattform die Weiterleitung ab.

## 7. Freigaben

Es gibt **zwei Arten** der Freigabe:

| Art              | Wofür                                                                                                                                                                                                                                                | Wer gibt frei                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Redaktionell** | freie Seiten, die zur Prüfung gegeben wurden (Nachrichten, Veranstaltungen und Ankündigungen haben keinen Prüfschritt)                                                                                                                               | eine zweite Person, die Seiten veröffentlichen darf [Wer? – Vorstand] |
| **Religiös**     | Wortbedeutungen, Tajwid-Texte, Hadith-Übersetzungen, besondere Tage, Vers- und Hadith-Listen, Folien mit Vers oder Hadith, Seiten mit Vers- oder Hadith-Bausteinen, Themen unter „Islamisches Wissen“; Elifbe-Lektionen, wenn sie zur Prüfung stehen | **nur** die Rolle „religiöse Prüfung“ (Imam, Hoca)                    |

Der Weg: **Entwurf → zur Prüfung → geprüft**. Eine Änderung an einem geprüften Eintrag setzt die Freigabe zurück. **Öffentlich** ist nur, was **geprüft** ist. Für **Elifbe-Lektionen** gibt es in der Verwaltung keine Bearbeitung. In der Warteschlange „Freigaben“ gibt eine **zweite Person** frei: Wer einen Inhalt verfasst oder zuletzt geändert hat, kann ihn dort nicht selbst freigeben (Vier-Augen-Prinzip).

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

## 12. Inhalte vom Dachverband (Marktstart IGMG, Stand 28.10.2026)

Seit Oktober 2026 nutzt die Website Inhalte der Islamischen Gemeinschaft Millî Görüş (IGMG): Zahlen und Kontakt auf `/igmg`, Freitagspredigten und Aktionen, die Seite „Hadsch & Umra“, die Gebetszeiten aus dem IGMG-Gebetskalender und vier Erklärtexte als Entwurf. Die IGMG hat zugestimmt (ADR 0046); der schriftliche Nachweis folgt (MENSCHEN M-099).

### 12.1 Schreibregeln (Suche, Antwortmaschinen, KI-Suche)

Diese Regeln gelten für jeden neuen Text auf der Website, in allen drei Sprachen.

1. **Selbst formulieren.** Nie acht oder mehr Wörter am Stück von igmg.org, igmgreisen.com oder einer anderen Seite übernehmen. Erlaubt sind nur Eigennamen, Titel (etwa der Titel einer Freitagspredigt) und gekennzeichnete Zitate. Sonst gilt der Text als Doppel-Inhalt und schadet in der Suche.
2. **Die Antwort zuerst.** Der erste Satz beantwortet die Frage, Einzelheiten folgen. Zwischenüberschriften dürfen Fragen sein, so wie Menschen suchen: „Wann muss ich mich für Hadsch 2027 anmelden?“
3. **Namen beim ersten Nennen ganz ausschreiben:** „Islamische Gemeinschaft Millî Görüş (IGMG)“, danach „IGMG“. Die Gemeinde heißt als Marke „IGMG Wetzlar“, die Moschee „Fatih-Moschee Wetzlar“ (TR „Wetzlar Fatih Camii“, EN „Fatih Mosque Wetzlar“), immer mit „Wetzlar“.
4. **Ortsbezug:** Wetzlar, Lahn-Dill-Kreis, Mittelhessen, Hessen – wo es passt, nicht in jedem Satz.
5. **Quelle und Stand zeigen.** Zahlen und Termine vom Dachverband stehen nur mit Quelle und Datum („Angaben nach …, Stand …“). Zahlen der IGMG stehen nur auf `/igmg`, nie neben Zahlen der Gemeinde.
6. **Nur Belegtes.** Was kein Beleg trägt, bleibt Platzhalter in eckigen Klammern. Keine Personennamen und keine Telefonnummern aus den Seiten der IGMG (G-04); Ansprechpersonen nur mit deren Einverständnis.
7. **Keine Politik:** keine Pressemitteilungen und keine politischen Themen aus dem Dachverband.
8. **Titel und Beschreibung für die Suche:** Titel höchstens 60 Zeichen, Beschreibung 120 bis 155 Zeichen, mit dem Suchbegriff vorn (etwa „Gebetszeiten Wetzlar“, „Wetzlar namaz vakitleri“, „Umra Anmeldung Hessen“). Die Überschrift auf der Seite darf anders lauten als der Titel.
9. **Datiert statt „aktuell“:** „Freitagspredigt vom 23. Oktober 2026“, nie „Predigt der Woche“. So bleibt jede Aussage richtig, auch wenn die Seite einmal älter ist.
10. **Religiöses wie bisher (siehe 1):** keine Verse, Hadithe, Bittgebete, Übersetzungen und keine arabische Schrift. Versangaben nur, wenn die verlinkte IGMG-Seite sie selbst nennt.

### 12.2 Glossar Deutsch, Türkisch, Englisch

So schreiben wir die Begriffe überall gleich. Wer eine neue Übersetzung braucht, nimmt sie von hier. Abweichungen bitte an die Technik melden (MENSCHEN M-102).

| Deutsch                                           | Türkisch                                 | Englisch                                        | Hinweis                                                         |
| ------------------------------------------------- | ---------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| Islamische Gemeinschaft Millî Görüş (IGMG)        | İslam Toplumu Millî Görüş (IGMG)         | Islamic Community Millî Görüş (IGMG)            | beim ersten Nennen ganz                                         |
| IGMG Wetzlar                                      | IGMG Wetzlar                             | IGMG Wetzlar                                    | Marke der Gemeinde                                              |
| Fatih-Moschee Wetzlar                             | Wetzlar Fatih Camii                      | Fatih Mosque Wetzlar                            | Name der Moschee, immer mit „Wetzlar“                           |
| Moscheegemeinde                                   | cami cemiyeti                            | mosque community                                |                                                                 |
| Region Hessen (Regionalverband)                   | Hessen bölgesi                           | Hesse region                                    | Zugehörigkeit belegt 2008, Bestätigung M-103                    |
| Zweigstelle                                       | şube                                     | branch                                          |                                                                 |
| Schura                                            | Şura                                     | Shura                                           | oberstes Organ der IGMG                                         |
| Vorstand (der IGMG)                               | Yönetim Kurulu                           | Board of Directors                              |                                                                 |
| Präsidium                                         | Başkanlık Divanı                         | Presidium                                       |                                                                 |
| Erweiterter Vorstand                              | Merkez Yürütme Kurulu                    | Central Executive Committee                     |                                                                 |
| Kuratorium                                        | Mütevelli Heyeti                         | Board of Trustees                               |                                                                 |
| Wahlrat                                           | Seçim Kurulu                             | Electoral Council                               |                                                                 |
| Gelehrtenrat                                      | **Din İstişare Kurulu**                  | Religious Advisory Council                      | TR wie in der Broschüre der IGMG; EN noch uneinheitlich (M-102) |
| Prüfungsausschuss                                 | Denetim Kurulu                           | Audit Committee                                 |                                                                 |
| Frauenorganisation (KT)                           | Kadınlar Teşkilatı                       | women’s organisation                            |                                                                 |
| Jugendorganisation (GT)                           | Gençlik Teşkilatı                        | youth organisation                              |                                                                 |
| Frauenjugendorganisation (KGT)                    | Kadınlar Gençlik Teşkilatı               | young women’s organisation                      |                                                                 |
| Ana Teşkilatı (AT)                                | Ana Teşkilatı                            | [englischer Name offen]                         | M-105                                                           |
| Freitagspredigt (Hutba)                           | cuma hutbesi                             | Friday sermon                                   |                                                                 |
| Aktion                                            | kampanya                                 | campaign                                        | Art im Abschnitt „Aus dem Dachverband“                          |
| Hadsch, Umra                                      | hac, umre                                | Hajj, Umrah                                     | Seite: „Hadsch & Umra“, „Hac ve Umre“, „Hajj & Umrah“           |
| IGMG Reisen                                       | IGMG Hac ve Umre                         | IGMG Reisen                                     | Reiseveranstalter der IGMG (igmgreisen.com)                     |
| Zakat, Fitra, Kurban                              | zekât, fitre, kurban                     | zakat, fitra, qurban                            | über Hasene; die Gemeinde sammelt das nicht                     |
| Hasene                                            | Hasene                                   | Hasene                                          | Hilfsorganisation, Eigenname                                    |
| Fördermitglied der IGMG                           | IGMG destekçi üyeliği                    | supporting member of IGMG                       | Mitgliedschaft im Dachverband, nicht in der Gemeinde            |
| IGMG-Gebetskalender                               | IGMG namaz takvimi                       | IGMG prayer calendar                            | offizielle Quelle der Gebetszeiten                              |
| berechnet (vorläufig)                             | hesaplanmış (geçici)                     | calculated (provisional)                        | Gebetszeiten ohne IGMG-Tabelle                                  |
| Ramadan-Begleiter                                 | Ramazan Yoldaşım                         | Ramadan companion                               | Eigenname der IGMG-Broschüre; Schreibweise noch uneinheitlich   |
| Umra-Begleiter                                    | Umre Yoldaşım                            | Umrah companion                                 | Eigenname der IGMG-Broschüre                                    |
| Entwurf zur Prüfung – noch nicht vom Imam geprüft | İnceleme taslağı – imam henüz incelemedi | Draft for review – not yet reviewed by the imam | Marke der Erklärtexte (12.6)                                    |

### 12.3 Aus dem Dachverband und Freitagspredigten pflegen

Verwaltung → **„Seiteninhalte“** → **„Aus dem Dachverband“**. Die Einträge erscheinen auf der Startseite (Abschnitt „Aus dem Dachverband“), auf `/nachrichten`, auf `/islamisches-wissen` (die neueste Predigt) und auf den Seiten der Organisationen (nach Art).

1. **Freitagspredigten kommen von selbst.** Die Website holt sie jeden Morgen aus dem Feed der IGMG. Mit **„Jetzt aus dem Feed holen“** geht es sofort (höchstens einmal in fünf Minuten).
2. **Nur Titel, Datum und Link.** Eine Predigt hat keinen Kurztext, keine Versangaben und keine Anführungszeichen; die Verwaltung lehnt das ab. Der Text der Predigt steht nur bei der IGMG.
3. **Ausblenden statt löschen.** Soll eine Predigt oder Aktion nicht erscheinen, nimm den Haken bei **„sichtbar“** weg. Eine gelöschte Predigt holt der nächste Abgleich wieder zurück.
4. **„Freitagspredigt eintragen“**, falls der Feed einmal ausfällt: Datum ist der Freitag (JJJJ-MM-TT), Titel wie bei der IGMG, Link auf igmg.org. Türkisch und Englisch nur, wenn es eine eigene Fassung gibt.
5. **Aktionen und Bildungsangebote** (Tag der offenen Moschee, Ramadan-Begleiter, Qalam …) legst du selbst an: Art wählen, Titel, ein Kurztext in eigenen Worten (zwei bis drei Sätze), Link. Mit **„Anzeigen bis“** verschwindet ein Eintrag von selbst.
6. **Was nicht hineingehört:** Pressemitteilungen und politische Themen. Wer unsicher ist, fragt den Vorstand (die Liste der erlaubten Themen bestätigt der Vorstand, MENSCHEN).
7. Höchstens 60 Einträge; ältere Predigten aus dem Feed fallen dann weg.

### 12.4 Hadsch & Umra pflegen

Verwaltung → **„Seiteninhalte“** → **„Hadsch & Umra“**. Die Angaben stammen von IGMG Reisen; verbindlich ist immer IGMG Reisen.

1. **Jedes Jahr nach der Ausschreibung** (Hadsch meist im Herbst): Hinweise mit Frist, Reiseprogramme (nur als Link, **ohne Preise**), Abflüge ab Frankfurt mit Gruppe, Flughafen-Kürzel und Daten, dazu **Stand** und Quelle.
2. **Hinweise mit „Anzeigen bis“** und vergangene Abflüge blendet die Website von selbst aus. Die Seite erneuert sich stündlich.
3. **Ansprechperson:** Name und Telefon nur mit Einverständnis der Person. Keine Telefonnummern der Regionalstellen; dafür steht der Link auf IGMG Reisen.
4. **Unterlagen:** nur aktuelle Formulare und Ratgeber verlinken, mit Sprache und Ausgabe.
5. **Videos:** nur von IGMG Reisen; die elfstellige ID oder die kopierte YouTube-Adresse eintragen. Videos laden erst nach einem Klick. Bevor weitere Videos dazukommen, muss die Datenschutzerklärung geprüft sein (MENSCHEN M-111).
6. **Fragen und Antworten:** nur Organisatorisches (Anmeldung, Fristen, Abflug, Unterlagen). Religiöse Erklärungen stehen im Wissensthema „Hadsch und Umra“ (12.6).

### 12.5 Gebetszeiten aus dem IGMG-Gebetskalender übernehmen

Der IGMG-Gebetskalender ist die offizielle Quelle (Wetzlar, Stadt-ID 20238). Solange es keinen automatischen Abgleich gibt, überträgst du einen Monat von Hand:

1. Verwaltung → **„Gebetszeiten“** → **„Tabelle aus dem IGMG-Gebetskalender einfügen“**.
2. **„IGMG-Gebetskalender für Wetzlar öffnen“**, Jahr und Monat wählen.
3. Die Tabelle mit der Maus markieren – vom Ortsnamen „Wetzlar (DE)“ bis zur letzten Zeile – und kopieren. Kopf und Ortsname dürfen mit.
4. Ins Feld **„Kopierte Tabelle“** einfügen und **„Tabelle prüfen“** wählen. Die Verwaltung erkennt die Spalten İmsak, Güneş, Öğle, İkindi, Akşam, Yatsı und prüft, ob die Tabelle zu Wetzlar gehört.
5. Die ersten Tage mit der Seite der IGMG vergleichen, dann übernehmen. Öffentlich steht danach „Quelle: IGMG-Gebetskalender, Stand …“.
6. **Vor dem Ende des Monats** den nächsten Monat übertragen; das Startklar-Cockpit warnt, wenn weniger als 30 der nächsten Tage aus einer Tabelle stammen. Tage ohne IGMG-Tabelle zeigt die Website als „berechnet (vorläufig)“.
7. Läuft später der **automatische Abgleich**, überschreibt er deine Tabelle nie. Weicht der IGMG-Kalender ab, zeigt die Verwaltung die Tage unter „Abweichungen zum Import der Gemeinde“; dort übernimmst du die IGMG-Werte oder entfernst den Import.

### 12.6 Erklärtexte als „Entwurf zur Prüfung“ und ihre Freigabe

Vier Themen unter „Islamisches Wissen“ – Hadsch und Umra, Islamischer Kalender, Zakat, Fitra und Kurban, Freitagsgebet – hat eine KI aus Quellen der IGMG geschrieben (ADR 0047). Sie stehen schon öffentlich, aber sichtbar als **„Entwurf zur Prüfung – noch nicht vom Imam geprüft“**.

1. **Die Redaktion ändert diese Texte nicht inhaltlich.** Fehler meldest du dem Imam oder der Hoca.
2. **Freigabe:** Verwaltung → **„Freigaben“**. Die religiöse Prüfung gibt einen Text frei; dann verschwindet die Kennzeichnung. **„Zurückweisen“** nimmt den Text sofort von der Website.
3. **Alle Entwürfe auf einmal verbergen** kann die Technik mit dem Schalter `website_wissen_vorschau` (Verwaltung › Einstellungen › Funktionen oder `FUNKTION_WEBSITE_WISSEN_VORSCHAU=aus`). Ob die Vorschau beim öffentlichen Start an bleibt, entscheidet der Vorstand.
4. Beträge (Fitra, Fidya) nennen die Texte bewusst nicht; die gibt die IGMG jedes Jahr bekannt.
