# Stufe C – Gegenprüfung der Gruppe „Oberfläche: Kinderschutz, Bewegung, Sprachen und RTL“ (L8-05)

| | |
|---|---|
| Datum | 26.10.2026, 02:02–02:20 UTC |
| Stand | `d8ec7d5a` (Code). Während der Prüfung kam `d7c80bb2` hinzu; der Commit enthält nur drei Protokolldateien (`git diff --stat d8ec7d5a HEAD`: nur `_lernapp/protokolle/*.md`), der Code ist also identisch |
| Gegenstand | `_lernapp/protokolle/C-oberflaeche.md` (Prüfer: Z-L09 teilweise, Z-L11 erfüllt, Z-L13 erfüllt) |
| Rolle | frischer, skeptischer Gegenprüfer; Ziel: jedes „erfüllt“ widerlegen, tragende Belege selbst reproduzieren |
| Live | `https://igmg-wetzlarer.vercel.app`, nur GET, 02:09 UTC, `data-bau="d8ec7d5a351c"` |
| N2–N4 | betreffen laut `PRUEFPUNKT.md` Z. 62–76 nur Z-L02/03/10/17/19/22 – keiner der Befunde unten wird durch sie behoben |
| Schrift | keine arabische Schrift, keine religiösen Texte (KI-Regel 2, ADR 0040, `_lernapp/KERN.md` §2) |

## 0. Eigene Läufe und Rohdaten

Umgebung: Node 24 aus dem Scratchpad, `TMPDIR=scratchpad/tmp-c-obf-gegen` (über den Symlink `/tmp/c-obfg`, IPC-Pfad
≤ 108 Zeichen). Rohdaten unter `scratchpad/c-obf-gegen/`. Geschrieben habe ich nur diese Datei. Kein git add, commit,
stash, checkout, reset oder merge. Die Arbeitsbäume unter `.claude/worktrees/` habe ich nicht angefasst. Bau, E2E, Server
und MCP-Werkzeuge habe ich nicht benutzt.

| # | Befehl (in `web/`) | Ergebnis |
|---|---|---|
| G-U | `vitest run --project unit` mit `bewegung-regeln`, `lernapp/{rtl-regeln, sanfte-texte, sprachen-pruefen, bewegung-bausteine, gruppe-regeln, melden, schreibabgabe, spielelemente}` | rc 0, 9/9 Dateien, **89/89 grün** (25 + 4 + 4 + 5 + 7 + 18 + 5 + 13 + 8), 6,1 s (`unit.log`) |
| G-I | `vitest run --project integration` mit `lernapp-gruppe`, `lernapp-schreiben`, `lernapp-sync`, `push`, `lernapp-verwaltung`, `lernapp-einwilligung`, `mein-bereich-lernen` | rc 0, 7/7 Dateien, **127/127 grün** (20 + 22 + 27 + 9 + 26 + 9 + 14), 169,5 s (`integration.log`) |
| G-I2 | `vitest run --project integration tests/integration/verwaltung/rechte-matrix-lernapp.test.ts` | rc 0, **146/146 grün** (`integration2.log`). `rechte-matrix-mitglieder` (495) habe ich nicht wiederholt |
| G-S | `pnpm sprachen:pruefen` | rc 0: Lern-App 868 Schlüssel in de, tr, ar; Website 3241 in de, tr, en (`sprachen.log`) |
| G-S2 | eigener Abgleich `messages/lernapp/{de,tr,ar}.json` (Python) | je 868 Schlüssel; tr und ar: 0 fehlend, 0 überzählig, 0 leer; ICU-Argumente gleich (6 scheinbare Abweichungen sind Inhalte von `select`-Zweigen, z. B. `abzeichen.arten.schrift.text`, keine Platzhalter) |
| G-C | `skripte/scan.py` und `skripte/spenden.py` über `inhalte/lernapp/**/*.json` (435 Dateien ohne `schemas/`, mit `uebersetzung/`) | siehe Z-L09 (`scan.txt`, `spenden.txt`) |
| G-L | curl GET auf 21 Adressen, dazu die 4 CSS-Dateien von `/quran/1` | Einzelwerte bei Z-L09 und Z-L13 (`live_*.html`) |
| G-E | Durchsicht der E2E-Logs des Orchestrators und des Quelltexts der Specs | siehe unten; keine eigenen E2E-Läufe |

