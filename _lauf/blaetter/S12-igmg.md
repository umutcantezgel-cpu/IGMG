S12 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt „IGMG Dachverband“ · Schwierigkeit 1

# Seitenblatt S12: IGMG Dachverband (/igmg)

Stand 2026-10-11. Kürzel: dc = IGMGInfo.dc.html (Design; Template Z. 9–112, Script Z. 113–137). tsx = IGMGInfo.tsx (Bestand, Ordner uploads/igmg-wetzlar-website/src/app/components/). lb = 00 Laufbuch.dc.html. rm = readme.md. Zahl = Zeile. Bei tsx stehen die drei Zahlen in der Reihenfolge de / tr / en. Zahlenkacheln: Bezeichnung in der Spalte, Wert in der Fundstelle (dt/dd). Schlüssel sind abgeleitete Vorschläge. Anführungszeichen sind im Design typografisch („ “), im Bestand gerade; der Wortlaut ist gleich.

## SEITE

IGMG Dachverband, Plan-Nr. 04.5 (lb:164; Plan-Status fertig nach Standardwert, lb:144). Design-Artboard mit data-screen-label „04.5 IGMG Dachverband“ (dc:15). Bestand-Komponente IGMGInfo (tsx:26). Informationsseite ohne Formular: fünf Themen-Tabs, vier Organisationskarten und die Kontaktdaten der Zentralverwaltung (dc:20–107).

## ROUTE

/igmg (Auftrag; K-03). Deutsch ohne Präfix; tr und en mit Präfix /tr bzw. /en (K-02). Lokalisierter Pfadname für tr und en: – (nur DE in Quelle; K-03 nennt keinen Wert). Einstieg: Header-Untermenü „Moschee“ (lb:307).

## QUELLEN

- dc: vollständig gelesen, 139 Zeilen (Template, Script mit TABS, renderVals, Datenlisten history und tiers).
- tsx: vollständig gelesen, 477 Zeilen (Texte in t.de, t.tr, t.en; Ternaries für Labels; Kontaktwerte fest im JSX).
- rm: vollständig gelesen (Z. 1–44), besonders rm:3 (Namen der vier Organisationen), rm:13 (Platzhalter), rm:23 (Organisationen), rm:28 (Icons).
- lb: vollständig gelesen (Z. 1–324), besonders Plan lb:164, Entscheidungen lb:182–193, Logos lb:34, Liste für Menschen lb:224–251, Textänderungen lb:265–274, Linkliste lb:305–318.
- Auftrag, Kern-Auszug: K-02, K-03, G-04, G-05, G-06.
- Nur benannt, nicht gelesen (eigene Komponentenblätter): Header, PrayerTimesBar, Breadcrumbs, PageHeader, OrgCard, Footer, Icon.

## ZWECK

Besucher erfahren, was die IGMG ist (dc:32), was der Name Millî Görüş bedeutet (dc:48–52), wie die Gemeinschaft entstanden ist (dc:57–66), wie Zentrale, Regionalverbände und Moscheegemeinde zusammenwirken (dc:70–84), welche vier Organisationen es gibt (dc:85–93) und wie die Zentralverwaltung erreichbar ist (dc:97–107). Interaktionen gibt es nur für Tabwechsel und Links.

## ABSCHNITTE

Aufbau in dieser Reihenfolge (abgeleitet aus dc:15–110):

1. Kopf (dc:16–20): Header (sticky, active="moschee", current="igmg"), PrayerTimesBar, Breadcrumbs (label="IGMG"), PageHeader (eyebrow, title, subtitle).
2. Tab-Leiste (dc:22–26): role="tablist", fünf Schaltflächen mit role="tab".
3. Tab Überblick (dc:28–44): zwei Karten im Umbruchraster, „Wer wir sind“ und „Zahlen und Fakten“.
4. Tab Bedeutung (dc:46–55): eine Karte mit drei Absätzen.
5. Tab Geschichte (dc:57–66): eine Karte mit fünf Einträgen.
6. Tab Struktur (dc:68–95): Karte „Struktur des Zentralverbands“ mit zwei Unterblöcken, Abschnitt „Organisationsstruktur“ mit drei Stufen, Abschnitt „Organisationen“ mit vier OrgCards.
7. Tab Kontakt (dc:97–107): Karte „IGMG Zentralverwaltung“ mit vier Feldern.
8. Fuß (dc:110): Footer, eigenes Blatt, in diesem Blatt ohne Texte.

Religiöse Texte (A6): keine Koranverse, keine arabischen Texte, keine Bittgebete auf dieser Seite. Die Suren-Angaben in dc:51 und tsx:47 / 93 / 139 stehen nur als Teil des Erläuterungstexts.
Personennamen (A5): keine auf dieser Seite.

### 1 Kopf (dc:16–20)

