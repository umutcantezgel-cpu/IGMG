#!/usr/bin/env python3
"""Reicht stdin unverändert an stdout weiter und schreibt am Ende
"<sha256>  <bytes>  <name>" in die Datei argv[1] (Name = argv[2])."""
import hashlib
import sys

h = hashlib.sha256()
n = 0
ein, aus = sys.stdin.buffer, sys.stdout.buffer
while True:
    block = ein.read(1 << 20)
    if not block:
        break
    h.update(block)
    n += len(block)
    try:
        aus.write(block)
    except BrokenPipeError:
        sys.exit("Abnehmer hat abgebrochen")
aus.flush()
with open(sys.argv[1], "a", encoding="utf-8") as f:
    f.write(f"{h.hexdigest()}  {n}  {sys.argv[2]}\n")
