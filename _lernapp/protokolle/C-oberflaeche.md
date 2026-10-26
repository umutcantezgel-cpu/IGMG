# Stufe C – Gruppe „Oberfläche: Kinderschutz, Bewegung, Sprachen und RTL“ (L8-05)

| | |
|---|---|
| Datum | 26.10.2026 |
| Stand | `d8ec7d5a` (Branch `claude/trusting-lovelace-6nfolz`, Haupt-Checkout `/home/user/IGMG`) |
| Prüfer | Stufe C, Gruppe oberflaeche |
| Kriterien | Z-L09, Z-L11, Z-L13 |
| Umfang | Sprachkurse A1–B1 in 6 Richtungen (L3-E16); B2/C1 offener Ausbau, nicht Gegenstand |
| Nicht im Stand | N2 (Freigabe-Härtung), N3 (Auslieferung Wissen/Koran), N4 (Kleinkram) in eigenen Arbeitsbäumen. Laut `PRUEFPUNKT.md` Z. 62–76 behebt keines dieser Pakete einen Befund dieser Gruppe |
| Live | `https://igmg-wetzlarer.vercel.app`, nur GET, 26.10.2026 um 01:55 UTC. Die Seiten tragen `data-bau="d8ec7d5a351c"`, Live entspricht also dem geprüften Stand |
| Schrift | Diese Datei enthält keine arabische Schrift und keine religiösen Texte (KI-Regel 2, ADR 0040, `_lernapp/KERN.md` §2). Arabische Fundstellen sind nur als Zähler oder als `[ar]` wiedergegeben |

## 0. Vorgehen, Befehle, Grenzen

- Ich habe nur gelesen und geprüft. Geschrieben habe ich nur diese Datei. Kein git add, commit, stash, checkout, reset oder
  merge. `git status` zeigte vorher und nachher nur die fremden, nicht verfolgten Protokolle `C-technik*.md`. Die
  Arbeitsbäume unter `.claude/worktrees/` habe ich nicht angefasst.
- Umgebung: Node 24.21.0 aus dem Scratchpad. `TMPDIR` war `scratchpad/tmp-c-oberflaeche`, über den Symlink `/tmp/c-obf`
  (gleicher Grund wie bei der Gruppe religion: der IPC-Pfad von `tsx` darf höchstens 108 Zeichen lang sein). Umgebungsfehler
  gab es keine.
- Eigene Rohdaten liegen unter `scratchpad/c-oberflaeche/`: `unit1.log`, `integration1.log`, `sprachen.log`,
  `links_spenden.txt`, `links_genau.txt`, `live_*.html`, `web_*.html`, `css_*.css` und `skripte/*.py`.
- Nicht ausgeführt, weil das Briefing es verbietet: Bau, E2E, Server, MCP-Werkzeuge. E2E-Ergebnisse stammen aus den Logs des
  Orchestrators (Pfade jeweils angegeben). Ich habe sie gelesen und ihre Abdeckung gegen den Quelltext der Specs geprüft.

