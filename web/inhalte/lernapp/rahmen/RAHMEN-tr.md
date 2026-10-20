# Rahmenplan Türkisch (Zielsprache tr, gelehrt aus Deutsch und Arabisch)

- **Stand:** 16.10.2026, Version 1.0.0-entwurf (L3-01, vorgezogen)
- **Status:** Entwurf. Er gilt als Standard, bis eine Prüfperson aus LM-01 ihn abnimmt (LM-02, ADR 0041 Nr. 12).
- **Maschinenlesbar:** `web/inhalte/lernapp/rahmen/tr.rahmen.json`. Bei Abweichungen gilt die JSON-Datei; dieses Dokument erklärt sie.
- **Hinweis:** Die Stufen sind orientiert am GER (Europarat 2001/2020). Alle Kann-Beschreibungen sind eigene Formulierungen. Deskriptoren des GER werden weder übernommen noch übersetzt, fremde Lehrpläne und Lehrwerke nicht nachgebaut (LM-36, ADR 0045 Nr. 8).
- **Grundlagen:** PLAN §4, §5.1, §6.1–§6.4; KERN §2, §5, §7; Inhaltsleitfaden (`_lernapp/lehrplan/INHALTSLEITFADEN.md`, `leitfaden.json`); Beleg S7 (`_lernapp/belege/S7-sprachdaten.md`).
- **Richtungen:** `tr-aus-de` und `tr-aus-ar` nutzen denselben Zielkorpus. Übersetzungen, Glossen und kontrastive Tipps entstehen je Richtung (PLAN §6.3).

> **KI-Regel 2 (ADR 0040, KERN §2):** Keine Koranverse, Hadithe, Bittgebete oder anderen religiösen Texte (weder arabisch
> noch übersetzt), keine Koran-Wortbedeutungen, keine Fiqh-Aussagen. Der Sprachkurs ist ohne Religionsbezug. Religiöse Formeln
> gibt es nur aus einer später von zwei Gelehrten freigegebenen Liste; im Rahmenplan stehen sie höchstens als markierte Kandidaten
> `religionsbezug`, nie als Lernziel. Arabische Wörter stehen hier nur in Umschrift.

## 1 Kurzfassung

- 72 Einheiten in fünf Stufen (A1 12, A2 14, B1 16, B2 16, C1 14) mit je acht Stationen: fünf Lektionen, eine Geschichte, eine Wiederholung, ein Prüfstein.
- 6.500 neue Lemmata (A1 600, A2 900, B1 1.300, B2 1.700, C1 2.000), 26.000 Sätze, 144 Geschichten und Dialoge, 156 Lesetexte, 144 Sprech- und 90 Schreibaufgaben – genau die Mengen aus PLAN §5.1.
- 109 Grammatikpunkte (A1 27, A2 26, B1 22, B2 20, C1 14). Jeder wird in genau einer Einheit eingeführt und später mindestens einmal wiederholt.
- 155 Wortfelder; jede Einheit hat zwei bis vier, einige kehren auf höheren Stufen wieder.
- Vorkurs: zwei Lektionen (Buchstaben und Laute; Vokalharmonie als Hörbild). Arabischsprachige lernen vorher die Lateinschrift im Vorkurs des Deutschkurses (de.v.l01–de.v.l06).
- Schauplätze sind Wetzlar und die Türkei. Familie Kaya, die Großeltern in İzmir, Verwandte, Freundinnen, Freunde und Nachbarn begleiten die Lernenden von A1 bis C1 und werden mit ihnen älter.
- Abdeckung: Hinter den 500 häufigsten Wortformen stehen nach Ausschluss 433 Lemmata. A1 soll davon ≥ 85 % einführen (Simulation 97 %), C1 ≥ 93 % der Lemmata hinter den Top-5.000 (Simulation 100 %).
- Religion ist kein Lernthema. 26 gesperrte Kandidaten-Verweise auf Orte, Ereignisse und Formeln des Leitfadens stehen in 14 Einheiten, nie als Lernziel.

## 2 Für wen und wofür

### 2.1 Lernende

- **Deutschsprachige**, darunter viele Herkunftssprachler der zweiten und dritten Generation. Sie verstehen oft viel, lesen und schreiben aber wenig. Für sie zählen Schreibung (ı/i, ğ, Apostroph), Lesetexte und Schreibaufgaben. Der Einstufungstest (PLAN §5.1) lässt sie früher einsteigen; der Vorkurs ist für sie optional.
- **Arabischsprachige** lernen zuerst die Lateinschrift im Vorkurs des Deutschkurses (de.v.l01–de.v.l06), dann den türkischen Vorkurs. Viele türkische Wörter stammen aus dem Arabischen; die kontrastiven Tipps der Richtung `tr-aus-ar` zeigen Bedeutungsunterschiede (falsche Freunde), ohne religiöse Wörter zu verwenden.
- **Alter:** Kinder ab etwa zehn Jahren bis zu Älteren. A1–B1 sind vollständig kindgeeignet (Leitfaden §6), B2–C1 behandeln Erwachsenenthemen sachlich.

### 2.2 Lebenswelt und Schauplätze

Die Einheiten spielen abwechselnd in Wetzlar und in der Türkei (İzmir, Kappadokien). So lernen Herkunftssprachler, was sie bei Verwandtenbesuchen und im Alltag in Deutschland brauchen. Länder werden gleichwertig behandelt, ohne Politik (G-03, G-05).

### 2.3 Figuren, die mitwachsen

Alle Namen stammen aus der Namensliste des Leitfadens (§1.1); jede Einheit mischt die drei Sprachräume. Familiennamen erscheinen erst ab A2 (förmliche Anrede, z. B. Becker Hanım).

| Familie oder Rolle | Personen | Entwicklung im Kurs |
|---|---|---|
| Familie Kaya (Wetzlar) | Elif (11), Can (14), Mutter Derya (Ingenieurin), Vater Murat (Busfahrer, kocht gern) | Elif und Can werden älter: Schule, Führerschein, Praktikum, Ausbildung, Studium |
| Großeltern (İzmir, oft zu Besuch) | Oma Sevim, Opa Metin | Erinnerungen (B1), Pflege nach einer Operation (B2), Sprachbiografie (C1) |
| Verwandte | Tante Gül, Onkel Orhan, Cousin Kerem, Cousine Defne, Cousine Nilay | Hochzeit (A2), Wohnungssuche und Mietvertrag (B1–B2), Tischlerei (B2–C1), Redaktion (B2–C1) |
| Freundinnen und Freunde | Rīm, Lena, Samīr, Jan, Arda, Rāmī | gemischte Klassen und Gruppen; enge Freundschaften unter Mädchen bzw. unter Jungen (OF-16) |
| Nachbarschaft und Berufe | Frau Becker, Erik, Selin, Emre, Pınar, Tolga, Ebru, Hakan, Fādī, Dīma u. a. | Frauen und Männer in allen Berufen (G-09) |

Arabische Namen stehen in türkischen Texten ohne Längenzeichen (Rim, Samir, Fadi, Dima, Rami, Ziyad); das ist eine offene Frage (§10, OF-tr-04).

### 2.4 Religion

Religion ist kein Lernthema (Leitfaden §4). Grüße und Wünsche werden mit den weltlichen Formen gelernt (Merhaba, Günaydın, Hoşça kal, Afiyet olsun, Geçmiş olsun, Kolay gelsin, Tebrikler). Orte, Ereignisse und Formeln mit Religionsbezug stehen nur als gesperrte Kandidaten in `religionsbezugKandidaten` (§8). Sie sind nicht Lernziel, nicht im Lemma-Budget, nicht im Prüfstein, haben keine Sprachausgabe und sind erst nach zwei religiösen Freigaben sichtbar. Jede Lektion ist ohne sie vollständig.

## 3 Ziele je Stufe

### A1 – 600 neue Lemmata, 2.400 Sätze

- Ich kann mich, meine Familie und meinen Alltag in kurzen Sätzen vorstellen.
- Ich kann in der Schule, auf dem Markt, beim Kinderarzt und in der Familie kurze Fragen stellen und auf Fragen nach Name, Alter, Wohnort und Befinden antworten.
- Ich kann Zahlen, Preise, Uhrzeiten und Wochentage verstehen und nennen.
- Ich kann kurze Hinweise, Listen und Nachrichten mit bekannten Wörtern lesen.
- Ich kann sagen, wo etwas ist, wohin ich gehe und was ich gerade mache.
- Ich kann die türkischen Laute und die Vokalharmonie hören und beim Sprechen meist richtig treffen.

### A2 – 900 neue Lemmata, 3.600 Sätze

- Ich kann von Erlebtem erzählen und über Pläne sprechen.
- Ich kann Alltagsaufgaben auf Türkisch erledigen: einen Termin vereinbaren, einkaufen und umtauschen, beim Arzt Beschwerden schildern, ein Paket aufgeben.
- Ich kann höflich bitten, anbieten, einladen, gratulieren und mich entschuldigen.
- Ich kann Dinge und Menschen beschreiben und miteinander vergleichen.
- Ich kann kurze Alltagstexte wie Einladungen, Etiketten, Aushänge und Rechnungen verstehen.
- Ich kann kurze Nachrichten, Karten und einfache Formulare schreiben.

### B1 – 1.300 neue Lemmata, 5.200 Sätze

- Ich kann Erlebnisse aus Familie, Schule und Reisen in der richtigen Reihenfolge erzählen, von meinen Vorhaben berichten und sagen, warum sie mir wichtig sind.
- Ich kann beim Elternabend, am Arbeitsplatz, mit Nachbarn und am Behördenschalter mein Anliegen vortragen und kleine Probleme selbst klären.
- Ich kann wiedergeben, was andere gesagt haben, und indirekt nachfragen.
- Ich kann Bedingungen, Gründe, Zeitfolgen und Absichten ausdrücken.
- Ich kann Elternbriefe, Wohnungsanzeigen, Rezepte und kurze Zeitungsmeldungen lesen und anderen erklären, worum es geht.
- Ich kann einer Freundin einen Brief schreiben, Lehrkräften oder Vermietern eine E-Mail schicken und kurz über ein Ereignis berichten.

### B2 – 1.700 neue Lemmata, 6.800 Sätze

- Ich kann Nachrichten, Ratgebertexte und amtliche Schreiben zu Arbeit, Gesundheit, Wohnen und Umwelt lesen und das Wichtigste mit eigenen Worten wiedergeben.
- Ich kann Gehörtes und Gelesenes nach Quelle und Gewissheit einordnen und sachlich wiedergeben.
- Ich kann in Ausbildung, Beruf und Verwaltung Anliegen begründet vortragen, verhandeln und reklamieren.
- Ich kann zwei Angebote, Wohnungen oder Berufswege miteinander vergleichen und begründen, wofür ich mich entscheide.
- Ich kann längere Gespräche über Familie, Arbeit und Gemeinde führen und dabei auf Einwände eingehen.
- Ich kann formelle Schreiben wie Anschreiben, Widerspruch und Reklamation klar gegliedert verfassen.

### C1 – 2.000 neue Lemmata, 8.000 Sätze

- Ich kann Bescheide, Verträge, Fachartikel und Kommentare über mehrere Seiten lesen und die entscheidenden Aussagen, Bedingungen und Fristen herausarbeiten.
- Ich kann bewusst zwischen Umgangssprache, Standardsprache und Amtsstil wechseln.
- Ich kann Redewendungen und Sprichwörter verstehen und sparsam selbst verwenden.
- Ich kann präsentieren, moderieren, argumentieren und diplomatisch widersprechen.
- Ich kann gegliederte Texte wie Kommentar, Protokoll, Antrag und Essay verfassen.
- Ich kann Ton und Absicht von Texten und Reden beschreiben.

### 3.1 Mengen (PLAN §5.1, verbindlich)

| Stufe | Einheiten | Stationen | neue Lemmata (Σ) | Sätze | Dialoge und Geschichten | Lesetexte | Sprechen / Schreiben |
|---|---|---|---|---|---|---|---|
| A1 | 12 | 96 | 600 (600) | 2.400 | 24 | 6 | 24 / 0 |
| A2 | 14 | 112 | 900 (1.500) | 3.600 | 28 | 14 | 28 / 14 |
| B1 | 16 | 128 | 1.300 (2.800) | 5.200 | 32 | 32 | 32 / 16 |
| B2 | 16 | 128 | 1.700 (4.500) | 6.800 | 32 | 48 | 32 / 32 |
| C1 | 14 | 112 | 2.000 (6.500) | 8.000 | 28 | 56 | 28 / 28 |
| **Σ** | **72** | **576** | **6.500** | **26.000** | **144** | **156** | **144 / 90** |

Jede Einheit hat acht Stationen: fünf Lektionen, eine Geschichte (Dialog), eine Wiederholung, einen Prüfstein. Je Einheit gibt es zwei Dialoge oder Geschichten: die Station „Geschichte“ und einen Dialog in einer Lektion (Übungstyp `dialog`). Mehrere Lese-, Sprech- oder Schreibaufgaben einer Einheit stehen in der JSON-Datei als nummerierte Zeichenkette („1) … 2) …“), wie im Rahmenplan Deutsch.

## 4 Vorkurs (2 Lektionen)

### tr.v.l01 – Buchstaben und Laute (für: de, ar)

**Ziel:** Das türkische Alphabet mit 29 Buchstaben lesen und die Sonderbuchstaben ç, ğ, ı, İ, ö, ş, ü sicher hören, sprechen und schreiben.

- 29 Buchstaben, Groß- und Kleinschreibung; i/İ und ı/I als zwei getrennte Paare
- Laute mit eigenem Zeichen: c wie in can, ç wie in çay, ş wie in şeker, j, y wie in yol, z wie in zaman
- ğ (yumuşak g): dehnt den vorangehenden Vokal und steht nie am Wortanfang (dağ, oğul)
- Minimalpaare ı/i, o/ö, u/ü: kır – kir, on – ön, un – ün
- ein Laut – ein Buchstabe; Betonung meist auf der letzten Silbe, Ausnahmen bei vielen Ortsnamen (Ankara, İzmir)
- Zirkumflex (â, î, û) nur in wenigen Lehnwörtern; wird erkannt, im Abgleich tolerant behandelt
- für Arabischsprachige vorher: Lateinschrift-Grundlagen aus dem Vorkurs des Deutschkurses, de.v.l01–de.v.l06 (aus de.v.l03 gelten nur ö und ü, ä und ß gibt es im Türkischen nicht); Kontrast-Tipp: Türkisch schreibt jeden Vokal aus
- deutsche Schreibregeln aus dem Vorkurs Deutsch gelten hier nicht: Nomen klein (ev, okul); v nie wie f (var), s immer stimmlos, z nie wie ts; keine Buchstabenverbindungen wie sch, ch, ei, ie, ck, tz, denn sch und tsch haben eigene Buchstaben (ş, ç); h immer gesprochen, nie Dehnungszeichen; Doppelkonsonanten lang gesprochen, nicht Zeichen für einen kurzen Vokal (elli – eli)
- Übungstypen: schrift_tr, minimalpaare, hoeren_waehlen; Sonderzeichenleiste für Freitext

### tr.v.l02 – Vokalharmonie als Hörbild (für: de, ar)

**Ziel:** Die Vokalharmonie als Klangmuster erkennen, bevor sie in A1 als Regel erklärt wird; Konsonantenangleichung an Endungen hören.

- helle Vokale (e, i, ö, ü) und dunkle Vokale (a, ı, o, u) nach Klangfarbe sortieren
- zweifache Harmonie hören: evler – okullar, evde – okulda
- vierfache Harmonie hören: evim – kızım – gözüm – okulum
- Wörter mit gemischten Vokalen (kitap, otobüs): die Endung folgt trotzdem dem letzten Vokal (kitaplar, otobüsler); Ausnahmen wie saat – saatler erst hören, Erklärung folgt in A1
- Angleichung hören: parkta, kitapta; kitabı, çocuğu
- ohne Grammatikbegriffe; nur Hören, Nachsprechen und Zuordnen
- für Herkunftssprachler: Einstufung kann den Vorkurs überspringen; Schwerpunkt dann auf Schreibung

## 5 Grammatikfolge

### 5.1 Grundlage und Verfeinerung

PLAN §6.2 legt die Folge fest: Vokalharmonie, Fälle, Possessiv, -iyor, var/yok, mi (A1) → -di/-miş/-ecek, Aorist, -ebil (A2) → Partizipien, Konverben, Bedingung (B1) → Passiv/Kausativ, Evidentialität (B2) → Nominalisierungen, Register, Redewendungen (C1). Der Rahmenplan hält diese Folge ein und ergänzt sie:

- **A1** beginnt mit Personalpronomen und Personalendungen am Nomen, damit schon in der ersten Einheit ganze Sätze möglich sind („Ben Elif. Öğrenciyim.“). Die Vokalharmonie kommt als Hörbild aus dem Vorkurs und wird in e02 zur Regel. Die Fälle folgen in der Reihenfolge des Bedarfs: Ort (-de), Objekt (-i), Richtung (-e), Herkunft (-den), Genitiv.
- **A2** stellt -miş als Gegenstück zu -di nur im Grundgebrauch vor („Yağmur yağmış“). Die volle Evidentialität mit -(y)miş an Nomen und zusammengesetzten Formen folgt in B2. Ergänzt sind Verlaufsvergangenheit (-iyordu), Dauer (-dir/-den beri), Zweck (-mek için), Infinitiv als Nomen und die Wunschform der 3. Person, die die weltlichen Wünsche trägt (Geçmiş olsun, Kolay gelsin).
- **B1** bringt neben Partizipien, Konverben und Bedingung auch die Grundform der dass-Sätze (-diğini) und die Nominalform -mesi. Beides braucht man für Formulare, Nachrichten und indirekte Rede. Die zusammengesetzten Vergangenheitsformen (-mişti, -ecekti, -erdi) stützen das Erzählen. Der Nominalstil als Textmerkmal bleibt C1 vorbehalten.
- **B2** ergänzt Passiv und Kausativ um Reflexiv- und Reziprokstämme, Diathesen-Kombinationen und Aspekt-Hilfsverben. Dazu kommen die formellen Begründungs-, Bedingungs- und Zweckformen der Amts- und Vertragssprache.
- **C1** verdichtet: Nominalstil, Amtsstil (-mekte, -mıştır), lange Attribute, gemeinsame Endungen in Reihungen, Textverknüpfer, Wortstellung mit Nachfeld, Partikeln. Hinzu kommt das Register: Umgangssprache wird verstanden und eingeordnet, Redewendungen und Sprichwörter werden genutzt, Muster der Schriftsprache aus Lehnwörtern werden erschlossen. Die letzte Einheit (tr.c1.e14) führt nichts Neues ein und wiederholt alles.

**Regeln, automatisch geprüft:** Jede Grammatik-ID wird in genau einer Einheit eingeführt (erstes Auftreten, Stufe der ID = Stufe der Einheit) und in mindestens einer späteren Einheit wiederholt. Jede Voraussetzung (`voraus`) ist vorher eingeführt. Keine Einheit ist ohne Grammatik oder ohne Wortfeld. In `grammatik` einer Einheit stehen zuerst die neuen IDs, danach die Wiederholungen.

### 5.2 A1 (27 Punkte)

| ID | Titel | Was gelernt wird | Beispiele | eingeführt | wiederholt in | Voraussetzung |
|---|---|---|---|---|---|---|
| `tr.g.personalpron` | Personalpronomen | ben, sen, o, biz, siz, onlar; sen für vertraute Personen, siz für Höflichkeit und Mehrzahl. Das Pronomen fällt oft weg, weil die Endung die Person zeigt. | Ben Elif. / Siz nasılsınız? / O benim kardeşim. | a1.e01 | a1.e12 | – |
| `tr.g.kopula` | Personalendungen am Nomen (sein) | „sein“ ist eine Endung am Nomen oder Adjektiv: -(y)im, -sin, -dir, -(y)iz, -siniz, -ler. Zuerst ohne Harmonie-Regel als feste Wendungen geübt. | Öğrenciyim. / Yorgun musun? / Biz Wetzlar'dayız. | a1.e01 | a1.e02, a1.e03 | personalpron |
| `tr.g.vokalharmonie` | Vokalharmonie | Endungen richten sich nach dem letzten Vokal des Wortes: zweifach (e/a) und vierfach (i/ı/ü/u). Erst als Hörbild, dann als Regel. | ev – evler, okul – okullar / gül – güller / kitap – kitabım, göz – gözüm | a1.e02 | a1.e03, a1.e12 | kopula |
| `tr.g.bu_su_o` | Hinweiswörter bu, şu, o | bu (hier), şu (da, zeigend), o (dort, auch „er/sie/es“); mit Nomen ohne Endung, allein mit Endung (bunu, şunu, onu). | Bu ne? / Bu bir defter. / Şu çanta senin mi? | a1.e02 | a1.e12 | – |
| `tr.g.frage_mi` | Fragepartikel mi | Ja-Nein-Fragen mit mi/mı/mu/mü, getrennt geschrieben, nach Vokalharmonie; die Personalendung hängt an der Partikel. | Bu kalem mi? / Öğretmen misiniz? / Elif evde mi? | a1.e02 | a1.e04, a1.e12 | vokalharmonie |
| `tr.g.plural` | Mehrzahl -ler/-lar | Mehrzahl mit -ler/-lar; nach Zahlwörtern und bei „çok“ bleibt das Nomen in der Einzahl. | kitaplar, evler / iki kardeş / Çocuklar okulda. | a1.e03 | a1.e04, a1.e12 | vokalharmonie |
| `tr.g.zahlen` | Zahlen bis 1000 und Alter | Grundzahlen bis tausend, Zusammensetzung von links nach rechts; Alter mit „… yaşındayım“ als feste Wendung. | on iki, yirmi beş, yüz / Kaç yaşındasın? / On bir yaşındayım. | a1.e03 | a1.e07, a1.e09 | – |
| `tr.g.degil` | Verneinung mit değil | Nominalsätze verneint man mit değil, an das die Personalendung tritt. | Ben öğretmen değilim. / Bu benim çantam değil. / Hasta değil misin? | a1.e03 | a1.e05, a1.e12 | kopula |
| `tr.g.var_yok` | var und yok | Es gibt / es gibt nicht; zusammen mit dem Possessiv auch für „haben“. | Evde ekmek var. / Bugün ders yok. / Bir kardeşim var. | a1.e04 | a1.e05, a1.e12, a2.e01 | plural |
| `tr.g.possessiv` | Besitzendungen | Besitz wird am Nomen angezeigt: -(i)m, -(i)n, -(s)i, -(i)miz, -(i)niz, -leri. | evim, evin, evi / annemiz / Odanız büyük mü? | a1.e04 | a1.e09, a1.e12, c1.e05 | vokalharmonie |
| `tr.g.lokativ` | Ortsfall -de/-da | Wo? mit -de/-da, nach stimmlosen Konsonanten -te/-ta. | evde, okulda / parkta, sınıfta / Annem mutfakta. | a1.e05 | a1.e06, a1.e08, a2.e10 | vokalharmonie |
| `tr.g.eigenname_apostroph` | Eigennamen mit Apostroph | Endungen an Orts- und Personennamen werden mit Apostroph abgetrennt. | Wetzlar'da / İzmir'de / Elif'in | a1.e05 | a1.e08, a1.e12 | lokativ |
| `tr.g.fragewoerter` | Fragewörter | ne, kim, nerede, nereye, nereden, nasıl, kaç, ne zaman, neden; das Fragewort steht vor dem Verb. | Nerede oturuyorsun? / Kim geliyor? / Ne zaman? | a1.e05 | a1.e06, a1.e12 | frage_mi |
| `tr.g.iyor` | Gegenwart -iyor | Gegenwart und gerade laufende Handlung; Verneinung mit -m-, Frage mit mu. | Geliyorum. / Çay içiyor musun? / Bugün çalışmıyor. | a1.e06 | a1.e07, a1.e08, a1.e11 | vokalharmonie |
| `tr.g.wortstellung` | Satzbau: Verb am Ende | Grundstellung Subjekt – Objekt – Verb; Zeitangaben stehen vorn, das Wichtigste direkt vor dem Verb. | Elif okula gidiyor. / Sabah kahvaltı yapıyoruz. / Babam akşam yemek pişiriyor. | a1.e06 | a1.e12 | iyor |
| `tr.g.akkusativ` | Bestimmtes Objekt -(y)i | Ein bestimmtes direktes Objekt bekommt -(y)i; ein unbestimmtes bleibt ohne Endung. | Elma alıyorum. / Bu elmayı alıyorum. / Kitabı okuyor musun? | a1.e07 | a1.e10, a2.e05 | iyor |
| `tr.g.konsonant` | Konsonanten an der Wortgrenze | p, ç, t, k werden vor Vokal oft weich (kitabı, ağacı, rengi, çocuğu); d in Endungen wird nach stimmlosen Lauten zu t. | kitap – kitabı / çocuk – çocuğu / ağaç – ağaçta | a1.e07 | a1.e10 | akkusativ |
| `tr.g.adjektiv` | Adjektiv vor dem Nomen | Das Adjektiv steht unverändert vor dem Nomen; bir zwischen Adjektiv und Nomen heißt „ein“. | büyük ev / büyük bir ev / kırmızı elmalar | a1.e05 | a1.e07, a1.e12 | – |
| `tr.g.dativ` | Richtungsfall -(y)e/-(y)a | Wohin? und Empfänger mit -(y)e/-(y)a. | okula, eve / İzmir'e gidiyoruz. / Anneme veriyorum. | a1.e08 | a1.e09, a1.e11, a2.e01, a2.e03 | lokativ |
| `tr.g.ablativ` | Ausgangsfall -den/-dan | Woher? und Ausgangspunkt mit -den/-dan bzw. -ten/-tan. | evden, okuldan / Türkiye'den / Saat sekizden beri | a1.e08 | a1.e12, a2.e03, a2.e05 | dativ |
| `tr.g.uhrzeit` | Uhrzeit (volle und halbe Stunden) | Saat kaç? – Saat üç. / Saat üç buçuk. „Um“ mit -de/-da: saat üçte. | Saat kaç? / Saat dört buçuk. / Ders saat dokuzda. | a1.e09 | a1.e12, a2.e02 | zahlen, lokativ |
| `tr.g.genitiv` | Genitiv und Besitzverbindung | Besitzer mit -(n)in, das Besessene mit Besitzendung: annemin evi, Elif'in kalemi. | babamın arabası / Elif'in çantası / okulun bahçesi | a1.e09 | a1.e10, a1.e12, a2.e02, a2.e09 | possessiv |
| `tr.g.imperativ` | Aufforderung | Befehlsform in der 2. Person: Verbstamm (sen) und -(y)in (siz); höflich mit lütfen. | Gel! / Lütfen oturun. / Kapıyı kapat. | a1.e10 | a1.e11, a1.e12, a2.e04, b1.e06 | iyor |
| `tr.g.raum_postpos` | Lage: üstünde, altında, yanında | Lageangaben mit üst, alt, yan, ön, arka, iç + Besitzendung + Ortsfall. | masanın üstünde / kapının arkasında / evin yanında | a1.e10 | a1.e12 | genitiv, lokativ |
| `tr.g.ile` | ile / -(y)le: mit | Begleitung und Mittel mit ile oder angehängt -(y)le/-(y)la. | otobüsle / annemle / kalem ile | a1.e11 | a1.e12, a2.e01 | dativ |
| `tr.g.mek_istemek` | Ich möchte …: -mek istiyorum | Wünsche mit Infinitiv + istemek; das gewünschte Ding mit Akkusativ oder ohne Endung. | Yüzmek istiyorum. / Su istiyor musun? / Parka gitmek istemiyor. | a1.e11 | a1.e12, a2.e03, a2.e12 | iyor, akkusativ |
| `tr.g.nominalkompositum` | Zusammengesetzte Nomen ohne Genitiv | Fügungen wie okul bahçesi, baş ağrısı: zweites Nomen mit -(s)i, erstes ohne Endung. | baş ağrısı / diş fırçası / otobüs durağı | a1.e12 | a2.e07 | genitiv |

