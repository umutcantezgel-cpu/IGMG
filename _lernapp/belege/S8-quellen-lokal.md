# Beleg S8 – Hanafitische Quellen lokal (OpenITI), Passagen-Index und Zuordnung zum Lehrplan

- **Etappe:** L0, Spike S8. In diesem Lauf kein Commit. Geschrieben wurden nur diese Datei und das Werkzeug
  `_lernapp/werkzeuge/quellen/openiti-passagen.mjs` mit der Unit-Probe `openiti-passagen.test.mjs`.
- **Stand:** 17.10.2026.
  - Ein erster Anlauf am 16.10.2026 (Workflow `wf_6a33ebb6-16f`) brach am Sitzungslimit ab. Danach lagen Downloads,
    Werkzeug 1.0.0 (als ZWISCHENSTAND 8c7f5b3 committet) und Index vor; ein Beleg fehlte.
  - In diesem Lauf wurde alles nachgeprüft, das Werkzeug zu 1.1.0 erweitert und der Index neu erzeugt.
- **Bezug:**
  - KERN 4.0 §2.2 Nr. 4, 5 und 7, §2.4 (benannte Werke, OpenITI nur lokal), §3 (Werkstatt nur Umschrift)
  - ADR 0040 Nr. 4 (Quellenpflicht, Beleg, Prüfung im lokalen Werkzeug) und Nr. 5 (was Prüfende sehen)
  - ADR 0045 Nr. 12 (hanefitische Quellen, Ausgaben, `web/daten/hanafi-quellen/QUELLE.md`)
  - PLAN §5.2 (Bereiche des Wissenskurses), §6.7 Nr. 1–2 (Quellen lokal, Passagen-Index)
  - genehmigter Plan §3.1 „Wissen“ (14 Module)
  - Lizenzbericht `berichte/lizenzen-l0-hanafi-quellen.md` §1–§3
  - MENSCHEN LM-04, LM-30, LM-32, LM-33
- **Arbeitsort:** Scratchpad `SP = /tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/l0/S8/`
  - `dl/meta/`: Zenodo-Datensatz, Metadaten-TSV und Zentralverzeichnis des Release-ZIPs
  - `dl/texte/`: die neun OpenITI-Dateien mit `.yml`
  - `skripte/`: eigene Skripte, ohne arabische Schrift; arabische Bereiche nur als `\u`-Codepunkte
  - `index/`: Passagen-Index (JSON und TSV) mit `zusammenfassung/`
  - `tmp/`: Zählungen
- **Arbeitsweise:**
  - Downloads gelten als nicht vertrauenswürdig. Sie liegen in eigenen Ordnern, Python läuft immer mit `-I`, und Skripte
    liegen getrennt von den Daten.
  - Node 24.21.0 aus dem Scratchpad.
- **Lizenz:** OpenITI steht unter CC BY-NC-SA 4.0. Dateien und Index bleiben im Scratchpad. Nichts davon kommt ins
  Repository, nach `web/daten/` oder in Inhalte.
- **Schrift:**
  - Arabische Titel stehen hier nur in Umschrift.
  - Kapiteltitel aus dem Werkzeug sind maschinell umschrieben, ohne Vokale und nur zur Orientierung (z. B. „ktāb al-ṣlāh“).
  - Titel im Fließtext sind von Hand umschrieben (z. B. „Kitāb aṣ-Ṣalāh“).

## 1. Ziel

1. Die Werke laut Lizenzbericht lokal holen, in der dort bestimmten Fassung und mit Prüfsumme:
   - Fiqh: Mukhtaṣar al-Qudūrī, Nūr al-Īḍāḥ, Marāqī al-Falāḥ, Ḥāshiyat aṭ-Ṭaḥṭāwī (als vorgesehener Träger der Marāqī),
     al-Hidāya, al-Ikhtiyār (Ḥalabī-Fassung 1937), Radd al-Muḥtār
   - Glaube: al-Fiqh al-Akbar, al-ʿAqīda aṭ-Ṭaḥāwiyya, al-ʿAqāʾid an-Nasafiyya
2. Die mARkdown-Struktur auswerten: Meilensteine `ms`, Überschriften, Seitenmarken, Sonder-Markup.
3. Werkzeug ohne Abhängigkeiten:
   - schneidet eine lokale Datei in Passagen (`werk.msNNNN`, Kapitelpfad, Zeichen- und Byte-Bereich, SHA-256)
   - erzeugt eine Zuordnung Kapitel → Lehrplanthema in Umschrift
   - Unit-Probe mit synthetischem mARkdown, ohne arabische Schrift
4. Messen:
   - Größen, Kapitelzahlen und Passagen je Werk
   - Abdeckung der 14 Module des Wissenskurses
   - welche Teile von Radd al-Muḥtār einschlägig sind
5. Vorschläge zu den offenen Punkten aus ADR 0040, ADR 0045 und LM-04/LM-33 machen.

## 2. Vorgehen (Befehle)

`W=/home/user/IGMG/_lernapp/werkzeuge/quellen/openiti-passagen.mjs`; Node vorher:
`export PATH=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/node24/bin:$PATH`.

1. **Release und Metadaten** (16.10.):
   - Zenodo-Datensatz `https://zenodo.org/api/records/17767721` → `dl/meta/zenodo-17767721.json`
   - Metadaten `…/files/OpenITI_metadata_2025-1-9.tsv/content` → `dl/meta/` (12.092.756 Bytes)
   - Filter je Werk: `python3 -I skripte/meta_filter.py dl/meta/OpenITI_metadata_2025-1-9.tsv 'Quduri\.Mukhtasar' 'NurIdah' …`
2. **Nur die nötigen Dateien aus dem 5,9-GB-ZIP**, per HTTP-Range ohne Vollabzug (16.10.):
   - Befehl: `python3 -I skripte/zip_auszug.py <zip-url> dl/texte dl/meta <muster…>`
   - liest EOCD und ZIP64-Zentralverzeichnis, cacht es als `dl/meta/zentralverzeichnis.bin`, holt nur die Einträge, entpackt
     sie und prüft CRC32 und Größe; Protokoll `dl/meta/auszug.json`
   - übertragen ≈ 57 MB statt 5.936.029.637 Bytes
3. **Nachprüfung der Herkunft** (17.10.):
   - `sha256sum dl/texte/*` gegen `auszug.json`
   - `python3 -I skripte/crc_pruefung.py dl/meta/zentralverzeichnis.bin dl/texte` (CRC32 und Größe gegen das Zentralverzeichnis)
   - `md5sum` der Metadaten-TSV gegen Zenodo
   - HEAD auf das ZIP (`content-length`) und Range auf die letzten 64 KiB: ZIP64-EOCD gegen die Cache-Größe des
     Zentralverzeichnisses
4. **Struktur:**
   - `python3 -I skripte/struktur.py <dateien>`
   - `python3 -I skripte/kopfarten.py <dateien>` (Überschriften-Syntax)
   - `python3 -I skripte/ms_pruefung.py <dateien>` (Lücken, Breite, Wörter je Meilenstein)
   - Seitenmarken und HTML-Reste mit `node -e …` und `grep -o '<[^>]{0,40}>'`; ausgegeben wurden nur Zahlen und lateinisches
     Markup
