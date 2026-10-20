#!/usr/bin/env python3
"""S7: Tatoeba-Auszug zusammenführen, Lizenzspalte ableiten, zählen.
Aufruf: python3 -I tatoeba_auswerten.py <S7-Verzeichnis>
Liest tmp/tatoeba/links_<a>-<b>.tsv; schreibt auszug/tatoeba/{saetze_<l>.tsv (ersetzt), paare_<a>-<b>.tsv} und tmp/tatoeba/stat.json
"""
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

S = sys.argv[1]
A = os.path.join(S, "auszug/tatoeba")
T = os.path.join(S, "tmp/tatoeba")
LANGS = ["deu", "tur", "ara"]
PAARE = [("deu", "tur"), ("deu", "ara"), ("tur", "ara")]

# --- Inhaltsleitfaden (LM-09) – nur Indikator, Wortanfang, Kleinschreibung ---
# Arabische Muster als Escapes (keine arabische Schrift in Dateien der Werkstatt).
ARAB = lambda s: s.encode("ascii").decode("unicode_escape")
A_ = lambda *xs: {ARAB(x) for x in xs}
KAT = {
    "alkohol": {
        "deu": r"\b(alkohol|bier|wein(?!en|t\b|st\b|te|end)|schnaps|whisky|wodka|sekt\b|betrunken|besoffen|cocktail|champagner|likör|kneipe)",
        "tur": r"\b(alkol|bira\b|biray|birayı|şarap|rakı|viski|votka|sarhoş|içki|meyhane|kokteyl|şampanya)",
        "ara": A_(r"\u062e\u0645\u0631", r"\u0646\u0628\u064a\u0630", r"\u0628\u064a\u0631\u0629", r"\u0633\u0643\u0631\u0627\u0646", r"\u0643\u062d\u0648\u0644"),
    },
    "schwein": {
        "deu": r"\b(schwein|speck|schinken)",
        "tur": r"\b(domuz)",
        "ara": A_(r"\u062e\u0646\u0632\u064a\u0631"),
    },
    "gluecksspiel": {
        "deu": r"\b(lotto|casino|kasino|glücksspiel|poker|roulette)",
        "tur": r"\b(kumar|piyango|kumarhane|poker|rulet)",
        "ara": A_(r"\u0642\u0645\u0627\u0631"),
    },
    "gewalt_waffen": {
        "deu": r"\b(töte|tötet|getötet|mord|ermord|umbring|erschieß|erschoss|waffe|pistole|gewehr|bombe|leiche|selbstmord)",
        "tur": r"\b(öldür|cinayet|katil|silah|tabanca|tüfek|bomba|ceset|intihar)",
        "ara": A_(r"\u0642\u062a\u0644", r"\u0645\u0633\u062f\u0633", r"\u0627\u0646\u062a\u062d\u0627\u0631", r"\u0633\u0644\u0627\u062d"),
    },
    "sexualitaet": {
        "deu": r"\b(sex|küss|kuss|liebhaber|nackt|verliebt)",
        "tur": r"\b(seks|öp|aşık|çıplak|flört)",
        "ara": set(),
    },
    "drogen_rauchen": {
        "deu": r"\b(droge|rauch|zigarette|kokain|heroin|haschisch|marihuana|kiffen)",
        "tur": r"\b(uyuşturucu|sigara|esrar|kokain|eroin)",
        "ara": A_(r"\u0645\u062e\u062f\u0631\u0627\u062a", r"\u0633\u064a\u062c\u0627\u0631\u0629", r"\u0633\u062c\u0627\u0626\u0631", r"\u062a\u062f\u062e\u064a\u0646"),
    },
    "religion": {
        "deu": r"\b(gott|allah|gebet|beten\b|betet|moschee|kirche|koran|bibel|jesus|prophet|religi|islam|muslim|ramadan|fasten|heilig|hölle|engel\b|teufel|sünde|paradies)",
        "tur": r"\b(allah|tanrı|dua\b|dualar|namaz|cami|kilise|kuran|incil|isa\b|peygamber|din\b|dini\b|islam|müslüman|hristiyan|ramazan|oruç|kutsal|cennet|cehennem|melek|şeytan|günah|inşallah|maşallah)",
        "ara": A_(r"\u0645\u0633\u062c\u062f", r"\u0642\u0631\u0627\u0646", r"\u0635\u0644\u0627\u0629", r"\u0631\u0645\u0636\u0627\u0646", r"\u0627\u0633\u0644\u0627\u0645", r"\u0646\u0628\u064a", r"\u062c\u0646\u0629", r"\u0643\u0646\u064a\u0633\u0629", r"\u0635\u0648\u0645"),
    },
}
ALLAH = A_(r"\u0627\u0644\u0644\u0647", r"\u0648\u0627\u0644\u0644\u0647", r"\u0628\u0627\u0644\u0644\u0647", r"\u0644\u0644\u0647", r"\u0641\u0627\u0644\u0644\u0647", r"\u062a\u0627\u0644\u0644\u0647")
HARAKAT = re.compile("[\u064b-\u0652\u0670\u0640]")


