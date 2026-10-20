#!/usr/bin/env python3
"""S7: Vokalisierungsgrad arabischer Texte (Tatoeba-Sätze, kaikki-Lemmata). Nur Zählungen."""
import gzip, json, sys, unicodedata
from collections import Counter
S = sys.argv[1]
HARAKAT = set(range(0x064B, 0x0653))  # Fathatan .. Sukun
BUCHST = set(range(0x0621, 0x064B)) | {0x0671}
def grad(t):
    t = unicodedata.normalize("NFC", t)
    b = sum(1 for c in t if ord(c) in BUCHST)
    h = sum(1 for c in t if ord(c) in HARAKAT)
    return b, h
z = Counter()
for zl in open(f"{S}/auszug/tatoeba/saetze_ara.tsv", encoding="utf-8").read().splitlines()[1:]:
    b, h = grad(zl.split("\t")[2])
    q = h / b if b else 0
    z["saetze"] += 1
    z["ohne_harakat"] += h == 0
    z["teilweise_<0.5"] += 0 < q < 0.5
    z["weitgehend_>=0.5"] += q >= 0.5
    z["voll_>=0.8"] += q >= 0.8
print("tatoeba_ara", dict(z))
k = Counter()
with gzip.open(f"{S}/auszug/kaikki/en-ara.jsonl.gz", "rt", encoding="utf-8") as f:
    for line in f:
        r = json.loads(line)
        if "fo" in r or "gl" not in r:
            continue
        k["lemmata"] += 1
        kan = r.get("kanon")
        if kan:
            k["mit_kanon"] += 1
            b, h = grad(kan)
            if b and h / b >= 0.8:
                k["kanon_voll_>=0.8"] += 1
        if r.get("rom"):
            k["mit_umschrift"] += 1
        if r.get("pl"):
            k["mit_plural"] += 1
        if r.get("g"):
            k["mit_genus"] += 1
print("kaikki_en_ara", dict(k))
