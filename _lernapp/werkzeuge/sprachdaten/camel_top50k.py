#!/usr/bin/env python3
"""L3-02 (Nachtrag zu S7): CAMeL Arabic Frequency Lists v1.0 (MSA) -> Top N als `rang, wort, anzahl` (TSV mit Kopfzeile).

Erzeugt web/daten/haeufigkeit/camel-msa-1.0_top50k.tsv (QUELLE.md: SHA-256 8ce2eb7c...). Die Liste im ZIP ist nach Anzahl
absteigend sortiert, ohne Kopfzeile (`wort<TAB>anzahl`); Top N sind also die ersten N Zeilen (geprueft: absteigend).

Aufruf (Python immer mit -I):
  python3 -I camel_top50k.py MSA_freq_lists.tsv.zip [N] > camel-msa-1.0_top50k.tsv   # ZIP-Datei, SHA-256 wird geprueft
  curl -sSL <ZIP-Adresse> | python3 -I camel_top50k.py - [N] > camel-msa-1.0_top50k.tsv
    # im Strom: liest nur den Anfang der ersten ZIP-Datei (lokaler Kopf, Deflate) und bricht nach N Zeilen ab; so werden
    # statt 69 MB nur wenige MB geladen. Die SHA-256 des ZIP ist dann nicht pruefbar, nur die der Ausgabe.
ZIP-Adresse: https://github.com/CAMeL-Lab/Camel_Arabic_Frequency_Lists/releases/download/v1.0/MSA_freq_lists.tsv.zip
Keine arabische Schrift in diesem Skript; Woerter werden als Bytes unveraendert durchgereicht.
"""
import hashlib
import struct
import sys
import zipfile
import zlib

ZIP_SHA256 = "99a6792501af8f1a8ed5209bfada961ae4fc076823e62b16883ef2e4c39b39a4"
DATEI = "MSA_freq_lists.tsv"


def zeilen_aus_zip(pfad):
    h = hashlib.sha256()
    with open(pfad, "rb") as f:
        for block in iter(lambda: f.read(1 << 20), b""):
            h.update(block)
    if h.hexdigest() != ZIP_SHA256:
        print(f"Warnung: SHA-256 des ZIP {h.hexdigest()} statt {ZIP_SHA256}", file=sys.stderr)
    with zipfile.ZipFile(pfad) as z, z.open(DATEI) as f:
        for zeile in f:
            yield zeile.rstrip(b"\r\n")


def zeilen_aus_strom(ein):
    kopf = ein.read(30)
    sig, _, flags, methode, _, _, _, _, _, nlen, xlen = struct.unpack("<IHHHHHIIIHH", kopf)
    if sig != 0x04034B50 or methode != 8:
        sys.exit("kein ZIP mit Deflate am Anfang des Stroms")
    name = ein.read(nlen).decode("utf-8")
    ein.read(xlen)
    if name != DATEI:
        sys.exit(f"erste Datei im ZIP ist {name}, erwartet {DATEI}")
    z = zlib.decompressobj(-15)
    rest = b""
    while True:
        block = ein.read(1 << 16)
        if not block:
            break
        rest += z.decompress(block)
        *fertig, rest = rest.split(b"\n")
        yield from (x.rstrip(b"\r") for x in fertig)
        if z.eof:
            break
    if rest:
        yield rest


def main():
    quelle = sys.argv[1]
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 50000
    zeilen = zeilen_aus_strom(sys.stdin.buffer) if quelle == "-" else zeilen_aus_zip(quelle)
    aus = sys.stdout.buffer
    aus.write(b"rang\twort\tanzahl\n")
    vorher = None
    for rang, zeile in enumerate(zeilen, start=1):
        if rang > n:
            break
        wort, anzahl = zeile.split(b"\t")
        zahl = int(anzahl)
        if vorher is not None and zahl > vorher:
            sys.exit(f"nicht absteigend sortiert bei Rang {rang}")
        vorher = zahl
        aus.write(b"%d\t%s\t%d\n" % (rang, wort, zahl))
    else:
        sys.exit(f"weniger als {n} Zeilen")
    aus.flush()


if __name__ == "__main__":
    main()
