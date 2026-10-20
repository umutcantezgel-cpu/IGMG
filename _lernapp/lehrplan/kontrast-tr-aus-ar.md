# Kontrastdokument Türkisch aus Arabisch (`tr-aus-ar`)

- **Stand:** 20.10.2026, Version 0.1.0-entwurf (L3-01, vorgezogen)
- **Status:** Entwurf. Er gilt als Standard für die kontrastiven Tipps, Ablenker und angenommenen Antworten der Richtung `tr-aus-ar`, bis die Muttersprachler-Stichprobe (LM-01) und die Abnahme des Rahmens (LM-02) andere Ergebnisse bringen.
- **Zweck:** Grundlage für die Phase Ü (Übersetzung je Richtung) der Inhalts-Pipeline (PLAN §6.3) und für die ≈ 300 kontrastiven Tipps je Richtung (PLAN §5.1). Ablage nach PLAN §6.1.
- **Bezug:**
  - Rahmenplan Türkisch: `web/inhalte/lernapp/rahmen/tr.rahmen.json`, `RAHMEN-tr.md` (§2.1 Lernende, §4 Vorkurs, §5 Grammatikfolge, §10 offene Fragen OF-tr-01 bis OF-tr-14)
  - Vorkurs Lateinschrift im Rahmenplan Deutsch (`de.v.l01`–`de.v.l06`, `RAHMEN-de.md`)
  - PLAN §4 (Übungstypen, `schrift_latein`, `schrift_tr`, `minimalpaare`, Antwortabgleich §4.1), §5.1, §6.1–§6.4
  - KERN §2 (KI-Regel 2), §3 (arabische Schrift nur in freigegebenen Dateien), §4 (Sprachausgabe), §5 (Kinderschutz), §7 (Oberfläche von rechts nach links)
  - Inhaltsleitfaden `_lernapp/lehrplan/INHALTSLEITFADEN.md` (Tabu-Lexikon, Namen, Formel-Kandidaten §4.2, weltliche Alternativen §4.3)
  - Beleg S7 (`_lernapp/belege/S7-sprachdaten.md`), ADR 0041, ADR 0045 (Nr. 8: GER nur als Stufen)
- **Gegenstück:** `_lernapp/lehrplan/kontrast-tr-aus-de.md` (gleiche Zielsprache); dieselben Lernenden mit Zielsprache Deutsch: `_lernapp/lehrplan/kontrast-de-aus-ar.md`
- **Umfang:** 109 Grammatik-IDs mit Kontrast (§2), 88 falsche und halbe Freunde (§3.1), 117 Lehnwörter mit gleicher Bedeutung (§3.2), 308 Tipp-Themen auf 74 Einheiten-Schlüssel (§6).

> **KI-Regel 2 (ADR 0040, KERN §2):** Keine Koranverse, Hadithe, Bittgebete oder anderen religiösen Texte (weder arabisch
> noch übersetzt), keine Koran-Wortbedeutungen, keine Fiqh-Aussagen. Der Sprachkurs ist ohne Religionsbezug. Religiöse Formeln
> gibt es nur aus einer später von zwei Gelehrten freigegebenen Liste; hier stehen sie nur als Verweis auf die gesperrten
> Kandidaten des Leitfadens (§4.7), nie als Lernziel. Arabische Schrift ist in dieser Datei verboten: Arabisch steht nur in
> Umschrift (DIN 31635 vereinfacht).

**Lesart.**
- „Türkisch“ meint das Standardtürkische (Türkiye Türkçesi). „Arabisch“ meint das Hocharabische (fuṣḥā), wie es Schule und Medien vermitteln. Wo ein Dialekt anders ist, steht das ausdrücklich da („dialektal“, mit Region).
- Arabische Wörter stehen in Umschrift: ā, ī, ū lang; ʿ (ʿAyn), ʾ (Hamza); ḥ, ḫ, ṣ, ḍ, ṭ, ẓ, ṯ, ḏ, ǧ, ġ, š, q. Der Artikel steht mit Bindestrich (al-kitāb, aš-šams). Kasusendungen nur, wo sie für den Kontrast zählen.
- Türkische Wörter stehen in türkischer Lateinschrift, deutsche Erklärungen in normaler Schreibung.
- In der Spalte „typischer Fehler“ stehen fehlerhafte Formen in „…“. Sie sind Material für Ablenker und für den Abgleich (PLAN §4.1), nie Musterlösung.
- „Vertraut“ markiert eine Brücke: Das Arabische kennt die Sache schon. Tipps nennen die Brücke zuerst.
- Aufgenommen sind nur Kontraste, die sicher sind. Was die Stichprobe bestätigen soll, trägt „zu prüfen“ und steht zusätzlich in §8.
- Die typischen Fehler sind Erfahrungswerte aus dem Unterricht des Türkischen für Arabischsprachige, noch nicht gemessen (§8, KT-ar-10).

**Wer lernt.** Arabischsprachige jeden Alters, die in Deutschland leben, aus verschiedenen Ländern und mit verschiedenen Dialekten: Kinder ab etwa zehn, Jugendliche, Eltern und Ältere. Sie lernen Türkisch für Nachbarschaft, Freundeskreis, Schule, gemischte Familien und Reisen. Die Lateinschrift kennen viele aus dem Deutschunterricht; sonst lernen sie sie im Vorkurs des Deutschkurses (`de.v.l01`–`de.v.l06`). Manche Familien haben vor Deutschland in der Türkei gelebt, andere sprechen Türkmenisch (§5).

## 0 Kurzfassung

- **Schrift:** Lateinschrift von links nach rechts, getrennte Buchstaben, Groß- und Kleinbuchstaben. Jeder Vokal wird geschrieben. Der Leitsatz für alle Lesetipps: Türkisch schreibt so vollständig wie ein voll vokalisierter Text, nur mit Buchstaben statt Zeichen. Vor dem türkischen Vorkurs steht der Vorkurs Lateinschrift (`de.v.l01`–`de.v.l06`).
- **Laute:** acht Vokale statt drei (neu: e und o als eigene Laute, ı, ö, ü). Neu sind auch p, v, ç und g sowie ğ, das kein Reibelaut ist. Vertraut: c wie ǧ in der Hochsprache, ş wie š, das gerollte r, Doppelkonsonanten wie mit Šadda. Wer einen irakischen oder Golf-Dialekt spricht, kennt ç und g schon.
- **Größte Hürden:** Vokalharmonie (kein Gegenstück), das Verb am Satzende, alles „hinten“ (Endungen und Verhältniswörter statt Präpositionen), Attribute und Besitzer vor dem Nomen, Partizipien statt allaḏī-Sätzen, Nominalformen statt anna-Sätzen.
- **Starke Brücken:** Nominalsatz ohne Verb „sein“, kein Verb „haben“ (ʿindī → var), das Pronomen kann fehlen, die Person als Endung wie im Māḍī, Besitz als Endung wie kitābī, -den wie min (Herkunft, Vergleich), -mek wie der Maṣdar, kāna-Formen (-di, -iyordu, -mişti), Passiv und Kausativ wie die Verbstämme, Nominalstil in C1 und viele Lehnwörter: Rund ein Drittel der häufigen türkischen Nomen mit arabischer Übersetzung klingt ähnlich wie diese (§7).
- **Fallen:** Lehnwörter mit anderer Bedeutung (misafir ist der Gast, fakat heißt „aber“, kaza ist ein Unfall, hala ist die Schwester des Vaters). Die Iḍāfa steht umgekehrt (annemin evi). Nach jeder Zahl steht der Singular, zwischen Zehnern und Einern kein „und“. -i bekommt nur das bestimmte Objekt. ki ist kein allaḏī. değil steht am Ende.
- **Wortschatz:** 88 falsche und halbe Freunde (§3.1), 117 Lehnwörter mit gleicher Bedeutung als Brücke (§3.2) und regelmäßige Lautentsprechungen, mit denen man Lehnwörter wiedererkennt (§1.4).
- **Pragmatik:** siz ist Pflicht gegenüber Fremden, Älteren und Ämtern; Hanım und Bey stehen hinter dem Vornamen. Anreden wie Abū … oder Umm … gibt es nicht. Feste Antwortpaare kennen beide Sprachen (Hoş geldiniz – Hoş bulduk). Religiöse Formeln bleiben gesperrt.
- **Herkunftssprachler und Mehrsprachige:** Familien mit Jahren in der Türkei, Türkmenen aus dem Irak und Syrien, arabisch-türkische Familien; Schwerpunkte sind Schreibung, Schriftsprache und Register (§5).
- **Tipps:** 308 Tipp-Themen, verteilt auf den Vorkurs `tr.v.l01`–`tr.v.l02` und alle 72 Einheiten (§6).

## 1 Laut und Schrift

### 1.1 Schrift und Rechtschreibung

Türkisch wird seit 1928 in Lateinschrift geschrieben, vorher in arabischer Schrift. Das Alphabet hat 29 Buchstaben, jeder steht für einen Laut. Die Grundlagen (Leserichtung, Buchstabenformen, Groß- und Kleinschreibung) kommen aus dem Vorkurs Lateinschrift des Deutschkurses (`de.v.l01`–`de.v.l06`, RAHMEN-tr §2.1). Der türkische Vorkurs `tr.v.l01` ergänzt die Sonderbuchstaben (`schrift_tr`, PLAN §4).

| Schreibung | Türkisch | arabische Entsprechung | typische Verwechslung | Beispiele |
|---|---|---|---|---|
| Vokale | immer geschrieben, auch kurze | kurze Vokale nur als Harakat, im Alltag meist weggelassen | Vokale ausgelassen („kmz“ für kırmızı) oder geraten | kırmızı, öğretmen, otobüs |
| a, e | zwei eigene Buchstaben | beides Fatḥa (je nach Nachbarlaut heller oder dunkler) | a und e vertauscht | el (Hand), al (nimm!) |
| i, ı | zwei Buchstaben: i mit Punkt, ı ohne Punkt | Kasra; ı fehlt | ı als i geschrieben | kız, kır, kir |
| o, u, ö, ü | vier Buchstaben | Ḍamma; ö und ü fehlen | o und u vertauscht, ö als o oder e | on, un, ön, ün |
| c | „dsch“ | wie ǧ in der Hochsprache; in Ägypten als g, in der Levante als weiches „sch“ gesprochen | c als g oder als stimmhaftes „sch“ gelesen | cam, cevap, cadde |
| ç | „tsch“ | fehlt in der Hochsprache; vorhanden im Irak und am Golf | ç als ş | çay, çok, üç |
| ş | wie š | š | Vertraut | şeker, beş, şehir |
| j | stimmhaftes „sch“ (selten) | ǧ in der Levante | – | garaj, jeton |
| p | eigener Laut | fehlt | p als b geschrieben und gesprochen | para, pul, kapı |
| v | eigener Laut, weich | fehlt; in Lehnwörtern steht v für w | v als f | var, ev, vakit |
| g | eigener Laut | fehlt in der Hochsprache; in vielen Dialekten vorhanden | g als k oder als ġ | gel, göz, gül |
| ğ | kein Reibelaut: dehnt den Vokal davor, nie am Wortanfang | ġ ist ein Reibelaut | ğ wie ġ gesprochen | dağ, yağ, öğretmen |
| h | ein einziges h, immer gesprochen | h, ḥ, ḫ sind drei Laute | – | haber (ḫabar), hayat (ḥayāt), hediye (hadiyya) |
| k | ein k für k und q; vor a, ı, o, u weiter hinten | k und q getrennt | Vertraut: Der Unterschied ist im Türkischen nur Klangfarbe | kalem (qalam), kitap (kitāb) |
| s, z, t | je ein Laut | s, ṣ, ṯ; z, ḏ, ḍ, ẓ; t, ṭ | – | sabun (ṣābūn), zaman, tarih (tārīḫ) |
| Doppelkonsonant | doppelt geschrieben und lang gesprochen | Šadda | Vertraut | dikkat (diqqa), elli, anne |
| â, î, û | Zirkumflex in wenigen Lehnwörtern: langer Vokal oder weiches k, g, l davor | langer Vokal | übersehen; der Abgleich nimmt ihn tolerant (PLAN §4.1) | kâtip, hâlâ, dükkân |
| Ziffern | 0–9 | im Osten der arabischen Welt oft andere Ziffernformen, im Maghreb 0–9 | – | 2026, %10 |
| Satzzeichen | Komma und Fragezeichen in der gewohnten Form der Lateinschrift | in arabischer Schrift gespiegelt | gespiegelte Zeichen | Nasılsın? |

**Groß- und Kleinschreibung.**
- Die arabische Schrift kennt keine Großbuchstaben. Im Türkischen beginnen Satz, Namen, Länder, Städte und Sprachen groß (Türkiye, İzmir, Arapça); Nomen sind sonst klein (ev, okul).
- Das Paar i/İ und ı/I: Das große İ hat einen Punkt, das große I keinen. Auf Telefonen mit arabischer oder deutscher Tastatur fehlen Buchstaben; in der App ergänzt die Sonderzeichenleiste sie.

**Schreibregeln, die oft verwechselt werden** (Material für Tipps ab A1):

| Fall | Regel | Beispiel | typischer Fehler |
|---|---|---|---|
| Wortgrenzen | Endungen werden angehängt, Partikeln getrennt geschrieben | evde, okula; Ben de geliyorum. | „ev de“ (Ort), „bende“ (auch) |
| mi Frage | getrennt, mit Vokalharmonie; die Personalendung hängt daran | Geliyor musun? | „Geliyormusun?“ |
| ki „dass“ | getrennt; zusammen nur in festen Wörtern (sanki, belki, halbuki) und als Endung -ki (masadaki) | Biliyorum ki zor. | „Biliyorumki“ |
| Apostroph | nur vor Endungen an Namen; nicht bei Ableitungen | Wetzlar'da, Elif'in; Wetzlarlı | „okul'da“ |

### 1.2 Laute

| Laut | Türkisch | Arabisch | Folge | Übung |
|---|---|---|---|---|
| Vokale | acht kurze Vokale: a, e, ı, i, o, ö, u, ü | drei Vokale (a, i, u), kurz und lang; dialektal auch ē und ō (bēt, yōm) | e/i und o/u werden verwechselt; ı, ö, ü fehlen | Minimalpaare (§1.3); dialektales ē und ō als Brücke für e und o |
| ı | ungerundeter hinterer Vokal: Lippen breit, Zunge hinten | fehlt | ı wird i oder u | `minimalpaare` |
| ö, ü | gerundete vordere Vokale | fehlen | ö wird o oder e, ü wird u oder i | Lippen rund wie bei u, Zunge vorn wie bei i |
| Vokalharmonie | helle (e, i, ö, ü) und dunkle (a, ı, o, u) Vokale folgen einander in Endungen | fehlt als Regel; aber neben ṣ, ṭ, ḍ, ẓ, q klingen Vokale dunkler | Endungen falsch gewählt (evlar) | Brücke: Wie neben ṣ und q die Vokale dunkel werden, färbt im Türkischen der letzte Vokal die Endung. Vorkurs `tr.v.l02` als Hörbild. |
| Vokallänge | in türkischen Wörtern alle Vokale kurz; lang nur durch ğ und in einigen Lehnwörtern | Länge unterscheidet Wörter | Lehnwörter mit arabischer Länge gesprochen (kitāp) | kurz und gleichmäßig sprechen |
| p, b | zwei Laute | nur b | pul und bul klingen gleich | Hand vor den Mund: Bei p spürt man den Luftstoß |
| v, f | zwei Laute | nur f (und w) | var und far klingen gleich | Oberzähne auf die Unterlippe, Stimme an |
| ç | „tsch“ | fehlt in der Hochsprache (irakisch und am Golf vorhanden) | ç wird ş | `minimalpaare` (çok – şok) |
| g | stimmhaftes k | fehlt in der Hochsprache; in Ägypten wird ǧ als g gesprochen, in vielen Dialekten q | g wird k oder ġ | `minimalpaare` (gel – kel) |
| ğ | dehnt den Vokal davor (dağ = daa); zwischen hellen Vokalen leicht wie y (değil) | ġ ist ein Reibelaut | ğ wird ġ | Lesen mit Silbenbögen |
| h | ein h | h, ḥ, ḫ | ḥ und ḫ in Lehnwörtern beibehalten (ḥayat) | kein Lernziel; verständlich bleibt es |
| emphatische Laute | fehlen | ṣ, ḍ, ṭ, ẓ | Lehnwörter emphatisch gesprochen (ṭabiat) | kein Lernziel; Standard ist der einfache Laut |
| ʿAyn und Hamza | fehlen; an ihrer Stelle dehnt sich der Vokal oder es bleibt eine kleine Pause | eigene Laute | sāʿa statt saat | `hoeren_waehlen` |
| Silbenbau | kein Konsonantenpaar am Wortanfang; in Fremdwörtern oft ein Sprossvokal davor (istasyon) | in der Hochsprache ebenfalls kein Paar am Anfang (dialektal möglich) | Vertraut | – |
| Doppelkonsonanten | lang (an-ne, el-li) | Šadda | Vertraut | – |
| r | Zungenspitzen-r, am Wortende oft gehaucht | gerolltes r | Vertraut | – |
| Betonung | meist auf der letzten Silbe; sie wandert mit den Endungen (ev, evLER, evlerDE) | nach Silbengewicht, oft vorletzte Silbe | Betonung auf dem Stamm | klatschen, letzte Silbe betonen |

### 1.3 Hörtraining-Paare

Paare nur aus dem Alltagswortschatz und ohne Wörter des Tabu-Lexikons (Leitfaden §2). Übungstyp `minimalpaare` (PLAN §4). Solange es für Türkisch keine zugelassene Stimme gibt, laufen die Paare als Lese- und Schreibübung; die Hörfassung kommt mit den eigenen Aufnahmen (KERN §4, „Audio folgt“).

| Kontrast | Paare | Einheit |
|---|---|---|
| p und b | pul – bul (Briefmarke – finde!), pil – bil (Batterie – wisse!), kapı – kabı (Tür – sein Gefäß) | tr.v.l01, A1-e04 |
| v und f | var – far (es gibt – Scheinwerfer), av – af (Jagd – Verzeihung) | tr.v.l01, A1-e04 |
| e und i | el – il (Hand – Provinz), ben – bin (ich – tausend), et – it (Fleisch – schieb!) | tr.v.l02, A1-e01 |
| a und e | al – el (nimm! – Hand), alma – elma (das Nehmen – Apfel) | tr.v.l02, A1-e07 |
| o und u | on – un (zehn – Mehl), toz – tuz (Staub – Salz), bol – bul (reichlich – finde!) | tr.v.l02, A1-e03 |
| ı und i | kır – kir (Land – Schmutz), dış – diş (außen – Zahn) | tr.v.l01, A1-e02 |
| ö und o | ön – on (vorn – zehn), köy – koy (Dorf – Bucht) | tr.v.l01, A1-e05 |
| ü und u | üç – uç (drei – Spitze), ün – un (Ruhm – Mehl) | tr.v.l01, A1-e03 |
| ü und i | üç – iç (drei – innen), kül – kil (Asche – Ton) | tr.v.l01, A1-e07 |
| ç und ş | çok – şok (sehr – Schock), kaç – kaş (wie viele – Augenbraue), aç – aş (hungrig – Speise) | tr.v.l01, A1-e07 |
| c und ç | cam – çam (Glas – Kiefer), acı – açı (bitter – Winkel) | tr.v.l01, A1-e10 |
| g und k | gel – kel (komm! – kahl), gül – kül (Rose – Asche) | tr.v.l01, A1-e08 |
| ğ und kurzer Vokal | dağ – da (Berg – auch), yağ – ya (Öl – oder) | tr.v.l01, A1-e11 |
| einfacher und doppelter Konsonant | eli – elli (seine Hand – fünfzig) | tr.v.l02, A1-e03 |

### 1.4 Lautentsprechungen in Lehnwörtern

Viele türkische Wörter kommen aus dem Arabischen, oft über das Osmanische. Wer die Entsprechungen kennt, erkennt sie beim Lesen wieder; die Bedeutung kann sich trotzdem verschoben haben (§3.1).

