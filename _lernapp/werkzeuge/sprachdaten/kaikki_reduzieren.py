#!/usr/bin/env python3
"""S7: Wiktextract-JSONL (kaikki.org) im Strom auf die benötigten Felder kürzen.

Aufruf: <jsonl auf stdin> | python3 -I kaikki_reduzieren.py <ausgabe> <sprachen> <uebers_sprachen> <stat.json>
  ausgabe        z. B. en.json      (Wiktionary-Ausgabe, aus der der Strom stammt: en, de oder tr)
  sprachen       z. B. de,tr,ar      (lang_code der Einträge, die behalten werden)
  uebers_sprachen z. B. tr,ar        (lang_code der Übersetzungen, die behalten werden; "-" = keine)
stdout: gekürztes JSONL (eine Zeile je Eintrag), stderr: Fortschritt.

Behalten je Eintrag (Schlüssel bewusst kurz):
  w (Seitentitel/Lemma), l (Sprache), q (Wiktionary-Ausgabe), pos (Wortart),
  kanon (vokalisierte bzw. kanonische Form, falls abweichend), rom (Umschrift, nur ar/en),
  g (Genus: m/f/n/c), pl (Pluralformen), formen ([[Form, "Merkmale"]...]),
  gl ([[Glosse, "Merkmale"]...] in der Sprache der Ausgabe), fo (Grundform bei reinen Formeinträgen),
  ue ([[Sprache, Wort, Bedeutungshinweis]...]), mk (Register/Themen über alle Bedeutungen),
  aux (Hilfsverb im Perfekt, nur de). Merkmal "kopfzeile" = Form aus der Kopfzeile (Stammform, nur en-Ausgabe).
Verworfen: Beispiele (alle; Zählung der Beispiele mit `ref`), Töne, Etymologie, Kategorien, Links,
Synonyme u. Ä., Vorlagen, Silbentrennung.
"""
import json
import sys
from collections import Counter

AUSGABE, SPRACHEN, UEBERS, STAT = sys.argv[1], set(sys.argv[2].split(",")), sys.argv[3], sys.argv[4]
UEBERS = set() if UEBERS == "-" else set(UEBERS.split(","))
GENUS = {"masculine": "m", "feminine": "f", "neuter": "n", "neutral": "n", "common-gender": "c", "common": "c"}
WEG_FORM = {"table-tags", "inflection-template", "romanization", "transliteration", "canonical", "class", "includes-article",
            "error-unrecognized-form", "error-lua-exec", "error-lua-timeout"}
REGISTER = {"vulgar", "offensive", "derogatory", "slur", "pejorative", "colloquial", "informal", "slang",
            "archaic", "obsolete", "dated", "outdated", "rare", "dialectal", "regional", "figuratively",
            "figurative", "humorous", "euphemistic", "Internet", "poetic", "literary", "formal", "historical",
            "ethnic", "sexual", "childish", "nonstandard", "proscribed", "uncommon", "Classical"}
AUX_DE = {"habe", "hast", "hat", "haben", "habt", "hatte", "hattest", "hatten", "hattet", "hätte", "hättest", "hätten",
          "hättet", "bin", "bist", "ist", "sind", "seid", "sein", "war", "warst", "waren", "wart", "wäre", "wärest", "wärst",
          "wären", "wäret", "wärt", "sei", "seiest", "seist", "seien", "seiet", "werde", "wirst", "wird", "werden", "werdet",
          "würde", "würdest", "würden", "würdet", "zu", "worden", "geworden", "gewesen", "gehabt"}
KASUS = {"genitive", "dative", "accusative", "locative", "ablative", "instrumental", "possessive", "definite",
         "construct", "dual", "comparative", "superlative", "possessed-single", "possessed-many"}

st = Counter()
pos_z = Counter()
aus = sys.stdout


def glosse(s):
    g = s.get("glosses") or s.get("raw_glosses")
    if not g:
        return None
    return g[-1].strip()


