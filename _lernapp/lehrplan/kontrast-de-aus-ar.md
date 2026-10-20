# Kontrastdokument Deutsch aus Arabisch (`de-aus-ar`)

- **Stand:** 20.10.2026, Version 0.1.0-entwurf (L3-01, vorgezogen)
- **Status:** Entwurf. Er gilt als Standard für die kontrastiven Tipps, Ablenker und angenommenen Antworten der Richtung `de-aus-ar`, bis die Muttersprachler-Stichprobe (LM-01) und die Abnahme des Rahmens (LM-02) andere Ergebnisse bringen.
- **Zweck:** Grundlage für die Phase Ü (Übersetzung je Richtung) der Inhalts-Pipeline (PLAN §6.3) und für die ≈ 300 kontrastiven Tipps je Richtung (PLAN §5.1). Ablage nach PLAN §6.1.
- **Bezug:**
  - Rahmenplan Deutsch: `web/inhalte/lernapp/rahmen/de.rahmen.json`, `RAHMEN-de.md` §7 (Vorkurs Lateinschrift) und §11 (Kontrastive Schwerpunkte)
  - PLAN §4 (Übungstypen, `schrift_latein`, Antwortabgleich §4.1), §5.1, §6.1–§6.4
  - KERN §2 (KI-Regel 2), §3 (arabische Schrift nur in freigegebenen Dateien), §5 (Kinderschutz), §7 (Oberfläche von rechts nach links)
  - Inhaltsleitfaden `_lernapp/lehrplan/INHALTSLEITFADEN.md` (Tabu-Lexikon, Namen, Formel-Kandidaten §4.2, weltliche Alternativen §4.3)
  - Beleg S7 (`_lernapp/belege/S7-sprachdaten.md`), ADR 0041, ADR 0045
- **Gegenstück:** `_lernapp/lehrplan/kontrast-de-aus-tr.md`
- **Umfang:** 123 Grammatik-IDs mit Kontrast (§2), 15 falsche und halbe Freunde (§3.1), 297 Tipp-Themen auf 78 Einheiten-Schlüssel (§6).

> **KI-Regel 2 (ADR 0040, KERN §2):** Keine Koranverse, Hadithe, Bittgebete oder anderen religiösen Texte (weder arabisch
> noch übersetzt), keine Koran-Wortbedeutungen, keine Fiqh-Aussagen. Der Sprachkurs ist ohne Religionsbezug. Religiöse Formeln
> gibt es nur aus einer später von zwei Gelehrten freigegebenen Liste; hier stehen sie nur als Verweis auf die gesperrten
> Kandidaten des Leitfadens (§4.7), nie als Lernziel. Arabische Schrift ist in dieser Datei verboten: Arabisch steht nur in
> Umschrift (DIN 31635 vereinfacht).

**Lesart.**
- „Arabisch“ meint das Hocharabische (fuṣḥā), wie es Schule und Medien vermitteln. Wo ein Dialekt anders ist, steht das ausdrücklich da („dialektal“, mit Region).
- Arabische Wörter stehen in Umschrift, deutsche Beispiele in normaler Schreibung.
- In der Spalte „typischer Fehler“ stehen fehlerhafte Formen in „…“. Sie sind Material für Ablenker und für den Abgleich (PLAN §4.1), nie Musterlösung.
- „Vertraut“ markiert eine Brücke: Das Arabische kennt die Sache schon. Tipps nennen die Brücke zuerst.
- Aufgenommen sind nur Kontraste, die sicher sind. Was die Stichprobe bestätigen soll, trägt „zu prüfen“ und steht zusätzlich in §8.

**Wer lernt.** Arabischsprachige jeden Alters, die in Deutschland leben, aus verschiedenen Ländern und mit verschiedenen Dialekten: Kinder ab etwa zehn, die neu in die Schule kommen, Jugendliche, Eltern und Ältere. Viele lernen die Lateinschrift neu (Vorkurs `de.v.l01`–`de.v.l06`). Manche kennen Englisch oder Französisch (§3.5, §5).

## 0 Kurzfassung

- **Schrift:** Die Lateinschrift ist für viele neu: Leserichtung von links nach rechts, einzelne Druckbuchstaben, Groß- und Kleinbuchstaben, alle Vokale werden geschrieben. Der Vorkurs `de.v.l01`–`de.v.l06` trägt diese Tipps.
- **Laute:** p, v, ö, ü sowie e/i und o/u fehlen im Hocharabischen. Konsonantenhäufungen (Straße, Herbst) sind ungewohnt. Vertraut sind der ach-Laut (wie ḫ), das hintere r (ähnlich ġ), h und der Knacklaut (wie Hamza), dazu die Vokallänge.
- **Größte Hürden:** drei Genera statt zwei, ein Artikel, der Genus und Fall zeigt, das Verb auf Platz 2 und am Satzende, Adjektiv und Attribute vor dem Nomen, der Dativ.
- **Starke Brücken:** Kasus aus der Hochsprache (mafʿūl bihi = Akkusativ), Iḍāfa = Genitiv in derselben Reihenfolge, Präpositionen bestimmen den Fall, Zahlen 21–99 mit dem Einer zuerst, Partizipien (ism fāʿil, ism mafʿūl), Maṣdar und Nominalstil, -in wie die Femininendung -a.
- **Fallen:** Die Kopula fehlt im Nominalsatz („Das Zimmer groß“). „min“ beim Vergleich wird zu „von“. Der Rückverweis im Relativsatz bleibt stehen („…, den du ihn bekommen hast“). Das Genus wird übertragen; bei häufigen Nomen stimmt es nur in etwa zwei Dritteln überein.
- **Wortschatz:** Grob 6–10 % der häufigen deutschen Nomen haben eine ähnlich klingende arabische Übersetzung (deutlich weniger als im Türkischen). Dazu kommen deutsche Wörter arabischer Herkunft (Zucker, Tasse, Matratze, Ziffer) und 15 falsche oder halbe Freunde.
- **Pragmatik:** Das Hocharabische hat kein grammatisches „Sie“. Respekt zeigt es über Anrede und Titel (ustāḏ, duktūr, ʿammū). Im Deutschen gilt Herr oder Frau mit dem Familiennamen. Religiöse Formeln bleiben gesperrt.
- **Tipps:** 297 Tipp-Themen, verteilt auf den Vorkurs `de.v.l01`–`de.v.l06` und alle 72 Einheiten (§6).

## 1 Laut und Schrift

### 1.1 Schrift und Rechtschreibung

Die Lateinschrift ist für viele Lernende neu. Der Vorkurs (`de.v.l01`–`de.v.l06`, Übungstyp `schrift_latein`) führt sie ein; die Tabelle zeigt, welcher Kontrast in welche Lektion gehört.

| Bereich | Deutsch | Arabisch | typische Verwechslung | Vorkurs |
|---|---|---|---|---|
| Richtung | von links nach rechts | von rechts nach links; Zahlen von links nach rechts | Zeilen oder Wörter von rechts begonnen | l01 |
| Buchstabenformen | Druckbuchstaben stehen einzeln | Buchstaben werden verbunden und haben Formen je nach Stellung | Buchstaben verbunden oder ohne Abstand geschrieben | l01 |
| Spiegelformen | b/d, p/q, n/u, m/w | – | b und d vertauscht | l01 |
| Groß und klein | zwei Formen je Buchstabe | eine Form | Großbuchstaben mitten im Wort | l02 |
| Großschreibung | alle Nomen, Satzanfang, Namen, Anrede Sie | – | Nomen klein | l02 |
| Vokale | alle werden geschrieben, auch kurze | kurze Vokale meist nicht geschrieben | Vokalbuchstaben fehlen („Mnsch“; häufig berichtet, zu prüfen) | l04 |
| Umlaute, ß | ä, ö, ü, ß | fehlen | „Mutter“ für „Mütter“; ß als B gelesen | l03 |
| Buchstabengruppen | sch, ch, ei, ie, eu, ck, tz; st und sp am Wortanfang | ein Zeichen je Laut | „ei“ als e-i gelesen | l06 |
| Doppelkonsonant | zeigt einen kurzen Vokal davor | Šadda verdoppelt den Laut hörbar | „Bett“ mit langem t | l06 |
| Dehnung | ie, Dehnungs-h, Doppelvokal (Tee) | Langvokal mit eigenem Buchstaben | Längezeichen vergessen | l04 |
| Wortgrenzen | „und“, „mit“, „der“ sind eigene Wörter | wa-, bi-, li-, al- hängen am nächsten Wort | „unddann“, „mitdem“ (zu prüfen) | l06 |
| Ziffern | europäische Ziffern | östlich-arabische Ziffern (Levante, Irak, Ägypten, Golf) oder europäische (Maghreb) | Die östlich-arabische Fünf ähnelt einer Null, die Null ist ein Punkt; Sieben und Acht sind Winkelformen | l01 |
| Satzzeichen | Komma, Fragezeichen | Komma und Fragezeichen gedreht bzw. gespiegelt | gespiegeltes Fragezeichen | l02 |
| Auslaut | b, d, g am Wortende klingen wie p, t, k | wie geschrieben | „Kind“ mit hörbarem d | l05 |
| Tastatur | QWERTZ, Umlaute auf eigenen Tasten | arabische Tastatur, oft mit lateinischer QWERTY-Belegung | y und z vertauscht; Umlaute fehlen | l03 |

**Buchstabieren.** Die deutschen Buchstabennamen (a, be, ze, de, e, ef, ge, ha, i, jott, ka, el, em, en, o, pe, ku, er, es, te, u, fau, we, iks, ypsilon, zett) haben mit den arabischen Namen (alif, bāʾ, tāʾ …) nichts gemein. Für Namen am Telefon und im Amt üben (A1-e01, A2-e09).

**Namen in Lateinschrift.** Arabische Namen werden in Pässen unterschiedlich geschrieben (Ḫālid etwa als Khalid, Chalid oder Khaled). Lernende schreiben ihren Namen genau wie im Pass (Vorkurs l06, A2-e09).

### 1.2 Laute

| Bereich | Deutsch | Hocharabisch | Folge beim Hören und Sprechen | Übung |
|---|---|---|---|---|
| p | eigener Laut | fehlt | „Baar“ für „Paar“ | Paar – bar, packen – backen |
| v, w | w = stimmhaftes f; v meist wie f | fehlt (w ist ein Halbvokal wie im Englischen) | „Wasser“ mit englischem w | fahren – waren, vier – wir |
| e und i, o und u | fünf Vokalqualitäten, dazu ä, ö, ü | drei (a, i, u), lang und kurz; Dialekte haben oft auch e und o | e/i und o/u verwechselt | liegen – legen, Ohr – Uhr |
| ö, ü | gerundete Vorderzungenvokale | fehlen | ü → i, ö → e | Tür – Tier, lösen – lesen |
| Vokallänge | unterscheidet Wörter, zusammen mit der Klangfarbe | unterscheidet Wörter | Vertraut; neu ist die Klangfarbe (Miete – Mitte) | Staat – Stadt |
| Unbetonte Endungen | -e als Murmellaut, -er fast wie a | volle Vokale | „Lehrer“ mit vollem e | bitte – bitten – bitter |
| Diphthonge | ei, au, eu | ay, aw | Vertraut bei ei (wie ay) und au (wie aw); neu ist eu | Leute – Laute |
| ach-Laut | rau nach a, o, u | wie ḫ | Vertraut | Buch, Nacht, acht |
| ich-Laut | weich nach e, i, ä, ö, ü | fehlt | „ich“ wie „isch“ oder mit ḫ | mich – misch, Bücher |
| r | meist hinten gesprochen | Zungen-r; das hintere r ähnelt ġ | Vertraut (ġ) | rot, Regen |
| h, Knacklaut | h, Knacklaut vor Vokal | h, Hamza | Vertraut | Haus, be-achten |
| Konsonantenhäufungen | Str-, Spr-, Schl-, Pfl-, -rbst, -chts | keine Häufung am Wortanfang | Hilfsvokal davor oder dazwischen („Istraße“) | Straße, Spiel, Herbst, Obst |
| z, pf | ts, pf | ts nur als Folge, pf fehlt | Pf als f | Zeit, Pferd, Apfel |
| ng | ein Laut | n + g | „lang“ mit hörbarem g | Wange – Wanne |
| g | g | ǧ als dsch (Hochsprache); in Ägypten g | „Garten“ mit dsch (zu prüfen) | gut, Garten |
| Auslaut | b, d, g am Ende stimmlos | stimmhaft | „Kind“ mit d | Rad – Rat |

### 1.3 Hörtraining-Paare

Paare nur aus dem Alltagswortschatz und ohne Wörter des Tabu-Lexikons (Leitfaden §2). Übungstyp `minimalpaare` (PLAN §4).

| Kontrast | Paare | Einheit |
|---|---|---|
| p und b | Paar – bar, packen – backen, Gepäck – Gebäck | de.v.l05, A1-e06 |
| f, w und v | fahren – waren, Feld – Welt, vier – wir, Felder – Wälder | de.v.l05, A1-e10 |
| e und i | liegen – legen, wieder – weder, Mieter – Meter, Riegel – Regel | de.v.l04 |
| o und u | Ohr – Uhr, Mond – Mund, Tor – Tour, Kohle – Kuhle | de.v.l04 |
| ü und i | Tür – Tier, fühlen – fielen, Küste – Kiste, lügen – liegen, Bühne – Biene | de.v.l03 |
| ö und e | lösen – lesen, Höfe – Hefe, Söhne – Sehne, können – kennen | de.v.l03 |
| o und ö, u und ü | schon – schön, Mutter – Mütter, Bruder – Brüder | de.v.l03, A1-e02 |
| lang und kurz | Staat – Stadt, Miete – Mitte, Ofen – offen, Beet – Bett | de.v.l04 |
| ch, sch und k | mich – misch, Bach – back, lachen – Laken | de.v.l06 |
| ei und ie | Riese – Reise, Wiese – Weise, Biene – Beine | de.v.l06 |
| eu und au | Leute – Laute | A2-e14 |
| z und s | Zeit – seit, Zoll – soll, zehn – sehn | A1-e04 |
| pf und f | Pfund – Fund, Pflaume – Flaum, Pfad – fad | A2-e12 |
| ng und n | Wange – Wanne | A1-e10 |
| unbetonte Endungen | bitte – bitten – bitter, Lampe – Lampen | A1-e03 |
| Auslaut | Rad – Rat, seid – seit, Bund – bunt | A2-e05 |

### 1.4 Betonung, Zahlen und Rhythmus

- **Wortbetonung:** Deutsche Erbwörter betonen meist die Stammsilbe, oft die erste (ARbeit, LEHrer); trennbare Präfixe sind betont (ANrufen), untrennbare nicht (beSUchen). Fremdwörter sind oft hinten betont (UniversiTÄT).
- **Zahlen von 21 bis 99:** Vertraut. Deutsch nennt wie das Arabische den Einer zuerst: einundzwanzig wie wāḥid wa-ʿišrūn. Beim Schreiben stehen die Ziffern in beiden Sprachen von links nach rechts.
- **Uhrzeit:** „halb neun“ ist 8:30 (§2, `de.g.zeitangaben`).
- **Satzlänge:** Deutsche Sätze in Alltagstexten sind kurz; lange Ketten mit „und“ wirken ungewohnt (§2, `de.g.textkohaesion`).

## 2 Grammatik-Kontraste je Grammatik-ID

Die Tabellen folgen der Grammatikfolge des Rahmenplans (`de.rahmen.json`, 123 IDs). In Klammern steht die Einheit, die die ID einführt. „Vertraut“ markiert eine Brücke, die der Tipp zuerst nennt. Die typischen Fehler sind Erfahrungswerte aus dem Unterricht des Deutschen als Fremd- und Zweitsprache und noch nicht gemessen (§8).

### 2.1 Überblick

| Kontrast | Arabisch | Deutsch | Folge für die Tipps |
|---|---|---|---|
| Wortstellung | Verb – Subjekt – Objekt oder Subjekt vorn; Nominalsatz ohne Verb | Verb auf Platz 2 im Hauptsatz, am Ende im Nebensatz; Satzklammer | Verb am Satzende ist ganz neu. |
| Artikel und Genus | zwei Genera; al- zeigt nur Bestimmtheit | drei Genera; der Artikel zeigt Genus, Zahl und Fall | Genus nicht übertragen (Messung §7). |
| Fälle | drei in der Hochsprache (Nominativ, Akkusativ, Genitiv), keine im Dialekt | vier, sichtbar am Artikel; der Dativ ist neu | Begriffe der Schulgrammatik als Brücke (§5.3). |
| Präpositionen | immer mit Genitiv | mit Akkusativ, Dativ oder Genitiv; Wechsel nach wo/wohin | „Die Präposition bestimmt den Fall“ ist vertraut. |
| Attribut | Adjektiv, Relativsatz und Iḍāfa nach dem Nomen | Adjektiv und Partizipialattribut vor dem Nomen, Relativsatz danach | Adjektiv vor dem Nomen ab A2 üben; lange Attribute (B2) gezielt lesen. |
| Wortbildung | Wurzel und Muster | Stamm, Präfix, Kompositum mit Kern hinten | Komposita von hinten lesen. |
| Pronomen | kann fehlen; du mit Genus (anta, anti) | Pflicht; du ohne Genus | früh üben (A1-e01) |

