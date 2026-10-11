# S06 · Seitenblatt „Nachrichten (Liste)“

Rolle Kundschafter · Kern-Version 1.0 · Fundstellen als Datei:Zeile. Bestand unter uploads/igmg-wetzlar-website/src/app/components/.

## SEITE

03.5 Nachrichten (Laufbuch.dc.html:158). Design News.dc.html (73 Zeilen), Code News.tsx. Root lang="de" (News.dc.html:15). Hintergrund #FCFAF6, Text #1D1A17, Atkinson Hyperlegible Next 18 px, Zeilenhöhe 1,6 (News.dc.html:13, 15).

## ROUTE

/nachrichten (de, K-03). Detail: /nachrichten/[slug] (NewsDetails, Laufbuch.dc.html:313). tr- und en-Pfade: – (in den Quellen nicht festgelegt).

## QUELLEN

- Design: News.dc.html, Template und Script vollständig.
- Bestand: News.tsx (461 Zeilen) vollständig; NewsSection.tsx nur Startseiten-Teaser; LanguageContext.tsx gezielt (news 113–115, 371–373, 629–631; header.mosque 21–27, 279–285, 537–543; events.recommended 105, 363, 621).
- Hilfen: readme.md (43 Zeilen), 00 Laufbuch.dc.html (324 Zeilen), vollständig.
- Nicht gelesen (eigene Blätter): NewsCard, Header, PrayerTimesBar, Breadcrumbs, PageHeader, Footer, Icon. Ignoriert: ~/Downloads/CLAUDE.md (anderes Projekt).

## ZWECK

Übersicht aller Nachrichtenbeiträge mit Kategoriefilter. Die sechs Beiträge im Design sind Beispielinhalte (Laufbuch.dc.html:238).

## ABSCHNITTE

Aufbau von oben nach unten; gemeinsame Teile nur benannt:

1. Header: active="moschee", current="news", sticky (News.dc.html:16). PrayerTimesBar (:17). Breadcrumbs: label="Neuigkeiten" (:18).
2. main: Container inline-size, max. 1344 px, Abstand 32 px (:19–21). PageHeader: eyebrow, title, subtitle (:20).
3. Filterzeile: Gruppe aria-label „Kategorie“, Chips mit Icon check 16 px bei aktivem Chip; Hinweis „Neueste“ mit Icon funnel 20 px (:22–29).
4. Raster: auto-fill ab 340 px, Lücke 24 px. NewsCard variant="default", cta="Weiterlesen", item (:31–33).
5. Leerzustand: Icon message-square 32 px, Überschrift Source Serif 4, 30 px, Button „Alle“ (:37–42). Footer (:47).

Schlüssel: UI-Texte in messages/{de,tr,en}.json (K-02). Beitragstexte siehe DATEN.

### Kopf und Filter

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| header.mosque.title (Eyebrow) | Moschee | Cami | Mosque | News.dc.html:20; LanguageContext.tsx:22, 280, 538 (abgeleitet) |
| news.list.title | Nachrichten | Haberler | News | News.dc.html:20; News.tsx:31, 72, 113 |
| news.list.subtitle | Aktuelle Nachrichten und Ankündigungen der IGMG Wetzlar Moschee | IGMG Wetzlar Camii'nin güncel haberleri ve duyuruları | Latest news and announcements from IGMG Wetzlar Mosque | News.dc.html:20; News.tsx:32, 73, 114 |
| header.mosque.news (Breadcrumb) | Neuigkeiten | Haberler | News | News.dc.html:18; LanguageContext.tsx:27, 285, 543 |
| news.filter.category (aria-label) | Kategorie | Kategori | Category | News.dc.html:23; News.tsx:44, 85, 126 |
| news.categories.* (7 Chips, Design-Reihenfolge) | Alle, Ankündigungen, Gemeinde, Veranstaltungen, Bildung, Religiös, Soziales | Tümü, Duyurular, Cemaat, Etkinlikler, Eğitim, Dini, Sosyal | All, Announcements, Community, Events, Education, Religious, Social | News.dc.html:51; News.tsx:34–40, 75–81, 116–122 |
| news.filter.latest | Neueste | En son | Latest | News.dc.html:28; News.tsx:45, 86, 127 |

