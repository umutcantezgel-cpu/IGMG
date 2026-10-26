# Stufe C – Gegenprüfung der Gruppe „inhalte“: Umfang und Inhaltsprüfer (L8-05)

| | |
|---|---|
| Datum | 26.10.2026, 05:44–05:56 UTC |
| Stand | `9a8ca1f8` (Branch `claude/trusting-lovelace-6nfolz`, Haupt-Checkout `/home/user/IGMG`). `HEAD` steht inzwischen auf `25975bf0`, darin ist nur `_lernapp/PRUEFPUNKT.md` neu. `git diff 9a8ca1f8 HEAD -- web/inhalte/lernapp web/src/lib/lernapp` ist leer |
| Geprüft | `_lernapp/protokolle/C-inhalte.md` (Prüfer Stufe C, Gruppe inhalte) |
| Kriterien | Z-L01 (Umfang Sprachkurse), Z-L14 (Inhaltsprüfer); Schwellen aus `_lernapp/ABNAHME.md` |
| Umfang | A1–B1 in 6 Richtungen nach L3-E16. B2/C1 sind offener Ausbau und hier nicht Gegenstand. Mengenschwelle anteilig: je Zielsprache Ist ≥ Ziel − 5 % |
| Freigabe | L3-E15. `de.b1.e16` (OF-10) und `tr.b1.e16` (R-06 „Pilz“) bleiben bekanntermaßen Entwurf |
| Live | `https://igmg-wetzlarer.vercel.app`, nur curl GET, 05:49–05:53 UTC |
| Schrift | Keine arabische Schrift, keine religiösen Texte (KI-Regel 2, ADR 0040, `_lernapp/KERN.md` §2). Arabische Inhalte nur als Schlüssel oder Zahl |

## Ergebnis

| Z | Prüfer | Gegenprüfung | Urteil |
|---|---|---|---|
| Z-L01 | erfüllt | **teilweise** | **herabgestuft.** Alle Mengen stimmen auf die Einheit genau. Die Teilschwelle „je Richtung Übersetzungen für 100 % der Zielsätze“ ist in de-aus-tr aber nicht erfüllt: Ein freigegebener Satz hat als „türkische“ Übersetzung den deutschen Quellsatz, und so steht er auch live (1.1, G1). Das lässt sich mit einer Zeile beheben; danach ist Z-L01 erfüllt |
| Z-L14 | teilweise | **teilweise** | **bestätigt.** Dazu kommt eine Lücke: Kein Prüfer und keine Gegenprüfung erkennt Übersetzungen, die nur den Quelltext kopieren (G1) |

## 0. Vorgehen und eigene Läufe

- Ich habe nur gelesen, gezählt und geprüft und nur diese Datei geschrieben. Kein git add, commit, stash oder checkout,
  kein MCP. Die Arbeitsbäume unter `.claude/worktrees/` habe ich nicht angefasst.
- Umgebung: Node 24.21.0 aus dem Scratchpad, Python mit `-I`. Die Rohdaten liegen unter
  `scratchpad/c-inhalte-gegen/`: `zaehl2.py`/`.out`, `dubl.py`/`.out`, `nutzung.py`/`.out`, `mengen.md`, `pruefen.log`,
  `pruefen.json`, `l307.txt` und `live/` mit 6 Verzeichnissen, `liste.txt`, `abruf.txt` und 254 Paketen unter `p/`.
- Meine Zählskripte habe ich selbst geschrieben, ohne `zaehlen.py` des Prüfers zu lesen. Sie lesen die JSON-Dateien direkt.