| Arabisch | Türkisch | Beispiele |
|---|---|---|
| s, ṣ, ṯ | s | ṣābūn → sabun, ṯāniya → saniye |
| z, ḏ, ḍ, ẓ | z | ḍarūrī → zaruri, imḍāʾ → imza, ḥāḍir → hazır, ẓarf → zarf (Umschlag) |
| t, ṭ | t | ṭalab → talep, ṭabīʿa → tabiat |
| h, ḥ, ḫ | h | hadiyya → hediye, ḥayāt → hayat, ḫabar → haber |
| k, q | k | qalam → kalem, qānūn → kanun |
| ǧ | c, am Wortende ç | ǧawāb → cevap, ǧumla → cümle, iḥtiyāǧ → ihtiyaç |
| w | v | waqt → vakit, wazīfa → vazife |
| ġ | meist g | ġāliban → galiba, mašġūl → meşgul |
| ʿ und ʾ | fallen weg; der Vokal wird oft lang | sāʿa → saat, maʿnā → mana, suʾāl → sual |
| b, d am Wortende | p, t; vor Vokal wieder b, d | kitāb → kitap – kitabı, ḥisāb → hesap – hesabı, ʿadad → adet |
| zwei Konsonanten am Wortende | Sprossvokal; vor Vokal fällt er wieder weg | ʿaql → akıl – aklı, fikr → fikir – fikri, nahr → nehir – nehri |
| Doppelkonsonant am Wortende | einfach; vor Vokal wieder doppelt | ḥaqq → hak – hakkı, ḥiss → his – hissi |
| Tāʾ marbūṭa | -e/-a oder -et/-at | ǧumla → cümle, ḥikāya → hikâye; ziyāra → ziyaret, baladiyya → belediye |
| lange Vokale | meist kurz, selten mit Zirkumflex | kitāb → kitap, kātib → kâtip |
| Vokalfarbe | an die Harmonie angepasst | kalima → kelime, sabab → sebep, daraǧa → derece |
| helle Endungen | einige Lehnwörter nehmen helle Endungen trotz dunklem Vokal | saat – saati, hal – hali, kalp – kalbi, dikkat – dikkati |

## 2 Grammatik-Kontraste je Grammatik-ID

Die Tabellen folgen der Grammatikfolge des Rahmenplans (`tr.rahmen.json`, 109 IDs). In Klammern steht die Einheit, die die ID einführt. „Vertraut“ markiert eine Brücke aus dem Arabischen als Ausgangssprache, die der Tipp zuerst nennt. Die typischen Fehler sind Erfahrungswerte und noch nicht gemessen (§8).

### 2.1 Überblick

| Kontrast | Arabisch | Türkisch | Folge für die Tipps |
|---|---|---|---|
| Wortstellung | Verb – Subjekt – Objekt oder Subjekt vorn; Nominalsatz ohne Verb | Subjekt – Objekt – Verb; das Verb steht am Ende | Verb ans Ende; der Nominalsatz ist vertraut. |
| Genus | zwei Genera; Verb, Adjektiv und Zahl richten sich danach | kein Genus | Entlastung; o heißt huwa und hiya. |
| Kasus und Bestimmtheit | drei Kasus in der Hochsprache; al- zeigt die Bestimmtheit | sechs Fälle als Endungen; kein Artikel; -i zeigt das bestimmte Objekt | „al- + Objekt“ wird zu -i. |
| Präpositionen | vor dem Nomen (fī, ilā, min, maʿa) | Endungen und Verhältniswörter hinter dem Nomen | Grundmuster: „vorn → hinten“. |
| Attribut und Iḍāfa | Adjektiv, Iḍāfa und Relativsatz nach dem Nomen | alles vor dem Nomen; der Besitzer steht vorn (annemin evi) | Reihenfolge umkehren. |
| Wortbildung | Wurzel und Muster; innere Plurale | Stamm + Endungen in fester Reihenfolge; ein Plural | Endungen von innen nach außen lesen. |
| Verb | Person vorn und hinten (yaktubu, katabtu); Stämme I–X | Person immer hinten; Passiv, Kausativ, Reziprok als Endungen | Die Stämme sind eine Brücke zu den Diathesen (B2). |
| Zahl | Dual; nach 3–10 Plural, Genus-Polarität | kein Dual; nach jeder Zahl Singular | Entlastung |
| Nebensätze | Bindewort vorn (anna, allaḏī, iḏā, ʿindamā) | Nominalformen und Konverben vor dem Hauptsatz | „Der anna-Satz wird ein Nomen.“ |

### 2.2 A1 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `tr.g.personalpron` (A1-e01) | Kein Genus: o steht für huwa und hiya, sen für anta und anti; kein Dual. siz ist Plural und zugleich die höfliche Anrede an eine Person. Vertraut: Das Pronomen kann wegfallen. | „sen“ zu Lehrkraft oder Ärztin (wie anta) · Suche nach einer weiblichen Form von sen | o = huwa und hiya, sen = anta und anti. siz ist antum – und die höfliche Anrede an eine einzelne Person: Siz nasılsınız? |
| `tr.g.kopula` (A1-e01) | Vertraut: Wie im arabischen Nominalsatz gibt es kein Verb „sein“ in der Gegenwart. Türkisch hängt aber eine Personalendung an. | „Ben öğrenci.“ (wie anā ṭālib, Endung fehlt) · „Ben bir öğrenci.“ | anā ṭālib = Öğrenciyim: Die Endung -(y)im ersetzt das anā. In der 3. Person reicht das Nomen: O öğretmen (huwa muʿallim). |
| `tr.g.vokalharmonie` (A1-e02) | Acht Vokale statt drei; Endungen haben zwei oder vier Formen nach dem letzten Vokal. Ohne Gegenstück im Arabischen. | „evlar“, „kitapler“, „okulde“, „gözum“ | Erst hören, dann die Regel: helle Vokale (e, i, ö, ü) und dunkle (a, ı, o, u). Der letzte Vokal des Wortes wählt die Endung: evde, okulda. |
| `tr.g.bu_su_o` (A1-e02) | Arabisch unterscheidet Genus und setzt den Artikel (hāḏā l-kitāb, hāḏihi l-madrasa); Türkisch hat drei Stufen der Nähe, kein Genus und keinen Artikel. | „Bu bir kitap“ für „dieses Buch“ (heißt: Das ist ein Buch) · „kitap bu“ (Stellung wie im ägyptischen il-kitāb da) | hāḏā l-kitāb = bu kitap (dieses Buch); hāḏā kitāb = Bu bir kitap (Das ist ein Buch). bu gilt für hāḏā und hāḏihi. |
| `tr.g.frage_mi` (A1-e02) | Arabisch fragt mit hal oder a- am Anfang; Türkisch setzt mi hinter das Erfragte, getrennt geschrieben, mit Vokalharmonie und Personalendung. | „Mi öğretmensin?“ (wie hal vorn) · „Öğretmenmisin?“ (zusammengeschrieben) | hal steht vorn, mi hinten: Hal anta muʿallim? = Öğretmen misin? mi folgt der Harmonie: mi, mı, mu, mü. |
| `tr.g.plural` (A1-e03) | Nur eine Pluralendung (-ler/-lar), keine inneren Plurale; nach jeder Zahl der Singular – auch nach 3 bis 10, wo das Arabische den Plural setzt. | „üç kitaplar“ · „kütüp“ (arabischer Plural übertragen) | Ein Plural für alles: kitaplar (nicht „kütüp“). Nach Zahlen immer Singular: üç kitap (ṯalāṯat kutub), on bir kitap (aḥada ʿašara kitāban). |
| `tr.g.zahlen` (A1-e03) | Arabisch nennt bei 21–99 zuerst den Einer (wāḥid wa-ʿišrūn) und richtet die Zahl nach dem Genus; Türkisch nennt den Zehner zuerst, ohne „und“ und ohne Genus. | „bir yirmi“ (wie wāḥid wa-ʿišrūn) · „yirmi ve bir“ | Türkisch zählt in der Reihenfolge der Ziffern: yirmi bir (20 + 1), ohne ve. Zahlen ändern sich nie nach dem Genus. |
| `tr.g.degil` (A1-e03) | Vertraut: değil entspricht laysa und bekommt wie lastu, lasta eine Personalendung – steht aber am Satzende. | „Ben değil öğretmen.“ (Stellung wie lastu muʿalliman) · „Ben öğretmen yok.“ | değil ist das türkische laysa: lastu muʿalliman = Öğretmen değilim. Die Personalendung hängt an değil. |
| `tr.g.var_yok` (A1-e04) | Vertraut: Wie im Arabischen gibt es kein Verb „haben“ (ʿindī). Bei Personen heißt es Besitzendung + var, bei Gegenständen auch bende … var. | „Bende bir kardeş var.“ (für Geschwister) · „Benim bir kardeş var.“ (Besitzendung fehlt) | ʿindī aḫ = Bir kardeşim var. Bei Dingen, die man dabeihat, geht auch bende: Bende kalem var (ʿindī qalam). „nicht vorhanden“ = yok. |
| `tr.g.possessiv` (A1-e04) | Vertraut: Besitz hängt als Endung am Nomen wie in kitābī. Aber die Laute sind anders verteilt: türkisch -im = mein, -i = sein/ihr. | „kitabi“ oder „kitabı“ für „mein Buch“ (nach kitābī; kitabı heißt „sein Buch“) | kitābī = kitabım, kitābuka = kitabın, kitābuhu/kitābuhā = kitabı, kitābunā = kitabımız. |
| `tr.g.lokativ` (A1-e05) | fī steht vor dem Nomen, -de/-da dahinter; nach harten Konsonanten -te/-ta. | „içinde ev“ (fī nachgebaut) · „okulde“, „parkda“ | fī l-bayt = evde, fī l-madrasa = okulda. Nach p, ç, t, k, f, h, s, ş: parkta. |
| `tr.g.eigenname_apostroph` (A1-e05) | Die arabische Schrift kennt weder Großbuchstaben noch Apostroph; im Türkischen beginnen Namen groß und Endungen stehen hinter einem Apostroph. | „wetzlarda“, „elifin“ · „okul'da“ | Namen groß, Endung mit Apostroph: Wetzlar'da, Elif'in. Normale Wörter klein und ohne Apostroph: okulda. |
| `tr.g.fragewoerter` (A1-e05) | Vertraut: Wie ayna, ilā ayna, min ayna trennt Türkisch wo, wohin, woher. Das Fragewort steht aber vor dem Verb, nicht am Satzanfang. | „Nerede gidiyorsun?“ (wo statt wohin) · „Ne zaman sen geliyorsun?“ | ayna = nerede, ilā ayna = nereye, min ayna = nereden. Das Fragewort rückt vor das Verb: Sen nerede oturuyorsun? |
| `tr.g.iyor` (A1-e06) | Die Person steht am Ende des Verbs (yazıyorum), nicht vorn wie in aktubu, taktubu; Stämme auf -a/-e ändern den Vokal. | „ben yazıyor“ (Personalendung fehlt) · „bekleyor“ | aktubu (jetzt) = yazıyorum, taktubu = yazıyorsun. Stamm auf -a/-e: anlamak → anlıyor. |
| `tr.g.wortstellung` (A1-e06) | Arabisch stellt das Verb oft an den Anfang (VSO) oder in die Mitte; Türkisch stellt es ans Ende. | „Gidiyor Elif okula.“ (wie taḏhabu Elif …) · „Elif gidiyor okula.“ | Erst alles sagen, dann das Verb: Elif okula gidiyor. Das Wichtigste steht direkt vor dem Verb. |
| `tr.g.akkusativ` (A1-e07) | Arabisch markiert jedes Objekt im Akkusativ, die Bestimmtheit mit al-; Türkisch hängt -(y)i nur an das bestimmte Objekt. | „Bu elma alıyorum.“ (Endung fehlt) · „Elmayı alıyorum.“ für „Ich kaufe Äpfel“ | -(y)i heißt zugleich „bestimmt“ und „Objekt“: āḫuḏu t-tuffāḥa = Elmayı alıyorum; āḫuḏu tuffāḥan = Elma alıyorum. |
| `tr.g.konsonant` (A1-e07) | Am Wortende stehen p, ç, t, k; vor Vokal werden sie weich. Bei Lehnwörtern kommt so der arabische Laut zurück (kitāb → kitap → kitabı). | „kitab“ (arabische Form) · „kitapı“ | Das b von kitāb wird am Ende zu p und kehrt vor Vokal zurück: kitap – kitabı, kalp – kalbi, cevap – cevabı. |
| `tr.g.adjektiv` (A1-e05) | Arabisch stellt das Adjektiv hinter das Nomen und gleicht es an; Türkisch stellt es davor, unverändert. | „ev büyük“ für „großes Haus“ (heißt: Das Haus ist groß) · „büyükler evler“ | Umgekehrt: bayt kabīr = büyük ev, buyūt kabīra = büyük evler. ev büyük ist ein ganzer Satz: Das Haus ist groß. |
| `tr.g.dativ` (A1-e08) | ilā und li- stehen vorn, -(y)e/-(y)a hinten; einige Verben verlangen -e, wo das Arabische anders konstruiert (sormak). | „İzmir'de gidiyoruz.“ (wo statt wohin) · „Annemi soruyorum.“ (heißt: Ich frage nach meiner Mutter) | ilā l-madrasa = okula, li-ummī = anneme. sormak verlangt -e: Anneme soruyorum (asʾalu ummī). |
| `tr.g.ablativ` (A1-e08) | Vertraut: -den/-dan entspricht min – für Herkunft, beim Vergleich und bei „seit“. Es steht aber hinten. | „Türkiye'dan“ (Harmonie) · „Ben Türkiye'de geliyorum.“ | min Turkiyā = Türkiye'den; nach harten Konsonanten -ten/-tan: parktan. mundu ṣ-ṣabāḥ = sabahtan beri. |
| `tr.g.uhrzeit` (A1-e09) | Vertraut: saat ist sāʿa (Uhr und Stunde). Arabisch nennt die Stunde mit Ordnungszahl (as-sāʿa aṯ-ṯāliṯa) und „und halb“; Türkisch mit Grundzahl und buçuk. | „saat üçüncü“ (Ordnungszahl) · „üç ve yarım“ (wie wa-niṣf) | as-sāʿa aṯ-ṯāliṯa = Saat üç; aṯ-ṯāliṯa wa-n-niṣf = üç buçuk. „um drei“ = saat üçte. |
| `tr.g.genitiv` (A1-e09) | Umgekehrt zur Iḍāfa: Der Besitzer steht vorn (annemin evi), und beide Wörter tragen eine Endung. | „evi annemin“ (Iḍāfa-Reihenfolge) · „ev annem“ | baytu ummī = annemin evi: erst der Besitzer mit -in, dann der Besitz mit -i. Elif'in çantası = ḥaqībat Elif. |
| `tr.g.imperativ` (A1-e10) | Arabisch bildet den Befehl nach Genus und Zahl (uktub, uktubī, uktubū); Türkisch hat eine du-Form ohne Genus und eine Form für Sie und ihr. | „Yazi!“ an eine Frau (wie uktubī) · „Lütfen otur.“ zu einer fremden Erwachsenen | Gel! gilt für Mann und Frau. Höflich und für mehrere: Gelin! – Lütfen oturun. |
| `tr.g.raum_postpos` (A1-e10) | fawqa, taḥta, bi-ǧānibi stehen vor dem Nomen; Türkisch nimmt ein Lagewort mit Endungen hinter dem Nomen im Genitiv. | „üstünde masa“ (wie fawqa ṭ-ṭāwila) · „üst masa“ | fawqa ṭ-ṭāwila = masanın üstünde, bi-ǧānibi l-bayt = evin yanında: dieselbe Idee wie die Iḍāfa, nur umgekehrt. |
| `tr.g.ile` (A1-e11) | maʿa und bi- stehen vor dem Nomen; ile steht dahinter oder hängt sich an. | „ile annem“ (wie maʿa ummī) · „otobüsile“ | maʿa ummī = annemle, bi-l-bāṣ = otobüsle. Nach Vokal mit y: arabayla. |
| `tr.g.mek_istemek` (A1-e11) | Arabisch sagt urīdu an + Verb; Türkisch stellt den Infinitiv auf -mek vor istemek. | „İstiyorum yüzmek.“ · „İstiyorum ki yüzeyim.“ | urīdu an asbaḥa = Yüzmek istiyorum: Das Gewollte kommt zuerst, das Wollen am Ende. |
| `tr.g.nominalkompositum` (A1-e12) | Die Iḍāfa deckt beides ab; Türkisch unterscheidet das allgemeine Kompositum (okul bahçesi) vom bestimmten Besitzer (okulun bahçesi). | „bahçe okul“ (Iḍāfa-Reihenfolge) · „okul bahçe“ (Endung fehlt) | ḥadīqat al-madrasa (allgemein) = okul bahçesi: erstes Wort ohne Endung, zweites mit -(s)i. Ebenso baş ağrısı (ṣudāʿ). |