### Beitragskarte

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| news.card.meta (5 Angaben) | Veröffentlicht am, von, min Lesezeit, Aufrufe, Kommentare | Yayınlanma tarihi, yazan, dk okuma süresi, görüntülenme, yorum | Published on, by, min read, views, comments | News.dc.html:53; News.tsx:51–55, 92–96, 133–137 |
| news.card.readMore | Weiterlesen | Devamını oku | Read more | News.dc.html:33; News.tsx:56, 97, 138 |
| news.card.featured (Badge) | Empfohlen | Önerilen | Recommended | News.dc.html:55, 57, 59 (featured); LanguageContext.tsx:105, 363, 621; Rendering im NewsCard-Blatt |
| news.card.imagePlaceholder | Foto: [Titel] | – (nur DE in Quelle) | – (nur DE in Quelle) | News.dc.html:61 |

### Beispielbeiträge (Reihenfolge wie Design)

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| db.news.1.title (religious, featured) | Ramadan 2024: Programm und Zeiten | Ramazan 2024: Program ve Saatler | Ramadan 2024: Schedule and Times | News.dc.html:55; News.tsx:161 |
| db.news.1.excerpt | Erfahren Sie alles über unser Ramadan-Programm mit Iftar-Zeiten, Tarawih-Gebeten und besonderen Veranstaltungen. | İftar saatleri, teravih namazları ve özel etkinliklerle Ramazan programımız hakkında her şeyi öğrenin. | Learn everything about our Ramadan program with Iftar times, Tarawih prayers and special events. | News.dc.html:55; News.tsx:162 |
| db.news.2.title (education) | Neue Korankurse für Erwachsene starten | Yetişkinler için yeni Kuran kursları başlıyor | New Quran courses for adults starting | News.dc.html:56; News.tsx:175 |
| db.news.2.excerpt | Ab April bieten wir neue Korankurse für Erwachsene an. Anmeldungen ab sofort möglich. | Nisan ayından itibaren yetişkinler için yeni Kuran kursları sunuyoruz. Kayıtlar hemen başlayabilir. | Starting in April, we offer new Quran courses for adults. Registration is now open. | News.dc.html:56; News.tsx:176 |
| db.news.3.title (social, featured) | Gemeinschaftsküche: Hilfe für Bedürftige | Toplum Mutfağı: İhtiyaç sahiplerine yardım | Community Kitchen: Help for those in need | News.dc.html:57; News.tsx:189 |
| db.news.3.excerpt | Unsere neue Gemeinschaftsküche versorgt täglich bedürftige Familien mit warmen Mahlzeiten. | Yeni toplum mutfağımız her gün ihtiyaç sahibi ailelere sıcak yemek sağlıyor. | Our new community kitchen provides warm meals to families in need every day. | News.dc.html:57; News.tsx:190 |
| db.news.4.title (events) | Jugendcamp 2024 Anmeldungen offen | Gençlik Kampı 2024 kayıtları açık | Youth Camp 2024 registration open | News.dc.html:58; News.tsx:203 |
| db.news.4.excerpt | Das diesjährige Jugendcamp findet vom 15.-22. Juli statt. Begrenzte Plätze verfügbar. | Bu yılki gençlik kampı 15-22 Temmuz tarihleri arasında yapılacak. Sınırlı kontenjan mevcut. | This year's youth camp takes place from July 15-22. Limited spots available. | News.dc.html:58; News.tsx:204 |
| db.news.5.title (announcements, featured) | Moscheererweiterung genehmigt | Cami genişletme projesi onaylandı | Mosque expansion approved | News.dc.html:59; News.tsx:217 |
| db.news.5.excerpt | Die Stadtverwaltung hat unseren Erweiterungsplan genehmigt. Bauarbeiten beginnen im Herbst. | Belediye genişletme planımızı onayladı. İnşaat çalışmaları sonbaharda başlayacak. | The city administration has approved our expansion plan. Construction work begins in autumn. | News.dc.html:59; News.tsx:218 |
| db.news.6.title (community) | Interreligiöser Dialog erfolgreich | Dinlerarası diyalog başarılı | Interfaith dialogue successful | News.dc.html:60; News.tsx:231 |
| db.news.6.excerpt | Das erste interreligiöse Dialogtreffen war ein voller Erfolg mit über 100 Teilnehmern. | İlk dinlerarası diyalog toplantısı 100'den fazla katılımcıyla büyük başarı oldu. | The first interfaith dialogue meeting was a great success with over 100 participants. | News.dc.html:60; News.tsx:232 |

