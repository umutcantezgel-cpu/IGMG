# Sichtabnahme Z-04: Zusammenfassung

Ausgewertet wurden drei unabhängige Juroren, 19 Ansichten und 189 Einzelbefunde. Nach dem Zusammenführen bleiben 58 bestätigte Befunde (51 gelten für eine Ansicht, 7 ziehen sich durch mehrere) und 34 nicht bestätigte. Dateipfade sind relativ zu `/home/user/IGMG/web/src` angegeben, wenn nichts anderes dasteht.

## 1. Noten (Median der drei Juroren)

Eine Ansicht ist abgenommen, wenn der Median für „gesamt“ mindestens 8 beträgt und keine Kategorie im Median unter 7 liegt.

| Ansicht | Hier. | Typo | Farbe | Raster | Form | Mobil | Zugängl. | **Gesamt** | Abgenommen |
|---|---|---|---|---|---|---|---|---|---|
| surenansicht | 8 | 8 | 8 | 8 | 9 | 7 | 8 | **8** | ja |
| surenansicht-wortkarte | 8 | 8 | 8 | 8 | 8 | 7 | 7 | **8** | ja |
| surenansicht-tajwid-leiste | 8 | 8 | 7 | 8 | 8 | 8 | 7 | **7,5** | **nein** |
| koran-uebersicht | 8 | 8 | 8 | 8 | 9 | 7 | 8 | **8** | ja |
| hadith-buch | 7 | 8 | 8 | 7 | 8 | 7 | 8 | **7** | **nein** |
| elifbe-buchstabe | 8 | 7 | 8 | 7 | 8 | 8 | 8 | **7** | **nein** |
| lernen-hub | 8 | 8 | 8 | 8 | 9 | 8 | 8 | **8** | ja |
| gebetszeiten-mein-ort | 8 | 8 | 8 | 7 | 8 | 7 | 8 | **7,5** | **nein** |
| projekte-fertiggestellt | 8 | 7 | 8 | 7 | 8 | 7 | 8 | **7,5** | **nein** |
| startseite | 7 | 8 | 8 | 8 | 9 | 7 | 8 | **8** | ja |
| schueler-start | 8 | 8 | 8 | 8 | 9 | 7 | 7 | **8** | ja |
| eltern-kind | 7 | 7 | 8 | 7 | 8 | 7 | 7 | **7** | **nein** |
| anwesenheit | 8 | 8 | 7 | 8 | 8 | 7 | 7 | **7,5** | **nein** |
| gruppenchat | 7 | 8 | 8 | 8 | 8 | 7 | 7 | **8** | ja |
| seiten-editor | 8 | 8 | 8 | 8 | **6** | **6** | 8 | **7** | **nein** |
| seiten-liste | 8 | 8 | 8 | 8 | 8 | 8* | 8 | **8** | ja |
| seiten-editor-bestand | 8 | 8 | 8 | 8 | 8 | 8* | 8 | **8** | ja |
| verwaltung-anzeige | 8 | 8 | 8 | 7 | 8 | 8* | 7 | **8** | ja |
| verwaltung-uebersicht | 8 | 8 | 8 | 8 | 8 | 8* | 8 | **8** | ja |

\* Die Note „Mobil“ ist hier nur vorläufig: Von diesen Ansichten gibt es nur eine Aufnahme bei 1440 px (siehe X-7).

**Ergebnis:** 11 Ansichten sind abgenommen, 8 nicht. Nicht abgenommen sind tajwid-leiste, hadith-buch, elifbe-buchstabe, gebetszeiten-mein-ort, projekte-fertiggestellt, eltern-kind, anwesenheit und seiten-editor. Nur seiten-editor hat Kategorien unter 7 (Formensprache 6, Mobil 6).

## 2. Bestätigte Befunde

Ein Befund gilt als bestätigt, wenn ihn mindestens zwei Juroren nennen. Ein Befund mit Schwere „hoch“ braucht nur einen Juror, muss aber im Bild belegt sein. Es gab keinen Einzelbefund mit „hoch“. Beide „hoch“-Befunde habe ich trotzdem im Bild nachgesehen:
- **T-1** ist belegt: Das markierte Alif ist nur ganz schwach grau hinterlegt (`scratchpad/sicht/bilder/surenansicht-tajwid-leiste-1440-oben.png`). Ursache ist `.beispiel-wort .regel-markiert { background-color: color-mix(currentColor 14%) }` in `components/website/quran/quran.css` Z. 310. Auf grauer Glyphe ergibt das etwa 1,2:1.
- **SE-1** ist belegt: Das Bild zeigt eine Moschee mit Kuppel und zwei Minaretten. **Die Ursache sind aber die Testdaten der Abnahme, nicht der Produktcode.** `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/sicht/skripte/vw-medium.mjs` zeichnet das SVG und lädt es samt Alt-Text in die Mediathek hoch. `vw-editor.mjs` trägt die Unterschrift „Der Gebetsraum am Morgen“ ein.

