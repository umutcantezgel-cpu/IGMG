# E0-KUNDSCHAFTER-03 · Ansichten und Inhalte (Rückgabe, vom Orchestrator abgelegt)

E0-KUNDSCHAFTER-03 · Rolle Kundschafter · Modell Haiku 5.5 · Stufe 1 · Kern vorläufig · Stand 11.10.2026

Hinweis zur Ablage: Die Datei _werkstatt/berichte/E0-KUNDSCHAFTER-03.md wurde nicht geschrieben, weil für Berichte keine Dateien angelegt werden. Der volle Text steht hier. Nur gelesen, nichts geändert. pnpm sprachen:pruefen nicht ausgeführt; Schlüsselzahlen aus eigener Leseauswertung. Befund = gesehen; VERMUTUNG = nicht belegt.

1. Öffentliche Routen (Dateien unter /home/user/IGMG/web/src/app/[locale]/(website)/)
| de · tr · en | Datei | Hauptkomponenten | Modus · Datenquelle |
| / · /tr · /en | page.tsx | Hero, Veranstaltungen, Neuigkeiten | statisch · ladeVeranstaltungen, ladeNachrichten |
| /gebetszeiten · /namaz-vakitleri · /prayer-times | gebetszeiten/page.tsx | GebetszeitenSeite, MonatsTabelle | statisch · ladeGebetszeitenFenster, ladeGebetszeitenMonat |
| …/anzeige · …/ekran · …/display | gebetszeiten/anzeige/page.tsx | AnzeigeLive (Vollbild) | statisch · ladeGebetszeitenFenster |
| /veranstaltungen · /etkinlikler · /events | veranstaltungen/page.tsx | VeranstaltungsFilter, EventCard | statisch · ladeVeranstaltungen |
| …/[slug] | veranstaltungen/[slug]/page.tsx | AnmeldeFormular | statisch (generateStaticParams) · ladeVeranstaltung, ladeAnmeldezahl |
| /nachrichten · /haberler · /news | nachrichten/page.tsx | NachrichtenFilter, NewsCard, Ankuendigungen | statisch · ladeNachrichten, ladeAnkuendigungen |
| …/[slug] | nachrichten/[slug]/page.tsx | RichText, AehnlicheArtikel | statisch · ladeNachricht |
| /ueber-uns · /hakkimizda · /about-us | ueber-uns/page.tsx | Zeitleiste, Werte, Aufruf | statisch · ladeSeiteninhalt(ueber-uns) |
| /vorstand · /yonetim · /board | vorstand/page.tsx | PersonCard | statisch · ladeSeiteninhalt(vorstand) |
| /projekte · /projeler · /projects | projekte/page.tsx | Bauprojekt, Spenden, Meilensteine | statisch · ladeSeiteninhalt(projekte) |
| /kontakt · /iletisim · /contact | kontakt/page.tsx | KontaktFormular, Anfahrt | statisch · ladeSeiteninhalt(kontakt) |
| /igmg (alle Sprachen) | igmg/page.tsx | IGMGTabs | statisch · ladeSeiteninhalt(igmg) |
| /quran · /kuran · /quran | quran/page.tsx | QuranAnsicht | statisch · ladeSeitenStand |
| …/[sure] | quran/[sure]/page.tsx | QuranAnsicht | statisch (5 Suren ohne Import) |
| /islamisches-wissen · /islami-bilgiler · /islamic-knowledge | islamisches-wissen/page.tsx | WissenInsel | statisch · ladeWissensInhalt, ladeWissensThemen |
| …/[thema] | islamisches-wissen/[thema]/page.tsx | ThemaInsel | statisch · ladeWissensThema |
| /organisationen/[organisation] (organizasyonlar, organizations) | organisationen/[organisation]/page.tsx | OrganizationPage | statisch (4 Slugs) · ladeSeiteninhalt, ladeVeranstaltungen, ladeNachrichten |
| /bildung/korankurse · /egitim/kuran-kurslari · /education/quran-courses | bildung/korankurse/page.tsx | CourseCard, AnmeldeKarte | statisch · ladeKurse |
| /bildung/voranmeldung · /egitim/on-kayit · /education/pre-registration | bildung/voranmeldung/page.tsx | VoranmeldungFormular | statisch · keine |
| /mitglied-werden · /uye-ol · /become-a-member | mitglied-werden/page.tsx | MitgliedsantragFormular | statisch · ladeSeiteninhalt(kontakt) |
| /webseite-fuer-moscheen · /camiler-icin-web-sitesi · /website-for-mosques | webseite-fuer-moscheen/page.tsx | MoscheeAnfrageFormular | statisch · keine |
| /meldung · /bildirim · /report | meldung/page.tsx | MeldungFormular | statisch · keine |
| /impressum · /kunye · /imprint | impressum/page.tsx | Rechtstext | statisch · ladeSeiteninhalt(impressum) |
| /datenschutz · /gizlilik · /privacy | datenschutz/page.tsx | Rechtstext | statisch · ladeSeiteninhalt(datenschutz) |
| /suche · /arama · /search | suche/page.tsx | Suchformular (GET) | dynamisch (searchParams) · suche() |
| /offline | offline/page.tsx | Statusblock | statisch · keine |
Pfade: /home/user/IGMG/web/src/i18n/routing.ts:18–47. Mitglied, Moschee-Anfrage, Meldung, Impressum und Datenschutz sind nicht im Menü, nur im Footer oder in Formularen verlinkt.

