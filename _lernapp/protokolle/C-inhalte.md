# Stufe C – Gruppe „inhalte“: Umfang und Inhaltsprüfer (L8-05)

| | |
|---|---|
| Datum | 26.10.2026 |
| Stand | `9a8ca1f8` (Branch `claude/trusting-lovelace-6nfolz`; Haupt-Checkout `/home/user/IGMG`). Während der Prüfung kam `25975bf0` hinzu (nur `_lernapp/PRUEFPUNKT.md`); `web/inhalte/lernapp/**` und `web/src/lib/lernapp/paket/**` sind gegenüber `9a8ca1f8` unverändert |
| Prüfer | Stufe C, Gruppe inhalte |
| Kriterien | Z-L01 (Umfang Sprachkurse), Z-L14 (Inhaltsprüfer) |
| Umfang | Sprachkurse A1–B1 in allen 6 Richtungen nach Nutzerentscheidung L3-E16 (25.10.2026); B2/C1 offener Ausbau. Mengenschwelle anteilig für A1–B1: je Zielsprache Ist ≥ Ziel − 5 % (Rahmenpläne `web/inhalte/lernapp/rahmen/*.rahmen.json` = PLAN §5.1) |
| Freigabe | L3-E15: `automatisch_geprueft` mit Hinweis; Einheiten mit `menschlich_klaeren` bleiben Entwurf (bekannt: `de.b1.e16` OF-10 Politik, `tr.b1.e16` R-06 Fehltreffer „Pilz“) |
| Live | `https://igmg-wetzlarer.vercel.app`, nur GET mit curl, 26.10.2026 zwischen 05:32 und 05:42 UTC |
| Schrift | Diese Datei enthält keine arabische Schrift und keine religiösen Texte (KI-Regel 2, ADR 0040, `_lernapp/KERN.md` §2). Arabisches steht nur als Schlüssel oder in Umschrift |

## 0. Vorgehen, Befehle, Grenzen

- Nur gelesen, gezählt und geprüft; geschrieben wurde nur diese Datei. Kein git add, commit, stash oder checkout.
  `git status` war vor dem Schreiben leer. Die Arbeitsbäume unter `.claude/worktrees/` wurden nicht angefasst. Keine
  MCP-Werkzeuge.
- Umgebung: Node 24.21.0 aus dem Scratchpad, Python mit `-I`. Eigene Rohdaten liegen unter
  `scratchpad/c-inhalte/` (nicht im Repository): `mengen-9a8ca1f8.md`, `pruefen.log`, `pruefen.json`, `zaehlen.py`,
  `zaehlen.out`, `live/` (Verzeichnisse, `liste.txt`, `sweep.txt`, `einst.txt`).

| # | Befehl | Ergebnis |
|---|---|---|
| M1 | `node _lernapp/werkzeuge/mengen.mjs --rev 9a8ca1f8` (Ausgabe nur im Scratchpad) | rc 0; 444 JSON-Dateien; Status der Spracheinheiten `automatisch_geprueft` 130, `entwurf` 14 (12 × B2 de, `de.b1.e16`, `tr.b1.e16`) |
| M2 | `python3 -I zaehlen.py web/inhalte/lernapp` (eigene Gegenzählung, nur Zahlen) | rc 0; Zahlen in Abschnitt 1 und 2 stimmen mit M1 überein |
| P1 | `pnpm lernapp:pruefen` in `web/` | rc 0, 65 s: **435 Dateien, 137.493 Einträge, 0 blockierend, 15 menschlich_klaeren, 958 Warnungen**; „Quelle und Lizenz je Eintrag: 100 %“ |
| P2 | `pnpm -s lernapp:pruefen --json scratchpad/c-inhalte/pruefen.json` | rc 0, gleiches Ergebnis (55 s); Grundlage der Aufschlüsselung in Z-L14 |
| L1 | GET `/lern-app/pakete/<kurs>` für alle 6 Kurse | 6 × 200, `application/json` |
| L2 | GET aller Einheitenpakete `/lern-app/pakete/<kurs>/<einheit>/<hash>` aus den 6 Verzeichnissen, SHA-256 des Körpers gegen `hash`, Länge gegen `bytes` | **254/254 × 200, 254/254 Hash = SHA-256, 254/254 Länge = `bytes`** (Vollerhebung statt Stichprobe) |
| L3 | Inhalte der 254 Pakete gegen die Quelldateien (Aufgaben, Einträge, Namensnennung, Tipps, `hinweis`) | siehe Z-L01 (Live) und Z-L14 |
| L4 | GET `/lern-app/de` und `/lern-app/de/tr-aus-de` | 200 / 200; die Kursseite liefert den Hinweistext „Noch nicht von Muttersprachlern geprüft.“ (Schlüssel `ungeprueft`) mit |