### Befunde, die mehrere Ansichten betreffen

| ID | Befund | Ansichten | Juroren | Schwere | Paket |
|---|---|---|---|---|---|
| X-1 | Der Kopf zeigt „Anmelden“, obwohl jemand angemeldet ist | schueler-start, eltern-kind, anwesenheit, gruppenchat | 3 | mittel | 3 |
| X-2 | Die Bereichsleiste von Mein Bereich ist auf 390 abgeschnitten, ohne Hinweis aufs Scrollen | schueler-start, eltern-kind, gruppenchat, anwesenheit | 3 | mittel | 3 |
| X-3 | Die Seitenleiste der Verwaltung ist unten halb abgeschnitten, ohne Verlauf | seiten-liste, -bestand, verwaltung-anzeige, -uebersicht | 2 | mittel | 4 |
| X-4 | Klappzeilen haben keinen Chevron und wirken wie Überschriften oder leere Karten | seiten-editor, -bestand, verwaltung-anzeige, eltern-kind („Wortlaut“) | 3 | mittel | 4 (+3) |
| X-5 | Adressen und Pfade brechen mitten im Wort um | seiten-editor, eltern-kind | 3 | mittel | 4, 3 |
| X-6 | Die durchgestrichene Null liest sich wie „Ø“ | verwaltung-uebersicht (J3 zusätzlich in 5 Website-Ansichten) | 3 | mittel | 4 |
| X-7 | Von der Verwaltung gibt es nur Aufnahmen bei 1440, „Mobil“ ist nicht beurteilbar | seiten-liste, -bestand, -anzeige, -uebersicht | 3 | niedrig | 4 (Verfahren) |

### Befunde je Ansicht (Anzahl Juroren in Klammern)

- **surenansicht:**
  - S-1: Vers 1 ist auf 390 nicht im ersten Bildschirm zu sehen, die Lizenzzeile steht im Kopf (2, mittel).
  - S-2: Das Muster „Nicht gesprochen“ ist nicht von Madd zu unterscheiden bzw. wirkt wie ein Fleck (2, niedrig).
- **surenansicht-wortkarte:**
  - W-1: Der Knopf „Hamzat al-Wasl“ ist grau und unterstrichen und wirkt deaktiviert (3).
  - W-2: Das Blatt auf 390 hat keine Griffleiste und keinen Scrim, anders als B-15 (2).
  - W-3: Das Blatt auf 390 verdeckt das angetippte Wort (2).
  - W-4: Die Karte auf 1440 verdeckt Verse, obwohl rechts etwa 380 px frei sind (3).
- **surenansicht-tajwid-leiste:**
  - T-1: Die Markierung im Beispiel ist kaum sichtbar (3, hoch, im Bild belegt).
  - T-2: Zwischen Erklärung und „Alle Tajwid-Regeln“ liegen etwa 430 px Leere (2).
  - T-3: Der Link „Familie: Nicht gesprochen“ wirkt deaktiviert (2).
  - T-4: Der Scrim ist schwach bzw. neutral grau, es fehlt eine Griffleiste (2).
- **koran-uebersicht:**
  - K-1: Die Nummern 100–114 sprengen das Medaillon (2).
  - K-2: Der Platzhalter im Suchfeld ist abgeschnitten (2).
  - K-3: „Alle Suren“ und die Suche kommen auf 390 sehr spät, die Seite ist lang und hat keine Sprungmarken (3).
  - K-4: Cüz-Ring und Zahlenraster bieten dieselbe Auswahl doppelt, und der Ring taugt nicht als Tippziel (3).
- **hadith-buch:**
  - H-1: Die Seitenspalte auf 1440 steht nur oben (2). Das ist **vermutlich ein Artefakt der Ganzseitenaufnahme**: `components/website/hadith/BuchAnsicht.tsx` Z. 81 hat bereits `lg:sticky lg:top-8`.
  - H-2: Umfang und Buchnavigation stehen auf 390 erst nach etwa 32.000 px, es gibt kein „Nach oben“ (2).
  - H-3: Auf 390 steht der Achtstern über dem Rücklink (3).
  - H-4: Der H1 ist der englische Titel „Belief“ (2).
