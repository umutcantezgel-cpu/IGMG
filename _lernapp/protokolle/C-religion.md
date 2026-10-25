# Stufe C – Protokoll Gruppe religion (Paket L8-05)

- **Datum:** 25.10.2026
- **Stand:** `6bb7b6d6` (Branch `claude/trusting-lovelace-6nfolz`, Haupt-Checkout `/home/user/IGMG`)
- **Prüfer:** Stufe C, Gruppe religion
- **Kriterien:** Z-L02, Z-L03, Z-L10 sowie aus Z-L21 der Teil „0 Audio zu `religionsbezug`, Wissenskurs und Koran-Pfad“
- **Grundlage:** `_lernapp/ABNAHME.md`, `_lernapp/KERN.md` §2–§4, Lehrplan `_lernapp/lehrplan/WISSEN.md`
- **KI-Regel 2** (ADR 0040, KERN §2) eingehalten: Dieses Protokoll enthält keine religiösen Texte, keine Übersetzungen,
  keine Bedeutungen und keine arabische Schrift; arabische Wörter nur in Umschrift.

## 0. Vorgehen und Umgebung

- Nur gelesen und geprüft; geschrieben wurde nur diese Datei. Der Arbeitsbaum `.claude/worktrees/inhalte-a1` wurde nicht
  angefasst. Eigene Hilfsskripte und Abrufe liegen im Scratchpad (`…/scratchpad/c-religion/`).
- Werkzeuge: Node 24 aus dem Scratchpad, `TMPDIR` im Scratchpad (`…/scratchpad/tmp-c-religion`). Hinweis: Mit dem langen
  Scratchpad-Pfad als `TMPDIR` scheitert `tsx` beim Anlegen seines IPC-Sockets (`listen EINVAL … .pipe`, Pfad länger als
  108 Zeichen). Deshalb zeigt der Ordner per Symlink `/tmp/c-rel` dorthin; alle `tsx`-Läufe (`lernapp:pruefen`,
  `audio-hochladen`) liefen mit `TMPDIR=/tmp/c-rel`. Der erste Unit-Lauf mit langem Pfad meldete deshalb 2 rote Fälle in
  `audio-hochladen.test.ts` (rc 1 statt 2 bzw. 0). Mit kurzem Pfad liefen sie grün (10/10). Das ist ein Umgebungsartefakt,
  kein Befund.
- Ausgeführte Prüfungen (alle auf `6bb7b6d6`):

| Befehl | Ergebnis |
|---|---|
| `pnpm vitest run` mit 13 Unit-Dateien (`freigabe-zwei`, `religion-waechter`, `religioes-zwei-pruefer`, `religion-inhalt`, `koran-pfad`, `koran-paket`, `koran-ausschnitt`, `koran-lokal`, `audio-kette`, `audio-hochladen`, `aufgaben-wissen`, `aufgaben-wissen-komponenten`, `inhalt-pruefer`) | 13/13 Dateien grün, 220 bestanden, 1 `todo` (`inhalt-pruefer.test.ts:578`, Tabu-Muster mit Tāʾ marbūṭa, nicht Religion) |
| `pnpm test:integration` mit 7 Dateien (`lernapp-religioes`, `verwaltung-wissen`, `lernapp-koran`, `verwaltung-koran`, `lernapp-pakete`, `lernapp-audio`, `lernapp-schalter`) | 7/7 grün, 88 bestanden, 0 übersprungen, 91,8 s |
| `node _gemeinde/werkzeuge/religion-pruefung.mjs` | Exit 0: „Religion-Prüfung grün: 6547 Dateien, arabische Schrift nur an erlaubten Orten; Wächter über 384 Lern-App-Dateien (Index Koran 110768, Hadith 279731 4-Gramme), 6.4 s“ |
| `pnpm lernapp:pruefen` (und `--alle-warnungen`) | Exit 0: 414 Dateien, 129.322 Einträge, **0 blockierend**, 15 menschlich_klaeren, 960 Warnungen; Prüfer `religion 0/0/0`, `religionsbezug 0/3/82`, `audio 0/0/0` |
| Eigenes Zählskript über `web/inhalte/lernapp/{islam,koran}/**` (Python, `-I`) | siehe Z-L02/Z-L03 |
| Live-GET gegen `https://igmg-wetzlarer.vercel.app` (19:15–19:25 Uhr) | 8 Kursverzeichnisse, 222 Sprachkurs-Pakete, 2 Koran-Verzeichnisse, 80 Koran-Paketadressen, 9 Kursseiten, 2 Audio-Proben; Einzelheiten unten |

## 1. Z-L02 Wissenskurs