| # | Befehl | Ergebnis |
|---|---|---|
| E1 | `python3 -I zaehl2.py web/inhalte/lernapp`: Mengen je Ziel, Stufe und Status, Lemma-Budget je Einheit gegen den Rahmen, Abdeckung der Übersetzungen nach Schlüssel **und Inhalt** (leer, gleich dem Quelltext, falsche Schrift) | 144 Einheitendateien: 130 `automatisch_geprueft`, 14 `entwurf`. Zahlen in 1.1 |
| E2 | `python3 -I dubl.py`: Dubletten in strengerer Normform (NFC, casefold, ohne Satzzeichen; ar ohne Harakat, Hamza-Formen als Alif, Tāʾ marbūṭa als Hāʾ, Alif maqṣūra als Yāʾ) | 0 doppelte Sätze in de, tr und ar; 0 doppelte Lemmata (Form + Wortart) |
| E3 | `python3 -I nutzung.py`: Welche Zielsätze verweist eine Aufgabe, welche stehen live in einem Paket | siehe 1.2 |
| M1 | `node _lernapp/werkzeuge/mengen.mjs --rev 9a8ca1f8` (Ausgabe nur ins Scratchpad) | rc 0; Zahlen gleich E1 und gleich dem Prüfer |
| P1 | `pnpm -s lernapp:pruefen --json …/pruefen.json` in `web/` | rc 0, 52 s: **435 Dateien, 137.493 Einträge, 0 blockierend, 15 menschlich_klaeren, 958 Warnungen**, „Quelle und Lizenz je Eintrag: 100 %“ |
| G | `git log 9a8ca1f8 --format=%s`: Commits „L3-07: Lektorat/Übersetzung/Rückübersetzung <einheit>“ | 647 Commits, Auswertung in 2.3 |
| L1 | GET der 6 Kursverzeichnisse `/lern-app/pakete/<kurs>` | 6 × 200 `application/json` |
| L2 | GET **aller** 254 Einheitenpakete aus den Verzeichnissen | **254 × 200; SHA-256 = `hash` 254/254; Länge = `bytes` 254/254; `hinweis: true` im Verzeichnis 254/254 und im Paket 254/254** |
| L3 | Pakete gegen die Quelle: Aufgaben nach Schlüssel, Einträge (quelle, lizenz, Namensnennung, hinweis), Einstufung | siehe 1.3 und 2.2 |
| L4 | GET `/lern-app/de/tr-aus-de` und `/lern-app/tr/ar-aus-tr` | 200 / 200, Hinweistext da (Schlüssel `ungeprueft`; „Noch nicht von Muttersprachlern geprüft.“ bzw. türkisch) |

---

## 1. Z-L01 Umfang Sprachkurse

### 1.1 Nachzählung (E1, M1)

**Anteiliges Ziel.** Ich habe es aus `rahmen/{de,tr,ar}.rahmen.json` neu hergeleitet. Je Stufe zählen `einheiten`, die
Summe von `lemmaBudget` und `stationen` sowie `saetze`. A1 + A2 + B1 ergibt in allen drei Rahmen 12 + 14 + 16 = **42 Einheiten**,
96 + 112 + 128 = **336 Stationen**, 600 + 900 + 1.300 = **2.800 Lemmata** und 2.400 + 3.600 + 5.200 = **11.200 Sätze**. Das
stimmt mit PLAN §5.1 Zeilen A1–B1 überein. Die Mindestwerte sind 39,9 / 319,2 / 2.660 / 10.640. Die Herleitung des Prüfers ist
**richtig**. Alle 138 Kerneinheiten (A1–B2) haben genau 8 Stationen in der Folge 5 × `lektion`, `geschichte`, `wiederholung`,
`pruefstein`.

| Ziel | Einheiten (frei) | Stationen (frei) | Lemmata (frei) | Sätze (frei) | Urteil |
|---|---|---|---|---|---|
| de | 42 (41) | 336 (328) | 2.800 (2.715 = 97,0 %) | 11.333 (11.006 = 98,3 %) | ≥ 95 % |
| tr | 42 (41) | 336 (328) | 2.758 = 98,5 % (2.674 = **95,5 %**) | 11.488 (11.144 = 99,5 %) | ≥ 95 %, Lemmata freigegeben knapp |
| ar | 42 (42) | 336 (336) | 2.800 (2.800) | 11.363 (11.363) | ≥ 95 % |

