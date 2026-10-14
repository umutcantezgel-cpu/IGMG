# Sichtabnahme Z-04, Runde 3: Nachbewertung der fünf offenen Ansichten

Drei Juroren haben die fünf Ansichten neu bewertet, die in Runde 2 nicht abgenommen waren. Dazu kam der Zustand **gruppenchat-melden**, der in Runde 2 noch nicht unter den 19 Ansichten war. Die Aufnahmen liegen in `scratchpad/sicht3/bilder`, je bei 390×844 (@2x) und 1440×900. Die Verfahren V-1 und V-2 sind wirksam: Kein Juror nennt mehr klebende Leisten an falscher Stelle (X-10) oder das US-Datumsformat (X-11). Die Juroren haben 81 Einzelbefunde abgegeben (J1 29, J2 24, J3 28). **Keiner davon hat die Schwere „hoch“.** Dateipfade sind relativ zu `/home/user/IGMG/web/src` angegeben, Nachrichtendateien relativ zu `/home/user/IGMG/web`.

## 1. Noten (Median der drei Juroren) im Vergleich mit Runde 2

Eine Ansicht ist abgenommen, wenn der Median für „gesamt“ mindestens 8 beträgt und keine Kategorie im Median unter 7 liegt.

| Ansicht | Hier. | Typo | Farbe | Raster | Form | Mobil | Zugängl. | **Gesamt R3** | Einzelnoten gesamt | Gesamt R2 | Abgenommen |
|---|---|---|---|---|---|---|---|---|---|---|---|
| hadith-buch | 8 (R2 7) | 8 | 9 (8) | 8 (7) | 9 (8) | 7 | 8 | **8** | 8 / 8 / 8 | 7 | **ja (neu)** |
| projekte-fertiggestellt | 7 | 8 | 8 | 8 | 8 | 7 (8) | 8 | **8** | 7 / 8 / 8 | 7 | **ja (neu)** |
| gruppenchat | 8 (7) | 8 | 8 | 7 (8) | 8 | 7 | 8 | **8** | 7,5 / 8 / 8 | 7 | **ja (neu)** |
| seiten-editor | 8 | 8 | 9 (8) | 8 | 8 | 7 | 8 | **8** | 8 / 8 / 8 | 7 | **ja (neu)** |
| seiten-editor-bestand | 8 (7) | 8 | 8 | 8 | 8 | 7 (8) | 8 | **8** | 8 / 8 / 8 | 7 | **ja (neu)** |
| *gruppenchat-melden (Zustand, neu)* | 9 | 8 | 8 | 7 | 8 | 7 | 8 | **8** | 8 / 8 / 8 | – | ja |

Werte in Klammern zeigen den Median aus Runde 2, wenn er sich geändert hat.

- **Alle fünf Ansichten sind abgenommen**, und jede steigt im Gesamt von 7 auf 8.
- Knapp sind zwei Ansichten:
  - projekte-fertiggestellt: Hierarchie und Mobil liegen je bei 7, J1 gibt gesamt 7.
  - gruppenchat: Raster und Mobil liegen je bei 7, J1 gibt gesamt 7,5.
- **Mobil ist die schwächste Kategorie.** In allen sechs bewerteten Ansichten liegt der Median bei 7. Nur J2 gibt viermal 8.
- Rückgänge um einen Punkt, aber nicht unter 7: projekte Mobil (8 → 7), gruppenchat Raster (8 → 7) und bestand Mobil (8 → 7).

## 2. Gesamtstand Z-04

| | Anzahl |
|---|---|
| In Runde 2 abgenommen (Bericht `sichtabnahme-2.md`), in Runde 3 übernommen | 14 |
| In Runde 3 neu abgenommen | 5 |
| **Abgenommen von 19** | **19** |
| Zusätzlich abgenommener Zustand (gruppenchat-melden) | 1 |

- Die 12 Hauptansichten aus AUFTRAG Z-04 erreichen alle im Median mindestens 8, und keine Kategorie liegt unter 7: Surenansicht, Koran-Übersicht, Hadith-Buch, Elifbe-Buchstabe, Lernen-Hub, Gebetszeiten „Mein Ort“, Schüler-Start, Eltern: Kind, Anwesenheit, Gruppenchat, Projekte fertiggestellt und Seiten-Editor. **Damit ist Z-04 erfüllt.**
- Die 14 Ansichten aus Runde 2 habe ich ohne Neubewertung übernommen. Grundlage ist die Begründung zum Umfang in Runde 2 (§3, „Verfahren für Runde 3“): `Text` ist opt-in, `Seitenrahmen` bekommt nur eine Prop, und `BausteinListe` und `SeitenFormular` gehören nur zum Editor.
- Vorbehalt: Die Restbefunde X-13 und GC-7 unten berühren gemeinsame Bauteile. Werden sie umgesetzt, müssen schueler-start und koran-uebersicht stichprobenartig nachgesehen werden.
- **Nächster Schritt laut PRÜFPUNKT:** Stufe C, BERICHT mit Galerie, ABSCHLUSS.