---

## 1. Z-L09 Kinderschutz – Urteil: **bestätigt, teilweise**

### Reproduziert

- **Bestenliste ab 16 im Code:** `lib/lernapp/gruppe/regeln.ts:41–45` (`abSechzehn`), `:72–74` (`erscheint`), `:81–83`;
  `gruppe/dienst.ts:161–188` (Filter vor jeder weiteren Abfrage), `:194–202`, `:775–779` (`stimmeZu` wirft unter 16).
  In G-U grün: `gruppe-regeln` 18/18. In G-I grün: „API /api/lernapp/gruppe: Isolation und Bestenliste › Kind: nie eine
  Bestenliste, nie eine Zustimmung – auch mit untergeschobener Zustimmung“.
- **Schreibabgaben nur an die eigene Lehrkraft, Kommentar an Kinder gesperrt:** G-I `lernapp-schreiben` 22/22, darunter
  „fremde Lehrkraft, Aufsicht, Eltern, Kind, Lernende und Administration lesen nie“, „Kind (S-L2 M-1, D-L16 offen): Dienst
  und Action lehnen den Kommentar ab“, „Kind, Altkommentar … erreicht das Kind nicht“. Code: `schreiben/kinderschutz.ts`
  (`ENTSCHEIDUNG_D_L16 = null`, `UMGESETZTE_SCHUTZMASSNAHMEN = []`), `schreiben/dienst.ts:464`.
- **Lehrkraft nur eigene Gruppe, Eltern nur eigenes Kind:** G-I „Zuweisungen: … fremde Lehrkraft, Aufsicht, Lernende und
  Eltern nicht“, „Lernwoche nur für das eigene, bestätigte Kind; nie für fremde Kinder“; G-I2 146/146.
- **Abgleich von Kinderkonten:** `sync/server.ts:84–98` und `:109–156`; G-I „Kind unter 16: ohne Einwilligung der Eltern
  abgelehnt – auch mit eigener“.
- **Push:** `app/api/push/abo/route.ts:57`, `lib/push/abo.ts:118–133` (`kindDarfPush`); G-I „Kinderkonto ohne
  Elterneinwilligung ‚Push für das Kind‘ → 403, mit Einwilligung → 200“. Einen Push-Weg der Lern-App gibt es nicht: weder
  in `src/lib/push` noch in `app/api/push` steht „lernapp“; `push_lernapp` steht nur in `funktionen-regeln.ts`,
  `validierung/einstellungen.ts` und `startklar/gemeinde.ts`.
- **Meldungen:** `app/api/lernapp/meldung/route.ts:71–79` speichert die Antwort nur bei `konto && hatZugang(konto) &&
  !konto.istKind`. `MeldenDialog.tsx` hat nur Radiofelder der Kategorie und kennt kein Feld `antwort` (grep: 0 Treffer).
  Gegenprobe zur Lücke „Schülerkonto unter 16 ohne `istKind`“: Schülerkonten werden erst ab 16 mit dem Lerndatensatz
  verbunden (`konto/einladung.ts:32–61`, Prüfung `server/actions/gemeinde-konten.ts:190` mit `istMindestens16`). Die
  Prüfung über `istKind` reicht also.
- **Keine Freitext-Kommunikation:** Die einzigen Freitextfelder der Lern-App sind die Schreibabgabe
  (`schreiben/Schreiben.tsx:95`), Antwortfelder der Übungen und Anmeldefelder. Alle anderen `<input>` sind Radio, Checkbox
  oder hidden (grep über `components/lernapp` und `app/lern-app`). Der Kommentar der Lehrkraft an Lernende ab 16 ist
  einseitig und nach `kinderschutz.ts` ausdrücklich so gewollt. KERN §5 ist auf Kinder unter 16 bezogen, also keine Lücke.
