# S24 · Seite nicht gefunden, Fehlerseite, Offline-Seite

S24 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt „Seite nicht gefunden, Fehlerseite, Offline-Seite“ · Schwierigkeit 1

Lesehinweis: Fundstellen sind Datei:Zeile, relativ zu „/Users/umurey/Downloads/IGMG Wetzlar Website Design/“. „abgeleitet“ markiert Herleitung aus Leerzuständen, Seitenkopf und Grundsätzen. „neu, Pruefung noetig“ markiert Text oder Element ohne Quelle. Für diese Seiten gibt es kein Artboard.

## SEITE

Drei Varianten einer gemeinsamen Hülle: Seite nicht gefunden, Fehlerseite und Offline-Seite. Abgeleitet aus den Leerzuständen (Events:37–44, News:37–44), dem Seitenkopf (Events:20) und den Grundsätzen (readme:11–25).

## ROUTE

- not-found: unbekannte Adressen. Je Sprache eine Fassung: Deutsch ohne Präfix, /tr und /en mit Präfix (K-02).
- error: Fehlerzustand der Seite ohne eigenen Pfad. Die Dateikonvention von Next.js ist zu prüfen (neu, Pruefung noetig).
- /offline: Offline-Seite (K-15). Der Pfad steht nicht in K-03 (siehe OFFENE FRAGEN 4).

## QUELLEN

Kürzel: Dialoge = 08 Dialoge und Zustaende.dc.html · Events = Events.dc.html · News = News.dc.html · Laufbuch = 00 Laufbuch.dc.html · readme = readme.md · App.tsx = uploads/igmg-wetzlar-website/src/app/App.tsx (identische Kopie: uploads/IGMG_Wetzlar_Website_Code/src/app/App.tsx). K-02, K-03, K-11, K-15, G-04, G-05, G-06 = Kern-Auszug des Auftrags, Abschnitt 5. Gelesen: alle fünf Design-Dateien und App.tsx vollständig.

## ZWECK

Besucher, die eine fehlende Adresse aufrufen, auf eine Störung stoßen oder offline sind, finden verständlich zurück zur Startseite oder können es erneut versuchen. Die Offline-Seite hält die Gebetszeiten des laufenden Monats verfügbar (K-15). Zweck abgeleitet aus K-15; Wortlaut neu, Pruefung noetig.

## ABSCHNITTE

Aufbau von oben nach unten. Die Hülle gilt für alle drei Varianten.

1. Wurzel: lang je Sprache, Hintergrund #FCFAF6, Text 18 px mit Zeilenhöhe 1,6, Schrift Atkinson Hyperlegible Next, Überschriften Source Serif 4 (Events:11–15; readme:19; K-11).
2. Header: dc-import, sticky. active und current für Fehlerseiten nicht festgelegt (Events:16; Laufbuch:148).
3. PrayerTimesBar: dc-import ohne Inhaltseigenschaften, nur Platzhaltermaß (Events:17; Laufbuch:149). Ausnahme nur die Gebetszeiten-Seite (Laufbuch:281).
4. Breadcrumbs: label „Seite nicht gefunden“ (neu, Pruefung noetig), Pfad „Startseite“ (Events:18; Laufbuch:150, 197).
5. main#main-content: Breite max. 1344 px, Innenabstand in cqi-Einheiten (Events:19–21). Abweichung siehe AUFFAELLIGKEITEN 5.
6. Seitenkopf (PageHeader, abgeleitet aus Events:20): nur der Titel als h1. Eyebrow „Moschee“ und Untertitel entfallen. Stilwerte stehen in PageHeader.dc.html, das nicht in den Quellen liegt.
7. Statusblock (abgeleitet aus Events:37–42): role=status, zentriert, Abstand 12 px, Innenabstand 64 px oben und unten sowie 24 px seitlich, weißer Hintergrund, 1 px gestrichelter Rand #8C857C, Radius 12 px. Icon-Kreis 64 px mit Hintergrund #F3F0E9 und Icon 32 px in #514C46. Überschrift h2 in Source Serif 4, Gewicht 600, 30 px. Text in #514C46, max. 52ch. Schaltfläche min. 48 px hoch, Rand 2 px #047857, Schrift 700 in #065F46, Hover-Hintergrund #EBF9F2 (Events:38–42).
8. Footer: dc-import ohne Inhaltseigenschaften, nur Platzhaltermaß (Events:47). Schnellzugriff laut Laufbuch:151 und D-07 (Laufbuch:188).

Inhalt je Variante (Schlüssel aus der Tabelle): Seitenkopf-Titel, dann Statusblock mit h2, Text und Schaltflächen.

