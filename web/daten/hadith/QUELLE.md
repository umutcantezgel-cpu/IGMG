# QUELLE: fawazahmed0/hadith-api (Edition ara-bukhari)

| Feld | Angabe |
|---|---|
| Projekt | https://github.com/fawazahmed0/hadith-api |
| Abruf | https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@df57907be35291c91ad6a6691180e22ca9920784/<Datei> |
| Commit | `df57907be35291c91ad6a6691180e22ca9920784` (Branch `1`-HEAD laut `git ls-remote`; Commit vom 03.06.2026 „Update Al Hadith App link in README“) |
| Edition | `ara-bukhari` (Sahih al-Bukhari, Arabisch, mit Harakat). Keine Übersetzungen geladen. |
| Abrufdatum (UTC) | 2026-10-13 |

## Dateien (unverändert)

| Datei | Bytes | SHA-256 |
|---|---|---|
| `editions.json` | 30390 | `ef6eaefd10c348c500624091846d7bd7968056bea9bb15875a427d2cc2b2b3bf` |
| `info.json` | 10319127 | `cf1ced267ada8f606f95eb84e2b6ddfa87bfa2a6a9dd4cb2a5d9a8c1734f10fb` |
| `editions/ara-bukhari.json` (als `ara-bukhari.json`) | 9770083 | `e34a3402889ca378871da3c5984b7875c680920e93f1c8738ac7afe502179562` |
| `LICENSE` | 1211 | `6b0382b16279f26ff69014300541967a356a666eb0b91b422f6862f6b7dad17e` |
| `README.md` | 4739 | `5ffde2406be81c56c12312cb15e4ffce11ed39512c2f598b554b7f2fd68b59a2` |
| `References.md` | 2442 | `00d51c7d58ec4d90106fc792ca0f1e400eaaad6a51527a4a69dd1d062a4f8283` |

`info.json` enthält je Sammlung Metadaten, Nummerierung und Bewertungen („grades“), aber keinen Text. Die Bukhari-Einträge darin haben kein Textfeld.

## Lizenz (wörtlich aus `LICENSE`)

> This is free and unencumbered software released into the public domain. Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, either in source code form or as a compiled binary, for any purpose, commercial or non-commercial, and by any means.

Lizenz: Unlicense (https://unlicense.org). Keine Namensnennungspflicht.

## Offene Rechtsfrage (nicht entschieden)

- OFFENE FRAGE: Die Lizenz deckt die Zusammenstellung des Repos. Die Rechte am arabischen Bukhari-Text sind damit nicht geklärt. Die `References.md` nennen u. a. https://sunnah.com/ und weitere Seiten, ohne Zuordnung je Edition. Die Herkunft von `ara-bukhari` ist im Repo nicht belegt. Der Plan nennt den Datenabzug von sunnah.com als erlaubnispflichtig. Vorschau-Nutzung gemäß Plan, öffentliche Nutzung erst nach Rechtsfreigabe (MN-06).

## Prüfung von `editions/ara-bukhari.json`

- 7589 Einträge (Schlüssel `hadiths`, Metadaten `metadata.name` = „Sahih al Bukhari“).
- Nummern: `hadithnumber` 1 bis 7563 lückenlos (7563 ganzzahlige Einträge, `arabicnumber` = `hadithnumber`).
- 26 Einträge mit Nachkommastelle (z. B. 402.2, Buch 8, Nr. 54), 18 Bücher betroffen. Vermutlich Zusatzeinträge. OFFENE FRAGE, wie sie zu zählen sind.
- 9 Einträge mit leerem Text: `hadithnumber` 5710, 5711, 5712, 5774, 5775, 6074, 6075, 6174, 6175.
- Bücher: `reference.book` 0 bis 97. `metadata.sections` hat 98 Einträge. Buch 1–97 sind benannt, Buch 0 hat keinen Namen.
- OFFENE FRAGE: Buch 0 enthält 311 Einträge (306 mit Text). Sie sind über 291 Nummernbereiche verteilt. Das sieht nach fehlender Buchzuordnung aus. Vor dem Import prüfen.
- 7580 von 7589 Texte enthalten Harakat.

## Verkleinerung (Lauf Gemeinde-Plattform, 2026-10-13)
- `info.json` (10.319.127 Bytes, alle Sammlungen) entfernt; reproduzierbar über die oben genannte jsDelivr-Adresse.
- Behalten als Auszug: `bukhari-info.json` = Schlüssel `bukhari` aus `info.json`, unverändert (694.970 Bytes, SHA-256 `d794daa8fdb7f05a94b74a6784f99f3d16461cf7353457fd0d5bc24e809b8714`).
