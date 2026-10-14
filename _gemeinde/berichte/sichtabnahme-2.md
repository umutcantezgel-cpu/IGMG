# Sichtabnahme Z-04 – Runde 2

Drei Juroren haben unabhängig voneinander 19 Ansichten bewertet. Die Aufnahmen liegen in `scratchpad/sicht2/bilder`, jeweils bei 390×844 (@2x) und 1440×900, mit locale de-DE. Die Verwaltung ist jetzt auch bei 390 aufgenommen, X-7 aus Runde 1 ist damit erledigt. Insgesamt gibt es 158 Einzelbefunde. Zwei davon sind ausdrücklich als „kein Mangel, als Beleg notiert“ markiert. **Kein Befund hat die Schwere „hoch“.** Dateipfade sind relativ zu `/home/user/IGMG/web/src` angegeben, wenn nichts anderes dasteht.

## 1. Noten (Median der drei Juroren) im Vergleich mit Runde 1

Eine Ansicht ist abgenommen, wenn der Median für „gesamt“ mindestens 8 beträgt und keine Kategorie im Median unter 7 liegt.

| Ansicht | Hier. | Typo | Farbe | Raster | Form | Mobil | Zugängl. | **Gesamt R2** | Gesamt R1 | Abgenommen |
|---|---|---|---|---|---|---|---|---|---|---|
| surenansicht | 8 | 8 | 8 | 8 | 9 | 8 | 8 | **8** | 8 | ja |
| surenansicht-wortkarte | 8 | 8 | 8 | 7 | 8 | 8 | 8 | **8** | 8 | ja |
| surenansicht-tajwid-leiste | 8 | 8 | 8 | 8 | 7 | 8 | 8 | **8** | 7,5 | ja (neu) |
| koran-uebersicht | 8 | 7 | 8 | 8 | 9 | 8 | 8 | **8** | 8 | ja |
| hadith-buch | 7 | 8 | 8 | 7 | 8 | 7 | 8 | **7** | 7 | **nein** |
| elifbe-buchstabe | 7 | 8 | 8 | 8 | 9 | 7 | 8 | **8** | 7 | ja (neu) |
| lernen-hub | 8 | 8 | 8 | 8 | 9 | 8 | 8 | **8** | 8 | ja |
| gebetszeiten-mein-ort | 7 | 8 | 8 | 8 | 8 | 7 | 8 | **8** | 7,5 | ja (neu) |
| projekte-fertiggestellt | 7 | 8 | 8 | 8 | 8 | 8 | 8 | **7** | 7,5 | **nein** |
| startseite | 8 | 8 | 8 | 8 | 9 | 8 | 8 | **8** | 8 | ja |
| schueler-start | 8 | 8 | 8 | 8 | 9 | 8 | 8 | **8** | 8 | ja |
| eltern-kind | 8 | 7 | 8 | 8 | 8 | 8 | 8 | **8** | 7 | ja (neu) |
| anwesenheit | 8 | 8 | 8 | 8 | 8 | 8 | 8 | **8** | 7,5 | ja (neu) |
| gruppenchat | 7 | 8 | 8 | 8 | 8 | 7 | 8 | **7** | 8 | **nein** (zurückgefallen) |
| seiten-editor | 8 | 8 | 8 | 8 | 8 | 7 | 8 | **7** | 7 | **nein** |
| seiten-liste | 8 | 8 | 8 | 8 | 8 | 8 | 8 | **8** | 8 | ja |
| seiten-editor-bestand | 7 | 8 | 8 | 8 | 8 | 8 | 8 | **7** | 8 | **nein** (zurückgefallen) |
| verwaltung-anzeige | 8 | 8 | 8 | 7 | 8 | 8 | 8 | **8** | 8 | ja |
| verwaltung-uebersicht | 8 | 8 | 8 | 8 | 8 | 8 | 8 | **8** | 8 | ja |

