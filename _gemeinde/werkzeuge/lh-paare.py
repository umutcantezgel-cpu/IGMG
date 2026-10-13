#!/usr/bin/env python3
"""Auswertung der verschränkten Lighthouse-Läufe (stufe-c.sh Schritt 12, Z-08).

Liest <ordner>/route-NN-3100-rK.json und route-NN-3500-rK.json (je ein Lauf von lighthouse.mjs) und schreibt
<basis>.json und <basis>.md: Median je Seite und Route, Spanne des Ausgangsstands (größter minus kleinster
Performance-Lauf auf 3100), Paarregel (Median 3500 ≥ Median 3100 − Spanne 3100), Budgets aus den Schwellen des Werkzeugs.
Aufruf: python3 lh-paare.py <ordner> <basis>
"""
import glob
import json
import os
import re
import statistics
import sys

ordner, basis = sys.argv[1], sys.argv[2]
WERTE = ['performance', 'accessibility', 'best-practices', 'seo', 'lcpMs', 'cls', 'tbtMs', 'jsKb']
daten = {}
schwellen = None
for datei in sorted(glob.glob(os.path.join(ordner, 'route-*-*-r*.json'))):
    m = re.search(r'route-(\d+)-(3100|3500)-r(\d+)\.json$', datei)
    if not m:
        continue
    nr, seite, runde = m.group(1), m.group(2), int(m.group(3))
    j = json.load(open(datei))
    schwellen = schwellen or j.get('schwellen')
    for r in j['routen']:
        eintrag = daten.setdefault(nr, {'pfad': r['pfad'], 'name': r.get('name'), '3100': [], '3500': []})
        for lauf in r['laeufe']:
            if lauf.get('performance') is None:
                continue
            eintrag[seite].append({'runde': runde, **{k: lauf.get(k) for k in WERTE}, 'simuliert': lauf.get('simuliert')})


def median(laeufe, k):
    werte = [l[k] for l in laeufe if l.get(k) is not None]
    return round(statistics.median(werte), 3) if werte else None


ergebnis = {'werkzeug': 'lh-paare', 'ordner': ordner, 'schwellen': schwellen, 'routen': []}
for nr in sorted(daten):
    e = daten[nr]
    zeile = {'nr': nr, 'pfad': e['pfad'], 'name': e['name'], 'laeufe3100': len(e['3100']), 'laeufe3500': len(e['3500'])}
    for seite in ('3100', '3500'):
        zeile['median' + seite] = {k: median(e[seite], k) for k in WERTE}
        perf = [l['performance'] for l in e[seite]]
        zeile['spanne' + seite] = [min(perf), max(perf)] if perf else None
        zeile['perfLaeufe' + seite] = [l['performance'] for l in sorted(e[seite], key=lambda l: l['runde'])]
        zeile['tbtLaeufe' + seite] = [l['tbtMs'] for l in sorted(e[seite], key=lambda l: l['runde'])]
    s = zeile['spanne3100']
    spanne = (s[1] - s[0]) if s else None
    m0, m1 = zeile['median3100']['performance'], zeile['median3500']['performance']
    zeile['paarregel'] = None if None in (m0, m1, spanne) else m1 >= m0 - spanne
    sw = schwellen or {}
    m = zeile['median3500']
    verfehlt = []
    if m['performance'] is not None and m['performance'] < sw.get('performance', 90):
        verfehlt.append('Performance')
    if m['accessibility'] is not None and m['accessibility'] < sw.get('accessibility', 100):
        verfehlt.append('A11y')
    if m['best-practices'] is not None and m['best-practices'] < sw.get('best-practices', 95):
        verfehlt.append('BP')
    if m['seo'] is not None and m['seo'] < sw.get('seo', 95):
        verfehlt.append('SEO')
    if m['lcpMs'] is not None and m['lcpMs'] > sw.get('lcpMs', 2500):
        verfehlt.append('LCP')
    if m['cls'] is not None and m['cls'] > sw.get('cls', 0.1):
        verfehlt.append('CLS')
    if m['tbtMs'] is not None and m['tbtMs'] > sw.get('tbtMs', 200):
        verfehlt.append('TBT')
    if m['jsKb'] is not None and m['jsKb'] > sw.get('jsKb', 180):
        verfehlt.append('JS')
    zeile['verfehlt3500'] = verfehlt
    ergebnis['routen'].append(zeile)

json.dump(ergebnis, open(basis + '.json', 'w'), ensure_ascii=False, indent=1)


def f(x):
    return '–' if x is None else (str(int(x)) if isinstance(x, (int, float)) and float(x).is_integer() else str(x))


zeilen = [
    f'# Lighthouse mobil verschränkt · {ordner}',
    '',
    'Je Runde ein Lauf je Route auf 3100 (Ausgangsstand) und direkt danach auf 3500 (Prüfling). Median aus allen Runden; '
    'Spanne = größter minus kleinster Performance-Lauf auf 3100; Paarregel: Median 3500 ≥ Median 3100 − Spanne 3100.',
    '',
    '| Route | Läufe | Perf 3100 | Perf 3500 | Δ | Spanne 3100 | Paarregel | TBT 3100 / 3500 (ms) | LCP 3100 / 3500 (ms) | CLS 3500 | JS 3100 / 3500 (kB gz) | A11y · BP · SEO 3500 | Budget verfehlt (3500) |',
    '|---|---|---|---|---|---|---|---|---|---|---|---|---|',
]
for z in ergebnis['routen']:
    a, b = z['median3100'], z['median3500']
    s = z['spanne3100']
    spanne = (s[1] - s[0]) if s else None
    delta = None if None in (a['performance'], b['performance']) else round(b['performance'] - a['performance'], 1)
    zeilen.append(
        f"| {z['pfad']} | {z['laeufe3100']}/{z['laeufe3500']} | {f(a['performance'])} | {f(b['performance'])} | {f(delta)} | {f(spanne)} | "
        f"{'erfüllt' if z['paarregel'] else ('verfehlt' if z['paarregel'] is False else '–')} | {f(a['tbtMs'])} / {f(b['tbtMs'])} | "
        f"{f(a['lcpMs'])} / {f(b['lcpMs'])} | {f(b['cls'])} | {f(a['jsKb'])} / {f(b['jsKb'])} | "
        f"{f(b['accessibility'])} · {f(b['best-practices'])} · {f(b['seo'])} | {', '.join(z['verfehlt3500']) or '–'} |"
    )
zeilen += ['', 'Einzelläufe Performance (Runde 1…n):', '']
for z in ergebnis['routen']:
    zeilen.append(f"- {z['pfad']}: 3100 {z['perfLaeufe3100']} · 3500 {z['perfLaeufe3500']} · TBT 3100 {z['tbtLaeufe3100']} · TBT 3500 {z['tbtLaeufe3500']}")
open(basis + '.md', 'w').write('\n'.join(zeilen) + '\n')
erfuellt = sum(1 for z in ergebnis['routen'] if z['paarregel'])
print(f"lh-paare: {len(ergebnis['routen'])} Routen, Paarregel erfüllt auf {erfuellt}; Protokoll {basis}.md")
