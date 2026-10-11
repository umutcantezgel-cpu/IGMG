# Blatt V13 · Verwaltung: Audit-Log

V13 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt (Verwaltungsmodul) „Verwaltung: Audit-Log“ · Schwierigkeit 1

Lesehinweis: **abgeleitet** = kein Artboard, Vorschlag aus Muster, Kern und Bestand. Fundstellen „Datei:Zeile“ beziehen sich auf den Designordner, Bestand-Pfade beginnen mit web/. „– (nur DE in Quelle)“ heißt bei abgeleiteten Texten: keine tr- oder en-Fassung, und der deutsche Vorschlag hat keine Quelle.

## SEITE

Verwaltung: Audit-Log im Verwaltungsmodul, nach dem Muster Admin-Dashboard (Dashboard.dc.html:15). Status: ABGELEITET. In den HTML-, Markdown-, JS- und CSS-Dateien des Designordners (ohne web/ und _lauf/) kommt „Audit“ nicht vor. Vorschlag Screen-Nr. 07.5; der Laufbuch-Plan endet bei 07.4 (00 Laufbuch.dc.html:176).

## ROUTE

/verwaltung/audit (Paketauftrag). Ablage (abgeleitet): web/src/app/[locale]/verwaltung/(geschuetzt)/audit/page.tsx; dort liegt bisher nur die Startseite der geschützten Gruppe (Bestand-Befund). Zugriff serverseitig nach K-06: Sitzung mit Zwei-Faktor (web/docs/adr/0003-rechte-modell.md:23) und Recht audit.lesen (web/src/lib/rechte/matrix.ts:55).

## QUELLEN

- Design, Muster: 02 Komponenten.dc.html (Z.32–35, 40, 46, 50–51); Dashboard.dc.html (Template Z.15–107, data-props Z.110, Skript Z.111–161).
- Hilfen: readme.md (Z.12, 21, 25); 00 Laufbuch.dc.html (Z.35, 152, 156, 158, 176, 177, 185, 193, 217, 278, 289, 309).
- Kern-Auszug des Auftrags: K-05, K-06, K-07, G-04, G-07.
- Bestand: Das Paket nennt „kein Bestand“. Zusätzlich gelesen, nur lesend und in Ausschnitten: web/src/lib/audit/index.ts (Z.1–58), web/src/lib/db/schema/system.ts (Z.1–65), web/src/lib/rechte/matrix.ts (Z.1–175), web/docs/adr/0003-rechte-modell.md (Z.1–34). Per Grep: web/drizzle/migrations/0000_grundstock.sql (Z.120, 484–486), Routenliste unter web/src/app/[locale]/verwaltung/.
- Nicht gelesen: 08 Dialoge und Zustaende, Icon, BaseComponents, Header, Footer, PrayerTimesBar, Breadcrumbs, PageHeader, Nachbarblatt V01-verwaltung-uebersicht.md.

## ZWECK

Nachweis für die Verwaltung, wer wann auf Personendaten zugegriffen oder Inhalte geändert hat (G-07). Reine Leseansicht: Die Matrix kennt für dieses Modul nur audit.lesen (matrix.ts:55), keine Bearbeiten- oder Löschaktion, und nur für die Rolle Administration (matrix.ts:86; ADR 0003 Z.24).

## ABSCHNITTE

Aufbau (abgeleitet aus Dashboard.dc.html:15–86):

1. Header: dc-import name="Header" active="" current="dashboard" logged-in="true", sticky (Z.16). Current abgeleitet, weil das Konto-Menü keinen Audit-Eintrag hat (00 Laufbuch.dc.html:309).
2. PrayerTimesBar, hint-size 100%,124px (Z.17).
3. Breadcrumbs: label="Audit-Log", parent-label="Dashboard", parent-href="Dashboard.dc.html" (Z.18; Attributform 02 Komponenten.dc.html:40).
4. Hauptbereich (Z.19): Seitenleiste (Z.20–27) mit h1 und Untertitel (Z.21), Menü-Button nur schmal (Z.21), sechs Einträge aus Z.111 plus „Audit-Log“ (abgeleitet). Inhalt (Z.29): h2 (Muster Z.45), Filterraster (Z.94), Tabelle in Scroll-Box mit sechs Spalten (Z.46–47), Seitenzahlen (abgeleitet), Eintrags-Dialog (Muster Z.88–107).
5. Footer, hint-size 100%,520px (Z.86).

Komponenten: Header, PrayerTimesBar, Breadcrumbs und Footer haben eigene Blätter. Icon: menu 20 px (Z.21), search 20 px (Z.62), x 24 px (Z.93); Icon für den neuen Eintrag offen. Seitenzahlen: 00 Laufbuch.dc.html:152 („Tabs/Seitenzahlen“), Muster nicht gelesen.