**Ergebnis:** 14 von 19 Ansichten sind abgenommen, in Runde 1 waren es 11.
- **Neu abgenommen:** tajwid-leiste, elifbe-buchstabe, gebetszeiten-mein-ort, eltern-kind, anwesenheit.
- **Weiterhin nicht abgenommen:** hadith-buch, projekte-fertiggestellt, seiten-editor.
- **Zurückgefallen:** gruppenchat und seiten-editor-bestand. Beide Rückfälle kommen aus Umsetzungen von Runde 1:
  - Im Gruppenchat wurde „Melden“ nach GC-2 („zu laut“) leiser gesetzt. Jetzt gilt der Knopf als zu schwach und steht uneinheitlich.
  - Im Bestandseditor sind die Bausteine nach SB-1 zugeklappt. Dadurch steht die Wand aus 32 Knöpfen frei.
- Keine Ansicht hat eine Kategorie unter 7. In Runde 1 hatte seiten-editor Formensprache 6 und Mobil 6.
- Alle fünf Ausfälle sind knapp: Jeweils zwei Juroren geben 7, einer gibt 8.

## 2. Bestätigte Befunde (nur nicht abgenommene Ansichten und Schwere „hoch“)

Ein Befund gilt als bestätigt, wenn ihn mindestens zwei Juroren nennen. Ein Befund mit „hoch“ reicht mit einem Juror, muss aber im Bild belegt sein. In dieser Runde gibt es keinen Befund mit „hoch“.

Ich habe trotzdem zwei Bilder geprüft:
- `gruppenchat-390-oben.png`: „Melden“ steht in einer eigenen Zeile.
- `projekte-fertiggestellt-1440-oben.png`: Der Kopf ist allgemein gehalten, die Platzhalter stehen im Fließtext.

Außerdem habe ich den Code zu den Befunden über klebende und schwebende Elemente gelesen (X-10). Ein Teil der Befunde zu hadith-buch und zum Seiten-Editor sind **Fehler der Ganzseitenaufnahme**, keine Mängel im Produkt.

### Befunde, die mehrere Ansichten betreffen

| ID | Befund | Ansichten (Juroren) | Ursache |
|---|---|---|---|
| X-8 | Der große Gebetskasten füllt auf Unterseiten bei 390 den ersten Bildschirm | hadith-buch, projekte (J2); koran-uebersicht, lernen-hub (J1); elifbe, lernen-hub (J2) – 2 Juroren | `Seitenrahmen` hat `kompakteLeiste`, die Prop wird aber nur auf `/quran/[sure]` und `/quran/cuz/[nr]` gesetzt |
| X-9 | Platzhalter „[…]“ sehen aus wie fertiger Inhalt | projekte (J1, J3), seiten-editor-bestand (J1, J3); tajwid-leiste (J1, J3), schueler-start (J3) | `Text` setzt Platzhalter aus dem Seed (G-05) wie normalen Inhalt |
| X-10 | Klebende und schwebende Elemente stehen im Ganzseitenbild falsch | hadith-buch (3), seiten-editor (3), -bestand (2) | Aufnahme mit `fullPage: true` bei scrollY 0: `sticky` steht an der Fensterkante oder oben, und „Nach oben“ ist `invisible` |
| X-11 | Datumsfelder im US-Format („mm/dd/yyyy“, AM/PM) | seiten-editor (3), verwaltung-anzeige (3) | Das native `datetime-local` folgt der Sprache der Browseroberfläche. Chromium läuft in den Skripten ohne `--lang=de-DE`, `locale: 'de-DE'` reicht dafür nicht |

### Befunde je Ansicht (Anzahl Juroren in Klammern)

