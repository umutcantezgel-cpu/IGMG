# Sprachausgabe der Lern-App erzeugen (ADR 0039 Nr. 6, PLAN §6.8 Schritte 2–3, KERN 4.0 §4).
#
# Deutsch: Coqui-VITS Thorsten als eigener ONNX-Export (export-onnx.py) mit onnxruntime, 4 Prozesse × 1 Thread
# (Beleg S3: Echtzeitfaktor ≈ 0,33). Tokenizer nachgebaut ohne Torch (tokenizer.py, gleich dem Coqui-Tokenizer laut Probe).
# tr und ar haben keine freigegebene Stimme (L3-E10a): Die Liste aus `pnpm lernapp:audio-liste` ist dort leer.
#
# Aufrufe (Python immer mit -I, Pfade als Argumente; siehe LIESMICH.md):
#   python -I erzeuge.py erzeuge --liste <liste.jsonl> --modell <ordner> --aus <clipordner>
#                                [--aussprache <web/inhalte/lernapp/aussprache/de.json>] [--prozesse 4] [--nur <hashes.txt>]
#   python -I erzeuge.py selbsttest --modell <ordner> [--probe probe/gleichheit.json]
#
# Eingabe je Zeile (JSONL): {"textHash", "text", "stimme", "sprache", ...}; `stimme` muss zur geladenen Stimme passen
# (`tts:<name>@<sha16 des ONNX>`). Ausgabe: `<clipordner>/<textHash>.webm` und je Clip eine Zeile in
# `<clipordner>/erzeugung.jsonl` (Zeiten, Dauer, Lautheit, Hash der Token-Folge – ohne Texte). Die Synthese ist zufällig
# (VITS-Rauschen, onnxruntime setzt den Startwert je Sitzung): Eine Neuerzeugung ergibt eine andere Fassung; reproduzierbar
# ist die Kodierung (bitexact, mit denselben Versionen von ffmpeg und libopus – LIESMICH §2).
import argparse
import hashlib
import json
import multiprocessing
import os
import re
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np  # noqa: E402

import nachbearbeitung as nb  # noqa: E402
from tokenizer import Tokenizer  # noqa: E402

ONNX = "thorsten-vits.onnx"
TOKENIZER = "tokenizer.json"


def sha256_datei(pfad):
    h = hashlib.sha256()
    with open(pfad, "rb") as f:
        for teil in iter(lambda: f.read(1 << 20), b""):
            h.update(teil)
    return h.hexdigest()


def lade_beschreibung(modell):
    with open(os.path.join(modell, TOKENIZER), encoding="utf-8") as f:
        b = json.load(f)
    ist = sha256_datei(os.path.join(modell, b["onnx"]["datei"]))
    if ist != b["onnx"]["sha256"]:
        sys.exit(f"{b['onnx']['datei']}: SHA-256 {ist} weicht von tokenizer.json ab")
    return b


def stimme_von(b):
    """Kennung der Stimme im Manifest: tts:<name>@<erste 16 Hex-Zeichen des ONNX-SHA-256>."""
    return f"tts:{b['stimme']}@{b['onnx']['sha256'][:16]}"


def lade_aussprache(pfad, stimme):
    """Überschreibungen aus web/inhalte/lernapp/aussprache/<sprache>.json: `ersatz` (Text vor der Phonemisierung) und
    `phoneme` (ein Wort → Phonemfolge der Stimme). Einträge mit `stimmen` gelten nur für diese Stimmen."""
    if not pfad:
        return [], {}
    with open(pfad, encoding="utf-8") as f:
        d = json.load(f)
    if d.get("format") != "igmg-lernapp-aussprache" or d.get("version") != 1:
        sys.exit(f"{pfad}: Format unbekannt")
    ersatz, phoneme = [], {}
    for e in d["eintraege"]:
        if e.get("stimmen") and stimme not in e["stimmen"]:
            continue
        if e.get("phoneme"):
            if re.search(r"\s", e["text"]):
                sys.exit(f"{pfad}: Phoneme nur für einzelne Wörter ({e['text']!r})")
            # Schlüssel wie gruut das Wort liefert: klein, ß als ss (gruut 2.4.0 schreibt ß vor dem Nachschlagen um)
            phoneme[e["text"].lower().replace("ß", "ss")] = e["phoneme"]
        elif e.get("ersatz"):
            muster = (rf"(?<!\w){re.escape(e['text'])}(?!\w)" if e.get("ganzesWort", True) else re.escape(e["text"]))
            ersatz.append((len(e["text"]), re.compile(muster), e["ersatz"]))
    ersatz.sort(key=lambda x: -x[0])
    return [(m, r) for _, m, r in ersatz], phoneme


