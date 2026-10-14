#!/usr/bin/env python3
"""Blindvergleich Z-04 vorbereiten: je Hauptansicht und Gerät (390, 1440) die ersten Bildschirme aus Vorher (E0) und
Nachher (Abschluss) nach A/B zufällig verteilt kopieren. Der Schlüssel liegt getrennt (nicht im Blindordner).

Aufruf: python3 blind-vorbereiten.py --vorher <bilder/e0> --nachher <bilder/abschluss> --aus <blindordner>
        --schluessel <datei.json> [--schirme 3] [--routen routen-hauptansichten.json]
"""
import argparse
import json
import os
import random
import shutil

p = argparse.ArgumentParser()
p.add_argument('--vorher', required=True)
p.add_argument('--nachher', required=True)
p.add_argument('--aus', required=True)
p.add_argument('--schluessel', required=True)
p.add_argument('--schirme', type=int, default=3)
p.add_argument('--routen', default=os.path.join(os.path.dirname(__file__), 'routen-hauptansichten.json'))
a = p.parse_args()

routen = json.load(open(a.routen))
zufall = random.SystemRandom()
schluessel = {}
if os.path.exists(a.aus):
    shutil.rmtree(a.aus)
for nr, r in enumerate(routen, start=1):
    name = r['pfad'].strip('/').replace('/', '_') or 'start'
    ansicht = f'ansicht-{nr:02d}'
    vorher_ist_a = zufall.random() < 0.5
    schluessel[ansicht] = {'name': r['name'], 'pfad': r['pfad'], 'A': 'vorher' if vorher_ist_a else 'nachher', 'B': 'nachher' if vorher_ist_a else 'vorher'}
    for geraet in ('390x844', '1440x900'):
        for seite, quelle in (('A', a.vorher if vorher_ist_a else a.nachher), ('B', a.nachher if vorher_ist_a else a.vorher)):
            ordner = os.path.join(quelle, name, geraet)
            bilder = sorted(f for f in os.listdir(ordner) if f.endswith('.jpg'))[: a.schirme] if os.path.isdir(ordner) else []
            ziel = os.path.join(a.aus, ansicht, geraet.split('x')[0], seite)
            os.makedirs(ziel, exist_ok=True)
            for f in bilder:
                shutil.copy(os.path.join(ordner, f), os.path.join(ziel, f))
json.dump(schluessel, open(a.schluessel, 'w'), ensure_ascii=False, indent=1)
print(f'{len(schluessel)} Ansichten nach {a.aus}; Schlüssel {a.schluessel}')
