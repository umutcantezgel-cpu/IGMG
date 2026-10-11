# S08 · Seitenblatt „Über uns“

Kopf: Rolle Kundschafter · Kern-Version 1.0 · Stand 2026-10-11 · Umfang ein Seitenblatt

## SEITE
Über uns (Artboard 04.1, B:160). Datei: AboutUs.dc.html. Code-Ziel: AboutUs.tsx (B:160). Gemeinsame Teile Header, PrayerTimesBar, Breadcrumbs, PageHeader, Footer und Icon haben eigene Blätter und sind hier nur mit gesetzten Eigenschaften genannt.

## ROUTE
de: /ueber-uns (ohne Präfix, K-03). tr: /tr/[lokalisierter Pfad offen]. en: /en/[lokalisierter Pfad offen]. Die lokalisierten Pfade stehen in keiner Quelle (siehe OFFENE FRAGEN).

## QUELLEN
- D = design/AboutUs.dc.html, vollständig gelesen (Template D:9–86, Skript mit renderVals D:87–107). Zahlen sind Zeilen.
- T = bestand AboutUs.tsx, vollständig gelesen.
- L = bestand LanguageContext.tsx, Namensraum aboutUs: de 209–268, tr 467–526, en 725–784. Schrägstrich-Zahlen sind de/tr/en. Zusätzlich header.mosque (22/280/538 Titel, 23/281/539 about) und hero (98/356/614 learnMore).
- W = design/readme.md. B = design/00 Laufbuch.dc.html. BM = design/BoardMembers.dc.html. BMT = bestand BoardMembers.tsx (nur Zeilen 30 und 307).
- Kopie uploads/IGMG_Wetzlar_Website_Code: AboutUs.tsx und LanguageContext.tsx sind identisch (diff geprüft).

## ZWECK
Über-uns-Seite der IGMG Fatih Camii Wetzlar: Geschichte der Standorte, Gemeinschaftsbild, vier Werte und ein Aufruf zur Teilnahme mit Links zu Kontakt und Vorstand. Besucher geben nichts ein (D:9–86 ohne Eingabefelder, abgeleitet).