- **elifbe-buchstabe:**
  - E-1: Die „Vier Formen“ sind zu klein und ohne Tatweel (3). Ursache: Z. 161 nutzt `text-display-1` statt einer arabischen Stufe.
  - E-2: Das Raster „Leicht zu verwechseln“ hat eine Lücke, und die Be-Karte ist höher als die anderen (3). Ursache: Z. 207 setzt `dir="rtl"` mit `md:grid-cols-6` bei 5 Karten.
  - E-3: Bei „Nächster Buchstabe“ steht der Pfeil auf 390 links (2). Ursache: Z. 291 `sm:flex-row-reverse`.
- **lernen-hub:**
  - L-1: Der Hifz-Platzhalter ist klein und grau, die Fußzeile der Karte ist uneinheitlich (3).
- **gebetszeiten-mein-ort:**
  - G-1: Die Reiterleiste bricht auf 390 in drei Zeilen um (3).
  - G-2: Der Qibla-Kompass wirkt generisch, ohne Achtstern (2).
  - G-3: Kopf und Zellen der Tabelle sind nicht bündig (2).
  - G-4: „Vollbild“ steht auf 390 verwaist am Seitenende (3).
- **projekte-fertiggestellt:**
  - PR-1: „[von der Gemeinde]“ läuft in den Kennzahlkacheln über (3).
  - PR-2: Die Meilensteinzeilen sind uneinheitlich und unruhig (2).
- **startseite:**
  - ST-1: Eine Meldung vom Juli 2025 mit „Wichtig“ ist Aufmacher statt der neuesten (2).
  - ST-2: Auf 390 trennt die Tageskarte den Titel von Einleitung und Knöpfen (3).
  - ST-3: Die Beschriftungen des Tagesbogens stehen in zwei versetzten Reihen (3).
  - ST-4: Die Jetzt-Marke steht nach Isha links und hat kein Label (3).
- **eltern-kind:**
  - EK-1: Das Datumsfeld zeigt das US-Format (3).
  - EK-2: Karten werden gestreckt, es entstehen 150–250 px Leerfläche (3).
  - EK-3: „Passwort vorschlagen“ bricht im Knopf zweizeilig um (2).
  - EK-4: Etwa 7.600 px Seite ohne Sprungmarken (2).
  - EK-5: Status doppelt („sicher“), „erteilt“ steht eingerückt in eigener Zeile (2).
- **anwesenheit:**
  - A-1: Der gewählte Status „Entschuldigt“ hebt sich kaum ab (3).
  - A-2: Die Statusknöpfe haben kein festes Raster (390 ungleich breit, 1440 versetzt) (3).
- **gruppenchat:**
  - GC-1: Der geschlossene Zustand ist schwach erkennbar, das Feld wirkt aktiv (3).
  - GC-2: „Melden“ ist zu laut gesetzt (2).
- **seiten-editor:**
  - SE-1: Moschee-Illustration mit Kuppel (3, hoch, Testdaten).
  - SE-2: Die Werkzeugleiste belegt auf 390 7–10 Zeilen (3).
  - SE-3: Die Speicherleiste ist zu hoch und verdeckt Felder (3).
- **seiten-liste:**
  - SL-1: Zeilenaktionen sind nur Symbole, der Papierkorb ist uneinheitlich ausgezeichnet (3).
- **seiten-editor-bestand:**
  - SB-1: Alle Bausteine sind aufgeklappt, etwa 7.400 px (2).
  - SB-2: Drei Spalten stehen als 2+1 mit leerer Zelle (2).
- **verwaltung-anzeige:**
  - VA-1: Die Beschreibungen der Art-Karten beginnen auf verschiedenen Höhen (3).
  - VA-2: „Löschen“ ist nur ein Symbol direkt neben dem Hauptknopf (2).
  - VA-3: Der Zeitplan hängt am Satzende (2).
- **verwaltung-uebersicht:**
  - VU-1: Die Organisationskürzel sind nur farbig kodiert und nicht erklärt (3).

### Nicht bestätigt (je 1 Juror, 34 Befunde)

