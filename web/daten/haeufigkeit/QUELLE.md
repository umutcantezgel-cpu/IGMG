# QUELLE: Häufigkeitslisten (wordfreq, CAMeL Arabic Frequency Lists, FrequencyWords) – nur zur Auswahl und Stufung

Die Listen enthalten nur Wörter und Zahlen, keine Sätze. Sie dienen der Auswahl und Stufung des Wortschatzes, erscheinen nicht in
Lektionen und werden nur auf den Quellenseiten genannt (`/quellen`, `/lern-app/[ui]/quellen`).

- Abrufdatum (UTC): 2026-10-16 (Spike S7, Beleg `_lernapp/belege/S7-sprachdaten.md`)
- Übernahme ins Repository: 2026-10-20 (Paket L3-04), Dateien byte-gleich mit dem Spike-Auszug
- Bezug: ADR 0025 Nr. 1–2, ADR 0045 Nr. 3, 7, 10 und „Fortschreibung durch Spike S7“ Nr. 1, 2, 5, 7

## wordfreq 3.1.1

| Feld | Angabe |
|---|---|
| Quelle | https://github.com/rspeer/wordfreq; Paket https://pypi.org/project/wordfreq/3.1.1/ |
| Ausgangsdatei | `wordfreq-3.1.1-py3-none-any.whl` (PyPI, 21.11.2023), 56834549 Bytes, SHA-256 `4b1c6ecffc6198be3396d5cf871c4423ca71c907c231348d352dd54d62b97473` (= PyPI-Digest); nach dem Auslesen gelöscht |
| Daten | `wordfreq/data/large_de.msgpack.gz` (634.502 Wörter), `large_ar.msgpack.gz` (620.701), `small_tr.msgpack.gz` (63.345; für Türkisch gibt es keine `large`-Liste). Daten eingefroren (Stand ≈ 2021). |
| Lizenz | Daten CC BY-SA 4.0 (Abschnitt „License“ in `METADATA` des Wheels); Code Apache-2.0 (nicht ausgeliefert) |
| Namensnennung | „Häufigkeitsdaten: wordfreq von Robyn Speer (https://github.com/rspeer/wordfreq, DOI 10.5281/zenodo.7199437), CC BY-SA 4.0; enthält Daten aus SUBTLEX (Brysbaert u. a., frei verfügbare Daten), OpenSubtitles (http://www.opensubtitles.org/), Google Books Ngrams (http://books.google.com/ngrams), Wikipedia, Leeds Internet Corpus und ParaCrawl; gefiltert und gekürzt.“ |
| Filterskript | `_lernapp/werkzeuge/sprachdaten/wordfreq_liste.py`, SHA-256 `d792f8d2cc5f3120b092fcfb8ef143d2d24ef6682e3a82c4658131f96b25219c` (liest die cBpack-Datei aus dem Wheel, schreibt `rang, wort, zipf`; Aufruf mit Höchstzahl 1000000, Auszug = Top 50.000). Zum Lesen nötig: `msgpack==1.1.0` in einer eigenen venv. |

Hinweise: `large_de` faltet Groß-/Kleinschreibung und ß → ss (`casefold`). `small_tr` enthält unter den Top 1.000 Spam- und
Fremdtoken (z. B. „escort“, „http“, „the“). ar: Wortformen mit Klitika, keine Lemmata.

## CAMeL Arabic Frequency Lists v1.0 (MSA)

| Feld | Angabe |
|---|---|
| Quelle | https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists, Release v1.0 (Tag-Commit `f5341fbbb94472f9d4d788db4541948c0af3ebe9`) |
| Ausgangsdatei | https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists/releases/download/v1.0/MSA_freq_lists.tsv.zip (Datei 26.06.2024), 69064867 Bytes, SHA-256 `99a6792501af8f1a8ed5209bfada961ae4fc076823e62b16883ef2e4c39b39a4`; darin `MSA_freq_lists.tsv`, SHA-256 `9ccd10aa66a514fd4b433c7996cba165420dd685d71bfbd6d96315a738ddff16` (11.376.241 Typen, 9.927.804.375 Token als Summe der Spalte, absteigend sortiert geprüft). ZIP nach dem Auslesen gelöscht. |
| Lizenz | CC BY-SA 4.0 (`LICENSE.txt` des Repositorys) |
| Namensnennung | „Arabische Häufigkeitsdaten: Camel Arabic Frequency Lists v1.0 (Salam Khalifa, Go Inoue, Bashar Alhafni, Nurpeiis Baimukan, Houda Bouamor, Nizar Habash 2021, https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists), CC BY-SA 4.0; gefiltert und gekürzt.“ |
| Zitierwunsch laut `LICENSE.txt` | Go Inoue, Bashar Alhafni, Nurpeiis Baimukan, Houda Bouamor, Nizar Habash: The Interplay of Variant, Size, and Task Type in Arabic Pre-trained Language Models. Proceedings of the Sixth Arabic Natural Language Processing Workshop (WANLP), 2021, S. 92–104 |
| Erzeugung | Top 50.000 nach Anzahl, mit vorangestellter Rangspalte (`rang, wort, anzahl`; Rang 1–50.000 lückenlos, Anzahl absteigend, kleinste Anzahl 15.888 – geprüft 2026-10-20). Für diesen Schritt liegt kein gespeichertes Skript vor (Beleg S7 §2.3 nennt nur den Abruf); Prüfgrundlage ist die SHA-256 der Auszugsdatei unten. |

## FrequencyWords 2018 (Gegenprobe)

| Feld | Angabe |
|---|---|
| Quelle | https://github.com/hermitdave/FrequencyWords, Commit `525f9b560de45753a5ea01069454e72e9aa541c6` |
| Ausgangsdateien | `https://raw.githubusercontent.com/hermitdave/FrequencyWords/525f9b560de45753a5ea01069454e72e9aa541c6/content/2018/{de,tr,ar}/<l>_50k.txt`, unverändert übernommen (SHA-256 = Auszugsdateien unten). ETag de `"fa2c668fefbb159026517d490dabe512fffd346c25ebb806a205780f3f28717b"`, tr `"4456a93996ce0bc6e1ea48e3f0b5a7dffb159d8d4422e8b29e354e36ac6fe1b3"`, ar `"8e15a4d5c6e5383c9bcb8ac6d05a7745353fe2fa7be9b18626be75122e15507b"` (abgerufen 16.10.2026 15:17 UTC) |
| Lizenz | Inhalt CC BY-SA 4.0, Code MIT (README „MIT License for code. CC-by-sa-4.0 for content.“) |
| Namensnennung | „Häufigkeitsdaten: FrequencyWords von Hermit Dave (https://github.com/hermitdave/FrequencyWords), CC BY-SA 4.0, auf Grundlage von OpenSubtitles2018 (http://www.opensubtitles.org/, über OPUS); gefiltert.“ |
| Filterskript | keines (Datei unverändert, Abruf per `curl`) |

Hinweis: ar enthält unter den Top 5.000 402 Token aus Ziffern oder Satzzeichen. Nur als Gegenprobe; Sätze aus OpenSubtitles werden
nicht verwendet (ADR 0045 Nr. 10).

## Dateien

| Datei | Bytes | Zeilen (mit Kopf) | SHA-256 |
|---|---|---|---|
| `wordfreq-3.1.1_de_top50k.tsv` | 1020007 | 50001 | `1ada77d33e79f9fec0a0ed53ed55667bf99a4c35965c8512b1c1c187c2887244` |
| `wordfreq-3.1.1_tr_top50k.tsv` | 1020431 | 50001 | `713a3d7517d98ad184dda0e261fda914e4ec4b63a110b118be18314be7866265` |
| `wordfreq-3.1.1_ar_top50k.tsv` | 1138232 | 50001 | `facdc2666c6203475b80c337e96e6b2462b084a6ae2f1fba5e05d920ddff7bab` |
| `camel-msa-1.0_top50k.tsv` | 1239702 | 50001 | `8ce2eb7ccd304ee9c19f606c6fc07a156bcc023babbbb50cccaad1d9210b8a0a` |
| `frequencywords-2018_de_50k.txt` | 662497 | 50000 | `d9e50546fd7e8b6fe6542a2b33c51d1331092b2a3916ec09f80d97856068705b` |
| `frequencywords-2018_tr_50k.txt` | 711935 | 50000 | `480192844e7fdfe9591bbf0b9cfbb96ed5751cfbba7024fd45d8cb7508e07d5c` |
| `frequencywords-2018_ar_50k.txt` | 805779 | 50000 | `bbe98b4b92902b392bdefa2e555a108fdb42a5dd79d261674be5ab666229e19f` |

- Format: UTF-8, LF, ohne BOM, nach Rang sortiert.
- Spalten wordfreq: `rang, wort, zipf`; CAMeL: `rang, wort, anzahl` (jeweils Tab, mit Kopfzeile); FrequencyWords unverändert
  (`wort anzahl`, Leerzeichen, ohne Kopfzeile).

## Pflichten

- Namensnennung wie oben auf `/quellen` und `/lern-app/[ui]/quellen` (offline). ShareAlike für abgeleitete Listen.
- SUBTLEX-Bedingung (wordfreq): SUBTLEX-Autoren nennen; klarstellen, dass SUBTLEX frei verfügbare Daten sind.
- Verwendung (ADR 0045 Fortschreibung S7 Nr. 5): Rang aus wordfreq (de/ar `large`, tr `small`), für ar zusätzlich CAMeL MSA
  (Rangmittel); FrequencyWords nur als Gegenprobe. Vor der Stufung Nicht-Wörter, Fremd- und Spamtoken, Eigennamen und
  Schimpfwörter filtern; lemmatisiert wird über kaikki-Formen (`../kaikki/`) bzw. CAMeL Tools.
- Nicht verwenden: SUBTLEX-DE direkt, DeReWo, KELLY, „A Frequency Dictionary of Arabic“ (ADR 0045 Nr. 10).
- Bau und Vorschau brauchen diesen Ordner nicht (`.vercelignore`); er dient nur `lernapp:pruefen` (Prüfstufe A) und der lokalen Inhaltserzeugung. Der Bau-Import liest `web/inhalte/lernapp/**` (Beleg S7, S7-E9).

## Prüfung

1. SHA-256 aller sieben Dateien = Spalte oben (2026-10-20, gegen `SHA256SUMS` des Spikes).
2. wordfreq-Wheel gegen den PyPI-Digest geprüft (2026-10-16); CAMeL-Liste absteigend sortiert geprüft (2026-10-16).
3. Auszüge wordfreq und CAMeL: Rang lückenlos 1–50.000, Zipf-Wert bzw. Anzahl absteigend (2026-10-20).
