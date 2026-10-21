# This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0. If a copy of the MPL was not
# distributed with this file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# Abgeleitet aus coqui-tts 0.27.5 (Idiap Research Institute / Coqui GmbH, MPL-2.0):
#   TTS/tts/utils/text/cleaners.py (multilingual_cleaners), punctuation.py (Punctuation), tokenizer.py (TTSTokenizer),
#   phonemizers/base.py (BasePhonemizer), phonemizers/gruut_wrapper.py (Gruut).
# Nachgebaut ohne Torch, damit die Erzeugung nur onnxruntime, gruut und numpy braucht. Gleichheit mit dem Original belegt
# die Probe `probe/gleichheit.json` (Token-Folgen aus dem Coqui-Tokenizer beim Export; `erzeuge.py --selbsttest`).
# Eigene Ergänzung: Aussprache-Überschreibungen je Wort (`phoneme`) an der Stelle, an der gruut die Wörter liefert.
import collections
import enum
import re
import unicodedata

import gruut
from gruut_ipa import IPA

_LEERRAUM = re.compile(r"\s+")
_GRUUT_TABELLE = str.maketrans("g", "ɡ")
_Punkt = collections.namedtuple("_Punkt", ["punc", "position"])


class _Lage(enum.Enum):
    ANFANG = 0
    ENDE = 1
    MITTE = 2


def reinige(text):
    """multilingual_cleaners: NFC, klein, Symbole ersetzen (; → ,  - → Leerzeichen  : → ,), Hilfszeichen weg, Leerraum."""
    text = unicodedata.normalize("NFC", text)
    text = text.lower()
    text = text.replace(";", ",").replace("-", " ").replace(":", ",")
    text = re.sub(r"[\<\>\(\)\[\]\"]+", "", text)
    return _LEERRAUM.sub(" ", text).strip()


class _Satzzeichen:
    """Punctuation: Satzzeichen abtrennen und nach der Phonemisierung wieder anfügen."""

    def __init__(self, zeichen):
        self.zeichen = "".join(dict.fromkeys(zeichen))
        self.muster = re.compile(rf"(\s*[{re.escape(self.zeichen)}]+\s*)+")

    def trenne(self, text):
        treffer = list(re.finditer(self.muster, text))
        if not treffer:
            return [text], []
        if len(treffer) == 1 and treffer[0].group() == text:
            return [], [_Punkt(text, _Lage.ANFANG)]
        puncs = []
        for t in treffer:
            lage = _Lage.MITTE
            if t == treffer[0] and text.startswith(t.group()):
                lage = _Lage.ANFANG
            elif t == treffer[-1] and text.endswith(t.group()):
                lage = _Lage.ENDE
            puncs.append(_Punkt(t.group(), lage))
        teile = []
        for i, p in enumerate(puncs):
            stuecke = text.split(p.punc)
            vorne, hinten = stuecke[0], p.punc.join(stuecke[1:])
            text = hinten
            if vorne == "":
                continue
            teile.append(vorne)
            if i == len(puncs) - 1 and len(hinten) > 0:
                teile.append(hinten)
        return teile, puncs

    @classmethod
    def setze(cls, text, puncs):
        if not puncs:
            return text
        if not text:
            return ["".join(p.punc for p in puncs)]
        p = puncs[0]
        if p.position == _Lage.ANFANG:
            return cls.setze([p.punc + text[0]] + text[1:], puncs[1:])
        if p.position == _Lage.ENDE:
            return [text[0] + p.punc] + cls.setze(text[1:], puncs[1:])
        if len(text) == 1:
            return cls.setze([text[0] + p.punc], puncs[1:])
        return cls.setze([text[0] + p.punc + text[1]] + text[2:], puncs[1:])


class Tokenizer:
    """Text → Token-IDs wie TTSTokenizer.text_to_ids der Stimme (Beschreibung aus export-onnx.py: tokenizer.json)."""

    def __init__(self, beschreibung):
        if beschreibung.get("format") != "igmg-lernapp-tts-tokenizer" or beschreibung.get("version") != 1:
            raise ValueError("tokenizer.json: Format unbekannt")
        if beschreibung["reiniger"] != "multilingual_cleaners":
            raise ValueError("nur multilingual_cleaners nachgebaut")
        ph = beschreibung["phonemisierer"]
        if ph["name"] != "gruut" or ph["espeak_phoneme"]:
            raise ValueError("nur gruut ohne espeak-Phoneme nachgebaut")
        if ph["gruut"] != gruut.__version__:
            raise ValueError(f"gruut {gruut.__version__} statt {ph['gruut']} (Gleichheit nur mit derselben Fassung belegt)")
        self.sprache = ph["sprache"]
        self.satzzeichen_behalten = ph["satzzeichen_behalten"]
        self.betonung_behalten = ph["betonung_behalten"]
        self.satzzeichen = _Satzzeichen(ph["satzzeichen"])
        z = beschreibung["zeichen"]
        self.vokabular = {c: i for i, c in enumerate(z["vokabular"])}
        self.blank_id = self.vokabular[z["blank"]]
        self.pad_id = self.vokabular[z["pad"]]
        self.leerzeichen_einfuegen = beschreibung["leerzeichen_einfuegen"]
        if beschreibung["bos_eos"]:
            raise ValueError("BOS/EOS nicht nachgebaut")
        self.nicht_gefunden = set()

    def _gruut(self, text, ueberschreibungen):
        woerter = []
        for satz in gruut.sentences(text, lang=self.sprache, espeak=False):
            for wort in satz:
                if wort.is_break:
                    if woerter:
                        woerter[-1].append(wort.text)
                    else:
                        woerter.append([wort.text])
                    continue
                eigen = ueberschreibungen.get(wort.text) if ueberschreibungen else None
                if eigen is not None:
                    woerter.append(list(eigen))
                    continue
                if not wort.phonemes:
                    continue
                phoneme = []
                for p in wort.phonemes:
                    if not self.betonung_behalten:
                        p = IPA.without_stress(p)
                    p = p.translate(_GRUUT_TABELLE)
                    if p:
                        phoneme.extend(p)
                if phoneme:
                    woerter.append(phoneme)
        return " ".join("".join(w) for w in woerter)

    def phoneme(self, text, ueberschreibungen=None):
        """Phonemfolge (Trenner ""), wie BasePhonemizer.phonemize nach dem Reiniger. `ueberschreibungen`: Wort
        (klein, wie gruut es liefert) → Phonemfolge."""
        text = reinige(text).strip()
        if self.satzzeichen_behalten:
            teile, puncs = self.satzzeichen.trenne(text)
        else:
            teile, puncs = [re.sub(self.satzzeichen.muster, " ", text).strip()], []
        ergebnis = [self._gruut(t, ueberschreibungen) for t in teile]
        if self.satzzeichen_behalten:
            return _Satzzeichen.setze(ergebnis, puncs)[0]
        return ergebnis[0]

    def ids_aus_phonemen(self, phoneme):
        ids = []
        for c in phoneme:
            i = self.vokabular.get(c)
            if i is None:
                self.nicht_gefunden.add(c)
                continue
            ids.append(i)
        if self.leerzeichen_einfuegen:
            mit = [self.blank_id] * (len(ids) * 2 + 1)
            mit[1::2] = ids
            ids = mit
        return ids

    def ids(self, text, ueberschreibungen=None):
        return self.ids_aus_phonemen(self.phoneme(text, ueberschreibungen))
