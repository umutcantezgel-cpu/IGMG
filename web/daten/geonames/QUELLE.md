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
| `erzeuge.mjs` (Skript) | 4071 | `cae676ee581672810d74249f74cb0dfd9538746924db82bf95edbbbf9c073b5a` | ja |
| `orte.json` (erzeugt) | 18570 | `7189909e5983953a8ca52743b0310a563144574528a73cb753e1aeba54b7398b` | ja |

## Lizenz (wörtlich aus readme.txt)

> This work is licensed under a Creative Commons Attribution 4.0 License, see https://creativecommons.org/licenses/by/4.0/
> The Data is provided "as is" without warranty or any representation of accuracy, timeliness or completeness.

Bedingungen auf https://www.geonames.org/export/ (wörtlich, Auszug): „cc-by licence (creative commons attribution license). You should give credit to GeoNames when using data or web services with a link or another reference to GeoNames.“

## Pflichten

- Namensnennung: „Ortsdaten © GeoNames (https://www.geonames.org/), CC BY 4.0“, mit Link.
- Änderungen (Auswahl, Felder, Rundung) kenntlich machen. Das geschieht über `erzeuge.mjs`.

## Auswahl und Erzeugung

Erzeugt mit `erzeuge.mjs` (Aufruf: `node erzeuge.mjs <DE.txt|DE.zip> admin1CodesASCII.txt`):

- Feature-Klasse `P`.
- Hessen (admin1 `05`) mit mindestens 15.000 Einwohnern, plus alle deutschen Orte mit mindestens 200.000 Einwohnern.
- Felder: `name` (GeoNames-Hauptname), `breite`, `laenge` (auf 5 Nachkommastellen gerundete Zahlen), `einwohner`, `bundesland` (deutsch).
- Sortierung: Einwohner absteigend, dann Name.

Ergebnis: 137 Orte. Davon 94 in Hessen (alle mit mindestens 15.000 Einwohnern). 45 Orte haben mindestens 200.000 Einwohner.

## Prüfung

- Admin1-Codes: `admin1CodesASCII.txt` bestätigt `DE.05` = „Hesse“ (Hessen). Das Skript prüft alle 16 Codes gegen die englischen Namen. Ergebnis: bestanden.
- Stichproben: Frankfurt am Main 650000, Hessen. Wetzlar 52656, Hessen.
- Alle Einträge haben Bundesland und Einwohnerzahl.

## Offene Fragen

- OFFENE FRAGE: Stadtbezirke und Ortsteile zählen als „Orte“ und erreichen 200.000 Einwohner. Beispiele: Wandsbek, Hamburg-Nord, Altona, Eimsbüttel, Hamburg-Mitte, Marienthal, Neue Neustadt. Ausschließen oder behalten?
- OFFENE FRAGE: Das Feld `name` ist der GeoNames-Hauptname. Er ist teils englisch, z. B. „Munich“, „Nuremberg“. Deutsche Namen oder `asciiname` verwenden?
