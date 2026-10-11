"""Erzeugt die Titelschrift (M-4 Darstellungsprüfung, ADR 0014): Source Serif 4 variabel (Fontsource 5.3.0,
OFL 1.1) mit festem Gewicht 600 und erhaltener Achse „opsz“ (8–60) wie im Design (tokens/fonts.css).

SIL OFL 1.1, Bedingung 3: Abgeleitete Fassungen dürfen den reservierten Namen „Source“ nicht tragen – daher
heißt die Schrift intern „IGMG Wetzlar Titel“. Copyright- und Lizenzhinweise bleiben erhalten.

Aufruf (einmalig, Ergebnis wird versioniert): python3 scripts/schrift-titel.py   (benötigt fonttools + brotli)
"""
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

WURZEL = Path(__file__).resolve().parent.parent
QUELLE = WURZEL / 'node_modules/@fontsource-variable/source-serif-4/files'
ZIEL = WURZEL / 'src/fonts'

for teil in ('latin', 'latin-ext'):
    schrift = TTFont(QUELLE / f'source-serif-4-{teil}-opsz-normal.woff2')
    schrift = instancer.instantiateVariableFont(schrift, {'wght': 600})
    for eintrag in schrift['name'].names:
        if eintrag.nameID in (0, 7, 13, 14):  # Copyright, Marke, Lizenz bleiben unverändert
            continue
        text = str(eintrag)
        neu = text.replace('Source Serif 4', 'IGMG Wetzlar Titel').replace('SourceSerif4', 'IGMGWetzlarTitel').replace('Source', 'IGMG Wetzlar')
        if neu != text:
            eintrag.string = neu
    schrift.flavor = 'woff2'
    ausgabe = ZIEL / f'igmg-wetzlar-titel-{teil}-600-opsz.woff2'
    schrift.save(ausgabe)
    print(ausgabe.name, ausgabe.stat().st_size, 'Bytes')