| # | Befehl (in `web/`) | Ergebnis |
|---|---|---|
| U1 | `pnpm exec vitest run --project unit --reporter=verbose` mit 18 Dateien: `bewegung-regeln`, `lernapp/{rtl-regeln, sanfte-texte, sprachen-pruefen, oberflaeche, platz-regeln, bewegung-bausteine, spielelemente, gruppe-regeln, schreibabgabe, schreibabgabe-frage, melden, serie, abzeichen}`, `rechte/{matrix, matrix-negativ, gruppen, gruppen-wahrheitstafel}` | rc 0, **18/18 Dateien, 197/197 grün**, 7,5 s |
| I1 | `pnpm exec vitest run --project integration --reporter=verbose` mit 9 Dateien: `lernapp-gruppe` 20, `lernapp-schreiben` 22, `lernapp-einwilligung` 9, `lernapp-sync` 27, `lernapp-verwaltung` 26, `mein-bereich-lernen` 14, `push` 9, `rechte-matrix-mitglieder` 495, `verwaltung/rechte-matrix-lernapp` 146 | rc 0, **9/9 Dateien, 768/768 grün**, 234,7 s |
| S1 | `pnpm sprachen:pruefen` | rc 0: „Lern-App 868 Schlüssel in de, tr, ar (1730 als KI-Entwurf vermerkt); Prüfoberfläche Sprache 96 Schlüssel in de, tr, ar“. Website: 3241 Schlüssel in de, tr, en |
| G1 | `skripte/links_spenden.py` und `skripte/links_genau.py` über `web/inhalte/lernapp/**/*.json` (435 Dateien, ohne `schemas/`) | siehe Z-L09 (Links, Spenden) |
| L1 | curl GET auf `/lern-app/{ar,de,tr}`, `/lern-app/ar/{einstellungen,fortschritt,quellen}`, `/`, `/tr`, `/en`, `/ar`, `/fa`, `/quran/1`, `/tr/kuran/1`, `/hadith/auswahl`, `/elifbe/buchstaben`, `/en/arabic-alphabet`, `/lern-app`, `/lern-app/en`, `/lern-app/fa`, `/tr/lern-app`, `/lern-app/de/gruppe`, `/api/lernapp/{gruppe,schreiben}`. Dazu die 4 CSS-Dateien von `/quran/1` | Einzelwerte bei Z-L09 und Z-L13 |

---

## 1. Z-L09 Kinderschutz

**Schwelle (kurz):** Keine Freitext-Kommunikation zwischen Personen. Bestenliste für Konten unter 16 im Code gesperrt und
für alle anderen nur mit eigener Zustimmung. Schreibabgaben gehen nur an die Lehrkraft der eigenen Gruppe. Lehrkräfte sehen
nur die eigene Gruppe, Eltern nur das eigene Kind. Meldungen ohne Konto und von Kindern kommen ohne Antwort an. Kinderkonten
gleichen nur mit Einwilligung der Eltern ab. Push für Kinder nur mit `push_kind`. Bildkarten ohne Fotos und Gesichter.
Lektionen ohne externe Links und ohne Spendenaufrufe. Belege: Integration Bestenliste und Gruppen, Rechte-Matrix, E2E
gruppe und spielelemente.

**Status: teilweise.** Code, Unit- und Integrationstests auf `d8ec7d5a` und die Inhaltsdurchsicht erfüllen die Schwelle.
Es fehlt der E2E-Beleg `gruppe.spec.ts` (Kind ohne Bestenliste, Schreibabgabe) für den geprüften Stand: In allen Läufen
der Stufe C wurde er übersprungen.

**Belege**

- **Keine Freitext-Kommunikation:**
  - Das einzige `<textarea>` unter `src/components/lernapp` und `src/app/lern-app` ist die Schreibabgabe
    (`components/lernapp/schreiben/Schreiben.tsx:95`). Chat oder Nachrichten gibt es in der Lern-App nicht (grep, die
    Treffer waren nur „Wortschatz“).
  - Kommentare der Lehrkraft an Kinder sind hart gesperrt (`lib/lernapp/schreiben/kinderschutz.ts:3–40`,
    `schreiben/dienst.ts:464` wirft `KommentarGesperrt`).
  - In I1 grün: „Kind (S-L2 M-1, D-L16 offen): Dienst und Action lehnen den Kommentar ab“ und „Kind, Altkommentar: ein
    früher gespeicherter Kommentar erreicht das Kind nicht“.
  - Hinweis: Lernende ab 16 können zu ihrer Abgabe einen Kommentar der Lehrkraft bekommen (einseitig, verschlüsselt, ohne
    Antwortweg). Das liegt außerhalb des Kinderschutzes nach KERN §5. Ich werte es nicht als Lücke.