### 2.3 A2 (26 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `tr.g.di` (A2-e01) | Vertraut: Wie im Māḍī steht die Person hinten (katabtu = yazdım). Türkisch nutzt -di aber nur für selbst Erlebtes. | „gitdim“ (Angleichung fehlt) · „ben yazdı“ | katabtu = yazdım, katabnā = yazdık. Nach harten Konsonanten wird d zu t: gittim, yaptık. |
| `tr.g.idi` (A2-e01) | Vertraut: kāna wird zur Endung -(y)di; kāna ʿindī heißt vardı. | „Dün evde oldum.“ (wie kuntu → olmak) · „Ben evde idi.“ | kuntu fī l-bayt = Evdeydim. kāna ʿindī darrāǧa = Bisikletim vardı. |
| `tr.g.uhrzeit_genau` (A2-e02) | Arabisch sagt „und ein Viertel“ bzw. „weniger ein Viertel“; Türkisch nimmt Akkusativ + geçiyor bzw. Dativ + var. | „üç ve çeyrek“ (wie wa-rubʿ) · „dört eksi çeyrek“ | aṯ-ṯāliṯa wa-r-rubʿ = Üçü çeyrek geçiyor; ar-rābiʿa illā rubʿan = Dörde çeyrek var. Datum: 16 Ekim 2026. |
| `tr.g.ordinal` (A2-e02) | Arabische Ordnungszahlen sind eigene Muster mit Genus (ṯāliṯ, ṯāliṯa) und stehen hinter dem Nomen; Türkisch hängt -(i)nci an und stellt sie vor. | „sınıf üçüncü“ (wie aṣ-ṣaff aṯ-ṯāliṯ) · „üçinci“ | aṣ-ṣaff aṯ-ṯāliṯ = üçüncü sınıf. „je zwei“ = ikişer. |
| `tr.g.anrede` (A2-e02) | Arabisch stellt den Titel vor den Namen (as-sayyida Laylā, al-ustāḏ Murād) und kennt die Anrede Abū/Umm …; Türkisch stellt Hanım/Bey hinter den Vornamen. | „Hanım Ayla“, „Bey Murat“ · „Umm Can“ als Anrede | Ayla Hanım, Murat Bey: Das Höflichkeitswort steht hinten. Anreden wie Abū X oder Umm X sind im Türkischen nicht üblich. |
| `tr.g.ecek` (A2-e03) | sa- und sawfa werden zur Endung -(y)ecek; vor Vokal wird k zu ğ. | „gelecekim“ · „sa geleceğim“ | sa-aktubu = yazacağım, sa-yaktubu = yazacak. Gesprochen oft yazıcam, geschrieben yazacağım. |
| `tr.g.optativ` (A2-e03) | hayyā / li-naḏhab und „Soll ich …?“ haben eigene türkische Endungen: -(y)elim, -(y)eyim. | „Hadi gidiyoruz.“ für einen Vorschlag · „Yardım edeceğim?“ als Angebot | hayyā naḏhab = Hadi gidelim. „Soll ich helfen?“ = Yardım edeyim mi? |
| `tr.g.aorist` (A2-e04) | Der Muḍāriʿ deckt Jetzt und Gewohnheit ab; Türkisch trennt -iyor (jetzt) und Aorist (Gewohnheit, Allgemeines). | „Kedi süt seviyor.“ für eine allgemeine Aussage · „içmezim“ (statt içmem) | Der Muḍāriʿ wird zwei Zeiten: ašrabu š-šāya l-āna = Şimdi çay içiyorum; ašrabu š-šāya kulla ṣabāḥ = Her sabah çay içerim. Verneint: içmem, içmez. |
| `tr.g.aorist_bitte` (A2-e04) | Bitten mit dem Aorist in Frageform; Arabisch nutzt law samaḥt, min faḍlak oder (dialektal) mumkin …? | „Mümkün tuz?“ (nach mumkin il-milḥ?) · „Tuzu ver!“ | Wie law samaḥt: Tuzu verir misin? Noch höflicher: Tuzu verebilir misiniz? |
| `tr.g.komparativ` (A2-e05) | Vertraut: Beim Vergleich steht min – im Türkischen -den. Es gibt aber keine Steigerungsform (afʿal), nur daha und en. | „Elif daha küçük Can'dan.“ (wie aṣġaru min Can) · Suche nach einer afʿal-Form | Elif aṣġaru min Can = Elif Can'dan (daha) küçük: Der Vergleichspartner steht vor dem Adjektiv. „am kleinsten“ = en küçük. |
| `tr.g.gibi_kadar` (A2-e05) | miṯl und ka- stehen vorn; gibi steht hinten, Pronomen im Genitiv. kadar kommt von qadr. | „gibi sen“ (wie miṯlak) · „sen gibi“ | miṯlak = senin gibi. kadar = „so … wie“ und „bis“: benim kadar uzun, akşama kadar (ḥattā l-masāʾ). |
| `tr.g.ebil` (A2-e06) | astaṭīʿu an … wird zur Endung -(y)ebil; „nicht können“ hat die Kurzform -(y)eme. | „yapabilmiyorum“ (statt yapamıyorum) · „yapmak yapabilirim“ | astaṭīʿu an asbaḥa = Yüzebilirim. lā astaṭīʿu = yüzemem. |
| `tr.g.mek_nomen` (A2-e06) | Vertraut: Der Infinitiv auf -mek wird wie ein Maṣdar gebraucht und bekommt Endungen. | „Yüzmek severim.“ (Akkusativ fehlt) · „yüzmeki“ | uḥibbu s-sibāḥa = yüzmeyi severim. Vor Vokal fällt das k: yüzmeyi, yüzmeye. |
| `tr.g.meli_lazim` (A2-e07) | Vertraut: lazım ist lāzim. Es steht aber am Ende und braucht eine Besitzendung; -meli heißt eher „sollte“. | „Lazım gitmek.“ (Reihenfolge wie min al-lāzim an aḏhaba) · „Ben gitmek lazım.“ | min al-lāzim an aḏhaba = Gitmem lazım (wörtlich „mein Gehen ist nötig“). yaǧibu ʿalayka an tastarīḥ ≈ Dinlenmelisin. |
| `tr.g.wortbildung1` (A2-e07) | Endungen ersetzen Präpositionen und Muster: -li (mit), -siz (ohne), -ci (Beruf wie das Muster faʿʿāl). | „şeker olmadan“ (wie bi-dūn sukkar) · „sütli“ | bi-dūn sukkar = şekersiz, bi-l-ḥalīb = sütlü. Berufe auf -ci entsprechen faʿʿāl: fırıncı (ḫabbāz), kitapçı. |
| `tr.g.postpos_kasus` (A2-e08) | Arabische Präpositionen stehen vorn (qabla, baʿda, li-); türkische Verhältniswörter stehen hinten und verlangen einen Fall. | „sonra dersten“ (wie baʿda d-dars) · „ders sonra“ | baʿda d-dars = dersten sonra, qabla l-imtiḥān = sınavdan önce, min aǧlī = benim için. |
| `tr.g.mek_icin` (A2-e08) | li- oder kay + Verb stehen vorn; -mek için steht am Ende des Zweck-Teils. | „için öğrenmek Türkçe“ (wie li-ataʿallama t-turkiyya) | li-ataʿallama t-turkiyya = Türkçe öğrenmek için: das ganze Ziel zuerst, için am Ende. |
| `tr.g.konjunktionen` (A2-e09) | Vertraut: ve ist wa, lakin ist lākin. Aber fakat heißt „aber“ (nicht faqaṭ = nur), und türkische Texte beginnen Sätze selten mit ve. | „fakat“ für „nur“ · „Bende geliyorum.“ (zusammengeschrieben) · ve am Anfang jedes Satzes | fakat = lākin; „nur“ heißt sadece. „auch“ = de/da hinter dem Wort, getrennt: Ben de geliyorum (wa-anā ayḍan). |
| `tr.g.kendi` (A2-e09) | Vertraut: kendi + Besitzendung entspricht nafsī, nafsak. | „Kendi iyi hissediyorum.“ · „Kendim iyi hissediyorum.“ (Akkusativ fehlt) | nafsī = kendim, nafsak = kendin: Kendimi iyi hissediyorum. kendi odam = ġurfatī l-ḫāṣṣa. |
| `tr.g.mis_grund` (A2-e10) | Das Arabische hat keine eigene Form für Vergangenes, das man nur bemerkt hat; es sagt ʿalā mā yabdū oder yabdū anna. | -di für Bemerktes („Kerem geldi.“ nur wegen der Jacke im Flur) · -miş für Selbsterlebtes | -miş heißt „offenbar“: Yağmur yağmış (yabdū anna l-maṭar nazal). Selbst Gesehenes steht im -di. |
| `tr.g.iyordu` (A2-e11) | Vertraut: kāna + Muḍāriʿ entspricht -iyordu – für Verlauf und frühere Gewohnheiten. | „çalışıyorduyum“ · „Çalışıyorum idi.“ | kuntu adrusu = ders çalışıyordum. kunnā naskunu fī Izmir = Eskiden İzmir'de oturuyorduk. |
| `tr.g.dir_dauer` (A2-e11) | Vertraut: Wie bei mundu bleibt das Verb in der Gegenwart. Dauer + -dir, Zeitpunkt + -den beri; beides steht vorn. | „beri iki yıl“ (wie mundu sanatayn) · „İki yıldır burada oturduk.“ | naskunu hunā mundu sanatayn = İki yıldır burada oturuyoruz. mundu ṣ-ṣabāḥ = sabahtan beri. |
| `tr.g.ki_attribut` (A2-e12) | Arabisch hängt die Ortsangabe hinten an (al-kitāb allaḏī ʿalā ṭ-ṭāwila); Türkisch macht sie mit -ki zum Attribut davor. | „kitap ki masada“ (ki als allaḏī) · „kitap masada“ als Attribut | al-kitāb allaḏī ʿalā ṭ-ṭāwila = masadaki kitap. -ki ist kein allaḏī, sondern macht aus „auf dem Tisch“ ein Adjektiv. |
| `tr.g.olmak_werden` (A2-e12) | yakūnu und aṣbaḥa heißen beide olmak. | „Yarın evde.“ (Zukunft fehlt) · „Doktor olacak istiyorum.“ | sa-akūnu fī l-bayt = Yarın evde olacağım. urīdu an uṣbiḥa ṭabīban = Doktor olmak istiyorum. |
| `tr.g.imperativ3` (A2-e13) | Vertraut: li- + Jussiv entspricht der Endung -sin. | „Çocuklar beklemek.“ · „Beklesin çocuklar.“ (Stellung wie li-yantaẓir al-awlād) | li-yantaẓir = Beklesin; Çocuklar biraz beklesin. Feste Wünsche: Geçmiş olsun, Kolay gelsin. |
| `tr.g.zahlen_gross` (A2-e14) | Keine Zahlregeln mit Plural oder Kasus; Zahlen ohne „und“; westliche Ziffern; das Prozentzeichen steht vorn. | „yüz ve elli“ (wie miʾa wa-ḫamsūn) · „bir bin“ · „10%“ | miʾa wa-ḫamsūn = yüz elli. Tausend = bin, nicht „bir bin“. %10 liest man yüzde on. |

### 2.4 B1 (22 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `tr.g.indefinit` (B1-e01) | Vertraut: Wie in lam yaʾti aḥad wird das Verb verneint, wenn hiç kimse oder hiçbir şey im Satz steht. | „Kimse geldi.“ für „Niemand kam“ · „Hiçbir şey var.“ | lam yaʾti aḥad = Kimse gelmedi. lā yūǧad šayʾ = Hiçbir şey yok. |
| `tr.g.zusammengesetzt` (B1-e01) | Vertraut: kāna qad faʿala = -mişti, kāna yafʿalu (Gewohnheit) = -erdi; -ecekti entspricht kāna sa-yafʿalu. | „bitti idi“ · „bitmiş oldu“ | kāna ṭ-ṭaʿām qad intahā = Yemek bitmişti. kāna ǧaddī yaʿtanī bi-l-ḥadīqa = Dedem bahçeye bakardı. |
| `tr.g.partizip_en` (B1-e02) | Arabisch setzt allaḏī + Verb oder das Ism al-fāʿil hinter das Nomen; Türkisch stellt das Partizip auf -en davor. | „çocuk ki kitap okuyor“ (allaḏī → ki) · „çocuk okuyan“ | al-walad allaḏī yaqraʾu kitāban = kitap okuyan çocuk. Wie ein Ism al-fāʿil (al-bint al-kātiba = yazan kız), nur vorn. |
| `tr.g.partizip_dik` (B1-e03) | Arabisch braucht im Relativsatz ein Rückverweis-Pronomen (qaraʾtuhu); Türkisch nicht. Wer handelt, zeigt die Besitzendung. | „kitap ki okudum onu“ (Rückverweis wie -hu) · „ben okuduğu kitap“ | al-kitāb allaḏī qaraʾtuhu = okuduğum kitap: -tu wird zur Endung -um, das -hu fällt weg. |
| `tr.g.partizip_ecek` (B1-e04) | Zukunft im Relativsatz: allaḏī sa- … wird zu -(y)ecek mit Besitzendung, ohne Rückverweis. | „gideceğiz şehir“ · „şehir ki gideceğiz oraya“ | al-madīna allatī sa-naḏhabu ilayhā = gideceğimiz şehir; ilayhā fällt weg. |
| `tr.g.konverb_ip` (B1-e04) | Arabisch reiht konjugierte Verben mit wa- oder fa-; Türkisch hängt -(y)ip an und setzt Zeit und Person nur ans letzte Verb. | „Kalkıp ve pencereyi açtı.“ · „Kalktım ve açtım“ in jedem Satz | qāma wa-fataḥa n-nāfiḏa = Kalkıp pencereyi açtı: wa fällt weg, die Endung steht nur am Schluss. |
| `tr.g.konverb_erek_meden` (B1-e05) | Vertraut: Der Ḥāl (ǧāʾa māšiyan) entspricht -(y)erek, dūna an entspricht -meden. | „Yürümek geldi.“ · „Düşünmek olmadan“ (wie dūna tafkīr) | ǧāʾa māšiyan = Yürüyerek geldi. dūna an yufakkira = düşünmeden. |
| `tr.g.bedingung_se` (B1-e06) | iḏā und in stehen am Satzanfang; Türkisch hängt -se an das Verb des Nebensatzes. eğer ersetzt die Endung nicht. | „Eğer yağmur yağar, evde kalırız.“ (Endung fehlt) · „Yağmur yağacak, evde kalırız.“ (Bedingung als Aussage) | iḏā amṭarat = Yağmur yağarsa evde kalırız. In ist ebenfalls -se: Vaktin varsa gel. |
| `tr.g.konverb_ince` (B1-e07) | ʿindamā und lammā werden zur Endung -(y)ince; ne zaman ist nur das Fragewort matā. | „Ne zaman eve geliyorum, ararım.“ · „Zaman eve geldim …“ | ʿindamā aṣilu ilā l-bayt = Eve gelince ararım. |
| `tr.g.temporal_dik` (B1-e07) | qabla an und baʿda an werden zu Verbformen mit Verhältniswort; „bevor“ sieht verneint aus. | „Yattıktan önce“ · „Önce yatmak“ (wie qabla n-nawm) | baʿda an akala = yedikten sonra; qabla an yanāma = yatmadan önce – -meden ist hier keine Verneinung. |
| `tr.g.nominal_dik` (B1-e08) | anna-Sätze werden zu Nomen mit Besitzendung und Fall; die Besitzendung übernimmt das Pronomen hinter anna. | „Biliyorum ki o hasta.“ (umgangssprachlich) · „Hasta olduğu biliyorum.“ (Akkusativ fehlt) | aʿlamu annahu marīḍ = Hasta olduğunu biliyorum: -u entspricht dem -hu, -nu ist der Akkusativ. |
| `tr.g.soru_dolayli` (B1-e08) | Arabisch lässt den Fragesatz nach dem Verb folgen (lā adrī ayna huwa); Türkisch stellt ihn als Nomen davor. „ob“ (hal) = -ip -mediğini. | „Bilmiyorum nerede o.“ · „Bilmiyorum hal geliyor.“ | lā adrī ayna huwa = Nerede olduğunu bilmiyorum. lā adrī hal yaʾtī = Gelip gelmediğini bilmiyorum. |
| `tr.g.kausal_dik` (B1-e09) | li-anna steht nach dem Hauptsatz wie çünkü; daneben -diği için vor dem Hauptsatz. | „Çünkü hasta, gelmedi.“ · „Hasta için gelmedi.“ (wie li-) | lam yaʾti li-annahu marīḍ = Gelmedi, çünkü hasta. Kürzer: Hasta olduğu için gelmedi. |
| `tr.g.konverb_ken` (B1-e09) | baynamā und der Ḥāl-Satz (wa-huwa …) werden zur unveränderlichen Endung -(y)ken. | „çocukkan“, „yaparkan“ | ʿindamā kuntu ṭiflan = Çocukken. baynamā kāna yamšī = Yolda yürürken. |
| `tr.g.bedingung_wunsch` (B1-e10) | layta und law entsprechen keşke + -se; vorsichtige Vorschläge mit -sek mi? | „Keşke yaz gelir.“ · „Keşke ki …“ | yā layta ṣ-ṣayfa ǧāʾa = Keşke yaz gelse. Vorschlag: Biraz erken çıksak mı? |
| `tr.g.mesi_nominal` (B1-e11) | Vertraut: an + Verb oder Maṣdar mit Suffix (urīdu maǧīʾaka) entspricht -me + Besitzendung + Fall. | „İstiyorum gelesin.“ (wie urīdu an taʾtiya) · „Senin gelmek istiyorum.“ | urīdu an taʾtiya = Gelmeni istiyorum. Formu doldurmanız gerekiyor = yaǧibu an tamlaʾū l-istimāra. |
| `tr.g.diye` (B1-e12) | Arabisch stellt das Redeverb vor das Zitat (qāla: …); Türkisch setzt das Zitat zuerst, dann diye, dann das Verb. diye heißt auch „damit“. | „Seslendi diye: geliyorum.“ · „Dedi diye …“ | qāla: „…“ = „Geliyorum“ diye seslendi. kay lā ataʾaḫḫar = Geç kalmayayım diye. |
| `tr.g.konverb_dikce` (B1-e13) | Vertraut: kullamā entspricht der Endung -dikçe. | „Okuyunca öğreniyorsun.“ (heißt: wenn du liest) | kullamā qaraʾta taʿallamta = Okudukça öğrenirsin. |
| `tr.g.ise_nominal` (B1-e13) | Vertraut: ammā … fa- entspricht ise, wa-illā entspricht yoksa. | „Ben ise, ben evde kaldım.“ · „Acele et, değilse geç kalırız.“ | ammā anā fa-baqītu fī l-bayt = Ben ise evde kaldım. wa-illā = yoksa: Acele et, yoksa geç kalırız. |
| `tr.g.bedingung_irreal` (B1-e14) | Vertraut: law … la- entspricht -seydi … -irdi. | „Bilseydim gelirim.“ (Hauptsatz ohne -di) · „Eğer bildim, geldim.“ (wie law mit Māḍī wörtlich übertragen) | law ʿaraftu la-ǧiʾtu = Bilseydim gelirdim. |
| `tr.g.ki_konj` (B1-e15) | ki nach Verben des Sagens wirkt wie anna, ist aber nie allaḏī; getrennt geschrieben. | „Biliyorumki zor.“ · ki für Relativsätze (wie allaḏī) | aʿlamu annahu ṣaʿb = Biliyorum ki zor. Für Relativsätze gibt es Partizipien (okuyan, okuduğum). |
| `tr.g.fokus_soru` (B1-e16) | Arabisch rückt das Erfragte nach vorn (a-anta ǧiʾta?); Türkisch setzt mi dahinter. | „Sen geldin mi?“ für „Warst du es?“ | a-anta ǧiʾta? = Sen mi geldin? a-amsi ǧiʾtum? = Dün mü geldiniz? |