### 5.3 A2 (26 Punkte)

| ID | Titel | Was gelernt wird | Beispiele | eingeführt | wiederholt in | Voraussetzung |
|---|---|---|---|---|---|---|
| `tr.g.di` | Vergangenheit -di | Abgeschlossene, selbst erlebte Handlungen; Personalendungen -m, -n, -, -k, -niz, -ler. | Dün parka gittik. / Ödevini yaptın mı? / Hafta sonu çalışmadım. | a2.e01 | a2.e02, a2.e06, a2.e10 | iyor |
| `tr.g.idi` | War/hatte: -(y)di am Nomen, vardı/yoktu | Vergangenheit von Nominalsätzen und von var/yok. | Dün evdeydim. / Hava çok güzeldi. / Bisikletim yoktu. | a2.e01 | a2.e07, a2.e11 | di, var_yok |
| `tr.g.uhrzeit_genau` | Genaue Uhrzeit und Datum | Minuten mit geçiyor/var bzw. geçe/kala; Datum mit Tag, Monat, Jahr. | Saat üçü çeyrek geçiyor. / Beşe on var. / 16 Ekim 2026 | a2.e02 | a2.e08 | uhrzeit |
| `tr.g.ordinal` | Ordnungs- und Verteilungszahlen | -(i)nci für Ordnungszahlen, -(ş)er für „je“; yarım und buçuk. | birinci kat / üçüncü sınıf / ikişer elma | a2.e02 | a2.e14 | zahlen |
| `tr.g.anrede` | Höfliche Anrede | Siz-Form, Vorname + Hanım/Bey (im Alltag auch Familienname + Hanım/Bey: Becker Hanım), Bay/Bayan + Familienname in Briefen und Formularen; efendim als höfliche Rückfrage. | Ayla Hanım, buyurun. / Murat Bey geldi mi? / Efendim? | a2.e02 | a2.e04, a2.e14, c1.e04 | personalpron |
| `tr.g.ecek` | Zukunft -(y)ecek | Pläne und Vorhersagen; Weichwerden vor Vokal (geleceğim). | Yarın dedemi arayacağım. / Yağmur yağacak mı? / Gelmeyecekler. | a2.e03 | a2.e08, a2.e12, a2.e13, b1.e04 | konsonant |
| `tr.g.optativ` | Vorschlag: -(y)elim, -(y)eyim | Vorschläge und Angebote in der 1. Person: Gidelim mi? Bakayım. | Parka gidelim mi? / Ben yardım edeyim. / Biraz dinlenelim. | a2.e03 | a2.e04, a2.e11, b1.e04 | ecek |
| `tr.g.aorist` | Breite Zeit (Aorist) | Gewohnheiten und allgemeine Aussagen mit -r/-er/-ir; Verneinung -mez/-maz. | Her sabah çay içerim. / Kedi süt sever. / Kahve içmem. | a2.e04 | a2.e06, a2.e09, b1.e02 | iyor |
| `tr.g.aorist_bitte` | Höfliche Bitten mit dem Aorist | Bitten und Angebote als Frage im Aorist: … verir misiniz? … ister misin? | Tuzu verir misin? / Pencereyi açar mısınız? / Çay ister misiniz? | a2.e04 | a2.e05, a2.e13, b1.e09 | aorist, anrede |
| `tr.g.komparativ` | Vergleich: daha, en | Komparativ mit daha und -den, Superlativ mit en. | Bu ceket daha ucuz. / Elif Can'dan daha küçük. / En sevdiğim renk mavi. | a2.e05 | a2.e06, a2.e14, b1.e03, b2.e15 | ablativ |
| `tr.g.gibi_kadar` | gibi und kadar | Vergleich „wie“ (gibi) und „so … wie / bis“ (kadar); Pronomen dabei im Genitiv. | senin gibi / babam kadar uzun / akşama kadar | a2.e05 | a2.e09 | genitiv |
| `tr.g.ebil` | Können: -(y)ebil, -(y)eme | Fähigkeit und Erlaubnis; verneint mit -(y)eme-. | Yüzebilirim. / Bisiklete binebilir misin? / Bugün gelemem. | a2.e06 | a2.e14 | aorist |
| `tr.g.mek_nomen` | Infinitiv als Nomen | -mek/-me wie ein Nomen mit Endungen: yüzmeyi severim, okumak güzel. | Yüzmeyi seviyorum. / Kitap okumak güzel. / Erken kalkmaktan hoşlanmam. | a2.e06 | a2.e07, b1.e11 | mek_istemek, akkusativ |
| `tr.g.meli_lazim` | Müssen: -meli, lazım, gerek | Notwendigkeit mit -meli/-malı oder Infinitiv mit Besitzendung + lazım/gerek. | Dinlenmelisin. / Doktora gitmem lazım. / İlaç almak gerekiyor mu? | a2.e07 | a2.e08, b1.e03, b1.e05, b1.e06 | possessiv, mek_nomen |
| `tr.g.wortbildung1` | Wortbildung -li, -siz, -lik, -ci | Häufige Ableitungen: mit/ohne (şekerli, şekersiz), Gegenstand oder Ort (gözlük), Beruf (kitapçı). | sütlü çay / tuzsuz / gözlük, kitapçı | a2.e07 | a2.e14, b1.e05 | vokalharmonie |
| `tr.g.postpos_kasus` | Verhältniswörter mit Fall | -den önce/sonra/beri, -e kadar/göre/karşı, için und hakkında. | dersten sonra / bana göre / sınav için | a2.e08 | a2.e14, b1.e07 | ablativ, dativ |
| `tr.g.mek_icin` | Zweck: -mek için | Um … zu mit Infinitiv + için. | Türkçe öğrenmek için / Ekmek almak için çıktım. / Sınavı geçmek için çalışıyor. | a2.e08 | a2.e14, b1.e15 | postpos_kasus |
| `tr.g.konjunktionen` | Bindewörter | ve, ama, fakat, çünkü, veya; de/da „auch“; hem … hem, ya … ya, ne … ne. | Hem çay hem kahve var. / Yorgunum ama mutluyum. / Ben de geliyorum. | a2.e09 | a2.e10, a2.e12, b1.e10 | wortstellung |
| `tr.g.kendi` | kendi: selbst, eigen | kendi mit Besitzendung als Reflexivpronomen und „eigen“. | kendi odam / Kendimi iyi hissediyorum. / Kendin yap. | a2.e09 | a2.e14 | possessiv |
| `tr.g.mis_grund` | Vergangenheit -miş (Grundgebrauch) | Für Ergebnisse, die man bemerkt oder erzählt bekommt; Gegenstück zum selbst erlebten -di. | Yağmur yağmış. / Kerem gelmiş. / Bisikletin tekeri patlamış. | a2.e10 | a2.e11, b1.e01, b1.e08, b2.e01 | di |
| `tr.g.iyordu` | Verlaufsvergangenheit -iyordu | Was gerade im Gange war, als etwas passierte; auch frühere Gewohnheiten. | Ders çalışıyordum. / Yemek yiyorduk, telefon çaldı. / Eskiden İzmir'de oturuyorduk. | a2.e11 | a2.e14, b1.e01 | idi |
| `tr.g.dir_dauer` | Seit: -dir und -den beri | Dauer bis jetzt mit Zeitangabe + -dir oder Zeitpunkt + -den beri, Verb meist in -iyor. | İki yıldır burada oturuyoruz. / Sabahtan beri yağmur yağıyor. / Ne zamandır Türkçe öğreniyorsun? | a2.e11 | a2.e13, b1.e01 | iyor, postpos_kasus |
| `tr.g.ki_attribut` | -ki: der/die/das … dort | -ki macht aus Orts- und Zeitangaben Attribute (masadaki kitap) und bildet benimki, seninki. | masadaki kitap / bugünkü ders / Benimki mavi. | a2.e12 | a2.e13, b1.e02 | lokativ, genitiv |
| `tr.g.olmak_werden` | olmak: werden und sein | olmak als „werden“ und als Ersatz für „sein“ in Zeitformen und nach Modalformen. | Doktor olmak istiyorum. / Hasta oldum. / Yarın evde olacağım. | a2.e12 | a2.e14 | ecek, mek_istemek |
| `tr.g.imperativ3` | Wunschform 3. Person -sin | -sin/-sinler für Aufforderungen an Dritte und für feste Wünsche wie Geçmiş olsun. | Geçmiş olsun. / Kolay gelsin. / Çocuklar biraz beklesin. | a2.e13 | a2.e14 | imperativ |
| `tr.g.zahlen_gross` | Große Zahlen, Preise, Prozent | bin, milyon; Preise mit lira und kuruş bzw. Euro und Cent; yüzde für Prozent. | iki bin yirmi altı / on beş euro elli sent / yüzde on indirim | a2.e14 | b2.e08, b2.e15 | zahlen |

### 5.4 B1 (22 Punkte)

| ID | Titel | Was gelernt wird | Beispiele | eingeführt | wiederholt in | Voraussetzung |
|---|---|---|---|---|---|---|
| `tr.g.indefinit` | Unbestimmte Pronomen | biri, bir şey, herkes, hiç kimse, hiçbir şey, her şey; hiç mit verneintem Verb. | Kimse gelmedi. / Bir şey mi oldu? / Herkes hazır mı? | b1.e01 | b1.e02, b1.e16 | degil, di |
| `tr.g.zusammengesetzt` | Zusammengesetzte Vergangenheitsformen | -mişti (Vorvergangenheit), -ecekti (wollte gerade), -erdi (pflegte zu) für Erzählungen und Erinnerungen. | Biz gelmeden önce yemek bitmişti. / Tam çıkacaktım. / Dedem her akşam bahçeye bakardı. | b1.e01 | b1.e14, b2.e12, c1.e10 | idi, aorist, mis_grund |
| `tr.g.partizip_en` | Partizip -(y)en | Subjektbezogene Attribute statt Relativsatz: kitap okuyan çocuk (das Kind, das liest). | kitap okuyan kız / Wetzlar'da oturan teyzem / Gelen kim? | b1.e02 | b1.e03, b1.e16, b2.e12 | adjektiv, iyor |
| `tr.g.partizip_dik` | Partizip -dik mit Besitzendung | Objektbezogene Attribute: okuduğum kitap (das Buch, das ich lese/las). | oturduğumuz ev / Senin anlattığın film / Çalıştığı yer uzak. | b1.e03 | b1.e04, b1.e07, b1.e15, b2.e02 | partizip_en, possessiv |
| `tr.g.partizip_ecek` | Partizip -(y)ecek | Attribute mit Zukunftsbezug: gideceğimiz şehir, yarın gelecek misafirler. | gideceğimiz şehir / yarın gelecek misafirler / Okuyacak bir kitap arıyorum. | b1.e04 | b1.e08, b1.e16, b2.e03 | partizip_dik, ecek |
| `tr.g.konverb_ip` | Verbindung -(y)ip | Zwei Handlungen mit gleichem Subjekt: Zeit und Person stehen nur am letzten Verb. | Kalkıp pencereyi açtı. / Eve gidip dinleneceğim. / Oturup konuşalım. | b1.e04 | b1.e05, b1.e12, b1.e16 | di |
| `tr.g.konverb_erek_meden` | Art und Weise: -(y)erek, -meden | Wie? mit -(y)erek (indem) und -meden (ohne zu). | Yürüyerek gidiyoruz. / Düşünmeden cevap verme. / Gülerek anlattı. | b1.e05 | b1.e06, b1.e16 | konverb_ip |
| `tr.g.bedingung_se` | Bedingung mit -se (real) | Wenn/falls mit Aorist + -se (gelirsen) und -(y)se bei Nomen; Folge im Hauptsatz. | Yağmur yağarsa evde kalırız. / Vaktin varsa gel. / Kırmızı yanarsa dur. | b1.e06 | b1.e07, b1.e09, b1.e10, b1.e13 … | aorist |
| `tr.g.konverb_ince` | Sobald/als: -(y)ince | Zeitliche Folge: eve gelince (als/sobald ich nach Hause komme). | Eve gelince ara. / Zil çalınca çıktık. / Elif görünce sevindi. | b1.e07 | b1.e16 | konverb_ip |
| `tr.g.temporal_dik` | Zeitsätze: -dikten sonra, -meden önce, -diği zaman | Vor-, Nach- und Gleichzeitigkeit mit Verbformen + Verhältniswort; -diğinde als kurze Form. | Yemek yedikten sonra / Yatmadan önce dişlerini fırçala. / Geldiğinde haber ver. | b1.e07 | b1.e08, b1.e11, b1.e16 | partizip_dik, postpos_kasus |
| `tr.g.nominal_dik` | dass-Sätze mit -diğini/-eceğini | Inhaltssätze als Nominalform: geldiğini biliyorum; Grundlage der indirekten Rede. | Geç kalacağını söyledi. / Hasta olduğunu bilmiyordum. / Ne düşündüğünü anlıyorum. | b1.e08 | b1.e09, b1.e12, b2.e01 | partizip_dik, partizip_ecek |
| `tr.g.soru_dolayli` | Indirekte Fragen | Fragewort + -diğini/-eceğini bzw. -ip -mediğini: nerede olduğunu bilmiyorum. | Otobüsün ne zaman geleceğini biliyor musun? / Gelip gelmediğini sordu. / Nerede olduğunu bilmiyorum. | b1.e08 | b1.e11, b1.e16 | nominal_dik |
| `tr.g.kausal_dik` | Weil: -diği için, -diğinden | Begründung als Nominalform; daneben çünkü als Bindewort. | Hasta olduğu için gelmedi. / Geç kaldığımız için koştuk. / Yorulduğundan erken yattı. | b1.e09 | b1.e10, b1.e13 | partizip_dik |
| `tr.g.konverb_ken` | Während: -(y)ken | Gleichzeitigkeit mit -ken an Verben (Aorist, -iyor) und an Nomen. | Ben yemek yaparken sen masayı kur. / Çocukken İzmir'de oturuyordum. / Yolda yürürken düştü. | b1.e09 | b1.e16, b2.e04 | aorist, iyordu |
| `tr.g.bedingung_wunsch` | Wunsch mit -se und keşke | Wünsche und Vorschläge: keşke + -se, -se ya, -sek mi? | Keşke yaz gelse. / Biraz erken çıksak mı? / Bir çay içsek ya. | b1.e10 | b1.e14, c1.e09 | bedingung_se |
| `tr.g.mesi_nominal` | Nominalform -mesi | -me + Besitzendung als Subjekt oder Objekt: gelmesini istiyorum, doldurmanız gerekiyor. | Formu doldurmanız gerekiyor. / Erken gelmeni istiyorum. / Onun gelmesi önemli. | b1.e11 | b1.e12, b2.e04, b2.e05, c1.e01 | mek_nomen, possessiv |
| `tr.g.diye` | diye: Zitat und Absicht | diye leitet wörtliche Rede ein und drückt Absicht aus (… diye: damit, aus Sorge, dass). | „Geliyorum“ diye seslendi. / Geç kalmayayım diye erken çıktım. / Ne diye sordun? | b1.e12 | b1.e13, b1.e16, b2.e01, b2.e10 | optativ |
| `tr.g.konverb_dikce` | Je … desto: -dikçe | Fortschreitende Entwicklung und Wiederholung: okudukça (je mehr man liest). | Okudukça öğreniyorsun. / Hava ısındıkça buzlar eriyor. / Gördükçe seviniyorum. | b1.e13 | b1.e14, b2.e07 | partizip_dik |
| `tr.g.ise_nominal` | ise, yoksa, -(y)se am Nomen | Gegenüberstellung (ben ise, Elif ise), „sonst“ (yoksa) und Bedingung bei Nomen. | Ben ise evde kaldım. / Acele et, yoksa geç kalırız. / Evdeyse hemen gelsin. | b1.e13 | b1.e16 | bedingung_se |
| `tr.g.bedingung_irreal` | Unwirkliche Bedingung -seydi | Nicht eingetretene Bedingung: bilseydim gelirdim (hätte ich es gewusst, wäre ich gekommen). | Bilseydim gelirdim. / Telefon olmasaydı ne yapardık? / Erken kalksaydık yetişirdik. | b1.e14 | b1.e15 | bedingung_wunsch, zusammengesetzt |
| `tr.g.ki_konj` | ki als Bindewort | ki nach Verben des Sagens und Denkens und in Folge-Sätzen (o kadar … ki). | Öyle yorgundum ki hemen uyudum. / Biliyorum ki zor. / Dedi ki yarın gelecek. | b1.e15 | b1.e16, b2.e02 | konjunktionen |
| `tr.g.fokus_soru` | Betonung mit der Stellung von mi | mi steht hinter dem erfragten Satzteil: Sen mi geldin? / Dün mü geldin? / Geldin mi? | Sen mi pişirdin? / Dün mü geldiniz? / Çorba mı istersin, salata mı? | b1.e16 | c1.e12 | frage_mi, wortstellung |

### 5.5 B2 (20 Punkte)