5. **Werkzeug und Unit-Probe:** `TMPDIR=$SP/tmp/testtmp node --test _lernapp/werkzeuge/quellen/openiti-passagen.test.mjs`
6. **Index aller Werke:**
   - `skripte/alle.sh $SP/index` ruft je Werk `node $W index <datei> --werk <kennung> --aus <verz> --sha256 <soll>` auf, danach
     `node $W pruefe <index.json>`
   - Fiqh Akbar und Ṭaḥāwiyya mit `--standard-thema aqaid`
   - Abdeckung: `node $W abdeckung index/*.passagen.json`
   - Reproduzierbarkeit: Der Lauf von 1.0.0 (16.10.) wurde wiederholt. JSON (ohne Zeitstempel) und TSV waren byte-gleich.
7. **Gegenproben (Zahlen, keine Textausgabe):**
   - `python3 -I skripte/ueberlappung.py dl/texte` und `ueberlappung2.py`: 3-, 5- und 8-Gramme zwischen Nūr al-Īḍāḥ,
     Marāqī, Ḥāshiya, Hidāya und Ikhtiyār
   - Fehlen der Nasafiyya: Suche in der Metadaten-TSV
8. **Religion:**
   - `node _gemeinde/werkzeuge/religion-pruefung.mjs`
   - Weil die Prüfung nur versionierte Dateien liest (Arbeitsstand), zusätzlich dieselbe Regel auf den unversionierten Beleg
     und auf die Index-TSV:
     `node skripte/arabisch-pruefen.mjs <dateien>`

## 3. Ergebnisse

### 3.1 Werke, Versionen, URIs, Größen

Release **OpenITI 2025.1.9**, veröffentlicht am 30.12.2025, DOI 10.5281/zenodo.17767721, Lizenzfeld `cc-by-nc-sa-4.0`.

- ZIP `OpenITI_data_2025-1-9.zip`: 5.936.029.637 Bytes, md5 `95cf19a9…860b1`, `last-modified` 01.12.2025. Das
  Zentralverzeichnis hat 72.876 Einträge und 11.020.468 Bytes.
- Metadaten-TSV: md5 `cb2226f6…d40199` = Zenodo, 14.108 Zeilen.
- **18 von 18 Dateien** (9 Texte, 9 `.yml`) stimmen in CRC32 und Größe mit dem Release-ZIP überein. Die SHA-256 stimmen mit
  dem Auszugsprotokoll überein.

| Werk (Kennung) | Version-URI | Status | Druckvorlage (Lizenzbericht §2) | Bytes | Zeichen | Wörter¹ | SHA-256 der Datei |
|---|---|---|---|---|---|---|---|
| Mukhtaṣar al-Qudūrī (`quduri`) | `0428AbuHusaynQuduri.Mukhtasar.Sham19Y0124336-ara1` | pri | DKI 1418/1997 | 408.768 | 233.288 | 42.664 | `263bf893…aa93e8` |
| Nūr al-Īḍāḥ (`nur-al-idah`) | `1069IbnCammarShurunbulali.NurIdah.JK000284-ara1` | pri | Dār al-Ḥikma 1985 | 198.756 | 113.792 | 19.774 | `8a131ece…0070f` |
| Marāqī al-Falāḥ (`maraqi-al-falah`) | `1069IbnCammarShurunbulali.MaraqiFalahSharhNurIdah.Shamela0000412-ara1` | pri | al-Maktaba al-ʿAṣriyya 1425/2005 | 1.027.342 | 597.502 | 101.605 | `f4391e80…bd2348` |
| Ḥāshiyat aṭ-Ṭaḥṭāwī (`hashiyat-at-tahtawi`) | `1231IbnMuhammadHanafiTahtawi.HashiyaCalaMaraqi.JK000219-ara1` | pri | Būlāq 1318/1900 | 2.324.233 | 1.324.682 | 239.706 | `466521ff…ec2078` |
| al-Hidāya (`hidaya`) | `0593BurhanDinFarghaniMarghinani.HidayaFiSharhBidaya.JK000242-ara1` | pri | al-Maktaba al-Islāmiyya, ohne Jahr | 3.326.541 | 1.875.818 | 345.290 | `936f5947…b98b1` |
| al-Ikhtiyār (`ikhtiyar`) | `0683IbnMahmudMajdDinMawsili.IkhtiyarLiTaclil.Shamela0001066-ara1` | **sec** (bewusst) | Ḥalabī, Kairo 1356/1937 | 3.232.733 | 1.865.542 | 317.065 | `08be11bf…202319` |
| Radd al-Muḥtār (`radd-al-muhtar`) | `1252IbnCabidinDimashqi.RaddMukhtar.JK000170-ara1` | pri | Dār al-Fikr 1421/2000, 8 Bände | 23.991.043 | 13.662.424 | 2.531.646 | `8778f8d2…e391dd` |
| al-Fiqh al-Akbar (`fiqh-akbar`) | `0150AbuHanifa.FiqhAkbar.JK001085-ara1` (Datei mit Endung `.mARkdown`) | pri | Maktabat al-Furqān 1419/1999 | 18.943 | 11.427 | 1.656 | `6ccc99e2…267e79` |
| al-ʿAqīda aṭ-Ṭaḥāwiyya (`tahawiyya`) | `0321Tahawi.MatnCaqida.JK000126-ara1` | pri | al-Maktab al-Islāmī 1398/1978 | 23.374 | 14.001 | 2.169 | `e5ed82ab…e6de7` |
| al-ʿAqāʾid an-Nasafiyya | – | **fehlt** | – | – | – | – | – |

¹ Wörter nach dem Werkzeug, ohne Markup. Die Abweichung zu `tok_length` der Metadaten liegt bei höchstens 1,4 %
(Nūr al-Īḍāḥ 19.774 zu 20.051; Fiqh Akbar 1.656 = 1.656). Bei der Ṭaḥāwiyya zählt `tok_length` die 105 Absatznummern mit:
2.169 + 105 = 2.274.

- Die vollen SHA-256 stehen in `$SP/tmp/sha-texte.txt` und in den Index-Köpfen (`dateiSha256`).
- **Nasafiyya:** In der Metadaten-TSV gibt es weder den Matn (Najm ad-Dīn an-Nasafī, gest. 537) noch den Sharḥ at-Taftāzānīs.
  Vom Verfasser `0537NajmDinAbuHafsNasafi` liegen nur Qand, Ṭalibat aṭ-Ṭalaba und Taysīr vor, von at-Taftāzānī nur Sharḥ
  al-Maqāṣid, Talwīḥ und Mukhtaṣar al-Maʿānī. Der Lizenzbericht ist damit bestätigt.

### 3.2 mARkdown-Struktur

