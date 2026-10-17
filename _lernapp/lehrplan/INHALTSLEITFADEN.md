# Inhaltsleitfaden der Sprachkurse (Entwurf für LM-09)

- **Stand:** 16.10.2026, Version 0.1.0 (L3-01, vorgezogen)
- **Status:** Entwurf. Er gilt als Standard, bis Hoca und Vorstand ihn freigeben (LM-09).
- **Formelliste:** gesperrt, bis zwei Personen mit `religioese_pruefung` sie freigeben (KERN §2.3).
- **Maschinenlesbar:** `web/inhalte/lernapp/rahmen/leitfaden.json`. Dort stehen die vollständigen Wortlisten mit Ausnahmen,
  Kontextwörtern und Prüfregeln. Bei Abweichung gilt die JSON-Datei; dieses Dokument erklärt sie.
- **Geltung:** alle sechs Sprachkurse (`tr-aus-de`, `ar-aus-de`, `de-aus-tr`, `ar-aus-tr`, `de-aus-ar`, `tr-aus-ar`), alle
  Inhaltsarten (Zieltexte, Übersetzungen, Glossen, Tipps, Dialoge, Geschichten, Lesetexte, Einstufung, Bildkarten) und
  übernommene Tatoeba- und Wiktionary-Einträge. Nicht für den Wissenskurs `islam` und den Pfad `koran` (eigene Regeln, KERN §2).
- **Bezug:** KERN §2–§5 und §7; PLAN §4, §5.1, §6.1–§6.4; MENSCHEN LM-02, LM-09, LM-34, LM-35, LM-36; ADR 0040, 0041, 0045;
  Beleg S7 §3.3 und §4.

> **KI-Regel 2 (ADR 0040, KERN §2):** Keine Koranverse, Hadithe, Bittgebete oder anderen religiösen Texte (weder arabisch
> noch übersetzt), keine Koran-Wortbedeutungen, keine Fiqh-Aussagen. Sprachkurse sind ohne Religionsbezug. Religiöse Formeln
> gibt es dort nur aus einer von zwei Gelehrten freigegebenen Liste; bis dahin nur als markierter Kandidat `religionsbezug`,
> nie als Lernziel. Arabisch steht in diesem Dokument nur in Umschrift (DIN 31635 vereinfacht).

**Begründungen** in diesem Leitfaden sind redaktionell: Lebenswelt der Familien, Kinderschutz, Lernziel Alltag. Sie sind keine
religiöse oder rechtliche Bewertung; die nehmen die Prüfenden vor.

## 0 Kurzfassung

- Die Kurse zeigen das Leben einer Familie in Deutschland und im Alltag der Zielsprache: Schule, Arbeit, Behörden, Arzt,
  Wohnen, Nachbarschaft. Alles ist familientauglich; A1–B1 sind kindgeeignet.
- 13 Tabu-Kategorien mit Regel, Begründung und Wortlisten in drei Sprachen. Der Prüfer `lernapp:pruefen` meldet Treffer an
  Menschen (PLAN §6.4).
- 31 erlaubte Themen mit Stufen und Hinweisen.
- Religion ist kein Lernthema. 13 Orte und Ereignisse und 37 Formeln stehen nur als gesperrte Kandidaten `religionsbezug` bereit.
- Bildkarten zeigen nur Gegenstände und Symbole.
- Namensliste: je Sprache mindestens 25 weibliche und 27 männliche Vornamen, dazu Familiennamen.
- 18 offene Fragen an Menschen, jede mit Standard.

## 1 Grundsätze

| ID | Grundsatz | Regel |
|---|---|---|
| G-01 | Würde | Respektvolle Figuren; Fehler ohne Spott, keine Bloßstellung. |
| G-02 | Familientauglich | Alles kann in der Familie gemeinsam gelernt werden; A1–B1 kindgeeignet (§6). |
| G-03 | Alltagsnah | Leben in Deutschland und Alltag der Zielsprache; Herkunftsländer neutral. |
| G-04 | Ohne Herabsetzung | Keine Stereotype oder Witze über Nationen, Herkunft, Religionen, Geschlechter, Alter, Behinderung, Aussehen, soziale Lage; Dialekte nicht lächerlich; keine Wertung anderer Religionen. |
| G-05 | Ohne Politik | Keine Parteien, Personen der Politik, Wahlkampf, Konflikte, Grenzfragen, Flaggen. Staatskunde nur sachlich ab B1 (OF-10). |
| G-06 | Ohne Marken und echte Personen | Gattungsbegriffe (Messenger, Videoplattform, Limonade); keine Prominenten, Vereine, Firmen, Schulen, Praxen. Städte ja, Einrichtungen allgemein („das Bürgeramt“). |
| G-07 | Keine Werbung, keine Spendenaufrufe | Auch nicht in Beispielsätzen (L0-E17, LM-35). Ehrenamt ist Thema, nie Aufruf. |
| G-08 | Keine externen Links | Keine URLs, QR-Codes, echten Adressen oder Nummern; Beispiel-E-Mail nur mit example.org, nicht verlinkt; 110 und 112 erlaubt. |
| G-09 | Vielfältige Rollenbilder | Frauen und Männer in allen Berufen; Väter kochen und erziehen; Mütter mit oder ohne Beruf, ohne Wertung; aktive Großeltern; Menschen mit Behinderung selbstverständlich. Begegnungen von Frauen und Männern sachlich, ohne romantischen Unterton außerhalb der Ehe. |
| G-10 | Namen | Nur aus der Namensliste (§1.1), drei Sprachräume gemischt; keine Namen realer Gemeindemitglieder. |
| G-11 | Religion kein Lernthema | Nur markierte Kandidaten (§4); Formeln gesperrt. |
| G-12 | Ernste Themen ruhig | Krankheit, Tod, Unfall, Flucht, Trennung sachlich, ohne Einzelheiten, mit Blick auf Hilfe; unter B1 nur leichte Fälle. |
| G-13 | Höfliche Sprache | Du/Sie passend; keine Schimpfwörter; keine Ironie unter B2; kein Gottesname als Ausruf; Umgangssprache ab B1 und gekennzeichnet. |
| G-14 | Übernommene Sätze | Tatoeba und Wiktionary nur nach Standardfilter S7-E3 und diesem Leitfaden; Treffer werden ausgeschlossen, nicht umgeschrieben. |

### 1.1 Namen

Figuren tragen nur Vornamen aus der Liste. Jede Einheit mischt die drei Sprachräume, etwa Elif, Jan und Ḫālid im Deutschkurs.
Familiennamen gibt es nur für die förmliche Anrede ab A2 („Frau Becker“, „Herr Yılmaz“, „Frau al-Ḥaddād“).