## ABSCHNITTE
Aufbau nach D-Zeilen:
1. Kopf (D:16–20): Header, PrayerTimesBar, Breadcrumbs, PageHeader mit Eyebrow.
2. Geschichte (D:22–33): Icon clock, Überschrift, vier Absätze, Bildfläche.
3. Unsere Reise (D:35–51): Überschrift, Untertitel, Zeitleiste mit fünf Einträgen aus D:92–96.
4. Gebet, Gemeinschaft, Einheit (D:53–60): Icon users, Überschrift, drei Absätze.
5. Unsere Werte (D:62–73): Überschrift, Untertitel, vier Karten (D:99–102).
6. Aufruf (D:75–81): Überschrift, Text, zwei Links.
7. Footer (D:84): eingebunden.

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| aboutUs.eyebrow (neu) | Moschee | Cami | Mosque | D:20; L:22/280/538 (gleicher Text, header.mosque.title) |
| aboutUs.title | Über uns | Hakkımızda | About Us | D:20; L:210/468/726 |
| header.mosque.about (Breadcrumb) | Über uns | Hakkımızda | About Us | D:18; L:23/281/539 (gleicher Text) |
| aboutUs.subtitle | Die Geschichte der IGMG Fatih Camii Wetzlar | IGMG Fatih Camii Wetzlar'ın Hikayesi | The Story of IGMG Fatih Camii Wetzlar | D:20; L:211/469/727 |
| aboutUs.history.title | Fatih Camii - Von der Vergangenheit bis heute | Fatih Camii - Geçmişten bugüne | Fatih Camii - From Past to Present | D:24; L:213/471/729 |
| aboutUs.history.content1 | Die IGMG Fatih Camii wurde erstmals 1976 in der Formerstraße gegründet. Mit der wachsenden Gemeinde und den sich entwickelnden Bedürfnissen zogen wir von unserem ersten Standort in die Garbenheimerstraße um. Dort hatten wir die Gelegenheit, eine größere Moschee und ein Gemeindezentrum zu schaffen. | IGMG Fatih Camii, ilk olarak 1976 yılında Formerstraße'de kuruldu. Zamanla büyüyen cemaatimiz ve gelişen ihtiyaçlarımız doğrultusunda, ilk yerimizden Garbenheimerstraße'ye taşındık. Burada daha büyük bir cami ve toplum merkezi oluşturma fırsatı bulduk. | IGMG Fatih Camii was first established in 1976 on Formerstraße. As our community grew and our needs developed, we moved from our first location to Garbenheimerstraße. There we had the opportunity to create a larger mosque and community center. | D:26; L:214/472/730 |
| aboutUs.history.content2 | Da unsere stetig wachsende Gemeinde jedoch mehr Platz benötigte, entschieden wir uns für einen Umzug zum Niedergirmeser Weg. Hier fanden wir einen größeren und geeigneteren Ort für unsere Gemeinde. | Ancak, sürekli büyüyen cemaatimiz için daha fazla alan gerekti. Bu nedenle Niedergirmeser Weg'e taşınma kararı aldık. Burada cemaatimiz için daha büyük ve daha uygun bir yer bulduk. | However, as our continuously growing community needed more space, we decided to move to Niedergirmeser Weg. Here we found a larger and more suitable place for our community. | D:27; L:215/473/731 |
| aboutUs.history.content3 | Im Jahr 2019 fand der letzte und größte Umzug unserer Moschee statt. Unser weitläufiges Gelände in der Philipsstraße wurde zum idealen Ort, um die Bedürfnisse unserer wachsenden Gemeinschaft zu erfüllen. | 2019 yılında ise camiimizin son ve en büyük taşınması gerçekleşti. Philipsstraße'deki geniş alanımız, büyüyen topluluğumuzun ihtiyaçlarını karşılamak için ideal bir yer oldu. | In 2019, the last and largest move of our mosque took place. Our spacious grounds on Philipsstraße became the ideal place to meet the needs of our growing community. | D:28; L:216/474/732 |
| aboutUs.history.content4 | Von der Vergangenheit bis heute ist die Geschichte unserer Moschee eine Geschichte des kontinuierlichen Wachstums und des Strebens, unserer Gemeinde besser zu dienen. Wie heute werden wir auch morgen unserer Gemeinde weiterhin dienen. Wir danken Ihnen, dass Sie uns auf dieser Reise begleiten. | Geçmişten bugüne, camiimizin öyküsü, sürekli büyüme ve cemaatimize daha iyi hizmet etme çabasının bir hikayesidir. Bugün olduğu gibi, yarın da cemaatimize hizmet etmeye devam edeceğiz. Bizimle bu yolculukta olduğunuz için teşekkür ederiz. | From past to present, the story of our mosque is one of continuous growth and striving to better serve our community. As today, we will continue to serve our community tomorrow. We thank you for being with us on this journey. | D:29; L:217/475/733 |
| aboutUs.neu.fotoHistorie (Bildfläche) | Foto: Fatih Camii heute | – (nur DE in Quelle) | – (nur DE in Quelle) | D:32 (aria-label und Text) |
| aboutUs.neu.reiseTitel | Unsere Reise | – (nur DE in Quelle) | – (nur DE in Quelle) | D:36; T:145 |
| aboutUs.neu.reiseUntertitel | Von bescheidenen Anfängen zu einer blühenden Gemeinde | – (nur DE in Quelle) | – (nur DE in Quelle) | D:36; T:147 |
| aboutUs.timeline.jahr (fünf Marken) | 1976 · Frühe Jahre · Wachstumsphase · 2019 · Zukunft | 1976 · İlk yıllar · Büyüme dönemi · 2019 · Gelecek | 1976 · Early years · Growth period · 2019 · Future | D:92–96; T:23,32,41,50,59; tr/en abgeleitet aus L:485–488 und 743–746 (Wortteil vor „ - “) |
| aboutUs.timeline.ort (fünf Orte) | Formerstraße · Garbenheimerstraße · Niedergirmeser Weg · Philipsstraße · Wetzlar | wie de (Eigenname) | wie de (Eigenname) | D:92–96; T:25,34,43,52,61 |
| aboutUs.timeline.year1976 | 1976 - Gründung in der Formerstraße | 1976 - Formerstraße'de kuruluş | 1976 - Founded on Formerstraße | D:92; L:226/484/742 |
| aboutUs.timeline.yearEarly | Frühe Jahre - Umzug zur Garbenheimerstraße | İlk yıllar - Garbenheimerstraße'ye ta��ınma | Early years - Move to Garbenheimerstraße | D:93; L:227/485/743 (L:485 mit zwei Ersatzzeichen, siehe AUFFAELLIGKEITEN 3) |
| aboutUs.timeline.yearMid | Wachstumsphase - Umzug zum Niedergirmeser Weg | Büyüme dönemi - Niedergirmeser Weg'e taşınma | Growth period - Move to Niedergirmeser Weg | D:94; L:228/486/744 |
| aboutUs.timeline.year2019 | 2019 - Umzug zur Philipsstraße (aktueller Standort) | 2019 - Philipsstraße'ye taşınma (mevcut konum) | 2019 - Move to Philipsstraße (current location) | D:95; L:229/487/745 |
| aboutUs.timeline.yearFuture | Zukunft - Weiterhin im Dienste unserer Gemeinde | Gelecek - Cemaatimize hizmet etmeye devam | Future - Continuing to serve our community | D:96; L:230/488/746 |
| aboutUs.neu.zeitleisteBilder (fünf Bildflächen) | Foto: Bescheidenes Gebäude - Anfänge in der Formerstraße · Foto: Größeres Gemeindezentrum - Wachstum in Garbenheimerstraße · Foto: Wachsende Gemeinde - Expansion am Niedergirmeser Weg · Foto: Moderne Moschee - Neues Zuhause in der Philipsstraße · Foto: Zukunftsvision - Gemeinsam in die Zukunft | – (nur DE in Quelle) | – (nur DE in Quelle) | D:92–96 (img); T:29,38,47,56,65 (ohne „Foto: “) |
| aboutUs.community.title | Gebet, Gemeinschaft, Einheit | Dua, Topluluk, Birlik | Prayer, Community, Unity | D:54; L:220/478/736 |
| aboutUs.community.content1 | Die Geschichte der IGMG Fatih Camii begann im Keller eines Hauses. Als wir 1976 gegründet wurden, beschwerten sich einige Anwohner über den Lärm. Aber wir gaben nicht auf. Mit Glauben und Entschlossenheit setzten wir diese Reise fort, die wir mit unserer kleinen Gemeinschaft begonnen hatten. | IGMG Fatih Camii'nin hikayesi, bir evin bodrum katında başladı. 1976'da kurulduğumuzda, çevredeki bazı sakinler gürültü nedeniyle şikayette bulundular. Ama biz pes etmedik. İnanç ve kararlılıkla, küçük topluluğumuzla başladığımız bu yolculuğu sürdürdük. | The story of IGMG Fatih Camii began in the basement of a house. When we were founded in 1976, some residents complained about the noise. But we didn't give up. With faith and determination, we continued this journey that we started with our small community. | D:56; L:221/479/737 |
| aboutUs.community.content2 | Im Laufe der Zeit begann unsere kleine Gemeinde zu wachsen und schließlich, nach jahrelangen Anstrengungen, fanden wir die Gelegenheit, unser eigenes Eigentum zu erwerben. | Zaman geçtikçe, küçük cemaatimiz büyümeye başladı ve sonunda, yıllar süren çaba sonucunda, kendimize ait bir mülk edinme fırsatı bulduk. | Over time, our small congregation began to grow and finally, after years of effort, we found the opportunity to acquire our own property. | D:57; L:222/480/738 |
| aboutUs.community.content3 | Die Geschichte der IGMG Fatih Camii ist eine Geschichte von Glaube, Vertrauen, Ausdauer und Gemeinschaftsgeist. Und diese Geschichte wird, wie heute, auch morgen weitergehen. Wir danken Ihnen, dass Sie diesen Weg mit uns gegangen sind. | IGMG Fatih Camii'nin hikayesi, iman, inanç, azim ve topluluk ruhunun bir hikayesidir. Ve bu hikaye, bugün olduğu gibi, yarın da devam edecektir. Bu yolu birlikte yürüdüğünüz için teşekkür ederiz. | The story of IGMG Fatih Camii is a story of faith, belief, perseverance and community spirit. And this story will continue tomorrow, just as it does today. Thank you for walking this path with us. | D:58; L:223/481/739 |
| aboutUs.values.title | Unsere Werte | Değerlerimiz | Our Values | D:63; L:233/491/749 |
| aboutUs.values.subtitle (neu) | Die Grundpfeiler unserer Gemeinschaft | – (nur DE in Quelle) | – (nur DE in Quelle) | D:63; T:237 |
| aboutUs.values.faith.title | Glaube | İman | Faith | D:99; L:235/493/751 |
| aboutUs.values.faith.description | Unser Glaube ist das Fundament unserer Gemeinschaft und leitet uns in allem, was wir tun. | İmanımız cemaatimizin temelidir ve yaptığımız her şeyde bize rehberlik eder. | Our faith is the foundation of our community and guides us in everything we do. | D:99; L:236/494/752 |
| aboutUs.values.community.title | Gemeinschaft | Topluluk | Community | D:100; L:239/497/755 |
| aboutUs.values.community.description | Wir schaffen einen Ort der Zusammengehörigkeit für alle Mitglieder unserer vielfältigen Gemeinde. | Çeşitli cemaatimizin tüm üyeleri için aidiyet duygusu yaratan bir yer oluştururuz. | We create a place of belonging for all members of our diverse congregation. | D:100; L:240/498/756 |
| aboutUs.values.service.title | Dienst | Hizmet | Service | D:101; L:243/501/759 |
| aboutUs.values.service.description | Wir sind der Gemeinde und der Gesellschaft durch Bildung, soziale Dienste und spirituelle Führung verpflichtet. | Eğitim, sosyal hizmetler ve manevi rehberlik yoluyla cemaat ve topluma hizmet etmeyi taahhüt ediyoruz. | We are committed to serving the community and society through education, social services and spiritual guidance. | D:101; L:244/502/760 |
| aboutUs.values.growth.title | Wachstum | Büyüme | Growth | D:102; L:247/505/763 |
| aboutUs.values.growth.description | Wir wachsen kontinuierlich, um den sich wandelnden Bedürfnissen unserer Gemeinde gerecht zu werden. | Cemaatimizin değişen ihtiyaçlarını karşılamak için sürekli olarak büyürüz. | We continuously grow to meet the changing needs of our community. | D:102; L:248/506/764 |
| aboutUs.neu.ctaTitel | Werden Sie Teil unserer Geschichte | – (nur DE in Quelle) | – (nur DE in Quelle) | D:76; T:265 |
| aboutUs.neu.ctaText | Gemeinsam schreiben wir weiterhin die Geschichte der IGMG Fatih Camii Wetzlar. Ihre Teilnahme und Ihr Engagement machen den Unterschied. | – (nur DE in Quelle) | – (nur DE in Quelle) | D:76; T:267–268 |
| aboutUs.cta.kontakt (neu) | Kontakt aufnehmen | – (nur DE in Quelle) | – (nur DE in Quelle) | D:78; T:272 |
| aboutUs.cta.mehr | Mehr erfahren | Daha fazla öğren | Learn More | D:79; L:98/356/614 (hero.learnMore, gleicher Text); T:275 |

