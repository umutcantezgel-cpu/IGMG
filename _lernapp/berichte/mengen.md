# Mengenbericht Lern-App

Erzeugt mit `node _lernapp/werkzeuge/mengen.mjs --rev 3f8c9cfdc13f5ec9470715b596fe28ca04c54064 --rev e5a2c3fc9732960ee6bdc3dc3862debfc56b935b --aus _lernapp/berichte/mengen.md` (L8-03).
Liest nur `web/inhalte/lernapp/**` des jeweiligen Stands (ohne Datenbank, ohne Netz); gleicher Stand → gleicher Bericht.
Ziele: `_lernapp/PLAN.md` §5.1–§5.3; Abnahme `_lernapp/ABNAHME.md` Z-L01 (erfüllt ab Ziel − 5 %), Z-L02, Z-L03.

## Stand: 3f8c9cfdc13f5ec9470715b596fe28ca04c54064 (Commit `3f8c9cfdc13f`, 2026-10-21T19:48:56+00:00)

Gelesen: 15 JSON-Dateien unter `web/inhalte/lernapp/`.

Status der Spracheinheiten: keine.

### Sprachkurse je Zielsprache und Stufe (Ist / Ziel PLAN §5.1)

| Ziel | Stufe | Einheiten | Stationen | Lemmata | Sätze | Dialoge + Geschichten | Lesetexte | Sprechen | Schreiben |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| de | A1 | 0 / 12 | 0 / 96 | 0 / 600 | 0 / 2.400 | 0 / 24 | 0 / 6 | 0 / 24 | 0 / 0 |
| de | A2 | 0 / 14 | 0 / 112 | 0 / 900 | 0 / 3.600 | 0 / 28 | 0 / 14 | 0 / 28 | 0 / 14 |
| de | B1 | 0 / 16 | 0 / 128 | 0 / 1.300 | 0 / 5.200 | 0 / 32 | 0 / 32 | 0 / 32 | 0 / 16 |
| de | B2 | 0 / 16 | 0 / 128 | 0 / 1.700 | 0 / 6.800 | 0 / 32 | 0 / 48 | 0 / 32 | 0 / 32 |
| de | C1 | 0 / 14 | 0 / 112 | 0 / 2.000 | 0 / 8.000 | 0 / 28 | 0 / 56 | 0 / 28 | 0 / 28 |
| **de** | **Σ** | **0 / 72** | **0 / 576** | **0 / 6.500** | **0 / 26.000** | **0 / 144** | **0 / 156** | **0 / 144** | **0 / 90** |
| tr | A1 | 0 / 12 | 0 / 96 | 0 / 600 | 0 / 2.400 | 0 / 24 | 0 / 6 | 0 / 24 | 0 / 0 |
| tr | A2 | 0 / 14 | 0 / 112 | 0 / 900 | 0 / 3.600 | 0 / 28 | 0 / 14 | 0 / 28 | 0 / 14 |
| tr | B1 | 0 / 16 | 0 / 128 | 0 / 1.300 | 0 / 5.200 | 0 / 32 | 0 / 32 | 0 / 32 | 0 / 16 |
| tr | B2 | 0 / 16 | 0 / 128 | 0 / 1.700 | 0 / 6.800 | 0 / 32 | 0 / 48 | 0 / 32 | 0 / 32 |
| tr | C1 | 0 / 14 | 0 / 112 | 0 / 2.000 | 0 / 8.000 | 0 / 28 | 0 / 56 | 0 / 28 | 0 / 28 |
| **tr** | **Σ** | **0 / 72** | **0 / 576** | **0 / 6.500** | **0 / 26.000** | **0 / 144** | **0 / 156** | **0 / 144** | **0 / 90** |
| ar | A1 | 0 / 12 | 0 / 96 | 0 / 600 | 0 / 2.400 | 0 / 24 | 0 / 6 | 0 / 24 | 0 / 0 |
| ar | A2 | 0 / 14 | 0 / 112 | 0 / 900 | 0 / 3.600 | 0 / 28 | 0 / 14 | 0 / 28 | 0 / 14 |
| ar | B1 | 0 / 16 | 0 / 128 | 0 / 1.300 | 0 / 5.200 | 0 / 32 | 0 / 32 | 0 / 32 | 0 / 16 |
| ar | B2 | 0 / 16 | 0 / 128 | 0 / 1.700 | 0 / 6.800 | 0 / 32 | 0 / 48 | 0 / 32 | 0 / 32 |
| ar | C1 | 0 / 14 | 0 / 112 | 0 / 2.000 | 0 / 8.000 | 0 / 28 | 0 / 56 | 0 / 28 | 0 / 28 |
| **ar** | **Σ** | **0 / 72** | **0 / 576** | **0 / 6.500** | **0 / 26.000** | **0 / 144** | **0 / 156** | **0 / 144** | **0 / 90** |

