#!/usr/bin/env python3
"""S7: Abdeckung der häufigsten Wörter (wordfreq, CAMeL, FrequencyWords) durch kaikki/Wiktionary.

Aufruf: python3 -I abdeckung.py <S7-Verzeichnis>  -> tmp/abdeckung.json (+ Ausgabe)
Normalisierung (auf beiden Seiten gleich):
  de: casefold (wordfreq faltet ß -> ss)
  tr: I -> ı, İ -> i, danach lower
  ar: NFC, ohne Harakat/Tatweel/Koranzeichen, Alif-Formen -> Alif, Alif maqsura -> Ya
Lemma = Eintrag ohne reine Formverweise (fo) mit mindestens einer Glosse.
"""
import gzip
import json
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict

S = sys.argv[1]
K = os.path.join(S, "auszug/kaikki")
H = os.path.join(S, "auszug/haeufigkeit")
WEG = set(range(0x0610, 0x061B)) | set(range(0x064B, 0x0660)) | {0x0670, 0x0640} | set(range(0x06D6, 0x06EE))
ALIF = {0x0622: 0x0627, 0x0623: 0x0627, 0x0625: 0x0627, 0x0671: 0x0627, 0x0649: 0x064A}
WORT = re.compile(r"^[^\W\d_]+(?:[-'’][^\W\d_]+)*$")


def norm(l, s):
    if l == "de":
        return s.casefold()
    if l == "tr":
        return s.replace("I", "ı").replace("İ", "i").lower()
    s = unicodedata.normalize("NFC", s)
    return "".join(chr(ALIF.get(ord(c), ord(c))) for c in s if ord(c) not in WEG)


# Präfixe für die heuristische Klitika-Abtrennung (ar), als Codepunkte
def cp(*xs):
    return "".join(chr(x) for x in xs)


WAW, FA, BA, LAM, KAF, ALEF = 0x0648, 0x0641, 0x0628, 0x0644, 0x0643, 0x0627
PRAEFIXE = sorted({cp(WAW, ALEF, LAM), cp(FA, ALEF, LAM), cp(BA, ALEF, LAM), cp(KAF, ALEF, LAM), cp(LAM, LAM),
                   cp(WAW, BA, ALEF, LAM), cp(WAW, LAM, LAM), cp(ALEF, LAM), cp(WAW), cp(FA), cp(BA), cp(LAM), cp(KAF),
                   cp(WAW, BA), cp(WAW, LAM), cp(FA, BA), cp(FA, LAM)}, key=len, reverse=True)
SUFFIXE = sorted({cp(0x0647), cp(0x0647, ALEF), cp(0x0647, 0x0645), cp(0x0647, 0x0645, ALEF), cp(0x0647, 0x0646),
                  cp(KAF), cp(KAF, 0x0645), cp(0x064A), cp(0x0646, ALEF)}, key=len, reverse=True)


def varianten_ar(t):
    v = set()
    for p in PRAEFIXE + [""]:
        if p and not (t.startswith(p) and len(t) - len(p) >= 2):
            continue
        r = t[len(p):]
        v.add(r)
        for s in SUFFIXE:
            if r.endswith(s) and len(r) - len(s) >= 2:
                v.add(r[: -len(s)])
                # ta marbuta vor Suffix: ...t + h -> ...a (0x062A -> 0x0629)
                if r[: -len(s)].endswith(chr(0x062A)):
                    v.add(r[: -len(s) - 1] + chr(0x0629))
    v.discard(t)
    return v


def lies_liste(pfad, spalte):
    out = []
    with open(pfad, encoding="utf-8") as f:
        for i, z in enumerate(f):
            t = z.rstrip("\n").split("\t" if pfad.endswith(".tsv") else " ")
            if pfad.endswith(".tsv") and i == 0:
                continue
            out.append(t[spalte])
    return out