Alle Werte, auch je Stufe, stimmen **auf die Einheit genau** mit dem Prüfer und mit M1 überein. Die Schwelle hält auch für
die freigegebenen Einheiten allein.

**Neu gegenüber dem Prüfer:** In tr liegen 41 von 42 Einheiten je **1 Lemma unter dem Budget** ihres Rahmen-Eintrags. Bei
`tr.b1.e16` fehlen 2, nur `tr.b1.e14` trifft das Budget genau (84/84). Die Abweichung ist systematisch, bleibt aber in der
Toleranz (Stufen 98,0 / 98,4 / 98,8 %). Das Handbuch §5 erlaubt „Budget der Einheit oder knapp darunter“.

### 1.2 Übersetzungen je Richtung: Abdeckung nach Schlüssel ja, nach Inhalt nicht ganz

Nach Schlüssel hat jede Richtung 100 % der Zielsätze und Lemmata, in jeder Stufe einzeln. Es gibt 0 leere Einträge,
0 verwaiste Bezüge und 0 Statusabweichungen zwischen Übersetzung und Zieleinheit. Für 11.524 Einträge sind es 2,43–2,85
Alternativen je Eintrag mit Alternativen. Das bestätigt den Prüfer.

Dann habe ich zusätzlich den **Inhalt** geprüft: Übersetzung gleich Quelltext in Vergleichsform, Wortüberlappung
(Jaccard ≥ 0,5) zwischen de und tr, arabische Schrift in `*-aus-ar`, keine arabische Schrift in `*-aus-de` und `*-aus-tr`,
Sprachmarker de/tr/en.

- **G1 (Mangel, live):** In `uebersetzung/de-aus-tr/b1/de.b1.e04.json` hat der Bezug `de.b1.e04.s0071` als `text` den
  **deutschen Quellsatz** „Warum fährt der Fahrstuhl heute nicht?“. Die drei `alternativen` sind türkisch, etwa „Bugün asansör
  neden çalışmıyor?“.
  - Die Einheit ist freigegeben (`4350ee98`).
  - Live enthält das Paket `de-aus-tr/de.b1.e04` den Eintrag `de.b1.e04.s0071@tr` mit `sprache: "tr"` und deutschem Text.
    Er steht im Dialog `de.b1.e04.l02.a12` als aufklappbare Übersetzung der ersten Zeile.
  - Ein türkischsprachiger Lerner sieht dort also Deutsch statt einer Übersetzung.
  - de-aus-tr hat damit **11.332 von 11.333** echten Satzübersetzungen (99,99 %), nicht 100 %.
  - Übersehen haben das die Übersetzung (`50a5b821`), die Rückübersetzung (`86327410`), die Schlussprüfung de b1
    (`dcac498f`), `lernapp:pruefen` (abgleich 0/0/0), `mengen.mjs` und der Prüfer der Stufe C. Alle zählen nur Schlüssel.
- Die übrigen Treffer sind gewollt:
  - de-aus-tr: Buchstabiersätze mit Namen (`de.a1.e01.s0065`, `s0066`, `s0068`) und metasprachliche Sätze mit deutschen
    Beispielwörtern (`de.a1.e07.s0113`, `de.b1.e13.s0189`).
  - de-aus-ar: `de.a1.e01.s0070`, ein Buchstabiersatz ohne arabische Schrift.
  - tr-aus-ar: 8 Alternativen, die nur aus Ordnungszahlen bestehen (`tr.a1.e03.s0069` ff.).
  - Glossen wie „Balkon“ und „Internet“: 23 in de-aus-tr und 29 in tr-aus-de, Lehnwörter, gewollt.
  - In tr-aus-de, ar-aus-de, ar-aus-tr und tr-aus-ar gibt es keine Kopie des Quelltexts.