### 2.2 A1 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `de.g.sein-pronomen` (A1-e01) | Der arabische Nominalsatz hat im Präsens kein „sein“ (anā Yazan; al-ġurfa kabīra). „du“ hat im Deutschen kein Genus (anta/anti). | „Ich Yazan.“ · „Das Zimmer groß.“ | Im Arabischen fehlt im Präsens das Verbindungswort, im Deutschen nie: Ich bin …, Das Zimmer ist … „du“ gilt für Mann und Frau. |
| `de.g.praesens-regel` (A1-e01) | Die Person steckt im arabischen Verb (askunu, taskunu, yaskunu); das Pronomen kann fehlen. Im Deutschen ist es Pflicht. | „Wohne in Wetzlar.“ · „Er wohnen …“ | Die Person steht im Deutschen hinten am Verb (-e, -st, -t) und zusätzlich als eigenes Wort davor: Ich wohne in Wetzlar. |
| `de.g.fragen` (A1-e01) | Ja/Nein-Fragen bildet das Hocharabische mit „hal“ oder „a-“ ohne Umstellung. Vertraut: Das Fragewort steht vorn (ayna, man, mā). | „Du kommst aus Syrien?“ (nur mit Stimme) | Wo im Arabischen „hal“ steht, steht im Deutschen das Verb: Hal taskunu hunā? → Wohnst du hier? |
| `de.g.artikel-genus` (A1-e02) | Zwei Genera und ein Artikel „al-“ für alles, der nur Bestimmtheit zeigt; Deutsch hat drei Genera, der Artikel zeigt Genus und Fall. Bei häufigen Nomen stimmt das Genus nur in etwa zwei Dritteln mit der arabischen Übersetzung überein (Messung §7). | „Die Tisch ist neu.“ (ṭāwila ist feminin) · „Der Wand ist weiß.“ (ǧidār ist maskulin) · Artikel fehlt | Genus nie aus dem Arabischen übernehmen, Nomen mit Artikel lernen. Brücke: Wörter auf -e sind meist „die“ (86 %), ähnlich wie -a im Arabischen. |
| `de.g.possessiv-nom` (A1-e02) | Besitz ist im Arabischen ein Suffix (kitābī, kitābuhu, kitābuhā). Vertraut: -hu/-hā unterscheiden wie sein/ihr den Besitzer. | „Buch mein“ · „meine Bruder“ | -hu → sein, -hā → ihr. Das Wort steht im Deutschen vor dem Nomen; die Endung richtet sich nach dem Ding: sein Bruder, seine Schwester. |
| `de.g.haben` (A1-e02) | Es gibt kein Verb „haben“: ʿindī, lī, maʿī. In Tatoeba-Paaren mit ʿind- steht im Deutschen nur in der Hälfte der Fälle „haben“. | „Bei mir zwei Schwestern.“ · „Mit mir Zeit.“ | ʿindī … → Ich habe …; maʿī … → Ich habe … dabei. |
| `de.g.unbest-artikel-negation` (A1-e03) | Unbestimmtheit zeigt das Fehlen von al- (und das Tanwīn); ein Wort „ein“ gibt es nicht. Nomen verneint das Hocharabische mit laysa oder lā yūǧadu. | „Das ist Stuhl.“ · „Hier ist nicht Lampe.“ | Wo im Arabischen kein „al-“ steht, braucht das Deutsche meist ein/eine. lā yūǧadu … → Es gibt kein … |
| `de.g.plural` (A1-e03) | Vertraut: Gebrochene Plurale muss man ohnehin mitlernen. Neu: Nach zwei steht kein Dual, und nach 11–99 nicht der Singular wie im Arabischen (ʿišrūna kitāban). | „zwanzig Buch“ · „zwei Buch“ | Nach jeder Zahl ab zwei steht im Deutschen der Plural: zwei Bücher, zwanzig Bücher. Plural mit dem Wort lernen – wie den gebrochenen Plural. |
| `de.g.adjektiv-praedikativ` (A1-e03) | Im Nominalsatz fehlt die Kopula, und das Adjektiv richtet sich nach dem Nomen (al-ġurfa kabīra). | „Das Zimmer groß.“ · „Die Küche ist kleine.“ | Nach „ist“ bleibt das Adjektiv immer gleich, auch bei Frauen und im Plural: Die Küche ist klein. |
| `de.g.zeitangaben` (A1-e04) | Arabisch zählt die halbe Stunde dazu (aṯ-ṯāmina wa-n-niṣf = 8:30); Deutsch nennt die nächste Stunde. | „halb acht“ für 8:30 | halb neun = 8:30: noch eine halbe Stunde bis neun. Viertel vor = illā rubʿan, Viertel nach = wa-r-rubʿ. |
| `de.g.v2-inversion` (A1-e04) | Arabisch erlaubt Verb-Subjekt-Objekt (yaḏhabu Yazan) und Subjekt vorn; Deutsch stellt das Verb im Aussagesatz starr auf Platz 2. | „Geht Yazan in die Schule.“ (als Aussage) · „Am Montag ich gehe …“ | Im Aussagesatz steht das Verb nie auf Platz 1 und immer auf Platz 2: Am Montag geht Yazan in die Schule. |
| `de.g.akkusativ` (A1-e05) | Vertraut aus der Hochsprache: das direkte Objekt (mafʿūl bihi, Endung -a); im Dialekt ist es nicht hörbar. Deutsch zeigt es am Artikel. | „Ich nehme ein Tee.“ · „Jan isst der Apfel.“ | Der Akkusativ ist das mafʿūl bihi des Deutschen; man sieht ihn am Artikel: der → den, ein → einen. |
| `de.g.vorlieben` (A1-e05) | „uḥibbu“ heißt lieben und mögen, „urīdu“ wollen; „gern“ gibt es nicht als eigenes Wort. | „Ich liebe lesen.“ · „Ich will eine Suppe.“ (am Tisch zu direkt) | uḥibbu l-qirāʾa → Ich lese gern. Am Tisch: Ich möchte … statt Ich will … |
| `de.g.praesens-vokalwechsel` (A1-e05) | Vertraut: Vokalwechsel im Stamm (kataba – yaktubu); neu ist, dass er im Deutschen nur bei du und er/sie/es auftritt. | „du esst“ · „er nehmt“ | Wie im Arabischen ändert sich der Vokal im Stamm: essen – du isst, nehmen – er nimmt. |
| `de.g.negation-nicht` (A1-e06) | Das Hocharabische verneint je nach Zeit und Satzart verschieden (lā, lam, lan, laysa, mā); Deutsch hat nicht und kein für alle Zeiten. Die Verneinung steht im Arabischen vor dem Verb. | „Ich nicht komme.“ · „Das ist nicht Apfel.“ | Nur zwei Wörter für alle Zeiten: nicht und kein. „nicht“ steht hinter dem Verb, oft am Ende: Ich komme heute nicht. |
| `de.g.mengen` (A1-e06) | Mengenangaben sind ähnlich gebaut (kīlū tuffāḥ); „kam“ fragt mit Singular (kam bayḍatan?). | „Wie viele Ei?“ · „ein Kilo Apfel“ | kam → wie viele + Plural (Wie viele Eier?); Preis: Wie viel kostet …? Nach der Menge folgt der Plural: ein Kilo Äpfel. |
| `de.g.modalverben-1` (A1-e07) | Arabisch verbindet mit „an“ + Verb direkt danach (astaṭīʿu an asbaḥa); Deutsch stellt den Infinitiv ans Satzende. | „Wir müssen machen die Hausaufgaben.“ · „Ich kann, dass ich schwimme.“ | an + Verb wird im Deutschen ein Infinitiv ganz am Ende, ohne „dass“: Ich kann gut schwimmen. |
| `de.g.imperativ` (A1-e07) | Der arabische Imperativ unterscheidet Mann, Frau und Zahl (iftaḥ, iftaḥī, iftaḥū), aber keine höfliche Form. | „Öffnen das Fenster!“ zu Erwachsenen ohne Sie · Befehl ohne bitte | Kein Unterschied Mann/Frau, aber du und Sie: Öffne bitte … / Öffnen Sie bitte … min faḍlik → bitte. |
| `de.g.konnektoren-hauptsatz` (A1-e08) | „wa“ verbindet sehr viele Sätze und steht oft am Satzanfang; li-anna ist näher an „denn“ als an „weil“. | lange Ketten mit „und … und …“ · „Und“ am Anfang jedes Satzes | „wa“ am Satzanfang lässt man im Deutschen meist weg. Nach und, aber, oder, denn bleibt die Wortstellung gleich. |
| `de.g.ort-richtung` (A1-e09) | Vertraut: Präpositionen stehen vorn (fī, ilā, min). Neu: ilā verteilt sich auf nach, zu und in; dazu zu Hause / nach Hause; Länder mit Artikel. | „Ich gehe zu Hause.“ · „in Bahnhof“ | ilā → nach (Städte, nach Hause), zu (Personen, Orte), in (in Räume). Länder: aus dem Irak, aus dem Libanon, aus Syrien. |
| `de.g.man` (A1-e09) | Allgemeine Aussagen bildet das Arabische mit yumkinu, dem Passiv oder der 2. Person. | „Kann hier spielen.“ · „Man können …“ | yumkinu … → man kann …: Hier kann man gut spielen. „man“ wie er: man geht, man kann. |
| `de.g.es-unpersoenlich` (A1-e10) | Kein Scheinsubjekt (al-ǧaww bārid; tumṭiru); „es gibt“ heißt hunāka. | „Ist kalt.“ · „Regnet.“ · „Dort ist ein Park.“ (für es gibt) | hunāka … → Es gibt …; Wetter immer mit „es“: Es regnet. Es ist kalt. |
| `de.g.akk-pronomen` (A1-e10) | Objekte hängen als Suffix am Verb (raʾaytuhu); das Genus folgt dem arabischen Wort. | Genus aus dem Arabischen übertragen (die Jacke → „ihn“) | Das Pronomen folgt dem deutschen Artikel: der → ihn, die → sie, das → es. |
| `de.g.modalverben-2` (A1-e11) | Vertraut: Das Arabische trennt Verbot (yaǧibu allā, mamnūʿ) und fehlende Pflicht (lā yaǧibu). | „Hier musst du nicht parken.“ (gemeint: darfst nicht) | yaǧibu allā / mamnūʿ → nicht dürfen; lā yaǧibu → nicht müssen. |
| `de.g.dativ-wendungen` (A1-e11) | Arabisch sagt „ana bardān“ (ich bin kalt) und „raʾsī yuʾlimunī“ (mein Kopf schmerzt mich). | „Ich bin kalt.“ · „Mein Kopf schmerzt mich.“ | ana bardān → Mir ist kalt (nicht: Ich bin kalt). Mir tut der Kopf weh. |
| `de.g.trennbare-verben` (A1-e12) | Trennbare Verben gibt es im Arabischen nicht. | „Ich aufstehe um sechs.“ | Das kleine Wort springt ans Satzende: Ich stehe um sechs Uhr auf. Im Wörterbuch steht es vorn (aufstehen). |
| `de.g.wortbildung-in` (A1-e12) | Vertraut: Die Femininendung -a (muʿallim – muʿallima) entspricht deutschem -in. | „die Arztin“ · „Lehrerinen“ | -in ist wie die arabische Femininendung: muʿallima → Lehrerin; oft mit Umlaut (Ärztin), Plural -innen. |

