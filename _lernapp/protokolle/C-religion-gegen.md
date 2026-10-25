# Stufe C – Gegenprüfung Gruppe religion (Paket L8-05)

- **Datum:** 25.10.2026, 19:32–20:20 Uhr
- **Stand:** `6bb7b6d6` (Branch `claude/trusting-lovelace-6nfolz`, Haupt-Checkout `/home/user/IGMG`; `HEAD` steht auf
  `0c90f09a`, der nur `PRUEFPUNKT.md` ändert)
- **Prüfer:** frischer, skeptischer Gegenprüfer der Gruppe „Religion, Wissen, Koran-Arabisch“
- **Gegenstand:** `_lernapp/protokolle/C-religion.md` (Erstprüfer) zu Z-L02, Z-L03, Z-L10 und dem Religionsteil von Z-L21
  („0 Audio zu `religionsbezug`, Wissenskurs und Koran-Pfad“)
- **Maßstab:** Schwellen in `_lernapp/ABNAHME.md` (nicht die Kurzfassungen im Erstprotokoll), `_lernapp/KERN.md` §2–§4
- **KI-Regel 2** (ADR 0040, KERN §2) eingehalten: Dieses Protokoll enthält keine religiösen Texte, keine Übersetzungen, keine
  Bedeutungen und keine arabische Schrift. Arabische Wörter nur in Umschrift oder über die Kennungen der Formelliste
  (`F-ar-NN`). Die arabischen Proben unten liefen nur im Scratchpad, als Codepunkte, über den Wächter des Projekts.

## 0. Vorgehen und Umgebung

- Nur gelesen und geprüft; geschrieben wurde nur diese Datei. Der Arbeitsbaum `.claude/worktrees/inhalte-a1` wurde nicht
  angefasst. Eigene Skripte und Abrufe: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/c-relg/`.
- `TMPDIR`: `…/scratchpad/tmp-c-religion-gegen`, über den Symlink `/tmp/c-relg` angesprochen (der lange Pfad sprengt die
  108-Zeichen-Grenze des `tsx`-IPC-Sockets, wie im Erstprotokoll beschrieben).
- Alle Befehle selbst ausgeführt:

| Befehl | Ergebnis |
|---|---|
| `node _gemeinde/werkzeuge/religion-pruefung.mjs` | Exit 0: „6547 Dateien … Wächter über 384 Lern-App-Dateien (Index Koran 110768, Hadith 279731 4-Gramme), 6.9 s“ |
| `pnpm lernapp:pruefen` | Exit 0: 414 Dateien, 129.322 Einträge, **0 blockierend**, 15 menschlich_klaeren, 960 Warnungen; `religionsbezug 0/3/82`, `religion 0/0/0`, `audio 0/0/0` |
| `pnpm vitest run` mit 9 Dateien (`freigabe-zwei`, `religion-waechter`, `religioes-zwei-pruefer`, `religion-inhalt`, `koran-pfad`, `koran-paket`, `audio-kette`, `aufgaben-wissen`, `tests/unit/religioese-freigabe`) | 9/9 grün, 159/159 |
| `pnpm test:integration` mit 7 Dateien (`lernapp-religioes`, `lernapp-koran`, `lernapp-pakete`, `lernapp-audio`, **`lernapp-verwaltung`**, `verwaltung-wissen`, `verwaltung-koran`) | 7/7 grün, **112/112**. `lernapp-verwaltung` hatte der Erstprüfer zitiert, aber nicht ausgeführt; jetzt belegt. |
| Eigene Zählung (Python `-I`) über `web/inhalte/lernapp/{islam,koran}`, `_lernapp/lehrplan/WISSEN.md`, `_lernapp/berichte/koran-arbeitsliste.md` | siehe unten |
| Live-GET `https://igmg-wetzlarer.vercel.app` (19:40–20:10 Uhr) | 8 Kursverzeichnisse, **222/222** Sprachkurs-Pakete (alle 200), 2 Koran-Verzeichnisse, 78 Koran-Paketadressen, 9 Lern-App-Seiten, `/verwaltung/lernapp/religioes`, 4 Audio-Adressen |
| **Wächter des Projekts über alle Live-Pakete** (`waechter/kern.mjs`: `lexikonTreffer` und `vierGrammTreffer`, Index aus `web/daten/tanzil` und `web/daten/hadith`) | 160.904 eindeutige Zeichenketten: Lexikon 2 Treffer, beide nur Kartenschlüssel `…tr.a2.e11.sure` (Text „süre“ = Dauer), kein Text; 4-Gramm **0** |
| Wächter-Proben mit Formeln der Formelliste (Codepunkte im Scratchpad, `lexikon-probe.mjs`, `lexikon-probe2.mjs`) | siehe Z-L10 |