LISTEN = {
    "de": {"wordfreq": lies_liste(f"{H}/wordfreq-3.1.1_de_top50k.tsv", 1),
           "FrequencyWords": lies_liste(f"{H}/frequencywords-2018_de_50k.txt", 0)},
    "tr": {"wordfreq": lies_liste(f"{H}/wordfreq-3.1.1_tr_top50k.tsv", 1),
           "FrequencyWords": lies_liste(f"{H}/frequencywords-2018_tr_50k.txt", 0)},
    "ar": {"wordfreq": lies_liste(f"{H}/wordfreq-3.1.1_ar_top50k.tsv", 1),
           "CAMeL-MSA": lies_liste(f"{H}/camel-msa-1.0_top50k.tsv", 1),
           "FrequencyWords": lies_liste(f"{H}/frequencywords-2018_ar_50k.txt", 0)},
}
# gesuchte Token (normalisiert) je Sprache, dazu Klitika-Varianten für ar
gesucht = {l: set() for l in LISTEN}
var_von = defaultdict(set)  # (l, variante) -> {token}
for l, ls in LISTEN.items():
    for name, woerter in ls.items():
        for w in woerter[:30000]:
            n = norm(l, w)
            gesucht[l].add(n)
            if l == "ar":
                for v in varianten_ar(n):
                    var_von[v].add(n)
gesucht_var = {v for v in var_von}

# token -> {(ausgabe, lemma_norm, art)} ; lemma -> Glossensprachen
tok_lemma = defaultdict(set)
lemma_gl = defaultdict(set)
rueck_gl = defaultdict(set)   # (sprache, wort) -> Glossensprachen aus fremden Übersetzungstabellen
rueck_tok = defaultdict(set)
lemma_zahl = Counter()
eintraege = Counter()
QSPR = {"en": "en", "de": "de", "tr": "tr"}
for datei in ("en-deu", "en-tur", "en-ara", "de-wikt", "tr-wikt"):
    with gzip.open(os.path.join(K, f"{datei}.jsonl.gz"), "rt", encoding="utf-8") as f:
        for z in f:
            r = json.loads(z)
            l, q = r["l"], r["q"]
            eintraege[(q, l, "alle")] += 1
            w = norm(l, r["w"])
            ist_form = "fo" in r
            if ist_form:
                ziele = {norm(l, x) for x in r["fo"]}
                eintraege[(q, l, "form")] += 1
            else:
                ziele = {w}
                if "gl" in r:
                    eintraege[(q, l, "lemma_mit_glosse")] += 1
                    lemma_zahl[(q, l, w)] += 0
                    lemma_gl[(l, w)].add(QSPR[q])
                for x in r.get("ue", []):
                    lemma_gl[(l, w)].add(x[0])
                    # Rückrichtung: Übersetzung Y (Sprache x[0]) bekommt eine Glosse in l
                    if x[0] in gesucht:
                        y = norm(x[0], x[1])
                        rueck_gl[(x[0], y)].add(l)
                        if y in gesucht[x[0]] or (x[0] == "ar" and y in gesucht_var):
                            rueck_tok[(x[0], y)].add(y)
                if r.get("g"):
                    eintraege[(q, l, "genus")] += 1
                if r.get("pl"):
                    eintraege[(q, l, "plural")] += 1
                if r.get("formen"):
                    eintraege[(q, l, "mit_formen")] += 1
            kand = {(w, "kopf")}
            for fm in r.get("formen", []):
                kand.add((norm(l, fm[0]), "form"))
            for s, art in kand:
                treffer = s in gesucht.get(l, ()) or (l == "ar" and s in gesucht_var)
                if not treffer:
                    continue
                for zl in ziele:
                    a = "kopf" if (art == "kopf" and not ist_form) else "form"
                    tok_lemma[(l, s)].add((q, zl, a))

lemmata = {}
for (q, l, w) in lemma_zahl:
    lemmata.setdefault((q, l), set()).add(w)


def bewerte(l, token):
    n = norm(l, token)
    e = tok_lemma.get((l, n), set())
    erg = {
        "lemma_en": any(q == "en" and a == "kopf" and "en" in lemma_gl.get((l, zl), ()) for q, zl, a in e),
        "lemma_oder_form_en": any(q == "en" for q, zl, a in e),
        "irgendeine_ausgabe": bool(e),
    }
    gls = set()
    for q, zl, a in e:
        gls |= lemma_gl.get((l, zl), set())
    for x in ("de", "tr", "en", "ar"):
        erg["glosse_" + x] = x in gls
    gr = set(gls)
    for q, zl, a in e:
        gr |= rueck_gl.get((l, zl), set())
    gr |= rueck_gl.get((l, n), set())
    for x in ("de", "tr", "ar"):
        if x != l:
            erg["glosse_" + x + "_inkl_rueck"] = x in gr
    if l == "ar":
        ev = set(e)
        for v in varianten_ar(n):
            ev |= tok_lemma.get((l, v), set())
        erg["irgendeine_ausgabe_mit_klitika"] = bool(ev)
        gv = set()
        for q, zl, a in ev:
            gv |= lemma_gl.get((l, zl), set())
        for x in ("de", "tr", "en"):
            erg["glosse_" + x + "_mit_klitika"] = x in gv
        gvr = set(gv)
        for q, zl, a in ev:
            gvr |= rueck_gl.get((l, zl), set())
        for v in varianten_ar(n) | {n}:
            gvr |= rueck_gl.get((l, v), set())
        for x in ("de", "tr"):
            erg["glosse_" + x + "_mit_klitika_inkl_rueck"] = x in gvr
    return erg


