#!/usr/bin/env python3
"""S7: Kernauszug kaikki für das Repository (Vorschlag ADR 0025/0045).
Nur Lemmata, die von den Top-N-Wörtern erreicht werden (tmp/bedarf_lemmata.json), dazu Einträge,
deren Übersetzungstabelle ein Bedarfswort einer anderen Sprache enthält (Rückrichtung).
Je Eintrag: Lemma, Wortart, Genus, Plural, Hilfsverb, Glossen, Übersetzungen, Register,
kanonische Form/Umschrift und nur die Stammformen aus der Kopfzeile (kf) – keine vollen Tabellen.
Aufruf: python3 -I kern_auszug.py <S7-Verzeichnis> <N> <zielverzeichnis>"""
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
REIHE = ["w", "l", "q", "pos", "kanon", "rom", "g", "pl", "aux", "kf", "gl", "ue", "mk"]
zeilen = {l: [] for l in keys}
n_rueck = {l: 0 for l in keys}
for datei in ("en-deu", "en-tur", "en-ara", "de-wikt", "tr-wikt"):
    with gzip.open(os.path.join(S, "auszug/kaikki", f"{datei}.jsonl.gz"), "rt", encoding="utf-8") as f:
        for z in f:
            r = json.loads(z)
            if "fo" in r:
                continue
            l = r["l"]
            drin = norm(l, r["w"]) in keys[l]
            if not drin and r.get("ue"):
                if any(x[0] in keys and norm(x[0], x[1]) in keys[x[0]] for x in r["ue"]):
                    drin = True
                    n_rueck[l] += 1
            if not drin:
                continue
            k = dict(r)
            formen = k.pop("formen", [])
            if r["q"] == "en":
                kf = [[fm, t.replace("kopfzeile", "").strip()] for fm, t in formen if "kopfzeile" in t.split()]
                if kf:
                    k["kf"] = kf
            k = {s: k[s] for s in REIHE if s in k}
            zeilen[l].append((norm(l, r["w"]), r["q"], r.get("pos") or "", json.dumps(k, ensure_ascii=False, separators=(",", ":"))))
os.makedirs(Z, exist_ok=True)
for l, zs in zeilen.items():
    zs.sort()
    p = os.path.join(Z, f"kaikki-kern-{l}-top{N}.jsonl")
    with open(p, "w", encoding="utf-8") as f:
        for *_, z in zs:
            f.write(z + "\n")
    print(f"{l} top{N}: Lemmata {len(keys[l])}, Einträge {len(zs)} (davon über Rückrichtung {n_rueck[l]}), Bytes {os.path.getsize(p)}")
