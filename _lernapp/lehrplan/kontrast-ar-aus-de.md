# Kontrastdokument Hocharabisch aus Deutsch (`ar-aus-de`)

- **Stand:** 20.10.2026, Version 0.1.0-entwurf (L3-01, vorgezogen)
- **Status:** Entwurf. Er gilt als Standard für die kontrastiven Tipps, Ablenker und angenommenen Antworten der Richtung `ar-aus-de`, bis die Muttersprachler-Stichprobe (LM-01) und die Abnahme des Rahmenplans (LM-02) andere Ergebnisse bringen.
- **Zweck:** Grundlage für die Phase Ü (Übersetzung je Richtung) der Inhalts-Pipeline (PLAN §6.3) und für die ≈ 300 kontrastiven Tipps je Richtung (PLAN §5.1). Ablage nach PLAN §6.1.
- **Bezug:**
  - Rahmenplan Hocharabisch: `web/inhalte/lernapp/rahmen/ar.rahmen.json`, `RAHMEN-ar.md` §4 (Vorkurs), §5 (Grammatikfolge), §14 Nr. 4 (Schwerpunkte dieses Dokuments)
  - PLAN §4 (Übungstypen, `schrift_ar`, `minimalpaare`, `harakat`, Antwortabgleich §4.1), §5.1, §6.1–§6.4
  - KERN §2 (KI-Regel 2), §3 (arabische Schrift nur in freigegebenen Dateien), §5 (Kinderschutz), §7 (Oberfläche)
  - Inhaltsleitfaden `_lernapp/lehrplan/INHALTSLEITFADEN.md` (Tabu-Lexikon, Namen, Formel-Kandidaten §4.2, weltliche Alternativen §4.3)
  - Beleg S7 (`_lernapp/belege/S7-sprachdaten.md`), ADR 0041, ADR 0045 (Nr. 8: GER nur als Stufen)
- **Gegenstück:** `_lernapp/lehrplan/kontrast-ar-aus-tr.md`; Gegenrichtung `kontrast-de-aus-ar.md`
- **Umfang:** 126 Grammatik-IDs mit Kontrast (§2), 23 falsche und halbe Freunde (§3.1), 306 Tipp-Themen auf 80 Einheiten-Schlüssel (§6).

> **KI-Regel 2 (ADR 0040, KERN §2):** Keine Koranverse, Hadithe, Bittgebete oder anderen religiösen Texte (weder arabisch
> noch übersetzt), keine Koran-Wortbedeutungen, keine Fiqh-Aussagen. Der Sprachkurs ist ohne Religionsbezug. Religiöse Formeln
> gibt es nur aus einer später von zwei Gelehrten freigegebenen Liste; hier stehen sie nur als Verweis auf die gesperrten
> Kandidaten des Leitfadens (§4.7), nie als Lernziel. Arabische Schrift ist in dieser Datei verboten: Arabisch steht nur in
> Umschrift (DIN 31635 vereinfacht).

**Lesart.**
- „Arabisch“ meint das moderne Hocharabisch (Fuṣḥā), wie der Kurs es lehrt: voll vokalisiert, am Satzende in Pausa. Wo eine Umgangssprache anders ist, steht das ausdrücklich da („dialektal“, mit Region).
- Arabische Wörter stehen in Umschrift nach DIN 31635 (vereinfacht wie im Rahmenplan), deutsche Beispiele in normaler Schreibung. Fallendungen stehen nur dort, wo sie Gegenstand sind.
- In der Spalte „typischer Fehler“ stehen fehlerhafte Formen in „…“. Sie sind Material für Ablenker und für den Abgleich (PLAN §4.1), nie Musterlösung.
- „Vertraut“ markiert eine Brücke: Das Deutsche kennt die Sache schon. Tipps nennen die Brücke zuerst.
- Aufgenommen sind nur Kontraste, die sicher sind. Was die Stichprobe bestätigen soll, trägt „zu prüfen“ und steht zusätzlich in §8.

**Wer lernt.** Deutschsprachige jeden Alters, die in Wetzlar und Umgebung leben: Kinder ab etwa zehn, Jugendliche, Eltern und Ältere. Die meisten beginnen ohne Vorwissen mit dem Vorkurs `ar.v.l01`–`ar.v.l08`. Dazu kommen Kinder und Jugendliche aus arabischsprachigen Familien, die Deutsch besser lesen als Arabisch (§5.2), und Lernende mit Elifbe-Vorwissen. Wer religiöse Texte verstehen möchte, findet dafür den getrennten Pfad „Koran-Arabisch“; dieses Dokument und der Sprachkurs behandeln das nicht.

## 0 Kurzfassung

- **Schrift zuerst:** Die arabische Schrift läuft von rechts nach links, verbindet die Buchstaben und schreibt kurze Vokale nur als Zeichen. Der Vorkurs `ar.v.l01`–`ar.v.l08` trägt die Schrift- und Lauttipps (§1).
- **Laute:** Neu sind die Kehllaute ḥ und ʿ, das hintere q und die dunklen (emphatischen) Laute ṣ, ḍ, ṭ, ẓ. Vertraut sind ḫ (wie in „Bach“), der Knacklaut (Hamza, wie in „be-achten“), ġ (ähnlich dem deutschen Zäpfchen-r) und die Vokallänge. Die Šadda (langer Konsonant) und die Bindung im Satz (Waṣla, ohne Knacklaut) sind für Deutschsprachige ungewohnt.
- **Größte Hürden:** kein „sein“ im Präsens, Genus mit Folgen für Verb, Adjektiv und „du“ (anta, anti), Adjektiv nach dem Nomen, das Wurzelsystem und die Endungen der drei Fälle.
- **Starke Brücken:** Nominativ, Akkusativ und Genitiv aus dem Deutschen; die Reihenfolge von „die Tür des Hauses“ (Iḍāfa); Zahlen 21–99 mit dem Einer zuerst; Vokalwechsel wie sprechen – sprach (Wurzel und gebrochener Plural); „sondern“ (bal); Präsens mit „seit“ (munḏu); Nominalstil der Amtssprache.
- **Fallen:** „halb neun“ ist aṯ-ṯāmina wa-n-niṣf (8:30); man heißt „wer“; lam + Präsensform meint die Vergangenheit; mā zāla heißt „noch immer“; die Mehrzahl von Sachen steht in der femininen Einzahl.
- **Wortschatz:** Wenige Wörter klingen ähnlich. Es gibt deutsche Wörter arabischer Herkunft (Zucker, Ziffer, Magazin, Tarif), Internationalismen im Arabischen (tilifūn, bank, yūrū) und 23 falsche oder halbe Freunde (§3).
- **Pragmatik:** Ein „Sie“ gibt es nicht; Respekt zeigen Titel und Vorname (al-ustāḏa Nādiya). Grüße haben feste Antworten (ṣabāḥ al-ḫayr – ṣabāḥ an-nūr). Religiöse Formeln bleiben gesperrt (§4.7).
- **Tipps:** 306 Tipp-Themen, verteilt auf den Vorkurs und alle 72 Einheiten (§6).

## 1 Laut und Schrift

### 1.1 Schrift und Rechtschreibung

Die arabische Schrift ist für fast alle Lernenden neu. Der Vorkurs (`ar.v.l01`–`ar.v.l08`, Übungstyp `schrift_ar`) führt sie ein; die Tabelle zeigt, welcher Kontrast in welche Lektion gehört.

| Bereich | Deutsch | Arabisch | typische Verwechslung | Vorkurs |
|---|---|---|---|---|
| Richtung | von links nach rechts | von rechts nach links; Zahlen von links nach rechts | Wort von links gelesen; Ziffernfolge umgedreht | l01, l07 |
| Bücher und Hefte | Buchrücken links | Buchrücken rechts; man beginnt aus deutscher Sicht „hinten“ | Seitenfolge verwechselt | l01 |
| Buchstabenformen | Druckbuchstaben stehen einzeln | Buchstaben werden verbunden und haben bis zu vier Formen | Anfangs- oder Mittelform nicht erkannt | l03 |
| Nicht verbindende Buchstaben | – | alif, dāl, ḏāl, rāʾ, zāy, wāw verbinden sich nicht nach links | Lücke im Wort als Wortgrenze gelesen | l03 |
| Punkte | nur bei i, j, ä, ö, ü | unterscheiden Buchstaben gleicher Grundform (bāʾ, tāʾ, ṯāʾ, nūn, yāʾ) | Punkte vertauscht oder vergessen | l01, l02 |
| Groß und klein | zwei Formen je Buchstabe | eine Form | Satzanfang und Namen gesucht | l01 |
| Kurze Vokale | werden immer geschrieben | als Zeichen über oder unter dem Buchstaben; im Alltag meist weggelassen | Text ohne Vokalzeichen nicht lesbar | l04 |
| Lange Vokale | Dehnung mit ie, h oder Doppelvokal | alif, wāw, yāʾ | wāw und yāʾ als Konsonant oder Vokal verwechselt | l05 |
| Doppelkonsonant | zeigt einen kurzen Vokal davor (Bett) | Šadda: der Konsonant wird lang gesprochen | Šadda überlesen | l06 |
| Vokallosigkeit | – | Sukūn schließt die Silbe | Hilfsvokal eingefügt | l06 |
| Wortende | – | Tāʾ marbūṭa (-a, in Verbindung -at), Tanwīn (-un, -an, -in), Alif maqṣūra | Tāʾ marbūṭa als h oder t gelesen | l05, l07 |
| Artikel | eigenes Wort | al- wird angehängt; vor Sonnenbuchstaben angeglichen | l vor Sonnenbuchstaben gesprochen | l08 |
| Kleine Wörter | „und“, „mit“, „für“ sind eigene Wörter | wa-, fa-, bi-, li-, ka- hängen am nächsten Wort | Wort mit Vorsilbe im Wörterbuch nicht gefunden | l08 |
| Hamza | Knacklaut wird nicht geschrieben | eigenes Zeichen, auf alif, wāw, yāʾ oder auf der Zeile | Hamza übersehen | l08 |
| Satzzeichen | Komma, Fragezeichen | Komma und Fragezeichen gespiegelt | – | l07 |
| Ziffern | europäische Ziffern | östlich-arabische Ziffern (Levante, Irak, Ägypten, Golf) oder europäische (Maghreb) | Die östlich-arabische Fünf sieht aus wie eine Null; die Null ist ein Punkt | l07 |
| Handschrift | Druckschrift genügt | Verbindungen gehören zur Schrift | Buchstaben einzeln nebeneinander gesetzt | l03 |
| Tastatur | QWERTZ | arabische Belegung; Vokalzeichen meist mit der Umschalttaste | Vokalzeichen beim Tippen vergessen | A2 (Schreiben) |

**Buchstabennamen.** Die arabischen Namen (alif, bāʾ, tāʾ, ǧīm …) folgen dem Hocharabischen (Texte in `messages/lernapp/*.json`). Die deutschen Namen (a, be, ce …) helfen nicht; Merkhilfen über den Laut sind besser als über das Aussehen.

**Lesen ohne Vokalzeichen.** Im Kurs ist jeder Text voll vokalisiert. Zeitungen, Schilder und Formulare sind es nicht. Ab B1 lesen Lernende kurze Texte zusätzlich ohne Vokalzeichen (`lesen_fragen`); Tipps erklären, dass Wurzel und Muster beim Erraten helfen.

### 1.2 Laute

| Laut | Arabisch | Deutsch | Folge beim Hören und Sprechen | Übung |
|---|---|---|---|---|
| ḥ | stark gehauchtes h, tief im Rachen | fehlt | wie h gesprochen | ḥabba – habba |
| ʿ (ʿayn) | gepresster Kehllaut | fehlt | weggelassen | ʿamal – amal |
| ʾ (Hamza) | Knacklaut, auch mitten im Wort und am Ende | Vertraut: Knacklaut vor Vokal am Wortanfang („be-achten“) | in der Wortmitte weggelassen | saʾala – sāla |
| ḫ | wie ch in „Bach“ | Vertraut | – | ḥāl – ḫāl |
| ġ | stimmhafter Reibelaut hinten | ähnlich dem deutschen Zäpfchen-r | ġ und r verwechselt | ġālī – ḫālī |
| r | Zungenspitzen-r, gerollt | meist Zäpfchen-r | deutsches r klingt wie ġ | rīḥ, rāqid |
| q | weiter hinten als k | fehlt | wie k | qāla – kāla |
| ṣ, ḍ, ṭ, ẓ | dunkel (emphatisch), färben die Vokale | fehlen | wie s, d, t, z | sāra – ṣāra |
| ṯ, ḏ | wie englisch th in „think“ und „this“ | fehlen (Englisch hilft) | als s, z oder t, d | ṯamar – samar |
| ǧ | wie dsch in „Dschungel“ | selten | wie g (ägyptische Aussprache) | ǧamal |
| z | stimmhaftes s wie in „Rose“ | z ist im Deutschen „ts“ | beim Lesen der Umschrift „ts“ gesprochen | zayt, ʿazm |
| s | immer stimmlos wie in „Bus“ | s vor Vokal stimmhaft („Sonne“) | sāra mit summendem s | sāra, sana |
| w | wie englisch w (Halbvokal) | deutsches w ist ein Reibelaut | wa- als „va“ | wa-, walad |
| h am Wortende | wird gesprochen (waǧh, -hu) | nach Vokal oft stumm (Kuh) | h weggelassen | waǧh, baytuhu |
| Vokallänge | unterscheidet Wörter | Vertraut | – | ǧamal – ǧamāl |
| Vokalfärbung | a klingt neben ṣ, ḍ, ṭ, ẓ, q, ḫ, ġ dunkel, sonst heller | fünf Vokalqualitäten und Umlaute | e und o als eigene Vokale gesucht | ṣabāḥ, kitāb |
| Šadda | langer (doppelter) Konsonant | Doppelbuchstabe zeigt nur kurzen Vokal | Šadda überhört | darasa – darrasa |
| ay, aw | Doppellaute | ei, au ähnlich | zu ē, ō verkürzt (wie im Dialekt) | bayt, yawm |
| Bindung im Satz | Hamzat al-waṣl fällt weg, die Wörter werden verbunden | Knacklaut vor jedem Vokal am Wortanfang | Knacklaut vor al- im Satz | fī l-bayt, wa-l-walad |

### 1.3 Hörtraining-Paare

Paare nur aus dem Alltagswortschatz und ohne Wörter des Tabu-Lexikons (Leitfaden §2). Übungstyp `minimalpaare` (PLAN §4). Seltene Wörter in den Paaren (kāla, rākid, ṭall, hadm) dienen nur dem Hören und zählen nicht zum Lemma-Budget (KD-ard-08).

| Kontrast | Paare (Bedeutung) | Einheit |
|---|---|---|
| ḥ und h | ḥabba – habba (Korn – wehte), ḥāla – Hāla (Zustand – Name) | ar.v.l02 |
| ḥ und ḫ | ḥāl – ḫāl (Zustand – Onkel), ḥall – ḫall (Lösung – Essig) | ar.v.l02, A2-e10 |
| ʿ und Hamza | ʿamal – amal (Arbeit – Hoffnung), saʿala – saʾala (husten – fragen), ʿarḍ – arḍ (Angebot – Erde), qaraʿa – qaraʾa (klopfen – lesen) | ar.v.l02, A2-e08 |
| Hamza und langer Vokal | saʾala – sāla (fragte – floss) | ar.v.l08 |
| q und k | qāla – kāla (sagte – maß ab), rāqid – rākid (liegend – stehend) | ar.v.l02 |
| q und ġ | qarīb – ġarīb (nah – fremd) | ar.v.l02 |
| ġ und ḫ | ġālī – ḫālī (teuer – leer) | ar.v.l02, A2-e06 |
| s und ṣ | sāra – ṣāra (ging – wurde), ʿasīr – ʿaṣīr (schwierig – Saft) | ar.v.l02, A1-e10 |
| t und ṭ | tall – ṭall (Hügel – Tau), tāʾ – ṭāʾ (Buchstabennamen) | ar.v.l02 |
| d und ḍ | hadm – haḍm (Abriss – Verdauung), dāl – ḍād (Buchstabennamen) | ar.v.l02 |
| z und ẓ | ʿazm – ʿaẓm (Entschlossenheit – Knochen), zahr – ẓahr (Blüten – Rücken) | ar.v.l02, A1-e12 |
| ṯ und s, ḏ und d | ṯamar – samar (Früchte – Abendgespräch), ḏurra – durra (Mais – Perle) | ar.v.l01 |
| kurz und lang | ǧamal – ǧamāl (Kamel – Schönheit), maṭar – maṭār (Regen – Flughafen), kataba – kātaba (schrieb – schrieb sich mit), saʿida – sāʿada (war froh – half) | ar.v.l05, B1-e08 |
| mit und ohne Šadda | darasa – darrasa (lernte – unterrichtete), ḥamām – ḥammām (Tauben – Bad), ʿalima – ʿallama (wusste – lehrte) | ar.v.l06, B1-e02 |
| Artikel | al-qamar – aš-šams (Mondbuchstabe – Sonnenbuchstabe) | ar.v.l08, A1-e03 |

### 1.4 Pausa, Bindung und Betonung

- **Pausa:** Am Satzende fällt die kurze Endung weg (kitābun → kitāb), Tāʾ marbūṭa wird zu -a, -an wird zu -ā. Mitten im Satz werden die Endungen gesprochen. Lernende lassen leicht alle Endungen weg oder sprechen sie auch am Satzende (Erfahrungswert).
- **Bindung:** Das a von al- und andere Hamzat al-waṣl fallen nach einem Vokal weg (fī l-bayt). Ein deutscher Knacklaut davor klingt abgehackt.
- **Lange Vokale halten:** ā, ī, ū etwa doppelt so lang wie die kurzen Vokale; sonst entstehen andere Wörter (§1.3).
- **Betonung:** Im Hocharabischen liegt die Betonung meist auf der letzten schweren Silbe innerhalb der letzten drei (ki-TĀB, MAD-ra-sa). Die Regeln unterscheiden sich regional; Tipps nennen sie nicht als Pflicht, die Hörbeispiele tragen sie (zu prüfen, KD-ard-06).
- **Zahlen von 21 bis 99:** Vertraut. Wie im Deutschen kommt der Einer zuerst: ḫamsa wa-ʿišrūn = fünfundzwanzig.

### 1.5 Umschrift lesen

Tipps und Vorkurs zeigen Arabisch in arabischer Schrift, voll vokalisiert. Wo zusätzlich Umschrift erscheint (Vorkurs, Hinweise in der deutschen Oberfläche), gelten diese Lesehilfen:

| Zeichen | Aussprache | deutsche Hilfe |
|---|---|---|
| ā, ī, ū | lange Vokale | wie in „Saal“, „Biene“, „Mut“ |
| ṯ, ḏ | th wie in englisch „think“, „this“ | – |
| ǧ | dsch | „Dschungel“ |
| ḥ | gehauchtes h aus dem Rachen | – |
| ḫ | ch | „Bach“ |
| z | summendes s | „Rose“ (nicht „Zeit“) |
| s | scharfes s | „Bus“ |
| š | sch | „Schule“ |
| ṣ, ḍ, ṭ, ẓ | dunkle s, d, t, z | – |
| ʿ | gepresster Kehllaut | – |
| ʾ | Knacklaut | „be-achten“ |
| ġ | Reibelaut hinten | ähnlich dem Zäpfchen-r in „Rabe“ |
| q | k ganz hinten | – |
| w, y | wie englisch w, deutsches j | „Jahr“ |