**Schwelle (kurz):** 28 Einheiten entworfen (≥ Ziel − 5 %; laut Auftrag: bzw. alle vom Lehrplan nicht zurückgestellten);
100 % der Aussagen mit ≥ 1 Beleg (Werk, Kapitel, Ausgabe); 0 sichtbare Bausteine ohne zwei Freigaben zum aktuellen Hash
(verschiedene Prüfende; Verfasser und Administration zählen nicht); jeder sichtbare Beleg „am Original geprüft“; Lektion
nur vollständig; 0 arabische Schrift in `islam/**`; Belege von KI-Aussagen nur `sinngemaess`.

**Status: erfüllt**

**Belege**

- **Umfang:** 26 Dateien unter `web/inhalte/lernapp/islam/**`, 146 Lektionen, 2.124 Aussagen, 4.603 Belege,
  1.041 Quizfragen, 268 Verweise auf Verse und Hadithe. Das eigene Zählskript ergibt dieselben Zahlen wie
  `_lernapp/berichte/wissen-pruefuebersicht.md` §2 (dort: 203 Vers- und 65 Hadith-Verweise, zusammen 268). Alle 26 Dateien
  haben den Status `entwurf`.
- **Lehrplan:** `WISSEN.md:72–74` stellt `islam.vertiefung.e04`, `e05` und `e06` zurück (Siyar, kein Werk im Register,
  LM-04). Alle 25 nicht zurückgestellten Einheiten sind entworfen; dazu kommt `e06` (siehe Lücken). Es fehlen nur `e04`
  und `e05`: Ohne Quelle darf kein Entwurf entstehen (KERN §2.2 Nr. 5, `WISSEN.md:42` Regel 10).
  Gemessen am Ziel 28 sind 26/28 = 92,9 % entworfen. Nach der Schwelle im Auftrag (ohne die zurückgestellten) sind es 25/25.
- **Belege je Aussage:** 0 von 2.124 Aussagen ohne Beleg. 0 von 4.603 Belegen ohne `werk`, `kapitel`, `ausgabe` oder
  `passage`. Werke: `hidaya` 1.033, `ikhtiyar` 947, `nur_al_idah` 908, `quduri` 846, `radd_al_muhtar` 681,
  `tahawiyya` 101, `fiqh_akbar` 87. Keine Belege aus Marāqī al-Falāḥ oder an-Nasafiyya (beide zurückgestellt) und
  keine aus Radd al-Muḥtār ab ms6765 (Zählung: 0).
- **KI-Belege nur sinngemäß:** Alle 2.124 Aussagen und 1.041 Quizfragen haben `quelle = ki:lernapp-l6-04/…`, und alle
  4.603 Belege haben `art: sinngemaess`. Erzwungen wird das im Schema: `web/src/lib/lernapp/inhalt/schema.ts:954–955`
  (Standard `sinngemaess`) und `:1099` (`woertlich` bei `ki:`-Quelle ist ein Fehler).
- **Arabische Schrift:** 0 von 26 Dateien enthalten arabische Schrift. 0 enthalten Codepunkt-Umgehungen
  (Unicode-Escapes, HTML-Entitäten). `religion-pruefung.mjs` führt `web/inhalte/lernapp/(islam|koran)/` in `NIE` mit `codepunkte: true`
  (`_gemeinde/werkzeuge/religion-pruefung.mjs:111–116`); der Lauf ergibt 0 Befunde.
- **Zwei Freigaben (Code):** `web/src/lib/lernapp/freigabe.ts`
  - `religioeseLage` (:103–126): je Person zählt nur die jüngste Prüfung zum aktuellen Hash; „ok“ zählt nur mit der Rolle
    `religioese_pruefung`; Verfasser zählen nicht; jeder Beleg muss bestätigt sein (`alleBelegeBestaetigt` :85); ein
    Einwand sperrt; es braucht ≥ 2 Freigaben.
  - `wissenSichtbar` :189, `wissensAufgabeSichtbar` :203 (Quizfrage und alle ihre Aussagen), `lektionSichtbar` :136
    (nur ganz, leer nie).
  - `NIE_PER_ADMINISTRATION` enthält `lernapp.religioes.pruefen` (`web/src/lib/rechte/matrix.ts:137–142`; die
    Administration erhält es nicht, :156).
- **Zwei Freigaben (Unit, `freigabe-zwei.test.ts`):**
  - Wahrheitstafel aus den Regeln, nicht aus dem Code abgeleitet (:100–133): Nur „beide sauber“ gibt frei (`sichtbar = 1`).
  - Einzelregeln :136 (eine Freigabe → nicht geprüft), :143 (neuer Hash setzt zurück), :148 (Administration zählt nicht),
    :155 (Verfasser zählt nicht), :164 (Belege), :197 (Lektion nur ganz).
  - `religioes-zwei-pruefer.test.ts:70–153` (`pruefeUrteil`, 0 → 1 → 2, Rücksetzen).
