<!-- Lizenzprüfung L0 (Workflow wf_cf9ab8d3-fce, 16.10.2026). Arabische Schrift entfernt. -->

# Lern-App L0 – Lizenzprüfung Bereich „Sprachdaten“

Stand der Recherche: 16.10.2026. Geprüft wurden Primärquellen (Lizenzdateien, README, Nutzungsbedingungen, Export-Skripte, Downloadverzeichnisse). Wo eine Primärquelle technisch gesperrt war (Cloudflare/Anubis), ist das ausdrücklich vermerkt.

Rahmen: öffentliche, kostenlose, werbefreie Lern-App der IGMG Wetzlar (gemeinnützig), ausgeliefert über Vercel, Inhalte und Audio werden angezeigt **und offline auf Geräten gespeichert**. Erlaubt für Daten: CC0, CC BY, CC BY-SA (mit Kennzeichnung). NC-Lizenzen sind problematisch. Lokale Werkzeuge (nicht ausgeliefert) dürfen auch GPL/LGPL sein.

## Kurzfazit

| Posten | Lizenz | Eignung |
|---|---|---|
| Tatoeba – Sätze | CC BY 2.0 FR (Standard), CC0 1.0 (Teilmenge) | **mit Auflagen** |
| Tatoeba – Audio CC BY 4.0 / CC BY-SA 4.0 / CC0 | je Sprecher | **mit Auflagen** (nur Deutsch, 5.334 Dateien) |
| Tatoeba – Audio CC BY-NC 4.0 / CC BY-NC-ND 3.0 / ohne Lizenz | je Sprecher | **nein** |
| kaikki.org / Wiktextract (Wiktionary-Auszüge) | CC BY-SA 4.0 (wahlweise GFDL) | **mit Auflagen** |
| Wikimedia-Commons-Audio (aus Wiktextract „sounds“) | je Datei | **mit Auflagen** (Einzelprüfung) |
| FrequencyWords (hermitdave) | Code MIT, Inhalt CC BY-SA 4.0 | **mit Auflagen** |
| wordfreq 3.1.1 | Code Apache-2.0, Daten CC BY-SA 4.0 | **mit Auflagen** |
| CAMeL Arabic Frequency Lists v1.0 | CC BY-SA 4.0 | **mit Auflagen** |
| OpenSubtitles (OPUS v2018/v2024) | keine Lizenz | **nein** |
| GER/CEFR Begleitband 2020 (engl., Europarat) | © Europarat, Auszüge ≤ 500 Wörter nicht-kommerziell | **mit Auflagen** (nur Stufen + eigene Formulierungen) |
| GER Begleitband, deutsche Ausgabe (Klett 2020) | © Europarat / © Goethe-Institut | **nein** |
| Profile deutsch (Klett) | Verlagswerk, keine freie Lizenz | **nein** |
| KELLY-Liste Arabisch (Leeds) | CC BY-NC-SA 2.0 | **nein** |
| Leipzig Corpora Collection | laut Nutzungsbedingungen CC BY (Downloads) | **unklar** (Primärquelle gesperrt) |
| TS Corpus Word List (Türkisch) | Repository-Etikett „MIT“ | **unklar** |
| Zargan Linguistic Resources (Türkisch) | „Creative Commons“ ohne Variante, Link tot | **unklar** |
| SUBTLEX-DE (direkt) | CC BY-NC-ND 3.0 | **nein** |
| DeReWo (IDS Mannheim) | CC BY-NC-ND 3.0 DE, „keine Freeware“ | **nein** |
| A Frequency Dictionary of Arabic (Routledge) | Verlagswerk | **nein** |
| wikipedia-word-frequency (IlyaSemenov) | Code MIT, Daten aus Wikipedia | **mit Auflagen** (nur de/ar, kein tr) |
| OpenMoji 17.0.0 | Grafiken CC BY-SA 4.0 (Code LGPL-3.0) | **mit Auflagen** |
| Tabler Icons 3.49.0 | MIT | **ja** (MIT-Hinweis mitliefern) |

**Wichtigste Folgen für L1–L6**

1. Wer Wiktionary-, wordfreq-, FrequencyWords-, CAMeL- oder OpenMoji-Material in die Wortschatz-Datenbank übernimmt, erzeugt **bearbeitetes Material unter CC BY-SA 4.0**. Die ausgelieferte Wortschatz-Datenbank (und abgewandelte Bilder) muss dann selbst unter CC BY-SA 4.0 stehen; eigene Übungstexte können getrennt lizenziert bleiben, solange sie nur zusammengestellt und nicht verschmolzen werden. Empfehlung: Lerninhalte insgesamt unter CC BY-SA 4.0 veröffentlichen (Entscheidung für ENTSCHEIDUNGEN/ADR).
2. CC BY-SA 4.0 Abschnitt 2(a)(5)(C)/3(b) verbietet „Effective Technological Measures“, die die Nutzung beschränken. Offline-Speicherung (IndexedDB/Cache) ist unproblematisch, eine Verschlüsselung gegen Auslesen der CC-BY-SA-Daten wäre es nicht.
3. Die Namensnennungen müssen **auch offline** erreichbar sein: Quellenseite und Kurzquellen je Satz/Audio/Wort gehören ins Offline-Paket.
4. **Audio:** Tatoeba liefert frei nutzbares Audio nur für Deutsch (5.334 Aufnahmen CC BY 4.0, zwei Sprecher). Für Türkisch und Arabisch gibt es bei Tatoeba **kein** frei lizenziertes Audio. Audio für tr/ar muss aus Wikimedia Commons (Einzelprüfung) kommen oder selbst aufgenommen werden (Gemeindemitglieder mit schriftlicher Einwilligung und Lizenz CC BY 4.0 oder CC0).
5. NC-Material (KELLY-Arabisch, Tatoeba-Audio BY-NC/BY-NC-ND, SUBTLEX-DE, DeReWo) nicht verwenden. Begründung siehe Abschnitt „NC-Bewertung“.

