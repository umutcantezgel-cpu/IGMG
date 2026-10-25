# Stufe C – Gegenprüfung Gruppe „Lizenzen, Audio, Stimmen, Werkzeuge, Versionen“ (L8-05)

| | |
|---|---|
| Datum | 25.10.2026, 19:35–20:05 UTC |
| Stand | `6bb7b6d6` (Haupt-Checkout `/home/user/IGMG`; danach nur `0c90f09a`, reine PRÜFPUNKT-Änderung) |
| Gegenstand | `_lernapp/protokolle/C-lizenzen.md` (Erstprüfer) |
| Kriterien | Z-L15, Z-L17, Z-L18, Z-L19, Z-L20, Z-L21 (ohne religiösen Audio-Teil), Z-L22 |
| Umfang | Sprachkurse A1–B1 in 6 Richtungen (L3-E16) |
| Schrift | Keine arabische Schrift in dieser Datei; arabische Inhalte nur über Schlüssel oder Umschrift |

## 0. Eigene Läufe (alle selbst ausgeführt)

Umgebung: Node 24.21.0 aus dem Scratchpad, `TMPDIR=…/scratchpad/tclg` (kurzer Pfad, damit der `tsx`-Socket unter 108 Zeichen
bleibt).

| # | Befehl bzw. Abruf | Ergebnis |
|---|---|---|
| G1 | `pnpm vitest run` `lernapp/quellen`, `lernapp/bundle-regeln`, `lernapp/audio-kette`, `lernapp/tatoeba-ausschluss`, `lernapp/namensnennung` | 5 Dateien, **198/198 grün** |
| G2 | `pnpm test:integration` `lernapp-audio`, `lernapp-pakete` | 2 Dateien, **20/20 grün** (25,7 s) |
| G3 | `pnpm lernapp:pruefen` | rc 0, 49,1 s: **414 Dateien, 129.322 Einträge, 0 blockierend**, 15 menschlich_klaeren, 960 Warnungen; lizenz 0/0/0, ausschluss 0/0/0, audio 0/0/0; „Quelle und Lizenz je Eintrag: 100 %“ |
| G4 | Live-GET: 8 Kursverzeichnisse, **alle 222 Einheitenpakete der 6 Richtungen** (Erstprüfer: 46), 3 Audio-Bündel, 4 Quellenseiten, Start-HTML und CSS, Worker, **alle 11 Modell-, ORT- und Lizenzdateien vollständig heruntergeladen** | Einzelwerte unten |
| G5 | SHA-256 und Größe der 11 Dateien aus `web/daten/lernapp-modelle/QUELLE.md`: lokal und live | **lokal 11/11 gleich, live 11/11 gleich** (volle SHA-256, auch Encoder 23.200.850 B und Decoder 53.707.539 B) |
| G6 | npm-Registry: Veröffentlichungsdaten der direkten **und aller 39 im Lauf neu ins Lockfile gekommenen Pakete** (`f2dc1a1` → `6bb7b6d6`); `git log -S` für das Aufnahmedatum | Tabelle in Z-L22 |
| G7 | Lizenz-Scan **aller** installierten Pakete (`node_modules/.pnpm`, auch dev und optionale) sowie `pnpm licenses list --prod` | einziges GPL/LGPL-Paket: `@img/sharp-libvips-linux-x64@1.3.4` (LGPL-3.0-or-later); `pnpm licenses list --prod` übersieht es (436 Pakete, 0 LGPL) |
| G8 | Probelauf nachgerechnet aus `scratchpad/l3/tts/probelauf/a1/pruefung.json` und `pruefung-gesamt.json` | 1.319 Clips, LUFS −23,80 bis −22,26, 0 außerhalb ±1 LU; Treffer 826: 689 ≥ 0,75, 66 zwischen 0,6 und 0,75, 71 < 0,6; gesamt 1.223 ok, 96 hören – **gleich dem Erstprüfer** |
| G9 | grep/`git grep` über Repository, `web/daten`, `web/inhalte/lernapp`, `web/public`, `_lernapp/werkzeuge` | Einzelwerte unten |

