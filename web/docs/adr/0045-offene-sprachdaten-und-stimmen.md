# ADR 0045 – Offene Sprachdaten, Stimmen und Quellen der Lern-App

- Status: vorgeschlagen (16.10.2026) (Lauf Lern-App) nach dem Lizenzbefund L0 (Workflow `wf_cf9ab8d3-fce`, 31 Primärquellen gegengeprüft); der Grundsatz „KI-Entwurf ergänzt um offene Daten (Tatoeba, Wiktionary), Audio per Open-Source-Sprachausgabe, später durch Aufnahmen ersetzbar“ ist Nutzerentscheidung „Sprachinhalte“ (L3-E03). Die Stimmenwahl weicht von „Piper“ ab (L3-E10) und bleibt bis zur Bestätigung durch Menschen Standard (L0-E03…E07) · Bezug: Plan „Lern-App“ Kontext („Lizenzbefund L0“), §3.2, §6 (Lizenzprüfung); `_lernapp/PLAN.md` §6.1, §6.7–6.8, §12; Lizenzbericht `_lernapp/berichte/lizenzen-l0.md` (§1 Tabelle, §2 Empfehlungen, §3 L0-E01…E19) · schreibt ADR 0025 fort (gepinnte Datensätze) und ergänzt ADR 0009 (Tanzil)

## Kontext

- Die Lern-App liefert Texte, Audio und Bilder an Geräte aus und speichert sie dort offline. Das Repository ist öffentlich (ADR 0010).
- Projektvorgabe: ausgelieferter Code nur unter MIT, Apache-2.0, BSD, ISC, MPL-2.0 oder OFL; ausgelieferte Daten, Audio und Bilder nur unter CC0, CC BY oder CC BY-SA. GPL und LGPL nur für Werkzeuge, die lokal beim Erzeugen laufen.
- Der Lizenzbefund L0 vom 16.10.2026 überholt den Plan in drei Punkten:
  - **Piper-Stimmen:** Fast alle Stimmen für de, tr und ar sind von `en_US-lessac` (Lizenz nur für Forschung) oder `en_US-ryan` (CC BY-NC-SA 4.0) aus weitertrainiert. Sauber ist von den Piper-Stimmen dieser drei Sprachen nur `de_DE-mls-medium`.
  - **OpenITI** steht unter CC BY-NC-SA 4.0.
  - **Quranic Arabic Corpus:** GPL mit Änderungsverbot, laut FAQ nur für Forschung.
- Ob die Bedingungen von Gewichten und Trainingsdaten für erzeugtes Audio gelten, ist rechtlich ungeklärt.
- „Nicht-kommerziell“ ist in Deutschland uneinheitlich ausgelegt (LG Köln 28 O 232/13, OLG Köln 6 U 60/14). NC-SA ist mit CC BY-SA unvereinbar.

## Entscheidung

1. **Lizenzrahmen:** Nie verwendet wird Material unter NC, ND oder „nur Forschung“, auch wenn die Nutzung wahrscheinlich nicht-kommerziell wäre (L0-E01). In der Lern-App gibt es keine Spendenaufrufe, Mitgliederwerbung oder Förderhinweise (L0-E17).
2. **Lizenz der Lerninhalte:** Wortschatz-Datenbank und eigene Texte stehen unter **CC BY-SA 4.0** (L0-E02), wegen ShareAlike aus Wiktionary, wordfreq, CAMeL-Listen und OpenMoji. Keine technischen Schutzmaßnahmen; die Quellenangaben liegen offline im Paket (ADR 0039).
3. **Ablage** nach ADR 0025: Auszüge gepinnt unter `web/daten/{tatoeba,kaikki,haeufigkeit,lernapp-modelle}/` mit `QUELLE.md` (Herkunft, Version oder Datum, Lizenz, Namensnennung, SHA-256). Jeder Eintrag der Lern-App trägt `quelle` und `lizenz`; ohne beides blockiert `pnpm lernapp:pruefen`. Downloads werden im Datenstrom gefiltert, der Vollabzug wird nicht gespeichert (Plattenbudget).
4. **Tatoeba-Sätze** (Wochenexport; CC BY 2.0 FR, eine Teilmenge CC0 über die Dateien `*_sentences_CC0`):
   - Namensnennung je Satz: „Satz #{id} von {Benutzername}, Tatoeba (Link), CC BY 2.0 FR (Link)“; ohne Benutzername „Tatoeba-Mitwirkende“. Bei Übersetzungspaaren beide Seiten nennen. Veränderungen (z. B. Lückentext) kenntlich machen.
   - Nur Sätze mit Lizenzfeld und `correctness > -1`, nicht `is_unapproved`; Filter nach Inhaltsleitfaden (LM-09).
   - Arabisch und das Paar tr–ar sind dünn besetzt; dort tragen KI-Sätze den Hauptteil.