### 2.3 A2 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `de.g.perfekt-haben` (A2-e01) | Die arabische Vergangenheit ist eine Form (ḫabaztu); das deutsche Perfekt hat zwei Teile mit dem Partizip am Ende. | „Ich habe gebackt einen Kuchen.“ | Eine arabische Vergangenheitsform = zwei deutsche Teile: habe … gebacken (am Ende). |
| `de.g.praeteritum-sein-haben` (A2-e01) | Vertraut: kāna ist die Vergangenheit des Nominalsatzes (kuntu marīḍan). | „Ich habe krank.“ · „Gestern ich war krank.“ | kuntu → ich war; kāna ʿindī → ich hatte. |
| `de.g.perfekt-sein` (A2-e02) | Die Wahl zwischen haben und sein hat kein arabisches Gegenstück. | „Ich habe nach Gießen gefahren.“ · „geaufsteht“ | Bewegung von A nach B und Veränderung → sein: Ich bin gefahren, ich bin aufgestanden. |
| `de.g.dativ-praep` (A2-e02) | Vertraut: Die Präposition bestimmt den Fall. Im Arabischen ist es immer der Genitiv (maʿa l-abi), im Deutschen hier der Dativ. | „mit der Bus“ · „mit den Bus“ | Wie im Arabischen bestimmt die Präposition den Fall – bei mit, bei, nach, von, zu, aus, seit ist es der Dativ: mit dem Bus. |
| `de.g.dativ-objekt` (A2-e03) | Arabisch nennt den Empfänger mit li- oder als zweites Akkusativobjekt (aʿṭaytu Yazan kitāban). | „Elif schenkt ihre Oma Blumen.“ | Die Person bekommt im Deutschen den Dativ (wem?), die Sache den Akkusativ (was?). |
| `de.g.dativ-pronomen` (A2-e03) | sāʿada und aʿǧaba nehmen im Arabischen ein direktes Objekt (sāʿidnī, yuʿǧibunī). | „Kannst du mich helfen?“ | sāʿidnī → Hilf mir (nicht mich); yuʿǧibunī → gefällt mir. |
| `de.g.wechselpraep` (A2-e04) | fī, ʿalā, taḥta stehen im Arabischen mit Genitiv, ohne Unterschied zwischen Lage und Richtung; Richtung zeigt ilā. | „Wir stellen den Schrank an der Wand.“ | Erst fragen: Bewegung wohin (ilā) → Akkusativ; Ort wo (fī) → Dativ. |
| `de.g.positionsverben` (A2-e04) | „waḍaʿa“ deckt stellen, legen und setzen ab; die Lage unterscheidet das Arabische kaum. | „Ich stelle das Handy auf den Tisch.“ (flach: legen) | waḍaʿa hat im Deutschen vier Wörter: stellen, legen, hängen, setzen; dazu stehen, liegen, hängen, sitzen. |
| `de.g.nebensatz-weil` (A2-e05) | Nach li-anna folgt ein normaler Satz; Verb am Ende gibt es im Arabischen nicht. | „…, weil ich habe Fieber.“ | Nach weil, dass, wenn geht das Verb ans Ende. li-anna passt eher zu „denn“ (Verb auf Platz 2). |
| `de.g.reflexive-verben` (A2-e05) | Rückbezug zeigt das Arabische über Verbstämme (V, VII, VIII) oder „nafs“, nicht mit einem Pronomen wie „sich“. | „Ich freue auf die Ferien.“ · „Ich habe erkältet.“ | „sich“ als festen Teil des Verbs lernen: sich freuen, sich erkälten, sich ausruhen. |
| `de.g.adj-dekl-best` (A2-e06) | Das arabische Adjektiv steht nach dem Nomen und übernimmt Artikel, Genus und Fall (as-sutra az-zarqāʾ). | „die Jacke blaue“ · „die Jacke die blaue“ | Im Deutschen steht das Adjektiv vor dem Nomen und hat keinen eigenen Artikel: die blaue Jacke. |
| `de.g.welch-dies` (A2-e06) | „hāḏā/hāḏihi“ stehen vor dem Nomen mit Artikel (hāḏā l-kitāb); „ayy“ fragt nach Auswahl. | „Diese das Kleid“ · „Welche Bus?“ | hāḏihi l-… → diese … (ohne zweites die). welch- und dies- haben die Endungen von der/die/das. |
| `de.g.nebensatz-dass` (A2-e07) | Nach „anna“ folgt ein Satz ohne Endstellung des Verbs. | „Ich finde, dass ist die Hausordnung wichtig.“ | anna → dass, aber das Verb geht ganz ans Ende: …, dass die Hausordnung wichtig ist. |
| `de.g.indefinitpronomen` (A2-e07) | Arabisch verbindet Verneinung und „aḥad“ (lam yaʾti aḥad) bzw. „šayʾ“. | „Niemand nicht gekommen.“ · „Ich habe nicht etwas gehört.“ | lam … aḥad → niemand (ohne nicht); lam … šayʾan → nichts. |
| `de.g.komparation` (A2-e08) | Der Elativ vergleicht mit „min“ (akbar min = größer von). | „schneller von Jan“ · „mehr schnell“ | akbar min → größer als: Nach dem Vergleich steht „als“, nicht „von“. Superlativ: am schnellsten. |
| `de.g.praep-akk` (A2-e08) | min aǧl, bi-dūn, ḍidda, ʿabra, ḥawla stehen im Arabischen alle mit Genitiv. | „für dem Bruder“ · „ohne einem Ball“ | Diese Präpositionen wollen immer den Akkusativ: für, ohne, durch, um, gegen. |
| `de.g.nebensatz-wenn` (A2-e09) | Nach iḏā steht im Hocharabischen meist die Vergangenheitsform, auch für Zukünftiges; ʿindamā deckt die Zeit ab. | „Wenn du umgezogen bist, musst du …“ (für ein künftiges Ereignis; zu prüfen) · „Wenn du umziehst, du musst …“ | iḏā + Vergangenheitsform → wenn + Präsens. Nach dem wenn-Satz steht sofort das Verb: …, musst du dich anmelden. |
| `de.g.datum-ordinal` (A2-e09) | Ordinalzahlen sind im Arabischen Wörter (aṯ-ṯāliṯ); Daten stehen oft mit Grundzahl. Die Monatsnamen sind je nach Land verschieden. | „am drei Mai“ · „der 3 Mai“ | Der Punkt nach der Zahl bedeutet „-te“: am 3. Mai = am dritten Mai. Die deutschen Monatsnamen ähneln yanāyir, fibrāyir …, nicht kānūn, šubāṭ … |
| `de.g.hoeflich-konj` (A2-e10) | Höflichkeit läuft über min faḍlik, law samaḥt, hal yumkinuka …?; „urīdu“ klingt neutral, „Ich will“ dagegen fordernd. | „Ich will einen Termin.“ · „Gib mir …, bitte.“ | hal yumkinuka …? → Könnten Sie …?; law samaḥt → Würden Sie bitte …? Am Schalter: Ich hätte gern … |
| `de.g.textfolge` (A2-e10) | Vertraut: Nach awwalan, ṯumma, baʿda ḏālika folgt im Arabischen das Verb – wie im Deutschen. Neu: Das Subjekt darf nicht fehlen. | „Zuerst öffnest die Kamera.“ (ohne du) | Wie nach ṯumma das Verb folgt, steht nach dann/danach das Verb – mit Subjekt: Danach wählst du das Foto aus. |
| `de.g.temporale-praep` (A2-e11) | Vertraut: qabla usbūʿ (vor einer Woche). Aber baʿda ṯalāṯat ayyām heißt von heute aus im Deutschen „in drei Tagen“. | „Nach drei Tagen fliegen wir.“ (von heute aus) · „seit zwei Wochen“ für die Zukunft | baʿda … (ab heute) → in drei Tagen; qabla → vor + Dativ; li-muddat → für. |
| `de.g.praeteritum-modal` (A2-e11) | Arabisch: kuntu urīdu, kāna ʿalayya an, lam astaṭiʿ. | „Ich habe gemusst früher fahren.“ | kuntu urīdu → ich wollte; kāna ʿalayya an → ich musste; lam astaṭiʿ → ich konnte nicht. |
| `de.g.wortbildung-komposita` (A2-e12) | Die Iḍāfa stellt den Kern nach vorn (ḥaqībat al-madrasa = Tasche der Schule); im deutschen Kompositum steht er hinten. | Bedeutung vertauscht · Artikel vom ersten Wort („das Schultasche“) | Deutsche Komposita von hinten lesen: Schul-tasche = ḥaqībat al-madrasa. Der Artikel kommt vom letzten Wort. |
| `de.g.genitiv-s` (A2-e12) | Vertraut: Die Iḍāfa nennt den Besitzer hinten (darrāǧat Yazan) – wie „das Fahrrad von Yazan“. | „Fahrrad Yazan“ · „Yazan Fahrrad“ | darrāǧat Yazan → das Fahrrad von Yazan (mit Artikel und von) oder Yazans Fahrrad (ohne Apostroph). |
| `de.g.werden-vollverb` (A2-e13) | Vertraut: aṣbaḥa und ṣāra heißen „werden“. | „Ich will Ärztin sein.“ (gemeint: werden) | aṣbaḥa/ṣāra → werden: Yazan will Elektriker werden. Es wird dunkel. |
| `de.g.adj-dekl-unbest` (A2-e13) | Wie bei den Adjektiven nach dem bestimmten Artikel: im Arabischen nachgestellt mit Tanwīn (ʿamal mumtiʿ). | „eine Arbeit interessante“ · „ein interessant Arbeit“ | Adjektiv vor das Nomen; nach ein/mein zeigt die Endung das Genus: ein netter Chef, eine neue Kollegin. |
| `de.g.konnektoren-adverb` (A2-e14) | Nach li-ḏālika, maʿa ḏālika, wa-illā ist die Wortstellung im Arabischen frei. | „…, deshalb ich habe Oma angerufen.“ | deshalb, trotzdem, sonst sind Platz 1 – danach sofort das Verb. |

### 2.4 B1 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `de.g.praeteritum` (B1-e01) | Eine Vergangenheit (al-māḍī) für Gespräch und Text; Deutsch trennt Perfekt (Gespräch) und Präteritum (Erzählung). Vertraut: Stammwechsel. | „Oma kommte 1975.“ · Perfekt in jeder Erzählung | Starke Verben ändern den Stammvokal (kommen – kam) – ähnlich wie arabische Verbformen. Erzählung und Bericht → Präteritum. |
| `de.g.nebensatz-temporal` (B1-e01) | ʿindamā deckt als und wenn ab; qabla an, ḥattā, munḏu, baynamā entsprechen bevor, bis, seit, während. | „Wenn ich klein war, …“ | ʿindamā + einmal in der Vergangenheit → als; immer wieder oder Zukunft → wenn. |
| `de.g.infinitiv-zu` (B1-e02) | Arabisch verbindet mit an + Verb oder dem Maṣdar (urīdu an adrusa). | „Ich habe vor, zu machen eine Ausbildung.“ · „…, dass ich mache …“ | an + Verb → zu + Infinitiv am Ende: Ich habe vor, eine Ausbildung zu machen. |
| `de.g.verben-praep` (B1-e02) | Auch arabische Verben haben feste Präpositionen, aber andere (ihtamma bi-, iʿtanā bi-); intaẓara nimmt ein direktes Objekt. | „Ich interessiere mich mit Technik.“ (bi- = mit) · „Ich warte den Bus.“ | Präposition nie übersetzen, sondern mitlernen: ihtamma bi- → sich interessieren für; intaẓara → warten auf. |
| `de.g.konjunktiv-2` (B1-e03) | Vertraut: yanbaġī ʿalayka an (du solltest); Wunsch mit atamannā oder layta. | „Du musst mehr trinken.“ (als Rat zu stark) | yanbaġī ʿalayka → Du solltest …; atamannā law → Ich wünschte … |
| `de.g.reflexiv-dativ` (B1-e03) | Arabisch sagt „ġasaltu yadayya“ (ich wusch meine Hände). | „Ich wasche mich die Hände.“ | Bei Körperteilen „mir die …“: Ich wasche mir die Hände. |
| `de.g.passiv-praesens` (B1-e04) | Das arabische Passiv ist eine Vokaländerung im Verb (yuṣlaḥu); der Handelnde wird meist nicht genannt. | „Die Heizung repariert.“ · „von den Hausmeister“ | Das deutsche Passiv braucht werden + Partizip am Ende: wird repariert. Handelnde mit von + Dativ. |
| `de.g.lassen` (B1-e04) | Kausativ zeigt das Arabische über Verbstämme (II, IV) – nicht frei für jedes Verb. | „Wir reparieren die Heizung.“ (obwohl ein Handwerker es tut) | Wenn jemand anderes die Arbeit macht, sagt man „lassen“: Wir lassen die Heizung reparieren. |
| `de.g.relativsatz-nom-akk` (B1-e05) | Vertraut: allaḏī/allatī stehen nach dem Nomen und richten sich nach ihm. Neu: kein Rückverweis-Pronomen, und auch nach unbestimmtem Nomen braucht es ein Relativpronomen. | „Der Link, den du ihn bekommen hast“ · „Das ist eine Nachricht, ich kenne nicht.“ | Im deutschen Relativsatz steht kein zweites Pronomen (al-kitāb allaḏī qaraʾtuhu → das Buch, das ich gelesen habe). Auch nach „eine Nachricht“: die. |
| `de.g.indirekte-frage` (B1-e05) | „hal“ steht auch in indirekten Fragen; umgangssprachlich oft „iḏā“ (wenn). | „Weißt du, wenn die Nachricht echt ist?“ (zu prüfen) · „…, ob ist die Nachricht echt“ | hal (auch im Nebensatz) → ob, Verb ans Ende: Weißt du, ob die Nachricht echt ist? |
| `de.g.relativsatz-dat-praep` (B1-e06) | Arabisch setzt die Präposition mit Rückverweis ans Ende (allatī usāʿidu fīhā). | „der Verein, den ich helfe darin“ | fīhā am Ende → in dem am Anfang: der Verein, in dem ich helfe. „wo“ nur für Orte. |
| `de.g.um-zu-damit` (B1-e06) | li- und kay gelten für gleiches und anderes Subjekt. | „…, um dass alle etwas bekommen.“ | Gleiches Subjekt → um … zu; anderes Subjekt → damit + Verb am Ende. |
| `de.g.futur-1` (B1-e07) | Zukunft mit sa-/sawfa ist im Arabischen üblich; Deutsch nutzt oft das Präsens. | „Nächstes Jahr werde ich die Schule wechseln.“ (überall Futur) | sa-/sawfa → oft Präsens + Zeitangabe: Nächstes Jahr wechselt Jan die Schule. „werden“ für Versprechen und Vermutungen. |
| `de.g.konzessiv` (B1-e07) | raġma anna (obwohl), maʿa ḏālika (trotzdem), bi-r-raġmi min (trotz). | „Obwohl sie ist erst ein Jahr hier, …“ | raġma anna → obwohl + Verb am Ende; bi-r-raġmi min → trotz + Genitiv. |
| `de.g.plusquamperfekt` (B1-e08) | Vertraut: kāna qad + Vergangenheit (kāna qad ġādara = war schon abgefahren). | „Nachdem wir gewartet haben, fiel der Flug aus.“ | kāna qad … → hatte/war + Partizip. Nach „nachdem“ eine Zeitstufe zurück. |
| `de.g.modalpartikeln` (B1-e08) | Die Hochsprache hat kaum Abtönungspartikeln; Freundlichkeit entsteht über Formeln und Anrede. | Bitten ohne mal/doch klingen hart · Partikeln falsch platziert | Eine Bitte mit „mal“ klingt freundlich: Schau mal! Komm doch mit! (ähnliche Wirkung wie law samaḥt). |
| `de.g.genitiv` (B1-e09) | Vertraut: Die Iḍāfa entspricht dem Genitiv in derselben Reihenfolge (lawn as-sayyāra = die Farbe des Autos). Neu: Artikel vor dem ersten Nomen. | „Farbe des Autos“ ohne Artikel · „die Farbe das Auto“ | Iḍāfa → Genitiv, gleiche Reihenfolge, aber mit Artikel vorn: die Farbe des Autos. wegen, während, trotz + Genitiv. |
| `de.g.konsekutiv` (B1-e09) | bi-ḥayṯu und li-daraǧat anna drücken die Folge aus. | „…, dass wir mussten anhalten.“ | bi-ḥayṯu → sodass; li-daraǧat anna → so …, dass; Verb ans Ende. |
| `de.g.n-deklination` (B1-e10) | Kein Gegenstück: einige maskuline Nomen bekommen -(e)n außer im Nominativ. | „den Kollege“ · „mit Herr Kaya“ | der Kollege, der Kunde, der Herr: den Kollegen, dem Kunden, an Herrn Kaya. |
| `de.g.adj-dekl-ohne` (B1-e10) | Ohne Artikel trägt das Adjektiv die Artikelendung; das arabische Tanwīn zeigt nur Unbestimmtheit. | „Mit freundliche Grüße“ | Ohne Artikel zeigt das Adjektiv die Endung: mit freundlichen Grüßen, bei schlechtem Wetter. |
| `de.g.passiv-praet-modal` (B1-e11) | Arabisch: yaǧibu an yuqaṭṭaʿa (es ist nötig, dass geschnitten wird). | „müssen, dass geschnitten werden“ · „müssen werden geschnitten“ | yaǧibu an yuqaṭṭaʿa → muss geschnitten werden: am Ende Partizip + werden. |
| `de.g.partizip-adjektiv` (B1-e11) | Vertraut: ism fāʿil (muntaẓir) und ism mafʿūl (maqṭūʿ) – nur stehen sie im Arabischen nach dem Nomen. | „das Gemüse geschnittene“ | ism fāʿil ≈ Partizip I (wartend), ism mafʿūl ≈ Partizip II (geschnitten); im Deutschen vor dem Nomen: das geschnittene Gemüse. |
| `de.g.wortbildung-nomen` (B1-e12) | Vertraut: Der Maṣdar macht aus Verben Nomen (taḥwīl, malʾ). | „die Ausfüllen“ · „beim ausfüllen“ | Maṣdar → oft -ung (die Überweisung) oder das + Infinitiv (das Ausfüllen, groß, immer das). |
| `de.g.zustandspassiv` (B1-e13) | Vertraut: muġlaq (geschlossen, Zustand) und yuġlaqu (wird geschlossen, Vorgang). | „Das Rathaus wird montags geschlossen.“ (gemeint: ist) | muġlaq → ist geschlossen; yuġlaqu → wird geschlossen. |
| `de.g.wortbildung-adjektiv` (B1-e14) | Arabisch bildet Adjektive mit der Nisba -ī (šahrī) und mit qābil li- (möglich). | Endungen vertauscht („monatisch“ statt monatlich) | Nisba -ī → oft -lich oder -isch (šahrī → monatlich, ʿilmī → wissenschaftlich); qābil li- → -bar (tragbar). |
| `de.g.konj2-irreal` (B1-e15) | Unwirkliches bildet das Arabische mit law + Vergangenheitsform … la- + Vergangenheitsform. | „Wenn wir eine Solaranlage hatten, …“ (Vergangenheit statt Konjunktiv) | law + Vergangenheitsform → wenn + Konjunktiv II (hätte, wäre, würde), nicht die deutsche Vergangenheit. |
| `de.g.zweiteilige-konnektoren` (B1-e16) | Vertraut: lā … wa-lā, immā … aw, laysa faqaṭ … bal. | „weder Zeit und nicht Lust“ | lā … wa-lā → weder … noch; immā … aw → entweder … oder; laysa faqaṭ … bal → nicht nur … sondern auch. |