**Wichtiger Rahmen, den das Erstprotokoll nicht nennt:** Die Produktion läuft im **Beispielmodus ohne Laufzeit-Datenbank**.
Live-Beleg: `GET /verwaltung/lernapp/religioes` → „Verwaltung noch nicht eingerichtet. Diese Seite läuft als Vorführung ohne
Datenbank. Die Verwaltung (Anmeldung, Inhalte pflegen, Freigaben) wird verfügbar, sobald die Datenbank im Vercel-Projekt
verbunden ist“. Code: `web/scripts/vercel-bau.mjs:25–33` (ohne `DATABASE_URL` Bau gegen die PGlite-Bau-Datenbank),
`web/scripts/bau-datenbank.mjs:11–21` (Migrationen, Seeds, `inhalte-import.ts`, `lernapp/import.ts`, auf Vercel mit
Testkurs). Folgen:

- Live kann es **keine einzige Freigabe** geben (keine Anmeldung, keine Verwaltung). Die Live-Abfragen zeigen deshalb nur, dass
  der ausgelieferte Stand nichts Religiöses enthält. Über die Zwei-Freigaben-Logik beweisen sie nichts; dafür stehen allein die
  Unit- und Integrationstests.
- Die Tabelle `quran_wortbedeutung` der Live-Datenbank entsteht nur aus Repository-Skripten. Keines davon schreibt sie (grep über
  `web/drizzle/seeds`, `web/scripts/inhalte-import.ts`, `web/scripts/lernapp/import.ts`: 0 Treffer). Schreibstellen gibt es
  nur in den Verwaltungsaktionen (`web/src/server/actions/koran.ts:200` Insert, `:479` Update;
  `web/src/server/actions/freigaben.ts:123`). Das ist ein stärkerer Ersatz für die „Abfrage am Live-Stand“, als das
  Erstprotokoll angibt.
- Die 172 Einträge `test:lernapp-testkurs` und die Einheit „Testeinheit: Alltag“ (`tr.a1.e01` live) sind **gewollt** und kein
  Datenbankleck: Sie kommen aus `bau-datenbank.mjs:15–21` (`VERCEL === '1'` → `--testkurs`). Damit korrigiere ich den
  Nebenbefund im Erstprotokoll §5. Der Kopf von `drizzle/seeds/lernapp-test.ts:5` („nie in der Produktion“) widerspricht dem
  für die Test-Domain; das klärt die Gruppe Inhalte/Betrieb.

## 1. Z-L02 Wissenskurs

**Urteil: herabgestuft – neuer Status: teilweise** (Erstprüfer: erfüllt)

**Schwelle (ABNAHME.md:23, vollständig):** 28 Einheiten vollständig entworfen (≥ Ziel − 5 %); 100 % der Aussagen mit ≥ 1 Beleg
(Werk, Kapitel, Ausgabe); 0 sichtbare Bausteine ohne zwei Freigaben zum aktuellen Hash von zwei verschiedenen Prüfenden,
**Verfasser und Administration zählen nicht**; jeder sichtbare Beleg „am Original geprüft“; Lektion nur vollständig sichtbar;
0 arabische Schrift in den Inhaltsdateien, Arabisch nur aus Datenverweisen; Belege von KI-Aussagen nur `sinngemaess`.

**Bestätigt (eigene Belege):**

- 26 Dateien, alle `entwurf`; 146 Lektionen, 2.124 Aussagen, 4.603 Belege, 1.041 Aufgaben; Verweise 203 (`art: koran`,
  `stelle`) und 65 (`sammlung`, `nummer`). 0 Aussagen ohne Beleg, 0 Belege ohne `werk`, `kapitel` oder `ausgabe`.
  `art`: 4.603 × `sinngemaess`. `quelle`: 2.124 × `ki:lernapp-l6-04`. Werke: hidaya 1.033, ikhtiyar 947, nur_al_idah 908,
  quduri 846, radd_al_muhtar 681, tahawiyya 101, fiqh_akbar 87; alle aus KERN §2.4.
- 0 Dateien mit arabischer Schrift, 0 mit `\u06xx`-Escapes oder Entitäten. `religion-pruefung.mjs:113–115` führt
  `islam|koran` unter „nie“ mit `codepunkte: true`; Lauf Exit 0.
- Schema: `inhalt/schema.ts:954–955` (Standard `sinngemaess`) und `:1099–1100` (`woertlich` bei `ki:` ist ein Fehler).
- Logik: `freigabe.ts:103–126` (`religioeseLage`), `:85` (Belege bestätigt), `:136` (Lektion ganz), `:189`, `:203`;
  `rechte/matrix.ts:137–142` (`lernapp.religioes.pruefen` in `NIE_PER_ADMINISTRATION`), `:156`.
- Tests grün (selbst ausgeführt): Unit `freigabe-zwei` (Wahrheitstafel :100, Einzelregeln :136–200); Integration
  `lernapp-religioes` :152, :190, :221, :236, :254, :263, :278.