## 3. Bestätigte Befunde

Ein Befund gilt als bestätigt, wenn ihn mindestens zwei Juroren nennen. Ein Befund mit „hoch“ reicht mit einem Juror, muss aber im Bild belegt sein.

- **In nicht abgenommenen Ansichten gibt es keine Befunde, weil keine Ansicht offen ist.**
- Befunde mit „hoch“ gibt es ebenfalls keine.

Die folgenden Restbefunde sind bestätigt, **blockieren die Abnahme aber nicht**. Sie sind als optionales Feinschliff-Paket gedacht. Vier davon habe ich im Bild geprüft, alle vier sind belegt:
- `hadith-buch-390-sprung.png`: „Nach oben“ liegt über einer arabischen Zeile von Hadith 29.
- `gruppenchat-390-oben.png`: Links steht der Rest „eg“, rechts ein halbes Konto-Symbol.
- `gruppenchat-melden-390-oben.png`: Der Dialog ist randlos, aber an allen vier Ecken gerundet. „Unangemessener Inhalt“ ist vorausgewählt, und die Zeile mit 116 111 ist sichtbar höher.
- `seiten-editor-390-werkzeug.png`: Das Menü flattert in der Folge 2-2-1-1-1.

### Befunde, die mehrere Ansichten betreffen

| ID | Befund | Ansichten (Juroren) | Datei und Stelle | Kleinste Abhilfe |
|---|---|---|---|---|
| X-12 | Die Null hat einen Schrägstrich oder Punkt in Zeiten und Daten | hadith (J1, J3), gruppenchat (J1, J3), projekte (J1), bestand (J3); in R2 auch startseite und gebetszeiten | `app/schriften.ts` (Atkinson Hyperlegible Next) | Ist **eine Entscheidung, kein Mangel**. Laut R2 hat die Schrift kein Feature `zero`, Abhilfe brächte nur eine eigene Ziffernschrift (eigenes `@font-face` mit `unicode-range: U+0030-0039`). Juroren aller drei Plätze nennen das inzwischen, deshalb gehört es in ENTSCHEIDUNGEN. |
| X-13 | In der Hilfezeile ist die Zeile mit „116 111“ höher als die übrigen | gruppenchat-melden (3), gruppenchat (J3) | `components/chat/ChatFenster.tsx` Z. 518–531 (`Hilfe`), der Link ist `inline-flex min-h-11 align-middle` (Z. 525) | Die Nummer als eigene Zeile setzen: `inline-flex … align-middle` wird zu `flex w-fit`. Die Zielgröße von 44 px bleibt erhalten. |
| X-14 | Die Statuspille in der unteren Leiste wirkt bei 390 wie ein gesperrter Knopf und ist mehrdeutig („Entwurf“, „Veröffentlicht“) | seiten-editor (J2), bestand (J1, J2) | `components/verwaltung/seiten/SeitenFormular.tsx` Z. 551 | Statt der Pille kurzen Text ohne Füllung zeigen (`text-16 text-tinte-2`), etwa „wird veröffentlicht“ oder „speichert als Entwurf“. |
| X-15 | Der Übersetzungs-Aufklapper läuft bei 390 über drei fette Zeilen | seiten-editor (3), bestand (J3) | `messages/verwaltung/seiten.json` Z. 150 (`uebersetzungen`) und Z. 79 (`abschnittUebersetzungen`); Gewicht aus `components/verwaltung/Klappe.tsx` Z. 27 | Text kürzen auf „Übersetzungen (TR, EN)“. Das Gewicht nur hier über `kopfKlasse` senken (`BausteinListe.tsx` Z. 370), denn `Klappe` wird in der ganzen Verwaltung genutzt. |

### Befunde je Ansicht (Anzahl Juroren in Klammern)

