# Stufe C · Endprüfung des Prüflings 5d19108

Prüfer: Haiku, Prüfstufe C, Lauf „Gestaltung aufwerten und Vercel-startklar“. Stand: 2026-10-12.
Prüfling: Commit 5d19108 auf 127.0.0.1:3500 (Worktree `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/bau-head`). Ausgangsstand: 9ebb4bc auf 127.0.0.1:3100.
Kein Commit, kein Push, keine Änderung an `web/` oder an Werkzeugen. Protokolle: `/home/user/IGMG/_werkstatt/protokolle/C-*`. Scratchpad-Bilder und -Zwischenstände: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad/` (im Folgenden `SP/`).

## 0. Ablauf, Abweichungen, Last

| Lauf | Zeit (UTC) | Ergebnis | Beleg |
|---|---|---|---|
| Schritte 1 bis 3 (`--ab 1 --bis 3`) | 04:44:56 bis 05:03:36 | alle Teilschritte rc=0 | `protokolle/C-lauf.log` |
| Schritte 5 bis 11 (`--ab 5 --bis 11`) | 05:03:43 bis 05:36:01 | rc=1 bei 5c (Veranstaltung), rc=2 bei 7c (Wortlaut), rc=1 bei 8b (startklar Produktion); sonst rc=0 | `protokolle/C-lauf.log` |
| Einzelwiederholung 5c Veranstaltung (Ersatztermin `arabisch-sprachkurs`) | 05:36 (Ende laut Dateizeit 05:36:21) | Ziel erreicht, View Transition `vt` 1, Kopf vor Klick 0 | `protokolle/C-vt-zeitlupe-veranstaltung.json`, `SP/bilder/stufe-c/seitenwechsel/veranstaltung/` |
| Einzelwiederholung Schritt 7 (`--ab 7 --bis 7`) | 05:36:27 bis 05:36:38 | alle Teilschritte rc=0; Wortlaut `befund_hoch_offen_einheiten` 0 | `protokolle/C-wortlaut.json`, `C-freie-werte.json`, `C-svg.json` |
| Schritt 4 Lighthouse (`--ab 4 --bis 4`) | 05:38:54 bis 06:17:28 | rc=0, Fehlerprotokoll leer | `protokolle/C-lauf.log`, `protokolle/C-lighthouse.log` |
| Schritte 8 bis 11 | Teil von 05:03 bis 05:36 | siehe Z-02, Z-11, Z-12 | `protokolle/C-release-check.log`, `C-startklar-*.json`, `C-vercel-build-*.log` |

Abweichungen vom Ablauf, je mit Grund:
1. **5c Veranstaltungs-Zeitlupe, rc=1.** Der feste Selektor `freitagsgebet-mit-anschliessendem-vortrag` findet auf `/veranstaltungen` keinen sichtbaren Link (`protokolle/C-vt-zeitlupe-veranstaltung.log` des Erstlaufs, Kopie `SP/stufe-c/fehlschlag-5c-veranstaltung.log`). Der Termin liegt laut Orchestrator in der Vergangenheit. Die Detailseite liefert weiter 200 (gemessen). Wiederholung einzeln mit `arabisch-sprachkurs` (Liste: 12 Treffer, Detailseite 200), auf Anweisung des Orchestrators.
2. **7c Wortlaut, rc=2.** Das Werkzeug meldet bei `befund_hoch_offen_einheiten` > 0 den Exit-Code 2 (`werkzeuge/wortlaut.mjs` Zeile 779). Erstfassung: 3 offene Befunde „hoch“ (`SP/stufe-c/erstfassung-7/C-wortlaut.md`): das neue Verarbeitungsverzeichnis `web/docs/recht/VERARBEITUNGSVERZEICHNIS.md` (neu) sowie zwei `font-family`-Zeilen in `web/src/lib/mail/vorlagen/Rahmen.tsx` (Georgia, neu und entfernt). Der Orchestrator hat dazu die Ausnahmen A-06 und A-07 im Werkzeug ergänzt (Commit `a389b53`, Werkzeugänderung nicht durch den Prüfer). Die Wiederholung zeigt 0 offene Befunde „hoch“ und 34 Ausnahme-Einheiten (vorher 31) (`protokolle/C-wortlaut.json`). Die Rechtstext-Zählung ist unverändert (85 neu, 1 entfernt, 637 gleich). Die Ausnahmen wirken eng: A-06 trifft genau 27 Absätze der einen Datei, A-07 genau 2 Zeilen (`wortlaut.mjs` Zeilen 525–526). Die Prüfung der Einordnung bleibt beim Orchestrator.
3. **8b startklar Produktion, rc=1.** Das Skript erwartet das bei Menschen-Aufgaben (`protokolle/C-startklar-produktion.json`, siehe Z-12).

Last: vor Lighthouse 0,32 (05:38:54, `SP/stufe-c/last-vor-lighthouse.txt`; die Wartezeit endete nach 2 Minuten, weil die Last unter 1,5 fiel). Zu Beginn der Routen (Log `protokolle/C-lauf.log`): route-00 0,32, route-01 bis route-10 zwischen 1,31 und 1,87. Am Ende 1,41 (06:17:28). Dauer des Laufs 04:44:56 bis 06:17:28, also 1 h 33 min.

## 1. Z-02 Bestand

Messweg: Stufe C (`release:check`, Statuscodes, Konsole je Route, Funktionsliste F-01…F-24 gepaart 3100 gegen 3500).
Ziel laut ABNAHME: mindestens so grün wie E0, keine Funktion schlechter, null neue Konsolenfehler.

**release:check** (`protokolle/C-release-check.log`, `protokolle/C-release-check`):

| Schritt | Ergebnis |
|---|---|
| typen | OK (24,6 s) |
| lint | OK (27,7 s) |
| test:unit | OK: 44 Dateien bestanden, 794 Tests bestanden, 3 erwartet rot (797) |
| test:integration | OK: 35 Dateien bestanden, 1 übersprungen; 1412 Tests bestanden, 2 erwartet rot, 4 übersprungen (944 s, Last) |
| sprachen:pruefen | OK: 1203 Schlüssel in de, tr, en |
| geheimnisse:pruefen | OK, ohne Befund |
| startklar | übersprungen (keine DATABASE_URL gesetzt, weder in der Umgebung noch in .env) |

Ergebnis: BESTANDEN mit übersprungenem Schritt startklar. Die E0-Lage (4 unit-Tests rot unter UTC) ist nicht mehr rot.

**Statuscodes** (`protokolle/C-statuscodes.txt`): 6 unbekannte Adressen (darunter `/quran/999`) liefern 404. Von den 25 Routen der Liste liefern 24 den Status 200, `/gibt-es-nicht` liefert die beabsichtigte 404-Probe. `/api/health` liefert 200.

**Konsole je Route** (`protokolle/C-konsole.json`, `C-konsole-tr.json`, `C-konsole-en.json`, Breite 390):
- de, 25 Routen: 0 Meldungen auf 24 Routen. `/gibt-es-nicht` hat 2 Meldungen, und zwar `http-404` und „Failed to load resource … 404“. Das ist die erwartete Antwort der 404-Seite, kein App-Fehler.
- tr, 11 Routen: 0 Meldungen. en, 3 Routen: 0 Meldungen.

**Funktionsliste F-01…F-24** (`protokolle/C-funktionsliste-3100.md`/`.json`, `C-funktionsliste-3500.md`/`.json`; Bilder `SP/bilder/stufe-c/funktionsliste-3100` und `-3500`):

Vergleich über 48 Zellen (24 Funktionen × 2 Breiten):
- 40 gleich, 5 besser, 2 schlechter, 1 Wechsel (nicht prüfbar → erfüllt, nur bei F-20 1440; 3100 ohne Anmeldestand, 3500 mit Anmeldestand, daher nicht vergleichbar).
- Besser: F-14 (390 und 1440), F-18 (390), F-23 (390 und 1440).
- **Schlechter: F-08 (390 und 1440).** Die Prüfung `/projekte: 200, H1, Inhalt` verlangt die H1 exakt als „Gemeinsam Glauben, Gemeinsam Wachsen“ (`werkzeuge/funktionsliste.mjs` Zeile 342 und 350, Vergleich `h1 === erwartet`). Auf 3500 lautet die H1 „Gemeinsam glauben, gemeinsam wachsen“ (Status 200, 2550 Zeichen). Auf 3100 stimmt sie. Der Prüfer deutet die Ursache nicht. Gemessen ist die Abweichung der Schreibweise.
- POST-Zähler: 14 auf beiden Seiten, identisch verteilt (F-11 6, F-12 2, F-13 6). Werkzeug schickt Formulare nur bis zur Serverprüfung ab (leer oder Schrittprüfung), `funktionsliste.mjs` Kopf Zeile 11–12. HTTP-Fehler ≥ 400: je 2 Einträge auf beiden Seiten, alle bei F-16 (Probe `/nicht-vorhanden-xyz`, 404, beabsichtigt).

| F | Funktion | 3100 · 390 | 3100 · 1440 | 3500 · 390 | 3500 · 1440 | POST 3100 | POST 3500 | Vergleich |
|---|---|---|---|---|---|---|---|---|
| F-01 | Startseite: Leiste, H1, Knöpfe, Veranstaltungen, Neuigkeiten | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |
| F-02 | Leiste auf jeder Seite außer Gebetszeiten | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |
| F-03 | /gebetszeiten: Tabs, Tastatur, Monatstabelle, Qibla | nicht prüfbar | nicht prüfbar | nicht prüfbar | nicht prüfbar | 0 | 0 | gleich |
| F-04 | Gebetszeiten-Anzeige: Vollbild, Schließen, Sprachwechsel | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |
| F-05 | Veranstaltungen: Kategoriefilter | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |
| F-06 | Veranstaltungsdetail: Anmeldung, Pflichtfehler, iCal | nicht prüfbar | nicht prüfbar | nicht prüfbar | nicht prüfbar | 0 | 0 | gleich |
| F-07 | Nachrichten: Filter, Ankündigungen, Detail mit ähnlichen Artikeln | nicht prüfbar | nicht prüfbar | nicht prüfbar | nicht prüfbar | 0 | 0 | gleich |
| F-08 | Über uns, Projekte, Vorstand, IGMG (Tabs) | erfüllt | erfüllt | nicht erfüllt | nicht erfüllt | 0 | 0 | schlechter |
| F-09 | Organisationen (vier): Name, Akzentfarbe, Termine | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |
| F-10 | Korankurse: Kurskarten und Aktionen | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |
| F-11 | Voranmeldung: vier Schritte, Weiter/Zurück, ohne JS sendbar | erfüllt | erfüllt | erfüllt | erfüllt | 6 | 6 | gleich |
| F-12 | Kontakt: Pflichtprüfung, Karte nach Klick | nicht prüfbar | nicht prüfbar | nicht prüfbar | nicht prüfbar | 2 | 2 | gleich |
| F-13 | Mitglied werden, Moschee-Anfrage, Meldung: Pflichtprüfung | erfüllt | erfüllt | erfüllt | erfüllt | 6 | 6 | gleich |
| F-14 | Suche: Ergebnisse, noindex | nicht erfüllt | nicht erfüllt | erfüllt | erfüllt | 0 | 0 | besser |
| F-15 | Sprachwahl de → tr → en, lokalisierter Pfad | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |
| F-16 | Unbekannte Adresse: 404 mit Weg zurück | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |
| F-17 | Offline-Seite und Service Worker | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |
| F-18 | Mobilmenü (390): öffnen, Fokus, Esc | nicht erfüllt | – | erfüllt | – | 0 | 0 | besser / gleich |
| F-19 | Sprunglink „Zum Inhalt“ | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |
| F-20 | Verwaltung: Einladung, Passwort, TOTP, Anmeldung, Dashboard | – | nicht prüfbar | – | erfüllt | 0 | 0 | gleich / nicht prüfbar→erfüllt |
| F-21 | Verwaltung: Veranstaltung anlegen/bearbeiten, Medien hochladen | – | nicht prüfbar | – | nicht prüfbar | 0 | 0 | gleich |
| F-22 | /api/health | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |
| F-23 | iCal-Abo je Organisation: gültiger Kalender, Zeiten | nicht erfüllt | nicht erfüllt | erfüllt | erfüllt | 0 | 0 | besser |
| F-24 | Konzept-Hinweis: erster Besuch, schließen, nicht wieder | erfüllt | erfüllt | erfüllt | erfüllt | 0 | 0 | gleich |

**Ergebnis Z-02: teilweise.** Erfüllt sind release:check, Statuscodes, Konsole, Zählung der POSTs. Nicht erfüllt ist „keine Funktion schlechter“ (F-08, Schreibweise der H1). Die Zahl der grünen Funktionen steigt von 30 auf 34 erfüllte Zellen, bei 2 verschlechterten.

## 2. Z-03 Designsystem

Messweg: `freie-werte.mjs` auf den 253 seit 9ebb4bc geänderten `.ts`/`.tsx`/`.css`-Dateien unter `web/src` (`protokolle/C-geaenderte-dateien.txt`, Zeile 253).
Ziel laut ABNAHME: 0 Funde in jeder geänderten Datei, ohne UNANTASTBAR und Bildinhalte, Fehlalarme begründet; Stufe A je Paket; jede neue Komponente nutzt das System.
Ausgangswert E0: 617 Funde in 452 Dateien (Bestand, nicht vergleichbar mit dem geänderten Satz).

**Ergebnis:** 253 geprüfte Dateien, 107 Funde in 9 Dateien (`protokolle/C-freie-werte.md`, `C-freie-werte.json`). Art: Hex-Farbe 52, Tailwind-Klammerwert 25, px-Literal in Style 27, Farbfunktion 3.

Einordnung nach Datei (Prüfer, Stand dieser Sichtung):

| Gruppe | Funde | Dateien | Einordnung |
|---|---|---|---|
| Styleguide-Spiegel | 50 | `web/src/components/verwaltung/styleguide/tokens.ts` | bekannte Ausnahme |
| Satori-OG-Bild | 7 | `web/src/lib/seo/og-bild.tsx` | bekannte Ausnahme |
| Kommentartext (Werkzeug zählt Kommentare) | 8 | `web/src/app/globals.css` Zeilen 107, 109 (2×), 112, 114, 125, 155, 204 | Fehlalarm |
| CSS-Attributselektor `[data-kategorie]` | 11 | `web/src/app/globals.css` Zeilen 670–680 | Fehlalarm |
| echter Wert außerhalb der Token-Definitionen | 1 | `web/src/app/globals.css` Zeile 535 (`background: #fff`) | offen |
| E-Mail-Vorlage mit Inline-Stil | 22 | `web/src/lib/mail/vorlagen/Rahmen.tsx` (16), `vorlagen/index.tsx` (6) | offen; Begründung möglich (E-Mail-Clients ohne CSS-Variablen), aber keine dokumentierte Ausnahme |
| Verwaltungs-Dialog | 3 | `web/src/components/verwaltung/medienwahl/MedienWahlDialog.tsx` 94, 96 | offen |
| Hinweis-Dialog und Karte | 4 | `web/src/components/website/KonzeptHinweis.tsx` 69 (2); `OrgCard.tsx` 76, 82 (2) | offen |
| Meta-Farbe | 1 | `web/src/app/[locale]/layout.tsx` 26 (`themeColor`) | offen; Begründung prüfen |

