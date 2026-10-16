# ADR 0009 – Quran-Datenquelle und Lizenz

- Status: angenommen · 2026-10-11 · P1 · Bezug: G-06, G-09, K-14, K-15, Z-01, Z-12 · Grundlage: Quellenbericht (tanzil.net/download, tanzil.net/trans, Quran-Foundation-Developer-Terms 2026-10-04)
- Fortgeschrieben 16.10.2026 (Lauf „Lern-App“): ergänzt durch ADR 0045 (offene Sprachdaten und Stimmen; Koran-Wurzeln nicht aus dem Quranic Arabic Corpus).

## Ziel

`/quran` und `/quran/[sure]` zeigen arabischen Korantext nur **wörtlich aus einer etablierten Quelle mit geprüfter Lizenz und Quellenangabe**, Übersetzungen nur mit geklärter Lizenz, sonst Platzhalter (G-06) – ohne Anfrage an Dritte beim Seitenaufruf (K-14) und offline-fähig (K-15).

## Befund

- **Tanzil-Korantext** (Uthmani/Simple, Version 1.1): Kopieren und Verbreiten unveränderter Kopien erlaubt, auf jeder Website, mit deutlicher Quellenangabe „Tanzil Project“ und Link auf tanzil.net. Download nur nach Zustimmung zu den Nutzungsbedingungen.
- **Tanzil-Übersetzungen:** nur nicht-kommerziell, sonst Erlaubnis von Übersetzer/Verlag; keine eigenen Lizenzen; Lebensdaten vieler Übersetzer ungeprüft.
- **Quran Foundation API:** widerrufliche Lizenz, Zwischenspeicher höchstens 1 Woche, Weitergabe als Datensatz nur mit Vertrag – unverträglich mit Offline-PWA und öffentlichem Repo; Laufzeitabruf wäre eine Drittanfrage.
- **KFGQPC-Schrift/Texte:** Vervielfältigung nach Drittangaben nur mit schriftlicher Genehmigung – meiden.
- **Audio (z. B. EveryAyah):** keine Lizenz – nicht selbst hosten.
- Bestand: Al-Fatiha (Arabisch + Übersetzungen) ohne Quellenangabe – **nicht verwendbar** (G-06).

## Wege

1. **Tanzil-Text** (Arabisch) per Import-Skript zur Buildzeit aus einer von Menschen heruntergeladenen Datei, Übersetzungen als Platzhalter.
2. **Quran-Foundation-API** zur Laufzeit.
3. **Nur Platzhalter** auf allen Quran-Seiten.

## Bewertung

Weg 2 verletzt K-14/K-15 und ist lizenzrechtlich unsicher. Weg 3 erfüllt G-06, liefert aber keinen Inhalt. **Weg 1 gewählt – mit menschlicher Freigabe:** Die Zustimmung zu Nutzungsbedingungen und der Download sind Handlungen, die der Orchestrator nicht selbst vornimmt (M-036). Bis dahin verhält sich die Seite wie Weg 3.

## Festlegungen

- Import-Skript `web/scripts/quran-import.mjs <tanzil-datei.xml>`: prüft SHA-256 gegen den in MENSCHEN.md eingetragenen Hash, liest Suren/Verse unverändert (kein Normalisieren, keine Umbrüche), schreibt `quran_vers(sure, vers, text_ar)` und `quran_sure(nr, name_ar, verse_anzahl)`; Quellenvermerk „Tanzil Project – tanzil.net, Version …, Abruf …“ in `quran_quelle`.
- Die Tanzil-Datei liegt außerhalb des Repos (`web/daten/quran/` in .gitignore), bis M-002/M-036 geklärt sind.
- Seiten: arabischer Text `dir="rtl" lang="ar"` in Amiri (lokal, OFL, ADR 0014 – nicht die KFGQPC-Schrift); Quellenzeile mit Link auf tanzil.net auf jeder Surenseite (der Link ist eine Navigation, keine Anfrage beim Seitenaufruf).
- Übersetzungen: Feld `uebersetzung jsonb {de?, tr?, en?}` mit `quelle` und `lizenz` je Sprache; ohne geklärte Lizenz Platzhalter `[Koranvers – Text von der Gemeinde]`. Gemeinfreie Ausgaben (z. B. Elmalılı Hamdi Yazır, tr; Pickthall, en) sind möglich, aber nur nach Bestätigung durch die Gemeinde (M-036b) und mit Ausgabeangabe.
- Surennamen und -nummern: aus der Tanzil-Datei; bis dahin nur die fünf Namen aus dem Bestand als Navigation, ohne Verstext.
- Audio: Platzhalter-Zustand des Designs („Audio … Platzhalter“), kein Player ohne geklärte Quelle.

## Umkehrprobe

Falsch, wenn die Gemeinde eine eigene, lizenzierte Ausgabe (z. B. vom Dachverband) liefert – das Import-Skript nimmt dann diese Datei mit eigener Quellenangabe.

## Folgen zweiter Ordnung

- Z-01 verlangt nur Erreichbarkeit; die Surenseiten sind mit Platzhaltern vollständig erreichbar.
- MENSCHEN: M-036 (Tanzil-Bedingungen annehmen, Datei herunterladen, Hash eintragen), M-036b (Übersetzungen), M-036c (Audio).