- **Motivliste:** `inhalte/lernapp/symbole/symbole.json` hat 63 Motive, alle `lucide:*@1.55.0` (ISC), alle
  `freigegeben: false`. Elemente: path 194, circle 19, rect 6, line 4, polyline 2. Die 63 Lucide-Namen sind nur
  Gegenstände und Natur (Haus, Buch, Apfel, Bus, Zelt, Wolke, Welle usw.), keine Menschen, Tiere oder Gesichter.
  `bild_wort` steht nur in `rahmen/leitfaden.json` (2), in keiner Kursdatei. Kein Lemma hat ein `symbol`.
- **Externe Links:** URLs stehen in den Inhalten nur im Feld `namensnennung` (5357, Wiktionary-Artikel). Angezeigt werden
  sie nur auf der Quellenseite (`NamensnennungInsel` nur aus `app/lern-app/[ui]/quellen/page.tsx`), als Text und nicht
  als Link. In sichtbaren Feldern gibt es 22 URL-artige Treffer: `example.org` (Satz `tr.b1.e02` und Übersetzungen,
  Leitfaden) und Schlüssel wie `de.a2.e10.app`. Alle `href` in `components/lernapp` sind intern oder kommen aus
  Adressfunktionen (`Rahmen.tsx:128` Fußzeile).
- **Spendenaufrufe:** Ich habe 282 Fundstellen gelesen (sprache, uebersetzung, islam). Die meisten Treffer sind gar keine
  Spenden: tr „bağışıklık“ (Immunsystem, `ar-aus-tr/b1/ar.b1.e05` 22), „bağışlamak“ (verzeihen) und „sadakat“ (Treue,
  `ar-aus-tr/b1/ar.b1.e09` 23), de „Trost/Schatten spenden“. Echte Spenden kommen nur als Szenen vor: Kleiderkammer und
  Bibliothek in `de.b1.e06`, Kermes eines Vereins in `tr.b1.e12`, „Wie werde ich Vereinsmitglied?“ in `de.a2.e08`.
  Im Wissenskurs steht ṣadaqa als Fiqh-Begriff. Einen Appell an die lernende Person habe ich nicht gefunden. Die
  Appell-Muster („spenden Sie“, „bağış yapın“, „Ihre Spende“, IBAN, „werden Sie Mitglied“, „üye olun“) treffen nur
  falsch: „üye olunur“ als Frage, „ġāliban“ in der Umschrift. In den UI-Texten `messages/lernapp/de|tr.json`: 0.
- **Live (02:09 UTC):** `/lern-app/de/gruppe` 404, `/api/lernapp/gruppe` 404, `/api/lernapp/schreiben` 404.

### Lücken (bestätigt bzw. zusätzlich)

1. **Bestätigt – `gruppe.spec.ts` lief auf keinem Stand der Stufe C.** Übersprungen („-“) sind `:155` (Kind ohne
   Bestenliste) und `:317` (Schreibabgabe) auf telefon und desktop in `tor-stufe-c/e2e2.log` Z. 7–8/76–77,
   `tmp-n1/tor/e2e2.log` Z. 8–9/72–73, `tmp-n1/tor/e2e3.log` Z. 7–8/72–73 und `tmp-n3/e2e.log` Z. 7–8. Ebenso in den
   neueren N3-Läufen `tmp-n3/bau/e2e.log` und `tmp-n3/bau-d/e2e.log` (02:06 UTC) Z. 7–8/73–74.
   - Ursache: Die Specs prüfen die Schalter mit `test.skip` (`gruppe.spec.ts:156–160` braucht SYNC, GRUPPEN und
     RANGLISTE, `:322` braucht GRUPPEN). `tor-stufe-c-e2e.sh:12` und `tor-stufe-c.sh:41` setzen nur
     `FUNKTION_LERNAPP{,_SYNC,_SPRECHEN,_MELDUNGEN}`. Auch `tor-l7.sh:15` setzt GRUPPEN nicht.
   - Grün lief die Spec zuletzt in `SL2-A-gegen-1/e2e.log` (23.10. 09:49, `:110`/`:271`, 2 passed). Danach haben
     `d019394a` (23.10. 15:17, Einwilligung der Eltern im Ablauf) und `bb873e8e` (25.10.) die Spec geändert. Die neue
     Fassung ist also nie grün gelaufen.