Sum: 57 bekannte Ausnahmen, 19 Fehlalarme, 31 offen (30 echte Designsystem-Werte in 6 Dateien plus `#fff`).

Vollständige Liste aller 107 Funde mit Datei:Zeile und Einordnung:

| Datei:Zeile | Art | Fund | Einordnung |
|---|---|---|---|
| web/src/app/[locale]/layout.tsx:26 | Hex-Farbe | `#0e3929` | offen: Meta-Farbe als Literal (Begründung prüfen) |
| web/src/app/globals.css:107 | Tailwind-Klammerwert | `leading-[1.55]` | Fehlalarm: Kommentartext (Werkzeug zählt Kommentare) |
| web/src/app/globals.css:109 | Tailwind-Klammerwert | `md:py-[72px]` | Fehlalarm: Kommentartext (Werkzeug zählt Kommentare) |
| web/src/app/globals.css:109 | Tailwind-Klammerwert | `md:py-[88px]` | Fehlalarm: Kommentartext (Werkzeug zählt Kommentare) |
| web/src/app/globals.css:112 | Tailwind-Klammerwert | `max-w-[760px]` | Fehlalarm: Kommentartext (Werkzeug zählt Kommentare) |
| web/src/app/globals.css:114 | Tailwind-Klammerwert | `max-w-[880px]` | Fehlalarm: Kommentartext (Werkzeug zählt Kommentare) |
| web/src/app/globals.css:125 | Tailwind-Klammerwert | `grid-cols-[repeat(…)]` | Fehlalarm: Kommentartext (Werkzeug zählt Kommentare) |
| web/src/app/globals.css:155 | Hex-Farbe | `#0e3929` | Fehlalarm: Kommentartext (Werkzeug zählt Kommentare) |
| web/src/app/globals.css:204 | Tailwind-Klammerwert | `z-50/z-60/z-[100]` | Fehlalarm: Kommentartext (Werkzeug zählt Kommentare) |
| web/src/app/globals.css:535 | Hex-Farbe | `#fff` | offen: #fff außerhalb der Token-Definitionen |
| web/src/app/globals.css:670 | Tailwind-Klammerwert | `[data-kategorie]:not` | Fehlalarm: CSS-Attributselektor [data-kategorie] |
| web/src/app/globals.css:671 | Tailwind-Klammerwert | `[data-kategorie]:not` | Fehlalarm: CSS-Attributselektor [data-kategorie] |
| web/src/app/globals.css:672 | Tailwind-Klammerwert | `[data-kategorie]:not` | Fehlalarm: CSS-Attributselektor [data-kategorie] |
| web/src/app/globals.css:673 | Tailwind-Klammerwert | `[data-kategorie]:not` | Fehlalarm: CSS-Attributselektor [data-kategorie] |
| web/src/app/globals.css:674 | Tailwind-Klammerwert | `[data-kategorie]:not` | Fehlalarm: CSS-Attributselektor [data-kategorie] |
| web/src/app/globals.css:675 | Tailwind-Klammerwert | `[data-kategorie]:not` | Fehlalarm: CSS-Attributselektor [data-kategorie] |
| web/src/app/globals.css:676 | Tailwind-Klammerwert | `[data-kategorie]:not` | Fehlalarm: CSS-Attributselektor [data-kategorie] |
| web/src/app/globals.css:677 | Tailwind-Klammerwert | `[data-kategorie]:not` | Fehlalarm: CSS-Attributselektor [data-kategorie] |
| web/src/app/globals.css:678 | Tailwind-Klammerwert | `[data-kategorie]:not` | Fehlalarm: CSS-Attributselektor [data-kategorie] |
| web/src/app/globals.css:679 | Tailwind-Klammerwert | `[data-kategorie]:not` | Fehlalarm: CSS-Attributselektor [data-kategorie] |
| web/src/app/globals.css:680 | Tailwind-Klammerwert | `[data-kategorie]:not` | Fehlalarm: CSS-Attributselektor [data-kategorie] |
| web/src/components/verwaltung/medienwahl/MedienWahlDialog.tsx:94 | Tailwind-Klammerwert | `max-h-[calc(100dvh-2rem)]` | offen: Designsystem-Lücke |
| web/src/components/verwaltung/medienwahl/MedienWahlDialog.tsx:94 | Tailwind-Klammerwert | `w-[calc(100%-2rem)]` | offen: Designsystem-Lücke |
| web/src/components/verwaltung/medienwahl/MedienWahlDialog.tsx:96 | Tailwind-Klammerwert | `max-h-[calc(100dvh-2rem)]` | offen: Designsystem-Lücke |
| web/src/components/verwaltung/styleguide/tokens.ts:33 | Hex-Farbe | `#0e3929` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:34 | Hex-Farbe | `#065f46` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:35 | Hex-Farbe | `#047857` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:36 | Hex-Farbe | `#d3f0e2` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:37 | Hex-Farbe | `#ebf9f2` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:38 | Hex-Farbe | `#1d1a17` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:39 | Hex-Farbe | `#514c46` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:40 | Hex-Farbe | `#68625b` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:41 | Hex-Farbe | `#8c857c` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:42 | Hex-Farbe | `#dfdad2` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:43 | Hex-Farbe | `#f3f0e9` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:44 | Hex-Farbe | `#fcfaf6` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:45 | Hex-Farbe | `#ffffff` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:46 | Hex-Farbe | `#af2b25` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:47 | Hex-Farbe | `#ffedea` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:48 | Hex-Farbe | `#81520a` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:49 | Hex-Farbe | `#fef2d9` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:50 | Hex-Farbe | `#225899` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:51 | Hex-Farbe | `#e9f3ff` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:52 | Hex-Farbe | `#047857` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:53 | Hex-Farbe | `#065f46` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:54 | Hex-Farbe | `#e7f8f0` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:55 | Hex-Farbe | `#592e81` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:56 | Hex-Farbe | `#592e81` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:57 | Hex-Farbe | `#f7f0ff` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:58 | Hex-Farbe | `#9b255a` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:59 | Hex-Farbe | `#9b255a` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:60 | Hex-Farbe | `#ffeef3` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:61 | Hex-Farbe | `#008c98` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:62 | Hex-Farbe | `#006177` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:63 | Hex-Farbe | `#e6f7fd` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:64 | Hex-Farbe | `#225899` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:65 | Hex-Farbe | `#e9f3ff` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:66 | Hex-Farbe | `#81520a` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:69 | Hex-Farbe | `#fef2d9` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:74 | Hex-Farbe | `#006177` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:75 | Hex-Farbe | `#e6f7fd` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:76 | Hex-Farbe | `#af2b25` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:77 | Hex-Farbe | `#ffedea` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:78 | Hex-Farbe | `#065f46` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:79 | Hex-Farbe | `#ebf9f2` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:80 | Hex-Farbe | `#514c46` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:81 | Hex-Farbe | `#f3f0e9` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:147 | px-Literal in Style | `'4px'` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:148 | px-Literal in Style | `'8px'` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:149 | px-Literal in Style | `'12px'` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:150 | px-Literal in Style | `'999px'` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:156 | Farbfunktion | `rgba(2` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:157 | Farbfunktion | `rgba(2` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/verwaltung/styleguide/tokens.ts:158 | Farbfunktion | `rgba(2` | bekannte Ausnahme: Styleguide-Spiegel |
| web/src/components/website/KonzeptHinweis.tsx:69 | Tailwind-Klammerwert | `w-[calc(100%-32px)]` | offen: Designsystem-Lücke |
| web/src/components/website/KonzeptHinweis.tsx:69 | Tailwind-Klammerwert | `max-w-[680px]` | offen: Designsystem-Lücke |
| web/src/components/website/OrgCard.tsx:76 | Tailwind-Klammerwert | `leading-[1.25]` | offen: Designsystem-Lücke |
| web/src/components/website/OrgCard.tsx:82 | Tailwind-Klammerwert | `underline-offset-[5px]` | offen: Designsystem-Lücke |
| web/src/lib/mail/vorlagen/Rahmen.tsx:39 | px-Literal in Style | `margin: 0` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:40 | px-Literal in Style | `padding: 0` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:44 | px-Literal in Style | `'16px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:52 | px-Literal in Style | `'0px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:53 | px-Literal in Style | `'0px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:56 | px-Literal in Style | `'1px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:57 | px-Literal in Style | `'1px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:68 | px-Literal in Style | `'24px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:75 | px-Literal in Style | `'2px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:76 | px-Literal in Style | `'0px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:77 | px-Literal in Style | `'2px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:80 | px-Literal in Style | `padding: 0` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:84 | px-Literal in Style | `'32px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:88 | px-Literal in Style | `'16px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:97 | px-Literal in Style | `'14px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/Rahmen.tsx:149 | px-Literal in Style | `'600px', '12px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/index.tsx:31 | px-Literal in Style | `'48px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/index.tsx:34 | px-Literal in Style | `'16px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/index.tsx:36 | px-Literal in Style | `'20px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/index.tsx:51 | px-Literal in Style | `'8px'` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/index.tsx:60 | px-Literal in Style | `'14px', margin: 0` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/mail/vorlagen/index.tsx:80 | px-Literal in Style | `'14px', margin: 0` | offen: E-Mail-Vorlage mit Inline-Stil (Begründung möglich, keine dokumentierte Ausnahme) |
| web/src/lib/seo/og-bild.tsx:58 | px-Literal in Style | `width: 1200, height: 630` | bekannte Ausnahme: Satori-OG-Bild |
| web/src/lib/seo/og-bild.tsx:66 | Hex-Farbe | `#fcfaf6` | bekannte Ausnahme: Satori-OG-Bild |
| web/src/lib/seo/og-bild.tsx:68 | Hex-Farbe | `#1d1a17` | bekannte Ausnahme: Satori-OG-Bild |
| web/src/lib/seo/og-bild.tsx:70 | Hex-Farbe | `#514c46` | bekannte Ausnahme: Satori-OG-Bild |
| web/src/lib/seo/og-bild.tsx:72 | Hex-Farbe | `#065f46` | bekannte Ausnahme: Satori-OG-Bild |
| web/src/lib/seo/og-bild.tsx:74 | Hex-Farbe | `#047857` | bekannte Ausnahme: Satori-OG-Bild |
| web/src/lib/seo/og-bild.tsx:76 | Hex-Farbe | `#d3f0e2` | bekannte Ausnahme: Satori-OG-Bild |