**Nicht geprüft** (laut Briefing nicht erlaubt): Bau, E2E, Serverstart. Damit bleiben die Inhaltsliste der Bau-Ausgabe
(`.nft.json` der Funktionen) und das echte Offline-Verhalten der Quellenseite **nicht geprüft**. Vercel-MCP habe ich bewusst
nicht genutzt (nicht in der erlaubten Werkzeugliste).

---

## Z-L15 · Audio — Urteil: **bestätigt, teilweise**

**Selbst reproduziert**

- `web/src/lib/lernapp/audio/stimmen.ts:60`: `STIMMEN = { de: THORSTEN, tr: null, ar: null }`. Kein Audio-Manifest im
  Repository (`git ls-files`: nur `inhalte/lernapp/schemas/audio-manifest.schema.json` und `scripts/lernapp/audio-manifest.ts`;
  einzige Audiodateien sind die drei Testbündel).
- „Audio folgt“ ohne Sackgasse: `Abspieler.tsx:42` (`ohne_audio`), `:63-75` (nur Hinweis und Knopf), `Spieler.tsx:303-305`
  (`nurWeiter`). Live in den drei Richtungen `de-aus-tr`, `tr-aus-de`, `ar-aus-de`: **1.824 Hörübungen** (`hoeren_waehlen`,
  `minimalpaare`, `hoeren_schreiben`) ohne Clip, also mit „Audio folgt“.
- Testbündel live = Seed: `curl` der drei Bündel, SHA-256 `d57ee53f…`, `99d09029…`, `b676a0fe…` byte-gleich mit
  `web/drizzle/seeds/lernapp-testaudio/*/`.
- Ursache bestätigt: `scripts/bau-datenbank.mjs:18-19` (Testkurs bei `VERCEL=1`), `drizzle/seeds/lernapp-test.ts:172`
  (`einheitVon = kurs => \`${kurs}.a1.e01\``), `src/server/queries/lernapp/pakete.ts:266-318` (Clip je Text-Hash, ohne Blick
  auf die Quelle des Eintrags).
- Live ist `*.a1.e01` in allen 6 Richtungen „Testeinheit: Alltag“ (de 16.054 B, tr 15.931 B, ar 18.325 B), obwohl im
  Repository die echte `de.a1.e01` („Hallo, wer bist du? – Begrüßung und Vorstellung“, 40 Lemmata, 195 Sätze,
  `automatisch_geprueft`) liegt; ebenso `tr.a1.e01` und `ar.a1.e01`.

**Korrektur der Zahlen des Erstprüfers** (eigene Auswertung aller 222 Pakete; e01 ausgenommen):

| Zielsprache | Einheiten mit `test:ton`-Einträgen | davon mit Aufgaben, die einen Testton abspielen | Aufgaben mit Testton | davon Hörübungen |
|---|---|---|---|---|
| de (je Richtung) | 14 | 8 | 24 | 0 |
| tr (je Richtung) | 10 | 8 | 15 | 2 |
| ar (je Richtung) | 9 | 5 | 17 | 2 |
| **Summe je Richtungssatz** | **33** | **21** | **56** | **4** |

Die „33 Einheiten“ des Erstprüfers zählen also Einheiten mit Testton-**Einträgen**; Aufgaben mit Testton haben 21 davon. Über
alle 6 Richtungen sind es 112 Aufgaben in 42 Paketen. Die 4 Hörübungen (je Richtungssatz) sind `ar.a1.e02` l01 a13
(`hoeren_waehlen`), `ar.a1.e07` l05 a07 (`minimalpaare`), `tr.a1.e06` l02 a15 (`hoeren_waehlen`, Lösung „Su içiyorum.“, Ton
608 ms) und `tr.a1.e06` l02 a14 (`minimalpaare` „su“/„şu“, Ton 708 ms). Hier ist die Übung mit dem Ohr nicht lösbar.

**Zusätzliche Belege für die Lücke**

- `MENSCHEN.md`, LM-15, Spalte „Standard ohne Antwort“: „Audio nur im Testkurs (synthetische Töne); Hörübungen ‚Audio folgt‘“.
  Live hängt Audio außerhalb des Testkurses – der festgelegte Standard ist verletzt.
