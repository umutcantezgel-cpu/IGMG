# L8-02 – Leistung und Zugänglichkeit der Lern-App (fortgeschrieben Stufe C N8, N9a und N9b, 26.10.2026)

| | |
|---|---|
| Datum | 24.10.2026 |
| Paket | L8-02 (PLAN §14 L8), Abnahme Z-L07 (Leistung) und Z-L06 (axe-Anteil) |
| Stand | Zweig `lernapp-l8`, Messbau aus `4d00cadf` (Merge `claude/trusting-lovelace-6nfolz` mit SL2-Rest `ac219eb0`); nach der Gegenprüfung Behebung B-2 (`ebaa9d5a`) und Netzprotokoll aus `fd11a59d` (Lauf 3) |
| Werkzeuge | `_lernapp/werkzeuge/leistung/` (Kopien und Anpassungen von `_gemeinde/werkzeuge/`, dort unverändert), `web/scripts/lernapp-budget.mjs`, `web/scripts/messen.mjs` |
| Rohdaten | außerhalb des Repos (`<scratchpad>/l8-leistung/lauf1/`, `…/lauf2/` und `…/lauf3/`): `lauf.log` mit `uptime` je Schritt, JSON und Markdown je Werkzeug, Lighthouse-Berichte des ersten Laufs je Route |

**Ergebnis (24.10.2026, Testkurs; Stand mit echten Inhalten siehe unten):** Nach der Behebung B-1 erfüllen alle 25 Lighthouse-Routen Leistung ≥ 90, Zugänglichkeit 100, LCP ≤ 2,5 s
und CLS ≤ 0,1; alle INP-Szenarien ≤ 200 ms (CPU ×6, unter Last); axe 0 Befunde auf 136 + 22 Prüfungen; alle JS-Budgets
nach KERN §9 eingehalten; Whisper lädt nur nach Klick und nach der Behebung B-2 (Gegenprüfung) jede der 10 Dateien genau
einmal bis „bereit“ samt Probelauf; Abgleich mit 200 gleichzeitigen Konten ohne Fehler und idempotent. Offen bleiben
Hinweise (TBT, Antwortzeit des Abgleichs unter Spitzenlast, Probelauf auf einem echten Mittelklasse-Telefon) und der
veraltete Wortlaut von Z-L07 (Abschnitt 10).

## Stufe C, 26.10.2026, INP des Lernpfads nach N9a (Gegenprüfung N8 Nr. 5a/5b)

| | |
|---|---|
| Stand | Zweig `lernapp-n9a`; Messbau A = `2d6c1adc` (N8 gemergt, „vorher“), B = `6aafb2e9` (N9a ohne die Behebung unten), C = `6b818c32` (Endstand: `4f1da4a5` + Merge PRÜFPUNKT) |
| Werkzeug | `_lernapp/werkzeuge/leistung/inp-spieler.mjs --echt` (CPU ×6, Telefon 390 px mit Berührung, 3 Läufe, Median; neu das Szenario „Stufe aufklappen“), Spur per CDP (Zeitleiste und CPU-Profil) für die Ursachen |
| Bau und Server | je Messbau ein Produktionsbau unter dem gemeinsamen Schloss, Server auf Port 3312, Datenbank `igmg_lernapp_n9a_e2e`; Rohdaten außerhalb des Repos (`<scratchpad>/tmp-n9a/sitzung/mess-{vorher,nachher}`, `…/s2/mess-{zwei,zwei-b}`) |

### N9a.1 INP (CPU ×6, 3 Läufe, Median, ms; Last = 1-min-Mittel max.)

| Szenario | A (vorher) | B | **C (nachher, Lauf 1)** | **C (Lauf 2)** | je Schritt C (Median) | Ergebnis C |
|---|---|---|---|---|---|---|
| Lernpfad öffnen (Start → `tr-aus-de`) und Einheit offline speichern | 320 (offline speichern 216 · öffnen 320), Last 1,41 | 232 (offline speichern 232 · öffnen 156), Last 1,70 | **208**, Last 1,19 | **160** (nachgemessen; erst 216 bei Last 1,91), Last 1,45 | offline speichern **152 / 160** · Lernpfad öffnen 208 / 80 | offline speichern erfüllt; Szenario einmal erfüllt, einmal 8 ms darüber (Startseite, s. u.) |
| Lernpfad öffnen und Stufe A2 aufklappen (neu, Nr. 5b) | 224, Last 1,35 | 216, Last 1,22 | **168**, Last 1,22 | **176**, Last 1,75 | Stufe aufklappen 168 / 176 | erfüllt |
| zum Vergleich ohne Codeänderung: Spieler A1 / B1 / ar | 176 / 192 / 232 | 192 / 200 / 176 | 192 / 216 / 192 | 200 / 168 / 208 | – | Rauschen ± 30 ms zwischen Durchgängen |

Je Lauf C (Dauer, davon Eingabeverzögerung): „offline speichern“ 216/112/152 und 120/160/176 ms bei **6–14 ms Verarbeitung**
(A und B: 32–132 ms); „Stufe aufklappen“ 112/216/168 und 152/176/176. „Lernpfad öffnen“ ist das Antippen der Kurskarte auf
der Startseite, noch während sie hochfährt (N8.4, N8.7 Nr. 1): fast nur Eingabeverzögerung (C 203 ms bei 5 ms Verarbeitung,
in fünf von sechs gezählten Läufen unter 100 ms bzw. nicht gemeldet); am Lernpfad liegt es nicht.

### N9a.2 Ursachen (Spur, CDP-Zeitleiste und CPU-Profil, Messbau B′ = B mit der Schätzhöhe aus `4f1da4a5`)

1. **Der Klick auf „Einheit offline speichern“ selbst:** React übernahm den Wechsel vom Knopf zum Ring noch im Klick
   (Mikroaufgabe nach dem Ereignis: 76–85 ms bei CPU ×6, fast ganz `commitMutationEffects`, dazu `focusout` und erzwungener
   Stil, weil der fokussierte Knopf das Dokument verlässt). Auch auf einer ruhigen Seite (3 s nach dem Öffnen, alle Häppchen
   fertig) blieb der Klick bei 168–208 ms – das automatische Speichern läuft dagegen in `laden()` vor „bereit“ und hat keinen
   Anteil.
2. **Häppchen durch Bildlauf:** Playwright (wie ein Mensch) blättert zum Knopf und tippt Augenblicke später. Seit N9a löste
   der Bildlauf die übrigen Stationen aus; Rendern in Zeitscheiben, dann eine Übernahme mit Stil und Layout (≈ 120 ms bei
   CPU ×6), die in das Tippen fiel (Eingabeverzögerung bis 203 ms beim Aufklappen einer Stufe).
3. **Fester Anteil je Tippen** (nicht behoben, ≈ 100–150 ms bei CPU ×6 auf ruhiger Seite): Berührungs- und Mausersatz-
   Ereignisse laufen durch die Ereignisverteilung von React (`pointerover`, `pointerdown`, `mouseover`, … je 2–15 ms),
   Trefferprüfung (`HitTest` 4–7 ms je Ereignis) und das Bild danach (Paint, Layerize). Ein Teil ist Werkzeug-Aufwand
   (Playwright prüft das Ziel mit `elementsFromPoint` und eigenen Hörern).

### N9a.3 Behebungen (Endstand C)

| Commit | Änderung | Wirkung |
|---|---|---|
| `4f1da4a5` | „Einheit/Stufe offline speichern“: Der Klick zeichnet zuerst nur den gedrückten Knopf (`druck`); Ring, Meldung und Speichern folgen nach dem nächsten Bild (`nachDemBild`), zweites Tippen vorher startet nichts | Verarbeitung des Klicks 6–14 statt 32–132 ms; offline speichern 152/160 statt 216/232 ms |
| `4f1da4a5` | Lernpfad-Häppchen nur noch nach Klick, Taste oder Ruhezeit (1,5 s), nicht mehr nach Bildlauf oder Rad; der Browser hält beim späteren Einfügen die Ansicht an ihrem Platz (Scroll Anchoring) | Stufe aufklappen 168/176 statt 216/224 ms |
| `acc972ee` (B) | weitere Häppchen erst nach der ersten Eingabe bzw. Ruhezeit und dem nächsten Bild; Aufklappen als Übergang | Lernpfad öffnen 156 statt 320 ms (B); allein nicht genug (B: 232/216 ms) |

Budgets (KERN §9, `lernapp-budget.mjs`, Messbau C): Lernpfad 160,3 KB gesamt (≤ 180), eigener Anteil 25,0 KB (≤ 30; N8 C:
158,5 / 23,2 – „Stufe offline speichern“ und Kursstand); Spieler +54,5 KB, ungünstigste echte erste Aufgabe +58,4 KB (≤ 60);
Start 149,5 KB, Hülle 9,7 KB. Alle Budgets eingehalten, unverändert gegenüber B.

**Z-L07 (INP-Teil) nach N9a:** Lernpfad-Szenarien im Schritt erfüllt (offline speichern 152/160, Stufe aufklappen 168/176 ms);
das Szenario „Lernpfad öffnen + offline speichern“ insgesamt einmal 208 ms (Antippen der noch hochfahrenden Startseite,
N8.7 Nr. 1) und einmal 160 ms. Die Spieler-Szenarien (ohne Codeänderung) streuen zwischen den Durchgängen um ± 30 ms um die
Grenze; Z-L07 bleibt wegen Lighthouse-Leistung (N8.3) und dieser Streuung **teilweise**.

**Nachtrag N9a (Fortsetzung 2, Bau `e6409f71`, 26.10.2026 17:52 UTC):** Nach dem Merge von `1482184c` („Sprachen lernen“ im
Website-Kopf) und der Nachbesserung im Lern-App-Worker (überholter Worker schreibt und löscht nichts, `e6409f71`) dieselben
Budgets wie Messbau C: Lernpfad 160,3 / 25,0 KB, Spieler +54,5 KB, ungünstigste echte erste Aufgabe +58,4 KB, Start 149,5 KB,
Hülle 9,7 KB – alle eingehalten. INP nicht neu gemessen: Geändert sind nur der Service Worker (eigener Thread, kein Code im
Hauptthread des Lernpfads) und Tests.

**Nachtrag Gegenprüfung N9a (Fortsetzung 3, Bau `dee0ace6`, 26.10.2026 18:46 UTC):** Geändert im Hauptthread:
`speichereOffline` lädt je Einheit erst die Töne, dann das Paket (Häppchen wie bisher: vor jedem Bündel und Paket
`nachgeben`), „Stufe offline speichern“ zeigt Abbruch und Fehler sichtbar und nennt den Rest-Bedarf ohne schon gespeicherte
Töne. Neu gemessen mit `inp-spieler.mjs --echt` (CPU ×6, Telefon 390 px, 3 Läufe, Median; Server Port 3312, Datenbank
`igmg_lernapp_n9a_e2e`; Rohdaten `<scratchpad>/tmp-n9a/s4/mess-vier`), neu das Szenario für den Stufen-Knopf (Gegenprüfung
N9a: bis dahin war „beide Knöpfe ≤ 200 ms“ in ADR 0039 nur für den Einheiten-Knopf belegt):

| Szenario | INP Median | je Schritt (Median) | Läufe | Last max | Ergebnis |
|---|---|---|---|---|---|
| Lernpfad: Stufe A1 offline speichern und mitten im Speichern abbrechen (neu) | **160** | Stufe offline speichern **152** · Speichern abbrechen **136** | 160 / 136 / 192 | 1,52 | erfüllt |
| Lernpfad öffnen (Start → `tr-aus-de`) und Einheit offline speichern | **200** | Lernpfad öffnen 196 · offline speichern **144** | 200 / 192 / 216 | 1,38 | erfüllt (Grenzwert) |
| Lernpfad öffnen und Stufe A2 aufklappen | **112** | Stufe aufklappen 112 | 88 / 120 / 112 | 1,56 | erfüllt |
| zum Vergleich ohne Codeänderung: Spieler A1 / B1 / ar | 168 / 216 / 184 | – | – | 1,32 | Streuung wie N9a.1 (B1 über der Grenze) |

Je Klick bleibt die Verarbeitung klein (Stufe speichern 4–5 ms, abbrechen 14/18/29 ms, Einheit speichern 5–7 ms); der Rest ist
Eingabeverzögerung (Häppchen des laufenden Speicherns bzw. die Takte der Stationen nach der ersten Eingabe). „Abbrechen“ lag
in allen Läufen mitten im Speichern (die Meldung „Speichern abgebrochen“ kam, der Knopf stand also noch). Der Lauf mit 216 ms
im Einheiten-Szenario ist das Speichern selbst (165 ms Eingabeverzögerung bei 7 ms Verarbeitung), Median 144 ms.

Budgets (`lernapp-budget.mjs`, derselbe Bau): Lernpfad 160,4 / 25,1 KB (≤ 180 / 30), Spieler +54,6 KB, ungünstigste echte
erste Aufgabe +58,5 KB (≤ 60), Start 149,5 KB, Hülle 9,8 KB – alle eingehalten (je +0,1 KB).

Offene Punkte (eigens geführt, Gegenprüfung N9a): (1) **Startseiten-Anteil** (N8.7 Nr. 1) – „Lernpfad öffnen“ ist das Antippen
der noch hochfahrenden Startseite (hier 194/182 ms Eingabeverzögerung bei 7–8 ms Verarbeitung); das Szenario hält die Grenze
in diesem Durchgang knapp (200 ms), in C einmal nicht (208 ms). Es liegt nicht am Lernpfad; zu messen wäre es getrennt mit
einer Wartezeit nach der Hydration bzw. zu beheben auf der Startseite. (2) Streuung der Spieler-Szenarien ohne Codeänderung
(± 30 ms um die Grenze). Z-L07 bleibt **teilweise**.

Prüfungen zu diesem Nachtrag: Unit `tests/unit/lernapp` 76 Dateien, 2067 grün (1 todo); Typen sauber; alle Lern-App-E2E
(`tests/e2e/lernapp`, `mein-bereich-lernen.spec.ts`, telefon und desktop) gegen denselben Bau an `75ad9038`: 114 grün, 0 rot,
34 übersprungen (projektbedingte Ausschlüsse wie zuvor), 10,7 min.

## Stufe C, 26.10.2026, Zugänglichkeit und Datenfluss (N9b)

| | |
|---|---|
| Paket | Stufe C N9b: Z-L06 (axe-Matrix, axe je Übungstyp, echte Tastaturwege, Ansage der 15 s) und Z-L08 (Datenfluss mit echtem Modell, Netzprotokoll), Befunde aus `protokolle/C-e2e*.md`; Nacharbeit nach der Gegenprüfung |
| Stand | Zweig `lernapp-n9b`. Bau 1 aus `515a463f` (18:05 UTC, Beleg Z-L08, INP-Probe, volle Lern-App-E2E); Bau 2 aus `8e250aa4` (19:03 UTC, nach der Gegenprüfung: Tastaturhelfer, axe für `schrift_latein`, INP nachgemessen, volle Lern-App-E2E); Bau 3 und 4 aus `5b9de3fe` bzw. `d52a4133` (gebaut als `19f73636`, gleicher Baum, nur die Commit-Nachricht berichtigt; 19:36 und 19:48 UTC, nur `zugaenglichkeit.spec.ts` nach Korrekturen am neuen Test). Der App-Code der Bauten 2–4 ist der von Bau 1 bis auf Kommentare in `Sprechen.tsx`. Bau 5 aus `78f79978` (20:29 UTC, Runde 3 nach dem Merge von N9a: Ansage in `Sprechen.tsx`, volle Lern-App-E2E und Budget, Abschnitt N9b.5) |
| Bauten | je ein `pnpm build` ohne `E2E_ATTRAPPEN` (echter `whisper.worker.mjs`, 693 KB mit Lizenzkopf) unter dem Bauschloss; für die E2E danach nur der Worker gegen die Attrappe getauscht (`E2E_ATTRAPPEN=1 pnpm lernapp:modelle`, die einzige Bauausgabe, die davon abhängt). Wegwerf-Datenbank `igmg_lernapp_n9b_e2e`, Server auf 3322 (Werkzeuge) bzw. 3321 (E2E) |
| Rohdaten | außerhalb des Repos (`<scratchpad>/n9b/`): `tor.status`, `tor2.status`, `tor3.status`, `bau*.log`, `whisper-netz.txt` und `mess/whisper-netz.json`, `budget*.txt`, `inp-probe.txt`, `inp-nach.txt` mit `mess2/inp-nach.{md,json}`, `e2e.log`, `e2e2.log`, `e2e3a.log` (Bau 3), `e2e3.log` (Bau 4) mit `e2e-ergebnis*/ergebnis.json` |