- **Zwei Freigaben (Integration, `lernapp-religioes.test.ts`):**
  - :152: Administration, Redaktion und Bildung haben kein Recht.
  - :190: „Aussage: 1/2 unsichtbar, gleiche Person nicht zweimal, 2/2 sichtbar“.
  - :221: Lektion nur ganz.
  - :236: neuer Hash setzt zurück.
  - :254: Verfasserin mit Rolle wird abgewiesen.
  - Alle grün.
- **Wissenspaket ohne Audio:** `aufgaben-wissen.test.ts:325, :364` („fremde Typen und Audio machen die Lektion ungültig“).
- **Live (Produktion, 25.10.2026 ≈ 19:20 Uhr):**
  - `GET /lern-app/pakete/islam` → 200, `{"kurs":"islam", … "einheiten":[]}`: 0 Einheiten, 0 Lektionen.
  - `GET /lern-app/pakete/islam/islam.grund.e01/<64×0>` und `…/islam.aufbau.e01/<64×0>` → 404.
  - Kursseiten `/lern-app/de/islam`, `/lern-app/tr/islam`, `/lern-app/ar/islam` und `/lern-app/de/islam/ueben` → 200. Die
    Seiten zeigen nur Rahmentext („Jede Lektion erscheint erst, wenn zwei Gelehrte der Gemeinde sie geprüft haben“) und
    den Ladehinweis.
  - In allen 9 abgerufenen Seiten und 222 Sprachkurs-Paketen kommen 0-mal `ki:lernapp-l6-04`, Aussagetexte oder Schlüssel
    `islam.grund.e0…` vor.
  - Ergebnis: **0 sichtbare Wissensbausteine**.

**Lücken**

1. Abweichung vom Lehrplan, kein Verstoß gegen KI-Regel 2:
   - `islam.vertiefung.e06` ist nach `WISSEN.md:74` und `:42` (Regel 10: „Zurückgestellte Lektionen bekommen keinen
     Entwurf, bis Menschen ein Werk benennen“) zurückgestellt. Trotzdem liegt ein Entwurf vor: 5 Lektionen, 37 Aussagen,
     85 Belege aus Werken des Registers (`radd_al_muhtar` 73, `ikhtiyar` 6, `hidaya` 6).
   - Ebenso enthält `islam.vertiefung.e08` unter `l03` und `l04` (im Lehrplan zurückgestellt, Hadith- und
     Koranwissenschaften) Lektionen mit anderem Zuschnitt sowie eine zusätzliche `l05`.
   - Die Prüfübersicht legt das offen (§2 „Abgleich mit dem Lehrplan“, §6). Sichtbar ist davon nichts; ohne zwei
     Freigaben bleibt es verborgen.
2. 26/28 Einheiten liegen unter Ziel − 5 % (26,6). Ursache sind nur die zwei zurückgestellten Siyar-Einheiten ohne
   Quelle. Nach der Schwelle im Auftrag ist das keine Lücke, wohl aber ein offener Ausbau.
3. Die menschliche Prüfung (LM-03) und die Quellenfragen (LM-04, LM-33) sind offen. Das ist keine Lücke des Laufs: Das
   Kriterium verlangt nur, dass ohne sie nichts sichtbar ist, und das ist erfüllt.

**Nacharbeit**

- Zu 1: Menschen entscheiden, ob `e06` und `e08.l03–l05` in den Prüfumfang gehören (LM-04, LM-03). Bis dahin soll
  `WISSEN.md` die Abweichung ausweisen. Klein: In `_lernapp/lehrplan/WISSEN.md` bei `e06` (Zeile 74/686 ff.) und bei
  `e08.l03/l04` (Zeile 734 f.) „Entwurf liegt vor, Belegbasis Register, Aufnahme in den Prüfumfang: LM-04“ vermerken,
  oder den Entwurf bis zur Entscheidung aus dem Import nehmen.
- Zu 2: nur Mensch, LM-04 (ein Werk für Siyar benennen), danach Paket „Wissen Siyar e04/e05“.
- Zu 3: nur Mensch, LM-03, LM-04, LM-33.

## 2. Z-L03 Koran-Arabisch

**Schwelle (kurz):** nur Bedeutungen mit zwei Freigaben zum aktuellen Stand; 0 Sprachausgabe; Audio nur aus Wortzeiten
freigegebener Rezitationen; Wurzeln nur aus der eigenen Wurzeltabelle mit zwei Freigaben; 0 Bedeutungen von Agenten.

**Status: erfüllt**

**Belege**

