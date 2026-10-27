# MENSCHEN – Lern-App (was nur Menschen entscheiden oder tun können)

Format: Kennung · Aufgabe · Wer · Aufwand · Standard bis zur Antwort · Stand. Alles hier läuft mit der Standardannahme weiter
(L3-E12, kein Warten).
- **LM-01…LM-20** stammen aus der Verfeinerung (`PLAN.md` Entwurf §16), fortgeschrieben nach dem Lizenzbefund und
  `ENTSCHEIDUNGEN.md`.
- **LM-37…LM-39** stammen aus der Abnahme in Stufe C (L3-E18, L3-E21, L3-E20).
- **LM-21…LM-36** sind die Entscheidungen L0-E01…L0-E19 des Lizenzberichts (`berichte/lizenzen-l0.md` §3), ohne Dubletten:
  L0-E02, L0-E13 und L0-E18 sind in LM-12, LM-16 und LM-05 aufgegangen (Zuordnung unten).
- Die Liste des Vorlaufs (`_gemeinde/MENSCHEN.md`, MN-00…MN-29) gilt weiter. Für die Lern-App wichtig sind besonders MN-03
  (Rezitation, Audio im Koran-Pfad), MN-05 (Wortbedeutungen), MN-11 (DSFA), MN-19 (Geräte) und MN-24 (zwei Prüfkonten).