def wende_ersatz_an(text, ersatz):
    for muster, neu in ersatz:
        text = muster.sub(neu, text)
    return text


# ——— Arbeitsprozesse (je 1 Thread) ———

_P = {}


def _start(modell, aussprache, stimme):
    import onnxruntime as ort

    b = json.load(open(os.path.join(modell, TOKENIZER), encoding="utf-8"))
    so = ort.SessionOptions()
    so.intra_op_num_threads = 1
    so.inter_op_num_threads = 1
    _P["sitzung"] = ort.InferenceSession(os.path.join(modell, b["onnx"]["datei"]), so, providers=["CPUExecutionProvider"])
    _P["tok"] = Tokenizer(b)
    _P["rate"] = b["abtastrate"]
    _P["skalen"] = np.array(b["skalen"], dtype=np.float32)
    _P["ersatz"], _P["phoneme"] = lade_aussprache(aussprache, stimme)


def _clip(aufgabe):
    eintrag, aus = aufgabe
    tok, rate = _P["tok"], _P["rate"]
    vorher = set(tok.nicht_gefunden)
    text = wende_ersatz_an(eintrag["text"], _P["ersatz"])
    ids = np.array(tok.ids(text, _P["phoneme"]), dtype=np.int64)[None, :]
    a = time.perf_counter()
    roh = _P["sitzung"].run(["output"], {"input": ids, "input_lengths": np.array([ids.shape[1]], dtype=np.int64),
                                        "scales": _P["skalen"]})[0].reshape(-1)
    synth = time.perf_counter() - a
    gekuerzt = nb.kuerze(roh, rate)
    sig, lufs, verstaerkung = nb.normiere(gekuerzt, rate)
    ziel = os.path.join(aus, eintrag["textHash"] + ".webm")
    nb.opus(sig, rate, ziel + ".teil")
    os.replace(ziel + ".teil", ziel)
    return {
        "textHash": eintrag["textHash"],
        "stimme": eintrag["stimme"],
        # Eingabe der Synthese (Token-Folge nach Ersatz und Aussprache): audio-pruefen zählt Versuche nur bei gleicher Eingabe
        "eingabe": hashlib.sha256(ids.tobytes()).hexdigest()[:16],
        "synth_s": round(synth, 3),
        "gesamt_s": round(time.perf_counter() - a, 3),
        "dauer_roh_s": round(len(roh) / rate, 3),
        "dauer_s": round(len(gekuerzt) / rate, 3),
        "lufs_vorher": round(lufs, 2) if np.isfinite(lufs) else None,
        "verstaerkung_db": round(verstaerkung, 2),
        "bytes": os.path.getsize(ziel),
        "unbekannte_zeichen": sorted(set(tok.nicht_gefunden) - vorher),
    }


def erzeuge(args):
    b = lade_beschreibung(args.modell)
    stimme = stimme_von(b)
    eintraege = []
    with open(args.liste, encoding="utf-8") as f:
        for zeile in f:
            if zeile.strip():
                eintraege.append(json.loads(zeile))
    falsch = [e for e in eintraege if e.get("stimme") != stimme]
    if falsch:
        sys.exit(f"{len(falsch)} Einträge gehören nicht zur Stimme {stimme} (z. B. {falsch[0].get('stimme')})")
    if args.nur:
        nur = set(open(args.nur, encoding="utf-8").read().split())
        eintraege = [e for e in eintraege if e["textHash"] in nur]
    for e in eintraege:
        if not re.fullmatch(r"[0-9a-f]{64}", e["textHash"]) or e["textHash"] != hashlib.sha256(
                __import__("unicodedata").normalize("NFC", e["text"]).encode("utf-8")).hexdigest():
            sys.exit(f"textHash passt nicht zum Text: {e['textHash']}")
    # Überschreibungen nur mit Zeichen aus dem Vokabular der Stimme (sonst fielen sie still weg)
    vokabular = set(b["zeichen"]["vokabular"])
    _, phoneme = lade_aussprache(args.aussprache, stimme)
    fremde = sorted({c for p in phoneme.values() for c in p if c not in vokabular and c != " "})
    if fremde:
        sys.exit(f"Aussprache: Zeichen nicht im Vokabular der Stimme: {fremde}")
    os.makedirs(args.aus, exist_ok=True)
    # Längste zuerst: gleichmäßige Last auf den Prozessen
    eintraege.sort(key=lambda e: -len(e["text"]))
    w0 = time.perf_counter()
    cpu0 = os.times()
    erg = []
    protokoll = open(os.path.join(args.aus, "erzeugung.jsonl"), "a", encoding="utf-8")
    with multiprocessing.get_context("spawn").Pool(args.prozesse, initializer=_start,
                                                   initargs=(args.modell, args.aussprache, stimme)) as pool:
        for r in pool.imap_unordered(_clip, [(e, args.aus) for e in eintraege], chunksize=1):
            erg.append(r)
            protokoll.write(json.dumps(r, ensure_ascii=False) + "\n")
            protokoll.flush()
    protokoll.close()
    wand = time.perf_counter() - w0
    cpu1 = os.times()
    audio = sum(r["dauer_s"] for r in erg)
    roh = sum(r["dauer_roh_s"] for r in erg)
    zusammen = {
        "stimme": stimme,
        "clips": len(erg),
        "audio_s": round(audio, 2),
        "audio_roh_s": round(roh, 2),
        "wand_s": round(wand, 2),
        "rtf_effektiv": round(wand / audio, 3) if audio else None,
        "synth_s": round(sum(r["synth_s"] for r in erg), 2),
        "cpu_kinder_s": round((cpu1.children_user + cpu1.children_system) - (cpu0.children_user + cpu0.children_system), 2),
        "bytes": sum(r["bytes"] for r in erg),
        "unbekannte_zeichen": sorted({z for r in erg for z in r["unbekannte_zeichen"]}),
        "prozesse": args.prozesse,
        "last": open("/proc/loadavg").read().split()[:3],
    }
    print(json.dumps(zusammen, ensure_ascii=False))


