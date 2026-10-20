#!/usr/bin/env python3
"""S7: Paare nach dem vorgeschlagenen Standardfilter zählen (nur Zählung, kein Export).
Ausschluss, wenn eine Seite: negative Bewertung, Wartungs-Tag (@…), Koran-/Hadith-4-Gramm (ar),
Inhaltsindikator (inkl. Religion -> religionsbezug, braucht zwei Freigaben) oder > 12 Wörter."""
import json, os, re, sys
S = sys.argv[1]
sys.argv = [sys.argv[0], S]
ns = {}
src = open(os.path.join(S, "skripte/tatoeba_auswerten.py"), encoding="utf-8").read().split("def main():")[0]
exec(compile(src, "tatoeba_auswerten_kopf", "exec"), ns)
kategorien, woerter = ns["kategorien"], ns["woerter"]
ng = json.load(open(os.path.join(S, "tmp/tatoeba/ngramm_4.json")))
ng_ids = set(ng["ids_koran"]) | set(ng["ids_hadith"])
saetze = {}
for l in ("deu", "tur", "ara"):
    for z in open(os.path.join(S, f"auszug/tatoeba/saetze_{l}.tsv"), encoding="utf-8").read().splitlines()[1:]:
        t = z.split("\t")
        saetze[(l, t[0])] = t
def raus(l, sid):
    t = saetze[(l, sid)]
    gr = []
    if int(t[8]) > 0: gr.append("bewertung")
    if any(x.startswith("@") for x in t[9].split("|") if x): gr.append("wartung")
    if l == "ara" and sid in ng_ids: gr.append("ngramm")
    k = kategorien(l, t[2])
    if "religion" in k: gr.append("religion")
    if k - {"religion"}: gr.append("inhalt")
    if woerter(t[2]) > 12: gr.append("laenge")
    return gr
from collections import Counter
for p in ("deu-tur", "deu-ara", "tur-ara"):
    a, b = p.split("-")
    gruende = Counter(); ok = 0; n = 0
    for z in open(os.path.join(S, f"auszug/tatoeba/paare_{p}.tsv"), encoding="utf-8").read().splitlines()[1:]:
        x, y = z.split("\t"); n += 1
        g = set(raus(a, x)) | set(raus(b, y))
        for gg in g: gruende[gg] += 1
        ok += not g
    print(p, "paare", n, "nach_standardfilter", ok, f"({100*ok/n:.1f} %)", dict(gruende))
