# Kontrastdokument Türkisch aus Deutsch (`tr-aus-de`)

- **Stand:** 20.10.2026, Version 0.1.0-entwurf (L3-01, vorgezogen)
- **Status:** Entwurf. Er gilt als Standard für die kontrastiven Tipps, Ablenker und angenommenen Antworten der Richtung `tr-aus-de`, bis die Muttersprachler-Stichprobe (LM-01) und die Abnahme des Rahmens (LM-02) andere Ergebnisse bringen.
- **Zweck:** Grundlage für die Phase Ü (Übersetzung je Richtung) der Inhalts-Pipeline (PLAN §6.3) und für die ≈ 300 kontrastiven Tipps je Richtung (PLAN §5.1). Ablage nach PLAN §6.1.
- **Bezug:**
  - Rahmenplan Türkisch: `web/inhalte/lernapp/rahmen/tr.rahmen.json`, `RAHMEN-tr.md` (§4 Vorkurs, §5 Grammatikfolge, §10 offene Fragen OF-tr-01 bis OF-tr-14)
  - PLAN §4 (Übungstypen, `schrift_tr`, `minimalpaare`, Antwortabgleich §4.1), §5.1, §6.1–§6.4
  - KERN §2 (KI-Regel 2), §4 (Sprachausgabe), §5 (Kinderschutz), §7 (Oberfläche)
  - Inhaltsleitfaden `_lernapp/lehrplan/INHALTSLEITFADEN.md` (Tabu-Lexikon, Namen, Formel-Kandidaten §4.2, weltliche Alternativen §4.3)
  - Beleg S7 (`_lernapp/belege/S7-sprachdaten.md`), ADR 0041, ADR 0045 (Nr. 8: GER nur als Stufen)
- **Gegenstück:** `_lernapp/lehrplan/kontrast-tr-aus-ar.md`; Gegenrichtung `_lernapp/lehrplan/kontrast-de-aus-tr.md`
- **Umfang:** 109 Grammatik-IDs mit Kontrast (§2), 70 falsche und halbe Freunde (§3.1), 310 Tipp-Themen auf 74 Einheiten-Schlüssel (§6).

> **KI-Regel 2 (ADR 0040, KERN §2):** Keine Koranverse, Hadithe, Bittgebete oder anderen religiösen Texte (weder arabisch
> noch übersetzt), keine Koran-Wortbedeutungen, keine Fiqh-Aussagen. Der Sprachkurs ist ohne Religionsbezug. Religiöse Formeln
> gibt es nur aus einer später von zwei Gelehrten freigegebenen Liste; hier stehen sie nur als Verweis auf die gesperrten
> Kandidaten des Leitfadens (§4.7), nie als Lernziel. Arabische Wörter stehen nur in Umschrift.

**Lesart.**
- „Türkisch“ meint das Standardtürkische (Türkiye Türkçesi) in der Schreibung des Türkischen Sprachinstituts. Türkische Wörter stehen in türkischer Lateinschrift, deutsche Beispiele in normaler Schreibung.
- In der Spalte „typischer Fehler“ stehen fehlerhafte Formen in „…“. Sie sind Material für Ablenker und für den Abgleich (PLAN §4.1), nie Musterlösung.
- „Vertraut“ markiert eine Brücke: Das Deutsche kennt die Sache schon. Tipps nennen die Brücke zuerst.
- Aufgenommen sind nur Kontraste, die sicher sind. Was die Stichprobe bestätigen soll, trägt „zu prüfen“ und steht zusätzlich in §8.
- Die typischen Fehler sind Erfahrungswerte aus dem Unterricht des Türkischen als Fremd- und Herkunftssprache, noch nicht gemessen (§8, KT-de-12).

**Wer lernt.** Deutschsprachige jeden Alters: vor allem Kinder, Jugendliche und Erwachsene der zweiten und dritten Generation aus türkischsprachigen Familien, die Türkisch gut verstehen, aber wenig lesen und schreiben (§5). Dazu kommen Deutschsprachige ohne Vorwissen, etwa aus gemischten Familien, Freundeskreis oder Nachbarschaft, und Kinder aus arabischsprachigen Familien, die Deutsch als stärkste Sprache haben.

## 0 Kurzfassung

- **Schrift:** Die Lateinschrift ist bekannt, die Zuordnung von Buchstabe und Laut aber eine andere (c, ç, ş, z, s, y, j, v). Neu sind ı, İ und ğ. Der Leitsatz für alle Lesetipps: Türkisch schreibt fast lautgetreu, ein Buchstabe ist ein Laut.
- **Größte Hürden:** Vokalharmonie (kein Gegenstück), Endungen statt Präpositionen und Pronomen, das Verb am Satzende, das bestimmte Objekt mit -(y)i, Partizipien statt Relativsätzen (B1) und die Nominalformen der Nebensätze.
- **Starke Brücken:** Verb am Ende wie im deutschen Nebensatz, Komposita mit Kern hinten (okul bahçesi wie Schulhof), wo/wohin/woher, „seit“ mit Gegenwart, Plusquamperfekt (-mişti), Konjunktiv II (-seydi … -irdi), -miş wie „soll“ und Konjunktiv I, „lassen“ als Kausativ, Partizipialattribute und Nominalstil in C1, ö und ü, Abtönungspartikeln.
- **Fallen:** üç buçuk ist halb vier, nicht halb drei. Nach Zahlen steht der Singular. „Ich habe“ heißt „mein … ist da“ (var). Das „auch“ (de/da) wird getrennt geschrieben, die Ortsendung -de nicht. Es wird doppelt verneint (Kimse gelmedi).
- **Wortschatz:** Grob 7 bis 11 % der häufigen türkischen Nomen haben eine ähnlich geschriebene deutsche Glosse (Internationalismen, §3.3). Dazu kommen 70 falsche und halbe Freunde, etwa pasta (Torte), mağaza (Geschäft), klima (Klimaanlage) oder kayak (Skifahren).
- **Pragmatik:** siz entspricht Sie und ihr. Angeredet wird meist mit Vorname + Hanım/Bey; Bay oder Bayan + Familienname gehört in Briefe und Formulare. Viele Alltagsformeln haben keine deutsche Entsprechung (Kolay gelsin, Elinize sağlık, Geçmiş olsun). Religiöse Formeln bleiben gesperrt.
- **Herkunftssprachler:** Schwerpunkte sind Schreibung (ı/i, ğ, Sonderzeichen, de/da, ki, mi, Apostroph), Schriftsprache und Register, Wortschatz außerhalb der Familie und Nebensätze als Nominalformen (§5).
- **Tipps:** 310 Tipp-Themen, verteilt auf den Vorkurs `tr.v.l01`–`tr.v.l02` und alle 72 Einheiten (§6).

## 1 Laut und Schrift

### 1.1 Schrift und Rechtschreibung

Das Türkische schreibt fast lautgetreu: Jeder Buchstabe steht für einen Laut, jeder Laut hat einen Buchstaben. Das Alphabet hat 29 Buchstaben; q, w und x fehlen, dafür gibt es ç, ğ, ı, İ, ö, ş, ü. Der Vorkurs `tr.v.l01` führt die Unterschiede ein (`schrift_tr`, PLAN §4).

| Schreibung | Türkisch | Deutsch | typische Verwechslung | Beispiele |
|---|---|---|---|---|
| c | wie „dsch“ | k oder ts (in Fremdwörtern) | „can“ als „kan“ gelesen | can, cadde, ceket, acı |
| ç | wie „tsch“ | fehlt als Buchstabe | ç als c geschrieben, wenn die Tastatur es nicht hat | çay, çocuk, üç |
| ş | wie „sch“ | fehlt als Buchstabe | „sch“ in türkischen Wörtern („scheker“) | şeker, şehir, beş |
| s | immer stimmlos | vor Vokal oft stimmhaft | sabah mit weichem s gelesen | sabah, su, ses |
| z | stimmhaftes s | ts | „zaman“ mit ts gelesen | zaman, deniz, yüz |
| y | wie deutsches j | ü, i oder j | „yok“ mit ü gelesen | yol, yok, ayran |
| j | wie in „Journal“ (selten) | wie tr y | „jeton“ mit deutschem j | jeton, garaj, bej |
| v | wie w, oft weicher | meist wie f | „var“ mit f gelesen | var, ev, kova |
| h | immer gesprochen, auch nach Vokal | nach Vokal oft stumm (Dehnung) | „kahve“ ohne h | kahve, sabah, bahçe |
| ğ | kein eigener Laut: dehnt den Vokal davor, zwischen hellen Vokalen ein leichtes j; nie am Wortanfang | fehlt | als g gesprochen | dağ, oğul, değil, öğretmen |
| ı (I) | ungerundetes, hinteres i (§1.2) | fehlt | ı als i oder e geschrieben | kız, ılık, kırmızı |
| i (İ) | wie deutsches i; groß mit Punkt | großes I ohne Punkt | „Izmir“, „ISTANBUL“ statt İzmir, İSTANBUL | İzmir, İpek, iyi |
| ö, ü | wie im Deutschen | ö, ü | Vertraut | göz, gül, üç |
| Doppelkonsonant | lang gesprochen | zeigt nur einen kurzen Vokal | elli wie eli gesprochen | anne, elli, dikkat |
| â, î, û | Zirkumflex in wenigen Lehnwörtern: langer Vokal oder weiches k, g, l davor | fehlt | übersehen; der Abgleich nimmt ihn tolerant (PLAN §4.1) | kâğıt, hâlâ, dükkân |

**Groß- und Kleinschreibung.**
- Nomen werden kleingeschrieben (ev, okul); groß nur Satzanfang, Namen, Länder, Sprachen und Völker (Türkiye, Almanca, Türk kahvesi).
- Wochentage und Monate klein, außer in einem bestimmten Datum: pazartesi, aber 16 Ekim 2026 Cuma.
- Das Paar i/İ und ı/I: Deutsche Tastaturen und Programme machen aus i ein I und aus I ein i. Tipp: İ mit Punkt bewusst setzen; in der App ergänzt die Sonderzeichenleiste die fehlenden Buchstaben.

**Fünf Schreibregeln, die oft verwechselt werden** (Material für Tipps ab A1):

| Fall | Regel | Beispiel | typischer Fehler |
|---|---|---|---|
| de/da „auch“ | getrennt, mit Vokalharmonie, nie te/ta | Ben de geliyorum. Kitap da var. | „Bende geliyorum“, „Kitap ta“ |
| -de/-da Ort | angehängt, nach harten Konsonanten -te/-ta | evde, parkta | „ev de“, „parkda“ |
| mi Frage | getrennt, mit Harmonie; die Personalendung hängt daran | Geliyor musun? | „Geliyormusun?“ |
| ki „dass“ | getrennt; zusammen nur in festen Wörtern (sanki, belki, halbuki, oysaki) und als Endung -ki (masadaki) | Biliyorum ki zor. | „Biliyorumki“, „san ki“ |
| Apostroph | nur vor Endungen an Namen; nicht bei Ableitungen | Wetzlar'da, Elif'in; Wetzlarlı | „okul'da“, „Wetzlar'lı“ |

### 1.2 Laute

| Laut | Türkisch | Deutsch | Folge | Übung |
|---|---|---|---|---|
| ı | ungerundeter hinterer Vokal: Lippen breit wie bei i, Zunge hinten wie bei u | fehlt; am nächsten das unbetonte e in „bitte“ | ı wird zu i oder e: kır klingt wie kir | Minimalpaare (§1.3), `minimalpaare` |
| Vokalharmonie | helle Vokale (e, i, ö, ü) und dunkle (a, ı, o, u) folgen einander in Endungen | fehlt | Endungen falsch gewählt (evlar) | Vorkurs `tr.v.l02` als Hörbild |
| Vokallänge | in Erbwörtern alle Vokale kurz; lang nur durch ğ und in Lehnwörtern | Länge unterscheidet Wörter (Miete – Mitte) | türkische Vokale gedehnt („Meeerhaba“) | kurz und gleichmäßig sprechen |
| e | meist wie das kurze deutsche e; vor l, m, n, r am Silbenende offener, fast wie ä | geschlossenes e und offenes ä | – | Vertraut |
| r | Zungenspitzen-r; am Wortende oft gehaucht | Zäpfchen-r; nach Vokal oft vokalisiert | „bir“ klingt wie „bia“ | r am Silbenende sprechen: bir, var, yer |
| h | immer gesprochen | nach Vokal Dehnungszeichen | kahve ohne h | Vertraut am Silbenanfang |
| ğ | dehnt den Vokal (dağ = daa), zwischen hellen Vokalen leicht wie j (değil) | fehlt | ğ als g gesprochen | Lesen mit Silbenbögen |
| Doppelkonsonanten | lang (an-ne, el-li) | nicht lang | elli wie eli | Klatschen je Silbe |
| Knacklaut | fehlt; Wörter werden gebunden (bir elma wie bi-relma) | vor Vokal am Wortanfang | abgehackter Klang | Wortgruppen bindend sprechen |
| k, g, l | vor hellen Vokalen weiter vorn (kedi, gel), vor dunklen weiter hinten (kol, okul) | ähnlich bei k und g (Kiel – Kuh), nicht bei l | Feinheit, kein Lernziel | nur Hören |

### 1.3 Hörtraining-Paare

Paare nur aus dem Alltagswortschatz und ohne Wörter des Tabu-Lexikons (Leitfaden §2). Übungstyp `minimalpaare` (PLAN §4). Solange es für Türkisch keine zugelassene Stimme gibt, laufen die Paare als Lese- und Schreibübung; die Hörfassung kommt mit den eigenen Aufnahmen (KERN §4, „Audio folgt“).

| Kontrast | Paare | Einheit |
|---|---|---|
| ı und i | kır – kir (Land – Schmutz), dış – diş (außen – Zahn), kıl – kil (Haar – Ton) | tr.v.l01, A1-e02 |
| ı und u | sır – sur (Geheimnis – Stadtmauer), kırmak – kurmak (brechen – aufbauen) | tr.v.l01, A1-e06 |
| o und ö | on – ön (zehn – vorn), oda – öde (Zimmer – bezahle!), koy – köy (Bucht – Dorf) | tr.v.l01, A1-e04 |
| u und ü | un – ün (Mehl – Ruhm), uç – üç (Spitze – drei), sus – süs (sei still – Schmuck) | tr.v.l01, A1-e03 |
| s und z | sor – zor (frag! – schwer), saman – zaman (Stroh – Zeit), sil – zil (wisch! – Klingel), kas – kaz (Muskel – Gans) | tr.v.l01, A1-e02 |
| c und ç | cam – çam (Glas – Kiefer), acı – açı (bitter – Winkel), sac – saç (Blech – Haar) | tr.v.l01, A1-e07 |
| ş und s | şu – su (das da – Wasser), şiş – sis (Spieß – Nebel), kaş – kas (Augenbraue – Muskel) | tr.v.l01, A1-e10 |
| ğ und Kurzvokal | dağ – da (Berg – auch), yağ – ya (Öl – oder) | tr.v.l01, A1-e11 |
| einfacher und doppelter Konsonant | eli – elli (seine Hand – fünfzig) | tr.v.l02, A1-e03 |
| r am Wortende | yer – ye (Ort – iss!), der – de (sagt – sag!) | tr.v.l02, A1-e06 |
| Vokallänge im Lehnwort | hala – hâlâ (Tante – immer noch), kar – kâr (Schnee – Gewinn) | A2-e09, B2-e16 |
| Betonung | Ankara (vorn betont), evler – evlerde (Betonung wandert ans Ende) | tr.v.l02, A1-e05 |

### 1.4 Betonung, Rhythmus und Zahlen

- **Wortbetonung:** Meist auf der letzten Silbe; mit jeder Endung wandert sie mit (ev, evLER, evlerDE). Die Verneinung -me- und die Frage mi ziehen die Betonung davor (GELmedi, geliYOR mu). Viele Ortsnamen sind vorn betont (ANkara). Deutsche Sprecher betonen dagegen meist den Stamm und vorn.
- **Satzbetonung:** Das Wort direkt vor dem Verb trägt den Satzakzent (`tr.g.wortstellung`, `tr.g.fokus_devrik`).
- **Zahlen von 21 bis 99:** Türkisch nennt den Zehner zuerst (yirmi bir), wie die Ziffern geschrieben werden. Für Deutschsprachige ist das leichter als umgekehrt; beim Hören entstehen trotzdem Dreher, wenn man innerlich übersetzt.
- **Uhrzeit:** üç buçuk ist 3:30, also halb vier (`tr.g.uhrzeit`).

## 2 Grammatik-Kontraste je Grammatik-ID

Die Tabellen folgen der Grammatikfolge des Rahmenplans (`tr.rahmen.json`, 109 IDs). In Klammern steht die Einheit, die die ID einführt. „Vertraut“ markiert eine Brücke aus dem Deutschen als Ausgangssprache, die der Tipp zuerst nennt. Die typischen Fehler sind Erfahrungswerte und noch nicht gemessen (§8).

### 2.1 Überblick

| Kontrast | Deutsch | Türkisch | Folge für die Tipps |
|---|---|---|---|
| Wortstellung | Verb auf Platz 2 im Hauptsatz, am Ende im Nebensatz | Subjekt – Objekt – Verb; das Verb steht immer am Ende | Vertraut aus dem Nebensatz; Hauptsätze umbauen. |
| Artikel und Genus | drei Genera; der Artikel zeigt Genus und Fall | kein Genus, kein Artikel; bir heißt „ein“, die Bestimmtheit zeigt das Objekt (-i) | Entlastung; o heißt er, sie und es. |
| Fälle | vier, am Artikel sichtbar; Präpositionen vor dem Nomen | sechs Fälle als Endungen am Nomen, Verhältniswörter dahinter | Grundmuster: „Präposition vorn → Endung hinten“. |
| Wort oder Endung | eigene Wörter (mein, bin, kann, muss, nicht, wenn, mit) | Endungen am Wort (evim, öğrenciyim, gelebilirim, gelmeliyim, gelmiyorum, gelirse, otobüsle) | Grundmuster: „Wort → Endung“. |
| Vokalharmonie | fehlt | Endungen in zwei oder vier Formen | erst Hörbild (Vorkurs), dann Regel (A1-e02) |
| Attribut | Relativsatz nach dem Nomen; Partizipialattribut davor | Partizip vor dem Nomen (okuduğum kitap) | Vertraut aus deutschen Partizipialattributen; Relativsätze umbauen (B1). |
| Nebensätze | Bindewort + Verb am Ende | Nominalformen und Konverben vor dem Hauptsatz (-diğini, -ince, -erek) | „dass, als, indem“ wird zur Endung. |
| Pronomen | Pflicht | meist weggelassen; die Endung zeigt die Person | früh üben (A1-e01) |
| Quelle der Information | Wörter (anscheinend, soll) und Konjunktiv I | Endung -miş | Brücke ab A2, voll in B2 |