**Ergebnis:** Z-L06 (Anteil axe und Tastatur) und Z-L08 (Netzprotokoll) sind belegt. axe-Matrix über alle Lern-App-Routen
mit echten Inhalten × de/tr/ar × 390/1440 und axe je Übungstyp auf beiden Breiten: 0 ernste oder kritische Befunde. Jede
Typgruppe ist nur mit Tasten spielbar, auch in `rtl`; zwei Mängel im Code sind behoben. Die Sprechübung sagt die 15 s vorher
an. Datenfluss mit echtem Modell bis zum Erkennungsergebnis: nur GET an den eigenen Ursprung, 0 fremde Hosts, 0 Cookies,
alle 11 Download-Dateien je genau einmal am Draht. Budgets eingehalten, INP der nachgemessenen Szenarien ≤ 200 ms. Volle
Lern-App-E2E beider Projekte nach der Gegenprüfung: 143 bestanden, rot nur der neue `schrift_latein`-Test (Fehler im Test),
der nach zwei Korrekturen mit der ganzen `zugaenglichkeit.spec.ts` grün ist (N9b.4). Offen bleiben die Screenreader-Prüfung
(LM-19), die Wortschatz-Insel und die Bestätigung von L3-E17.

### N9b.1 Zugänglichkeit (Z-L06)

- **axe-Matrix** (`tests/e2e/lernapp/zugaenglichkeit.spec.ts`, WCAG 2.0/2.1/2.2 A und AA ohne Ausschlüsse, ernste und
  kritische Befunde gezählt, dazu kein waagrechter Überlauf): je Oberfläche de/tr/ar und Breite 390/1440 Auswahl (alle
  Ausgangssprachen aufgeklappt), Start, Einstellungen, Quellen, Anmelden, Gruppe, 404; Lernpfad mit aufgeklappter Stufe,
  Spieler einer echten Lektion vor und nach der Antwort, Tipps, Einstufung (Start, erste Frage); mit eingelesenem Lernstand
  Start, Wiederholen mit fälligen Karten vor und nach der Antwort, Wortschatz, Fortschritt; Wissenskurs (Lernpfad mit Inhalt,
  erste Aufgabe vor und nach der Antwort) und Koran-Kurs (in ar die 404). Das sind 22 Prüfungen je Oberfläche und Breite,
  132 zusammen; dazu `schrift_latein` (unten) mit 6 je Breite. **Ergebnis: 0 ernste oder kritische Befunde, kein Überlauf.**
  Die Wortschatz-Seite zeigt auch mit Lernstand nur den Leerzustand (die Insel mit den Wörtern ist nicht eingehängt); die
  Matrix prüft dort nur die Hülle – eine Produktlücke außerhalb von N9b.
- **axe je Übungstyp auf beiden Breiten:** alle Typen. `typen-a`, `typen-b`, `typen-wissen`, `lektion` (paare, wortbank
  über `spieleLektion1 { axe }`), `harakat` und `koran_wort` wie bisher bzw. in N9b auf das Telefon erweitert; als
  einziger fehlte danach `schrift_latein` (Gegenprüfung), seither in `zugaenglichkeit.spec.ts` mit echten
  Vorkurs-Lektionen (de-aus-ar, Oberfläche ar): Buchstabe mit Vorgabe vor der Antwort, nach falscher und nach richtiger
  Antwort, groß/klein. Aufgaben nur mit Hörbeispiel baut der Paketbau ohne Aufnahme nicht ein (`paket/bauen.ts`), im E2E
  fehlt das Vorkurs-Audio; ihr Abspieler ist der der Hörtypen und dort geprüft.
- **Echte Tastaturwege** (`tastatur.spec.ts`, nur Tab, Umschalt+Tab, Enter, Leertaste, Pfeile, kein `locator.focus()`;
  jeder Tab-Halt sichtbar, mit Fokusring und in Dokumentreihenfolge bzw. Leserichtung, auch `rtl`): L1 Lernpfad → Lektion 1,
  L2-01 (l03), L2-02 de und ar (Nachspuren „auf Papier geschrieben“ per Tastatur), Vorkurs `schrift_latein`, Wissenstypen,
  Wiederholen bis „fertig“ mit axe vor und nach jeder Antwort, Fokusreihenfolge ganzer Seiten in de/ar auf beiden Breiten.
  Zwei Mängel im Code behoben (`733a6db4`: Antwortfelder ohne sichtbaren Fokusring, Fokusverlust in der Sprechübung).
  Nach der Gegenprüfung: Tab wandert in `<audio controls>` durch die eingebauten Knöpfe, `document.activeElement` bleibt
  dasselbe Element; der Helfer zählt diese Halte als einen und meldet erst mehr als 10 hintereinander als Fokusfalle (der
  Fehlalarm „audio → audio“ machte L2-02 de/ar in Bau 1 rot). Als Fokusring zählt nur noch ein sichtbarer Umriss ≥ 2 px,
  kein Schatten (dauerhafte Kartenschatten hätten einen fehlenden Ring verdeckt).
- **Sprechen, 15 s:** sichtbar unter dem Knopf (`aria-describedby`), Ansage beim Start und beim Ende von selbst
  (`2753f5a0`, Test „Höchstlänge 15 s“ in `typen-b.spec.ts`). Einordnung gegen WCAG 2.2.1 als Vorschlag in ENTSCHEIDUNGEN
  L3-E17 (Ausnahme „wesentlich“), vom Orchestrator zu bestätigen.

### N9b.2 Datenfluss (Z-L08)

- **Sprechübung mit echtem Modell bis zur Erkennung:** Beleg `_lernapp/belege/Z-L08-sprechen-datenfluss.md`, Methode und
  Zahlen in Abschnitt 7 (Nachtrag N9b). Erfüllt: nur GET an den eigenen Ursprung, 0 fremde Hosts, 0 Cookies, auch während
  und nach Aufnahme und Erkennung.
- **`netzprotokoll.spec.ts`** um Einstufung, Fortschritt, Wortschatz, Quellen, Wissens- und Koran-Kurs und eine gespielte
  Wiederholungsrunde erweitert (`a135d9d6`), Anfragen des Service Workers eingeschlossen (`context.on('request')`): nur GET
  an den eigenen Ursprung, keine API, keine Cookies.

### N9b.3 INP und Budgets

- **Budgets (KERN §9):** in beiden Bauten eingehalten, Spieler-Chunk 37,9 KB, jeder Typ-Chunk ≤ 15 KB (größter
  `hoeren_schreiben` 10 KB), arabische Bildschirmtastatur 1,5 KB.
- **INP:** Die Probe in Bau 1 (1 Lauf) zeigte für „Spieler echt `tr-aus-de.a1.e01.l01`“ 216 ms (auch nachgemessen bei
  Last 1,45), die übrigen Szenarien ≤ 200 ms (B1 144, ar 176, Lernpfad 192). N9b ändert diesen Pfad nicht. Nachgemessen in
  Bau 2 mit 3 Läufen (Last 2,2–2,6): `tr-aus-de.a1.e01.l01` **184 ms** (Läufe 184/192/160; Prüfen 184, Antwort wählen 128,
  Weiter 128, Paare 128) und „Lernpfad öffnen und offline speichern“ **192 ms** (216/192/192; offline speichern 192,
  Lernpfad öffnen 136, in allen drei Läufen erfasst, kein Schritt „< 16 ms“ oder lückenhaft), beide erfüllt. Die 216 ms der
  Probe liegen damit in der Streuung eines einzelnen Laufs (N8: 176).
- **Geänderte Messweise „Lernpfad öffnen“** (`inp-spieler.mjs`, seit N9b): Das Werkzeug verhindert die Standardaktion des
  Klicks auf die Kurskarte, wartet auf die Meldung des Startdokuments (höchstens 1 s) und navigiert dann selbst. Gemessen
  wird also der Klick ohne Beginn der Navigation; Werte bis N8 (z. B. 204 ms in N8.4) sind damit nicht deckungsgleich.
  Interaktionen unter 16 ms meldet Event Timing nie; das Werkzeug zählt deshalb die zugestellten Eingaben je Dokument und
  weist einen Schritt mit Eingabe, aber ohne Eintrag als „< 16 ms“ aus, nur einen ohne Eingabe als lückenhaft.

### N9b.4 Prüfungen und E2E

- Unit (`vitest --project unit tests/unit/lernapp tests/unit/navigation-lernapp.test.ts`): 76 Dateien, 2045 grün, 1 todo,
  0 übersprungen. `pnpm typen`, ESLint und Prettier der geänderten Dateien grün.
- **Volle Lern-App-E2E** (`tests/e2e/lernapp` und `mein-bereich-lernen.spec.ts`, Projekte telefon und desktop, Worker als
  Attrappe):
  - Bau 1 (`515a463f`): 141 bestanden, 43 übersprungen, **2 rot** – `tastatur.spec.ts` L2-02 de und ar (desktop): Fehlalarm
    des Tastaturhelfers an `<audio controls>` (siehe N9b.1), kein Mangel der App.
  - Bau 2 (`8e250aa4`, nach der Gegenprüfung): **143 bestanden**, 43 übersprungen, 2 rot – nur der neue
    `schrift_latein`-Test (beide Projekte, Fehler im Test: `filter({ has })` mit einem Locator am Formular statt an der
    Seite). Alle Tastaturwege grün, auch L2-02 de/ar mit Nachspuren und Sprechen per Tastatur. telefon 55/38/1, desktop
    88/5/1 (bestanden/übersprungen/rot).
  - Bau 3 (`5b9de3fe`): der neue Test lief an der Variante „nur mit Hörbeispiel“ auf, die das Paket ohne Audio nicht enthält;
    Bau 4 (`d52a4133`): **`zugaenglichkeit.spec.ts` 26 von 26 grün** (beide Projekte, Matrix und `schrift_latein`).
  - Übersprungen ist nur, was je Projekt bewusst einmal läuft („einmal je Lauf genügt“, Tippen auf dem Telefon bzw. Tastatur
    auf dem Desktop) und die Bildschirmfotos für die Sichtabnahme (nur auf Wunsch).
- **`gruppe.spec.ts:155`** (unter Last einmal rot nach 33,4 s, Details verloren; Trace bei Fehlschlag aufbewahrt): in beiden
  vollen Läufen grün, 66,7 s (Bau 1) und 80,8 s (Bau 2) bei der seit vor N9b unveränderten Zeitgrenze von 300 s. Kein Rot
  beobachtet, also keine Ursache zu belegen; die Zeitgrenze ist nicht angehoben.

### N9b.5 Runde 3: Merge N9a und Restbefunde der Gegenprüfung 2 (26.10.2026)

- **Merge** `claude/trusting-lovelace-6nfolz` (N9a, `11e45cbe`): `spieleTurkisch` liegt seit N9a in `tests/e2e/lernapp/l03.ts`;
  die axe-Prüfung je Übungstyp aus N9b steckt dort hinter der Option `axe` (Standard an, `offline.spec.ts` ohne axe, damit der
  Offline-Lauf nicht langsamer wird). Wiederholungsrunde: axe je Aufgabe mit dem gemeinsamen `loeseWiederholung` (auch
  `netzprotokoll.spec.ts` nutzt ihn statt einer Kopie). `inp-spieler.mjs`: Szenarien aus N9a (Stufe aufklappen, Stufe
  speichern, abbrechen) und Messweise aus N9b zusammen.
- **Fokusring-Prüfung (mittel):** `tastatur.ts` `fokus()` zählte den berechneten Umriss eines `sr-only`-Optionsfeldes mit (über
  die globale `:focus-visible`-Regel) und konnte bei Karten ohne Fokusring nie anschlagen. Jetzt zählen nur sichtbare
  Kandidaten (> 2 × 2 px, nicht weggeschnitten; beim winzigen Feld Karte daneben, Label, Elternelement). Selbsttest ohne App
  (`tastatur-selbsttest.spec.ts`, `page.setContent`): Karte ohne `peer-focus-visible`-Umriss → „kein sichtbarer Fokusring“,
  mit Umriss → kein Mangel; mit dem alten Helfer rot. Alle Tastaturwege der App bleiben mit der strengeren Prüfung grün.
- **Sprechen (niedrig):** „Die Aufnahme hat nach 15 Sekunden von selbst geendet …“ stand allein in der Live-Region und wurde
  sofort von „Einen Moment …“ bzw. dem Ergebnis ersetzt. Jetzt steht die Ansage vor der folgenden Meldung (Ergebnis, „zu
  leise“, Fehler, „kein Mikrofon“) in derselben Ansage. E2E zusätzlich mit Sprachprüfung (Attrappen-Worker): Live-Region =
  Grenze + Ergebnis nach ≥ 14 s.
- **`fokus-regeln.test.ts` (niedrig):** Klassenlisten über den TypeScript-Parser statt eines regulären Ausdrucks (der an `${…}`
  mit eigenen Anführungszeichen abbrach); Template-Literale als statische Teile und je Zweig einer Bedingung, mit Probe-Tests.
- **Kleinere Nachträge:** echter Tab-Weg für Lektion l03 in ar (RTL: Bildschirmtastatur mit Pfeilen, `luecke` als Freitext,
  `harakat`); axe im Koran-Spieler vor und nach der Antwort auf beiden Breiten (1440 und 390 im selben desktop-Lauf, weil der
  Test die Datenbank ändert).
- **Prüfungen:** `pnpm typen` grün; Unit `tests/unit/lernapp` 77 Dateien, 2071 grün, 1 todo; ESLint/Prettier der geänderten
  Dateien grün. Bau 5 aus `78f79978` (Attrappe, 280 s): **alle Lern-App-E2E 159 bestanden, 0 rot, 45 übersprungen** (telefon
  62/40/0, desktop 97/5/0; bestanden/übersprungen/rot; 15,1 min); `gruppe.spec.ts:155` grün in 54,7 s. Budget gegen
  denselben Bau: alle eingehalten (Spieler-Chunk 37,9 KB, `sprechen` 8,6 KB, Bildschirmtastatur 1,5 KB).

## Stufe C, 26.10.2026, Leistung mit echten Inhalten (N8)

