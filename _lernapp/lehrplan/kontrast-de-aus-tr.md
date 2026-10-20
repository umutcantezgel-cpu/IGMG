# Kontrastdokument Deutsch aus Türkisch (`de-aus-tr`)

- **Stand:** 20.10.2026, Version 0.1.0-entwurf (L3-01, vorgezogen)
- **Status:** Entwurf. Er gilt als Standard für die kontrastiven Tipps, Ablenker und angenommenen Antworten der Richtung `de-aus-tr`, bis die Muttersprachler-Stichprobe (LM-01) und die Abnahme des Rahmens (LM-02) andere Ergebnisse bringen.
- **Zweck:** Grundlage für die Phase Ü (Übersetzung je Richtung) der Inhalts-Pipeline (PLAN §6.3) und für die ≈ 300 kontrastiven Tipps je Richtung (PLAN §5.1). Ablage nach PLAN §6.1.
- **Bezug:**
  - Rahmenplan Deutsch: `web/inhalte/lernapp/rahmen/de.rahmen.json`, `RAHMEN-de.md` §11 (Kontrastive Schwerpunkte)
  - PLAN §4 (Übungstypen, Antwortabgleich §4.1), §5.1, §6.1–§6.4
  - KERN §2 (KI-Regel 2), §5 (Kinderschutz), §7 (Oberfläche)
  - Inhaltsleitfaden `_lernapp/lehrplan/INHALTSLEITFADEN.md` (Tabu-Lexikon, Namen, Formel-Kandidaten §4.2, weltliche Alternativen §4.3)
  - Beleg S7 (`_lernapp/belege/S7-sprachdaten.md`), ADR 0041, ADR 0045
- **Gegenstück:** `_lernapp/lehrplan/kontrast-de-aus-ar.md`
- **Umfang:** 123 Grammatik-IDs mit Kontrast (§2), 43 falsche Freunde (§3.1), 301 Tipp-Themen auf 73 Einheiten-Schlüssel (§6).

> **KI-Regel 2 (ADR 0040, KERN §2):** Keine Koranverse, Hadithe, Bittgebete oder anderen religiösen Texte (weder arabisch
> noch übersetzt), keine Koran-Wortbedeutungen, keine Fiqh-Aussagen. Der Sprachkurs ist ohne Religionsbezug. Religiöse Formeln
> gibt es nur aus einer später von zwei Gelehrten freigegebenen Liste; hier stehen sie nur als Verweis auf die gesperrten
> Kandidaten des Leitfadens (§4.7), nie als Lernziel. Arabische Wörter stehen nur in Umschrift.

**Lesart.**
- „Türkisch“ meint das Standardtürkische. Türkische Wörter stehen in türkischer Lateinschrift, deutsche Beispiele in normaler Schreibung.
- In der Spalte „typischer Fehler“ stehen fehlerhafte Formen in „…“. Sie sind Material für Ablenker und für den Abgleich (PLAN §4.1), nie Musterlösung.
- „Vertraut“ markiert eine Brücke: Das Türkische kennt die Sache schon. Tipps nennen die Brücke zuerst.
- Aufgenommen sind nur Kontraste, die sicher sind. Was die Stichprobe bestätigen soll, trägt „zu prüfen“ und steht zusätzlich in §8.

**Wer lernt.** Türkischsprachige jeden Alters, die in Deutschland leben: Kinder ab etwa zehn, die neu in die Schule kommen, Jugendliche, Eltern und Ältere. Dazu kommen Erwachsene, die Deutsch seit Jahren im Alltag sprechen, aber nie gezielt gelernt haben, sowie Herkunftssprachler (§5).

## 0 Kurzfassung

- **Schrift:** Die Lateinschrift ist bekannt, aber die Zuordnung von Buchstabe und Laut ist eine andere (z, s, v, j, c, ch, ei, ie). Neu sind ä, ß, die Großschreibung aller Nomen und stumme Buchstaben. Der Leitsatz für alle Lesetipps lautet: Türkisch schreibt fast lautgetreu, Deutsch nicht.
- **Größte Hürden:** Artikel und Genus (kein Gegenstück), Verb auf Platz 2 und Satzklammer, Präpositionen vor dem Nomen statt Endungen danach, der Kasus am Artikel statt am Nomen.
- **Starke Brücken:** Verb am Ende im Nebensatz, Partizipien vor dem Nomen (Partizipialattribute in B2), Komposita mit Kern hinten, Kausativ = „lassen“, -miş = „sollen“ und Konjunktiv I, nominale Schriftsprache, ö und ü.
- **Fallen:** Die Endung -e heißt in türkischen Grammatiken oft „Dativ“, entspricht nach Wechselpräpositionen aber dem deutschen Akkusativ. Der Ablativ verführt zu „schneller von“. Türkisch verneint doppelt („kimse … -me-“). Aus „o“ wird er, sie oder es.
- **Wortschatz:** Grob 15 % der häufigen deutschen Nomen haben eine ähnlich geschriebene türkische Übersetzung (Internationalismen, §3.3). Dazu kommen 43 falsche Freunde, etwa pasta (Torte) und Pasta (Nudeln) oder fiş (Kassenbon) und Fisch.
- **Pragmatik:** siz entspricht Sie, aber die Anrede lautet Herr oder Frau mit dem Familiennamen, nicht mit dem Vornamen (Murat Bey → Herr Yılmaz). Viele türkische Alltagsformeln haben keine deutsche Entsprechung (Kolay gelsin, Eline sağlık). Religiöse Formeln bleiben gesperrt.
- **Tipps:** 301 Tipp-Themen, verteilt auf den Vorkurs-Hinweis `de.v.l07` und alle 72 Einheiten (§6).

## 1 Laut und Schrift

### 1.1 Schrift und Rechtschreibung

Im Türkischen gilt fast immer: ein Buchstabe, ein Laut. Im Deutschen stehen oft mehrere Buchstaben für einen Laut (sch, ie), und manche Buchstaben klingen gar nicht (das h in „gehen“). Diese Regel ist der Kern aller Lese- und Schreibtipps; der Vorkurs-Hinweis `de.v.l07` führt sie ein.

| Schreibung | Deutsch | Türkisch | typische Verwechslung | Beispiele |
|---|---|---|---|---|
| z | [ts] | [z] | „Zeit“ mit weichem z gelesen | Zeit, Zug, zehn, Zimmer |
| s vor Vokal | stimmhaft (im Süden oft stimmlos) | immer stimmlos | Hörunterschied geht verloren (reisen – reißen) | Sonne, Suppe, lesen |
| ß, ss | scharfes s; ß nach langem Vokal und Doppellaut | fehlt | ß fehlt auf der türkischen Tastatur; „ss“ als Ersatz nimmt der Abgleich mit Hinweis an (PLAN §4.1) | Straße, heißen, Wasser |
| sch, tsch | wie ş und ç | ş, ç | türkische Schreibung im deutschen Wort („Şule“) | Schule, Deutsch, tschüss |
| ch | nach e, i, ä, ö, ü und Konsonanten weich (ich-Laut), nach a, o, u rau (ach-Laut) | fehlt | „ich“ wie „iş“ oder „ik“ | ich, Milch, Buch, acht |
| c | in Fremdwörtern wie k oder ts | wie dsch | „Computer“ mit tr c gelesen | Computer, Café, Celsius |
| j | wie tr y | wie stimmhaftes sch | „ja“ mit tr j gelesen | ja, Jacke, Juli |
| y | in Fremdwörtern ü, i oder j | wie j | „Handy“ mit tr y gelesen | Typ, Handy, Yoga |
| v | meist wie f; in Fremdwörtern wie w | wie w | „Vater“ mit tr v | Vater, vier, viel; Vase, Video |
| w | wie tr v | fehlt | englisches w | Wasser, Wetter, warm |
| qu, x | kw, ks | fehlen | „Qualität“ nach tr kalite geschrieben | Qualität, Text, Taxi |
| ä | offenes e | fehlt | „e“ in der Schrift („Hende“) | Hände (von Hand), älter (von alt) |
| ö, ü | wie im Türkischen | ö, ü | Vertraut | schön, Tür, Bücher |
| ei, ie, eu/äu | ai, langes i, oi | (ay, i, oy) | ei als e-i, ie als i-e gelesen | ein, vier, heute, Häuser |
| h nach Vokal | stumm, zeigt Länge | immer gesprochen | „geh-en“ | gehen, Uhr, Bahn, Fahrrad |
| Doppelkonsonant | zeigt nur einen kurzen Vokal davor | wird lang gesprochen (anne, elli) | „Bett“ mit langem t | Bett, kommen, Mutter |
| b, d, g am Wortende | klingen wie p, t, k, werden aber b, d, g geschrieben | der stimmlose Laut wird geschrieben (kitap – kitabı) | „Tak“, „Kint“, „Hant“ | Tag (Tage), Kind (Kinder), Hand (Hände) |
| Großschreibung | alle Nomen, Satzanfang, Namen, Anrede „Sie“ | Satzanfang, Namen; auch Sprachen und Völker (Türkçe, Türk) | Nomen klein | Das Kind isst einen Apfel. |
| Sprache und Herkunft | Sprache als Nomen groß (Türkisch), Adjektiv klein (türkisch) | Türkçe, Türk yemeği groß | „das Türkische Essen“ | Ich spreche Türkisch. Das türkische Essen. |
| Monate und Tage | immer groß | klein, außer im genauen Datum | „im mai“ | im Mai, am Montag |
| Apostroph | keiner vor Endungen von Namen | Ankara'da, Elif'in | „Elif's Fahrrad“, „Wetzlar'da“ | Elifs Fahrrad, in Wetzlar |
| İ, I, ı | großes I ohne Punkt = tr İ; kein ı | İ/i und I/ı | ı aus der türkischen Tastatur im deutschen Wort („Bıld“); I als ı gelesen | Bild, Ich, Information |
| Tastatur | QWERTZ: z und y getauscht, eigene Tasten für ä, ö, ü, ß | Q-Tastatur ohne ä und ß | y statt z beim Tippen | – |

**Buchstabieren.** Die deutschen Buchstabennamen weichen bei vielen Buchstaben von den türkischen ab. Wichtig für Namen am Telefon und im Amt (A1-e01, A2-e09):

| Buchstabe | Deutsch | Türkisch |
|---|---|---|
| c | ze | ce |
| h | ha | he |
| j | jott | je |
| k | ka | ke |
| q | ku | (fehlt) |
| v | fau | ve |
| w | we | (fehlt) |
| x | iks | (fehlt) |
| y | ypsilon | ye |
| z | zett | ze |

Türkische Sonderbuchstaben buchstabiert man im Deutschen beschreibend: „s mit Häkchen“ (ş), „c mit Häkchen“ (ç), „g mit Bogen“ (ğ), „i ohne Punkt“ (ı).

### 1.2 Laute

| Bereich | Deutsch | Türkisch | Folge beim Hören und Sprechen | Übung |
|---|---|---|---|---|
| Vokallänge | Länge unterscheidet Wörter (Miete – Mitte) | Länge nur in Lehnwörtern | Paare werden überhört | §1.3 |
| Unbetonte Endungen | -e als Murmellaut, -er fast wie a | volle Vokale | „Lehrer“ mit vollem e und r | bitte – bitten – bitter |
| ä | offenes e | e (offen nur als Aussprachevariante) | eher ein Schreib- als ein Hörproblem (§1.1) | Hände, Äpfel |
| ö, ü | wie im Türkischen | ö, ü | Vertraut | schön, Tür |
| Konsonantenhäufungen | Str-, Spr-, Schl-, Pfl-, -rbst | in Erbwörtern selten; ältere Lehnwörter bekamen einen Hilfsvokal (istasyon, kulüp, ıspanak) | Hilfsvokal („Şitraße“), vor allem bei spät erworbenem Deutsch | Straße, Spiel, Pflanze, Herbst |
| st, sp am Wortanfang | wie scht, schp | wie geschrieben | „S-traße“ | Straße, Stuhl, Spiel, sprechen |
| ch | ich-Laut und ach-Laut | fehlen als eigene Laute | „ich“ → „iş“; „acht“ → „akt“ | mich – misch, lachen – Laken |
| r | meist hinten gesprochen; nach Vokal oft fast ein a (der, Uhr) | Zungen-r, deutlich | verständlich, aber auffällig; vor allem Hören üben | der, Lehrer, vier |
| z, pf | ts, pf | fehlen als Verbindung | z als weiches s; Pf als f | Zeit, Pferd, Apfel |
| w und v | w = tr v; v meist = f | v | „vier“ und „wir“ vertauscht | vier – wir, fahren – waren |
| Knacklaut | vor Vokal am Wort- und Silbenanfang (be-arbeiten) | Wörter werden gebunden | „ein Ei“ verschliffen | ein Ei, beachten |
| b, d, g am Ende | stimmlos | ebenfalls stimmlos (kitap) | Vertraut beim Sprechen, Falle beim Schreiben (§1.1) | Rad – Rat |

### 1.3 Hörtraining-Paare

Paare nur aus dem Alltagswortschatz und ohne Wörter des Tabu-Lexikons (Leitfaden §2). Übungstyp `minimalpaare` (PLAN §4).

| Kontrast | Paare | Einheit |
|---|---|---|
| langer und kurzer Vokal | Miete – Mitte, Staat – Stadt, Ofen – offen, bieten – bitten, Beet – Bett, ihn – in, den – denn, wen – wenn, Hüte – Hütte, fühlen – füllen, Kahn – kann, Stiel – still | de.v.l07, A1-e03, A1-e04 |
| z und s | Zeit – seit, Zoll – soll, zehn – sehn, zieh – sie | de.v.l07, A1-e04 |
| s stimmhaft und stimmlos | reisen – reißen, heiser – heißer, weise – weiße | A1-e01, A2-e11 |
| w und f/v | fahren – waren, Feld – Welt, vier – wir, Vetter – Wetter | A1-e02, A1-e10 |
| ch und sch | mich – misch, Fichte – fischte, Löcher – Löscher | A1-e01, A1-e09 |
| ach-Laut und k | lachen – Laken, Bach – back | A1-e05 |
| ei und ie | Riese – Reise, Wiese – Weise, Biene – Beine, Miene – meine | de.v.l07, A1-e02 |
| eu und au | Leute – Laute | A2-e14 |
| unbetonte Endungen | bitte – bitten – bitter, Lehre – Lehrer, Lampe – Lampen | A1-e03 |
| Auslaut (Schreibung) | Rad – Rat, seid – seit, Bund – bunt | A1-e02, A1-e09 |
| e und ä in der Schrift | Feld – fällt, Held – hält, Beeren – Bären | A1-e03, A2-e04 |
| Betonung | AUgust (Name) – auGUST (Monat), UMfahren – umFAHren, ÜBERsetzen – überSETZen | A1-e04, B2-e09 |

### 1.4 Betonung, Zahlen und Rhythmus

- **Wortbetonung:** Deutsche Erbwörter betonen meist die Stammsilbe, oft die erste (ARbeit, LEHrer, MONtag). Trennbare Präfixe sind betont (ANrufen), untrennbare nicht (beSUchen). Das Türkische betont meist die letzte Silbe. Folge: „LehRER“, „MonTAG“. Tipp: Wörter klatschen, die betonte Silbe groß schreiben.
- **Fremdwörter:** Sie sind im Deutschen oft hinten betont (UniversiTÄT, InformaTION, BüRO). Hier hilft die türkische Gewohnheit.
- **Zahlen von 21 bis 99:** Deutsch nennt den Einer vor dem Zehner (einundzwanzig), Türkisch den Zehner zuerst (yirmi bir). Beim Hören entstehen Zahlendreher (12 statt 21). Tipp: Beim Diktat zuerst den Einer hören und rechts notieren.
- **Uhrzeit:** „halb acht“ ist 7:30 (§2, `de.g.zeitangaben`).

## 2 Grammatik-Kontraste je Grammatik-ID

Die Tabellen folgen der Grammatikfolge des Rahmenplans (`de.rahmen.json`, 123 IDs). In Klammern steht die Einheit, die die ID einführt. „Vertraut“ markiert eine Brücke, die der Tipp zuerst nennt. Die typischen Fehler sind Erfahrungswerte aus dem Unterricht des Deutschen als Fremd- und Zweitsprache und noch nicht gemessen (§8).

### 2.1 Überblick

| Kontrast | Türkisch | Deutsch | Folge für die Tipps |
|---|---|---|---|
| Wortstellung | Subjekt – Objekt – Verb; Verb am Ende | Verb auf Platz 2 im Hauptsatz, am Ende im Nebensatz; Satzklammer | Nebensätze fallen leicht, Hauptsätze schwer. |
| Artikel und Genus | keine | drei Genera; der Artikel zeigt Genus, Zahl und Fall | Hauptquelle von Fehlern von A1 bis C1. |
| Fälle | Endungen am Nomen, sechs Fälle (dazu Orts- und Herkunftsfall) | vier Fälle, sichtbar am Artikel; Ort und Herkunft mit Präpositionen | Die türkischen Namen der Fälle führen in die Irre (-e, §5.2). |
| Endung oder Wort | Besitz, Kopula, Können, Müssen, Passiv, Kausativ als Endung | eigene Wörter (mein, ist, kann, muss, wird, lässt) | Grundmuster der Tipps: „Endung → Wort“. |
| Attribut | Partizip vor dem Nomen | Relativsatz nach dem Nomen; Partizipialattribut davor | Relativsatz schwer (B1), Partizipialattribut leicht (B2). |
| Pronomen | kann fehlen; „o“ ohne Genus | Pflicht; er, sie, es | früh üben (A1-e01) |