| Schlüssel (abgeleitet) | de | tr | en | Fundstelle |
|---|---|---|---|---|
| kopf.eyebrow | IGMG | – (nur DE in Quelle) | – (nur DE in Quelle) | dc:20 |
| kopf.titel | IGMG - Islamische Gemeinschaft Millî Görüş | IGMG - İslam Toplumu Millî Görüş | IGMG - Islamic Community Millî Görüş | dc:20; tsx:31 / 77 / 123 |
| kopf.untertitel | Der Dachverband unserer Moschee | Camimizin üst kuruluşu | The umbrella organization of our mosque | dc:20; tsx:32 / 78 / 124 |
| kopf.brotkrumen | IGMG | – (nur DE in Quelle) | – (nur DE in Quelle) | dc:18 |

### 2 Tab-Leiste (dc:22–26, dc:114)

| Schlüssel (abgeleitet) | de | tr | en | Fundstelle |
|---|---|---|---|---|
| tab.ueberblick | Überblick | Genel Bakış | Overview | dc:114; tsx:176 / 183 / 190 |
| tab.bedeutung | Bedeutung | Anlam | Meaning | dc:114; tsx:177 / 184 / 191 |
| tab.geschichte | Geschichte | Tarih | History | dc:114; tsx:178 / 185 / 192 |
| tab.struktur | Struktur | Yapı | Structure | dc:114; tsx:179 / 186 / 193 |
| tab.kontakt | Kontakt | İletişim | Contact | dc:114; tsx:180 / 187 / 194 |
| tab.aria | Themen | – (nur DE in Quelle) | – (nur DE in Quelle) | dc:22 (aria-label, nicht sichtbar) |

### 3 Überblick (dc:28–44)

| Schlüssel (abgeleitet) | de | tr | en | Fundstelle |
|---|---|---|---|---|
| ueberblick.titel | Wer wir sind | Biz Kimiz | Who We Are | dc:31; tsx:34 / 80 / 126 |
| ueberblick.text | Die Islamische Gemeinschaft Millî Görüş (IGMG) ist eine Religionsgemeinschaft. Sie hat das Ziel der Vermittlung und Pflege des islamischen Glaubens, seiner Verwirklichung in allen sozialen Bezügen und der Erfüllung der koranischen Gebote. Darüber hinaus vertritt die IGMG ihre Mitglieder in gesellschaftlichen, sozialen und politischen Angelegenheiten und setzt sich für die Sicherung ihrer Grundrechte ein. | İslam Toplumu Millî Görüş (IGMG) bir din toplumudur. İslam inancının aktarılması ve korunması, sosyal tüm ilişkilerde gerçekleştirilmesi ve Kurani emirlerin yerine getirilmesi hedefine sahiptir. Bunun yanı sıra IGMG, üyelerini toplumsal, sosyal ve siyasi konularda temsil eder ve temel haklarının güvence altına alınması için çalışır. | The Islamic Community Millî Görüş (IGMG) is a religious community. Its goal is to mediate and preserve the Islamic faith, its realization in all social relationships, and the fulfillment of Quranic commandments. Furthermore, the IGMG represents its members in social, societal, and political matters and advocates for securing their fundamental rights. | dc:32; tsx:35 / 81 / 127 |
| ueberblick.auftrag | Als Teil der weltweiten islamischen Gemeinschaft (Umma) ist es zudem Aufgabe der IGMG, die Probleme der Muslime weltweit aufmerksam zu beobachten und zu ihrer Lösung beizutragen. | Dünya çapındaki İslam ümmetinin bir parçası olarak, IGMG'nin dünya çapındaki Müslümanların sorunlarını dikkatle izlemek ve çözümlerine katkıda bulunmak da görevidir. | As part of the worldwide Islamic community (Umma), it is also the task of IGMG to attentively observe the problems of Muslims worldwide and contribute to their solution. | dc:33; tsx:42 / 88 / 134 |
| zahlen.titel | Zahlen und Fakten | Sayılar ve Gerçekler | Facts and Figures | dc:36; tsx:257 |
| zahlen.moscheen | Moscheen | Camiler | Mosques | dc:38 (Wert 518); tsx:265 (Wert 518: tsx:263) |
| zahlen.zweigstellen | Zweigstellen | Şubeler | Branches | dc:39 (Wert 2.330); tsx:271 (Wert 2.330: tsx:269) |
| zahlen.erreicht | Menschen erreicht | Ulaşılan Kişiler | People Reached | dc:40 (Wert 350.000); tsx:277 (Wert 350.000: tsx:275) |

### 4 Bedeutung (dc:46–55)

