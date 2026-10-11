# Seitenblatt S13: Quran und Surenansicht

S13 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt „Quran und Surenansicht“ · Schwierigkeit 1

## SEITE

Artboard Quran.dc.html, Screen-Label „05.1 Quran“ (Quran.dc.html:16). Plan-Zeile 05.1, Code Quran.tsx, Z-01, Z-05, Z-06 (00 Laufbuch.dc.html:165).

## ROUTE

- /quran: Einstieg, Sura 1 als Standard (Quran.dc.html:91).
- /quran/[sure]: Surenansicht, im Design 1 bis 5 (Quran.dc.html:84). K-03 nennt beide Pfade.
- Surwechsel ohne URL-Wechsel (Quran.dc.html:94, :96; Quran.tsx:180).
- tr- und en-Pfade: – (K-03 nennt nur Deutsch; offen).

## QUELLEN

- Design, vollständig: Quran.dc.html (Template 9–83, Script 84–107).
- Bestand, vollständig: uploads/igmg-wetzlar-website/src/app/components/Quran.tsx (1–313).
- Hilfen: readme.md (14–29); 00 Laufbuch.dc.html (165, 182–193, 217–218, 278–281, 286, 293, 308).
- Nicht gelesen, da nicht in der Quellenliste: LanguageContext.tsx und Komponentenblätter.
- A5 entfällt: keine Personen-, Adress-, Telefon- oder E-Mail-Angaben.

## ZWECK

Koranlesen je Sura: Surenwahl, Titel, Audio-Schalter, Versliste, Blättern. Abgeleitet aus dem Untertitel (Quran.dc.html:21).

## ABSCHNITTE (Aufbau, Komponenten, Texte de/tr/en mit Fundstelle)

Aufbau (Quran.dc.html): Root lang="de" (:16); Header, sticky, active="islam", current="quran" (:17); PrayerTimesBar (:18); Breadcrumbs label="Koran" (:19); PageHeader, eyebrow "Islam", title "Quran" (:21); zwei Spalten (:22): nav#suren mit Suchfeld und fünf Surentiteln (:23–31); article mit Kopfkarte (:34–43), bei Sura 1 Basmala (:45–50) und sieben Versen (:51–66), sonst Platzhalter (:69–71), Blätternav (:73–77); Footer (:81).

Komponenten: Header, PrayerTimesBar, Breadcrumbs, PageHeader, Footer und Icon nur als dc-import. Schaltflächen und Felder inline, Stilrezepte aus 02 Komponenten.

Surentitel sind Namen, keine Verstexte. Religiöse Texte stehen nicht in der Tabelle (A6).

| Schlüssel-Vorschlag | de | tr | en | Fundstelle |
| --- | --- | --- | --- | --- |
| quran.breadcrumb | Koran | – (nur DE in Quelle) | – (nur DE in Quelle) | Quran.dc.html:19 |
| quran.eyebrow | Islam | – (nur DE in Quelle) | – (nur DE in Quelle) | Quran.dc.html:21 |
| quran.title | Quran | Kuran | Quran | Quran.dc.html:21; Quran.tsx:19, :44, :69 |
| quran.subtitle | Lesen Sie den heiligen Quran mit Übersetzung und Tafsir | Kutsal Kuran'ı meal ve tefsir ile okuyun | Read the Holy Quran with translation and Tafsir | Quran.dc.html:21; Quran.tsx:20, :45, :70 |
| quran.list | Suren-Liste | Sure Listesi | Surah List | Quran.dc.html:24; Quran.tsx:21, :46, :71 |
| quran.search.label | Suche (verborgen) | – (nur DE in Quelle) | – (nur DE in Quelle) | Quran.dc.html:25 |
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
| quran.religious | Arabische Verse, Basmala und Übersetzungen: nicht abgeschrieben (A6) | nicht abgeschrieben (A6) | nicht abgeschrieben (A6) | Quran.dc.html:48–49, :62–63, :86–87; Quran.tsx:34, :59, :84, :99–135, :235, :238 |
| quran.favorite | Zu Favoriten hinzufügen (aria-label) | Favorilere ekle | Add to favorites | Quran.dc.html:57; Quran.tsx:26, :51, :76 |
| quran.share | Vers teilen (aria-label) | Ayeti paylaş | Share verse | Quran.dc.html:58; Quran.tsx:27, :52, :77 |
| quran.translation | Übersetzung | Meal | Translation | Quran.dc.html:63; Quran.tsx:29, :54, :79 |
| quran.placeholder | [Koranvers – Text von der Gemeinde] | – (nur DE in Quelle) | – (nur DE in Quelle) | Quran.dc.html:70; readme.md:14 |
| quran.nav.prev | ← Vorherige Sura | ← Önceki Sure | ← Previous Surah | Quran.dc.html:74; Quran.tsx:293 |
| quran.pager | Ziffern 1, 2, 3, …, 114 | gleich wie de | gleich wie de | Quran.dc.html:75, Script :97; Quran.tsx:296–300 |
| quran.nav.next | Nächste Sura → | Sonraki Sure → | Next Surah → | Quran.dc.html:76; Quran.tsx:303 |