Zählweise: Einheiten und Stationen ohne Schrift-Vorkurse (`nurFuerAusgang`); Stationen = Lektionen aller Arten;
Dialoge + Geschichten = Aufgaben `dialog` (je eine kurze Wechselrede) und `geschichte`; Lesetexte = Aufgaben
`lesen_fragen`; Sprechen und Schreiben = Lektionen dieser Art bzw. Aufgaben `sprechen`/`schreiben` in anderen Lektionen.
Die Abnahme Z-L01 bewertet nur Einheiten, Stationen, Lemmata, Sätze (je Zielsprache) und die Übersetzungen je Richtung.

### Bewertung Z-L01 je Zielsprache (Σ A1–C1, erfüllt ab Ziel − 5 %)

| Ziel | Einheiten | Stationen | Lemmata | Sätze | Aufgaben (Ziel ≈ 8.000) |
|---|---|---|---|---|---|
| de | 0 (0 %) – offen | 0 (0 %) – offen | 0 (0 %) – offen | 0 (0 %) – offen | 0 (0 %) – offen |
| tr | 0 (0 %) – offen | 0 (0 %) – offen | 0 (0 %) – offen | 0 (0 %) – offen | 0 (0 %) – offen |
| ar | 0 (0 %) – offen | 0 (0 %) – offen | 0 (0 %) – offen | 0 (0 %) – offen | 0 (0 %) – offen |

### Übersetzungen je Richtung

| Richtung | Dateien | Einträge | Alternativen | Tipps | Zielsätze übersetzt | Lemmata übersetzt |
|---|---:|---:|---:|---:|---|---|
| tr-aus-de | 0 | 0 | 0 | 0 | 0 / 0 (–) | 0 / 0 (–) |
| ar-aus-de | 0 | 0 | 0 | 0 | 0 / 0 (–) | 0 / 0 (–) |
| de-aus-tr | 0 | 0 | 0 | 0 | 0 / 0 (–) | 0 / 0 (–) |
| ar-aus-tr | 0 | 0 | 0 | 0 | 0 / 0 (–) | 0 / 0 (–) |
| de-aus-ar | 0 | 0 | 0 | 0 | 0 / 0 (–) | 0 / 0 (–) |
| tr-aus-ar | 0 | 0 | 0 | 0 | 0 / 0 (–) | 0 / 0 (–) |

Ziel (PLAN §5.1, Z-L01): je Richtung Übersetzungen für 100 % der Zielsätze; ≈ 3 Alternativen je Satz; ≈ 300 Tipps.

### Schrift-Vorkurse

Keine.

Ziel (PLAN §5.1): 8 Lektionen Arabisch-Schrift, 6 Latein, 2 Türkisch.

### Aufgaben je Typ (Sprachkurse, mit Vorkursen in der Summe oben)

Keine.

### Herkunft (Sprachkurse ohne Vorkurse)

- Sätze: keine
- Lemmata: keine

### Wissenskurs und Koran-Arabisch

| Kurs | Ist | Ziel (PLAN §5.2/§5.3) |
|---|---|---|
| Wissen | 0 Einheiten, 0 Lektionen (davon 0 für Kinder geeignet), 0 Aussagen, 0 Belege, 0 Quizfragen | 28 Einheiten, ≈ 170 Lektionen, ≈ 1.400 Aussagen, ≈ 2.000 Belege, ≈ 1.700 Quizfragen |
| Koran-Arabisch | 0 Einheiten, 0 Lektionen, 0 Wortformen-Verweise, 0 Aufgaben | ≈ 10 Einheiten, ≈ 60 Lektionen, 500–1.000 Wortformen |

Sichtbarkeit (zwei Freigaben, Z-L02/Z-L03) zählt dieser Bericht nicht; sie steht in der Datenbank (Verwaltung → Lern-App).