## 2 Grammatik-Kontraste je Grammatik-ID

Die Tabellen folgen der Grammatikfolge des Rahmenplans (`ar.rahmen.json`, 126 IDs). In Klammern steht die Einheit, die die ID einführt. „Vertraut“ markiert eine Brücke aus dem Deutschen, die der Tipp zuerst nennt. Die typischen Fehler sind Erfahrungswerte und noch nicht gemessen (KD-ard-01).

### 2.1 Überblick

| Kontrast | Deutsch | Hocharabisch | Folge für die Tipps |
|---|---|---|---|
| Satz ohne Verb | „sein“ ist immer nötig | im Präsens kein „sein“ (Nominalsatz) | ab A1-e01; kāna erst für die Vergangenheit (A2-e01) |
| Wortstellung | Verb auf Platz 2, Satzklammer, Verb am Ende im Nebensatz | Verb oft am Satzanfang; Subjekt vorn möglich; kein Verb ans Ende | Verb vorn bleibt in der Einzahl (A2-e07) |
| Genus | drei Genera; der Artikel zeigt das Genus | zwei Genera; -a zeigt fast immer feminin; Verb, Adjektiv, Pronomen und „du“ richten sich danach | Genus nicht übertragen; -a-Regel (Messung §7) |
| Artikel | der, die, das; ein, eine | al- für bestimmt, Tanwīn für unbestimmt; Artikel auch bei Allgemeinem | „ein“ steckt im Tanwīn |
| Fälle | vier, am Artikel sichtbar | drei, als Endung am Nomen; kein Dativ | Vertraut: Begriffe aus der Schulgrammatik (B1-e10) |
| Attribut | Adjektiv vor dem Nomen; Komposita mit Kern hinten | Adjektiv und Iḍāfa nach dem Nomen | Komposita von hinten übersetzen |
| Wortbildung | Stamm, Präfix, Kompositum; Vokalwechsel bei starken Verben | Wurzel und Muster; Verbstämme II–X | Wurzel ab A1-e12, Stämme als System in B1 |
| Verbformen | Hilfsverben (haben, sein, werden) und Infinitiv | ein Wort mit Person; kein Infinitiv (an + Verb) | „zu“ und „um … zu“ werden Verben mit Person |

### 2.2 A1 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `ar.g.personalpron` (A1-e01) | „du“ hat zwei Formen: anta (zu einem Jungen oder Mann), anti (zu einem Mädchen oder einer Frau). Ein „Sie“ gibt es nicht. | „kayfa ḥāluka?“ zu Laylā · „anta“ zu einer Lehrerin | Wer angesprochen wird, bestimmt die Form: anta oder anti. anta und anti sind auch gegenüber Erwachsenen höflich. |
| `ar.g.nominalsatz` (A1-e01) | Im Präsens fehlt „sein“: Subjekt und Aussage stehen nebeneinander (anā Laylā, al-bayt kabīr). | „anā akūnu ṭālib“ · „al-bayt yakūnu kabīr“ (ein Wort für „bin/ist“ eingefügt) | „bin“ und „ist“ fallen im Präsens einfach weg: anā tilmīḏa = Ich (bin) Schülerin. Erst in der Vergangenheit kommt kāna. |
| `ar.g.nisba` (A1-e01) | Herkunftswörter richten sich nach dem Genus (almānī, almāniyya). Sprachen stehen mit Artikel (al-ʿarabiyya), wie „das Arabische“. | „anā almānī“ (von einem Mädchen gesagt) · „atakallamu ʿarabiyya“ | Mädchen und Frauen hängen -iyya an: anā almāniyya. Sprachen tragen den Artikel: atakallamu l-ʿarabiyya. |
| `ar.g.genus` (A1-e02) | Zwei Genera statt drei; ein Neutrum gibt es nicht. Wörter auf -a sind fast immer feminin (Messung §7), einige feminine Wörter haben kein Kennzeichen (umm, bint, šams). | „al-bāb maftūḥa“ (die Tür → feminin übertragen; bāb ist maskulin) · „aš-šams ḥārr“ | Das deutsche Genus hilft nicht: das Haus → al-bayt (m.), die Tür → al-bāb (m.). Faustregel: -a am Ende = feminin; die wenigen Ausnahmen als Liste lernen. |
| `ar.g.hinweis` (A1-e02) | hāḏā und hāḏihi richten sich nach dem Ding; „das ist“ ist im Deutschen immer gleich. Mit Artikel entsteht „dieser …“ statt eines Satzes. | „hāḏā sayyāra“ · „hāḏā l-qalam“ für „Das ist der Stift“ | hāḏā qalam = Das ist ein Stift; hāḏihi sayyāra = Das ist ein Auto. Mit Artikel heißt es „dieser“: hāḏā l-qalam = dieser Stift. |
| `ar.g.fragepartikel` (A1-e02) | Ja-Nein-Fragen bekommen hal oder a- am Anfang; die Wortstellung ändert sich nicht. Im Deutschen rückt das Verb nach vorn. | „anta Yazan?“ in geschriebenen Fragen ohne hal · Umstellung nach deutschem Muster | Einfacher als im Deutschen: Vor die Aussage kommt hal – sonst bleibt alles gleich: hal anta Yazan? |
| `ar.g.artikel` (A1-e03) | Es gibt kein Wort für „ein“; Unbestimmtheit zeigt das Tanwīn (kitābun). al- wird angehängt und steht auch bei allgemeinen Dingen, wo das Deutsche keinen Artikel hat. | „wāḥid kitāb“ für „ein Buch“ · „al kitāb“ getrennt geschrieben | „ein“ steckt im Tanwīn: kitābun = ein Buch. wāḥid heißt „eins“. al- schreibt man mit dem Wort zusammen. |
| `ar.g.sonne_mond` (A1-e03) | Vor 14 Buchstaben gleicht sich das l des Artikels an; geschrieben wird es trotzdem. Nach einem Vokal fällt das a von al- weg (Waṣla). | „al-šams“ gesprochen · „fī ʾal-bayt“ mit Knacklaut | Sonnenbuchstaben bildet die Zungenspitze vorn im Mund (t, ṯ, d, ḏ, r, z, s, š, l, n und die dunklen ṣ, ḍ, ṭ, ẓ); einzige Falle: ǧ ist ein Mondbuchstabe. Vor ihnen wird das l zum nächsten Laut: aš-šams. |
| `ar.g.adjektiv` (A1-e03) | Das Adjektiv steht nach dem Nomen und übernimmt Genus und Bestimmtheit. Hat nur das Nomen den Artikel, entsteht ein Satz. | „kabīr bayt“ (deutsche Reihenfolge) · „al-bayt kabīr“ für „das große Haus“ | Das Adjektiv steht hinten und spiegelt das Nomen: al-bayt al-kabīr = das große Haus. al-bayt kabīr ist schon ein Satz: Das Haus ist groß. |
| `ar.g.suffix_nomen` (A1-e04) | Besitz ist eine Endung am Nomen; das Nomen verliert dann den Artikel, und aus -a wird -at-. Vertraut: -hu und -hā unterscheiden wie „sein“ und „ihr“ den Besitzer. | „al-baytī“ · „ġurfaī“ | „mein“ wird zur Endung: baytī. Wie „sein/ihr“: baytuhu (sein Haus), baytuhā (ihr Haus). Vor Endungen wird -a zu -at-: ġurfatī. |
| `ar.g.besitz_inda` (A1-e04) | Ein Verb „haben“ gibt es nicht: ʿindī (bei mir), lī (für mich), maʿī (mit mir). Pronomen hängen an. | „ʿinda anā aḫ“ · ein erfundenes Verb für „haben“ | „Ich habe einen Bruder“ heißt „bei mir (ist) ein Bruder“: ʿindī aḫ. Was man dabeihat, steht mit maʿī: maʿī hātifī. |
| `ar.g.zahlen_bis_10` (A1-e04) | Ziffern gibt es in westlicher und östlich-arabischer Form; auch im arabischen Text liest man Zahlen von links nach rechts. Das Alter steht als feste Wendung mit ʿumr. | östlich-arabische Fünf als Null gelesen · Telefonnummer von rechts gelesen | Ziffern immer von links nach rechts lesen. „Wie alt bist du?“ heißt kam ʿumruka? – wörtlich „wie viel ist dein Alter?“ |
| `ar.g.praep_ort` (A1-e05) | Nach jeder Präposition steht der Genitiv (-i). Einen Wechsel nach wo/wohin wie im Deutschen gibt es nicht. | „fī l-baytu“ beim vokalisierten Lesen | Vertraut: Die Präposition bestimmt den Fall. Aber nur einen: nach fī, ʿalā, taḥta immer -i. Am Satzende fällt die Endung in Pausa weg. |
| `ar.g.hunaka` (A1-e05) | „Es gibt“ heißt hunāka, oder der Ort steht vor einem unbestimmten Nomen. Ein unbestimmtes Subjekt steht nicht am Satzanfang. | „sarīr fī ġurfatī“ · „hunāka l-maktaba“ mit Artikel | Wie „Im Zimmer ist ein Bett“: fī ġurfatī sarīr. Ein unbestimmtes Ding beginnt keinen Satz. |
| `ar.g.fragewoerter` (A1-e05) | Fragewörter stehen vorn. man heißt „wer“. mā steht vor Nomen, māḏā vor Verben. | „man“ als deutsches „man“ verstanden · „māḏā hāḏā?“ | man heißt „wer“ (man hāḏā? = Wer ist das?). mā vor Nomen: mā hāḏā?; māḏā vor Verben: māḏā taktub? |
| `ar.g.mudari_sg` (A1-e06) | Die Person steht vorn am Verb (a-, ta-, ya-), bei „du (f.)“ zusätzlich hinten (-īna). taktub heißt „du schreibst“ und „sie schreibt“. | „anā yaktub“ · „taktub“ zu einem Mädchen statt taktubīna | a- = ich, ta- = du (m.) oder sie (f.), ya- = er. Vertraut: Ein Präsens steht für „jetzt“ und für Gewohnheiten. |
| `ar.g.konjunktion` (A1-e06) | wa und fa- hängen am nächsten Wort. In Aufzählungen steht wa meist vor jedem Glied, nicht nur vor dem letzten. | „wa al-walad“ getrennt geschrieben · Aufzählung mit Kommas nach deutschem Muster | wa und fa- schreibt man an das nächste Wort: wa-l-walad. Aufzählung: šāy wa-qahwa wa-ḥalīb. |
| `ar.g.zahlen_bis_100` (A1-e07) | Vertraut: Der Einer steht vor dem Zehner, verbunden mit wa – wie im Deutschen. | „ʿišrūn wa-ḫamsa“ (englische Reihenfolge) | Vertraut: fünfundzwanzig = ḫamsa wa-ʿišrūn, wörtlich „fünf und zwanzig“. |
| `ar.g.idafa` (A1-e07) | Das Besitzte steht zuerst und ohne Artikel, der Besitzer folgt im Genitiv. Vertraut ist die Reihenfolge von „die Tür des Hauses“; deutsche Komposita (Haustür) laufen umgekehrt. | „al-bāb al-bayt“ · „al-bayt bāb“ (Kompositum-Reihenfolge) | Wie „die Tür des Hauses“: bāb al-bayt – das erste Wort ohne Artikel. Komposita von hinten übersetzen: Haustür → bāb al-bayt. |
| `ar.g.mudari_pl` (A1-e08) | Mehrzahl: na- für „wir“, ta-…-ūna für „ihr“, ya-…-ūna für „sie“. Das Pronomen steht oft zusätzlich davor. | „naktubūna“ · „hum yaktub“ | „wir“ hat nur die Vorsilbe: naktub. „ihr“ und „sie“ bekommen -ūna dazu: taktubūna, yaktubūna. |
| `ar.g.la_mudari` (A1-e08) | lā steht direkt vor dem Verb. Im Deutschen steht „nicht“ hinter dem Verb oder am Ende. | „alʿab lā“ · „laysa alʿab“ | lā gehört vor das Verb: lā alʿab at-tanis = Ich spiele nicht Tennis. |
| `ar.g.ordinal_uhrzeit` (A1-e09) | Die Stunde ist eine Ordnungszahl mit Artikel (as-sāʿa aṯ-ṯāliṯa). „halb“ zählt von der vollen Stunde davor: aṯ-ṯāmina wa-n-niṣf = 8:30, im Deutschen „halb neun“. | „as-sāʿa ṯalāṯa“ · „at-tāsiʿa wa-n-niṣf“ für „halb neun“ | Achtung bei „halb“: halb neun ist as-sāʿa aṯ-ṯāmina wa-n-niṣf – acht und eine halbe. Viertel vor neun: at-tāsiʿa illā rubʿan. |
| `ar.g.laysa` (A1-e09) | laysa („ist nicht“) verändert sich nach der Person wie ein Verb. lā verneint Verben, laysa Sätze ohne Verb. | „anā laysa ǧawʿān“ · „lā l-maktaba baʿīda“ | laysa hat Personenformen: lastu ǧawʿān = Ich bin nicht hungrig. Vor Verben steht lā, vor Sätzen ohne Verb laysa. |
| `ar.g.imperativ` (A1-e10) | Die Aufforderung unterscheidet Junge, Mädchen und mehrere (uktub, uktubī, uktubū). Eine höfliche Sie-Form gibt es nicht. | „uktub“ zu einem Mädchen · „min faḍlik“ zu einer Frau (vokalisiert min faḍliki) | Auch die Aufforderung hört, wer gemeint ist: iǧlis, iǧlisī, iǧlisū. Höflich wird sie mit min faḍlik bzw. min faḍliki. |
| `ar.g.wunsch` (A1-e10) | urīdu an + Verb mit Person statt Infinitiv. Was man allgemein mag, steht mit Artikel (uḥibbu l-qahwa). | „urīdu aḏhab“ ohne an · „uḥibbu qahwa“ ohne Artikel | Statt „gehen“ steht „dass ich gehe“: urīdu an aḏhaba. „Ich mag Kaffee“ heißt uḥibbu l-qahwa – mit Artikel. |
| `ar.g.farben` (A1-e11) | Grundfarben haben eine eigene weibliche Form nach dem Muster faʿlāʾ (aḥmar – ḥamrāʾ). Einfach -a anhängen geht nicht. | „sayyāra aḥmara“ · „sutra azraqa“ | Farben extra lernen: aḥmar – ḥamrāʾ, azraq – zarqāʾ, aswad – sawdāʾ. Andere Farben enden auf -ī wie burtuqālī. |
| `ar.g.wurzel` (A1-e12) | Die meisten Wörter bestehen aus drei Wurzelkonsonanten in einem Muster (k-t-b: kataba, kitāb, maktab). Vertraut ist der Vokalwechsel aus „sprechen – sprach – Sprache“. | maktaba unter m im Wurzelwörterbuch gesucht · m- und -a als Wurzelbuchstaben gezählt | Wie sprechen – sprach – Sprache: Das Gerüst bleibt, die Vokale wechseln. Im Wörterbuch nach den drei Konsonanten suchen: maktab → k-t-b. |