- **surenansicht:** Arabisch am Desktop größer setzen (J1); Tajwid-Schalter zeigt den Zustand nur über Farbe (J2); „Rezitation folgt“ wirkt bedienbar (J2).
- **wortkarte:** Ortsangabe doppelt (J3).
- **koran-uebersicht:** Leerzustand „Weiterlesen“ (J1).
- **elifbe-buchstabe:** Grundlinie der Lesezeichen-Karten (J1); Grundlinie im Schreibweg nur 1,4:1 (J2); „Aufnahme folgt“ sieht wie ein Knopf aus (J2); keine Glyphe im Kopf (J3); Pillenknöpfe (J3).
- **lernen-hub:** Kartenreihe eingerückt (J1); Brotkrume „Bildung“ grau (J2); Stationstexte ungleich lang (J3).
- **gebetszeiten:** „−1 Min.“ geht unter (J1).
- **projekte:** Plaketten „Abgeschlossen“ redundant (J1); Plakette im Bild (J1); Unterstützen-Block in Mint (J3).
- **startseite:** Fastenbogen-Link ohne Bezug (J1); Zeiten doppelt (J3).
- **schueler-start:** „Station“ und „Stufe“ uneinheitlich (J1); Chat-Knopf primär, obwohl der Chat geschlossen ist (J2); Station 3 vierzeilig (J3).
- **eltern-kind:** „Abmelden“ doppelt belegt (J3).
- **anwesenheit:** Speicherleiste fixieren (J1); „Später“ und „verspätet“ uneinheitlich (J2).
- **gruppenchat:** Senden-Kontrast und fremde Blasen (J2); Überschrift doppelt (J2).
- **seiten-editor:** Bausteinsteuerung nur als Symbole (J2).
- **seiten-liste:** Name im Kontomenü abgeschnitten (J3).
- **bestand:** Seitenaktionen an zwei Orten (J1); Werkzeugleiste im Ruhezustand gestrichelt (J3).
- **anzeige:** Vorschau ohne Markenelement (J3); Aktionsspalte versetzt (J1).
- **uebersicht:** Kacheln ohne Pfeil (J1).

Zwei davon betreffen die Barrierefreiheit und liegen ohnehin in Dateien von Paket 1. Ich empfehle, sie dort mitzunehmen: den Tajwid-Schalter (WCAG 1.4.1) und die Schreibweg-Grundlinie (1.4.11).

## 3. Befundpakete

Die Pakete teilen sich keine Dateien, mit drei Ausnahmen, die jeweils genau einem Paket gehören:
- `app/globals.css` gehört **nur Paket 1**, und dort nur der Block „Tajwid-Familien“ (Z. 828–865).
- `components/website/Header.tsx` gehört **nur Paket 3**.
- `Seitenrahmen.tsx` und `PrayerTimesBar.tsx` gehören **nur Paket 1**.

In `messages/{de,en,tr}.json` bearbeitet Paket 2 nur den Abschnitt `start` und Paket 3 nur den Abschnitt `kopf`. Das sind getrennte Hunks.

### Paket 1: Koran, Hadith, Elifbe, Lernen
**Ansichten:** surenansicht, -wortkarte, -tajwid-leiste, koran-uebersicht, hadith-buch, elifbe-buchstabe, lernen-hub

**Dateien:**
- `components/website/quran/{QuranLeser,SurenKopf,Quellenzeile,Wortkarte,TajwidLeiste,Medaillon,CuzRing,SurenSuche,SurenRaster}.tsx` und `quran.css`
- `app/[locale]/(website)/quran/page.tsx` und `quran/[sure]/page.tsx`
- `components/website/{PrayerTimesBar,Seitenrahmen}.tsx`
- `components/website/hadith/{BuchAnsicht,BuchBlaettern,BuchStern}.tsx`
- `app/[locale]/(website)/elifbe/buchstaben/[buchstabe]/BuchstabenAnsicht.tsx`
- `app/[locale]/(website)/lernen/page.tsx`
- `app/globals.css` (nur `.tj-stumm`)
- `web/messages/bereiche/{quran,hadith,elifbe,lernen}.json`