- **Bestenliste im Code ab 16, nur mit Zustimmung:**
  - `lib/lernapp/gruppe/regeln.ts:41–45` (`abSechzehn`: `istKind` → nie; mit Lerndatensatz erst ab `sechzehnAm`),
    `:72–74` (`erscheint` = ab 16 und Zustimmung und Einwilligung) und `:81–83` (gegenseitiger Kreis).
  - `gruppe/dienst.ts:161–188`: `platzierungen` filtert Konten unter 16 vor jeder weiteren Abfrage heraus.
  - `gruppe/dienst.ts:194–202` (`blickAufBestenlisten`) und `:776–779` (`stimmeZu` wirft unter 16 `KeinGruppenZugang`).
  - Unit (U1) grün: „Eigenschaft: kein Kinderkonto erscheint je, egal welche Zustimmung, Einwilligung oder XP“.
  - Integration (I1) grün: „Kind: nie eine Bestenliste, nie eine Zustimmung – auch mit untergeschobener Zustimmung“, „Ab 16
    ohne Einwilligung: keine Liste, auch mit Zustimmung in der Datenbank“, „Zustimmung zurücknehmen blendet sofort aus“,
    „ohne `lernapp_rangliste` keine Bestenliste und kein Zustimmen“, „Familie: Kinder unter 16 erscheinen nie, sehen sie nie“.
- **Schreibabgaben nur an die Lehrkraft der eigenen Gruppe:** I1 `lernapp-schreiben` 22/22. Grün sind unter anderem
  „nicht zugewiesen, fremde Gruppe, ohne Einwilligung → abgelehnt“, „fremde Lehrkraft, Aufsicht, Eltern, Kind, Lernende und
  Administration lesen nie“ und „Kind: nur mit der Einwilligung der Eltern“. Dazu die Wahrheitstafel in U1
  `schreibabgabe.test.ts`. In `rechte-matrix-mitglieder` ist `lernappAbgabeZurueckgeben` nur für „Lehrkraft (mit zweitem
  Faktor)“ zugelassen, alle anderen Rollen werden abgewiesen.
- **Lehrkräfte nur eigene Gruppe, Eltern nur eigenes Kind:**
  - I1 `lernapp-gruppe`: „Zuweisungen: Lehrkraft A …; fremde Lehrkraft, Aufsicht, Lernende und Eltern nicht“, „Stand der
    Gruppe: fremde Gruppe und Aufsicht nie“, „Lernwoche nur für das eigene, bestätigte Kind; nie für fremde Kinder“.
  - I1 `mein-bereich-lernen`: „Eltern sehen nur eigene Kinder“.
  - Rechte-Matrix: `rechte-matrix-mitglieder` 495 und `verwaltung/rechte-matrix-lernapp` 146 grün.
  - Code: `gruppe/dienst.ts:819ff.` verlangt einen sorgeberechtigten, bestätigten Bezug.
- **Meldungen ohne Konto und von Kindern ohne Antwort:**
  - `app/api/lernapp/meldung/route.ts:71–79`: Die eigene Antwort wird nur bei `konto && hatZugang && !konto.istKind`
    gespeichert, sonst `null`.
  - Der Client sendet sie nie (`MeldenDialog.tsx`; U1 `melden.test.tsx`: „sendet nur Kurs, Aufgabe, Kategorie und ALTCHA
    (nie eine Antwort)“).
  - I1 `lernapp-verwaltung`: „ohne Konto: nur Aufgabe und Kategorie (Antwort verworfen), ALTCHA einmalig, keine Cookies“.
  - E2E `melden.spec.ts:26` desktop grün auf `1209cb29` (`tmp-n1/tor/e2e4.log`).
- **Abgleich von Kinderkonten nur mit Elterneinwilligung:**
  - `lib/lernapp/sync/server.ts:84–98` (Lage) und `:109–156`: Für Kinder zählen nur Einwilligungen sorgeberechtigter
    Eltern mit bestätigtem Bezug.
  - I1 `lernapp-sync`: „Kind unter 16: ohne Einwilligung der Eltern abgelehnt – auch mit eigener; mit Einwilligung
    sorgeberechtigter Eltern erlaubt“.
  - I1 `lernapp-einwilligung`: „unter 16: weder Erteilen noch Widerruf durch das Kind – die Eltern entscheiden“.