### 2.3 A2 (27 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `ar.g.madi_sg` (A2-e01) | Die Vergangenheit ist ein einziges Wort mit Endung (katabtu). Ein Hilfsverb wie „haben“ oder „sein“ gibt es nicht. In Pausa klingen -tu, -ta und -ti gleich. | „kuntu katabtu“ für „ich habe geschrieben“ · katabta zu einem Mädchen | katabtu = ich habe geschrieben – ohne Hilfsverb. -tu ich, -ta du (m.), -ti du (f.), -at sie. |
| `ar.g.kana_war` (A2-e01) | kāna („war“) bringt Sätze ohne Verb in die Vergangenheit. Die Aussage steht danach im Akkusativ (-an). | „kāna l-ǧawwu ǧamīlun“ | Im Präsens fehlt „sein“, in der Vergangenheit kommt es: kāna. Danach Akkusativ: kāna l-ǧawwu ǧamīlan. |
| `ar.g.madi_pl` (A2-e02) | katabnā, katabtum, katabū; das Alif nach -ū wird geschrieben, aber nicht gesprochen. Verneinung: mā + Vergangenheit. | Alif in katabū gesprochen · Alif beim Schreiben vergessen | katabū: Das Alif am Ende ist stumm. „Ich bin nicht gegangen“: mā ḏahabtu. |
| `ar.g.lam_jussiv` (A2-e02) | Verneinte Vergangenheit mit lam + Präsensform ohne Endvokal. Die Form sieht nach Präsens aus, meint aber die Vergangenheit. | „lam katabtu“ · „lam aktubu“ | lam macht aus der Präsensform eine verneinte Vergangenheit: lam aktub = ich habe nicht geschrieben. Der Endvokal fällt weg. |
| `ar.g.datum` (A2-e03) | Datum mit Ordnungszahl und min (al-ʿāšir min abrīl). Zwei Reihen von Monatsnamen. Die Wochentage zählen ab Sonntag (al-aḥad, der „erste“). | „ʿašara abrīl“ · al-iṯnayn für Dienstag gehalten | Beim Datum steht min: al-ʿāšir min abrīl. Montag heißt al-iṯnayn, „der zweite“ – die Woche beginnt mit al-aḥad. |
| `ar.g.anrede` (A2-e03) | Kein „Sie“ als Verbform. Höflichkeit zeigen Titel (as-sayyid, as-sayyida, al-ustāḏ, al-ustāḏa) und ḥaḍratuka/ḥaḍratuki; die Verbform bleibt in der Einzahl. | „hal turīdūna …?“ (Plural) zu einer Person, wie „Möchten Sie …?“ | Zu einer Person immer Einzahl. Höflich wird es durch den Titel: tafaḍḍalī, yā ustāḏa Nādiya. |
| `ar.g.sa_sawfa` (A2-e04) | Zukunft mit sa- (angehängt) oder sawfa (eigenes Wort). Verneint wird mit lan + Konjunktiv, nicht mit lā. | „lā sa-aḏhab“ · „sa aḏhab“ getrennt | sa- hängt am Verb: sa-nusāfir. „nicht werden“ heißt lan: lan ataʾaḫḫara. |
| `ar.g.mansub` (A2-e04) | Nach an, li-, kay, ḥattā und lan endet das Verb auf -a; -ūna und -īna verlieren das n. Das Arabische hat keinen Infinitiv: Wo das Deutsche „zu“ oder „um … zu“ sagt, steht ein Verb mit Person. | „urīdu an azūru“ · „urīdu an yazūra“ (3. Person als Infinitiv benutzt) | Statt „um … zu kaufen“ heißt es „damit wir kaufen“: li-naštariya. Das Verb nach an und li- trägt die Person und endet auf -a. |
| `ar.g.plural_gesund` (A2-e05) | -ūn/-īn nur für männliche Personen (und gemischte Gruppen), -āt für weibliche Personen und viele Sachen. | „sayyārūn“ · „muhandisāt“ für Ingenieure | -ūn für Männer: muhandisūn. -āt für Frauen und viele Dinge: ṭālibāt, sayyārāt. |
| `ar.g.kongruenz_unbelebt` (A2-e05) | Die Mehrzahl von Sachen und Tieren gilt grammatisch als feminine Einzahl: Adjektiv, Pronomen und Verb stehen in dieser Form. | „as-sayyārāt ǧadīdāt“ · „ayna l-mafātīḥ? – hum fī l-ḥaqība“ | Dinge in der Mehrzahl sind „sie“ (Einzahl): as-sayyārāt ǧadīda; al-mafātīḥ – hiya fī l-ḥaqība. |
| `ar.g.komparativ` (A2-e06) | Die Form afʿal steht für Komparativ und Superlativ und ändert sich nicht nach dem Genus. „als“ heißt min. | „hiya kubrā min …“ (Superlativform als feminines „größer“) · „akṯar kabīr“ | akbar min = größer als – eine Form für alles: al-ġurfa akbar min al-maṭbaḫ; Yazan akbar min Laylā. |
| `ar.g.akkusativ` (A2-e06) | Das direkte Objekt steht im Akkusativ (-a, unbestimmt -an mit Alif). Viele Zeit- und Artangaben sind Akkusative (ṣabāḥan, ǧiddan). Vertraut: Auch das Deutsche markiert das Objekt („den“). | „aštarī sutratun“ · šukran ohne Alif geschrieben | Wie „den“ im Deutschen zeigt -a das Objekt: aštarī sutratan. -an bekommt ein Alif: šukran, ṣabāḥan. |
| `ar.g.plural_gebrochen` (A2-e07) | Viele Nomen bilden den Plural mit neuem Muster im Wortinneren (walad – awlād). Vertraut aus dem Deutschen: Haus – Häuser, Buch – Bücher. | „kitābāt“ für Bücher · „baytāt“ | Wie Haus – Häuser verändert sich das Wort innen: kitāb – kutub, bayt – buyūt. Jedes Nomen mit Plural lernen. |
| `ar.g.verbalsatz_kongruenz` (A2-e07) | Steht das Verb vor dem Subjekt, bleibt es in der Einzahl (nur das Genus passt sich an). Steht das Subjekt vorn, folgt die Mehrzahl. | „laʿibū l-awlād“ · „al-awlād laʿiba“ | Verb vorn: Einzahl – laʿiba l-awlād. Subjekt vorn: Mehrzahl – al-awlād laʿibū. |
| `ar.g.objektsuffix` (A2-e08) | Pronomen als Objekt hängen am Verb. „mich“ heißt -nī (mit n), „mein“ -ī. | „faḥaṣa anā“ · „faḥaṣī“ für „er hat mich untersucht“ | „mich“ wird zur Endung am Verb: faḥaṣanī. Das n unterscheidet „mich“ (-nī) von „mein“ (-ī). |
| `ar.g.praep_suffix` (A2-e08) | Präpositionen tragen Endungen; dabei ändern sich Laute: ʿalā → ʿalayka, nach -i, -ī und -ay wird -hu zu -hi (fīhi, ʿalayhi). | „ʿalāhu“ · „fīhu“ · „li anā“ | Nach -i, -ī und -ay wird -hu zu -hi: fīhi, ʿalayhi, bihi. „für mich“ ist ein Wort: lī. |
| `ar.g.verbot_jussiv` (A2-e09) | Ein Verbot entsteht mit lā + Präsensform der 2. Person ohne Endvokal, nicht mit der Befehlsform. | „lā uktub!“ · „lā taktubu!“ (bedeutet „du schreibst nicht“) | „Schreib nicht!“ heißt lā taktub! – Mit Endvokal (lā taktubu) ist es eine Aussage: Du schreibst nicht. |
| `ar.g.notwendigkeit` (A2-e09) | „müssen“ ist unpersönlich: yaǧibu an + Konjunktiv oder ʿalā + Person + an. yaǧibu bleibt gleich; die Person steckt im zweiten Verb. | „aǧibu an adrusa“ · „anā yaǧibu adrus“ | „Ich muss lernen“ heißt „es ist nötig, dass ich lerne“: yaǧibu an adrusa oder ʿalayya an adrusa. |
| `ar.g.praep_zeit` (A2-e10) | munḏu (seit) mit Präsens für Andauerndes – vertraut aus dem Deutschen („Ich wohne seit …“). Vor Verben stehen qabla an und baʿda an. | „qabla aḏhab“ ohne an | Wie im Deutschen: askunu fī Wetzlar munḏu ʿašr sanawāt. Vor einem Verb brauchen qabla und baʿda ein an: qabla an anāma. |
| `ar.g.li_anna` (A2-e10) | li-anna („weil“) steht mit Nomen oder angehängtem Pronomen; die Wortstellung bleibt wie im Hauptsatz. | „li-anna huwa marīḍ“ · Verb ans Satzende wie nach „weil“ | Nach li-anna hängt das Pronomen an: li-annahu marīḍ, li-annanī mutʿab. Kein Verb ans Ende. |
| `ar.g.partizip1` (A2-e11) | fāʿil (einer, der etwas tut) und mafʿūl (etwas, das getan wurde) dienen als Adjektiv oder Nomen. anā ḏāhib heißt auch „ich bin unterwegs“. | „al-ḥadīqa fataḥat“ für „Der Park ist geöffnet“ | kātib = Schreiber, maktūb = geschrieben. Auf Schildern: maftūḥ (geöffnet), muġlaq (geschlossen; Partizip des IV. Stamms, im Kurs Lemma ar.a1.e03.maghluq – maġlūq ist selten). |
| `ar.g.kollektiv` (A2-e11) | Sammelnomen (tuffāḥ = Äpfel, Obstsorte) und Einzelstück auf -a (tuffāḥa = ein Apfel). | „tuffāḥāt“ für Äpfel allgemein · „šaǧar“ für einen Baum | tuffāḥ meint Äpfel als Sorte oder Menge, tuffāḥa einen Apfel – ähnlich wie „Obst“ und „ein Stück Obst“. |
| `ar.g.verbalnomen` (A2-e12) | Tätigkeiten als Nomen (qirāʾa, kitāba, sibāḥa). Vertraut: „das Lesen“. Die Muster des Grundstamms sind nicht vorhersagbar. | „uḥibbu aqraʾu“ für „Ich lese gern“ | Wie „das Lesen“: uḥibbu l-qirāʾa. Das Verbalnomen mit dem Verb zusammen lernen. |
| `ar.g.koennen` (A2-e12) | „können“: istaṭāʿa an + Konjunktiv; yumkinu an (es ist möglich) ist unpersönlich. | „astaṭīʿu uṣliḥu“ ohne an | astaṭīʿu an uṣalliḥa d-darrāǧa. Höflich fragen: hal yumkinu an asʾala suʾālan? |
| `ar.g.quantoren` (A2-e13) | kull + unbestimmte Einzahl = jeder; kull + bestimmtes Nomen = ganz, alle. nafs vor dem Nomen = derselbe. | „kull al-yawm“ für „jeden Tag“ | kull yawm = jeden Tag, kull al-yawm = den ganzen Tag. nafs al-yawm = am selben Tag. |
| `ar.g.ausruf` (A2-e13) | Bewunderung hat ein festes Muster: mā + afʿala + Akkusativ. | „mā ǧamīl al-ʿurs!“ | „Wie schön …!“ heißt mā aǧmala …!: mā aǧmala l-ḥadīqata! |
| `ar.g.zahlen_gross` (A2-e14) | Jahreszahlen liest man als ganze Zahl (alf wa-tisʿumiʾa …); ein „neunzehnhundert“ gibt es nicht. Hunderte und Tausende haben Dualformen (miʾatān, alfān). | „tisʿa ʿašar miʾa“ für 1900 | 1990 = alf wa-tisʿumiʾa wa-tisʿūn – kein „neunzehnhundert“. Zwei Tausend ist ein Wort: alfān. |

### 2.4 B1 (30 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `ar.g.kana_mudari` (B1-e01) | kāna + Präsens beschreibt Gewohnheiten der Vergangenheit („früher immer“); beide Verben tragen die Person. kāna qad + Vergangenheit entspricht „hatte … getan“. | „kāna alʿab“ · „kuntu laʿibtu“ für „früher spielte ich“ | kuntu alʿabu = ich spielte früher (regelmäßig). Beide Verben passen sich der Person an. |
| `ar.g.verb_hohl` (B1-e01) | Verben mit w oder y in der Mitte: Der lange Vokal wird vor Endungen mit Konsonant kurz (qāla – qultu). Vertraut ist der Vokalwechsel starker Verben (sprechen – sprach). | „qāltu“ · „nāmtu“ | Vor -tu, -ta, -nā wird der lange Vokal kurz: qāla → qultu, nāma → nimtu. |
| `ar.g.stamm2` (B1-e02) | Stamm II verdoppelt den mittleren Konsonanten (Šadda) und macht oft „lehren“ aus „lernen“. Vertraut: lernen – lehren. | „darasa l-ustāḏ al-ʿulūm“ für „Der Lehrer unterrichtet …“ (Šadda überhört) | Die Šadda macht den Unterschied: darasa (lernen) – darrasa (unterrichten), ʿalima (wissen) – ʿallama (lehren). |
| `ar.g.stamm5_6` (B1-e02) | Stamm V ist oft das „sich“ zu Stamm II (taʿallama), Stamm VI drückt „einander“ aus (taʿāwana). Ein eigenes Wort für „sich“ braucht es nicht. | „taʿallamtu nafsī“ · „sāʿadnā baʿḍunā“ statt taʿāwannā | Das „sich“ und „einander“ steckt im Stamm: taʿāwannā = wir haben einander geholfen. |
| `ar.g.relativ` (B1-e03) | allaḏī/allatī/allaḏīna nur nach bestimmtem Bezugswort; nach unbestimmtem steht kein Relativwort. Ein Pronomen im Relativsatz verweist zurück. | „šaqqa llatī fīhā šurfa“ · „aš-šaqqa llatī raʾaynā“ (Rückverweis fehlt) · „aš-šaqqa llaḏī“ | Nach bestimmtem Nomen allatī, nach unbestimmtem nichts: šaqqa fīhā šurfa = eine Wohnung, die einen Balkon hat. Der Rückverweis gehört dazu: allatī raʾaynāhā. |
| `ar.g.ortsnomen` (B1-e03) | Orte nach ma-Mustern (maktab, malʿab), Werkzeuge nach mi-Mustern (miftāḥ). Vertraut: deutsche Komposita mit -platz, -raum, -zeug. | „mal-ʿab“ als Kompositum zerlegt | ma- + Wurzel = Ort: malʿab (Spielplatz), maṭbaḫ (Küche). mi- + Wurzel = Werkzeug: miftāḥ (Schlüssel). |
| `ar.g.dual` (B1-e04) | Für genau zwei gibt es eigene Formen (kitābāni, humā). Das Deutsche hat keinen Dual. Dazu kommen eigene Mehrzahlformen für Gruppen nur aus Frauen oder Mädchen (hunna, antunna, yaktubna); das deutsche „sie“ und „ihr“ unterscheiden das nicht. | „iṯnān kitāb“ · „iṯnān kutub“ · „hum yaktubūna“ für eine Gruppe von Mädchen | Für zwei braucht man kein Zahlwort: kitābāni = zwei Bücher. Als Objekt und nach Präpositionen -ayni: ġurfatayni. Nur Frauen oder Mädchen: hunna yaktubna. |
| `ar.g.zahl_tamyiz` (B1-e04) | 3–10: Die Zahl hat das umgekehrte Genus, das Gezählte steht im Genitiv Plural. 11–99: Gezähltes im Akkusativ Singular. 100 und 1000: Genitiv Singular. | „ʿišrūna kutub“ · „ṯalāṯa layālin“ | Nach 11 bis 99 Einzahl: ʿišrūna kitāban. Bei 3 bis 10 bekommt die Zahl -a, wenn das Gezählte maskulin ist: ṯalāṯat ayyām, aber ṯalāṯ layālin. |
| `ar.g.verb_defekt` (B1-e05) | Verben mit w oder y am Ende verändern das Wortende (mašā – yamšī, nasiya – nasītu); im Jussiv wird der Endvokal kurz. | „lam yamšī“ · „nasiytu“ | yamšī → lam yamši, nasiya → nasītu. Diese Verben als Tabelle lernen. |
| `ar.g.verb_hamza` (B1-e05) | Hamza als Wurzelkonsonant; ihr Träger wechselt mit den Vokalen. Kurze Befehle: kul, ḫuḏ. Vertraut: Die Hamza ist der deutsche Knacklaut (be-achten). | Hamza in saʾala weggelassen (wie im Dialekt) · „ukul!“ | Die Hamza ist der Knacklaut aus „be-achten“ und wird immer gesprochen: saʾaltu. kul (iss!) und ḫuḏ (nimm!) sind Ausnahmen. |
| `ar.g.stamm4` (B1-e06) | Stamm IV hat im Māḍī vorn a-, im Präsens u- (arsala – yursilu); oft „veranlassen“. | „yarsilu“ · „aġlaqa!“ als Befehl statt aġliq! | Präsens von Stamm IV mit u-: yursilu, yuġliqu. Imperativ mit a-: aġliq al-bāb! |
| `ar.g.verb_assimiliert` (B1-e06) | Verben mit w am Anfang verlieren es im Präsens (waṣala – yaṣilu). Das erschwert das Nachschlagen. | „yawṣilu“ · yaǧidu unter y gesucht | Bei w am Anfang fällt das w im Präsens weg: waǧada → yaǧidu. Im Wörterbuch unter w suchen. |
| `ar.g.stamm7_8` (B1-e07) | VII mit in-, VIII mit t nach dem ersten Wurzelkonsonanten; das t gleicht sich manchen Lauten an (ittaṣala aus w-ṣ-l). | „intaẓara“ unter n-t-ẓ gesucht · „iwtaṣala“ | Das t in Stamm VIII gehört nicht zur Wurzel: intaẓara hat n-ẓ-r. Aus w + t wird tt: ittaṣala. |
| `ar.g.stamm10` (B1-e07) | Stamm X mit ista- vorn: „für sich nehmen, erbitten, für etwas halten“ (istaʿmala, istaqbala). | s und t als Wurzelbuchstaben gezählt | ista- gehört nicht zur Wurzel: istaʿmala hat ʿ-m-l (arbeiten) – „für die Arbeit nehmen“ = benutzen. |
| `ar.g.stamm3` (B1-e08) | Stamm III hat ein langes ā nach dem ersten Konsonanten, oft „mit jemandem“. Die Länge unterscheidet Wörter: saʿida (glücklich sein) – sāʿada (helfen). | „saʿadanā l-ǧār“ (kurzes a) | Das lange ā macht den Unterschied: sāʿadanā l-ǧār = Der Nachbar hat uns geholfen. Stamm III heißt oft „mit jemandem etwas tun“. |
| `ar.g.anna_dass` (B1-e08) | Nach Verben des Wissens und Meinens steht anna mit Akkusativ oder angehängtem Pronomen; nach qāla steht inna. Im Deutschen steht das Verb nach „dass“ am Ende. | „aʿtaqidu anna anta …“ · „qāla anna …“ | Nach anna hängt das Pronomen an: annaka, annahu. Nach qāla steht inna: qāla innahu mašġūl. |
| `ar.g.temporalsatz` (B1-e09) | ʿindamā (wenn, als), lammā + Vergangenheit (als, einmalig), kullamā (immer wenn), iḏā (wenn, sobald) oft mit Vergangenheitsform auch für die Zukunft. | „lammā aṣilu“ · „iḏā sa-taṣilu“ | Einmaliges „als“: lammā + Vergangenheit. Nach iḏā steht oft die Vergangenheitsform, auch wenn die Zukunft gemeint ist: iḏā waṣalta, fa-ttaṣil bī (vor einem Befehl steht fa-). |
| `ar.g.verb_verdoppelt` (B1-e09) | Gleiche Konsonanten 2 und 3 stehen zusammen (radda), vor Endungen mit Konsonant getrennt (radadtu). | „raddtu“ | Vor -tu, -ta, -nā trennt sich die Verdopplung: radda → radadtu, ḥalla → ḥalalnā. |
| `ar.g.irab` (B1-e10) | Drei Fälle mit Endungen am Nomen (-u, -a, -i). Vertraut: Nominativ, Akkusativ und Genitiv aus dem Deutschen; einen Dativ gibt es nicht, „dem Kind“ heißt li-ṭ-ṭifl. | Endung am Artikel gesucht · Dativ-Endung erfunden | Nominativ, Akkusativ und Genitiv kennst du – nur der Dativ fehlt. Die Endung sitzt am Nomen, nicht am Artikel. |
| `ar.g.fuenf_nomen` (B1-e10) | ab, aḫ und drei weitere Nomen zeigen den Fall mit langem Vokal, wenn sie in einer Iḍāfa stehen oder eine Endung tragen. | „maʿa abūka“ · „raʾaytu abūhu“ | abūka, abāka, abīka: Der lange Vokal zeigt den Fall – nach maʿa also abīka. |
| `ar.g.diptota` (B1-e11) | Manche Nomen haben kein Tanwīn und im Genitiv -a: Pluralmuster wie madāris, Farben, Elative und viele Ortsnamen. | „fī madārisin“ · „min Tūnisin“ | Kein Tanwīn und -a statt -i: fī madārisa kaṯīratin, min Tūnisa. In Pausa hört man es nicht – wichtig beim Vorlesen. |
| `ar.g.modi_ueberblick` (B1-e11) | Drei Formen des Präsens: Indikativ (-u), Konjunktiv (-a nach an, li-, lan …) und Jussiv (ohne Endung nach lam, nach lā des Verbots, nach li- der Aufforderung). Der arabische „Konjunktiv“ hat mit dem deutschen nichts zu tun. | Konjunktiv als „würde“-Form gedeutet · „lan yaktubu“ | Drei Endungen, drei Gruppen von Signalwörtern: -u normal, -a nach an/li-/lan, keine Endung nach lam und lā (Verbot). |
| `ar.g.partizip_abgeleitet` (B1-e12) | Partizipien der abgeleiteten Stämme mit mu-; aktiv mit -i-, passiv mit -a- (mustaʿmil – mustaʿmal). Viele Berufe entstehen so. | „mustaʿmil“ für „gebraucht“ | Ein Vokal entscheidet: mustaʿmil (Nutzer) – mustaʿmal (gebraucht). Berufe auf mu-: mudarrib, muhandis. |
| `ar.g.qad` (B1-e12) | qad + Vergangenheit = „schon, tatsächlich“; qad + Präsens = „vielleicht, manchmal“. | „qad yataʾaḫḫaru“ als „ist schon verspätet“ verstanden | qad vor der Vergangenheit heißt „schon“, vor dem Präsens „vielleicht“: qad yataʾaḫḫaru l-qiṭār. |
| `ar.g.elativ_umschreibung` (B1-e13) | Wo afʿal nicht geht, steigert man mit akṯar, ašadd oder aqall und einem Nomen im Akkusativ. Im Deutschen geht „-er“ bei fast allen Adjektiven. | „akṯar naẓīf“ | akṯar + Nomen im Akkusativ: akṯar naẓāfatan = sauberer (wörtlich: mehr an Sauberkeit). |
| `ar.g.verb_doppelt_schwach` (B1-e13) | Die häufigsten Verben sind unregelmäßig (raʾā – yarā, ǧāʾa – yaǧīʾu). Vertraut: unregelmäßige Verben wie sehen – sah. | „yarʾā“ · „yaǧūʾu“ | Wie sehen – sah – gesehen als Reihe lernen: raʾā – yarā, ǧāʾa – yaǧīʾu, atā – yaʾtī. |
| `ar.g.nisba_abstrakt` (B1-e14) | Abstrakta auf -iyya (insāniyya, masʾūliyya), immer feminin. Vertraut: deutsche Endungen -heit, -keit, -ität. | „al-masʾūliyya kabīr“ | -iyya entspricht oft -heit, -keit oder -ität: insāniyya = Menschlichkeit. Immer feminin. |
| `ar.g.satzverbindung` (B1-e14) | bal (sondern), immā … aw (entweder … oder), lā … wa-lā (weder … noch). Vertraut: Das Deutsche hat wie das Arabische ein eigenes Wort für „sondern“. | „laysa sahlan lākin mumtiʿ“ | Wie im Deutschen: „nicht …, sondern …“ = laysa … bal …; lākin heißt „aber“. |
| `ar.g.indirekte_frage` (B1-e15) | Indirekte Fragen behalten ihr Fragewort; „ob“ heißt hal oder iḏā kāna. Die Wortstellung bleibt wie im Hauptsatz. | „lā aʿrifu anna matā …“ · Verb ans Ende | „ob“ heißt hal: saʾalatnī hal ʿindī ḫibra. Kein Verb ans Satzende. |
| `ar.g.hoeflichkeit` (B1-e16) | Höflichkeit steckt in festen Wendungen mit Genus (law samaḥt, law samaḥti), nicht in einer Verbform wie dem deutschen „Könnten Sie …?“. | „law samaḥt“ zu einer Frau · Plural als „Sie“ | law samaḥt(i) = wenn du erlaubst. Auf šukran antwortet man ʿafwan oder lā šukr ʿalā wāǧib. |