| Sprache | weiblich | männlich |
|---|---|---|
| de (26 / 28) | Anna, Lena, Sophie, Laura, Julia, Lea, Emma, Mia, Clara, Paula, Greta, Ida, Frieda, Katharina, Sabine, Petra, Monika, Ursula, Birgit, Heike, Karin, Susanne, Andrea, Nina, Jana, Helene | Jan, Felix, Max, Paul, Leon, Finn, Tim, Tom, Moritz, Ben, Erik, Lars, Jens, Uwe, Stefan, Thomas, Andreas, Frank, Jürgen, Dieter, Wolfgang, Bernd, Oliver, Florian, Karl, Anton, Emil, Konrad |
| tr (28 / 32) | Elif, Büşra, Beren, Selin, Gamze, Damla, Duru, Ceren, Defne, Ela, Sude, Yağmur, Eylül, Nehir, Ayla, Gül, Derya, Özge, Pınar, Ebru, Cansu, İpek, Aslı, Seda, Begüm, Nilay, Dilek, Sevim | Emre, Can, Mert, Kerem, Efe, Berk, Arda, Kaan, Umut, Barış, Onur, Serkan, Tolga, Cem, Alper, Oğuz, Murat, Selim, Yiğit, Hakan, Selçuk, Erkan, Sinan, Levent, Çınar, Ege, Aras, Metin, Erdem, Gökhan, Orhan, Enes |
| ar, Umschrift (25 / 27) | Laylā, Salmā, Hind, Rīm, Ranā, Dīma, Lamā, Nadā, Samar, Lubnā, Hāla, Dāliya, Yāsmīn, Rašā, Sawsan, Nisrīn, Ġāda, Warda, Samīra, Nādiya, Amal, Rahaf, Tālā, Ǧanā, Šahd | Ḫālid, Saʿīd, Samīr, Rāmī, Kamāl, Ǧamāl, Fādī, Ziyād, Bāsil, Hišām, Wāʾil, Ḥāzim, ʿĀdil, Yazan, Layṯ, Sāmī, Ġassān, Nizār, Murād, Ayman, Fāris, Rāʾid, Qays, Bassām, Iyād, Anas, ʿAmmār |

**Familiennamen:**
- de: Becker, Schneider, Fischer, Wagner, Hoffmann, Koch, Klein, Neumann, Schulz, Krüger, Braun, Zimmermann, Hartmann, Lange
- tr: Yılmaz, Kaya, Demir, Şahin, Çelik, Yıldız, Aydın, Öztürk, Arslan, Doğan, Çetin, Koç, Polat, Aksoy
- ar: al-Ḥaddād, an-Naǧǧār, al-Ḫayyāṭ, aṣ-Ṣabbāġ, al-ʿAṭṭār, al-Ḥalabī, aš-Šāmī, as-Saʿdī, al-Ǧazāʾirī, al-Baġdādī, Manṣūr, ʿAwwād

**Nicht verwendet** (Begründung: Dialogfiguren erleben Alltagsmissgeschicke, und der Religionswächter soll nicht anschlagen):
- Namen von Propheten, Namen und Beinamen des Propheten Muḥammad, Namen seiner Familie und der vier ersten Kalifen, Engelnamen,
  Maria/Maryam, Ableitungen von Christus, Gottesnamen und ʿAbd-Namen, Namen von Suren, heiligen Stätten und religiösen Begriffen.
  Beispiele: Muḥammad, Aḥmad, Fāṭima, ʿĀʾiša, ʿAlī, Yāsīn, Ahmet, Mustafa, Ayşe, Zeynep, Kadir, Esra, Merve, Burak, Maria, Eva,
  Jonas, Elias, Johannes, Michael.
- Namen, die ein Wort des Tabu-Lexikons sind oder einen Fehlalarm auslösen: Savaş (Krieg), Faiz (Zins), Burcu (Sternzeichen),
  Aşkın, Ḥabīb, Ḫalīl, Nabīl.
- Ob dieser Ausschluss richtig ist und wie Namen realer Gemeindemitglieder vermieden werden, ist OF-09.

Geprüft: 0 Namen doppelt, 0 Namen mit Treffer im Tabu-Lexikon (Messung §8).

## 2 Tabu-Lexikon

### 2.1 Regelarten

| Regel | Bedeutung |
|---|---|
| `verboten` | Kommt nicht vor, auch nicht sachlich. Ausnahmen nur, wo die Kategorie sie nennt. |
| `nur_sachlich` | Nie als Normalität (keine Figur tut es, keine Szene zeigt es als üblich). Sachlich erst ab der genannten Stufe und nur in den genannten Zusammenhängen. |
| `offene_frage` | Menschen entscheiden (LM-09); bis dahin gilt der Standard. |

### 2.2 Übersicht

| Kategorie | Regel | Stufe oder Standard | sachlich erlaubt in | Begründung (kurz) | Frage |
|---|---|---|---|---|---|
| Alkohol, Tabak, Rauschmittel | nur sachlich | ab B1 | Gesundheit und Vorbeugung, Verkehr (Promille), Verbotsschilder | KERN §5: keine Alltagsnormalität; Vorbeugung ist nützlich | OF-11 |
| Schwein und Schweineprodukte | nur sachlich | ab A2 | Zutatenliste, Etikett, Nachfrage beim Einkauf | KERN §5; Etiketten lesen ist echter Alltagsbedarf | OF-13 |
| Glücksspiel und Wetten | nur sachlich | ab B2 | Sucht und Vorbeugung, Verbraucherschutz | kein Alltagsnutzen in A1–B1; Kinderschutz | – |
| Musik und Tanz als Freizeit | offene Frage | kein Lernthema; „Musik“ nur passiv ab B2 | – | LM-09 nennt Musik ausdrücklich | OF-01, OF-02 |
| Beziehungen außerhalb der Ehe, Dating, Flirt | verboten | Ehe, Verlobung, Familie, Freundschaft erlaubt | – | Familienbild der Gemeinde; Kinderschutz | OF-16 |
| Sexualität | verboten | Schwangerschaft und Geburt als Familienereignis sind nicht betroffen | – | kein Thema eines Familien-Sprachkurses | – |
| Gewalt und Waffen | nur sachlich | ab B1 | Nachrichten, Polizei und Notruf, Unfall und Erste Hilfe, Geschichte ohne Einzelheiten | Kinderschutz; Rücksicht auf Familien mit Fluchterfahrung | OF-18 |
| Aberglaube, Wahrsagen, Horoskop, Magie | verboten | – | – | widerspricht dem Selbstverständnis der Gemeinde; kein Lernziel | – |
| Zinsgeschäfte als Normalität | nur sachlich | ab B2 | Bank und Vertrag, Verbraucherschutz, Behördenpost | keine Normalität; Vertragsbegriffe ab B2 nötig | OF-12 |
| Hund im Haus als Normalität | offene Frage | kein Hund in der Wohnung; draußen sachlich ab A2 | Leinenpflicht, Blindenhund, Polizeihund | Haltung vieler Familien | OF-03 |
| Anstößige Kleidung, Körperbeschreibung | verboten | Kleidung neutral, Körperteile ohne Intimbereich | Arztbesuch | Würde; kein Schönheitsdruck | OF-08 |
| Fluchen und Schimpfwörter | verboten | auch kein Gottesname als Ausruf | – | Würde; ADR 0041 Nr. 4: „anstößig“ ist kritisch | – |
| Politik | verboten | Staatskunde sachlich ab B1 | Grundrechte, Gericht, Gemeinde, Wahl als Verfahren | Parteinahme spaltet die Gemeinde | OF-10 |

### 2.3 Wortlisten (Auszug)

Die Tabelle zeigt die wichtigsten Formen. Vollständig, mit Prüfart (`teil`, `anfang`, `wort`, `phrase`), Ausnahmen und
Kontextwörtern: `leitfaden.json` → `tabu.kategorien[].formen`. Deutsch und Türkisch in normalisierter Kleinschreibung,
Arabisch in Umschrift.

