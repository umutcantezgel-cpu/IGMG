# Stufe C2 · Nachmessung des Prüflings fa5c005

Prüfer: Haiku, Prüfstufe C, Nachmessung am Endstand. Stand: 2026-10-12.
Prüfling: Commit fa5c005 auf 127.0.0.1:3500 (Worktree `SP/bau-head`, Anmeldestand der Verwaltung frisch). Ausgangsstand für die Funktionsliste: 9ebb4bc auf 127.0.0.1:3100.
Erste Messung: 5d19108, Bericht `berichte/STUFE-C.md`, Protokolle in Commit b702c7c (`git show b702c7c:_werkstatt/protokolle/<Datei>`).
Kein Commit, kein Push, keine Änderung an `web/` oder an Werkzeugen. Protokolle: `/home/user/IGMG/_werkstatt/protokolle/C-*` (überschrieben). `SP` = Scratchpad-Verzeichnis dieser Sitzung.

## 0. Ablauf, Abweichungen, Last

| Lauf | Zeit (UTC) | Ergebnis | Beleg |
|---|---|---|---|
| Schritte 1 bis 3 (`--ab 1 --bis 3`) | 06:59:09 bis 07:19:21 | alle Teilschritte rc=0, kein ABBRUCH | `protokolle/C-lauf.log` |
| Schritte 5 bis 11 (`--ab 5 --bis 11`) | 07:20:12 bis 07:57:58 | rc=1 bei 5c (Veranstaltung), rc=1 bei 8b (startklar Produktion, erwartet); sonst rc=0, kein ABBRUCH | `protokolle/C-lauf.log` |
| Schritt 4 | entfällt (Briefing) | – | – |
| Schritt 12 (Lighthouse verschränkt) | nicht ausgeführt | Anweisung des Orchestrators während des Laufs | – |

Abweichungen, je mit Grund:
1. **5c Veranstaltungs-Zeitlupe, rc=1.** Der feste Selektor `freitagsgebet-mit-anschliessendem-vortrag` findet auf `/veranstaltungen` keinen sichtbaren Link (`protokolle/C-vt-zeitlupe-veranstaltung.log`: „Kein sichtbarer Link für a[href*=…]“). Keine Wiederholung, weil dafür kein Auftrag vorliegt. Die Datei `protokolle/C-vt-zeitlupe-veranstaltung.json` stammt vom 05:36 (Erstmessung) und ist nicht Teil dieser Nachmessung; sie wird hier nicht ausgewertet.
2. **8b startklar Produktion, rc=1.** Erwartet: Menschen-Aufgaben (Abschnitt 8).
3. **Schritt 12 nicht ausgeführt.** Z-08 wird nur mit Verweis eingetragen (Abschnitt 6).
4. **Fremder Prozess beim Start.** Um 06:59 lief `b03-probe.mjs` (PID 32435, rund 105 % CPU), nicht von diesem Lauf gestartet. Sein Ende ist nicht protokolliert. Auswirkung auf Schritt 1 nicht bewertet.

Last: nicht als Messgröße erhoben (Lighthouse entfällt). Stichproben von `/proc/loadavg`: 0,95 (07:00), 1,91 (07:40).

## 1. Z-02 Bestand

Messweg: Stufe C (`release:check`, Build, Statuscodes, Konsole je Route, Funktionsliste F-01…F-24 gepaart 3100 gegen 3500).
Ziel laut ABNAHME: mindestens so grün wie E0, keine Funktion schlechter, null neue Konsolenfehler.

**release:check** (`protokolle/C-release-check.log`; Erstmessung `b702c7c:…/C-release-check.log`):

| Schritt | Erste Messung (5d19108) | Nachmessung (fa5c005) |
|---|---|---|
| typen | OK (24,6 s) | OK (23,6 s) |
| lint | OK (27,7 s) | OK (32,7 s) |
| test:unit | 44 Dateien, 794 bestanden, 3 erwartet rot | 45 Dateien, 800 bestanden, 3 erwartet rot |
| test:integration | 35 Dateien, 1 übersprungen; 1412 bestanden, 2 erwartet rot, 4 übersprungen | 35 Dateien, 1 übersprungen; 1412 bestanden, 2 erwartet rot, 4 übersprungen |
| sprachen:pruefen | OK, 1203 Schlüssel | OK, 1203 Schlüssel |
| geheimnisse:pruefen | OK | OK, ohne Befund |
| startklar | übersprungen (keine DATABASE_URL) | übersprungen (keine DATABASE_URL) |