**hadith-buch** (gesamt 8; Mobil 7)
- **HB-8:** „Nach oben“ verdeckt bei 390 Inhalt, nämlich arabische Zeilen und „Link kopieren“ (3, mittel). Im Bild belegt.
  - Stelle: `components/website/NachOben.tsx` Z. 33–35. Dasselbe Bauteil nutzen `app/[locale]/(website)/quran/page.tsx` und `components/verwaltung/seiten/BausteinFelder.tsx`.
  - Abhilfe: Unter sm nur ein runder Symbolknopf (`max-sm:size-12 max-sm:px-0`, Text `max-sm:sr-only`). Dazu in `components/website/hadith/BuchAnsicht.tsx` unter der Liste `max-lg:pb-20`.
- **HB-9:** Bei 390 steht oben nur „Nächstes Buch“. „Vorheriges Buch“ und eine zweite Karte mit Umfang und Nummern folgen erst nach 51 Karten (3, mittel/niedrig/mittel).
  - Stelle: `BuchAnsicht.tsx` Z. 41–47 (`weiter`) und Z. 87–108 (kompakte Karte). Die doppelte Karte ist das `dl` in Z. 133.
  - Abhilfe: In der kompakten Karte zusätzlich `daten.vorher` als Link links zeigen und das `dl` mit `max-lg:hidden` ausblenden.
- dazu X-12 (J1, J3).
- *Nicht bestätigt:*
  - Kopf bei 1440 rechts leer (J1).
  - Kartenkopf bricht um, Sprungpille ohne aktiven Abschnitt, Krume „…“ zu klein (je J2).
  - „Link kopieren“ zu grün, Werbeblock im Fuß (je J3).

**projekte-fertiggestellt** (gesamt 8; Hierarchie und Mobil je 7)
- **PF-6:** „Fertiggestellt“ steht doppelt, einmal im Foto und einmal neben der Kennung (3, mittel/niedrig/niedrig).
  - Stelle: `components/website/projekte/Bauprojekt.tsx` Z. 62–64 (Plakette im Bild).
  - Abhilfe: Die Plakette im Bild bei `fertig` weglassen.
- **PF-7:** Der Achtstern mit Haken vor der H1 fehlt bei 390 (3, mittel/niedrig/mittel).
  - Stelle: `app/[locale]/(website)/projekte/page.tsx` Z. 47 mit `max-sm:hidden`.
  - Abhilfe: `max-sm:hidden` entfernen und `size-10 md:size-16` setzen.
- **PF-8:** Gestrichelte Platzhalter zerfallen im Fließtext beim Umbruch in Teilrahmen (3, mittel/niedrig/niedrig).
  - Stelle: `components/website/Platzhalter.tsx` Z. 17. `box-decoration-clone`, das J2 vorschlägt, ist dort schon gesetzt.
  - Abhilfe: Den Rahmen durch eine getönte Fläche und eine gestrichelte Unterstreichung ersetzen (`bg-sand underline decoration-dashed underline-offset-4`). `data-platzhalter` bleibt, damit gilt das R2-Kriterium weiter.
- **PF-9:** Unter der Fortschrittsleiste haben nur Punkt 1 (linksbündig) und Punkt 2 (zentriert) ein Datum (3, mittel/niedrig/niedrig).
  - Stelle: `components/website/projekte/Meilensteine.tsx` Z. 145–167. Reine Platzhalter fallen weg, und `-ml-4` richtet Punkt 1 aus.
  - Abhilfe: Die Datumszeile ganz streichen, die Daten stehen in der Liste darunter.
- **PF-10:** Im Spendenteil stehen zwei Überschriften hintereinander (3, niedrig/mittel/mittel).
  - J1 nennt dazu den doppelten Satz und den Schatten der Karte, J2 die vertauschte Rangfolge der Knöpfe.
  - Stelle: `components/website/projekte/Spenden.tsx` Z. 29–31 (`shadow-s2`, H3 serifenlos und fett) und `Unterstuetzen.tsx` Z. 37–54.
  - Abhilfe: Die H3 wird ein kleines Etikett „Spendenkonto“ ohne Symbol, und `shadow-s2` entfällt (nur Rand). Optional, weil nur J2 es nennt: „Jetzt spenden“ als gefüllten Hauptknopf zuerst stellen.
- *Nicht bestätigt:* zweispaltige Kacheln bei 390 (J1), Mint-Fläche und Zielscheiben-Symbol (je J3).