- Live: `GET /lern-app/pakete/islam` → `"einheiten":[]`. In 9 Lern-App-Seiten (de/tr/ar islam, islam/ueben, de/tr koran,
  koran/ueben, quellen, Start) kommt keiner von 292 Prüftexten vor (146 Lektionstitel und 146 Aussageanfänge aus den Dateien),
  ebenso nicht `ki:lernapp-l6-04`.

**Widerlegt bzw. nicht abgedeckt:**

1. **Menge unter der Schwelle.** Ziel − 5 % = 26,6 Einheiten. Entworfen sind 26 (92,9 %); bei den Lektionen 146 von 155
   (94,2 %). Die Lehrplan-Tabelle (`WISSEN.md:44–73`) habe ich gegen die Dateien abgeglichen: Es fehlen `islam.vertiefung.e04`
   und `e05`; `e08` hat 5 statt 4 Lektionen. Die „Schwelle im Auftrag (ohne die zurückgestellten)“, auf die sich das
   Erstprotokoll stützt, steht nicht in ABNAHME.md, und keine Entscheidung in `ENTSCHEIDUNGEN.md` senkt das Ziel 28 (grep
   „siyar“, „zurückgestellt“: kein Treffer zum Wissenskurs). Von den 26 widerspricht zudem `e06` der Lehrplan-Regel 10
   (`WISSEN.md:42`; Entwurf `db6de63e`, 24.10.2026). Lehrplantreu entworfen sind also 25. Der Grund ist berechtigt: Ohne
   benanntes Werk darf kein Entwurf entstehen (KERN §2.2 Nr. 5). Das rechtfertigt eine AUSNAHME für diesen Teil, aber kein
   „erfüllt“.
2. **„Administration zählt nicht“ ist umgehbar.** Ein Konto mit den Rollen `administration` **und** `religioese_pruefung`
   zählt als Freigabe:
   - `freigabe.ts:107` prüft nur, ob die Rolle vorhanden ist; `matrix.ts:303–311` (`darf`) vereinigt die Rechte aller Rollen.
   - Der Unit-Test, den das Erstprotokoll als Beleg „Administration zählt nicht“ anführt, behauptet das Gegenteil, und zwar
     ausdrücklich: `freigabe-zwei.test.ts:150–152` erwartet `true` für die Rollen `['administration', 'religioese_pruefung']`.
   - Die Administration kann sich die Rolle selbst geben: `rollenSpeichern` (`server/actions/benutzer.ts:170`) ruft nur
     `schutzrollenRegel` auf, und die sperrt Selbstvergabe und die Kombination mit `administration` allein für `leitung` und
     `kinderschutz` (`lib/rechte/schutzrollen.ts:53–62`). Das Vier-Augen-Prinzip gilt für `religioese_pruefung` nur beim
     Entzug (`schutzrollen.ts:28`), nicht bei der Vergabe.
   - `sicherheit-n4-vier-augen.test.ts:214` hält das als gewollt fest: „Administration darf sie haben“.
   - Folge: Mit einem Zweitkonto, dem sie die Rolle ebenfalls gibt, erzeugt die Administration beide Freigaben allein. Genau
     dieses Muster wurde für `leitung` und `kinderschutz` geschlossen (S-11, Kopf von `schutzrollen.ts:9–20`).
   - Widerspruch zur Schwelle „Administration zählt nicht“ und zu `berichte/plan-verfeinerung-2026-10-16.md:16` („lässt sich
     nicht über die Administration ersetzen“).
   - Live ohne Wirkung (keine Verwaltung, siehe §0).
3. **Die Live-Belege sind strukturell leer.** `verzeichnisVon` liefert für `islam` (und `koran` über die Kursroute) **immer**
   `einheiten: []` (`server/queries/lernapp/pakete.ts:407`: `istRichtung(kurs) && kursArt(kursId) === 'sprache' ? … : []`).
   - `sichtbareWissensLektion` (`lib/lernapp/paket/wissen.ts:49`) hat keinen Aufrufer.
   - Der Kopf derselben Datei sagt: „Den Paketbau des Wissenskurses … baut L6; diese Funktionen sind seine Schnittstelle“.
   - Damit ist „0 sichtbare Bausteine“ live trivial erfüllt. Andererseits würde auch eine Lektion mit zwei Freigaben nie
     ausgeliefert. „2/2 sichtbar“ gibt es nur in der Verwaltungs- bzw. Abfrageschicht (`queries/lernapp/religioes.ts:542–562`).
   - Kein Verstoß gegen die (einschränkende) Schwelle, aber das Erstprotokoll stellt die Live-Abfrage als Beleg der
     Freigabelogik dar.