- **Pfad ohne Bedeutungen:** `web/inhalte/lernapp/koran/pfad.json` (letzte Änderung `c12623b5`, 21.10.2026)
  - 40 Einheiten, 187 Lektionen, 936 Wortformen, 936 Aufgaben, alle `koran_wort` mit `art: bedeutung`; 0 Wurzel-Aufgaben.
  - 0 Felder `bedeutung`, `bedeutungen`, `uebersetzung`, `wurzel` oder `audio`; 0 arabische Schrift, 0 Codepunkte.
  - Unit `koran-pfad.test.ts:34` prüft das.
- **Arbeitsliste ohne Agenten-Bedeutungen:** In `_lernapp/berichte/koran-arbeitsliste.md` sind von 936 Tabellenzeilen
  0 in den Spalten „Bedeutung (de)/(tr)“ befüllt (awk-Zählung). Der Kopf sagt: „Bedeutungen schreibt kein Agent“.
- **Wurzeln:**
  - `_lernapp/berichte/koran-wurzeln-lauf.md` beschreibt nur Werkzeugvorschläge im Scratchpad und sagt „nichts davon im
    Repository“. Tatsächlich liegt unter `web/daten/` kein Wurzel-Ordner (`ls web/daten`: geonames, hadith, haeufigkeit,
    hanafi-quellen, kaikki, lernapp-lizenzen, lernapp-modelle, quran-tajweed, quranenc, tanzil, tanzil-uebersetzungen,
    tatoeba).
  - Der Paketbau verwirft jede Aufgabe mit `art !== 'bedeutung'` (`web/src/lib/lernapp/paket/koran.ts:113`).
  - `koranWortSichtbar` mit `waehleWurzel` verlangt eine geprüfte Wurzeltabelle (`freigabe.ts:218–221`).
  - `wurzel` steht in `NUR_MENSCHLICH` (`web/src/lib/religioes/freigabe.ts:130–138`).
  - Das Paketformat hat kein Feld `wurzel` (`KoranWort`: `stelle`, `text`, `vorkommen`, optional `bedeutung`, `zeit`).
- **Bedeutungen nur mit zwei Freigaben, nie von KI:**
  - Hash über Form, Sprache, Bedeutung, Wurzel und Anmerkung (`paket/koran.ts:50–60`). Verfasser zählen nicht
    (`server/queries/lernapp/koran.ts:212–232`).
  - Geschrieben werden Bedeutungen nur über die Verwaltungsaktion `server/actions/koran.ts:180 ff.`; ein Seed oder
    Import schreibt sie nicht (grep über `scripts/` und `src/`).
  - Integration `lernapp-koran.test.ts`:
    - :123: ohne Freigaben überall „Bedeutung folgt“, keine Übungen, kein Audio.
    - :136: eine Freigabe, Administration und Verfasserin genügen nicht; zwei Personen → sichtbar; Lektion ganz.
    - :166: Änderung setzt zurück.
  - Integration `lernapp-religioes.test.ts`: :263 (Verfasserin zählt nicht), :278 („KI-Herkunft: nie freigebbar“), :299.
- **Audio:**
  - Wortzeiten nur mit `quranWortzeit.geprueft = true` und `quranRezitation.aktiv = true`
    (`server/queries/lernapp/koran.ts:149–150`, `:414–415`). `aktiv` setzt eine Vereinbarung voraus (DB-Check
    `quran_rezitation_vereinbarung`, `web/src/lib/db/schema/quran.ts:222`).
  - Integration `lernapp-koran.test.ts:205` („Wortzeiten nur geprüft und nur aktiver Rezitationen; nie Sprachausgabe“).
  - Unit `koran-paket.test.ts:217–250`: kein Feld `audio`, `stimme` oder `clip`; der Browser verwirft Pakete mit
    Audio-Feld.
- **Live (Produktion):**
  - `GET /lern-app/pakete/koran/de` und `/tr` → 200, je 40 Einheiten, Summe `bedeutungen` = 0, Summe `lektionen` = 0.
    `/koran/ar` → 404 (keine Bedeutungssprache). `GET /lern-app/pakete/koran` (Kursroute) → `"einheiten":[]`.
  - Pakete `koran.grund.e01` de und tr → 200: je 26 Wörter mit den Schlüsseln `stelle`, `text`, `vorkommen`; 0 mit
    `bedeutung`, 0 mit `zeit`, 0 Lektionen; kein Feld `audio`, `stimme`, `clip` oder `wurzel`.
  - Kursseiten `/lern-app/de/koran`, `/tr/koran` und `/de/koran/ueben` → 200, nur Rahmentext („Bedeutungen erscheinen
    erst nach Prüfung. Zu hören sind nur freigegebene Rezitationen, nie eine Computerstimme“).
  - Ergebnis: **0 sichtbare Koran-Bedeutungen, 0 Lektionen, 0 Audio**.