Autoren (A5, nicht ausgeschrieben): Beitrag 1 [Name – Imam] (de, en), [Name – İmam] (tr), News.tsx:164. Beitrag 2 [Name – Hafiza] (de, en), [Name – Hafız] (tr), News.tsx:178. Beitrag 3 Sosyal Hizmetler Komitesi (de, tr); Social Services Committee (en), News.tsx:192. Beitrag 4 Gençlik Teşkilatı (de, tr); Youth Organization (en), News.tsx:206. Beitrag 5 Vorstand, Yönetim Kurulu, Board of Directors, News.tsx:220. Beitrag 6 Dialog Komitesi, Diyalog Komitesi, Dialogue Committee, News.tsx:234.

Datum (de: News.dc.html:55–60, Wochentage geprüft; tr und en abgeleitet aus News.tsx:257): So., 10. März 2024; Fr., 8. März 2024; Di., 5. März 2024; So., 3. März 2024; Fr., 1. März 2024; Mi., 28. Feb. 2024. Abgeleitet: tr „10 Mart 2024“, en „March 10, 2024“.

### Leerzustand

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| news.empty.title | Keine Nachrichten gefunden | Haber bulunamadı | No news found | News.dc.html:40; News.tsx:67, 108, 149 |
| news.empty.description | Versuchen Sie es mit anderen Suchkriterien oder schauen Sie später wieder vorbei. | Farklı arama kriterlerini deneyin veya daha sonra tekrar bakın. | Try different search criteria or check back later. | News.dc.html:41; News.tsx:68, 109, 150 |
| news.categories.all (Button) | Alle | Tümü | All | News.dc.html:42; News.tsx:34, 75, 116 |

Paginierung (nur Bestand, ab 7 Treffern; News.tsx:61–64, 102–105, 143–146): de „Vorherige, Nächste, Seite, von“, tr „Önceki, Sonraki, Sayfa, den“ (tr-Wort prüfen), en „Previous, Next, Page, of“.

## DATEN

Vorschlag für die Tabelle news (Feld, Typ, mehrsprachig):

- slug: Text, eindeutig, nein (Route /nachrichten/[slug]).
- title: Text, ja. de Pflicht, tr und en optional mit sichtbarem Rückfall auf de. Zweizeilig gekürzt (News.tsx:367).
- excerpt: Text, ja. Dreizeilig gekürzt (News.tsx:372).
- category: Enum mit sechs Werten, nein. Bezeichnungen aus messages.
- featured: Boolean, nein.
- publishedAt: Datum, Zeitzone Europe/Berlin (Vorschlag; News.tsx:256 parst ohne Zeitzone), nein. Absteigend sortiert.
- author: Text, nein. Personennamen nur mit Freigabe.
- readMinutes, views, comments: Ganzzahl, nein. Herkunft der Zähler offen.
- image: Speicherverweis, Alt-Text ja. body: Langtext, ja; nur Detailseite (News.tsx:163).

Abfrage: Filter category, Sortierung publishedAt absteigend, Seitengröße 6 (News.tsx:27) bei Paginierung. Die sechs Beispiele nicht als Echtdaten seeden (Laufbuch.dc.html:238).

## FORMULARFELDER

– (entfaellt, keine Eingabefelder; die Filter sind Schaltflächen, siehe INTERAKTIONEN).

## INTERAKTIONEN

- Kategorie-Chip (7): setzt den Filter und aria-pressed (News.dc.html:25, 67). Der Bestand setzt zusätzlich Seite 1 (News.tsx:304–307).
- Weiterlesen öffnet NewsDetails (Laufbuch.dc.html:313). Der Bestand übergibt keine Beitrags-ID (News.tsx:410); die Startseite übergibt sie (NewsSection.tsx:115).
- Teilen: kein Ziel im Design (News.dc.html:61); Bestand ohne Aktion (News.tsx:415–420).
- Button „Alle“ im Leerzustand setzt den Filter auf all (News.dc.html:42, 68).
- Paginierung nur im Bestand, ab 7 Treffern: Vorherige und Nächste, an den Grenzen deaktiviert (News.tsx:428–454).
- „Neueste“ ist nur Beschriftung (News.dc.html:28). Die Startseite verlinkt „Alle Neuigkeiten anzeigen“ hierher (NewsSection.tsx:167–172).