## DATEN
Vorschlag, abgeleitet aus D:92–102 und K-02 (Deutsch Pflicht; Türkisch und Englisch optional mit sichtbarem Rückfall auf Deutsch):
- Zeitleisten-Eintrag (Liste, heute fünf): Kennzeichnung (Text, ja) · Titel (Text, ja) · Ort (Text, nein) · Bild (Verweis, nein) · Bildbeschreibung (Text, ja) · Reihenfolge (Zahl, nein) · Symbol (Auswahl, nein).
- Werte-Eintrag (Liste, heute vier): Titel (Text, ja) · Beschreibung (Text, ja) · Symbol (Auswahl, nein) · Reihenfolge (Zahl, nein).
- Geschichtsabsatz (Liste, optional, nur falls die Verwaltung die Texte pflegt): Absatz (Langtext, ja).
- In messages/{de,tr,en}.json bleiben: Seitentitel, Untertitel, Abschnittsüberschriften, Aufruf und Schaltflächen.

## FORMULARFELDER
– (entfaellt, keine Formularfelder; die Schaltflächen des Aufrufs sind Links, D:78–79)

## INTERAKTIONEN
- „Kontakt aufnehmen“ (D:78) führt zu Contact.dc.html, Zielroute /kontakt (K-03). Im Bestand ohne Ziel (T:271–273); Laufbuch-Link B:315.
- „Mehr erfahren“ (D:79) führt zu BoardMembers.dc.html, Zielroute /vorstand (K-03). Im Bestand ohne Ziel (T:274–276); B:315.
- Keine Dialoge, Formulare, Filter oder Animationen im Design. Die Zeitleisten-Bildflächen sind nicht anklickbar (D:46).