- Je Richtungssatz tragen 49 echte Einträge `stimme: "test:ton"`. Ob Wortschatz oder Wiederholen diese Töne abspielen, ist
  **nicht geprüft** (E2E).

**Lücken**

1. Testtöne in 56 Aufgaben (21 echte Einheiten) je Richtungssatz, darunter 4 Hörübungen; Testeinheit ersetzt live e01 in allen
   Zielsprachen (Nebenbefund für Z-L01/Z-L16).
2. 0 % Audio für de: AUSNAHME bis LM-06 und LM-15 (nur Mensch).
3. Text `messages/lernapp/de.json:940` („Die Aufnahmen wurden vorab erzeugt und geprüft“) stimmt live nicht.

**Nacharbeit:** wie vom Erstprüfer vorgeschlagen – Paket „Testkurs von echten Inhalten trennen“ (`pakete.ts` ab Z. 266: Clips
mit `test:`-Stimme nur für Einträge mit `quelle` `test:…`; `lernapp-test.ts:172` kollisionsfreier Schlüssel oder kein Testkurs im
Vercel-Bau; Integrationstest „echter Eintrag mit gleichem Text bekommt keinen Testton, echte e01 bleibt“; Live-Nachprüfung der
8 Verzeichnisse). Klein: `messages/lernapp/{de,tr,ar}.json` Abschnitt `sprachausgabe.text`. Nur Mensch: LM-06, LM-15.

---

## Z-L17 · Lizenzverzeichnis und Namensnennung — Urteil: **bestätigt, teilweise**

**Selbst reproduziert**

- Live 200: `/lern-app/de|tr|ar/quellen` (195.969 / 196.527 / 202.818 B), `/quellen` (351.600 B).
- Text der drei Lern-App-Quellenseiten je gleich: OFL-Volltext 1×, MIT-Volltext 3×, Apache-Volltext 3×, ISC-Volltext 1×,
  Tatoeba 5×, kaikki 3×, „gekürzt und umformatiert“ 1×, ThirdPartyNotices 2×, Thorsten 8×, `TV-44kHz` 1×, `64da572` 1×.
  Abschnitt Drittlizenzen: „Zum Öffnen brauchst du eine Verbindung“ (`messages/lernapp/de.json:1053`).
- Bibliotheken auf der Seite (12): Next.js 16.4.2, React 19.3.0, Lucide 1.55.0, idb 8.0.3, ts-fsrs 5.4.2,
  fastest-levenshtein 1.0.16, Zod 4.6.5, Altcha, Transformers.js 4.3.0, Tokenizers.js 0.2.0, jinja 0.5.10, ONNX Runtime Web.
  Gegenprobe der Drittimporte in `src/components/lernapp`, `src/app/lern-app`, `src/lib/lernapp`: react, lucide-react, next,
  zod, react-dom, altcha-lib, @huggingface/transformers, ts-fsrs, idb, fastest-levenshtein sind gelistet; `drizzle-orm` und
  `next-intl` nur serverseitig (`texte.ts:1` `server-only`). Keine Lücke.
- Schriften live: CSS-Chunks der Lern-App laden genau Amiri, Atkinson Hyperlegible Next, „IGMG Wetzlar Titel“ (Source Serif 4)
  und Noto Sans Arabic – alle vier mit OFL im Verzeichnis.
- **Alle 222 Live-Pakete:** Kopf `lizenz: CC-BY-SA-4.0` 222/222; 101.791 Einträge, 0 ohne `quelle`, 0 ohne `lizenz`; Lizenzen
  nur `CC-BY-SA-4.0` (100.293) und `CC-BY-2.0-FR` (1.498); Quellen `ki` 91.507, `wiktionary` 8.614, `tatoeba` 1.498, `test` 172.
  Tatoeba **1.498/1.498** mit Satz-ID und Benutzer in `namensnennung`; 622 davon nur in der Kurzform „Satz #id von benutzer“ –
  `src/lib/lernapp/namensnennung.ts:65-67` ergänzt Lizenz und Link aus `quelle`/`lizenz` auf dem Gerät (Unit grün). Wiktionary
  **8.614/8.614** mit Artikel-Link und „gekürzt und umformatiert“. Freier GET ohne Konto, JSON ohne Verschlüsselung.
