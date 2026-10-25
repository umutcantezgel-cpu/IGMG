# Stufe C – Gruppe „Lizenzen, Audio, Stimmen, Werkzeuge, Versionen“ (L8-05)

| | |
|---|---|
| Datum | 25.10.2026 |
| Stand | `6bb7b6d6` (Branch `claude/trusting-lovelace-6nfolz`; während der Prüfung kam nur `0c90f09a` dazu, eine reine PRÜFPUNKT-Änderung) |
| Prüfer | Stufe C, Gruppe lizenzen |
| Kriterien | Z-L15, Z-L17, Z-L18, Z-L19, Z-L20, Z-L21 (ohne den religiösen Audio-Teil, den die Gruppe „religion“ prüft), Z-L22 |
| Umfang | Sprachkurse A1–B1 in 6 Richtungen (L3-E16); B2/C1 nicht Gegenstand |
| Live | `https://igmg-wetzlarer.vercel.app`, Abrufe am 25.10.2026 zwischen 19:13 und 19:30 UTC |
| Schrift | Diese Datei enthält keine arabische Schrift. Arabische Wörter stehen nur über ihre Schlüssel oder in Umschrift. |

## 0. Vorgehen, Befehle, Grenzen

Umgebung: Node 24.21.0 aus dem Scratchpad, Werkzeuge nach Briefing. **Abweichung beim TMPDIR:** `scratchpad/tmp-c-lizenzen` macht
den IPC-Socket von `tsx` zu lang (`listen EINVAL … tmp-c-lizenzen/tsx-0/32414.pipe`, Unix-Grenze 108 Zeichen). Deshalb waren im
ersten Lauf 2 Tests von `audio-hochladen` rot (rc 1 statt 2 bzw. 0). Alle weiteren Läufe nutzten den kürzeren eigenen Ordner
`scratchpad/tcl`.

| # | Befehl (in `web/`) | Ergebnis |
|---|---|---|
| B1 | `pnpm vitest run` mit 8 Dateien: `lernapp/quellen`, `lernapp/audio-kette`, `lernapp/tatoeba-ausschluss`, `lernapp/namensnennung`, `lernapp/bundle-regeln`, `bundle-regeln`, `lernapp/sprechen`, `lernapp/audio-hochladen` | 342 Tests: 340 grün, 2 rot, beide wegen der Socket-Länge (s. o.). Wiederholung `audio-hochladen` mit kurzem TMPDIR: **10/10 grün** |
| B2 | `pnpm vitest run` `lernapp/aufgaben-komponenten`, `lernapp/aufgaben-l2`, `lernapp/paket-l2` | **54/54 grün** |
| B3 | `pnpm test:integration` `lernapp-audio`, `lernapp-pakete` | **20/20 grün** (23,7 s) |
| B4 | `pnpm lernapp:pruefen` | rc 0, 51 s. **414 Dateien, 129.322 Einträge, 0 blockierend**, 15 menschlich_klaeren (tabu 12, religionsbezug 3), 960 Warnungen. Prüfer **lizenz 0/0/0, ausschluss 0/0/0, audio 0/0/0**. „Quelle und Lizenz je Eintrag: 100 %“ |
| B5 | SHA-256 und Größe der 9 Modell- und ORT-Dateien und der 2 Lizenztexte, nur lesend gegen `web/daten/lernapp-modelle/QUELLE.md` (eigenes Skript) | **11/11 gleich**. Die Lizenztexte in `public/…/whisper-base-64da572/` sind byte-gleich mit `daten/lernapp-modelle/` |
| B6 | npm-Registry (`registry.npmjs.org`): Veröffentlichungsdaten und Lizenzen der neuen Abhängigkeiten | Tabelle in Z-L22 |
| B7 | Live per curl (GET; für große Dateien HEAD): `/quellen`, `/lern-app/{de,tr,ar}/quellen`, die Kursverzeichnisse `/lern-app/pakete/<kurs>` (6 Richtungen sowie islam und koran), **46 Einheitenpakete**, 3 Audio-Bündel, Modell-, ORT- und Lizenzdateien, Worker | Einzelwerte in den Abschnitten |
| B8 | Eigene Durchsicht mit grep/rg über das ganze Repository (ohne `.git`, `node_modules`, `.claude/worktrees`), `web/daten/**`, `web/public`, `web/inhalte/lernapp` | Einzelwerte in Z-L18 und Z-L19 |
| B9 | Lizenzen aller Produktions-Abhängigkeiten: transitive Hülle der `dependencies` aus `node_modules` | 441 Pakete; Ergebnis in Z-L19 |

**Nicht ausgeführt** (laut Briefing): Bau, E2E und Serverstart. Die Inhaltsliste der Bau-Ausgabe (Function-Traces) ist deshalb
**nicht geprüft**. `pnpm lernapp:modelle` lief nicht: Das Skript kopiert ORT-Dateien und baut den Worker in `web/public` neu
(`rmSync` von `public/lern-app/modelle/sprechen`) und könnte so einen parallelen Bau des Orchestrators stören. B5 ersetzt seine
Prüfschritte 1 und 2 nur lesend.

---

## Z-L15 · Audio

**Schwelle (kurz):** Audio für 100 % der vertonbaren Zielinhalte (ohne `religionsbezug`) je Zielsprache mit freigegebener Stimme,
Lautheit nach EBU R128, Rückerkennungs-Stichprobe unter der Schwelle aus S3. Ohne freigegebene Stimme oder Aufnahmen gilt eine
AUSNAHME mit dem Ersatz „Audio folgt“; Hörübungen werden dann ohne Sackgasse übersprungen.

**Status: teilweise.** Die AUSNAHME „Audio folgt“ ist begründet und im Code umgesetzt. In der Produktion hängen aber Testtöne des
Testkurses an echten Einheiten. Dort steht deshalb kein „Audio folgt“, sondern es spielt ein Testton (Befund L15-1).

**Belege**

- **Stimmen je Sprache:** `web/src/lib/lernapp/audio/stimmen.ts:60` enthält `STIMMEN = { de: THORSTEN, tr: null, ar: null }`.
  - tr und ar haben keine Stimme (L3-E10a; LM-24, LM-25, LM-26).
  - de ist im Code registriert. Die Hörabnahme LM-06 ist offen; der Standard dafür lautet „ohne bestandene Hörprobe … ‚Audio
    folgt‘“ (`MENSCHEN.md:19`). Der Blob-Speicher fehlt ebenfalls (LM-15, `MENSCHEN.md:28`).
  - Im Repository gibt es **kein Audio-Manifest** (`web/inhalte/lernapp/audio-manifest/` existiert nicht). Live sind damit in
    allen drei Sprachen **0 Clips der Sprachausgabe**.