Ergebnis release:check: BESTANDEN mit übersprungenem Schritt startklar.

**Build** (`protokolle/C-vercel-build-preview.log`, `C-vercel-build-production.log`): preview rc=0, production rc=0, keine Fehlerzeilen. Crons in `.vercel/output/config.json`: `/api/wartung/loeschfristen` `0 1 * * *`, `/api/wartung/mail-ausgang` `0 2 * * *`.

**Statuscodes** (`protokolle/C-statuscodes.txt`): sechs unbekannte Adressen liefern 404 (darunter `/quran/999`). Alle Hauptansichten liefern 200, `/api/health` liefert 200. Wie Erstmessung.

**Konsole je Route** (`protokolle/C-konsole.json`, `C-konsole-tr.json`, `C-konsole-en.json`, Breite 390): de 25 Routen, 24 ohne Meldung; `/gibt-es-nicht` mit zwei Meldungen (`http-404`, Ressourcenfehler 404), die beabsichtigte 404-Probe. tr 11 Routen und en 3 Routen ohne Meldung. Keine neuen Konsolenfehler.

**Funktionsliste gepaart** (`protokolle/C-funktionsliste-3100.json`/`.md`, `C-funktionsliste-3500.json`/`.md`; 48 Zellen):

| Vergleich 3100 → 3500 | Zellen | Einzelheiten |
|---|---|---|
| besser | 5 | F-14 (390, 1440: nicht erfüllt → erfüllt), F-18 (390: nicht erfüllt → erfüllt), F-23 (390, 1440: nicht erfüllt → erfüllt) |
| schlechter | 0 | – |
| Wechsel, nicht vergleichbar | 1 | F-20 (1440): 3100 ohne Anmeldestand nicht prüfbar, 3500 erfüllt |
| gleich | 42 | – |

- F-08 auf 3500 ist jetzt erfüllt (390, 1440). Die H1 „Gemeinsam glauben, gemeinsam wachsen“ wird akzeptiert (Erstmessung: nicht erfüllt, 2 Zellen).
- Formular-POSTs: 14 auf beiden Seiten. HTTP ≥ 400 nur die beabsichtigte Probe `/nicht-vorhanden-xyz` (F-16).

Gegen die E0-Basis (`protokolle/E0-PRUEFER-03-funktionsliste.md`): 40 Zellen gleich, 8 abweichend. F-14, F-18 (390) und F-23: nicht erfüllt → erfüllt. F-20 (1440): nicht prüfbar → erfüllt. **F-06 (390, 1440): erfüllt → nicht prüfbar.** Grund laut Protokoll: „der einzige Termin mit anmeldungAktiv ist vergangen (beginn 2024-01-26)“, deshalb kein Formular gerendert. Auf 3100 ebenfalls nicht prüfbar.

**Ergebnis Z-02: teilweise.** Erfüllt: release:check (bis auf den übersprungenen startklar-Schritt), Build preview und production, Statuscodes, Konsole ohne neue Meldungen, gepaart keine Funktion schlechter als 3100. Nicht nachweisbar: gegenüber E0 ist F-06 von erfüllt auf nicht prüfbar gefallen. Nach Wortlaut „keine Funktion schlechter“ ist das nicht eindeutig belegt.

## 2. Z-03 Designsystem

Messweg: `freie-werte.mjs` auf den 258 seit 9ebb4bc geänderten `.ts`/`.tsx`/`.css`-Dateien unter `web/src` (`protokolle/C-geaenderte-dateien.txt`, 258 Zeilen). Erste Messung: 253 Dateien.
Ziel laut ABNAHME: 0 Funde in jeder geänderten Datei (ohne UNANTASTBAR/Bildinhalte, Fehlalarme begründet), Stufe A je Paket, jede neue Komponente nutzt das System.

**Ergebnis:** 258 geprüfte Dateien, 109 Funde in 7 Dateien (Hex-Farbe 59, Tailwind-Klammerwert 18, px-Literal in Style 29, Farbfunktion 3). 251 Dateien ohne Fund. Erste Messung: 107 Funde in 9 Dateien (`protokolle/C-freie-werte.md`).

