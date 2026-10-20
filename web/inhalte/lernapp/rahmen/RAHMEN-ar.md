# Rahmenplan Hocharabisch (Zielsprache ar, gelehrt aus Deutsch und Türkisch)

- **Stand:** 16.10.2026, Version 1.0.0-entwurf (L3-01, vorgezogen)
- **Status:** Entwurf. Er gilt als Standard, bis eine Prüfperson aus LM-01 ihn abnimmt (LM-02, ADR 0041 Nr. 12).
- **Maschinenlesbar:** `web/inhalte/lernapp/rahmen/ar.rahmen.json`. Bei Abweichungen gilt die JSON-Datei; dieses Dokument erklärt sie.
- **Hinweis:** Die Stufen sind orientiert am GER (Europarat 2001/2020). Alle Kann-Beschreibungen sind eigene Formulierungen. Deskriptoren des GER werden weder übernommen noch übersetzt, fremde Lehrpläne und Lehrwerke nicht nachgebaut (LM-36, ADR 0045 Nr. 8).
- **Grundlagen:** PLAN §0, §4, §5.1, §6.1–§6.4; KERN §2, §5, §7; Inhaltsleitfaden (`_lernapp/lehrplan/INHALTSLEITFADEN.md`, `leitfaden.json`); Beleg S7 (`_lernapp/belege/S7-sprachdaten.md`); ADR 0041, 0045.
- **Richtungen:** `ar-aus-de` und `ar-aus-tr` nutzen denselben Zielkorpus. Übersetzungen, Glossen und kontrastive Tipps entstehen je Richtung (PLAN §6.3).
- **Schrift:** Dieses Dokument und die JSON-Datei enthalten keine arabische Schrift. Arabisch steht in vereinfachter Umschrift nach DIN 31635 (ohne anlautendes ʾ, Artikel angeglichen, Endungen nur dort, wo sie Gegenstand der Grammatik sind). Die Kursinhalte selbst stehen voll vokalisiert in arabischer Schrift, nur in `web/inhalte/lernapp/{sprache,uebersetzung,aussprache}/**` (KERN §3).

> **KI-Regel 2 (ADR 0040, KERN §2):** Keine Koranverse, Hadithe, Bittgebete oder anderen religiösen Texte (weder arabisch noch übersetzt), keine Koran-Wortbedeutungen, keine Fiqh-Aussagen. Der Sprachkurs ist ohne Religionsbezug. Religiöse Formeln gibt es nur aus einer später von zwei Gelehrten freigegebenen Liste; im Rahmenplan stehen sie höchstens als markierte Kandidaten `religionsbezug`, nie als Lernziel. Arabische Wörter stehen hier nur in Umschrift. Das Verstehen religiöser Texte bedient der getrennte Pfad „Koran-Arabisch“, nicht dieser Kurs.

## 1 Kurzfassung

- 72 Einheiten in fünf Stufen (A1 12, A2 14, B1 16, B2 16, C1 14) mit je acht Stationen: fünf Lektionen, eine Geschichte, eine Wiederholung, ein Prüfstein.
- 6.500 neue Lemmata (A1 600, A2 900, B1 1.300, B2 1.700, C1 2.000), 26.000 Sätze, 144 Geschichten und Dialoge, 156 Lesetexte, 144 Sprech- und 90 Schreibaufgaben – genau die Mengen aus PLAN §5.1.
- 126 Grammatikpunkte (A1 27, A2 27, B1 30, B2 28, C1 14) in der Folge von PLAN §6.2, verfeinert und vervollständigt. Jeder Punkt wird in genau einer Einheit eingeführt und später mindestens einmal wiederholt.
- 150 Wortfelder; jede Einheit hat zwei bis vier, einige kehren auf höheren Stufen wieder.
- Vorkurs „Schrift und Harakat“ mit acht Lektionen vor A1. Er nutzt die Bausteine der bestehenden Elifbe nur für das Lesen der Schrift, ohne Koranverse.
- Schauplätze sind Wetzlar und Amman, dazu eine Reise nach Tunis. Familie al-Ḥaddād, die Großeltern in Amman, Verwandte, Freundinnen, Freunde und Nachbarn begleiten die Lernenden von A1 bis C1 und werden mit ihnen älter.
- Abdeckung: A1 soll ≥ 85 % der 500 häufigsten alltagstauglichen Lemmata einführen (Modell 90,6 %), C1 ≥ 88 % der Top-5.000 (Modell 93,9 %).
- Religion ist kein Lernthema. 23 gesperrte Kandidaten-Verweise auf Orte, Ereignisse und Formeln des Leitfadens stehen in 14 Einheiten, nie als Lernziel.

## 2 Für wen und wofür

### 2.1 Lernende

- **Deutschsprachige** beginnen ohne Vorwissen mit dem Vorkurs. Für sie zählen Schrift, Laute ohne deutsche Entsprechung (ḥ, ʿ, q, emphatische Laute) und das Wurzelsystem; kontrastive Tipps erklären fehlendes „sein“ im Präsens, Wortstellung, Genus und Fälle.
- **Türkischsprachige**, darunter viele, die die Schrift aus dem Elifbe-Unterricht lesen können. Die Einstufung erkennt dieses Vorwissen (PLAN §4.4); der Vorkurs bleibt dann für die Laute des Hocharabischen und für Pausa und Tanwīn empfohlen, weil die türkische Leseaussprache manche Laute zusammenfallen lässt. Viele türkische Lehnwörter stammen aus dem Arabischen (kitap – kitāb, ders – dars, saat – sāʿa); die Tipps der Richtung `ar-aus-tr` zeigen Bedeutungsunterschiede und falsche Freunde, ohne religiöse Wörter zu verwenden.
- **Alter:** Kinder ab etwa zehn Jahren bis zu Älteren. A1–B1 sind vollständig kindgeeignet (Leitfaden §6), B2–C1 behandeln Erwachsenenthemen sachlich.

### 2.2 Hocharabisch im Kurs

- Gelehrt wird modernes Hocharabisch (Fuṣḥā), immer voll vokalisiert, einschließlich der Fallendungen. Gesprochen wird am Satzende in Pausa (ohne kurze Endung); das lernen die Lernenden im Vorkurs.
- Auch Alltagsdialoge stehen in einfacher, gesprochener Fuṣḥā. Regionale Umgangssprachen werden erst in C1 erkannt und eingeordnet, nicht produziert (OF-ar-11).
- Fachbegriffe der Grammatik (Iḍāfa, Muḍāriʿ, Māḍī, Iʿrāb) stehen in den Tipps neben deutschen bzw. türkischen Bezeichnungen (OF-ar-09).

### 2.3 Schauplätze und Figuren, die mitwachsen

Alle Namen stammen aus der Namensliste des Leitfadens (§1.1); jede Einheit mischt die drei Sprachräume. Familiennamen erscheinen erst ab A2 und nur in der förmlichen Anrede (Frau Becker, Herr Yılmaz), nie zusammen mit dem Vornamen. Schauplätze sind Wetzlar, Amman (Großeltern und Verwandte) und Tunis (Reise in B1); Länder werden gleichwertig behandelt, ohne Politik (G-03, G-05, OF-ar-10).

| Familie oder Rolle | Personen | Entwicklung im Kurs |
|---|---|---|
| Familie al-Ḥaddād (Wetzlar) | Laylā (11), Yazan (14), Mutter Hind (Apothekerin), Vater Bāsil (Krankenpfleger, kocht gern) | Laylā: Arabisch-AG, Redaktionspraktikum, Studium, Übersetzerin; Yazan: Fahrschule, Praktikum, Ausbildung zum Elektroniker, Techniker |
| Großeltern (Amman, oft zu Besuch) | Oma Samīra, Opa Nizār | Erinnerungen (B1), Knieoperation und Pflege (B2), Erzählcafé (C1) |
| Verwandte in Amman | Tante Lubnā (Architektin), Onkel Hišām (Bäcker), Cousine Rīm, Cousin Fāris, Rīms Mann Ayman | Hochzeit (A2), Wohnungssuche (B1), Studium und Wasserprojekt (B2–C1) |
| Freundinnen und Freunde | Elif, Lena, Jan, Emre | gemischte Gruppen; enge Freundschaften unter Mädchen bzw. unter Jungen (OF-16) |
| Lehrkräfte, Nachbarschaft, Berufe | Lehrerin Nādiya, Nachbarin Ursula (ab A2 Frau Becker), Familie Yılmaz mit Defne, Kinderärztin Sawsan, Händler Ġassān, Verkäufer Fādī, Fahrlehrer Murād, Redakteurin Dāliya, Feuerwehrfrau Katharina, Physiotherapeut Florian, Frau Wagner, Herr Schneider, Frau Neumann, Frau Schulz, Frau Klein, Frau Koch, Frau Hartmann | Frauen und Männer in allen Berufen (G-09) |

### 2.4 Religion

Religion ist kein Lernthema (Leitfaden §4). Grüße und Wünsche werden mit den weltlichen Formen gelernt (marḥaban, ahlan, ṣabāḥ al-ḫayr, masāʾ al-ḫayr, maʿa s-salāma, šukran, ʿafwan, mabrūk, šifāʾan ʿāǧilan, aḥarr at-taʿāzī). Orte, Ereignisse und Formeln mit Religionsbezug stehen nur als gesperrte Kandidaten in `religionsbezugKandidaten` (§8). Sie sind nicht Lernziel, nicht im Lemma-Budget, nicht im Prüfstein, haben keine Sprachausgabe und sind erst nach zwei religiösen Freigaben sichtbar. Jede Lektion ist ohne sie vollständig. Wer religiöse Texte verstehen möchte, findet dafür den getrennten Pfad „Koran-Arabisch“ (PLAN §5.3).

## 3 Ziele je Stufe

### A1 – 600 neue Lemmata, 2.400 Sätze

- Ich kann arabische Wörter und kurze Sätze mit allen Vokalzeichen lesen und laut vorlesen.
- Ich kann mich und meine Familie mit Namen, Alter, Herkunft und Sprachen vorstellen.
- Ich kann Dinge in der Schule und zu Hause benennen und sagen, wo sie sind.
- Ich kann auf dem Markt sagen, was ich möchte, nach dem Preis fragen und Zahlen bis hundert verstehen.
- Ich kann Uhrzeiten, Wochentage und meinen Tagesablauf nennen.
- Ich kann kurze, langsam gesprochene Fragen zu vertrauten Dingen verstehen und kurz antworten.
- Ich kann Schilder, Stundenpläne und kurze Nachrichten mit bekannten Wörtern lesen.
- Ich kann sagen, wie es mir geht und was mir wehtut.

### A2 – 900 neue Lemmata, 3.600 Sätze

- Ich kann erzählen, was ich gestern, am Wochenende oder in den Ferien gemacht habe.
- Ich kann über Pläne sprechen und mich verabreden.
- Ich kann einfache Alltagsaufgaben erledigen: einen Termin machen, eine Fahrkarte kaufen, ein Paket aufgeben, beim Arzt Beschwerden schildern.
- Ich kann Menschen, Kleidung und Orte beschreiben und miteinander vergleichen.
- Ich kann höflich bitten, danken, gratulieren und mich entschuldigen.
- Ich kann kurze Texte wie Einladungen, Aushänge, Beipackzettel und Nachrichten verstehen.
- Ich kann kurze Nachrichten, Karten und Formulare in arabischer Schrift schreiben.

### B1 – 1.300 neue Lemmata, 5.200 Sätze

- Ich kann von Erinnerungen, Erfahrungen und Plänen zusammenhängend erzählen und meine Meinung kurz begründen.
- Ich kann in Schule, Wohnung, Praktikum und Behörde die meisten Situationen sprachlich bewältigen.
- Ich kann wiedergeben, was andere gesagt haben, und gezielt nachfragen.
- Ich kann neue Wörter über Wurzel und Verbstamm erschließen und im Wörterbuch finden.
- Ich kann Sachtexte, Briefe und einfache Berichte zu vertrauten Themen verstehen.
- Ich kann zusammenhängende Texte wie E-Mails, Berichte und Erlebnisberichte schreiben und dabei die Endungen meist richtig setzen.

### B2 – 1.700 neue Lemmata, 6.800 Sätze

- Ich kann Nachrichten, Reportagen und Sachtexte zu vielen Themen im Wesentlichen verstehen.
- Ich kann Vor- und Nachteile abwägen, Bedingungen formulieren und eine Position begründen.
- Ich kann mit Ämtern, Vermietern und Banken mündlich und schriftlich förmlich kommunizieren.
- Ich kann über Arbeit, Ausbildung, Gesundheit und Umwelt ausführlich sprechen.
- Ich kann Statistiken und Grafiken beschreiben.
- Ich kann gegliederte Texte wie förmliche Briefe, Berichte und Stellungnahmen schreiben.

### C1 – 2.000 neue Lemmata, 8.000 Sätze

- Ich kann lange, anspruchsvolle Texte aus Presse, Verwaltung, Wissenschaft und Literatur verstehen und ihre Absicht erkennen.
- Ich kann mich spontan und fließend in Fuṣḥā äußern, auch in Diskussionen und Präsentationen.
- Ich kann komplexe Sachverhalte klar gegliedert darstellen und begründet argumentieren.
- Ich kann Register unterscheiden und regionale Umgangssprachen an ihren Merkmalen erkennen.
- Ich kann Texte zusammenfassen, umformulieren und kommentieren.
- Ich kann weltliche Redewendungen und Sprichwörter verstehen und passend verwenden.

### 3.1 Mengen (PLAN §5.1, verbindlich)

| Stufe | Einheiten | Stationen | neue Lemmata (Σ) | Sätze | Dialoge und Geschichten | Lesetexte | Sprechen / Schreiben |
|---|---|---|---|---|---|---|---|
| A1 | 12 | 96 | 600 (600) | 2.400 | 24 | 6 | 24 / 0 |
| A2 | 14 | 112 | 900 (1.500) | 3.600 | 28 | 14 | 28 / 14 |
| B1 | 16 | 128 | 1.300 (2.800) | 5.200 | 32 | 32 | 32 / 16 |
| B2 | 16 | 128 | 1.700 (4.500) | 6.800 | 32 | 48 | 32 / 32 |
| C1 | 14 | 112 | 2.000 (6.500) | 8.000 | 28 | 56 | 28 / 28 |
| **Σ** | **72** | **576** | **6.500** | **26.000** | **144** | **156** | **144 / 90** |

Jede Einheit hat acht Stationen: fünf Lektionen, eine Geschichte (Dialog), eine Wiederholung, einen Prüfstein. Je Einheit gibt es zwei Dialoge oder Geschichten: die Station „Geschichte“ und einen Dialog in einer Lektion (Übungstyp `dialog`). Mehrere Lese-, Sprech- oder Schreibaufgaben einer Einheit stehen in der JSON-Datei als nummerierte Zeichenkette („1) … 2) …“), wie in den Rahmenplänen Deutsch und Türkisch.

## 4 Vorkurs „Schrift und Harakat“ (8 Lektionen)

Der Vorkurs nutzt die Bausteine der bestehenden Elifbe (`web/src/lib/elifbe/{alphabet,uebung,zuege,silben}.ts`, `Schreibweg.tsx`) nur für Buchstaben, Formen und Lesezeichen (PLAN §4.4). Die Elifbe-Seiten der Website bleiben unverändert. Übungswörter und Silben sind Alltagswörter; es gibt keine Koranverse, keine Koranwörter als Lernziel und keine religiösen Formeln. Buchstabennamen folgen dem Hocharabischen (Texte in `messages/lernapp/*.json`); für Türkischsprachige stehen die Elifbe-Namen daneben. Sprachausgabe wie in den Sprachkursen (KERN §4); solange keine arabische Stimme freigegeben ist, laufen Hörübungen mit „Audio folgt“.

### ar.v.l01 – Leserichtung und erste Buchstaben (für: de, tr)

**Ziel:** Ich kann von rechts nach links lesen und 14 Buchstaben an Grundform und Punkten erkennen.

- Leserichtung von rechts nach links; Hefte und Bücher öffnen sich von der anderen Seite
- Buchstabenfamilien mit gleicher Grundform, unterschieden nur durch Zahl und Lage der Punkte: bāʾ, tāʾ, ṯāʾ, nūn, yāʾ; ǧīm, ḥāʾ, ḫāʾ; dāl, ḏāl; rāʾ, zāy; dazu alif und wāw
- Laute mit Entsprechung zuerst: ḫ wie in „Bach“, ǧ wie türkisch c, ṯ und ḏ wie englisch th
- Buchstabennamen nach Hocharabisch (alif, bāʾ, tāʾ …); für Türkischsprachige stehen die Elifbe-Namen (elif, be, te …) daneben
- Übungstypen: schrift_ar (erkennen, zuordnen), hoeren_waehlen; Bausteine aus web/src/lib/elifbe/alphabet.ts

### ar.v.l02 – Die übrigen Buchstaben und neue Laute (für: de, tr)

**Ziel:** Ich kann alle 28 Buchstaben und die Hamza erkennen und Laute unterscheiden, die es im Deutschen und Türkischen nicht gibt.

- sīn, šīn, ṣād, ḍād, ṭāʾ, ẓāʾ, ʿayn, ġayn, fāʾ, qāf, kāf, lām, mīm, hāʾ; die Hamza als eigenes Zeichen
- Kehllaute ḥ, ʿ und h; emphatische Laute ṣ, ḍ, ṭ, ẓ mit dunkler Vokalfärbung; q weiter hinten als k
- Minimalpaare nur mit Alltagswörtern: sīn – ṣād, tāʾ – ṭāʾ, dāl – ḍād, hāʾ – ḥāʾ, kāf – qāf, Hamza – ʿayn
- Kontrast für Türkischsprachige: In türkischen Lehnwörtern aus dem Arabischen fallen viele dieser Laute zusammen (s, ṣ, ṯ; z, ḏ, ḍ, ẓ); im Hocharabischen unterscheiden sie Bedeutungen
- Übungstypen: minimalpaare, hoeren_waehlen, schrift_ar

### ar.v.l03 – Formen und Verbindungen (für: de, tr)

**Ziel:** Ich kann die Formen eines Buchstabens am Anfang, in der Mitte und am Ende erkennen und Wörter in Buchstaben zerlegen.

- vier Formen: allein, am Anfang, in der Mitte, am Ende
- sechs Buchstaben verbinden sich nicht nach links: alif, dāl, ḏāl, rāʾ, zāy, wāw; danach beginnt eine neue Gruppe im Wort
- Ligatur lām-alif; Tāʾ marbūṭa am Wortende; Alif maqṣūra (yāʾ ohne Punkte)
- Wörter zusammensetzen und zerlegen: bāb, bint, walad, qalam, madrasa
- Nachspuren mit Schreibweg.tsx (B-17), Alternative „auf Papier geschrieben“; Bausteine zuege.ts und schreibweg.ts der Elifbe

### ar.v.l04 – Kurze Vokale (für: de, tr)

**Ziel:** Ich kann Fatḥa, Kasra und Ḍamma lesen und Silben und kurze Wörter laut lesen.

- Fatḥa (a), Kasra (i), Ḍamma (u) über bzw. unter dem Buchstaben
- Silben lesen (ba, bi, bu) und Wörter aus drei Silben (kataba, darasa)
- Im Alltag fehlen die kurzen Vokale meist; im Kurs ist jeder Text voll vokalisiert
- Vokale klingen neben emphatischen Lauten dunkler
- Übungstypen: schrift_ar (lesen), hoeren_waehlen; Silbentafeln aus silben.ts der Elifbe, nur mit Alltagssilben

### ar.v.l05 – Lange Vokale und Doppellaute (für: de, tr)

**Ziel:** Ich kann lange und kurze Vokale unterscheiden und die Doppellaute ay und aw lesen.

- ā mit alif, ī mit yāʾ, ū mit wāw
- Minimalpaare kurz – lang: ǧamal – ǧamāl, kataba – kātaba
- Doppellaute ay (bayt) und aw (yawm)
- Alif maqṣūra als ā am Wortende (maqhā, mustašfā)
- Übungstypen: minimalpaare, hoeren_waehlen, schrift_ar

### ar.v.l06 – Sukūn und Šadda (für: de, tr)

**Ziel:** Ich kann vokallose und verdoppelte Konsonanten lesen und hören.

- Sukūn: Konsonant ohne Vokal schließt die Silbe (bint, maktab)
- Šadda: der Konsonant wird verdoppelt (madrasa – mudarris, darasa – darrasa)
- Šadda zusammen mit einem Vokalzeichen
- Minimalpaare mit und ohne Šadda
- Übungstypen: minimalpaare, schrift_ar

### ar.v.l07 – Tanwīn, Tāʾ marbūṭa und Pausa (für: de, tr)

**Ziel:** Ich kann Tanwīn lesen, die Tāʾ marbūṭa richtig aussprechen und am Satzende in Pausa sprechen.

- Tanwīn -un, -an, -in als doppelte Vokalzeichen; bei -an meist ein zusätzliches alif
- Tāʾ marbūṭa: -a am Satzende, -at, wenn ein Wort eng folgt
- Pausa (Waqf): am Satzende fällt die kurze Endung weg (kitābun → kitāb)
- Ziffern 0–9 in westlicher und östlich-arabischer Form; Zahlen werden von links nach rechts geschrieben
- Übungstypen: schrift_ar, hoeren_waehlen

### ar.v.l08 – Hamza, Artikel und Wortverbindung (für: de, tr)

**Ziel:** Ich kann die Grundregeln der Hamza anwenden und den Artikel vor Sonnen- und Mondbuchstaben richtig lesen.

- Hamza auf alif, wāw, yāʾ oder auf der Zeile; Grundregel: Der Träger folgt dem stärksten Vokal daneben (Ausbau in B2, ar.g.hamza_schreibung)
- Hamzat al-qaṭʿ (immer gesprochen) und Hamzat al-waṣl (fällt im Satz weg); Madda für ā am Wortanfang
- Artikel al-: vor Mondbuchstaben hörbar (al-qamar, al-bāb), vor Sonnenbuchstaben angeglichen und verdoppelt (aš-šams, an-nāfiḏa)
- Verbindung über die Wortgrenze: fī l-bayt, wa-l-walad
- Abschluss: kurze Alltagssätze voll vokalisiert lesen, ohne Koranverse und ohne religiöse Formeln
- Übungstypen: schrift_ar, hoeren_waehlen, minimalpaare

## 5 Grammatikfolge

### 5.1 Grundlage und Verfeinerung

PLAN §6.2 legt die Folge fest: Schrift/Harakat → Nominalsatz, Artikel und Sonnen-/Mondbuchstaben, Genus, Suffixe, Iḍāfa, Muḍāriʿ (A1) → Māḍī, Plurale, Kongruenz, Präpositionen (A2) → Verbstämme II–X, schwache Verben, Relativsätze, Dual, Zahl + Tamyīz, Iʿrāb (B1) → Passiv, kāna/inna, Bedingung, Maṣdar (B2) → Stil, komplexe Syntax, Register (C1). Der Rahmenplan hält diese Folge ein und ergänzt sie:

- **Vorkurs und A1:** Schrift und Harakat stehen im Vorkurs. A1 beginnt mit Personalpronomen und Nominalsatz, damit schon in der ersten Einheit ganze Sätze ohne Verb möglich sind („anā Laylā“, „al-bayt kabīr“). Ergänzt sind Fragepartikel, Fragewörter, „es gibt“, „haben“ mit ʿinda/li-/maʿa, laysa, Zahlen bis 100, Ordnungszahlen mit Uhrzeit, Imperativ, Farben und als Lernhilfe „Wurzel und Muster“. Der Genitiv nach Präpositionen wird als Hörbild eingeführt, weil die volle Vokalisierung die Endungen von Anfang an zeigt.
- **A2:** Neben Māḍī, Pluralen, Kongruenz und Präpositionen mit Endungen stehen Zukunft (sa-, sawfa, lan), Konjunktiv und Jussiv in ihren ersten Verwendungen (an, lam, Verbot), Akkusativ, Elativ und Partizipien des Grundstamms. kāna als „war“ kommt schon hier (die Schwestern folgen in B2), ebenso li-anna („weil“); Verbalnomen werden lexikalisch gelernt, systematisch in B2.
- **B1:** Verbstämme II–X und alle Klassen schwacher Verben werden als System erarbeitet; dazu Relativsätze, Dual, Zahl und Gezähltes, die drei Fälle als Zusammenfassung mit Diptota und den fünf Nomen, die Modi im Überblick, dass-Sätze mit anna und Zeitsätze (einschließlich iḏā als „wenn, sobald“).
- **B2:** Passiv, kāna- und inna-Schwestern, reale und irreale Bedingung, Verbalnomen der Stämme II–X und Verbalnomen statt an-Satz; ergänzt um Ḥāl, inneres Objekt, Akkusativ des Grundes, Tamyīz, Ausnahme, Einräumung, Textverbinder, Redewiedergabe, förmliche Briefe und die Schreibung der Hamza.
- **C1:** verdichtet: Nominalstil, Amts- und Berichtsstil, lange Iḍāfa-Ketten, Hervorhebung, verstärkte Verneinung, Vermutung, Argumentation, Wortbildung moderner Begriffe, Stilmittel, weltliche Redewendungen und das Erkennen von Registern. Die letzte Einheit (ar.c1.e14) führt nichts Neues ein und wiederholt alles.

**Regeln, automatisch geprüft:** Jede Grammatik-ID wird in genau einer Einheit eingeführt (Stufe der ID = Stufe der Einheit) und in mindestens einer späteren Einheit wiederholt. Jede Voraussetzung (`voraus`) ist vorher eingeführt. Keine Einheit ist ohne Grammatik oder ohne Wortfeld. In `grammatik` einer Einheit stehen zuerst die neuen IDs, danach die Wiederholungen. Die letzte Einheit jeder Stufe wiederholt alle Punkte der Stufe, die bis dahin noch nicht wiederholt wurden.

### 5.2 A1 (27 Punkte)