### 2.5 B2 (28 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `ar.g.passiv_madi` (B2-e01) | Das Passiv entsteht durch andere Vokale (kataba → kutiba); wer handelt, bleibt meist ungenannt. Ohne Vokalzeichen sehen Aktiv und Passiv gleich aus. | „kataba“ als „wurde geschrieben“ gelesen · Handelnder mit min angehängt | kutiba = wurde geschrieben. Die Vokale entscheiden – der Kurs zeigt sie immer. |
| `ar.g.passiv_mudari` (B2-e01) | Passiv im Präsens mit u…a (yuktabu) oder Umschreibung mit tamma + Verbalnomen. | „tamma ttaḫaḏa l-qarār“ (Verb nach tamma) | tamma + Verbalnomen = „ist erfolgt“: tamma ttiḫāḏ al-qarār = Die Entscheidung wurde getroffen. |
| `ar.g.kana_schwestern` (B2-e02) | ṣāra, aṣbaḥa (werden), mā zāla (noch immer), mā dāma (solange) mit Aussage im Akkusativ. mā zāla sieht verneint aus, heißt aber „noch immer“. | „ṣāra Yazan ṭālibun“ · mā zāla als „nicht mehr“ verstanden | Nach ṣāra Akkusativ: ṣāra ṭāliban. mā zāla = noch immer: mā zilnā nabḥaṯu. |
| `ar.g.bedingung_real` (B2-e02) | in + Jussiv oder Vergangenheit in beiden Teilen; iḏā + Vergangenheit. fa- leitet einen Nachsatz ein, der mit sa-, einem Befehl oder ohne Verb beginnt. | „in tadrusu tanǧaḥu“ · „iḏā qubilta sa-tabdaʾu“ ohne fa- | Beginnt der Nachsatz mit sa-, einem Befehl oder einem Nomen, steht fa- davor: iḏā qubilta, fa-sa-tabdaʾu. |
| `ar.g.inna_schwestern` (B2-e03) | Nach inna, anna, lākinna, laʿalla, kaʾanna, layta steht das Subjekt im Akkusativ; die Aussage bleibt im Nominativ – umgekehrt wie nach kāna. | „inna n-naẓāfatu …“ | inna l-bayta kabīrun: Subjekt -a, Aussage -un. Bei kāna ist es umgekehrt. |
| `ar.g.istithna` (B2-e03) | illā (außer) mit Akkusativ im bejahten Satz; ġayr und siwā mit Genitiv. Im Deutschen „außer“ + Dativ. | „illā wāḥidatun“ · „ġayru maṣʿadun“ | Nach illā Akkusativ: illā wāḥidatan. Nach ġayr und siwā Genitiv wie in der Iḍāfa: ġayr maṣʿadin wāḥidin. |
| `ar.g.hal` (B2-e04) | Ein unbestimmter Akkusativ oder ein Satz mit wa- beschreibt den Zustand während einer Handlung. Vertraut: das deutsche Partizip „lächelnd“. | „ḫaraǧa mubtasimun“ · „ḫaraǧa l-mubtasim“ | Wie „lächelnd“: ḫaraǧa mubtasiman – unbestimmt und im Akkusativ. Oder mit wa-: wa-hiya taqraʾ. |
| `ar.g.anfangsverben` (B2-e04) | badaʾa, šaraʿa, aḫaḏa und kāda + Präsens ohne an; lam yaʿud = nicht mehr. | „badaʾa an yamšī“ · „kāda an yansā“ | Nach badaʾa und kāda folgt das Verb direkt: badaʾa yamšī. Anders als „anfangen zu“ kein Verbindungswort. |
| `ar.g.masdar_formen` (B2-e05) | Die abgeleiteten Stämme haben feste Muster für das Verbalnomen. Vertraut: Wie „-ung“ macht das Muster aus dem Verb ein Nomen. | falsches Muster, etwa „taqdima“ statt taqdīm | Jeder Stamm hat sein „-ung“: II tafʿīl (tadrīb = Ausbildung), III mufāʿala (musāʿada), IV ifʿāl (iʿdād), X istifʿāl (istiʿmāl). |
| `ar.g.mafuul_mutlaq` (B2-e05) | Das Verbalnomen des eigenen Verbs im Akkusativ verstärkt oder beschreibt die Handlung. Im Deutschen steht dafür ein Adverb. | „šakarnāhum ǧiddan ǧazīlan“ | Statt „sehr“ wiederholt das Arabische das Verb als Nomen: šakarnāhum šukran ǧazīlan = wir haben ihnen herzlich gedankt. |
| `ar.g.masdar_satz` (B2-e06) | Ein an-Satz lässt sich durch das Verbalnomen ersetzen; der Handelnde folgt in der Iḍāfa. Vertraut: Amtsdeutsch („vor Einreichung des Antrags“). | „qabla an taqdīm …“ (beides gemischt) | Wie im Amtsdeutsch: qabla taqdīm aṭ-ṭalab = vor Einreichung des Antrags. |
| `ar.g.verneinung_ueberblick` (B2-e06) | Jede Zeit hat ihre Verneinung: lā (Präsens, Verbot), mā (Vergangenheit), lam (Jussiv), lan (Zukunft), laysa (ohne Verb); dazu ġayr (un-) und ʿadam (das Nicht-…). | „lā ḏahabtu ams“ · „lā ṣāliḥ“ für „ungültig“ | lā für jetzt, lam für gestern, lan für morgen, laysa ohne Verb. „un-“ vor Adjektiven: ġayr ṣāliḥ. |
| `ar.g.bedingung_irreal` (B2-e07) | Für „wäre/würde“ gibt es keine eigene Verbform: law + Vergangenheit, im Nachsatz oft la- + Vergangenheit; lawlā + Nomen = „wenn … nicht wäre“. | „law kuntu … sa-arkabu“ | law kuntu makānaka la-rakibtu d-darrāǧa = Wenn ich an deiner Stelle wäre, würde ich Fahrrad fahren. |
| `ar.g.brueche_prozent` (B2-e07) | Brüche nach dem Muster fuʿl (ṯulṯ, rubʿ, ḫums); Prozent mit fī l-miʾa; Plural der Brüche (ṯalāṯat arbāʿ). | „ṯalāṯa rubʿ“ für drei Viertel | Prozent heißt fī l-miʾa („im Hundert“): ʿišrūna fī l-miʾa. Drei Viertel: ṯalāṯat arbāʿ. |
| `ar.g.tamyiz` (B2-e08) | Ein unbestimmter Akkusativ nennt, worin etwas gilt (akṯar amānan). Im Deutschen reicht das Adjektiv (sicherer). | „akṯar amān“ | Das Nomen nach akṯar und aqall steht unbestimmt im Akkusativ: aqall kulfatan = günstiger. |
| `ar.g.konzessiv` (B2-e08) | raġma + Nomen (wie „trotz“), raġma anna + Satz (obwohl), wa-in (selbst wenn). | „raġma l-maṭaru“ · „raġma r-rusūm qalīla“ ohne anna | raġma vor einem Nomen: raġma l-maṭari. Vor einem Satz braucht es anna: raġma anna r-rusūma qalīlatun. |
| `ar.g.mafuul_lahu` (B2-e09) | Ein Verbalnomen im Akkusativ nennt den Grund (iḥtirāman). Das Deutsche sagt „aus Respekt“ mit Präposition. | „min iḥtirām“ | „aus Respekt“ heißt iḥtirāman – ohne Präposition, im Akkusativ. |
| `ar.g.textverbinder` (B2-e09) | ammā … fa- (was … betrifft), iḏ (da), ḏālika anna (denn), illā anna (jedoch). Nach ammā muss fa- folgen. | „ammā l-muḫtariʿ kāna …“ ohne fa- | Nach ammā … gehört fa- vor den Kommentar: ammā l-ǧihāzu fa-ġālin. |
| `ar.g.relativ_man_ma` (B2-e10) | man (wer) und mā (was) ohne Bezugswort; mit Präposition verschmelzen sie (mimmā, ʿammā). | man und mā vertauscht · „min mā“ getrennt | man für Personen, mā für Dinge: hāḏā mā naḥtāǧuhu = Das ist, was wir brauchen. |
| `ar.g.zweck_negativ` (B2-e10) | „damit nicht“: li-allā (aus li + an + lā), ḥattā lā oder li-kay lā mit Konjunktiv. | „li-lā“ · „li-an lā“ | li + an + lā verschmelzen zu li-allā: li-allā yanzaliqa aḥad. |
| `ar.g.zeitenfolge` (B2-e11) | kāna qad + Vergangenheit (hatte getan), sa-yakūnu qad (wird getan haben), kāna sa- (wollte, würde). Vertraut: Auch das Deutsche bildet diese Zeiten mit Hilfsverben. | „kāna yadfaʿu“ für „hatte bezahlt“ (Gewohnheit statt Vorvergangenheit) | Wie „hatte bezahlt“: kāna qad dafaʿa. „Ich wollte dich anrufen“: kuntu sa-attaṣilu bika. |
| `ar.g.briefform` (B2-e11) | Förmliche Briefe haben feste Teile: Anrede, Betreff, Bezug, Schlussformel. Vertraut ist die Gliederung; die Formeln sind anders. | Anrede wörtlich nach „Sehr geehrte“ gebildet · Schluss mit dem Vornamen | Wie „Sehr geehrte Frau …“: as-sayyida al-muḥtarama. Schluss: maʿa fāʾiq al-iḥtirām. |
| `ar.g.ordinal_gross` (B2-e12) | Ordnungszahlen über zehn; „ein-“ heißt in Ordnungszahlen al-ḥādī. Jahrhunderte mit al-qarn, Jahrzehnte im Plural (sabʿīnāt). | „al-qarn al-wāḥid wa-l-ʿišrūn“ | Das 21. Jahrhundert ist al-qarn al-ḥādī wa-l-ʿišrūn – Einer zuerst, „ein-“ als al-ḥādī. |
| `ar.g.vergleichssatz` (B2-e12) | kamā und miṯlamā (wie) vor einem Satz, ka- und miṯla vor einem Nomen, kaʾanna (als ob) mit Akkusativ. | „ka-kānū …“ · „miṯla kānū …“ | Vor einem Nomen miṯla: miṯla aǧdādinā. Vor einem Satz kamā: kamā kānū yaʿmalūna. |
| `ar.g.hamza_schreibung` (B2-e13) | Der Träger der Hamza richtet sich nach den Vokalen davor und danach (Rangfolge i, u, a, Sukūn). Das Deutsche schreibt den Knacklaut nicht. | Hamza immer auf alif geschrieben | Der stärkste Vokal neben der Hamza bestimmt den Träger: i vor u vor a. Beispiele: suʾāl, masʾala, biʾr. |
| `ar.g.modalausdruecke` (B2-e14) | Unpersönliche Ausdrücke (min aḍ-ḍarūrī an, yuqālu). Für „man sagt“ steht das Passiv; das arabische man heißt „wer“. | „man yaqūlu …“ für „man sagt …“ (heißt: wer sagt?) | „man sagt“ heißt yuqālu. „Es ist nötig, dass …“: min aḍ-ḍarūrī an … |
| `ar.g.indirekte_rede` (B2-e15) | Redewiedergabe mit qāla inna, ḏakara anna; Person und Zeit wechseln in die Sicht der Berichtenden. Einen Konjunktiv I gibt es nicht. | Konjunktiv-Form gesucht · „qāla anna“ | Für die Redewiedergabe genügen qāla inna oder ḏakara anna – kein Konjunktiv nötig. |
| `ar.g.unechte_idafa` (B2-e16) | Adjektiv + bestimmtes Nomen beschreibt knapp eine Eigenschaft (sahl al-istiʿmāl). Vertraut: deutsche Komposita wie „pflegeleicht“. | „ǧihāz sahl istiʿmāl“ ohne Artikel | Wie „pflegeleicht“: ǧihāz sahl al-istiʿmāl = ein leicht zu bedienendes Gerät. |

### 2.6 C1 (14 IDs)

| ID (Einheit) | Problem | typischer Fehler | Tipp-Idee |
|---|---|---|---|
| `ar.g.nominalstil` (C1-e01) | Die Schriftsprache verdichtet mit Verbalnomen (qāma bi-, tamma, ʿamila ʿalā). Vertraut: Funktionsverbgefüge wie „zur Anwendung bringen“. | Nominalstil im Gespräch · Verb und Verbalnomen doppelt | Wie „eine Entscheidung treffen“: qāmat aš-šarika bi-taṭwīr barnāmaǧ = die Firma hat ein Programm entwickelt. |
| `ar.g.amtssprache` (C1-e02) | Feste Amtswendungen: bi-mūǧib (gemäß), wafqan li- (laut), ʿalā an (unter der Bedingung, dass), mā lam (sofern nicht). | „wafqan al-qānūn“ ohne li- | Amtswendungen als Ganzes lernen wie „gemäß“ und „sofern nicht“: wafqan li-l-qānūn. |
| `ar.g.berichtsstil` (C1-e03) | Quellen nennen und Aussagen gewichten: wafqan li-, naqlan ʿan, bi-ḥasab, afādat … bi-anna. Die Quelle steht oft am Satzanfang. | Quelle am Satzende wie im Deutschen nachgestellt | Wie „Laut … / Nach Angaben von …“ steht die Quelle vorn: naqlan ʿan al-baladiyya … |
| `ar.g.vermutung` (C1-e04) | Vermutung mit rubbamā, qad + Präsens, laʿalla + Akkusativ, yabdū anna, min al-muḥtamal an. Im Deutschen reichen Partikeln wie „wohl“. | „laʿalla š-šabābu …“ | „wohl, vermutlich“: rubbamā; „anscheinend“: yabdū anna; „wahrscheinlich“: min al-muḥtamal an. |
| `ar.g.idafa_ketten` (C1-e05) | In mehrgliedrigen Iḍāfa-Ketten trägt nur das letzte Glied den Artikel; ein Adjektiv zum ersten Glied steht am Ende der Kette. | „bāb al-madrasat al-madīna“ · Adjektiv direkt nach dem ersten Glied | Nur das letzte Glied hat den Artikel. Das Adjektiv zum ersten Glied wandert ans Ende; die Endung zeigt, wozu es gehört. |
| `ar.g.argumentation` (C1-e06) | Konnektoren mit Präposition: min ṯamma, bi-nāʾan ʿalā, fī ḥīn, ʿalāwatan ʿalā, faḍlan ʿan. | Präposition im Konnektor weggelassen | bi-nāʾan ʿalā ḏālika = aufgrund dessen; fī ḥīn = während hingegen. Als Ganzes lernen. |
| `ar.g.wortbildung_modern` (C1-e07) | Neue Wörter entstehen über Wurzel und Muster (ḥāsūb aus ḥ-s-b), über Nisba-Abstrakta, mit lā- und ġayr oder als Lehnwörter. Vertraut: „Rechner“ aus „rechnen“. | Lehnwort gewählt, wo ein arabisches Wort üblich ist | ḥāsūb wie „Rechner“ aus „rechnen“. lā- entspricht „-los“: lā-silkī = drahtlos. |
| `ar.g.hervorhebung` (C1-e08) | Objekt oder Ortsangabe nach vorn, mit Rückverweis-Pronomen am Verb; innamā (nur, vielmehr); inna und la- zur Bekräftigung. Vertraut: Auch das Deutsche stellt Betontes nach vorn. | „hāḏā l-ʿaqdu qaraʾtu“ ohne Rückverweis | Wie „Diesen Vertrag habe ich ganz gelesen“ – aber mit Pronomen am Verb: hāḏā l-ʿaqdu qaraʾtuhu kāmilan. |
| `ar.g.verneinung_stil` (C1-e08) | „nie“ hat zwei Formen: mā … qaṭṭ (Vergangenheit), lan … abadan (Zukunft); dazu laysa … bi- (keineswegs). | „lan … qaṭṭ“ · „mā … abadan“ | qaṭṭ für die Vergangenheit: mā raʾaytuhu qaṭṭ. abadan für die Zukunft: lan ansāka abadan. |
| `ar.g.tawkid_badal` (C1-e09) | Bekräftigung mit nafs, ʿayn, kull, ǧamīʿ + Endung nach dem Nomen; Apposition (Badal). nafs vor dem Nomen heißt dagegen „derselbe“. | „nafs al-mudīra raddat“ für „die Direktorin selbst“ | nafs vorn = derselbe (nafs al-yawm); nafs hinten mit Endung = selbst (al-mudīra nafsuhā). |
| `ar.g.redewendungen` (C1-e10) | Feste Bilder und Sprichwörter haben eigene Bildwelten; wörtlich übertragen werden sie oft missverstanden. Nur weltliche Wendungen aus der Liste der Redaktion. | deutsches Sprichwort Wort für Wort übersetzt | Bilder nicht wörtlich übertragen, sondern ein deutsches Gegenstück suchen: yad wāḥida lā tuṣaffiq ≈ „Allein schafft man es nicht“. |
| `ar.g.paraphrase` (C1-e11) | Umformulieren durch Wechsel zwischen Nominalstil und Verbalsatz, Passiv und Aktiv; Zusammenfassen mit festen Formeln. | Umformulierung bleibt im Nominalstil | Mit anderen Worten: bi-ʿibāra uḫrā. tamma taslīm al-mašrūʿ ↔ sallamnā l-mašrūʿ. |
| `ar.g.stilmittel` (C1-e12) | Parallelismus, Paarformeln, rhetorische Frage, Gegensatz. Vertraut: deutsche Zwillingsformeln wie „Jung und Alt“. | Paarformel ohne Akkusativ | Wie „Jung und Alt“: ṣiġāran wa-kibāran. Rhetorische Frage mit a-laysa …? |
| `ar.g.register` (C1-e13) | Fuṣḥā in Nachrichten, Amt und Literatur; im Alltag sprechen viele eine regionale Umgangssprache mit anderer Verneinung, Zukunft und Wortschatz. Der Abstand ist größer als zwischen Hochdeutsch und Mundart. | Dialektwort in einen Fuṣḥā-Text übernommen | Ähnlich wie Hochdeutsch und Mundart, nur weiter auseinander. Dialekte an Verneinung und Zukunft erkennen (§5.2). |