---

## 1. Z-L01 Umfang Sprachkurse

**Schwelle:** 6 Richtungen nach Rahmenplan, Umfang A1–B1 nach L3-E16; je Zielsprache Einheiten, Stationen, Lemmata und
Sätze ≥ Ziel − 5 % (A1–B1: 42 Einheiten, 336 Stationen, 2.800 Lemmata, 11.200 Sätze → Mindestwerte 39,9 / 319,2 /
2.660 / 10.640); je Richtung Übersetzungen für 100 % der Zielsätze; Schrift-Vorkurse und Einstufungsbank vorhanden;
Tipp-Karten zum Vergleich; live alle 6 Richtungen mit A1/A2/B1, Hinweis gesetzt, Pakete 200 und Hash = SHA-256.

**Status: erfüllt** (Umfang A1–B1 nach L3-E16; B2/C1 offener Ausbau)

### 1.1 Mengentabelle je Zielsprache und Stufe (Stand `9a8ca1f8`, ohne Schrift-Vorkurse)

Ziel je Stufe aus den Rahmenplänen (`stufen[].einheiten`, Summe `lemmaBudget`, `saetze`, Summe `stationen`) = PLAN §5.1.

| Ziel | Stufe | Einheiten | davon frei | Stationen | Lemmata | Sätze | Aufgaben |
|---|---|---:|---:|---:|---:|---:|---:|
| de | A1 | 12 / 12 | 12 | 96 / 96 | 600 / 600 | 2.438 / 2.400 (101,6 %) | 1.525 |
| de | A2 | 14 / 14 | 14 | 112 / 112 | 900 / 900 | 3.641 / 3.600 (101,1 %) | 1.823 |
| de | B1 | 16 / 16 | 15 | 128 / 128 | 1.300 / 1.300 | 5.254 / 5.200 (101,0 %) | 2.242 |
| **de** | **A1–B1** | **42 / 42 (100 %)** | **41 (97,6 %)** | **336 / 336 (100 %)** | **2.800 / 2.800 (100 %)** | **11.333 / 11.200 (101,2 %)** | **5.590** |
| tr | A1 | 12 / 12 | 12 | 96 / 96 | 588 / 600 (98,0 %) | 2.534 / 2.400 (105,6 %) | 1.517 |
| tr | A2 | 14 / 14 | 14 | 112 / 112 | 886 / 900 (98,4 %) | 3.658 / 3.600 (101,6 %) | 1.799 |
| tr | B1 | 16 / 16 | 15 | 128 / 128 | 1.284 / 1.300 (98,8 %) | 5.296 / 5.200 (101,8 %) | 2.031 |
| **tr** | **A1–B1** | **42 / 42 (100 %)** | **41 (97,6 %)** | **336 / 336 (100 %)** | **2.758 / 2.800 (98,5 %)** | **11.488 / 11.200 (102,6 %)** | **5.347** |
| ar | A1 | 12 / 12 | 12 | 96 / 96 | 600 / 600 | 2.611 / 2.400 (108,8 %) | 1.501 |
| ar | A2 | 14 / 14 | 14 | 112 / 112 | 900 / 900 | 3.685 / 3.600 (102,4 %) | 2.038 |
| ar | B1 | 16 / 16 | 16 | 128 / 128 | 1.300 / 1.300 | 5.067 / 5.200 (97,4 %) | 1.987 |
| **ar** | **A1–B1** | **42 / 42 (100 %)** | **42 (100 %)** | **336 / 336 (100 %)** | **2.800 / 2.800 (100 %)** | **11.363 / 11.200 (101,5 %)** | **5.526** |

Nur die freigegebenen Einheiten (ohne `de.b1.e16` mit 85 Lemmata, 327 Sätzen, 8 Lektionen und `tr.b1.e16` mit 84 Lemmata,
344 Sätzen, 8 Lektionen) gezählt:

| Ziel | Einheiten | Stationen | Lemmata | Sätze | Bewertung |
|---|---:|---:|---:|---:|---|
| de | 41 (97,6 %) | 328 (97,6 %) | 2.715 (97,0 %) | 11.006 (98,3 %) | ≥ 95 % |
| tr | 41 (97,6 %) | 328 (97,6 %) | 2.674 (95,5 %) | 11.144 (99,5 %) | ≥ 95 % (Lemmata knapp) |
| ar | 42 (100 %) | 336 (100 %) | 2.800 (100 %) | 11.363 (101,5 %) | ≥ 95 % |

Zusatz (keine Schwelle in Z-L01, Ist A1–B1 / PLAN §5.1): Dialoge + Geschichten de 691 / 84, tr 679 / 84, ar 639 / 84;
Lesetexte de 69 / 52, tr 59 / 52, ar 56 / 52; Sprechen de 356 / 84, tr 294 / 84, ar 256 / 84; Schreiben de 30 / 30,
tr 29 / 30 (A2 13 / 14), ar 30 / 30. Prüfer-Abdeckung (P1): ar und de je Stufe 100 % der Lemma-Budgets, tr 98,0 / 98,4 /
98,8 %.

B2/C1 (offener Ausbau, nicht bewertet): B2 de 12 Einheiten als Entwurf (1.275 Lemmata, 5.145 Sätze, keine Übersetzungen),
live unsichtbar; B2 tr/ar und C1 nicht begonnen.

### 1.2 Übersetzungen je Richtung (A1–B1)

| Richtung | Dateien | Einträge | Zielsätze übersetzt | Lemmata (Glossen) | Vorkurs-Sätze | Alternativen je Satz | Tipps |
|---|---:|---:|---|---|---|---:|---:|
| tr-aus-de | 43 | 14.246 | 11.488 / 11.488 (100 %) | 2.758 / 2.758 | – (0 Sätze) | 2,45 | 244 |
| ar-aus-de | 43 | 14.213 | 11.363 / 11.363 (100 %) | 2.800 / 2.800 | 50 / 50 | 2,59 | 263 |
| de-aus-tr | 43 | 14.140 | 11.333 / 11.333 (100 %) | 2.800 / 2.800 | 7 / 7 | 2,83 | 242 |
| ar-aus-tr | 43 | 14.213 | 11.363 / 11.363 (100 %) | 2.800 / 2.800 | 50 / 50 (geteilt mit `ar.a1.e00-de`) | 2,58 | 263 |
| de-aus-ar | 43 | 14.192 | 11.333 / 11.333 (100 %) | 2.800 / 2.800 | 59 / 59 | 2,83 | 254 |
| tr-aus-ar | 43 | 14.246 | 11.488 / 11.488 (100 %) | 2.758 / 2.758 | – (0 Sätze) | 2,43 | 245 |

- Je Stufe ebenfalls 100 % (A1, A2 und B1 einzeln gezählt, `zaehlen.out`). Keine Einheit ohne Übersetzungsdatei, keine
  Übersetzung ohne Bezug; Status von Übersetzung und Zieleinheit überall gleich.
- `ar.a1.e00-tr` hat selbst keine Sätze, seine Aufgaben verweisen auf die 50 Sätze von `ar.a1.e00-de` (117 Verweise);
  die Übersetzungsdatei `ar-aus-tr` deckt genau diese 50 ab, und das Live-Paket enthält sie (50 Ziel- und 30
  Übersetzungseinträge). Kein Mangel.
- Mit Satzalternativen haben 99,1–99,8 % der Satzübersetzungen mindestens eine; ≈ 2,4–2,8 je Satz (Plan „≈ 3“, keine
  Schwelle).
- Der Mengenbericht M1 zeigt für de-aus-tr und de-aus-ar 68,8 % bzw. 68,9 %. Das liegt allein an den unübersetzten
  B2-de-Entwürfen (5.145 Sätze), die `mengen.mjs` mitzählt; für A1–B1 sind es 100 %.

### 1.3 Schrift-Vorkurse, Einstufungsbank, Tipp-Karten

| Vorkurs | für Ausgang | Lektionen | Aufgaben (Quelle / live) | Ziel PLAN §5.1 |
|---|---|---:|---|---|
| ar | de | 8 | 151 / 151 | 8 Lektionen Arabisch-Schrift |
| ar | tr | 8 | 151 / 151 | 8 |
| de (Latein) | ar | 6 | 109 / 97 | 6 Latein |
| de | tr | 1 | 25 / 25 | – (Rahmen `de.v`, Sonderzeichen) |
| tr | de | 2 | 36 / 36 | 2 Türkisch |
| tr | ar | 2 | 38 / 38 | 2 |