| ID | Titel | Was gelernt wird | Beispiele | eingeführt | wiederholt in | Voraussetzung |
|---|---|---|---|---|---|---|
| `ar.g.personalpron` | Personalpronomen | anā, anta, anti, huwa, hiya, naḥnu, antum, hum. anta und anti unterscheiden, ob man einen Mann oder eine Frau anspricht. Dual und weibliche Mehrzahl folgen in B1. | anā Laylā. / man anta? / hiya muʿallima. | a1.e01 | a1.e02, a1.e06 | – |
| `ar.g.nominalsatz` | Nominalsatz ohne „sein“ | Im Präsens gibt es kein Verb „sein“: Subjekt und Aussage stehen einfach nebeneinander. Das Subjekt ist meist bestimmt, die Aussage unbestimmt. | anā tilmīḏa. / al-bayt kabīr. / Yazan fī l-madrasa. | a1.e01 | a1.e02 | personalpron |
| `ar.g.nisba` | Herkunft und Sprache mit -ī / -iyya | Nisba-Adjektive nennen Herkunft und Sprache: almānī, turkī, ʿarabī, weiblich almāniyya, turkiyya, ʿarabiyya. Sprachen stehen mit Artikel: al-ʿarabiyya. | anā almāniyya. / Elif turkiyya. / hal tatakallam al-ʿarabiyya? | a1.e01 | a1.e12 | nominalsatz |
| `ar.g.genus` | Maskulin und feminin | Jedes Nomen ist maskulin oder feminin. Feminin sind die meisten Nomen auf -a (Tāʾ marbūṭa) und einige ohne Kennzeichen (umm, bint, šams). Adjektive und Pronomen richten sich danach. | ṭālib – ṭāliba / muʿallim – muʿallima / ḥaqība (f.), qalam (m.) | a1.e02 | a1.e03 | – |
| `ar.g.hinweis` | Hinweiswörter hāḏā, hāḏihi, ḏālika, tilka | hāḏā (m.) und hāḏihi (f.) zeigen auf Nahes, ḏālika und tilka auf Fernes. „hāḏā qalam“ ist ein ganzer Satz: „Das ist ein Stift.“ | hāḏā qalam. / hāḏihi sabbūra. / mā hāḏā? – hāḏā daftar. | a1.e02 | a1.e03 | genus |
| `ar.g.fragepartikel` | Ja-Nein-Fragen mit hal und a- | hal oder a- vor dem Satz machen eine Ja-Nein-Frage, ohne die Wortstellung zu ändern. Antwort mit naʿam oder lā. | hal hāḏā qalam? – naʿam. / a-anta Yazan? / hal anti ṭāliba? – lā, anā muʿallima. | a1.e02 | a1.e04 | nominalsatz |
| `ar.g.artikel` | Bestimmter Artikel al- und Tanwīn | al- macht ein Nomen bestimmt und wird mit dem Wort zusammengeschrieben. Unbestimmte Nomen tragen Tanwīn (-un, -an, -in); ein eigenes Wort für „ein“ gibt es nicht. | kitābun – al-kitābu / ġurfatun – al-ġurfatu / walad – al-walad | a1.e03 | a1.e04, a1.e05 | genus |
| `ar.g.sonne_mond` | Sonnen- und Mondbuchstaben | Vor den 14 Sonnenbuchstaben (t, ṯ, d, ḏ, r, z, s, š, ṣ, ḍ, ṭ, ẓ, l, n) gleicht sich das l des Artikels an, der Buchstabe wird verdoppelt. Vor Mondbuchstaben bleibt al- hörbar. Nach einem Vokal fällt das a von al- weg. | aš-šams, as-sayyāra, an-nāfiḏa / al-qamar, al-bāb, al-maṭbaḫ / fī l-bayt, wa-š-šāriʿ | a1.e03 | a1.e05 | artikel |
| `ar.g.adjektiv` | Adjektiv als Attribut und als Aussage | Als Attribut steht das Adjektiv nach dem Nomen und richtet sich nach Genus und Bestimmtheit (bayt kabīr, al-bayt al-kabīr). Hat nur das Nomen den Artikel, entsteht ein Satz: al-bayt kabīr („Das Haus ist groß“). | ġurfa kabīra / as-sarīr al-ǧadīd / al-maṭbaḫ ṣaġīr. | a1.e03 | a1.e04, a1.e05, a1.e11 | artikel, genus |
| `ar.g.suffix_nomen` | Besitzendungen am Nomen | Besitz zeigt eine Endung am Nomen: -ī, -ka, -ki, -hu, -hā, -nā, -kum, -hum. Das Nomen steht dann ohne Artikel; aus -a wird -at-. | baytī, baytuka, baytuhā / ummī, uḫtuhu, ǧaddatunā / ġurfa – ġurfatī | a1.e04 | a1.e10, a2.e02, a2.e10, b1.e10 | artikel |
| `ar.g.besitz_inda` | „haben“ mit ʿinda, li- und maʿa | Ein Verb „haben“ gibt es nicht: ʿindī (bei mir) für Besitz und Familie, lī (für mich) für Beziehungen, maʿī (mit mir) für das, was man gerade dabeihat. | ʿindī aḫ wa-uḫt. / hal ʿindaka qiṭṭa? / maʿī hātifī. | a1.e04 | a1.e07, a2.e03 | suffix_nomen |
| `ar.g.zahlen_bis_10` | Zahlen 0–10, Ziffern und Alter | Grundzahlen ṣifr bis ʿašara zum Zählen und für Telefonnummern; Ziffern in westlicher und östlich-arabischer Form erkennen. Das Alter steht als feste Wendung; die Regeln für Zahl und Gezähltes folgen in B1. | wāḥid, iṯnān, ṯalāṯa, arbaʿa, ḫamsa / raqm hātifī … / kam ʿumruka? – ʿumrī ʿašr sanawāt. | a1.e04 | a1.e07 | – |
| `ar.g.praep_ort` | Ortspräpositionen und Genitiv | fī, ʿalā, taḥta, amāma, waraʾa, ǧanba, bayna. Das folgende Nomen steht im Genitiv (Endung -i); in der vollen Vokalisierung ist das sichtbar, die Regel wird zunächst als Hörbild gelernt. | al-kitāb ʿalā ṭ-ṭāwila. / al-qiṭṭa taḥta s-sarīr. / fī l-bayti | a1.e05 | a1.e06, a2.e01, b1.e10 | artikel, sonne_mond |
| `ar.g.hunaka` | „Es gibt“: hunāka und vorangestellter Ort | „Es gibt“ heißt hunāka oder man stellt die Ortsangabe vor ein unbestimmtes Nomen: fī ġurfatī sarīr. | hunāka maktaba fī š-šāriʿ. / fī ġurfatī sarīr wa-maktab. / hal hunāka ṣaydaliyya qarība? | a1.e05 | a1.e11, a2.e05, b1.e08 | praep_ort |
| `ar.g.fragewoerter` | Fragewörter | man, mā/māḏā, ayna, kayfa, kam, matā, limāḏā stehen am Satzanfang; mā vor Nomen, māḏā vor Verben. | ayna l-maḥaṭṭa? / man hāḏā? / kayfa ḥāluki? | a1.e05 | a1.e06 | fragepartikel |
| `ar.g.mudari_sg` | Präsens (Muḍāriʿ): Einzahl | Das Präsens entsteht aus Vorsilbe und Endung am Verbstamm: aktub, taktub, taktubīna, yaktub, taktub. Es steht für Gegenwart und Gewohnheit. | anā adrus al-ʿarabiyya. / Yazan yalʿab fī l-ḥadīqa. / anti taktubīna risāla. | a1.e06 | a1.e07, a1.e08 | personalpron |
| `ar.g.konjunktion` | Sätze verbinden: wa, fa-, ṯumma, lākin, aw | wa (und), fa- (und dann, also), ṯumma (danach), lākin (aber), aw (oder). wa und fa- werden an das nächste Wort gehängt. | astayqiẓ ṯumma aḏhab ilā l-madrasa. / šāy aw ḥalīb? / al-ǧaww bārid lākin ǧamīl. | a1.e06 | a1.e08 | – |
| `ar.g.zahlen_bis_100` | Zahlen 11–100 und Preise | Zehner auf -ūn/-īn (ʿišrūn, ṯalāṯūn), Einer vor dem Zehner mit wa (ḫamsa wa-ʿišrūn). Preise zunächst als Wendung mit yūrū; die Regeln für Zahl und Gezähltes folgen in B1. | aḥad ʿašar, iṯnā ʿašar / ʿišrūn, ḫamsūn, miʾa / as-siʿr: ʿišrūn yūrū. | a1.e07 | a1.e09, a2.e07 | zahlen_bis_10 |
| `ar.g.idafa` | Genitivverbindung (Iḍāfa) | Zwei Nomen bilden eine Einheit: Das erste steht ohne Artikel und ohne Tanwīn, das zweite im Genitiv. Ist das zweite bestimmt, ist die ganze Verbindung bestimmt. | bāb al-bayt / madrasat Laylā / kīlū ṭamāṭim | a1.e07 | a1.e08, a1.e10, b1.e10 | praep_ort |
| `ar.g.mudari_pl` | Präsens: Mehrzahl | Mehrzahlformen naktub, taktubūna, yaktubūna; das Pronomen steht oft davor. | naḥnu nalʿab kurat al-qadam. / hal tasbaḥūna kull usbūʿ? / hum yaṭbuḫūna maʿan. | a1.e08 | a1.e09, a1.e10, a2.e05 | mudari_sg |
| `ar.g.la_mudari` | Verneinung im Präsens mit lā | lā vor dem Muḍāriʿ verneint Gegenwart und Gewohnheit. | lā alʿab at-tanis. / Yazan lā yašrab al-qahwa. / lā nadrus yawm as-sabt. | a1.e08 | a1.e09, a2.e02 | mudari_sg |
| `ar.g.ordinal_uhrzeit` | Ordnungszahlen und Uhrzeit | Ordnungszahlen al-awwal bis aṯ-ṯānī ʿašar nennen die Stunde: as-sāʿa aṯ-ṯāliṯa. Halbe und Viertelstunden mit wa-n-niṣf, wa-r-rubʿ, illā rubʿan; ein Uhr heißt as-sāʿa al-wāḥida. | kam as-sāʿa? – as-sāʿa al-wāḥida. / as-sāʿa ar-rābiʿa wa-n-niṣf / ad-dars fī s-sāʿa aṯ-ṯāmina. | a1.e09 | a1.e12, a2.e01, a2.e03, a2.e09 | zahlen_bis_10, artikel |
| `ar.g.laysa` | Verneinung des Nominalsatzes mit laysa | laysa („ist nicht“) verneint Sätze ohne Verb und ändert sich nach der Person: lastu, lasta, lasti, laysa, laysat. Die Aussage danach steht im Akkusativ; die Regel folgt in B2. | lastu ǧawʿān. / al-maktaba laysat baʿīda. / laysa ʿindī waqt. | a1.e09 | a1.e12 | nominalsatz |
| `ar.g.imperativ` | Aufforderung (Imperativ) | Imperativ für du (m./f.) und ihr: uktub, uktubī, uktubū; iǧlis, iǧlisī. Höflich mit min faḍlik bzw. min faḍliki. | iǧlis, min faḍlik. / iftaḥī n-nāfiḏa, min faḍliki. / uktubū asmāʾakum. | a1.e10 | a1.e11, a2.e08, a2.e09 | mudari_sg |
| `ar.g.wunsch` | Wünsche: urīdu und uḥibbu | urīdu + Nomen (ich möchte …), urīdu an + Verb als feste Wendung, uḥibbu (ich mag). Die Verbform nach an wird in A2 erklärt. | urīd kūb māʾ, min faḍlik. / urīd an aḏhab ilā l-ḥadīqa. / uḥibb ar-ruzz maʿa d-daǧāǧ. | a1.e10 | a1.e11, a2.e04, a2.e06 | mudari_sg |
| `ar.g.farben` | Farben | Grundfarben haben eigene Formen für m. und f.: aḥmar – ḥamrāʾ, azraq – zarqāʾ, aḫḍar – ḫaḍrāʾ, aṣfar – ṣafrāʾ, aswad – sawdāʾ, abyaḍ – bayḍāʾ. Andere Farben sind Nisba-Formen (bunnī, burtuqālī). | qamīṣ azraq / sutra ḥamrāʾ / al-ḥiḏāʾ al-aswad | a1.e11 | a1.e12, a2.e06 | adjektiv |
| `ar.g.wurzel` | Wurzel und Muster | Die meisten Wörter bestehen aus drei Wurzelkonsonanten in einem Muster: k-t-b → kataba, kitāb, maktab, maktaba, kātib. Wer die Wurzel erkennt, findet Wörter im Wörterbuch und errät Bedeutungen. | d-r-s: darasa, dars, madrasa, mudarris / ṭ-b-ḫ: ṭabaḫa, maṭbaḫ, ṭabbāḫ / l-ʿ-b: laʿiba, lāʿib, malʿab | a1.e12 | a2.e01, a2.e08, b1.e01, b1.e02 | mudari_sg |

### 5.3 A2 (27 Punkte)

| ID | Titel | Was gelernt wird | Beispiele | eingeführt | wiederholt in | Voraussetzung |
|---|---|---|---|---|---|---|
| `ar.g.madi_sg` | Vergangenheit (Māḍī): Einzahl | Abgeschlossene Handlungen mit Endungen am Stamm: katabtu, katabta, katabti, kataba, katabat. | ḏahabtu ilā s-sūq. / hal šaribta š-šāy? / rakibat Laylā al-qiṭār. | a2.e01 | a2.e02, a2.e08 | mudari_pl |
| `ar.g.kana_war` | kāna: „war“ | kāna verlegt einen Satz ohne Verb in die Vergangenheit: kuntu, kunta, kunti, kāna, kānat. Die Aussage steht im Akkusativ: kāna l-ǧawwu ǧamīlan. | kuntu fī Frankfurt. / kāna l-ǧawwu ǧamīlan. / hal kunti marīḍa? | a2.e01 | a2.e10, b1.e01 | madi_sg, laysa |
| `ar.g.madi_pl` | Vergangenheit: Mehrzahl und Verneinung mit mā | katabnā, katabtum, katabū (das Alif am Ende wird nicht gesprochen); verneint mit mā + Māḍī. | sāfarnā ilā ʿAmmān. / māḏā faʿaltum ams? / mā ʿarafū l-ʿunwān. | a2.e02 | a2.e03, a2.e04, a2.e07, a2.e13, b1.e01 | madi_sg |
| `ar.g.lam_jussiv` | Verneinte Vergangenheit: lam + Jussiv | lam mit der Kurzform des Muḍāriʿ (Jussiv) verneint Vergangenes; -ūna wird zu -ū, -īna zu -ī. | lam aktub ar-risāla baʿd. / lam yaḏhabū ilā l-madrasa. / lam tafhamī s-suʾāl? | a2.e02 | a2.e09 | madi_pl, mudari_pl, la_mudari |
| `ar.g.datum` | Datum: Monate und Jahre | Datum mit Ordnungszahl oder Ziffer, Monatsname und Jahr. Es gibt zwei Reihen von Monatsnamen (yanāyir, fabrāyir … und kānūn aṯ-ṯānī, šubāṭ …); der Kurs übt die erste und lässt die zweite erkennen. | al-yawm al-iṯnayn, al-ʿāšir min abrīl. / tārīḫ al-mīlād: 3 māyū 2014 / al-mawʿid yawm al-ḫamīs. | a2.e03 | a2.e04, b1.e04, b1.e11 | ordinal_uhrzeit |
| `ar.g.anrede` | Höfliche Anrede | Förmlich mit as-sayyid, as-sayyida, al-ustāḏ, al-ustāḏa vor dem Namen und mit ḥaḍratuka/ḥaḍratuki statt anta/anti; die Verbformen bleiben in der Einzahl. | ṣabāḥ al-ḫayr, yā sayyida Becker. / hal ḥaḍratuka ṭ-ṭabīb? / tafaḍḍalī, yā ustāḏa Nādiya. | a2.e03 | a2.e05, b2.e06 | personalpron, suffix_nomen |
| `ar.g.sa_sawfa` | Zukunft mit sa- und sawfa; Verneinung mit lan | sa- oder sawfa vor dem Muḍāriʿ bilden die Zukunft; lan mit Konjunktiv verneint sie. | sa-nusāfir fī l-ʿuṭla. / sawfa azūr ǧaddī. / lan ataʾaḫḫar. | a2.e04 | a2.e12, a2.e13, b1.e04 | mudari_pl |
| `ar.g.mansub` | Konjunktiv (Manṣūb) nach an, li-, kay, ḥattā, lan | Nach an, li-, kay, ḥattā und lan endet der Muḍāriʿ auf -a; -ūna und -īna verlieren das n. | urīdu an azūra ʿAmmān. / ḏahabnā ilā s-sūq li-naštariya hadiyya. / lan aktuba bi-l-qalam al-aḥmar. | a2.e04 | a2.e09, b1.e11, b2.e10 | sa_sawfa, wunsch |
| `ar.g.plural_gesund` | Gesunde Mehrzahl | Männliche Personen: -ūn/-īn (muʿallimūn, muhandisūn). Weibliche Personen und viele Sachen: -āt (muʿallimāt, sayyārāt). | muhandis – muhandisūn / ṭāliba – ṭālibāt / ḥāfila – ḥāfilāt | a2.e05 | a2.e06, a2.e12 | genus |
| `ar.g.kongruenz_unbelebt` | Mehrzahl von Sachen: feminin Einzahl | Die Mehrzahl von Sachen und Tieren wird wie ein feminines Einzahlwort behandelt: Adjektiv, Pronomen und Verb stehen im Femininum Singular. | hāḏihi s-sayyārāt ǧadīda. / al-ġuraf wāsiʿa. / ayna l-mafātīḥ? – hiya fī l-ḥaqība. | a2.e05 | a2.e06, a2.e11, b1.e03 | plural_gesund, adjektiv |
| `ar.g.komparativ` | Steigerung (Elativ) | Die Form afʿal bildet Komparativ und Superlativ: akbar min (größer als), al-akbar oder akbar + Iḍāfa (der/die größte). Sie ändert sich nicht nach dem Genus. | hāḏihi s-sutra arḫaṣ min tilka. / al-qamīṣ al-azraq aǧmal. / hāḏā aḥsan maḥall fī l-madīna. | a2.e06 | a2.e07, a2.e13, b1.e03 | adjektiv, idafa |
| `ar.g.akkusativ` | Akkusativ: Objekt und Umstandsangabe | Das direkte Objekt steht im Akkusativ (-a, unbestimmt -an mit Alif). Viele Zeit- und Artangaben sind Akkusative: ṣabāḥan, ǧiddan, šukran. | aštarī sutratan ǧadīdatan. / nadrusu l-ʿarabiyyata masāʾan. / šukran ǧazīlan! | a2.e06 | a2.e14, b1.e10 | mudari_pl, artikel |
| `ar.g.plural_gebrochen` | Gebrochene Mehrzahl | Viele Nomen bilden die Mehrzahl mit einem neuen Muster: walad – awlād, bayt – buyūt, kitāb – kutub. Die häufigsten Muster werden als Gruppen gelernt. | walad – awlād / malʿab – malāʿib / bayt – buyūt | a2.e07 | a2.e10 | plural_gesund |
| `ar.g.verbalsatz_kongruenz` | Verbalsatz: Verb vor dem Subjekt | Steht das Verb vor einem genannten Subjekt, bleibt es in der Einzahl (laʿiba l-awlād). Steht das Subjekt vorn, folgt das Verb in der Mehrzahl (al-awlād laʿibū). | laʿiba l-awlād fī l-malʿab. / al-awlād laʿibū fī l-malʿab. / tadarrabat al-lāʿibāt ams. | a2.e07 | a2.e11 | madi_pl, plural_gebrochen |
| `ar.g.objektsuffix` | Objektendungen am Verb | Pronomen als Objekt hängen am Verb: -nī (mich), -ka, -ki, -hu, -hā, -nā, -kum, -hum. | faḥaṣanī ṭ-ṭabīb. / hal tafhamunī? / sa-ašrabuhu baʿda l-akl. | a2.e08 | a2.e10, b1.e05 | suffix_nomen, madi_pl |
| `ar.g.praep_suffix` | Präpositionen mit Endungen | Endungen an Präpositionen: lī, laka, lahu, lahā; ʿalayya, ʿalayhi; minnī, minhu; maʿī, maʿahu; ilayhi, fīhi. Nach -i und -ī wird -hu zu -hi. | mā bika? – ʿindī ṣudāʿ. / katabtu lahu risāla. / hal ḏahabti maʿahum? | a2.e08 | a2.e14, b1.e03 | praep_ort, suffix_nomen |
| `ar.g.verbot_jussiv` | Verbot: lā + Jussiv | Ein Verbot entsteht mit lā und der Kurzform des Muḍāriʿ: lā taktub, lā taktubī, lā taktubū. | lā tansa dafteraka! / lā tatakallamū aṯnāʾa l-imtiḥān. / lā tataʾaḫḫarī ʿan al-madrasa. | a2.e09 | a2.e14, b1.e05, b1.e06 | lam_jussiv, imperativ |
| `ar.g.notwendigkeit` | Pflicht und Notwendigkeit | yaǧibu an + Konjunktiv (man muss), lā budda min / lā budda an (es ist nötig), ʿalā + Person + an: ʿalayya an adrusa. | yaǧibu an nadrusa l-yawm. / ʿalayya an uḥaḍḍira li-l-imtiḥān. / lā budda min al-istirāḥa. | a2.e09 | a2.e13, b1.e02, b1.e05, b1.e06, b1.e07, b1.e11 | mansub, praep_suffix |
| `ar.g.praep_zeit` | Zeitangaben: munḏu, ḫilāla, ḥattā, qabla an, baʿda an | munḏu (seit), ḫilāla (während), ḥattā (bis); vor einem Verb stehen qabla an und baʿda an mit Konjunktiv. qabla und baʿda vor Nomen kennen die Lernenden schon aus A1. | askun fī Wetzlar munḏu ʿašr sanawāt. / ḫilāla l-ʿuṭla sāfarnā ilā ʿAmmān. / nataʿaššā baʿda an yaʿūda abī. | a2.e10 | a2.e11, b1.e01 | mansub |
| `ar.g.li_anna` | Begründen mit li-anna und li-ḏālika | li-anna (weil) steht mit Nomen oder Endung: li-annahu marīḍ, li-annanī mutʿab. li-ḏālika (deshalb) leitet die Folge ein. | lam taʾti ǧaddatī li-annahā marīḍa. / kāna l-ǧawwu ḥārran, li-ḏālika sabaḥnā. / aḥtāǧ ilā musāʿada li-anna l-wāǧib ṣaʿb. | a2.e10 | a2.e14, b1.e08 | kana_war, praep_suffix |
| `ar.g.partizip1` | Partizipien des Grundstamms | fāʿil (tuend: kātib, sākin, ḏāhib) und mafʿūl (getan: maktūb, maftūḥ, maġlūq) dienen als Adjektiv oder Nomen; anā ḏāhib heißt auch „ich bin auf dem Weg“. | al-ḥadīqa maftūḥa. / anā ḏāhib ilā s-sūq. / al-matḥaf maġlūq yawm al-iṯnayn. | a2.e11 | a2.e12, b1.e13, b2.e04 | wurzel, genus |
| `ar.g.kollektiv` | Sammelnomen und Einzelstück | Viele Früchte, Pflanzen und Tiere haben ein Sammelnomen (šaǧar – Bäume) und ein Einzelstück auf -a (šaǧara – ein Baum). | šaǧar – šaǧara / ward – warda / tuffāḥ – tuffāḥa | a2.e11 | a2.e14, b1.e13 | genus |
| `ar.g.verbalnomen` | Tätigkeiten als Nomen (Verbalnomen) | Tätigkeiten haben ein eigenes Nomen: qirāʾa (Lesen), kitāba (Schreiben), sibāḥa (Schwimmen), ṭabḫ (Kochen). Im Grundstamm sind die Muster nicht vorhersagbar und werden mit dem Verb gelernt; systematisch in B2. | hiwāyatī r-rasm. / uḥibb al-qirāʾa. / al-ʿamal fī l-mustašfā mutʿib. | a2.e12 | a2.e14, b1.e02, b2.e05 | wurzel |
| `ar.g.koennen` | Können und Möglichkeit | istaṭāʿa an / yastaṭīʿu an (können), yumkinu an (es ist möglich), qadara ʿalā (fähig sein). | astaṭīʿu an uṣalliḥa d-darrāǧa. / hal yumkinu an asʾala suʾālan? / lā yastaṭīʿu an yaʾtiya ġadan. | a2.e12 | a2.e14, b1.e15 | mansub |
| `ar.g.quantoren` | kull, baʿḍ, ǧamīʿ, nafs, ġayr | kull + unbestimmte Einzahl (jeder), kull + bestimmtes Nomen (ganz, alle), baʿḍ (einige), ǧamīʿ (alle), nafs (derselbe), ġayr (anders als, nicht-). | aḥḍara kull ḍayf hadiyya. / ǧāʾa baʿḍ aḍ-ḍuyūf mubakkiran. / fī nafs al-yawm | a2.e13 | a2.e14, c1.e09 | idafa |
| `ar.g.ausruf` | Bewunderung: mā afʿala! | Bewunderung mit mā + afʿala + Akkusativ: mā aǧmala l-ḥadīqa! Dazu weltliche Glückwünsche als feste Wendungen (mabrūk, alf mabrūk). | mā aǧmala l-ʿurs! / mā aṭyaba ṭ-ṭaʿām! / alf mabrūk! | a2.e13 | a2.e14, c1.e10 | komparativ, akkusativ |
| `ar.g.zahlen_gross` | Große Zahlen, Beträge und Jahreszahlen | Hunderte (miʾatān, ṯalāṯumiʾa), Tausende (alf, alfān, ālāf) und malyūn; Jahreszahlen und Beträge lesen. | miʾatān wa-ḫamsūn yūrū / sanat alfayn wa-sitta wa-ʿišrīn / ʿašarat ālāf | a2.e14 | b1.e04 | zahlen_bis_100, datum |

### 5.4 B1 (30 Punkte)