2. Inhalte
(a) Zeitleiste (Befund, drizzle/seeds/bereiche/ueber-uns.ts:44–105): fünf Stationen: „[Gründungsjahr] – Formerstraße“ (Platzhalter), „Frühe Jahre – Garbenheimerstraße“, „Wachstumsphase – Niedergirmeser Weg“, „2019 – Philipsstraße (aktueller Standort)“, „Zukunft – Wetzlar“. Vier Standorte: ja. 1976: nein. Nur 2019 ist ein Jahr im Live-Inhalt. 1976 steht im ungenutzten Namensraum (messages/de.json:193, :205).
(b) Projekte (Befund, drizzle/seeds/bereiche/projekte.ts:19–122): Status „in_planung“, Ort „[Ortsangabe]“, Beginn 2024, Fertigstellung 2026. Meilensteine: Genehmigungen (März 2024, erledigt), Architektenpläne (April 2024, erledigt), dann Grundsteinlegung (Sept. 2024), Rohbau (März 2025), Innenausstattung (Okt. 2025), Eröffnung (Jan. 2026), alle offen. Am 11.10.2026 liegen die offenen Termine in der Vergangenheit. Spendenstand: gesammelt und Ziel null (:50–51), nur Platzhalter; Bankverbindung Platzhalter (:52). Aus Bestand/Design: Name, Beschreibung, 500 Gläubige, 1.200 m², Einrichtungen. Alles istBeispiel = true.
(c) Organisationen (Befund, drizzle/seeds/bereiche/organisationen.ts; Farben src/app/globals.css:32–43):
| Slug | Kürzel | Akzent | Termine kommend (gesamt) | Öffnungszeilen | Meldungen |
| ana-teskilati | at | org-at #047857 | 2 (4) | 3 | 0 |
| kadin-teskilati | kt | org-kt #592e81 | 1 | 2 | 0 |
| genclik-teskilati | gt | org-gt #008c98 (nur Fläche) | 1 | 4 | 0 |
| kadin-genclik-teskilati | kgt | org-kgt #9b255a | 1 | 3 | 0 |
Je vier Aktivitäten und drei Langtexte, gleich dicht. Am reichsten: AT bei Terminen, GT bei Öffnungszeiten. Im Seed-Stand sind die Meldungen überall leer: Seed-Nachrichten haben keine Organisation (drizzle/seeds/index.ts, Funktion nachrichten).
(d) Gebetszeiten (Befund):
- Quelle: ladeGebetszeitenFenster (src/server/queries/gebetszeiten.ts:29–62), 47 Tage von gestern bis +45. Import, sonst berechneTag (src/lib/gebetszeiten/berechnung.ts:30; adhan, Turkey, Shafi). Seed ohne Import und bestaetigt=false (drizzle/seeds/index.ts:144–155): Hinweis „berechnet“ auf jeder Seite.
- Datenform: {datum, imsak, gunes, ogle, ikindi, aksam, yatsi, quelle} (src/lib/gebetszeiten/typen.ts:1–4).
- Namen de · tr · en (messages/de.json:647–656): Imsak · Aufgang · Dhuhr · Asr · Maghrib · Isha | İmsak · Güneş Doğuşu · Öğle · İkindi · Akşam · Yatsı | Imsak · Sunrise · Dhuhr · Asr · Maghrib · Isha.
- Nächste Zeit: PrayerTimesBar.tsx rendert LeisteLive (src/components/website/leiste/LeisteLive.tsx:45–55, Client). Uhr: useJetzt (src/lib/zeit/useJetzt.ts:17–20, Takt 30 s; Kommentar sagt „minütlich“). Rechnung: naechstesGebet (src/lib/gebetszeiten/naechstes.ts:53), ohne Aufgang; nach Yatsı Imsak des Folgetags; Restzeit aufgerundet (:70).

