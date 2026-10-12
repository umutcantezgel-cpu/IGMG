# Reaktion auf Eingaben (INP, Labor) verschränkt · 3100 gegen 3500

Telefon 390×844, CPU 4×; je Runde ein Lauf je Route und Server; Median über die Runden. Schwelle 200 ms.

| Route | INP 3100 (ms) | INP 3500 (ms) | Läufe 3100 | Läufe 3500 | 3500 ≤ 200 | längste Eingabe 3500 (Median ms) |
|---|---|---|---|---|---|---|
| / | 224 | 224 | [176, 248, 224] | [248, 224, 216] | nein | menue 224, leiste 104 |
| /gebetszeiten | 240 | 280 | [240, 168, 248] | [304, 280, 216] | nein | reiter 280, menue 240 |
| /veranstaltungen | 152 | 256 | [152, 144, 152] | [240, 272, 256] | nein | menue 256, leiste 72 |
| /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag | 168 | 224 | [184, 152, 168] | [328, 176, 224] | nein | menue 224, leiste 96 |
| /nachrichten | 168 | 264 | [168, 144, 208] | [264, 304, 264] | nein | menue 264, leiste 88 |
| /ueber-uns | 152 | 184 | [128, 152, 160] | [168, 208, 184] | ja | menue 184, leiste 80 |
| /projekte | 176 | 200 | [184, 176, 160] | [200, 168, 264] | ja | menue 200, leiste 88 |
| /organisationen/ana-teskilati | 240 | 264 | [240, 240, 200] | [272, 264, 224] | nein | menue 264, leiste 112 |
| /bildung/korankurse | 176 | 208 | [176, 200, 168] | [208, 368, 184] | nein | menue 208, leiste 96 |
| /bildung/voranmeldung | 168 | 248 | [168, 200, 136] | [368, 248, 144] | nein | menue 248, leiste 112 |
| /kontakt | 184 | 216 | [184, 200, 160] | [336, 216, 184] | nein | menue 216, leiste 88 |

3500 ≤ 200 ms auf 2 von 11 Routen.
