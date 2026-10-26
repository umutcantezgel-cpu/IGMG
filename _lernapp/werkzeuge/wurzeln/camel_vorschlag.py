#!/usr/bin/env python3
"""
Schritt 2 (L6-06, ADR 0045 Nr. 13): Wurzel-Vorschlaege fuer jede Wortform aus `<aus>/formen.tsv` mit CAMeL Tools,
nur lokal und nur mit der Datenbank `calima-msa-r13` (Paket `morphology-db-msa-r13`, GPL v2) - nie `msa-s31` (LDC).
Ergebnis `<aus>/vorschlaege-camel.tsv`: nr, eingabe, wurzeln (nach Haeufigkeit der Analysen), analysen.
Nur Vorschlaege fuer die Pruefung durch die Lehrkraft (LM-31); nichts davon ungeprueft ins Repository.

Einrichtung (Scratchpad, ausserhalb des Repositorys; alle Pakete mit Fassung und SHA-256, kompiliert mit
--exclude-newer 2026-10-07 = Aufnahme 21.10.2026 minus 14 Tage, L0-E10; Python 3.11 bis 3.13):
  python3 -m venv <venv>
  <venv>/bin/pip install --require-hashes --no-deps -r _lernapp/werkzeuge/wurzeln/requirements-camel.txt
  <venv>/bin/pip install --require-hashes -r _lernapp/werkzeuge/wurzeln/requirements.txt
  CAMELTOOLS_DATA=<daten> <venv>/bin/camel_data -i morphology-db-msa-r13
camel-tools kommt ohne seine Abhaengigkeiten (--no-deps; sonst torch, transformers, scikit-learn ...); requirements.in nennt
nur, was der Analysator braucht (dazu emoji fuer camel_tools.utils.charsets). Neu kompilieren: Befehle im Kopf der .in-Dateien.
Aufruf:
  CAMELTOOLS_DATA=<daten> <venv>/bin/python -I _lernapp/werkzeuge/wurzeln/camel_vorschlag.py --aus <ordner>
"""
import argparse
import collections
import csv
import os
import re
import sys

DB_NAME = "calima-msa-r13"
VERBOTEN = "msa-s31"

# Zeichen nur als Codepunkte (Werkstatt): Harakat, Koranzeichen, Tatweel; kleine Buchstaben
ZEICHEN = re.compile("[\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E4\u06E7-\u06ED\u0640]")
ALIF_KLEIN = "\u0670"
WAW_KLEIN = "\u06E5"
YA_KLEIN = "\u06E6"
ALIF = "\u0627"
ALIF_WASLA = "\u0671"


def eingaben(form):
    """Zwei Lesarten der uthmanischen Form fuer heutige Woerterbuecher: kleine Buchstaben weg bzw. ausgeschrieben."""
    grund = ZEICHEN.sub("", form).replace(ALIF_WASLA, ALIF)
    weg = grund.replace(ALIF_KLEIN, "").replace(WAW_KLEIN, "").replace(YA_KLEIN, "")
    aus = grund.replace(ALIF_KLEIN, ALIF).replace(WAW_KLEIN, "\u0648").replace(YA_KLEIN, "\u064A")
    return list(dict.fromkeys([weg, aus]))


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--aus", required=True)
    p.add_argument("--grenze", type=int, default=0, help="nur die ersten n Formen (Probe)")
    a = p.parse_args()
    wurzel = os.path.realpath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    aus = os.path.realpath(a.aus)
    if aus == wurzel or aus.startswith(wurzel + os.sep):
        sys.exit("Ausgabe nie ins Repository (ungepruefte Daten, LM-31)")
    if VERBOTEN in DB_NAME:
        sys.exit("msa-s31 ist nicht zulaessig")

    from camel_tools.morphology.analyzer import Analyzer
    from camel_tools.morphology.database import MorphologyDB

    db = MorphologyDB.builtin_db(DB_NAME, "a")
    analyse = Analyzer(db, backoff="NONE", cache_size=100000)

    with open(os.path.join(aus, "formen.tsv"), encoding="utf-8") as f:
        formen = list(csv.DictReader(f, delimiter="\t", quoting=csv.QUOTE_NONE))
    if a.grenze:
        formen = formen[: a.grenze]
    ohne = 0
    with open(os.path.join(aus, "vorschlaege-camel.tsv"), "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f, delimiter="\t", quoting=csv.QUOTE_NONE, escapechar="\\", lineterminator="\n")
        w.writerow(["nr", "eingabe", "wurzeln", "analysen"])
        for z in formen:
            zaehler = collections.Counter()
            n = 0
            for e in eingaben(z["form"]):
                for x in analyse.analyze(e):
                    r = x.get("root", "")
                    if r and r not in ("NTWS", "PUNC", "DIGIT", "FOREIGN"):
                        zaehler[r] += 1
                        n += 1
            if not zaehler:
                ohne += 1
            w.writerow([z["nr"], " ".join(eingaben(z["form"])), " ".join(r for r, _ in zaehler.most_common()), n])
    print(f"[wurzeln/camel] {len(formen)} Formen, ohne Vorschlag: {ohne} -> {os.path.join(aus, 'vorschlaege-camel.tsv')}")


if __name__ == "__main__":
    main()