5. **Fremdes Audio:**
   - Tatoeba-Audio nur mit CC BY 4.0, CC BY-SA 4.0 oder CC0. Am 16.10.2026 gab es das nur für Deutsch (5.334 Aufnahmen). Je Datei werden Sprecher, Lizenz, Attribution-URL und Abrufdatum gespeichert und bei jedem Import neu abgeglichen. NC, NC-ND und leeres Lizenzfeld: nie.
   - Wikimedia Commons je Datei über die API, nur CC0, CC BY oder CC BY-SA; Urheber, Lizenz und Link je Datei.
6. **Wiktionary über kaikki.org:** unter CC BY-SA 4.0 (nicht GFDL), mit Link auf den Wiktionary-Artikel und Hinweis auf die Bearbeitung. Beispiele mit Feld `ref` (Zitate) werden nie übernommen. Wiktextract läuft nur lokal.
7. **Häufigkeit** (nur zur Auswahl und Stufung, keine Sätze): wordfreq 3.1.1 für de, tr und ar (Namensnennung einschließlich SUBTLEX und der übrigen Unterquellen), CAMeL Arabic Frequency Lists v1.0 für ar (Zitat Khalifa u. a. 2021), FrequencyWords als Gegenprobe (Schimpfwörter filtern); alle CC BY-SA 4.0.
8. **GER:** nur Stufen und Konzept. Eigene „Ich kann …“-Formulierungen mit dem Hinweis „orientiert am GER (Europarat 2001/2020)“ (L0-E19). Keine Übernahme und keine Übersetzung der Deskriptoren.
9. **Bildkarten:** Der Stil wird in L2 festgelegt (KERN 4.0 §7). Zur Wahl stehen Linien-Symbole im gleichen Raster (Lucide, ISC; Tabler Icons, MIT, Version nach Mindestreife L0-E10) oder OpenMoji 17.0.0 (CC BY-SA 4.0). Für OpenMoji gilt: Motivliste von der Redaktion freigegeben, keine Marken-Icons, Namensnennung. Bis zur Entscheidung der Gemeinde keine Darstellungen von Menschen oder Tieren, keine Fotos und keine Gesichter (L0-E16, O-4). Die Bediensymbole bleiben Lucide (eine Icon-Familie, Z-06).
10. **Nicht verwendet (Sprachdaten):** Sätze aus OpenSubtitles, KELLY-Listen, SUBTLEX-DE direkt, DeReWo, „A Frequency Dictionary of Arabic“, „Profile deutsch“, die deutsche Ausgabe des GER-Begleitbands. Bis zur Klärung nicht: Leipzig Corpora Collection, TS Corpus Word List, Zargan.
11. **Stimmen je Sprache** (L0-E04…E06; L3-E10):

    | Sprache      | Standard                                                                                                                                                                                                                                                                     | Übergang oder Ersatz                                                                                                                                                                                    |
    | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | Deutsch      | Coqui-VITS Thorsten (`tts_models/de/thorsten/vits`; Modell Apache-2.0, Daten CC0, von Grund auf trainiert, Phonemisierung mit gruut statt espeak-ng)                                                                                                                         | Hörvergleich mit Piper `de_DE-mls-medium` (CC BY 4.0, Sprecher per Hörprobe); Ersatz `Thorsten-Voice/Kokoro` (mit Auflagen)                                                                             |
    | Türkisch     | Ziel: eigene Stimme. Aufnahme einer Person aus der Gemeinde (2–4 h), CC0 oder Rechteübertragung mit ausdrücklicher Einwilligung in KI-Sprachsynthese (L0-E07); Training mit piper1-gpl von einem sauberen Startpunkt (`en_US-ljspeech`, gemeinfrei, oder `de_DE-mls-medium`) | Übergang Coqui `tts_models/tr/common-voice/glow-tts` mit HiFi-GAN (MIT, Common Voice CC0); Chatterbox Multilingual (MIT) nur, wenn es in Hörprobe und Verständlichkeitstest besser abschneidet (L0-E05) |
    | Hocharabisch | eigene Piper-Stimme, trainiert auf ClArTTS (CC BY 4.0), optional ergänzt um den Arabic Speech Corpus (CC BY 4.0); Eingabe immer voll vokalisiert                                                                                                                             | Chatterbox Multilingual nur nach bestandenem Vokalisierungstest (≈ 200 Minimalpaare mit Harakat, Schadda, Tanwin); sonst arabische Übungen ohne Sprachausgabe („Audio folgt“) oder mit Aufnahmen        |
    - **Ausgeschlossen**, weil die Kette auf lessac (nur Forschung) oder ryan (CC BY-NC-SA 4.0) zurückgeht: Piper `de_DE-thorsten-low/-medium/-high`, `de_DE-thorsten_emotional-medium`, `de_DE-kerstin-low`, `de_DE-karlsson-low`, `de_DE-pavoque-low` (zusätzlich NC-SA-Daten), `tr_TR-dfki-medium` (zusätzlich NC-SA-Daten), `tr_TR-fahrettin-medium` und `tr_TR-fettah-medium` (am 30.12.2025 auf Wunsch der Beitragenden entfernt; auch keine Kopien bei Dritten), `ar_JO-kareem-low/-medium` (zusätzlich Daten ohne Lizenz). lessac und ryan sind auch als Startpunkt für eigenes Training ausgeschlossen.
    - Das Etikett „mit“ des Repositorys `rhasspy/piper-voices` ist keine Freigabe. Maßgeblich ist die `MODEL_CARD` jeder Stimme.
    - **Ebenfalls ausgeschlossen:** MMS-TTS (CC BY-NC; das arabische Vokabular enthält keine Harakat), Coqui XTTS-v2 (CPML, nur nicht-kommerziell), ArTST (CC BY-NC, ohne Vokalzeichen trainiert), Community-Stimmen ohne dokumentierte Datenherkunft, `kikiri-turkish-base` (Rechte Dritter an den Stimmen). `de_DE-eva_k` und `de_DE-ramona` (M-AILABS-Lizenz nicht gesichert, Qualität x_low/low) werden nicht genutzt.
    - **Bedingungen:**
      - Die Bedingungen von Gewichten und Trainingsdaten gelten für das erzeugte Audio (konservative Linie, L0-E03). Namensnennung je Stimme in den Quellen der App, z. B. „Stimme: Thorsten Müller (Thorsten-Voice, CC0); Modell: Coqui-TTS-VITS, Apache-2.0“, MLS (CC BY 4.0), ClArTTS (Kulkarni u. a., Interspeech 2023, CC BY 4.0), Arabic Speech Corpus (Nawar Halabi, CC BY 4.0).
      - Chatterbox: Wasserzeichen in jeder Ausgabe offenlegen; Stimmklonen nur mit einer Referenzstimme, deren Sprecher schriftlich eingewilligt hat; Herkunft der Standardstimme vor Einsatz prüfen.
      - Programme nur lokal: piper1-gpl und espeak-ng (GPL-3.0), Coqui TTS (MPL-2.0), gruut (MIT), chatterbox-tts (MIT). Nie im Browser, nie in einer Vercel-Funktion (ADR 0039 Nr. 6).
      - Common Voice: Sprecher nicht identifizieren.