| ID | Titel | Was gelernt wird | Beispiele | eingeführt | wiederholt in | Voraussetzung |
|---|---|---|---|---|---|---|
| `tr.g.evidential` | Evidentialität: -miş und -(y)miş | Gehörtes, Erschlossenes und Erzähltes: -mış an Verben und Nomen, auch in -iyormuş, -ecekmiş, -mişmiş; Abgrenzung zu -di. | Toplantı ertelenmiş. / Selin hastaymış. / Yarın kar yağacakmış. | b2.e01 | b2.e11, b2.e12, b2.e13, b2.e16 … | mis_grund, idi |
| `tr.g.rede_formal` | Berichtete Rede in Medien und Ämtern | Redeeinleitende Verben mit -diğini/-eceğini: belirtti, açıkladı, bildirdi; Zitatverben in Nachrichten. | Belediye yolun yarın açılacağını açıkladı. / Müdür okulun kapalı olduğunu bildirdi. / Uzmanlar dikkatli olunması gerektiğini belirtti. | b2.e01 | b2.e02, b2.e06, b2.e14, b2.e15 … | nominal_dik, evidential |
| `tr.g.passiv` | Passiv -il/-in | Passiv mit -il, nach Vokal und l mit -n/-in; unpersönliches Passiv für Regeln und Hinweise. | Başvurular internetten alınır. / Bu ev 1990'da yapıldı. / Burada yüksek sesle konuşulmaz. | b2.e02 | b2.e03, b2.e05, b2.e06, b2.e07 … | aorist, di |
| `tr.g.kausativ` | Veranlassen: -dir, -t, -ir | Kausativ für „lassen/veranlassen“: evi boyattık, saçımı kestirdim. | Mutfağı yeniden yaptırdık. / Arabayı tamir ettirdim. / Öğretmen bize metni okuttu. | b2.e03 | b2.e04, b2.e09 | passiv |
| `tr.g.reflexiv_reziprok` | Reflexiv- und Reziprokstämme | -in für Handlungen an sich selbst (giyinmek, yıkanmak), -iş für Gegenseitigkeit (görüşmek, yardımlaşmak). | Dedem kendi kendine giyiniyor. / Yarın görüşelim. / Komşular yardımlaşır. | b2.e04 | b2.e10, b2.e16 | passiv |
| `tr.g.modal_vermutung` | Vermutung: -ebilir, -miş olmalı, -iyor olabilir | Grade der Wahrscheinlichkeit mit Modalformen und olmak. | Yolda kalmış olmalılar. / Şu an çalışıyor olabilir. / Bu ilaç yan etki yapabilir. | b2.e04 | b2.e05, b2.e09, b2.e16, c1.e07 | ebil, meli_lazim, olmak_werden |
| `tr.g.konzessiv` | Einräumung: -se de, -mesine rağmen, -diği halde | Obwohl/auch wenn mit Nominal- und Bedingungsformen. | Yorgun olmasına rağmen yardım etti. / Geç kalsak da gideceğiz. / Anlattığım halde dinlemedi. | b2.e05 | b2.e06, b2.e13, b2.e16, c1.e07 | mesi_nominal, bedingung_se |
| `tr.g.kausal_formal` | Begründung im Schriftstil | -mesi nedeniyle, -den dolayı, -diğinden, sayesinde und yüzünden mit ihrer Wertung. | Bakım çalışması nedeniyle / Yoğun kar yüzünden / Komşular sayesinde | b2.e06 | b2.e07, b2.e13, b2.e16, c1.e02 | kausal_dik, mesi_nominal |
| `tr.g.bedingung_formal` | Bedingungen in Schreiben und Regeln | -diği takdirde, -mek şartıyla, -mediği sürece, -dikçe in Amts- und Vertragssprache. | Belge eksik olduğu takdirde / İzin alınmadığı sürece / Süresi içinde başvurmak şartıyla | b2.e06 | b2.e08, b2.e11, b2.e16, c1.e02 … | bedingung_se, partizip_dik |
| `tr.g.wortbildung2` | Wortbildung bei Verben und Adjektiven | -leş, -len, -laş (Werden), -sel/-sal, -msı/-ımsı, -ce/-ca (Art, Sprache) zum Erschließen neuer Wörter. | yeşillenmek, güzelleşmek / çevresel, bilimsel / yeşilimsi, ekşimsi | b2.e07 | b2.e16, c1.e06 | wortbildung1 |
| `tr.g.final_formal` | Absicht und Zweck im Schriftstil | -mek üzere, -sin diye, -mesi için, amacıyla. | Ödeme yapmak üzere bankaya gitti. / Herkes duysun diye yüksek sesle okudu. / Masrafları azaltmak amacıyla | b2.e08 | b2.e10, b2.e16, c1.e09 | mek_icin, mesi_nominal, diye |
| `tr.g.diathese_kombi` | Kombinierte Verbformen | Kausativ + Passiv und weitere Verbindungen: yaptırıldı, geliştirilmekte, düzenlettirilir. | Köprü yeniden yaptırıldı. / Yeni bir ilaç geliştirildi. / Bina boyatılacak. | b2.e09 | b2.e14 | kausativ, reflexiv_reziprok |
| `tr.g.zeitfolge_er_mez` | Unmittelbare Folge und Grenzen | -ir -mez (sobald), -(y)ene kadar (bis), -(y)eli (seit) für genaue Zeitfolgen. | Eve gelir gelmez aradı. / Toplantı bitene kadar bekledik. / Buraya taşınalı iki yıl oldu. | b2.e10 | b2.e16 | aorist, konverb_ince |
| `tr.g.dir_vermutung` | -dir: Feststellung und Vermutung | -dır als förmliche Feststellung in Texten und als Vermutung im Gespräch (Yorulmuştur.). | Kiracı aidatı ödemekle yükümlüdür. / Şimdiye kadar varmışlardır. / Toplantı saat onda başlayacaktır. | b2.e11 | b2.e16, c1.e08 | kopula, evidential |
| `tr.g.verdoppelung` | Verdoppelung und Verstärkung | yavaş yavaş, ince ince; m-Verdoppelung (kitap mitap); verstärkte Adjektive (masmavi, bembeyaz). | yavaş yavaş / masmavi deniz / Çay may içtik. | b2.e12 | b2.e16, c1.e05 | adjektiv |
| `tr.g.mis_gibi` | Als ob: -miş gibi, sanki | Vergleich mit Unwirklichem: -(i)yormuş gibi, -miş gibi, sanki … | Hiçbir şey olmamış gibi davrandı. / Sanki yıllardır tanışıyoruz. / Anlıyormuş gibi başını salladı. | b2.e13 | b2.e16, c1.e03 | evidential, gibi_kadar |
| `tr.g.konnektoren_b2` | Gegensatz und Einschränkung | oysa, halbuki, buna rağmen, yine de, madem, üstelik. | Oysa dün söz vermişti. / Madem vaktin var, yardım et. / Yine de denemek istiyorum. | b2.e13 | b2.e16, c1.e04 | konjunktionen, konzessiv |
| `tr.g.aspekt_iver` | Aspekt mit Hilfsverben | -iver (schnell, beiläufig), -edur (weiter), -ekal (erstarrt), -eyaz (beinahe). | Şunu bana veriver. / Sen başlayadur, ben geliyorum. / Düşeyazdım. | b2.e14 | b2.e16 | konverb_ip |
| `tr.g.statistik` | Mengen und Anteile ausdrücken | Prozent, Bruchteile und Verhältnisse in Texten: yüzde kırkı, her üç kişiden biri, yarısından fazlası. | Gençlerin yüzde altmışı / her üç kişiden biri / yarısından fazlası | b2.e15 | b2.e16, c1.e06 | zahlen_gross, possessiv |
| `tr.g.praeferenz` | Vorziehen und Ersetzen | -mektense, -mek yerine, -eceğine für Abwägung und Alternativen. | Beklemektense yürüyelim. / Araba yerine bisiklet / Şikâyet edeceğine bir öneri getir. | b2.e16 | c1.e14 | mek_nomen, partizip_ecek |

### 5.6 C1 (14 Punkte)

| ID | Titel | Was gelernt wird | Beispiele | eingeführt | wiederholt in | Voraussetzung |
|---|---|---|---|---|---|---|
| `tr.g.nominalstil` | Nominalstil | Verdichtung mit -me, -iş, -mişlik und Ketten von Nominalformen in Berichten und Protokollen. | Projenin zamanında tamamlanması / Toplantıya katılımın artırılması / Yeni düzenin uygulanışı | c1.e01 | c1.e02, c1.e06, c1.e14 | mesi_nominal, passiv |
| `tr.g.amtsstil` | Amtsstil: -mekte, -mıştır, -ılmaktadır | Förmliche Verlaufs- und Feststellungsformen in Bescheiden, Anleitungen und Berichten. | Başvurunuz incelenmektedir. / Ödeme alınmıştır. / Belgenin aslı istenmektedir. | c1.e02 | c1.e03, c1.e08, c1.e11, c1.e14 | dir_vermutung, diathese_kombi |
| `tr.g.partizip_komplex` | Lange Attribute | Mehrstufige Partizipialgruppen mit -mış olan, -ecek olan, -dığı söylenen; Lesen von rechts nach links. | geçen yıl açılmış olan kütüphane / yakında başlayacak olan çalışmalar / çok iyi olduğu söylenen kurs | c1.e03 | c1.e04, c1.e11, c1.e14 | partizip_ecek, rede_formal |
| `tr.g.umgangssprache` | Umgangssprache erkennen | Verkürzte Formen (n'aber, napıyorsun, geliyom), Füllwörter (falan, yani, şey) und Anreden unter Bekannten; nur verstehen und einordnen. | N'aber? / Ne yapıyorsun? – Napıyorsun? / Kitap falan aldım. | c1.e04 | c1.e05, c1.e13, c1.e14 | iyor |
| `tr.g.redewendungen` | Redewendungen | Feste Wendungen mit übertragener Bedeutung (deyimler) erkennen und passend einsetzen. | göz kulak olmak / eli kulağında / kulak vermek | c1.e05 | c1.e10, c1.e14 | possessiv |
| `tr.g.textkonnektoren` | Textverknüpfung | Absatz- und Satzverknüpfer: bununla birlikte, öte yandan, dolayısıyla, kaldı ki, nitekim, sonuç olarak. | Öte yandan / Dolayısıyla / Kaldı ki | c1.e06 | c1.e07, c1.e12, c1.e14 | konnektoren_b2 |
| `tr.g.argumentation` | Argumentieren und abwägen | -mekle birlikte, -mesi bakımından, -dığı ölçüde, -ip -mediği; Stellungnahme mit bence, kanımca, açıkçası. | Pahalı olmakla birlikte faydalı. / Çevre bakımından önemli / Kanımca bu öneri yerinde. | c1.e07 | c1.e09, c1.e13, c1.e14 | konzessiv, nominalstil |
| `tr.g.suspendierte_endung` | Gemeinsame Endungen in Reihungen | Eine Endung gilt für mehrere gereihte Wörter oder Verben: annem ve babamla; okunmuş ve onaylanmıştır. | öğretmen ve öğrencilerle / Metin okunmuş ve onaylanmıştır. / çalışkan ve dürüsttür | c1.e08 | c1.e11, c1.e14 | amtsstil |
| `tr.g.hoeflichkeit_strategien` | Höflichkeit und Abschwächung | Indirekte Bitten und vorsichtige Kritik: -ebilir miyiz acaba, -sek nasıl olur, sanırım, bence de … ama. | Acaba bir bakabilir misiniz? / Bunu yarın konuşsak nasıl olur? / Sanırım küçük bir yanlışlık olmuş. | c1.e09 | c1.e12, c1.e14 | aorist_bitte, bedingung_wunsch, modal_vermutung |
| `tr.g.sprichwoerter` | Sprichwörter | Weltliche Sprichwörter (atasözleri) verstehen, ihre Botschaft erklären und sparsam zitieren. | Damlaya damlaya göl olur. / Bir elin nesi var, iki elin sesi var. / Ağaç yaşken eğilir. | c1.e10 | c1.e14 | redewendungen |
| `tr.g.zarf_cesine` | Vergleichende Umstandsformen | -cesine/-mışçasına (als ob, gleichsam) und -casına in gehobenen Texten. | Koşarcasına yürüdü. / Hiç duymamışçasına devam etti. / Çocukçasına sevindi. | c1.e10 | c1.e14 | mis_gibi |
| `tr.g.lehnmuster` | Muster der Schriftsprache aus Lehnwörtern | Adverbien auf -en/-an (tamamen, kısmen, nispeten), feste Fügungen mit -ı (hüsnü kabul) und Wortfamilien aus Lehnwörtern; für Arabischsprachige mit Kontrast-Tipps zu Bedeutungsunterschieden. | tamamen, kısmen, nispeten / itibaren, rağmen / hukuk, hukuki | c1.e11 | c1.e14 | wortbildung2 |
| `tr.g.fokus_devrik` | Wortstellung, Fokus und Nachfeld | Betonung durch die Stelle vor dem Verb; Nachfeld (devrik cümle) im Gespräch und in Texten. | Bunu ben söylemedim. / Geldi mi senin kardeşin? / Gidiyorum ben. | c1.e12 | c1.e13, c1.e14 | fokus_soru |
| `tr.g.partikel_nuancen` | Abtönungspartikeln | Feinheiten von da/de, ki, ya, bile, işte, hani, ya … ya in Gesprächen. | Hani bana söz vermiştin? / Ben bile anladım. / İşte böyle. | c1.e13 | c1.e14 | ki_konj |

## 6 Einheiten

Spalte „Grammatik“: **fett** = in dieser Einheit eingeführt, sonst Wiederholung. Budget = neue Lemmata der Einheit (Summe je Stufe = Stufenbudget). L/Sp/Sch = Lesetexte, Sprech- und Schreibaufgaben.

### A1 (12 Einheiten, 600 Lemmata)

| Schlüssel | Titel | Thema | Grammatik | Wortfelder | Budget | L/Sp/Sch |
|---|---|---|---|---|---|---|
| tr.a1.e01 | Merhaba, ben Elif | Begrüßung und Vorstellung | **personalpron**, **kopula** | Grüßen und Verabschieden (weltlich), Sich vorstellen, Befinden, Länder und Sprachen | 40 | 0/2/0 |
| tr.a1.e02 | Was ist das? | Schule und Lernen | **vokalharmonie**, **bu_su_o**, **frage_mi**, kopula | Schulsachen, Im Klassenzimmer, Farben | 45 | 1/2/0 |
| tr.a1.e03 | Meine Familie | Familie und Verwandte | **plural**, **zahlen**, **degil**, kopula, vokalharmonie | Familie (engster Kreis), Zahlen bis hundert, Berufe (Grundwortschatz) | 50 | 0/2/0 |
| tr.a1.e04 | Bei uns zu Hause | Wohnen | **var_yok**, **possessiv**, plural, frage_mi | Räume, Möbel und Gegenstände im Haus, Haustiere und Tiere in der Nähe | 50 | 1/2/0 |
| tr.a1.e05 | In der Stadt | Stadt und Orientierung | **lokativ**, **eigenname_apostroph**, **fragewoerter**, **adjektiv**, var_yok, degil | Orte in der Stadt, Grundadjektive | 50 | 0/2/0 |
| tr.a1.e06 | Mein Tag | Zahlen, Uhrzeit, Datum | **iyor**, **wortstellung**, lokativ, fragewoerter | Tagesablauf, Wochentage, Tageszeiten | 50 | 1/2/0 |
| tr.a1.e07 | Auf dem Wochenmarkt | Einkaufen und Preise | **akkusativ**, **konsonant**, iyor, zahlen, adjektiv | Obst und Gemüse, Einkaufen (Grundwortschatz), Farben | 50 | 0/2/0 |
| tr.a1.e08 | Unterwegs in Wetzlar | Verkehr und Unterwegssein | **dativ**, **ablativ**, lokativ, eigenname_apostroph, iyor | Verkehrsmittel, Weg und Richtung | 50 | 1/2/0 |
| tr.a1.e09 | Wie spät ist es? | Schule und Lernen | **uhrzeit**, **genitiv**, possessiv, zahlen, dativ | Uhrzeit, Schulfächer und Stundenplan, Schulsachen | 55 | 0/2/0 |
| tr.a1.e10 | Zu Gast bei Oma Sevim | Essen und Trinken (halal-neutral) | **imperativ**, **raum_postpos**, akkusativ, genitiv, konsonant | Essen (halal-neutral, Fleischart genannt), Getränke, Am Tisch | 55 | 1/2/0 |
| tr.a1.e11 | Sonne, Regen, Freizeit | Wetter und Jahreszeiten | **ile**, **mek_istemek**, imperativ, dativ, iyor | Wetter, Kleidung (Grundwortschatz), Freizeit (ohne Musik) | 55 | 0/2/0 |
| tr.a1.e12 | Beim Kinderarzt | Körper und Gesundheit | **nominalkompositum**, Wiederholung von 19 Punkten der Stufe | Körperteile (ohne Intimbereich), Leichte Beschwerden, Gefühle (Grundwortschatz) | 50 | 1/2/0 |

### A2 (14 Einheiten, 900 Lemmata)

| Schlüssel | Titel | Thema | Grammatik | Wortfelder | Budget | L/Sp/Sch |
|---|---|---|---|---|---|---|
| tr.a2.e01 | Mein Wochenende | Hobbys und Freizeit (ohne Musik) | **di**, **idi**, dativ, ile, var_yok | Freizeit und Ausflüge, Zeitangaben für Vergangenes, Freizeit (ohne Musik) | 60 | 1/2/1 |
| tr.a2.e02 | Ein Termin beim Bürgeramt | Behörden und Formulare | **uhrzeit_genau**, **ordinal**, **anrede**, uhrzeit, di, genitiv | Auf dem Amt (Grundwortschatz), Monate und Datum, Persönliche Angaben | 60 | 1/2/1 |
| tr.a2.e03 | Ferienpläne | Reisen und Besuch | **ecek**, **optativ**, mek_istemek, dativ, ablativ | Reisen (Grundwortschatz), Landschaft | 62 | 1/2/1 |
| tr.a2.e04 | Gute Nachbarschaft | Nachbarschaft | **aorist**, **aorist_bitte**, anrede, optativ, imperativ | Haus und Nachbarschaft, Hilfe und Bitten, Häufigkeit | 62 | 1/2/1 |
| tr.a2.e05 | Welche Jacke ist schöner? | Kleidung | **komparativ**, **gibi_kadar**, aorist_bitte, akkusativ, ablativ | Kleidung kaufen, Stoffe und Muster, Im Geschäft | 64 | 1/2/1 |
| tr.a2.e06 | Was kannst du gut? | Sport | **ebil**, **mek_nomen**, aorist, di, komparativ | Sport, Fähigkeiten | 64 | 1/2/1 |
| tr.a2.e07 | Ich fühle mich nicht gut | Körper und Gesundheit | **meli_lazim**, **wortbildung1**, nominalkompositum, mek_nomen, idi | Beim Arzt, Beschwerden, Eigenschaften von Lebensmitteln, Körperteile (ohne Intimbereich) | 64 | 1/2/1 |
| tr.a2.e08 | Lernen für die Klassenarbeit | Schule und Lernen | **postpos_kasus**, **mek_icin**, meli_lazim, ecek, uhrzeit_genau | Lernen und Prüfungen, Schulalltag, Schulfächer und Stundenplan | 64 | 1/2/1 |
| tr.a2.e09 | Die große Familie | Familie und Verwandte | **konjunktionen**, **kendi**, genitiv, gibi_kadar, aorist | Verwandte (mütterliche und väterliche Seite), Charakter, Familie (engster Kreis) | 66 | 1/2/1 |
| tr.a2.e10 | Was ist denn hier passiert? | Natur und Umwelt | **mis_grund**, di, konjunktionen, lokativ | Natur, Wettererscheinungen, Wetter | 66 | 1/2/1 |
| tr.a2.e11 | Umzug in eine neue Wohnung | Wohnen | **iyordu**, **dir_dauer**, idi, mis_grund, optativ | Wohnung und Umzug, Haushalt (alle helfen), Möbel und Gegenstände im Haus | 66 | 1/2/1 |
| tr.a2.e12 | Was willst du werden? | Arbeit und Berufe | **ki_attribut**, **olmak_werden**, mek_istemek, ecek, konjunktionen | Berufe, Am Arbeitsplatz, Berufe (Grundwortschatz) | 66 | 1/2/1 |
| tr.a2.e13 | Eine Hochzeit in der Familie | Familienfeste | **imperativ3**, ecek, ki_attribut, aorist_bitte, dir_dauer | Familienfeste, Glückwünsche und gute Wünsche (weltlich), Verwandte (mütterliche und väterliche Seite) | 68 | 1/2/1 |
| tr.a2.e14 | Paket, Konto, Rechnung | Bank und Post | **zahlen_gross**, Wiederholung von 11 Punkten der Stufe | Post, Geld und Zahlen, Telefon und Internet | 68 | 1/2/1 |

### B1 (16 Einheiten, 1.300 Lemmata)

| Schlüssel | Titel | Thema | Grammatik | Wortfelder | Budget | L/Sp/Sch |
|---|---|---|---|---|---|---|
| tr.b1.e01 | Als Oma jung war | Familie und Verwandte | **indefinit**, **zusammengesetzt**, iyordu, mis_grund, dir_dauer | Erinnerungen, Lebensstationen, Verwandte (mütterliche und väterliche Seite) | 76 | 2/2/1 |
| tr.b1.e02 | Neue Kolleginnen und Kollegen | Arbeit und Berufe | **partizip_en**, ki_attribut, aorist, indefinit | Arbeitsalltag, Personen neutral beschreiben, Am Arbeitsplatz | 78 | 2/2/1 |
| tr.b1.e03 | Wir suchen eine Wohnung | Wohnen | **partizip_dik**, partizip_en, komparativ, meli_lazim | Wohnungssuche, Wohnlage, Wohnung und Umzug | 78 | 2/2/1 |
| tr.b1.e04 | Eine Reise nach Kappadokien | Reisen und Besuch | **partizip_ecek**, **konverb_ip**, partizip_dik, ecek, optativ | Reise planen, Sehenswürdigkeiten, Landschaft | 80 | 2/2/1 |
| tr.b1.e05 | Gesund bleiben | Körper und Gesundheit | **konverb_erek_meden**, konverb_ip, meli_lazim, wortbildung1 | Gesund bleiben, Ernährung, Eigenschaften von Lebensmitteln | 80 | 2/2/1 |
| tr.b1.e06 | Der Führerschein | Verkehr und Unterwegssein | **bedingung_se**, konverb_erek_meden, meli_lazim, imperativ | Straßenverkehr, Regeln und Sicherheit | 80 | 2/2/1 |
| tr.b1.e07 | Elternabend | Schule und Lernen | **konverb_ince**, **temporal_dik**, bedingung_se, postpos_kasus, partizip_dik | Schule und Eltern, Abläufe beschreiben, Lernen und Prüfungen | 80 | 2/2/1 |
| tr.b1.e08 | Was steht in den Nachrichten? | Medien und Digitales (sachlich) | **nominal_dik**, **soru_dolayli**, partizip_ecek, temporal_dik, mis_grund | Nachrichten, Sicher im Netz, Telefon und Internet | 82 | 2/2/1 |
| tr.b1.e09 | Ärger im Treppenhaus | Nachbarschaft | **kausal_dik**, **konverb_ken**, aorist_bitte, bedingung_se, nominal_dik | Hausordnung, Streit friedlich lösen, Haus und Nachbarschaft | 82 | 2/2/1 |
| tr.b1.e10 | Wenn ich mir etwas wünschen könnte | Gefühle und Freundschaft | **bedingung_wunsch**, bedingung_se, kausal_dik, konjunktionen | Gefühle ausdrücken, Freundschaft, Gefühle (Grundwortschatz) | 82 | 2/2/1 |
| tr.b1.e11 | Formulare ausfüllen | Behörden und Formulare | **mesi_nominal**, mek_nomen, temporal_dik, soru_dolayli | Formulare und Unterlagen, Auf dem Amt (Grundwortschatz), Persönliche Angaben | 82 | 2/2/1 |
| tr.b1.e12 | Ehrenamt im Verein | Ehrenamt | **diye**, nominal_dik, mesi_nominal, konverb_ip | Ehrenamt, Organisieren | 82 | 2/2/1 |
| tr.b1.e13 | Wenn es wärmer wird | Natur und Umwelt | **konverb_dikce**, **ise_nominal**, bedingung_se, kausal_dik, diye | Umwelt im Alltag, Jahreszeiten und Natur im Wandel, Natur | 84 | 2/2/1 |
| tr.b1.e14 | Erfindungen, die alles verändert haben | Wissenschaft und Technik | **bedingung_irreal**, bedingung_wunsch, zusammengesetzt, konverb_dikce | Technik und Erfindungen, Wissenschaft (Grundwortschatz) | 84 | 2/2/1 |
| tr.b1.e15 | Mein erstes Praktikum | Ausbildung und Bewerbung | **ki_konj**, partizip_dik, mek_icin, bedingung_irreal | Bewerbung und Praktikum, Stärken im Beruf | 84 | 2/2/1 |
| tr.b1.e16 | Wir kochen für Gäste | Essen und Trinken (halal-neutral) | **fokus_soru**, Wiederholung von 12 Punkten der Stufe | Kochen, Gerichte (Fleischart genannt), Essen (halal-neutral, Fleischart genannt) | 86 | 2/2/1 |

### B2 (16 Einheiten, 1.700 Lemmata)

| Schlüssel | Titel | Thema | Grammatik | Wortfelder | Budget | L/Sp/Sch |
|---|---|---|---|---|---|---|
| tr.b2.e01 | Nachrichten richtig lesen | Medien und Digitales (sachlich) | **evidential**, **rede_formal**, nominal_dik, mis_grund, diye | Presse und Quellen, Berichtsverben, Nachrichten | 100 | 3/2/2 |
| tr.b2.e02 | Bewerbung und Vorstellungsgespräch | Ausbildung und Bewerbung | **passiv**, rede_formal, ki_konj, partizip_dik | Bewerbungsverfahren, Kompetenzen, Bewerbung und Praktikum | 102 | 3/2/2 |
| tr.b2.e03 | Renovieren lassen | Wohnen | **kausativ**, passiv, partizip_ecek, bedingung_se | Renovieren, Reparieren und Messen, Wohnung und Umzug | 104 | 3/2/2 |
| tr.b2.e04 | Pflege in der Familie | Körper und Gesundheit | **reflexiv_reziprok**, **modal_vermutung**, kausativ, mesi_nominal, konverb_ken | Pflege und Versorgung, Gesundheitswesen, Beim Arzt | 104 | 3/2/2 |
| tr.b2.e05 | Zusammenarbeit im Team | Arbeit und Berufe | **konzessiv**, modal_vermutung, passiv, mesi_nominal | Teamarbeit, Arbeitswelt, Arbeitsalltag | 106 | 3/2/2 |
| tr.b2.e06 | Post vom Amt | Behörden und Formulare | **kausal_formal**, **bedingung_formal**, passiv, rede_formal, konzessiv | Amtliche Schreiben, Verfahren, Formulare und Unterlagen | 106 | 3/2/2 |
| tr.b2.e07 | Grüne Stadt | Natur und Umwelt | **wortbildung2**, passiv, konverb_dikce, kausal_formal | Grüne Stadt, Nachhaltigkeit, Umwelt im Alltag | 106 | 3/2/2 |
| tr.b2.e08 | Konto, Karte, Kosten | Bank und Post | **final_formal**, zahlen_gross, bedingung_formal, passiv | Bankgeschäfte (ohne Zinsprodukte), Haushaltsbudget, Geld und Zahlen | 106 | 3/2/2 |
| tr.b2.e09 | Wie Medikamente entstehen | Wissenschaft und Technik | **diathese_kombi**, passiv, kausativ, modal_vermutung | Forschung und Medizin, Digitale Technik, Wissenschaft (Grundwortschatz) | 106 | 3/2/2 |
| tr.b2.e10 | Freiwillig helfen | Ehrenamt | **zeitfolge_er_mez**, diye, final_formal, reflexiv_reziprok | Gemeinsinn, Organisieren, Ehrenamt | 108 | 3/2/2 |
| tr.b2.e11 | Der Mietvertrag | Verträge und Rechte | **dir_vermutung**, bedingung_formal, passiv, evidential | Mietvertrag, Rechte und Pflichten, Wohnungssuche | 108 | 3/2/2 |
| tr.b2.e12 | Alte Handwerke | Geschichte und Kultur | **verdoppelung**, evidential, zusammengesetzt, partizip_en | Traditionelles Handwerk, Museum und Ausstellung | 108 | 3/2/2 |
| tr.b2.e13 | Generationen und Sprachen | Zusammenleben | **mis_gibi**, **konnektoren_b2**, konzessiv, evidential, kausal_formal | Zusammenleben, Mehrsprachigkeit | 108 | 3/2/2 |
| tr.b2.e14 | Wie eine Gemeinde arbeitet | Staat und Gemeinde (sachlich) | **aspekt_iver**, passiv, diathese_kombi, rede_formal | Gemeinde und Verwaltung, Recht (Grundbegriffe) | 108 | 3/2/2 |
| tr.b2.e15 | Zahlen, die etwas sagen | Medien und Digitales (sachlich) | **statistik**, zahlen_gross, rede_formal, komparativ | Umfragen und Statistik, Grafiken beschreiben, Sicher im Netz | 110 | 3/2/2 |
| tr.b2.e16 | Eine eigene Werkstatt | Arbeit und Berufe | **praeferenz**, Wiederholung von 15 Punkten der Stufe | Selbstständig arbeiten, Abwägen und Entscheiden, Berufe | 110 | 3/2/2 |

### C1 (14 Einheiten, 2.000 Lemmata)

| Schlüssel | Titel | Thema | Grammatik | Wortfelder | Budget | L/Sp/Sch |
|---|---|---|---|---|---|---|
| tr.c1.e01 | Protokoll einer Besprechung | Arbeit und Berufe | **nominalstil**, mesi_nominal, passiv, rede_formal | Besprechung und Protokoll, Nomen des Schriftstils, Teamarbeit | 136 | 4/2/2 |
| tr.c1.e02 | Der Bescheid | Behörden und Formulare | **amtsstil**, bedingung_formal, kausal_formal, nominalstil | Amtssprache, Fristen, Amtliche Schreiben | 138 | 4/2/2 |
| tr.c1.e03 | Meinung in der Zeitung | Medien und Digitales (sachlich) | **partizip_komplex**, evidential, amtsstil, mis_gibi | Kommentar und Meinung, Stil und Wirkung, Presse und Quellen | 140 | 4/2/2 |
| tr.c1.e04 | Zwischen den Generationen | Zusammenleben | **umgangssprache**, anrede, konnektoren_b2, partizip_komplex | Anrede und Nähe, Familie und Generationen, Zusammenleben | 140 | 4/2/2 |
| tr.c1.e05 | Bilder in der Sprache | Geschichte und Kultur | **redewendungen**, verdoppelung, umgangssprache, possessiv | Wendungen mit Körperwörtern, Wendungen des Alltags | 142 | 4/2/2 |
| tr.c1.e06 | Energie für morgen | Natur und Umwelt | **textkonnektoren**, nominalstil, wortbildung2, statistik | Energie, Klima (sachlich), Nachhaltigkeit | 142 | 4/2/2 |
| tr.c1.e07 | Forschung erklären | Wissenschaft und Technik | **argumentation**, textkonnektoren, modal_vermutung, konzessiv | Wissenschaftliches Arbeiten, Argumentieren, Forschung und Medizin | 142 | 4/2/2 |
| tr.c1.e08 | Das Kleingedruckte | Verträge und Rechte | **suspendierte_endung**, amtsstil, bedingung_formal, dir_vermutung | Verbraucherrechte, Vertragssprache, Mietvertrag | 144 | 4/2/2 |
| tr.c1.e09 | Ein Projekt vorstellen | Ehrenamt | **hoeflichkeit_strategien**, argumentation, final_formal, bedingung_wunsch | Projekt vorstellen, Höflich verhandeln, Gemeinsinn | 144 | 4/2/2 |
| tr.c1.e10 | Erzählen und Erzähltes | Geschichte und Kultur | **sprichwoerter**, **zarf_cesine**, redewendungen, evidential, zusammengesetzt | Literatur, Sprichwort und Lebenserfahrung | 144 | 4/2/2 |
| tr.c1.e11 | Grundrechte im Alltag | Staat und Gemeinde (sachlich) | **lehnmuster**, amtsstil, partizip_komplex, suspendierte_endung | Grundrechte (sachlich), Gericht und Verfahren, Recht (Grundbegriffe) | 144 | 4/2/2 |
| tr.c1.e12 | Sprache und Wirkung | Medien und Digitales (sachlich) | **fokus_devrik**, fokus_soru, textkonnektoren, hoeflichkeit_strategien | Reden und Wirkung, Stilmittel | 146 | 4/2/2 |
| tr.c1.e13 | Diskutieren mit Gefühl | Zusammenleben | **partikel_nuancen**, umgangssprache, argumentation, fokus_devrik | Diskutieren, Gesprächswörter | 148 | 4/2/2 |
| tr.c1.e14 | Rückblick und Ausblick | Arbeit und Berufe | Wiederholung von 15 Punkten der Stufe | Weiterbildung und Ziele, Abwägen und Entscheiden, Mehrsprachigkeit | 150 | 4/2/2 |

### 6.1 Themenspirale

Die Themen stammen aus dem Leitfaden (§3, `themen[].id`); jede Einheit trägt ein Hauptthema, ihre Wortfelder greifen Nachbarthemen auf. Familie, Wohnen, Gesundheit, Schule, Arbeit, Natur und Medien kehren auf höheren Stufen mit größerem Wortschatz und anspruchsvolleren Aufgaben wieder.

| Thema (Leitfaden) | Einheiten |
|---|---|
| Begrüßung und Vorstellung | a1.e01 |
| Familie und Verwandte | a1.e03, a2.e09, b1.e01 |
| Zahlen, Uhrzeit, Datum | a1.e06 |
| Wetter und Jahreszeiten | a1.e11 |
| Wohnen | a1.e04, a2.e11, b1.e03, b2.e03 |
| Einkaufen und Preise | a1.e07 |
| Essen und Trinken (halal-neutral) | a1.e10, b1.e16 |
| Kleidung | a2.e05 |
| Körper und Gesundheit | a1.e12, a2.e07, b1.e05, b2.e04 |
| Schule und Lernen | a1.e02, a1.e09, a2.e08, b1.e07 |
| Arbeit und Berufe | a2.e12, b1.e02, b2.e05, b2.e16, c1.e01, c1.e14 |
| Verkehr und Unterwegssein | a1.e08, b1.e06 |
| Behörden und Formulare | a2.e02, b1.e11, b2.e06, c1.e02 |
| Bank und Post | a2.e14, b2.e08 |
| Stadt und Orientierung | a1.e05 |
| Natur und Umwelt | a2.e10, b1.e13, b2.e07, c1.e06 |
| Sport | a2.e06 |
| Hobbys und Freizeit (ohne Musik) | a2.e01 |
| Medien und Digitales (sachlich) | b1.e08, b2.e01, b2.e15, c1.e03, c1.e12 |
| Reisen und Besuch | a2.e03, b1.e04 |
| Nachbarschaft | a2.e04, b1.e09 |
| Ehrenamt | b1.e12, b2.e10, c1.e09 |
| Familienfeste | a2.e13 |
| Gefühle und Freundschaft | b1.e10 |
| Ausbildung und Bewerbung | b1.e15, b2.e02 |
| Verträge und Rechte | b2.e11, c1.e08 |
| Zusammenleben | b2.e13, c1.e04, c1.e13 |
| Wissenschaft und Technik | b1.e14, b2.e09, c1.e07 |
| Geschichte und Kultur | b2.e12, c1.e05, c1.e10 |
| Staat und Gemeinde (sachlich) | b2.e14, c1.e11 |

Als Hauptthema nicht vergeben, aber in Wortfeldern anderer Einheiten enthalten: Tiere.

### 6.2 Geschichten und Aufgaben je Einheit

#### A1

**tr.a1.e01 – Merhaba, ben Elif**

- Kann: Ich kann auf Türkisch grüßen, mich mit Namen vorstellen und mich verabschieden. Ich kann fragen, wie es jemandem geht, und kurz antworten. Ich kann sagen, welche Sprachen ich spreche und woher meine Familie kommt.
- Sprechhandlungen: grüßen und sich verabschieden, sich und andere vorstellen, nach dem Befinden fragen, Herkunft und Sprachen nennen
- Geschichte: Erster Tag im Türkischkurs am Samstagvormittag in Wetzlar; Elif (11) stellt sich vor, Lehrerin Ayla begrüßt die Gruppe, Rīm und Lena sagen, welche Sprachen sie sprechen. Dialog (Lektion): Can (14) trifft vor der Schule die neue Mitschülerin Selin und fragt, wie es ihr geht. Ort: Kursraum, Schulhof.
- Lesen: –
- Sprechen: 1) Sich in drei Sätzen vorstellen (Name, Wohnort, Sprachen). 2) Ein Begrüßungsgespräch nachsprechen und mit eigenem Namen wiederholen.
- Schreiben: –
- Gesperrte Kandidaten: F-tr-01, F-tr-03, F-tr-07