- `public/lern-app/sw.js:29` hält `/quellen` je Oberfläche vor; `sw.js:14-16`: die Lizenztexte neben den Gewichten und die
  ThirdPartyNotices gehören nicht zum Vorrat. `web/daten/lernapp-lizenzen/QUELLE.md` legt das bewusst so fest.

**Lücken (bestätigt)**

1. ThirdPartyNotices von ONNX Runtime nicht offline, obwohl das ORT-`.wasm` nach dem Laden offline auf dem Gerät liegt; die
   Schwelle zählt „onnxruntime-web mit ThirdPartyNotices“ zu „offline im Paket“.
2. Die live ausgelieferten Testtöne (`test:ton`, Audio) stehen nicht im Verzeichnis (entfällt mit dem Paket aus Z-L15).

**Hinweise (keine Lücke der Lern-App)**

- Website-`/quellen` enthält keinen OFL-Volltext (nur die Lern-App-Seiten) und nennt `sharp` nur als Apache-2.0. Die laut
  M-060 vorgesehene `LIZENZEN.md` gibt es im Repository nicht (`git ls-files`: 0). Beides gehört zum abgeschlossenen Lauf
  „Gemeinde-Plattform“.
- Bildkarten (Lucide, ISC) werden als Code im JS-Bündel ausgeliefert; ISC ist als Code-Lizenz zulässig. In den Paketen steht
  keine `ISC`-Lizenz.

**Nacharbeit:** wie Erstprüfer (`src/lib/lernapp/sprechen/vorrat.ts:89` `fuelleVorrat` bzw. `modell.ts` um
`/lern-app/lizenzen/onnxruntime-ThirdPartyNotices.txt` erweitern, Text `drittlizenzenText` anpassen, Units `quellen` und
`sprechen-einmal-laden` erweitern); Testtöne mit dem Paket aus Z-L15.

---

## Z-L18 · Ausschlüsse — Urteil: **bestätigt, erfüllt**

**Selbst reproduziert**

- G3: ausschluss 0/0/0, lizenz 0/0/0.
- kaikki-Auszüge: ar 15.630, de 42.136, tr 22.361 Zeilen; je 0× `"examples"`, 0× `"ref"`, 0× `"ex"`.
- Tatoeba: 0 Audiodateien im Repository außer den 3 Testbündeln; in den Inhalten 1.467 Tatoeba-Einträge (de 790, tr 647,
  Übersetzungen 30), **kein** arabischer Tatoeba-Satz.
- 222 Live-Pakete: 0 Treffer für OpenITI, Shamela, corpus.quran, Quranic Arabic Corpus, SUBTLEX, DeReWo, KELLY,
  OpenSubtitles, `"ref"`, `"examples"`, `######`, `#META#`, `PageV…`. Verzeichnisse `islam` und `koran` live leer (148 B).
- Shamela in `web/inhalte`: **947 Treffer, alle im Feld `fundstelle`** (OpenITI-Version-URI mit Meilenstein, z. B.
  `0683…IkhtiyarLiTaclil.Shamela0001066-ara1#ms110`); nach ADR 0045 Nr. 12, zweiter Punkt („OpenITI-URI als Fundstelle“)
  zulässig.
- `web/daten/hanafi-quellen/` enthält nur `QUELLE.md` (Metadaten). CAMeL-Morphologiedaten (GPL v2) nur lokal
  (`_lernapp/werkzeuge/wurzeln/LIESMICH.md`; im Repository 0 Dateien außer der CC-BY-SA-Häufigkeitsliste
  `web/daten/haeufigkeit/camel-msa-1.0_top50k.tsv`).
- `tajwid`-Daten der Website stammen von `cpfair/quran-tajweed` (Tanzil-basiert, CC BY 4.0), nicht vom Quranic Arabic Corpus.

**Versuchte Widerlegungen, die nicht tragen**