### 2.5 B2 (24 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `de.g.nominalstil` (B2-e01) | Vertraut: Die Schriftsprache baut Maṣdar-Ketten (baʿda itmām at-tadrīb). | „Nach Abschluss von die Ausbildung“ | baʿda itmām … → nach Abschluss …: Nominalgruppen wie im Arabischen, Kasus prüfen. |
| `de.g.konditional-falls` (B2-e02) | fī ḥāl (falls), šarṭa an (vorausgesetzt, dass), iḏā; den uneingeleiteten Bedingungssatz gibt es nicht. | „Sollten Sie Fragen haben, Sie rufen uns an.“ | fī ḥāl → falls; „Sollten Sie …“ ist ein höfliches „falls“, danach Verb vorn: …, rufen Sie uns an. |
| `de.g.temporal-b2` (B2-e03) | Vertraut: mā in (sobald), ṭālamā (solange), kullamā (sooft), munḏu (seitdem). | „Sobald die Wohnung frei ist, ich ziehe ein.“ | mā in → sobald; ṭālamā → solange; kullamā → sooft; danach Verb sofort. |
| `de.g.passiversatz` (B2-e04) | Arabisch: yumkinu ilġāʾuhu, yaǧibu dafʿuhā, qābil li-l-ilġāʾ. | „Die Rechnung ist zu bezahlt.“ | qābil li-l-ilġāʾ → kündbar / lässt sich kündigen; yaǧibu dafʿuhā → ist zu bezahlen. |
| `de.g.praep-genitiv` (B2-e04) | Vertraut: bi-sabab, ḫilāla, bi-musāʿadat, badalan min, bi-šaʾn stehen wie alle arabischen Präpositionen mit Genitiv. | „innerhalb eine Woche“ | Gleiche Logik wie im Arabischen: aufgrund, innerhalb, mithilfe, anstelle, bezüglich + Genitiv. |
| `de.g.konjunktiv-1` (B2-e05) | Indirekte Rede hat im Arabischen keinen eigenen Modus (qāla inna …). | Indikativ ohne Distanz · „dass“ und Konjunktiv I falsch gemischt | Nach qāla inna folgt im Arabischen die normale Form; im Deutschen kennzeichnet der Konjunktiv I die fremde Aussage: Er sagt, er sei krank. |
| `de.g.textverweise` (B2-e05) | Vertraut: hāḏā, ḏālika, al-awwal, al-aḫīr; neu sind da(r)-Wörter. | „Ich komme auf das später zurück.“ | Präposition + das wird zu da(r)-: auf das → darauf (ʿalā ḏālika). |
| `de.g.konj2-vergangenheit` (B2-e06) | Arabisch: law kuntu ʿaraftu … la-ǧiʾtu; kāna yanbaġī an (hätte … sollen). | „Wir sollten früher fragen haben.“ | kāna yanbaġī ʿalaynā an nasʾala → Wir hätten früher fragen sollen. |
| `de.g.adjektiv-nominalisiert` (B2-e06) | Vertraut: Adjektive und Partizipien als Nomen sind häufig (al-marḍā, al-muhimm). | „ein Angehörige“ · „das Wichtigstes“ | Wie al-muhimm: das Wichtigste – groß geschrieben, mit Adjektivendung (der Angehörige, ein Angehöriger). |
| `de.g.modalsatz-indem` (B2-e07) | Arabisch: ʿan ṭarīq + Maṣdar. | „…, durch die Heizung einstellen.“ | ʿan ṭarīq ḍabṭ at-tadfiʾa → indem man die Heizung einstellt. |
| `de.g.je-desto` (B2-e07) | Vertraut: kullamā …, … (kullamā zāda …, zāda …). | „Je besser ist das Haus gedämmt, desto weniger es braucht.“ | kullamā …, … → je …, desto …: nach je Verb ans Ende, nach desto Verb sofort. |
| `de.g.funktionsverbgefuege` (B2-e08) | Vertraut: Verb + Nomen (ittaḫaḏa qarāran, qaddama ṭalaban); die deutschen Verben sind andere. | „eine Entscheidung nehmen“ · „einen Antrag geben“ | ittaḫaḏa qarāran → eine Entscheidung treffen; qaddama ṭalaban → einen Antrag stellen. |
| `de.g.partizipialattribut` (B2-e09) | Im Arabischen stehen Attribute nach dem Nomen (al-ʿadasa allatī ṭuwwirat fī Wetzlar); im Deutschen lange Attribute davor – die größte Lesehürde. | Satz in falscher Reihenfolge gelesen | Vom Artikel zum Nomen springen, den Teil dazwischen als Relativsatz lesen: die in Wetzlar entwickelte Linse = die Linse, die in Wetzlar entwickelt wurde. |
| `de.g.wortbildung-verben` (B2-e09) | Arabisch bildet Wörter über Wurzel und Muster (kataba, kātib, maktab); Deutsch über Stamm und Präfix. | kaufen/verkaufen vertauscht | Wie eine Wurzel bilden deutsche Stämme Familien: fahren, Fahrt, Fahrer, erfahren. Präfixe ändern die Bedeutung. |
| `de.g.konzessiv-b2` (B2-e10) | Arabisch: ṣaḥīḥ anna … lākin (zwar … aber), ḥattā law (selbst wenn). | „Zwar ist günstig das Angebot, aber …“ | ṣaḥīḥ anna … lākin → zwar … aber; ḥattā law → selbst wenn. |
| `de.g.irrealer-vergleich` (B2-e11) | Vertraut: ka-anna (als ob). | „als ob er versteht kein Türkisch“ | ka-anna → als ob … (Verb am Ende, Konjunktiv II) oder als + Verb: als wäre … |
| `de.g.futur-2` (B2-e12) | Vertraut: sa-yakūnu qad + Vergangenheit (wird … haben). | „Er wird den Zug verpasst.“ | sa-yakūnu qad … → wird … haben: Bis zum Herbst werden wir zwanzig Kinder ausgebildet haben. |
| `de.g.relativ-wer-was` (B2-e12) | Vertraut: man (wer) und mā (was) als Relativ. | „Alles, das wir brauchen“ · „Wer mitmachen will, er kommt.“ | man → wer; mā → was (nach alles, etwas, nichts). |
| `de.g.passiv-perfekt` (B2-e13) | Arabisch: qad buniyat (wurde gebaut); im Deutschen „worden“ ohne ge-. | „ist gebaut geworden“ | Passiv-Perfekt: ist … worden: Die Brücke ist gebaut worden. |
| `de.g.modal-vermutung` (B2-e13) | Vertraut: lā budda anna (muss), min al-muḥtamal an (dürfte), rubbamā (könnte). | „Das Haus soll sehr alt sein.“ (gemeint: muss) | lā budda anna … → muss; min al-muḥtamal → dürfte; rubbamā → könnte. „sollen“ heißt „man sagt“. |
| `de.g.genitiv-relativ` (B2-e14) | Arabisch: Relativsatz mit Rückverweis (al-marʾa allatī šahida bnuhā). | „die Frau, die ihr Sohn ausgesagt hat“ | allatī … -hā → deren: die Frau, deren Sohn ausgesagt hat; dessen bei der/das. |
| `de.g.statt-ohne` (B2-e15) | Vertraut: badalan min an (statt … zu), dūna an (ohne … zu, ohne dass). | „Sie ging, ohne dass sie verabschiedet.“ | dūna an → ohne … zu: ohne sich zu verabschieden; badalan min an → statt … zu. |
| `de.g.adversativ` (B2-e16) | Vertraut: baynamā hat wie „während“ eine zeitliche und eine gegenüberstellende Bedeutung; fī ḥīn anna (wohingegen). | „Während Murat wollte eine Reparatur, …“ | baynamā → während (beide Bedeutungen), Verb am Ende; ʿalā ʿaks → im Gegensatz zu + Dativ. |
| `de.g.weiterfuehrender-nebensatz` (B2-e16) | Vertraut: mimmā bezieht sich auf den ganzen Satz (mimmā aġḍabahu). | „…, das ihn ärgerte.“ | mimmā → was: Die Maschine lief aus, was Murat ärgerte. |

### 2.6 C1 (18 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `de.g.register` (C1-e01) | Vertraut: Diglossie zwischen fuṣḥā (Schrift) und Dialekt (Alltag). Im Deutschen ist der Abstand kleiner; Register zeigt sich in Wortwahl, du/Sie und Satzbau. | zu lange Eingangs- und Schlussformeln in E-Mails · Umgangssprache in förmlichen Texten | Wie fuṣḥā und Dialekt: Im Brief „Ich bitte um Verständnis“, im Gespräch „Tut mir leid“. |
| `de.g.modalpartikeln-c1` (C1-e02) | Vermutung und Erstaunen drückt das Arabische mit Wörtern aus (rubbamā, ʿalā mā yabdū); Partikeln wie wohl, etwa, ruhig sind neu. | Partikeln weggelassen oder wörtlich übersetzt | wohl ≈ ʿalā mā yabdū (zu prüfen); „Sie können ruhig fragen“ = Fragen ist erlaubt und erwünscht. |
| `de.g.konj2-diplomatie` (C1-e02) | Höflichkeit läuft im Arabischen über Formeln und Anrede (hal min al-mumkin …?). | zu direkte Ablehnung („Das ist falsch.“) | hal min al-mumkin …? → Wäre es möglich, …? Ich würde vorschlagen, … |
| `de.g.redewiedergabe-text` (C1-e03) | Vertraut: wafqan li-, ḥasaba (laut), ašāra ilā anna (wies darauf hin). | „Nach die Studie …“ | wafqan li-d-dirāsa → laut der Studie / der Studie zufolge (Dativ, nachgestellt). |
| `de.g.passiv-c1` (C1-e04) | Arabisch: kāna yaǧibu an tuṣāġa (es wäre nötig gewesen, dass formuliert wird). | „hätte formuliert müssen werden“ | Von hinten bauen: formuliert werden müssen, „hätte“ vorn. |
| `de.g.gehobene-praep` (C1-e04) | Arabisch: wafqan li- (gemäß), bi-n-naẓar ilā (angesichts), bi-ġaḍḍi n-naẓar ʿan (ungeachtet), bi-hadaf (zwecks). | „gemäß des Absatzes“ | Kasus mitlernen: gemäß und entsprechend + Dativ; angesichts, hinsichtlich, ungeachtet + Genitiv. |
| `de.g.subjektive-modalverben` (C1-e05) | Arabisch: yuqālu inna (man sagt, dass), yazʿumu anna (er behauptet). | „Er will nichts davon gewusst.“ · „soll“ als Pflicht verstanden | yuqālu inna … → soll …; yazʿumu annahu … → will … haben. |
| `de.g.konnektoren-c1` (C1-e05) | Vertraut: min nāḥiya … wa-min nāḥiya uḫrā, lā siyyamā, illā iḏā, wa-bi-t-tālī. | „zumal viele sind abgelenkt“ | illā iḏā → es sei denn; lā siyyamā → zumal (Verb am Ende); min nāḥiya … → einerseits … andererseits. |
| `de.g.wortbildung-c1` (C1-e06) | Iḍāfa-Ketten stellen den Kern vorn (hadr al-mawādd al-ġiḏāʾiyya); das deutsche Kompositum hinten. | Bedeutung vertauscht | Lebensmittel-verschwendung = hadr al-mawādd al-ġiḏāʾiyya: Reihenfolge umkehren. |
| `de.g.verbalisierung` (C1-e07) | Vertraut: Behördenarabisch ist ebenso nominal (baʿda istilām ṭalabikum). | Kasus und Präposition beim Auflösen falsch | Nach Eingang Ihres Antrags → Sobald Ihr Antrag eingegangen ist. |
| `de.g.partizipialkonstruktion` (C1-e08) | Vertraut: Der ḥāl beschreibt einen Zustand mit Partizip (waṣala mutʿaban). | „Von der Reise erschöpft, er schlief ein.“ | Der ḥāl entspricht oft dem deutschen Partizip: Von der Reise erschöpft, schlief er sofort ein (Verb direkt danach). |
| `de.g.idiomatik` (C1-e08) | Redewendungen lassen sich nicht wörtlich übertragen; manche Sprichwörter haben ein Gegenstück. | arabische Wendungen wörtlich übersetzt | Vergleichen statt übersetzen: man ǧadda waǧada ≈ Ohne Fleiß kein Preis; al-ʿilmu fī ṣ-ṣiġari ka-n-naqši ʿalā l-ḥaǧar ≈ Was Hänschen nicht lernt … |
| `de.g.negation-c1` (C1-e09) | Vertraut: bi-l-kād (kaum), laysa ġayra muhimm (nicht unwichtig). | „Kaum niemand kannte das.“ | bi-l-kād → kaum (ohne zweite Verneinung); laysa ġayra muhimm → nicht unwichtig. |
| `de.g.textkohaesion` (C1-e10) | Arabische Texte verbinden oft mit wa, fa, ṯumma zu langen Ketten; deutsche Texte nutzen kürzere Sätze und Überleitungen. | lange „und“-Ketten · Absatz ohne Überleitung | Statt „wa“ am Satzanfang deutsche Überleitungen: Außerdem, Daher, Vor diesem Hintergrund – danach Verb auf Platz 2. |
| `de.g.verkuerzung` (C1-e10) | Kein besonderer Kontrast; Notizen nutzen im Deutschen den Infinitiv am Ende. | Imperativ oder volle Sätze statt Notizform | Material bis Freitag bestellen: Artikel und Hilfsverben fallen weg, Infinitiv am Ende. |
| `de.g.vergleich-c1` (C1-e11) | Vertraut: afʿal min an (ahammu min an = zu wichtig, als dass). | „zu wichtig, dass man …“ | ahammu min an … → zu wichtig, als dass … (mit Konjunktiv II). |
| `de.g.satzgliedstellung` (C1-e12) | Vertraut: Voranstellung betont (taqdīm). Neu: Nach dem Vorfeld steht das Verb auf Platz 2. | „Diesen Punkt ich möchte betonen.“ | Wie beim taqdīm betont das deutsche Vorfeld: Gerade diesen Punkt möchte ich betonen. |
| `de.g.attribute-komplex` (C1-e13) | Vertraut: Iḍāfa-Ketten in derselben Reihenfolge wie deutsche Genitivketten. Neu: vorangestellte Attribute. | vorangestellte Attribute nicht erkannt | Genitivketten wie eine Iḍāfa-Kette lesen (die Prüfung – der Zulässigkeit – einer Klausel); vorangestellte Attribute in Relativsätze auflösen. |

## 3 Wortschatz

### 3.1 Falsche und halbe Freunde

Direkte Klangähnlichkeit zwischen Arabisch und Deutsch ist selten; die meisten Fallen entstehen über gemeinsame Lehnwörter, über Dialektwörter aus dem Französischen oder Italienischen und über Englisch (§3.5). „teilweise“ heißt: Die Bedeutungen überschneiden sich nur zum Teil.

| Arabisch (Umschrift) | Bedeutung | ähnliches deutsches Wort | dessen Bedeutung | für das arabische Wort sagt man | Einheit |
|---|---|---|---|---|---|
| ṣifr | Null | die Ziffer | Zahlzeichen 0 bis 9 (ar raqm) | die Null | B1-e14 |
| maḫzan | Lager, Speicher | das Magazin | Zeitschrift (auch Lager) | das Lager; Zeitschrift = maǧalla | B2-e05 |
| ṭāsa | Schale, Napf | die Tasse | Trinkgefäß (ar finǧān) | die Schale, die Schüssel | A1-e05 |
| duktūr | Arzt; Doktortitel | der Doktor | Titel; im Alltag auch Arzt | der Arzt, die Ärztin | A1-e11, teilweise |
| bank | Geldinstitut | die Bank | auch Sitzbank | die Bank (zwei Bedeutungen) | A1-e09, teilweise |
| bakālūriyā | Abitur, Schulabschluss (Syrien, Libanon, Maghreb) | der Bachelor | Hochschulabschluss | das Abitur | B2-e08 |
| līsāns | Bachelor, Hochschulabschluss | die Lizenz | Erlaubnis, Nutzungsrecht | der Bachelor | B2-e08 |
| diblūm | Diplom, oft Fach- oder Aufbauabschluss (zu prüfen) | das Diplom | bestimmter Hochschulabschluss | je nach Abschluss | B2-e08, teilweise |
| kanaba (dialektal) | Sofa | das Kanapee | belegtes Häppchen | das Sofa | A1-e03 |
| ṣālūn, ṣāla (dialektal) | Wohnzimmer, Empfangsraum | der Salon | Friseursalon, Ausstellungsraum | das Wohnzimmer | A1-e03 |
| baṭṭāriyya | Batterie; Akku | die Batterie | nicht aufladbar | der Akku (aufladbar) | A2-e10, teilweise |
| taʿrīf | Definition, Vorstellung | der Tarif | Preis- oder Lohnordnung (ar taʿrīfa) | die Definition | B1-e12, teilweise |
| maktaba | Bibliothek; Buchhandlung | die Bibliothek | nur zum Ausleihen | die Buchhandlung (zum Kaufen) | A1-e09, teilweise |
| ustāḏ | Lehrer; Professor; höfliche Anrede | der Professor | nur Hochschullehrer | der Lehrer; Anrede Herr + Familienname | A1-e07, teilweise |
| muhandis | Ingenieur; auch Anrede | der Ingenieur | nur Beruf, keine Anrede | Herr + Familienname | A2-e13, teilweise |

### 3.2 Lehnwörter

**Deutsche Wörter arabischer Herkunft.** Viele kamen über das Italienische, Spanische, Französische, Persische oder Türkische ins Deutsche; die Bedeutung hat sich oft verschoben. Herkunft nach gängigen Herkunftswörterbüchern, Einzelheiten zu prüfen (§8).

| Deutsch | Arabisch (Umschrift) | Hinweis |
|---|---|---|
| der Zucker | sukkar | Vertraut |
| der Kaffee | qahwa | über das Türkische |
| die Tasse | ṭāsa | ṭāsa ist eine Schale (§3.1) |
| die Karaffe | ġarrāfa | Vertraut |
| die Matratze | maṭraḥ | ursprünglich „Ort, wo etwas hingelegt wird“ |
| das Magazin | maḫzan, maḫāzin | heute meist Zeitschrift (§3.1) |
| der Tarif | taʿrīfa | Vertraut: taʿrīfa heißt auch Tarif |
| die Ziffer | ṣifr | ṣifr ist die Null (§3.1) |
| die Algebra | al-ǧabr | – |
| die Chemie | kīmiyāʾ | – |
| der Algorithmus | nach al-Ḫwārizmī | – |
| der Safran | zaʿfarān | – |
| der Spinat | isbānaḫ | aus dem Persischen |
| die Aubergine | bāḏinǧān | über das Französische |
| die Artischocke | al-ḫaršūf | – |
| die Limone | laymūn | „Zitrone“ ist im Alltag häufiger |
| der Kandis(zucker) | qand | – |
| die Giraffe | zarāfa | – |
| das Kamel | ǧamal | sehr alte semitische Herkunft |
| der Monsun | mawsim | mawsim heißt Jahreszeit |
| der Zenit | samt | – |
| das Karat | qīrāṭ | – |