**hadith-buch** (gesamt 7; Hierarchie, Raster und Mobil je 7)
- **H-5:** Die Begleitspalte bei 1440 läuft nicht mit, die rechte Spalte ist über etwa 22.000–23.000 px leer (3, mittel/niedrig/mittel).
  - Das ist ein **Fehler der Aufnahme (X-10)**. `hadith/BuchAnsicht.tsx` hat in Z. 75 `items-start` und in Z. 119 `lg:sticky lg:top-8`, und kein Vorfahr setzt `overflow`.
  - Die Viewport-Aufnahme nach dem Scrollen, die Runde 1 empfohlen hatte (H-1), fehlt noch.
- **H-6:** Die lange Liste hat keinen Sprung zu Nummern oder Abschnitten. Navigation gibt es nur oben und unten, ein „Nach oben“ fehlt (3, mittel).
  - „Nach oben“ gibt es schon (`NachOben`, Z. 139). Der Knopf erscheint aber erst ab scrollY > Fensterhöhe und ist deshalb in keiner Aufnahme zu sehen.
  - Was wirklich fehlt, sind Nummernsprung und Gliederung: `hadith/HadithListe.tsx` Z. 40 ist eine einzige `ol` mit 51 Einträgen.
- **H-7:** „Übersetzung in Arbeit“ steht 51-mal im Kartenfuß (2, niedrig/mittel). Stelle: `HadithListe.tsx` Z. 72.
- dazu X-8 (J2).
- *Nicht bestätigt:*
  - H1 englisch (J1). Die Hinweiszeile aus H-4 steht inzwischen.
  - „Link kopieren“ zu klein (J2). Das widerlegt der Code: Der Link hat `min-h-12`, also 48 px Zielhöhe. Nur der sichtbare Text ist etwa 15 px hoch.

**projekte-fertiggestellt** (gesamt 7; Hierarchie 7)
- **PR-3:** „[Ortsangabe – von der Gemeinde]“, „[Datum]“, „[von der Gemeinde]“ und „[Bankverbindung …]“ stehen in Schrift und Farbe wie echter Text (2, mittel).
  - Die Texte kommen aus dem Seed `drizzle/seeds/bereiche/projekte.ts` und sind nach G-05 gewollt.
  - Seit PR-1 sind nur die Kennzahl-Kacheln grau gesetzt.
- **PR-4:** Die Kernbotschaft „fertiggestellt/eröffnet“ und der Projektname stehen nicht oben (2, mittel/niedrig).
  - Der Kopf ist allgemein: „Gemeinsam glauben, gemeinsam wachsen“ (`app/[locale]/(website)/projekte/page.tsx` Z. 30).
  - Der Status steht nur als Plakette im Bild (`projekte/Bauprojekt.tsx` Z. 39–42).
  - Bei 390 erscheinen Name und Status erst im zweiten Bildschirm.
- **PR-5:** Sechsmal steht „Abgeschlossen“ neben sechs Haken, obwohl darüber schon „6 von 6“ steht (2, mittel/niedrig). Stelle: `projekte/Meilensteine.tsx` Z. 213–225.
- dazu X-8 (J2).
- *Nicht bestätigt:* Gewichtung im Spendenblock (J2), Schatten der Spendenkarte (J3), leere Kacheln ausblenden (J1).

**gruppenchat** (gesamt 7; Hierarchie und Mobil je 7; Runde 1: 8)
- **GC-3:** „Melden“ steht uneinheitlich und hat keine sichtbare Fläche (2, niedrig/mittel). Bei 390 steht es bei Selin B. in einer eigenen Zeile, bei Zeynep B. in der Zeile.
  - Ursache: Der Nachrichtenkopf ist `flex flex-wrap` (`chat/ChatFenster.tsx` Z. 269), und der Knopf ist reiner Text mit negativem Rand (Z. 273–285).
  - Im Bild belegt.
- **GC-4:** Der Regelblock hat 8 lange Punkte. Bei 390 liegen etwa zwei Bildschirmhöhen vor dem Knopf „Ich habe die Regeln gelesen“ (2, niedrig/mittel).
  - Stelle: Z. 313–329, Texte unter `messages/bereiche/chat.json` → `chatRegeln.regeln.r1–r8`.