| | |
|---|---|
| Datum | 26.10.2026 |
| Paket | Stufe C N8: Z-L07 mit echten Inhalten – Lighthouse-Leistung ≥ 90 auf den Messrouten, TBT senken, INP ≤ 200 ms in allen Szenarien, Budgets nach KERN §9 halten; umgesetzt sind die Vorschläge 1–3 aus C.5 (N6) |
| Stand | Zweig `lernapp-n8` ab `e06a648b`. **Messbau A** = `e06a648b` (Basis, vorher); **Messbau B** = `23af6310` (Lernpfad nur mit der aktuellen Stufe, Spieler prüft nur die gespielte Lektion, Zahlen ohne Intl, Lexikon später); **Messbau C** = `76008f63` (dazu Lernpfad als Übergang in Häppchen zu vier Stationen, Formatierer nur mit ganzen Zahlen, `lokal/lektion.ts`) – **Endstand, nachher**; **Messbau D** = `258d6730` (Häppchen zu zwei Stationen), verworfen und mit `5f893bfb` zurückgenommen. Der Code des Endstands ist der von Messbau C; `9557867a` ändert danach nur einen Kommentar |
| Inhalte | Wegwerf-Datenbank `igmg_lernapp_n8_e2e` mit allen Lern-App-Inhalten und dem Testkurs über `scripts/e2e-datenbank.mjs`; Produktionsbau gegen diese Datenbank (`E2E_ATTRAPPEN=1`, Schalter der Lern-App wie in `tor-stufe-c.sh`), Server `scripts/start-standalone.mjs` auf Port 3301 (A) bzw. 3303 (B–D) |
| Werkzeuge | `_lernapp/werkzeuge/leistung/messlauf.sh` (Teile `lighthouse-echt`, `inp-echt`), `web/scripts/lernapp-budget.mjs`; zur Ursachensuche ein Spurprofil außerhalb des Repos (Playwright mit CDP-Tracing und CPU-Profil, 412 × 823, CPU ×4, Netz wie Lighthouse mobil, ein Lauf je Route; lange Aufgaben ≥ 50 ms mit Ursache, Inklusiv- und Eigenzeit je Funktion) |
| Gerät | wie Abschnitt 2; Lighthouse-`benchmarkIndex` des Rechners in N8 1328–1604 (N6 1082–1560; L8 mit dem Testkurs 1302–2063, meist 1600–1950). Der Rechner war in N6 und N8 rund ein Fünftel langsamer als in L8; die Drosselung ×4 kommt obendrauf |
| Last (1 min) | Jeder Messteil erst nach „Ruhe“ (≤ 1,5, `warte_ruhe` in `hilfen.sh`). Lighthouse (höchste Last je Route): A 1,2–1,4 · B 1,0–1,4 · C 1,3–1,5 · D 1,2–1,7. INP: A 1,0–1,5 · B 1,0–2,3 · C 1,3–2,0 · D 1,4–1,8. Bauten und E2E 3–9 (parallel Schlussprüfungen und Vitest anderer Agenten) |
| Rohdaten | außerhalb des Repos (`<scratchpad>/tmp-n8/sitzung/`): `auftrag.log` (Last je Schritt), `bau-{A,B,C,D}.log`, `server-*.log`, `mess-{A,B2,C,D}/` (`lighthouse-echt.{md,json}` mit allen Läufen, Berichte je Route, `inp-echt.{md,json}`, `budget.{txt,json}`, `profil.txt` mit `profil/*.cpuprofile`), `e2e-{C,D}.log`. `mess-B-ungueltig/` lief gegen den noch nicht beendeten Server A und ist verworfen |

**Ergebnis:** Lernpfad und Spieler sind deutlich leichter: TBT des Lernpfads 1053 → 409 ms (de) bzw. 1127 → 519 ms (ar),
DOM 1398 → 594 Knoten; Spieler Geschichte 956 → 545 ms, Spieler ar 810 → 557 ms; INP „offline speichern“ 480 → 216 ms;
alle drei Spieler-Szenarien jetzt ≤ 200 ms (176/176/200 ms, vorher 208–216); alle JS-Budgets eingehalten (ungünstigste erste
Aufgabe +58,2 KB bei ≤ 60). **Das Ziel ist nicht erreicht:** Im Median erreicht keine Messroute des Endstands Leistung ≥ 90
(Start 89, Lernpfad 88/84, Spieler 80/84/83; einzelne Läufe 90–92), und „offline speichern“ bleibt mit 216 ms über 200.
Der Rest liegt vor allem am Hochfahren von Next/React (eine Aufgabe von 400–560 ms bei CPU ×4 auf jeder Route, allein
≈ 350–500 ms TBT) und im Spieler am Auswerten des Zod-Chunks (163–230 ms); beides senken weitere kleine Änderungen am Code der
Lern-App nicht (N8.7). Der Spieler mit Auswahl zuerst (A1) zeigt keinen messbaren Gewinn (83 → 80, Läufe 80–84 bzw. 77–85).
Ein Versuch mit kleineren Häppchen (Messbau D) lag am Lernpfad bei Lighthouse innerhalb der Streuung (90/86), verschlechterte
aber „offline speichern“ in allen Läufen (264 ms) und ist zurückgenommen.

### N8.1 Ursachen (Spurprofil Messbau A, CPU ×4)

| Route | DOM | lange Aufgaben nach dem ersten Zeichnen (ms) | Ursachen |
|---|---|---|---|
| Start `/lern-app/de` | 275 | Hochfahren 448 · Rendern 116 | Hochfahren von Next/React (Grundstock auswerten, Turbopack-Module, Hydration) **400–560 ms auf jeder Seite**; erstes `Intl.NumberFormat` im Formatierer 83 ms Eigenzeit (HeuteInsel) |
| Lernpfad de / ar (43 Einheiten) | 1398 / 1408 | Hochfahren 408 / 559 · Rendern 437 / 412 · Stil/Layout 658 / 579 | alle Stufen mit allen Stationen auf einmal gerendert und gesetzt; Paketköpfe aller Einheiten aus dem Vorrat; erste Intl-Objekte (Zahlen, Plural, Megabyte) |
| Spieler A1 / B1 / ar | 158–166 | Hochfahren 421–432 · Zod-Chunk auswerten 155–186 · Prüfung (Mikroaufgaben) 157–256 · Rendern 54–152 | Zod-Prüfung des **ganzen** Einheitenpakets beim Öffnen (`safeParse` inklusiv A1 228 ms, B1 316 ms), Lexikon des Tippfehler-Abgleichs für jede Lektion sofort (B1 ≈ 80 ms), Prüfung der nächsten Einheit direkt danach, erste Intl-Objekte 50–91 ms |

Das Hochfahren ist eine einzige Aufgabe (`EvaluateScript` des Haupt-Chunks mit Turbopack-Modulfabrik und Hydration) und liegt
auf jeder Route bei 400–560 ms; allein damit trägt jede Seite ≈ 350–500 ms TBT. Für Leistung ≥ 90 braucht eine Route mit
LCP ≈ 1,9–2,1 s etwa TBT ≤ 300–350 ms (Läufe mit 90–94 hatten TBT 232–351 ms) – mit dem Hochfahren allein ist das auf diesem
Rechner nur knapp erreichbar.

### N8.2 Behebungen

| Commit | Änderung | Wirkung (Spurprofil bzw. Messbau) |
|---|---|---|
| `1c9727b4`, `6a9997c8`, `2b285cb1` | Lernpfad: nur die Stufe der aktuellen Einheit mit Stationen (`aufgeklappteStufe`); übrige Stufen behalten Überschrift und „Stufe abgeschlossen“ und zeigen die Zahl ihrer Einheiten in einem `<details>` (`lernpfad.einheitenZahl` de/tr/ar, KI-Entwurf vermerkt), Stationen erst beim Aufklappen; Karte jeder Station mit `content-visibility: auto` (Utility `zeichnen-bei-sicht`); Paketköpfe nur für sichtbare Stufen; nach „Lektionen zeigen“ und „offline speichern“ nur die Station neu statt Verzeichnis und Vorrat neu zu laden; Fortschritt je Einheit in einem Durchlauf (`geschafftJeEinheit`). Spieler: `ladeLektion` prüft nur die gespielte Lektion gegen `LektionSchema` (Paketkopf ohne Zod; Hash wie bisher), nächste Einheit erst nach dem Zeichnen und nur im Kopf. `speichereOffline` gibt vor jedem Paket und Bündel den Hauptthread frei (`nachgeben`: `scheduler.yield` bzw. Zeitgeber) | Lernpfad DOM 1398 → 594, TBT (Spur) 1521 → 650 ms (de) bzw. 1856 → 1091 ms (ar); `safeParse` A1 228 → 61 ms, B1 316 → 90 ms |
| `db36bcb0`, `1de8935b` | `format.ts` schreibt ganze Zahlen 0–999 in de/tr/ar selbst (östlich-arabische Ziffern wie Intl) und bestimmt die Pluralkategorie ganzer Zahlen nach CLDR; sonst Intl. Megabyte im Ring „offline speichern“ ohne Intl (`megabyte` in `OfflineEinheit`, nur Lernpfad). Unit-Test: gleich wie Intl für 0–1200, Dezimal-, große und negative Zahlen in de, tr, ar (östlich/westlich) | erstes Intl-Objekt je Seite entfällt (Start 83 ms, Spieler 50–91 ms Eigenzeit); Größe minifiziert 829 B gz (N8.7 Nr. 5, berichtigt in N9b) |
| `23af6310` | Lexikon der Lektion (`lexikonVon`, je Lektion gemerkt) erst bei der ersten Textbewertung (frei, Lücke, Hören-Schreiben, Formen) | B1 ≈ 80 ms weniger beim Öffnen |
| `f9aedd1e` | Lernpfad: „bereit“ und das Neuberechnen als `startTransition`; eine Stufe zeigt zuerst vier Stationen, je Takt (Zeitgeber, Übergang) vier weitere | kein Block für Rendern/Layout der ganzen Stufe (Spur C: Stil/Layout 122 + 52 ms statt 658 ms) |
| `76008f63` | `ladeLektion`/`nurLektion` in `lokal/lektion.ts` (nur `LektionSchema` und Vorrat), der Koran-Pfad weiter über `pakete.ts` | Spieler ohne `PaketSchema` und Bündel-Leser; mit `1de8935b` Lektion 1 +56,4 → +54,2 KB über der Hülle, Sprechen 60,3 → 58,2 KB (Grenze 60) |
| `258d6730` → `5f893bfb` | Versuch: zwei statt vier Stationen je Takt; zurückgenommen | Messbau D: „offline speichern“ 256/264/264 ms gegen C 232/216/176 ms bei gleicher Last; Lighthouse Lernpfad innerhalb der Streuung |
| `9557867a` | Kommentar in `OfflineEinheit.tsx` ohne arabisches Zeichen (Religion-Prüfung: Komponenten ohne arabische Schrift) | – |

Barrierefreiheit: Die zugeklappten Stufen sind native `<details>`/`<summary>` (Tastatur, Zustand für Screenreader), die
Überschriften aller Stufen bleiben für die Sprungnavigation stehen, das Chevron dreht sich nur mit `motion-safe` als Übergang.
Neue Texte nur aus `messages/lernapp/*.json`, Maße nur aus Tokens (`--spacing(72)`).

### N8.3 Lighthouse (mobil, Median aus 3 Läufen, Leistung / TBT ms)

| Route | A (vorher) | B | **C (nachher)** | D (verworfen) | Läufe C | Zugängl. C | LCP ms C | CLS C | JS KB gz A → C (Grenze) |
|---|---|---|---|---|---|---|---|---|---|
| Start `/lern-app/de` | 88 / 393 | 92 / 299 | **89 / 344** | 92 / 288 | 89/344 · 90/343 · 87/433 | 100 | 2041 | 0 | 149,4 → 149,5 (180) |
| Lernpfad `/lern-app/de/tr-aus-de` | 76 / 1053 | 84 / 544 | **88 / 409** | 90 / 351 | 87/431 · 88/409 · 92/291 | 100 | 1939 | 0 | 155,8 → 158,5 (180) |
| Lernpfad `/lern-app/ar/de-aus-ar` (RTL) | 74 / 1127 | 82 / 609 | **84 / 519** | 86 / 457 | 83/530 · 84/519 · 86/453 | 100 | 2071 | 0 | 155,8 → 158,5 (180) |
| Spieler `tr-aus-de.a1.e01.l01` (Auswahl) | 83 / 609 | 85 / 506 | **80 / 701** | 80 / 679 | 77/857 · 85/496 · 80/701 | 100 | 1903 | 0,006 | 192,7 → 191,1 (210) |
| Spieler `tr-aus-de.b1.e01.l06` (Geschichte) | 77 / 956 | 81 / 703 | **84 / 545** | 82 / 615 | 81/680 · 85/503 · 84/545 | 100 | 1930 | 0 | 194,3 → 192,7 (210) |
| Spieler `de-aus-ar.a1.e01.l01` (RTL) | 78 / 810 | 86 / 469 | **83 / 557** | 83 / 559 | 83/557 · 80/674 · 87/438 | 100 | 1959 | 0,007 | 192,7 → 191,1 (210) |

Best Practices 100, SEO 100 auf Start und Lernpfaden (Spieler `noindex`). Unter Last nachgemessen: A Lernpfad ar und beide
Spieler de, B Spieler A1, C Spieler ar, D Lernpfad ar. Start und Spieler haben in C und D denselben Code (der Versuch D ändert
nur den Lernpfad); über beide Messbauten (6 Läufe) liegt der Median bei Start 89,5 (87–92), Spieler A1 80, B1 83, ar 83. Die
Streuung zwischen drei Läufen derselben Route beträgt bis zu 8 Punkte; Unterschiede ≤ 4 Punkte zwischen zwei Messbauten sind
nicht belastbar.

Spurprofil des Endstands (Messbau C, CPU ×4, ein Lauf): Start Hochfahren 410 ms, sonst keine lange Aufgabe über 70 ms nach
dem ersten Zeichnen; Lernpfad de Hochfahren 451, Stil/Layout 122 und 52 ms; Lernpfad ar Hochfahren 505, Rendern 57 und 86,
Stil/Layout 185 und 83 ms; Spieler Hochfahren 424–472, Zod-Chunk auswerten 163–230, Prüfung der Lektion 57–121, Rendern
52–147 ms.

### N8.4 INP (CPU ×6, 3 Läufe, Median, ms)

| Szenario | A (vorher) | B | **C (nachher)** | D (verworfen) | je Schritt C (Median) | Last max C | Ergebnis C |
|---|---|---|---|---|---|---|---|
| Spieler `tr-aus-de.a1.e01.l01` (Auswahl, Auswahl, Paare) | 208 | 184 | **176** | 192 | Prüfen 176 · Weiter 136 · Antwort wählen 120 · Paare 104 | 1,28 | erfüllt |
| Spieler `tr-aus-de.b1.e01.l06` (Geschichte zuerst: Weiter lesen) | 216 | 184 | **176** | 144 | Weiter lesen 176 | 1,84 | erfüllt |
| Spieler `de-aus-ar.a1.e01.l01`, Oberfläche ar (RTL) | 208 | 160 | **200** | 168 | Prüfen 200 · Antwort wählen 160 · Weiter 144 · Paare 112 | 2,04 | erfüllt (Grenze) |
| Lernpfad öffnen (Start → `tr-aus-de`) und Einheit offline speichern | 480 | 272 | **216** | 312 | offline speichern 216 · Lernpfad öffnen 204 | 1,43 | **verfehlt** (nachgemessen; vorher 208 ms bei Last 1,8) |

Je Lauf (Dauer, davon Eingabeverzögerung): „offline speichern“ A 488/480/376 (63–83), B 304/272/256 (144–173), C 232/216/176
(54–135), D 256/264/264 (92–165). „Lernpfad öffnen“ ist der Klick auf der Startseite und fast nur Eingabeverzögerung (C
194–206 ms bei 1–4 ms Verarbeitung, D bis 309 ms): Das Werkzeug tippt, sobald der Link im HTML steht, und trifft je nach Lauf
das Hochfahren der Startseite (≈ 600 ms bei CPU ×6) oder die Zeit danach (B: 69 ms). Die Spieler-Szenarien haben in C und D
denselben Code; über beide (6 Läufe) liegt der Median bei A1 184, B1 148, ar 184 ms (Einzelläufe bis 256 ms in ar).

### N8.5 JS beim ersten Laden (KERN §9, `lernapp-budget.mjs`, KB gz)