## Stand: e5a2c3fc9732960ee6bdc3dc3862debfc56b935b (Commit `e5a2c3fc9732`, 2026-10-21T20:19:47+00:00)

Gelesen: 81 JSON-Dateien unter `web/inhalte/lernapp/`.

Status der Spracheinheiten: entwurf 41.

### Sprachkurse je Zielsprache und Stufe (Ist / Ziel PLAN §5.1)

| Ziel | Stufe | Einheiten | Stationen | Lemmata | Sätze | Dialoge + Geschichten | Lesetexte | Sprechen | Schreiben |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| de | A1 | 12 / 12 | 96 / 96 | 600 / 600 | 2.438 / 2.400 | 262 / 24 | 6 / 6 | 80 / 24 | 0 / 0 |
| de | A2 | 0 / 14 | 0 / 112 | 0 / 900 | 0 / 3.600 | 0 / 28 | 0 / 14 | 0 / 28 | 0 / 14 |
| de | B1 | 0 / 16 | 0 / 128 | 0 / 1.300 | 0 / 5.200 | 0 / 32 | 0 / 32 | 0 / 32 | 0 / 16 |
| de | B2 | 0 / 16 | 0 / 128 | 0 / 1.700 | 0 / 6.800 | 0 / 32 | 0 / 48 | 0 / 32 | 0 / 32 |
| de | C1 | 0 / 14 | 0 / 112 | 0 / 2.000 | 0 / 8.000 | 0 / 28 | 0 / 56 | 0 / 28 | 0 / 28 |
| **de** | **Σ** | **12 / 72** | **96 / 576** | **600 / 6.500** | **2.438 / 26.000** | **262 / 144** | **6 / 156** | **80 / 144** | **0 / 90** |
| tr | A1 | 12 / 12 | 96 / 96 | 588 / 600 | 2.534 / 2.400 | 259 / 24 | 6 / 6 | 128 / 24 | 0 / 0 |
| tr | A2 | 0 / 14 | 0 / 112 | 0 / 900 | 0 / 3.600 | 0 / 28 | 0 / 14 | 0 / 28 | 0 / 14 |
| tr | B1 | 0 / 16 | 0 / 128 | 0 / 1.300 | 0 / 5.200 | 0 / 32 | 0 / 32 | 0 / 32 | 0 / 16 |
| tr | B2 | 0 / 16 | 0 / 128 | 0 / 1.700 | 0 / 6.800 | 0 / 32 | 0 / 48 | 0 / 32 | 0 / 32 |
| tr | C1 | 0 / 14 | 0 / 112 | 0 / 2.000 | 0 / 8.000 | 0 / 28 | 0 / 56 | 0 / 28 | 0 / 28 |
| **tr** | **Σ** | **12 / 72** | **96 / 576** | **588 / 6.500** | **2.534 / 26.000** | **259 / 144** | **6 / 156** | **128 / 144** | **0 / 90** |
| ar | A1 | 11 / 12 | 88 / 96 | 554 / 600 | 2.372 / 2.400 | 169 / 24 | 5 / 6 | 86 / 24 | 0 / 0 |
| ar | A2 | 0 / 14 | 0 / 112 | 0 / 900 | 0 / 3.600 | 0 / 28 | 0 / 14 | 0 / 28 | 0 / 14 |
| ar | B1 | 0 / 16 | 0 / 128 | 0 / 1.300 | 0 / 5.200 | 0 / 32 | 0 / 32 | 0 / 32 | 0 / 16 |
| ar | B2 | 0 / 16 | 0 / 128 | 0 / 1.700 | 0 / 6.800 | 0 / 32 | 0 / 48 | 0 / 32 | 0 / 32 |
| ar | C1 | 0 / 14 | 0 / 112 | 0 / 2.000 | 0 / 8.000 | 0 / 28 | 0 / 56 | 0 / 28 | 0 / 28 |
| **ar** | **Σ** | **11 / 72** | **88 / 576** | **554 / 6.500** | **2.372 / 26.000** | **169 / 144** | **5 / 156** | **86 / 144** | **0 / 90** |

Zählweise: Einheiten und Stationen ohne Schrift-Vorkurse (`nurFuerAusgang`); Stationen = Lektionen aller Arten;
Dialoge + Geschichten = Aufgaben `dialog` (je eine kurze Wechselrede) und `geschichte`; Lesetexte = Aufgaben
`lesen_fragen`; Sprechen und Schreiben = Lektionen dieser Art bzw. Aufgaben `sprechen`/`schreiben` in anderen Lektionen.
Die Abnahme Z-L01 bewertet nur Einheiten, Stationen, Lemmata, Sätze (je Zielsprache) und die Übersetzungen je Richtung.