Deutsche Wörter im Arabischen gibt es kaum; sicher belegte Beispiele fehlen (§8).

### 3.3 Internationalismen

Grob 6–10 % der häufigen deutschen Nomen haben eine ähnlich klingende arabische Übersetzung (Top-2.000: 17 von 186 mit Umschrift, Messung §7). Viele kamen über das Englische oder Französische ins Arabische. Sie helfen beim Hören, kaum beim Lesen, weil die Schrift eine andere ist.

| Deutsch | Arabisch (Umschrift) | Hinweis |
|---|---|---|
| das Telefon | tilifūn | Hochsprache auch hātif |
| das Radio | rādyū | – |
| das Video | fīdyū | – |
| die Kamera | kāmīrā | – |
| das Internet | intarnit | – |
| der Computer | kumbyūtar | Hochsprache auch ḥāsūb |
| der Bus | bāṣ, ūtūbīs | regional verschieden |
| das Taxi | taksī | – |
| die U-Bahn, die Metro | mītrū | – |
| das Benzin | banzīn | – |
| die Batterie | baṭṭāriyya | auch für den Akku (§3.4) |
| der Film | fīlm | – |
| die Bank | bank | nur das Geldinstitut (§3.1) |
| die Physik, die Chemie | fīzyāʾ, kīmyāʾ | – |
| die Geografie | ǧuġrāfiyā | – |
| die Technologie | tiknūlūǧiyā | – |
| das Kilo, das Gramm, der Meter, der Liter | kīlū, ġrām, mitr, litr | – |
| der Euro | yūrū | – |
| die Million, die Milliarde | milyūn, milyār | – |
| das Archiv | aršīf | – |
| die Mode | mūḍa | – |
| die Schokolade | šūkūlāta | – |
| die Tomate | ṭamāṭim (Levante dialektal: banadūra) | – |
| das Visum | fīza (dialektal), Hochsprache taʾšīra | – |
| der Doktor | duktūr | Arzt und Titel (§3.1) |

**Monatsnamen.** In Ägypten, im Maghreb und am Golf ähneln die Monatsnamen den deutschen (yanāyir, fibrāyir, māris, abrīl, māyū, yūniyū, yūliyū, aġusṭus, sibtambir, uktūbar, nūfambir, dīsambir). In der Levante und im Irak sind andere Namen üblich (kānūn aṯ-ṯānī, šubāṭ, āḏār, nīsān, ayyār, ḥazīrān, tammūz, āb, aylūl, tišrīn al-awwal, tišrīn aṯ-ṯānī, kānūn al-awwal). Für sie sind die deutschen Namen neu (A1-e04).

**Fallen bei Internationalismen:**
- **Genus:** Das Genus des arabischen Lehnworts hilft nicht; im Deutschen gilt das eigene Genus (die Kamera, das Video, die Batterie).
- **Endungen mit festem Genus:** -ion, -tät, -ie, -ik → die; -ment → das; -or, -ismus → der (Messung §7).
- **Laute:** In der arabischen Form werden p und v oft zu b und f (kumbyūtar, fīdyū); im Deutschen bleiben p und v (Computer, Video).
- **Schreibung:** Video, Visum mit v; Physik mit ph; Computer mit c.

### 3.4 Wortfelder mit anderer Einteilung

| Feld | Arabisch (Umschrift) | Deutsch | Tipp |
|---|---|---|---|
| Verwandte | ʿamm, ḫāl; ʿamma, ḫāla; ibn al-ʿamm, bint al-ḫāl … | der Onkel; die Tante; der Cousin, die Cousine | Ein deutsches Wort für zwei arabische; die Seite der Familie sagt man dazu. |
| Zeit | sāʿa (Uhr, Stunde, Armbanduhr) | die Uhr, die Stunde | „zwei Stunden warten“, aber „um zwei Uhr“. |
| Bücher | maktaba (Bibliothek und Buchhandlung) | die Bibliothek, die Buchhandlung | In der Bibliothek leiht man aus, in der Buchhandlung kauft man. |
| Rezept | waṣfa (ärztlich und in der Küche) | das Rezept (ebenfalls beides) | Vertraut |
| Gefäße | finǧān, kūb, ṭāsa, ṣaḥn | die Tasse, das Glas oder der Becher, die Schale, der Teller | ṭāsa ist keine Tasse. |
| Batterie | baṭṭāriyya | die Batterie, der Akku | Ein Akku lässt sich aufladen. |
| Arzt | ṭabīb, duktūr | der Arzt, die Ärztin; Doktor ist ein Titel | §3.1 |
| Lehrer | ustāḏ, muʿallim | der Lehrer; der Professor nur an der Hochschule | ustāḏ ist auch Anrede (§4.2). |
| Schule | madrasa; bakālūriyā; ǧāmiʿa | die Schule; das Abitur; die Universität | §3.1, §4.6 |
| Lage | waḍaʿa | stellen, legen, setzen, hängen | `de.g.positionsverben` |
| Ländernamen | al-ʿIrāq, al-Urdunn, Lubnān, Sūriyā, Miṣr | der Irak, Jordanien, der Libanon, Syrien, Ägypten | Der Artikel folgt nicht dem Arabischen: al-ʿIrāq → der Irak, aber al-Urdunn → Jordanien; Lubnān → der Libanon. Ländernamen mit Artikel lernen. |
| Wohnen | ṣāla, ṣālūn (dialektal); ġurfat al-ǧulūs | das Wohnzimmer | §3.1 |

### 3.5 Englisch und Französisch als Brücke

Je nach Herkunftsland haben Lernende Englisch (etwa Irak, Golf, Ägypten, Jordanien) oder Französisch (Maghreb, Libanon) in der Schule gelernt (zu prüfen je Person). Das hilft bei Internationalismen, schafft aber falsche Freunde:

| Deutsch | Bedeutung | englisches Wort | Bedeutung dort |
|---|---|---|---|
| bekommen | erhalten | become | werden |
| der Chef | Vorgesetzter | chef | Koch |
| das Gift | giftiger Stoff | gift | Geschenk |
| das Handy | Mobiltelefon | handy | praktisch |
| also | deshalb, folglich | also | auch |
| wer, wo | man, ayna | where, who | wo, wer |
| will | möchte (wollen) | will | Zukunft |
| die Rente | Ruhegeld | rent | Miete |
| sensibel | empfindlich | sensible | vernünftig |
| eventuell | vielleicht | eventually | schließlich |
| aktuell | gegenwärtig | actual | tatsächlich |
| das Gymnasium | Schulform | gym | Turnhalle |

| Deutsch | Bedeutung | französisches Wort | Bedeutung dort |
|---|---|---|---|
| die Chance | Gelegenheit | la chance | Glück |
| die Plage | Last, Mühe | la plage | Strand |
| die Bagage | abwertend für eine Gruppe | les bagages | Gepäck |
| das Büro, die Etage, die Toilette, das Portemonnaie, der Friseur, die Garage | wie im Französischen | – | Vertraut |

## 4 Pragmatik und Höflichkeit

### 4.1 du und Sie

Das Hocharabische hat kein grammatisches „Sie“: anta und anti gelten für alle. Respekt zeigt es über Anrede, Titel und Formeln; in förmlicher Rede gibt es Umschreibungen wie ḥaḍratuk (etwa „Ihre Person“). Im Deutschen ist „Sie“ Grammatik: 3. Person Plural, großgeschrieben, mit eigener Verbform.

Mögliche Folgen: alle duzen, oder „Sie“ mit der Verbform von du („Sie kommst“; zu prüfen, §8).

| Situation | Deutsch | Arabisch | Hinweis |
|---|---|---|---|
| Amt, Arzt, Geschäft, Unbekannte | Sie + Familienname | anta/anti mit Titel (ustāḏ, duktūr, sayyid, sayyida) | §4.2 |
| Familie, Freunde, Kinder unter sich | du | anta/anti | Vertraut |
| Kind zu Lehrkraft | Sie + Frau/Herr + Familienname | ustāḏ, ustāḏa (regional auch ānisa) | Die Lehrkraft duzt Kinder meist; in der Oberstufe oft Sie. |
| Nachbarn | Sie, bis jemand das Du anbietet | Verwandtschaftswort (ʿammū, ḫāla) | Das Du bietet meist die ältere Person an. |
| Kolleginnen und Kollegen | oft du, je nach Betrieb | anta/anti, oft mit Titel | Im Zweifel mit Sie beginnen. |
| Behördenbrief, Formular | durchgehend Sie | – | kein Wechsel im selben Text |

### 4.2 Anrede und Namen

- **Familienname statt Vorname oder Titel:** Arabisch ehrt über Titel und Vornamen (ustāḏ Ḫālid, duktūra Hind). Deutsch nutzt Herr/Frau + Familienname. „Herr Khalid“ wirkt im Deutschen falsch.
- **Verwandtschaftswörter und Elternnamen:** ʿammū, ḫāla für Ältere, Abū Yazan oder Umm Yazan („Vater/Mutter von Yazan“) für Eltern. Im Deutschen nur in der Familie; Nachbarn heißen „Herr Neumann“ und „Frau Kaya“.
- **Berufe als Anrede:** duktūr, muhandis werden im Arabischen oft als Anrede gebraucht. Im Deutschen ist nur der akademische Titel üblich und steht vor dem Familiennamen (Frau Dr. Fischer); „Herr Ingenieur“ sagt man nicht.
- **Familiennamen in einer Familie:** In vielen arabischen Ländern behalten Frauen nach der Heirat ihren Familiennamen; die Kinder tragen den des Vaters. In deutschen Formularen kann jede Person einen anderen Familiennamen haben. Die Anrede richtet sich nach dem eigenen Familiennamen der Person.
- **Namensform:** Arabische Namen reihen Vorname, Name des Vaters und weitere Namen. Deutsche Formulare kennen nur Vorname(n) und Familienname (§4.5). Die Schreibung richtet sich nach dem Pass (§1.1).

### 4.3 Grüßen, Danken, Bitten, Wünschen

Nur weltliche Formeln (Leitfaden §4.3). Wo die übliche arabische Antwort eine gesperrte Formel ist (etwa auf die Frage nach dem Befinden oder beim Niesen), zeigen Tipps nur die deutsche Formel.

| Situation | Arabisch (Umschrift) | Deutsch | Hinweis |
|---|---|---|---|
| Gruß | marḥaban, ahlan | Hallo, Guten Tag | – |
| Willkommen | ahlan wa-sahlan | Herzlich willkommen! | – |
| Morgen und Abend | ṣabāḥ al-ḫayr – ṣabāḥ an-nūr; masāʾ al-ḫayr – masāʾ an-nūr | Guten Morgen – Guten Morgen; Guten Abend – Guten Abend | Deutsch wiederholt den Gruß, es gibt keine eigene Antwortformel. |
| Abschied | maʿa s-salāma | Tschüss, Auf Wiedersehen | – |
| Befinden | kayfa ḥāluk? | Wie geht es dir? – Gut, danke. Und dir? | Kurze Antwort mit Dank und Gegenfrage; im Laden fragt man Unbekannte nicht danach. |
| Bitte (Wunsch) | min faḍlik, law samaḥt | bitte; Würden Sie bitte …? | – |
| Anbieten, hereinbitten | tafaḍḍal, tafaḍḍalī | Bitte schön. Kommen Sie herein. | – |
| Dank | šukran, šukran ǧazīlan | Danke, Vielen Dank | – |
| Antwort auf Dank | ʿafwan | Bitte, Gern geschehen | ʿafwan heißt auch „Entschuldigung“. |
| Nachfragen | naʿam? ʿafwan? | Wie bitte? | „Was?“ klingt unhöflich. |
| Entschuldigung | āsif, āsifa, ʿafwan | Entschuldigung, Es tut mir leid | – |
| Essen | bi-l-hanāʾ wa-š-šifāʾ | Guten Appetit | im Deutschen vor dem Essen |
| Lob für das Essen | (feste Dankformeln, regional) | Das hat sehr gut geschmeckt! | keine feste deutsche Formel |
| Krankheit | šifāʾan ʿāǧilan | Gute Besserung! | – |
| Niesen | (gesperrte Formel, F-ar-10) | Gesundheit! | Antwort: Danke. |
| Glückwunsch | mabrūk | Herzlichen Glückwunsch! | – |
| Reise | riḥla saʿīda | Gute Reise! | – |
| Wochenende | nihāyat usbūʿ saʿīda | Schönes Wochenende! | – |
| Trauer | aḥarr at-taʿāzī | Mein Beileid. Herzliches Beileid. | erst ab B1, ruhig (Leitfaden G-12) |

**Ein Wort „bitte“ für drei arabische.** min faḍlik (Bitte um etwas), tafaḍḍal (etwas anbieten) und ʿafwan (Antwort auf Dank) heißen im Deutschen alle „bitte“; dazu kommt „Wie bitte?“ beim Nachfragen (A1-e05).

### 4.4 Gespräch, Kritik, Absagen

Die Hinweise beschreiben deutsche Gewohnheiten; sie bewerten keine Herkunft (Leitfaden G-04).
- **Anbieten und Ablehnen:** Ein „Nein, danke“ wird im Deutschen meist wörtlich genommen; oft wird nicht ein zweites Mal angeboten. Wer etwas möchte, sagt beim ersten Mal „Ja, gern“.
- **Absagen:** kurz, mit Dank und Grund. Termine bei Arzt und Amt sind verbindlich; wer nicht kommen kann, sagt vorher ab.
- **Bitten im Amt:** Direkte Aufforderungen („Bitte füllen Sie das Formular aus.“) sind normal und nicht unhöflich.
- **Kritik im Team:** sachlich und direkt, oft in der Ich-Form; der Konjunktiv II macht sie weicher (B1-e10, C1-e02).
- **Widersprechen in Versammlungen:** sachlich, mit Begründung und ohne Anrede-Formeln („Ich sehe das anders, weil …“; C1-e09).

### 4.5 Briefe, E-Mails, Formulare

| Bestandteil | Deutsch | Arabisch (Umschrift) | Tipp |
|---|---|---|---|
| förmliche Anrede | Sehr geehrte Frau Hoffmann, / Sehr geehrter Herr Kaya, | as-sayyid … al-muḥtaram, as-sayyida … al-muḥtarama | Titel + Name + „geehrt“ → Sehr geehrte/r + Frau/Herr + Familienname |
| Empfänger unbekannt | Sehr geehrte Damen und Herren, | – | – |
| Einleitung | keine; nach der Anrede direkt zum Anliegen | Eingangsformel, etwa taḥiyya ṭayyiba wa-baʿd | Der deutsche Brief kommt schnell zur Sache. |
| nach der Anrede | Komma, dann klein weiter | – | „…, ich schreibe Ihnen, weil …“ |
| Schluss | Mit freundlichen Grüßen (ohne Komma) | Schlussformel, etwa wa-tafaḍḍalū bi-qubūl fāʾiq al-iḥtirām | kurz; Name in die nächste Zeile |
| Betreff | fett, ohne das Wort „Betreff“ | al-mawḍūʿ: | – |
| Ort und Datum | Wetzlar, 20.10.2026 | Datum oft mit Schrägstrich | – |
| Formular | Familienname, Vorname(n), Geburtsname, Geburtsdatum TT.MM.JJJJ, Staatsangehörigkeit, Unterschrift | Name in mehreren Teilen | kein Feld für den Namen des Vaters; Namen wie im Pass |
| Adresse | Straße und Hausnummer, dann Postleitzahl und Ort | regional verschieden | Reihenfolge einhalten (B1-e12) |
| Lebenslauf | tabellarisch, das Neueste oben, Foto freiwillig | – | B2-e01 |
| E-Mail-Adressen in Übungen | nur example.org, nicht verlinkt (Leitfaden G-08) | – | – |

### 4.6 Zeit, Zahlen, Formate, Schule

