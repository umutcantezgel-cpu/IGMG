# Kontrastdokument Hocharabisch aus Türkisch (`ar-aus-tr`)

- **Stand:** 20.10.2026, Version 0.1.0-entwurf (L3-01, vorgezogen)
- **Status:** Entwurf. Er gilt als Standard für die kontrastiven Tipps, Ablenker und angenommenen Antworten der Richtung `ar-aus-tr`, bis die Muttersprachler-Stichprobe (LM-01) und die Abnahme des Rahmenplans (LM-02) andere Ergebnisse bringen.
- **Zweck:** Grundlage für die Phase Ü (Übersetzung je Richtung) der Inhalts-Pipeline (PLAN §6.3) und für die ≈ 300 kontrastiven Tipps je Richtung (PLAN §5.1). Ablage nach PLAN §6.1.
- **Bezug:**
  - Rahmenplan Hocharabisch: `web/inhalte/lernapp/rahmen/ar.rahmen.json`, `RAHMEN-ar.md` §2.1 (Türkischsprachige), §4 (Vorkurs), §5 (Grammatikfolge), §11 (OF-ar-09, OF-ar-16), §14 Nr. 4 (Schwerpunkte dieses Dokuments)
  - PLAN §4 (Übungstypen, `schrift_ar`, `minimalpaare`, `harakat`, Antwortabgleich §4.1), §4.4 (Elifbe-Bausteine), §5.1, §6.1–§6.4
  - KERN §2 (KI-Regel 2), §3 (arabische Schrift nur in freigegebenen Dateien), §5 (Kinderschutz), §7 (Oberfläche)
  - Inhaltsleitfaden `_lernapp/lehrplan/INHALTSLEITFADEN.md` (Tabu-Lexikon, Namen, Formel-Kandidaten §4.2, weltliche Alternativen §4.3)
  - Beleg S7 (`_lernapp/belege/S7-sprachdaten.md`), ADR 0041, ADR 0045 (Nr. 8: GER nur als Stufen)
- **Gegenstück:** `_lernapp/lehrplan/kontrast-ar-aus-de.md`; Gegenrichtung `kontrast-tr-aus-ar.md` (falls vorhanden)
- **Umfang:** 126 Grammatik-IDs mit Kontrast (§2), 66 falsche und halbe Freunde (§3.1), 307 Tipp-Themen auf 80 Einheiten-Schlüssel (§6).

> **KI-Regel 2 (ADR 0040, KERN §2):** Keine Koranverse, Hadithe, Bittgebete oder anderen religiösen Texte (weder arabisch
> noch übersetzt), keine Koran-Wortbedeutungen, keine Fiqh-Aussagen. Der Sprachkurs ist ohne Religionsbezug. Religiöse Formeln
> gibt es nur aus einer später von zwei Gelehrten freigegebenen Liste; hier stehen sie nur als Verweis auf die gesperrten
> Kandidaten des Leitfadens (§4.7), nie als Lernziel. Arabische Schrift ist in dieser Datei verboten: Arabisch steht nur in
> Umschrift (DIN 31635 vereinfacht).

**Lesart.**
- „Arabisch“ meint das moderne Hocharabisch (Fuṣḥā), wie der Kurs es lehrt: voll vokalisiert, am Satzende in Pausa. „Türkisch“ meint das Standardtürkische.
- Arabische Wörter stehen in Umschrift nach DIN 31635 (vereinfacht wie im Rahmenplan), türkische Wörter in türkischer Schreibung. Fallendungen stehen nur dort, wo sie Gegenstand sind.
- In der Spalte „typischer Fehler“ stehen fehlerhafte Formen in „…“. Sie sind Material für Ablenker und für den Abgleich (PLAN §4.1), nie Musterlösung.
- „Vertraut“ markiert eine Brücke: Das Türkische kennt die Sache schon, oft über ein Lehnwort aus dem Arabischen. Tipps nennen die Brücke zuerst.
- **Keine religiösen Brücken:** Viele türkische Wörter arabischer Herkunft gehören zur Religion. Tipps nutzen nur weltliche Lehnwörter als Brücke (Leitfaden §4, KD-art-10).
- Aufgenommen sind nur Kontraste, die sicher sind. Was die Stichprobe bestätigen soll, trägt „zu prüfen“ und steht zusätzlich in §8.

**Wer lernt.** Türkischsprachige jeden Alters in Wetzlar und Umgebung: Kinder ab etwa zehn, Jugendliche, Eltern und Ältere. Viele sind Herkunftssprachler der zweiten und dritten Generation: Sie verstehen Türkisch gut, lesen und schreiben es aber wenig, und ihr Deutsch ist oft stärker (§5). Manche kennen die arabische Schrift aus dem Elifbe-Unterricht. Wer religiöse Texte verstehen möchte, findet dafür den getrennten Pfad „Koran-Arabisch“; dieses Dokument und der Sprachkurs behandeln das nicht.

## 0 Kurzfassung

- **Schrift:** Wer die Elifbe kennt, kennt Buchstaben und Lesezeichen schon – unter türkischen Namen (üstün, esre, ötre, cezm, şedde). Neu sind die hocharabischen Namen, die Aussprache ohne türkische Lautgewohnheiten und das Lesen mit Bedeutung (§1, §5.2).
- **Laute:** Im Türkischen fallen viele arabische Laute zusammen: ḥ, ḫ und h zu h; s, ṣ und ṯ zu s; z, ḏ, ḍ und ẓ zu z; ʿ und Hamza fallen weg. Neu sind außerdem lange Vokale, das hintere q und stimmhafte Konsonanten am Wortende (kitāb, nicht kitap). Vertraut sind ǧ (c), š (ş) und die Šadda (wie in anne, dikkat).
- **Größte Hürden:** Genus (das Türkische hat keins), Verb am Satzanfang statt am Ende, Präpositionen vor dem Nomen statt Endungen danach, Iḍāfa in umgekehrter Reihenfolge (evin kapısı → bāb al-bayt), Relativsatz nach dem Nomen, gebrochene Plurale.
- **Starke Brücken:** etwa ein Fünftel der häufigsten arabischen Wörter hat ein türkisches Gegenstück (kitap, saat, hesap, merkez; Messung §7); Sätze ohne Verb wie „Ev büyük“; „haben“ ohne Verb wie bei „var“; Ort vorn wie in „Odamda bir yatak var“; Besitzendungen wie evim; min wie -den beim Vergleich; Verbalnomen aus Lehnwörtern (tebrik, ilan, istirahat); bizzat und bittabi für die Sonnenbuchstaben.
- **Fallen:** 66 falsche und halbe Freunde (§3.1), etwa ḫayr (gut) – hayır (nein), faqaṭ (nur) – fakat (aber), luġa (Sprache) – lügat (Wörterbuch), ḫāla (Tante mütterlicherseits) – hala (Tante väterlicherseits), musāʿada (Hilfe) – müsaade (Erlaubnis). Dazu Plurale, die im Türkischen Einzahl sind (evlat ← awlād).
- **Pragmatik:** Kein „siz“ als Verbform; Respekt wie bei „Nadiye Hanım“ mit Titel und Vorname. Viele Alltagsformeln haben dieselbe Form (merhaba – marḥaban, maalesef – maʿa l-asaf) oder dieselbe Aufgabe (buyurun – tafaḍḍal). Religiöse Formeln, die vielen vertraut sind, bleiben gesperrt (§4.7).
- **Tipps:** 307 Tipp-Themen, verteilt auf den Vorkurs und alle 72 Einheiten (§6).

## 1 Laut und Schrift

### 1.1 Schrift und Rechtschreibung

Die Lateinschrift des Türkischen hilft beim Arabischen kaum; wer aber die Elifbe gelernt hat, bringt viel mit (§5.2). Der Vorkurs (`ar.v.l01`–`ar.v.l08`) ist für beide Gruppen gedacht; Lernende mit Elifbe-Vorwissen können ihn nach der Einstufung überspringen, `ar.v.l02` und `ar.v.l07` bleiben empfohlen (OF-ar-16).

| Bereich | Türkisch | Arabisch | typische Verwechslung | Vorkurs |
|---|---|---|---|---|
| Richtung | von links nach rechts | von rechts nach links; Zahlen von links nach rechts | Ziffernfolge umgedreht | l01, l07 |
| Buchstabenformen | Druckbuchstaben stehen einzeln | bis zu vier Formen; sechs Buchstaben verbinden nicht nach links | Anfangsform nicht erkannt | l03 |
| Punkte | ç, ğ, ı, i, ö, ş, ü | unterscheiden Buchstaben gleicher Grundform | Punkte vertauscht | l01, l02 |
| Groß und klein | zwei Formen | eine Form | – | l01 |
| Kurze Vokale | werden geschrieben (acht Vokale) | als Zeichen (Fatḥa, Kasra, Ḍamma); im Alltag meist weggelassen | Vokale nach türkischer Gewohnheit ergänzt (e, ı, ö, ü) | l04 |
| Lange Vokale | nur in Lehnwörtern (â, î, û) | alif, wāw, yāʾ | lang und kurz nicht unterschieden | l05 |
| Šadda | Doppelkonsonant wird gesprochen (anne, dikkat) | gleich | Vertraut | l06 |
| Tāʾ marbūṭa | im Lehnwort -e/-a oder -et/-at (kelime, şirket) | -a in Pausa, -at in Verbindung | -et in Pausa gesprochen | l07 |
| Tanwīn | – | -un, -an, -in (Elifbe: tenvin) | in Pausa gesprochen | l07 |
| Artikel | kein bestimmter Artikel | al- angehängt; vor Sonnenbuchstaben angeglichen | l vor Sonnenbuchstaben gesprochen | l08 |
| Kleine Wörter | ve, ile, için sind eigene Wörter | wa-, bi-, li-, fa-, ka- hängen am nächsten Wort | Wort mit Vorsilbe nicht gefunden | l08 |
| Hamza | fehlt (mesele, memur, sual) | eigenes Zeichen auf alif, wāw, yāʾ oder auf der Zeile | Hamza übersehen | l08 |
| Wortende | Auslautverhärtung (kitap, cevap) | b, d, ǧ bleiben stimmhaft (kitāb, ǧawāb) | kitāp gesprochen | l08 |
| Ziffern | europäische Ziffern | östlich-arabisch (Maschrek) oder europäisch (Maghreb) | Fünf als Null gelesen; die Null ist ein Punkt | l07 |
| Tastatur | Türkisch Q oder F | arabische Belegung | Vokalzeichen vergessen | A2 (Schreiben) |

**Buchstabennamen.** Die Elifbe nennt die Buchstaben elif, be, te, se, cim, ha, hı, dal, zel, re, ze, sin, şın, sad, dad, tı, zı, ayın, gayın, fe, kaf, kef, lam, mim, nun, vav, he, ye; der Kurs nutzt die hocharabischen Namen (alif, bāʾ, tāʾ, ṯāʾ, ǧīm, ḥāʾ, ḫāʾ, dāl, ḏāl, rāʾ, zāy, sīn, šīn, ṣād, ḍād, ṭāʾ, ẓāʾ, ʿayn, ġayn, fāʾ, qāf, kāf, lām, mīm, nūn, hāʾ, wāw, yāʾ). Für Türkischsprachige stehen die Elifbe-Namen daneben (Rahmenplan §4). In der Elifbe steht vav vor he, im arabischen Wörterbuch hāʾ vor wāw (zu prüfen, KD-art-03).

### 1.2 Laute