| ID | Titel | Was gelernt wird | Beispiele | eingeführt | wiederholt in | Voraussetzung |
|---|---|---|---|---|---|---|
| `ar.g.kana_mudari` | Gewohnheit in der Vergangenheit: kāna + Muḍāriʿ | kāna + Muḍāriʿ beschreibt, was früher regelmäßig geschah (kuntu alʿabu …); kāna qad + Māḍī zeigt, dass etwas schon vorher geschehen war. | kuntu alʿab fī š-šāriʿ maʿa ǧīrānī. / kānat ǧaddatī taḫbiz kull ṣabāḥ. / kāna l-qiṭār qad ġādara qabla wuṣūlī. | b1.e01 | b1.e09, b1.e15, b2.e12 | kana_war, mudari_pl |
| `ar.g.verb_hohl` | Hohle Verben | Verben mit w oder y in der Mitte: qāla – yaqūlu, nāma – yanāmu, sāra – yasīru. Vor Endungen, die mit einem Konsonanten beginnen, wird der Vokal kurz: qultu, nimtu, sirtu. | qālat ǧaddatī: … / nimtu mubakkiran. / kāna ǧaddī yasīr ilā l-ʿamal. | b1.e01 | b1.e16, b2.e04 | madi_pl, wurzel |
| `ar.g.stamm2` | Verbstamm II (faʿʿala) | Der mittlere Wurzelkonsonant wird verdoppelt, oft mit der Bedeutung „machen lassen“ oder „verstärkt“: darasa (lernen) – darrasa (unterrichten), ʿalima – ʿallama. Muḍāriʿ yufaʿʿilu, Partizip mufaʿʿil. | yudarris al-ustāḏ al-ʿulūm. / ʿallamatnī ummī ṭ-ṭabḫ. / ġayyarnā l-ḫuṭṭa. | b1.e02 | b1.e06, b1.e08, b1.e12 | wurzel, madi_pl |
| `ar.g.stamm5_6` | Verbstämme V und VI (tafaʿʿala, tafāʿala) | V ist oft das Reflexiv zu II (taʿallama – lernen), VI drückt Gegenseitigkeit aus (taʿāwana – zusammenarbeiten, tabādala – austauschen). | ataʿallam al-ʿarabiyya. / nataʿāwan fī l-mašrūʿ. / tabādalnā l-afkār. | b1.e02 | b1.e16, b2.e05 | stamm2 |
| `ar.g.relativ` | Relativsätze | Nach einem bestimmten Bezugswort steht allaḏī, allatī, allaḏīna; nach einem unbestimmten steht kein Relativwort. Ein Pronomen im Relativsatz verweist auf das Bezugswort zurück. | aš-šaqqa llatī raʾaynāhā kabīra. / hāḏā l-ǧār allaḏī sāʿadanā. / nabḥaṯ ʿan šaqqa fīhā šurfa. | b1.e03 | b1.e04, b1.e07, b2.e03, b2.e10 | objektsuffix, praep_suffix |
| `ar.g.ortsnomen` | Orts- und Werkzeugnomen | Orte nach mafʿal/mafʿila (maktab, maṭbaḫ, maktaba), Werkzeuge nach mifʿāl, mifʿal, mifʿala (miftāḥ, milʿaqa, miknasa). | maṭbaḫ, malʿab, maktaba / miftāḥ, milʿaqa / miknasa kahrabāʾiyya | b1.e03 | b1.e12, c1.e07 | wurzel |
| `ar.g.dual` | Dual | Für genau zwei: Nomen auf -āni (Genitiv und Akkusativ -ayni), Pronomen humā und antumā, Verben auf -ā bzw. -āni. | ḥaǧaznā ġurfatayni. / humā ṭālibatāni. / baqīnā yawmayni fī Tūnis. | b1.e04 | b1.e16 | plural_gesund, akkusativ |
| `ar.g.zahl_tamyiz` | Zahl und Gezähltes | 3–10: Zahl im umgekehrten Genus, Gezähltes im Genitiv Plural (ṯalāṯ layālin, ḫamsat ayyām). 11–99: Gezähltes im Akkusativ Singular (iṯnā ʿašara šahran). 100 und 1000: Genitiv Singular (miʾat ṭālib). | ṯalāṯ layālin / sabʿat ayyām / iṯnā ʿašara šahran | b1.e04 | b1.e16, b2.e07, b2.e12 | zahlen_gross, dual |
| `ar.g.verb_defekt` | Defekte Verben (w oder y am Ende) | Verben mit schwachem letzten Wurzelkonsonanten: mašā – yamšī, nasiya – yansā, baqiya – yabqā. Im Jussiv wird der Endvokal kurz (lam yamši). | amšī kull yawm niṣf sāʿa. / nasītu dawāʾī. / lā tansa l-mawʿid! | b1.e05 | b1.e16 | lam_jussiv |
| `ar.g.verb_hamza` | Verben mit Hamza | Hamza als Wurzelkonsonant: akala, saʾala, qaraʾa. Kurze Imperative kul und ḫuḏ; der Träger der Hamza wechselt mit den Vokalen (yasʾalu, saʾaltu). | kul ḫuḍāran kaṯīra. / saʾaltu ṭ-ṭabīb. / taqraʾ al-waṣfa. | b1.e05 | b1.e16, b2.e13 | mudari_pl, imperativ |
| `ar.g.stamm4` | Verbstamm IV (afʿala) | Vorsilbe a- im Māḍī, u- im Muḍāriʿ: arsala – yursilu, aġlaqa – yuġliqu, aḫbara – yuḫbiru; oft „veranlassen“. | arsaltu r-risāla. / aġliq al-bāb, min faḍlik. / aḫbaranī l-mudarrib bi-l-mawʿid. | b1.e06 | b1.e07, b1.e12, b2.e01 | stamm2 |
| `ar.g.verb_assimiliert` | Verben mit w am Anfang | Verben mit w als erstem Wurzelkonsonanten verlieren es im Muḍāriʿ: waṣala – yaṣilu, waqafa – yaqifu, waǧada – yaǧidu. | taqif al-ḥāfila hunā. / waṣalnā mutaʾaḫḫirīn. / lā aǧid miftāḥ as-sayyāra. | b1.e06 | b1.e16 | mudari_pl, madi_pl |
| `ar.g.stamm7_8` | Verbstämme VII und VIII | VII (infaʿala) ist oft passivisch oder reflexiv (inqaṭaʿa – abbrechen), VIII (iftaʿala) ist sehr häufig (intaẓara, ištaraka, ittaṣala); das t gleicht sich manchen Lauten an. | inqaṭaʿa l-ittiṣāl. / intaẓirnī qalīlan. / ištaraktu fī d-dawra. | b1.e07 | b1.e16 | stamm5_6 |
| `ar.g.stamm10` | Verbstamm X (istafʿala) | Vorsilbe ista-, oft „für sich nehmen, erbitten, für etwas halten“: istaʿmala (benutzen), istaqbala (empfangen), istaʿlama (sich erkundigen). Stamm IX (nur Farben, iḥmarra) wird erkannt, nicht geübt. | astaʿmil kalimat sirr qawiyya. / istaqbalnā ḍuyūfan. / istaʿlamtu ʿan al-mawʿid. | b1.e07 | b1.e12, b1.e14, b2.e01 | stamm4 |
| `ar.g.stamm3` | Verbstamm III (fāʿala) | Langes ā nach dem ersten Wurzelkonsonanten, oft „mit jemandem“: sāʿada (helfen), nāqaša (besprechen), ḥāwala (versuchen); Verbalnomen mufāʿala oder fiʿāl. | sāʿadanā l-ǧār. / nāqašnā l-muškila. / ḥāwaltu an atakallama maʿahu. | b1.e08 | b1.e09, b2.e05 | stamm2 |
| `ar.g.anna_dass` | Dass-Sätze mit anna, Redewiedergabe mit inna | Nach Verben des Wissens und Meinens steht anna mit Nomen im Akkusativ oder mit Endung (aʿrifu annaka …); nach qāla steht inna. Systematisch in B2. | aʿtaqidu anna l-ḥall sahl. / qāla l-ǧār innahu mašġūl. / hal taʿrif anna l-maṣʿad muʿaṭṭal? | b1.e08 | b1.e09, b1.e15, b2.e03, b2.e13, b2.e15 | li_anna |
| `ar.g.temporalsatz` | Zeitsätze: ʿindamā, baynamā, lammā, kullamā, iḏā | ʿindamā (wenn, als), baynamā (während), lammā + Māḍī (als), kullamā (immer wenn), iḏā (wenn, sobald). | ʿindamā aḥzan, atakallamu maʿa ummī. / lammā waṣalat, ibtasamnā. / kullamā raʾaytuhā, saʾaltuhā ʿan ḥālihā. | b1.e09 | b1.e13, b1.e15, b2.e02 | madi_pl, mudari_pl |
| `ar.g.verb_verdoppelt` | Verdoppelte Verben | Gleicher zweiter und dritter Wurzelkonsonant: radda, ḥalla, marra, ẓanna. Vor Endungen mit Konsonant wird aufgelöst: radadtu, ḥalalnā. | ḥalalnā l-muškila maʿan. / lam yarudd ʿalā risālatī. / ẓanantu annahā ġāḍiba. | b1.e09 | b1.e16 | madi_pl |
| `ar.g.irab` | Die drei Fälle (Iʿrāb) | Nominativ -u, Akkusativ -a, Genitiv -i, unbestimmt mit Tanwīn. Wann welcher Fall steht, wird jetzt zusammengefasst; am Satzende spricht man die Pausa-Form. | al-mudarrisu ǧadīdun. / raʾaytu l-mudarrisa. / takallamtu maʿa l-mudarrisi. | b1.e10 | b1.e11 | akkusativ, praep_ort, idafa |
| `ar.g.fuenf_nomen` | Die fünf Nomen (abū, aḫū …) | ab, aḫ, ḥam, fū und ḏū zeigen den Fall mit langem Vokal, wenn sie in einer Iḍāfa stehen oder eine Endung tragen: abūka, abāka, abīka. | ǧāʾa abū Fāris. / raʾaytu aḫāki. / ḏahabtu maʿa aḫīhi. | b1.e10 | b1.e16 | irab, suffix_nomen |
| `ar.g.diptota` | Diptota | Manche Nomen haben kein Tanwīn und im Genitiv -a: Mehrzahlmuster wie mafāʿil (madāris, waṯāʾiq), Farben und Elative (aḥmar, akbar), viele Orts- und Personennamen. | fī madārisa kaṯīratin / hāḏihi waṯāʾiqu muhimmatun / min Tūnisa ilā Bārīsa | b1.e11 | b1.e16, b2.e06 | irab, plural_gebrochen |
| `ar.g.modi_ueberblick` | Die Modi des Muḍāriʿ im Überblick | Indikativ (-u), Konjunktiv (-a nach an, li-, lan …) und Jussiv (Kurzform nach lam, nach lā des Verbots und nach li- der Aufforderung); die Langformen -ūna, -īna, -āni verlieren ihr n. | yaktubu – lan yaktuba – lam yaktub / yaktubūna – an yaktubū – lam yaktubū / li-taktub ismaka hunā. | b1.e11 | b1.e16, b2.e02, b2.e06 | mansub, lam_jussiv, verbot_jussiv |
| `ar.g.partizip_abgeleitet` | Partizipien der abgeleiteten Stämme | Aktiv mu-…-i-, passiv mu-…-a-: mudarris – mudarras, mustaʿmil – mustaʿmal, muntaẓir. Viele Berufe und Fachwörter entstehen so. | muʿallim, mudarrib, mutadarrib / mustaʿmal, mustawrad / al-maṭʿam muġlaq. | b1.e12 | b1.e14, b2.e01 | stamm2, stamm4, stamm10 |
| `ar.g.qad` | qad und laqad | qad + Māḍī betont, dass etwas schon geschehen ist; qad + Muḍāriʿ heißt „manchmal, vielleicht“; laqad verstärkt. | qad waṣala l-ǧawāb. / qad yataʾaḫḫaru l-qiṭār. / laqad taʿallamtu kaṯīran. | b1.e12 | b1.e14, c1.e04 | madi_pl |
| `ar.g.elativ_umschreibung` | Steigerung mit akṯar und aqall | Wo afʿal nicht geht (Farben, abgeleitete Formen, lange Adjektive), steigert man mit akṯar, ašadd oder aqall und einem Akkusativ: akṯar naẓāfatan, aqall istihlākan. | al-ḥāfila akṯar ṣadāqatan li-l-bīʾa. / hāḏā l-ǧihāz aqall istihlākan li-ṭ-ṭāqa. / al-hawāʾ hunā anqā. | b1.e13 | b1.e16, b2.e07 | komparativ, akkusativ |
| `ar.g.verb_doppelt_schwach` | Häufige unregelmäßige Verben | Verben mit zwei schwachen Wurzelkonsonanten oder mit Hamza und schwachem Konsonanten: raʾā – yarā (sehen), ǧāʾa – yaǧīʾu (kommen), atā – yaʾtī (kommen), waqā – yaqī (schützen). | hal tarā tilka š-šaǧara? / ǧiʾnā min al-ġāba. / al-qubbaʿa taqīka min aš-šams. | b1.e13 | b1.e16 | verb_defekt, verb_hamza |
| `ar.g.nisba_abstrakt` | Abstrakta auf -iyya und Fach-Nisba | Mit der Nisba-Endung entstehen Fachadjektive und Abstrakta: ʿilm – ʿilmī, masʾūl – masʾūliyya, insān – insāniyya. | ʿilmī – ʿilmiyya / masʾūl – masʾūliyya / insān – insāniyya | b1.e14 | b1.e16, b2.e09, c1.e07 | nisba |
| `ar.g.satzverbindung` | Satzverbinder für Erklärungen | Neben wa und ṯumma: bal (sondern), immā … aw (entweder … oder), lā … wa-lā (weder … noch), kamā (wie auch), ayḍan (auch), ka-ḏālika (ebenso). | laysa sahlan bal mumtiʿ. / immā an nastaʿmila l-ḥāsūb aw ad-daftar. / lā yaʿmal al-ǧihāz wa-lā aš-šāḥin. | b1.e14 | b1.e16, b2.e09 | konjunktion, laysa |
| `ar.g.indirekte_frage` | Indirekte Fragen | Fragen im Nebensatz behalten ihr Fragewort; Ja-Nein-Fragen stehen mit hal oder iḏā kāna: lā aʿrifu matā tabdaʾu l-muqābala. | lā aʿrif matā tabdaʾ al-muqābala. / saʾalatnī hal ʿindī ḫibra. / hal yumkinuka an taqūla lī ayna l-maktab? | b1.e15 | b1.e16, b2.e02 | fragewoerter, temporalsatz, verb_hamza |
| `ar.g.hoeflichkeit` | Höfliche Bitten und Angebote | law samaḥt, hal yumkinuka …?, a-tasmaḥ lī …?, mā raʾyuka fī …?, tafaḍḍal; Antworten mit bi-kulli surūr, šukran, lā šukr ʿalā wāǧib. | law samaḥti, nāwilīnī l-milḥ. / mā raʾyukum fī šāy? / bi-kulli surūr! | b1.e16 | b2.e01 | koennen, imperativ |

### 5.5 B2 (28 Punkte)

| ID | Titel | Was gelernt wird | Beispiele | eingeführt | wiederholt in | Voraussetzung |
|---|---|---|---|---|---|---|
| `ar.g.passiv_madi` | Passiv im Māḍī | Innere Vokaländerung u–i: kataba – kutiba, našara – nušira; in abgeleiteten Stämmen u…i (uʿlina, ustuʿmila). Wer handelt, bleibt meist ungenannt. | nušira l-ḫabar ams. / uʿlina ʿan mawʿid ǧadīd. / ustuʿmilat hāḏihi ṭ-ṭarīqa qadīman. | b2.e01 | b2.e09, b2.e12, b2.e15, c1.e03, c1.e11 | stamm4, stamm10 |
| `ar.g.passiv_mudari` | Passiv im Muḍāriʿ und Umschreibung | Muḍāriʿ-Passiv mit u…a: yuktabu, yunšaru, yustaʿmalu; dazu Passivpartizipien und die Umschreibung mit tamma + Verbalnomen. | tunšaru l-maǧalla kull šahr. / yuntaẓaru wuṣūl al-qiṭār qarīban. / tamma ttiḫāḏ al-qarār. | b2.e01 | b2.e05, b2.e14, c1.e01 | passiv_madi |
| `ar.g.kana_schwestern` | kāna und ihre Schwestern | ṣāra (werden), aṣbaḥa (werden), mā zāla (noch immer), laysa, mā dāma (solange); alle mit der Aussage im Akkusativ. | ṣāra Yazan ṭāliban fī l-maʿhad. / mā zilnā nabḥaṯu ʿan tadrīb. / aṣbaḥa l-ʿamal aṣʿab. | b2.e02 | b2.e03, b2.e04 | kana_war, laysa, irab |
| `ar.g.bedingung_real` | Reale Bedingung: in, iḏā, man, mahmā | in mit Jussiv oder Māḍī in Vorder- und Nachsatz; iḏā mit Māḍī; fa- leitet einen Nachsatz ein, der nicht mit einem Verb beginnt. | in tadrus tanǧaḥ. / iḏā qubilta, fa-sa-tabdaʾ fī sabtambar. / man yaǧtahid yaṣil. | b2.e02 | b2.e07, b2.e08, b2.e11, b2.e14 | modi_ueberblick, temporalsatz |
| `ar.g.inna_schwestern` | inna und ihre Schwestern | inna, anna, lākinna, laʿalla (vielleicht), kaʾanna (als ob), layta (wenn doch): Das Subjekt danach steht im Akkusativ oder als Endung. | inna n-naẓāfa masʾūliyyat al-ǧamīʿ. / laʿalla l-ǧīrān lā yaʿrifūna l-qawāʿid. / kaʾanna l-bayta funduq. | b2.e03 | b2.e08, b2.e13, c1.e04 | anna_dass, irab |
| `ar.g.istithna` | Ausnahme: illā, ġayr, siwā | illā (außer) mit Akkusativ im bejahten Satz; ġayr und siwā mit Genitiv. | kull aš-šuqaq maʾǧūra illā wāḥidatan. / lā yūǧad ġayr maṣʿad wāḥid. / dafaʿnā kull ar-rusūm siwā rusūm al-māʾ. | b2.e03 | b2.e16, c1.e08 | quantoren, akkusativ |
| `ar.g.hal` | Zustandsangabe (Ḥāl) | Ein unbestimmter Akkusativ oder ein Satz mit wa- beschreibt den Zustand während einer Handlung. | ḫaraǧa ǧaddī min al-mustašfā mubtasiman. / ǧalasat ǧaddatī wa-hiya taqraʾ. / ǧāʾa l-mumarriḍ musriʿan. | b2.e04 | b2.e10 | akkusativ, partizip1 |
| `ar.g.anfangsverben` | Beginnen, beinahe, nicht mehr | badaʾa, šaraʿa oder aḫaḏa + Muḍāriʿ (anfangen zu …), kāda + Muḍāriʿ (beinahe), lam yaʿud (nicht mehr), ʿāda + Muḍāriʿ (wieder). | badaʾa ǧaddī yamšī min ǧadīd. / kidtu ansā l-mawʿid. / lam yaʿud yaḥtāǧu ilā l-ʿukkāz. | b2.e04 | b2.e16 | verb_hohl, mudari_pl |
| `ar.g.masdar_formen` | Verbalnomen der Stämme II–X | Abgeleitete Stämme haben feste Muster: tafʿīl (II), mufāʿala (III), ifʿāl (IV), tafaʿʿul (V), tafāʿul (VI), infiʿāl (VII), iftiʿāl (VIII), istifʿāl (X). | tadrīb, musāʿada, iʿdād / taʿāwun, iǧtimāʿ, istiʿmāl / taqdīm al-ʿarḍ | b2.e05 | b2.e06, b2.e09 | verbalnomen, stamm10 |
| `ar.g.mafuul_mutlaq` | Inneres Objekt (al-mafʿūl al-muṭlaq) | Das Verbalnomen des eigenen Verbs im Akkusativ verstärkt oder beschreibt die Handlung. | šakarnāhum šukran ǧazīlan. / taʿāwannā taʿāwunan mumtāzan. / irtafaʿat al-mabīʿāt irtifāʿan kabīran. | b2.e05 | b2.e16 | masdar_formen, akkusativ |
| `ar.g.masdar_satz` | Verbalnomen statt an-Satz | Ein an-Satz lässt sich durch das Verbalnomen ersetzen; das Subjekt folgt in der Iḍāfa, das Objekt mit li- oder im Akkusativ. | urīdu taǧdīd ǧawāz as-safar. / qabla taqdīm aṭ-ṭalab / yaǧibu iḥḍār al-waṯāʾiq. | b2.e06 | b2.e11, b2.e14, c1.e01, c1.e02 | masdar_formen, mansub, idafa |
| `ar.g.verneinung_ueberblick` | Verneinung im Überblick | lā (Präsens, Verbot), mā (Vergangenheit), lam (Jussiv), lan (Zukunft), laysa (Satz ohne Verb), ġayr (un-, nicht-) und ʿadam + Verbalnomen (das Nicht-…). | ġayr ṣāliḥ / ʿadam al-ḥuḍūr / lam yuqbal aṭ-ṭalab baʿd. | b2.e06 | b2.e11, c1.e02 | laysa, lam_jussiv, sa_sawfa, masdar_satz |
| `ar.g.bedingung_irreal` | Irreale Bedingung: law … la-, lawlā | law + Māḍī, der Nachsatz oft mit la-; lawlā + Nomen (wenn … nicht wäre). | law ʿazalnā l-bayt, la-waffarnā kaṯīran. / lawlā l-ʿazl la-kāna l-bayt bāridan. / law kuntu makānaka la-rakibtu d-darrāǧa. | b2.e07 | b2.e16, c1.e06 | bedingung_real, kana_war |
| `ar.g.brueche_prozent` | Brüche, Prozent und Statistik | niṣf, ṯulṯ, rubʿ, ḫums; Prozent mit fī l-miʾa; Werte in Grafiken beschreiben: irtafaʿa, inḫafaḍa bi-nisbat … | rubʿ aṭ-ṭāqa / ʿišrūna fī l-miʾa / inḫafaḍa l-istihlāk bi-nisbat ḫamsa fī l-miʾa. | b2.e07 | b2.e08, c1.e06 | zahl_tamyiz |
| `ar.g.tamyiz` | Unterscheidungsakkusativ (Tamyīz) | Ein unbestimmter Akkusativ nennt, worin etwas gilt: akṯar amānan (sicherer), aqall kulfatan (günstiger), imtalaʾa ṣ-ṣundūq rasāʾila. | hāḏā l-ḥisāb aqall kulfatan. / al-ḥisāb al-ǧadīd akṯar amānan. / imtalaʾa ṣ-ṣundūq rasāʾila. | b2.e08 | b2.e16 | elativ_umschreibung, zahl_tamyiz |
| `ar.g.konzessiv` | Einräumung: raġma, maʿa anna, wa-in | raġma + Nomen oder raġma anna (obwohl), maʿa anna (obgleich), wa-in (selbst wenn), ḥattā law (sogar wenn). | raġma l-maṭar ḫaraǧnā. / maʿa anna r-rusūm qalīla, qāranat Laylā bayna ʿiddat bunūk. / sa-adfaʿu bi-l-baṭāqa wa-in kāna l-mablaġ ṣaġīran. | b2.e08 | b2.e13, c1.e04, c1.e08 | inna_schwestern, bedingung_real |
| `ar.g.mafuul_lahu` | Akkusativ des Grundes (al-mafʿūl li-aǧlihi) | Ein Verbalnomen im Akkusativ nennt Grund oder Zweck: waqafa iḥtirāman. | ṣammama l-ǧihāz raġbatan fī t-tawfīr. / waqafa l-ḥāḍirūna iḥtirāman li-l-muḫtariʿa. / taʿallamtu l-barmaǧa šaġafan bi-l-ʿulūm. | b2.e09 | b2.e16 | masdar_formen, akkusativ |
| `ar.g.textverbinder` | Textverbinder: ammā … fa-, iḏ, ḏālika anna, illā anna | ammā … fa- (was … betrifft), iḏ (da, denn), ḏālika anna (denn, nämlich), illā anna (jedoch), kamā anna (ebenso). | ammā l-muḫtariʿ fa-kāna mudarrisan. / naǧaḥat al-fikra, ḏālika annahā basīṭa. / al-ǧihāz ġālin, illā annahu yuwaffir aṭ-ṭāqa. | b2.e09 | b2.e15, c1.e03, c1.e06 | inna_schwestern |
| `ar.g.relativ_man_ma` | Relativwörter man und mā | man (wer, derjenige, der) und mā (was) stehen ohne Bezugswort; mit Präposition mimmā, mimman, ʿammā. | man yurīd al-musāʿada yattaṣil bi-l-markaz. / hāḏā mā naḥtāǧuhu. / taḥaddaṯnā ʿammā ǧarā. | b2.e10 | b2.e16, c1.e09 | relativ, praep_suffix |
| `ar.g.zweck_negativ` | Verneinter Zweck: li-allā, ḥattā lā, li-kay lā | li-allā, li-kay lā und ḥattā lā mit Konjunktiv bedeuten „damit nicht“. | nunaẓẓif ar-raṣīf li-allā yanzaliqa aḥad. / takallam bi-buṭʾ ḥattā lā yaqlaqa l-aṭfāl. / naḥmil al-māʾ li-kay lā naʿṭaš. | b2.e10 | b2.e16 | mansub, modi_ueberblick |
| `ar.g.zeitenfolge` | Vorzeitigkeit und Zukunft in der Vergangenheit | kāna qad faʿala (hatte getan), sa-yakūnu qad faʿala (wird getan haben), kāna sa-yafʿalu (wollte, würde). | kāna l-mustaʾǧir qad dafaʿa l-īǧār. / sa-takūnu l-aʿmāl qad intahat qabla š-šitāʾ. / kuntu sa-attaṣilu bika. | b2.e11 | b2.e16 | kana_mudari, sa_sawfa |
| `ar.g.briefform` | Förmliche Briefe und E-Mails | Anrede (as-sayyid al-muḥtaram, as-sayyida al-muḥtarama), Betreff (al-mawḍūʿ), Bezug (bi-l-išāra ilā), Schlussformel (maʿa fāʾiq al-iḥtirām). | as-sayyid al-muḥtaram, / al-mawḍūʿ: inhāʾ ʿaqd al-īǧār / maʿa fāʾiq al-iḥtirām | b2.e11 | b2.e16, c1.e02 | anrede, masdar_satz |
| `ar.g.ordinal_gross` | Ordnungszahlen über zehn, Jahrhunderte und Jahrzehnte | al-ḥādī ʿašar, al-ʿišrūn; Jahrhunderte mit al-qarn (al-qarn al-ḥādī wa-l-ʿišrūn); Jahrzehnte: fī sabʿīnāt al-qarn al-māḍī. | al-qarn aṯ-ṯāmin ʿašar / fī l-qarn al-ḥādī wa-l-ʿišrīn / fī sabʿīnāt al-qarn al-māḍī | b2.e12 | b2.e16, c1.e05 | ordinal_uhrzeit, zahlen_gross |
| `ar.g.vergleichssatz` | Vergleichssätze: kamā, miṯlamā, kaʾanna | kamā und miṯlamā (wie, so wie) mit Verb; kaʾanna (als ob) mit Akkusativ; ka- und miṯla vor Nomen. | yaʿmal al-ḥirafiyyūn kamā kānū yaʿmalūna qadīman. / badā l-maʿmal kaʾannahu matḥaf. / nansiǧ miṯla aǧdādinā. | b2.e12 | b2.e16, c1.e05, c1.e10 | inna_schwestern |
| `ar.g.hamza_schreibung` | Hamza richtig schreiben | Der Träger der Hamza richtet sich nach den Vokalen davor und danach (Rangfolge i, u, a, Sukūn): suʾāl, masʾala, biʾr, qirāʾa; am Wortende nach langem Vokal steht sie auf der Zeile. | suʾāl – asʾila / masʾūliyya, raʾy / ǧuzʾ, šayʾ, qirāʾa | b2.e13 | b2.e16, c1.e04 | verb_hamza |
| `ar.g.modalausdruecke` | Unpersönliche Ausdrücke | min aḍ-ḍarūrī an, min al-mumkin an, yumkinu, yuqālu, yuʿtaqadu, laysa min as-sahl an … – Aussagen ohne genannte Person. | min aḍ-ḍarūrī an yušāraka l-ǧamīʿ. / min al-mumkin taqdīm aṭ-ṭalab ilaktrūniyyan. / yuqālu inna l-ǧalsa ʿalaniyya. | b2.e14 | b2.e16, c1.e09 | passiv_mudari, notwendigkeit |
| `ar.g.indirekte_rede` | Redewiedergabe | qāla inna, ḏakara anna, akkada anna, ašāra ilā anna; Pronomen und Zeit wechseln in die Sicht der berichtenden Person. | qālat al-murāsila inna l-ǧisr sa-yuftaḥ qarīban. / ḏakara t-taqrīr anna ʿadad az-zuwwār irtafaʿa. / akkadat al-baladiyya annahā sa-tuǧaddidu l-ḥadīqa. | b2.e15 | b2.e16, c1.e03 | inna_schwestern, anna_dass |
| `ar.g.unechte_idafa` | Adjektiv-Iḍāfa (uneigentliche Iḍāfa) | Ein Adjektiv mit folgendem Nomen beschreibt eine Eigenschaft knapp: ʿālī l-ǧawda (hochwertig), kaṯīr al-ʿamal, sahl al-istiʿmāl. | ǧihāz sahl al-istiʿmāl / mašrūʿ ʿālī l-ǧawda / ḥall qalīl at-takālīf | b2.e16 | c1.e01 | idafa, adjektiv |

### 5.6 C1 (14 Punkte)

| ID | Titel | Was gelernt wird | Beispiele | eingeführt | wiederholt in | Voraussetzung |
|---|---|---|---|---|---|---|
| `ar.g.nominalstil` | Nominalstil der Schriftsprache | Die Schriftsprache verdichtet mit Verbalnomen: qāma bi- + Verbalnomen, tamma + Verbalnomen, ʿamila ʿalā + Verbalnomen. Im Gespräch wird zurück in Verbalsätze übertragen. | qāmat aš-šarika bi-taṭwīr barnāmaǧ ǧadīd. / ʿamilnā ʿalā taḥsīn ǧawdat al-ḫidma. / tamma taslīm al-mašrūʿ fī mawʿidihi. | c1.e01 | c1.e02, c1.e05, c1.e07, c1.e09, c1.e11, c1.e14 | masdar_satz, passiv_mudari |
| `ar.g.amtssprache` | Amts- und Vertragssprache | Feste Wendungen: bi-mūǧib (gemäß), wafqan li- (laut), ʿalā an (unter der Bedingung, dass), mā lam (sofern nicht), yuʿtabaru (gilt als). | bi-mūǧib al-qānūn / ʿalā an yuqaddama ṭ-ṭalab ḫilāla šahr / mā lam yuḏkar ḫilāf ḏālika | c1.e02 | c1.e08, c1.e11, c1.e13, c1.e14 | masdar_satz, briefform |
| `ar.g.berichtsstil` | Berichtsstil der Nachrichten | Quellen nennen und Aussagen gewichten: wafqan li-, naqlan ʿan, bi-ḥasab, afādat … bi-anna, ašāra … ilā anna. | wafqan li-l-arqām al-ǧadīda … / naqlan ʿan al-baladiyya / afādat al-maṣādir bi-anna … | c1.e03 | c1.e11, c1.e13, c1.e14 | indirekte_rede, passiv_madi |
| `ar.g.vermutung` | Vermutung und Abschwächung | rubbamā, qad + Muḍāriʿ, laʿalla, yabdū anna, min al-muḥtamal an, ʿalā mā yabdū – eigene Aussagen vorsichtig formulieren. | rubbamā yaḫtalif ar-raʾy bayna l-aǧyāl. / yabdū anna š-šabāb yaqraʾūna aqall. / min al-muḥtamal an yataġayyara ḏālika. | c1.e04 | c1.e06, c1.e14 | inna_schwestern, qad |
| `ar.g.idafa_ketten` | Lange Iḍāfa-Ketten | Mehrgliedrige Iḍāfa; ein Adjektiv zum ersten Glied steht am Ende der Kette; zwei Nomen können ein Glied mit wa- teilen. | tārīḫ ṣināʿat al-waraq / bāb madrasat al-madīna al-qadīm / kutub al-maktaba wa-maḫṭūṭātuhā | c1.e05 | c1.e10, c1.e14 | idafa, irab |
| `ar.g.argumentation` | Argumentieren mit Konnektoren | min ṯamma (folglich), bi-nāʾan ʿalā (aufgrund), fī ḥīn (während hingegen), ʿalāwatan ʿalā (zusätzlich), faḍlan ʿan (ganz zu schweigen von), bi-ġaḍḍ an-naẓar ʿan (unabhängig von). | bi-nāʾan ʿalā ḏālika … / fī ḥīn yarā l-baʿḍ anna … / ʿalāwatan ʿalā ḏālika | c1.e06 | c1.e07, c1.e12, c1.e14 | textverbinder, konzessiv |
| `ar.g.wortbildung_modern` | Wortbildung moderner Begriffe | Neue Wörter entstehen über Muster (ḥāsūb, šāḥin), Nisba-Abstrakta (raqmiyya), Zusammensetzungen mit lā- und ġayr (lā-silkī, ġayr rasmī) und als Lehnwörter. | ḥāsūb, ṭābiʿa, šāḥin / lā-silkī, ġayr mutawaqqaʿ / aḏ-ḏakāʾ al-iṣṭināʿī | c1.e07 | c1.e14 | nisba_abstrakt, ortsnomen |
| `ar.g.hervorhebung` | Hervorhebung durch Wortstellung | Vorziehen von Objekt oder Ortsangabe, innamā (nur, vielmehr), Thema-Kommentar-Sätze und Bekräftigung mit inna und la-. | innamā yuqbalu l-istirdād ḫilāla arbaʿata ʿašara yawman. / hāḏā l-ʿaqd qaraʾtuhu kāmilan. / inna l-mustahlik la-ṣāḥib ḥaqq. | c1.e08 | c1.e12, c1.e14 | inna_schwestern, istithna |
| `ar.g.verneinung_stil` | Verstärkte Verneinung | mā … qaṭṭ (niemals, Vergangenheit), lan … abadan (niemals, Zukunft), laysa … bi- (keineswegs), lā siyyamā (vor allem). | mā waqqaʿtu ʿalā ḏālika qaṭṭ. / lan nuwāfiq abadan ʿalā rusūm ḫafiyya. / laysa l-ʿaqd bi-wāḍiḥ. | c1.e08 | c1.e12, c1.e14 | verneinung_ueberblick |
| `ar.g.tawkid_badal` | Bekräftigung und Apposition | Bekräftigung mit nafs, ʿayn, kull, ǧamīʿ (ḥaḍara l-aʿḍāʾ kulluhum); Apposition (Badal) in Namen und Erklärungen. | ḥaḍara l-aʿḍāʾ kulluhum. / al-mudīra nafsuhā raddat. / taḥaddaṯat as-sayyida Hind, raʾīsat al-ǧamʿiyya. | c1.e09 | c1.e14 | quantoren, irab |
| `ar.g.redewendungen` | Redewendungen und Sprichwörter (weltlich) | Feste Bilder und Sprichwörter ohne religiösen Bezug verstehen und passend verwenden; nur aus einer von der Redaktion geprüften Liste. | al-waqt ka-s-sayf / yad wāḥida lā tuṣaffiq / fī l-ʿaǧala an-nadāma | c1.e10 | c1.e13, c1.e14 | vergleichssatz |
| `ar.g.paraphrase` | Umformulieren und Zusammenfassen | Aussagen mit eigenen Worten wiedergeben: Nominalstil und Verbalsatz, Passiv und Aktiv tauschen, lange Sätze teilen; Zusammenfassen mit bi-īǧāz und ḫulāṣat al-qawl. | bi-ʿibāra uḫrā … / ḫulāṣat al-qawl anna … / bi-īǧāz | c1.e11 | c1.e13, c1.e14 | nominalstil, passiv_madi |
| `ar.g.stilmittel` | Stilmittel in Reden und Texten | Parallelismus, Paarformeln (ṣiġāran wa-kibāran), rhetorische Frage, Gegensatz und Steigerung gezielt einsetzen. | ṣiġāran wa-kibāran / a-laysa min ḥaqqinā an nataʿallam? / lā … bal … | c1.e12 | c1.e14 | hervorhebung, argumentation |
| `ar.g.register` | Register erkennen | Fuṣḥā in Nachrichten, Amtsschreiben, Literatur und gepflegtem Gespräch unterscheiden; regionale Umgangssprachen an typischen Merkmalen erkennen (z. B. andere Verneinung und Zukunft), ohne sie selbst zu verwenden. | rasmī – adabī – yawmī / luġat aṣ-ṣaḥāfa / al-fuṣḥā wa-l-ʿāmmiyya | c1.e13 | c1.e14 | berichtsstil, amtssprache |

