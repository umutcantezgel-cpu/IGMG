# Prüfübersicht Wissenskurs „Islamisches Wissen nach hanefitischer Lehre“

- **Paket:** Lern-App L6-04 · **Stand:** 24.10.2026 · **Inhaltsstand:** Commit `2c0c1bbe` vom 24.10.2026 (letzte Änderung unter `web/inhalte/lernapp/islam/`)
- **Für:** die zwei religiösen Prüfenden (Imam und Hoca; MENSCHEN ML-01 → LM-03, LM-04; Quellenfrage LM-33)
- **Umfang:** 26 Entwurfsdateien von 28 Einheiten des Lehrplans `_lernapp/lehrplan/WISSEN.md`; zwei Einheiten sind zurückgestellt (Abschnitt 6).
- **Erzeugt** mit einem Zählskript außerhalb des Repositorys aus den Inhaltsdateien, dem Lehrplan und `web/daten/hanafi-quellen/QUELLE.md`.
  Der Bericht zählt, ordnet und verweist nur. Er enthält keine eigenen religiösen Aussagen, keine Verse, Hadithe, Bittgebete,
  keine Koran-Wortbedeutungen und keine arabische Schrift; Werknamen und Fachbegriffe stehen in Umschrift (KI-Regel 2,
  ADR 0040; `_lernapp/KERN.md` §2). Alle Texte in Abschnitt 4 sind wörtliche Auszüge aus den Inhaltsdateien.

## 1. Zweck und Lesehilfe

**Zweck.** Die Übersicht zeigt, was zur Prüfung ansteht, wo es liegt und womit man am besten anfängt. Sie ersetzt keine
Prüfung: Geprüft wird jede Aussage einzeln in der Zwei-Prüfer-Oberfläche `/verwaltung/lernapp/religioes`.

**Nichts ist sichtbar ohne zwei Freigaben.** Jede Aussage und jede Quizfrage braucht zwei Urteile „ok“ zum aktuellen
Inhalts-Hash, von zwei verschiedenen Personen mit dem Recht `religioese_pruefung`; keine davon ist Verfasser. Je Beleg ist
das Häkchen „Beleg am Original geprüft“ Pflicht. Eine Lektion wird erst sichtbar, wenn alle ihre Bausteine geprüft sind.
Jede Änderung (neuer Hash) setzt beide Freigaben zurück. Prüfende bearbeiten nicht selbst: Urteil `ok`, `Änderungsvorschlag`
oder `ablehnen`; die Redaktion arbeitet Vorschläge ein, danach prüfen beide den neuen Stand. Die Administration ersetzt
keine Prüfung (ADR 0040 Nr. 5, KERN §2.3, PLAN §6.7 Nr. 6). Alle Dateien stehen auf Status `entwurf`.

**Belege.** Jede Aussage nennt Werk, Kapitel (Umschrift), Ausgabe, Band und Seite der Vorlage sowie die Passage im
lokalen Index (`<werk>.msNNNN`) und die OpenITI-Fundstelle. Band und Seite stammen aus dem Index und können um eine Seite
abweichen: am eigenen Exemplar prüfen (QUELLE.md). Die arabische Passage wird in der Verwaltung nicht angezeigt, solange
LM-04 nicht anders entschieden ist. Die Belegprüfung durch einen Agenten (PLAN §6.7 Nr. 5) ordnet nur die Warteschlange
und ersetzt keine Freigabe (ADR 0040 Nr. 2, Hilfsarbeiten).
Alle 4.603 Belege tragen Band, Seite, Passage und Fundstelle; alle sind `sinngemaess`.
Verse und Hadithe stehen nur als Verweis (203 auf Verse, 65 auf Hadithe); angezeigt werden sie mit
freigegebener Übersetzung, sonst mit „Übersetzung folgt“ (ADR 0040 Nr. 4).

**Empfohlene Reihenfolge – unsicher und strittig zuerst** (PLAN §6.7 Nr. 5–6; ADR 0040 Nr. 2 und 4; MENSCHEN LM-03):

1. die 11 Aussagen, in denen der Entwurf selbst eine Unsicherheit vermerkt (Abschnitt 4.1);
2. die 523 Aussagen mit der Kennzeichnung `strittig` (Abschnitt 4.2), Einheit für Einheit;
3. die übrigen Aussagen in der Reihenfolge des Lehrplans, Reinheit und Gebet zuerst (LM-03).

Die Quellenfrage in Abschnitt 5 betrifft die Zakat- und Hadsch-Einheiten. Es hilft, sie zu entscheiden (LM-33), bevor
dort Aussagen freigegeben werden.

**Spalten der Tabelle in Abschnitt 2**

- **Ablagepfad:** Pfad unter `web/inhalte/lernapp/`.
- **Lektionen:** Lektionen in der Datei. **Aussagen:** je Aussage zwei Freigaben. **Belege:** Belege aller Aussagen
  (eine Aussage hat einen bis zehn). **Quizfragen:** Sie entstehen nur aus Aussagen und brauchen eigene Freigaben.
- **strittig:** Aussagen mit `strittig: true`. **mit Meinung:** Aussagen mit dem Feld `meinung` (Meinung innerhalb der
  Schule oder Meinung, nach der Fatwa gegeben wird).
- **Unsicher:** Aussagen, in denen der Entwurf eine Unsicherheit vermerkt: „(Unsicher: …)“, „… ist unsicher“ oder „… unsicher)“.
  Nicht gezählt sind 3 Aussagen, in denen das Wort zum Inhalt gehört: `islam.grund.e05.l02.a07`, `islam.grund.e11.l03.a07`, `islam.aufbau.e05.l02.a10`.
- **kinderGeeignet:** Lektionen mit `kinderGeeignet: true` von allen Lektionen der Einheit (Vorschlag; Entscheidung LM-17).

## 2. Einheiten

| Nr. | Schlüssel | Titel (Lehrplan) | Bereich | Ablagepfad | Lektionen | Aussagen | Belege | Quizfragen | strittig | mit Meinung | Unsicher | kinderGeeignet |
|---:|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | `islam.grund.e01` | Reinheit I: Wasser, Unreinheit und Istinjāʾ | `taharah` | `islam/taharah/islam.grund.e01.json` | 6 | 51 | 92 | 27 | 8 | 6 | 0 | 6/6 |
| 2 | `islam.grund.e02` | Reinheit II: Die Gebetswaschung (wuḍūʾ) | `taharah` | `islam/taharah/islam.grund.e02.json` | 6 | 50 | 121 | 32 | 8 | 7 | 0 | 6/6 |
| 3 | `islam.grund.e03` | Reinheit III: Ganzkörperwaschung, Tayammum, Masḥ und Monatsblutung | `taharah` | `islam/taharah/islam.grund.e03.json` | 7 | 78 | 144 | 37 | 16 | 12 | 0 | 4/7 |
| 4 | `islam.grund.e04` | Gebet I: Pflicht, Gebetszeiten und Gebetsruf | `salah` | `islam/salah/islam.grund.e04.json` | 6 | 67 | 184 | 42 | 16 | 7 | 0 | 6/6 |
| 5 | `islam.grund.e05` | Gebet II: Bedingungen, Pflichtteile und Ablauf | `salah` | `islam/salah/islam.grund.e05.json` | 6 | 91 | 223 | 36 | 21 | 16 | 0 | 6/6 |
| 6 | `islam.grund.e06` | Gebet III: Gemeinschaftsgebet, Störungen und Niederwerfung des Versehens | `salah` | `islam/salah/islam.grund.e06.json` | 6 | 99 | 196 | 47 | 24 | 11 | 0 | 6/6 |
| 7 | `islam.grund.e07` | Gebet IV: Witr, freiwillige Gebete, Nachholen und Krankengebet | `salah` | `islam/salah/islam.grund.e07.json` | 6 | 125 | 250 | 36 | 38 | 32 | 0 | 6/6 |
| 8 | `islam.grund.e08` | Gebet V: Reise, Freitag, Festtage und Totengebet | `salah` | `islam/salah/islam.grund.e08.json` | 7 | 135 | 329 | 57 | 47 | 31 | 0 | 6/7 |
| 9 | `islam.grund.e09` | Glaube I: Grundlagen des Glaubens und die Einheit Gottes | `akaid` | `islam/akaid/islam.grund.e09.json` | 6 | 53 | 65 | 35 | 3 | 0 | 0 | 6/6 |
| 10 | `islam.grund.e10` | Glaube II: Engel, Bücher und Propheten | `akaid` | `islam/akaid/islam.grund.e10.json` | 6 | 41 | 47 | 30 | 0 | 0 | 0 | 6/6 |
| 11 | `islam.grund.e11` | Glaube III: Bestimmung, Jenseits und Gemeinschaft | `akaid` | `islam/akaid/islam.grund.e11.json` | 6 | 61 | 76 | 44 | 0 | 0 | 0 | 6/6 |
| 12 | `islam.aufbau.e01` | Fasten I: Pflicht, Arten, Absicht und Monatsbeginn | `sawm` | `islam/sawm/islam.aufbau.e01.json` | 5 | 65 | 124 | 42 | 14 | 7 | 0 | 5/5 |
| 13 | `islam.aufbau.e02` | Fasten II: Was das Fasten bricht, Nachholen, Sühne und Iʿtikāf | `sawm` | `islam/sawm/islam.aufbau.e02.json` | 6 | 93 | 207 | 47 | 21 | 18 | 1 | 5/6 |
| 14 | `islam.aufbau.e03` | Zakat I: Pflicht, Bedingungen und Vermögensarten | `zakat` | `islam/zakat/islam.aufbau.e03.json` | 6 | 93 | 224 | 43 | 32 | 25 | 3 | 6/6 |
| 15 | `islam.aufbau.e04` | Zakat II: Empfänger und Ṣadaqat al-Fiṭr | `zakat` | `islam/zakat/islam.aufbau.e04.json` | 4 | 73 | 223 | 28 | 23 | 12 | 2 | 4/4 |
| 16 | `islam.aufbau.e05` | Hadsch I: Pflicht, Bedingungen, Zeiten und Iḥrām | `hajj` | `islam/hajj/islam.aufbau.e05.json` | 5 | 93 | 225 | 36 | 17 | 14 | 0 | 5/5 |
| 17 | `islam.aufbau.e06` | Hadsch II: Ablauf, ʿUmra, Verstöße und Opfertier | `hajj` | `islam/hajj/islam.aufbau.e06.json` | 7 | 159 | 373 | 61 | 48 | 24 | 1 | 7/7 |
| 18 | `islam.aufbau.e07` | Erlaubtes und Verbotenes I: Speisen, Getränke, Schlachtung und Opfer | `halal_haram` | `islam/halal_haram/islam.aufbau.e07.json` | 6 | 112 | 280 | 49 | 21 | 19 | 0 | 6/6 |
| 19 | `islam.aufbau.e08` | Erlaubtes und Verbotenes II: Kauf, Zins und Miete | `halal_haram` | `islam/halal_haram/islam.aufbau.e08.json` | 6 | 122 | 283 | 48 | 42 | 23 | 1 | 6/6 |
| 20 | `islam.aufbau.e09` | Erlaubtes und Verbotenes III: Ehe und Familie – Grundlagen | `halal_haram` | `islam/halal_haram/islam.aufbau.e09.json` | 6 | 89 | 178 | 48 | 26 | 15 | 0 | 1/6 |
| 21 | `islam.vertiefung.e01` | Anstand I: Kleidung, Schmuck und Gebrauchsgegenstände | `akhlaq` | `islam/akhlaq/islam.vertiefung.e01.json` | 4 | 75 | 189 | 37 | 24 | 14 | 0 | 4/4 |
| 22 | `islam.vertiefung.e02` | Anstand II: Blick, Rede und Anstand im Gottesdienst | `akhlaq` | `islam/akhlaq/islam.vertiefung.e02.json` | 5 | 84 | 144 | 41 | 17 | 5 | 0 | 4/5 |
| 23 | `islam.vertiefung.e03` | Anstand III: Erwerb, Fürsorge und Wettkampf | `akhlaq` | `islam/akhlaq/islam.vertiefung.e03.json` | 4 | 70 | 143 | 46 | 20 | 9 | 2 | 4/4 |
| 24 | `islam.vertiefung.e04` | Geschichte I: Das Leben des Propheten (Grundlagen) | `siyar` | – (zurückgestellt, Abschnitt 6) | – | – | – | – | – | – | – | – |
| 25 | `islam.vertiefung.e05` | Geschichte II: Die Gefährten und die ersten Kalifen | `siyar` | – (zurückgestellt, Abschnitt 6) | – | – | – | – | – | – | – | – |
| 26 | `islam.vertiefung.e06` | Geschichte III: Abū Ḥanīfa, seine Schüler und die hanefitische Schule | `siyar` | `islam/siyar/islam.vertiefung.e06.json` | 5 | 37 | 85 | 28 | 5 | 7 | 1 | 5/5 |
| 27 | `islam.vertiefung.e07` | Grundwissen I: Fiqh – Urteilsarten, Meinungen der Schule und Fatwa | `grundwissen` | `islam/grundwissen/islam.vertiefung.e07.json` | 4 | 57 | 93 | 34 | 15 | 9 | 0 | 4/4 |
| 28 | `islam.vertiefung.e08` | Grundwissen II: Umgang mit Koran und Hadith | `grundwissen` | `islam/grundwissen/islam.vertiefung.e08.json` | 5 | 51 | 105 | 30 | 17 | 7 | 0 | 5/5 |
| | **Summe** | **26 Einheiten** | | | **146** | **2.124** | **4.603** | **1.041** | **523** | **330** | **11** | **135/146** |

- **Zu prüfende Bausteine:** 2.124 Aussagen + 1.041 Quizfragen = 3.165; je Baustein zwei Freigaben.
- **mit Meinung** (330): `abu_hanifa` 127, `abu_yusuf` 97, `fatwa` 52, `muhammad` 44, `zufar` 10 (`fatwa` = Meinung, nach der Fatwa gegeben wird).
- **Quizfragen nach Typ:** `wahr_falsch` 472, `fallfrage` 296, `zuordnen` 179, `reihenfolge` 94.
- **Unsicher und strittig zugleich:** 4 Aussagen.
- **Für Kinder nicht vorgeschlagen** (11 Lektionen): `islam.grund.e03.l01`, `islam.grund.e03.l06`, `islam.grund.e03.l07`, `islam.grund.e08.l05`, `islam.aufbau.e02.l02`, `islam.aufbau.e09.l01`, `islam.aufbau.e09.l02`, `islam.aufbau.e09.l03`, `islam.aufbau.e09.l05`, `islam.aufbau.e09.l06`, `islam.vertiefung.e02.l01`.

**Abgleich mit dem Lehrplan**

- Ablage: alle 26 Dateien liegen am Pfad, den der Lehrplan nennt (Ordner je Bereich, auch `siyar/` und `grundwissen/`).
- Titel der Einheit: Jedes Thema in der Datei enthält den Titel des Lehrplans (mit dem Zusatz „nach hanefitischer Lehre“).
- `kinderGeeignet` je Lektion: stimmt in allen Lektionen mit dem Vorschlag des Lehrplans überein.
- Status: alle Dateien `entwurf`.
- Lektionen, die vom Lehrplan abweichen:
  - `islam.vertiefung.e08.l05` „Achtung vor dem Koran: Zuhören, Muṣḥaf und Aufbewahrung“: nicht im Lehrplan
  - `islam.grund.e07.l03`: Lehrplan „Tarāwīḥ; freiwilliges Gebet im Sitzen, auf Reittier, Fahrzeug und Schiff“, Datei „Tarāwīḥ; freiwilliges Gebet im Sitzen, auf dem Reittier, in der Sänfte und im Schiff“
  - `islam.vertiefung.e06.l05`: Lehrplan „Die Schule heute“ (zurückgestellt), Datei „Frühere und spätere Gelehrte: die Schule im Wandel der Zeit“
  - `islam.vertiefung.e08.l03`: Lehrplan „Was ein Hadith ist und wie er überliefert wird“ (zurückgestellt), Datei „Hadith in den Werken der Schule: Arten und Gewicht der Überlieferung“
  - `islam.vertiefung.e08.l04`: Lehrplan „Offenbarung, Suren und Anordnung des Korans“ (zurückgestellt), Datei „Der Koran nach den Werken der Schule: Wortlaut, Lesarten und Suren“
- `islam.vertiefung.e06` steht im Lehrplan als „zurückgestellt“; die Datei liegt als Entwurf mit 85 Belegen aus Werken des Registers vor (Abschnitt 6).

## 3. Werke und Belege

Ausgabe = Zitierform aus `web/daten/hanafi-quellen/QUELLE.md` (Wert `ausgabe` im Beleg). Belege = Anzahl der Belege aller Aussagen.

| Schlüssel | Werk | Verfasser (gest.) | Ausgabe (QUELLE.md) | Als Beleg (QUELLE.md) | Belege | Einheiten |
|---|---|---|---|---|---:|---:|
| `quduri` | Mukhtaṣar al-Qudūrī | Abū l-Ḥusayn al-Qudūrī (428/1037) | Dār al-Kutub al-ʿIlmiyya, 1418/1997 | ja | 846 | 20 |
| `nur_al_idah` | Nūr al-Īḍāḥ | ash-Shurunbulālī (1069/1659) | Dār al-Ḥikma, 1985 | ja | 908 | 17 |
| `maraqi_al_falah` | Marāqī al-Falāḥ | ash-Shurunbulālī (1069/1659) | al-Maktaba al-ʿAṣriyya, 1425/2005 | nein – zurückgestellt (LM-33); nur lokaler Arbeitstext | 0 | 0 |
| `hidaya` | al-Hidāya fī Sharḥ Bidāyat al-Mubtadī | al-Marghīnānī (593/1197) | al-Maktaba al-Islāmiyya, ohne Jahr (Ausgabe klären, LM-33) | ja | 1.033 | 22 |
| `ikhtiyar` | al-Ikhtiyār li-Taʿlīl al-Mukhtār | al-Mawṣilī (683) | Maṭbaʿat al-Ḥalabī, Kairo 1356/1937 | ja | 947 | 21 |
| `radd_al_muhtar` | Radd al-Muḥtār ʿalā d-Durr al-Mukhtār | Ibn ʿĀbidīn (1252/1836) | Dār al-Fikr, 1421/2000, 8 Bände | ja, nur Passagen ms1–6764 (ab ms6765 Vorspann Bd. 7 und vermutlich Takmila, S8 §3.6) | 681 | 23 |
| `fiqh_akbar` | al-Fiqh al-Akbar | Abū Ḥanīfa zugeschrieben (150) | Maktabat al-Furqān, 1419/1999 | ja (Glaube) | 87 | 3 |
| `tahawiyya` | al-ʿAqīda aṭ-Ṭaḥāwiyya (Matn) | aṭ-Ṭaḥāwī (321) | al-Maktab al-Islāmī, 1398/1978 (nur der Matn) | ja (Glaube) | 101 | 3 |
| `nasafiyya` | al-ʿAqāʾid an-Nasafiyya | Najm ad-Dīn an-Nasafī (537) | – | nein – zurückgestellt bis ein alter Druck beschafft ist (L0-E15, LM-33) | 0 | 0 |
| | **Summe** | | | | **4.603** | |

- Ausgabeangaben: Alle Belege tragen die Zitierform aus QUELLE.md.
- Werke außerhalb des Registers: keine. Belege aus Marāqī al-Falāḥ und al-ʿAqāʾid an-Nasafiyya: keine (beide zurückgestellt, LM-33).
- al-Hidāya: Druckvorlage ohne Jahr; die Ausgabe ist zu klären (LM-33). Prüfende prüfen dort über Kitāb und Bāb (Lehrplan §6).

**Belege je Einheit und Werk** (welche Bücher für welche Einheit bereitliegen sollten)