- OpenITI-Marken stehen wörtlich im Repository: `_lernapp/werkzeuge/quellen/openiti-passagen.mjs:310` (`'#META#Header#End#'`)
  und synthetische Proben in `openiti-passagen.test.mjs:41,45,222,254,264,273`. Das ist Parser-Syntax eines lokalen Werkzeugs
  ohne Werktext; ADR 0045 Nr. 12 verbietet Markup „in Inhalten“. Wörtlich genommen („0 … OpenITI-Markierungen im Repository“)
  ist es ein Grenzfall – Hinweis, keine Lücke. Optional: die Marken im Test wie in `pruefer/ausschluss.ts:16` zerlegen.
- `web/daten/tanzil-uebersetzungen` (Tanzil-Bedingungen „non-commercial purposes only“, Verlagsübersetzungen Bubenheim,
  Diyanet, Saheeh) liegt im Repository und geht über `scripts/inhalte-import.ts` in die Bau-Datenbank. Die Lern-App nutzt sie
  nicht (`quranUebersetzung` nur in Website-Abfragen `religioese-verweise.ts`, `anzeige.ts`, `des-tages.ts`). Der Ausschluss
  „Verlagsübersetzungen“ steht in `_lernapp/KERN.md:93` und `PLAN.md:637` im Kontext der hanefitischen Quellen. Website-Daten
  aus dem abgeschlossenen Lauf mit eigener Menschen-Entscheidung (MN-02) – Hinweis für den Orchestrator, keine Lücke der
  Lern-App.

**Nacharbeit:** keine. Optional: in ABNAHME den Beleg „Unit lizenzen“ durch die tatsächlichen Tests ersetzen und den
Geltungsbereich („Lern-App-Inhalte, `web/daten` der Lern-App, Pakete“) ausdrücklich nennen.

---

## Z-L19 · Werkzeuge nur lokal — Urteil: **bestätigt, teilweise** (mit Korrektur der Nacharbeit)

**Selbst reproduziert**

- Unit `lernapp/bundle-regeln` grün (G1). Live-Worker 691.884 B: Lizenzkopf, 0× GNU/LGPL/GPL-.
- `web/public`: 27 versionierte Dateien plus erzeugte ORT- und Worker-Dateien; GPL-Text nur in
  `lern-app/lizenzen/onnxruntime-ThirdPartyNotices.txt` (Lizenztexte, kein Code).
- 0 Treffer für `speechSynthesis`/`SpeechSynthesisUtterance` in `src`, `scripts`, `public`; `scripts/vercel-bau.mjs:15-33`
  ruft nur `lernapp-modelle.mjs`, Migration, Importe, `next build`, `db:bau-vorbereiten`, Suchindex – keine Sprachausgabe.
  LanguageTool: 0 Treffer außerhalb von `.md`.
- G7: einziges GPL/LGPL-Paket in ganz `node_modules`: `@img/sharp-libvips-linux-x64@1.3.4` (LGPL-3.0-or-later); `sharp@0.35.5`
  kommt über `package.json:85` (`^0.35.5`) und zusätzlich über `@huggingface/transformers@4.3.0` (`pnpm-lock.yaml:8554-8559`).
- Statischer Import `src/lib/medien/verarbeiten.ts:3` (`import sharp from 'sharp'`), genutzt von
  `src/server/actions/lernapp-audio.ts:13` (Audio-Studio der Lern-App, nur für die PDF-Prüfung der Sprecher-Vereinbarung),
  `medien.ts`, `rezitationen.ts` und `verwaltung/(geschuetzt)/medien/page.tsx` (Website). `next.config.ts` schließt `sharp`
  nicht aus (`serverExternalPackages` nur pglite).
- `web/docs/adr/0042-…:35` (Nr. 10): „`sharp` und `onnxruntime-node` gelangen nie in Client-Bündel oder Funktionen“ – die
  Lern-App-Action verstößt also auch gegen die eigene ADR.

**Korrektur:** Für die **Website-Funktionen** gibt es bereits eine Menschen-Entscheidung: `_lauf/MENSCHEN.md:93` M-060
(„sharp/libvips-Binärpakete (LGPL-3.0) … Einverstanden? – **Ja**, mit Begründung in ADR 0001“), `web/docs/adr/0001-versionen.md:68`
und `0007-medienspeicher.md:34`. Die vom Erstprüfer verlangte neue Entscheidung ist für die Website nicht nötig; es genügt ein
Verweis (AUSNAHME „Website, M-060“). Lücke bleibt nur die **Lern-App-Funktion**.