12. **Hanefitische Quellen** (Verfahren in ADR 0040 Nr. 4):
    - **OpenITI** (Release 2025.1.9, CC BY-NC-SA 4.0) nur lokal als Arbeitstext: außerhalb des Repositorys bzw. in einem von Git ausgeschlossenen Ordner, nie ausgeliefert, kein OpenITI-Markup in Inhalten. Ins Repository kommen nur Metadaten (Version-URI, SHA-256, Ausgabe) in `web/daten/hanafi-quellen/QUELLE.md`.
    - Öffentlich erscheinen eigene deutsche Fassungen mit Zitierangabe (Werk, Kapitel, Ausgabe; OpenITI-URI als Fundstelle). Kurze arabische Grundtext-Stellen nur nach Entscheidung der Menschen: als eigene Fassung ohne Markup, von Menschen gegen eine Druckausgabe mit abgelaufener § 70-Frist geprüft, als Datei in `web/daten/**`. Standard: keine.
    - **Ausgaben:** nur Fassungen mit abgelaufener § 70-Frist. Marāqī al-Falāḥ über die Ḥāshiyat aṭ-Ṭaḥṭāwī (Būlāq 1900), al-Ikhtiyār nur in der Ḥalabī-Ausgabe von 1937; Ausgabe der Hidāya klären. al-ʿAqāʾid an-Nasafiyya fehlt in OpenITI und wird bis zur Beschaffung eines alten Drucks zurückgestellt (L0-E15).
    - Nicht verwendet: Inhalte von al-Maktaba al-Shāmila (keine Nachnutzungserlaubnis), Verlagsübersetzungen, Ḥiṣn al-Muslim in Original und Übersetzung (geschützt; L0-E13).
    - Joseph Hell, „Von Mohammed bis Ghazâlî“ (1923, gemeinfrei): nur der Übersetzungstext zu al-Fiqh al-Akbar und zur Ṭaḥāwiyya, ohne Einleitung und Anmerkungen, gekennzeichnet bearbeitet, geprüft gegen das Arabische (L0-E14; Bearbeitung durch Menschen, ADR 0040 Nr. 3).
    - İlmihal-Werke (Diyanet/TDV, Bilmen, IGMG) nur als Seitenverweis; Zitate nur mit Erlaubnis (LM-05). Eine Freigabe IGMG-eigener Lehrwerke unter CC BY-SA 4.0 wird angefragt, ohne darauf zu warten (L0-E18).