| Messgröße | A (Basis) | B | **C (nachher)** | D | Grenze |
|---|---|---|---|---|---|
| Hülle eigener Anteil | – | 9,7 | **9,6** | 9,6 | 20 |
| Start gesamt / eigener Anteil | 149,4 / – | 149,6 / 14,3 | **149,5 / 14,2** | 149,5 / 14,2 | 180 / 30 |
| Lernpfad gesamt / eigener Anteil | 155,8 / – | 158,3 / 23,0 | **158,5 / 23,2** | 158,5 / 23,2 | 180 / 30 |
| Fortschritt gesamt / eigener Anteil | – | 153,5 / 18,2 | **153,4 / 18,1** | 153,4 / 18,1 | 180 / 30 |
| Spieler Lektion 1 gesamt / zusätzlich zur Hülle | 192,7 / – | 193,2 / 56,4 | **191,1 / 54,2** | 191,1 / 54,2 | 210 / 60 |
| ungünstigste echte erste Aufgabe (Sprechen) zusätzlich | 59,8 (N6, Messbau 4) | **60,3 (verfehlt)** | **58,2** | 58,2 | 60 |
| Wiederholen / Einstufung ohne Karten | – | 152,6 / 153,8 (ohne Zod) | **152,6 / 153,7 (ohne Zod)** | 152,6 / 153,7 | 210 |
| Ergebnis | – | **verfehlt** (+0,3 KB) | **eingehalten** | eingehalten | |

A: kein eigener Budgetlauf; Werte aus den Lighthouse-Berichten (JS gz) bzw. aus N6 (C.2). Der Lernpfad wächst um 2,7 KB
(Stufen, Häppchen, `megabyte`), der Spieler wird um 1,6 KB kleiner. Für Sprechen in noch nicht ausgelieferten Lektionen
schätzt das Werkzeug +60,4 KB (gemessen in der ausgelieferten Lektion: +58,2); die Schätzung ist eine obere Grenze aus den
Bausteinen (N6 C.2).

### N8.6 Prüfungen und E2E

- Unit: `tests/unit/lernapp` 74 Dateien, 2040 Tests grün (neu `leistung-n8.test.ts`, `lernpfad-stufen.test.tsx`;
  `format.test.ts` mit Vergleich gegen Intl, `sitzung.test.ts`); nach der Rücknahme die beiden betroffenen Dateien erneut
  grün. `pnpm typen`, ESLint und Prettier der geänderten Dateien, `sprachen:pruefen` und die Religion-Prüfung grün (sie fand
  zuerst ein arabisches Zeichen in einem Kommentar von `OfflineEinheit.tsx`; behoben in `9557867a`).
- E2E (Produktionsbau, Projekte telefon und desktop) mit `lektion`, `offline`, `rahmen`, `typen-a`, `wiederholen-einstufung`,
  `spielelemente`, `netzprotokoll`, `typen-wissen`, `zwei-geraete`, `koran`, `quellen`: **Messbau C (Endstand) 82 bestanden,
  22 übersprungen, 0 rot**; Messbau D (zwei Stationen je Takt) ebenso 82 bestanden, 22 übersprungen, 0 rot. Die
  axe-Prüfungen darin (Lernpfad und Spieler ar, Rahmen de/tr/ar) ohne ernste oder kritische Befunde. Die volle Lern-App-E2E
  beider Projekte folgt nach dem Merge in N9a/N9b.

### N8.7 Z-L07 eingeordnet und offene Punkte

| Teil von Z-L07 | Stand nach N8 (Endstand = Messbau C) | vorher (Messbau A bzw. N6) |
|---|---|---|
| Budgets KERN §9 | erfüllt: ungünstigste echte erste Aufgabe +58,2 KB (≤ 60), Lernpfad 158,5 KB (≤ 180) | erfüllt (59,8 KB) |
| LCP ≤ 2,5 s, CLS ≤ 0,1 | erfüllt (1903–2071 ms, ≤ 0,007) | erfüllt |
| INP ≤ 200 ms | **teilweise**: Spieler 176/176/200 ms erfüllt; Lernpfad-Szenario **216 ms verfehlt** (offline speichern 216, Lernpfad öffnen 204) | Spieler 208–216 und Lernpfad 480 verfehlt (A) |
| Lighthouse Leistung ≥ 90, Zugänglichkeit 100 | **Leistung verfehlt** (Median 80–89; Start 89, Lernpfad 88/84, Spieler 80/84/83), Zugänglichkeit 100 | 74–88 (A), 72–86 (N6) |
| Whisper nur nach Klick | unverändert erfüllt (`netzprotokoll` in E2E C grün) | erfüllt |

**Vorschlag für Z-L07: weiter „teilweise“** – Budgets, LCP, CLS, Zugänglichkeit und jetzt auch der INP im Spieler
erfüllen; Lighthouse-Leistung (Abstand 1–10 Punkte, vorher 2–16) und der INP von „offline speichern“ (16 ms über der Grenze,
vorher 280) verfehlen.

Offen (Vorschläge, nicht umgesetzt):

1. **Hochfahren von Next/React (400–560 ms je Seite bei CPU ×4):** größter verbleibender Posten jeder Route und Ursache der
   Eingabeverzögerung von „Lernpfad öffnen“. Möglich: weniger Client-Komponenten in der Hülle der Lern-App (Kopf, Navigation,
   Einstellungen als Server-Komponenten mit kleinen Inseln), späteres Hydrieren nicht sichtbarer Inseln; Wirkung nur mit
   eigenem Messbau belegbar. Ein Rechner wie in L8 (`benchmarkIndex` ≈ 1850 statt ≈ 1450) senkte TBT ohne Codeänderung.
2. **Zod im Spieler (Chunk auswerten 163–230 ms, Prüfung der Lektion 57–121 ms):** Prüfung der Lektion in einem Worker. Die
   CSP der Lern-App erlaubt ihn (`worker-src 'self'`); der Whisper-Worker liegt aber als statische Datei unter
   `/lern-app/modelle/sprechen/`, ein von Turbopack gebündelter Worker (`new Worker(new URL(…, import.meta.url))`) samt
   Zwischenspeicher im Service Worker (offline) ist im Projekt noch nicht erprobt. Alternative: Schemas erst bei Bedarf bauen.
3. **„offline speichern“ 216 ms** – *berichtigt in N9a (Abschnitt oben, N9a.2):* Das automatische Speichern der aktuellen
   und nächsten Einheit hat keinen Anteil – es läuft in `laden()` vor „bereit“, also bevor das Werkzeug tippen kann. Die
   Eingabeverzögerung (54–135 ms) stammte aus Häppchen, Übernahme und Layout nach dem ersten Zeichnen, die Verarbeitung aus dem
   Wechsel zum Ring, den React noch im Klick übernahm. Behoben in N9a (`acc972ee`, `4f1da4a5`): offline speichern 152/160 ms.
4. **Spieler ar (RTL):** INP 200 ms in C (Läufe 168/256/200), 168 ms in D bei gleichem Code – an der Grenze; Prüfen und Antwort
   wählen sind die längsten Schritte (Verarbeitung bis 132 ms).
5. **`format.ts` minifiziert 829 B gz**, also unter 1 KB wie PLAN §3.3 und ADR 0037 Nr. 5 verlangen (berichtigt in N9b). Die
   frühere Angabe „≈ 1,07 KB gz“ maß die übersetzte, nicht minifizierte Quelle (1.068 B); im Client-Bündel kommt die Datei
   minifiziert an. Der Unit-Test minifiziert jetzt mit Terser aus Next (`next/dist/compiled/terser`) und verlangt < 1.024 B;
   die Anhebung der Grenze auf 1,1 KB ist zurückgenommen. Keine Abweichung vom Plan.
6. **Spieler A1 ohne messbaren Gewinn** in Lighthouse (A 83, C 80, D 80; Läufe 77–85), obwohl die Zod-Prüfung von 228 auf
   61 ms sank: Hochfahren und Zod-Chunk überwiegen bei der kleinen Lektion.

## Stufe C, 26.10.2026, echte Inhalte (N6)

| | |
|---|---|
| Datum | 26.10.2026 |
| Paket | Stufe C N6 (Befunde der Endabnahme `protokolle/C-technik.md`, `C-technik-gegen.md` zu Z-L07) |
| Stand | Zweig `lernapp-n6` ab `9a8ca1f8`. Paketbau `aa0d3e8f`, E2E-Tag `3cecdd3f`; **Messbau 1** aus `3cecdd3f` (kalter Neubau am Server, Budget, Lighthouse, INP); **Messbau 2** mit Lücke und Sprechen verschlankt (Budget, erste Aufgabe je Typ, E2E); **Messbau 3** mit der Lücke als zwei Chunks (Budget, erste Aufgabe je Typ, E2E) = `c9e586ce`; **Messbau 4** nach der Gegenprüfung (Formen ohne Zeichenhilfe bis zum ersten Fokus, Budget-Werkzeug mit abgeleiteten Lektionen und Schätzung; Budget, E2E) = Abschluss-Commit der Nacharbeit |
| Inhalte | Wegwerf-Datenbank `igmg_lernapp_n6_e2e` mit allen Lern-App-Inhalten (A1–B1 bzw. B2, ≈ 147 000 Einträge) und dem Testkurs über `scripts/e2e-datenbank.mjs`; Bau gegen diese Datenbank (`E2E_ATTRAPPEN=1`), Server `scripts/start-standalone.mjs` auf Port 3282 mit `CACHE_ERNEUERN_BEIM_START=1` |
| Werkzeuge | `web/scripts/lernapp/paketbau-messen.ts` (neu), `web/scripts/lernapp-budget.mjs` (echte Lektionen je Typ der ersten Aufgabe), `_lernapp/werkzeuge/leistung/` (`routen.mjs lighthouse-echt`, `inp-spieler.mjs --echt`, `messlauf.sh` Teile `lighthouse-echt`/`inp-echt`) |
| Last (1 min) | Messbau 1: Bau 0,2 → 2,1 · kalter Neubau 2,7 · Budget 2,2 · Lighthouse 1,2–2,9 · INP 1,4–4,9. Messbau 2: Bau 2,3 → 2,7 · Budget 2,7 · E2E 2,4–4,9. Messbau 3: Bau 3,3 → 4,1 · Budget 4,1 · E2E 3,5–7,3. Messbau 4: Bau 1,4 → 2,7 · Budget 2,7 · E2E 2,2 → 4,0. Parallel liefen Inhalts-Agenten (Prüfer, Vitest). |
| Rohdaten | außerhalb des Repos (`<scratchpad>/tmp-n6/sitzung/`): Bau-, Server- und Auftragsprotokolle, `kalt.txt`, `budget*.{txt,json}` (Messbau 4: `budget5.*`, `auftrag5.log`, `e2e5.log`), `erste-typen*.txt`, `leistung/{lighthouse-echt,inp-echt}.{md,json}`, Lighthouse-Berichte je Route |

**Ergebnis:** Der kalte Neubau eines Kursverzeichnisses dauert am Produktionsserver 2,2–3,7 s statt 8,9–10,5 s und
blockiert ihn höchstens 0,4 s am Stück statt ≈ 6–10 s; die ausgelieferten Bytes sind gleich. Die JS-Budgets halten nach
der Verschlankung von Lücke und Sprechen für alle ausgelieferten echten Lektionen (gemessen, ungünstigste +59,8 KB über der
Hülle bei ≤ 60 KB) und nach der Gegenprüfung auch für die noch nicht ausgelieferten Formen der ersten Aufgabe (geschätzt,
ungünstigste `formen` in tr.b1.e16 mit +58,7 KB statt ≈ +60,5 KB). **Mit echten Inhalten
verfehlen aber alle sechs gemessenen Routen Lighthouse-Leistung ≥ 90 (72–86, TBT 458–1348 ms) und das Öffnen des
Lernpfads samt „offline speichern“ INP ≤ 200 ms (416 ms).** LCP (1,87–2,09 s), CLS (≤ 0,007), Zugänglichkeit 100 und der
INP im Spieler (168–184 ms) erfüllen. Ursachen und Vorschläge in C.5; Z-L07 neu eingeordnet in C.6.

### C.1 Kalter Neubau der Kursverzeichnisse (Befund 1)

Befund (C-technik): Nach jeder Cache-Erneuerung (Start mit `CACHE_ERNEUERN_BEIM_START`, jede Freigabe mit
`updateTag(lernappKurs(x))`) baute der erste Abruf eines Kursverzeichnisses alle Einheiten einer Richtung neu: 8,9–10,5 s,
in denen der Node-Server nichts anderes beantwortete (statische Datei 6,4 s statt 9 ms). Im Profil ≈ 7,5 s `node:crypto`
und ≈ 3,6 s Speicherbereinigung.

**Ursache:** `stabilSortiert` (Wortbank-Ablenker in die Ausgangssprache) rechnete den SHA-256 im Vergleich der Sortierung –
≈ 2·n·log n Hashes je Aufgabe mit n ≈ Wörter aller Übersetzungen der Einheit. Dazu je Aufgabe die Wortliste aller
Übersetzungen neu, Abfragen mit 10 000 Einzelparametern (Drizzle baute jede Anweisung ≈ 0,8 s je Richtung), je Einheit ein
Filter über alle Lektionen und Aufgaben des Kurses und die Formel-Prüfung jedes Texts bei jedem Bau.

**Behebung (`aa0d3e8f`):** Hash je Wert einmal; Sichtbarkeit, Text-Hash und Übersetzungswörter je Einheit gemerkt;
Formel-Treffer je Formelliste, Sprache und Text gemerkt; geprüfte Vorlage aus dem Laden übernommen; `kanonisch` ohne
Zwischenlisten; Einmal-Hash `crypto.hash`; `spalte = any($1)` mit einem Array-Parameter (`bloecke.ts` `inListe`);
Lektionen und Aufgaben gruppiert statt je Einheit gefiltert; Bau Einheit für Einheit mit `setImmediate` dazwischen.
Regressionstest `tests/unit/lernapp/paketbau-gleich.test.ts`: feste Eingabe (drei Einheiten, alle Vorlagen der
Sprachkurse, verborgene Einträge, Formel-Kandidat, Audio), Verzeichnis- und Einheiten-Hashes wie vor N6 (`9a8ca1f8`,
festgeschrieben), Hash = SHA-256 des Pakettexts; Eigenschaftstests `kanonisch`, `sha256Hex`, `stabilSortiert` gegen die
alten Fassungen.

**Messung A – Skript** (`paketbau-messen.ts`, E2E-Datenbank, 6 Richtungen × 2 Runden, je Runde Laden, `baueRichtung` und
Verzeichnis; längste Blockade = längste Lücke eines 5-ms-Takts):

| | vorher (`9a8ca1f8`) | nachher (`aa0d3e8f`) |
|---|---|---|
| `baueRichtung` je Richtung (43–44 Pakete, 5444–7145 Aufgaben) | 6,8–11,8 s | Last 2,0: 1,9–3,3 s (Runde 2: 1,8–2,3 s) · Last 4,4–7,3: 2,4–3,7 s |
| längste Blockade der Ereignisschleife | 5,3–10,6 s | 0,08–0,21 s (Last 2,0) · 0,10–0,23 s (Last 4,4–7,3) |
| davon nur Laden (Datenbank) | 1,3–2,2 s | 0,6–1,2 s |
| Fingerabdruck (260 Pakete: Schlüssel, Hash, Bytes; Verzeichnis-Hash je Richtung) | Bezug | **gleich** in allen 6 Richtungen |
| Last | 1,1 → 1,6 | 2,0 bzw. 4,4–7,3 (Inhalts-Agenten parallel) |

**Messung B – am Produktionsserver** (Messbau 1, `kalt.txt`): je Richtung `POST /api/wartung/cache-erneuern?tag=lernapp`,
dann `GET /lern-app/pakete/<richtung>`; daneben alle 100 ms eine statische Datei. Last 2,7.

| Richtung | Einheiten | kalt ms | warm ms | statische Datei währenddessen (Median / max ms) |
|---|---|---|---|---|
| tr-aus-de | 43 | 3466 | 10 | 171 / 400 |
| ar-aus-de | 44 | 2709 | 10 | 142 / 196 |
| de-aus-tr | 43 | 3695 | 7 | 148 / 328 |
| ar-aus-tr | 44 | 2756 | 7 | 156 / 192 |
| de-aus-ar | 43 | 2195 | 8 | 62 / 136 |
| tr-aus-ar | 43 | 2229 | 17 | 106 / 187 |

