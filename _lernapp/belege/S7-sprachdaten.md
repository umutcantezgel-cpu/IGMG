# Beleg S7 – Offene Sprachdaten: Tatoeba, kaikki/Wiktionary, Häufigkeitslisten

- **Etappe:** L0, Paket L0-08 (Spike S7). Es gibt keinen Code und keine Daten im Repository und keinen Commit. Geschrieben wurde nur
  diese Datei.
- **Stand:** 16.10.2026
- **Bezug:**
  - ADR 0025 Nr. 1–2 (gepinnte Datensätze, SHA-Prüfung)
  - ADR 0045 Nr. 3, 4, 6, 7, 10 (Ablage, Tatoeba, kaikki, Häufigkeit, Ausschlüsse)
  - ADR 0039 (Quelle, Lizenz und Namensnennung je Eintrag im Paket)
  - ADR 0040 und KERN §3 (Wächter: Koran- und Hadith-N-Gramm, Formel-Lexikon)
  - KERN §1 (Lizenzen) und §2.2 Nr. 6 (keine Koran-Bedeutungen durch die KI)
  - PLAN §5.1 (≈ 15 MB komprimierte Auszüge), §6.1 (Ablage), §12, §15 (Plattenbudget)
  - Lizenzbericht `berichte/lizenzen-l0-sprachdaten.md` Nr. 1, 3, 5–7, 12, 15
  - MENSCHEN LM-09 (Inhaltsleitfaden), LM-12 (Namensnennung)
  - ABNAHME Z-L14, Z-L17, Z-L18
- **Arbeitsort:** Scratchpad `SP = /tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/l0/S7/`
  - `skripte/`: eigene Skripte, ohne arabische Schrift; arabische Muster stehen als Codepunkte darin
  - `auszug/`: Ergebnisse
  - `dl/meta/`: Kopfzeilen, Lizenzdateien, Hashes
  - `tmp/`: Zählungen
- **Arbeitsweise:** Python immer mit `-I`. Downloads laufen im Strom; Vollabzüge werden nicht gespeichert.
- **Schrift:** Arabische Beispiele stehen hier nur in Umschrift oder als Codepunkt.

## 1. Ziel

1. **Tatoeba** (Wochenexport vom 10.10.2026) für deu, tur und ara im Strom auf die direkten Paare de↔tr, de↔ar und tr↔ar
   filtern.
   - Lizenzspalte: nur CC BY 2.0 FR oder CC0 1.0, abgeleitet aus der CC0-Liste; die Exporte haben keine Lizenzspalte.
   - Dazu Benutzername, Bewertungen und Tags als Filterbelege.
   - Zählen: Sätze je Paar, Inhalt, Religion-Wächter.
2. **kaikki.org** (Wiktextract) für Deutsch, Türkisch und Arabisch im Strom auf die benötigten Felder kürzen.
   - Felder: Lemma, Wortart, Flexionsformen, Glossen de/tr/en/ar, Genus, Plural.
   - Ausgaben: en.wiktionary (je Sprache), de.wiktionary und tr.wiktionary. Eine ar.wiktionary-Extraktion gibt es nicht.
3. **Häufigkeitslisten** laut Lizenzbericht: wordfreq 3.1.1 (de, tr, ar), CAMeL Arabic Frequency Lists v1.0 (MSA) und
   FrequencyWords 2018 als Gegenprobe.
4. **Messen:**
   - SHA-256 und Größen der Ausgangs- und Auszugsdateien
   - Lemmata je Sprache
   - Abdeckung der 1.000 und 5.000 häufigsten Wörter durch kaikki, einschließlich der Glossen in den Ausgangssprachen der
     sechs Richtungen
5. **Vorschläge:** Ablage und Größe im Repository (ADR 0025/0045) und Entwürfe der `QUELLE.md`-Texte.

## 2. Vorgehen (Befehle)

Die Ausgangsdateien laufen im Strom durch `hashtee.py`. Es reicht die Bytes weiter und schreibt am Ende SHA-256 und Bytezahl
(`dl/meta/*-upstream.sha256`). Die Bytezahl wurde jeweils mit `content-length` verglichen. Rohdateien liegen nie auf der Platte.
Ausnahmen:
- das wordfreq-Wheel (57 MB): SHA-256 gegen den PyPI-Digest geprüft
- das CAMeL-ZIP (69 MB): ZIP braucht wahlfreien Zugriff

Beide wurden nach dem Auslesen sofort gelöscht.

```bash
SP=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/l0/S7
# 2.1 Tatoeba (≈ 30 s): Links → IDs; Sätze, CC0, Tags, Bewertungen nur für diese IDs; Englisch-Links nur zum Zählen
bash $SP/skripte/tatoeba_laden.sh            # curl … | hashtee.py | bzcat | python3 -I tatoeba_filter.py {saetze|ids|bewert}
python3 -I $SP/skripte/tatoeba_auswerten.py $SP          # Lizenzspalte, gültige Paare, Zählungen → tmp/tatoeba/stat.json
python3 -I $SP/skripte/tatoeba_api_stichprobe.py $SP 20 20261016   # 3 × 20 IDs gegen https://api.tatoeba.org/v1/sentences/{id}
python3 -I $SP/skripte/ngramm_pruefung.py /home/user/IGMG/web/daten $SP/auszug/tatoeba/saetze_ara.tsv 4   # Wächter-Vorprobe
python3 -I $SP/skripte/tatoeba_standardfilter.py $SP     # Paare nach Standardfilter (nur Zählung)
python3 -I $SP/skripte/vokalisierung.py $SP              # Harakat-Anteil ar (Tatoeba, kaikki)
bash $SP/skripte/tatoeba_laden.sh && python3 -I …/tatoeba_auswerten.py $SP   # 2. Lauf: Ausgaben byte-gleich (Reproduzierbarkeit)

# 2.2 kaikki (≈ 2,5 min für alle fünf; 4 Ströme parallel, dann tr): en-Dateien mit Transportkompression
bash $SP/skripte/kaikki_laden.sh
#   curl --compressed https://kaikki.org/dictionary/{German,Turkish,Arabic}/kaikki.org-dictionary-<L>.jsonl | hashtee.py \
#     | python3 -I kaikki_reduzieren.py en <l> - stat.json | gzip -6 > auszug/kaikki/en-<lll>.jsonl.gz
#   curl https://kaikki.org/dictionary/downloads/{de,tr}/{de,tr}-extract.jsonl.gz | hashtee.py | gzip -dc \
#     | python3 -I kaikki_reduzieren.py {de|tr} de,tr,ar {tr,ar|de,ar} stat.json | gzip -6 > auszug/kaikki/{de,tr}-wikt.jsonl.gz

# 2.3 Häufigkeit
curl -o dl/wordfreq/wordfreq-3.1.1-py3-none-any.whl https://files.pythonhosted.org/…/wordfreq-3.1.1-py3-none-any.whl
python3 -m venv $SP/venv && $SP/venv/bin/pip install msgpack==1.1.0     # nur zum Lesen der cBpack-Dateien
$SP/venv/bin/python -I skripte/wordfreq_liste.py <wheel> wordfreq/data/large_{de,ar}.msgpack.gz|small_tr.msgpack.gz 1000000
curl -L -o dl/camel/MSA_freq_lists.tsv.zip https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists/releases/download/v1.0/MSA_freq_lists.tsv.zip
curl https://raw.githubusercontent.com/hermitdave/FrequencyWords/525f9b560de45753a5ea01069454e72e9aa541c6/content/2018/{de,tr,ar}/{de,tr,ar}_50k.txt
git ls-remote https://github.com/hermitdave/FrequencyWords HEAD; git ls-remote …/Camel_Arabic_Frequency_Lists refs/tags/v1.0

# 2.4 Abdeckung, Bedarf und Kernauszug
python3 -I $SP/skripte/abdeckung.py $SP                  # → tmp/abdeckung.json, tmp/bedarf_lemmata.json
python3 -I $SP/skripte/bedarf_auszug.py $SP {10000,20000,30000} tmp/bedarf   # volle Tabellen (nur gemessen, gelöscht)
python3 -I $SP/skripte/kern_auszug.py $SP {10000,20000,30000} tmp/kern       # Stammformen; top20000 → auszug/kaikki-kern/
```

**Kürzungsregeln in `kaikki_reduzieren.py`:**
- **Behalten:** `w` (Seitentitel), `l`, `q` (Ausgabe), `pos`, `kanon` (kanonische, bei ar vokalisierte Form), `rom`, `g`
  (m/f/n/c), `pl`, `aux` (Hilfsverb), `formen` (Form + Merkmale; Merkmal `kopfzeile` = Stammform aus der Kopfzeile, en),
  `gl` (Glosse + Register), `fo` (Grundform bei reinen Formeinträgen), `ue` (Übersetzungen tr/ar bzw. de/ar), `mk` (Register
  und Themen).
- **Verworfen:**
  - Inhalte: alle Beispiele (also auch alle mit `ref`), Töne, Etymologie, Kategorien, Links, Synonyme und Vorlagen
  - Tabellenreste: Hilfsverb-Zeilen (in `aux` überführt), Formen mit mitgeschriebenem Artikel (`includes-article`),
    Mehrwortformen mit Hilfsverb oder „zu“ (trennbare Verben und „am …sten“ bleiben), Tabellenetiketten („Sg. 2. Pers.“),
    Bruchstücke wie „-s“ und Formen ohne Merkmal (de/tr-Ausgabe)
  - leere Einträge ohne Glosse, Form, Verweis und Übersetzung; ar: 41.445 Platzhalter mit `no-gloss`