## ZUSTAENDE

- state (data-props, News.dc.html:50; Laufbuch.dc.html:158): Optionen liste | leer, Default liste, tsType 'liste'|'leer'. leer leert die Liste (News.dc.html:66) und zeigt den Leerzustand (:37).
- cat (intern, News.dc.html:63): all (Default), announcements, community, events, education, religious, social.
- Abgeleitet (News.dc.html:66–68): news, cats, hasNews, isEmpty, resetFilter. Jede Kategorie hat genau einen Beitrag (News.dc.html:55–60); der Leerzustand ist nur über state=leer erreichbar.
- Bestand: selectedCategory 'all', currentPage 1 (News.tsx:25–26); Leerzustand bei null Treffern (News.tsx:327); Paginierung nur bei mehr als einer Seite (News.tsx:428).
- Nicht vorhanden: Laden, Fehler, Erfolg; die Daten sind statisch (News.tsx:157). Sprache: de, tr, en (News.tsx:23).

## BILDER

- Design: kein Foto; je Karte Platzhalter „Foto: [Titel]“ (News.dc.html:61), beschriftete Streifen (readme.md:22). Echte Fotos fehlen (Laufbuch.dc.html:233).
- Bestand: je Beitrag externe Bildadresse, Parameter 600×300 (abgeleitet 2:1; News.tsx:168–238). Nicht übernehmen (Laufbuch.dc.html:34). Alt-Text ist der Titel (News.tsx:346); Bildhöhe 192 px (News.tsx:343).

## AUFFAELLIGKEITEN

1. Titel: „Nachrichten“ in Design und News.tsx (News.dc.html:20; News.tsx:31) gegen „Neuigkeiten“ mit anderem Untertitel (LanguageContext.tsx:114–115).
2. Datum: „März“ (News.dc.html:55) gegen „Feb.“ (News.dc.html:60); readme.md:12 nennt „Sa., 2. Aug.“, Laufbuch.dc.html:193 „Mo., 28. Juli 2025“.
3. Paginierung nur im Bestand (News.tsx:27, 428–454); das Design zeigt keine Seitenzahl.
4. Leerzustand nennt „Suchkriterien“ (News.dc.html:41; News.tsx:68), es gibt aber keine Suche. Der Suchtext „Nach Nachrichten suchen...“ (News.tsx:43) wird nicht gerendert.
5. Beispiele von Feb./März 2024 (News.tsx:165–235); die Startseite zeigt Juli 2025 (NewsSection.tsx:16–46). Beide widersprechen sich.
6. Teilen ohne Beschriftung und Aktion im Bestand (News.tsx:415–420); Laufbuch.dc.html:217 verlangt aria-label. Texte: News.tsx:57, 98, 139.
7. „Featured“ steht im Bestand fest auf Englisch (News.tsx:351–352).
8. Kategoriefarben: sand, ocker, blau, gruen, petrol (News.dc.html:51) gegen purple, blue, green, emerald, orange (News.tsx:265–272).
9. Zahlen „1.250“ im Design (News.dc.html:55) gegen „1250“ im Bestand (News.tsx:393). Breite 1344 px (News.dc.html:21) gegen 1280 px (readme.md:25).

## OFFENE FRAGEN

1. Gilt „Nachrichten“ oder „Neuigkeiten“ als Titel?
2. Wird die Paginierung ab sieben Beiträgen übernommen?
3. Was geschieht beim Klick auf „Teilen“?
4. Kommt ein Suchfeld, oder wird der Leerzustandstext angepasst?
5. Welche tr- und en-Pfade gelten für /nachrichten und /nachrichten/[slug] (K-03)?
6. Woher kommen Aufrufe und Kommentarzahl?
7. Ist „Neueste“ eine feste Beschriftung oder später eine Sortierung?
8. Gilt „Feb.“ oder „Februar“ im Datum?
9. Wie werden die Startseiten-Kategorien den Listenkategorien zugeordnet?
10. Gelten die Kategoriefarben des Designs oder des Bestands?

=== ENDE S06 · BEREIT ZUR RÜCKGABE ===