**Änderungen:**
1. **S-1:** `Seitenrahmen` bekommt eine Prop `kompakteLeiste`, die auf `/quran/[n]` an `PrayerTimesBar` geht (eine Zeile: „Nächstes Gebet · Zeit“). Die Lizenz- und Quellenzeile wandert aus `SurenKopf` in den Quellenblock unter den Versen. Die Kopfabstände sinken oben und unten um je 24 px.
2. **S-2:** `.tj-stumm` bekommt ein eigenes Muster. Alle fünf `text-decoration-style` sind schon vergeben, und Madd wie Stumm sind beide `solid`, sie unterscheiden sich nur in der Dicke. Vorschlag: ein kurzer, mittiger 1-px-Strich oder Punkt per `background-image` unter der Glyphe, mit mindestens 3:1 gegen Papier.
3. **W-1, T-3:** In `Wortkarte.tsx` (Z. 192) und `TajwidLeiste.tsx` liegt die Klasse `tj tj-…` nicht mehr auf dem Knopf- bzw. Linktext. Das Muster steht als eigenes Swatch davor. Der Text wird Akzentgrün ohne Unterstreichung, der Knopf bekommt einen Chevron.
4. **T-1:** `.beispiel-wort .regel-markiert` in `quran.css` Z. 310 bekommt einen 2-px-Rahmen bzw. Ring in Familien- oder Akzentfarbe mit mindestens 3:1 und dazu das Familienmuster. Dazu kommt eine Textzeile „markiert: …“.
5. **W-2, T-4:** Beide Blätter (`.wortkarte` als Popover und `dialog.regel-leiste`) bekommen eine gleiche Griffleiste von 32×4 px und den gleichen Scrim aus Markengrün mit etwa 40 %.
6. **W-3:** Beim Öffnen auf 390 wird das Wort per `scrollIntoView` mit `scroll-margin-bottom` gleich Blatthöhe über das Blatt geholt. Das Blatt ist höchstens 60 % hoch.
7. **W-4:** Auf 1440 dockt die Karte im freien rechten Rand neben der 672-px-Spalte an, mit Pfeil zum Wort. Über den Text legt sie sich nur bei Platzmangel.
8. **T-2:** „Alle Tajwid-Regeln“ steht 24 px unter der Erklärung, oder es gibt eine Fußzone mit 2-px-Trennlinie.
9. **K-1:** In `Medaillon.tsx` wird bei `nr ≥ 100` die Ziffernstufe um eine Stufe kleiner, oder der Kasten wächst um 4 px.
10. **K-2:** `suchePlatzhalter` wird zu „Name oder Nr., z. B. 36“. Das Beispiel steht als Hilfetext unter dem Feld.
11. **K-3, K-4:** In `quran/page.tsx` steht unter `md` das Suchfeld bzw. der Sprung zu „Alle Suren“ oben. `CuzRing` ist auf 390 nur Schmuck (`aria-hidden`, klein neben der Überschrift), das 6×5-Raster bleibt die einzige Auswahl. `SurenRaster` zeigt auf 390 kompakte Zeilen von etwa 56 px. Dazu ein Knopf „Nach oben“.
12. **H-1:** Kein Umbau. Nachprüfen mit einer Viewport-Aufnahme nach einem Scroll (z. B. auf y = 5000). Wenn `sticky` greift, ist der Befund erledigt.
13. **H-2:** Unter dem Kopf steht eine kompakte Leiste „51 Hadithe · 8–58 · Nächstes Buch →“, dazu ein schwebender Knopf „Nach oben“.
14. **H-3, H-4:** Im Kopf kommt zuerst der Rücklink, dann die Kennung, dann Achtstern und Titel in einer Zeile. Das Label „Buchtitel der Quelle (Englisch)“ steht über dem H1. Am gemeinsamen Seitenkopf (`PageHeader.tsx`/`Seitenkopf.tsx`) nur über eine neue optionale Prop ändern, damit andere Seiten unberührt bleiben.
15. **E-1:** Die Formen werden in `text-arabisch-1` (mindestens 64 px) gesetzt, mit Tatweel (U+0640) als hellgrauer Anschlusslinie. „Im Koran entdecken“ bekommt dieselbe Stufe.
16. **E-2:** Die Spaltenzahl im Raster entspricht der Kartenzahl (bzw. `auto-fit`, zentriert). Die Be-Karte wird per `outline`/`inset` markiert statt über ihre Höhe.
17. **E-3:** `sm:flex-row-reverse` entfällt, der Pfeil steht immer rechts.
18. **L-1:** Der Hifz-Platzhalter wird eine Plakette „Bald“ in der Fußzeile, in Kartentextgröße (mindestens 16 px).

**Abnahmekriterium:** In der Neuaufnahme haben tajwid-leiste, hadith-buch und elifbe-buchstabe gesamt mindestens 8 und keine Kategorie unter 7, die übrigen vier Ansichten bleiben bei mindestens 8. Messbar:
- Bei 390×844 liegt Vers 1 über der Falz.
- Die Beispielmarkierung hat mindestens 3:1.
- Die Wortkarte verdeckt bei 1440 keinen Verstext.
- „Alle Suren“ beginnt auf 390 vor 900 px.
- Im Elifbe-Raster gibt es keine leere Zelle.

