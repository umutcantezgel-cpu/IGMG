# V09 · Verwaltung: Nachrichten (internes Postfach)

V09 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Schwierigkeit 1

## SEITE

Verwaltung: Nachrichten (internes Postfach), Abschnitt `messages` des Admin-Dashboards. Teil von Artboard 07.3 Admin-Dashboard (00 Laufbuch.dc.html:175). Wurzel `data-screen-label="07.3 Admin-Dashboard"`, `lang="de"` (Dashboard.dc.html:15).

## ROUTE

Ziel-Route `/verwaltung/nachrichten` (Vorgabe des Orchestrators; im Laufbuch nicht belegt). Der Bestand hat keinen Pfad: App.tsx:53–56 wählt Seiten über IDs (Fall `dashboard`); der Abschnitt `messages` ist nur `activeSection` (Dashboard.tsx:154, 1185–1186). Entwurf: Sidebar-Eintrag (Dashboard.dc.html:24). Laufbuch-Linkliste: Konto führt auf Dashboard, nicht auf Nachrichten (00 Laufbuch.dc.html:309).

## QUELLEN

- Design (nur gelesen): Dashboard.dc.html, Template 9–108, Daten 110–160, Abschnitt 59–70.
- Bestand (nur gelesen): uploads/igmg-wetzlar-website/src/app/components/Dashboard.tsx, Interfaces 114–136, Startdaten 332–353, Sidebar 355–362, Chat-Bereich 754–960, Kopf 1197–1198; App.tsx:53–56.
- Hilfen: readme.md:7, 12–25; 00 Laufbuch.dc.html:35, 175, 185, 193, 215, 239, 266, 289, 299, 309.
- Zusatz: LanguageContext.tsx (readme.md:7 nennt es als Textquelle): Dashboard-Blöcke 126–139, 384–397, 642–655; Einzelschlüssel 114, 127, 130, 168, 372, 385, 389, 426, 630, 643, 647, 684.

## ZWECK

Internes Postfach der Verwaltung: Unterhaltungen in zwei Spalten lesen (Liste links, Verlauf rechts), in der Liste suchen, ungelesene Unterhaltungen erkennen und eine Nachricht eingeben. Zugriff nur für berechtigte Rollen, serverseitig geprüft (Kern K-06). Alle Formulardaten gelten als besonders schutzwürdig (Kern G-07).

## ABSCHNITTE

Aufbau von oben nach unten:

1. `Header` (dc-import; `active=""`, `current="dashboard"`, `logged-in="{{ true }}"`, sticky; Dashboard.dc.html:16).
2. `PrayerTimesBar` (dc-import; :17).
3. `Breadcrumbs` (dc-import; `label="Dashboard"`; :18).
4. `main`, maximal 1440 px, Umbruch, Abstand 24 px (:19).
5. Sidebar `aside`, 280 px, schmal 100 % (:20–26): Titel, Untertitel, Menü-Button (nur schmal), Navigation mit sechs Einträgen (:111, :139).
6. Abschnitt `messages` (:59–70), Rahmen #DFDAD2, Radius 12, mindestens 520 px hoch.
   a. Liste, flex 1 1 300px, rechte Linie (:61–64): Kopf mit Überschrift, Schaltfläche, Suchfeld; Liste.
   b. Verlauf, flex 2 1 360px, Hintergrund #FCFAF6 (:65–68): Leerzustand oder Kopf, Nachrichten, Eingabe.
7. `Footer` (dc-import; :86).
8. Dialog-Rahmen (:88–107) ist inaktiv (dialog="none"); seine Texte gehören nicht zu V09.

Komponenten: Header, PrayerTimesBar, Breadcrumbs, Footer (je eigenes Blatt). Icon: menu, layout-dashboard, newspaper, calendar, megaphone, message-square, ticket (Navigation, 20 px), message-square 48 px (:66), plus, search, send (20 px; :62, :67). Bedienelemente mindestens 48 px hoch, Rand #8C857C (readme.md:21).