- **Push für Kinder nur mit `push_kind`:**
  - Die Lern-App selbst hat keinen Push-Weg. Ein grep nach `pushManager|/api/push|push_lernapp|erinnerung` in
    `components/lernapp`, `app/lern-app` und `lib/lernapp` findet nichts. Der Schalter `push_lernapp` steht nur in
    `funktionen-regeln.ts`, `startklar` und `validierung`.
  - Der allgemeine Push-Weg sperrt Kinder: `app/api/push/abo/route.ts:57` und `lib/push/abo.ts:119–133` (`kindDarfPush`),
    ebenso `push/gruppe.ts:115` und `push/ankuendigung.ts:104`.
  - I1 `push`: „Kinderkonto ohne Elterneinwilligung ‚Push für das Kind‘ → 403, mit Einwilligung → 200“.
- **Bildkarten ohne Fotos und Gesichter (Durchsicht der Motivliste):**
  - `web/inhalte/lernapp/symbole/symbole.json` enthält 63 Motive. Alle stammen aus `lucide:*@1.55.0` (ISC) und bestehen nur
    aus Vektorelementen (path 194, circle 19, rect 6, line 4, polyline 2), Rasterbilder gibt es keine.
  - Alles sind Gegenstände und Natur, zum Beispiel Haus, Buch, Apfel, Bus, Sonne, Baum, Uhr, Laptop und Briefkasten. Keine
    Menschen, Tiere oder Gesichter.
  - 0 von 63 sind von der Redaktion freigegeben (LM-34). Der Prüfer `pruefer/symbole.ts:18–20` blockiert unfreigegebene
    Motive außerhalb des Testkurses.
  - In echten Inhalten nutzen 0 Lemmata ein `symbol`, und es gibt 0 Aufgaben vom Typ `bild_wort` (Zählung über
    `inhalte/lernapp/sprache/**`). Sichtbar ist damit kein ungeprüftes Bild.
  - Die einzigen PNGs unter `public/lern-app` sind die App-Symbole (`symbole/symbol-*.png`).
- **Keine externen Links und keine Spendenaufrufe in Lektionen (G1):**
  - Sichtbare Textfelder (ohne `namensnennung`, `schluessel`, `quelle`, `lizenz`, `format`) enthalten 21 URL-artige Treffer:
    - 9 sind die reservierte Domain `example.org`, nämlich der Satz `tr.b1.e02` s0260 mit `personel@example.org` und seine
      Übersetzungen. Der Leitfaden erlaubt das (`rahmen/leitfaden.json` grundsaetze[7]).
    - 12 sind Schlüssel, die nur so aussehen (`de.a2.e10.app`, `de.b1.e06.info`, `tr.a1.e01.de-konj`, `tr.b1.e02.net`).
  - Kein `href` nach außen in Spieler oder Aufgaben (grep `href=…https?:`). `InhaltText` verlinkt nichts automatisch.
  - Spendenwörter treffen im Sprachkurs Wortfelder wie Ehrenamt, Verein, Kleiderkammer und Kermes (`de.b1.e06` 17 Sätze,
    `tr.b1.e12` 15, `de.a2.e08` 11; in `tr.b1.e05` nur „bağışıklık“ = Immunsystem). Im Wissenskurs trifft der
    Fiqh-Begriff ṣadaqa (`islam.aufbau.e06` u. a.). Ich habe die Sätze gelesen: Es sind Alltagsszenen oder Lehrinhalte,
    **kein Aufruf zu Spenden oder zur Mitgliedschaft in der Gemeinde**. „igmg“ trifft nur in `format`-Feldern (431).
    Spendenaufrufe in den UI-Texten (`messages/lernapp/de|tr.json`): 0.
- **Live (L1):** `/lern-app/de/gruppe` → 404 und `/api/lernapp/gruppe` → 404 (Schalter `lernapp_gruppen` in der Produktion
  aus, wie KERN §6 vorsieht). `/api/lernapp/schreiben` (GET) → 404.
- **E2E (Orchestrator):** `spielelemente.spec.ts:25` und `:102` grün auf telefon und desktop auf `bb873e8e`
  (`tmp-n1/tor/e2e2.log`) und `0f2d7c31` (`e2e3.log`).

**Lücken**