## 6 Einheiten

Spalte „Grammatik“: **fett** = in dieser Einheit eingeführt, sonst Wiederholung. Budget = neue Lemmata der Einheit (Summe je Stufe = Stufenbudget). L/Sp/Sch = Lesetexte, Sprech- und Schreibaufgaben.

### A1 (12 Einheiten, 600 Lemmata)

| Schlüssel | Titel | Thema | Grammatik | Wortfelder | Budget | L/Sp/Sch |
|---|---|---|---|---|---|---|
| ar.a1.e01 | Ahlan! Ich bin Laylā | Begrüßung und Vorstellung | **personalpron**, **nominalsatz**, **nisba** | Grüßen und Verabschieden (weltlich), Sich vorstellen, Länder und Sprachen, Befinden | 36 | 0/2/0 |
| ar.a1.e02 | Was ist das? | Schule und Lernen | **genus**, **hinweis**, **fragepartikel**, personalpron, nominalsatz | Schulsachen, Im Klassenraum, Menschen in der Schule | 42 | 1/2/0 |
| ar.a1.e03 | Unser Zuhause | Wohnen | **artikel**, **sonne_mond**, **adjektiv**, genus, hinweis | Räume, Möbel und Dinge im Haus, Grundadjektive, Haustiere (ohne Hund, OF-03) | 46 | 0/2/0 |
| ar.a1.e04 | Meine Familie | Familie und Verwandte | **suffix_nomen**, **besitz_inda**, **zahlen_bis_10**, adjektiv, fragepartikel, artikel | Familie (engster Kreis), Zahlen bis zehn, Berufe (Grundwortschatz) | 50 | 1/2/0 |
| ar.a1.e05 | Wo ist die Bibliothek? | Stadt und Orientierung | **praep_ort**, **hunaka**, **fragewoerter**, artikel, sonne_mond, adjektiv | Orte in der Stadt, Weg und Richtung, Verkehrsmittel | 52 | 0/2/0 |
| ar.a1.e06 | Mein Tag | Zahlen, Uhrzeit, Datum | **mudari_sg**, **konjunktion**, praep_ort, fragewoerter, personalpron | Tagesablauf, Tageszeiten und Zeitwörter, Wochentage | 52 | 1/2/0 |
| ar.a1.e07 | Auf dem Wochenmarkt | Einkaufen und Preise | **zahlen_bis_100**, **idafa**, mudari_sg, zahlen_bis_10, besitz_inda | Obst und Gemüse, Einkaufen (Grundwortschatz), Zahlen bis hundert und Geld | 54 | 0/2/0 |
| ar.a1.e08 | Was machst du gern? | Hobbys und Freizeit (ohne Musik) | **mudari_pl**, **la_mudari**, konjunktion, idafa, mudari_sg | Freizeit (ohne Musik), Sport (Grundwortschatz) | 54 | 1/2/0 |
| ar.a1.e09 | Wie spät ist es? | Schule und Lernen | **ordinal_uhrzeit**, **laysa**, zahlen_bis_100, mudari_pl, la_mudari | Uhrzeit, Schulfächer (ohne Musik, OF-01), Stundenplan und Unterricht | 56 | 0/2/0 |
| ar.a1.e10 | Zu Gast bei Oma Samīra | Essen und Trinken (halal-neutral) | **imperativ**, **wunsch**, idafa, suffix_nomen, mudari_pl | Essen (halal-neutral, Fleischart genannt), Getränke, Am Tisch | 56 | 1/2/0 |
| ar.a1.e11 | Sonne, Regen, Jacke | Wetter und Jahreszeiten | **farben**, imperativ, adjektiv, wunsch, hunaka | Wetter, Jahreszeiten, Kleidung (Grundwortschatz), Farben | 56 | 0/2/0 |
| ar.a1.e12 | Bei der Kinderärztin | Körper und Gesundheit | **wurzel**, nisba, ordinal_uhrzeit, laysa, farben | Körperteile (ohne Intimbereich), Leichte Beschwerden, Gefühle (Grundwortschatz) | 46 | 1/2/0 |

### A2 (14 Einheiten, 900 Lemmata)

| Schlüssel | Titel | Thema | Grammatik | Wortfelder | Budget | L/Sp/Sch |
|---|---|---|---|---|---|---|
| ar.a2.e01 | Mit dem Zug nach Frankfurt | Verkehr und Unterwegssein | **madi_sg**, **kana_war**, ordinal_uhrzeit, praep_ort, wurzel | Unterwegs mit der Bahn, Zeitangaben für Vergangenes, Ausflug und Sehenswertes | 58 | 1/2/1 |
| ar.a2.e02 | Grüße nach Amman | Medien und Digitales (sachlich) | **madi_pl**, **lam_jussiv**, madi_sg, la_mudari, suffix_nomen | Telefon und Nachrichten, Verwandte (mütterliche und väterliche Seite) | 60 | 1/2/1 |
| ar.a2.e03 | Ein Termin auf dem Amt | Behörden und Formulare | **datum**, **anrede**, ordinal_uhrzeit, madi_pl, besitz_inda | Auf dem Amt (Grundwortschatz), Monate und Datum, Persönliche Angaben | 62 | 1/2/1 |
| ar.a2.e04 | Ferienpläne | Reisen und Besuch | **sa_sawfa**, **mansub**, wunsch, madi_pl, datum | Reisen (Grundwortschatz), Landschaft | 62 | 1/2/1 |
| ar.a2.e05 | Neue Nachbarn | Nachbarschaft | **plural_gesund**, **kongruenz_unbelebt**, anrede, hunaka, mudari_pl | Haus und Nachbarschaft, Hilfe und Bitten, Häufigkeit | 64 | 1/2/1 |
| ar.a2.e06 | Welche Jacke ist schöner? | Kleidung | **komparativ**, **akkusativ**, farben, plural_gesund, kongruenz_unbelebt, wunsch | Kleidung kaufen, Stoffe und Muster, Kleidung (Grundwortschatz) | 64 | 1/2/1 |
| ar.a2.e07 | Das Spiel am Samstag | Sport | **plural_gebrochen**, **verbalsatz_kongruenz**, madi_pl, komparativ, zahlen_bis_100 | Sport und Wettkampf, Sportarten | 64 | 1/2/1 |
| ar.a2.e08 | Ich fühle mich nicht gut | Körper und Gesundheit | **objektsuffix**, **praep_suffix**, madi_sg, imperativ, wurzel | Beim Arzt und in der Apotheke, Beschwerden, Körperteile (ohne Intimbereich) | 64 | 1/2/1 |
| ar.a2.e09 | Lernen für die Klassenarbeit | Schule und Lernen | **verbot_jussiv**, **notwendigkeit**, mansub, lam_jussiv, imperativ, ordinal_uhrzeit | Lernen und Prüfungen, Schulalltag, Schulfächer (ohne Musik, OF-01) | 66 | 1/2/1 |
| ar.a2.e10 | Die große Familie | Familie und Verwandte | **praep_zeit**, **li_anna**, kana_war, plural_gebrochen, objektsuffix, suffix_nomen | Verwandte (mütterliche und väterliche Seite), Charakter, Familie (engster Kreis) | 66 | 1/2/1 |
| ar.a2.e11 | Ein Tag im Wald | Natur und Umwelt | **partizip1**, **kollektiv**, verbalsatz_kongruenz, kongruenz_unbelebt, praep_zeit | Natur, Wettererscheinungen, Tiere draußen (ohne Bildkarten) | 66 | 1/2/1 |
| ar.a2.e12 | Was willst du werden? | Arbeit und Berufe | **verbalnomen**, **koennen**, sa_sawfa, partizip1, plural_gesund | Berufe, Am Arbeitsplatz, Tätigkeiten als Nomen | 66 | 1/2/1 |
| ar.a2.e13 | Eine Hochzeit in der Familie | Familienfeste | **quantoren**, **ausruf**, komparativ, madi_pl, sa_sawfa, notwendigkeit | Familienfeste (ohne Musik und Tanz), Glückwünsche und gute Wünsche (weltlich), Essen (halal-neutral, Fleischart genannt) | 68 | 1/2/1 |
| ar.a2.e14 | Paket, Konto, Rechnung | Bank und Post | **zahlen_gross**, Wiederholung von 9 Punkten der Stufe | Post, Geld und Bank, Telefon und Internet | 70 | 1/2/1 |

### B1 (16 Einheiten, 1.300 Lemmata)

| Schlüssel | Titel | Thema | Grammatik | Wortfelder | Budget | L/Sp/Sch |
|---|---|---|---|---|---|---|
| ar.b1.e01 | Als Oma jung war | Familie und Verwandte | **kana_mudari**, **verb_hohl**, kana_war, madi_pl, praep_zeit, wurzel | Erinnerungen, Lebensstationen, Verwandte (mütterliche und väterliche Seite) | 74 | 2/2/1 |
| ar.b1.e02 | Voneinander lernen | Schule und Lernen | **stamm2**, **stamm5_6**, wurzel, verbalnomen, notwendigkeit | Lernen und Lehren, Projektarbeit | 76 | 2/2/1 |
| ar.b1.e03 | Rīm sucht eine Wohnung | Wohnen | **relativ**, **ortsnomen**, kongruenz_unbelebt, komparativ, praep_suffix | Wohnungssuche, Werkzeuge und Geräte im Haushalt, Räume | 78 | 2/2/1 |
| ar.b1.e04 | Drei Tage in Tunis | Reisen und Besuch | **dual**, **zahl_tamyiz**, sa_sawfa, zahlen_gross, datum, relativ | Unterkunft, Sehenswürdigkeiten, Reisen (Grundwortschatz) | 78 | 2/2/1 |
| ar.b1.e05 | Gesund durch den Winter | Körper und Gesundheit | **verb_defekt**, **verb_hamza**, notwendigkeit, verbot_jussiv, objektsuffix | Gesund leben, Vorbeugung, Beschwerden | 80 | 2/2/1 |
| ar.b1.e06 | Der Führerschein | Verkehr und Unterwegssein | **stamm4**, **verb_assimiliert**, stamm2, notwendigkeit, verbot_jussiv | Führerschein, Auf der Straße | 80 | 2/2/1 |
| ar.b1.e07 | Sicher im Netz | Medien und Digitales (sachlich) | **stamm7_8**, **stamm10**, stamm4, relativ, notwendigkeit | Sicherheit im Netz, Geräte | 82 | 2/2/1 |
| ar.b1.e08 | Ärger im Treppenhaus | Nachbarschaft | **stamm3**, **anna_dass**, li_anna, stamm2, hunaka | Hausordnung, Konflikte lösen, Haus und Nachbarschaft | 82 | 2/2/1 |
| ar.b1.e09 | Wenn es schwer wird | Gefühle und Freundschaft | **temporalsatz**, **verb_verdoppelt**, anna_dass, stamm3, kana_mudari | Gefühle, Freundschaft, Konflikte lösen | 82 | 2/2/1 |
| ar.b1.e10 | Nachhilfe im Jugendtreff | Ehrenamt | **irab**, **fuenf_nomen**, akkusativ, idafa, praep_ort, suffix_nomen | Ehrenamt, Über Sprache sprechen | 82 | 2/2/1 |
| ar.b1.e11 | Der Antrag für den Austausch | Behörden und Formulare | **diptota**, **modi_ueberblick**, irab, notwendigkeit, datum, mansub | Anträge und Unterlagen, Auf dem Amt (Grundwortschatz), Persönliche Angaben | 82 | 2/2/1 |
| ar.b1.e12 | Praktikum in der Werkstatt | Arbeit und Berufe | **partizip_abgeleitet**, **qad**, stamm2, stamm4, stamm10, ortsnomen | Praktikum, Werkstatt | 84 | 2/2/1 |
| ar.b1.e13 | Weniger Müll, mehr Bäume | Natur und Umwelt | **elativ_umschreibung**, **verb_doppelt_schwach**, kollektiv, partizip1, temporalsatz | Umwelt, Pflanzen und Bäume, Natur | 84 | 2/2/1 |
| ar.b1.e14 | Wie funktioniert das? | Wissenschaft und Technik | **nisba_abstrakt**, **satzverbindung**, stamm10, partizip_abgeleitet, qad | Technik, Wissenschaft (Grundwortschatz) | 84 | 2/2/1 |
| ar.b1.e15 | Die erste Bewerbung | Ausbildung und Bewerbung | **indirekte_frage**, anna_dass, temporalsatz, kana_mudari, koennen | Bewerbung, Ausbildung und Studium (Grundwortschatz) | 86 | 2/2/1 |
| ar.b1.e16 | Wir kochen für Gäste | Essen und Trinken (halal-neutral) | **hoeflichkeit**, Wiederholung von 17 Punkten der Stufe | Kochen, Gäste bewirten, Essen (halal-neutral, Fleischart genannt) | 86 | 2/2/1 |

### B2 (16 Einheiten, 1.700 Lemmata)

| Schlüssel | Titel | Thema | Grammatik | Wortfelder | Budget | L/Sp/Sch |
|---|---|---|---|---|---|---|
| ar.b2.e01 | Was in der Zeitung steht | Medien und Digitales (sachlich) | **passiv_madi**, **passiv_mudari**, stamm4, stamm10, partizip_abgeleitet, hoeflichkeit | Zeitung, Nachrichtensprache | 98 | 3/2/2 |
| ar.b2.e02 | Ausbildung oder Studium? | Ausbildung und Bewerbung | **kana_schwestern**, **bedingung_real**, modi_ueberblick, temporalsatz, indirekte_frage | Studium, Berufswahl | 100 | 3/2/2 |
| ar.b2.e03 | Die Hausversammlung | Wohnen | **inna_schwestern**, **istithna**, anna_dass, relativ, kana_schwestern | Hausversammlung, Nebenkosten, Hausordnung | 102 | 3/2/2 |
| ar.b2.e04 | Opa nach der Operation | Körper und Gesundheit | **hal**, **anfangsverben**, kana_schwestern, partizip1, verb_hohl | Krankenhaus und Pflege, Krankenversicherung | 104 | 3/2/2 |
| ar.b2.e05 | Im Team | Arbeit und Berufe | **masdar_formen**, **mafuul_mutlaq**, verbalnomen, stamm3, stamm5_6, passiv_mudari | Teamarbeit, Büro | 104 | 3/2/2 |
| ar.b2.e06 | Anträge und Fristen | Behörden und Formulare | **masdar_satz**, **verneinung_ueberblick**, masdar_formen, modi_ueberblick, diptota, anrede | Anträge und Fristen, Aufenthalt und Arbeit | 106 | 3/2/2 |
| ar.b2.e07 | Energie sparen zu Hause | Natur und Umwelt | **bedingung_irreal**, **brueche_prozent**, bedingung_real, elativ_umschreibung, zahl_tamyiz | Energie, Statistik | 106 | 3/2/2 |
| ar.b2.e08 | Das erste eigene Konto | Bank und Post | **tamyiz**, **konzessiv**, inna_schwestern, bedingung_real, brueche_prozent | Konto, Kaufen und Reklamieren | 106 | 3/2/2 |
| ar.b2.e09 | Erfindungen aus vielen Jahrhunderten | Wissenschaft und Technik | **mafuul_lahu**, **textverbinder**, masdar_formen, nisba_abstrakt, satzverbindung, passiv_madi | Erfindungen, Forschung | 108 | 3/2/2 |
| ar.b2.e10 | Bei der Jugendfeuerwehr | Ehrenamt | **relativ_man_ma**, **zweck_negativ**, relativ, mansub, hal | Feuerwehr und Erste Hilfe, Ehrenamt | 108 | 3/2/2 |
| ar.b2.e11 | Der Mietvertrag | Verträge und Rechte | **zeitenfolge**, **briefform**, masdar_satz, verneinung_ueberblick, bedingung_real | Mietvertrag, Förmlicher Brief | 108 | 3/2/2 |
| ar.b2.e12 | Alte Handwerke | Geschichte und Kultur | **ordinal_gross**, **vergleichssatz**, kana_mudari, passiv_madi, zahl_tamyiz | Handwerk, Zeit und Epochen | 108 | 3/2/2 |
| ar.b2.e13 | Mehrsprachig aufwachsen | Zusammenleben | **hamza_schreibung**, verb_hamza, konzessiv, anna_dass, inna_schwestern | Mehrsprachigkeit, Generationen | 110 | 3/2/2 |
| ar.b2.e14 | Wie die Stadt entscheidet | Staat und Gemeinde (sachlich) | **modalausdruecke**, passiv_mudari, masdar_satz, bedingung_real | Stadt und Gemeinde (sachlich), Verwaltung | 110 | 3/2/2 |
| ar.b2.e15 | Eine Reportage | Medien und Digitales (sachlich) | **indirekte_rede**, passiv_madi, textverbinder, anna_dass | Reportage, Zeitung | 110 | 3/2/2 |
| ar.b2.e16 | Die Abschlusspräsentation | Arbeit und Berufe | **unechte_idafa**, Wiederholung von 15 Punkten der Stufe | Präsentation, Qualität und Bewertung | 112 | 3/2/2 |

### C1 (14 Einheiten, 2.000 Lemmata)

| Schlüssel | Titel | Thema | Grammatik | Wortfelder | Budget | L/Sp/Sch |
|---|---|---|---|---|---|---|
| ar.c1.e01 | Eine Präsentation im Betrieb | Arbeit und Berufe | **nominalstil**, masdar_satz, passiv_mudari, unechte_idafa | Unternehmen, Präsentation | 134 | 4/2/2 |
| ar.c1.e02 | Der Bescheid | Behörden und Formulare | **amtssprache**, masdar_satz, briefform, verneinung_ueberblick, nominalstil | Bescheid und Widerspruch, Anträge und Fristen | 136 | 4/2/2 |
| ar.c1.e03 | Nachricht und Kommentar | Medien und Digitales (sachlich) | **berichtsstil**, indirekte_rede, passiv_madi, textverbinder | Nachricht und Kommentar, Zeitung | 138 | 4/2/2 |
| ar.c1.e04 | Generationen im Gespräch | Zusammenleben | **vermutung**, qad, inna_schwestern, konzessiv, hamza_schreibung | Generationen, Wandel und Werte | 140 | 4/2/2 |
| ar.c1.e05 | Die Reise des Papiers | Geschichte und Kultur | **idafa_ketten**, ordinal_gross, vergleichssatz, nominalstil | Papier und Schrift, Handel und Wege | 140 | 4/2/2 |
| ar.c1.e06 | Wasser ist knapp | Natur und Umwelt | **argumentation**, bedingung_irreal, brueche_prozent, vermutung, textverbinder | Wasser und Klima, Argumentieren | 142 | 4/2/2 |
| ar.c1.e07 | Maschinen, die lernen | Wissenschaft und Technik | **wortbildung_modern**, nisba_abstrakt, ortsnomen, argumentation, nominalstil | Digitales, Forschung | 142 | 4/2/2 |
| ar.c1.e08 | Rechte als Verbraucher | Verträge und Rechte | **hervorhebung**, **verneinung_stil**, istithna, amtssprache, konzessiv | Verbraucherrechte, Förmlicher Brief | 144 | 4/2/2 |
| ar.c1.e09 | Ein Verein entsteht | Ehrenamt | **tawkid_badal**, relativ_man_ma, modalausdruecke, quantoren, nominalstil | Verein, Ehrenamt | 144 | 4/2/2 |
| ar.c1.e10 | Sprichwörter und ihre Geschichten | Geschichte und Kultur | **redewendungen**, vergleichssatz, idafa_ketten, ausruf | Sprichwörter, Bildsprache | 144 | 4/2/2 |
| ar.c1.e11 | Grundrechte und Gerichte | Staat und Gemeinde (sachlich) | **paraphrase**, nominalstil, amtssprache, berichtsstil, passiv_madi | Grundrechte (sachlich), Gericht | 146 | 4/2/2 |
| ar.c1.e12 | Eine Rede halten | Medien und Digitales (sachlich) | **stilmittel**, hervorhebung, argumentation, verneinung_stil | Rede und Debatte, Argumentieren | 148 | 4/2/2 |
| ar.c1.e13 | Fuṣḥā und Umgangssprachen | Zusammenleben | **register**, berichtsstil, amtssprache, redewendungen, paraphrase | Sprachvarianten, Mehrsprachigkeit | 150 | 4/2/2 |
| ar.c1.e14 | Rückblick und Ausblick | Arbeit und Berufe | nominalstil, amtssprache, berichtsstil, vermutung, idafa_ketten, argumentation, wortbildung_modern, hervorhebung, verneinung_stil, tawkid_badal, redewendungen, paraphrase, stilmittel, register | Rückblick und Ziele, Unternehmen | 152 | 4/2/2 |

### 6.1 Themenspirale

Die Themen stammen aus dem Leitfaden (§3, `themen[].id`); jede Einheit trägt ein Hauptthema, ihre Wortfelder greifen Nachbarthemen auf. Familie, Wohnen, Gesundheit, Schule, Arbeit, Natur, Behörden und Medien kehren auf höheren Stufen mit größerem Wortschatz und anspruchsvolleren Aufgaben wieder.

| Thema (Leitfaden) | Einheiten |
|---|---|
| Begrüßung und Vorstellung | a1.e01 |
| Familie und Verwandte | a1.e04, a2.e10, b1.e01 |
| Zahlen, Uhrzeit, Datum | a1.e06 |
| Wetter und Jahreszeiten | a1.e11 |
| Wohnen | a1.e03, b1.e03, b2.e03 |
| Einkaufen und Preise | a1.e07 |
| Essen und Trinken (halal-neutral) | a1.e10, b1.e16 |
| Kleidung | a2.e06 |
| Körper und Gesundheit | a1.e12, a2.e08, b1.e05, b2.e04 |
| Schule und Lernen | a1.e02, a1.e09, a2.e09, b1.e02 |
| Arbeit und Berufe | a2.e12, b1.e12, b2.e05, b2.e16, c1.e01, c1.e14 |
| Verkehr und Unterwegssein | a2.e01, b1.e06 |
| Behörden und Formulare | a2.e03, b1.e11, b2.e06, c1.e02 |
| Bank und Post | a2.e14, b2.e08 |
| Stadt und Orientierung | a1.e05 |
| Natur und Umwelt | a2.e11, b1.e13, b2.e07, c1.e06 |
| Sport | a2.e07 |
| Hobbys und Freizeit (ohne Musik) | a1.e08 |
| Medien und Digitales (sachlich) | a2.e02, b1.e07, b2.e01, b2.e15, c1.e03, c1.e12 |
| Reisen und Besuch | a2.e04, b1.e04 |
| Nachbarschaft | a2.e05, b1.e08 |
| Ehrenamt | b1.e10, b2.e10, c1.e09 |
| Familienfeste | a2.e13 |
| Gefühle und Freundschaft | b1.e09 |
| Ausbildung und Bewerbung | b1.e15, b2.e02 |
| Verträge und Rechte | b2.e11, c1.e08 |
| Zusammenleben | b2.e13, c1.e04, c1.e13 |
| Wissenschaft und Technik | b1.e14, b2.e09, c1.e07 |
| Geschichte und Kultur | b2.e12, c1.e05, c1.e10 |
| Staat und Gemeinde (sachlich) | b2.e14, c1.e11 |

Als Hauptthema nicht vergeben, aber in Wortfeldern anderer Einheiten enthalten: Tiere.

### 6.2 Geschichten und Aufgaben je Einheit

#### A1

**ar.a1.e01 – Ahlan! Ich bin Laylā**

- Kann: Ich kann auf Arabisch grüßen, mich mit Namen vorstellen und mich verabschieden. Ich kann sagen, woher ich komme, wo ich wohne und welche Sprachen ich spreche. Ich kann fragen, wie es jemandem geht, und kurz antworten.
- Sprechhandlungen: grüßen und sich verabschieden, sich vorstellen, nach Name und Herkunft fragen, nach dem Befinden fragen, danken
- Geschichte: Erstes Treffen der Arabisch-AG in der Stadtbibliothek Wetzlar; Lehrerin Nādiya begrüßt die Gruppe, Laylā (11) stellt sich vor, Elif und Jan sagen, woher sie kommen und welche Sprachen sie sprechen. Dialog (Lektion): Yazan (14) trifft den neuen Mitschüler Emre am Schultor und fragt, wie es ihm geht. Ort: Stadtbibliothek, Schultor.
- Lesen: –
- Sprechen: 1) Sich in drei Sätzen vorstellen (Name, Herkunft, Wohnort). 2) Ein Begrüßungsgespräch mit eigenem Namen nachsprechen und dabei auf die langen Vokale achten.
- Schreiben: –
- Gesperrte Kandidaten: F-ar-01, F-ar-03

**ar.a1.e02 – Was ist das?**

- Kann: Ich kann Gegenstände im Klassenraum benennen und nach ihnen fragen. Ich kann mit Ja-Nein-Fragen nachfragen und mit naʿam oder lā antworten. Ich kann erkennen, ob ein Wort männlich oder weiblich ist.
- Sprechhandlungen: auf Dinge zeigen und sie benennen, Ja-Nein-Fragen stellen und beantworten, um etwas bitten (als feste Wendung)
- Geschichte: Laylā hat ihr Mäppchen vergessen; Elif leiht ihr einen Stift, Jan fragt nach Heft und Lineal. Dialog (Lektion): Lehrerin Nādiya zeigt auf Dinge, die Kinder raten mit hal-Fragen. Ort: Raum der Arabisch-AG.
- Lesen: Beschriftete Regalfächer und Schilder im Klassenraum (einzelne Wörter, voll vokalisiert).
- Sprechen: 1) Fünf Gegenstände auf dem eigenen Tisch mit hāḏā oder hāḏihi benennen. 2) Ein Ratespiel mit Ja-Nein-Fragen spielen (hal hāḏā …? – naʿam / lā).
- Schreiben: –

**ar.a1.e03 – Unser Zuhause**