| Werk | Überschriften (Syntax: Anzahl) | Meilensteine (Breite, Lücken) | Wörter je ms² (min/Median/max) | Seitenmarken (Bände) | Koranmarken `@QB@` | Besonderheiten |
|---|---|---|---|---|---|---|
| quduri | `### \|` 56, `### \|\|` 62, davon `AUTO` 118 | 143 (3-stellig, 0) | 240/299/300 | 238 (1) | 0 | Shamela-2019: Ebenen über die Striche |
| nur-al-idah | `# \|N` 34 (Ebene 1: 5, 2: 29), `# \|` 345, `# Nr` 149 | 67 (2, 0) | 237/298/300 | 151 (1) | 5 | JK: nummerierte Ebenen, darunter viele Unterpunkte ohne Nummer |
| maraqi-al-falah | `### \|` 301 (187 leer) | 343 (3, 0) | 155/297/301 | 344 (1) | 0 | Shamela-HTML: 342 `<span class="matn">` und 342 `matn-hr`; Meilenstein zweimal im Tag (ms032, ms175) |
| hashiyat-at-tahtawi | `# \|` 91 | 800 (3, 0) | 92/300/300 | 489 (1) | 156 | JK, Ebenen nur über Schlüsselwörter |
| hidaya | `# \|N` 224 (1: 57, 2: 167), `# \|` 4 | 1.153 (4, 0) | 138/300/300 | 978 (4) | 246 | JK |
| ikhtiyar | `### \|` 1.153, davon 834 Kolumnentitel und 31 leer | 1.069 (4, 0) | 83/296/300 | 835 (5 + Vorspann) | 0 | Shamela-HTML: 834 `matn`-Spans; Meilenstein dreimal im Tag |
| radd-al-muhtar | `# \|` 2.066 | 8.443 (4, 0) | 166/300/300 | 5.187 (8) | 747 | JK, Ebenen nur über Schlüsselwörter (Kitāb, Bāb, Faṣl, Maṭlab, Farʿ, Tanbīh …); Bd. 7–8 siehe §3.6 |
| fiqh-akbar | `### \|` 26 | 6 (1, 0) | 156/300/300 | 37 (1) | 1 | ein Kapitel je Lehrsatz |
| tahawiyya | keine; `# Nr` 105 | 8 (1, 0) | 167/287/291 | 46 (1) | 13 | nummerierter Matn; Gliederung über Absatznummern |

² Arabische Token je Meilenstein (`skripte/ms_pruefung.py`).

Befunde:
1. **Meilensteine sind überall lückenlos.** Es gibt keine doppelten Meilensteine und keinen Text nach dem letzten. Ein
   Meilenstein steht im Mittel alle 300 Wörter, ist also eine brauchbare Passagengröße für den Entwurf. Die Breite der Nummer
   schwankt je Datei (1–4 Stellen). Das Werkzeug vereinheitlicht sie auf mindestens 4 Stellen (`quduri.ms0007`).
2. **Drei Überschriften-Dialekte:**
   - Shamela/Sham19Y: `### |`, `### ||`, teils `AUTO n -`
   - JK: `# |N Titel N`, die Nummer ist die Ebene und steht am Zeilenende noch einmal
   - JK ohne Nummer: `# |`, die Ebene kommt aus dem ersten Wort
   Rauschen: leere Überschriften und in der Ikhtiyār 834 Kolumnentitel (der Werktitel als Seitenkopf).
3. **Seitenmarke `PageV<band>P<seite>` steht am Seitenende.** In 8 von 9 Dateien folgt nach der letzten Marke kein Text.
   Nur bei Qudūrī (Sham19Y) ist eine Randseite ohne Marke: 153 Wörter vor der ersten und 189 nach der letzten Marke. Die
   Seitenangabe ist deshalb ±1 Seite genau.
4. **Shamela-HTML in Kommentarwerken:**
   - `<span class="matn">…</span><span class="matn-hr"> </span>` gibt den Grundtext oben auf der Seite wieder, über dem
     Trennstrich des Drucks.
   - In der Marāqī liegen 89,1 % der 5-Gramme dieser Spans auch in Nūr al-Īḍāḥ. Die Spans decken 63,5 % von Nūr al-Īḍāḥ ab.
   - In der Ikhtiyār ist es vermutlich der Grundtext al-Mukhtār; das ist nicht gegengeprüft.
   - Werkzeug 1.0.0 ließ diese Tags im bereinigten Text stehen: 7.506 bzw. 3.078 lateinische Token, die als Wörter gezählt
     wurden. In 1.1.0 ist das behoben (§3.3).
5. **Koranmarken** `@QB@…@QE@` stehen nur in den JK-Dateien. Das Werkzeug zählt sie je Passage (`koran_marken`). Für den
   Entwurf heißt das: Verse nur als Verweis `sure:vers` (ADR 0040 Nr. 4).

### 3.3 Werkzeug `openiti-passagen.mjs` 1.1.0

- **Umfang:** 906 Zeilen, nur `node:`-Module, SHA-256 `9c94e784097a48cb915723f377444e7ca9d0275dcec4c9a7c8b36a3ef8c9b6aa`.
  Unit-Probe: 333 Zeilen, SHA-256 `51257720b59a29cd7a57e2efbb155f537a5808fb9dc8d38bcf0bfb710c615baf`.
- **Befehle:**
  - `index <datei> --werk <kennung> --aus <verz> [--uri] [--sha256 <soll>] [--standard-thema] [--korrektur <json>] [--gliederung]`
  - `pruefe <index.json>`: Datei-SHA und SHA jeder Passage gegen die Datei
  - `text <index.json> <werk.msNNNN> [--roh]`: bereinigter Passagentext nur lokal, mit SHA-Prüfung
  - `abdeckung <index.json …>`: Tabelle der Themen je Werk
- **Passage:** Text vom Ende des vorigen Meilensteins bis einschließlich `msN`. Kennung `<werk>.msNNNN`; Text nach dem letzten
  Meilenstein wird Passage N+1 (`rest`). Felder je Passage:
  - Zeichenbereich (UTF-16 wie `String.slice`, Byte-Order-Mark mitgezählt) und Byte-Bereich
  - `sha256` (Rohbytes mit Markup) und `sha256Text` (bereinigt, UTF-8)
  - Wörter, Koranmarken
  - Kapitel, Kapitelpfad (IDs und Umschrift), Kapitel im Text, Hauptthema, berührte Themen
  - **neu in 1.1.0:** `seiteVon` und `seiteBis` (z. B. `V01P023`)
- **Kapitel:**
  - Ebene in dieser Rangfolge: JK-Nummer, Anzahl der Striche, Schlüsselwort (Kitāb 1, Bāb 2, Faṣl 3, Maṭlab/Farʿ/Tanbīh/…
    4), sonst Kontext (+1)
  - Kolumnentitel werden verworfen: Überschriften ohne Gliederungswort, die ≥ 5 % (mindestens 20-mal) wiederkehren
  - Ende eines Kapitels: nächste Überschrift gleicher oder höherer Ebene
  - **neu in 1.1.0:** `seite`
- **Zuordnung:**
  - 14 Themen (genehmigter Plan §3.1, je mit Bereich nach PLAN §5.2), 43 Regeln, 10 Unterthemen für Glaube
  - Regeln stehen als Wortfolgen in Buckwalter-Umschrift und werden erst zur Laufzeit über Codepunkte in Arabisch umgesetzt.
    Die Quelldatei enthält keine arabische Schrift.
  - Abgleich auf vereinheitlichter Form (ohne Harakat/Tatweel, Alif-Formen, Tāʾ marbūṭa/Hāʾ, Alif maqṣūra/Yāʾ) mit
    Vorsilben w/f/b/l/k
  - Eigens getrennt:
    - al-īmān (Glaube) von al-aymān (Eide), Abgleich ohne Vereinheitlichung
    - al-ḥajj von al-ḥajr (Entmündigung)
    - as-siyar (Kriegsrecht) ist nicht Sīra
    - al-qirān und al-qurʾān haben keine Regel
  - Hauptthema wird vom Oberkapitel geerbt, sonst gilt die erste eigene Regel; Nebenthemen sind eigene weitere Treffer.
  - Menschliche Korrekturen per `--korrektur` als `{ "k0005": { "thema": "…" } }`.
