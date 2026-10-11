# Seitenblatt S13: Quran und Surenansicht

S13 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt „Quran und Surenansicht“ · Schwierigkeit 1

## SEITE

Quran und Surenansicht. Artboard Quran.dc.html, Screen-Label „05.1 Quran“ (Quran.dc.html:16). Plan-Zeile 05.1, Code Quran.tsx, Z-01, Z-05, Z-06 (00 Laufbuch.dc.html:165). Das Design ist fest auf Deutsch (lang="de", Quran.dc.html:16); tr und en kommen nur aus dem Bestand.

## ROUTE

- /quran: Einstieg; Sura 1 ist Standard (Quran.dc.html:91).
- /quran/[sure]: Surenansicht; das Design kennt [sure] von 1 bis 5 (Quran.dc.html:84). Beide Pfade nennt K-03 (Kern-Auszug).
- Eingang über Header, Untermenü Islam (00 Laufbuch.dc.html:308).
- Surwechsel im Design und im Bestand ohne URL-Wechsel, nur über Zustand (Quran.dc.html:94, :96; Quran.tsx:180).
- tr- und en-Pfade: – (K-03 nennt nur Deutsch; offen).

## QUELLEN

- Design, vollständig gelesen: Quran.dc.html, Template Zeilen 9–83, Script Zeilen 84–107.
- Bestand, vollständig gelesen: uploads/igmg-wetzlar-website/src/app/components/Quran.tsx, Zeilen 1–313.
- Hilfen: readme.md (Zeilen 14–29); 00 Laufbuch.dc.html (Zeilen 165, 182–193, 217–218, 278–281, 286, 293, 308).
- Nicht gelesen, da nicht in der Quellenliste: LanguageContext.tsx sowie die Komponentenblätter Header, PrayerTimesBar, Breadcrumbs, PageHeader, Footer und Icon.
- A5 entfällt: in dieser Seite stehen keine Personennamen, Adressen, Telefonnummern oder E-Mail-Adressen.

## ZWECK

Koranlesen je Sura: Suren wählen, Titel und Zählzeile, Audio-Schalter, Versliste mit arabischem Text und Übersetzung, Blättern. Abgeleitet aus dem Untertitel „Lesen Sie den heiligen Quran mit Übersetzung und Tafsir“ (Quran.dc.html:21).

## ABSCHNITTE (Aufbau, Komponenten, Texte de/tr/en mit Fundstelle)

Aufbau in Reihenfolge (Quran.dc.html):
1. Root, lang="de", 18 px, Zeilenhöhe 1,6 (:16).
2. Header, sticky, active="islam", current="quran" (:17). Komponentenblatt.
3. PrayerTimesBar (:18) und Breadcrumbs, label="Koran" (:19). Komponentenblätter.
4. main mit Container-Einheiten; PageHeader, eyebrow "Islam", title "Quran" (:20–21).
5. Zweispaltig mit Umbruch (:22). Links nav#suren: Überschrift, Suchfeld, fünf Surentitel (:23–31). Rechts article: Kopfkarte (:34–43); bei Sura 1 Basmala-Block (:45–50) und sieben Verse mit Nummern 1 bis 7 (:51–66); sonst Platzhalter (:69–71); Blätternav (:73–77).
6. Footer (:81). Komponentenblatt.

Der Bestand nutzt ein Raster lg:grid-cols-4 (Quran.tsx:153); für die Gestalt gilt das Design.

Komponenten: Header, PrayerTimesBar, Breadcrumbs, PageHeader, Footer und Icon nur als dc-import genannt. Schaltflächen und Felder sind inline gestaltet, Stilrezepte aus 02 Komponenten (Quran.dc.html:26, :38–40, :57–59, :74–76).

Surentitel sind Namen und keine Verstexte, deshalb stehen sie in der Tabelle. Religiöse Texte stehen nicht in der Tabelle (A6).