| Thema | Deutschland | arabische Länder (verschieden) | Tipp |
|---|---|---|---|
| Uhrzeit | 24 Stunden in Plänen, im Gespräch 12 | im Gespräch 12 | 24-Stunden-Angaben lesen üben |
| halbe Stunde | halb neun = 8:30 | aṯ-ṯāmina wa-n-niṣf | `de.g.zeitangaben` |
| Wochenende | Samstag und Sonntag | in vielen Ländern Freitag und Samstag, in einigen Samstag und Sonntag | Wochenplan lesen (A1-e04) |
| Wochenbeginn | Montag | oft Samstag oder Sonntag | – |
| Datum | 20.10.2026 | 20/10/2026 | Punkt statt Schrägstrich |
| Ziffern | europäisch | östlich-arabisch oder europäisch | Vorkurs l01; Anzeige in der Oberfläche nach LM-18 |
| Dezimalzahl | Komma (2,50), Tausenderpunkt (1.000) | eigenes Dezimalzeichen oder Punkt | „2.50 €“ ist im Deutschen falsch |
| Preis | 2,50 € (Zeichen nach der Zahl) | regional verschieden | – |
| Schulnoten | 1 (sehr gut) bis 6 (ungenügend) | oft Prozent- oder Punkteskalen (zu prüfen je Land) | Die 1 ist die beste (B1-e07). |
| Schulweg | Grundschule 4 Jahre, danach in Hessen u. a. Gymnasium, Realschule, Hauptschule, Gesamtschule; Ausbildung im Betrieb und in der Berufsschule | verschieden | Die Wahl der Schulform fällt nach Klasse 4. |
| Notruf | 112 (Feuerwehr, Rettung), 110 (Polizei) | verschieden | A1-e11 |
| Telefon | Man meldet sich mit dem eigenen Namen. | alū? naʿam? | „Hier ist Anna Becker.“ |

### 4.7 Religiöse Formeln (gesperrt)

Für viele Alltagssituationen gibt es im Arabischen auch religiöse Formeln (Gruß, Pläne, Lob, Dank, Befinden, Niesen, Trauer). In den Sprachkursen sind sie gesperrte Kandidaten (Leitfaden §4.2, F-ar-01 bis F-ar-17) und kein Gegenstand dieses Dokuments.
- Tipps nennen nur die weltlichen Entsprechungen aus Leitfaden §4.3 (Tabelle §4.3).
- Kein Tipp erklärt, übersetzt oder bewertet eine religiöse Formel; keine arabische Formel erscheint in Umschrift als Lernziel.
- Sie erscheinen frühestens nach zwei Freigaben der religiösen Prüfung (KERN §2.3, LM-09).

## 5 Hinweise zu Hochsprache, Dialekt und Vorwissen

Der Auftrag sieht Hinweise für Herkunftssprachler beim Türkischen vor (Gegenstück §5). Für `de-aus-ar` ist die wichtigere Frage, welches Arabisch und welches Vorwissen die Lernenden mitbringen.

### 5.1 Wer den Kurs nutzt

| Gruppe | Stärken | typische Lücken | Ausrichtung der Tipps |
|---|---|---|---|
| Kinder und Jugendliche, neu in Deutschland | schnelles Hören, Schule als Lernort | Lateinschrift, Schulsprache; teils unterbrochene Schulzeit | Vorkurs, viele Bild- und Hörübungen, kurze Tipps |
| Erwachsene mit Schulbildung im Herkunftsland | Grammatikbegriffe der Hochsprache, Lerngewohnheit | Lateinschrift, Laute, Wortstellung | volle Kontrasttipps ab A1 |
| Erwachsene mit wenig Schulerfahrung | Alltagserfahrung, Hören | Lesen und Schreiben allgemein | Der Vorkurs setzt Lesen in einer Schrift voraus; eine Alphabetisierung ist nicht Teil des Kurses (zu prüfen, §8). |
| Herkunftssprachler des Arabischen, in Deutschland aufgewachsen | Deutsch oft stärker als Arabisch | Hocharabisch lesen | In der Kurswahl die Oberfläche Deutsch anbieten; `de-aus-ar` passt selten. |

### 5.2 Dialekt hilft und stört

Die Oberfläche ist Hocharabisch, gesprochen wird zu Hause meist ein Dialekt. Für das Deutsche wirken Dialekte unterschiedlich (Angaben je Person zu prüfen):

| Merkmal | Dialekte (Beispiele) | Folge für Deutsch |
|---|---|---|
| Vokale e und o | Levante, Ägypten und andere (etwa bēt, yōm) | e/i und o/u fallen leichter als die Hochsprache vermuten lässt |
| g | Ägypten (ǧ als g), Golf und Irak (q oft als g) | g fällt leicht |
| tsch | Irak, Golf (čāy) | tsch fällt leicht |
| Konsonantenfolgen | Maghreb (viele Konsonantenfolgen) | Str-, Spr- fallen leichter (zu prüfen) |
| p und v in Lehnwörtern | in mehreren Regionen | p/v teilweise bekannt (zu prüfen) |
| Kasusendungen | fehlen in den Dialekten weitgehend | Akkusativ und Genitiv als Begriffe nur aus der Schule |
| Lehnwörter aus Französisch oder Italienisch | Maghreb, Levante, Ägypten (ṣālūn, kanaba, būsṭa) | Brücken und falsche Freunde (§3.1) |

### 5.3 Sprache der Tipps

- **Einfaches Hocharabisch:** kurze Sätze, ein Gedanke je Satz, keine Dialektwörter; ausdrücklich gekennzeichnete Dialektbeispiele nur in Wortschatztipps (§3.1).
- **Beispiele zuerst:** erst das deutsche Beispiel, dann die Regel.
- **Arabische Schrift** steht in den Tipps der Oberfläche, also in `web/inhalte/lernapp/uebersetzung/de-aus-ar/**` (erlaubt nach KERN §3), nie in Werkstatt-Dateien. Ziffern nach LM-18.
- **Fachwörter:** Die Begriffe der arabischen Schulgrammatik sind eine Brücke, wenn ein Beispiel dabeisteht:

| Arabisch (Umschrift) | Deutsch | Hinweis |
|---|---|---|
| ism | Nomen | – |
| fiʿl | Verb | – |
| ṣifa, naʿt | Adjektiv, Attribut | im Arabischen nach dem Nomen |
| ḍamīr | Pronomen | – |
| ḥarf ǧarr | Präposition | im Arabischen immer mit Genitiv |
| fāʿil | Subjekt (beim Verb) | – |
| mubtadaʾ, ḫabar | Subjekt und Prädikat im Nominalsatz | das Deutsche braucht „sein“ |
| mafʿūl bihi | Akkusativobjekt | – |
| marfūʿ, manṣūb, maǧrūr | Nominativ, Akkusativ, Genitiv | Den Dativ gibt es nicht; er entspricht oft li- |
| iḍāfa | Genitivverbindung | gleiche Reihenfolge wie der deutsche Genitiv |
| al-māḍī, al-muḍāriʿ | Vergangenheit, Präsens | – |
| al-maǧhūl | Passiv | – |
| maṣdar | Verbalnomen | -ung, nominalisierter Infinitiv |
| ism fāʿil, ism mafʿūl | Partizip I, Partizip II | – |
| muḏakkar, muʾannaṯ | maskulin, feminin | das Deutsche hat zusätzlich neutral |
| mufrad, muṯannā, ǧamʿ | Singular, Dual, Plural | kein Dual im Deutschen |

### 5.4 Mehrsprachigkeit als Stärke

- Wer Hochsprache und Dialekt nebeneinander kennt, kennt schon das Prinzip von Standard und Umgangssprache (B2-e11, C1-e01).
- Wurzel und Muster schulen den Blick für Wortfamilien; deutsche Wortfamilien funktionieren ähnlich (B2-e09).
- Sprachwechsel im Gespräch ist kein Fehler, sondern eine Frage des Registers.

## 6 Tipp-Themen je Einheit

297 Tipp-Themen für 78 Einheiten-Schlüssel (Vorkurs und 72 Einheiten). 190 beziehen sich auf eine Grammatik-ID, die übrigen auf Laut, Schrift, Wortschatz oder Pragmatik (Abschnitt in der Spalte „Bezug“). Jede Einheit hat mindestens zwei Tipps.

| Stufe | Einheiten | Tipp-Themen | je Einheit |
|---|---|---|---|
| Vorkurs | 6 | 21 | 3,5 |
| A1 | 12 | 68 | 5,7 |
| A2 | 14 | 66 | 4,7 |
| B1 | 16 | 60 | 3,8 |
| B2 | 16 | 48 | 3,0 |
| C1 | 14 | 34 | 2,4 |
| Σ | 78 | 297 | 3,8 |

**Leitlinien für das Schreiben der Tipps (Phase Ü, PLAN §6.3):**
- **Sprache:** Hocharabisch als Oberflächensprache, einfach und kurz (§5.3): Titel, höchstens zwei Sätze, ein bis drei deutsche Beispiele mit `lang="de"`. Arabische Schrift nur in `web/inhalte/lernapp/uebersetzung/de-aus-ar/**`; hier steht Umschrift.
- **Aufbau:** Brücke zuerst („Das kennst du schon: …“), dann der Unterschied. Keine Wertung der Ausgangssprache; „im Deutschen anders“ statt „falsch“.
- **Ort:** Der Tipp erscheint in der genannten Einheit. Nennt er eine Grammatik-ID, ist sie dort oder früher eingeführt (vom Generator geprüft).
- **Beispiele:** nur Wortschatz bis zur Einheit (PLAN §6.4), nur Namen aus der Namensliste (Leitfaden §1.1), bis B1 kindgeeignet, ohne Tabu-Lexikon und ohne religiöse Formeln (§4.7).
- **Schlüssel:** Vorschlag `de-aus-ar.tipp.<Nr.>`; das Schema legt L3-02 fest.