- **Schutz:**
  - Ein- und Ausgabe im Repository werden verweigert (Pfad über `realpath`, Repository-Wurzel mit `.git`; Ausgang 2).
  - Abweichende `--sha256` → Abbruch.
  - Zuordnungs- und Passagen-TSV enthalten nur Umschrift. Arabische Titel stehen nur im JSON des Scratchpads.
- **Änderungen 1.0.0 → 1.1.0 (dieser Lauf):**
  1. Band/Seite je Passage und je Kapitel (für „Band und Seite“ im Beleg, ADR 0040 Nr. 4). Das letzte Inhaltszeichen zählt;
     eine Seitenmarke direkt vor dem Meilenstein schiebt die Passage nicht auf die Folgeseite.
  2. Shamela-HTML wird aus dem bereinigten Text entfernt, auch Tags, die ein Meilenstein an der Passagengrenze
     zerschneidet. HTML zählt auch beim Inhaltsanfang und -ende als Markup.
  3. Umschrift: Tāʾ marbūṭa nach Alif als „-āh“ („al-ṣlāh“ statt „al-ṣlāa“).
  - Passagengrenzen, Roh-SHA, Kapitel und Themen sind unverändert gegenüber 1.0.0, außer `ms0001` der Marāqī, die jetzt in
    Kitāb aṭ-Ṭahāra beginnt.
- **Unit-Probe** (`node --test`): **28/28 grün**, 5 Gruppen, ≈ 1,5 s.
  - Buckwalter hin und zurück, Vereinheitlichung, Umschrift
  - Ebenen, Themenregeln mit Gegenproben
  - Kennungen lückenlos mit Rest; Passagen kacheln den Rumpf
  - Zeichen- und Byte-Bereich treffen denselben Text (Umlaute und Byte-Order-Mark); SHA
  - Kolumnentitel; Erben, Nebenthema
  - Seiten, Markup-Entfernung, Abdeckung, Determinismus
  - Absatznummern mit Standardthema, Korrektur, ungültige Eingaben, doppelte Meilensteine, Shamela-HTML mit Meilenstein im Tag
  - Kommandozeile mit Ablageschutz, `pruefe`/`text`/`abdeckung`, geänderte Datei → Abbruch
  - Quelltexte ohne arabische Schrift
  - Die Probe besteht aus lateinischen Platzhalterwörtern; die wenigen arabischen Gliederungswörter entstehen erst zur
    Laufzeit aus Buckwalter.
- **Laufzeit:** Radd al-Muḥtār 4,2–4,7 s bei 138 MiB RSS; alle übrigen Werke unter 0,8 s.

Beispielzeilen (Passagen-TSV, Auszug):

```
kennung        ms zeichen_von zeichen_bis byte_von byte_bis woerter … kapitel kapitelpfad_umschrift                          thema seite_von seite_bis
quduri.ms0007  7  11397       13064       19492    22391    298     … k0006   ktāb al-ṣlāh                                   salah V01P023   V01P026
quduri.ms0008  8  13064       14756       22391    25364    299     … k0008   ktāb al-ṣlāh › bāb shrwṭ al-ṣlāh al-ty ttqdmhā salah V01P026   V01P028
```

### 3.4 Passagen-Index je Werk

Alle Läufe: `pruefe` → **0 abweichende Passagen**; Datei-SHA wie §3.1.

| Werk | Gliederung | Passagen | Kapitel (je Ebene) | Ebene aus | Kapitel ohne Lehrplanthema | Wörter ohne Thema |
|---|---|---|---|---|---|---|
| quduri | Überschriften | 143 | 118 (1: 56, 2: 62) | Schlüsselwort 56, Striche 62 | 51 | 53,8 % |
| nur-al-idah | Überschriften | 67 | 379 (1: 5, 2: 94, 3: 176, 4: 87, 5: 17) | Nummer 34, Schlüsselwort 60, Kontext 285 | 0 | 0 % |
| maraqi-al-falah | Überschriften | 343 | 114 (1: 5, 2: 42, 3: 67) | Schlüsselwort 95, Kontext 19 | 0 | 0 % |
| hashiyat-at-tahtawi | Überschriften | 800 | 91 (1: 6, 2: 31, 3: 54) | Schlüsselwort 90, Kontext 1 | 1 (Titelblatt) | 2,3 % |
| hidaya | Überschriften | 1.153 | 228 (1: 57, 2: 168, 3: 3) | Nummer 224, Schlüsselwort 3, Kontext 1 | 122 | 54,0 % |
| ikhtiyar | Überschriften | 1.069 | 288 (1: 57, 2: 77, 3: 146, 4: 8) | Schlüsselwort 257, Kontext 31 | 132 | 54,3 % |
| radd-al-muhtar | Überschriften | 8.443 | 2.066 (1: 64, 2: 162, 3: 54, 4: 1.764, 5: 22) | Schlüsselwort 2.044, Kontext 22 | 1.017 | 47,5 % |
| fiqh-akbar | Überschriften, Standardthema | 6 | 26 (1: 26) | Kontext 26 | 0 | 0 % |
| tahawiyya | Absatznummern, Standardthema | 8 | 105 (Nr. 1–105) | Absatznummer | 0 | 0 % |

**Gegenprobe der Kitāb-Ebene:** Alle Kitāb-Kapitel von Qudūrī, Hidāya, Ikhtiyār und Radd wurden durchgesehen (Umschrift).

- Richtig zugeordnet:
  - Ṭahāra, Ṣalāh, Zakāh, Ṣawm, Ḥajj, Nikāḥ, Raḍāʿ, Ṭalāq, Nafaqāt
  - Buyūʿ, Ṣarf, Ijāra (Erwerb); Dhabāʾiḥ, Ṣayd, Ashriba (Speisen)
  - Uḍḥiyya
  - Karāhiya bzw. al-Ḥaẓr wa-l-Ibāḥa (Erlaubtes und Verbotenes)
- Richtig ohne Thema:
  - Aymān (Eide), Ḥajr, Siyar (Kriegsrecht)
  - Ḥudūd, Jināyāt, Diyāt, Qaḍāʾ/Shahādāt/Daʿwā
  - Waqf, Hiba, Waṣāyā, Farāʾiḍ, Shirka, Rahn usw.
- Īlāʾ und Ẓihār bleiben ohne Thema. Sie gehören zum Eherecht, aber nicht zu den „Ehe-Grundlagen“.
- Der Anteil „ohne Thema“ (≈ 50 % der großen Werke) ist also Stoff außerhalb des Lehrplans, kein Fehler der Zuordnung.

### 3.5 Abdeckung der 14 Module

K. = Kapitel mit diesem Hauptthema; ms = Passagen, die in einem solchen Kapitel beginnen; „neben“ = Kapitel mit diesem
Nebenthema.