3. Startseite (page.tsx)
1. Kopf: Header mit öffentlichem Link „Anmelden“ (src/components/website/Header.tsx:72), PrayerTimesBar mit „berechnet“, Konzept-Dialog.
2. Hero (:41–69): H1 „IGMG Wetzlar“, Ziele /mitglied-werden und /ueber-uns, Foto-Platzhalter.
3. Veranstaltungen (:70–100): nur kommende, max. 6. Berechnet für 11.10.2026: fünf wöchentliche Beispieltermine.
4. Neuigkeiten (:102–): Aufmacher ist die erste empfohlene Nachricht (:35), „Neue Gebetszeiten für den Winter“ (20.07.2025), dazu drei weitere, alle aus 2024/2025.
5. Nicht sichtbar: JSON-LD „Mosque“ aus den Kontaktdaten (:37; src/lib/seo/jsonld.ts:72–86).
Platzhalter oder Beispiel: Foto, Adresse, Telefon, Termine, Nachrichten. Die Kennzeichnung istBeispiel erscheint öffentlich nie, nur im iCal-Titel (src/server/ical/veranstaltungen.ts:28).

4. Abläufe
A. Nächste Gebetszeit: Leiste auf jeder Seite außer Gebetszeiten, oder /gebetszeiten (Tab Heute, Karte „Nächstes Gebet“). Vollbild /gebetszeiten/anzeige (Esc oder X; Sprache wechselt alle 10 s, AnzeigeLive.tsx:64). Keine Server Action; der Browser rechnet.
B. Veranstaltung anmelden: /veranstaltungen (Kategoriefilter) → /veranstaltungen/[slug] → Formular nur bei anmeldungAktiv (Name, E-Mail, Telefon, Personen, Einwilligung, Honigtopf, ALTCHA) → meldeAn (src/server/actions/formulare/veranstaltungsanmeldung.tsx:39): Plätze prüfen, speichern, Bestätigung an Absender, Benachrichtigung an rolle:veranstaltungsanmeldung:<org>.
C. Kurs und Voranmeldung: /bildung/korankurse (CourseCard.tsx:18–19: „register“ führt zur Voranmeldung, „join“ auf /kontakt#karte, „closed“ ohne Aktion) → Voranmeldung in vier Schritten (src/lib/validierung/formulare/voranmeldung.ts:62–67) → sendeVoranmeldung (src/server/actions/formulare/voranmeldung.tsx:20).
D. Kontakt: /kontakt → sendeKontakt (src/server/actions/formulare/kontakt.tsx:19). /meldung → sendeMeldung (meldung.tsx:34) legt ein Ticket an. Gemeinsame Schutzkette: src/lib/formulare/verarbeiten.ts:52–78 (Rate, Honigtopf, ALTCHA, Zod), :93–183 (speichern, Mail nach der Antwort).

5. Verwaltung (Module: src/components/verwaltung/shell/module.ts:28–67; Rechte: src/lib/rechte/matrix.ts)
- Grundrechte, alle Rollen: Dashboard, Postfach, Tickets, Medien, Styleguide.
- Neuigkeiten, Veranstaltungen, Ankündigungen: *.lesen für administration, redaktion, organisationsredaktion (nur eigene Organisation).
- Seiteninhalte: seiteninhalt.lesen oder organisationsinhalt.bearbeiten. Kurse: kurs.lesen (administration, bildung). Gebetszeiten: gebetszeiten.lesen (administration, redaktion).
- Eingänge: je Art eingang.<art>.lesen; Kontakt und Moschee-Anfrage nur administration.
- Benutzer, Audit, Einstellungen: nur administration.
„Administration“ ist keine eigene Prüfung. Die Rolle erhält über MATRIX (matrix.ts:86) alle Aktionen. Seiten rufen verlangeSeitenRecht (src/lib/rechte/pruefe.ts:61), Actions verlangeRecht (:71), dazu darf() (matrix.ts:149). Schutz der letzten Administration: src/lib/rechte/administration.ts:17.
Startklar-Cockpit ohne Änderung am Rechte-Modell: Lesezugriff über audit.lesen oder einstellung.bearbeiten (beide nur administration). Nötig sind Modul-Eintrag, Icon (src/components/verwaltung/shell/Seitenleiste.tsx:28) und Texte. Eine eigene Aktion würde matrix.ts:15 ändern und die Vollständigkeitsprüfung in tests/integration/verwaltung/rechte-matrix.test.ts:1091 auslösen. OFFENE FRAGE.

6. Sprachen
- 1.166 Schlüssel je Sprache (ohne verwaltung; nur de: 1.814). Eigene Auswertung: fehlend 0, überzählig 0, leer 0. Fünf Abweichungen bei Platzhaltern entstehen durch meine vereinfachte Erkennung von Plural-Formen; nicht mit dem Projekt-Werkzeug geprüft. Identisch mit de: tr 80, en 107 (Namen, Abkürzungen).
- Namensraum bestand (165 Blätter je Sprache) wird in src/ nicht verwendet. VERMUTUNG: Bestandsrest, mit dem 1976-Text.
- messages/neu-uebersetzt.json: Feld _hinweis, dann je Sprache (tr, en, de) Listen von Schlüsselpfaden, 14 Wildcards `präfix.*`. Markiert: 532 (tr) und 538 (en) von 1.166. Nur von Hand gepflegt; kein Skript und keine Anzeige nutzt sie. Veraltet: de „suche.laden“ fehlt in der Datei.
- Ohne tr/en-Fassung erscheint „Nur auf Deutsch verfügbar“ (messages/de.json:700).

7. Fehler- und Sonderseiten
- 404: [locale]/[...rest]/page.tsx ruft notFound() auf; [locale]/not-found.tsx (noindex).
- global-error.tsx mit eigenem html/body; Texte aus messages/bereiche/fehlergrenze.json.
- Offline: (website)/offline/page.tsx; public/sw.js hält Startseite und Gebetszeiten vor.
- Fehlen: route-level error.tsx, loading.tsx, default.tsx. Fünf dynamische Routen nutzen Suspense mit fallback={null}.
- Leerzustände: eine generische Komponente (veranstaltungen/Leerzustand.tsx), sonst Einzeiler; Ankündigungen rendern bei leerer Liste nichts.

8. Befunde (Priorität)
1. Konzept-Dialog ist an (drizzle/seeds/index.ts:144) und sagt „Alle angezeigten Daten sind fiktiv“. Die Verwaltung kann ihn nicht ausschalten: der einzige Einstellungs-Schreibweg ist die Löschfrist-Aktion (src/server/actions/einstellungen.ts:12). KonzeptHinweis.tsx:22 beschreibt aber einen Schalter.
2. Beispielwerte live: Footer zeigt „Jetzt geöffnet“ aus Beispiel-Öffnungszeiten (src/components/website/Footer.tsx:100–109), dazu info@igmg-wetzlar.de in Footer und JSON-LD.
3. Build: vercel-build seedet eine PGlite-Datenbank (package.json; scripts/bau-datenbank.mjs), die Seiten werden damit vorgerendert. OFFENE FRAGE: Ist die Betriebsdatenbank gefüllt?
4. Vorstand: @igmg-wetzlar.de-Adressen öffentlich als mailto (drizzle/seeds/bereiche/vorstand.ts:39, :53; PersonCard.tsx:114–123), Herkunft Bestand, ungeprüft.
5. Gründungsjahr widerspricht sich: „Führung seit 1975“ (drizzle/seeds/bereiche/vorstand.ts:32, Anzeige vorstand/page.tsx:74) gegen „[Gründungsjahr]“ auf Über uns.
6. „Jetzt Spenden“ führt auf #spenden derselben Seite (src/components/website/projekte/Spenden.tsx:62). Kein Zahlungsweg.
7. Platzhalter im Fließtext: „[Zahl fehlt: Zweigstellen]“ (drizzle/seeds/bereiche/igmg.ts:87–89).
8. Quran: Untertitel verspricht „Übersetzung und Tafsir“ (messages/bereiche/quran.json:7), Tafsir fehlt im Code. Sitemap ohne Quran-Seiten (src/app/sitemap.ts:17–33).
9. Wissen: sechs Videos ohne Quelle (drizzle/seeds/bereiche/wissen.ts:148).
10. VERMUTUNG: Gebetszeiten-Koordinaten 50,567/8,5 (src/lib/gebetszeiten/typen.ts:35–36) liegen nach meiner Kenntnis etwa 1,5–2 km nördlich des Zentrums (ca. 50,55/8,50). Prüfen.
11. VERMUTUNG: Sprachwechsel alle 10 s im role="status"-Feld (AnzeigeLive.tsx:212) kann Ansagen auslösen.

OFFENE FRAGEN
- Wer schaltet den Konzept-Hinweis ab, und mit welcher Funktion?
- Gründungsjahr: 1975, 1976 oder Platzhalter?
- Projektstand und Spendenwege durch die Gemeinde?
- Sind die Vorstandspostfächer aktiv?
- Welche Daten hat die Betriebsdatenbank?
- Cockpit: vorhandenes Recht oder eigene Aktion?
- Gebetszeiten-Koordinaten bestätigen.

=== ENDE E0-KUNDSCHAFTER-03 · BEREIT ZUR RÜCKGABE ===