### 1.3 Was beim Lerner ankommt: Vorratssätze (E3, L2)

| Ziel | Sätze A1–B1 | in einer Aufgabe verwiesen | live in einem Paket (je Richtung) | Anteil am Ziel 11.200 |
|---|---:|---:|---:|---:|
| de | 11.333 | 9.587 (84,6 %) | 9.333 | 83,3 % |
| tr | 11.488 | 7.720 (67,2 %) | 7.572 | 67,6 % |
| ar | 11.363 | 7.591 (66,8 %) | 7.591 | 67,8 % |

Je Stufe verweist eine Aufgabe auf folgende Anteile der Sätze:

| Ziel | A1 | A2 | B1 |
|---|---:|---:|---:|
| de | 2.310 / 2.438 | 3.209 / 3.641 | 4.068 / 5.254 |
| tr | 2.011 / 2.534 | 2.690 / 3.658 | 3.019 / 5.296 |
| ar | 1.904 / 2.611 | 3.211 / 3.685 | 2.476 / 5.067 |

Der Paketbau übernimmt nur Einträge, auf die eine Aufgabe verweist (`paket/bauen.ts`). Ein Drittel der tr- und ar-Sätze und
ein Sechstel der de-Sätze erreicht also kein Gerät. In B1 ar ist es mehr als die Hälfte.

**Bewertung:** Das ist **kein Verstoß** gegen Z-L01, aus zwei Gründen:
- PLAN Z. 45 nennt die Sätze einen „Korpus“, und der vorgesehene Beleg ist der Mengenbericht aus den Inhaltsdateien.
- Das Handbuch §5 erlaubt „Sätze ohne Aufgabe … als Vorrat“.

Der BERICHT muss es aber offen sagen. Sonst klingt „11.200 Sätze je Zielsprache“ nach mehr, als die App zeigt.

### 1.4 Vorkurse, Einstufung, Tipps, Live

- **Schrift-Vorkurse** wie beim Prüfer (M1, L3):
  - ar 8 + 8 Lektionen, Latein 6, tr 2 + 2, dazu 1 Lektion de für tr.
  - Live fehlen genau die 12 `schrift_latein`-Höraufgaben ohne Clip in `de.a1.e00-ar` (97 von 109 Aufgaben).
  - Keine Lektion hat live weniger als 3 Aufgaben.
- **Einstufung live**, nachgerechnet mit erster und letzter Einheit der Stufe (`einheitenFuer`, `engine/einstufung.ts:173`),
  nur Typen aus `EINSTUFUNG_TYPEN`, ohne Höraufgaben und ohne `minimalpaare`:
  - je Richtung 358 / 367 / 336 / 367 / 341 / 358 (tr-aus-de, ar-aus-de, de-aus-tr, ar-aus-tr, de-aus-ar, tr-aus-ar);
  - genau die Zahlen des Prüfers;
  - die A1-Vorkurse liefern 0 Kandidaten, nur `de.a1.e00-ar` liefert 5. Lücke 4 des Prüfers ist bestätigt;
  - die Bank ist vorhanden. Z-L01 verlangt nur „vorhanden“.
- **Tipps:** 242–263 je Richtung in der Quelle, 236–263 in den freigegebenen Einheiten. Bestätigt.
- **Live:**
  - 6 Kurse mit A1 13 (mit Vorkurs), A2 14 und B1 16 (ar) bzw. 15 (de, tr).
  - Von e16 ist nur `ar.b1.e16` gelistet. Es gibt keinen Schlüssel mit `b2` oder `test`.
  - Aufgaben: Quelle 32.882 gegen live 32.820. Es fehlen 62, nach Schlüssel genau die Liste des Prüfers:
    - 12 × `schrift_latein`;
    - ar 34 × `harakat`, 10 × `satzbau`, 2 × `luecke` (je 2 Richtungen);
    - de 2 × `satzbau`, tr 2 × `satzbau`.