**Nicht gemessen:** Stichprobe unveränderter Dateien (das Werkzeug läuft nur auf dem geänderten Satz). „Stufe A je Paket“ und „jede neue Komponente nutzt das System“ sind nicht geprüft.

**Ergebnis Z-03: nicht erfüllt.** 9 von 253 geänderten Dateien haben Funde, davon 7 mit offenen Werten (6 Dateien mit echten Werten, dazu `globals.css` mit `#fff`). Die Ausnahmen sind belegt, die Fehlalarme begründet.

## 3. Z-05 Bewegung

Messweg: Momente B-06…B-09 (`momente4.mjs`), Bildrate CPU 4× (`protokolle/C-bildrate-b0N.json`), reduzierte Bewegung (`C-reduziert-b0N.json`); Bewegung auf Start, Über uns, Projekte, Organisation (`C-bewegung-*.json`); Leiste B-10 (`C-leiste-*.json`); Seitenwechsel B-05 (`C-vt-*.json`); Register-Abgleich (`C-keyframes.txt`, `C-animate-klassen.txt`) gegen KERN K-007.
Ziel laut ABNAHME: Momente ≤ 5 % verworfene Bilder; reduziert ohne Lage und Größe, alles sichtbar; jede Animation im Register.

**Momente, Bildrate unter 4× Drosselung** (Verwerfung nach Werkzeugregel, Abstand > 1,5 × 16,7 ms):

