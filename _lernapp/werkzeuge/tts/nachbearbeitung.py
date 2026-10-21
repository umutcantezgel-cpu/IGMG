# Nachbearbeitung der Sprachausgabe (ADR 0039 Nr. 5 mit Fortschreibung S4/S5 Nr. 1, Beleg S3 §2.3):
#   1. Rand-Stille kürzen (wie librosa.effects.trim: RMS je Rahmen 2048/512, 40 dB unter dem lautesten Rahmen), 60 ms Rand
#   2. Lautheit nach EBU R128 / ITU-R BS.1770-4 auf −23 LUFS, Abtastspitze ≤ −1 dBFS
#   3. WebM/Opus 24 kbit/s VBR, mono, 48 kHz, -application voip, 20-ms-Rahmen, ohne Metadaten, bitexact (ffmpeg, lokal)
# Nur numpy und ffmpeg. Die Prüfkette misst unabhängig davon am kodierten Clip nach (web/scripts/lernapp/audio-pruefen.ts).
import io
import math
import subprocess
import wave

import numpy as np

ZIEL_LUFS = -23.0
SPITZE_DBFS = -1.0
RAND_S = 0.06
STILLE_DB = 40.0
RAHMEN = 2048
SCHRITT = 512
FFMPEG_OPUS = [
    "-map_metadata", "-1", "-fflags", "+bitexact", "-flags:a", "+bitexact",
    "-c:a", "libopus", "-b:a", "24k", "-vbr", "on", "-application", "voip", "-frame_duration", "20",
    "-ac", "1", "-ar", "48000", "-f", "webm",
]


def k_filter(rate):
    """K-Bewertung nach BS.1770-4 für beliebige Abtastraten (Herleitung wie libebur128): Hochregal, dann Hochpass."""
    f0, g, q = 1681.974450955533, 3.999843853973347, 0.7071752369554196
    k = math.tan(math.pi * f0 / rate)
    vh = 10.0 ** (g / 20.0)
    vb = vh ** 0.4996667741545416
    a0 = 1.0 + k / q + k * k
    regal = ([(vh + vb * k / q + k * k) / a0, 2.0 * (k * k - vh) / a0, (vh - vb * k / q + k * k) / a0],
             [1.0, 2.0 * (k * k - 1.0) / a0, (1.0 - k / q + k * k) / a0])
    f0, q = 38.13547087602444, 0.5003270373238773
    k = math.tan(math.pi * f0 / rate)
    a0 = 1.0 + k / q + k * k
    pass_ = ([1.0, -2.0, 1.0], [1.0, 2.0 * (k * k - 1.0) / a0, (1.0 - k / q + k * k) / a0])
    return regal, pass_


def _biquad(x, b, a):
    y = [0.0] * len(x)
    z1 = z2 = 0.0
    b0, b1, b2 = b
    _, a1, a2 = a
    for i, v in enumerate(x):
        o = b0 * v + z1
        z1 = b1 * v - a1 * o + z2
        z2 = b2 * v - a2 * o
        y[i] = o
    return y


_ANTWORT = {}


def _impulsantwort(rate, n=1 << 14):
    """Impulsantwort der K-Bewertung (einmal je Rate); gefiltert wird per FFT-Faltung (schnell, bis auf Rundung exakt)."""
    if rate not in _ANTWORT:
        regal, pass_ = k_filter(rate)
        imp = [0.0] * n
        imp[0] = 1.0
        _ANTWORT[rate] = np.asarray(_biquad(_biquad(imp, *regal), *pass_), dtype=np.float64)
    return _ANTWORT[rate]


def k_bewertet(y, rate):
    h = _impulsantwort(rate)
    n = len(y) + len(h) - 1
    m = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(y.astype(np.float64), m) * np.fft.rfft(h, m), m)[: len(y)]


def lautheit(y, rate):
    """Integrierte Lautheit (LUFS, ein Kanal) nach BS.1770-4: 400-ms-Blöcke, 75 % Überlappung, Gates −70 LUFS und −10 LU.
    Kürzer als 0,5 s: mit Stille auf 0,5 s aufgefüllt (wie Beleg S3). −inf bei Stille."""
    y = np.asarray(y, dtype=np.float64)
    if len(y) < int(0.5 * rate):
        y = np.pad(y, (0, int(0.5 * rate) - len(y)))
    k = k_bewertet(y, rate) ** 2
    block, schritt = int(round(0.4 * rate)), int(round(0.1 * rate))
    summe = np.concatenate([[0.0], np.cumsum(k)])
    starts = np.arange(0, len(k) - block + 1, schritt)
    z = (summe[starts + block] - summe[starts]) / block
    with np.errstate(divide="ignore"):
        l = -0.691 + 10 * np.log10(z)
    z = z[l > -70.0]
    if not len(z):
        return float("-inf")
    grenze = -0.691 + 10 * math.log10(z.mean()) - 10.0
    with np.errstate(divide="ignore"):
        z = z[-0.691 + 10 * np.log10(z) > grenze]
    return float(-0.691 + 10 * math.log10(z.mean()))


def nicht_still(y, rate=None, stille_db=STILLE_DB):
    """Erster und letzter Abtastwert außerhalb der Stille (Rahmen-RMS mehr als `stille_db` unter dem lautesten Rahmen)."""
    y = np.asarray(y, dtype=np.float64)
    if not len(y) or not np.any(y):
        return 0, 0
    p = np.pad(y, (RAHMEN // 2, RAHMEN // 2))
    n = 1 + (len(p) - RAHMEN) // SCHRITT
    idx = np.arange(RAHMEN)[None, :] + SCHRITT * np.arange(n)[:, None]
    mse = np.mean(p[idx] ** 2, axis=1)
    with np.errstate(divide="ignore"):
        db = 10 * np.log10(np.maximum(mse, 1e-20) / mse.max())
    an = np.flatnonzero(db > -stille_db)
    return int(an[0] * SCHRITT), int(min(len(y), (an[-1] + 1) * SCHRITT))


def kuerze(y, rate):
    a, e = nicht_still(y)
    rand = int(RAND_S * rate)
    return y[max(0, a - rand): min(len(y), e + rand)]


def normiere(y, rate):
    """Verstärkung auf −23 LUFS, höchstens bis Abtastspitze −1 dBFS. Gibt (Signal, LUFS vorher, Verstärkung dB) zurück."""
    vorher = lautheit(y, rate)
    g = 10 ** ((ZIEL_LUFS - vorher) / 20) if math.isfinite(vorher) else 1.0
    spitze = float(np.max(np.abs(y))) * g
    grenze = 10 ** (SPITZE_DBFS / 20)
    if spitze > grenze:
        g *= grenze / spitze
    return (y * g).astype(np.float32), vorher, 20 * math.log10(g)


def wav_bytes(y, rate):
    pcm = (np.clip(y, -1.0, 1.0) * 32767.0).round().astype("<i2")
    puffer = io.BytesIO()
    with wave.open(puffer, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(rate)
        w.writeframes(pcm.tobytes())
    return puffer.getvalue()


def opus(y, rate, ziel):
    """Signal als WebM/Opus nach `ziel` schreiben (über stdin, ohne Zwischendatei)."""
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "wav", "-i", "pipe:0", *FFMPEG_OPUS, ziel],
                   input=wav_bytes(y, rate), check=True)