4. **Ausgabe ungeklärt.** Alle 1.033 Hidāya-Belege tragen die Ausgabe „al-Maktaba al-Islāmiyya, ohne Jahr (Ausgabe klären,
   LM-33)“. 77 Aussagen stützen sich nur auf Hidāya-Belege (eigene Zählung). Laut Lizenzbericht (`berichte/lizenzen-l0.md:114`)
   gilt dafür „Ausgabe klären oder alten Druck heranziehen“. Das ist formal eine Ausgabe, inhaltlich offen; nicht sichtbar.

**Zusätzliche Lücken:** Nr. 2 (Administration), Nr. 3 (kein Auslieferungsweg), Nr. 4 (Hidāya-Ausgabe). Die Lücke „Abweichung
`e06`/`e08.l03–l05`“ des Erstprüfers bestätige ich.

**Nacharbeit:**

- Zu 1: nur Mensch, LM-04 (Werk für Siyar) und LM-33. Bis dahin in `_lernapp/ABNAHME.md` den Mengenteil von Z-L02 als
  AUSNAHME führen. Grund: KERN §2.2 Nr. 5 bzw. `WISSEN.md:42` Regel 10. Ersatz: 25/25 belegbare Einheiten entworfen, `e06` als
  Entwurf ohne Lehrplan-Deckung. Danach Paket „Wissen Siyar e04/e05“.
- Zu 2 (Code, klein bis mittel, Paket „Religiöse Prüfung: Vier-Augen bei der Vergabe“):
  - `web/src/lib/rechte/schutzrollen.ts` `schutzrollenRegel`: `religioese_pruefung` nie zusammen mit `administration` und nie
    an sich selbst.
  - Vergabe über Antrag und Bestätigung wie bei `leitung`/`kinderschutz` (`server/actions/benutzer.ts:197–201`, Filter
    `bleibt`).
  - Zusätzlich in `web/src/lib/lernapp/freigabe.ts:107` Prüfungen von Personen mit der Rolle `administration` nicht zählen.
  - Tests anpassen: `freigabe-zwei.test.ts:150–152` und `sicherheit-n4-vier-augen.test.ts:214–217`; neuer Integrationsfall
    „Administration gibt sich `religioese_pruefung` → abgewiesen; Konto mit beiden Rollen zählt nicht“.
  - Ob in der Gemeinde jemand zugleich Administration und religiöse Prüfung sein darf, entscheidet der Vorstand (neue Frage zu
    LM-03).
- Zu 3: Paket „Wissens-Paketbau“ (Rest von L6):
  - `verzeichnisVon` für `islam` aus `sichtbareWissensLektion` bauen, dazu eine Einheitenroute.
  - Integrationsfall „1/2 nicht im Paket, 2/2 im Paket, Lektion nur ganz, kein Audio“.
  - Kein Abnahmehindernis, aber Voraussetzung dafür, dass der Wissenskurs nach LM-03 überhaupt erscheint.
- Zu 4: nur Mensch, LM-33.
- `e06`/`e08`: wie im Erstprotokoll (Vermerk in `WISSEN.md` oder Entwurf aus dem Import nehmen; Entscheidung LM-04/LM-03).

## 2. Z-L03 Koran-Arabisch

**Urteil: bestätigt – Status: erfüllt**

**Schwelle (ABNAHME.md:24):** nur Bedeutungen mit zwei Freigaben zum aktuellen Stand; 0 Sprachausgabe; Audio nur aus Wortzeiten
freigegebener Rezitationen; Wurzeln nur aus der eigenen Wurzeltabelle mit zwei Freigaben; 0 Bedeutungen von Agenten.

**Eigene Belege:**

- `web/inhalte/lernapp/koran/pfad.json` (`c12623b5`): 40 Einheiten, 187 Lektionen, 936 Aufgaben, alle `koran_wort` mit `art:
  bedeutung`. Schlüssel nur `ablenker, art, aufgaben, de, einheiten, format, kurs, lektionen, reihenfolge, schluessel, stufe,
  thema, tr, typ, version, wortform, wortformen` (kein Feld für Bedeutung, Wurzel oder Audio); 0 arabische Schrift, 0 Escapes.
- Arbeitsliste: 936 Datenzeilen, davon **0** mit Eintrag in „Bedeutung (de)“ oder „(tr)“ (eigene awk-Zählung, Spalten 7/8).
- Paketbau verwirft `art !== 'bedeutung'` (`paket/koran.ts:113`). Eine Bedeutung erscheint nur über `sichtbareBedeutung` und
  `koranWortSichtbar` (`:103–105`, `freigabe.ts:218–221`); der Hash bindet Bedeutung, Wurzel und Anmerkung (`:50–60`).
  `KoranWort` liefert live nur `stelle`, `text`, `vorkommen`.