Ohne Neubau: statische Datei Median 6 ms, max 85 ms. Vorher (C-technik): 8,9–10,5 s je Richtung, statische Datei 6,4 s.
**Einordnung:** ≈ 3–4-mal schneller und ohne lange Blockade; der Richtwert < 2 s ist im Skript bei ruhiger Maschine in
etwa erreicht (Runde 2 bei Last 2,0: 1,8–2,3 s), am Server unter Last 2,7 nicht ganz (2,2–3,7 s, davon ≈ 0,6–1 s Datenbank).

### C.2 JavaScript beim ersten Laden mit echten Lektionen (Befund 3, KERN §9)

`lernapp-budget.mjs` zählt für „Spieler zusätzlich zur Hülle ≤ 60 KB“ den Typ-Chunk der ersten Aufgabe mit; gemessen war
bis N5 nur die Testlektion mit Auswahl (2 KB). Gemessen jetzt je Typ der ersten Aufgabe eine echte Lektion
(`erste-typen*.txt`, gz -9, Service Worker gesperrt, bis die erste Aufgabe steht und das Netz ruht). Kern ohne Typ-Chunk:
53,8 KB in sieben Dateien (22,5 · 12,3 · 9,5 · 5,2 · 2,5 · 1,4 · 0,4; darunter der Spieler, Zod mit den Paket- und
Aufgabenschemas, lokale Datenbank und Vorrat, Abgleich).

| erste Aufgabe (echte Lektionen mit diesem Typ zuerst) | Lektion | zusätzlich KB Messbau 1 | Messbau 2 | Messbau 3 | Messbau 4 | gesamt KB (Messbau 4) |
|---|---|---|---|---|---|---|
| grammatik_tipp (392) | `tr-aus-de.b1.e01.l01` | 54,8 | 54,8 | 54,8 | 54,8 | 191,7 |
| auswahl (432) | `tr-aus-de.a1.e01.l01` | 55,8 | 55,8 | 55,8 | 55,8 | 192,7 |
| paare (138) | `tr-aus-de.a1.e01.l02` | 56,7 | 56,7 | 56,7 | 56,7 | 193,5 |
| schreiben (11) | `tr-aus-de.b1.e12.l08` | 57,1 | 57,1 | 57,1 | 57,1 | 193,9 |
| dialog (2) | `ar-aus-de.a2.e01.l08` | 57,2 | 57,2 | 57,2 | 57,2 | 194,0 |
| **geschichte (136)** | `tr-aus-de.b1.e01.l06` | 57,5 | 57,5 | 57,5 | 57,5 | 194,3 |
| minimalpaare (1) | `ar-aus-de.a2.e03.l07` | 59,2 | 59,2 | 59,2 | 59,2 | 196,0 |
| lesen_fragen (16) | `tr-aus-de.a1.e02.l07` | 59,3 | 59,3 | 59,3 | 59,3 | 196,1 |
| sprechen (1) | `tr-aus-de.b1.e15.l08` | **60,3** | 59,8 | **59,8** | **59,8** | 196,6 |
| luecke (1) | `tr-aus-de.b1.e14.l07` | **61,8** | **60,1** | **59,0** | 59,0 | 195,8 |
| formen (1, Entwurf) | `tr.b1.e16.l07` – nicht ausgeliefert | – | – | ≈ 60,5 (geschätzt, Gegenprüfung) | 58,7 (geschätzt) | 195,5 (geschätzt) |
| wahr_falsch (67), zuordnen (42), reihenfolge (28), fallfrage (9) – Wissenskurs, Entwurf | `islam.grund.*` – nicht ausgeliefert | – | – | – | 57,1 / 57,8 / 57,2 / 57,4 (geschätzt) | 193,9–194,6 (geschätzt) |

Messbau 4 misst je Form die erste ausgelieferte Lektion aus `inhalte/lernapp` (für Auswahl, Paare, Geschichte, Tipp,
Lesen mit Fragen, Dialog und Minimalpaare in `ar-aus-de`, z. B. `ar-aus-de.a1.e01.l06`); die Typ-Chunks und Bytes sind
dieselben wie in den Lektionen der Tabelle.

- Die Geschichte (136 Lektionen, Typ-Chunk im Spieler-Zusammenhang 3,7 KB; der Wert 9,9 KB aus N5 war die Summe aller
  Dateien mit ihren Bausteinen) hielt das Budget schon in Messbau 1. **Ungünstiger waren die Lücke unter Optionen (+8,0 KB)
  und die Sprechübung (+6,5 KB)**, je eine echte Lektion.
- **Verschlankung:** Sprechen lädt die Aufnahme (`aufnahme.ts`: Mikrofon, Pegel, PCM) erst mit dem Klick auf „Aufnehmen“
  (−0,5 KB). Die Lücke lädt Feld und Zeichenhilfe nur in der Freitext-Form: Messbau 2 lud nur die Zeichenhilfe nach
  (−1,7 KB, noch 60,1 KB); Messbau 3 trennt die Freitext-Form ganz ab (`LueckeFeld.tsx`, gemeinsamer Satz `LueckeSatz.tsx`,
  Schreibmarke ohne Zeichenhilfe in `schreibmarke.ts`). Ergebnis Messbau 3: Lücke 59,0 KB, Sprechen 59,8 KB – alle gemessenen Fälle ≤ 60 KB (Reserve 0,2 KB).
- **Berichtigung nach der Gegenprüfung:** Messbau 3 und `c9e586ce` nannten das Budget „auch im ungünstigsten echten Fall“
  erfüllt und schrieben, keine echte Lektion beginne mit frei, hoeren_schreiben oder formen. Für **formen** stimmte das
  nicht: `tr.b1.e16.l07` (Einheit im Entwurf, noch nicht ausgeliefert, daher nicht gemessen) beginnt mit einer
  Formentabelle. Aus Messbau 3 geschätzt: Kern 55 091 B + Formen-Chunk 6 889 B (Formen, Texteingabe, Zeichenhilfe) ≈ 60,5 KB
  (> 60).
- **Formen verschlankt (Messbau 4):** Die Zeichenhilfe (Sonderzeichenleiste bzw. Schalter der arabischen Tastatur) lädt als
  eigener Chunk mit dem ersten Fokus in einem Feld; bis dahin hält ein leerer Platz eine Zeile frei (`Formen.tsx`;
  `feldKlasse` aus `schreibmarke.ts` statt aus `Texteingabe.tsx`). Formen-Chunk 6 889 → 5 004 B; erste Aufgabe formen
  geschätzt +58,7 KB (Reserve 1,3 KB). Offline: Der Service Worker folgt den Chunk-Verweisen und legt den Zeichenhilfe-Chunk
  beim Speichern einer Einheit mit ab (wie bei `LueckeFeld`).
- **`lernapp-budget.mjs` leitet die echten Lektionen ab (Messbau 4)** statt sie fest zu verdrahten (`ECHTE_SPIELER`
  entfällt): je Form der ersten Aufgabe (Typ; Lücke ohne Ablenker als `luecke_frei`) die Lektionen aus `inhalte/lernapp`
  (alle Stände); gemessen wird die erste, deren Einheit das Kursverzeichnis der Richtung ausliefert (bis zu drei Versuche).
  Formen ohne ausgelieferte Lektion werden geschätzt: Spielerkern (Testlektion ohne Typ-Chunks, 53,8 KB) + größte Datei des
  Typs (+ Feld bei `luecke_frei`). Das Budget gilt für Messung und Schätzung; wird tr.b1.e16 oder der Wissenskurs
  ausgeliefert, misst das Werkzeug die Lektion selbst. Die Schätzung ist eine obere Schranke: gleich der Messung bei Auswahl,
  Tipp, Paare, Schreiben, Lesen mit Fragen und Lücke, 2,0–2,3 KB darüber bei Geschichte, Dialog, Minimalpaare und Sprechen
  (deren Komponenten liegen auch in größeren Chunks anderer Routen). Messbau 4: „Alle Budgets eingehalten“; ungünstigste
  gesamt 196,6 KB (≤ 210), zusätzlich 59,8 KB (≤ 60, Sprechen gemessen).
- **Schätzung je Übungstyp (≤ 15 KB):** eigener Erkennungstext für `LueckeFeld` (`luecke_feld`); er zählt nur bei der Lücke
  (nachgeladen) und nicht mehr als ausgelagerter Baustein von frei, hoeren_schreiben und formen; ausgelagerte Bausteine zählen
  nur, wenn der Typ-Chunk sie nicht selbst enthält. Messbau 4: frei 5,3 · hoeren_schreiben 9,9 · formen 6,7 (mit dem
  Zeichenhilfe-Chunk) · luecke 8,8 KB (mit dem Feld; der Lauf in Messbau 4 zeigte 10,6 KB mit der Zeichenhilfe doppelt, danach
  berichtigt und mit den Dateilisten des Laufs nachgerechnet).
- **Sprechen:** Scheitert das Nachladen der Aufnahme (`aufnahme.ts`, ohne Netz und Einheit nicht offline gespeichert), zeigt
  die Übung den Netzhinweis (`aufgaben.hoeren.keinNetz`) statt „Mikrofon nicht verfügbar“, und der Knopf „Aufnehmen“ bleibt.
- Übrige Budgets unverändert erfüllt (Messbau 4 wie Messbau 3): Hülle eigener Anteil 9,4 KB (≤ 20) · Start 149,4 / eigen 14,0 KB · Lernpfad 155,8 / eigen 20,4 KB · Fortschritt 153,3 / eigen 17,9 KB · Testlektion 192,7 / +55,8 KB · Wiederholen 152,4 und Einstufung 153,3 KB, beide ohne Zod · Übungstypen 1,0–9,9 KB (je ≤ 15) · arabische Bildschirmtastatur 1,5 KB (≤ 10).

### C.3 Lighthouse mit echten Inhalten (mobil, Median aus 3 Läufen, Messbau 1)

Die Verschlankung aus C.2 (Messbau 2–4) ändert keine der gemessenen Routen: Start, Lernpfade und die Spieler mit Auswahl bzw.
Geschichte zuerst laden in Messbau 3 und 4 dieselben Bytes wie in Messbau 1 (Budget: 149,4 / 155,8 / 192,7 / 194,3 KB).

`lighthouse.mjs --routen routen-lighthouse-echt.json` (`routen.mjs lighthouse-echt`), Drosselung wie Abschnitt 1. Jede Route
verfehlte die Leistung zuerst unter Last (1,5–2,9) und wurde nach dem Sinken der Last (1,2–1,5) nachgemessen; die Tabelle
zeigt die Nachmessung.