### 2.5 B2 (20 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `tr.g.evidential` (B2-e01) | Für Gehörtes und Erschlossenes nutzt Arabisch Wörter (qīla, yuqāl inna, ḥasaba); Türkisch die Endung -miş, auch an Nomen. | -di in weitererzählten Nachrichten · „hastamış“ (y fehlt) | yuqāl innahā marīḍa = Selin hastaymış. ḥasaba n-našra al-ǧawwiyya = Yarın kar yağacakmış. |
| `tr.g.rede_formal` (B2-e01) | aʿlana anna, ṣarraḥa bi-anna stehen vorn; Türkisch setzt das Redeverb ans Ende und nominalisiert den Inhalt. | „Belediye açıkladı ki …“ · „Açıkladı belediye …“ (Verb vorn) | aʿlanat al-baladiyya anna ṭ-ṭarīq sa-yuftaḥu ġadan = Belediye yolun yarın açılacağını açıkladı. |
| `tr.g.passiv` (B2-e02) | Vertraut: Das Passiv (mabnī li-l-maǧhūl) entspricht -il/-in; der Handelnde wird wie mit min qibal genannt: tarafından. | „yazdı edildi“ · „Kitap yazıldı tarafından …“ | kutiba = yazıldı, yuktabu = yazılır. min qibal = … tarafından (vor dem Verb). |
| `tr.g.kausativ` (B2-e03) | Vertraut: Was Stamm II oder IV leistet (ʿalima → ʿallama), leistet die Endung -dir/-t: „lassen, veranlassen“. | „Arabayı tamir yaptım.“ für „reparieren lassen“ · „kestim“ statt „kestirdim“ | yapmak → yaptırmak (machen lassen), kesmek → kestirmek (schneiden lassen): Mutfağı yeniden yaptırdık. |
| `tr.g.reflexiv_reziprok` (B2-e04) | Vertraut: Stamm VI (tafāʿala) zeigt Gegenseitigkeit wie -iş; Stamm V und VIII oft das Reflexive wie -in. | „Görüyoruz.“ für „Wir treffen uns“ | taʿāwana = yardımlaşmak, taqābala = görüşmek; iġtasala = yıkanmak. |
| `tr.g.modal_vermutung` (B2-e04) | rubbamā, qad + Muḍāriʿ und lā budda anna haben türkische Verbformen: -ebilir, -iyor olabilir, -miş olmalı. | „Yolda kalmalılar.“ (heißt: sie sollten unterwegs bleiben) | qad yakūnu yaʿmalu = Çalışıyor olabilir. lā budda annahum taʾaḫḫarū = Yolda kalmış olmalılar. |
| `tr.g.konzessiv` (B2-e05) | Vertraut: rağmen ist raġma. Es steht aber hinten, mit Dativ; „auch wenn“ = -se de. | „Rağmen yorgun, yardım etti.“ (wie raġma taʿabihi vorn) | raġma taʿabihi = yorgunluğuna rağmen; ʿalā r-raġmi min annahu kāna mutʿaban = yorgun olmasına rağmen. |
| `tr.g.kausal_formal` (B2-e06) | bi-faḍl entspricht sayesinde (positiv), bi-sabab bei Schlechtem yüzünden; neutral und amtlich nedeniyle. | „Kar sayesinde okul kapalı.“ | bi-faḍli l-ǧīrān = komşuların sayesinde; bi-sababi ṯ-ṯulūǧ = yoğun kar yüzünden. |
| `tr.g.bedingung_formal` (B2-e06) | Vertraut: şart ist šarṭ. bi-šarṭi an = -mek şartıyla, fī ḥāli = -diği takdirde, mā lam = -mediği sürece. | „şartı ki …“ · Baustein vorn wie bi-šarṭi an | bi-šarṭi an tuqaddima ṭ-ṭalab = süresi içinde başvurmak şartıyla: Der Baustein steht am Ende. |
| `tr.g.wortbildung2` (B2-e07) | Die arabische Nisba -ī heißt bei türkischen Wörtern meist -sel/-sal; „werden“ ist -leş/-len. | „bilimî“ (Nisba an ein türkisches Wort) · „yeşilce“ für „grünlich“ | ʿilmī = bilimsel (bei Lehnwörtern auch ilmî), bīʾī = çevresel. güzelleşmek = schöner werden. |
| `tr.g.final_formal` (B2-e08) | bi-hadaf und min aǧli stehen vorn; amacıyla und -mek üzere stehen am Ende des Zweck-Teils. | „Amacıyla masrafları azaltmak“ (wie bi-hadafi taqlīl …) | bi-hadafi taqlīli n-nafaqāt = masrafları azaltmak amacıyla. |
| `tr.g.diathese_kombi` (B2-e09) | Mehrere Endungen am Verb in fester Reihenfolge – grob ein Passiv von Stamm II. | „yapılttırıldı“ · Reihenfolge vertauscht | yap-tır-ıl-dı von innen nach außen: machen – lassen – Passiv – Vergangenheit. |
| `tr.g.zeitfolge_er_mez` (B2-e10) | mā an … ḥattā (kaum dass) = -ir -mez; ḥattā (bis) = -(y)ene kadar; mundu an = -(y)eli. | „Gelir gelmedi.“ · „Toplantı bitmeyene kadar“ (doppelt verneint) | mā an waṣala ḥattā ttaṣala = Eve gelir gelmez aradı. ḥattā yantahiya l-iǧtimāʿ = toplantı bitene kadar. |
| `tr.g.dir_vermutung` (B2-e11) | -dir ist in Amtstexten eine Feststellung (ähnlich dem betonenden inna), im Gespräch eine Vermutung. | -dir in jedem gesprochenen Satz | Kiracı aidatı ödemekle yükümlüdür (sachlich). Varmışlardır = Sie dürften angekommen sein. |
| `tr.g.verdoppelung` (B2-e12) | Arabisch verstärkt mit Mustern oder dem Mafʿūl muṭlaq; Türkisch verdoppelt Wörter oder Silben. | „mamavi“, „bembeyez“ | Verstärkte Farben lernt man ganz: masmavi, bembeyaz. yavaş yavaş entspricht šuwayya šuwayya (dialektal). |
| `tr.g.mis_gibi` (B2-e13) | Vertraut: ka-anna entspricht sanki am Satzanfang bzw. -miş gibi am Verb. | „Sanki ki …“ · „Hiçbir şey olmadı gibi.“ | ka-anna šayʾan lam yaḥduṯ = Hiçbir şey olmamış gibi. Sanki yıllardır tanışıyoruz. |
| `tr.g.konnektoren_b2` (B2-e13) | bi-mā anna = madem, raġma ḏālika = buna rağmen, baynamā (dagegen) = oysa, fawqa ḏālika = üstelik. | „Madem vaktin varsa“ · „Buna rağmen ama …“ | bi-mā anna ladayka waqtan = Madem vaktin var, yardım et. madem selbst kommt von mā dāma. |
| `tr.g.aspekt_iver` (B2-e14) | Ohne arabisches Gegenstück; kāda (beinahe) entspricht -eyaz bzw. az kalsın. | „Çabuk ver!“ für eine freundliche Bitte (klingt drängend) | kidtu asquṭu = Düşeyazdım / Az kalsın düşüyordum. Şunu veriver = gib mir das mal eben. |
| `tr.g.statistik` (B2-e15) | Arabisch sagt „sechzig Prozent von den Jugendlichen“ (min); Türkisch setzt den Genitiv vorn und die Besitzendung an den Anteil. | „yüzde altmış gençlerden“ (wie min aš-šabāb) | sittūn bi-l-miʾa min aš-šabāb = gençlerin yüzde altmışı. „jeder Dritte“ = her üç kişiden biri. |
| `tr.g.praeferenz` (B2-e16) | badalan min steht vorn; -mek yerine und -mektense stehen hinter dem Verworfenen. | „yerine beklemek“ (wie badalan min al-intiẓār) | badalan min al-intiẓār = beklemek yerine. Beklemektense yürüyelim = lieber gehen als warten. |

### 2.6 C1 (14 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `tr.g.nominalstil` (C1-e01) | Vertraut: Der arabische Maṣdar-Stil ist eine starke Brücke – aber die Reihenfolge ist umgekehrt (Genitiv vorn). | „tamamlanması projenin“ (Iḍāfa-Reihenfolge) | itmāmu l-mašrūʿi fī waqtihi = projenin zamanında tamamlanması. |
| `tr.g.amtsstil` (C1-e02) | -mektedir und -mıştır entsprechen förmlichen Wendungen wie yatimmu und qad tamma. | „incelemektedir“ (Passiv fehlt) · Amtsstil im Gespräch | yatimmu dirāsatu ṭalabikum = Başvurunuz incelenmektedir. tamma stilāmu d-dafʿa = Ödeme alınmıştır. |
| `tr.g.partizip_komplex` (C1-e03) | Lange arabische Relativketten stehen rechts vom Nomen; im Türkischen stehen lange Attribute links davon. | Bezug falsch zugeordnet · „kütüphane geçen yıl açılmış olan“ | al-maktaba allatī futiḥat fī l-ʿāmi l-māḍī = geçen yıl açılmış olan kütüphane. Vom Nomen aus nach links lesen. |
| `tr.g.umgangssprache` (C1-e04) | Vertraut: Wie fuṣḥā und Dialekt gibt es gesprochene und geschriebene Formen; der Abstand ist im Türkischen kleiner. | „geliyom“ in einer E-Mail an die Schule | Gesprochen geliyom, napıyon – geschrieben geliyorum, ne yapıyorsun. Geschrieben wird immer die volle Form. |
| `tr.g.redewendungen` (C1-e05) | Einige Bilder teilen beide Sprachen, viele nicht; wörtliche Übertragungen arabischer Wendungen wirken fremd. | arabische Wendung wörtlich übertragen | Gleiches Bild: Başım üstüne ≈ ʿalā raʾsī (sehr gern). Anderes Bild: eli kulağında (steht kurz bevor). |
| `tr.g.textkonnektoren` (C1-e06) | Arabische Texte verbinden viel mit wa- und fa-; türkische Texte nutzen eigene Absatzverknüpfer. | „Ve … ve … ve …“ in einem Bericht | min nāḥiya uḫrā = öte yandan, bi-t-tālī = dolayısıyla, ḫulāṣatu l-qawl = sonuç olarak. |
| `tr.g.argumentation` (C1-e07) | fī raʾyī = kanımca/bence; min ḥayṯu = … bakımından (nachgestellt); wa-in kāna = -mekle birlikte. | „Bence fikrime göre …“ (doppelt) · „bakımından çevre“ | min ḥayṯu l-bīʾa = çevre bakımından; wa-in kāna ġāliyan fa-huwa mufīd = pahalı olmakla birlikte faydalı. |
| `tr.g.suspendierte_endung` (C1-e08) | Arabisch wiederholt Präpositionen und Artikel in Reihungen; Türkisch hängt die gemeinsame Endung nur an das letzte Wort. | „öğretmenlerle ve öğrencilerle“ (nicht falsch, aber schwerfällig) | maʿa l-muʿallimīna wa-ṭ-ṭullāb = öğretmen ve öğrencilerle. |
| `tr.g.hoeflichkeit_strategien` (C1-e09) | acaba macht Fragen vorsichtig – es ist kein Ausruf wie ʿaǧaban! | „Acaba!“ als Staunen · Bitte ohne Abschwächung | hal yumkinukum an tanẓurū, law samaḥtum? = Acaba bir bakabilir misiniz? Kritik mit sanırım beginnen. |
| `tr.g.sprichwoerter` (C1-e10) | Ein Sprichwort heißt atasözü; masal ist ein Märchen, nicht maṯal. Gegenstücke im Arabischen sind oft andere Bilder. | masal für „Sprichwort“ · Sprichwort wörtlich aus dem Arabischen | maṯal = atasözü. Damlaya damlaya göl olur, Ağaç yaşken eğilir: Bedeutung erklären, arabisches Gegenstück nur nach Prüfung nennen. |
| `tr.g.zarf_cesine` (C1-e10) | -cesine entspricht einem gehobenen ka-anna am Verb. | „koşarcesine“ (Harmonie) | mašā ka-annahu yarkuḍ = Koşarcasına yürüdü. Im Gespräch: Koşar gibi yürüdü. |
| `tr.g.lehnmuster` (C1-e11) | Vertraut: Adverbien auf -an (tamāman, nisbatan) und die Nisba -ī. Aber im Türkischen gilt türkische Grammatik, und manche Bedeutungen haben sich verschoben. | Genus- oder Dualformen übertragen · arabische Bedeutung übernommen (§3.1) | tamāman = tamamen, nisbatan = nispeten, ḥuqūqī = hukuki. Plural mit -ler (evraklar), kein Dual, kein Genus. |
| `tr.g.fokus_devrik` (C1-e12) | Arabisch betont durch Voranstellen; Türkisch durch die Stelle direkt vor dem Verb. Verb-zuerst gibt es nur im Gespräch. | „Gitti Elif okula.“ in einem Text | Bunu ben söylemedim: betont ist ben. Gidiyorum ben – nur im Gespräch. |
| `tr.g.partikel_nuancen` (C1-e13) | Vertraut: yani ist yaʿnī, hatta ist ḥattā. bile steht aber hinter dem Wort; hani fragt nach Bekanntem. | „Bile ben anladım.“ (bile vorn wie ḥattā) | ḥattā anā fahimtu = Ben bile anladım. Hani bana söz vermiştin? (alam taʿidnī?) |

## 3 Wortschatz

### 3.1 Falsche Freunde

Viele Lehnwörter haben im Türkischen eine andere oder engere Bedeutung als im Arabischen. „teilweise“ heißt: Die Bedeutungen überschneiden sich. „Klang“ heißt: nur ähnlich klingend, ohne gemeinsame Bedeutung. Die Einheit nennt den ersten passenden Ort für einen Tipp.

| Türkisch | Bedeutung | arabisches Wort | Bedeutung im Arabischen | die türkische Bedeutung heißt arabisch | Art | Einheit |
|---|---|---|---|---|---|---|
| hayır | nein (in festen Wendungen auch „Gutes“) | ḫayr | das Gute; gut | lā | teilweise | A1-e01 |
| memnun | zufrieden, erfreut (Memnun oldum = Freut mich) | mamnūn | dankbar, verbunden | masrūr, saʿīd | teilweise | A1-e01 |
| memleket | Heimat, Heimatort | mamlaka | Königreich | waṭan, balad | falsch | A1-e01 |
| sınıf | Schulklasse, Klassenzimmer; auch Klasse im Sinn von Rang (birinci sınıf) | ṣinf | Sorte, Art, Kategorie | ṣaff | teilweise | A1-e02 |
| tahta | Holz; Tafel | taḥta | unter | ḫašab; sabbūra | Klang | A1-e02 |
| ömür | Lebenszeit (nach dem Alter fragt man mit yaş) | ʿumr | Lebensalter, Alter; Lebenszeit | ʿumr, ḥayāt | teilweise | A1-e03 |
| rakam | Ziffer; Zahlenangabe (die Telefonnummer heißt numara) | raqm | Zahl, Nummer, Ziffer | raqm | teilweise | A1-e03 |
| hala | Schwester des Vaters | ḫāla | Schwester der Mutter | ʿamma | falsch | A1-e03 |
| hamam | Badehaus, türkisches Bad (das Badezimmer heißt banyo) | ḥammām | Badezimmer; Bad; auch Toilette | ḥammām turkī | teilweise | A1-e04 |
| misafir | Gast | musāfir | Reisender | ḍayf | falsch | A1-e10 |
| şehir | Stadt (aus dem Persischen) | šahr | Monat | madīna | Klang | A1-e05 |
| hava | Luft; Wetter | hawāʾ | Luft | hawāʾ (Luft); ṭaqs, ǧaww (Wetter) | teilweise | A1-e11 |
| vücut | Körper | wuǧūd | Existenz, Anwesenheit | ǧism | falsch | A1-e12 |
| kafa | Kopf (umgangssprachlich) | qafā | Nacken, Hinterkopf | raʾs | falsch | A1-e12 |
| dikkat | Aufmerksamkeit; Achtung! | diqqa | Genauigkeit | intibāh | teilweise | A1-e08 |
| işaret | Zeichen, Schild (die Ampel heißt trafik lambası) | išāra | Zeichen; dialektal auch die Ampel | išāra, lāfita | teilweise | A1-e08 |
| fen | Naturwissenschaften (Schulfach) | fann | Kunst | ʿulūm | falsch | A1-e09 |
| teneffüs | Pause in der Schule | tanaffus | Atmen | istirāḥa | falsch | A1-e09 |
| tatil | Urlaub, Ferien | taʿṭīl | Störung, Ausfall, Stilllegung; auch Schließung an freien Tagen | ʿuṭla | teilweise | A2-e01 |
| künye | Personalien, Angaben zur Person | kunya | Beiname Abū … oder Umm … | bayānāt šaḫṣiyya | falsch | A2-e02 |
| lakap | Spitzname (der Familienname heißt soyadı) | laqab | Beiname, Titel; in einigen Ländern Familienname | laqab | teilweise | A2-e02 |
| seyahat | Reise | siyāḥa | Tourismus | safar, riḥla | teilweise | A2-e03 |
| sefer | Fahrt (Bus, Zug, Flug); Mal | safar | Reise | riḥla | teilweise | A2-e03 |
| kibar | höflich, fein | kibār | die Großen, Erwachsenen (Plural) | muhaḏḏab | falsch | A2-e04 |
| tabii | natürlich, selbstverständlich | ṭabīʿī | natürlich (von der Natur) | ṭabʿan | teilweise | A2-e04 |
| elbise | Kleid; Kleidung | albisa | Kleidungsstücke (Plural) | fustān (Kleid); malābis (Kleidung) | teilweise | A2-e05 |
| beden | Körper; Kleidergröße | badan | Körper | badan, ǧism; maqās (Größe) | teilweise | A2-e05 |
| mağaza | Geschäft, Laden | maḫzan | Lager; regional auch Laden | matǧar, maḥall | teilweise | A2-e05 |
| ilaç | Medikament | ʿilāǧ | Behandlung | dawāʾ | falsch | A2-e07 |
| eczane | Apotheke (ecza = Arzneimittel) | aǧzāʾ | Teile (Plural) | ṣaydaliyya | falsch | A2-e07 |
| imdat | Hilfe! (Notruf) | imdād | Versorgung, Nachschub | an-naǧda | falsch | A2-e07 |
| müzakere | Verhandlung, Beratung | muḏākara | Lernen für Prüfungen, Wiederholen | mufāwaḍāt | falsch | A2-e08 |
| mektep | Schule (veraltet) | maktab | Büro, Schreibtisch; früher auch Elementarschule | madrasa | teilweise | A2-e08 |
| mektup | Brief | maktūb | geschrieben | risāla | teilweise | A2-e08 |
| fakat | aber | faqaṭ | nur | lākin | falsch | A2-e09 |
| hayret | Staunen | ḥayra | Ratlosigkeit, Verwirrung | dahša | teilweise | A2-e10 |
| daire | Wohnung; Amt, Abteilung; Kreis | dāʾira | Kreis; Abteilung, Behörde | šaqqa (Wohnung); dāʾira (Amt) | teilweise | A2-e11 |
| meslek | Beruf | maslak | Weg, Bahn | mihna | falsch | A2-e12 |
| maaş | Gehalt | maʿāš | Lebensunterhalt; in einigen Ländern Rente | rātib | teilweise | A2-e12 |
| makbuz | Quittung, Beleg | maqbūḍ | empfangen; ergriffen | īṣāl | falsch | A2-e14 |
| harç | Gebühr; Mörtel (harçlık = Taschengeld) | ḫarǧ | Ausgabe | rasm | teilweise | A2-e14 |
| ihtiyar | alt (Person) | iḫtiyār | Wahl, Auswahl; dialektal ḫityār auch „alter Mann“ (zu prüfen) | musinn | teilweise | B1-e01 |
| hatıra | Erinnerung, Andenken | ḫāṭira | Gedanke, Einfall | ḏikrā | teilweise | B1-e01 |
| evvel | vorher, früher (iki gün evvel) | awwal | erster | qabl | teilweise | B1-e01 |
| aslen | ursprünglich, gebürtig | aṣlan | ursprünglich; mit Verneinung: überhaupt nicht | aṣlan | teilweise | B1-e01 |
| mesai | Arbeitszeit | masāʿī | Bemühungen (Plural) | dawām | falsch | B1-e02 |
| amir | Vorgesetzte, Vorgesetzter | amīr | Fürst, Prinz | raʾīs, mudīr | teilweise | B1-e02 |
| izin | Erlaubnis; Urlaub vom Arbeitgeber | iḏn | Erlaubnis | iḏn (Erlaubnis); iǧāza (Urlaub) | teilweise | B1-e02 |
| mal | Ware; Besitz (mal sahibi = Eigentümer) | māl | Geld, Vermögen | biḍāʿa, mulk | teilweise | B1-e03 |
| semt | Stadtteil | samt | Richtung | ḥayy | falsch | B1-e03 |
| kasaba | Kleinstadt | qaṣaba | Hauptort; Zitadelle | balda | teilweise | B1-e04 |
| istikamet | Richtung | istiqāma | Geradheit, Aufrichtigkeit | ittiǧāh | falsch | B1-e04 |
| nefis | köstlich (Essen) | nafīs | kostbar, wertvoll | laḏīḏ | teilweise | B1-e05 |
| vasıta | Fahrzeug; Mittel | wāsiṭa | Mittel; Vermittlung, Beziehungen | markaba, wasīla | teilweise | B1-e06 |
| ceza | Strafe; Bußgeld | ǧazāʾ | Vergeltung (Lohn oder Strafe) | ʿuqūba, ġarāma | teilweise | B1-e06 |
| havadis | Nachrichten (veraltet) | ḥawādiṯ | Ereignisse, Unfälle | aḫbār | teilweise | B1-e08 |
| münakaşa | Streit | munāqaša | Diskussion, Erörterung; auch Auseinandersetzung | ḫilāf, šiǧār | teilweise | B1-e09 |
| huzur | innere Ruhe (huzurevi = Seniorenheim) | ḥuḍūr | Anwesenheit | hudūʾ, rāḥat al-bāl | falsch | B1-e10 |
| gayret | Mühe, Eifer | ġayra | Eifersucht, Ehrgefühl; auch Eifer | ǧuhd | teilweise | B1-e10 |
| merak | Neugier; Sorge | maraq | Brühe (Levante, Golf) | fuḍūl; qalaq | Klang | B1-e10 |
| muhabbet | gemütliches Gespräch; Zuneigung | maḥabba | Zuneigung, Liebe | dardaša | teilweise | B1-e10 |
| müracaat | Antrag; Anfrage | murāǧaʿa | Überprüfung, Rücksprache | ṭalab | teilweise | B1-e11 |
| aidat | Mitgliedsbeitrag; Hausgeld | ʿāʾidāt | Einnahmen, Erträge | rusūm al-ištirāk | falsch | B1-e12 |
| iklim | Klima | iqlīm | Region, Gebiet; auch Klimazone | munāḫ | teilweise | B1-e13 |
| icat | Erfindung | īǧād | Hervorbringen; Finden | iḫtirāʿ | teilweise | B1-e14 |
| tecrübe | Erfahrung | taǧriba | Versuch, Experiment | ḫibra | teilweise | B1-e15 |
| mezun | Absolventin, Absolvent | maʾḏūn | befugt, bevollmächtigt | ḫirrīǧ | falsch | B1-e15 |
| tarif | Rezept; Beschreibung | taʿrīf | Definition | waṣfa | falsch | B1-e16 |
| galiba | wohl, wahrscheinlich | ġāliban | meistens | ʿalā l-arǧaḥ | teilweise | B2-e04 |
| tamir | Reparatur | taʿmīr | Wiederaufbau, Restaurierung | taṣlīḥ | teilweise | B2-e03 |
| teklif | Angebot, Vorschlag | taklīf | Auftrag, Belastung | ʿarḍ, iqtirāḥ | falsch | B2-e05 |
| ret (red) | Ablehnung | radd | Antwort; Zurückweisung | rafḍ | teilweise | B2-e06 |
| muhit | Umgebung, Milieu | muḥīṭ | Ozean; Umgebung | bīʾa | teilweise | B2-e07 |
| tasarruf | Sparen | taṣarruf | Verfügung; Verhalten | tawfīr, iddiḫār | falsch | B2-e08 |
| kaza | Unfall | qaḍāʾ | Justiz, Gerichtswesen; regional auch Verwaltungsbezirk | ḥādiṯ | falsch | B2-e08 |
| dahil | einschließlich | dāḫil | innen; das Innere | šāmil | teilweise | B2-e08 |
| hariç | außer, ausgenommen | ḫāriǧ | außen; Ausland | bi-stiṯnāʾ | teilweise | B2-e08 |
| sanat | Kunst; Handwerk | ṣanʿa | Handwerk, Herstellung | fann (Kunst); ṣanʿa, ḥirfa (Handwerk) | teilweise | B2-e12 |
| taklit | Nachahmung; Fälschung (Traditionen heißen gelenek) | taqlīd | Nachahmung; Plural taqālīd: Traditionen | taqlīd (Nachahmung); tazwīr (Fälschung) | teilweise | B2-e12 |
| asır | Jahrhundert | ʿaṣr | Zeitalter; Nachmittag | qarn | teilweise | B2-e12 |
| nesil | Generation | nasl | Nachkommen | ǧīl | teilweise | B2-e13 |
| esnaf | Gewerbetreibende (Sammelwort) | aṣnāf | Sorten (Plural von ṣinf) | ḥirafiyyūn, tuǧǧār | falsch | B2-e16 |
| tazminat | Entschädigung | taḍmīnāt | Einschlüsse; Garantien (zu prüfen) | taʿwīḍ | zu prüfen | C1-e08 |
| acaba | ob wohl …? (vorsichtige Frage) | ʿaǧaban | wie seltsam! | yā turā | falsch | C1-e09 |
| masal | Märchen | maṯal | Sprichwort; Beispiel | ḥikāya ḫurāfiyya | falsch | C1-e10 |
| fıkra | Witz, Anekdote; Absatz (Gesetz, Zeitung) | fiqra | Absatz | nukta | teilweise | C1-e10 |
| kâtip | Schreibkraft, Sachbearbeiter (veraltet) | kātib | Schriftsteller; Schreiber; Sekretär | kātib, muwaẓẓaf | teilweise | C1-e02 |
| hâkim | Richterin, Richter | ḥākim | Herrscher, Machthaber; auch Richter | qāḍī | teilweise | C1-e11 |

