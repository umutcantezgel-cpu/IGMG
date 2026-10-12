# Tastaturdurchlauf (Z-07) · 2026-10-12-05-00 · http://127.0.0.1:3500 · 1440×900

Prüfumfang: Sprunglink, dann Tab bis 60 Ziele je Route (Aufgaben bis 150). „Fokus unsichtbar“: kein Wechsel von Umriss, Schatten, Hintergrund oder Rahmen beim Fokus (Element, Elternteil, ::before/::after). „Fokus schwach“: nur ein Wechsel ohne starken Indikator (Umriss unter 2 px, nur Unterstreichung o. ä.). „verdeckt (Hinweis)“ ist keine Befundart, sondern zählt Ziele, deren Mitte von einem anderen Element überdeckt wird.

| Route | HTTP | Ziele | Sprunglink | ziel unsichtbar | fokus unsichtbar | fokus schwach | ausserhalb | falle | verdeckt (Hinweis) | Abbruch |
|---|---|---|---|---|---|---|---|---|---|---|
| / | 200 | 33 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /gebetszeiten | 200 | 23 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /veranstaltungen | 200 | 37 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag | 200 | 30 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /nachrichten | 200 | 39 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /ueber-uns | 200 | 24 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /projekte | 200 | 24 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /organisationen/ana-teskilati | 200 | 30 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /bildung/korankurse | 200 | 28 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /bildung/voranmeldung | 200 | 28 | ok | 0 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |
| /kontakt | 200 | 36 | ok | 1 | 0 | 0 | 0 | 0 | 0 | Fokus auf body |

## Befunde

- **ziel unsichtbar** · /kontakt · `input` „Wird überprüft...“ (checkbox, Tab 21) – fokussierbar, aber Größe 22×22 px oder abgeschnitten

## POST-Anfragen (Werkzeugfehler)

Keine. Alle POST-Anfragen wären abgebrochen worden.