- **GC-5:** Die Nummer gegen Kummer 116 111 steht als kleine graue Fußnote und hat keinen `tel:`-Link (2, mittel). Stelle: Z. 321 mit `text-16 text-tinte-2`.
- *Nicht bestätigt, Mitnahme empfohlen (gleiche Datei):*
  - Das gesperrte Feld nennt den falschen Grund (J2, mittel). Der Code bestätigt das: Der Platzhalter `eingabeGesperrt` (Z. 353) steht unabhängig vom Grund, also auch bei `regelnFehlen`.
  - „Gruppenchat“ steht doppelt als H1 und Kartentitel (J1; in Runde 1 J2).
- *Nicht bestätigt:* Fremde Nachrichtenblasen haben nur etwa 1,04:1 Kontrast (J2).

**seiten-editor** (gesamt 7; Mobil 7)
- **SE-4:** Die Werkzeugleiste ist bei 390 ein angeschnittener Wischstreifen (3, mittel).
  - Der Listenknopf ist durch die Randmaske verblasst, „Absatz“ ist nicht zu sehen, und Wischen und „…“ stehen nebeneinander.
  - Ursache: `verwaltung/richtext/Werkzeugleiste.tsx` Z. 163–164 (`max-sm:overflow-x-auto`, `max-sm:mask-r-from-85%`). Acht Knöpfe zu 48 px passen nicht in etwa 326 px.
- **SE-5:** Jeder Baustein trägt vier gleich gewichtete Umrissknöpfe, bei 1440 beschriftet (3, niedrig/niedrig/mittel).
  - „Entfernen“ sieht aus wie „Zuklappen“ und wird nur beim Hover rot. Bei 390 sind die Symbole mehrdeutig.
  - Stelle: `verwaltung/seiten/BausteinListe.tsx` Z. 280–349.
- **SE-6:** Speicherleiste (3, mittel/niedrig/niedrig).
  - Im ersten Bildschirm ist sie nicht zu sehen (J1). Das ist echt und Absicht: Nach SE-3 versteckt `SeitenFormular.tsx` (Z. 89–113, Z. 508 `translate-y`) die Leiste bis scrollY > 96.
  - Dass sie im Ganzseitenbild über Abschnitt 1 liegt (alle drei), ist ein **Fehler der Aufnahme (X-10)**. Die klebende Leiste steht dort bei y ≈ 925–997 an der Fensterkante statt am Formularende.
- **SE-7:** „Veröffentlichen am“ zeigt das US-Format (3, niedrig). Stelle: `SeitenFormular.tsx` Z. 488, siehe X-11.

**seiten-editor-bestand** (gesamt 7; Hierarchie 7; Runde 1: 8)
- **SB-3:** Acht zugeklappte Bausteine mit je vier gleich lauten Knöpfen ergeben 32 Knöpfe. Die Titel treten zurück, und bei 390 ist das Aufklappsymbol kaum von den Pfeilen zu unterscheiden (3, mittel/niedrig/mittel). Gleicher Code wie SE-5.
- **SB-4:** Die Speicherleiste verdeckt im Ganzseitenbild das Feld „Gehört zu“ (2). Das ist ein Fehler der Aufnahme wie bei SE-6.
- **SB-5:** Die Kurzbeschreibung enthält „[Ein Satz zur Moschee – Text von der Gemeinde]“ als Feldwert (2, niedrig).
  - Der Wert kommt aus dem Seed `drizzle/seeds/bereiche/seiten.ts` Z. 108 und ist nach G-05 gewollt.
  - Anders als der Seiteninhalte-Editor (`hatPlatzhalter` in `verwaltung/seiteninhalte/hilfen.ts`, genutzt in `Felder.tsx` Z. 106) kennzeichnet `SeitenFormular` solche Platzhalter nicht.