**tr.a1.e02 – Was ist das?**

- Kann: Ich kann Gegenstände im Klassenzimmer benennen und nach ihnen fragen. Ich kann mit Ja-Nein-Fragen nachfragen, ob ich etwas richtig verstanden habe. Ich kann Farben von Dingen nennen.
- Sprechhandlungen: auf Dinge zeigen und sie benennen, Ja-Nein-Fragen stellen und beantworten, um etwas bitten (Kalem verir misin? als feste Wendung)
- Geschichte: Elif hat ihr Mäppchen vergessen; Rīm und Jan leihen ihr Stift und Radiergummi und fragen nach den Farben. Dialog (Lektion): Lehrerin Ayla zeigt auf Dinge, die Kinder raten. Ort: Klassenzimmer.
- Lesen: Beschriftete Regalfächer im Klassenzimmer (Wörter und kurze Sätze).
- Sprechen: 1) Fünf Gegenstände auf dem eigenen Tisch benennen. 2) Mit bu/şu fragen und antworten: Bu ne? – Bu bir defter.
- Schreiben: –

**tr.a1.e03 – Meine Familie**

- Kann: Ich kann meine Familie vorstellen und sagen, wie alt jemand ist. Ich kann bis hundert zählen und Zahlen verstehen. Ich kann sagen, was jemand von Beruf ist und was nicht.
- Sprechhandlungen: Familienmitglieder vorstellen, nach dem Alter fragen, Berufe nennen, etwas verneinen
- Geschichte: Can zeigt Jan Fotos am Tablet: Mutter Derya ist Ingenieurin, Vater Murat Busfahrer und kocht gern, Oma Sevim und Opa Metin wohnen in İzmir. Dialog (Lektion): Elif fragt Rīm nach ihren Geschwistern und deren Alter. Ort: Wohnzimmer von Elifs Familie.
- Lesen: –
- Sprechen: 1) Die eigene Familie mit Alter und Beruf vorstellen (Bild oder Skizze). 2) Zahlen diktieren lassen und laut zurücksagen.
- Schreiben: –

**tr.a1.e04 – Bei uns zu Hause**

- Kann: Ich kann sagen, welche Räume und Möbel es in meiner Wohnung gibt. Ich kann sagen, was ich habe und was mir fehlt. Ich kann über ein Haustier sprechen.
- Sprechhandlungen: Wohnung beschreiben, sagen, was es gibt und was nicht, Besitz ausdrücken
- Geschichte: Cousine Defne ruft per Video aus İzmir an; Elif führt sie durch die Wohnung und zeigt die Katze Pamuk. Dialog (Lektion): Can sucht sein Ladegerät, Vater Murat fragt, ob es im Zimmer ist. Ort: Wohnung in Wetzlar.
- Lesen: Kurze Wohnungsbeschreibung in einer Nachricht von Defne (fünf Sätze mit var/yok).
- Sprechen: 1) Das eigene Zimmer beschreiben: Was gibt es, was gibt es nicht? 2) Fragen und antworten: Senin odan var mı? Kaç odanız var?
- Schreiben: –

**tr.a1.e05 – In der Stadt**

- Kann: Ich kann sagen, wo jemand ist und wo etwas liegt. Ich kann Orte in der Stadt benennen und mit einfachen Adjektiven beschreiben. Ich kann fragen, wo jemand wohnt.
- Sprechhandlungen: nach dem Ort fragen, sagen, wo man ist, Orte beschreiben
- Geschichte: Samstagsrunde durch die Altstadt von Wetzlar; Elif und Lena suchen die Bibliothek, Can wartet am Brunnen. Dialog (Lektion): Rīm fragt am Telefon: Neredesin? – Fırındayım. Ort: Altstadt, Bäckerei, Bibliothek.
- Lesen: –
- Sprechen: 1) Sagen, wo die eigene Familie gerade ist (fünf Sätze mit -de/-da). 2) Den eigenen Wohnort mit zwei Adjektiven beschreiben.
- Schreiben: –

**tr.a1.e06 – Mein Tag**

- Kann: Ich kann sagen, was ich gerade mache und was ich jeden Tag mache. Ich kann Wochentage und Tageszeiten nennen. Ich kann einfache Sätze mit dem Verb am Ende bilden.
- Sprechhandlungen: Tagesablauf beschreiben, über laufende Handlungen sprechen, Wochentage und Tageszeiten nennen
- Geschichte: Ein Montag bei Elifs Familie: Vater Murat macht Frühstück, Mutter Derya fährt zur Arbeit, Elif und Can gehen zur Schule, abends ruft Oma Sevim an. Dialog (Lektion): Can und Jan verabreden sich und fragen: Ne yapıyorsun? Ort: Küche, Schulweg.
- Lesen: Elifs Wochenplan als Liste mit Tageszeiten.
- Sprechen: 1) Den eigenen Tagesablauf in sechs Sätzen erzählen. 2) Bildfolge beschreiben: Was macht die Person gerade?
- Schreiben: –

**tr.a1.e07 – Auf dem Wochenmarkt**

- Kann: Ich kann auf dem Markt Obst und Gemüse verlangen und nach dem Preis fragen. Ich kann ein bestimmtes Ding von einem beliebigen unterscheiden (elma / elmayı). Ich kann Mengen und Preise verstehen.
- Sprechhandlungen: etwas verlangen, nach dem Preis fragen, Mengen angeben, sich bedanken
- Geschichte: Vater Murat und Elif kaufen auf dem Wochenmarkt ein; Händlerin Gül empfiehlt Tomaten, Elif wählt die roten Äpfel. Dialog (Lektion): Can kauft am Kiosk zwei Brötchen und fragt nach dem Preis. Ort: Wochenmarkt, Kiosk.
- Lesen: –
- Sprechen: 1) Einkaufsgespräch spielen: drei Dinge verlangen und nach dem Preis fragen. 2) Den Einkaufszettel der Familie vorlesen und Mengen nennen.
- Schreiben: –

**tr.a1.e08 – Unterwegs in Wetzlar**

- Kann: Ich kann sagen, wohin ich gehe und woher ich komme. Ich kann nach dem Weg fragen und einfache Wegbeschreibungen verstehen. Ich kann Verkehrsmittel nennen.
- Sprechhandlungen: nach dem Weg fragen, Richtungen angeben, Ziel und Herkunft nennen
- Geschichte: Can bringt Gast Kerem vom Bahnhof zum Haus; sie nehmen den Bus und fragen eine Passantin nach der Haltestelle. Dialog (Lektion): Elif fragt Nachbar Jan, wie sie zum Schwimmbad kommt. Ort: Bahnhof, Bushaltestelle.
- Lesen: Fahrplanaushang an der Haltestelle mit Linie, Ziel und Uhrzeit.
- Sprechen: 1) Den eigenen Schulweg beschreiben (von wo, wohin, womit). 2) Nach dem Weg fragen und eine kurze Antwort geben.
- Schreiben: –

**tr.a1.e09 – Wie spät ist es?**

- Kann: Ich kann die Uhrzeit fragen und volle und halbe Stunden angeben. Ich kann meinen Stundenplan vorstellen. Ich kann sagen, wem etwas gehört.
- Sprechhandlungen: nach der Uhrzeit fragen, Termine angeben, Besitz mit Namen ausdrücken
- Geschichte: Elifs Wecker klingelt nicht; Can schaut auf die Uhr, beide schaffen es noch zur ersten Stunde. Dialog (Lektion): Rīm und Elif vergleichen ihre Stundenpläne und fragen: Matematik saat kaçta? Ort: Wohnung, Schule.
- Lesen: –
- Sprechen: 1) Den eigenen Stundenplan für zwei Tage vorstellen. 2) Uhrzeiten auf Bildkarten ansagen.
- Schreiben: –

**tr.a1.e10 – Zu Gast bei Oma Sevim**

- Kann: Ich kann bei Tisch um etwas bitten und etwas anbieten. Ich kann sagen, was ich gern esse und trinke. Ich kann einfache Aufforderungen verstehen und geben.
- Sprechhandlungen: etwas anbieten und annehmen, um etwas bitten, auffordern, Vorlieben beim Essen nennen
- Geschichte: Sommerferien in İzmir; Oma Sevim deckt den Tisch, Elif holt die Gläser aus dem Schrank, Opa Metin schenkt Ayran ein. Dialog (Lektion): Can fragt: Tuz nerede? – Masanın üstünde. Ort: Küche und Balkon in İzmir.
- Lesen: Speiseplan der Woche an Omas Kühlschrank (Gerichte mit Fleischart).
- Sprechen: 1) Am Tisch drei Bitten und zwei Angebote formulieren. 2) Sagen, wo Dinge auf dem Tisch stehen.
- Schreiben: –
- Gesperrte Kandidaten: F-tr-02

**tr.a1.e11 – Sonne, Regen, Freizeit**

- Kann: Ich kann das Wetter beschreiben und passende Kleidung nennen. Ich kann sagen, was ich in der Freizeit machen möchte. Ich kann sagen, mit wem und womit ich etwas mache.
- Sprechhandlungen: über das Wetter sprechen, Wünsche äußern, Freizeit planen, Begleitung und Mittel nennen
- Geschichte: Zurück in Wetzlar regnet es; Elif möchte schwimmen, Can lieber Fahrrad fahren, Mutter Derya schlägt einen Ausflug mit dem Rad an die Lahn vor, sobald die Sonne kommt. Dialog (Lektion): Lena fragt Elif am Telefon, was sie anziehen soll. Ort: Wohnung, Radweg an der Lahn.
- Lesen: –
- Sprechen: 1) Das Wetter heute beschreiben und sagen, was man anzieht. 2) Sagen, was man am Wochenende machen möchte und mit wem.
- Schreiben: –

**tr.a1.e12 – Beim Kinderarzt**

- Kann: Ich kann sagen, wo es mir wehtut und wie ich mich fühle. Ich kann einfache Fragen in der Praxis verstehen und beantworten. Ich kann gute Besserung wünschen.
- Sprechhandlungen: Beschwerden nennen, Gefühle ausdrücken, Anweisungen verstehen, gute Besserung wünschen
- Geschichte: Can hat Halsschmerzen und leichtes Fieber; Mutter Derya geht mit ihm zu Kinderärztin Pınar, die ihn untersucht und Tee und Ruhe empfiehlt. Dialog (Lektion): Elif ruft Can an und wünscht Geçmiş olsun. Ort: Kinderarztpraxis, Wohnung.
- Lesen: Hinweiszettel der Praxis mit Sprechzeiten und Bitten an Eltern.
- Sprechen: 1) Beim Arzt sagen, was wehtut und seit wann (nur Tageszeiten). 2) Rollenspiel: einem kranken Freund gute Besserung wünschen.
- Schreiben: –

#### A2

**tr.a2.e01 – Mein Wochenende**

- Kann: Ich kann erzählen, was ich am Wochenende gemacht habe. Ich kann sagen, wo ich war und wie es war. Ich kann nachfragen, was andere erlebt haben.
- Sprechhandlungen: von Erlebtem erzählen, nachfragen, Freizeit bewerten
- Geschichte: Montagmorgen im Klassenchat-Ersatz am Schultor: Elif war im Museum, Rīm beim Picknick, Can hat mit Opa Metin per Video Schach gespielt. Dialog (Lektion): Lehrerin Ayla fragt die Gruppe: Hafta sonu ne yaptınız? Ort: Schultor, Kursraum.
- Lesen: Kurzer Wochenendbericht von Defne aus İzmir (acht Sätze im -di).
- Sprechen: 1) Das eigene Wochenende in fünf Sätzen erzählen. 2) Partnerinterview: drei Fragen zum letzten Ausflug stellen.
- Schreiben: Kurze Nachricht an eine Freundin: Was habe ich am Wochenende gemacht? (30–40 Wörter)

**tr.a2.e02 – Ein Termin beim Bürgeramt**

- Kann: Ich kann einen Termin vereinbaren und Uhrzeit und Datum genau angeben. Ich kann persönliche Angaben machen und buchstabieren. Ich kann Personen höflich anreden.
- Sprechhandlungen: Termin vereinbaren, persönliche Daten angeben, buchstabieren, höflich anreden und nachfragen
- Geschichte: Mutter Derya braucht einen neuen Personalausweis; am Schalter fragt Frau Schneider nach Geburtsdatum und Adresse, Derya buchstabiert ihren Namen. Dialog (Lektion): Vater Murat ruft bei der Stadtverwaltung an und fragt nach dem nächsten freien Termin. Ort: Bürgeramt, Telefon.
- Lesen: Terminbestätigung mit Datum, Uhrzeit, Stockwerk und mitzubringenden Unterlagen.
- Sprechen: 1) Telefonisch einen Termin vereinbaren und bestätigen. 2) Den eigenen Namen und die Adresse buchstabieren.
- Schreiben: Ein einfaches Formular mit persönlichen Angaben ausfüllen.

**tr.a2.e03 – Ferienpläne**