| Laut | Arabisch | im Türkischen | Folge beim Hören und Sprechen | Übung |
|---|---|---|---|---|
| ḥ, ḫ, h | drei Laute: gehaucht aus dem Rachen, wie ch in „Bach“, normales h | alle drei als h (hal, haber, hediye) | Wörter fallen zusammen | ḥāl – ḫāl |
| ʿ (ʿayn) | gepresster Kehllaut | weggefallen, manchmal als Dehnung oder Apostroph (san'at) | weggelassen | ʿamal – amal |
| ʾ (Hamza) | Knacklaut | weggefallen (mesele ← masʾala) | weggelassen | saʾala – sāla |
| q | k ganz hinten | k (kalem ← qalam) | wie k | qāla – kāla |
| ġ | stimmhafter Reibelaut hinten | ğ oder g (garip ← ġarīb) | als stummes ğ oder als g | ġarīb – qarīb |
| ṯ | th wie englisch „think“ | s (saniye ← ṯāniya); in der Elifbe „se“ | wie s | ṯamar – samar |
| ḏ, ḍ, ẓ, z | vier Laute | alle als z (zevk ← ḏawq, zarar ← ḍarar, zarf ← ẓarf) | wie z | ḍayf – zayf, zahr – ẓahr |
| ṣ, ṭ | dunkle s, t | s, t (sabah ← ṣabāḥ, tabiat ← ṭabīʿa) | wie s, t | sāra – ṣāra |
| ǧ | dsch | c | Vertraut | ǧamal |
| š | sch | ş | Vertraut | šams |
| w | Halbvokal wie englisch w | v (vakit ← waqt) | wie v | wa- (nicht „ve“) |
| Vokale | drei (a, i, u), lang und kurz | acht Vokale; Lehnwörter haben türkische Vokale (kalem, mektep, kelime), folgen der Vokalharmonie aber oft nicht (kitap, kalem, insan) | „kelime“ statt kalima | kalima, maktab |
| Vokallänge | unterscheidet Wörter | nur in Lehnwörtern hörbar (kâtip, hâl) | lang und kurz verwechselt | ǧamal – ǧamāl |
| Hilfsvokal | Konsonantengruppe am Ende bleibt (fikr, ʿaql, ism) | Hilfsvokal (fikir, akıl, isim) | Vokal eingeschoben | fikr, waqt |
| Wortende | b, d, ǧ bleiben stimmhaft | p, t, ç (kitap, cevap, sebep) | stimmlos gesprochen | kitāb, ǧawāb |
| Šadda | langer Konsonant | Vertraut: anne, elli, dikkat | – | darasa – darrasa |
| Bindung im Satz | Hamzat al-waṣl fällt weg (fī l-bayt) | – | Knacklaut vor al- im Satz | fī l-bayt |

**Lehnwörter als Ausspracheprobe.** Türkische Lehnwörter verführen zur türkischen Aussprache. Tipps stellen Paare nebeneinander: kalem – qalam, kelime – kalima, mektup – maktūb, hesap – ḥisāb, sebep – sabab, fikir – fikr, vakit – waqt, saat – sāʿa, sabah – ṣabāḥ, haber – ḫabar.

### 1.3 Hörtraining-Paare

Paare nur aus dem Alltagswortschatz und ohne Wörter des Tabu-Lexikons (Leitfaden §2). Übungstyp `minimalpaare` (PLAN §4). Seltene Wörter in den Paaren dienen nur dem Hören und zählen nicht zum Lemma-Budget (KD-art-12).

| Kontrast | Paare (Bedeutung) | Einheit |
|---|---|---|
| ḥ und ḫ | ḥāl – ḫāl (Zustand – Onkel), ḥall – ḫall (Lösung – Essig) | ar.v.l02, A2-e08 |
| ḥ und h | ḥabba – habba (Korn – wehte), ḥāla – Hāla (Zustand – Name) | ar.v.l02 |
| ʿ und Hamza | ʿamal – amal (Arbeit – Hoffnung), saʿala – saʾala (husten – fragen), qaraʿa – qaraʾa (klopfen – lesen) | ar.v.l02, A2-e08 |
| Hamza und langer Vokal | saʾala – sāla (fragte – floss) | ar.v.l08 |
| q und k | qāla – kāla (sagte – maß ab), rāqid – rākid (liegend – stehend) | ar.v.l02 |
| q und ġ | qarīb – ġarīb (nah – fremd) | ar.v.l02 |
| ġ und ḫ | ġālī – ḫālī (teuer – leer) | ar.v.l02, A2-e06 |
| s, ṣ und ṯ | sāra – ṣāra (ging – wurde), ʿasīr – ʿaṣīr (schwierig – Saft), ṯamar – samar (Früchte – Abendgespräch) | ar.v.l02 |
| z, ḍ und ẓ | ḍayf – zayf (Gast – Fälschung), zahr – ẓahr (Blüten – Rücken), ʿazm – ʿaẓm (Entschlossenheit – Knochen) | ar.v.l02, B1-e16 |
| d und ḏ | durra – ḏurra (Perle – Mais) | ar.v.l01 |
| t und ṭ | tall – ṭall (Hügel – Tau) | ar.v.l02 |
| kurz und lang | ǧamal – ǧamāl (Kamel – Schönheit, vgl. den Namen Cemal), maṭar – maṭār (Regen – Flughafen), saʿida – sāʿada (war froh – half) | ar.v.l05, B1-e08 |
| Šadda | darasa – darrasa (lernte – unterrichtete), ḥamām – ḥammām (Tauben – Bad) | ar.v.l06, B1-e02 |
| stimmhaft am Ende | kitāb – kitāp (richtig – türkische Aussprache), ǧawāb – cevap | ar.v.l08 |

### 1.4 Pausa, Bindung und Betonung

- **Pausa:** Am Satzende fällt die kurze Endung weg (kitābun → kitāb), Tāʾ marbūṭa wird zu -a, -an wird zu -ā. Die Elifbe übt oft jede Endung einzeln; im Satz gilt Pausa nur am Ende.
- **Bindung:** Das a von al- fällt nach einem Vokal weg (fī l-bayt). Vertraut aus festen Wendungen: bizzat, bilhassa, maalesef.
- **Betonung:** Türkisch betont meist die letzte Silbe (kitáp, medresé), das Hocharabische meist die letzte schwere Silbe innerhalb der letzten drei (ki-TĀB, MAD-ra-sa). Die Regeln unterscheiden sich regional; die Hörbeispiele tragen die Betonung (zu prüfen, KD-art-13).
- **Zahlen von 21 bis 99:** Umgekehrt als im Türkischen: Einer zuerst (ḫamsa wa-ʿišrūn, „beş ve yirmi“).

### 1.5 Umschrift lesen

Tipps zeigen Arabisch in arabischer Schrift, voll vokalisiert. Wo Umschrift erscheint, hilft diese Tabelle; ob Tipps der türkischen Oberfläche eine türkisch angelehnte Umschrift (c, ş) nutzen, ist offen (KD-art-04).

| Zeichen | Aussprache | türkische Hilfe |
|---|---|---|
| ā, ī, ū | lange Vokale | wie â, î, û in kâtip, millî, üslûp |
| ǧ | dsch | c (cevap) |
| š | sch | ş (şekil) |
| ḥ | gehauchtes h aus dem Rachen | – |
| ḫ | ch wie in „Bach“ | Elifbe: hı |
| ṯ, ḏ | th wie englisch „think“, „this“ | Elifbe: se, zel |
| ṣ, ḍ, ṭ, ẓ | dunkle s, d, t, z | Elifbe: sad, dad, tı, zı |
| ʿ | gepresster Kehllaut | Elifbe: ayın |
| ʾ | Knacklaut | – |
| ġ | Reibelaut hinten | Elifbe: gayın |
| q | k ganz hinten | Elifbe: kaf |
| w | wie englisch w | nicht v |

## 2 Grammatik-Kontraste je Grammatik-ID

Die Tabellen folgen der Grammatikfolge des Rahmenplans (`ar.rahmen.json`, 126 IDs). In Klammern steht die Einheit, die die ID einführt. „Vertraut“ markiert eine Brücke aus dem Türkischen, die der Tipp zuerst nennt. Die typischen Fehler sind Erfahrungswerte und noch nicht gemessen (KD-art-01).

### 2.1 Überblick

| Kontrast | Türkisch | Hocharabisch | Folge für die Tipps |
|---|---|---|---|
| Satz ohne Verb | „Ev büyük“; 1. und 2. Person mit Endung (öğrenciyim) | kein „sein“ im Präsens, auch ohne Endung | Vertraut für die 3. Person (A1-e01) |
| Wortstellung | Subjekt – Objekt – Verb; Verb am Ende | Verb oft am Satzanfang; Subjekt vorn möglich | Verb nach vorn; Einzahl bei Verb vorn (A2-e07) |
| Genus | keins; „o“ für er, sie, es | zwei Genera mit Folgen für Verb, Adjektiv, Pronomen und „du“ | Hauptquelle von Fehlern; -a-Regel und Lehnwörter auf -et |
| Artikel | kein bestimmter Artikel; bir als unbestimmter | al- und Tanwīn | bestimmtes Objekt (-i) als Brücke |
| Ort und Richtung | Endungen und Postpositionen hinter dem Nomen | Präpositionen vor dem Nomen | Grundmuster: „Endung → Wort davor“ |
| Genitivverbindung | Besitzer zuerst (evin kapısı) | Besessenes zuerst (bāb al-bayt) | umgekehrt lesen (A1-e07) |
| Attribut | Adjektiv und Partizipsatz vor dem Nomen | Adjektiv und Relativsatz nach dem Nomen | umgekehrt; Rückverweis-Pronomen (B1-e03) |
| Wortbildung | Suffixe mit Vokalharmonie | Wurzel und Muster | Vertraut über Lehnwörter (kitap, kâtip, mektup) |
| Person am Verb | Endungen (yazarım) | Vorsilben und Endungen (aktubu, taktubīna) | Vertraut: Das Pronomen kann fehlen |

### 2.2 A1 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `ar.g.personalpron` (A1-e01) | Türkisch „o“ gilt für er, sie und es; „sen“ hat kein Genus. Arabisch unterscheidet huwa/hiya und anta/anti. | „huwa“ für eine Frau · „anta“ zu einem Mädchen | „o“ hat im Arabischen zwei Formen: huwa (er), hiya (sie). „sen“ ebenso: anta zu einem Jungen, anti zu einem Mädchen. |
| `ar.g.nominalsatz` (A1-e01) | Vertraut: Wie „Ev büyük.“ braucht der Satz in der 3. Person kein Verb. Neu: Auch „öğrenciyim“ hat im Arabischen keine Personalendung (anā ṭālib). | „anā ṭālibī“ (-im als -ī übertragen; heißt „mein Student“) | Wie „Ev büyük“: al-bayt kabīr. „Öğrenciyim“ heißt einfach anā ṭālib – ohne Endung. |
| `ar.g.nisba` (A1-e01) | Vertraut: Das -î in millî, resmî, askerî ist die arabische Nisba. Neu: Frauen sagen -iyya (turkiyya); Sprachen stehen mit Artikel (al-ʿarabiyya), anders als „Arapça“. | „anā turkī“ (von einem Mädchen gesagt) · „atakallamu ʿarabiyya“ | Das -î aus millî kennst du: turkī, ʿarabī. Mädchen hängen -iyya an: anā turkiyya. Sprachen mit Artikel: al-ʿarabiyya. |
| `ar.g.genus` (A1-e02) | Türkisch kennt kein grammatisches Genus. Im Arabischen hat jedes Nomen eins, und Adjektive, Pronomen und Verben richten sich danach. Brücke: Lehnwörter auf -et/-at oder -e sind im Arabischen meist feminin (devlet – dawla, şirket – šarika, kelime – kalima). | „al-madrasa kabīr“ · „hāḏā sayyāra“ | Faustregel: -a am Ende (Tāʾ marbūṭa) = feminin. devlet, şirket, kelime sind im Arabischen feminin: dawla, šarika, kalima. |
| `ar.g.hinweis` (A1-e02) | „Bu bir kalem“ hat ein „bir“, das im Arabischen fehlt. hāḏā/hāḏihi richten sich nach dem Genus. | „hāḏā wāḥid qalam“ (bir → wāḥid) · „hāḏā sayyāra“ | „Bu bir kalem“ = hāḏā qalam, ohne „bir“. Bei femininen Dingen hāḏihi: hāḏihi sayyāra. |
| `ar.g.fragepartikel` (A1-e02) | Vertraut: Eine Partikel macht die Frage, die Wortstellung bleibt. Neu: hal steht am Anfang, mi am Ende. | „hāḏā qalam hal?“ (Partikel am Ende wie mi) | hal ist das arabische „mi“ – aber vorn: Bu kalem mi? → hal hāḏā qalam? |
| `ar.g.artikel` (A1-e03) | Türkisch hat keinen bestimmten Artikel; „bir“ dient als unbestimmter Artikel. Arabisch hat al- für „bestimmt“ und Tanwīn für „ein“. Vertraut: Das bestimmte Objekt (-i: kitabı) entspricht oft al-. | al- weggelassen · „wāḥid kitāb“ für „bir kitap“ | „kitabı okudum“ (bestimmt) → qaraʾtu l-kitāba; „bir kitap okudum“ → qaraʾtu kitāban. „bir“ steckt im Tanwīn. |
| `ar.g.sonne_mond` (A1-e03) | Vertraut: In bizzat und bittabi ist das l des Artikels schon angeglichen (bi-ḏ-ḏāt, bi-ṭ-ṭabʿ), in bilhassa und bilakis nicht. Neu ist die Regel für alle Wörter. | „al-šams“ gesprochen · „fī ʾal-bayt“ mit Knacklaut | Wie in bizzat und bittabi wird das l vor Sonnenbuchstaben zum nächsten Laut: aš-šams. Wie in bilhassa bleibt es vor Mondbuchstaben: al-qamar. |
| `ar.g.adjektiv` (A1-e03) | Das Adjektiv steht nach dem Nomen (Türkisch davor) und passt sich in Genus und Bestimmtheit an. | „kabīr bayt“ (büyük ev) · „sayyāra kabīr“ | Umgekehrt als „büyük ev“: bayt kabīr. Es passt sich an: sayyāra kabīra, as-sayyāra al-kabīra. |
| `ar.g.suffix_nomen` (A1-e04) | Vertraut: Wie evim, evin hängt Besitz als Endung am Nomen. Neu: „-i“ hat zwei Formen (-hu sein, -hā ihr), das Nomen verliert den Artikel, -a wird zu -at-. | „baytuhu“ für Laylās Haus · „ġurfaī“ | evim → baytī, evin → baytuka. „onun evi“ hat zwei Formen: baytuhu (sein), baytuhā (ihr). |
| `ar.g.besitz_inda` (A1-e04) | Vertraut: Wie bei „var“ gibt es kein Verb „haben“. Neu: Der Besitzer hängt an ʿinda (ʿindī), das Besessene trägt keine Endung wie „kardeşim“. | „ʿindī aḫī“ (wie „kardeşim var“) | „Bir kardeşim var“ → ʿindī aḫ: Die Endung steht an ʿinda, nicht am Bruder. |
| `ar.g.zahlen_bis_10` (A1-e04) | Ziffern gibt es in zwei Formen; Zahlen liest man auch im arabischen Text von links nach rechts. Das Alter fragt man mit ʿumr (türkisch ömür). | östlich-arabische Ziffern verwechselt · „kam sana anta?“ (nach „kaç yaşındasın“) | „Kaç yaşındasın?“ heißt kam ʿumruka? – ʿumr ist das türkische ömür. |
| `ar.g.praep_ort` (A1-e05) | Türkisch zeigt den Ort mit Endung oder Postposition hinter dem Nomen, Arabisch mit Präposition davor. Vertraut: Wie in „masanın üstünde“ steht das Nomen im Genitiv. | „aṭ-ṭāwila ʿalā“ · „al-bayt“ ohne fī für „evde“ | Endungen und Postpositionen werden Wörter davor: evde → fī l-bayt; masanın üstünde → ʿalā ṭ-ṭāwila. |
| `ar.g.hunaka` (A1-e05) | Vertraut: Wie „Odamda bir yatak var“ steht der Ort vorn (fī ġurfatī sarīr). „var“ wird nicht übersetzt oder steht als hunāka am Anfang. | „fī ġurfatī sarīr hunāka“ (var am Ende) | „Odamda bir yatak var“ → fī ġurfatī sarīr. „Yakında bir eczane var mı?“ → hal hunāka ṣaydaliyya qarība? |
| `ar.g.fragewoerter` (A1-e05) | Fragewörter stehen im Arabischen immer am Satzanfang; im Türkischen stehen sie oft vor dem Verb (İstasyon nerede?). | „al-maḥaṭṭa ayna?“ · „hāḏā mā?“ | „İstasyon nerede?“ → ayna l-maḥaṭṭa? „Bu ne?“ → mā hāḏā? |
| `ar.g.mudari_sg` (A1-e06) | Vertraut: Die Person steckt im Verb, das Pronomen kann fehlen. Neu: Sie steht vorn (aktubu, taktubu, yaktubu) statt hinten (yazarım); „du (f.)“ und „sie“ haben eigene Formen. Ein Präsens deckt -iyor und -r ab. | „taktubu“ zu einem Mädchen statt taktubīna · „yaktubu“ für „sie schreibt“ | yazıyorum und yazarım sind beide aktubu. Zu einem Mädchen: taktubīna. |
| `ar.g.konjunktion` (A1-e06) | Vertraut: ve kommt von wa, lakin von lākin. Falle: faqaṭ heißt „nur“ – das türkische fakat (aber) ist lākin. wa und fa- werden angehängt. | „faqaṭ“ für „aber“ · „wa“ getrennt geschrieben | ve = wa, lakin = lākin. Falle: faqaṭ heißt „nur“. wa hängt am nächsten Wort: wa-l-walad. |
| `ar.g.zahlen_bis_100` (A1-e07) | Umgekehrt als im Türkischen: Der Einer steht vor dem Zehner (yirmi beş → ḫamsa wa-ʿišrūn). | „ʿišrūn wa-ḫamsa“ (türkische Reihenfolge) | Erst der Einer, dann der Zehner: yirmi beş → ḫamsa wa-ʿišrūn, „fünf und zwanzig“. |
| `ar.g.idafa` (A1-e07) | Die türkische Genitivverbindung läuft umgekehrt (evin kapısı); im Arabischen steht das Besessene vorn (bāb al-bayt) und trägt keinen Artikel. Vertraut: Auch im Türkischen trägt das Besessene die Markierung (kapı-sı). | „al-bayt bāb“ (ev kapısı) · „al-bāb al-bayt“ | Umgekehrt als „evin kapısı“: bāb al-bayt. Das erste Wort bleibt ohne Artikel – so wie „kapısı“ seine Endung trägt. |
| `ar.g.mudari_pl` (A1-e08) | „wir“ hat nur die Vorsilbe na-; „ihr“ und „sie“ bekommen zusätzlich -ūna. Im Türkischen stehen alle Personen am Ende (yazarız, yazarsınız, yazarlar). | „naktubūna“ · „hum yaktubu“ | yazarız → naktubu; yazarsınız → taktubūna; yazarlar → yaktubūna. |
| `ar.g.la_mudari` (A1-e08) | Die Verneinung steckt im Türkischen im Verb (-me-); im Arabischen steht lā als eigenes Wort davor. | „alʿabu lā“ · „laysa alʿabu“ | oynamıyorum → lā alʿabu: lā vor das Verb. |
| `ar.g.ordinal_uhrzeit` (A1-e09) | Vertraut: saat ist sāʿa, und „sekiz buçuk“ wird gebildet wie aṯ-ṯāmina wa-n-niṣf. Neu: Die Stunde ist eine Ordnungszahl mit Artikel (as-sāʿa aṯ-ṯāliṯa). | „as-sāʿa ṯalāṯa“ (wie „saat üç“) | „Saat üç“ → as-sāʿa aṯ-ṯāliṯa, „die dritte Stunde“. „Sekiz buçuk“ → aṯ-ṯāmina wa-n-niṣf. |
| `ar.g.laysa` (A1-e09) | Vertraut: laysa entspricht „değil“. Neu: Es steht vorn und hat Personenformen (lastu, laysat). | „anā ǧawʿān laysa“ · „anā laysa ǧawʿān“ | „Aç değilim“ → lastu ǧawʿān: laysa steht vorn und trägt die Person. |
| `ar.g.imperativ` (A1-e10) | Eine höfliche Form wie „yazın“ für eine Person gibt es nicht. Die Aufforderung unterscheidet Junge, Mädchen und mehrere. | „uktubū“ zu einer Lehrerin (wie „yazın“) · „uktub“ zu einem Mädchen | uktub (Junge), uktubī (Mädchen), uktubū (mehrere). Höflich wird es mit min faḍlik bzw. min faḍliki. |
| `ar.g.wunsch` (A1-e10) | „gitmek istiyorum“ hat einen Infinitiv; Arabisch braucht an + Verb mit Person. Allgemeine Vorlieben stehen mit Artikel (uḥibbu l-qahwa), anders als „kahve severim“. | „urīdu aḏhab“ ohne an · „uḥibbu qahwa“ | „gitmek istiyorum“ → urīdu an aḏhaba („ich will, dass ich gehe“). „Kahve severim“ → uḥibbu l-qahwa. |
| `ar.g.farben` (A1-e11) | Vertraut: beyaz kommt von bayāḍ (das Weiß). Neu: Grundfarben haben eine eigene weibliche Form (abyaḍ – bayḍāʾ, aḥmar – ḥamrāʾ). | „sayyāra aḥmara“ | Farben haben eine weibliche Form: sayyāra ḥamrāʾ, qamīṣ abyaḍ, sutra bayḍāʾ. |
| `ar.g.wurzel` (A1-e12) | Vertraut: kitap, kâtip, mektup zeigen schon die Wurzel k-t-b; hesap und muhasebe die Wurzel ḥ-s-b. Neu ist, dass das ganze Wörterbuch so geordnet ist. | Wurzel aus der türkischen Form gelesen (k-t-p) | kitap, kâtip, mektup → k-t-b. Im Arabischen bleibt das b am Ende: kitāb. |

### 2.3 A2 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `ar.g.madi_sg` (A2-e01) | Vertraut: Wie bei yazdım, yazdın steht die Person in der Vergangenheit hinten (katabtu, katabta). Neu: zu Mädchen katabti; „sie schrieb“ katabat. | „katabta“ zu einem Mädchen | yazdım → katabtu, yazdın → katabta oder katabti, yazdı → kataba oder katabat. |
| `ar.g.kana_war` (A2-e01) | „hastaydım“ hat eine Endung; Arabisch braucht ein eigenes Verb (kuntu). Die Aussage danach steht im Akkusativ. | „anā kāna marīḍ“ · „kuntu marīḍun“ | „hastaydım“ → kuntu marīḍan: kāna mit Person, danach -an. |
| `ar.g.madi_pl` (A2-e02) | katabnā, katabtum, katabū entsprechen yazdık, yazdınız, yazdılar. Verneint wird mit mā davor, nicht mit -me- im Verb. | „katabnā lā“ · Alif in katabū gesprochen | yazdık → katabnā. yazmadık → mā katabnā oder lam naktub. |
| `ar.g.lam_jussiv` (A2-e02) | Verneinte Vergangenheit mit lam + Präsensform ohne Endvokal; im Türkischen ist es eine Endung (yazmadım). | „lam katabtu“ · „lam aktubu“ | yazmadım → lam aktub: lam + Präsensform, aber Vergangenheit. |
| `ar.g.datum` (A2-e03) | Vertraut: Şubat, Nisan, Haziran, Temmuz und Eylül stehen in der zweiten arabischen Monatsreihe (šubāṭ, nīsān, ḥazīrān, tammūz, aylūl). Neu: Datum mit min; die Woche beginnt mit al-aḥad. | „ʿašara abrīl“ · al-iṯnayn für „Salı“ gehalten | „10 Nisan“ → al-ʿāšir min abrīl oder min nīsān. Montag heißt al-iṯnayn, „der zweite“. |
| `ar.g.anrede` (A2-e03) | Kein „siz“ für eine Person. Vertraut: Wie bei „Nadiye Hanım“ zeigt der Titel mit dem Vornamen Respekt (al-ustāḏa Nādiya). | „antum“ oder Pluralverb zu einer Person (wie „siz“) | Zu einer Person immer Einzahl. Respekt wie bei „… Hanım“: yā ustāḏa Nādiya, yā sayyid Ḫālid. |
| `ar.g.sa_sawfa` (A2-e04) | -ecek ist im Arabischen eine Vorsilbe (sa-) oder ein Wort davor (sawfa). Verneint wird mit lan + Konjunktiv. | „lā sa-aḏhabu“ · „aḏhabu sa“ | gideceğim → sa-aḏhabu. gitmeyeceğim → lan aḏhaba. |
| `ar.g.mansub` (A2-e04) | Wo das Türkische -mek oder -mek için sagt, steht ein Verb mit Person nach an oder li- mit der Endung -a. | „li-šarāʾ“ und Verb gemischt · „urīdu an azūru“ | „almak için“ → li-naštariya (damit wir kaufen). Nach an und li- endet das Verb auf -a. |
| `ar.g.plural_gesund` (A2-e05) | Vertraut: Das -at in hayvanat, malumat, edebiyat ist der arabische Plural -āt. Neu: -ūn/-īn für Männer. | „muhandisāt“ für Ingenieure · „sayyārūn“ | hayvanat → ḥayawānāt, malumat → maʿlūmāt. Für Männer -ūn: muhandisūn. |
| `ar.g.kongruenz_unbelebt` (A2-e05) | Vertraut: Wie in „Kitaplar masada duruyor“ steht bei Sachen in der Mehrzahl das Verb in der Einzahl. Neu: Im Arabischen ist es zusätzlich feminin. | „as-sayyārāt ǧadīdūn“ · „al-ġuraf wāsiʿāt“ | Wie im Türkischen Einzahl, dazu feminin: as-sayyārāt ǧadīda, al-mafātīḥ – hiya fī l-ḥaqība. |
| `ar.g.komparativ` (A2-e06) | Vertraut: min entspricht -den (Yazan'dan büyük → akbar min Yazan). „daha“ steckt schon in der Form afʿal. | „akṯar kabīr min“ (daha büyük) | „Yazan'dan büyük“ → akbar min Yazan. Kein Wort für „daha“: afʿal reicht. |
| `ar.g.akkusativ` (A2-e06) | Vertraut: Das Objekt hat wie bei -i eine Endung (-a). Neu: Auch das unbestimmte Objekt bekommt sie (-an). Vertraut sind auch Adverbien auf -en: tamamen, mesela, takriben. | „aštaraytu sutratun“ (wie „bir ceket aldım“ ohne Endung) | Auch „bir ceket aldım“ hat im Arabischen eine Endung: aštaraytu sutratan. Das -en in tamamen ist das arabische -an. |
| `ar.g.plural_gebrochen` (A2-e07) | evlat, eşya, evrak, akraba sind im Arabischen Pluralformen (awlād, ašyāʾ, awrāq, aqribāʾ); im Türkischen werden sie wie Einzahl gebraucht. | „ʿindī awlād wāḥid“ (wie „bir evladım var“) | Ein Kind heißt walad, viele awlād. Wie bei evlat steckt der Plural im Wortinneren. |
| `ar.g.verbalsatz_kongruenz` (A2-e07) | Das Verb steht im Arabischen meist am Anfang, im Türkischen am Ende. Steht es vorn, bleibt es in der Einzahl. | „al-awlād fī l-malʿab laʿibū“ (Verb am Ende) · „laʿibū l-awlād“ | Verb an den Anfang: laʿiba l-awlād fī l-malʿab. Steht das Verb vorn, Einzahl. |
| `ar.g.objektsuffix` (A2-e08) | Türkisch nennt das Objektpronomen als eigenes Wort (beni, onu); Arabisch hängt es ans Verb (-nī, -hu). | „faḥaṣa anā“ (wie „beni“ als eigenes Wort) | „beni muayene etti“ → faḥaṣanī. -nī = mich, -ī = mein. |
| `ar.g.praep_suffix` (A2-e08) | Vertraut: Wie bana, ona, benden ist „Präposition + Pronomen“ ein Wort (lī, lahu, minnī). Neu: Lautänderungen wie ʿalayhi, fīhi. | „li anā“ · „fīhu“ | bana → lī, ona → lahu, benden → minnī. Nach -i, -ī und -ay wird -hu zu -hi: fīhi, ʿalayhi. |
| `ar.g.verbot_jussiv` (A2-e09) | „yazma!“ ist eine Endung; Arabisch braucht lā + Präsensform der 2. Person ohne Endvokal. | „lā uktub!“ | „Yazma!“ → lā taktub! |
| `ar.g.notwendigkeit` (A2-e09) | Vertraut: lazım kommt von lāzim. Neu: „-meli“ wird unpersönlich ausgedrückt (yaǧibu an, ʿalayya an); die Person steckt im zweiten Verb. | „aǧibu an adrusa“ · „lāzim adrusu“ (umgangssprachlich, wie „lazım“) im Fuṣḥā-Text | „Ders çalışmam lazım“ → yaǧibu an adrusa oder ʿalayya an adrusa. |
| `ar.g.praep_zeit` (A2-e10) | Vertraut: Wie bei „on yıldır oturuyorum“ steht bei munḏu das Präsens. Neu: munḏu steht vor der Zeitangabe; qabla an und baʿda an vor Verben. | „ʿašr sanawāt munḏu“ (Postposition wie -dir) | „On yıldır“ → munḏu ʿašr sanawāt. „yatmadan önce“ → qabla an anāma. |
| `ar.g.li_anna` (A2-e10) | li-anna steht wie „çünkü“ am Anfang; Pronomen hängen an (li-annahu). „-dığı için“ steht dagegen am Ende. | „li-anna huwa marīḍ“ | „çünkü o hasta“ → li-annahu marīḍ. Das Pronomen hängt an li-anna. |
| `ar.g.partizip1` (A2-e11) | Vertraut: mektup, meşgul, memnun folgen dem Muster mafʿūl; kâtip, hazır dem Muster fāʿil. Falle: sākin heißt im Kurs meist „wohnend“, das türkische sakin „ruhig“. | „anā sākin“ als „ich bin ruhig“ verstanden | maktūb = geschrieben (mektup), mašġūl = beschäftigt (meşgul). anā sākin fī Wetzlar = Ich wohne in Wetzlar. |
| `ar.g.kollektiv` (A2-e11) | Türkisch hat keine Einzelstück-Form (elma, bir elma). Arabisch: tuffāḥ (Äpfel als Sorte) und tuffāḥa (ein Apfel). | „tuffāḥ wāḥid“ | „bir elma“ → tuffāḥa, „elma“ als Sorte → tuffāḥ. |
| `ar.g.verbalnomen` (A2-e12) | Wie „okuma“ macht das Verbalnomen aus einem Verb ein Nomen. Vertraut: Viele kennst du als Lehnwort (ziyaret ← ziyāra, hareket ← ḥaraka). | „uḥibbu aqraʾu“ für „okumayı severim“ | „Okumayı severim“ → uḥibbu l-qirāʾa. ziyaret kommt von ziyāra (Besuch). |
| `ar.g.koennen` (A2-e12) | Vertraut: mümkün kommt von mumkin. Neu: „-ebil“ wird zu istaṭāʿa an + Verb mit Person. | „astaṭīʿu uṣalliḥu“ ohne an | „Tamir edebilirim“ → astaṭīʿu an uṣalliḥa. „… mümkün mü?“ → hal yumkinu an …? |
| `ar.g.quantoren` (A2-e13) | Vertraut: bazı = baʿḍ, gayri- = ġayr (gayriresmi = ġayr rasmī). Neu: kull + unbestimmt = her, kull + bestimmt = bütün. | „kull al-yawm“ für „her gün“ | „her gün“ → kull yawm, „bütün gün“ → kull al-yawm. „aynı gün“ → nafs al-yawm. |
| `ar.g.ausruf` (A2-e13) | „Ne güzel!“ hat im Arabischen ein festes Muster: mā + afʿala + Akkusativ. | „mā ǧamīl …!“ | „Düğün ne güzeldi!“ → mā aǧmala l-ʿurs! |
| `ar.g.zahlen_gross` (A2-e14) | Vertraut: Jahreszahlen liest man wie im Türkischen als ganze Zahl (bin dokuz yüz …). Neu: Einer vor Zehner; Dualformen miʾatān, alfān. | „alf wa-tisʿumiʾa wa-tisʿūn wa-ḫamsa“ (türkische Reihenfolge) | 1995 → alf wa-tisʿumiʾa wa-ḫamsa wa-tisʿūn: wie „bin dokuz yüz …“, nur „beş ve doksan“. |

### 2.4 B1 (30 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `ar.g.kana_mudari` (B1-e01) | Vertraut: „oynardım“ (früher immer) heißt kuntu alʿabu, „-mişti“ heißt kāna qad + Vergangenheit. Neu: zwei Verben, beide mit Person. | „kāna alʿabu“ · „kuntu laʿibtu“ | „Eskiden sokakta oynardım“ → kuntu alʿabu fī š-šāriʿ. |
| `ar.g.verb_hohl` (B1-e01) | Verben mit w oder y in der Mitte kürzen den langen Vokal vor Endungen mit Konsonant (qāla – qultu). | „qāltu“ · „nāmtu“ | Vor -tu, -ta, -nā wird der lange Vokal kurz: qāla → qultu, nāma → nimtu. |
| `ar.g.stamm2` (B1-e02) | Vertraut: talim, tedris, tebrik sind Verbalnomen von Stamm II (taʿlīm, tadrīs, tabrīk). Neu: Das Verb dazu hat eine Šadda (ʿallama, darrasa). | Šadda in darrasa überhört („darasa“ für „unterrichtet“) | „öğretti“ → ʿallama, „ders verdi“ → darrasa. Die Šadda wie in „dikkat“ deutlich sprechen. |
| `ar.g.stamm5_6` (B1-e02) | Vertraut: Das türkische -ş- (yardımlaştık) entspricht Stamm VI (taʿāwannā); teşekkür kommt von tašakkur (Stamm V). | „sāʿadnā baʿḍunā baʿḍan“ statt taʿāwannā | „Yardımlaştık“ → taʿāwannā. „öğrendi“ → taʿallama (Stamm V zu ʿallama). |
| `ar.g.relativ` (B1-e03) | Türkisch stellt das Partizip vor das Nomen (gördüğümüz daire), Arabisch den Relativsatz dahinter, mit allatī und einem Rückverweis-Pronomen. Nach unbestimmtem Nomen steht kein Relativwort. | „allatī raʾaynāhā aš-šaqqa“ · „aš-šaqqa llatī raʾaynā“ | „gördüğümüz daire“ → aš-šaqqa llatī raʾaynāhā: erst die Wohnung, dann der Relativsatz mit -hā. |
| `ar.g.ortsnomen` (B1-e03) | Vertraut: mekân, merkez, mutfak, matbaa sind Ortsnomen mit ma- (makān, markaz, maṭbaḫ, maṭbaʿa). | Ortsnomen nach türkischer Form ausgesprochen („mutfak“) | ma- + Wurzel = Ort: maṭbaḫ (mutfak), malʿab (oyun yeri). mi- + Wurzel = Werkzeug: miftāḥ. |
| `ar.g.dual` (B1-e04) | Türkisch hat keinen Dual und setzt nach Zahlen die Einzahl (iki kitap). Arabisch: kitābāni. Dazu kommen eigene Mehrzahlformen für Gruppen nur aus Frauen oder Mädchen (hunna, antunna, yaktubna); türkisch „onlar“ und „siz“ unterscheiden das nicht. | „iṯnān kitāb“ (iki kitap) · „hum yaktubūna“ für eine Gruppe von Mädchen | „iki kitap“ ist ein Wort: kitābāni. Als Objekt -ayni: ġurfatayni. Nur Frauen oder Mädchen: hunna yaktubna. |
| `ar.g.zahl_tamyiz` (B1-e04) | Türkisch setzt nach jeder Zahl die Einzahl. Arabisch: nach 3–10 Plural (Genus umgekehrt), ab 11 wieder Einzahl im Akkusativ. | „ṯalāṯat yawm“ (üç gün) | „üç gün“ → ṯalāṯat ayyām (Plural). „yirmi gün“ → ʿišrūna yawman (Einzahl, wie im Türkischen). |
| `ar.g.verb_defekt` (B1-e05) | Verben mit w oder y am Ende ändern das Wortende (yamšī, nasītu); im Jussiv wird der Endvokal kurz. | „lam yamšī“ | yamšī → lam yamši, nasiya → nasītu. |
| `ar.g.verb_hamza` (B1-e05) | Im Türkischen ist die Hamza fast überall verschwunden (mesele ← masʾala, memur ← maʾmūr). Im Arabischen wird sie gesprochen. | „sala“ für saʾala · „masala“ | mesele → masʾala, memur → maʾmūr: die Hamza als kurzen Knacklaut sprechen. |
| `ar.g.stamm4` (B1-e06) | Vertraut: ilan, ikram, ikamet sind Verbalnomen von Stamm IV (iʿlān, ikrām, iqāma). Neu: Präsens mit u- (yursilu). | „yarsilu“ | ikamet → iqāma (Aufenthalt). Präsens von Stamm IV mit u-: yursilu, yuġliqu. |
| `ar.g.verb_assimiliert` (B1-e06) | Verben mit w am Anfang verlieren es im Präsens (waṣala – yaṣilu). | „yawṣilu“ · yaǧidu unter y gesucht | waǧada → yaǧidu: im Wörterbuch unter w suchen. |
| `ar.g.stamm7_8` (B1-e07) | Vertraut: ihtiyaç, ihtimal, itiraz, intizar haben das t von Stamm VIII (iḥtiyāǧ, iḥtimāl, iʿtirāḍ, intiẓār). | „intaẓara“ unter n-t-ẓ gesucht | Das t gehört nicht zur Wurzel: intiẓār → n-ẓ-r. Aus w + t wird tt: ittaṣala. |
| `ar.g.stamm10` (B1-e07) | Vertraut: istirahat, istifade, istiklal sind Stamm X (istirāḥa, istifāda, istiqlāl). Falle: istiqbāl heißt „Empfang“; „Zukunft“ ist mustaqbal. | „istiqbāl“ für „Zukunft“ | istaqbalnā ḍuyūfan = Wir haben Gäste empfangen. Zukunft heißt mustaqbal. |
| `ar.g.stamm3` (B1-e08) | Vertraut: muamele, müsaade, münakaşa sind Verbalnomen von Stamm III – oft mit anderer Bedeutung: musāʿada = Hilfe, munāqaša = Besprechung. | „musāʿada“ als „Erlaubnis“ verstanden | Stamm III heißt oft „mit jemandem“: sāʿada (helfen), nāqaša (besprechen). musāʿada ist Hilfe, keine Erlaubnis. |
| `ar.g.anna_dass` (B1-e08) | Vertraut: Wie in „Biliyorum ki …“ folgt der dass-Satz nach dem Verb. Neu: Pronomen hängen an anna; nach qāla steht inna. | „aʿrifu anna anta …“ | „Biliyorum ki …“ → aʿrifu anna … „Senin meşgul olduğunu“ → annaka mašġūl. |
| `ar.g.temporalsatz` (B1-e09) | Türkische Endungen wie -ince, -ken, -dığında werden zu Wörtern am Satzanfang (ʿindamā, baynamā, lammā). | „waṣaltu ʿindamā“ (Konjunktion am Ende) | „Eve gelince“ → ʿindamā waṣaltu ilā l-bayt. „Okurken“ → baynamā aqraʾu. |
| `ar.g.verb_verdoppelt` (B1-e09) | Vertraut: In hak – hakkı, ret – reddetmek kommt der doppelte Konsonant vor einem Vokal zurück. Im Arabischen trennt er sich vor Endungen mit Konsonant (radadtu). | „raddtu“ | Wie hak – hakkım: radda, aber radadtu; ḥalla, aber ḥalalnā. |
| `ar.g.irab` (B1-e10) | Vertraut: Nominativ ≈ yalın hal, Akkusativ ≈ -i hali, Genitiv ≈ -in hali. -e, -de, -den werden im Arabischen zu Präpositionen (ilā, fī, min). | eigene Endungen für „-e“ und „-de“ gesucht | Drei Fälle mit -u, -a, -i. „-e, -de, -den“ sind Wörter: ilā, fī, min. |
| `ar.g.fuenf_nomen` (B1-e10) | ab, aḫ und drei weitere Nomen zeigen den Fall mit langem Vokal (abūka, abāka, abīka). | „maʿa abūka“ | Nach maʿa Genitiv: maʿa abīka. Subjekt: abūka, Objekt: abāka. |
| `ar.g.diptota` (B1-e11) | Manche Nomen bekommen kein Tanwīn und im Genitiv -a, darunter viele Ortsnamen (Tūnis → min Tūnisa). | „min Tūnisin“ | „Tunus'tan Paris'e“ → min Tūnisa ilā Bārīsa: kein Tanwīn. |
| `ar.g.modi_ueberblick` (B1-e11) | Drei Formen des Präsens nach Signalwörtern. Vertraut: „yazsın“ (er soll schreiben) entspricht li-yaktub. | „lan yaktubu“ · „lam yaktubu“ | „Adını buraya yazsın“ → li-yaktub ismahu hunā. -u normal, -a nach an/li-/lan, ohne Endung nach lam. |
| `ar.g.partizip_abgeleitet` (B1-e12) | Vertraut: müdür, mühendis, mütercim sind Partizipien mit mu- (mudīr, muhandis, mutarǧim). Neu: aktiv mit -i-, passiv mit -a-. | „mustaʿmil“ für „gebraucht“ | Ein Vokal entscheidet: mustaʿmil (Nutzer) – mustaʿmal (gebraucht). |
| `ar.g.qad` (B1-e12) | qad + Vergangenheit = „çoktan, artık“; qad + Präsens = „belki, bazen“. | „qad yataʾaḫḫaru“ als „gecikmiş“ verstanden | qad waṣala = (çoktan) geldi; qad yataʾaḫḫaru = belki gecikir. |
| `ar.g.elativ_umschreibung` (B1-e13) | „daha“ geht im Türkischen vor jedem Adjektiv; Arabisch umschreibt mit akṯar + Nomen im Akkusativ, wo afʿal nicht geht. | „akṯar naẓīf“ (daha temiz) | „daha temiz“ → anẓaf oder akṯar naẓāfatan (wörtlich: mehr an Sauberkeit). |
| `ar.g.verb_doppelt_schwach` (B1-e13) | Die häufigsten Verben sind unregelmäßig (raʾā – yarā, ǧāʾa – yaǧīʾu). | „yarʾā“ | Als Paar lernen: raʾā – yarā (gördü – görür), ǧāʾa – yaǧīʾu (geldi – gelir). |
| `ar.g.nisba_abstrakt` (B1-e14) | Vertraut: Das türkische -iyet (insaniyet, mesuliyet, hürriyet) ist das arabische -iyya. Neu: immer feminin. | „al-masʾūliyya kabīr“ | insaniyet → insāniyya, mesuliyet → masʾūliyya. Adjektive danach feminin. |
| `ar.g.satzverbindung` (B1-e14) | „kolay değil, eğlenceli“ braucht im Arabischen bal (sondern). „ne … ne“ → lā … wa-lā; „ya … ya“ → immā … aw. | „laysa sahlan lākin mumtiʿ“ | „Kolay değil, (bilakis) eğlenceli“ → laysa sahlan bal mumtiʿ. |
| `ar.g.indirekte_frage` (B1-e15) | Türkisch formt indirekte Fragen mit Endungen (gelip gelmediğini); Arabisch mit hal oder iḏā kāna und normaler Wortstellung. | Fragewort ans Ende gestellt | „Gelip gelmediğini bilmiyorum“ → lā aʿrifu hal sa-yaʾtī. |
| `ar.g.hoeflichkeit` (B1-e16) | Vertraut: tafaḍḍal ist „buyurun“, law samaḥt ist „müsaadenizle“. Neu: Die Formen richten sich nach dem Genus (tafaḍḍalī, law samaḥti). | „tafaḍḍal“ zu einer Frau | „Buyurun“ → tafaḍḍal, tafaḍḍalī, tafaḍḍalū. „Rica ederim“ → ʿafwan. |

### 2.5 B2 (28 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `ar.g.passiv_madi` (B2-e01) | Türkisch bildet das Passiv mit -il-/-in-; Arabisch mit anderen Vokalen im Wort (kataba → kutiba). | „kataba“ als Passiv gelesen | „yazıldı“ → kutiba. Ohne Vokalzeichen sieht es aus wie kataba – auf die Vokale achten. |
| `ar.g.passiv_mudari` (B2-e01) | Vertraut: Wie „kabul edildi“ (Nomen + Hilfsverb) bildet tamma + Verbalnomen ein Passiv. | „tamma qabila“ (Verb nach tamma) | „Karar alındı“ → tamma ttiḫāḏ al-qarār, wie „kabul edildi“ → tamma l-qabūl. |
| `ar.g.kana_schwestern` (B2-e02) | mā zāla sieht verneint aus, heißt aber „hâlâ“. Nach ṣāra/aṣbaḥa („oldu“) steht der Akkusativ. | mā zāla als „artık değil“ verstanden · „ṣāra ṭālibun“ | „Hâlâ arıyoruz“ → mā zilnā nabḥaṯu. „Öğrenci oldu“ → ṣāra ṭāliban. |
| `ar.g.bedingung_real` (B2-e02) | Vertraut: šarṭ ist das türkische „şart“. Neu: Die Bedingung steht mit in oder iḏā am Anfang, nicht als Endung -se. | „tadrusu in, tanǧaḥu“ | „Çalışırsan başarırsın“ → in tadrus tanǧaḥ. Vor einem Nachsatz mit sa- steht fa-. |
| `ar.g.inna_schwestern` (B2-e03) | kaʾanna = sanki, layta = keşke, laʿalla = belki; danach steht das Subjekt im Akkusativ. | „laʿalla l-ǧīrānu“ | „Belki komşular bilmiyor“ → laʿalla l-ǧīrāna lā yaʿrifūna. |
| `ar.g.istithna` (B2-e03) | Falle: Das türkische illa heißt „unbedingt“, das arabische illā „außer“. Vertraut: hariç kommt von ḫāriǧ. | illā als „unbedingt“ verstanden | „Biri hariç“ → illā wāḥidatan. Nach ġayr und siwā steht der Genitiv. |
| `ar.g.hal` (B2-e04) | Was im Türkischen -arak oder -ken ausdrückt, ist im Arabischen oft ein Ḥāl im Akkusativ. | „ḫaraǧa mubtasimun“ | „Gülümseyerek çıktı“ → ḫaraǧa mubtasiman. |
| `ar.g.anfangsverben` (B2-e04) | „-meye başladı“ wird zu badaʾa + Verb mit Person, ohne an. | „badaʾa an yamšī“ | „Yürümeye başladı“ → badaʾa yamšī. |
| `ar.g.masdar_formen` (B2-e05) | Vertraut: Viele türkische Lehnwörter sind Verbalnomen der Stämme II–X (tebrik, müzakere, ilan, teşekkür, tesadüf, ihtiyaç, istirahat). Auch „mastar“ kommt von maṣdar. | Muster der türkischen Form übernommen (Vokale e, ü) | Jedes Lehnwort zeigt ein Muster: tebrik → tafʿīl (II), ilan → ifʿāl (IV), istirahat → istifʿāl (X). |
| `ar.g.mafuul_mutlaq` (B2-e05) | Statt „çok“ wiederholt das Arabische gern das Verb als Nomen im Akkusativ. Vertraut: teşekkür ← tašakkur, šukr. | „šakarnāhum ǧiddan“ | „Onlara çok teşekkür ettik“ → šakarnāhum šukran ǧazīlan. |
| `ar.g.masdar_satz` (B2-e06) | Vertraut: Wie „pasaportun yenilenmesi“ ersetzt das Verbalnomen den Nebensatz. | „urīdu an taǧdīd …“ (beides gemischt) | „Pasaportumu yenilemek istiyorum“ → urīdu taǧdīd ǧawāz as-safar. |
| `ar.g.verneinung_ueberblick` (B2-e06) | Vertraut: gayri- und adem (ademi merkeziyet) sind ġayr und ʿadam. Neu: Jede Zeit hat ihre eigene Verneinung (lā, mā, lam, lan, laysa). | „lā ḏahabtu“ für „gitmedim“ | gitmiyorum → lā aḏhabu, gitmedim → lam aḏhab, gitmeyeceğim → lan aḏhaba, değil → laysa. |
| `ar.g.bedingung_irreal` (B2-e07) | „olsaydım … binerdim“ wird zu law + Vergangenheit, im Nachsatz oft la- + Vergangenheit. | „law akūnu …“ | „Senin yerinde olsaydım bisiklete binerdim“ → law kuntu makānaka la-rakibtu d-darrāǧa. |
| `ar.g.brueche_prozent` (B2-e07) | „yüzde yirmi“ stellt das Prozentwort vor die Zahl; Arabisch dahinter (ʿišrūna fī l-miʾa). Vertraut: kesir (Bruch) kommt von kasr. | „fī l-miʾa ʿišrūn“ | „yüzde yirmi“ → ʿišrūna fī l-miʾa. „çeyrek“ → rubʿ. |
| `ar.g.tamyiz` (B2-e08) | „güvenlik açısından“ wird zum unbestimmten Akkusativ: akṯar amānan. | „akṯar amān“ | „daha güvenli“ → akṯar amānan, „daha ucuz“ → aqall kulfatan. |
| `ar.g.konzessiv` (B2-e08) | Vertraut: rağmen kommt von raġma. Neu: raġma steht vor dem Nomen (raġma l-maṭar), vor einem Satz mit anna. | „al-maṭar raġma“ (yağmura rağmen) | „Yağmura rağmen“ → raġma l-maṭari. „… olmasına rağmen“ → raġma anna … |
| `ar.g.mafuul_lahu` (B2-e09) | „saygıdan“ (Ablativ als Grund) wird zum Akkusativ ohne Präposition. | „min iḥtirām“ (wie -den) | „Saygıdan ayağa kalktılar“ → waqafū iḥtirāman. |
| `ar.g.textverbinder` (B2-e09) | Vertraut: „X ise …“ entspricht ammā X fa-…. Falle: ammā heißt nicht „ama“ (aber). | ammā als „ama“ verstanden · fa- weggelassen | „Mucit ise öğretmendi“ → ammā l-muḫtariʿ fa-kāna mudarrisan. |
| `ar.g.relativ_man_ma` (B2-e10) | „kim isterse“ wird zu man yurīd; „ne“ im Relativsinn zu mā. | man und mā vertauscht | „Yardım isteyen“ → man yurīd al-musāʿada. „ihtiyacımız olan şey“ → mā naḥtāǧuhu. |
| `ar.g.zweck_negativ` (B2-e10) | „-memek için“ wird zu li-allā + Konjunktiv (li + an + lā). | „li-lā“ · „li-an lā“ | „Kimse kaymasın diye“ → li-allā yanzaliqa aḥad. |
| `ar.g.zeitenfolge` (B2-e11) | Vertraut: -mişti entspricht kāna qad + Vergangenheit, -ecekti entspricht kāna sa- + Präsens. | „kāna yadfaʿu“ für „ödemişti“ (Gewohnheit statt Vorvergangenheit) | „Ödemişti“ → kāna qad dafaʿa. „Arayacaktım“ → kuntu sa-attaṣilu. |
| `ar.g.briefform` (B2-e11) | Vertraut: „Konu“ ist al-mawḍūʿ (mevzu), „Sayın“ entspricht as-sayyid al-muḥtaram (muhterem), „Saygılarımla“ etwa maʿa fāʾiq al-iḥtirām (ihtiram). | „Sayın“ wörtlich übersetzt | Anrede: as-sayyida al-muḥtarama. Betreff: al-mawḍūʿ. Schluss: maʿa fāʾiq al-iḥtirām. |
| `ar.g.ordinal_gross` (B2-e12) | „yirmi birinci“ wird zu al-ḥādī wa-l-ʿišrūn: Einer zuerst, „bir-“ als al-ḥādī. | „al-wāḥid wa-l-ʿišrūn“ · „al-ʿišrūn al-awwal“ | „Yirmi birinci yüzyıl“ → al-qarn al-ḥādī wa-l-ʿišrūn. |
| `ar.g.vergleichssatz` (B2-e12) | „gibi“ steht nach dem Nomen; miṯla und ka- stehen davor, kamā vor einem Satz. Vertraut: misal, mesela haben dieselbe Wurzel wie miṯla. | „aǧdādinā miṯla“ | „Atalarımız gibi“ → miṯla aǧdādinā. „Eskiden çalıştıkları gibi“ → kamā kānū yaʿmalūna. |
| `ar.g.hamza_schreibung` (B2-e13) | Im Türkischen fehlt die Hamza meist (mesele, sual, memur). Im Arabischen wird sie geschrieben, auf alif, wāw, yāʾ oder auf der Zeile. | Hamza beim Schreiben weggelassen („masala“) | sual → suʾāl, mesele → masʾala: der stärkste Vokal neben der Hamza bestimmt den Träger. |
| `ar.g.modalausdruecke` (B2-e14) | Vertraut: zaruri und mümkün kommen von ḍarūrī und mumkin. | „ḍarūrī an“ ohne min | „… zaruri“ → min aḍ-ḍarūrī an …; „… mümkün“ → min al-mumkin an …; „deniliyor ki“ → yuqālu inna. |
| `ar.g.indirekte_rede` (B2-e15) | Vertraut: Wie bei „dedi ki …“ folgt der Inhalt direkt: qālat inna …. „-diğini söyledi“ wird ebenfalls zu anna/inna. | „qāla anna“ | „Muhabir köprünün yakında açılacağını söyledi“ → qālat al-murāsila inna l-ǧisr sa-yuftaḥu qarīban. |
| `ar.g.unechte_idafa` (B2-e16) | „kullanımı kolay cihaz“ steht im Türkischen vor dem Nomen; Arabisch dahinter: ǧihāz sahl al-istiʿmāl. | „sahl al-istiʿmāl ǧihāz“ | „Kullanımı kolay cihaz“ → ǧihāz sahl al-istiʿmāl. |

### 2.6 C1 (14 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `ar.g.nominalstil` (C1-e01) | Vertraut: Die türkische Amts- und Zeitungssprache verdichtet ebenfalls mit Nominalisierungen (-mesini sağladı). Neu: qāma bi-, tamma, ʿamila ʿalā + Verbalnomen. | türkische Satzfolge im Nominalstil beibehalten | „Geliştirilmesini sağladı“ → qāma bi-taṭwīr. Im Gespräch zurück in Verben. |
| `ar.g.amtssprache` (C1-e02) | Vertraut: mucibince ist bi-mūǧib, itibaren ist iʿtibāran min. Neu: ʿalā an (unter der Bedingung, dass), mā lam (sofern nicht). | „bi-mūǧib“ hinter das Nomen gestellt (kanun mucibince) | „Kanun mucibince“ → bi-mūǧib al-qānūn. „1 Ocak'tan itibaren“ → iʿtibāran min al-awwal min yanāyir. |
| `ar.g.berichtsstil` (C1-e03) | Quellenangaben stehen vorn (wafqan li-, bi-ḥasab, naqlan ʿan). Falle: naqlan ʿan heißt „zitiert nach“, nicht „naklen“ (live). | naqlan als „canlı yayın“ verstanden | „Belediyeye göre“ → naqlan ʿan al-baladiyya oder bi-ḥasab al-baladiyya. |
| `ar.g.vermutung` (C1-e04) | Vertraut: muhtemelen = min al-muḥtamal. Falle: ġāliban heißt „meistens“, nicht „galiba“; „galiba“ ist rubbamā oder yabdū anna. | „ġāliban“ für „galiba“ | „Galiba gençler daha az okuyor“ → yabdū anna š-šabāb yaqraʾūna aqall. |
| `ar.g.idafa_ketten` (C1-e05) | Türkische Ketten liest man vom Ende her (şehir okulunun eski kapısı), arabische vom Anfang (bāb madrasat al-madīna al-qadīm). Nur das letzte Glied hat den Artikel. | „al-madīna madrasat bāb“ (türkische Reihenfolge) | Umgekehrt lesen: „şehir okulunun kapısı“ → bāb madrasat al-madīna. |
| `ar.g.argumentation` (C1-e06) | Vertraut: binaenaleyh ist bi-nāʾan ʿalayhi, bilakis ist bi-l-ʿaks. Diese gehobenen Wörter kennen nicht alle (§5.4). | Präposition im Konnektor weggelassen | „Bu nedenle“ → bi-nāʾan ʿalā ḏālika; „buna ek olarak“ → ʿalāwatan ʿalā ḏālika. |
| `ar.g.wortbildung_modern` (C1-e07) | Arabisch bildet neue Wörter aus alten Wurzeln (ḥāsūb aus ḥ-s-b wie hesap), das Türkische oft aus türkischen Wörtern (bilgisayar). | „kumbyūtar“ gewählt, wo ḥāsūb üblich ist | ḥāsūb und hesap haben dieselbe Wurzel. lā- heißt „-siz“: lā-silkī = kablosuz. |
| `ar.g.hervorhebung` (C1-e08) | Im Türkischen steht das Betonte vor dem Verb, im Arabischen ganz vorn, mit Rückverweis-Pronomen am Verb. | „hāḏā l-ʿaqd qaraʾtu“ ohne Rückverweis | „Bu sözleşmeyi baştan sona okudum“ → hāḏā l-ʿaqdu qaraʾtuhu kāmilan. |
| `ar.g.verneinung_stil` (C1-e08) | „hiç“ (Vergangenheit) ist qaṭṭ, „asla“ (Zukunft) ist abadan. Vertraut: katiyen kommt von qaṭʿan. | „mā … abadan“ | „Hiç imzalamadım“ → mā waqqaʿtu qaṭṭ. „Asla kabul etmeyeceğiz“ → lan nuwāfiqa abadan. |
| `ar.g.tawkid_badal` (C1-e09) | nafs vor dem Nomen heißt „aynı“, nach dem Nomen mit Endung „kendisi“. | „nafs al-mudīra“ für „müdirenin kendisi“ | „aynı gün“ → nafs al-yawm; „müdirenin kendisi“ → al-mudīra nafsuhā. |
| `ar.g.redewendungen` (C1-e10) | Arabische Bilder nicht wörtlich nehmen; oft gibt es ein türkisches Gegenstück. Nur weltliche Wendungen aus der Liste der Redaktion. | Sprichwort Wort für Wort übersetzt | yad wāḥida lā tuṣaffiq ≈ „Bir elin nesi var, iki elin sesi var“. |
| `ar.g.paraphrase` (C1-e11) | Vertraut: velhasıl (kurz gesagt) stammt aus dem Arabischen; im Kurs stehen ḫulāṣat al-qawl und bi-ʿibāra uḫrā. | velhasıl wörtlich als wa-l-ḥāṣil in jeden Text übernommen | „Kısacası“ → ḫulāṣat al-qawl; „başka bir deyişle“ → bi-ʿibāra uḫrā. |
| `ar.g.stilmittel` (C1-e12) | Vertraut: Paarformeln wie „büyük küçük“ gibt es in beiden Sprachen (ṣiġāran wa-kibāran). | Paarformel ohne Akkusativ | „Büyük küçük herkes“ → ṣiġāran wa-kibāran. Rhetorische Frage mit a-laysa …? |
| `ar.g.register` (C1-e13) | Fuṣḥā und regionale Umgangssprachen liegen weiter auseinander als Standardtürkisch und ein Dialekt: Verneinung, Zukunft und viele Wörter sind anders. Vertraut: lehçe = lahǧa. | Dialektwort in einen Fuṣḥā-Text übernommen | Nachrichten und Briefe in Fuṣḥā; Umgangssprachen an Verneinung und Zukunft erkennen, nicht selbst verwenden. |

## 3 Wortschatz

### 3.1 Falsche und halbe Freunde

Viele türkische Wörter stammen aus dem Arabischen, haben aber eine andere oder engere Bedeutung bekommen. Dazu kommen Wörter, die nur ähnlich klingen. „teilweise“ heißt: Die Bedeutungen überschneiden sich nur zum Teil; „Klang“ heißt: Die Wörter sind nicht verwandt, klingen aber ähnlich. Die türkischen Bedeutungen sind die des heutigen Standardtürkischen; ob Herkunftssprachler die gehobenen Wörter kennen, prüft die Stichprobe (KD-art-05).

| Arabisch (Umschrift) | Bedeutung | ähnliches türkisches Wort | dessen Bedeutung | für das türkische Wort sagt man | Einheit |
|---|---|---|---|---|---|
| ḫayr | Gutes; gut (ṣabāḥ al-ḫayr) | hayır | nein | lā | A1-e01 |
| ʿafwan | gern geschehen (Antwort auf Dank); Entschuldigung | affedersiniz | Entschuldigung | ʿafwan, ʿuḏran | A1-e01, teilweise |
| luġa | Sprache | lügat | Wörterbuch; Wort | qāmūs | A1-e01 |
| ṣinf | Sorte, Art | sınıf | Schulklasse; Kategorie | ṣaff, faṣl | A1-e02 |
| maktab | Schreibtisch, Büro | mektep | Schule (veraltet) | madrasa | A1-e02 |
| ṭālib | Schüler, Student | talip | Bewerber, Interessent | mutaqaddim | A1-e02 |
| kursī | Stuhl | kürsü | Rednerpult, Lehrstuhl | manaṣṣa | A1-e02 |
| manzil | Haus, Wohnung | menzil | Reichweite, Etappe | madā, marḥala | A1-e03 |
| dāʾira | Kreis; Abteilung, Amt | daire | Wohnung; Amt; Kreis | šaqqa (Wohnung) | A1-e03, teilweise |
| rāḥa | Ruhe, Erholung | rahat | bequem | murīḥ | A1-e03, teilweise |
| ʿumr | Alter, Lebensalter | ömür | Lebenszeit | ʿumr, ḥayāt | A1-e04, teilweise |
| ḫāla | Tante (Schwester der Mutter) | hala | Tante (Schwester des Vaters) | ʿamma | A1-e04 |
| ḫalfa | hinter | halef | Nachfolger | ḫalaf | A1-e05 |
| taḥta | unter | taht | Thron | – | A1-e05, Klang |
| yamīn | rechts, rechte Seite; auch Eid | yemin | Eid | qasam, yamīn | A1-e05, teilweise |
| sayyāra | Auto | seyyar | fahrend, mobil | mutanaqqil | A1-e05, teilweise |
| masāʾ | Abend | mesai | Arbeitszeit | dawām | A1-e06, Klang |
| faqaṭ | nur | fakat | aber | lākin | A1-e06 |
| qiṭʿa | Stück, Teil | kıta | Kontinent | qārra | A1-e07 |
| fann | Kunst | fen | Naturwissenschaft | ʿulūm | A1-e09 |
| hawāʾ | Luft | hava | Luft; Wetter | ṭaqs, ǧaww (Wetter) | A1-e11, teilweise |
| ṣafrāʾ | gelb (feminin) | safra | Galle | marāra | A1-e11 |
| ḥarāra | Hitze, Temperatur, Fieber | hararet | Fieberhitze; Durst | ʿaṭaš (Durst) | A1-e12, teilweise |
| taḏkira | Fahrkarte, Eintrittskarte | tezkere | Bescheinigung | waṯīqa | A2-e01 |
| risāla | Brief; auch Abhandlung | risale | Abhandlung, Heft | risāla, kutayyib | A2-e02, teilweise |
| maktūb | geschrieben | mektup | Brief | risāla | A2-e02, teilweise |
| šahr | Monat | şehir | Stadt | madīna | A2-e03, Klang |
| ʿunwān | Adresse; Überschrift | unvan | Titel, Berufsbezeichnung | laqab | A2-e03 |
| ǧawāz (as-safar) | Reisepass | cevaz | Erlaubnis (gehoben) | iḏn | A2-e03 |
| musāfir | Reisender | misafir | Gast | ḍayf | A2-e04 |
| iḏn | Erlaubnis | izin | Erlaubnis; Urlaub | ʿuṭla, iǧāza (Urlaub) | A2-e04, teilweise |
| taʿṭīl, muʿaṭṭal | Ausfall, Stilllegung; kaputt | tatil, muattal | Ferien; ungenutzt | ʿuṭla (Ferien) | A2-e04 |
| maṭār | Flughafen | matara | Feldflasche | maṭara | A2-e04, Klang |
| musāʿada | Hilfe | müsaade | Erlaubnis | iḏn | A2-e05 |
| ʿādatan | normalerweise | âdeta | geradezu, fast wie | kaʾanna, taqrīban | A2-e05 |
| ġāliban | meistens | galiba | vermutlich | rubbamā, yabdū anna | A2-e05 |
| maḥall | Laden; Ort | mahal, mahalle | Ort; Stadtviertel | ḥayy (Viertel) | A2-e06, teilweise |
| ʿilāǧ | Behandlung, Therapie | ilaç | Medikament | dawāʾ | A2-e08 |
| ḥāḍir | anwesend | hazır | fertig, bereit | ǧāhiz | A2-e09 |
| waẓīfa | Stelle, Arbeitsplatz; Aufgabe | vazife | Pflicht; Hausaufgabe | wāǧib (Hausaufgabe) | A2-e09, teilweise |
| muḏākara | Lernen für die Prüfung (regional) | müzakere | Verhandlung, Beratung | mufāwaḍāt | A2-e09, zu prüfen |
| šaǧara | Baum | şecere | Stammbaum | šaǧarat al-ʿāʾila | A2-e11 |
| maʿāš | Rente, Pension | maaş | Gehalt | rātib | A2-e12 |
| dawām | Arbeitszeit, Dienst; Dauer | devam | Fortsetzung; Anwesenheit | istimrār, ḥuḍūr | A2-e12, teilweise |
| rasm | Zeichnen; Gebühr | resim | Bild, Foto | ṣūra | A2-e12, teilweise |
| maṣraf | Bank | masraf | Ausgaben, Kosten | nafaqāt, maṣārīf | A2-e14 |
| afkār | Gedanken, Ideen | efkâr | Wehmut, Kummer | ḥuzn | B1-e02 |
| funduq | Hotel | fındık | Haselnuss | – | B1-e04, Klang |
| ǧihāz | Gerät | çeyiz | Aussteuer | ǧahāz (mit a) | B1-e07 |
| istiqbāl | Empfang | istikbal | Zukunft | mustaqbal | B1-e07 |
| munāqaša | Besprechung, Diskussion | münakaşa | Streit | šiǧār | B1-e08 |
| murāǧaʿa | Überprüfung, Wiederholung; Kontrolltermin | müracaat | Antrag, Bewerbung | ṭalab | B1-e11 |
| ḥālan | sofort | halen | derzeit, noch immer | ḥāliyyan, mā zāla | B1-e11 |
| kahrabāʾ | Strom, Elektrizität | kehribar | Bernstein | kahramān | B1-e14 |
| iḫtiyār | Wahl, Auswahl | ihtiyar | alt, Greis | musinn | B2-e02 |
| ǧāmiʿa | Universität | camia | Gemeinschaft, Kreis | awsāṭ | B2-e02 |
| illā | außer | illa | unbedingt | lā budda | B2-e03 |
| ʿamaliyya | Vorgang; auch Operation | ameliyat | Operation (Chirurgie) | ʿamaliyya ǧirāḥiyya | B2-e04, teilweise |
| taṣarruf | Verhalten; Verfügung | tasarruf | Sparen | tawfīr | B2-e07 |
| ṭāqa | Energie | takat | Kraft, Ausdauer | quwwa | B2-e07, teilweise |
| ammā … fa- | was … betrifft | ama | aber | lākin | B2-e09 |
| ṣanʿa | Handwerk, Herstellung | sanat | Kunst | fann | B2-e12 |
| ṣaḥāfa | Presse, Journalismus | sahaf | Antiquar | bāʾiʿ kutub qadīma | B2-e15 |
| naqlan ʿan | zitiert nach | naklen | live (Übertragung); durch Versetzung | baṯṯ mubāšir | C1-e03 |
| maṯal | Sprichwort; Beispiel | masal | Märchen | ḥikāya | C1-e10 |
| dustūr | Verfassung | düstur | Grundsatz, Leitsatz | mabdaʾ | C1-e11 |

### 3.2 Lehnwörter

**Brücken mit gleicher Bedeutung.** Etwa ein Fünftel der häufigsten arabischen Lemmata hat ein türkisches Gegenstück ähnlicher Form und Bedeutung (Messung §7). Tipps nennen das türkische Wort zuerst, dann die arabische Aussprache. Nur weltliche Wörter (§0, KD-art-10).

| Wortfeld | Türkisch → Arabisch (Umschrift) |
|---|---|
| Schule | kitap – kitāb, kalem – qalam, defter – daftar, ders – dars, imtihan – imtiḥān, harf – ḥarf, kelime – kalima, cümle – ǧumla, mana – maʿnā, tarih – tārīḫ, hesap – ḥisāb, rakam – raqm, sıfır – ṣifr |
| Zeit | saat – sāʿa, dakika – daqīqa, saniye – ṯāniya, sene – sana, vakit – waqt, zaman – zamān, sabah – ṣabāḥ |
| Familie und Wohnen | aile – ʿāʾila, bina – bināʾ, kira – kirāʾ, eşya – ašyāʾ (Plural, §3.3) |
| Stadt | merkez – markaz, meydan – maydān, belediye – baladiyya, bakkal – baqqāl, dükkân – dukkān |
| Gesundheit | tabip – ṭabīb, merhem – marham, cerrah – ǧarrāḥ |
| Essen und Tisch | kahve – qahwa, fincan – finǧān, ibrik – ibrīq, zeytin – zaytūn, sahan – ṣaḥn (teilweise) |
| Natur und Tiere | hayvan – ḥayawān, zürafa – zarāfa, timsah – timsāḥ, manzara – manẓara, tabiat – ṭabīʿa |
| Denken und Sprechen | akıl – ʿaql, fikir – fikr, cevap – ǧawāb, sebep – sabab, mesele – masʾala, haber – ḫabar, makale – maqāla, ilan – iʿlān |
| Gesellschaft | insan – insān, hayat – ḥayāt, kanun – qānūn, hak – ḥaqq, adalet – ʿadāla, hürriyet – ḥurriyya, şirket – šarika, karar – qarār |
| Dinge | hediye – hadiyya, kumaş – qumāš, harita – ḫarīṭa, zarf – ẓarf, cihaz – ǧihāz (Gerät; §3.1 çeyiz) |
| kleine Wörter | ve – wa, lakin – lākin, hatta – ḥattā, tamam – tamām, tabii – ṭabʿan, mesela – maṯalan, daima – dāʾiman, nadiren – nādiran, takriben – taqrīban |
| Höflichkeit | merhaba – marḥaban, maalesef – maʿa l-asaf, lütfen – luṭf (Freundlichkeit), rica – raǧāʾ, teşekkür – tašakkur, tebrik – tabrīk |

**Der Rückweg: vom türkischen Wort zur arabischen Form.** Wer diese Regeln kennt, erkennt Lehnwörter und spricht sie richtig:

| Regel | Türkisch | Arabisch |
|---|---|---|
| h steht für ḥ, ḫ oder h | hal, haber, hediye | ḥāl, ḫabar, hadiyya |
| s steht für s, ṣ oder ṯ | sene, sabah, saniye | sana, ṣabāḥ, ṯāniya |
| z steht für z, ḏ, ḍ oder ẓ | zaman, zevk, zarar, zarf | zamān, ḏawq, ḍarar, ẓarf |
| k steht für k oder q | kitap, kalem | kitāb, qalam |
| v steht für w | vakit, veda | waqt, wadāʿ |
| ʿ und Hamza fallen weg | ilan, mesele, memur | iʿlān, masʾala, maʾmūr |
| -et/-at oder -e am Ende: oft Tāʾ marbūṭa | devlet, şirket, kelime, madde | dawla, šarika, kalima, mādda |
| p, t, ç am Ende: im Arabischen stimmhaft | kitap, cevap, sebep | kitāb, ǧawāb, sabab |
| Hilfsvokal fällt weg | fikir, akıl, isim, şekil | fikr, ʿaql, ism, šakl |
| Vokale türkisch umgefärbt (oft e, ü statt a, u) | kalem, mektep, müdür | qalam, maktab, mudīr |

### 3.3 Plural im Arabischen, Einzahl im Türkischen

Einige türkische Wörter sind arabische Pluralformen, die im Türkischen wie Einzahl gebraucht werden. Tipps zu `ar.g.plural_gebrochen` (A2-e07) nutzen sie als Brücke und Falle zugleich.

| Türkisch | arabischer Plural | arabische Einzahl | Hinweis |
|---|---|---|---|
| evlat (Kind) | awlād (Kinder) | walad | „ein Kind“ heißt walad |
| eşya (Sachen) | ašyāʾ (Dinge) | šayʾ | Vertraut |
| evrak (Unterlagen) | awrāq (Blätter, Papiere) | waraqa | Vertraut |
| akraba (Verwandte) | aqribāʾ, aqārib (Verwandte) | qarīb (nah; Verwandter) | Vertraut |
| esnaf (Handwerker, Händler) | aṣnāf (Sorten) | ṣinf (Sorte) | Bedeutung verschoben |
| talebe (Schüler) | ṭalaba (Studierende) | ṭālib | ein Schüler: ṭālib |
| ahali (Bewohner) | ahālī (Bewohner) | ahl (Familie, Leute) | Vertraut |
| efkâr (Wehmut) | afkār (Gedanken) | fikr | falscher Freund (§3.1) |
| hayvanat, malumat, nebatat | ḥayawānāt, maʿlūmāt, nabātāt | ḥayawān, maʿlūma, nabāt | Plural -āt (`ar.g.plural_gesund`) |

### 3.4 Internationalismen und Wortfelder

**Internationalismen.** Viele moderne Wörter sind in beiden Sprachen Lehnwörter: tilifūn – telefon, rādyū – radyo, film – film, bank – banka, duktūr – doktor, kīlū – kilo, mitr – metre, tāksī – taksi, intarnit – internet, fīzā – vize, almāniyā – Almanya, ūrūbbā – Avrupa. Das Arabische hat kein p und kein v: bīzzā (pizza), fīzā (vize). Für Computer sagt das Arabische ḥāsūb (Wurzel ḥ-s-b wie hesap), das Türkische bilgisayar.

| Wortfeld | Türkisch | Arabisch | Hinweis für Tipps |
|---|---|---|---|
| Onkel, Tante | amca, dayı, hala, teyze | ʿamm, ḫāl, ʿamma, ḫāla | Vertraut: vier Wörter. Falle: hala ist ʿamma, ḫāla ist teyze (A1-e04) |
| Alter | yaş; ömür (Lebenszeit) | ʿumr, sinn | kam ʿumruka? (A1-e04) |
| Zimmer, Wohnung | oda, daire, ev | ġurfa, šaqqa, bayt, manzil | daire ist šaqqa (A1-e03) |
| Schüler, Student | öğrenci, talebe | ṭālib, tilmīḏ | A1-e02 |
| Lehrkraft | öğretmen | muʿallim, mudarris, ustāḏ | ustāḏ auch als Anrede (A1-e02) |
| Wetter, Luft | hava | ṭaqs, ǧaww; hawāʾ | A1-e11 |
| wissen, kennen | bilmek, tanımak | ʿarafa für beides; ʿalima (wissen) | A2-e03 |
| gehen, fahren, einsteigen | gitmek, binmek | ḏahaba, rakiba | A2-e01 |
| Uhr, Stunde | saat | sāʿa | Vertraut: ein Wort für beides (A1-e09) |
| Gast, Reisender | misafir, yolcu | ḍayf, musāfir | Falle (§3.1) |
| Hausaufgabe | ödev | wāǧib | A2-e09 |
| Passwort | şifre | kalimat sirr | şifre geht über das Französische auf ṣifr (Null) zurück (B1-e07, KD-art-06) |

## 4 Pragmatik und Höflichkeit

### 4.1 sen und siz

Das Türkische unterscheidet sen und siz wie das Deutsche du und Sie; das Hocharabische hat kein grammatisches „Sie“. anta und anti gelten für alle Personen. Respekt zeigen Titel und Vorname und in förmlicher Rede ḥaḍratuka/ḥaḍratuki (`ar.g.anrede`).

Türkischsprachige übertragen leicht „siz“ auf den arabischen Plural (antum, Pluralverb zu einer Person). Tipps sagen: Zu einer Person immer Einzahl; Höflichkeit kommt über Titel, Vorname und feste Wendungen. Wichtig ist das richtige Genus (anta oder anti).

| Situation | Türkisch | Arabisch | Hinweis |
|---|---|---|---|
| Amt, Arzt, Geschäft | siz + Bey/Hanım | anta/anti mit Titel: as-sayyid, as-sayyida, duktūr, duktūra | Vertraut: Titel und Vorname |
| Lehrkraft | öğretmenim, … Hanım | yā ustāḏ, yā ustāḏa (mit oder ohne Vorname) | A1-e02 |
| Ältere Bekannte | amca, teyze, abla, ağabey | ʿammū, ḫāla; uḫtī, aḫī (regional, zu prüfen) | Vertraut: Verwandtschaftswörter für Bekannte (KD-art-08) |
| Familie, Freunde | sen | anta/anti | Vertraut |
| Gruppe | siz | antum, antunna (nur Frauen) | B1 (`ar.g.dual`) |

### 4.2 Anrede und Namen

- **Titel und Vorname:** Vertraut: Wie „Nadiye Hanım“ oder „Murat Bey“ ehrt das Arabische mit Titel und Vorname: al-ustāḏa Nādiya, as-sayyid Ḫālid. Anders: Der Titel steht vorn.
- **Anrufwort yā:** Vor der direkten Anrede steht yā (yā Laylā). Das Türkische hat kein Gegenstück.
- **Elternnamen:** Abū Yazan, Umm Yazan („Vater/Mutter von Yazan“) sind höfliche Anreden für Eltern. Türkisch sagt „Yazan'ın babası“ nur beschreibend.
- **Herkunftsnamen:** Vertraut: Wie türkische Familiennamen auf -lı (Halepli, Konyalı) nennen arabische Nisba-Namen die Herkunft: al-Ḥalabī (aus Aleppo), aš-Šāmī, al-Baġdādī (`ar.g.nisba`).
- **Namen in Umschrift:** Türkische Namen der Figuren (Elif, Emre, Defne) stehen im arabischen Text in arabischer Schrift; in Tipps der türkischen Oberfläche in türkischer Schreibung (OF-ar-13).

### 4.3 Grüßen, Danken, Bitten, Wünschen

Nur weltliche Formeln (Leitfaden §4.3). Viele Türkischsprachige kennen religiöse Formeln aus dem Alltag; sie bleiben gesperrt und werden in Tipps weder genannt noch als Brücke genutzt (§4.7).

| Situation | Türkisch (weltlich) | Arabisch (weltlich) | Antwort | Hinweis |
|---|---|---|---|---|
| Begrüßung | Merhaba | marḥaban | marḥaban bik(i) | Vertraut: dasselbe Wort |
| Willkommen | Hoş geldin(iz) – Hoş bulduk | ahlan wa-sahlan | ahlan bik(i) | Vertraut: feste Paarantwort |
| Morgen | Günaydın | ṣabāḥ al-ḫayr | ṣabāḥ an-nūr | ḫayr heißt „gut“, nicht „nein“ (§3.1) |
| Abend | İyi akşamlar | masāʾ al-ḫayr | masāʾ an-nūr | Paarantwort |
| Abschied | Hoşça kal – Güle güle | maʿa s-salāma, ilā l-liqāʾ | maʿa s-salāma | als feste Wendung (OF-ar-07) |
| Danken | Teşekkürler | šukran, šukran ǧazīlan | ʿafwan | teşekkür kommt von tašakkur |
| Antwort auf Dank | Rica ederim | ʿafwan, lā šukr ʿalā wāǧib | – | ʿafwan ist nicht „affedersiniz“ |
| Bitten | Lütfen | min faḍlik(i), law samaḥt(i) | – | Genus beachten |
| Anbieten | Buyurun | tafaḍḍal, tafaḍḍalī, tafaḍḍalū | šukran | Vertraut: wie „buyurun“ |
| Bedauern | Maalesef | maʿa l-asaf | – | Vertraut: dasselbe Wort |
| Essen | Afiyet olsun | bi-l-hanāʾ wa-š-šifāʾ | šukran | weltlich (Leitfaden §4.3) |
| Krankheit | Geçmiş olsun | šifāʾan ʿāǧilan | šukran | A1-e12 |
| Glückwunsch | Tebrikler | mabrūk, alf mabrūk | šukran | mabrūk und tebrik haben dieselbe Wurzel |
| Trauer | Başınız sağ olsun | aḥarr at-taʿāzī | šukran | erst ab B1 (Leitfaden G-12) |
| Arbeit | Kolay gelsin | – | – | keine feste weltliche Entsprechung im Kurs (zu prüfen, KD-art-11) |

### 4.4 Gespräch, Kritik, Absagen

- **Ja, nein, doch:** naʿam, lā. Auf eine verneinte Frage antwortet balā wie das deutsche „doch“ (a-lam tadrus? – balā). Türkisch antwortet mit dem Verb (Çalışmadın mı? – Çalıştım); Tipps zeigen balā als neues Wort.
- **Rückfragen:** ʿafwan? oder law samaḥt, hal yumkinuka an tuʿīd? – wie „Pardon, tekrar eder misiniz?“.
- **Zustimmen und widersprechen:** anā muwāfiq/muwāfiqa (katılıyorum), lā uwāfiqu (katılmıyorum), fī raʾyī … (bence). Falle: munāqaša ist eine sachliche Besprechung, kein Streit (§3.1).
- **Absagen:** āsif/āsifa, lā astaṭīʿu – Genus beachten. Tipps beschreiben nur die Sprachform, keine Gewohnheiten (KD-art-09).
- **Lob:** aḥsanta, aḥsanti; mumtāz. Weltliche Lobformeln ersetzen die gesperrten (F-ar-05, F-tr-05, F-tr-12).

### 4.5 Briefe, E-Mails, Formulare

| Teil | Türkisch | Arabisch | Hinweis |
|---|---|---|---|
| Anrede förmlich | Sayın … | as-sayyid al-muḥtaram, as-sayyida al-muḥtarama | Vertraut: muhterem ← muḥtaram (B2-e11) |
| Anrede persönlich | Merhaba …, | ʿazīzī, ʿazīzatī | wörtlich „mein Lieber, meine Liebe“ (A2-e02) |
| Betreff | Konu: | al-mawḍūʿ: | Vertraut: mevzu ← mawḍūʿ |
| Bezug | İlgi: | bi-l-išāra ilā … | Vertraut: işaret ← išāra |
| Schluss förmlich | Saygılarımla | maʿa fāʾiq al-iḥtirām | Vertraut: ihtiram ← iḥtirām |
| Schluss persönlich | Görüşmek üzere | maʿa taḥiyyātī | wörtlich „mit meinen Grüßen“ |
| Eröffnung | – | taḥiyya ṭayyiba | weltlicher Gruß; die religiöse Eröffnung ist gesperrt (F-ar-02) |

**Formulare.** al-ism (ad), ism al-ab (baba adı), ism al-ʿāʾila oder al-laqab (soyadı), tārīḫ al-mīlād (doğum tarihi), makān al-mīlād (doğum yeri), al-ǧinsiyya (uyruk), al-ʿunwān (adres – nicht unvan, §3.1), at-tawqīʿ (imza). Vertraut: „baba adı“ kennen türkische Formulare ebenfalls.

### 4.6 Zeit, Zahlen, Formate

- **Ziffern:** östlich-arabische Ziffern in Levante, Irak, Ägypten und Golf, europäische im Maghreb; Zahlen auch im arabischen Text von links nach rechts.
- **Datum:** Tag, Monat, Jahr wie im Türkischen; gesprochen mit Ordnungszahl und min (al-ʿāšir min abrīl).
- **Monatsnamen:** Vertraut: Şubat, Nisan, Haziran, Temmuz und Eylül stehen in der zweiten arabischen Reihe (šubāṭ, nīsān, ḥazīrān, tammūz, aylūl; Levante, Irak). Der Kurs übt die erste Reihe (yanāyir, fabrāyir …) und lässt die zweite erkennen (OF-ar-08). Islamische Monatsnamen sind nur Kandidat R-13.
- **Wochentage:** Die Woche zählt ab Sonntag (al-aḥad = der erste, al-iṯnayn = der zweite = Montag). Vertraut: Cuma ist al-ǧumʿa (normales Wort der Wochentage, OF-ar-05); Cumartesi heißt as-sabt.
- **Uhrzeit:** Vertraut: „sekiz buçuk“ ist aṯ-ṯāmina wa-n-niṣf; neu ist die Ordnungszahl (as-sāʿa aṯ-ṯāliṯa).
- **Prozent:** „yüzde yirmi“ stellt das Prozentwort voran, Arabisch nach: ʿišrūna fī l-miʾa.

### 4.7 Religiöse Formeln (gesperrt)

Viele Türkischsprachige kennen arabische religiöse Formeln aus Familie und Gemeinde, oft in türkischer Form. In den Sprachkursen sind sie gesperrte Kandidaten (Leitfaden §4.2: F-ar-01 bis F-ar-17 und F-tr-01 bis F-tr-15; Rahmenplan §8) und kein Gegenstand dieses Dokuments.
- Tipps nennen nur die weltlichen Entsprechungen aus Leitfaden §4.3 (Tabelle §4.3).
- Keine religiöse Formel dient als „vertraute Brücke“, auch nicht, wenn sie bekannt ist. Kein Tipp erklärt, übersetzt oder bewertet eine Formel.
- Sie erscheinen frühestens nach zwei Freigaben der religiösen Prüfung (KERN §2.3, LM-09).

## 5 Hinweise für Herkunftssprachler

### 5.1 Wer den Kurs nutzt

| Gruppe | Stärken | typische Lücken | Ausrichtung der Tipps |
|---|---|---|---|
| Kinder und Jugendliche mit türkischer Familiensprache, Deutsch stärker | Hören und Sprechen im Türkischen; oft Elifbe-Vorwissen | Türkisch lesen und schreiben; gehobene Lehnwörter; türkische Grammatikbegriffe | einfaches Türkisch; Brücken nur über Alltagswörter; deutsche Fachwörter in Klammern; Hinweis auf `ar-aus-de` in der Kurswahl |
| Erwachsene mit türkischer Schulbildung | viele Lehnwörter, auch gehobene; Grammatikbegriffe | Laute des Hocharabischen; falsche Freunde | volle Kontrasttipps ab A1; gehobene Brücken ab B1 |
| Ältere Lernende | Lehnwörter aus der älteren Sprache, oft Elifbe | Aussprache, neue Wörter | Elifbe-Wissen würdigen; Lauttipps in Ruhe, mit Hörbeispielen |

### 5.2 Elifbe-Vorwissen

Wer die Elifbe gelernt hat, kann oft Buchstaben und Lesezeichen lesen, manchmal ohne die Bedeutung zu kennen. Der Kurs baut darauf auf und verbindet das Lesen mit Bedeutung. Elifbe-Vorwissen wird nur als Wissen über die Schrift genutzt; Tipps verweisen nie auf religiöse Texte (Rahmenplan §4).

| Elifbe (türkisch) | im Kurs (hocharabisch) | Hinweis |
|---|---|---|
| elif, be, te, se … | alif, bāʾ, tāʾ, ṯāʾ … | Namen beider Systeme nebeneinander (§1.1) |
| üstün | Fatḥa | a; in der Elifbe-Tradition nach „dünnen“ Buchstaben oft als e gelesen (be), nach „dicken“ als a (sa); im Hocharabischen ein a, das neben ṣ, ḍ, ṭ, ẓ, q, ḫ, ġ dunkler klingt (zu prüfen, KD-art-02) |
| esre | Kasra | i |
| ötre | Ḍamma | u |
| cezm | Sukūn | Silbe ohne Vokal |
| şedde | Šadda | langer Konsonant |
| tenvin | Tanwīn | -un, -an, -in; in Pausa nicht gesprochen |
| med | Madda | langes ā am Wortanfang |
| lamelif | lām-alif | Ligatur |

**Lesegewohnheiten.** Die Elifbe übt oft Silbe für Silbe und jede Endung einzeln. Im Kurs gelten Pausa am Satzende (§1.4) und die Bindung im Satz. Tipps im Vorkurs (`ar.v.l04`, `ar.v.l07`) greifen das auf.

### 5.3 Sprache der Tipps

- **Einfaches Türkisch:** kurze Sätze, Alltagswörter, ein Gedanke je Satz. Viele Herkunftssprachler lesen Türkisch langsamer als Deutsch.
- **Beispiele zuerst:** erst das arabische Beispiel (voll vokalisiert, `lang="ar"`, `dir="rtl"`), dann die Regel.
- **Fachwörter dreisprachig:** türkischer Begriff zuerst, deutscher Schulbegriff in Klammern, arabischer Begriff nur, wo er hilft (OF-ar-09). Osmanische Grammatikbegriffe (izafet, mazi, muzari) nicht als Erstes.

| Türkisch | Deutsch | Arabisch (Umschrift) | Hinweis |
|---|---|---|---|
| isim, fiil, harf | Nomen, Verb, Partikel | ism, fiʿl, ḥarf | Vertraut: gleiche Wörter |
| sıfat | Adjektiv | ṣifa | Vertraut |
| zamir | Pronomen | ḍamīr | Vertraut |
| kök, vezin | Wurzel, Muster | ǧaḏr, wazn | vezin ← wazn |
| eril, dişil | maskulin, feminin | muḏakkar, muʾannaṯ | neu für Türkischsprachige |
| tekil, çoğul | Singular, Plural | mufrad, ǧamʿ | Dual: muṯannā (neu) |
| geçmiş zaman | Vergangenheit | māḍī | – |
| geniş zaman, şimdiki zaman | Präsens | muḍāriʿ | ein Präsens für beide |
| emir kipi | Imperativ | amr | – |
| isim tamlaması | Genitivverbindung | iḍāfa | Reihenfolge umgekehrt |
| ad cümlesi, fiil cümlesi | Nominalsatz, Verbalsatz | ǧumla ismiyya, ǧumla fiʿliyya | Vertraut: ad cümlesi |
| yalın hal, belirtme hali (-i), ilgi hali (-in) | Nominativ, Akkusativ, Genitiv | marfūʿ, manṣūb, maǧrūr | -e, -de, -den sind Präpositionen |
| mastar | Verbalnomen | maṣdar | mastar ← maṣdar |
| sıfat-fiil (ortaç) | Partizip | ism al-fāʿil, ism al-mafʿūl | – |

### 5.4 Lehnwörter: Alltag und gehobene Sprache

- **Alltagswörter** wie kitap, saat, hesap, tamam, maalesef, lazım, merhaba kennen fast alle. Sie tragen die Brücken bis B1.
- **Gehobene Wörter** wie muhterem, binaenaleyh, mucibince, velhasıl kennen vor allem Ältere und Erwachsene mit türkischer Schulbildung. Tipps nutzen sie erst ab B2 und kennzeichnen sie als „gehoben“; sie sind nie die einzige Erklärung.
- **Bedeutungswandel:** Bei Lehnwörtern zuerst prüfen, ob die Bedeutung gleich ist (§3.1). Tipps sagen „im Arabischen heißt … “, nicht „im Türkischen ist es falsch“.

### 5.5 Deutsch als zweite Brücke

- Viele Herkunftssprachler sind in Deutsch stärker. Die Kurswahl bietet `ar-aus-de` mit deutscher Oberfläche an; beide Richtungen nutzen denselben Zielkorpus.
- Tipps in `ar-aus-tr` dürfen deutsche Schulbegriffe in Klammern nennen (§5.3), aber keine deutschen Sätze.
- Mehrsprachigkeit ist eine Stärke: Wer Türkisch, Deutsch und Arabisch verbindet, erkennt Lehnwörter in beiden Richtungen (B2-e13).

### 5.6 Einstufung

- Elifbe-Vorwissen: Die Einstufung erkennt Lesefähigkeit; `ar.v.l01`–`ar.v.l08` überspringbar, `ar.v.l02` und `ar.v.l07` empfohlen (OF-ar-16).
- Herkunftssprachler lesen Türkisch oft langsamer, als sie es verstehen. Die Einstufung misst Hören, Lesen und Schreiben im Arabischen getrennt; die Sprache der Oberfläche ist frei wählbar.

## 6 Tipp-Themen je Einheit

307 Tipp-Themen für 80 Einheiten-Schlüssel (Vorkurs `ar.v.l01`–`ar.v.l08` und 72 Einheiten). 196 beziehen sich auf eine Grammatik-ID (126 verschiedene IDs), die übrigen auf Laut, Schrift, Wortschatz oder Pragmatik (Abschnitt in der Spalte „Bezug“). Jede Einheit hat mindestens zwei Tipps.

| Stufe | Einheiten | Tipp-Themen | je Einheit |
|---|---|---|---|
| Vorkurs | 8 | 30 | 3,8 |
| A1 | 12 | 71 | 5,9 |
| A2 | 14 | 69 | 4,9 |
| B1 | 16 | 60 | 3,8 |
| B2 | 16 | 49 | 3,1 |
| C1 | 14 | 28 | 2,0 |
| Σ | 80 | 307 | 3,8 |

**Leitlinien für das Schreiben der Tipps (Phase Ü, PLAN §6.3):**
- **Sprache:** Türkisch als Oberflächensprache, einfach und kurz (§5.3): Titel, höchstens zwei Sätze, ein bis drei arabische Beispiele voll vokalisiert mit `lang="ar"` und `dir="rtl"`. Arabische Schrift nur in `web/inhalte/lernapp/uebersetzung/ar-aus-tr/**` (KERN §3); hier steht Umschrift. Türkische Wörter in türkischer Schreibung.
- **Brücken:** nur weltliche Lehnwörter (§3.2, KD-art-10); gehobene Wörter erst ab B2 und gekennzeichnet (§5.4).
- **Aufbau:** Brücke zuerst („Das kennst du schon: …“), dann der Unterschied. Keine Wertung der Ausgangssprache; „im Arabischen anders“ statt „falsch“.
- **Ort:** Der Tipp erscheint in der genannten Einheit. Nennt er eine Grammatik-ID, ist sie dort oder früher eingeführt (vom Generator geprüft). Vorkurs-Tipps nennen keine Grammatik-ID.
- **Beispiele:** nur Wortschatz bis zur Einheit (PLAN §6.4), nur Namen aus der Namensliste (Leitfaden §1.1), bis B1 kindgeeignet, ohne Tabu-Lexikon und ohne religiöse Formeln (§4.7); in A1–A2 keine Homographe von Religionsbegriffen (OF-ar-04).
- **Schlüssel:** Vorschlag `ar-aus-tr.tipp.<Nr.>`; das Schema legt L3-02 fest.

| Nr. | Einheit | Tipp-Titel | Bezug |
|---|---|---|---|
| 001 | ar.v.l01 | Elifbe-Namen und arabische Namen: elif – alif, be – bāʾ | §5.2 |
| 002 | ar.v.l01 | Von rechts nach links – wie in der Elifbe | §1.1 |
| 003 | ar.v.l01 | Punkte unterscheiden: be, te, se, nun, ye | §1.1 |
| 004 | ar.v.l01 | ǧ ist das türkische c | §1.2 |
| 005 | ar.v.l01 | ṯ ist nicht s: th wie im englischen „think“ | §1.2 |
| 006 | ar.v.l02 | h, ḥ, ḫ: im Türkischen ein h, im Arabischen drei Laute | §1.2 |
| 007 | ar.v.l02 | ʿayn: ein Kehllaut, der im Türkischen verschwunden ist | §1.2 |
| 008 | ar.v.l02 | ḏ, z, ḍ, ẓ: im Türkischen alle z | §1.2 |
| 009 | ar.v.l02 | s, ṣ und ṯ: im Türkischen alle s | §1.2 |
| 010 | ar.v.l02 | q liegt tiefer als k: qāla – kāla | §1.3 |
| 011 | ar.v.l02 | ġ ist ein Reibelaut, kein stummes ğ | §1.2 |
| 012 | ar.v.l03 | Vier Formen je Buchstabe | §1.1 |
| 013 | ar.v.l03 | Sechs Buchstaben verbinden sich nicht nach links | §1.1 |
| 014 | ar.v.l03 | lām-alif: das bekannte lamelif | §5.2 |
| 015 | ar.v.l04 | Fatḥa, Kasra, Ḍamma heißen in der Elifbe üstün, esre, ötre | §5.2 |
| 016 | ar.v.l04 | Fatḥa ist ein a – auch wo man in der Elifbe e liest | §5.2 |
| 017 | ar.v.l04 | Drei Vokale statt acht | §1.2 |
| 018 | ar.v.l05 | Lange Vokale wie â, î, û in Lehnwörtern | §1.2 |
| 019 | ar.v.l05 | ǧamal und ǧamāl: Kamel und Schönheit (Cemal) | §1.3 |
| 020 | ar.v.l05 | ay und aw sprechen: bayt, yawm | §1.2 |
| 021 | ar.v.l06 | Šadda wie in anne, elli, dikkat | §1.2 |
| 022 | ar.v.l06 | Sukūn heißt in der Elifbe cezm | §5.2 |
| 023 | ar.v.l07 | Tanwīn = tenvin: -un, -an, -in | §5.2 |
| 024 | ar.v.l07 | Tāʾ marbūṭa: -a in Pausa – wie -e in kelime | §1.1 |
| 025 | ar.v.l07 | Pausa: Am Satzende fällt die Endung weg | §1.4 |
| 026 | ar.v.l07 | Ziffern: östlich-arabische Formen erkennen | §4.6 |
| 027 | ar.v.l08 | Hamza: ein Knacklaut, der im Türkischen fehlt (mesele ← masʾala) | §1.2 |
| 028 | ar.v.l08 | Sonnenbuchstaben: wie in bizzat und bittabi | §1.1 |
| 029 | ar.v.l08 | al- verbindet sich mit dem Wort davor: fī l-bayt | §1.4 |
| 030 | ar.v.l08 | Am Wortende stimmhaft: kitāb, nicht kitap | §1.2 |
| 031 | ar.a1.e01 | „o“ hat zwei Formen: huwa und hiya | `ar.g.personalpron` |
| 032 | ar.a1.e01 | anta zu Jungen, anti zu Mädchen | `ar.g.personalpron` |
| 033 | ar.a1.e01 | Wie „Ev büyük“: Sätze ohne Verb | `ar.g.nominalsatz` |
| 034 | ar.a1.e01 | öğrenciyim = anā ṭālib – ohne Endung | `ar.g.nominalsatz` |
| 035 | ar.a1.e01 | millî, resmî: Das -î ist die Nisba | `ar.g.nisba` |
| 036 | ar.a1.e01 | merhaba kommt von marḥaban | §3.2 |
| 037 | ar.a1.e01 | ṣabāḥ al-ḫayr: ḫayr heißt „gut“, nicht „nein“ | §3.1 |
| 038 | ar.a1.e01 | luġa ist die Sprache, nicht das Wörterbuch | §3.1 |
| 039 | ar.a1.e02 | Jedes Nomen hat ein Genus | `ar.g.genus` |
| 040 | ar.a1.e02 | -a am Ende = feminin | `ar.g.genus` |
| 041 | ar.a1.e02 | devlet, şirket, kelime sind im Arabischen feminin | `ar.g.genus` |
| 042 | ar.a1.e02 | „Bu bir kalem“ = hāḏā qalam – ohne „bir“ | `ar.g.hinweis` |
| 043 | ar.a1.e02 | hal am Anfang statt mi am Ende | `ar.g.fragepartikel` |
| 044 | ar.a1.e02 | ṣinf ist eine Sorte, keine Schulklasse | §3.1 |
| 045 | ar.a1.e02 | kursī ist ein Stuhl, kein Rednerpult | §3.1 |
| 046 | ar.a1.e02 | ṭālib: Schüler – nicht talip | §3.1 |
| 047 | ar.a1.e03 | „bir“ steckt im Tanwīn | `ar.g.artikel` |
| 048 | ar.a1.e03 | bizzat, bittabi: Sonnenbuchstaben kennst du schon | `ar.g.sonne_mond` |
| 049 | ar.a1.e03 | Adjektiv nach dem Nomen: bayt kabīr (büyük ev) | `ar.g.adjektiv` |
| 050 | ar.a1.e03 | Das Adjektiv passt sich an: sayyāra kabīra | `ar.g.adjektiv` |
| 051 | ar.a1.e03 | manzil ist ein Haus, nicht menzil | §3.1 |
| 052 | ar.a1.e03 | daire heißt im Arabischen šaqqa | §3.1 |
| 053 | ar.a1.e03 | rāḥa ist Ruhe – bequem heißt murīḥ | §3.1 |
| 054 | ar.a1.e04 | Wie evim, evin: baytī, baytuka | `ar.g.suffix_nomen` |
| 055 | ar.a1.e04 | „onun evi“ hat zwei Formen: baytuhu und baytuhā | `ar.g.suffix_nomen` |
| 056 | ar.a1.e04 | ġurfa → ġurfatī: aus -a wird -at- | `ar.g.suffix_nomen` |
| 057 | ar.a1.e04 | Wie bei „var“: kein Verb „haben“ – ʿindī | `ar.g.besitz_inda` |
| 058 | ar.a1.e04 | ʿindī aḫ – nicht ʿindī aḫī | `ar.g.besitz_inda` |
| 059 | ar.a1.e04 | „Kaç yaşındasın?“ → kam ʿumruka? | `ar.g.zahlen_bis_10` |
| 060 | ar.a1.e04 | ʿumr ist das Alter – ömür die Lebenszeit | §3.1 |
| 061 | ar.a1.e04 | amca, dayı, teyze – und die Falle hala | §3.4 |
| 062 | ar.a1.e05 | evde → fī l-bayt: Präposition vorn | `ar.g.praep_ort` |
| 063 | ar.a1.e05 | masanın üstünde → ʿalā ṭ-ṭāwila | `ar.g.praep_ort` |
| 064 | ar.a1.e05 | Wie „Odamda bir yatak var“: der Ort vorn | `ar.g.hunaka` |
| 065 | ar.a1.e05 | Fragewörter immer vorn: ayna l-maḥaṭṭa? | `ar.g.fragewoerter` |
| 066 | ar.a1.e05 | yamīn heißt rechts | §3.1 |
| 067 | ar.a1.e05 | taḥta heißt unter – kein Thron | §3.1 |
| 068 | ar.a1.e06 | Die Person steht vorn am Verb | `ar.g.mudari_sg` |
| 069 | ar.a1.e06 | Ein Präsens für -iyor und -r | `ar.g.mudari_sg` |
| 070 | ar.a1.e06 | taktubīna: zu einem Mädchen | `ar.g.mudari_sg` |
| 071 | ar.a1.e06 | ve kommt von wa | `ar.g.konjunktion` |
| 072 | ar.a1.e06 | faqaṭ heißt „nur“ – „aber“ heißt lākin | `ar.g.konjunktion` |
| 073 | ar.a1.e06 | ṣabāḥ = sabah, aber masāʾ ≠ mesai | §3.1 |
| 074 | ar.a1.e07 | yirmi beş → ḫamsa wa-ʿišrūn: Einer zuerst | `ar.g.zahlen_bis_100` |
| 075 | ar.a1.e07 | evin kapısı → bāb al-bayt: umgekehrt | `ar.g.idafa` |
| 076 | ar.a1.e07 | kīlū ṭamāṭim: wie „bir kilo domates“ | `ar.g.idafa` |
| 077 | ar.a1.e07 | baqqāl: der Lebensmittelhändler wie bakkal | §3.2 |
| 078 | ar.a1.e07 | qiṭʿa: ein Stück, kein Kontinent | §3.1 |
| 079 | ar.a1.e08 | „wir“ hat nur die Vorsilbe na- | `ar.g.mudari_pl` |
| 080 | ar.a1.e08 | -ūna für ihr und sie | `ar.g.mudari_pl` |
| 081 | ar.a1.e08 | -me- wird zu lā vor dem Verb | `ar.g.la_mudari` |
| 082 | ar.a1.e09 | saat = sāʿa, sekiz buçuk = aṯ-ṯāmina wa-n-niṣf | `ar.g.ordinal_uhrzeit` |
| 083 | ar.a1.e09 | Die Stunde ist eine Ordnungszahl | `ar.g.ordinal_uhrzeit` |
| 084 | ar.a1.e09 | laysa = değil, aber vorn | `ar.g.laysa` |
| 085 | ar.a1.e09 | lastu, laysat: laysa hat Personen | `ar.g.laysa` |
| 086 | ar.a1.e09 | fann ist Kunst – fen heißt ʿulūm | §3.1 |
| 087 | ar.a1.e10 | „yazın“ für eine Person gibt es nicht | `ar.g.imperativ` |
| 088 | ar.a1.e10 | gitmek istiyorum → urīdu an aḏhaba | `ar.g.wunsch` |
| 089 | ar.a1.e10 | Allgemeine Vorlieben mit Artikel: uḥibbu l-qahwa | `ar.g.wunsch` |
| 090 | ar.a1.e10 | buyurun = tafaḍḍal | §4.3 |
| 091 | ar.a1.e10 | afiyet olsun → bi-l-hanāʾ wa-š-šifāʾ | §4.3 |
| 092 | ar.a1.e10 | fincan, ibrik: vertraute Wörter am Tisch | §3.2 |
| 093 | ar.a1.e11 | beyaz kommt von bayāḍ | `ar.g.farben` |
| 094 | ar.a1.e11 | Farben haben eine eigene weibliche Form | `ar.g.farben` |
| 095 | ar.a1.e11 | hava: Luft (hawāʾ) oder Wetter (ṭaqs) | §3.1 |
| 096 | ar.a1.e11 | ṣafrāʾ heißt gelb, nicht Galle | §3.1 |
| 097 | ar.a1.e12 | kitap, kâtip, mektup: die Wurzel k-t-b kennst du | `ar.g.wurzel` |
| 098 | ar.a1.e12 | hesap und muhasebe: die Wurzel ḥ-s-b | `ar.g.wurzel` |
| 099 | ar.a1.e12 | Im Wörterbuch nach der Wurzel suchen | `ar.g.wurzel` |
| 100 | ar.a1.e12 | geçmiş olsun → šifāʾan ʿāǧilan | §4.3 |
| 101 | ar.a1.e12 | Kein Hilfsvokal: fikr, ʿaql, ism | §1.2 |
| 102 | ar.a2.e01 | Wie bei yazdım: Die Person steht hinten | `ar.g.madi_sg` |
| 103 | ar.a2.e01 | katabti zu einem Mädchen | `ar.g.madi_sg` |
| 104 | ar.a2.e01 | hastaydım → kuntu marīḍan | `ar.g.kana_war` |
| 105 | ar.a2.e01 | taḏkira ist die Fahrkarte | §3.1 |
| 106 | ar.a2.e01 | gitmek und binmek: ḏahaba und rakiba | §3.4 |
| 107 | ar.a2.e02 | yazdık, yazdınız, yazdılar → katabnā, katabtum, katabū | `ar.g.madi_pl` |
| 108 | ar.a2.e02 | yazmadım → mā katabtu oder lam aktub | `ar.g.lam_jussiv` |
| 109 | ar.a2.e02 | lam + Präsensform ohne Endvokal | `ar.g.lam_jussiv` |
| 110 | ar.a2.e02 | risāla ist ein Brief, maktūb heißt „geschrieben“ | §3.1 |
| 111 | ar.a2.e03 | Şubat, Nisan, Haziran, Temmuz, Eylül in der zweiten Monatsreihe | `ar.g.datum` |
| 112 | ar.a2.e03 | al-ʿāšir min abrīl: Datum mit min | `ar.g.datum` |
| 113 | ar.a2.e03 | Wie „Nadiye Hanım“: Titel und Vorname | `ar.g.anrede` |
| 114 | ar.a2.e03 | siz für eine Person gibt es nicht | `ar.g.anrede` |
| 115 | ar.a2.e03 | ʿunwān ist die Adresse – unvan heißt laqab | §3.1 |
| 116 | ar.a2.e03 | šahr ist ein Monat, keine Stadt | §3.1 |
| 117 | ar.a2.e03 | ǧawāz as-safar: der Pass | §3.1 |
| 118 | ar.a2.e04 | -ecek wird zu sa-: sa-aḏhabu | `ar.g.sa_sawfa` |
| 119 | ar.a2.e04 | gitmeyeceğim → lan aḏhaba | `ar.g.sa_sawfa` |
| 120 | ar.a2.e04 | -mek için → li- + Verb mit Person | `ar.g.mansub` |
| 121 | ar.a2.e04 | musāfir ist ein Reisender, kein Gast | §3.1 |
| 122 | ar.a2.e04 | Ferien heißen ʿuṭla, nicht tatil | §3.1 |
| 123 | ar.a2.e04 | maṭār: der Flughafen | §3.1 |
| 124 | ar.a2.e05 | hayvanat, malumat: -āt kennst du | `ar.g.plural_gesund` |
| 125 | ar.a2.e05 | -ūn nur für Männer | `ar.g.plural_gesund` |
| 126 | ar.a2.e05 | Wie „Kitaplar masada duruyor“: Sachen im Plural mit Einzahl | `ar.g.kongruenz_unbelebt` |
| 127 | ar.a2.e05 | musāʿada heißt Hilfe, nicht Erlaubnis | §3.1 |
| 128 | ar.a2.e05 | ġāliban: meistens, nicht galiba | §3.1 |
| 129 | ar.a2.e05 | ʿādatan: normalerweise, nicht âdeta | §3.1 |
| 130 | ar.a2.e06 | min = -den: akbar min Yazan | `ar.g.komparativ` |
| 131 | ar.a2.e06 | „daha“ steckt in der Form afʿal | `ar.g.komparativ` |
| 132 | ar.a2.e06 | Auch das unbestimmte Objekt bekommt -an | `ar.g.akkusativ` |
| 133 | ar.a2.e06 | tamamen, mesela: -en ist das arabische -an | `ar.g.akkusativ` |
| 134 | ar.a2.e06 | maḥall: der Laden | §3.1 |
| 135 | ar.a2.e06 | kumaş = qumāš | §3.2 |
| 136 | ar.a2.e07 | evlat, eşya, evrak sind im Arabischen Plurale | `ar.g.plural_gebrochen` |
| 137 | ar.a2.e07 | Ein Kind: walad, viele: awlād | `ar.g.plural_gebrochen` |
| 138 | ar.a2.e07 | Verb am Anfang, nicht am Ende | `ar.g.verbalsatz_kongruenz` |
| 139 | ar.a2.e08 | beni → -nī am Verb | `ar.g.objektsuffix` |
| 140 | ar.a2.e08 | bana, ona → lī, lahu | `ar.g.praep_suffix` |
| 141 | ar.a2.e08 | ʿilāǧ ist Behandlung – ilaç heißt dawāʾ | §3.1 |
| 142 | ar.a2.e08 | ḥāl und ḫāl: Zustand und Onkel | §1.3 |
| 143 | ar.a2.e09 | yazma! → lā taktub! | `ar.g.verbot_jussiv` |
| 144 | ar.a2.e09 | lazım kommt von lāzim | `ar.g.notwendigkeit` |
| 145 | ar.a2.e09 | yaǧibu an: die Person im zweiten Verb | `ar.g.notwendigkeit` |
| 146 | ar.a2.e09 | Hausaufgabe: wāǧib – waẓīfa ist eine Stelle | §3.1 |
| 147 | ar.a2.e09 | ḥāḍir: anwesend – fertig heißt ǧāhiz | §3.1 |
| 148 | ar.a2.e10 | Wie „on yıldır“: munḏu mit Präsens | `ar.g.praep_zeit` |
| 149 | ar.a2.e10 | munḏu steht vor der Zeitangabe | `ar.g.praep_zeit` |
| 150 | ar.a2.e10 | çünkü → li-anna mit Pronomen | `ar.g.li_anna` |
| 151 | ar.a2.e10 | ʿamma und ḫāla: die Tanten beider Seiten | §3.4 |
| 152 | ar.a2.e11 | mektup, meşgul, memnun: das Muster mafʿūl | `ar.g.partizip1` |
| 153 | ar.a2.e11 | sākin: im Kurs meist „wohnend“ – für „ruhig“ meist hādiʾ | `ar.g.partizip1` |
| 154 | ar.a2.e11 | tuffāḥ und tuffāḥa: elma und bir elma | `ar.g.kollektiv` |
| 155 | ar.a2.e11 | šaǧara ist ein Baum, kein Stammbaum | §3.1 |
| 156 | ar.a2.e12 | okuma → al-qirāʾa | `ar.g.verbalnomen` |
| 157 | ar.a2.e12 | ziyaret kommt von ziyāra | `ar.g.verbalnomen` |
| 158 | ar.a2.e12 | mümkün = mumkin | `ar.g.koennen` |
| 159 | ar.a2.e12 | -ebil → astaṭīʿu an | `ar.g.koennen` |
| 160 | ar.a2.e12 | maʿāš ist die Rente – Gehalt heißt rātib | §3.1 |
| 161 | ar.a2.e12 | rasm: das Zeichnen | §3.1 |
| 162 | ar.a2.e13 | bazı = baʿḍ, gayri = ġayr | `ar.g.quantoren` |
| 163 | ar.a2.e13 | kull yawm = her gün | `ar.g.quantoren` |
| 164 | ar.a2.e13 | „Ne güzel!“ → mā aǧmala …! | `ar.g.ausruf` |
| 165 | ar.a2.e13 | hediye = hadiyya | §3.2 |
| 166 | ar.a2.e13 | tebrikler → mabrūk | §4.3 |
| 167 | ar.a2.e14 | Jahreszahlen wie im Türkischen – nur Einer vor Zehner | `ar.g.zahlen_gross` |
| 168 | ar.a2.e14 | maṣraf ist die Bank – Kosten heißen nafaqāt | §3.1 |
| 169 | ar.a2.e14 | hesap = ḥisāb | §3.2 |
| 170 | ar.a2.e14 | maalesef = maʿa l-asaf | §4.3 |
| 171 | ar.b1.e01 | oynardım → kuntu alʿabu | `ar.g.kana_mudari` |
| 172 | ar.b1.e01 | -mişti → kāna qad | `ar.g.kana_mudari` |
| 173 | ar.b1.e01 | qāla – qultu | `ar.g.verb_hohl` |
| 174 | ar.b1.e02 | talim, tedris: Stamm II | `ar.g.stamm2` |
| 175 | ar.b1.e02 | Die Šadda in ʿallama | `ar.g.stamm2` |
| 176 | ar.b1.e02 | yardımlaştık → taʿāwannā | `ar.g.stamm5_6` |
| 177 | ar.b1.e02 | teşekkür = tašakkur (Stamm V) | `ar.g.stamm5_6` |
| 178 | ar.b1.e02 | afkār sind Gedanken – efkâr ist Wehmut | §3.1 |
| 179 | ar.b1.e03 | gördüğümüz daire → aš-šaqqa llatī raʾaynāhā | `ar.g.relativ` |
| 180 | ar.b1.e03 | Das -hā am Ende verweist zurück | `ar.g.relativ` |
| 181 | ar.b1.e03 | Nach unbestimmtem Nomen kein allatī | `ar.g.relativ` |
| 182 | ar.b1.e03 | mekân, merkez, mutfak: Ortsnomen | `ar.g.ortsnomen` |
| 183 | ar.b1.e03 | kirāʾ = kira | §3.2 |
| 184 | ar.b1.e04 | iki kitap → kitābāni | `ar.g.dual` |
| 185 | ar.b1.e04 | üç gün → ṯalāṯat ayyām: Plural | `ar.g.zahl_tamyiz` |
| 186 | ar.b1.e04 | Ab 11 wieder Einzahl | `ar.g.zahl_tamyiz` |
| 187 | ar.b1.e04 | funduq heißt Hotel | §3.1 |
| 188 | ar.b1.e05 | yamšī – lam yamši | `ar.g.verb_defekt` |
| 189 | ar.b1.e05 | mesele → masʾala: die Hamza sprechen | `ar.g.verb_hamza` |
| 190 | ar.b1.e05 | kul und ḫuḏ | `ar.g.verb_hamza` |
| 191 | ar.b1.e06 | ilan, ikram, ikamet: Stamm IV | `ar.g.stamm4` |
| 192 | ar.b1.e06 | yursilu: u- im Präsens | `ar.g.stamm4` |
| 193 | ar.b1.e06 | waǧada – yaǧidu | `ar.g.verb_assimiliert` |
| 194 | ar.b1.e07 | ihtiyaç, ihtimal, itiraz: Stamm VIII | `ar.g.stamm7_8` |
| 195 | ar.b1.e07 | istirahat, istifade: Stamm X | `ar.g.stamm10` |
| 196 | ar.b1.e07 | istiqbāl ist Empfang – Zukunft heißt mustaqbal | `ar.g.stamm10` |
| 197 | ar.b1.e07 | ǧihāz: Gerät, nicht Aussteuer | §3.1 |
| 198 | ar.b1.e08 | müsaade, münakaşa, müracaat: Stamm III mit anderer Bedeutung | `ar.g.stamm3` |
| 199 | ar.b1.e08 | munāqaša: Besprechung, kein Streit | §3.1 |
| 200 | ar.b1.e08 | „Biliyorum ki …“ → aʿrifu anna … | `ar.g.anna_dass` |
| 201 | ar.b1.e08 | annaka: Das Pronomen hängt an | `ar.g.anna_dass` |
| 202 | ar.b1.e09 | -ince, -ken → ʿindamā, baynamā | `ar.g.temporalsatz` |
| 203 | ar.b1.e09 | lammā + Vergangenheit | `ar.g.temporalsatz` |
| 204 | ar.b1.e09 | hak – hakkım: der doppelte Konsonant | `ar.g.verb_verdoppelt` |
| 205 | ar.b1.e09 | başınız sağ olsun → aḥarr at-taʿāzī | §4.3 |
| 206 | ar.b1.e10 | Drei Fälle: yalın hal, -i hali, -in hali | `ar.g.irab` |
| 207 | ar.b1.e10 | -e, -de, -den werden Präpositionen | `ar.g.irab` |
| 208 | ar.b1.e10 | abūka, abāka, abīka | `ar.g.fuenf_nomen` |
| 209 | ar.b1.e11 | Tūnis → min Tūnisa | `ar.g.diptota` |
| 210 | ar.b1.e11 | yazsın → li-yaktub | `ar.g.modi_ueberblick` |
| 211 | ar.b1.e11 | murāǧaʿa: Überprüfung, kein Antrag | §3.1 |
| 212 | ar.b1.e11 | ḥālan heißt sofort, nicht halen | §3.1 |
| 213 | ar.b1.e12 | müdür, mühendis, mütercim: Partizipien mit mu- | `ar.g.partizip_abgeleitet` |
| 214 | ar.b1.e12 | mustaʿmil – mustaʿmal | `ar.g.partizip_abgeleitet` |
| 215 | ar.b1.e12 | qad: çoktan oder belki | `ar.g.qad` |
| 216 | ar.b1.e13 | daha temiz → akṯar naẓāfatan | `ar.g.elativ_umschreibung` |
| 217 | ar.b1.e13 | raʾā – yarā | `ar.g.verb_doppelt_schwach` |
| 218 | ar.b1.e13 | nebatat: der Plural -āt bei Pflanzen | `ar.g.plural_gesund` |
| 219 | ar.b1.e14 | -iyet = -iyya: insaniyet, hürriyet | `ar.g.nisba_abstrakt` |
| 220 | ar.b1.e14 | kolay değil, eğlenceli → laysa sahlan bal mumtiʿ | `ar.g.satzverbindung` |
| 221 | ar.b1.e14 | ne … ne → lā … wa-lā | `ar.g.satzverbindung` |
| 222 | ar.b1.e14 | kahrabāʾ: Strom, nicht Bernstein | §3.1 |
| 223 | ar.b1.e15 | gelip gelmediğini → hal … | `ar.g.indirekte_frage` |
| 224 | ar.b1.e15 | Bewerbung: Anrede mit Titel | §4.5 |
| 225 | ar.b1.e15 | ṭalab = talep | §3.2 |
| 226 | ar.b1.e16 | tafaḍḍal, tafaḍḍalī, tafaḍḍalū | `ar.g.hoeflichkeit` |
| 227 | ar.b1.e16 | müsaadenizle → law samaḥt | `ar.g.hoeflichkeit` |
| 228 | ar.b1.e16 | rica ederim → ʿafwan | `ar.g.hoeflichkeit` |
| 229 | ar.b1.e16 | ḍayf ist der Gast | §3.1 |
| 230 | ar.b1.e16 | iki bardak → kūbāni | `ar.g.dual` |
| 231 | ar.b2.e01 | Statt -il-: andere Vokale – kutiba | `ar.g.passiv_madi` |
| 232 | ar.b2.e01 | kabul edildi → tamma l-qabūl | `ar.g.passiv_mudari` |
| 233 | ar.b2.e01 | ḫabar = haber | §3.2 |
| 234 | ar.b2.e02 | mā zāla = hâlâ | `ar.g.kana_schwestern` |
| 235 | ar.b2.e02 | ṣāra ṭāliban: Akkusativ nach „oldu“ | `ar.g.kana_schwestern` |
| 236 | ar.b2.e02 | -se → in oder iḏā am Anfang | `ar.g.bedingung_real` |
| 237 | ar.b2.e02 | šarṭ = şart | `ar.g.bedingung_real` |
| 238 | ar.b2.e02 | iḫtiyār ist eine Wahl, nicht ihtiyar | §3.1 |
| 239 | ar.b2.e02 | ǧāmiʿa ist die Universität – camia heißt Gemeinschaft | §3.1 |
| 240 | ar.b2.e03 | sanki, keşke, belki → kaʾanna, layta, laʿalla | `ar.g.inna_schwestern` |
| 241 | ar.b2.e03 | Das Subjekt nach inna steht im Akkusativ | `ar.g.inna_schwestern` |
| 242 | ar.b2.e03 | illā heißt „außer“, nicht „unbedingt“ | `ar.g.istithna` |
| 243 | ar.b2.e03 | hariç kommt von ḫāriǧ | `ar.g.istithna` |
| 244 | ar.b2.e04 | gülümseyerek → mubtasiman | `ar.g.hal` |
| 245 | ar.b2.e04 | yürümeye başladı → badaʾa yamšī | `ar.g.anfangsverben` |
| 246 | ar.b2.e04 | ʿamaliyya: auch die Operation | §3.1 |
| 247 | ar.b2.e05 | tebrik, müzakere, ilan, teşekkür: Maṣdar-Muster | `ar.g.masdar_formen` |
| 248 | ar.b2.e05 | mastar kommt von maṣdar | `ar.g.masdar_formen` |
| 249 | ar.b2.e05 | šakarnāhum šukran ǧazīlan | `ar.g.mafuul_mutlaq` |
| 250 | ar.b2.e06 | pasaportun yenilenmesi → taǧdīd ǧawāz as-safar | `ar.g.masdar_satz` |
| 251 | ar.b2.e06 | gayri und adem: ġayr und ʿadam | `ar.g.verneinung_ueberblick` |
| 252 | ar.b2.e06 | ikamet = iqāma | §3.2 |
| 253 | ar.b2.e07 | olsaydım … binerdim → law kuntu … la-rakibtu | `ar.g.bedingung_irreal` |
| 254 | ar.b2.e07 | yüzde yirmi → ʿišrūna fī l-miʾa | `ar.g.brueche_prozent` |
| 255 | ar.b2.e07 | kesir kommt von kasr | `ar.g.brueche_prozent` |
| 256 | ar.b2.e07 | taṣarruf ist Verhalten – sparen heißt tawfīr | §3.1 |
| 257 | ar.b2.e07 | ṭāqa: Energie | §3.1 |
| 258 | ar.b2.e08 | rağmen = raġma, aber vorn | `ar.g.konzessiv` |
| 259 | ar.b2.e08 | akṯar amānan: daha güvenli | `ar.g.tamyiz` |
| 260 | ar.b2.e09 | saygıdan → iḥtirāman | `ar.g.mafuul_lahu` |
| 261 | ar.b2.e09 | „X ise …“ → ammā X fa-… | `ar.g.textverbinder` |
| 262 | ar.b2.e09 | ammā ist nicht ama | `ar.g.textverbinder` |
| 263 | ar.b2.e10 | kim isterse → man yurīd | `ar.g.relativ_man_ma` |
| 264 | ar.b2.e10 | -memek için → li-allā | `ar.g.zweck_negativ` |
| 265 | ar.b2.e11 | -ecekti → kāna sa- | `ar.g.zeitenfolge` |
| 266 | ar.b2.e11 | ödemişti → kāna qad dafaʿa | `ar.g.zeitenfolge` |
| 267 | ar.b2.e11 | Konu → al-mawḍūʿ (mevzu) | `ar.g.briefform` |
| 268 | ar.b2.e11 | muhterem → al-muḥtaram | `ar.g.briefform` |
| 269 | ar.b2.e12 | yirmi birinci yüzyıl → al-qarn al-ḥādī wa-l-ʿišrūn | `ar.g.ordinal_gross` |
| 270 | ar.b2.e12 | atalarımız gibi → miṯla aǧdādinā | `ar.g.vergleichssatz` |
| 271 | ar.b2.e12 | ṣanʿa ist Handwerk – Kunst heißt fann | §3.1 |
| 272 | ar.b2.e13 | mesele, sual: die Hamza schreiben | `ar.g.hamza_schreibung` |
| 273 | ar.b2.e13 | Türkisch, Deutsch, Arabisch: Lehnwörter in drei Sprachen | §5.5 |
| 274 | ar.b2.e14 | zaruri, mümkün → min aḍ-ḍarūrī, min al-mumkin | `ar.g.modalausdruecke` |
| 275 | ar.b2.e14 | belediye = baladiyya | §3.2 |
| 276 | ar.b2.e15 | dedi ki → qāla inna | `ar.g.indirekte_rede` |
| 277 | ar.b2.e15 | ṣaḥāfa ist die Presse – kein sahaf | §3.1 |
| 278 | ar.b2.e16 | kullanımı kolay → sahl al-istiʿmāl | `ar.g.unechte_idafa` |
| 279 | ar.b2.e16 | Vortrag in Fuṣḥā: gehobene Lehnwörter als Hilfe | §5.4 |
| 280 | ar.c1.e01 | Wie „-mesini sağladı“: der Nominalstil | `ar.g.nominalstil` |
| 281 | ar.c1.e01 | şirket = šarika | §3.2 |
| 282 | ar.c1.e02 | mucibince = bi-mūǧib | `ar.g.amtssprache` |
| 283 | ar.c1.e02 | itibaren = iʿtibāran min | `ar.g.amtssprache` |
| 284 | ar.c1.e03 | naqlan ʿan heißt „zitiert nach“ – nicht naklen | `ar.g.berichtsstil` |
| 285 | ar.c1.e03 | bi-ḥasab: laut | `ar.g.berichtsstil` |
| 286 | ar.c1.e04 | muhtemelen = min al-muḥtamal | `ar.g.vermutung` |
| 287 | ar.c1.e04 | galiba → rubbamā oder yabdū anna | `ar.g.vermutung` |
| 288 | ar.c1.e05 | Ketten von vorn lesen | `ar.g.idafa_ketten` |
| 289 | ar.c1.e05 | Nur das letzte Glied mit Artikel | `ar.g.idafa_ketten` |
| 290 | ar.c1.e06 | binaenaleyh = bi-nāʾan ʿalayhi | `ar.g.argumentation` |
| 291 | ar.c1.e06 | bilakis = bi-l-ʿaks | `ar.g.argumentation` |
| 292 | ar.c1.e07 | ḥāsūb und hesap: eine Wurzel | `ar.g.wortbildung_modern` |
| 293 | ar.c1.e07 | bilgisayar oder ḥāsūb: zwei Wege zu neuen Wörtern | `ar.g.wortbildung_modern` |
| 294 | ar.c1.e08 | Das Betonte ganz nach vorn | `ar.g.hervorhebung` |
| 295 | ar.c1.e08 | hiç → qaṭṭ, asla → abadan | `ar.g.verneinung_stil` |
| 296 | ar.c1.e09 | nafs vorn = aynı, hinten = kendisi | `ar.g.tawkid_badal` |
| 297 | ar.c1.e09 | Mitglieder alle: al-aʿḍāʾ kulluhum | `ar.g.tawkid_badal` |
| 298 | ar.c1.e10 | „Bir elin nesi var …“ → yad wāḥida lā tuṣaffiq | `ar.g.redewendungen` |
| 299 | ar.c1.e10 | maṯal ist ein Sprichwort – Märchen heißt ḥikāya | §3.1 |
| 300 | ar.c1.e11 | velhasıl, kısacası → ḫulāṣat al-qawl | `ar.g.paraphrase` |
| 301 | ar.c1.e11 | dustūr ist die Verfassung, nicht düstur | §3.1 |
| 302 | ar.c1.e12 | büyük küçük → ṣiġāran wa-kibāran | `ar.g.stilmittel` |
| 303 | ar.c1.e12 | Rhetorische Frage mit a-laysa | `ar.g.stilmittel` |
| 304 | ar.c1.e13 | Fuṣḥā und Umgangssprache: weiter auseinander als im Türkischen | `ar.g.register` |
| 305 | ar.c1.e13 | lehçe = lahǧa | §3.2 |
| 306 | ar.c1.e14 | Gehobene türkische Wörter als Brücke | §5.4 |
| 307 | ar.c1.e14 | Rückblick: Lehnwörter auf ihre Bedeutung prüfen | §3.1 |

## 7 Messwerte und Methode

| Messung | Wert | Quelle und Methode |
|---|---|---|
| Genus arabischer Nomen (Top-1.000 / Top-2.000 Nomen der Lemma-Rangliste) | feminin 36,7 / 34,9 %, maskulin 63,3 / 65,1 % (965 / 1.938 Nomen mit eindeutigem Genus) | Rangliste des Rahmen-Generators (wordfreq 3.1.1 und CAMeL MSA v1.0, Rangmittel), Genus aus dem kaikki-Kern (Ausgabe en) |
| Nomen auf -a (Tāʾ marbūṭa) und Genus | 99,4 / 99,5 % feminin (324 / 618 Nomen) | dto.; Endung an der kanonischen Form geprüft |
| Feminine Nomen ohne -a (umm, bint, šams, arḍ …) | 9,0 / 9,0 % der femininen Nomen (32 / 61) | dto. |
| Artikel vor Sonnenbuchstaben | 32,5 % der 2.974 Wortformen mit al- unter den Top 10.000 (nach Häufigkeit gewichtet 31,8 %) | wordfreq 3.1.1 (ar), Formen ohne Harakat; Wörter, in denen al- zum Stamm gehört, ausgenommen (Schätzung) |
| Arabische Lemmata mit türkischem Gegenstück ähnlicher Form und Bedeutung (Top-500 / 1.000 / 2.000, ohne Funktionswörter) | 25,6 % / 24,7 % / 21,2 % (128 / 247 / 424); in einer Durchsicht der Top-500-Treffer etwa 13 % Fehlzuordnungen, also rund ein Fünftel | Konsonantengerippe nach den Lautregeln §3.2 gegen türkische Lemmata (kaikki-Kern, wordfreq tr Top 20.000) und gemeinsames englisches Glossenwort (Schätzung) |
| Tatoeba tr↔ar: türkische Sätze mit var/yok und arabische Entsprechung | ʿind- 20, hunāka 16, yūǧad 10, ladā 5, anders 89 (von 140) | Tatoeba-Export vom 10.10.2026, Paare tr↔ar (Beleg S7 §3.2); „anders“: lī/laka, maʿa, Verben, Sätze ohne Verb |
| Tatoeba tr↔ar: türkische Fragen mit mi und arabische Übersetzung mit hal | 119 von 163 (73,0 %) | dto. |
| Glossen in der Ausgangssprache (Top-1.000 / Top-5.000 arabische Wörter) | 81 % / 66 % | Beleg S7 §3.6 |

**Methode.**
- Gelesen wurden nur die S7-Auszüge im Scratchpad (`l0/S7/auszug/`: Häufigkeit, kaikki-Kern, Tatoeba) und die Lemma-Rangliste des Rahmen-Generators (`l3-rahmen-ar/rang_ar_neu.json`), mit `python3 -I`.
- Skripte: `l3-kontrast-ar/messen.py` (Messungen) und `l3-kontrast-ar/bauen.py` (Generator und Prüfungen), beide im Scratchpad der Sitzung; Übernahme nach `_lernapp/werkzeuge/` in L3. Arabische Muster stehen dort als Codepunkte.
- In dieses Dokument gelangen nur Zahlen und Beispiele in Lateinschrift bzw. Umschrift; kein Tatoeba-Satz und kein Wiktionary-Text.
- Die Werte sind Schätzungen über Wortformen und Umschrift; sie zeigen die Größenordnung, nicht die genaue Zahl.

## 8 Zu prüfen und offene Fragen

Alle laufen mit ihrem Standard weiter (L3-E12, kein Warten).

| ID | Frage | Standard | Wer |
|---|---|---|---|
| KD-art-01 | Typische Fehler (§2) sind Erfahrungswerte, nicht gemessen. | Die Muttersprachler-Stichprobe und Meldungen aus der App (ADR 0041 Nr. 9) schärfen sie nach. | L3, LM-01 |
| KD-art-02 | Elifbe-Tradition: Fatḥa nach „dünnen“ Buchstaben als e, nach „dicken“ als a gelesen – trifft das auf die Gemeinde zu? | Hinweis nur im Vorkurs, ohne Wertung | Lehrkraft der Gemeinde, LM-01 |
| KD-art-03 | Reihenfolge der Buchstaben in der türkischen Elifbe (vav vor he) | Hinweis nur nach Bestätigung | Lehrkraft der Gemeinde |
| KD-art-04 | Umschrift in Tipps der türkischen Oberfläche: DIN 31635 oder türkisch angelehnt (c, ş, h)? | arabische Schrift voll vokalisiert; Umschrift nur im Vorkurs, türkisch angelehnt (Vorschlag) | LM-02, L2 |
| KD-art-05 | Kennen Herkunftssprachler die türkischen Wörter der falschen Freunde (efkâr, âdeta, galiba, müzakere, münakaşa, sahaf, düstur, naklen, seyyar, menzil, halef)? | Tipps mit gehobenen Wörtern erst ab B2 und nie als einzige Erklärung | LM-01 |
| KD-art-06 | Herkunft einzelner Lehnwörter (z. B. şifre ← ṣifr, sayfa ← ṣaḥīfa, mavi) | nur Wörter mit gesicherter Herkunft als Brücke; Liste prüfen | L3, LM-01 |
| KD-art-07 | Plural als Höflichkeitsform zu einer Person (antum) | nicht lehren; zu einer Person immer Einzahl | LM-01 |
| KD-art-08 | Verwandtschaftswörter als Anrede für Bekannte (ʿammū, ḫāla, aḫī, uḫtī) | als Hinweis „regional“, kein Lernziel | LM-01 |
| KD-art-09 | Absagen und Angebote: Tipps ohne Verallgemeinerung über Gewohnheiten? | Tipps beschreiben nur Sprachformen | Redaktion, LM-09 |
| KD-art-10 | Brückenwörter: Viele türkische Wörter arabischer Herkunft sind religiös geprägt. | nur weltliche Brücken; die Liste §3.2 prüft die Redaktion vor dem Entwurf | Redaktion, LM-09 |
| KD-art-11 | Weltliche Entsprechung zu „Kolay gelsin“ im Hocharabischen | keine; Tipp nur, wenn eine weltliche Wendung bestätigt ist | LM-01, LM-09 |
| KD-art-12 | Hörpaare mit seltenen Wörtern (kāla, rākid, zayf, ṭall) | nur in `minimalpaare`, außerhalb des Lemma-Budgets und ohne Prüfstein | LM-01, L3 |
| KD-art-13 | Betonungsregeln (§1.4) unterscheiden sich regional. | kein Pflichttipp; Hörbeispiele tragen die Betonung | LM-01, LM-06 |
| KD-art-14 | Sprichwort-Paare (yad wāḥida lā tuṣaffiq ≈ „Bir elin nesi var, iki elin sesi var“) | nur weltliche Wendungen aus der Liste der Redaktion (OF-ar-12) | Redaktion, LM-09 |
| KD-art-15 | Halbe Freunde mit regionaler Bedeutung (muḏākara, dawām, waẓīfa) | „regional“ bzw. „teilweise“ markieren; Bestätigung durch Muttersprachler | LM-01 |

## 9 Herkunft und Prüfungen

- **Entwurf:** KI-Lauf `ki:l3-kontrast-ar` am 20.10.2026 (L3-01, vorgezogen), auf Grundlage des Rahmenplans Hocharabisch (Entwurf 1.0.0) und des Inhaltsleitfadens.
- **Eigene Darstellung:** Keine fremden Lehrwerke oder Kontrastgrammatiken übernommen; GER nur als Stufen (ADR 0045 Nr. 8, LM-36).
- **Automatische Prüfungen des Generators:**
  - alle 126 Grammatik-IDs des Rahmenplans genau einmal in §2
  - jeder Tipp auf einem gültigen Einheiten-Schlüssel, nach Einheit sortiert; jede Einheit mit mindestens zwei Tipps; Grammatik-Bezug nie vor seiner Einführung, im Vorkurs keiner; Abschnittsbezüge vorhanden; keine doppelten Tipp-Titel
  - Tabu-Lexikon des Leitfadens (de, tr, ar-Umschrift): 0 echte Treffer; Fehlalarme: „lan“ (tr, Fluchen) als arabische Verneinungspartikel lan (13); „parti“ (tr, Politik) in Partizip und Partikel (14)
  - 0 arabische Zeichen (U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF)
  - Religionswörter nur in den Regelabschnitten (KI-Regel 2, §4.7, Verweise auf den getrennten Pfad und auf Kandidaten): „koran“ (1), „religi“ (16)
- **Menschliche Prüfung:** Stichprobe der Muttersprachler (LM-01) mit den Punkten aus §8; Abnahme zusammen mit dem Rahmenplan (LM-02).