| Kategorie | de | tr | ar (Umschrift) |
|---|---|---|---|
| Alkohol, Rauschmittel | alkohol, wein, bier, sekt, schnaps, likör, whisk-, wodka, cocktail, betrunken, kneipe, promille, droge, kiff-, rauche-/raucht, zigarette, tabak, shisha, haschisch, kokain | alkol, bira, şarap, rakı, viski, votka, içki, sarhoş, meyhane, uyuşturucu, esrar, sigara, tütün, nargile | ḫamr, nabīḏ, bīra, kuḥūl, sakrān, muskir, ḫammāra, muḫaddir, tadḫīn, tibġ, šīša, narǧīla |
| Schwein | schwein, ferkel, schinken, eisbein, speck, sau | domuz, jambon | ḫinzīr |
| Glücksspiel | glücksspiel, casino, roulette, spielautomat, spielhalle, rubbellos, jackpot, sportwette, lotterie, lotto, poker, wetten | kumar, piyango, bahis, iddaa, rulet, poker, kazı kazan | qimār, maysir, yānaṣīb, murāhana, rihān, kāzīnū |
| Musik, Tanz | musik, musiz-, konzert, tanz, disko, party, lied, singen, sänger, gitarre, klavier, geige, flöte, rap, karneval, fasching | müzik, şarkı, dans, konser, gitar, piyano, keman, davul, flüt, disko, halay, türkü | mūsīqā, ġināʾ, uġniya, raqṣ, ġītār, biyānū, ṭabl, muġannī |
| Beziehungen | verliebt, flirt, dating, date, affäre, liebhaber, lebensgefährt-, partnerbörse, romant-, valentinstag, küss-/kuss, „fester freund“, „ex-freundin“ | flört, aşık, aşk, öp-, sevgili, metres, „erkek arkadaş“, „kız arkadaş“, „sevgililer günü“ | ʿišq, ʿāšiq, ġarām, muwāʿada, ġazal |
| Sexualität | sex, sexu-, erotik, porno, prostitu-, bordell, vergewaltig-, kondom, nackt, intim | seks, cinsel, erotik, porno, çıplak, fuhuş, genelev, tecavüz, seviş- | ǧinsī, ibāḥiyya, iġtiṣāb, ʿāhira |
| Gewalt, Waffen | mord, töt-, umbring-, erschieß-, waffe, pistole, gewehr, bombe, krieg, terror, leiche, folter, entführ-, massaker | öldür-, cinayet, katil, silah, tabanca, tüfek, bomba, terör, intihar, ceset, işkence, rehine | qatl, qātil, silāḥ, musaddas, bunduqiyya, qunbula, ḥarb, irhāb, intiḥār, iġtiyāl |
| Aberglaube | horoskop, sternzeichen, wahrsag-, hellseh-, tarot, kaffeesatz, glücksbringer, talisman, amulett, astrolog-, gespenst, halloween, hexe, zauber, magie | fal, falcı, burç, astroloji, medyum, muska, büyücü, cadı, uğursuz, tılsım, hayalet, „nazar boncuğu“, „kahve falı“ | siḥr, sāḥir, kāhin, ʿarrāf, tanǧīm, munaǧǧim, tamīma, ʿafrīt, šabaḥ |
| Zinsgeschäfte | zins-, kredit, darlehen, hypothek, dispo, tagesgeld, festgeld, rendite | faiz, kredi, ipotek, mevduat, tefeci | ribā, „saʿr al-fāʾida“ |
| Hund im Haus | hund, welpe, gassi (nur mit Kontextwort wie wohnung, bett, sofa, haustier, mein) | köpek, köpeğ- (mit ev, oda, yatak, evcil, benim) | kalb, ǧarw (mit bayt, šaqqa, ġurfa) |
| Kleidung, Körper | bikini, minirock, bauchfrei, dessous, sexy, freizügig, busen, hintern, „oben ohne“ | bikini, mayo, dekolte, seksi, „mini etek“, „iç çamaşırı“ | bīkīnī, „malābis dāḫiliyya“ |
| Fluchen | scheiß-, arsch, verdammt, verflucht, idiot, blöd, dumm, depp, trottel, kacke, mist, „oh gott“, „mein gott“ | lan, salak, aptal, gerizekalı, kahrolsun, lanet, şerefsiz, pislik, „allah kahretsin“ | laʿana, malʿūn, ġabiyy, aḥmaq |
| Politik | partei, wahlkampf, wahlplakat, politiker, putsch, cdu, csu, spd, fdp, afd, bsw | parti, siyas-, milletvekili, miting, darbe, akp, chp, mhp, hdp, „seçim kampanyası“ | siyāsa, siyāsī, intiḫābāt, muẓāhara, inqilāb, barlamān |

**Ausnahmen, die keine Treffer sind** (Auswahl): weinen, Weintraube, probieren, getrunken (Tee), Rauchmelder, Drogerie, Sektor,
Meerschweinchen, Waffel, kriegen (bekommen), hundert, Hexenschuss, zauberhaft, Kreditkarte, Freizügigkeit, Vertragspartei;
tr biraz, rakım, esrarengiz, sigara böreği, aşkolsun, elini öpmek (Handkuss bei Älteren), köpek balığı, konserve, mayonez,
muskat, kredi kartı, bahis konusu, doğum günü partisi.

**Arabische Wörter, die ohne Harakat zusammenfallen** (nur Hinweis, kein Befund): sukr/sukkar (Zucker), ḥašīš (Gras), ʿūd
(Holz), kamān (umgangssprachlich „auch“), qubla/qibla (Gebetsrichtung) und qablahu (vor ihm), ġazal/ġazl/ġazāl, ġarām/ġrām
(Gramm), ḥabīb und ḫalīl (Vornamen), ǧins (Gattung; ǧinsiyya Staatsangehörigkeit), siḥr/saḥar, burǧ (Turm), kāhin (Priester),
fāʾida (Nutzen), muṯīr (spannend), ḥizb (Abschnitt der Koranlesung).

### 2.4 Prüfregeln für `lernapp:pruefen`

- **Normalisierung:**
  - de: NFC, casefold (ß → ss); Bindestrich-Wörter auch in Teilen
  - tr: I → ı, İ → i, dann klein; Zirkumflex und Apostroph entfernen
  - ar: wie der Religionswächter (ohne Harakat, Tatweel und Koranzeichen; Alif-Formen → Alif; Alif maqṣūra → Yāʾ;
    Tāʾ marbūṭa → Hāʾ); Klitika wa-, fa-, bi-, li-, ka-, al- abtrennen
- **Prüfarten:** `teil` (irgendwo im Wort, für Komposita wie Rotwein), `anfang` (Wortanfang, für Endungen wie domuzlar), `wort`
  (ganzes Wort), `phrase` (Wortfolge). Ein Wort, das eine Ausnahme enthält, zählt nicht. `phrase_ausnahmen` werden vorher
  aus dem Satz entfernt. `kontext` verlangt ein Kontextwort im selben Satz (Hund).
- **Arabisch ohne arabische Schrift in den Dateien:** Das Werkzeug bildet die Umschrift auf die Wiktionary-Umschrift im Feld
  `rom` von `web/daten/kaikki` ab (ʿ → ʕ, ʾ → ʔ, ǧ → j, ḫ → ḵ, ġ → ḡ; Wortanfang zusätzlich mit ʔ; Nisba -ī auch als -iyy).
  Es nimmt nur Seitentitel und Plural als Muster, keine Stammformen, und vergleicht ganze Wörter; Wortanfänge erst ab fünf
  Buchstaben. Die Muster entstehen zur Laufzeit und stehen nie in einer Datei der Werkstatt oder des Rahmens.