| Einheit | `quduri` | `nur_al_idah` | `hidaya` | `ikhtiyar` | `radd_al_muhtar` | `fiqh_akbar` | `tahawiyya` | Summe |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `islam.grund.e01` | 34 | 49 | 1 | – | 8 | – | – | 92 |
| `islam.grund.e02` | 13 | 46 | 26 | 32 | 4 | – | – | 121 |
| `islam.grund.e03` | 50 | 54 | 25 | 13 | 2 | – | – | 144 |
| `islam.grund.e04` | 26 | 45 | 34 | 46 | 33 | – | – | 184 |
| `islam.grund.e05` | 27 | 82 | 57 | 54 | 3 | – | – | 223 |
| `islam.grund.e06` | 31 | 92 | 33 | 28 | 12 | – | – | 196 |
| `islam.grund.e07` | 32 | 100 | 54 | 51 | 13 | – | – | 250 |
| `islam.grund.e08` | 88 | 119 | 107 | 5 | 10 | – | – | 329 |
| `islam.grund.e09` | – | – | – | – | – | 36 | 29 | 65 |
| `islam.grund.e10` | – | – | – | – | – | 25 | 22 | 47 |
| `islam.grund.e11` | – | – | – | – | – | 26 | 50 | 76 |
| `islam.aufbau.e01` | 13 | 45 | 28 | 30 | 8 | – | – | 124 |
| `islam.aufbau.e02` | 32 | 76 | 59 | 26 | 14 | – | – | 207 |
| `islam.aufbau.e03` | 55 | 27 | 54 | 49 | 39 | – | – | 224 |
| `islam.aufbau.e04` | 32 | 34 | 50 | 55 | 52 | – | – | 223 |
| `islam.aufbau.e05` | 47 | 39 | 50 | 64 | 25 | – | – | 225 |
| `islam.aufbau.e06` | 89 | 67 | 97 | 81 | 39 | – | – | 373 |
| `islam.aufbau.e07` | 61 | 1 | 108 | 95 | 15 | – | – | 280 |
| `islam.aufbau.e08` | 110 | – | 83 | 81 | 9 | – | – | 283 |
| `islam.aufbau.e09` | 77 | – | 76 | 15 | 10 | – | – | 178 |
| `islam.vertiefung.e01` | 14 | – | 47 | 74 | 54 | – | – | 189 |
| `islam.vertiefung.e02` | 1 | 25 | 2 | 66 | 50 | – | – | 144 |
| `islam.vertiefung.e03` | 14 | – | 20 | 56 | 53 | – | – | 143 |
| `islam.vertiefung.e06` | – | – | 6 | 6 | 73 | – | – | 85 |
| `islam.vertiefung.e07` | – | – | – | – | 93 | – | – | 93 |
| `islam.vertiefung.e08` | – | 7 | 16 | 20 | 62 | – | – | 105 |
| **Summe** | **846** | **908** | **1.033** | **947** | **681** | **87** | **101** | **4.603** |

## 4. Zuerst prüfen

Je Aussage: Schlüssel und der erste Satz der Aussage, wörtlich aus der Datei, gekürzt auf 160 Zeichen („…“). Reihenfolge
wie im Lehrplan. Die vollständige Aussage mit Belegen steht in der Prüfoberfläche und in der Datei.

¹ „[…]“: Hier steht in der Datei der Wortlaut einer Formel bzw. ein übersetzter Koranausdruck. Er wird in dieser Übersicht
  nicht wiedergegeben (KI-Regel 2; Lehrplan §1 Nr. 7); der Rest des Auszugs ist wörtlich.

### 4.1 Aussagen mit Kennzeichnung „unsicher“ (11)

Unter dem ersten Satz steht der Vermerk, wörtlich aus derselben Aussage.

1. `islam.aufbau.e02.l03.a15` – „Radd al-Muḥtār leitet daraus auch die Regel für das Rauchen ab und führt dazu Verse von ash-Shurunbulālī an: Wer beim Fasten raucht, bricht damit zweifellos …“
   - Vermerk: „(Lesart der Bedingung unsicher)“