- **Ersatz „Audio folgt“ ohne Sackgasse (Code):**
  - `web/src/components/lernapp/aufgaben/Abspieler.tsx:42` setzt die Lage `ohne_audio`, wenn der Clip fehlt. Zeilen 63–75 zeigen
    dann nur `audioFolgt`, `audioFolgtText` und den Knopf „Weiter ohne Hören“.
  - `web/src/components/lernapp/Spieler.tsx:304-305` setzt `nurWeiter`, wenn bei einer Hörübung das Audio fehlt.
  - `web/src/lib/lernapp/engine/sitzung.ts:16,183` überspringt ohne Bewertung und ohne Wiederholung.
  - Unit `aufgaben-komponenten.test.tsx:151` („ohne Clip: ‚Audio folgt‘ und ‚Weiter ohne Hören‘, keine Optionen (keine
    Sackgasse)“) ist grün (B2).
  - Die Texte stehen in de/tr/ar unter `messages/lernapp/*.json:395-396`.
- **Lautheit und Rückerkennung (nur der Probelauf L3-05; nichts davon ist ausgeliefert):**
  - Selbst nachgerechnet aus `scratchpad/l3/tts/probelauf/a1/pruefung.json`: 1.319 Clips mit −23,80 bis −22,26 LUFS (Median
    −23,23), **0 außerhalb von −23 ± 1 LU**.
  - Rückerkennung: 826 Sätze, Trefferanteil im Mittel 0,861. Davon liegen 689 bei ≥ 0,75, 66 zwischen 0,6 und 0,75 und 71 unter
    0,6.
  - Endstand (`pruefung-gesamt.json`): 1.223 ok, 96 zum Hören. Das Manifest des Probelaufs hat 1.223 Clips, alle mit der Stimme
    `tts:coqui-vits-thorsten-onnx@d09293d41bc9427e`.
  - Die Schwelle steht in `belege/S3-stimmen.md:414` und `PLAN.md:674`: ≥ 0,75 ok, 0,6–0,75 einmal neu erzeugen, < 0,6 hören.
    Das deckt sich mit `berichte/l3-05-sprachausgabe.md` §3.
- **Befund L15-1 – Testtöne in echten Einheiten (live):**
  - **Verweise in den Kursverzeichnissen:**

    | Richtung | Einheiten mit `audio` | Bündel |
    |---|---|---|
    | `de-aus-tr` | 15 von 42 | `/lern-app/audio/de/de.a1.e01-d57ee53f398f1960.lpa` |
    | `tr-aus-de` | 11 von 42 | `tr.a1.e01-99d0902917a287ba.lpa` |
    | `ar-aus-de` | 10 von 27 | `ar.a1.e01-b676a0fed4891153.lpa` |

  - **Herkunft der Bündel:** Die drei Live-Bündel sind byte-gleich mit den Testbündeln des Seeds `web/drizzle/seeds/lernapp-testaudio/*/`
    (SHA-256 `d57ee53f…`, `99d09029…`, `b676a0fe…`). Das sind synthetische Töne mit der Stimme `test:ton`
    (`drizzle/seeds/lernapp-test.ts:13-15, 29`).
  - **Umfang:** In **33 echten Einheiten** (de 14, tr 10, ar 9; je Zielsprache eine Richtung ausgewertet) tragen **56 Aufgaben**
    Testtöne. Darunter sind diese Hörübungen:
    - `ar.a1.e02`, Lektion l01, Aufgabe 12 (`hoeren_waehlen`)
    - `tr.a1.e06`, Lektion l02, Aufgabe 14 (`hoeren_waehlen`)
    - `ar.a1.e07`, Lektion l05, Aufgabe 5 (`minimalpaare`)
    - `tr.a1.e06`, Lektion l02, Aufgabe 13 (`minimalpaare`)

    Die übrigen Fälle sind „Anhören“-Knöpfe in `auswahl`, `paare` und `geschichte`, z. B. „Haus“ in `de.a1.e03` und „üç“ in
    `tr.a1.e03`.
  - **Folge:** Gerade in tr und ar, die keine Stimme haben, spielt dort ein Ton statt „Audio folgt“. Eine Sackgasse entsteht
    nicht, weil „Ich kann gerade nicht hören“ bleibt.
  - **Ursache:**
    - `scripts/bau-datenbank.mjs:18` importiert auf Vercel ohne Datenbank den Testkurs (`--testkurs`).
    - `drizzle/seeds/lernapp-test.ts:172` legt die Testeinheit unter `<kurs>.a1.e01` an, also unter demselben Schlüssel wie die
      echte A1-Einheit e01.
    - `src/server/queries/lernapp/pakete.ts:266-318` nimmt je Text-Hash jede Stimme, mit dem Vorrang Mensch vor Sprachausgabe vor
      Testton. Damit bekommen echte Einträge mit gleichem Text den Testton.
  - **Nebenbefund für Z-L01 und Z-L16 (andere Gruppen):** Live ist A1 e01 in allen drei Zielsprachen die „Testeinheit: Alltag“
    (27 Einträge, alle mit der Quelle `test:lernapp-testkurs`; Paketgröße 16 KB statt ≈ 130 KB). Die echte Einheit
    `de.a1.e01` „Hallo, wer bist du? – Begrüßung und Vorstellung“ (40 Lemmata, 195 Sätze) fehlt in der Produktion. Für tr und ar
    gilt dasselbe.

**Lücken**

1. L15-1: Testtöne in 56 Aufgaben aus 33 echten Einheiten, und die Testeinheit ersetzt live e01 in allen Zielsprachen.
2. 0 % Audio für de, obwohl eine Stimme registriert ist. Das ist eine AUSNAHME bis LM-06 (Hörabnahme) und LM-15 (Blob) – nur
   Mensch.

**Nacharbeit**