Die 12 fehlenden Aufgaben in `de.a1.e00-ar` sind `schrift_latein`-Höraufgaben ohne Vorgabe; der Paketbau lässt sie ohne
Clip weg (`paket/bauen.ts:420`). Erwartet, solange es kein Audio gibt.

**Einstufungsbank** (`EINSTUFUNG_TYPEN`, `engine/einstufung.ts:31`; Ziel ≈ 400 je Zielsprache für A1–C1, anteilig A1–B1
≈ 233):

| | A1 | A2 | B1 | Σ A1–B1 |
|---|---:|---:|---:|---:|
| Kandidaten in den Inhalten (M1), de | 1.009 | 1.281 | 1.531 | 3.821 |
| tr | 900 | 1.176 | 1.391 | 3.467 |
| ar | 990 | 1.294 | 1.424 | 3.708 |
| live wirksam ohne Audio (erste + letzte Einheit der Stufe, ohne Hörtypen), tr-aus-de / tr-aus-ar | 58 | 147 | 153 | 358 |
| ar-aus-de / ar-aus-tr | 65 | 136 | 166 | 367 |
| de-aus-tr | 55 | 130 | 151 | 336 |
| de-aus-ar | 60 | 130 | 151 | 341 |

**Tipp-Karten** (Ziel ≈ 300 je Richtung für A1–C1, anteilig ≈ 175): Quelle 242–263 je Richtung (Tabelle 1.2); in den 254
Live-Paketen 236 (de-aus-tr) bis 263 (ar-aus-*), gleich den Quelldateien der freigegebenen Einheiten.

### 1.4 Live (L1–L4)

| Kurs | Einheiten A1 (mit Vorkurs) / A2 / B1 | Lektionen ohne Vorkurs | Vorkurs-Lektionen | `hinweis: true` | Pakete 200 + SHA-256 | Bytes |
|---|---|---:|---:|---|---|---:|
| tr-aus-de | 13 / 14 / 15 | 328 | 2 | 42/42 | 42/42 | 7,6 MB |
| ar-aus-de | 13 / 14 / 16 | 336 | 8 | 43/43 | 43/43 | 11,7 MB |
| de-aus-tr | 13 / 14 / 15 | 328 | 1 | 42/42 | 42/42 | 8,7 MB |
| ar-aus-tr | 13 / 14 / 16 | 336 | 8 | 43/43 | 43/43 | 11,6 MB |
| de-aus-ar | 13 / 14 / 15 | 328 | 6 | 42/42 | 42/42 | 9,1 MB |
| tr-aus-ar | 13 / 14 / 15 | 328 | 2 | 42/42 | 42/42 | 7,9 MB |

- 254 Einheiten. Verzeichnis gegen Quelle: 254/254 mit `automatisch_geprueft`, gleicher Lektionszahl und gleichem Thema,
  0 Abweichungen. `de.b1.e16` und `tr.b1.e16` fehlen wie vorgesehen, keine B2/C1-Einheit, keine Testeinheit
  (`tr.a1.e01` ist die echte Einheit mit 8 Lektionen).
- Alle 254 Pakete tragen `hinweis: true`. Die Kursseite liefert den Hinweistext mit.
- Pakete gegen Quelle: 32.820 von 32.882 Aufgaben stehen im Paket. 62 fehlen, das sind 0,02–0,41 % je Kurs:
  - 12 sind die erwarteten Vorkurs-Höraufgaben (siehe 1.3).
  - 50 verwirft der Paketbau, weil sie das Spielerschema nicht bestehen. Es sind 25 verschiedene Aufgaben, die in beiden
    Richtungen ihrer Zielsprache fehlen:
    - ar: 17 `harakat`, 5 `satzbau`, 1 `luecke`. Betroffen sind `ar.a2.e01`, e04, e05, e07, e08, e09, e10, e12 sowie
      `ar.b1.e09`, e11, e13, e14, e16.
    - de: 1 `satzbau` in `de.b1.e06.l01.a13`.
    - tr: 1 `satzbau` in `tr.b1.e13.l04.a05`.
  - Die Mengen von Z-L01 berührt das nicht. Siehe Lücke 3.