| Datei | Funde | Einordnung nach REFERENZ §1 |
|---|---|---|
| `web/src/components/verwaltung/styleguide/tokens.ts` | 50 | belegte Ausnahme (Styleguide-Spiegel) |
| `web/src/lib/mail/vorlagen/farben.ts` | 27 | belegte Ausnahme (`MAILFARBE`, `MAILMASS`) |
| `web/src/lib/seo/og-bild.tsx` | 7 | belegte Ausnahme (Satori-OG-Bild) |
| `web/src/app/[locale]/layout.tsx` | 1 | belegte Ausnahme (`themeColor`) |
| `web/src/app/globals.css` | 19 | Fehlalarm: 8 in Kommentaren (Zeilen 107, 109 ×2, 112, 114, 127, 165, 214), 11 CSS-Attributselektor `[data-kategorie]` (Zeilen 711–721) |
| `web/src/lib/mail/vorlagen/Rahmen.tsx` | 3 | Fehlalarm: `margin: 0`, `padding: 0` (Zeilen 39, 40, 80) |
| `web/src/lib/mail/vorlagen/index.tsx` | 2 | Fehlalarm: `margin: 0` (Zeilen 63, 83) |

Offene Werte nach REFERENZ §1: **0**. Die Mail-Maße und -Farben stehen jetzt in `farben.ts`, die Vorlagen lesen nur von dort. Die Erstmessung zählte 16 Funde in `Rahmen.tsx` und 6 in `index.tsx` als offen.

**Nicht gemessen:** Stufe A je Paket (REFERENZ §5) und „jede neue Komponente nutzt das System“. Das Werkzeug läuft nur auf dem geänderten Satz, eine Stichprobe unveränderter Dateien ist nicht Teil davon.

**Ergebnis Z-03: nicht erfüllt (streng nach Wortlaut).** Der Wortlaut lässt nur UNANTASTBAR, Bildinhalte und begründete Fehlalarme aus. Die 78 Funde in `tokens.ts`, `farben.ts` und `layout.tsx` sind belegte Ausnahmen nach REFERENZ §1, aber diese Gruppen stehen nicht im Wortlaut. `og-bild.tsx` (7) könnte als Bildinhalt gelten. Nach REFERENZ §1 gibt es keine offenen Werte. Ob die belegten Ausnahmen den Wortlaut erfüllen, entscheidet der Orchestrator.

## 3. Z-05 Bewegung

Messweg: Momente B-06…B-09 (`C-bildrate-b0N.json` mit Drosselung 1× und 4×, `C-reduziert-b0N.json`), Bewegung auf den Routen (`C-bewegung-*.md`), Leiste B-10 (`C-leiste-*.json`), Seitenwechsel B-05 (`C-vt-*.json`), Register-Abgleich (`C-keyframes.txt`, `C-animate-klassen.txt`) gegen KERN K-007.
Ziel laut ABNAHME: Momente ≤ 5 % verworfene Bilder; reduziert ohne Lage und Größe, alles sichtbar; jede Animation im Register.

**Momente, Bildrate unter 4× Drosselung** (Einzelläufe, Anteil verworfener Bilder):

| Moment | Erste Messung 4× (5d19108) | Nachmessung 4× (fa5c005) | Nachmessung 1× | Max. Nachmessung | Ergebnis |
|---|---|---|---|---|---|
| B-06 Tagesbogen (Start) | 11,9 · 5,3 · 17,1 % | 19,8 · 13,4 · 19,1 % | 0 · 0 · 0 % | 19,8 % | **nicht erfüllt** |
| B-07 Weg der Gemeinde | 0 · 0 · 0 % | 0 · 0 · 4,2 % | 0 · 0 · 0 % | 4,2 % | erfüllt |
| B-08 Meilensteinlinie | 0 · 0 · 0 % | 2,5 · 0 · 0 % | 0 · 0 · 0 % | 2,5 % | erfüllt |
| B-09 Familie der vier | 8,7 · 5,2 · 9,3 % | 0,8 · 0,9 · 0,9 % | 4,2 · 0 · 0 % | 0,9 % | erfüllt |

B-06 bei Tageslicht (`UHR` 2026-10-12T14:10:00+02:00), wie in der Erstmessung.

**Reduzierte Bewegung, Momente** (`C-reduziert-b06.json` bis `b09.json`): bei allen vier Momenten 0 laufende Animationen nach 2 s, 0 Elemente mit Deckkraft < 1, 0 Skalierungen, 0 laufende Layout-Animationen. Bei B-09 wurden 0 Elemente gezählt (Endzustand nur über `SP/bilder/stufe-c/momente/b09-reduziert.jpg`). Wie Erstmessung.