| Nr. | Einheit | Tipp-Titel | Bezug |
|---|---|---|---|
| 001 | de.v.l01 | Von links nach rechts lesen und schreiben | §1.1 |
| 002 | de.v.l01 | Druckbuchstaben stehen einzeln – nichts wird verbunden | §1.1 |
| 003 | de.v.l01 | b und d, p und q, n und u: gespiegelte Formen | §1.1 |
| 004 | de.v.l01 | Ziffern: europäische und östlich-arabische Formen | §1.1 |
| 005 | de.v.l02 | Zwei Formen je Buchstabe: A und a | §1.1 |
| 006 | de.v.l02 | Nomen groß: Tee, Brot, Schule | §1.1 |
| 007 | de.v.l02 | Satzanfang und Namen groß | §1.1 |
| 008 | de.v.l03 | ü liegt zwischen i und u: Tür – Tier | §1.2 |
| 009 | de.v.l03 | ö liegt zwischen e und o: schön – schon | §1.2 |
| 010 | de.v.l03 | ß und ss: Straße, Wasser | §1.1 |
| 011 | de.v.l04 | e und i hören: liegen – legen | §1.2 |
| 012 | de.v.l04 | o und u hören: Ohr – Uhr | §1.2 |
| 013 | de.v.l04 | Lang und kurz wie ā und a: Staat – Stadt | §1.2 |
| 014 | de.v.l04 | Vokale immer schreiben – auch die kurzen | §1.1 |
| 015 | de.v.l05 | p ist ein b ohne Stimme: Paar – bar | §1.2 |
| 016 | de.v.l05 | w ist ein f mit Stimme: Wasser | §1.2 |
| 017 | de.v.l05 | v klingt meist wie f: Vater, vier | §1.2 |
| 018 | de.v.l06 | sch, ch, ei, ie: mehrere Buchstaben, ein Laut | §1.1 |
| 019 | de.v.l06 | ch nach a, o, u klingt wie ḫ: Buch, Nacht | §1.2 |
| 020 | de.v.l06 | Doppelter Konsonant: kurzer Vokal davor | §1.1 |
| 021 | de.v.l06 | Den eigenen Namen so schreiben wie im Pass | §4.5 |
| 022 | de.a1.e01 | bin, ist: Im Deutschen fehlt das Verb nie | `de.g.sein-pronomen` |
| 023 | de.a1.e01 | du für Mann und Frau – anta und anti in einem Wort | `de.g.sein-pronomen` |
| 024 | de.a1.e01 | Das Pronomen gehört dazu: Ich wohne … | `de.g.praesens-regel` |
| 025 | de.a1.e01 | hal …? → Verb nach vorn | `de.g.fragen` |
| 026 | de.a1.e01 | Sie für Erwachsene: eine Form, die die Hochsprache nicht hat | §4.1 |
| 027 | de.a1.e01 | Buchstabieren mit deutschen Buchstabennamen | §1.1 |
| 028 | de.a1.e01 | Länder mit Artikel: aus dem Irak, aber aus Jordanien | §3.4 |
| 029 | de.a1.e02 | der, die, das: drei Genera statt zwei | `de.g.artikel-genus` |
| 030 | de.a1.e02 | Genus nicht übertragen: der Tisch, die Woche | `de.g.artikel-genus` |
| 031 | de.a1.e02 | Endung -e wie -a: oft „die“ | `de.g.artikel-genus` |
| 032 | de.a1.e02 | -hu → sein, -hā → ihr | `de.g.possessiv-nom` |
| 033 | de.a1.e02 | ʿindī … → Ich habe … | `de.g.haben` |
| 034 | de.a1.e02 | Zahlen 21–99: Einer zuerst – wie im Arabischen | §1.4 |
| 035 | de.a1.e02 | Tante und Onkel: ein Wort für ʿamma und ḫāla | §3.4 |
| 036 | de.a1.e03 | Ohne al- → ein oder eine | `de.g.unbest-artikel-negation` |
| 037 | de.a1.e03 | Nach jeder Zahl ab zwei: Plural | `de.g.plural` |
| 038 | de.a1.e03 | Plural mitlernen – wie den gebrochenen Plural | `de.g.plural` |
| 039 | de.a1.e03 | Das Zimmer ist groß: mit „ist“, ohne Endung | `de.g.adjektiv-praedikativ` |
| 040 | de.a1.e03 | ṣālūn ist das Wohnzimmer, Salon etwas anderes | §3.1 |
| 041 | de.a1.e03 | kanaba ist das Sofa, Kanapee ein Häppchen | §3.1 |
| 042 | de.a1.e04 | halb neun = 8:30 | `de.g.zeitangaben` |
| 043 | de.a1.e04 | um, am, im | `de.g.zeitangaben` |
| 044 | de.a1.e04 | Verb nie auf Platz 1 im Aussagesatz | `de.g.v2-inversion` |
| 045 | de.a1.e04 | Monatsnamen: wie yanāyir, nicht wie kānūn | §3.3 |
| 046 | de.a1.e04 | Das Wochenende sind Samstag und Sonntag | §4.6 |
| 047 | de.a1.e04 | sāʿa: Uhr oder Stunde? | §3.4 |
| 048 | de.a1.e05 | einen Tee: Akkusativ wie mafʿūl bihi | `de.g.akkusativ` |
| 049 | de.a1.e05 | uḥibbu l-qirāʾa → Ich lese gern | `de.g.vorlieben` |
| 050 | de.a1.e05 | essen – du isst: Vokalwechsel wie im arabischen Stamm | `de.g.praesens-vokalwechsel` |
| 051 | de.a1.e05 | ṭāsa ist keine Tasse | §3.1 |
| 052 | de.a1.e05 | Ein „bitte“ für min faḍlik, tafaḍḍal und ʿafwan | §4.3 |
| 053 | de.a1.e05 | Guten Appetit – vor dem Essen | §4.3 |
| 054 | de.a1.e05 | Zucker und Kaffee: deutsche Wörter aus dem Arabischen | §3.2 |
| 055 | de.a1.e06 | Nur „nicht“ und „kein“ – für alle Zeiten | `de.g.negation-nicht` |
| 056 | de.a1.e06 | „nicht“ steht hinter dem Verb | `de.g.negation-nicht` |
| 057 | de.a1.e06 | kam → wie viele + Plural | `de.g.mengen` |
| 058 | de.a1.e06 | Preise mit Komma: 2,50 € | §4.6 |
| 059 | de.a1.e06 | p hören: Preis, Paprika, Packung | §1.2 |
| 060 | de.a1.e07 | an + Verb → Infinitiv am Satzende | `de.g.modalverben-1` |
| 061 | de.a1.e07 | Ich kann schwimmen – ohne „dass“ | `de.g.modalverben-1` |
| 062 | de.a1.e07 | Öffne, Öffnen Sie: kein Unterschied zwischen Mann und Frau | `de.g.imperativ` |
| 063 | de.a1.e07 | Die Lehrerin heißt „Frau Schneider“ | §4.2 |
| 064 | de.a1.e07 | Nachfragen: „Wie bitte?“ | §4.3 |
| 065 | de.a1.e08 | „wa“ am Satzanfang weglassen | `de.g.konnektoren-hauptsatz` |
| 066 | de.a1.e08 | li-anna → denn | `de.g.konnektoren-hauptsatz` |
| 067 | de.a1.e08 | Einladen und absagen: Ich kann leider nicht. | §4.4 |
| 068 | de.a1.e08 | gern + Verb: Ich male gern | `de.g.vorlieben` |
| 069 | de.a1.e09 | ilā → nach, zu oder in? | `de.g.ort-richtung` |
| 070 | de.a1.e09 | zu Hause oder nach Hause? | `de.g.ort-richtung` |
| 071 | de.a1.e09 | yumkinu → man kann | `de.g.man` |
| 072 | de.a1.e09 | maktaba: Bibliothek oder Buchhandlung? | §3.4 |
| 073 | de.a1.e09 | Bank: Geldinstitut und Sitzbank | §3.1 |
| 074 | de.a1.e09 | Straße: Konsonanten ohne Hilfsvokal | §1.2 |
| 075 | de.a1.e10 | hunāka → es gibt | `de.g.es-unpersoenlich` |
| 076 | de.a1.e10 | Es regnet, es ist kalt: „es“ ist Pflicht | `de.g.es-unpersoenlich` |
| 077 | de.a1.e10 | Pronomen nach deutschem Genus: ihn, sie, es | `de.g.akk-pronomen` |
| 078 | de.a1.e10 | Die Jacke ist blau: Farben nach „ist“ ohne Endung | `de.g.adjektiv-praedikativ` |
| 079 | de.a1.e10 | w und v: Wetter, warm, Wind | §1.2 |
| 080 | de.a1.e11 | yaǧibu allā → nicht dürfen, lā yaǧibu → nicht müssen | `de.g.modalverben-2` |
| 081 | de.a1.e11 | anā bardān → Mir ist kalt | `de.g.dativ-wendungen` |
| 082 | de.a1.e11 | Mir tut der Kopf weh | `de.g.dativ-wendungen` |
| 083 | de.a1.e11 | Doktor oder Arzt? | §3.1 |
| 084 | de.a1.e11 | šifāʾan ʿāǧilan → Gute Besserung | §4.3 |
| 085 | de.a1.e11 | Notruf in Deutschland: 112 und 110 | §4.6 |
| 086 | de.a1.e12 | Trennbare Verben: auf … am Ende | `de.g.trennbare-verben` |
| 087 | de.a1.e12 | -in = Femininendung -a | `de.g.wortbildung-in` |
| 088 | de.a1.e12 | Ärztin, Köchin: Umlaut bei -in | `de.g.wortbildung-in` |
| 089 | de.a1.e12 | Berufe sind keine Anrede: nicht „Herr Ingenieur“ | §4.2 |
| 090 | de.a2.e01 | māḍī → habe … gemacht | `de.g.perfekt-haben` |
| 091 | de.a2.e01 | Das Partizip steht am Ende | `de.g.perfekt-haben` |
| 092 | de.a2.e01 | kuntu → ich war | `de.g.praeteritum-sein-haben` |
| 093 | de.a2.e01 | kāna ʿindī → ich hatte | `de.g.praeteritum-sein-haben` |
| 094 | de.a2.e01 | ge- schreiben: gemacht, gekauft | §1.1 |
| 095 | de.a2.e02 | Bewegung → sein | `de.g.perfekt-sein` |
| 096 | de.a2.e02 | Die Präposition bestimmt den Fall – wie im Arabischen | `de.g.dativ-praep` |
| 097 | de.a2.e02 | maʿa → mit dem: Dativ statt Genitiv | `de.g.dativ-praep` |
| 098 | de.a2.e02 | bāṣ, taksī, mītrū: bekannte Wörter | §3.3 |
| 099 | de.a2.e03 | Wem? Die Person steht im Dativ | `de.g.dativ-objekt` |
| 100 | de.a2.e03 | sāʿidnī → Hilf mir (nicht mich) | `de.g.dativ-pronomen` |
| 101 | de.a2.e03 | yuʿǧibunī → gefällt mir | `de.g.dativ-pronomen` |
| 102 | de.a2.e03 | mabrūk → Herzlichen Glückwunsch | §4.3 |
| 103 | de.a2.e03 | ü in Glückwunsch: nicht i | §1.2 |
| 104 | de.a2.e04 | fī → Dativ, ilā → Akkusativ | `de.g.wechselpraep` |
| 105 | de.a2.e04 | waḍaʿa = stellen, legen, hängen, setzen | `de.g.positionsverben` |
| 106 | de.a2.e04 | Matratze kommt von maṭraḥ | §3.2 |
| 107 | de.a2.e04 | Umzug: z spricht man ts | §1.2 |
| 108 | de.a2.e05 | Nach weil: Verb ans Ende | `de.g.nebensatz-weil` |
| 109 | de.a2.e05 | li-anna → denn | `de.g.nebensatz-weil` |
| 110 | de.a2.e05 | sich erkälten: „sich“ mitlernen | `de.g.reflexive-verben` |
| 111 | de.a2.e05 | Rezept: vom Arzt und zum Kochen | §3.4 |
| 112 | de.a2.e05 | Termin absagen, wenn man nicht kommt | §4.4 |
| 113 | de.a2.e05 | Kind, Tag: am Wortende klingt d wie t, g wie k | §1.2 |
| 114 | de.a2.e06 | Adjektiv vor das Nomen: die blaue Jacke | `de.g.adj-dekl-best` |
| 115 | de.a2.e06 | hāḏihi l-… → diese … (ohne zweites die) | `de.g.welch-dies` |
| 116 | de.a2.e06 | ayy → welcher, welche, welches | `de.g.welch-dies` |
| 117 | de.a2.e06 | Pullover, Paket: p ist nicht b | §1.2 |
| 118 | de.a2.e07 | anna → dass + Verb am Ende | `de.g.nebensatz-dass` |
| 119 | de.a2.e07 | lam yaʾti aḥad → Niemand ist gekommen | `de.g.indefinitpronomen` |
| 120 | de.a2.e07 | Nachbarn: Herr Neumann statt „ʿammū“ | §4.2 |
| 121 | de.a2.e07 | Ein „Nein, danke“ gilt beim ersten Mal | §4.4 |
| 122 | de.a2.e07 | ei spricht man ai: klingeln, leihen | §1.2 |
| 123 | de.a2.e08 | akbar min → größer als (nicht von) | `de.g.komparation` |
| 124 | de.a2.e08 | für, ohne, gegen + Akkusativ | `de.g.praep-akk` |
| 125 | de.a2.e08 | Superlativ: am schnellsten | `de.g.komparation` |
| 126 | de.a2.e08 | Training, Trainerin: Lehnwörter mit deutschem Artikel | §3.3 |
| 127 | de.a2.e09 | iḏā + Vergangenheitsform → wenn + Präsens | `de.g.nebensatz-wenn` |
| 128 | de.a2.e09 | Nach dem wenn-Satz sofort das Verb | `de.g.nebensatz-wenn` |
| 129 | de.a2.e09 | 3. Mai = dritter Mai | `de.g.datum-ordinal` |
| 130 | de.a2.e09 | Formular: Vorname und Familienname, kein Vatername | §4.5 |
| 131 | de.a2.e09 | Familiennamen in der Familie können verschieden sein | §4.2 |
| 132 | de.a2.e10 | hal yumkinuka …? → Könnten Sie …? | `de.g.hoeflich-konj` |
| 133 | de.a2.e10 | law samaḥt → Würden Sie bitte …? | `de.g.hoeflich-konj` |
| 134 | de.a2.e10 | ṯumma → dann + Verb + Subjekt | `de.g.textfolge` |
| 135 | de.a2.e10 | Handy ist kein englisches Wort | §3.5 |
| 136 | de.a2.e10 | Deutsche Tastatur: z und y, Umlaute | §1.1 |
| 137 | de.a2.e10 | baṭṭāriyya: Batterie oder Akku? | §3.4 |
| 138 | de.a2.e11 | baʿda ṯalāṯat ayyām → in drei Tagen | `de.g.temporale-praep` |
| 139 | de.a2.e11 | qabla usbūʿ → vor einer Woche | `de.g.temporale-praep` |
| 140 | de.a2.e11 | kuntu urīdu → ich wollte | `de.g.praeteritum-modal` |
| 141 | de.a2.e11 | fīza → das Visum | §3.3 |
| 142 | de.a2.e12 | Schultasche = ḥaqībat al-madrasa: Reihenfolge umgekehrt | `de.g.wortbildung-komposita` |
| 143 | de.a2.e12 | Der Artikel kommt vom letzten Wort | `de.g.wortbildung-komposita` |
| 144 | de.a2.e12 | darrāǧat Yazan → das Fahrrad von Yazan | `de.g.genitiv-s` |
| 145 | de.a2.e12 | Giraffe und Kamel: Tiernamen mit arabischen Wurzeln | §3.2 |
| 146 | de.a2.e12 | pf: Pflanze, Apfel, Pferd | §1.2 |
| 147 | de.a2.e13 | aṣbaḥa → werden | `de.g.werden-vollverb` |
| 148 | de.a2.e13 | ein netter Chef: Endung zeigt das Genus | `de.g.adj-dekl-unbest` |
| 149 | de.a2.e13 | Ingenieurin, Elektriker: Berufe ohne Titel | §4.2 |
| 150 | de.a2.e13 | ch nach e und i: ich, Bücher | §1.2 |
| 151 | de.a2.e14 | li-ḏālika → deshalb + Verb | `de.g.konnektoren-adverb` |
| 152 | de.a2.e14 | maʿa ḏālika → trotzdem | `de.g.konnektoren-adverb` |
| 153 | de.a2.e14 | āsif → Es tut mir leid; ʿafwan → Entschuldigung | §4.3 |
| 154 | de.a2.e14 | Mir ist langweilig: Gefühl mit Dativ | `de.g.dativ-wendungen` |
| 155 | de.a2.e14 | eu: Freund, Freude | §1.2 |
| 156 | de.b1.e01 | Präteritum für Erzählungen: kam, arbeitete | `de.g.praeteritum` |
| 157 | de.b1.e01 | Starke Verben: Stammwechsel wie im Arabischen | `de.g.praeteritum` |
| 158 | de.b1.e01 | ʿindamā → als oder wenn? | `de.g.nebensatz-temporal` |
| 159 | de.b1.e01 | qabla an → bevor | `de.g.nebensatz-temporal` |
| 160 | de.b1.e02 | an + Verb → zu + Infinitiv am Ende | `de.g.infinitiv-zu` |
| 161 | de.b1.e02 | ihtamma bi- → sich interessieren für | `de.g.verben-praep` |
| 162 | de.b1.e02 | intaẓara → warten auf | `de.g.verben-praep` |
| 163 | de.b1.e02 | Duale Ausbildung: Betrieb und Berufsschule | §4.6 |
| 164 | de.b1.e02 | bekommen heißt nicht become | §3.5 |
| 165 | de.b1.e03 | yanbaġī ʿalayka → du solltest | `de.g.konjunktiv-2` |
| 166 | de.b1.e03 | atamannā law → ich wünschte | `de.g.konjunktiv-2` |
| 167 | de.b1.e03 | Ich wasche mir die Hände | `de.g.reflexiv-dativ` |
| 168 | de.b1.e04 | yuṣlaḥu → wird repariert | `de.g.passiv-praesens` |
| 169 | de.b1.e04 | von + Dativ für den Handelnden | `de.g.passiv-praesens` |
| 170 | de.b1.e04 | reparieren lassen | `de.g.lassen` |
| 171 | de.b1.e05 | Kein Rückverweis: der Link, den du bekommen hast | `de.g.relativsatz-nom-akk` |
| 172 | de.b1.e05 | Auch nach „eine Nachricht“ ein Relativpronomen | `de.g.relativsatz-nom-akk` |
| 173 | de.b1.e05 | hal → ob | `de.g.indirekte-frage` |
| 174 | de.b1.e05 | ob oder wenn? | `de.g.indirekte-frage` |
| 175 | de.b1.e05 | Chef, Gift, Handy: Vorsicht mit Englisch | §3.5 |
| 176 | de.b1.e06 | fīhā → in dem: Präposition nach vorn | `de.g.relativsatz-dat-praep` |
| 177 | de.b1.e06 | li- und kay → um … zu oder damit | `de.g.um-zu-damit` |
| 178 | de.b1.e06 | „wo“ nur für Orte | `de.g.relativsatz-dat-praep` |
| 179 | de.b1.e07 | Noten: Die 1 ist die beste | §4.6 |
| 180 | de.b1.e07 | sa-, sawfa → oft Präsens | `de.g.futur-1` |
| 181 | de.b1.e07 | raġma anna → obwohl + Verb am Ende | `de.g.konzessiv` |
| 182 | de.b1.e07 | Elternabend: Sie und Familienname | §4.2 |
| 183 | de.b1.e07 | Schulformen nach der Grundschule | §4.6 |
| 184 | de.b1.e08 | kāna qad → hatte/war + Partizip | `de.g.plusquamperfekt` |
| 185 | de.b1.e08 | Schau mal! Komm doch mit! | `de.g.modalpartikeln` |
| 186 | de.b1.e08 | Koffer, Gepäck, Unterkunft: Genus prüfen | `de.g.artikel-genus` |
| 187 | de.b1.e09 | Iḍāfa → Genitiv: die Farbe des Autos | `de.g.genitiv` |
| 188 | de.b1.e09 | Artikel vor dem ersten Nomen | `de.g.genitiv` |
| 189 | de.b1.e09 | bi-ḥayṯu → sodass | `de.g.konsekutiv` |
| 190 | de.b1.e10 | den Kollegen: n-Deklination | `de.g.n-deklination` |
| 191 | de.b1.e10 | Mit freundlichen Grüßen | `de.g.adj-dekl-ohne` |
| 192 | de.b1.e10 | Kritik im Team: sachlich und direkt | §4.4 |
| 193 | de.b1.e10 | Unter Kollegen oft du | §4.1 |
| 194 | de.b1.e11 | yaǧibu an yuqaṭṭaʿa → muss geschnitten werden | `de.g.passiv-praet-modal` |
| 195 | de.b1.e11 | ism mafʿūl → Partizip II vor dem Nomen | `de.g.partizip-adjektiv` |
| 196 | de.b1.e11 | Safran, Spinat, Aubergine: Küchenwörter aus dem Arabischen | §3.2 |
| 197 | de.b1.e11 | Lob für das Essen: Das schmeckt sehr gut! | §4.3 |
| 198 | de.b1.e12 | Maṣdar → -ung oder das + Infinitiv | `de.g.wortbildung-nomen` |
| 199 | de.b1.e12 | -ung ist immer „die“ | `de.g.wortbildung-nomen` |
| 200 | de.b1.e12 | Tarif kommt von taʿrīfa | §3.2 |
| 201 | de.b1.e12 | Adresse: Straße, Hausnummer, Postleitzahl, Ort | §4.5 |
| 202 | de.b1.e13 | muġlaq → ist geschlossen | `de.g.zustandspassiv` |
| 203 | de.b1.e13 | ist oder wird? | `de.g.zustandspassiv` |
| 204 | de.b1.e13 | Antrag: Der deutsche Brief kommt schnell zur Sache | §4.5 |
| 205 | de.b1.e13 | Frist: bis zum 3. Mai | `de.g.datum-ordinal` |
| 206 | de.b1.e14 | qābil li- → -bar | `de.g.wortbildung-adjektiv` |
| 207 | de.b1.e14 | Nisba -ī → -lich oder -isch | `de.g.wortbildung-adjektiv` |
| 208 | de.b1.e14 | Ziffer ist nicht ṣifr | §3.1 |
| 209 | de.b1.e14 | Algebra, Chemie, Algorithmus | §3.2 |
| 210 | de.b1.e15 | law + Vergangenheitsform → wenn + Konjunktiv II | `de.g.konj2-irreal` |
| 211 | de.b1.e15 | hätte … würde: beide Teile im Konjunktiv | `de.g.konj2-irreal` |
| 212 | de.b1.e15 | Monsun kommt von mawsim | §3.2 |
| 213 | de.b1.e16 | lā … wa-lā → weder … noch | `de.g.zweiteilige-konnektoren` |
| 214 | de.b1.e16 | immā … aw → entweder … oder | `de.g.zweiteilige-konnektoren` |
| 215 | de.b1.e16 | Behördenbriefe: durchgehend Sie | §4.1 |
| 216 | de.b2.e01 | baʿda itmām → nach Abschluss | `de.g.nominalstil` |
| 217 | de.b2.e01 | Lebenslauf: tabellarisch, Foto freiwillig | §4.5 |
| 218 | de.b2.e01 | Anschreiben: Sehr geehrte Frau … | §4.5 |
| 219 | de.b2.e02 | fī ḥāl → falls; Sollten Sie … | `de.g.konditional-falls` |
| 220 | de.b2.e02 | šarṭa an → vorausgesetzt, dass | `de.g.konditional-falls` |
| 221 | de.b2.e02 | Probezeit, Kündigungsfrist: von hinten lesen | `de.g.wortbildung-komposita` |
| 222 | de.b2.e02 | Im Betrieb: Sie oder du? | §4.1 |
| 223 | de.b2.e03 | mā in → sobald | `de.g.temporal-b2` |
| 224 | de.b2.e03 | ṭālamā → solange | `de.g.temporal-b2` |
| 225 | de.b2.e03 | kullamā → sooft | `de.g.temporal-b2` |
| 226 | de.b2.e04 | qābil li-l-ilġāʾ → kündbar | `de.g.passiversatz` |
| 227 | de.b2.e04 | yaǧibu dafʿuhā → ist zu bezahlen | `de.g.passiversatz` |
| 228 | de.b2.e04 | bi-sabab, ḫilāla: Genitiv wie im Arabischen | `de.g.praep-genitiv` |
| 229 | de.b2.e05 | qāla inna → Konjunktiv I | `de.g.konjunktiv-1` |
| 230 | de.b2.e05 | ʿalā ḏālika → darauf | `de.g.textverweise` |
| 231 | de.b2.e05 | Magazin ist eine Zeitschrift, maḫzan ein Lager | §3.1 |
| 232 | de.b2.e06 | kāna yanbaġī → hätten … sollen | `de.g.konj2-vergangenheit` |
| 233 | de.b2.e06 | al-marḍā → die Kranken | `de.g.adjektiv-nominalisiert` |
| 234 | de.b2.e07 | ʿan ṭarīq → indem | `de.g.modalsatz-indem` |
| 235 | de.b2.e07 | kullamā … → je … desto | `de.g.je-desto` |
| 236 | de.b2.e07 | Wortstellung bei je … desto | `de.g.je-desto` |
| 237 | de.b2.e08 | ittaḫaḏa qarāran → eine Entscheidung treffen | `de.g.funktionsverbgefuege` |
| 238 | de.b2.e08 | qaddama ṭalaban → einen Antrag stellen | `de.g.funktionsverbgefuege` |
| 239 | de.b2.e08 | bakālūriyā ist das Abitur, nicht der Bachelor | §3.1 |
| 240 | de.b2.e08 | līsāns ist der Bachelor, nicht die Lizenz | §3.1 |
| 241 | de.b2.e09 | Lange Attribute: vom Artikel zum Nomen springen | `de.g.partizipialattribut` |
| 242 | de.b2.e09 | Attribut vor dem Nomen statt danach | `de.g.partizipialattribut` |
| 243 | de.b2.e09 | Wortfamilien wie Wurzeln: fahren, Fahrt, Fahrer | `de.g.wortbildung-verben` |
| 244 | de.b2.e10 | ṣaḥīḥ anna … lākin → zwar … aber | `de.g.konzessiv-b2` |
| 245 | de.b2.e10 | ḥattā law → selbst wenn | `de.g.konzessiv-b2` |
| 246 | de.b2.e10 | Komma als Dezimalzeichen auf Rechnungen | §4.6 |
| 247 | de.b2.e11 | ka-anna → als ob | `de.g.irrealer-vergleich` |
| 248 | de.b2.e11 | fuṣḥā und Dialekt – Standard und Umgangssprache | §5 |
| 249 | de.b2.e11 | Mehrsprachig: Arabisch hilft beim Deutschen | §5 |
| 250 | de.b2.e12 | sa-yakūnu qad → wird … haben | `de.g.futur-2` |
| 251 | de.b2.e12 | man → wer | `de.g.relativ-wer-was` |
| 252 | de.b2.e12 | mā → was nach alles und etwas | `de.g.relativ-wer-was` |
| 253 | de.b2.e13 | worden statt geworden | `de.g.passiv-perfekt` |
| 254 | de.b2.e13 | lā budda anna → muss (Vermutung) | `de.g.modal-vermutung` |
| 255 | de.b2.e13 | rubbamā → könnte | `de.g.modal-vermutung` |
| 256 | de.b2.e14 | allatī … -hā → deren | `de.g.genitiv-relativ` |
| 257 | de.b2.e14 | dessen oder deren? | `de.g.genitiv-relativ` |
| 258 | de.b2.e15 | dūna an → ohne … zu | `de.g.statt-ohne` |
| 259 | de.b2.e15 | badalan min an → statt … zu | `de.g.statt-ohne` |
| 260 | de.b2.e15 | Homeoffice, Software: Anglizismen mit Artikel | §3.3 |
| 261 | de.b2.e16 | baynamā → während (beide Bedeutungen) | `de.g.adversativ` |
| 262 | de.b2.e16 | mimmā → was | `de.g.weiterfuehrender-nebensatz` |
| 263 | de.b2.e16 | Reklamation: schriftlich und mit Frist | §4.5 |
| 264 | de.c1.e01 | fuṣḥā und Dialekt → Schriftsprache und Umgangssprache | `de.g.register` |
| 265 | de.c1.e01 | Register wechseln: Danke – Vielen Dank – Ich bedanke mich | `de.g.register` |
| 266 | de.c1.e01 | Zwischen Sprachen wechseln: bewusst und passend | §5 |
| 267 | de.c1.e02 | hal min al-mumkin …? → Wäre es möglich …? | `de.g.konj2-diplomatie` |
| 268 | de.c1.e02 | wohl, ruhig, etwa: Partikeln deuten | `de.g.modalpartikeln-c1` |
| 269 | de.c1.e03 | wafqan li- → laut oder zufolge | `de.g.redewiedergabe-text` |
| 270 | de.c1.e03 | ašāra ilā anna → wie … betont | `de.g.redewiedergabe-text` |
| 271 | de.c1.e04 | kāna yaǧibu an … → hätte … werden müssen | `de.g.passiv-c1` |
| 272 | de.c1.e04 | gemäß und ungeachtet: Kasus mitlernen | `de.g.gehobene-praep` |
| 273 | de.c1.e05 | yuqālu inna → soll | `de.g.subjektive-modalverben` |
| 274 | de.c1.e05 | yazʿumu → will … haben | `de.g.subjektive-modalverben` |
| 275 | de.c1.e05 | illā iḏā → es sei denn | `de.g.konnektoren-c1` |
| 276 | de.c1.e05 | min nāḥiya … → einerseits … andererseits | `de.g.konnektoren-c1` |
| 277 | de.c1.e06 | Komposita sind Iḍāfa-Ketten rückwärts | `de.g.wortbildung-c1` |
| 278 | de.c1.e06 | -weise, -gerecht, -mäßig | `de.g.wortbildung-c1` |
| 279 | de.c1.e07 | Maṣdar-Stil kennen Sie: Amtsdeutsch auflösen | `de.g.verbalisierung` |
| 280 | de.c1.e07 | Widerspruch: Aufbau, Frist, Aktenzeichen | §4.5 |
| 281 | de.c1.e08 | ḥāl → Partizip: Von der Reise erschöpft, … | `de.g.partizipialkonstruktion` |
| 282 | de.c1.e08 | man ǧadda waǧada ≈ Ohne Fleiß kein Preis | `de.g.idiomatik` |
| 283 | de.c1.e08 | Sprichwörter vergleichen, nicht übersetzen | `de.g.idiomatik` |
| 284 | de.c1.e09 | bi-l-kād → kaum | `de.g.negation-c1` |
| 285 | de.c1.e09 | nicht unwichtig: doppelte Verneinung ist Bejahung | `de.g.negation-c1` |
| 286 | de.c1.e09 | In der Versammlung sachlich widersprechen | §4.4 |
| 287 | de.c1.e10 | Statt „wa“ am Satzanfang: deutsche Überleitungen | `de.g.textkohaesion` |
| 288 | de.c1.e10 | Protokoll: Infinitiv am Ende | `de.g.verkuerzung` |
| 289 | de.c1.e10 | Lange Sätze teilen | `de.g.textkohaesion` |
| 290 | de.c1.e11 | ahammu min an → zu wichtig, als dass | `de.g.vergleich-c1` |
| 291 | de.c1.e11 | Ältere mit Sie ansprechen – nicht mit „ʿammū“ | §4.2 |
| 292 | de.c1.e12 | Voranstellung betont – wie beim taqdīm | `de.g.satzgliedstellung` |
| 293 | de.c1.e12 | Nach dem Vorfeld: Verb auf Platz 2 | `de.g.satzgliedstellung` |
| 294 | de.c1.e13 | Genitivketten wie eine Iḍāfa lesen | `de.g.attribute-komplex` |
| 295 | de.c1.e13 | Vorangestellte Attribute auflösen | `de.g.attribute-komplex` |
| 296 | de.c1.e14 | Rückblick: Zeiten mischen | `de.g.praeteritum` |
| 297 | de.c1.e14 | Abschlüsse benennen: Abitur, Ausbildung, Studium | §3.1 |

