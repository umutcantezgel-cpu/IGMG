E0-DATEN (H-E0-B01), Stand 2026-10-13 (UTC). Ich habe `_gemeinde/berichte/E0-DATEN.md` nicht geschrieben, weil Prüfer keine Berichtsdateien anlegen. Dieser Text ist die Ablage. Belege: `/home/user/IGMG/web/daten/<quelle>/QUELLE.md`. Nichts committet, nichts gepusht.

**1. quran-tajweed** (`web/daten/quran-tajweed/`)
- Commit `496f71cd191da00fa2a37ded79dbbddb033bb0ad`, abgerufen über jsDelivr mit Commit-Pin. Projekt laut README nicht mehr gepflegt.
- `tajweed.hafs.uthmani-pause-sajdah.json`, 5578730 B, `151d616ad37a4cc21a80f20d5e1104c5b408375107ddd4d71247dea4c05ebf67`
- `README.md`, 9150 B, `89373f92f0806541aca3c144f2c4469fcc304f904d0ff58271b4a318244e7e8e`
- Lizenz: CC BY 4.0 laut README. Im Commit liegt keine LICENSE-Datei.
- Prüfung: 6236 Verse, 60057 Annotationen, 18 Regeln, alle start < end.
- Befund: Die Offsets passen nur nach Korrektur zur aktuellen Tanzil-Fassung. Bei Vers 1 der Suren 2–114 außer 9 liegen sie 39 Codepunkte zu weit hinten (Basmala 38 + Leerzeichen). Roh liegen 331 Annotationen in 109 Versen außerhalb der Verslänge. Nach −39 bei diesen Versen sind es 0. Ursache nicht belegt.

**2. tanzil** (`web/daten/tanzil/`)
- `quran-uthmani.xml`, 1529315 B, `5ea5cbab9b4d031613a819a70822aff75e7c4500dea4946fc554b1bf84b7468a`. Uthmani mit Pausen- und Sajda-Zeichen, ohne Tatweel und Rub-el-Hizb. Version 1.1 (2021).
- `quran-data.xml`, 77234 B, `8867c1d88191472adec9db694b3cd9f135b1a2ef580574d32cf888dcb22c5c7a`
- Lizenz: CC BY 3.0 laut XML-Kopf. Text unverändert, Quelle „Tanzil Project“ nennen, Link auf tanzil.net, Copyright-Block belassen.
- Prüfung: 114 Suren, 6236 Verse, Metadaten ohne Abweichung. Stichprobe 30 (Seed 20261013): 29 innerhalb. Eine Abweichung: 57:1, `madd_246` [114,115] bei Länge 80. Durch den Basmala-Befund erklärt.
- OFFENE FRAGE: Die Tatweel-Variante ergibt nach Korrektur ebenfalls 0 Abweichungen. Die Trefferquote auf Madd-Buchstaben spricht für die gewählte Variante (59 % gegen 25 %). Nicht abschließend entschieden.
- OFFENE FRAGE: Der 2017-Referenztext (`quran-uthmani.txt`, GitHub-Anhang) ist nicht erreichbar (HTTP 403).

**3. hadith** (`web/daten/hadith/`, Commit `df57907be35291c91ad6a6691180e22ca9920784`)
- `ara-bukhari.json` (Quelle `editions/ara-bukhari.json`), 9770083 B, `e34a3402889ca378871da3c5984b7875c680920e93f1c8738ac7afe502179562`
- `info.json`, 10319127 B, `cf1ced267ada8f606f95eb84e2b6ddfa87bfa2a6a9dd4cb2a5d9a8c1734f10fb`
- `editions.json`, 30390 B, `ef6eaefd10c348c500624091846d7bd7968056bea9bb15875a427d2cc2b2b3bf`
- `LICENSE`, 1211 B, `6b0382b16279f26ff69014300541967a356a666eb0b91b422f6862f6b7dad17e`
- `README.md`, `References.md`
- Lizenz des Repos: Unlicense. Keine Namensnennungspflicht.
- Prüfung: 7589 Einträge. Nummern 1–7563 lückenlos. 26 Einträge mit Nachkommastelle. 9 leere Texte (5710, 5711, 5712, 5774, 5775, 6074, 6075, 6174, 6175). Bücher 1–97 benannt. 7580 Texte mit Harakat. Keine Übersetzungen geladen.
- OFFENE FRAGE: Die Unlicense deckt den arabischen Text nicht. Seine Herkunft ist nicht belegt, `References.md` nennt sunnah.com. Der Plan verlangt dafür eine Erlaubnis (MN-06).
- OFFENE FRAGE: 311 Einträge tragen Buch 0 ohne Titel, verteilt über 291 Nummernbereiche. Vermutlich fehlt die Buchzuordnung.

**4. quranenc** (`web/daten/quranenc/`): NICHT GELADEN. Drei Anläufe auf `translations/list/de` gingen je in 60 s Timeout, die Startseite ebenfalls. `list/tr`, `list/en` und die Volltexte wurden nicht versucht. Die 7 Bedingungen sind nicht erfasst und nicht aus dem Gedächtnis ergänzt.

**5. geonames** (`web/daten/geonames/`)
- `orte.json`, 18570 B, `7189909e5983953a8ca52743b0310a563144574528a73cb753e1aeba54b7398b`. 137 Orte: 94 in Hessen mit mindestens 15.000 Einwohnern, 45 Orte mit mindestens 200.000 bundesweit.
- `erzeuge.mjs`, 4071 B, `cae676ee581672810d74249f74cb0dfd9538746924db82bf95edbbbf9c073b5a`
- `admin1CodesASCII.txt`, 151583 B, `1da92a6323a5fec3176f3f743bf4cf4040fd56a876da55e46fbca23c863aa60a`
- `readme.txt`, 8843 B, `b1957379b6c1242c700c98ac9a8aa0a09f56c3c0a50ee72175527005f48ef2c5`
- Nicht im Repo: `DE.zip`, 7458858 B, `c239867b4f36788cdcad3aba7fe8a7052b5f0f2d42e5941722395d047706eaed`
- Lizenz: CC BY 4.0 laut `readme.txt`. Namensnennung GeoNames mit Link.
- Prüfung: Die Annahme „admin1 05 = Hessen“ stimmt (`DE.05` = Hesse). Das Skript prüft alle 16 Codes. Stichproben: Frankfurt am Main 650000, Wetzlar 52656.
- OFFENE FRAGE: Stadtbezirke und Ortsteile mit mindestens 200.000 Einwohnern (Wandsbek, Hamburg-Nord, Altona, Eimsbüttel, Hamburg-Mitte, Marienthal, Neue Neustadt). Behalten oder ausschließen?
- OFFENE FRAGE: Das Feld `name` ist der GeoNames-Hauptname und teils englisch (Munich, Nuremberg). Deutsch oder `asciiname`?

**Offen insgesamt:** Quelle und Recht des arabischen Bukhari-Textes, die QuranEnc-Bedingungen und die Tanzil-Variante (Tatweel).