### 2.2 A1 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `tr.g.personalpron` (A1-e01) | Die Endung zeigt die Person, das Pronomen fällt meist weg. „o“ steht für er, sie und es; „siz“ ist zugleich Sie und ihr. | „Ben öğrenciyim. Ben Wetzlar'da oturuyorum. Ben on bir yaşındayım.“ (Pronomen in jedem Satz) · „sen“ zu einer fremden Erwachsenen | Das Pronomen steht nur, wenn es betont ist: Ben de! (Ich auch!). siz ist Sie und ihr in einem Wort, o ist er, sie und es. |
| `tr.g.kopula` (A1-e01) | „sein“ ist kein eigenes Wort, sondern eine Endung am Nomen oder Adjektiv; in der 3. Person fehlt sie meist. | „Ben öğrenci.“ (Endung fehlt) · „Ben var öğrenci.“ (Verb für „sein“ gesucht) | „Ich bin Schülerin“ wird ein Wort: Öğrenciyim. Die Endung ist das „bin“; in der 3. Person reicht das Nomen allein: O öğretmen. |
| `tr.g.vokalharmonie` (A1-e02) | Ohne Gegenstück im Deutschen: Endungen haben zwei oder vier Formen, je nach dem letzten Vokal des Wortes. | „evlar“, „okuller“, „kitapim“, „gözim“ | Der letzte Vokal entscheidet: nach e, i, ö, ü eine helle Endung, nach a, ı, o, u eine dunkle. Zweifach: -ler/-lar; vierfach: -im/-ım/-üm/-um. |
| `tr.g.bu_su_o` (A1-e02) | Drei Stufen der Nähe (bu, şu, o) statt „dies“ und „das“; mit Endung kommt ein n dazu (bunu, onda). Einen Artikel gibt es nicht. | „buyu“, „bu'yu“ · „onu kitap“ (onu vor einem Nomen; richtig: o kitabı) | bu = hier bei mir, şu = da (mit Zeigen), o = dort. Vor dem Nomen ohne Endung (bu kitap), allein mit n und Endung: bunu, şunda. |
| `tr.g.frage_mi` (A1-e02) | Ja-Nein-Fragen ohne Umstellung: Die Partikel mi steht hinter dem Erfragten, wird getrennt geschrieben, folgt aber der Vokalharmonie und trägt die Personalendung. | „Öğretmenmisin?“ (zusammengeschrieben) · „Misin öğretmen?“ (Umstellung wie im Deutschen) | Nichts umstellen: Aus dem Aussagesatz wird eine Frage, wenn mi hinter das Erfragte tritt. Getrennt schreiben, aber mit Harmonie: Öğretmen misiniz? |
| `tr.g.plural` (A1-e03) | Nach Zahlwörtern und Mengenwörtern (çok, birkaç) bleibt das Nomen im Singular; das Deutsche setzt den Plural. | „iki kardeşler“, „üç kitaplar“, „çok çocuklar“ | Die Zahl sagt schon „mehrere“: iki kardeş, beş elma. -ler nur ohne Zahlwort: Kardeşlerim geliyor. |
| `tr.g.zahlen` (A1-e03) | Türkisch nennt den Zehner vor dem Einer (yirmi bir), Deutsch umgekehrt (einundzwanzig). Das Alter steht mit yaşında. | „bir yirmi“ (deutsche Reihenfolge) · beim Hören 12 statt 21 · „Ben on bir yıl.“ | Türkisch zählt, wie man die Ziffern schreibt: yirmi bir = 2-1. Alter: On bir yaşındayım (wörtlich „ich bin im Alter von elf“). |
| `tr.g.degil` (A1-e03) | Nominalsätze verneint değil, Verben die Endung -me-; die Personalendung wandert an değil. | „Ben öğretmen yokum.“ · „Değil öğretmenim.“ · „Öğretmenmeyim.“ | Nomen und Adjektive verneint değil, mit Endung: öğretmen değilim. Das -me- gilt nur für Verben: gelmiyorum. |
| `tr.g.var_yok` (A1-e04) | Es gibt kein Verb „haben“. Besitz heißt „mein … ist vorhanden“: Besitzendung + var/yok. | „Ben bir kardeş var.“ · „Kardeşim var değil.“ | „Ich habe …“ = Bir kardeşim var. Verneint wird mit yok (Kardeşim yok), nie mit „var değil“. |
| `tr.g.possessiv` (A1-e04) | Besitz steht als Endung am Nomen (evim); benim davor ist nur Betonung und ersetzt die Endung nicht. | „benim ev“ (Endung fehlt) · „senin kitabım“ (Person passt nicht) | Das „mein“ ist eine Endung: evim, annem. benim davor betont nur: benim evim (mein Haus, nicht deins). |
| `tr.g.lokativ` (A1-e05) | in, an, auf, bei und zu Hause heißen alle -de/-da, hinter dem Wort; nach harten Konsonanten -te/-ta. | „parkda“, „sınıfda“ · „in ev“ (Präposition vorn) | Wo? → -de/-da am Wortende: evde (zu Hause), okulda (in der Schule). Nach p, ç, t, k, f, h, s, ş: parkta, sınıfta. |
| `tr.g.eigenname_apostroph` (A1-e05) | Endungen an Namen von Personen, Orten und Ländern stehen hinter einem Apostroph; das Deutsche kennt das nicht. | „Wetzlarda“, „Elifin“ · „okul'da“ (Apostroph am normalen Wort) | Nur bei Namen: Wetzlar'da, Elif'in, Türkiye'de. Bei normalen Wörtern nie: okulda. Ableitungen ohne Apostroph: Wetzlarlı. |
| `tr.g.fragewoerter` (A1-e05) | Das Fragewort steht dort, wo die Antwort stünde, meist direkt vor dem Verb. Vertraut: wo, wohin und woher sind getrennt (nerede, nereye, nereden). | „Nerede gidiyorsun?“ (wo statt wohin) · „Ne zaman geliyor sen?“ | nerede, nereye, nereden = wo, wohin, woher – wie im Deutschen. Das Fragewort rückt vor das Verb: Sen nerede oturuyorsun? |
| `tr.g.iyor` (A1-e06) | -iyor für das, was jetzt geschieht; nur der Vokal vor -yor wechselt. Stämme auf -a/-e verändern sich (anlamak → anlıyor). | „bekleyor“, „anlayor“, „geliyorım“ | -yor bleibt immer gleich, davor i, ı, u oder ü: geliyor, okuyor. Endet der Stamm auf -a/-e, wird daraus ı/i: anlıyor, bekliyor. |
| `tr.g.wortstellung` (A1-e06) | Subjekt – Objekt – Verb; das Verb steht am Ende. Vertraut aus dem deutschen Nebensatz. | „Elif gidiyor okula.“ (Verb in der Mitte) · „Ben gidiyorum her gün okula.“ | Wie im Nebensatz „…, dass Elif in die Schule geht“: Das Verb steht am Ende. Das Wichtigste steht direkt vor dem Verb. |
| `tr.g.akkusativ` (A1-e07) | Nur das bestimmte direkte Objekt bekommt -(y)i; das unbestimmte bleibt ohne Endung. Deutsch markiert den Fall am Artikel, nicht die Bestimmtheit. | „Bu elma alıyorum.“ (Endung fehlt) · „Elmayı alıyorum.“ für „Ich kaufe Äpfel“ | der/die/das + Objekt → -(y)i (Bu elmayı alıyorum); irgendein Objekt bleibt ohne Endung (Elma alıyorum). Namen und Pronomen bekommen immer -i: Elif'i, onu. |
| `tr.g.konsonant` (A1-e07) | p, ç, t, k am Wortende werden vor einem Vokal oft weich (b, c, d, ğ). Türkisch schreibt das, Deutsch nicht (Tag – Tage). | „kitapı“, „çocukun“, „ağaçı“ · „kitabda“ | Türkisch schreibt, wie man spricht: kitap – kitabı, çocuk – çocuğu, ağaç – ağacı. Einsilbige Wörter bleiben oft hart: top – topu, saç – saçı. |
| `tr.g.adjektiv` (A1-e05) | Das Adjektiv steht vor dem Nomen und bekommt nie eine Endung; „ein“ (bir) steht zwischen Adjektiv und Nomen. | „bir büyük ev“ (deutsche Stellung) · „büyükler evler“ | Keine Adjektivendungen: büyük ev, büyük evler. „ein großes Haus“ = büyük bir ev – bir rückt direkt vor das Nomen. |
| `tr.g.dativ` (A1-e08) | -(y)e/-(y)a für wohin? und an wen?; einige Verben verlangen einen anderen Fall als im Deutschen (sormak, binmek + -e). | „İzmir'de gidiyoruz.“ (wo statt wohin) · „Annemi soruyorum.“ (heißt: Ich frage nach meiner Mutter) | Wohin? und an wen? → -e/-a: okula, anneme. Achtung: Anneme soruyorum (ich frage meine Mutter), otobüse biniyorum (ich steige in den Bus). |
| `tr.g.ablativ` (A1-e08) | -den/-dan für woher? und von; nach harten Konsonanten -ten/-tan. Vertraut: Die drei Fragen wo, wohin, woher. | „Türkiye'dan“ (Harmonie) · „parkdan“ · „Ben Türkiye'de geliyorum.“ | Woher? → -den/-dan: Türkiye'den, okuldan; nach harten Konsonanten -ten/-tan: parktan. -de, -e, -den = wo, wohin, woher. |
| `tr.g.uhrzeit` (A1-e09) | Türkisch zählt die volle Stunde plus „halb“ (üç buçuk = 3:30), Deutsch nennt die kommende Stunde (halb vier). „um“ ist die Endung -de. | „dört buçuk“ für 3:30 (nach „halb vier“) · „saat üç'te“ | üç buçuk = halb vier: Türkisch nennt die Stunde, die schon begonnen hat. „um drei“ = saat üçte. |
| `tr.g.genitiv` (A1-e09) | Besitzer zuerst mit -(n)in, Besitz danach mit -(s)i; beide Wörter tragen eine Endung. Deutsch: „das Haus meiner Mutter“. | „evi annemin“ (deutsche Reihenfolge) · „annemin ev“ (zweite Endung fehlt) | Wie „Elifs Tasche“, nur mit zwei Endungen: Elif'in çantası, annemin evi. Der Besitzer steht immer vorn. |
| `tr.g.imperativ` (A1-e10) | Die du-Form ist der bloße Stamm, die Sie- und ihr-Form hat -(y)in; deutsche Schilder mit Infinitiv entsprechen der Form -(y)iniz. | „Gelmek!“ (Infinitiv als Befehl) · „Lütfen otur.“ zu einer fremden Erwachsenen | Gel! ist die du-Form, Gelin! die Sie-Form: Lütfen oturun. „Nicht berühren“ auf einem Schild heißt Dokunmayınız. |
| `tr.g.raum_postpos` (A1-e10) | Lagewörter (üst, alt, yan, ön, arka, iç) sind Nomen mit Besitz- und Ortsendung hinter dem Bezugswort; Deutsch nutzt Präpositionen davor. | „üstünde masa“ · „masanın üstde“ | Wörtlich „auf des Tisches Oberseite“: masanın üstünde. Erst das Bezugswort mit -in, dann das Lagewort mit Endungen. |
| `tr.g.ile` (A1-e11) | „mit“ steht hinter dem Nomen (ile) oder hängt sich an (-le/-la); ile verbindet auch zwei Nomen wie „und“. | „ile otobüs“ · „otobüsile“ | mit = ile hinter dem Nomen oder als Endung: otobüsle, annemle; nach Vokal mit y: arabayla. Elif ile Can = Elif und Can. |
| `tr.g.mek_istemek` (A1-e11) | „Ich möchte schwimmen“ = Infinitiv vor istemek; vertraut aus dem deutschen Nebensatz (…, dass ich schwimmen möchte). | „İstiyorum yüzmek.“ · „Yüzüyorum istiyorum.“ | Erst das Verb auf -mek, dann istemek: Yüzmek istiyorum. Dieselbe Reihenfolge wie im Nebensatz „…, dass ich schwimmen möchte“. |
| `tr.g.nominalkompositum` (A1-e12) | Zusammengesetzte Nomen haben wie im Deutschen den Kern hinten (Schulhof), aber der Kern trägt -(s)i. | „okul bahçe“ (Endung fehlt) · „bahçe okul“ | Wie „Schulhof“: Bestimmungswort vorn, Kern hinten mit -(s)i: okul bahçesi, baş ağrısı (Kopfschmerzen), otobüs durağı. |