---

## 1. Tatoeba – Sätze

- **Stand:** Wochenexport vom 10.10.2026 (Exporte jeden Samstag 06:30 UTC).
- **Primärquellen:** https://tatoeba.org/en/downloads · https://tatoeba.org/en/terms_of_use (in Kraft seit 24.04.2022) · Export-SQL https://github.com/Tatoeba/tatoeba2/blob/dev/docs/database/scripts/weekly_exports.sql · Lizenzliste https://github.com/Tatoeba/tatoeba2/blob/dev/src/Lib/Licenses.php
- **Lizenz (wörtlich):** „These files are released under CC BY 2.0 FR.“ – „A part of our sentences are also available under CC0 1.0.“ Nutzungsbedingungen 6.2: „Tatoeba's technical infrastructure uses the default Creative Commons Attribution 2.0 France license (CC-BY 2.0 FR) for the use of textual sentences.“
- **Lizenz je Satz:** Die Massenexporte (`sentences.csv`, `sentences_detailed.csv`, per Sprache `xxx_sentences_detailed.tsv.bz2`) haben **keine Lizenzspalte**. Die Lizenz ergibt sich so:
  - Satz steht in `sentences_CC0.csv` bzw. `xxx_sentences_CC0.tsv.bz2` → CC0 1.0,
  - sonst → CC BY 2.0 FR.
  - Sätze mit „Licensing issue“ (Lizenzfeld leer) und als falsch markierte Sätze sind ausgeschlossen: Export-SQL `WHERE correctness > -1 AND license != ''`.
  - Die API (https://api.tatoeba.org/v1/sentences) liefert je Satz ein Feld `license` (z. B. `"license": "CC BY 2.0 FR"`) sowie `owner` und `is_unapproved`.
- **Mengen (Export 10.10.2026):**

  | Sprache | Sätze | davon CC0 | Mitwirkende | Sätze ohne Benutzername |
  |---|---|---|---|---|
  | Deutsch (deu) | 783.551 | 46 | 1.745 | 108 |
  | Türkisch (tur) | 749.693 | 0 (keine CC0-Datei) | 1.061 | 971 |
  | Arabisch (ara) | 68.575 | 2 | 555 | 454 |

  Direkte Übersetzungsverknüpfungen: deu–tur 22.326, deu–ara 2.974, tur–ara 2.408 (`per_language/deu/deu-tur_links.tsv.bz2` usw.).
- **Downloadformate:** TSV (tabulatorgetrennt), `.tar.bz2` gesamt oder `.tsv.bz2` je Sprache; Spalten `sentences_detailed`: Satz-ID, Sprache, Text, Benutzername, Datum angelegt, Datum geändert. Weitere: `links`, `tags`, `sentences_in_lists`, `users_sentences` (Bewertungen −1/0/1, „experimental“), `transcriptions`.
- **Bedingungen:** Namensnennung je Satz (Urheber = Benutzername), Lizenz-URI mitgeben (CC BY 2.0 Abschnitt 4(a)), bei Veränderungen (z. B. Lückentext, Korrektur) Veränderung kenntlich machen. **Kein ShareAlike.** Jede Übersetzung ist ein eigener Satz mit eigenem Urheber – beide Seiten nennen.
  - Vorschlag Kurzquelle: „Satz #{id} von {Benutzername}, Tatoeba (https://tatoeba.org/de/sentences/show/{id}), CC BY 2.0 FR (https://creativecommons.org/licenses/by/2.0/fr/)“; ohne Benutzername: „Tatoeba-Mitwirkende“.
- **Eignung: mit Auflagen.**
- **Begründung:** Lizenz passt (CC BY, CC0). Auflagen: Namensnennung je Satz offline verfügbar; Lizenzableitung über CC0-Datei bzw. API; Inhalte redaktionell prüfen (Nutzerbeiträge, Qualität schwankend, `is_unapproved`, Bewertungen; Themen wie Alkohol, Beziehungen, Gewalt für Gemeinde-App filtern); Arabisch und tr–ar sind dünn besetzt.
- **Offen:** Der Benutzername im Export ist der aktuelle Besitzer („adoptierte“ Sätze) – reicht das als Urheberangabe? Pragmatisch ja (Tatoeba nennt selbst so), Restrisiko gering.

## 2. Tatoeba – Audio (je Sprecher)

- **Stand:** Export 10.10.2026, `sentences_with_audio.tar.bz2` und `per_language/xxx/xxx_sentences_with_audio.tsv.bz2`.
- **Primärquellen:** https://tatoeba.org/en/downloads · `Licenses.php` (s. o.)
- **Lizenz (wörtlich):** „The license covering an audio file is chosen by the contributor.“ – „If the license field is empty, you may not reuse the audio outside the Tatoeba project.“ Zulässige Werte laut Quellcode: `''` („No license for offsite use“), `CC0 1.0`, `CC BY 4.0`, `CC BY-NC 4.0`, `CC BY-SA 4.0`, `CC BY-NC-ND 3.0`. Nutzungsbedingungen 6.3: Lizenz gilt „for all the audio contributions of the same contributor“.
- **Format:** Spalten Satz-ID, Audio-ID, Benutzername, Lizenz, Attribution-URL; Download einzeln über `https://tatoeba.org/audio/download/{audio-id}` → `audio/mpeg` (MP3), z. B. `139400-745032.mp3`.
- **Verteilung (gesamt 1.241.052 Aufnahmen):** CC BY-NC-ND 3.0 949.820 · CC BY-NC 4.0 169.890 · leer 74.040 · CC BY 4.0 38.878 · CC BY-SA 4.0 6.424 · `\N` 1.368 · CC0 1.0 632.
- **Je Zielsprache:**

  | Sprache | Aufnahmen | CC BY 4.0 | CC BY-NC 4.0 | ohne Lizenz |
  |---|---|---|---|---|
  | Deutsch | 32.941 | **5.334** (MisterTrouser 3.557, Yeti 1.777) | 11.262 (driini, gretelen, moskytoo, peschiber) | 16.345 (mramosch, Oblomov, BraveSentry, quicksanddiver, MUIRIEL, N0ps32) |
  | Türkisch | 1.152 | **0** | 323 (languagelerner) | 829 (futurk, CVTR, pinari, civiricus, janTuki) |
  | Arabisch | 483 | **0** | 0 | 483 (elmassoudi) |

  Nur 299 deutsche Sätze mit freiem Audio haben eine direkte türkische Übersetzung, 52 eine arabische.
- **Bedingungen (CC BY 4.0 / CC BY-SA 4.0):** Name des Sprechers, Hinweis auf Lizenz mit Link, Link auf Attribution-URL, Veränderungen kennzeichnen (Schnitt, Lautstärke). Bei CC BY-SA 4.0 zusätzlich ShareAlike für bearbeitete Aufnahmen.
  - Vorschlag: „Aufnahme #{audio-id} von {Benutzername} ({Attribution-URL}), Tatoeba, CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)“.
- **Eignung:** CC BY 4.0, CC BY-SA 4.0, CC0 → **mit Auflagen**; CC BY-NC 4.0, CC BY-NC-ND 3.0, leer, `\N` → **nein**.
- **Begründung:** Für Deutsch ergibt sich ein kleiner, sauber nutzbarer Bestand. Für Türkisch und Arabisch ist Tatoeba als Audioquelle wertlos. Da Sprecher ihre Lizenz ändern können, Lizenz je Datei zum Abrufzeitpunkt mit Datum speichern und bei jedem Import neu abgleichen.

## 3. kaikki.org / Wiktextract (Wiktionary-Auszüge Deutsch/Türkisch/Arabisch)

- **Stand:** Extraktion 03.10.2026 aus dem enwiktionary-Dump vom 02.09.2026, Wiktextract-Commits 1a05e46/e3d6d4e. Weitere Ausgaben: `de-extract.jsonl.gz` (de.wiktionary, 294,3 MB komprimiert), `tr-extract.jsonl.gz` (tr.wiktionary, 42,0 MB). Eine ar.wiktionary-Extraktion gibt es nicht; Arabisch nur aus en.wiktionary (59.484 Wortformen) sowie über Übersetzungen in de.wiktionary.
- **Primärquellen:** https://kaikki.org/dictionary/rawdata.html · https://kaikki.org/dictionary/German/index.html · …/Turkish/… · …/Arabic/… · https://github.com/tatuylonen/wiktextract (README „License“) · Wikimedia-Nutzungsbedingungen https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use (in Kraft seit 07.06.2023)
- **Lizenz (wörtlich):** kaikki.org selbst nennt **keine** Lizenz, nur: „Linking to the relevant page(s) under https://kaikki.org would also be greatly appreciated.“ und Zitierwunsch (Ylonen, LREC 2022). Wiktextract-Code: „It is licensed under the MIT license.“; Wiktionary-Material dort: „Wiktionary license (CC-BY-SA or GFDL at your choice)“. Wikimedia-ToU 7: Beiträge unter CC BY-SA 4.0 und GFDL, „Reusers may comply with either license or both.“ Fußzeile de.wiktionary: CC BY-SA 4.0, „zusätzliche Bedingungen können gelten“.
- **Bedingungen:** CC BY-SA 4.0 wählen (GFDL ist praktisch untauglich: vollständiger Lizenztext und Versionsgeschichte nötig). Namensnennung über Link auf die Wiktionary-Seite (laut ToU zulässig), Lizenzhinweis, Hinweis auf Veränderung. **ShareAlike:** Wortschatz-Datenbank mit übernommenen Bedeutungen, Übersetzungen, Flexionstabellen wird CC BY-SA 4.0.
  - Vorschlag: „Wörterbuchdaten nach Wiktionary, Artikel ‚{Lemma}‘ (https://de.wiktionary.org/wiki/{Lemma}), Autorinnen und Autoren siehe Versionsgeschichte; extrahiert mit Wiktextract (Tatu Ylonen) über kaikki.org; gekürzt und umformatiert; Lizenz CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/deed.de).“
- **Eignung: mit Auflagen.**
- **Begründung:** Lizenz ist zulässig (CC BY-SA mit Kennzeichnung). Auflagen:
  - ShareAlike gilt für die Wortschatz-Datenbank.
  - **Beispielsätze mit Quellenangabe nicht übernehmen.** Stichprobe aus `de-extract.jsonl` (5.957 Einträge): 8.366 von 17.746 Beispielen tragen ein Feld `ref` (z. B. Zitate aus Zeitungsinterviews). Diese stehen in Wiktionary unter dem Zitatrecht und nicht automatisch unter CC BY-SA; außerhalb des Wörterbuchzusammenhangs ist das Zitatrecht fraglich. Nur Beispiele ohne `ref` verwenden oder eigene Sätze schreiben.
  - Wiktextract (MIT) läuft nur lokal. Qualität und Vollständigkeit der Übersetzungen (tr, ar) redaktionell prüfen.
- **Offen:** Bei Inhalten, die nur unter CC BY-SA 3.0 importiert wurden, gilt ebenfalls BY-SA. Das ist mit 4.0 vereinbar, weil Bearbeitungen unter einer späteren Version lizenziert werden dürfen. Einzelfälle mit Sonderhinweis auf der Diskussionsseite sind nicht automatisiert prüfbar – Restrisiko gering.

## 4. Wikimedia-Commons-Audio (über Wiktextract „sounds“)

- **Stand:** laufend. In der Stichprobe hatten 5.369 von 5.957 Einträgen Tonverweise.
- **Primärquelle:** Beschreibungsseite je Datei; maschinell über die Commons-API `action=query&prop=imageinfo&iiprop=extmetadata` (Felder `LicenseShortName`, `Artist`, `AttributionRequired`). Beispiel: `File:De-Haus.ogg` → „CC BY-SA 3.0“, Urheber „Kampy“.
- **Lizenz:** je Datei unterschiedlich (meist CC BY-SA 3.0/4.0, CC BY, CC0; Lingua-Libre-Aufnahmen meist CC BY-SA 4.0).
- **Bedingungen:** Urheber, Lizenz und Link je Datei. Bei BY-SA gilt ShareAlike für bearbeitete Fassungen (Schnitt, Umkodierung zur Normalisierung ist technisch notwendig und unschädlich).
- **Eignung: mit Auflagen.** Nur Dateien mit CC0, CC BY oder CC BY-SA übernehmen. Lizenz und Urheber beim Import automatisch auslesen und speichern, alles andere verwerfen. Das ist die beste freie Quelle für türkisches und arabisches Wortaudio.

## 5. FrequencyWords (hermitdave)

- **Stand:** Listen `content/2018/{de,tr,ar}/{xx}_50k.txt` und `_full.txt` (alle drei vorhanden); Grundlage OpenSubtitles2018 (OPUS).
- **Primärquelle:** https://github.com/hermitdave/FrequencyWords (README, LICENSE)
- **Lizenz (wörtlich):** „MIT License for code. CC-by-sa-4.0 for content.“ (LICENSE-Datei: MIT, „Copyright (c) 2016 Hermit Dave“)
- **Bedingungen:** Namensnennung, Lizenz, Veränderungshinweis. ShareAlike für abgeleitete Listen bzw. für die Datenbank, die einen wesentlichen Teil übernimmt (CC BY-SA 4.0 Abschnitt 4 deckt auch das Sui-generis-Datenbankrecht ab).
  - Vorschlag: „Häufigkeitsdaten: FrequencyWords von Hermit Dave (https://github.com/hermitdave/FrequencyWords), CC BY-SA 4.0, auf Grundlage von OpenSubtitles2018 (http://www.opensubtitles.org/, über OPUS); gefiltert und gekürzt.“
- **Eignung: mit Auflagen.**
- **Begründung:** Lizenz zulässig. Die Liste enthält nur Wörter mit Zählwerten, keine Untertiteltexte. Die Herkunft aus OpenSubtitles ist lizenzrechtlich ungeklärt (siehe Nr. 8), für reine Häufigkeitszahlen ist das Risiko aber gering. Auflagen: Schimpfwörter und unpassende Wörter filtern (Untertitelsprache), keine Lemmatisierung vorhanden (Wortformen), nur als Hilfe zur Auswahl.

## 6. wordfreq

- **Stand:** 3.1.1 (PyPI, 21.11.2023). Daten eingefroren: „The word frequencies are a snapshot of language usage through about 2021 … the data is unlikely to be updated again.“ Abdeckung: ar (5 Quellen), de (7), tr (4).
- **Primärquelle:** https://github.com/rspeer/wordfreq (README „License“)
- **Lizenz (wörtlich):** „`wordfreq` is freely redistributable under the Apache license … and it includes data files that may be redistributed under a Creative Commons Attribution-ShareAlike 4.0 license“. Zusatzbedingungen für SUBTLEX: „Wordfreq and code derived from it must credit the SUBTLEX authors.“ – „It must remain clear that SUBTLEX is freely available data.“ OpenSubtitles-Daten: „may be used with attribution to OpenSubtitles“. Google Books Ngrams: „acknowledgement … would be appreciated“.
- **Bedingungen:** CC BY-SA 4.0 (ShareAlike wie Nr. 5) und Nennung der Unterquellen.
  - Vorschlag: „Häufigkeitsdaten: wordfreq von Robyn Speer (https://github.com/rspeer/wordfreq, DOI 10.5281/zenodo.7199437), CC BY-SA 4.0; enthält Daten aus SUBTLEX (Brysbaert u. a., frei verfügbare Daten), OpenSubtitles (http://www.opensubtitles.org/), Google Books Ngrams, Wikipedia, Leeds Internet Corpus und ParaCrawl; gefiltert und gekürzt.“
- **Eignung: mit Auflagen.**
- **Begründung:** Code (Apache-2.0) läuft nur lokal beim Erzeugen, Daten unter CC BY-SA zulässig. Der Autor rät vom Umwandeln in CSV ab, weil dabei Namensnennung verloren gehe; unsere abgeleitete Liste muss deshalb Lizenz und Quellen mitführen. Daten nur bis 2021, gute erste Wahl für Rangfolgen in allen drei Sprachen.

## 7. CAMeL Arabic Frequency Lists (Arabisch)

- **Stand:** v1.0 (2021), Dateien `MSA_freq_lists.tsv.zip`, `CA_freq_lists.tsv.zip` (Klassisches Arabisch, auch für Koran-Arabisch interessant), `DA_…`, `MIX_…`.
- **Primärquelle:** https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists (README, LICENSE.txt)
- **Lizenz (wörtlich):** „The Arabic Frequency Lists files are provided under an Attribution-ShareAlike 4.0 International (CC BY-SA 4.0) License.“ Zitierwunsch: Inoue u. a. 2021 (WANLP).
- **Bedingungen:** Namensnennung, ShareAlike wie Nr. 5.
  - Vorschlag: „Arabische Häufigkeitsdaten: CAMeL Arabic Frequency Lists v1.0 (Khalifa, Inoue, Alhafni, Baimukan, Bouamor, Habash 2021), https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists, CC BY-SA 4.0; gefiltert und lemmatisiert.“
- **Eignung: mit Auflagen.**
- **Begründung:** Freie Lizenz und die beste freie Liste für Hocharabisch (MSA). Es sind Wortformen mit angehängten Klitika, keine Lemmata; Lemmatisierung lokal mit CAMeL Tools (Code MIT, 1.6.0).
- **Offen:** Die Morphologie-Datenbanken von CAMeL Tools haben eigene Lizenzen; sie laufen nur lokal, sind vor Nutzung aber zu prüfen.

## 8. OpenSubtitles (warum nicht)

- **Stand:** OPUS OpenSubtitles v2024 (Release 14.02.2025), v2018. Beispiel de–tr: 42,1 Mio. Satzpaare.
- **Primärquellen:** OPUS-Metadaten https://github.com/Helsinki-NLP/OPUS/blob/main/corpus/OpenSubtitles/info.yaml · OPUS-API. opensubtitles.org-Bedingungen nicht abrufbar (HTTP 403).
- **Lizenz (wörtlich):** keine. info.yaml enthält nur: „IMPORTANT: If you use the OpenSubtitle corpus: Please, add a link to http://www.opensubtitles.org/ to your website and to your reports and publications produced with the data! I promised this when I got the data from the providers of that website!“ sowie einen Zitierwunsch (Lison/Tiedemann 2016). Bei den Releases steht „unknown“ bzw. ein Datum, aber keine Lizenz.
- **Eignung: nein** (als Satz- oder Übersetzungsquelle).
- **Begründung:**
  1. Keine Nutzungslizenz.
  2. Die Untertitel sind von Nutzern hochgeladene Transkripte und Übersetzungen urheberrechtlich geschützter Film- und Seriendialoge. Die Rechte liegen weder bei OPUS noch bei opensubtitles.org.
  3. Die Inhalte passen nicht zu einer Gemeinde-App (Schimpfwörter, Gewalt, Sexualität).
  4. Die Qualität ist schwach: Ausrichtungs- und OCR-Fehler, freie Übersetzungen.
  5. Nur indirekte Nutzung über reine Häufigkeitszählungen (Nr. 5, 6) mit Filter ist vertretbar.

## 9. GER/CEFR – Begleitband 2020 (Europarat, englische Ausgabe)

- **Stand:** „Common European Framework of Reference for Languages: Learning, teaching, assessment – Companion volume“, Council of Europe Publishing, Straßburg 2020, ISBN 978-92-871-8621-8.
- **Primärquelle:** https://rm.coe.int/common-european-framework-of-reference-for-languages-learning-teaching/16809ea0d4. **Abruf gesperrt** (Cloudflare 403, auch Web-Archiv nicht erreichbar). Wortlaut deshalb aus gleichlautenden Impressen anderer Europarats-Bände derselben Reihe (2016 „Developing illustrative descriptors of aspects of mediation“, 2022 „Enriching 21st century language education“); die aserbaidschanische Übersetzung des Begleitbands 2020 enthält dieselbe Klausel.
- **Lizenz (wörtlich, Reihenimpressum):** „The reproduction of extracts (up to 500 words) is authorised, except for commercial purposes as long as the integrity of the text is preserved, the excerpt is not used out of context …“ – Quellenangabe: „© Council of Europe, year of the publication“. Alle anderen Vervielfältigungen und **Übersetzungen** nur mit Genehmigung der Directorate of Communications des Europarats.
- **Bedingungen:** höchstens 500 Wörter, nicht-kommerziell, unverändert, im Zusammenhang, Quellenangabe „© Council of Europe, 2020“. Keine CC-Lizenz, kein Bearbeitungsrecht.
- **Eignung: mit Auflagen.**
- **Begründung:** Die Stufenbezeichnungen A1–C2 und das Konzept der Kann-Beschreibungen sind frei nutzbar (Ideen und Systeme sind nicht geschützt). Die Deskriptoren-Texte selbst sind geschützt: Ein vollständiger Import der Skalen übersteigt 500 Wörter, und eigene Übersetzungen ins Türkische oder Arabische sind Bearbeitungen, die genehmigt werden müssen. Auflage: Eigene „Ich kann …“-Formulierungen schreiben, in eigenen Worten und nicht als Übersetzung der Skalen; Hinweis „orientiert am GER (Europarat 2001/2020)“; wörtliche Zitate nur einzeln, englisch, unter 500 Wörtern insgesamt und mit Quellenangabe. Ob die App „nicht-kommerziell“ ist, siehe NC-Bewertung (wahrscheinlich ja).
- **Offen:** Impressum des PDF selbst prüfen (Browser). Bei Bedarf schriftliche Genehmigung beim Europarat anfragen; auch prüfen, ob es amtliche türkische oder arabische Übersetzungen mit eigener Freigabe gibt.

## 10. GER Begleitband, deutsche Ausgabe

- **Stand:** „Gemeinsamer europäischer Referenzrahmen für Sprachen: lernen, lehren, beurteilen – Begleitband“, Ernst Klett Sprachen, Stuttgart 2020, ISBN 978-3-12-676999-0 (34,00 EUR); Vermerke „© 2020 Council of Europe, Straßburg“ und „© 2020 Goethe-Institut München“ (Übersetzung).
- **Primärquelle:** https://www.klett-sprachen.de/978-3-12-676999-0
- **Lizenz:** Verlagswerk, keine freie Lizenz.
- **Eignung: nein.** Deutsche Deskriptoren nicht übernehmen, nur eigene Formulierungen (siehe Nr. 9).

## 11. Profile deutsch

- **Stand:** Glaboniat, Müller, Rusch, Schmitz, Wertenschlag: „Profile deutsch. Lernzielbestimmungen, Kannbeschreibungen, Kommunikative Mittel“, Klett Sprachen, ISBN 978-3-12-606518-4, Buch + CD-ROM (Windows), 48,00 EUR; frühere Ausgabe Langenscheidt 2005.
- **Primärquelle:** https://www.klett-sprachen.de/profile-deutsch/t-396/9783126065184
- **Lizenz:** keine freie Lizenz (Verlags-AGB).
- **Eignung: nein.**
- **Begründung:** Die Wortschatz- und Grammatiklisten mit Stufenzuordnung sind als Datenbank und Werk geschützt; eine Übernahme in die App ist ausgeschlossen. Als Nachschlagewerk für die eigene Redaktion ist es zulässig, solange keine Listen abgeschrieben werden.

## 12. KELLY-Listen (Arabisch)

- **Stand:** `ar_m3.xls` (University of Leeds, Datei von 2011); KELLY gibt es für ar, zh, en, el, it, no, pl, ru, sv – **nicht für Deutsch oder Türkisch**.
- **Primärquellen:** https://ssharoff.github.io/kelly/ · https://spraakbanken.gu.se/en/resources/kelly
- **Lizenz (wörtlich):** „The lists are available under the CC BY-NC-SA 2.0 license.“ (Leeds; Link auf by-nc-sa/2.0). Die schwedische Liste hat eine andere Lizenz („CC-BY-SA 3.0, LGPL 3.0“ bzw. in der Tabelle „CC-BY-4.0“) und ist hier nicht relevant.
- **Eignung: nein.**
- **Begründung:**
  1. NC-Lizenz (Risiko siehe unten).
  2. Wegen ShareAlike NC-SA müsste alles Abgeleitete ebenfalls NC-SA stehen. Das ist **unvereinbar** mit CC BY-SA 4.0 (Wiktionary, wordfreq, OpenMoji); beides lässt sich nicht in einer Datenbank mischen.
  3. Freier Ersatz: CAMeL-Listen (Nr. 7) und wordfreq ar; die Stufenzuordnung macht die eigene Redaktion.

## 13. Leipzig Corpora Collection (Wortschatz Leipzig)

- **Primärquellen:** https://wortschatz.uni-leipzig.de/en/usage · https://wortschatz.uni-leipzig.de/en/download. **Abruf durch Anubis-Botschutz gesperrt**; Inhalt nur über Suchmaschinen-Auszug und den dänischen Spiegel (sprogressource.digst.govcloud.dk).
- **Lizenz (laut Auszug):** Downloads unter CC BY; Website-Abfragen unter CC BY-NC; Zitierwunsch Goldhahn/Eckart/Quasthoff, LREC 2012.
- **Eignung: unklar.**
- **Begründung:** Wörterlisten (`*-words.txt`) wären mit CC BY gut nutzbar (deu, tur, ara vorhanden). Die Sätze in den Downloads stammen aus Nachrichten und dem Web und dürfen keinesfalls übernommen werden.
- **Offen:** Bedingungen im Browser direkt prüfen und Version je Korpus notieren.

## 14. Türkische Häufigkeitslisten

- **TS Corpus Word List** (Sezer 2021, DOI 10.57672/B6M8-8333, https://data.tscorpus.com/datasets/ts-corpus-word-list): 3.386.314 Wortformen, Etikett „MIT“, Download nur nach Anmeldung, Fußzeile „© 2025 TDD. All rights reserved.“, unklar ob mit Häufigkeiten. **Eignung: unklar.** Lizenztext in der Datei prüfen.
- **Zargan Linguistic Resources for Turkish** (Bilgin 2016): laut LINGUIST List „made available under a Creative Commons license“ ohne Variante; Link http://st2.zargan.com/duyuru/Zargan_Linguistic_Resources_for_Turkish.html liefert 404. **Eignung: unklar / praktisch nein.**
- **Freie Wahl für Türkisch:** wordfreq tr (Nr. 6) und FrequencyWords tr (Nr. 5), beide CC BY-SA 4.0; ggf. Leipzig tur (Nr. 13).

## 15. Weitere geprüfte deutsche und arabische Listen (nicht verwenden)

- **SUBTLEX-DE** (Brysbaert u. a. 2011): laut OSF-Wiki CC BY-NC-ND 3.0 (Sekundärangabe). Direkt **nein**; nur über wordfreq mit dessen Sondererlaubnis nutzbar.
- **DeReWo (IDS Mannheim):** technischer Bericht 2009: „Creative Commons Namensnennung-Nicht kommerziell-Keine Bearbeitung 3.0 Deutschland“; Dokumentation: „Die DEREWO-Wortlisten sind keine ‚Freeware‘, sondern Werke im Sinne des Urheberrechts.“ **Nein.**
- **A Frequency Dictionary of Arabic** (Buckwalter/Parkinson, Routledge, ISBN 978-0-415-44434-7): Verlagswerk. **Nein.**
- **wikipedia-word-frequency** (IlyaSemenov, https://github.com/IlyaSemenov/wikipedia-word-frequency): Code MIT, Daten aus Wikipedia (CC BY-SA 4.0), vorhanden für de und ar, nicht für tr. **Mit Auflagen**, optional als Gegenprobe.

## 16. OpenMoji (Bildkarten)

- **Stand:** 17.0.0 (npm `openmoji`, 23.04.2026), 4.495 Emojis (people-body 2.418, extras-openmoji 405, flags 270, objects 266, symbols 224, travel-places 219, smileys 171, animals-nature 160, extras-unicode 137, food-drink 131, activities 85), darunter 53 Marken-Icons.
- **Primärquelle:** https://github.com/hfg-gmuend/openmoji (README „License“, „Attribution Requirements“) · https://openmoji.org
- **Lizenz (wörtlich):** „OpenMoji graphics are licensed under the Creative Commons Share Alike License 4.0 (CC BY-SA 4.0)“; „Code licensed under the GNU Lesser General Public License v3 (LGPL-3.0)“ (Code wird nicht ausgeliefert).
- **Bedingungen:** Namensnennung, Vorschlag der Urheber (wörtlich): „All emojis designed by OpenMoji – the open-source emoji and icon project. License: CC BY-SA 4.0“ (deutsch: „Alle Emojis gestaltet von OpenMoji – dem Open-Source-Emoji- und Icon-Projekt. Lizenz: CC BY-SA 4.0“, mit Links auf openmoji.org und die Lizenz). Üblicher Ort: Info/Über-Seite oder Fußzeile. **ShareAlike:** Veränderte Grafiken (umgefärbt, kombiniert) stehen unter CC BY-SA 4.0. Ein Emoji neben eigenem Text auf einer Karte ist eine Zusammenstellung, keine Bearbeitung des Textes.
- **Eignung: mit Auflagen.**
- **Begründung:** Lizenz zulässig. Auflagen: Namensnennung (auch offline); eine feste Release-Version einbinden (der master-Zweig ist laut README „in active development“); Marken-Icons (53) ausschließen, weil Markenrecht nicht von CC erfasst ist; Motive für eine Moscheegemeinde redaktionell auswählen (z. B. Alkohol, Schwein, Glücksspiel; Personen- und Tierdarstellungen je nach Haltung der Gemeinde).
- **Offen:** Sollen Lebewesen auf Bildkarten dargestellt werden? Entscheidung der Gemeinde/Redaktion.

## 17. Tabler Icons (Bildkarten/Oberfläche)

- **Stand:** 3.49.0 (npm `@tabler/icons`, 05.10.2026); 6.238 Icons (5.184 outline, 1.054 filled). Für eine feste Bindung mit mindestens zwei Wochen Alter: 3.48.0 (22.09.2026).
- **Primärquelle:** https://github.com/tabler/tabler-icons (LICENSE, README) · https://tabler.io/icons
- **Lizenz (wörtlich):** „MIT License – Copyright (c) 2020-2026 Paweł Kuna – Permission is hereby granted, free of charge, …“; Bedingung: „The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.“
- **Bedingungen:** MIT-Hinweis und Copyright in der Drittlizenz-Seite bzw. im Bundle mitliefern. Kein ShareAlike.
- **Eignung: ja.**
- **Begründung:** Erlaubte Softwarelizenz. Hinweis: „brand-*“-Icons (Firmenlogos) meiden (Markenrecht). Für gegenständliche Vokabelkarten nur begrenzt geeignet (Strich-Icons), eher für Oberfläche und abstrakte Begriffe.

---

## NC-Bewertung („gemeinnützig, kostenlos“ = nicht-kommerziell?)

- **Definition CC 4.0** (Legal Code by-nc 4.0, Abschnitt 1(i)): „NonCommercial means not primarily intended for or directed towards commercial advantage or monetary compensation.“ Maßgeblich ist die **Nutzung**, nicht die Rechtsform des Nutzers.
- **Rechtsprechung Deutschland:** LG Köln, 05.03.2014, 28 O 232/13, legte „nicht-kommerziell“ als „rein privat“ aus (Deutschlandradio verurteilt). OLG Köln, 31.10.2014, 6 U 60/14, hob das insoweit auf: Die werbefreie Nutzung durch Deutschlandradio war **nicht** kommerziell. Verurteilt wurde dennoch, weil das Bild beschnitten und die Namensnennung entfernt worden war.
- **Einschätzung für die Lern-App:** Eine kostenlose, werbefreie App eines gemeinnützigen Vereins ist nach CC-Definition und OLG Köln **wahrscheinlich** nicht-kommerziell. Restrisiken:
  1. Spendenaufrufe, Mitgliedswerbung oder bezahlte Kurse und Zertifikate im selben Angebot können als „directed towards monetary compensation“ gewertet werden.
  2. Die Auslegung ist uneinheitlich (LG Köln), und Rechteinhaber können anders auslegen.
  3. NC-SA- und NC-ND-Material ist **mit CC BY-SA unvereinbar** und kann nicht in eine gemeinsame Datenbank.
  4. Unsere Inhalte könnten von Dritten nicht mehr frei weitergenutzt werden.
  5. Jede spätere Änderung (App-Store-Verkauf, Sponsoring, Kooperation mit Bezahlangeboten) würde die Lizenz rückwirkend gefährden.
  6. ND verbietet zudem Schnitt und Bearbeitung von Audio.
- **Empfehlung:** NC-Material nicht verwenden. Alle betroffenen Posten haben freie Alternativen: CAMeL statt KELLY, Commons oder eigene Aufnahmen statt Tatoeba-NC-Audio, wordfreq statt SUBTLEX-DE und DeReWo.

## Offene Fragen

1. GER-Begleitband 2020: Impressum im PDF selbst prüfen (Abruf hier per Cloudflare gesperrt); bei Bedarf Genehmigung des Europarats für Übersetzungen oder längere Auszüge einholen.
2. Leipzig Corpora Collection: Nutzungsbedingungen und Lizenz je Download im Browser bestätigen (Anubis-Sperre).
3. TS Corpus Word List: Lizenztext in der Datei nach Anmeldung prüfen, Häufigkeitsspalte vorhanden?
4. Lizenz der Gesamt-Lerninhalte festlegen: Empfehlung CC BY-SA 4.0 für die Wortschatz-Datenbank, wegen ShareAlike aus Wiktionary, wordfreq, FrequencyWords, CAMeL und OpenMoji (ADR).
5. Eigene Audioaufnahmen (tr, ar, ergänzend de): Einwilligungs- und Rechteformular für Sprecherinnen und Sprecher (Lizenz CC BY 4.0 oder CC0, Datenschutz: Stimme als personenbezogenes Datum, Widerruf).
6. Sollen Lebewesen auf Bildkarten dargestellt werden (OpenMoji)? Motivliste durch die Gemeinde freigeben lassen.
7. opensubtitles.org-Nutzungsbedingungen waren nicht abrufbar (403); für die indirekte Nutzung über Häufigkeitslisten ohne Belang.
8. CAMeL-Tools-Morphologiedatenbanken: Lizenz vor lokaler Nutzung prüfen.
9. Tatoeba: Audio-Lizenzen sind je Sprecher änderbar. Abgleich bei jedem Import und Speicherung von Lizenz und Abrufdatum je Datei.