### Paket 2: Öffentliche Seiten (Startseite, Gebetszeiten, Projekte)
**Ansichten:** startseite, gebetszeiten-mein-ort, projekte-fertiggestellt

**Dateien:**
- `app/[locale]/(website)/page.tsx`
- `server/queries/nachrichten.ts`
- `components/website/start/{StartBogen,Tagesbogen,TagesbogenLive}.tsx` und `bogenwahl.ts`
- `components/website/gebetszeiten/{GebetszeitenTabs,MeinOrtRechner,QiblaKompass,QiblaKompassAnsicht}.tsx`
- `app/[locale]/(website)/gebetszeiten/page.tsx`
- `components/website/projekte/{Bauprojekt,Meilensteine}.tsx`
- `web/drizzle/seeds/daten/nachrichten.ts`
- `web/messages/*.json` (nur `start`)

**Änderungen:**
1. **ST-1:** `page.tsx` Z. 50 wählt bisher `find(n => n.empfohlen) ?? [0]`. Künftig gilt „empfohlen“ nur innerhalb einer Frist (z. B. 30 Tage), sonst ist die neueste Meldung der Aufmacher. Im Seed ist die Meldung „Neue Gebetszeiten für den Winter“ (2025-07-20) mit `empfohlen: true` angelegt; das wird angepasst.
2. **ST-2:** Auf dem Telefon gilt die Reihenfolge Kennung, H1, Einleitung, Knöpfe, Tageskarte.
3. **ST-3:** Alle sechs Beschriftungen des Bogens stehen auf einer gemeinsamen Grundlinie.
4. **ST-4:** Nach Isha steht die Marke rechts im Nachtbereich, mit Textlabel „jetzt“.
5. **G-1:** `GebetszeitenTabs.tsx` Z. 68 verliert `flex-wrap`. Die Leiste wird einzeilig mit `overflow-x-auto`, Scroll-Snap und Randverlauf, und der aktive Reiter wird in den Blick gescrollt.
6. **G-4:** Die zweite Instanz von „Vollbild“ unter `md` (`gebetszeiten/page.tsx` Z. 311) entfällt. Der Knopf steht im Kopf neben dem Datum.
7. **G-3:** In `MeinOrtRechner.tsx` (ab Z. 302) bekommen `th` und `td` den gleichen Innenabstand. Die Ortsauswahl wird so breit wie die Tabelle.
8. **G-2:** Der Kompass bekommt einen Achtstern als Zielmarke, Teilstriche N/O/S/W im 2-px-Strich und die Gradzahl im Kreis.
9. **PR-1:** In `Bauprojekt.tsx` (Kennzahl, ab Z. 102) stehen Platzhalter in 16 px, regular und grau. Echte Werte bekommen `clamp()`, `overflow-wrap:anywhere` und 16 px Innenabstand.
10. **PR-2:** In `Meilensteine.tsx` sind alle sechs Zeilen gleich aufgebaut, getrennt durch eine feine 1-px-Linie. Die Eröffnung ist nur über den gefüllten Achtstern hervorgehoben.

**Abnahmekriterium:** gebetszeiten-mein-ort und projekte-fertiggestellt erreichen gesamt mindestens 8, keine Kategorie liegt unter 7, startseite bleibt bei mindestens 8. Messbar:
- Mit Beispieldaten ist der Aufmacher die Meldung vom 12.10.2026.
- „Gemeinde beitreten“ steht auf 390 über 844 px.
- Die Reiterleiste ist einzeilig.
- Auf 390 läuft kein Text über eine Kachel hinaus.

### Paket 3: Mein Bereich (Konto, Kinder, Unterricht, Chat)
**Ansichten:** schueler-start, eltern-kind, anwesenheit, gruppenchat

**Dateien:**
- `components/website/Header.tsx` und `kopf/MobilMenue.tsx`
- `components/konto/KontoHuelle.tsx`
- `components/mein-bereich/MeinBereichRahmen.tsx`
- `components/kinder/{FehlmeldungFormular,Kinderzugang}.tsx`
- `app/[locale]/(konto)/mein-bereich/kinder/[id]/page.tsx`
- `components/unterricht/AnwesenheitErfassen.tsx`
- `components/chat/ChatFenster.tsx`
- `web/messages/bereiche/{unterricht,chat-fenster}.json` und `kopf`