Texte (A2):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| nav.dashboard | Dashboard | Panel | Dashboard | Dashboard.dc.html:111; LanguageContext.tsx:385, 643 (abgeleitet) |
| nav.news | Neuigkeiten | Haberler | News | Dashboard.dc.html:111; LanguageContext.tsx:372, 630 (abgeleitet) |
| nav.events | Veranstaltungen | Etkinlikler | Events | Dashboard.dc.html:111; LanguageContext.tsx:389, 647 (abgeleitet) |
| nav.rest | Ankündigungen · Nachrichten · Tickets | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:111 |
| aside.text | Admin Dashboard · IGMG Wetzlar Verwaltung · Menü öffnen · Dashboard-Bereiche | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:21, 23 |
| msg.head | Nachrichten · Neue Nachricht · Unterhaltungen · Unterhaltungen durchsuchen... · Online | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:62, 63 |
| msg.empty | Wählen Sie eine Unterhaltung · Beginnen Sie eine Unterhaltung aus der Liste links | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:66 |
| msg.input | Nachricht | Mesaj | Message | Dashboard.dc.html:67; LanguageContext.tsx:168, 426, 684 (abgeleitet) |
| msg.send | Senden | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:67 (neuer Bedientext, 00 Laufbuch.dc.html:299) |
| msg.partner | [Name – Vorsitzender] · [Name – Frauen-Koordinatorin] · [Name – Jugend-Koordinator] · [Name – Bibliothekarin] | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:114 (A5) |
| msg.preview | Die Freitagspredigt ist vorbereitet · Der Kochkurs läuft sehr gut! · Das Fußballturnier ist organisiert · Neue Bücher sind angekommen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:114 (Beispieldaten, 00 Laufbuch.dc.html:289) |
| msg.time | 18.03., 15:30 · 18.03. · 17.03. (Liste); 14:15 Uhr · 15:30 Uhr (Verlauf) | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:114, 155 |
| msg.bubble | Hallo, können wir über das Ramadan-Programm sprechen? | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:155 |

## DATEN

Vorschlag für PostgreSQL mit Drizzle (Kern K-05); Felder ohne Fundstelle sind abgeleitete Vorschläge. Alle Felder einsprachig, da der Entwurf nur Deutsch zeigt. Zeitstempel in UTC, Anzeige Europe/Berlin.

- Unterhaltung: id (uuid); Teilnehmende (Verknüpfung zu Konten, uuid); Name und Funktion der Gegenseite aus dem Konto (text; Dashboard.tsx:128–129); letzte Vorschau und letzte Zeit (abgeleitet aus letzter Nachricht; Dashboard.tsx:130–131).
- Teilnahme: user_id (uuid), last_read_at (timestamptz); Ungelesen-Zähler abgeleitet (Dashboard.tsx:132; Dashboard.dc.html:63).
- Nachricht: id, conversation_id, sender_id (uuid); body (text, Personendaten); created_at (timestamptz; Dashboard.tsx:119); status (enum sent/delivered/read, nur eigene; :121); reply_to_id (uuid, optional, offen; :122); message_type (enum text/image/file, offen; :123).
- Online-Anzeige: nicht gespeichert, aus der Sitzung abgeleitet (Vorschlag; Dashboard.tsx:133).
- Avatar: kein Feld; Initialen abgeleitet (Dashboard.tsx:134, 800).
- Suche: serverseitig über Name und Vorschau (Dashboard.tsx:783–785).
- Audit und Löschung: jeder Zugriff auf Personendaten im Audit-Log, Export, Löschung, einstellbare Löschfrist (Kern G-07). Seeds nur mit fiktiven Testpersonen (G-04).

## FORMULARFELDER