## 3 Wortschatz

### 3.1 Falsche und halbe Freunde

Direkte Klangähnlichkeit zwischen Arabisch und Deutsch ist selten. Die meisten Fallen entstehen über gemeinsame Lehnwörter, über das Englische und Französische und über Dialektwörter. „teilweise“ heißt: Die Bedeutungen überschneiden sich nur zum Teil; „Klang“ heißt: Die Wörter sind nicht verwandt, klingen aber ähnlich.

| Arabisch (Umschrift) | Bedeutung | ähnliches deutsches Wort | dessen Bedeutung | für das deutsche Wort sagt man | Einheit |
|---|---|---|---|---|---|
| ṭāwila | Tisch | die Tafel | Schultafel; gedeckte Festtafel | sabbūra (Schultafel) | A1-e02, teilweise (beide aus lat. tabula, ṭāwila über ital. tavola) |
| ustāḏ | Lehrer; Professor; höfliche Anrede | der Professor | nur Hochschullehrer | ustāḏ ǧāmiʿī | A1-e02, teilweise |
| ḥammām | Badezimmer, Toilette; auch Badehaus | der Hammam | Dampfbad | ḥammām (Badehaus) | A1-e03, teilweise |
| kanaba | Sofa | das Kanapee | belegtes Häppchen; veraltet auch Sofa | šaṭīra ṣaġīra (Häppchen) | A1-e03, teilweise |
| ṣālūn, ṣāla (dialektal) | Wohnzimmer, Empfangsraum | der Salon | Friseursalon, Ausstellungsraum | ṣālūn (Friseur), maʿraḍ | A1-e03, dialektal |
| ṣifr | Null | die Ziffer | Zahlzeichen 0 bis 9 | raqm | A1-e04 |
| maktaba | Bibliothek; Buchhandlung; Bücherregal | die Bibliothek | nur zum Ausleihen | maktaba (Kontext klärt) | A1-e05, teilweise |
| sūq | Markt jeder Art | der Suk | orientalischer Basar | sūq (teilweise) | A1-e07, teilweise |
| barqūq | Pflaume | die Aprikose | Steinfrucht (Wort arabischer Herkunft) | mišmiš | A1-e07 |
| ṭāsa | Schale, Napf | die Tasse | Trinkgefäß mit Henkel | finǧān (Tasse), kūb (Becher) | A1-e10 |
| šāy | Tee jeder Art | der Chai | Gewürztee mit Milch | šāy bi-l-bahārāt | A1-e10, teilweise |
| qahwa | Kaffee (Getränk) | das Café | Lokal | maqhā | A1-e10, teilweise |
| duktūr | Arzt; Doktortitel | der Doktor | Titel; im Alltag auch Arzt | ṭabīb (Arzt) | A1-e12, teilweise |
| safar | Reise | die Safari | Reise zur Tierbeobachtung | riḥlat safārī | A2-e04, teilweise |
| mawsim | Saison, Zeit im Jahr | der Monsun | Regenzeit und Wind in Südasien | ar-riyāḥ al-mawsimiyya | A2-e04 |
| muhandis | Ingenieur; auch höfliche Anrede | der Ingenieur | nur Beruf, keine Anrede | muhandis; als Anrede as-sayyid … | A2-e12, teilweise |
| bank | Geldinstitut | die Bank | auch Sitzbank | maqʿad (Sitzbank) | A2-e14, teilweise |
| baṭṭāriyya | Batterie; auch Akku | die Batterie | nicht aufladbar | baṭṭāriyya qābila li-š-šaḥn | B1-e07, teilweise |
| maḫzan | Lager, Speicher | das Magazin | Zeitschrift (auch Lager) | maǧalla | B1-e12 |
| bakālūriyā | Abitur (Levante, Maghreb) | der Bachelor | Hochschulabschluss | līsāns, bakālūriyūs | B2-e02 |
| līsāns | Bachelor, Hochschulabschluss (regional) | die Lizenz | Erlaubnis, Nutzungsrecht | tarḫīṣ | B2-e02 |
| dīwān | Amt, Kanzlei; Gedichtsammlung | der Diwan | Liegesofa; auch Gedichtsammlung | kanaba, arīka (Sofa) | B2-e06, teilweise |
| taʿrīf | Definition; Vorstellung | der Tarif | Preis- oder Lohnordnung | taʿrīfa | C1-e07 |

### 3.2 Lehnwörter

**Deutsche Wörter arabischer Herkunft.** Sie kamen meist über das Italienische, Spanische, Französische oder Persische ins Deutsche; die Bedeutung hat sich oft verschoben. Herkunft nach gängigen Herkunftswörterbüchern, Einzelheiten zu prüfen (KD-ard-04). Tipps nutzen sie als Merkhilfe für Wurzel und Bedeutung.

| Deutsch | Arabisch (Umschrift) | Hinweis |
|---|---|---|
| der Zucker | sukkar | Vertraut |
| der Kaffee | qahwa | über das Türkische |
| der Mokka | al-Muḫā | Name einer Hafenstadt |
| die Tasse | ṭāsa | ṭāsa ist eine Schale (§3.1) |
| die Karaffe | ġarrāfa | Vertraut |
| die Matratze | maṭraḥ | maṭraḥ heißt „Ort, wo man etwas hinlegt“; Matratze heißt farša oder martaba |
| das Magazin | maḫzan | maḫzan ist ein Lager (§3.1) |
| der Tarif | taʿrīfa | taʿrīf ist eine Definition (§3.1) |
| die Ziffer | ṣifr | ṣifr ist die Null (§3.1) |
| die Algebra | al-ǧabr | Wurzel ǧ-b-r („wiederherstellen, ergänzen“) |
| der Algorithmus | al-Ḫwārizmī | Name eines Mathematikers |
| die Chemie | al-kīmiyāʾ | über „Alchemie“; heute kīmiyāʾ |
| das Karat | qīrāṭ | Gewichtseinheit |
| der Scheck | ṣakk | Herkunft umstritten: die Wörterbücher führen Scheck meist auf engl. cheque/check zurück; nicht als Merkhilfe nutzen; heute meist šīk |
| die Tara | ṭarḥ | ṭarḥ heißt „Abzug“ (Rechnen: Minus) |
| der Safran | zaʿfarān | Vertraut |
| die Aubergine | bāḏinǧān | über Katalanisch und Französisch |
| die Artischocke | ḫaršūf | Vertraut |
| die Limone | laymūn | laymūn ist die Zitrone |
| die Aprikose | barqūq | barqūq ist die Pflaume (§3.1) |
| der Jasmin | yāsamīn | über das Persische; Vorname Yāsmīn |
| die Giraffe | zarāfa | Vertraut |
| der Admiral | amīr (al-…) | amīr heißt „Befehlshaber, Fürst“ |
| der Monsun | mawsim | mawsim ist eine Saison (§3.1) |
| die Safari | safar | über Swahili; safar ist jede Reise |
| der Diwan | dīwān | über das Persische; dīwān ist ein Amt (§3.1) |

### 3.3 Internationalismen

**Lehnwörter im Arabischen.** Das Hocharabische hat für viele moderne Dinge ein arabisches Wort und ein Lehnwort. Der Kurs lehrt das arabische Wort aktiv und lässt das Lehnwort erkennen (Rahmenplan `ar.g.wortbildung_modern`).

| Sache | arabisches Wort | Lehnwort | Hinweis |
|---|---|---|---|
| Telefon | hātif | tilifūn | Vertraut: tilifūn |
| Computer | ḥāsūb | kumbyūtar | ḥāsūb aus ḥ-s-b „rechnen“ |
| Fernseher | tilfāz | tilifizyūn | tilfāz ist eine Kurzform |
| Bus | ḥāfila | bāṣ | bāṣ aus dem Englischen |
| Zug | qiṭār | – | – |
| Bank | maṣraf | bank | Plural bunūk |
| Arzt | ṭabīb | duktūr | Plural dakātira |
| Film | – | film | Plural aflām |
| Internet | – | intarnit | Vertraut |
| Visum | taʾšīra | fīzā | Vertraut |
| Kilo, Meter, Liter | – | kīlū, mitr, lītr | Vertraut |
| Euro | – | yūrū | Vertraut |
| Tomaten, Kartoffeln | – | ṭamāṭim, baṭāṭā | Vertraut |
| Programm | barnāmaǧ | – | über das Persische |
| Monate | – | yanāyir, fabrāyir … | erste Reihe der Monatsnamen (§4.6) |

**Lautanpassung.** Wer die Regeln kennt, erkennt Internationalismen schneller:
- p wird zu b (bīzzā), v zu f (fīdyū, fīzā), g zu ġ oder ǧ (ġrām, ǧuġrāfiyā).
- e und o werden zu i, ī, u oder ū (tilifūn, ūrūbbā).
- -ie und -ia werden zu -iyā (almāniyā, ǧuġrāfiyā).
- Lehnwörter bekommen oft gebrochene Plurale: film – aflām, bank – bunūk, duktūr – dakātira.

**Anteil.** Unter den häufigen deutschen Nomen haben nur etwa 6–10 % eine ähnlich klingende arabische Übersetzung (Messung im Gegenstück `kontrast-de-aus-ar.md` §7). Internationalismen tragen den Anfang also weniger als in europäischen Sprachen.

### 3.4 Wortfelder mit anderer Einteilung

| Wortfeld | Deutsch | Arabisch | Hinweis für Tipps |
|---|---|---|---|
| Onkel, Tante | ein Wort je Geschlecht | ʿamm, ʿamma (Seite des Vaters); ḫāl, ḫāla (Seite der Mutter) | A1-e04, A2-e10 |
| Cousin, Cousine | ein Wort je Geschlecht | ibn ʿamm, bint ḫāla usw. | A2-e02 |
| Schüler, Student | zwei Wörter | ṭālib für beide; tilmīḏ für Schulkinder | A1-e02 |
| Lehrer | ein Wort | muʿallim (Schule), mudarris (Unterrichtender), ustāḏ (auch Professor und Anrede) | A1-e02 |
| Uhr, Stunde, Uhrzeit | drei Wörter | sāʿa für alle drei | A1-e09 |
| Zeit | ein Wort | waqt (Zeitpunkt, Zeit haben), zaman (Zeitraum, Zeitalter), marra (Mal) | A1-e06 |
| Jahr | ein Wort | sana, ʿām | A1-e04 |
| Haus, Wohnung, Zimmer | drei Wörter | bayt (Haus, Zuhause), manzil (Wohnhaus), šaqqa (Wohnung), ġurfa (Zimmer) | A1-e03, B1-e03 |
| Tisch, Schreibtisch | Kompositum | ṭāwila; maktab (auch Büro) | A1-e02 |
| Bein und Fuß, Finger und Zeh | getrennt | riǧl (Bein und Fuß), qadam (Fuß, Schritt), iṣbaʿ (Finger und Zeh) | A1-e12 |
| gehen, fahren | getrennt | ḏahaba (gehen, fahren, hingehen), mašā (zu Fuß gehen), rakiba (einsteigen, fahren mit), sāqa (ein Fahrzeug lenken) | A2-e01 |
| wissen, kennen | getrennt | ʿarafa (kennen, wissen), ʿalima (wissen, erfahren) | A2-e03 |
| lernen, studieren | getrennt | darasa (lernen, studieren), taʿallama (erlernen) | B1-e02 |
| sprechen, sagen | getrennt | takallama (sprechen), qāla (sagen), taḥaddaṯa (sich unterhalten) | A1-e01 |
| Wetter, Luft | getrennt | ṭaqs, ǧaww (Wetter), hawāʾ (Luft) | A1-e11 |
| Fach, Sport | – | riyāḍa (Sport), riyāḍiyyāt (Mathematik) | A1-e09 |
| Gericht, Essen | – | ṭaʿām (Essen), akla (Gericht), waǧba (Mahlzeit) | A1-e10 |
| Adresse, Titel | zwei Wörter | ʿunwān (Adresse und Überschrift) | A2-e03 |
| Stadtverwaltung, Rathaus, Gemeinde | drei Wörter | baladiyya für alle drei; madīna ist die Stadt selbst | B2-e14 |
| Passwort | Kompositum | kalimat sirr („Wort des Geheimnisses“) | B1-e07 |
| Erfahrung | ein Wort | ḫibra (im Beruf), taǧriba (Versuch, Erlebnis) | B1-e15 |

**Wochentage.** Die arabische Woche zählt ab Sonntag: al-aḥad (der erste), al-iṯnayn (der zweite = Montag), aṯ-ṯulāṯāʾ, al-arbiʿāʾ, al-ḫamīs, dann al-ǧumʿa und as-sabt. Die Namen von Sonntag bis Donnerstag sind Zahlwörter – eine Merkhilfe, keine Falle, sobald man den Wochenbeginn kennt.

### 3.5 Englisch als Brücke

Viele Lernende kennen Englisch aus der Schule. Das hilft:
- **Laute:** th in „think“ und „this“ entspricht ṯ und ḏ; das englische w dem arabischen w.
- **Internationalismen:** Viele kamen über das Englische (bāṣ, tāksī, intarnit, fīdyū).
- **Grenzen:** Englische Wortstellung (Subjekt – Verb – Objekt) ist im Arabischen möglich, aber der Verbalsatz beginnt oft mit dem Verb (`ar.g.verbalsatz_kongruenz`). Englisch hat wie Arabisch kein grammatisches „Sie“.

## 4 Pragmatik und Höflichkeit

### 4.1 du und Sie

Das Hocharabische hat kein grammatisches „Sie“. anta und anti gelten für alle Personen, auch für Ältere, Lehrkräfte und Ämter. Respekt zeigen Titel, Vornamen mit Titel und in förmlicher Rede ḥaḍratuka/ḥaḍratuki („Ihre Person“, `ar.g.anrede`).

Deutschsprachige suchen oft eine Sie-Form. Typische Folgen: Plural zu einer Person („hal turīdūna …?“) oder Vermeiden der Anrede. Tipps sagen ausdrücklich: anta und anti sind höflich; wichtig ist das richtige Genus.

| Situation | Deutsch | Arabisch | Hinweis |
|---|---|---|---|
| Amt, Arzt, Geschäft, Unbekannte | Sie + Familienname | anta/anti mit Titel: as-sayyid, as-sayyida, duktūr, duktūra | §4.2 |
| Familie, Freunde, Kinder | du | anta/anti | Vertraut |
| Kind zu Lehrkraft | Sie + Frau/Herr + Familienname | yā ustāḏ, yā ustāḏa (mit oder ohne Vorname) | A1-e02 |
| Nachbarn | Sie, bis jemand das Du anbietet | anta/anti mit Titel oder Verwandtschaftswort | A2-e05 |
| Brief, Formular | durchgehend Sie | Einzahl mit Titel und förmlichen Wendungen | §4.5 |
| Gruppe | ihr bzw. Sie | antum (gemischt oder männlich), antunna (nur Frauen) | B1 (`ar.g.dual`) |

### 4.2 Anrede und Namen

- **Titel und Vorname:** Arabisch ehrt mit Titel und Vornamen: al-ustāḏa Nādiya, ad-duktūra Sawsan, as-sayyid Ḫālid. Bei deutschen Namen steht der Familienname: as-sayyida Becker (Rahmenplan, ab A2).
- **Anrufwort yā:** Vor der direkten Anrede steht yā: yā Laylā, yā ustāḏ. Im Deutschen gibt es kein Gegenstück.
- **Verwandtschaftswörter:** Kinder sprechen ältere Bekannte oft als ʿammū oder ḫāla („Onkel“, „Tante“) an (regional, zu prüfen). Im Deutschen nur in der Familie.
- **Elternnamen:** Abū Yazan, Umm Yazan („Vater/Mutter von Yazan“) sind höfliche Anreden für Eltern. Tipps erklären sie als Höflichkeit, nicht als Familiennamen.
- **Familiennamen als Herkunft:** Viele Familiennamen sind Nisba-Formen: al-Ḥalabī (aus Aleppo), aš-Šāmī, al-Baġdādī (`ar.g.nisba`).
- **Namensform:** Arabische Namen reihen Vorname, Name des Vaters und Familienname; in einigen Ländern stehen vier Teile im Ausweis. Formulare: §4.5.

### 4.3 Grüßen, Danken, Bitten, Wünschen

Nur weltliche Formeln (Leitfaden §4.3). Wo die übliche Antwort eine gesperrte Formel ist (etwa auf die Frage nach dem Befinden oder beim Niesen), zeigen Tipps nur die weltliche Form.

| Situation | Arabisch (weltlich) | Antwort | Deutsch | Hinweis |
|---|---|---|---|---|
| Begrüßung | marḥaban, ahlan | marḥaban bik(i), ahlan bik(i) | Hallo | Antwort mit Genus |
| Willkommen | ahlan wa-sahlan | ahlan bik(i) | Willkommen | feste Antwort |
| Morgen | ṣabāḥ al-ḫayr | ṣabāḥ an-nūr | Guten Morgen | Paarantwort |
| Abend | masāʾ al-ḫayr | masāʾ an-nūr | Guten Abend | Paarantwort |
| Abschied | maʿa s-salāma, ilā l-liqāʾ | maʿa s-salāma | Auf Wiedersehen | als feste Wendung (OF-ar-07) |
| Befinden | kayfa ḥāluk(i)? | anā bi-ḫayr, šukran | Wie geht's? | Antwort ohne Formel |
| Danken | šukran, šukran ǧazīlan | ʿafwan, lā šukr ʿalā wāǧib | Danke | ʿafwan heißt hier „gern geschehen“ |
| Bitten | min faḍlik(i), law samaḥt(i) | – | bitte (Bitte) | Genus beachten |
| Anbieten | tafaḍḍal, tafaḍḍalī, tafaḍḍalū | šukran | bitte schön, herein, bedien dich | ein Wort, drei Formen |
| Entschuldigen | āsif, āsifa; ʿuḏran; ʿafwan | lā baʾs | Entschuldigung | āsif mit Genus |
| Essen | bi-l-hanāʾ wa-š-šifāʾ | šukran | Guten Appetit | weltlich (Leitfaden §4.3) |
| Krankheit | šifāʾan ʿāǧilan | šukran | Gute Besserung | A1-e12 |
| Glückwunsch | mabrūk, alf mabrūk | šukran | Herzlichen Glückwunsch | A2-e13 |
| Lob | aḥsanta, aḥsanti; mumtāz | šukran | Gut gemacht | Genus |
| Trauer | aḥarr at-taʿāzī | šukran | Mein Beileid | erst ab B1 (Leitfaden G-12) |

**„bitte“ hat drei Wörter.** min faḍlik (bei einer Bitte), tafaḍḍal (beim Anbieten oder Hereinbitten), ʿafwan (als Antwort auf šukran). Das ist der häufigste Pragmatik-Tipp dieser Richtung (A1-e10).

### 4.4 Gespräch, Kritik, Absagen

- **Rückfragen:** ʿafwan? oder law samaḥt, hal yumkinuka an tuʿīd? (Kannst du das wiederholen?) – freundlich und üblich.
- **Ja, nein, doch:** naʿam, lā. Vertraut: Auf eine verneinte Frage antwortet balā wie „doch“ (a-lam tadrus? – balā = Hast du nicht gelernt? – Doch). Englisch hat dafür kein Wort, Deutsch und Arabisch schon.
- **Zustimmen und widersprechen:** anā muwāfiq / muwāfiqa; lā uwāfiqu; fī raʾyī … (meiner Meinung nach). In Versammlungen (B2-e03) leiten höfliche Formeln Widerspruch ein: maʿa iḥtirāmī li-raʾyik(i) … (zu prüfen).
- **Absagen:** āsif, lā astaṭīʿu, šukran ǧazīlan. Ein kurzes lā, šukran ist höflich. Ob Angebote mehrmals wiederholt werden, ist von Familie zu Familie verschieden; Tipps beschreiben nur die Sprachform, keine Gewohnheit (KD-ard-12).
- **Kritik:** In förmlichen Texten oft über Verbalnomen und Passiv (`ar.g.nominalstil`), im Gespräch mit abschwächenden Wörtern (rubbamā, min al-mumkin).