**Lücken**

1. libvips (LGPL-3.0-or-later) wird über `lernapp-audio.ts:13` in eine Funktion der Lern-App-Verwaltung gezogen.
2. Kein Regeltest deckt Funktionen ab (die Client-Regel prüft nur den Client-Graphen); `pnpm licenses list --prod` übersieht
   optionale Plattformpakete wie libvips.
3. Bau-Ausgabe (`.nft.json`) nicht geprüft.

**Nacharbeit:** Klein: `erkenneTyp` und den PDF-Zweig aus `verarbeiten.ts` in ein Modul ohne `sharp` (z. B.
`src/lib/medien/typ.ts`), `lernapp-audio.ts` darauf umstellen; in `tests/unit/lernapp/bundle-regeln.test.ts` Regel „kein Modul
unter `server/actions/lernapp*`, `app/lern-app`, `lib/lernapp`, `server/queries/lernapp` importiert transitiv `sharp`“. In
ABNAHME/ENTSCHEIDUNGEN für die Website auf M-060 verweisen. Im Bau des Orchestrators die `.nft.json` der Lern-App-Funktionen nach
`sharp-libvips` durchsuchen.

---

## Z-L20 · Herkunft der Stimmen — Urteil: **bestätigt, teilweise**

**Selbst reproduziert**

- `stimmen.ts:40-57`: THORSTEN mit Daten-Adresse `Thorsten-Voice/TV-44kHz-Full` (CC0-1.0), Modell `Thorsten-Voice/VITS@54f782a5…`
  (Apache-2.0), SHA-256 `ebb3792e…`, ONNX `d09293d4…`, `wasserzeichen: false`. `_lernapp/werkzeuge/tts/LIESMICH.md` §2
  „Herkunftskette der deutschen Stimme“ (6 Treffer für Commit, SHAs und Datensatz).
- `pruefer/audio.ts:10-40`: Sprachausgabe nur mit der freigegebenen Stimme, `test` im Manifest blockierend. G2 grün.
- Audio-Studio: `lernapp-audio.ts:104-117` speichert `kiSyntheseErlaubt` (B1) und `klonenErlaubt` (B2) getrennt, `:140-143`
  verlangt eine hinterlegte Vereinbarung.
- Live: alle 158 Einträge mit `stimme` in den 222 Paketen tragen `test:ton` – 0 Clips aus ausgeschlossenen Stimmen, 0
  Sprachausgabe, 0 `mensch:`.

**Verschärfung der Lücke:** Die Schwelle prüft „jeden Clip im Audio-Manifest“. Die Testtöne kommen **am Manifest vorbei**
(Seed → Datenbank → Paket); der Prüfer `audio.ts` sieht sie deshalb nie. Gerade die Kontrolle, die Z-L20 tragen soll, greift für
die live ausgelieferten Clips nicht.

**Lücke:** live Clips mit der nicht freigegebenen Stimme `test:ton` an echten Einheiten (Zahlen in Z-L15).

**Nacharbeit:** Paket aus Z-L15; zusätzlich im Integrationstest: Paketbau liefert für Einträge ohne `test:`-Quelle nur Clips mit
Stimme aus `ALLE_STIMMEN` oder `mensch:`. Nur Mensch: LM-26 (Aufnahmen, Vereinbarung).

---

## Z-L21 · Qualität der Stimmen (ohne religiösen Teil) — Urteil: **herabgestuft: AUSNAHME → teilweise**

**Was stimmt:** Keine Sprachausgabe ist eingesetzt (0 Clips, kein Manifest). de Thorsten hat die objektiven Tests bestanden
(`belege/S3-stimmen.md:259`: ONNX WER 9,8 %, mild 8,5 %, Trefferanteil 0,93; ADR 0045 Fortschreibung Nr. 1). Chatterbox ar hat
den Vokalisierungstest nicht bestanden (`S3-stimmen.md:326`: Median 1,07, nur 2 von 14 Gruppen über 1,2) und im
Verständlichkeitstest WER 44,6 % (`:286`). tr ohne Stimme. Die Hörabnahme LM-06 ist offen (`MENSCHEN.md`, Status „offen“).