**Familienwörter.** amca ist wie ʿamm der Bruder des Vaters. Bei den Tanten ist es umgekehrt: hala ist die Schwester des Vaters (ʿamma), teyze die Schwester der Mutter (ḫāla). Der Bruder der Mutter heißt dayı (ḫāl).

### 3.2 Lehnwörter

**Lehnwörter mit gleicher Bedeutung** (Brücke; die Laute folgen §1.4):

| Türkisch | Arabisch (Umschrift) | Bedeutung |
|---|---|---|
| kitap | kitāb | Buch |
| kalem | qalam | Stift |
| defter | daftar | Heft |
| ders | dars | Unterricht, Lektion |
| saat | sāʿa | Uhr, Stunde |
| dakika | daqīqa | Minute |
| saniye | ṯāniya | Sekunde |
| zaman | zamān | Zeit |
| vakit | waqt | Zeit |
| sene | sana | Jahr |
| tarih | tārīḫ | Geschichte; Datum |
| hayat | ḥayāt | Leben |
| insan | insān | Mensch |
| aile | ʿāʾila | Familie |
| akıl | ʿaql | Verstand |
| fikir | fikr | Gedanke, Idee |
| kalp | qalb | Herz |
| cevap | ǧawāb | Antwort |
| hata | ḫaṭaʾ | Fehler |
| özür | ʿuḏr | Entschuldigung |
| kelime | kalima | Wort |
| cümle | ǧumla | Satz |
| harf | ḥarf | Buchstabe |
| mana | maʿnā | Bedeutung |
| haber | ḫabar | Nachricht |
| ilan | iʿlān | Anzeige |
| makale | maqāla | Artikel |
| karar | qarār | Entscheidung |
| şart | šarṭ | Bedingung |
| sebep | sabab | Grund |
| netice | natīǧa | Ergebnis |
| mümkün | mumkin | möglich |
| lazım | lāzim | nötig |
| zaruri | ḍarūrī | notwendig |
| ihtiyaç | iḥtiyāǧ | Bedarf |
| mevcut | mawǧūd | vorhanden |
| hesap | ḥisāb | Rechnung, Konto |
| fatura | fātūra | Rechnung |
| kira | kirāʾ | Miete |
| havale | ḥawāla | Überweisung |
| dükkân | dukkān | Laden |
| bakkal | baqqāl | Lebensmittelhändler |
| kasap | qaṣṣāb | Metzger |
| müşteri | muštarī | Kunde |
| mutfak | maṭbaḫ | Küche |
| sofra | sufra | gedeckter Tisch |
| fincan | finǧān | Tasse |
| hayvan | ḥayawān | Tier |
| sabun | ṣābūn | Seife |
| dolap | dūlāb | Schrank |
| mahalle | maḥalla | Viertel |
| cadde | ǧādda | Hauptstraße |
| sokak | zuqāq | Gasse |
| bina | bināʾ | Gebäude |
| belediye | baladiyya | Stadtverwaltung |
| muhtar | muḫtār | Ortsvorsteher |
| mühendis | muhandis | Ingenieur |
| mimar | miʿmār | Architekt |
| müdür | mudīr | Direktor |
| kanun | qānūn | Gesetz |
| mahkeme | maḥkama | Gericht |
| adalet | ʿadāla | Gerechtigkeit |
| hürriyet | ḥurriyya | Freiheit |
| imza | imḍāʾ | Unterschrift |
| itiraz | iʿtirāḍ | Widerspruch |
| talep | ṭalab | Antrag, Forderung |
| kayıt | qayd | Eintragung, Anmeldung |
| ikamet | iqāma | Wohnsitz, Aufenthalt |
| şikâyet | šikāya | Beschwerde |
| tavsiye | tawṣiya | Empfehlung |
| ziyaret | ziyāra | Besuch |
| hediye | hadiyya | Geschenk |
| davet | daʿwa | Einladung |
| tabiat | ṭabīʿa | Natur |
| nehir | nahr | Fluss |
| sahil | sāḥil | Küste |
| derece | daraǧa | Grad |
| harita | ḫarīṭa | Landkarte |
| mesafe | masāfa | Entfernung |
| hat | ḫaṭṭ | Linie |
| levha | lawḥa | Schild, Tafel |
| itfaiye | iṭfāʾiyya | Feuerwehr |
| sakin | sākin | ruhig; Bewohner |
| hazır | ḥāḍir | bereit |
| tahlil | taḥlīl | Analyse, Laboruntersuchung |
| teşhis | tašḫīṣ | Diagnose |
| tedavi | tadāwī | Behandlung |
| nezle | nazla | Schnupfen |
| mide | miʿda | Magen |
| nabız | nabḍ | Puls |
| şiir | šiʿr | Gedicht |
| hikâye | ḥikāya | Geschichte, Erzählung |
| kimya | kīmiyāʾ | Chemie |
| sıfır | ṣifr | Null |
| maalesef | maʿa l-asaf | leider |
| teşekkür | tašakkur | Dank |
| rica | raǧāʾ | Bitte |
| tamam | tamām | in Ordnung, fertig |
| yani | yaʿnī | das heißt |
| hatta | ḥattā | sogar |
| lakin | lākin | aber |
| sabah | ṣabāḥ | Morgen |
| imtihan | imtiḥān | Prüfung |
| mesken | maskan | Wohnung |
| lezzet | laḏḏa | Geschmack |
| veli | walī (al-amr) | Erziehungsberechtigte |
| cemiyet | ǧamʿiyya | Verein |
| keşif | kašf | Entdeckung |
| kabiliyet | qābiliyya | Fähigkeit |
| rutubet | ruṭūba | Feuchtigkeit |
| akit | ʿaqd | Vertrag |
| fesih | fasḫ | Aufhebung, Kündigung |
| nispet | nisba | Verhältnis |
| masraf | maṣārīf (Plural) | Ausgaben, Kosten |
| rağmen | raġma | trotz |
| medeni | madanī | bürgerlich, zivil |
| insan hakları | ḥuqūq al-insān | Menschenrechte |

**Arabische Plurale als türkische Einzahl- oder Sammelwörter.** Im Türkischen gelten sie als ein Wort und bekommen bei Bedarf -ler (evraklar). Innere Plurale werden sonst nicht gebildet (`tr.g.plural`).

| Türkisch | Arabisch (Umschrift) | Bedeutung im Arabischen | Bedeutung im Türkischen |
|---|---|---|---|
| evlat | awlād | Kinder, Jungen (Plural von walad) | Kind (Einzahl); evlatlar = Kinder |
| akraba | aqribāʾ | Verwandte (Plural) | Verwandte; auch „ein Verwandter“: akrabam |
| eşya | ašyāʾ | Dinge (Plural von šayʾ) | Sachen, Möbel (Sammelwort) |
| evrak | awrāq | Blätter (Plural von waraqa) | Unterlagen, Dokumente (Sammelwort) |
| esnaf | aṣnāf | Sorten (Plural von ṣinf) | Gewerbetreibende (§3.1) |
| tüccar | tuǧǧār | Händler (Plural) | ein Händler; tüccarlar = Händler |
| ameliyat | ʿamaliyyāt | Vorgänge, Operationen (Plural) | eine Operation; ameliyatlar |
| edebiyat | adabiyyāt | Literaturen (Plural) | Literatur |
| malumat | maʿlūmāt | Informationen (Plural) | Information, Wissen (Sammelwort) |
| talimat | taʿlīmāt | Anweisungen (Plural) | Anweisung; talimatlar |
| tebligat | tablīġāt | Mitteilungen (Plural) | amtliche Zustellung |
| emlak | amlāk | Besitztümer (Plural) | Immobilien; emlakçı = Makler |
| inşaat | inšāʾāt | Bauten (Plural) | Bau, Baustelle |
| elbise | albisa | Kleidungsstücke (Plural) | Kleid (§3.1) |
| havadis | ḥawādiṯ | Ereignisse (Plural) | Nachrichten, veraltet (§3.1) |

**Monatsnamen.** Fünf türkische Monatsnamen gleichen den Namen, die in der Levante und im Irak üblich sind. Wer aus Ägypten oder dem Maghreb kommt, kennt eher die europäischen Formen, die einigen anderen türkischen Namen ähneln.

| Monat | Türkisch | Levante, Irak | Ägypten (Auswahl) |
|---|---|---|---|
| Januar | Ocak | kānūn aṯ-ṯānī | yanāyir |
| Februar | Şubat | šubāṭ | fibrāyir |
| März | Mart | āḏār | māris |
| April | Nisan | nīsān | abrīl |
| Mai | Mayıs | ayyār | māyū |
| Juni | Haziran | ḥazīrān | yūnyū |
| Juli | Temmuz | tammūz | yūlyū |
| August | Ağustos | āb | aġusṭus |
| September | Eylül | aylūl | sibtambir |
| Oktober | Ekim | tišrīn al-awwal | uktūbar |
| November | Kasım | tišrīn aṯ-ṯānī | nūfambir |
| Dezember | Aralık | kānūn al-awwal | dīsambir |

**Wörter aus dem Persischen** sind im Türkischen häufig, im Arabischen seltener. Gemeinsam sind etwa çorba (dialektal šūrba) und şal (šāl). Klangfalle: şehir (Stadt, aus dem Persischen) ist nicht šahr (Monat, §3.1). Die Herkunft ist für Tipps nur dann Thema, wenn sie beim Erkennen hilft.

### 3.3 Internationalismen und gemeinsame Wörter

Moderne Wörter hat das Türkische oft aus dem Französischen übernommen, das Arabische eher aus dem Englischen oder Italienischen; manches bilden beide Sprachen selbst. Ähnlich sind vor allem Speisen, Maße und Medien. Die türkische Schreibung folgt dem Klang (televizyon, otobüs), und auch diese Wörter schreibt man klein.

| Türkisch | Arabisch (Umschrift) | Hinweis |
|---|---|---|
| telefon, televizyon, radyo | tilifūn, tilifizyūn, rādyū (daneben hātif, tilfāz) | Vertraut |
| kilo, metre, litre | kīlū, mitr, litr | Vertraut |
| doktor | duktūr, ṭabīb | Anrede Doktor Bey, Doktor Hanım (§4.2) |
| banka | bank, maṣrif | Vertraut |
| salata, patates | salaṭa, baṭāṭis | Vertraut |
| domates | ṭamāṭim (Ägypten), banadūra (Levante) | anderes Wort |
| portakal, muz | burtuqāl, mawz | Vertraut |
| kebap, köfte, baklava | kabāb, kufta, baqlāwa | gleiche Gerichte, gleiche Namen |
| otobüs | bāṣ; ūtūbīs (Ägypten) | – |
| maç | mubārāh; dialektal māč | aus dem Französischen bzw. Englischen |
| teknoloji | tiknūlūǧiyā | Vertraut |
| coğrafya, felsefe, kimya | ǧuġrāfiyā, falsafa, kīmiyāʾ | aus dem Griechischen über das Arabische |
| elektrik | kahrabāʾ | anderes Wort |
| ambulans | sayyārat al-isʿāf | anderes Wort |
| laboratuvar | muḫtabar | anderes Wort |
| bilgisayar | ḥāsūb; kumbyūtar | türkische Neubildung („Wissensrechner“) |
| polis | šurṭa; dialektal būlīs | – |
| manşet (Schlagzeile) | dialektal mānšīt (zu prüfen, KT-ar-14) | – |

### 3.4 Wortfelder mit anderer Einteilung

| Feld | Arabisch | Türkisch | Tipp |
|---|---|---|---|
| Tanten und Onkel | ʿamma, ḫāla; ʿamm, ḫāl | hala, teyze; amca, dayı | gleiche Einteilung, aber hala ≠ ḫāla (§3.1) |
| Geschwister | aḫ, uḫt (mit akbar, aṣġar) | ağabey/abi, abla (älter); kardeş (jünger oder allgemein, ohne Genus) | Das Alter steckt im Wort; abla und abi sind auch Anrede. |
| Großeltern | ǧadd, ǧadda | dede; babaanne, anneanne | Die Großmutter heißt je nach Seite anders. |
| Verwandte durch Heirat | eigene Ausdrücke je Person | yenge (Frau des Onkels oder des Bruders), enişte (Mann der Tante oder der Schwester) | ein Wort für mehrere Personen |
| Uhr und Stunde | sāʿa (beides) | saat (beides) | Vertraut |
| wissen, kennen | ʿarafa (beides); ʿalima | bilmek (wissen), tanımak (Personen kennen) | Für Personen immer tanımak. |
| sitzen, wohnen | ǧalasa, sakana | oturmak (beides) | Nerede oturuyorsun? = Wo wohnst du? |
| arbeiten, lernen | ʿamila, daras | çalışmak (beides; ders çalışmak = lernen) | – |
| gehen, fahren, einsteigen | ḏahaba, rakiba (mit direktem Objekt) | gitmek; binmek mit -e (otobüse binmek) | `tr.g.dativ` |
| warm, heiß | dāfiʾ, ḥārr | ılık, sıcak (warm und heiß) | – |
| Rechnung | ḥisāb, fātūra | hesap (Restaurant; auch Konto), fatura (Strom, Handwerk) | wie im Arabischen zwei Wörter |
| Schule | Stufen je Land verschieden | ilkokul (4 Jahre), ortaokul (4), lise (4) | §4.6 |
| Amt | baladiyya, muḫtār | belediye, muhtar | Vertraut |

### 3.5 Türkische Wörter in arabischen Dialekten

Viele Arabischsprachige kennen türkische Wörter aus dem eigenen Dialekt, oft mit anderer Aussprache oder Bedeutung. Sie sind eine Brücke, wenn man sie erkennt. Einträge mit „zu prüfen“ kommen erst nach der Stichprobe in Tipps (KT-ar-04).

| Region | Dialektwort (Umschrift) | Türkisch | Bedeutung | Hinweis |
|---|---|---|---|---|
| Levante, Ägypten | šanṭa | çanta | Tasche | – |
| Levante, Ägypten | kundara | kundura | Schuh | tr heute meist ayakkabı |
| Levante, Ägypten | ʾōḍa | oda | Zimmer | – |
| Ägypten | kubrī | köprü | Brücke | – |
| Levante, Ägypten | duġri | doğru | geradeaus; ehrlich | tr doğru auch „richtig“ |
| Levante, Ägypten | bōya | boya | Farbe; Schuhcreme | – |
| Levante | šīš ṭāwūq | şiş, tavuk | Hähnchenspieß | tr tavuk şiş |
| Ägypten | afandim | efendim | Wie bitte?; Ja, bitte? | Vertraut (§4.3) |
| Ägypten | agzaḫāna | eczane (alt eczahane) | Apotheke | über das Osmanische |
| Ägypten | usṭa | usta | Meister; Fahrer | tr usta: Meister, Handwerker |
| Levante | ṣōba | soba | Ofen | zu prüfen |
| Levante | ṭanǧara | tencere | Kochtopf | zu prüfen |
| Ägypten | ʾabla | abla | ältere Schwester; Lehrerin | zu prüfen |
| Irak, Levante | yawāš | yavaş | langsam | zu prüfen |

## 4 Pragmatik und Höflichkeit

### 4.1 sen und siz

Das Hocharabische hat kein grammatisches „Sie“. Höflichkeit zeigt es über Anrede, Titel und Wortwahl, dialektal auch mit ḥaḍratak; in Briefen steht oft die Mehrzahl (antum). Im Türkischen ist siz gegenüber Fremden, Älteren, Lehrkräften und Ämtern Pflicht. Die Verbform ist immer die 2. Person Plural, auch für eine einzelne Person (Siz nasılsınız?).

| Situation | Türkisch | Hinweis |
|---|---|---|
| Amt, Arzt, Geschäft, Unbekannte | siz, oft mit Vorname + Hanım/Bey | wie die Mehrzahl in arabischen Briefen, aber auch im Gespräch |
| Familie, Freunde, Kinder unter sich | sen | Vertraut (anta, anti) |
| Kind zu Lehrkraft | siz, „Öğretmenim“ | Lehrkräfte sagen zu Kindern sen. |
| Ältere Nachbarn | siz oder ein Verwandtschaftswort (teyze, amca) | Verwandtschaftswörter als Anrede sind vertraut (§4.2). |
| Kolleginnen und Kollegen | je nach Betrieb siz oder sen | Im Zweifel siz. |
| Briefe, Formulare, Ämter | siz durchgehend | kein Wechsel im selben Text |

### 4.2 Anrede und Namen

- **Titel hinter dem Namen:** Ayla Hanım, Murat Bey; auch Familienname + Hanım/Bey (Becker Hanım). Das Arabische stellt den Titel vor den Namen (as-sayyida Laylā, al-ustāḏ Murād). Bay und Bayan + Familienname stehen in Briefen und Formularen.
- **Keine Anrede mit Abū … oder Umm …:** Im Türkischen spricht man Eltern mit Vorname + Hanım/Bey an oder mit einem Verwandtschaftswort.
- **Verwandtschaftswörter als Anrede:** abla, abi, teyze, amca, auch für Fremde. Vertraut: dialektal ḫālto und ʿammū; in Ägypten ist ʾabla (aus dem Türkischen) eine Anrede (zu prüfen, KT-ar-04).
- **Berufe als Anrede:** Doktor Bey/Hanım, Hemşire Hanım, Öğretmenim (für Lehrkräfte), usta (für Handwerker).
- **Namen in türkischen Texten:** Arabische Namen stehen ohne Längenzeichen und Sonderzeichen der Umschrift: Rim, Samir, Fadi (OF-tr-04).
- **Ohne Anrede:** Für „Entschuldigung, …“ an Fremde: Pardon, bakar mısınız?

### 4.3 Grüßen, Danken, Bitten, Wünschen

Nur weltliche Formeln (Leitfaden §4.3). Die arabischen Formen dienen als Brücke; wo eine Formel nur dialektal üblich ist, steht die Region dabei.