## 7 Messwerte und Methode

| Messung | Wert | Quelle und Methode |
|---|---|---|
| Genus der häufigsten Nomen (Top-1.000 / 2.000 / 5.000 Lemmata) | f: 41,7 / 42,9 / 43,2 % · m: 37,9 / 38,6 / 40,1 % · n: 20,4 / 18,6 / 16,7 % (338 / 819 / 2.312 Nomen) | wordfreq 3.1.1 (de), lemmatisiert über den kaikki-Kernauszug; Lemma-Liste des Rahmenplans |
| Endung und Genus (Top-5.000-Nomen) | -ung 98,7 % f (226); -heit, -keit, -schaft 100 % f; -ion 96,5 % f; -tät 100 % f; -ie 100 % f (31); -ik 94,1 % f; -e 85,7 % f (421); -er 83,7 % m (246); -or 13 von 14 m; -ment 100 % n; -um 89,5 % n; -nis 81,2 % n | dto. |
| Genus deutsch (m/f) und arabisch (m/f) bei Nomen mit arabischer Übersetzung | Top-1.000: 51 von 79 gleich (64,6 %) · Top-2.000: 91 von 137 gleich (66,4 %) · Top-5.000: 180 von 275 gleich (65,5 %); dazu deutsche Neutra (Top-2.000): 31 mit arabischem Maskulinum, 7 mit Femininum | Übersetzungen aus de.wiktionary, Genus aus dem kaikki-Kern (en); grobe Messung, die Übersetzungstabellen enthalten Rauschen |
| Beispiele (Genus geprüft) | gleich: Stadt – madīna, Schule – madrasa, Familie – usra, Sprache – luġa (alle f); Kopf – raʾs, Vater – ab (m) · anders: Woche – usbūʿ (m), Stimme – ṣawt (m), Luft – hawāʾ (m), Tisch – ṭāwila (f), Kaffee – qahwa (f), Stern – naǧma (f), Wind – rīḥ (f) · Neutra: Kind – ṭifl (m), Wasser – māʾ (m), Herz – qalb (m), Auge – ʿayn (f) | Umschrift nach DIN 31635 vereinfacht |
| Tatoeba de↔ar: arabische Sätze mit ʿind- | im deutschen Satz „haben“ 21, anders 21 | Tatoeba-Export vom 10.10.2026, Paare de↔ar (Beleg S7 §3.2) |
| Tatoeba: deutsche Sätze (ab 3 Wörtern) mit großgeschriebenem Wort im Satzinneren | 73,2 % von 22.573 | dto. |
| Internationalismen: Nomen mit arabischer Übersetzung und ähnlichem Klang | Top-1.000: 11 von 106 (10,4 %) · Top-2.000: 17 von 186 (9,1 %) · Top-5.000: 24 von 368 (6,5 %) | Vergleich mit der Umschrift des kaikki-Kerns; Ähnlichkeit ≥ 0,7 (Schätzung) |
| Glossen in der Ausgangssprache (Top-1.000 / Top-5.000) | 40 % / 30 % | Beleg S7 §3.6; Glossen und Tipps tragen hier mehr KI-Entwurf mit Gegenprüfung |

**Methode.**
- Gelesen wurden nur die S7-Auszüge im Scratchpad (`l0/S7/auszug/`: Häufigkeit, kaikki-Kern, Tatoeba) und die bereinigte Lemma-Liste des Rahmen-Generators (`l3-rahmen-de/bereinigt.json`), mit `python3 -I`.
- Skripte: `l3-kontrast-de/messen.py` und `l3-kontrast-de/messen_ar_intl.py`; Generator und Prüfungen: `l3-kontrast-de/bauen.py` (alle im Scratchpad der Sitzung, Übernahme nach `_lernapp/werkzeuge/` in L3).
- In dieses Dokument gelangen nur Zahlen, deutsche Wörter und Beispiele in Lateinschrift bzw. Umschrift; kein Tatoeba-Satz und kein Wiktionary-Text.
- Die Ähnlichkeitswerte sind Schätzungen über Schreibung bzw. Umschrift; sie zeigen die Größenordnung, nicht die genaue Zahl.

## 8 Zu prüfen und offene Fragen

Alle laufen mit ihrem Standard weiter (L3-E12, kein Warten).

| ID | Frage | Standard | Wer |
|---|---|---|---|
| KD-ar-01 | Fehlende Vokalbuchstaben und zusammengeschriebene Funktionswörter („unddann“) bei Schreibanfängern: wie häufig? | Tipps im Vorkurs ohne Häufigkeitsangabe | LM-01, Meldungen aus der App |
| KD-ar-02 | Kommt „wenn“ statt „ob“ (aus iḏā) und die Vergangenheitsform nach „wenn“ (aus iḏā + māḍī) tatsächlich vor? | als mögliche Verwechslung, ohne Häufigkeitsangabe | LM-01 |
| KD-ar-03 | Dialektwörter (ṣālūn, kanaba, būsṭa, fīza) in Tipps nennen? | ja, ausdrücklich als „dialektal“ mit Region | LM-01, LM-02 |
| KD-ar-04 | Welche Monatsnamen in Glossen und Tipps? | beide Reihen nennen (§3.3) | LM-01 |
| KD-ar-05 | Herkunft der Lehnwörter (§3.2) und fehlende deutsche Wörter im Arabischen | nach Herkunftswörterbuch prüfen; Liste bleibt Vorschlag | L3, LM-01 |
| KD-ar-06 | Alphabetisierung für Erwachsene ohne Leseerfahrung | nicht Teil des Kurses; Hinweis in der Kurswahl | LM-02, Vorstand |
| KD-ar-07 | Notenskalen und Schulsysteme der Herkunftsländer | Tipp nennt nur die deutsche Skala | LM-01 |
| KD-ar-08 | „Sie“ mit der Verbform von du („Sie kommst“) | als mögliche Verwechslung | LM-01 |
| KD-ar-09 | Aussprache von g als dsch bei Sprechern der Hochsprache | nur als Hörhinweis, kein Pflichttipp | LM-01 |
| KD-ar-10 | wohl ≈ ʿalā mā yabdū (C1) | Formulierung durch Muttersprachler bestätigen | LM-01 |
| KD-ar-11 | Schreibweise arabischer Namen im deutschen Zieltext | nach RF-03 (verbreitete Schreibweise ohne Diakritika) | LM-02, LM-09 |
| KD-ar-12 | Typische Fehler sind Erfahrungswerte, nicht gemessen. | Die Muttersprachler-Stichprobe und Meldungen aus der App (ADR 0041 Nr. 9) schärfen sie nach. | L3, LM-01 |

## 9 Herkunft und Prüfungen

- **Entwurf:** KI-Lauf `ki:l3-kontrast` am 20.10.2026 (L3-01, vorgezogen), auf Grundlage des Rahmenplans Deutsch und des Inhaltsleitfadens.
- **Eigene Darstellung:** Keine fremden Lehrwerke oder Kontrastgrammatiken übernommen; GER nur als Stufen (ADR 0045 Nr. 8, LM-36).
- **Automatische Prüfungen des Generators:**
  - alle 123 Grammatik-IDs des Rahmenplans genau einmal in §2
  - jeder Tipp auf einem gültigen Einheiten-Schlüssel; jede Einheit mit Tipp; Grammatik-Bezug nie vor seiner Einführung
  - Tabu-Lexikon des Leitfadens (de, tr, ar-Umschrift): 0 echte Treffer; Fehlalarme: „bier“ (de, Alkohol) in buchstabieren; Ausnahme fehlt im Leitfaden (2); „lan“ (tr, Fluchen) als arabische Verneinungspartikel lan bzw. Wortrest der Umschrift (2); „parti“ (tr, Politik) in Partizip und Partikel (29)
  - 0 arabische Zeichen (U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF)
- **Menschliche Prüfung:** Stichprobe der Muttersprachler (LM-01) mit den Punkten aus §8; Abnahme zusammen mit dem Rahmenplan (LM-02).