- Kann: Ich kann die Räume und Möbel meiner Wohnung nennen und kurz beschreiben. Ich kann sagen, ob etwas groß, klein, neu oder alt ist. Ich kann den Artikel richtig aussprechen, auch vor Sonnenbuchstaben.
- Sprechhandlungen: Wohnung zeigen und beschreiben, Dinge mit Eigenschaften benennen, über ein Haustier sprechen
- Geschichte: Cousine Rīm ruft per Video aus Amman an; Laylā zeigt ihr die Wohnung in Wetzlar, ihr Zimmer und die Katze. Dialog (Lektion): Yazan sucht sein Ladekabel, Vater Bāsil fragt, ob es im Wohnzimmer liegt. Ort: Wohnung der Familie in Wetzlar.
- Lesen: –
- Sprechen: 1) Das eigene Zimmer mit drei Adjektiven beschreiben. 2) Wörter mit Sonnen- und Mondbuchstaben paarweise vorlesen (aš-šams – al-qamar).
- Schreiben: –

**ar.a1.e04 – Meine Familie**

- Kann: Ich kann meine Familie vorstellen und sagen, wer zu wem gehört. Ich kann bis zehn zählen und mein Alter nennen. Ich kann sagen, was ich habe und was jemand von Beruf ist.
- Sprechhandlungen: Familienmitglieder vorstellen, nach dem Alter fragen, Besitz ausdrücken, Berufe nennen
- Geschichte: Laylā zeigt Elif ein Familienfoto: Mutter Hind ist Apothekerin, Vater Bāsil Krankenpfleger und kocht gern, Oma Samīra und Opa Nizār wohnen in Amman. Dialog (Lektion): Jan fragt Yazan nach seinen Geschwistern und ihrem Alter. Ort: Laylās Zimmer.
- Lesen: Ein Steckbrief von Cousin Fāris (12) aus Amman: Name, Alter, Familie, Haustier.
- Sprechen: 1) Die eigene Familie mit einem Foto oder einer Skizze vorstellen. 2) Telefonnummern aus Ziffern vorlesen und beim Hören mitschreiben.
- Schreiben: –

**ar.a1.e05 – Wo ist die Bibliothek?**

- Kann: Ich kann nach dem Weg zu Orten in der Stadt fragen und eine kurze Wegbeschreibung verstehen. Ich kann sagen, wo etwas liegt und was es in meiner Straße gibt. Ich kann Verkehrsmittel nennen.
- Sprechhandlungen: nach dem Weg fragen, den Weg beschreiben, sagen, was es wo gibt, Ortsangaben machen
- Geschichte: Elif und Laylā wollen zur Stadtbibliothek; die Nachbarin Ursula erklärt den Weg über die Brücke an der Lahn. Dialog (Lektion): Opa Nizār ist zu Besuch und fragt Yazan, wo es eine Apotheke gibt. Ort: Altstadt von Wetzlar.
- Lesen: –
- Sprechen: 1) Den eigenen Schulweg mit drei Ortsangaben beschreiben. 2) Nach dem Weg fragen und mit yamīn, yasār und ilā l-amām antworten.
- Schreiben: –

**ar.a1.e06 – Mein Tag**

- Kann: Ich kann erzählen, was ich an einem normalen Tag mache. Ich kann Wochentage und Tageszeiten nennen. Ich kann Sätze mit wa, ṯumma und lākin verbinden.
- Sprechhandlungen: Tagesablauf beschreiben, Wochentage nennen, Gewohnheiten erzählen, Reihenfolge ausdrücken
- Geschichte: Ein Tag in Laylās Familie: Laylā steht auf, geht zur Schule und macht Hausaufgaben; Vater Bāsil hat Spätdienst im Krankenhaus. Dialog (Lektion): Fāris erzählt in einer Sprachnachricht aus Amman, wann seine Schule beginnt. Ort: Wohnung und Schule.
- Lesen: Laylās Wochenplan am Kühlschrank (Tage, Tageszeiten, Tätigkeiten).
- Sprechen: 1) Den eigenen Tagesablauf in fünf Sätzen erzählen. 2) Fragen zum Wochenplan einer Mitschülerin beantworten.
- Schreiben: –

**ar.a1.e07 – Auf dem Wochenmarkt**

- Kann: Ich kann auf dem Markt sagen, was ich kaufen möchte, und nach dem Preis fragen. Ich kann Zahlen bis hundert und Preise verstehen. Ich kann Obst und Gemüse benennen.
- Sprechhandlungen: einkaufen, nach dem Preis fragen, Mengen angeben, bezahlen und danken
- Geschichte: Samstag auf dem Wochenmarkt in Wetzlar: Mutter Hind und Laylā kaufen Tomaten, Gurken und Äpfel, der Händler Ġassān nennt die Preise. Dialog (Lektion): Yazan kauft am Stand Brot und fragt nach dem Wechselgeld. Ort: Wochenmarkt in der Altstadt.
- Lesen: –
- Sprechen: 1) Ein Einkaufsgespräch spielen: begrüßen, bestellen, Preis erfragen, bezahlen. 2) Einen Einkaufszettel mit Mengen vorlesen (kīlū tuffāḥ …).
- Schreiben: –

**ar.a1.e08 – Was machst du gern?**

- Kann: Ich kann sagen, was ich in meiner Freizeit gern mache und was nicht. Ich kann andere nach ihren Hobbys fragen. Ich kann über Sport sprechen, den wir zusammen machen.
- Sprechhandlungen: über Freizeit sprechen, Vorlieben ausdrücken, verneinen, sich verabreden (als Wendung)
- Geschichte: Yazan, Emre und Jan spielen nach der Schule Fußball; Laylā und Elif malen und lesen in der Bibliothek. Dialog (Lektion): Lehrerin Nādiya fragt die Gruppe, was alle am Wochenende machen. Ort: Sportplatz und Bibliothek.
- Lesen: Aushang der Stadtbibliothek: Angebote für Kinder in der Woche (Lesen, Malen, Schach).
- Sprechen: 1) Drei Dinge nennen, die ich gern mache, und eines, das ich nicht mache. 2) Eine Partnerin oder einen Partner nach Hobbys fragen und berichten.
- Schreiben: –

**ar.a1.e09 – Wie spät ist es?**

- Kann: Ich kann nach der Uhrzeit fragen und volle, halbe und Viertelstunden nennen. Ich kann meinen Stundenplan vorstellen. Ich kann sagen, was etwas nicht ist oder was ich nicht habe.
- Sprechhandlungen: Uhrzeit erfragen und nennen, Stundenplan beschreiben, verneinen
- Geschichte: Montagmorgen: Laylā ist spät dran, die Uhr an der Haltestelle zeigt halb acht; Elif wartet schon. Dialog (Lektion): Yazan und Jan vergleichen ihre Stundenpläne und finden heraus, wann sie zusammen Pause haben. Ort: Bushaltestelle, Schulhof.
- Lesen: –
- Sprechen: 1) Den eigenen Stundenplan für einen Tag vorstellen. 2) Uhrzeiten hören und nennen.
- Schreiben: –

**ar.a1.e10 – Zu Gast bei Oma Samīra**

- Kann: Ich kann sagen, was ich essen und trinken möchte. Ich kann am Tisch um etwas bitten und etwas anbieten. Ich kann einfache Aufforderungen verstehen und geben.
- Sprechhandlungen: Wünsche äußern, am Tisch bitten und anbieten, auffordern, loben und danken
- Geschichte: Videoanruf mit Oma Samīra in Amman: Sie zeigt, wie sie Linsensuppe und Reis mit Hähnchen kocht, Laylā kocht in Wetzlar mit. Dialog (Lektion): Vater Bāsil fragt beim Abendessen, wer noch Brot oder Saft möchte. Ort: Küchen in Amman und Wetzlar.
- Lesen: Eine kurze Speisekarte der Schulmensa (Gerichte mit Fleischart, Getränke).
- Sprechen: 1) Am Tisch höflich um drei Dinge bitten. 2) Sagen, was ich gern esse und was nicht.
- Schreiben: –
- Gesperrte Kandidaten: F-ar-02

**ar.a1.e11 – Sonne, Regen, Jacke**

- Kann: Ich kann sagen, wie das Wetter ist, und die Jahreszeiten nennen. Ich kann sagen, was ich bei welchem Wetter anziehe. Ich kann die Farben von Kleidung nennen.
- Sprechhandlungen: über das Wetter sprechen, Kleidung beschreiben, Ratschläge als Aufforderung geben
- Geschichte: Laylā packt für einen Ausflug; in Wetzlar regnet es, in Amman scheint die Sonne, Cousine Rīm schickt ein Foto. Dialog (Lektion): Mutter Hind erinnert Yazan an Jacke und Mütze. Ort: Flur der Wohnung.
- Lesen: –
- Sprechen: 1) Das Wetter von heute beschreiben und sagen, was ich anziehe. 2) Ein Kleidungsstück mit Farbe beschreiben, die anderen raten.
- Schreiben: –

**ar.a1.e12 – Bei der Kinderärztin**

- Kann: Ich kann sagen, was mir wehtut und wie es mir geht. Ich kann Körperteile benennen. Ich kann verwandte Wörter an ihrer Wurzel erkennen.
- Sprechhandlungen: Beschwerden nennen, Gefühle ausdrücken, Anweisungen der Ärztin verstehen, gute Besserung wünschen
- Geschichte: Laylā hat Halsschmerzen; Mutter Hind geht mit ihr zur Kinderärztin Sawsan, die sie untersucht und Tee mit Honig empfiehlt. Dialog (Lektion): Elif ruft an, fragt, wie es Laylā geht, und wünscht gute Besserung (šifāʾan ʿāǧilan). Ort: Kinderarztpraxis.
- Lesen: Ein Schild in der Praxis (Öffnungszeiten, Bitte um Ruhe) und eine kurze Genesungskarte.
- Sprechen: 1) Sagen, was wehtut und seit wann (als feste Wendung). 2) Sagen, wie ich mich heute fühle.
- Schreiben: –

#### A2

**ar.a2.e01 – Mit dem Zug nach Frankfurt**

- Kann: Ich kann erzählen, wohin ich gefahren bin und was ich gesehen habe. Ich kann eine Fahrkarte kaufen und nach Gleis und Abfahrt fragen. Ich kann sagen, wie etwas war.
- Sprechhandlungen: von einem Ausflug erzählen, Fahrkarte kaufen, nach Abfahrt und Gleis fragen, Eindrücke schildern
- Geschichte: Yazan fährt mit Emre und Jan zum ersten Mal allein mit dem Zug nach Frankfurt ins Naturkundemuseum; am Abend erzählt er der Familie davon. Dialog (Lektion): Laylā kauft am Automaten eine Fahrkarte und fragt eine Bahnmitarbeiterin nach dem Gleis. Ort: Bahnhof Wetzlar, Museum.
- Lesen: Eine Anzeigetafel am Bahnhof und eine kurze Nachricht von Yazan an seine Mutter.
- Sprechen: 1) Von einem Ausflug erzählen (wohin, mit wem, wie war es). 2) Am Schalter eine Fahrkarte kaufen (Rollenspiel).
- Schreiben: Eine kurze Nachricht an die Familie über einen Ausflug (20–30 Wörter).

**ar.a2.e02 – Grüße nach Amman**

- Kann: Ich kann in einer Sprach- oder Textnachricht erzählen, was wir gemacht haben. Ich kann sagen, was ich noch nicht gemacht habe. Ich kann über Verwandte auf der mütterlichen und väterlichen Seite sprechen.
- Sprechhandlungen: Neuigkeiten erzählen, nachfragen, Vergangenes verneinen, Verwandtschaft benennen
- Geschichte: Familie al-Ḥaddād schickt Sprachnachrichten in die Familiengruppe: Wir waren im Schwimmbad, wir haben Oma Samīras Rezept gekocht; Cousin Fāris antwortet, dass er die Prüfung noch nicht geschrieben hat. Dialog (Lektion): Laylā fragt Tante Lubnā am Telefon, was die Familie am Wochenende gemacht hat. Ort: Wohnzimmer, Familiengruppe am Telefon.
- Lesen: Ein kurzer Verlauf der Familiengruppe mit Fotos und Antworten (nur Familie, keine Fremden).
- Sprechen: 1) Eine Sprachnachricht über das Wochenende aufnehmen (vier Sätze). 2) Fragen, was jemand gestern gemacht hat, und antworten.
- Schreiben: Eine Antwort in der Familiengruppe: was wir gemacht und was wir noch nicht gemacht haben (25–35 Wörter).

**ar.a2.e03 – Ein Termin auf dem Amt**

- Kann: Ich kann einen Termin vereinbaren und ein Datum nennen. Ich kann ein einfaches Formular mit meinen Angaben ausfüllen. Ich kann Erwachsene höflich ansprechen.
- Sprechhandlungen: Termin vereinbaren, persönliche Angaben machen, höflich ansprechen, buchstabieren und Zahlen diktieren
- Geschichte: In den Ferien in Amman begleitet Laylā Opa Nizār zum Bürgerbüro; er braucht einen neuen Ausweis, die Mitarbeiterin fragt nach Geburtsdatum, Adresse und Telefonnummer. Dialog (Lektion): Yazan ruft in einer Sprachschule an und vereinbart einen Termin für den Einstufungstest. Ort: Bürgerbüro in Amman, Telefon.
- Lesen: Ein einfaches Anmeldeformular (Name, Datum, Adresse, Unterschrift).
- Sprechen: 1) Einen Termin telefonisch vereinbaren (Tag, Datum, Uhrzeit). 2) Die eigenen Angaben für ein Formular nennen und buchstabieren.
- Schreiben: Ein Formular mit den eigenen Angaben ausfüllen und eine kurze Terminbestätigung schreiben (20–30 Wörter).

**ar.a2.e04 – Ferienpläne**

- Kann: Ich kann sagen, was ich in den Ferien vorhabe. Ich kann ausdrücken, was ich möchte und wozu. Ich kann über Reiseziele, Unterkunft und Landschaft sprechen.
- Sprechhandlungen: Pläne machen, Absichten und Zwecke nennen, Vorschläge machen, Landschaft beschreiben
- Geschichte: Familie al-Ḥaddād plant die Sommerferien in Jordanien: Laylā will mit Rīm in die Wüste Wadi Rum, Yazan will Onkel Hišām in der Bäckerei helfen. Dialog (Lektion): Elif fragt Laylā, wann sie fliegt und was sie mitnimmt. Ort: Wohnzimmer, Schulhof.
- Lesen: Eine Postkarte von Rīm mit Plänen für den Sommer.
- Sprechen: 1) Drei Pläne für die Ferien nennen und sagen, wozu. 2) Einen Ausflug vorschlagen und gemeinsam planen.
- Schreiben: Eine Postkarte oder Nachricht mit Ferienplänen (30–40 Wörter).
- Gesperrte Kandidaten: F-ar-04

**ar.a2.e05 – Neue Nachbarn**

- Kann: Ich kann neue Nachbarn begrüßen, mich vorstellen und Hilfe anbieten. Ich kann um Hilfe bitten und mich bedanken. Ich kann sagen, wie oft ich etwas mache.
- Sprechhandlungen: Nachbarn kennenlernen, Hilfe anbieten und erbitten, sich bedanken, Häufigkeit angeben
- Geschichte: Familie Yılmaz zieht ins Haus; Yazan und Vater Bāsil tragen Kisten, Defne (10) aus Familie Yılmaz lernt Laylā kennen, Frau Becker bringt Kuchen. Dialog (Lektion): Laylā bietet Frau Becker an, ihre Einkäufe in den dritten Stock zu tragen. Ort: Treppenhaus und Hof.
- Lesen: Ein Aushang im Treppenhaus: Willkommen, drei Hausregeln, Bitte um Ruhe am Abend.
- Sprechen: 1) Neue Nachbarn begrüßen und Hilfe anbieten (Rollenspiel). 2) Sagen, was ich immer, oft, manchmal oder nie zu Hause mache.
- Schreiben: Eine kurze Willkommensnachricht für neue Nachbarn (25–35 Wörter).
- Gesperrte Kandidaten: R-03, F-ar-07

**ar.a2.e06 – Welche Jacke ist schöner?**

- Kann: Ich kann im Geschäft nach Größe, Farbe und Preis fragen. Ich kann zwei Dinge vergleichen und sagen, was mir besser gefällt. Ich kann sagen, was ich kaufen möchte, und etwas umtauschen.
- Sprechhandlungen: im Geschäft fragen, vergleichen, Vorlieben begründen, umtauschen
- Geschichte: Laylā braucht eine Winterjacke; mit Mutter Hind und Elif probiert sie zwei Jacken an: Die blaue ist wärmer, die grüne günstiger. Dialog (Lektion): Yazan tauscht Schuhe um, die zu klein sind; der Verkäufer Fādī hilft. Ort: Bekleidungsgeschäft.
- Lesen: Ein Prospekt mit Angeboten (Kleidungsstücke, Größen, Preise, Rabatt).
- Sprechen: 1) Zwei Kleidungsstücke vergleichen und eine Wahl begründen. 2) Im Geschäft nach einer anderen Größe oder Farbe fragen.
- Schreiben: Eine Nachricht an eine Freundin: Welche Jacke soll ich kaufen? (30–40 Wörter)

**ar.a2.e07 – Das Spiel am Samstag**

- Kann: Ich kann von einem Spiel oder Wettkampf erzählen. Ich kann Mannschaften und Spielerinnen beschreiben. Ich kann sagen, wer gewonnen hat und wie das Spiel ausgegangen ist.
- Sprechhandlungen: von einem Spiel erzählen, anfeuern und loben, Ergebnisse nennen
- Geschichte: Laylās Basketballmannschaft spielt am Samstag; die Spielerinnen trainieren, Elif und Lena feuern an, am Ende steht es unentschieden. Dialog (Lektion): Yazan erzählt Opa Nizār am Telefon vom Fußballturnier der Schule. Ort: Sporthalle, Sportplatz.
- Lesen: Ein kurzer Spielbericht in der Schülerzeitung.
- Sprechen: 1) Von einem Spiel erzählen: wer, wo, Ergebnis. 2) Die eigene Lieblingssportart beschreiben.
- Schreiben: Ein kurzer Spielbericht für die Schülerzeitung (30–40 Wörter).

**ar.a2.e08 – Ich fühle mich nicht gut**

- Kann: Ich kann beim Arzt meine Beschwerden schildern und sagen, seit wann ich sie habe. Ich kann Anweisungen zur Einnahme eines Medikaments verstehen. Ich kann in der Apotheke nach einem Mittel fragen.
- Sprechhandlungen: Beschwerden schildern, Anweisungen verstehen, nachfragen, gute Besserung wünschen
- Geschichte: Yazan hat eine Erkältung mit Fieber; Vater Bāsil bringt ihn zur Hausärztin Sawsan, sie untersucht ihn und schreibt ein Rezept. Dialog (Lektion): In der Apotheke erklärt Mutter Hind einem Kunden auf Arabisch, wie er die Tabletten nehmen soll. Ort: Arztpraxis, Apotheke.
- Lesen: Ein Beipackzettel in einfacher Sprache (wie oft, wann, wie viel).
- Sprechen: 1) Beim Arzt Beschwerden schildern (Rollenspiel). 2) Einer kranken Person gute Besserung wünschen und Hilfe anbieten.
- Schreiben: Eine Entschuldigung für die Schule wegen Krankheit (30–40 Wörter).
- Gesperrte Kandidaten: F-ar-10

**ar.a2.e09 – Lernen für die Klassenarbeit**

- Kann: Ich kann sagen, was ich tun muss und was man nicht tun soll. Ich kann Lernpläne und Tipps verstehen und geben. Ich kann über Prüfungen und Noten sprechen.
- Sprechhandlungen: Pflichten nennen, Verbote ausdrücken, Ratschläge geben, sich zum Lernen verabreden
- Geschichte: Vor der Mathearbeit lernen Laylā und Elif zusammen; Yazan gibt Tipps: früh anfangen, Pausen machen, das Handy weglegen. Dialog (Lektion): Lehrerin Nādiya erklärt der AG die Regeln für den Vokabeltest. Ort: Bibliothek, Klassenraum.
- Lesen: Eine Liste mit Lerntipps in der Schülerzeitung.
- Sprechen: 1) Drei Lerntipps geben (yaǧibu an …, lā …). 2) Die Regeln für eine Prüfung erklären.
- Schreiben: Einen eigenen Lernplan für eine Woche schreiben (30–40 Wörter).
- Gesperrte Kandidaten: R-08

**ar.a2.e10 – Die große Familie**

- Kann: Ich kann meine Verwandten beschreiben und ihren Charakter nennen. Ich kann sagen, seit wann etwas so ist und was vorher oder nachher geschah. Ich kann Gründe nennen.
- Sprechhandlungen: Verwandte beschreiben, Charakter beschreiben, begründen, zeitliche Abfolge ausdrücken
- Geschichte: Oma Samīra und Opa Nizār besuchen Wetzlar; beim Familienessen im Garten stellt Laylā Elif die Verwandten vor, die per Video dabei sind: Tante Lubnā, Onkel Hišām, Cousine Rīm, Cousin Fāris. Dialog (Lektion): Yazan erklärt, warum Rīm nicht mitkommen konnte. Ort: Wohnung und Garten.
- Lesen: Ein Familienstammbaum mit kurzen Beschreibungen.
- Sprechen: 1) Eine Verwandte oder einen Verwandten beschreiben (Charakter statt Aussehen). 2) Begründen, warum ich jemanden gern besuche.
- Schreiben: Eine kurze Beschreibung eines Familienmitglieds (35–45 Wörter).
- Gesperrte Kandidaten: F-ar-05, F-ar-06

**ar.a2.e11 – Ein Tag im Wald**

- Kann: Ich kann beschreiben, was ich in der Natur sehe. Ich kann sagen, was offen, geschlossen oder erlaubt ist. Ich kann Tiere und Pflanzen nennen.
- Sprechhandlungen: Natur beschreiben, Schilder verstehen, Beobachtungen teilen
- Geschichte: Die Arabisch-AG wandert mit Lehrerin Nādiya durch den Stadtwald; sie sehen Eichhörnchen, Vögel und einen Bach, dann zieht ein Gewitter auf und alle stellen sich in einer Hütte unter. Dialog (Lektion): Laylā liest das Schild am Waldspielplatz vor. Ort: Stadtwald.
- Lesen: Eine Infotafel im Wald (Tiere, Pflanzen, Regeln).
- Sprechen: 1) Ein Naturfoto beschreiben (was, wo, wie). 2) Regeln für den Wald erklären.
- Schreiben: Eine kurze Beschreibung eines Ausflugs in die Natur (35–45 Wörter).

**ar.a2.e12 – Was willst du werden?**

- Kann: Ich kann über Berufe sprechen und sagen, was ich werden möchte. Ich kann sagen, was ich kann und was ich gern tue. Ich kann einen Arbeitsplatz beschreiben.
- Sprechhandlungen: Berufswünsche nennen, Fähigkeiten beschreiben, nach der Arbeit fragen
- Geschichte: Berufetag in der Schule: Mutter Hind erklärt die Arbeit in der Apotheke, Herr Yılmaz die Arbeit als Elektriker; Yazan überlegt, ob er Ingenieur oder Krankenpfleger werden will. Dialog (Lektion): Laylā fragt Onkel Hišām per Video, wie früh er in der Bäckerei anfängt. Ort: Aula der Schule, Bäckerei in Amman.
- Lesen: Kurze Berufsporträts (drei Personen, je drei Sätze).
- Sprechen: 1) Sagen, was ich werden möchte und was ich dafür kann. 2) Eine Person nach ihrem Beruf befragen.
- Schreiben: Ein kurzer Text: Mein Traumberuf (35–45 Wörter).
- Gesperrte Kandidaten: R-10

**ar.a2.e13 – Eine Hochzeit in der Familie**

- Kann: Ich kann zu einem Familienfest einladen und auf eine Einladung antworten. Ich kann gratulieren und Bewunderung ausdrücken. Ich kann von einem Fest erzählen.
- Sprechhandlungen: einladen und zusagen, gratulieren, loben und bewundern, vom Fest erzählen
- Geschichte: Cousine Rīm heiratet in Amman; die Familie reist hin, Laylā hilft beim Schmücken, alle Gäste bringen Geschenke, Oma Samīra backt Süßes (Szenen ohne Musik und Tanz, Leitfaden OF-02). Dialog (Lektion): Yazan gratuliert Rīm und ihrem Mann Ayman per Video. Ort: Festsaal und Haus der Großeltern in Amman.
- Lesen: Eine Einladungskarte zur Hochzeit mit Datum, Ort und Bitte um Antwort.
- Sprechen: 1) Auf eine Einladung zusagen oder höflich absagen. 2) Einem Paar gratulieren und das Fest loben.
- Schreiben: Eine Glückwunschkarte zur Hochzeit (30–40 Wörter).
- Gesperrte Kandidaten: R-04, R-05, R-06, F-ar-12, F-ar-13

**ar.a2.e14 – Paket, Konto, Rechnung**

- Kann: Ich kann bei der Post ein Paket aufgeben und nach dem Preis fragen. Ich kann große Zahlen, Beträge und Jahreszahlen verstehen und nennen. Ich kann eine einfache Rechnung lesen.
- Sprechhandlungen: Paket aufgeben, Beträge nennen, Rechnung prüfen, nach Kosten fragen
- Geschichte: Laylā schickt ein Paket mit Geschenken an Fāris in Amman; der Postmitarbeiter nennt Gewicht und Preis. Dialog (Lektion): Yazan eröffnet mit Vater Bāsil sein erstes Schülerkonto und lernt, dass Passwörter nie an Fremde gehen. Ort: Postfiliale, Bank.
- Lesen: Eine vereinfachte Handyrechnung (Beträge, Datum).
- Sprechen: 1) Am Schalter ein Paket aufgeben (Rollenspiel). 2) Preise und Jahreszahlen vorlesen.
- Schreiben: Ein Adressaufkleber und eine kurze Notiz für das Paket (20–30 Wörter).

#### B1

**ar.b1.e01 – Als Oma jung war**

- Kann: Ich kann erzählen, was früher regelmäßig geschah und wie sich das Leben verändert hat. Ich kann eine Erzählung in der richtigen Reihenfolge wiedergeben. Ich kann nach Erinnerungen fragen und Interesse zeigen.
- Sprechhandlungen: von früher erzählen, Gewohnheiten der Vergangenheit beschreiben, nachfragen, früher und heute vergleichen
- Geschichte: Oma Samīra erzählt Laylā beim Fotoalbum, wie sie als Kind in einem Dorf bei Irbid lebte, Wasser vom Brunnen holte und später Lehrerin wurde. Dialog (Lektion): Yazan befragt Opa Nizār für ein Schulprojekt über seine Arbeit als Mechaniker in den 1980er-Jahren. Ort: Wohnzimmer in Amman, Videoanruf.
- Lesen: 1) Ein Erinnerungstext: „Mein Schulweg vor sechzig Jahren“ (erfundene Ich-Erzählung). 2) Ein kurzer Bericht über ein Erzählcafé für Jung und Alt in Wetzlar.
- Sprechen: 1) Ein älteres Familienmitglied nach früher befragen und berichten. 2) Erzählen, was ich als kleines Kind oft gemacht habe.
- Schreiben: Eine Erinnerung aus der Kindheit (70–90 Wörter).
- Gesperrte Kandidaten: R-13

**ar.b1.e02 – Voneinander lernen**

- Kann: Ich kann erklären, wie ich lerne, und anderen etwas beibringen. Ich kann in einer Gruppe Aufgaben verteilen und Ergebnisse vorstellen. Ich kann verwandte Verben wie „lernen“ und „lehren“ auseinanderhalten.
- Sprechhandlungen: erklären und beibringen, Arbeit verteilen, Ergebnisse vorstellen, Rückmeldung geben
- Geschichte: Projektwoche: Laylā bringt Elif arabische Buchstaben bei, Elif erklärt ihr türkische Wörter; Jan und Yazan bauen gemeinsam ein Modell der Altstadt. Dialog (Lektion): Lehrerin Nādiya bespricht mit der Gruppe, wer was vorbereitet. Ort: Schule.
- Lesen: 1) Ein Merkblatt der Schule: So lernt ihr im Tandem. 2) Ein kurzer Bericht über die Projektwoche für die Schülerzeitung.
- Sprechen: 1) Einer Partnerin oder einem Partner eine kurze Sache beibringen. 2) Ein Gruppenergebnis in einer Minute vorstellen.
- Schreiben: Eine E-Mail an die Gruppe mit der Verteilung der Aufgaben (70–90 Wörter).

**ar.b1.e03 – Rīm sucht eine Wohnung**