| Route | Art | Leistung | Zugängl. | BP | SEO | LCP ms | CLS | TBT ms | JS KB (Grenze) | Last max | Ergebnis |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/lern-app/de` | Start | **86** | 100 | 100 | 100 | 2088 | 0 | 458 | 149,4 (180) | 2,02 | **verfehlt: Leistung** |
| `/lern-app/de/tr-aus-de` (43 Einheiten) | Lernpfad | **73** | 100 | 100 | 100 | 1949 | 0,001 | 1348 | 155,8 (180) | 1,51 | **verfehlt: Leistung** |
| `/lern-app/ar/de-aus-ar` (RTL, 43 Einheiten) | Lernpfad | **72** | 100 | 100 | 100 | 2004 | 0 | 1315 | 155,8 (180) | 1,84 | **verfehlt: Leistung** |
| `/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.e01.l01` (Auswahl) | Spieler | **79** | 100 | 100 | – | 1869 | 0,006 | 787 | 192,7 (210) | 1,21 | **verfehlt: Leistung** |
| `/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.b1.e01.l06` (Geschichte) | Spieler | **76** | 100 | 100 | – | 1906 | 0 | 999 | 194,3 (210) | 1,76 | **verfehlt: Leistung** |
| `/lern-app/ar/de-aus-ar/ueben?l=de-aus-ar.a1.e01.l01` (RTL) | Spieler | **78** | 100 | 100 | – | 1948 | 0,007 | 789 | 192,7 (210) | 1,86 | **verfehlt: Leistung** |

LCP ≤ 2,1 s, CLS ≤ 0,007, Zugänglichkeit und Best Practices 100, SEO 100 auf den indexierbaren Seiten („–“: `noindex`).
Die Leistung fällt allein über TBT (Gewicht 30 %): Mit dem Testkurs lag TBT bei 200–337 ms (Abschnitt 4), mit echten
Inhalten bei 458–1348 ms.

### C.4 INP mit echten Lektionen (CPU ×6, 3 Läufe, Median, Messbau 1)

`inp-spieler.mjs --echt`: Antworten ohne Kenntnis der Lösung (erste Option), Paare je ein Wort links und rechts. Im
Geschichte-Szenario erreichen die sechs Schritte noch keine Frage; gemessen ist nur „Weiter lesen“ (Szenario nach der
Gegenprüfung so benannt, vorher „Weiter lesen, Frage“). Die Spieler-Szenarien A1 und B1 liefen unter Last 4,8–4,9 und
wurden, weil unter 200 ms, nicht nachgemessen.

| Szenario | INP ms | je Schritt (Median, ms) | Öffnen ms | Last (max) | Ergebnis |
|---|---|---|---|---|---|
| Spieler `tr-aus-de.a1.e01.l01` (Auswahl, Auswahl, Paare) | 168 | Prüfen 168 · Antwort wählen 144 · Weiter 128 · Paare 120 | – | 4,93 | erfüllt |
| Spieler `tr-aus-de.b1.e01.l06` (Geschichte zuerst: Weiter lesen) | 176 | Weiter lesen 176 | – | 4,76 | erfüllt |
| Spieler `de-aus-ar.a1.e01.l01`, Oberfläche ar (RTL) | 184 | Weiter 184 · Prüfen 184 · Antwort wählen 144 · Paare 136 | – | 1,62 | erfüllt (nachgemessen; vorher 264 ms bei Last 4,27) |
| Lernpfad öffnen (Start → `tr-aus-de`, 43 Einheiten) und Einheit offline speichern | **416** | **offline speichern 416** · Lernpfad öffnen 112 | 3180 | 1,98 | **verfehlt** (nachgemessen; vorher 464 ms bei Last 1,6) |

Mit dem Testkurs lagen alle Szenarien bei 104–176 ms (Abschnitt 5); „offline speichern“ dort 104 ms, Öffnen 1461 ms.

### C.5 Ursachen und Vorschläge (offen)

Aus den Lighthouse-Berichten (lange Aufgaben, Hauptthread) – keine Behebung in N6, weil sie über den Auftrag hinausgeht und
einen weiteren Messbau braucht:

1. **Lernpfad (TBT 1,3 s, INP „offline speichern“ 416 ms):** Die Insel rendert alle 43–44 Einheiten mit Stationen, Sternen,
   Fortschritt und „offline speichern“ auf einmal; nach jedem `STAND_GEAENDERT` (automatisches Speichern der aktuellen und
   nächsten Einheit, „offline speichern“) lädt sie neu und rendert die ganze Liste erneut. Lange Aufgaben: React DOM 457 +
   361 ms, Stil/Layout des Dokuments 498 + 180 ms; Hauptthread Skript 1,46 s, Stil/Layout 0,79 s, Zeichnen 0,59 s.
   **Vorschlag:** nur die Stufe der aktuellen Einheit aufgeklappt rendern (übrige Stufen als `<details>` mit Zahl), Stationen
   mit `content-visibility: auto` und `contain-intrinsic-size`, nach „offline speichern“ nur die betroffene Station
   aktualisieren statt `laden()` für alle.
2. **Spieler (TBT 0,79–1,0 s):** React DOM 290–440 ms beim ersten Rendern, dazu die Prüfung des ganzen Einheitenpakets
   (≈ 115 KB, ≈ 120 Aufgaben) mit Zod auf dem Hauptthread: Schemas 183 ms bzw. 113 ms je Lauf (CPU ×4). Mit dem Testkurs
   (4 kleine Lektionen) fiel das nicht ins Gewicht. **Vorschlag:** Paket beim Speichern einmal prüfen und im Vorrat als
   geprüft merken (Hash ist ohnehin geprüft), beim Öffnen nur die gespielte Lektion prüfen; oder die Prüfung in einen
   Worker verlegen.
3. **Start (TBT 458 ms):** React DOM 445 ms (Kurskarten mit Fortschritt aus den Verzeichnissen). Vorschlag wie 1.
4. **Kalter Neubau unter Last** (C.1): 2,2–3,7 s je Richtung am Server; Rest ≈ 0,6–1 s Datenbank und ≈ 1,2–1,5 s Bau.
   Weiter möglich: Ergebnisse je Einheit nach Eingabe-Hash merken (unveränderte Einheiten nach einer Freigabe nicht neu
   bauen). Kein Abnahmekriterium; die Blockade ist behoben.
5. **Kalter Neubau auch durch fremde Einstellungen** (Gegenprüfung N6): Die Lern-App liest ihre Schalter über
   `ladeEinstellung('funktionen')` (Tag `einstellungen`); Next gibt die Tags innerer Caches an den äußeren Eintrag weiter
   (`propagateCacheLifeAndTagsToRevalidateStore`). Jede gespeicherte Einstellung (`inhaltGeaendert(TAG.einstellungen)`:
   Gebetszeiten samt Import, Spenden, Startklar) lässt deshalb alle Kursverzeichnisse und Pakete verfallen – im Betrieb und
   in der Website-E2E `verwaltung-gebetszeiten.spec.ts`; seit N6 kostet das 2–4 s je Richtung ohne lange Blockade. Den
   ausdrücklichen Tag an `ladeVerzeichnisJson`/`ladeEinheitJson` zu streichen reicht nicht. **Vorschlag:** Tags je
   Einstellung (`einstellung:<schlüssel>` in `ladeEinstellung`, die Schreiber lassen nur ihren Schlüssel verfallen) und in
   der Lern-App nur `einstellung:funktionen`; die Schalter werden heute nur direkt in der Datenbank gesetzt und brauchen
   danach `cache-erneuern` (BETRIEB.md). Nicht umgesetzt: betrifft die Cache-Tags der ganzen Website.

### C.6 Z-L07 neu eingeordnet (echte Inhalte)

| Teil von Z-L07 | Stand 26.10.2026 | Nachweis |
|---|---|---|
| Budgets KERN §9 | erfüllt: ausgelieferte echte Lektionen gemessen ≤ 59,8 KB (Reserve 0,2 KB, Sprechen); noch nicht ausgelieferte Formen der ersten Aufgabe geschätzt ≤ 58,7 KB (formen seit der Nacharbeit; vorher ≈ 60,5 KB, die Aussage „auch im ungünstigsten echten Fall“ zu `c9e586ce` galt nur für Ausgeliefertes) | C.2 (Messbau 4), übrige Budgets wie Abschnitt 3 |
| LCP ≤ 2,5 s | erfüllt | 6 Routen 1869–2088 ms |
| INP ≤ 200 ms | **teilweise**: Spieler 168–184 ms erfüllt; Lernpfad „offline speichern“ **416 ms verfehlt** | C.4 |
| CLS ≤ 0,1 | erfüllt | ≤ 0,007 |
| Lighthouse Leistung ≥ 90, Zugänglichkeit 100 | **Leistung verfehlt** (72–86), Zugänglichkeit 100 | C.3, Ursachen C.5 |
| Whisper nur nach Klick | unverändert erfüllt | Abschnitt 7; E2E `netzprotokoll` auf Messbau 2 grün |

**Vorschlag für Z-L07: „teilweise“** – Budgets, LCP, CLS, Zugänglichkeit und der Spieler-INP erfüllen; Lighthouse-Leistung
(alle Routen) und der INP des Lernpfads verfehlen mit echten Inhalten. Die Werte aus Abschnitt 11 („erfüllt“) galten für den
Testkurs. Behebung nach C.5 (Lernpfad, Paketprüfung im Spieler), danach Nachmessung mit `messlauf.sh lighthouse-echt
inp-echt budget`.

## Verlauf: L8-02 vom 24.10.2026 (Testkurs)

Die Abschnitte 1–11 sind der Stand vom 24.10.2026 (Messbauten `4d00cadf`/`fc95e675`/`fd11a59d`), gemessen mit dem
**Testkurs** – damals lagen keine Kursinhalte im Repository. Der Testkurs hieß damals `a1.e01`; seit N4 (Stufe C) heißt er
`a1.test`, und `a1.e01` ist die echte erste Einheit. Die Routen in den Tabellen sind deshalb auf `a1.test` umbenannt
(gemessen wurde damals der Testkurs). Den Stand mit echten Inhalten zeigt der Abschnitt „Stufe C, 26.10.2026, echte
Inhalte“ oben.

## 1. Methode

- **Produktionsbau** (je Lauf einer; `pnpm build`, Turbopack, `output: standalone`) mit `FUNKTION_LERNAPP`, `…_SYNC`, `…_SPRECHEN`,
  `…_MELDUNGEN`, `…_GRUPPEN` und `FUNKTION_KONTEN` = `an` (nur in `web/.env`, nie eingecheckt), gebaut gegen die
  Wegwerf-Datenbank `igmg_lernapp_d_e2e` (PostgreSQL 16, Seeds, Inhalte und Testkurs wie die Lern-App-E2E über
  `scripts/e2e-datenbank.mjs`). Server `scripts/start-standalone.mjs` auf Port 3224, PID gemerkt.
- **Drei Bauten:** Lauf 1 (Stand `4d00cadf`) misst alles; Lauf 2 (Stand `fc95e675`, nach der Behebung B-1) misst nur die
  betroffenen Routen nach (`MESS_FILTER`, Lighthouse, axe) und wiederholt das Netzprotokoll mit Endzustand; Lauf 3 (Stand
  `fd11a59d`, nach der Gegenprüfung und der Behebung B-2) wiederholt nur das Netzprotokoll (`messlauf.sh whisper`).
- **Je Lauf ein Aufruf** `MESS_ENV=<.env-Vorlage> bash _lernapp/werkzeuge/leistung/messlauf.sh [teile]` unter dem gemeinsamen
  Schloss `bau.lock` (Voraussetzungen und Schalter im Kopf des Skripts; den Verweis auf `web/node_modules` legt es selbst an): Datenbank,
  Bau, Server, Anmeldungen (`konten.mjs`: Lehrkraft mit Gruppe, Kind, Eltern – Platzhalter, Wegwerf-Daten), Aufwärmen,
  Messungen, Server per PID beenden, `.next`, `test-results` und `.env` löschen; danach endet es und gibt das Schloss frei
  (die Auftragsschleife für Nachmessungen gegen denselben Server läuft seit der Gegenprüfung nur noch mit
  `MESS_AUFTRAG_S=<sekunden>`; vorher hielt sie das Schloss standardmäßig bis zu 3 h). Vor dem Schloss wartet das Skript auf
  mindestens 4 GB freien Platz (dezimal, 3815 MiB; vorher 4096 MiB, bei 4,0 GB frei wartete es vergeblich).
- **Berichtigung im Lauf:** Die Umgebung setzt `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers` (Chromium-Build 1194); die
  Playwright-Version aus `web/` (1.64.0) erwartet Build 1248. Der erste Durchgang der Browser-Werkzeuge brach deshalb sofort
  ab; der Lasttest (ohne Browser) lief. Die Browser-Teile liefen danach gegen **denselben Bau und Server** als Auftrag der
  Auftragsschleife des Messlaufs mit dem Browserordner der E2E. `messlauf.sh` setzt den Pfad jetzt selbst (`MESS_BROWSER`)
  und löscht nach dem Bau `.next/server` (Kopie liegt in `.next/standalone`, ≈ 1,4 GB): Nach dem Bau waren nur noch
  1,15 GB frei, nach dem Löschen 2,5 GB.
- **Lighthouse** 13.5.0 mobil, Drosselung „devtools“ mit dem mobilen Profil (Nennwerte 150 ms RTT, 1,6 Mbit/s, CPU ×4;
  angewandt laut `configSettings` 562,5 ms Anfragelatenz und 1474,56 kbit/s – Lighthouse rechnet bei „devtools“ RTT × 3,75
  und Durchsatz × 0,9, also strenger als die Nennwerte; „simulate“ ist gegen localhost zu pessimistisch, E-026), 3 Läufe je
  Route, Median. Kategorien Leistung, Zugänglichkeit, Best Practices, SEO (SEO nur auf
  indexierbaren Seiten gewertet).
- **INP** (Labor): Playwright mit CPU-Drosselung ×6 (CDP `Emulation.setCPUThrottlingRate`), Event-Timing-API, 3 Läufe je
  Szenario, Median; Interaktionen im Spieler (Antwort wählen, Prüfen, Weiter, Wortbank, Paare, Tastatur-Eingabe,
  Bildschirmtastatur) und das Öffnen des Lernpfads (Seitenwechsel Start → Lernpfad) samt „offline speichern“.
- **axe** (axe-core 4.13.0 über `@axe-core/playwright` 4.13.0), Regeln WCAG 2.0/2.1/2.2 A/AA, auf allen Lern-App-Routen in de/tr/ar
  × 390/1440 px, dazu der Spieler nach der Antwort, die Fehlerseite, `/lernen` in de/tr/en und die Lern-App-Seiten in
  Mein Bereich (mit Anmeldung, de/tr/en).
- **JavaScript je Route:** `scripts/lernapp-budget.mjs` (KERN §9 in der Fassung nach Spike S1: Grundstock und
  Lern-App-eigener Anteil, gz -9 je Datei, Service Worker gesperrt) und `scripts/messen.mjs` (Lighthouse-Weg der Website).
- **Lastregel:** `uptime` vor jeder Messung; verfehlt eine Route eine lastabhängige Schwelle (Leistung, LCP, CLS, INP) bei
  Last > 1,5, misst das Werkzeug sie einmal nach, sobald die Last sinkt (höchstens 5 min, danach 2 min); sonst „unter Last“.

## 2. Gerätprofil und Last

| | |
|---|---|
| Maschine | 4 Kerne, 15 GB Arbeitsspeicher, Linux 6.18 (Firecracker), Platte knapp (4,0 GB frei vor dem Bau) |
| Browser | Chromium 141.0.7390.37 (Headless Shell), Node 24.21.0 |
| Server | Next.js 16.4.2 standalone, `NODE_ENV=production`, PostgreSQL 16 lokal, Pool höchstens 10 Verbindungen |
| Parallel | Inhalts-Agenten mit `lernapp:pruefen`, `tsc`, Vitest (wenig, aber spürbar CPU) |
| Last (1 min) | Lauf 1: Bau 4,6–5,3 · `messen.mjs` 2,7–2,8 · Netzprotokoll 2,8–3,6 · Lasttest 4,4–4,7 · INP 3,6–7,2 · Lighthouse 7,2 → 1,3 · axe 1,8–2,0. Lauf 2: Bau 4,8 · Lighthouse 2,8–3,8 · axe 2,1–3,4 · Netzprotokoll 2,1–2,6 |

Die Last lag fast während der ganzen Messung über 1,5. Alle Zeitwerte sind deshalb **obere Schätzungen**; wo eine Route trotzdem
erfüllt, ist das belastbar.

## 3. JavaScript beim ersten Laden (KERN §9)

`lernapp-budget.mjs`, gz -9 je Datei. Grundstock Next/React (gemeinsam von `/` und der Hülle): **135,3 KB** (8 Dateien).

| Teil | Route | gesamt KB | eigener Anteil KB | Budget | Ergebnis |
|---|---|---|---|---|---|
| Hülle | `/lern-app/de/quellen` | 143,8 | 8,4 | eigen ≤ 20 | erfüllt |
| Start | `/lern-app/de` | 149,3 | 14,0 | ≤ 180, eigen ≤ 30 | erfüllt |
| Lernpfad | `/lern-app/ar/de-aus-ar` | 154,6 | 19,2 | ≤ 180, eigen ≤ 30 | erfüllt |
| Fortschritt | `/lern-app/de/fortschritt` | 153,3 | 17,9 | ≤ 180, eigen ≤ 30 | erfüllt |
| Spieler (l01, erste Aufgabe) | `/lern-app/tr/de-aus-tr/ueben?l=de-aus-tr.a1.test.l01` | 192,2 | +55,4 über der Hülle | ≤ 210, zusätzlich ≤ 60 | erfüllt |
| Spieler (l02, Wortbank zuerst) | `…/ueben?l=de-aus-tr.a1.test.l02` | 194,5 | – | ≤ 210 | erfüllt |
| Wiederholen ohne Karten | `/lern-app/de/tr-aus-de/wiederholen` | 152,2 (ohne Zod) | – | ≤ 210 | erfüllt |
| Einstufung vor dem Start | `/lern-app/de/tr-aus-de/einstufung` | 152,2 (ohne Zod) | – | ≤ 210 | erfüllt |
| Spieler-Chunk | – | 37,3 | – | (im Spieler-Anteil) | – |
| Übungstypen (26) | – | 1,0 (grammatik_tipp) bis 11,6 (schrift_tr, schrift_latein) | – | je ≤ 15 | erfüllt |
| Arabische Bildschirmtastatur | – | 1,5 | – | ≤ 10 | erfüllt |

Übungstypen im Einzelnen (KB): auswahl 2 · paare 2,9 · wortbank 4,6 · bild_wort 3 · frei 5,2 · hoeren_waehlen 7,3 ·
hoeren_schreiben 9,8 · minimalpaare 7,3 · luecke 8 · satzbau 4,6 · formen 6,6 · harakat 4,4 · wahr_falsch 3,2 ·
zuordnen 3,9 · reihenfolge 3,2 · fallfrage 3,5 · koran_wort 2,7 · dialog 9,6 · geschichte 9,9 · lesen_fragen 5,5 ·
grammatik_tipp 1 · schrift_ar 5,3 · schrift_tr 11,6 · schrift_latein 11,6 · sprechen 9,7 · schreiben 3,3.

**Zu den Zahlen im Auftrag** („Hülle ≤ 120 KB, Start/Lernpfad ≤ 150 KB, Spieler-Route ≤ 180 KB“, ebenso der Wortlaut von
Z-L07 in `ABNAHME.md`): Das sind die Budgets vor der Fortschreibung von KERN §9 am 16.10.2026 (Spike S1: Next/React allein
≈ 128 KB, heute 135,3 KB). Gemessen wird nach der geltenden Fassung (eigener Anteil plus Gesamtgrenze 180/210/230 KB).
Gegen die alten Gesamtzahlen läge nur die Hülle (143,8 > 120) bzw. jede Route über ihnen – allein wegen des Grundstocks.
Vorschlag: den Wortlaut von Z-L07 an KERN §9 angleichen (Orchestrator; ABNAHME hier nicht geändert).

## 4. Lighthouse je Route (mobil, Median aus 3 Läufen)

Erster Messlauf (Stand `4d00cadf`), 25 Routen. JS = Summe gz -9 der geladenen Skripte (Grenze nach Art, KERN §9).
„nachgemessen“: Das Werkzeug hat die Route nach einer verfehlten Schwelle bei Last > 1,5 einmal wiederholt, sobald die
Last sank; die Tabelle zeigt dann die Nachmessung.

| Route | Art | Leistung | Zugängl. | BP | SEO | LCP ms | CLS | TBT ms | JS KB (Grenze) | Last max | Ergebnis |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/lern-app` (308 → `/lern-app/de`) | Start | 90 | 100 | 100 | 100 | 2442 | 0 | 259 | 149,3 (180) | 7,24 | erfüllt |
| `/lern-app/de` | Start | 95 | 100 | 100 | 100 | 1876 | 0 | 210 | 149,3 (180) | 3,83 | erfüllt |
| `/lern-app/tr` | Start | 95 | 100 | 100 | 100 | 1904 | 0,001 | 211 | 149,3 (180) | 3,21 | erfüllt |
| `/lern-app/ar` (RTL) | Start | 91 | 100 | 100 | 100 | 2060 | 0 | 300 | 149,3 (180) | 3,64 | erfüllt |
| `/lern-app/de/tr-aus-de` | Lernpfad | 93 | 100 | 100 | 100 | 1835 | 0,029 | 279 | 154,6 (180) | 2,61 | erfüllt |
| `/lern-app/tr/de-aus-tr` | Lernpfad | 94 | 100 | 100 | 100 | 1858 | 0,031 | 233 | 154,6 (180) | 1,77 | erfüllt |
| `/lern-app/ar/de-aus-ar` (RTL) | Lernpfad | 92 | 100 | 100 | 100 | 1914 | 0,067 | 267 | 154,6 (180) | 1,83 | erfüllt |
| `/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.test.l01` | Spieler | 92 | 100 | 100 | – | 1793 | 0,006 | 302 | 192,2 (210) | 1,73 | erfüllt |
| `/lern-app/tr/de-aus-tr/ueben?l=de-aus-tr.a1.test.l01` | Spieler | 93 | 100 | 100 | – | 1815 | 0,011 | 264 | 192,2 (210) | 1,30 | erfüllt |
| `/lern-app/ar/de-aus-ar/ueben?l=de-aus-ar.a1.test.l01` (RTL) | Spieler | 90 | 100 | 100 | – | 1856 | 0,007 | 337 | 192,2 (210) | 1,37 | erfüllt |
| `/lern-app/de/tr-aus-de/wiederholen` | Spieler | 95 | 100 | 100 | – | 1837 | 0 | 216 | 152,2 (210) | 1,83 | erfüllt |
| `/lern-app/de/tr-aus-de/einstufung` | Spieler | 95 | 100 | 100 | – | 1834 | 0 | 200 | 152,2 (210) | 1,60 | erfüllt |
| `/lern-app/de/tr-aus-de/tipps?e=tr.a1.test` | Hülle | **87** | 100 | 100 | – | 1805 | **0,151** | 272 | 176,5 (180) | 1,80 | **verfehlt: Leistung, CLS** (nachgemessen) |
| `/lern-app/de/quellen` | Hülle | 93 | 100 | 100 | 100 | 1908 | 0 | 273 | 143,8 (180) | 2,39 | erfüllt |
| `/lern-app/de/fortschritt` | Start | 95 | 100 | 100 | – | 1792 | 0 | 233 | 153,3 (180) | 2,55 | erfüllt |
| `/lern-app/de/wortschatz` | Hülle | 96 | 100 | 100 | – | 1787 | 0 | 178 | 138,0 (180) | 1,99 | erfüllt |
| `/lern-app/de/einstellungen` | Hülle | 96 | 100 | 100 | – | 1912 | 0 | 180 | 149,9 (180) | 1,68 | erfüllt |
| `/lern-app/de/gruppe` (ohne Anmeldung) | Hülle | 93 | 100 | 100 | – | 1821 | 0 | 261 | 148,5 (180) | 2,36 | erfüllt |
| `/lern-app/de/anmelden` | Hülle | 95 | 100 | 100 | – | 1788 | 0 | 217 | 145,1 (180) | 2,29 | erfüllt |
| `/lern-app/de/islam` (Wissenskurs) | Lernpfad | 96 | 100 | 100 | 100 | 1846 | 0 | 188 | 154,6 (180) | 2,07 | erfüllt |
| `/lern-app/tr/koran` (Koran-Arabisch) | Lernpfad | **86** | 100 | 100 | 100 | 1842 | **0,19** | 224 | 154,6 (180) | 2,04 | **verfehlt: Leistung, CLS** (nachgemessen) |
| `/lernen` (Website, Stationen) | Website | 95 | 100 | 100 | 100 | 1778 | 0 | 230 | 161,2 (180) | 2,81 | erfüllt |
| Mein Bereich › Unterricht › Gruppe › Lern-App (Lehrkraft) | Mein Bereich | 93 | 100 | 100 | – | 1877 | 0 | 282 | 181,9 (230) | 3,57 | erfüllt |
| Mein Bereich, Schüler-Start (Kind) | Mein Bereich | 94 | 100 | 100 | – | 1863 | 0 | 252 | 181,9 (230) | 2,92 | erfüllt |
| Mein Bereich › Kinder › Lernwoche (Eltern) | Mein Bereich | 93 | 100 | 100 | – | 1991 | 0 | 256 | 186,3 (230) | 2,24 | erfüllt (nachgemessen) |