13. **Koran-Wurzeln ohne Quranic Arabic Corpus:**
    - Der Quranic Arabic Corpus wird **nicht** verwendet, auch keine Ableger (`mustafa0x/quran-morphology`, `q-ran/quran`, `kwanite/quran-roots-dictionary`, `R3GENESI5/quran-bil-quran`). QUL (Tarteel) und NoorBayan bleiben bis zur Klärung ihrer Datenherkunft außen vor.
    - Stattdessen eine **eigene Wurzeltabelle** (L0-E12): Wortformen aus Tanzil (18.994 verschiedene Formen), Wurzel-Vorschläge lokal mit CAMeL Tools (nur `morphology-db-msa-r13`, nie `msa-s31`), Abgleich mit Wiktionary, fachliche Prüfung durch eine benannte Lehrkraft mit der Rolle `religioese_pruefung` `[Person benennen]`, sichtbar erst mit zwei Freigaben (ADR 0040 Nr. 5). Ablage gepinnt in `web/daten/` `[Ordnername festlegen]` mit `QUELLE.md`; Veröffentlichung unter CC BY-SA 4.0 mit dem Hinweis von Tanzil.
    - Tanzil bleibt unverändert im Einsatz (ADR 0025).
14. **Prüfwerkzeuge nur lokal:** LanguageTool (de, LGPL-2.1, eigener lokaler Server; die öffentliche API nie mit Lerninhalten), Zemberek (tr), Mishkal und CAMeL Tools (ar), Hunspell-Programm. Das deutsche Hunspell-Wörterbuch igerman98 (GPL) wird nie ausgeliefert.
15. **Quellenseiten:** `/lern-app/[ui]/quellen` (offline im Vorrat) und `/quellen` der Website nennen alle Quellen, Stimmen, Bildkarten, Modelle, Schriften und Bibliotheken mit Lizenz.