- Ein erster Lauf zeigte, dass „haben“ und „sein“ als Form fast jedes deutschen Verbs eingetragen sind. Die Abdeckung war
  dadurch geschönt (z. B. Glosse ar für de top-1000: 42,7 statt 39,8 %). Die Regeln oben beheben das. Alle Zahlen unten
  stammen aus dem vierten, bereinigten Lauf; die Upstream-SHA-256 waren in allen vier Läufen gleich.

## 3. Messwerte und Ergebnisse

### 3.1 Ausgangsdateien (im Strom gehasht)

| Quelle | Datei | Stand | Bytes | SHA-256 |
|---|---|---|---|---|
| Tatoeba | `per_language/deu/deu_sentences_detailed.tsv.bz2` | Export 10.10.2026 06:29 UTC | 17.664.205 | `8f0dbeff78db97bbcd97eb1fd9e127431972a278cf3fb0335e8bdcc1335e8d19` |
| Tatoeba | `per_language/tur/tur_sentences_detailed.tsv.bz2` | dto. | 13.449.435 | `5a00066f3eb1be4f664249e7c4d244d03952ba3a4242e85ea54faed6727b776a` |
| Tatoeba | `per_language/ara/ara_sentences_detailed.tsv.bz2` | dto. | 1.210.165 | `d7f20eb866273737a3339d541526e030c5a4af36ca074e6caa8f6fe25d6b916c` |
| Tatoeba | `per_language/deu/deu-tur_links.tsv.bz2` | 10.10.2026 06:40 | 149.639 | `bf46e505500ab5e2b77de02a1999342da29f0d31e9698fdf3f0a3c35f5ddc3f6` |
| Tatoeba | `per_language/deu/deu-ara_links.tsv.bz2` | dto. | 18.845 | `4da77af5d7c11cc943cb89bfb7d7ac92651241edbe43c9934489ad75e2d8e2a7` |
| Tatoeba | `per_language/tur/tur-ara_links.tsv.bz2` | dto. | 15.813 | `eb56f4b77148a7cbcfdf149b18f751008d8ce3dc9456d59cf096acad08414092` |
| Tatoeba | `per_language/deu/deu_sentences_CC0.tsv.bz2` | 10.10.2026 06:30 | 1.852 | `df8c16713e5715a0e1343bc1195004463e7facee08863d3cd709cbf123a74587` |
| Tatoeba | `per_language/ara/ara_sentences_CC0.tsv.bz2` | dto. | 151 | `8537d5cce4e878b588d9124f9bf26582c98002681accbcaf69c3927ed43c8364` |
| Tatoeba | `per_language/tur/tur_sentences_CC0.tsv.bz2` | – | HTTP 404 (keine CC0-Sätze) | – |
| Tatoeba | `per_language/{deu,tur,ara}/<l>_tags.tsv.bz2` | 10.10.2026 06:41 | 277.598 / 51.166 / 4.404 | `425c2cfe…0d92` / `f4df6212…bec3b96` / `17b186a6…cff0e` |
| Tatoeba | `users_sentences.csv` (Bewertungen, unkomprimiert) | 10.10.2026 06:10 | 98.729.963 | `bb463864bc96270eab6f874ff5c1fc36f5e730c19fb44f53674f2a46082c674f` |
| Tatoeba | `per_language/<l>/<l>-eng_links.tsv.bz2` (nur Zählung) | 10.10.2026 06:40 | 3.545.252 / 4.224.544 / 299.125 | `fcfabee5…6ddbc` / `02e8e9a6…e6` / `1b9f9187…d7f5` |
| kaikki (en) | `dictionary/German/kaikki.org-dictionary-German.jsonl` | Dump enwiktionary 02.09.2026, extrahiert 03.10.2026, wiktextract `1a05e46`, wikitextprocessor `e3d6d4e` | 1.085.014.820 | `d7ae58be5479ebf607bb9f714e74d796f4df3e8b558478d8e9c7710c55510394` |
| kaikki (en) | `dictionary/Turkish/kaikki.org-dictionary-Turkish.jsonl` | dto. | 437.664.571 | `19fb26cafe451d8fc4dfb937e6f255d75389c33d1a7e88e6d682ab913938546a` |
| kaikki (en) | `dictionary/Arabic/kaikki.org-dictionary-Arabic.jsonl` | dto. | 521.119.623 | `19985dbf8b729c2ac8827640b55ab57337681292e134f9527509a0ee88c5a1ac` |
| kaikki (de) | `dictionary/downloads/de/de-extract.jsonl.gz` | Dump `dewiktionary-20260901`, extrahiert ab 01.10.2026, Datei 03.10.2026 | 308.579.949 | `2e66f18a093e94b29b04733d0222625695a3d5ed199e700059193895490dfb19` |
| kaikki (tr) | `dictionary/downloads/tr/tr-extract.jsonl.gz` | Dump `trwiktionary-20260901`, extrahiert ab 01.10.2026, Datei 03.10.2026 | 44.063.619 | `c6945c5fb62c40508428a0e218a125f3fb055fd90c25d95e930248dcfe013aa2` |
| wordfreq | `wordfreq-3.1.1-py3-none-any.whl` (PyPI, 21.11.2023) | Daten eingefroren (Stand ≈ 2021) | 56.834.549 | `4b1c6ecffc6198be3396d5cf871c4423ca71c907c231348d352dd54d62b97473` (= PyPI-Digest) |
| CAMeL | `MSA_freq_lists.tsv.zip` (Release v1.0, Tag-Commit `f5341fbb`, Datei 26.06.2024) | 11.376.241 Typen, 9.927.804.375 Token (Summe der Spalte) | 69.064.867 | `99a6792501af8f1a8ed5209bfada961ae4fc076823e62b16883ef2e4c39b39a4` (darin `MSA_freq_lists.tsv` `9ccd10aa66a514fd4b433c7996cba165420dd685d71bfbd6d96315a738ddff16`) |
| FrequencyWords | `content/2018/{de,tr,ar}/<l>_50k.txt` @ `525f9b560de45753a5ea01069454e72e9aa541c6` | OpenSubtitles 2018 | 662.497 / 711.935 / 805.779 | siehe §3.7 (unverändert übernommen) |

Bei den en-Dateien von kaikki lief die Übertragung mit `Content-Encoding: gzip` (98 / 35 / 51 MB). Gehasht ist der
entpackte Strom, also die Datei selbst. Die Bytezahl entspricht genau `content-length`.

### 3.2 Tatoeba – Sätze je Paar

| Paar | Links (einzig) | gültig (beide Sätze im Export) | fehlende Sätze | Sätze Seite A / B | nach Standardfilter (§4 E3) |
|---|---|---|---|---|---|
| de↔tr | 22.326 | **22.316** | deu 3, tur 7 | 20.822 / 20.736 | **20.810 (93,3 %)** |
| de↔ar | 2.974 | **2.974** | 0 | 2.753 / 2.773 | **2.759 (92,8 %)** |
| tr↔ar | 2.408 | **2.408** | 0 | 2.247 / 2.286 | **2.210 (91,8 %)** |

| Sprache | Sätze in ≥ 1 Paar | Lizenz CC BY 2.0 FR / CC0 | Mitwirkende | ohne Benutzername (`\N`) | Anteil Top-5-Mitwirkende | mit negativer Bewertung | Länge 1–5 / 6–8 / 9–12 / 13–20 / > 20 Wörter |
|---|---|---|---|---|---|---|---|
| deu | 23.106 | 23.106 / 0 | 660 | 25 | 44,0 % | 14 | 11.752 / 7.741 / 2.629 / 782 / 202 |
| tur | 22.586 | 22.586 / 0 | 423 | 51 | 63,5 % | 22 | 17.051 / 4.277 / 916 / 253 / 89 |
| ara | 4.649 | 4.649 / 0 | 243 | 76 | 33,8 % | 1 | 3.478 / 876 / 228 / 52 / 15 |

- **CC0:** Von den CC0-Sätzen (deu 46, ara 2, tur keine Datei) liegt **keiner** in einem Paar. Alle 50.341 Paarsätze stehen
  unter CC BY 2.0 FR.
- **API-Stichprobe** (3 × 20 IDs, Seed 20261016): 60/60 mit `license` = „CC BY 2.0 FR“ wie abgeleitet, Text und Besitzer
  gleich, `is_unapproved` = false. Das bestätigt die Ableitung der Lizenzspalte und den Export-Filter (`correctness > -1`,
  Lizenz nicht leer).
- **Indirekte Paare über Englisch** (nur gezählt, nicht gespeichert):
  - de↔tr +319.457 (neue Sätze: deu 271.567, tur 233.734)
  - de↔ar +24.962
  - tr↔ar +27.419
  - Diese Paare sind Übersetzungen von Übersetzungen, die Qualität ist unbekannt (§4 E3).