| Moment | Ziel | Läufe (verworfen %) | gepoolt | Max. Lauf | Ergebnis | Beleg |
|---|---|---|---|---|---|---|
| B-06 Tagesbogen (Start) | ≤ 5 % | 11,9 · 5,3 · 17,1 | 11,5 % | 17,1 % | **nicht erfüllt** | `protokolle/C-bildrate-b06.json` |
| B-07 Weg der Gemeinde | ≤ 5 % | 0 · 0 · 0 | 0 % | 0 % | erfüllt | `C-bildrate-b07.json` |
| B-08 Meilensteinlinie | ≤ 5 % | 0 · 0 · 0 | 0 % | 0 % | erfüllt | `C-bildrate-b08.json` |
| B-09 Familie der vier | ≤ 5 % | 8,7 · 5,2 · 9,3 | 7,8 % | 9,3 % | **nicht erfüllt** | `C-bildrate-b09.json` |

Die Bilder-Modi (`C-momente-b0N.json`, je 2 Läufe) und die reduzierte Fassung (`C-reduziert-b0N.json`) bestehen ohne Seitenfehler. Der Modus Bilder zeigt 18 laufende Animationen bei B-06 zum Auslösezeitpunkt.

**Reduzierte Bewegung, Momente** (`C-reduziert-b06.json` bis `b09.json`): bei allen vier Momenten 0 laufende Animationen nach 2 s, 0 Elemente mit Deckkraft < 1, 0 Elemente mit Skalierung, 0 laufende Layout-Animationen. Bei B-09 wurden 0 Elemente gezählt (`gezaehlt` 0); der Endzustand ist dort nur über das Bild `SP/bilder/stufe-c/momente/b09-reduziert.jpg` belegt, nicht über Zahlen.

**Bewegung auf den Routen** (6 Protokolle: `C-bewegung-start.json`, `-ueber-uns.json`, `-ueber-uns-scrollen.json`, `-projekte.json`, `-projekte-scrollen.json`, `-organisationen_ana-teskilati.json`): reduziert auf allen 6 Läufen ohne Befund (0 bewegte Elemente, keine Lageänderung, nichts unsichtbar nach 2 s oder nach Scrollen). Bildrate 4×: 0 verworfen auf 5 Läufen, 3 von 122 (2,5 %) auf der Organisationsseite.

**Leiste B-10** (`C-leiste-1440.json`, `C-leiste-390.json`, `C-leiste-390-aufgeklappt.json`, `C-leiste-reduziert-390.json`, `C-leiste-erstladen-390.json`):
- 1440: Wechsel gemessen (`gewechselt` true, nächstes Gebet Maghrib).
- 390 eingeklappt: keine Zeilen sichtbar, kein Wechsel gemessen (`gewechselt` false).
- 390 aufgeklappt: Zeilen vorhanden, kein Wechsel gemessen (nächstes Gebet bleibt „berechnet“).
- reduziert: keine Hervorhebungsanimation (`finished`, Dauer 0).
- Erstladen: `hervorhebungBeimLaden` null, keine Animation.
- Befund offen: der Wechsel bei 390 ist nicht eindeutig gemessen. Die Ursache ist nicht geklärt.