- Nicht geprüft: die Tabelle `quran_wortbedeutung` in der Produktionsdatenbank selbst (kein Datenbankzugriff erlaubt).
  Ersatz sind die ausgelieferten Verzeichnisse und Pakete. `pnpm lernapp:koran-sichtbar --basis …` braucht
  `DATABASE_URL` und wurde nicht ausgeführt.

**Lücken**

1. Nebenbefund Funktion, kein Sicherheitsbefund:
   - Live liefern nur die Pakete `koran.grund.e01` (de, tr) aus. Die übrigen 78 Adressen aus dem Verzeichnis
     (`koran.grund.e02` … `koran.vertiefung.e13`, je de und tr) antworten **404**; Antwortkopf
     `x-vercel-cache: STALE`, `age` 263–323 s.
   - Die Sprachkurs-Pakete derselben Bauart (222 von 222) liefern dagegen aus.
   - Ursache nicht geprüft. Vermutung: Der Hash im Verzeichnis passt nicht zu dem des Einzelpakets (Daten-Cache
     `use cache: remote` von `ladeKoranEinheitJson`), oder ein 404 liegt im CDN.
   - Das schlägt „geschlossen“ fehl: Es wird nichts Ungeprüftes sichtbar, aber der Pfad ist ab Einheit 2 nicht ladbar.
2. Freigabeweg für die Wurzeltabelle fehlt noch:
   - `RELIGIOESE_BAUSTEINE` (`freigabe.ts:242`) kennt `wurzel` nicht, obwohl `lernapp_inhalt_typ` den Wert hat.
   - Heute ohne Wirkung: Es gibt keine Tabelle und keine Wurzel-Aufgaben, also bleibt alles verborgen.
   - Der Weg wird erst mit LM-31 gebraucht.
3. Der in ABNAHME vorgesehene Test `audio-stimmen` existiert nicht (grep: nur in `ABNAHME.md` und `PLAN.md` genannt).
   Inhaltlich ist er abgedeckt durch `koran-paket.test.ts:217`, `lernapp-koran.test.ts:205` und `audio-kette.test.ts:448`
   (siehe Z-L21).

**Nacharbeit**

- Zu 1 (Paket „Koran-Pakete live“, Orchestrator bzw. Gruppe Funktion):
  - `pnpm lernapp:koran-sichtbar --basis https://igmg-wetzlarer.vercel.app` mit Produktions-`DATABASE_URL` ausführen;
    die Fehlerliste der Auslieferung nennt Hash und Adresse.
  - Ein Integrationsfall in `web/tests/integration/lernapp-koran.test.ts`, der für **alle** Einheiten den Hash aus
    `ladeKoranVerzeichnisJson` gegen `ladeKoranEinheitJson` vergleicht (heute nur E01).
  - Danach die Tags `lernapp-kurs-koran` und `lernapp` neu validieren.
- Zu 2: Wenn LM-31 eine Tabelle liefert, Paket „Wurzeltabelle freigeben“ (`wurzel` in `RELIGIOESE_BAUSTEINE`,
  Prüfoberfläche, Hash = SHA-256 der gepinnten Datei, Integration „eine Freigabe → keine Wurzel-Aufgabe, zwei → sichtbar“).
  Bis dahin nur Mensch (LM-31).
- Zu 3: klein. In `_lernapp/ABNAHME.md` (Spalte „Beleg“ von Z-L03/Z-L21) die tatsächlichen Testnamen eintragen, oder eine
  Datei `web/tests/unit/lernapp/audio-stimmen.test.ts` anlegen, die die drei Riegel zusammenfasst.
- Bedeutungen selbst: nur Mensch (LM-13, MN-05).

## 3. Z-L10 Religion-Prüfung

**Schwelle (kurz):** `religion-pruefung.mjs` 0 Befunde; Wächter 0 (Formel-Lexikon nur mit `religionsbezug`, Koran- und
Hadith-N-Gramm ≥ 4); Alltagsformeln nur aus der Liste mit zwei Freigaben; 0 sichtbare Sprachkurs-Einträge mit
`religionsbezug` ohne zwei Freigaben, auch bei `lernapp_ungeprueft` an.

**Status: erfüllt**

**Belege**

- **Religion-Prüfung:** Exit 0, „6547 Dateien … Wächter über 384 Lern-App-Dateien“. Die 384 entsprechen genau den
  382 Dateien unter `web/inhalte/lernapp/{sprache,uebersetzung,aussprache}` (`git ls-files`) plus `web/messages/lernapp/ar.json`
  und `web/messages/verwaltung/lernapp-pruefung.json`.
  - Index: 110.768 Koran-4-Gramme, 279.731 Hadith-4-Gramme.
  - Gescannt wird über `git ls-files`; `web/daten` und `web/tests` sind ausgenommen
    (`religion-pruefung.mjs:236–254`).