- **Eignung nach Länge:** 84,6 % der de↔tr-Paare haben auf der deutschen Seite ≤ 8 Wörter. Tatoeba deckt damit vor allem
  A1–B1 ab; B2–C1 tragen KI-Texte.

### 3.3 Tatoeba – Qualität, Inhalt, Religion

**Inhaltsindikator (LM-09):**
- Stichwortlisten de/tr mit Wortanfang; ar als Token nach Abtrennen der Präfixe, Muster als Codepunkte. Es ist nur ein
  Indikator mit Fehlalarmen.
- Gezählt sind Paare mit Treffer auf einer der beiden Seiten.

| Paar | Religion | Alkohol | Sexualität | Gewalt/Waffen | Drogen/Rauchen | Schwein | Glücksspiel | ohne Religion gesamt |
|---|---|---|---|---|---|---|---|---|
| de↔tr | 215 | 104 | 95 | 82 | 59 | 10 | 0 | 347 |
| de↔ar | 62 | 18 | 1 | 10 | 14 | 3 | 3 | 48 |
| tr↔ar | 97 | 21 | 2 | 11 | 2 | 1 | 0 | 37 |

**Wächter-Vorprobe (KERN §3 b/c):** Die Prüfung lief gegen `web/daten/tanzil/quran-uthmani.xml` und
`web/daten/hadith/ara-bukhari.json`.
- Normalisierung:
  - entfernt: Harakat U+064B–U+065F, U+0670, Tatweel, Koranzeichen U+0610–U+061A und U+06D6–U+06ED
  - vereinheitlicht: U+0622/0623/0625/0671 → U+0627, U+0649 → U+064A, U+0629 → U+0647

| N-Gramm | Koran-N-Gramme | Hadith-N-Gramme | ar-Sätze mit Koran-Treffer | mit Hadith-Treffer | vereinigt | betroffene Paare de↔ar / tr↔ar |
|---|---|---|---|---|---|---|
| 4 (Regel) | 52.855 | 279.748 | 30 | 19 | **38** | **16 / 36** |
| 3 (nur Info) | 52.982 | 232.450 | 56 | 84 | – | – |

- Von den 38 Treffern tragen nur 2 einen passenden Tag („Quran“, „Islam“). Tags taugen also nicht als Filter; der Wächter ist
  nötig.
- Tags in deu: „religious“ (8). Wartungs-Tags (`@change`, `@needs native check`, `@change punctuation`, `@please adopt`)
  betreffen 28 / 28 / 14 Paare.

**Vokalisierung Arabisch** (Harakat je Buchstabe):

| Bestand | ohne Harakat | teilweise (< 0,5) | ≥ 0,5 | ≥ 0,8 |
|---|---|---|---|---|
| Tatoeba ara (4.649 Sätze) | 3.756 (80,8 %) | 868 (18,7 %) | 25 | 11 (0,2 %) |

kaikki en/ar: 27.016 von 27.258 Lemma-Einträgen (99,1 %) haben eine kanonische vokalisierte Form (`kanon`) und 26.681 eine
Umschrift. Das Maß „≥ 0,8 Harakat je Buchstabe“ erreichen 40,5 %; es unterschätzt, weil Langvokale keine Harakat tragen.

### 3.4 kaikki – Einträge und Lemmata je Sprache (bereinigter Auszug)

| Sprache | Ausgabe | Einträge im Auszug | Lemma-Einträge mit Glosse | verschiedene Lemmata¹ | Formeinträge (`fo`) | Flexionsformen | Lemmata mit Genus | mit Plural | mit Übersetzung tr / ar / de |
|---|---|---|---|---|---|---|---|---|---|
| de | en.wiktionary | 371.254 | 94.346 | 89.096 | 276.895 | 1.992.954 | 62.961 | 49.571 | – |
| de | de.wiktionary | 1.010.221 | 186.907 | 179.519 | 822.824 | 5.879.840 | 138.539 | 111.478 | 16.112 / 4.826 / – |
| de | tr.wiktionary | 41.149 | 39.161 | 38.898 | 1.970 | 8.327 | 4.550 | 3.671 | – |
| tr | en.wiktionary | 45.930 | 28.074 | 25.686 | 17.825 | 3.054.018 | – | 15.030 | – |
| tr | de.wiktionary | 815 | 681 | 639 | 134 | 480 | – | 3 | – / 34 / – |
| tr | tr.wiktionary | 311.663 | 195.050 | 188.206 | 114.643 | 1.262.648 | – | 54.086 | – / 2.761 / 8.840 |
| ar | en.wiktionary | 36.690 | 27.258 | 20.223 | 9.369 | 1.577.704 | 14.841 | 6.815 | – |
| ar | de.wiktionary | 371 | 368 | 298 | 3 | 756 | 179 | 92 | 10 / – / – |
| ar | tr.wiktionary | 3.605 | 2.767 | 2.171 | 837 | 822 | 1.258 | 434 | – |

¹ normalisiert wie in §3.6 (ar ohne Harakat, daher fallen Vokalisierungsvarianten zusammen)

**Vereinigt über alle Ausgaben:** de 228.848, tr 193.447, ar 20.806 verschiedene Lemmata mit Glosse.

**Glossen je Lemma nach Sprache** (direkt; Rückrichtung über fremde Übersetzungstabellen in Klammern):

| Lemma | → en | → de | → tr | → ar |
|---|---|---|---|---|
| de | 89.096 | 179.519 (Definitionen) | 50.878 (+ 9.860 Wörter aus tr-Tabellen) | 4.781 |
| tr | 25.686 | 8.565 (+ 18.670 aus de-Tabellen) | 188.206 (Definitionen) | 2.662 |
| ar | 20.223 | 299 (+ 5.498 aus de-Tabellen) | 2.174 (+ 2.707 aus tr-Tabellen) | – |

**Verworfene Beispiele** (also 0 im Auszug):

| Ausgabe | Beispiele | davon mit `ref` |
|---|---|---|
| en/de | 29.698 | 13.016 |
| en/tr | 4.921 | 735 |
| en/ar | 7.919 | 4.464 |
| de (alle drei Sprachen) | 455.471 | 314.370 |
| tr (alle drei Sprachen) | 22.518 | 17.241 |

Gegenprobe: `zcat … | grep -c '"examples"\|"ref"\|"sounds"'` = 0 in allen Auszügen.

### 3.5 Häufigkeitslisten

| Liste | Sprache | Umfang Quelle | im Auszug | Bemerkung |
|---|---|---|---|---|
| wordfreq 3.1.1 `large_de` | de | 634.502 Wörter | Top 50.000 (Rang, Wort, Zipf) | faltet Groß/Klein und ß → ss (`casefold`) |
| wordfreq 3.1.1 `large_ar` | ar | 620.701 | Top 50.000 | Wortformen mit Klitika |
| wordfreq 3.1.1 `small_tr` | tr | 63.345 | Top 50.000 | Für tr gibt es **nur** die kleine Liste. Unter den Top 1.000 stehen Spam- und Fremdtoken (z. B. „escort“, „http“, „the“, „john“). |
| CAMeL MSA v1.0 | ar | 11.376.241 Typen | Top 50.000 (Rang, Wort, Anzahl) | absteigend sortiert geprüft; Wortformen mit Klitika, keine Lemmata |
| FrequencyWords 2018 | de, tr, ar | je 50.000 | unverändert | Gegenprobe; ar: unter den Top 5.000 stehen 402 Token aus Ziffern oder Satzzeichen |

**Lizenzbelege:**
- wordfreq: Abschnitt „License“ aus `METADATA` (CC BY-SA 4.0 für die Daten; Bedingung für SUBTLEX). Die Daten enthalten
  außerdem Statistiken aus Twitter, aber keine Inhalte.
- CAMeL: `LICENSE.txt` (CC BY-SA 4.0); Zitat laut README: Khalifa u. a. 2021.
- FrequencyWords: README „MIT License for code. CC-by-sa-4.0 for content.“

Alle drei liegen in `dl/meta/`.

### 3.6 Abdeckung der häufigsten Wörter durch kaikki

**Methode:**
- Top-N der wortartigen Token: ohne Ziffern und Satzzeichen; „ausgeschl.“ = übersprungene Nicht-Wörter bis zum N-ten Wort.
- Normalisierung auf beiden Seiten gleich:
  - de: `casefold`
  - tr: I → ı, İ → i, dann `lower`
  - ar: NFC, ohne Harakat/Tatweel/Koranzeichen, Alif-Formen → Alif, Alif maqsura → Ya
- Treffer: Token = Lemma, Flexionsform eines Lemmas oder Formeintrag (`fo`).
- „Glosse X“: Ein getroffenes Lemma hat eine Glosse in X. Quellen dafür: die Ausgabe X selbst oder eine Übersetzungstabelle
  nach X. „Rück“ zählt zusätzlich fremde Tabellen, z. B. ein deutscher Eintrag mit arabischer Übersetzung als deutsche
  Glosse des arabischen Wortes.
- Bei „de (Def.)“ und „tr (Def.)“ handelt es sich um einsprachige Definitionen, nicht um Übersetzungen.

**Deutsch und Türkisch** (Werte in %; in Klammern: inkl. Rückrichtung):