| Schlüssel-Vorschlag | de | tr | en | Fundstelle |
| --- | --- | --- | --- | --- |
| quran.breadcrumb | Koran | – (nur DE in Quelle) | – (nur DE in Quelle) | Quran.dc.html:19 |
| quran.eyebrow | Islam | – (nur DE in Quelle) | – (nur DE in Quelle) | Quran.dc.html:21 |
| quran.title | Quran | Kuran | Quran | Quran.dc.html:21; Quran.tsx:19, :44, :69 |
| quran.subtitle | Lesen Sie den heiligen Quran mit Übersetzung und Tafsir | Kutsal Kuran'ı meal ve tefsir ile okuyun | Read the Holy Quran with translation and Tafsir | Quran.dc.html:21; Quran.tsx:20, :45, :70 |
| quran.list | Suren-Liste | Sure Listesi | Surah List | Quran.dc.html:24; Quran.tsx:21, :46, :71 |
| quran.search.label | Suche (visuell verborgen) | – (nur DE in Quelle) | – (nur DE in Quelle) | Quran.dc.html:25 |
| quran.search.placeholder | Suchen Sie in Suren oder Versen... | Surelerde veya ayetlerde arayın... | Search in surahs or verses... | Quran.dc.html:26; Quran.tsx:22, :47, :72 |
| quran.sura.1 | Al-Fatiha (Die Eröffnung) | Fatiha (Açılış) | Al-Fatiha (The Opening) | Quran.dc.html:85; Quran.tsx:36, :61, :86 |
| quran.sura.2 | Al-Baqarah (Die Kuh) | Bakara (İnek) | Al-Baqarah (The Cow) | Quran.dc.html:85; Quran.tsx:37, :62, :87 |
| quran.sura.3 | Al-Imran (Das Haus Imran) | Al-i İmran (İmran Ailesi) | Al-Imran (The Family of Imran) | Quran.dc.html:85; Quran.tsx:38, :63, :88 |
| quran.sura.4 | An-Nisa (Die Frauen) | Nisa (Kadınlar) | An-Nisa (The Women) | Quran.dc.html:85; Quran.tsx:39, :64, :89 |
| quran.sura.5 | Al-Ma'idah (Der Tisch) | Maide (Sofra) | Al-Ma'idah (The Table) | Quran.dc.html:85; Quran.tsx:40, :65, :90 |
| quran.count | Aktuell lesen • {Anzahl} Vers | Şu anda okuyor • {Anzahl} Ayet | Currently reading • {Anzahl} Verse | Quran.dc.html:36; Quran.tsx:32–33, :57–58, :82–83, :204 (tr und en abgeleitet) |
| quran.audio.play | Audio abspielen | Ses çal | Play audio | Quran.dc.html:38, :59, :102; Quran.tsx:23, :48, :73 |
| quran.audio.pause | Audio pausieren | Sesi duraklat | Pause audio | Quran.dc.html:102; Quran.tsx:24, :49, :74 |
| quran.audio.status | {Surentitel} · Audio abspielen | – (nur DE in Quelle) | – (nur DE in Quelle) | Quran.dc.html:42 |
| quran.download | Sura herunterladen | Sureyi indir | Download surah | Quran.dc.html:39; Quran.tsx:25, :50, :75 |
| quran.audio.settings | Audio-Einstellungen | Ses ayarları | Audio settings | Quran.dc.html:40; Quran.tsx:28, :53, :78 |
| quran.basmala.label | Basmala (aria-label) | – (nur DE in Quelle) | – (nur DE in Quelle) | Quran.dc.html:47 |
| quran.religious | Arabische Verse, Basmala und Übersetzungen: nicht abgeschrieben (A6) | nicht abgeschrieben (A6) | nicht abgeschrieben (A6) | Quran.dc.html:48–49, :62–63, :86–87; Quran.tsx:34, :59, :84, :99–135, :235, :238 |
| quran.favorite | Zu Favoriten hinzufügen (aria-label) | Favorilere ekle | Add to favorites | Quran.dc.html:57; Quran.tsx:26, :51, :76 |
| quran.share | Vers teilen (aria-label) | Ayeti paylaş | Share verse | Quran.dc.html:58; Quran.tsx:27, :52, :77 |
| quran.translation | Übersetzung | Meal | Translation | Quran.dc.html:63; Quran.tsx:29, :54, :79 |
| quran.placeholder | [Koranvers – Text von der Gemeinde] | – (nur DE in Quelle) | – (nur DE in Quelle) | Quran.dc.html:70; readme.md:14 |
| quran.nav.label | Suren blättern (aria-label) | – (nur DE in Quelle) | – (nur DE in Quelle) | Quran.dc.html:73 |
| quran.nav.prev | ← Vorherige Sura | ← Önceki Sure | ← Previous Surah | Quran.dc.html:74; Quran.tsx:293 |
| quran.pager | Ziffern 1, 2, 3, …, 114 | gleich wie de | gleich wie de | Quran.dc.html:75, Script :97; Quran.tsx:296–300 |
| quran.nav.next | Nächste Sura → | Sonraki Sure → | Next Surah → | Quran.dc.html:76; Quran.tsx:303 |

## DATEN (was aus der Datenbank kommt)

Vorschlag, abgeleitet (A7). Das Datenbanksystem ist in den Quellen nicht festgelegt. UI-Texte bleiben in messages/{de,tr,en}.json (K-02, Kern-Auszug), nicht in der Datenbank.