**Belege (kurz):** M1, M2 (Tabellen 1.1–1.3), P1-Abdeckung, L1–L4 (Tabelle 1.4, `live/sweep.txt`: 254 Zeilen
„200 hash-ok“).

**Lücken**
1. Der Repo-Beleg `_lernapp/berichte/mengen.md` ist veraltet. Er stammt von `3296d727`/`aa0471d1` (21.10.2026) und zeigt
   0 Einheiten. `mengen.mjs` kennt keinen Umfang nach L3-E16 und bewertet nur A1–C1. Deshalb stehen dort alle Zielsprachen
   auf „offen“ und de-aus-tr/de-aus-ar auf 68,8 %, obwohl A1–B1 erfüllt ist.
2. Zwei Einheiten bleiben Entwurf, `de.b1.e16` und `tr.b1.e16` (bekannt, live unsichtbar). Die freigegebenen Mengen liegen
   trotzdem über 95 %, tr-Lemmata aber nur knapp (95,5 %).
3. Der Paketbau verwirft still 25 Inhaltsaufgaben (50 Paketaufgaben). Der Inhaltsprüfer meldet sie nicht (Z-L14, Lücke 3).
4. Hinweis: Der Einstufungstest lädt „erste und letzte Einheit der Stufe“ (`einheitenFuer`, `engine/einstufung.ts`). Für A1
   ist die erste der Schrift-Vorkurs. Der liefert 0 Kandidaten, nur in de-aus-ar 5. Die A1-Bank stammt damit fast ganz
   aus `a1.e12`. Die Bank ist trotzdem groß genug, sie umspannt A1 aber nicht.

**Nacharbeit**
1. `mengen.mjs` um eine Stufenauswahl erweitern, z. B. `--stufen a1,a2,b1`, oder den Umfang aus L3-E16 als Standard nehmen.
   Bewertet wird dann gegen das anteilige Ziel, Übersetzungen nur über die gewählten Stufen. Den Bericht mit
   `--rev <Endstand> --aus _lernapp/berichte/mengen.md` neu erzeugen und committen. Zuständig: Orchestrator/Technik (Opus).
2. `de.b1.e16` und `tr.b1.e16` erst nach den Entscheidungen der Menschen freigeben: nur Mensch, LM-09 (OF-10, Vorstand)
   bzw. LM-02/LM-03 (R-06 „Pilz“). Siehe Z-L14, Nacharbeit 1–2.
3. Die 25 verworfenen Aufgaben berichtigen oder bewusst entfernen. Die `harakat`-Aufgaben sind Vokalisierungsübungen mit
   Alltagswortschatz ohne Religionsbezug; KI-Regel 2 ist nicht berührt. Dazu Prüferregel nach Z-L14, Nacharbeit 3.
4. Optional (Technik): `einheitenFuer` überspringt Vorkurs-Einheiten (Schlüssel `…e00-<ausgang>`), mit Unit-Test in
   `einstufung.test.ts`.

---

## 2. Z-L14 Inhaltsprüfer

**Schwelle:** `pnpm lernapp:pruefen` 0 blockierende Befunde; `quelle`, `lizenz` und Namensnennung je Eintrag 100 %;
Dubletten < 1 %; Befunde der Gegenprüfungen (Lektorate, Rückübersetzungen, Schlussprüfungen je Stufe und Sprache)
erledigt oder an Menschen übergeben (MENSCHEN.md bzw. OF-Liste).

**Status: teilweise** – drei der vier Teilschwellen sind erfüllt. Offen ist die Übergabe der Restbefunde an Menschen: Sie
stehen nur im PRÜFPUNKT und in Commit-Nachrichten, nicht in MENSCHEN.md oder der OF-Liste.

### 2.1 Prüferlauf (P1, P2)

- rc 0: **435 Dateien, 137.493 Einträge, 0 blockierend**, 15 menschlich_klaeren, 958 Warnungen.
- Je Prüfer (blockierend/Mensch/Warnung): schema 0/0/0, dubletten 0/0/0, abgleich 0/0/0, lizenz 0/0/0, ausschluss 0/0/0,
  wortschatz 0/0/56, satzlaenge 0/0/0, lemmabudget 0/0/0, abdeckung 0/0/6, vokalisierung 0/0/0, tabu 0/12/812,
  kinder 0/0/0, religionsbezug 0/3/82, religion 0/0/0, daten 0/0/0, symbole 0/0/2, audio 0/0/0.