| Liste | Top | ausgeschl. | Lemma (en) | Lemma/Form (en) | Lemma/Form (alle) | Glosse en | Glosse de | Glosse tr | Glosse ar |
|---|---|---|---|---|---|---|---|---|---|
| de wordfreq | 1.000 | 26 | 72,8 | 98,3 | **99,6** | 98,4 | 99,5 (Def.) | **86,4 (89,7)** | **39,8** |
| de wordfreq | 5.000 | 44 | 66,8 | 97,4 | **98,9** | 97,4 | 98,6 (Def.) | **80,2 (83,3)** | **30,2** |
| de FrequencyWords | 1.000 | 4 | 67,9 | 98,3 | 99,5 | 98,8 | 99,3 (Def.) | 86,7 (90,7) | 38,2 |
| de FrequencyWords | 5.000 | 15 | 63,7 | 93,0 | 95,8 | 94,0 | 95,4 (Def.) | 75,3 (79,2) | 29,4 |
| tr wordfreq | 1.000 | 18 | 66,7 | 95,2 | **96,4** | 95,2 | **77,7 (89,4)** | 95,0 (Def.) | **49,8** |
| tr wordfreq | 5.000 | 34 | 47,8 | 88,5 | **91,8** | 89,2 | **65,2 (81,6)** | 90,7 (Def.) | **36,6 (36,7)** |
| tr FrequencyWords | 1.000 | 1 | 55,7 | 93,0 | 94,7 | 93,2 | 75,4 (86,7) | 93,1 (Def.) | 46,5 (46,6) |
| tr FrequencyWords | 5.000 | 5 | 37,3 | 83,9 | 86,9 | 84,7 | 65,0 (79,4) | 85,8 (Def.) | 35,7 (35,8) |

**Arabisch** (in %):
- „mit Klitika“: Abtrennung häufiger Präfixe (wa-, fa-, bi-, li-, ka-, al- und Verbindungen) und Pronomen-Suffixe als
  Heuristik, z. B. Umschrift „wa-l-kitābu“ → „kitāb“. Das ist eine Obergrenze; genau wird es mit CAMeL Tools in L3.

| Liste | Top | ausgeschl. | Lemma (en) | Lemma/Form (en) | Lemma/Form (alle) | dto. mit Klitika | Glosse en (mit Klitika) | Glosse de: direkt / inkl. Rück / mit Klitika inkl. Rück | Glosse tr: direkt / inkl. Rück / mit Klitika inkl. Rück |
|---|---|---|---|---|---|---|---|---|---|
| ar wordfreq | 1.000 | 15 | 55,1 | 90,0 | **91,7** | **99,0** | 90,0 (98,9) | 17,8 / 48,7 / **60,7** | 59,2 / 69,8 / **81,4** |
| ar wordfreq | 5.000 | 31 | 40,4 | 86,8 | **87,4** | **98,1** | 86,8 (98,1) | 10,7 / 38,8 / **50,7** | 41,9 / 52,3 / **65,7** |
| ar CAMeL-MSA | 1.000 | 0 | 53,7 | 92,0 | 93,1 | 99,3 | 92,0 (99,2) | 15,9 / 47,0 / 56,9 | 55,8 / 66,1 / 76,5 |
| ar CAMeL-MSA | 5.000 | 0 | 37,4 | 84,8 | 85,3 | 97,1 | 84,8 (97,1) | 9,2 / 35,6 / 47,0 | 37,9 / 48,6 / 61,9 |
| ar FrequencyWords | 1.000 | 87 | 49,1 | 84,1 | 86,2 | 97,7 | 84,1 (97,6) | 17,9 / 46,5 / 60,7 | 55,2 / 61,6 / 77,4 |
| ar FrequencyWords | 5.000 | 402 | 36,3 | 78,2 | 78,8 | 94,7 | 78,2 (94,6) | 10,8 / 36,0 / 49,9 | 38,6 / 46,7 / 63,4 |

**Fehlende Wörter (wordfreq Top 1.000):**
- de: nur „the“, „of“, „bzw“, „etc“
- tr: 36, vor allem Formen mit Kasus- und Possessivendungen („kendini“, „herkesin“, „olduğundan“), Fremdtoken und Spam

**Lesart für die sechs Richtungen:** Gemeint ist die Glosse in der Ausgangssprache des Lemmas der Zielsprache, mit Rückrichtung
und bei ar mit Klitika-Abtrennung.

| Richtung | Top 1.000 | Top 5.000 |
|---|---|---|
| tr-aus-de | 89 % | 82 % |
| ar-aus-de | 61 % | 51 % |
| de-aus-tr | 90 % | 83 % |
| ar-aus-tr | 81 % | 66 % |
| de-aus-ar | 40 % | 30 % |
| tr-aus-ar | 50 % | 37 % |

Englische Glossen gibt es fast immer: Top 5.000 de 97,4 %, ar 98,1 % (mit Klitika), tr 89,2 %. Sie taugen als Hilfsbedeutung für den
KI-Entwurf, nicht als Anzeige.

### 3.7 Auszüge im Scratchpad (Größe, Zeilen, SHA-256)

Ort `SP/auszug/` mit `SHA256SUMS`. Formate: UTF-8, LF, sortiert. „gz“ ist gzip -9 zum Vergleich.

| Datei | Bytes (roh) | gz | Zeilen | SHA-256 |
|---|---|---|---|---|
| `tatoeba/saetze_deu.tsv` | 2.753.815 | 701.958 | 23.107 | `2291ba95d2056ca295690ed6e106e70952722daf10c9157be9dd0f67b7debe98` |
| `tatoeba/saetze_tur.tsv` | 2.556.961 | 627.435 | 22.587 | `450f4f45e1afb4fff49a4f095844b0a7ef013c958c0d1e1ff8f8068e2a8aef4b` |
| `tatoeba/saetze_ara.tsv` | 557.651 | 132.967 | 4.650 | `ea39acdf9a853768d4e9b24c9a01cb338af165a15083c93788aa0e2b84f1f91b` |
| `tatoeba/paare_deu-tur.tsv` | 363.517 | 140.654 | 22.317 | `866aa73ea35d58c579091096498f9216656a7f27706d5e5b5a8c853b232ed1b1` |
| `tatoeba/paare_deu-ara.tsv` | 46.563 | 19.453 | 2.975 | `5c99a6724a75e6987c98801e1cb9ca183a1d7966aeebf618c883548fc5e171ea` |
| `tatoeba/paare_tur-ara.tsv` | 39.303 | 16.266 | 2.409 | `4a7080a994baa55f582189223a611f02a46e5af00e942b3e16f93e0ec62464e4` |
| `haeufigkeit/wordfreq-3.1.1_de_top50k.tsv` | 1.020.007 | 360.835 | 50.001 | `1ada77d33e79f9fec0a0ed53ed55667bf99a4c35965c8512b1c1c187c2887244` |
| `haeufigkeit/wordfreq-3.1.1_tr_top50k.tsv` | 1.020.431 | 350.965 | 50.001 | `713a3d7517d98ad184dda0e261fda914e4ec4b63a110b118be18314be7866265` |
| `haeufigkeit/wordfreq-3.1.1_ar_top50k.tsv` | 1.138.232 | 342.620 | 50.001 | `facdc2666c6203475b80c337e96e6b2462b084a6ae2f1fba5e05d920ddff7bab` |
| `haeufigkeit/camel-msa-1.0_top50k.tsv` | 1.239.702 | 458.685 | 50.001 | `8ce2eb7ccd304ee9c19f606c6fc07a156bcc023babbbb50cccaad1d9210b8a0a` |
| `haeufigkeit/frequencywords-2018_de_50k.txt` | 662.497 | 280.114 | 50.000 | `d9e50546fd7e8b6fe6542a2b33c51d1331092b2a3916ec09f80d97856068705b` |
| `haeufigkeit/frequencywords-2018_tr_50k.txt` | 711.935 | 285.077 | 50.000 | `480192844e7fdfe9591bbf0b9cfbb96ed5751cfbba7024fd45d8cb7508e07d5c` |
| `haeufigkeit/frequencywords-2018_ar_50k.txt` | 805.779 | 279.754 | 50.000 | `bbe98b4b92902b392bdefa2e555a108fdb42a5dd79d261674be5ab666229e19f` |
| `kaikki-kern/kaikki-kern-de-top20000.jsonl` | 11.719.653 | 2.645.721 | 42.136 | `c09ff3d4bfe7f0e5a27febe48f83cbd36b3fc2310b256be0ecbacecdbb352009` |
| `kaikki-kern/kaikki-kern-tr-top20000.jsonl` | 4.493.645 | 1.138.267 | 22.361 | `3de932e2da595f4d411572408c0fd37d71ce553064a05a0cd6942d162d7da6d5` |
| `kaikki-kern/kaikki-kern-ar-top20000.jsonl` | 3.866.099 | 818.409 | 15.630 | `edf04a43a32fd5256bfad04a707758cdf4d41dd2163999616f795f669ac2ea8a` |
| `kaikki/en-deu.jsonl.gz` (voll gekürzt) | 188.497.997 | 16.212.955 | 371.254 | `5edbffb3d614f8406174ef58e9700091f5614eda742db7419ce82a63fce62f3e` (gz) |
| `kaikki/en-tur.jsonl.gz` | 189.225.915 | 16.397.311 | 45.930 | `d38b9946e7ad2f1a0116f374f8e5f1d5931025e9bf8a5b155dfe320ab4d6b923` (gz) |
| `kaikki/en-ara.jsonl.gz` | 132.998.467 | 10.448.516 | 36.690 | `c99580102492d8f3a7bdd62b1335401e24b1acfe22886fab8a4b8fb838d15ccb` (gz) |
| `kaikki/de-wikt.jsonl.gz` (de, tr, ar) | 800.009.265 | 61.719.723 | 1.011.407 | `2f1e7f2b2984fc65f94b31ebc45a025b326cdbd781f09ac41706e6bb58a8e1b2` (gz) |
| `kaikki/tr-wikt.jsonl.gz` (tr, de, ar) | 109.692.237 | 11.679.996 | 356.417 | `fb4f940a32fa36f8fec443240e069d7f8498b8cd1cfcb802d141f99f0fc60fbc` (gz) |