2. **Zusätzlich (heraufgestuft vom Hinweis zur Lücke) – „Meldungen von Kindern ohne Antwort“ ist ungetestet.** Die
   Schwelle nennt den Fall ausdrücklich. Getestet sind nur „ohne Konto“ (`lernapp-verwaltung.test.ts:299–322`) und
   „angemeldet ab 16“ mit `ADMIN` (`:351–367`). Würde jemand `!konto.istKind` in `route.ts:74` streichen, bliebe jeder Test
   grün. Für diesen Teil der Schwelle gibt es nur den Quelltext als Beleg.
3. **Zusätzlich (Hinweis, Abdeckung) – Der Kinderzugang im E2E ist unbeständig.** `rahmen.spec.ts:284` (Kinderzugang tr,
   desktop) ist rot in `tmp-n1/tor/e2e3.log` (Stand `0f2d7c31`, Z. 121 und 222–233: URL bleibt `…/anmelden?zugang=kind`)
   und in `tmp-n3/bau/e2e.log`. Grün ist er in `tmp-n3/bau-d/e2e.log` Z. 123 (Arbeitsbaum N3, nicht der geprüfte Stand).
   Auf `1209cb29` lief er nicht (`e2e4.log`, nur lektion, melden, sprachpruefung). Auf telefon wird er immer
   übersprungen. Beide `gruppe.spec`-Abläufe hängen an der Anmeldung eines Kindes.
4. **Hinweis, keine Schwellenlücke – Personensymbole in der Oberfläche.** `einheit.symbol` ist in 8 Einheiten `users`
   (Lucide-Piktogramm mit zwei Personen). Das Symbol wird auf `d8ec7d5a` von keiner Komponente gerendert (grep
   `symbol` in `components/lernapp` und `app/lern-app`: nur `Abzeichen.tsx` und Formularklassen). Das Abzeichen „gruppe“
   zeigt Lucide `Users` (`Abzeichen.tsx:51`). Beides sind Oberflächensymbole (KERN §7) und keine Bildkarten. Der Satz in
   KERN §5 „keine Menschen- oder Tierdarstellungen bis zur Entscheidung“ steht aber im Kontext der Bildkarten. Die
   Redaktion sollte das bei LM-34 mitentscheiden.

### Nacharbeit

1. Produktionsbau und Lauf mit `FUNKTION_LERNAPP_SYNC=an FUNKTION_LERNAPP_GRUPPEN=an FUNKTION_LERNAPP_RANGLISTE=an`, dann
   `playwright test tests/e2e/lernapp/gruppe.spec.ts --project desktop`. Das Log ablegen und die Schalter dauerhaft in
   `tor-stufe-c-e2e.sh` (und in künftige Tor-Skripte) aufnehmen.
2. In `tests/integration/lernapp-verwaltung.test.ts` einen Fall „angemeldetes Kinderkonto (`istKind`) sendet `antwort` →
   201, gespeicherte `antwort` ist `null`“ ergänzen. Gleiches Muster wie `:351`, nur mit einem Kinderkonto aus dem Seed.
3. `rahmen.spec.ts:284` (Kinderzugang) einzeln drei Mal auf desktop gegen den aktuellen Produktionsbau laufen lassen. Ist
   er wieder rot, die Ursache in `AnmeldeFormulare.tsx` bzw. in der Weiterleitung nach der Kinderanmeldung suchen, bevor
   `gruppe.spec` als Beleg zählt.
4. Freigabe der Motivliste und Entscheidung zu Personen-Piktogrammen in Oberflächensymbolen: nur Mensch, LM-34.

---

## 2. Z-L11 Bewegung – Urteil: **bestätigt, erfüllt**

### Reproduziert

- G-U: `bewegung-regeln` 25/25 und `bewegung-bausteine` 7/7 grün.
- Register: `KERN.md` §10 nennt B-28 bis B-35 je mit Datei und reduzierter Variante. Der Test bildet das in
  `bewegung-regeln.test.ts:71–81` nach. Alle acht Dateien gibt es (B-35 `sprechen/Pegel.tsx` existiert, der Ausweg
  `e.paket && !existsSync` greift nicht).