| Situation | Türkisch | Arabisch (Umschrift) | Hinweis |
|---|---|---|---|
| Gruß | Merhaba; Günaydın, İyi günler, İyi akşamlar | marḥaban, ahlan; ṣabāḥ al-ḫayr, masāʾ al-ḫayr | Merhaba kommt von marḥaban. |
| Antwort am Morgen | Günaydın – Günaydın | ṣabāḥ al-ḫayr – ṣabāḥ an-nūr | Türkisch antwortet mit demselben Wort. |
| Ankunft | Hoş geldiniz! – Hoş bulduk! | ahlan wa-sahlan – ahlan bik | Vertraut: Die Antwort ist fest. |
| Abschied | Hoşça kal (wer geht) – Güle güle (wer bleibt); Görüşürüz | maʿa s-salāma | Türkisch unterscheidet, wer geht. |
| Befinden | Nasılsın? – İyiyim, teşekkür ederim, sen nasılsın? | kayfa ḥāluk? – bi-ḫayr, šukran | Die Gegenfrage gehört dazu. |
| Kennenlernen | Memnun oldum. | furṣa saʿīda | memnun ist nicht mamnūn (§3.1). |
| Dank | Teşekkür ederim, Teşekkürler, Sağ ol | šukran | teşekkür wie tašakkur |
| Antwort auf Dank | Rica ederim, Bir şey değil | ʿafwan | rica wie raǧāʾ (Bitte) |
| Anbieten, hereinbitten | Buyurun | tafaḍḍal | Vertraut: ein Wort für mehrere Lagen |
| Nachfragen | Efendim? | ʿafwan?; ägyptisch afandim | §3.5 |
| Entschuldigung | Pardon, Affedersiniz, Kusura bakmayın | ʿafwan, āsif, lā tuʾāḫiḏnī | Kusura bakmayın wie lā tuʾāḫiḏnī |
| Essen | Afiyet olsun | bi-l-hanāʾ wa-š-šifāʾ; ṣaḥtēn (Levante) | auch zu jemandem, der gerade isst |
| Lob für Gekochtes | Elinize sağlık – Afiyet olsun | tislam īdak (Levante) | feste Antwort der Köchin oder des Kochs |
| Gruß an Arbeitende | Kolay gelsin | (keine feste hochsprachliche Formel) | beim Betreten eines Ladens, zu Handwerkern |
| Krankheit | Geçmiş olsun | šifāʾan ʿāǧilan; salāmtak (Levante) | auch nach Unglück und Ärger |
| Niesen | Çok yaşa – Sen de gör | – | nur die türkische weltliche Form; die übliche arabische Formel ist gesperrt (§4.7) |
| Glückwunsch | Tebrikler, Tebrik ederim | mabrūk | – |
| Neues Gekauftes | Güle güle kullan | – | – |
| Neue Wohnung | Güle güle oturun | – | – |
| Reise | İyi yolculuklar | riḥla saʿīda | – |
| Arbeit, Schule | İyi çalışmalar, İyi dersler | – | auch als Gruß am Ende einer E-Mail |
| Trauer | Başınız sağ olsun | aḥarr at-taʿāzī | erst ab B1, ruhig (Leitfaden G-12) |

### 4.4 Gespräch, Kritik, Absagen

Die Hinweise beschreiben Gewohnheiten, sie bewerten keine Herkunft (Leitfaden G-04).
- **Nein ohne Wort:** Kopf leicht nach hinten, Augenbrauen hoch, oft mit einem Schnalzlaut („cık“). Diese Geste kennen viele Arabischsprachige ebenfalls (zu prüfen, KT-ar-05).
- **Bitten:** mit Aorist-Fragen, lütfen und acaba weich machen (`tr.g.aorist_bitte`, `tr.g.hoeflichkeit_strategien`); acaba ist kein Ausruf des Staunens.
- **Kritik:** eher indirekt und mit Abschwächung (biraz, sanırım, bence de … ama).
- **Absagen:** mit Dank und Bedauern: Çok isterdim ama maalesef gelemiyorum.
- **Telefon:** Alo? oder Efendim? – Vertraut: alū.

### 4.5 Briefe, E-Mails, Formulare

| Bestandteil | Türkisch | Arabisch (Umschrift) | Tipp |
|---|---|---|---|
| förmliche Anrede | Sayın Ayla Kaya, / Sayın Kaya, | as-sayyida al-muḥtarama … | Sayın + Name, ohne weiteren Titel |
| Empfänger unbekannt | Sayın Yetkili, | ilā man yahummuhu l-amr | – |
| vertraute Anrede | Merhaba Elif, / Canım Elif, / Sevgili … (§8, KT-ar-11) | ʿazīzatī … | – |
| Schluss förmlich | Saygılarımla | maʿa fāʾiq al-iḥtirām | – |
| Schluss vertraut | Sevgiler, Görüşmek üzere | maʿa taḥiyyātī | – |
| Betreff, Anlage | Konu:, Ek: | al-mawḍūʿ, al-murfaqāt | – |
| Arbeitsmail | İyi çalışmalar dilerim. | – | häufiger Schlusssatz |
| Antrag an eine Behörde | Bittschrift (dilekçe): Empfänger oben in Großbuchstaben und im Dativ (… BAŞKANLIĞINA), Datum, Anliegen, feste Schlussformel „Gereğinin yapılmasını arz ederim.“, Name, Unterschrift, Adresse, Anlagen | ṭalab, ʿarḍ ḥāl | arz ist ʿarḍ; die Schlussformel ganz lernen (B2-e06) |
| Formular | soyadı, adı, doğum tarihi, doğum yeri, uyruğu, medeni hali, adres | al-ism, tārīḫ al-mīlād, makān al-mīlād, al-ḥāla al-iǧtimāʿiyya, al-ʿunwān | medeni hali = Familienstand; Familienname zuerst |
| Lebenslauf | özgeçmiş | as-sīra aḏ-ḏātiyya | B2-e02 |
| E-Mail-Adressen in Übungen | nur example.org, nicht verlinkt (Leitfaden G-08) | – | – |

### 4.6 Zeit, Zahlen, Formate, Schule

| Thema | Türkei | arabischsprachige Länder | Tipp |
|---|---|---|---|
| Ziffern | 0–9 | im Osten oft andere Ziffernformen, im Maghreb 0–9 | immer 0–9 |
| Zahlen lesen | von links nach rechts | Zahlen auch in arabischer Schrift von links nach rechts | Vertraut |
| Datum | 20.10.2026; 20 Ekim 2026 | 20/10/2026 | ohne Punkt nach dem Tag, wenn der Monat ausgeschrieben ist |
| Monatsnamen | eigene Namen | je nach Land verschieden | §3.2 |
| Wochenbeginn | pazartesi (Montag) | in vielen Ländern Samstag oder Sonntag | Montag ist der erste Tag. |
| Wochenende | cumartesi, pazar | in vielen Ländern Freitag und Samstag | – |
| Uhrzeit | 14.30 oder 14:30; im Gespräch 12 Stunden | ähnlich | Vertraut |
| halbe Stunde | üç buçuk = 3:30 | aṯ-ṯāliṯa wa-n-niṣf | Vertraut: Die Stunde wird zuerst genannt. |
| Prozent | %10 (yüzde on) | – | Zeichen vorn |
| Adresse | Straße, No: Hausnummer, Daire: Wohnungsnummer, Stadtteil, Stadt | – | Daire ist die Wohnungsnummer. |
| Wohnungsanzeige | 3+1 = drei Zimmer und ein Wohnzimmer | – | Das Wohnzimmer wird extra gezählt. |
| Stockwerk | zemin kat, birinci kat | aṭ-ṭābiq al-arḍī, aṭ-ṭābiq al-awwal | Vertraut |
| Schule | ilkokul (4 Jahre), ortaokul (4), lise (4) | je nach Land verschieden | – |
| Notruf | 112 | je nach Land verschieden | in Deutschland 112, Polizei 110 |

### 4.7 Religiöse Formeln (gesperrt)

Für viele Alltagssituationen gibt es im Türkischen und im Arabischen auch religiöse Formeln (Gruß, Pläne, Lob, Dank, Abschied, Niesen, Trauer). Viele Arabischsprachige erkennen sie im Türkischen wieder. In den Sprachkursen sind sie gesperrte Kandidaten (Leitfaden §4.2, F-tr-01 bis F-tr-15 und F-ar-01 bis F-ar-17) und kein Gegenstand dieses Dokuments.
- Tipps nennen nur die weltlichen Formeln aus Leitfaden §4.3 und §4.3 oben.
- Kein Tipp vergleicht, erklärt, übersetzt oder bewertet eine religiöse Formel, auch nicht als Lehnwort-Brücke. Ein kurzer Alltagsgruß, der nahe an F-tr-01 liegt, bleibt nach OF-tr-05 ungenutzt.
- Sie erscheinen frühestens nach zwei Freigaben der religiösen Prüfung (KERN §2.3, LM-09).

## 5 Hinweise für Herkunftssprachler und Mehrsprachige

### 5.1 Wer den Kurs nutzt

| Gruppe | Stärken | typische Lücken | Ausrichtung der Tipps |
|---|---|---|---|
| Familien, die vor Deutschland einige Jahre in der Türkei gelebt haben; Kinder oft mit türkischer Schulzeit | Sprechen, Hören, oft auch Lesen und Schulwortschatz | Schreibung (ohne Schulzeit), Schriftsprache, Vergessen nach dem Umzug | Einstufung je Fertigkeit; Tipps zu Schreibung und Register; Pflege statt Neuanfang |
| Türkmenen aus dem Irak und aus Syrien | türkmenische Familiensprache, mit dem Türkischen eng verwandt (zu prüfen, KT-ar-02) | Standardschreibung, Wortschatz und Formen des Türkeitürkischen | Unterschiede als Varietät zeigen, nicht als Fehler |
| Kinder aus arabisch-türkischen Familien | Verstehen, Klang, Familienwortschatz | Lesen und Schreiben, Endungen, siz-Formen | wie die Herkunftssprachler in `kontrast-tr-aus-de.md` §5 |
| Kinder und Jugendliche mit türkischsprachigen Freunden in Deutschland | Alltagsausdrücke, Aussprache | Grammatik, Schriftsprache | Register-Tipps; Umgangssprache wird verstanden, nicht bewertet |
| Arabischsprachige ohne Vorwissen | hocharabische Grammatik, viele bekannte Lehnwörter, Mehrsprachigkeit | alles Türkische; teils die Lateinschrift | volle Kontrasttipps ab dem Vorkurs |

Wie groß die Gruppen in der Gemeinde sind, ist nicht bekannt (KT-ar-01). Die Tipps sind so geschrieben, dass sie für alle Gruppen passen.

### 5.2 Typische Muster und Tipps

Erfahrungswerte, noch nicht gemessen (KT-ar-10). Tipps behandeln Familiensprache, Dialekte und Varietäten neutral; sie zeigen die Standardform als Ergänzung, ohne „falsch“ und ohne Wertung (Leitfaden G-04).

| Muster | Beispiel | Tipp-Idee | Einheit |
|---|---|---|---|
| Schreiben ohne Sonderzeichen | „cok guzel“, „nasilsin“ | Sonderzeichenleiste nutzen; der Abgleich nimmt Antworten ohne Sonderzeichen mit Hinweis an (PLAN §4.1), außer wenn ein anderes Wort entsteht (kır – kir) | tr.v.l01, A1-e02 |
| Schreiben, wie man spricht | „geliyom“, „gelicem“, „napıyosun“ | gesprochene und geschriebene Form nebeneinander zeigen | A2-e03, C1-e04 |
| Lehnwort mit arabischer Bedeutung | „Fakat bir tane.“ (gemeint: nur eins) | §3.1; die türkische Bedeutung zuerst nennen | A2-e09 |
| arabischer Plural übertragen | „kütüp“ für Bücher | ein Plural: kitaplar | A1-e03 |
| Lehnwort mit arabischen Lauten gesprochen | ḥayat, ṭabiat, sāʿat | verständlich; Standard ist der einfache Laut (§1.2) | tr.v.l01 |
| Verb vorn | „Gitti Elif okula.“ | im Gespräch möglich (devrik), im Text Verb ans Ende | A1-e06, C1-e12 |
| Präposition übertragen | „ile annem“, „içinde ev“ | Endung oder Verhältniswort hinten | A1-e05, A1-e11 |
| sen statt siz zu Fremden | „Sen nereye gidiyorsun?“ zur Ärztin | siz-Formen und Anrede mit Hanım/Bey | A2-e02 |
| türkmenische Formen | (keine Beispiele bis zur Stichprobe, KT-ar-02) | Standardtürkisch als zweite Form | A1-e01 |

### 5.3 Sprache der Tipps

- **Hocharabisch, einfach und kurz:** Titel, höchstens zwei Sätze, ein bis drei türkische Beispiele mit `lang="tr"` und `dir="ltr"`, in der Zeile isoliert (KERN §7). Arabische Wörter in den Tipps stehen in arabischer Schrift, voll vokalisiert, nur in `web/inhalte/lernapp/uebersetzung/tr-aus-ar/**` (KERN §3); dieses Dokument nennt sie in Umschrift.
- **Beispiele zuerst:** erst das türkische Beispiel, dann die Regel.
- **Fachwörter als Brücke:** Viele ältere türkische Grammatikbegriffe stammen aus dem Arabischen. Tipps nennen den arabischen Begriff, den türkischen in Klammern und ein Beispiel:

| Deutsch | Türkisch | Arabisch (Umschrift) |
|---|---|---|
| Nomen | isim | ism |
| Verb | fiil | fiʿl |
| Adjektiv | sıfat | ṣifa, naʿt |
| Pronomen | zamir | ḍamīr |
| Buchstabe, Partikel | harf, edat | ḥarf, adāt |
| Satz | cümle | ǧumla |
| Nominalsatz | isim cümlesi | ǧumla ismiyya |
| Subjekt | özne | fāʿil, mubtadaʾ |
| Objekt | nesne | mafʿūl bihi |
| Infinitiv, Verbalnomen | mastar, isim-fiil | maṣdar |
| Partizip | sıfat-fiil | ism al-fāʿil, ism al-mafʿūl (ungefähr) |
| Konverb | zarf-fiil | ḥāl (ungefähr) |
| Endung | ek | lāḥiqa |
| Wurzel, Stamm | kök, gövde | ǧiḏr |
| Singular, Plural | tekil, çoğul | mufrad, ǧamʿ |
| Vergangenheit | geçmiş zaman | māḍī |
| Bedingung | şart | šarṭ |
| Verneinung | olumsuzluk | nafy |
| Frage | soru | istifhām |
| Passiv | edilgen | mabnī li-l-maǧhūl |
| Besitzendung | iyelik eki | ḍamīr muttaṣil (ungefähr) |
| Genitivverbindung | isim tamlaması | iḍāfa |
| Vokalharmonie | ünlü uyumu | – |

### 5.4 Einstufung und Lernweg

- Wer die Lateinschrift nicht kennt, beginnt mit dem Vorkurs `de.v.l01`–`de.v.l06` und dann `tr.v.l01`. Die Einstufung erkennt Vorwissen in der Lateinschrift.
- Wer in der Türkei gelebt hat oder Türkmenisch spricht, versteht oft mehr, als er schreibt. Der Einstufungstest (AUFTRAG §5.2, Einstufungsbank PLAN §5.1) soll je Fertigkeit messen; ein eigener Schnellweg ist nach OF-tr-09 nicht vorgesehen.
- Ab A2 stehen Schreibaufgaben im Rahmenplan (OF-tr-03); sie sind für diese Gruppen besonders wichtig.

## 6 Tipp-Themen je Einheit

308 Tipp-Themen für 74 Einheiten-Schlüssel (Vorkurs `tr.v.l01`–`tr.v.l02` und 72 Einheiten). 163 beziehen sich auf eine Grammatik-ID (109 der 109 IDs), die übrigen auf Laut, Schrift, Wortschatz, Pragmatik oder die Hinweise für Herkunftssprachler (Abschnitt in der Spalte „Bezug“). Jede Einheit hat mindestens zwei Tipps.

| Stufe | Einheiten | Tipp-Themen | je Einheit |
|---|---|---|---|
| Vorkurs | 2 | 12 | 6,0 |
| A1 | 12 | 69 | 5,8 |
| A2 | 14 | 68 | 4,9 |
| B1 | 16 | 70 | 4,4 |
| B2 | 16 | 56 | 3,5 |
| C1 | 14 | 33 | 2,4 |
| Σ | 74 | 308 | 4,2 |

**Leitlinien für das Schreiben der Tipps (Phase Ü, PLAN §6.3):**
- **Sprache:** Hocharabisch als Oberflächensprache, einfach und kurz (§5.3): Titel, höchstens zwei Sätze, ein bis drei türkische Beispiele mit `lang="tr"` und `dir="ltr"`. Arabische Schrift nur in `web/inhalte/lernapp/uebersetzung/tr-aus-ar/**` (KERN §3); hier steht Umschrift.
- **Aufbau:** Brücke zuerst („Das kennst du schon: …“), dann der Unterschied. Keine Wertung der Ausgangssprache oder der Familiensprache; „im Türkischen anders“ statt „falsch“.
- **Ort:** Der Tipp erscheint in der genannten Einheit. Nennt er eine Grammatik-ID, ist sie dort oder früher eingeführt (vom Generator geprüft).
- **Beispiele:** nur Wortschatz bis zur Einheit (PLAN §6.4), nur Namen aus der Namensliste (Leitfaden §1.1), bis B1 kindgeeignet, ohne Tabu-Lexikon und ohne religiöse Formeln (§4.7). Einträge mit „zu prüfen“ erst nach der Stichprobe.
- **Schlüssel:** Vorschlag `tr-aus-ar.tipp.<Nr.>`; das Schema legt L3-02 fest.

