# Reaktion auf Eingaben (INP, Labor) verschränkt · 3100 gegen 3500

Telefon 390×844, CPU 4×; je Runde ein Lauf je Route und Server; Median über die Runden. Schwelle 200 ms.

| Route | INP 3100 (ms) | INP 3500 (ms) | Läufe 3100 | Läufe 3500 | 3500 ≤ 200 | längste Eingabe 3500 (Median ms) |
|---|---|---|---|---|---|---|
| / | 176 | 144 | [144, 176, 184] | [128, 208, 144] | ja | menue 144, leiste 104 |
| /gebetszeiten | 224 | 208 | [280, 224, 160] | [192, 328, 208] | nein | reiter 208, menue 80 |
| /veranstaltungen | 152 | 112 | [152, 168, 120] | [96, 216, 112] | ja | leiste 112, menue 96 |
| /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag | 144 | 120 | [128, 232, 144] | [120, 144, 96] | ja | menue 120, leiste 80 |
| /nachrichten | 136 | 104 | [144, 136, 128] | [96, 136, 104] | ja | menue 104, leiste 72 |
| /ueber-uns | 176 | 104 | [192, 176, 136] | [104, 168, 96] | ja | menue 104, leiste 96 |
| /projekte | 224 | 120 | [248, 224, 128] | [120, 136, 88] | ja | leiste 120, menue 104 |
| /organisationen/ana-teskilati | 144 | 96 | [160, 136, 144] | [96, 96, 104] | ja | menue 96, leiste 96 |
| /bildung/korankurse | 144 | 104 | [144, 152, 128] | [120, 96, 104] | ja | menue 104, leiste 64 |
| /bildung/voranmeldung | 184 | 104 | [200, 184, 168] | [160, 104, 96] | ja | leiste 104, menue 88 |
| /kontakt | 168 | 144 | [224, 152, 168] | [144, 208, 104] | ja | menue 104, leiste 96 |

3500 ≤ 200 ms auf 10 von 11 Routen.
