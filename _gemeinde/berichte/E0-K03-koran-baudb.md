Hinweis: Der Bericht ist nicht als Datei geschrieben, weil für Agenten keine Berichts-.md erstellt werden soll. Hier ist der vollständige Inhalt.

# E0-K03: Koran-Bestand und Bau-Datenbank

## Kurzfassung
- Der Vercel-Bau importiert keinen Koran. Der Text kommt nur über einen manuellen `pnpm quran:import` gegen die Produktionsdatenbank. Ohne DB bleiben die Seiten bei Platzhaltern.
- Die Tanzil-Datei liegt in `web/daten/tanzil/`. Skript und Betriebsanleitung erwarten `daten/quran/`. `web/daten/` ist untracked und nicht ignoriert.
- Übersetzungen werden auch nach einem Import nicht angezeigt. Die Seite liest ein Altlast-Feld.
- Quran-Seiten sind nicht offline verfügbar, obwohl ADR 0009 offline-Fähigkeit verlangt.

## 1. Bau-Datenbank beim Vercel-Build
`package.json` `vercel-build` führt `scripts/vercel-bau.mjs` aus.
- **Mit `DATABASE_URL`** (`vercel-bau.mjs:13-16`): zuerst `migriere-mit-sperre.mjs` (Advisory-Lock 4242017, bevorzugt `DATABASE_URL_UNPOOLED`, `migriere-mit-sperre.mjs:11,16,28,30`), dann `next build` gegen die Datenbank. Kein Seed, kein Quran-Import.
- **Ohne `DATABASE_URL`** (`vercel-bau.mjs:17-31`): Warnung, dann `db:bau-vorbereiten` (`bau-datenbank.mjs:9-12`). Dabei wird `.pglite-bau` gelöscht, per `drizzle-kit migrate` migriert und `drizzle/seeds/index.ts` ausgeführt. Danach `next build` mit `BAU_PGLITE=1`. Anschließend werden die tmp-Kopien gelöscht (`vercel-bau.mjs:28-31`).
- **Seeds:** Liste in `drizzle/seeds/index.ts:162-168`, Bereiche in `bereiche/index.ts:13-23`. Idempotenz über `onConflictDoNothing` (z. B. `index.ts:62, 97, 135, 157`). Keine Seed-Datei schreibt Quran-Tabellen.
- **Zusätzliche Importe anhängen:** Der Bau hat keinen Importschritt. Möglich sind (a) ein eigenes Import-Skript nach dem Muster von `quran-import.ts`, manuell gegen `DATABASE_URL`, oder (b) ein Schritt in `vercel-bau.mjs`. Option (b) funktioniert nur mit `DATABASE_URL`, weil die PGlite-Bau-DB bei jedem Bau neu entsteht. Ein Quran-Text im PGlite-Pfad braucht eine Entscheidung zu Datei und Lizenz (OFFENE FRAGE).
- **Cache nach Import:** `POST /api/wartung/cache-erneuern` mit `WARTUNG_TOKEN` (mind. 32 Zeichen). Die Route verfällt alle `START_TAGS`, darin `quran` (`route.ts:10-12`, `cache/tags.ts`). Auf Vercel läuft der automatische Aufruf nicht (`instrumentation.ts:22, 27`). OFFENE FRAGE: Ob dieser Aufruf die vorgerenderten `/quran/[sure]`-Seiten auf Vercel ersetzt oder ein Neubau nötig ist, ist nicht geprüft.
- **Zeiten:** Der Bau läuft bei jedem Deploy. Der Import ist ein manueller Schritt außerhalb des Baus. Laufzeiten wurden nicht gemessen.