- Kann: Ich kann über Pläne für die Ferien sprechen. Ich kann gemeinsame Unternehmungen vorschlagen und darauf reagieren. Ich kann Landschaften und Reiseziele beschreiben.
- Sprechhandlungen: Pläne nennen, Vorschläge machen und annehmen, Reiseziele vergleichen
- Geschichte: Familie Kaya plant den Sommer: Erst Verwandtenbesuch in İzmir, dann drei Tage am Meer; Can schlägt eine Wanderung in den Bergen vor. Dialog (Lektion): Elif und Lena besprechen, was sie in den Ferien machen werden. Ort: Wohnzimmer, Telefon.
- Lesen: Prospektseite einer Pension am Meer (Ausstattung, Lage).
- Sprechen: 1) Die eigenen Ferienpläne vorstellen. 2) Gemeinsam einen Ausflug planen: drei Vorschläge machen und einen auswählen.
- Schreiben: Kurze Nachricht an Verwandte: Wann kommen wir an, was werden wir machen? (40 Wörter)
- Gesperrte Kandidaten: F-tr-04

**tr.a2.e04 – Gute Nachbarschaft**

- Kann: Ich kann über Gewohnheiten sprechen und sagen, wie oft ich etwas tue. Ich kann Nachbarn höflich um Hilfe bitten und Hilfe anbieten. Ich kann eine Einladung zum Tee aussprechen und annehmen.
- Sprechhandlungen: um Hilfe bitten, Hilfe anbieten, einladen, über Gewohnheiten sprechen
- Geschichte: Nachbarin Frau Becker (Becker Hanım) bekommt ein schweres Paket; Can trägt es die Treppe hoch, sie lädt die Familie zum Tee ein und Oma Sevim, gerade zu Besuch, bringt Gebäck mit. Dialog (Lektion): Vater Murat bittet den Nachbarn Erik, kurz die Leiter zu leihen. Ort: Treppenhaus, Wohnung von Frau Becker.
- Lesen: Aushang im Hausflur: Wer hilft beim Hoffest? (Bitte und Termine).
- Sprechen: 1) Einen Nachbarn höflich um etwas bitten und sich bedanken. 2) Erzählen, was man jeden Tag, oft und nie macht.
- Schreiben: Kurzer Zettel an die Nachbarn: Bitte um Hilfe oder Angebot (30 Wörter).
- Gesperrte Kandidaten: R-03, F-tr-06

**tr.a2.e05 – Welche Jacke ist schöner?**

- Kann: Ich kann im Geschäft nach Größe, Farbe und Preis fragen. Ich kann zwei Dinge vergleichen und sagen, was mir besser gefällt. Ich kann etwas umtauschen.
- Sprechhandlungen: vergleichen, Vorlieben begründen, im Geschäft nachfragen, umtauschen
- Geschichte: Elif braucht eine Winterjacke; mit Mutter Derya vergleicht sie zwei Jacken, Verkäufer Tolga holt eine andere Größe. Dialog (Lektion): Can tauscht ein zu kleines Hemd um und zeigt den Kassenzettel. Ort: Kaufhaus in der Innenstadt.
- Lesen: Etiketten und Pflegehinweise auf Kleidung (Material, Größe, Waschtemperatur).
- Sprechen: 1) Zwei Kleidungsstücke vergleichen und eine Wahl begründen. 2) Rollenspiel: ein Kleidungsstück umtauschen.
- Schreiben: Kurze Bewertung eines gekauften Kleidungsstücks (Material, Größe, Preis; 40 Wörter).

**tr.a2.e06 – Was kannst du gut?**

- Kann: Ich kann sagen, was ich kann und was ich (noch) nicht kann. Ich kann sagen, was ich gern mache und was nicht. Ich kann von einem Spiel oder Training erzählen.
- Sprechhandlungen: Fähigkeiten nennen, Vorlieben ausdrücken, um Erlaubnis bitten, vom Training erzählen
- Geschichte: Rīm möchte in die Schwimmgruppe; Trainerin Nina fragt, wer schon schwimmen kann, Elif zeigt ihr den Rückenschwimm-Zug. Dialog (Lektion): Can fragt Vater Murat, ob er nach dem Training länger bleiben darf. Ort: Hallenbad, Sporthalle.
- Lesen: Kursaushang des Sportvereins: Gruppen, Zeiten, was man mitbringen soll.
- Sprechen: 1) Sagen, was man gut kann, was nicht und was man lernen möchte. 2) Von einem Spiel oder Training erzählen.
- Schreiben: Kurze Anmeldung per Nachricht für einen Sportkurs (40 Wörter).

**tr.a2.e07 – Ich fühle mich nicht gut**

- Kann: Ich kann beim Arzt Beschwerden beschreiben und Ratschläge verstehen. Ich kann sagen, was man tun muss oder soll. Ich kann Hinweise auf einer Medikamentenpackung verstehen.
- Sprechhandlungen: Beschwerden beschreiben, Ratschläge geben, Notwendigkeit ausdrücken, Termine in der Praxis machen
- Geschichte: Vater Murat hat eine Erkältung; Hausärztin Pınar rät ihm, viel zu trinken und zwei Tage zu Hause zu bleiben, Can holt in der Apotheke das Medikament. Dialog (Lektion): Elif erklärt Oma Sevim am Telefon, was der Arzt gesagt hat. Ort: Hausarztpraxis, Apotheke.
- Lesen: Vereinfachter Beipackzettel: Einnahme, Menge, Hinweise.
- Sprechen: 1) Rollenspiel beim Arzt: Beschwerden nennen und Ratschläge wiederholen. 2) Einer Person mit Erkältung drei Ratschläge geben.
- Schreiben: Entschuldigung für die Schule schreiben (Eltern an Lehrkraft; 30–40 Wörter).

**tr.a2.e08 – Lernen für die Klassenarbeit**

- Kann: Ich kann sagen, wofür ich etwas tue. Ich kann über Prüfungen, Noten und Lernwege sprechen. Ich kann Zeitangaben mit vor, nach und bis verwenden.
- Sprechhandlungen: Zweck angeben, über Lernen sprechen, Zeitabläufe angeben, Hilfe beim Lernen anbieten
- Geschichte: Vor der Mathearbeit lernen Elif und Rīm zusammen; Can erklärt ihnen eine Aufgabe, danach machen sie eine Pause im Park. Dialog (Lektion): Lehrerin Ayla bespricht mit Elif, was sie bis zur Prüfung wiederholen soll. Ort: Kinderzimmer, Schule.
- Lesen: Lernplan für zwei Wochen mit Zeitangaben (önce, sonra, -e kadar).
- Sprechen: 1) Den eigenen Lernplan für eine Prüfung vorstellen. 2) Sagen, wofür man Türkisch lernt (drei Gründe).
- Schreiben: Lernplan für eine Woche schreiben (Tage, Fächer, Ziele; 40–50 Wörter).
- Gesperrte Kandidaten: R-08, R-11

**tr.a2.e09 – Die große Familie**

- Kann: Ich kann Verwandte benennen und die mütterliche und väterliche Seite unterscheiden. Ich kann Menschen mit Charaktereigenschaften beschreiben. Ich kann Sätze mit und, aber, weil und auch verbinden.
- Sprechhandlungen: Verwandtschaft beschreiben, Personen charakterisieren, Aussagen verbinden und begründen
- Geschichte: Opa Metin zeigt beim Videoanruf einen Familienstammbaum: Tante Gül (teyze) ist Lehrerin, Onkel Orhan (amca) Tischler, Cousin Kerem studiert. Dialog (Lektion): Can beschreibt Samīr seinen Onkel und seine Tante. Ort: Videoanruf zwischen Wetzlar und İzmir.
- Lesen: Kurzer Text über eine Familie mit drei Generationen.
- Sprechen: 1) Den eigenen Familienstammbaum mit fünf Verwandten erklären. 2) Eine Person beschreiben, ohne den Namen zu sagen; die anderen raten.
- Schreiben: Kurztext über eine verwandte Person (Beziehung, Charakter, Beruf; 50 Wörter).
- Gesperrte Kandidaten: F-tr-05

**tr.a2.e10 – Was ist denn hier passiert?**

- Kann: Ich kann Folgen eines Ereignisses beschreiben, das ich nicht gesehen habe. Ich kann Naturerscheinungen benennen. Ich kann zwischen selbst Erlebtem und Bemerktem unterscheiden.
- Sprechhandlungen: Veränderungen feststellen, berichten, was man bemerkt hat, Natur beschreiben
- Geschichte: Nach einer Hagelnacht entdecken Elif und Opa Metin im Garten in İzmir abgebrochene Äste und einen Regenbogen; sie räumen gemeinsam auf. Dialog (Lektion): Can sieht morgens nasse Straßen und sagt: Gece yağmur yağmış. Ort: Garten, Straße.
- Lesen: Kurzmeldung im Stadtteilblatt über einen Sturm ohne Verletzte.
- Sprechen: 1) Zu einem Vorher-nachher-Bild sagen, was passiert ist. 2) Die Natur in der eigenen Umgebung beschreiben.
- Schreiben: Kurze Nachricht: Was hast du heute in der Natur bemerkt? (40 Wörter)

**tr.a2.e11 – Umzug in eine neue Wohnung**

- Kann: Ich kann sagen, seit wann ich irgendwo wohne oder etwas tue. Ich kann erzählen, was gerade passierte, als etwas anderes geschah. Ich kann Aufgaben im Haushalt verteilen.
- Sprechhandlungen: Dauer angeben, Hintergrund einer Erzählung beschreiben, Haushaltsaufgaben verteilen
- Geschichte: Familie Kaya zieht in eine größere Wohnung; alle packen mit, Vater Murat und Can tragen Kisten, Mutter Derya baut Regale auf, Elif plant ihr Zimmer. Dialog (Lektion): Die neue Nachbarin Frau Wagner fragt, seit wann die Familie in Wetzlar wohnt. Ort: alte und neue Wohnung.
- Lesen: Umzugsliste mit Aufgaben und Zuständigkeiten.
- Sprechen: 1) Erzählen, seit wann man wo wohnt und was man vorher gemacht hat. 2) Haushaltsaufgaben in der Familie aushandeln.
- Schreiben: Nachricht an die Familie: neue Adresse, Einzugstermin, Bitte um Hilfe (50 Wörter).
- Gesperrte Kandidaten: R-01, R-02

**tr.a2.e12 – Was willst du werden?**

- Kann: Ich kann über Berufswünsche sprechen und sie kurz begründen. Ich kann einen Arbeitsplatz und Tätigkeiten beschreiben. Ich kann Dinge genauer bestimmen (der Laptop auf dem Tisch, meiner, deiner).
- Sprechhandlungen: Berufswünsche äußern, Tätigkeiten beschreiben, Dinge näher bestimmen
- Geschichte: Berufserkundungstag: Elif besucht Mutter Derya im Ingenieurbüro, Can begleitet Krankenpfleger Emre im Krankenhaus; abends erzählen sie, was sie werden möchten. Dialog (Lektion): Rīm fragt Lena: Büyüyünce ne olmak istiyorsun? Ort: Büro, Krankenhausstation.
- Lesen: Kurzporträt einer Tischlerin, die ihren Beruf beschreibt.
- Sprechen: 1) Den eigenen Berufswunsch vorstellen und zwei Gründe nennen. 2) Einen Arbeitsplatz anhand eines Bildes beschreiben.
- Schreiben: Kurztext: Mein Traumberuf (Tätigkeiten, Gründe; 50 Wörter).
- Gesperrte Kandidaten: R-10

**tr.a2.e13 – Eine Hochzeit in der Familie**

- Kann: Ich kann Glückwünsche und gute Wünsche passend zur Situation aussprechen. Ich kann eine Einladung verstehen und darauf antworten. Ich kann sagen, was andere tun sollen (Otursunlar, beklesin).
- Sprechhandlungen: gratulieren, einladen und zusagen oder absagen, Wünsche aussprechen, Aufgaben für ein Fest verteilen
- Geschichte: Cousin Kerem heiratet in İzmir; die Familie bereitet Geschenke vor, Oma Sevim verteilt Aufgaben, Elif schreibt Glückwunschkarten (Fest ohne Musik- und Tanzszenen). Dialog (Lektion): Mutter Derya ruft Tante Gül an und sagt für alle zu. Ort: Wohnung in İzmir, Festsaal.
- Lesen: Einladungskarte zu Hochzeit und Essen (Datum, Ort, Bitte um Antwort).
- Sprechen: 1) Zu fünf Anlässen den passenden weltlichen Wunsch sagen. 2) Telefonisch eine Einladung annehmen oder höflich absagen.
- Schreiben: Glückwunschkarte zu Hochzeit oder Geburt schreiben (30–40 Wörter).
- Gesperrte Kandidaten: R-04, R-05, R-06, F-tr-11

**tr.a2.e14 – Paket, Konto, Rechnung**

- Kann: Ich kann bei der Post ein Paket aufgeben und nach Kosten fragen. Ich kann große Zahlen, Preise und Prozentangaben verstehen. Ich kann am Telefon und im Netz einfache Dienste nutzen und mein Passwort schützen.
- Sprechhandlungen: Paket aufgeben, nach Kosten fragen, Beträge nennen, Rechnungen verstehen
- Geschichte: Elif schickt Oma Sevim ein Paket mit Zeichnungen nach İzmir; am Postschalter fragt Herr Fischer nach Gewicht und Inhalt, die Gebühr wird erklärt. Dialog (Lektion): Can erklärt Vater Murat, wie er in der Banking-Anwendung eine Rechnung überweist und warum man das Passwort nie an Fremde weitergibt (ohne Markennamen). Ort: Postfiliale, Wohnzimmer.
- Lesen: Rechnung eines Telefonvertrags (Beträge, Datum, Prozent-Rabatt).
- Sprechen: 1) Am Postschalter ein Paket ins Ausland aufgeben. 2) Preise und Beträge laut vorlesen.
- Schreiben: Kurze Nachricht an den Kundenservice: falscher Betrag auf der Rechnung (50 Wörter).

#### B1

**tr.b1.e01 – Als Oma jung war**

- Kann: Ich kann von früheren Gewohnheiten und Lebensstationen erzählen. Ich kann in einer Erzählung zeigen, was vorher schon geschehen war. Ich kann nach Erinnerungen fragen und Interesse zeigen.
- Sprechhandlungen: von früher erzählen, Lebensstationen ordnen, nachfragen und Interesse zeigen
- Geschichte: Oma Sevim erzählt Elif beim Fotoalbum, wie sie als junge Frau aus ihrem Dorf nach Deutschland kam, in einer Fabrik arbeitete und Deutsch lernte. Dialog (Lektion): Can interviewt Opa Metin für ein Schulprojekt über seine Kindheit. Ort: Wohnzimmer, Videoanruf.
- Lesen: 1) Lebensbericht einer älteren Nachbarin (ein Absatz je Lebensabschnitt). 2) Kurzer Zeitungstext über Erinnerungsfotos aus den 1970er-Jahren in Wetzlar.
- Sprechen: 1) Eine Person aus der Familie über ihre Kindheit befragen und berichten. 2) Von einer eigenen frühen Erinnerung erzählen.
- Schreiben: Kurzer Text über eine Erinnerung aus der Kindheit (80–100 Wörter).

**tr.b1.e02 – Neue Kolleginnen und Kollegen**

- Kann: Ich kann Personen genauer beschreiben, ohne einen Relativsatz zu brauchen. Ich kann über Aufgaben, Schichten und Urlaub am Arbeitsplatz sprechen. Ich kann neue Kolleginnen und Kollegen begrüßen und einweisen.
- Sprechhandlungen: Personen identifizieren, Aufgaben erklären, über Arbeitszeiten sprechen
- Geschichte: Erster Tag von Krankenpfleger Emre auf der Station; Kollegin Selin zeigt ihm, wer wer ist: die Ärztin, die gerade telefoniert, der Pfleger, der die Pläne macht. Dialog (Lektion): Mutter Derya erklärt einer neuen Praktikantin im Büro die Abläufe. Ort: Krankenhausstation, Ingenieurbüro.
- Lesen: 1) Dienstplan mit Erläuterungen (Schichten, Vertretung). 2) Begrüßungs-E-Mail an neue Mitarbeitende (Adresse mit example.org).
- Sprechen: 1) Personen auf einem Bild mit -en beschreiben (die Frau, die …). 2) Einer neuen Kollegin den eigenen Arbeitsplatz erklären.
- Schreiben: Kurze E-Mail: Bitte um Schichttausch mit Begründung (80 Wörter).

**tr.b1.e03 – Wir suchen eine Wohnung**

- Kann: Ich kann Wohnungsanzeigen verstehen und gezielt nachfragen. Ich kann beschreiben, was für eine Wohnung ich suche. Ich kann Vor- und Nachteile einer Wohnlage nennen.
- Sprechhandlungen: Anzeigen verstehen, Anforderungen nennen, Besichtigungstermin vereinbaren, Vor- und Nachteile nennen
- Geschichte: Studentin Nilay, eine Cousine von Can, sucht in Gießen ein Zimmer; mit Can liest sie Anzeigen und besichtigt eine Wohnung, die nah an der Uni liegt. Dialog (Lektion): Nilay ruft Vermieter Herrn Hartmann an und fragt nach Nebenkosten und Kaution. Ort: Café, Wohnungsbesichtigung.
- Lesen: 1) Drei Wohnungsanzeigen zum Vergleichen. 2) Text: Worauf man bei der Wohnungssuche achten sollte.
- Sprechen: 1) Die Wohnung beschreiben, in der man wohnt, und die, die man sich wünscht. 2) Telefonat: Besichtigungstermin vereinbaren und zwei Fragen stellen.
- Schreiben: Anfrage auf eine Wohnungsanzeige (Vorstellung, Fragen, Termin; 80–100 Wörter).

**tr.b1.e04 – Eine Reise nach Kappadokien**

- Kann: Ich kann eine Reise planen und Unterkunft und Programm besprechen. Ich kann Handlungsfolgen knapp verbinden (aufstehen und losgehen). Ich kann Sehenswürdigkeiten beschreiben und empfehlen.
- Sprechhandlungen: Reise planen, reservieren, Programm vorschlagen, empfehlen
- Geschichte: Familie Kaya reist mit Opa Metin nach Kappadokien; sie wandern durch ein Tal, besuchen eine unterirdische Stadt und schauen den Ballons beim Sonnenaufgang zu. Dialog (Lektion): Mutter Derya reserviert telefonisch die Pension und fragt nach dem Frühstück. Ort: Pension, Tal, Aussichtspunkt.
- Lesen: 1) Reiseführertext über eine Region in Anatolien. 2) Bewertungen einer Unterkunft (drei kurze Texte).
- Sprechen: 1) Einen Reiseplan mit -ip-Verbindungen vortragen. 2) Einen Ort empfehlen, an dem man gewesen ist.
- Schreiben: Reservierungsanfrage an eine Pension (Datum, Zimmer, Fragen; 80 Wörter).
- Gesperrte Kandidaten: R-12

**tr.b1.e05 – Gesund bleiben**

- Kann: Ich kann sagen, wie man etwas tut (zu Fuß, ohne nachzudenken). Ich kann über Ernährung, Bewegung und Schlaf sprechen. Ich kann Tipps zur Gesundheit geben und begründen.
- Sprechhandlungen: Ratschläge geben, Gewohnheiten vergleichen, Art und Weise beschreiben
- Geschichte: Vater Murat will fitter werden; mit Can geht er morgens zu Fuß zur Arbeit, Ernährungsberaterin Ebru erklärt im Familienzentrum ausgewogene Mahlzeiten. Dialog (Lektion): Elif und Rīm vergleichen, wie viel sie schlafen und was ihnen beim Einschlafen hilft. Ort: Familienzentrum, Fußweg.
- Lesen: 1) Ratgebertext: Fünf Gewohnheiten für mehr Bewegung im Alltag. 2) Infoblatt der Krankenkasse zu gesundem Schlaf (vereinfacht).
- Sprechen: 1) Drei Gesundheitstipps geben und begründen. 2) Den eigenen Weg zur Schule oder Arbeit mit -erek beschreiben.
- Schreiben: Kurzer Ratgeber für jüngere Kinder: Gesund durch den Tag (80–100 Wörter).

**tr.b1.e06 – Der Führerschein**

- Kann: Ich kann Bedingungen und Folgen ausdrücken (wenn …, dann …). Ich kann Verkehrsregeln verstehen und erklären. Ich kann von einer Fahrstunde erzählen.
- Sprechhandlungen: Regeln erklären, Bedingungen nennen, warnen
- Geschichte: Can macht mit 17 den begleiteten Führerschein; Fahrlehrer Onur erklärt die Vorfahrt an einer Kreuzung, Can bleibt ruhig, als ein Radfahrer plötzlich abbiegt. Dialog (Lektion): Elif erklärt ihrem jüngeren Nachbarn Ben, wie man sicher über den Zebrastreifen geht. Ort: Fahrschulauto, Kreuzung.
- Lesen: 1) Auszug aus einem vereinfachten Regelheft für Radfahrende. 2) Text: So läuft die Führerscheinprüfung ab.
- Sprechen: 1) Fünf Verkehrsregeln mit wenn-dann erklären. 2) Von einer Fahrt erzählen, bei der etwas Unerwartetes passierte (ohne Unfall).
- Schreiben: Regelplakat für den Schulweg (sechs Sätze mit -se; 80 Wörter).

**tr.b1.e07 – Elternabend**

- Kann: Ich kann zeitliche Abläufe genau beschreiben (bevor, nachdem, sobald). Ich kann an einem Gespräch zwischen Eltern und Lehrkraft teilnehmen. Ich kann über Lernfortschritte sprechen.
- Sprechhandlungen: Abläufe beschreiben, nachfragen, Anliegen vorbringen, Vereinbarungen treffen
- Geschichte: Vater Murat geht zum Elternabend; Klassenlehrerin Frau Klein erklärt den Ablauf des Schuljahrs, danach spricht er mit ihr über Elifs Leseprojekt. Dialog (Lektion): Elif erklärt ihrem Vater, was nach der Schule bis zum Training passiert. Ort: Klassenraum, Küche.
- Lesen: 1) Elternbrief mit Terminen und Ablauf einer Projektwoche. 2) Text über muttersprachlichen Unterricht an Schulen (sachlich).
- Sprechen: 1) Den eigenen Nachmittag mit önce, sonra, -dikten sonra beschreiben. 2) Rollenspiel: Gespräch mit einer Lehrkraft über ein Anliegen.
- Schreiben: E-Mail an eine Lehrkraft: Termin für ein Gespräch erbitten (80–100 Wörter).

**tr.b1.e08 – Was steht in den Nachrichten?**

- Kann: Ich kann wiedergeben, was jemand gesagt oder gemeint hat. Ich kann indirekte Fragen stellen. Ich kann einfache Nachrichten verstehen und sicher mit eigenen Daten im Netz umgehen.
- Sprechhandlungen: Aussagen wiedergeben, indirekt fragen, Nachrichten zusammenfassen, über Sicherheit im Netz sprechen
- Geschichte: In der Schul-AG „Kinderzeitung“ schreiben Elif und Samīr über das neue Hallenbad; sie befragen Bademeisterin Heike und geben wieder, was sie gesagt hat. Dialog (Lektion): Can erklärt Oma Sevim, woran man erkennt, ob eine Meldung im Netz stimmt. Ort: Redaktionsraum der Schule, Hallenbad.
- Lesen: 1) Kurze Lokalnachricht über ein neues Hallenbad. 2) Text: Persönliche Daten im Netz schützen.
- Sprechen: 1) Eine kurze Nachricht in indirekter Rede wiedergeben. 2) Indirekte Fragen zu einem Ereignis stellen (… biliyor musun?).
- Schreiben: Kurze Meldung für die Schülerzeitung (wer, was, wann, wo; 100 Wörter).

**tr.b1.e09 – Ärger im Treppenhaus**