## Fortschreibung durch Spike S7 (16.10.2026, Beleg `_lernapp/belege/S7-sprachdaten.md`)

Gilt vor Nr. 3–7, wo es abweicht.

1. **Nr. 3, Pinnen im Strom:** `QUELLE.md` nennt (a) die Ausgangsdatei mit Adresse, Bytes, Last-Modified/ETag und SHA-256 des Stroms, (b) das Filterskript mit Pfad und SHA-256 (ab L3 in `_lernapp/werkzeuge/sprachdaten/`), (c) die SHA-256 jeder Auszugsdatei. Prüfer und Import prüfen die Auszugs-SHA vor jedem Lauf und brechen bei Abweichung ab (ADR 0025 Nr. 2). Reproduzierbarkeit ist belegt (Tatoeba zweimal byte-gleich, kaikki-Upstream-SHA in vier Läufen gleich).
2. **Nr. 3, Ablage und Größe:** `web/daten/{tatoeba,kaikki,haeufigkeit}/` zusammen ≈ 33 MB roh (≈ 8,6 MB gz), unkomprimiert, UTF-8, LF, sortiert; größte Datei 11,7 MB, kein Git LFS. Die vollen kaikki-Auszüge (≈ 1,4 GB) kommen nicht ins Repository. Die Auszüge braucht nur `lernapp:pruefen`, nicht der Bau: Sie kommen in `.vercelignore`, solange L1/L3 keinen Bauzugriff einführen.
3. **Nr. 4, Tatoeba:** Lizenzspalte CC0 1.0, wenn die ID in `<l>_sentences_CC0` steht, sonst CC BY 2.0 FR. Standardfilter für den Import: Ausschluss bei negativer Bewertung, Wartungs-Tag, Koran- oder Hadith-4-Gramm, Inhaltsindikator, Religion (Standard Ausschluss, sonst `religionsbezug` mit zwei Freigaben) und mehr als 12 Wörtern auf einer Seite. Arabische Sätze nur nach Vokalisierung mit Prüfer „voll vokalisiert“, gekennzeichnet als „bearbeitet (vokalisiert)“. Keine indirekten Paare über Englisch; tr↔ar über Englisch erst nach Muttersprachler-Stichprobe (ADR 0041). Erneuern je Etappe (L3, L4, L5).
4. **Nr. 6, kaikki:** drei Ausgaben – en (Stammformen, Genus, Plural, Glossen, vokalisierte Formen), de (Definitionen, Übersetzungen de→tr/ar), tr (Definitionen, Übersetzungen tr→de/ar). Beispiele werden nie übernommen; `lernapp:pruefen` prüft, dass in `web/daten/kaikki` kein Schlüssel `examples` oder `ref` vorkommt. Glossenlücken schließt der KI-Entwurf mit Gegenprüfung, Quelle `ki:<lauf>`. kaikki-Daten nie als Bedeutung im Pfad `koran` oder im Wissenskurs; Einträge mit Thema Religion/Islam markiert der Import als Kandidaten für `religionsbezug` und das Formel-Lexikon.
5. **Nr. 7, Häufigkeit:** Rang aus wordfreq 3.1.1 (de/ar `large`, tr `small`), für ar zusätzlich CAMeL MSA v1.0 (Rangmittel); FrequencyWords nur als Gegenprobe. Vor der Stufung Nicht-Wörter, Fremd- und Spamtoken, Eigennamen und Schimpfwörter filtern; lemmatisiert wird über kaikki-Formen bzw. CAMeL Tools.
6. **Wächter (KERN §3):** Die Normalisierung umfasst zusätzlich die Koranzeichen U+06D6–U+06ED, Alif wasla U+0671 und Ta marbuta/Ha; sonst verdeckt der Unterschied zwischen uthmanischer und heutiger Schreibung Treffer. Unit-Test mit Positivproben aus `web/daten` und den Tatoeba-Treffer-IDs des Spikes.
7. **Namensnennung je Eintrag im Paket:** Tatoeba `quelle: "tatoeba:<id>"`, `lizenz: "CC BY 2.0 FR"`, `namensnennung: "Satz #<id> von <benutzer>"` (ohne Name „Tatoeba-Mitwirkende“; bei Paaren beide Seiten; bei Änderung „bearbeitet“). kaikki `quelle: "wiktionary:<ausgabe>:<seitentitel>"` mit Link auf den Artikel, `lizenz: "CC BY-SA 4.0"`, Hinweis „gekürzt und umformatiert“. Häufigkeitslisten erscheinen nur auf den Quellenseiten.