- 404: 404.titel · 404.h2 · 404.text · btn.startseite
- Fehler: 500.titel · 500.h2 · 500.text · btn.erneut · btn.startseite
- Offline: offline.titel · offline.h2 · offline.text · btn.erneut. Dazu die Gebetszeiten des Monats (Design fehlt, siehe OFFENE FRAGEN 6).

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| nav.startseite | Startseite | Ana Sayfa | Home | Laufbuch:197 |
| muster.leer (nicht übernommen) | Keine Veranstaltungen gefunden | – (nur DE in Quelle) | – (nur DE in Quelle) | Events:40 |
| muster.leer.text (nicht übernommen) | Versuchen Sie es mit anderen Suchkriterien oder schauen Sie später wieder vorbei. | – (nur DE in Quelle) | – (nur DE in Quelle) | Events:41; News:41 |
| muster.leer.alle (nicht übernommen) | Alle | – (nur DE in Quelle) | – (nur DE in Quelle) | Events:42 |
| 404.titel | Seite nicht gefunden | – (nur DE in Quelle) | – (nur DE in Quelle) | neu, Pruefung noetig |
| 404.h2 | Diese Seite gibt es nicht. | – (nur DE in Quelle) | – (nur DE in Quelle) | neu, Pruefung noetig |
| 404.text | Die Adresse ist möglicherweise falsch geschrieben oder die Seite wurde verschoben. Nutzen Sie die Navigation oben oder gehen Sie zur Startseite. | – (nur DE in Quelle) | – (nur DE in Quelle) | neu, Pruefung noetig |
| 500.titel | Ein Fehler ist aufgetreten | – (nur DE in Quelle) | – (nur DE in Quelle) | neu, Pruefung noetig |
| 500.h2 | Die Seite kann gerade nicht angezeigt werden. | – (nur DE in Quelle) | – (nur DE in Quelle) | neu, Pruefung noetig |
| 500.text | Bitte versuchen Sie es in einigen Minuten erneut. Wenn der Fehler bleibt, erreichen Sie die Gemeinde unter [Telefonnummer]. | – (nur DE in Quelle) | – (nur DE in Quelle) | neu; Platzhalter nach G-05, Laufbuch:255 |
| btn.startseite | Zur Startseite | – (nur DE in Quelle) | – (nur DE in Quelle) | neu, Pruefung noetig |
| btn.erneut | Erneut versuchen | – (nur DE in Quelle) | – (nur DE in Quelle) | neu, Pruefung noetig |
| offline.titel | Sie sind offline | – (nur DE in Quelle) | – (nur DE in Quelle) | neu, K-15 |
| offline.h2 | Die Verbindung zum Internet fehlt. | – (nur DE in Quelle) | – (nur DE in Quelle) | neu, Pruefung noetig |
| offline.text | Die Gebetszeiten des laufenden Monats sind auch ohne Verbindung verfügbar. | – (nur DE in Quelle) | – (nur DE in Quelle) | neu, K-15 |

## DATEN

Die Fehlerseiten haben keine Datenbankinhalte. Alle Texte liegen in messages/de.json, tr.json und en.json (K-02). Religiöse Texte gibt es hier nicht (G-06). Vorschlag für die Offline-Seite (K-15), Tabelle gebetszeiten:

- datum: date, mehrsprachig nein. Anzeige wie „Sa., 2. Aug.“ (readme:12).
- gebet: Schlüssel als Enum, mehrsprachig nein. Anzeigename aus messages, Beispiel „Aufgang“ (Laufbuch:203).
- zeit: time HH:mm, mehrsprachig nein.
- berechnung: Text, mehrsprachig nein. Quelle und Methode sind festzulegen (Laufbuch:232).
- bestaetigt: boolean, mehrsprachig nein. Ohne Bestätigung der Gemeinde nicht als offiziell zeigen (G-06). Laufbuch:240 nennt nur drei Beispielsätze.

Fehlerprotokolle enthalten keine Personendaten (G-04).

## FORMULARFELDER

– (entfaellt, Grund: keine Eingabefelder. Suche und Formulare sind auf diesen Seiten nicht vorgesehen, abgeleitet. Fehlermeldungen über aria-describedby entfallen, K-11)

## INTERAKTIONEN

- Breadcrumb „Startseite“ und btn.startseite führen zur Route home (App.tsx:99; Laufbuch:150). Die Schaltfläche ist neu, Pruefung noetig.
- btn.erneut lädt die Seite neu. Die Bindung an die Fehlergrenze ist offen (OFFENE FRAGEN 8).
- Header-Menü und Footer-Schnellzugriff wie auf allen Seiten (Laufbuch:151, 185, 188).
- Hover: Hintergrund #EBF9F2 (Events:42). Fokus: 2 px #0E3929 mit 2 px Abstand (Events:13; readme:21).
- Bewegung 150 ms. Bei „Bewegung reduzieren“ ohne Animation (readme:24; K-11).
- Fokus beim Laden auf main oder h1. Der Bestand setzt tabIndex -1 auf main (App.tsx:181–182). Pruefung noetig.
- Die Restzeit der Gebetsleiste wird nicht dauerhaft vorgelesen (K-11; Laufbuch:149).