### 2.3 A2 (26 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `tr.g.di` (A2-e01) | -di für selbst Erlebtes, nach harten Konsonanten -ti; die Person steht am Ende. Im Gespräch sagt das Deutsche dafür meist das Perfekt. | „gitdim“, „yapdın“ (Angleichung fehlt) · „ben gitti“ | „ich bin gegangen“ wird ein Wort: gittim. Nach p, ç, t, k, f, h, s, ş wird d zu t: gittim, yaptın, konuştuk. |
| `tr.g.idi` (A2-e01) | „war“ ist eine Endung am Nomen (-(y)di); „hatte“ heißt vardı. | „Dün evde oldum.“ (olmak heißt „werden“) · „Dün ben evde.“ (Endung fehlt) | war = Endung: evdeydim, güzeldi. hatte = vardı: Bisikletim vardı. olmak nur für „werden“. |
| `tr.g.uhrzeit_genau` (A2-e02) | „nach“ verlangt den Akkusativ + geçiyor, „vor“ den Dativ + var; zur Angabe „um“: geçe/kala. | „üç çeyrek geçiyor“ (Endung fehlt) · „üçü çeyrek var“ (Fall verwechselt) | Viertel nach drei = Üçü çeyrek geçiyor, Viertel vor vier = Dörde çeyrek var. Datum wie im Deutschen, aber ohne Punkt nach dem Tag: 16 Ekim 2026. |
| `tr.g.ordinal` (A2-e02) | Ordnungszahlen mit der Endung -(i)nci; „je zwei“ ist eine eigene Endung (-er/-şer). Vertraut: die Schreibung mit Punkt (3.). | „üçinci“ (Harmonie) · „her iki elma“ für „je zwei Äpfel“ | 3. liest man üçüncü, 2. ikinci. „je zwei“ = ikişer, „je fünf“ = beşer. |
| `tr.g.anrede` (A2-e02) | Höflichkeit über den Vornamen + Hanım/Bey; Bay/Bayan + Familienname gehört in Briefe und Formulare. | „Hanım Ayla“, „Bey Murat“ · „Bay Murat“ im Gespräch | Hanım und Bey stehen hinter dem Namen: Ayla Hanım, Murat Bey. Wo das Deutsche „Frau Becker“ sagt, geht auch Becker Hanım. |
| `tr.g.ecek` (A2-e03) | Zukunft mit -(y)ecek/-(y)acak; vor einer Endung mit Vokal wird k zu ğ. Gesprochen klingt es oft wie -icem. | „gelecekim“ · „gelecağım“ (Harmonie) · „gelicem“ in einem Brief | Vor Vokal wird k zu ğ: geleceğim, aber gelecek. Gesprochen gelicem, geschrieben geleceğim. |
| `tr.g.optativ` (A2-e03) | Vorschläge („Lass uns …“) und Angebote („Soll ich …?“) haben eigene Endungen: -(y)elim, -(y)eyim. | „Parka gidiyoruz mu?“ (für einen Vorschlag) · „Yardım edeceğim?“ (für ein Angebot) | „Lass uns gehen“ = Gidelim. „Soll ich helfen?“ = Yardım edeyim mi? – eine Form, für die das Deutsche zwei Wörter braucht. |
| `tr.g.aorist` (A2-e04) | Der Aorist steht für Gewohnheiten und Allgemeines; der Vokal bei einsilbigen Stämmen ist nicht vorhersagbar (gelir, aber yapar). | „yapır“, „gelerim“ · „içmezim“ (statt içmem) | Gewohnheit: Her sabah çay içerim. 13 häufige einsilbige Verben haben -ir (gelir, alır, bilir, olur, verir …), die übrigen -ar/-er. Verneint: içmem, içmez. |
| `tr.g.aorist_bitte` (A2-e04) | Höfliche Bitten sind Fragen im Aorist; vertraut als Funktion des deutschen „Würden Sie …?“. | „Tuzu ver!“ am Tisch (zu direkt) · „Tuzu veriyor musun?“ (fragt, ob jemand es gerade tut) | Wie „Würden Sie …?“: Pencereyi açar mısınız? Die -iyor-Frage fragt dagegen, was gerade geschieht. |
| `tr.g.komparativ` (A2-e05) | Kein -er am Adjektiv: daha + Adjektiv; das Verglichene steht im Ablativ vor dem Adjektiv. | „Elif daha küçük Can'dan.“ (deutsche Reihenfolge) · „ucuzer“ | billiger = daha ucuz, am billigsten = en ucuz. „kleiner als Can“ = Can'dan (daha) küçük: Das „als“ wird zur Endung -den vor dem Adjektiv. |
| `tr.g.gibi_kadar` (A2-e05) | gibi (wie) und kadar (so … wie, bis) stehen hinter dem Wort; Pronomen davor im Genitiv. | „gibi sen“ · „sen gibi“ | gibi und kadar folgen dem Wort, Pronomen im Genitiv: senin gibi, benim kadar. „bis zum Abend“ = akşama kadar (mit -e). |
| `tr.g.ebil` (A2-e06) | „können“ ist eine Endung im Verb; „nicht können“ hat eine eigene Kurzform (-eme-). | „gelmeyebilirim“ für „ich kann nicht kommen“ (heißt: vielleicht komme ich nicht) · „yüzmek yapabilirim“ | können = -ebil-: yüzebilirim. „nicht können“ = gelemem. gelmeyebilirim heißt „ich komme vielleicht nicht“. |
| `tr.g.mek_nomen` (A2-e06) | Der Infinitiv auf -mek wird wie ein Nomen gebraucht und bekommt Endungen; vor Vokal fällt das k. | „Yüzmek severim.“ (Akkusativ fehlt) · „yüzmeki“ | Wie „das Schwimmen“: yüzmeyi severim, yüzmeye gidiyoruz – das k fällt vor Vokal. Aber: yüzmekten. |
| `tr.g.meli_lazim` (A2-e07) | „müssen“ zweifach: -meli (eher „sollte“) und Infinitiv + Besitzendung + lazım/gerek (Notwendigkeit). | „Ben gitmek lazım.“ (Besitzendung fehlt) · „Gitmeliyim lazım.“ | „Ich muss gehen“ = Gitmem lazım (wörtlich „mein Gehen ist nötig“) oder Gitmeliyim. Dinlenmelisin = Du solltest dich ausruhen. |
| `tr.g.wortbildung1` (A2-e07) | Endungen ersetzen deutsche Wörter: -li (mit), -siz (ohne), -lik (Gegenstand, Ort), -ci (Beruf); alle mit Vokalharmonie. | „şekerlı“, „sütli“, „kitapçi“ | sütlü = mit Milch, şekersiz = ohne Zucker, gözlük = Brille, kitapçı = Buchhändlerin. Vertraut: wie -los oder -er im Deutschen. |
| `tr.g.postpos_kasus` (A2-e08) | Verhältniswörter stehen hinter dem Nomen und verlangen einen Fall; vertraut ist, dass sie den Fall bestimmen. | „sonra dersten“ · „ders sonra“ (Fall fehlt) · „ben için“ | Wie im Deutschen bestimmt das Verhältniswort den Fall, steht aber hinten: dersten sonra, bana göre, benim için. |
| `tr.g.mek_icin` (A2-e08) | „um … zu“ wird zu -mek için am Ende des Satzteils, der vor dem Hauptsatz steht. | „için öğrenmek Türkçe“ (deutsche Reihenfolge) · „Türkçe için öğrenmek“ | „um Türkisch zu lernen“ = Türkçe öğrenmek için. Der ganze Zweck steht vorn, için am Ende. |
| `tr.g.konjunktionen` (A2-e09) | ve, ama, çünkü wie im Deutschen; „auch“ (de/da) steht hinter dem Bezugswort und wird getrennt geschrieben; ne … ne nach der Schreibnorm mit bejahtem Verb (im Gespräch auch verneint). | „Bende geliyorum.“ (heißt „bei mir“) · „Kitap ta var.“ (de/da an den Konsonanten angeglichen) | de/da (auch) steht getrennt hinter dem Wort und wird nie zu te/ta: Ben de geliyorum, Kitap da var. Bei ne … ne bleibt das Verb in Texten bejaht: Ne çay ne kahve içerim. |
| `tr.g.kendi` (A2-e09) | kendi + Besitzendung = selbst/sich; das Deutsche hat „mich, dich, sich“, das Türkische eine Form je Person. | „Kendi iyi hissediyorum.“ · „Beni iyi hissediyorum.“ | kendi bekommt die Endung der Person: kendimi (mich), kendini (dich, sich), kendimizi (uns). kendi odam = mein eigenes Zimmer. |
| `tr.g.mis_grund` (A2-e10) | -miş für Vergangenes, das man nicht gesehen, sondern bemerkt oder erzählt bekommen hat; das Deutsche hat keine eigene Form. | „Kerem geldi.“ (wenn man es nur an der Jacke im Flur merkt) · -miş für Selbsterlebtes | -miş ist die Vergangenheit „mit Fragezeichen im Kopf“: Yağmur yağmış (es hat wohl geregnet, die Straße ist nass). Deutsch braucht dafür ein Wort: anscheinend, wohl. |
| `tr.g.iyordu` (A2-e11) | -iyordu für Handlungen, die gerade liefen; das Deutsche hat keine Verlaufsform. | „Ders çalıştım, telefon çaldı.“ (Hintergrund fehlt) · „çalışıyorduyum“ | Was lief, als etwas passierte: Yemek yiyorduk, telefon çaldı. Wie „Wir waren gerade beim Essen, als …“. |
| `tr.g.dir_dauer` (A2-e11) | „seit“ mit Gegenwart: vertraut, denn auch das Deutsche sagt „Wir wohnen seit zwei Jahren hier“. Dauer + -dir, Zeitpunkt + -den beri. | „İki yıldır burada oturduk.“ (Vergangenheit) · „sabahtır“ für „seit dem Morgen“ | Wie im Deutschen bleibt das Verb in der Gegenwart: İki yıldır burada oturuyoruz. Dauer mit -dir, Zeitpunkt mit -den beri: sabahtan beri. |
| `tr.g.ki_attribut` (A2-e12) | -ki macht aus Orts- und Zeitangaben ein Attribut vor dem Nomen; das Deutsche hängt die Angabe hinten an (das Buch auf dem Tisch). | „kitap masada“ als Attribut · „masadakı“ | Das Buch auf dem Tisch = masadaki kitap. -ki ändert sich nicht (masadaki, okuldaki); nur bugünkü und dünkü. |
| `tr.g.olmak_werden` (A2-e12) | „sein“ hat keine eigene Zukunfts- und Infinitivform; olmak springt ein und heißt zugleich „werden“. | „Yarın evde.“ (Zukunft fehlt) · „Doktor olacak istiyorum.“ | Yarın evde olacağım (ich werde zu Hause sein). Doktor olmak istiyorum (ich möchte Ärztin werden). |
| `tr.g.imperativ3` (A2-e13) | -sin für Aufforderungen an Dritte („er soll …“) und für feste Wünsche. | „Çocuklar beklemek.“ · „Geçmiş olacak.“ (Vorhersage statt Wunsch) | „Er soll warten“ = Beklesin. Viele Wünsche nutzen diese Form: Geçmiş olsun (Gute Besserung), Kolay gelsin. |
| `tr.g.zahlen_gross` (A2-e14) | Tausend heißt bin ohne bir; das Prozentzeichen steht vor der Zahl. Vertraut: Dezimalkomma und Tausenderpunkt. | „bir bin“ · „10%“ · „yüzde“ hinter der Zahl | bin iki yüz, nicht „bir bin“. %10 liest man yüzde on – Zeichen und Wort stehen vorn. |

### 2.4 B1 (22 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `tr.g.indefinit` (B1-e01) | Mit hiç kimse, hiçbir şey und hiç wird das Verb zusätzlich verneint; Deutsch verneint nur einmal. | „Kimse geldi.“ für „Niemand kam“ · „Hiçbir şey var.“ | Anders als im Deutschen doppelt verneinen: Kimse gelmedi (niemand kam), Hiçbir şey yok (nichts ist da), Hiç gitmedim (ich war nie dort). |
| `tr.g.zusammengesetzt` (B1-e01) | -mişti entspricht dem Plusquamperfekt; -ecekti (wollte gerade) und -erdi (pflegte zu) haben keine eigene deutsche Form. | „Biz geldiğimizde yemek bitti.“ (Vorzeitigkeit fehlt) · „Tam çıktım.“ für „Ich wollte gerade gehen“ | Vertraut: -mişti = Plusquamperfekt (yemek bitmişti). -ecekti = „wollte gerade“: Tam çıkacaktım. -erdi erzählt Gewohnheiten: Dedem bahçeye bakardı. |
| `tr.g.partizip_en` (B1-e02) | Relativsätze stehen als Partizip vor dem Nomen; Deutsch setzt den Relativsatz dahinter. | „çocuk ki kitap okuyor“ (deutscher Relativsatz nachgebaut) · „okuyan kitap çocuk“ | Der Relativsatz rückt vor das Nomen und endet auf -en: kitap okuyan çocuk. Vertraut: „das lesende Kind“. |
| `tr.g.partizip_dik` (B1-e03) | Ist das Nomen nicht der Handelnde, steht -dik + Besitzendung; die Endung zeigt, wer handelt. | „ben okuyan kitap“ · „okudum kitap“ | das Buch, das ich lese = okuduğum kitap; das du liest = okuduğun kitap. Die Zeit ergibt sich aus dem Zusammenhang. |
| `tr.g.partizip_ecek` (B1-e04) | Für Zukünftiges -(y)ecek mit Besitzendung (gideceğimiz şehir) oder ohne beim Handelnden (gelecek misafirler). | „gideceğiz şehir“ · „şehir ki gideceğiz“ | die Stadt, in die wir fahren werden = gideceğimiz şehir. Die Gäste, die morgen kommen = yarın gelecek misafirler. |
| `tr.g.konverb_ip` (B1-e04) | -(y)ip verbindet Handlungen mit gleichem Subjekt; Zeit und Person stehen nur am letzten Verb. | „Kalkıp ve pencereyi açtı.“ (ve doppelt) · „Kalkıptı, açtı.“ | Statt „stand auf und öffnete“: Kalkıp pencereyi açtı. ve fällt weg, Zeit und Person stehen nur am Schluss. |
| `tr.g.konverb_erek_meden` (B1-e05) | -(y)erek sagt, wie etwas geschieht; -meden heißt „ohne zu“ (und „bevor“). | „Yürümek gidiyoruz.“ · „Düşünmek olmadan cevap verme.“ (deutsches „ohne zu“ nachgebaut) | Wie? → -erek: yürüyerek (zu Fuß), gülerek (lachend). „ohne zu überlegen“ ist ein Wort: düşünmeden. |
| `tr.g.bedingung_se` (B1-e06) | „wenn“ ist eine Endung am Verb des Nebensatzes (Aorist + -se); eğer am Anfang ist erlaubt, ersetzt die Endung aber nicht. | „Eğer yağmur yağar, evde kalırız.“ (Endung fehlt) · „Yağmur yağarsa ki …“ | „Wenn es regnet“ = Yağmur yağarsa. Bei Nomen: Vaktin varsa (wenn du Zeit hast). eğer darf davor stehen, ersetzt die Endung aber nie. |
| `tr.g.konverb_ince` (B1-e07) | -(y)ince für „sobald, als“; ne zaman ist nur das Fragewort „wann?“. | „Ne zaman eve geliyorum, ararım.“ (Fragewort als „wenn“) | „Sobald ich nach Hause komme“ = Eve gelince – eine Endung statt eines Nebensatzes. |
| `tr.g.temporal_dik` (B1-e07) | „nachdem“ = -dikten sonra, „bevor“ = -meden önce (sieht verneint aus), „als“ = -diği zaman/-diğinde. | „Yattıktan önce“ · „Yatmak önce“ | „bevor“ sieht verneint aus, ist es aber nicht: yatmadan önce. „nachdem“: yedikten sonra. „als er kam“: geldiğinde. |
| `tr.g.nominal_dik` (B1-e08) | dass-Sätze werden zu Nomen mit Besitzendung (wer?) und Fall (welche Rolle?): geldiğini biliyorum. | „Onun hasta olduğu biliyorum.“ (Akkusativ fehlt) · „Biliyorum, dass hasta.“ | „Ich weiß, dass sie krank ist“ = Hasta olduğunu biliyorum. Für Zukünftiges -eceğini: Geç kalacağını söyledi. |
| `tr.g.soru_dolayli` (B1-e08) | Indirekte Fragen werden ebenfalls Nomen: Fragewort + -diğini vor dem Verb; „ob“ = -ip -mediğini. | „Bilmiyorum nerede o.“ · „Bilmiyorum, ob geliyor.“ | „Ich weiß nicht, wo sie ist“ = Nerede olduğunu bilmiyorum. „ob er kommt“ = gelip gelmediğini. |
| `tr.g.kausal_dik` (B1-e09) | „weil“ zweifach: çünkü (wie „denn“, nach dem Hauptsatz) oder -diği için vor dem Hauptsatz. | „Çünkü hasta, gelmedi.“ · „Hasta olduğu çünkü …“ | Gelmedi, çünkü hastaydı (wie „denn“). Oder als Nomen davor: Hasta olduğu için gelmedi. |
| `tr.g.konverb_ken` (B1-e09) | -(y)ken für „während, als“; die Endung ändert sich nie. | „yaparkan“, „çocukkan“ | -ken bleibt gleich: yaparken, yürürken. „Als ich ein Kind war“ ist ein Wort: Çocukken. |
| `tr.g.bedingung_wunsch` (B1-e10) | Wünsche mit keşke + -se; vorsichtige Vorschläge mit -sek mi? | „Keşke yaz gelir.“ · „Keşke yaz gelecek.“ | Nach keşke steht immer -se: Keşke yaz gelse (wäre doch schon Sommer). Vorschlag: Biraz erken çıksak mı? |
| `tr.g.mesi_nominal` (B1-e11) | Wünsche und Pflichten für andere: -me + Besitzendung + Fall; das Deutsche nutzt „dass“ oder „zu“. | „Ben senin gelmek istiyorum.“ · „İstiyorum, sen gelirsin.“ | „Ich möchte, dass du kommst“ = Gelmeni istiyorum. „Sie müssen das Formular ausfüllen“ = Formu doldurmanız gerekiyor. |
| `tr.g.diye` (B1-e12) | diye steht hinter einem Zitat vor dem Redeverb; mit Wunschform drückt es einen Zweck aus. | „Dedi: geliyorum diye.“ (doppelt) · „diye“ vor dem Zitat | Zitat, dann diye, dann das Verb: „Geliyorum“ diye seslendi. Zweck: Geç kalmayayım diye erken çıktım (damit ich nicht zu spät komme). |
| `tr.g.konverb_dikce` (B1-e13) | „je … desto“ und „immer wenn“ trägt die Endung -dikçe allein. | „Okuyunca öğreniyorsun.“ (heißt „wenn du liest“) · „ne kadar … o kadar“ in jedem Satz | „Je mehr du liest, desto mehr lernst du“ = Okudukça öğrenirsin. |
| `tr.g.ise_nominal` (B1-e13) | ise stellt gegenüber (was … betrifft); yoksa heißt „sonst“ und in Fragen „etwa?“. | „Ben ise ben evde kaldım.“ · „Acele et, değilse geç kalırız.“ | Elif ise evde kaldı = Elif dagegen blieb zu Hause. „sonst“ = yoksa: Acele et, yoksa geç kalırız. |
| `tr.g.bedingung_irreal` (B1-e14) | „hätte … würde“: -seydi im wenn-Teil, -irdi im Hauptsatz; vertraut ist der Gedanke des Konjunktivs II. | „Bilseydim gelirim.“ (Hauptsatz ohne -di) · „Eğer bildim, geldim.“ (Bedingung als Aussage) | Wie der Konjunktiv II mit zwei festen Bausteinen: Bilseydim gelirdim (hätte ich es gewusst, wäre ich gekommen). |
| `tr.g.ki_konj` (B1-e15) | ki nach Verben des Sagens und Denkens wirkt wie „dass“ mit normaler Satzstellung; getrennt geschrieben (außer in festen Wörtern wie sanki, halbuki). | „Biliyorumki zor.“ · „sanki“ getrennt: „san ki“ | ki wie „dass“: Biliyorum ki zor. Getrennt schreiben; zusammen nur in festen Wörtern: sanki, halbuki, oysaki, belki. |
| `tr.g.fokus_soru` (B1-e16) | Die Stellung von mi zeigt den Fokus der Frage; das Deutsche betont dafür nur mit der Stimme. | „Sen geldin mi?“ für „Warst du es, der kam?“ | mi hinter das Wort, nach dem man fragt: Sen mi geldin? Dün mü geldiniz? Geldiniz mi? |