**Warum keine AUSNAHME:** Eine AUSNAHME braucht einen wirksamen Ersatz. Der Ersatz „Audio folgt“ gilt live **nicht** überall:
In echten Hörübungen läuft Audio, das weder Hörprobe noch Verständlichkeitstest hat – synthetische Töne statt Sprache. Beispiele
(live, `tr-aus-de`): `tr.a1.e06` l02 a14 `minimalpaare` „su“ gegen „şu“ mit 708-ms-Ton; l02 a15 `hoeren_waehlen` „Su içiyorum.“
mit 608-ms-Ton; in ar `ar.a1.e02` l01 a13 und `ar.a1.e07` l05 a07 – ausgerechnet in der Sprache, für die der
Vokalisierungstest scheiterte. Wer die Übung mit dem Ohr lösen will, rät; die Antwort wird bewertet. Die Begründung des
Erstprüfers („keine Stimme eingesetzt“) ist damit nur für Sprachausgabe richtig, nicht für das ausgelieferte Audio.

**Zusätzlicher Hinweis:** `stimmen.ts:59-60` führt THORSTEN als „freigegeben“, obwohl LM-06 offen ist. Ein importiertes
de-Manifest würde den Prüfer `audio.ts` passieren; die Sperre bis LM-06 hängt nur daran, dass Blob (LM-15) und Manifest fehlen.

**Lücken**

1. Ungeprüftes Audio (Testtöne) in 4 echten Hörübungen je Richtungssatz und 52 weiteren „Anhören“-Stellen; Ersatz „Audio folgt“
   dort nicht wirksam.
2. Hinweis: Freigabe von THORSTEN im Code nicht an LM-06 gebunden.

**Nacharbeit:** Paket aus Z-L15 (danach ist die AUSNAHME mit Grund und Ersatz tragfähig). Klein: in `stimmen.ts` ein Feld
`hoerabnahme: 'offen' | 'bestanden'` und in `pruefer/audio.ts` Sprachausgabe nur bei `bestanden` zulassen. Nur Mensch: LM-06,
LM-24, LM-25, LM-26.

---

## Z-L22 · Versionen und Modelle — Urteil: **herabgestuft: erfüllt → teilweise**

**Selbst reproduziert (stärker als im Erstprotokoll)**

- `git diff f2dc1a1..6bb7b6d6 -- web/package.json`: alle neuen bzw. geänderten Fassungen exakt (transformers 4.3.0, ts-fsrs 5.4.2,
  fastest-levenshtein 1.0.16, idb 8.0.3, noto-sans-arabic 5.3.0, fast-check 4.10.2, fake-indexeddb 6.2.5, altcha-lib 2.6.0,
  next/bundle-analyzer/eslint-config-next 16.4.2).
- Alter bei Aufnahme (Registry `time`, Aufnahme per `git log -S`): transformers 16.09. → 20.10. (34 T.), ts-fsrs 01.09. → 16.10.
  (45), idb 07.05.2025 (527), fastest-levenshtein 02.08.2022, noto-sans-arabic 19.07. (89), fast-check 19.09. (27),
  fake-indexeddb 07.11.2025 (343), altcha-lib 05.10. → 21.10. (16), next 16.4.2 15.10. → 23.10. (8; L3-E14).
- **Alle 39 im Lauf neu ins Lockfile gekommenen Pakete** geprüft: außer der Next-Familie (16.4.2, L3-E14) alle ≥ 14 Tage, z. B.
  onnxruntime-web 14.09. (36), onnxruntime-common 11.09., protobufjs 7.6.6 27.08., pure-rand 8.4.2 10.07., `@protobufjs/*`
  ≤ 22.05.2026, flatbuffers 24.09.2025.
- ORT-Dev-Build im Lockfile mit Integrität (`pnpm-lock.yaml:6070-6071`, Snapshot `:13126`), `onnxruntime-node` per Override
  entfernt (`pnpm-workspace.yaml`, Lockfile Z. 166).