1. **`gruppe.spec.ts` lief auf dem geprüften Stand nicht.** Die Specs `:155` (Kind lernt ohne Bestenliste) und `:317`
   (Schreibabgabe und Rückmeldung) stehen in allen Stufe-C-Läufen auf „-“ (übersprungen): `tor-stufe-c/e2e2.log`,
   `tmp-n1/tor/e2e2.log`, `e2e3.log`, `tmp-n3/e2e.log`.
   - Ursache: Die Skripte setzen nur `FUNKTION_LERNAPP{,_SYNC,_SPRECHEN,_MELDUNGEN}=an` (`tor-stufe-c-e2e.sh:12`,
     `tor-stufe-c.sh:41`). Die Specs brauchen zusätzlich `FUNKTION_LERNAPP_GRUPPEN` und `_RANGLISTE`
     (`gruppe.spec.ts:156–160`, `:322`; `tests/e2e/LIESMICH.md:56–57`).
   - Der letzte grüne Lauf ist `SL2-A-gegen-1/e2e.log` vom 23.10. um 09:49 (2/2, damals Zeilen `:110` und `:271`). Danach
     hat sich die Spec geändert: `d019394a` (Einwilligung der Eltern im Ablauf) und `bb873e8e` (N1, Testkurs-Schlüssel).
2. Hinweis, keine Schwellenlücke: Der Fall „angemeldetes Kind schickt eine Antwort mit → verworfen“ ist im Code umgesetzt
   (`route.ts:74`), hat aber keinen eigenen Integrationstest. Geprüft sind nur „ohne Konto“ und „ab 16“
   (`lernapp-verwaltung.test.ts:351`).

**Nacharbeit**

1. Den Produktionsbau einmal mit `FUNKTION_LERNAPP_SYNC=an FUNKTION_LERNAPP_GRUPPEN=an FUNKTION_LERNAPP_RANGLISTE=an` (beim
   Bau und beim Lauf) und `playwright test tests/e2e/lernapp/gruppe.spec.ts --project desktop` laufen lassen. Das Log als
   Beleg ablegen. Gleich danach die drei Zeilen dauerhaft in `tor-stufe-c-e2e.sh` aufnehmen.
2. In `tests/integration/lernapp-verwaltung.test.ts` einen Fall „angemeldetes Kinderkonto mit `antwort` → 201, gespeicherte
   `antwort` ist `null`“ ergänzen.
3. Freigabe der Motivliste: nur Mensch, LM-34 (Redaktion). Bis dahin erscheint keine Bildkarte.

---

## 2. Z-L11 Bewegung

**Schwelle (kurz):** B-28…B-35 stehen im Register (KERN §10), jede Bewegung mit reduzierter Variante. Der Regeltest
`bewegung-regeln` ist grün für `src/components/lernapp/**`. Keine hochzählenden Zahlen.

**Status: erfüllt**

**Belege**

- **Register:** `_lernapp/KERN.md` §10 nennt B-28 bis B-35 je mit Datei und reduzierter Variante. Den Test stützt
  `tests/unit/bewegung-regeln.test.ts:71–80` (REGISTER mit acht IDs). Alle acht Dateien gibt es. Damit greift der
  Ausweg `if (e.paket && !existsSync(pfad)) return` bei B-35 nicht, `sprechen/Pegel.tsx` existiert.
- **U1 `bewegung-regeln` 25/25 grün.** Darin:
  - „B-28 … B-35: Bewegung nur in CSS, mit reduzierter Variante“ (10 Fälle)
  - „keine eigenen @keyframes und keine Bewegung per Skript in components/lernapp“
  - „@keyframes nur aus dem Register“
  - „keine hochzählenden Zahlen“ (6 Bausteine ohne Zeitgeber und Bildschleife, keine Intervall-Uhr außer `sprechen/`,
    keine `@property`-Zahlen und keine CSS-Zähler, Gegenprobe)