- **Paket „Testkurs von echten Inhalten trennen“** (Code, Opus):
  - (a) `src/server/queries/lernapp/pakete.ts` (Audio-Auswahl ab Z. 266): Clips mit `test:`-Stimme nur für Einträge mit
    `quelle` `test:…` zulassen.
  - (b) `drizzle/seeds/lernapp-test.ts:172`: einen eigenen, kollisionsfreien Einheitenschlüssel vergeben (z. B.
    `<kurs>.test.e01`). Alternativ in `scripts/bau-datenbank.mjs:18` den Testkurs auf Vercel nicht mehr importieren. Die E2E-Specs,
    die sich auf `*.a1.e01` des Testkurses stützen, ziehen nach.
  - (c) Integrationstest: Ein echter Eintrag mit demselben Text wie ein Testkurs-Eintrag bekommt keinen Clip, und die echte e01
    bleibt nach dem Import mit Testkurs erhalten.
  - (d) Nach der Bereitstellung live prüfen, dass kein Verzeichnis außer der Testeinheit auf die drei Testbündel verweist.
- **Klein:** `messages/lernapp/{de,tr,ar}.json` Abschnitt `sprachausgabe.text` (de Z. 940). Der Satz „Die Aufnahmen wurden vorab
  erzeugt und geprüft“ trifft bis LM-06 nicht zu. Bis dahin entweder de ebenfalls unter „Noch ohne freigegebene Stimme“ führen oder
  den Text in die Zukunftsform setzen.
- **Nur Mensch:** LM-06 (Hörabnahme de) und LM-15 (Blob-Speicher „lernapp“).

---

## Z-L17 · Lizenzverzeichnis und Namensnennung

**Schwelle (kurz):** 100 % der ausgelieferten Posten mit zulässiger Lizenz im Verzeichnis. Namensnennungen auf `/quellen`, auf
`/lern-app/[ui]/quellen` und offline im Paket: Tatoeba je Satz; kaikki mit Link und Bearbeitungshinweis; Whisper unter MIT und
Apache-2.0; onnxruntime-web mit ThirdPartyNotices; OFL-Text der Schrift; Stimmen und Trainingsdaten. Lerninhalte als CC BY-SA 4.0
gekennzeichnet, ohne technische Schutzmaßnahmen.

**Status: teilweise.** Fast alles ist vorhanden und belegt. Es fehlt nur die Datei „ThirdPartyNotices“ von ONNX Runtime offline.
Außerdem gehen die Testtöne aus Z-L15 ohne Eintrag im Verzeichnis live.

**Belege**

- **Live-Abrufe:**

  | Seite | Status | Größe |
  |---|---|---|
  | `/lern-app/de/quellen` | 200 | 195.969 Byte |
  | `/lern-app/tr/quellen` | 200 | 196.527 Byte |
  | `/lern-app/ar/quellen` | 200 | 202.818 Byte |
  | `/quellen` | 200 | 351.600 Byte |
  | `/de/quellen` | 307 → `/quellen` | – |

