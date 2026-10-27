# Mengenbericht Lern-App

Erzeugt mit `node _lernapp/werkzeuge/mengen.mjs --rev e95f4213f771c43093bab45914cad00cda1bbfc4 --aus _lernapp/berichte/mengen.md` (L8-03, Stufenauswahl N7).
Liest nur `web/inhalte/lernapp/**` des jeweiligen Stands (ohne Datenbank, ohne Netz); gleicher Stand → gleicher Bericht.
Ziele: `_lernapp/PLAN.md` §5.1–§5.3; Abnahme `_lernapp/ABNAHME.md` Z-L01 (erfüllt ab Ziel − 5 %), Z-L02, Z-L03.

## Stand: e95f4213f771c43093bab45914cad00cda1bbfc4 (Commit `e95f4213f771`, 2026-10-27T18:41:48+00:00)

Gelesen: 444 JSON-Dateien unter `web/inhalte/lernapp/`.

Umfang: A1–B1 (Standard nach L3-E16 „Bis B1 reicht erstmal“; B2/C1 offener Ausbau, nicht bewertet). Ziele: Summe dieser Stufen aus PLAN §5.1; Aufgaben, Einstufungsbank und Tipp-Karten anteilig nach Einheiten (42 von 72).

Status der Spracheinheiten im Umfang: automatisch_geprueft 132; außerhalb: entwurf 12.

### Sprachkurse je Zielsprache und Stufe (Ist / Ziel PLAN §5.1)

| Ziel | Stufe | Einheiten | Stationen | Lemmata | Sätze | Dialoge + Geschichten | Lesetexte | Sprechen | Schreiben |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| de | A1 | 12 / 12 | 96 / 96 | 600 / 600 | 2.438 / 2.400 | 262 / 24 | 6 / 6 | 80 / 24 | 0 / 0 |
| de | A2 | 14 / 14 | 112 / 112 | 900 / 900 | 3.641 / 3.600 | 206 / 28 | 14 / 14 | 120 / 28 | 14 / 14 |
| de | B1 | 16 / 16 | 128 / 128 | 1.300 / 1.300 | 5.254 / 5.200 | 223 / 32 | 49 / 32 | 156 / 32 | 16 / 16 |
| **de** | **Σ** | **42 / 42** | **336 / 336** | **2.800 / 2.800** | **11.333 / 11.200** | **691 / 84** | **69 / 52** | **356 / 84** | **30 / 30** |
| tr | A1 | 12 / 12 | 96 / 96 | 588 / 600 | 2.534 / 2.400 | 259 / 24 | 6 / 6 | 128 / 24 | 0 / 0 |
| tr | A2 | 14 / 14 | 112 / 112 | 886 / 900 | 3.658 / 3.600 | 246 / 28 | 15 / 14 | 87 / 28 | 13 / 14 |
| tr | B1 | 16 / 16 | 128 / 128 | 1.284 / 1.300 | 5.296 / 5.200 | 174 / 32 | 38 / 32 | 79 / 32 | 16 / 16 |
| **tr** | **Σ** | **42 / 42** | **336 / 336** | **2.758 / 2.800** | **11.488 / 11.200** | **679 / 84** | **59 / 52** | **294 / 84** | **29 / 30** |
| ar | A1 | 12 / 12 | 96 / 96 | 600 / 600 | 2.611 / 2.400 | 183 / 24 | 7 / 6 | 91 / 24 | 0 / 0 |
| ar | A2 | 14 / 14 | 112 / 112 | 900 / 900 | 3.685 / 3.600 | 337 / 28 | 15 / 14 | 84 / 28 | 14 / 14 |
| ar | B1 | 16 / 16 | 128 / 128 | 1.300 / 1.300 | 5.067 / 5.200 | 119 / 32 | 34 / 32 | 81 / 32 | 16 / 16 |
| **ar** | **Σ** | **42 / 42** | **336 / 336** | **2.800 / 2.800** | **11.363 / 11.200** | **639 / 84** | **56 / 52** | **256 / 84** | **30 / 30** |

Außerhalb des Umfangs (offener Ausbau, nicht bewertet): de B2 12 Einheiten (davon freigegeben 0), 1.275 Lemmata, 5.145 Sätze.

Zählweise: Einheiten und Stationen ohne Schrift-Vorkurse (`nurFuerAusgang`); Stationen = Lektionen aller Arten;
Dialoge + Geschichten = Aufgaben `dialog` (je eine kurze Wechselrede) und `geschichte`; Lesetexte = Aufgaben
`lesen_fragen`; Sprechen und Schreiben = Lektionen dieser Art bzw. Aufgaben `sprechen`/`schreiben` in anderen Lektionen.
Die Abnahme Z-L01 bewertet Einheiten, Stationen, Lemmata, Sätze (je Zielsprache), die Übersetzungen je Richtung, die
Schrift-Vorkurse und die Einstufungsbank; die Tipp-Karten je Ausgangssprache stehen zum Vergleich mit PLAN §5.1 dabei.