| ID | Aufgabe | Wer | Aufwand | Standard bis zur Antwort | Stand |
|---|---|---|---|---|---|
| LM-01 | Muttersprachliche Prüfende für de, tr und ar (je ≥ 2), Konto mit Zwei-Faktor und Rolle `sprachpruefung` | Bildung / Vorstand | Stichproben ≈ 60 h je Zielsprache + ≈ 20 h je Richtung | Einheiten nach automatischer Prüfung und KI-Gegenprüfung öffentlich mit Hinweis „noch nicht von Muttersprachlern geprüft“ (L3-E03, ADR 0041 Nr. 8); abgelehnte Einträge nie sichtbar; Einträge mit Religionsbezug erst nach zwei religiösen Freigaben | offen |
| LM-02 | Rahmenpläne de/tr/ar abnehmen (Grammatikfolge, Themen, eigene Kann-Beschreibungen) | je eine Prüfperson aus LM-01 | ≈ 3 h je Sprache | Entwurf gilt | offen |
| LM-03 | Imam und Hoca prüfen den Wissenskurs, zuerst Taharah und Salah; mindestens zwei Konten mit `religioese_pruefung` (MN-24). Ebenfalls mit zwei Freigaben: Sprachkurs-Einträge mit Religionsbezug, Liste erlaubter Alltagsformeln (LM-09), Koran-Bedeutungen im Lern-App-Pfad (LM-13) und Wurzeltabelle (LM-31). Wer einen Stand verfasst, gibt ihn nicht frei: Für von Menschen verfasste Inhalte (z. B. Bedeutungen der Hoca) braucht es ein drittes Konto mit `religioese_pruefung` `[Person benennen]` | Imam / Hoca | ≈ 200 h Wissenskurs; übrige Freigaben `[Aufwand schätzen]` | nichts sichtbar; seit 27.10.2026 auf der Test-Domain als gekennzeichneter Entwurf (L3-E22). Vor dem öffentlichen Start entweder alles geprüft oder `FUNKTION_LERNAPP_WISSEN_VORSCHAU=aus`; Freigeben erst mit Datenbank und Konten (G1, G2) | offen |
| LM-04 | Benannte hanefitische Werke bestätigen (KERN §2.4) und Editionsrechte (§ 70 UrhG) einschätzen; entscheiden, ob Prüfende die arabische Passage aus der lokalen OpenITI-Arbeitskopie in der Verwaltung sehen und ob kurze eigene arabische Matn-Fassungen ausgeliefert werden | Imam / Vorstand / Recht | 2 h | Werke laut KERN §2.4; Prüfende sehen nur die Fundstelle und prüfen am eigenen Exemplar; keine arabischen Matn-Stellen in der App | offen |
| LM-05 | İlmihal-Werke (Diyanet/TDV, Bilmen, IGMG): Zitaterlaubnis; bei der IGMG e. V. eine Freigabe eigener Lehrwerke unter CC BY-SA 4.0 anfragen (L0-E18) | Vorstand | Anfrage `[Aufwand schätzen]`, dann Wartezeit | nur Seitenverweis für Menschen; die Anfrage wird gestellt, ohne auf die Antwort zu warten | offen |
| LM-06 | Stimmen: Abweichung vom Wortlaut „Piper“ der Nutzerentscheidung bestätigen (L3-E10); Hörabnahme der gewählten Stimmen je Sprache (Ergebnis Spike S3); Vorlage der Sprecher-Vereinbarung bestätigen (ADR 0029 Nr. 4, bei Training mit Einwilligung in KI-Sprachsynthese; Grundlage `web/docs/recht/entwuerfe/vereinbarung-rezitation.md`) | Nutzer bzw. Vorstand / Technik | 1 h | Stimmen nach L3-E10 und LM-23…LM-25; ohne bestandene Hörprobe für eine Sprache „Audio folgt“ | offen |
| LM-07 | Gerätetest Sprechen und Audioformat (iPhone, Android-Mittelklasse, Laptop), Erweiterung von MN-19 | Technik | 2 h | `lernapp_sprechen` in Produktion aus; WebM/Opus ohne AAC-Rückfall (O-6) | offen |
| LM-08 | DSFA-Nachtrag Lern-App (Art. 9 DSGVO, Ausnahme zu R-08 „keine Ranglisten“), Einwilligungstext `lernapp`, Datenschutzerklärung, Löschfristen | DSB / Recht | 4–6 h | `lernapp_sync`, `lernapp_gruppen` und `lernapp_rangliste` in Produktion aus | offen |
| LM-09 | Inhaltsleitfaden freigeben (Tabu-Themen wie Musik, Beziehungen, Alkohol oder Schwein als Vokabel; Namen; Bilder) und die Liste erlaubter Alltagsformeln für Sprachkurse (Plan ML-03, KERN §2.3) | Hoca / Vorstand; Formelliste: zwei Personen mit `religioese_pruefung` (zwei Freigaben) | 1 h + Formelliste `[Aufwand schätzen]` | Entwurf des Leitfadens gilt; Alltagsformeln in Sprachkursen gesperrt | offen |
| LM-10 | Bestenliste in Gruppen und Familien (nur ab 16, mit eigener Zustimmung) wirklich anbieten? | Vorstand | 5 min | Schalter `lernapp_rangliste` aus; Gruppenziel ohne Namen | offen |
| LM-11 | Sprachinhalte vor bestandener Muttersprachler-Stichprobe veröffentlichen (O-1)? | Vorstand | 5 min | ja, mit Hinweis „noch nicht von Muttersprachlern geprüft“ (`lernapp_ungeprueft` an; genehmigter Plan §6 ML-02) | offen |
| LM-12 | Lizenz der Lerninhalte CC BY-SA 4.0 bestätigen (L0-E02) und die Namensnennung (Tatoeba je Satz, kaikki/Wiktionary, Häufigkeitslisten, OpenMoji, Stimmen und Trainingsdaten) in der App und auf `/quellen` | Vorstand / Recht | 30 min | CC BY-SA 4.0 für Wortschatz-Datenbank und eigene Texte, ohne technische Schutzmaßnahmen; Quellenangaben offline im Paket | offen |
| LM-13 | (a) Bedeutungen der häufigsten 500–1.000 Koran-Wortformen verfassen und freigeben (MN-05; Arbeitsliste aus der Pipeline). (b) Reicht für die Anzeige im Lern-App-Pfad der Status `geprueft` nach ADR 0030, oder bleibt es bei zwei Freigaben wie im Wissenskurs (genehmigter Plan §3.1, O-11)? | (a) Hoca; (b) Imam / Vorstand | (a) 25–50 h; (b) 5 min | (a) Pfad zeigt nur Wortformen, deren Bedeutung zwei Freigaben hat; (b) zwei Freigaben zum aktuellen Stand (genehmigter Plan §3.1) | offen |
| LM-14 | Lehrkräfte schulen (zuweisen, Stand der Gruppe, Schreibabgaben korrigieren) | Bildung | 1 h | Handbuch Lehrkräfte | offen |
| LM-15 | Blob-Speicher `lernapp` verbinden; Kosten und Datenverkehr beobachten (≈ 0,93 GB, nur Audio) | Technik | 20 min | Audio nur im Testkurs (synthetische Töne); Hörübungen „Audio folgt“ | offen |
| LM-16 | Bittgebete: Ḥiṣn al-Muslim ist geschützt (Original und Übersetzungen, L0-E13). Soll eine eigene Sammlung aus Koran und Hadith-Primärquellen mit eigener Übersetzung entstehen, und wer erstellt und prüft sie? Auswahl und Übersetzung sind Arbeit von Menschen, der arabische Wortlaut kommt nur aus gepinnten Dateien in `web/daten/**` (ADR 0040 Nr. 3) | Imam / Hoca / Recht | `[Aufwand schätzen]` | eigene Sammlung ist der Weg (L0-E13); bis sie von Menschen erstellt ist und zwei Freigaben hat, zeigen Lektionen nur Bittgebete aus dem Koran per Verweis | offen |
| LM-17 | Kindgerechter Pfad im Wissenskurs (O-9) | Hoca | `[Aufwand schätzen]` | Kennzeichnung „für Kinder geeignet“ je Lektion; eigener Pfad später | offen |
| LM-18 | Ziffern in der arabischen Oberfläche östlich oder westlich (O-5) | Vorstand | 5 min | östlich-arabisch, umschaltbar | offen |
| LM-19 | Screenreader-Prüfung (NVDA, VoiceOver iOS, TalkBack) | Technik | 3 h | UMGEBUNGSAUSNAHME | offen |
| LM-20 | Prüfvermerk im Wissenskurs mit oder ohne Namen (O-8) | Imam / Vorstand | 5 min | ohne Namen: „geprüft von zwei Gelehrten der Gemeinde am [Datum]“ | offen |
| LM-21 | (L0-E01) Darf Material unter NC, ND oder „nur Forschung“ verwendet werden (MMS-TTS, XTTS/CPML, KELLY, OpenITI-Dateien, Tatoeba-Audio mit NC)? | Vorstand / Recht | 15 min | nein (uneinheitliche Auslegung von „nicht-kommerziell“, LG Köln 28 O 232/13 / OLG Köln 6 U 60/14; NC-SA unvereinbar mit CC BY-SA; Förderung oder Spenden würden die Lage kippen) | offen |
| LM-22 | (L0-E03) Gelten die Bedingungen von Trainingsdaten und Gewichten für das erzeugte Audio? Klärung mit dem Rechtsberater des Vereins; dabei die GPL-FAQ zur Ausgabe von Programmen gegenlesen (beim Abruf nicht erreichbar) | Vorstand / Recht | `[Aufwand schätzen]` | konservativ übertragen: nur Stimmen mit freier Kette, Namensnennung der CC-BY-Daten in der Quellenliste | offen |
| LM-23 | (L0-E04) Deutsche Stimme. Vorher in S3 belegen, dass die Coqui-Release-Datei v0.7.0 dieselbe Konfiguration hat (von Grund auf trainiert); für den Ersatz `de_DE-mls-medium` den Schutzstatus der LibriVox-Vorlagen in DE/EU beachten | Technik / Vorstand (Hörprobe) | `[Aufwand schätzen]` | Coqui-VITS Thorsten; Hörvergleich mit Piper `de_DE-mls-medium` | offen |
| LM-24 | (L0-E05) Türkische Stimme; Herkunft der Chatterbox-Trainingsdaten und der Standardstimme ist nur pauschal beschrieben | Technik / Vorstand; Hörprobe mit Muttersprachlern (LM-01) | `[Aufwand schätzen]` | Übergang Coqui tr glow-tts; Chatterbox nur bei besserer Hörprobe und besserem Verständlichkeitstest; Ziel eigene Stimme (LM-26) | offen |
| LM-25 | (L0-E06) Arabische Stimme. Vor dem Training auf ClArTTS den Schutzstatus des zugrunde liegenden LibriVox-Werks in DE/EU klären (LibriVox garantiert Gemeinfreiheit nur für die USA) | Technik / Recht; Vokalisierungstest mit Muttersprachlern (LM-01) | `[Aufwand schätzen]` | eigene Piper-Stimme auf ClArTTS; bis dahin Chatterbox nur nach bestandenem Vokalisierungstest, sonst arabische Übungen ohne Sprachausgabe („Audio folgt“) | offen |
| LM-26 | (L0-E07, Plan ML-04) Eigene Aufnahmen: (a) Türkisch 2–4 h (1.500–3.000 Sätze) für eine eigene Stimme, ggf. Arabisch; (b) menschliche Aufnahmen für den arabischen Kern A1/A2 (≈ 1.500 Wörter + 2.500 Sätze, ≈ 10–15 h). Sprecherinnen und Sprecher finden; Einwilligung (CC0 oder Rechteübertragung, KI-Synthese ausdrücklich, Widerrufsfolgen nach DSGVO); Rechenzeit (GPU) für das Training klären | Vorstand / Bildung; Technik (GPU) | (a) 2–4 h Aufnahme; (b) 10–15 h; GPU `[klären]` | ja, vorbereiten; bis dahin Übergangsstimmen nach LM-24/LM-25 bzw. „Audio folgt“ | offen |
| LM-27 | (L0-E08) Whisper-Modell und Ort der Auslieferung (statische Dateien bei Vercel oder Blob hinter eigener Route; Grenzen laut Lizenzbericht 100 MB Hobby, 1 GB Pro) | Technik; Tarif: Vorstand | 15 min | `Xenova/whisper-base` q8, Commit `64da572`, selbst gehostet; Ort nach Bautest (Spike S5); `whisper-small` nur nach Praxistest für ar/tr | offen |
| LM-28 | (L0-E09) Rechtschreibprüfung im Client | Technik | 10 min | tr: `dictionary-tr` (MIT); de: kein Hunspell, nur Abgleich gegen erwartete Antworten; ar: Ayaspell unter MPL-2.0 (Empfehlung Lizenzbericht §2); tr und ar erst nach einem Lasttest mit `nspell` (ADR 0042 Nr. 11) | offen |
| LM-29 | (L0-E10) Mindestreife der Versionen | Technik | 5 min | mindestens 14 Tage, exakt pinnen: transformers.js 4.3.0 und idb 8.0.3, ab 20.10.2026 4.3.1 bzw. 8.0.4; daraus abgeleitet Tabler Icons 3.48.0, ab 19.10.2026 3.49.0; Dev-Build von onnxruntime-web im Lockfile fixieren | offen |
| LM-30 | (L0-E11) OpenITI: Anfrage bei KITAB (Bestätigung, dass für gemeinfreie Grundtexte ohne Markup keine Rechte beansprucht werden, oder Freigabe unter CC BY-SA 4.0)? | Vorstand | `[Aufwand schätzen]` | nicht nötig für den Start: OpenITI nur lokal, eigene Fassungen ausliefern; Anfrage optional | offen |
| LM-31 | (L0-E12, Plan ML-06) Koran-Wurzeln: eigene Wurzeltabelle oder schriftliche Erlaubnis für den Quranic Arabic Corpus; fachlich prüfende Lehrkraft mit `religioese_pruefung` benennen `[Person benennen]` | Vorstand / Hoca | Benennung 5 min; Prüfung `[Aufwand schätzen]` | eigene Tabelle (Tanzil-Formen, CAMeL Tools lokal, Abgleich mit Wiktionary), Prüfung durch die benannte Lehrkraft und zwei Freigaben (ADR 0040 Nr. 5), CC BY-SA 4.0 mit Tanzil-Hinweis; bis dahin keine Wurzel-Übungen im Koran-Pfad | offen |
| LM-32 | (L0-E14) Joseph Hell 1923 (deutsche Übersetzung von al-Fiqh al-Akbar und der Ṭaḥāwiyya) sprachlich modernisiert übernehmen? Wer bearbeitet und prüft gegen das Arabische? | Imam / Hoca | `[Aufwand schätzen]` | ja, Bearbeitung durch Menschen (ADR 0040 Nr. 3), aus dem Original von 1923, ohne Hells Einleitung und Anmerkungen, gekennzeichnet bearbeitet; bis dahin nicht verwendet | offen |
| LM-33 | (L0-E15) Fehlende oder ungeklärte Ausgaben festlegen und beschaffen: al-ʿAqāʾid an-Nasafiyya (nicht in OpenITI), Ausgabe der Hidāya, Marāqī al-Falāḥ (Ḥāshiyat aṭ-Ṭaḥṭāwī, Būlāq 1318/1900) | Imam / Vorstand | `[Aufwand schätzen]` | alte Drucke (19. Jh. bzw. Būlāq 1900); bis dahin diese Werke zurückstellen | offen |
| LM-34 | (L0-E16, O-4) Lebewesen auf Bildkarten (OpenMoji); Motivliste freigeben | Redaktion / Vorstand | `[Aufwand schätzen]` | keine Menschen- oder Tierdarstellungen, keine Fotos, keine Gesichter; nur Gegenstände und Symbole | offen |
| LM-35 | (L0-E17) Spendenaufrufe, Mitgliederwerbung oder Förderhinweise in der Lern-App? | Vorstand | 5 min | keine in der Lern-App | offen |
| LM-36 | (L0-E19) GER-Kann-Beschreibungen: eigene Formulierungen oder Genehmigung des Europarats für Auszüge und Übersetzungen? | Vorstand | 5 min | eigene „Ich kann …“-Formulierungen mit dem Hinweis „orientiert am GER (Europarat 2001/2020)“ | offen |
| LM-37 | (L3-E18, Z-L19) Ausnahme M-060 (libvips, LGPL-3.0, nur serverseitig) auch für die Lern-App-Seiten in der Website-Hülle bestätigen (Verwaltung › Lern-App, Mein Bereich › Unterricht › Lern-App); oder den Umbau der Hülle beauftragen (Actions mit sharp nur in den Upload-Seiten) | Vorstand / Technik | 10 min | M-060 gilt mit; die öffentliche Lern-App (`/lern-app/**`) bleibt frei von libvips | offen |
| LM-38 | (L3-E21, Z-L16) Vercel-Bauzeit des Endstands im Dashboard bestätigen (Projekt mit der Test-Domain; gemessen vom Push bis live 11 min 24 s); überzählige Projekte entfernen, die dasselbe Repository nacheinander bauen | Technik | 10 min | Beleg: Push bis live ≤ 15 min; lokaler Bau wie Vercel 609 s | offen |
| LM-39 | (L3-E20, Z-L07) Lighthouse-Leistung live auf einem Referenzgerät oder mit PageSpeed Insights gegenmessen: `/lern-app/de`, `/lern-app/de/tr-aus-de`, eine Übungsseite | Technik | 15 min | Ersatz: Budgets, LCP, CLS, INP erfüllt; Note live auf dem Messrechner: Start/Lernpfad 88–92, Übungen 83–90 | offen |