- Wortzeiten nur mit `quranRezitation.aktiv = true` und `quranWortzeit.geprueft = true` (`queries/lernapp/koran.ts:149–150`);
  `aktiv` nur mit Vereinbarung (DB-Check `quran_rezitation_vereinbarung`, `db/schema/quran.ts:222`).
- Die Audio-Route nimmt nur Sprachkurs-Bündel an (`leseBuendelPfad`, `paket/buendel.ts:192–198`, `istSchluesselVon(sprache, …)`).
  Live: `/lern-app/audio/koran/x.lpa` → 404.
- Tests grün (selbst ausgeführt): Integration `lernapp-koran` :123, :136, :166, :205, :247, :283, :316; `lernapp-religioes`
  :278 (KI-Herkunft nie freigebbar), :299; Unit `koran-paket` :218, :248; `koran-pfad`.
- Live: `pakete/koran/de` und `/tr` → je 40 Einheiten, Summe `bedeutungen` 0, `lektionen` 0, 936 Wörter; `/koran/ar` → 404.
  Pakete `koran.grund.e01` de und tr: 26 Wörter mit `stelle`, `text`, `vorkommen`; 0 `bedeutung`, `zeit`, `audio`, `stimme`,
  `clip` oder `wurzel`.
- „0 Bedeutungen von Agenten“ und Live-Tabelle: siehe §0. Die Live-Datenbank entsteht ohne Schreiber für
  `quran_wortbedeutung`, und die Verwaltung ist live nicht eingerichtet. Damit ist die Tabelle live leer, auch ohne
  Datenbankzugriff.

**Zu den Lücken des Erstprüfers:**

- **404 ab Einheit 2: bestätigt, Ursache gefunden – nicht der Cache.** Eigener Abruf: 76 von 78 Adressen → 404, nur e01 (de, tr)
  → 200. Ein frischer Abruf von `koran.grund.e02` ergibt `x-vercel-cache: MISS`, `age: 0`, `cache-control: no-store`; das ist
  also kein veralteter CDN-Eintrag.
  - Ursache: `ladeKoranPaketParameter` (`server/queries/lernapp/koran.ts:269–280`) rendert je Sprache **nur die erste
    Einheit** vor.
  - Zur Laufzeit gibt es auf Vercel keine Datenbank: `datenbankVerfuegbar()` (`lib/db/verfuegbar.ts:7–9`) ist falsch, also
    liefert `ladeKoranEinheitJson` null, und die Route antwortet 404.
  - Die Sprachkurse rendern im Beispielmodus dagegen **alle** Einheiten vor (`ladePaketParameter`, `pakete.ts:445–452`, mit
    `ohneLaufzeitDatenbank()`); daher 222/222.
  - Die Nacharbeit des Erstprüfers („`lernapp:koran-sichtbar` mit Produktions-`DATABASE_URL`“) ist so nicht ausführbar: Es
    gibt keine Produktions-Datenbank.
  - Die Lücke schlägt geschlossen fehl und betrifft die Funktion, nicht die Schwelle.
- Wurzel ohne Freigabeweg (`RELIGIOESE_BAUSTEINE`, `freigabe.ts:242`): bestätigt, heute ohne Wirkung.
- Testname `audio-stimmen` fehlt: bestätigt (grep in `web/tests` und `web/src`: 0).

**Zusätzliche Lücken:**

- Die Umgehung über die Administration (§1 Nr. 2) gilt auch für Koran-Bedeutungen. Die Schwelle von Z-L03 nennt die
  Administration nicht, deshalb keine Herabstufung; die Behebung erfolgt mit dem Paket aus §1.
- Nur Hinweis, keine Lücke: Als Verfasser zählt nur, wer zuletzt geändert hat (`queries/lernapp/koran.ts:225–228`, ebenso
  Wissen `queries/lernapp/religioes.ts:151/187/231/271`). Wer eine frühere Fassung geschrieben hat, darf eine geänderte
  Fassung freigeben. Das deckt sich mit KERN §2.3 („Vorschläge übernimmt die Redaktion, danach prüfen beide den neuen Hash“).
  Der Code-Kommentar merkt die Ableitung aus dem Audit vor.

**Nacharbeit:**

- 404 (klein, Code; Gruppe Funktion): In `ladeKoranPaketParameter` wie in `ladePaketParameter` verfahren. Bei
  `ohneLaufzeitDatenbank()` je Sprache `baueKoranPfad(sprache)` vollständig vorrendern, sonst nur die erste Einheit. Dazu ein
  Unit- bzw. Integrationsfall: Im Beispielmodus kommen 2 × 40 Parameter, und jeder Verzeichnis-Hash entspricht dem
  Paket-Hash. Danach Live-Abruf aller 80 Adressen.