### 2.5 B2 (20 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `tr.g.evidential` (B2-e01) | -miş auch an Nomen und Zeitformen (hastaymış, -iyormuş, -ecekmiş) für Gehörtes und Erschlossenes; vertraut aus „soll“ und dem Konjunktiv I. | „Selin hasta.“ beim Weitererzählen · „hastamış“ (y fehlt) | Wie „Selin soll krank sein“ oder „sie sei krank“: Selin hastaymış. Wetterberichte und Nachrichten nutzen oft -mış: Yarın kar yağacakmış. |
| `tr.g.rede_formal` (B2-e01) | Berichtete Rede mit Redeverb + -diğini/-eceğini; vertraut aus dem Konjunktiv I in deutschen Nachrichten. | „Belediye açıkladı ki yol yarın açılacak.“ (umgangssprachlich) · Redeverb vorn | „Die Stadt teilte mit, die Straße werde morgen geöffnet“ = Belediye yolun yarın açılacağını açıkladı. Das Redeverb steht am Ende. |
| `tr.g.passiv` (B2-e02) | Passiv ist eine Endung (-il, nach Vokal und l -n/-in); das unpersönliche Passiv steht oft für das deutsche „man“. | „Bu ev yapıldı babam tarafından.“ (Stellung) · „okunıldı“ | yapmak → yapılmak, okumak → okunmak; der Handelnde steht mit tarafından vor dem Verb. „Hier spricht man nicht laut“ = Burada yüksek sesle konuşulmaz. |
| `tr.g.kausativ` (B2-e03) | „lassen“ ist eine Endung (-dir, -t, -ir); vertraut ist die Bedeutung. | „Saçımı kestim.“ (heißt: ich habe sie mir selbst geschnitten) · „Arabayı tamir yaptım.“ | „schneiden lassen“ = kestirmek, „machen lassen“ = yaptırmak: Mutfağı yeniden yaptırdık. Arabayı tamir ettirdim. |
| `tr.g.reflexiv_reziprok` (B2-e04) | „sich“ steckt oft im Verbstamm: -in (sich waschen) und -iş (einander). | „Kendimi yıkıyorum.“ (möglich, aber unüblich) · „Görelim.“ für „Wir sehen uns“ | „sich waschen“ = yıkanmak, „sich treffen“ = görüşmek. Görüşürüz ist „Bis bald“. |
| `tr.g.modal_vermutung` (B2-e04) | Vermutungen mit -ebilir (könnte), -miş olmalı (muss wohl), -iyor olabilir; -meli allein ist ein Rat. | „Yolda kalmalılar.“ (heißt: Sie sollten unterwegs bleiben) | „Sie müssen wohl liegen geblieben sein“ = Yolda kalmış olmalılar. „Sie arbeitet vielleicht gerade“ = Çalışıyor olabilir. |
| `tr.g.konzessiv` (B2-e05) | „obwohl“ als Nominalform mit rağmen oder -diği halde; „auch wenn“ = -se de. | „Rağmen yorgun, yardım etti.“ · „Yorgun olmasına rağmen ama …“ | „obwohl sie müde war“ = yorgun olmasına rağmen. „auch wenn wir zu spät kommen“ = geç kalsak da. |
| `tr.g.kausal_formal` (B2-e06) | Begründungen im Schriftstil mit Wertung: sayesinde (dank, gut), yüzünden (wegen, schlecht), neutral nedeniyle, -den dolayı. | „Kar sayesinde okul kapalı.“ (positive Wertung bei Schlechtem) | sayesinde = dank (gut), yüzünden = wegen (schlecht); neutral und amtlich: bakım çalışması nedeniyle. |
| `tr.g.bedingung_formal` (B2-e06) | Amtliche Bedingungen mit festen Bausteinen (-diği takdirde, -mediği sürece, -mek şartıyla). | „Belge eksik olursa takdirde“ · „-mek şartla“ | Wie „sofern“ und „solange nicht“: Belge eksik olduğu takdirde …, İzin alınmadığı sürece … Feste Bausteine ganz lernen. |
| `tr.g.wortbildung2` (B2-e07) | Viele deutsche Adjektive auf -lich, -isch entsprechen -sel/-sal; „werden“ steckt in -leş/-len; -imsi heißt „-lich“ bei Farben. | „bilimli“ für „wissenschaftlich“ · „yeşilce“ für „grünlich“ | bilimsel = wissenschaftlich, çevresel = umweltbezogen; güzelleşmek = schöner werden; yeşilimsi = grünlich. |
| `tr.g.final_formal` (B2-e08) | Förmliche Zweckangaben: amacıyla, -mek üzere, -mesi için, -sin diye; -mek üzere heißt auch „im Begriff sein“. | „amacıyla“ am Satzanfang · „Tren kalkmak için“ für „Der Zug fährt gleich ab“ | amacıyla und -mek üzere sind die förmlichen Geschwister von -mek için. Tren kalkmak üzere = Der Zug fährt gleich ab. |
| `tr.g.diathese_kombi` (B2-e09) | Mehrere Endungen am Verb (lassen + Passiv); die Reihenfolge ist fest. | „yapılttırıldı“ · „yaptırılttı“ | Von innen nach außen lesen: yap-tır-ıl-dı = machen – lassen – Passiv – Vergangenheit: „wurde (im Auftrag) gebaut“. |
| `tr.g.zeitfolge_er_mez` (B2-e10) | „sobald“ = Aorist bejaht + verneint (gelir gelmez); „bis“ = -(y)ene kadar ohne Verneinung; „seit“ = -(y)eli. | „Toplantı bitmeyene kadar bekledik.“ (gesprochen verbreitet, in Texten zu vermeiden) · „Gelir gelmedi.“ | Eve gelir gelmez aradı (sobald). Toplantı bitene kadar bekledik (bis). Buraya taşınalı iki yıl oldu (seit). |
| `tr.g.dir_vermutung` (B2-e11) | -dir ist in Texten eine Feststellung, im Gespräch eine Vermutung; vertraut aus dem deutschen Futur II. | „-dir“ in jedem gesprochenen Satz (klingt wie ein Amtsbrief) · „Ben yorgunumdur.“ als Aussage über sich | Wie „Sie werden wohl schon angekommen sein“: Varmışlardır. In Verträgen ist -dir sachlich: Kiracı … ödemekle yükümlüdür. |
| `tr.g.verdoppelung` (B2-e12) | Verdoppelung und verstärkte Adjektive haben kein deutsches Gegenstück; die m-Doppelung ist locker. | „mamavi“, „bembeyez“ · „kitap mitap“ in einem Brief | Verstärkte Farben als Wort lernen: masmavi, bembeyaz, kıpkırmızı. yavaş yavaş = ganz langsam. Çay may gehört ins Gespräch. |
| `tr.g.mis_gibi` (B2-e13) | „als ob“ = -miş gibi oder sanki; das Deutsche braucht den Konjunktiv II. | „Hiçbir şey olmadı gibi davrandı.“ · „Sanki ki …“ | „als ob nichts passiert wäre“ = hiçbir şey olmamış gibi. sanki steht vorn: Sanki yıllardır tanışıyoruz. |
| `tr.g.konnektoren_b2` (B2-e13) | Verbindungswörter mit feiner Wertung: oysa/halbuki (dabei doch), madem (da ja), üstelik (außerdem), yine de (trotzdem). | „Madem vaktin varsa“ (Bedingung doppelt) · „Yine de ama …“ | madem = „wenn schon“, mit Tatsache: Madem vaktin var, yardım et. oysa = „dabei hatte sie doch …“. |
| `tr.g.aspekt_iver` (B2-e14) | Hilfsverben am Stamm färben die Handlung (-iver mal eben, -edur weiter, -eyaz beinahe); im Deutschen leisten das Partikeln. | „Ver ver!“ für „Gib mal eben!“ | -iver ist das deutsche „mal eben“: Şunu bana veriver. „Fast wäre ich gefallen“ = Düşeyazdım (im Gespräch: Az kalsın düşüyordum). |
| `tr.g.statistik` (B2-e15) | Anteile mit Genitiv + Besitzendung: gençlerin yüzde altmışı; „jeder Dritte“ = her üç kişiden biri. | „yüzde altmış gençler“ · „her üçüncü kişi“ | „60 % der Jugendlichen“ = gençlerin yüzde altmışı: Genitiv vorn, Besitzendung am Anteil. |
| `tr.g.praeferenz` (B2-e16) | „lieber … als“ und „statt“ mit -mektense, -mek yerine, -eceğine; das Verworfene steht vorn. | „Yürüyelim beklemekten daha.“ (Vergleich nachgebaut) | „Lass uns lieber gehen als warten“ = Beklemektense yürüyelim. „statt Auto“ = araba yerine. |

