# Wurzel-Werkzeug (L6-06)

Eigene Koran-Wurzeltabelle nach ADR 0045 Nr. 13 und L0-E12, **ohne** Quranic Arabic Corpus und ohne dessen Ableger, ohne
OpenITI. Die Werkzeuge erzeugen nur **Vorschläge** zur fachlichen Prüfung durch die benannte Lehrkraft `[Person benennen]`
(Rolle `religioese_pruefung`, LM-31). Alle Ergebnisse bleiben lokal (Ausgabeordner außerhalb des Repositorys, z. B. im
Scratchpad); die Werkzeuge brechen ab, wenn `--aus` im Repository liegt. Ins Repository kommt erst die geprüfte Tabelle,
gepinnt unter `web/daten/[Ordnername festlegen]/` mit `QUELLE.md` (CC BY-SA 4.0 mit dem Hinweis von Tanzil), und sichtbar wird
sie in der Lern-App erst mit zwei religiösen Freigaben (Prüfungsart `wurzel`, KERN 4.0 §2.3). Bis dahin gibt es keine
Wurzel-Übungen (`koran_wort` mit `waehleWurzel` bleibt verborgen).

In dieser Datei und in den Werkzeugen steht keine arabische Schrift (Werkstatt, KERN 4.0 §3); arabische Formen entstehen nur
zur Laufzeit aus `web/daten/tanzil/quran-uthmani.xml` und stehen nur im Ausgabeordner.

## Schritte

| Schritt | Werkzeug | Ergebnis im Ausgabeordner |
|---|---|---|
| 1 Formen | `node formen.mjs --aus <ordner>` | `formen.tsv`: alle verschiedenen Wortformen (18.993) mit erster Stelle, Vorkommen, Skelett |
| 2 CAMeL | `camel_vorschlag.py --aus <ordner>` (venv, siehe Kopf der Datei) | `vorschlaege-camel.tsv`: Wurzeln je Form nach Häufigkeit der Analysen |
| 3 Wiktionary | `curl -sS https://kaikki.org/dictionary/Arabic/kaikki.org-dictionary-Arabic.jsonl \| node wiktionary.mjs --aus <ordner> --datei -` | `wiktionary-wurzeln.tsv`: Wurzel aus der Vorlage `ar-root` je Skelett (Stichwort und Formen) |
| 4 Prüfliste | `node zusammenfuehren.mjs --aus <ordner>` | `pruefliste.tsv` (Pfad-Formen zuerst, dann nach Vorkommen) und `zusammenfassung.txt` |

## Quellen und Lizenzen (nur lokal)

- **Tanzil** (Uthmani 1.1, CC BY 3.0 mit Hinweispflicht): gepinnt in `web/daten/tanzil/`, unverändert gelesen.
- **CAMeL Tools** 1.6.0 (MIT), nur mit der Datenbank `calima-msa-r13` aus dem Paket `morphology-db-msa-r13` (GPL v2, nur als
  lokales Werkzeug); **nie** `morphology-db-msa-s31` (LDC). Einrichtung ohne die schweren Abhängigkeiten (`--no-deps`, dann
  nur die für die Morphologie nötigen Pakete), Daten unter `CAMELTOOLS_DATA` im Scratchpad.
- **Wiktionary** über kaikki.org (en-Ausgabe, CC BY-SA 4.0): Wurzel aus `etymology_templates` (`ar-root`); keine Beispiele,
  keine Glossen übernommen.

## Status je Form

- `einig`: CAMeL und Wiktionary nennen dieselbe Wurzel (Vorschlag = diese).
- `abweichend`: beide nennen Wurzeln, aber keine gemeinsame – genau prüfen.
- `nur_camel` / `nur_wiktionary`: nur eine Quelle; `ohne`: kein Vorschlag (oft Eigennamen, Partikeln, uthmanische Schreibungen).

Die Lehrkraft trägt je Form die geprüfte Wurzel in `wurzel_geprueft` ein (oder leer lassen = keine Wurzel), Anmerkungen in
`anmerkung`. Die Umschrift der Formen steht in der Arbeitsliste `_lernapp/berichte/koran-arbeitsliste.md`.

## Stand des ersten Laufs

Siehe `_lernapp/berichte/koran-wurzeln-lauf.md` (Zahlen ohne arabische Schrift; die Prüfliste selbst liegt nur lokal).