- Endzustand bei reduzierter Bewegung, im CSS nachgerechnet:
  - `.linie-zeichnet` hat `stroke-dasharray: 1` (`globals.css:673–676`). Reduziert gilt `animation: none`
    (`:822–835`). Damit gilt der Ausgangswert `stroke-dashoffset: 0`, die Linie steht also ganz da (B-30 und B-32
    „Endzustand“ bzw. „sofort“).
  - `.stern-fuellt` ohne Animation zeigt den vollen Stern (B-33 „gefüllt“).
  - `.tritt-auf` wird zur Überblendung (`:837`).
  - Zusätzlich setzt der reduzierte Block `animation-duration` und `transition-duration` für `*` auf 0,01 ms
    (`:844–850`).
- B-35: `Pegel.tsx:15–24`. Der Punkt und der Text stehen immer da, der Balken bekommt `motion-reduce:hidden`. Das
  entspricht „statischer Punkt + Text“.
- Gegenbeispiele gesucht:
  - In `components/lernapp` und `app/lern-app` gibt es kein `animate-*`, kein `.animate(`, keine Bewegungsbibliothek und
    kein `@keyframes`.
  - `requestAnimationFrame` steht nur für den Fokus, den Pegel (funktional, B-35) und die Ausschnittsprüfung im Koran-Pfad.
  - Übergänge: `[ui]/page.tsx:93` hat `motion-safe:transition-transform` (Chevron, nur ohne Reduktion). `KursKarte.tsx:25`
    hat `transition` nur für Rahmen und Hintergrund beim Hover, also Farbe. `LesenFragen.tsx:63` ist `scale-96` mit
    `motion-reduce:scale-100`.
  - Hochzählende Zahlen: keine; der Test prüft das mit Gegenprobe.

### Lücken

Keine an der Schwelle.

Hinweise:

- ABNAHME sieht als Beleg auch eine „Prüfung mit reduzierter Bewegung“ vor. Im Browser gibt es die für die Lern-App
  nicht: `reducedMotion: 'reduce'` steht nur in `elifbe.spec.ts:112`, `svg-programm.spec.ts:76` und
  `erzaehlung.spec.ts:89`. Die statische Prüfung, das nachgerechnete CSS und der Sicherheitsblock für `*` tragen die
  Schwelle trotzdem.
- `bewegung-regeln.test.ts:80` prüft B-35 nur mit `/scale/` und `/motion-reduce:/`. Das ist schwach, die Datei ist aber
  richtig.
- Die Glossar-Einblendung in `LesenFragen.tsx:63` hat keinen Registereintrag (wie beim Prüfer).

### Nacharbeit (Pflege, nicht schwellenrelevant)

1. In `spielelemente.spec.ts` einen Block mit `test.use({ reducedMotion: 'reduce' })` ergänzen. Er prüft nach dem
   Abschluss, dass der Ring keine laufende Animation hat (`getAnimations().length === 0`) und der Stern gefüllt ist.
2. LesenFragen in KERN §10 und in `REGISTER` aufnehmen. Für B-35 die Regex schärfen (`/motion-reduce:hidden/`).

---

## 3. Z-L13 Sprachen und RTL – Urteil: **bestätigt, erfüllt**

### Reproduziert

- **`sprachen:pruefen`** rc 0 (G-S). Der eigene Abgleich G-S2 ergibt dasselbe: de ⊆ tr, de ⊆ ar, gleiche Platzhalter.
- **`rtl-regeln` 4/4, `sanfte-texte` 4/4** (G-U). Gegenbeispiele gesucht: kein `rounded-l/r`, `border-l/r`,
  `translate-x`, `float-*` oder `origin-left/right` in `components/lernapp` und `app/lern-app`. Die physischen
  `transformOrigin: '0 50%'` in `Fortschrittsleiste.tsx:20` und `Pegel.tsx:21` werden über `rtl:-scale-x-100` am
  Container gespiegelt.
- **`html[dir=rtl]` live (02:09 UTC):**
  - `/lern-app/ar`, `/einstellungen`, `/fortschritt` und `/quellen` antworten 200 mit `<html lang="ar" dir="rtl"
    data-oberflaeche="lernapp" data-bau="d8ec7d5a351c">`.
  - `/lern-app/de` und `/lern-app/tr` antworten 200 mit `dir="ltr"`.
  - `/lern-app` und `/lern-app/en` antworten 308, `/lern-app/fa` 404.
  - Im Quelltext: `app/lern-app/[ui]/layout.tsx:71–74`.