## Zuordnungen

**Lizenzbericht L0-E01…L0-E19 → LM**

| L0-E | LM | L0-E | LM | L0-E | LM | L0-E | LM |
|---|---|---|---|---|---|---|---|
| E01 | LM-21 | E06 | LM-25 | E11 | LM-30 | E16 | LM-34 |
| E02 | LM-12 | E07 | LM-26 | E12 | LM-31 | E17 | LM-35 |
| E03 | LM-22 | E08 | LM-27 | E13 | LM-16 | E18 | LM-05 |
| E04 | LM-23 | E09 | LM-28 | E14 | LM-32 | E19 | LM-36 |
| E05 | LM-24 | E10 | LM-29 | E15 | LM-33 | | |

**Genehmigter Plan ML-01…ML-06 → LM:** ML-01 → LM-03, LM-04 · ML-02 → LM-01, LM-11 · ML-03 → LM-09 · ML-04 → LM-26 ·
ML-05 → LM-08 · ML-06 → LM-06, LM-21, LM-22, LM-30, LM-31.

**Offene Entscheidungen O-1…O-12 (`PLAN.md` §18) → LM:** O-1 → LM-11 · O-4 → LM-34 · O-5 → LM-18 · O-6 → LM-07 · O-8 →
LM-20 · O-9 → LM-17 · O-11 → LM-13. O-2 und O-10 folgen dem genehmigten Plan (§2.3, §3.4); O-3, O-7 und O-12 sind
Entscheidungen des Orchestrators.