- **menschlich_klaeren (15), alle in den zwei Entwurfs-Einheiten:**
  - 12 × tabu [politik]: `de.b1.e16` in de-aus-ar 9 (Lemmata politisch, Politik, Parlament; Sätze s0059, s0060, s0131,
    s0278, s0285, s0298) und de-aus-tr 3 (politisch, Politik, s0060).
  - 3 × religionsbezug [R-06]: `tr.b1.e16` in tr-aus-ar (Lemma `mantar`, Sätze s0015, s0103).
- **Warnungen nach Status:**
  - freigegebene Einheiten 899: tabu 756 + Rahmen 11, religionsbezug 79, wortschatz 45, abdeckung 6, symbole 2.
  - Entwürfe 59.
- **Warnungen nach Art:**
  - tabu 791 „möglicher Treffer (mehrdeutig)“, 10 „nur sachlich“, 11 Umschriften ohne kaikki-Eintrag (LM-01).
  - religionsbezug 82 „Wiktionary-Artikel mit Thema Religion – Kandidat“, bewertet von der Gruppe religion
    (`C-religion.md` Z-L10).
  - wortschatz 56 Vorgriffe.
  - abdeckung 6 „Vorkurs-Einheit ohne Eintrag im Rahmenplan“, gewollt nach L3-E13.
  - symbole 2 (LM-34).
  - Keine Warnung blockiert.

### 2.2 Quelle, Lizenz, Namensnennung (M2, L3)

| Bestand | Einträge | ohne `quelle` | ohne `lizenz` | fremde Quelle | davon mit Namensnennung |
|---|---:|---:|---:|---:|---:|
| Zielinhalte `sprache/**` (alle Stufen, auch B2-Entwurf): Lemmata | 9.633 | 0 | 0 | 5.357 Wiktionary | 5.357 (100 %) |
| Zielinhalte: Sätze | 39.445 | 0 | 0 | 1.437 Tatoeba | 1.437 (100 %) |
| Übersetzungen A1–B1 (6 Richtungen) | 85.250 | 0 | 0 | 30 Tatoeba | 30 (100 %) |
| Tipps (6 Richtungen) | 1.511 | 0 | – | – | – |
| Wissenskurs `islam/**`: Objekte mit Quellfeld | 3.165 | 0 | 0 | – | – |
| **Live:** Einträge in 254 Paketen | 116.763 | 0 | 0 | 12.490 | 12.490 (100 %) |

- Lizenzen: eigene Inhalte (`ki:`) und Wiktionary CC-BY-SA-4.0, Tatoeba CC-BY-2.0-FR. Keine `test:`-Quelle in echten
  Inhalten.
- Form der Namensnennung: Tatoeba 1.467/1.467 „Satz #<id> von <benutzer>“ mit der ID der Quelle, Wiktionary 5.357/5.357
  mit Wiktionary-Nennung.
- Eigene Inhalte tragen keine eigene Namensnennung. Sie werden als CC BY-SA 4.0 gesammelt genannt (`namensnennung.ts`,
  `istEigeneQuelle`).
- Damit 100 % je Eintrag; der Prüfer meldet ebenfalls „100 %“.

### 2.3 Dubletten

- Prüfer `dubletten` 0/0/0, je Kurs über alle Dateien:
  - exakt (Sätze nach Vergleichsform, Lemmata nach Form und Wortart) 0;
  - nahe Paare mit Jaccard ≥ 0,9 ebenfalls 0, also keine Warnung.
- Eigene Gegenzählung (NFC, casefold, Wortfolge; bei ar ohne Harakat, also strenger):
  - de 16.544 Sätze (11.399 in A1–B1 mit Vorkurs), 0 doppelt; 4.075 Lemmata, 0 doppelt;
  - tr 11.488 Sätze, 0; 2.758 Lemmata, 0;
  - ar 11.413 Sätze, 0; 2.800 Lemmata, 0.
- **Quote 0,00 % < 1 %.**

### 2.4 Gegenprüfungen

