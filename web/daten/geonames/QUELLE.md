# QUELLE: GeoNames (Orte in Hessen und große Städte in Deutschland)

| Feld | Angabe |
|---|---|
| Quelle | https://download.geonames.org/export/dump/ |
| Abruf | `DE.zip`, `admin1CodesASCII.txt`, `readme.txt` (je 2026-10-13, UTC) |
| Abrufdatum (UTC) | 2026-10-13 |
| GeoNames-Stand | Unbekannt. `readme.txt` nennt kein Datum. |

Nicht im Repo: `DE.zip` (nur im Scratchpad). Der Zip-Inhalt `DE.txt` ist die Grundlage von `orte.json`.

## Dateien

| Datei | Bytes | SHA-256 | Im Repo |
|---|---|---|---|
| `DE.zip` (Quelle, Bytes laut Download) | 7458858 | `c239867b4f36788cdcad3aba7fe8a7052b5f0f2d42e5941722395d047706eaed` | nein |
| `DE.txt` (aus DE.zip) | 28192053 | `5afa14f06e5856cfb522945f647dfd06d042f4486cbf983425fef1d4b98aaf5b` | nein |
| `admin1CodesASCII.txt` | 151583 | `1da92a6323a5fec3176f3f743bf4cf4040fd56a876da55e46fbca23c863aa60a` | ja |
| `readme.txt` | 8843 | `b1957379b6c1242c700c98ac9a8aa0a09f56c3c0a50ee72175527005f48ef2c5` | ja |
| `alternatenames/DE.zip` (Quelle deutscher Namen, Abruf 2026-10-13) | 4017959 | `7b46807f7f366240eb47a1ed102a14ec6a0d28f26b2cd2dba1b94445175b46ea` | nein |
| `erzeuge.mjs` (Skript) | 6322 | `46c4301088353bcc9bfd805fd55be8e813753865871d3a9060ece29cf1e9784a` | ja |
| `orte.json` (erzeugt) | 32872 | `d3f029d76e7a0e6a9574636543cf927c42a00c09a2b8ce2f867a85c8904cc0dd` | ja |
| `web/src/lib/gebetszeiten/orte.json` (erzeugt, kompakt für den Browser) | 7809 | `d22a9ef63b80d1ca9085f86e09af627fbae189b5408bd93e93d76389aaec22cc` | ja |

## Lizenz (wörtlich aus readme.txt)

> This work is licensed under a Creative Commons Attribution 4.0 License, see https://creativecommons.org/licenses/by/4.0/
> The Data is provided "as is" without warranty or any representation of accuracy, timeliness or completeness.

Bedingungen auf https://www.geonames.org/export/ (wörtlich, Auszug): „cc-by licence (creative commons attribution license). You should give credit to GeoNames when using data or web services with a link or another reference to GeoNames.“

## Pflichten

- Namensnennung: „Ortsdaten © GeoNames (https://www.geonames.org/), CC BY 4.0“, mit Link.
- Änderungen (Auswahl, Felder, Rundung) kenntlich machen. Das geschieht über `erzeuge.mjs`.

## Auswahl und Erzeugung

Erzeugt mit `erzeuge.mjs` (Aufruf: `node erzeuge.mjs DE.zip admin1CodesASCII.txt orte.json alternatenames/DE.zip ../../src/lib/gebetszeiten/orte.json`):

- Feature-Klasse `P` ohne Ortsteile (Feature-Codes `PPLX`, `PPLH`, `PPLQ`, `PPLW`).
- Hessen (admin1 `05`) mit mindestens 10.000 Einwohnern, Orte im Umkreis von 40 km um Wetzlar mit mindestens 3.000 Einwohnern,
  plus alle deutschen Orte mit mindestens 200.000 Einwohnern.
- Felder: `name` (bevorzugter deutscher Name aus `alternatenames`, sonst GeoNames-Hauptname), `breite`, `laenge` (5 Nachkommastellen),
  `einwohner`, `bundesland` (deutsch).
- Sortierung: Einwohner absteigend, dann Name.
- Kompakte Browserliste: `[Name, Breite, Länge]`; doppelte Namen erhalten das Bundesland in Klammern (z. B. „Münster (Hessen)“).

Ergebnis: 245 Orte, davon 205 in Hessen, 38 mit mindestens 200.000 Einwohnern.

## Prüfung

- Admin1-Codes: `admin1CodesASCII.txt` bestätigt `DE.05` = „Hesse“ (Hessen). Das Skript prüft alle 16 Codes gegen die englischen Namen. Ergebnis: bestanden.
- Deutsche Namen: „München“, „Nürnberg“, „Freiburg im Breisgau“ statt der englischen Hauptnamen; Stadtbezirke (Wandsbek, Altona …) entfallen.

## Verwendung
- Gebetszeiten „Mein Ort“: nächster Ort zum (im Browser gerundeten) Standort und Ortsauswahl ohne GPS. Die Liste lädt erst nach einem Klick;
  Koordinaten verlassen das Gerät nie (Z-19).