## 3. Befundpakete

Die drei Pakete teilen sich keine Datei. Auch die Nachrichtendateien sind getrennt: A nutzt `bereiche/{hadith,projekte}`, B nutzt `bereiche/{chat-fenster,chat}`, C nutzt `verwaltung/{editor,seiten}`.

### Paket A: Website – Hadith-Buch und Projekte
**Ansichten:** hadith-buch, projekte-fertiggestellt

**Dateien:**
- `components/website/hadith/{BuchAnsicht,HadithListe}.tsx`
- `app/[locale]/(website)/projekte/page.tsx`
- `components/website/projekte/{Bauprojekt,Meilensteine,Spenden,Unterstuetzen}.tsx`
- `components/website/Text.tsx` (nur eine neue Prop, standardmäßig aus)
- neu: `components/website/Platzhalter.tsx`
- `components/website/rechtliches/Rechtstext.tsx` (nur der Import ändert sich)
- `web/messages/bereiche/{hadith,projekte}.json` (de, tr, en)

**Änderungen:**
1. **X-8:** `kompakteLeiste` an `Seitenrahmen` in `BuchAnsicht.tsx` und in `projekte/page.tsx` (Z. 29) setzen.
   - Optional gilt dieselbe Prop für lernen, quran-Übersicht und elifbe. Das nur tun, wenn diese Ansichten nachgeprüft werden.
2. **H-6:** `HadithListe` gliedert die Hadithe in Abschnitte zu je 10. Der Rest kommt zum letzten Abschnitt, also 8–17 … 48–58.
   - Vor jedem Abschnitt steht eine Zwischenmarke (Achtstern + „Hadith 8–17“, `id="ab-8"`, `scroll-mt`).
   - `BuchAnsicht` zeigt eine Sprungleiste zu diesen Abschnitten: bis lg als Chips in der kompakten Leiste unter dem Kopf (Z. 79–101), ab lg in der mitlaufenden Spalte.
   - `content-visibility` bleibt erhalten.
3. **H-7:** Hat kein Hadith der Liste eine geprüfte Übersetzung, steht „Übersetzung in Arbeit“ einmal als Hinweis (`role="note"`) über der Liste. Im Kartenfuß erscheint es nur noch in gemischten Listen.
4. **H-5:** Keine Codeänderung. Den Nachweis bringt Verfahren V-1.
5. **PR-4:** Kopf bei Status `fertiggestellt`:
   - H1 lautet „{Name} ist eröffnet“ (neuer Schlüssel `projekte.kopf.titelFertig`) mit Achtstern als `titelZeichen`. Der bisherige Titel wird zur Unterzeile.
   - Die h2 in `Bauprojekt` lautet dann „Das Projekt“, damit der Name nicht doppelt steht.
   - Unter lg steht die Textspalte vor dem Bild (`max-lg:order-first`).
   - Die Statusplakette steht zusätzlich neben der Kennung „Projekt“.
6. **PR-3:** Platzhalter einheitlich kennzeichnen.
   - `MitPlatzhaltern` wandert aus `Rechtstext.tsx` (Z. 15–24) nach `Platzhalter.tsx`.
   - `Text` bekommt die Prop `platzhalter`, die standardmäßig aus ist. Ist sie an, werden „[…]“-Teile gestrichelt in `text-tinte-2` mit `data-platzhalter` gesetzt.
   - Die Prop wird in den vier Projekte-Komponenten eingeschaltet. Opt-in ist nötig, weil `Text` 41 Nutzer hat, und Übersetzungen mit Einschüben in eckigen Klammern dürfen nicht markiert werden.
   - In der Datumszeile der Meilensteinlinie entfallen reine Platzhalter wie „[Datum]“.
   - Optional (J1): Kennzahl-Kacheln mit `null` ausblenden.