### 1.5 Lücken Z-L01 (zusätzlich zu den vier des Prüfers, die ich alle bestätige)

1. **G1:** de-aus-tr `de.b1.e04.s0071` ist nicht übersetzt (1.2). Damit ist die Teilschwelle „100 % der Zielsätze“
   für de-aus-tr nicht erfüllt (99,99 %), und das ist live sichtbar.
2. Vorratssätze: Nur 67,6 % (tr), 67,8 % (ar) und 83,3 % (de) der Ziel-Satzmenge erreichen den Lerner (1.3). Das ist
   regelkonform, steht aber in keinem Beleg.
3. tr: 41 von 42 Einheiten liegen je 1 Lemma unter ihrem Rahmen-Budget (1.1). Das liegt in der Toleranz, ist aber nicht
   kommentiert.

### 1.6 Nacharbeit Z-L01

1. **G1 beheben** (Orchestrator; Alltagssatz ohne Religionsbezug, KI-Regel 2 nicht berührt). In
   `uebersetzung/de-aus-tr/b1/de.b1.e04.json` beim Bezug `de.b1.e04.s0071` den `text` auf eine der vorhandenen türkischen
   Alternativen setzen, etwa „Bugün asansör neden çalışmıyor?“, und diese aus `alternativen` nehmen. Danach `lernapp:pruefen`
   laufen lassen und nach dem Vercel-Bau das Paket `de-aus-tr/de.b1.e04` live prüfen. **Danach ist Z-L01 erfüllt**, wenn
   sonst nichts geändert ist.
2. Technik (Opus): Prüferregel „Übersetzung gleich Quelltext“ (siehe Z-L14, Nacharbeit A).
3. BERICHT bzw. Mengenbericht: Neben der Korpuszahl auch „davon in Aufgaben / live“ je Zielsprache nennen (Tabelle 1.3).
   Das passt zur Nacharbeit 1 des Prüfers (Stufenauswahl in `mengen.mjs`).
4. Nacharbeit 1–4 des Prüfers bleiben bestehen.

---

## 2. Z-L14 Inhaltsprüfer

### 2.1 Prüferlauf (P1)

- Eigener Lauf: rc 0. **435 Dateien, 137.493 Einträge, 0 blockierend, 15 menschlich_klaeren, 958 Warnungen**. Je Prüfer
  dieselben Werte wie beim Prüfer:
  - tabu 0/12/812, religionsbezug 0/3/82, wortschatz 0/0/56, abdeckung 0/0/6, symbole 0/0/2;
  - alle anderen 0/0/0.
- Die 15 menschlich_klaeren (aus `pruefen.json`) liegen nur in Entwürfen:
  - 9 × tabu in `uebersetzung/de-aus-ar/b1/de.b1.e16.json` (Lemmata politisch, Politik, Parlament; Sätze s0059, s0060,
    s0131, s0278, s0285, s0298);
  - 3 × tabu in `de-aus-tr/b1/de.b1.e16.json`;
  - 3 × religionsbezug in `tr-aus-ar/b1/tr.b1.e16.json` (Lemma `mantar`, Sätze s0015, s0103).
- **0 freigegebene Einheiten mit menschlich_klaeren.** Bestätigt.
- Die 10 Tabu-Warnungen „nur sachlich“ stehen alle in `de.b2.e10`, also in einem Entwurf.

### 2.2 Quelle, Lizenz, Namensnennung (eigene Zählung über die Quelle und alle 254 Live-Pakete)