## ZUSTAENDE
- Eigenschaften aus data-props: – (entfaellt, das Artboard hat kein data-props; D:87 nur data-dc-script).
- Gesetzte Eigenschaften eingebundener Teile (Optionen im jeweiligen Blatt): Header active="moschee" current="about-us" (D:16); PrayerTimesBar und Footer ohne Eigenschaften (D:17, D:84); Breadcrumbs label="Über uns" (D:18); PageHeader eyebrow="Moschee", title="Über uns", subtitle="Die Geschichte der IGMG Fatih Camii Wetzlar" (D:20); Icon mit n und size je Aufruf (D:24 clock/28; D:40 {{ t.icon }}/20; D:67 {{ v.icon }}/24; D:78 mail/20; D:79 arrow-right/20).
- Sprache: Artboard lang="de" fest (D:15). Bestand: de, tr, en über LanguageContext, Standard de (L:791; Typ L:3).
- Bestand-Zustände: keine Lade-, Leer-, Fehler-, Erfolgs-, Schritt- oder Anmeldezustände (T:1–281). Bilder laufen über eine Fallback-Komponente (T:6, 173); deren Verhalten ist nicht gelesen.
- Hover und Fokus: Link-Hover #065F46 (D:13). Kontakt-Schaltfläche Hover Hintergrund #EBF9F2, Schrift #0E3929 (D:78). Mehr-erfahren-Schaltfläche Hover Hintergrund #065F46, Schrift #FFFFFF (D:79). Fokus 2 px #0E3929 mit 2 px Abstand (D:13). Bestand-Hover mit Verschiebung und Skalierung (T:170, 176, 245, 248) nicht übernommen (W:20).
- Breite: Container-Einheiten (D:19, D:21) und Raster auto-fit mit 260 px Mindestbreite (D:64). Bestand wechselt die Zeitleiste ab lg die Seite (T:168). Design gilt.