### 4.5 Briefe, E-Mails, Formulare

| Teil | Deutsch | Arabisch | ab |
|---|---|---|---|
| Anrede förmlich | Sehr geehrte Frau …, Sehr geehrter Herr … | as-sayyida al-muḥtarama …, as-sayyid al-muḥtaram … | B2-e11 |
| Anrede persönlich | Liebe …, Lieber … | ʿazīzatī …, ʿazīzī … | A2-e02 |
| Eröffnung | – | taḥiyya ṭayyiba (weltlicher Gruß) | B2-e11 |
| Betreff | Betreff: | al-mawḍūʿ: | B2-e11 |
| Bezug | Bezug: Ihr Schreiben vom … | bi-l-išāra ilā risālatikum bi-tārīḫ … | B2-e11 |
| Schluss förmlich | Mit freundlichen Grüßen | maʿa fāʾiq al-iḥtirām | B2-e11 |
| Schluss persönlich | Viele Grüße | maʿa taḥiyyātī | A2-e02 |
| Unterschrift | Vorname Familienname | at-tawqīʿ, Name | B1-e11 |

**Formulare.** al-ism (Vorname), ism al-ab (Name des Vaters), ism al-ʿāʾila oder al-laqab (Familienname), tārīḫ al-mīlād und makān al-mīlād (Geburtsdatum und -ort), al-ǧinsiyya (Staatsangehörigkeit), al-ʿunwān (Adresse), raqm al-hātif. Der Name des Vaters ist in deutschen Formularen unbekannt; Tipps erklären ihn als eigenes Feld (A2-e03).

**Gesperrt:** Viele förmliche Schreiben beginnen mit einer religiösen Formel. Sie ist Kandidat F-ar-02 (§4.7) und kommt in Mustern und Tipps nicht vor; das weltliche taḥiyya ṭayyiba ersetzt sie.

### 4.6 Zeit, Zahlen, Formate

- **Ziffern:** Levante, Irak, Ägypten und Golf nutzen meist östlich-arabische Ziffern, der Maghreb europäische. Zahlen stehen auch im arabischen Text von links nach rechts. Die östlich-arabische Fünf sieht aus wie eine Null, die Null ist ein Punkt (Vorkurs `ar.v.l07`).
- **Datum:** Tag, Monat, Jahr wie im Deutschen; gesprochen mit Ordnungszahl und min (al-ʿāšir min abrīl, `ar.g.datum`).
- **Monatsnamen:** zwei Reihen: yanāyir, fabrāyir … (Ägypten, Golf, Marokko) und kānūn aṯ-ṯānī, šubāṭ … (Levante, Irak); Tunesien und Algerien nutzen eigene, französisch geprägte Formen (zu prüfen, KD-ard-07). Der Kurs übt die erste Reihe und lässt die zweite erkennen (OF-ar-08). Islamische Monatsnamen sind nur gesperrter Kandidat R-13.
- **Wochenbeginn:** Die Wochentage zählen ab Sonntag (§3.4).
- **Uhrzeit:** 12-Stunden-Zählung mit ṣabāḥan und masāʾan; Stunde als Ordnungszahl (`ar.g.ordinal_uhrzeit`). „halb“ zählt von der vollen Stunde davor.
- **Beträge:** Zahl vor der Währung (ʿišrūn yūrū), ab 11 mit Gezähltem im Akkusativ Singular (`ar.g.zahl_tamyiz`).

### 4.7 Religiöse Formeln (gesperrt)

Für viele Alltagssituationen gibt es im Arabischen auch religiöse Formeln (Gruß, Pläne, Lob, Dank, Befinden, Niesen, Trauer, Feste). In den Sprachkursen sind sie gesperrte Kandidaten (Leitfaden §4.2, F-ar-01 bis F-ar-17; Rahmenplan §8) und kein Gegenstand dieses Dokuments.
- Tipps nennen nur die weltlichen Entsprechungen aus Leitfaden §4.3 (Tabelle §4.3).
- Kein Tipp erklärt, übersetzt oder bewertet eine religiöse Formel; keine arabische Formel erscheint in Umschrift als Lernziel.
- Sie erscheinen frühestens nach zwei Freigaben der religiösen Prüfung (KERN §2.3, LM-09).

## 5 Hinweise zu Vorwissen und Herkunftssprachlern

Der Auftrag sieht Hinweise für Herkunftssprachler bei der Ausgangssprache Türkisch vor (Gegenstück §5). In `ar-aus-de` lernen aber auch Kinder und Jugendliche aus arabischsprachigen Familien, die Deutsch besser lesen als Arabisch. Für sie gilt dieser Abschnitt.

### 5.1 Wer den Kurs nutzt

| Gruppe | Stärken | typische Lücken | Ausrichtung der Tipps |
|---|---|---|---|
| Deutschsprachige ohne Vorwissen | Lernerfahrung mit Fremdsprachen, oft Englisch | Schrift, Kehllaute, Wurzelsystem, Genus | voller Vorkurs; Laut- und Schrifttipps; Brücken aus dem Deutschen zuerst |
| Herkunftssprachler des Arabischen (Kinder und Jugendliche mit arabischer Familiensprache, Deutsch stärker) | Laute, Hörverstehen, Alltagswortschatz in der Umgangssprache | Schrift, Fuṣḥā-Formen, Fallendungen, Verneinung und Zukunft der Hochsprache | Einstufung je Fertigkeit; Vorkurs teils überspringbar; Tipps §5.2 „Umgangssprache → Fuṣḥā“, ohne Abwertung der Umgangssprache |
| Deutschsprachige mit Elifbe-Vorwissen (z. B. aus türkischsprachigen Familien) | Buchstaben und Lesezeichen | Laute des Hocharabischen, Bedeutung | Vorkurs `ar.v.l02` und `ar.v.l07` empfohlen (OF-ar-16); Hinweis auf `ar-aus-tr` in der Kurswahl |
| Erwachsene mit Englisch oder Französisch | Internationalismen, th-Laute | wie oben | §3.5 |

### 5.2 Herkunftssprachler mit Umgangssprache

Die Umgangssprache ist eine Stärke: Laute wie ḥ, ʿ, ṣ und viel Wortschatz sind schon da. Tipps zeigen die Fuṣḥā-Form als Ergänzung für Schule, Nachrichten und Briefe, nie als Korrektur der Familiensprache (Leitfaden G-04). Die Beispiele sind verbreitete Formen; die Zuordnung zu Regionen ist zu prüfen (KD-ard-07).

| Bereich | Umgangssprache (Beispiele, Region) | Fuṣḥā im Kurs | Tipp |
|---|---|---|---|
| q | als Knacklaut (Levante, Ägypten) oder g (Golf, Irak) | q | qalam, qahwa mit q sprechen |
| ǧ | ž (Levante), g (Ägypten) | ǧ (dsch) | ǧamīl, ǧadīd |
| ṯ, ḏ | t oder s, d oder z (Levante, Ägypten) | ṯ, ḏ | ṯalāṯa, hāḏā |
| ay, aw | ē, ō (bēt, yōm) | ay, aw (bayt, yawm) | Doppellaute sprechen |
| Fallendungen | fehlen | voll vokalisiert, Pausa am Satzende | Endungen beim Vorlesen sprechen (`ar.g.irab`) |
| Präsens | mit b- (Levante, Ägypten) | ohne b-: aktubu | b- weglassen (`ar.g.mudari_sg`) |
| Zukunft | raḥ (Levante), ḥa- (Ägypten), ġādi (Marokko) | sa-, sawfa; verneint lan | `ar.g.sa_sawfa` |
| Verneinung | mā, miš, mū | lā, lam, lan, laysa | `ar.g.verneinung_ueberblick` |
| „wollen“ | biddī (Levante), ʿāyiz (Ägypten), abġā (Golf) | urīdu | `ar.g.wunsch` |
| „was?“ | šū (Levante), ʾēh (Ägypten), šinū (Irak, Golf) | mā, māḏā | `ar.g.fragewoerter` |
| „dieser“ | hāda, hāy (Levante), da, di (Ägypten) | hāḏā, hāḏihi | `ar.g.hinweis` |
| Relativwort | illī für alle | allaḏī, allatī, allaḏīna | `ar.g.relativ` |
| Dual | beim Nomen, nicht beim Verb | auch Verb und Pronomen | `ar.g.dual` |
| feminine Mehrzahl | selten | antunna, hunna, katabna | `ar.g.dual` (B1) |
| Wortschatz | eigene Alltagswörter | Fuṣḥā-Wort | Umgangswort im Alltag nicht falsch, im Kurs gilt das Fuṣḥā-Wort |

### 5.3 Sprache der Tipps

- **Einfaches Deutsch:** kurze Sätze, ein Gedanke je Satz; Beispiele zuerst, dann die Regel.
- **Arabische Beispiele** voll vokalisiert in arabischer Schrift mit `lang="ar"` und `dir="rtl"` (KERN §7); Umschrift nur im Vorkurs und auf Wunsch (KD-ard-09).
- **Fachwörter zweisprachig:** deutscher Begriff zuerst, arabischer in Klammern (OF-ar-09):

| Deutsch | Arabisch (Umschrift) |
|---|---|
| Nomen, Verb, Partikel | ism, fiʿl, ḥarf |
| Wurzel, Muster | ǧaḏr, wazn |
| Nominalsatz, Verbalsatz | ǧumla ismiyya, ǧumla fiʿliyya |
| Vergangenheit, Präsens, Imperativ | māḍī, muḍāriʿ, amr |
| Genitivverbindung | iḍāfa |
| Nominativ, Akkusativ, Genitiv, Jussiv | marfūʿ, manṣūb, maǧrūr, maǧzūm |
| maskulin, feminin | muḏakkar, muʾannaṯ |
| Singular, Dual, Plural | mufrad, muṯannā, ǧamʿ |
| Verbalnomen | maṣdar |
| Partizip aktiv, passiv | ism al-fāʿil, ism al-mafʿūl |
| Zustandsangabe | ḥāl |

### 5.4 Einstufung

- Der Vorkurs `ar.v.l01`–`ar.v.l08` ist für Lernende mit Lesefähigkeit überspringbar; `ar.v.l02` (Laute) und `ar.v.l07` (Tanwīn, Pausa) bleiben empfohlen (OF-ar-16).
- Herkunftssprachler verstehen oft mehr, als sie lesen können. Die Einstufung (Einstufungsbank PLAN §5.1) misst Hören, Lesen und Schreiben getrennt.
- Schrift- und Lauttipps (§1) erscheinen auch auf höheren Stufen, wenn die Einstufung hoch ausfällt, die Schrift aber neu ist.

## 6 Tipp-Themen je Einheit

306 Tipp-Themen für 80 Einheiten-Schlüssel (Vorkurs `ar.v.l01`–`ar.v.l08` und 72 Einheiten). 218 beziehen sich auf eine Grammatik-ID (126 verschiedene IDs), die übrigen auf Laut, Schrift, Wortschatz oder Pragmatik (Abschnitt in der Spalte „Bezug“). Jede Einheit hat mindestens zwei Tipps.

| Stufe | Einheiten | Tipp-Themen | je Einheit |
|---|---|---|---|
| Vorkurs | 8 | 29 | 3,6 |
| A1 | 12 | 68 | 5,7 |
| A2 | 14 | 64 | 4,6 |
| B1 | 16 | 62 | 3,9 |
| B2 | 16 | 52 | 3,2 |
| C1 | 14 | 31 | 2,2 |
| Σ | 80 | 306 | 3,8 |

**Leitlinien für das Schreiben der Tipps (Phase Ü, PLAN §6.3):**
- **Sprache:** Deutsch als Oberflächensprache, einfach und kurz (§5.3): Titel, höchstens zwei Sätze, ein bis drei arabische Beispiele voll vokalisiert mit `lang="ar"` und `dir="rtl"`. Arabische Schrift nur in `web/inhalte/lernapp/uebersetzung/ar-aus-de/**` (KERN §3); hier steht Umschrift.
- **Aufbau:** Brücke zuerst („Das kennst du schon: …“), dann der Unterschied. Keine Wertung der Ausgangssprache; „im Arabischen anders“ statt „falsch“.
- **Ort:** Der Tipp erscheint in der genannten Einheit. Nennt er eine Grammatik-ID, ist sie dort oder früher eingeführt (vom Generator geprüft). Vorkurs-Tipps nennen keine Grammatik-ID.
- **Beispiele:** nur Wortschatz bis zur Einheit (PLAN §6.4), nur Namen aus der Namensliste (Leitfaden §1.1), bis B1 kindgeeignet, ohne Tabu-Lexikon und ohne religiöse Formeln (§4.7); in A1–A2 keine Homographe von Religionsbegriffen (OF-ar-04).
- **Schlüssel:** Vorschlag `ar-aus-de.tipp.<Nr.>`; das Schema legt L3-02 fest.