**Änderungen:**
1. **X-1:** `Header` bekommt eine optionale Prop `konto` (Initiale, Vorname). `KontoHuelle` rendert den Header (Z. 33) und reicht sie weiter. Statt „Anmelden“ erscheint dann eine Kontoschaltfläche mit Menü „Mein Bereich / Abmelden“, auch im `MobilMenue`. Öffentliche Seiten bleiben statisch und ohne Sitzung (K-01).
2. **X-2:** Die Navigation in `MeinBereichRahmen.tsx` Z. 100 bekommt unter `lg` einen Randverlauf (`mask-image`) und Scroll-Snap, und der aktive Eintrag wird in den Blick gescrollt. Alternative: ein 3×2-Raster.
3. **EK-1:** `FehlmeldungFormular.tsx` Z. 61 nutzt `type="date"`. Chromium formatiert das nach der Browsersprache, `lang="de"` hilft nicht zuverlässig. Deshalb die nächsten drei Termine als Radiogruppe anbieten („Di 13.10.“ …).
4. **EK-2:** Das Raster in `kinder/[id]/page.tsx` (Z. 150 und 301) bekommt `items-start`. Die Knöpfe stehen 24 px unter dem Text statt am Kartenboden.
5. **EK-3, X-5:** `Kinderzugang.tsx` Z. 205 nutzt `break-all` in Monospace. Künftig zeigt die Karte den Pfad ohne Host, bricht per `<wbr>` nur nach „/“ und „?“ und nutzt Proportionalschrift. „Passwort vorschlagen“ bekommt `whitespace-nowrap` oder steht unter dem Feld.
6. **EK-4:** Oben kommen Ankerlinks auf die Abschnitte hinzu (Termin · Abmelden · Anwesenheit · Fortschritt · Einwilligungen · Zugang · Kanal). Erteilte Einwilligungen werden einklappbar.
7. **EK-5, X-4:** Der Status steht nur noch als Plakette, einheitlich oben rechts. „Wortlaut der Einwilligung“ bekommt einen Chevron.
8. **A-1:** In `AnwesenheitErfassen.tsx` Z. 20–24 ist jeder gewählte Status gefüllt, in eigener Farbe und mit Häkchen; der Text hat mindestens 4,5:1. Ungewählte Knöpfe sind Umrisse mit Rand von mindestens 3:1.
9. **A-2:** Das `fieldset` (Z. 77) wird statt `flex-wrap` ein `grid`: auf 390 `grid-cols-2`, ab `md` vier feste Spalten. Das Häkchen liegt innerhalb der festen Breite.
10. **GC-1:** In `ChatFenster.tsx` (Eingabe ab Z. ~329) steht über dem Feld ein Hinweisband mit Uhr-Symbol und Wiederöffnungszeit. Das Feld ist sichtbar deaktiviert. Auf 390 nimmt es die volle Breite ein, „Senden“ steht darunter.
11. **GC-2:** „Melden“ (Z. 274) ist grau, nicht fett, eine Stufe kleiner und steht neben der Zeitangabe.

**Abnahmekriterium:** eltern-kind und anwesenheit erreichen gesamt mindestens 8, keine Kategorie liegt unter 7, schueler-start und gruppenchat bleiben bei mindestens 8. Messbar:
- Kein „Anmelden“ auf Konto-Seiten, und öffentliche Seiten setzen weiterhin keine Cookies.
- Der aktive Reiter ist auf 390 vollständig sichtbar.
- Das Datum erscheint deutsch.
- Keine Karte hat mehr als 48 px Leerfläche.
- Die Statusknöpfe stehen spaltengleich.

### Paket 4: Verwaltung (und Testdaten der Abnahme)
**Ansichten:** seiten-editor, seiten-liste, seiten-editor-bestand, verwaltung-anzeige, verwaltung-uebersicht