- Whisper: G5 – lokal **und live** 11/11 volle SHA-256 gleich `web/daten/lernapp-modelle/QUELLE.md` (Commit `64da572…`, q8).
  `modell.ts:68` `allowRemoteModels: false`; `whisper.worker.ts:39,42` übernimmt die Umgebung und setzt `wasmPaths` auf den
  eigenen Ursprung; im Live-Worker `Uj = { allowRemoteModels: !1, … localModelPath: "/lern-app/modelle/" }` und
  `wasmPaths = { mjs: rM(…), wasm: rM(…) }` mit `tM.location.origin`. Die Standard-Adressen der Bibliothek (`huggingface.co`,
  `cdn.jsdelivr.net/npm/onnxruntime-web`) stehen im Bündel, werden aber überschrieben.
- Python `tts`: `requirements.txt` (21 Pins, 297 Hashes) und `requirements-export.txt` (94 Pins, 2.555 Hashes), beide mit
  `--exclude-newer 2026-10-07`, eingecheckt am 21.10.2026 (`05561296`) – ≥ 14 Tage.

**Gegenbeispiel:** `_lernapp/werkzeuge/wurzeln/camel_vorschlag.py:9-10` (eingecheckt `6abd4ed1`, 21.10.2026) richtet das
Werkzeug mit `pip install --no-deps camel-tools==1.6.0` und danach **ungepinnt** `pip install cachetools six pyrsistent regex
requests tqdm docopt future dill muddler tabulate` ein. Das sind neue Abhängigkeiten des Laufs ohne Pin, Hash und Mindestreife.
Dieselbe Regel hat der Lauf beim `tts`-Werkzeug ausdrücklich angewandt (`requirements.in`: „Mindestreife 14 Tage, L0-E10“).
Es betrifft nur ein lokales Werkzeug; die Ergebnisse kommen nicht ins Repository. Nach „im Zweifel herabstufen“ trotzdem
teilweise.

**Lücke:** 10 ungepinnte Python-Abhängigkeiten des lokalen CAMeL-Werkzeugs.

**Nacharbeit (klein):** `_lernapp/werkzeuge/wurzeln/requirements.in` mit `camel-tools==1.6.0` und den 10 Paketen anlegen,
`uv pip compile --generate-hashes --exclude-newer <Aufnahmedatum − 14 T.>` nach `requirements.txt`, Docstring in
`camel_vorschlag.py:8-11` auf `uv pip install --require-hashes -r requirements.txt` (plus `--no-deps` für camel-tools) umstellen.
Alter des Modell-Commits `64da572` nicht geprüft (Schwelle verlangt Commit und SHA, beides erfüllt).

---

## Übersicht

| Z | Erstprüfer | Gegenprüfung | Kern |
|---|---|---|---|
| Z-L15 | teilweise | **teilweise (bestätigt)** | Testtöne live in 56 Aufgaben / 21 echten Einheiten je Richtungssatz (33 Einheiten mit Testton-Einträgen), 4 Hörübungen; e01 = Testeinheit; LM-15-Standard verletzt |
| Z-L17 | teilweise | **teilweise (bestätigt)** | 222 Pakete vollständig attribuiert; ORT-ThirdPartyNotices nicht offline; Testtöne nicht im Verzeichnis |
| Z-L18 | erfüllt | **erfüllt (bestätigt)** | 0/0/0, 222 Pakete ohne Treffer, Shamela nur in 947 `fundstelle`-URIs; Hinweise: Parser-Marken im lokalen Werkzeug, Website-NC-Übersetzungen außerhalb des Geltungsbereichs |
| Z-L19 | teilweise | **teilweise (bestätigt, Nacharbeit korrigiert)** | libvips über `lernapp-audio.ts:13`; Website durch M-060 gedeckt; kein Regeltest für Funktionen |
| Z-L20 | teilweise | **teilweise (bestätigt)** | `test:ton` live, am Manifest-Prüfer vorbei |
| Z-L21 | AUSNAHME | **teilweise (herabgestuft)** | Ersatz „Audio folgt“ live nicht überall wirksam; ungeprüfte Töne in echten Hörübungen |
| Z-L22 | erfüllt | **teilweise (herabgestuft)** | npm, Lockfile, Whisper voll belegt (live 11/11 SHA); CAMeL-Werkzeug installiert 10 Pakete ungepinnt |
