# QUELLE: Wiktionary über kaikki.org (Wiktextract) – Kernauszug Deutsch/Türkisch/Arabisch

| Feld | Angabe |
|---|---|
| Quelle | https://kaikki.org/dictionary/ (maschinenlesbare Wiktionary-Daten von Tatu Ylonen, extrahiert mit Wiktextract) |
| Ausgaben | en.wiktionary (Dump 02.09.2026, extrahiert 03.10.2026, wiktextract `1a05e46`, wikitextprocessor `e3d6d4e`); de.wiktionary (Dump `dewiktionary-20260901`, extrahiert ab 01.10.2026); tr.wiktionary (Dump `trwiktionary-20260901`, extrahiert ab 01.10.2026). Eine ar.wiktionary-Extraktion gibt es nicht. |
| Abrufdatum (UTC) | 2026-10-16 (Spike S7, Beleg `_lernapp/belege/S7-sprachdaten.md`) |
| Übernahme ins Repository | 2026-10-20 (Paket L3-04), Dateien byte-gleich mit dem Spike-Auszug |
| Lizenz | CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/deed.de). Wiktionary-Texte stehen wahlweise unter CC BY-SA oder GFDL; gewählt ist CC BY-SA 4.0. Wiktextract (Werkzeug) MIT, nur lokal. |
| Zitierwunsch | Tatu Ylonen: Wiktextract: Wiktionary as Machine-Readable Structured Data, LREC 2022 |
| Bezug | ADR 0025 Nr. 1–2, ADR 0045 Nr. 3, 6 und „Fortschreibung durch Spike S7“ Nr. 1, 2, 4, 7 |

## Ausgangsdateien (nicht gespeichert, im Strom gekürzt)

Adresse = `https://kaikki.org/dictionary/` + Pfad. SHA-256 und Bytes über den Strom gemessen (`hashtee.py`); Bytes =
`content-length`. Die en-Dateien kamen mit `Content-Encoding: gzip`; gehasht ist der entpackte Strom, also die Datei selbst.
Die Upstream-SHA-256 waren in vier Läufen gleich.

| Pfad | Bytes | Last-Modified (UTC) | ETag | SHA-256 |
|---|---|---|---|---|
| `German/kaikki.org-dictionary-German.jsonl` | 1085014820 | 03.10.2026 11:00:56 | `"6ac0e068-40ac0324"` | `d7ae58be5479ebf607bb9f714e74d796f4df3e8b558478d8e9c7710c55510394` |
| `Turkish/kaikki.org-dictionary-Turkish.jsonl` | 437664571 | 03.10.2026 10:45:10 | `"6ac0dcb6-1a163b3b"` | `19fb26cafe451d8fc4dfb937e6f255d75389c33d1a7e88e6d682ab913938546a` |
| `Arabic/kaikki.org-dictionary-Arabic.jsonl` | 521119623 | 03.10.2026 11:01:46 | `"6ac0e09a-1f0fa787"` | `19985dbf8b729c2ac8827640b55ab57337681292e134f9527509a0ee88c5a1ac` |
| `downloads/de/de-extract.jsonl.gz` | 308579949 | 03.10.2026 08:28:52 | `"6ac0bcc4-12648e6d"` | `2e66f18a093e94b29b04733d0222625695a3d5ed199e700059193895490dfb19` |
| `downloads/tr/tr-extract.jsonl.gz` | 44063619 | 03.10.2026 08:27:16 | `"6ac0bc64-2a05b83"` | `c6945c5fb62c40508428a0e218a125f3fb055fd90c25d95e930248dcfe013aa2` |

Zwischenstufe (nicht im Repository): die vollen gekürzten Auszüge `en-deu`, `en-tur`, `en-ara`, `de-wikt`, `tr-wikt`
(`.jsonl.gz`, zusammen ≈ 1,42 GB roh / 116 MB gz; SHA-256 in Beleg S7 §3.7). Aus ihnen entsteht der Kernauszug.

## Filterskripte

Ablage `_lernapp/werkzeuge/sprachdaten/`, byte-gleich mit den Skripten, die den Auszug erzeugt haben. Python immer mit `-I`.

| Skript | Rolle | SHA-256 |
|---|---|---|
| `kaikki_laden.sh` | lädt die fünf Ausgangsdateien im Strom, hasht, kürzt, schreibt die vollen Auszüge | `895c689a4c8be81263fb8678df3654763bfa8b294d68dac31b5122555166f403` |
| `hashtee.py` | reicht den Strom durch, misst SHA-256 und Bytes | `ab3729e9ed18cacd5fdc29b12e999e6b0045eabc8aa3aa0d5374b95684e631a9` |
| `kaikki_reduzieren.py` | Kürzungsregeln (Felder behalten/verwerfen, Beleg S7 §2) | `9d899d06c100f1d3447736288dd0cc6a409a5632a6359f0cfd8a354414929501` |
| `abdeckung.py` | misst die Abdeckung und schreibt die Bedarfsliste (Lemmata der Top-N-Wörter, `tmp/bedarf_lemmata.json`) | `bfcd083863bdf2d54d2118d61bfcee7ad7118dfedd25482e3aa87632b9703b6b` |
| `kern_auszug.py` | schreibt den Kernauszug je Sprache (Aufruf mit N = 20000) | `2a7aadd3a346756e28c5f5fb12a9b9239368b75f83ed34a39263f983b361074a` |
| `bedarf_auszug.py` | nur Messung: volle Bedarfstabellen für den Größenvergleich | `795355539d26b0dd7251775bb6c9c399fdb800de5bdbc0402da3b00e9f23d565` |
| `vokalisierung.py` | Prüfung: Anteil vokalisierter Formen (en/ar) | `784e674b228ea2238dfd09d7a079f72d954a6fd8e926ddb5280f5e9a7d4d0c5b` |