## Alternativen

- Piper-Stimmen wie im Plan („Audio per Open-Source-Sprachausgabe (Piper)“): für de, tr und ar verworfen nach dem Lizenzbefund (Kette lessac/ryan). Die Engine piper1-gpl bleibt als lokales Werkzeug für eigene Stimmen im Einsatz.
- NC-Stimmen oder NC-Daten unter der Annahme „gemeinnützig = nicht-kommerziell“: verworfen (L0-E01; uneinheitliche Rechtsprechung, unvereinbar mit CC BY-SA, jede Förderung kippte die Lage).
- MMS-TTS als eine Stimme für alle drei Sprachen: verworfen (CC BY-NC, Harakat werden verworfen).
- OpenITI-Dateien im Repository oder in der App: verworfen (CC BY-NC-SA 4.0). Eine Anfrage bei KITAB ist optional, für den Start nicht nötig (L0-E11).
- Schriftliche Erlaubnis für den Quranic Arabic Corpus: möglich, aber nicht der Standard (L0-E12).
- KELLY-Liste für Arabisch: verworfen (CC BY-NC-SA 2.0); Ersatz CAMeL-Listen und wordfreq.
- Arabisch ganz ohne Sprachausgabe: Rückfall, falls weder eine eigene Stimme noch der Übergang den Test besteht.

## Folgen

- Spikes in L0: **S3** wird zum Stimmen-Spike (Hörproben, Echtzeitfaktor, Verständlichkeit per Spracherkennung, Vokalisierungstest Arabisch) statt einer Auswahl unter Piper-Stimmen; **S7** Auszüge Tatoeba, kaikki und Häufigkeit mit SHA und `QUELLE.md`; **S8** OpenITI nur lokal: Passagen-Index im Werkzeug, im Repository nur Metadaten.
- Das Training eigener Stimmen (tr, ar) braucht Rechenzeit, vermutlich mit GPU `[Ressourcen klären, L0-E07]`. Bis dahin gelten die Übergangsstimmen bzw. „Audio folgt“.
- Die Felder `lizenz` und `quelle` sind Pflicht; der Prüfer blockiert ohne sie.
- MENSCHEN: L0-E01…E19 mit ihren Standards; LM-06 (Stimmen bestätigen, Sprecherinnen und Sprecher mit Vereinbarung), LM-12 (Namensnennung), LM-13 (Bedeutungen der Koran-Wortformen; die Frage nach einer Lizenz des Quranic Arabic Corpus entfällt), LM-04 (Werke und Ausgaben).
- Weiter offen laut Lizenzbericht: Bestätigung, dass die veröffentlichte Coqui-Thorsten-Datei ohne fremden Startpunkt trainiert wurde; welches LibriVox-Werk ClArTTS zugrunde liegt und sein Schutzstatus in Deutschland; Herkunft der Chatterbox-Trainingsdaten; Wortlaut der M-AILABS-Lizenz; Bedingungen der Leipzig Corpora Collection.
- Abnahme: Z-L14 (Lizenzfeld 100 %), Z-L08 (ohne Konto nur eigener Ursprung); dazu LZ-08 des genehmigten Plans §5 (Lizenzen vollständig auf `/quellen`, 0 Drittanfragen).