**Spalten `tatoeba/saetze_<l>.tsv`:** `id, sprache, text, benutzer, lizenz, angelegt, geaendert, bew_pos, bew_neg, tags`.
`bew_*` zählt die Bewertungen ohne die Namen der Bewertenden. `paare_<a>-<b>.tsv` enthält `<a>_id, <b>_id`.

**Größenvarianten des kaikki-Auszugs** für das Repository:
- Bedarf = alle Lemmata, die die Top-N-Wörter von wordfreq (ar zusätzlich CAMeL) erreichen.
- Dazu kommen Einträge, deren Übersetzungstabelle ein Bedarfswort enthält: de 1.586, tr 1.766, ar 2 bei N = 20.000.

| N | Lemmata de / tr / ar | volle Tabellen roh (gz) | **Kern: Stammformen** roh (gz) |
|---|---|---|---|
| 10.000 | 10.702 / 7.071 / 6.816 | 159,0 MB (ar allein 4,0 MB gz) | 14,1 MB (3,3 MB) |
| 20.000 | 19.286 / 12.638 / 10.566 | 228,2 MB (20,7 MB) | **20,1 MB (4,6 MB)** |
| 30.000 | 27.162 / 18.109 / 13.785 | 278,0 MB (–) | 24,5 MB (5,6 MB) |

**Kernauszug top-20.000:**

| Sprache | Einträge | en / de / tr | mit Stammformen | mit Übersetzungen | Thema Religion¹ | anstößiges Register² |
|---|---|---|---|---|---|---|
| de | 42.136 | 16.028 / 21.415 / 4.693 | 14.520 | 8.034 | 301 | 417 |
| tr | 22.361 | 8.205 / 447 / 13.709 | 4.790 | 5.045 | 400 | 96 |
| ar | 15.630 | 13.322 / 292 / 2.016 | 9.813 | 9 | 372 | 36 |

¹ `thema:` religion/Islam/Christianity/… ² vulgar, offensive, derogatory, slur, pejorative, ethnic, sexual

### 3.8 Laufzeit und Platte

**Laufzeit:**
- Tatoeba: ≈ 30 s
- kaikki: 5 Ströme in ≈ 2,5 min (≈ 2,4 GB JSON entpackt, ≈ 0,5 GB übertragen)
- Abdeckung: ≈ 40 s
- Kernauszug: ≈ 1 min je N

**Platte:**
- Spitze im Scratchpad ≈ 0,95 GB, darin die vollen Bedarfsvarianten (0,67 GB) zum Messen
- freier Platz nie unter 7,6 GB
- nach dem Aufräumen belegt S7 146 MB (§8)

## 4. Entscheidungsvorschlag für die offenen Punkte der ADRs

| Nr. | ADR / Ort | offener Punkt | Vorschlag (Standard, bis Menschen anders entscheiden) |
|---|---|---|---|
| S7-E1 | ADR 0025 Nr. 1–2, ADR 0045 Nr. 3 | Was heißt „SHA-256 der Rohdatei“, wenn die Rohdatei nur im Strom gefiltert wird? | `QUELLE.md` nennt erstens die **Ausgangsdatei** mit Adresse, Bytes, Last-Modified/ETag und SHA-256 des Stroms (Reproduktion). Zweitens das **Filterskript** mit Pfad und SHA-256; die Skripte kommen in L3 nach `_lernapp/werkzeuge/sprachdaten/`. Drittens **SHA-256 jeder Auszugsdatei**. Prüfer und Import prüfen vor jedem Lauf die Auszugs-SHA und brechen bei Abweichung ab (ADR 0025 Nr. 2). Reproduzierbar belegt: Tatoeba zweimal byte-gleich, kaikki-Upstream-SHA in vier Läufen gleich. |
| S7-E2 | ADR 0045 Nr. 3, PLAN §5.1/§6.1 | Ablage und Größe | Siehe §5: `web/daten/{tatoeba,kaikki,haeufigkeit}/`, zusammen **≈ 33 MB roh / ≈ 8,6 MB gz**. Das liegt unter der Planannahme „≈ 15 MB komprimiert“. Unkomprimiert und sortiert ablegen, damit Git gut deltakomprimiert. Die vollen kaikki-Auszüge (1,42 GB roh / 116 MB gz) kommen **nicht** ins Repository; sie bleiben als reproduzierbarer Werkzeug-Zwischenstand lokal. |
| S7-E3 | ADR 0045 Nr. 4 | Tatoeba-Filter und Lizenzspalte | **Lizenzspalte:** CC0 1.0, wenn die ID in `<l>_sentences_CC0` steht, sonst CC BY 2.0 FR; die API bestätigt das in der Stichprobe 60/60. **Standardfilter für den Import:** Ausschluss bei negativer Bewertung, Wartungs-Tag `@…`, Koran- oder Hadith-4-Gramm, Inhaltsindikator, Religion (sonst `religionsbezug` mit zwei Freigaben; Standard ist Ausschluss) und > 12 Wörtern auf einer Seite; es bleiben 93,3 / 92,8 / 91,8 %. **Arabische Sätze** nur nach Vokalisierung (80,8 % ohne Harakat) durch Werkzeug und KI mit Prüfer „voll vokalisiert“, in der Namensnennung als „bearbeitet (vokalisiert)“ gekennzeichnet. **Indirekte Paare** über Englisch standardmäßig **nicht**; Option für tr↔ar erst nach Muttersprachler-Stichprobe (ADR 0041). Erneuern je Etappe (L3, L4, L5), nicht wöchentlich. |
| S7-E4 | ADR 0045 Nr. 6 | Welche kaikki-Ausgaben, welche Felder | **Drei Ausgaben:** en für Stammformen, Genus, Plural, en-Glossen und kanonische vokalisierte Formen (ar 99,1 %); de für deutsche Definitionen und Übersetzungen de→tr/ar; tr für türkische Definitionen und Übersetzungen tr→de/ar. **Beispiele werden nie übernommen**, also auch keine mit `ref` (Z-L18 ist strukturell erfüllt). `lernapp:pruefen` prüft, dass in `web/daten/kaikki` kein Schlüssel `examples` oder `ref` vorkommt. **Glossenlücken** schließt der KI-Entwurf mit Gegenprüfung (KI-Regel 2, KERN §2.1 Nr. 1), Quelle `ki:<lauf>` statt `kaikki:<ausgabe>`. kaikki deckt bei Top 5.000 / Top 1.000 nur ab: de-aus-ar 30 / 40 %, tr-aus-ar 37 / 50 %, ar-aus-de 51 / 61 %. |
| S7-E5 | KERN §2.2 Nr. 6, ADR 0040 | kaikki und Koran-Arabisch | kaikki-Daten nur für Sprachkurse; **nie** als Bedeutung im Pfad `koran` oder im Wissenskurs. Kernauszug-Einträge mit `thema:` Religion/Islam (de 301, tr 400, ar 372) markiert der Import als `religionsbezug`-Kandidaten für das Formel-Lexikon (KERN §3 a). |
| S7-E6 | ADR 0045 Nr. 7 | Häufigkeitslisten | Rang aus wordfreq 3.1.1 (de/ar `large`, tr `small`, 63.345 Wörter, reicht bis Top 30.000). Für ar zusätzlich CAMeL MSA v1.0; Rangmittel aus beiden. FrequencyWords nur als Gegenprobe. Vor der Stufung filtern: Nicht-Wörter, Fremd- und Spamtoken (z. B. „escort“ in tr Top 1.000), Eigennamen, Schimpfwörter. Beide Listen sind Wortformen; lemmatisiert wird über kaikki-Formen (de 98,9 %, tr 91,8 %, ar 98,1 % mit Klitika bei Top 5.000) bzw. CAMeL Tools. |
| S7-E7 | KERN §3 b/c, ADR 0040 | Normalisierung des Wächters | Der Wächter normalisiert wie in §3.3, einschließlich der Koranzeichen U+06D6–U+06ED, Alif wasla U+0671 und Ta marbuta/Ha. Sonst verdeckt der Unterschied zwischen uthmanischer und heutiger Schreibung Treffer. Unit-Test mit Positivproben aus `web/daten` und den 38 Tatoeba-Treffer-IDs (`tmp/tatoeba/ngramm_4.json`). |
| S7-E8 | ADR 0039, Z-L17, LM-12 | Namensnennung je Eintrag im Paket | Tatoeba: `quelle: "tatoeba:<id>"`, `lizenz: "CC BY 2.0 FR"`, `namensnennung: "Satz #<id> von <benutzer>"`; ohne Name (deu 25, tur 51, ara 76 Sätze) „Tatoeba-Mitwirkende“; bei Paaren beide Seiten; bei Änderungen „bearbeitet“. kaikki: `quelle: "wiktionary:<ausgabe>:<seitentitel>"` (Link `https://<ausgabe>.wiktionary.org/wiki/<seitentitel>`, en mit Anker `#German`/`#Turkish`/`#Arabic`), `lizenz: "CC BY-SA 4.0"`, Hinweis „gekürzt und umformatiert“. Häufigkeit erscheint nur auf `/quellen`, weil sie nur der Auswahl dient. |
| S7-E9 | `.vercelignore` (Orchestrator, gemeinsame Datei) | Brauchen Bau und Vorschau die Auszüge? | Nein. Der Import liest `web/inhalte/lernapp/**`, und die Auszüge braucht nur `lernapp:pruefen` (Prüfstufe A, lokal/CI). Vorschlag: `web/daten/tatoeba`, `web/daten/kaikki` und `web/daten/haeufigkeit` in `.vercelignore` aufnehmen, sofern L1/L3 keinen Bauzugriff einführen. Spart ≈ 33 MB je Upload. |