## 2. Quran-Import heute (`web/scripts/quran-import.ts`)
- **Aufruf:** `pnpm quran:import <datei> --sha256 <hex> --version "1.1" --abruf JJJJ-MM-TT` (`quran-import.ts:4`, `docs/BETRIEB.md:55`). Braucht `DATABASE_URL`.
- **Prüfungen:**
  - SHA-256 der Datei gegen den CLI-Wert (`:26`, `:31-33`). Der Kommentar in `:2-3` nennt „MENSCHEN.md“, aber das Skript liest diese Datei nicht. Der Abgleich ist manuell.
  - `leseTanzil` (`:37`) prüft in `src/lib/quran/tanzil.ts`: Wurzelelement (`:40`), Suren- und Versnummern lückenlos ab 1 (`:52-54`, `:59-61`), Name und Text vorhanden (`:45`, `:49`). Nicht geprüft werden die Anzahl 114 Suren oder 6236 Verse sowie das Attribut `bismillah`. Unit-Test: `tests/unit/quran-tanzil.test.ts`.
- **Schreiben** (eine Transaktion, `:45-68`):
  - Löscht alle `quran_vers` und `quran_sure` (`:46-47`). Das ist Ersetzen, kein Anhängen.
  - Upsert `quran_quelle` mit `bezeichnung` „Tanzil Project“ und Lizenztext mit Abrufdatum (`:49-61`).
  - `quran_sure` nur mit `nr`, `name_ar`, `verse_anzahl`, `quelle_id` (`:63`).
  - `quran_vers` in 500er-Blöcken (`:65-66`).
  - Nicht befüllt werden `name_umschrift`, `ort`, `offenbarungsfolge`, `rukus`, `basmala` (Schema `quran.ts:27-34`), Einteilungen, Tajwid und Wörter.
- **ADR-Abweichung:** ADR 0009 nennt `web/scripts/quran-import.mjs` (`docs/adr/0009…md:25`). Die Datei ist `quran-import.ts`.

**Tanzil-Datei** (`web/daten/tanzil/quran-uthmani.xml`, 1.529.315 Byte, SHA-256 `5ea5cbab…7468a`, laut `daten/tanzil/QUELLE.md:19-21`):
- Lokaler Parserlauf mit `leseTanzil`: 114 Suren, 6236 Verse. Der längste Vers hat 1205 Zeichen.
- 112 Suren haben ein Attribut `bismillah` (Zählung in der Datei). Es wird nicht gelesen (`tanzil.ts:6`).
- **Pfadproblem:** Das Skript und `BETRIEB.md` erwarten `daten/quran/`, ignoriert durch `web/.gitignore:48`. Die Datei liegt aber in `daten/tanzil/`, und dieser Pfad ist nicht ignoriert.
- **Commit-Risiko:** `git status` zeigt `?? web/daten/`. Ein `git add -A` würde den Tanzil-Text (1,5 MB), die Hadith-Datei `daten/hadith/ara-bukhari.json` (9,8 MB) und `daten/quran-tajweed/…json` (5,6 MB) aufnehmen. Weder `web/.dockerignore` noch `/.vercelignore` schließt `web/daten` aus.
- **Governance-Frage:** `daten/tanzil/QUELLE.md:6` dokumentiert einen Abruf mit `agree=true` am 2026-10-13. ADR 0009 (Zeile 22) und `BETRIEB.md` 4b verlangen, dass Zustimmung und Download ein Mensch vornimmt (M-036). Ob M-036 erfolgt ist, ist aus dem Repo nicht belegt. OFFENE FRAGE.
- **Tajwid-Versatz:** `daten/tanzil/QUELLE.md:49-51` meldet, dass die Offsets der Tajwid-Annotationen für Vers 1 der Suren 2–114 (außer 9) um 39 Codepunkte verschoben sind. Gemessen: Der Text von 2:1 hat 5 Codepunkte, das Attribut `bismillah` 38. Die Basmala steht also nicht im Vers. `scripts/tajwid-import.ts` existiert noch nicht.