**Bewegung auf den Routen** (`C-bewegung-*.md`): reduziert auf allen 6 Läufen ohne Befund (0 bewegte Elemente, 0 px Lageänderung, nichts unsichtbar nach 2 s oder nach Scrollen).
Bildrate 4× (kein Moment im Ziel, als Auffälligkeit notiert): `/` 0 %, `/ueber-uns` 0 %, `/ueber-uns` scrollen 0 %, `/projekte` 0 %, `/projekte` scrollen **19,7 %** (98 Bilder, 3 lange Abstände), `/organisationen/ana-teskilati` **4,1 %** (117 Bilder, 3 lange Abstände). Erste Messung: `/projekte` scrollen 0 %, Organisationsseite 2,5 %. Ursache nicht geprüft.

**Leiste B-10** (`C-leiste-1440.json`, `C-leiste-390.json`, `C-leiste-390-aufgeklappt.json`, `C-leiste-reduziert-390.json`, `C-leiste-erstladen-390.json`):
- 1440: Wechsel gemessen (Asr → Maghrib), 0 laufende Animationen danach.
- 390 eingeklappt: keine Zeilen, kein Wechsel gemessen.
- 390 aufgeklappt: 6 Zeilen, kein Wechsel gemessen.
- reduziert: keine Hervorhebungsanimation. Erstladen: keine Hervorhebung beim Laden.
- Befund: der Wechsel bei 390 px ist nicht eindeutig gemessen (wie Erstmessung).

**Seitenwechsel B-05** (`C-vt-nachrichten.json`, `C-vt-start.json`, `C-vt-veranstaltungen.json`, `C-vt-b05.json`, `C-vt-reduziert.json`, `C-vt-zeitlupe-nachricht.json`):
- Drei Paare (`/`→`/veranstaltungen`, `/veranstaltungen`→`/`, `/impressum`→`/datenschutz`) und die Karten-Strecken: `vt` 1 bei allen. Zeitlupe Nachricht: 5 Bilder, `vt` 1, Kopf fest (`kopfTop` 0).
- Reduziert: `vt` 0 bei allen 3 Paaren, Ziel erreicht 3 von 3.
- Zeitlupe Veranstaltung: **nicht gemessen** (rc=1, siehe Abschnitt 0).

**Register-Abgleich** (`C-keyframes.txt`, 10 Keyframes; Quelle `fa5c005:web/src/app/globals.css`):
- Alle 10 Keyframes sind in KERN K-007 eingetragen. Neu gegenüber der Erstmessung ist `auftritt-mitte` (Dialog, B-03).
- `animate-in`/`animate-out` (16 Verwendungen in `web/src/components/ui/`) und `animate-spin` (1, `ui/sonner.tsx`, nie gerendert) stehen nicht im Register. KERN K-007 führt sie als „Bestand ohne Bewegung“ mit dem Hinweis, dass sie ohne Animations-Plugin nichts bewegen. Das ist dokumentiert.

**Ergebnis Z-05: nicht erfüllt.** B-06 liegt bei 4× mit 19,8 · 13,4 · 19,1 % deutlich über 5 % und schlechter als die Erstmessung (11,9 · 5,3 · 17,1 %). Erfüllt: B-07, B-08, B-09 (4×), reduzierte Bewegung der Momente und der Routen, B-05 (Paare, reduziert), Register der Keyframes. Teilweise: B-10 bei 390 px (nicht eindeutig gemessen). Nicht gemessen: B-05 Zeitlupe Veranstaltung.

## 4. Z-06 Grafik

Messweg: `svg3.mjs` (`protokolle/C-svg.md`, `C-svg.json`).
Ziel laut ABNAHME: eine Icon-Familie, alle SVG optimiert und zugänglich, keine doppelten IDs.

- Werkzeug: 12 inline `<svg>` in `web/src` (E0: 3), Fehler 0, Befund 0, OK 12, keine doppelten IDs. Hinweis: zwei Stellen in `Icons.tsx` übergeben Attribute per `{...props}` (manuell zu prüfen). Das Werkzeug zählt keine `.svg`-Dateien mehr unter `_lauf/`.
- Icon-Familie: `lucide-react` in 146 Dateien (`git grep` auf `fa5c005`, `web/src`), `web/src/components/website/Icons.tsx` in 17 Dateien. Zwei Quellen, also keine eine Icon-Familie.
- Außerhalb `web/`: 5 SVG-Vorlagen im Repo unter `_lauf/lichtung/a/public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`), nicht vom Werkzeug erfasst.
- Optimierung der SVG: **nicht gemessen** (kein Optimierungslauf).

**Ergebnis Z-06: nicht erfüllt.** Zwei Icon-Quellen, 5 Vorlagen-Grafiken außerhalb des Werkzeug-Scopes, Optimierung nicht geprüft.