## DATEN (was aus der Datenbank kommt)

Vorschlag, abgeleitet (A7). Datenbanksystem nicht festgelegt; UI-Texte bleiben in messages/{de,tr,en}.json (K-02).

- sure: nummer (Ganzzahl, 1 bis 114; mehrsprachig nein), titel (Text; mehrsprachig ja: de Pflicht, tr und en mit Rückfall auf de), hat_text (Wahrheitswert; nein).
- vers: sure_nummer und versnummer (Ganzzahlen; nein), arabisch (Text, rtl; nein; nur mit Quelle nach G-06), uebersetzung (Text; ja: de nur bei geklärter Lizenz, sonst Platzhalter), quelle (Text; nein; Pflicht).
- audio: sure_nummer (Ganzzahl; nein), datei (Verweis; nein; Lizenz offen).
- Nicht aus der Datenbank: Surwahl, Audio-Zustand, Favoriten, Teilen.

## FORMULARFELDER

Ein Suchfeld: id q-search, Typ search, Platzhalter „Suchen Sie in Suren oder Versen...“, verborgenes Label „Suche“ (Quran.dc.html:25–26). Keine Prüfregeln, kein Absenden. Eingabe wird getrimmt und kleingeschrieben (Script :93). Bestand ohne Label (Quran.tsx:164–169).

## INTERAKTIONEN

1. Suche: filtert nach Name oder exakter Nummer (Script :93–94); Bestand ohne Wirkung (Quran.tsx:173).
2. Sura wählen: setzt Sura und stoppt Audio (Script :94); Bestand stoppt nicht (Quran.tsx:180).
3. Audio-Schalter: wechselt den Zustand (Script :102); keine Audioquelle (Quran.tsx:211).
4. Vorherige oder Nächste: Nummer ±1, begrenzt auf 1 bis 5 (Script :96, :103); Bestand ohne Handler (Quran.tsx:292, :302).
5. Seitenzahlen 1 bis 3 wie Punkt 2; „…“ und „114“ ohne Wirkung (Script :97); Bestand ohne Handler (Quran.tsx:296–300).
6. Download, Einstellungen, Favorit, Teilen, Vers-Audio: ohne Handler (Quran.dc.html:39, :40, :57–59; Quran.tsx:220, :224, :260–268).
7. Statuszeile mit role="status" (Quran.dc.html:42); Fokus sichtbar (:14).

## ZUSTAENDE

Eigenschaften (data-props, Quran.dc.html:84): sura mit Auswahl 1, 2, 3, 4, 5, Standard „1“, TS-Typ string; playing mit Standard false, TS-Typ boolean. Interner Zustand (Script :89): sura, playing, query.

- Sura 1 mit Text: Basmala, sieben Verse, Zählzeile „7 Vers“ (Script :95, :100–101).
- Sura 2 bis 5 ohne Text: Platzhalter mit Surentitel, Zählzeile „– Vers“ (Quran.dc.html:69–71; Script :100).
- Audio gestoppt: „Audio abspielen“, Icon play. Läuft: „Audio pausieren“, Icon pause, Statuszeile (:38, :42; Script :102).
- Suche leer, mit Treffern, ohne Treffer: alle Suren, gefilterte Liste, leere Liste ohne Text (Script :94; Lücke).
- Ausgewählte Sura: Hintergrund #EBF9F2, Rand #047857; aktive Seitenzahl: Hintergrund #047857 (Script :94, :97).
- Hover: #EBF9F2, Audio-Schalter #065F46 (:38–40, :57–59, :74, :76). Fokus: 2 px #0E3929 (:14).
- Deaktiviert: nicht gestaltet; Vorherige bei Sura 1 und Nächste bei Sura 5 wirken nicht (Script :96).
- Leer, Fehler, Erfolg, Schritt, angemeldet, Lade- und Audiofehler: – (entfällt, nicht im Design).
- Sprache: Design de fest (:16); Bestand de, tr, en über useLanguage (Quran.tsx:12, :95).
- Bestand zusätzlich: Standard „1“ (:13), Suche ohne Wirkung (:14), Audio läuft nach Surwechsel weiter (:15, :180), Versliste immer Al-Fatiha (:98–107, :204, :244).