## Restfragen aus dem Lizenzbericht (zur Kenntnis, ohne eigene Kennung)

- Wortlaut der M-AILABS-Lizenz: ohne Belang, solange `de_DE-eva_k` und `de_DE-ramona` nicht genutzt werden.
- Impressum des GER-Begleitband-PDF: nur relevant, falls entgegen LM-36 Deskriptoren übernommen werden sollen.
- Lizenz der Leipzig Corpora Collection, TS Corpus Word List, Zargan: nicht verwendet bis zur Klärung.
- EU-Datenbankrecht am Quranic Arabic Corpus: gegenstandslos, solange LM-31 bei der eigenen Tabelle bleibt.
- Herkunft der Chatterbox-Trainingsdaten: in LM-24 und LM-25 berücksichtigt.

**Nachträge Tor L0 (20.10.2026):**
- LM-23 erledigt (Thorsten-Kette an der Quelle bestätigt, S3).
- LM-24 erweitert: schriftliche Bestätigung der Rechte am Datensatz „Talent_TR_Male“ bei Fatih Akademi anfragen; bis dahin
  Türkisch „Audio folgt“ (L3-E10a).
- LM-26 a vorgezogen (türkische Aufnahmen); Lizenzform der Aufnahmen nach D-L11 (Vorlage `vereinbarung-sprecher-lernapp.md`).
- LM-06: Hörabnahme Thorsten mit 20 Sätzen + 10 Wörtern aus `scratchpad/l0/S3/hoerproben` (Diphthonge, pf).
- LM-08: Entwürfe `web/docs/recht/entwuerfe/{dsfa-lernapp,einwilligung-lernapp,vereinbarung-sprecher-lernapp}.md` und
  `loeschkonzept.md` §3.7; offene Fragen D-L01…D-L15 an DSB/Recht.