- **390 px ohne Überlauf:** `playwright.config.ts:42` (telefon 390 × 844). In `tmp-n1/tor/e2e3.log` (`0f2d7c31`) sind
  grün:
  - `rahmen.spec.ts:67` ar (Z. 39/107) und `:84` ar (Z. 41/109). `:84` prüft je Route den Überlauf 0 (`:91`).
  - `typen-a.spec.ts:373` ar telefon (Z. 64), Überlauf am Ende geprüft (`:347`).
  - `typen-b.spec.ts:380` ar (Z. 75/142), Überlauf je Aufgabe (`:389`).
  - `lektion.spec.ts:90` axe ar mit Überlauf im Lernpfad und im Spieler (`:111`, `:118`). Das gilt auch auf `1209cb29`
    (`e2e4.log` Z. 18–19).
  - Seit `0f2d7c31` hat sich in `web/src` nichts an `components/lernapp` und am Layout geändert (`git diff --stat
    0f2d7c31 d8ec7d5a`: Quellen, Audio-Route, Umgebung, Audio-Studio).
- **Harakat nicht abgeschnitten (Widerlegung versucht):**
  - In `components/lernapp` und `app/lern-app` gibt es kein `truncate`, `line-clamp`, keine festen `h-*` und kein
    `leading-none/tight` an Text. `overflow-hidden` steht nur an Balken (`Fortschrittsleiste.tsx:16`, `Pegel.tsx:20`,
    `HeuteInsel.tsx:111`, `GruppeInsel.tsx:167`). Scroll-Container gibt es nur in der Quellenseite, im Meldedialog und in
    `Formen.tsx:120`.
  - Antwortfelder (`Texteingabe.tsx:38–42` `feldKlasse`) nutzen für ar `font-arabic text-arabisch-3` (Zeilenhöhe 2,1)
    mit `min-h-12` und wachsen mit der Zeilenhöhe.
  - Lesetexte nutzen für ar `font-arabic text-arabisch-3` (`LesenFragen.tsx:179`).
  - Großbuchstaben haben `buchstabe-riesig` mit Zeilenhöhe 2 (`globals.css:256–259`). Die Koran-Wörter im Koran-Pfad
    nutzen `font-quran text-arabisch-2` (`KoranPfadInsel.tsx:168`).
  - Sichtprüfung `scratchpad/l1/bilder/lernapp-ar-spieler-390.png` (20.10.): Die Vokalzeichen der drei Optionen sind
    vollständig zu sehen (Ausschnitt `c-obf-gegen/crop-optionen.png`).
  - Ich habe keinen Mechanismus gefunden, der Harakat abschneiden könnte.
- **Website de/tr/en:** `src/i18n/routing.ts:11`. Live: `/` 200 `lang="de"`, `/tr` 200 `lang="tr"`, `/en` 200
  `lang="en"`, `/ar` 404 und `/fa` 404.
- **RTL-Eingrenzung, Website unverändert:**
  - Vorher (vor `b7cc3ad0`) lautete die Regel `[lang='ar'], [dir='rtl']` mit der Spezifität (0,1,0). Heute lautet sie
    `:is([lang='ar'],[dir='rtl']):not(:where([data-oberflaeche],[data-oberflaeche] *))` (`globals.css:475–478`), ebenfalls
    (0,1,0): `:is` nimmt das stärkste Argument, `:not(:where())` zählt 0. Der Diff steht in `git show bd3d8600`.
  - `data-oberflaeche` setzt nur `app/lern-app/[ui]/layout.tsx:74` (grep über `src`). Auf der Website trifft die
    Negation also nie, die Kaskade ist dieselbe.
  - Live steht die Regel in `/_next/static/chunks/0p313xcvohv81.css` von `/quran/1`. `data-oberflaeche` kommt auf
    `/quran/1`, `/elifbe/buchstaben` und `/hadith/auswahl` 0-mal vor.
  - Damit ist der Nachweis logisch vollständig, auch ohne neue Messung mit der Teilbaumform.

### Lücken

Keine an der Schwelle.

Hinweise (Abdeckung und Pflege):

