#!/usr/bin/env python3
"""Stichprobe: Lizenz/Besitzer/Text/is_unapproved je Satz gegen die Tatoeba-API (v1)."""
import json, random, sys, time, urllib.request, os
S = sys.argv[1]; n = int(sys.argv[2]); seed = int(sys.argv[3])
rnd = random.Random(seed)
erg = []
for l in ("deu", "tur", "ara"):
    zeilen = open(os.path.join(S, f"auszug/tatoeba/saetze_{l}.tsv"), encoding="utf-8").read().splitlines()[1:]
    for z in rnd.sample(zeilen, n):
        t = z.split("\t")
        url = f"https://api.tatoeba.org/v1/sentences/{t[0]}"
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                d = json.load(r)["data"]
            erg.append({"id": t[0], "lang": l, "lizenz_auszug": t[4], "lizenz_api": d.get("license"),
                        "text_gleich": d.get("text") == t[2], "besitzer_gleich": (d.get("owner") or "\\N") == t[3],
                        "unapproved": d.get("is_unapproved")})
        except Exception as e:
            erg.append({"id": t[0], "lang": l, "fehler": str(e)[:80]})
        time.sleep(0.4)
json.dump(erg, open(os.path.join(S, "tmp/tatoeba/api_stichprobe.json"), "w"), indent=0)
from collections import Counter
print("n", len(erg))
print("lizenz gleich", sum(1 for e in erg if e.get("lizenz_api") == e.get("lizenz_auszug")))
print("lizenzen api", Counter(e.get("lizenz_api") for e in erg))
print("text gleich", sum(1 for e in erg if e.get("text_gleich")), "besitzer gleich", sum(1 for e in erg if e.get("besitzer_gleich")))
print("unapproved", Counter(e.get("unapproved") for e in erg))
print("fehler", [e for e in erg if "fehler" in e])
print("abweichungen", [e for e in erg if "fehler" not in e and not (e["text_gleich"] and e["besitzer_gleich"] and e["lizenz_api"] == e["lizenz_auszug"])])