## 5. Z-07 Zugänglichkeit

Messweg: axe-core WCAG 2.2 AA (`a11y.mjs`, `axe-regeln3.mjs`) bei 390 und 1440; Tastatur (`tastatur.mjs`, mit Hauptaufgaben bei 390, Tastatur 1440); Menü-Fokus (`menue-fokus.mjs`).
Ziel laut ABNAHME: 0 ernste oder kritische Befunde; Tastatur mit sichtbarem Fokus; Kontraste.

**axe** (Regeln wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa; `protokolle/C-a11y-390.md`, `C-a11y-1440.md`, `C-axe-regeln-*.json`):

| Lauf | Routen | kritisch | ernst | Verstöße | unklar (Routen, nur `color-contrast`) | Erste Messung unklar |
|---|---|---|---|---|---|---|
| de 390 | 25 | 0 | 0 | 0 | 4 | 11 |
| de 1440 | 25 | 0 | 0 | 0 | 4 | 12 |
| tr 390 | 11 | 0 | 0 | 0 | 2 | 8 |
| en 1440 | 3 | 0 | 0 | 0 | 0 | 3 |

Unklar auf 390 px: `/projekte`, `/bildung/voranmeldung`, `/mitglied-werden`, `/webseite-fuer-moscheen`. Die Ursache des Rückgangs (E0: 8 Routen) ist nicht gemessen.

**Tastatur** (`protokolle/C-tastatur-390.md`, `C-tastatur-1440.md`, je 11 Routen): Sprunglink auf 22 von 22 Läufen ok. 0 Befunde bei „Fokus unsichtbar“, „Fokus schwach“, „Falle“ und „ausserhalb“. 1440: keine Befunde (Erstmessung: 1 Befund `/kontakt`, Checkbox). POST 0 in allen Läufen.
- Hauptaufgaben bei 390 (KERN K-002): a) Gebetszeit ok (5 Tabs), b) Veranstaltung bis zur Anmeldung ok (13), c) Voranmeldung bis „Weiter“ ok (20), d) Kontakt bis „Absenden“ ok (15, nicht gedrückt), e) Suche ok (6).

**Menü-Fokus** (`protokolle/C-menue-fokus.json`): bestanden (`bestanden: true`).

Zu den 64 Routen-Läufen (25 + 25 + 11 + 3): 0 ernste oder kritische Befunde.

**Ergebnis Z-07: teilweise.** Erfüllt: 0 ernste oder kritische Befunde, Tastatur ohne Befund, Sprunglink, Menü-Fokus, Hauptaufgaben. Offen: unklarer Kontrast auf 4 Routen (390 und 1440) und 2 Routen (tr). Das Ziel „Kontraste“ hat keine Zahl. Die Lesart liegt beim Orchestrator.

## 6. Z-08 Leistung

Lighthouse-Nachmessung folgt am endgültigen Stand (Orchestrator), siehe protokolle/C-lighthouse-v.md.

**Ergebnis Z-08: nicht gemessen** in dieser Nachmessung (Schritt 12 nicht ausgeführt).

## 7. Z-09 Darstellung

Messweg: Bildsatz 390, 768 und 1440 (`bildsatz.mjs`): horizontales Scrollen, abgeschnittener Text, über den Rand ragende Elemente (`protokolle/C-bildsatz*.json`, Bilder `SP/bilder/stufe-c/bildsatz*/`).

| Satz | Routen × Breiten | Messungen | Querscrollen | abgeschnitten | über den Rand (Befund) | HTTP ≠ 200 |
|---|---|---|---|---|---|---|
| de | 25 × 3 | 75 | 0 | 0 | 2 bei 390 | nur `/gibt-es-nicht` (404, Probe) |
| de reduziert | 25 × 3 | 75 | 0 | 0 | 2 bei 390 | wie de |
| tr | 11 × 3 | 33 | 0 | 0 | 1 bei 390 | keine |
| en | 3 × 3 | 9 | 0 | 0 | 1 bei 390 | keine |

Die vier Befunde sind alle `span.min-w-0.truncate` mit Auslassungszeichen, vom Werkzeug als vermutlich beabsichtigt markiert: Freitagsgebet (de, de reduziert, tr, en) und „Neue Gebetszeiten für den Winter“ (de, de reduziert). `/nachrichten` hat keinen Befund mehr (Erstmessung E0: 9 Textelemente bei 390 px über den Rand).

**Nicht gemessen:** Sichtprüfung der vier Auslassungen (nur der Werkzeug-Befund liegt vor).