| Bestand | Einträge | ohne quelle / lizenz | fremd | mit Namensnennung |
|---|---:|---:|---:|---:|
| Lemmata `sprache/**` | 9.633 | 0 / 0 | 5.357 Wiktionary | 5.357; Lizenz CC-BY-SA-4.0 |
| Sätze `sprache/**` | 39.445 | 0 / 0 | 1.437 Tatoeba | 1.437; Lizenz CC-BY-2.0-FR; ID der Quelle in der Nennung 1.437/1.437 |
| Übersetzungen | 85.250 | 0 / 0 | 30 Tatoeba | 30 |
| Tipps | 1.511 | 0 / – | 0 (alle `ki:`) | – |
| **Live**, 254 Pakete | 116.763 | 0 / 0 | 12.490 | 12.490; `hinweis: true` an jedem Eintrag; 0 `test:` |

Bestätigt. Hinweis: Tipps haben laut Schema kein eigenes `lizenz`-Feld. Es sind alles eigene Inhalte, und das Paket trägt
`lizenz: "CC-BY-SA-4.0"`. Das genügt, ist aber genau genommen eine Lizenz je Paket und nicht je Eintrag.

### 2.3 Dubletten und Gegenprüfungen

- **Dubletten.** Meine Normform (E2) ist strenger als die des Prüfers: ohne Satzzeichen, ar zusätzlich mit gleichgesetzten
  Hamza-, Tāʾ-marbūṭa- und Alif-maqṣūra-Formen. Ergebnis:
  - de 11.399 Sätze (mit Vorkurs), tr 11.488, ar 11.413: je **0 doppelt**;
  - Lemmata nach Form und Wortart 0 doppelt;
  - nur nach der Form: de 8, tr 2 und ar 157 Gleichschreibungen. Sie gehören zu verschiedenen Wortarten (z. B. kosten/Kosten,
    yüz Zahlwort/Nomen) bzw. sind ar-Homographen ohne Vokalzeichen. Das sind keine Dubletten.
  - **Quote 0,00 %.** Bestätigt.
- **Gegenprüfungen, nachgezählt aus den Commit-Betreffen (G):**
  - Lektorat **126/126**.
  - Übersetzung **252/252** Paare aus Einheit und Richtung.
  - Rückübersetzung 119/126. Es fehlen `ar.a2.e05`–`e11`. Deren Korrekturen hat `8ce35c2f` eingespielt: 14 Übersetzungsdateien
    e05–e11, laut Commit-Text „offene Korrekturen der Rückübersetzung e05–e11 eingespielt“.
  - Schlussprüfungs-Commits 9/9 vorhanden.
  - Alles bestätigt. Die Angabe „115 Korrekturen“ steht nicht im Commit, nur im PRÜFPUNKT. Ich habe sie nicht nachgezählt.
- **Übergabe an Menschen.**
  - `_lernapp/MENSCHEN.md` enthält **keinen** Treffer für e16, OF-10, R-06, mantar, Pilz und iş birliği.
  - `LEKTORAT-OFFEN.md` (23 Zeilen) betrifft nur das Lektorat der Rahmenpläne.
  - Die Fragen der Redaktion zu B1 tr (PRÜFPUNKT Z. 144–149) und B1 ar (Z. 63–69) stehen nur im PRÜFPUNKT.
  - Lücke 1 und 2 des Prüfers sind bestätigt. Dazu gehört „OF-10 in e10/e11“ (ar B1). `ar.b1.e10` (Nachhilfe im Jugendtreff)
    und `ar.b1.e11` (Antrag für den Austausch) sind **schon freigegeben**. Fällt die Entscheidung zu OF-10 gegen Staatskunde
    aus, müssen auch diese beiden Einheiten erneut geprüft werden. Deshalb muss die Frage mit Einheitenbezug an LM-09 gehen.

### 2.4 Lücken Z-L14 (zusätzlich zu den vier des Prüfers, die ich alle bestätige)

1. **Keine Regel gegen kopierte Quelltexte:** G1 (1.2) hat den Prüfer und alle Gegenprüfungen bestanden: Übersetzung,
   Rückübersetzung, Schlussprüfung, Freigabe und Stufe C. Weder der Inhaltsprüfer noch die Rückübersetzung prüft, ob die
   Übersetzung in der Ausgangssprache steht oder nur den Quelltext wiederholt. Das ist ein Befund einer Gegenprüfung, der
   weder erledigt noch übergeben ist.
