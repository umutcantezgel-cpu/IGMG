# Blatt V12 · Verwaltung: Benutzer und Rollen

V12 · Rolle: Kundschafter · Modell: Haiku 5.5 · Phase P0 · Kern-Version 1.0 · Umfang: ein Seitenblatt (Verwaltungsmodul) „Verwaltung: Benutzer und Rollen“ · Schwierigkeit 1

„abgeleitet“ kennzeichnet alles, was weder aus dem Design noch aus dem Bestand stammt. Ein Artboard gibt es nicht. Personennamen, Adressen und Kontaktdaten sind nicht ausgeschrieben (A5).

## SEITE

Verwaltung: Benutzer und Rollen (Verwaltungsmodul, abgeleitet). Aufbau nach dem Muster „07.3 Admin-Dashboard“ (Dashboard.dc.html:15) und dem Kontomenü (Header.dc.html:57-70).

## ROUTE

/verwaltung/benutzer (Vorgabe des Auftrags, abgeleitet). Keine Quelle kennt diese Route. Der Bestand leitet „Dashboard“ auf navigateTo('dashboard') (Header.tsx:578, 929).

## QUELLEN

- Design, nur lesen: Header.dc.html (Kontomenü 57-70, 126-133; Daten 144-156; Menüpunkte 208-212); Dashboard.dc.html (Navigation 20-27; Tabelle 43-57; Dialog 88-107; Daten 110-122).
- Bestand, nur lesen: uploads/igmg-wetzlar-website/src/app/components/Header.tsx (Anmeldung 21-96; Admin-Menü 432-461; Konto 576-599; Mobil 913-966).
- Hilfen: readme.md (Zeilen 7, 12); 00 Laufbuch.dc.html (Zeilen 35, 148-151, 193, 251, 278, 299).
- Auftrag: K-05, K-06, K-07, G-04, G-05, G-07.

## ZWECK

Konten entstehen nur per Einladung (K-06). Berechtigte Rollen laden Personen ein, vergeben Rollen nach K-06, sehen den Zwei-Faktor-Status, sperren Konten und löschen Personendaten endgültig (K-05, G-07).

## ABSCHNITTE

Aufbau (abgeleitet nach Dashboard.dc.html:15-86): Header per dc-import mit active="" und logged-in="true" (Zeile 16), current offen; PrayerTimesBar (Zeile 17); Breadcrumbs „Benutzer und Rollen“ (Zeile 18, abgeleitet). Links Navigation mit den sechs NAV-Einträgen (Zeile 111) und „Benutzer und Rollen“ (abgeleitet). Hauptbereich: Überschrift, Schaltfläche „Neuer Benutzer“, Tabelle „Benutzer verwalten“ (Muster Zeilen 143-145), Rollen (K-06), Mein Konto (abgeleitet). Footer (Zeile 86). Header, PrayerTimesBar, Breadcrumbs und Footer sind eigene Komponentenblätter 02.1 bis 02.4 (Laufbuch.dc.html:148-151). Nicht übernommen: Startabschnitt, Nachrichten, Tickets (Zeilen 30-41, 59-83).

Texte, Kontomenü (Design, Bestand als Gegenprobe):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| konto.dashboard | Dashboard | Panel | Dashboard | Header.dc.html:148, 151, 154; Header.tsx:581 |
| konto.styleguide | Styleguide | Styleguide | Styleguide | Header.dc.html:209; Header.tsx:450 |
| konto.meldung | Meldung | Bildirim | Report | Header.dc.html:148, 151, 154; Header.tsx:457 |
| konto.mein | Mein Konto | Hesabım | My Account | Header.dc.html:150, 153, 156; Header.tsx:586 |
| konto.einstellungen | Einstellungen | Ayarlar | Settings | Header.dc.html:150, 153, 156; Header.tsx:590 |
| konto.abmelden | Abmelden | Çıkış Yap | Sign Out | Header.dc.html:150, 153, 156; Header.tsx:598 |
| konto.angemeldet | Angemeldet; (Angemeldet) | – (nur DE in Quelle) | – (nur DE in Quelle) | Header.dc.html:57, 65, 128; Header.tsx:921 |