**Seitenwechsel B-05** (`C-vt-nachrichten.json`, `C-vt-start.json`, `C-vt-veranstaltungen.json`, `C-vt-b05.json`, `C-vt-reduziert.json`, `C-vt-zeitlupe-nachricht.json`, `C-vt-zeitlupe-veranstaltung.json`):
- Drei Paare (`/`→`/veranstaltungen`, `/veranstaltungen`→`/`, `/impressum`→`/datenschutz`) und die Karten-Strecken: `vt` 1 bei allen, mit je 9 Übergangs-Namen. Kopf fest (`kopfTop` 0 in allen Bildern).
- Reduziert: `vt` 0 bei allen 3 Paaren, Navigation gelingt (`zielErreicht` true).
- Zeitlupen-Bilder: Nachricht 5 Bilder, Veranstaltung 5 Bilder (Ersatztermin). Der Morph von Karte zu Detail ist in den Animationsnamen belegt (`view-transition-group(v-…-bild)`, `…-titel`).

**Register-Abgleich** (`C-keyframes.txt`, 9 Keyframes; Quelle `bau-head/web/src/app/globals.css` Zeilen 317–370 und Verwendungen):

| Keyframe | Register-Zuordnung (KERN K-007) |
|---|---|
| einblenden | B-03 (Öffnen, nur Deckkraft), B-11 (Erfolg), B-10 (Leiste, Name einblenden), Zusatz: generisch ~400 ms (Zeile 483, Zuordnung über Klasse offen) |
| ausblenden | B-03 (Aus), B-11 (Fehler-Aus) |
| auftritt | B-03 (Schublade, Gruppen), B-11 |
| zeichnen | B-06, B-07, B-08 (Linie), B-12 (Ladestern) |
| enthuellen | B-06 |
| wachsen | B-07 |
| aufziehen | B-09 |
| hervortreten | B-06, B-07, B-08 |
| schublade | B-03 (Telefonmenü) |

Nicht zuordenbar im Register:
- `animate-spin`, 1 Verwendung in `web/src/components/ui/sonner.tsx` Zeile 22 (Ladesymbol der Benachrichtigung, Drehung). Kein Register-Eintrag.
- `animate-in` und `animate-out`, insgesamt 16 Verwendungen (8 + 8) in den shadcn-Komponenten unter `web/src/components/ui/` (`dialog.tsx`, `sheet.tsx`, `dropdown-menu.tsx`, `tooltip.tsx`, `select.tsx`). Im Projekt ist kein Animations-Plugin eingebunden (`web/package.json` ohne `animate`, `web/src/app/globals.css` importiert nur `tailwindcss`). Die Klassen sind damit ohne Wirkung. Das ist Prüferbefund, kein Fehlalarm.

**Ergebnis Z-05: nicht erfüllt** (B-06 11,5 % und B-09 7,8 % verworfene Bilder unter 4× Drosselung, Ziel 5 %). Erfüllt: reduzierte Bewegung ohne Lage- oder Größenänderung, B-05 (vt-Status, reduziert). Teilweise: B-10 (390 nicht eindeutig), Register (zwei Klassen ohne Zuordnung).

## 4. Z-06 Grafik

Messweg: `svg3.mjs` (Werkzeug Prüfung g), `C-svg.json`, `C-svg.md`.
Ziel laut ABNAHME: eine Icon-Familie, alle SVG optimiert und zugänglich, keine doppelten IDs.

- 5 `.svg`-Dateien und 12 inline `<svg>` in `web/src`. Fehler 0 (keine eingebetteten Bilder, keine doppelten IDs). Befund 6, OK 11 (`protokolle/C-svg.md`). E0-Ausgang: 3 inline-SVG, 2 Befunde.
- **Befund 1 (5 Dateien):** `_lauf/lichtung/a/public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`. Standard-Vorlagengrafiken des Werkstattordners, im Commit 5d19108 versioniert (`git ls-tree 5d19108 -- _lauf/lichtung/a/public`). Nicht im Auslieferungspfad `web/`. Einordnung: offen, weil keine Ausnahme dokumentiert ist.
- **Befund 2 (Fehlalarm):** `web/src/components/formular/FormWizard.tsx` Zeile 32. Das Attribut `aria-hidden` steht in JSX ohne Wert und entspricht `aria-hidden="true"`. Der Abschnitt ist dekorativ. Das Werkzeug meldet ihn trotzdem.
- **Icon-Familie:** zwei Quellen. `lucide-react` (`web/package.json` Zeile 58) wird in 143 Dateien importiert (app 38, formular 4, ui 8, verwaltung 34, website 59). Das eigene `web/src/components/website/Icons.tsx` wird in 17 Dateien genutzt (app 4, verwaltung 1, website 12). Das ist keine Icon-Familie.
- Optimierung: nicht geprüft (das Werkzeug misst nur Einbettung, IDs, Rolle und viewBox).

**Ergebnis Z-06: nicht erfüllt.** Zwei Icon-Quellen, 5 ungeklärte Vorlagen-Grafiken außerhalb von `web/`, 12 inline-SVG gegen 3 in E0.

## 5. Z-07 Zugänglichkeit

Messweg: axe-core WCAG 2.2 AA (`a11y.mjs`, `axe-regeln3.mjs`) bei 390 und 1440; Tastatur (`tastatur.mjs`, mit Hauptaufgaben bei 390); Menü-Fokus (`menue-fokus.mjs`).
Ziel laut ABNAHME: 0 ernste oder kritische Befunde; Tastatur mit sichtbarem Fokus; Kontraste.

**axe:**

| Lauf | Routen | kritisch | ernst | Verstöße (Regel-IDs) | unklar (nur `color-contrast`) |
|---|---|---|---|---|---|
| de 390 | 25 | 0 | 0 | keine | 11 Routen (je 1) |
| de 1440 | 25 | 0 | 0 | keine | 12 Routen (je 1) |
| tr 390 | 11 | 0 | 0 | keine | 8 Routen |
| en 1440 | 3 | 0 | 0 | keine | 3 Routen |

Belege: `protokolle/C-a11y-390.md`, `C-a11y-1440.md`, `C-axe-regeln-390.json`, `C-axe-regeln-1440.json`, `C-axe-regeln-tr-390.json`, `C-axe-regeln-en-1440.json`. Die Route `/gibt-es-nicht` ist mit 404 enthalten, ohne Befund. E0: „unklar“ auf 8 Routen (ABNAHME). Die Zahl der unklaren Kontrast-Fälle steigt damit. Ursache nicht geprüft.

**Tastatur** (`protokolle/C-tastatur-390.md`, `C-tastatur-1440.md`, 11 Routen je Breite):
- Sprunglink auf allen 22 Läufen ok.
- 390: 0 Befunde (Ziele 16 bis 32 je Route).
- 1440: 1 Befund: `/kontakt`, Checkbox „Wird überprüft...“ (Tab 21), fokussierbar, aber 22 × 22 px oder abgeschnitten („ziel unsichtbar“, Bild im Protokoll).
- POST 0 in allen Läufen.

**Hauptaufgaben** (390, KERN K-002, `C-tastatur-390.md`): a) Gebetszeit ok (5 Tabs), b) Veranstaltung bis zur Anmeldung ok (13 Tabs, Detailseite ohne Formular, Hinweis „keine Anmeldung nötig“), c) Voranmeldung bis „Weiter“ ok (20), d) Kontakt bis „Absenden“ ok (15, nicht gedrückt), e) Suche ok (6). POST 0.