7. **PR-5:** Sind alle Meilensteine erledigt, ist „Abgeschlossen“ nur noch `sr-only`. Der Text bleibt für Screenreader, weil die Haken `aria-hidden` sind. „Geplant“ bleibt sichtbar.

**Abnahmekriterium:** hadith-buch und projekte-fertiggestellt erreichen gesamt mindestens 8, keine Kategorie liegt unter 7. Messbar:
- Bei 390×844 beginnt auf `/hadith/bukhari/2` die Sprungleiste oder die erste Hadith-Karte über 844 px.
- Auf `/projekte` stehen Projektname und Status über 844 px.
- Auf `/hadith/bukhari/2` steht „Übersetzung in Arbeit“ genau einmal im DOM-Text. Die Sprungleiste hat mindestens 5 Ziele, und jedes liefert mit `getElementById` ein Element.
- Auf `/projekte` gibt es keinen Textknoten mit `\[[^\]]+\]` außerhalb von `[data-platzhalter]`. Bei 6 von 6 ist „Abgeschlossen“ nirgends sichtbar.
- Viewport-Aufnahme nach `scrollTo(0, 0.5·scrollHeight)`: Bei 1440 ragt die Begleitspalte ins Fenster, bei 390 ist „Nach oben“ sichtbar.

### Paket B: Mein Bereich – Gruppenchat
**Ansichten:** gruppenchat

**Dateien:**
- `components/chat/ChatFenster.tsx`
- `app/[locale]/(konto)/mein-bereich/gruppen/[id]/chat/page.tsx` (nur `chatTexte`)
- `web/messages/bereiche/{chat-fenster,chat}.json` (de, tr, en)

**Änderungen:**
1. **GC-3:** Der Kopf fremder Nachrichten wird ein Raster `grid-cols-[minmax(0,1fr)_auto]`.
   - Links stehen Name, Plakette und Zeit (dürfen umbrechen).
   - Rechts steht immer „Melden“ als ruhiger Umrissknopf: Fahne + Wort, `rounded-md border border-rand`, `min-h-11 min-w-11`, `whitespace-nowrap`, Schrift `text-tinte-2`, keine Füllung.
   - Damit bleibt GC-2 aus Runde 1 („zu laut“) gewahrt.
2. **GC-5:** Die Hilfe wird ein eigener Hinweis direkt über „Ich habe die Regeln gelesen“.
   - Telefonsymbol, die Nummer fett in Grundtextfarbe als `<a href="tel:116111">`, im Elternkanal `tel:08001110550`, mindestens 44 px hoch.
   - Dieselbe Zeile steht auch im Melden-Dialog (Z. 455).
   - In den Nachrichten wird `hilfe` in Text und `hilfeNummer` geteilt.
3. **GC-4:** Regeln kürzer zeigen, Wortlaut unverändert lassen (laut Wortlaut-Protokoll „kein Rechtsbezug“).
   - Je Regel bleibt das Stichwort sichtbar: der erste Satz, fett, mit Achtstern als Aufzählungszeichen.
   - Die Erläuterung ist einklappbar (`details`).
   - `chatRegeln.regeln.rN` und `erwachsen.regeln.rN` werden zu `{ stichwort, text }`.
4. **Mitnahme:**
   - Der Platzhalter des gesperrten Felds richtet sich nach dem Grund. Bei `regelnFehlen` lautet er „Bestätige zuerst die Chat-Regeln“.
   - Der Kartentitel (Z. 234–236) wird zum Gruppennamen oder nur noch für Screenreader angezeigt.

**Abnahmekriterium:** gruppenchat erreicht gesamt mindestens 8, keine Kategorie liegt unter 7. Messbar:
- Bei 390 und 1440 ist jeder „Melden“-Knopf mindestens 44×44 groß, hat einen sichtbaren Rand und weicht höchstens 4 px von der Oberkante der Namenszeile ab.
- Bei 390 ist der Regelblock vom Titel bis einschließlich Bestätigungsknopf höchstens 600 CSS-px hoch.
- Es gibt ein `a[href^="tel:"]`, mindestens 44 px hoch, mit Textfarbe `--color-tinte`.
- Bei `regelnFehlen` erscheint „Schreiben ist gerade nicht möglich“ nicht.