| Nr. | Einheit | Tipp-Titel | Bezug |
|---|---|---|---|
| 001 | tr.v.l01 | Lateinschrift von links nach rechts: Grundlagen im Vorkurs Deutsch | §1.1 |
| 002 | tr.v.l01 | Alle Vokale werden geschrieben – auch die kurzen | §1.1 |
| 003 | tr.v.l01 | Acht Vokale statt drei | §1.2 |
| 004 | tr.v.l01 | p ist nicht b: pul – bul | §1.3 |
| 005 | tr.v.l01 | v ist nicht f: var – far | §1.3 |
| 006 | tr.v.l01 | c ist ǧ wie in der Hochsprache, ç ist „tsch“ | §1.2 |
| 007 | tr.v.l01 | ğ ist kein ġ: Es dehnt den Vokal davor | §1.2 |
| 008 | tr.v.l02 | Helle und dunkle Vokale hören | §1.2 |
| 009 | tr.v.l02 | e und i unterscheiden: el – il, ben – bin | §1.3 |
| 010 | tr.v.l02 | o und u unterscheiden: on – un, toz – tuz | §1.3 |
| 011 | tr.v.l02 | ö und ü: Lippen rund, Zunge vorn | §1.2 |
| 012 | tr.v.l02 | Doppelte Konsonanten wie mit Šadda: elli – eli | §1.2 |
| 013 | tr.a1.e01 | Kein Genus: o ist huwa und hiya | `tr.g.personalpron` |
| 014 | tr.a1.e01 | siz: Plural und höfliche Anrede zugleich | `tr.g.personalpron` |
| 015 | tr.a1.e01 | Nominalsatz wie im Arabischen, aber mit Endung: Öğrenciyim | `tr.g.kopula` |
| 016 | tr.a1.e01 | Merhaba kommt von marḥaban – heißt aber einfach „Hallo“ | §3.2 |
| 017 | tr.a1.e01 | Memnun oldum: „Freut mich“, nicht „ich bin dankbar“ | §3.1 |
| 018 | tr.a1.e01 | Hoş geldiniz – Hoş bulduk: Gruß und feste Antwort | §4.3 |
| 019 | tr.a1.e01 | memleket: Heimatort, kein Königreich | §3.1 |
| 020 | tr.a1.e02 | Der letzte Vokal bestimmt die Endung | `tr.g.vokalharmonie` |
| 021 | tr.a1.e02 | bu kitap und Bu bir kitap: hāḏā l-kitāb und hāḏā kitāb | `tr.g.bu_su_o` |
| 022 | tr.a1.e02 | bu ohne Genus: für hāḏā und hāḏihi | `tr.g.bu_su_o` |
| 023 | tr.a1.e02 | mi steht hinten, hal vorn | `tr.g.frage_mi` |
| 024 | tr.a1.e02 | sınıf ist die Schulklasse, nicht ṣinf (Sorte) | §3.1 |
| 025 | tr.a1.e02 | tahta ist Holz und Tafel, nicht taḥta | §3.1 |
| 026 | tr.a1.e03 | Nach jeder Zahl der Singular – auch nach 3 bis 10 | `tr.g.plural` |
| 027 | tr.a1.e03 | Nur ein Plural: -ler/-lar, keine inneren Plurale | `tr.g.plural` |
| 028 | tr.a1.e03 | yirmi bir: Zehner zuerst, ohne „und“ | `tr.g.zahlen` |
| 029 | tr.a1.e03 | değil ist das türkische laysa | `tr.g.degil` |
| 030 | tr.a1.e03 | hala ist die Schwester des Vaters (ʿamma) | §3.4 |
| 031 | tr.a1.e03 | ömür heißt Lebenszeit; nach dem Alter fragt man mit yaş | §3.1 |
| 032 | tr.a1.e03 | rakam ist die Ziffer, die Telefonnummer heißt numara | §3.1 |
| 033 | tr.a1.e04 | Ohne Verb „haben“ wie ʿindī: Bir kardeşim var | `tr.g.var_yok` |
| 034 | tr.a1.e04 | Bende kalem var: wie ʿindī qalam bei Gegenständen | `tr.g.var_yok` |
| 035 | tr.a1.e04 | Besitz am Nomen wie kitābī | `tr.g.possessiv` |
| 036 | tr.a1.e04 | Achtung: kitabı heißt „sein Buch“, kitabım „mein Buch“ | `tr.g.possessiv` |
| 037 | tr.a1.e04 | hamam ist das Badehaus, das Badezimmer heißt banyo | §3.1 |
| 038 | tr.a1.e04 | eşya: Sachen und Möbel – ein arabischer Plural als Sammelwort | §3.2 |
| 039 | tr.a1.e05 | fī vorn, -de hinten: evde | `tr.g.lokativ` |
| 040 | tr.a1.e05 | Großschreibung und Apostroph bei Namen | `tr.g.eigenname_apostroph` |
| 041 | tr.a1.e05 | nerede, nereye, nereden wie ayna, ilā ayna, min ayna | `tr.g.fragewoerter` |
| 042 | tr.a1.e05 | Das Adjektiv steht vorn und bleibt gleich: büyük ev | `tr.g.adjektiv` |
| 043 | tr.a1.e05 | cadde und sokak: ǧādda und zuqāq | §3.2 |
| 044 | tr.a1.e05 | şehir ist die Stadt, nicht der Monat (šahr) | §3.1 |
| 045 | tr.a1.e06 | Die Person steht am Ende des Verbs | `tr.g.iyor` |
| 046 | tr.a1.e06 | -iyor: jetzt und gerade | `tr.g.iyor` |
| 047 | tr.a1.e06 | Das Verb ans Ende | `tr.g.wortstellung` |
| 048 | tr.a1.e06 | Erst alles sagen, dann das Verb | `tr.g.wortstellung` |
| 049 | tr.a1.e06 | Die Woche beginnt mit pazartesi | §4.6 |
| 050 | tr.a1.e07 | -(y)i heißt „bestimmt“ und „Objekt“ zugleich | `tr.g.akkusativ` |
| 051 | tr.a1.e07 | Elma alıyorum: wie tuffāḥan ohne Endung | `tr.g.akkusativ` |
| 052 | tr.a1.e07 | kitap – kitabı: Das b kommt zurück | `tr.g.konsonant` |
| 053 | tr.a1.e07 | çay und šāy: ç ist nicht š | §1.3 |
| 054 | tr.a1.e07 | Obst und Gemüse mit bekannten Namen: muz, portakal, patlıcan | §3.2 |
| 055 | tr.a1.e07 | domates und patates: andere Namen als im Arabischen | §3.3 |
| 056 | tr.a1.e08 | ilā wird -e: okula | `tr.g.dativ` |
| 057 | tr.a1.e08 | min wird -den: Türkiye'den | `tr.g.ablativ` |
| 058 | tr.a1.e08 | otobüse binmek: -e, wo rakiba ein direktes Objekt hat | `tr.g.dativ` |
| 059 | tr.a1.e08 | işaret ist ein Zeichen; die Ampel heißt trafik lambası | §3.1 |
| 060 | tr.a1.e08 | Dikkat! heißt Achtung, nicht Genauigkeit | §3.1 |
| 061 | tr.a1.e09 | saat wie sāʿa, aber mit Grundzahl: Saat üç | `tr.g.uhrzeit` |
| 062 | tr.a1.e09 | üç buçuk: halb vier, ohne wa-niṣf | `tr.g.uhrzeit` |
| 063 | tr.a1.e09 | Umgekehrt zur Iḍāfa: annemin evi | `tr.g.genitiv` |
| 064 | tr.a1.e09 | fen ist Naturwissenschaft, nicht Kunst (fann) | §3.1 |
| 065 | tr.a1.e09 | teneffüs ist die Schulpause | §3.1 |
| 066 | tr.a1.e10 | Befehl ohne Genus: Gel! | `tr.g.imperativ` |
| 067 | tr.a1.e10 | Höflich: Gelin! und Lütfen oturun | `tr.g.imperativ` |
| 068 | tr.a1.e10 | masanın üstünde: erst der Tisch, dann die Lage | `tr.g.raum_postpos` |
| 069 | tr.a1.e10 | misafir ist der Gast, nicht der Reisende | §3.1 |
| 070 | tr.a1.e10 | ziyaret: Besuch wie ziyāra | §3.2 |
| 071 | tr.a1.e10 | Afiyet olsun und Elinize sağlık | §4.3 |
| 072 | tr.a1.e11 | maʿa und bi- werden ile: annemle, otobüsle | `tr.g.ile` |
| 073 | tr.a1.e11 | Yüzmek istiyorum statt urīdu an asbaḥa | `tr.g.mek_istemek` |
| 074 | tr.a1.e11 | hava heißt Luft und Wetter | §3.1 |
| 075 | tr.a1.e11 | derece: Grad wie daraǧa | §3.2 |
| 076 | tr.a1.e11 | Hava güzel: Wetter ohne Verb | `tr.g.kopula` |
| 077 | tr.a1.e12 | okul bahçesi: Iḍāfa ohne Genitiv | `tr.g.nominalkompositum` |
| 078 | tr.a1.e12 | Başım ağrıyor: Mein Kopf schmerzt | `tr.g.possessiv` |
| 079 | tr.a1.e12 | vücut ist der Körper, nicht wuǧūd | §3.1 |
| 080 | tr.a1.e12 | kafa: Kopf (umgangssprachlich), nicht qafā | §3.1 |
| 081 | tr.a1.e12 | Geçmiş olsun: Gute Besserung | §4.3 |
| 082 | tr.a2.e01 | -di wie der Māḍī: die Person hinten | `tr.g.di` |
| 083 | tr.a2.e01 | gittim: d wird t nach harten Lauten | `tr.g.di` |
| 084 | tr.a2.e01 | kāna wird -(y)di: evdeydim | `tr.g.idi` |
| 085 | tr.a2.e01 | kāna ʿindī = vardı | `tr.g.idi` |
| 086 | tr.a2.e01 | tatil ist der Urlaub, nicht taʿṭīl | §3.1 |
| 087 | tr.a2.e02 | Viertel nach und vor: geçiyor und var | `tr.g.uhrzeit_genau` |
| 088 | tr.a2.e02 | Ordnungszahl -(i)nci vor dem Nomen | `tr.g.ordinal` |
| 089 | tr.a2.e02 | Hanım und Bey hinter dem Namen | `tr.g.anrede` |
| 090 | tr.a2.e02 | Anreden mit Abū oder Umm gibt es im Türkischen nicht | `tr.g.anrede` |
| 091 | tr.a2.e02 | medeni hal: der Familienstand im Formular | §4.5 |
| 092 | tr.a2.e02 | Şubat, Nisan, Haziran, Temmuz, Eylül: Monate wie in der Levante und im Irak | §3.2 |
| 093 | tr.a2.e03 | sa- und sawfa werden -ecek | `tr.g.ecek` |
| 094 | tr.a2.e03 | yazacağım: k wird ğ | `tr.g.ecek` |
| 095 | tr.a2.e03 | Hadi gidelim: Lass uns gehen | `tr.g.optativ` |
| 096 | tr.a2.e03 | seyahat ist die Reise, siyāḥa der Tourismus | §3.1 |
| 097 | tr.a2.e03 | sefer ist eine Fahrt (Bus, Flug), nicht safar | §3.1 |
| 098 | tr.a2.e04 | Der Muḍāriʿ wird zwei Zeiten: -iyor und Aorist | `tr.g.aorist` |
| 099 | tr.a2.e04 | Den Aorist-Vokal mit dem Verb lernen | `tr.g.aorist` |
| 100 | tr.a2.e04 | Bitten mit dem Aorist: Verir misiniz? | `tr.g.aorist_bitte` |
| 101 | tr.a2.e04 | kibar heißt höflich, nicht „die Großen“ | §3.1 |
| 102 | tr.a2.e04 | Kolay gelsin: Gruß an Arbeitende | §4.3 |
| 103 | tr.a2.e05 | min beim Vergleich: Can'dan daha küçük | `tr.g.komparativ` |
| 104 | tr.a2.e05 | Keine afʿal-Form: daha und en | `tr.g.komparativ` |
| 105 | tr.a2.e05 | senin gibi wie miṯlak | `tr.g.gibi_kadar` |
| 106 | tr.a2.e05 | elbise ist ein Kleid | §3.1 |
| 107 | tr.a2.e05 | mağaza ist ein Laden, maḫzan ein Lager | §3.1 |
| 108 | tr.a2.e06 | -ebil statt astaṭīʿu | `tr.g.ebil` |
| 109 | tr.a2.e06 | yüzemem: nicht können | `tr.g.ebil` |
| 110 | tr.a2.e06 | -mek wie ein Maṣdar | `tr.g.mek_nomen` |
| 111 | tr.a2.e06 | maç und takım: Spiel und Mannschaft | §3.3 |
| 112 | tr.a2.e07 | lazım wie lāzim – aber am Ende | `tr.g.meli_lazim` |
| 113 | tr.a2.e07 | -meli heißt „sollte“ | `tr.g.meli_lazim` |
| 114 | tr.a2.e07 | şekersiz statt bi-dūn sukkar | `tr.g.wortbildung1` |
| 115 | tr.a2.e07 | ilaç ist das Medikament, nicht die Behandlung | §3.1 |
| 116 | tr.a2.e07 | eczane ist die Apotheke | §3.1 |
| 117 | tr.a2.e08 | dersten sonra: wie baʿda d-dars, nur umgekehrt | `tr.g.postpos_kasus` |
| 118 | tr.a2.e08 | için am Ende: öğrenmek için | `tr.g.mek_icin` |
| 119 | tr.a2.e08 | müzakere heißt Verhandlung; lernen heißt ders çalışmak | §3.1 |
| 120 | tr.a2.e08 | imtihan und sınav: zwei Wörter für Prüfung | §3.2 |
| 121 | tr.a2.e08 | mektep und mektup: Schule (alt) und Brief | §3.1 |
| 122 | tr.a2.e09 | ve ist wa – aber selten am Satzanfang | `tr.g.konjunktionen` |
| 123 | tr.a2.e09 | fakat heißt „aber“, nicht „nur“ | `tr.g.konjunktionen` |
| 124 | tr.a2.e09 | de/da „auch“ getrennt schreiben | `tr.g.konjunktionen` |
| 125 | tr.a2.e09 | kendim wie nafsī | `tr.g.kendi` |
| 126 | tr.a2.e09 | akraba und evlat: arabische Plurale als Einzahl | §3.2 |
| 127 | tr.a2.e10 | -miş: „offenbar“, wie ʿalā mā yabdū | `tr.g.mis_grund` |
| 128 | tr.a2.e10 | Gesehen -di, bemerkt -miş | `tr.g.mis_grund` |
| 129 | tr.a2.e10 | tabiat und doğa: zwei Wörter für Natur | §3.2 |
| 130 | tr.a2.e10 | hayret ist Staunen, nicht Ratlosigkeit | §3.1 |
| 131 | tr.a2.e11 | kāna yafʿalu = -iyordu | `tr.g.iyordu` |
| 132 | tr.a2.e11 | Wie bei mundu bleibt die Gegenwart: İki yıldır burada oturuyoruz | `tr.g.dir_dauer` |
| 133 | tr.a2.e11 | daire ist die Wohnung | §3.1 |
| 134 | tr.a2.e11 | Güle güle oturun: Wunsch zur neuen Wohnung | §4.3 |
| 135 | tr.a2.e11 | Helle Endung bei saat, hal, kalp | `tr.g.vokalharmonie` |
| 136 | tr.a2.e12 | masadaki kitap: -ki ist kein allaḏī | `tr.g.ki_attribut` |
| 137 | tr.a2.e12 | olmak: yakūnu und aṣbaḥa | `tr.g.olmak_werden` |
| 138 | tr.a2.e12 | meslek ist der Beruf, nicht der Weg | §3.1 |
| 139 | tr.a2.e12 | mühendis wie muhandis | §3.2 |
| 140 | tr.a2.e12 | maaş ist das Gehalt | §3.1 |
| 141 | tr.a2.e13 | -sin wie li- mit Jussiv | `tr.g.imperativ3` |
| 142 | tr.a2.e13 | Wünsche: Geçmiş olsun, Kolay gelsin | `tr.g.imperativ3` |
| 143 | tr.a2.e13 | Tebrikler wie mabrūk | §4.3 |
| 144 | tr.a2.e13 | davet und hediye: Einladung und Geschenk | §3.2 |
| 145 | tr.a2.e14 | yüz elli ohne „und“ | `tr.g.zahlen_gross` |
| 146 | tr.a2.e14 | Immer die Ziffern 0–9 | §4.6 |
| 147 | tr.a2.e14 | hesap und fatura: alte Bekannte | §3.2 |
| 148 | tr.a2.e14 | makbuz ist die Quittung, nicht „empfangen“ | §3.1 |
| 149 | tr.a2.e14 | harç und harçlık: Gebühr und Taschengeld | §3.1 |
| 150 | tr.b1.e01 | Doppelte Verneinung wie lam yaʾti aḥad | `tr.g.indefinit` |
| 151 | tr.b1.e01 | -mişti wie kāna qad faʿala | `tr.g.zusammengesetzt` |
| 152 | tr.b1.e01 | -erdi wie kāna yafʿalu (Gewohnheit) | `tr.g.zusammengesetzt` |
| 153 | tr.b1.e01 | ihtiyar heißt alt, nicht Wahl | §3.1 |
| 154 | tr.b1.e01 | hatıra ist eine Erinnerung, kein Gedanke | §3.1 |
| 155 | tr.b1.e02 | allaḏī + Verb wird -en vor dem Nomen | `tr.g.partizip_en` |
| 156 | tr.b1.e02 | Wie das Ism al-fāʿil, nur vorn | `tr.g.partizip_en` |
| 157 | tr.b1.e02 | mesai ist die Arbeitszeit | §3.1 |
| 158 | tr.b1.e02 | amir und müdür: Vorgesetzte | §3.1 |
| 159 | tr.b1.e02 | izin: Erlaubnis und Urlaub | §3.1 |
| 160 | tr.b1.e03 | Kein Rückverweis: okuduğum kitap | `tr.g.partizip_dik` |
| 161 | tr.b1.e03 | Das -tu wird zur Besitzendung | `tr.g.partizip_dik` |
| 162 | tr.b1.e03 | emlak und mal sahibi: Immobilien und Eigentümer | §3.1 |
| 163 | tr.b1.e03 | semt ist der Stadtteil | §3.1 |
| 164 | tr.b1.e04 | gideceğimiz şehir: ohne ilayhā | `tr.g.partizip_ecek` |
| 165 | tr.b1.e04 | -ip statt wa | `tr.g.konverb_ip` |
| 166 | tr.b1.e04 | kasaba ist eine Kleinstadt | §3.1 |
| 167 | tr.b1.e04 | istikamet heißt Richtung | §3.1 |
| 168 | tr.b1.e05 | yürüyerek wie der Ḥāl | `tr.g.konverb_erek_meden` |
| 169 | tr.b1.e05 | düşünmeden wie dūna an | `tr.g.konverb_erek_meden` |
| 170 | tr.b1.e05 | nefis heißt köstlich | §3.1 |
| 171 | tr.b1.e05 | lezzet und lezzetli | §3.2 |
| 172 | tr.b1.e06 | iḏā wird -se | `tr.g.bedingung_se` |
| 173 | tr.b1.e06 | eğer ersetzt die Endung nicht | `tr.g.bedingung_se` |
| 174 | tr.b1.e06 | vasıta: Fahrzeug, keine Beziehungen | §3.1 |
| 175 | tr.b1.e06 | ceza: Strafe und Bußgeld | §3.1 |
| 176 | tr.b1.e06 | levha: Schild wie lawḥa | §3.2 |
| 177 | tr.b1.e07 | ʿindamā wird -ince | `tr.g.konverb_ince` |
| 178 | tr.b1.e07 | qabla an = -meden önce, ohne Verneinung | `tr.g.temporal_dik` |
| 179 | tr.b1.e07 | baʿda an = -dikten sonra | `tr.g.temporal_dik` |
| 180 | tr.b1.e07 | veli: Erziehungsberechtigte wie walī al-amr | §3.2 |
| 181 | tr.b1.e07 | Lehrkräfte anreden: Öğretmenim oder Ayla Hanım | §4.2 |
| 182 | tr.b1.e08 | Der anna-Satz wird ein Nomen: olduğunu | `tr.g.nominal_dik` |
| 183 | tr.b1.e08 | lā adrī ayna = Nerede olduğunu bilmiyorum | `tr.g.soru_dolayli` |
| 184 | tr.b1.e08 | haber wie ḫabar | §3.2 |
| 185 | tr.b1.e08 | havadis: Nachrichten (alt), keine Unfälle | §3.1 |
| 186 | tr.b1.e09 | li-anna = -diği için | `tr.g.kausal_dik` |
| 187 | tr.b1.e09 | çocukken wie ʿindamā kuntu ṭiflan | `tr.g.konverb_ken` |
| 188 | tr.b1.e09 | sakin: ruhig und Bewohner | §3.2 |
| 189 | tr.b1.e09 | münakaşa ist ein Streit, keine Diskussion | §3.1 |
| 190 | tr.b1.e10 | layta = keşke + -se | `tr.g.bedingung_wunsch` |
| 191 | tr.b1.e10 | Vorschlag mit -sek mi? | `tr.g.bedingung_wunsch` |
| 192 | tr.b1.e10 | huzur: innere Ruhe, nicht Anwesenheit | §3.1 |
| 193 | tr.b1.e10 | gayret: Mühe und Eifer | §3.1 |
| 194 | tr.b1.e10 | merak: Neugier und Sorge | §3.1 |
| 195 | tr.b1.e11 | an + Verb = -me + Besitzendung | `tr.g.mesi_nominal` |
| 196 | tr.b1.e11 | Formu doldurmanız gerekiyor | `tr.g.mesi_nominal` |
| 197 | tr.b1.e11 | müracaat: Antrag, keine Überprüfung | §3.1 |
| 198 | tr.b1.e11 | imza: Unterschrift (ḍ wird z) | §1.4 |
| 199 | tr.b1.e11 | evrak: die Unterlagen | §3.2 |
| 200 | tr.b1.e12 | diye hinter dem Zitat | `tr.g.diye` |
| 201 | tr.b1.e12 | diye als „damit“ | `tr.g.diye` |
| 202 | tr.b1.e12 | aidat ist der Mitgliedsbeitrag, keine Einnahme | §3.1 |
| 203 | tr.b1.e12 | cemiyet und dernek: Verein | §3.2 |
| 204 | tr.b1.e13 | kullamā = -dikçe | `tr.g.konverb_dikce` |
| 205 | tr.b1.e13 | ammā … fa- = ise | `tr.g.ise_nominal` |
| 206 | tr.b1.e13 | wa-illā = yoksa | `tr.g.ise_nominal` |
| 207 | tr.b1.e13 | iklim heißt Klima, nicht Region | §3.1 |
| 208 | tr.b1.e14 | law … la- = -seydi … -irdi | `tr.g.bedingung_irreal` |
| 209 | tr.b1.e14 | icat heißt Erfindung | §3.1 |
| 210 | tr.b1.e14 | keşif wie kašf | §3.2 |
| 211 | tr.b1.e14 | Technikwörter aus dem Französischen: teknoloji, elektrik | §3.3 |
| 212 | tr.b1.e15 | ki wie anna nach Verben des Sagens | `tr.g.ki_konj` |
| 213 | tr.b1.e15 | ki ist nie allaḏī | `tr.g.ki_konj` |
| 214 | tr.b1.e15 | tecrübe heißt Erfahrung | §3.1 |
| 215 | tr.b1.e15 | mezun heißt Absolventin oder Absolvent | §3.1 |
| 216 | tr.b1.e16 | Sen mi pişirdin? wie a-anta … | `tr.g.fokus_soru` |
| 217 | tr.b1.e16 | tarif ist das Rezept, keine Definition | §3.1 |
| 218 | tr.b1.e16 | sofra wie sufra | §3.2 |
| 219 | tr.b1.e16 | Gleiche Gerichte, gleiche Namen: kebap, köfte, baklava | §3.2 |
| 220 | tr.b2.e01 | -miş statt qīla | `tr.g.evidential` |
| 221 | tr.b2.e01 | hastaymış: -miş am Nomen | `tr.g.evidential` |
| 222 | tr.b2.e01 | Das Redeverb ans Ende: … açıkladı | `tr.g.rede_formal` |
| 223 | tr.b2.e01 | manşet: die Schlagzeile | §3.3 |
| 224 | tr.b2.e02 | Passiv wie mabnī li-l-maǧhūl | `tr.g.passiv` |
| 225 | tr.b2.e02 | tarafından wie min qibal | `tr.g.passiv` |
| 226 | tr.b2.e02 | Lebenslauf: tecrübe, beceri, kabiliyet | §3.2 |
| 227 | tr.b2.e03 | -dir/-t wie Stamm II: yaptırmak | `tr.g.kausativ` |
| 228 | tr.b2.e03 | tamir heißt Reparatur, nicht Wiederaufbau | §3.1 |
| 229 | tr.b2.e03 | rutubet: Feuchtigkeit wie ruṭūba | §3.2 |
| 230 | tr.b2.e04 | Stamm VI und -iş: yardımlaşmak | `tr.g.reflexiv_reziprok` |
| 231 | tr.b2.e04 | lā budda = -miş olmalı | `tr.g.modal_vermutung` |
| 232 | tr.b2.e04 | ameliyat: eine Operation | §3.2 |
| 233 | tr.b2.e04 | huzurevi ist ein Seniorenheim | §3.1 |
| 234 | tr.b2.e04 | galiba heißt „wohl“, nicht „meistens“ | §3.1 |
| 235 | tr.b2.e05 | rağmen wie raġma – aber hinten | `tr.g.konzessiv` |
| 236 | tr.b2.e05 | -se de: auch wenn | `tr.g.konzessiv` |
| 237 | tr.b2.e05 | teklif ist ein Vorschlag, keine Belastung | §3.1 |
| 238 | tr.b2.e06 | sayesinde = bi-faḍl, yüzünden = bi-sabab | `tr.g.kausal_formal` |
| 239 | tr.b2.e06 | bi-šarṭi an = -mek şartıyla | `tr.g.bedingung_formal` |
| 240 | tr.b2.e06 | itiraz: Widerspruch (ḍ wird z) | §3.2 |
| 241 | tr.b2.e06 | ret ist eine Ablehnung, keine Antwort | §3.1 |
| 242 | tr.b2.e07 | Die Nisba -ī wird -sel: bilimsel | `tr.g.wortbildung2` |
| 243 | tr.b2.e07 | -leşmek: werden | `tr.g.wortbildung2` |
| 244 | tr.b2.e07 | muhit: Umgebung, kein Ozean | §3.1 |
| 245 | tr.b2.e08 | amacıyla wie bi-hadaf, aber hinten | `tr.g.final_formal` |
| 246 | tr.b2.e08 | masraf wie maṣārīf: Ausgaben und Kosten | §3.2 |
| 247 | tr.b2.e08 | tasarruf heißt Sparen | §3.1 |
| 248 | tr.b2.e08 | kaza heißt Unfall | §3.1 |
| 249 | tr.b2.e08 | dahil und hariç: inklusive und außer | §3.1 |
| 250 | tr.b2.e09 | yaptırıldı von innen nach außen lesen | `tr.g.diathese_kombi` |
| 251 | tr.b2.e09 | teşhis und tedavi: Diagnose und Behandlung | §3.2 |
| 252 | tr.b2.e09 | Fachwörter aus dem Französischen | §3.3 |
| 253 | tr.b2.e10 | mā an … ḥattā = -ir -mez | `tr.g.zeitfolge_er_mez` |
| 254 | tr.b2.e10 | ḥattā = -ene kadar | `tr.g.zeitfolge_er_mez` |
| 255 | tr.b2.e10 | ihtiyaç: Bedarf | §3.2 |
| 256 | tr.b2.e11 | -dir in Verträgen | `tr.g.dir_vermutung` |
| 257 | tr.b2.e11 | kira, akit, fesih: Miete, Vertrag, Kündigung | §3.2 |
| 258 | tr.b2.e11 | ev sahibi und mal: Vermieter und Besitz, nicht Geld | §3.1 |
| 259 | tr.b2.e12 | masmavi: verstärkte Farben | `tr.g.verdoppelung` |
| 260 | tr.b2.e12 | yavaş yavaş wie šuwayya šuwayya | `tr.g.verdoppelung` |
| 261 | tr.b2.e12 | sanat: Kunst und Handwerk | §3.1 |
| 262 | tr.b2.e12 | taklit heißt Nachahmung; Traditionen heißen gelenek | §3.1 |
| 263 | tr.b2.e13 | ka-anna = sanki, -miş gibi | `tr.g.mis_gibi` |
| 264 | tr.b2.e13 | bi-mā anna = madem | `tr.g.konnektoren_b2` |
| 265 | tr.b2.e13 | nesil heißt Generation | §3.1 |
| 266 | tr.b2.e13 | Wer in der Türkei zur Schule ging: Stärken und Lücken | §5 |
| 267 | tr.b2.e14 | -iver: mal eben | `tr.g.aspekt_iver` |
| 268 | tr.b2.e14 | belediye wie baladiyya | §3.2 |
| 269 | tr.b2.e14 | muhtar wie muḫtār | §3.2 |
| 270 | tr.b2.e15 | Statt min: gençlerin yüzde altmışı | `tr.g.statistik` |
| 271 | tr.b2.e15 | Dezimalkomma: 2,5 | §4.6 |
| 272 | tr.b2.e15 | nispet und oran: Verhältnis | §3.2 |
| 273 | tr.b2.e16 | badalan min = -mek yerine | `tr.g.praeferenz` |
| 274 | tr.b2.e16 | -mektense: lieber … als | `tr.g.praeferenz` |
| 275 | tr.b2.e16 | esnaf: Gewerbetreibende, keine Sorten | §3.1 |
| 276 | tr.c1.e01 | Der Maṣdar-Stil als Brücke, die Reihenfolge umgekehrt | `tr.g.nominalstil` |
| 277 | tr.c1.e01 | Genitiv vorn: projenin tamamlanması | `tr.g.nominalstil` |
| 278 | tr.c1.e02 | -mektedir wie yatimmu | `tr.g.amtsstil` |
| 279 | tr.c1.e02 | tebligat und talimat: Plurale als Einzahl | §3.2 |
| 280 | tr.c1.e03 | Attribute stehen links vom Nomen | `tr.g.partizip_komplex` |
| 281 | tr.c1.e03 | Vom Nomen aus rückwärts lesen | `tr.g.partizip_komplex` |
| 282 | tr.c1.e04 | Wie fuṣḥā und Dialekt: geliyom – geliyorum | `tr.g.umgangssprache` |
| 283 | tr.c1.e04 | Anrede zwischen den Generationen | `tr.g.anrede` |
| 284 | tr.c1.e04 | Türkische Wörter in arabischen Dialekten | §3.5 |
| 285 | tr.c1.e05 | Başım üstüne wie ʿalā raʾsī | `tr.g.redewendungen` |
| 286 | tr.c1.e05 | Körperwendungen nicht wörtlich übertragen | `tr.g.redewendungen` |
| 287 | tr.c1.e06 | min nāḥiya uḫrā = öte yandan | `tr.g.textkonnektoren` |
| 288 | tr.c1.e06 | Weniger ve: Sätze anders verbinden | `tr.g.textkonnektoren` |
| 289 | tr.c1.e07 | fī raʾyī = kanımca | `tr.g.argumentation` |
| 290 | tr.c1.e07 | min ḥayṯu = bakımından | `tr.g.argumentation` |
| 291 | tr.c1.e08 | Eine Endung für die ganze Reihe | `tr.g.suspendierte_endung` |
| 292 | tr.c1.e08 | tazminat heißt Entschädigung | §3.1 |
| 293 | tr.c1.e09 | acaba ist kein Staunen | `tr.g.hoeflichkeit_strategien` |
| 294 | tr.c1.e09 | Rica ederim: gern geschehen | §4.3 |
| 295 | tr.c1.e09 | İyi çalışmalar: Gruß in beruflichen E-Mails | §4.5 |
| 296 | tr.c1.e10 | masal ist ein Märchen, kein maṯal | §3.1 |
| 297 | tr.c1.e10 | Ein Sprichwort heißt atasözü | `tr.g.sprichwoerter` |
| 298 | tr.c1.e10 | -cesine wie ka-anna | `tr.g.zarf_cesine` |
| 299 | tr.c1.e10 | Bir varmış, bir yokmuş: Märchenanfang mit -miş | `tr.g.evidential` |
| 300 | tr.c1.e11 | tamamen und nispeten: Adverbien auf -en | `tr.g.lehnmuster` |
| 301 | tr.c1.e11 | hukuk und hukuki: türkische Grammatik gilt | `tr.g.lehnmuster` |
| 302 | tr.c1.e11 | hâkim heißt Richterin oder Richter | §3.1 |
| 303 | tr.c1.e12 | Betonung direkt vor dem Verb | `tr.g.fokus_devrik` |
| 304 | tr.c1.e12 | Das Verb vorn nur im Gespräch | `tr.g.fokus_devrik` |
| 305 | tr.c1.e13 | ben bile: bile steht hinten | `tr.g.partikel_nuancen` |
| 306 | tr.c1.e13 | yani wie yaʿnī | `tr.g.partikel_nuancen` |
| 307 | tr.c1.e14 | Lehnwörter prüfen: gleiche Form, andere Bedeutung | §3.1 |
| 308 | tr.c1.e14 | Arabisch, Türkisch, Deutsch: Mehrsprachigkeit als Stärke | §5 |