| Prüfung | Abdeckung A1–B1 (126 Einheiten) | Beleg | Ergebnis |
|---|---|---|---|
| Lektorat (Opus) | 126/126 | Commits „Lern-App L3-07: Lektorat <einheit>“ | Mängel direkt behoben (Workflow-Auftrag), Rest als menschlich_klaeren an die Schlussprüfung |
| Übersetzung | 126/126 | Commits „Übersetzung <einheit>“ | 100 % (2.2) |
| Rückübersetzung | 119/126 mit eigenem Commit. `ar.a2.e05`–`e11` entstanden im Plan-Modus; die Schlussprüfung `8ce35c2f` hat ihre 115 Korrekturen eingespielt (14 Übersetzungsdateien ar-aus-de/-tr e05–e11) | PRÜFPUNKT 24.10. 17:15, `git show --stat 8ce35c2f` | erledigt |
| Schlussprüfung je Stufe und Sprache | 9/9 | de a1 `87613b1e`, tr a1 `2a770dab`, ar a1 `9ca48e68`, de a2 `98ca45a4` + `52c71201`, tr a2 `da8c5eb6` (`97fefbf2`), ar a2 `8ce35c2f`, de b1 `dcac498f`, tr b1 `a315ff02`, ar b1 `1736ddb6` | je 0 blockierend; offen nur `de.b1.e16` (12 × politik) und `tr.b1.e16` (3 × R-06); die 2 R-06/R-08-Fehlalarme aus tr a2 sind seit dem Prüfer-Fix (`2362830f`, Gegenprüfung 2 frei, `645e76cd`) weg |
| Freigaben nach L3-E15 | A1 `3bd40c46`, A2 `304ec310`, B1 de `4350ee98`, B1 tr `0745164d`, B1 ar `3d2797d7` | Status in den Dateien (M1) | 130 `automatisch_geprueft`, 0 freigegebene Einheit mit menschlich_klaeren |

**Übergabe der Restbefunde an Menschen**

| Befund | Wo dokumentiert | in MENSCHEN.md / OF-Liste? |
|---|---|---|
| `de.b1.e16` Staatskunde (12 × politik) | Commit `dcac498f`, PRÜFPUNKT 25.10. 12:03 | Frage OF-10 steht in `INHALTSLEITFADEN.md` §7 (LM-09, Vorstand); dass `de.b1.e16` daran hängt, steht nicht in MENSCHEN.md |
| `tr.b1.e16` R-06 „Pilz“ (3 × menschlich_klaeren, Fehltreffer durch gleiche unvokalisierte Schreibung) | Commit `a315ff02`, PRÜFPUNKT 25.10. 17:35 | **nein** |
| Redaktionsfragen B1 tr: Schreibweise „iş birliği“, Namen mit Längezeichen im tr-Kurs (Samīr/Rīm), einheitliche Vokalisierung in tr-aus-ar | PRÜFPUNKT 25.10. 17:35 | **nein** |
| Redaktionsfragen B1 ar: Wortzahl der ar-Schreibaufgaben (Faktor ≈ 0,75), Figuren-Kanon (Yāsmīn neu, Nizār erst Mechaniker, dann Lehrer), tamma + Maṣdar, OF-10 in e10/e11, Ausnahme im Vokalisierungsprüfer für li + Artikel vor Sonnenbuchstaben, Kinderregel e14 | PRÜFPUNKT 25.10. 22:40 | **nein** (OF-10 als Frage ja) |
| Niedrige Lektoratspunkte der Rahmenpläne | `_lernapp/lehrplan/LEKTORAT-OFFEN.md` | ja, an LM-02 übergeben |

**Belege (kurz):** P1/P2 (`pruefen.log`, `pruefen.json`), M2 (`zaehlen.out`), L3, Commit-Liste
(`git log 9a8ca1f8 | grep "L3-07"`: 647 Commits Entwurf, Lektorat, Übersetzung, Rückübersetzung), die neun
Schlussprüfungs-Commits.

**Lücken**
1. Elf Restfragen aus den Schlussprüfungen B1 tr und B1 ar stehen nur im PRÜFPUNKT, also im Arbeitsstand des
   Orchestrators, nicht in MENSCHEN.md oder der OF-Liste. Dazu gehört der R-06-Fall `tr.b1.e16`, der eine Freigabe
   blockiert. Formal sind sie damit nicht an Menschen übergeben.
2. MENSCHEN.md nennt nicht, dass `de.b1.e16` auf OF-10 wartet und `tr.b1.e16` auf die R-06-Entscheidung. Ohne diesen
   Verweis gehen beide Einheiten bei der Antwort leicht verloren.