### Paket C: Verwaltung – Seiten-Editor
**Ansichten:** seiten-editor, seiten-editor-bestand

**Dateien:**
- `components/verwaltung/richtext/Werkzeugleiste.tsx`
- `components/verwaltung/seiten/{BausteinListe,SeitenFormular}.tsx`
- `verwaltung/seiteninhalte/hilfen.ts` (nur importieren)
- `web/messages/verwaltung/{editor,seiten}.json`

**Änderungen:**
1. **SE-4:** Unter 640 px gibt es keinen Wischstreifen mehr, sondern eine feste Zeile aus höchstens sechs 48-px-Knöpfen (6·48 + 5·4 = 308 px, verfügbar sind etwa 326 px):
   - **Absatztyp:** zeigt den aktiven Typ als Kurzwort und öffnet die Auswahl Absatz/H2/H3.
   - **Fett, Kursiv, Aufzählung, Link.**
   - **„…“:** Alle anderen Befehle stehen darunter.
   - Es entfallen `overflow-x-auto`, Snap, `mask-r-from-85%` und der Scroll-Beobachter (Z. 120–135, 163–164).
2. **SE-5, SB-3:** Bausteinkopf neu ordnen.
   - Der Kopf selbst schaltet auf und zu, nach dem Akkordeon-Muster `<h3><button aria-expanded>` mit Chevron rechts. Die `id` bleibt das Fokusziel der Fehlerliste. Der eigene Knopf „Zuklappen“ entfällt.
   - Verschieben wird ein Symbolpaar ↑ ↓ (44×44, `title` + `aria-label`, in keiner Breite mit Text).
   - Entfernen ist ein Papierkorb, dauerhaft in Erdrot (`border-fehler text-fehler`, wie `veranstaltungen/LoeschenBestaetigen.tsx` Z. 31), mit 16 px Abstand abgesetzt.
3. **SE-6, SB-4:** Die Speicherleiste ist ab Seitenbeginn sichtbar.
   - Das Verstecken per `translate-y` und die Logik `gescrollt` entfallen.
   - Die Leiste bleibt einzeilig und höchstens 64 px hoch.
   - `scroll-padding-bottom` wird gemessene Leistenhöhe + 16 px statt fest 6rem.
   - Das ersetzt das Kriterium aus Runde 1 „kein Feld im ersten Bildschirm verdeckt“ durch WCAG 2.4.11: Kein fokussiertes Feld darf von der Leiste verdeckt werden.
4. **SB-5:** Titel und Kurzbeschreibung mit „[…]“ im Wert bekommen die Platzhalter-Kennzeichnung des Seiteninhalte-Editors: gestrichelter Rand + Hinweis über `hatPlatzhalter`. Der Seed bleibt nach G-05.
5. **SE-7:** Wird über Verfahren V-2 gelöst. Optional kommt unter „Veröffentlichen am“ der Hilfetext „Uhrzeit in Wetzlar, 24 Stunden“ wie in der Anzeige (`formular.zeitHinweis`).

**Abnahmekriterium:** seiten-editor und seiten-editor-bestand erreichen gesamt mindestens 8, keine Kategorie liegt unter 7. Seiten-liste, verwaltung-anzeige und verwaltung-uebersicht bleiben bei mindestens 8. Messbar:
- Bei 390 gilt für die Werkzeugzeile `scrollWidth ≤ clientWidth`, und der aktive Absatztyp steht als Text da.
- In bestand-1440 hat jeder Bausteinkopf neben dem Kopf-Umschalter höchstens 3 Knöpfe, keiner davon mit Text. Der Papierkorb hat die Farbe `--color-fehler`.
- Die Speicherleiste ist in `-oben` bei beiden Breiten sichtbar und höchstens 64 px hoch.
- Beim Tabben durch alle Felder schneidet kein fokussiertes Element die Leiste (Prüfung über `boundingBox`).
- Keine Aufnahme zeigt „mm/dd/yyyy“, „AM“ oder „PM“.