- **Wächter (Unit `religion-waechter.test.ts`, grün):**
  - Positivproben aus Tanzil (:121) und Bukhari (:152).
  - Schwelle: 3 Wörter sind kein Treffer (:145).
  - Negativproben mit neutralen Alltagssätzen (:166).
  - Nie erlaubt: Wissen, Koran-Pfad, Komponenten, Werkstatt (:198).
  - Umgehungen durch Codepunkte, Trenner und Homoglyphen (:222–282).
  - Formel-Lexikon (:283–346), darunter „deutsche und türkische Begriffe treffen, Alltagswörter nicht“ (:314).
- **Lexikon nur mit Kennzeichen** (`religion-inhalt.test.ts`, grün):
  - :41 „ein Satz mit Religionsbegriff braucht `religionsbezug: true`“.
  - :54 Übersetzung erbt das Kennzeichen.
  - :77 vier Koran-Wörter über zwei Sätze sind rot, auch mit Kennzeichen.
  - Der Kern liegt in `web/src/lib/lernapp/waechter/kern.mjs:233–345` (`LEXIKON_VERWEISE`, `LEXIKON_LATEIN`,
    `lexikonTreffer`).
- **Inhaltsprüfer:** `pnpm lernapp:pruefen` meldet `religion 0/0/0` (0 Lexikon- oder 4-Gramm-Treffer ohne Kennzeichen) und
  `religionsbezug 0/3/82`:
  - 3 × menschlich_klaeren [R-06], alle in `uebersetzung/tr-aus-ar/b1/tr.b1.e16.json` (`tr.b1.e16.mantar`, `s0015`,
    `s0103`). Laut `PRUEFPUNKT.md:19` ist das ein Fehltreffer: Das unvokalisierte arabische Wort für „Pilz“ (fuṭr) wird
    geschrieben wie fiṭr aus R-06. `tr.b1.e16` steht auf `entwurf` und ist live nicht im Verzeichnis (tr-aus-ar und
    tr-aus-de zeigen B1 = 15 Einheiten, 0 Treffer für `tr.b1.e16`).
  - 82 Warnungen [kaikki-religion]: Alltagswörter, deren Wiktionary-Artikel auch das Thema Religion trägt (z. B.
    `ar.a1.e02.tilmidh`, `ar.a1.e04.sana`), nicht blockierend.
- **Alltagsformeln:**
  - Die Formelliste im Leitfaden (`web/inhalte/lernapp/rahmen/leitfaden.json`, `religionsbezug.formeln`) hat
    `status: gesperrt`, 37 Einträge, `sprachausgabe: false`; Freigabe „Liste als Ganzes mit zwei Freigaben“ (LM-09).
  - In allen Sprachkurs-Inhaltsdateien tragen 0 Einträge `religionsbezug: true` (grep über `sprache/` und `uebersetzung/`).
    Der Wächter findet 0 Lexikon-Treffer ohne Kennzeichen.
  - Damit erscheint keine Formel.
- **Sichtbarkeit `religionsbezug`:**
  - Code: `sprachSichtbarkeit` (`freigabe.ts:173–184`) verbirgt `religionsbezug` ohne zwei religiöse Freigaben vor der
    Prüfung des Schalters. Jeder Eintrag geht durch sie (`web/src/lib/lernapp/paket/bauen.ts:109`). Der Schalter
    `lernapp_ungeprueft` steht in Produktion an (`funktionen-regeln.ts:40`).
  - Unit `freigabe-zwei.test.ts:240–250`: alle Status × beide Schalterstände; Stichprobe und eine Freigabe genügen nicht.
  - Integration `lernapp-pakete.test.ts:328–365`, mit Schalter an (Standard, Einträge `automatisch_geprueft`):
    unsichtbar ohne Freigabe; religiöse Prüfung + Administration → weiter unsichtbar; zweite religiöse Prüfung → sichtbar;
    nie `stimme` oder `audio`. Grün.
- **Live-Stichprobe (vollständig statt Stichprobe):** Alle 222 Einheitenpakete der 6 Richtungen wurden über die Adressen
  aus den Verzeichnissen abgerufen, alle mit 200. Umfang: tr-aus-de, de-aus-tr, de-aus-ar und tr-aus-ar je 42
  (A1 13, A2 14, B1 15); ar-aus-de und ar-aus-tr je 27. Alle Einheiten mit `hinweis: true`, der Schalter wirkt also.
  - 101.791 Einträge, davon **0 mit Feld `religionsbezug`**.
  - Begriffssuche über alle Zeichenketten der Pakete nach den Leitfaden-Begriffen R-01 bis R-13 und den Lexikon-Begriffen,
    deutsch und türkisch (Moschee, Gebet, Ramadan, Opferfest, Imam, Koran, Hadith, Allah, Prophet, inschallah, cami,
    namaz, ramazan, oruç, iftar, bayram, helal, kuran, peygamber, ezan, abdest, kurban u. a.): 20 Treffer, alle „camı“
    (türkisch „Glas, Scheibe“, `tr.a2.e10.s0261`), also 0 echte Treffer.
  - Arabisch, normalisiert und tokengenau (masjid, ṣalāh, ramaḍān, ḥajj, qurʾān, imām mit Hamza unten, ʿīd als eigenes
    Wort, Gottesname, „in shāʾa“): **0 Treffer**.
  - Eine erste, gröbere Suche ergab nur Fehltreffer: amāma „vor“, baʿīd „weit“, ḥadīth als Adjektiv „modern“ (19-mal),
    lahu „für ihn“, lajna „Ausschuss“, milāk „Personalbestand“.

