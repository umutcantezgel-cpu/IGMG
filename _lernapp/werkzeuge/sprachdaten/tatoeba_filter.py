#!/usr/bin/env python3
"""S7 Tatoeba-Stromfilter. Liest einen entpackten Tatoeba-Export von stdin und
schreibt nur die Zeilen, deren Satz-ID in einem der Paar-Linkdateien vorkommt.

Modi:
  saetze  <lang> <links...>   sentences_detailed: id, lang, text, user, added, modified
  ids     <lang> <links...>   Dateien mit Satz-ID in Spalte 1 (CC0, Tags)
  bewert  <links...>          users_sentences.csv: user, id, review, added, modified
                              -> id, n_pos, n_null, n_neg (nur gesuchte IDs)
Linkdateien: TSV "id_a<TAB>id_b" mit Sprachkürzeln im Namen, z. B. links_deu-tur.tsv.
Die Sprache einer Spalte ergibt sich aus dem Dateinamen.
"""
import os
import re
import sys
from collections import defaultdict


def lade_ids(links, lang=None):
    ids = set()
    for pfad in links:
        m = re.search(r"([a-z]{3})-([a-z]{3})", os.path.basename(pfad))
        a, b = m.group(1), m.group(2)
        with open(pfad, encoding="utf-8") as f:
            for zeile in f:
                teile = zeile.rstrip("\n").split("\t")
                if len(teile) < 2:
                    continue
                if lang is None or lang == a:
                    ids.add(teile[0])
                if lang is None or lang == b:
                    ids.add(teile[1])
    return ids


def main():
    modus = sys.argv[1]
    ein = sys.stdin.buffer
    aus = sys.stdout
    n_ein = n_aus = 0
    if modus in ("saetze", "ids"):
        lang = sys.argv[2]
        ids = lade_ids(sys.argv[3:], lang)
        for roh in ein:
            n_ein += 1
            zeile = roh.decode("utf-8")
            sid = zeile.split("\t", 1)[0]
            if sid in ids:
                if modus == "saetze" and zeile.split("\t")[1] != lang:
                    continue
                aus.write(zeile if zeile.endswith("\n") else zeile + "\n")
                n_aus += 1
    elif modus == "bewert":
        ids = lade_ids(sys.argv[2:])
        z = defaultdict(lambda: [0, 0, 0])
        for roh in ein:
            n_ein += 1
            teile = roh.decode("utf-8", "replace").rstrip("\n").split("\t")
            if len(teile) < 3 or teile[1] not in ids:
                continue
            wert = teile[2].strip()
            if wert == "1":
                z[teile[1]][0] += 1
            elif wert == "0":
                z[teile[1]][1] += 1
            elif wert == "-1":
                z[teile[1]][2] += 1
        for sid in sorted(z, key=int):
            p, n0, neg = z[sid]
            aus.write(f"{sid}\t{p}\t{n0}\t{neg}\n")
            n_aus += 1
    else:
        sys.exit("unbekannter Modus")
    print(f"[{modus}] gelesen {n_ein}, geschrieben {n_aus}", file=sys.stderr)


if __name__ == "__main__":
    main()