### Bewertung Z-L01 je Zielsprache (Σ A1–C1, erfüllt ab Ziel − 5 %)

| Ziel | Einheiten | Stationen | Lemmata | Sätze | Aufgaben (Ziel ≈ 8.000) |
|---|---|---|---|---|---|
| de | 12 (16,7 %) – offen | 96 (16,7 %) – offen | 600 (9,2 %) – offen | 2.438 (9,4 %) – offen | 1.659 (20,7 %) – offen |
| tr | 12 (16,7 %) – offen | 96 (16,7 %) – offen | 588 (9 %) – offen | 2.534 (9,7 %) – offen | 1.586 (19,8 %) – offen |
| ar | 11 (15,3 %) – offen | 88 (15,3 %) – offen | 554 (8,5 %) – offen | 2.372 (9,1 %) – offen | 1.670 (20,9 %) – offen |

### Übersetzungen je Richtung

| Richtung | Dateien | Einträge | Alternativen | Tipps | Zielsätze übersetzt | Lemmata übersetzt |
|---|---:|---:|---:|---:|---|---|
| tr-aus-de | 3 | 516 | 916 | 23 | 433 / 2.534 (17,1 %) | 83 / 588 (14,1 %) |
| ar-aus-de | 1 | 50 | 25 | 20 | 50 / 2.422 (2,1 %) | 0 / 554 (0 %) |
| de-aus-tr | 9 | 2.033 | 4.619 | 53 | 1.628 / 2.445 (66,6 %) | 405 / 600 (67,5 %) |
| ar-aus-tr | 1 | 50 | 21 | 20 | 0 / 2.372 (0 %) | 0 / 554 (0 %) |
| de-aus-ar | 9 | 2.085 | 4.395 | 65 | 1.680 / 2.497 (67,3 %) | 405 / 600 (67,5 %) |
| tr-aus-ar | 3 | 516 | 797 | 24 | 433 / 2.534 (17,1 %) | 83 / 588 (14,1 %) |

Ziel (PLAN §5.1, Z-L01): je Richtung Übersetzungen für 100 % der Zielsätze; ≈ 3 Alternativen je Satz; ≈ 300 Tipps.

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

### Aufgaben je Typ (Sprachkurse, mit Vorkursen in der Summe oben)

| Typ | de | tr | ar |
|---|---:|---:|---:|
| `auswahl` | 281 | 324 | 319 |
| `dialog` | 237 | 246 | 152 |
| `geschichte` | 25 | 13 | 17 |
| `grammatik_tipp` | 69 | 70 | 65 |
| `hoeren_schreiben` | 77 | 58 | 0 |
| `hoeren_waehlen` | 187 | 77 | 151 |
| `lesen_fragen` | 6 | 6 | 5 |
| `luecke` | 211 | 185 | 159 |
| `minimalpaare` | 68 | 53 | 41 |
| `paare` | 99 | 152 | 142 |
| `sprechen` | 80 | 128 | 86 |
| `wortbank` | 185 | 200 | 231 |

### Herkunft (Sprachkurse ohne Vorkurse)

- Sätze: `ki` 6.679, `tatoeba` 665
- Lemmata: `ki` 934, `wiktionary` 808

### Wissenskurs und Koran-Arabisch

| Kurs | Ist | Ziel (PLAN §5.2/§5.3) |
|---|---|---|
| Wissen | 0 Einheiten, 0 Lektionen (davon 0 für Kinder geeignet), 0 Aussagen, 0 Belege, 0 Quizfragen | 28 Einheiten, ≈ 170 Lektionen, ≈ 1.400 Aussagen, ≈ 2.000 Belege, ≈ 1.700 Quizfragen |
| Koran-Arabisch | 0 Einheiten, 0 Lektionen, 0 Wortformen-Verweise, 0 Aufgaben | ≈ 10 Einheiten, ≈ 60 Lektionen, 500–1.000 Wortformen |

Sichtbarkeit (zwei Freigaben, Z-L02/Z-L03) zählt dieser Bericht nicht; sie steht in der Datenbank (Verwaltung → Lern-App).