**Lücken**

1. Die Freigabe der Formelliste als Ganzes ist technisch nicht erzwungen:
   - `formeln.status` (`gesperrt` | `freigegeben`) wird nur im Schema gelesen (`inhalt/schema.ts:878–885`), aber weder im
     Prüfer (`pruefer/religionsbezug.ts:100–108`, Treffer nur menschlich_klaeren) noch im Paketbau ausgewertet.
   - Für `formelliste` gibt es in `lernapp_inhalt_typ` einen Wert, aber keinen Freigabeweg.
   - Ein Formel-Eintrag mit `religionsbezug: true` würde nach zwei Freigaben je Eintrag sichtbar, auch solange die Liste
     `gesperrt` ist.
   - Heute ohne Wirkung (0 Einträge mit Kennzeichen, 0 Formeln live), aber eine Abweichung von KERN §2.3 „Formelliste“.
2. Das arabische Formel-Lexikon (`kern.mjs:233–244`) enthält nur Basmala, Gottesname, Hamdala, inschallah, maschallah,
   subhanallah, Takbir, Friedensgruß und Sure.
   - Arabische Formen von Vers, Hadith, Bittgebet sowie Moschee, Gebet, Fasten, Fest und Pilgerfahrt fehlen. KERN §3 a
     nennt „Begriffe wie Sure, Vers, Hadith, Bittgebet“.
   - Abgefangen wird das teilweise über die R-Kandidaten im Prüfer `religionsbezug` (arabisch über kaikki, nur
     menschlich_klaeren) und über die 4-Gramme.
   - Die Liste ist als „Startliste“ für LM-09 gekennzeichnet. Live ergab die Suche 0 Treffer, also heute ohne Wirkung.

**Nacharbeit**

- Zu 1 (klein, Code):
  - In `web/src/lib/lernapp/inhalt/pruefer/religionsbezug.ts` einen F-Kandidaten (Formel aus `formeln.liste`) bei
    `formeln.status === 'gesperrt'` **blockierend** melden statt menschlich_klaeren.
  - Zusätzlich in `web/src/lib/lernapp/paket/bauen.ts` Einträge mit `religionsbezug` und F-Kandidat verbergen, solange die
    Liste nicht freigegeben ist.
  - Die Freigabe der Liste als Ganzes (`formelliste`, Hash = SHA-256 von `formeln`) als Baustein in
    `RELIGIOESE_BAUSTEINE` aufnehmen; Unit- und Integrationsfall „Liste gesperrt → Formel unsichtbar trotz zwei
    Eintragsfreigaben“.
  - Inhalt der Liste: nur Mensch, LM-09.
- Zu 2: nur Mensch (LM-09: Lexikon bestätigen und ergänzen). Danach klein: arabische Einträge als Verweise in
  `LEXIKON_VERWEISE` (`kern.mjs:233`) aus `web/daten` aufnehmen; kein Agent schreibt den Wortlaut. Mehrdeutige Wörter
  (ḥadīth „modern“, āya „Zeichen“) als menschlich_klaeren statt rot.

## 4. Z-L21 (Teil): 0 Audio zu `religionsbezug`, Wissenskurs und Koran-Pfad

**Schwelle (kurz):** keine Sprachausgabe und kein Audio für Einträge mit `religionsbezug`, für den Wissenskurs und für den
Koran-Pfad (außer Wortzeiten freigegebener Rezitationen). Der übrige Teil von Z-L21 (Stimmen, Hörabnahme LM-06,
Vokalisierungstest) gehört nicht zu dieser Gruppe.

**Status: erfüllt**

**Belege**

- **Code:**
  - Audio nur für Zieltexte ohne `religionsbezug` (`server/queries/lernapp/pakete.ts:266–267`).
  - Koran-Paket ohne Audio-Feld (`paket/koran.ts`, Kopf :23–35).
  - Wissenslektion mit Audio ist ungültig (`aufgaben-wissen.test.ts:364`).
- **Unit `audio-kette.test.ts:448`:** „Prüfer: Clip zu Religionsbezug oder Wissenstext blockiert“ (grün).
  `lernapp:pruefen` meldet `audio 0/0/0`.
