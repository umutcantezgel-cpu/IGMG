# Stufe C · Prüfer k3 · Z-01, Z-02, Z-10, Z-21

Zeitpunkt: 15.10.2026, 02:55–03:45 UTC. Nur gelesen, nichts im Repository geändert (`git status --short` leer vor und nach
dem Lauf). Alle Protokolle und Bilder liegen unter
`/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k3/` (im Folgenden `K/`).

## Prüfling

- `origin/main` = **75cad0a** (Merge Feinschliff Runde 3, 14.10. 18:23:03 UTC). Branch-HEAD `claude/trusting-lovelace-6nfolz`
  = 39f03da; zwischen 75cad0a und 39f03da ändern sich nur `_gemeinde/` (BERICHT, PRUEFPUNKT, `.gitignore`, 18 Galeriebilder),
  kein Code (`git diff --stat 75cad0a HEAD`: 21 Dateien, alle unter `_gemeinde/`).
- Hinweis: der **lokale** Zweig `main` steht auf 71e263f (Merge PR #3 des Vorlaufs) und ist veraltet; maßgeblich ist `origin/main`.
- Server http://localhost:3100: PID 341 `next-server (v16.4.0)`, cwd `/home/user/IGMG/web`, `.next/BUILD_ID` =
  `IMdqfKcRXVgGFSjcXiIg5` vom 14.10. 18:40:11 UTC (nach 75cad0a, App-Code identisch mit HEAD), `SITE_MODE=vorschau`,
  `BAU_PGLITE=1`, `/api/health` → `{"status":"ok"}`.

---

## Z-01 Plan – **teilweise**

Schwelle: 100 % Pflicht, Kür nach Priorität, PLAN mit Commits. Grundlage: Funktionskatalog `_gemeinde/AUFTRAG.md:85-114`
(19 Pflichtzeilen 87–105, K-A 106–113, K-B 114) gegen den Code (Stichprobe Route/Komponente/Test je Zeile).

### Pflicht (19 Zeilen): 16 vollständig, 3 mit Lücken

| AUFTRAG | Funktion | Route / Komponente | Test | Urteil |
|---|---|---|---|---|
| :87 | Koran-Leser (Text, Übersetzungen, Lesemodi, Lesezeichen lokal, Cüz, Druck) | `/quran`, `/quran/[sure]`, `/quran/cuz/[nr]`; `web/src/components/website/quran/QuranLeser.tsx:84,187` (Modus), `:401-403` (Lesezeichen, localStorage), `quran.css:456` (`@media print`) | `tests/unit/quran-leser.test.ts`, `tests/e2e/quran-leser.spec.ts` | erfüllt |
| :88 | Wortkarte + Werkstatt Wortbedeutungen (Freigabe) | `website/quran/Wortkarte.tsx:90,156`; `/verwaltung/koran/woerter/[sure]/[form]` | `tests/integration/verwaltung-koran.test.ts` (18) | erfüllt |
| :89 | Tajwid (Farbe + Unterstreichung, Leiste, Regeltexte) | `TajwidLeiste.tsx`, `quran.css:179` (underline), `/quran/tajwid`, `/verwaltung/koran/tajwid/[schluessel]` | `tests/unit/quran-daten.test.ts` | erfüllt |
| :90 | Player (Vers/Wort, Wiederholen, Tempo) | `website/quran/Player.tsx:10-11,22-34` | `tests/e2e/quran-leser.spec.ts` | erfüllt |
| :91 | Rezitations-Werkstatt (Aufnahme/Upload, Stille, Mitklopfen) | `/verwaltung/rezitationen/[id]/abgleich/[sure]`; `src/lib/audio/abgleich.ts:2,23` (Stillephasen, RMS); `verwaltung/rezitationen/Mitklopfen.tsx` | `tests/unit/audio-abgleich.test.ts`, `rezitation-werkstatt.test.ts`, `tests/integration/verwaltung-rezitationen.test.ts` (16) | erfüllt |
| :92 | Import lizenzierter Gesamtrezitation + quran-align | `web/scripts/rezitation-import.ts:1-11`; `src/lib/audio/import.ts:120-122` | `tests/unit/rezitation-manifest.test.ts` | erfüllt (Code) |
| :93 | Hadith Bukhari (97 Bücher, Kapitel, Bezüge, Bewertung, Auswahl, Suche) | `/hadith/bukhari/[buch]/teil/[teil]`, `/hadith/auswahl`; `HadithListe.tsx:22-23,86`; `/suche` mit `sucheHadith` | `tests/integration/hadith.test.ts:122`, `tests/unit/hadith-anzeige.test.ts:35-66` | erfüllt |
| :94 | Elifbe (28 + Hamza, Formen, Lektionen, Übungen, Schreibweg), `/lernen` | `/elifbe/buchstaben/[buchstabe]`, `/elifbe/lektion/[lektion]`, `/elifbe/ueben`, `/lernen`; `src/lib/elifbe/alphabet.ts:2-3` | `tests/unit/elifbe-alphabet.test.ts:9-18` (29 Einträge), `elifbe-schreibweg.test.ts`, `tests/e2e/elifbe.spec.ts` | erfüllt |
| :95 | Gebetszeiten „Mein Ort“, Qibla | `website/gebetszeiten/MeinOrt.tsx`, `MeinOrtRechner.tsx`, `QiblaKompass*.tsx` | `tests/unit/gebetszeiten-ort.test.ts`, `gebetszeiten/qibla.test.ts`, `tests/e2e/gebetszeiten-mein-ort.spec.ts` | erfüllt |
| :96 | Konten (Kind < 16 mit Benutzername), Mein Bereich | `/anmelden`, `/registrieren`, `/mein-bereich/*`; `src/lib/konto/benutzername.ts:2-10` | `tests/unit/sechzehn.test.ts:6,16`, `tests/integration/konten.test.ts` (16), `tests/e2e/konten.spec.ts` | erfüllt |
| :97 | Lernplattform (Gruppen, Aufnahme, Anwesenheit, Fortschritt, Hifz, Eltern) | `/verwaltung/gruppen`, `/verwaltung/lernende`; `mein-bereich/unterricht/[gruppe]/anwesenheit/[termin]`, `…/fortschritt`; `unterricht/HifzEintragen.tsx`; `mein-bereich/kinder/[id]`; `src/lib/lernen/aufnahme.ts:11-23` | `tests/integration/verwaltung-aufnahme.test.ts` (9), `mein-bereich-lernen.test.ts` (14), `tests/e2e/mein-bereich-lernen.spec.ts` | erfüllt |
| :98 | Moderierter Gruppen-/Elternkanal (S-01…S-18) | `mein-bereich/gruppen/[id]/chat`, `…/moderation`, `/verwaltung/kinderschutz`, `api/mein/chat/[kanal]` | `tests/integration/chat.test.ts` (25), `tests/unit/chat-regeln.test.ts`; S-01…S-18 je 3–19 Fundstellen in `web/src`+`web/tests` | erfüllt |
| :99 | **Web Push opt-in (Gebet, Ankündigung, Chat, Unterricht) + Rückfall Mail/In-Seite** | Opt-in `PushEinstellungen.tsx:105,137`; Versand Gebet `src/lib/push/abo.ts:141-175`, Chat `src/server/actions/chat.ts:64`, Unterricht `lehrkraft.ts:60` | `tests/integration/push.test.ts`, `tests/unit/push.test.ts` | **teilweise**: Thema „ankuendigung“ wählbar (`src/lib/validierung/push.ts:5`, Nutzlast `src/lib/push/senden.ts:11`), aber **kein Aufruf** sendet es (`grep sendeAnAbo/sendeGruppenPush` → nur Gebet, Chat, Unterricht, Probe; `src/server/actions/ankuendigungen.ts` ohne Push). **Rückfall fehlt**: keine Mail-Zusammenfassung (Mail-Vorlagen nur `Rahmen`, `newsletter`, `konto-vorlagen`), keine In-Seite-`Notification` (einziger Treffer `Notification.requestPermission`, `PushEinstellungen.tsx:137`). Gefordert in `AUFTRAG.md:99,229`, ADR 0034:24. `docs/handbuch/eltern.md:105` verspricht eine Mail-Erinnerung. |
| :100 | **CMS** (freie Seiten, Blöcke, Menüs, Startseiten-Abschnitte, Revisionen, Zeitplan, Weiterleitungen, Freigaben, Islamisches Wissen) | `[locale]/[...rest]`, `/verwaltung/seiten/[id]/revisionen`, `/verwaltung/menues`, `/verwaltung/weiterleitungen`, `/verwaltung/freigaben`, Zeitplan `src/server/actions/seiten.ts:270`, Vorschau `/verwaltung/vorschau/[token]` | `tests/integration/verwaltung-cms.test.ts` (17), `tests/unit/cms-bloecke.test.ts`, `tests/e2e/cms.spec.ts` | **teilweise**: „Startseite: Abschnitte sortierbar“ (`AUFTRAG.md:334`) fehlt – kein Modul in `components/verwaltung/shell/module.ts`, keine Route `verwaltung/(geschuetzt)/startseite`; `docs/handbuch/redaktion.md:91` beschreibt es trotzdem. „Islamisches Wissen“ als Verwaltungsmodul (`AUFTRAG.md:335`) fehlt – `wissenThema` wird nur gelesen (`src/server/queries/wissen.ts`), keine Action/Route in der Verwaltung. |
| :101 | Anzeige per CMS (Folien, Iqama, Freitagsmodus, Ruhe) | `/verwaltung/anzeige/*`, `/gebetszeiten/anzeige`, `website/anzeige/AnzeigeLive.tsx:31,49,164,299`; `src/lib/anzeige/einstellung.ts:5-13` | `tests/unit/anzeige-plan.test.ts:17-43`, `anzeige-folien.test.ts`, `tests/integration/verwaltung-anzeige.test.ts` (10), `tests/e2e/verwaltung-anzeige.spec.ts` | erfüllt |
| :102 | Moschee 2026 (Seeds, Inhaltsmigration, Texte, Cockpit) | `drizzle/seeds/bereiche/projekte.ts:11-24`, `scripts/inhalte-2026.ts`, `src/lib/inhalt/stand-2026.ts`, Cockpit `src/lib/startklar/pruefungen.ts:331-364` | `tests/unit/inhalte-2026.test.ts` (9), `tests/integration/inhalte-2026.test.ts` (7) | erfüllt |
| :103 | `/barrierefreiheit`, `/quellen` | beide 200 auf 3100, Konsole 0 | `tests/e2e/barrierefreiheit.spec.ts` | erfüllt |
| :104 | **Bestandslücken: K-29, Voranmeldung ↔ Kurs** | K-29: `src/server/actions/medien.ts:65-72,135` | K-29: `tests/integration/verwaltung-medien.test.ts:104` | **teilweise**: K-29 erfüllt. Voranmeldung ↔ Kurs nur mittelbar: Aufnahme ordnet einer Gruppe zu (`components/verwaltung/lernen/AufnahmeKarte.tsx:33,70-73`), Gruppe trägt `kursId` (`src/lib/db/schema/lernen.ts:78`). Die Voranmeldung selbst kennt keinen Kurs (setzt kein `bezugId`, nur `veranstaltungsanmeldung.tsx:51` tut das; Formular kennt nur `KLASSEN`, `src/lib/validierung/formulare/voranmeldung.ts:27`), Kurskarte verlinkt ohne Kurs (`components/website/CourseCard.tsx:24`). Was „↔ Kurs“ genau verlangt, ist im AUFTRAG nicht weiter ausgeführt. |
| :105 | Lokaler-Server-Kit (Sicherung, Spiegel, Takt, Überwachung, Kiosk) | `betrieb/lokal/{sicherung,spiegel,takt,ueberwachung,kiosk,echtzeit}`, `docker-compose.yml`, `LIESMICH.md` | (Z-20) | erfüllt |

### Kür nach Priorität

- **K-A (8/8 vorhanden):** Ramadan `/ramadan` (200), Hatim `/hatim` (200, `tests/integration/hatim.test.ts`), Kalender + iCal
  (`/kalender`, `api/ical/*`, `tests/unit/kalender-ical.test.ts`), GiroCode (`/spenden`, `tests/unit/girocode.test.ts`),
  Gemeinde im Blick (`/verwaltung/gemeinde-im-blick`, „< 5“ in `src/lib/leitung/kennzahlen.ts:7-13`, `tests/integration/leitung.test.ts`),
  Vers/Hadith des Tages (`/verwaltung/koran/des-tages`), Offline-Koran (`OfflineSpeichern.tsx`, `tests/e2e/quran-offline.spec.ts`),
  Echtzeit (`api/mein/echtzeit`, `betrieb/lokal/echtzeit`, `tests/unit/echtzeit.test.ts`).
- **K-B (5 von 10 mit Oberfläche):** Newsletter (`/newsletter`, `tests/integration/newsletter.test.ts`), Hifz-Modus
  (`HifzEintragen.tsx`), Moscheeführung anfragen (`MoscheeAnfrageFormular.tsx`, Bestand), Passkey (`PasskeyHinzufuegen.tsx`,
  `PasskeyAnmelden.tsx`), Zugangskarte (`components/kinder/Kinderzugang.tsx`). Nur Schema ohne Oberfläche: QR-Check-in
  (`schema/eingaenge.ts` `checkinHash`), Ehrenamt-Dienstplan (`schema/gemeinde.ts:118`), Urkunden (`schema/lernen.ts:276-284`),
  Hausaufgaben (`schema/lernen.ts:244`). Schriftgröße nur im Koran-Leser. Laut Risikoplan entfällt K-B zuerst
  (`AUFTRAG.md` Risiken „Umfang wächst“) – Reihenfolge K-A vor K-B ist eingehalten.

### PLAN mit Commits

- Alle 27 in `_gemeinde/PLAN.md` genannten Hashes sind Vorfahren von 75cad0a (`git merge-base --is-ancestor` je Hash: 27 × ok).
- **Veraltet:** PLAN zuletzt geändert 13.10. 15:08 UTC (604ccf1). Zeilen `PLAN.md:25` (O-B01/H-B01–B08), `:26` (O-K05), `:31`
  (H-X01/X02, D-14…D-17) stehen auf „in Arbeit“ ohne Commit, obwohl gemergt: 1281d68 (O-B01/H-B), b4c1a9a (O-K05/H-X01/D-14…D-17),
  1c8117e (K-29). `:10` O-F01 nennt „(dieser Commit)“ statt 53e78ad. Es fehlen u. a. H-B09 (a99f21b), Sichtabnahme-Befundpakete,
  Vercel-Import (e66ee4e…942b385). `:32` E7 „offen“.

**Urteil Z-01: teilweise** – Pflicht 16/19 vollständig, 3 mit belegten Lücken (Push-Ankündigung + Rückfall, CMS Startseite +
Islamisches Wissen, Voranmeldung↔Kurs nur mittelbar); PLAN nicht nachgeführt.

---

## Z-02 Bestand – **teilweise**

### Suiten (Belege `scratchpad/tor-f-*.log`, Zeitstempel 14.10. 18:24–18:34 UTC, direkt nach Commit 75cad0a 18:23:03; die Logs nennen keinen Hash)

```
tor-f-check.log:  $ pnpm typen && pnpm lint && pnpm test:unit … Test Files 94 passed (94) · Tests 1438 passed | 3 expected fail (1441) · check exit 0
tor-f-int.log:    Test Files 59 passed | 1 skipped (60) · Tests 1680 passed | 2 expected fail | 4 skipped (1686) · int exit 0
tor-f-rel.log:    Religion-Prüfung grün: 5261 Dateien … rel exit 0
tor-f-spr.log:    Sprachdateien vollständig: 2939 Schlüssel in de, tr, en; dazu 4022 Schlüssel der Verwaltung … spr exit 0
```

Vergleich: Ein eigener E0-Ausgangswert ist in `_gemeinde/berichte/E0-*.md` **nicht** festgehalten (H-E0-P01 ohne Bericht).
Ersatz: Ausgang des Laufs = Vorlauf-Endstand (`_archiv/lauf-gestaltung-2026-10/ABNAHME.md:10`, `BERICHT.md:111`): unit 814/818
(+3 erwartet), integration 1412/1420 (2 erwartet, 4 übersprungen). Verlauf dieses Laufs: Tor E2 unit 1300 / integration 1633
(`berichte/tor-E2.md:10,17`), danach 1345, 1369, 1395, 1429 → **1438 / 1680**. Erwartete Fehlschläge (`it.fails` in
`tests/unit/gebetszeiten/hohe-breite-imsak-yatsi.test.ts`, `tests/integration/verwaltung/rechte-matrix.test.ts`) und die
übersprungene Datei (`tests/integration/wartung-sperre-postgres.test.ts:26`, `describe.skipIf(!url)` – echtes Postgres =
UMGEBUNGSAUSNAHME) sind dieselben wie im Vorlauf. **Suiten: erfüllt.** E2E (Docker/Mailpit) nicht gelaufen = UMGEBUNGSAUSNAHME.

### Funktionsliste

Befehl:
```
SCRATCHPAD=$S node _gemeinde/werkzeuge/funktionsliste.mjs --basis http://localhost:3100 \
  --protokoll K/funktionsliste-3100 --bilder K/bilder-funktionsliste --hinweis "Stufe C k3 …"
→ exit 0 · „Funktionen: 24 · technische Fehler: 1“ · Formular-POSTs je Zeile im Protokoll (nur leere/Schritt-Prüfungen)
```
Protokoll `K/funktionsliste-3100.md|.json`, Bilder `K/bilder-funktionsliste/`. Wiederholung F-02/F-03/F-08:
`K/funktionsliste-3100-f02-wdh.md` (gleiches Ergebnis).

**F-25…F-60 sind nirgends definiert:** Das Werkzeug kennt nur F-01…F-24 (`funktionsliste.mjs:2`, IDs 'F-01'…'F-24');
`grep -rln "F-25\|F-59\|F-60" _gemeinde _archiv web/docs web/tests` trifft nur `ABNAHME.md` und `AUFTRAG.md`; ein „LAGEBILD v2“
(Torergebnis E0, `AUFTRAG.md:506`) existiert in `_gemeinde/` nicht. → F-25…F-60: **offen**.

| F | 390 / 1440 jetzt | Vorlauf-Endstand 3500 (`_archiv/…/protokolle/C-funktionsliste-3500.md`) | Einordnung |
|---|---|---|---|
| F-01, F-04, F-05, F-09–F-11, F-13–F-17, F-19, F-22–F-24 | erfüllt / erfüllt | erfüllt | gleich |
| F-18 | erfüllt / – | erfüllt / – | gleich |
| F-06, F-07, F-12 | nicht prüfbar | nicht prüfbar | gleich |
| F-21 | – / nicht prüfbar | – / nicht prüfbar | gleich |
| F-20 | – / nicht prüfbar | – / erfüllt | ohne Anmeldezustand gelaufen (Anmeldung schreibt Sitzungen; Auftrag „nur lesend“) → nicht geprüft |
| F-02 | **nicht prüfbar** / erfüllt | erfüllt / erfüllt | Werkzeug bricht bei 390 auf `/projekte` ab (`locator.getAttribute: Timeout`), weil die Seite absichtlich die kompakte Leiste ohne Aufklappknopf zeigt (`projekte/page.tsx:29,38` `kompakteLeiste`; Probe `K/leiste-probe.json`: `/projekte` 0 Knöpfe, `/ueber-uns` 1). Kompakte Leiste hat Link `/gebetszeiten` (HTML-Prüfung `K/z21-html/projekte.html`). Kein Funktionsrückschritt, Erwartung veraltet. |
| F-03 | **nicht erfüllt** / **nicht erfüllt** | nicht prüfbar (Teilprüfungen erfüllt) | Erwartung „vier Tabs“ + Pfeil → „Monatlich“ veraltet: fünf Tabs mit neuem „Mein Ort“ (Pflichtfunktion). Nachprüfung mit Wartezeit `K/f03-nachpruefung.json`: Pfeil → Mein Ort → Monatlich, Ende → Einstellungen, Pos1 → Heute; Monatstabelle „Oktober 2026 – Gebetszeiten“ bei 390 und 1440 sichtbar; Qibla-Kompass sichtbar (1440 erst nach Nachladen, `kompassSofort 0`, `kompassSpaeter 1`); 0 Konsolenfehler. Bilder `K/f03-monat-390.jpg`, `K/f03-qibla-1440.jpg`. Kein Funktionsrückschritt, Werkzeug wartet nicht auf den Lazy-Chunk. |
| F-08 | **nicht erfüllt** / **nicht erfüllt** | erfüllt | Nur H1 von `/projekte` weicht ab: „Neue Fatih-Moschee ist eröffnet“ statt „Gemeinsam glauben, gemeinsam wachsen“ (`funktionsliste.mjs:348`); gewollt (Z-21, `projekte/page.tsx:29` „der allgemeine Titel wird zur Unterzeile“). Status 200, Inhalt 1457/1478 Zeichen. |

### Konsolenfehler auf den Hauptrouten

Befehl: `BASIS=http://localhost:3100 node _gemeinde/werkzeuge/tor/konsole3.mjs --routen <liste> --protokoll K/konsole-<x>` mit
46 deutschen Routen (`K/routen-haupt-k3.json` = `routen-stufe-c.json` + 21 neue Ansichten: Hadith, Elifbe, Lernen, Tajwid, Cüz 30,
Sure 2, Kalender, Ramadan, Spenden, Quellen, Barrierefreiheit, Hatim, Newsletter, Anmelden, Verwaltung-Anmelden), 11 tr, 3 en.
Ergebnis (`K/konsole-haupt.json`, `K/konsole-tr.json`, `K/konsole-en.json`):
- 58 von 60 Routen: 0 Meldungen (alle HTTP 200; tr und en vollständig 0).
- `/gibt-es-nicht`: 2 Meldungen = gewolltes 404 (wie im Vorlauf).
- `/gebetszeiten/anzeige`: 2 Meldungen – `GET /medien/57f6c4a04d6c71bb/achtstern.png` 404 + „Failed to load resource“. Vorlauf: 0
  (`_archiv/…/protokolle/C-konsole.json`). Ursache Umgebung: die Folie mit dem Beispielbild stammt aus der Sichtabnahme; die Datei
  liegt in `scratchpad/medien/57f6c4a04d6c71bb/achtstern.png`, der Server läuft aber mit `MEDIEN_VERZEICHNIS=scratchpad/sicht2/medien`
  (`/proc/341/environ`). Kein Codefehler belegt, aber auf dieser Instanz **eine neue Konsolenmeldung**.

**Urteil Z-02: teilweise** – Suiten ≥ Ausgang (erfüllt); F-01…F-24 ohne belegten Funktionsrückschritt, aber das Werkzeug meldet
F-03/F-08 „nicht erfüllt“ und F-02 (390) „nicht prüfbar“ wegen veralteter Erwartungen, F-20 ungeprüft; **F-25…F-60 nicht
definiert (offen)**; Konsole 0 neue Codefehler, 1 umgebungsbedingte 404-Meldung auf `/gebetszeiten/anzeige`.

---

## Z-10 Übergabe – **teilweise**

| Teil | Beleg | Befund |
|---|---|---|
| BERICHT – Vorführpfad | `_gemeinde/BERICHT.md:36-59` (7 Stationen wie `AUFTRAG.md:74-81`, plus Vorführung lokal) | vorhanden |
| BERICHT – Galerie | Stand `main` 75cad0a: `git show 75cad0a:_gemeinde/BERICHT.md` Z. 89–91 = „## Galerie / [folgt nach der Nachabnahme]“ → **fehlt auf main**. Branch-HEAD 39f03da: `BERICHT.md:89-104`, 18 Bilder `_gemeinde/galerie/01…18-*.jpg` (936 KB, 1100×688 bzw. 520×1125, alle 18 Verweise lösen auf) | auf main **fehlt**; auf dem Branch vorhanden, noch nicht vorgespult |
| BERICHT – Aktualität | `BERICHT.md:3` „Entwurf vom 14.10.2026“; `:75` „Stand der Prüfungen (… `main` 4115a5e)“; `:85-87` „Nachbewertung steht aus“ (Runde 3 ist laut `PRUEFPUNKT.md:3-5` abgeschlossen, Z-04 erfüllt); Stand Z-01…Z-21 fehlt (laut `:3` vorgesehen) | Entwurf, veraltet |
| KERN 3.x | `_gemeinde/KERN.md:1` „KERN 3.0“ mit Leitidee, Religion, Rechte, Gestaltung, Leistung, Datenfluss, Register B-07…B-27, SVG je Route | vorhanden; Mängel: `KERN.md:62` B-25 „noch nicht im Code“, obwohl umgesetzt (`website/anzeige/AnzeigeLive.tsx:31,49,164,299`); `KERN.md:3` verweist auf `_werkstatt/KERN.md` (archiviert nach `_archiv/lauf-gestaltung-2026-10/KERN.md`) |
| MENSCHEN | `_gemeinde/MENSCHEN.md:8-35` MN-00…MN-27 mit Standard und Stand; Datenbefunde `:37-42` | vorhanden; `:3` verweist auf `_werkstatt/MENSCHEN.md` und `_lauf/MENSCHEN.md` (beide nicht mehr vorhanden) |
| Handbücher | `web/docs/handbuch/{lehrkraefte,eltern,redaktion,imam,server,kinderschutz}.md` (164/143/166/117/78/125 Zeilen) – deckt die Liste aus `AUFTRAG.md:512` (H-R03) | vorhanden; inhaltliche Abweichung: `redaktion.md:91` beschreibt „Verwaltung → Startseite“ (gibt es nicht, s. Z-01), `redaktion.md:111` „Elifbe-Lektionen, Wissensthemen“ als freizugebende Inhalte (keine Verwaltungsoberfläche), `eltern.md:105` Mail-Erinnerung (nicht umgesetzt) |
| GO-LIVE | `web/docs/GO-LIVE.md:197-247` Abschnitt G (G1–G7), `:165-169` E3 „Zurückrollen geübt“ | vorhanden |
| Zusammenführen/Zurückrollen | `web/docs/deploy/VERCEL.md:369-383` (§10 Fast-Forward, kein Erzwingen, Cache erneuern), `:413-429` (§12 Instant Rollback, Revert-Commit, Datenbank additiv, Übung) | vorhanden; Hinweis: nennt durchgehend Projekt `igmg` (`:11,21,110…`), live ist `igmg-wetzlar` (`PRUEFPUNKT.md:9-10`, beide Projekte existieren) |

**Urteil Z-10: teilweise** – Vorführpfad, KERN 3.0, MENSCHEN, Handbücher, GO-LIVE und Zusammenführen/Zurückrollen liegen vor;
**Galerie fehlt auf main 75cad0a** (nur auf Branch 39f03da), BERICHT ist noch Entwurf mit veraltetem Prüfstand, KERN/Handbücher
haben die genannten Unstimmigkeiten.

---

## Z-21 Moschee 2026 – **erfüllt** (mit Hinweisen)

### grep im Quelltext
`grep -rn -i -E 'in planung|geplant|planung|zukunft|zukünftig|künftig|wird gebaut|im bau|bauphase|baubeginn|entsteht|soll entstehen|errichtet werden|planned|future|under construction|will be built|planlan|gelecekte|inşa …' web/messages web/drizzle/seeds`
und analog `web/src`: **0 Aussagen „geplant/Zukunft“ zum Gebäude.** Restliche Treffer sind anderer Bezug:
- Statuslabels als Auswahl `messages/bereiche/projekte.json:14-15,67,120-121`, `messages/verwaltung/seiteninhalte.json:185-186`
  (nur bei gewähltem Status sichtbar), Meilenstein-Label „Ausstehend“ (`projekte.json:43`).
- Termine/Veranstaltungen „geplant“ (kinder.json, unterricht.json, seiten.json, de.json:772 …), Hatim „Vollendung geplant“.
- `drizzle/seeds/bereiche/ueber-uns.ts:15` `ZEITLEISTE_ZUKUNFT_DE = 'Zukunft'` = Erkennungsmarke der Inhaltsmigration
  (`src/lib/inhalt/stand-2026.ts:56`), nicht sichtbar.
- `drizzle/seeds/bereiche/vorstand.ts:103` „Planung des Moschee-Neubaus“ (Amtszeit 2009–2012, historisch, laut E0-K05 bleibt).
- `drizzle/seeds/daten/nachrichten.ts` Ramadan-„geplanten Aktivitäten“ (kein Gebäudebezug).
- `web/src`: nur Code-Kommentare („beim Bau“ = Build) und `stand-2026.ts`-Migrationstexte.
Alle E0-K05-Fundstellen (`_gemeinde/berichte/E0-K05-moschee-fundstellen.md`) sind behoben: Seed `projekte.ts:11-31` (Name :21, Status :22)
(Name „Neue Fatih-Moschee“, `status: 'fertiggestellt'`, Platzhalter, keine Behördenaussage), Meilensteine alle `erledigt: true`
(`projekte.ts:69,79,85,95,105,115`), Schema-Standard `validierung/seiteninhalte/projekte.ts:35` `default('fertiggestellt')`,
Messages `projekte.json` (Untertitel „Projekte und Initiativen unserer Gemeinde“, „Chronik“, „Projekt“, „Foto: {name}“),
`de.json:586` „Projekte und Initiativen“; `bestand.aboutUs`/„Zukunft“ in de/tr/en.json nicht mehr vorhanden.

### Gerenderte Seiten (Server 3100)
`curl` von `/`, `/ueber-uns`, `/projekte`, `/tr`, `/en` (+ lokalisierte `/tr/hakkimizda`, `/tr/projeler`, `/en/about-us`,
`/en/projects`; alle 200, HTML und Text unter `K/z21-html/`), sichtbarer Text ohne Skripte (`K/text.py`), gleicher grep:
**0 Treffer zum Gebäude.** Einzige Treffer: Ramadan-Nachricht („geplanten Aktivitäten“, `root.txt:262` usw.) und erledigte
Meilensteine im Präteritum („Kaba inşaat işlerinin tamamlanması“, „Shell Construction … completed“).
Positiv belegt: `root.txt:182-186` „Unsere neue Moschee ist eröffnet · Fertiggestellt · 2026 · Die neue Fatih-Moschee in
[Ortsangabe – von der Gemeinde] ist fertiggestellt. Eröffnung: [Datum – von der Gemeinde]“; `tr.txt:182-186` „Yeni camimiz açıldı ·
Tamamlandı“; `en.txt:182-186` „Our new mosque is open · Completed“; `projekte.txt:124-133` „Neue Fatih-Moschee ist eröffnet ·
Fertiggestellt“; `ueber-uns.txt:193` „[Jahr – von der Gemeinde] – Eröffnung der neuen Fatih-Moschee“. Bilder:
`K/z21_projekte-1440.jpg`, `K/z21_en_projects-1440.jpg`, `K/z21_tr_projeler-1440.jpg`, Galerie `_gemeinde/galerie/12-projekte-fertiggestellt-1440.jpg`.

### Status, Fakten, Cockpit, Tests
- Status fertiggestellt: Seed + Schema-Standard (s. o.), sichtbar „Fertiggestellt/Tamamlandı/Completed“.
- Fakten als Platzhalter: `MENSCHEN.md:17` MN-08 (Eröffnungsdatum, Standort, Fotos, Kapazität, Einrichtungen, Spendenzweck, Name)
  „Platzhalter in eckigen Klammern | offen“; Seed `kapazitaet.wert: null`, `flaecheM2: null`, `einrichtungen: []`.
- Cockpit: `src/lib/startklar/pruefungen.ts:331-364` (`inhalte.meilensteine`, `inhalte.projekt-platzhalter`).
- Tests: `tests/unit/inhalte-2026.test.ts:23-102`, `tests/integration/inhalte-2026.test.ts:52-133`.

### Hinweise (außerhalb der fünf geforderten Seiten)
- `/nachrichten` zeigt die historische Nachricht „Moscheererweiterung genehmigt – … Bauarbeiten beginnen im Herbst.“ (01.03.2024,
  Badge „Empfohlen“; `drizzle/seeds/daten/nachrichten.ts` slug `moscheererweiterung-genehmigt`, `K/z21-html/nachrichten.txt:240-245,305-310`).
  E0-K05 stuft sie als historisch ein (Frage 8), ein MN-Eintrag dazu fehlt.
- `/kontakt`: „Die Karte wird eingebunden, sobald die Lage der Moschee bestätigt ist. [Koordinaten fehlen]“
  (`messages/bereiche/kontakt.json:40,90,140`; `K/z21-html/kontakt.txt:212`) – Grenzfall laut E0-K05, hängt an MN-08.

**Urteil Z-21: erfüllt.**

---

## Dateien dieses Prüfers (alle unter K/)

- `funktionsliste-3100.md|.json|.log`, `bilder-funktionsliste/`
- `funktionsliste-3100-f02-wdh.md|.json|.log`, `bilder-funktionsliste-wdh/`
- `f03-nachpruefung.mjs|.json`, `f03-monat-390.jpg`, `f03-monat-1440.jpg`, `f03-qibla-390.jpg`, `f03-qibla-1440.jpg`
- `leiste-probe.mjs|.json`
- `routen-haupt-k3.json`, `konsole-haupt.json|.log`, `konsole-tr.json|.log`, `konsole-en.json|.log`
- `z21-html/*.html|*.txt`, `text.py`, `z21_projekte-1440.jpg`, `z21_en_projects-1440.jpg`, `z21_tr_projeler-1440.jpg`