### Bewertung Z-L01 je Zielsprache (Σ A1–B1, erfüllt ab Ziel − 5 %)

| Ziel | Einheiten | Stationen | Lemmata | Sätze | Aufgaben (Ziel ≈ 4.667, anteilig) |
|---|---|---|---|---|---|
| de | 42 (100 %) – erfüllt | 336 (100 %) – erfüllt | 2.800 (100 %) – erfüllt | 11.333 (101,2 %) – erfüllt | 5.724 (122,6 %) – erfüllt |
| tr | 42 (100 %) – erfüllt | 336 (100 %) – erfüllt | 2.758 (98,5 %) – erfüllt | 11.488 (102,6 %) – erfüllt | 5.421 (116,2 %) – erfüllt |
| ar | 42 (100 %) – erfüllt | 336 (100 %) – erfüllt | 2.800 (100 %) – erfüllt | 11.363 (101,5 %) – erfüllt | 5.828 (124,9 %) – erfüllt |

### Freigegeben, in Aufgaben verwiesen und live (Σ A1–B1)

| Ziel | Einheiten frei | Stationen frei | Lemmata frei | Sätze frei | Sätze in Aufgaben verwiesen | Sätze live | Lemmata in Aufgaben verwiesen | Lemmata live |
|---|---|---|---|---|---:|---:|---:|---:|
| de | 42 (100 %) – erfüllt | 336 (100 %) – erfüllt | 2.800 (100 %) – erfüllt | 11.333 (101,2 %) – erfüllt | 9.587 / 11.333 (84,6 %) | 9.587 (85,6 % des Ziels) | 2.752 / 2.800 (98,3 %) | 2.751 (98,3 % des Ziels) |
| tr | 42 (100 %) – erfüllt | 336 (100 %) – erfüllt | 2.758 (98,5 %) – erfüllt | 11.488 (102,6 %) – erfüllt | 7.720 / 11.488 (67,2 %) | 7.720 (68,9 % des Ziels) | 2.654 / 2.758 (96,2 %) | 2.654 (94,8 % des Ziels) |
| ar | 42 (100 %) – erfüllt | 336 (100 %) – erfüllt | 2.800 (100 %) – erfüllt | 11.363 (101,5 %) – erfüllt | 7.591 / 11.363 (66,8 %) | 7.591 (67,8 % des Ziels) | 2.647 / 2.800 (94,5 %) | 2.647 (94,5 % des Ziels) |

Freigegeben = Einheiten mit Status ≠ `entwurf` (L3-E15: `automatisch_geprueft`, live mit Hinweis), Prozent vom Ziel.
In Aufgaben verwiesen = Lemmata und Sätze des Umfangs, auf die irgendeine Aufgabe verweist; der übrige Korpus ist Vorrat
(Handbuch §5) und erreicht kein Gerät, denn der Paketbau übernimmt nur verwiesene Einträge. Live = verwiesen von einer
freigegebenen Einheit, selbst in einer freigegebenen Einheit und ohne Kennzeichen `religionsbezug` (der braucht zwei
Freigaben in der Datenbank); eine Obergrenze, denn Formel-Kandidaten und Sichtbarkeit je Richtung zählt der Bericht nicht.

### Übersetzungen je Richtung (A1–B1)

| Richtung | Dateien | Einträge | Alternativen | Tipps | Zielsätze übersetzt | Lemmata übersetzt |
|---|---:|---:|---:|---:|---|---|
| tr-aus-de | 43 | 14.246 | 28.204 | 244 | 11.488 / 11.488 (100 %) | 2.758 / 2.758 (100 %) |
| ar-aus-de | 43 | 14.213 | 29.820 | 263 | 11.413 / 11.413 (100 %) | 2.800 / 2.800 (100 %) |
| de-aus-tr | 43 | 14.140 | 32.047 | 242 | 11.340 / 11.340 (100 %) | 2.800 / 2.800 (100 %) |
| ar-aus-tr | 43 | 14.213 | 29.665 | 263 | 11.363 / 11.363 (100 %) | 2.800 / 2.800 (100 %) |
| de-aus-ar | 43 | 14.192 | 32.216 | 254 | 11.392 / 11.392 (100 %) | 2.800 / 2.800 (100 %) |
| tr-aus-ar | 43 | 14.246 | 27.954 | 245 | 11.488 / 11.488 (100 %) | 2.758 / 2.758 (100 %) |