- **U1 `bewegung-bausteine` 7/7 grün** (B-30, B-33, B-34, B-35). Dazu `spielelemente.test.tsx` „Endwert sofort als Text“.
- **Stichprobe Quelltext:**
  - `Fortschrittsleiste.tsx:19` hat `transition-transform … motion-reduce:transition-none`.
  - `sprechen/Pegel.tsx:13` und `:20`: Bei reduzierter Bewegung wird der Balken versteckt, der Text „Aufnahme läuft“
    steht immer da.
  - `globals.css:820ff.`: Der reduzierte Block stellt `.linie-zeichnet`, `.stern-fuellt` und `.tritt-auf` auf
    `animation: none`.
  - Übergänge sonst nur als Farbe (`transition-colors` in Auswahl, Paare, Optionsgruppe, Wahlgruppe; KursKarte nur beim
    Hover-Rahmen).
- **E2E:** `spielelemente.spec.ts` (Fortschritt, Serie, Abzeichen, Ergebnis statisch) grün auf telefon und desktop
  (`tmp-n1/tor/e2e2.log`, `e2e3.log`).

**Lücken:** keine an der Schwelle.

Hinweis: `aufgaben/LesenFragen.tsx:63` (Glossar-Fenster im Lesetext, L4-03 `d49df17d`) blendet mit Deckkraft und
`scale-96 → scale-100` ein. Eine reduzierte Variante gibt es (`motion-reduce:scale-100`), einen Eintrag im Register
KERN §10 nicht. Eine Prüfung mit `reducedMotion: 'reduce'` im Browser gibt es nicht. Die Regeltests prüfen den reduzierten
CSS-Block statisch.

**Nacharbeit (Pflege, nicht schwellenrelevant):** LesenFragen als „wie B-14/B-34“ in KERN §10 aufnehmen und in `REGISTER`
von `bewegung-regeln.test.ts` ergänzen, zum Beispiel `{ id: 'B-34 (Glossar)', datei: 'aufgaben/LesenFragen.tsx',
bewegung: /scale-96/, reduziert: /motion-reduce:scale-100/ }`.

---

## 3. Z-L13 Sprachen und RTL

**Schwelle (kurz):**

- `sprachen:pruefen` grün (de ⊆ tr, de ⊆ ar, gleiche Platzhalter)
- `rtl-regeln` grün
- `ar`: `html[dir=rtl]`, kein Überlauf bei 390 px, Harakat nicht abgeschnitten
- `sanfte-texte` grün
- Die Website bleibt de/tr/en
- Koran, Elifbe und Hadith sind nach der RTL-Eingrenzung unverändert

**Status: erfüllt**

**Belege**

- **`sprachen:pruefen` (S1):** rc 0, Lern-App 868 Schlüssel in de, tr, ar.
  - `scripts/sprachen-pruefen.mjs:151–201` prüft fehlende und überzählige Schlüssel, leere Werte, gleiche Platzhalter
    (`:172`) und Pluralkategorien.
  - U1 `sprachen-pruefen.test.ts` 5/5 grün, darunter „Platzhalter müssen gleich sein“ und „fehlender Schlüssel in ar oder
    tr … sind Befunde“.
- **`rtl-regeln`:** U1 4/4 grün. Der Test liest `components/lernapp` und `app/lern-app`
  (`rtl-regeln.test.ts`, ORDNER) und verbietet `ml-/mr-/pl-/pr-/left-/right-/text-left/text-right` sowie physische
  Stilwerte. Gerichtete Pfeile müssen eine `rtl:`-Variante haben.
- **`sanfte-texte`:** U1 4/4 grün (de, tr, ar ohne Verlust-, Schuld- oder Strafwörter; Gegenprobe).
- **`html[dir=rtl]` live (L1, 01:55 UTC):**
  - `/lern-app/ar` 200 mit `<html lang="ar" dir="rtl" data-oberflaeche="lernapp" data-bau="d8ec7d5a351c">`, ebenso
    `/lern-app/ar/einstellungen`, `/fortschritt` und `/quellen`.
  - `/lern-app/de` und `/lern-app/tr` 200 mit `dir="ltr"`.
  - Im Quelltext: `app/lern-app/[ui]/layout.tsx:72–74`.
