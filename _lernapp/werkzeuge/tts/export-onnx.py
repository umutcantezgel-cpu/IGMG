# Einmaliger ONNX-Export der deutschen Stimme (Coqui-VITS Thorsten, ADR 0045 Nr. 11 mit Fortschreibung S3 Nr. 1).
#
# Läuft NUR im Export-Venv (requirements-export.txt: coqui-tts 0.27.5, torch 2.6.0+cpu) und wird danach nicht mehr
# gebraucht – das Venv wird sofort gelöscht. Die Erzeugung (erzeuge.py) braucht nur onnxruntime, gruut und numpy.
#
# Aufruf (Python mit -I, Pfade als Argumente, siehe LIESMICH.md):
#   python -I export-onnx.py <modellordner> <ausgabeordner> [<probe.json>]
#     <modellordner>  model_file.pth und config.json aus Thorsten-Voice/VITS @ 54f782a (SHA-256 werden geprüft)
#     <ausgabeordner> erhält thorsten-vits.onnx, tokenizer.json und (mit Probe) gleichheit.json
#     <probe.json>    Liste neutraler Texte; ihre Token-Folgen aus dem Coqui-Tokenizer sind die Gleichheitsprobe für den
#                     nachgebauten Tokenizer in tokenizer.py (Prüfung: erzeuge.py --selbsttest)
#
# Herkunft und Lizenz: Gewichte Apache-2.0 (Thorsten Müller, trainiert mit Coqui TTS), Daten CC0 (Thorsten-Voice),
# Code coqui-tts MPL-2.0 (nur lokal). Siehe LIESMICH.md.
import hashlib
import inspect
import json
import os
import sys

# Erwartete Quelldateien (HF Thorsten-Voice/VITS, Commit 54f782a5e798cb4597fdac2e866ac8318143e0fb; bitgleich mit dem
# Coqui-Release v0.7.0_models, Beleg S3 §4)
ERWARTET = {
    "model_file.pth": "ebb3792e89e261c92857ad1977f726bbaadfdf00d1b857dce4c44c393043de66",
    "config.json": "f24e159768a8fc460764ccb163e37a08cd3c3d424bdb4f5a9e196636e58c0832",
}
ONNX_NAME = "thorsten-vits.onnx"


def sha256(pfad):
    h = hashlib.sha256()
    with open(pfad, "rb") as f:
        for teil in iter(lambda: f.read(1 << 20), b""):
            h.update(teil)
    return h.hexdigest()


def main():
    if len(sys.argv) < 3:
        sys.exit("Aufruf: python -I export-onnx.py <modellordner> <ausgabeordner> [<probe.json>]")
    modell, aus = sys.argv[1], sys.argv[2]
    probe = sys.argv[3] if len(sys.argv) > 3 else None
    for datei, soll in ERWARTET.items():
        ist = sha256(os.path.join(modell, datei))
        if ist != soll:
            sys.exit(f"{datei}: SHA-256 {ist} statt {soll}")
    os.makedirs(aus, exist_ok=True)

    import torch
    import TTS
    from TTS.tts.configs.vits_config import VitsConfig
    from TTS.tts.models.vits import Vits

    torch.set_num_threads(min(4, os.cpu_count() or 1))
    cfg = VitsConfig()
    cfg.load_json(os.path.join(modell, "config.json"))
    model = Vits.init_from_config(cfg)
    model.load_checkpoint(cfg, os.path.join(modell, "model_file.pth"), eval=True)

    onnx_pfad = os.path.join(aus, ONNX_NAME)
    if os.path.exists(onnx_pfad):
        os.unlink(onnx_pfad)
    model.export_onnx(output_path=onnx_pfad, verbose=False)

    tok = model.tokenizer
    zeichen = tok.characters
    ph = tok.phonemizer
    beschreibung = {
        "format": "igmg-lernapp-tts-tokenizer",
        "version": 1,
        "stimme": "coqui-vits-thorsten-onnx",
        "quelle": {
            "modell": "Thorsten-Voice/VITS@54f782a5e798cb4597fdac2e866ac8318143e0fb",
            "model_file.pth": ERWARTET["model_file.pth"],
            "config.json": ERWARTET["config.json"],
            "coqui-tts": TTS.__version__,
            "torch": torch.__version__,
        },
        "onnx": {"datei": ONNX_NAME, "sha256": sha256(onnx_pfad), "bytes": os.path.getsize(onnx_pfad)},
        "abtastrate": int(cfg.audio["sample_rate"]),
        "skalen": [
            float(cfg.model_args["inference_noise_scale"]),
            float(cfg.model_args["length_scale"]),
            float(cfg.model_args["inference_noise_scale_dp"]),
        ],
        "reiniger": cfg.text_cleaner,
        "phonemisierer": {
            "name": ph.name(),
            "sprache": ph.language,
            "satzzeichen_behalten": bool(ph._keep_puncs),
            "betonung_behalten": bool(getattr(ph, "keep_stress", False)),
            "espeak_phoneme": bool(getattr(ph, "use_espeak_phonemes", False)),
            "satzzeichen": ph._punctuator.puncs,
            "gruut": __import__("gruut").__version__,
        },
        "zeichen": {
            "vokabular": list(zeichen.vocab),
            "pad": zeichen.pad,
            "blank": zeichen.blank,
            "bos": zeichen.bos,
            "eos": zeichen.eos,
        },
        "leerzeichen_einfuegen": bool(tok.add_blank),
        "bos_eos": bool(tok.use_eos_bos),
    }
    with open(os.path.join(aus, "tokenizer.json"), "w", encoding="utf-8") as f:
        json.dump(beschreibung, f, ensure_ascii=False, indent=1)

    # Quelltexte der Tokenizer-Kette (MPL-2.0) als Vorlage für tokenizer.py – nur in den Arbeitsordner, nie ins Repository
    from TTS.tts.utils.text import cleaners, punctuation, tokenizer
    from TTS.tts.utils.text.phonemizers import base, gruut_wrapper

    with open(os.path.join(aus, "coqui-quellen.txt"), "w", encoding="utf-8") as f:
        for m in (cleaners, punctuation, base, gruut_wrapper, tokenizer):
            f.write(f"### {m.__name__}\n{inspect.getsource(m)}\n")

    if probe:
        with open(probe, encoding="utf-8") as f:
            texte = json.load(f)
        zeilen = [{"text": t, "phoneme": ph.phonemize(cleaners.__dict__[cfg.text_cleaner](t), separator=""),
                   "ids": tok.text_to_ids(t)} for t in texte]
        with open(os.path.join(aus, "gleichheit.json"), "w", encoding="utf-8") as f:
            json.dump(zeilen, f, ensure_ascii=False, indent=0)
    print(json.dumps({"onnx": beschreibung["onnx"], "probe": len(texte) if probe else 0}))


if __name__ == "__main__":
    main()