2. `islam.aufbau.e03.l01.a04` – „In der hier benutzten Druckausgabe von Nūr al-Īḍāḥ heißt es außerdem: Gott hat die Zakat im zweiten Jahr nach der Hidschra zur Pflicht gemacht, für die …“
   - Vermerk: „(Unsicher: Der Satz steht nur in dieser Druckausgabe, nicht im Grundtext, den ash-Shurunbulālī in Marāqī al-Falāḥ wiedergibt, und in keinem anderen Werk des …“
3. `islam.aufbau.e03.l02.a01` – „In der hier benutzten Druckausgabe von Nūr al-Īḍāḥ werden fünf Vermögensarten aufgezählt, in denen Zakat Pflicht ist: Weidevieh (sawāʾim), Gold und Silber …“
   - Vermerk: „(Unsicher: Die Aufzählung steht nur in dieser Druckausgabe, nicht im Grundtext, den ash-Shurunbulālī in Marāqī al-Falāḥ wiedergibt, und in keinem anderen Werk …“
4. `islam.aufbau.e03.l06.a02` – „In der hier benutzten Druckausgabe von Nūr al-Īḍāḥ steht unter den verschiedenen Bestimmungen auch: Geldscheine (Banknoten) gelten als Vermögen, auf das nach …“
   - Vermerk: „(Unsicher: Die Bestimmung steht nur in dieser Druckausgabe, nicht im Grundtext, den ash-Shurunbulālī in Marāqī al-Falāḥ wiedergibt, und in keinem anderen Werk …“
5. `islam.aufbau.e04.l03.a02` – „In der hier benutzten Druckausgabe von Nūr al-Īḍāḥ heißt es: Der Prophet hat die Ṣadaqat al-Fiṭr im zweiten Jahr nach der Hidschra angeordnet.“
   - Vermerk: „Ob dieser Abschnitt zum Grundtext von Nūr al-Īḍāḥ gehört, ist unsicher.“
6. `islam.aufbau.e04.l04.a14` – „In der hier benutzten Druckausgabe von Nūr al-Īḍāḥ steht als Umrechnung: Ein Ṣāʿ entspricht ungefähr 4000 Gramm.“
   - Vermerk: „Diese Angabe ist unsicher: Sie stammt aus der Druckausgabe; die älteren Werke messen in Raṭl.“
7. `islam.aufbau.e06.l03.a01` – „Das Wort ʿUmra bedeutet sprachlich „Besuch“ (ziyāra).“
   - Vermerk: „(Unsicher: Die Begriffsbestimmung steht nur in dieser Druckausgabe, nicht im Grundtext, den ash-Shurunbulālī in Marāqī al-Falāḥ wiedergibt, und in keinem …“
8. `islam.aufbau.e08.l05.a17` (auch strittig) – „Nach al-Ikhtiyār ist der Vorauskauf von Brot nicht erlaubt, weil sich Brote in Dicke, Dünne und Backgrad stark unterscheiden; nach „den beiden“ ist er aber …“
   - Vermerk: „Mit „den beiden“ sind in der Schule gewöhnlich Abū Yūsuf und Muḥammad gemeint; diese Zuordnung ist unsicher, weil die Stelle keine Namen nennt.“
9. `islam.vertiefung.e03.l04.a14` (auch strittig) – „Ein Reittier belädt man nach Radd al-Muḥtār nicht über seine Kraft, und man schlägt es nach einhelliger Ansicht weder ins Gesicht noch auf den Kopf.“
   - Vermerk: „(Unsicher: Worauf sich diese Ansicht bezieht und ob der folgende Satz „wenn es sein Eigentum ist“ sie einschränkt oder fortführt, ist im benutzten Text nicht …“
10. `islam.vertiefung.e03.l04.a17` (auch strittig) – „Wer ein Rennen gewonnen hat, bestimmt man nach Radd al-Muḥtār bei Kamelen an der Schulter und bei Pferden am Hals; nach einer anderen Ansicht kommt es auf die …“
   - Vermerk: „(Unsicher: Das Wort für „Hals“ ist im benutzten Text verschrieben und hier sinngemäß gelesen; am Druck prüfen.)“
11. `islam.vertiefung.e06.l02.a05` (auch strittig) – „Radd al-Muḥtār erwähnt ein Streitgespräch al-Kisāʾīs mit „ash-Shaybānī“ in der Versammlung ar-Rashīds.“
   - Vermerk: „(Unsicher: Gemeint ist mit „ash-Shaybānī“ wohl Muḥammad; dass beide Namen dieselbe Person bezeichnen, sagen diese Stellen aber nicht ausdrücklich.)“

### 4.2 Strittige Aussagen (523)

#### `islam.grund.e01` – Reinheit I: Wasser, Unreinheit und Istinjāʾ (8)

1. `islam.grund.e01.l01.a09` – „Als „wenig“ gilt nach Nūr al-Īḍāḥ Wasser, dessen Fläche kleiner ist als zehn mal zehn.“
2. `islam.grund.e01.l01.a10` – „Wann stehendes Wasser als „viel“ gilt, bestimmen die Werke unterschiedlich.“
3. `islam.grund.e01.l01.a12` – „Radd al-Muḥtār gibt auch die Einschätzung wieder, richtig sei die Lehre ohne festes Maß.“
4. `islam.grund.e01.l02.a09` – „Wird ein totes Tier in einem Brunnen gefunden und weiß man nicht, wann es hineinfiel, gilt der Brunnen seit einem Tag und einer Nacht als unrein, wenn das …“
5. `islam.grund.e01.l02.a10` – „Abū Yūsuf und Muḥammad sagen nach Qudūrī: Im Fall des toten Tieres im Brunnen muss nichts wiederholt werden, bis man sicher weiß, wann das Tier hineingefallen …“
6. `islam.grund.e01.l03.a09` – „Nūr al-Īḍāḥ nennt als streng verpönt (makrūh taḥrīman), bei der Notdurft der Gebetsrichtung (qibla) das Gesicht oder den Rücken zuzuwenden, auch in Gebäuden.“
7. `islam.grund.e01.l05.a05` – „Ledersocken (khuff) und Ähnliches werden von einer Unreinheit, die einen Körper hat, durch Reiben gereinigt, nach Nūr al-Īḍāḥ auch dann, wenn die Unreinheit …“
8. `islam.grund.e01.l06.a04` – „Ob die Sehnen eines verendeten Tieres rein sind, beantworten die Werke unterschiedlich: Nūr al-Īḍāḥ nennt sie nach der als richtig geltenden Ansicht unrein …“

#### `islam.grund.e02` – Reinheit II: Die Gebetswaschung (wuḍūʾ) (8)

1. `islam.grund.e02.l01.a06` – „Ellenbogen und Knöchel werden nach der Lehre der Schule mitgewaschen; sie gehören zum Pflichtteil.“
2. `islam.grund.e02.l01.a07` – „Die Haut zwischen dem Wangenbart (ʿidhār) und dem Ohr gehört zum Gesicht und muss gewaschen werden.“
3. `islam.grund.e02.l02.a11` – „Die Werke ordnen einige Handlungen verschieden ein.“
4. `islam.grund.e02.l02.a13` – „Nach Nūr al-Īḍāḥ gehören auch dazu: rechts vor links beginnen, mit den Fingerspitzen beginnen, beim Bestreichen vorne am Kopf beginnen und den Nacken …“
5. `islam.grund.e02.l02.a14` – „Zum Durchkämmen des Bartes (takhlīl) geben al-Hidāya und al-Ikhtiyār mit dem Zusatz „es wird gesagt“ an: Für Abū Yūsuf ist es Sunna, für Abū Ḥanīfa und …“
6. `islam.grund.e02.l05.a04` – „Wer mehrmals wenig erbricht: Die Mengen werden zusammengezählt, wenn sie auf dieselbe Ursache – dieselbe Übelkeit – zurückgehen; so Muḥammad und so auch Nūr …“
7. `islam.grund.e02.l06.a04` – „Erbrechen, das den Mund nicht füllt, bricht die Waschung nicht.“
8. `islam.grund.e02.l06.a06` – „Wer fest auf dem Gesäß sitzend schläft und sich an etwas anlehnt, ohne das er umfallen würde: Nach der offenkundigen Lehre der Schule, überliefert von Abū …“

#### `islam.grund.e03` – Reinheit III: Ganzkörperwaschung, Tayammum, Masḥ und Monatsblutung (16)

1. `islam.grund.e03.l01.a12` – „Sunna ist die Ganzkörperwaschung nach Nūr al-Īḍāḥ für vier Anlässe: das Freitagsgebet, das Gebet an den beiden Festtagen, den Eintritt in den Weihezustand …“
2. `islam.grund.e03.l02.a05` – „Nach al-Hidāya ist die Absicht bei der Trockenreinigung Pflicht.“
3. `islam.grund.e03.l02.a08` – „Nach Abū Ḥanīfa und Muḥammad ist die Trockenreinigung mit allem erlaubt, was zur Art der Erde gehört, etwa Erde, Sand, Stein, Gips, Kalk, Kuḥl und Arsenstein …“
4. `islam.grund.e03.l02.a09` – „Nach Abū Yūsuf ist die Trockenreinigung nur mit Erde und Sand erlaubt.“
5. `islam.grund.e03.l03.a01` – „Wer hofft, vor dem Ende der Gebetszeit Wasser zu finden, dem wird empfohlen, die Trockenreinigung und das Gebet bis zum Ende der Zeit aufzuschieben.“
6. `islam.grund.e03.l03.a10` – „Vergisst ein Reisender das Wasser in seinem Gepäck, nimmt die Trockenreinigung vor, betet und erinnert sich noch innerhalb der Gebetszeit an das Wasser, muss …“
7. `islam.grund.e03.l03.a11` – „Im selben Fall muss der Reisende das Gebet nach Abū Yūsuf wiederholen.“
8. `islam.grund.e03.l04.a11` – „Socken (jawrab) darf man nach Abū Ḥanīfa nicht bestreichen, es sei denn, sie sind mit Leder überzogen (mujallad) oder haben eine Ledersohle (munʿal).“
9. `islam.grund.e03.l04.a12` – „Nach Abū Yūsuf und Muḥammad darf man Socken bestreichen, wenn sie dick sind und kein Wasser durchlassen.“
10. `islam.grund.e03.l04.a13` – „Von Abū Ḥanīfa wird berichtet, dass er sich später der Ansicht seiner beiden Schüler angeschlossen hat.“
11. `islam.grund.e03.l04.a14` – „Radd al-Muḥtār erläutert, was „dick“ bei Socken bedeutet, die weder mit Leder überzogen sind noch eine Ledersohle haben: Man kann in ihnen eine Wegstrecke von …“
12. `islam.grund.e03.l06.a03` – „Von Abū Yūsuf berichtet al-Hidāya, das Mindestmaß seien zwei Tage und der größere Teil des dritten Tages; al-Hidāya selbst folgt dem Maß von drei Tagen.“
13. `islam.grund.e03.l06.a05` – „Abū Yūsuf rechnet die trübe Färbung nach al-Hidāya nur dann zur Monatsblutung, wenn sie nach Blut auftritt.“
14. `islam.grund.e03.l06.a12` – „Bringt eine Frau Zwillinge zur Welt, beginnt ihr Wochenbett nach Abū Ḥanīfa und Abū Yūsuf mit dem Blut nach dem ersten Kind.“
15. `islam.grund.e03.l06.a13` – „Nach Muḥammad und Zufar beginnt es bei Zwillingen mit dem Blut nach dem zweiten Kind.“
16. `islam.grund.e03.l07.a07` – „Eine Frau mit Dauerblutung und jeder, der eine vergleichbare Entschuldigung (ʿudhr) hat, etwa ständigen Harnfluss, Durchfall, ständiges Nasenbluten oder eine …“

#### `islam.grund.e04` – Gebet I: Pflicht, Gebetszeiten und Gebetsruf (16)

1. `islam.grund.e04.l02.a04` – „Die Zeit des Mittagsgebets beginnt, wenn die Sonne ihren höchsten Stand überschritten hat (zawāl).“
2. `islam.grund.e04.l02.a05` – „Abū Yūsuf und Muḥammad sagen: Die Zeit des Mittagsgebets endet, wenn der Schatten so lang ist wie der Gegenstand (ohne den Mittagsschatten).“
3. `islam.grund.e04.l02.a07` – „Radd al-Muḥtār berichtet: Gelehrte der Schule (al-mashāyikh) haben erklärt, dass für das Ende der Mittagszeit die Fatwa nach Abū Yūsuf und Muḥammad gegeben …“
4. `islam.grund.e04.l02.a10` – „Was mit der Abenddämmerung gemeint ist, ist in der Schule umstritten.“
5. `islam.grund.e04.l02.a11` – „Nach Abū Yūsuf und Muḥammad ist mit der Abenddämmerung das Abendrot gemeint; das wird auch von Abū Ḥanīfa überliefert.“
6. `islam.grund.e04.l02.a13` – „Nach Nūr al-Īḍāḥ reicht die Zeit des Nachtgebets und des Witr-Gebets bis zur Morgendämmerung; das Witr wird aber nicht vor dem Nachtgebet verrichtet, weil die …“
7. `islam.grund.e04.l02.a14` – „An Orten, an denen die Morgendämmerung anbricht, bevor die Abenddämmerung verschwunden ist, fehlt die Zeit des Nachtgebets und des Witr.“
8. `islam.grund.e04.l04.a03` – „Gültig ist in diesen Zeiten auch, was erst in ihnen fällig wird: das Totengebet für einen Verstorbenen, der in dieser Zeit gebracht wird, und die …“
9. `islam.grund.e04.l05.a04` – „Beten Menschen in einer Stadt gemeinsam ohne Gebetsruf und iqāma, so haben sie nach Abū Ḥanīfa gegen die Sunna gehandelt und Schuld auf sich geladen …“
10. `islam.grund.e04.l05.a13` – „Abū Yūsuf erlaubte den Gebetsruf zum Morgengebet schon in der zweiten Hälfte der Nacht; dann wird er für das Morgengebet nicht wiederholt.“
11. `islam.grund.e04.l06.a02` – „Abū Ḥanīfa missbilligte, dass ein offenkundig sündiger Mensch (fājir) den Gebetsruf übernimmt oder dass der Gebetsrufer dafür Lohn nimmt (al-Ikhtiyār).“
12. `islam.grund.e04.l06.a05` – „Beim Abendgebet trennt man Gebetsruf und iqāma nach Abū Ḥanīfa nur durch eine kurze Pause, etwa so lang wie drei kurze Verse oder drei Schritte, ohne sich zu …“
13. `islam.grund.e04.l06.a06` – „Abū Yūsuf und Muḥammad sagen: Auch beim Abendgebet setzt sich der Gebetsrufer zwischen Gebetsruf und iqāma kurz hin, so kurz wie zwischen den beiden …“
14. `islam.grund.e04.l06.a07` – „Empfohlen ist, dass der Gebetsrufer die Menschen nach dem Gebetsruf noch einmal an das Gebet erinnert (tathwīb; Nūr al-Īḍāḥ).“
15. `islam.grund.e04.l06.a09` – „Ruft jemand den Gebetsruf ohne Gebetswaschung, ist er gültig.“
16. `islam.grund.e04.l06.a15` – „Ob man den Gebetsruf mit Worten erwidern muss, ist in der Schule umstritten.“

#### `islam.grund.e05` – Gebet II: Bedingungen, Pflichtteile und Ablauf (21)

1. `islam.grund.e05.l01.a08` – „Ist weniger als ein Viertel rein, hat er nach Nūr al-Īḍāḥ die Wahl.“
2. `islam.grund.e05.l01.a09` – „Muḥammad ist anderer Ansicht: Auch wenn weniger als ein Viertel rein ist, muss man im Kleidungsstück beten.“
3. `islam.grund.e05.l01.a15` – „Bei der freien Frau ist im Gebet der ganze Körper ʿawra außer dem Gesicht und den Händen.“
4. `islam.grund.e05.l01.a16` – „Wird ein Viertel eines Körperteils der ʿawra aufgedeckt, ist das Gebet nicht gültig.“
5. `islam.grund.e05.l01.a17` – „Abū Yūsuf ist anderer Ansicht: Nach ihm wird das Gebet nicht wiederholt, wenn weniger als die Hälfte eines Körperteils aufgedeckt ist; für genau die Hälfte …“
6. `islam.grund.e05.l02.a07` – „Wer unsicher ist und zu beten beginnt, ohne sich um die Richtung zu bemühen, oder wer jemanden hätte fragen können und es nicht tat, muss das Gebet …“
7. `islam.grund.e05.l02.a08` – „Abū Yūsuf ist anderer Ansicht: Wer ohne Bemühen begonnen hat und während des Gebets erfährt, dass er richtig liegt, setzt das Gebet fort.“
8. `islam.grund.e05.l03.a07` – „Über das Mindestmaß der Rezitation gibt es in der Schule zwei Ansichten.“
9. `islam.grund.e05.l03.a10` – „Sich nur mit der Nase niederzuwerfen, ohne die Stirn, ist nach Nūr al-Īḍāḥ nur gültig, wenn man an der Stirn eine Entschuldigung hat.“
10. `islam.grund.e05.l03.a11` – „Nach der bei Qudūrī und in al-Hidāya überlieferten Ansicht Abū Ḥanīfas genügt es, sich nur auf die Nase oder nur auf die Stirn niederzuwerfen.“
11. `islam.grund.e05.l03.a14` – „Ob man bei der Niederwerfung auch Hände und Knie aufsetzen muss, beantworten die Werke verschieden: Nūr al-Īḍāḥ zählt es nach der richtigen Ansicht zu den …“
12. `islam.grund.e05.l04.a04` – „Das ruhige Verweilen in Verbeugung und Niederwerfung ist nach Abū Ḥanīfa und Muḥammad kein Pflichtteil (farḍ).“
13. `islam.grund.e05.l04.a05` – „Abū Yūsuf hält für Pflicht (farḍ): das ruhige Verweilen in Verbeugung und Niederwerfung, das vollständige Aufrichten aus der Verbeugung und das Sitzen …“
14. `islam.grund.e05.l04.a06` – „Notwendig sind auch das erste Sitzen, nach der richtigen Ansicht der Tashahhud darin und der Tashahhud im letzten Sitzen.“
15. `islam.grund.e05.l05.a05` – „Die Zuflucht gehört nach Abū Ḥanīfa und Muḥammad zur Rezitation.“
16. `islam.grund.e05.l05.a07` – „Für die Länge der Rezitation nennt Nūr al-Īḍāḥ als Sunna: im Morgen- und im Mittagsgebet Suren aus den langen Suren des Mufaṣṣal, im Nachmittags- und im …“
17. `islam.grund.e05.l05.a08` – „Muḥammad hält es für empfohlen, in allen Gebeten die erste Einheit länger zu machen.“
18. `islam.grund.e05.l06.a03` – „Abū Yūsuf ist anderer Ansicht: Wer den Takbīr gut sprechen kann, beginnt das Gebet nur mit den Wortformen des Takbīr gültig.“
19. `islam.grund.e05.l06.a04` – „Wer kein Arabisch kann, darf das Gebet auf Persisch beginnen.“
20. `islam.grund.e05.l06.a05` – „Al-Hidāya berichtet: Nach Abū Ḥanīfa ist die Rezitation auf Persisch auch für den gültig, der Arabisch kann; Abū Yūsuf und Muḥammad lassen sie nur bei …“
21. `islam.grund.e05.l06.a08` – „Beim Aufrichten aus der Verbeugung werden zwei kurze Gedenkworte gesprochen, das tasmīʿ und das taḥmīd.“

#### `islam.grund.e06` – Gebet III: Gemeinschaftsgebet, Störungen und Niederwerfung des Versehens (24)

1. `islam.grund.e06.l01.a02` – „Ob das Gemeinschaftsgebet Sunna oder notwendig (wājib) ist, wird in der Schule verschieden ausgedrückt.“
2. `islam.grund.e06.l01.a03` – „Das Amt des Vorbeters (imāma) ist vorzüglicher als das des Gebetsrufers (Nūr al-Īḍāḥ).“
3. `islam.grund.e06.l01.a05` – „Frauen und Kinder vor der Geschlechtsreife können Männern nicht gültig vorbeten (al-Qudūrī, al-Ikhtiyār).“
4. `islam.grund.e06.l01.a08` – „Zufar meint, eine Frau trete auch ohne diese Absicht des Imams in das Gemeinschaftsgebet ein, so wie ein Mann.“
5. `islam.grund.e06.l01.a14` – „Muḥammad hält es nicht für gültig, dass jemand mit Gebetswaschung einem folgt, der die Trockenreinigung vollzogen hat, und dass ein Stehender einem Sitzenden …“
6. `islam.grund.e06.l01.a16` – „Nach al-Qudūrī ist es für Frauen verpönt, am Gemeinschaftsgebet teilzunehmen; al-Ikhtiyār sagt, für junge Frauen gelte das nach einhelliger Ansicht.“
7. `islam.grund.e06.l01.a17` – „Nach Abū Yūsuf und Muḥammad dürfen ältere Frauen zu allen Gebeten hinausgehen (al-Qudūrī, al-Ikhtiyār).“
8. `islam.grund.e06.l01.a18` – „Spätere Gelehrte der Schule haben anders entschieden: Al-Ikhtiyār hält es für seine Zeit für die gewählte Ansicht (al-mukhtār), dass Frauen wegen des Verfalls …“
9. `islam.grund.e06.l02.a02` – „Wer wegen einer dieser erlaubten Entschuldigungen nicht am Gemeinschaftsgebet teilnimmt, erhält nach Nūr al-Īḍāḥ dennoch dessen Lohn.“
10. `islam.grund.e06.l02.a05` – „Nach Abū Yūsuf hat der beste Rezitator den Vortritt vor dem Kundigsten, weil man die Rezitation unbedingt braucht, das Wissen aber nur, wenn im Gebet etwas …“
11. `islam.grund.e06.l03.a10` – „Geschieht eines dieser Dinge erst, nachdem der Betende am Ende bereits so lange gesessen hat, wie das Tashahhud dauert, ist das Gebet nach Abū Ḥanīfa ungültig …“
12. `islam.grund.e06.l03.a11` – „Nach Abū Yūsuf und Muḥammad ist das Gebet in diesen Fällen vollständig (al-Qudūrī).“
13. `islam.grund.e06.l03.a17` – „Liest der Betende den Koran aus einem Muṣḥaf ab, wird das Gebet nach Abū Ḥanīfa ungültig: Den Muṣḥaf tragen, hineinsehen und umblättern ist viel Bewegung, und …“
14. `islam.grund.e06.l03.a18` – „Nach Abū Yūsuf und Muḥammad ist das Gebet beim Ablesen aus dem Muṣḥaf vollständig, aber verpönt, weil es der Praxis der Leute der Schrift ähnelt (al-Hidāya).“
15. `islam.grund.e06.l04.a13` – „Wer erwartet, dass jemand vor ihm vorbeigeht, dem ist empfohlen, einen Sichtschutz (sutra) aufzustellen: mindestens eine Elle hoch und etwa fingerdick.“
16. `islam.grund.e06.l04.a14` – „Al-Hidāya lässt als Sichtschutz nur einen aufgestellten Gegenstand gelten, nicht einen hingelegten und nicht eine gezogene Linie, weil damit der Zweck nicht …“
17. `islam.grund.e06.l04.a15` – „Nach Nūr al-Īḍāḥ ist es empfohlen, einen Vorbeigehenden nicht abzuwehren; erlaubt ist, ihn mit einer Geste oder mit der Lobpreisung (tasbīḥ) abzuwehren …“
18. `islam.grund.e06.l05.a07` – „Betet jemand die Sunna vor dem Freitagsgebet und der Prediger tritt heraus, oder die Sunna vor dem Mittagsgebet und die iqāma wird gesprochen, gibt er nach …“
19. `islam.grund.e06.l05.a08` – „Radd al-Muḥtār berichtet auch die Gegenansicht: Er vollendet die Sunna mit vier Rakʿas.“
20. `islam.grund.e06.l05.a13` – „Zufar meint: Wer den Imam in der Verbeugung erreicht und stehen bleibt, hat die Rakʿa erreicht, weil er den Imam in einem Zustand angetroffen hat, der als …“
21. `islam.grund.e06.l06.a02` – „Die Niederwerfung des Versehens ist notwendig (wājib).“
22. `islam.grund.e06.l06.a06` – „Wie viele Friedensgrüße vor der Niederwerfung des Versehens gesprochen werden, beurteilen die Werke verschieden: Nūr al-Īḍāḥ hält einen Gruß nach rechts für …“
23. `islam.grund.e06.l06.a10` – „Vergisst jemand im Pflichtgebet das erste Sitzen, kehrt er nach Nūr al-Īḍāḥ dazu zurück, solange er sich noch nicht ganz aufgerichtet hat; das sei die …“
24. `islam.grund.e06.l06.a11` – „Vergisst jemand das letzte Sitzen und steht zu einer weiteren Rakʿa auf, kehrt er zurück, solange er sich in ihr nicht niedergeworfen hat, und macht die …“

#### `islam.grund.e07` – Gebet IV: Witr, freiwillige Gebete, Nachholen und Krankengebet (38)

1. `islam.grund.e07.l01.a02` – „Nach Abū Ḥanīfa ist das Witr notwendig (wājib).“
2. `islam.grund.e07.l01.a03` – „Nach Abū Yūsuf und Muḥammad ist das Witr Sunna.“
3. `islam.grund.e07.l01.a04` – „Radd al-Muḥtār berichtet: Von Abū Ḥanīfa sind über das Witr drei Aussagen überliefert – Pflicht (farḍ), notwendig (wājib) und Sunna.“
4. `islam.grund.e07.l01.a10` – „Ob man das Qunūt laut oder leise spricht, ist in der Schule umstritten (al-Ikhtiyār).“
5. `islam.grund.e07.l01.a11` – „Nach Abū Yūsuf spricht man das Qunūt im Witr nicht laut, und auch wer hinter dem Imam betet, spricht es, weil es ein Bittgebet ist (al-Ikhtiyār).“
6. `islam.grund.e07.l01.a12` – „Nach Muḥammad spricht der Imam das Qunūt laut, und die Betenden hinter ihm sagen „[…]“; wer allein betet, darf nach al-Ikhtiyār laut oder leise sprechen.“ ¹
7. `islam.grund.e07.l01.a14` – „Auch al-Ikhtiyār sagt: Wer das Qunūt vergisst, sich verbeugt und sich dann erinnert, kehrt nicht zurück.“
8. `islam.grund.e07.l01.a17` – „Folgt man im Morgengebet einem Imam, der dort das Qunūt spricht, steht man nach der offenkundigeren Ansicht während seines Qunūt schweigend mit ihm und lässt …“
9. `islam.grund.e07.l01.a18` – „Nach Abū Yūsuf folgt man dem Imam auch im Qunūt des Morgengebets, weil man seinem Imam folgt und das Qunūt eine Frage der Rechtsfindung (ijtihād) ist …“
10. `islam.grund.e07.l01.a20` – „Ob man im Ramaḍān das Witr besser mit der Gemeinschaft oder allein am Ende der Nacht betet, ist umstritten.“
11. `islam.grund.e07.l02.a10` – „Nach Abū Ḥanīfa darf man in der Nacht bis zu acht Rakʿas mit einem Friedensgruß beten, und am besten betet man am Tag wie in der Nacht je vier.“
12. `islam.grund.e07.l02.a11` – „Nach Abū Yūsuf und Muḥammad betet man in der Nacht nicht mehr als zwei Rakʿas mit einem Friedensgruß (Qudūrī); am besten betet man nach ihnen nachts je zwei …“
13. `islam.grund.e07.l02.a19` – „Nach dem Freitagsgebet betet man nach al-Ikhtiyār vier Rakʿas.“
14. `islam.grund.e07.l03.a02` – „Wie man dabei sitzt, ist umstritten.“
15. `islam.grund.e07.l03.a03` – „Wer ein freiwilliges Gebet im Stehen beginnt, darf es nach Abū Ḥanīfa auch ohne Entschuldigung im Sitzen beenden (Qudūrī).“
16. `islam.grund.e07.l03.a04` – „Nach Abū Yūsuf und Muḥammad ist das nur mit Entschuldigung erlaubt (Qudūrī).“
17. `islam.grund.e07.l03.a08` – „Ob man auch in der Stadt freiwillig auf dem Reittier beten darf, ist umstritten: Nach Abū Yūsuf ist es erlaubt, nach Muḥammad verpönt.“
18. `islam.grund.e07.l03.a13` – „Das Pflichtgebet im fahrenden Schiff ist nach Abū Ḥanīfa auch ohne Entschuldigung im Sitzen gültig, mit Verbeugung und Niederwerfung (Nūr al-Īḍāḥ).“
19. `islam.grund.e07.l03.a14` – „Nach Abū Yūsuf und Muḥammad ist es im Sitzen nur mit Entschuldigung gültig, etwa bei Schwindel oder wenn man nicht an Land gehen kann; Nūr al-Īḍāḥ nennt das …“
20. `islam.grund.e07.l04.a05` – „Qudūrī sagt, die Reihenfolge entfalle, wenn die versäumten Gebete mehr als sechs werden; ebenso lautet die Stelle in al-Hidāya.“
21. `islam.grund.e07.l04.a06` – „Ist die Reihenfolge wegen vieler versäumter Gebete entfallen, kehrt sie nach der richtigeren Ansicht nicht zurück, wenn ihre Zahl durch Nachholen wieder klein …“
22. `islam.grund.e07.l04.a07` – „Ob alte versäumte Gebete mitzählen, ist umstritten.“
23. `islam.grund.e07.l04.a08` – „Betet jemand ein Pflichtgebet, obwohl er sich an ein versäumtes Gebet erinnert – auch an ein versäumtes Witr –, ist es nach Nūr al-Īḍāḥ nur vorläufig ungültig …“
24. `islam.grund.e07.l04.a09` – „Nach Abū Yūsuf und Muḥammad ist ein solches Gebet endgültig ungültig und kann nicht nachträglich gültig werden (al-Hidāya).“
25. `islam.grund.e07.l04.a10` – „Betet jemand das Morgengebet, obwohl er sich erinnert, dass er das Witr nicht gebetet hat, ist das Morgengebet nach Abū Ḥanīfa ungültig, nach Abū Yūsuf und …“
26. `islam.grund.e07.l04.a12` – „Von Muḥammad wird überliefert, dass man die Sunna des Morgengebets auch dann nachholt, wenn man sie allein versäumt hat (al-Ikhtiyār).“
27. `islam.grund.e07.l05.a06` – „Zufar meint, man deute dann mit dem Herzen an, weil man mit dem Herzen schon Pflichten wie die Absicht erfülle (al-Ikhtiyār).“
28. `islam.grund.e07.l05.a07` – „Ob er die aufgeschobenen Gebete später nachholen muss, ist umstritten.“
29. `islam.grund.e07.l05.a08` – „Viele Werke entscheiden anders: Dauert die Unfähigkeit länger als einen Tag und eine Nacht, also mehr als fünf Gebete, entfällt das Nachholen, auch wenn er …“
30. `islam.grund.e07.l05.a12` – „Hat er im Sitzen mit Verbeugung und Niederwerfung gebetet und wird während des Gebets gesund, setzt er es im Stehen fort (Nūr al-Īḍāḥ); al-Hidāya nennt das …“
31. `islam.grund.e07.l05.a13` – „Nach Muḥammad beginnt er dann neu.“
32. `islam.grund.e07.l05.a16` – „„Mehr“ heißt dabei: mehr als einen Tag und eine Nacht.“
33. `islam.grund.e07.l06.a04` – „Die übrigen sieben sind: an-Naml, as-Sajda (Alif Lām Mīm Tanzīl), Ṣād, Fuṣṣilat (Ḥā Mīm as-Sajda), an-Najm, al-Inshiqāq und al-ʿAlaq (siehe Verweise).“
34. `islam.grund.e07.l06.a08` – „Rezitiert ein Betender hinter dem Imam einen Niederwerfungsvers, werfen sich weder der Imam noch die Betenden nieder, weder im Gebet noch danach; so Abū …“
35. `islam.grund.e07.l06.a09` – „Nach Muḥammad werfen sie sich nach dem Gebet nieder, weil die Ursache eingetreten ist und nach dem Gebet nichts mehr entgegensteht (al-Hidāya, al-Ikhtiyār).“
36. `islam.grund.e07.l06.a19` – „Die Dankesniederwerfung (sajdat ash-shukr) ist nach Abū Ḥanīfa verpönt: Man wird für sie nicht belohnt, und sie zu unterlassen ist besser (Nūr al-Īḍāḥ).“
37. `islam.grund.e07.l06.a20` – „Nach Abū Yūsuf und Muḥammad ist sie eine Handlung, mit der man sich Gott nähert (qurba), und man wird für sie belohnt.“
38. `islam.grund.e07.l06.a21` – „Radd al-Muḥtār erläutert, die Fatwa folge hier der Ansicht der beiden (Abū Yūsuf und Muḥammad).“

#### `islam.grund.e08` – Gebet V: Reise, Freitag, Festtage und Totengebet (47)

1. `islam.grund.e08.l01.a02` – „Abū Yūsuf bemaß die Strecke mit zwei Tagen und dem größten Teil des dritten; al-Hidāya hält dem die Sunna als Beleg entgegen.“
2. `islam.grund.e08.l01.a03` – „Nach al-Hidāya ist es richtig, die Strecke nicht nach Farsakh (einem Wegmaß) zu bemessen; Radd al-Muḥtār nennt die drei Tagesreisen die Lehre der Schule …“
3. `islam.grund.e08.l02.a06` – „Wie die Stadt bestimmt wird, ist in der Schule verschieden überliefert.“
4. `islam.grund.e08.l02.a08` – „Radd al-Muḥtār bespricht Fälle, in denen diese Bedingung nicht erfüllt werden kann: Stirbt der Statthalter oder bleibt er wegen Unruhen fern und ist niemand …“
5. `islam.grund.e08.l02.a09` – „Ob das Freitagsgebet in einer Stadt an mehreren Orten gehalten werden darf, ist in der Schule besprochen worden.“
6. `islam.grund.e08.l02.a12` – „Beschränkt sich der Imam in der Predigt auf ein kurzes Gedenken Gottes, etwa einen Lobpreis, ist das nach Abū Ḥanīfa gültig (al-Qudūrī, al-Hidāya).“
7. `islam.grund.e08.l02.a13` – „Abū Yūsuf und Muḥammad sagen: Nötig ist ein längeres Gedenken, das man eine Predigt nennt.“
8. `islam.grund.e08.l02.a15` – „Für die Gemeinschaft des Freitagsgebets braucht es nach Abū Ḥanīfa mindestens drei Männer außer dem Imam (al-Qudūrī, al-Hidāya); nach Nūr al-Īḍāḥ dürfen es …“
9. `islam.grund.e08.l02.a16` – „Nach al-Qudūrī sagen Abū Yūsuf und Muḥammad: Es genügen zwei Männer außer dem Imam.“
10. `islam.grund.e08.l02.a17` – „Die Teilnehmer müssen beim Imam bleiben, bis er sich in der ersten Einheit niedergeworfen hat.“
11. `islam.grund.e08.l02.a18` – „Mit dem ersten Gebetsruf am Freitag ist es Pflicht, zum Freitagsgebet zu eilen und Kauf und Verkauf zu lassen; Nūr al-Īḍāḥ nennt das die richtigere Ansicht …“
12. `islam.grund.e08.l02.a19` – „Kommt der Imam zur Predigt heraus, gibt es kein Gebet und kein Sprechen mehr – nach al-Qudūrī, bis er die Predigt beendet hat, nach Nūr al-Īḍāḥ, bis er mit …“
13. `islam.grund.e08.l02.a20` – „Abū Yūsuf und Muḥammad sagen: Es ist nicht schlimm zu sprechen, wenn der Imam herausgekommen ist und noch nicht predigt, und wenn er von der Kanzel …“
14. `islam.grund.e08.l02.a21` – „Wer ohne Entschuldigung am Freitag vor dem Freitagsgebet des Imams zu Hause das Mittagsgebet betet, dessen Gebet ist gültig, aber er handelt verpönt …“
15. `islam.grund.e08.l02.a22` – „Macht sich jemand, der so das Mittagsgebet schon gebetet hat, danach doch auf den Weg zum Freitagsgebet, während der Imam noch darin ist, wird sein …“
16. `islam.grund.e08.l02.a23` – „Abū Yūsuf und Muḥammad sagen: Sein Mittagsgebet wird erst ungültig, wenn er mit dem Imam ins Freitagsgebet eintritt (al-Qudūrī, al-Hidāya).“
17. `islam.grund.e08.l02.a25` – „Wer den Imam am Freitag erst spät erreicht, betet mit ihm, was er erreicht, und vollendet darauf das Freitagsgebet; das gilt nach Abū Ḥanīfa und Abū Yūsuf …“
18. `islam.grund.e08.l02.a26` – „Muḥammad sagt: Hat er mit dem Imam den größeren Teil der zweiten Einheit erreicht, vollendet er das Freitagsgebet; hat er weniger erreicht, betet er das …“
19. `islam.grund.e08.l03.a02` – „Al-Hidāya bespricht, ob das Festgebet Sunna oder notwendig ist: Eine Stelle in al-Jāmiʿ aṣ-Ṣaghīr spricht von Sunna; nach einer Überlieferung von Abū Ḥanīfa …“
20. `islam.grund.e08.l03.a04` – „Danach geht man nach Nūr al-Īḍāḥ zu Fuß zum Gebetsplatz und spricht dabei leise den Takbīr.“
21. `islam.grund.e08.l03.a05` – „Nach Abū Ḥanīfa spricht man am Fest des Fastenbrechens auf dem Weg zum Gebetsplatz keinen Takbīr (al-Qudūrī, al-Hidāya).“
22. `islam.grund.e08.l03.a06` – „Abū Yūsuf und Muḥammad sagen: Auch am Fest des Fastenbrechens spricht man auf dem Weg den Takbīr, so wie am Opferfest (al-Qudūrī, al-Hidāya).“
23. `islam.grund.e08.l03.a07` – „Vor dem Festgebet betet man am Gebetsplatz kein freiwilliges Gebet (al-Qudūrī).“
24. `islam.grund.e08.l03.a10` – „Al-Hidāya nennt die Zahl von drei zusätzlichen Takbīrs je Einheit die Ansicht von Ibn Masʿūd und die Lehre der Schule.“
25. `islam.grund.e08.l03.a12` – „Von Abū Yūsuf ist überliefert, dass man bei den zusätzlichen Takbīrs die Hände nicht hebt.“
26. `islam.grund.e08.l03.a18` – „Nach Abū Ḥanīfa ist der Takbīr der Tashrīq-Tage notwendig (wājib) vom Morgengebet am Tag von ʿArafa bis zum Nachmittagsgebet am Festtag, also nach acht …“
27. `islam.grund.e08.l03.a19` – „Abū Yūsuf und Muḥammad sagen: Der Takbīr ist nach jedem Pflichtgebet notwendig für jeden, der es betet, auch allein, auf Reisen oder im Dorf, bis zum …“
28. `islam.grund.e08.l04.a04` – „Nach Abū Ḥanīfa rezitiert der Imam im Finsternisgebet leise (al-Qudūrī, al-Hidāya).“
29. `islam.grund.e08.l04.a05` – „Abū Yūsuf und Muḥammad sagen: Der Imam rezitiert im Finsternisgebet laut (al-Qudūrī).“
30. `islam.grund.e08.l04.a08` – „Nach Abū Ḥanīfa gibt es bei der Regenbitte kein Gebet, das in Gemeinschaft Sunna wäre.“
31. `islam.grund.e08.l04.a09` – „Abū Yūsuf und Muḥammad sagen nach al-Qudūrī: Der Imam betet mit den Leuten zwei Einheiten und rezitiert darin laut; er wendet sich beim Bittgebet zur …“
32. `islam.grund.e08.l04.a10` – „Al-Hidāya ordnet die Ansichten genauer zu: Das gemeinsame Gebet von zwei Einheiten nennt al-Aṣl als Ansicht Muḥammads allein; laut rezitiert wird darin wie im …“
33. `islam.grund.e08.l04.a18` – „Abū Yūsuf bestritt, dass das Gebet in Gefahr in der beschriebenen Form in späteren Zeiten noch rechtlich vorgesehen ist.“
34. `islam.grund.e08.l05.a01` – „Den Sterbenden legt man nach der Sunna auf die rechte Seite, mit dem Gesicht zur Gebetsrichtung (al-Qudūrī, Nūr al-Īḍāḥ).“
35. `islam.grund.e08.l05.a03` – „Ob man dem Verstorbenen nach der Bestattung am Grab das Glaubensbekenntnis vorspricht, ist in der Schule umstritten.“
36. `islam.grund.e08.l05.a04` – „Es ist empfohlen, dass Verwandte und Nachbarn den Sterbenden besuchen und bei ihm Sure Yā Sīn (Sure 36) rezitieren; einige spätere Gelehrte hielten auch Sure …“
37. `islam.grund.e08.l06.a05` – „Von Abū Ḥanīfa ist auch überliefert, dass der Imam beim Mann auf Höhe des Kopfes und bei der Frau auf Höhe der Mitte steht, weil Anas so gehandelt habe.“
38. `islam.grund.e08.l06.a07` – „Nach dem vierten Takbīr spricht man nach der offensichtlichen Überlieferung (ẓāhir ar-riwāya) den Friedensgruß ohne weiteres Bittgebet.“
39. `islam.grund.e08.l06.a10` – „Wer das Recht hat, beim Totengebet voranzugehen, hat darin Vorrang vor jemandem, den der Verstorbene in seinem Testament dafür bestimmt hat; das ist nach Nūr …“
40. `islam.grund.e08.l06.a13` – „Wer erst kommt, nachdem der Imam schon einen oder zwei Takbīrs gesprochen hat, steigt nicht sofort ein, sondern wartet den nächsten Takbīr des Imams ab …“
41. `islam.grund.e08.l06.a14` – „Abū Yūsuf sagt: Wer zu spät kommt, spricht den Takbīr, sobald er da ist, denn der erste Takbīr ist der Eröffnungs-Takbīr, und den spricht auch der Verspätete …“
42. `islam.grund.e08.l06.a15` – „In einer Moschee, in der die Gemeinschaftsgebete stattfinden, ist das Totengebet verpönt – nach der gewählten Ansicht auch dann, wenn der Verstorbene …“
43. `islam.grund.e08.l06.a16` – „Ob diese Verpöntheit ein Verbot (karāhat taḥrīm) oder nur eine Empfehlung zu unterlassen (karāhat tanzīh) ist, ist umstritten.“
44. `islam.grund.e08.l06.a17` – „Gab ein Neugeborenes nach der Geburt ein Lebenszeichen von sich (istihlāl), erhält es einen Namen, wird gewaschen, und man betet für es.“
45. `islam.grund.e08.l07.a14` – „Gräber zu besuchen, ist nach der richtigeren Ansicht für Männer und Frauen empfohlen (Nūr al-Īḍāḥ).“
46. `islam.grund.e08.l07.a18` – „Wird jemand im Zustand der großen Unreinheit (janāba) zum Märtyrer, wird er nach Abū Ḥanīfa gewaschen; ebenso ein Kind (al-Qudūrī, al-Hidāya).“
47. `islam.grund.e08.l07.a19` – „Abū Yūsuf und Muḥammad sagen: Der Märtyrer im Zustand der großen Unreinheit und das Kind werden nicht gewaschen (al-Qudūrī, al-Hidāya).“

#### `islam.grund.e09` – Glaube I: Grundlagen des Glaubens und die Einheit Gottes (3)

1. `islam.grund.e09.l01.a11` – „Im selben Lehrsatz sagt al-Fiqh al-Akbar, der Glaube nehme zu und ab, was die Gewissheit (yaqīn) und das Fürwahrhalten betrifft.“
2. `islam.grund.e09.l04.a09` – „Al-Fiqh al-Akbar lehrt: Gott hat Hand, Gesicht und Selbst (nafs), so wie Er es im Koran erwähnt.“
3. `islam.grund.e09.l06.a08` – „Al-Fiqh al-Akbar lehrt weiter: Alle Gläubigen sind gleich darin, dass sie Gott erkennen, Gewissheit haben, Ihm vertrauen (tawakkul), Ihn lieben, mit Ihm …“

#### `islam.aufbau.e01` – Fasten I: Pflicht, Arten, Absicht und Monatsbeginn (14)

1. `islam.aufbau.e01.l02.a02` – „Pflicht (farḍ) ist nach Nūr al-Īḍāḥ das Fasten im Ramadan, zur rechten Zeit wie als Nachholen, außerdem das Sühnefasten (kaffārāt) und nach der …“
2. `islam.aufbau.e01.l03.a03` – „Von Zufar wird überliefert, ein gesunder Ansässiger brauche im Ramadan keine Absicht, weil diese Zeit nur für das Pflichtfasten bestimmt sei.“
3. `islam.aufbau.e01.l03.a08` – „Anders der Reisende: Beabsichtigt er im Ramadan ein anderes Pflichtfasten, zählt es nach Nūr al-Īḍāḥ für das, was er beabsichtigt hat.“
4. `islam.aufbau.e01.l03.a09` – „Nach Abū Ḥanīfa zählt das Fasten eines Kranken oder Reisenden, der im Ramadan ein anderes Pflichtfasten beabsichtigt, für dieses andere Fasten; nach Abū Yūsuf …“
5. `islam.aufbau.e01.l04.a02` – „Die Aussage der Zeitberechner (muwaqqitūn) zählt nach Radd al-Muḥtār für die Fastenpflicht der Menschen nicht; nach dem dort angeführten al-Miʿrāj gilt das …“
6. `islam.aufbau.e01.l04.a03` – „Ob man sich auf die Berechner stützen darf, ist umstritten.“
7. `islam.aufbau.e01.l04.a04` – „Der Tag des Zweifels (yawm ash-shakk) ist der Tag nach dem 29. Shaʿbān, an dem Wissen und Nichtwissen gleich stehen, weil der Neumond verdeckt war (Nūr …“
8. `islam.aufbau.e01.l04.a09` – „Ob am Tag des Zweifels das Fasten oder das Nichtfasten besser ist, ist nach al-Ikhtiyār umstritten: Wer Shaʿbān gefastet hat oder auf wessen gewohntes Fasten …“
9. `islam.aufbau.e01.l04.a13` – „Zur Größe der Gruppe nennt al-Hidāya weitere Ansichten: Es heißt, gemeint seien die Bewohner eines Stadtviertels; von Abū Yūsuf wird überliefert: fünfzig …“
10. `islam.aufbau.e01.l04.a15` – „Wurde der Ramadan auf die Aussage eines Einzelnen hin begonnen und ist nach dreißig Tagen bei klarem Himmel kein Neumond von Shawwāl zu sehen, darf man nach …“
11. `islam.aufbau.e01.l04.a16` – „Ist der Neumond an einem Ort festgestellt, gilt das nach der offenkundigen Lehre der Schule (ẓāhir al-madhhab) für alle Menschen; unterschiedliche …“
12. `islam.aufbau.e01.l04.a17` – „Nach einer anderen Ansicht kommt es auf die Aufgangsorte an.“
13. `islam.aufbau.e01.l04.a19` – „Wird der Neumond am Tag gesehen, vor oder nach dem Mittag, zählt das nach der gewählten Ansicht nicht für den laufenden Tag; der Neumond gehört zur kommenden …“
14. `islam.aufbau.e01.l05.a03` – „Nach einer Überlieferung darf, wer freiwillig fastet, das Fasten auch ohne Entschuldigungsgrund brechen.“

#### `islam.aufbau.e02` – Fasten II: Was das Fasten bricht, Nachholen, Sühne und Iʿtikāf (21)

1. `islam.aufbau.e02.l01.a12` – „Geht unwillkürliches Erbrochenes, das den Mund füllt, von selbst wieder zurück, bricht das nach Abū Yūsuf das Fasten, weil es den Körper schon verlassen …“
2. `islam.aufbau.e02.l01.a14` – „Nach Zufar ist das Fasten durch Speisereste zwischen den Zähnen in jedem Fall gebrochen, weil der Mund als Außenseite des Körpers gilt; beim Rest in …“
3. `islam.aufbau.e02.l01.a15` – „Träufelt jemand Wasser oder Öl in seine Harnröhre, bleibt sein Fasten nach Abū Ḥanīfa gültig (al-Qudūrī); Nūr al-Īḍāḥ zählt das ohne Einschränkung zu den …“
4. `islam.aufbau.e02.l01.a16` – „Nach Abū Yūsuf bricht das Einträufeln in die Harnröhre das Fasten (al-Qudūrī, al-Hidāya).“
5. `islam.aufbau.e02.l02.a08` – „Hat sich jemand schröpfen lassen und isst danach absichtlich, weil er glaubt, sein Fasten sei gebrochen, schuldet er nach al-Hidāya die Sühne – außer ein …“
6. `islam.aufbau.e02.l02.a13` – „Geht jemand im Ramadan ohne die Absicht zu fasten in den Tag und isst dann, schuldet er nach Abū Ḥanīfa keine Sühne, weil ohne Absicht gar kein Fasten …“
7. `islam.aufbau.e02.l02.a14` – „Nach Abū Yūsuf und Muḥammad schuldet er die Sühne, wenn er vor dem Mittag gegessen hat, weil er sich damit die Möglichkeit genommen hat, das Fasten noch zu …“
8. `islam.aufbau.e02.l02.a15` – „Wer zum Fastenbrechen gezwungen wird, schuldet keine Sühne, auch beim Geschlechtsverkehr; er holt nur nach (Nūr al-Īḍāḥ).“
9. `islam.aufbau.e02.l03.a04` – „Ob Wasser, das man sich absichtlich ins Ohr träufelt, das Fasten bricht, beurteilen die Werke unterschiedlich: Nach Nūr al-Īḍāḥ bricht es das Fasten nach der …“
10. `islam.aufbau.e02.l03.a05` – „Behandelt jemand eine tiefe Bauch- oder Kopfwunde mit Arznei und gelangt diese ins Körperinnere oder ins Gehirn, ist sein Fasten gebrochen (Nūr al-Īḍāḥ …“
11. `islam.aufbau.e02.l03.a06` – „Nach Abū Yūsuf und Muḥammad ist das Fasten in diesem Fall nicht gebrochen, weil nicht sicher ist, dass die Arznei wirklich ins Innere gelangt (al-Hidāya …“
12. `islam.aufbau.e02.l03.a13` – „Wer am Morgen ansässig ist und danach eine Reise antritt, darf das Fasten an diesem Tag nicht brechen.“
13. `islam.aufbau.e02.l03.a16` – „Absichtlich herbeigeführtes Erbrechen bricht das Fasten nach der offenkundigen Überlieferung (ẓāhir ar-riwāya) auch dann, wenn es weniger als einen Mundvoll …“
14. `islam.aufbau.e02.l04.a08` – „Nicht verpönt ist es nach Nūr al-Īḍāḥ auch, Mund oder Nase außerhalb der Gebetswaschung auszuspülen, zu baden und sich zur Abkühlung in ein nasses Tuch zu …“
15. `islam.aufbau.e02.l04.a09` – „Abū Ḥanīfa hielt diese Dinge – das Ausspülen, das Baden und das nasse Tuch – für verpönt, weil man damit im Gottesdienst Unmut über die Mühe zeigt (Radd …“
16. `islam.aufbau.e02.l05.a14` – „Für die Ersatzleistung, die der Sachwalter für einen Verstorbenen erbringt, gilt nach Radd al-Muḥtār: Sie darf auch einem einzigen Bedürftigen auf einmal …“
17. `islam.aufbau.e02.l06.a05` – „Das Fasten ist nur beim gelobten Iʿtikāf Bedingung.“
18. `islam.aufbau.e02.l06.a06` – „Nach einer Überlieferung von al-Ḥasan von Abū Ḥanīfa ist das Fasten auch beim freiwilligen Iʿtikāf Bedingung; er dauert dann mindestens einen Tag (al-Hidāya …“
19. `islam.aufbau.e02.l06.a08` – „Ibn ʿĀbidīn folgert in Radd al-Muḥtār, dass das Fasten auch für den Sunna-Iʿtikāf der letzten zehn Ramadan-Tage Bedingung ist: Wer dort ohne Fasten verweilt …“
20. `islam.aufbau.e02.l06.a10` – „Verlässt er die Moschee ohne Entschuldigung auch nur kurze Zeit (sāʿa), wird ein notwendiger, also gelobter Iʿtikāf ungültig; ein anderer Iʿtikāf endet damit …“
21. `islam.aufbau.e02.l06.a11` – „Nach Abū Yūsuf und Muḥammad wird der Iʿtikāf erst ungültig, wenn man länger als einen halben Tag draußen bleibt, weil für eine kurze Abwesenheit eine …“

#### `islam.aufbau.e03` – Zakat I: Pflicht, Bedingungen und Vermögensarten (32)

1. `islam.aufbau.e03.l01.a13` – „Ob die Zakat sofort nach ihrer Fälligkeit zu entrichten ist, beantworten die Werke unterschiedlich.“
2. `islam.aufbau.e03.l01.a14` – „Radd al-Muḥtār hält mit Fatḥ al-Qadīr fest: Die Zakat ist eine feste Pflicht, und sie sofort zu entrichten ist notwendig (wājib); wer sie ohne Not aufschiebt …“
3. `islam.aufbau.e03.l02.a11` – „Was über vierzig Rinder hinausgeht, ist nach Abū Ḥanīfa bis sechzig anteilig zakatpflichtig: für jedes weitere Rind ein Vierzigstel einer musinna (al-Qudūrī).“
4. `islam.aufbau.e03.l02.a12` – „Nach Abū Yūsuf und Muḥammad ist auf Rinder zwischen vierzig und sechzig nichts weiter fällig, bis sechzig erreicht sind; nach al-Hidāya ist das auch eine …“
5. `islam.aufbau.e03.l02.a14` – „Nach Abū Ḥanīfa ist auf Pferde, die frei weiden und als Hengste und Stuten gemischt gehalten werden, Zakat fällig.“
6. `islam.aufbau.e03.l02.a15` – „Nach Abū Yūsuf und Muḥammad ist auf Pferde keine Zakat fällig (al-Qudūrī).“
7. `islam.aufbau.e03.l02.a17` – „Auf Jungtiere allein – Kamelfohlen, Lämmer und Kälber – ist nach Abū Ḥanīfa und Muḥammad keine Zakat fällig, außer es sind ausgewachsene Tiere dabei …“
8. `islam.aufbau.e03.l03.a05` – „Was über den Niṣāb hinausgeht, ist nach Abū Ḥanīfa erst ab vierzig Dirham bzw. vier Mithqāl zakatpflichtig: dann ein Dirham je vierzig Dirham und zwei Qīrāṭ …“
9. `islam.aufbau.e03.l03.a06` – „Nach Abū Yūsuf und Muḥammad ist auch auf jeden kleineren Überschuss anteilig Zakat fällig, also ein Vierzigstel von allem, was über zweihundert Dirham oder …“
10. `islam.aufbau.e03.l03.a10` – „Um den Niṣāb zu vervollständigen, wird Gold mit Silber zusammengerechnet.“
11. `islam.aufbau.e03.l03.a11` – „Nach Abū Yūsuf und Muḥammad wird Gold mit Silber nach den Anteilen (ajzāʾ) zusammengerechnet, also nach der Menge, nicht nach dem Wert.“
12. `islam.aufbau.e03.l04.a03` – „Entsteht eine Schuld erst im Laufe des Jahres, hindert sie die Zakat nach Muḥammad, anders als nach Abū Yūsuf (al-Ikhtiyār).“
13. `islam.aufbau.e03.l04.a04` – „Nach Abū Yūsuf hindert eine solche Schuld die Zakat nicht; sie wirkt nur wie eine Minderung des Vermögens.“
14. `islam.aufbau.e03.l04.a07` – „Eine mittlere Forderung ist der Preis für etwas, das nicht dem Handel dient, etwa für Kleidung zum Gebrauch oder für ein Wohnhaus.“
15. `islam.aufbau.e03.l04.a09` – „Auf verlorenes oder unerreichbares Vermögen (māl ḍimār) ist nach al-Ikhtiyār keine Zakat zu entrichten: etwa auf Verlorenes, ins Meer Gefallenes, in der Wüste …“
16. `islam.aufbau.e03.l04.a14` – „Handelsware wird nach al-Qudūrī mit dem Zahlungsmittel bewertet – Gold oder Silber –, das für die Armen günstiger ist.“
17. `islam.aufbau.e03.l04.a15` – „Nach einer Überlieferung von Abū Yūsuf wird die Ware mit dem Zahlungsmittel bewertet, mit dem sie gekauft wurde, wenn sie mit Geld gekauft wurde, sonst mit …“
18. `islam.aufbau.e03.l05.a04` – „Nach Abū Ḥanīfa ist der ʿUshr auf wenig wie auf viel fällig, ob die Frucht lange haltbar ist oder nicht, also auch auf Gemüse (al-Qudūrī, al-Ikhtiyār, Radd …“
19. `islam.aufbau.e03.l05.a05` – „Nach Abū Yūsuf und Muḥammad ist der ʿUshr nur auf Erträge mit haltbarer Frucht fällig, wenn sie fünf Wasq erreichen; ein Wasq sind sechzig Ṣāʿ.“
20. `islam.aufbau.e03.l05.a09` – „Auf Honig, der auf ʿUshr-Land gewonnen wird, ist der ʿUshr fällig, nach Abū Ḥanīfa auf wenig wie auf viel (al-Qudūrī, al-Hidāya).“
21. `islam.aufbau.e03.l05.a15` – „Findet jemand einen Bodenschatz in seinem eigenen Haus, ist darauf nach Abū Ḥanīfa nichts fällig, weil er zum Haus gehört; nach Abū Yūsuf und Muḥammad ist das …“
22. `islam.aufbau.e03.l05.a16` – „Ein vergrabener Schatz mit Kennzeichen der Muslime, etwa dem Glaubensbekenntnis, gilt nach al-Ikhtiyār und al-Hidāya als Fundsache (luqaṭa).“
23. `islam.aufbau.e03.l05.a17` – „Auf Perlen und Ambra ist nach Abū Ḥanīfa und Muḥammad kein Fünftel fällig (al-Hidāya).“
24. `islam.aufbau.e03.l06.a03` – „Gibt man die Zakat jemandem, den man für berechtigt hält, und stellt sich danach das Gegenteil heraus, so ist sie nach Nūr al-Īḍāḥ gültig – außer der …“
25. `islam.aufbau.e03.l06.a04` – „Wer einen Niṣāb besitzt, darf die Zakat nach al-Qudūrī schon vor Ablauf des Jahres entrichten; nach Nūr al-Īḍāḥ auch für mehrere Jahre oder für mehrere Niṣāb …“
26. `islam.aufbau.e03.l06.a05` – „Für den Wert des geschuldeten Betrags zählt nach Nūr al-Īḍāḥ der Tag, an dem die Pflicht entsteht, also das Ende des Jahres; der Wert davor spielt keine Rolle.“
27. `islam.aufbau.e03.l06.a09` – „Verbraucht der Eigentümer das Vermögen selbst, nachdem die Zakat fällig geworden ist, entfällt sie nach al-Ikhtiyār nicht; er hat sich vergangen und haftet.“
28. `islam.aufbau.e03.l06.a12` – „Entrichtet man die Zakat aus Gold oder Silber selbst, zählt nach Nūr al-Īḍāḥ ihr Gewicht zur Zeit der Entrichtung, so wie auch zur Zeit der Pflicht das …“
29. `islam.aufbau.e03.l06.a13` – „Wer sein ganzes Vermögen spendet, ohne die Zakat zu beabsichtigen, für den entfällt die Pflicht (al-Qudūrī); nach al-Hidāya aus istiḥsān, weil die Pflicht ein …“
30. `islam.aufbau.e03.l06.a14` – „Wer vor Ablauf des Jahres sein Vermögen umtauscht oder es aus seinem Eigentum gibt und später zurücknimmt, um der Zakat zu entgehen, handelt nach Abū Yūsuf …“
31. `islam.aufbau.e03.l06.a15` – „Nach Abū Ḥanīfa und Abū Yūsuf hängt die Zakat am Niṣāb, nicht am Überschuss bis zum nächsten Niṣāb (ʿafw).“
32. `islam.aufbau.e03.l06.a16` – „Nach Muḥammad und Zufar hängt die Zakat am Niṣāb und am Überschuss zusammen.“

#### `islam.aufbau.e04` – Zakat II: Empfänger und Ṣadaqat al-Fiṭr (23)

1. `islam.aufbau.e04.l01.a05` – „Wer von beiden schlechter gestellt ist, wird in der Schule verschieden überliefert.“
2. `islam.aufbau.e04.l01.a06` – „Ob Arme und Bedürftige zwei Gruppen sind oder eine, ist ebenfalls umstritten: Nach Abū Ḥanīfa sind es zwei, nach Abū Yūsuf eine (Radd al-Muḥtār).“
3. `islam.aufbau.e04.l01.a12` – „Wer genau mit „[…]“ gemeint ist, ist in der Schule umstritten: Nach Abū Yūsuf sind es die mittellosen Kämpfer, weil man den Ausdruck so versteht.“ ¹
4. `islam.aufbau.e04.l02.a02` – „Andere Almosen (ṣadaqāt) wie Gelübde, Sühneleistungen und die Ṣadaqat al-Fiṭr darf man ihm nach al-Hidāya und al-Ikhtiyār geben; nur die Zakat ist durch einen …“
5. `islam.aufbau.e04.l02.a03` – „Radd al-Muḥtār berichtet dazu, dass nach al-Ḥāwī die Fatwa nach Abū Yūsuf gegeben wird.“
6. `islam.aufbau.e04.l02.a10` – „Ob eine Ehefrau ihre Zakat ihrem Ehemann geben darf, ist in der Schule umstritten.“
7. `islam.aufbau.e04.l02.a11` – „Abū Yūsuf und Muḥammad erlauben es (al-Qudūrī).“
8. `islam.aufbau.e04.l02.a14` – „Al-Ikhtiyār führt an, was einige Gelehrte der Schule erwähnen: Nach Abū Ḥanīfa darf ein Hāschimit seine Zakat einem Hāschimiten geben, anders als nach Abū …“
9. `islam.aufbau.e04.l02.a16` – „Gibt jemand seine Zakat einem Mann, den er für arm hält, und stellt sich danach heraus, dass dieser reich ist, ein Hāschimit oder ein Nichtmuslim, oder gibt …“
10. `islam.aufbau.e04.l02.a17` – „Nach Abū Yūsuf muss er sie dagegen noch einmal entrichten, weil sein Irrtum sicher feststeht und man diese Dinge hätte feststellen können (al-Qudūrī …“
11. `islam.aufbau.e04.l02.a20` – „Einer einzigen Person einen ganzen Niṣāb oder mehr zu geben – al-Hidāya nennt 200 Dirham –, ist verpönt, aber gültig (al-Hidāya, al-Ikhtiyār).“
12. `islam.aufbau.e04.l03.a11` – „Haben kleine Kinder eigenes Vermögen, wird ihre Ṣadaqat al-Fiṭr nach Abū Ḥanīfa und Abū Yūsuf aus ihrem Vermögen entrichtet (al-Hidāya); ihr Vormund gibt sie …“
13. `islam.aufbau.e04.l03.a12` – „Nach Muḥammad – und nach Radd al-Muḥtār auch nach Zufar – ist sie im Vermögen des Kindes nicht Pflicht, wie die Zakat.“
14. `islam.aufbau.e04.l04.a05` – „Radd al-Muḥtār erklärt: Nach der richtigen Ansicht ist die Ṣadaqat al-Fiṭr an keine enge Frist gebunden; wann immer man sie gibt, entrichtet man sie …“
15. `islam.aufbau.e04.l04.a06` – „Wie früh man sie geben darf, wird verschieden beantwortet.“
16. `islam.aufbau.e04.l04.a07` – „Radd al-Muḥtār berichtet: Nach al-Baḥr spricht für die Beschränkung auf den Ramadan, dass danach Fatwa gegeben wird; an-Nahr hält es dagegen für besser …“
17. `islam.aufbau.e04.l04.a10` – „Bei den Rosinen gibt es in der Schule zwei Überlieferungen.“
18. `islam.aufbau.e04.l04.a11` – „Nach Abū Yūsuf und Muḥammad sind Rosinen wie Gerste und Datteln, also ein ganzer Ṣāʿ; das wird auch von Abū Ḥanīfa überliefert (al-Hidāya).“
19. `islam.aufbau.e04.l04.a12` – „Der Ṣāʿ beträgt nach Abū Ḥanīfa und Muḥammad acht irakische Raṭl, nach Abū Yūsuf fünf und ein Drittel Raṭl (al-Qudūrī, al-Hidāya, al-Ikhtiyār).“
20. `islam.aufbau.e04.l04.a13` – „Radd al-Muḥtār berichtet nach az-Zaylaʿī und Fatḥ al-Qadīr, manche hätten gesagt, es gebe keinen wirklichen Unterschied: Abū Yūsuf habe mit dem größeren Raṭl …“
21. `islam.aufbau.e04.l04.a16` – „Ob der Wert oder der Weizen besser ist, beantworten die Fatwas verschieden.“
22. `islam.aufbau.e04.l04.a17` – „Nach Abū Ḥanīfa und Abū Yūsuf darf man den Wert jeder der genannten Arten geben, also nach Wahl den Wert von Weizen, Gerste oder Datteln; nach Muḥammad gibt …“
23. `islam.aufbau.e04.l04.a19` – „Ob man die Ṣadaqat al-Fiṭr einer Person auf mehrere Arme verteilen darf, ist umstritten.“

#### `islam.aufbau.e05` – Hadsch I: Pflicht, Bedingungen, Zeiten und Iḥrām (17)

1. `islam.aufbau.e05.l01.a02` – „Wann der Hadsch zur Pflicht wurde, wird verschieden angegeben.“
2. `islam.aufbau.e05.l01.a08` – „Dass der Hadsch sofort zu vollziehen ist, ist nach al-Hidāya die Ansicht Abū Yūsufs; von Abū Ḥanīfa wird Entsprechendes überliefert.“
3. `islam.aufbau.e05.l01.a10` – „Nach Muḥammad darf der Hadsch aufgeschoben werden (ʿalā t-tarākhī), weil er eine Pflicht des ganzen Lebens ist: Das Leben ist für ihn wie die Zeitspanne für …“
4. `islam.aufbau.e05.l02.a07` – „Nach einer Überlieferung von Abū Yūsuf muss zusätzlich der Unterhalt für einen Monat nach der Rückkehr gesichert sein (al-Ikhtiyār).“
5. `islam.aufbau.e05.l02.a10` – „Ob der sichere Weg und die Begleitung durch Ehemann oder Maḥram Bedingungen der Pflicht selbst oder nur ihrer Ausführung sind, ist in der Schule umstritten …“
6. `islam.aufbau.e05.l02.a13` – „Die Kosten des Maḥram trägt nach al-Hidāya und al-Ikhtiyār die Frau: nach al-Hidāya, weil sie durch ihn den Hadsch ausführen kann, nach al-Ikhtiyār, weil er …“
7. `islam.aufbau.e05.l02.a15` – „Ein Blinder, der jemanden findet, der ihm die Mühen der Reise abnimmt, und Proviant und Reittier hat, muss nach Abū Ḥanīfa den Hadsch nicht vollziehen; Abū …“
8. `islam.aufbau.e05.l03.a10` – „Den Ṭawāf az-Ziyāra über die Opfertage hinaus aufzuschieben, ist nach al-Qudūrī und al-Hidāya verpönt (makrūh); al-Hidāya begründet das damit, dass seine Zeit …“
9. `islam.aufbau.e05.l04.a06` – „Sich vor dem Iḥrām zu parfümieren ist erlaubt (al-Qudūrī); nach der bekannten Lehre auch mit einem Duft, dessen Spur nach dem Iḥrām bleibt, weil nur das …“
10. `islam.aufbau.e05.l04.a22` – „Hat er den Iḥrām schon nach dem Überschreiten angelegt und kehrt dann zum Mīqāt zurück, entfällt das Opfer nach Abū Ḥanīfa nur, wenn er dort die Talbiya …“
11. `islam.aufbau.e05.l04.a23` – „Nach Abū Yūsuf und Muḥammad entfällt das Opfer in diesem Fall schon durch die bloße Rückkehr zum Mīqāt, weil die Talbiya dort keine Bedingung ist (al-Ikhtiyār).“
12. `islam.aufbau.e05.l04.a24` – „Nach Zufar entfällt das Opfer nicht, auch wenn er am Mīqāt die Talbiya spricht, weil der Verstoß bereits feststeht (al-Ikhtiyār).“
13. `islam.aufbau.e05.l05.a16` – „Nach einer Überlieferung von Abū Ḥanīfa ist Ifrād besser als Tamattuʿ, weil die Reise des Mufrid dem Hadsch gilt, die des Mutamattiʿ der ʿUmra (al-Hidāya …“
14. `islam.aufbau.e05.l05.a22` – „Führt er ein Opferkamel (badana) mit, hängt er ihm nach al-Qudūrī ein Stück von einem ledernen Wasserschlauch (mazāda) oder eine Sandale um (taqlīd).“
15. `islam.aufbau.e05.l05.a23` – „Nach Abū Yūsuf und Muḥammad wird beim Opferkamel der Höcker auf der rechten Seite eingeritzt (ishʿār) (al-Qudūrī); sie halten das für gut (al-Hidāya …“
16. `islam.aufbau.e05.l05.a26` – „Hat er ein Opfertier mitgeführt, bleibt sein Tamattuʿ nach Abū Ḥanīfa und Abū Yūsuf bestehen: Weil er noch im Iḥrām ist, war seine Rückkehr nicht gültig, und …“
17. `islam.aufbau.e05.l05.a27` – „Nach Muḥammad ist sein Tamattuʿ auch dann hinfällig, weil er Hadsch und ʿUmra tatsächlich in zwei Reisen vollzogen hat (al-Ikhtiyār).“

#### `islam.aufbau.e06` – Hadsch II: Ablauf, ʿUmra, Verstöße und Opfertier (48)

1. `islam.aufbau.e06.l01.a18` – „Nach Zufar hält der Imam die drei Predigten an drei aufeinanderfolgenden Tagen, beginnend mit dem Tag der Tarwiya, weil an diesen Tagen die Pilger versammelt …“
2. `islam.aufbau.e06.l02.a03` – „Wer das Mittagsgebet allein in seinem Lager betet, betet das Nachmittagsgebet nach Abū Ḥanīfa zu dessen eigener Zeit (al-Qudūrī, al-Hidāya).“
3. `islam.aufbau.e06.l02.a04` – „Nach Abū Yūsuf und Muḥammad legt auch, wer allein betet, die beiden Gebete zusammen (al-Qudūrī).“
4. `islam.aufbau.e06.l02.a09` – „Wer das Abendgebet schon unterwegs betet, bevor er Muzdalifa erreicht, dem genügt es nach Abū Ḥanīfa und Muḥammad nicht (al-Qudūrī); er muss es wiederholen …“
5. `islam.aufbau.e06.l02.a10` – „Nach Abū Yūsuf genügt das unterwegs gebetete Abendgebet; der Betende hat aber schlecht gehandelt, weil das Aufschieben Sunna ist (al-Hidāya).“
6. `islam.aufbau.e06.l02.a19` – „Den Ṭawāf az-Ziyāra über die drei Opfertage hinaus aufzuschieben ist nach Nūr al-Īḍāḥ stark verpönt (makrūh taḥrīman).“
7. `islam.aufbau.e06.l02.a23` – „Wirft er am vierten Tag schon vor dem Sonnenhöchststand, aber nach der Morgendämmerung, ist das nach Abū Ḥanīfa gültig (al-Qudūrī); al-Hidāya nennt das eine …“
8. `islam.aufbau.e06.l03.a02` – „Die ʿUmra ist nach Nūr al-Īḍāḥ nach der richtigeren Ansicht eine bekräftigte Sunna (sunna muʾakkada); al-Qudūrī, al-Hidāya und al-Ikhtiyār nennen sie Sunna.“
9. `islam.aufbau.e06.l03.a06` – „Nach einer Überlieferung von Abū Yūsuf ist die ʿUmra am Tag von ʿArafa vor dem Sonnenhöchststand nicht verpönt, weil die Zeit des Grundpfeilers des Hadsch …“
10. `islam.aufbau.e06.l04.a07` – „Olivenöl und Sesamöl gelten nach Abū Ḥanīfa als Duft, und wer sich damit einölt, schuldet ein Opfer; denn sie sind der Grundstoff des Duftes und nehmen die …“
11. `islam.aufbau.e06.l04.a09` – „Nach Abū Yūsuf zählt schon der größere Teil eines Tages wie ein ganzer Tag (al-Ikhtiyār).“
12. `islam.aufbau.e06.l04.a11` – „Schert er die Stelle, an der geschröpft wird, schuldet er nach Abū Ḥanīfa ein Opfer; nach Abū Yūsuf und Muḥammad eine Spende (al-Qudūrī).“
13. `islam.aufbau.e06.l04.a12` – „Schneidet er die Nägel beider Hände und Füße, schuldet er ein Opfer, ebenso für eine ganze Hand oder einen ganzen Fuß.“
14. `islam.aufbau.e06.l04.a13` – „Nach Muḥammad schuldet er auch für fünf verteilt geschnittene Nägel ein Opfer, wie wenn sie von einer Hand wären (al-Qudūrī, al-Ikhtiyār).“
15. `islam.aufbau.e06.l04.a24` – „Lässt er das Steinigen an allen Tagen aus, schuldet er ein Opfer; ebenso für einen ganzen Tag und für die Jamrat al-ʿAqaba am Opfertag.“
16. `islam.aufbau.e06.l04.a25` – „Schiebt er das Scheren über die Opfertage hinaus auf, schuldet er nach Abū Ḥanīfa ein Opfer (al-Qudūrī, al-Hidāya).“
17. `islam.aufbau.e06.l04.a27` – „Die Ersatzleistung ist nach Abū Ḥanīfa und Abū Yūsuf der Wert des Wildes, den zwei gerechte Personen am Ort der Tötung schätzen, oder, wenn es in der Wildnis …“
18. `islam.aufbau.e06.l04.a28` – „Nach Muḥammad ist bei Wild, das ein Gegenstück unter den Nutztieren hat, dieses Gegenstück (naẓīr) zu leisten: für eine Gazelle oder eine Hyäne ein Schaf, für …“
19. `islam.aufbau.e06.l05.a03` – „Nach ash-Shāfiʿī gibt es die Verhinderung nur durch einen Feind; nach den Hanefiten auch durch Krankheit.“
20. `islam.aufbau.e06.l05.a05` – „Nach Abū Ḥanīfa darf das Opfer der Verhinderung auch vor dem Opfertag geschlachtet werden (al-Qudūrī).“
21. `islam.aufbau.e06.l05.a06` – „Nach Abū Yūsuf und Muḥammad darf, wer am Hadsch gehindert ist, das Opfer nur am Opfertag schlachten (al-Qudūrī), wie das Opfer für Tamattuʿ und Qirān …“
22. `islam.aufbau.e06.l05.a07` – „Ob der Verhinderte sich scheren muss, ist umstritten: Nach Abū Ḥanīfa und Muḥammad muss er es nicht, weil das Scheren erst im Anschluss an die Handlungen des …“
23. `islam.aufbau.e06.l05.a11` – „Nach dem Analogieschluss (qiyās), der Ansicht Zufars, müsste er im letzten Fall weiterziehen, weil er das Ursprüngliche, den Hadsch, noch erreichen kann …“
24. `islam.aufbau.e06.l05.a20` – „Nach einer Überlieferung von Muḥammad zählt der Hadsch für den, der ihn vollzieht; der Auftraggeber erhält den Lohn für die Ausgaben.“
25. `islam.aufbau.e06.l05.a22` – „Radd al-Muḥtār gibt wieder: Nach al-Fatḥ ist es für einen ṣarūra stark verpönt (makrūh taḥrīman), für einen anderen zu pilgern, wenn er selbst bereits zum …“
26. `islam.aufbau.e06.l05.a24` – „Das Opfer der Verhinderung trägt nach Abū Ḥanīfa und Muḥammad der Auftraggeber, weil er den Beauftragten in diese Lage gebracht hat; pilgert jemand für einen …“
27. `islam.aufbau.e06.l05.a25` – „Nach Abū Yūsuf trägt der Beauftragte das Opfer der Verhinderung, weil es geschuldet ist, damit er den Iḥrām verlassen kann und von dem Schaden des …“
28. `islam.aufbau.e06.l05.a29` – „Stirbt jemand auf dem Weg zum Hadsch und verfügt, dass für ihn gepilgert wird, pilgert man nach Abū Ḥanīfa trotzdem von seinem Wohnort aus; ebenso, wenn der …“
29. `islam.aufbau.e06.l06.a07` – „Zum freiwilligen Opfertier merkt al-Hidāya an: Nach al-Aṣl darf man es schon vor dem Opfertag schlachten, am Opfertag ist es besser; das sei richtig.“
30. `islam.aufbau.e06.l06.a08` – „Ort: Der Ort, an dem das Opfertier geschlachtet wird, ist allgemein der Ḥaram.“
31. `islam.aufbau.e06.l07.a01` – „Nūr al-Īḍāḥ und al-Ikhtiyār zählen den Besuch des Propheten – den Besuch seines Grabes in Medina – zu den besten Handlungen, mit denen man Gott nahekommt, und …“
32. `islam.aufbau.e06.l07.a02` – „Radd al-Muḥtār erklärt nach al-Lubāb: Der Besuch ist nach dem Konsens der Muslime empfohlen (mandūb).“
33. `islam.aufbau.e06.l07.a03` – „Radd al-Muḥtār erwähnt, dass Ibn Taymiyya ein Verbot des Besuchs zugeschrieben wird.“
34. `islam.aufbau.e06.l07.a04` – „Den Hadith über das Reisen zu den drei Moscheen (bukhari:1189) versteht Radd al-Muḥtār nach al-Iḥyāʾ so: Er betrifft das Reisen zu einer Moschee wegen des …“
35. `islam.aufbau.e06.l07.a05` – „Ob der Besuch des Prophetengrabes auch Frauen empfohlen ist, beantwortet Radd al-Muḥtār nach Sharḥ al-Lubāb: Nach der richtigen Ansicht ja, ohne Verpöntheit …“
36. `islam.aufbau.e06.l07.a06` – „Zur Reihenfolge überliefert al-Ḥasan von Abū Ḥanīfa nach Radd al-Muḥtār: Ist der Hadsch eine Pflicht, beginnt der Pilger besser mit dem Hadsch und besucht …“
37. `islam.aufbau.e06.l07.a07` – „Radd al-Muḥtār gibt Ibn al-Humām wieder: Besser sei es, die Absicht allein auf den Besuch des Grabes zu richten; den Besuch der Moschee erlange man dabei …“
38. `islam.aufbau.e06.l07.a08` – „Wer den Besuch beabsichtigt, soll häufig um Segen für den Propheten bitten (ṣalāt); sieht er die Mauern Medinas, bittet er erneut um Segen und spricht ein …“
39. `islam.aufbau.e06.l07.a09` – „Dann betritt er die edle Moschee und betet beim Minbar zwei Gebetseinheiten zur Begrüßung der Moschee; er steht dabei so, dass die Säule des Minbar auf der …“
40. `islam.aufbau.e06.l07.a10` – „Am Grab steht er nach Nūr al-Īḍāḥ etwa vier Ellen von der edlen Kammer entfernt, mit größtem Anstand, den Rücken zur Gebetsrichtung, dem Haupt und dem Antlitz …“
41. `islam.aufbau.e06.l07.a11` – „Dann grüßt er den Propheten; die Werke überliefern dafür ausführliche Gruß- und Bittformeln, die hier nicht wiedergegeben werden.“
42. `islam.aufbau.e06.l07.a12` – „Nach dem Gruß an den Propheten tritt er etwa eine Elle zur Seite, bis er dem Haupt von Abū Bakr aṣ-Ṣiddīq gegenübersteht, und grüßt ihn; dann tritt er ebenso …“
43. `islam.aufbau.e06.l07.a13` – „Danach kehrt er zurück und steht wieder am Haupt des Propheten wie zuvor.“
44. `islam.aufbau.e06.l07.a14` – „Nach Nūr al-Īḍāḥ geht er dann zum Minbar und legt seine Hand an die Stelle des früheren Knaufs, wo der Prophet beim Predigen seine Hand hatte, um Segen zu …“
45. `islam.aufbau.e06.l07.a15` – „Während seines Aufenthalts in Medina bemüht er sich, die Nächte mit Gottesdienst zu beleben, und nutzt die Gelegenheit, die Stätte des Propheten zu jeder Zeit …“
46. `islam.aufbau.e06.l07.a16` – „Empfohlen ist nach Nūr al-Īḍāḥ, zum Friedhof al-Baqīʿ hinauszugehen und die Gedenkstätten und Gräber zu besuchen, besonders das Grab von Ḥamza, dem Herrn der …“
47. `islam.aufbau.e06.l07.a17` – „Dort grüßt er die Verstorbenen mit dem Gruß aus 13:24.“
48. `islam.aufbau.e06.l07.a18` – „Empfohlen ist auch, am Samstag oder an einem anderen Tag die Moschee von Qubāʾ aufzusuchen, dort zu beten und Gott anzurufen (Nūr al-Īḍāḥ).“

#### `islam.aufbau.e07` – Erlaubtes und Verbotenes I: Speisen, Getränke, Schlachtung und Opfer (21)

1. `islam.aufbau.e07.l01.a13` – „Nach Abū Ḥanīfa ist das Tier auch erlaubt, wenn der größere Teil dieser Gefäße durchtrennt ist (al-Qudūrī); nach al-Hidāya heißt das: irgendwelche drei der …“
2. `islam.aufbau.e07.l01.a14` – „Nach al-Qudūrī sagen Abū Yūsuf und Muḥammad: Luftröhre, Speiseröhre und eine der beiden Halsadern müssen durchtrennt sein.“
3. `islam.aufbau.e07.l02.a07` – „Nach Abū Ḥanīfa ist Pferdefleisch verpönt (al-Qudūrī, al-Hidāya); al-Ikhtiyār zählt das Pferd in seinem Grundtext zu den nicht erlaubten Tieren.“
4. `islam.aufbau.e07.l02.a08` – „Nach Abū Yūsuf und Muḥammad ist Pferdefleisch unbedenklich (al-Hidāya).“
5. `islam.aufbau.e07.l02.a09` – „Zu dem Vermerk im erläuterten Grundtext, darauf werde Fatwa gegeben (ʿalayhi al-fatwā), erklärt Radd al-Muḥtār nach al-Quhistānī: Pferdefleisch ist danach …“
6. `islam.aufbau.e07.l02.a13` – „Grundregel ist nach al-Hidāya: Stirbt ein Fisch durch eine äußere Ursache, ist er erlaubt wie ein gefangener; stirbt er ohne Ursache, ist er nicht erlaubt.“
7. `islam.aufbau.e07.l02.a15` – „Findet man im Leib eines geschlachteten Kamels, Rindes oder Schafs ein totes Junges, wird es nach al-Qudūrī nicht gegessen, gleich ob ihm schon Haare …“
8. `islam.aufbau.e07.l02.a16` – „Nach Abū Yūsuf und Muḥammad wird das tote Junge gegessen, wenn es vollständig ausgebildet ist; sie sehen es als Teil der Mutter an (al-Hidāya, al-Ikhtiyār).“
9. `islam.aufbau.e07.l03.a05` – „Die Zahl drei ist nach al-Hidāya die Ansicht von Abū Yūsuf und Muḥammad und eine Überlieferung von Abū Ḥanīfa.“
10. `islam.aufbau.e07.l04.a02` – „Nach Abū Ḥanīfa ist roher Traubensaft erst dann Wein im strengen Sinn, wenn er Schaum geworfen hat; nach Abū Yūsuf und Muḥammad genügt, dass er stark geworden …“
11. `islam.aufbau.e07.l04.a09` – „Nach Abū Ḥanīfa und Abū Yūsuf ist ein Aufguss aus Datteln oder Rosinen, der kurz gekocht wurde, erlaubt, auch wenn er stark geworden ist, solange man nur so …“
12. `islam.aufbau.e07.l04.a10` – „Nach Muḥammad sind auch diese Getränke verboten, in kleiner wie in großer Menge, wie der Wein; al-Hidāya nennt dafür Überlieferungen vom Propheten und den …“
13. `islam.aufbau.e07.l04.a11` – „Nach dem Grundtext, den Radd al-Muḥtār erläutert, wird Fatwa nach der Ansicht Muḥammads gegeben; Radd al-Muḥtār fügt hinzu, dass dies auch die Ansicht der …“
14. `islam.aufbau.e07.l04.a13` – „Nach dem Grundtext, den Radd al-Muḥtār erläutert, ist es verboten, das Kraut banj zu essen; Radd al-Muḥtār beschreibt es als Pflanze, die Kopfschmerz und …“
15. `islam.aufbau.e07.l05.a02` – „Das Opfer ist nach al-Qudūrī Pflicht (wājib) für jeden freien, ansässigen und wohlhabenden Muslim am Opferfest.“
16. `islam.aufbau.e07.l05.a03` – „Nach einer anderen Überlieferung von Abū Yūsuf ist das Opfer Sunna.“
17. `islam.aufbau.e07.l05.a07` – „Ob man auch für seine kleinen Kinder opfern muss, ist umstritten.“
18. `islam.aufbau.e07.l05.a21` – „Wo die Grenze zwischen wenig und viel liegt, ist innerhalb der Schule umstritten: Von Abū Ḥanīfa gibt es mehrere Überlieferungen (mehr als ein Drittel, ein …“
19. `islam.aufbau.e07.l06.a10` – „Schlachten zwei Männer aus Versehen jeweils das Opfertier des anderen, ist es nach al-Qudūrī für beide gültig, und keiner muss dem anderen etwas ersetzen.“
20. `islam.aufbau.e07.l06.a11` – „Schlachtet jemand ohne Auftrag das Opfertier eines anderen, ist das Opfer nach al-Hidāya und al-Ikhtiyār aus Billigkeit (istiḥsān) gültig, und er muss nichts …“
21. `islam.aufbau.e07.l06.a13` – „Stirbt einer von sieben Teilhabern vor der Schlachtung und erlauben seine Erben, für ihn mitzuschlachten, ist das Opfer nach al-Hidāya für alle gültig, denn …“

#### `islam.aufbau.e08` – Erlaubtes und Verbotenes II: Kauf, Zins und Miete (42)

1. `islam.aufbau.e08.l01.a05` – „Der Kauf kommt nach al-Hidāya auch durch bloßes Geben und Nehmen ohne Worte (taʿāṭī) zustande, bei wertvollen wie bei geringwertigen Dingen, weil das …“
2. `islam.aufbau.e08.l01.a10` – „Liegen Angebot und Annahme vor, ist der Kauf nach al-Qudūrī bindend; keine Seite hat dann noch ein Wahlrecht, außer wegen eines Mangels oder weil sie die Ware …“
3. `islam.aufbau.e08.l01.a15` – „Verkauft jemand einen Haufen Getreide zu „je Scheffel (qafīz) ein Dirham“, ohne die Gesamtmenge zu nennen, gilt der Kauf nach Abū Ḥanīfa nur für einen …“
4. `islam.aufbau.e08.l01.a16` – „Nach Abū Yūsuf und Muḥammad gilt der Kauf in diesem Fall für den ganzen Haufen, weil die Beteiligten die Unklarheit selbst beheben können und sie nicht zum …“
5. `islam.aufbau.e08.l02.a02` – „Grundstücke darf man nach Abū Ḥanīfa und Abū Yūsuf schon vor der Inbesitznahme weiterverkaufen (al-Qudūrī).“
6. `islam.aufbau.e08.l02.a03` – „Nach Muḥammad ist auch der Weiterverkauf eines Grundstücks vor der Inbesitznahme nicht erlaubt (al-Qudūrī).“
7. `islam.aufbau.e08.l02.a07` – „Nach Abū Ḥanīfa ist die Aufhebung für die beiden Vertragspartner eine Auflösung des Vertrags, für Dritte aber ein neuer Kauf (al-Qudūrī).“
8. `islam.aufbau.e08.l02.a10` – „Ein Rücktrittsrecht von mehr als drei Tagen ist nach Abū Ḥanīfa nicht erlaubt (al-Qudūrī); das ist nach al-Hidāya auch die Ansicht Zufars.“
9. `islam.aufbau.e08.l02.a11` – „Nach Abū Yūsuf und Muḥammad ist auch eine längere Frist erlaubt, wenn sie bekannt ist (al-Qudūrī, al-Ikhtiyār).“
10. `islam.aufbau.e08.l02.a13` – „Hat nur der Käufer das Rücktrittsrecht, verlässt die Ware nach al-Qudūrī das Eigentum des Verkäufers.“
11. `islam.aufbau.e08.l02.a14` – „Wer das Rücktrittsrecht hat, kann den Kauf nach al-Qudūrī innerhalb der Frist auflösen oder genehmigen.“
12. `islam.aufbau.e08.l02.a17` – „Wer etwas kauft, das er nicht gesehen hat, kauft nach al-Qudūrī gültig; er hat das Recht der Besichtigung (khiyār ar-ruʾya): Sieht er die Ware, kann er sie …“
13. `islam.aufbau.e08.l02.a19` – „Für das Sehen genügt nach al-Qudūrī das Wesentliche: die Oberfläche eines Getreidehaufens, die Außenseite eines gefalteten Stoffes oder beim Reittier Gesicht …“
14. `islam.aufbau.e08.l02.a26` – „Hat der Käufer gekaufte Lebensmittel aufgegessen und erfährt erst danach von einem Mangel, kann er nach Abū Ḥanīfa vom Verkäufer nichts mehr verlangen …“
15. `islam.aufbau.e08.l02.a27` – „Nach Abū Yūsuf und Muḥammad verlangt der Käufer in diesem Fall den Minderwert vom Verkäufer zurück (al-Qudūrī).“
16. `islam.aufbau.e08.l02.a28` – „Hat der Verkäufer ausbedungen, für keinen Mangel einzustehen (barāʾa), kann der Käufer nach al-Qudūrī und al-Ikhtiyār wegen keines Mangels zurückgeben, auch …“
17. `islam.aufbau.e08.l03.a03` – „Ein unwirksamer Kauf (fāsid) bewirkt dagegen Eigentum, wenn der Käufer die Ware mit Erlaubnis des Verkäufers in Besitz nimmt und beide Gegenleistungen …“
18. `islam.aufbau.e08.l03.a11` – „Unwirksam ist nach al-Qudūrī auch ein Kauf mit einer Zahlungsfrist bis zur Ernte, zum Dreschen, zur Dattellese oder bis zur Rückkehr der Pilger, weil sich …“
19. `islam.aufbau.e08.l03.a12` – „Werden ein geschlachtetes Schaf und ein verendetes Tier zusammen in einem Kauf verkauft, ist der Kauf nach Abū Ḥanīfa in beiden nichtig (al-Qudūrī, al-Hidāya).“
20. `islam.aufbau.e08.l03.a13` – „Nach Abū Yūsuf und Muḥammad ist der Kauf in diesem Fall für das geschlachtete Schaf gültig, wenn für jedes der beiden ein eigener Preis genannt wurde …“
21. `islam.aufbau.e08.l04.a03` – „Ribā ist nach al-Qudūrī verboten bei allem, was nach Maß (makīl) oder nach Gewicht (mawzūn) gehandelt wird, wenn es gegen dieselbe Art mit Überschuss …“
22. `islam.aufbau.e08.l04.a05` – „Was so gering ist, dass man es nicht abmisst, etwa eine Handvoll Getreide oder ein Apfel, darf man nach al-Hidāya und al-Ikhtiyār gegen zwei tauschen, weil …“
23. `islam.aufbau.e08.l04.a07` – „Was der Prophet ausdrücklich als Maßware genannt hat – Weizen, Gerste, Datteln und Salz –, bleibt nach al-Qudūrī immer Maßware, auch wenn die Leute es nicht …“
24. `islam.aufbau.e08.l04.a09` – „Frische Datteln (ruṭab) gegen getrocknete Datteln Gleich gegen Gleich zu tauschen, ist nach al-Qudūrī erlaubt; al-Ikhtiyār nennt das die Ansicht Abū Ḥanīfas.“
25. `islam.aufbau.e08.l04.a10` – „Nach Abū Yūsuf und Muḥammad ist dieser Tausch nicht erlaubt, weil sich frische Datteln im Maß stärker zusammendrücken als getrocknete; sie stützen sich nach …“
26. `islam.aufbau.e08.l04.a11` – „Fleisch gegen ein lebendes Tier zu tauschen ist nach Abū Ḥanīfa und Abū Yūsuf erlaubt (al-Qudūrī).“
27. `islam.aufbau.e08.l04.a12` – „Nach Muḥammad ist der Tausch von Fleisch gegen ein lebendes Tier derselben Art nur erlaubt, wenn das Fleisch mehr ist als das Fleisch im Tier (al-Qudūrī …“
28. `islam.aufbau.e08.l04.a15` – „Brot gegen Weizen oder Mehl darf man nach al-Ikhtiyār beliebig tauschen, weil Brot nach Stück oder Gewicht gehandelt wird, Weizen und Mehl aber nach Maß; das …“
29. `islam.aufbau.e08.l05.a07` – „Kauft jemand mit solchen Münzen aus überwiegend unedlem Metall eine Ware und werden sie danach ungültig, weil die Leute nicht mehr mit ihnen handeln, ist der …“
30. `islam.aufbau.e08.l05.a08` – „Nach Abū Yūsuf schuldet der Käufer im Fall der ungültig gewordenen Münzen ihren Wert am Tag des Kaufs, nach Muḥammad ihren Wert am letzten Tag, an dem die …“
31. `islam.aufbau.e08.l05.a11` – „Nicht erlaubt ist der Vorauskauf nach al-Qudūrī bei lebenden Tieren, bei Tierteilen wie Köpfen und Füßen, bei Häuten nach Stückzahl, Brennholz nach Bündeln …“
32. `islam.aufbau.e08.l05.a12` – „Die Ware muss nach al-Qudūrī vom Vertragsschluss bis zur Fälligkeit ununterbrochen vorhanden sein; ash-Shāfiʿī verlangt das nach al-Hidāya nur zur Fälligkeit.“
33. `islam.aufbau.e08.l05.a14` – „Nach Abū Ḥanīfa müssen außerdem die Menge des Kapitals genannt werden, wenn sich der Vertrag auf seine Menge bezieht wie bei Maß-, Gewichts- und Zählware, und …“
34. `islam.aufbau.e08.l05.a15` – „Nach Abū Yūsuf und Muḥammad muss die Menge des Kapitals nicht genannt werden, wenn man auf das Kapital zeigt, und auch der Ort nicht; geliefert wird dann am …“
35. `islam.aufbau.e08.l05.a17` (auch unsicher, 4.1) – „Nach al-Ikhtiyār ist der Vorauskauf von Brot nicht erlaubt, weil sich Brote in Dicke, Dünne und Backgrad stark unterscheiden; nach „den beiden“ ist er aber …“
36. `islam.aufbau.e08.l05.a19` – „Erlaubt ist der Auftrag nach al-Ikhtiyār nur bei Dingen, bei denen er üblich ist, etwa Gefäße aus Messing, Kupfer oder Glas, Holzwaren, Schuhe, Lederbehälter …“
37. `islam.aufbau.e08.l06.a04` – „Wohnungen und Ackerland darf man nach al-Hidāya für eine kurze oder lange Frist mieten, wenn sie bekannt ist.“
38. `islam.aufbau.e08.l06.a10` – „Beim gemeinsamen Lohnarbeiter ist die Ware anvertrautes Gut: Geht sie bei ihm ohne sein Zutun unter, haftet er nach Abū Ḥanīfa nicht (al-Qudūrī).“
39. `islam.aufbau.e08.l06.a11` – „Nach Abū Yūsuf und Muḥammad haftet der gemeinsame Lohnarbeiter auch, wenn die Ware ohne sein Zutun untergeht, außer bei Unvermeidbarem wie Tod, Brand …“
40. `islam.aufbau.e08.l06.a14` – „Der Lohn wird nach al-Qudūrī nicht schon durch den Vertrag fällig, sondern auf einem von drei Wegen: wenn Vorauszahlung vereinbart ist, wenn ohne Vereinbarung …“
41. `islam.aufbau.e08.l06.a21` – „Für Gebetsruf (adhān), Iqāma und Hadsch darf man nach al-Qudūrī niemanden gegen Lohn anstellen.“
42. `islam.aufbau.e08.l06.a22` – „Spätere Gelehrte der Schule hielten es nach al-Hidāya für richtig, heute Lohn für das Lehren des Korans zu erlauben, weil die Menschen in religiösen Dingen …“

#### `islam.aufbau.e09` – Erlaubtes und Verbotenes III: Ehe und Familie – Grundlagen (26)

1. `islam.aufbau.e09.l01.a06` – „Ob die Ehe mit dem Wort für Miete (ijāra) zustande kommt, ist innerhalb der Schule umstritten (al-Ikhtiyār): Nach einer Überlieferung von Ibn Rustam lehnt …“
2. `islam.aufbau.e09.l01.a09` – „Heiratet ein Muslim eine Nichtmuslimin, die unter muslimischem Schutz lebt (dhimmiyya), vor zwei nichtmuslimischen Zeugen, die ebenfalls unter diesem Schutz …“
3. `islam.aufbau.e09.l01.a10` – „Nach Muḥammad ist diese Ehe nicht gültig (al-Qudūrī); al-Hidāya nennt Zufar mit ihm.“
4. `islam.aufbau.e09.l01.a20` – „Ob Weinen als Zustimmung gilt, ist umstritten: Al-Qudūrī zählt es zu den Zeichen der Erlaubnis; al-Hidāya sieht im Weinen ein Zeichen des Unwillens, Weinen …“
5. `islam.aufbau.e09.l02.a01` – „Nach Abū Ḥanīfa kommt die Ehe einer freien, volljährigen und verständigen Frau mit ihrer eigenen Zustimmung zustande, auch wenn kein Vormund (walī) den …“
6. `islam.aufbau.e09.l02.a02` – „Nach al-Qudūrī sagen Abū Yūsuf und Muḥammad: Die Ehe kommt nur mit einem Vormund zustande.“
7. `islam.aufbau.e09.l02.a03` – „In der Ẓāhir ar-riwāya macht es für die Gültigkeit nach al-Hidāya keinen Unterschied, ob der Mann ihr ebenbürtig (kufʾ) ist oder nicht; bei einem nicht …“
8. `islam.aufbau.e09.l02.a04` – „Radd al-Muḥtār gibt als Meinung, nach der Fatwa gegeben wird, die Überlieferung von al-Ḥasan von Abū Ḥanīfa wieder: Heiratet eine Frau einen nicht …“
9. `islam.aufbau.e09.l02.a06` – „Gibt es keine ʿaṣaba, dürfen nach Abū Ḥanīfa auch andere Verwandte verheiraten (al-Qudūrī).“
10. `islam.aufbau.e09.l02.a09` – „Ist der nähere Vormund weit entfernt abwesend (ghayba munqaṭiʿa), darf nach al-Qudūrī der fernere die Frau verheiraten.“
11. `islam.aufbau.e09.l02.a12` – „Ebenbürtigkeit in der Religion bedeutet nach al-Hidāya Frömmigkeit (diyāna).“
12. `islam.aufbau.e09.l02.a13` – „Ebenbürtigkeit im Vermögen heißt nach al-Hidāya in der Ẓāhir ar-riwāya, dass der Mann die Brautgabe und den Unterhalt aufbringen kann; gemeint ist der Teil …“
13. `islam.aufbau.e09.l02.a14` – „Ebenbürtigkeit im Beruf wird nach al-Hidāya nach Abū Yūsuf und Muḥammad beachtet; von Abū Ḥanīfa gibt es dazu zwei Überlieferungen.“
14. `islam.aufbau.e09.l03.a08` – „Die Frau darf sich nach al-Hidāya ihrem Mann verweigern, bis sie die Brautgabe erhält, und ihm verwehren, mit ihr zu verreisen, damit ihr Recht auf die …“
15. `islam.aufbau.e09.l03.a12` – „Heiratet ein freier Mann eine Frau gegen seinen Dienst für ein Jahr oder gegen Unterricht im Koran, steht ihr nach al-Qudūrī die übliche Brautgabe zu.“
16. `islam.aufbau.e09.l04.a02` – „Die Stillzeit beträgt nach Abū Ḥanīfa dreißig Monate, nach Abū Yūsuf und Muḥammad zwei Jahre (al-Qudūrī); Zufar nennt drei Jahre (al-Hidāya).“
17. `islam.aufbau.e09.l04.a03` – „Al-Hidāya begründet die Ansicht von Abū Yūsuf und Muḥammad mit dem Koran (Verweis 46:15): Zieht man die kürzeste Schwangerschaft von sechs Monaten ab, bleiben …“
18. `islam.aufbau.e09.l04.a04` – „Nach welcher der beiden Ansichten zur Stillzeit Fatwa gegeben wird, ist nicht einheitlich: Radd al-Muḥtār hält fest, dass nach beiden Ansichten Fatwa gegeben …“
19. `islam.aufbau.e09.l04.a10` – „Ist die Milch mit Wasser vermischt und überwiegt die Milch, entsteht nach al-Qudūrī ein Eheverbot; überwiegt das Wasser, nicht.“
20. `islam.aufbau.e09.l05.a02` – „Bemessen wird der Unterhalt nach al-Qudūrī und al-Hidāya nach den Verhältnissen beider Eheleute; das ist die Wahl von al-Khaṣṣāf, und nach al-Hidāya wird …“
21. `islam.aufbau.e09.l05.a05` – „Wird die Frau wegen einer Schuld eingesperrt oder von jemandem gewaltsam entführt, hat sie nach al-Qudūrī keinen Unterhalt.“
22. `islam.aufbau.e09.l05.a07` – „Der Mann darf nach al-Qudūrī ihren Eltern, ihrem Kind aus einer anderen Ehe und ihrer Familie verwehren, sein Haus zu betreten, nicht aber, sie zu sehen und …“
23. `islam.aufbau.e09.l06.a04` – „Spricht der Mann die Scheidung als Neuerung aus – dreimal mit einem Wort oder dreimal in derselben Reinheitszeit –, wird sie nach al-Qudūrī und al-Hidāya …“
24. `islam.aufbau.e09.l06.a05` – „Scheidet ein Mann seine Frau während ihrer Monatsblutung, wird die Scheidung nach al-Qudūrī wirksam; es ist ihm empfohlen, sie zurückzunehmen.“
25. `islam.aufbau.e09.l06.a07` – „Die Scheidung unter Zwang und die Scheidung eines Betrunkenen sind nach al-Qudūrī wirksam.“
26. `islam.aufbau.e09.l06.a12` – „Hat der Mann seine Frau ein- oder zweimal geschieden, ist ihre Wartezeit abgelaufen, heiratet sie einen anderen und kehrt dann zu ihm zurück, verfügt er nach …“

#### `islam.vertiefung.e01` – Anstand I: Kleidung, Schmuck und Gebrauchsgegenstände (24)

1. `islam.vertiefung.e01.l01.a09` – „Rote und mit Färberdistel (ʿuṣfur) gefärbte Kleidung nennt al-Ikhtiyār verpönt.“
2. `islam.vertiefung.e01.l01.a10` – „Die Frage ist in der Schule umstritten: Die meisten Werke, darunter al-Ikhtiyār, nennen rote Kleidung verpönt (siehe die vorige Aussage).“
3. `islam.vertiefung.e01.l02.a05` – „Seide als Kissen zu benutzen, darauf zu schlafen oder sie als Unterlage auszubreiten, ist nach Abū Ḥanīfa unbedenklich (al-Qudūrī, al-Hidāya, al-Ikhtiyār).“
4. `islam.vertiefung.e01.l02.a06` – „Abū Yūsuf und Muḥammad halten das – anders als Abū Ḥanīfa – für verpönt (al-Qudūrī): wegen der allgemeinen Verbote und weil es nach al-Hidāya zur Tracht der …“
5. `islam.vertiefung.e01.l02.a07` – „Reine Seide oder Brokat (dībāj) im Krieg zu tragen, ist nach Abū Ḥanīfa verpönt (al-Qudūrī, al-Hidāya).“
6. `islam.vertiefung.e01.l02.a08` – „Nach Abū Yūsuf und Muḥammad ist Seide im Krieg unbedenklich, weil reine Seide Waffenhiebe besser abhält und den Feind durch ihren Glanz mehr beeindruckt …“
7. `islam.vertiefung.e01.l02.a10` – „Ist bei einem solchen Gewebe die Seide außen sichtbar (etwa beim ʿattābī), nennt al-Ikhtiyār zwei Ansichten: verpönt, weil man aussieht, als trage man Seide …“
8. `islam.vertiefung.e01.l02.a11` – „Aus Bedarf, etwa bei starker Krätze (jarab), ist Seide nach Radd al-Muḥtār (aus at-Tātarkhāniyya) unbedenklich; es verweist auf die Erlaubnis für ʿAbd …“
9. `islam.vertiefung.e01.l02.a12` – „Verboten ist nach Radd al-Muḥtār das Tragen von Seide, nicht jeder andere Nutzen: Auf einem Gebetsteppich aus Seide zu beten, ist nicht verpönt, ebenso wenig …“
10. `islam.vertiefung.e01.l02.a15` – „Schrift aus Gold oder Silber auf einem Gewand ist nach al-Ikhtiyār erlaubt, wie die Seidenborte.“
11. `islam.vertiefung.e01.l02.a16` – „Lockere Zähne mit Silber zu befestigen, ist erlaubt; mit Gold ist es nach Abū Ḥanīfa nicht erlaubt (al-Hidāya, al-Ikhtiyār).“
12. `islam.vertiefung.e01.l02.a17` – „Nach Muḥammad darf man Zähne – anders als nach Abū Ḥanīfa, der nur Silber erlaubt – auch mit Gold befestigen (al-Hidāya).“
13. `islam.vertiefung.e01.l03.a02` – „Ob ein Ring aus Stein erlaubt ist, ist umstritten: Nach Radd al-Muḥtār (aus Munlā Khusraw) halten Shams al-Aʾimma und Qāḍīkhān ihn für erlaubt, die Verfasser …“
14. `islam.vertiefung.e01.l03.a07` – „Nach adh-Dhakhīra (in Radd al-Muḥtār) trägt man den Ring am kleinen Finger der linken Hand.“
15. `islam.vertiefung.e01.l03.a11` – „Gefäße aus Glas, Bergkristall, Karneol und Blei zu benutzen, ist unbedenklich (al-Qudūrī, al-Hidāya, al-Ikhtiyār); al-Ikhtiyār begründet: Mit ihnen prahlt man …“
16. `islam.vertiefung.e01.l03.a13` – „Aus einem Gefäß mit Silberbeschlag (mufaḍḍaḍ) zu trinken, ist nach Abū Ḥanīfa erlaubt, ebenso auf einem silberbeschlagenen Sattel zu reiten und auf einem …“
17. `islam.vertiefung.e01.l03.a14` – „Abū Yūsuf hält das für verpönt: Wer einen Teil des Gefäßes benutzt, benutzt das ganze Gefäß und damit auch das Silber (al-Hidāya, al-Ikhtiyār).“
18. `islam.vertiefung.e01.l04.a05` – „Nard (Backgammon), Schach und jedes andere Spiel, das nur der Zerstreuung dient (lahw), nennen al-Ikhtiyār und al-Hidāya verpönt.“
19. `islam.vertiefung.e01.l04.a07` – „Abū Ḥanīfa sah keinen Schaden darin, Schachspieler zu grüßen, um sie vom Spiel abzulenken.“
20. `islam.vertiefung.e01.l04.a10` – „Unterhaltungsmusik mit Instrumenten (malāhī) zu hören, etwa Stockschlagen, Rahmentrommel (daff) oder Flöte, nennt al-Ikhtiyār verboten; wer sie unvermittelt …“
21. `islam.vertiefung.e01.l04.a11` – „Al-Ikhtiyār nennt Ausnahmen: Nach al-Ḥasan ibn Ziyād ist die Rahmentrommel (daff) bei einer Hochzeit unbedenklich, um die Ehe bekannt zu machen; Radd …“
22. `islam.vertiefung.e01.l04.a18` – „Zehnerzeichen (taʿshīr) und Punkte (naqṭ) im Koranexemplar nennen al-Qudūrī, al-Hidāya und al-Ikhtiyār verpönt; al-Hidāya und al-Ikhtiyār stützen sich auf ein …“
23. `islam.vertiefung.e01.l04.a20` – „Zur Verzierung der Moschee nennt al-Ikhtiyār zwei Ansichten – eine gute Tat oder verpönt – und hält die erste für richtiger, weil sie die Moschee ehrt; das …“
24. `islam.vertiefung.e01.l04.a23` – „Nichtmuslime unter muslimischem Schutz (ahl adh-dhimma) dürfen nach al-Hidāya und al-Ikhtiyār die Heilige Moschee in Mekka und andere Moscheen betreten.“

#### `islam.vertiefung.e02` – Anstand II: Blick, Rede und Anstand im Gottesdienst (17)

1. `islam.vertiefung.e02.l01.a08` – „Radd al-Muḥtār nennt dazu eine zweite Überlieferung: Nach dem Kapitel über den Zwitter (khunthā) im al-Aṣl gleicht der Blick einer Frau auf einen fremden Mann …“
2. `islam.vertiefung.e02.l01.a13` – „Ob auch die Füße angesehen werden dürfen, ist strittig.“
3. `islam.vertiefung.e02.l01.a16` – „Das Gesicht einer fremden Frau ohne Begierde anzusehen, ist nach Radd al-Muḥtār (aus at-Tātarkhāniyya, nach Sharḥ al-Karkhī) nicht verboten, aber ohne Bedarf …“
4. `islam.vertiefung.e02.l01.a17` – „Dass ein Mann mit einer fremden Frau allein ist (khalwa), nennt der Grundtext, den Radd al-Muḥtār erläutert, verboten (ḥarām); al-Qunya nennt es stark verpönt …“
5. `islam.vertiefung.e02.l02.a04` – „Den Koran mit Tonschwankungen wie beim Gesang vorzutragen (tarjīʿ) und zuzuhören, ist nach al-Ikhtiyār verpönt, weil es dem Singen der Sünder gleicht; einige …“
6. `islam.vertiefung.e02.l02.a05` – „Den Koran an Gräbern zu lesen, hielt Abū Ḥanīfa für verpönt, weil ihm dazu nach seiner Kenntnis nichts Gesichertes vom Propheten vorlag.“
7. `islam.vertiefung.e02.l02.a07` – „Rede, die weder Lohn noch Sünde bringt, ist nach al-Ikhtiyār etwa: „Steh auf“, „Setz dich“, „Ich habe gegessen und getrunken“; sie ist weder Gottesdienst noch …“
8. `islam.vertiefung.e02.l02.a10` – „Ob in diesen Fällen eine echte Lüge erlaubt ist, ist strittig.“
9. `islam.vertiefung.e02.l02.a11` – „Doppeldeutige Rede (taʿrīḍ), die wie eine Lüge wirkt, ist nach al-Ikhtiyār verpönt, außer bei Bedarf.“
10. `islam.vertiefung.e02.l02.a17` – „Wie man von übler Nachrede umkehrt, ist strittig.“
11. `islam.vertiefung.e02.l03.a02` – „Was „verpönt“ (makrūh) heißt, ist nach Muḥammad verboten (ḥarām); er nannte es nur deshalb nicht so, weil er dafür keinen eindeutigen Text fand.“
12. `islam.vertiefung.e02.l03.a04` – „Beim Schnurrbart nennt der Grundtext von al-Ikhtiyār das Stutzen besser.“
13. `islam.vertiefung.e02.l03.a07` – „Die Beschneidung ist für Männer nach al-Ikhtiyār Sunna und gehört zur natürlichen Veranlagung (fiṭra); sie zählt zu den Kennzeichen des Islam.“
14. `islam.vertiefung.e02.l03.a16` – „Dass ein Mann einen anderen Mann auf den Mund oder an eine andere Stelle küsst oder ihn umarmt, ist nach dem Grundtext von al-Ikhtiyār verpönt.“
15. `islam.vertiefung.e02.l05.a02` – „Empfohlen ist es nach Nūr al-Īḍāḥ, die Nächte der letzten zehn Tage des Ramadan, die Nächte der beiden Feste, die Nächte der ersten zehn Tage des Dhū l-Ḥijja …“
16. `islam.vertiefung.e02.l05.a04` – „Wer vom Mittagsgebet nur eine Gebetseinheit mit dem Imam erreicht, hat es nach Nūr al-Īḍāḥ nicht in Gemeinschaft gebetet, erhält aber deren Vorzug.“
17. `islam.vertiefung.e02.l05.a09` – „Unreines (najāsa) in die Moschee zu bringen, ist nach Radd al-Muḥtār nicht erlaubt.“

#### `islam.vertiefung.e03` – Anstand III: Erwerb, Fürsorge und Wettkampf (20)

1. `islam.vertiefung.e03.l01.a06` – „Die Rangfolge der Erwerbsarten ist nicht einhellig: Manche Gelehrte stellen nach al-Ikhtiyār die Landwirtschaft über den Handel, weil ihr Nutzen allgemeiner …“
2. `islam.vertiefung.e03.l01.a14` – „Bettlern in der Moschee etwas zu geben, nennt al-Ikhtiyār verpönt und stützt sich dabei auf einen Bericht.“
3. `islam.vertiefung.e03.l02.a04` – „Dass das Horten auf Nahrungsmittel beschränkt ist, ist nach Radd al-Muḥtār die Ansicht Abū Ḥanīfas und Muḥammads, und nach ihr wird Fatwa gegeben (nach …“
4. `islam.vertiefung.e03.l02.a05` – „Nach Abū Yūsuf ist alles Horten, dessen Zurückhalten der Allgemeinheit schadet; er blickt auf den Schaden als solchen (al-Ikhtiyār, Radd al-Muḥtār).“
5. `islam.vertiefung.e03.l02.a07` – „Abū Yūsuf hält das Zurückhalten nach al-Ikhtiyār auch bei herbeigebrachter Ware für verpönt, weil das Verbot allgemein ist.“
6. `islam.vertiefung.e03.l02.a08` – „Nach Muḥammad ist es verpönt, wenn man die Ware an einem Ort gekauft hat, von dem sie gewöhnlich in die Stadt gebracht wird, weil dann das Recht der …“
7. `islam.vertiefung.e03.l02.a09` – „Über die Dauer gibt es nach al-Ikhtiyār verschiedene Ansichten: mindestens vierzig Tage, wie es in einem Hadith heißt, oder mindestens ein Monat.“
8. `islam.vertiefung.e03.l02.a10` – „Wird der Fall eines Hortenden dem Richter vorgelegt, befiehlt er ihm nach al-Ikhtiyār, zu verkaufen, was er über den Bedarf für sich und seine Familie hinaus …“
9. `islam.vertiefung.e03.l02.a14` – „Hat der Herrscher den Brotpreis festgesetzt und fürchtet der Bäcker, geschlagen zu werden, wenn er weniger gibt, darf der Käufer nach al-Ikhtiyār das zu …“
10. `islam.vertiefung.e03.l03.a09` – „Den Unterhalt einer erwachsenen Tochter und eines dauerhaft kranken erwachsenen Sohnes tragen nach al-Qudūrī beide Eltern: der Vater zwei Drittel, die Mutter …“
11. `islam.vertiefung.e03.l03.a10` – „Ein Armer muss nach al-Qudūrī keinem Verwandten Unterhalt geben; al-Hidāya begründet: Dieser Unterhalt ist Verwandtenpflege (ṣila), und der Arme hat selbst …“
12. `islam.vertiefung.e03.l03.a11` – „Nach Muḥammad ist wohlhabend genug, wer über den Unterhalt für sich und seine Familie für einen Monat hinaus etwas übrig hat; wer täglich verdient, wenn ihm …“
13. `islam.vertiefung.e03.l03.a12` – „Hat ein abwesender Sohn Vermögen, spricht der Richter den Eltern daraus Unterhalt zu (al-Qudūrī).“
14. `islam.vertiefung.e03.l03.a13` – „Nach Abū Yūsuf und Muḥammad darf der Vater gar nichts davon verkaufen; das entspricht dem Analogieschluss (qiyās), denn seine Vormundschaft endet mit der …“
15. `islam.vertiefung.e03.l03.a16` – „Die Pflege der Verwandtschaftsbande (ṣilat ar-raḥim) ist nach Radd al-Muḥtār Pflicht (wājib); nach al-Qurṭubī ist sich die Gemeinschaft einig, dass sie …“
16. `islam.vertiefung.e03.l04.a02` – „Ob ein Rennen um einen Preis auch auf Maultieren und Eseln erlaubt ist, ist umstritten.“
17. `islam.vertiefung.e03.l04.a04` – „Ein solcher Preis wird nach Radd al-Muḥtār aber kein einklagbarer Anspruch: Weigert sich der Verlierer zu zahlen, zwingt ihn der Richter nicht und spricht …“
18. `islam.vertiefung.e03.l04.a11` – „Zu weiteren Wettkämpfen sagt Radd al-Muḥtār: Rennen mit Rindern, mit Booten und im Schwimmen sind nach dem Anschein der Aussagen der Gelehrten erlaubt.“
19. `islam.vertiefung.e03.l04.a14` (auch unsicher, 4.1) – „Ein Reittier belädt man nach Radd al-Muḥtār nicht über seine Kraft, und man schlägt es nach einhelliger Ansicht weder ins Gesicht noch auf den Kopf.“
20. `islam.vertiefung.e03.l04.a17` (auch unsicher, 4.1) – „Wer ein Rennen gewonnen hat, bestimmt man nach Radd al-Muḥtār bei Kamelen an der Schulter und bei Pferden am Hals; nach einer anderen Ansicht kommt es auf die …“

#### `islam.vertiefung.e06` – Geschichte III: Abū Ḥanīfa, seine Schüler und die hanefitische Schule (5)

1. `islam.vertiefung.e06.l02.a05` (auch unsicher, 4.1) – „Radd al-Muḥtār erwähnt ein Streitgespräch al-Kisāʾīs mit „ash-Shaybānī“ in der Versammlung ar-Rashīds.“
2. `islam.vertiefung.e06.l02.a07` – „Wie streng die Rangfolge gilt, sehen die Gelehrten der Schule verschieden.“
3. `islam.vertiefung.e06.l05.a02` – „Al-Hidāya zeigt an einem Beispiel, dass veränderte Verhältnisse eine Rolle spielen: Eine zweite Aufforderung zum Morgengebet zwischen Gebetsruf und Iqāma …“
4. `islam.vertiefung.e06.l05.a04` – „Widersprechen beide Schüler Abū Ḥanīfa, gibt Radd al-Muḥtār zwei Ansichten wieder: Nach der einen folgt man auch dann Abū Ḥanīfa, nach der anderen hat der …“
5. `islam.vertiefung.e06.l05.a05` – „Nach al-Ḥamawī sagte al-Maqdisī in einer Frage zur Qasāma sogar, man solle die Fatwa nach der Meinung der beiden Schüler geben, zumal sich die Urteile mit den …“

#### `islam.vertiefung.e07` – Grundwissen I: Fiqh – Urteilsarten, Meinungen der Schule und Fatwa (15)

1. `islam.vertiefung.e07.l01.a09` – „Nach al-Baḥr, das Radd al-Muḥtār wiedergibt, ergibt sich aus den Worten der Gelehrten der Schule: Nach der richtigen Ansicht macht sich schuldig, wer ein …“
2. `islam.vertiefung.e07.l01.a10` – „Woran man die Arten erkennt, fasst al-Baḥr (in Radd al-Muḥtār) so zusammen, um abweichende Aussagen der Werke – etwa in al-Hidāya – zu vereinen: Tat der …“
3. `islam.vertiefung.e07.l01.a13` – „Ob es leicht verpönt (makrūh tanzīhan) ist, das Empfohlene zu lassen, ist umstritten.“
4. `islam.vertiefung.e07.l01.a17` – „Mubāḥ (erlaubt) ist nach Radd al-Muḥtār etwas, dessen Tun nicht gefordert ist; man hat darin die Wahl.“
5. `islam.vertiefung.e07.l02.a02` – „„Verpönt“ meint dabei nach Radd al-Muḥtār offenbar auch das leicht Verpönte; aṭ-Ṭaḥṭāwī ließ die Frage offen.“
6. `islam.vertiefung.e07.l02.a04` – „Nach as-Sirājiyya, die Radd al-Muḥtār wiedergibt, gibt der Muftī die Fatwa grundsätzlich nach der Ansicht des Imams Abū Ḥanīfa, dann nach Abū Yūsuf, dann nach …“
7. `islam.vertiefung.e07.l02.a06` – „Dazu gibt es in der Schule eine andere Ansicht: Nach al-Ḥāwī al-Qudsī zählt, wenn die beiden Gefährten (aṣ-ṣāḥibān) dem Imam widersprechen, die Stärke des …“
8. `islam.vertiefung.e07.l02.a08` – „Nach den Fatāwā Ibn ash-Shilbīs weicht man von der Ansicht des Imams nur ab, wenn einer der Gelehrten der Schule ausdrücklich sagt, dass die Fatwa nach einer …“
9. `islam.vertiefung.e07.l03.a04` – „Für einen Richter ist Ijtihād nach dem Grundtext eine Bedingung des Vorrangs (sharṭ al-awlawiyya): Findet sich ein Mujtahid, ist er für das Amt der Geeignetere.“
10. `islam.vertiefung.e07.l03.a05` – „Deshalb ist es nach dem Grundtext gültig, einen Laien (ʿāmmī) zum Richter zu bestellen.“
11. `islam.vertiefung.e07.l03.a06` – „Muftī ist nach den Gelehrten der Rechtsgrundlagen eigentlich der Mujtahid.“
12. `islam.vertiefung.e07.l03.a08` – „Welche Meinungsverschiedenheit zählt?“
13. `islam.vertiefung.e07.l04.a01` – „Der Muftī braucht bei tatsächlichen Fällen nach al-Fatḥ, das Radd al-Muḥtār wiedergibt, eine Art eigener Abwägung (ḍarb ijtihād) und Kenntnis der Lage der …“
14. `islam.vertiefung.e07.l04.a02` – „Nach al-Fatḥ muss der Muftī auf die Besonderheiten des einzelnen Falls schauen; an-Nahr und ash-Shurunbulāliyya stimmen dem nach Radd al-Muḥtār zu.“
15. `islam.vertiefung.e07.l04.a09` – „Der Imam und der Muftī dürfen nach al-Khāniyya, die al-Baḥr anführt, Geschenke und besondere Einladungen annehmen; mit dem Imam ist nach al-Baḥr der Imam der …“

#### `islam.vertiefung.e08` – Grundwissen II: Umgang mit Koran und Hadith (17)

1. `islam.vertiefung.e08.l01.a05` – „Al-Ikhtiyār stützt das Verbot, den Muṣḥaf ohne Reinheit zu berühren, auf einen Koranvers (siehe Verweis).“
2. `islam.vertiefung.e08.l01.a06` – „Mit „Hülle“ (ghilāf) ist nach al-Hidāya etwas gemeint, das vom Muṣḥaf getrennt ist, nicht der fest angenähte Einband; das sei die richtige Ansicht.“
3. `islam.vertiefung.e08.l01.a07` – „Ob man den Muṣḥaf mit dem Ärmel anfassen darf, beantworten die Werke verschieden.“
4. `islam.vertiefung.e08.l01.a09` – „Ob man Tafsir-Bücher ohne Gebetswaschung berühren darf, ist in der Schule umstritten.“
5. `islam.vertiefung.e08.l01.a12` – „Ob jemand im Zustand der janāba weniger als einen Vers rezitieren darf, ist in der Schule umstritten.“
6. `islam.vertiefung.e08.l01.a13` – „Eine Lehrerin in der Monatsblutung darf nach Radd al-Muḥtār Koran lehren, indem sie Wort für Wort vorspricht und zwischen den Wörtern absetzt; so nach der …“
7. `islam.vertiefung.e08.l01.a15` – „Ob man im Zustand der janāba die Fātiḥa oder Verse mit der Bedeutung eines Bittgebets sprechen darf, wenn man ein Bittgebet und keine Rezitation beabsichtigt …“
8. `islam.vertiefung.e08.l01.a17` – „Einem Christen wird nach dem Grundtext von Radd al-Muḥtār nicht ermöglicht, den Muṣḥaf zu berühren; in manchen Abschriften steht allgemein „Nichtmuslim“ …“
9. `islam.vertiefung.e08.l02.a03` – „Über das Mindestmaß der Pflicht-Rezitation gibt es in der Schule zwei Ansichten.“
10. `islam.vertiefung.e08.l02.a09` – „Die Basmala spricht man im Gebet leise (al-Hidāya).“
11. `islam.vertiefung.e08.l03.a09` – „Al-Ikhtiyār führt zum Qunūt im Morgengebet Berichte von Gefährten an, die einander widersprechen, und schließt aus ihnen, dass der Qunūt dort aufgehoben …“
12. `islam.vertiefung.e08.l04.a01` – „Was ist „Koran“?“
13. `islam.vertiefung.e08.l04.a03` – „Die Basmala ist nach der Schule ein Vers des Korans.“
14. `islam.vertiefung.e08.l05.a01` – „Wer hört, wie der Koran rezitiert wird, muss nach dem Grundtext von Radd al-Muḥtār zuhören, im Gebet und auch außerhalb davon; maßgeblich ist der allgemeine …“
15. `islam.vertiefung.e08.l05.a04` – „Zeichen nach jeweils zehn Versen (taʿshīr) und Zeichen für Vokale und Endungen (naqṭ) nennen al-Ikhtiyār und al-Hidāya im Muṣḥaf verpönt; sie stützen sich auf …“
16. `islam.vertiefung.e08.l05.a06` – „Ob man den Muṣḥaf mit Gold oder Silber verzieren darf, ist umstritten.“
17. `islam.vertiefung.e08.l05.a07` – „Den Koran zu schreiben und dabei jedes Wort zu erklären und zu übersetzen, ist nach al-Fatḥ (aus al-Kāfī) erlaubt.“

Ohne strittige Aussage: `islam.grund.e10`, `islam.grund.e11`.

## 5. Quellenfrage Nūr al-Īḍāḥ (LM-33)

**Befund.** Grundtext der ʿIbādāt ist Nūr al-Īḍāḥ in der Ausgabe Dār al-Ḥikma, 1985 (OpenITI `1069IbnCammarShurunbulali.NurIdah.JK000284-ara1`, QUELLE.md).
Die Belegprüfungen von `islam.aufbau.e03` bis `islam.aufbau.e06` haben ergeben: Der OpenITI-Text dieser Ausgabe ist im
Zakat- und im Hadsch-Teil eine moderne Neufassung. Nach den Vermerken der Entwürfe stehen dort Sätze, die nicht im
Grundtext stehen, den ash-Shurunbulālī in Marāqī al-Falāḥ wiedergibt, und in keinem anderen Werk des Registers. Die
Entwürfe weisen solche Stellen mit „hier benutzte Druckausgabe“ aus; mehrere davon sind als unsicher gekennzeichnet
(Abschnitt 4.1).

**Entscheidung durch Menschen (LM-33, Imam und Vorstand):** Ob diese Ausgabe im Zakat- und Hadsch-Teil als Nūr al-Īḍāḥ
gelten darf, entscheiden Menschen. Diese Übersicht trifft dazu keine Aussage; sie zeigt nur, welche Einheiten und wie viele
Belege die Entscheidung berührt. Für die übrigen Einheiten nennt der Befund nichts; ihre Belege stehen nur zur Übersicht in
der Tabelle.

**Einheiten mit Belegen aus `nur_al_idah`**

| Einheit | Bereich | Belege `nur_al_idah` | Aussagen mit diesem Beleg | davon nur mit `nur_al_idah` belegt | Passagen | Zakat/Hadsch (Befund) |
|---|---|---:|---:|---:|---|---|
| `islam.grund.e01` | Reinheit | 49 | 46 | 18 | ms0001–ms0011 | – |
| `islam.grund.e02` | Reinheit | 46 | 40 | 14 | ms0003–ms0006 | – |
| `islam.grund.e03` | Reinheit | 54 | 51 | 17 | ms0006–ms0010 | – |
| `islam.grund.e04` | Gebet | 45 | 43 | 3 | ms0011–ms0013 | – |
| `islam.grund.e05` | Gebet | 82 | 71 | 20 | ms0013–ms0018 | – |
| `islam.grund.e06` | Gebet | 92 | 81 | 36 | ms0018–ms0031 | – |
| `islam.grund.e07` | Gebet | 100 | 88 | 31 | ms0023–ms0033 | – |
| `islam.grund.e08` | Gebet | 119 | 102 | 22 | ms0026–ms0041 | – |
| `islam.aufbau.e01` | Fasten | 45 | 42 | 18 | ms0041–ms0048 | – |
| `islam.aufbau.e02` | Fasten | 76 | 71 | 13 | ms0043–ms0048 | – |
| `islam.aufbau.e03` | Zakat | 27 | 26 | 4 | ms0049–ms0054 | **ja** |
| `islam.aufbau.e04` | Zakat | 34 | 31 | 1 | ms0054–ms0056 | **ja** |
| `islam.aufbau.e05` | Hadsch | 39 | 31 | 4 | ms0056–ms0062 | **ja** |
| `islam.aufbau.e06` | Hadsch | 67 | 58 | 13 | ms0057–ms0067 | **ja** |
| `islam.aufbau.e07` | Erlaubtes und Verbotenes | 1 | 1 | 1 | ms0035 | – |
| `islam.vertiefung.e02` | Anstand | 25 | 22 | 19 | ms0003–ms0030 | – |
| `islam.vertiefung.e08` | Grundwissen | 7 | 6 | 1 | ms0010–ms0015 | – |
| **Summe** | | **908** | **810** | **235** | | |

- Zakat und Hadsch (`islam.aufbau.e03`–`e06`): 167 Belege aus `nur_al_idah` in 146 Aussagen; 22 dieser Aussagen haben keinen Beleg aus einem anderen Werk.
- Ohne Belege aus `nur_al_idah`: `islam.grund.e09`, `islam.grund.e10`, `islam.grund.e11`, `islam.aufbau.e08`, `islam.aufbau.e09`, `islam.vertiefung.e01`, `islam.vertiefung.e03`, `islam.vertiefung.e06`, `islam.vertiefung.e07`.
- Aussagen, deren Text sich ausdrücklich auf die „hier benutzte Druckausgabe von Nūr al-Īḍāḥ“ bezieht (9): `islam.aufbau.e03.l01.a04`, `islam.aufbau.e03.l02.a01`, `islam.aufbau.e03.l06.a02`, `islam.aufbau.e03.l06.a11`, `islam.aufbau.e04.l03.a02`, `islam.aufbau.e04.l04.a14`, `islam.aufbau.e06.l01.a01`, `islam.aufbau.e06.l03.a01`, `islam.aufbau.e06.l03.a10`.

**Kapitel der Belege aus `nur_al_idah` in den betroffenen Einheiten** (Umschrift wie in den Belegen)

- `islam.aufbau.e03`: Kitāb az-Zakāh › Aḥkām Mutafarriqa; Kitāb az-Zakāh › Shurūṭ Adāʾihā; Kitāb az-Zakāh › Shurūṭ Wujūb Adāʾihā; Kitāb az-Zakāh › Shurūṭ Wujūbihā; Kitāb az-Zakāh › Taʿrīfuhā; Kitāb az-Zakāh › Zakāt ad-Dayn; Kitāb az-Zakāh › Zakāt al-Fiḍḍa wa-dh-Dhahab; Kitāb az-Zakāh › Zakāt al-Fiḍḍa wa-dh-Dhahab › Niṣāb adh-Dhahab; Kitāb az-Zakāh › Zakāt al-Fiḍḍa wa-dh-Dhahab › Niṣāb al-Fiḍḍa; Kitāb az-Zakāh › al-Ajnās allatī tajibu fīhā z-Zakāh; Kitāb az-Zakāh › Ḥukmuhā wa-Zaman Farḍiyyatihā wa-Ḥikmatuhā
- `islam.aufbau.e04`: Kitāb az-Zakāh › Maṣrif az-Zakāh; Kitāb az-Zakāh › Ṣadaqat al-Fiṭr › Ikhrāj al-Qīma; Kitāb az-Zakāh › Ṣadaqat al-Fiṭr › Miqdār al-Wājib; Kitāb az-Zakāh › Ṣadaqat al-Fiṭr › Ruknuhā; Kitāb az-Zakāh › Ṣadaqat al-Fiṭr › Sababuhā; Kitāb az-Zakāh › Ṣadaqat al-Fiṭr › Shurūṭ Wujūbihā; Kitāb az-Zakāh › Ṣadaqat al-Fiṭr › Taʿrīfuhā; Kitāb az-Zakāh › Ṣadaqat al-Fiṭr › Waqt Wujūbihā; Kitāb az-Zakāh › Ṣadaqat al-Fiṭr › al-Aṣnāf allatī tukhraju minhā; Kitāb az-Zakāh › Ṣadaqat al-Fiṭr › Ḥikmatuhā
- `islam.aufbau.e05`: Kitāb al-Ḥajj › Arkānuhu; Kitāb al-Ḥajj › Baḥth al-Qirān › Kayfiyyatuhu; Kitāb al-Ḥajj › Baḥth al-Qirān › Shukr Allāh; Kitāb al-Ḥajj › Baḥth al-Qirān › Taʿrīfuhu; Kitāb al-Ḥajj › Baḥth at-Tamattuʿ › Kayfiyyatuhu; Kitāb al-Ḥajj › Baḥth at-Tamattuʿ › Shukr Allāh; Kitāb al-Ḥajj › Baḥth at-Tamattuʿ › Taʿrīfuhu; Kitāb al-Ḥajj › Baḥth at-Tamattuʿ › Ḥukmuhu; Kitāb al-Ḥajj › Kayfiyyat al-Ḥajj; Kitāb al-Ḥajj › Mawāqīt al-Ḥajj al-Makāniyya; Kitāb al-Ḥajj › Shurūṭ Farḍiyyatihi; Kitāb al-Ḥajj › Shurūṭ Wujūb Adāʾihi; Kitāb al-Ḥajj › Shurūṭ Ṣiḥḥatihi; Kitāb al-Ḥajj › Sunan al-Ḥajj; Kitāb al-Ḥajj › Taʿrīfuhu; Kitāb al-Ḥajj › Waqtuhu; Kitāb al-Ḥajj › Wājibātuhu; Kitāb al-Ḥajj › Zaman Farḍiyyatihi; Kitāb al-Ḥajj › al-Iḥrām
- `islam.aufbau.e06`: Kitāb al-Ḥajj › Baḥth al-ʿUmra › Kayfiyyatuhā; Kitāb al-Ḥajj › Baḥth al-ʿUmra › Mīqātuhā; Kitāb al-Ḥajj › Baḥth al-ʿUmra › Ruknuhā; Kitāb al-Ḥajj › Baḥth al-ʿUmra › Taʿrīfuhā; Kitāb al-Ḥajj › Baḥth al-ʿUmra › al-ʿUmra al-Ḥajj al-Aṣghar; Kitāb al-Ḥajj › Baḥth al-ʿUmra › Ḥukmuhā; Kitāb al-Ḥajj › Bāb al-Jināyāt; Kitāb al-Ḥajj › Faṣl fī Ziyārat an-Nabī; Kitāb al-Ḥajj › Faṣl fī Ziyārat an-Nabī › al-Amākin al-mustaḥabb ziyāratuhā fī l-Madīna; Kitāb al-Ḥajj › Kayfiyyat al-Ḥajj; Kitāb al-Ḥajj › Sunan al-Ḥajj; Kitāb al-Ḥajj › al-Hady; Kitāb al-Ḥajj › al-Hady › Makān Dhabḥ al-Hady; Kitāb al-Ḥajj › al-Hady › Waqt adh-Dhabḥ

## 6. Zurückgestellt

### `islam.vertiefung.e04` – Geschichte I: Das Leben des Propheten (Grundlagen)

- Bereich `siyar`, Ablage laut Lehrplan `web/inhalte/lernapp/islam/siyar/islam.vertiefung.e04.json` (keine Datei), 5 Lektionen: `l01` Herkunft und Jugend · `l02` Die erste Offenbarung und die Zeit in Mekka · `l03` Die Auswanderung (hijra) · `l04` Medina: Gemeinde und Moschee · `l05` Die letzten Jahre und der Abschied
- Grund (WISSEN.md, wörtlich): „keine im Quellenregister (S8 §3.5). Zurückgestellt bis Menschen ein Werk benennen (LM-04); kein Entwurf aus dem Gedächtnis (KERN §2.2 Nr. 5).“

### `islam.vertiefung.e05` – Geschichte II: Die Gefährten und die ersten Kalifen

- Bereich `siyar`, Ablage laut Lehrplan `web/inhalte/lernapp/islam/siyar/islam.vertiefung.e05.json` (keine Datei), 5 Lektionen: `l01` Wer die Gefährten sind · `l02` Abū Bakr · `l03` ʿUmar · `l04` ʿUthmān · `l05` ʿAlī
- Grund (WISSEN.md, wörtlich): „keine im Quellenregister (S8 §3.5). Zurückgestellt bis Menschen ein Werk benennen (LM-04); kein Entwurf aus dem Gedächtnis (KERN §2.2 Nr. 5).“

Lehrplan §6 (wörtlich): „Zurückgestellt: Geschichte (3). Keines der benannten Werke hat ein Sīra- oder Geschichtskapitel („as-siyar“ ist dort Kriegsrecht). Glaubenssätze über den Propheten und die Gefährten stehen in `islam.grund.e10` und `islam.grund.e11`.“

- Offen für Menschen: **LM-04** – ein Werk für Geschichte (Sīra, Gefährten, Rechtsschule) benennen. Bis dahin gibt es zu
  diesen Einheiten keinen Entwurf.
- `islam.vertiefung.e06` (Geschichte III) führt der Lehrplan (Stand 21.10.2026) ebenfalls als zurückgestellt; inzwischen liegt dazu ein Entwurf vor (`web/inhalte/lernapp/islam/siyar/islam.vertiefung.e06.json`,
  5 Lektionen, 37 Aussagen, 85 Belege: `ikhtiyar` 6, `radd_al_muhtar` 73, `hidaya` 6); er steht in Abschnitt 2 und 4 wie die übrigen Entwürfe.
- In `islam.vertiefung.e08` führt der Lehrplan die Lektionen `l03` und `l04` (Hadith- und Koranwissenschaften) als
  zurückgestellt; die Datei enthält unter diesen Schlüsseln Lektionen mit anderem Zuschnitt und eine Lektion `l05`
  (Abschnitt 2, Abgleich mit dem Lehrplan).