- LM-33 erweitert: Marāqī al-Falāḥ zurückgestellt (in der OpenITI-Ḥāshiya nicht enthalten); Siyar und Koran-/Hadith-Grundwissen
  bis zur Quellenklärung zurückgestellt (23 von 28 Einheiten belegbar).
- LM-09: offene Fragen OF-01…OF-18 des Inhaltsleitfadens (`_lernapp/lehrplan/INHALTSLEITFADEN.md` §7), jeweils mit Standard.

**Nachträge Stufe C (26.10.2026; Redaktionsfragen aus den Schlussprüfungen B1, Belege `protokolle/C-inhalte*.md`):**
- **LM-09 (OF-10 Politik und Staatskunde):**
  - de.b1.e16 bleibt Entwurf bis zur Entscheidung (12 Befunde `politik` im Inhaltsprüfer).
  - Sachlich gehalten und mit Hinweis freigegeben (L3-E15) sind ar.b1.e10 (Vereinswahlen, Nachhilfe im Jugendtreff) und ar.b1.e11 (Staat, Regierung, Verfassung, Ministerium; Antrag für den Austausch).
  - Lautet die Entscheidung „nein“, nimmt die Redaktion diese drei Einheiten bzw. Abschnitte zurück.
- **LM-02 und LM-03 (R-06, Fehltreffer „Pilz“):**
  - tr.b1.e16 bleibt Entwurf. Das arabische Wort für Pilz (Lemma *mantar*) steht in tr-aus-ar und wird unvokalisiert gleich einem religiösen Kandidaten geschrieben (3 Befunde R-06).
  - Die Redaktion entscheidet „Fehltreffer“ oder „ersetzen“; danach gibt der Orchestrator nach L3-E15 frei.
- **LM-02, Redaktionsfragen B1 tr und ar (Standard: Stand wie ausgeliefert):**
  - Schreibweise *iş birliği* (getrennt).
  - Namen mit Längezeichen im tr-Kurs (z. B. Samīr, Rīm).
  - Vokalisierung in tr-aus-ar einheitlich.
  - Wortzahl der ar-Schreibaufgaben: Vorschlag Faktor ≈ 0,75 auf die Rahmen-Spannen, danach ar.b1.e09 angleichen.
  - Figuren-Kanon: Yāsmīn (ältere Tochter von Lubnā und Samīr) neu; Nizār erst Mechaniker, dann Lehrer bis zum Ruhestand. Rahmen ar.b1.e01/e03 nachziehen.
  - Umschreibendes Passiv mit *tamma* + Maṣdar (laut Rahmen B2) an 13 Stellen in ar B1.
  - Kinderregel ar.b1.e14: Laylā und Jan bauen als Schulprojekt zu zweit ein Solarauto.
  - Ausnahme im Vokalisierungsprüfer für *li-* mit Artikel vor Sonnenbuchstaben (dann kursweit zurückformulieren).