## 3. Was die Seiten heute zeigen
- **`/quran`** (`QuranUebersicht.tsx:16`, `stand.ts:28-40`): Ohne Quelle fünf Einträge mit Namen aus `messages/bereiche/quran.json` (`sura.1–5`) und ohne Verszahl (`stand.ts:31-33`). Mit Quelle 114 Suren mit arabischem Namen (`stand.ts:35-37`). Quellenzeile mit Link auf tanzil.net (`StandHinweis.tsx:8-18`).
- **`/quran/[sure]`** (`[sure]/page.tsx:11-15`): `generateStaticParams` liefert 1–114 mit Import, sonst 1–5, bei leerer Liste „_“.
- **Anzeige** (`QuranAnsicht.tsx`): nummerierte Verse, arabischer Text mit `dir="rtl" lang="ar"` (`:63`), Übersetzungsblock mit Platzhalter (`:56-77`), Audio deaktiviert (`:43-49`), Blättern (`QuranWeiter.tsx`).
- **Übersetzungen (Fehler):** Die Seite liest `quran_vers.uebersetzung` (`queries/quran.ts:55`, `QuranAnsicht.tsx:56`). Das ist das Altlast-Feld (`schema/quran.ts:49-50`). `quran_ausgabe` und `quran_uebersetzung` (`schema/quran.ts:130-158`) liest keine Abfrage. Nach einem Übersetzungsimport bleibt die Seite beim Platzhalter.
- **Basmala:** Die Basmala wird nirgends angezeigt. Vers 2:1 enthält sie nicht, und die Spalte `basmala` ist leer.
- **Texte:** `messages/bereiche/quran.json:7, 71` verspricht „Übersetzung und Tafsir“. Tafsir gibt es nicht. Tr/En-Surennamen fehlen (`stand.ts:7-8`, im Code als offene Frage vermerkt).
- **Routen:** `/quran/cuz/[nr]` und `/quran/tajwid` sind in `routing.ts:49-50` deklariert, haben aber keine Seiten.

## 4. Schriften-Pipeline
- **Amiri ist schon eingebunden:** `@fontsource/amiri` 5.3.0 (`package.json:81`). `scripts/schriften-kopieren.mjs:12` kopiert 400 und 700 (arabic) nach `src/fonts/`. `src/app/schriften.ts:81-98` lädt sie als `--schrift-arabisch` mit unicode-range, ohne Preload. `schriftKlassen` (`:100-107`) setzt die Klasse am `<html>`. `globals.css:331-334` legt `[lang='ar'], [dir='rtl']` global auf `--font-arabic`.
- **Zusätzliche Schrift (z. B. Amiri Quran):**
  1. `package.json`: `@fontsource/amiri-quran`. Im npm-Registry ist Version 5.3.0 abrufbar. Lizenz im Paket prüfen.
  2. `schriften-kopieren.mjs`: neuer Eintrag in `quellen` (Zeilen 8–13).
  3. Der QUELLE.md-Text ist in `schriften-kopieren.mjs:28` fest codiert und muss angepasst werden.
  4. `pnpm schriften:kopieren`.
  5. `schriften.ts`: neues `localFont` mit eigener Variable, in `schriftKlassen` aufnehmen. Die Optionen müssen Literale sein (Kommentar `schriften.ts:7`).
  6. `globals.css`: Token (neben `--font-arabic`, `:61`) und eine spezifischere Regel. Die globale Regel `:331-334` greift sonst.
  7. `docs/adr/0014` und `LIZENZEN.md` aktualisieren.
- **Offen:** Ob die Amiri-Subsets die Koranzeichen der Textfassung (`marks=true`, `sajdah=true`) abdecken, ist nicht geprüft. OFFENE FRAGE. Ob Amiri Quran verwendet wird, ist eine Entscheidung der Gemeinde.