- **Register aus kaikki:** Wörter mit `mk` vulgar, offensive, derogatory, slur, pejorative, ethnic oder sexual gelten
  automatisch als Treffer (Kernauszug: de 417, tr 96, ar 36 Einträge, Beleg S7 §3.7).
- **Ergebnis:**
  - `verboten` → schwerer Befund an Menschen; Vorschlag für L3: Der Eintrag bleibt `menschlich_klaeren`, bis die Redaktion
    entscheidet.
  - `nur_sachlich` → Befund, wenn die Stufe zu niedrig ist, die Einheit kindgeeignet ist oder der Satz die Sache als
    Normalität zeigt; sonst Hinweis.
  - `offene_frage` → wie der Standard.
- **Grenzen:** Es ist ein Stichwort-Indikator mit Fehlalarmen und Lücken (S7 R5). Endgültig entscheiden KI-Gegenprüfung,
  Redaktion und Muttersprachler-Stichprobe.

## 3 Erlaubte Alltagsthemen

Die Rahmenpläne (`rahmen/{de,tr,ar}.rahmen.json`) ordnen die Einheiten diesen Themen zu. Wortfeld-Beispiele zeigen nur die
Richtung; maßgeblich sind Häufigkeit und Rahmenplan.

| Thema | Stufen | Kind | Hinweise | Wortfeld de / tr / ar |
|---|---|---|---|---|
| Begrüßung und Vorstellung | A1–A2 | ja | Nur weltliche Grüße; religiöse Grußformeln sind gesperrte Kandidaten (§4). | Name, Land, Sprache / ad, ülke, dil / ism, balad, luġa |
| Familie und Verwandte | A1–B1 | ja | tr und ar unterscheiden mütterliche und väterliche Seite; Trennung erst ab B2. | Mutter, Bruder, Großvater / anne, kardeş, dede / umm, aḫ, ǧadd |
| Zahlen, Uhrzeit, Datum | A1 | ja | Geburtstag als Datum (OF-07); islamische Monatsnamen nur Kandidat R-13. | Uhr, Woche, Monat / saat, hafta, ay / sāʿa, usbūʿ, šahr |
| Wetter und Jahreszeiten | A1–A2 | ja | Mond auf Bildkarten nur als Kreis. | Regen, Sonne, Winter / yağmur, güneş, kış / maṭar, šams, šitāʾ |
| Wohnen | A1–B2 | ja | Alle helfen im Haushalt; ab B2 Mietvertrag und Mietrecht. | Wohnung, Küche, Miete / ev, mutfak, kira / šaqqa, maṭbaḫ, īǧār |
| Einkaufen und Preise | A1–A2 | ja | Keine Marken; Etikett lesen ab A2 (Schwein-Regel). | Preis, Kasse, Tüte / fiyat, kasa, poşet / siʿr, sūq, kīs |
| Essen und Trinken (halal-neutral) | A1–B1 | ja | Fleischart immer nennen (Rind, Lamm, Hähnchen, Pute, Fisch); Getränke Wasser, Tee, Saft, Ayran, Milch; kein Alkohol, kein Schwein, keine Halal-Kennzeichnung (OF-13), kein Tischgebet; drei Küchen gleichwertig. | Brot, Reis, Linsen / ekmek, pilav, mercimek / ḫubz, ruzz, ʿadas |
| Kleidung | A1–A2 | ja | Neutral, ohne Wertung; Kopftuch OF-08. | Jacke, Schuhe, Mantel / ceket, ayakkabı, palto / sutra, ḥiḏāʾ, miʿṭaf |
| Körper und Gesundheit | A1–B2 | ja | Körperteile ohne Intimbereich, Arzt, Apotheke, Notruf; ab B1 Vorbeugung; ab B2 Versicherung und Pflege. | Kopf, Arzt, Apotheke / baş, doktor, eczane / raʾs, ṭabīb, ṣaydaliyya |
| Schule und Lernen | A1–B1 | ja | Fächer ohne Musik (OF-01); Elterngespräch, Zeugnis. | Heft, Lehrerin, Pause / defter, öğretmen, teneffüs / daftar, muʿallima, istirāḥa |
| Arbeit und Berufe | A1–C1 | ja | Berufe für alle (G-09); ab B1 Bewerbung, ab B2 Arbeitsvertrag und Arbeitsrecht. | Beruf, Werkstatt, Kollegin / meslek, atölye, işçi / mihna, warša, zamīla |
| Verkehr und Unterwegssein | A1–B1 | ja | Schulweg, Fahrkarte, Führerschein (B1). | Bus, Fahrkarte, Bahnhof / otobüs, bilet, istasyon / ḥāfila, taḏkira, maḥaṭṭa |
| Behörden und Formulare | A2–C1 | ja | Einrichtungen allgemein benannt; Aufenthalt und Einbürgerung sachlich. | Formular, Termin, Ausweis / form, randevu, kimlik / istimāra, mawʿid, hawiyya |
| Bank und Post | A2–B2 | ja | Konto, Überweisung, Paket; Zinsen erst ab B2 sachlich. | Konto, Brief, Paket / hesap, mektup, paket / ḥisāb, risāla, ṭard |
| Stadt und Orientierung | A1–A2 | ja | Bäckerei, Bibliothek, Rathaus, Park; Gotteshäuser nur Kandidaten (OF-06). | Straße, Brücke, Rathaus / sokak, köprü, belediye / šāriʿ, ǧisr, baladiyya |
| Natur und Umwelt | A1–C1 | ja | Mülltrennung, Energie sparen; Klima ab B1 sachlich, ohne Parteien. | Baum, Fluss, Müll / ağaç, nehir, çöp / šaǧara, nahr, qumāma |
| Tiere | A1–A2 | ja | Ohne Bildkarten; kein Schwein; Haustiere nach OF-03. | Katze, Schaf, Vogel / kedi, koyun, kuş / qiṭṭa, ḫarūf, ṭāʾir |
| Sport | A1–B1 | ja | Keine echten Vereine oder Sportler; Sportkleidung neutral. | Ball, Mannschaft, Schwimmbad / top, takım, havuz / kura, farīq, masbaḥ |
| Hobbys und Freizeit (ohne Musik) | A1–B1 | ja | Lesen, Wandern, Kochen, Backen, Gärtnern, Malen (Landschaften, Muster), Basteln, Handarbeit, Fotografieren in der Natur, Ausflüge, Schach, Puzzle; Würfelspiele OF-04. | Buch, Garten, Ausflug / kitap, bahçe, gezi / kitāb, ḥadīqa, nuzha |
| Medien und Digitales (sachlich) | A2–C1 | ja | Keine Marken; Sicherheit im Netz; keine Fremden im Netz, keine Geheimnisse vor den Eltern. | Handy, Nachricht, Passwort / telefon, mesaj, şifre / hātif, ḫabar, ḥāsūb |
| Reisen und Besuch | A2–B1 | ja | Verwandtenbesuch in Deutschland, der Türkei und arabischen Ländern gleichwertig, ohne Politik; Pilgerfahrt nur Kandidat R-12. | Koffer, Flughafen, Reise / bavul, havalimanı, yolculuk / ḥaqība, maṭār, safar |
| Nachbarschaft | A2–B1 | ja | Hausordnung, Ruhezeiten, Hilfe, Einladung zum Tee. | Nachbarin, Treppe, Hilfe / komşu, merdiven, yardım / ǧāra, daraǧ, musāʿada |
| Ehrenamt | B1–C1 | ja | Verein, Feuerwehr, Nachhilfe, Lebensmittelausgabe; nie als Aufruf (G-07); Ehrenamt in der Moschee nur Kandidat. | Verein, Feuerwehr, Nachhilfe / dernek, itfaiye, gönüllü / ǧamʿiyya, mutaṭawwiʿ, taṭawwuʿ |
| Familienfeste | A2–B1 | ja | Hochzeit, Geburt, Einzug, Zeugnis, Besuch mit Geschenk; ohne Musik, Tanz, Alkohol; Geburtstag OF-07; religiöse Feste nur Kandidaten. | Hochzeit, Geschenk, Gast / düğün, hediye, misafir / ʿurs, hadiyya, ḍayf |
| Gefühle und Freundschaft | A1–B1 | ja | Trösten, Streit friedlich lösen, sich entschuldigen; keine Smiley-Bildkarten. | froh, traurig, Freundin / mutlu, üzgün, arkadaş / saʿīd, ḥazīn, ṣadīq |
| Ausbildung und Bewerbung | B1–B2 | ja | Lebenslauf, Praktikum, Vorstellungsgespräch, Studium. | Lebenslauf, Praktikum, Bewerbung / özgeçmiş, staj, başvuru / tadrīb, ṭalab, muqābala |
| Verträge und Rechte | B2–C1 | nein | Mietvertrag, Arbeitsvertrag, Versicherung, Verbraucherrechte, Fristen; ohne Empfehlung. | Vertrag, Kündigung, Versicherung / sözleşme, fesih, sigorta / ʿaqd, fasḫ, taʾmīn |
| Zusammenleben | B2–C1 | nein | Generationen, Mehrsprachigkeit, Inklusion, Rücksicht; Vielfalt ohne Wertung, ohne Parteien. | Generation, Rücksicht, Mehrsprachigkeit / kuşak, saygı, hoşgörü / ǧīl, iḥtirām, taʿāyuš |
| Wissenschaft und Technik | B1–C1 | ja | Erfindungen, Medizin, Energie, Raumfahrt, Programmieren. | Forschung, Energie, Erfindung / araştırma, enerji, buluş / baḥṯ, ṭāqa, iḫtirāʿ |
| Geschichte und Kultur | B2–C1 | nein | Bauwerke, Handwerk, Alltagsgeschichte, Literatur, Sprichwörter; Kriege nur als Zeitangabe; keine Religionsgeschichte. | Museum, Handwerk, Sprichwort / müze, zanaat, atasözü / matḥaf, ḥirfa, maṯal |
| Staat und Gemeinde (sachlich) | B1–C1 | ja | Nur nach OF-10: Grundrechte, Gericht, Gemeinde, Wahl als Verfahren; ohne Parteien, Personen, Streitfragen. | Gesetz, Gericht, Gemeinde / yasa, mahkeme, belediye / qānūn, maḥkama, baladiyya |

