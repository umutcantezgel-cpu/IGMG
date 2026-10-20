#!/usr/bin/env python3
"""S7: Wie der geplante Wächter (KERN §3 b/c): Arabische Tatoeba-Sätze mit >= 4
aufeinanderfolgenden Wörtern aus Tanzil (Koran) bzw. Bukhari (Hadith).
Ausgabe nur Zählungen und Satz-IDs (keine arabische Schrift)."""
import json, re, sys, unicodedata, xml.etree.ElementTree as ET
from collections import Counter
D = sys.argv[1]  # web/daten
saetze = sys.argv[2]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 4
WEG = set(range(0x0610, 0x061B)) | set(range(0x064B, 0x0660)) | {0x0670, 0x0640} | set(range(0x06D6, 0x06EE))
ALIF = {0x0622: 0x0627, 0x0623: 0x0627, 0x0625: 0x0627, 0x0671: 0x0627, 0x0649: 0x064A, 0x0629: 0x0647}
def norm(s):
    s = unicodedata.normalize("NFC", s)
    s = "".join(chr(ALIF.get(ord(c), ord(c))) for c in s if ord(c) not in WEG)
    return re.findall(r"[^\W\d_]+", s)
def grams(toks, n):
    return {tuple(toks[i:i+n]) for i in range(len(toks) - n + 1)}
koran = set()
for aya in ET.parse(f"{D}/tanzil/quran-uthmani.xml").getroot().iter("aya"):
    koran |= grams(norm(aya.get("text")), N)
hadith = set()
h = json.load(open(f"{D}/hadith/ara-bukhari.json", encoding="utf-8"))
for x in h["hadiths"]:
    hadith |= grams(norm(x.get("text", "")), N)
treffer_k, treffer_h = [], []
n = 0
for z in open(saetze, encoding="utf-8").read().splitlines()[1:]:
    t = z.split("\t"); n += 1
    g = grams(norm(t[2]), N)
    if g & koran: treffer_k.append(t[0])
    if g & hadith: treffer_h.append(t[0])
print(json.dumps({"n_gramm": N, "saetze": n, "koran_ngramme": len(koran), "hadith_ngramme": len(hadith),
                  "treffer_koran": len(treffer_k), "treffer_hadith": len(treffer_h),
                  "ids_koran": treffer_k, "ids_hadith": treffer_h}))