## 5. Vorschlag Ablage und Größe im Repository (ADR 0025/0045)

| Ordner | Dateien (= Scratchpad-Auszug, unverändert) | roh | gz |
|---|---|---|---|
| `web/daten/tatoeba/` | `QUELLE.md`, `saetze_{deu,tur,ara}.tsv`, `paare_{deu-tur,deu-ara,tur-ara}.tsv` | 6,3 MB | 1,6 MB |
| `web/daten/kaikki/` | `QUELLE.md`, `kaikki-kern-{de,tr,ar}-top20000.jsonl` | 20,1 MB | 4,6 MB |
| `web/daten/haeufigkeit/` | `QUELLE.md`, `wordfreq-3.1.1_{de,tr,ar}_top50k.tsv`, `camel-msa-1.0_top50k.tsv`, `frequencywords-2018_{de,tr,ar}_50k.txt` | 6,6 MB (top 30k: 3,9) | 2,4 MB (top 30k: 1,4) |
| **Summe** | | **≈ 33 MB** | **≈ 8,6 MB** |

- **Format:** unkomprimiert, UTF-8, LF, sortiert. Tatoeba ist nach ID sortiert, kaikki nach normalisiertem Lemma, Ausgabe und
  Wortart. Die größte Einzeldatei hat 11,7 MB und liegt damit weit unter der GitHub-Warnschwelle von 50 MB. Git LFS ist nicht
  nötig.
- **Erneuern:** pro Etappe neu ziehen. Der Prüfer vergleicht Satz-IDs, Text und Benutzer der verwendeten Tatoeba-Sätze. Fehlt
  ein Satz oder ändert er sich, gibt es einen Befund statt einer stillen Übernahme.
- **Arabische Schrift:** `web/daten/**` ist dafür bereits erlaubt (Befund 7, `religion-pruefung.mjs`). Der Wächter läuft auf
  Inhaltsdateien und nicht auf `web/daten`.
- **Nicht ins Repository:**
  - volle kaikki-Auszüge
  - englische Pivot-Links
  - Bewertungsdatei, Tags und CC0-Listen (nur als Spalten im Satzauszug)
  - NC/ND-Material: nichts davon fällt in S7 an; Tatoeba-Audio und OpenSubtitles-Sätze wurden nicht berührt

## 6. Entwürfe `QUELLE.md` (nicht ins Repository kopiert)

### 6.1 `web/daten/tatoeba/QUELLE.md`

````markdown
# QUELLE: Tatoeba – Satzpaare Deutsch/Türkisch/Arabisch (Auszug)