Texte, Muster Dashboard (nur Deutsch, Dashboard.dc.html:15 mit lang="de"):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| muster.kopf | Admin Dashboard; IGMG Wetzlar Verwaltung; Menü öffnen; Dashboard-Bereiche; Dashboard | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:18, 21, 23 |
| muster.tabelle | Titel; Autor; Datum; Status; Aufrufe; Aktionen; Bearbeiten: [Titel]; Löschen: [Titel] | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:143 |
| muster.dialog | Schließen; Abbrechen; Erstellen | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:93, 104, 118 |
| muster.felder | Kategorie; Ablaufdatum | – (nur DE in Quelle) | – (nur DE in Quelle) | Dashboard.dc.html:119, 120 |

Texte, abgeleitet (Vorschlag, ohne Übersetzung in den Quellen):

| Schluessel-Vorschlag | de | tr | en | Fundstelle |
|---|---|---|---|---|
| seite.titel | Benutzer und Rollen | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet; Dashboard.dc.html:32 |
| seite.neu | Neuer Benutzer | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet; Dashboard.dc.html:143-145 |
| tabelle.spalten | Name; Rolle; Organisation; Status; Zwei-Faktor; Aktionen | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet |
| status | Eingeladen; Aktiv; Gesperrt | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet |
| zwei.status | Ausstehend; Eingerichtet (TOTP); Eingerichtet (Passkey) | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet; K-06 |
| aktion | Sperren: [Name] | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet |
| dialog | Neuer Benutzer; Einladen; Benutzer endgültig löschen | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet; K-05, K-06 |
| hinweis | (Pflichtfeld); Bitte füllen Sie die markierten Pflichtfelder aus. | – (nur DE in Quelle) | – (nur DE in Quelle) | Laufbuch.dc.html:299 |
| meldungen | Bitte geben Sie eine gültige E-Mail-Adresse ein; Einladung versendet; Noch keine Benutzer angelegt | – (nur DE in Quelle) | – (nur DE in Quelle) | abgeleitet; K-07 |

Rollen (K-06, wörtlich, nur Deutsch; tr und en: – (nur DE in Quelle)): Administration; Redaktion; Organisationsredaktion (je Organisation nur eigene Inhalte); Bildung (Kurse und Voranmeldungen); Mitgliederverwaltung (Anträge).

Organisationen (Eigennamen unverändert): Allgemein; Ana Teşkilatı; Kadın Teşkilatı; Gençlik Teşkilatı; Kadın Gençlik Teşkilatı (Dashboard.dc.html:115).

Mein Konto (Konto-Seite, abgeleitet): Zwei-Faktor-Status mit Passkey oder TOTP (K-06), Rollen nur lesend, Abmelden (Header.dc.html:211). Der Bestand hat keine Kontoseite (Header.tsx:584-591).

## DATEN

Vorschlag, abgeleitet (PostgreSQL mit Drizzle, K-05). Je Feld stehen Typ und mehrsprachig (ja oder nein; ja = Anzeigenamen in de, tr, en):

- users: id (uuid; nein), name (Text, Personendaten; nein), email (Text, eindeutig, Personendaten; nein), status (Enum; ja), created_at und last_login_at (Zeitstempel UTC, Anzeige Europe/Berlin; nein).
- user_roles: user_id (uuid; nein), role (Enum der fünf K-06-Rollen; ja). user_organisation: user_id (uuid; nein), organisation_id (uuid, nur bei Organisationsredaktion; nein).
- organisations: id (uuid; nein), name (Text, Eigenname; nein). invitations: email (Text, Personendaten), token_hash (Text, nur Hash; nein), expires_at (Zeitstempel UTC; nein).
- mfa_factors: user_id (uuid; nein), typ (Enum totp oder passkey; ja).
- audit_log: actor_id, subject_user_id (uuid; nein), aktion (Text; nein), zeitpunkt (Zeitstempel UTC; nein). Jeder Zugriff auf Personendaten wird protokolliert (G-07).
- Löschfristen als Einstellung (Zahl; nein; G-07). Benutzer werden echt gelöscht, ohne Papierkorb (K-05). Seeds nur fiktiv, etwa „Testperson Eins“ (G-04).