## 4 Religionsbezug in den Sprachkursen

Religion ist kein Lernthema (KERN §2.1 Nr. 1). Moschee, Gebet, Fasten und Feste kommen höchstens als Orte und Ereignisse
des Alltags vor – und nur als markierte Kandidaten.

**Regeln:**
1. Jeder Eintrag mit einem Begriff aus §4.1 oder §4.2 trägt `religionsbezug: true`.
2. Markierte Einträge brauchen zwei religiöse Freigaben zum aktuellen Inhalts-Hash (KERN §2.3, ADR 0040 Nr. 5). Bis dahin sind
   sie unsichtbar, auch über `lernapp_ungeprueft`. Die Sprachstichprobe ersetzt das nie (ADR 0041 Nr. 11).
3. Keine Sprachausgabe für markierte Einträge (KERN §4).
4. Nie Lernziel: keine Pflichtaufgabe, kein Prüfstein, nicht in der Einstufung, nicht im Lemma-Budget. Jede Lektion ist ohne
   sie vollständig.
5. Nur die Sache als Ort oder Termin („Am Freitag geht der Vater zur Moschee“ ist ein Kandidat). Keine Glaubensinhalte,
   Begründungen, Regeln der Religionsausübung, keine Wertung anderer Religionen.
6. Kein Koran- oder Hadithwortlaut, keine Bittgebete (KERN §2.2 Nr. 9); der Wächter prüft 4-Gramme (KERN §3 b/c).
7. Tatoeba-Sätze mit Religionsbezug werden standardmäßig ausgeschlossen (S7-E3). kaikki-Einträge mit Thema Religion sind
   Kandidaten für das Formel-Lexikon des Wächters (S7-E5).

### 4.1 Orte und Ereignisse (Kandidaten)

| ID | Art | de | tr | ar (Umschrift) | ab | Hinweis |
|---|---|---|---|---|---|---|
| R-01 | Ort | Moschee | cami | masǧid | A2 | Ort im Stadtplan, Treffpunkt |
| R-02 | Ort | Kirche, Synagoge | kilise, sinagog | kanīsa, kanīs | A2 | gleich behandelt wie R-01 (OF-06) |
| R-03 | Ereignis | Gebet, Freitagsgebet | namaz, cuma namazı | ṣalāh, ṣalāt al-ǧumʿa | A2 | nur als Termin im Tagesablauf |
| R-04 | Zeit | Ramadan, Fasten | ramazan, oruç | ramaḍān, ṣawm | A2 | nur als Zeitraum |
| R-05 | Ereignis | Fastenbrechen | iftar, sahur | ifṭār, suḥūr | A2 | Familienessen, Einladung |
| R-06 | Fest | Ramadanfest, Opferfest | Ramazan Bayramı, Kurban Bayramı | ʿīd al-fiṭr, ʿīd al-aḍḥā | A2 | Familienfest, Besuch, Geschenk |
| R-07 | Fest | Kandil-Nacht | kandil | – | B1 | nur Türkisch |
| R-08 | Kalender | Weihnachten, Ostern, Pfingsten | Noel, Paskalya | ʿīd al-mīlād, ʿīd al-fiṣḥ | A2 | Ferien- und Feiertagsnamen (OF-05); ʿīd al-mīlād heißt auch „Geburtstag“ |
| R-09 | Speise | halal | helal | ḥalāl | A2 | Kennzeichnung beim Einkauf (OF-13) |
| R-10 | Beruf | Imam, Pfarrer | imam, hoca | imām | A2 | nur in Berufslisten; tr hoca auch „Lehrer“ |
| R-11 | Unterricht | Koranunterricht | Kuran kursu | – | A2 | nur als Wochentermin von Kindern, kein Inhalt |
| R-12 | Reise | Pilgerfahrt | hac, umre | ḥaǧǧ, ʿumra | B1 | nur als Familienereignis |
| R-13 | Kalender | islamische Monatsnamen | hicri aylar | aš-šuhūr al-hiǧriyya | B1 | nur als Kalenderangabe |

### 4.2 Formel-Kandidaten für LM-09 (gesperrt)

Nur Begriffe: arabisch die üblichen Namen der Formeln in Umschrift, türkisch und deutsch die festen Ausdrücke in Lateinschrift.
Kein arabischer Wortlaut, keine Übersetzung. „Anlass“ nennt nur die Gebrauchssituation. Freigabe der Liste als Ganzes mit zwei
Freigaben (LM-09); jede Änderung setzt zurück. Keine Sprachausgabe. Die arabischen Einträge des Wächter-Lexikons schreibt kein
Agent (KERN §3 a).