### Verfahren für Runde 3 (kein Produktcode)
Die Skripte liegen außerhalb des Repos in `scratchpad/sicht2/skripte/{fotos,gemeinsam,verw-fotos}.mjs`.
- **V-1 (X-10):**
  - Für hadith-buch, seiten-editor und seiten-editor-bestand zusätzlich eine Viewport-Aufnahme `-mitte` nach `scrollTo(0, 0.5·scrollHeight)` und 1 s Pause machen.
  - In Ganzseitenbildern klebende Leisten per eingefügtem Stil (`position: static; transform: none`) an ihren Platz im Formular setzen.
  - Den Juroren mitteilen, dass klebende Elemente im Ganzseitenbild an falscher Stelle stehen.
- **V-2 (X-11):** Chromium mit `args: ['--lang=de-DE']` und `env: { LANG: 'de_DE.UTF-8' }` starten. Vorher an `/verwaltung/seiten/neu` prüfen, dass das Feld „TT.MM.JJJJ, --:--“ zeigt.
- **Umfang:** Die fünf nicht abgenommenen Ansichten neu bewerten. Andere abgenommene Ansichten sind nicht betroffen: `Text` ist opt-in, `Seitenrahmen` bekommt nur eine Prop gesetzt, und `BausteinListe` und `SeitenFormular` gehören nur zum Seiten-Editor.

### Zur Kenntnis: bestätigt, aber in abgenommenen Ansichten
Diese Befunde blockieren die Abnahme nicht und gehören nicht zu den Paketen.
- **Null mit Schrägstrich** in Zeiten und Daten der Website: startseite (J1, J3) und gebetszeiten (J2, J3). Runde 1 (X-6) hatte das bewusst beibehalten. Weil jetzt drei Juroren es nennen, sollte die Entscheidung neu geprüft werden. Atkinson hat kein Feature `zero`, Abhilfe bringt nur eine andere Ziffernschrift.
- **gebetszeiten:** Die Reiterleiste ist bei 390 angeschnitten (3). Das Band „Nächstes Gebet“ (Wetzlar) widerspricht der Tabelle des gewählten Orts (2).
- **startseite:** Der Fastenbogen-Link steht außerhalb der Karte (3), die Zeiten stehen doppelt (2).
- **koran-uebersicht:** Umschriften brechen am Bindestrich um (3), die Cüz-Auswahl steht doppelt (2).
- **elifbe:** Die Glyphe ist nicht im ersten Bildschirm (3).
- **lernen-hub:** Hifz hat eine gefüllte Marke wie die verfügbaren Stationen (3).
- **Koran-Leser:**
  - Ortsangabe in der Wortkarte doppelt (2).
  - Wortkarte bei 1440 am Fensterrand (2).
  - Familienzeichen „_“ in Wortkarte (2) und Leiste (2).
  - Beispielrahmen in der Leiste (2).
  - Freigabe-Kasten vor Vers 1 (2).
  - „Rezitation folgt“ nur bei 1440 (2).
- **eltern-kind:** „Abmelden“ ist doppelt belegt (2), Zeiten stehen in Monospace (2).
- **anwesenheit:** „Später“ und „verspätet“ sind uneinheitlich (2).
- **schueler-start:** Die Bereichsleiste ist bei 390 angeschnitten (2).
- **verwaltung-anzeige:** Die Aktionsspalte ist zu schmal (3).
- **seiten-liste und verwaltung-uebersicht:** Der unterste Eintrag der Seitenleiste ist ausgebleicht (2).
