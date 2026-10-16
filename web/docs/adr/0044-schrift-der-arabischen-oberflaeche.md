# ADR 0044 – Schrift der arabischen Oberfläche (Noto Sans Arabic)

- Status: vorgeschlagen (16.10.2026) (Lauf Lern-App); Lizenz geprüft im Lizenzbefund L0 · Bezug: Plan „Lern-App“ Kontext („Was fehlt“: Regel `[dir=rtl]`), §2.1; `_lernapp/PLAN.md` §3.4; Lizenzbericht `_lernapp/berichte/lizenzen-l0.md` §1.3, §2 („Schrift“) · schreibt ADR 0014 fort (vierte Schrift, gleicher Weg)

## Kontext

- Die Lern-App bekommt eine arabische Oberfläche, vollständig von rechts nach links (ADR 0037). Bisher gibt es Arabisch nur als Inhalt: Amiri (`--font-arabic`) für arabischen Text, eine eigene Koranschrift (`--font-quran`).
- `globals.css` setzt für `[lang='ar']` und `[dir='rtl']` die Schrift Amiri mit Zeilenhöhe 2 (Stand 16.10.2026, Zeilen 434–438). Mit `<html dir="rtl">` gälte das für die ganze arabische Oberfläche: Knöpfe, Leisten und kurze Bedientexte in einer Naskh-Schrift mit doppelter Zeilenhöhe.
- Schriften sind selbst gehostet, ohne Anfrage an Dritte (ADR 0014: `next/font/local`, Dateien unter `web/src/fonts/`, kopiert mit `pnpm schriften:kopieren` aus `@fontsource`-Paketen).
- Lizenz (Lizenzbericht, an der Primärquelle geprüft): Noto Sans Arabic, `@fontsource/noto-sans-arabic` 5.3.0, Schrift v2.012, SIL Open Font License 1.1, „Copyright 2022 The Noto Project Authors“, kein reservierter Schriftname. Die Teilmenge `arabic` deckt auch die koranischen Zeichen ab.

## Entscheidung

1. **Schrift der Oberfläche:** Noto Sans Arabic, Schnitte 400 und 700, Teilmenge `arabic`, aus `@fontsource/noto-sans-arabic` 5.3.0 (exakt gepinnt, devDependency).
   - `web/scripts/schriften-kopieren.mjs` kopiert die WOFF2-Dateien und den OFL-Text nach `web/src/fonts/` und ergänzt `QUELLE.md`.
   - Eingebunden mit `next/font/local` wie ADR 0014, mit `unicode-range` für den arabischen Block.
2. **Token** `--font-arabisch-ui`, nur im Wurzel-Layout der Lern-App (`web/src/app/lern-app/[ui]/layout.tsx`).
   - In der arabischen Oberfläche ist sie die Textschrift; vorgeladen wird sie nur dort `[Vorladen in Spike S1 prüfen]`.
   - In der deutschen und türkischen Oberfläche bekommt `--font-text` sie als Rückfall. Arabische Bedienwörter (z. B. Kursnamen) erscheinen so in derselben Schrift.
3. **Kursinhalt** (voll vokalisiertes Hocharabisch) bleibt in Amiri (`--font-arabic`, Skala `--text-arabisch-1/2/3`), gekennzeichnet mit `lang="ar"` und `dir="rtl"`. `--font-quran` bleibt dem Koran vorbehalten; der Koran-Arabisch-Pfad zeigt Koranwörter in der Koran-Darstellung.
4. **Globale Regel eingrenzen** (gemeinsame Datei, nur der Orchestrator): Die Regel für `[lang='ar']` und `[dir='rtl']` in `globals.css` gilt nicht mehr für die Oberfläche der Lern-App; das Wurzel-Layout setzt dafür `data-oberflaeche` (Vorschlag aus dem Plan: `[lang='ar']:not([data-oberflaeche])`). Für alles außerhalb der Lern-App-Oberfläche bleibt die Regel wirksam: `lang="ar"` steht auf der Website nicht nur bei Koran und Elifbe, sondern auch bei Hadith, Anzeige, Suche, Startseite, CMS-Blöcken, Mein Bereich und in der Verwaltung (Stand 16.10.2026). Eine Eingrenzung nur auf Koran- und Elifbe-Klassen würde diese Stellen ändern und ist deshalb nicht gewählt.
5. **Zeilenhöhe** der Oberfläche aus der vorhandenen Skala, keine freien Werte. Harakat und Unterlängen werden nicht abgeschnitten (Darstellungsprüfung wie Z-09: 390/768/1440 px).
6. **Ziffern:** östlich-arabisch über `Intl.NumberFormat('ar-u-nu-arab')`, umschaltbar auf westliche Ziffern (O-5, LM-18).
7. **Namensnennung:** „Noto Sans Arabic – Copyright 2022 The Noto Project Authors (https://github.com/notofonts/arabic), SIL Open Font License 1.1“ auf `/lern-app/[ui]/quellen`, auf `/quellen` und im Lizenzverzeichnis, mit OFL-Volltext.

## Alternativen

- Amiri auch für die Oberfläche: nicht gewählt. Eine Naskh-Schrift mit Zeilenhöhe 2 passt zu Lesetext, nicht zu dichten Bedienelementen; Amiri bleibt damit klar dem Inhalt zugeordnet.
- Systemschrift: nicht gewählt. Das Schriftbild schwankt je Gerät, und Prüfungen wie Z-09 wären nicht reproduzierbar.
- Laden über Google Fonts: verworfen (Drittanfrage, ADR 0014).
- Variable Fassung `@fontsource-variable/noto-sans-arabic`: nicht nötig, zwei feste Schnitte reichen.
- Regel `[dir='rtl']` unverändert lassen und in der Lern-App überschreiben: nicht gewählt. Das wäre eine Kaskade gegen die eigene Regel; die Eingrenzung ist klarer.

## Folgen

- KERN (Lern-App): neues Token `--font-arabisch-ui`.
- Tests: Sichtvergleich der Website-Seiten mit arabischem Inhalt (Koran, Elifbe, Hadith) vor und nach der Eingrenzung; E2E `ar`: berechnete Schrift der Oberfläche ist Noto Sans Arabic, die von Kursinhalt Amiri; kein Überlauf bei 390 px.
- Gewicht: Größe der beiden WOFF2-Dateien nach dem Kopieren messen `[Größe eintragen]`; sie zählen nicht zum JS-Budget.
- Abnahme: Z-L13 (Sprachen und RTL-Regeltest grün).