- Wurzeltabelle: nur Mensch, LM-31; danach Paket „Wurzeltabelle freigeben“ (wie im Erstprotokoll).
- `audio-stimmen`: klein, die Beleg-Spalte in ABNAHME auf die tatsächlichen Tests umstellen (wie im Erstprotokoll).
- Nach dem Verbinden der Datenbank (GO-LIVE): `pnpm lernapp:koran-sichtbar --basis https://igmg-wetzlarer.vercel.app`.
- Bedeutungen: nur Mensch, LM-13.

## 3. Z-L10 Religion-Prüfung

**Urteil: herabgestuft – neuer Status: teilweise** (Erstprüfer: erfüllt)

**Schwelle (ABNAHME.md:31, vollständig):** `religion-pruefung.mjs` 0 Befunde; Wächter 0 (Formel-Lexikon nur mit
`religionsbezug`, Koran- und Hadith-N-Gramm ≥ 4); **Alltagsformeln nur aus der Liste mit zwei Freigaben**; 0 sichtbare
Sprachkurs-Einträge mit `religionsbezug` ohne zwei Freigaben, auch bei `lernapp_ungeprueft` an.

**Bestätigt:**

- `religion-pruefung.mjs` Exit 0. Die 384 Wächter-Dateien sind 382 getrackte Dateien unter `sprache/`, `uebersetzung/` und
  `aussprache/` plus 2 Nachrichtendateien.
- `lernapp:pruefen`: `religion 0/0/0`, `religionsbezug 0/3/82`. Die 3 Mensch-Treffer [R-06] liegen alle in `tr.b1.e16`
  (`mantar`, `s0015`, `s0103`). Beide e16-Dateien sind `entwurf`, live ist e16 in keinem der 6 Verzeichnisse.
- In den Inhaltsdateien gibt es 0-mal das Feld `religionsbezug` (weder `true` noch `false`).
- `sprachSichtbarkeit` (`freigabe.ts:173–184`) für jeden Eintrag (`paket/bauen.ts:108–113`, `:210–211`). Integration
  `lernapp-pakete.test.ts:328–365` grün: religiöse Prüfung plus Administration → unsichtbar, zweite religiöse Prüfung →
  sichtbar, ohne `stimme`.
- Schalter live an: 222/222 Pakete mit `hinweis: true`.
- Live gegengeprüft mit dem Wächter des Projekts selbst (statt Stichwortlisten): 160.904 eindeutige Zeichenketten aus 222
  Paketen, 0 Text-Treffer, 0 4-Gramme.
- Eigene arabische Begriffssuche (normalisiert, mit Klitika): nur Fehltreffer. Gefunden wurden baʿīd „weit“, jāmiʿa
  „Universität“, rubʿ „Viertel“, rabīʿ „Frühling“, āla „Automat“, ʿalaykum in „ihr müsst“, salāma „Sicherheit“, lajna
  „Ausschuss“, ḥadīth „modern“.
- Den Salām-Gruß (F-ar-01, mit oder ohne Artikel, auch die Erwiderung) habe ich gezielt gesucht: **0** in 931.358
  Repository-Zeichenketten und 0 in den Live-Paketen.

**Widerlegt bzw. nicht abgedeckt:**

1. **„Alltagsformeln nur aus der Liste mit zwei Freigaben“ ist technisch nicht gesichert, und das harte Netz hat ein
   nachweisbares Loch.**
   - (a) Listenstatus: `formeln.status` wird nur im Schema gelesen (`inhalt/schema.ts:878–879`); für `formelliste` gibt es
     keinen Freigabeweg (`RELIGIOESE_BAUSTEINE`, `freigabe.ts:242`). Das hatte der Erstprüfer bereits; bestätigt.
   - (b) **Neu:** Der Prüfer `religionsbezug` überspringt **alle 17 arabischen Formeln** der Liste (`pruefer/religionsbezug.ts:100–101`:
     `if (f.sprache !== 'ar')`). Nur F-de und F-tr werden Kandidaten, und auch die nur als menschlich_klaeren. Der Kopf der
     Datei (`:14–17`) verweist für den harten Teil auf das Formel-Lexikon des Wächters.
   - (c) **Neu:** Das Lexikon des Wächters fängt mehrere Formeln der Liste nicht. Probe mit `lexikonTreffer` aus
     `waechter/kern.mjs`, Index und Lexikon aus `web/daten/tanzil`:
     - **kein Treffer:** F-ar-01 (Salām-Gruß mit Artikel und Erwiderung), F-ar-12 (ʿĪd-Gruß), F-ar-13 (Ramaḍān-Gruß), F-ar-14
       (Ǧumʿa-Gruß).
     - **Treffer:** nur die unbestimmte Koranform des Grußes. Der Lexikon-Eintrag „Friedensgruß“ (6:54) erlaubt vor dem ersten
       Wort nur die Vorsilben aus `VORSILBE` (`kern.mjs:314`), den Artikel nicht.
     - Die Formeln mit dem Gottesnamen (F-ar-09, -10, -16, -17) treffen über den Eintrag „Gottesname“.
     - Lateinschrift ohne Treffer: tr. „Aleyküm selam“, „Hamdolsun“, „Hayırlı Cumalar“, „Kandiliniz mübarek olsun“,
       „Kurban Bayramı“; de. „Opferfest“, „Zuckerfest“. Diese melden aber F-tr bzw. R-Kandidaten als menschlich_klaeren,
       nicht blockierend.
   - **Folge:** Ein arabischer Sprachkurs-Satz mit dem Salām-Gruß ohne Kennzeichen besteht alle blockierenden Prüfungen.
     - Er wird als `automatisch_geprueft` importiert und erscheint bei eingeschaltetem `lernapp_ungeprueft` mit Hinweis,
       ohne eine religiöse Freigabe.
     - Er würde sogar vertont: `audio/liste.ts:60` schließt nur Lexikon-Treffer und gekennzeichnete Texte aus.
     - Das widerspricht KERN §2.1 Nr. 1, §2.3 „Formelliste“ und §2.2 Nr. 8.
     - Heute ohne Wirkung (0 Vorkommen, siehe oben). Die arabischen B1-Inhalte entstehen aber gerade
       (`.claude/worktrees/inhalte-a1`); dort sichert nur das Lektorat ab.