| Schlüssel (abgeleitet) | de | tr | en | Fundstelle |
|---|---|---|---|---|
| bedeutung.titel | Was bedeutet Millî Görüş | Millî Görüş Ne Anlama Gelir | What Millî Görüş Means | dc:48; tsx:45 / 91 / 137 |
| bedeutung.absatz1 | Der islamischen Lehre zufolge stammt die Menschheit von dem ersten Menschen und Propheten Adam ab. Seitdem betraute Allah zahllose Propheten mit der Verkündung seiner Botschaft als Richtschnur und Rechtleitung für alle Menschen. Einer dieser Propheten war Abraham, der als Begründer des Monotheismus gilt. | İslami öğretiye göre, insanlık ilk insan ve peygamber Adem'den türemiştir. O zamandan beri Allah, sayısız peygamberi mesajını tüm insanlar için kılavuz ve hidayet olarak duyurma göreviyle yükledi. Bu peygamberlerden biri, tek tanrıcılığın kurucusu kabul edilen İbrahim'di. | According to Islamic teaching, humanity descends from the first human and prophet Adam. Since then, Allah has entrusted countless prophets with proclaiming His message as guidance and direction for all people. One of these prophets was Abraham, who is considered the founder of monotheism. | dc:50; tsx:46 / 92 / 138 |
| bedeutung.absatz2 | Der Name der IGMG steht in direkter Beziehung zum Propheten Abraham. Denn an vielen Stellen im Koran ist im Zusammenhang mit der Wiederbelebung des Monotheismus durch den Islam auch von Muslimen als der „Milla“ (Gemeinschaft) Abrahams die Rede. So etwa unter anderem in den Suren Nahl, Vers 123, Âli Imrân, Vers 95 und Nisâ, Vers 125. | IGMG'nin adı doğrudan Peygamber İbrahim ile ilişkilidir. Çünkü Kuran'da pek çok yerde, İslam'ın tek tanrıcılığı yeniden canlandırması bağlamında Müslümanlardan İbrahim'in "Milleti" (toplumu) olarak bahsedilir. Örneğin Nahl suresi 123. ayet, Âl-i İmrân suresi 95. ayet ve Nisâ suresi 125. ayet gibi. | The name of IGMG is directly related to Prophet Abraham. For in many places in the Quran, in connection with the revival of monotheism through Islam, Muslims are also referred to as the "Milla" (community) of Abraham. For example, in Suras An-Nahl, verse 123, Ali Imran, verse 95, and An-Nisa, verse 125. | dc:51; tsx:47 / 93 / 139 |
| bedeutung.absatz3 | Demnach beschreibt „Millî Görüş“ („görüş“ türkisch für „Sichtweise“) eine Gemeinschaft, die ihre Sichtweise und ihren Glauben auf die Gemeinschaft Abrahams zurückführt und dem Weg des Propheten Muhammad folgt. Ihr Ziel ist es, dieser Perspektive und dem Selbstverständnis einer islamischen Gemeinschaft gerecht zu werden, und sich für das Wohlergehen der Menschen einzusetzen. | "Millî Görüş" ("görüş" Türkçe'de "bakış açısı" anlamına gelir) demnach bir toplumu tanımlar ki, bakış açısını ve inancını İbrahim topluluğuna dayandırır ve Peygamber Muhammed'in yolunu takip eder. Amacı, bu perspektife ve bir İslami toplumun öz anlayışına uygun olmak ve insanların refahı için çalışmaktır. | Accordingly, "Millî Görüş" ("görüş" Turkish for "perspective") describes a community that traces its perspective and faith back to the community of Abraham and follows the path of Prophet Muhammad. Its goal is to live up to this perspective and the self-understanding of an Islamic community, and to work for the welfare of people. | dc:52; tsx:48 / 94 / 140 |

### 5 Geschichte (dc:57–66, dc:122–127)

| Schlüssel (abgeleitet) | de | tr | en | Fundstelle |
|---|---|---|---|---|
| geschichte.titel | Historische Entwicklung | Tarihsel Gelişim | Historical Development | dc:59; tsx:51 / 97 / 143 |
| geschichte.1.label | 1960er Jahre | – (nur DE in Quelle; tsx:322 fest deutsch) | – (nur DE in Quelle; tsx:322 fest deutsch) | dc:123; tsx:322 |
| geschichte.1.text | Ab den 1960er Jahren emigrierten Millionen Muslime aus der Türkei und anderen Ländern nach Europa, um in Deutschland und anderen Staaten Europas zu arbeiten. Mit Beginn des Familiennachzuges und der dauerhaften Sesshaftwerdung der sogenannten Gastarbeiter ab den 70er Jahren fanden sich erste kleine Gemeinden zusammen und eröffneten eigene Gebetsräume. | 1960'lardan itibaren, Türkiye ve diğer ülkelerden milyonlarca Müslüman, Almanya ve diğer Avrupa ülkelerinde çalışmak için Avrupa'ya göç etti. 70'li yıllardan itibaren aile birleşimi ve sözde misafir işçilerin kalıcı yerleşimi ile ilk küçük topluluklar bir araya geldi ve kendi ibadet yerleri açtı. | From the 1960s onwards, millions of Muslims from Turkey and other countries emigrated to Europe to work in Germany and other European states. With the beginning of family reunification and the permanent settlement of the so-called guest workers from the 70s onwards, first small communities came together and opened their own prayer rooms. | dc:123; tsx:52 / 98 / 144 |
| geschichte.2.label | Frühe Vernetzung | Erken Ağ Oluşturma | Early Networking | dc:124; tsx:327 |
| geschichte.2.text | Diese Gemeinschaften vernetzten sich schon bald zu Föderationen auf regionaler Ebene. Allerdings fehlte ein zentraler Dachverband, der insbesondere Aufgaben wie den Bau von Moscheen, die Organisation der Pilgerfahrten und die Anwerbung und Ausbildung von Imamen hätte übernehmen können. | Bu topluluklar kısa sürede bölgesel düzeyde federasyonlar halinde ağ oluşturdu. Ancak özellikle cami inşası, hac yolculuklarının organizasyonu ve imam alımı ve eğitimi gibi görevleri üstlenebilecek merkezi bir çatı örgütü eksikti. | These communities soon networked into federations at the regional level. However, there was a lack of a central umbrella organization that could particularly take on tasks such as the construction of mosques, the organization of pilgrimages, and the recruitment and training of imams. | dc:124; tsx:53 / 99 / 145 |
| geschichte.3.label | 1970er-1980er Jahre | – (nur DE in Quelle; tsx:332 fest deutsch) | – (nur DE in Quelle; tsx:332 fest deutsch) | dc:125; tsx:332 |
| geschichte.3.text | Ende der 70er Jahre fand die europaweite Vernetzung der Arbeit statt. In den 80er Jahren entwickelten sich feste Strukturen, was zur Gründung der AMGT als Vorläufer der heutigen IGMG führte. | 70'lerin sonunda Avrupa çapında ağ oluşturma çalışması gerçekleşti. 80'lerde sağlam yapılar gelişti, bu da bugünkü IGMG'nin öncüsü olan AMGT'nin kurulmasına yol açtı. | At the end of the 70s, the Europe-wide networking of work took place. In the 80s, solid structures developed, which led to the founding of AMGT as the predecessor of today's IGMG. | dc:125; tsx:54 (de dort „Gründnung“) / 100 / 146 |
| geschichte.4.label | Wachstum | Büyüme | Growth | dc:126; tsx:337 |
| geschichte.4.text | Dank einer ständig wachsenden Zahl von Regionalverbänden und Zweigstellen entwickelte sich die IGMG in den Folgejahren zu einer der größten zivilgesellschaftlichen Organisationen Europas. | Sürekli artan bölgesel birlikler ve şubeler sayısı sayesinde IGMG, takip eden yıllarda Avrupa'nın en büyük sivil toplum kuruluşlarından biri haline geldi. | Thanks to a constantly growing number of regional associations and branches, IGMG developed in the following years into one of the largest civil society organizations in Europe. | dc:126; tsx:55 / 101 / 147 |
| geschichte.5.label | Heute | Bugün | Today | dc:127; tsx:343 |
| geschichte.5.text | Heute ist die IGMG eine Gemeinschaft, die der umfassenden Religionsverwirklichung dient und mit ihrer Frauen-, Jugend-, Studierenden- und Frauenjugendorganisation knapp 2500 Zweigstellen unterhält. Sie ist eine fest etablierte Organisation, die ihre Arbeit in vielen Ländern Europas, sowie in den USA, in Australien, Japan, Kanada und Kirgisistan durchführt. Mit ihren 40 Regionalverbänden, 20.000 Mitwirkenden und rund 170.000 Mitgliedern, führt die IGMG ihre Dienstleistungen für Hunderttausende Menschen ohne Unterbrechung fort. | Bugün IGMG, kapsamlı din gerçekleştirmesine hizmet eden ve kadın, gençlik, öğrenci ve kadın gençlik organizasyonu ile yaklaşık 2500 şubeye sahip bir topluluktur. Avrupa'nın birçok ülkesinde, ayrıca ABD, Avustralya, Japonya, Kanada ve Kırgızistan'da çalışmalarını yürüten sağlam köklü bir organizasyondur. 40 bölge birliği, 20.000 katılımcı ve yaklaşık 170.000 üyesi ile IGMG, yüz binlerce insan için hizmetlerini kesintisiz olarak sürdürür. | Today, IGMG is a community that serves comprehensive religious realization and maintains nearly 2,500 branches with its women's, youth, student, and women's youth organizations. It is a well-established organization that carries out its work in many European countries, as well as in the USA, Australia, Japan, Canada, and Kyrgyzstan. With its 40 regional associations, 20,000 participants, and around 170,000 members, IGMG continues its services for hundreds of thousands of people without interruption. | dc:127; tsx:56 / 102 / 148 |

### 6 Struktur (dc:68–95, dc:129–132)

| Schlüssel (abgeleitet) | de | tr | en | Fundstelle |
|---|---|---|---|---|
| struktur.titel | Struktur des Zentralverbands | Merkez Birliği Yapısı | Structure of the Central Association | dc:71; tsx:59 / 105 / 151 |
| struktur.praesidium.label | Präsidium | Başkanlık | Presidium | dc:73; tsx:366 |
| struktur.praesidium.text | Das vom Vorsitzenden geleitete Präsidium ist neben dem vertretungsberechtigten Vorstand das höchste Entscheidungs- und Führungsgremium der IGMG. Es besteht aus den Leitern der acht Abteilungen Generalsekretariat, Gemeindeentwicklung, Finanzen, Irschad, Bildung, Frauen, Jugend und Frauenjugend sowie den Beratern des Vorsitzenden. | Başkan tarafından yönetilen başkanlık, temsil yetkili yönetimin yanı sıra IGMG'nin en yüksek karar ve yönetim organıdır. Genel Sekreterlik, Toplum Geliştirme, Finans, İrşat, Eğitim, Kadın, Gençlik ve Kadın Gençlik olmak üzere sekiz bölüm müdürü ve başkanın danışmanlarından oluşur. | The presidium led by the chairman is, alongside the authorized board, the highest decision-making and leadership body of IGMG. It consists of the heads of the eight departments: General Secretariat, Community Development, Finance, Irshad, Education, Women, Youth, and Women's Youth, as well as the advisors to the chairman. | dc:73; tsx:60 / 106 / 152 |
| struktur.ausschuss.label | Ausführungsausschuss | Uygulama Komitesi | Executive Committee | dc:74; tsx:372 |
| struktur.ausschuss.text | Verantwortlich für die Umsetzung der im Präsidium getroffenen Beschlüsse ist der Zentrale Ausführungsausschuss. Er setzt sich zusammen aus den im Präsidium vertretenen Abteilungsleitern, den stellvertretenden Abteilungsleitern des Generalsekretariats, der Irschadabteilung, der Bildungsabteilung und der Abteilung für Gemeindeentwicklung. | Başkanlıkta alınan kararların uygulanmasından Merkez Uygulama Komitesi sorumludur. Başkanlıkta temsil edilen bölüm müdürleri, Genel Sekreterlik, İrşat Bölümü, Eğitim Bölümü ve Toplum Geliştirme Bölümü müdür yardımcılarından oluşur. | The Central Executive Committee is responsible for implementing the decisions made in the presidium. It is composed of the department heads represented in the presidium, the deputy department heads of the General Secretariat, the Irshad Department, the Education Department, and the Community Development Department. | dc:74; tsx:61 / 107 / 153 |
| orgstruktur.titel | Organisationsstruktur | Organizasyon Yapısı | Organizational Structure | dc:78; tsx:66 / 112 / 158 |
| stufe.1.titel | Moscheegemeinde | Cami Topluluğu | Mosque Community | dc:130; tsx:392 |
| stufe.1.text | Kleinste funktionale Einheit | En küçük işlevsel birim | Smallest functional unit | dc:130; tsx:395 |
| stufe.2.titel | Regionalverbände | Bölge Birlikleri | Regional Associations | dc:131; tsx:401 |
| stufe.2.text | Koordination auf regionaler Ebene | Bölgesel koordinasyon | Regional coordination | dc:131; tsx:404 |
| stufe.3.titel | Zentralverband | Merkez Birliği | Central Association | dc:132; tsx:410 |
| stufe.3.text | Planung und Kontrolle | Planlama ve kontrol | Planning and control | dc:132; tsx:413 |
| organisationen.titel | Organisationen | – (nur DE in Quelle; im Design ergänzt, lb:272) | – (nur DE in Quelle; im Design ergänzt, lb:272) | dc:86 |

Abschnitt „Organisationen“: vier OrgCard-Kacheln in dieser Reihenfolge: org="at" (dc:88), org="kt" (dc:89), org="gt" (dc:90), org="kgt" (dc:91). Zuordnung (abgeleitet aus rm:3, lb:169–172, lb:187): at = Ana Teşkilatı (AT, Grün), kt = Kadın Teşkilatı (KT, Violett), gt = Gençlik Teşkilatı (GT, Türkis), kgt = Kadın Gençlik Teşkilatı (KGT, Beere). Inhalt und Interaktion der Karten stehen im OrgCard-Blatt.

### 7 Kontakt (dc:97–107)

| Schlüssel (abgeleitet) | de | tr | en | Fundstelle |
|---|---|---|---|---|
| kontakt.titel | IGMG Zentralverwaltung | IGMG Merkez Yönetimi | IGMG Central Administration | dc:99; tsx:428 (Präfix „IGMG“ plus Ternary) |
| kontakt.adresse.label | Adresse | Adres | Address | dc:101; tsx:438 |
| kontakt.adresse.wert | Beispielwert (dc:101; tsx:440), nicht ausgeschrieben (A5) | wie de | wie de | dc:101; tsx:440 |
| kontakt.telefon.label | Telefon | Telefon | Phone | dc:102; tsx:447 |
| kontakt.telefon.wert | Beispielwert (dc:102; tsx:449), nicht ausgeschrieben (A5) | wie de | wie de | dc:102; tsx:449 |
| kontakt.email.label | E-Mail | E-Mail | E-Mail | dc:103; tsx:457 (im Bestand fest) |
| kontakt.email.wert | Beispielwert (dc:103; tsx:458), nicht ausgeschrieben (A5); mailto-Link im Design | wie de | wie de | dc:103; tsx:458 |
| kontakt.web.label | Website | Website | Website | dc:104; tsx:464 (im Bestand fest) |
| kontakt.web.wert | Beispielwert (dc:104; tsx:465), nicht ausgeschrieben (A5); kein Link | wie de | wie de | dc:104; tsx:465 |

## DATEN

Vorschlag, abgeleitet (A7). Im Design und im Bestand gibt es keine Datenquelle; alle Inhalte stehen fest in dc:15–110 und tsx:26–428.

- Datensatz igmgSeite (ein Dokument):
  - ueberblickText: Text, mehrsprachig ja (de Pflicht; tr und en mit sichtbarem Rückfall auf de, K-02).
  - auftragText: Text, mehrsprachig ja.
  - bedeutung: Liste aus drei Texten, mehrsprachig ja.
  - geschichte: Liste aus fünf Einträgen; je label (Text, ja) und text (Text, ja); Reihenfolge fest.
  - praesidiumText und ausschussText: Text, mehrsprachig ja.
  - zahlen.moscheen, zahlen.zweigstellen, zahlen.menschenErreicht: Zahl, mehrsprachig nein; Werte offen (AUFFAELLIGKEITEN 1).
  - kontakt.adresse und kontakt.telefon: Text, mehrsprachig nein; bis zur Bestätigung Platzhalter [Adresse] und [Telefonnummer] (G-05).
  - kontakt.email: E-Mail, mehrsprachig nein. kontakt.website: URL, mehrsprachig nein.
- Sammlung organisationen (vier Einträge):
  - schluessel: Text (at, kt, gt, kgt), mehrsprachig nein.
  - name: Text, mehrsprachig nein (Eigenname; Schreibweise offen, AUFFAELLIGKEITEN 5).
  - logo: Bild, mehrsprachig nein.
  - akzentfarbe: Farbwert, mehrsprachig nein (lb:187).
  - reihenfolge: Zahl, mehrsprachig nein.
- Nicht aus der Datenbank: Überschriften, Tab- und Feldbezeichnungen, Stufen-Texte und die Begriffe „Organisationen“ und „IGMG Zentralverwaltung“. Sie gehören nach K-02 in messages/{de,tr,en}.json.

## FORMULARFELDER

– (entfaellt, keine Formulare: dc:15–110 enthält kein input-, textarea-, select- oder form-Element, nur die Tab-Schaltflächen dc:24; tsx enthält keines dieser Elemente).

## INTERAKTIONEN

1. Tab wählen (dc:24, dc:120): Ein Klick setzt den Tab-Zustand; das Panel wechselt. Keine Navigation und keine URL-Änderung. Bestand: setActiveTab (tsx:219).
2. Tastatur (abgeleitet): Die Schaltflächen sind über die Tab-Taste erreichbar und per Enter oder Leertaste auslösbar. Pfeiltasten nach WAI-ARIA sind weder im Design noch im Bestand festgelegt (OFFENE FRAGEN 6).
3. Fokus: Rahmen 2 px #0E3929 mit 2 px Abstand (dc:13; rm:21).
4. OrgCards (dc:88–91, vier Karten): Ziel laut lb:316 „Organisationsseiten“; Route nach K-03: /organisationen/[organisation]. Slugs offen (OFFENE FRAGEN 4).
5. E-Mail (dc:103): mailto-Link auf den Beispielwert. Bestand: nur Text, kein Link (tsx:458).
6. Website (dc:104): nur Text, kein Link. Bestand ebenso (tsx:465).
7. Header (dc:16): sticky am oberen Rand. Das Untermenü „Moschee“ führt zu dieser Seite (lb:307).
8. Breadcrumbs (dc:18): Pfad Startseite › IGMG (abgeleitet aus lb:312; die Logik steht im Breadcrumbs-Blatt).
9. Footer (dc:110): in diesem Blatt ohne eigene Interaktion.

## ZUSTAENDE

Eigenschaft aus data-props (dc:113):
- tab: Typ enum. Optionen: overview, meaning, history, structure, contact. Default: overview. tsType: string. Wirkung: Startwert, solange nicht geklickt wurde (dc:118).

Entsprechung im Bestand: kein Prop; Zustand activeTab mit Start „overview“ und denselben fünf Schlüsseln (tsx:172, 176–180).

Interner Zustand im Design:
- state.tab: Start null (dc:116); nach Klick der gewählte Schlüssel (dc:120). Auswertung: state.tab || props.tab || overview (dc:118).
- Ungültiger tab-Wert (abgeleitet aus dc:118 und dc:121): kein Panel sichtbar, die Leiste bleibt stehen. Verhalten nicht festgelegt (OFFENE FRAGEN 5).

Zustände nach Vorgabe:
- leer: – (entfaellt, keine Liste; Zahlen sind fest, dc:38–40; tsx:263–275).
- Fehler: – (entfaellt, keine Datenquelle und kein Ladevorgang; dc:15–110; tsx:200–477). Ausnahme: ungültiger tab-Wert, siehe oben.
- Erfolg: – (entfaellt, keine Aktion mit Rückmeldung).
- Schritt: – (entfaellt, keine Schrittfolge).
- angemeldet: – (entfaellt, öffentliche Seite; Kontozustände stehen im Header-Blatt, lb:148).
- Sprache: de, tr, en. Bestand über useLanguage (tsx:27), ohne Rückfallwert: t[language] (tsx:170). Design: fest lang="de" (dc:15); eine Sprachumschaltung gehört zum Header-Blatt.

Optische Zustände der Tab-Schaltfläche (dc:24, dc:120):
- aktiv: Hintergrund #FFFFFF, Schrift #065F46, Schatten 0 1px 2px rgba(29,26,23,0.06), Unterstrich 3 px #047857.
- inaktiv: transparent, Schrift #1D1A17.
- Hover: Schrift #065F46 (dc:24, style-hover).
- Bestand: aktiv bg-emerald-50, Schrift emerald-700, unterer Rand emerald-700; inaktiv Schrift gray-600 (tsx:220–224). Gestalt laut Design.

## BILDER

- Keine Fotos und keine Bilddateien auf dieser Seite (dc:15–110 ohne img-Element; tsx ohne img).
- Icons (Icon.dc.html, Lucide-Pfade, rm:28): Überschriften-Icons 28 px: user (dc:31), compass (dc:48), calendar (dc:59), phone (dc:99). Stufen-Icons 24 px: building-2 (dc:130), users (dc:131), target (dc:132). Kontakt-Icons 20 px: phone (dc:102), map-pin (dc:101), mail (dc:103), external-link (dc:104).
- Organisations-Logos (OrgCard, lb:34): AT assets/logo-igmg-wetzlar.png, KT assets/logo-kadin.png, GT assets/logo-genclik.png, KGT assets/logo-kadin-genclik.png. Die Vorlagen sind 40 × 40 px mit weißem Grund; größere Fassungen fehlen (lb:231). Zuordnung offen (lb:230).
- Akzentfarben (lb:187): AT #047857 (L* 44), KT #592E81 (L* 29), KGT #9B255A (L* 36), GT #008C98 (L* 53). GT-Türkis nur als Fläche oder Band; GT-Text in Petrol #006177.

## AUFFAELLIGKEITEN

1. Zahlen widersprechen sich im Design und zum Bestand. Zweigstellen: 2.330 (dc:39; tsx:269) gegen „knapp 2500“ (dc:127; tsx:56) und „nearly 2,500“ (tsx:148). Regionalverbände: 40 (dc:127; tsx:56) gegen 35 Regional- und Landesverbände sowie 15 in Deutschland (tsx:69 / 115 / 161, im JSX nicht ausgegeben). Mitglieder: rund 170.000 (dc:127; tsx:56) gegen 127.000 (tsx:73 / 119 / 165, nicht ausgegeben). Das Blatt übernimmt den Design-Wortlaut; die Klärung steht in lb:250.
2. Tippfehler im Bestand: „Gründnung“ (tsx:54) statt „Gründung“ (dc:125). Die Korrektur ist im Laufbuch vermerkt (lb:270). Das Design gilt; die tr- und en-Fassungen (tsx:100 / 146) sind nicht betroffen.
3. Kontaktwerte: Das Design zeigt konkrete Adresse, Telefon, E-Mail und Website (dc:101–104; tsx:440, 449, 458, 465). Das Laufbuch verlangt im Design „[Adresse]“ und „[Telefonnummer]“ (lb:225–226) und die Bestätigung der Zentralkontakte (lb:250). Die E-Mail-Domain weicht von der in lb:227 genannten Moschee-Adresse ab. Das Blatt führt die Werte nach A5 nur als Beispielwert.
4. Nicht ausgegebene Bestandstexte: whoWeAre.principles (tsx:36–41, 82–87, 128–133), centralStructure.departments und .specialization (tsx:62–63, 108–109, 154–155) sowie organizationalStructure.cooperation, mosqueLevel, globalPresence, regionalRole, centralRole, centralResponsibilities und statistics (tsx:67–73, 113–119, 159–165) sind definiert, werden im JSX aber nie ausgegeben. Sie stehen nicht im Design und sind deshalb nicht in den Tabellen. Entscheidung offen.
5. Fehlende oder fest deutsche Sprachfassungen: Die Überschrift „Organisationen“ (dc:86) hat keine Bestandsfassung (lb:272). Die Jahreszahl-Labels „1960er Jahre“ und „1970er-1980er Jahre“ stehen im Bestand fest auf Deutsch (tsx:322, 332), auch in der türkischen und englischen Ansicht. Neue Übersetzungen sind nach K-02 zu markieren und in MENSCHEN.md zu führen. Der Name „Ana Teşkilatı“ steht im Design, die Breadcrumbs nennen laut lb:229 „Anadolu Teşkilatı“; „Kadın Gençlik Teşkilatı“ (Design) steht gegen „Kız Gençlik Teşkilatı“ (lb:228).
6. Im türkischen Bedeutungsabsatz 3 steht das deutsche Wort „demnach“ (tsx:94). Die Übersetzung ist vor der Übernahme zu prüfen; der Wortlaut ist hier unverändert übernommen.
7. Der Laufbuch-Plan 04.5 (lb:164) nennt unter Zustände „–“. Das Design hat aber den Prop tab mit fünf Optionen (dc:113). Der Plan ist zu ergänzen.
8. Die Geschichte nennt eine Studierendenorganisation (dc:127; tsx:56). Die vier Organisationskarten (dc:88–91) enthalten sie nicht. Die Klärung steht offen.
9. Gestalt-Abweichung: Das Design hat einen PageHeader mit Eyebrow „IGMG“ (dc:20), der Bestand einen zentrierten h1 mit Icon (tsx:204–208). Die Tabs sind im Design role="tab" mit aria-selected (dc:24), aber ohne aria-controls (dc:24, 29, 47). Im Bestand sind es einfache Buttons (tsx:217–225). Das Design gilt für die Gestalt; Z-05 (lb:217) verlangt Bedienbarkeit.

## OFFENE FRAGEN

1. Welche Zahlen gelten: 2.330 oder knapp 2.500 Zweigstellen, 40 oder 35 Regionalverbände, 170.000 oder 127.000 Mitglieder (lb:250)?
2. Bleiben Adresse, Telefon, E-Mail und Website als Beispielwerte, oder werden bis zur Bestätigung die Platzhalter [Adresse] und [Telefonnummer] gesetzt (G-05)?
3. Welche lokalisierten Pfadnamen gelten für /igmg in tr und en? K-03 nennt keinen Wert.
4. Welche Slugs gelten für /organisationen/[organisation]: at, kt, gt, kgt oder andere (Vorschlag, abgeleitet)?
5. Soll der gewählte Tab in der URL stehen, zum Beispiel als Abfrageparameter, oder nur im Zustand bleiben (dc:116)? Und wie verhält sich ein ungültiger tab-Wert?
6. Soll die Tab-Leiste Pfeiltasten nach dem WAI-ARIA-Muster unterstützen? Das Design nennt es nicht (dc:24; Vorschlag).
7. Welche Namen gelten: „Kadın Gençlik Teşkilatı“ (Design, rm:3) oder „Kız Gençlik Teşkilatı“ (Breadcrumbs, lb:228); „Ana Teşkilatı“ (Design) oder „Anadolu Teşkilatı“ (lb:229)?
8. Welche Logos und welche Zuordnung gelten (lb:230)? Freigestellte Fassungen ab 512 px werden laut lb:231 benötigt.
9. Welcher Seitentitel und welche Meta-Beschreibung gelten? Das Design (dc:3–7) und der Bestand definieren keine.
10. Ist die Studierendenorganisation aus dc:127 als eigene Organisation gemeint, die in den vier Karten (dc:88–91) nicht erscheint?
11. Die Icon-Namen (user, compass, calendar, phone, map-pin, mail, external-link, building-2, users, target) sind nicht gegen Icon.dc.html geprüft, weil diese Datei außerhalb der Quellenliste lag.

=== ENDE S12 · BEREIT ZUR RÜCKGABE ===