**gruppenchat** (gesamt 8; Raster und Mobil je 7)
- **GC-6:** „Melden“ hängt an der Breite der jeweiligen Blase. Bei 1440 steht der Knopf deshalb einmal bei x ≈ 930 und einmal bei x ≈ 780 (3, mittel).
  - Stelle: `components/chat/ChatFenster.tsx` Z. 270–274. Das `li` ist `max-w-text self-start` und damit so breit wie die Blase.
  - Abhilfe: Fremde Nachrichten bekommen `w-full`. Das Kopfraster aus R2 (Z. 288) richtet „Melden“ dann an der Kante der Spalte aus.
- **GC-7:** Die Bereichsleiste ist bei 390 angeschnitten: Links steht der Rest „eg“, rechts ein halbes Konto-Symbol (3, mittel). Im Bild belegt.
  - Stelle: `components/mein-bereich/BereichLeiste.tsx` Z. 9 und 49. Mit `scroll-px-12` und Snap bleiben am linken Rand 48 px des vorigen Eintrags stehen.
  - Abhilfe: `scroll-px-4` setzen und den Verlauf auf etwa 16–24 px kürzen (`VERLAUF` und die Masken in Z. 49).
  - Dasselbe Bauteil steckt in schueler-start (R2: 2 Juroren).
- **GC-8:** Im Regelkasten bei 1440 laufen Regelliste und Hilfe nur über `max-w-text`, rechts bleiben etwa 350 px leer (J1, J2, mittel).
  - Stelle: `ChatFenster.tsx` Z. 331 (Kasten), Z. 494 (`ul`) und Z. 335 (`Hilfe`).
  - Abhilfe: Den Kasten selbst auf `max-w-text` begrenzen.
- **GC-9:** Das gesperrte „Senden“ zeigt Weiß auf hellem Grün, etwa 2:1 (J1, J2, niedrig).
  - Stelle: `ChatFenster.tsx` Z. 375 mit `disabled:opacity-50`.
  - Abhilfe: Den Stil des gesperrten Felds aus Z. 369 übernehmen: `disabled:opacity-100 disabled:border-2 disabled:border-dashed disabled:bg-sand disabled:text-tinte-2`.
- **GC-10:** Die Regeln r3 und r7 enden ohne Punkt (J1, J3, mittel/niedrig).
  - Ursache: Die Aufteilung aus GC-4 trennt dort mitten im Satz.
  - Stelle: `messages/bereiche/chat.json` → `chatRegeln.regeln.r3` und `.r7`. Bei Erwachsenen ebenso `erwachsen.regeln.r1`, dazu `r3` mit Doppelpunkt (Erwachsenen-Kanal).
  - Abhilfe: Das Stichwort am Satzende teilen, der Wortlaut bleibt unverändert. Danach das R2-Kriterium „Regelblock bei 390 höchstens 600 px“ nachmessen.
- **GC-11:** Das Schild-Symbol im Kasten „Schreiben geht von … bis … Uhr“ ist bei 390 sehr klein und steht mittig vor zwei Zeilen (J2, J3, niedrig).
  - Stelle: `app/[locale]/(konto)/mein-bereich/gruppen/[id]/chat/page.tsx` Z. 211–212. Dem Symbol fehlt `shrink-0`, deshalb schrumpft es beim Umbruch.
  - Abhilfe: `items-start` setzen und dem Symbol `mt-0.5 size-5 shrink-0` geben.
- dazu X-12 (J1, J3) und X-13 (J3).
- *Nicht bestätigt:* geschütztes Leerzeichen vor „Uhr“ und Kontrast der fremden Blasen (je J1), Regelschrift 14 px (J2; der Code setzt `text-16`).

**gruppenchat-melden** (gesamt 8; Raster und Mobil je 7)
- **GM-1:** Der Dialog ist bei 390 randlos über die volle Breite gelegt, hat aber vier runde Ecken (3, mittel/niedrig/mittel). Im Bild belegt.
  - Stelle: `ChatFenster.tsx` Z. 430. `max-w-dialog` (42,5 rem) überschreibt die Randbegrenzung des Browsers.
  - Abhilfe: `max-w-[min(var(--container-dialog),calc(100%-2rem))]`.
- **GM-2:** „Unangemessener Inhalt“ ist vorausgewählt (J1, J2, niedrig/mittel). Im Bild belegt.
  - Stelle: `ChatFenster.tsx` Z. 420, `useState(…)('unangemessen')`.
  - Abhilfe: Startwert `null`. Fehlt die Wahl beim Senden, erscheint eine Fehlermeldung an der Gruppe (`role="alert"`).