**Dateien:**
- `components/verwaltung/shell/Seitenleiste.tsx`
- `components/verwaltung/seiten/{SeitenFormular,BausteinListe,BausteinFelder}.tsx`
- `components/verwaltung/richtext/Werkzeugleiste.tsx`
- `app/[locale]/verwaltung/(geschuetzt)/seiten/page.tsx`
- `components/verwaltung/anzeige/{FolienFormular,Teile}.tsx`
- `app/[locale]/verwaltung/(geschuetzt)/anzeige/{page,[id]/page}.tsx`
- `components/verwaltung/uebersicht/{Kennzahlen,Listen}.tsx`
- `components/verwaltung/organisationTon.ts`
- `web/messages/verwaltung/{seiten,anzeige}.json`
- Außerhalb des Repos: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/sicht/skripte/{vw-medium,vw-editor}.mjs`

**Änderungen:**
1. **SE-1:** Die Testillustration wird durch ein neutrales Motiv ersetzt (Achtstern-Fläche oder Streifen-Platzhalter wie in `components/website/Bildplatzhalter.tsx`). Alt-Text und Bildunterschrift werden passend und widerspruchsfrei. Ein Hinweis auf Kuppel- oder Mondsichel-Motive in `MedienFormulare.tsx` ist optional (nur 1 Juror).
2. **SE-2:** `Werkzeugleiste.tsx` Z. 102 nutzt `flex-wrap min-h-28`. Unter 640 px wird daraus eine einzeilige, waagrecht scrollbare Symbolleiste (44×44, `aria-label` und Tooltip). Seltene Befehle stehen unter „Mehr“.
3. **SE-3:** Die Speicherleiste (`SeitenFormular.tsx` Z. 453) wird einzeilig (Knopf + „Entwurf“) und ist auf 390 höchstens 72 px hoch. Das Formular bekommt unten einen Innenabstand von Leistenhöhe + 24 px.
4. **X-5:** Die Adressvorschau (`SeitenFormular.tsx` Z. 355) verliert `break-all` und bricht per `<wbr>` nur nach „/“ und „-“.
5. **X-4:** In `BausteinListe.tsx` Z. 308 und `FolienFormular.tsx` Z. 205 sind die `summary`-Elemente `flex`. `globals.css` Z. 276 blendet den Marker aus und erwartet einen eigenen Chevron, der hier fehlt. Abhilfe: `ChevronDown`, der sich bei `open` dreht, und rechts der Stand („0 von 2“ bzw. „Türkisch, Englisch – optional“).
6. **SB-1, SB-2:** Bestandsseiten öffnen mit zugeklappten Bausteinen (Typ + einzeilige Vorschau), dazu „Alle auf/zu“. Der Spaltenbaustein zeigt ab `lg` so viele Spalten nebeneinander, wie er Felder hat. Textfelder wachsen mit dem Inhalt (mindestens 3 Zeilen).
7. **X-3:** Der scrollbare Bereich der Seitenleiste (`Seitenleiste.tsx` Z. 191) bekommt unten einen Verlauf bzw. Schatten, oder die Gruppen werden einklappbar.
8. **SL-1, VA-2:** In den Listen steht „Bearbeiten“ als sichtbarer Text. Der Papierkorb bekommt Tooltip und `aria-label` und ist überall gleich als zerstörende Aktion ausgezeichnet. „Löschen“ bei der Folie ist beschriftet und steht mindestens 24 px von „Sichtbar schalten“ entfernt oder in einer eigenen Zone am Seitenende.
9. **VA-1:** Die Art-Karten in `FolienFormular.tsx` (ab Z. ~232) werden oben ausgerichtet, mit fester Kopfzeile (Radio + Icon + Titel). Die Beschreibung steht 12 px darunter.
10. **VA-3:** `zeitplanText` (`anzeige/[id]/page.tsx` Z. 79) steht in einer eigenen Zeile „Zeitplan: …“.
11. **X-6:** Die Kennzahlen (`Kennzahlen.tsx` Z. 47/49/75/77) laufen über die Textschrift Atkinson Hyperlegible Next. Deren Null ist schon in der Grundform durchgestrichen, und die Schrift hat **kein** Feature `zero` (Features nur ccmp, frac, locl, pnum, tnum). Der Vorschlag `font-feature-settings 'zero' 0` wirkt deshalb nicht. Die großen Kennzahlen werden stattdessen in `font-display` gesetzt (Titelschrift, Null ohne Strich, wie im Medaillon). Leere Werte stehen grau mit „keine“. Für Zeiten auf der Website (nur J3) bleibt es bei der Textschrift; das wird als bewusste Entscheidung festgehalten.
12. **VU-1:** Die Kürzel bekommen Klartext über `title`/`aria-label` und eine Legende unter der Liste.
13. **X-7 (Verfahren):** Für seiten-liste, seiten-editor-bestand, verwaltung-anzeige und verwaltung-uebersicht werden Aufnahmen bei 390 nachgereicht.

**Abnahmekriterium:** seiten-editor erreicht gesamt mindestens 8, Formensprache und Mobil liegen bei mindestens 7, die übrigen Verwaltungsansichten bleiben bei mindestens 8, und die 390-Aufnahmen liegen vor. Messbar:
- Kein Kuppel- oder Minarettmotiv mehr in den Aufnahmen.
- Die Werkzeugleiste auf 390 ist einzeilig.
- Kein Feld wird im ersten Bildschirm verdeckt.
- Jede `summary` hat einen Chevron.
- Keine Kennzahl liest sich als „Ø“.