def norm_ar(s):
    s = HARAKAT.sub("", unicodedata.normalize("NFC", s))
    return s.replace("\u0623", "\u0627").replace("\u0625", "\u0627").replace("\u0622", "\u0627")


def stämme(tok):
    c = {tok}
    if tok[:1] in (ARAB(r"\u0648"), ARAB(r"\u0641")):
        c.add(tok[1:])
    for t in list(c):
        for pre in (ARAB(r"\u0628\u0627\u0644"), ARAB(r"\u0643\u0627\u0644"), ARAB(r"\u0644\u0644"), ARAB(r"\u0627\u0644"),
                    ARAB(r"\u0628"), ARAB(r"\u0644"), ARAB(r"\u0643")):
            if t.startswith(pre) and len(t) > len(pre) + 1:
                c.add(t[len(pre):])
    return c


def tr_lower(s):
    return s.replace("I", "ı").replace("İ", "i").lower()


def kategorien(lang, text):
    treffer = set()
    if lang == "ara":
        toks = re.findall(r"\w+", norm_ar(text))
        alle = set()
        for t in toks:
            alle |= stämme(t)
        for kat, muster in KAT.items():
            if alle & muster["ara"]:
                treffer.add(kat)
        if set(toks) & ALLAH:
            treffer.add("religion")
        return treffer
    t = tr_lower(text) if lang == "tur" else text.lower()
    for kat, muster in KAT.items():
        if re.search(muster[lang], t):
            treffer.add(kat)
    return treffer


def woerter(text):
    return len(re.findall(r"\w+", text))


def lade_saetze(l):
    d = {}
    with open(os.path.join(A, f"saetze_{l}.tsv"), encoding="utf-8") as f:
        for z in f:
            t = z.rstrip("\n").split("\t")
            if len(t) >= 6 and t[1] == l:
                d[t[0]] = {"text": t[2], "user": t[3], "added": t[4], "mod": t[5]}
            elif len(t) >= 6:
                pass
    return d


def lade_ids(pfad):
    s = set()
    if os.path.exists(pfad):
        with open(pfad, encoding="utf-8") as f:
            for z in f:
                s.add(z.split("\t", 1)[0].strip())
    return s