- **Zugänglichkeit 100 auf allen 25 Routen**, Best Practices 100. SEO 100 auf allen indexierbaren Seiten; „–“ steht für
  `noindex`-Seiten (Lighthouse wertet dort 63–66, gewollt).
- **LCP ≤ 2,5 s überall** (1778–2060 ms; der Einstieg `/lern-app` 2442 ms, weil die Weiterleitung 308 eine zusätzliche
  Anfrage mit der angewandten Latenz von 562,5 ms kostet). **CLS ≤ 0,1 überall außer Tipps und Koran-Arabisch.**
- **Verfehlt (vor der Behebung): Tipps und Koran-Arabisch.** Das Werkzeug weist beide als „unter Last“ aus (Last max
  1,8 bzw. 2,0). Die Ursache ist aber nicht die Last: Die Verschiebung ist in jedem Lauf gleich (0,151 bzw. 0,19), und
  Lighthouse nennt als einziges verschobenes Element den Fuß (`body > footer`). Die Insel lädt ihr Verzeichnis bzw. das
  Einheitenpaket erst im Browser; bis dahin steht nur „wird geladen“ da, der Fuß liegt im ersten Bildschirm und springt
  nach unten. Der Leistungswert sinkt allein durch CLS (Gewicht 25 %). Behebung in Abschnitt 9.
- **TBT** liegt auf den meisten Routen über 200 ms (178–337 ms, CPU ×4 bei Last 1,3–7,2). TBT ist kein Kriterium von
  Z-L07 (dort INP, Abschnitt 5); Hinweis in Abschnitt 10.
- Die Spieler-Routen liegen mit 192,2 KB unter 210 KB; die Tipps mit 176,5 KB knapp unter 180 KB (Tiptap-Darstellung
  der Tipps, Hinweis in Abschnitt 10).
- Nicht gemessen mit Lighthouse: `/lern-app/ar/koran` (Koran-Arabisch gibt es in der Oberfläche ar nicht,
  `kurse.ts`), die übrigen Oberflächen von Tipps, Fortschritt usw. (gleicher Code wie de; axe prüft sie in allen drei).
  `/de/lernen` heißt im Code `/lernen` (Standardsprache ohne Präfix).
- **Nicht im Umfang:** die Verwaltungsseiten der Lern-App (`/verwaltung/lernapp/**`, 11 Seiten: Übersicht, Kurse,
  Befunde, Meldungen, Quellen, Audio, Prüfende, Religiöse Bausteine, Sprachprüfung je mit Unterseiten). Z-L06 und Z-L07
  gelten für die Lern-App-Routen in de/tr/ar und Mein Bereich; die Verwaltung (nur de, ADR 0016) misst weder Lighthouse
  noch axe dieses Berichts.

Zum Vergleich der Website-Messweg `scripts/messen.mjs` (je 1 Lauf, Last 2,7–2,8):

| Route | Leistung | Zugängl. | BP | SEO | LCP ms | CLS | TBT ms | JS KB | simuliert (P / LCP) |
|---|---|---|---|---|---|---|---|---|---|
| `/lern-app/de` | 92 | 100 | 100 | 100 | 1988 | 0,001 | 277 | 162,1 | 85 / 3695 |
| `/lern-app/ar/de-aus-ar` | 92 | 100 | 100 | 100 | 1957 | 0,067 | 246 | 167,3 | 93 / 2449 |
| `/lern-app/tr/de-aus-tr/ueben?l=…l01` | 91 | 100 | 100 | (66, `noindex`) | 1807 | 0,011 | 319 | 161,7 | 82 / 3857 |

`messen.mjs` wertet TBT ≤ 200 ms als Labor-Ersatz für INP und meldet deshalb „verfehlt: TBT“. Für die Abnahme zählt INP
(Abschnitt 5); TBT steht hier als Hinweis.

## 5. INP (CPU ×6, 3 Läufe, Median)

| Szenario | INP ms | je Schritt (Median, ms) | Öffnen ms | Last (max) | Ergebnis |
|---|---|---|---|---|---|
| Spieler l01 (Auswahl, Paare, Wortbank) | 168 | Paare antippen 160 · Antwort wählen 128 · Prüfen 160 · Weiter 136 · Wortbank antippen 120 | – | 4,56 | erfüllt |
| Spieler l03 (Bildkarte, Freitext mit Tastatur) | 176 | Antwort wählen 176 · Prüfen 128 · Weiter 96 · Tastatur-Eingabe 40 | – | 5,65 | erfüllt |
| Spieler l03 ar-aus-de (Freitext mit Bildschirmtastatur) | 168 | Prüfen 136 · Bildschirmtastatur 112 · Antwort wählen 128 · Weiter 88 · Tastatur öffnen 48 | – | 6,26 | erfüllt |
| Lernpfad öffnen (Start → Lernpfad) und Einheit offline speichern | 104 | offline speichern 104 · Lernpfad öffnen 40 | 1461 | 7,0 | erfüllt |

Alle Szenarien ≤ 200 ms, obwohl die Last bei 3,6–7,2 lag (CPU ×6 auf einer ohnehin belegten Maschine). Der höchste
Einzellauf: 200 ms (Antwort wählen, l03, Last 5,65).

## 6. axe (de/tr/ar × 390/1440)

`a11y.mjs`, erster Messlauf: **136 Prüfungen (68 Routen × 2 Breiten), 0 kritisch, 0 ernst – und auch 0 mittel, 0 gering,
kein waagrechter Überlauf**, keine Fehlerseite statt Inhalt. Last 1,8–2,0.

Geprüft je Oberfläche de, tr und ar (`dir="rtl"` in ar): Start, Lernpfad, Spieler l01 (Auswahl) vor und nach der Antwort
(Rückmeldeblatt), l02 (Wortbank), l03 (Bildkarte), l04 (Dialog), Wiederholen, Einstufung, Tipps, Fortschritt, Wortschatz,
Einstellungen, Quellen, Gruppe (ohne Anmeldung), Anmelden, Wissenskurs, Koran-Arabisch (nur de und tr), die eigene
Fehlerseite (absichtlich); dazu `/lernen`, `/tr/ogren`, `/en/learn` und mit Anmeldung die Lern-App-Seiten in Mein Bereich
in de/tr/en (Lehrkraft: Gruppe › Lern-App; Kind: Schüler-Start; Eltern: Lernwoche des Kindes). Jede Seite erst nach dem
geladenen Zustand der Insel (Selektor je Route), damit der Client-Inhalt mitgeprüft wird.

Die Prüfung mit Screenreadern (LM-19) und „jeder Übungstyp per Tastatur“ (E2E je Typ) gehören zu Z-L06 und sind nicht Teil
dieses Laufs. Ebenfalls nicht im Umfang: die Verwaltungsseiten der Lern-App (`/verwaltung/lernapp/**`, Abschnitt 4).

## 7. Sprechmodul: Whisper nur nach Klick (Netzprotokoll)

`whisper-netz.mjs`, Lektion l04 (de, tr-aus-de) bis zur Sprechaufgabe. Seit der Gegenprüfung erwartet das Werkzeug jede der
10 Download-Dateien (`DOWNLOAD_PFADE` in `web/src/lib/lernapp/sprechen/modell.ts`: 7 Modell- und Konfigurationsdateien, ORT
`.mjs` und `.wasm`, Worker) **genau einmal über das Netz** – Anfrage des Service Workers oder eine nicht vom Service Worker
beantwortete Anfrage der Seite bzw. eines Workers (Playwright meldet sonst jede Datei doppelt) – und wertet „erfüllt“ nur
mit „bereit“.

**Lauf 3 (Stand `fd11a59d`, nach B-2), Last 2,9 → 2,6:**

- **Vor dem Klick: 79 Anfragen, davon 0 unter `/lern-app/modelle/`** – kein Modell, kein Worker, kein WASM.
- **Nach dem Klick: alle 10 Download-Dateien je genau einmal über das Netz**, keine fehlt, keine doppelt; dazu 11
  Anfragen von Seite und Worker, die der Service Worker aus seinem Vorrat beantwortet. Übertragen ≈ 81,5 MB (Encoder 23,2 MB
  und Decoder 53,7 MB ungepackt, Tokenizer, Konfiguration, ORT-`.wasm` und Worker gepackt; ungepackt sind es die ≈ 95 MB
  aus KERN §9).
- **„bereit“ nach 7 s** – „bereit“ erscheint erst nach einem gelungenen Probelauf (`bewerteProbe` ≤ 12 s). Konsole von Seite
  und Worker leer. Nur GET, keine fremden Ursprünge.

**Läufe 1 und 2 (Stand mit `a0795f7b`) – richtiggestellt:** Beide endeten ohne „bereit“ (Lauf 1 wartete 10 min, Lauf 2
fiel nach ≈ 11 s auf die eigene Aufnahme zurück). Die erste Fassung dieses Berichts schrieb das dem kopflosen Chromium zu
(„Laden und Rückfall arbeiten also wie vorgesehen“). **Das war falsch.** Ursache war die Behebung B-0 (`a0795f7b`) selbst:
Mit absolutem Modellordner meldete transformers.js 4.3 Tokenizer und Prozessor als fehlend (Abschnitt 9, B-2). Deshalb
fehlten nach dem Klick `tokenizer.json`, `tokenizer_config.json` und `preprocessor_config.json` (nur 7 der 10 Dateien), und
die „≈ 74 MB über das Netz“ waren nicht der vollständige Download, sondern nur diese 7 Dateien. Auf jedem Gerät mit leerem
Vorrat wäre die Spracherkennung dauerhaft im Rückfall geblieben (`geraet.ts` merkt sich das Urteil je Gerät). `a0795f7b`
war nie auf `main` oder `claude/trusting-lovelace-6nfolz`; kein ausgeliefertes Gerät ist betroffen.

**Rauchtest ohne Next-Bau** (`web/scripts/lernapp/sprechen-rauchtest.mjs`, echter Worker und Service Worker, Kopfzeilen
und CSP der Lern-App, nach B-2): Variante A (Vorrat über transformers.js) und B (nur über den Service Worker) bestanden –
online Laden 2,5–2,7 s, Probelauf 2,7–3,6 s, eine Erkennung, danach ohne Netz ein neuer Worker aus dem Vorrat (Laden
1,4–1,5 s, Probelauf 2,8–3,0 s); jede Download-Datei erreicht den Server genau einmal; 0 Konsolenmeldungen.

**Nachtrag Stufe C N9b (26.10.2026): echtes Modell bis zur Erkennung, Mitschrift am Draht.** Beleg
`_lernapp/belege/Z-L08-sprechen-datenfluss.md`, Bau aus `515a463f` ohne `E2E_ATTRAPPEN` (echter Worker, 693 KB), Lauf
18:14 UTC, Last 1,2 → 1,8.

- **Zwei unabhängige Mitschriften.** (1) Playwright (`context.on('request')`) mit Seite, Workern und Service Worker;
  Status und „vom Service Worker beantwortet“ hält das Werkzeug beim Ereignis fest – Playwright 1.64 liefert
  `request.response()` für ältere Anfragen als `null` (im Probelauf um 15:09 ab der 20. Anfrage), deshalb galten dort alle
  Download-Dateien fälschlich als doppelt. (2) **Am Draht:** Chromium schickt jede Anfrage über einen Proxy im Werkzeug
  (`proxy` mit `<-loopback>`, also auch die an `localhost`). Er leitet nur an den eigenen Ursprung weiter, lehnt alles
  andere mit 403 ab (`CONNECT` ebenso) und schreibt je Anfrage Methode, URL, Status, Bytes und ob ein `Cookie`- bzw.
  `Set-Cookie`-Kopf dabei war. Nur was dort erscheint, hat den Browser verlassen; „genau einmal über das Netz“ zählt seither
  am Draht, nicht mehr aus der Playwright-Mitschrift.