for roh in sys.stdin.buffer:
    st["zeilen"] += 1
    # schneller Vorfilter: keine Zeile ohne passendes lang_code parsen
    if not any((f'"lang_code": "{l}"').encode() in roh for l in SPRACHEN):
        continue
    try:
        e = json.loads(roh)
    except ValueError:
        st["json_fehler"] += 1
        continue
    l = e.get("lang_code")
    if l not in SPRACHEN:
        continue
    if "redirect" in e or "word" not in e:
        st["weiterleitungen"] += 1
        continue
    st[f"eintraege_{l}"] += 1
    r = {"w": e["word"], "l": l, "q": AUSGABE, "pos": e.get("pos")}
    pos_z[f"{l}:{e.get('pos')}"] += 1

    # Bedeutungen
    gl, mk, fo = [], set(), set()
    nur_form = True
    for s in e.get("senses", []):
        for x in s.get("examples", []):
            st["beispiele"] += 1
            if "ref" in x:
                st["beispiele_mit_ref"] += 1
        tags = set(s.get("tags", []))
        mk |= tags & REGISTER
        mk |= {"thema:" + t for t in s.get("topics", [])}
        ziel = s.get("form_of") or s.get("alt_of")
        if ziel:
            fo |= {z.get("word") for z in ziel if z.get("word")}
        else:
            nur_form = False
        if "no-gloss" in tags:
            continue
        g = glosse(s)
        if g:
            gl.append([g, " ".join(sorted(tags & (REGISTER | {"form-of", "alt-of", "plural", "singular"})))])
    if not e.get("senses"):
        nur_form = False
    if gl:
        r["gl"] = gl
        st[f"mit_glosse_{l}"] += 1
    if nur_form and fo:
        r["fo"] = sorted(fo)
        st[f"formeintraege_{l}"] += 1
    else:
        st[f"lemmaeintraege_{l}"] += 1
    if mk:
        r["mk"] = sorted(mk)

    # Genus
    g = set()
    for t in e.get("tags", []):
        if t in GENUS:
            g.add(GENUS[t])
    for f in e.get("forms", []):
        if "canonical" in f.get("tags", []):
            g |= {GENUS[t] for t in f["tags"] if t in GENUS}
    for s in e.get("senses", []):
        g |= {GENUS[t] for t in s.get("tags", []) if t in GENUS}
    if g and e.get("pos") in ("noun", "name", "num", "pron"):
        r["g"] = sorted(g)
        st[f"mit_genus_{l}"] += 1

    # Formen, kanonische Form, Umschrift, Plural
    formen, gesehen, pl, pl_tab = [], set(), [], []
    for f in e.get("forms", []):
        fm = (f.get("form") or "").strip()
        tags = f.get("tags", [])
        ts = set(tags)
        if not fm or fm in ("-", "—", "–"):
            continue
        if "canonical" in ts and fm != r["w"]:
            r.setdefault("kanon", fm)
            continue
        if ("romanization" in ts or "transliteration" in ts) and "rom" not in r:
            r["rom"] = fm
            continue
        if ts & WEG_FORM or any(t.startswith("error-") for t in ts):
            continue
        if "auxiliary" in ts:  # Hilfsverb (haben/sein) ist keine Flexionsform
            r.setdefault("aux", [])
            for a in fm.replace(" or ", ",").split(","):
                if a.strip() and a.strip() not in r["aux"]:
                    r["aux"].append(a.strip())
            continue
        kopf = r["w"]
        mehrwort = " " in fm and " " not in kopf
        if mehrwort and l == "de" and fm.split(" ", 1)[0] not in AUX_DE:
            mehrwort = False  # trennbare Verben ("kommt an"), Superlativ ("am schnellsten")
        if mehrwort or ("." in fm and "." not in kopf) or fm == "Höflichkeitsform":
            st["formen_verworfen_mehrwort_oder_etikett"] += 1
            continue
        if not tags and AUSGABE != "en":
            st["formen_verworfen_ohne_merkmal"] += 1
            continue
        if (len(fm) <= 2 and len(kopf) > 3) or (fm.startswith("-") and not kopf.startswith("-")):
            st["formen_verworfen_bruchstueck"] += 1
            continue
        if "plural" in ts and not (ts & KASUS) and e.get("pos") in ("noun", "name", "adj"):
            if "source" not in f:
                pl.append(fm)
            elif "nominative" in ts or l == "de":
                pl_tab.append(fm)
        if l == "de" and "plural" in ts and "nominative" in ts and e.get("pos") == "noun" and AUSGABE == "de":
            pl_tab.append(fm)
        # Formen aus der Kopfzeile (Stammformen) markieren: in der en-Ausgabe ohne "source"
        kz = " kopfzeile" if (AUSGABE == "en" and "source" not in f) else ""
        schl = (fm, (" ".join(tags) + kz).strip())
        if schl in gesehen:
            continue
        gesehen.add(schl)
        formen.append([fm, schl[1]])
    if formen:
        r["formen"] = formen
        st[f"formen_{l}"] += len(formen)
    plural = list(dict.fromkeys(pl or pl_tab))
    if plural and e.get("pos") in ("noun", "name"):
        r["pl"] = plural
        st[f"mit_plural_{l}"] += 1

    # Übersetzungen (nur de- und tr-Ausgabe sinnvoll)
    if UEBERS:
        ue = []
        for t in e.get("translations", []):
            tl = t.get("lang_code")
            if tl in UEBERS and t.get("word"):
                ue.append([tl, t["word"], t.get("sense") or t.get("sense_index") or ""])
        if ue:
            r["ue"] = ue
            for tl in {x[0] for x in ue}:
                st[f"mit_uebersetzung_{l}_nach_{tl}"] += 1
    if not (r.get("gl") or r.get("formen") or r.get("fo") or r.get("ue")):
        st[f"leer_verworfen_{l}"] += 1
        continue
    aus.write(json.dumps(r, ensure_ascii=False, separators=(",", ":")) + "\n")
    if st["zeilen"] % 200000 == 0:
        print(f"{AUSGABE}: {st['zeilen']} Zeilen", file=sys.stderr, flush=True)

st_d = dict(st)
st_d["wortarten"] = dict(pos_z.most_common())
with open(STAT, "w", encoding="utf-8") as f:
    json.dump(st_d, f, ensure_ascii=False, indent=1)
print(f"{AUSGABE}: fertig {st['zeilen']} Zeilen", file=sys.stderr)