- Kann: Ich kann Wohnungsanzeigen verstehen und nach Einzelheiten fragen. Ich kann eine Wohnung genau beschreiben und bewerten. Ich kann Werkzeuge und Geräte im Haushalt benennen.
- Sprechhandlungen: Anzeige verstehen, anrufen und nachfragen, Wohnung beschreiben und bewerten, Vor- und Nachteile nennen
- Geschichte: Cousine Rīm beginnt ein Studium in Amman und sucht mit Tante Lubnā eine kleine Wohnung nahe der Universität, am liebsten mit Balkon. Dialog (Lektion): Rīm ruft beim Vermieter an und fragt nach Miete, Stockwerk und Aufzug. Ort: Amman.
- Lesen: 1) Drei kurze Wohnungsanzeigen zum Vergleichen. 2) Eine Nachricht von Rīm an Laylā mit der Beschreibung ihrer neuen Wohnung.
- Sprechen: 1) Bei einer Anzeige anrufen und drei Fragen stellen. 2) Die eigene Traumwohnung beschreiben.
- Schreiben: Eine Antwort auf eine Wohnungsanzeige mit Fragen (70–90 Wörter).

**ar.b1.e04 – Drei Tage in Tunis**

- Kann: Ich kann eine Reise planen und eine Unterkunft buchen. Ich kann Zahlen mit dem richtigen Nomen verbinden. Ich kann von Sehenswürdigkeiten berichten und mich höflich beschweren.
- Sprechhandlungen: Unterkunft buchen, Reise planen, Sehenswürdigkeiten beschreiben, sich höflich beschweren
- Geschichte: Hind und Bāsil fahren mit Laylā und Yazan für drei Tage nach Tunis; sie buchen zwei Zimmer, besuchen die Altstadt, ein Museum und den Strand. Dialog (Lektion): An der Rezeption fehlt eine Reservierung, Yazan klärt das höflich. Ort: Hotel und Altstadt von Tunis.
- Lesen: 1) Eine Hotelbestätigung mit Daten und Preisen. 2) Ein Reiseführertext über die Altstadt von Tunis.
- Sprechen: 1) Am Telefon ein Zimmer für zwei Nächte buchen. 2) Von einer Reise mit Zahlen und Daten berichten.
- Schreiben: Eine Buchungsanfrage per E-Mail (70–90 Wörter).
- Gesperrte Kandidaten: R-12

**ar.b1.e05 – Gesund durch den Winter**

- Kann: Ich kann über gesunde Ernährung, Bewegung und Schlaf sprechen. Ich kann Ratschläge zur Vorbeugung verstehen und geben. Ich kann sagen, was ich vergessen habe oder noch tun muss.
- Sprechhandlungen: Ratschläge geben, Gewohnheiten beschreiben, sich erinnern und erinnern
- Geschichte: In der Schule gibt es einen Gesundheitstag; Pfleger Bāsil erklärt, warum Händewaschen, Schlaf und Spazierengehen helfen. Dialog (Lektion): Laylā erinnert Opa Nizār am Telefon an seine Tabletten und seinen Spaziergang. Ort: Schulaula, Telefon.
- Lesen: 1) Ein Faltblatt: Fünf Tipps für den Winter. 2) Ein kurzer Artikel über Schlaf bei Jugendlichen.
- Sprechen: 1) Einer Freundin drei Tipps für gesunde Gewohnheiten geben. 2) Erzählen, was ich für meine Gesundheit tue.
- Schreiben: Ein Wochenplan für mehr Bewegung mit Begründung (70–90 Wörter).

**ar.b1.e06 – Der Führerschein**

- Kann: Ich kann Verkehrsregeln und Verkehrsschilder verstehen und erklären. Ich kann den Weg zum Führerschein beschreiben. Ich kann über Ankommen, Anhalten und Abfahren genau sprechen.
- Sprechhandlungen: Regeln erklären, Ablauf beschreiben, um Erlaubnis bitten, Erfahrungen austauschen
- Geschichte: Yazan (inzwischen 17) beginnt in der Fahrschule; Fahrlehrer Murād erklärt Vorfahrt, Schilder und Tempo, Yazan übt mit Vater Bāsil auf einem leeren Parkplatz. Dialog (Lektion): Laylā fragt Yazan, wie die Theorieprüfung abläuft. Ort: Fahrschule, Parkplatz.
- Lesen: 1) Ein Merkblatt der Fahrschule (Ablauf, Unterlagen, Kosten). 2) Fünf Verkehrsschilder mit kurzer Erklärung.
- Sprechen: 1) Drei Verkehrsregeln erklären. 2) Den Weg zum Führerschein in Schritten beschreiben.
- Schreiben: Eine Nachricht an die Fahrschule, um einen Termin zu verschieben (70–90 Wörter).

**ar.b1.e07 – Sicher im Netz**

- Kann: Ich kann über sichere Passwörter, Privatsphäre und fremde Nachrichten sprechen. Ich kann technische Abläufe wie Anmelden, Herunterladen und Warten beschreiben. Ich kann Regeln für Medien in der Familie aushandeln.
- Sprechhandlungen: warnen und raten, Abläufe beschreiben, Regeln vereinbaren, Probleme melden
- Geschichte: In der AG spricht Lehrerin Nādiya über Sicherheit im Netz; Laylā bekommt eine merkwürdige Nachricht von einem Unbekannten und zeigt sie sofort ihrer Mutter. Dialog (Lektion): Familie al-Ḥaddād vereinbart Regeln für Bildschirmzeiten am Abend. Ort: Klassenraum, Wohnzimmer.
- Lesen: 1) Ein Merkblatt: Zehn Regeln für sichere Passwörter. 2) Ein kurzer Artikel über Bildschirmzeit in Familien.
- Sprechen: 1) Drei Regeln für sichere Nutzung erklären. 2) Mit der Familie Regeln für Bildschirmzeiten aushandeln (Rollenspiel).
- Schreiben: Familienregeln für Medien mit Begründung (70–90 Wörter).

**ar.b1.e08 – Ärger im Treppenhaus**

- Kann: Ich kann ein Problem höflich ansprechen und meine Sicht begründen. Ich kann wiedergeben, was jemand gesagt oder gemeint hat. Ich kann gemeinsam eine Lösung vorschlagen.
- Sprechhandlungen: Beschwerde höflich vorbringen, Meinung äußern, vermitteln, sich entschuldigen
- Geschichte: Im Hof stehen Fahrräder im Weg, im Treppenhaus ist es abends laut; Frau Becker, Herr Yılmaz und Vater Bāsil sprechen beim Hoffest darüber und finden eine Lösung. Dialog (Lektion): Laylā entschuldigt sich bei Frau Becker, weil der Ball ihre Blumen getroffen hat. Ort: Hof und Treppenhaus.
- Lesen: 1) Die Hausordnung in einfacher Form. 2) Eine Nachricht der Hausverwaltung über neue Fahrradständer.
- Sprechen: 1) Ein Problem höflich ansprechen und eine Lösung vorschlagen (Rollenspiel). 2) Wiedergeben, was eine andere Person meint.
- Schreiben: Eine höfliche Nachricht an die Nachbarn mit einem Vorschlag (70–90 Wörter).

**ar.b1.e09 – Wenn es schwer wird**

- Kann: Ich kann über Gefühle sprechen und andere trösten. Ich kann sagen, was ich tue, wenn ich traurig oder wütend bin. Ich kann einen Streit friedlich klären.
- Sprechhandlungen: Gefühle ausdrücken, trösten, sich entschuldigen, Missverständnisse klären
- Geschichte: Elifs Großvater in der Türkei ist gestorben; Laylā tröstet sie, die Freundinnen gehen an der Lahn spazieren und erzählen sich schöne Erinnerungen (ohne Einzelheiten, Leitfaden OF-17). Dialog (Lektion): Yazan und Emre klären ein Missverständnis nach dem Training. Ort: Park an der Lahn, Sportplatz.
- Lesen: 1) Ein Ratgebertext für Jugendliche: Was hilft, wenn man traurig ist? 2) Eine kurze Erzählung über eine Freundschaft, die einen Streit übersteht.
- Sprechen: 1) Eine Freundin trösten und Hilfe anbieten (Rollenspiel). 2) Erzählen, was ich tue, wenn ich wütend bin.
- Schreiben: Eine Nachricht zum Trost oder zur Entschuldigung (70–90 Wörter).
- Gesperrte Kandidaten: F-ar-11

**ar.b1.e10 – Nachhilfe im Jugendtreff**

- Kann: Ich kann erklären, wie und wo ich mich freiwillig engagiere. Ich kann die drei Fälle erklären und meist richtig verwenden. Ich kann über Sprache sprechen (Nomen, Verb, Endung).
- Sprechhandlungen: Hilfe anbieten, erklären, korrigieren und loben, von Erfahrungen berichten
- Geschichte: Yazan gibt im Jugendtreff ehrenamtlich Nachhilfe; einem jüngeren Schüler erklärt er an Beispielen, warum ein Wort einmal auf -u, einmal auf -a und einmal auf -i endet. Dialog (Lektion): Die Leiterin des Treffs, Frau Schulz, fragt Yazan, ob er auch samstags kommen kann. Ort: Jugendtreff.
- Lesen: 1) Ein Aushang: Freiwillige für die Hausaufgabenhilfe gesucht. 2) Ein kurzer Erfahrungsbericht einer Jugendlichen über ihr Ehrenamt.
- Sprechen: 1) Erklären, warum ein Wort eine bestimmte Endung hat (drei Beispiele). 2) Von einem Ehrenamt erzählen oder eines vorschlagen.
- Schreiben: Eine Bewerbung als Freiwillige oder Freiwilliger beim Jugendtreff (70–90 Wörter).

**ar.b1.e11 – Der Antrag für den Austausch**

- Kann: Ich kann ein Antragsformular verstehen und die nötigen Unterlagen zusammenstellen. Ich kann die Form des Verbs nach Partikeln richtig wählen. Ich kann Fristen und Bedingungen erfragen.
- Sprechhandlungen: Unterlagen erfragen, Formular ausfüllen, Fristen klären, nachhaken
- Geschichte: Laylā bewirbt sich für einen Schüleraustausch mit einer Schule in Amman; im Sekretariat erklärt Frau Wagner, welche Unterlagen fehlen, und Laylā fragt nach der Frist. Dialog (Lektion): Mutter Hind telefoniert mit der Partnerschule in Amman. Ort: Schulsekretariat, Telefon.
- Lesen: 1) Ein Antragsformular mit Ausfüllhinweisen. 2) Eine E-Mail der Partnerschule mit Bedingungen und Fristen.
- Sprechen: 1) Telefonisch nach Unterlagen und Fristen fragen. 2) Die eigenen Gründe für einen Austausch erklären.
- Schreiben: Ein kurzes Motivationsschreiben für den Austausch (80–100 Wörter).

**ar.b1.e12 – Praktikum in der Werkstatt**

- Kann: Ich kann meinen Arbeitsplatz und meine Aufgaben im Praktikum beschreiben. Ich kann sagen, was schon erledigt ist und was vielleicht noch passiert. Ich kann Werkzeuge und Arbeitsschritte benennen.
- Sprechhandlungen: Aufgaben beschreiben, nachfragen, berichten, auf Sicherheit hinweisen
- Geschichte: Yazan macht ein zweiwöchiges Praktikum in der Autowerkstatt von Ġassān; er lernt Werkzeuge kennen, hilft beim Reifenwechsel und führt ein Praktikumsheft. Dialog (Lektion): Ausbilderin Frau Klein fragt Yazan, ob er die Bremsen schon geprüft hat. Ort: Autowerkstatt.
- Lesen: 1) Eine Seite aus dem Praktikumsheft (Tagesbericht). 2) Sicherheitshinweise in der Werkstatt.
- Sprechen: 1) Einen Arbeitstag im Praktikum beschreiben. 2) Einen Arbeitsschritt erklären.
- Schreiben: Ein Tagesbericht für das Praktikumsheft (80–100 Wörter).

**ar.b1.e13 – Weniger Müll, mehr Bäume**

- Kann: Ich kann über Mülltrennung, Recycling und Pflanzen sprechen. Ich kann Dinge vergleichen, auch wenn es keine eigene Steigerungsform gibt. Ich kann an einer Aktion teilnehmen und andere dazu einladen.
- Sprechhandlungen: vorschlagen, vergleichen, einladen, berichten
- Geschichte: Die Schule pflanzt mit der Stadt Bäume am Lahnufer; Laylā und Elif sammeln vorher Müll und sortieren ihn. Dialog (Lektion): Herr Yılmaz erklärt Defne, welche Tonne wofür ist. Ort: Lahnufer, Hof.
- Lesen: 1) Ein Flyer der Stadt zur Mülltrennung. 2) Ein Bericht über eine Baumpflanzaktion.
- Sprechen: 1) Eine Umweltaktion vorschlagen und andere einladen. 2) Zwei Verpackungen vergleichen (umweltfreundlicher, weniger Müll).
- Schreiben: Ein Beitrag für die Schülerzeitung: Macht mit bei der Pflanzaktion (80–100 Wörter).

**ar.b1.e14 – Wie funktioniert das?**

- Kann: Ich kann einfache technische Abläufe und Versuche beschreiben. Ich kann Erklärungen mit Satzverbindern gliedern. Ich kann Fachwörter aus Wissenschaft und Technik erschließen.
- Sprechhandlungen: erklären, Vermutungen formulieren, Ergebnisse beschreiben, nachfragen
- Geschichte: Laylā und Jan bauen für einen Schulwettbewerb ein kleines Solarauto und testen, warum es im Schatten langsamer fährt. Dialog (Lektion): Mutter Hind erklärt Yazan, wie ein Fieberthermometer misst. Ort: Physikraum, Küche.
- Lesen: 1) Eine Versuchsanleitung (Material, Schritte, Beobachtung). 2) Ein kurzer Sachtext über Solarenergie.
- Sprechen: 1) Einen Versuch in Schritten erklären. 2) Beschreiben, wie ein Gerät aus dem Alltag funktioniert.
- Schreiben: Ein Versuchsprotokoll (80–100 Wörter).

**ar.b1.e15 – Die erste Bewerbung**

- Kann: Ich kann einen Lebenslauf und ein kurzes Anschreiben verstehen und verfassen. Ich kann im Vorstellungsgespräch Fragen beantworten und selbst Fragen stellen. Ich kann indirekt nachfragen.
- Sprechhandlungen: sich vorstellen, Stärken nennen, nachfragen, sich bedanken und verabschieden
- Geschichte: Yazan bewirbt sich um einen Ausbildungsplatz als Elektroniker; Mutter Hind liest sein Anschreiben, Opa Nizār gibt am Telefon Tipps für das Gespräch. Dialog (Lektion): Im Vorstellungsgespräch fragt Frau Neumann nach Yazans Stärken und seinem Praktikum. Ort: Wohnzimmer, Firma.
- Lesen: 1) Eine Stellenanzeige für einen Ausbildungsplatz. 2) Ein Muster-Lebenslauf.
- Sprechen: 1) Ein Vorstellungsgespräch üben (Rollenspiel). 2) Die eigenen Stärken mit Beispielen nennen.
- Schreiben: Ein kurzes Anschreiben für eine Ausbildungs- oder Praktikumsstelle (90–110 Wörter).

**ar.b1.e16 – Wir kochen für Gäste**

- Kann: Ich kann ein Rezept verstehen und erklären. Ich kann Gäste höflich bewirten und auf Angebote reagieren. Ich kann ein Essen planen und Aufgaben verteilen.
- Sprechhandlungen: Rezept erklären, anbieten und ablehnen, Gäste empfangen, loben und danken
- Geschichte: Familie al-Ḥaddād lädt Familie Yılmaz und Frau Becker zum Abendessen ein; Laylā und Vater Bāsil kochen Maqlūba mit Hähnchen, Familie Yılmaz bringt Börek mit Spinat mit. Dialog (Lektion): Laylā bietet Frau Becker Tee an; sie lehnt höflich ab und nimmt Wasser. Ort: Wohnung der Familie al-Ḥaddād.
- Lesen: 1) Ein Rezept für Maqlūba mit Hähnchen (Zutaten, Schritte). 2) Eine Einladung per Nachricht mit Antworten.
- Sprechen: 1) Ein eigenes Rezept in Schritten erklären. 2) Gäste empfangen und etwas anbieten (Rollenspiel).
- Schreiben: Ein Rezept für ein Lieblingsgericht (90–110 Wörter).
- Gesperrte Kandidaten: R-09, F-ar-02

#### B2

**ar.b2.e01 – Was in der Zeitung steht**

- Kann: Ich kann Zeitungsmeldungen verstehen und sagen, was geschehen ist, auch wenn nicht genannt wird, wer gehandelt hat. Ich kann Schlagzeilen deuten und Nachrichten zusammenfassen. Ich kann zwischen Nachricht und Meinung unterscheiden.
- Sprechhandlungen: Nachrichten zusammenfassen, Quellen nennen, Meinung und Nachricht trennen
- Geschichte: Laylā (inzwischen 16) macht ein Praktikum in der Lokalredaktion; die Redakteurin Dāliya zeigt ihr, wie eine Meldung über die Eröffnung einer neuen Fußgängerbrücke entsteht. Dialog (Lektion): Laylā und Yazan vergleichen beim Frühstück zwei Meldungen über dasselbe Ereignis. Ort: Redaktion, Küche.
- Lesen: 1) Drei kurze Meldungen der Lokalzeitung (Brücke, Bibliothek, Wetter). 2) Schlagzeilen mit Passivformen. 3) Ein kurzer Kommentar zum Bau der Brücke.
- Sprechen: 1) Eine Nachricht in eigenen Worten zusammenfassen. 2) Nachricht und Kommentar zum selben Thema vergleichen.
- Schreiben: 1) Eine Kurzmeldung über ein Ereignis an der Schule (120–150 Wörter). 2) Eine Zusammenfassung eines Zeitungsartikels (100–120 Wörter).

**ar.b2.e02 – Ausbildung oder Studium?**

- Kann: Ich kann Wege nach der Schule vergleichen und Bedingungen nennen. Ich kann beschreiben, wie sich etwas verändert hat oder noch andauert. Ich kann bei der Berufswahl beraten und meine Ratschläge begründen.
- Sprechhandlungen: vergleichen, Bedingungen nennen, abwägen, beraten
- Geschichte: Cousine Rīm studiert Architektur in Amman, Yazan macht seine Ausbildung zum Elektroniker; im Videogespräch vergleichen sie Alltag, Kosten und Aussichten. Dialog (Lektion): In der Berufsberatung erklärt Herr Schneider Laylā, welche Wege es nach dem Abitur gibt. Ort: Videoanruf, Berufsberatung.
- Lesen: 1) Ein Infotext über die duale Ausbildung in Deutschland. 2) Ein Erfahrungsbericht einer Architekturstudentin. 3) Eine Übersicht über Studiengänge und Zugangsbedingungen.
- Sprechen: 1) Vor- und Nachteile von Ausbildung und Studium abwägen. 2) Eine Person bei der Berufswahl beraten (Rollenspiel).
- Schreiben: 1) Ein Beitrag für ein Schülerforum: Ausbildung oder Studium? (120–150 Wörter) 2) Eine Anfrage an eine Hochschule zu den Zulassungsbedingungen (100–120 Wörter).

**ar.b2.e03 – Die Hausversammlung**

- Kann: Ich kann in einer Versammlung Vorschläge machen, zustimmen und widersprechen. Ich kann Ausnahmen und Einschränkungen genau benennen. Ich kann eine Nebenkostenabrechnung in den Grundzügen verstehen.
- Sprechhandlungen: Vorschlag einbringen, zustimmen und widersprechen, Ausnahmen nennen, Kosten klären
- Geschichte: Die Mieterinnen und Mieter treffen sich: Es geht um höhere Heizkosten, einen gemeinsamen Garten und Ruhezeiten; Vater Bāsil schlägt einen Plan vor, Frau Becker ist teilweise dagegen. Dialog (Lektion): Herr Yılmaz fragt Bāsil nach der Abrechnung. Ort: Gemeinschaftsraum des Hauses.
- Lesen: 1) Eine Einladung zur Hausversammlung mit Tagesordnung. 2) Eine vereinfachte Nebenkostenabrechnung. 3) Ein Protokoll der Versammlung.
- Sprechen: 1) In einer Versammlung einen Vorschlag begründen und auf Einwände reagieren. 2) Eine Abrechnung erklären.
- Schreiben: 1) Ein Protokoll einer Versammlung (120–150 Wörter). 2) Eine Nachfrage zur Nebenkostenabrechnung an die Hausverwaltung (100–120 Wörter).

**ar.b2.e04 – Opa nach der Operation**

- Kann: Ich kann mit Ärztinnen, Pflegekräften und der Versicherung über Behandlung und Pflege sprechen. Ich kann beschreiben, in welchem Zustand jemand ist und was er wieder oder nicht mehr kann. Ich kann die Pflege in der Familie planen.
- Sprechhandlungen: Zustand beschreiben, Behandlung erfragen, Pflege organisieren, Mitgefühl ausdrücken
- Geschichte: Opa Nizār hatte eine Knieoperation in Amman und kommt danach für einige Wochen nach Wetzlar; die Familie organisiert Physiotherapie, einen Rollator und Hilfe im Alltag. Dialog (Lektion): Hind spricht mit dem Physiotherapeuten Florian über Übungen für zu Hause. Ort: Wohnung, Physiotherapiepraxis.
- Lesen: 1) Ein Entlassungsbrief in vereinfachter Form. 2) Ein Merkblatt mit Übungen nach einer Knieoperation. 3) Ein Informationstext über Pflege durch Angehörige.
- Sprechen: 1) Den Zustand einer Person beschreiben und Fragen zur Behandlung stellen. 2) Mit der Familie einen Pflegeplan besprechen.
- Schreiben: 1) Eine Nachricht an die Familie über den Gesundheitszustand (120–150 Wörter). 2) Eine Anfrage an einen Pflegedienst (100–120 Wörter).

**ar.b2.e05 – Im Team**

- Kann: Ich kann im Team Aufgaben besprechen, Verantwortung übernehmen und Ergebnisse berichten. Ich kann Handlungen mit dem passenden Verbalnomen ausdrücken. Ich kann Lob und Kritik sachlich formulieren.
- Sprechhandlungen: Aufgaben verteilen, Ergebnisse berichten, Kritik äußern, danken
- Geschichte: Yazan arbeitet in seinem Ausbildungsbetrieb in einem Team, das eine Solaranlage auf einer Schule baut; die Teamleiterin Frau Koch verteilt Aufgaben und lobt die Zusammenarbeit. Dialog (Lektion): In der Teambesprechung berichtet Yazan, was erledigt ist. Ort: Baustelle, Besprechungsraum.
- Lesen: 1) Eine E-Mail der Teamleitung mit Aufgaben. 2) Ein Wochenbericht des Teams. 3) Ein Artikel über gute Teamarbeit.
- Sprechen: 1) Eine Teambesprechung leiten (Rollenspiel). 2) Sachlich Kritik äußern und auf Kritik reagieren.
- Schreiben: 1) Ein Wochenbericht (120–150 Wörter). 2) Eine Dankes-E-Mail an das Team (100–120 Wörter).

**ar.b2.e06 – Anträge und Fristen**

- Kann: Ich kann Schreiben von Behörden verstehen und Fristen einhalten. Ich kann Anträge knapp mit Verbalnomen formulieren. Ich kann klar sagen, was nicht zutrifft oder was fehlt.
- Sprechhandlungen: Antrag stellen, nachfragen, Missverständnis klären, Unterlagen nachreichen
- Geschichte: Tante Lubnā kommt für ein Architekturprojekt ein Jahr nach Deutschland; Rīm hilft ihr bei Aufenthaltstitel, Anmeldung und Krankenversicherung. Dialog (Lektion): Bei der Behörde fehlt ein Dokument; Lubnā klärt, bis wann sie es nachreichen kann. Ort: Behörde, Café.
- Lesen: 1) Ein Schreiben der Behörde mit Frist. 2) Eine Checkliste für die Anmeldung. 3) Ein vereinfachtes Merkblatt zu Aufenthalt und Arbeit.
- Sprechen: 1) Bei einer Behörde ein Anliegen vortragen und nachfragen. 2) Erklären, welche Unterlagen fehlen und warum.
- Schreiben: 1) Ein förmlicher Antrag auf Fristverlängerung (120–150 Wörter). 2) Eine E-Mail mit nachgereichten Unterlagen (100–120 Wörter).

**ar.b2.e07 – Energie sparen zu Hause**

- Kann: Ich kann Statistiken und Grafiken zum Energieverbrauch beschreiben. Ich kann sagen, was wäre, wenn wir etwas anders machen würden. Ich kann Maßnahmen vorschlagen und ihre Wirkung abschätzen.
- Sprechhandlungen: Grafik beschreiben, Annahmen formulieren, Vorschläge machen, abwägen
- Geschichte: Familie al-Ḥaddād bekommt eine hohe Stromrechnung; Laylā untersucht mit einer Tabelle, welche Geräte am meisten verbrauchen, und die Familie plant Änderungen. Dialog (Lektion): In der Energieberatung der Stadt erfährt Bāsil, wie viel eine bessere Dämmung sparen würde. Ort: Wohnung, Beratungsstelle.
- Lesen: 1) Eine Grafik mit Verbrauchswerten und kurzem Text. 2) Ein Ratgeberartikel mit Spartipps. 3) Ein Bericht über erneuerbare Energie in einer Kleinstadt.
- Sprechen: 1) Eine Grafik beschreiben (Anteile, Anstieg, Rückgang). 2) Erklären, was passieren würde, wenn …
- Schreiben: 1) Eine Beschreibung einer Grafik (120–150 Wörter). 2) Ein Vorschlag an die Schule zum Energiesparen (100–120 Wörter).

**ar.b2.e08 – Das erste eigene Konto**

- Kann: Ich kann Kontomodelle, Gebühren und Bedingungen vergleichen. Ich kann Einwände formulieren: obwohl, trotzdem, selbst wenn. Ich kann eine Reklamation schriftlich vorbringen.
- Sprechhandlungen: vergleichen, sich beraten lassen, reklamieren, abwägen
- Geschichte: Laylā (18) eröffnet ihr erstes Girokonto; mit Vater Bāsil vergleicht sie Gebühren und Karten (keine Figur nutzt Zinsgeschäfte, Leitfaden §2). Dialog (Lektion): Eine Online-Bestellung kommt beschädigt an, Laylā reklamiert beim Kundendienst. Ort: Bank, Telefon.
- Lesen: 1) Ein Vergleich zweier Kontomodelle (Tabelle mit Gebühren). 2) Allgemeine Bedingungen in vereinfachter Form. 3) Ein Ratgebertext über Rechte bei Online-Käufen.
- Sprechen: 1) Sich in der Bank beraten lassen und Bedingungen erfragen. 2) Am Telefon eine Reklamation vorbringen.
- Schreiben: 1) Eine schriftliche Reklamation (120–150 Wörter). 2) Eine begründete Entscheidung für ein Konto (100–120 Wörter).

**ar.b2.e09 – Erfindungen aus vielen Jahrhunderten**

- Kann: Ich kann von Erfindungen und ihrer Bedeutung berichten. Ich kann Gründe und Zwecke knapp und genau ausdrücken. Ich kann einen Sachtext gliedern und verknüpfen.
- Sprechhandlungen: berichten, erklären, bewerten, präsentieren
- Geschichte: Für eine Ausstellung in der Schule stellen Laylā und Jan Erfindungen aus vielen Jahrhunderten vor: Wasseruhr, Brille, Buchdruck, Solarzelle (ohne Namen realer Personen, G-06). Dialog (Lektion): Cousine Rīm erzählt von einem Studienprojekt, bei dem ihr Team einen Wasserfilter entwickelt. Ort: Schule, Videoanruf.
- Lesen: 1) Ein Sachtext über die Geschichte der Uhr. 2) Ein vereinfachter Lexikonartikel über die Solarzelle. 3) Ein Bericht über einen Schülerwettbewerb für Erfindungen.
- Sprechen: 1) Eine Erfindung in zwei Minuten vorstellen. 2) Begründen, welche Erfindung im Alltag am wichtigsten ist.
- Schreiben: 1) Ein Ausstellungstext zu einer Erfindung (120–150 Wörter). 2) Eine Zusammenfassung eines Sachtextes (100–120 Wörter).

**ar.b2.e10 – Bei der Jugendfeuerwehr**