| ID | Begriff | Art | Anlass | Vorschlag |
|---|---|---|---|---|
| F-ar-01 | Salām (Gruß und Erwiderung) | Gruß | Begegnung, Abschied | prüfen |
| F-ar-02 | Basmala, nur Kurzform | Beginn | vor dem Essen, vor einer Arbeit | prüfen; die volle Form fällt voraussichtlich unter das Koran-N-Gramm |
| F-ar-03 | Ḥamdala | Dank | Frage nach dem Befinden; nach dem Essen | prüfen |
| F-ar-04 | Inšāʾallāh | Zukunft | Pläne, Verabredungen | prüfen |
| F-ar-05 | Māšāʾallāh | Bewunderung | Lob für Kinder, Arbeit, Erfolg | prüfen |
| F-ar-06 | Bārakallāh | Segenswunsch | Dank, Glückwunsch | prüfen |
| F-ar-07 | Ǧazākallāh | Dank | Dank für Hilfe | prüfen |
| F-ar-08 | Tasbīḥ (Subḥānallāh) | Staunen | Natur, Ereignis | eher nicht |
| F-ar-09 | Istiġfār | Abwehr, Bescheidenheit | nach einem Fehler; Lob zurückweisen | eher nicht |
| F-ar-10 | Tašmīt | Wunsch | wenn jemand niest | prüfen |
| F-ar-11 | Taʿziya-Formel | Beileid | Trauerfall | prüfen, erst ab B1 |
| F-ar-12 | ʿĪd-Gruß | Festgruß | Ramadanfest, Opferfest | prüfen |
| F-ar-13 | Ramaḍān-Gruß | Festgruß | Beginn des Ramadan | prüfen |
| F-ar-14 | Ǧumʿa-Gruß | Gruß | Freitag | eher nicht |
| F-ar-15 | Takbīr | Ausruf | Freude, Fest | nicht aufnehmen |
| F-ar-16 | Ḥawqala | Ausruf | Schwierigkeit | nicht aufnehmen (lange Formel, N-Gramm wahrscheinlich) |
| F-ar-17 | Qasam (Schwurformel) | Schwur | Beteuerung | nicht aufnehmen |
| F-tr-01 | selamün aleyküm / aleyküm selam | Gruß | Begegnung | prüfen |
| F-tr-02 | bismillah | Beginn | vor dem Essen, vor einer Arbeit | prüfen |
| F-tr-03 | elhamdülillah, çok şükür, Allah'a şükür | Dank | Frage nach dem Befinden | prüfen |
| F-tr-04 | inşallah | Zukunft | Pläne, Verabredungen | prüfen |
| F-tr-05 | maşallah | Bewunderung | Lob | prüfen |
| F-tr-06 | Allah razı olsun | Dank | Dank für Hilfe | prüfen |
| F-tr-07 | Allahaısmarladık | Abschied | beim Gehen, vor allem Ältere | prüfen |
| F-tr-08 | Allah'a emanet ol | Abschied | vor einer Reise | eher nicht |
| F-tr-09 | Allah rahmet eylesin | Beileid | Trauerfall | prüfen, erst ab B1 |
| F-tr-10 | hayırlı cumalar | Gruß | Freitag | eher nicht |
| F-tr-11 | bayramınız mübarek olsun, iyi bayramlar, hayırlı ramazanlar, kandiliniz mübarek olsun | Festgruß | religiöse Feste und Zeiten | prüfen |
| F-tr-12 | helal olsun, hakkını helal et | Lob, Bitte | Lob für Leistung; Abschied | prüfen |
| F-tr-13 | estağfurullah | Höflichkeit | Lob oder Entschuldigung zurückweisen | prüfen |
| F-tr-14 | Allah korusun, Allah kolaylık versin | Wunsch | Sorge, schwere Arbeit | eher nicht |
| F-tr-15 | vallahi, billahi | Schwur | Beteuerung | nicht aufnehmen |
| F-de-01 | Gott sei Dank | Erleichterung | Erleichterung | eher nicht (weltlich „zum Glück“) |
| F-de-02 | Grüß Gott | Gruß | regional in Süddeutschland | nur passiv ab B2 |
| F-de-03 | um Gottes willen, Gott behüte | Ausruf | Schreck | nicht aufnehmen |
| F-de-04 | Frohe Weihnachten, Frohe Ostern | Festgruß | christliche Feste in Deutschland | nach OF-05 |
| F-de-05 | inschallah (Lehnwort) | Zukunft | Jugendsprache | nicht aufnehmen |

**Nicht aufgenommen:** Šahāda (Bekenntnisformel), Taʿawwuḏ (gehört zur Rezitation), Istirǧāʿ (Koranwortlaut, KERN §2.2 Nr. 9),
Taṣliya (Eulogie nach dem Prophetennamen; der Name kommt in Sprachkursen nicht vor).

### 4.3 Weltliche Alternativen (sofort erlaubt, ohne Markierung)

Sie tragen die Lernziele, solange die Formeln gesperrt sind.
- de: Guten Tag, Hallo, Auf Wiedersehen, Tschüss, Danke, Gesundheit!, Guten Appetit, Gute Besserung, Herzlichen Glückwunsch,
  Mein Beileid, zum Glück, hoffentlich
- tr: Merhaba, Günaydın, İyi günler, Hoşça kal, Güle güle, Teşekkürler, Afiyet olsun, Geçmiş olsun, Kolay gelsin, Tebrikler,
  Başınız sağ olsun, umarım
- ar: marḥaban, ahlan, ṣabāḥ al-ḫayr, masāʾ al-ḫayr, maʿa s-salāma, šukran, ʿafwan, bi-l-hanāʾ wa-š-šifāʾ, šifāʾan ʿāǧilan,
  mabrūk, aḥarr at-taʿāzī

## 5 Bildkarten

Nur Gegenstände und Symbole; keine Menschen- und Tierdarstellungen, keine Fotos, keine Gesichter (KERN §5, L0-E16, O-4). Die
Motivliste gibt die Redaktion frei (LM-34). Stil nach KERN §7, Entscheidung in L2.

**Verboten:**
- Menschen, auch Strichfiguren, Silhouetten, Piktogramm-Figuren und Körperteile (Hand, Auge, Fuß)
- Tiere, auch stilisiert; Fotos
- Gesichter, auch Smileys, Emojis mit Gesicht, Sonne oder Mond mit Gesicht
- religiöse Symbole und Gebäude (Kreuz, Mondsichel, Stern als Bekenntnis, Moschee, Kirche, Kaaba)
- Flaggen, Wappen, Landkarten mit Grenzen; Marken, Logos, Geldscheine mit Porträt
- Gegenstände der Tabu-Kategorien: Weinglas, Bierflasche, Zigarette, Shisha, Spielkarten und Würfel (bis OF-04), Waffen,
  Musikinstrumente, Tierkreiszeichen, Nazar-Perle, Wurst ohne Angabe
- Mondsichel auch als Wettersymbol (KERN 3.0); Mond nur als Kreis
- rotes Kreuz für Krankenhaus; stattdessen „H“-Schild oder Arztkoffer ohne Kreuz

**Ohne Bild:** Wörter ohne zulässiges Motiv (Personen, Berufe, Tiere, Gefühle, Körperteile, Abstrakta) werden mit Text und Hören
geübt (`auswahl`, `hoeren_waehlen`, `paare`), nicht mit `bild_wort`. Der Alternativtext erscheint erst nach der Antwort (PLAN §4).