**Ergebnis Z-09: teilweise.** Kein Querscrollen auf 192 Messungen, kein abgeschnittener Text. Offen: vier Auslassungen bei 390 px bis zur Sichtprüfung.

## 8. Z-11 Vercel

Messweg: `vercel build` in einer Archivkopie von fa5c005 (ohne DB), preview und production; NFT der OG-Dateien; `crons` und `regions` in `.vercel/output/config.json`; V-Prüfliste V-01 bis V-13 mit Beleg.

**Build:** preview rc=0, production rc=0, keine Fehlerzeilen (`protokolle/C-vercel-build-preview.log`, `C-vercel-build-production.log`). Warnung „DATABASE_URL fehlt – Bau mit Beispielinhalten“ erwartet (ADR 0017).
**NFT der OG-Dateien** (`C-lauf.log`): `symbol-512.png`, `source-serif-4-latin-600-normal.woff`, `atkinson-hyperlegible-next-latin-700-normal.woff` je in 3 OG-Spuren.
**Config:** crons wie in der Erstmessung. `regions` im Build-Output nicht nachweisbar (wie Erstmessung); `"regions": ["fra1"]` steht in `vercel.json`, und `vercel.json`, `web/package.json`, `.vercelignore` sind seit 5d19108 unverändert (`git diff` leer).
**startklar** (`protokolle/C-startklar-entwicklung.json`, `C-startklar-produktion.json`): Entwicklung 11 Prüfungen, ok 3, warnung 4, fehler 0, manuell 2, Hinweis 2, startklar ja. Produktion 23 Prüfungen, ok 2, warnung 3, fehler 15, manuell 3, startklar nein. Gleich wie Erstmessung; die Fehler sind Menschen-Aufgaben.

**V-Prüfliste:**

| V | Stand Nachmessung | Beleg | Ergebnis |
|---|---|---|---|
| V-01 | Dateien unverändert seit 5d19108, Build akzeptiert | `git diff 5d19108 fa5c005` (leer) | erfüllt |
| V-02 | preview und production rc=0, keine Fehlerzeilen | `C-vercel-build-*.log` | erfüllt |
| V-03 | `web/docs/deploy/VERCEL-ENV.md` vorhanden; startklar Entwicklung ja; Geheimnisprüfung ohne Befund | `C-startklar-entwicklung.json`, `C-release-check.log` | erfüllt |
| V-04 | `attachDatabasePool` in 1 Datei; Konto in Frankfurt ist Menschen-Aufgabe | `git grep` | teilweise (ML) |
| V-05 | Blob-Region nicht nachgemessen | – | teilweise |
| V-06 | Crons täglich (01:00 und 02:00 UTC), `CRON_SECRET` in 4 Dateien | `config.json`, `git grep` | erfüllt |
| V-07 | nicht nachgemessen | `protokolle/H-V07-V10-pruefung.md` | teilweise |
| V-08 | Startseite (3500): `s-maxage=3600, stale-while-revalidate=82800`; statische Dateien nicht nachgemessen | `curl -sI` | teilweise |
| V-09 | `noindex` in 4 Dateien; Vercel Authentication und teilbarer Link: Menschen (ML-23) | `git grep` | teilweise |
| V-10 | `/api/health` 200, Body `{"status":"ok"}`; `VERCEL.md` vorhanden | `curl` | erfüllt (Übung nicht gemessen) |
| V-11 | `web/docs/recht/VERARBEITUNGSVERZEICHNIS.md` und `datenschutz-hosting-v2.md` vorhanden; Freigabe Menschen (ML-11, ML-12) | Dateiprüfung | teilweise |
| V-12 | ML-09 in `_werkstatt/MENSCHEN.md` | `git grep` | erfüllt |
| V-13 | `web/docs/deploy/VERCEL.md` und `web/docs/GO-LIVE.md` vorhanden; Vorschau auf Vercel nicht per MCP geprüft | Dateiprüfung | teilweise |

**Ergebnis Z-11: teilweise.** Build, Crons, OG-NFT und startklar Entwicklung sind grün. Offen: Vorschau auf Vercel (nicht gemessen), Konto- und Freigabepunkte (Menschen), V-05 und V-07 (nicht nachgemessen).

**Auch aus dem Lauf, nicht Teil des Briefings:** Wortlaut H-R01 (Schritt 7c, `protokolle/C-wortlaut.json`): 723 Rechts-Einträge, 637 gleich, 85 neu, 1 entfernt, 0 geändert, 0 offen „hoch“ (34 durch Ausnahmen gedeckt). Wie Erstmessung.