- **Inhalt von `/lern-app/de/quellen` (Text ausgewertet):**
  - **Lerninhalte:** „CC BY-SA 4.0. Quelle, Lizenz und Namensnennung … je Eintrag im Kurspaket“.
  - **Tatoeba:** CC BY 2.0 FR mit der Teilmenge CC0 1.0. Das Muster je Satz lautet „Satz #{id} von {benutzer}, Tatoeba
    (https://tatoeba.org/de/sentences/show/{id}) …; Änderungen als ‚bearbeitet‘“.
  - **Wiktionary/kaikki:** CC BY-SA 4.0, Link auf den Artikel, „extrahiert mit Wiktextract (Tatu Ylonen) über kaikki.org;
    gekürzt und umformatiert“.
  - **Häufigkeitslisten:** wordfreq (mit SUBTLEX und den übrigen Unterquellen), CAMeL MSA 1.0, FrequencyWords. Sie dienen nur der
    Auswahl.
  - **Religiöse Daten:** Tanzil unter CC BY 3.0 und hadith-api unter Unlicense, beide nur über Verweise.
  - **Bildkarten:** Lucide 1.55.0 (ISC); 4 Symbole stammen aus Feather (MIT).
  - **Bibliotheken:** 12 mit Fassung und Lizenz, dazu die Volltexte von MIT, ISC und Apache-2.0.
  - **Spracherkennung:** Whisper base (MIT, „Copyright (c) 2022 OpenAI“) und Xenova/whisper-base `64da572` (Apache-2.0), beide mit
    Volltext.
  - **Drittlizenzen von ONNX Runtime:** Hinweis, Eigen (MPL-2.0) mit Quellcode-Adresse und ein Link auf die ThirdPartyNotices.
  - **Sprachausgabe:** Thorsten mit Trainingsdaten (CC0-1.0, mit Adresse), Modell (Apache-2.0, mit Adresse), Gewichte-Commit
    `54f782a5…` und SHA-256 `ebb3792e…`, ONNX-SHA `d09293d4…`, Engine, „Wasserzeichen: keines“, Kennung und Namensnennung. Dazu
    „Noch ohne freigegebene Stimme: Türkisch und Arabisch“.
  - **Schriften:** 4 Einträge mit SIL OFL 1.1 und dem OFL-Volltext.
  - **tr und ar** zeigen dieselben Posten: je 5-mal Tatoeba, 4-mal Wiktionary, 2-mal ThirdPartyNotices, 8-mal Thorsten, 9-mal
    CC BY-SA 4.0 und 6-mal SIL Open Font.
- **Website `/quellen`:** Sie hat die Abschnitte „Sprachdaten und Bildkarten der Lern-App“, „Sprachausgabe der Lern-App“,
  „Spracherkennung der Lern-App“ (Whisper, Xenova, Transformers.js, ONNX Runtime Web samt ThirdPartyNotices und Eigen),
  „Schriften“ und „Programmbibliotheken“.
- **Offline im Paket (46 Live-Pakete ausgewertet):**
  - Kopf: `lizenz: CC-BY-SA-4.0`; je Eintrag `quelle` und `lizenz`.
  - Tatoeba: **367 Einträge, alle mit Namensnennung**, z. B. „Satz #966160 von MUIRIEL (Tatoeba), CC BY 2.0 FR“.
  - Wiktionary: **1.314 Einträge, alle mit Namensnennung**, jeweils mit Artikel-Link und „gekürzt und umformatiert“.
  - Eigene Einträge: 12.893 mit `ki:` und 86 mit `test:`, alle CC BY-SA 4.0.
  - Die Offline-Seite ergänzt den Tatoeba-Link aus der Quelle (`src/lib/lernapp/namensnennung.ts:40-46`, Unit `namensnennung`
    grün). Die Quellenseite liegt im Vorrat des Service Workers (`public/lern-app/sw.js:29`).
  - Die Pakete sind frei per GET ohne Konto abrufbar, als JSON ohne Verschlüsselung. Es gibt also **keine technischen
    Schutzmaßnahmen**.
- **Abgleich Verzeichnis ↔ package.json, Lockfile und QUELLE.md:** Unit `quellen.test.ts` ist grün (B1). Sie prüft:
  - Fassung und Lizenz je Bibliothek gleich dem installierten Paket;
  - jede Bibliothek, die Client-Code der Lern-App importiert, steht in der Liste;
  - Lizenz und Namensnennung der Daten gleich `web/daten/<ordner>/QUELLE.md`;
  - `/quellen` nennt alles, was die Lern-App ausliefert;
  - die ThirdPartyNotices sind gepinnt und ausgeliefert (SHA-256 `143764b9…`).

  Selbst gegen die Registry geprüft (B6): Die Lizenzen der Lern-App-Bibliotheken stimmen mit den Angaben im Verzeichnis überein.
- **Lizenzwerte in `web/inhalte/lernapp`** (423 JSON-Dateien): `CC-BY-SA-4.0` 127.855, `CC-BY-2.0-FR` 1.467 (Tatoeba), `ISC` 63
  (Bildkarten). Andere Werte kommen nicht vor.
- **Audio-Manifest:** Im Repository liegt keines, es gibt also nichts abzugleichen. Das Stimmen-Register enthält genau eine Stimme
  (Thorsten), und die ist live genannt.
- **Lizenztexte neben den Gewichten, live:**

  | Datei | SHA-256 bzw. Größe |
  |---|---|
  | `/lern-app/modelle/whisper-base-64da572/LIZENZ-whisper-MIT.txt` | `b5d65a59…` |
  | `/lern-app/modelle/whisper-base-64da572/LIZENZ-Apache-2.0.txt` | `cfc7749b…` |
  | `/lern-app/lizenzen/onnxruntime-ThirdPartyNotices.txt` | `143764b9…`, 338.088 Byte |

  Alle drei sind gleich der Fassung im Repository. Der Worker trägt live einen Lizenzkopf: transformers 4.3.0 und tokenizers 0.2.0
  unter Apache-2.0, jinja 0.5.10 und ORT unter MIT.

**Lücken**

1. **Die ThirdPartyNotices von ONNX Runtime fehlen offline.** Die Datei liegt weder im Vorrat des Lern-App-SW noch im
   Modell-Vorrat `igmg-lernapp-modelle`. Die Seite sagt dazu „Zum Öffnen brauchst du eine Verbindung“, und
   `web/daten/lernapp-lizenzen/QUELLE.md` hat das bewusst so festgelegt. Das ORT-`.wasm` liegt aber nach dem Laden offline auf dem
   Gerät, die Hinweise darauf (u. a. protobuf BSD-3, Eigen MPL-2.0) nicht. Die Schwelle zählt „onnxruntime-web mit
   ThirdPartyNotices“ ausdrücklich zu „offline im Paket“.
2. Die Testtöne (`test:ton`) gehen live aus (Z-L15), stehen aber nicht im Verzeichnis. Sie sind eigene synthetische Töne ohne
   Fremdrecht; die Lücke entfällt mit der Nacharbeit zu Z-L15.

**Hinweise**

- Die „Version 5.3.0“ der vier Schriften ist die Fassung der Fontsource-Pakete, nicht die der Schrift.
- Der Eintrag „sharp“ auf der Website nennt Apache-2.0. Die mitgelieferte Bibliothek libvips (LGPL-3.0-or-later) fehlt dort; sie
  läuft serverseitig (siehe Z-L19).

**Nacharbeit**

- **Klein:**
  - `src/lib/lernapp/sprechen/vorrat.ts` (`fuelleVorrat`) und `modell.ts`: Beim Laden der Sprachprüfung zusätzlich
    `/lern-app/lizenzen/onnxruntime-ThirdPartyNotices.txt` (338 KB, ≈ 0,35 % der 95 MB) in den Vorrat `igmg-lernapp-modelle`
    legen. Wer ORT offline hat, hat dann auch die Hinweise offline.
  - Den Text zu den Drittlizenzen in `messages/lernapp/*.json` anpassen.
  - Unit `quellen.test.ts` und `sprechen-einmal-laden.test.ts` um die zusätzliche Datei erweitern.
- **Optional:** die Schriftfassung als „Paket 5.3.0“ beschriften und den Website-Eintrag „sharp“ um „enthält libvips,
  LGPL-3.0-or-later“ ergänzen.

---

## Z-L18 · Ausschlüsse

**Schwelle (kurz):** In Repository und Paketen dürfen nicht vorkommen:
- Material unter NC, ND oder „nur Forschung“;
- OpenITI-Dateien oder OpenITI-Markierungen (nur Metadaten);
- Daten aus dem Quranic Arabic Corpus oder seinen Ablegern;
- Shamela, Ḥiṣn al-Muslim und Verlagsübersetzungen;
- Tatoeba-Audio ohne CC BY 4.0, CC BY-SA 4.0 oder CC0;
- kaikki-Beispiele mit `ref`;
- KELLY, SUBTLEX-DE direkt und DeReWo.

**Status: erfüllt.**

**Belege**

- **Prüfer:** `pnpm lernapp:pruefen` meldet ausschluss 0/0/0 und lizenz 0/0/0 über 414 Dateien (B4).
  - `src/lib/lernapp/inhalt/pruefer/ausschluss.ts:15-65` sucht über `git ls-files` in `web/**` (ohne `tests/`) nach Dateinamen,
    Kopf-, Meta- und Seitenmarken von OpenITI und nach Formaten und Hosts des Quranic Arabic Corpus.
  - `src/lib/lernapp/inhalt/pruefer/lizenz.ts:24-48` enthält drei Listen:
    - `VERBOTENE_LIZENZ`: NC, ND, non-commercial, no-deriv, research only, CPML;
    - `AUSGESCHLOSSENE_QUELLEN` mit 14 Mustern: OpenITI, Shamela, Quranic Arabic Corpus samt Ablegern, QUL/NoorBayan,
      OpenSubtitles-Sätze, KELLY, SUBTLEX, DeReWo, Frequency Dictionary of Arabic, Profile deutsch, Ḥiṣn al-Muslim, Leipzig,
      TS Corpus, Zargan;
    - `AUSGESCHLOSSENE_STIMMEN`.
- **Unit-Tests:** `tatoeba-ausschluss.test.ts` ist grün (B1). Eine Datei „Unit lizenzen“, wie ABNAHME sie nennt, gibt es nicht.
  Gleichwertig sind `quellen.test.ts`, `tatoeba-ausschluss.test.ts`, `audio-kette.test.ts` und die Prüfer lizenz und ausschluss.
- **Eigene Durchsicht (B8):**
  - **OpenITI-Marken (Kopf, Meta, Seite):** Sie kommen nur im lokalen Werkzeug vor, als Parser-Konstante in
    `_lernapp/werkzeuge/quellen/openiti-passagen.mjs:310` und als synthetische Platzhalterproben in
    `openiti-passagen.test.mjs:41,45,222,254,264,273` („platzhalter: probe“, „wört1 …“). Werktext steht dort keiner, und nichts
    davon wird ausgeliefert. Dateinamen im OpenITI-Format: 0 in `git ls-files`.
  - **Quranic Arabic Corpus:** Die Formatmarken (Tabellenkopf der Morphologie, Ortsangaben mit vier Zahlen) kommen 0-mal vor. Den
    Host nennen nur die Lizenzberichte aus L0, als ausgeschlossene Quelle.
  - **Shamela in `web/inhalte`:** nur als Teil der OpenITI-Versions-URI im Feld `fundstelle` von Wissens-Belegen, z. B.
    `islam/taharah/islam.grund.e03.json:57` (`…IkhtiyarLiTaclil.Shamela0001066-ara1#ms7`). Das sind Metadaten ohne Text oder
    Markup; die OpenITI-URI als Fundstelle ist nach ADR 0045 Nr. 12 (zweiter Punkt) ausdrücklich zulässig.
  - **„ḥiṣn“:** nur das Lemma `ar.b1.e04.hisn` (Burg bzw. Festung), kein Bezug zu Ḥiṣn al-Muslim.
  - **KELLY, SUBTLEX, DeReWo, OpenSubtitles:** in `web/inhalte` 0 Treffer. In `web/daten` stehen sie nur in
    `haeufigkeit/QUELLE.md` (Namensnennung von wordfreq bzw. FrequencyWords und die Liste „Nicht verwenden“, Z. 18, 42, 67, 71).
    Sonst tauchen sie nur als gewöhnliche Wörter in Häufigkeits- und kaikki-Listen auf.
  - **kaikki:** Die drei Auszüge (ar 15.630, de 42.136, tr 22.361 Zeilen) enthalten **0-mal `examples`, 0-mal `ref` und 0-mal
    `ex`**. Vorkommende Schlüssel: `aux, g, gl, kanon, kf, l, mk, pl, pos, q, rom, ue, w`.
  - **Tatoeba:** Audio gibt es 0 (`tatoeba/QUELLE.md:88`). Die einzigen Audiodateien im Repository sind die 3 synthetischen
    Testbündel. Die Lizenzspalte der Satzauszüge enthält nur „CC BY 2.0 FR“ (ara 4.649, deu 23.106, tur 22.586).
  - **Lizenzen der Inhalte:** nur CC-BY-SA-4.0, CC-BY-2.0-FR und ISC (Z-L17).
- **Pakete live:** Die 46 Pakete enthalten 0 Treffer für OpenITI, Shamela, die Corpus-Hosts, die Marken, SUBTLEX, DeReWo,
  OpenSubtitles, `"ref"` und `"examples"`. Die Verzeichnisse `islam` und `koran` sind live leer (`einheiten: []`).

**Hinweis außerhalb der Lern-App**

- `web/daten/tanzil-uebersetzungen` (de.bubenheim, tr.diyanet, en.sahih) steht unter den Tanzil-Bedingungen „non-commercial
  purposes only“. Das sind Daten des Website-Koranlesers aus dem Lauf „Gemeinde-Plattform“, importiert, aber nicht aktiv und nicht
  freigegeben (siehe deren QUELLE.md; MN-02).
- Die Lern-App greift nicht darauf zu: rg findet die Daten nur in `scripts/inhalte-import.ts`, `src/lib/db/schema/quran.ts` und
  `app/[locale]/(website)/quellen/verzeichnis.ts`. In Lern-App-Paketen kommen sie nicht vor.

**Lücken:** keine.

**Nacharbeit:** keine. Optional in ABNAHME den vorgesehenen Beleg „Unit lizenzen“ durch die tatsächlichen Tests ersetzen.

---

## Z-L19 · Werkzeuge nur lokal

**Schwelle (kurz):** 0 GPL- oder LGPL-Code in Client-Bündeln, Funktionen und `web/public`. Genannt sind ausdrücklich piper1-gpl,
espeak-ng, Coqui TTS, Mishkal, CAMeL-Daten, igerman98, `sharp`/libvips und LanguageTool. Keine Sprachausgabe im Browser, im
Vercel-Bau oder in einer Funktion. LanguageTool nie über die öffentliche API.

**Status: teilweise.** Client, Worker, `web/public`, Bau und Werkzeuge sind sauber. `sharp` mit libvips (LGPL-3.0-or-later) wird
aber in Server-Funktionen geladen, auch in einer Funktion der Lern-App.

**Belege**

- **Client:** Unit `lernapp/bundle-regeln.test.ts` „Kein GPL/LGPL im Client der Lern-App“ ist grün (B1). Sie prüft die Lizenzen
  aller Pakete im Client-Modulgraph samt ihren Abhängigkeiten und erlaubt nur MIT, ISC, Apache-2.0, BSD, 0BSD, MPL-2.0 und OFL.
  Ebenfalls grün: „@huggingface/transformers nur in *.worker.ts“.
- **Worker live** (`/lern-app/modelle/sprechen/whisper.worker.mjs`, 691.884 Byte): Er trägt den Lizenzkopf und enthält 0 Texte
  von GPL oder LGPL. „sharp“ kommt nur als Methodenname der Web-Fassung vor (`toSharp()` wirft im Browser); libvips ist nicht
  enthalten.
- **`web/public`** (27 versionierte Dateien und die per `.gitignore` erzeugten Ordner `ort-…/` und `sprechen/`):
  - Fremdcode und Daten: `altcha/pbkdf2.js` (MIT, `LICENSE.txt`), die Logos (mit `QUELLE.md`), die Whisper-Dateien (MIT bzw.
    Apache-2.0) und ORT (MIT).
  - Eigenes: `sw.js` und die PWA-Symbole (`scripts/lernapp-symbole.mjs`, Achtstern).
  - „GNU General Public“ steht nur als Lizenztext in den ThirdPartyNotices: Z. 490 (Definition der Sekundärlizenzen der MPL) und
    Z. 5573 (Mbed TLS „Apache OR GPL“). GPL-Code ist das nicht.
- **Keine Sprachausgabe in Browser, Bau oder Funktion:**
  - `speechSynthesis` bzw. `SpeechSynthesisUtterance` in `web/src`: 0 Treffer.
  - `scripts/vercel-bau.mjs`, `bau-datenbank.mjs`, `lernapp-modelle.mjs`, `next.config.ts` und `package.json` enthalten nichts zu
    coqui, piper, espeak, gruut oder `erzeuge.py`.
  - Die Audio-Route liefert nur fertige Dateien aus (`src/app/lern-app/audio/[...pfad]/route.ts`).
  - Die Sprachausgabe läuft nur lokal mit `_lernapp/werkzeuge/tts/` (`requirements.in`: onnxruntime 1.30.0, gruut 2.4.0, numpy;
    espeak ist abgeschaltet, `tokenizer.py:96-115`).
  - Die Vercel-Wurzel ist `web` (`vercel.json:6`); `_lernapp/` wird nicht ausgeliefert.
- **LanguageTool:** 0 Fundstellen im Code. Erwähnt wird es nur in Plan, Berichten, ADR und STATUS. Eine Adresse der öffentlichen
  API steht nirgends im Repository.
- **Befund L19-1 – libvips in Funktionen:**
  - Der Lizenz-Scan der Produktions-Abhängigkeiten (B9: 441 installierte Pakete, transitiv) findet als **einziges GPL- oder
    LGPL-Paket `@img/sharp-libvips-linux-x64@1.3.4` (LGPL-3.0-or-later)**. Es kommt über `sharp@0.35.5` (`package.json`,
    `dependencies`, `^0.35.5`).
  - Server-Import: `src/lib/medien/verarbeiten.ts:3` (`import sharp from 'sharp'`). Diese Datei nutzen
    `src/server/actions/medien.ts:13` und `rezitationen.ts:14` (Website) sowie **`src/server/actions/lernapp-audio.ts:13`**
    (Verwaltung › Lern-App › Audio-Studio; prüft die Sprecher-Vereinbarung als PDF).
  - Damit gehört libvips zur Funktion der Lern-App-Verwaltung. Die Schwelle nennt „sharp/libvips“ ausdrücklich auch für
    Funktionen.
  - Ob Next.js `sharp` zusätzlich in andere Funktionen verfolgt, ist **nicht geprüft**, weil keine Bau-Ausgabe vorlag.

**Lücken**

1. L19-1: libvips (LGPL-3.0-or-later) in Server-Funktionen, darunter die Lern-App-Action `lernapp-audio.ts`.

**Nacharbeit**

- **Klein (Lern-App):**
  - In `src/server/actions/lernapp-audio.ts` die PDF-Prüfung ohne sharp erledigen. Dazu `erkenneTyp` und den PDF-Zweig aus
    `src/lib/medien/verarbeiten.ts` in ein Modul ohne sharp-Import auslagern (z. B. `src/lib/medien/typ.ts`). PDF wird ohnehin
    nicht neu kodiert.
  - In `tests/unit/lernapp/bundle-regeln.test.ts` eine Regel ergänzen: Kein Modul unter `server/actions/lernapp*`,
    `app/lern-app`, `lib/lernapp` oder `server/queries/lernapp` importiert transitiv `sharp`.
- **Entscheidung (Orchestrator bzw. Recht, Website-Funktionen „Medien“ und „Rezitation“, ADR 0007/0020):** In ENTSCHEIDUNGEN
  entweder eine AUSNAHME festhalten – serverseitig, als eigene Bibliothek dynamisch geladen, keine Weitergabe an Nutzer – oder
  sharp ersetzen. Den Website-Eintrag „sharp“ in `/quellen` um libvips ergänzen.
- **Prüfen:** Inhaltsliste der Bau-Ausgabe (`.nft.json` der Funktionen) nach `sharp-libvips` durchsuchen, im Bau des
  Orchestrators.

---

## Z-L20 · Herkunft der Stimmen

**Schwelle (kurz):** Jeder Clip hat eine Stimme aus der freigegebenen Liste oder `mensch:<id>` mit Vereinbarung. 0 Clips aus
ausgeschlossenen Stimmen. Die Kette je Stimme (Daten, Basismodell, Gewichte, Commit bzw. SHA) ist dokumentiert. Synthetische
Stimmen sind als „Sprachausgabe“ gekennzeichnet. Für Chatterbox: Wasserzeichen offengelegt, kein Klonen ohne Einwilligung.
Aufnahmen für Training nur mit Einwilligung.

**Status: teilweise.** Register, Kette, Kennzeichnung und Sperren sind vollständig. Live hängen aber Clips mit der Stimme
`test:ton` an echten Einheiten (wie L15-1).

**Belege**

- **Register:** `src/lib/lernapp/audio/stimmen.ts:40-63` enthält genau eine freigegebene Stimme, `THORSTEN`, mit
  `art: 'sprachausgabe'`. Die Kennung ist `tts:coqui-vits-thorsten-onnx@d09293d41bc9427e`.
- **Kette:** Daten CC0 (`Thorsten-Voice/TV-44kHz-Full`), Gewichte `Thorsten-Voice/VITS@54f782a5…` mit SHA-256 `ebb3792e…`,
  ONNX-Export `d09293d4…`, Engine. Belegt in `stimmen.ts:40-57` und in `_lernapp/werkzeuge/tts/LIESMICH.md` §2 (Tabelle mit
  Trainingsdaten, Gewichten, Export, Tokenizer, Erzeugung, Nachbearbeitung und Prüfkette, jeweils mit Lizenz). Live genannt auf
  `/lern-app/*/quellen` und `/quellen` (Z-L17).
- **Kennzeichnung:** Abschnitt „Sprachausgabe (synthetische Stimme)“ in der App und „Sprachausgabe der Lern-App“ auf der
  Website. Im Paket trägt jeder Eintrag das Feld `stimme`.
- **Sperren:**
  - Prüfer lizenz: `AUSGESCHLOSSENE_STIMMEN` (`lizenz.ts:47-48`: lessac, ryan, mms-tts, xtts, artst, kikiri, Thorsten-Piper
    low/medium/high, kerstin, karlsson, pavoque, dfki, fahrettin, fettah, kareem u. a.).
  - Prüfer audio: Je Sprache ist nur die freigegebene Sprachausgabe erlaubt, `test:` im Manifest blockiert
    (`audio.ts:6-40`).
  - Integration `lernapp-audio`: Ein Manifest mit Testton-Stimme wird abgelehnt (grün, B3).
  - Im Repository gibt es 0 Audio-Manifeste, also auch 0 Clips aus ausgeschlossenen Stimmen.
- **Chatterbox** ist nicht eingesetzt (L3-E10a); die Pflicht, ein Wasserzeichen offenzulegen, entfällt. Für Thorsten steht live
  „Wasserzeichen: keines“.
- **Aufnahmen:** Das Audio-Studio verlangt eine hinterlegte Sprecher-Vereinbarung (PDF) und führt Training (B1) und Klonen (B2)
  getrennt (`lernapp-audio.ts:18-27`). Menschliche Aufnahmen gibt es bisher keine, also keine `mensch:`-Clips.
- **Unit-Tests:** `audio-kette` (Abschnitt „Stimmen, Aussprache und Namensnennung“) und `audio-hochladen` sind grün (B1).

**Lücken**

1. Live gehen Clips mit der Stimme `test:ton` aus, die nicht in der freigegebenen Liste steht: 56 Aufgaben in 33 echten
   Einheiten (Z-L15, L15-1). Die Herkunft ist unkritisch (eigene synthetische Töne aus `scripts/lernapp/testaudio.ts`), verletzt
   aber die Regel „jeder Clip mit freigegebener Stimme oder `mensch:<id>`“.

**Hinweis:** An der einzelnen Übung (am Knopf „Anhören“) steht keine Kennzeichnung „Sprachausgabe“. Solange live 0 Clips der
Sprachausgabe laufen, ist das keine Lücke. Mit dem ersten de-Clip wäre ein kleiner Zusatz am Abspieler sinnvoll.

**Nacharbeit**

- Wie Z-L15, Paket „Testkurs von echten Inhalten trennen“.
- Nur Mensch: Sprecher-Vereinbarung und Aufnahmen (LM-26, D-L11).

---

## Z-L21 · Qualität der Stimmen (ohne religiösen Teil)

**Schwelle (kurz):** Jede eingesetzte Stimme hat Hörprobe und Verständlichkeitstest bestanden (S3, Hörabnahme LM-06). Für
Arabisch zusätzlich: Vokalisierungstest bestanden und Audio-Stichprobe von 20 % ohne kritischen Befund.

**Status: AUSNAHME.**
- **Grund:** Keine Stimme ist eingesetzt – live laufen 0 Clips der Sprachausgabe, und es gibt kein Manifest.
  - **de (Thorsten):** Die objektiven Tests sind bestanden. Nach S3 liegen 36 von 40 Sätzen bei ≥ 0,75 und 40 von 40 bei ≥ 0,6,
    die Wortfehlerquote beträgt 8,5–9,8 % (ADR 0045 Fortschreibung Nr. 1, `belege/S3-stimmen.md:414`). Die Hörabnahme LM-06 ist
    offen; deshalb gilt der Standard „Audio folgt“ (`MENSCHEN.md:19`).
  - **ar:** Chatterbox hat den Vokalisierungstest nicht bestanden (Median 1,07 bei geforderten 1,2; ADR 0045 Fortschreibung Nr. 3).
    Folgerichtig gibt es keine arabische Stimme.
  - **tr:** keine Stimme (LM-24).
  - Die Audio-Stichprobe von 20 % entfällt mangels Audio.
- **Ersatz:** „Audio folgt“, Beleg in Z-L15 – mit der Einschränkung L15-1 (Testtöne live).

**Belege:** `stimmen.ts:59-60`, `belege/S3-stimmen.md` §3 und §5, `berichte/l3-05-sprachausgabe.md` (Ehrlichkeitsvermerk: „Kein
Mensch hat die Clips gehört“).

**Religiöser Teil:** Den prüft die Gruppe „religion“; hier **nicht geprüft**. Randnotiz: `pakete.ts:266-267` filtert
`religionsbezug` vor der Zuordnung der Clips. Das gilt auch für die Testtöne.

**Lücken:** keine im Lauf. Die menschlichen Prüfungen sind offen.

**Nacharbeit:** nur Mensch: LM-06 (Hörabnahme de), LM-25/LM-26 (ar), LM-24/LM-26 (tr).

---

## Z-L22 · Versionen und Modelle

**Schwelle (kurz):** Alle neuen Abhängigkeiten sind exakt gepinnt, und jede Version war bei Aufnahme ≥ 14 Tage alt (L0-E10;
Ausnahme L3-E14). Der Dev-Build von onnxruntime-web ist im Lockfile fixiert. Whisper `Xenova/whisper-base` q8, Commit `64da572`,
SHA-256 in QUELLE.md, vom eigenen Ursprung, `allowRemoteModels = false`.

**Status: erfüllt.**

**Belege**

- **Neue Abhängigkeiten** (`git diff f2dc1a1..6bb7b6d6 -- web/package.json`): alle exakt gepinnt, keine mit `^` oder `~`.
  Aufnahme laut `git log -S`, Veröffentlichung laut npm-Registry:

  | Paket | Fassung | aufgenommen | veröffentlicht | Alter bei Aufnahme | Lizenz |
  |---|---|---|---|---|---|
  | `@huggingface/transformers` | 4.3.0 | aae44c19, 20.10. | 16.09.2026 | 34 Tage | Apache-2.0 |
  | `ts-fsrs` | 5.4.2 | 8ba44d9c, 16.10. | 01.09.2026 | 45 Tage | MIT |
  | `fastest-levenshtein` | 1.0.16 | 8ba44d9c, 16.10. | 02.08.2022 | 1.536 Tage | MIT |
  | `idb` | 8.0.3 | 8ba44d9c, 16.10. | 07.05.2025 | 527 Tage | ISC |
  | `@fontsource/noto-sans-arabic` | 5.3.0 | 8ba44d9c, 16.10. | 19.07.2026 | 89 Tage | OFL-1.1 |
  | `fast-check` (dev) | 4.10.2 | 8ba44d9c, 16.10. | 19.09.2026 | 27 Tage | MIT |
  | `fake-indexeddb` (dev) | 6.2.5 | 1bff4d9e, 16.10. | 07.11.2025 | 343 Tage | Apache-2.0 |
  | `altcha-lib` (vorher `^2.6.0`, jetzt exakt) | 2.6.0 | 65c0ea73, 21.10. | 05.10.2026 | 16 Tage | MIT |
  | `next`, `@next/bundle-analyzer`, `eslint-config-next` | 16.4.2 | 93b9fe9d, 23.10. | 15.10.2026 | 8 Tage – **Ausnahme L3-E14** (Sicherheits-Patch 16.4.0 → 16.4.2) | MIT |
  | transitiv: `onnxruntime-web` | 1.31.0-dev.20260914-8d85527a0 | 20.10. | 14.09.2026 | 36 Tage | MIT |
  | transitiv: `@huggingface/tokenizers` / `@huggingface/jinja` | 0.2.0 / 0.5.10 | 20.10. | 07.09. / 04.09.2026 | 43 / 46 Tage | Apache-2.0 / MIT |

- **ORT im Lockfile:** `web/pnpm-lock.yaml:6070` führt `onnxruntime-web@1.31.0-dev.20260914-8d85527a0` mit der Integrität
  `sha512-Iy7rtado…`. transformers 4.3.0 verlangt genau diese Fassung (laut Registry). `onnxruntime-node` ist per Override
  entfernt (`pnpm-workspace.yaml`, Lockfile Z. 166).
- **Python-Werkzeuge:** `_lernapp/werkzeuge/tts/requirements.txt` ist mit `--exclude-newer 2026-10-07` kompiliert und hat 297
  Hashes.
- **Whisper:**
  - `web/daten/lernapp-modelle/QUELLE.md` nennt Commit `64da57285918e20ea79ea5c88eed7197933abaa8`, q8 (Encoder und Decoder
    quantisiert) und die SHA-256 jeder Datei. Selbst nachgerechnet (B5): **11 von 11 gleich**.
  - Live vom eigenen Ursprung:

    | Datei | Abgleich |
    |---|---|
    | `config.json` | SHA `d1d347fd…` = QUELLE.md |
    | Encoder | 23.200.850 Byte |
    | Decoder | 53.707.539 Byte |
    | `tokenizer.json` | 2.480.466 Byte |
    | ORT `.mjs` | SHA `c57ca563…` = QUELLE.md |
    | ORT `.wasm` | 14.264.838 Byte |

    Die Größen stammen aus `Content-Length` und stimmen mit QUELLE.md überein.
- **`allowRemoteModels = false`:**
  - `src/lib/lernapp/sprechen/modell.ts:67-74` setzt `allowRemoteModels: false`, `allowLocalModels: true` und `localModelPath`
    `/lern-app/modelle/`.
  - `whisper.worker.ts:40-42` übernimmt diese Werte per `Object.assign(env, …)` und setzt `wasmPaths` auf den eigenen Ursprung.
  - Im Live-Worker steht `allowRemoteModels: !1` (der gesetzte Wert; `!0` ist die Vorgabe der Bibliothek).

**Hinweise:** Website-Abhängigkeiten mit `^` (z. B. `zod`, `sharp`) stammen aus dem Vorlauf; das Lockfile hält ihre Fassung fest.
Sie fallen nicht unter „neu“. `pnpm lernapp:modelle` lief nicht (Grund in §0); B5 ist gleichwertig für die SHA-Prüfung.

**Lücken:** keine.

**Nacharbeit:** keine.

---

## Querbezüge für den Orchestrator

- **Hoch, betrifft auch Z-L01 und Z-L16:** Live ist A1 e01 in allen drei Zielsprachen die Testeinheit des Testkurses. Die echte
  e01 fehlt, und Testtöne hängen an echten Einheiten (L15-1).
- **Mittel:** libvips (LGPL-3.0-or-later) in Funktionen, darunter die Lern-App-Action `lernapp-audio.ts` (L19-1).
- **Klein:** Die ThirdPartyNotices von ORT sind nicht offline verfügbar (Z-L17).

## Übersicht

| Z | Status | Beleg kurz |
|---|---|---|
| Z-L15 | teilweise | 0 Sprachausgabe-Clips; „Audio folgt“ ohne Sackgasse im Code und per Unit belegt; Probelauf: LUFS −23,8 bis −22,3, Rückerkennung 689/826 ≥ 0,75. **Aber live:** Testtöne (`test:ton`) in 56 Aufgaben aus 33 echten Einheiten, Testeinheit ersetzt e01 (Ursache `bau-datenbank.mjs:18`, `lernapp-test.ts:172`, `pakete.ts:266`) |
| Z-L17 | teilweise | `/quellen` und `/lern-app/{de,tr,ar}/quellen` live vollständig; Pakete mit Namensnennung je Eintrag (Tatoeba 367/367, Wiktionary 1.314/1.314), CC BY-SA 4.0, frei abrufbar; Unit `quellen` grün. Lücke: ThirdPartyNotices von ORT nicht offline |
| Z-L18 | erfüllt | `lernapp:pruefen` ausschluss/lizenz 0/0/0; kaikki 0 `examples`/`ref`; 0 Tatoeba-Audio; OpenITI-Marken nur als synthetische Proben im lokalen Werkzeug; Shamela nur in OpenITI-URIs als Fundstelle (ADR 0045 Nr. 12); 46 Live-Pakete ohne Treffer |
| Z-L19 | teilweise | Client-Lizenzregel grün, Worker und `web/public` ohne GPL, 0 Sprachausgabe in Browser, Bau oder Funktion, kein LanguageTool. Lücke: `sharp`/libvips (LGPL-3.0) in Funktionen, auch `server/actions/lernapp-audio.ts:13` |
| Z-L20 | teilweise | 1 Stimme mit vollständiger Kette (`stimmen.ts`, LIESMICH §2, live); Sperrlisten in den Prüfern; Vereinbarung im Audio-Studio. Lücke: live Clips mit `test:ton` an echten Einheiten |
| Z-L21 | AUSNAHME | Keine Stimme eingesetzt: de wartet auf LM-06 (objektiv bestanden), ar hat den Vokalisierungstest nicht bestanden, tr ohne Stimme. Ersatz „Audio folgt“; religiöser Teil: Gruppe religion |
| Z-L22 | erfüllt | Alle neuen Abhängigkeiten exakt und ≥ 14 Tage alt, außer Next 16.4.2 (L3-E14); ORT-Dev-Build im Lockfile mit Integrität; Whisper 64da572 q8, 11/11 SHA gleich, live vom eigenen Ursprung; `allowRemoteModels: false` |