- Nachricht: Textfeld, id `db-msg`, sr-Beschriftung, kein Platzhalter (Dashboard.dc.html:67). Bestand: Platzhalter „Nachricht eingeben...“ (Dashboard.tsx:928). Pflicht und Länge offen. Fehlertext am Feld nicht gestaltet. Zod-Schema für Client und Server (Kern K-07).
- Unterhaltungen durchsuchen: Typ search, id `db-conv`, sr-Beschriftung „Unterhaltungen“ (Dashboard.dc.html:62). Kein Absenden; Filter live im Bestand (Dashboard.tsx:759–762, 783–785).

## INTERAKTIONEN

- Sidebar-Eintrag: wechselt den Abschnitt und schließt das Menü (Dashboard.dc.html:24, 138; Dashboard.tsx:1208–1211).
- Menü öffnen (nur schmal): klappt die Navigation auf oder zu (:21, :150).
- Unterhaltung wählen: zeigt den Verlauf und markiert die Zeile (:63, :154; Dashboard.tsx:789). Der Ungelesen-Zähler bleibt in beiden Quellen bestehen; Ablauf offen.
- Suche tippen: im Entwurf ohne Ablauf (:62). Bestand filtert nach Name oder Vorschau (Dashboard.tsx:783–785). Lupe im Bestand ohne Ablauf (:765–767).
- Neue Nachricht (+): ohne Ablauf (Dashboard.dc.html:62). Im Bestand gibt es diese Schaltfläche im Postfach nicht (Dashboard.tsx:754–830).
- Senden (Enter oder Schaltfläche): Entwurf ohne Ablauf (:67). Bestand leert nur das Feld, Kommentar „Handle send message“ (Dashboard.tsx:931–945).
- Telefon, Video, Büroklammer, Smiley: ohne Ablauf im Bestand (Dashboard.tsx:856–861, 921–926); im Entwurf nicht vorhanden.
- Antwort-Banner mit X: im Bestand nie gesetzt (Dashboard.tsx:197, 905–917).
- Fokus: 2 px #0E3929, 2 px Abstand (Dashboard.dc.html:13; readme.md:21).

## ZUSTAENDE

Eigenschaften (data-props, Dashboard.dc.html:110):

- section: dashboard (Default) · news · events · announcements · messages (für V09) · tickets.
- dialog: none (Default, für V09) · neuigkeit · veranstaltung · ankuendigung · ticket. Der Dialog neuigkeit trägt den Titel „Neue Nachricht“ (:118) und betrifft Neuigkeiten.

Entwurfszustände:

- schmal (unter 900 px, :137): Sidebar 100 %, Navigation nur bei navOpen (:150).
- Verlauf leer (Startzustand, conv null; :66) oder offen (conv 0–3; :67, :155).
- Eintrag gewählt (aria-current, Hintergrund #EBF9F2; :154) oder nicht (#FFFFFF). Hover #EBF9F2 (:63).
- Online-Punkt (aria-label „Online“; :63). Ungelesen-Zähler nur bei mehr als 0 (:63). Nav-Zähler Nachrichten 3, fest codiert (:139); abgeleitet aus 2+0+1+0.

Bestand zusätzlich: Suche ohne Treffer, leere Liste, Sendefehler und Ladefehler sind nicht gestaltet. Eigene Nachricht rechtsbündig mit Lesestatus (Dashboard.tsx:871–896). Absendername bei fremden Nachrichten (:880–884). Senden deaktiviert bei leerem Feld (:940).

## BILDER

– (entfaellt, keine Bilder im Abschnitt; Avatare sind Initialenkreise, Dashboard.dc.html:63; Bestand optionales Feld, Dashboard.tsx:134, 798–801)

## AUFFAELLIGKEITEN

Das Design gilt für Gestalt und Text, der Bestand für fehlende Sprachfassungen.

1. Suche: Entwurf „Unterhaltungen durchsuchen...“ in der Liste (Dashboard.dc.html:62), Bestand „Nachrichten durchsuchen...“ im Kopf (Dashboard.tsx:760).
2. Überschrift und Leerzustand: Entwurf „Nachrichten“ (:62) und „Wählen Sie eine Unterhaltung“ (:66); Bestand „Nachrichten verwalten“ (Dashboard.tsx:757) und „Wählen Sie eine Unterhaltung aus“ (:957).
3. Startdaten: Entwurf vier Unterhaltungen (:114) und zwei Nachrichten in der ersten (:155); Bestand eine Unterhaltung mit einer Nachricht, die Vorschau fehlt im Verlauf (Dashboard.tsx:332–353).
4. Begriff „Neue Nachricht“: im Bestand Neuigkeiten (Dashboard.tsx:524–526, 1272), im Entwurf das Postfach (Dashboard.dc.html:62).
5. Datum und Zeit: Entwurf „18.03., 15:30“ und „14:15 Uhr“ (:114, :155); Bestand toLocaleString('de-DE') ohne Zeitzone (Dashboard.tsx:395–397). D-10 verlangt „Mo., 28. Juli 2025“ (00 Laufbuch.dc.html:193); K-05 verlangt UTC-Speicherung.
6. Schwellen: Menü ab 900 px (Dashboard.dc.html:137), ab 1240 px (00 Laufbuch.dc.html:185, 215), ab 1200 px (readme.md:25). Hauptbreite 1440 px (Dashboard.dc.html:19) gegen 1280 px (readme.md:25).
7. Menütext: Entwurf sichtbar „Menü öffnen“ (Dashboard.dc.html:21), Bestand nur für Screenreader (Dashboard.tsx:1253).
8. Sprache: Dashboard.tsx ruft useLanguage auf (:153), übersetzt aber nichts. LanguageContext.tsx hat keine Postfach-Schlüssel; das Laufbuch verweist auf Dashboard-Texte dort (00 Laufbuch.dc.html:35). Ergebnis: Postfach nur Deutsch.
9. Begriff „Tickets“: Entwurf und Bestand sagen Tickets, LanguageContext dashboard.tickets sagt „Meldungen“ (LanguageContext.tsx:130).
10. Laufbuch meldet, das Admin-Dashboard stürze im Code beim Öffnen ab (00 Laufbuch.dc.html:239). Ursache nicht geprüft.
11. Header und Breadcrumb: Entwurf setzt `current="dashboard"` und `label="Dashboard"` auf dem Postfach (Dashboard.dc.html:16, 18).

## OFFENE FRAGEN

1. Welche Rollen (Kern K-06) dürfen das Postfach sehen, und gilt „je Organisation nur eigene Inhalte“ auch hier?
2. Gibt es nur Zweiergespräche oder auch Gruppen, und wer darf eine Unterhaltung anlegen (Neue Nachricht ist ohne Ablauf)?
3. Werden Nachrichten echt gelöscht (Kern K-05, Personendaten) oder gilt der Papierkorb mit 30 Tagen? Welche Löschfrist gilt (G-07)?
4. Gilt für das interne Senden auch ALTCHA, Honigtopf und Bestätigungsmail (Kern K-07)? Vorschlag: nein, offen.
5. Sind Pflicht und Maximallänge der Nachricht festgelegt; gibt es Antworten, Anhänge, Büroklammer und Smiley?
6. Eigene Route /verwaltung/nachrichten oder Abschnitt im Dashboard? Welche Breadcrumb-Bezeichnung gilt?
7. Ist das Verwaltungsmodul nur deutsch? tr und en fehlen in allen Quellen.
8. Welches Datumsformat gilt: Entwurf „18.03., 15:30“ oder das Kern-Format aus D-10?
9. Wie sehen Suche ohne Treffer, Sendefehler und Ladefehler aus? Sie sind nicht gestaltet.
10. Soll „Online“ angezeigt werden, und aus welcher Quelle? Datenschutz (G-07) prüfen.
11. Setzt das Öffnen einer Unterhaltung den Ungelesen-Zähler zurück?

=== ENDE V09 · BEREIT ZUR RÜCKGABE ===