2. **Ein Live-Beleg des Erstprotokolls ist leer.** „101.791 Einträge, 0 mit Feld `religionsbezug`“ beweist nichts: Das
   Paketformat schreibt das Feld nie (`paket/bauen.ts:214–224`, `herkunft` mit `text`, `sprache`, `quelle`, `lizenz`,
   `namensnennung`, `stimme`, `hinweis`). Tragfähig sind nur die Begriffssuche und der Wächter-Lauf über die Live-Pakete (oben).
3. Das arabische Lexikon ist unvollständig gegenüber KERN §3 a (Vers, Hadith, Bittgebet): bestätigt (Erstprüfer Lücke 2).

**Zusätzliche Lücken:** Nr. 1 (b) und (c) und Nr. 2 sind neu. Die Umgehung über die Administration (§1 Nr. 2) gilt auch für
Einträge mit `religionsbezug`.

**Nacharbeit (klein, Code; vor dem Abschluss von B1 ar):**

- `web/src/lib/lernapp/inhalt/pruefer/religionsbezug.ts:100–108`:
  - F-ar-Einträge nicht überspringen, sondern wie die R-Kandidaten über die Umschrift-Muster (`umschrift(...)`, `:69–87`) als
    Kandidaten führen.
  - F-Treffer ohne Kennzeichen blockierend melden, solange `formeln.status === 'gesperrt'`, mit Kennzeichen menschlich_klaeren.
- `web/src/lib/lernapp/waechter/kern.mjs`:
  - Für den Eintrag „Friedensgruß“ den Artikel vor dem ersten Wort und die umgekehrte Reihenfolge (Erwiderung) zulassen.
  - Verweise für ʿĪd-, Ramaḍān- und Ǧumʿa-Gruß als `Sure:Vers:Wort` aus Tanzil ergänzen; kein Agent schreibt dabei Wortlaut.
  - Positivproben als Codepunkte in `tests/unit/lernapp/religion-waechter.test.ts`.
- Paketbau: Einträge mit F-Kandidat verbergen, solange die Liste nicht freigegeben ist. `formelliste` (Hash = SHA-256 von
  `formeln`) in `RELIGIOESE_BAUSTEINE` aufnehmen. Integrationsfall „Liste gesperrt → Formel unsichtbar trotz zwei
  Eintragsfreigaben“ (wie im Erstprotokoll).
- Bis dahin (Orchestrator): Die arabischen B1-Dateien vor der Freigabe zusätzlich auf F-ar-01/-12/-13/-14 durchsuchen, wie in
  dieser Prüfung (`…/scratchpad/c-relg/gruss.py`, `ar-suche.py`).
- Beleg-Spalte in ABNAHME: statt „0 Felder `religionsbezug`“ den Wächter-Lauf über die Live-Pakete eintragen
  (`…/scratchpad/c-relg/waechter-live.mjs`, gern als Werkzeug unter `_lernapp/werkzeuge/`).
- Inhalt der Liste und des Lexikons: nur Mensch, LM-09.

## 4. Z-L21 (Teil Religion): 0 Audio zu `religionsbezug`, Wissenskurs und Koran-Pfad

**Urteil: bestätigt – Status: erfüllt**

**Eigene Belege:**

- Code:
  - `paket/bauen.ts:213` (kein Clip bei `religionsbezug`), `queries/lernapp/pakete.ts:267` (Clips nur für Texte ohne
    `religionsbezug`).
  - `paket/wissen.ts:42–46, :50` (`hatAudio` → Lektion ungültig).
  - Koran-Paket ohne Audio-Feld (nur `zeit` aus geprüften Wortzeiten aktiver Rezitationen).
  - Audio-Route nur für Sprachkurs-Schlüssel (`paket/buendel.ts:192–198`).
