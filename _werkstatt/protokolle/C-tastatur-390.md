# Tastaturdurchlauf (Z-07) · 2026-10-12-04-58 · http://127.0.0.1:3500 · 390×844

Prüfumfang: Sprunglink, dann Tab bis 60 Ziele je Route (Aufgaben bis 150). „Fokus unsichtbar“: kein Wechsel von Umriss, Schatten, Hintergrund oder Rahmen beim Fokus (Element, Elternteil, ::before/::after). „Fokus schwach“: nur ein Wechsel ohne starken Indikator (Umriss unter 2 px, nur Unterstreichung o. ä.). „verdeckt (Hinweis)“ ist keine Befundart, sondern zählt Ziele, deren Mitte von einem anderen Element überdeckt wird.

| Route | HTTP | Ziele | Sprunglink | ziel unsichtbar | fokus unsichtbar | fokus schwach | ausserhalb | falle | verdeckt (Hinweis) | Abbruch |
|---|---|---|---|---|---|---|---|---|---|---|
| / | 200 | 26 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /gebetszeiten | 200 | 16 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /veranstaltungen | 200 | 30 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag | 200 | 23 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /nachrichten | 200 | 32 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /ueber-uns | 200 | 17 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /projekte | 200 | 17 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /organisationen/ana-teskilati | 200 | 23 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /bildung/korankurse | 200 | 21 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /bildung/voranmeldung | 200 | 21 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /kontakt | 200 | 29 | ok | 0 | 0 | 0 | 0 | 0 | 1 | Fokus auf body |

## Befunde

Keine Befunde.

## Menü (390 px, erste Route)

Knopf „Menü öffnen“ nach 3 Tabs gefunden · Dialog offen: ja · Fokus im Dialog: ja · Escape schließt: ja · Fokus zurück am Knopf: ja

## Hauptaufgaben (KERN K-002)

| Aufgabe | Ergebnis | Tabs | POST | Grund |
|---|---|---|---|---|
| a) Gebetszeit (nächste Gebetszeit sehen) | ok | 5 | 0 | Link „Alle Gebetszeiten“ mit sichtbarem Fokus; URL /gebetszeiten; nächste Gebetszeit markiert: „Dhuhr Nächstes Gebet 13:17“ |
| b) Veranstaltung finden und anmelden (bis zum Absendeknopf) | ok | 13 | 0 | Kartenlink mit sichtbarem Fokus; Detailseite /veranstaltungen/frauenkreis-islamische-erziehung: kein Anmeldeformular; Seite: „Für diese Veranstaltung ist keine Anmeldung nötig.“ (notiert) |
| c) Kurs finden und Schüler voranmelden (bis zum Weiter-Knopf) | ok | 20 | 0 | Link mit sichtbarem Fokus; Voranmeldung /bildung/voranmeldung; „Weiter“ nach 3 Zielen erreicht, sichtbarer Fokus; nicht gedrückt |
| d) Kontakt aufnehmen (bis zum Absendeknopf, nicht gesendet) | ok | 15 | 0 | Absendeknopf „Absenden“ nach 8 Zielen erreicht, sichtbarer Fokus; nicht gedrückt |
| e) Suche (Zusatz, GET) | ok | 6 | 0 | Suchfeld mit sichtbarem Fokus; URL /suche?q=gebet; Überschrift „3 Treffer für „gebet““ |

## POST-Anfragen (Werkzeugfehler)

Keine. Alle POST-Anfragen wären abgebrochen worden.