**Prüfung:** `web/inhalte/lernapp/symbole/symbole.json` trägt je Motiv `motiv`, `quelle`, `lizenz` und `freigegeben`. Ein Motiv
ohne Freigabe blockiert den Import.

**Motivliste (Vorschlag für LM-34):**

| Gruppe | Motive |
|---|---|
| Wohnen | Haus, Tür, Fenster, Schlüssel, Tisch, Stuhl, Bett, Lampe, Sofa, Schrank, Kühlschrank, Herd, Waschmaschine, Teppich |
| Schule | Buch, Heft, Bleistift, Kugelschreiber, Schere, Lineal, Schultasche, Tafel, Taschenrechner, Globus ohne Grenzlinien |
| Essen | Brot, Apfel, Banane, Tomate, Gurke, Karotte, Zwiebel, Kartoffel, Schale Reis, Käse, Ei, Milch, Teeglas, Teekanne, Wasserglas, Saftflasche, Teller, Löffel, Gabel, Topf |
| Kleidung | Jacke, Hose, Kleid, Hemd, Schuhe, Mütze, Schal, Handschuhe, Regenschirm |
| Verkehr | Bus, Zug, Straßenbahn, Fahrrad, Auto, Flugzeug, Schiff, Ampel, Haltestellenschild, Fahrkarte |
| Natur, Wetter | Sonne, Wolke, Regen, Schneeflocke, Blitz, Wind, Baum, Blume, Blatt, Berg, Welle, Mond als Kreis |
| Zeit | Uhr, Wecker, Kalender, Sanduhr |
| Gesundheit | Thermometer, Pflaster, Tablettenschachtel, Arztkoffer, Krankenwagen, Zahnbürste, Seife |
| Arbeit | Hammer, Schraubenzieher, Laptop, Telefon, Briefumschlag, Paket, Ordner, Werkzeugkasten |
| Einkaufen | Einkaufswagen, Tüte, Geldbörse, Münze, Bankkarte, Kasse, Preisschild |
| Freizeit | Ball, Fußballtor, Fahrradhelm, Rucksack, Zelt, Kamera, Puzzleteil, Pinsel, Gießkanne |
| Stadt | Rathaus allgemein, Brücke, Sitzbank, Briefkasten, Krankenhaus-Schild „H“ |

## 6 Kinder

Kinder sind unter 16 (KERN §5); die Kurse richten sich an Lernende ab etwa 10 Jahren.

| Stufe | Inhalte |
|---|---|
| A1, A2, B1 | kindgeeignet (Pflicht) |
| B2, C1 | Erwachsenenthemen sachlich |

- **Kennzeichnung:** Feld `kindgeeignet` je Einheit. A1–B1 immer `true`, sonst blockiert der Prüfer. B2–C1 standardmäßig
  `false`; `true` nur, wenn alle Einträge die Kinderregeln erfüllen. Wie die App B2/C1 für Kinderkonten zeigt, entscheidet L7
  (OF-15).
- **Kinderregeln:**
  - Nichts, was Angst macht: keine Verletzten, Gewalt, Katastrophen oder Krankheiten im Detail.
  - Keine Geheimnisse vor den Eltern, keine Treffen mit Fremden, keine Kontakte zu Unbekannten im Netz.
  - Keine Mutproben, nichts zum gefährlichen Nachahmen (Feuer, Medikamente, Straße, Strom).
  - Keine Bewertung von Körper, Gewicht oder Aussehen; keine Diäten.
  - Kein Konsumdruck, keine Marken.
  - Erwachsene verhalten sich vorbildlich; Konflikte enden friedlich.
  - Keine Liebesbeziehungen, auch nicht unter Jugendlichen.
  - Krankheit und Abschied nur leicht und mit Trost; Tod und Trauer erst ab B1 ohne Einzelheiten (OF-17).
  - Keine Ironie und kein Sarkasmus unter B2.
  - „Nur sachlich“ gilt in kindgeeigneten Einheiten nur für Vorbeugung, Sicherheit und Hilfe (Gesundheit, Verkehr, Notruf,
    Etikett lesen), nie mit Beschreibung von Konsum oder Tat.
- **Erwachsenenthemen ab B2 (sachlich):** Arbeitsvertrag, Kündigung, Arbeitsrecht; Mietvertrag, Mietrecht,
  Nebenkostenabrechnung; Versicherung, Steuern, Rente; Verbraucherrechte, Kredit und Zinsen; Pflege von Angehörigen; Trennung
  und Sorgerecht (OF-17); Gericht und Behördenverfahren; Nachrichten über Unfälle und Kriminalität in ruhigem Ton.

## 7 Offene Fragen für Menschen

Alle laufen mit ihrem Standard weiter (L3-E12, kein Warten). Sie gehören zu LM-09, soweit nicht anders vermerkt.

| ID | Frage | Standard | Wer |
|---|---|---|---|
| OF-01 | Darf Musik vorkommen? Reicht „Musik“ passiv ab B2? Darf das Schulfach Musik im Stundenplan stehen? | Kein Lernthema; „Musik“ nur passiv ab B2; Stundenpläne ohne Musik; Audio ohne Musik und Jingles; Rückmeldetöne als kurze Signaltöne ohne Melodie (Vorschlag für L2) | Hoca / Vorstand |
| OF-02 | Hochzeiten und Familienfeste mit Musik oder Volkstanz (Halay)? | Feste ja, ohne Musik und Tanz | Hoca / Vorstand |
| OF-03 | Hund als Haustier im Haus? | Nein; Hund nur draußen sachlich ab A2; Haustiere: Katze, Wellensittich, Fische, Schildkröte | Hoca / Vorstand |
| OF-04 | Welche Spiele: Schach, Tavla, Würfel- und Kartenspiele? | Schach, Puzzle, Brettspiele ohne Würfel ja; Tavla, Würfel, Spielkarten nein | Hoca / Vorstand |
| OF-05 | Feiertage anderer Religionen und weltliche Bräuche (Weihnachts- und Osterferien, Karneval, Halloween, Valentinstag, Silvester)? | Sommer-, Herbst-, Winter-, Frühjahrsferien; christliche Festnamen nur Kandidaten R-08; Karneval, Halloween, Valentinstag, Silvesterfeier nicht; Neujahr als Datum ja | Hoca / Vorstand |
| OF-06 | Gotteshäuser und religiöse Ereignisse (R-01…R-13) überhaupt, und für alle Religionen gleich? | Ja, nur markiert mit zwei Freigaben; bis dahin unsichtbar; Lektionen ohne sie vollständig | zwei Personen mit `religioese_pruefung` (LM-03) |
| OF-07 | Geburtstag nur als Datum und Glückwunsch oder auch als Feier? | Datum und Glückwunsch; keine Geburtstagsfeier als Szene | Hoca / Vorstand |
| OF-08 | Kopftuch als Kleidungswort; Kleidung beim Schwimmen | Kopftuch neutral, ohne Wertung und ohne religiöse Begründung, nicht markiert; Figuren mit und ohne Kopftuch gleichwertig; Badekleidung nicht beschreiben | Hoca / Vorstand |
| OF-09 | Ausschluss religiös gebundener Namen richtig? Wie Namen realer Gemeindemitglieder vermeiden? | Liste wie im Entwurf; die Redaktion meldet Treffer ohne Personendaten an Agenten, betroffene Namen werden ersetzt | Redaktion / Vorstand |
| OF-10 | Staatskunde sachlich ab B1? | Ja, ohne Parteien, Personen, Streitfragen | Vorstand |
| OF-11 | Alkohol und Rauchen als Vokabel sachlich ab B1? | Ja, nie als Normalität | Hoca / Vorstand |
| OF-12 | Zinsen, Kredite, Versicherungen sachlich ab B2; Kreditkarte als Zahlungsmittel ab A2? | Ja; keine Figur nimmt Zinskredite auf; keine Empfehlungen | Hoca / Vorstand |
| OF-13 | Schwein als Vokabel beim Etikettlesen ab A2; „halal/helal“ beim Einkauf? | Schwein nur sachlich ab A2 im Satzmuster Etikett/Nachfrage; „halal/helal“ nur Kandidat R-09 | Hoca / Vorstand; R-09 mit zwei Freigaben |
| OF-14 | Welche Formeln, ab welcher Stufe, in welchen Richtungen (z. B. arabische Formeln im Deutschkurs für Arabischsprachige)? | Alle gesperrt; weltliche Alternativen tragen die Lernziele | zwei Personen mit `religioese_pruefung` |
| OF-15 | Sollen Kinderkonten B2/C1-Einheiten sehen? | Ja, mit Hinweis „für Erwachsene“; Sperre wird in L7 entschieden | Vorstand / Bildung |
| OF-16 | Freundschaften zwischen Mädchen und Jungen in Kinderdialogen | Gemischte Klassen und Gruppen sachlich; enge Freundschaften unter Mädchen bzw. unter Jungen | Hoca / Vorstand |
| OF-17 | Ab welcher Stufe Tod und Trauer, Trennung und Sorgerecht? | Krankheit leicht ab A1; Tod und Trauer ab B1 ohne Einzelheiten; Trennung und Sorgerecht ab B2 sachlich | Bildung / Vorstand |
| OF-18 | Wie über Flucht, Krieg und Herkunftsländer sprechen? | Flucht und Migration nur sachlich (Ankommen, Behörden, Sprache); keine Kriegsschilderung, keine Konfliktparteien; Herkunftsländer als Reiseziel und Familienort | Vorstand / Bildung |