- Tests grün (selbst ausgeführt):
  - Unit `audio-kette` :80 („nie vertont: Religionsbezug … und Wächter-Treffer“), :111 („Wissen und Koran-Pfad sind keine
    Quelle“), :448.
  - Unit `aufgaben-wissen` :364.
  - Integration `lernapp-audio` :135, `lernapp-verwaltung` (Ausschnitt :520–525: `nichtVertonbar`, Wissensschlüssel
    `nichtGefunden`, nicht im Studio), `lernapp-pakete` :361–363, `lernapp-koran` :205.
  - `lernapp:pruefen` `audio 0/0/0`.
- Live:
  - 158 Einträge mit Stimme, alle `test:ton` (synthetische Töne des Testkurses). Davon 62 aus `test:lernapp-testkurs`; die
    übrigen sind Einträge des echten Kurses mit gleichem Text (z. B. „Buch“, „Brot“), deren Text-Hash den Testton trifft.
  - 72 Audio-Angaben in den Verzeichnissen, aber nur **3 verschiedene** Bündel (`de|tr|ar.a1.e01`). Die „72 Audio-Bündel“ des
    Erstprotokolls sind Verweise, keine Bündel.
  - 0 Schlüssel `islam.*` oder `koran.*`.
  - `/lern-app/audio/islam/x.lpa`, `/koran/x.lpa` und `/ar/x.lpa` → 404; `/tr/tr.a1.e01-…lpa` → 206.
  - Koran-Pakete e01 ohne `zeit`.

**Zusätzliche Lücke (Risiko, keine Herabstufung):** Ein nicht gekennzeichneter Salām-Gruß würde vertont (§3 Nr. 1, Folge).
Die Schwelle gilt formal für gekennzeichnete Einträge, deshalb kein Verstoß; die Behebung erfolgt mit der Nacharbeit zu Z-L10.
Testname `audio-stimmen` fehlt (wie Z-L03).

**Nacharbeit:** über Z-L10 Nr. 1; Beleg-Spalte in ABNAHME (wie im Erstprotokoll).

## 5. Nicht geprüft

- Inhaltliche Richtigkeit der 2.124 Aussagen und 1.041 Quizfragen (nur Mensch, LM-03). Stichprobe der Zitatzeichen: 4
  Aussagen mit Anführungszeichen nahe „Vers/Koran/Hadith“, alle mit Fachbegriffen oder „siehe Verweis“, kein Zitat von
  Wortlaut. Das ist kein Beweis.
- Ob die R-Kandidaten (R-04, R-06) einen Ramaḍān- oder ʿĪd-Gruß tatsächlich als menschlich_klaeren melden: Das hätte eine
  Testdatei im Repository verlangt.
- `lernapp-schalter.test.ts` habe ich nicht selbst ausgeführt (laut Erstprotokoll grün).
- Bau, E2E und die Produktionsdatenbank (gibt es nicht, siehe §0).

## 6. Übersicht

| Z | Erstprüfer | Gegenprüfung | Kern der Begründung |
|---|---|---|---|
| Z-L02 | erfüllt | **teilweise** | Menge 26/28 (92,9 %) bzw. 146/155 Lektionen (94,2 %) < Ziel − 5 %, Grund LM-04 → AUSNAHME-fähig. Administration kann sich `religioese_pruefung` selbst geben und zählt dann (`freigabe-zwei.test.ts:150–152`, `schutzrollen.ts:53–62`, N4-Test :214). Live-Beleg strukturell leer (`pakete.ts:407`), kein Auslieferungsweg für Wissen. Übrige Teile bestätigt. |
| Z-L03 | erfüllt | erfüllt (bestätigt) | 0/936 Bedeutungen, kein Feld für Bedeutung, Wurzel oder Audio, Wortzeiten nur `geprueft` + `aktiv`; Live-Tabelle leer, weil die Live-DB ohne Schreiber entsteht. 404 ab e02: Ursache `koran.ts:269–280`, nicht der Cache. |
| Z-L10 | erfüllt | **teilweise** | Formeln nur aus der freigegebenen Liste nicht gesichert: Status ungenutzt, F-ar im Prüfer übersprungen (`religionsbezug.ts:101`), Wächter fängt F-ar-01/-12/-13/-14 nicht. Heute 0 Vorkommen (Repo und live, Wächter-Lauf über 222 Pakete: 0). Live-Beleg „0 Feld religionsbezug“ ist leer. |
| Z-L21 (Teil) | erfüllt | erfüllt (bestätigt) | 0 Audio zu Religion, Wissen und Koran; live nur 3 Testton-Bündel; Restrisiko über Z-L10. |