## 9. Liste der nicht erfüllten oder teilweise erfüllten Punkte

1. **Z-05 B-06 Tagesbogen:** 4× 19,8 · 13,4 · 19,1 % verworfen (Ziel 5 %), schlechter als 5d19108 (11,9 · 5,3 · 17,1 %). Beleg: `protokolle/C-bildrate-b06.json`.
2. **Z-06 Grafik:** zwei Icon-Quellen (`lucide-react` 146 Dateien, `Icons.tsx` 17), 5 Vorlagen-SVG in `_lauf/`, 12 inline-SVG (E0: 3), Optimierung nicht geprüft.
3. **Z-03 Designsystem nach Wortlaut:** 78 Funde in `tokens.ts`, `farben.ts`, `layout.tsx` als belegte Ausnahmen; Stufe A je Paket nicht gemessen.
4. **Z-02 F-06:** gegenüber E0 von erfüllt auf nicht prüfbar (Termin mit Anmeldung vergangen). Beleg: `protokolle/C-funktionsliste-3500.md`, F-06.
5. **Z-07 Kontrast:** unklar auf 4 Routen (390, 1440) und 2 Routen (tr). Beleg: `protokolle/C-axe-regeln-390.json`, `C-axe-regeln-1440.json`.
6. **Z-09 Auslassungen bei 390:** 4 Stellen mit `truncate`, Sichtprüfung offen. Beleg: `protokolle/C-bildsatz.json`, `C-bildsatz-tr.json`, `C-bildsatz-en.json`.
7. **Z-11 Vercel:** Vorschau nicht gemessen; V-04, V-05, V-07, V-09, V-11, V-13 offen (Konto, Freigabe oder nicht nachgemessen).
8. **Z-05 Leiste B-10 bei 390 px:** Wechsel nicht eindeutig gemessen.
9. **Z-05 Auffälligkeit Bildrate 4× auf Routen:** `/projekte` scrollen 19,7 %, Organisationsseite 4,1 % (kein Moment im Ziel).
10. **Z-08:** nicht gemessen (Verweis, siehe Abschnitt 6).
11. **Z-05 B-05 Zeitlupe Veranstaltung:** rc=1, nicht gemessen.

## 10. Nicht geprüft und Grenzen

- Lighthouse und Z-08 (Schritt 12 durch Orchestrator gestrichen). INP ist im Werkzeug `inp.mjs`/`inp-paare.sh` (Commit 91df7fa) enthalten, aber nicht im Ablauf; Z-08 nennt INP/TBT.
- Z-01, Z-04, Z-10 und Z-12 waren nicht Gegenstand des Briefings.
- Echte Geräte nicht vorhanden (UA-01): Emulation 390, 768 und 1440, Chromium 141 (UA-04).
- Vercel-Vorschau über den Vercel-MCP nicht geprüft; der Build lief lokal in der Archivkopie ohne Datenbank.
- Verwaltungsflüsse mit Anmeldestand nur auf 3500 (`verwaltung-state.json`, F-20, F-21) gemessen.
- Sichtprüfung der Bildsätze (Z-09-Auslassungen) nicht durchgeführt.
- `ABNAHME.md` wurde während des Laufs geändert (Commit 91df7fa): nur der Belegtext zu V-13, die Kriterien sind unverändert.
- `C-vt-zeitlupe-veranstaltung.json` ist eine Altdatei von 05:36 und nicht Teil dieser Nachmessung.

## 11. Rohdaten und Belegorte

- Protokolle: `/home/user/IGMG/_werkstatt/protokolle/C-*` (Ablauf: `C-lauf.log`), überschrieben.
- Erstmessung: `git show b702c7c:_werkstatt/protokolle/<Datei>`; Bericht `berichte/STUFE-C.md`.
- Bilder: `SP/bilder/stufe-c/`.
- Zwischenstände: `SP/stufe-c/` (`kopie/`, `pglite-startklar/`, `lh/`).

## 12. Einordnung durch den Orchestrator (Opus, 08:10 UTC)

Der Prüferbericht oben bleibt unverändert. Ich habe ihn gegen die Protokolle gelesen. Korrekturen und Folgen:

- **Z-06, Vorlagen unter `_lauf/` (Korrektur):**
  - `protokolle/C-svg.md` (07:25) meldet 0 `.svg`-Dateien, 12 inline, Befund 0.
  - Die fünf Next-Vorlagen unter `_lauf/lichtung/a/public/` gehören zur Ablage früherer Läufe. Sie werden nicht ausgeliefert, weil `.vercelignore` sie ausschließt und sie nicht unter `web/` liegen. Der Lauf schreibt nicht in `_lauf/` (Grenze des Auftrags).
