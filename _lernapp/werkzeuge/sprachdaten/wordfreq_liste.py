#!/usr/bin/env python3
"""S7: wordfreq-cBpack (msgpack.gz) aus dem Wheel lesen, Rangliste als TSV schreiben.
Aufruf: venv/bin/python -I wordfreq_liste.py <wheel> <datei-im-wheel> <max> > ausgabe.tsv"""
import gzip, io, sys, zipfile, msgpack
whl, name, maxn = sys.argv[1], sys.argv[2], int(sys.argv[3])
roh = zipfile.ZipFile(whl).read(name)
daten = msgpack.unpackb(gzip.decompress(roh), raw=False)
kopf, eimer = daten[0], daten[1:]
assert kopf.get("format") == "cB" and kopf.get("version") == 1, kopf
print("rang\twort\tzipf")
rang = 0
for i, woerter in enumerate(eimer):
    zipf = 9 - i / 100
    for w in woerter:
        rang += 1
        if rang > maxn:
            sys.exit(0)
        print(f"{rang}\t{w}\t{zipf:.2f}")
print(f"{name}: {rang} Wörter", file=sys.stderr)