- Kann: Ich kann Aufgaben einer Hilfsorganisation beschreiben und Sicherheitsregeln erklären. Ich kann allgemeine Aussagen über Personen machen (wer …, was …). Ich kann sagen, wozu etwas dient und was es verhindern soll.
- Sprechhandlungen: informieren, warnen, zum Mitmachen einladen, Regeln erklären
- Geschichte: Jan tritt der Jugendfeuerwehr bei; beim Tag der offenen Tür erklärt die Feuerwehrfrau Katharina Rauchmelder, den Notruf 112 und Erste Hilfe, Yazan und Laylā machen bei einem Erste-Hilfe-Kurs mit. Dialog (Lektion): Laylā fragt, wer bei der Feuerwehr mitmachen kann. Ort: Feuerwehrhaus.
- Lesen: 1) Ein Flyer der Jugendfeuerwehr. 2) Sicherheitsregeln für Rauchmelder. 3) Ein Erfahrungsbericht einer Ersthelferin.
- Sprechen: 1) Erklären, was man im Notfall tut (Notruf 112). 2) Ein Ehrenamt vorstellen, ohne Druck auszuüben (wer Lust hat …).
- Schreiben: 1) Ein Informationstext über eine Hilfsorganisation (120–150 Wörter). 2) Eine Anmeldung zu einem Erste-Hilfe-Kurs mit Fragen (100–120 Wörter).

**ar.b2.e11 – Der Mietvertrag**

- Kann: Ich kann einen Mietvertrag in seinen wichtigen Punkten verstehen. Ich kann einen förmlichen Brief richtig aufbauen. Ich kann ausdrücken, was bis zu einem Zeitpunkt erledigt sein wird.
- Sprechhandlungen: Vertrag prüfen, kündigen, Fristen nennen, förmlich schreiben
- Geschichte: Laylā zieht für ihr Studium nach Gießen und unterschreibt ihren ersten Mietvertrag; Yazan hilft ihr, Kaution, Kündigungsfrist und Nebenkosten zu verstehen. Dialog (Lektion): Laylā kündigt ihr Zimmer im Wohnheim und fragt nach der Rückzahlung der Kaution. Ort: Wohnung in Gießen, Telefon.
- Lesen: 1) Auszüge aus einem vereinfachten Mietvertrag. 2) Ein Kündigungsschreiben als Muster. 3) Ein Ratgebertext über Rechte und Pflichten von Mietern.
- Sprechen: 1) Mit dem Vermieter über einen Vertragspunkt sprechen. 2) Einer Freundin die wichtigsten Punkte eines Vertrags erklären.
- Schreiben: 1) Eine Kündigung eines Mietvertrags (120–150 Wörter). 2) Eine förmliche Bitte um Rückzahlung der Kaution (100–120 Wörter).

**ar.b2.e12 – Alte Handwerke**

- Kann: Ich kann über Handwerke, Traditionen und ihre Geschichte sprechen. Ich kann Jahrhunderte und Jahrzehnte nennen. Ich kann vergleichen, wie etwas früher und heute gemacht wird.
- Sprechhandlungen: beschreiben, vergleichen, erzählen, nachfragen
- Geschichte: In den Ferien besucht Laylā mit Opa Nizār in Amman eine Töpferei und eine Weberei; der Töpfer erklärt, wie seine Familie seit drei Generationen arbeitet. Dialog (Lektion): Zurück in Wetzlar vergleicht Laylā mit Frau Becker im Stadtmuseum das alte Handwerk der Glasschleifer mit der Töpferei. Ort: Handwerksviertel in Amman, Stadtmuseum Wetzlar.
- Lesen: 1) Ein Museumstext über Keramik. 2) Ein Porträt einer Weberin (erfunden). 3) Ein Sachtext über Glas und Linsen in der Geschichte.
- Sprechen: 1) Ein Handwerk und seine Geschichte vorstellen. 2) Früher und heute vergleichen (kamā, miṯlamā).
- Schreiben: 1) Ein Museumstext zu einem Gegenstand (120–150 Wörter). 2) Ein Bericht über einen Werkstattbesuch (100–120 Wörter).
- Gesperrte Kandidaten: R-01, R-02

**ar.b2.e13 – Mehrsprachig aufwachsen**

- Kann: Ich kann über Mehrsprachigkeit, Herkunft und Identität sachlich sprechen. Ich kann die Hamza und andere schwierige Schreibungen richtig setzen. Ich kann verschiedene Sichtweisen wiedergeben.
- Sprechhandlungen: eigene Erfahrung schildern, Sichtweisen vergleichen, nachfragen, zusammenfassen
- Geschichte: Für ein Seminar befragt Laylā Menschen in Wetzlar zu ihren Sprachen: Elif spricht Türkisch und Deutsch, Frau Becker hat Französisch gelernt, Opa Nizār schreibt Arabisch, spricht aber wenig Deutsch. Dialog (Lektion): Laylā und Yazan diskutieren freundlich, ob man zu Hause nur Arabisch sprechen soll. Ort: Café, Wohnzimmer.
- Lesen: 1) Ein Interview mit einer mehrsprachigen Familie. 2) Ein Sachtext über Mehrsprachigkeit bei Kindern. 3) Ein Blogeintrag einer Studentin über ihre Sprachen.
- Sprechen: 1) Die eigene Sprachbiografie erzählen. 2) Zwei Sichtweisen auf Mehrsprachigkeit gegenüberstellen.
- Schreiben: 1) Eine Sprachbiografie (120–150 Wörter). 2) Eine Zusammenfassung eines Interviews (100–120 Wörter).

**ar.b2.e14 – Wie die Stadt entscheidet**

- Kann: Ich kann sachlich erklären, wie eine Gemeinde Entscheidungen trifft. Ich kann allgemeine Aussagen ohne Person formulieren (man muss, es ist möglich). Ich kann einen Vorschlag an die Stadt richten.
- Sprechhandlungen: Verfahren erklären, Vorschlag einreichen, Argumente sammeln
- Geschichte: Der Jugendbeirat der Stadt sammelt Vorschläge für einen neuen Bolzplatz; Yazan und Emre reichen einen Antrag ein und besuchen eine öffentliche Sitzung (ohne Parteien und Personen der Politik, G-05). Dialog (Lektion): Laylā fragt eine Mitarbeiterin der Stadt, wie ein Bürgerantrag bearbeitet wird. Ort: Rathaus.
- Lesen: 1) Ein Infotext: So arbeitet die Stadtverwaltung. 2) Eine Bekanntmachung über eine öffentliche Sitzung. 3) Ein Zeitungsbericht über einen Bürgerantrag.
- Sprechen: 1) Einen Vorschlag vor einem Gremium vorstellen. 2) Erklären, wie ein Antrag bearbeitet wird.
- Schreiben: 1) Ein Bürgerantrag an die Stadt (120–150 Wörter). 2) Ein Bericht über eine öffentliche Sitzung (100–120 Wörter).

**ar.b2.e15 – Eine Reportage**

- Kann: Ich kann eine Reportage planen, Interviews führen und Aussagen korrekt wiedergeben. Ich kann Zitat und Redewiedergabe unterscheiden. Ich kann einen Beitrag für ein Medium gliedern.
- Sprechhandlungen: interviewen, wiedergeben, gliedern, Quellen angeben
- Geschichte: Laylā schreibt für die Lokalzeitung eine Reportage über den Wochenmarkt: Sie interviewt den Händler Ġassān, eine Kundin und die Marktaufsicht. Dialog (Lektion): Die Redakteurin Dāliya prüft mit Laylā, ob die Aussagen richtig wiedergegeben sind. Ort: Wochenmarkt, Redaktion.
- Lesen: 1) Eine Reportage über einen Wochenmarkt. 2) Ein Interview in Frage-Antwort-Form. 3) Ein Leitfaden für journalistisches Arbeiten.
- Sprechen: 1) Ein Interview führen (Rollenspiel). 2) Aussagen aus einem Interview in Redewiedergabe zusammenfassen.
- Schreiben: 1) Eine kurze Reportage (150–180 Wörter). 2) Ein Interview in Redewiedergabe umschreiben (100–120 Wörter).

**ar.b2.e16 – Die Abschlusspräsentation**

- Kann: Ich kann ein Projekt vor Publikum präsentieren und Fragen beantworten. Ich kann Eigenschaften knapp mit Adjektiv-Verbindungen ausdrücken. Ich kann meine Arbeit bewerten und Verbesserungen vorschlagen.
- Sprechhandlungen: präsentieren, Fragen beantworten, bewerten, danken
- Geschichte: Yazan stellt zum Ende seiner Ausbildung das Solarprojekt seines Teams vor dem Prüfungsausschuss vor; Laylā hilft ihm vorher, die Folien zu verbessern. Dialog (Lektion): Nach der Präsentation stellt die Prüferin Frau Koch Fragen zu Qualität und Kosten. Ort: Ausbildungsbetrieb.
- Lesen: 1) Ein Leitfaden für gute Präsentationen. 2) Ein Bewertungsbogen. 3) Ein Bericht über ein Ausbildungsprojekt.
- Sprechen: 1) Ein Projekt in drei Minuten präsentieren. 2) Auf kritische Fragen sachlich antworten.
- Schreiben: 1) Eine Projektbeschreibung (150–180 Wörter). 2) Eine Selbsteinschätzung mit Verbesserungsvorschlägen (100–120 Wörter).

#### C1

**ar.c1.e01 – Eine Präsentation im Betrieb**

- Kann: Ich kann komplexe Arbeitsabläufe im Nominalstil der Schriftsprache darstellen und mündlich verständlich machen. Ich kann vor Fachleuten präsentieren und auf Einwände eingehen. Ich kann zwischen schriftlichem und mündlichem Ausdruck wechseln.
- Sprechhandlungen: präsentieren, Einwände aufgreifen, Ergebnisse bewerten, verdichten und erläutern
- Geschichte: Yazan, inzwischen Techniker, stellt der Geschäftsleitung ein Konzept für die Wartung von Solaranlagen vor; die Abteilungsleiterin Frau Hartmann fragt nach Kosten und Zeitplan. Dialog (Lektion): Yazan erklärt einem Kunden aus Amman in einer Videokonferenz die wichtigsten Punkte auf Arabisch. Ort: Firma, Videokonferenz.
- Lesen: 1) Ein Konzeptpapier im Nominalstil. 2) Ein Fachartikel über Wartung und Sicherheit. 3) Ein Protokoll einer Besprechung. 4) Eine Kundenanfrage aus Amman.
- Sprechen: 1) Ein Konzept vor Fachleuten präsentieren und Einwände beantworten. 2) Einen Fachtext mündlich in einfacheren Worten erklären.
- Schreiben: 1) Ein Konzeptpapier (200–250 Wörter). 2) Eine Antwort auf eine Kundenanfrage (150–200 Wörter).

**ar.c1.e02 – Der Bescheid**

- Kann: Ich kann Bescheide und Verwaltungsschreiben genau verstehen. Ich kann feste Wendungen der Amts- und Vertragssprache sicher verwenden. Ich kann begründet Widerspruch einlegen.
- Sprechhandlungen: Bescheid prüfen, Widerspruch begründen, Fristen wahren, beraten
- Geschichte: Laylās Antrag auf ein Studienstipendium wird teilweise abgelehnt; mit einer Beraterin der Hochschule prüft sie den Bescheid und schreibt einen Widerspruch. Dialog (Lektion): Opa Nizār bittet Laylā per Video, ihm ein Schreiben einer Behörde in Amman zu erklären. Ort: Beratungsstelle, Videoanruf.
- Lesen: 1) Ein vereinfachter Bescheid mit Begründung und Hinweis auf den Widerspruch. 2) Ein Merkblatt zu Widerspruch und Fristen. 3) Ein amtliches Schreiben aus Amman. 4) Ein Ratgeberartikel über Amtssprache.
- Sprechen: 1) Einen Bescheid in einfachen Worten erklären. 2) In einer Beratung die eigene Lage darlegen und Fragen stellen.
- Schreiben: 1) Ein Widerspruch mit Begründung (200–250 Wörter). 2) Eine Erläuterung eines Amtsschreibens für Angehörige (150–200 Wörter).

**ar.c1.e03 – Nachricht und Kommentar**

- Kann: Ich kann Nachrichtentexte und Kommentare kritisch lesen und ihre Quellen einschätzen. Ich kann Aussagen anderer im Berichtsstil wiedergeben. Ich kann einen eigenen Kommentar verfassen.
- Sprechhandlungen: Quellen prüfen, berichten, kommentieren, gewichten
- Geschichte: In ihrem Praktikum bei der arabischen Redaktion eines Radiosenders vergleicht Laylā drei Berichte über eine Hitzewelle und schreibt einen Kommentar. Dialog (Lektion): Die Redakteurin Dāliya diskutiert mit Laylā, welche Quelle verlässlich ist. Ort: Redaktion.
- Lesen: 1) Drei Berichte über dasselbe Ereignis. 2) Ein Kommentar. 3) Ein Leitfaden zum Prüfen von Quellen. 4) Eine Pressemitteilung.
- Sprechen: 1) Einen Nachrichtenbeitrag sprechen. 2) Über die Glaubwürdigkeit von Quellen diskutieren.
- Schreiben: 1) Ein Kommentar (200–250 Wörter). 2) Eine Nachricht im Berichtsstil (150–200 Wörter).

**ar.c1.e04 – Generationen im Gespräch**

- Kann: Ich kann über den Wandel von Werten, Gewohnheiten und Familienformen differenziert sprechen. Ich kann vorsichtig formulieren und Vermutungen kennzeichnen. Ich kann ein Gespräch moderieren.
- Sprechhandlungen: moderieren, vermuten, relativieren, Sichtweisen zusammenführen
- Geschichte: Laylā moderiert im Erzählcafé ein Gespräch zwischen Opa Nizār, Frau Becker und Jugendlichen über Arbeit, Freizeit und Familie damals und heute. Dialog (Lektion): Yazan und Opa Nizār diskutieren, ob man heute weniger liest. Ort: Erzählcafé der Stadtbibliothek.
- Lesen: 1) Ein Essay über Generationen. 2) Ergebnisse einer Umfrage zur Freizeit. 3) Ein Interview mit einer Seniorin. 4) Ein Kommentar zur Frage „War früher alles besser?“
- Sprechen: 1) Ein Gespräch zwischen Generationen moderieren. 2) Eine Vermutung begründen und abschwächen.
- Schreiben: 1) Ein Essay mit vorsichtig formulierten Thesen (200–250 Wörter). 2) Ein Bericht über eine Diskussion (150–200 Wörter).

**ar.c1.e05 – Die Reise des Papiers**

- Kann: Ich kann Sachtexte zur Kultur- und Technikgeschichte genau verstehen. Ich kann lange Genitivverbindungen bilden und auflösen. Ich kann historische Entwicklungen zusammenhängend darstellen.
- Sprechhandlungen: darstellen, verknüpfen, erläutern, vergleichen
- Geschichte: Für eine Ausstellung zeichnen Laylā und Jan den Weg des Papiers nach: von China über Samarkand nach Bagdad, Damaskus und Kairo, weiter nach Spanien und Italien bis zu den Papiermühlen in Deutschland (religiöse Handschriften sind kein Thema). Dialog (Lektion): Eine Kalligrafin zeigt, wie man mit Rohrfeder und Tinte schreibt, und übt mit Laylā weltliche Wörter. Ort: Museum, Kalligrafiewerkstatt.
- Lesen: 1) Ein Museumstext über Papiermühlen. 2) Ein Sachtext über Handelswege. 3) Ein Text über Tinte und Schreibgeräte. 4) Ein Auszug aus einem erfundenen Reisebericht.
- Sprechen: 1) Eine historische Entwicklung in Etappen vorstellen. 2) Eine Ausstellung führen (Rollenspiel).
- Schreiben: 1) Ein Ausstellungstext (200–250 Wörter). 2) Eine Zusammenfassung eines Sachtextes (150–200 Wörter).

**ar.c1.e06 – Wasser ist knapp**

- Kann: Ich kann zu Umweltfragen Stellung nehmen und Argumente abwägen. Ich kann einen Argumentationstext logisch aufbauen. Ich kann Daten in einer Diskussion sachlich verwenden.
- Sprechhandlungen: argumentieren, widerlegen, Daten anführen, Kompromiss vorschlagen
- Geschichte: Cousine Rīm arbeitet als Architektin an einem Projekt zum Wassersparen in Amman; Laylā vergleicht für ein Seminar die Wassernutzung in Jordanien und Deutschland. Dialog (Lektion): In einer Seminardiskussion argumentieren Laylā und ein Kommilitone für und gegen Meerwasserentsalzung. Ort: Hochschule, Baustelle in Amman.
- Lesen: 1) Ein Fachartikel über Wasserknappheit. 2) Eine Statistik mit Kommentar. 3) Ein Positionspapier eines Umweltverbands. 4) Ein Leserbrief mit Gegenargumenten.
- Sprechen: 1) In einer Diskussion eine Position vertreten und auf Gegenargumente eingehen. 2) Einen Kompromiss vorschlagen.
- Schreiben: 1) Eine Erörterung (220–260 Wörter). 2) Ein Leserbrief (150–200 Wörter).

**ar.c1.e07 – Maschinen, die lernen**

- Kann: Ich kann Fachtexte über Technik verstehen und neue Begriffe erschließen. Ich kann erklären, wie im Arabischen neue Wörter gebildet werden. Ich kann Chancen und Risiken neuer Technik darstellen.
- Sprechhandlungen: erklären, definieren, Chancen und Risiken abwägen, nachfragen
- Geschichte: Jan studiert Informatik und erklärt Laylā, wie ein Programm Bilder erkennt; Laylā sammelt arabische Fachwörter für ein Glossar. Dialog (Lektion): Auf einer Fachtagung fragt Laylā eine Forscherin, wie man auf Arabisch über künstliche Intelligenz spricht. Ort: Hochschule, Tagung.
- Lesen: 1) Ein populärwissenschaftlicher Artikel über maschinelles Lernen. 2) Ein Glossar mit Fachwörtern und ihrer Bildung. 3) Ein Interview mit einer Forscherin (erfunden). 4) Ein Kommentar über Chancen und Risiken.
- Sprechen: 1) Einen Fachbegriff erklären und seine Bildung zeigen. 2) Chancen und Risiken einer Technik diskutieren.
- Schreiben: 1) Ein Glossar mit Erklärungen (200–250 Wörter). 2) Eine Stellungnahme zu einer neuen Technik (150–200 Wörter).

**ar.c1.e08 – Rechte als Verbraucher**

- Kann: Ich kann Vertragsbedingungen und Verbraucherrechte genau verstehen. Ich kann Wichtiges durch die Satzstellung hervorheben und Forderungen klar zurückweisen. Ich kann eine rechtlich saubere Beschwerde schreiben.
- Sprechhandlungen: Ansprüche geltend machen, zurückweisen, hervorheben, verhandeln
- Geschichte: Yazan hat online einen Laptop gekauft, der nicht funktioniert; der Händler will ihn nicht zurücknehmen. Yazan informiert sich bei der Verbraucherberatung und setzt seine Rechte durch. Dialog (Lektion): Am Telefon verhandelt Yazan mit dem Kundendienst über Reparatur oder Erstattung. Ort: Verbraucherberatung, Telefon.
- Lesen: 1) Vereinfachte Allgemeine Geschäftsbedingungen (Auszug). 2) Ein Merkblatt zu Gewährleistung und Widerruf. 3) Ein Beschwerdebrief als Muster. 4) Ein Zeitungsartikel über Abo-Fallen.
- Sprechen: 1) Am Telefon einen Anspruch durchsetzen. 2) Eine Vertragsklausel erklären und bewerten.
- Schreiben: 1) Eine förmliche Beschwerde mit Fristsetzung (200–250 Wörter). 2) Eine Antwort auf eine Ablehnung (150–200 Wörter).

**ar.c1.e09 – Ein Verein entsteht**

- Kann: Ich kann eine Vereinsgründung planen und eine Satzung in Grundzügen verstehen. Ich kann Personen und Funktionen genau benennen und Aussagen bekräftigen. Ich kann eine Versammlung leiten.
- Sprechhandlungen: Versammlung leiten, abstimmen lassen, Aufgaben übertragen, protokollieren
- Geschichte: Laylā, Elif und Jan gründen in Wetzlar einen Verein für Sprachpatenschaften; bei der Gründungsversammlung werden Vorstand, Kassenführung und Ziele festgelegt. Dialog (Lektion): Elif erklärt neuen Mitgliedern, wer welche Aufgabe hat. Ort: Stadtteilzentrum.
- Lesen: 1) Eine Mustersatzung (Auszug). 2) Eine Einladung zur Gründungsversammlung. 3) Ein Protokoll. 4) Ein Zeitungsbericht über Sprachpatenschaften.
- Sprechen: 1) Eine Versammlung eröffnen und leiten. 2) Die Ziele eines Vereins vorstellen.
- Schreiben: 1) Ein Protokoll der Gründungsversammlung (200–250 Wörter). 2) Eine Vereinsbeschreibung für das Stadtmagazin (150–200 Wörter).

**ar.c1.e10 – Sprichwörter und ihre Geschichten**

- Kann: Ich kann weltliche Sprichwörter und Redewendungen verstehen und passend einsetzen. Ich kann Bilder und Vergleiche in Texten deuten. Ich kann deutsche, türkische und arabische Redewendungen vergleichen.
- Sprechhandlungen: deuten, vergleichen, erzählen, Beispiele geben
- Geschichte: Oma Samīra, Elifs Großmutter und Frau Becker tauschen im Erzählcafé Sprichwörter aus und erzählen, wann man sie benutzt (nur weltliche Wendungen aus der geprüften Liste, OF-ar-12). Dialog (Lektion): Laylā erklärt Jan ein Sprichwort, das er nicht versteht. Ort: Erzählcafé, Videoanruf.
- Lesen: 1) Zehn weltliche Sprichwörter mit Erklärung. 2) Eine erfundene Erzählung, in der ein Sprichwort entsteht. 3) Ein Sachtext über Bildsprache im Alltag. 4) Eine Glosse aus einer Zeitung.
- Sprechen: 1) Ein Sprichwort erklären und eine passende Situation erzählen. 2) Redewendungen aus drei Sprachen vergleichen.
- Schreiben: 1) Eine Geschichte zu einem Sprichwort (200–250 Wörter). 2) Ein Vergleich von Redewendungen (150–200 Wörter).

**ar.c1.e11 – Grundrechte und Gerichte**

- Kann: Ich kann sachliche Texte über Grundrechte, Gerichte und Verfahren verstehen. Ich kann komplizierte Aussagen mit eigenen Worten wiedergeben. Ich kann den Ablauf eines Verfahrens erklären.
- Sprechhandlungen: erklären, umformulieren, zusammenfassen, nachfragen
- Geschichte: Laylā besucht mit ihrem Seminar eine öffentliche Verhandlung am Amtsgericht über einen Mietstreit und fasst danach zusammen, wer was vorgetragen hat (sachlich, ohne Parteien und Personen der Politik). Dialog (Lektion): Opa Nizār fragt, wie Gerichte in Deutschland arbeiten; Laylā erklärt es in einfachen Worten. Ort: Amtsgericht, Videoanruf.
- Lesen: 1) Ein vereinfachter Infotext über Grundrechte. 2) Eine Übersicht über Gerichtsarten. 3) Ein Gerichtsbericht über einen Mietstreit. 4) Ein Glossar der Rechtssprache.
- Sprechen: 1) Einen Verfahrensablauf erklären. 2) Einen Fachtext in einfachen Worten wiedergeben.
- Schreiben: 1) Eine Zusammenfassung eines Gerichtsberichts (200–250 Wörter). 2) Eine Erklärung eines Grundrechts in einfacher Sprache (150–200 Wörter).

**ar.c1.e12 – Eine Rede halten**

- Kann: Ich kann eine Rede vorbereiten und wirkungsvoll halten. Ich kann rhetorische Mittel erkennen und gezielt einsetzen. Ich kann in einer Debatte spontan reagieren.
- Sprechhandlungen: reden, debattieren, überzeugen, auf Zwischenfragen reagieren
- Geschichte: Laylā hält beim Jugendforum der Stadt eine Rede über Mehrsprachigkeit in der Schule; vorher übt sie mit Yazan, der kritische Zwischenfragen stellt. Dialog (Lektion): In der anschließenden Debatte antwortet Laylā auf Einwände. Ort: Stadthalle.
- Lesen: 1) Eine Beispielrede. 2) Ein Ratgeber für Reden. 3) Ein Debattenprotokoll. 4) Eine Analyse rhetorischer Mittel.
- Sprechen: 1) Eine Rede von drei Minuten halten. 2) In einer Debatte auf Einwände reagieren.
- Schreiben: 1) Ein Redemanuskript (220–260 Wörter). 2) Eine Analyse einer Rede (150–200 Wörter).

**ar.c1.e13 – Fuṣḥā und Umgangssprachen**

- Kann: Ich kann Register des Arabischen unterscheiden und Texte passend einordnen. Ich kann regionale Umgangssprachen an typischen Merkmalen erkennen, ohne sie selbst zu verwenden. Ich kann über Sprache und Identität differenziert schreiben.
- Sprechhandlungen: einordnen, vergleichen, erläutern, Stellung nehmen
- Geschichte: Laylā schreibt ihre Seminararbeit über Hocharabisch und Umgangssprachen; sie vergleicht eine Nachrichtensendung, einen Brief von Oma Samīra und Sprachnachrichten aus Amman und Tunis. Dialog (Lektion): Cousin Fāris erklärt Laylā lachend, wie man in Amman im Alltag spricht, und sie antwortet in Fuṣḥā. Ort: Bibliothek, Videoanruf.
- Lesen: 1) Ein Fachtext über das Nebeneinander von Hoch- und Umgangssprache. 2) Ein Brief in gehobener Sprache. 3) Eine Nachrichtenmeldung. 4) Ein Blogtext über Sprachen in der Familie.
- Sprechen: 1) Denselben Inhalt in zwei Registern vortragen (Nachricht und Gespräch). 2) Erklären, woran man eine Umgangssprache erkennt.
- Schreiben: 1) Ein Essay über Sprache und Identität (220–260 Wörter). 2) Ein förmlicher und ein persönlicher Brief zum selben Anlass (je 80–100 Wörter).

**ar.c1.e14 – Rückblick und Ausblick**

- Kann: Ich kann meine Lern- und Berufswege reflektieren und Ziele begründet darstellen. Ich kann alle Mittel der Stufe sicher und passend einsetzen. Ich kann ein längeres Gespräch über Zukunftspläne führen.
- Sprechhandlungen: reflektieren, Ziele begründen, bewerten, danken und verabschieden
- Geschichte: Laylā schließt ihr Studium ab und bewirbt sich als Übersetzerin, Yazan übernimmt eine Projektleitung; beim Familienessen blicken alle mit Oma Samīra und Opa Nizār auf die Jahre zurück. Dialog (Lektion): Im Bewerbungsgespräch stellt Laylā ihren Werdegang auf Arabisch vor. Ort: Wohnung der Familie, Übersetzungsbüro.
- Lesen: 1) Ein Porträt einer Übersetzerin (erfunden). 2) Eine Stellenanzeige für Übersetzerinnen und Übersetzer. 3) Ein Erfahrungsbericht über mehrsprachige Berufe. 4) Ein Essay über Lebenswege.
- Sprechen: 1) Den eigenen Werdegang präsentieren und Fragen beantworten. 2) Ein Gespräch über Zukunftspläne führen.
- Schreiben: 1) Ein Bewerbungsschreiben (220–260 Wörter). 2) Ein Rückblick auf den eigenen Lernweg (150–200 Wörter).

## 7 Wortschatz und Abdeckung

### 7.1 Verteilung der Lemma-Budgets

A1 beginnt mit kleinen Budgets, weil die Lernenden in den ersten Einheiten noch die Schrift festigen. Danach steigen die Budgets innerhalb jeder Stufe leicht an. Die letzte Einheit von A1 wiederholt die ganze Stufe und hat deshalb ein kleineres Budget; auf den übrigen Stufen hat die letzte Einheit das höchste, weil bekannte Strukturen auf neue Themen treffen.

| Stufe | Budgets je Einheit | Summe |
|---|---|---|
| A1 | 36 · 42 · 46 · 50 · 52 · 52 · 54 · 54 · 56 · 56 · 56 · 46 | 600 |
| A2 | 58 · 60 · 62 · 62 · 64 · 64 · 64 · 64 · 66 · 66 · 66 · 66 · 68 · 70 | 900 |
| B1 | 74 · 76 · 78 · 78 · 80 · 80 · 82 · 82 · 82 · 82 · 82 · 84 · 84 · 84 · 86 · 86 | 1.300 |
| B2 | 98 · 100 · 102 · 104 · 104 · 106 · 106 · 106 · 108 · 108 · 108 · 108 · 110 · 110 · 110 · 112 | 1.700 |
| C1 | 134 · 136 · 138 · 140 · 140 · 142 · 142 · 144 · 144 · 144 · 146 · 148 · 150 · 152 | 2.000 |

### 7.2 Messung (Machbarkeit)