Texte:

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| verwaltung.titel | Admin Dashboard | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:21 (h1) |
| verwaltung.untertitel | IGMG Wetzlar Verwaltung | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:21 |
| navigation.menue | Menü öffnen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:21 (nur schmal) |
| nav.gruppe | Dashboard · Neuigkeiten · Veranstaltungen · Ankündigungen · Nachrichten · Tickets | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:111 |
| tabelle.datum | Datum | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:143 |
| tabelle.aktionen | Aktionen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:143 |
| organisation.gruppe | Allgemein · Ana Teşkilatı · Kadın Teşkilatı · Gençlik Teşkilatı · Kadın Gençlik Teşkilatı | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:115 |
| dialog.schliessen | Schließen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:93 (aria-label) |
| format.zeitpunkt | Mo., 18. März 2024, 10:30 Uhr | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:79 (Beispielwert) |
| seite.titel | Audit-Log | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet (h2, Navigation, Breadcrumb) |
| tabelle.benutzer | Benutzer | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet (Muster Z.143 „Autor“) |
| tabelle.rolle | Rolle | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet (matrix.ts:6) |
| tabelle.aktion | Aktion | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet (audit/index.ts:8) |
| tabelle.ziel | Ziel | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet (system.ts:12–13) |
| filter.zeitraum | Zeitraum von · Zeitraum bis | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet (Datumsfeld, Z.119) |
| filter.organisation | Organisation | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet (im Design „Kategorie“, Z.119) |
| filter.suche | Einträge durchsuchen... | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet (Muster Z.62) |
| aktion.details | Details | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet (Muster Z.52) |
| dialog.felder | Zeitpunkt: · Benutzer: · Rolle: · Aktion: · Ziel: · Details: | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet (Muster Z.79) |
| leer.liste | [Leertext – offen] | – (nur DE in Quelle) | – (nur DE in Quelle) | Platzhalter (00 Laufbuch.dc.html:156) |
| fehler.zugriff | [Fehlertext ohne Details – offen] | – (nur DE in Quelle) | – (nur DE in Quelle) | Platzhalter (ADR 0003 Z.22) |

## DATEN

Quelle: Tabelle audit_eintrag (web/src/lib/db/schema/system.ts:5–21), geschrieben über protokolliere() (web/src/lib/audit/index.ts:50–58). Vorschlag:

- zeitpunkt: timestamptz, Pflicht. UTC gespeichert, Anzeige Europe/Berlin (K-05). Mehrsprachig: nein.
- benutzer_id: text, optional. Verweis auf das Konto; der Anzeigename wäre ein Personendatum. Mehrsprachig: nein.
- aktion: text, Pflicht. 29 Schlüssel (audit/index.ts:8–37). Mehrsprachig: ja (Anzeige).
- ziel_typ, ziel_id: text, optional. Werte von ziel_typ sind im Bestand nicht festgelegt. Mehrsprachig: ziel_typ ja, ziel_id nein.
- details: jsonb, optional. Nur Feldnamen, Zähler und IDs, keine Personendaten (audit/index.ts:5–6; system.ts:14). Mehrsprachig: nein.
- rolle und organisation (abgeleitet aus rolle_zuweisung, ADR 0003 Z.19; nicht im Eintrag gespeichert): fünf Rollen (matrix.ts:6); at, kt, gt, kgt oder leer (matrix.ts:9). Mehrsprachig: ja (Anzeige).

Beispielzeilen nur mit fiktiven Namen wie „Testperson Eins“ (G-04).

## FORMULARFELDER

Filterleiste ohne Absendeknopf und ohne Pflichtfelder (abgeleitet). Maße nach Muster: Label 16 px fett (Dashboard.dc.html:97), Feld 48 px hoch (Z.100), Rand #8C857C (readme.md:21), Raster (Z.94).

- Zeitraum von und bis: Datumsfeld (Z.119–120).
- Benutzer: Texteingabe für die Kennung (abgeleitet, siehe OFFENE FRAGEN).
- Aktion: Auswahl mit 29 Optionen (audit/index.ts:8–37).
- Rolle: Auswahl mit fünf Optionen (matrix.ts:6).
- Organisation: Auswahl mit fünf Optionen (Dashboard.dc.html:115).
- Suche: Texteingabe nach Muster Z.62.

Ungültiger Zeitraum: Fehlertext am Feld, Fokus auf die Rückmeldung (K-07).

## INTERAKTIONEN

- Seitenleiste: Ein Eintrag wechselt die Seite und schließt im schmalen Layout das Menü (Z.138). „Menü öffnen“ schaltet die Navigation (Z.21, Z.150).
- Filter wirken bei jeder Änderung; Felder werden einzeln geleert (abgeleitet).
- „Details“ öffnet den Eintrags-Dialog (Muster Z.88–107). Schließen über X (Z.93), Hintergrund (Z.90) oder Escape (Z.132). Fokusrückgabe auf den Auslöser ist abgeleitet; der Fokusrahmen 2 px gilt nach Z-05 (00 Laufbuch.dc.html:217).
- Keine Bearbeiten- und keine Löschaktion in den Zeilen (abgeleitet; Muster Z.52 entfällt; matrix.ts:55).
- Blättern über Seitenzahlen (abgeleitet); Export offen.

## ZUSTAENDE