## 7 Messwerte und Methode

| Messung | Wert | Quelle und Methode |
|---|---|---|
| Türkische Nomen, deren arabische Übersetzung ähnlich klingt | Top-1.000: 90 von 305 (29,5 %) · Top-2.000: 144 von 471 (30,6 %) · Top-5.000: 254 von 777 (32,7 %) | Übersetzungen tr→ar aus tr.wiktionary (kaikki), Umschrift aus der en-Ausgabe; gleiches Konsonantengerüst nach den Entsprechungen in §1.4; untere Schätzung |
| Wörter mit arabischem Verwandten (Gerüst und Glosse) | Top-1.000: 142 von 851 (16,7 %) · Top-2.000: 252 von 1.687 (14,9 %) · Top-5.000: 563 von 4.123 (13,7 %) | Nomen, Adjektive, Adverbien der Lemma-Liste; gleiches Konsonantengerüst und überlappende englische Glosse im kaikki-Kern ar. Probe: 58 von 78 bekannten Lehnwörtern erkannt, 4 von 16 bekannten falschen Freunden fälschlich als gleich (Schätzung) |
| Wortformen mit Vokalen, die das Hocharabische nicht als eigene Laute hat | e, o, ö, ü oder ı – Top-1.000: 725 von 1.000 (72,5 %); Top-5.000: 3.748 von 5.000 (75,0 %) · nur ö, ü, ı – Top-1.000: 284 von 1.000 (28,4 %) | wordfreq 3.1.1 `small_tr` |
| Wortformen mit p, v, ç oder g | Top-1.000: 201 von 1.000 (20,1 %) · Top-5.000: 1.221 von 5.000 (24,4 %) | dto. |
| Lemmata gegen die Vokalharmonie (helle und dunkle Vokale gemischt) | Top-1.000: 150 von 999 (15,0 %) · Top-2.000: 372 von 1.999 (18,6 %) · Top-5.000: 1.077 von 4.997 (21,6 %) | Lemma-Liste des Rahmenplans (wordfreq 3.1.1 `small_tr`, lemmatisiert über kaikki; ohne Tabu-, Religions- und Registertreffer); Verben ohne -mek/-mak |
| Wortformen mit Sonderbuchstaben (ç, ğ, ı, ö, ş, ü) | Top-1.000: 404 von 1.000 (40,4 %), davon mit ı 177 · Top-5.000: 2.263 von 5.000 (45,3 %) | wordfreq 3.1.1 `small_tr`, nur Wortformen aus Buchstaben |
| Wortformen, die ohne Sonderbuchstaben zusammenfallen (wie kır – kir) | Top-5.000: 67 Gruppen mit 134 Formen · Top-20.000: 330 Gruppen mit 672 Formen | dto.; Grund für den Lexikonschutz im Abgleich (PLAN §4.1) |
| Glossen in der Ausgangssprache Arabisch (Top-1.000 / Top-5.000) | 50 % / 37 % | Beleg S7 §3.6 (tr-aus-ar); Glossen und Tipps tragen hier mehr KI-Entwurf mit Gegenprüfung |
| Direkte Satzpaare tr↔ar | 2.408, nach Standardfilter 2.210 | Beleg S7 §3.2 |

**Methode.**
- Gelesen wurden nur die S7-Auszüge im Scratchpad (`l0/S7/auszug/`: Häufigkeit, kaikki-Kern und kaikki-Auszüge, Tatoeba) und die Lemma-Liste des Rahmen-Generators (`l3-rahmen-tr/lem.json`), mit `python3 -I`.
- Skripte: `l3-kontrast-tr-b/messen.py` und `l3-kontrast-tr-b/messen_ar.py`; Generator und Prüfungen: `l3-kontrast-tr-b/bauen.py` (alle im Scratchpad der Sitzung, Übernahme nach `_lernapp/werkzeuge/` in L3).
- In dieses Dokument gelangen nur Zahlen und Beispiele in Lateinschrift bzw. Umschrift; kein Tatoeba-Satz und kein Wiktionary-Text.
- Ähnlichkeits- und Mustermessungen sind Schätzungen; sie zeigen die Größenordnung, nicht die genaue Zahl.

## 8 Zu prüfen und offene Fragen

Alle laufen mit ihrem Standard weiter (L3-E12, kein Warten).

| ID | Frage | Standard | Wer |
|---|---|---|---|
| KT-ar-01 | Wie viele Lernende der Gemeinde haben vorher in der Türkei gelebt oder sprechen Türkmenisch? | Tipps passen für alle Gruppen; Einstufung je Fertigkeit | Bildung, Gemeinde |
| KT-ar-02 | Türkmenische Varietäten aus dem Irak und aus Syrien: Welche Unterschiede zum Türkeitürkischen sind für Tipps wichtig? | keine Einzelregeln und keine Beispiele; nur der Hinweis auf eine eigene Varietät | LM-01, Sprecherinnen und Sprecher aus der Gemeinde |
| KT-ar-03 | Dialektale Brücken (ṣaḥtēn, tislam īdak, salāmtak, ḫālto, ʿammū): in Tipps nennen? | Hocharabisch zuerst; Dialekt nur mit Region und als „dialektal“ | LM-01 |
| KT-ar-04 | Türkische Wörter in arabischen Dialekten (§3.5) und Anrede ʾabla in Ägypten | in Tipps nur Einträge ohne „zu prüfen“ | LM-01 |
| KT-ar-05 | Geste „Kopf nach hinten mit cık“ = nein: auch in arabischsprachigen Ländern üblich? | Tipp beschreibt nur die türkische Geste, ohne Bild; Bildkarten zeigen keine Menschen (KERN §5) | LM-01 |
| KT-ar-06 | Regionale Bedeutungen: maḫzan als Laden, ḫityār als „alter Mann“, qaḍāʾ als Verwaltungsbezirk | Tipps nennen nur die hochsprachliche Bedeutung | LM-01 |
| KT-ar-07 | Apostroph für ʿAyn und Hamza in älteren türkischen Schreibungen: Hinweis aufnehmen? | nein; nur der heutige Apostroph vor Endungen an Namen | Redaktion |
| KT-ar-08 | Hinweise zu Wochenbeginn und Wochenende ohne Wertung formuliert? | Tipp nennt nur die Tage | Redaktion, LM-09 |
| KT-ar-09 | Für tr↔ar gibt es nur 2.408 direkte Tatoeba-Paare (Beleg S7 §3.2); indirekte Paare über Englisch erst nach Stichprobe (ADR 0045, Fortschreibung Nr. 3). | Übersetzungen `tr-aus-ar` überwiegend als KI-Entwurf mit Gegenprüfung und Rückübersetzung | L3 |
| KT-ar-10 | Typische Fehler sind Erfahrungswerte, nicht gemessen. | Die Muttersprachler-Stichprobe und Meldungen aus der App (ADR 0041 Nr. 9) schärfen sie nach. | L3, LM-01 |
| KT-ar-11 | „Sevgili …“ als Briefanrede: Das Tabu-Lexikon führt sevgili als Wort für eine Liebesbeziehung (Leitfaden §2.3); siehe KT-de-11 in `kontrast-tr-aus-de.md`. | Briefanrede in Übungen mit Merhaba oder Canım | LM-09, L3-Werkzeug |
| KT-ar-12 | Arabische Grammatikbegriffe in den Tipps (§5.3): Passen die ungefähren Gleichsetzungen (Partizip, Konverb, Besitzendung)? | mit „ungefähr“ gekennzeichnet; nur als Brücke | LM-01, LM-02 |
| KT-ar-13 | tazminat und taḍmīnāt: Bedeutung im heutigen Arabisch | kein Tipp bis zur Prüfung | LM-01 |
| KT-ar-14 | mānšīt für die Schlagzeile (ägyptische Presse) | nur nach Bestätigung im Tipp | LM-01 |

## 9 Herkunft und Prüfungen

- **Entwurf:** KI-Lauf `ki:l3-kontrast` am 20.10.2026 (L3-01, vorgezogen), auf Grundlage des Rahmenplans Türkisch, des Inhaltsleitfadens und der Lemma-Liste des Rahmen-Generators.
- **Eigene Darstellung:** Keine fremden Lehrwerke oder Kontrastgrammatiken übernommen; GER nur als Stufen (ADR 0045 Nr. 8, LM-36).
- **Automatische Prüfungen des Generators:**
  - alle 109 Grammatik-IDs des Rahmenplans genau einmal in §2
  - 308 Tipps auf 74 gültigen Einheiten-Schlüsseln; jede Einheit mit mindestens zwei Tipps; Grammatik-Bezug nie vor seiner Einführung; jeder Abschnitts-Bezug vorhanden; keine doppelten Titel
  - Einheiten der falschen Freunde gültig
  - Tabu-Lexikon des Leitfadens (de, tr, ar-Umschrift): 0 ungeklärte Treffer; Fehlalarme und bewusste Nennungen: „parti“ (tr, Politik) in Partizip und Partikel (21); „sevgili“ (tr, Beziehungen) als Briefanrede, bewusst genannt als offene Frage KT-de-11 bzw. KT-ar-11 (3)
  - 0 arabische Zeichen (U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF)
- **Menschliche Prüfung:** Stichprobe der Muttersprachler (LM-01) mit den Punkten aus §8; Abnahme zusammen mit dem Rahmenplan (LM-02).