| Modul (genehmigter Plan §3.1) | Umschrift | Bereich PLAN §5.2 | fiqh-akbar | tahawiyya | quduri | nur-al-idah | maraqi | hashiya | hidaya | ikhtiyar | radd |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Glaube nach maturiditischer Lehre | ʿaqāʾid | Akaid | 26 K. / 6 ms | 105 K. / 8 ms | – | – | – | – | – | – | 2 K. / 0 ms (+1 neben) |
| Reinheit | ṭahāra | Taharah | – | – | 5 / 5 | 77 / 10 | 32 / 71 | 24 / 160 | 6 / 32 | 20 / 36 (+1) | 105 / 448 (+5) |
| Gebet | ṣalāh | Salah | – | – | 20 / 13 | 176 / 30 (+4) | 56 / 207 | 42 / 506 | 25 / 70 | 34 / 72 | 276 / 1.000 (+12) |
| Fasten | ṣawm | Sawm | – | – | 2 / 2 (+1) | 48 / 8 (+2) | 16 / 46 | 13 / 80 (+1) | 3 / 19 (+1) | 4 / 18 | 24 / 143 (+4) |
| Zakat und Ṣadaqat al-Fiṭr | zakāh | Zakat | – | – | 11 / 4 | 36 / 7 (+1) | 4 / 3 | 3 / 15 | 8 / 26 | 12 / 30 | 37 / 190 |
| Hadsch und Umra | ḥajj wa-ʿumra | Hajj/Umra | – | – | 7 / 9 | 42 / 11 (+1) | 6 / 16 | 8 / 20 | 11 / 67 (+1) | 13 / 50 | 60 / 299 |
| Opfer | uḍḥiyya | Halal/Haram und Alltag | – | – | 1 / 1 | – | – | – | 1 / 9 | 1 / 8 | 3 / 39 |
| Ehe-Grundlagen | nikāḥ | Halal/Haram und Alltag | – | – | 7 / 17 | – | – | – | 24 / 133 | 39 / 152 | 234 / 1.094 |
| Erlaubtes und Verbotenes im Alltag | al-ḥaẓr wa-l-ibāḥa | Halal/Haram und Alltag | – | – | 1 / 1 | – | – | – | 1 / 24 | 10 / 38 | 54 / 220 (+10) |
| Speisen und Erwerb | aṭʿima wa-kasb | Halal/Haram und Alltag | – | – | 13 / 14 | – | – | – | 27 / 148 | 23 / 84 (+2) | 245 / 985 (+2) |
| Ethik und Adab | akhlāq wa-ādāb | Akhlaq/Adab | – | – | – | (+4) | (+2) | (+2) | – | (+1) | (+1) |
| Prophetenbiografie | sīra | Siyar und Geschichte | (+1) | – | – | – | – | – | – | – | – |
| Grundlagen der Rechtsquellen | uṣūl | Grundwissen Koran/Hadith/Fiqh | – | – | – | – | – | – | – | – | 9 / 9 (+7) |
| Kalender und besondere Tage | taqwīm | quer (Salah, Sawm, Hajj) | – | – | (+1) | (+6) | (+2) | (+2) | (+1) | (+2) | (+9) |

**Bewertung je Modul**

| Stufe | Module | Befund |
|---|---|---|
| **gut belegt** (eigenes Kitāb in ≥ 3 Werken, Matn und Kommentar) | Reinheit, Gebet, Fasten, Zakat, Hadsch/Umra, Opfer, Ehe-Grundlagen, Erlaubtes und Verbotenes, Speisen und Erwerb | Taharah und Salah, die zuerst geprüft werden (PLAN §5.2), haben die dichteste Lage: Nūr al-Īḍāḥ als knapper Matn, Qudūrī als zweiter Matn, Radd für die Meinung, nach der Fatwa gegeben wird |
| **belegt, aber knapp** | Glaube | Nur Fiqh Akbar (6 Passagen, 1.656 Wörter, 26 Lehrsätze) und Ṭaḥāwiyya (8 Passagen, 105 Absätze) für 3 Einheiten. Unterthemen im Fiqh Akbar vollständig zugeordnet: tawḥīd, ṣifāt, kutub, qadar, nubuwwa, ṣaḥāba, ruʾya, ākhira, īmān. In der Ṭaḥāwiyya fehlen sie (Titel nur „Nr. N“). Die Nasafiyya fehlt (L0-E15). |
| **nur verstreut** | Kalender, Grundlagen der Rechtsquellen | Kalender nur als Nebenthema in Ṣalāh, Ṣawm und Ḥajj: ʿĪdayn, Sichtung des Neumonds, Laylat al-Qadr, ʿArafa, Tashrīq. Uṣūl nur in Radd, 9 kurze Maṭālib zu Ijtihād und zu den Pflichten des Muftī. Zwei davon stehen in Kitāb al-Qaḍāʾ (Bd. 5), sieben im Vorspann von Bd. 7 (§3.6, Zugehörigkeit unklar). Dazu kommen 7 Nebenthemen in Bd. 1–6. Koran- und Hadith-Grundwissen fehlt ganz. |
| **nicht belegt** | Ethik und Adab, Prophetenbiografie | Adab nur als Nebenthema (z. B. Ādāb aṣ-Ṣalāh). Sachlich steckt Adab in Kitāb al-Karāhiya bzw. al-Ḥaẓr wa-l-Ibāḥa (Kleidung, Essen, Gruß, Blick). Für die Sīra hat keines der benannten Werke ein Kapitel; „as-siyar“ ist Kriegsrecht. Der eine Treffer im Fiqh Akbar ist der Lehrsatz über die Kinder des Propheten. |

### 3.6 Radd al-Muḥtār – einschlägige Teile

Nach den Seitenmarken hat die Datei 8 Bände. Bd. 7 beginnt bei S. 14 (ms6765).

- **Bd. 7, S. 14–61 (ms6765–6837):** 85 Maṭālib ohne Oberkapitel zu Daʿwā, Tanāquḍ, Waṣiyya, Qāḍī und Muftī. Das Werkzeug
  hängt sie an das letzte offene Kapitel (Bāb al-Makhārij in Kitāb al-Farāʾiḍ). Dieser Kapitelpfad ist falsch, und es ist
  unklar, ob der Teil zu Radd oder zur Takmila gehört.
- **Ab Kitāb ash-Shahādāt (ms6837, Bd. 7, S. 61) bis Kitāb al-Hiba (Bd. 8):** ein zweiter Durchlauf durch die Bücher
  Shahādāt … Hiba.
- Belege dafür:
  - Vor Bd. 7 kommt „takmila“ 42-mal vor, ab Bd. 7 13-mal.
  - Der Titel „Qurrat ʿUyūn al-Akhyār“ steht nur einmal, am Dateiende (Kolophon). Der Dateikopf nennt keine Takmila.
- Dieser Teil ist daher sehr wahrscheinlich die **Takmila** von ʿAlāʾ ad-Dīn Ibn ʿĀbidīn, dem Sohn, also ein anderer
  Verfasser. Das ist am Druck zu bestätigen.