Aufruf laut Beleg S7 §2.2 und §2.4. `kaikki_laden.sh` enthält als `S=` den Arbeitsordner des Spikes; für eine Erneuerung `S`
anpassen. Die Bedarfsliste nutzt die Häufigkeitslisten aus `../haeufigkeit/`. Die Skripte enthalten keine arabische Schrift
(Muster nur als Codepunkte).

## Dateien (Auszug)

| Datei | Bytes | Einträge (Zeilen) | SHA-256 |
|---|---|---|---|
| `kaikki-kern-de-top20000.jsonl` | 11719653 | 42136 | `c09ff3d4bfe7f0e5a27febe48f83cbd36b3fc2310b256be0ecbacecdbb352009` |
| `kaikki-kern-tr-top20000.jsonl` | 4493645 | 22361 | `3de932e2da595f4d411572408c0fd37d71ce553064a05a0cd6942d162d7da6d5` |
| `kaikki-kern-ar-top20000.jsonl` | 3866099 | 15630 | `edf04a43a32fd5256bfad04a707758cdf4d41dd2163999616f795f669ac2ea8a` |

- Format: JSON Lines, UTF-8, LF, ohne BOM; sortiert nach normalisiertem Lemma, Ausgabe und Wortart.
- Auswahl: Lemmata, die von den 20.000 häufigsten Wörtern (wordfreq 3.1.1; ar zusätzlich CAMeL MSA v1.0) erreicht werden, aus
  allen drei Ausgaben, dazu Einträge, deren Übersetzungstabelle ein solches Wort enthält.
- Felder: `w` (Seitentitel), `l` (Sprache), `q` (Ausgabe en/de/tr), `pos`, `kanon` (kanonische, bei ar vokalisierte Form), `rom`
  (Umschrift), `g` (Genus), `pl`, `aux` (Hilfsverb), `kf` (Stammformen aus der Kopfzeile, nur en), `gl` (Glossen mit Register),
  `ue` (Übersetzungen), `mk` (Register, Themen).
- Einträge je Ausgabe: de 16028 en / 21415 de / 4693 tr; tr 8205 en / 447 de / 13709 tr; ar 13322 en / 292 de / 2016 tr.

**Gekürzt – keine Beispiele, kein `ref`:** Aus kaikki werden nie Beispiele übernommen, also auch keine Zitate mit `ref`. Ebenso
fehlen Töne (`sounds`), Etymologie, Kategorien, Links, Synonyme, Vorlagen und volle Flexionstabellen. `lernapp:pruefen` prüft, dass
in `web/daten/kaikki` kein Schlüssel `examples` oder `ref` vorkommt (ADR 0045 Fortschreibung S7 Nr. 4, Z-L18).

## Lizenz und Namensnennung

- Namensnennung je Eintrag (auch offline im Paket): „Wörterbuchdaten nach Wiktionary, Artikel ‚{w}‘
  (https://{q}.wiktionary.org/wiki/{w}), Autorinnen und Autoren siehe Versionsgeschichte; extrahiert mit Wiktextract
  (Tatu Ylonen) über kaikki.org; gekürzt und umformatiert; Lizenz CC BY-SA 4.0“. Bei `q` = en mit Anker `#German`, `#Turkish`
  bzw. `#Arabic`.
- Felder je Eintrag im Paket: `quelle: "wiktionary:<ausgabe>:<seitentitel>"`, `lizenz: "CC BY-SA 4.0"`, Hinweis „gekürzt und
  umformatiert“.
- ShareAlike: Die Wortschatz-Datenbank der Lern-App steht unter CC BY-SA 4.0 (ADR 0045 Nr. 2, L0-E02), ohne technische
  Schutzmaßnahmen.

## Pflichten

- Nur für Sprachkurse. Nie als Bedeutung im Pfad `koran` oder im Wissenskurs (KERN 4.0 §2.2 Nr. 6, S7-E5). Einträge mit Thema
  Religion/Islam (`mk` mit `thema:`; Kernauszug de 301, tr 400, ar 372 laut Beleg S7 §3.7) markiert der Import als Kandidaten für
  `religionsbezug` und das Formel-Lexikon.
- Glossenlücken schließt der KI-Entwurf mit Gegenprüfung; Quelle dann `ki:<lauf>`, nicht `kaikki:<ausgabe>`.
- Erneuern: kaikki hält nur den aktuellen Stand online. Dieser gepinnte Auszug ist die Referenz (ADR 0025); notfalls
  Neuextraktion aus den Wikimedia-Dumps 20260901 mit Wiktextract `1a05e46`.
- Bau und Vorschau brauchen diesen Ordner nicht (`.vercelignore`); er dient nur `lernapp:pruefen` (Prüfstufe A) und der lokalen Inhaltserzeugung. Der Bau-Import liest `web/inhalte/lernapp/**` (Beleg S7, S7-E9).

## Prüfung

Stand 2026-10-16 (Spike S7), nachgeprüft am Repository-Stand 2026-10-20:

1. Bytezahl jeder Ausgangsdatei = `content-length`; Upstream-SHA-256 in vier Läufen gleich.
2. SHA-256 aller drei Dateien = Spalte oben (2026-10-20, gegen `SHA256SUMS` des Spikes).
3. 0 Schlüssel `examples`, `ref`, `sounds` und `etymology_text` (2026-10-20 rekursiv über alle JSON-Schlüssel geprüft).
4. Abdeckung (wordfreq Top 5.000, Lemma oder Form in irgendeiner Ausgabe): de 98,9 %, tr 91,8 %, ar 87,4 % (mit
   Klitika-Abtrennung 98,1 %). Glossen in den Ausgangssprachen der sechs Richtungen: Beleg S7 §3.6.