- **GM-3:** = X-13 (3, niedrig). Im Bild belegt.
- *Nicht bestätigt:* ungleich breite Knöpfe (J1), fehlendes Schließen-X (J2), kühler Abdunkelungshintergrund (J3).

**seiten-editor** (gesamt 8; Mobil 7)
- **SE-8:** Das aufgeklappte „…“-Menü bei 390 ist Flattersatz mit Knöpfen ungleicher Breite (3, mittel/niedrig/mittel). Im Bild belegt.
  - Stelle: `components/verwaltung/richtext/Werkzeugleiste.tsx` Z. 252 mit `flex flex-wrap gap-2`.
  - Abhilfe: `grid grid-cols-2 gap-2`, die Knöpfe im Menü `w-full justify-start`.
- **SE-9:** Bei 390 stecken drei Kartenebenen ineinander. Die Felder sind nur etwa 250–300 px breit, und die Bildbeschreibung ist abgeschnitten (3, mittel).
  - Stelle: `components/verwaltung/seiten/SeitenFormular.tsx` Z. 57 (`Abschnitt`) und `components/verwaltung/seiten/BausteinFelder.tsx` Z. 185 (`mtext('alt', …)`).
  - Abhilfe: Am Abschnitt `max-sm:border-0 max-sm:bg-transparent max-sm:p-0` setzen und die Bildbeschreibung mehrzeilig anlegen.
- **SE-10:** = X-15 (3, niedrig).
- **SE-11:** Die Abschnittsnummern 1–4 sind grüne Kreise statt der Achtstern-Schrittmarke (J1, J3, niedrig).
  - Stelle: `SeitenFormular.tsx` Z. 59–65.
  - Abhilfe: Die Achtstern-Marke aus `components/formular/FormWizard.tsx` (Z. 16 ff.) übernehmen.
- dazu X-14 (J2).
- *Nicht bestätigt:* Adresspfad bricht am Bindestrich (J1), Feldbreiten uneinheitlich (J2), Werkzeugleiste bei 1440 zu dicht (J3).

**seiten-editor-bestand** (gesamt 8; Mobil 7)
- **SB-6:** Acht rot umrandete Papierkörbe bilden die lauteste Spalte der Liste (3, niedrig/niedrig/mittel).
  - Stelle: `components/verwaltung/seiten/BausteinListe.tsx` Z. 349. „Dauerhaft Erdrot“ ist die Umsetzung von R2 SE-5.
  - Das ist **dieselbe Pendelbewegung wie GC-2 → GC-3**. Der Anlass aus R2 („sieht aus wie Zuklappen“) ist entfallen, weil jetzt der Kopf selbst auf- und zuklappt.
  - Abhilfe: Neutraler Rand (`border-rand text-tinte-2`), Rot erst bei `hover` und `focus-visible`.
- **SB-7:** Bei 390 bekommt jeder zugeklappte Baustein eine eigene Knopfzeile mit ↑ ↓ und Papierkorb. Die Liste wird etwa doppelt so hoch, und Titel brechen um (J1, J3, mittel; J2 teilweise).
  - Stelle: `BausteinListe.tsx` Z. 285 (`basis-60`) und Z. 318 (Knopfgruppe).
  - Abhilfe: Unter sm die Knopfgruppe nur zeigen, wenn der Baustein offen ist (`max-sm:hidden`, solange er zu ist).
- dazu X-14 (J1, J2) und X-15 (J3).
- *Nicht bestätigt:*
  - Seitenname nur als Unterzeile und Vorschau-Kasten vor dem Formular (J1, mittel).
  - Platzhalter in Baustein 1 ohne Warnmarke (J2, mittel).

### Empfehlung

- Für die Abnahme ist kein Paket nötig.
- Wer den Feinschliff macht, sollte ihn auf einfache Änderungen von einer oder zwei Zeilen beschränken:
  - X-13, X-14
  - GC-6, GC-9, GC-11
  - GM-1, GM-2
  - SE-8
  - SB-6
  - PF-6, PF-7
- Danach genügt eine Sichtprüfung als Stichprobe an den betroffenen Aufnahmen statt einer vollen Runde.
- X-12 als Entscheidung in `_gemeinde/ENTSCHEIDUNGEN.md` festhalten.

Quellen: `/home/user/IGMG/_gemeinde/berichte/sichtabnahme-2.md`, Aufnahmen in `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/sicht3/bilder/`