2. Hinweis: Die OF-10-Frage betrifft auch die freigegebenen Einheiten `ar.b1.e10` und `e11` (2.3). Ohne eine Übergabe mit
   Einheitenbezug kann bei einer Antwort „nein“ ein Stand sichtbar bleiben, der dann nicht mehr gedeckt ist.

### 2.5 Nacharbeit Z-L14

- **A (Technik, Opus):** Im Prüfer `abgleich` eine Regel ergänzen. Ein Satz mit ≥ 3 Wörtern, dessen Übersetzung in der
  Vergleichsform gleich dem Zieltext ist, wird mindestens Warnung, für freigegebene Einheiten besser blockierend. Ausgenommen
  sind Buchstabier- und reine Namenssätze. Ebenso eine Übersetzung in `*-aus-ar` ohne arabischen Buchstaben bzw. in
  `*-aus-de`/`*-aus-tr` mit arabischem Buchstaben. Dazu ein Unit-Test mit dem Fall `de.b1.e04.s0071`.
- **B (Orchestrator):** Nacharbeit 1 des Prüfers (MENSCHEN.md) um diese Punkte ergänzen:
  - unter LM-09 „OF-10 betrifft `de.b1.e16` (Entwurf) sowie die freigegebenen `ar.b1.e10` und `ar.b1.e11`“;
  - unter LM-03 bzw. LM-02 den R-06-Fall `tr.b1.e16` (Lemma `mantar` in tr-aus-ar).
  - Nur Umschrift, keine arabische Schrift.
- **C:** Die Entscheidungen OF-10 und R-06 trifft nur ein Mensch: LM-09 (Vorstand) bzw. LM-02/LM-03.
- Nacharbeit 1–4 des Prüfers bleiben bestehen.

---

## 3. Zusammenfassung

| Z | Status neu | Beleg kurz |
|---|---|---|
| Z-L01 | **teilweise** (herabgestuft) | Mengen A1–B1 auf die Einheit genau nachgezählt (eigenes Skript, `mengen.mjs`, Prüfer stimmen überein): de 42/336/2.800/11.333, tr 42/336/2.758/11.488, ar 42/336/2.800/11.363. Freigegeben alle Werte ≥ 95 % (tr-Lemmata 95,5 %). Anteiliges Ziel 42/336/2.800/11.200 aus den Rahmen korrekt. Live 254/254 Pakete 200, Hash und Länge stimmen, `hinweis` überall. **Aber:** de-aus-tr `de.b1.e04.s0071` hat den deutschen Quellsatz als türkische Übersetzung, live im Dialog `de.b1.e04.l02.a12`. Damit 11.332/11.333 statt 100 %. Ein Drittel der tr/ar-Sätze ist Vorrat ohne Aufgabe (live 67,6 / 67,8 / 83,3 % des Satzziels, regelkonform, im BERICHT nennen). Nach der einzeiligen Korrektur: erfüllt |
| Z-L14 | **teilweise** (bestätigt) | 0 blockierend, 15 menschlich_klaeren nur in den Entwürfen `de.b1.e16`/`tr.b1.e16`. quelle, lizenz und Namensnennung 100 % in Quelle und live (116.763 Einträge, 12.490 fremd). Dubletten 0,00 % auch in strengerer Normform. Lektorat 126/126, Übersetzung 252/252, Rückübersetzung 119 + 7 über `8ce35c2f`, Schlussprüfungen 9/9. Offen: Die Restfragen B1 tr/ar sowie OF-10 und R-06 mit Einheitenbezug sind nicht in MENSCHEN.md, und eine Prüferregel gegen kopierte Quelltexte fehlt (G1) |