- **Daten:** wordfreq 3.1.1 `large_ar` (Top 50.000) und CAMeL MSA v1.0 (Top 50.000), Rangmittel nach S7-E6; lemmatisiert über den kaikki-Auszug en-ara (Formen und Formeinträge) mit Abtrennung der Klitika (wa-, fa-, bi-, li-, ka-, al-, Pronomenendungen); geprüft gegen den kaikki-Kernauszug ar (top-20000, 15.630 Einträge) und den Tatoeba-Satzauszug ara (Beleg S7 §3.7). Aus den Daten wurden nur Zahlen und Umschriften übernommen.
- **Verfahren:** Häufigkeit unvokalisierter Wortformen wird auf Lemmata verteilt. Ausgenommen sind Treffer im Tabu-Lexikon, Begriffe mit Religionsbezug (Themenmarke und Religionswortliste), anstößiges Register, Eigennamen und Zeichen sowie Scheinlemmata, die ihren Rang nur durch Gleichschreibung ohne Vokalzeichen erhalten (gesichtet für die ersten ≈ 1.100 Plätze). Unter den ersten 1.000 Plätzen der Rohliste: 163 Scheinlemmata, 28 Religionsbegriffe, 5 Tabu-Treffer, 6 mit anstößigem Register, 24 Namen und Zeichen, 3 ohne Umschrift.
- **Alltagsliste:** Die bereinigte Liste (13.412 Lemmata) enthält viel Nachrichten-, Politik- und Verwaltungswortschatz, weil beide Korpora pressenah sind. Für A1/A2 zählt die Alltagsliste ohne diese Wörter (367 der Top-1.000); sie bleiben ab B1 in der Rangliste.
- **Gebundene Funktionswörter:** 23 der Alltag-Top-500 gehören zu Grammatik späterer Stufen (allaḏī, am, anna, bal, baynamā, dūna, illā, in, inna, iḏā, kaʾanna, kāna, lam, lan, laqad, lākinna, munḏu, qad, ʿindamā, ḍidda, ḥattā, ḥawla, ḥayṯu). Die Simulation führt sie erst mit dieser Grammatik ein; deshalb erreicht A1 höchstens 95,4 %.
- **Grenzen:** Ohne Vokalzeichen sind viele Formen mehrdeutig; die Rangliste ist eine Näherung auf wenige Prozentpunkte. In L3 misst das Werkzeug die tatsächlichen Lemmalisten genauer, lokal mit CAMeL Tools (`morphology-db-msa-r13`, PLAN §6.4, OF-ar-19). Das Messskript und die Rangliste sind reproduzierbar (zweiter Lauf byte-gleich).

**Simulation:** Je Stufe wird ein Anteil des Budgets strikt nach Häufigkeit gefüllt (A1/A2 aus der Alltagsliste, ab B1 aus der bereinigten Liste), der Rest mit Themenwörtern, die nicht mitgezählt werden. Im Modell besteht A1 aus den Wortfeld-Beispielen der A1-Einheiten und den häufigsten Alltagswörtern bis 600; ab A2 gilt 70 %. Werte kumuliert.

| Rechnung | Stufe | Alltag-Top-500 | Top-1.000 | Top-2.000 | Top-5.000 | Top-10.000 |
|---|---|---|---|---|---|---|
| 70 % nach Häufigkeit | A1 | 84,0 % | 42,0 % | 21,0 % | 8,4 % | 4,2 % |
| 70 % nach Häufigkeit | A2 | 97,0 % | 61,7 % | 52,5 % | 21,0 % | 10,5 % |
| 70 % nach Häufigkeit | B1 | 99,2 % | 99,1 % | 98,0 % | 39,2 % | 19,6 % |
| 70 % nach Häufigkeit | B2 | 100,0 % | 99,9 % | 100,0 % | 63,0 % | 31,5 % |
| 70 % nach Häufigkeit | C1 | 100,0 % | 100,0 % | 100,0 % | 91,0 % | 45,5 % |
| 80 % nach Häufigkeit | A1 | 95,4 % | 48,0 % | 24,0 % | 9,6 % | 4,8 % |
| 80 % nach Häufigkeit | A2 | 97,0 % | 61,7 % | 60,0 % | 24,0 % | 12,0 % |
| 80 % nach Häufigkeit | B1 | 99,2 % | 99,1 % | 99,5 % | 44,8 % | 22,4 % |
| 80 % nach Häufigkeit | B2 | 100,0 % | 99,9 % | 100,0 % | 72,0 % | 36,0 % |
| 80 % nach Häufigkeit | C1 | 100,0 % | 100,0 % | 100,0 % | 100,0 % | 52,0 % |
| Modell (A1 mit Wortfeldern) | A1 | 90,6 % | 46,3 % | 25,1 % | 11,3 % | 6,0 % |
| Modell (A1 mit Wortfeldern) | A2 | 97,2 % | 62,0 % | 56,6 % | 23,9 % | 12,3 % |
| Modell (A1 mit Wortfeldern) | B1 | 99,2 % | 99,1 % | 99,5 % | 42,1 % | 21,4 % |
| Modell (A1 mit Wortfeldern) | B2 | 100,0 % | 99,9 % | 100,0 % | 65,9 % | 33,3 % |
| Modell (A1 mit Wortfeldern) | C1 | 100,0 % | 100,0 % | 100,0 % | 93,9 % | 47,3 % |

### 7.3 Zielwerte je Stufe

Gezählt wird kumuliert: Anteil der Lemmata einer Liste, die bis zum Ende der Stufe eingeführt sind. Die Zielwerte liegen unter dem Modell, damit Raum für Themenwörter bleibt. Damit ist das Ziel „A1 deckt die häufigsten alltagstauglichen ≈ 500 Wörter weitgehend ab“ messbar: ≥ 85 % der Alltag-Top-500, angestrebt 90 %.

| Stufe (Σ Lemmata) | Alltag-Top-500 | Top-1.000 | Top-2.000 | Top-5.000 | Top-10.000 | Textabdeckung (Hinweis) |
|---|---|---|---|---|---|---|
| A1 (600) | ≥ 85 % | ≥ 42 % | ≥ 22 % | ≥ 9 % | – | ≈ 38,1 % |
| A2 (1.500) | ≥ 95 % | ≥ 58 % | ≥ 50 % | ≥ 20 % | – | ≈ 48,2 % |
| B1 (2.800) | – | ≥ 95 % | ≥ 92 % | ≥ 38 % | – | ≈ 68,3 % |
| B2 (4.500) | – | – | ≥ 97 % | ≥ 60 % | ≥ 30 % | ≈ 75,6 % |
| C1 (6.500) | – | – | – | ≥ 88 % | ≥ 42 % | ≈ 79,8 % |

Textabdeckung: Anteil laufender Wörter (wordfreq), deren Lemma im Modell bekannt ist; nur zur Orientierung, kein Prüfwert. Sie liegt niedriger als im Deutschen und Türkischen, weil unvokalisierte Formen mit Klitika auf mehrere Lemmata verteilt werden.

### 7.4 kaikki-Kernauszug

| Liste | im Kernauszug | mit vokalisierter Grundform | mit Glosse | aus der de- oder tr-Ausgabe |
|---|---|---|---|---|
| Alltag-Top-500 | 100,0 % | 99,8 % | 100,0 % | 12,0 % |
| Top-1.000 | 100,0 % | 99,9 % | 100,0 % | 8,7 % |
| Top-2.000 | 100,0 % | 99,8 % | 100,0 % | 6,6 % |
| Top-5.000 | 99,8 % | 99,7 % | 99,8 % | 4,3 % |

Fast jedes häufige Lemma hat eine vokalisierte Grundform und eine englische Hilfsglosse. Deutsche und türkische Glossen kommen dagegen überwiegend aus Übersetzungstabellen (S7 §3.6: `ar-aus-de` 61 % der Top-1.000 und 51 % der Top-5.000, `ar-aus-tr` 81 % und 66 %). Lücken schließt der KI-Entwurf mit Gegenprüfung (S7-E4).

### 7.5 Satzvorrat und Wortfelder

- **Tatoeba (ara):** 4.390 Sätze mit höchstens acht Wörtern ohne negative Bewertung. Nur Wörter aus dem simulierten Wortschatz (80 % nach Häufigkeit) enthalten bis A1 höchstens 399, bis A2 901 und bis B1 1.583 Sätze (Obergrenze vor Qualitäts-, Leitfaden- und Wächterfilter). 80,8 % der arabischen Tatoeba-Sätze haben keine Harakat (S7 §3.3); übernommene Sätze werden vokalisiert und als „bearbeitet (vokalisiert)“ gekennzeichnet (S7-E3). Die 2.400 A1-Sätze entstehen deshalb überwiegend als KI-Sätze (PLAN §6.3, ADR 0045 Nr. 4). Direkte Paare: de–ar 2.759, tr–ar 2.210 nach Standardfilter.
- **Wortfelder:** 150 Wortfelder mit je vier bis elf Beispielen. Die Beispiele sind Richtungsangaben für den Entwurf, keine Lemmaliste. Rang der Beispiele in der bereinigten Liste (Stufe der ersten Nutzung; Mehrwortausdrücke zählen mit dem seltensten Wort):

| Stufe | Beispiele | in Top-1.000 | in Top-2.000 | in Top-5.000 | in der Rangliste | nicht gefunden |
|---|---|---|---|---|---|---|
| A1 | 249 | 88 | 129 | 195 | 233 | 16 |
| A2 | 200 | 62 | 97 | 143 | 173 | 27 |
| B1 | 178 | 60 | 98 | 132 | 154 | 24 |
| B2 | 164 | 62 | 92 | 125 | 138 | 26 |
| C1 | 97 | 44 | 55 | 78 | 88 | 9 |

Nicht gefunden sind vor allem Ländernamen (als Eigennamen ausgeschlossen), Lehnwörter (kīlū, yūrū, intarnit), Mehrwortausdrücke und Fachwörter (z. B. muddat al-inḏār, taḥliyat al-miyāh). Erwartungsgemäß nimmt der Anteil sehr häufiger Wörter mit der Stufe ab.

- **Prüfung der Beispiele:** 0 Treffer im Tabu-Lexikon (ar) und 0 Begriffe mit Religionsbezug in allen Umschrift-Beispielen (Grammatik, Wortfelder). Hinweise auf mehrdeutige Wörter des Leitfadens: 0.

## 8 Kandidaten mit Religionsbezug (gesperrt)

Nur IDs aus dem Leitfaden (§4.1, §4.2), hier mit Art und Anlass, ohne Wortlaut der Formeln. Sie zeigen, wo ein Eintrag nach zwei religiösen Freigaben natürlich vorkommen könnte. Bis dahin entsteht kein sichtbarer Eintrag damit. Orte und Ereignisse erst ab ihrer Mindeststufe (meist A2); Formeln mit dem Vorschlag „nicht aufnehmen“ (F-ar-15 bis F-ar-17) und „eher nicht“ (F-ar-08, F-ar-09, F-ar-14) sind nicht verwendet.

| Einheit | Kandidaten (Leitfaden) |
|---|---|
| ar.a1.e01 Ahlan! Ich bin Laylā | F-ar-01 (Gruß, Anlass: Begegnung und Abschied); F-ar-03 (Dank, Anlass: Antwort auf die Frage nach dem Befinden; nach dem Essen) |
| ar.a1.e10 Zu Gast bei Oma Samīra | F-ar-02 (Beginn, Anlass: vor dem Essen oder dem Beginn einer Arbeit) |
| ar.a2.e04 Ferienpläne | F-ar-04 (Zukunft, Anlass: Pläne und Verabredungen) |
| ar.a2.e05 Neue Nachbarn | R-03 (Ereignis: Gebet, Freitagsgebet); F-ar-07 (Dank, Anlass: Dank für eine Hilfe) |
| ar.a2.e08 Ich fühle mich nicht gut | F-ar-10 (Wunsch, Anlass: wenn jemand niest) |
| ar.a2.e09 Lernen für die Klassenarbeit | R-08 (Kalender: Weihnachten, Ostern, Pfingsten) |
| ar.a2.e10 Die große Familie | F-ar-05 (Bewunderung, Anlass: Lob für Kinder, Arbeit, Erfolg); F-ar-06 (Segenswunsch, Anlass: Dank und Glückwunsch) |
| ar.a2.e12 Was willst du werden? | R-10 (Beruf: Imam, Pfarrer) |
| ar.a2.e13 Eine Hochzeit in der Familie | R-04 (Zeit: Ramadan, Fasten); R-05 (Ereignis: Fastenbrechen); R-06 (Fest: Ramadanfest, Opferfest); F-ar-12 (Festgruß, Anlass: Ramadanfest und Opferfest); F-ar-13 (Festgruß, Anlass: Beginn des Ramadan) |
| ar.b1.e01 Als Oma jung war | R-13 (Kalender: islamische Monatsnamen) |
| ar.b1.e04 Drei Tage in Tunis | R-12 (Reise: Pilgerfahrt) |
| ar.b1.e09 Wenn es schwer wird | F-ar-11 (Beileid, Anlass: Trauerfall) |
| ar.b1.e16 Wir kochen für Gäste | R-09 (Speise: halal); F-ar-02 (Beginn, Anlass: vor dem Essen oder dem Beginn einer Arbeit) |
| ar.b2.e12 Alte Handwerke | R-01 (Ort: Moschee); R-02 (Ort: Kirche, Synagoge) |

## 9 Kinder

- A1–B1: alle Einheiten `kinderGeeignet: true`, nur kindgeeignete Themen des Leitfadens (automatisch geprüft). Krankheit nur leicht (A1 e12 Halsschmerzen, A2 e08 Erkältung), Gewitter ohne Verletzte (A2 e11), Verkehr ohne Unfall (B1 e06), ein Trauerfall nur mit Trost und ohne Einzelheiten (B1 e09, OF-17).
- Keine Geheimnisse vor den Eltern und keine Kontakte zu Fremden im Netz: Passwörter gehen nie an Fremde (A2 e14); eine merkwürdige Nachricht zeigt Laylā sofort ihrer Mutter (B1 e07). Die Familiengruppe im Telefon (A2 e02) besteht nur aus Familie.
- B2–C1: alle `false` (Standard des Leitfadens). Erwachsenenthemen wie Pflege, Verträge, Gericht und Finanzen erscheinen sachlich. Nach Prüfung der Einträge könnten auf `true` gesetzt werden: B2 e07, e09, e10 und C1 e05, e07 (Energie, Erfindungen, Feuerwehr, Geschichte des Papiers, Technik). Die Anzeige für Kinderkonten entscheidet L7 (OF-15).

## 10 Begründungen

| Entscheidung | Begründung |
|---|---|
| Schrift zuerst, Vorkurs mit acht Lektionen | Ohne sicheres Lesen der Schrift mit Harakat ist keine Übung möglich. Die Elifbe-Bausteine sind erprobt und werden nur technisch wiederverwendet; Inhalte sind weltlich. |
| Immer voll vokalisiert, Pausa am Satzende | Lernende sehen jede Form eindeutig; Sprachausgabe und Spracherkennung brauchen vokalisierte Eingaben (KERN §4). Pausa entspricht dem gesprochenen Hocharabisch. |
| Nominalsatz am Anfang | Ohne „sein“ im Präsens sind ab der ersten Einheit vollständige Sätze möglich; das motiviert Kinder und Erwachsene gleichermaßen. |
| Muḍāriʿ in A1, Māḍī in A2 (PLAN §6.2) | Das Präsens trägt Alltag, Gewohnheiten und Wünsche; erzählt wird ab A2. |
| Fälle zuerst als Hörbild, als System in B1 | Die volle Vokalisierung zeigt Endungen von Beginn an; erklärt wird, sobald genug Formen bekannt sind (Genitiv A1, Akkusativ A2, Iʿrāb B1). |
| Wurzel und Muster schon am Ende von A1 | Für Deutschsprachige der wichtigste Schlüssel zum Wortschatz (PLAN §6.2 „de → ar Wurzelsystem“); für Türkischsprachige verbindet er bekannte Lehnwörter. |
| Verbstämme als System in B1 | Vorher werden abgeleitete Verben als Wörter gelernt; in B1 trägt das System die Wortschatzerweiterung (1.300 Lemmata). |
| kāna „war“ und li-anna schon in A2 | Erzählen und Begründen gehören zu A2; die Schwesterngruppen mit allen Regeln bleiben in B2 (PLAN). |
| Wetzlar, Amman, Tunis | Lebenswelt der Familien in Deutschland und ein arabischsprachiger Alltag ohne Politik; Großeltern und Verwandte verbinden beide Orte über alle Stufen. |
| Kleine Budgets am Anfang | Die Schrift bindet in A1 viel Lernzeit. |
| Weltliche Grüße als Lernziel | Formeln sind gesperrt, bis zwei Gelehrte die Liste freigeben (KERN §2.3, LM-09). |
| Umgangssprachen nur erkennen (C1) | Ziel ist Hocharabisch für alle Herkunftsregionen; Dialekte würden die Kurse aufspalten. |

## 11 Offene Fragen

Alle laufen mit ihrem Standard weiter (L3-E12).

| ID | Frage | Standard | Wer |
|---|---|---|---|
| OF-ar-01 | Mehrere Lese-, Sprech- und Schreibaufgaben je Einheit stehen als nummerierte Zeichenkette. Sollen `lesetext`, `sprechen` und `schreiben` im Zod-Schema (L3-02) Listen werden? | Zeichenkette „1) … 2) …“ wie in den Rahmenplänen Deutsch und Türkisch; Umstellung für alle drei Sprachen gemeinsam | L3-02 |
| OF-ar-02 | PLAN §4 sieht `lesen_fragen` erst ab B1 vor, PLAN §5.1 aber 6 Lesetexte in A1 und 14 in A2. | A1/A2-Lesetexte mit `auswahl`, `luecke` und eingestreuten Fragen wie bei `geschichte`; Vorschlag: `lesen_fragen` ab A1 freigeben | L3-02 / Orchestrator |
| OF-ar-03 | PLAN §4 sieht `schreiben` ab B1 und arabischen Freitext (`frei`) erst ab B1 vor, PLAN §5.1 aber 14 Schreibaufgaben in A2. | A2: gelenkte Kurztexte (20–45 Wörter) im Typ `schreiben` mit arabischer Bildschirmtastatur, vereinfachter Prüfliste und Selbsteinschätzung; alternativ auf Papier geschrieben | L3-02 / Orchestrator |
| OF-ar-04 | Homographe von Religionsbegriffen im Alltagswortschatz: ḥadīṯ (modern, Gespräch), ẓuhr (Mittag), ʿaṣr (Zeitalter, Nachmittag), maġrib (Westen, Marokko), hiǧra (Migration), ǧāmiʿ (umfassend), ʿālim (Wissenschaftler), šahāda (Zeugnis). | A1–A2 vermeiden (Ersatz: muntaṣaf an-nahār, ǧadīd, ġarb, bāḥiṯ); ab B1 in weltlicher Bedeutung erlaubt, wenn der Wächter sie nur als Hinweis meldet; Entscheidung über das Formel-Lexikon bei der religiösen Prüfung (KERN §3 a) | zwei Personen mit `religioese_pruefung` / L3-Werkzeug |
| OF-ar-05 | Wochentag al-ǧumʿa (Freitag) | normales Wort der Wochentage ohne Religionsbezug; das Formel-Lexikon erfasst nur die Phrasen (Freitagsgebet R-03, Freitagsgruß F-ar-14) | Redaktion / L3-Werkzeug |
| OF-ar-06 | „Geburtstag“ heißt üblicherweise ʿīd al-mīlād und fällt mit R-08 (Weihnachten) zusammen. | in A1–A2 tārīḫ al-mīlād bzw. yawm al-mīlād; ʿīd al-mīlād erst nach Entscheidung zu OF-07 und R-08 | Hoca / Vorstand (LM-09) |
| OF-ar-07 | maʿa s-salāma ist als weltliche Alternative erlaubt (Leitfaden §4.3), enthält aber dieselbe Wurzel wie der gesperrte Salām-Gruß (F-ar-01). | maʿa s-salāma als feste Wendung erlaubt; salām allein und der Gruß as-salāmu ʿalaykum erst mit der Formelliste | zwei Personen mit `religioese_pruefung` (LM-09) |
| OF-ar-08 | Zwei Reihen gregorianischer Monatsnamen (yanāyir … und kānūn aṯ-ṯānī …) | erste Reihe aktiv, zweite ab A2 nur erkennen; islamische Monatsnamen nur Kandidat R-13 | Prüfperson (LM-02) |
| OF-ar-09 | Fachbegriffe in kontrastiven Tipps: Türkischsprachige kennen teils osmanisch-türkische Grammatikbegriffe (izafet, mazi, muzari). | deutsche bzw. türkische Bezeichnung zuerst, arabischer Fachbegriff in Klammern | Redaktion / L3-Entwurf |
| OF-ar-10 | Wahl der Schauplätze: Amman für die Großeltern, Tunis als Reiseziel | wie im Entwurf; Länder gleichwertig, ohne Politik; andere arabischsprachige Orte als Nebenschauplätze möglich | Redaktion / Vorstand |
| OF-ar-11 | Fuṣḥā in Alltagsdialogen wirkt in manchen Situationen förmlich. | einfache gesprochene Fuṣḥā in allen Dialogen; Umgangssprachen nur in C1 erkennen, keine Produktion | Prüfperson (LM-02) |
| OF-ar-12 | Redewendungen und Sprichwörter (C1) | nur weltliche; Wendungen mit Gottesbezug oder religiöser Herkunft ausgeschlossen; die Liste prüft die Redaktion vor dem Entwurf; der Wächter prüft Koran- und Hadith-4-Gramme | Redaktion (LM-09) |
| OF-ar-13 | Schreibweise arabischer Namen in deutschen und türkischen Übersetzungen und Tipps | ohne Längenzeichen und Sonderzeichen der Umschrift (Layla, Yazan, Hind, Basil, Samira, Nizar) | Redaktion (LM-09) |
| OF-ar-14 | uḥibbu („ich mag“) fällt ohne Vokalzeichen mit Formen von ḥabīb zusammen (Leitfaden: mehrdeutig, Kategorie Beziehungen). | uḥibbu für Essen, Hobbys und Orte erlaubt; Treffer sind Hinweise, keine Befunde | L3-Werkzeug / LM-09 |
| OF-ar-15 | Verfeinerungen gegenüber PLAN §6.2: kāna „war“ und li-anna in A2, anna-Sätze und iḏā in B1, Genitiv als Hörbild in A1, Verbalnomen lexikalisch in A2 | wie im Entwurf | Prüfperson (LM-02) |
| OF-ar-16 | Einstufung bei Elifbe-Vorwissen | die Einstufung erkennt Lesefähigkeit; ar.v.l01–l08 überspringbar, ar.v.l02 und ar.v.l07 empfohlen | Bildung / L2 |
| OF-ar-17 | Sprachausgabe für Arabisch ist noch offen (eigene Stimme auf ClArTTS, Übergang nur nach Vokalisierungstest, L3-E10). | Hör- und Diktatübungen ohne Stimme laufen mit „Audio folgt“ und werden übersprungen; keine Sackgasse | LM-06 / L3 |
| OF-ar-18 | Kinderkonten und B2/C1 | alle B2/C1-Einheiten `false`; Kandidaten für `true` siehe §9 | Vorstand / Bildung (OF-15) |
| OF-ar-19 | Abdeckung mit genauerer Morphologie prüfen; Scheinlemmata nur bis ≈ Platz 1.100 gesichtet | in L3 über die tatsächlichen Lemmalisten, lokal mit CAMeL Tools (`morphology-db-msa-r13`); Zielwerte aus §7.3 gelten bis dahin | L3-Werkzeug |
| OF-ar-20 | Planungstexte enthalten bewusste Ausschlussvermerke („ohne Musik und Tanz“, „keine Figur nutzt Zinsgeschäfte“, „ohne Parteien“). Ein Tabu-Prüfer über `rahmen/**` würde sie melden, dazu den bekannten Fehlalarm „buchstabieren“ (bier, vgl. OF-tr-07). | `rahmen/**` ist kein Inhalt und wird nicht mit dem Tabu-Lexikon geprüft; die Vermerke bleiben als Anweisung an den Entwurf | L3-Werkzeug |

## 12 Prüfungen dieses Entwurfs

- **Struktur:** Felder und Typen wie im Auftrag und wie in den Rahmenplänen Deutsch und Türkisch; JSON mit `node -e "JSON.parse(...)"` geprüft (gültig), UTF-8, zwei Leerzeichen Einrückung.
- **Mengen:** Einheiten je Stufe 12/14/16/16/14; Lemma-Budgets je Stufe 600/900/1.300/1.700/2.000 (Σ 6.500); Dialoge und Geschichten 144, Lesetexte 156, Sprechen 144, Schreiben 90 – wie PLAN §5.1.
- **Grammatik:** 126 IDs, jede genau einmal eingeführt (Stufe passt), jede später wiederholt, alle Voraussetzungen vorher eingeführt; keine Einheit ohne Grammatik oder Wortfeld; alle 150 Wortfelder genutzt.
- **Themen:** alle aus dem Leitfaden, Stufe im erlaubten Bereich, in A1–B1 nur kindgeeignete Themen.
- **Kandidaten:** alle IDs im Leitfaden vorhanden und mit arabischem Bezug, keine Orte oder Ereignisse unter ihrer Mindeststufe, F-ar-11 erst ab B1, keine Formel mit dem Vorschlag „nicht aufnehmen“.
- **Namen:** 25 verschiedene Vornamen und 10 Familiennamen in Geschichten und Beispielen, alle aus der Namensliste; keine ausgeschlossenen Namen; Familiennamen erst ab A2 und nie zusammen mit einem Vornamen.
- **Tabu und Religion:** 0 Treffer im arabischen Tabu-Lexikon und 0 Religionsbegriffe in allen Umschrift-Beispielen.
- **Arabische Schrift:** 0 Zeichen aus U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF in beiden Dateien.
- **GER:** alle Kann-Beschreibungen eigene, situationsbezogene Formulierungen; keine Deskriptoren übernommen oder übersetzt; keine fremden Lehrwerke nachgebaut, eigene Titel und Themenfolge.

## 13 Abnahme (LM-02, ≈ 3 h)

Die Prüfperson sieht sich an:

1. Vorkurs und Grammatikfolge (§4, §5): passt die Reihenfolge zum Lernen von Kindern, Jugendlichen und Erwachsenen? Fehlt etwas Wichtiges? Sind die Beispiele korrekt vokalisierbar und natürlich?
2. Themen und Geschichten (§6): alltagsnah, familientauglich, ohne Klischees? Passen Schauplätze und Figuren zur Gemeinde?
3. Kann-Beschreibungen (§3, §6): verständlich, eigene Formulierungen, erreichbar?
4. Mengen und Abdeckung (§3.1, §7): stimmen die Mengen mit PLAN §5.1 überein? Sind die Zielwerte vernünftig?
5. Kinder und Religion (§8, §9): keine Inhalte gegen den Leitfaden, Kandidaten nur markiert.
6. Offene Fragen (§11): Standard bestätigen oder ändern.

Ergebnis: „abgenommen“ oder Liste der Änderungen. Bis dahin gilt dieser Entwurf.

## 14 Übergabe an L3

1. **Schema (L3-02):** Die Struktur entspricht der der Rahmenpläne Deutsch und Türkisch (gleiche Felder und Typen). Offene Punkte: OF-ar-01 bis OF-ar-03.
2. **Entwurf (PLAN §6.3, Phase E):** Je Einheit erhält der Agent den Rahmen-Eintrag mit Grammatik (neu und Wiederholung), Wortfeldern, Budget, Geschichte, Aufgaben, Leitfaden und KI-Regel 2. Zielinhalt voll vokalisiert in arabischer Schrift nur in `web/inhalte/lernapp/sprache/ar/**`. Die Kandidaten mit Religionsbezug werden nur als gesperrte, markierte Einträge erzeugt oder ganz weggelassen.
3. **Prüfer (`lernapp:pruefen`):** Lemma-Budget je Einheit, Satzlänge je Stufe, Vokalisierung vollständig und in NFC-Reihenfolge, Zweitmeinung Vokalisierung (Mishkal oder CAMeL Tools, nur lokal), Religionswächter, Abdeckungsziele je Stufe (§7.3) als Bericht, `kinderGeeignet` je Einheit.
4. **Kontrastdokumente:** `_lernapp/lehrplan/kontrast-ar-aus-de.md` (Schrift und Laute, kein „sein“ im Präsens, Wurzelsystem, Genus und Fälle) und `kontrast-ar-aus-tr.md` (Elifbe-Vorwissen und Aussprache, Lehnwörter und falsche Freunde, Iḍāfa und izafet, Wortstellung).
5. **Werkzeuge:** Rangliste, Mess- und Bauskript dieses Entwurfs liegen im Scratchpad des Orchestrators unter `l3-rahmen-ar/` (`rang_ar.py`, `kuratierung_ar.py`, `messen_ar.py`, `bauen_ar.py`); die Übernahme nach `_lernapp/werkzeuge/` ist für L3 vorgeschlagen.