def main():
    saetze = {l: lade_saetze(l) for l in LANGS}
    cc0 = {l: lade_ids(os.path.join(T, f"cc0_{l}.tsv")) for l in LANGS}
    tags = defaultdict(list)
    for l in LANGS:
        with open(os.path.join(T, f"tags_{l}.tsv"), encoding="utf-8") as f:
            for z in f:
                t = z.rstrip("\n").split("\t")
                if len(t) == 2:
                    tags[t[0]].append(t[1])
    bew = {}
    with open(os.path.join(T, "bewertungen.tsv"), encoding="utf-8") as f:
        for z in f:
            sid, p, n0, neg = z.rstrip("\n").split("\t")
            bew[sid] = (int(p), int(n0), int(neg))

    stat = {"paare": {}, "saetze": {}, "inhalt": {}, "indirekt": {}}
    kat_cache = {}
    for (a, b) in PAARE:
        roh = []
        with open(os.path.join(T, f"links_{a}-{b}.tsv"), encoding="utf-8") as f:
            for z in f:
                t = z.rstrip("\n").split("\t")
                if len(t) == 2:
                    roh.append((t[0], t[1]))
        einzig = sorted(set(roh), key=lambda x: (int(x[0]), int(x[1])))
        gueltig = [(x, y) for (x, y) in einzig if x in saetze[a] and y in saetze[b]]
        fehlt_a = sum(1 for (x, y) in einzig if x not in saetze[a])
        fehlt_b = sum(1 for (x, y) in einzig if y not in saetze[b])
        ida = {x for x, _ in gueltig}
        idb = {y for _, y in gueltig}
        texte_a = {saetze[a][x]["text"] for x in ida}
        texte_b = {saetze[b][y]["text"] for y in idb}
        # Inhaltsindikator je Paar
        kz = Counter()
        flag_any = 0
        flag_ohne_rel = 0
        neg_paare = 0
        wartung = 0
        kurz = 0
        for (x, y) in gueltig:
            ka = kat_cache.setdefault((a, x), kategorien(a, saetze[a][x]["text"]))
            kb = kat_cache.setdefault((b, y), kategorien(b, saetze[b][y]["text"]))
            k = ka | kb
            for kk in k:
                kz[kk] += 1
            if k:
                flag_any += 1
            if k - {"religion"}:
                flag_ohne_rel += 1
            if bew.get(x, (0, 0, 0))[2] > 0 or bew.get(y, (0, 0, 0))[2] > 0:
                neg_paare += 1
            if any(t.startswith("@") for t in tags.get(x, []) + tags.get(y, [])):
                wartung += 1
            if woerter(saetze[a][x]["text"]) <= 8:
                kurz += 1
        with open(os.path.join(A, f"paare_{a}-{b}.tsv"), "w", encoding="utf-8") as f:
            f.write(f"{a}_id\t{b}_id\n")
            for (x, y) in gueltig:
                f.write(f"{x}\t{y}\n")
        stat["paare"][f"{a}-{b}"] = {
            "links_zeilen": len(roh),
            "links_einzig": len(einzig),
            "gueltig": len(gueltig),
            "fehlt_" + a: fehlt_a,
            "fehlt_" + b: fehlt_b,
            "saetze_" + a: len(ida),
            "saetze_" + b: len(idb),
            "texte_" + a: len(texte_a),
            "texte_" + b: len(texte_b),
            "paare_mit_negativer_bewertung": neg_paare,
            "paare_mit_wartungs_tag": wartung,
            "paare_kurz_zielseite_le8_woerter_" + a: kurz,
            "inhalt_markiert_irgendeine": flag_any,
            "inhalt_markiert_ohne_religion": flag_ohne_rel,
            "inhalt_je_kategorie": dict(kz.most_common()),
        }

    # Sätze je Sprache: Endformat mit Lizenzspalte
    alle_ids = defaultdict(set)
    for (a, b) in PAARE:
        with open(os.path.join(A, f"paare_{a}-{b}.tsv"), encoding="utf-8") as f:
            next(f)
            for z in f:
                x, y = z.rstrip("\n").split("\t")
                alle_ids[a].add(x)
                alle_ids[b].add(y)
    for l in LANGS:
        ids = sorted(alle_ids[l], key=int)
        nutzer = Counter()
        ohne = 0
        cc = 0
        neg = 0
        laengen = Counter()
        tagz = Counter()
        with open(os.path.join(A, f"saetze_{l}.tsv.neu"), "w", encoding="utf-8") as f:
            f.write("id\tsprache\ttext\tbenutzer\tlizenz\tangelegt\tgeaendert\tbew_pos\tbew_neg\ttags\n")
            for sid in ids:
                s = saetze[l][sid]
                lic = "CC0 1.0" if sid in cc0[l] else "CC BY 2.0 FR"
                cc += lic == "CC0 1.0"
                u = s["user"]
                if u in ("\\N", ""):
                    ohne += 1
                else:
                    nutzer[u] += 1
                p, _, n = bew.get(sid, (0, 0, 0))
                neg += n > 0
                w = woerter(s["text"])
                laengen["1-5" if w <= 5 else "6-8" if w <= 8 else "9-12" if w <= 12 else "13-20" if w <= 20 else ">20"] += 1
                tg = sorted(set(tags.get(sid, [])))
                for t in tg:
                    tagz[t] += 1
                f.write("\t".join([sid, l, s["text"], u, lic, s["added"], s["mod"], str(p), str(n), "|".join(tg).replace("\t", " ")]) + "\n")
        os.replace(os.path.join(A, f"saetze_{l}.tsv.neu"), os.path.join(A, f"saetze_{l}.tsv"))
        stat["saetze"][l] = {
            "saetze_in_paaren": len(ids),
            "cc0": cc,
            "cc_by_2_0_fr": len(ids) - cc,
            "mitwirkende": len(nutzer),
            "ohne_benutzername": ohne,
            "top5_mitwirkende_anteil": round(sum(c for _, c in nutzer.most_common(5)) / max(1, len(ids)), 3),
            "mit_negativer_bewertung": neg,
            "laenge_woerter": dict(laengen),
            "haeufigste_tags": tagz.most_common(12),
        }

    # Indirekte Paare über Englisch (nur Zählung)
    def eng(l):
        m = defaultdict(set)
        with open(os.path.join(T, f"links_{l}-eng.tsv"), encoding="utf-8") as f:
            for z in f:
                t = z.rstrip("\n").split("\t")
                if len(t) == 2:
                    m[t[1]].add(t[0])
        return m
    e = {l: eng(l) for l in LANGS}
    for (a, b) in PAARE:
        direkt = set()
        with open(os.path.join(T, f"links_{a}-{b}.tsv"), encoding="utf-8") as f:
            for z in f:
                t = z.rstrip("\n").split("\t")
                if len(t) == 2:
                    direkt.add((t[0], t[1]))
        ind = set()
        for en_id, as_ in e[a].items():
            bs = e[b].get(en_id)
            if not bs:
                continue
            for x in as_:
                for y in bs:
                    if (x, y) not in direkt:
                        ind.add((x, y))
        stat["indirekt"][f"{a}-{b}"] = {
            "paare_ueber_eng_zusaetzlich": len(ind),
            f"neue_{a}": len({x for x, _ in ind} - {x for x, _ in direkt}),
            f"neue_{b}": len({y for _, y in ind} - {y for _, y in direkt}),
        }

    with open(os.path.join(T, "stat.json"), "w", encoding="utf-8") as f:
        json.dump(stat, f, ensure_ascii=False, indent=1)
    print(json.dumps(stat, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