- Kann: Ich kann Gründe nennen und Gleichzeitiges ausdrücken. Ich kann ein Problem höflich ansprechen und eine Lösung vorschlagen. Ich kann mich entschuldigen und eine Entschuldigung annehmen.
- Sprechhandlungen: sich beschweren, begründen, sich entschuldigen, einen Kompromiss vorschlagen
- Geschichte: Im Haus stehen Fahrräder im Flur; Hausverwalter Herr Koch hängt einen Zettel auf, die Nachbarn Gül, Erik und Familie Kaya treffen sich und finden gemeinsam einen Abstellplatz. Dialog (Lektion): Can entschuldigt sich bei Frau Becker, weil er beim Umräumen laut war. Ort: Treppenhaus, Hof.
- Lesen: 1) Hausordnung (Auszug mit Ruhezeiten und Gemeinschaftsflächen). 2) Brief eines Nachbarn mit Vorschlag zur Lösung.
- Sprechen: 1) Ein Problem höflich ansprechen und eine Lösung vorschlagen. 2) Sich für ein Missgeschick entschuldigen und begründen.
- Schreiben: Höfliche Nachricht an die Nachbarn: Problem und Vorschlag (100 Wörter).
- Gesperrte Kandidaten: F-tr-13

**tr.b1.e10 – Wenn ich mir etwas wünschen könnte**

- Kann: Ich kann Wünsche und Bedauern ausdrücken. Ich kann über Gefühle in Freundschaften sprechen und Trost spenden. Ich kann gemeinsam etwas vorschlagen (Ne yapsak?).
- Sprechhandlungen: Wünsche äußern, trösten, Gefühle beschreiben, vorschlagen
- Geschichte: Elifs Freundin Lena zieht nach Hamburg; die beiden sind traurig, schreiben sich Briefe und planen, sich in den Ferien zu besuchen. Dialog (Lektion): Can tröstet seinen Freund Arda nach einem verlorenen Spiel. Ort: Schulhof, Bahnhof.
- Lesen: 1) Brief von Lena aus Hamburg. 2) Ratgebertext: Wie man Freundschaften auch auf Entfernung pflegt.
- Sprechen: 1) Drei Wünsche mit keşke formulieren und begründen. 2) Rollenspiel: einen Freund trösten und etwas Gemeinsames vorschlagen.
- Schreiben: Persönlicher Brief an eine Freundin, die weggezogen ist (100 Wörter).
- Gesperrte Kandidaten: R-07, R-13, F-tr-09

**tr.b1.e11 – Formulare ausfüllen**

- Kann: Ich kann Aufforderungen und Pflichten in Formularen verstehen. Ich kann sagen, was jemand tun muss oder was ich von jemandem möchte. Ich kann am Schalter Unterlagen einreichen und nachfragen.
- Sprechhandlungen: Unterlagen einreichen, Pflichten verstehen, um Erklärung bitten
- Geschichte: Mutter Derya beantragt für Can einen Schülerausweis und eine Monatskarte; Sachbearbeiterin Frau Neumann erklärt, welche Unterlagen fehlen. Dialog (Lektion): Elif hilft Oma Sevim, ein Antragsformular für die Seniorenkarte zu verstehen. Ort: Servicestelle, Küche.
- Lesen: 1) Ausfüllhinweise zu einem Antrag. 2) Liste der erforderlichen Unterlagen mit Erläuterung.
- Sprechen: 1) Erklären, was man für einen Antrag mitbringen muss. 2) Am Schalter nachfragen, warum etwas fehlt.
- Schreiben: Kurzes Anschreiben zum Nachreichen von Unterlagen (100 Wörter).

**tr.b1.e12 – Ehrenamt im Verein**

- Kann: Ich kann wiedergeben, was andere gesagt haben, und Absichten nennen (… diye). Ich kann eine Aufgabe im Verein übernehmen und Absprachen treffen. Ich kann von einem Einsatz erzählen.
- Sprechhandlungen: Aufgaben übernehmen, Absichten erklären, Absprachen treffen, Rede wiedergeben
- Geschichte: Can hilft montags in der Hausaufgabenhilfe des Stadtteilvereins; Leiterin Susanne erklärt die Abläufe, Can erzählt, warum er mitmacht (Ehrenamt als Thema, nie als Aufruf). Dialog (Lektion): Vater Murat berichtet von seiner Übung bei der freiwilligen Feuerwehr. Ort: Vereinsraum, Feuerwache.
- Lesen: 1) Porträt einer Jugendlichen, die Nachhilfe gibt. 2) Protokoll eines Vereinstreffens in einfacher Sprache.
- Sprechen: 1) Von einer freiwilligen Aufgabe erzählen und den Grund nennen. 2) Wiedergeben, was in einem Treffen beschlossen wurde.
- Schreiben: Kurzer Bericht über einen Einsatz im Verein (100 Wörter).

**tr.b1.e13 – Wenn es wärmer wird**

- Kann: Ich kann fortschreitende Veränderungen beschreiben (je …, desto …). Ich kann über Umweltschutz im Alltag sprechen und Vorschläge machen. Ich kann Gegensätze zwischen Personen ausdrücken (ben ise …).
- Sprechhandlungen: Veränderungen beschreiben, Vorschläge machen, Gegensätze ausdrücken
- Geschichte: In einem trockenen Sommer gießt die Schulklasse mit Biologielehrer Herrn Lange die jungen Bäume im Park; Elif und Samīr messen, wie viel Wasser sie sparen. Dialog (Lektion): Familie Kaya bespricht, wie sie im Haushalt Energie sparen kann. Ort: Stadtpark, Küche.
- Lesen: 1) Sachtext über Wasser sparen im Haushalt. 2) Bericht über ein Baumprojekt einer Schulklasse.
- Sprechen: 1) Drei Veränderungen in der Natur mit -dikçe beschreiben. 2) Vorschläge zum Energiesparen in der Familie machen.
- Schreiben: Hinweisplakat für die Klasse: So trennen wir den Müll (100 Wörter).

**tr.b1.e14 – Erfindungen, die alles verändert haben**

- Kann: Ich kann über unwirkliche Bedingungen sprechen (Was wäre, wenn …?). Ich kann eine Erfindung beschreiben und ihre Folgen erklären. Ich kann einen einfachen Versuch beschreiben.
- Sprechhandlungen: Hypothesen bilden, Erfindungen erklären, einen Versuch beschreiben
- Geschichte: Im Technikmuseum fragt Museumspädagoge Andreas die Klasse, wie der Alltag ohne Glühbirne, Telefon oder Kühlschrank aussähe; Elif und Rīm bauen danach einen einfachen Stromkreis. Dialog (Lektion): Can und Opa Metin vergleichen Telefone von früher und heute. Ort: Technikmuseum, Schullabor.
- Lesen: 1) Sachtext über die Erfindung des Kühlschranks. 2) Versuchsanleitung: einfacher Stromkreis.
- Sprechen: 1) Sagen, wie das Leben ohne eine bestimmte Erfindung wäre. 2) Einen Versuch Schritt für Schritt erklären.
- Schreiben: Kurzbeschreibung einer Erfindung und ihrer Folgen (100 Wörter).

**tr.b1.e15 – Mein erstes Praktikum**

- Kann: Ich kann einen kurzen Lebenslauf schreiben und meine Stärken nennen. Ich kann ein einfaches Vorstellungsgespräch führen. Ich kann Gedanken mit ki verbinden (Biliyorum ki …).
- Sprechhandlungen: sich vorstellen, Stärken nennen, Fragen im Gespräch beantworten, nachfragen
- Geschichte: Can bewirbt sich um ein Schülerpraktikum in einer Kfz-Werkstatt; Meisterin Katharina fragt nach seinen Interessen, er erzählt von der Hausaufgabenhilfe. Dialog (Lektion): Elif übt mit Mutter Derya Fragen für ein Gespräch. Ort: Werkstatt, Wohnzimmer.
- Lesen: 1) Praktikumsangebot mit Aufgaben und Anforderungen. 2) Erfahrungsbericht einer Praktikantin.
- Sprechen: 1) Sich in einem Vorstellungsgespräch vorstellen und zwei Stärken belegen. 2) Fragen an den Betrieb stellen.
- Schreiben: Kurzer Lebenslauf in Stichpunkten und eine Begleitmail (100 Wörter).

**tr.b1.e16 – Wir kochen für Gäste**

- Kann: Ich kann ein Rezept verstehen und Schritte erklären. Ich kann gezielt nachfragen und betonen, wer oder was gemeint ist. Ich kann Gäste empfangen und bewirten.
- Sprechhandlungen: Rezept erklären, gezielt nachfragen, Gäste empfangen, Komplimente machen und annehmen
- Geschichte: Familie Kaya lädt Familie Becker und Familie von Samīr ein; Vater Murat und Can kochen gefüllte Paprika mit Rindfleisch, Elif macht Milchreis, die Gäste bringen ein Gericht aus ihrer Küche mit. Dialog (Lektion): Frau Becker fragt: Bunu sen mi yaptın? Ort: Küche, Esszimmer.
- Lesen: 1) Rezept: gefüllte Paprika mit Rindfleisch. 2) Kurzer Text über drei Küchen an einem Tisch.
- Sprechen: 1) Ein Lieblingsrezept Schritt für Schritt erklären. 2) Gäste begrüßen, bewirten und auf Komplimente antworten.
- Schreiben: Eigenes Rezept aufschreiben (Zutaten mit Fleischart, Schritte; 100 Wörter).
- Gesperrte Kandidaten: F-tr-02, F-tr-12

#### B2

**tr.b2.e01 – Nachrichten richtig lesen**

- Kann: Ich kann in Nachrichten unterscheiden, was belegt, berichtet oder nur behauptet ist. Ich kann Aussagen von Ämtern und Fachleuten sachlich wiedergeben. Ich kann eine Meldung mit eigenen Worten zusammenfassen.
- Sprechhandlungen: Quellen einordnen, berichtete Rede verwenden, zusammenfassen, Zweifel ausdrücken
- Geschichte: Nilay arbeitet in der Lokalredaktion; eine Meldung über die Sperrung einer Brücke kursiert im Netz, sie prüft mit Redakteur Tolga, was die Stadt wirklich mitgeteilt hat. Dialog (Lektion): Murat und Derya sprechen beim Frühstück über eine Nachricht und fragen: Kim söylemiş? Ort: Redaktion, Küche.
- Lesen: 1) Zwei Meldungen zum selben Ereignis im Vergleich. 2) Pressemitteilung einer Stadtverwaltung (vereinfacht). 3) Sachtext: Woran man unzuverlässige Meldungen erkennt.
- Sprechen: 1) Eine Nachricht in berichteter Rede wiedergeben. 2) Begründen, warum man einer Meldung (nicht) traut.
- Schreiben: 1) Zusammenfassung einer Nachricht in eigenen Worten (120–150 Wörter). 2) Kurzer Leserbrief mit Bitte um Richtigstellung einer Angabe (120 Wörter).

**tr.b2.e02 – Bewerbung und Vorstellungsgespräch**

- Kann: Ich kann Stellenanzeigen genau lesen und Anforderungen mit meinem Profil vergleichen. Ich kann Abläufe unpersönlich beschreiben (Passiv). Ich kann mich in einem Vorstellungsgespräch überzeugend präsentieren.
- Sprechhandlungen: Anforderungen verstehen, sich präsentieren, Rückfragen stellen, Abläufe beschreiben
- Geschichte: Can bewirbt sich nach dem Abitur um einen Ausbildungsplatz als Mechatroniker; Personalleiterin Frau Hoffmann erklärt, wie das Auswahlverfahren abläuft, Can stellt gezielte Fragen. Dialog (Lektion): Selin bereitet mit ihrem Kollegen Emre ein Gespräch für eine Leitungsstelle vor. Ort: Betrieb, Stationszimmer.
- Lesen: 1) Stellenanzeige mit Aufgaben und Anforderungen. 2) Ratgebertext zum Anschreiben. 3) Ablaufbeschreibung eines Auswahlverfahrens im Passiv.
- Sprechen: 1) Sich in zwei Minuten für eine Stelle vorstellen. 2) Den Ablauf eines Bewerbungsverfahrens erklären.
- Schreiben: 1) Anschreiben auf eine Stellenanzeige (150 Wörter). 2) Dankesmail nach einem Vorstellungsgespräch (100 Wörter).

**tr.b2.e03 – Renovieren lassen**

- Kann: Ich kann ausdrücken, dass ich etwas machen lasse. Ich kann mit Handwerkerinnen und Handwerkern Arbeiten, Kosten und Termine absprechen. Ich kann einen Mangel beschreiben und reklamieren.
- Sprechhandlungen: Aufträge erteilen, Kostenvoranschlag besprechen, Mängel reklamieren
- Geschichte: Tante Gül lässt in İzmir Küche und Bad renovieren; Fliesenleger Kaan kommt zur Besichtigung, sie verhandeln über Material und Termin, später fehlt eine Leiste. Dialog (Lektion): Murat erklärt Derya, was er in der Werkstatt reparieren lassen will. Ort: Wohnung in İzmir, Werkstatt.
- Lesen: 1) Kostenvoranschlag einer Firma (vereinfacht). 2) Ratgeber: Worauf achten bei Handwerksaufträgen? 3) Kurze Reklamation mit Antwort der Firma.
- Sprechen: 1) Einen Auftrag für eine Reparatur erteilen und Termine absprechen. 2) Einen Mangel höflich, aber deutlich reklamieren.
- Schreiben: 1) Auftragsbestätigung mit Einzelheiten (120 Wörter). 2) Reklamationsschreiben (150 Wörter).

**tr.b2.e04 – Pflege in der Familie**

- Kann: Ich kann über Pflege und Unterstützung im Alltag sprechen. Ich kann Vermutungen über Ursachen und Zustände äußern. Ich kann Informationen des Gesundheitswesens verstehen und nachfragen.
- Sprechhandlungen: Unterstützung organisieren, Vermutungen äußern, mit Fachleuten sprechen, Mitgefühl zeigen
- Geschichte: Opa Metin kann nach einer Hüftoperation nicht allein Treppen steigen; die Familie spricht mit Pflegeberaterin Dīma über Hilfen, Can und Elif übernehmen Besuche. Dialog (Lektion): Derya ruft die Hausarztpraxis an und klärt eine Überweisung zum Facharzt. Ort: Wohnung der Großeltern, Telefon.
- Lesen: 1) Informationsblatt über Pflegeleistungen (vereinfacht). 2) Erfahrungsbericht einer pflegenden Tochter. 3) Hinweise einer Praxis zur Überweisung.
- Sprechen: 1) Mit einer Beratungsstelle über Unterstützung sprechen. 2) Vermutungen über ein Problem äußern (… olabilir, … olmalı).
- Schreiben: 1) Nachricht an die Familie: Wer übernimmt welche Aufgabe? (120 Wörter) 2) Anfrage an eine Beratungsstelle (150 Wörter).

**tr.b2.e05 – Zusammenarbeit im Team**

- Kann: Ich kann Einwände und Gegensätze formulieren (obwohl, trotzdem). Ich kann in einer Teambesprechung Aufgaben verteilen und Rückmeldung geben. Ich kann über Arbeitsformen und Belastung sachlich sprechen.
- Sprechhandlungen: einwenden, Rückmeldung geben, Aufgaben verteilen, Fristen aushandeln
- Geschichte: Mutter Derya leitet ein Brückenprojekt; trotz Lieferverzug findet das Team mit Ingenieur Fādī und Technikerin Damla eine Lösung, Derya bedankt sich für die Rückmeldungen. Dialog (Lektion): Hakan, Koch in einer Kantine, bespricht mit seinem Team den Wochenplan. Ort: Ingenieurbüro, Kantinenküche.
- Lesen: 1) Protokollnotiz einer Teambesprechung. 2) Sachtext über Homeoffice und Teamarbeit. 3) Leitfaden für konstruktive Rückmeldung.
- Sprechen: 1) In einer Besprechung einen Einwand höflich vorbringen. 2) Einer Kollegin konstruktive Rückmeldung geben.
- Schreiben: 1) E-Mail mit Aufgabenverteilung und Fristen (120 Wörter). 2) Stellungnahme zu einem Vorschlag mit -mesine rağmen (150 Wörter).

**tr.b2.e06 – Post vom Amt**

- Kann: Ich kann amtliche Schreiben verstehen und Fristen erkennen. Ich kann formelle Begründungen und Bedingungen verstehen und selbst verwenden. Ich kann einen Widerspruch sachlich formulieren.
- Sprechhandlungen: Schreiben verstehen, Fristen klären, Widerspruch einlegen, telefonisch nachfragen
- Geschichte: Murat bekommt ein Schreiben wegen fehlender Unterlagen zum Kindergeld; mit Sachbearbeiter Herrn Braun klärt er am Telefon die Frist und reicht die Belege nach. Dialog (Lektion): Nilay erklärt Oma Sevim einen Brief der Rentenversicherung. Ort: Küche, Servicestelle.
- Lesen: 1) Amtliches Schreiben mit Frist (vereinfacht). 2) Merkblatt zu Widerspruch und Fristen. 3) Antwortschreiben einer Behörde.
- Sprechen: 1) Telefonisch eine Frist klären und Unterlagen ankündigen. 2) Einen Brief für eine ältere Person mündlich zusammenfassen.
- Schreiben: 1) Sachlicher Widerspruch mit Begründung (150 Wörter). 2) Begleitschreiben zu nachgereichten Unterlagen (120 Wörter).

**tr.b2.e07 – Grüne Stadt**

- Kann: Ich kann neue Wörter über Wortbildung erschließen. Ich kann über Maßnahmen für Umwelt und Lebensqualität in der Stadt sprechen. Ich kann Vorschläge vergleichen und begründet bewerten.
- Sprechhandlungen: Vorschläge machen, bewerten, Maßnahmen beschreiben, Wortbedeutungen erschließen
- Geschichte: Die Stadt lädt zu einer Bürgerwerkstatt über einen neuen Radweg und mehr Bäume ein; Elif, jetzt 16, stellt mit ihrer Klasse einen Vorschlag vor, Stadtplanerin Frau Zimmermann antwortet. Dialog (Lektion): Can und Samīr diskutieren, ob sie mit dem Rad oder dem Bus zur Arbeit fahren. Ort: Stadthalle, Radweg.
- Lesen: 1) Sachtext über Stadtbäume und Hitze. 2) Informationsblatt zur Bürgerwerkstatt. 3) Kurzer Bericht über ein Radverkehrsprojekt.
- Sprechen: 1) Einen Vorschlag für eine grünere Umgebung präsentieren. 2) Zwei Maßnahmen vergleichen und begründet wählen.
- Schreiben: 1) Vorschlag an die Stadtverwaltung (150 Wörter). 2) Kurzer Bericht über eine Umweltaktion der Schule (120 Wörter).

**tr.b2.e08 – Konto, Karte, Kosten**

- Kann: Ich kann Kontoauszüge und Gebühren verstehen. Ich kann einen Haushaltsplan aufstellen und besprechen. Ich kann Zwecke formell ausdrücken (… üzere, amacıyla).
- Sprechhandlungen: Kosten prüfen, Budget planen, bei der Bank nachfragen, Zwecke nennen
- Geschichte: Can eröffnet für das Ausbildungsgehalt sein erstes Girokonto; Bankberaterin Frau Lange erklärt Gebühren und Daueraufträge, abends stellt er mit Derya einen Monatsplan auf (Zinsprodukte nur sachlich nach OF-12, keine Figur nimmt Zinskredite auf). Dialog (Lektion): Nilay fragt in der Filiale nach einer falschen Abbuchung. Ort: Bankfiliale, Küche.
- Lesen: 1) Kontoauszug mit Erläuterungen. 2) Ratgebertext: Haushaltsbuch führen. 3) Preisaushang für Kontomodelle (vereinfacht).
- Sprechen: 1) Den eigenen Monatsplan vorstellen und Sparmöglichkeiten nennen. 2) Bei der Bank eine Abbuchung klären.
- Schreiben: 1) Anfrage an eine Bank zu Gebühren (120 Wörter). 2) Haushaltsplan mit Erläuterung (150 Wörter).

**tr.b2.e09 – Wie Medikamente entstehen**

- Kann: Ich kann Forschungsprozesse beschreiben, auch mit verschachtelten Verbformen. Ich kann einen populärwissenschaftlichen Text verstehen und zusammenfassen. Ich kann Chancen und Risiken einer Technik sachlich darstellen.
- Sprechhandlungen: Prozesse beschreiben, zusammenfassen, Chancen und Risiken abwägen
- Geschichte: Pharmazeutin Ebru erklärt beim Tag der offenen Tür im Labor, wie ein Medikament getestet und zugelassen wird; Elif fragt nach Tierversuchen und bekommt eine sachliche Antwort. Dialog (Lektion): Can und Ziyād sprechen über ein Programm, das Texte übersetzt, und seine Grenzen. Ort: Forschungslabor, Pausenraum.
- Lesen: 1) Sachtext: Von der Idee zum Medikament. 2) Interview mit einer Forscherin (vereinfacht). 3) Kurzer Text über Chancen und Grenzen digitaler Übersetzung.
- Sprechen: 1) Einen Forschungsablauf mit Passivformen erklären. 2) Eine Technik mit je zwei Chancen und Risiken vorstellen.
- Schreiben: 1) Zusammenfassung eines Sachtexts (150 Wörter). 2) Kurze Erörterung: Nutzen und Grenzen einer Technik (150 Wörter).

**tr.b2.e10 – Freiwillig helfen**

- Kann: Ich kann genaue Zeitfolgen ausdrücken (sobald, bis, seit). Ich kann einen Einsatz organisieren und Aufgaben koordinieren. Ich kann von gemeinschaftlichem Engagement berichten, ohne zu werben.
- Sprechhandlungen: koordinieren, berichten, Zeitfolgen klären, danken
- Geschichte: Nach einem Hochwasser an der Lahn helfen Nachbarn, Keller leerzuräumen; Murat koordiniert mit Feuerwehrfrau Andrea die Freiwilligen, niemand ist verletzt. Dialog (Lektion): Selin erklärt neuen Helfern im Erste-Hilfe-Kurs den Ablauf. Ort: Wohnstraße, Feuerwache.
- Lesen: 1) Bericht über Nachbarschaftshilfe nach einem Unwetter. 2) Einsatzplan mit Zeitangaben. 3) Porträt eines Ehrenamtlichen bei der Lebensmittelausgabe (ohne Spendenbitte).
- Sprechen: 1) Einen Einsatzablauf mit -ir -mez und -ene kadar beschreiben. 2) Freiwilligen Aufgaben zuteilen.
- Schreiben: 1) Bericht über einen gemeinschaftlichen Einsatz (150 Wörter). 2) Dankesbrief an Helferinnen und Helfer (120 Wörter).

**tr.b2.e11 – Der Mietvertrag**

- Kann: Ich kann wichtige Klauseln eines Mietvertrags verstehen. Ich kann Pflichten und Feststellungen im förmlichen Stil erkennen (-dir). Ich kann Fragen zu Rechten und Pflichten stellen, ohne eine Empfehlung zu erwarten.
- Sprechhandlungen: Vertrag prüfen, nachfragen, Pflichten benennen, kündigen
- Geschichte: Nilay unterschreibt ihren ersten Mietvertrag; mit Can liest sie die Klauseln zu Kaution, Kündigungsfrist und Schönheitsreparaturen, offene Fragen klärt sie mit der Verwaltung. Dialog (Lektion): Vermieter Herr Schulz und Nilay besprechen die Wohnungsübergabe. Ort: Café, leere Wohnung.
- Lesen: 1) Auszug aus einem Mietvertrag (vereinfacht). 2) Merkblatt zur Wohnungsübergabe. 3) Sachtext über Kündigungsfristen.
- Sprechen: 1) Eine Vertragsklausel in einfachen Worten erklären. 2) Eine Wohnungsübergabe durchspielen.
- Schreiben: 1) Kündigungsschreiben einer Wohnung (120 Wörter). 2) Anfrage zu einer unklaren Vertragsklausel (150 Wörter).

**tr.b2.e12 – Alte Handwerke**

