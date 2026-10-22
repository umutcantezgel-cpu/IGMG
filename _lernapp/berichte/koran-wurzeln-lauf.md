# Koran-Wurzeltabelle: erster Werkzeuglauf (L6-06)

Stand 21.10.2026. Werkzeuge: `_lernapp/werkzeuge/wurzeln/` (Anleitung `LIESMICH.md`). Ergebnis nur lokal im Scratchpad
(`…/scratchpad/wurzeln/`: `formen.tsv`, `vorschlaege-camel.tsv`, `wiktionary-wurzeln.tsv`, `pruefliste.tsv`,
`zusammenfassung.txt`); **nichts davon im Repository**. Ins Repository kommt erst die von der benannten Lehrkraft geprüfte
Tabelle (LM-31) unter `web/daten/[Ordnername festlegen]/` mit `QUELLE.md`; sichtbar erst mit zwei religiösen Freigaben.
Kein Quranic Arabic Corpus, keine Ableger, kein OpenITI.

## Eingaben

| Quelle | Stand | Lizenz | Verwendung |
|---|---|---|---|
| Tanzil Uthmani 1.1 (`web/daten/tanzil/quran-uthmani.xml`, gepinnt) | wie QUELLE.md | CC BY 3.0 mit Hinweis | 18.993 verschiedene Wortformen (Wortzählung wie `quran_wort`) |
| CAMeL Tools 1.6.0, Datenbank `calima-msa-r13` (Paket `morphology-db-msa-r13`, 40,5 MB) | Abruf 21.10.2026 | MIT bzw. GPL v2 (nur lokal) | Wurzel-Vorschläge je Form (zwei Lesarten: kleine Buchstaben weg bzw. ausgeschrieben) |
| Wiktionary über kaikki.org, `kaikki.org-dictionary-Arabic.jsonl` (521.119.623 Bytes, Stand 03.10.2026) | gestreamt, nicht gespeichert | CC BY-SA 4.0 | Wurzeln aus `ar-root`/`ar-rootbox` und den Wurzel-Kategorien: 12.781 Stichwörter, 190.832 Skelette |

`morphology-db-msa-s31` (LDC) wurde nicht geladen.

## Ergebnis (Vorschläge, ungeprüft)

| Status | alle Formen | Formen des Lern-App-Pfads (936) |
|---|---|---|
| `einig` (CAMeL und Wiktionary gleich) | 6.791 | 354 |
| `abweichend` (beide, ohne gemeinsame Wurzel) | 3.806 | 265 |
| `nur_camel` | 6.907 | 275 |
| `nur_wiktionary` | 282 | 10 |
| `ohne` Vorschlag | 1.207 | 32 |

Anteil der Wörter im Text, deren Form einen einigen Vorschlag hat: 35,7 %. Die Prüfliste ordnet die Formen des Pfads zuerst,
dann nach Vorkommen. Bekannte Grenzen: uthmanische Schreibungen (fehlende Alif, kleine Buchstaben) und angehängte Pronomen
mindern die Treffer im Wörterbuch; Eigennamen und Partikeln haben oft keine Wurzel. Die Werkzeuge raten keine Wurzeln; jede
Wurzel bestätigt die Lehrkraft.

## Nächste Schritte (Menschen)

1. Lehrkraft benennen (`[Person benennen]`, Rolle `religioese_pruefung`) und Ordnernamen festlegen (`[Ordnername festlegen]`).
2. Prüfliste (zuerst die 936 Pfad-Formen) fachlich prüfen; Spalte `wurzel_geprueft` ausfüllen.
3. Geprüfte Tabelle gepinnt mit SHA-256 und `QUELLE.md` nach `web/daten/…`; zwei religiöse Freigaben (Prüfungsart `wurzel`,
   Kennung der Tabelle, Hash = SHA-256 der Datei). Erst dann Wurzel-Übungen (`koran_wort`, `waehleWurzel`).