def selbsttest(args):
    """Gleichheit des Tokenizers mit der Coqui-Probe und Eichung der Lautheitsmessung (BS.1770-4, Anhang 2)."""
    b = lade_beschreibung(args.modell)
    tok = Tokenizer(b)
    fehler = 0
    with open(args.probe, encoding="utf-8") as f:
        probe = json.load(f)
    abweichend = [p["text"] for p in probe if tok.ids(p["text"]) != p["ids"]]
    print(f"Tokenizer: {len(probe) - len(abweichend)} von {len(probe)} gleich")
    fehler += len(abweichend)
    # K-Filter bei 48 kHz = Koeffizienten der Norm
    regal, pass_ = nb.k_filter(48000)
    norm = ([1.53512485958697, -2.69169618940638, 1.19839281085285], [1.0, -1.69065929318241, 0.73248077421585],
            [1.0, -2.0, 1.0], [1.0, -1.99004745483398, 0.99007225036621])
    ist = (regal[0], regal[1], pass_[0], pass_[1])
    abw = max(abs(x - y) for n, i in zip(norm, ist) for x, y in zip(n, i))
    print(f"K-Filter 48 kHz: größte Abweichung {abw:.2e}")
    fehler += abw > 1e-8
    # 997-Hz-Sinus mit Spitze 0 dBFS → −3,01 LUFS (BS.1770-4); bei 48 kHz exakt, bei 22,05 kHz verschiebt die
    # bilineare Transformation den Frequenzgang um ≈ 0,03 dB
    for rate, toleranz in ((22050, 0.05), (48000, 0.005)):
        t = np.arange(int(5 * rate)) / rate
        l = nb.lautheit(np.sin(2 * np.pi * 997 * t), rate)
        print(f"Sinus 997 Hz bei {rate} Hz: {l:.3f} LUFS")
        fehler += abs(l + 3.01) > toleranz
    # Stille kürzen: 0,5 s Stille, 1 s Ton, 0,5 s Stille → 1 s + Ränder
    rate = 22050
    y = np.concatenate([np.zeros(rate // 2), 0.3 * np.sin(2 * np.pi * 440 * np.arange(rate) / rate), np.zeros(rate // 2)])
    k = nb.kuerze(y, rate)
    print(f"Kürzen: {len(y) / rate:.2f} s → {len(k) / rate:.2f} s")
    fehler += not (1.05 <= len(k) / rate <= 1.25)
    sys.exit(1 if fehler else 0)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="befehl", required=True)
    e = sub.add_parser("erzeuge")
    e.add_argument("--liste", required=True)
    e.add_argument("--modell", required=True)
    e.add_argument("--aus", required=True)
    e.add_argument("--aussprache")
    e.add_argument("--prozesse", type=int, default=4)
    e.add_argument("--nur")
    s = sub.add_parser("selbsttest")
    s.add_argument("--modell", required=True)
    s.add_argument("--probe", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "probe", "gleichheit.json"))
    args = p.parse_args()
    (erzeuge if args.befehl == "erzeuge" else selbsttest)(args)


if __name__ == "__main__":
    main()