| Teil | Band, Seite (Vorlage) | Meilensteine | Lehrplanthema |
|---|---|---|---|
| Kitāb aṭ-Ṭahāra | Bd. 1, S. 79 ff. | ms1–449 | Reinheit |
| Kitāb aṣ-Ṣalāh | Bd. 1, S. 351 – Bd. 2 | ms449–1392 | Gebet (mit ʿĪdayn → Kalender) |
| Kitāb az-Zakāh | Bd. 2, S. 256 ff. | ms1392–1582 | Zakat |
| Kitāb aṣ-Ṣawm | Bd. 2 | ms1582–1725 | Fasten |
| Kitāb al-Ḥajj | Bd. 2 | ms1725–2024 | Hadsch und Umra |
| Kitāb an-Nikāḥ, Kitāb aṭ-Ṭalāq | Bd. 3, S. 3 – 851 | ms2024–3093 | Ehe-Grundlagen |
| Kitāb al-Jihād (Bāb al-Murtadd) | Bd. 4 | ms3633–3873 | ohne Thema; zwei Maṭālib zum Glauben |
| Kitāb al-Buyūʿ | Bd. 4, S. 500 – Bd. 5 | ms4230–4855 | Speisen und Erwerb |
| Kitāb al-Qaḍāʾ (Maṭālib zum Muftī) | Bd. 5 | ms4975–5159 | Grundlagen der Rechtsquellen (Teil) |
| Kitāb al-Ijāra | Bd. 6, S. 3 ff. | ms5516–5654 | Speisen und Erwerb |
| Dhabāʾiḥ, Uḍḥiyya, al-Ḥaẓr wa-l-Ibāḥa, Ashriba, Ṣayd | Bd. 6, S. 293 – … | ms5959–6252 | Speisen; Opfer; Erlaubtes und Verbotenes |
| Vorspann Bd. 7 (Maṭālib ohne Oberkapitel) | Bd. 7, S. 14–61 | ms6765–6837 | vereinzelt Ehe, Erwerb; 7 Maṭālib zum Muftī (Uṣūl) |
| vermutlich Takmila (Shahādāt … Hiba) | Bd. 7, S. 61 – Bd. 8 | ms6837–8443 | kein Lehrplanthema |

- **Ergebnis:** 4.427 von 8.443 Passagen (52 %) tragen ein Lehrplanthema.
- Für den Entwurf genügen die Bände 1–3 und 6, dazu Kitāb al-Buyūʿ aus Bd. 4–5, wenn Erwerb behandelt wird. Die ganze
  Datei bleibt lokal: Sie kostet 24 MB, der Index 4,5 s.

### 3.7 Befunde zu Ausgaben und Herkunft

1. **Die Ḥāshiyat aṭ-Ṭaḥṭāwī in OpenITI enthält den Marāqī-Text nicht.**
   - Gemeinsame n-Gramme des Marāqī-Kommentars (ohne Seitenkopf-Matn) mit der Ḥāshiya: 13,6 % bei n=3, 3,0 % bei n=5,
     0,5 % bei n=8.
   - Grundlinie mit Hidāya und Ikhtiyār: 4,6–5,0 %, 1,0–1,5 % und 0,2–0,6 %.
   - Von Nūr al-Īḍāḥ enthält die Ḥāshiya 1,6 % der 5-Gramme.
   - Die Datei ist also die Glosse mit kurzen Stichwörtern, nicht der Druck mit Marāqī. Der Weg „Marāqī über die Ḥāshiya,
     Būlāq 1900“ (Lizenzbericht §2, ADR 0045 Nr. 12) liefert digital keinen Marāqī-Wortlaut. Eine Prüfung des Wortlauts gegen
     Būlāq 1900 braucht einen Scan dieses Drucks.
2. **Marāqī-Datei (Vorlage 2005):** Die Seitenkopf-Spans geben Nūr al-Īḍāḥ wieder (89,1 % der 5-Gramme). Matn und Sharḥ lassen
   sich so technisch trennen; das Werkzeug macht das noch nicht (Risiko 5).
3. **Ikhtiyār:** Nur die SEC-Fassung, Ḥalabī 1937, liegt lokal, wie vorgegeben. Die PRI-Fassung (DKI 2005) wurde nicht geholt.
4. **Hidāya:** Die Vorlage hat kein Jahr; die Lage ist unverändert (LM-33).
5. **Fiqh Akbar und Ṭaḥāwiyya:**
   - Die Ṭaḥāwiyya-Datei enthält 105 nummerierte Absätze ohne Anmerkungen. Der Lizenzbericht nennt 260 Zeilen; gezählt
     wurden Absätze.
   - Beide Werke sind sehr kurz. Ein Kommentar fehlt in brauchbarer Form: Minaḥ ar-Rawḍ al-Azhar und der Sharḥ
     at-Turkistānīs liegen nur als unkorrigierte Kraken-OCR vor (Lizenzbericht §2).
6. **Zur Kenntnis, nicht benannt:** In OpenITI liegen maturiditische Werke von Abū l-Muʿīn an-Nasafī (gest. 508), nämlich
   Tamhīd fī Uṣūl ad-Dīn und Baḥr al-Kalām, beide als unkorrigierte Kraken-OCR (`0508AbuMucinNasafi.*`). Sie wurden nicht
   geholt. Ob sie in Frage kommen, entscheiden Menschen (LM-04).

### 3.8 Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `node --test …/openiti-passagen.test.mjs` | 28/28 grün |
| `node $W pruefe` für alle 9 Indizes | 0 abweichend (12.032 Passagen) |
| Reproduzierbarkeit 1.0.0 (16.10.) gegen 1.0.0 (17.10.) | JSON ohne Zeitstempel und alle TSV byte-gleich |
| Herkunft: CRC32/Größe gegen ZIP-Zentralverzeichnis; Zentralverzeichnis gegen den Live-ZIP64-EOCD; TSV-md5 gegen Zenodo | 18/18; gleich; gleich |
| `node _gemeinde/werkzeuge/religion-pruefung.mjs` | grün (5.524 versionierte Dateien; Werkzeug und Probe sind seit 8c7f5b3 versioniert und wurden im Arbeitsstand 1.1.0 mitgeprüft) |
| Gleiche Regel auf Werkzeug, Probe, diesen unversionierten Beleg und alle TSV im Index | 0 Zeilen mit arabischer Schrift |
| Ablageschutz: `index … --aus <im Repository>` | Abbruch mit Ausgang 2, nichts geschrieben (Unit-Probe) |

## 4. Entscheidungsvorschläge

Die Vorschläge gelten als Standard bis zur Antwort. Religiöse Entscheidungen bleiben bei Menschen.

1. **ADR 0040 Nr. 4, Form des Belegs:**
   - Jeder Beleg trägt:
     - `werk` (Kennung aus dem Quellenregister) und `kapitel` (Kitāb/Bāb/Faṣl in Umschrift, von Menschen lesbar)
     - `ausgabe` (Druckvorlage laut §3.1)
     - `seite` als Band/Seite der Vorlage (`V01P023`–`V01P026`, Hinweis „±1, am Druck prüfen“)
     - `passage` (`quduri.ms0007`) und `fundstelle` = OpenITI-Version-URI mit Meilenstein
       (`0428AbuHusaynQuduri.Mukhtasar.Sham19Y0124336-ara1 ms7`)
     - `passageSha256Text`
   - Der **Zitatbereich** bezieht sich auf den bereinigten Passagentext (UTF-16-Versatz `[von, bis)`), nicht auf die
     Rohdatei. So hängt er nicht am Markup.
   - Der lokale Prüfer in L6 vergleicht `sha256Text` und den Bereich. Im CI laufen nur Formalien.
   - Das Werkzeug liefert dafür alles außer dem Bereichs-Prüfer. Der Prüfer kommt in L6 als
     `openiti-passagen.mjs beleg-pruefe`.