## 8 Messung (Stand 16.10.2026)

Gemessen mit einem Skript im Scratchpad des Orchestrators (`l3-leitfaden/messen.py`, `python3 -I`; Übernahme nach
`_lernapp/werkzeuge/` in L3) auf den S7-Auszügen (Beleg S7 §3.7). Die Zahlen stehen auch in `leitfaden.json` → `messung`.
Treffer sind Indikatoren mit Fehlalarmen (Tatoeba enthält z. B. viele Sätze über Musik und Hunde). Sie zeigen den Umfang der
Durchsicht, nicht die Zahl der Verstöße.

**Umfang:** 13 Kategorien; Formen je Sprache zusammen de 246, tr 153, ar 85 (dazu 17 mehrdeutige arabische Wörter); 31 Themen;
13 Orte und Ereignisse; 37 Formel-Kandidaten (ar 17, tr 15, de 5); 18 offene Fragen.

**Namen:** de 26 weiblich / 28 männlich, tr 28 / 32, ar 25 / 27; Familiennamen de 14, tr 14, ar 12. 0 doppelt, 0 Treffer im
Tabu-Lexikon.

**Tatoeba-Satzauszug (Sätze mit mindestens einem Treffer):**

| Sprache | Sätze | mit Treffer | größte Kategorien |
|---|---|---|---|
| deu | 23.106 | 774 (3,3 %) | Musik/Tanz 267, Alkohol/Rauschmittel 161, Gewalt/Waffen 101, Fluchen 83, Beziehungen 72 |
| tur | 22.586 | 858 (3,8 %) | Musik/Tanz 238, Beziehungen 183, Alkohol/Rauschmittel 153, Gewalt/Waffen 92, Fluchen 68, Politik 51 |
| ara | 4.649 | 120 (2,6 %) | Alkohol/Rauschmittel 30, Hund 28, Musik/Tanz 18, Gewalt/Waffen 17 |

Die Zahlen ergänzen den Standardfilter S7-E3. Der Inhaltsindikator in S7 §3.3 zählte mit weniger Kategorien 347 von 22.316
de↔tr-Paaren (ohne Religion); der Leitfaden erfasst zusätzlich Musik, Beziehungen, Fluchen, Aberglaube, Zins, Hund, Kleidung
und Politik.

**Häufigkeitslisten (wordfreq 3.1.1, Treffer über alle Kategorien summiert; ein Wort kann in zwei Kategorien zählen):**

| Liste | Top 5.000 | Top 20.000 |
|---|---|---|
| de | 68 | 313 |
| tr | 74 | 240 |
| ar | 52 | – |

Beispiele aus de Top 5.000: musik, party, konzert, krieg, waffe, partei, zinsen, kredit, hund. Nach der Feinjustierung sind
keine offensichtlichen Fehlalarme mehr unter den Top 5.000 im Deutschen (vorher u. a. „probieren“, „getrunken“, „geknackt“, „Medizinstudentin“,
„Magazins“). Im Türkischen bleibt „parti“ mehrdeutig (Partei oder Feier); Treffer gehen an Menschen.

**Arabische Umschrift gegen kaikki (Kernauszug top-20000, Feld `rom`):**
- Tabu-Wörter: 52 von 81 gefunden; mehrdeutige Wörter 17 von 17; Kontextwörter 4 von 4; Wortfeld-Beispiele der Themen 88 von 93.
- Nicht gefunden sind vor allem Lehnwörter und seltene Wörter (z. B. wiskī, kāzīnū, bīkīnī, ġītār, tanǧīm, ribā; Themen:
  miʿṭaf, ḫarūf, mutaṭawwiʿ, taṭawwuʿ, fasḫ). Das Werkzeug sucht sie in L3 in den vollen kaikki-Auszügen; was fehlt, prüft die
  Sprachprüfung (LM-01). Die vollständige Liste steht in `messung.arabisch_umschrift.nicht_gefunden`.

## 9 Übergabe an L3

1. **Prüfer `lernapp:pruefen`:** liest `leitfaden.json` (`tabu.kategorien[].formen`, `pruefung`), meldet Befunde nach §2.4 und
   prüft `kindgeeignet` je Einheit (§6). Die arabischen Muster entstehen zur Laufzeit aus `web/daten/kaikki`.
2. **Religionswächter (KERN §3 a):** Die deutschen und türkischen Begriffe aus §4.1 und §4.2 sind Kandidaten für das
   Formel-Lexikon; die arabischen Einträge liefert die religiöse Prüfung bzw. `web/daten/**`, nie ein Agent.
3. **Entwurfs-Briefing (PLAN §6.3, Phase E):** Grundsätze G-01…G-14, Namensliste, Themen und die Kinderregeln stehen in jedem
   Briefing; dazu der Hinweis, dass Formeln und Orte mit Religionsbezug nur markiert und nie als Lernziel entstehen.
4. **Rahmenpläne de/tr/ar:** ordnen Einheiten den Themen aus §3 zu; Kann-Beschreibungen eigen formuliert, „orientiert am GER
   (Europarat 2001/2020)“ (LM-36), ohne Musik als Thema (OF-01).
5. **Bildkarten (L2):** Motivliste §5 an die Redaktion (LM-34).
6. **Schema:** Ein JSON-Schema für `leitfaden.json` entsteht mit den übrigen Schemas (`pnpm lernapp:schemas`).