| Feld | Angabe |
|---|---|
| Quelle | https://tatoeba.org/de/downloads (Wochenexport, Ordner `https://downloads.tatoeba.org/exports/per_language/`) |
| Version | Wochenexport vom 10.10.2026 (Last-Modified Sa 10.10.2026 06:29–06:41 UTC) |
| Abrufdatum (UTC) | 2026-10-16 |
| Lizenz | Sätze: CC BY 2.0 FR (https://creativecommons.org/licenses/by/2.0/fr/); Teilmenge CC0 1.0 laut `*_sentences_CC0` (in diesem Auszug: 0 Sätze) |
| Nutzungsbedingungen | https://tatoeba.org/de/terms_of_use (in Kraft seit 24.04.2022), Nr. 6.2 |
| Filter | `_lernapp/werkzeuge/sprachdaten/tatoeba_laden.sh`, `tatoeba_filter.py`, `tatoeba_auswerten.py` (SHA-256 beim Übernehmen eintragen) |

## Ausgangsdateien (nicht gespeichert, im Strom gefiltert)

| Datei | Bytes | SHA-256 |
|---|---|---|
| `per_language/deu/deu_sentences_detailed.tsv.bz2` | 17664205 | `8f0dbeff78db97bbcd97eb1fd9e127431972a278cf3fb0335e8bdcc1335e8d19` |
| `per_language/tur/tur_sentences_detailed.tsv.bz2` | 13449435 | `5a00066f3eb1be4f664249e7c4d244d03952ba3a4242e85ea54faed6727b776a` |
| `per_language/ara/ara_sentences_detailed.tsv.bz2` | 1210165 | `d7f20eb866273737a3339d541526e030c5a4af36ca074e6caa8f6fe25d6b916c` |
| `per_language/deu/deu-tur_links.tsv.bz2` | 149639 | `bf46e505500ab5e2b77de02a1999342da29f0d31e9698fdf3f0a3c35f5ddc3f6` |
| `per_language/deu/deu-ara_links.tsv.bz2` | 18845 | `4da77af5d7c11cc943cb89bfb7d7ac92651241edbe43c9934489ad75e2d8e2a7` |
| `per_language/tur/tur-ara_links.tsv.bz2` | 15813 | `eb56f4b77148a7cbcfdf149b18f751008d8ce3dc9456d59cf096acad08414092` |
| `per_language/deu/deu_sentences_CC0.tsv.bz2` | 1852 | `df8c16713e5715a0e1343bc1195004463e7facee08863d3cd709cbf123a74587` |
| `per_language/ara/ara_sentences_CC0.tsv.bz2` | 151 | `8537d5cce4e878b588d9124f9bf26582c98002681accbcaf69c3927ed43c8364` |
| `per_language/{deu,tur,ara}/<l>_tags.tsv.bz2` | 277598 / 51166 / 4404 | `425c2cfe08d71ad978d85076a1539938cdf1d27d952c07a00b358eaf15080d92` / `f4df621228141cfca5cd53bde76ab503f6fd8a09c3de6eddbc8ea9732bec3b96` / `17b186a6c7892e32b456675eefa267d098ef2ee10d920bd2a0a40f4d3e4cff0e` |
| `users_sentences.csv` | 98729963 | `bb463864bc96270eab6f874ff5c1fc36f5e730c19fb44f53674f2a46082c674f` |

## Dateien (Auszug)

| Datei | Bytes | Zeilen | SHA-256 |
|---|---|---|---|
| `saetze_deu.tsv` | 2753815 | 23107 | `2291ba95d2056ca295690ed6e106e70952722daf10c9157be9dd0f67b7debe98` |
| `saetze_tur.tsv` | 2556961 | 22587 | `450f4f45e1afb4fff49a4f095844b0a7ef013c958c0d1e1ff8f8068e2a8aef4b` |
| `saetze_ara.tsv` | 557651 | 4650 | `ea39acdf9a853768d4e9b24c9a01cb338af165a15083c93788aa0e2b84f1f91b` |
| `paare_deu-tur.tsv` | 363517 | 22317 | `866aa73ea35d58c579091096498f9216656a7f27706d5e5b5a8c853b232ed1b1` |
| `paare_deu-ara.tsv` | 46563 | 2975 | `5c99a6724a75e6987c98801e1cb9ca183a1d7966aeebf618c883548fc5e171ea` |
| `paare_tur-ara.tsv` | 39303 | 2409 | `4a7080a994baa55f582189223a611f02a46e5af00e942b3e16f93e0ec62464e4` |

Spalten `saetze_*`: `id, sprache, text, benutzer, lizenz, angelegt, geaendert, bew_pos, bew_neg, tags`
(Bewertungen nur als Anzahl, ohne Namen der Bewertenden). Spalten `paare_*`: `<a>_id, <b>_id`.
Nur direkte Übersetzungslinks; beide Sätze sind im Export enthalten (Export-Filter `correctness > -1`, Lizenz nicht leer).

## Pflichten

- Namensnennung je Satz, auch offline im Paket: „Satz #{id} von {benutzer}, Tatoeba (https://tatoeba.org/de/sentences/show/{id}),
  CC BY 2.0 FR (https://creativecommons.org/licenses/by/2.0/fr/)“; ohne Benutzername („\N“): „Tatoeba-Mitwirkende“.
- Bei Paaren beide Sätze nennen. Veränderungen kenntlich machen („bearbeitet“, z. B. Lückentext, Vokalisierung).
- Kein ShareAlike. Lerninhalte, die Sätze zusammenstellen, stehen unter CC BY-SA 4.0; das Feld `lizenz` bleibt je Satz erhalten.
- Kein Tatoeba-Audio aus diesem Auszug (Audio-Lizenzen je Sprecher, ADR 0045 Nr. 5).

## Prüfung (Stand 2026-10-16)

1. Paare gültig: de–tr 22316 (10 Links ohne Satz verworfen), de–ar 2974, tr–ar 2408.
2. Lizenz: 50341 Sätze CC BY 2.0 FR, 0 CC0. API-Stichprobe 60/60 (Lizenz, Text, Besitzer gleich; `is_unapproved` false).
3. Wächter-Vorprobe: 38 arabische Sätze mit Koran- oder Hadith-4-Gramm (betrifft 16 Paare de–ar, 36 Paare tr–ar); der Import
   schließt sie aus.
4. Inhaltsindikator und Religionsbezug: siehe Beleg `_lernapp/belege/S7-sprachdaten.md` §3.3; Standardfilter §4 S7-E3.
````

### 6.2 `web/daten/kaikki/QUELLE.md`

````markdown
# QUELLE: Wiktionary über kaikki.org (Wiktextract) – Kernauszug Deutsch/Türkisch/Arabisch

| Feld | Angabe |
|---|---|
| Quelle | https://kaikki.org/dictionary/ (maschinenlesbare Wiktionary-Daten von Tatu Ylonen, extrahiert mit Wiktextract) |
| Ausgaben | en.wiktionary (Dump 02.09.2026, extrahiert 03.10.2026, wiktextract `1a05e46`, wikitextprocessor `e3d6d4e`); de.wiktionary (Dump `dewiktionary-20260901`); tr.wiktionary (Dump `trwiktionary-20260901`) |
| Abrufdatum (UTC) | 2026-10-16 |
| Lizenz | CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/deed.de); Wiktionary-Texte stehen wahlweise unter CC BY-SA oder GFDL, gewählt ist CC BY-SA 4.0. Wiktextract (Werkzeug) MIT, nur lokal. |
| Zitierwunsch | Tatu Ylonen: Wiktextract: Wiktionary as Machine-Readable Structured Data, LREC 2022 |
| Filter | `_lernapp/werkzeuge/sprachdaten/kaikki_laden.sh`, `kaikki_reduzieren.py`, `abdeckung.py`, `kern_auszug.py` (SHA-256 beim Übernehmen eintragen) |

## Ausgangsdateien (nicht gespeichert, im Strom gekürzt)

| Datei | Bytes | SHA-256 |
|---|---|---|
| `German/kaikki.org-dictionary-German.jsonl` | 1085014820 | `d7ae58be5479ebf607bb9f714e74d796f4df3e8b558478d8e9c7710c55510394` |
| `Turkish/kaikki.org-dictionary-Turkish.jsonl` | 437664571 | `19fb26cafe451d8fc4dfb937e6f255d75389c33d1a7e88e6d682ab913938546a` |
| `Arabic/kaikki.org-dictionary-Arabic.jsonl` | 521119623 | `19985dbf8b729c2ac8827640b55ab57337681292e134f9527509a0ee88c5a1ac` |
| `downloads/de/de-extract.jsonl.gz` | 308579949 | `2e66f18a093e94b29b04733d0222625695a3d5ed199e700059193895490dfb19` |
| `downloads/tr/tr-extract.jsonl.gz` | 44063619 | `c6945c5fb62c40508428a0e218a125f3fb055fd90c25d95e930248dcfe013aa2` |

## Dateien (Auszug)

| Datei | Bytes | Einträge | SHA-256 |
|---|---|---|---|
| `kaikki-kern-de-top20000.jsonl` | 11719653 | 42136 | `c09ff3d4bfe7f0e5a27febe48f83cbd36b3fc2310b256be0ecbacecdbb352009` |
| `kaikki-kern-tr-top20000.jsonl` | 4493645 | 22361 | `3de932e2da595f4d411572408c0fd37d71ce553064a05a0cd6942d162d7da6d5` |
| `kaikki-kern-ar-top20000.jsonl` | 3866099 | 15630 | `edf04a43a32fd5256bfad04a707758cdf4d41dd2163999616f795f669ac2ea8a` |

Auswahl: Lemmata, die von den 20.000 häufigsten Wörtern (wordfreq 3.1.1; ar zusätzlich CAMeL MSA v1.0) erreicht werden,
aus allen drei Ausgaben, dazu Einträge, deren Übersetzungstabelle ein solches Wort enthält. Felder: `w` (Seitentitel),
`l`, `q` (Ausgabe), `pos`, `kanon`, `rom`, `g`, `pl`, `aux`, `kf` (Stammformen aus der Kopfzeile, nur en), `gl`
(Glossen mit Register), `ue` (Übersetzungen), `mk` (Register, Themen).
**Gekürzt:** keine Beispiele (auch keine Zitate mit `ref`), keine Töne, keine Etymologie, keine vollen Flexionstabellen.

## Pflichten

- Namensnennung je Eintrag (auch offline): „Wörterbuchdaten nach Wiktionary, Artikel ‚{w}‘
  (https://{q}.wiktionary.org/wiki/{w}), Autorinnen und Autoren siehe Versionsgeschichte; extrahiert mit Wiktextract
  (Tatu Ylonen) über kaikki.org; gekürzt und umformatiert; Lizenz CC BY-SA 4.0“.
- ShareAlike: Die Wortschatz-Datenbank der Lern-App steht unter CC BY-SA 4.0 (L0-E02), ohne technische Schutzmaßnahmen.
- Nur für Sprachkurse. Nie als Bedeutung im Koran-Arabisch-Pfad oder im Wissenskurs (KERN 4.0 §2.2 Nr. 6).

## Prüfung (Stand 2026-10-16)

1. Bytezahl jeder Ausgangsdatei = `content-length`; SHA-256 in vier Läufen gleich.
2. 0 Einträge mit `examples`, `ref` oder `sounds`.
3. Abdeckung (wordfreq Top 5.000, Lemma oder Form in irgendeiner Ausgabe): de 98,9 %, tr 91,8 %, ar 87,4 % (mit
   Klitika-Abtrennung 98,1 %). Glossen in den Ausgangssprachen: Beleg S7 §3.6.
````

### 6.3 `web/daten/haeufigkeit/QUELLE.md`

````markdown
# QUELLE: Häufigkeitslisten (wordfreq, CAMeL Arabic Frequency Lists, FrequencyWords) – nur zur Auswahl und Stufung

Die Listen enthalten nur Wörter und Zahlen, keine Sätze. Sie erscheinen nicht in Lektionen, nur auf `/quellen`.

## wordfreq 3.1.1

| Feld | Angabe |
|---|---|
| Quelle | https://github.com/rspeer/wordfreq, Paket `wordfreq-3.1.1-py3-none-any.whl` (PyPI, 21.11.2023, 56834549 Bytes, SHA-256 `4b1c6ecffc6198be3396d5cf871c4423ca71c907c231348d352dd54d62b97473`) |
| Daten | `wordfreq/data/large_de.msgpack.gz`, `large_ar.msgpack.gz`, `small_tr.msgpack.gz` (für Türkisch gibt es keine `large`-Liste) |
| Lizenz | Daten CC BY-SA 4.0; Code Apache-2.0 (nicht ausgeliefert) |
| Namensnennung | „Häufigkeitsdaten: wordfreq von Robyn Speer (https://github.com/rspeer/wordfreq, DOI 10.5281/zenodo.7199437), CC BY-SA 4.0; enthält Daten aus SUBTLEX (Brysbaert u. a., frei verfügbare Daten), OpenSubtitles (http://www.opensubtitles.org/), Google Books Ngrams (http://books.google.com/ngrams), Wikipedia, Leeds Internet Corpus und ParaCrawl; gefiltert und gekürzt.“ |

## CAMeL Arabic Frequency Lists v1.0 (MSA)

| Feld | Angabe |
|---|---|
| Quelle | https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists, Release v1.0 (Tag-Commit `f5341fbbb94472f9d4d788db4541948c0af3ebe9`), `MSA_freq_lists.tsv.zip` (69064867 Bytes, SHA-256 `99a6792501af8f1a8ed5209bfada961ae4fc076823e62b16883ef2e4c39b39a4`) |
| Lizenz | CC BY-SA 4.0 (`LICENSE.txt`) |
| Namensnennung | „Arabische Häufigkeitsdaten: Camel Arabic Frequency Lists v1.0 (Khalifa, Inoue, Alhafni, Baimukan, Bouamor, Habash 2021), CC BY-SA 4.0; gefiltert und gekürzt.“ |

## FrequencyWords (Gegenprobe)

| Feld | Angabe |
|---|---|
| Quelle | https://github.com/hermitdave/FrequencyWords, Commit `525f9b560de45753a5ea01069454e72e9aa541c6`, `content/2018/{de,tr,ar}/<l>_50k.txt` |
| Lizenz | Inhalt CC BY-SA 4.0, Code MIT |
| Namensnennung | „Häufigkeitsdaten: FrequencyWords von Hermit Dave (https://github.com/hermitdave/FrequencyWords), CC BY-SA 4.0, auf Grundlage von OpenSubtitles2018 (http://www.opensubtitles.org/, über OPUS); gefiltert.“ |

## Dateien

| Datei | Bytes | Zeilen | SHA-256 |
|---|---|---|---|
| `wordfreq-3.1.1_de_top50k.tsv` | 1020007 | 50001 | `1ada77d33e79f9fec0a0ed53ed55667bf99a4c35965c8512b1c1c187c2887244` |
| `wordfreq-3.1.1_tr_top50k.tsv` | 1020431 | 50001 | `713a3d7517d98ad184dda0e261fda914e4ec4b63a110b118be18314be7866265` |
| `wordfreq-3.1.1_ar_top50k.tsv` | 1138232 | 50001 | `facdc2666c6203475b80c337e96e6b2462b084a6ae2f1fba5e05d920ddff7bab` |
| `camel-msa-1.0_top50k.tsv` | 1239702 | 50001 | `8ce2eb7ccd304ee9c19f606c6fc07a156bcc023babbbb50cccaad1d9210b8a0a` |
| `frequencywords-2018_de_50k.txt` | 662497 | 50000 | `d9e50546fd7e8b6fe6542a2b33c51d1331092b2a3916ec09f80d97856068705b` |
| `frequencywords-2018_tr_50k.txt` | 711935 | 50000 | `480192844e7fdfe9591bbf0b9cfbb96ed5751cfbba7024fd45d8cb7508e07d5c` |
| `frequencywords-2018_ar_50k.txt` | 805779 | 50000 | `bbe98b4b92902b392bdefa2e555a108fdb42a5dd79d261674be5ab666229e19f` |

Spalten wordfreq: `rang, wort, zipf`; CAMeL: `rang, wort, anzahl`; FrequencyWords unverändert (`wort anzahl`).

## Pflichten

- Namensnennung wie oben auf `/quellen` und `/lern-app/[ui]/quellen` (offline). ShareAlike für abgeleitete Listen.
- SUBTLEX-Bedingung (wordfreq): SUBTLEX-Autoren nennen; klarstellen, dass SUBTLEX frei verfügbare Daten sind.
- Nicht verwenden: SUBTLEX-DE direkt, DeReWo, KELLY, „A Frequency Dictionary of Arabic“ (ADR 0045 Nr. 10).
````

## 7. Risiken

| # | Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|---|
| R1 | Tatoeba ändert sich wöchentlich: Sätze werden gelöscht oder korrigiert, Besitz wechselt („adoptiert“), die Lizenz kann auf CC0 wechseln. | Namensnennung oder Text veraltet | Abgleich je Etappe. `lernapp:pruefen` vergleicht ID, Text und Benutzer und meldet Abweichungen. |
| R2 | kaikki hält nur den aktuellen Stand online; ältere Extraktionen verschwinden. | Reproduktion aus der Quelle ist nur zeitlich begrenzt möglich | Der gepinnte Auszug im Repository ist die Referenz (ADR 0025). Volle Auszüge (116 MB gz) bleiben lokal bis zum Ende von L5. Notfalls Neuextraktion aus den Wikimedia-Dumps 20260901 mit Wiktextract `1a05e46`. |
| R3 | Geringe Glossenabdeckung bei Richtungen mit ar (de-aus-ar nur 30–40 %, tr-aus-ar 37–50 %) und unsichere Sinnzuordnung der Übersetzungstabellen (`sense` ist Freitext) | mehr KI-Entwurf und Gegenprüfung | KI-Glossen mit Quelle `ki:<lauf>`, Rückübersetzung und Muttersprachler-Stichprobe (ADR 0041); kaikki dient nur als Vorschlag. |
| R4 | Die Klitika-Heuristik ar überschätzt die Abdeckung, z. B. durch falsche Präfixabtrennung. | geschönte Werte „mit Klitika“ | Als Obergrenze lesen; genaue Lemmatisierung mit CAMeL Tools (`morphology-db-msa-r13`, nur lokal) in L3. |
| R5 | Der Inhaltsindikator arbeitet mit Stichworten. | Fehlalarme und Lücken, z. B. „Sevgili“ als Anrede | Nur zur Priorisierung. Endgültig entscheiden der Inhaltsleitfaden (LM-09), die KI-Gegenprüfung und die Stichprobe. |
| R6 | Religiöser Bezug in Tatoeba-Sätzen (de↔tr 215, de↔ar 62, tr↔ar 97 Paare) und in kaikki (Themen Religion/Islam) | Verstoß gegen KERN §2.3 bei ungeprüfter Übernahme | Standard: Ausschluss. Sonst `religionsbezug` mit zwei religiösen Freigaben und ohne Sprachausgabe. Koran- und Hadith-4-Gramm-Treffer (38 Sätze) immer ausschließen. |
| R7 | Die Wächter-Normalisierung trifft die Unterschiede zwischen uthmanischer und heutiger Schreibung nur teilweise. | übersehene Koran-Zitate | Normalisierung wie §3.3 und Unit-Test (S7-E7); dazu die 3-Gramm-Zählung (56/84) als Warnstufe für die Durchsicht. |
| R8 | Spam, Fremdtoken und Untertitelsprache in den Häufigkeitslisten | unpassende Wörter in der Stufung | Vor der Stufung filtern (S7-E6); FrequencyWords nur als Gegenprobe. |
| R9 | Benutzernamen sind Pseudonyme Dritter. | Personenbezug in der Namensnennung | Die Lizenz verlangt die Nennung. Es werden keine weiteren Daten gespeichert; die Bewertungen sind nur gezählt, ohne Namen. Löscht jemand seinen Satz, entfällt er beim nächsten Abgleich. |
| R10 | Die Daten von wordfreq sind seit 2021 eingefroren; tr nur mit der kleinen Liste (63.345 Wörter). | dünnere Rangfolge oberhalb von Top 30.000 bei tr | Die Lern-App braucht ≈ 6.500 Lemmata je Sprache; Top 20.000 reichen. |
| R11 | Tatoeba-Arabisch ist zu 80,8 % unvokalisiert. | Die Sätze sind nicht direkt nutzbar (Fusha voll vokalisiert, L3-E07). | Vokalisieren mit Werkzeug und KI, Prüfer „voll vokalisiert“, Kennzeichnung „bearbeitet“. Arabische Sätze tragen ohnehin vor allem KI-Sätze (ADR 0045 Nr. 4). |

## 8. Aufräumen

- **Gelöscht nach Gebrauch:**
  - wordfreq-Wheel (57 MB) und die venv mit `msgpack` (15 MB)
  - CAMeL-ZIP (69 MB)
  - Probeköpfe der kaikki-Dateien (≈ 60 MB)
  - volle Bedarfsvarianten (≈ 0,67 GB), Kern-Varianten 10k/30k und volle wordfreq-Listen
  - englische Pivot-Links (21 MB) und der erste kaikki-Lauf `auszug/kaikki.v1`
- **Verbleibt im Scratchpad (146 MB):**
  - `SP/auszug/` (143 MB mit `SHA256SUMS`; davon 116 MB volle kaikki-Auszüge)
  - `SP/skripte/` (14 Skripte, 0 arabische Codepunkte)
  - `SP/dl/meta/` (Kopfzeilen, Lizenzdateien, Hashes)
  - `SP/tmp/` (Zählungen: `abdeckung.json`, `bedarf_lemmata.json`, `tatoeba/stat.json`, `ngramm_{3,4}.json`,
    `api_stichprobe.json`)
  - Vorschlag: die vollen kaikki-Auszüge nach der Übernahme in L3 löschen
- **Prozesse:** Es wurde kein Server gestartet. Alle Hintergrundläufe sind beendet: kaikki-Läufe PID 32133, 1708, 1878, 2645;
  abgebrochene Läufe per PID gestoppt; eine Messung mit xz per PID abgebrochen. Kein eigener Prozess läuft mehr.
- **Repository:** Geschrieben wurde nur diese Datei; nichts committet.
- **Für STATUS (L0-09):** Werkzeuge liegen unter `SP/skripte/`. Vorschlag für L3: Übernahme nach
  `_lernapp/werkzeuge/sprachdaten/` durch den Orchestrator.

## 9. Quellen (abgerufen 16.10.2026)

- **Tatoeba:**
  - https://tatoeba.org/en/downloads (Spaltenbeschreibung, Lizenzhinweis)
  - https://downloads.tatoeba.org/exports/ (Dateien §3.1)
  - https://api.tatoeba.org/v1/sentences/{id}
- **kaikki.org:**
  - https://kaikki.org/dictionary/{German,Turkish,Arabic}/index.html
  - https://kaikki.org/dictionary/rawdata.html
  - `downloads/{de,tr}/{de,tr}-extract.log.gz` (Dump-Dateinamen)
- **wordfreq:** https://pypi.org/pypi/wordfreq/3.1.1/json und `METADATA` (Abschnitt „License“) im Wheel
- **CAMeL:** https://raw.githubusercontent.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists/master/{README.md,LICENSE.txt};
  Release-Download v1.0
- **FrequencyWords:** https://raw.githubusercontent.com/hermitdave/FrequencyWords/525f9b5…/{README.md,LICENSE,content/2018/…}
- **Wächter-Daten (unverändert gelesen):** `web/daten/tanzil/quran-uthmani.xml`, `web/daten/hadith/ara-bukhari.json`