### 2.6 C1 (14 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `tr.g.nominalstil` (C1-e01) | Verdichtung mit Nominalformen; vertraut aus dem deutschen Nominal- und Amtsstil. | „Proje zamanında tamamlanması“ (Genitiv fehlt) | Vertraut: „die rechtzeitige Fertigstellung des Projekts“ = projenin zamanında tamamlanması. Genitiv am Bezugswort nicht vergessen. |
| `tr.g.amtsstil` (C1-e02) | Schriftformen -mekte, -mıştır, -ılmaktadır in Bescheiden; im Gespräch klingen sie steif. | „Başvurunuz incelenmektedir.“ unter Freunden · „incelemektedir“ (Passiv fehlt) | -mektedir ist die Schriftform von -iyor: Başvurunuz incelenmektedir = Ihr Antrag wird geprüft. Im Gespräch: inceleniyor. |
| `tr.g.partizip_komplex` (C1-e03) | Lange Attribute vor dem Nomen; vertraut aus deutschen Partizipialattributen. | Bezug falsch zugeordnet · „kütüphane geçen yıl açılmış olan“ | „die im letzten Jahr eröffnete Bibliothek“ hat dieselbe Reihenfolge wie geçen yıl açılmış olan kütüphane. Vom Nomen aus rückwärts lesen. |
| `tr.g.umgangssprache` (C1-e04) | Gesprochene Kurzformen (geliyom, napıyosun, n'aber) weichen stark von der Schrift ab. | „napıyosun“ in einer E-Mail an die Schule · Kurzform nicht erkannt | Gesprochen geliyom, geschrieben geliyorum – wie „Haste Zeit?“ im Deutschen: verstehen ja, in Briefen und Prüfungen nein. |
| `tr.g.redewendungen` (C1-e05) | Bildhafte Wendungen lassen sich selten wörtlich übertragen; einige Bilder teilen beide Sprachen. | „Sadece istasyon anlıyorum.“ (deutsche Wendung wörtlich) | Gleiches Bild: göz yummak = ein Auge zudrücken. Anderes Bild: kulak vermek (zuhören), eli kulağında (steht kurz bevor). |
| `tr.g.textkonnektoren` (C1-e06) | Absätze werden mit eigenen Verknüpfern verbunden; Satzketten mit ve wirken wie „Und dann … und dann“. | „Ve sonra … ve sonra …“ im Bericht | öte yandan = andererseits, dolayısıyla = folglich, bununla birlikte = dennoch, sonuç olarak = zusammenfassend. |
| `tr.g.argumentation` (C1-e07) | Stellung nehmen mit kanımca, bence, açıkçası; „zwar … aber“ = -mekle birlikte; „hinsichtlich“ = bakımından. | „Bence, kanımca …“ (doppelt) · „çevre için bakımından“ | kanımca = meines Erachtens; pahalı olmakla birlikte faydalı (zwar teuer, aber nützlich); çevre bakımından (hinsichtlich der Umwelt). |
| `tr.g.suspendierte_endung` (C1-e08) | In Reihungen trägt oft nur das letzte Wort die gemeinsame Endung; das Deutsche flektiert jedes Glied. | „öğretmenlerle ve öğrencilerle“ (nicht falsch, aber schwerfällig) | Eine Endung für die ganze Reihe: öğretmen ve öğrencilerle. In Bescheiden: Metin okunmuş ve onaylanmıştır. |
| `tr.g.hoeflichkeit_strategien` (C1-e09) | Indirekte Bitten mit acaba, -ebilir misiniz, -sek nasıl olur; vertraut aus dem Konjunktiv II im Deutschen. | „Bu yanlış.“ als einzige Rückmeldung · Höflichkeit nur mit lütfen | Wie „Könnten Sie vielleicht …?“: Acaba bir bakabilir misiniz? Kritik weich beginnen: Sanırım küçük bir yanlışlık olmuş. |
| `tr.g.sprichwoerter` (C1-e10) | Sprichwörter (atasözleri) haben oft ein deutsches Gegenstück mit anderem Bild. | deutsches Sprichwort wörtlich übertragen · Sprichwort ohne Anlass | Ağaç yaşken eğilir ≈ Was Hänschen nicht lernt, lernt Hans nimmermehr. Damlaya damlaya göl olur ≈ Viele Wenig machen ein Viel. |
| `tr.g.zarf_cesine` (C1-e10) | -cesine/-mışçasına ist die gehobene Form von „als ob“; im Gespräch genügt gibi. | „koşarcesine“ (Harmonie) · -cesine im Gespräch | Koşarcasına yürüdü = er ging fast im Laufschritt. Im Alltag: Koşar gibi yürüdü. |
| `tr.g.lehnmuster` (C1-e11) | Wörter arabischer und persischer Herkunft bilden Familien mit eigenen Endungen (-en/-an, -î); für Deutschsprachige ohne Brücke. | „tamam olarak“ für „vollständig“ · Wortfamilie nicht erkannt (hukuk – hukuki) | Familien lernen: hukuk (Recht) – hukuki (rechtlich), resmî (amtlich). Adverbien auf -en: tamamen (vollständig), nispeten (verhältnismäßig). |
| `tr.g.fokus_devrik` (C1-e12) | Betont ist, was direkt vor dem Verb steht; nachgestellte Satzglieder (devrik cümle) gehören ins Gespräch. | „Gidiyorum ben okula.“ in einem Text | Bunu ben söylemedim (das habe nicht ICH gesagt). Gidiyorum ben – typisch fürs Gespräch, nicht für Texte. |
| `tr.g.partikel_nuancen` (C1-e13) | da/de, ki, ya, bile, işte, hani färben den Satz wie deutsche Abtönungspartikeln (doch, ja, eben, sogar). | Partikeln fehlen, der Satz wirkt schroff · „Bile ben anladım.“ (bile vorn) | Vertraut: wie doch, ja, eben. Hani bana söz vermiştin? (Du hattest es mir doch versprochen?) Ben bile anladım (sogar ich). |

## 3 Wortschatz

### 3.1 Falsche Freunde

Ähnlich klingende oder geschriebene Wörter mit anderer Bedeutung. „teilweise“ heißt: Die Bedeutungen überschneiden sich nur zum Teil. Die Einheit nennt den ersten passenden Ort für einen Tipp.

| Türkisch | Bedeutung | erinnert an | das deutsche Wort heißt auf Türkisch | Art | Einheit |
|---|---|---|---|---|---|
| pasta | Torte, Sahnekuchen | Pasta (Nudeln) | makarna | falsch | A1-e10 |
| kek | Rührkuchen | Keks | bisküvi | falsch | A1-e10 |
| bisküvi | Keks | Biskuit (Teig) | pandispanya | falsch | A1-e10 |
| tas | Schale, Napf | Tasse | fincan | falsch | A1-e10 |
| tost | warmes, getoastetes Sandwich | Toast (Toastbrot) | tost ekmeği | teilweise | A1-e10 |
| şeker | Zucker; Bonbon | Zucker | şeker | teilweise | A1-e10 |
| biber | Paprika; Pfeffer (karabiber) | Biber (Tier) | kunduz | falsch | A1-e07 |
| erik | Pflaume | Erik (Vorname) | – | falsch | A1-e07 |
| market | Lebensmittelladen, Supermarkt | Markt (Wochenmarkt) | pazar | teilweise | A1-e07 |
| pazar | Markt; Sonntag | Basar | çarşı, pazar | teilweise | A1-e07 |
| fiş | Kassenbon; Stecker | Fisch | balık | falsch | A1-e07 |
| kasa | Kasse; Tresor; Kiste (bir kasa domates) | Kasse | kasa | teilweise | A1-e07 |
| büfe | Kiosk, Imbissstand; auch Anrichte und Büfett | Büfett | açık büfe (Selbstbedienung) | teilweise | A1-e05 |
| köşk | Villa, Pavillon | Kiosk | büfe | falsch | A1-e05 |
| salon | Wohnzimmer; Saal | Salon (Friseursalon) | kuaför salonu | teilweise | A1-e04 |
| kanepe | Sofa; auch belegtes Häppchen | Kanapee | kanepe | teilweise | A1-e04 |
| komodin | Nachttisch | Kommode | şifonyer | falsch | A1-e04 |
| gardırop | Kleiderschrank | Garderobe | vestiyer, portmanto | falsch | A1-e04 |
| apartman | Mehrfamilienhaus | Apartment | daire (Wohnung) | falsch | A2-e11 |
| kiler | Vorratskammer | Keller | bodrum | falsch | A2-e11 |
| ampul | Glühbirne | Ampel | trafik lambası | falsch | A2-e11 |
| pil | Batterie | Pille | hap | falsch | A2-e14 |
| akü | Autobatterie | Akku | şarjlı pil, batarya | falsch | B1-e06 |
| klima | Klimaanlage | Klima | iklim | falsch | B1-e13 |
| kombi | Gastherme | Kombi (Auto) | – | falsch | B1-e03 |
| direksiyon | Lenkrad | Direktion | müdürlük | falsch | B1-e06 |
| ceket | Jackett, Sakko | Jacke | mont | teilweise | A2-e05 |
| forma | Trikot; Schuluniform | Form | biçim, şekil | falsch | A2-e06 |
| kayak | Skifahren; Ski | Kajak | kano | falsch | A1-e11 |
| tablet | Tablette; Tablet-Computer | Tablette | tablet, hap | teilweise | A2-e07 |
| rapor | Bericht; Krankschreibung | Rapport | – | teilweise | A2-e07 |
| ambulans | Krankenwagen | Ambulanz (Klinikabteilung) | poliklinik | teilweise | A2-e07 |
| grip | Grippe; im Alltag auch starke Erkältung | Grippe | grip | zu prüfen | A2-e07 |
| tansiyon | Blutdruck | Spannung (Tension) | gerilim | falsch | B2-e04 |
| serum | Infusion (Tropf); Serum | Serum | serum | teilweise | B2-e04 |
| kriz | Krise; Anfall (kalp krizi = Herzinfarkt) | Krise | kriz | teilweise | B2-e04 |
| doktor | Arzt, Ärztin; auch Anrede | Doktor (Titel) | doktora (Doktorgrad) | teilweise | A1-e12 |
| pratik | praktisch; Übung | Praxis | muayenehane (Arztpraxis), uygulama | falsch | A1-e12 |
| not | Note; Notiz | Note | not | teilweise | A2-e08 |
| diploma | Abschlusszeugnis jeder Schule | Diplom | diploma (Hochschule) | teilweise | B1-e15 |
| lisans | Bachelorstudium; Lizenz | Lizenz | lisans, ruhsat | teilweise | B2-e02 |
| vize | Visum; Zwischenprüfung an der Hochschule | Visum | vize | teilweise | B2-e02 |
| eleman | Mitarbeiter, Mitarbeiterin; Element (Fachsprache) | Element | öğe, unsur | teilweise | B1-e02 |
| patron | Chef, Chefin, Arbeitgeber | Patron | – | falsch | B1-e02 |
| şoför | Fahrer, Fahrerin | Chauffeur | özel şoför | teilweise | A1-e08 |
| kart | Karte aus Plastik oder Pappe | Karte | harita, bilet, menü | teilweise | A1-e08 |
| bank | Sitzbank | Bank (Geldinstitut) | banka | teilweise | A2-e14 |
| kampanya | Sonderangebot, Aktion; Kampagne | Kampagne | kampanya | teilweise | A2-e05 |
| mağaza | Geschäft, Laden | Magazin (Lager) | depo | falsch | A2-e05 |
| vitrin | Schaufenster; Vitrine | Vitrine | vitrin | teilweise | A2-e05 |
| promosyon | Werbegeschenk, Verkaufsaktion | Promotion (Doktorgrad) | doktora | falsch | B2-e08 |
| reklam | Werbung | Reklamation | şikâyet, iade | falsch | B1-e08 |
| röportaj | im Alltag meist Interview; auch Reportage | Reportage | röportaj | teilweise | B1-e08 |
| manşet | Schlagzeile; auch Hemdmanschette | Manschette | manşet, kolluk | teilweise | B2-e01 |
| magazin | Klatsch- und Promi-Nachrichten | Magazin (Zeitschrift) | dergi | falsch | B2-e01 |
| pansiyon | Gästehaus | Pension (auch Ruhegehalt) | emekli maaşı | teilweise | B1-e04 |
| plaj | Strand | Plage | dert, sıkıntı | falsch | A2-e03 |
| bagaj | Gepäck; Kofferraum | Bagage | – | falsch | A2-e03 |
| tarif | Rezept; Wegbeschreibung | Tarif | tarife | falsch | B1-e16 |
| menü | Speisekarte; Menü | Menü | menü | teilweise | B1-e16 |
| moral | Stimmung, Zuversicht | Moral (Sitte) | ahlak | teilweise | B1-e10 |
| komik | lustig | komisch (auch: seltsam) | garip, tuhaf | teilweise | A2-e09 |
| şans | Glück; Chance | Chance | fırsat | teilweise | B1-e10 |
| depozito | Kaution; Pfand | Depot | depo | falsch | B2-e11 |
| fayans | Wandfliese | Fayence (Keramik) | – | falsch | B2-e03 |
| sigorta | Versicherung; elektrische Sicherung | Sicherung | sigorta | teilweise | B2-e08 |
| prim | Prämie; Sozialversicherungsbeitrag | Prämie | prim | teilweise | B2-e05 |
| sıfır | Null | Ziffer | rakam | falsch | A1-e03 |
| doçent | Hochschullehrerin oder -lehrer eines bestimmten Rangs | Dozent | öğretim görevlisi | teilweise | C1-e07 |
| konferans | Vortrag; Konferenz | Konferenz | konferans, kongre | teilweise | C1-e09 |

Echte Freunde, die man bestärken sollte: kuaför – Friseur (aus dem Französischen), büro – Büro, balkon – Balkon, otobüs – Bus, kurs – Kurs, şef – Chef, kuzen – Cousin und Cousine (ein Wort ohne Genus), sempatik – sympathisch, reçete – Rezept vom Arzt (das Küchenrezept heißt tarif).

### 3.2 Lehnwörter

**Deutsche Wörter im Türkischen** (Brücke beim Lernen):

| Türkisch | Deutsch | Hinweis |
|---|---|---|
| otoban | die Autobahn | – |
| şalter | der Schalter | nur der elektrische Schalter; der Bankschalter heißt gişe |
| dübel | der Dübel | – |
| fön | der Föhn | im Alltag das Föhnen und der Haartrockner; auch der warme Fallwind |
| aysberg | der Eisberg | im Alltag vor allem der Eisbergsalat; der Eisberg im Meer heißt meist buz dağı |
| şnitzel | das Schnitzel | in der Türkei meist aus Hähnchen (tavuk şnitzel); Fleischart nennen (Leitfaden §3) |
| zeplin | der Zeppelin | nach dem Namen des Erfinders |
| dizel | der Diesel | nach dem Namen des Erfinders |
| kiç | der Kitsch | – |
| röntgen | das Röntgen | nach dem Namen des Physikers |

**Türkische Wörter im Deutschen** (oft mit anderer Bedeutung oder Aussprache):

| Deutsch | Türkisch | Hinweis |
|---|---|---|
| der Joghurt | yoğurt | ğ statt gh |
| der Kiosk | köşk | im Türkischen eine Villa oder ein Pavillon; der Kiosk heißt büfe |
| der Döner | döner | im Türkischen zuerst das Fleisch vom Drehspieß |
| der Diwan | divan | im Türkischen eine Liege und früher der Staatsrat; das Sofa heißt kanepe |
| die Tulpe | tülbent (Turban) | über das Türkische ins Deutsche; Tulpe heißt lale |
| der Dolmetscher | dilmaç (alt) | über das Ungarische ins Deutsche gekommen; heute tercüman |

**Gemeinsame Wörter aus dem Arabischen und Persischen** (über verschiedene Wege in beide Sprachen gekommen):

| Türkisch | Deutsch | Hinweis |
|---|---|---|
| şeker | der Zucker | tr auch „Bonbon“ (§3.1) |
| kahve | der Kaffee | – |
| limon | die Zitrone, die Limone | – |
| ıspanak | der Spinat | – |
| safran | der Safran | – |
| şal | der Schal | – |
| pazar | der Basar | tr Markt und Sonntag (§3.1) |
| kervan | die Karawane | – |
| cebir | die Algebra | – |
| kimya | die Chemie | – |
| sıfır | die Ziffer | falscher Freund: sıfır = Null (§3.1) |
| mağaza | das Magazin | falscher Freund: mağaza = Geschäft (§3.1) |
| tarif | der Tarif | falscher Freund: tarif = Rezept, Beschreibung (§3.1) |

**Französische Lehnwörter** (eine Brücke für alle, die Französisch oder Englisch kennen; die türkische Schreibung folgt dem Klang):

| Französisch | Türkisch | Deutsch |
|---|---|---|
| coiffeur | kuaför | Friseur |
| chauffeur | şoför | Fahrer |
| ascenseur | asansör | Aufzug |
| toilettes | tuvalet | Toilette |
| garage | garaj | Garage |
| adresse | adres | Adresse |
| rendez-vous | randevu | Termin |
| équipe | ekip | Team |
| cousin | kuzen | Cousin, Cousine |
| bicyclette | bisiklet | Fahrrad |
| stage | staj | Praktikum |
| devise | döviz | Devisen |

Regeln der Angleichung: ch → ş (şoför, şef), eu → ö (kuaför, asansör), ou → u (kupon), -tion → -syon (istasyon), stummes Wortende fällt weg (adres).

### 3.3 Internationalismen

Grob 7 bis 11 % der häufigen türkischen Nomen mit deutscher Glosse sind ähnlich geschrieben (Top-1.000: 33 von 481 (6,9 %); Top-5.000: 185 von 1.628 (11,4 %); Messung §7). Sie helfen beim Lesen. Fallen sind Schreibung, Aussprache und Bedeutung.

| Deutsch | Türkisch | Beispiele |
|---|---|---|
| -tion, -sion | -syon | Station – istasyon, Organisation – organizasyon, Television – televizyon |
| -tät | -ite | Universität – üniversite, Qualität – kalite |
| -ie | -i | Energie – enerji, Technologie – teknoloji, Kategorie – kategori |
| -ik | -ik | Technik – teknik, Statistik – istatistik, Mathematik – matematik |
| -or | -ör | Professor – profesör, Direktor – direktör; aber Motor – motor |
| -ismus | -izm | Tourismus – turizm |
| -ur | -ür | Kultur – kültür |
| -ell | -el | professionell – profesyonel |
| -iv | -if | aktiv – aktif |
| ph, th | f, t | Foto – fotoğraf, Thema – tema, Theater – tiyatro |
| c, ch (k) | k | Charakter – karakter, Café – kafe |
| y | i | System – sistem, Typ – tip |
| st-, sp- am Anfang | in älteren Wörtern i- davor | Station – istasyon, Statistik – istatistik; neuer: spor, stil, stres |

Weitere Paare (Auswahl): Film – film, System – sistem, Gruppe – grup, Telefon – telefon, Programm – program, Polizei – polis, Video – video, Sport – spor, Hotel – otel, Park – park, Charakter – karakter, Rolle – rol, Test – test, Meter – metre, Problem – problem, Liste – liste, Kamera – kamera, Kontrolle – kontrol, Projekt – proje, Detail – detay, Analyse – analiz.

**Fallen bei Internationalismen:**
- **Schreibung:** Türkisch schreibt nach dem Klang: fotoğraf, kafe, tiyatro; Doppelkonsonanten fallen oft weg (program, kontrol).
- **Bedeutung:** falsche Freunde in §3.1 (klima, kombi, magazin, promosyon).
- **Kleinschreibung:** Auch Internationalismen sind kleingeschrieben: film, proje.
- **Vokalharmonie:** Viele Fremdwörter halten sie nicht ein (otobüs, televizyon); die Endung richtet sich nach dem letzten Vokal: otobüste, televizyonda.

### 3.4 Wortfelder mit anderer Einteilung

| Feld | Deutsch | Türkisch | Tipp |
|---|---|---|---|
| Verwandte | Tante, Onkel | hala (Schwester des Vaters), teyze (Schwester der Mutter), amca (Bruder des Vaters), dayı (Bruder der Mutter) | Die Seite der Familie steckt im Wort. |
| Verwandte durch Heirat | Tante, Onkel; Schwägerin, Schwager | yenge (Frau des Onkels oder des Bruders), enişte (Mann der Tante oder der Schwester) | ein Wort für zwei deutsche |
| Geschwister | Schwester, Bruder | abla, ağabey/abi (ältere), kardeş (jüngere oder allgemein, ohne Genus) | Alter steckt im Wort; abla und abi sind auch Anrede. |
| Großeltern | Oma, Opa | babaanne, anneanne; dede | Oma hat zwei Wörter je nach Seite. |
| Uhr und Stunde | die Uhr, die Stunde | saat | iki saat = zwei Stunden; saat ikide = um zwei Uhr |
| Rezept | Rezept | tarif (Küche), reçete (Arzt) | Zwei Wörter für ein deutsches. |
| Rechnung | Rechnung | hesap (im Restaurant; auch Konto und Rechnen), fatura (für Strom, Handwerk, Einkauf) | Zwei Wörter für ein deutsches. |
| Karte | Karte | harita (Landkarte), bilet (Fahrkarte), menü (Speisekarte), kart (Plastikkarte), kartpostal (Postkarte) | Das deutsche Wort ist weiter. |
| Wohnen | Wohnung, Haus | daire (Wohnung), apartman (Mehrfamilienhaus), ev (Zuhause, Haus) | §3.1 |
| sitzen, wohnen | sitzen, wohnen | oturmak (beides) | Nerede oturuyorsun? = Wo wohnst du? |
| arbeiten, lernen | arbeiten, lernen | çalışmak (beides; ders çalışmak = lernen) | Bugün çalışıyorum kann beides heißen. |
| gehen, fahren | gehen, fahren | gitmek (beides); sürmek (ein Fahrzeug lenken); binmek (einsteigen, Rad fahren) | İzmir'e gidiyoruz = Wir fahren nach İzmir. |
| essen, trinken | Suppe essen | çorba içmek (Suppe „trinken“) | – |
| wissen, kennen | wissen, kennen | bilmek (wissen), tanımak (Personen kennen) | Vertraut: zwei Wörter wie im Deutschen |
| warm, heiß | warm, heiß | sıcak (beides), ılık (lauwarm) | – |
| blau | blau, dunkelblau | mavi, lacivert | lacivert ist ein eigenes Farbwort. |
| Schule | Grundschule, weiterführende Schule, Oberstufe | ilkokul, ortaokul, lise | §4.6 |
| Fächer | Naturwissenschaften, Sport | fen bilimleri (früher fen bilgisi), beden eğitimi | Schulfächer als feste Namen lernen |
| Handwerk | Meister, Geselle, Lehrling | usta, kalfa, çırak | usta ist auch Anrede für Handwerker. |
| Ehrenamt | Ehrenamtliche, Mitgliedsbeitrag | gönüllü, aidat | aidat ist auch das Hausgeld. |
| Amt | Gemeinde, Ortsvorsteher, Widerspruch | belediye, muhtar, itiraz | muhtar hat kein deutsches Gegenstück. |
| Mannschaft | Mannschaft, Anzug, Set | takım | ein Wort für drei deutsche |
| Elternschaft | Erziehungsberechtigte | veli (veli toplantısı = Elternabend) | – |
| Länder | die Türkei, Deutschland | Türkiye, Almanya (ohne Artikel) | Vertraut: Länder ohne Artikel wie die meisten im Deutschen |

Wörter, die in deutschsprachigen Familien oft deutsch gesagt werden, stehen in §5.2.

## 4 Pragmatik und Höflichkeit

### 4.1 sen und siz

siz entspricht dem deutschen „Sie“ und ist zugleich der Plural „ihr“. Die Verbform ist immer die 2. Person Plural (Siz nasılsınız?).

| Situation | Türkisch | Deutsch | Hinweis |
|---|---|---|---|
| Amt, Arzt, Geschäft, Unbekannte | siz, oft mit Vorname + Hanım/Bey | Sie + Familienname | §4.2 |
| Familie, Freunde, Kinder unter sich | sen | du | Vertraut |
| Kind zu Lehrkraft | siz, „Öğretmenim“ | Sie | Lehrkräfte sagen zu Kindern sen. |
| Ältere Nachbarn | siz oder Verwandtschaftswort (teyze, amca) mit sen | Sie | Verwandtschaftswörter machen sen höflich (§4.2). |
| Kolleginnen und Kollegen | je nach Betrieb siz oder sen | oft du | Im Zweifel siz. |
| Briefe, Formulare, Ämter | siz durchgehend | Sie | kein Wechsel im selben Text |

Einen festen Brauch, das Du förmlich anzubieten, gibt es seltener als im Deutschen; der Wechsel zu sen geschieht oft stillschweigend (zu prüfen, KT-de-03).

### 4.2 Anrede und Namen

- **Vorname statt Familienname:** Höflich ist Vorname + Hanım/Bey: Derya Hanım, Murat Bey. „Herr Kaya“ wird im Gespräch nicht „Bay Kaya“; Bay und Bayan + Familienname stehen in Briefen, Formularen und Durchsagen. Auch Familienname + Hanım/Bey kommt vor (Becker Hanım).
- **Verwandtschaftswörter als Anrede:** abla, abi (für wenig Ältere), teyze, amca (für Ältere), auch für Fremde, etwa im Laden. Im Deutschen nur in der Familie.
- **Berufe als Anrede:** Doktor Bey/Hanım, Hemşire Hanım, Öğretmenim (für Lehrkräfte), usta (für Handwerker).
- **Ohne Anrede:** Für „Entschuldigung, …“ an Fremde: Pardon, bakar mısınız? (Entschuldigung, schauen Sie mal?).
- **Namen schreiben:** Türkische Buchstaben auch in deutschen Formularen wie im Pass; manche Systeme ersetzen sie (zu prüfen, KT-de-07).

### 4.3 Grüßen, Danken, Bitten, Wünschen

Nur weltliche Formeln (Leitfaden §4.3). Viele türkische Formeln haben keine deutsche Entsprechung; Tipps erklären dann die Situation statt einer Übersetzung.

| Situation | Türkisch | Deutsch | Hinweis |
|---|---|---|---|
| Gruß | Merhaba; Günaydın, İyi günler, İyi akşamlar | Hallo; Guten Morgen, Guten Tag, Guten Abend | İyi akşamlar und İyi geceler auch zum Abschied |
| Ankunft | Hoş geldiniz! – Hoş bulduk! | Willkommen! – (keine feste Antwort) | Die Antwort ist fest und gehört dazu. |
| Abschied | Hoşça kal (wer geht) – Güle güle (wer bleibt); Görüşürüz | Tschüss; Bis bald | Deutsch unterscheidet nicht, wer geht. |
| Befinden | Nasılsın? – İyiyim, teşekkür ederim, sen nasılsın? | Wie geht's? – Gut, danke, und dir? | Die Gegenfrage gehört dazu. |
| Kennenlernen | Memnun oldum. – Ben de memnun oldum. | Freut mich. | – |
| Dank | Teşekkür ederim, Teşekkürler, Sağ ol | Danke, Vielen Dank | Sağ ol ist vertraut, unter Bekannten. |
| Antwort auf Dank | Rica ederim, Bir şey değil | Bitte, Gern geschehen | Rica ederim heißt auch „ich bitte“. |
| Anbieten, hereinbitten | Buyurun | Bitte schön; Kommen Sie herein; Was darf es sein? | ein Wort, mehrere deutsche Sätze |
| Nachfragen | Efendim? | Wie bitte?; am Telefon: Ja, bitte? | – |
| Entschuldigung | Pardon, Affedersiniz, Kusura bakmayın | Entschuldigung, Verzeihung, Es tut mir leid | – |
| Essen | Afiyet olsun | Guten Appetit | auch zu jemandem, der gerade isst |
| Lob für Gekochtes | Elinize sağlık – Afiyet olsun | Das hat sehr gut geschmeckt! | feste Antwort der Köchin oder des Kochs |
| Gruß an Arbeitende | Kolay gelsin | (keine Entsprechung) | beim Betreten eines Ladens, zu Handwerkern |
| Krankheit | Geçmiş olsun | Gute Besserung | auch nach Unglück und Ärger |
| Niesen | Çok yaşa – Sen de gör | Gesundheit! – Danke | feste Antwort |
| Glückwunsch | Tebrikler, Tebrik ederim | Herzlichen Glückwunsch | – |
| Neues Gekauftes | Güle güle kullan (giy) | Viel Freude damit | – |
| Neue Wohnung | Güle güle oturun | Viel Glück im neuen Zuhause | – |
| Reise, Ferien | İyi yolculuklar, İyi tatiller | Gute Reise, Schöne Ferien | – |
| Wochenende | İyi hafta sonları | Schönes Wochenende | – |
| Arbeit, Schule | İyi çalışmalar, İyi dersler | (keine feste Formel) | auch als Gruß am Ende einer E-Mail |
| Sich verabschieden für länger | Kendine iyi bak | Pass auf dich auf | – |
| Trauer | Başınız sağ olsun | Mein Beileid | erst ab B1, ruhig (Leitfaden G-12) |

### 4.4 Gespräch, Kritik, Absagen

Die Hinweise beschreiben Gewohnheiten, sie bewerten keine Herkunft (Leitfaden G-04).
- **Anbieten und Ablehnen:** In vielen türkischsprachigen Familien wird Essen oder Tee mehrfach angeboten; ein erstes „Hayır, teşekkürler“ kann Höflichkeit sein. Wer wirklich nichts mehr möchte, sagt es freundlich und klar: Çok teşekkür ederim, gerçekten doydum (zu prüfen, KT-de-04).
- **Nein ohne Wort:** Kopf leicht nach hinten, Augenbrauen hoch, oft mit einem Schnalzlaut („cık“): Das heißt „nein“. Ein seitliches Kopfwiegen heißt eher „Wie bitte?“ oder „ich verstehe nicht“ (zu prüfen, KT-de-05).
- **Bitten:** Direkte Bitten werden mit Aorist-Fragen, lütfen und acaba weich gemacht (`tr.g.aorist_bitte`, `tr.g.hoeflichkeit_strategien`).
- **Kritik:** eher indirekt und mit Abschwächung (biraz, sanırım, bence de … ama); offene Kritik an Älteren vermeiden die Tipps.
- **Absagen:** mit Dank und Bedauern: Çok isterdim ama maalesef gelemiyorum (Ich würde sehr gern, kann aber leider nicht).
- **Telefon:** Man meldet sich mit Alo? oder Efendim?, nicht mit dem eigenen Namen.

### 4.5 Briefe, E-Mails, Formulare

| Bestandteil | Türkisch | Deutsch | Tipp |
|---|---|---|---|
| förmliche Anrede | Sayın Ayla Kaya, / Sayın Kaya, | Sehr geehrte Frau Kaya, | Sayın + Name, ohne Herr/Frau |
| Empfänger unbekannt | Sayın Yetkili, | Sehr geehrte Damen und Herren, | – |
| vertraute Anrede | Merhaba Elif, / Canım Elif, / Sevgili … (zu prüfen, KT-de-11) | Liebe Elif, | „Sevgili“ ist in Briefen eine neutrale Anrede. |
| nach der Anrede | neue Zeile, großgeschrieben | Komma, dann klein weiter | – |
| Schluss förmlich | Saygılarımla | Mit freundlichen Grüßen | – |
| Schluss vertraut | Sevgiler, Görüşmek üzere | Viele Grüße, Bis bald | – |
| Arbeitsmail | İyi çalışmalar dilerim. | (keine feste Formel) | häufiger Schlusssatz |
| Betreff, Anlage | Konu:, Ek: | Betreff, Anlage | – |
| Antrag an eine Behörde | Bittschrift (dilekçe): Empfänger oben in Großbuchstaben und im Dativ (… BAŞKANLIĞINA), Datum, Anliegen, feste Schlussformel „Gereğinin yapılmasını arz ederim.“, Name, Unterschrift, Adresse, Anlagen | Brief mit Anrede, Anliegen, Gruß | Die Schlussformel ist fest; ganz lernen (B2-e06). |
| Formular | soyadı, adı, doğum tarihi, doğum yeri, uyruğu, medeni hali, adres | Familienname, Vorname, Geburtsdatum, Geburtsort, Staatsangehörigkeit, Familienstand, Anschrift | Familienname zuerst |
| Lebenslauf | özgeçmiş | Lebenslauf | B2-e02 |
| E-Mail-Adressen in Übungen | nur example.org, nicht verlinkt (Leitfaden G-08) | – | – |

### 4.6 Zeit, Zahlen, Formate, Schule

| Thema | Türkei | Deutschland | Tipp |
|---|---|---|---|
| Datum | 20.10.2026; 20 Ekim 2026 | 20.10.2026; 20. Oktober 2026 | ohne Punkt nach dem Tag, wenn der Monat ausgeschrieben ist |
| Uhrzeit | 14.30 oder 14:30; im Gespräch 12 Stunden | 14:30 | Vertraut |
| halbe Stunde | üç buçuk = 3:30 | halb vier | `tr.g.uhrzeit` |
| Dezimalzahl, Tausender | 2,5; 1.000 | 2,5; 1.000 | Vertraut |
| Prozent | %10 (yüzde on) | 10 % | Zeichen vorn |
| Preis | 15,50 TL; 15,50 € | 15,50 € | Vertraut |
| Wochenbeginn | pazartesi | Montag | Vertraut |
| Adresse | Straße, No: Hausnummer, Daire: Wohnungsnummer, Stadtteil, Stadt | Straße Hausnummer, Postleitzahl Ort | Daire ist die Wohnungsnummer. |
| Wohnungsanzeige | 3+1 = drei Zimmer und ein Wohnzimmer | 4 Zimmer | Das Wohnzimmer wird extra gezählt. |
| Stockwerk | zemin kat, birinci kat | Erdgeschoss, erster Stock | Vertraut |
| Schulweg | ilkokul (4 Jahre), ortaokul (4), lise (4) | Grundschule (in Hessen 4 Jahre), danach weiterführende Schule | – |
| Noten | höhere Zahl ist besser (zu prüfen, KT-de-01) | 1 ist die beste | umgekehrt |
| Notruf | 112 | 112, Polizei 110 | Vertraut |

### 4.7 Religiöse Formeln (gesperrt)

Für viele Alltagssituationen gibt es im Türkischen auch religiöse Formeln (Gruß, Pläne, Lob, Dank, Abschied, Trauer). In den Sprachkursen sind sie gesperrte Kandidaten (Leitfaden §4.2, F-tr-01 bis F-tr-15) und kein Gegenstand dieses Dokuments.
- Tipps nennen nur die weltlichen Formeln aus Leitfaden §4.3 und §4.3 oben.
- Kein Tipp erklärt, übersetzt oder bewertet eine religiöse Formel. Ein kurzer Alltagsgruß, der nahe an F-tr-01 liegt, bleibt nach OF-tr-05 ungenutzt.
- Sie erscheinen frühestens nach zwei Freigaben der religiösen Prüfung (KERN §2.3, LM-09).

## 5 Hinweise für Herkunftssprachler

### 5.1 Wer den Kurs nutzt

| Gruppe | Stärken | typische Lücken | Ausrichtung der Tipps |
|---|---|---|---|
| Kinder und Jugendliche aus türkischsprachigen Familien, in Deutschland aufgewachsen | Hören, Familiengespräch, Aussprache, Wortschatz von Haus und Familie | Lesen und Schreiben, Sonderzeichen, Schulwortschatz, Nebensätze als Nominalformen, siz-Formen | Schreibtipps ab A1, Schriftsprache ab A2; Einstufung je Fertigkeit |
| Erwachsene der zweiten und dritten Generation | Alltagsgespräch, Familienregister, Redewendungen | Amts- und Schriftsprache (B2, C1), Fachwortschatz von Beruf und Behörde, Rechtschreibung | Register-Tipps; Standard als Ergänzung, nicht als Korrektur der Familiensprache |
| Kinder aus gemischten Familien (etwa deutsch-türkisch, arabisch-türkisch) | Verstehen, Klang | Sprechen, Endungen, Vokalharmonie | volle Kontrasttipps, aber Hörübungen mit Familienbezug |
| Deutschsprachige ohne Vorwissen | Grammatikbegriffe aus der Schule, Englisch oder Französisch | alles Türkische | volle Kontrasttipps ab dem Vorkurs |

### 5.2 Typische Muster und Tipps

Erfahrungswerte, noch nicht gemessen (KT-de-12). Tipps behandeln Familiensprache und Dialekte neutral; sie zeigen die Standardform als Ergänzung, ohne „falsch“ und ohne Wertung (Leitfaden G-04).

| Muster | Beispiel | Tipp-Idee | Einheit |
|---|---|---|---|
| Schreiben ohne Sonderzeichen | „cok guzel“, „nasilsin“ | Sonderzeichenleiste nutzen; der Abgleich nimmt Antworten ohne Sonderzeichen mit Hinweis an (PLAN §4.1), außer wenn ein anderes Wort entsteht (kır – kir) | tr.v.l01, A1-e02 |
| Schreiben, wie man spricht | „geliyom“, „gelicem“, „napıyosun“, „bi“ | gesprochene und geschriebene Form nebeneinander zeigen | A2-e03, C1-e04 |
| de/da und ki zusammen | „bende geliyorum“, „biliyorumki“ | §1.1, fünf Schreibregeln | A2-e09, B1-e15 |
| deutsche Schreibung | „Schöyle“, „tschok“, „jok“ | ein Laut, ein Buchstabe: ş, ç, y | tr.v.l01 |
| deutsche Wörter im türkischen Satz | Termin, Ausbildung, Krankenkasse, Bescheid, Führerschein, Kindergeld, Hausmeister | Standardtürkisch dazu: randevu, meslek eğitimi, sağlık sigortası, resmî yazı oder karar, ehliyet, çocuk parası, apartman görevlisi; das Wort aus der Familie bleibt erlaubt | A2-e02, B2-e13 |
| Lehnübersetzungen (zu prüfen, KT-de-08) | „randevu yapmak“ (einen Termin machen), „sınav yazmak“ (eine Arbeit schreiben), „fotoğraf yapmak“ | Standard: randevu almak, sınava girmek, fotoğraf çekmek | A2-e02, A2-e08 |
| Nebensätze mit ki statt Nominalform | „Biliyorum ki geliyor.“ | beide Formen sind richtig; Texte nutzen Geldiğini biliyorum | B1-e08 |
| Pronomen in jedem Satz | „Ben … ben … ben …“ | Endung genügt; Pronomen nur zur Betonung | A1-e01 |
| deutsche Wortstellung | „Ben gidiyorum okula.“ | im Gespräch möglich (devrik), im Text Verb ans Ende | A1-e06, C1-e12 |
| sen statt siz zu Fremden | „Sen nereye gidiyorsun?“ zur Ärztin | siz-Formen und Anrede mit Hanım/Bey | A2-e02 |

### 5.3 Sprache der Tipps

- **Deutsch, einfach und kurz:** Titel, höchstens zwei Sätze, ein bis drei türkische Beispiele mit `lang="tr"`.
- **Beispiele zuerst:** erst das türkische Beispiel, dann die Regel.
- **Fachwörter zweisprachig:** Herkunftssprachler kennen die türkischen Begriffe teils aus dem Türkischunterricht. Tipps nennen den deutschen Begriff und den türkischen in Klammern:

| Deutsch | Türkisch |
|---|---|
| Endung | ek |
| Wortstamm | kök, gövde |
| Vokalharmonie | ünlü uyumu |
| Erweichung (kitap – kitabı) | ünsüz yumuşaması |
| Angleichung (-de/-te) | ünsüz benzeşmesi |
| Nominativ, Akkusativ, Dativ, Lokativ, Ablativ, Genitiv | yalın hal, belirtme hali, yönelme hali, bulunma hali, ayrılma hali, ilgi hali |
| Besitzendung | iyelik eki |
| Personalendung am Nomen (sein) | ek fiil |
| Infinitiv, Verbalnomen | mastar, isim-fiil |
| Partizip | sıfat-fiil (ortaç) |
| Konverb | zarf-fiil (ulaç) |
| Aorist | geniş zaman |
| -miş-Vergangenheit | öğrenilen geçmiş zaman (-miş'li geçmiş) |
| Imperativ, Wunschform, Bedingung, Notwendigkeit | emir kipi, istek kipi, şart kipi, gereklilik kipi |
| Passiv, Kausativ, Reflexiv, Reziprok | edilgen, ettirgen, dönüşlü, işteş |
| Fragepartikel | soru eki |
| Postposition | edat (son çekim edatı) |

### 5.4 Einstufung und Lernweg

- Herkunftssprachler verstehen meist mehr, als sie lesen und schreiben. Der Einstufungstest (AUFTRAG §5.2, Einstufungsbank PLAN §5.1) soll je Fertigkeit messen; ein eigener Schnellweg ist nach OF-tr-09 nicht vorgesehen.
- Der Vorkurs ist für sie optional (RAHMEN-tr §4); Schreibtipps aus §1.1 erscheinen bei hoher Einstufung trotzdem in der ersten Einheit.
- Ab A2 stehen Schreibaufgaben im Rahmenplan (OF-tr-03); sie sind für diese Gruppe besonders wichtig.

## 6 Tipp-Themen je Einheit

310 Tipp-Themen für 74 Einheiten-Schlüssel (Vorkurs `tr.v.l01`–`tr.v.l02` und 72 Einheiten). 200 beziehen sich auf eine Grammatik-ID (109 der 109 IDs), die übrigen auf Laut, Schrift, Wortschatz, Pragmatik oder die Hinweise für Herkunftssprachler (Abschnitt in der Spalte „Bezug“). Jede Einheit hat mindestens zwei Tipps.

| Stufe | Einheiten | Tipp-Themen | je Einheit |
|---|---|---|---|
| Vorkurs | 2 | 11 | 5,5 |
| A1 | 12 | 74 | 6,2 |
| A2 | 14 | 70 | 5,0 |
| B1 | 16 | 70 | 4,4 |
| B2 | 16 | 53 | 3,3 |
| C1 | 14 | 32 | 2,3 |
| Σ | 74 | 310 | 4,2 |

**Leitlinien für das Schreiben der Tipps (Phase Ü, PLAN §6.3):**
- **Sprache:** Deutsch als Oberflächensprache, einfach und kurz (§5.3): Titel, höchstens zwei Sätze, ein bis drei türkische Beispiele mit `lang="tr"`. Türkische Wörter in türkischer Schreibung.
- **Aufbau:** Brücke zuerst („Das kennst du schon: …“), dann der Unterschied. Keine Wertung der Ausgangssprache oder der Familiensprache; „im Türkischen anders“ statt „falsch“.
- **Ort:** Der Tipp erscheint in der genannten Einheit. Nennt er eine Grammatik-ID, ist sie dort oder früher eingeführt (vom Generator geprüft).
- **Beispiele:** nur Wortschatz bis zur Einheit (PLAN §6.4), nur Namen aus der Namensliste (Leitfaden §1.1), bis B1 kindgeeignet, ohne Tabu-Lexikon und ohne religiöse Formeln (§4.7). Einträge mit „zu prüfen“ erst nach der Stichprobe.
- **Schlüssel:** Vorschlag `tr-aus-de.tipp.<Nr.>`; das Schema legt L3-02 fest.

| Nr. | Einheit | Tipp-Titel | Bezug |
|---|---|---|---|
| 001 | tr.v.l01 | Ein Buchstabe, ein Laut: Türkisch schreibt, wie man spricht | §1.1 |
| 002 | tr.v.l01 | c ist „dsch“, ç ist „tsch“, ş ist „sch“ | §1.1 |
| 003 | tr.v.l01 | z ist ein weiches s, s ist immer scharf | §1.1 |
| 004 | tr.v.l01 | y klingt wie das deutsche j, v wie w, j wie in „Journal“ | §1.1 |
| 005 | tr.v.l01 | Zwei i: ı ohne Punkt, und das große İ hat einen Punkt | §1.1 |
| 006 | tr.v.l01 | ğ ist kein g: Es dehnt den Vokal davor | §1.2 |
| 007 | tr.v.l01 | h wird immer gesprochen, auch nach Vokal: kahve, sabah | §1.2 |
| 008 | tr.v.l02 | Helle und dunkle Vokale: e, i, ö, ü gegen a, ı, o, u | §1.2 |
| 009 | tr.v.l02 | ö und ü kennst du schon aus dem Deutschen | §1.2 |
| 010 | tr.v.l02 | Doppelte Konsonanten lang sprechen: elli (50) – eli (seine Hand) | §1.3 |
| 011 | tr.v.l02 | r am Silbenende nicht verschlucken: bir, var, yer | §1.2 |
| 012 | tr.a1.e01 | Das Pronomen fällt meist weg: Öğrenciyim | `tr.g.personalpron` |
| 013 | tr.a1.e01 | siz ist Sie und ihr in einem Wort | `tr.g.personalpron` |
| 014 | tr.a1.e01 | o heißt er, sie und es | `tr.g.personalpron` |
| 015 | tr.a1.e01 | „Ich bin …“ ist eine Endung: Öğrenciyim | `tr.g.kopula` |
| 016 | tr.a1.e01 | In der 3. Person reicht das Nomen: O öğretmen | `tr.g.kopula` |
| 017 | tr.a1.e01 | Hoşça kal sagt, wer geht – Güle güle, wer bleibt | §4.3 |
| 018 | tr.a1.e01 | Memnun oldum: Freut mich | §4.3 |
| 019 | tr.a1.e02 | Der letzte Vokal bestimmt die Endung | `tr.g.vokalharmonie` |
| 020 | tr.a1.e02 | Zweifach und vierfach: -ler/-lar und -im/-ım/-üm/-um | `tr.g.vokalharmonie` |
| 021 | tr.a1.e02 | bu, şu, o: hier, da, dort | `tr.g.bu_su_o` |
| 022 | tr.a1.e02 | Bu bir defter: Es gibt keinen Artikel, bir heißt „ein“ | `tr.g.bu_su_o` |
| 023 | tr.a1.e02 | Fragen ohne Umstellen: mi hinter das Erfragte | `tr.g.frage_mi` |
| 024 | tr.a1.e02 | mi getrennt schreiben, aber mit Vokalharmonie | `tr.g.frage_mi` |
| 025 | tr.a1.e02 | Nomen schreibt man klein: defter, kalem | §1.1 |
| 026 | tr.a1.e03 | Nach Zahlen kein Plural: iki kardeş | `tr.g.plural` |
| 027 | tr.a1.e03 | annemler: -ler bei Personen heißt „und Familie“ | `tr.g.plural` |
| 028 | tr.a1.e03 | yirmi bir: Zehner zuerst, wie die Ziffern | `tr.g.zahlen` |
| 029 | tr.a1.e03 | Alter: On bir yaşındayım | `tr.g.zahlen` |
| 030 | tr.a1.e03 | Nicht Lehrerin: Öğretmen değilim | `tr.g.degil` |
| 031 | tr.a1.e03 | abla und abi: ältere Geschwister haben eigene Wörter | §3.4 |
| 032 | tr.a1.e03 | Berufe ohne weibliche Form: öğretmen für beide | §3.4 |
| 033 | tr.a1.e04 | „Ich habe …“ heißt „Mein … ist da“: Bir kardeşim var | `tr.g.var_yok` |
| 034 | tr.a1.e04 | Nicht „var değil“, sondern yok | `tr.g.var_yok` |
| 035 | tr.a1.e04 | Besitz als Endung: evim, odan, odası | `tr.g.possessiv` |
| 036 | tr.a1.e04 | benim evim: Pronomen und Endung zusammen | `tr.g.possessiv` |
| 037 | tr.a1.e04 | salon ist das Wohnzimmer, kanepe das Sofa | §3.1 |
| 038 | tr.a1.e05 | Wo? Die Endung -de/-da: evde, okulda | `tr.g.lokativ` |
| 039 | tr.a1.e05 | Nach harten Konsonanten -te/-ta: parkta | `tr.g.lokativ` |
| 040 | tr.a1.e05 | Apostroph nur bei Namen: Wetzlar'da, aber okulda | `tr.g.eigenname_apostroph` |
| 041 | tr.a1.e05 | nerede, nereye, nereden: wo, wohin, woher | `tr.g.fragewoerter` |
| 042 | tr.a1.e05 | Das Fragewort steht vor dem Verb | `tr.g.fragewoerter` |
| 043 | tr.a1.e05 | Adjektive ohne Endung: büyük ev, büyük evler | `tr.g.adjektiv` |
| 044 | tr.a1.e05 | büfe ist der Kiosk, köşk eine Villa | §3.1 |
| 045 | tr.a1.e06 | -iyor: jetzt und gerade | `tr.g.iyor` |
| 046 | tr.a1.e06 | -yor bleibt gleich, nur der Vokal davor wechselt | `tr.g.iyor` |
| 047 | tr.a1.e06 | anlamak → anlıyor: a/e am Stamm wird zu ı/i | `tr.g.iyor` |
| 048 | tr.a1.e06 | Das Verb ans Ende – wie im deutschen Nebensatz | `tr.g.wortstellung` |
| 049 | tr.a1.e06 | Das Wichtigste steht direkt vor dem Verb | `tr.g.wortstellung` |
| 050 | tr.a1.e06 | Wochentage klein, außer im Datum | §1.1 |
| 051 | tr.a1.e06 | çalışmak heißt arbeiten und lernen | §3.4 |
| 052 | tr.a1.e07 | Bestimmtes Objekt mit -(y)i: Bu elmayı alıyorum | `tr.g.akkusativ` |
| 053 | tr.a1.e07 | Irgendein Objekt ohne Endung: Elma alıyorum | `tr.g.akkusativ` |
| 054 | tr.a1.e07 | kitap – kitabı: p, ç, t, k werden vor Vokal weich | `tr.g.konsonant` |
| 055 | tr.a1.e07 | pazar ist der Markt, market der Laden | §3.1 |
| 056 | tr.a1.e07 | biber ist Paprika, erik eine Pflaume | §3.1 |
| 057 | tr.a1.e07 | fiş ist der Kassenbon (und der Stecker) | §3.1 |
| 058 | tr.a1.e07 | aysberg ist im Alltag der Eisbergsalat | §3.2 |
| 059 | tr.a1.e08 | Wohin? -e/-a: okula, İzmir'e | `tr.g.dativ` |
| 060 | tr.a1.e08 | Woher? -den/-dan: evden, Türkiye'den | `tr.g.ablativ` |
| 061 | tr.a1.e08 | -de, -e, -den: wo, wohin, woher wie im Deutschen | `tr.g.ablativ` |
| 062 | tr.a1.e08 | otobüse binmek: in den Bus steigen mit -e | `tr.g.dativ` |
| 063 | tr.a1.e08 | gitmek heißt gehen und fahren | §3.4 |
| 064 | tr.a1.e09 | üç buçuk ist halb vier | `tr.g.uhrzeit` |
| 065 | tr.a1.e09 | Um drei Uhr: saat üçte | `tr.g.uhrzeit` |
| 066 | tr.a1.e09 | Besitzer zuerst: Elif'in çantası | `tr.g.genitiv` |
| 067 | tr.a1.e09 | Zwei Endungen: babamın arabası | `tr.g.genitiv` |
| 068 | tr.a1.e09 | saat heißt Uhr und Stunde | §3.4 |
| 069 | tr.a1.e10 | Gel! ist die du-Form, Gelin! die Sie-Form | `tr.g.imperativ` |
| 070 | tr.a1.e10 | Lütfen oturun: höflich mit -in | `tr.g.imperativ` |
| 071 | tr.a1.e10 | masanın üstünde: das Lagewort steht hinten | `tr.g.raum_postpos` |
| 072 | tr.a1.e10 | pasta ist Torte, kek ein Rührkuchen | §3.1 |
| 073 | tr.a1.e10 | Afiyet olsun und Elinize sağlık | §4.3 |
| 074 | tr.a1.e10 | Mehrfach angeboten: Das erste Nein kann Höflichkeit sein | §4.4 |
| 075 | tr.a1.e10 | Suppe trinkt man: çorba içmek | §3.4 |
| 076 | tr.a1.e11 | mit = ile oder -le: otobüsle, annemle | `tr.g.ile` |
| 077 | tr.a1.e11 | Nach Vokal mit y: arabayla | `tr.g.ile` |
| 078 | tr.a1.e11 | „Ich möchte schwimmen“: Yüzmek istiyorum | `tr.g.mek_istemek` |
| 079 | tr.a1.e11 | Wetter ohne „es“: Yağmur yağıyor | `tr.g.iyor` |
| 080 | tr.a1.e11 | kayak ist Skifahren, nicht Kajak | §3.1 |
| 081 | tr.a1.e12 | baş ağrısı: Kompositum mit -(s)i am Kern | `tr.g.nominalkompositum` |
| 082 | tr.a1.e12 | okul bahçesi oder okulun bahçesi? | `tr.g.nominalkompositum` |
| 083 | tr.a1.e12 | Başım ağrıyor: „Mein Kopf schmerzt“ | `tr.g.possessiv` |
| 084 | tr.a1.e12 | Doktor Bey, Doktor Hanım: so spricht man den Arzt an | §4.2 |
| 085 | tr.a1.e12 | Geçmiş olsun: Gute Besserung | §4.3 |
| 086 | tr.a2.e01 | Erlebte Vergangenheit mit -di | `tr.g.di` |
| 087 | tr.a2.e01 | Nach harten Lauten -ti: gittim, yaptın | `tr.g.di` |
| 088 | tr.a2.e01 | „ich bin gegangen“ wird ein Wort: gittim | `tr.g.di` |
| 089 | tr.a2.e01 | „war“ ist eine Endung: evdeydim | `tr.g.idi` |
| 090 | tr.a2.e01 | „hatte“ heißt vardı: Bisikletim vardı | `tr.g.idi` |
| 091 | tr.a2.e02 | Viertel nach, Viertel vor: geçiyor und var | `tr.g.uhrzeit_genau` |
| 092 | tr.a2.e02 | Datum ohne Punkt nach dem Tag: 16 Ekim 2026 | `tr.g.uhrzeit_genau` |
| 093 | tr.a2.e02 | 3. = üçüncü: Ordnungszahl mit Punkt | `tr.g.ordinal` |
| 094 | tr.a2.e02 | Ayla Hanım, Murat Bey: das Höflichkeitswort steht hinten | `tr.g.anrede` |
| 095 | tr.a2.e02 | randevu ist der Termin | §3.2 |
| 096 | tr.a2.e02 | Formular: soyadı, adı, doğum tarihi | §4.5 |
| 097 | tr.a2.e03 | Zukunft -ecek, vor Vokal -eceğ- | `tr.g.ecek` |
| 098 | tr.a2.e03 | Gesprochen gelicem, geschrieben geleceğim | `tr.g.ecek` |
| 099 | tr.a2.e03 | Gidelim! – Lass uns gehen | `tr.g.optativ` |
| 100 | tr.a2.e03 | plaj ist der Strand, bagaj das Gepäck | §3.1 |
| 101 | tr.a2.e03 | İyi yolculuklar, İyi tatiller | §4.3 |
| 102 | tr.a2.e04 | Aorist für Gewohnheiten: Her sabah çay içerim | `tr.g.aorist` |
| 103 | tr.a2.e04 | gelir oder yapar? Den Vokal mit dem Verb lernen | `tr.g.aorist` |
| 104 | tr.a2.e04 | Verneinung: içmem, içmez | `tr.g.aorist` |
| 105 | tr.a2.e04 | Höflich bitten: … verir misiniz? | `tr.g.aorist_bitte` |
| 106 | tr.a2.e04 | Kolay gelsin: ein Gruß an Arbeitende | §4.3 |
| 107 | tr.a2.e04 | Nachbarn mit teyze und amca ansprechen | §4.2 |
| 108 | tr.a2.e05 | billiger = daha ucuz, ohne -er | `tr.g.komparativ` |
| 109 | tr.a2.e05 | „als“ wird -den: Can'dan daha küçük | `tr.g.komparativ` |
| 110 | tr.a2.e05 | senin gibi, benim kadar | `tr.g.gibi_kadar` |
| 111 | tr.a2.e05 | mağaza ist ein Geschäft, kein Magazin | §3.1 |
| 112 | tr.a2.e05 | ceket ist das Jackett, die Jacke heißt mont | §3.1 |
| 113 | tr.a2.e06 | Können als Endung: yüzebilirim | `tr.g.ebil` |
| 114 | tr.a2.e06 | Nicht können: gelemem | `tr.g.ebil` |
| 115 | tr.a2.e06 | Das Schwimmen: yüzmeyi severim | `tr.g.mek_nomen` |
| 116 | tr.a2.e06 | takım: Mannschaft, Anzug und Set | §3.4 |
| 117 | tr.a2.e07 | Gitmem lazım: „mein Gehen ist nötig“ | `tr.g.meli_lazim` |
| 118 | tr.a2.e07 | -meli klingt wie „sollte“ | `tr.g.meli_lazim` |
| 119 | tr.a2.e07 | sütlü, şekersiz: „mit“ und „ohne“ als Endung | `tr.g.wortbildung1` |
| 120 | tr.a2.e07 | rapor ist auch die Krankschreibung | §3.1 |
| 121 | tr.a2.e07 | ambulans ist der Krankenwagen | §3.1 |
| 122 | tr.a2.e08 | Verhältniswörter stehen hinten: dersten sonra | `tr.g.postpos_kasus` |
| 123 | tr.a2.e08 | benim için: Pronomen im Genitiv | `tr.g.postpos_kasus` |
| 124 | tr.a2.e08 | „um … zu“: öğrenmek için am Ende | `tr.g.mek_icin` |
| 125 | tr.a2.e08 | ders çalışmak heißt lernen | §3.4 |
| 126 | tr.a2.e08 | not ist die Note und die Notiz | §3.1 |
| 127 | tr.a2.e09 | de/da „auch“ getrennt: Ben de geliyorum | `tr.g.konjunktionen` |
| 128 | tr.a2.e09 | ne … ne mit bejahtem Verb | `tr.g.konjunktionen` |
| 129 | tr.a2.e09 | kendi mit Besitzendung: kendimi, kendini | `tr.g.kendi` |
| 130 | tr.a2.e09 | Tante und Onkel: teyze, hala, dayı, amca | §3.4 |
| 131 | tr.a2.e09 | komik heißt lustig, nicht seltsam | §3.1 |
| 132 | tr.a2.e10 | -miş: Vergangenheit, die man bemerkt | `tr.g.mis_grund` |
| 133 | tr.a2.e10 | -di oder -miş? Gesehen oder bemerkt | `tr.g.mis_grund` |
| 134 | tr.a2.e10 | Wo das Deutsche „anscheinend“ sagt, steht -miş | `tr.g.mis_grund` |
| 135 | tr.a2.e10 | Ne oldu? – Die Frage nach einem Ereignis | `tr.g.di` |
| 136 | tr.a2.e11 | Was gerade lief: -iyordu | `tr.g.iyordu` |
| 137 | tr.a2.e11 | seit + Gegenwart wie im Deutschen: İki yıldır burada oturuyoruz | `tr.g.dir_dauer` |
| 138 | tr.a2.e11 | Dauer mit -dir, Zeitpunkt mit -den beri | `tr.g.dir_dauer` |
| 139 | tr.a2.e11 | apartman ist das Haus, daire die Wohnung | §3.1 |
| 140 | tr.a2.e11 | kiler ist die Vorratskammer, der Keller heißt bodrum | §3.1 |
| 141 | tr.a2.e11 | oturmak: sitzen und wohnen | §3.4 |
| 142 | tr.a2.e11 | Güle güle oturun: Glückwunsch zur neuen Wohnung | §4.3 |
| 143 | tr.a2.e12 | masadaki kitap: -ki macht die Ortsangabe zum Attribut | `tr.g.ki_attribut` |
| 144 | tr.a2.e12 | benimki, seninki: meins, deins | `tr.g.ki_attribut` |
| 145 | tr.a2.e12 | olmak: werden und sein | `tr.g.olmak_werden` |
| 146 | tr.a2.e12 | Berufe auf -ci: kitapçı, fırıncı | `tr.g.wortbildung1` |
| 147 | tr.a2.e13 | -sin: „er soll …“ | `tr.g.imperativ3` |
| 148 | tr.a2.e13 | Wünsche mit -sin: Geçmiş olsun, Kolay gelsin | `tr.g.imperativ3` |
| 149 | tr.a2.e13 | Tebrikler und Güle güle kullanın | §4.3 |
| 150 | tr.a2.e13 | Verwandte nach der Heirat: yenge und enişte | §3.4 |
| 151 | tr.a2.e14 | bin ohne bir: bin iki yüz | `tr.g.zahlen_gross` |
| 152 | tr.a2.e14 | %10: Das Prozentzeichen steht vorn | `tr.g.zahlen_gross` |
| 153 | tr.a2.e14 | bank ist die Sitzbank, banka das Geldinstitut | §3.1 |
| 154 | tr.a2.e14 | Adressen: Sokak, No:, Daire | §4.6 |
| 155 | tr.a2.e14 | E-Mail: Konu und Ek | §4.5 |
| 156 | tr.b1.e01 | Doppelt verneinen: Kimse gelmedi | `tr.g.indefinit` |
| 157 | tr.b1.e01 | hiç mit Verneinung: Hiç gitmedim | `tr.g.indefinit` |
| 158 | tr.b1.e01 | Plusquamperfekt: -mişti | `tr.g.zusammengesetzt` |
| 159 | tr.b1.e01 | Gewohnheiten von früher: bakardı | `tr.g.zusammengesetzt` |
| 160 | tr.b1.e01 | -ecekti: wollte gerade | `tr.g.zusammengesetzt` |
| 161 | tr.b1.e02 | Relativsatz vor dem Nomen: kitap okuyan çocuk | `tr.g.partizip_en` |
| 162 | tr.b1.e02 | Wie „das lesende Kind“: Partizip auf -en | `tr.g.partizip_en` |
| 163 | tr.b1.e02 | eleman ist ein Mitarbeiter | §3.1 |
| 164 | tr.b1.e02 | patron ist die Chefin oder der Chef | §3.1 |
| 165 | tr.b1.e02 | Kolleginnen und Kollegen: siz oder sen? | §4.1 |
| 166 | tr.b1.e03 | okuduğum kitap: das Buch, das ich lese | `tr.g.partizip_dik` |
| 167 | tr.b1.e03 | Die Endung zeigt, wer handelt: okuduğun, okuduğu | `tr.g.partizip_dik` |
| 168 | tr.b1.e03 | kombi ist die Gastherme | §3.1 |
| 169 | tr.b1.e03 | 3+1 heißt drei Zimmer und ein Wohnzimmer | §4.6 |
| 170 | tr.b1.e03 | kira und depozito: Miete und Kaution | §3.1 |
| 171 | tr.b1.e04 | gideceğimiz şehir: Partizip mit Zukunft | `tr.g.partizip_ecek` |
| 172 | tr.b1.e04 | -ip verbindet zwei Handlungen | `tr.g.konverb_ip` |
| 173 | tr.b1.e04 | Zeit und Person nur am letzten Verb | `tr.g.konverb_ip` |
| 174 | tr.b1.e04 | pansiyon: Gästehaus, kein Ruhegehalt | §3.1 |
| 175 | tr.b1.e05 | yürüyerek: Wie? mit -erek | `tr.g.konverb_erek_meden` |
| 176 | tr.b1.e05 | düşünmeden: ohne zu … | `tr.g.konverb_erek_meden` |
| 177 | tr.b1.e05 | sağlıklı, sağlıksız: gesund und ungesund | `tr.g.wortbildung1` |
| 178 | tr.b1.e05 | Ratschläge mit -meli: Daha çok su içmelisin | `tr.g.meli_lazim` |
| 179 | tr.b1.e06 | „wenn“ ist -se am Verb | `tr.g.bedingung_se` |
| 180 | tr.b1.e06 | eğer ersetzt die Endung nicht | `tr.g.bedingung_se` |
| 181 | tr.b1.e06 | direksiyon ist das Lenkrad | §3.1 |
| 182 | tr.b1.e06 | otoban: die Autobahn als Lehnwort | §3.2 |
| 183 | tr.b1.e06 | ehliyet und sürmek: Führerschein und Auto fahren | §3.4 |
| 184 | tr.b1.e07 | Eve gelince: sobald | `tr.g.konverb_ince` |
| 185 | tr.b1.e07 | „bevor“ sieht verneint aus: yatmadan önce | `tr.g.temporal_dik` |
| 186 | tr.b1.e07 | „nachdem“: yedikten sonra | `tr.g.temporal_dik` |
| 187 | tr.b1.e07 | veli: Erziehungsberechtigte (veli toplantısı) | §3.4 |
| 188 | tr.b1.e07 | Lehrkräfte anreden: Öğretmenim oder Ayla Hanım | §4.2 |
| 189 | tr.b1.e08 | dass-Sätze als Nomen: geldiğini biliyorum | `tr.g.nominal_dik` |
| 190 | tr.b1.e08 | Indirekte Fragen: Nerede olduğunu bilmiyorum | `tr.g.soru_dolayli` |
| 191 | tr.b1.e08 | „ob“ = -ip -mediğini | `tr.g.soru_dolayli` |
| 192 | tr.b1.e08 | röportaj ist ein Interview | §3.1 |
| 193 | tr.b1.e08 | reklam ist Werbung, keine Reklamation | §3.1 |
| 194 | tr.b1.e09 | „weil“: -diği için oder çünkü | `tr.g.kausal_dik` |
| 195 | tr.b1.e09 | „während“: -ken bleibt immer gleich | `tr.g.konverb_ken` |
| 196 | tr.b1.e09 | Çocukken: als ich ein Kind war | `tr.g.konverb_ken` |
| 197 | tr.b1.e09 | Sich beschweren mit lütfen und rica ederim | §4.4 |
| 198 | tr.b1.e10 | keşke + -se: wenn doch nur | `tr.g.bedingung_wunsch` |
| 199 | tr.b1.e10 | Vorschlag: Erken çıksak mı? | `tr.g.bedingung_wunsch` |
| 200 | tr.b1.e10 | moral heißt Stimmung | §3.1 |
| 201 | tr.b1.e10 | şans heißt Glück und Chance | §3.1 |
| 202 | tr.b1.e11 | Gelmeni istiyorum: -me + Besitzendung | `tr.g.mesi_nominal` |
| 203 | tr.b1.e11 | Formu doldurmanız gerekiyor: Sie müssen … | `tr.g.mesi_nominal` |
| 204 | tr.b1.e11 | medeni hali: Familienstand | §4.5 |
| 205 | tr.b1.e11 | Familienname zuerst: soyadı, adı | §4.5 |
| 206 | tr.b1.e12 | diye steht hinter dem Zitat | `tr.g.diye` |
| 207 | tr.b1.e12 | diye für „damit“: Geç kalmayayım diye | `tr.g.diye` |
| 208 | tr.b1.e12 | aidat: Mitgliedsbeitrag | §3.4 |
| 209 | tr.b1.e12 | gönüllü: freiwillig, die Ehrenamtlichen | §3.4 |
| 210 | tr.b1.e13 | „je … desto“: -dikçe | `tr.g.konverb_dikce` |
| 211 | tr.b1.e13 | ise: was … betrifft | `tr.g.ise_nominal` |
| 212 | tr.b1.e13 | yoksa: sonst | `tr.g.ise_nominal` |
| 213 | tr.b1.e13 | klima ist die Klimaanlage, das Klima heißt iklim | §3.1 |
| 214 | tr.b1.e14 | „hätte … würde“: -seydi … -irdi | `tr.g.bedingung_irreal` |
| 215 | tr.b1.e14 | Wie der Konjunktiv II: zwei feste Bausteine | `tr.g.bedingung_irreal` |
| 216 | tr.b1.e14 | Wissenschaftswörter: -syon, -ite, -ik | §3.3 |
| 217 | tr.b1.e14 | röntgen: aus dem Namen eines deutschen Forschers | §3.2 |
| 218 | tr.b1.e15 | ki wie „dass“: Biliyorum ki zor | `tr.g.ki_konj` |
| 219 | tr.b1.e15 | ki getrennt, aber sanki und halbuki zusammen | `tr.g.ki_konj` |
| 220 | tr.b1.e15 | staj und stajyer: Praktikum und Praktikant | §3.2 |
| 221 | tr.b1.e15 | diploma ist jedes Abschlusszeugnis | §3.1 |
| 222 | tr.b1.e16 | Sen mi pişirdin? mi zeigt den Fokus | `tr.g.fokus_soru` |
| 223 | tr.b1.e16 | tarif ist das Küchenrezept, reçete das vom Arzt | §3.1 |
| 224 | tr.b1.e16 | menü ist die Speisekarte | §3.1 |
| 225 | tr.b1.e16 | Elinize sağlık: Lob für die Köchin oder den Koch | §4.3 |
| 226 | tr.b2.e01 | -mış wie „soll“ oder Konjunktiv I | `tr.g.evidential` |
| 227 | tr.b2.e01 | -mış am Nomen: hastaymış | `tr.g.evidential` |
| 228 | tr.b2.e01 | Berichtete Rede: … açılacağını açıkladı | `tr.g.rede_formal` |
| 229 | tr.b2.e01 | manşet ist die Schlagzeile, magazin die Klatschpresse | §3.1 |
| 230 | tr.b2.e02 | Passiv mit -il oder -in: yapıldı, okundu | `tr.g.passiv` |
| 231 | tr.b2.e02 | „man“ in Regeln: Burada konuşulmaz | `tr.g.passiv` |
| 232 | tr.b2.e02 | lisans ist der Bachelor, vize auch die Zwischenprüfung | §3.1 |
| 233 | tr.b2.e02 | Lebenslauf heißt özgeçmiş | §4.5 |
| 234 | tr.b2.e03 | „lassen“ ist eine Endung: yaptırdık | `tr.g.kausativ` |
| 235 | tr.b2.e03 | Saçımı kestim oder kestirdim? | `tr.g.kausativ` |
| 236 | tr.b2.e03 | fayans ist die Fliese | §3.1 |
| 237 | tr.b2.e03 | şalter und dübel: deutsche Wörter auf der Baustelle | §3.2 |
| 238 | tr.b2.e04 | „sich waschen“: yıkanmak | `tr.g.reflexiv_reziprok` |
| 239 | tr.b2.e04 | Vermutung: -miş olmalı | `tr.g.modal_vermutung` |
| 240 | tr.b2.e04 | tansiyon ist der Blutdruck, serum die Infusion | §3.1 |
| 241 | tr.b2.e04 | kriz ist auch der Anfall | §3.1 |
| 242 | tr.b2.e05 | „obwohl“: -mesine rağmen | `tr.g.konzessiv` |
| 243 | tr.b2.e05 | „auch wenn“: -se de | `tr.g.konzessiv` |
| 244 | tr.b2.e05 | ekip: Team, aus dem Französischen | §3.2 |
| 245 | tr.b2.e06 | sayesinde oder yüzünden: dank oder wegen | `tr.g.kausal_formal` |
| 246 | tr.b2.e06 | Amtsbausteine: -diği takdirde, -mediği sürece | `tr.g.bedingung_formal` |
| 247 | tr.b2.e06 | Bittschrift (dilekçe): Empfänger oben im Dativ | §4.5 |
| 248 | tr.b2.e07 | -sel/-sal: bilimsel, çevresel | `tr.g.wortbildung2` |
| 249 | tr.b2.e07 | -leşmek: -er werden | `tr.g.wortbildung2` |
| 250 | tr.b2.e07 | yeşilimsi: grünlich | `tr.g.wortbildung2` |
| 251 | tr.b2.e08 | amacıyla: das förmliche „um zu“ | `tr.g.final_formal` |
| 252 | tr.b2.e08 | sigorta: Versicherung und Sicherung | §3.1 |
| 253 | tr.b2.e08 | promosyon: Werbegeschenk, keine Doktorfeier | §3.1 |
| 254 | tr.b2.e09 | yaptırıldı: von innen nach außen lesen | `tr.g.diathese_kombi` |
| 255 | tr.b2.e09 | geliştirildi: wurde entwickelt | `tr.g.diathese_kombi` |
| 256 | tr.b2.e09 | Fachwörter aus dem Französischen: laboratuvar, analiz | §3.3 |
| 257 | tr.b2.e10 | „sobald“: gelir gelmez | `tr.g.zeitfolge_er_mez` |
| 258 | tr.b2.e10 | „bis“: bitene kadar ohne Verneinung | `tr.g.zeitfolge_er_mez` |
| 259 | tr.b2.e10 | „seit“: taşınalı iki yıl oldu | `tr.g.zeitfolge_er_mez` |
| 260 | tr.b2.e11 | -dir in Verträgen: yükümlüdür | `tr.g.dir_vermutung` |
| 261 | tr.b2.e11 | -dir als Vermutung wie das Futur II | `tr.g.dir_vermutung` |
| 262 | tr.b2.e11 | depozito: die Kaution | §3.1 |
| 263 | tr.b2.e12 | masmavi, bembeyaz: verstärkte Farben | `tr.g.verdoppelung` |
| 264 | tr.b2.e12 | yavaş yavaş: Verdoppelung | `tr.g.verdoppelung` |
| 265 | tr.b2.e12 | usta, kalfa, çırak: Meister, Geselle, Lehrling | §3.4 |
| 266 | tr.b2.e13 | „als ob“: -miş gibi, sanki | `tr.g.mis_gibi` |
| 267 | tr.b2.e13 | madem: da ja | `tr.g.konnektoren_b2` |
| 268 | tr.b2.e13 | oysa: dabei doch | `tr.g.konnektoren_b2` |
| 269 | tr.b2.e13 | Deutsche Wörter im Türkischen der Familie: Termin → randevu | §5.2 |
| 270 | tr.b2.e14 | -iver: mal eben | `tr.g.aspekt_iver` |
| 271 | tr.b2.e14 | belediye: Stadt- und Gemeindeverwaltung | §3.4 |
| 272 | tr.b2.e14 | muhtar: Ortsvorsteher | §3.4 |
| 273 | tr.b2.e15 | gençlerin yüzde altmışı | `tr.g.statistik` |
| 274 | tr.b2.e15 | „jeder Dritte“: her üç kişiden biri | `tr.g.statistik` |
| 275 | tr.b2.e15 | Dezimalkomma wie im Deutschen | §4.6 |
| 276 | tr.b2.e16 | „lieber … als“: -mektense | `tr.g.praeferenz` |
| 277 | tr.b2.e16 | „statt“: -mek yerine | `tr.g.praeferenz` |
| 278 | tr.b2.e16 | hesap oder fatura: zwei Wörter für „Rechnung“ | §3.4 |
| 279 | tr.c1.e01 | Nominalstil: die Brücke zum deutschen Amtsstil | `tr.g.nominalstil` |
| 280 | tr.c1.e01 | Genitiv nicht vergessen: projenin tamamlanması | `tr.g.nominalstil` |
| 281 | tr.c1.e02 | -mektedir: „wird … “ im Bescheid | `tr.g.amtsstil` |
| 282 | tr.c1.e02 | itiraz: Widerspruch einlegen | §3.4 |
| 283 | tr.c1.e03 | Lange Attribute rückwärts lesen | `tr.g.partizip_komplex` |
| 284 | tr.c1.e03 | Wie deutsche Partizipialattribute | `tr.g.partizip_komplex` |
| 285 | tr.c1.e04 | geliyom, napıyon: verstehen, nicht schreiben | `tr.g.umgangssprache` |
| 286 | tr.c1.e04 | N'aber? – Was gibt's? | `tr.g.umgangssprache` |
| 287 | tr.c1.e04 | Anrede zwischen den Generationen | `tr.g.anrede` |
| 288 | tr.c1.e05 | göz yummak: ein Auge zudrücken | `tr.g.redewendungen` |
| 289 | tr.c1.e05 | Nicht wörtlich übertragen: „Ich verstehe nur Bahnhof“ | `tr.g.redewendungen` |
| 290 | tr.c1.e06 | öte yandan, dolayısıyla: Absätze verbinden | `tr.g.textkonnektoren` |
| 291 | tr.c1.e06 | enerji tasarrufu: Energie sparen | §3.4 |
| 292 | tr.c1.e07 | kanımca: meines Erachtens | `tr.g.argumentation` |
| 293 | tr.c1.e07 | -mekle birlikte: zwar … aber | `tr.g.argumentation` |
| 294 | tr.c1.e07 | doçent und tez: Hochschulwörter mit anderem Inhalt | §3.1 |
| 295 | tr.c1.e08 | Eine Endung für die ganze Reihe | `tr.g.suspendierte_endung` |
| 296 | tr.c1.e08 | okunmuş ve onaylanmıştır | `tr.g.suspendierte_endung` |
| 297 | tr.c1.e09 | acaba macht Bitten weich | `tr.g.hoeflichkeit_strategien` |
| 298 | tr.c1.e09 | Kritik mit sanırım beginnen | `tr.g.hoeflichkeit_strategien` |
| 299 | tr.c1.e09 | konferans ist oft ein Vortrag | §3.1 |
| 300 | tr.c1.e10 | Sprichwörter mit deutschem Gegenstück | `tr.g.sprichwoerter` |
| 301 | tr.c1.e10 | -cesine: gehobenes „als ob“ | `tr.g.zarf_cesine` |
| 302 | tr.c1.e10 | Märchen beginnen mit -miş: Bir varmış, bir yokmuş | `tr.g.evidential` |
| 303 | tr.c1.e11 | Wortfamilien: hukuk – hukuki | `tr.g.lehnmuster` |
| 304 | tr.c1.e11 | Adverbien auf -en: tamamen, nispeten | `tr.g.lehnmuster` |
| 305 | tr.c1.e12 | Betont ist, was vor dem Verb steht | `tr.g.fokus_devrik` |
| 306 | tr.c1.e12 | Nachgeschoben: Gidiyorum ben | `tr.g.fokus_devrik` |
| 307 | tr.c1.e13 | Abtönung mit hani, işte, bile | `tr.g.partikel_nuancen` |
| 308 | tr.c1.e13 | ya: das „doch“ im Widerspruch | `tr.g.partikel_nuancen` |
| 309 | tr.c1.e14 | Register wählen: Amt, Arbeit, Familie | `tr.g.amtsstil` |
| 310 | tr.c1.e14 | Zwei Sprachen, ein Kopf: Türkisch und Deutsch als Stärke | §5 |

## 7 Messwerte und Methode

| Messung | Wert | Quelle und Methode |
|---|---|---|
| Internationalismen: türkische Nomen mit ähnlich geschriebener deutscher Glosse | Top-1.000: 33 von 481 (6,9 %) · Top-2.000: 71 von 838 (8,5 %) · Top-5.000: 185 von 1.628 (11,4 %) | Lemma-Liste des Rahmenplans mit deutscher Glosse (kaikki); Ähnlichkeit ≥ 0,75 nach Angleichung der Schreibung (Schätzung) |
| Pronomen im türkischen Satz, wenn der deutsche eines hat | „ich“ → ben: 820 von 6.329 (13,0 %) · „du“ → sen: 261 von 2.359 (11,1 %) · „wir“ → biz: 155 von 981 (15,8 %) | Tatoeba-Export vom 10.10.2026, 22.316 direkte Paare de↔tr (Beleg S7 §3.2) |
| Türkische Sätze, die auf eine Verb- oder Personalendung enden | 17.339 von 22.316 (77,7 %) | dto.; grobe Musterzählung am letzten Wort (Hinweis auf das Verb am Ende) |
| Lemmata gegen die Vokalharmonie (helle und dunkle Vokale gemischt) | Top-1.000: 150 von 999 (15,0 %) · Top-2.000: 372 von 1.999 (18,6 %) · Top-5.000: 1.077 von 4.997 (21,6 %) | Lemma-Liste des Rahmenplans (wordfreq 3.1.1 `small_tr`, lemmatisiert über kaikki; ohne Tabu-, Religions- und Registertreffer); Verben ohne -mek/-mak |
| Wortformen mit Sonderbuchstaben (ç, ğ, ı, ö, ş, ü) | Top-1.000: 404 von 1.000 (40,4 %), davon mit ı 177 · Top-5.000: 2.263 von 5.000 (45,3 %) | wordfreq 3.1.1 `small_tr`, nur Wortformen aus Buchstaben |
| Wortformen, die ohne Sonderbuchstaben zusammenfallen (wie kır – kir) | Top-5.000: 67 Gruppen mit 134 Formen · Top-20.000: 330 Gruppen mit 672 Formen | dto.; Grund für den Lexikonschutz im Abgleich (PLAN §4.1) |
| Glossen in der Ausgangssprache Deutsch (Top-1.000 / Top-5.000) | 89 % / 82 % | Beleg S7 §3.6 (tr-aus-de) |

**Methode.**
- Gelesen wurden nur die S7-Auszüge im Scratchpad (`l0/S7/auszug/`: Häufigkeit, kaikki-Kern und kaikki-Auszüge, Tatoeba) und die Lemma-Liste des Rahmen-Generators (`l3-rahmen-tr/lem.json`), mit `python3 -I`.
- Skripte: `l3-kontrast-tr-b/messen.py`; Generator und Prüfungen: `l3-kontrast-tr-b/bauen.py` (alle im Scratchpad der Sitzung, Übernahme nach `_lernapp/werkzeuge/` in L3).
- In dieses Dokument gelangen nur Zahlen und Beispiele in Lateinschrift bzw. Umschrift; kein Tatoeba-Satz und kein Wiktionary-Text.
- Ähnlichkeits- und Mustermessungen sind Schätzungen; sie zeigen die Größenordnung, nicht die genaue Zahl.

## 8 Zu prüfen und offene Fragen

Alle laufen mit ihrem Standard weiter (L3-E12, kein Warten).

| ID | Frage | Standard | Wer |
|---|---|---|---|
| KT-de-01 | Notenskala in der Türkei: Ist „die höhere Zahl ist besser“ für alle Schularten richtig? | Tipp nennt nur „umgekehrt als in Deutschland“, ohne Einzelheiten. | Stichprobe LM-01 |
| KT-de-02 | grip: Wird es im Alltag auch für starke Erkältungen gebraucht? | Tipp nennt nur die Grippe; Erkältung = nezle, soğuk algınlığı. | LM-01 |
| KT-de-03 | Wechsel von siz zu sen: Gibt es ein festes „Du anbieten“? | Tipp beschreibt nur den stillen Wechsel. | LM-01 |
| KT-de-04 | Hinweis zum mehrfachen Anbieten (§4.4) ohne Stereotyp formuliert? | Tipp beschreibt die Situation, ohne Herkunft zu bewerten. | Redaktion, LM-09 |
| KT-de-05 | Gesten: Kopf nach hinten mit „cık“ = nein; seitliches Kopfwiegen = Rückfrage | Tipp erst nach Bestätigung, dann als Text ohne Bild; Bildkarten zeigen keine Menschen (KERN §5) | LM-01 |
| KT-de-06 | Wörter aus der Gemeinde, die deutsch gesagt werden (§5.2) | Liste als Vorschlag; Stichprobe bestätigt. | LM-01 |
| KT-de-07 | Türkische Buchstaben in deutschen Formularen und Systemen | Tipp: wie im Pass schreiben; Ersatz durch Systeme möglich (ohne Rechtsangabe). | LM-01 |
| KT-de-08 | Lehnübersetzungen (randevu yapmak, sınav yazmak, fotoğraf yapmak): wie verbreitet? | Tipps zeigen die Standardform ohne Wertung. | LM-01 |
| KT-de-09 | Echte und falsche Freunde in der Jugendsprache (kombi, tost, market) | wie §3.1 | LM-01 |
| KT-de-10 | Sprichwörter mit deutschem Gegenstück (C1-e10): Passen die Paare? | nur die zwei Paare aus `tr.g.sprichwoerter`; weitere nach Liste der Redaktion (OF-tr-11) | Redaktion, LM-02 |
| KT-de-11 | „Sevgili …“ als Briefanrede: Das Tabu-Lexikon führt sevgili als Wort für eine Liebesbeziehung und meldet es (Leitfaden §2.3). | Briefanrede in Übungen bis zur Entscheidung mit Merhaba oder Canım; Ausnahme „sevgili + Name am Briefanfang“ für das Lexikon vorschlagen | LM-09, L3-Werkzeug |
| KT-de-12 | Typische Fehler sind Erfahrungswerte, nicht gemessen. | Die Muttersprachler-Stichprobe und Meldungen aus der App (ADR 0041 Nr. 9) schärfen sie nach. | L3, LM-01 |

## 9 Herkunft und Prüfungen

- **Entwurf:** KI-Lauf `ki:l3-kontrast` am 20.10.2026 (L3-01, vorgezogen), auf Grundlage des Rahmenplans Türkisch, des Inhaltsleitfadens und der Lemma-Liste des Rahmen-Generators.
- **Eigene Darstellung:** Keine fremden Lehrwerke oder Kontrastgrammatiken übernommen; GER nur als Stufen (ADR 0045 Nr. 8, LM-36).
- **Automatische Prüfungen des Generators:**
  - alle 109 Grammatik-IDs des Rahmenplans genau einmal in §2
  - 310 Tipps auf 74 gültigen Einheiten-Schlüsseln; jede Einheit mit mindestens zwei Tipps; Grammatik-Bezug nie vor seiner Einführung; jeder Abschnitts-Bezug vorhanden; keine doppelten Titel
  - Einheiten der falschen Freunde gültig
  - Tabu-Lexikon des Leitfadens (de, tr, ar-Umschrift): 0 ungeklärte Treffer; Fehlalarme und bewusste Nennungen: „parti“ (tr, Politik) in Partizip und Partikel (28); „sevgili“ (tr, Beziehungen) als Briefanrede, bewusst genannt als offene Frage KT-de-11 bzw. KT-ar-11 (5)
  - 0 arabische Zeichen (U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF)
- **Menschliche Prüfung:** Stichprobe der Muttersprachler (LM-01) mit den Punkten aus §8; Abnahme zusammen mit dem Rahmenplan (LM-02).