## ZUSTAENDE

- Vorlage Leerzustand, data-prop state: Optionen liste und leer, Standard liste (Events:50; News:50). Erzwungen über forcedEmpty (Events:65–66; News:66).
- Header-Eigenschaften nur als Liste im Laufbuch: lang de/tr/en, active, current, loggedIn, open mit den Werten none, moschee, islam, organisationen, bildung, lang, login, account, admin, mobile. Standard nicht genannt (Laufbuch:148; Komponentenblatt Header).
- Neue Eigenschaft (Vorschlag, neu, Pruefung noetig): variant mit den Optionen not-found, error und offline, Standard not-found.
- Bestand: unbekannte Route zeigt die Startseite (App.tsx:99–100). Titel-Fallback „IGMG Wetzlar“ (App.tsx:142). Gebetsleiste nur auf der Gebetszeiten-Seite ausgeblendet (App.tsx:111).
- Hinweisdialog beim ersten Besuch (App.tsx:41–46, 193–196).
- Formularfehler (state=fehler, Dialoge:51) gehören zu den Formularblättern, nicht hierher.

## BILDER

Keine Fotos und keine Bildflächen (readme:22; hier entfallen). Einziges Bildelement ist der Icon-Kreis (Events:39, abgeleitet). Icon-Namen neu, Pruefung noetig. Vorschläge: search-x (404), triangle-alert (Fehler), wifi-off (offline). Das Logo ist nur als 40 × 40 px vorhanden (Laufbuch:231). Es wird nicht nachgezeichnet (K-15).

## AUFFAELLIGKEITEN

1. Der Bestand kennt keine Fehlerseite: unbekannte Routen zeigen die Startseite (App.tsx:99–100). App.tsx enthält keine Texte und keine Logik für 404, Fehler oder Offline.
2. Der Quellpfad im Auftrag (src/app/components/App.tsx) existiert nicht. Gelesen wurde src/app/App.tsx, identisch mit der Kopie unter IGMG_Wetzlar_Website_Code.
3. Der Hinweisdialog erscheint laut Design nur auf der Startseite (Dialoge:22). Laut Code erscheint er beim ersten Besuch auf jeder Route (App.tsx:41–46).
4. Der Plan enthält keine Zeile für Fehler- oder Offline-Seite (Laufbuch:146–179). Z-01 zählt 23 Seiten (Laufbuch:213).
5. Die Schwellen widersprechen sich: Menü-Button unter 1200 px (readme:25) gegen unter 1240 px (Laufbuch:185). Maximalbreite 1280 px (readme:25) gegen 1344 px (Events:21).
6. Breadcrumbs werden in App.tsx:174 unbedingt gerendert. D-16 nennt nur Startseite und Styleguide als Ausnahmen (Laufbuch:281).

## OFFENE FRAGEN

1. Braucht die Fehlerseite einen Seitenkopf im PageHeader-Stil? PageHeader.dc.html liegt nicht in den Quellen.
2. Welche Lucide-Namen sind in Icon.dc.html gebündelt? Icon.dc.html liegt nicht in den Quellen.
3. Welche active- und current-Werte gelten für Header und Footer auf Fehlerseiten? Header.dc.html und Footer.dc.html fehlen in den Quellen.
4. Ist /offline mit K-03 vereinbar, oder gibt es einen deutschen Pfad?
5. Wer liefert die tr- und en-Fassungen der neuen Texte (MENSCHEN.md)?
6. Welche Gebetszeiten zeigt die Offline-Seite, und wer bestätigt die Quelle (G-06)? PrayerTimes.dc.html liegt nicht in den Quellen.
7. Wie erkennt der Code unbekannte Adressen? App.tsx steuert über currentRoute (App.tsx:54). RouteContext.tsx und LanguageContext.tsx liegen nicht in den Quellen (Laufbuch:35).
8. Setzt „Erneut versuchen“ die Fehlergrenze zurück, und wer bindet sie an?
9. Welche Ansage gilt auf Fehlerseiten statt „Seite gewechselt zu“ (App.tsx:146)?
10. Wird die Gebetsleiste auf der Offline-Seite angezeigt, und wie bleibt ihre Restzeit ohne Daueransage (K-11)?

=== ENDE S24 · BEREIT ZUR RÜCKGABE ===