## FORMULARFELDER

Dialog „Neuer Benutzer“ (abgeleitet nach Dashboard.dc.html:118-121):

- E-Mail-Adresse: Typ email, Pflicht. Der F-Helper rendert diesen Typ nicht (Dashboard.dc.html:98-100, 116).
- Name: Typ text, Pflicht offen (OFFENE FRAGEN 3).
- Rollen: Checkboxen, mindestens eine, Pflicht (K-06).
- Organisation: Auswahl, Pflicht nur bei Organisationsredaktion (Muster Dashboard.dc.html:119, Feld Kategorie).
- Gültig bis: Typ date, optional (Muster Dashboard.dc.html:120). Platzhalter: [Gültigkeit – von der Gemeinde] (G-05).

Regeln (K-07): ein Zod-Schema für Client und Server, Fehler am Feld, Fokus auf die erste Fehlermeldung. Die Dialoge des Musters nutzen kein form-Element (Dashboard.dc.html:91, 104).

## INTERAKTIONEN

1. Die Kontoschaltfläche öffnet das Konto-Menü. Klick außerhalb und Escape schließen es (Header.dc.html:57, 169-170, 220).
2. Meldung öffnet den TicketDialog. Mein Konto und Einstellungen zeigen auf Dashboard.dc.html. Abmelden setzt den Zustand auf abgemeldet (Header.dc.html:205-206, 209-211).
3. Unter 900 px öffnet „Menü öffnen“ die Navigation (Dashboard.dc.html:21, 137-138).
4. „Neuer Benutzer“ und der Stift-Button öffnen denselben Dialog, der Stift ohne Vorbelegung (Dashboard.dc.html:45, 52, 143).
5. Der Löschen-Button hat im Muster keine Aktion (Dashboard.dc.html:52). Abgeleitet: Sperren und endgültiges Löschen mit Bestätigung. Das eigene Konto lässt sich nicht sperren (Vorschlag).
6. Der Dialog schließt mit Escape, Klick auf den Hintergrund, „Schließen“ oder „Abbrechen“. „Erstellen“ schließt ohne Prüfung (Dashboard.dc.html:90, 93, 104, 132).
7. Abgeleitet: „Einladen“ prüft auf dem Server (K-07). Jeder Zugriff auf Personendaten landet im Audit-Log (G-07).

## ZUSTAENDE

Design, Header.dc.html:144 (data-props): lang de, tr, en (Standard de); active leer, home, moschee, islam, organisationen, bildung (Standard home); current Text (Standard home); loggedIn boolean (Standard false); open none, moschee, islam, organisationen, bildung, lang, login, account, mobile, ticket (Standard none); demoErrors boolean (Standard false); onLang Funktion (code: string) => void; $preview 1440 × 560.

Design, Dashboard.dc.html:110 (data-props): section dashboard, news, events, announcements, messages, tickets (Standard dashboard); dialog none, neuigkeit, veranstaltung, ankuendigung, ticket (Standard none). Abgeleitet neu: section benutzer; dialog einladen, sperren, loeschen.

Bestand (Header.tsx): abgemeldet als Standard (Zeile 22); Anmeldung simuliert, 1000 ms (Zeilen 21, 74-80). Fehler je Feld: E-Mail leer oder ungültig (45, 48); Passwort leer oder unter sechs Zeichen (53, 55-56); verschwindet beim Tippen (85-88). Laden: Felder deaktiviert, Spinner (506, 525, 551, 553-557). TicketDialog offen oder zu (23, 454, 948, 981-984). Fehlertexte nur als Schlüssel; Werte in LanguageContext.tsx (nicht in den Quellen).

Abgeleitet: leer, laden, Fehler (Text offen), Erfolg, Konto eingeladen, aktiv oder gesperrt, Zwei-Faktor ausstehend oder eingerichtet, Dialog offen.

## BILDER