- sure: nummer (Ganzzahl, 1 bis 114), titel (Text; mehrsprachig ja: de Pflicht, tr und en optional mit Rückfall auf de), hat_text (Wahrheitswert).
- vers: sure_nummer und versnummer (Ganzzahlen), arabisch (Text, rtl; nicht mehrsprachig; nur mit Quellenangabe nach G-06), uebersetzung (Text; mehrsprachig ja: de nur bei geklärter Lizenz, sonst Platzhalter; tr und en optional mit Rückfall auf de), quelle (Pflicht).
- audio: sure_nummer (Ganzzahl), datei (Verweis; nicht mehrsprachig; Quelle und Lizenz offen), quelle (Pflicht).
- Nicht aus der Datenbank: Surwahl, Audio-Zustand, Favoriten und Teilen (im Design ohne Speicherung).

## FORMULARFELDER

Ein Suchfeld: id q-search, Typ search, Platzhalter „Suchen Sie in Suren oder Versen...“, Label „Suche“ (verborgen), 48 px hoch, Rand #8C857C, Schrift 18 px (Quran.dc.html:25–26). Keine Pflichtfelder, keine Prüfung, kein Absenden. Die Eingabe wird getrimmt und kleingeschrieben (Script :93). Der Bestand hat nur den Platzhalter, kein Label (Quran.tsx:164–169).

## INTERAKTIONEN

1. Suche tippen: filtert Suren nach Name oder exakter Nummer (Script :93–94). Im Bestand ohne Wirkung (Quran.tsx:166–167, :173).
2. Sura wählen: setzt die Sura und stoppt das Audio (Script :94). Der Bestand setzt nur die Sura (Quran.tsx:180).
3. Audio-Schaltfläche: wechselt den Zustand (Script :102). Keine Audioquelle in beiden (Quran.tsx:211).
4. Vorherige oder Nächste Sura: Nummer minus oder plus 1, begrenzt auf 1 bis 5, stoppt das Audio (Script :96, :103). Im Bestand ohne Handler (Quran.tsx:292, :302).
5. Seitenzahlen 1, 2, 3 wie Punkt 2; „…“ und „114“ ohne Wirkung (Script :97). Im Bestand ohne Handler (Quran.tsx:296–300).
6. Download, Audio-Einstellungen, Favorit, Teilen und Vers-Audio: ohne Handler in beiden (Quran.dc.html:39, :40, :57–59; Quran.tsx:220, :224, :260–268).
7. Statuszeile bei laufendem Audio mit role="status" (Quran.dc.html:42). Tastatur: Standardverhalten, Fokus sichtbar (:14).

## ZUSTAENDE

Eigenschaften (data-props, Quran.dc.html:84):
- sura: Auswahl 1, 2, 3, 4, 5; Standard „1“; TS-Typ string.
- playing: Wahrheitswert; Standard false; TS-Typ boolean.

Interner Zustand (Script :89): sura (leer, dann Eigenschaft, dann „1“), playing (leer, dann Eigenschaft), query (leer).

Zustände:
- Sura 1 mit Text: Basmala-Block, sieben Verse, Zählzeile „7 Vers“ (Script :95, :100–101).
- Sura 2 bis 5 ohne Text: Platzhalter mit Surentitel, Zählzeile „– Vers“ (Quran.dc.html:69–71; Script :100).
- Audio gestoppt: „Audio abspielen“, Icon play, aria-pressed false (:38; Script :102).
- Audio läuft: „Audio pausieren“, Icon pause, aria-pressed true, Statuszeile (:38, :42).
- Suche leer, mit Treffern, ohne Treffer: alle Suren, gefilterte Liste, leere Liste ohne Text (Script :94; Lücke).
- Ausgewählte Sura: aria-current, Hintergrund #EBF9F2, Rand 2 px #047857 (Script :94). Aktive Seitenzahl: Hintergrund #047857, Schrift #FFFFFF (Script :97).
- Hover: Hintergrund #EBF9F2; Audio-Schaltfläche #065F46 (:38–40, :57–59, :74, :76). Fokus: 2 px #0E3929 mit 2 px Abstand (:14).
- Deaktiviert: nicht gestaltet; Vorherige bei Sura 1 und Nächste bei Sura 5 wirken nicht (Script :96).
- Leer, Fehler, Erfolg, Schritt, angemeldet: – (entfällt, keine solchen Zustände auf dieser Seite). Lade- und Audiofehler: – (entfällt, nicht im Design).
- Sprache: Design fest de (:16). Bestand de, tr und en über useLanguage (Quran.tsx:12, :95).
- Bestand zusätzlich: selectedSura Standard „1“ (:13), searchQuery ohne Wirkung (:14), isPlaying ohne Rücksetzung beim Surwechsel (:15, :180), Versliste immer Al-Fatiha (:98–107, :204, :244).

## BILDER