1. Der einzige Sichtbeleg für Harakat ist vom 20.10. Seitdem gab es 42 Commits an `components/lernapp` (`git log
   --since="2026-10-20 18:20"`), darunter alle L2-Typen (harakat, formen, dialog, geschichte, schrift_ar, koran_wort).
   Für diese Typen gibt es keine Sichtprüfung. Im selben Satz Bildschirmfotos ist der Knopf „Prüfen“ in tr und ar
   (390 px) von einem waagrechten Band verdeckt (`crop-knopf.png`, `crop-tr.png`). Das ist wahrscheinlich ein Artefakt
   von `fullPage` mit klebender Leiste und nicht RTL-spezifisch. Als sauberer Sichtbeleg taugt dieser Satz deshalb nicht.
2. In `Formen.tsx:69` stehen die vorgegebenen Formen in `text-20` und in der UI-Schrift. Die Antwortfelder derselben
   Tafel nutzen dagegen Amiri mit Token. Das betrifft 67 ar-Aufgaben vom Typ `formen` mit Harakat. Es weicht von KERN §7
   ab („vokalisierter Kursinhalt: `--font-arabic` mit `--text-arabisch-*`“), schneidet aber nichts ab: Die Zellen haben
   `p-2` und wachsen, der Scroll-Container wächst mit.
3. Überlauf bei 390 px in ar ist automatisch nicht geprüft für `fortschritt`, `wortschatz`, `tipps`, `wiederholen`,
   `einstufung` und `anmelden`. `spielelemente.spec.ts:157` besucht `/lern-app/ar/fortschritt` ohne Überlaufprüfung.
   Den Rauchtest je UI-Sprache, den ABNAHME vorsieht, gibt es; Z-L06 deckt die übrigen Routen ab.

### Nacharbeit (empfohlen, nicht schwellenrelevant)

1. Beim nächsten E2E-Lauf `LERNAPP_BILDER=1` setzen und die ar-Bilder (390/1440) ohne `fullPage` bzw. mit
   ausgeblendeter klebender Leiste ablegen. Dazu einen Spieler-Schnappschuss je ar-Typ aus `typen-a` und `typen-b`.
2. In `typen-a.spec.ts` (ar) prüfen: `scrollHeight ≤ clientHeight + 1` für jedes `[lang=ar]`-Element innerhalb von
   `main`.
3. `Formen.tsx:69` und `:133`: für `aufgabe.sprache === 'ar'` `font-arabic text-arabisch-3` statt `text-20`.
4. In `spielelemente.spec.ts:157` (ar, Fortschritt) die Überlaufprüfung wie in `rahmen.spec.ts:91` ergänzen.

---

## 4. Ergebnis der Gegenprüfung

| Z | Prüfer | Gegenprüfung | Urteil | Kern der Begründung |
|---|---|---|---|---|
| Z-L09 | teilweise | **teilweise** | bestätigt | Unit 89/89 und Integration 127 + 146 grün reproduziert. Code-Sperren gelesen, Motivliste, Links und Spenden selbst durchsucht, live 404. Lücken: `gruppe.spec` nie auf einem Stufe-C-Stand gelaufen (neue Fassung nie grün); „Meldung von Kindern ohne Antwort“ ohne Test (heraufgestuft); Kinderzugang im E2E unbeständig (Hinweis) |
| Z-L11 | erfüllt | **erfüllt** | bestätigt | `bewegung-regeln` 25/25, `bewegung-bausteine` 7/7. Reduzierte Endzustände im CSS nachgerechnet, kein Gegenbeispiel. Hinweis: keine Browserprüfung mit `reducedMotion` in der Lern-App |
| Z-L13 | erfüllt | **erfüllt** | bestätigt | `sprachen:pruefen` und eigener Abgleich grün, `rtl-regeln` und `sanfte-texte` grün. `dir="rtl"` live, 390 px in E2E auf `0f2d7c31` grün, Harakat ohne Abschneide-Mechanismus, Website de/tr/en live, RTL-Eingrenzung logisch und live belegt. Hinweise: Sichtbeleg alt, Formen-Tafel in UI-Schrift, nicht alle ar-Routen mit Überlaufprüfung |
