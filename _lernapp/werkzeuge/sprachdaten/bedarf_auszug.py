#!/usr/bin/env python3
"""S7: Bedarfsauszug aus den gekürzten kaikki-Dateien – nur Lemmata, die von den Top-N-Wörtern
(wordfreq; ar zusätzlich CAMeL-MSA) erreicht werden, aus allen drei Wiktionary-Ausgaben.
Aufruf: python3 -I bedarf_auszug.py <S7-Verzeichnis> <N> <zielverzeichnis>
Schreibt <ziel>/kaikki-bedarf-<l>-top<N>.jsonl (sortiert nach Lemma, Ausgabe, Wortart)."""
import gzip
import json
import os
import sys
import unicodedata

S, N, Z = sys.argv[1], sys.argv[2], sys.argv[3]
WEG = set(range(0x0610, 0x061B)) | set(range(0x064B, 0x0660)) | {0x0670, 0x0640} | set(range(0x06D6, 0x06EE))
ALIF = {0x0622: 0x0627, 0x0623: 0x0627, 0x0625: 0x0627, 0x0671: 0x0627, 0x0649: 0x064A}


def norm(l, s):
    if l == "de":
        return s.casefold()
    if l == "tr":
        return s.replace("I", chr(0x0131)).replace(chr(0x0130), "i").lower()
    s = unicodedata.normalize("NFC", s)
    return "".join(chr(ALIF.get(ord(c), ord(c))) for c in s if ord(c) not in WEG)


bedarf = json.load(open(os.path.join(S, "tmp/bedarf_lemmata.json"), encoding="utf-8"))
keys = {l: set(bedarf[f"{l}/{N}"]) for l in ("de", "tr", "ar")}
zeilen = {l: [] for l in keys}
for datei in ("en-deu", "en-tur", "en-ara", "de-wikt", "tr-wikt"):
    with gzip.open(os.path.join(S, "auszug/kaikki", f"{datei}.jsonl.gz"), "rt", encoding="utf-8") as f:
        for z in f:
            r = json.loads(z)
            if "fo" in r:
                continue
            l = r["l"]
            if norm(l, r["w"]) in keys[l]:
                zeilen[l].append((norm(l, r["w"]), r["q"], r.get("pos") or "", z))
os.makedirs(Z, exist_ok=True)
for l, zs in zeilen.items():
    zs.sort(key=lambda x: (x[0], x[1], x[2]))
    p = os.path.join(Z, f"kaikki-bedarf-{l}-top{N}.jsonl")
    with open(p, "w", encoding="utf-8") as f:
        for _, _, _, z in zs:
            f.write(z)
    print(f"{l} top{N}: Lemmata {len(keys[l])}, Einträge {len(zs)}, Bytes {os.path.getsize(p)}")