- Kann: Ich kann ein traditionelles Handwerk und seine Geschichte beschreiben. Ich kann mit Verdoppelungen anschaulich erzählen. Ich kann eine Ausstellung beschreiben und empfehlen.
- Sprechhandlungen: beschreiben, erzählen, empfehlen, nachfragen
- Geschichte: In einer Werkstatt in İzmir zeigt Meisterin Nehir Hanım, eine Bekannte von Oma Sevim, wie Fliesen bemalt werden; Elif darf langsam, Strich für Strich, ein Muster malen. Dialog (Lektion): Can und Rīm besuchen eine Ausstellung über Marmorierkunst und tauschen Eindrücke aus. Ort: Fliesenwerkstatt, Museum.
- Lesen: 1) Sachtext über die Geschichte eines Handwerks. 2) Ausstellungstext eines Museums. 3) Interview mit einer jungen Handwerkerin.
- Sprechen: 1) Ein Handwerk anschaulich beschreiben. 2) Eine Ausstellung empfehlen und begründen.
- Schreiben: 1) Beschreibung eines Handwerks oder Kunstgegenstands (150 Wörter). 2) Besuchsbericht über eine Ausstellung (120 Wörter).
- Gesperrte Kandidaten: R-01, R-02

**tr.b2.e13 – Generationen und Sprachen**

- Kann: Ich kann über Mehrsprachigkeit und das Leben zwischen Generationen sprechen. Ich kann Gegensätze und Vergleiche mit sanki, oysa und halbuki ausdrücken. Ich kann eigene Erfahrungen mit Sprachen reflektieren.
- Sprechhandlungen: Erfahrungen austauschen, vergleichen, Gegensätze ausdrücken, Meinung äußern
- Geschichte: Im Familienzentrum diskutieren drei Generationen: Oma Sevim, Mutter Derya und Elif erzählen, welche Sprache sie wann sprechen und was Mehrsprachigkeit für sie bedeutet; Fādī berichtet von seiner Familie. Dialog (Lektion): Can erklärt seinem Opa, warum er manchmal Wörter mischt. Ort: Familienzentrum, Videoanruf.
- Lesen: 1) Sachtext über Mehrsprachigkeit in Familien. 2) Erfahrungsbericht einer Jugendlichen mit drei Sprachen. 3) Interview mit einer Sprachwissenschaftlerin (vereinfacht).
- Sprechen: 1) Über die eigene Sprachbiografie sprechen. 2) Zwei Generationen vergleichen, ohne zu werten.
- Schreiben: 1) Sprachbiografie (150 Wörter). 2) Kommentar: Was gewinnt eine Familie mit zwei Sprachen? (150 Wörter)

**tr.b2.e14 – Wie eine Gemeinde arbeitet**

- Kann: Ich kann erklären, wie Gemeinde, Verwaltung und Gerichte grundsätzlich arbeiten, ohne Parteien oder Personen zu nennen. Ich kann mit Aspekt-Hilfsverben Nuancen ausdrücken. Ich kann an einer Bürgersprechstunde sachlich teilnehmen.
- Sprechhandlungen: Verfahren erklären, sachlich nachfragen, Anliegen vorbringen
- Geschichte: Elifs Klasse besucht das Rathaus; eine Mitarbeiterin der Verwaltung erklärt, wie ein Beschluss zum neuen Spielplatz zustande kommt und wie Bürger Anträge stellen. Dialog (Lektion): Murat bringt in der Bürgersprechstunde ein Anliegen zur Straßenbeleuchtung vor. Ort: Rathaus, Bürgersprechstunde.
- Lesen: 1) Sachtext: Aufgaben einer Gemeinde. 2) Ablauf eines Bürgerantrags (vereinfacht). 3) Kurzer Text über Schöffen am Gericht (sachlich).
- Sprechen: 1) Einen Verwaltungsablauf erklären. 2) Ein Anliegen in einer Bürgersprechstunde sachlich vortragen.
- Schreiben: 1) Bürgerantrag zu einem Anliegen im Stadtteil (150 Wörter). 2) Bericht über einen Rathausbesuch (120 Wörter).

**tr.b2.e15 – Zahlen, die etwas sagen**

- Kann: Ich kann Umfrageergebnisse und Grafiken verstehen und beschreiben. Ich kann Anteile, Mengen und Entwicklungen genau ausdrücken. Ich kann Zahlen kritisch einordnen.
- Sprechhandlungen: Grafiken beschreiben, vergleichen, Entwicklungen benennen, Zahlen einordnen
- Geschichte: Für ein Schulprojekt wertet Elif mit Samīr eine Umfrage über die Mediennutzung Jugendlicher aus; Lehrerin Frau Krüger zeigt, wie man Grafiken fair beschreibt. Dialog (Lektion): Tolga erklärt in der Redaktion, warum eine Überschrift die Zahlen übertreibt. Ort: Klassenzimmer, Redaktion.
- Lesen: 1) Umfrageergebnis mit Balkendiagramm (als Text beschrieben). 2) Sachtext: Wie man Statistiken liest. 3) Zeitungsmeldung mit Zahlen und eine Richtigstellung.
- Sprechen: 1) Eine Grafik beschreiben und deuten. 2) Eine Übertreibung in einer Überschrift begründet zurückweisen.
- Schreiben: 1) Grafikbeschreibung (150 Wörter). 2) Kurzer Bericht über eine eigene Umfrage (150 Wörter).

**tr.b2.e16 – Eine eigene Werkstatt**

- Kann: Ich kann Alternativen abwägen und eine Entscheidung begründen. Ich kann über Selbstständigkeit, Kunden und Pflichten sprechen. Ich kann ein Beratungsgespräch führen.
- Sprechhandlungen: abwägen, Entscheidung begründen, beraten lassen, Pläne vorstellen
- Geschichte: Onkel Orhan möchte in İzmir eine eigene Tischlerei eröffnen; mit Gründungsberaterin Beren wägt er Miete, Kunden und Genehmigungen ab, Can hilft beim Plan. Dialog (Lektion): Hakan überlegt, ob er lieber angestellt bleibt oder einen Imbiss eröffnet. Ort: Beratungsstelle, Werkstatt.
- Lesen: 1) Ratgeber: Schritte zur Selbstständigkeit (vereinfacht). 2) Porträt einer Gründerin. 3) Checkliste für ein Beratungsgespräch.
- Sprechen: 1) Zwei berufliche Alternativen abwägen und sich entscheiden. 2) Einen Geschäftsplan in drei Minuten vorstellen.
- Schreiben: 1) Kurzer Geschäftsplan (150 Wörter). 2) Erörterung: angestellt oder selbstständig? (150 Wörter)

#### C1

**tr.c1.e01 – Protokoll einer Besprechung**

- Kann: Ich kann verdichtete Texte im Nominalstil verstehen und selbst knapp formulieren. Ich kann eine Besprechung leiten und das Ergebnis schriftlich festhalten. Ich kann zwischen mündlichem und schriftlichem Ausdruck bewusst wechseln.
- Sprechhandlungen: moderieren, Ergebnisse festhalten, Beschlüsse formulieren, nachfassen
- Geschichte: Selin ist Stationsleitung geworden und leitet ihre erste große Teambesprechung zur neuen Dienstplanung; Emre schreibt das Protokoll, danach überarbeiten sie es gemeinsam. Dialog (Lektion): Derya fasst für die Geschäftsführung die Ergebnisse eines Projekttreffens zusammen. Ort: Besprechungsraum, Büro.
- Lesen: 1) Protokoll einer Teamsitzung. 2) Leitfaden für gute Protokolle. 3) Interne Mitteilung im Nominalstil. 4) Sachtext über Besprechungskultur.
- Sprechen: 1) Eine Besprechung eröffnen, moderieren und zusammenfassen. 2) Einen Nominalstil-Text mündlich in Alltagssprache erklären.
- Schreiben: 1) Ergebnisprotokoll einer Besprechung (200–250 Wörter). 2) Interne Mitteilung im Nominalstil (150–200 Wörter).

**tr.c1.e02 – Der Bescheid**

- Kann: Ich kann Bescheide im Amtsstil vollständig verstehen und die Folgen erklären. Ich kann formelle Verlaufs- und Feststellungsformen erkennen und verwenden. Ich kann ein förmliches Schreiben präzise und höflich verfassen.
- Sprechhandlungen: Bescheide auswerten, Fristen berechnen, förmlich schreiben, Rechtsbehelfe nennen
- Geschichte: Onkel Orhan erhält für seine Tischlerei einen Bescheid zur Betriebsgenehmigung mit Auflagen; Can und Nilay lesen ihn gemeinsam und klären, welche Unterlagen bis wann fehlen. Dialog (Lektion): Elif erklärt Oma Sevim einen Brief der Krankenkasse Satz für Satz. Ort: Werkstattbüro, Wohnzimmer.
- Lesen: 1) Bescheid mit Begründung und Rechtsbehelfsbelehrung (vereinfacht). 2) Merkblatt zu Auflagen. 3) Amtliche Bekanntmachung einer Gemeinde. 4) Ratgebertext: Amtsdeutsch und Amtstürkisch verständlich machen.
- Sprechen: 1) Einen Bescheid in einfachen Worten erklären. 2) Telefonisch eine Fristverlängerung begründen.
- Schreiben: 1) Förmlicher Antrag auf Fristverlängerung (200 Wörter). 2) Übertragung eines Amtsschreibens in einfache Sprache (200 Wörter).

**tr.c1.e03 – Meinung in der Zeitung**

- Kann: Ich kann Kommentare und Glossen verstehen, auch wenn sie Ironie enthalten. Ich kann lange Attribute auflösen und selbst gezielt einsetzen. Ich kann Ton und Absicht eines Textes beschreiben.
- Sprechhandlungen: Absichten erkennen, Stil beschreiben, Stellung nehmen, Gegenargumente nennen
- Geschichte: Nilay schreibt ihren ersten Kommentar über leere Ladenlokale in der Innenstadt; Redakteur Tolga kritisiert zu lange Sätze, sie überarbeitet den Text mit Leserbriefen im Blick. Dialog (Lektion): Murat und Derya diskutieren eine Glosse über Eltern und Hausaufgaben. Ort: Redaktion, Küche.
- Lesen: 1) Kommentar zu einem Stadtthema. 2) Glosse über den Familienalltag. 3) Leserbriefe mit gegensätzlichen Meinungen. 4) Sachtext: Merkmale journalistischer Textsorten.
- Sprechen: 1) Absicht und Ton eines Kommentars erläutern. 2) Zu einem Kommentar Stellung nehmen.
- Schreiben: 1) Kommentar zu einem Stadtthema (250 Wörter). 2) Leserbrief mit Gegenposition (200 Wörter).

**tr.c1.e04 – Zwischen den Generationen**

- Kann: Ich kann umgangssprachliche Formen erkennen und einordnen, wann sie passen. Ich kann Nähe und Distanz in der Anrede bewusst steuern. Ich kann Unterschiede zwischen Generationen differenziert beschreiben.
- Sprechhandlungen: Register wechseln, Nähe und Distanz ausdrücken, Unterschiede beschreiben, vermitteln
- Geschichte: Bei einem Familientreffen in İzmir sprechen Cousin Kerem und Elif untereinander locker, mit Opa Metin höflich; Tante Gül fragt, warum die Jugendlichen so schnell sprechen, Elif erklärt die Unterschiede. Dialog (Lektion): Can übersetzt für Oma Sevim eine Sprachnachricht seines Freundes in ruhiges Hochtürkisch. Ort: Garten in İzmir, Wohnzimmer.
- Lesen: 1) Sachtext über Sprache Jugendlicher. 2) Interview mit einer Großmutter und ihrem Enkel. 3) Kurzgeschichte über ein Missverständnis zwischen Generationen. 4) Glossar: umgangssprachliche Wendungen und ihre neutrale Form.
- Sprechen: 1) Denselben Inhalt einmal locker, einmal förmlich sagen. 2) Zwischen zwei Generationen vermitteln (Rollenspiel).
- Schreiben: 1) Essay: Was Generationen voneinander lernen können (250 Wörter). 2) Nachricht in zwei Registern an zwei Empfänger (200 Wörter).

**tr.c1.e05 – Bilder in der Sprache**

- Kann: Ich kann gebräuchliche Redewendungen verstehen und passend einsetzen. Ich kann die übertragene Bedeutung einer Wendung erklären. Ich kann Unterschiede zwischen Wendungen meiner Sprachen und des Türkischen benennen.
- Sprechhandlungen: Wendungen erklären, vergleichen, anschaulich erzählen
- Geschichte: Im Türkischkurs für Erwachsene sammelt Kursleiter Onur Redewendungen mit Körperwörtern; Dīma und Paul vergleichen sie mit Wendungen aus ihren Sprachen, Derya erzählt eine Anekdote mit drei Wendungen. Dialog (Lektion): Elif missversteht eine Wendung ihres Opas und lacht mit ihm darüber. Ort: Kursraum, Videoanruf.
- Lesen: 1) Sachtext über Redewendungen im Türkischen. 2) Erzählung mit vielen Wendungen. 3) Kurzartikel über Wendungen, die es in mehreren Sprachen gibt. 4) Ratgeber: Wendungen im Beruf richtig dosieren.
- Sprechen: 1) Eine Anekdote mit drei Redewendungen erzählen. 2) Drei Wendungen erklären und mit der eigenen Sprache vergleichen.
- Schreiben: 1) Erzählung mit mindestens fünf Redewendungen (250 Wörter). 2) Erklärtext zu einer Wendung für jüngere Lernende (150 Wörter).

**tr.c1.e06 – Energie für morgen**

- Kann: Ich kann längere Sachtexte über Energie und Klima sachlich wiedergeben. Ich kann Abschnitte und Gedanken mit Textverknüpfern ordnen. Ich kann eine Präsentation zu einem technischen Thema gliedern.
- Sprechhandlungen: Sachverhalte erklären, gliedern, Ursachen und Folgen darstellen, präsentieren
- Geschichte: Mutter Derya stellt in ihrem Büro ein Projekt für Solardächer auf Schulen vor; Elif hilft bei den Folien, Fādī rechnet die Einsparung vor, eine Lehrerin stellt kritische Fragen. Dialog (Lektion): Can und Opa Metin sprechen über ein Windrad, das bei İzmir gebaut wird. Ort: Büro, Schulaula.
- Lesen: 1) Sachtext über Solarenergie auf öffentlichen Gebäuden. 2) Bericht über ein Windkraftprojekt (ohne Parteinamen). 3) Infografik als Text: Energieverbrauch im Haushalt. 4) Interview mit einer Energieberaterin.
- Sprechen: 1) Eine gegliederte Kurzpräsentation (drei Minuten) halten. 2) Auf kritische Nachfragen sachlich antworten.
- Schreiben: 1) Gegliederter Sachtext über eine Energieform (250 Wörter). 2) Zusammenfassung eines Interviews (200 Wörter).

**tr.c1.e07 – Forschung erklären**

- Kann: Ich kann wissenschaftliche Ergebnisse verständlich erklären und einordnen. Ich kann argumentieren, abwägen und meine Position begründen. Ich kann zwischen Beleg, Vermutung und Meinung unterscheiden.
- Sprechhandlungen: argumentieren, Belege anführen, einschränken, Position beziehen
- Geschichte: Elif stellt bei einem Schülerwettbewerb eine Studie über Schlaf und Lernen vor; Juror Herr Hartmann fragt nach der Stichprobe, sie verteidigt ihre Methode und nennt Grenzen. Dialog (Lektion): Ebru erklärt Nilay für einen Artikel, was eine Studie belegt und was nicht. Ort: Wettbewerbsbühne, Labor.
- Lesen: 1) Populärwissenschaftlicher Artikel über Schlaf und Lernen. 2) Zusammenfassung einer Studie (vereinfacht). 3) Debattentext mit zwei Positionen. 4) Sachtext: Wie man Studien liest.
- Sprechen: 1) Ein Forschungsergebnis erklären und seine Grenzen nennen. 2) In einer Diskussion eine Position begründen und auf Einwände reagieren.
- Schreiben: 1) Argumentativer Text mit Gegenposition (250 Wörter). 2) Kurzfassung einer Studie für Laien (200 Wörter).

**tr.c1.e08 – Das Kleingedruckte**

- Kann: Ich kann Verbraucherinformationen und Vertragsbedingungen genau verstehen. Ich kann Reihungen mit gemeinsamen Endungen in Rechtstexten auflösen. Ich kann Rechte als Verbraucher sachlich geltend machen, ohne Beratung zu ersetzen.
- Sprechhandlungen: Bedingungen prüfen, Ansprüche geltend machen, widerrufen, nachverhandeln
- Geschichte: Can hat online eine Werkzeugkiste bestellt, die defekt ankommt; mit Nilay liest er die Bedingungen des Händlers und widerruft fristgerecht. Dialog (Lektion): Gül verhandelt mit einem Handyanbieter über eine unklare Vertragsverlängerung (ohne Markennamen). Ort: Wohnung, Telefon.
- Lesen: 1) Allgemeine Geschäftsbedingungen (Auszug, vereinfacht). 2) Verbraucherinformation zum Widerrufsrecht. 3) Antwortschreiben eines Händlers. 4) Sachtext über Garantie und Gewährleistung.
- Sprechen: 1) Eine Vertragsbedingung präzise erklären. 2) Telefonisch einen Anspruch sachlich durchsetzen.
- Schreiben: 1) Widerruf mit Begründung (200 Wörter). 2) Beschwerde an einen Anbieter (250 Wörter).

**tr.c1.e09 – Ein Projekt vorstellen**

- Kann: Ich kann ein Projekt überzeugend und höflich präsentieren. Ich kann Bitten, Kritik und Widerspruch diplomatisch formulieren. Ich kann auf Fragen aus dem Publikum spontan reagieren.
- Sprechhandlungen: präsentieren, diplomatisch kritisieren, um Zustimmung bitten, auf Fragen reagieren
- Geschichte: Can und Samīr stellen im Stadtteilbeirat ein Reparaturcafé vor, in dem Ehrenamtliche Fahrräder und Geräte reparieren; Beiratsmitglied Frau Fischer äußert Bedenken zur Raumfrage, sie antworten diplomatisch. Dialog (Lektion): Selin bittet ihre Leitung höflich um mehr Zeit für ein Projekt. Ort: Stadtteilzentrum, Büro.
- Lesen: 1) Projektbeschreibung eines Reparaturcafés. 2) Leitfaden für gute Präsentationen. 3) Protokollauszug des Stadtteilbeirats. 4) Ratgeber: Kritik freundlich äußern.
- Sprechen: 1) Ein Projekt in fünf Minuten präsentieren. 2) Kritik diplomatisch äußern und auf Kritik antworten.
- Schreiben: 1) Projektskizze (250 Wörter). 2) Höfliche Ablehnung eines Vorschlags mit Alternativvorschlag (200 Wörter).

**tr.c1.e10 – Erzählen und Erzähltes**

- Kann: Ich kann literarische Kurztexte verstehen und ihre Wirkung beschreiben. Ich kann Sprichwörter deuten und passend zitieren. Ich kann gehobene vergleichende Formen erkennen und verwenden.
- Sprechhandlungen: deuten, zusammenfassen, Wirkung beschreiben, zitieren
- Geschichte: Im Literaturkreis der Stadtbibliothek lesen Ayla, Paul und Dīma eine türkische Kurzgeschichte über einen Fischer; sie sprechen über den Erzähler und ein Sprichwort am Schluss. Dialog (Lektion): Opa Metin erklärt Elif, wann er ein bestimmtes Sprichwort benutzt. Ort: Stadtbibliothek, Balkon in İzmir.
- Lesen: 1) Eigene Kurzgeschichte über einen Fischer und seinen Enkel. 2) Sachtext über Sprichwörter im Alltag. 3) Buchbesprechung (vereinfacht). 4) Erzähltext mit Formen auf -cesine.
- Sprechen: 1) Eine Kurzgeschichte nacherzählen und deuten. 2) Ein Sprichwort erklären und eine passende Situation erzählen.
- Schreiben: 1) Kurze Erzählung mit einem Sprichwort als Schluss (250 Wörter). 2) Buchbesprechung (200 Wörter).

**tr.c1.e11 – Grundrechte im Alltag**

- Kann: Ich kann sachliche Texte über Grundrechte und Gerichte verstehen, ohne Parteien oder Streitfragen. Ich kann Wortfamilien aus Lehnwörtern der Schriftsprache erschließen. Ich kann ein rechtliches Verfahren neutral beschreiben.
- Sprechhandlungen: Verfahren beschreiben, Begriffe erklären, sachlich nachfragen
- Geschichte: Elif macht ein Praktikum bei einer Anwaltskanzlei; Anwältin Ebru erklärt ihr, wie ein Verfahren am Amtsgericht abläuft und was Gleichbehandlung im Alltag bedeutet, am Beispiel einer Wohnungsbewerbung. Dialog (Lektion): Can fragt nach seinem Einsatz als Zeuge eines kleinen Parkunfalls, wie eine Aussage abläuft. Ort: Kanzlei, Gerichtsflur.
- Lesen: 1) Sachtext über Gleichbehandlung im Alltag. 2) Ablauf einer Verhandlung am Amtsgericht (vereinfacht). 3) Glossar juristischer Lehnwörter. 4) Kurzer Bericht über einen Tag der offenen Tür am Gericht.
- Sprechen: 1) Einen Verfahrensablauf neutral erklären. 2) Drei Fachwörter aus einer Wortfamilie erklären.
- Schreiben: 1) Sachlicher Bericht über einen Gerichtsbesuch (250 Wörter). 2) Erklärtext zu einem Grundbegriff für Jugendliche (200 Wörter).

**tr.c1.e12 – Sprache und Wirkung**

- Kann: Ich kann rhetorische Mittel in Reden und Texten erkennen und ihre Wirkung beschreiben. Ich kann Wortstellung und Betonung gezielt für Wirkung einsetzen. Ich kann eine kurze Rede wirkungsvoll halten.
- Sprechhandlungen: Wirkung analysieren, betonen, eine Rede halten, Rückmeldung geben
- Geschichte: Elif soll bei der Abschlussfeier ihrer Schule eine kurze Rede halten; Rhetoriktrainerin Clara zeigt ihr, wie Betonung, Pausen und Wortstellung wirken, Can hört die Probe und gibt Rückmeldung. Dialog (Lektion): Nilay und Tolga analysieren eine Werbebotschaft auf Übertreibungen (ohne Marke). Ort: Aula, Redaktion.
- Lesen: 1) Abschlussrede einer Schülerin (eigener Text). 2) Sachtext über rhetorische Mittel. 3) Analyse einer Rede (vereinfacht). 4) Kurztext über Gesprächsstil in Interviews.
- Sprechen: 1) Eine zweiminütige Rede mit bewusster Betonung halten. 2) Die Wirkung einer Rede analysieren.
- Schreiben: 1) Kurze Rede zu einem feierlichen weltlichen Anlass (250 Wörter). 2) Analyse eines Redeausschnitts (200 Wörter).

**tr.c1.e13 – Diskutieren mit Gefühl**

- Kann: Ich kann feine Bedeutungsnuancen durch Partikeln verstehen und verwenden. Ich kann in einer lebhaften Diskussion Gefühle und Argumente ausdrücken, ohne verletzend zu werden. Ich kann eine Diskussion zu einem Kompromiss führen.
- Sprechhandlungen: Nuancen ausdrücken, widersprechen, beschwichtigen, Kompromisse finden
- Geschichte: Bei einer Stadtteilrunde diskutieren Anwohnende über einen neuen Jugendtreff; Murat ist zuerst skeptisch, Elif und Rāmī argumentieren mit Herz, Moderatorin Monika führt die Runde zu einem Kompromiss. Dialog (Lektion): Can und Elif streiten über die Aufgabenverteilung und versöhnen sich. Ort: Stadtteilzentrum, Küche.
- Lesen: 1) Bericht über eine Stadtteilversammlung. 2) Gesprächsprotokoll mit vielen Partikeln. 3) Ratgeber: fair streiten. 4) Kommentar über Diskussionskultur.
- Sprechen: 1) In einer Diskussion widersprechen und beschwichtigen. 2) Eine Diskussion zusammenfassen und einen Kompromiss vorschlagen.
- Schreiben: 1) Stellungnahme zu einem Stadtteilprojekt (250 Wörter). 2) Zusammenfassung einer Diskussion mit Kompromiss (200 Wörter).