2. **ADR 0045 Nr. 12, `web/daten/hanafi-quellen/QUELLE.md`:**
   - Ins Repository kommen nur Metadaten:
     - Release 2025.1.9 mit DOI
     - je Werk Version-URI, Status, Druckvorlage, Bytes und SHA-256 der Datei (§3.1)
     - Werkzeug-Version und -SHA
     - die SHA-256 der beiden TSV je Werk als Prüfwert des Index (deterministisch für Werkzeug 1.1.0; Werte im Anhang)
   - Kein Text, keine Titel in arabischer Schrift, keine Passagen.
   - Die Datei schreibt der Orchestrator in L6; sie ist nicht Teil dieses Spikes.
3. **ADR 0045 Nr. 12 / LM-33, Marāqī al-Falāḥ:**
   - Der Weg über die Ḥāshiya ist digital nicht gangbar (§3.7 Nr. 1).
   - **Standard:** Marāqī bleibt als eigene Beleg-Quelle zurückgestellt (KERN §2.4, PLAN §5.2), bis LM-33 entschieden ist.
     ʿIbādāt-Aussagen stützen sich auf Nūr al-Īḍāḥ (Vorlage 1985, frei), Qudūrī und Radd al-Muḥtār. Damit sind Taharah und
     Salah vollständig belegbar (§3.5).
   - **Vorschlag an LM-33/LM-04:**
     - Marāqī als Beleg-Quelle mit Fundstelle in der Vorlage von 2005 zulassen. Ausgeliefert werden nur sinngemäße deutsche
       Aussagen, und das Editionsrecht nach § 70 betrifft den Wortlaut der Ausgabe (Lizenzbericht §3). Arabische
       Matn-Stellen blieben weiter ausgeschlossen.
     - Einen Scan von Būlāq 1318 nur dann beschaffen, wenn doch Wortlaut gezeigt werden soll.
   - Gleiche Überlegung für al-Hidāya (Vorlage ohne Jahr).
4. **ADR 0045 Nr. 12, Ḥāshiyat aṭ-Ṭaḥṭāwī:**
   - Die Ḥāshiya steht nicht in KERN §2.4.
   - **Standard:** keine eigene Beleg-Quelle. Lokal dient sie nur als Arbeitstext für Menschen (Seiten 1–489 der Vorlage
     Būlāq 1900).
   - Aufnahme in den Quellenkreis nur durch LM-04.
5. **KERN §2.4 / ADR 0040 Nr. 4, Takmila in Radd al-Muḥtār:**
   - Der Teil ab Kitāb ash-Shahādāt in Bd. 7 bis Bd. 8 (ms6837–8443) gilt als eigenes Werk („Takmilat Radd al-Muḥtār“,
     anderer Verfasser).
   - **Standard:** Das Quellenregister führt Radd mit dem Bereich ms1–6764. Der Vorspann von Bd. 7 (ms6765–6837) wird nicht
     zitiert, bis Menschen ihn am Druck zugeordnet haben (LM-33).
   - Damit entfallen bis dahin sieben der neun Uṣūl-Maṭālib (§3.5). Für Lehrplanthemen gibt es dort sonst nur Einzelstellen.
6. **PLAN §5.2 / LM-04, Module ohne Quelle unter den benannten Werken:**
   - **Kalender:** aus den Kalender-Stellen in Ṣalāh, Ṣawm und Ḥajj entwerfen (Nebenthema `taqwim`). Keine neue Quelle
     nötig.
   - **Ethik und Adab:** **Standard:** nur aus Kitāb al-Karāhiya (Hidāya, Ikhtiyār) bzw. al-Ḥaẓr wa-l-Ibāḥa (Radd, Qudūrī)
     und den Ādāb-Abschnitten der ʿIbādāt. Ein eigenes Adab-Werk nur durch LM-04.
   - **Prophetenbiografie / Siyar und Geschichte (3 Einheiten):** In den benannten Werken gibt es keine Quelle.
     **Standard:** zurückgestellt; kein Entwurf, bis Menschen ein Werk benennen (LM-04). Nach KERN §2.2 Nr. 5 gibt es keine
     Belege aus dem Gedächtnis und keine Quellen außerhalb der benannten Werke.
   - **Grundwissen Koran/Hadith/Fiqh (2 Einheiten):** **Standard:** Fiqh-Grundlagen nur aus den Ijtihād- und Muftī-Maṭālib
     in Radd Bd. 1–6 (2 Haupt-, 7 Nebenthemen). Koran- und Hadith-Grundwissen ist zurückgestellt (LM-04).
   - **Glaube:** **Standard:** 3 Einheiten aus Fiqh Akbar und Ṭaḥāwiyya; die Nasafiyya ist zurückgestellt (L0-E15).
     Kommentare in OCR-Fassung (Minaḥ ar-Rawḍ, at-Turkistānī, Abū l-Muʿīn an-Nasafī) nur nach LM-04 und nur mit Prüfung am Druck.
   - **Folge für PLAN §5.2:** Von 28 Einheiten sind 23 aus den benannten Werken belegbar:
     - Akaid 3, Taharah 3, Salah 5, Sawm 2, Zakat 2, Hajj 2
     - Halal/Haram und Alltag 3, Akhlaq/Adab 3 über Karāhiya
   - Grundwissen (2) ist nur teilweise belegbar; Siyar (3) ist zurückgestellt.
7. **ADR 0040 Nr. 5 / LM-04, was Prüfende sehen:**
   - Standard bleibt: keine arabische Passage, nur die Fundstelle.
   - Mit Band/Seite der Vorlage im Index kann die Fundstelle so aussehen: „Werk, Kitāb/Bāb, Ausgabe, Bd./S. (±1), OpenITI-URI
     ms…“. Prüfende finden die Stelle damit im eigenen Druck, sofern es dieselbe Ausgabe ist; sonst über Kitāb/Bāb.
8. **ADR 0040 Nr. 4, Unterthemen der Ṭaḥāwiyya:**
   - Die 105 Absätze bekommen ihr Unterthema über eine Korrekturdatei (`--korrektur`, lokal).
   - Den Vorschlag darf der Entwurfs-Agent machen. Es ist eine Ordnung der Passagen, kein religiöser Inhalt. Fachlich gilt er
     erst mit der Prüfung der Aussagen.
9. **ADR 0045, Werkzeug-Ablage:**
   - Werkzeug und Probe unter `_lernapp/werkzeuge/quellen/` versionieren; beide sind frei von arabischer Schrift.
   - Den Unit-Test in den Tor-Lauf L0/L6 aufnehmen (`node --test _lernapp/werkzeuge/quellen/openiti-passagen.test.mjs`).
     *Berichtigt in der Gegenprüfung vom 20.10.2026:* Mit dem Verzeichnis als Argument (`node --test
     _lernapp/werkzeuge/quellen/`) bricht Node 24.21.0 mit `MODULE_NOT_FOUND` ab, der Lauf ist rot; die Testdatei selbst ist
     grün (28/28).
   - OpenITI-Dateien und Index nie versionieren. Das Werkzeug erzwingt das für Ein- und Ausgabe.

## 5. Risiken