## BILDER
- Fläche 1: „Foto: Fatih Camii heute“ (D:32), Höhe clamp(240px,28cqi,380px), Radius 12 px, Streifenmuster als Platzhalter.
- Flächen 2 bis 6: Zeitleiste (D:46), Höhe 140 px, Radius 8 px, Beschriftungen aus D:92–96.
- Bestand: fünf externe Unsplash-Bilder (T:28, 37, 46, 55, 64), nicht übernommen (G-04; B:34).
- Echte Fotos mit Bildrechten fehlen (B:233, B:257).
- Icons aus Icon.dc.html (Lucide-Pfade, W:28): clock, users, house, building-2, map-pin, arrow-up-right, heart, mail, arrow-right.

## AUFFAELLIGKEITEN
1. Gründungsjahr: „Über uns“ nennt 1976 (D:26, D:56, D:92; L:214, 221, 226). Der Vorstand nennt „Führung seit 1975“ (BM:30; BMT:307) und 1975–1979 mit „Gründung der ersten Moschee“ (BM:63, [Name – erster Vorsitz]). Der Widerspruch ist offen (B:243).
2. leadership und currentBoard sind in L vorhanden (L:251–267, 509–525, 767–783), werden in T nicht gerendert (T:260–262) und fehlen im Design.
3. Der türkische Text in L:485 enthält zwei Ersatzzeichen (U+FFFD). Er ist wörtlich übernommen, nicht korrigiert.
4. Gestalt: Bestand-Hero (T:97–107) und Bestand-Schaltflächen ohne Ziel (T:271–276) weichen vom Design ab. Das Design gilt, die Ziele stammen aus D:78–79 und B:315.
5. Die Eyebrow „Moschee“ gibt es nur im Design (D:20). tr und en stammen aus header.mosque.title (L:280, 538), gleicher Begriff.
6. Bestand-Hover mit Anheben (T:245) widerspricht W:20 („keine Sprünge“). Das Design gilt.
7. Gemeindename: „IGMG Fatih Camii Wetzlar“ (D:20, D:76; L:211) gegen „IGMG Wetzlar“ (W:3; L:206).

## OFFENE FRAGEN
1. Gilt 1976 („Über uns“) oder 1975 (Vorstand)? (B:243)
2. Die Erzählung „im Keller eines Hauses“, die Anwohnerbeschwerden und „eigenes Eigentum“ ohne Jahr (L:221–222) hat im Bestand keinen Beleg. Die Gemeinde soll sie bestätigen.
3. Die Zeile L:485 mit den Ersatzzeichen muss im Bestand korrigiert werden.
4. Sollen leadership und currentBoard auf dieser Seite erscheinen oder beim Vorstand bleiben?
5. Die Überschrift „Werden Sie Teil unserer Geschichte“, der Aufruftext und „Kontakt aufnehmen“ haben keine tr- und en-Fassung. Der ähnliche joinUs-Titel (L:205, 463, 721: „Werden Sie Teil unserer Gemeinde“) ist ein anderer Text. Übersetzungen sind neu und gehören in MENSCHEN.md.
6. Lokalisierte Pfade für /tr und /en (K-03) sind nicht festgelegt.
7. Der aktuelle Standort Philipsstraße hat keine Hausnummer. Die Anschrift bleibt [Adresse] (B:225).
8. Die abgeleiteten tr- und en-Jahresmarken (İlk yıllar, Büyüme dönemi, Gelecek; Early years, Growth period, Future) sind zu bestätigen.

=== ENDE S08 · BEREIT ZUR RÜCKGABE ===