**Menü-Fokus** (`protokolle/C-menue-fokus.json`): bestanden. Öffnen, Fokus im Dialog, Tab-Runde ohne Austritt, Umschalt+Tab auf das letzte Ziel, Escape schließt und setzt den Fokus auf den Menü-Knopf.

**Ergebnis Z-07: teilweise.** Erfüllt: 0 ernste oder kritische Befunde auf 64 Routen-Läufen (25 + 25 + 11 + 3), Sprunglink, Menü-Fokus, Hauptaufgaben. Offen: 1 Fokus-Befund (1440, `/kontakt`), 11 bis 12 Routen mit unklarem Kontrast.

## 6. Z-08 Leistung

Messweg: Lighthouse mobil, je Route 3 Läufe auf 3100, danach 3 Läufe auf 3500 (`lighthouse.mjs`). Rohdaten nach `protokolle/C-lighthouse/route-NN-3100.json` und `route-NN-3500.json` (kopiert, 22 Dateien). Route-Nummer und Pfad: `routen-hauptansichten.json`.
Ziel laut ABNAHME: BUDGETS (Perf ≥ 90, A11y 100, BP/SEO ≥ 95, LCP ≤ 2,5 s, CLS ≤ 0,1, TBT ≤ 200 ms, JS ≤ 180 kB gz); keine Ansicht schlechter als E0 minus Spanne.

Werte: Median aus 3 Läufen (`median`). Spanne: Differenz zwischen größtem und kleinstem Performance-Lauf des Ausgangsstands 3100 je Route (`spanneLeistung`). Paarregel: Median 3500 ≥ Median 3100 − Spanne 3100.

| Route | Perf 3100 | Perf 3500 | Δ | Spanne 3100 | Verfehlt 3500 | LCP 3100 / 3500 (ms) | CLS 3100 / 3500 | TBT 3100 / 3500 (ms) | JS 3100 / 3500 (kB gz) | A11y · BP · SEO 3500 |
|---|---|---|---|---|---|---|---|---|---|---|
| / | 82 | 80 | -2 | 3 | Performance, TBT | 1920 / 1906 | 0.002 / 0.01 | 656 / 732 | 168 / 175.3 | 100 · 100 · 100 |
| /gebetszeiten | 88 | 91 | +3 | 5 | TBT, JS | 1771 / 1814 | 0 / 0 | 460 / 320 | 174.1 / 180.9 | 100 · 100 · 100 |
| /veranstaltungen | 91 | 82 | -9 | 7 | Performance, TBT | 1841 / 1977 | 0.002 / 0 | 345 / 614 | 170.7 / 174.1 | 100 · 100 · 100 |
| /veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag | 91 | 89 | -2 | 3 | Performance, TBT | 2132 / 2193 | 0.002 / 0 | 295 / 321 | 171.5 / 174.9 | 100 · 100 · 100 |
| /nachrichten | 92 | 88 | -4 | 6 | Performance, TBT | 1773 / 1878 | 0.002 / 0 | 313 / 402 | 170.5 / 173.8 | 100 · 100 · 100 |
| /ueber-uns | 91 | 93 | +2 | 2 | TBT | 1795 / 1963 | 0.002 / 0 | 320 / 253 | 168 / 171.8 | 100 · 100 · 100 |
| /projekte | 93 | 86 | -7 | 8 | Performance, TBT | 1826 / 1910 | 0.002 / 0 | 272 / 466 | 168 / 171.8 | 100 · 100 · 100 |
| /organisationen/ana-teskilati | 85 | 89 | +4 | 5 | Performance, TBT | 2243 / 2201 | 0.002 / 0 | 453 / 336 | 168 / 171.4 | 100 · 100 · 100 |
| /bildung/korankurse | 92 | 83 | -9 | 17 | Performance, TBT | 1812 / 1998 | 0.002 / 0 | 298 / 593 | 168 / 171.4 | 100 · 100 · 100 |
| /bildung/voranmeldung | 93 | 92 | -1 | 3 | TBT | 1899 / 1810 | 0.002 / 0 | 261 / 295 | 170.9 / 174.3 | 100 · 100 · 100 |
| /kontakt | 93 | 88 | -5 | 1 | Performance, TBT | 1897 / 1938 | 0.002 / 0 | 255 / 415 | 171.4 / 174.8 | 100 · 100 · 100 |

Zusammenfassung:
- **Performance ≥ 90:** 3100 auf 8 von 11 Routen, 3500 auf 3 von 11 Routen (`/gebetszeiten` 91, `/ueber-uns` 93, `/bildung/voranmeldung` 92).
- **TBT ≤ 200 ms:** auf keiner Route erfüllt. Beide Seiten: min 253 ms (3500, `/ueber-uns`), max 732 ms (3500, `/`).
- **LCP ≤ 2,5 s:** erfüllt auf allen Routen beider Seiten (max 2243 ms bei 3100, 2201 ms bei 3500).
- **CLS ≤ 0,1:** erfüllt (max 0,01).
- **A11y 100, BP und SEO ≥ 95:** erfüllt auf allen Routen (100 · 100 · 100).
- **JS ≤ 180 kB gz:** 3100 alle ≤ 174,1 kB. 3500 alle ≤ 175,3 kB außer `/gebetszeiten` mit 180,9 kB.
- **Paarregel:** nach der Spanne des Ausgangsstands verfehlen `/veranstaltungen` (Δ −9, Spanne 7) und `/kontakt` (Δ −5, Spanne 1). Mit der größeren der beiden Spannen liegen beide innerhalb. Die strenge Lesart ist hier die Vorgabe „Spanne des Ausgangsstands“. Die Entscheidung über die Lesart liegt beim Orchestrator.
- **Nicht gemessen:** Bewegung ≤ 60 kB (kein eigener Lauf), Cockpit.

**Ergebnis Z-08: nicht erfüllt.** TBT auf allen Routen über dem Budget, Performance-Budget auf 8 von 11 Routen verfehlt, JS-Budget bei `/gebetszeiten` (180,9 kB). Paarregel nach strenger Lesart auf 2 Routen verfehlt. Last zu Beginn 0,32 (ruhig), während des Laufs 1,3 bis 1,9.

## 7. Z-09 Darstellung

Messweg: Bildsatz 390, 768 und 1440 (`bildsatz.mjs`): horizontales Scrollen, abgeschnittener Text, über den Rand ragende Elemente. Protokolle `C-bildsatz*.json`, Bilder `SP/bilder/stufe-c/bildsatz*/`.

| Satz | Routen × Breiten | Querscrollen | abgeschnitten | über den Rand (Befund) | HTTP ≠ 200 |
|---|---|---|---|---|---|
| de | 25 × 3 | 0 | 0 | 2 Routen bei 390 | nur `/gibt-es-nicht` (404, Probe) |
| de reduziert | 25 × 3 | 0 | 0 | 2 Routen bei 390 | wie de |
| tr | 11 × 3 | 0 | 0 | 1 Route bei 390 | keine |
| en | 3 × 3 | 0 | 0 | 1 Route bei 390 | keine |

Die vier Befunde sind alle `span.min-w-0.truncate` mit Auslassungszeichen, vom Werkzeug als vermutlich beabsichtigt markiert (`C-bildsatz.json`: `/veranstaltungen/freitagsgebet-mit-anschliessendem-vortrag` 390, `/nachrichten/neue-gebetszeiten-fuer-den-winter` 390; `C-bildsatz-tr.json`, `C-bildsatz-en.json` jeweils die Freitagsgebet-Seite). E0: `/nachrichten` 9 Textelemente bei 390 über den Rand. Dieser Befund ist behoben (`/nachrichten` hat im Bildsatz keinen Befund mehr). Eine Sichtprüfung der vier Auslassungen hat der Prüfer nicht durchgeführt.