### 2.2 A1 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `de.g.sein-pronomen` (A1-e01) | „sein“ ist im Türkischen eine Endung (öğrenciyim) oder fehlt; „o“ steht für er, sie und es. | „Das Zimmer hell.“ · „Elif ist neu. Er ist nett.“ | bin, bist, ist sind eigene Wörter, wie die Endungen -im, -sin, -dir. Aus „o“ wird er (Mann), sie (Frau) oder das Pronomen nach dem Artikel. |
| `de.g.praesens-regel` (A1-e01) | Die Endung zeigt im Türkischen die Person, das Pronomen kann fehlen; im Deutschen steht es immer. | „Wohne in Wetzlar.“ · „Komme aus der Türkei.“ | Im Deutschen braucht der Satz das Pronomen, auch wenn die Endung die Person schon zeigt: Ich wohne in Wetzlar. |
| `de.g.fragen` (A1-e01) | Ja/Nein-Fragen bildet das Türkische mit „mi“ ohne Umstellung; das Fragewort steht meist vor dem Verb in der Satzmitte. | „Du kommst aus der Türkei?“ (nur mit Stimme) · „Du wohnst wo?“ | Wo im Türkischen „mi“ steht, wandert im Deutschen das Verb an den Anfang: Kommst du …? Das Fragewort steht vorn, das Verb direkt danach. |
| `de.g.artikel-genus` (A1-e02) | Das Türkische hat weder Artikel noch Genus. der, die, das ist ganz neu und lässt sich nur teilweise vorhersagen (Verteilung der häufigsten Nomen: ≈ 42 % die, ≈ 39 % der, ≈ 19 % das). | Artikel fehlt („Das ist Mutter von Jan“) · „die“ für alles · falsches Genus | Nomen immer mit Artikel lernen (Farbe oder Symbol je Genus). Sichere Endungen: -ung, -heit, -keit, -schaft fast immer „die“. |
| `de.g.possessiv-nom` (A1-e02) | Besitz steht im Türkischen als Endung am Nomen (annem, evimiz); „onun“ gilt für er und sie. | „mein Mutter“ · „Elif und sein Bruder“ | annem = meine Mutter: Aus der Endung wird ein Wort vor dem Nomen. Ob sein oder ihr, entscheidet die Person, der etwas gehört; die Endung richtet sich nach dem Ding. |
| `de.g.haben` (A1-e02) | Das Türkische hat kein Verb „haben“; Besitz heißt „… var/yok“. In Tatoeba-Paaren mit var/yok steht im Deutschen 782-mal „haben“, 163-mal „es gibt“. | „Es gibt zwei Schwestern.“ (gemeint: Ich habe …) · „Ich habe nicht Zeit.“ | „Benim … var“ heißt fast immer „Ich habe …“; „es gibt“ nur, wenn etwas irgendwo vorhanden ist. „… yok“ wird oft zu „keine/keinen“. |
| `de.g.unbest-artikel-negation` (A1-e03) | „bir“ ist ein Zahlwort ohne Genus; Nomen verneint das Türkische mit „değil“ oder „yok“. | „ein Lampe“ · „Hier ist nicht Lampe.“ | bir wird zu ein oder eine, je nach Artikel. Fehlt etwas („yok“), sagt man im Deutschen meist „kein“: Hier ist keine Lampe. |
| `de.g.plural` (A1-e03) | Der türkische Plural ist immer -ler/-lar; nach Zahlwörtern steht der Singular (iki sandalye). | „zwei Stuhl“ · „drei Kind“ · „die Stuhls“ | Nach jeder Zahl ab zwei steht im Deutschen der Plural: zwei Stühle. Plural mit dem Nomen lernen; im Plural heißt der Artikel immer „die“. |
| `de.g.adjektiv-praedikativ` (A1-e03) | Das Türkische braucht kein eigenes Verb (Oda aydınlık); „çok“ deckt sehr und zu viel ab. | „Das Zimmer hell.“ · „Der Schrank ist sehr groß.“ (gemeint: zu groß) | Nach „ist“ bleibt das Adjektiv ohne Endung. sehr = çok, zu = fazla (mehr als gut ist). |
| `de.g.zeitangaben` (A1-e04) | Türkisch zählt die halbe Stunde dazu (yedi buçuk), Deutsch zur nächsten Stunde (halb acht = 7:30). um, am, im entsprechen alle der Endung -de/-da. | „halb sieben“ für 7:30 · „in Montag“ · „um Juli“ | halb acht = yedi buçuk: Im Deutschen nennt man die Stunde, die kommt. um + Uhrzeit, am + Tag, im + Monat. |
| `de.g.v2-inversion` (A1-e04) | Im Türkischen steht das Verb am Ende, die Satzglieder davor sind frei; im Deutschen steht das konjugierte Verb immer auf Platz 2. | „Am Montag ich gehe in die Schule.“ · „Ich jeden Tag Brot kaufe.“ | Platz 1 ist frei (Zeit, Ort, Subjekt), Platz 2 gehört immer dem Verb. Steht vorn eine Zeitangabe, rückt das Subjekt hinter das Verb. |
| `de.g.akkusativ` (A1-e05) | Türkisch markiert nur das bestimmte Objekt (çayı alıyorum); das unbestimmte bleibt ohne Endung (bir çay alıyorum). Deutsch markiert beide, sichtbar beim Maskulinum. | „Ich nehme ein Tee.“ · „Jan isst der Apfel.“ | Im Deutschen bekommt auch das unbestimmte Objekt den Akkusativ: einen Tee. Nur bei der/ein ändert sich etwas: den, einen, keinen. |
| `de.g.vorlieben` (A1-e05) | „sevmek“ heißt mögen und lieben, „istemek“ wollen und möchten; „gern“ hat kein eigenes Wort. | „Ich liebe Linsen.“ (für mag) · „Ich will eine Suppe.“ (am Tisch zu direkt) | „okumayı severim“ → Ich lese gern. Am Tisch und im Laden klingt „Ich möchte …“ freundlicher als „Ich will …“. |
| `de.g.praesens-vokalwechsel` (A1-e05) | Türkische Verbstämme ändern sich nie; einige deutsche Verben ändern den Vokal bei du und er/sie/es. | „du esst“ · „er nehmt“ · „er fahrt“ | Wie bei einer Ausnahme-Liste: essen – du isst, nehmen – er nimmt, fahren – er fährt. Nur du und er/sie/es sind betroffen. |
| `de.g.negation-nicht` (A1-e06) | Türkisch verneint Verben mit -me/-ma, Nomen und Adjektive mit „değil“, Vorhandensein mit „yok“; Deutsch hat nicht und kein, dazu Regeln für die Stellung. | „Ich nicht komme.“ · „Das ist nicht Apfel.“ | değil → nicht (Das ist nicht teuer), yok → kein (Es gibt keinen Zucker), -me- → nicht nach dem Verb (Ich komme nicht). |
| `de.g.mengen` (A1-e06) | Mengenangaben sind gleich gebaut (bir kilo elma), aber das Türkische lässt den Singular; „kaç“ fragt nach Zählbarem mit Singular. | „ein Kilo Apfel“ · „Wie viel Eier?“ | kaç → wie viele + Plural (Wie viele Eier?), ne kadar → wie viel (Wie viel kostet das?). Nach der Menge folgt der Plural: ein Kilo Äpfel. |
| `de.g.modalverben-1` (A1-e07) | Türkisch drückt Können und Müssen mit Endungen aus (-ebil, -meli, -mek zorunda); im Deutschen steht ein Modalverb auf Platz 2 und der Infinitiv am Ende. | „Wir müssen machen die Hausaufgaben.“ · „Elif kann rechnen gut.“ | Das zweite Verb wandert ans Ende, genau dorthin, wo im Türkischen das Verb steht: Wir müssen die Hausaufgaben machen. |
| `de.g.imperativ` (A1-e07) | Der türkische Imperativ hat eine vertraute und eine höfliche Form (Aç! – Açın/Açınız); Deutsch hat du-, ihr- und Sie-Formen. | „Öffnen bitte das Fenster!“ (ohne Sie) · „Du öffne!“ | Açınız → Öffnen Sie bitte …: In der höflichen Form steht „Sie“ direkt nach dem Verb. |
| `de.g.konnektoren-hauptsatz` (A1-e08) | „ve, ama, veya, çünkü“ verbinden ähnlich; vieles verbindet das Türkische aber mit Verbformen (-ip, -ince). | „Ich komme gern, aber habe ich wenig Zeit.“ | und, aber, oder, denn stehen auf „Platz 0“: Danach bleibt der Satz unverändert. çünkü → denn. |
| `de.g.ort-richtung` (A1-e09) | Ort, Ziel und Herkunft zeigt das Türkische mit Endungen (-de, -e, -den); Deutsch mit Fragewort und Präposition, dazu feste Wendungen. | „Ich gehe zu Hause.“ · „Ich gehe in Bahnhof.“ | -de = wo?, -e = wohin?, -den = woher? evde → zu Hause, eve → nach Hause. Länder mit Artikel: in die Türkei, aus der Türkei. |
| `de.g.man` (A1-e09) | Allgemeine Aussagen bildet das Türkische oft mit dem unpersönlichen Passiv (Buradan gidilir) oder der 2. Person. | „Hier kann spielen.“ · „Man können hier parken.“ | Für die unpersönliche Form (-ilir) sagt das Deutsche oft „man“, mit dem Verb wie bei er: Man geht hier geradeaus. |
| `de.g.es-unpersoenlich` (A1-e10) | Das Türkische braucht kein Scheinsubjekt (Yağmur yağıyor; Hava soğuk); „var mı?“ fragt nach Vorhandenem. | „Regnet.“ · „Ist kalt.“ · „Gibt einen Park?“ | Im Deutschen braucht jeder Satz ein Subjekt, auch ein leeres: Es regnet. Es ist kalt. „… var mı?“ → Gibt es …? |
| `de.g.akk-pronomen` (A1-e10) | „onu“ steht im Türkischen für jedes Objekt ohne Genus; im Deutschen richtet sich das Pronomen nach dem Artikel. | „Die Jacke? Ich nehme ihn.“ | Pronomen folgt dem Artikel: der → ihn, die → sie, das → es. Tipp: Artikel des Nomens kurz mitdenken. |
| `de.g.modalverben-2` (A1-e11) | Verbot und fehlende Pflicht trennt das Türkische klar (yasak/-memelisin gegenüber gerek yok); im Deutschen sehen „nicht müssen“ und „nicht dürfen“ ähnlich aus. | „Hier musst du nicht parken.“ (gemeint: darfst nicht) | nicht dürfen = yasak, -memelisin; nicht müssen = gerek yok. Für Rat und Auftrag: sollen. |
| `de.g.dativ-wendungen` (A1-e11) | Das Türkische nennt die Person als Subjekt (Üşüyorum; Nasılsın?), das Deutsche in festen Wendungen im Dativ. | „Ich bin kalt.“ · „Wie geht du?“ | Feste Wendungen ganz lernen: Mir ist kalt (= üşüyorum), Wie geht es dir?, Mir tut der Kopf weh (Başım ağrıyor). |
| `de.g.trennbare-verben` (A1-e12) | Trennbare Verben gibt es im Türkischen nicht; das Verb bleibt ein Wort am Satzende. | „Ich aufstehe um sechs.“ · „Wann anfängt die Schule?“ | Das kleine Wort (auf, an, ein, ab) springt ans Satzende, dorthin, wo im Türkischen das Verb steht: Ich stehe um sechs Uhr auf. |
| `de.g.wortbildung-in` (A1-e12) | Berufsbezeichnungen haben im Türkischen kein Genus (öğretmen); Deutsch bildet weibliche Formen mit -in. | „Sie ist Lehrer.“ · „die Arztin“ · „Lehrerinen“ | Für Frauen hängt das Deutsche -in an, oft mit Umlaut: Ärztin, Köchin; Plural -innen. |