- Logo 40 × 40 px, alt leer, Link mit aria-label (Header.dc.html:18-19, 79). Der Bestand hat alt „IGMG Wetzlar Logo“ (Header.tsx:119); das Design gilt.
- Keine Fotos. Der Konto-Avatar ist das Icon user (Header.dc.html:65). Organisationslogos nur im Menü (Header.dc.html:195-196).
- Icons im Muster: Header.dc.html:65, 209-211; Dashboard.dc.html:21, 45, 52, 93. Abgeleitet neu: users, lock, unlock, key-round (Icon.dc.html nicht in den Quellen).

## AUFFAELLIGKEITEN

1. „Mein Konto“ und „Einstellungen“ zeigen im Design auf Dashboard.dc.html (Header.dc.html:210), im Bestand ohne Ziel (Header.tsx:584-591). Das Laufbuch nennt es vorläufig (Laufbuch.dc.html:251).
2. Das Design fasst Admin-Funktionen und Konto in einem Menü mit sechs Punkten zusammen (Header.dc.html:209-211; D-13 in Laufbuch.dc.html:278). Der Bestand hat zwei Menüs (Header.tsx:432-461, 576-599), mobil fehlen „Mein Konto“ und „Einstellungen“ (Header.tsx:925-953; Header.dc.html:129-131). Das Design gilt für Gestalt und Text.
3. Der Bestand-Login kennt nur E-Mail und Passwort (Header.tsx:494-560), K-06 verlangt aber Zwei-Faktor für alle Konten. Die drei Quellen enthalten weder Zwei-Faktor-, Passkey- noch Einladungsoberflächen (Suche per grep).
4. Der Löschen-Button im Muster hat weder Aktion noch Bestätigung (Dashboard.dc.html:52); K-05 verlangt echtes Löschen von Personendaten.
5. Der F-Helper rendert keine E-Mail-Felder (Dashboard.dc.html:116). Die Dialoge sind div-Container und schließen ohne Prüfung (Dashboard.dc.html:91, 104); K-07 verlangt Feldfehler.
6. Das Dashboard ist fest auf lang="de" (Dashboard.dc.html:15). Seine Bestandstexte liegen laut readme.md:7 und Laufbuch.dc.html:35 in LanguageContext.tsx, das nicht zu den Quellen gehört.
7. Der Plan nennt den Header-Zustand „admin“ (Laufbuch.dc.html:148), die data-props kennen „ticket“ (Header.dc.html:144).
8. Datumsformen widersprechen sich: „Sa., 2. Aug.“ (readme.md:12), „Mo., 18. März 2024, 10:30 Uhr“ (Dashboard.dc.html:79) und „Mo., 28. Juli 2025“ (Laufbuch.dc.html:193).

## OFFENE FRAGEN

1. Ist /verwaltung/benutzer die endgültige Route, und welcher Wert von current gilt?
2. Zeigt „Mein Konto“ auf diese Seite, auf eine eigene Kontoseite oder weiter auf Dashboard.dc.html?
3. Welche Rollen dürfen einladen, sperren und löschen (G-07: nur berechtigte Rollen)?
4. Ist ein Name nötig (G-07: nur nötige Felder), und darf die Tabelle E-Mail-Adressen zeigen?
5. Gehört „Allgemein“ (Dashboard.dc.html:115) zur Organisationsauswahl, und sind mehrere Rollen je Konto erlaubt?
6. Wie lange gilt eine Einladung, und wie lang sind die Löschfristen? Platzhalter: [Gültigkeit – von der Gemeinde]; Eintrag in MENSCHEN.md vorschlagen.
7. Gelten ALTCHA, Honigtopf und Ratenbegrenzung (K-07) für das geschützte Einladungsformular?
8. Welche Passwortregel gilt neben Zwei-Faktor, wenn der Bestand sechs Zeichen verlangt (Header.tsx:55)?
9. Welches Datumsformat gilt in Tabellen (Auffälligkeit 8)?
10. Wer übersetzt die abgeleiteten Texte und die Bestandsschlüssel aus LanguageContext.tsx?
11. Sind users, lock, unlock und key-round in Icon.dc.html vorhanden? Icon.dc.html liegt nicht in den Quellen.

=== ENDE V12 · BEREIT ZUR RÜCKGABE ===