Keine Fotos oder Bildflächen. Icons aus Icon.dc.html mit Lucide-Pfaden, Strich 2 px (readme.md:28): book-open (Quran.dc.html:24, :70), search (:26), play und pause dynamisch (:38; Script :102), download (:39), settings (:40), volume-2 (:42, :59), heart (:57), share-2 (:58). Bestand: lucide-react (Quran.tsx:8). Amiri nur für arabische Inhalte, rtl (Quran.dc.html:48, :62; readme.md:14).

## AUFFAELLIGKEITEN

Das Design gilt für Gestalt und Text, der Bestand für fehlende Sprachfassungen.

1. Arabischer Text ohne Quellenangabe und Lizenz; der Bestand nennt ihn „Beispiel-Korantext“ (Quran.tsx:97; Quran.dc.html:86). G-06 verlangt beides.
2. Übersetzungen de, tr und en ohne Quelle (Quran.dc.html:87; Quran.tsx:110–135). Die Liste für Menschen fordert die Quelle (00 Laufbuch.dc.html:286).
3. Der Bestand zeigt bei Sura 2 bis 5 die Verse der Al-Fatiha (Quran.tsx:201, :204, :244); das Design zeigt dort den Platzhalter (Quran.dc.html:69–71).
4. Basmala bei Sura 1 doppelt, als Blockkopf und als Vers 1 (Quran.dc.html:48, :86; Quran.tsx:235, :99). Der Bestand zeigt den Block bei jeder Sura (Quran.tsx:233–240), das Design nur bei Sura 1 (Quran.dc.html:45).
5. Suche: das Design filtert Suren (Script :94), der Bestand nicht (Quran.tsx:173). Der Platzhalter nennt Verse; umgesetzt ist das in keinem der beiden (Quran.dc.html:26; Quran.tsx:22).
6. Der Untertitel nennt Tafsir (Quran.dc.html:21; Quran.tsx:20, :45, :70). Der Schlüssel tafsir (Quran.tsx:30, :55, :80) wird nirgends gerendert.
7. Seitenzahlen „114“ und „…“ ohne Wirkung, die Liste hat nur fünf Suren (Script :85, :97). Der Bestand schreibt „...“ (Quran.tsx:299). Vorherige und Nächste wirken nur im Design (Script :96; Quran.tsx:292, :302).
8. Zählzeile „7 Vers“ statt „7 Verse“ (Quran.dc.html:36; Quran.tsx:33, :204); bei Sura 2 bis 5 „– Vers“ (Script :100).
9. Breadcrumb „Koran“ gegen Titel und Route „Quran“ (Quran.dc.html:19, :21; 00 Laufbuch.dc.html:165).
10. Die Statuszeile sagt „Audio abspielen“, während das Audio läuft (Quran.dc.html:42).
11. Im Bestand haben die drei Versschaltflächen keinen Namen (Quran.tsx:259–269); das Design hat aria-labels (Quran.dc.html:57–59).
12. Surwechsel stoppt das Audio nur im Design (Script :94; Quran.tsx:180).
13. Plan-Zeile 05.1 nennt nur „… PageHeader“ (00 Laufbuch.dc.html:165); das Design bindet zusätzlich Header, PrayerTimesBar, Breadcrumbs, Footer und Icon ein (Quran.dc.html:17–21, :81).

## OFFENE FRAGEN

1. Welche Quelle, Lizenz und Quellenangabe gelten für den arabischen Text und die Übersetzungen, sonst bleibt es nach G-06 beim Platzhalter?
2. Welche Quelle, Lizenz und Dateien hat die Rezitation, oder bleibt der Audio-Schalter ohne Audio?
3. Umfang: nur Suren 1 bis 5 (Script :85) oder alle 114 (Script :97)?
4. Wird der Surwechsel zur Route /quran/[sure], und wie lauten die tr- und en-Pfade?
5. Gibt es einen Tafsir-Bereich mit Quelle und Lizenz, oder wird der Untertitel geändert?
6. Wie wird die Basmala gezählt: als Blockkopf, als Vers 1 oder beides?
7. Schreibweise im Breadcrumb: „Koran“ oder „Quran“?
8. Welcher Text steht bei Suche ohne Treffer, und welche Sprachfassungen fehlen (neue Fassungen markieren, MENSCHEN.md)?
9. Sucht die Suche auch Verse, wie der Platzhalter sagt?
10. Wie lautet die Mehrzahl von „Vers“ in den drei Sprachen, und zeigt Sura 2 bis 5 „– Vers“ oder nichts?
11. Gehören Download, Audio-Einstellungen, Favorit, Teilen und Vers-Audio zur Übergabe?
12. Welche Elternseite hat der Breadcrumb-Pfad, da der Plan keine nennt?
13. Ist ein Lade- oder Fehlerzustand für Audio und Surtexte nötig?
14. Ob LanguageContext.tsx tr- und en-Fassungen für „Islam“ und „Koran“ enthält, ist ungeprüft.

=== ENDE S13 · BEREIT ZUR RÜCKGABE ===