- **Kein Überlauf bei 390 px (E2E des Orchestrators, Projekt `telefon` = 390 × 844, `playwright.config.ts:42`):**
  - `rahmen.spec.ts:67` „Oberfläche ar › Rauchtest … ohne waagrechten Überlauf“ grün. Die Spec prüft
    `scrollWidth − clientWidth = 0`, `lang` und `dir` (`:70`).
  - `rahmen.spec.ts:84` „Oberfläche ar › axe … Start, Einstellungen, Quellen, Gruppe, nicht gefunden“ grün, je Route mit
    Überlauf 0 (`:91`).
  - Beides grün in `tmp-n1/tor/e2e2.log` und `e2e3.log`, telefon und desktop.
  - Weitere ar-Läufe:
    - `typen-a.spec.ts:373` „Arabisch (RTL): alle Typen per Tippen“: telefon grün in `e2e3.log`; in `e2e2.log` noch rot
      wegen der Testkurs-Kollision, die N1 behoben hat.
    - `typen-a.spec.ts:367` (Tastatur): desktop grün in `e2e3.log`. Diese Spec prüft den Überlauf in `:347`.
    - `typen-b.spec.ts:380` „Oberfläche ar (RTL) … gespiegelt“: grün in `e2e2.log` und `e2e3.log`.
    - `lektion.spec.ts:91` „axe ar“: telefon und desktop grün auf `1209cb29` (`e2e4.log`).
  - Seit `1209cb29` hat sich nur wenig geändert, alles außerhalb von `components/lernapp` und Layout
    (`git diff --stat 1209cb29 d8ec7d5a -- web/src web/messages`: Quellenseite, Audio-Route, je 1 Textschlüssel).
- **Harakat nicht abgeschnitten:**
  - Kursinhalt in `ar` läuft über `InhaltText.tsx:8` (`font-arabic text-arabisch-1|3`). Die Tokens haben die
    Zeilenhöhen 2,3, 2,2 und 2,1 (`globals.css:121–126`).
  - In `components/lernapp` gibt es kein `truncate`, `line-clamp`, `text-ellipsis`, `leading-none` oder `leading-tight`.
    `overflow-hidden` steht nur an Fortschritts- und Pegelbalken (`Fortschrittsleiste.tsx:16`, `Pegel.tsx:20`,
    `HeuteInsel.tsx:111`, `GruppeInsel.tsx:167`). Bedienelemente haben nur `min-h-*`, keine festen Höhen.
  - Seit 17.10. unverändert: `InhaltText.tsx` (`536621a8`) und die `text-arabisch`-Tokens.
  - Sicht-Stichprobe: `scratchpad/l1/bilder/lernapp-ar-spieler-390.png` vom 20.10. Die Vokalzeichen der drei
    arabischen Optionen sind vollständig zu sehen, nichts ist abgeschnitten.
- **Website bleibt de/tr/en:**
  - `src/i18n/routing.ts:11` `locales: ['de', 'tr', 'en']`.
  - Live: `/` de, `/tr` tr, `/en` en (200). `/ar` 404, `/fa` 404.
  - Lern-App: `/lern-app/en` und `/lern-app` → 308 auf `/lern-app/de`, `/lern-app/fa` → 404.
- **Koran, Elifbe und Hadith nach der RTL-Eingrenzung unverändert:**
  - Die Regel `globals.css:475–478` `:is([lang='ar'],[dir='rtl']):not(:where([data-oberflaeche],[data-oberflaeche] *))`
    ist live in `css_0p313xcvohv81.css` von `/quran/1`.
  - Seit `bd3d8600` (17.10.) ist sie unverändert (`git log -G data-oberflaeche -- web/src/app/globals.css`: nur
    `b7cc3ad0` und `bd3d8600`).
  - Website-Seiten tragen kein `data-oberflaeche` (live 0 Treffer auf `/quran/1`, `/tr/kuran/1`, `/hadith/auswahl`,
    `/elifbe/buchstaben`, `/en/arabic-alphabet`). Die Negation trifft dort also nie. Mit `:where` bleibt die Spezifität
    bei (0,1,0) wie vorher. Für die Website gilt damit dieselbe Kaskade.
  - Arabische Elemente mit `lang="ar" dir="rtl"` sind live vorhanden: `/elifbe/buchstaben` 145, `/en/arabic-alphabet` 29,
    `/quran/1` 1 (Klasse `font-quran text-arabisch-1`).
  - Sichtvergleich: `_lernapp/belege/S1-S6-wurzel-layout-und-sw.md` §3.4 (16.10.) hat Schrift und Zeilenhöhe von 68
    arabischen Elementen auf `/quran/1`, `/elifbe/buchstaben/be`, `/hadith/bukhari/1`, `/` und `/elifbe` als „identisch
    (`diff` leer)“ gemessen. Gemessen wurde damals die Elementform. Die heutige Teilbaumform ist für Elemente ohne
    `data-oberflaeche`-Vorfahren gleichwertig (siehe oben). Eine erneute Messung mit der Teilbaumform habe ich nicht
    gesehen: nicht geprüft.