- **Ablauf:** Lektion l04 (de, tr-aus-de) bis zur Sprechaufgabe, „Sprachprüfung laden“, Warten auf „bereit“, Aufnahme über
  das Testmikrofon von Chromium (`--use-fake-device-for-media-stream`, `--use-file-for-fake-audio-capture` mit einer WAV aus
  dem synthetischen Testbündel tr, 8 Clips, 6,7 s), Erkennung bis zum Ergebnis („nicht verstanden“ nach 6,6 s – bei
  synthetischem Ton erwartet).
- **Ergebnis erfüllt:** vor dem Klick 79 Anfragen, 0 unter `/lern-app/modelle/`. Nach dem Klick alle **11 Download-Dateien
  (`DOWNLOAD_PFADE`: 7 Modell- und Konfigurationsdateien, ORT `.mjs` und `.wasm`, Worker, Lizenzhinweise von ONNX Runtime)
  je genau einmal am Draht, ≈ 81,5 MB**; „bereit“ nach 17 s. Während der Aufnahme ein nachgeladener Chunk (GET, eigener
  Ursprung), während der Erkennung nur eine `blob:`-Adresse im Browser, danach nichts. Über alle Phasen **nur GET an den
  eigenen Ursprung, 0 fremde Hosts, 0 Anfragen mit `Cookie`, 0 Antworten mit `Set-Cookie`, 0 Cookies im Kontext**; am
  Draht 65 Anfragen (82,2 MB), in Playwright 105 (Seite und Worker 51, davon 25 vom Service Worker beantwortet; Service
  Worker 54). Konsole von Seite und Workern leer.

## 8. Lasttest Abgleich (`POST /api/lernapp/sync`)

`lasttest-sync.mjs`, Wegwerf-Datenbank `igmg_lernapp_d_e2e`: 200 Konten (Platzhalter, Einwilligung `lernapp` und Sitzung
per SQL, Sitzungs-Cookie wie Better Auth signiert), je Konto 3 Pakete (je ein eigenes Gerät) à 40 Ereignisse, alle
Anfragen einer Welle gleichzeitig (Node `fetch` + `Promise.all`, keine neue Abhängigkeit).

| Welle | Anfragen | Dauer s | je s | p50 ms | p95 ms | p99 ms | max ms | Status | Fehler % | 429 % | angenommen | doppelt | DB-Verbindungen max (aktiv) | Last |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1: 200 × 3 gleichzeitig (neu) | 600 | 12,09 | 49,6 | 9157 | 11924 | 11944 | 11988 | 200: 600 | 0 | 0 | 24000 | 0 | 11 (6) | 4,52 → 4,53 |
| 2: dieselben Pakete noch einmal | 600 | 7,13 | 84,2 | 5017 | 6909 | 7079 | 7096 | 200: 600 | 0 | 0 | 0 | 24000 | 12 (6) | 4,53 → 4,68 |
| 3: 200 × 3 Folgeereignisse | 600 | 10,71 | 56,0 | 8799 | 10621 | 10640 | 10657 | 200: 600 | 0 | 0 | 24000 | 0 | 11 (8) | 4,68 → 4,42 |
| Bremse: 5 Konten × 40 gleichzeitig | 200 | 1,33 | 150,8 | 924 | 1277 | 1305 | 1316 | 200: 105, 429: 95 | 0 | 47,5 | 0 | 0 | 11 (7) | 4,42 |

- **Fehlerquote 0 %**, keine 5xx, keine Zeitüberschreitung; die Verbindungen zur Datenbank bleiben bei höchstens 12
  (Pool 10 plus Messverbindung und Verwaltung).
- **Idempotenz erfüllt:** nach Welle 1 24 000 Ereignisse, nach Welle 2 (gleiche Kennungen Gerät + seq) weiter 24 000,
  0 Dubletten; Ableitungen gleich (Karten 800/800, Tage 200/200, Tage je Kurs 200/200, Prüfsummen gleich). Nach Welle 3
  48 000 Ereignisse, 0 Dubletten.
- **Raten-Grenze ehrlich eingeordnet:** Die Bremse gilt je Konto (30 Anfragen je Minute, `pruefeRate('lernapp-sync',
  benutzerId)`), nicht je IP. 200 Konten mit je 3 Paketen je Welle (9 in gut 30 s) liegen darunter – es war **keine
  Ausnahme** nötig, 429 = 0 in den Wellen 1–3. Die Bremsen-Welle zeigt, dass sie greift: je Konto 30 − 9 bereits
  verbrauchte = 21 angenommen (5 × 21 = 105), der Rest 429 `bremse` mit `Retry-After`.
- **Antwortzeit:** p50 ≈ 9 s, p95 ≈ 12 s, wenn 600 Pakete à 40 Ereignisse im selben Augenblick ankommen (Durchsatz
  ≈ 50 Pakete bzw. ≈ 2000 Ereignisse je Sekunde, begrenzt durch den Pool von 10 Verbindungen und die Last 4,5 der
  Maschine). Im Betrieb kommen Abgleiche verteilt (nach Lektionsende, beim Seitenwechsel); 600 gleichzeitige Pakete sind
  der ungünstigste Fall. Keine Schwelle im Auftrag; Einordnung und Vorschlag in Abschnitt 10.

## 9. Behebungen

| Nr. | Befund | Ursache | Behebung | Test | Vorher → nachher |
|---|---|---|---|---|---|
| B-1 | CLS 0,19 auf `/lern-app/tr/koran`, 0,151 auf `…/tipps?e=…` (Leistung 86 bzw. 87); kleiner auf den Sprach-Lernpfaden (0,029–0,067) | Insel lädt Verzeichnis bzw. Paket erst im Browser; der Fuß steht während „wird geladen“ im ersten Bildschirm und springt | `fc95e675`: Lernpfad-Abschnitt und Tipps reservieren eine Bildschirmhöhe (`min-h-svh`) – dieselbe Bauweise wie Üben, Einstufung und Wiederholen | `tests/unit/lernapp/platz-regeln.test.ts` (6 Fälle; ohne die Behebung 3 rot) | siehe Tabelle unten |
| B-0 | (früherer Lauf dieses Pakets) Sprechübung lud Encoder, Decoder und Tokenizer zweimal | – | `a0795f7b` (absoluter Modellordner) – **falsch, ersetzt durch B-2** (Gegenprüfung): Tokenizer und Prozessor galten als fehlend, Probelauf scheiterte | der damalige Unit-Test prüfte nur „kein Abruf“, nicht `exists` | Läufe 1 und 2: nur 7 von 10 Dateien, kein „bereit“ (Abschnitt 7) |
| B-2 | Gegenprüfung: Spracherkennung auf jedem Gerät mit leerem Vorrat im Rückfall (Folge von B-0); ursprünglich doppelte Last | transformers.js 4.3: `get_file_metadata` prüft den eigenen Ursprung nur bei relativem Modellordner; die Fortschrittsmeldung an `pipeline()` löste je Datei eine Vorabfrage per vollständigem GET aus, die der Service Worker zusätzlich zur eigentlichen Anfrage aus dem Netz holte | `ebaa9d5a`: Modellordner wieder relativ (`TRANSFORMERS_UMGEBUNG`); der Worker legt Modell und ORT-`.wasm` vor dem Aufbau der Pipeline selbst in den Vorrat (`fuelleVorrat`: je Datei ein Abruf, Fortschritt nach Bytes, erst ganz lesen, dann ablegen) und übergibt der Pipeline keine Fortschrittsmeldung; Fehler im Worker als Konsolenwarnung (Art und Meldung) | Unit `sprechen-einmal-laden` (10 Fälle, am gebündelten Browser-Bau: `exists` für alle 7 Dateien, `get_pipeline_files` mit Tokenizer und Prozessor, WhisperTokenizer und WhisperProcessor laden, kein Abruf; Gegenprobe absoluter Pfad; mit absolutem Pfad 2 Fälle rot); Rauchtest mit Zählung je Datei | Lauf 3: 10 von 10 Dateien je einmal über das Netz, „bereit“ nach 7 s (Abschnitt 7) |

Nachmessung B-1 (zweiter Bau, Stand `fc95e675`, nur die betroffenen Routen, `MESS_FILTER`), Lighthouse mobil, Median aus 3,
Last 2,8–3,8:

| Route | Leistung vorher → nachher | CLS vorher → nachher | LCP ms nachher | TBT ms nachher | Last max nachher |
|---|---|---|---|---|---|
| `/lern-app/tr/koran` | 86 → **92** | 0,19 → **0** | 1872 | 292 | 3,05 |
| `/lern-app/de/tr-aus-de/tipps?e=tr.a1.test` | 87 → **93** | 0,151 → **0** | 1798 | 276 | 3,36 |
| `/lern-app/de/tr-aus-de` | 93 → 94 | 0,029 → **0** | 1826 | 231 | 3,80 |
| `/lern-app/tr/de-aus-tr` | 94 → 94 | 0,031 → **0** | 1911 | 220 | 2,78 |
| `/lern-app/ar/de-aus-ar` (RTL) | 92 → 93 | 0,067 → **0** | 1899 | 250 | 3,55 |
| `/lern-app/de/islam` | 96 → 95 | 0 → 0 | 1861 | 210 | 2,94 |

Zugänglichkeit, Best Practices und SEO unverändert 100 (Tipps `noindex`). JS unverändert (nur eine Klasse). axe nach der
Behebung auf Lernpfad, Tipps, Wissenskurs und Koran-Arabisch in de/tr/ar × 390/1440: 22 Prüfungen, 0 Befunde jeder
Schwere, kein Überlauf.

Weitere Ursachen mit klarer, örtlicher Behebung fanden sich nicht: Budgets, INP, LCP und axe waren schon im ersten Lauf
erfüllt.

## 10. Offene Befunde und Vorschläge

1. **Z-L07-Wortlaut** nennt noch die Budgets vor der Fortschreibung von KERN §9 (Hülle 120, Start/Lernpfad 150,
   Spieler 180 KB gesamt). Vorschlag: an KERN §9 angleichen (eigener Anteil 20/30/60 KB, gesamt 180/210/230 KB), sonst
   ist Z-L07 allein wegen des Next/React-Grundstocks (135,3 KB) nicht erfüllbar. Orchestrator; ABNAHME hier nicht geändert.
2. **Probelauf der Sprachprüfung** (Abschnitt 7): Nach B-2 gelingt er auf diesem Rechner (kopflos, ohne GPU, Last 2–3) in
   2,7–3,6 s, also „normal“ (≤ 5 s). Vorschlag: auf einem echten Mittelklasse-Telefon (Sichtabnahme, LM) einmal bis
   „bereit“ prüfen – Speicher und Rechenzeit dort sind die offene Größe, nicht mehr das Laden. Ein Rückfall ist jetzt
   diagnostizierbar: Der Worker gibt den Grund als Konsolenwarnung aus (`[sprechen] laden|probe|erkennung: …`).
3. **Abgleich unter Spitzenlast** (Abschnitt 8): 0 Fehler, aber p95 ≈ 12 s bei 600 gleichzeitigen Paketen. Die
   Ereignisse eines Pakets gehen schon in einem einzigen `INSERT … ON CONFLICT DO NOTHING`; je Konto serialisiert eine
   Sperre (`sperre(benutzerId)`) die Pakete, und der Pool hat lokal 10, auf Vercel 5 Verbindungen je Instanz
   (`src/lib/db/index.ts`). Rechnerisch ≈ 200 ms je Transaktion (Grenzen, Einfügen, Karten und Tage ableiten, Seite
   fremder Ereignisse). Vorschlag für den Betrieb: Dauer je Transaktion beobachten und, falls nötig, die Ableitung
   (`erneuereKarten`, `erneuereTage`) gezielt messen; kein Abnahmekriterium, keine Änderung in diesem Paket.
4. **TBT** 178–337 ms auf den meisten Routen (Lighthouse CPU ×4, Last 1,3–7,2); `messen.mjs` wertet TBT ≤ 200 ms als
   eigenen Labor-Ersatz und meldet „verfehlt: TBT“. Ursache ist im Wesentlichen die Hydrierung des Grundstocks (135 KB)
   plus Insel; die Abnahme misst INP direkt (≤ 200 ms erfüllt). Vorschlag: TBT ohne Parallel-Last einmal nachmessen
   (Tor L8, ruhige Maschine); keine örtliche Ursache gefunden.
5. **Tipps nahe am Budget:** 176,5 KB von 180 KB (Darstellung der Tipps aus dem Paket). Bei weiterem Wachstum die
   Darstellung per `import()` erst nach dem Laden des Pakets holen.
6. **Werkzeug und Platte:** In Lauf 1 fiel der freie Platz nach dem Bau für gut eine Minute auf 1,15 GB (unter die
   2-GB-Grenze), bis `.next/server` von Hand gelöscht war. `messlauf.sh` löscht es jetzt gleich nach dem Bau (Lauf 2:
   2,4 GB frei) und setzt den Browserpfad selbst. Auch in Lauf 3 sank der freie Platz am Ende des Baus kurz auf ≈ 1,4 GB
   (Start 3,86 GB; `.next/server` und `.next/standalone` liegen bis zum Löschen doppelt) – mit 4 GB vor dem Bau ist die
   2-GB-Grenze nicht sicher einzuhalten; Vorschlag: vor einem Messlauf ≥ 5 GB frei. Seit der Gegenprüfung endet
   `messlauf.sh` nach den Messungen (Auftragsschleife nur mit `MESS_AUFTRAG_S`), verlangt `MESS_ENV` ausdrücklich, legt den
   Verweis auf `web/node_modules` selbst an und nimmt die Ablage der Sitzung aus `MESS_SCRATCH` (einzeln `MESS_NODE_BIN`,
   `MESS_SCHLOSS`, `MESS_BROWSER`). Die Werkzeuge unter `_lernapp/werkzeuge/` sind nicht mit Prettier formatiert
   (außerhalb von `web/`), wie bisher.

## 11. Vorschlag für Z-L07

> Stand 24.10.2026 mit dem Testkurs. Mit echten Inhalten (26.10.2026) neu eingeordnet: Abschnitt C.6 oben („teilweise“).

**Vorschlag: „erfüllt“** mit dem Wortlaut der Budgets nach KERN §9 (Befund 10.1), Nachweis dieser Bericht:

| Teil von Z-L07 | Stand | Nachweis |
|---|---|---|
| Budgets KERN §9 (Hülle, Start/Lernpfad, Spieler, Übungstyp, Tastatur, Mein Bereich) | erfüllt | Abschnitt 3 (`lernapp-budget.mjs`), Mein Bereich 181,9–186,3 ≤ 230 KB (Abschnitt 4) |
| LCP ≤ 2,5 s | erfüllt | 25 Routen 1778–2442 ms |
| INP ≤ 200 ms | erfüllt | 104–176 ms (Median, CPU ×6, unter Last) |
| CLS ≤ 0,1 | erfüllt nach B-1 | vorher Tipps 0,151 und Koran-Arabisch 0,19; nachher 0 (`fc95e675`) |
| Lighthouse Leistung ≥ 90, Zugänglichkeit 100 | erfüllt nach B-1 | 90–96 bzw. 100 auf allen 25 Routen |
| Whisper nur nach Klick | erfüllt nach B-2 | 0 Modellanfragen vor dem Klick; danach 10 von 10 Dateien je einmal über das Netz und „bereit“ nach 7 s (Lauf 3, `ebaa9d5a`); vorher mit `a0795f7b` nur 7 Dateien und Rückfall |

Dazu für Z-L06 (axe-Anteil): 0 ernste und kritische Befunde auf allen Lern-App-Routen × 3 Sprachen × 2 Breiten (Abschnitt 6);
die übrigen Teile von Z-L06 (Tastaturweg je Übungstyp, Screenreader LM-19) liegen außerhalb dieses Pakets.

Vorbehalt: Alle Zeitwerte stammen von einer belasteten Maschine (Last 1,3–7,2); sie sind obere Schätzungen. Eine
Gegenprüfung nach der Bereitstellung mit PageSpeed Insights (M-065) bleibt empfohlen.