- Eigenschaften des Musters (Dashboard.dc.html:110): section mit den Optionen dashboard, news, events, announcements, messages, tickets (Default dashboard); dialog mit den Optionen none, neuigkeit, veranstaltung, ankuendigung, ticket (Default none). Das Audit-Log hat keine eigenen Eigenschaften (abgeleitet).
- Laufzustand (Z.124): section null, dialog null, conv null, ticket false, w 1440, navOpen false.
- Breite (Z.137, Z.150): unter 900 px Seitenleiste 100 % mit Menü-Button, Navigation nur bei geöffnetem Menü; ab 900 px 280 px.
- Liste (Vorlage „liste/leer · Filter“, 00 Laufbuch.dc.html:156, 158): Einträge; leer (keine Einträge im Zeitraum); Filter ohne Treffer, Laden und Fehler (abgeleitet, Texte offen).
- Ohne Recht: Fehler ohne Details (ADR 0003 Z.22). Ohne Zwei-Faktor: Umleitung zur Einrichtung (Z.22).
- Abgemeldet: „Desktop · abgemeldet · Anmeldung offen“ (02 Komponenten.dc.html:81).
- Sprache: lang="de" (Dashboard.dc.html:15); tr und en: – (nur DE in Quelle).
- Entfällt: Entwurf, Veröffentlicht und Papierkorb (K-05), weil Audit-Einträge keine Inhalte sind.
- Bestand: keine Oberflächenzustände; ein Schreibfehler bricht die Aktion ab (audit/index.ts:49).

## BILDER

– (entfaellt: keine Bilder im Muster, nur Icons, siehe ABSCHNITTE).

## AUFFAELLIGKEITEN

1. Kein Artboard: Das Audit-Log fehlt im Design und in der Navigation (Dashboard.dc.html:111). Die Seite ist vollständig abgeleitet.
2. Widerspruch zum Paket: web/ enthält schon das Audit-Modell mit 29 Aktionen (audit/index.ts:8–37), die Tabelle audit_eintrag (system.ts:5–21) und das Recht audit.lesen nur für Administration (matrix.ts:55, 86). Das Paket sagt „kein Bestand“.
3. Kein Einstieg: Das Konto-Menü hat keinen Audit-Eintrag; Mein Konto und Einstellungen zeigen vorläufig auf Dashboard (00 Laufbuch.dc.html:278, 309).
4. Begriffe: „Kategorie“ ist Organisationsauswahl (Dashboard.dc.html:119) und Freitextfeld (Z.121). „Nachrichten“ ist Postfach (Z.111, Z.62) und zugleich Neuigkeiten (Z.118, Z.143).
5. Schwellen: Seitenleiste ab 900 px (Dashboard.dc.html:137), Header-Menü unter 1240 px (00 Laufbuch.dc.html:185), Menü-Button unter 1200 px (readme.md:25).
6. Datumsformat: „Sa., 2. Aug.“ (readme.md:12), „Mo., 28. Juli 2025“ (00 Laufbuch.dc.html:193), „Mo., 18. März 2024, 10:30 Uhr“ (Dashboard.dc.html:79). Vorschlag ist das letzte.
7. Musterbruch: Bearbeiten und Löschen je Zeile (Dashboard.dc.html:52) entfallen für das Log.
8. Sprachfassungen: 00 Laufbuch.dc.html:35 nennt Dashboard-Texte de, tr und en im Code. Das Paket liefert diese Quelle nicht.

## OFFENE FRAGEN

1. Darf neben Administration auch Organisationsredaktion das Log für die eigene Organisation lesen (matrix.ts:55, 86)?
2. Wo liegt der Einstieg, Seitenleiste oder Konto-Menü, und welches Icon gilt?
3. Zeigt das Log den Anzeigenamen des Kontos oder nur die Kennung?
4. Die Rolle steht nicht im Eintrag (system.ts:5–21). Gilt die aktuelle Rolle oder die Rolle zur Zeit der Aktion?
5. Wie lange bleibt ein Eintrag, und gilt eine eigene Löschfrist für das Log (G-07 verlangt einstellbare Fristen)?
6. Ist ein Export vorgesehen, und welcher Zeitraum gilt ohne Filter?
7. Wird das Anzeigen des Logs selbst protokolliert (G-07: jeder Zugriff)?
8. Soll „Benutzer“ eine Kennung statt Namenssuche sein, damit keine Personendaten in der Adresszeile stehen?
9. Texte für Leer-, Lade-, Fehler- und Berechtigungszustand fehlen; 08 Dialoge und Zustaende (00 Laufbuch.dc.html:177) ist nicht Quelle dieses Pakets.
10. tr und en der wiederverwendeten Muster-Texte liegen im Bestand (00 Laufbuch.dc.html:35; web/messages/*.json, nicht gelesen).
11. Wird eine IP-Adresse gespeichert? Das Schema hat dafür kein Feld (system.ts:5–21).
12. Bei fehlendem Recht: Umleitung auf web/src/app/[locale]/verwaltung/kein-zugriff/page.tsx oder Fehler ohne Details (ADR 0003 Z.22)?
13. Abgleich mit dem Nachbarblatt V01-verwaltung-uebersicht.md (Navigation) und Eintrag der Laufbuch-Nummer 07.5.

=== ENDE V13 · BEREIT ZUR RÜCKGABE ===