3. Nebenbefund: `lernapp:pruefen` bildet die Schemaprüfung des Paketbaus nicht ab. 25 Inhaltsaufgaben bestehen den Prüfer
   (abgleich 0/0/0) und werden doch beim Paketbau verworfen (siehe Z-L01, 1.4); im Prüferbericht erscheint das nicht.
4. Hinweis: Die Rückübersetzung von `ar.a2.e05`–`e11` gibt es nur als im Plan-Modus erstellten Plan. Ihre Korrekturen sind
   eingespielt, eine unabhängige Nachprüfung danach fehlt.

**Nacharbeit**
1. MENSCHEN.md nachtragen (Orchestrator; nur Umschrift, keine arabische Schrift):
   - unter LM-02 die Redaktionsfragen B1 tr/ar aus der Tabelle oben;
   - unter LM-09 „`de.b1.e16` bleibt Entwurf bis OF-10“;
   - unter LM-03 bzw. LM-02 „`tr.b1.e16`: R-06-Treffer am Lemma `mantar` (Pilz) in tr-aus-ar als Fehltreffer bestätigen“.
   Alternativ in `LEKTORAT-OFFEN.md` mit Verweis aus MENSCHEN.md.
2. Die Entscheidungen selbst: nur Mensch, LM-09 (OF-10, Vorstand) und LM-02/LM-03 (Redaktion bzw. zwei Personen mit
   `religioese_pruefung` für R-06). Danach Freigabe der beiden Einheiten nach L3-E15 durch den Orchestrator.
3. Technik (Opus): Im Prüfer eine Paketbau-Probe ergänzen. Jede Aufgabe, die `PaketBauer.aufgabe` (`paket/bauen.ts:306–322`)
   verwerfen würde, wird ein Befund: Warnung, für Inhaltsaufgaben besser blockierend. Ausgenommen sind Höraufgaben ohne
   Clip. Danach die 25 Aufgaben berichtigen (siehe Z-L01, Nacharbeit 3).
4. Optional: die Rückübersetzung `ar.a2.e05`–`e11` als Stichprobe nachholen (Haiku, je Einheit 30 Einträge) und die
   Abweichungen im Protokoll vermerken.

---

## 3. Zusammenfassung

| Z | Status | Beleg kurz |
|---|---|---|
| Z-L01 | erfüllt (Umfang A1–B1 nach L3-E16) | **Je Zielsprache A1–B1:** <br>• de 42/42 Einheiten, 336/336 Stationen, 2.800/2.800 Lemmata, 11.333/11.200 Sätze <br>• tr 42/42, 336/336, 2.758 (98,5 %), 11.488 <br>• ar 42/42, 336/336, 2.800, 11.363 <br>**Freigegeben:** de/tr 41 Einheiten (97,6 %), ar 42; jede Menge ≥ 95 %. <br>**Übersetzungen:** 100 % der Zielsätze und Lemmata in allen 6 Richtungen. <br>**Weitere Mengen:** <br>• Vorkurse 8/8/6/2/2 (+1 de für tr) <br>• Einstufungsbank 3.467–3.821 Kandidaten je Zielsprache, live wirksam 336–367 je Richtung <br>• Tipps 242–263 je Richtung <br>**Live:** 6 Kurse mit A1/A2/B1. 254/254 Pakete 200, Hash = SHA-256, `hinweis: true`. Keine B2-, Test- oder e16-Einheit. <br>**Lücken:** Repo-Mengenbericht veraltet und ohne Stufenauswahl; 25 Aufgaben verwirft der Paketbau; A1-Einstufung nur aus e12 |
| Z-L14 | teilweise | `lernapp:pruefen`: 0 blockierend (435 Dateien, 137.493 Einträge). Die 15 menschlich_klaeren liegen nur in `de.b1.e16` und `tr.b1.e16`, beide Entwurf. `quelle`, `lizenz` und Namensnennung je Eintrag 100 %, Quelle und live. Dubletten 0,00 %. Gegenprüfungen: Lektorat 126/126, Rückübersetzung 126/126, davon 7 über die Schlussprüfung, Schlussprüfungen 9/9 mit 0 blockierend. Offen: elf Restfragen B1 tr/ar und der R-06-Fall nur im PRÜFPUNKT statt in MENSCHEN.md/OF-Liste; der Prüfer sieht Verwerfungen des Paketbaus nicht |