**Lücken:** keine an der Schwelle.

Hinweise:

- Für „Harakat nicht abgeschnitten“ gibt es keinen automatischen Test. Der Beleg ist Quelltext plus ein Bildschirmfoto
  vom 20.10. Die Bildschirmfotos für die Sichtabnahme (`rahmen.spec.ts:306`, nur mit `LERNAPP_BILDER`) wurden in Stufe C
  nicht erzeugt.
- 1730 Lern-App-Texte in tr und ar sind als KI-Entwurf vermerkt. Die Prüfung durch Muttersprachler ist LM-01 und kein Teil
  dieser Schwelle.

**Nacharbeit (empfohlen, nicht schwellenrelevant):**

1. In `typen-a.spec.ts` (ar, Harakat) eine Prüfung ergänzen, dass jedes `[lang=ar]`-Inhaltselement `scrollHeight ≤
   clientHeight + 1` hat und keinen Vorfahren mit `overflow: hidden` und fester Höhe.
2. Beim nächsten E2E-Lauf `LERNAPP_BILDER=1` setzen und die ar-Bildschirmfotos (390/1440) als Sichtbeleg ablegen.
3. Optional die Schrift-und-Zeilenhöhe-Messung aus S1 §3.4 einmal mit der Teilbaumform wiederholen.

---

## 4. Ergebnis

| Z | Status | Beleg kurz |
|---|---|---|
| Z-L09 | teilweise | Unit 197/197 und Integration 768/768 grün auf `d8ec7d5a` (Bestenliste ab 16 im Code `regeln.ts:41–74`, Gruppen- und Elternisolation, Schreibabgaben, Sync mit Elterneinwilligung, `push_kind`, Rechte-Matrix 641). Motivliste 63 Lucide-Gegenstände, 0 Fotos oder Gesichter, 0 freigegeben, 0 genutzt. Inhalte: 0 externe Links (nur `example.org`), 0 Spendenaufrufe. spielelemente E2E grün. **Lücke:** `gruppe.spec.ts` in Stufe C immer übersprungen (Schalter GRUPPEN/RANGLISTE fehlen), letzter grüner Lauf 23.10. auf älterer Fassung |
| Z-L11 | erfüllt | `bewegung-regeln` 25/25 (Register B-28…B-35 vollständig, nur CSS mit reduzierter Variante, keine @keyframes außerhalb des Registers, keine hochzählenden Zahlen), `bewegung-bausteine` 7/7. Hinweis: Glossar-Einblendung `LesenFragen.tsx:63` ohne Registereintrag (reduzierte Variante vorhanden) |
| Z-L13 | erfüllt | `sprachen:pruefen` rc 0 (868 Schlüssel de/tr/ar), `rtl-regeln` 4/4, `sanfte-texte` 4/4. Live `/lern-app/ar` mit `dir="rtl"` (Bau `d8ec7d5a`). 390 px ohne Überlauf in E2E `rahmen`/`typen-a`/`typen-b`/`lektion` (ar). Harakat: Zeilenhöhe ≥ 2,1, keine Abschneide-Klassen. Website de/tr/en (`/ar` 404). RTL-Regel live, seit 17.10. unverändert, Website ohne `data-oberflaeche`, S1-Messung 68 Elemente identisch |