| # | Risiko | Einschätzung | Gegenmaßnahme |
|---|---|---|---|
| 1 | Seitenangabe weicht um eine Seite ab (Konvention der Marke; Sham19Y-Randseite) | gering | Hinweis „±1“ im Beleg; Prüfende prüfen am Druck über Kitāb/Bāb |
| 2 | Zuordnung über Titelwörter verfehlt Unterkapitel mit untypischem Titel | mittel bei Radd (1.764 Maṭālib) | Erben vom Oberkapitel; Nebenthemen; Korrekturdatei; Belegprüfung durch frischen Agenten und Menschen (PLAN §6.7 Nr. 5–6) |
| 3 | Maschinelle Umschrift ohne Vokale ist ungenau | gering (nur Orientierung) | Kapitelangaben im Beleg von Hand umschreiben; die TSV-Umschrift nie ausliefern |
| 4 | Die Takmila oder der Vorspann von Bd. 7 wird als Radd zitiert; Kapitelpfad im Vorspann falsch (an Bāb al-Makhārij gehängt) | gering | Bereich ms1–6764 im Register (Vorschlag 5); in L6 die Korrekturdatei um das Umhängen von Kapiteln erweitern oder den Bereich sperren |
| 5 | In Kommentarwerken steht oben auf der Seite der Matn (Seitenkopf-Spans) mitten im Sharḥ der Passage; ein Agent könnte Matn und Sharḥ verwechseln | mittel | Bei Entwürfen aus Marāqī oder Ikhtiyār Matn-Spans kennzeichnen (Erweiterung in L6) oder für Matn-Aussagen die Matn-Datei (Nūr al-Īḍāḥ, Qudūrī) nehmen |
| 6 | OpenITI-Version ändert sich (neues Release) | gering | Datei-SHA pinnen; `index --sha256` und `pruefe` brechen bei Abweichung ab |
| 7 | Lizenz: Index-JSON enthält arabische Titel; ein Kopieren ins Repository verletzte CC BY-NC-SA und die Religion-Regel | gering | Das Werkzeug verweigert Ausgabe im Repository; ins Repository nur Kennungen und SHA (Vorschlag 2) |
| 8 | Glaube und Sīra sind dünn belegt, Erwartungen an 28 Einheiten | mittel | Vorschlag 6; Entscheidung LM-04 |
| 9 | Downloads nicht vertrauenswürdig | gering | eigene Ordner, Python `-I`, Werkzeug liest nur Text mit Regex ohne Ausführung; CRC/SHA gegen das Release |

## 6. Aufräumen

- Gelöscht:
  - veraltete Zusammenfassungen von 1.0.0 in `$SP/tmp/` und `tmp/testtmp/`
  - zwei Zwischenstände `index-neu/`, nach dem Vergleich ersetzt
  - die 64-KiB-Probe `dl/eocd/`
- Behalten für L6: `$SP/dl/` (texte 34 MB, meta 23 MB), `$SP/index/` (13 MB), `$SP/skripte/`, `$SP/tmp/` (Zählungen). Das sind
  zusammen 68 MB.
  - Löschbar ist `dl/meta/zentralverzeichnis.bin` (11 MB), wenn keine weiteren Werke geholt werden. Für einen Nachzug
    (Nasafiyya-Ersatz, Kommentare) spart der Cache den Abruf des Zentralverzeichnisses.
- Platte: 4,4 GB frei nach dem Lauf (`df -h /`).
- Gestartete Server: keine.

## 7. Dateien

- Repository (in diesem Lauf nicht committet). Werkzeug 1.0.0 und Probe hat der Orchestrator als ZWISCHENSTAND 8c7f5b3
  committet; die Änderungen zu 1.1.0 liegen uncommittet im Arbeitsbaum (+85/−11 Zeilen). Der Beleg ist unversioniert.
  - `/home/user/IGMG/_lernapp/werkzeuge/quellen/openiti-passagen.mjs` (1.1.0)
  - `/home/user/IGMG/_lernapp/werkzeuge/quellen/openiti-passagen.test.mjs`
  - `/home/user/IGMG/_lernapp/belege/S8-quellen-lokal.md` (dieser Beleg)
- Scratchpad (nur lokal, CC BY-NC-SA):
  - `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/l0/S8/index/<werk>.passagen.json|.passagen.tsv|.zuordnung.tsv`
  - `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/l0/S8/tmp/abdeckung.md`
  - `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/l0/S8/skripte/alle.sh`

## Anhang: SHA-256 der Index-TSV (Werkzeug 1.1.0, 17.10.2026)

Die Werte sind deterministisch: gleiche Datei und gleiche Werkzeug-Version ergeben dieselben Werte (§3.8). Das JSON enthält
Zeitstempel und Pfad und ist deshalb kein Prüfwert.

| Datei | SHA-256 |
|---|---|
| `fiqh-akbar.passagen.tsv` | `6fb4aa4fb58181c0360b6f2970e678d1d2df5f5653d39ec17bc84646883bbb78` |
| `fiqh-akbar.zuordnung.tsv` | `e2832c3fcde145859274a47b22b708e658cfa790ca46dda902689e023605a28f` |
| `hashiyat-at-tahtawi.passagen.tsv` | `7f7492dd56b2cc90ba351f903ef0d2ea9918e3b36f852aca4146047a389a3edd` |
| `hashiyat-at-tahtawi.zuordnung.tsv` | `8c813638cb913b7f34547cceba013dce24f0db94ea40d8e9ac00aeca7a7034f8` |
| `hidaya.passagen.tsv` | `100167b8e55597f7da4422e005ce67e9f6fc3c3f3a20eaff7cb6c428fda8ec23` |
| `hidaya.zuordnung.tsv` | `e153cb0fbd675a0b24f61679861ee6b7923947b78394475bc63123150048f962` |
| `ikhtiyar.passagen.tsv` | `0bf919fd29943f60dd67c1316944ebe35b96167a085b986493b4c3d080196857` |
| `ikhtiyar.zuordnung.tsv` | `5b6a7d6aa11bc4002df7e40dea075cf951e702c89c506c99fb895fed50e9de38` |
| `maraqi-al-falah.passagen.tsv` | `f093c26c3507fc2e1f5b41a1937c708ade5813d8c8e616b63409a7af44a6ddba` |
| `maraqi-al-falah.zuordnung.tsv` | `41d011cef805fc2c73e21a32c1ff207f4ebbb84b24048c7b73198c922d001657` |
| `nur-al-idah.passagen.tsv` | `ad142a2424b908a29d9e64cef836aa1da1f46fb82ec1bd67050a1dd5d2378522` |
| `nur-al-idah.zuordnung.tsv` | `a7946cb9a944e62abd4762ab9f50f7048080a854d8654d6bc34638304590073a` |
| `quduri.passagen.tsv` | `617a03440e2ea5a7917e50ee5d55b799ff87567184cf3f240c362ec26e2f85e5` |
| `quduri.zuordnung.tsv` | `eaa5b9a4bf11f2cec8e760c7dc8da39ff5999ed37b880000a17aa9d8e318791f` |
| `radd-al-muhtar.passagen.tsv` | `6e033a5128194018c996d78ab7aaf693e81b3daa6ab0b513c287d0cc8923c3c4` |
| `radd-al-muhtar.zuordnung.tsv` | `fb69cd87c08ba4562468979513a904ac1f07384c6eb14e00a506adfc3f6df786` |
| `tahawiyya.passagen.tsv` | `12a421aefabda512fa4cf9e85d619efd3e665d2d3cb2d2fe41002a04eee62064` |
| `tahawiyya.zuordnung.tsv` | `bdf90266740d7d295b4a844e50b79c607902ee9407aeb441c5bc908943535e54` |