### 2.3 A2 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `de.g.perfekt-haben` (A2-e01) | Die türkische Vergangenheit ist eine Endung (-di); das deutsche Perfekt hat zwei Teile mit dem Partizip am Ende. | „Ich habe gebackt einen Kuchen.“ · „Ich gebackt.“ | -di → habe … ge-…-t/-en: Das Partizip steht am Satzende, wo im Türkischen das Verb steht. |
| `de.g.praeteritum-sein-haben` (A2-e01) | Türkisch hängt die Vergangenheit auch an Nomen und an var (hastaydım, vardı); Deutsch nutzt war und hatte. | „Ich habe krank gewesen.“ · „Gestern ich war krank.“ | hastaydım → Ich war krank; … vardı → ich hatte … Bei sein und haben erzählt man meist mit war und hatte. |
| `de.g.perfekt-sein` (A2-e02) | Die Wahl zwischen haben und sein hat kein türkisches Gegenstück; dazu besondere Partizipien. | „Ich habe nach Gießen gefahren.“ · „geaufsteht“ · „getrainiert“ | Bewegung von A nach B und Veränderung → sein. Trennbar: auf-ge-standen; -ieren ohne ge-: trainiert. |
| `de.g.dativ-praep` (A2-e02) | Türkisch nutzt Endungen und Postpositionen nach dem Nomen (otobüsle, okuldan sonra); Deutsch Präpositionen davor, hier mit Dativ. | „mit der Bus“ · „nach die Schule“ · „seit ein Jahr“ | -(y)le → mit, -den → aus/von, -den sonra → nach: alle mit dem/der/den. Die Präposition steht vorn. |
| `de.g.dativ-objekt` (A2-e03) | Der Empfänger steht im Türkischen mit -(y)e (anneme veriyorum) – das passt zum deutschen Dativobjekt. | „Elif schenkt ihre Oma Blumen.“ | Wem? = tr -e: anneannesine → ihrer Oma. Person im Dativ, Sache im Akkusativ. |
| `de.g.dativ-pronomen` (A2-e03) | Einige Verben verlangen im Deutschen den Dativ; „yardım etmek“ verlangt -e wie helfen den Dativ. | „Kannst du mich helfen?“ · „Die Tasse gefällt mich.“ | bana yardım et → Hilf mir. hoşuma gidiyor → gefällt mir. Merkhilfe: tr -e → Dativ. |
| `de.g.wechselpraep` (A2-e04) | Die Unterscheidung Lage/Richtung kennt das Türkische (-de/-e). Falle: Die Endung -e heißt in Grammatiken oft „Dativ“, entspricht hier aber dem deutschen Akkusativ. | „Wir stellen den Schrank an der Wand.“ · „Das Buch liegt auf den Tisch.“ | duvarda (wo?) → an der Wand (Dativ); duvara (wohin?) → an die Wand (Akkusativ). Merksatz: -de → Dativ, -e → Akkusativ. |
| `de.g.positionsverben` (A2-e04) | „koymak“ deckt stellen, legen und setzen ab; die Lage (stehen, liegen) unterscheidet das Türkische kaum. | „Ich stelle das Handy auf den Tisch.“ (flach: legen) · „Das Buch steht auf dem Tisch.“ (liegt) | koymak hat im Deutschen vier Wörter: stellen (aufrecht), legen (flach), hängen, setzen. Dazu die Lagen stehen, liegen, hängen, sitzen. |
| `de.g.nebensatz-weil` (A2-e05) | Verb am Ende ist vertraut; begründet wird im Türkischen aber oft mit „çünkü“ und normaler Wortstellung oder mit „-diği için“. | „…, weil ich habe Fieber.“ | çünkü → denn (Verb auf Platz 2); -diği için → weil (Verb ans Ende, wie im Türkischen). |
| `de.g.reflexive-verben` (A2-e05) | Türkisch zeigt den Rückbezug mit -(i)n- oder „kendini“; viele deutsche reflexive Verben sind im Türkischen nicht reflexiv (sevinmek, üşütmek). | „Ich freue auf die Ferien.“ · „Ich habe erkältet.“ | „sich“ als festen Teil des Verbs lernen: sich freuen, sich erkälten, sich ausruhen. |
| `de.g.adj-dekl-best` (A2-e06) | Das Adjektiv steht wie im Türkischen vor dem Nomen (mavi ceket), bleibt dort aber unverändert; Deutsch hängt Endungen an. | „die blau Jacke“ · „den grau Pullover“ | Reihenfolge wie im Türkischen; neu ist nur die Endung: nach der/die/das meist -e, sonst -en. |
| `de.g.welch-dies` (A2-e06) | „hangi“ und „bu/şu“ bleiben im Türkischen unverändert. | „Welche Bus nehmen wir?“ · „Diese Kleid ist zu lang.“ | welch- und dies- haben die Endungen von der/die/das: den Bus → welchen Bus, das Kleid → dieses Kleid. |
| `de.g.nebensatz-dass` (A2-e07) | Inhaltssätze sind im Türkischen meist Nominalformen (geleceğini biliyorum) oder „ki“ mit Hauptsatz-Stellung. | „Ich finde, dass die Hausordnung ist wichtig.“ | Nach „dass“ geht das Verb ans Ende – wie in der türkischen -diği-Form, nicht wie nach „ki“. |
| `de.g.indefinitpronomen` (A2-e07) | Türkisch verneint doppelt (Kimse gelmedi; Hiçbir şey duymadım), Deutsch nur einmal. | „Niemand ist nicht gekommen.“ · „Ich habe nichts nicht gehört.“ | kimse … -me- → niemand (ohne nicht); hiçbir şey … -me- → nichts. |
| `de.g.komparation` (A2-e08) | Der Vergleich steht im Türkischen mit dem Ablativ (Jan'dan daha hızlı) – -den wird leicht zu „von“. | „schneller von Jan“ · „mehr schnell“ | -den daha … → …-er als: schneller als Jan. „en“ → am …-sten oder der/die/das …-ste. |
| `de.g.praep-akk` (A2-e08) | für, ohne, gegen sind im Türkischen Postpositionen oder Endungen (için, -siz, -e karşı). | „für der Bruder“ · „ohne einem Ball“ | için → für, -siz/olmadan → ohne, -e karşı → gegen: immer mit Akkusativ (den, einen). |
| `de.g.nebensatz-wenn` (A2-e09) | Bedingung (-se) und Zeitpunkt (-ince) sind im Türkischen Endungen; Deutsch hat für beides „wenn“ mit Verb am Ende. | „Wenn es regnet, wir bleiben drinnen.“ · „Wenn regnet es, …“ | -se und -ince → wenn. Steht der wenn-Satz vorn, folgt sofort das Verb des Hauptsatzes: …, bleiben wir drinnen. |
| `de.g.datum-ordinal` (A2-e09) | Vertraut: Türkisch schreibt Ordinalzahlen ebenfalls mit Punkt (3. sınıf) und das Datum als Tag.Monat.Jahr. Neu sind die Endungen und „am“. | „am drei Mai“ · „der 3 Mai“ | Der Punkt nach der Zahl ist wie „-üncü“: am 3. Mai = am dritten Mai. |
| `de.g.hoeflich-konj` (A2-e10) | Höflichkeit läuft im Türkischen über „-ebilir misiniz?“ oder „rica etsem“; „istiyorum“ ist neutral, „Ich will“ klingt dagegen fordernd. | „Ich will einen Termin.“ · „Können Sie wiederholen?“ (ohne bitte) | „… alabilir miyim?“ → Könnte ich … bekommen? Am Schalter: Ich hätte gern einen Termin. |
| `de.g.textfolge` (A2-e10) | „önce, sonra, en son“ ändern im Türkischen die Wortstellung nicht. | „Zuerst du öffnest die Kamera.“ | zuerst, dann, danach besetzen Platz 1 – das Verb folgt sofort, dann das Subjekt. |
| `de.g.temporale-praep` (A2-e11) | Zeitangaben bildet das Türkische nach dem Nomen (bir hafta önce, üç gün sonra). | „eine Woche vor“ · „nach drei Tagen fliegen wir“ (von heute aus) | üç gün sonra (ab heute) → in drei Tagen; bir hafta önce → vor einer Woche. Die Präposition steht vorn. |
| `de.g.praeteritum-modal` (A2-e11) | Türkisch bildet „wollte, konnte, musste“ mit Endungen (-mek istedim, -ebildim, -mek zorunda kaldım). | „Ich habe gemusst früher fahren.“ | Mit Modalverb erzählt man im Präteritum: Ich wollte …, ich musste …, ich konnte … – einfacher als das Perfekt. |
| `de.g.wortbildung-komposita` (A2-e12) | Vertraut: Türkische Nominalkomposita haben den Kern hinten wie das Deutsche (okul çantası = Schultasche). Neu: Artikel und Fugenlaute. | „das Mülltonne“ (Artikel vom ersten Wort) · „Bananeschale“ | Wie bei okul çantası bestimmt das letzte Wort Bedeutung und Artikel: die Tonne → die Mülltonne. |
| `de.g.genitiv-s` (A2-e12) | „Elif'in bisikleti“ stellt den Besitzer vorn und nutzt einen Apostroph. | „Elif's Fahrrad“ · „von Elif Fahrrad“ | Elif'in → Elifs (ohne Apostroph, gleiche Reihenfolge). Mit „von“ dreht sich die Reihenfolge: das Fahrrad von Elif. |
| `de.g.werden-vollverb` (A2-e13) | „olmak“ heißt sein und werden; Deutsch trennt beides. | „Elif will Tierärztin sein.“ (gemeint: werden) · „Es ist dunkel.“ (gemeint: wird) | olmak im Sinn von Veränderung → werden: Ich will Ärztin werden. Hava kararıyor → Es wird dunkel. |
| `de.g.adj-dekl-unbest` (A2-e13) | Nach ein, kein und mein muss das Adjektiv das Genus zeigen; das Türkische kennt keine Adjektivendungen. | „eine interessant Arbeit“ · „einen nett Chef“ | Nach ein/mein zeigt das Adjektiv, was der Artikel nicht zeigt: ein netter Chef, ein neues Rad. |
| `de.g.konnektoren-adverb` (A2-e14) | „bu yüzden, yine de, yoksa“ verändern im Türkischen die Wortstellung nicht. | „…, deshalb ich habe Oma angerufen.“ | deshalb, trotzdem, sonst zählen als Platz 1 – danach kommt sofort das Verb (anders als bei und, aber, denn). |

### 2.4 B1 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `de.g.praeteritum` (B1-e01) | Türkisch unterscheidet erlebte (-di) und berichtete Vergangenheit (-miş); Deutsch unterscheidet Gespräch (Perfekt) und Erzählung (Präteritum). | „Oma kommte 1975.“ · Perfekt und Präteritum nach -di/-miş verteilt | Im Deutschen entscheidet nicht „selbst erlebt oder gehört“, sondern „gesprochen oder geschrieben“. Unregelmäßige Formen als Reihe lernen: kommen – kam – gekommen. |
| `de.g.nebensatz-temporal` (B1-e01) | Die türkischen Zeitformen (-ince, -diğinde, -ken) trennen nicht zwischen einmalig und wiederholt; Deutsch trennt als und wenn. | „Wenn ich klein war, …“ | Einmal in der Vergangenheit (çocukken, o gün) → als; immer wieder oder in der Zukunft → wenn. |
| `de.g.infinitiv-zu` (B1-e02) | Türkisch nutzt das Verbalnomen (-meyi/-meye) vor dem Verb; Deutsch zu + Infinitiv am Ende des Satzteils. Das Ende ist vertraut. | „Ich habe vor, zu machen eine Ausbildung.“ · „zu anrufen“ | zu steht direkt vor dem Infinitiv am Ende; bei trennbaren Verben in der Mitte: anzurufen. |
| `de.g.verben-praep` (B1-e02) | Die Rektion zeigt das Türkische mit Endungen; die deutschen Präpositionen passen selten wörtlich (ilgilenmek mit -le). | „Ich interessiere mich mit Technik.“ · „Ich warte den Bus.“ | Präposition mit dem Verb lernen: sich interessieren für (nicht mit), warten auf (otobüsü beklemek). |
| `de.g.konjunktiv-2` (B1-e03) | Rat gibt das Türkische mit „-meli“, Wünsche mit „keşke“; im Deutschen klingt „müssen“ als Rat zu stark. | „Du musst früher schlafen.“ (gemeint als Rat) | -melisin als Rat → Du solltest …; keşke → Ich wünschte … / Ich hätte gern … |
| `de.g.reflexiv-dativ` (B1-e03) | Bei Körperteilen nutzt das Türkische das Possessiv (ellerimi yıkıyorum). | „Ich wasche mich die Hände.“ | Bei Körperteilen sagt man meist „mir die …“: Ich wasche mir die Hände, ich putze mir die Zähne. |
| `de.g.passiv-praesens` (B1-e04) | Das Passiv ist im Türkischen eine Endung (tamir ediliyor) – das Konzept ist vertraut; Deutsch braucht werden + Partizip am Ende. | „Die Heizung repariert.“ · „wird repariert von Hausmeister“ | tamir ediliyor → wird repariert; „tarafından“ → von + Dativ: vom Hausmeister. |
| `de.g.lassen` (B1-e04) | Vertraut: Die türkische Endung -dir/-t (yaptırmak) entspricht „lassen“. | „Wir lassen reparieren die Heizung.“ | tamir ettirmek → reparieren lassen; der Infinitiv steht vor „lassen“ am Ende. |
| `de.g.relativsatz-nom-akk` (B1-e05) | Türkische Relativsätze sind Partizipien vor dem Nomen ohne Relativpronomen (bildiğim mesaj); deutsche stehen dahinter, mit der/die/das. | „Das ist eine Nachricht, ich nicht kenne.“ · „Der Link, der du bekommen hast“ | Aus dem Partizip wird ein Satz hinter dem Nomen: gelen mesaj → die Nachricht, die kommt. Das Pronomen richtet sich nach Genus und Rolle. |
| `de.g.indirekte-frage` (B1-e05) | Indirekte Fragen sind im Türkischen nominal (gelip gelmeyeceğini) oder ein angehängter Fragesatz. | „Weißt du, ist die Nachricht echt?“ | Ja/Nein-Frage im Nebensatz → ob + Verb am Ende: Weißt du, ob die Nachricht echt ist? |
| `de.g.relativsatz-dat-praep` (B1-e06) | Im Partizip steckt die Präposition als Endung (yardım ettiğim dernek); im Deutschen steht sie vor dem Relativpronomen. | „der Verein, dem ich helfe in“ · „wo“ für alles | Präposition nach vorn: der Verein, in dem ich helfe. „wo“ nur für Orte. |
| `de.g.um-zu-damit` (B1-e06) | Vertraut: Türkisch trennt gleiches Subjekt (-mek için) und anderes Subjekt (-sın diye, -mesi için). | „Ich gehe zur Feuerwehr, für anderen helfen.“ | -mek için → um … zu; -sın diye → damit (Verb am Ende). |
| `de.g.futur-1` (B1-e07) | Die türkische Zukunft (-ecek) ist Pflicht; Deutsch nutzt meist Präsens mit Zeitangabe. | „Morgen werde ich zur Schule gehen.“ (für eine Routine) | -ecek wird im Deutschen oft Präsens: Morgen gehe ich … „werden“ für Pläne, Versprechen und Vermutungen. |
| `de.g.konzessiv` (B1-e07) | „-mesine rağmen“ ist eine Nominalform; Deutsch hat obwohl (Verb am Ende) und trotzdem (Verb auf Platz 2). | „Obwohl sie ist erst ein Jahr hier, …“ · „Trotz sie ist krank, …“ | -mesine rağmen → obwohl + Verb am Ende; trotz nur mit Nomen (trotz des Regens). |
| `de.g.plusquamperfekt` (B1-e08) | Vertraut: -mişti ist die türkische Vorvergangenheit (gitmişti = war gegangen). | „Nachdem wir gewartet haben, fiel der Flug aus.“ | -mişti → hatte/war + Partizip. Nach „nachdem“ eine Zeitstufe zurück. |
| `de.g.modalpartikeln` (B1-e08) | Türkische Partikeln (ya, da, hani) wirken ähnlich, aber nicht 1:1. Sehr nah: „bir“ macht Bitten weich (Bir bakar mısın?). | Partikeln fehlen, Bitten klingen hart · Partikel an falscher Stelle | Bir bak! → Schau mal! „doch“ lädt ein (Komm doch mit!), „ja“ zeigt Staunen (Das ist ja toll!). |
| `de.g.genitiv` (B1-e09) | Türkisch stellt den Besitzer vorn (arabanın rengi), Deutsch hinten (die Farbe des Autos); wegen, trotz entsprechen Postpositionen. | „des Autos Farbe“ · „die Farbe das Auto“ | arabanın rengi → die Farbe des Autos: Reihenfolge umdrehen. „wegen dem“ hört man oft; in Texten „wegen des“. |
| `de.g.konsekutiv` (B1-e09) | Vertraut: „o kadar … ki“ entspricht „so … dass“. | „Es regnete so stark, dass wir mussten anhalten.“ | o kadar … ki → so … dass; nach dass Verb ans Ende (anders als nach ki). |
| `de.g.n-deklination` (B1-e10) | Kein Gegenstück: einige maskuline Nomen bekommen -(e)n in allen Fällen außer dem Nominativ. | „Ich frage den Kollege.“ · „mit Herr Kaya“ | der Kollege, der Kunde, der Herr: den Kollegen, dem Kunden, mit Herrn Kaya – auch in der Briefadresse. |
| `de.g.adj-dekl-ohne` (B1-e10) | Ohne Artikel trägt das Adjektiv die Endung des Artikels; das Türkische hat nichts Vergleichbares. | „Mit freundliche Grüße“ · „bei schlecht Wetter“ | Ohne Artikel zeigt das Adjektiv die Endung: mit freundlichen Grüßen (wie mit den), bei schlechtem Wetter (wie bei dem). |
| `de.g.passiv-praet-modal` (B1-e11) | „-ilmeli“ ist im Türkischen ein Wort; im Deutschen stehen am Ende Partizip und werden. | „Die Zwiebeln müssen werden geschnitten.“ · „müssen geschnitten sein“ | -ilmeli → muss … werden: Die Zwiebeln müssen geschnitten werden. Präteritum: wurde + Partizip. |
| `de.g.partizip-adjektiv` (B1-e11) | Vertraut: Türkische Partizipien stehen vor dem Nomen (bekleyen misafirler, doğranmış sebze). | „das geschnitten Gemüse“ · „die wartende Gäste“ | bekleyen → wartend-, doğranmış → geschnitten-, dann die Adjektivendung. |
| `de.g.wortbildung-nomen` (B1-e12) | Türkisch bildet Verbalnomen mit -me/-iş (doldurma, ödeme); Deutsch mit -ung oder dem Infinitiv als Nomen. | „die Ausfüllen“ · „beim ausfüllen“ | Infinitiv als Nomen: das Ausfüllen (groß, immer das). -ung ist immer die: die Zahlung. |
| `de.g.zustandspassiv` (B1-e13) | Zustand (kapalı, imzalı) und Vorgang (kapatılıyor) unterscheidet auch das Türkische. | „Das Rathaus wird montags geschlossen.“ (gemeint: ist) | Zustand → ist geschlossen, ist unterschrieben; Vorgang → wird geschlossen. |
| `de.g.wortbildung-adjektiv` (B1-e14) | Vertraut: -siz/-sız und -li/-lı bilden Adjektive (kablosuz, tuzlu), „-ebilir“ drückt Möglichkeit aus. | Endungen vertauscht („salzlich“ statt salzig) · Umschreibung „ohne Kabel“ statt kabellos | kablosuz → kabellos, tuzlu → salzig, taşınabilir → tragbar (-bar). |
| `de.g.konj2-irreal` (B1-e15) | Türkisch bildet Unwirkliches mit -sa/-saydı und -irdi (Vaktim olsa gelirdim). | „Wenn ich Zeit habe, würde ich kommen.“ | Vaktim olsa gelirdim → Wenn ich Zeit hätte, würde ich kommen: beide Teile im Konjunktiv. |
| `de.g.zweiteilige-konnektoren` (B1-e16) | Vertraut: hem … hem de, ne … ne de, ya … ya da, sadece … değil … de. | „Er hat weder Zeit noch keine Lust.“ | hem … hem → sowohl … als auch; ne … ne → weder … noch (ohne nicht); ya … ya → entweder … oder. |

### 2.5 B2 (24 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `de.g.nominalstil` (B2-e01) | Vertraut: Türkische Schriftsprache ist stark nominal (eğitimin tamamlanmasından sonra). Neu sind deutsche Präpositionen und Kasus. | „Nach Abschluss von die Ausbildung“ · „wegen eine Krankheit“ | -den sonra → nach + Dativ, -den dolayı → wegen + Genitiv: Nominalgruppen bauen wie im Türkischen, Kasus prüfen. |
| `de.g.konditional-falls` (B2-e02) | Türkisch nutzt -se, eğer, şayet; den uneingeleiteten Bedingungssatz (Sollten Sie …) gibt es so nicht. | „Sollten Sie Fragen haben, Sie rufen uns an.“ | „Sollten Sie …“ ist ein höfliches „Falls Sie …“ (… olursa). Danach steht das Verb vorn: …, rufen Sie uns an. |
| `de.g.temporal-b2` (B2-e03) | Vertraut, aber als Endungen: -ir -mez (sobald), -diği sürece (solange), -dikçe (sooft), -den beri (seitdem). | „Sobald die Wohnung frei ist, ich ziehe ein.“ | gelir gelmez → sobald; -diği sürece → solange; -dikçe → sooft; danach Verb sofort im Hauptsatz. |
| `de.g.passiversatz` (B2-e04) | Türkisch nutzt -ebilir mit Passiv (iptal edilebilir) und „-mesi gerek“. | „Die Rechnung ist zu bezahlt.“ · „lässt sich gekündigt“ | iptal edilebilir → lässt sich kündigen / ist kündbar; ödenmesi gerekir → ist zu bezahlen. |
| `de.g.praep-genitiv` (B2-e04) | Diese Präpositionen sind im Türkischen Postpositionen (-den dolayı, içinde, yerine, sayesinde). | „aufgrund die hohen Kosten“ · „innerhalb eine Woche“ | sayesinde → mithilfe, yerine → anstelle, hakkında → bezüglich: alle mit Genitiv, vor dem Nomen. |
| `de.g.konjunktiv-1` (B2-e05) | Vertraut: -miş zeigt im Türkischen Hörensagen und Distanz; Deutsch nutzt dafür in Texten den Konjunktiv I. | Indikativ ohne Distanz: „Die Meldung sagt, das Produkt ist gefährlich.“ | Wo das Türkische -miş nutzt (tehlikeliymiş), steht in der Zeitung Konjunktiv I: Das Produkt sei gefährlich. |
| `de.g.textverweise` (B2-e05) | Türkisch verweist mit bu, şu, o und Endungen (buna, bununla); da(r)-Wörter sind neu. | „Ich komme auf das später zurück.“ | Präposition + das wird zu da(r)-: auf das → darauf (buna), mit dem → damit (bununla). |
| `de.g.konj2-vergangenheit` (B2-e06) | Türkisch hat -meliydi (gitmeliydik) und -seydi … -irdi; Deutsch hätte/wäre + Partizip, mit Modalverb zwei Infinitive. | „Wir sollten früher fragen haben.“ · „hätten fragen gesollt“ | gitmeliydik → Wir hätten gehen sollen: hätte vorn, zwei Infinitive am Ende. |
| `de.g.adjektiv-nominalisiert` (B2-e06) | Türkisch macht Adjektive leicht zu Nomen (yaşlılar, en önemlisi), ohne Endungswechsel. | „ein Angehörige“ · „das Wichtigstes“ | yaşlılar → die Älteren: groß geschrieben, aber mit Adjektivendung (der Angehörige, ein Angehöriger). |
| `de.g.modalsatz-indem` (B2-e07) | Vertraut: Das Konverb -erek/-arak drückt das Mittel aus. | „Man spart Energie, mit die Heizung einstellen.“ | ısıtmayı ayarlayarak → indem man die Heizung einstellt (Verb am Ende). |
| `de.g.je-desto` (B2-e07) | Vertraut: „ne kadar … o kadar“ und -dikçe. | „Je besser ist das Haus gedämmt, desto weniger es braucht.“ | ne kadar … o kadar → je … desto. Nach je Verb ans Ende, nach desto Verb sofort. |
| `de.g.funktionsverbgefuege` (B2-e08) | Vertraut: Nomen + Verb (karar vermek, başvuru yapmak); die deutschen Verben sind aber andere. | „eine Entscheidung geben“ · „einen Antrag machen“ | karar vermek → eine Entscheidung treffen; başvuru yapmak → einen Antrag stellen. Verb immer mit dem Nomen lernen. |
| `de.g.partizipialattribut` (B2-e09) | Vertraut: Türkische Partizipialgruppen stehen vor dem Nomen wie im Deutschen (Wetzlar'da geliştirilen mercek). | Endung am Partizip fehlt · Artikel vergessen | Wie Türkisch lesen: Alles zwischen Artikel und Nomen beschreibt das Nomen – die in Wetzlar entwickelte Linse. |
| `de.g.wortbildung-verben` (B2-e09) | Präfixe wie be-, ver-, ent- haben kein Gegenstück; Türkisch leitet mit Endungen ab. | kaufen/verkaufen vertauscht · überSETZen und ÜBERsetzen verwechselt | Präfix verändert die Bedeutung: kaufen (almak) – verkaufen (satmak). Betonung entscheidet: überSETZen (çevirmek), ÜBERsetzen (karşıya geçmek). |
| `de.g.konzessiv-b2` (B2-e10) | Vertraut: gerçi … ama, -se bile. | „Zwar ist günstig das Angebot, aber …“ | gerçi … ama → zwar … aber; -se bile → selbst wenn / auch wenn. |
| `de.g.irrealer-vergleich` (B2-e11) | Vertraut: -mış gibi (anlamıyormuş gibi). | „als ob er versteht kein Türkisch“ | -mış gibi → als ob … (Verb am Ende, Konjunktiv II) oder als + Verb: als verstünde er … |
| `de.g.futur-2` (B2-e12) | Vertraut: -miş olacak (bitirmiş olacağız) und -miştir als Vermutung (kaçırmıştır). | „Er wird den Zug verpasst.“ | -miş olacak → wird … haben; kaçırmıştır → Er wird den Zug verpasst haben. |
| `de.g.relativ-wer-was` (B2-e12) | Türkisch nutzt „kim … -se“ oder ein Partizip (katılmak isteyen herkes). | „Wer mitmachen will, er kommt.“ · „Alles, das wir brauchen“ | Kim … -se → Wer …, (der) …; nach alles, etwas, nichts → was. |
| `de.g.passiv-perfekt` (B2-e13) | Türkisch -ilmiştir/-ildi; im Deutschen steht „worden“ ohne ge-. | „ist gebaut geworden“ | Passiv-Perfekt: ist … worden (nicht geworden): Die Brücke ist gebaut worden. |
| `de.g.modal-vermutung` (B2-e13) | Vertraut: -meli als Vermutung (eski olmalı), -ebilir (olabilir), herhalde. | „Das Haus soll sehr alt sein.“ (gemeint: muss) | eski olmalı → Es muss alt sein; olabilir → kann/könnte. „sollen“ heißt dagegen „man sagt“. |
| `de.g.genitiv-relativ` (B2-e14) | Türkisch nutzt ein Partizip mit Possessiv (oğlu ifade veren kadın). | „Die Frau, ihr Sohn ausgesagt hat“ · „wessen Sohn“ | oğlu … veren kadın → die Frau, deren Sohn …: dessen (der, das), deren (die, Plural). |
| `de.g.statt-ohne` (B2-e15) | Vertraut: -mek yerine (statt … zu), -meden (ohne … zu). | „Sie ging, ohne zu verabschieden sich.“ | vedalaşmadan → ohne sich zu verabschieden; -mek yerine → statt … zu. |
| `de.g.adversativ` (B2-e16) | Vertraut: -irken (auch gegensätzlich), oysa, -in aksine. | „Während Murat wollte eine Reparatur, …“ | -irken/oysa → während/wohingegen (Verb am Ende); -in aksine → im Gegensatz zu + Dativ. |
| `de.g.weiterfuehrender-nebensatz` (B2-e16) | Türkisch führt mit „ki bu da …“ oder einem neuen Satz weiter. | „…, das Murat sehr ärgerte.“ | Bezieht sich der Nebensatz auf den ganzen Satz (bu da), heißt es „was“: …, was Murat sehr ärgerte. |

### 2.6 C1 (18 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `de.g.register` (C1-e01) | Türkisch zeigt Register über Wortwahl und sen/siz (sağ ol – teşekkür ederim); Deutsch über Wortwahl, du/Sie und Satzbau. | Wechsel von du und Sie im selben Text · Umgangssprache in förmlichen E-Mails | Wie sağ ol und teşekkür ederim gibt es deutsche Paare: Danke dir – Vielen Dank; Bis bald – Mit freundlichen Grüßen. |
| `de.g.modalpartikeln-c1` (C1-e02) | Teilweise Entsprechungen: herhalde (wohl), zaten (eben), yoksa …? in Fragen (etwa). | Partikeln wörtlich übersetzt oder weggelassen | herhalde → wohl; „Yoksa imzaladınız mı?“ → Haben Sie etwa schon unterschrieben? Sie können ruhig fragen = çekinmeden sorabilirsiniz. |
| `de.g.konj2-diplomatie` (C1-e02) | Türkisch schwächt mit acaba, -ebilir miyiz, bence ab; Deutsch vor allem mit Konjunktiv II. | zu direkte Ablehnung („Das ist falsch.“) | „Acaba … mi?“ → Wäre es denkbar, …? Ich würde vorschlagen, … Das hätte ich anders gesehen. |
| `de.g.redewiedergabe-text` (C1-e03) | Vertraut: -e göre (laut), -miş (Distanz). | „Nach die Studie …“ · Konjunktiv I und Indikativ ohne System | araştırmaya göre → laut der Studie oder der Studie zufolge (nachgestellt wie eine Postposition). |
| `de.g.passiv-c1` (C1-e04) | Türkisch packt alles in ein Wort (denetlenmeliydi); Deutsch braucht vier Verbteile. | „hätte geprüft müssen werden“ | Von hinten bauen: geprüft werden müssen, „hätte“ vorn. Unpersönlich wie im Türkischen (pazarlık edilmez): Hier wird nicht verhandelt. |
| `de.g.gehobene-praep` (C1-e04) | Amtssprache: uyarınca/gereğince (gemäß), bakımından (hinsichtlich). | „gemäß des Absatzes“ | Absatz 3 uyarınca → gemäß Absatz 3. gemäß und entsprechend mit Dativ; hinsichtlich, angesichts mit Genitiv. |
| `de.g.subjektive-modalverben` (C1-e05) | Vertraut: -miş zeigt Hörensagen (işe yaramış) – genau die Aufgabe von „sollen“. | „Er will nichts davon gewusst.“ · „soll“ als Pflicht verstanden | İşe yaramış → Es soll funktioniert haben. „wollen“ = jemand behauptet etwas über sich selbst. |
| `de.g.konnektoren-c1` (C1-e05) | Vertraut: bir yandan … öte yandan, -medikçe (es sei denn), dolayısıyla (folglich). | „zumal viele sind abgelenkt“ | -medikçe → es sei denn; bir yandan … öte yandan → einerseits … andererseits; nach zumal Verb ans Ende. |
| `de.g.wortbildung-c1` (C1-e06) | Vertraut: Türkische Ketten haben den Kern hinten (gıda israfı = Lebensmittelverschwendung). | Teile vertauscht · Artikel vom ersten Teil | Lange Wörter von hinten lesen: Lebensmittel-verschwendung = gıda israfı. |
| `de.g.verbalisierung` (C1-e07) | Vertraut: Amtstürkisch ist ebenso nominal (başvurunuzun alınmasından sonra). | Kasus und Präposition beim Auflösen falsch | Nach Eingang Ihres Antrags → Sobald Ihr Antrag eingegangen ist: aus dem Nomen wird wieder ein Verb. |
| `de.g.partizipialkonstruktion` (C1-e08) | Vertraut: Konverben verkürzen Sätze (Wetzlar'a varınca). | „In Wetzlar angekommen, sie suchte …“ | Wetzlar'a varınca → In Wetzlar angekommen, suchte sie …: danach sofort das Verb. |
| `de.g.idiomatik` (C1-e08) | Redewendungen lassen sich nicht wörtlich übertragen; manche Sprichwörter haben ein Gegenstück. | „Mein Kopf ist gemischt.“ (aus kafam karıştı) | kafam karıştı → Ich bin verwirrt. Ağaç yaşken eğilir ≈ Was Hänschen nicht lernt, lernt Hans nimmermehr. |
| `de.g.negation-c1` (C1-e09) | Türkisch verneint mit pek … -me- (kaum) doppelt; „önemsiz değil“ ist wie „nicht unwichtig“. | „Kaum niemand kannte das.“ | pek kimse … -me- → kaum jemand (ohne zweite Verneinung); önemsiz değil → nicht unwichtig. |
| `de.g.textkohaesion` (C1-e10) | Vertraut: Bu bağlamda, Sonuç olarak, Aşağıda; neu ist die Verbstellung danach. | „Abschließend man kann sagen, …“ | Überleitungen stehen auf Platz 1, das Verb folgt: Abschließend lässt sich festhalten, … |
| `de.g.verkuerzung` (C1-e10) | Protokollstil kennt auch das Türkische; deutsche Notizen nutzen den Infinitiv am Ende. | Imperativ oder volle Sätze statt Notizform | Material bis Freitag bestellen: Artikel und Hilfsverben fallen weg, der Infinitiv steht am Ende. |
| `de.g.vergleich-c1` (C1-e11) | Vertraut: -meyecek kadar (anlatılamayacak kadar güzel). | „zu wichtig, dass man …“ | -meyecek kadar … → zu …, als dass … (mit Konjunktiv II). |
| `de.g.satzgliedstellung` (C1-e12) | Im Türkischen steht das Betonte direkt vor dem Verb; im Deutschen oft im Vorfeld oder am Ende des Mittelfelds. | „Diesen Punkt ich möchte betonen.“ | Was im Türkischen vor das Verb rückt, kommt im Deutschen oft ganz nach vorn: Gerade diesen Punkt möchte ich betonen. |
| `de.g.attribute-komplex` (C1-e13) | Vertraut: vorangestellte Partizipien und Genitivketten (bir maddenin geçerliliğinin incelenmesi) – nur in umgekehrter Reihenfolge. | Kettenglieder in türkischer Reihenfolge | Genitivkette umdrehen: die Prüfung der Zulässigkeit einer Klausel. Vorangestellte Attribute wie türkische Partizipien lesen. |

## 3 Wortschatz

### 3.1 Falsche Freunde

Ähnlich klingende oder geschriebene Wörter mit anderer Bedeutung. „teilweise“ heißt: Die Bedeutungen überschneiden sich nur zum Teil.

| Türkisch | Bedeutung | ähnliches deutsches Wort | dessen Bedeutung | für das türkische Wort sagt man | Einheit |
|---|---|---|---|---|---|
| pasta | Torte, Kuchen | Pasta | Nudeln (tr makarna) | die Torte | A1-e05 |
| kek | Rührkuchen | der Keks | kleines Gebäck (tr bisküvi) | der Kuchen | A1-e05 |
| bisküvi | Keks | der Biskuit | lockerer Teig (tr pandispanya) | der Keks | A1-e05 |
| tas | Schale, Napf | die Tasse | Trinkgefäß (tr fincan) | die Schale, die Schüssel | A1-e05 |
| şeker | Zucker; Bonbon | der Zucker | nur Zucker | das Bonbon (Süßigkeit) | A1-e06, teilweise |
| fiş | Kassenbon; Stecker | der Fisch | Tier, Speise (tr balık) | der Kassenbon, der Stecker | A1-e06 |
| bank / banka | bank = Sitzbank, banka = Geldinstitut | die Bank | beides | die Bank (zwei Bedeutungen) | A1-e09, teilweise |
| salon | Wohnzimmer; Saal | der Salon | Friseursalon, Ausstellungsraum | das Wohnzimmer | A1-e03 |
| apartman | Mehrfamilienhaus | das Apartment | kleine Wohnung | das Mehrfamilienhaus | A1-e03 |
| kanepe | Sofa | das Kanapee | belegtes Häppchen (veraltet auch Sofa) | das Sofa | A1-e03 |
| sofa | Diele, Vorraum (eher bei Älteren; zu prüfen) | das Sofa | Sitzmöbel (tr kanepe) | die Diele, der Flur | A1-e03 |
| gardırop | Kleiderschrank | die Garderobe | Kleiderablage im Flur | der Kleiderschrank | A2-e04 |
| kiler | Vorratskammer | der Keller | Raum unter dem Haus (tr bodrum) | die Vorratskammer | A2-e04 |
| ceket | Jackett, Sakko | die Jacke | tr mont | das Jackett, das Sakko | A1-e10, teilweise |
| kart | Plastikkarte | die Karte | auch Landkarte, Fahrkarte, Speisekarte | – (das deutsche Wort ist weiter) | A2-e02, teilweise |
| menü | Speisekarte; festes Gericht | das Menü | festes Gericht mit Gängen | die Speisekarte | B1-e11, teilweise |
| tarif | Rezept; Beschreibung (yol tarifi) | der Tarif | Preis- oder Lohnordnung | das Rezept, die Wegbeschreibung | B1-e11 |
| mağaza | Geschäft, Laden | das Magazin | Zeitschrift; Lager | das Geschäft | A2-e06 |
| magazin | Klatschpresse | das Magazin | Zeitschrift allgemein | die Klatschpresse; Zeitschrift = dergi | B2-e05 |
| kombi | Gastherme | der Kombi | Auto mit großem Laderaum | die Therme, die Heizung | B1-e04 |
| sigorta | Versicherung; elektrische Sicherung | die Sicherung | nur die elektrische Sicherung | die Versicherung oder die Sicherung | B1-e04, B2-e10 |
| akü | Autobatterie | der Akku | aufladbare Batterie, z. B. im Handy | die Autobatterie | A2-e10 |
| pratik | praktisch; Übung | die Praxis | Arztpraxis; Anwendung | praktisch, die Übung | A1-e11, teilweise |
| doktor | Arzt, Ärztin | der Doktor | Titel; im Alltag auch Arzt | der Arzt, die Ärztin | A1-e11, teilweise |
| grip | Grippe; oft auch starke Erkältung (zu prüfen) | die Grippe | nur die echte Grippe | die Erkältung (tr nezle) | A2-e05, teilweise |
| rapor | Bericht; Krankschreibung | der Rapport | veraltet für Meldung | die Krankschreibung, der Bericht | A2-e05 |
| kriz | Krise; Anfall (kalp krizi) | die Krise | nur Krise | der Anfall, der Herzinfarkt | B1-e03, teilweise |
| ambulans | Krankenwagen | die Ambulanz | Ambulanz eines Krankenhauses | der Krankenwagen, der Rettungswagen | B2-e06, teilweise |
| not | Schulnote; Notiz | die Note | Schulnote | die Notiz (not almak = sich Notizen machen) | A1-e07, teilweise |
| pansiyon | Gästehaus | die Pension | Gästehaus; auch Ruhegehalt von Beamten | die Pension (Gästehaus) | B1-e08, teilweise |
| rant | Gewinn, z. B. aus steigenden Bodenpreisen | die Rente | Ruhegeld (tr emekli maaşı) | – (Rente = emekli maaşı) | C1-e11 |
| lisans | Bachelor; Lizenz | die Lizenz | Erlaubnis, Nutzungsrecht | der Bachelor | B2-e08, teilweise |
| diploma | Abschlusszeugnis jeder Schule | das Diplom | bestimmter Hochschulabschluss | das Zeugnis, der Abschluss | B2-e01 |
| vize | Visum; Zwischenprüfung an der Hochschule | das Visum | nur Visum | die Zwischenprüfung | B2-e08, teilweise |
| patron | Chef, Arbeitgeber | der Patron | selten, andere Bedeutung | der Chef, die Chefin | A2-e13 |
| şoför | Fahrer | der Chauffeur | Privatfahrer (selten) | der Fahrer, die Busfahrerin | A1-e12 |
| köşk | Villa, Pavillon | der Kiosk | kleiner Laden | die Villa | A1-e09 |
| plaj | Strand | die Plage | Last, Mühe | der Strand | A2-e11 |
| bagaj | Gepäck; Kofferraum | die Bagage | abwertend für eine Gruppe | das Gepäck, der Kofferraum | A2-e11 |
| reklam | Werbung | die Reklamation | Beschwerde über einen Mangel | die Werbung | B2-e16 |
| prim | Prämie; Sozialversicherungsbeitrag | die Prämie | Bonus; Versicherungsbeitrag | der Beitrag | B2-e02, teilweise |
| kostüm | Damenkostüm | das Kostüm | auch Verkleidung | das Kostüm | A2-e06, teilweise |
| sıfır | Null | die Ziffer | Zahlzeichen 0 bis 9 (tr rakam) | die Null | B1-e14 |

Echte Freunde, die man bestärken sollte: reçete und Rezept (beide für Arzt und Küche), kurs und Kurs (Lehrgang), şef und Chef (gleich ausgesprochen), balkon und Balkon, büro und Büro, kuzen und Cousin/Cousine (mit Genus).

### 3.2 Lehnwörter

**Deutsche Wörter im Türkischen** (Brücke beim Lernen, Artikel und Schreibung neu):

| Türkisch | Deutsch | Hinweis |
|---|---|---|
| otoban | die Autobahn | – |
| şalter | der Schalter | im Deutschen auch Bank- oder Postschalter |
| dübel | der Dübel | – |
| fön | der Föhn | im Deutschen ein warmer Wind und der Haartrockner |
| aysberg | der Eisberg | – |
| şnitzel | das Schnitzel | Fleischart nennen (Leitfaden §3: Hähnchen, Pute, Rind) |

**Türkische Wörter im Deutschen** (oft mit anderer Bedeutung oder Aussprache):

| Deutsch | Türkisch | Hinweis |
|---|---|---|
| der Joghurt | yoğurt | Schreibung mit gh |
| der Kiosk | köşk | im Deutschen ein kleiner Laden, im Türkischen eine Villa oder ein Pavillon |
| der Döner | döner | im Deutschen meist das ganze Gericht im Brot |
| der Dolmetscher | dilmaç (alt) | über das Ungarische ins Deutsche gekommen |
| die Tulpe | tülbent | ursprünglich „Turban“ |
| der Kaffee | kahve | Wort aus dem Arabischen, über das Türkische ins Deutsche |
| der Ayran, der Börek, die Baklava, der Bulgur | ayran, börek, baklava, bulgur | Genus im Deutschen schwankt teilweise (zu prüfen: Wörterbuchangaben) |

**Gemeinsame Wörter aus dem Arabischen und Persischen** (Bedeutung meist gleich, Ausnahmen markiert):

| Türkisch | Deutsch | Hinweis |
|---|---|---|
| şeker | der Zucker | tr auch „Bonbon“ (§3.1) |
| limon | die Zitrone, die Limone | – |
| safran | der Safran | – |
| ıspanak | der Spinat | – |
| cebir | die Algebra | – |
| kimya | die Chemie | – |
| sıfır | die Ziffer | falscher Freund: sıfır = Null (§3.1) |
| mağaza | das Magazin | falscher Freund: mağaza = Geschäft (§3.1) |
| tarif | der Tarif | falscher Freund: tarif = Rezept, Beschreibung (§3.1) |

### 3.3 Internationalismen

Grob 15 % der häufigen deutschen Nomen mit türkischer Übersetzung sind ähnlich geschrieben (Top-2.000: 113 von 709, Messung §7). Sie sind eine starke Brücke für das Lesen. Fallen sind Schreibung, Genus und Bedeutung.

| Deutsch | Türkisch | Beispiele | Genus im Deutschen (Top-5.000-Nomen) |
|---|---|---|---|
| -tion, -sion | -syon | Station – istasyon, Funktion – fonksiyon, Organisation – organizasyon, Reaktion – reaksiyon | die (55 von 57 auf -ion) |
| -tät | -ite | Universität – üniversite, Qualität – kalite, Aktivität – aktivite | die (9 von 9) |
| -ie | -i | Energie – enerji, Kategorie – kategori, Theorie – teori, Strategie – strateji | die (31 von 31) |
| -ik | -ik | Technik – teknik, Statistik – istatistik, Mathematik – matematik | die (16 von 17) |
| -ment | -man | Dokument – doküman, Element – element | das (10 von 10) |
| -or | -ör | Motor – motor, Professor – profesör, Direktor – direktör | der (13 von 14) |
| -ismus | -izm | Tourismus – turizm | der (4 von 4) |
| -ur | -ür | Kultur – kültür | meist die (12 von 18) |

Weitere Paare (Auswahl): Problem – problem, Thema – tema, Video – video, System – sistem, Internet – internet, Programm – program, Projekt – proje, Foto – fotoğraf, Hotel – otel, Sport – spor, Liste – liste, Telefon – telefon, Kamera – kamera, Kontrolle – kontrol, Park – park, Maschine – makine, Risiko – risk, Charakter – karakter, Test – test, Standard – standart, Prinzip – prensip, Büro – büro, Karriere – kariyer, Detail – detay, Stil – stil, Analyse – analiz, Radio – radyo, Kanal – kanal, Restaurant – restoran, Adresse – adres, Krise – kriz, Profil – profil, Formel – formül, Million – milyon, Balkon – balkon, Toilette – tuvalet, Garage – garaj.

**Fallen bei Internationalismen:**
- **Schreibung:** H am Anfang (Hotel), th (Thema, Theorie), ph wird heute meist f (Telefon, Foto), c/k (Café, Computer), qu (Qualität), Doppelkonsonant (Programm, Kontrolle).
- **Genus:** Die Endungen oben sind verlässlich; sonst mit Artikel lernen (das Problem, das System, das Thema, der Test).
- **Aussprache:** Restaurant, Chef und Garage französisch, Handy und Software englisch, Station mit „scht“ am Anfang.
- **Bedeutung:** Karte, Bank, Kurs, Menü (§3.1).
- **Genus bei Personen:** Cousin und Cousine, Chef und Chefin – das Türkische unterscheidet nicht (kuzen, şef).

### 3.4 Wortfelder mit anderer Einteilung

| Feld | Türkisch | Deutsch | Tipp |
|---|---|---|---|
| Verwandte | teyze, hala; dayı, amca; yenge; enişte | die Tante; der Onkel; die Tante oder Schwägerin; der Onkel oder Schwager | Ein deutsches Wort für zwei türkische; die Seite der Familie sagt man dazu (die Schwester meiner Mutter). |
| Geschwister | abla, ağabey/abi, kardeş | die Schwester, der Bruder | Alter mit Adjektiv: meine große Schwester. abla und abi sind im Deutschen keine Anrede (§4.2). |
| Zeit | saat (Uhr und Stunde) | die Uhr, die Stunde | „zwei Stunden warten“, aber „um zwei Uhr“. |
| Gefäße | fincan, bardak, tas, kâse | die Tasse, das Glas, die Schale, die Schüssel | Tee trinkt man in Deutschland oft aus der Tasse. |
| Gebäck | pasta, kek, bisküvi, kurabiye | die Torte, der Kuchen, der Keks, das Plätzchen | §3.1 |
| Kleidung | ceket, mont, palto | das Jackett oder Sakko, die Jacke, der Mantel | §3.1 |
| Wohnen | salon, oturma odası; apartman, daire | das Wohnzimmer; das Mehrfamilienhaus, die Wohnung | §3.1 |
| Lage | koymak | stellen, legen, setzen, hängen | `de.g.positionsverben` |
| Handwerk | usta, kalfa, çırak | der Meister, der Geselle, der oder die Auszubildende | Abschlüsse sind nicht automatisch gleichwertig (Anerkennung, B2-e08). |
| Schule | ilkokul, ortaokul, lise | Grundschule, weiterführende Schule, Oberstufe | §4.6 |
| Arzt | doktor | der Arzt, die Ärztin; Doktor ist ein Titel | §3.1 |
| Ländernamen | Türkiye, Suriye, Irak, Lübnan (ohne Artikel) | die Türkei, der Irak, der Libanon; aber Deutschland, Syrien ohne Artikel | aus der Türkei, in die Türkei, im Libanon: Ländernamen mit Artikel lernen. |

### 3.5 Englisch und Französisch als Brücke

Viele Lernende kennen Englisch aus der Schule. Das hilft bei Internationalismen, schafft aber eigene falsche Freunde:

| Deutsch | Bedeutung | englisches Wort | Bedeutung dort |
|---|---|---|---|
| bekommen | erhalten | become | werden |
| der Chef | Vorgesetzter | chef | Koch |
| das Gift | giftiger Stoff | gift | Geschenk |
| das Handy | Mobiltelefon | handy | praktisch |
| also | deshalb, folglich | also | auch |
| wer, wo | kim, nerede | where, who | wo, wer |
| will | möchte (wollen) | will | Zukunft |
| die Rente | Ruhegeld | rent | Miete |
| sensibel | empfindlich | sensible | vernünftig |
| eventuell | vielleicht | eventually | schließlich |
| aktuell | gegenwärtig | actual | tatsächlich |
| das Gymnasium | Schulform | gym | Turnhalle |
| der Beamer | Projektor | – | (im Englischen nicht üblich) |

Französisch kennt das Türkische über viele Lehnwörter (kuaför, şoför, pardon, tuvalet, garaj, adres). Das hilft bei deutschen Wörtern aus dem Französischen: Toilette, Garage, Adresse, Büro, Etage, Portemonnaie, Friseur (tr kuaför), Cousin/Cousine, Onkel, Tante.

## 4 Pragmatik und Höflichkeit

### 4.1 du und Sie

siz entspricht in der Funktion dem deutschen „Sie“: Es ist höflich und für Erwachsene, die man nicht gut kennt. Grammatisch unterscheiden sich die beiden:
- „siz“ ist die 2. Person Plural; „Sie“ ist die 3. Person Plural und wird großgeschrieben. Mögliche Folge: „ihr“ als höfliche Anrede („Können ihr mir helfen?“; zu prüfen, §8).
- „ihr“ ist nur der Plural von du (Kinder, Freunde, Familie).

| Situation | Deutsch | Türkisch | Hinweis |
|---|---|---|---|
| Amt, Arzt, Geschäft, Unbekannte | Sie + Familienname | siz, oft mit Vorname + Bey/Hanım | §4.2 |
| Familie, Freunde, Kinder unter sich | du | sen | Vertraut |
| Kind zu Lehrkraft | Sie + Frau/Herr + Familienname | siz, „Öğretmenim“ | Die Lehrkraft duzt Kinder meist; in der Oberstufe oft Sie. |
| Nachbarn | Sie, bis jemand das Du anbietet | siz oder Verwandtschaftswort | Das Du bietet meist die ältere Person an. |
| Kolleginnen und Kollegen | oft du, je nach Betrieb | siz oder sen | Im Zweifel mit Sie beginnen. |
| Behördenbrief, Formular | durchgehend Sie | siz | Kein Wechsel im selben Text (`de.g.register`). |

### 4.2 Anrede und Namen

- **Familienname statt Vorname:** Türkisch ehrt mit Vorname + Bey/Hanım (Murat Bey, Derya Hanım). Deutsch nutzt Herr/Frau + Familienname: Herr Yılmaz, Frau Yılmaz. „Herr Murat“ wirkt im Deutschen falsch.
- **Verwandtschaftswörter als Anrede:** abla, abi, teyze, amca für Nachbarn, Ältere oder Fremde. Im Deutschen nur in der Familie. Nachbarn heißen „Herr Neumann“ und „Frau Kaya“, Gleichaltrige beim Vornamen.
- **Lehrkräfte:** „Öğretmenim!“ wird nicht zu „Lehrerin!“, sondern zu „Frau Schneider“.
- **Titel:** Doktor steht vor dem Familiennamen (Frau Dr. Fischer). Berufsbezeichnungen sind keine Anrede.
- **Familienname im Formular:** zuerst Familienname, dann Vorname (§4.5). Türkische Buchstaben (ş, ğ, ı) wie im Pass schreiben; manche Systeme ersetzen sie (zu prüfen, §8).

### 4.3 Grüßen, Danken, Bitten, Wünschen

Nur weltliche Formeln (Leitfaden §4.3). Viele türkische Formeln haben keine feste deutsche Entsprechung; Tipps zeigen dann eine passende freie Formulierung.

| Situation | Türkisch | Deutsch | Hinweis |
|---|---|---|---|
| Gruß nach Tageszeit | Günaydın, İyi günler, İyi akşamlar | Guten Morgen, Guten Tag, Guten Abend | İyi akşamlar dient auch zum Abschied: „Schönen Abend noch!“ |
| Abschied | Hoşça kal (wer geht), Güle güle (wer bleibt) | Tschüss, Auf Wiedersehen | Deutsch unterscheidet nicht, wer geht. |
| Befinden | Nasılsın? İyiyim, sağ ol. | Wie geht es dir? Gut, danke. Und dir? | Mit Unbekannten im Laden fragt man nicht nach dem Befinden. |
| Bitte (Wunsch) | lütfen | bitte | – |
| Anbieten, hereinbitten | Buyurun | Bitte schön. Kommen Sie herein. Was darf es sein? | Ein türkisches Wort, mehrere deutsche Sätze. |
| Dank | Teşekkürler, Sağ ol | Danke, Vielen Dank | Register: Danke dir / Vielen Dank (`de.g.register`) |
| Antwort auf Dank | Rica ederim, Bir şey değil | Bitte, Gern geschehen | – |
| Nachfragen | Efendim? | Wie bitte? | „Was?“ klingt unhöflich. |
| Entschuldigung | Pardon, Affedersiniz, Kusura bakmayın | Entschuldigung, Verzeihung, Es tut mir leid | – |
| Essen | Afiyet olsun | Guten Appetit | Im Deutschen nur vor dem Essen. |
| Lob für die Köchin oder den Koch | Eline sağlık | Das hat sehr gut geschmeckt! | keine feste Formel |
| Gruß an Arbeitende | Kolay gelsin | (keine Entsprechung) | einfach grüßen: Guten Tag! |
| Krankheit | Geçmiş olsun | Gute Besserung! | – |
| Niesen | Çok yaşa | Gesundheit! | Antwort: Danke. |
| Glückwunsch | Tebrikler, Tebrik ederim | Herzlichen Glückwunsch! | – |
| Neues Gekauftes | Güle güle kullan / giy | Viel Freude damit! | keine feste Formel |
| Reise | İyi yolculuklar | Gute Reise! | – |
| Wochenende | İyi hafta sonları | Schönes Wochenende! | – |
| Trauer | Başınız sağ olsun | Mein Beileid. Herzliches Beileid. | erst ab B1, ruhig (Leitfaden G-12) |

### 4.4 Gespräch, Kritik, Absagen

Die Hinweise beschreiben deutsche Gewohnheiten; sie bewerten keine Herkunft (Leitfaden G-04).
- **Anbieten und Ablehnen:** Ein „Nein, danke“ wird im Deutschen meist wörtlich genommen; oft wird nicht ein zweites Mal angeboten. Wer etwas möchte, sagt beim ersten Mal „Ja, gern“.
- **Absagen:** kurz, mit Dank und Grund: „Danke für die Einladung, ich kann leider nicht.“ Termine bei Arzt und Amt sind verbindlich; wer nicht kommen kann, sagt vorher ab.
- **Bitten im Amt:** Direkte Aufforderungen („Bitte füllen Sie das Formular aus.“) sind normal und nicht unhöflich.
- **Kritik im Team:** sachlich und direkt, oft in der Ich-Form; der Konjunktiv II macht sie weicher (B1-e10, C1-e02).
- **Hilfe anbieten:** „Kann ich Ihnen helfen?“ – unter Nachbarn üblich (A2-e07).

### 4.5 Briefe, E-Mails, Formulare

| Bestandteil | Deutsch | Türkisch | Tipp |
|---|---|---|---|
| förmliche Anrede | Sehr geehrte Frau Hoffmann, / Sehr geehrter Herr Kaya, | Sayın Hoffmann, / Sayın Petra Hoffmann, | Sayın + Name → Sehr geehrte/r + Frau/Herr + Familienname |
| Empfänger unbekannt | Sehr geehrte Damen und Herren, | Sayın Yetkili, | – |
| halbförmlich | Liebe Frau Schneider, / Hallo Frau Schneider, | Değerli …, / Merhaba …, | Hallo + Familienname nur in E-Mails |
| nach der Anrede | Komma, dann klein weiter | Komma, dann groß | „…, ich schreibe Ihnen, weil …“ |
| Schluss | Mit freundlichen Grüßen (ohne Komma), Viele Grüße | Saygılarımla, Sevgiler | Name in die nächste Zeile |
| Betreff | fett, ohne das Wort „Betreff“ | Konu: | – |
| Ort und Datum | Wetzlar, 20.10.2026 | Tarih | – |
| Antrag an eine Behörde | Brief nach DIN 5008: Absender, Empfänger, Betreff, Anliegen, Gruß, Unterschrift | Bittschrift (dilekçe): Empfänger groß oben, feste Schlussformel | Der deutsche Brief kommt nach der Anrede direkt zur Sache. |
| Formular | Familienname, Vorname(n), Geburtsname, Geburtsdatum TT.MM.JJJJ, Staatsangehörigkeit, Unterschrift | soyadı, adı | Familienname zuerst; Namen wie im Pass. |
| Lebenslauf | tabellarisch, das Neueste oben, Foto freiwillig | özgeçmiş | B2-e01 |
| E-Mail-Adressen in Übungen | nur example.org, nicht verlinkt (Leitfaden G-08) | – | – |

### 4.6 Zeit, Zahlen, Formate, Schule

| Thema | Deutschland | Türkei | Tipp |
|---|---|---|---|
| Uhrzeit | 24 Stunden in Plänen, im Gespräch 12 | gleich | Vertraut |
| halbe Stunde | halb acht = 7:30 | yedi buçuk | `de.g.zeitangaben` |
| Datum | 20.10.2026 | 20.10.2026 | Vertraut |
| Dezimalzahl | Komma (2,50), Tausenderpunkt (1.000) | gleich | Vertraut |
| Preis | 2,50 € (Zeichen nach der Zahl) | 2,50 TL | Vertraut |
| Wochenbeginn | Montag | Pazartesi | Vertraut |
| Schulnoten | 1 (sehr gut) bis 6 (ungenügend) | die höchste Zahl ist die beste | umgekehrt (B1-e07) |
| Schulweg | Grundschule 4 Jahre, danach in Hessen u. a. Gymnasium, Realschule, Hauptschule, Gesamtschule | 4 + 4 + 4 (ilkokul, ortaokul, lise) | Die Wahl der Schulform fällt nach Klasse 4. |
| Notruf | 112 (Feuerwehr, Rettung), 110 (Polizei) | 112 | Vertraut bei 112 |
| Telefon | Man meldet sich mit dem eigenen Namen. | Alo? Efendim? | „Hier ist Derya Yılmaz.“ |
| Ordinalzahl | 3. = dritte | 3. = üçüncü | Vertraut |

### 4.7 Religiöse Formeln (gesperrt)

Für viele Alltagssituationen gibt es im Türkischen auch religiöse Formeln (Gruß, Pläne, Lob, Dank, Abschied, Trauer). In den Sprachkursen sind sie gesperrte Kandidaten (Leitfaden §4.2, F-tr-01 bis F-tr-15) und kein Gegenstand dieses Dokuments.
- Tipps nennen nur die weltlichen Entsprechungen aus Leitfaden §4.3 (Tabelle §4.3).
- Kein Tipp erklärt, übersetzt oder bewertet eine religiöse Formel.
- Sie erscheinen frühestens nach zwei Freigaben der religiösen Prüfung (KERN §2.3, LM-09).

## 5 Hinweise für Herkunftssprachler

### 5.1 Wer den Kurs nutzt

| Gruppe | Stärken | typische Lücken | Ausrichtung der Tipps |
|---|---|---|---|
| Kinder und Jugendliche, die in Deutschland aufwachsen, Türkisch als Familiensprache | Deutsch im Alltag oft stärker als Türkisch | Türkisch lesen und schreiben; Bildungssprache im Deutschen (Nominalstil, Genitiv, Konjunktiv) | In der Kurswahl die Oberfläche Deutsch anbieten; in `de-aus-tr` Schwerpunkt Register und Schriftsprache (B2, C1). |
| Erwachsene, die Deutsch über Jahre im Alltag erworben haben | Hören, Alltagswortschatz, Mut zum Sprechen | gefestigte Muster: Artikel fehlen, Verb am Ende („Ich morgen Arzt gehen“), Verneinung vor dem Verb, fehlende Präposition („Ich gehe Arzt“) | Einstufung je Fertigkeit; Tipps zeigen die Standardform als Ergänzung, ohne „falsch“ und ohne Wertung. |
| Neu Zugewanderte mit türkischer Schulbildung | Grammatikbegriffe, Lerngewohnheit, Lesen | Hören, Alltagsregister | volle Kontrasttipps ab A1 |

### 5.2 Sprache der Tipps

- **Einfaches Türkisch:** kurze Sätze, Alltagswörter, ein Gedanke je Satz. Viele Herkunftssprachler lesen Türkisch langsamer als Deutsch.
- **Beispiele zuerst:** erst das deutsche Beispiel, dann die Regel.
- **Fachwörter zweisprachig:** Viele kennen die deutschen Begriffe aus der Schule besser. Tipps nennen beide:

| Türkisch | Deutsch | Hinweis |
|---|---|---|
| isim | Nomen | – |
| fiil | Verb | – |
| sıfat | Adjektiv | – |
| zarf | Adverb | – |
| zamir | Pronomen | – |
| edat | Postposition (tr), Präposition (dt) | Stellung umgekehrt |
| bağlaç | Konjunktion | – |
| özne, nesne, yüklem | Subjekt, Objekt, Prädikat | – |
| yalın hal | Nominativ | – |
| belirtme hali (-i) | Akkusativ | nur bestimmtes Objekt im Türkischen |
| yönelme hali (-e) | Richtung: deutsch Dativ (Empfänger) oder Akkusativ (nach Wechselpräposition) | Falle, §2 `de.g.wechselpraep` |
| bulunma hali (-de) | Ort: deutsch meist Dativ | – |
| ayrılma hali (-den) | Herkunft: deutsch aus/von + Dativ; beim Vergleich „als“ | – |
| tamlayan (-in) | Genitiv | Reihenfolge umgekehrt |
| tekil, çoğul | Singular, Plural | – |
| geçmiş zaman | Vergangenheit | – |
| edilgen | Passiv | – |
| ettirgen | Kausativ (deutsch „lassen“) | – |

### 5.3 Deutsche Wörter im Türkischen in Deutschland

Im Türkisch, das in Deutschland gesprochen wird, sind deutsche Wörter verbreitet, etwa Termin, Ausbildung, Kindergeld, Krankenkasse, Bescheid, Hausmeister, Führerschein. Sie sind eine Brücke. Tipps ergänzen Artikel und Schreibung: der Termin, die Ausbildung, das Kindergeld, die Krankenkasse, der Bescheid, der Hausmeister, der Führerschein. Welche Wörter die Gemeinde tatsächlich nutzt, prüft die Stichprobe (§8).

### 5.4 Register und Sprachwechsel

- **Sprachwechsel** im Gespräch ist in mehrsprachigen Familien normal. Er ist kein Fehler, sondern eine Frage des Registers (B2-e11, C1-e01).
- **Jugendsprache:** Kurzformen ohne Artikel und Präposition („Ich geh Schule“) kommen im Alltag mancher Jugendlicher vor. Tipps behandeln sie neutral als Register und zeigen die Standardform für Schule, Amt und Beruf; Dialekte und Jugendsprache werden nicht abgewertet (Leitfaden G-04, `de.g.register`).

### 5.5 Einstufung

- Herkunftssprachler und Erwachsene mit Alltagsdeutsch verstehen oft mehr, als sie schreiben können. Der Einstufungstest (AUFTRAG §5.2, Einstufungsbank PLAN §5.1) sollte je Fertigkeit messen.
- Der Vorkurs-Hinweis `de.v.l07` ist optional.
- Rechtschreibtipps (§1.1) gehören auch auf höhere Stufen, wenn die Einstufung hoch ausfällt.

## 6 Tipp-Themen je Einheit

301 Tipp-Themen für 73 Einheiten-Schlüssel (Vorkurs und 72 Einheiten). 199 beziehen sich auf eine Grammatik-ID, die übrigen auf Laut, Schrift, Wortschatz oder Pragmatik (Abschnitt in der Spalte „Bezug“). Jede Einheit hat mindestens zwei Tipps.

| Stufe | Einheiten | Tipp-Themen | je Einheit |
|---|---|---|---|
| Vorkurs | 1 | 8 | 8,0 |
| A1 | 12 | 78 | 6,5 |
| A2 | 14 | 69 | 4,9 |
| B1 | 16 | 64 | 4,0 |
| B2 | 16 | 50 | 3,1 |
| C1 | 14 | 32 | 2,3 |
| Σ | 73 | 301 | 4,1 |

**Leitlinien für das Schreiben der Tipps (Phase Ü, PLAN §6.3):**
- **Sprache:** Türkisch als Oberflächensprache, einfach und kurz (§5.2): Titel, höchstens zwei Sätze, ein bis drei deutsche Beispiele mit `lang="de"`. Türkische Wörter in türkischer Schreibung.
- **Aufbau:** Brücke zuerst („Das kennst du schon: …“), dann der Unterschied. Keine Wertung der Ausgangssprache; „im Deutschen anders“ statt „falsch“.
- **Ort:** Der Tipp erscheint in der genannten Einheit. Nennt er eine Grammatik-ID, ist sie dort oder früher eingeführt (vom Generator geprüft).
- **Beispiele:** nur Wortschatz bis zur Einheit (PLAN §6.4), nur Namen aus der Namensliste (Leitfaden §1.1), bis B1 kindgeeignet, ohne Tabu-Lexikon und ohne religiöse Formeln (§4.7).
- **Schlüssel:** Vorschlag `de-aus-tr.tipp.<Nr.>`; das Schema legt L3-02 fest.

| Nr. | Einheit | Tipp-Titel | Bezug |
|---|---|---|---|
| 001 | de.v.l07 | ä ist neu: ein offenes e | §1.1 |
| 002 | de.v.l07 | ß und ss: scharfes s, auch auf der Tastatur ohne ß | §1.1 |
| 003 | de.v.l07 | Alle Nomen groß – nicht nur Namen | §1.1 |
| 004 | de.v.l07 | z spricht man ts: Zeit, Zug, zehn | §1.1 |
| 005 | de.v.l07 | sch = ş, tsch = ç, j = y | §1.1 |
| 006 | de.v.l07 | Das große I hat keinen Punkt und ist das türkische İ | §1.1 |
| 007 | de.v.l07 | ei, ie, eu: zwei Buchstaben, ein Laut | §1.1 |
| 008 | de.v.l07 | Nicht jeder Buchstabe klingt: stummes h in Uhr und gehen | §1.1 |
| 009 | de.a1.e01 | bin, bist, ist: „sein“ als eigenes Wort | `de.g.sein-pronomen` |
| 010 | de.a1.e01 | Das Pronomen nie weglassen: Ich wohne … | `de.g.praesens-regel` |
| 011 | de.a1.e01 | Ja/Nein-Frage: Verb nach vorn statt „mi“ | `de.g.fragen` |
| 012 | de.a1.e01 | Das türkische „o“ hat drei deutsche Partner: er, sie, es | `de.g.sein-pronomen` |
| 013 | de.a1.e01 | Sie (groß) entspricht siz – mit dem Verb in der 3. Person Plural | §4.1 |
| 014 | de.a1.e01 | Buchstabieren: c heißt „ze“, j „jott“, v „fau“, w „we“ | §1.1 |
| 015 | de.a1.e01 | Länder mit Artikel: aus der Türkei | §3.4 |
| 016 | de.a1.e02 | der, die, das: Artikel immer mitlernen | `de.g.artikel-genus` |
| 017 | de.a1.e02 | annem = meine Mutter: Besitz steht vorn | `de.g.possessiv-nom` |
| 018 | de.a1.e02 | sein oder ihr? Der Besitzer entscheidet | `de.g.possessiv-nom` |
| 019 | de.a1.e02 | „… var“ heißt meist „Ich habe …“ | `de.g.haben` |
| 020 | de.a1.e02 | Tante und Onkel: ein Wort für teyze und hala, amca und dayı | §3.4 |
| 021 | de.a1.e02 | kuzen: Cousin oder Cousine | §3.3 |
| 022 | de.a1.e02 | Zahlen 21–99: erst die Einer (einundzwanzig) | §1.4 |
| 023 | de.a1.e03 | bir wird zu ein oder eine | `de.g.unbest-artikel-negation` |
| 024 | de.a1.e03 | Nach Zahlen der Plural: zwei Stühle | `de.g.plural` |
| 025 | de.a1.e03 | Im Plural heißt der Artikel immer „die“ | `de.g.plural` |
| 026 | de.a1.e03 | Das Zimmer ist hell – „ist“ nicht vergessen | `de.g.adjektiv-praedikativ` |
| 027 | de.a1.e03 | sehr groß (çok) oder zu groß (fazla)? | `de.g.adjektiv-praedikativ` |
| 028 | de.a1.e03 | salon ist das Wohnzimmer, Salon ist etwas anderes | §3.1 |
| 029 | de.a1.e03 | apartman ist das Wohnhaus, Apartment eine kleine Wohnung | §3.1 |
| 030 | de.a1.e04 | halb acht = yedi buçuk | `de.g.zeitangaben` |
| 031 | de.a1.e04 | um, am, im – alle wie -de | `de.g.zeitangaben` |
| 032 | de.a1.e04 | Verb auf Platz 2 – auch nach „Heute“ | `de.g.v2-inversion` |
| 033 | de.a1.e04 | Wochentage und Monate immer groß | §1.1 |
| 034 | de.a1.e04 | Uhrzeit im Plan: 24 Stunden wie im Türkischen | §4.6 |
| 035 | de.a1.e04 | saat: Uhr oder Stunde? | §3.4 |
| 036 | de.a1.e04 | Betonung: Montag, Dienstag – vorn betont | §1.4 |
| 037 | de.a1.e05 | einen Tee: Akkusativ auch beim unbestimmten Objekt | `de.g.akkusativ` |
| 038 | de.a1.e05 | Ich möchte … statt Ich will … | `de.g.vorlieben` |
| 039 | de.a1.e05 | okumayı severim → Ich lese gern | `de.g.vorlieben` |
| 040 | de.a1.e05 | essen – du isst, er isst | `de.g.praesens-vokalwechsel` |
| 041 | de.a1.e05 | pasta ist die Torte, Pasta sind Nudeln | §3.1 |
| 042 | de.a1.e05 | kek, Keks und Biskuit | §3.1 |
| 043 | de.a1.e05 | tas ist keine Tasse | §3.1 |
| 044 | de.a1.e05 | Guten Appetit – vor dem Essen | §4.3 |
| 045 | de.a1.e06 | değil → nicht, yok → kein | `de.g.negation-nicht` |
| 046 | de.a1.e06 | Wo steht „nicht“? | `de.g.negation-nicht` |
| 047 | de.a1.e06 | ein Kilo Äpfel: Plural nach der Menge | `de.g.mengen` |
| 048 | de.a1.e06 | kaç → wie viele, ne kadar → wie viel | `de.g.mengen` |
| 049 | de.a1.e06 | Preise mit Komma wie im Türkischen: 2,50 € | §4.6 |
| 050 | de.a1.e06 | fiş ist der Kassenbon – Fisch ist balık | §3.1 |
| 051 | de.a1.e06 | şeker: Zucker oder Bonbon? | §3.1 |
| 052 | de.a1.e07 | Modalverb auf Platz 2, Infinitiv ans Ende | `de.g.modalverben-1` |
| 053 | de.a1.e07 | Açınız → Öffnen Sie bitte | `de.g.imperativ` |
| 054 | de.a1.e07 | Die Lehrerin heißt „Frau Schneider“, nicht „Lehrerin!“ | §4.2 |
| 055 | de.a1.e07 | not ist die Note – „not almak“ heißt sich Notizen machen | §3.1 |
| 056 | de.a1.e07 | Schulsachen mit Artikel: der Stift, das Heft, die Tafel | `de.g.artikel-genus` |
| 057 | de.a1.e07 | Nachfragen: „Wie bitte?“ statt „Was?“ | §4.3 |
| 058 | de.a1.e08 | und, aber, oder, denn: Platz 0 | `de.g.konnektoren-hauptsatz` |
| 059 | de.a1.e08 | çünkü → denn | `de.g.konnektoren-hauptsatz` |
| 060 | de.a1.e08 | Einladen und absagen: Ich kann leider nicht. | §4.4 |
| 061 | de.a1.e08 | gern + Verb: Ich male gern | `de.g.vorlieben` |
| 062 | de.a1.e08 | Wörter auf -ung sind immer „die“: die Wanderung | `de.g.artikel-genus` |
| 063 | de.a1.e09 | -de, -e, -den → wo, wohin, woher | `de.g.ort-richtung` |
| 064 | de.a1.e09 | evde → zu Hause, eve → nach Hause | `de.g.ort-richtung` |
| 065 | de.a1.e09 | man + Verb wie bei er | `de.g.man` |
| 066 | de.a1.e09 | Präposition vorn: zum Bahnhof (istasyona) | `de.g.ort-richtung` |
| 067 | de.a1.e09 | Kiosk kommt von köşk – bedeutet aber etwas anderes | §3.2 |
| 068 | de.a1.e09 | Bank: Geldinstitut und Sitzbank | §3.1 |
| 069 | de.a1.e09 | Straße, Spiel: st und sp am Anfang wie scht, schp | §1.1 |
| 070 | de.a1.e10 | Es regnet: Wetter braucht „es“ | `de.g.es-unpersoenlich` |
| 071 | de.a1.e10 | var mı? → Gibt es …? | `de.g.es-unpersoenlich` |
| 072 | de.a1.e10 | onu → ihn, sie oder es | `de.g.akk-pronomen` |
| 073 | de.a1.e10 | ceket ist das Jackett, die Jacke ist der mont | §3.1 |
| 074 | de.a1.e10 | Farben nach „ist“ ohne Endung | `de.g.adjektiv-praedikativ` |
| 075 | de.a1.e11 | nicht müssen ist nicht nicht dürfen | `de.g.modalverben-2` |
| 076 | de.a1.e11 | Mir ist kalt – nicht „Ich bin kalt“ | `de.g.dativ-wendungen` |
| 077 | de.a1.e11 | Başım ağrıyor → Mir tut der Kopf weh | `de.g.dativ-wendungen` |
| 078 | de.a1.e11 | Doktor oder Arzt? | §3.1 |
| 079 | de.a1.e11 | Praxis heißt hier Arztpraxis | §3.1 |
| 080 | de.a1.e11 | Notruf 112 wie in der Türkei, Polizei 110 | §4.6 |
| 081 | de.a1.e11 | Geçmiş olsun → Gute Besserung | §4.3 |
| 082 | de.a1.e12 | Das kleine Wort springt ans Ende: Ich stehe auf | `de.g.trennbare-verben` |
| 083 | de.a1.e12 | Mit Modalverb bleibt es zusammen: … abholen | `de.g.trennbare-verben` |
| 084 | de.a1.e12 | Lehrerin, Ärztin: -in für Frauen | `de.g.wortbildung-in` |
| 085 | de.a1.e12 | şoför → Fahrer, Busfahrerin | §3.1 |
| 086 | de.a1.e12 | Betonung: ANfangen, AUFstehen | §1.4 |
| 087 | de.a2.e01 | -di → habe … ge-…-t | `de.g.perfekt-haben` |
| 088 | de.a2.e01 | Das Partizip steht am Satzende | `de.g.perfekt-haben` |
| 089 | de.a2.e01 | hastaydım → Ich war krank | `de.g.praeteritum-sein-haben` |
| 090 | de.a2.e01 | … vardı → ich hatte … | `de.g.praeteritum-sein-haben` |
| 091 | de.a2.e01 | Gestern, am Wochenende: Zeit vorn, Verb auf Platz 2 | `de.g.v2-inversion` |
| 092 | de.a2.e02 | Bewegung → sein: Ich bin gefahren | `de.g.perfekt-sein` |
| 093 | de.a2.e02 | eingekauft, besucht, trainiert: drei Partizip-Muster | `de.g.perfekt-sein` |
| 094 | de.a2.e02 | -(y)le → mit dem | `de.g.dativ-praep` |
| 095 | de.a2.e02 | -den sonra → nach dem … | `de.g.dativ-praep` |
| 096 | de.a2.e02 | Karte: Fahrkarte, Landkarte, Speisekarte | §3.1 |
| 097 | de.a2.e03 | Wem? = -e: Ich schenke meiner Oma … | `de.g.dativ-objekt` |
| 098 | de.a2.e03 | yardım etmek → helfen + Dativ | `de.g.dativ-pronomen` |
| 099 | de.a2.e03 | hoşuma gidiyor → gefällt mir | `de.g.dativ-pronomen` |
| 100 | de.a2.e03 | Tebrikler → Herzlichen Glückwunsch | §4.3 |
| 101 | de.a2.e03 | Güle güle kullan → Viel Freude damit! | §4.3 |
| 102 | de.a2.e04 | duvarda / duvara → an der Wand / an die Wand | `de.g.wechselpraep` |
| 103 | de.a2.e04 | Achtung: -e ist hier Akkusativ, nicht Dativ | `de.g.wechselpraep` |
| 104 | de.a2.e04 | koymak = stellen, legen, hängen, setzen | `de.g.positionsverben` |
| 105 | de.a2.e04 | gardırop ist der Kleiderschrank, die Garderobe hängt im Flur | §3.1 |
| 106 | de.a2.e04 | kiler ist die Vorratskammer, der Keller ist bodrum | §3.1 |
| 107 | de.a2.e05 | çünkü → denn, -diği için → weil | `de.g.nebensatz-weil` |
| 108 | de.a2.e05 | Nach weil: Verb ans Ende | `de.g.nebensatz-weil` |
| 109 | de.a2.e05 | sich freuen, sich erkälten: „sich“ mitlernen | `de.g.reflexive-verben` |
| 110 | de.a2.e05 | Rezept = reçete – ein echter Freund | §3.1 |
| 111 | de.a2.e05 | rapor → die Krankschreibung | §3.1 |
| 112 | de.a2.e05 | Grippe oder Erkältung? | §3.1 |
| 113 | de.a2.e06 | mavi ceket → die blaue Jacke: neu ist die Endung | `de.g.adj-dekl-best` |
| 114 | de.a2.e06 | hangi → welcher, welche, welches | `de.g.welch-dies` |
| 115 | de.a2.e06 | mağaza ist das Geschäft, Magazin ist eine Zeitschrift | §3.1 |
| 116 | de.a2.e06 | Kostüm: Damenkostüm oder Verkleidung | §3.1 |
| 117 | de.a2.e07 | ki oder dass? Nach dass Verb ans Ende | `de.g.nebensatz-dass` |
| 118 | de.a2.e07 | Kimse gelmedi → Niemand ist gekommen | `de.g.indefinitpronomen` |
| 119 | de.a2.e07 | Nachbarn: Herr Neumann statt „Amca“ | §4.2 |
| 120 | de.a2.e07 | Hilfe anbieten: Kann ich Ihnen helfen? | §4.4 |
| 121 | de.a2.e07 | Ein „Nein, danke“ gilt beim ersten Mal | §4.4 |
| 122 | de.a2.e08 | Jan'dan daha hızlı → schneller als Jan | `de.g.komparation` |
| 123 | de.a2.e08 | en … → am …-sten | `de.g.komparation` |
| 124 | de.a2.e08 | için → für + Akkusativ | `de.g.praep-akk` |
| 125 | de.a2.e08 | Trainerin, Spielerin: -in auch im Sport | `de.g.wortbildung-in` |
| 126 | de.a2.e09 | -se und -ince → wenn | `de.g.nebensatz-wenn` |
| 127 | de.a2.e09 | Nach dem wenn-Satz sofort das Verb | `de.g.nebensatz-wenn` |
| 128 | de.a2.e09 | 3. = üçüncü: Ordinalzahl mit Punkt | `de.g.datum-ordinal` |
| 129 | de.a2.e09 | Formular: Familienname, Vorname | §4.5 |
| 130 | de.a2.e09 | Herr Yılmaz, nicht „Herr Murat“ | §4.2 |
| 131 | de.a2.e09 | Um Wiederholung bitten: Können Sie das bitte wiederholen? | §4.3 |
| 132 | de.a2.e10 | -ebilir misiniz? → Könnten Sie …? | `de.g.hoeflich-konj` |
| 133 | de.a2.e10 | Ich hätte gern … statt istiyorum | `de.g.hoeflich-konj` |
| 134 | de.a2.e10 | zuerst, dann, danach: Verb sofort | `de.g.textfolge` |
| 135 | de.a2.e10 | akü ist die Autobatterie, der Akku sitzt im Handy | §3.1 |
| 136 | de.a2.e10 | Handy: ein deutsches Wort für cep telefonu | §3.5 |
| 137 | de.a2.e10 | Deutsche Tastatur: z und y vertauscht | §1.1 |
| 138 | de.a2.e11 | üç gün sonra → in drei Tagen | `de.g.temporale-praep` |
| 139 | de.a2.e11 | bir hafta önce → vor einer Woche | `de.g.temporale-praep` |
| 140 | de.a2.e11 | istedim → ich wollte | `de.g.praeteritum-modal` |
| 141 | de.a2.e11 | plaj ist der Strand, eine Plage ist eine Last | §3.1 |
| 142 | de.a2.e11 | bagaj ist das Gepäck – Bagage ist abwertend | §3.1 |
| 143 | de.a2.e11 | in die Türkei, in der Türkei | `de.g.ort-richtung` |
| 144 | de.a2.e12 | okul çantası → Schultasche: das letzte Wort bestimmt | `de.g.wortbildung-komposita` |
| 145 | de.a2.e12 | Fugen-s und Fugen-n | `de.g.wortbildung-komposita` |
| 146 | de.a2.e12 | Elif'in → Elifs (ohne Apostroph) | `de.g.genitiv-s` |
| 147 | de.a2.e12 | Tiere mit Artikel: die Katze, der Vogel, das Schaf | `de.g.artikel-genus` |
| 148 | de.a2.e13 | olmak: sein oder werden? | `de.g.werden-vollverb` |
| 149 | de.a2.e13 | ein netter Chef: die Endung zeigt das Genus | `de.g.adj-dekl-unbest` |
| 150 | de.a2.e13 | Chef, Chefin – gesprochen wie şef | §3.3 |
| 151 | de.a2.e13 | patron → Chef oder Chefin | §3.1 |
| 152 | de.a2.e14 | bu yüzden → deshalb + Verb | `de.g.konnektoren-adverb` |
| 153 | de.a2.e14 | trotzdem und sonst stehen auf Platz 1 | `de.g.konnektoren-adverb` |
| 154 | de.a2.e14 | Kusura bakma → Entschuldigung / Es tut mir leid | §4.3 |
| 155 | de.a2.e14 | Canım sıkılıyor → Mir ist langweilig | `de.g.dativ-wendungen` |
| 156 | de.b1.e01 | Erzählen im Präteritum: kam, arbeitete | `de.g.praeteritum` |
| 157 | de.b1.e01 | -di und -miş sind nicht Perfekt und Präteritum | `de.g.praeteritum` |
| 158 | de.b1.e01 | çocukken → als ich klein war | `de.g.nebensatz-temporal` |
| 159 | de.b1.e01 | als oder wenn? | `de.g.nebensatz-temporal` |
| 160 | de.b1.e02 | -meye/-meyi → zu + Infinitiv am Ende | `de.g.infinitiv-zu` |
| 161 | de.b1.e02 | anzurufen: zu in der Mitte | `de.g.infinitiv-zu` |
| 162 | de.b1.e02 | ilgilenmek → sich interessieren für (nicht mit) | `de.g.verben-praep` |
| 163 | de.b1.e02 | otobüsü beklemek → auf den Bus warten | `de.g.verben-praep` |
| 164 | de.b1.e03 | -melisin → du solltest | `de.g.konjunktiv-2` |
| 165 | de.b1.e03 | keşke → Ich wünschte … | `de.g.konjunktiv-2` |
| 166 | de.b1.e03 | ellerimi yıkıyorum → Ich wasche mir die Hände | `de.g.reflexiv-dativ` |
| 167 | de.b1.e03 | kriz: Krise oder Anfall? | §3.1 |
| 168 | de.b1.e04 | tamir ediliyor → wird repariert | `de.g.passiv-praesens` |
| 169 | de.b1.e04 | yaptırmak → machen lassen | `de.g.lassen` |
| 170 | de.b1.e04 | kombi ist die Therme – ein Kombi ist ein Auto | §3.1 |
| 171 | de.b1.e04 | sigorta: Sicherung oder Versicherung | §3.1 |
| 172 | de.b1.e05 | gelen mesaj → die Nachricht, die kommt | `de.g.relativsatz-nom-akk` |
| 173 | de.b1.e05 | der, die, das als Relativpronomen nach dem Genus | `de.g.relativsatz-nom-akk` |
| 174 | de.b1.e05 | … mi? → ob … | `de.g.indirekte-frage` |
| 175 | de.b1.e05 | Passwort, Daten: Internationalismen mit Artikel | §3.3 |
| 176 | de.b1.e06 | Präposition vorn: in dem ich helfe | `de.g.relativsatz-dat-praep` |
| 177 | de.b1.e06 | -mek için → um … zu | `de.g.um-zu-damit` |
| 178 | de.b1.e06 | -sın diye → damit | `de.g.um-zu-damit` |
| 179 | de.b1.e06 | „wo“ nur für Orte | `de.g.relativsatz-dat-praep` |
| 180 | de.b1.e07 | Noten: Die 1 ist die beste | §4.6 |
| 181 | de.b1.e07 | lise ist die Oberstufe: Schulformen in Hessen | §4.6 |
| 182 | de.b1.e07 | -ecek → oft Präsens | `de.g.futur-1` |
| 183 | de.b1.e07 | -mesine rağmen → obwohl | `de.g.konzessiv` |
| 184 | de.b1.e07 | Elternabend: Lehrkräfte mit Sie und Familienname | §4.2 |
| 185 | de.b1.e08 | -mişti → hatte/war + Partizip | `de.g.plusquamperfekt` |
| 186 | de.b1.e08 | Bir bak! → Schau mal! | `de.g.modalpartikeln` |
| 187 | de.b1.e08 | doch, ja, eben: kleine Wörter, große Wirkung | `de.g.modalpartikeln` |
| 188 | de.b1.e08 | pansiyon und Pension | §3.1 |
| 189 | de.b1.e09 | arabanın rengi → die Farbe des Autos | `de.g.genitiv` |
| 190 | de.b1.e09 | wegen des oder wegen dem? | `de.g.genitiv` |
| 191 | de.b1.e09 | o kadar … ki → so … dass | `de.g.konsekutiv` |
| 192 | de.b1.e09 | otoban kommt aus dem Deutschen | §3.2 |
| 193 | de.b1.e10 | den Kollegen, dem Kunden: n-Deklination | `de.g.n-deklination` |
| 194 | de.b1.e10 | an Herrn Kaya | `de.g.n-deklination` |
| 195 | de.b1.e10 | Mit freundlichen Grüßen: Adjektiv ohne Artikel | `de.g.adj-dekl-ohne` |
| 196 | de.b1.e10 | Kritik im Team: sachlich und direkt | §4.4 |
| 197 | de.b1.e11 | -ilmeli → muss … werden | `de.g.passiv-praet-modal` |
| 198 | de.b1.e11 | doğranmış sebze → das geschnittene Gemüse | `de.g.partizip-adjektiv` |
| 199 | de.b1.e11 | tarif ist das Rezept, Tarif ist ein Preis | §3.1 |
| 200 | de.b1.e11 | menü und Speisekarte | §3.1 |
| 201 | de.b1.e11 | Eline sağlık → Das hat sehr gut geschmeckt! | §4.3 |
| 202 | de.b1.e12 | ödeme → die Zahlung: -ung ist immer „die“ | `de.g.wortbildung-nomen` |
| 203 | de.b1.e12 | das Ausfüllen: Infinitiv als Nomen | `de.g.wortbildung-nomen` |
| 204 | de.b1.e12 | Am Schalter: şalter kommt aus dem Deutschen | §3.2 |
| 205 | de.b1.e12 | Kurs: Lehrgang und Wechselkurs | §3.1 |
| 206 | de.b1.e13 | kapalı → ist geschlossen | `de.g.zustandspassiv` |
| 207 | de.b1.e13 | ist oder wird? | `de.g.zustandspassiv` |
| 208 | de.b1.e13 | Dilekçe und deutscher Brief: anderer Aufbau | §4.5 |
| 209 | de.b1.e13 | Fristen: bis zum 3. Mai, innerhalb von zwei Wochen | `de.g.temporale-praep` |
| 210 | de.b1.e14 | kablosuz → kabellos | `de.g.wortbildung-adjektiv` |
| 211 | de.b1.e14 | taşınabilir → tragbar | `de.g.wortbildung-adjektiv` |
| 212 | de.b1.e14 | -syon = -tion: Genus „die“ | §3.3 |
| 213 | de.b1.e14 | Ziffer ist nicht sıfır | §3.1 |
| 214 | de.b1.e15 | Vaktim olsa gelirdim → Wenn ich Zeit hätte, … | `de.g.konj2-irreal` |
| 215 | de.b1.e15 | Beide Teile im Konjunktiv | `de.g.konj2-irreal` |
| 216 | de.b1.e15 | enerji → die Energie: -ie ist „die“ | §3.3 |
| 217 | de.b1.e16 | hem … hem → sowohl … als auch | `de.g.zweiteilige-konnektoren` |
| 218 | de.b1.e16 | ne … ne → weder … noch (ohne nicht) | `de.g.zweiteilige-konnektoren` |
| 219 | de.b1.e16 | Behördenbriefe: durchgehend Sie | §4.1 |
| 220 | de.b2.e01 | -den sonra → nach + Dativ: Nominalstil | `de.g.nominalstil` |
| 221 | de.b2.e01 | Lebenslauf: tabellarisch, Foto freiwillig | §4.5 |
| 222 | de.b2.e01 | diploma ist nicht das Diplom | §3.1 |
| 223 | de.b2.e01 | Anschreiben: Sehr geehrte Frau … | §4.5 |
| 224 | de.b2.e02 | -se, şayet → falls; Sollten Sie … | `de.g.konditional-falls` |
| 225 | de.b2.e02 | prim: Prämie oder Beitrag? | §3.1 |
| 226 | de.b2.e02 | Kündigungsfrist: lange Wörter von hinten lesen | `de.g.wortbildung-komposita` |
| 227 | de.b2.e03 | gelir gelmez → sobald | `de.g.temporal-b2` |
| 228 | de.b2.e03 | -diği sürece → solange | `de.g.temporal-b2` |
| 229 | de.b2.e03 | -dikçe → sooft | `de.g.temporal-b2` |
| 230 | de.b2.e04 | iptal edilebilir → lässt sich kündigen | `de.g.passiversatz` |
| 231 | de.b2.e04 | ödenmesi gerekir → ist zu bezahlen | `de.g.passiversatz` |
| 232 | de.b2.e04 | -den dolayı → aufgrund + Genitiv | `de.g.praep-genitiv` |
| 233 | de.b2.e05 | -miş → Konjunktiv I: Das Produkt sei … | `de.g.konjunktiv-1` |
| 234 | de.b2.e05 | buna → darauf: da(r)-Wörter | `de.g.textverweise` |
| 235 | de.b2.e05 | magazin ist nicht das Magazin | §3.1 |
| 236 | de.b2.e06 | gitmeliydik → Wir hätten gehen sollen | `de.g.konj2-vergangenheit` |
| 237 | de.b2.e06 | yaşlılar → die Älteren | `de.g.adjektiv-nominalisiert` |
| 238 | de.b2.e06 | ambulans und Ambulanz | §3.1 |
| 239 | de.b2.e07 | -erek → indem | `de.g.modalsatz-indem` |
| 240 | de.b2.e07 | ne kadar … o kadar → je … desto | `de.g.je-desto` |
| 241 | de.b2.e07 | Wortstellung bei je … desto | `de.g.je-desto` |
| 242 | de.b2.e08 | karar vermek → eine Entscheidung treffen | `de.g.funktionsverbgefuege` |
| 243 | de.b2.e08 | başvuru yapmak → einen Antrag stellen | `de.g.funktionsverbgefuege` |
| 244 | de.b2.e08 | lisans ist der Bachelor, nicht die Lizenz | §3.1 |
| 245 | de.b2.e08 | vize: Visum, nicht Zwischenprüfung | §3.1 |
| 246 | de.b2.e09 | Wetzlar'da geliştirilen mercek → die in Wetzlar entwickelte Linse | `de.g.partizipialattribut` |
| 247 | de.b2.e09 | kaufen – verkaufen: Präfixe ändern die Bedeutung | `de.g.wortbildung-verben` |
| 248 | de.b2.e09 | überSETZen oder ÜBERsetzen? | `de.g.wortbildung-verben` |
| 249 | de.b2.e10 | gerçi … ama → zwar … aber | `de.g.konzessiv-b2` |
| 250 | de.b2.e10 | -se bile → selbst wenn | `de.g.konzessiv-b2` |
| 251 | de.b2.e10 | sigorta braucht zwei deutsche Wörter | §3.1 |
| 252 | de.b2.e11 | -mış gibi → als ob | `de.g.irrealer-vergleich` |
| 253 | de.b2.e11 | Mehrsprachig: Türkisch hilft beim Deutschen | §5 |
| 254 | de.b2.e11 | Sprachwechsel im Gespräch: eine Frage des Registers | §5 |
| 255 | de.b2.e12 | -miş olacak → wird … haben | `de.g.futur-2` |
| 256 | de.b2.e12 | Kim … -se → Wer …, der … | `de.g.relativ-wer-was` |
| 257 | de.b2.e12 | alles, was – nicht alles, das | `de.g.relativ-wer-was` |
| 258 | de.b2.e13 | ist gebaut worden – nicht geworden | `de.g.passiv-perfekt` |
| 259 | de.b2.e13 | olmalı → muss (Vermutung) | `de.g.modal-vermutung` |
| 260 | de.b2.e13 | sollen ist keine Vermutung | `de.g.modal-vermutung` |
| 261 | de.b2.e14 | oğlu … olan kadın → die Frau, deren Sohn … | `de.g.genitiv-relativ` |
| 262 | de.b2.e14 | dessen oder deren? | `de.g.genitiv-relativ` |
| 263 | de.b2.e14 | Richterin, Zeugin: -in auch vor Gericht | `de.g.wortbildung-in` |
| 264 | de.b2.e15 | -meden → ohne … zu | `de.g.statt-ohne` |
| 265 | de.b2.e15 | -mek yerine → statt … zu | `de.g.statt-ohne` |
| 266 | de.b2.e15 | Homeoffice, Software: Anglizismen mit Artikel | §3.3 |
| 267 | de.b2.e16 | -irken → während (Gegensatz) | `de.g.adversativ` |
| 268 | de.b2.e16 | bu da → was: …, was Murat ärgerte | `de.g.weiterfuehrender-nebensatz` |
| 269 | de.b2.e16 | reklam ist Werbung – eine Reklamation ist eine Beschwerde | §3.1 |
| 270 | de.c1.e01 | sağ ol / teşekkür ederim → Danke dir / Vielen Dank | `de.g.register` |
| 271 | de.c1.e01 | Umgangssprache und Standard bewusst wechseln | §5 |
| 272 | de.c1.e02 | acaba …? → Wäre es denkbar …? | `de.g.konj2-diplomatie` |
| 273 | de.c1.e02 | Yoksa …? → etwa: Haben Sie etwa …? | `de.g.modalpartikeln-c1` |
| 274 | de.c1.e03 | -e göre → laut oder zufolge | `de.g.redewiedergabe-text` |
| 275 | de.c1.e03 | Konjunktiv I und Indikativ im Bericht | `de.g.redewiedergabe-text` |
| 276 | de.c1.e04 | -meliydi → hätte … werden müssen | `de.g.passiv-c1` |
| 277 | de.c1.e04 | uyarınca → gemäß + Dativ | `de.g.gehobene-praep` |
| 278 | de.c1.e04 | pazarlık edilmez → Hier wird nicht verhandelt | `de.g.passiv-c1` |
| 279 | de.c1.e05 | -mış → soll: Es soll funktioniert haben | `de.g.subjektive-modalverben` |
| 280 | de.c1.e05 | -medikçe → es sei denn | `de.g.konnektoren-c1` |
| 281 | de.c1.e05 | bir yandan … öte yandan → einerseits … andererseits | `de.g.konnektoren-c1` |
| 282 | de.c1.e06 | gıda israfı → Lebensmittelverschwendung | `de.g.wortbildung-c1` |
| 283 | de.c1.e06 | -weise, -mäßig, -gerecht | `de.g.wortbildung-c1` |
| 284 | de.c1.e07 | Amtsdeutsch auflösen wie Amtstürkisch | `de.g.verbalisierung` |
| 285 | de.c1.e07 | Widerspruch: deutscher Aufbau statt Dilekçe-Form | §4.5 |
| 286 | de.c1.e08 | Wetzlar'a varınca → In Wetzlar angekommen, … | `de.g.partizipialkonstruktion` |
| 287 | de.c1.e08 | Ağaç yaşken eğilir ≈ Was Hänschen nicht lernt … | `de.g.idiomatik` |
| 288 | de.c1.e08 | kafam karıştı → Ich bin verwirrt | `de.g.idiomatik` |
| 289 | de.c1.e09 | pek … -me- → kaum | `de.g.negation-c1` |
| 290 | de.c1.e09 | önemsiz değil → nicht unwichtig | `de.g.negation-c1` |
| 291 | de.c1.e10 | Bu bağlamda → In diesem Zusammenhang + Verb | `de.g.textkohaesion` |
| 292 | de.c1.e10 | Protokoll: Infinitiv am Ende | `de.g.verkuerzung` |
| 293 | de.c1.e10 | TOP, ggf., z. B.: Abkürzungen der Sitzung | `de.g.verkuerzung` |
| 294 | de.c1.e11 | -meyecek kadar → zu …, als dass | `de.g.vergleich-c1` |
| 295 | de.c1.e11 | rant ist nicht die Rente | §3.1 |
| 296 | de.c1.e12 | Hervorheben: im Türkischen vor dem Verb, im Deutschen im Vorfeld | `de.g.satzgliedstellung` |
| 297 | de.c1.e12 | Ausklammerung im Gespräch | `de.g.satzgliedstellung` |
| 298 | de.c1.e13 | Genitivketten in umgekehrter Reihenfolge | `de.g.attribute-komplex` |
| 299 | de.c1.e13 | Lange Attribute wie türkische Partizipien lesen | `de.g.attribute-komplex` |
| 300 | de.c1.e14 | Rückblick: Perfekt, Präteritum, Plusquamperfekt im Wechsel | `de.g.praeteritum` |
| 301 | de.c1.e14 | usta und Meister: Abschlüsse im Handwerk | §3.4 |

## 7 Messwerte und Methode

| Messung | Wert | Quelle und Methode |
|---|---|---|
| Genus der häufigsten Nomen (Top-1.000 / 2.000 / 5.000 Lemmata) | f: 41,7 / 42,9 / 43,2 % · m: 37,9 / 38,6 / 40,1 % · n: 20,4 / 18,6 / 16,7 % (338 / 819 / 2.312 Nomen) | wordfreq 3.1.1 (de), lemmatisiert über den kaikki-Kernauszug; Lemma-Liste des Rahmenplans |
| Endung und Genus (Top-5.000-Nomen) | -ung 98,7 % f (226); -heit, -keit, -schaft 100 % f; -ion 96,5 % f; -tät 100 % f; -ie 100 % f (31); -ik 94,1 % f; -e 85,7 % f (421); -er 83,7 % m (246); -or 13 von 14 m; -ment 100 % n; -um 89,5 % n; -nis 81,2 % n | dto. |
| Tatoeba de↔tr: türkische Sätze mit var/yok | im deutschen Satz „haben“ 782, „es gibt“ 163, anders 437 | Tatoeba-Export vom 10.10.2026, Paare de↔tr (Beleg S7 §3.2) |
| Tatoeba: türkischer Satz beginnt mit „o“ | erstes deutsches Wort: er 395, sie 282, das 123, es 78 | dto. |
| Tatoeba: deutsche Sätze (ab 3 Wörtern) mit großgeschriebenem Wort im Satzinneren | 73,2 % von 22.573 | dto. |
| Internationalismen: Nomen mit türkischer Übersetzung und ähnlicher Schreibung | Top-1.000: 37 von 317 (11,7 %) · Top-2.000: 113 von 709 (15,9 %) · Top-5.000: 256 von 1.695 (15,1 %) | Übersetzungen aus de.wiktionary (kaikki); Ähnlichkeit ≥ 0,75 nach Angleichung der Schreibung (Schätzung) |
| Glossen in der Ausgangssprache (Top-1.000 / Top-5.000) | 90 % / 83 % | Beleg S7 §3.6 |

**Methode.**
- Gelesen wurden nur die S7-Auszüge im Scratchpad (`l0/S7/auszug/`: Häufigkeit, kaikki-Kern, Tatoeba) und die bereinigte Lemma-Liste des Rahmen-Generators (`l3-rahmen-de/bereinigt.json`), mit `python3 -I`.
- Skripte: `l3-kontrast-de/messen.py` und `l3-kontrast-de/messen_ar_intl.py`; Generator und Prüfungen: `l3-kontrast-de/bauen.py` (alle im Scratchpad der Sitzung, Übernahme nach `_lernapp/werkzeuge/` in L3).
- In dieses Dokument gelangen nur Zahlen, deutsche Wörter und Beispiele in Lateinschrift bzw. Umschrift; kein Tatoeba-Satz und kein Wiktionary-Text.
- Die Ähnlichkeitswerte sind Schätzungen über Schreibung bzw. Umschrift; sie zeigen die Größenordnung, nicht die genaue Zahl.

## 8 Zu prüfen und offene Fragen

Alle laufen mit ihrem Standard weiter (L3-E12, kein Warten).

| ID | Frage | Standard | Wer |
|---|---|---|---|
| KD-tr-01 | Notenskala in der Türkei: Ist „die höchste Zahl ist die beste“ für alle Schularten richtig? | Tipp nennt nur „umgekehrt als in Deutschland“, ohne Einzelheiten. | Stichprobe LM-01 |
| KD-tr-02 | Bedeutungen im heutigen Türkisch der Gemeinde: sofa (Diele, eher bei Älteren), grip (Umfang), kanepe, rapor (Krankschreibung), garaj (früher auch Busbahnhof). | Tipps zu sofa und garaj erst nach Bestätigung; übrige wie §3.1. | LM-01 |
| KD-tr-03 | Kommt „ihr“ als höfliche Anrede tatsächlich vor? | Tipp ohne Häufigkeitsangabe, als mögliche Verwechslung. | LM-01 |
| KD-tr-04 | Hinweis zum mehrmaligen Anbieten (§4.4) ohne Stereotyp formuliert? | Tipp beschreibt nur die deutsche Gewohnheit. | Redaktion, LM-09 |
| KD-tr-05 | Jugendsprache und Sprachwechsel als Tipp-Thema (§5.4)? | nur in B2-e11 und C1-e01, neutral als Register | LM-02, LM-09 |
| KD-tr-06 | Türkische Tipps mit deutschen Grammatikbegriffen in Klammern? | ja (§5.2) | LM-02 |
| KD-tr-07 | Türkische Buchstaben in deutschen Formularen und Systemen | Tipp: wie im Pass schreiben; Ersatz durch Behörden möglich (ohne Rechtsangabe) | LM-01 |
| KD-tr-08 | Deutsche Wörter im Türkischen der Gemeinde (§5.3) | Liste als Vorschlag; Stichprobe bestätigt | LM-01 |
| KD-tr-09 | Genus türkischer Speisewörter im Deutschen (der/das Börek, die/das Baklava) | Tipps nennen das Genus erst nach Wörterbuchprüfung in L3 | L3 |
| KD-tr-10 | Typische Fehler sind Erfahrungswerte, nicht gemessen. | Die Muttersprachler-Stichprobe und Meldungen aus der App (ADR 0041 Nr. 9) schärfen sie nach. | L3, LM-01 |

## 9 Herkunft und Prüfungen

- **Entwurf:** KI-Lauf `ki:l3-kontrast` am 20.10.2026 (L3-01, vorgezogen), auf Grundlage des Rahmenplans Deutsch und des Inhaltsleitfadens.
- **Eigene Darstellung:** Keine fremden Lehrwerke oder Kontrastgrammatiken übernommen; GER nur als Stufen (ADR 0045 Nr. 8, LM-36).
- **Automatische Prüfungen des Generators:**
  - alle 123 Grammatik-IDs des Rahmenplans genau einmal in §2
  - jeder Tipp auf einem gültigen Einheiten-Schlüssel; jede Einheit mit Tipp; Grammatik-Bezug nie vor seiner Einführung
  - Tabu-Lexikon des Leitfadens (de, tr, ar-Umschrift): 0 echte Treffer; Fehlalarme: „bier“ (de, Alkohol) in buchstabieren; Ausnahme fehlt im Leitfaden (3); „parti“ (tr, Politik) in Partizip und Partikel (39)
  - 0 arabische Zeichen (U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF)
- **Menschliche Prüfung:** Stichprobe der Muttersprachler (LM-01) mit den Punkten aus §8; Abnahme zusammen mit dem Rahmenplan (LM-02).