## 5. Service Worker (`web/public/sw.js`)
- **Seiten:** Netz zuerst. Vorgehalten werden nur Gebetszeiten und Startseite (`sw.js:12-15`, `:65`). Quran-Seiten fallen offline auf `/offline` zurück (`:75`).
- **Abweichung:** ADR 0009 verlangt offline-Fähigkeit (K-15, `docs/adr/0009…md:6`). Die Quran-Seiten erfüllen das nicht. OFFENE FRAGE.
- **Statische Dateien:** `/_next/static/**` ist cache-first (`:48-62`). Schriftdateien werden also erst beim ersten Abruf gespeichert, nicht vorab.
- Cache-Version `igmg-v1` (`:8`).

## 6. Datenmengen (gemessen an der Tanzil-Datei)
- **Verse:** 6236 Zeilen in `quran_vers`. Verstext insgesamt 1,33 MB (UTF-8). Größte Sure (2) 106 KB bei 286 Versen.
- **Wörter:** 81.812 Tokens durch Leerzeichen getrennt. 77.433 davon enthalten arabische Buchstaben, 4.379 bestehen nur aus Zeichen (Pausen- und Sajda-Zeichen, durch Leerzeichen getrennt). 18.993 eindeutige Buchstaben-Formen. Der Auftrag nennt rund 78.000, das passt zu den Buchstaben-Tokens.
- **Hadith:** `daten/hadith/ara-bukhari.json`, Array `hadiths` mit 7.589 Einträgen. Der Auftrag nennt 7.563. Ursache ungeklärt.
- **Risiken:**
  - (a) Der PGlite-Bau kopiert die gesamte Bau-DB je Worker-Prozess (`src/lib/db/index.ts:47-74`). Die Kopien wachsen mit jeder Tabelle, also mit Wörtern und Hadith, multipliziert mit der Worker-Zahl.
  - (b) Die Bau-DB wird bei jedem Bau neu migriert und geseedet (`bau-datenbank.mjs:9-12`). Rund 82.000 Wortzeilen plus Formen würden jedes Mal neu erzeugt.
  - (c) Der Import löscht und schreibt alles in einer Transaktion (`quran-import.ts:45-47`). Bei Wortzeilen müssten die Blöcke neu dimensioniert werden. Dauer und Sperrverhalten sind nicht gemessen.
  - (d) Der Cache-Tag `quran` ist grob (`cache/tags.ts`). Jede Änderung verfällt den gesamten Quran-Bestand. Wortebene pro Vers würde viele Cache-Einträge erzeugen (`queries/quran.ts:43-45`).
  - (e) Im Arbeitsbaum ist `schema/quran.ts` gegenüber HEAD erweitert. Die Migrationen `0008_gemeinde_plattform.sql` und `0009_trigger_und_pruefungen.sql` sind untracked, `_journal.json` ist geändert. HEAD enthält diesen Stand nicht. Ein Bau aus dem Commit nutzt den alten Schemastand.

## Offene Fragen
1. Hat der Mensch M-036 erfüllt, wenn die Datei mit `agree=true` abgerufen wurde?
2. Soll Quran-Text im PGlite-Bau (ohne DB) erscheinen, und unter welcher Lizenzbedingung?
3. Erneuert `POST /api/wartung/cache-erneuern` auf Vercel die vorgerenderten Quran-Seiten, oder ist ein Neubau nötig?
4. Sollen Seiten `quran_uebersetzung` lesen statt des Altlast-Felds?
5. Wie wird K-15 (offline) für Quran-Seiten erfüllt, oder wird die Anforderung zurückgenommen?
6. Deckt Amiri die Koranzeichen der Textfassung ab? Soll Amiri Quran verwendet werden?
7. Soll die Basmala angezeigt werden (Attribut `bismillah`)?
8. Wie ist die Hadith-Zahl 7.563 (Auftrag) gegenüber 7.589 (Datei) zu erklären?

**Sofort zu klären:** Tanzil- und Hadith-Daten in `web/daten/` aus dem Arbeitsbaum entfernen oder ignorieren, bevor jemand `git add` ausführt.