| Nr. | Einheit | Tipp-Titel | Bezug |
|---|---|---|---|
| 001 | ar.v.l01 | Von rechts nach links – Hefte öffnen sich „von hinten“ | §1.1 |
| 002 | ar.v.l01 | Punkte entscheiden: bāʾ, tāʾ, ṯāʾ, nūn, yāʾ haben eine Grundform | §1.1 |
| 003 | ar.v.l01 | ḫ klingt wie ch in „Bach“ | §1.2 |
| 004 | ar.v.l01 | ṯ und ḏ: wie englisch th in „think“ und „this“ | §1.2 |
| 005 | ar.v.l01 | Keine Groß- und Kleinbuchstaben | §1.1 |
| 006 | ar.v.l02 | ḥ: ein gehauchtes h aus dem Rachen | §1.2 |
| 007 | ar.v.l02 | ʿayn: ein Kehllaut, kein Vokal | §1.2 |
| 008 | ar.v.l02 | q sitzt weiter hinten als k: qāla – kāla | §1.3 |
| 009 | ar.v.l02 | Dunkle Laute ṣ, ḍ, ṭ, ẓ färben die Vokale | §1.2 |
| 010 | ar.v.l02 | Das arabische r wird gerollt – das deutsche r klingt wie ġ | §1.2 |
| 011 | ar.v.l03 | Vier Formen je Buchstabe – der Kern bleibt erkennbar | §1.1 |
| 012 | ar.v.l03 | Sechs Buchstaben verbinden sich nicht nach links | §1.1 |
| 013 | ar.v.l03 | lām und alif bilden ein eigenes Zeichen | §1.1 |
| 014 | ar.v.l04 | Kurze Vokale stehen über und unter dem Buchstaben | §1.1 |
| 015 | ar.v.l04 | Im Kurs ist alles vokalisiert – im Alltag nicht | §1.1 |
| 016 | ar.v.l04 | a klingt hell oder dunkel – je nach Nachbarlaut | §1.2 |
| 017 | ar.v.l05 | Lang und kurz unterscheiden Wörter: ǧamal – ǧamāl | §1.3 |
| 018 | ar.v.l05 | ay und aw sprechen: bayt, yawm | §1.2 |
| 019 | ar.v.l05 | alif, wāw, yāʾ als lange Vokale | §1.1 |
| 020 | ar.v.l06 | Šadda: den Konsonanten wirklich lang sprechen | §1.2 |
| 021 | ar.v.l06 | Doppelbuchstaben im Deutschen sind anders: „Bett“ | §1.2 |
| 022 | ar.v.l06 | Sukūn: Silbe ohne Vokal schließen | §1.1 |
| 023 | ar.v.l07 | Pausa: Am Satzende fällt die kurze Endung weg | §1.4 |
| 024 | ar.v.l07 | Tāʾ marbūṭa: -a am Ende, -at in Verbindung | §1.1 |
| 025 | ar.v.l07 | Ziffern: auch im arabischen Text von links nach rechts | §1.1 |
| 026 | ar.v.l08 | Kein Knacklaut vor al- im Satz: fī l-bayt | §1.2 |
| 027 | ar.v.l08 | Sonnenbuchstaben: Das l wird zum nächsten Laut | §1.1 |
| 028 | ar.v.l08 | Hamza ist der deutsche Knacklaut – auch mitten im Wort | §1.2 |
| 029 | ar.v.l08 | Umschrift lesen: z ist ein summendes s, nicht „ts“ | §1.5 |
| 030 | ar.a1.e01 | anta oder anti: Wen sprichst du an? | `ar.g.personalpron` |
| 031 | ar.a1.e01 | Kein „Sie“ – anta und anti sind auch höflich | §4.1 |
| 032 | ar.a1.e01 | Im Präsens fehlt „bin/ist“: anā Laylā | `ar.g.nominalsatz` |
| 033 | ar.a1.e01 | Mädchen sagen almāniyya, Jungen almānī | `ar.g.nisba` |
| 034 | ar.a1.e01 | Sprachen mit Artikel: al-ʿarabiyya | `ar.g.nisba` |
| 035 | ar.a1.e01 | ṣabāḥ al-ḫayr – ṣabāḥ an-nūr: Grüße mit fester Antwort | §4.3 |
| 036 | ar.a1.e02 | Zwei Genera statt drei – kein Neutrum | `ar.g.genus` |
| 037 | ar.a1.e02 | -a am Ende: fast immer feminin | `ar.g.genus` |
| 038 | ar.a1.e02 | Das deutsche Genus hilft nicht: das Haus → al-bayt (m.) | `ar.g.genus` |
| 039 | ar.a1.e02 | hāḏā qalam ist schon ein ganzer Satz | `ar.g.hinweis` |
| 040 | ar.a1.e02 | hal vorn – sonst ändert sich nichts | `ar.g.fragepartikel` |
| 041 | ar.a1.e02 | ustāḏ: Lehrer, Professor und höfliche Anrede | §3.1 |
| 042 | ar.a1.e02 | ṭāwila ist der Tisch, die Tafel heißt sabbūra | §3.1 |
| 043 | ar.a1.e03 | „ein“ steckt im Tanwīn | `ar.g.artikel` |
| 044 | ar.a1.e03 | wāḥid heißt „eins“, nicht „ein“ | `ar.g.artikel` |
| 045 | ar.a1.e03 | Sonnenbuchstaben: Zungenspitze vorn – das l verschwindet | `ar.g.sonne_mond` |
| 046 | ar.a1.e03 | Das Adjektiv steht hinten und passt sich an | `ar.g.adjektiv` |
| 047 | ar.a1.e03 | al-bayt al-kabīr oder al-bayt kabīr: Ausdruck oder Satz | `ar.g.adjektiv` |
| 048 | ar.a1.e03 | ḥammām: auch das ganz normale Badezimmer | §3.1 |
| 049 | ar.a1.e04 | -hu und -hā: wie „sein“ und „ihr“ | `ar.g.suffix_nomen` |
| 050 | ar.a1.e04 | Mit Endung kein Artikel: baytī | `ar.g.suffix_nomen` |
| 051 | ar.a1.e04 | Aus -a wird -at-: ġurfa → ġurfatī | `ar.g.suffix_nomen` |
| 052 | ar.a1.e04 | „Ich habe“ heißt „bei mir“: ʿindī | `ar.g.besitz_inda` |
| 053 | ar.a1.e04 | ʿindī, lī, maʿī: drei Arten von „haben“ | `ar.g.besitz_inda` |
| 054 | ar.a1.e04 | ʿamm oder ḫāl: zwei Wörter für Onkel | §3.4 |
| 055 | ar.a1.e04 | kam ʿumruka? – Alter mit ʿumr | `ar.g.zahlen_bis_10` |
| 056 | ar.a1.e05 | Nach fī, ʿalā, taḥta immer -i | `ar.g.praep_ort` |
| 057 | ar.a1.e05 | Einfacher als im Deutschen: kein Wechsel nach wo und wohin | `ar.g.praep_ort` |
| 058 | ar.a1.e05 | Unbestimmtes nie an den Satzanfang: fī l-ġurfa sarīr | `ar.g.hunaka` |
| 059 | ar.a1.e05 | man heißt „wer“ – nicht „man“ | `ar.g.fragewoerter` |
| 060 | ar.a1.e05 | mā vor Nomen, māḏā vor Verben | `ar.g.fragewoerter` |
| 061 | ar.a1.e05 | maktaba: Bibliothek und Buchhandlung | §3.1 |
| 062 | ar.a1.e06 | Die Person steht vorn am Verb: a-, ta-, ya- | `ar.g.mudari_sg` |
| 063 | ar.a1.e06 | taktub: „du schreibst“ und „sie schreibt“ | `ar.g.mudari_sg` |
| 064 | ar.a1.e06 | Ein Präsens für „jetzt“ und „immer“ – wie im Deutschen | `ar.g.mudari_sg` |
| 065 | ar.a1.e06 | wa und fa- hängen am nächsten Wort | `ar.g.konjunktion` |
| 066 | ar.a1.e06 | wa vor jedem Glied der Aufzählung | `ar.g.konjunktion` |
| 067 | ar.a1.e06 | Die Woche beginnt mit al-aḥad, dem „ersten“ Tag | §3.4 |
| 068 | ar.a1.e07 | Fünfundzwanzig: Einer zuerst – wie im Deutschen | `ar.g.zahlen_bis_100` |
| 069 | ar.a1.e07 | Iḍāfa: erst die Tür, dann das Haus – vorn ohne Artikel | `ar.g.idafa` |
| 070 | ar.a1.e07 | Komposita von hinten übersetzen: Haustür → bāb al-bayt | `ar.g.idafa` |
| 071 | ar.a1.e07 | barqūq ist keine Aprikose | §3.1 |
| 072 | ar.a1.e07 | sūq: jeder Markt, nicht nur der Basar | §3.1 |
| 073 | ar.a1.e08 | -ūna für „ihr“ und „sie“ | `ar.g.mudari_pl` |
| 074 | ar.a1.e08 | „wir“ hat nur die Vorsilbe na- | `ar.g.mudari_pl` |
| 075 | ar.a1.e08 | lā steht vor dem Verb, nicht am Ende | `ar.g.la_mudari` |
| 076 | ar.a1.e08 | Sport: at-tanis (Lehnwort), kurat al-qadam (Lehnübersetzung) | §3.3 |
| 077 | ar.a1.e09 | Uhrzeit mit Ordnungszahl: as-sāʿa aṯ-ṯāliṯa | `ar.g.ordinal_uhrzeit` |
| 078 | ar.a1.e09 | Achtung „halb“: halb neun = aṯ-ṯāmina wa-n-niṣf | `ar.g.ordinal_uhrzeit` |
| 079 | ar.a1.e09 | sāʿa: Uhr, Stunde und Uhrzeit | §3.4 |
| 080 | ar.a1.e09 | laysa verändert sich: lastu, laysat | `ar.g.laysa` |
| 081 | ar.a1.e09 | lā vor Verben, laysa vor Sätzen ohne Verb | `ar.g.laysa` |
| 082 | ar.a1.e09 | riyāḍa ist Sport, riyāḍiyyāt ist Mathe | §3.4 |
| 083 | ar.a1.e10 | Drei Befehlsformen: uktub, uktubī, uktubū | `ar.g.imperativ` |
| 084 | ar.a1.e10 | „bitte“ hat drei Wörter: min faḍlik, tafaḍḍal, ʿafwan | §4.3 |
| 085 | ar.a1.e10 | uḥibbu l-qahwa: Was man allgemein mag, hat einen Artikel | `ar.g.wunsch` |
| 086 | ar.a1.e10 | urīdu an …: kein Infinitiv, sondern ein Verb mit Person | `ar.g.wunsch` |
| 087 | ar.a1.e10 | ṭāsa ist eine Schale, keine Tasse | §3.1 |
| 088 | ar.a1.e10 | bi-l-hanāʾ wa-š-šifāʾ: Guten Appetit | §4.3 |
| 089 | ar.a1.e11 | Farben haben eigene weibliche Formen: aḥmar – ḥamrāʾ | `ar.g.farben` |
| 090 | ar.a1.e11 | burtuqālī: Die Farbe kommt von der Orange | §3.3 |
| 091 | ar.a1.e11 | Wetter heißt ṭaqs oder ǧaww, hawāʾ ist die Luft | §3.4 |
| 092 | ar.a1.e12 | Drei Konsonanten tragen die Bedeutung: k-t-b | `ar.g.wurzel` |
| 093 | ar.a1.e12 | Wie sprechen – sprach – Sprache: Das Gerüst bleibt | `ar.g.wurzel` |
| 094 | ar.a1.e12 | Im Wörterbuch nach der Wurzel suchen | `ar.g.wurzel` |
| 095 | ar.a1.e12 | ma- vorn ist oft ein Ort | `ar.g.wurzel` |
| 096 | ar.a1.e12 | duktūr: Ärztin, Arzt und Titel | §3.1 |
| 097 | ar.a1.e12 | šifāʾan ʿāǧilan: Gute Besserung | §4.3 |
| 098 | ar.a2.e01 | Die Vergangenheit ist ein Wort: katabtu | `ar.g.madi_sg` |
| 099 | ar.a2.e01 | -tu, -ta, -ti: in Pausa gleich, im Satz verschieden | `ar.g.madi_sg` |
| 100 | ar.a2.e01 | kāna für „war“ – danach Akkusativ | `ar.g.kana_war` |
| 101 | ar.a2.e01 | qiṭār, ḥāfila, bāṣ: arabisches Wort und Lehnwort | §3.3 |
| 102 | ar.a2.e01 | ḏahaba: gehen und fahren in einem Wort | §3.4 |
| 103 | ar.a2.e02 | katabū: Das Alif am Ende ist stumm | `ar.g.madi_pl` |
| 104 | ar.a2.e02 | mā + Vergangenheit: mā ḏahabtu | `ar.g.madi_pl` |
| 105 | ar.a2.e02 | lam + Präsensform = verneinte Vergangenheit | `ar.g.lam_jussiv` |
| 106 | ar.a2.e02 | Cousin und Cousine: ibn ʿamm, bint ḫāla | §3.4 |
| 107 | ar.a2.e02 | Liebe …: ʿazīzī und ʿazīzatī | §4.5 |
| 108 | ar.a2.e03 | Datum mit min: al-ʿāšir min abrīl | `ar.g.datum` |
| 109 | ar.a2.e03 | Zwei Reihen Monatsnamen | `ar.g.datum` |
| 110 | ar.a2.e03 | Titel und Vorname: yā ustāḏa Nādiya | `ar.g.anrede` |
| 111 | ar.a2.e03 | Kein Plural als „Sie“ für eine Person | `ar.g.anrede` |
| 112 | ar.a2.e03 | Formular: ism, ism al-ab, ism al-ʿāʾila | §4.5 |
| 113 | ar.a2.e03 | ʿunwān: Adresse und Überschrift | §3.4 |
| 114 | ar.a2.e04 | sa- hängt am Verb, sawfa steht davor | `ar.g.sa_sawfa` |
| 115 | ar.a2.e04 | „nicht werden“: lan, nicht lā | `ar.g.sa_sawfa` |
| 116 | ar.a2.e04 | Nach an und li- endet das Verb auf -a | `ar.g.mansub` |
| 117 | ar.a2.e04 | „um … zu“ wird zu li- + Verb mit Person | `ar.g.mansub` |
| 118 | ar.a2.e04 | safar ist jede Reise | §3.1 |
| 119 | ar.a2.e04 | mawsim: die Saison | §3.1 |
| 120 | ar.a2.e05 | -ūn für Männer, -āt für Frauen und viele Sachen | `ar.g.plural_gesund` |
| 121 | ar.a2.e05 | Sachen im Plural sind „sie“ in der Einzahl | `ar.g.kongruenz_unbelebt` |
| 122 | ar.a2.e05 | Nachbarn ansprechen: Titel statt Familienname | §4.2 |
| 123 | ar.a2.e06 | akbar min: „als“ heißt min | `ar.g.komparativ` |
| 124 | ar.a2.e06 | afʿal hat nur eine Form – auch für Frauen | `ar.g.komparativ` |
| 125 | ar.a2.e06 | Wie „den“ im Deutschen: -a zeigt das Objekt | `ar.g.akkusativ` |
| 126 | ar.a2.e06 | -an mit Alif: šukran, ṣabāḥan | `ar.g.akkusativ` |
| 127 | ar.a2.e06 | ġālī oder ḫālī: teuer oder leer | §1.3 |
| 128 | ar.a2.e07 | Wie Haus – Häuser: Der Plural verändert das Wortinnere | `ar.g.plural_gebrochen` |
| 129 | ar.a2.e07 | Verb vorn: Einzahl – laʿiba l-awlād | `ar.g.verbalsatz_kongruenz` |
| 130 | ar.a2.e07 | Fremdwörter mit gebrochenem Plural: film – aflām | §3.3 |
| 131 | ar.a2.e08 | -nī am Verb: „mich“ | `ar.g.objektsuffix` |
| 132 | ar.a2.e08 | -nī oder -ī: mich oder mein | `ar.g.objektsuffix` |
| 133 | ar.a2.e08 | fīhi, ʿalayhi: -hu wird zu -hi | `ar.g.praep_suffix` |
| 134 | ar.a2.e08 | mā bika? – nach Beschwerden fragen | `ar.g.praep_suffix` |
| 135 | ar.a2.e08 | saʿala oder saʾala: husten oder fragen | §1.3 |
| 136 | ar.a2.e09 | Verbot: lā + du-Form ohne Endvokal | `ar.g.verbot_jussiv` |
| 137 | ar.a2.e09 | lā taktubu oder lā taktub: Aussage oder Verbot | `ar.g.verbot_jussiv` |
| 138 | ar.a2.e09 | „müssen“: yaǧibu an – die Person steckt im zweiten Verb | `ar.g.notwendigkeit` |
| 139 | ar.a2.e09 | ʿalayya an …: wörtlich „auf mir liegt“ | `ar.g.notwendigkeit` |
| 140 | ar.a2.e09 | ṭālib: Schüler und Student | §3.4 |
| 141 | ar.a2.e10 | munḏu mit Präsens – wie „seit“ im Deutschen | `ar.g.praep_zeit` |
| 142 | ar.a2.e10 | qabla an und baʿda an vor Verben | `ar.g.praep_zeit` |
| 143 | ar.a2.e10 | li-anna: kein Verb ans Ende wie bei „weil“ | `ar.g.li_anna` |
| 144 | ar.a2.e10 | li-annahu, li-annanī: Pronomen hängen an | `ar.g.li_anna` |
| 145 | ar.a2.e10 | Abū Yazan, Umm Yazan: Eltern höflich ansprechen | §4.2 |
| 146 | ar.a2.e11 | kātib und maktūb: wer tut und was getan wurde | `ar.g.partizip1` |
| 147 | ar.a2.e11 | anā ḏāhib: ich bin unterwegs | `ar.g.partizip1` |
| 148 | ar.a2.e11 | šaǧar und šaǧara: Bäume und ein Baum | `ar.g.kollektiv` |
| 149 | ar.a2.e11 | Schilder lesen: maftūḥ und muġlaq | `ar.g.partizip1` |
| 150 | ar.a2.e12 | Wie „das Lesen“: al-qirāʾa | `ar.g.verbalnomen` |
| 151 | ar.a2.e12 | astaṭīʿu an + Verb: können | `ar.g.koennen` |
| 152 | ar.a2.e12 | hal yumkinu an …? – höflich fragen, ob es geht | `ar.g.koennen` |
| 153 | ar.a2.e12 | muhandis: Beruf und Anrede | §3.1 |
| 154 | ar.a2.e13 | kull yawm oder kull al-yawm: jeden Tag oder den ganzen Tag | `ar.g.quantoren` |
| 155 | ar.a2.e13 | nafs al-yawm: am selben Tag | `ar.g.quantoren` |
| 156 | ar.a2.e13 | mā aǧmala …!: Bewunderung mit festem Muster | `ar.g.ausruf` |
| 157 | ar.a2.e13 | mabrūk und alf mabrūk | §4.3 |
| 158 | ar.a2.e13 | Festgrüße: im Kurs nur weltliche | §4.7 |
| 159 | ar.a2.e14 | Jahreszahlen ohne „neunzehnhundert“ | `ar.g.zahlen_gross` |
| 160 | ar.a2.e14 | alf, alfān, ālāf: eins, zwei, viele Tausend | `ar.g.zahlen_gross` |
| 161 | ar.a2.e14 | ḥisāb und fātūra: die Rechnung | §3.3 |
| 162 | ar.b1.e01 | kuntu alʿabu: früher immer | `ar.g.kana_mudari` |
| 163 | ar.b1.e01 | qāla – qultu: Der lange Vokal wird kurz | `ar.g.verb_hohl` |
| 164 | ar.b1.e02 | Die Šadda macht aus lernen lehren: darasa – darrasa | `ar.g.stamm2` |
| 165 | ar.b1.e02 | ʿalima, ʿallama, taʿallama: wissen, lehren, lernen | `ar.g.stamm5_6` |
| 166 | ar.b1.e02 | „einander“ steckt in Stamm VI | `ar.g.stamm5_6` |
| 167 | ar.b1.e03 | allaḏī nur nach bestimmtem Nomen | `ar.g.relativ` |
| 168 | ar.b1.e03 | Das Rückverweis-Pronomen gehört dazu | `ar.g.relativ` |
| 169 | ar.b1.e03 | Kein Verb ans Ende im Relativsatz | `ar.g.relativ` |
| 170 | ar.b1.e03 | ma- = Ort: malʿab, maṭbaḫ | `ar.g.ortsnomen` |
| 171 | ar.b1.e03 | šaqqa, bayt, manzil: Wohnung und Haus | §3.4 |
| 172 | ar.b1.e04 | Dual: kitābāni = zwei Bücher | `ar.g.dual` |
| 173 | ar.b1.e04 | -ayni als Objekt und nach Präpositionen | `ar.g.dual` |
| 174 | ar.b1.e04 | Nach 11 bis 99 Einzahl: ʿišrūna kitāban | `ar.g.zahl_tamyiz` |
| 175 | ar.b1.e04 | 3 bis 10: Die Zahl nimmt das andere Genus | `ar.g.zahl_tamyiz` |
| 176 | ar.b1.e05 | yamšī – lam yamši | `ar.g.verb_defekt` |
| 177 | ar.b1.e05 | Die Hamza ist der Knacklaut – immer sprechen | `ar.g.verb_hamza` |
| 178 | ar.b1.e05 | kul und ḫuḏ: kurze Befehle | `ar.g.verb_hamza` |
| 179 | ar.b1.e06 | Stamm IV: u- im Präsens – yursilu | `ar.g.stamm4` |
| 180 | ar.b1.e06 | waǧada – yaǧidu: Das w fällt weg | `ar.g.verb_assimiliert` |
| 181 | ar.b1.e07 | Das t in Stamm VIII gehört nicht zur Wurzel | `ar.g.stamm7_8` |
| 182 | ar.b1.e07 | ittaṣala: aus w und t wird tt | `ar.g.stamm7_8` |
| 183 | ar.b1.e07 | ista- = für sich nehmen: istaʿmala | `ar.g.stamm10` |
| 184 | ar.b1.e07 | kalimat sirr: das Passwort | §3.4 |
| 185 | ar.b1.e08 | saʿida oder sāʿada: froh sein oder helfen | `ar.g.stamm3` |
| 186 | ar.b1.e08 | Stamm III: etwas mit jemandem tun | `ar.g.stamm3` |
| 187 | ar.b1.e08 | anna + Pronomen: annaka, annahu | `ar.g.anna_dass` |
| 188 | ar.b1.e08 | Nach qāla steht inna | `ar.g.anna_dass` |
| 189 | ar.b1.e08 | Beschwerde höflich einleiten | §4.4 |
| 190 | ar.b1.e09 | lammā + Vergangenheit = „als“ | `ar.g.temporalsatz` |
| 191 | ar.b1.e09 | iḏā mit Vergangenheitsform für die Zukunft | `ar.g.temporalsatz` |
| 192 | ar.b1.e09 | radda – radadtu | `ar.g.verb_verdoppelt` |
| 193 | ar.b1.e09 | Trost und Mitgefühl mit weltlichen Worten | §4.3 |
| 194 | ar.b1.e10 | Nominativ, Akkusativ, Genitiv – nur der Dativ fehlt | `ar.g.irab` |
| 195 | ar.b1.e10 | „dem Kind“: li-ṭ-ṭifl | `ar.g.irab` |
| 196 | ar.b1.e10 | Die Endung sitzt am Nomen, nicht am Artikel | `ar.g.irab` |
| 197 | ar.b1.e10 | abūka, abāka, abīka | `ar.g.fuenf_nomen` |
| 198 | ar.b1.e11 | Kein Tanwīn: madārisa, Tūnisa | `ar.g.diptota` |
| 199 | ar.b1.e11 | Der arabische „Konjunktiv“ ist kein deutscher | `ar.g.modi_ueberblick` |
| 200 | ar.b1.e11 | Drei Endungen, drei Gruppen von Signalwörtern | `ar.g.modi_ueberblick` |
| 201 | ar.b1.e11 | Der Name des Vaters als eigenes Feld | §4.5 |
| 202 | ar.b1.e12 | mustaʿmil oder mustaʿmal: ein Vokal entscheidet | `ar.g.partizip_abgeleitet` |
| 203 | ar.b1.e12 | Berufe auf mu-: mudarrib, muhandis | `ar.g.partizip_abgeleitet` |
| 204 | ar.b1.e12 | qad + Vergangenheit = schon | `ar.g.qad` |
| 205 | ar.b1.e12 | qad + Präsens = vielleicht | `ar.g.qad` |
| 206 | ar.b1.e12 | maḫzan ist ein Lager, kein Magazin | §3.1 |
| 207 | ar.b1.e13 | akṯar + Nomen: „sauberer“ umschreiben | `ar.g.elativ_umschreibung` |
| 208 | ar.b1.e13 | aqall: weniger | `ar.g.elativ_umschreibung` |
| 209 | ar.b1.e13 | raʾā – yarā: unregelmäßig wie sehen – sah | `ar.g.verb_doppelt_schwach` |
| 210 | ar.b1.e14 | -iyya wie -heit, -keit, -ität | `ar.g.nisba_abstrakt` |
| 211 | ar.b1.e14 | bal: ein eigenes Wort für „sondern“ | `ar.g.satzverbindung` |
| 212 | ar.b1.e14 | lā … wa-lā: weder … noch | `ar.g.satzverbindung` |
| 213 | ar.b1.e14 | Fachwörter: arabische Wurzel oder Lehnwort | §3.3 |
| 214 | ar.b1.e15 | „ob“: hal oder iḏā kāna | `ar.g.indirekte_frage` |
| 215 | ar.b1.e15 | Indirekte Frage ohne Verb am Ende | `ar.g.indirekte_frage` |
| 216 | ar.b1.e15 | Bewerbung: Anrede und Schluss | §4.5 |
| 217 | ar.b1.e15 | ḫibra: Erfahrung im Beruf | §3.4 |
| 218 | ar.b1.e16 | law samaḥt oder law samaḥti | `ar.g.hoeflichkeit` |
| 219 | ar.b1.e16 | Auf šukran: ʿafwan oder lā šukr ʿalā wāǧib | `ar.g.hoeflichkeit` |
| 220 | ar.b1.e16 | tafaḍḍal: herein, bitte schön, nimm | `ar.g.hoeflichkeit` |
| 221 | ar.b1.e16 | Angebote annehmen und ablehnen | §4.4 |
| 222 | ar.b1.e16 | Dual im Rezept: kūbāni | `ar.g.dual` |
| 223 | ar.b1.e16 | Zahlen im Rezept: ṯalāṯ bayḍāt | `ar.g.zahl_tamyiz` |
| 224 | ar.b2.e01 | kutiba: Passiv durch andere Vokale | `ar.g.passiv_madi` |
| 225 | ar.b2.e01 | Ohne Vokalzeichen gleich: kataba und kutiba | `ar.g.passiv_madi` |
| 226 | ar.b2.e01 | tamma + Verbalnomen | `ar.g.passiv_mudari` |
| 227 | ar.b2.e02 | mā zāla sieht verneint aus und heißt „noch immer“ | `ar.g.kana_schwestern` |
| 228 | ar.b2.e02 | ṣāra ṭāliban: nach „werden“ Akkusativ | `ar.g.kana_schwestern` |
| 229 | ar.b2.e02 | in + Kurzform in beiden Teilen | `ar.g.bedingung_real` |
| 230 | ar.b2.e02 | fa- vor dem Nachsatz mit sa-, Befehl oder ohne Verb | `ar.g.bedingung_real` |
| 231 | ar.b2.e02 | Abschlüsse: bakālūriyā und līsāns | §3.1 |
| 232 | ar.b2.e03 | Nach inna: Subjekt im Akkusativ | `ar.g.inna_schwestern` |
| 233 | ar.b2.e03 | laʿalla, kaʾanna, layta: vielleicht, als ob, wenn doch | `ar.g.inna_schwestern` |
| 234 | ar.b2.e03 | illā + Akkusativ, ġayr + Genitiv | `ar.g.istithna` |
| 235 | ar.b2.e03 | In der Versammlung höflich widersprechen | §4.4 |
| 236 | ar.b2.e04 | ḫaraǧa mubtasiman: wie „lächelnd“ | `ar.g.hal` |
| 237 | ar.b2.e04 | wa-hiya taqraʾ: Zustand mit wa- | `ar.g.hal` |
| 238 | ar.b2.e04 | badaʾa yamšī: ohne an | `ar.g.anfangsverben` |
| 239 | ar.b2.e04 | kidtu: beinahe | `ar.g.anfangsverben` |
| 240 | ar.b2.e05 | Jeder Stamm hat sein „-ung“-Muster | `ar.g.masdar_formen` |
| 241 | ar.b2.e05 | tadrīb, musāʿada, iʿdād: Muster erkennen | `ar.g.masdar_formen` |
| 242 | ar.b2.e05 | šukran ǧazīlan: Verb als Nomen statt „sehr“ | `ar.g.mafuul_mutlaq` |
| 243 | ar.b2.e06 | Wie im Amtsdeutsch: Verbalnomen statt Nebensatz | `ar.g.masdar_satz` |
| 244 | ar.b2.e06 | lā, lam, lan, laysa: Verneinung nach der Zeit | `ar.g.verneinung_ueberblick` |
| 245 | ar.b2.e06 | ġayr = un-: ġayr ṣāliḥ | `ar.g.verneinung_ueberblick` |
| 246 | ar.b2.e06 | dīwān: Amt, nicht Sofa | §3.1 |
| 247 | ar.b2.e07 | „wäre“ und „würde“: law + Vergangenheit | `ar.g.bedingung_irreal` |
| 248 | ar.b2.e07 | lawlā: wenn … nicht wäre | `ar.g.bedingung_irreal` |
| 249 | ar.b2.e07 | fī l-miʾa: Prozent | `ar.g.brueche_prozent` |
| 250 | ar.b2.e07 | ṯulṯ, rubʿ, ḫums: Brüche nach Muster | `ar.g.brueche_prozent` |
| 251 | ar.b2.e08 | akṯar amānan: sicherer | `ar.g.tamyiz` |
| 252 | ar.b2.e08 | raġma + Nomen, raġma anna + Satz | `ar.g.konzessiv` |
| 253 | ar.b2.e08 | maṣraf und bank: zwei Wörter für die Bank | §3.3 |
| 254 | ar.b2.e09 | „aus Respekt“: iḥtirāman – ohne min | `ar.g.mafuul_lahu` |
| 255 | ar.b2.e09 | ammā … fa-: was … betrifft | `ar.g.textverbinder` |
| 256 | ar.b2.e09 | Algebra, Algorithmus, Ziffer: Wörter aus dem Arabischen | §3.2 |
| 257 | ar.b2.e10 | man für Personen, mā für Dinge | `ar.g.relativ_man_ma` |
| 258 | ar.b2.e10 | mimmā, ʿammā: verschmolzene Formen | `ar.g.relativ_man_ma` |
| 259 | ar.b2.e10 | li-allā: damit nicht | `ar.g.zweck_negativ` |
| 260 | ar.b2.e11 | kāna qad: wie „hatte gemacht“ | `ar.g.zeitenfolge` |
| 261 | ar.b2.e11 | kāna sa-: „wollte“ und „würde“ | `ar.g.zeitenfolge` |
| 262 | ar.b2.e11 | Sehr geehrte …: as-sayyida al-muḥtarama | `ar.g.briefform` |
| 263 | ar.b2.e11 | Briefschluss: maʿa fāʾiq al-iḥtirām | `ar.g.briefform` |
| 264 | ar.b2.e12 | al-ḥādī ʿašar: „ein-“ in Ordnungszahlen | `ar.g.ordinal_gross` |
| 265 | ar.b2.e12 | kamā + Satz, miṯla + Nomen | `ar.g.vergleichssatz` |
| 266 | ar.b2.e13 | Der stärkste Vokal trägt die Hamza | `ar.g.hamza_schreibung` |
| 267 | ar.b2.e13 | suʾāl, masʾala, biʾr: drei Träger | `ar.g.hamza_schreibung` |
| 268 | ar.b2.e13 | Umgangssprache zu Hause, Fuṣḥā in der Schule | §5.2 |
| 269 | ar.b2.e14 | „man sagt“: yuqālu – nicht man yaqūl | `ar.g.modalausdruecke` |
| 270 | ar.b2.e14 | min aḍ-ḍarūrī an: Es ist nötig, dass … | `ar.g.modalausdruecke` |
| 271 | ar.b2.e14 | baladiyya: die Stadtverwaltung | §3.4 |
| 272 | ar.b2.e15 | Redewiedergabe ohne Konjunktiv I | `ar.g.indirekte_rede` |
| 273 | ar.b2.e15 | qāla inna, ḏakara anna | `ar.g.indirekte_rede` |
| 274 | ar.b2.e16 | sahl al-istiʿmāl: wie „pflegeleicht“ | `ar.g.unechte_idafa` |
| 275 | ar.b2.e16 | Vortrag in Fuṣḥā: Endungen bewusst setzen | `ar.g.irab` |
| 276 | ar.c1.e01 | qāma bi- + Verbalnomen: wie „zur Durchführung bringen“ | `ar.g.nominalstil` |
| 277 | ar.c1.e01 | Im Gespräch zurück in Verben übertragen | `ar.g.nominalstil` |
| 278 | ar.c1.e02 | bi-mūǧib, wafqan li-: gemäß | `ar.g.amtssprache` |
| 279 | ar.c1.e02 | mā lam: sofern nicht | `ar.g.amtssprache` |
| 280 | ar.c1.e03 | naqlan ʿan, bi-ḥasab: laut, zufolge | `ar.g.berichtsstil` |
| 281 | ar.c1.e03 | Die Quelle steht vorn | `ar.g.berichtsstil` |
| 282 | ar.c1.e04 | rubbamā, yabdū anna: vermutlich, anscheinend | `ar.g.vermutung` |
| 283 | ar.c1.e04 | laʿalla + Akkusativ | `ar.g.vermutung` |
| 284 | ar.c1.e05 | Nur das letzte Glied hat den Artikel | `ar.g.idafa_ketten` |
| 285 | ar.c1.e05 | Das Adjektiv zum ersten Glied steht am Ende | `ar.g.idafa_ketten` |
| 286 | ar.c1.e05 | Wörter auf Reisen: Zucker, Ziffer, Magazin | §3.2 |
| 287 | ar.c1.e06 | bi-nāʾan ʿalā: aufgrund | `ar.g.argumentation` |
| 288 | ar.c1.e06 | fī ḥīn: während hingegen | `ar.g.argumentation` |
| 289 | ar.c1.e07 | ḥāsūb wie „Rechner“ aus „rechnen“ | `ar.g.wortbildung_modern` |
| 290 | ar.c1.e07 | lā-silkī: -los | `ar.g.wortbildung_modern` |
| 291 | ar.c1.e07 | taʿrīf: Definition, nicht Tarif | §3.1 |
| 292 | ar.c1.e08 | Objekt nach vorn – mit Rückverweis | `ar.g.hervorhebung` |
| 293 | ar.c1.e08 | innamā: nur, vielmehr | `ar.g.hervorhebung` |
| 294 | ar.c1.e08 | qaṭṭ für die Vergangenheit, abadan für die Zukunft | `ar.g.verneinung_stil` |
| 295 | ar.c1.e09 | nafs vorn = derselbe, nafs hinten = selbst | `ar.g.tawkid_badal` |
| 296 | ar.c1.e09 | al-aʿḍāʾ kulluhum: alle Mitglieder | `ar.g.tawkid_badal` |
| 297 | ar.c1.e10 | Sprichwörter nicht wörtlich übertragen | `ar.g.redewendungen` |
| 298 | ar.c1.e10 | yad wāḥida lā tuṣaffiq: Allein geht es nicht | `ar.g.redewendungen` |
| 299 | ar.c1.e11 | bi-ʿibāra uḫrā: mit anderen Worten | `ar.g.paraphrase` |
| 300 | ar.c1.e11 | Passiv und Aktiv tauschen | `ar.g.paraphrase` |
| 301 | ar.c1.e12 | Zwillingsformeln: ṣiġāran wa-kibāran | `ar.g.stilmittel` |
| 302 | ar.c1.e12 | Rhetorische Frage mit a-laysa | `ar.g.stilmittel` |
| 303 | ar.c1.e13 | Fuṣḥā und Umgangssprache: weiter auseinander als Hochdeutsch und Mundart | `ar.g.register` |
| 304 | ar.c1.e13 | Umgangssprachen an Verneinung und Zukunft erkennen | §5.2 |
| 305 | ar.c1.e14 | Rückblick: Nominalstil und Verbalstil wechseln | `ar.g.nominalstil` |
| 306 | ar.c1.e14 | Abschied im Beruf: förmlich danken | §4.3 |