Ziel (PLAN §5.1, Z-L01): je Richtung Übersetzungen für 100 % der Zielsätze; ≈ 3 Alternativen je Satz; Tipps unten.

### Einstufungsbank und Tipp-Karten (Z-L01, PLAN §5.1)

| Ziel | A1 | A2 | B1 | Σ (Ziel ≈ 233, anteilig) | vorhanden |
|---|---:|---:|---:|---|---|
| de | 1.009 | 1.281 | 1.531 | 3.821 (1.639,9 %) – erfüllt | ja |
| tr | 900 | 1.176 | 1.391 | 3.467 (1.488 %) – erfüllt | ja |
| ar | 990 | 1.294 | 1.424 | 3.708 (1.591,4 %) – erfüllt | ja |

Einstufungsbank = Aufgaben der Typen aus `EINSTUFUNG_TYPEN` in den Lektionen der Einheiten (ohne Vorkurse), aus denen
der Einstufungstest auf dem Gerät wählt; Hörtypen zählen hier ohne Prüfung des Audios. „vorhanden“: jede Stufe mit
Einheiten bietet mindestens zwei Kandidaten.

| Richtung | Tipp-Karten (Ziel ≈ 175 je Ausgangssprache, anteilig) |
|---|---|
| tr-aus-de | 244 (139,4 %) – erfüllt |
| ar-aus-de | 263 (150,3 %) – erfüllt |
| de-aus-tr | 242 (138,3 %) – erfüllt |
| ar-aus-tr | 263 (150,3 %) – erfüllt |
| de-aus-ar | 254 (145,1 %) – erfüllt |
| tr-aus-ar | 245 (140 %) – erfüllt |

Tipp-Karten = Tipps der Übersetzungsdateien je Richtung (kontrastiv, in der Ausgangssprache; Seite „Tipps“ je Einheit).

### Schrift-Vorkurse

| Ziel | für Ausgang | Lektionen | Aufgaben |
|---|---|---:|---:|
| ar | de | 8 | 151 |
| ar | tr | 8 | 151 |
| de | ar | 6 | 109 |
| de | tr | 1 | 25 |
| tr | ar | 2 | 38 |
| tr | de | 2 | 36 |

Ziel (PLAN §5.1): 8 Lektionen Arabisch-Schrift, 6 Latein, 2 Türkisch.

### Aufgaben je Typ (Sprachkurse A1–B1 ohne Vorkurse; die Summe oben zählt die Vorkurse mit)

| Typ | de | tr | ar |
|---|---:|---:|---:|
| `auswahl` | 1.028 | 1.082 | 1.109 |
| `dialog` | 606 | 635 | 589 |
| `formen` | 70 | 65 | 67 |
| `frei` | 223 | 254 | 142 |
| `geschichte` | 85 | 44 | 50 |
| `grammatik_tipp` | 234 | 235 | 249 |
| `harakat` | 0 | 0 | 191 |
| `hoeren_schreiben` | 241 | 110 | 93 |
| `hoeren_waehlen` | 623 | 150 | 340 |
| `lesen_fragen` | 69 | 59 | 56 |
| `luecke` | 706 | 788 | 600 |
| `minimalpaare` | 173 | 91 | 176 |
| `paare` | 389 | 584 | 588 |
| `satzbau` | 242 | 228 | 261 |
| `schreiben` | 30 | 29 | 30 |
| `sprechen` | 356 | 294 | 256 |
| `wortbank` | 515 | 699 | 729 |

### Herkunft (Sprachkurse A1–B1 ohne Vorkurse)

- Sätze: `ki` 32.747, `tatoeba` 1.437
- Lemmata: `ki` 3.885, `wiktionary` 4.473

### Wissenskurs und Koran-Arabisch

| Kurs | Ist | Ziel (PLAN §5.2/§5.3) |
|---|---|---|
| Wissen | 26 Einheiten, 146 Lektionen (davon 135 für Kinder geeignet), 2.124 Aussagen, 4.603 Belege, 1.041 Quizfragen | 28 Einheiten, ≈ 170 Lektionen, ≈ 1.400 Aussagen, ≈ 2.000 Belege, ≈ 1.700 Quizfragen |
| Koran-Arabisch | 40 Einheiten, 187 Lektionen, 936 Wortformen-Verweise, 936 Aufgaben | ≈ 10 Einheiten, ≈ 60 Lektionen, 500–1.000 Wortformen |

Sichtbarkeit (zwei Freigaben, Z-L02/Z-L03) zählt dieser Bericht nicht; sie steht in der Datenbank (Verwaltung → Lern-App).