- **Integration, alle grün:**
  - `lernapp-audio.test.ts:135` „fail closed: Clip zu einem Text mit Religionsbezug …“.
  - `lernapp-verwaltung.test.ts:520–525`: Religionsbezug → `nichtVertonbar`; Wissensschlüssel → `nichtGefunden`; nicht
    im Audio-Studio.
  - `lernapp-pakete.test.ts:361–363`: freigegebener Religionsbezug-Eintrag ohne `stimme` und ohne `audio`.
  - `lernapp-koran.test.ts:123, :205`: kein Feld `audio`, `stimme` oder `clip`.
- **Live:**
  - In den 222 Sprachkurs-Paketen tragen 158 Einträge eine Stimme, alle `test:ton`; 72 Audio-Bündel; 0 Einträge mit
    `religionsbezug`; 0 Schlüssel `islam.*` oder `koran.*`.
  - Koran-Pakete e01 (de, tr) ohne Audio-Feld und ohne `zeit`.
  - `GET /lern-app/audio/islam/x.lpa` und `/lern-app/audio/koran/x.lpa` → 404.
  - Wissensverzeichnis leer.
  - Ergebnis: **0 Audio zu Religionsbezug, Wissen und Koran-Pfad**.

**Lücken:** keine in diesem Teil. Der Testname `audio-stimmen` fehlt (siehe Z-L03, Lücke 3).

**Nacharbeit:** siehe Z-L03 Nr. 3 (nur Beleg-Spalte bzw. Sammeltest).

## 5. Nebenbefunde außerhalb der Gruppe (nur Hinweis, nicht vertieft geprüft)

- **Testkurs-Einträge in Produktion:**
  - 172 Einträge in den Live-Paketen haben `quelle: test:lernapp-testkurs`; sie stehen in den a1.e01-Einheiten aller
    Sprachen und in Wiederholungsverweisen, z. B. `tr.a1.e01.m001` mit `stimme: test:ton`.
  - In `web/inhalte/lernapp` kommt diese Quelle nicht vor (grep: 0 Dateien), sie stammt also aus der Datenbank.
  - Weitergeben an die Gruppen Inhalte und Lizenz/Betrieb.
- **Koran-Pakete ab Einheit 2 live 404:** siehe Z-L03, Lücke 1 (Gruppe Funktion).

## 6. Übersicht

| Z | Status | Beleg kurz |
|---|---|---|
| Z-L02 | erfüllt | 26 Entwürfe (25/25 nicht zurückgestellte + e06; e04/e05 ohne Quelle, LM-04); 2.124/2.124 Aussagen mit Beleg, 4.603 Belege mit Werk/Kapitel/Ausgabe/Passage, alle `sinngemaess` (Schema :954/:1099); 0 arabische Schrift in 26 Dateien; Unit `freigabe-zwei` (Wahrheitstafel, Admin/Verfasser zählen nicht) und Integration `lernapp-religioes` :190/:221/:236/:254 grün; live `pakete/islam` mit 0 Einheiten; Hinweis: e06/e08 weichen vom Lehrplan ab |
| Z-L03 | erfüllt | Pfad 936 Aufgaben nur `bedeutung`, 0 Bedeutungsfelder, Arbeitsliste 0/936 befüllt, keine Wurzeltabelle in `web/daten`, Wurzel-Aufgaben verworfen (`paket/koran.ts:113`); Wortzeiten nur `geprueft` + `aktiv`; Integration `lernapp-koran` :123/:136/:205 grün; live 2×40 Einheiten mit 0 Bedeutungen und 0 Lektionen, e01-Pakete ohne Audio; Nebenbefund: e02–e40 live 404 (fail closed) |
| Z-L10 | erfüllt | `religion-pruefung` 0 Befunde (6.547 Dateien, Wächter 384); `lernapp:pruefen` 0 blockierend, `religion 0/0/0`, 3 Mensch nur im verborgenen tr.b1.e16 (Fehltreffer); Unit `religion-waechter`/`religion-inhalt` grün; Formelliste `gesperrt`, 0 Einträge mit Kennzeichen; Integration `lernapp-pakete:328` bei Schalter an grün; live 222/222 Pakete, 101.791 Einträge, 0 `religionsbezug`, 0 echte Religionsbegriffe; Lücke: Listenfreigabe technisch nicht erzwungen |
| Z-L21 (Teil Religion) | erfüllt | Audio nur ohne `religionsbezug` (`pakete.ts:267`); Unit `audio-kette:448`, Integration `lernapp-audio:135`, `lernapp-verwaltung:520–525`, `lernapp-koran:205` grün; live 0 Audio zu Religionsbezug, Wissen und Koran (Audio-Route islam/koran 404) |