**Ergebnis Z-09: teilweise.** Kein Querscrollen auf 75 + 75 + 33 + 9 Messungen. Offen: 4 Auslassungen bei 390 (vermutlich beabsichtigt, Sichtprüfung offen).

## 8. Z-11 Vercel

Messweg: `vercel build` in einer Archivkopie von 5d19108 (ohne DB), preview und production; NFT der OG-Dateien; `crons` und `regions` in `.vercel/output/config.json`; V-Prüfliste V-01 bis V-13 mit Beleg.

**Build:**
- preview: rc=0, 536 Zeilen (`protokolle/C-vercel-build-preview.log`). Warnung: „DATABASE_URL fehlt – Bau mit Beispielinhalten“ (erwartet, ADR 0017).
- production: rc=0, 452 Zeilen (`protokolle/C-vercel-build-production.log`). Warnungen: „You should not upload the `.next` directory“ (CLI-Hinweis), dieselbe DB-Warnung.
- Fehlerzeilen: keine.

**NFT der OG-Dateien** (Protokoll `C-lauf.log`): `symbol-512.png`, `source-serif-4-latin-600-normal.woff`, `atkinson-hyperlegible-next-latin-700-normal.woff` je in 3 OG-Spuren.

**Config** (`/tmp/…/scratchpad/stufe-c/kopie/.vercel/output/config.json`):
- crons: `/api/wartung/loeschfristen` `0 1 * * *`, `/api/wartung/mail-ausgang` `0 2 * * *`.
- regions: im Build-Output nicht nachweisbar (0 von 4 `.vc-config.json` enthalten `regions`). Im Prüflingsstand steht `"regions": ["fra1"]` in `vercel.json` (Zeile 3). Die Dashboard-Einstellung bleibt ML-22.

**V-Prüfliste** (Stand laut ABNAHME, 2026-10-12 04:50; Prüfung des Prüfers):

| V | Befund des Prüfers | Beleg | Ergebnis |
|---|---|---|---|
| V-01 | `vercel.json` mit `$schema`, `regions`, `crons`, `services.web.ignoreCommand`; `web/package.json` mit `engines` node 24.x und `packageManager` pnpm@12.11.2; `.vercelignore` vorhanden; Build akzeptiert | `git show 5d19108:vercel.json`, `:web/package.json`, `C-vercel-build-*.log` | erfüllt (Datei) |
| V-02 | preview und production rc=0 | `C-vercel-build-preview.log`, `C-vercel-build-production.log`, `C-lauf.log` | erfüllt |
| V-03 | `VERCEL-ENV.md`, `VERCEL.md`, `GO-LIVE.md` vorhanden; startklar und Geheimnisprüfung grün (Entwicklung startklar ok) | `web/docs/deploy/*.md`, `C-release-check.log`, `C-startklar-entwicklung.json` | erfüllt |
| V-04 | `attachDatabasePool` in `web/src/lib/db/index.ts` Zeile 2; Frankfurter Konto ist Menschen-Aufgabe | `git grep attachDatabasePool 5d19108` | teilweise (Konto offen, ML) |
| V-05 | Commit 47ed617 ist in 5d19108 enthalten; Blob-Region nicht nachgemessen | `git merge-base --is-ancestor` | teilweise (nur Commit-Beleg) |
| V-06 | Crons (täglich), `CRON_SECRET` in Wartungsrouten, `mitSperre` in `loeschfristen/route.ts` Zeile 18 | `C-vercel-build-*.log`, `C-startklar-*.json` | erfüllt |
| V-07 | Beleg `protokolle/H-V07-V10-pruefung.md` vorhanden; nicht in Stufe C nachgemessen | Datei vorhanden | teilweise (nicht nachgemessen) |
| V-08 | gemessen: statische Datei `public, max-age=31536000, immutable`; Startseite `s-maxage=3600, stale-while-revalidate=82800` (lokal 3500); Beleg `berichte/H-V08.md` | `curl -I` auf 3500 (Ergebnis hier) | erfüllt |
| V-09 | `noindex` im Code (Commit 263cd1d in 5d19108 enthalten); lokal kein `robots`-Meta (Vorschau-Modus nicht aktiv); Vercel Authentication und Link Menschen (ML-23) | `git merge-base`, `curl` auf 3500 | teilweise |
| V-10 | `/api/health` 200, Body `{"status":"ok"}` (gemessen); Runbook VERCEL.md §§ 12, 13, 16 vorhanden; Beleg `protokolle/H-V07-V10-pruefung.md` | `curl` 3500, `web/docs/deploy/VERCEL.md` | erfüllt (Dokumente; Übung nicht gemessen) |
| V-11 | `web/docs/recht/VERARBEITUNGSVERZEICHNIS.md` und `datenschutz-hosting-v2.md` vorhanden; Hosting-Baustein als Entwurf, `v2_eingespielt` 0; Freigabe Menschen (ML-11, ML-12) | `protokolle/C-wortlaut.json` | teilweise (Freigabe offen) |
| V-12 | ML-09 in `_werkstatt/MENSCHEN.md` Zeile 33 vorhanden; Angabe „läuft bereits auf Pro“ mit „[prüfen: im Team-Konto]“ markiert | `_werkstatt/MENSCHEN.md` | erfüllt (Eintrag) |
| V-13 | VERCEL.md, GO-LIVE.md vorhanden; Vorschauprüfung je Tor: Stufe C auf 3500, Vorschau auf Vercel nicht per MCP geprüft | Dateien, dieser Bericht | teilweise |

Commit-Belege aus der ABNAHME-Tabelle sind alle in 5d19108 enthalten (0c224da, c596742, 263cd1d, 0cd8173, 47ed617, 8df9556, 290aaeb, f08432e, 352d1bb, abd187e, d26e8bc, 560161e, 8da8efe, 25e8040, 6596a6e, f44119b, e6d900f, 06f3526).

**Ergebnis Z-11: teilweise.** Build ok, Crons ok, OG-NFT ok, Vorschau auf Vercel nicht geprüft, Konto- und Freigabepunkte offen.

## 9. Z-12 Recht und Startklar

Messweg: `release:check` (Abschnitt 1), `startklar` in beiden Betriebsarten (JSON, ohne Werte), Abgleich der Prüfungs-IDs mit `_werkstatt/berichte/H-D04.md` (Abschnitt „Startklar-Zuordnung“), Wortlaut `wortlaut.mjs` (Abschnitt 0 und 7c).

**startklar** (`protokolle/C-startklar-entwicklung.json`, `C-startklar-produktion.json`, Datenbank als PGlite-Kopie):

| Betriebsart | Prüfungen | ok | warnung | fehler | manuell | Hinweis | startklar |
|---|---|---|---|---|---|---|---|
| entwicklung | 11 | 3 | 4 | 0 | 2 | 2 | ja |
| produktion | 23 | 2 | 3 | 15 | 3 | 0 | nein |

**Zuordnung:** Alle 21 Prüfungen mit fehler, warnung oder manuell in der Produktion sind in H-D04 zugeordnet. Keine neue ID ohne Zuordnung. Die Entwicklung hat 8 Befunde (warnung, manuell, Hinweis), alle in H-D04 zugeordnet. Die Zuordnung ist ID-genau: `umgebung.DATABASE_URL`, `…BETTER_AUTH_SECRET`, `…EINGANG_SCHLUESSEL`, `…RATE_GEHEIMNIS`, `…ALTCHA_GEHEIMNIS`, `…WARTUNG_TOKEN`, `…MAIL_TRANSPORT`, `…MAIL_ABSENDER`, `…SMTP_HOST`, `…APP_URL`, `…PROXY_VERTRAUEN`, `auslieferung.https`, `inhalte.konzepthinweis`, `recht.impressum`, `recht.datenschutz` (fehler); `auslieferung.domain`, `inhalte.gebetszeiten`, `inhalte.beispiele` (warnung); `auslieferung.region`, `auslieferung.schutz`, `mail.dns` (manuell).