- **Z-06, Icon-Familie:** KERN K-008 legt sie fest: Es gibt eine Familie, Lucide. `Icons.tsx` enthält Lucide-Pfade (ISC), die `lucide-react` 1.x nicht mehr ausliefert, sowie die Achtstern-Marken des Formsystems.
- **Z-06, Optimierung (neu gemessen):** In allen 12 inline-SVG gibt es keine Editor-Reste (inkscape, sodipodi, metadata, data-name). Zahlen mit drei Nachkommastellen stehen nur in `Zustandsgrafik.tsx`, und zwar 17. Das ist die Genauigkeit der Lucide-Vorlagen, gemessen per `grep` auf den Dateien aus `C-svg.json`.
- **Z-03:** Die Spiegel `farben.ts` (`MAILFARBE`/`MAILMASS`), `og-bild.tsx` (`OG_FARBEN`), `layout.tsx` (`themeColor`) und `styleguide/tokens.ts` sind jetzt per Test an `globals.css` gebunden: `tests/unit/token-spiegel.test.ts` und `styleguide-tokens.test.ts`. Ein Wert, der vom Token abweicht, macht `pnpm check` rot. Deshalb ordne ich diese Funde als begründete Fehlalarme nach REFERENZ §1 ein: Die Werte stammen nachweislich aus dem System.
  - Die Mail hat keinen eigenen 14-px-Schriftgrad mehr. Kleintext steht wie auf der Website auf `text-16`.
- **Z-05, B-06:** Die gemessene Fassung fa5c005 nutzte noch die SVG-Schnittmaske. Commit 37e62f1 ersetzt sie durch ein Schiebefenster im Compositor. Probemessung auf Port 3600 (Build 37e62f1, Uhr 14:10, Last 3,9–4,5): bei 4× Drosselung 0 · 1,7 · 0,8 % verworfene Bilder, 7 statt 18 laufende Animationen (`$SCRATCHPAD/probe-b06-bildrate.json`). Die maßgebliche Messung folgt am Endstand.
- **Z-05, Routen-Bildrate `/projekte` scrollen 19,7 %:** Der Lauf 6b (07:23–07:25) fiel in meine Typprüfung und den Probe-Build, die parallel liefen. Er wird am Endstand bei ruhiger Last wiederholt.
- **Z-05, B-05 Veranstaltung:** Die Zeitlupe zielte auf das vergangene Freitagsgebet. Das steht in keiner Liste mehr, auch nicht auf 3100. `stufe-c.sh` 5c nutzt jetzt `arabisch-sprachkurs`.
- **Z-07, unklare Kontraste:** Übrig sind nur Ziffern aus einem Zeichen. Bei ihnen kann axe nicht entscheiden, ob es Text ist. Betroffen sind die Schrittmarken der Formulare und die Meilenstein-Ziffern. Die Kontraste nach den Tokens:
  - `gruen-800` auf `gruen-50`: 7,09 : 1
  - `tinte-2` auf Weiß: 8,49 : 1
  - `tinte-2` auf Sand: 7,46 : 1
  - Weiß auf `gruen-700`: 5,48 : 1

  Alle liegen über 4,5 : 1. Die Fälle „Hintergrund über Verlauf“ (Platzhalter-Pillen) sind durch die deckende Pille behoben.
- **Z-09, Sichtprüfung der vier Auslassungen:** Gekürzt wird jeweils der letzte Eintrag des Pfads (Brotkrumen) bei 390 px. Ein Beispiel ist `bildsatz/veranstaltungen_freitagsgebet-…/390x844/schirm-01.jpg`, dort steht „Freitagsgebet mi…“. Der volle Titel steht direkt darunter als H1. Der Text bleibt für Hilfstechnik vollständig, weil nur CSS kürzt. Die Kürzung ist gewollt.
- **Z-11, Vorschau auf Vercel:** gemessen per MCP in `protokolle/C-vercel-mcp.md`. Die Vorschau e0c8e9f ist READY in fra1 und hat keine Fehlergruppe.
- **Z-02, F-06:** Der einzige Termin mit Anmeldung (26.01.2024) ist auf beiden Ständen vergangen. Die Funktion ist deshalb weder auf 3100 noch auf 3500 prüfbar. Das ist ein Datenstand, keine Verschlechterung. Die Anmeldung selbst prüft die E2E-Suite (`veranstaltung-anmeldung`).