## BILDER

Keine Fotos. Icons (Icon.dc.html, Lucide, Strich 2 px, readme.md:28): book-open (Quran.dc.html:24, :70), search (:26), play und pause (:38; Script :102), download (:39), settings (:40), volume-2 (:42, :59), heart (:57), share-2 (:58). Amiri nur für arabische Inhalte, rtl (:48, :62; readme.md:14).

## AUFFAELLIGKEITEN

Das Design gilt für Gestalt und Text, der Bestand für fehlende Sprachfassungen.

1. Arabischer Text ohne Quelle und Lizenz; der Bestand nennt ihn „Beispiel-Korantext“ (Quran.tsx:97; Quran.dc.html:86). G-06 verlangt beides.
2. Übersetzungen de, tr und en ohne Quelle (Quran.dc.html:87; Quran.tsx:110–135; 00 Laufbuch.dc.html:286).
3. Bestand zeigt bei Sura 2 bis 5 die Al-Fatiha-Verse (Quran.tsx:201, :204, :244); Design zeigt Platzhalter (Quran.dc.html:69–71).
4. Basmala bei Sura 1 doppelt, als Blockkopf und Vers 1 (Quran.dc.html:48, :86; Quran.tsx:235, :99). Bestand zeigt den Block bei jeder Sura (Quran.tsx:233–240).
5. Suche: Design filtert Suren (Script :94), Bestand nicht (Quran.tsx:173). Der Platzhalter nennt Verse; umgesetzt ist das in keinem (Quran.dc.html:26).
6. Untertitel nennt Tafsir (Quran.dc.html:21; Quran.tsx:20); der Schlüssel tafsir (Quran.tsx:30) wird nicht gerendert.
7. „114“ und „…“ ohne Wirkung bei nur fünf Suren (Script :85, :97); Bestand schreibt „...“ (Quran.tsx:299).
8. Zählzeile „7 Vers“ statt „7 Verse“ (Quran.dc.html:36; Quran.tsx:33, :204).
9. Breadcrumb „Koran“ gegen Titel „Quran“ (Quran.dc.html:19, :21; 00 Laufbuch.dc.html:165).
10. Statuszeile sagt „Audio abspielen“, während das Audio läuft (Quran.dc.html:42).
11. Bestand: Versschaltflächen ohne Namen (Quran.tsx:259–269); Design mit aria-labels (Quran.dc.html:57–59).
12. Plan 05.1 nennt nur „… PageHeader“ (00 Laufbuch.dc.html:165); das Design bindet mehr ein (Quran.dc.html:17–21, :81).

## OFFENE FRAGEN

1. Quelle, Lizenz und Quellenangabe für Arabisch und Übersetzungen klären, sonst bleibt es nach G-06 beim Platzhalter?
2. Quelle, Lizenz und Dateien der Rezitation klären, oder bleibt der Schalter ohne Audio?
3. Umfang: Suren 1 bis 5 oder alle 114?
4. Wird der Surwechsel zur Route /quran/[sure], und wie lauten die tr- und en-Pfade?
5. Gibt es einen Tafsir-Bereich mit Quelle und Lizenz, oder wird der Untertitel geändert?
6. Wie wird die Basmala gezählt: als Blockkopf, als Vers 1 oder beides?
7. Lautet der Breadcrumb „Koran“ oder „Quran“?
8. Welcher Text steht bei Suche ohne Treffer, und welche Sprachfassungen fehlen (neu markieren, MENSCHEN.md)?
9. Sucht die Suche auch Verse, wie der Platzhalter sagt?
10. Wie lauten Einzahl und Mehrzahl von „Vers“ in drei Sprachen, und was zeigt Sura 2 bis 5?
11. Gehören Download, Einstellungen, Favorit, Teilen und Vers-Audio zur Übergabe?
12. Welche Elternseite hat der Breadcrumb-Pfad?
13. Ist ein Lade- oder Fehlerzustand für Audio nötig?
14. Enthält LanguageContext.tsx tr- und en-Fassungen für „Islam“ und „Koran“? Das ist ungeprüft.

=== ENDE S13 · BEREIT ZUR RÜCKGABE ===