**tr.c1.e14 – Rückblick und Ausblick**

- Kann: Ich kann meine Sprachbiografie und meine beruflichen Ziele differenziert darstellen. Ich kann Register, Stil und Ton situationsgerecht wählen. Ich kann komplexe Texte aus Alltag, Beruf und Verwaltung selbstständig erschließen.
- Sprechhandlungen: reflektieren, Ziele darstellen, Register wählen, zusammenfassen
- Geschichte: Can hat die Gesellenprüfung bestanden, Elif beginnt ein Studium; bei einem Familienabend blicken alle zurück, Oma Sevim erzählt von ihren ersten Wörtern Deutsch, Elif von ihren ersten Sätzen Türkisch. Dialog (Lektion): Can bewirbt sich um eine Weiterbildung zum Meister und spricht mit Beraterin Katharina über seine Ziele. Ort: Wohnzimmer, Beratungsstelle.
- Lesen: 1) Sprachbiografie einer jungen Erwachsenen. 2) Weiterbildungsangebot einer Kammer (vereinfacht). 3) Essay über Lernen im Erwachsenenalter. 4) Auszug aus einem Familienbrief über drei Generationen.
- Sprechen: 1) Die eigene Sprachbiografie und Ziele vortragen. 2) Ein Beratungsgespräch über Weiterbildung führen.
- Schreiben: 1) Motivationsschreiben für eine Weiterbildung (250 Wörter). 2) Reflexion über das eigene Sprachenlernen (250 Wörter).

## 7 Wortschatz und Abdeckung

### 7.1 Verteilung der Lemma-Budgets

Die Budgets steigen innerhalb jeder Stufe leicht an: Am Anfang einer Stufe kommt neue Grammatik hinzu, gegen Ende wächst der Wortschatz. Die letzte Einheit einer Stufe wiederholt die Grammatik der ganzen Stufe. In A1 hat sie deshalb ein kleineres Budget (50), auf den übrigen Stufen das höchste, weil dort bekannte Strukturen auf neue Themen treffen.

| Stufe | Budgets je Einheit | Summe |
|---|---|---|
| A1 | 40 · 45 · 50 · 50 · 50 · 50 · 50 · 50 · 55 · 55 · 55 · 50 | 600 |
| A2 | 60 · 60 · 62 · 62 · 64 · 64 · 64 · 64 · 66 · 66 · 66 · 66 · 68 · 68 | 900 |
| B1 | 76 · 78 · 78 · 80 · 80 · 80 · 80 · 82 · 82 · 82 · 82 · 82 · 84 · 84 · 84 · 86 | 1.300 |
| B2 | 100 · 102 · 104 · 104 · 106 · 106 · 106 · 106 · 106 · 108 · 108 · 108 · 108 · 108 · 110 · 110 | 1.700 |
| C1 | 136 · 138 · 140 · 140 · 142 · 142 · 142 · 144 · 144 · 144 · 144 · 146 · 148 · 150 | 2.000 |

### 7.2 Messung (Machbarkeit)

- **Daten:** wordfreq 3.1.1 `small_tr` (Top 50.000; für Türkisch gibt es nur die kleine Liste), FrequencyWords 2018 tr als Gegenprobe, kaikki-Kernauszug tr (top-20000, 22.361 Einträge), Tatoeba-Satzauszug tur (Beleg S7 §3.7). Aus den Daten wurden nur Zahlen übernommen.
- **Verfahren:** Die Wortformen der Häufigkeitslisten werden auf Lemmata des kaikki-Kerns zurückgeführt. Dafür nimmt ein Regelverfahren Kasus-, Possessiv-, Personal- und Verbendungen ab und berücksichtigt Erweichung (kitabı → kitap) und Vokalausfall. Ausgenommen sind Treffer im Tabu-Lexikon des Leitfadens, Begriffe mit Religionsbezug (R-01…R-13, F-tr-01…F-tr-15 und allgemeine Religionswörter), Einträge mit anstößigem Register in kaikki, reine Namen und Kürzel sowie nicht zuordenbare Token (Spam, Fremdwörter wie „the“, „http“).
- **Grenzen:** Das Regelverfahren ist eine Näherung (einzelne Formen wie „olan“, „oldu“ zählen als eigene Lemmata, wenige Fehlzuordnungen). Die Zahlen sind auf wenige Prozentpunkte genau. In L3 misst das Werkzeug die tatsächlichen Lemmalisten genauer, optional mit Zemberek (Apache-2.0, nur lokal, PLAN §6.4).

**Lemmata hinter den häufigsten Wortformen** (nach Ausschluss):

| Liste | Top-500 | Top-1.000 | Top-2.000 | Top-5.000 | Top-10.000 |
|---|---|---|---|---|---|
| wordfreq 3.1.1 small_tr | 433 | 771 | 1.387 | 2.898 | 4.881 |
| FrequencyWords 2018 (Gegenprobe) | 414 | 713 | 1.240 | 2.528 | 4.060 |
| in beiden Listen (robuste Kernmenge) | 294 | 511 | 922 | 2.030 | – |
| in mindestens einer Liste | 553 | 973 | 1.705 | 3.396 | – |

**Ausgeschlossen unter den Top-1.000 (wordfreq):** 10 Tabu-Treffer (z. B. Politik- und Musikwörter), 4 Begriffe mit Religionsbezug, 47 Namen und Kürzel, 5 mit anstößigem Register, 15 nicht zuordenbar (Spam, Fremdwörter, abgetrennte Endungen).

**Simulation:** Ein Anteil jedes Stufenbudgets wird strikt nach Häufigkeit gefüllt, der Rest mit Themenwörtern. Das ist eine Obergrenze: In der Praxis werden manche häufigen Wörter (Nachrichten- und Formalsprache) später eingeführt.

| Anteil nach Häufigkeit | Stufe | Top-500 | Top-1.000 | Top-2.000 | Top-5.000 |
|---|---|---|---|---|---|
| 70 % | A1 | 97,0 % | 54,5 % | 30,3 % | 14,5 % |
| 70 % | A2 | 100,0 % | 100,0 % | 75,7 % | 36,2 % |
| 70 % | B1 | 100,0 % | 100,0 % | 100,0 % | 67,6 % |
| 70 % | B2 | 100,0 % | 100,0 % | 100,0 % | 100,0 % |
| 80 % | A1 | 100,0 % | 62,3 % | 34,6 % | 16,6 % |
| 80 % | A2 | 100,0 % | 100,0 % | 86,5 % | 41,4 % |
| 80 % | B1 | 100,0 % | 100,0 % | 100,0 % | 77,3 % |
| 80 % | B2 | 100,0 % | 100,0 % | 100,0 % | 100,0 % |

Gegenprobe mit FrequencyWords (70 %): A1 Top-1.000 58,9 %, A2 Top-2.000 84,7 %, B1 Top-5.000 77,5 %. Mit gemeinsamer Rangfolge beider Listen deckt A1 bei 70 % die robuste Kernmenge zu 89,5 %, bei 75 % zu 91,5 %.

### 7.3 Zielwerte je Stufe

Gezählt wird kumuliert: Anteil der Lemmata hinter den Top-N-Wortformen von wordfreq (nach Ausschluss), die bis zum Ende der Stufe eingeführt sind. Die Zielwerte liegen unter der Simulation mit 70 % nach Häufigkeit, damit Raum für Themenwörter bleibt. „Robuste Kernmenge“ sind die 294 Lemmata, die in beiden Listen unter den Top-500 liegen. Damit ist das Ziel „A1 deckt die häufigsten alltagstauglichen ≈ 500 Wörter weitgehend ab“ messbar: ≥ 85 % der Top-500-Lemmata und ≥ 88 % der robusten Kernmenge.

| Stufe (Σ Lemmata) | Top-500 | Top-1.000 | Top-2.000 | Top-5.000 | weitere | Textabdeckung (Hinweis) |
|---|---|---|---|---|---|---|
| A1 (600) | ≥ 85 % | ≥ 50 % | ≥ 28 % | ≥ 13 % | Kernmenge ≥ 88 % | ≈ 52 % / 63 % |
| A2 (1.500) | ≥ 97 % | ≥ 85 % | ≥ 65 % | ≥ 30 % | – | ≈ 68 % / 76 % |
| B1 (2.800) | – | ≥ 95 % | ≥ 88 % | ≥ 60 % | – | ≈ 78 % / 84 % |
| B2 (4.500) | – | ≥ 98 % | ≥ 95 % | ≥ 85 % | – | ≈ 84 % / 89 % |
| C1 (6.500) | – | – | ≥ 98 % | ≥ 93 % | Top-10.000 ≥ 75 % | ≈ 88 % / 91 % |

Textabdeckung: Anteil laufender Wörter (wordfreq / FrequencyWords), die bei 80 % Häufigkeitsanteil bekannt sind; nur zur Orientierung, kein Prüfwert.

### 7.4 Satzvorrat und Wortfelder

- **Tatoeba (tur):** 22.564 Sätze ohne negative Bewertung, davon 21.330 mit höchstens acht Wörtern. Nur Wörter aus dem simulierten Wortschatz (80 % nach Häufigkeit, ohne Tabu- und Religionstreffer) enthalten bis A1 1.448, bis A2 4.294 und bis B1 7.167 Sätze (vor Qualitäts- und Leitfadenfilter). Der Bedarf von 2.400 A1-Sätzen wird also überwiegend durch KI-Sätze gedeckt (PLAN §6.3); Tatoeba-Sätze kommen nur nach Standardfilter S7-E3 und Leitfaden dazu, mit Namensnennung je Satz. Für `tr-aus-ar` gibt es nur 2.408 direkte Paare tr–ar.
- **Wortfelder:** 155 Wortfelder mit je vier bis sieben Beispielen. Die Beispiele sind Richtungsangaben für den Entwurf, keine Lemmaliste. Rang der Beispiele in wordfreq (Stufe der ersten Nutzung):

| Stufe | Beispiele | in Top-1.000 | in Top-2.000 | in Top-5.000 | in Top-50.000 | nicht gefunden |
|---|---|---|---|---|---|---|
| A1 | 181 | 61 | 85 | 134 | 179 | 2 |
| A2 | 169 | 34 | 62 | 105 | 166 | 3 |
| B1 | 155 | 22 | 43 | 76 | 145 | 10 |
| B2 | 155 | 26 | 46 | 83 | 148 | 7 |
| C1 | 134 | 13 | 27 | 64 | 128 | 6 |

Mehrwortausdrücke zählen mit dem seltensten Wort. Erwartungsgemäß nimmt der Anteil sehr häufiger Wörter mit der Stufe ab; nicht gefunden sind vor allem Fachwörter (z. B. tutanak, tebliğ, cayma hakkı).

- **Prüfung der Beispiele:** 0 Treffer im Tabu-Lexikon (tr) und 0 Begriffe mit Religionsbezug in allen türkischen Beispielen (Grammatik, Wortfelder, Vorkurs). Der Prüfer erkennt die Positivproben (sigara, parti, fal, aşk, müzik) und lässt die Ausnahmen (biraz, sigara böreği, doğum günü partisi, falan, başka) durch.

## 8 Kandidaten mit Religionsbezug (gesperrt)

Nur IDs aus dem Leitfaden (§4.1, §4.2), hier mit Art und Anlass, ohne Wortlaut der Formeln. Sie zeigen, wo ein Eintrag nach zwei religiösen Freigaben natürlich vorkommen könnte. Bis dahin entsteht kein Eintrag damit, der sichtbar wäre. Orte und Ereignisse erst ab ihrer Mindeststufe (meist A2).

| Einheit | Kandidaten (Leitfaden) |
|---|---|
| tr.a1.e01 Merhaba, ben Elif | F-tr-01 (Gruß, Anlass: Begegnung); F-tr-03 (Dank, Anlass: Antwort auf die Frage nach dem Befinden); F-tr-07 (Abschied, Anlass: beim Gehen, vor allem Ältere) |
| tr.a1.e10 Zu Gast bei Oma Sevim | F-tr-02 (Beginn, Anlass: vor dem Essen oder einer Arbeit) |
| tr.a2.e03 Ferienpläne | F-tr-04 (Zukunft, Anlass: Pläne und Verabredungen) |
| tr.a2.e04 Gute Nachbarschaft | R-03 (Ereignis: Gebet, Freitagsgebet); F-tr-06 (Dank, Anlass: Dank für eine Hilfe) |
| tr.a2.e08 Lernen für die Klassenarbeit | R-08 (Kalender: Weihnachten, Ostern, Pfingsten); R-11 (Unterricht: Koranunterricht) |
| tr.a2.e09 Die große Familie | F-tr-05 (Bewunderung, Anlass: Lob für Kinder, Arbeit, Erfolg) |
| tr.a2.e11 Umzug in eine neue Wohnung | R-01 (Ort: Moschee); R-02 (Ort: Kirche, Synagoge) |
| tr.a2.e12 Was willst du werden? | R-10 (Beruf: Imam, Pfarrer) |
| tr.a2.e13 Eine Hochzeit in der Familie | R-04 (Zeit: Ramadan, Fasten); R-05 (Ereignis: Fastenbrechen); R-06 (Fest: Ramadanfest, Opferfest); F-tr-11 (Festgruß, Anlass: religiöse Feste und Zeiten) |
| tr.b1.e04 Eine Reise nach Kappadokien | R-12 (Reise: Pilgerfahrt) |
| tr.b1.e09 Ärger im Treppenhaus | F-tr-13 (Höflichkeit, Anlass: Zurückweisen eines Lobes oder einer Entschuldigung) |
| tr.b1.e10 Wenn ich mir etwas wünschen könnte | R-07 (Fest: Kandil-Nacht); R-13 (Kalender: islamische Monatsnamen); F-tr-09 (Beileid, Anlass: Trauerfall) |
| tr.b1.e16 Wir kochen für Gäste | F-tr-02 (Beginn, Anlass: vor dem Essen oder einer Arbeit); F-tr-12 (Lob, Bitte, Anlass: Lob für eine Leistung; Abschied) |
| tr.b2.e12 Alte Handwerke | R-01 (Ort: Moschee); R-02 (Ort: Kirche, Synagoge) |

## 9 Kinder

- A1–B1: alle Einheiten `kinderGeeignet: true`, nur kindgeeignete Themen des Leitfadens (automatisch geprüft). Krankheit nur leicht (A1 e12 Halsschmerzen, A2 e07 Erkältung), Wetterereignisse ohne Verletzte (A2 e10), Verkehr ohne Unfall (B1 e06), Abschied mit Trost (B1 e10).
- B2–C1: alle `false` (Standard des Leitfadens). Erwachsenenthemen wie Pflege, Verträge, Gericht und Finanzen erscheinen sachlich. Nach Prüfung der Einträge könnten auf `true` gesetzt werden: B2 e07, e09, e15 und C1 e06, e07 (Themen Natur, Wissenschaft und Statistik). Die Entscheidung über die Anzeige für Kinderkonten fällt in L7 (OF-15).
- Keine Geheimnisse vor den Eltern: Passwörter werden „nicht an Fremde weitergegeben“ (A2 e14); Sicherheit im Netz ist Thema (B1 e08).

## 10 Offene Fragen

Alle laufen mit ihrem Standard weiter (L3-E12).

| ID | Frage | Standard | Wer |
|---|---|---|---|
| OF-tr-01 | Mehrere Lese-, Sprech- und Schreibaufgaben je Einheit stehen als nummerierte Zeichenkette. Sollen `lesetext`, `sprechen` und `schreiben` im Zod-Schema (L3-02) Listen werden? | Zeichenkette „1) … 2) …“ wie im Rahmenplan Deutsch; Umstellung auf Listen für alle drei Sprachen gemeinsam | L3-02 |
| OF-tr-02 | PLAN §4 sieht `lesen_fragen` erst ab B1 vor, PLAN §5.1 aber 6 Lesetexte in A1 und 14 in A2. | A1/A2-Lesetexte mit `auswahl`, `luecke` und eingestreuten Fragen wie bei `geschichte`; Vorschlag: `lesen_fragen` ab A1 freigeben | L3-02 / Orchestrator |
| OF-tr-03 | PLAN §4 sieht `schreiben` ab B1 vor, PLAN §5.1 aber 14 Schreibaufgaben in A2. | A2: kurze gelenkte Texte (30–50 Wörter, Nachricht, Karte, Formular) mit `schreiben` und vereinfachter Prüfliste | L3-02 / Orchestrator |
| OF-tr-04 | Schreibweise arabischer Namen in türkischen Texten | ohne Längenzeichen und Sonderzeichen der Umschrift: Rīm → Rim, Samīr → Samir, Fādī → Fadi, Dīma → Dima, Rāmī → Rami, Ziyād → Ziyad | Redaktion (LM-09) |
| OF-tr-05 | „Selam“ als kurzer Alltagsgruß unter Jugendlichen ist sehr häufig, liegt aber nahe an F-tr-01. | nicht verwenden; Merhaba trägt das Lernziel; Einordnung mit der Formelliste | zwei Personen mit `religioese_pruefung` (LM-09) |
| OF-tr-06 | Wochentag „cuma“ (Freitag) | normales Wort ohne Religionsbezug; das Formel-Lexikon des Wächters erfasst nur die Phrasen „cuma namazı“ und „hayırlı cumalar“ | Redaktion / L3-Werkzeug |
| OF-tr-07 | Fehlalarm im deutschen Tabu-Lexikon: „buchstabieren“ trifft „bier“ (Übersetzungen der Richtung `tr-aus-de`, z. B. A2 e02). Türkische Kontextwörter (Hund) werden mit Endungen geschrieben („evde“). | Ausnahme „buchstab“ ergänzen; Kontextwörter im Türkischen als Wortanfang prüfen | LM-09 / L3-Werkzeug |
| OF-tr-08 | Verfeinerung gegenüber PLAN §6.2: Grundform der dass-Sätze (-diğini) und -mesi schon in B1, -iyordu in A2, -miş als Grundgebrauch in A2 und als Evidentialität in B2 | wie im Entwurf | Prüfperson (LM-02) |
| OF-tr-09 | Eigener Schnellweg für Herkunftssprachler? | kein eigener Weg; Einstufungstest, Vorkurs optional, Schreibaufgaben ab A2 | Bildung / Vorstand |
| OF-tr-10 | Umgangssprache in C1 nur verstehen oder auch selbst verwenden? | verstehen und einordnen; keine Pflicht zur Produktion; nie Schimpfwörter (G-13) | Prüfperson (LM-02) |
| OF-tr-11 | Redewendungen und Sprichwörter (C1) | nur weltliche; Wendungen mit Gottesbezug ausgeschlossen; die Liste prüft die Redaktion vor dem Entwurf | Redaktion (LM-09) |
| OF-tr-12 | Kinderkonten und B2/C1 | alle B2/C1-Einheiten `false`; Kandidaten für `true` siehe §9 | Vorstand / Bildung (OF-15) |
| OF-tr-13 | Abdeckung mit genauerem Lemmatisierer prüfen | in L3 über die tatsächlichen Lemmalisten, optional Zemberek lokal; Zielwerte aus §7.3 gelten bis dahin | L3-Werkzeug |
| OF-tr-14 | Planungstexte enthalten bewusste Ausschlussvermerke („ohne Musik- und Tanzszenen“, „keine Figur nimmt Zinskredite auf“, „ohne Parteien“). Ein Tabu-Prüfer über `rahmen/**` würde sie melden. | `rahmen/**` ist kein Inhalt und wird nicht mit dem Tabu-Lexikon geprüft; die Vermerke bleiben als Anweisung an den Entwurf | L3-Werkzeug |

## 11 Prüfungen dieses Entwurfs

- **Struktur:** Felder und Typen wie im Auftrag und wie im Rahmenplan Deutsch; JSON mit `node -e "JSON.parse(...)"` geprüft (gültig), UTF-8, zwei Leerzeichen Einrückung.
- **Mengen:** Einheiten je Stufe 12/14/16/16/14; Lemma-Budgets je Stufe 600/900/1.300/1.700/2.000 (Σ 6.500); Dialoge und Geschichten 144, Lesetexte 156, Sprechen 144, Schreiben 90 – wie PLAN §5.1.
- **Grammatik:** 109 IDs, jede genau einmal eingeführt (Stufe passt), jede später wiederholt, alle Voraussetzungen vorher eingeführt; keine Einheit ohne Grammatik oder Wortfeld; alle 155 Wortfelder genutzt.
- **Themen:** alle aus dem Leitfaden, Stufe im erlaubten Bereich, in A1–B1 nur kindgeeignete Themen.
- **Kandidaten:** alle IDs im Leitfaden vorhanden, keine Orte oder Ereignisse unter ihrer Mindeststufe.
- **Namen:** 57 verschiedene Namen in den Geschichten, alle aus der Namensliste; keine ausgeschlossenen Namen; Familiennamen erst ab A2.
- **Tabu und Religion:** 0 Treffer in den türkischen Beispielen (Prüfer mit Positiv- und Negativproben getestet).
- **Arabische Schrift:** 0 Zeichen aus U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF in beiden Dateien.
- **GER:** alle Kann-Beschreibungen eigene, situationsbezogene Formulierungen; keine Deskriptoren übernommen oder übersetzt; keine fremden Lehrwerke nachgebaut, eigene Titel und Themenfolge.

## 12 Abnahme (LM-02, ≈ 3 h)

Die Prüfperson sieht sich an:

1. Grammatikfolge (§5): passt die Reihenfolge zum Lernen von Kindern, Jugendlichen und Erwachsenen? Fehlt etwas Wichtiges?
2. Themen und Geschichten (§6): alltagsnah, familientauglich, ohne Klischees? Passen Schauplätze und Figuren zur Gemeinde?
3. Kann-Beschreibungen (§3, §6): verständlich, eigene Formulierungen, erreichbar?
4. Mengen und Abdeckung (§3.1, §7): stimmen die Mengen mit PLAN §5.1 überein? Sind die Zielwerte vernünftig?
5. Kinder und Religion (§8, §9): keine Inhalte gegen den Leitfaden, Kandidaten nur markiert.
6. Offene Fragen (§10): Standard bestätigen oder ändern.

Ergebnis: „abgenommen“ oder Liste der Änderungen. Bis dahin gilt dieser Entwurf.

## 13 Übergabe an L3

1. **Schema (L3-02):** Die Struktur entspricht der des Rahmenplans Deutsch (gleiche Felder und Typen). Offene Punkte: OF-tr-01 bis OF-tr-03.
2. **Entwurf (PLAN §6.3, Phase E):** Je Einheit erhält der Agent den Rahmen-Eintrag mit Grammatik (neu und Wiederholung), Wortfeldern, Budget, Geschichte, Aufgaben, Leitfaden und KI-Regel 2. Die Kandidaten mit Religionsbezug werden nur als gesperrte, markierte Einträge erzeugt oder ganz weggelassen.
3. **Prüfer (`lernapp:pruefen`):** Lemma-Budget je Einheit, Satzlänge je Stufe, Vokal- und Konsonantenharmonie (Warnung), Abdeckungsziele je Stufe (§7.3) als Bericht, `kinderGeeignet` je Einheit.
4. **Kontrastdokumente:** `_lernapp/lehrplan/kontrast-tr-aus-de.md` (Artikel fehlen, Verb am Ende, Vokalharmonie, ı/i) und `kontrast-tr-aus-ar.md` (Lateinschrift, Vokale ausgeschrieben, arabische Lehnwörter mit anderer Bedeutung, kein Genus).
5. **Werkzeuge:** Mess- und Bauskript dieses Entwurfs liegen im Scratchpad des Orchestrators unter `l3-rahmen-tr/` (`messen_tr.py`, `bauen_tr.py`); die Übernahme nach `_lernapp/werkzeuge/` ist für L3 vorgeschlagen.