## 7 Messwerte und Methode

| Messung | Wert | Quelle und Methode |
|---|---|---|
| Genus arabischer Nomen (Top-1.000 / Top-2.000 Nomen der Lemma-Rangliste) | feminin 36,7 / 34,9 %, maskulin 63,3 / 65,1 % (965 / 1.938 Nomen mit eindeutigem Genus) | Rangliste des Rahmen-Generators (wordfreq 3.1.1 und CAMeL MSA v1.0, Rangmittel), Genus aus dem kaikki-Kern (Ausgabe en) |
| Nomen auf -a (Tāʾ marbūṭa) und Genus | 99,4 / 99,5 % feminin (324 / 618 Nomen) | dto.; Endung an der kanonischen Form geprüft |
| Feminine Nomen ohne -a (umm, bint, šams, arḍ …) | 9,0 / 9,0 % der femininen Nomen (32 / 61) | dto. |
| Artikel vor Sonnenbuchstaben | 32,5 % der 2.974 Wortformen mit al- unter den Top 10.000 (nach Häufigkeit gewichtet 31,8 %) | wordfreq 3.1.1 (ar), Formen ohne Harakat; Wörter, in denen al- zum Stamm gehört, ausgenommen (Schätzung) |
| Tatoeba de↔ar: deutsche Ja-Nein-Fragen (Verb am Anfang) und arabische Übersetzung mit hal | 193 von 270 (71,5 %) | Tatoeba-Export vom 10.10.2026, Paare de↔ar (Beleg S7 §3.2) |
| Genus deutsch und arabisch bei Nomen mit Übersetzung | bei etwa zwei Dritteln gleich (64,6–66,4 %) | Messung im Gegenstück `kontrast-de-aus-ar.md` §7 |
| Internationalismen: häufige deutsche Nomen mit ähnlich klingender arabischer Übersetzung | 6,5–10,4 % | dto. |
| Glossen in der Ausgangssprache (Top-1.000 / Top-5.000 arabische Wörter) | 61 % / 51 % | Beleg S7 §3.6; Glossen und Tipps tragen hier mehr KI-Entwurf mit Gegenprüfung |

**Methode.**
- Gelesen wurden nur die S7-Auszüge im Scratchpad (`l0/S7/auszug/`: Häufigkeit, kaikki-Kern, Tatoeba) und die Lemma-Rangliste des Rahmen-Generators (`l3-rahmen-ar/rang_ar_neu.json`), mit `python3 -I`.
- Skripte: `l3-kontrast-ar/messen.py` (Messungen) und `l3-kontrast-ar/bauen.py` (Generator und Prüfungen), beide im Scratchpad der Sitzung; Übernahme nach `_lernapp/werkzeuge/` in L3. Arabische Muster stehen dort als Codepunkte.
- In dieses Dokument gelangen nur Zahlen und Beispiele in Lateinschrift bzw. Umschrift; kein Tatoeba-Satz und kein Wiktionary-Text.
- Die Werte sind Schätzungen über Wortformen und Umschrift; sie zeigen die Größenordnung, nicht die genaue Zahl.

## 8 Zu prüfen und offene Fragen

Alle laufen mit ihrem Standard weiter (L3-E12, kein Warten).

| ID | Frage | Standard | Wer |
|---|---|---|---|
| KD-ard-01 | Typische Fehler (§2) sind Erfahrungswerte aus dem Unterricht des Arabischen als Fremdsprache, nicht gemessen. | Die Muttersprachler-Stichprobe und Meldungen aus der App (ADR 0041 Nr. 9) schärfen sie nach. | L3, LM-01 |
| KD-ard-02 | Plural als Höflichkeitsform zu einer Person (antum) in förmlichen Schreiben: Kommt das im heutigen Hocharabisch vor? | nicht lehren; zu einer Person immer Einzahl | LM-01 |
| KD-ard-03 | ḥaḍratuka/ḥaḍratuki: welche Verbform folgt? | nur in Sätzen ohne Verb und in festen Fragen wie im Rahmenplan | LM-01, LM-02 |
| KD-ard-04 | Herkunft der deutschen Lehnwörter (§3.2) | nach Herkunftswörterbuch prüfen; Liste bleibt Vorschlag | L3, LM-01 |
| KD-ard-05 | Merkhilfe „Zungenspitze“ für Sonnenbuchstaben (Ausnahme ǧ) didaktisch geeignet? | ja, mit Hinweis auf die Ausnahme | LM-02 |
| KD-ard-06 | Betonungsregeln (§1.4) unterscheiden sich regional. | kein Pflichttipp; Hörbeispiele tragen die Betonung | LM-01, LM-06 |
| KD-ard-07 | Regionale Zuordnung der Umgangssprachformen (§5.2) | Formen als Beispiele mit Region; Bestätigung durch Muttersprachler verschiedener Regionen | LM-01 |
| KD-ard-08 | Hörpaare mit seltenen Wörtern (kāla, rākid, ṭall, hadm, ʿasīr): bekannt genug? | nur in `minimalpaare`, außerhalb des Lemma-Budgets und ohne Prüfstein | LM-01, L3 |
| KD-ard-09 | Umschrift in Tipps der deutschen Oberfläche | arabische Schrift voll vokalisiert; Umschrift nur im Vorkurs und als Lesehilfe auf Wunsch | LM-02, L2 |
| KD-ard-10 | Verwandtschaftswörter als Anrede für Bekannte (ʿammū, ḫāla) | als Hinweis mit „regional“, kein Lernziel | LM-01 |
| KD-ard-11 | Widerspruchsformel in Versammlungen (§4.4) | Formulierung durch Muttersprachler bestätigen | LM-01 |
| KD-ard-12 | Gastfreundschaft (§4.4): Tipps ohne Verallgemeinerung über Gewohnheiten formuliert? | Tipps beschreiben nur Sprachformen | Redaktion, LM-09 |
| KD-ard-13 | Sprichwörter (`ar.g.redewendungen`): Manche verbreiteten Sprüche werden auch als religiöse Überlieferung zitiert. | nur Wendungen aus der Liste der Redaktion (OF-ar-12); im Zweifel weglassen (KI-Regel 2) | Redaktion, LM-09 |
| KD-ard-14 | Halbe Freunde mit Dialektbezug (ṣālūn, bakālūriyā, līsāns) | ausdrücklich „dialektal“ bzw. „regional“ markieren | LM-01 |

## 9 Herkunft und Prüfungen

- **Entwurf:** KI-Lauf `ki:l3-kontrast-ar` am 20.10.2026 (L3-01, vorgezogen), auf Grundlage des Rahmenplans Hocharabisch (Entwurf 1.0.0) und des Inhaltsleitfadens.
- **Eigene Darstellung:** Keine fremden Lehrwerke oder Kontrastgrammatiken übernommen; GER nur als Stufen (ADR 0045 Nr. 8, LM-36).
- **Automatische Prüfungen des Generators:**
  - alle 126 Grammatik-IDs des Rahmenplans genau einmal in §2
  - jeder Tipp auf einem gültigen Einheiten-Schlüssel, nach Einheit sortiert; jede Einheit mit mindestens zwei Tipps; Grammatik-Bezug nie vor seiner Einführung, im Vorkurs keiner; Abschnittsbezüge vorhanden; keine doppelten Tipp-Titel
  - Tabu-Lexikon des Leitfadens (de, tr, ar-Umschrift): 0 echte Treffer; Fehlalarme: „lan“ (tr, Fluchen) als arabische Verneinungspartikel lan (24); „parti“ (tr, Politik) in Partizip und Partikel (12)
  - 0 arabische Zeichen (U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF)
  - Religionswörter nur in den Regelabschnitten (KI-Regel 2, §4.7, Verweise auf den getrennten Pfad und auf Kandidaten): „koran“ (1), „religi“ (12)
- **Menschliche Prüfung:** Stichprobe der Muttersprachler (LM-01) mit den Punkten aus §8; Abnahme zusammen mit dem Rahmenplan (LM-02).
