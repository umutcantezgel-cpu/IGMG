# QUELLE: cpfair/quran-tajweed

| Feld | Angabe |
|---|---|
| Projekt | https://github.com/cpfair/quran-tajweed |
| Abruf | https://cdn.jsdelivr.net/gh/cpfair/quran-tajweed@496f71cd191da00fa2a37ded79dbbddb033bb0ad/output/tajweed.hafs.uthmani-pause-sajdah.json |
| Commit | `496f71cd191da00fa2a37ded79dbbddb033bb0ad` (master-HEAD laut `git ls-remote`; Commit vom 12.10.2021 „Update README to reflect project status and alternatives“) |
| Abrufdatum (UTC) | 2026-10-13 |
| Projektstatus | README: „This project is not actively maintained“ |

## Dateien (unverändert)

| Datei | Bytes | SHA-256 |
|---|---|---|
| `tajweed.hafs.uthmani-pause-sajdah.json` | 5578730 | `151d616ad37a4cc21a80f20d5e1104c5b408375107ddd4d71247dea4c05ebf67` |
| `README.md` (Kopie von raw.githubusercontent.com/cpfair/quran-tajweed/master/README.md, identisch) | 9150 | `89373f92f0806541aca3c144f2c4469fcc304f904d0ff58271b4a318244e7e8e` |

SHA-256 der Git-Blob-Inhalte im Commit stimmt mit der Datei überein (geprüft über Klon des Commits).

## Lizenz (wörtlich aus README.md)

> This data file is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/), while the original Tanzil.net text file linked above is made available under the [Tanzil.net terms of use](https://tanzil.net/download/).

Hinweis: Im Repo zu diesem Commit liegt **keine LICENSE-Datei**. Maßgeblich ist die README-Angabe oben.

## Pflichten

- Namensnennung (CC BY 4.0): Urheber und Lizenz nennen, Link auf die Lizenz, Änderungen kenntlich machen. Die Datei ist unverändert übernommen.
- Die Tanzil-Bedingungen gelten für den Quelltext (siehe `../tanzil/QUELLE.md`).

## Textvariante (wörtlich aus README.md)

> The `start` and `end` indices of each annotation refer to the Unicode codepoint (not byte!) offset within the Tanzil.net Uthmani Qur'an text. **NOTE:** that the encoding of the files available from Tanzil.net has changed slightly since the annotations were generated, so please use this copy of the Qur'an text file: quran-uthmani.txt (github.com/cpfair/quran-tajweed/files/7281388/quran-uthmani.txt, downloaded ca. Apr 6, 2017).

Das 2017-Exemplar wurde **nicht** geladen (github.com-Anhang liefert HTTP 403). Geladen wurde die aktuelle Tanzil-Uthmani-Fassung mit Pausen- und Sajda-Zeichen, siehe `../tanzil/QUELLE.md` mit Prüfergebnissen.

## Inhalt (Prüfung)

- 6236 Verseinträge, 114 Suren, 60.057 Annotationen, 18 Regeln, alle `start < end`.
- Die Offsets passen nicht ohne Korrektur zur Tanzil-Fassung 1.1 (siehe `../tanzil/QUELLE.md`, Abschnitt Prüfung).

## Neu erzeugte Fassung für Tanzil 1.1 (Lauf Gemeinde-Plattform, 2026-10-13)

**Befund:** Die Offsets der veröffentlichten Datei gehören zum Tanzil-Text von 2017. Gegen die aktuelle Fassung 1.1 treffen nur 65–70 % der prüfbaren Annotationen ihren Zielbuchstaben (Hamzat al-Wasl → ٱ, Lam schamsiyya → ل, Qalqala → ق ط ب ج د); die Abweichung wächst innerhalb der Verse. Falsche Färbung wäre ein Lehrfehler.

**Vorgehen:** Der Klassifikator des Projekts (`tajweed_classifier.py`, `tree.py`, Regelbäume `rule_trees/*.json`, alles aus Commit `496f71cd191da00fa2a37ded79dbbddb033bb0ad` über jsDelivr) wurde **nur lokal als Werkzeug** auf den Text `../tanzil/quran-uthmani.xml` (Fassung 1.1, Format „Sure|Vers|Text“) angewendet. Der Code wird nicht weitergegeben (im Repo liegt keine LICENSE-Datei für den Code); weitergegeben werden nur die erzeugten Daten.

| Datei | Bytes | SHA-256 |
|---|---|---|
| `tajwid-tanzil-1.1.json` (kompakt: `[[Sure, Vers, [[Start, Ende, Regel], …]], …]`, Offsets in Codepunkten des Tanzil-1.1-Verstexts) | 1285862 | `59a193f8f486c324146fafca928b513e81dd4169dc406d1ec7d13cf3177888f7` |

Werkzeug-Prüfsummen: `tajweed_classifier.py` `e775db030e2116b3446b194a85af83ccb34b22c3d59826fb8c43020b1d444f4a`, `tree.py` `943f0ef865290d161a8b7377027cea8994ecdbae96b9715e36882a657f78af69`.

**Prüfung (alle 6.236 Verse):**
- Alle Annotationen liegen innerhalb des Verses (`0 ≤ start < end ≤ Länge`).
- Zielbuchstaben: Hamzat al-Wasl 13.154/13.154, Lam schamsiyya 2.706/2.706, Qalqala 3.812/3.812 (100 %).
- Mengen je Regel liegen bei 98 % der Originaldatei (58.815 gegen 60.057; Unterschiede v. a. Basmala in Vers 1 der Originalvorlage und Textänderungen 2021).

**Lizenz:** Die Daten sind abgeleitet aus den Regelbäumen des Projekts (CC BY 4.0 laut README) und dem Tanzil-Text (CC BY 3.0, unverändert). Namensnennung: „Tajwid-Markierungen: cpfair/quran-tajweed (CC BY 4.0), neu berechnet für Tanzil 1.1“ auf `/quellen`.

**Freigabe:** Die Färbung ist eine maschinelle Hilfe. Sie erscheint öffentlich erst, wenn die Lehrkraft Stichproben geprüft und die Regeltexte freigegeben hat (MENSCHEN MN-04); bis dahin in Vorschau/Entwicklung mit Hinweis „automatisch erzeugt, Prüfung ausstehend“.

Die veröffentlichte Originaldatei (5.578.730 Bytes, SHA-256 `151d616a…`) ist über die oben genannte jsDelivr-Adresse reproduzierbar und liegt nicht mehr im Repository.