**Wortlaut** (`protokolle/C-wortlaut.md`, `C-wortlaut.json`): 723 Rechtseinträge, 637 gleich, 85 neu, 1 entfernt, 0 geändert. Offene Befunde „hoch“ nach Ausnahmen: 0 (Erstfassung 3, siehe Abschnitt 0). Die 85 neuen Einträge verteilen sich auf `VERARBEITUNGSVERZEICHNIS.md` (27), `datenschutz-hosting-v2.md` (23, Hosting-Baustein v2 als Entwurf, nicht eingespielt), `lib/startklar/pruefungen.ts` (20), `web/messages/verwaltung/startklar.json` (8), `meldung.json` und `rechtliches.json` (je 3) sowie `Rahmen.tsx` (1). Dazu kommt ein entfernter Eintrag bei `Rahmen.tsx`. Beide sind der `font-family`-Befund (A-07).

**Ergebnis Z-12: teilweise.** `release:check` grün (startklar übersprungen). Startklar Produktion nicht grün (15 fehler, 3 manuell, Menschen-Aufgaben, vollständig in H-D04 zugeordnet). Wortlaut ohne offene „hoch“-Befunde nur mit den nachträglichen Ausnahmen A-06 und A-07.

## 10. Liste der nicht erfüllten oder teilweise erfüllten Punkte (wirksamste zuerst)

1. **Z-08 Leistung, TBT und Performance-Budget:** TBT 253 bis 732 ms auf allen 11 Routen (Ziel 200). Performance ≥ 90 nur auf 3 von 11 (Ausgangsstand: 8). `/gebetszeiten` JS 180,9 kB (Ziel 180). Paarregel: `/veranstaltungen` (−9, Spanne 7) und `/kontakt` (−5, Spanne 1) nach strenger Lesart verfehlt. Beleg: `protokolle/C-lighthouse/route-NN-3100.json` und `-3500.json`, Tabelle Abschnitt 6.
2. **Z-05 Momente:** B-06 Tagesbogen 11,5 % verworfene Bilder (Max 17,1 %), B-09 Familie der vier 7,8 % (Max 9,3 %), Ziel ≤ 5 %. Beleg: `protokolle/C-bildrate-b06.json`, `C-bildrate-b09.json`.
3. **Z-03 Designsystem:** 31 offene Werte in 7 Dateien, davon 16 px und Hex in der E-Mail-Vorlage `web/src/lib/mail/vorlagen/Rahmen.tsx`, 6 in `vorlagen/index.tsx`, 3 im `MedienWahlDialog.tsx`, je 2 in `KonzeptHinweis.tsx` und `OrgCard.tsx`, 1 in `layout.tsx`, 1 `#fff` in `globals.css` Zeile 535. Beleg: `protokolle/C-freie-werte.md`, Tabelle Abschnitt 2.
4. **Z-02 Funktionen, F-08:** Schreibweise der H1 auf `/projekte` (3500: „Gemeinsam glauben, gemeinsam wachsen“, Erwartung „Gemeinsam Glauben, Gemeinsam Wachsen“), schlechter auf 2 Zellen. Beleg: `protokolle/C-funktionsliste-3500.json` (F-08), `werkzeuge/funktionsliste.mjs` Zeile 342.
5. **Z-06 Grafik:** 2 Icon-Quellen (`lucide-react` in 143 Dateien, `Icons.tsx` in 17), 5 ungeklärte SVG-Vorlagen in `_lauf/lichtung/a/public/`, 12 inline-SVG (E0: 3). Beleg: `protokolle/C-svg.md`.
6. **Z-07 Tastatur und Kontrast:** 1 Fokus-Befund 1440 bei `/kontakt` (Checkbox „Wird überprüft...“, 22 × 22 px oder abgeschnitten). Unklare Kontraste auf 11 bis 12 Routen (E0: 8). Beleg: `protokolle/C-tastatur-1440.md`, `C-axe-regeln-1440.json`.
7. **Z-12 Startklar Produktion:** 15 fehler, 3 manuell, 3 warnung (Menschen-Aufgaben). Beleg: `protokolle/C-startklar-produktion.json`, `_werkstatt/berichte/H-D04.md`.
8. **Z-11 Vercel:** Vorschau auf Vercel nicht per MCP geprüft (Ziel: Vorschau ohne Fehler auf Hauptansichten). `regions fra1` im Build-Output nicht nachweisbar, nur in `vercel.json`. Konto- und Freigabepunkte V-04, V-09, V-11, V-13. Beleg: `protokolle/C-vercel-build-*.log`, `vercel.json`.
9. **Z-05 Leiste B-10:** Wechsel bei 390 px nicht eindeutig gemessen (eingeklappt ohne Zeilen, aufgeklappt ohne Wechsel). Beleg: `protokolle/C-leiste-390.json`, `C-leiste-390-aufgeklappt.json`.
10. **Z-05 Register:** `animate-spin` (`web/src/components/ui/sonner.tsx` Zeile 22) und `animate-in`/`animate-out` (16 Verwendungen in `web/src/components/ui/`) ohne Register-Eintrag, die letzteren ohne Wirkung. Beleg: `protokolle/C-animate-klassen.txt`, `C-keyframes.txt`.
11. **Z-09 Auslassungen bei 390:** 4 Stellen mit `truncate` (vermutlich beabsichtigt), Sichtprüfung offen. Beleg: `protokolle/C-bildsatz.json`, `C-bildsatz-tr.json`, `C-bildsatz-en.json`.
Hinweis zu 5c und 7c: beide Abweichungen stehen mit Grund und Wiederholung in Abschnitt 0. Die Wiederholungen sind gelaufen und in den Protokollen belegt.

## 11. Nicht geprüft und Grenzen

- Echte Geräte nicht vorhanden (UA-01): Emulation 390, 768 und 1440, Chromium 141 (UA-04).
- Vercel-Vorschau über den Vercel-MCP nicht geprüft; der Build lief lokal in der Archivkopie ohne Datenbank.
- Verwaltungsflüsse mit Anmeldestand nur auf 3500 mit `verwaltung-state.json` (F-20, F-21) gemessen; auf 3100 ohne Anmeldestand.
- Stichprobe für Z-03 nicht Teil des Werkzeugs.
- Bewegung ≤ 60 kB, Cockpit und Lighthouse-Lauf im Cockpit nicht gemessen.
- Hauptaufgaben nur bei 390 gemessen (Werkzeugdesign).
- Die V-Punkte mit Konto- und Freigabe-Anteil sind Menschen-Aufgaben und nicht Teil dieser Messung.
- Lighthouse-Ergebnisse streuen je Route stark (Spanne im Ausgangsstand 1 bis 17 Punkte). Der Paarvergleich ist nur mit den Spannen lesbar.

## 12. Rohdaten und Belegorte

- Protokolle: `/home/user/IGMG/_werkstatt/protokolle/C-*` (Abläufe `C-lauf.log`).
- Lighthouse-Rohdaten: `/home/user/IGMG/_werkstatt/protokolle/C-lighthouse/`.
- Bilder: `SP/bilder/stufe-c/`.
- Zwischenstände und Kopien: `SP/stufe-c/` (`erstfassung-7/`, `fehlschlag-5c-veranstaltung.log`, `last-vor-lighthouse.txt`, `lh/`, `kopie/`).
