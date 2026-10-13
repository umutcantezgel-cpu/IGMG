# QUELLE: Tanzil Quran Text (Uthmani)

| Feld | Angabe |
|---|---|
| Quelle | https://tanzil.net/download/ |
| Abruf Text | https://tanzil.net/pub/download/index.php?quranType=uthmani&outType=xml&agree=true&marks=true&sajdah=true |
| Abruf Metadaten | https://tanzil.net/res/text/metadata/quran-data.xml |
| Version | Tanzil Quran Text (Uthmani), Version 1.1 (laut XML-Kopf; Veröffentlichung 12.02.2021 laut https://tanzil.net/updates/) |
| Abrufdatum (UTC) | 2026-10-13 |

## Gewählte Variante

- `quranType=uthmani`, `marks=true` (Pausenzeichen), `sajdah=true` (Sajda-Zeichen). Ohne `rub` (Rub-el-Hizb), ohne `tatweel`, ohne `stanween`.
- Die Option `alef` hat bei dieser Textart keine Wirkung (Ausgabe byte-identisch mit und ohne).
- Begründung: Dateiname der quran-tajweed-Ausgabe „uthmani-pause-sajdah“. Die Variante mit Tatweel wurde als Vergleich geprüft (siehe unten), ist aber nicht gewählt.

## Dateien (unverändert)

| Datei | Bytes | SHA-256 |
|---|---|---|
| `quran-uthmani.xml` | 1529315 | `5ea5cbab9b4d031613a819a70822aff75e7c4500dea4946fc554b1bf84b7468a` |
| `quran-data.xml` | 77234 | `8867c1d88191472adec9db694b3cd9f135b1a2ef580574d32cf888dcb22c5c7a` |

## Lizenz und Bedingungen

Kopfkommentar der XML-Datei (Auszug, wörtlich): „Tanzil Quran Text (Uthmani, Version 1.1) … Copyright (C) 2007-2026 Tanzil Project … License: Creative Commons Attribution 3.0“.

Bedingungen auf https://tanzil.net/download/ (Terms of Use, wörtlich): „Permission is granted to copy and distribute verbatim copies of the Quran text provided here, but changing the text is not allowed. The text can be used in any website or application, provided that its source (Tanzil Project) is clearly indicated, and a link is made to tanzil.net to enable users to keep track of changes.“

Kopfkommentar, wörtlich: „This copyright notice shall be included in all verbatim copies of the text, and shall be reproduced appropriately in all files derived from or containing substantial portion of this text.“

Metadaten-Kopf: `copyright="(C) 2008-2009 Tanzil.info" license="cc-by"`.

## Pflichten

- Quelle „Tanzil Project“ nennen, Link auf tanzil.net setzen.
- Copyright-Kommentar im Dateikopf belassen.
- Text nicht verändern. Die Datei ist unverändert übernommen.

## Prüfung

Ergebnisse, Stand 2026-10-13:

1. Struktur: 114 Suren, 6236 Verse. Verse je Sure stimmen mit `quran-data.xml` überein (0 Abweichungen).
2. Abdeckung quran-tajweed: zu allen 6236 Versen gibt es einen Eintrag; insgesamt 60.057 Annotationen.
3. Stichprobe, 30 Annotationen per Zufall (Seed 20261013, Mulberry32), Roh-Offsets gegen Verslänge in Codepunkten:
   - 29 von 30 innerhalb.
   - 1 Abweichung: 57:1, `madd_246` [114,115], Verslänge 80.
4. Vollprüfung, Roh-Offsets: 331 Annotationen in 109 Versen über die Verslänge. Betroffen ist jeweils **Vers 1** der Suren 2–114 außer 9 (z. B. 2:1 `madd_6` [40,42] bei Länge 5).
5. Befund: Bei Vers 1 der Suren 2–114 außer 9 liegen die Offsets um **39 Codepunkte** zu weit hinten. 39 entspricht der Basmala (38 Codepunkte) plus einem Leerzeichen. Mit Abzug von 39 bei genau diesen Versen liegen **alle 60.057 Annotationen** innerhalb der Verslänge, und `start < end` gilt überall. Sure 1 und Sure 9 brauchen keinen Abzug (Sure 9 ist ohne Abzug geprüft).
   - Plausibilität: 2:1 wird damit zu `madd_6` auf [1,3] und [3,5] (Muqatta'at-Madd). Der Befund ist rechnerisch belegt. Die Ursache (Basmala-Präfix im 2017-Referenztext) ist nicht belegt.
6. Vergleich der Textvarianten (Roh-Offsets außerhalb der Verslänge):

| Variante | Außerhalb roh | Außerhalb nach −39 bei Vers 1 | Madd-Start auf Madd-Buchstabe (roh / korrigiert) |
|---|---|---|---|
| uthmani + marks + sajdah (gewählt) | 331 | 0 | 11030 / 18888 → 11145 / 18888 |
| uthmani + marks + sajdah + tatweel | 325 | 0 | 4769 / 18888 → 4806 / 18888 |
| uthmani + sajdah (ohne marks) | 341 | – | – |
| uthmani ohne Zeichen | 341 | – | – |
| uthmani + marks + sajdah + rub | 331 | – | – |
| uthmani-min + marks + sajdah | 10772 | – | – |

Die Varianten mit Tatweel und ohne Tatweel sind über die Grenzen allein nicht eindeutig trennbar. Die Madd-Trefferquote spricht für die gewählte Variante.

## Offene Fragen

- OFFENE FRAGE: Ist der 2017-Text (quran-uthmani.txt, github-Anhang) mit der Basmala-Verschiebung identisch? Der Anhang ist hier nicht erreichbar. Der Import (`scripts/tajwid-import.ts`) muss die Verschiebung kennen oder die Variante bestätigen lassen.
- OFFENE FRAGE: Ist die Tatweel-Variante die von quran-tajweed gemeinte Fassung? Die Madd-Trefferquote spricht dagegen. Abschließend nicht entschieden.