ergebnis = {"normalisierung": __doc__.split("Normalisierung")[1].split("Lemma =")[0].strip(), "listen": {}}
fehlend_beispiele = {}
for l, ls in LISTEN.items():
    for name, woerter in ls.items():
        wortartig = [w for w in woerter if WORT.match(w)]
        for N in (1000, 5000):
            top = wortartig[:N]
            z = Counter()
            for t in top:
                for k, v in bewerte(l, t).items():
                    z[k] += v
            ergebnis["listen"][f"{l}/{name}/top{N}"] = {
                "n": N,
                "ausgeschlossen_nicht_wortartig_bis_rang": sum(1 for w in woerter[: woerter.index(top[-1]) + 1] if not WORT.match(w)),
                **{k: round(100 * v / N, 1) for k, v in sorted(z.items())},
            }
            if name == "wordfreq" and N == 1000 and l != "ar":
                fehlend_beispiele[l] = [t for t in top if not bewerte(l, t)["irgendeine_ausgabe"]][:40]

ergebnis["lemmata"] = {f"{q}/{l}": len(ws) for (q, l), ws in sorted(lemmata.items())}
alle = defaultdict(set)
for (q, l), ws in lemmata.items():
    alle[l] |= ws
ergebnis["lemmata_vereinigt"] = {l: len(ws) for l, ws in alle.items()}
ergebnis["eintraege"] = {"/".join(k): v for k, v in sorted(eintraege.items()) if v}
gl_quellen = Counter()
for (l, w), gs in lemma_gl.items():
    for g in gs:
        gl_quellen[f"{l}->{g}"] += 1
ergebnis["lemmata_mit_glosse_in"] = dict(sorted(gl_quellen.items()))
rz = Counter()
for (l, w), gs in rueck_gl.items():
    for g in gs:
        rz[f"{l}<-{g}"] += 1
ergebnis["woerter_mit_rueckglosse"] = dict(sorted(rz.items()))
ergebnis["fehlend_top1000_wordfreq_beispiele"] = fehlend_beispiele
with open(os.path.join(S, "tmp/abdeckung.json"), "w", encoding="utf-8") as f:
    json.dump(ergebnis, f, ensure_ascii=False, indent=1)
print(json.dumps({k: v for k, v in ergebnis.items() if k != "fehlend_top1000_wordfreq_beispiele"}, ensure_ascii=False, indent=1))

# --- Bedarf: Lemma-Schlüssel, die von den Top-N-Wörtern erreicht werden (für den Repo-Auszug) ---
bedarf = {}
for N in (10000, 20000, 30000):
    for l, ls in LISTEN.items():
        keys = set()
        for name, woerter in ls.items():
            if name == "FrequencyWords":
                continue  # nur Gegenprobe
            for t in [w for w in woerter if WORT.match(w)][:N]:
                n = norm(l, t)
                e = set(tok_lemma.get((l, n), set()))
                if l == "ar":
                    for v in varianten_ar(n):
                        e |= tok_lemma.get((l, v), set())
                keys |= {zl for q, zl, a in e}
                if not e:
                    keys.add(n)  # ggf. nur über Übersetzungstabellen erreichbar
        bedarf[f"{l}/{N}"] = sorted(keys)
with open(os.path.join(S, "tmp/bedarf_lemmata.json"), "w", encoding="utf-8") as f:
    json.dump(bedarf, f, ensure_ascii=False)
print({k: len(v) for k, v in bedarf.items()}, file=sys.stderr)
