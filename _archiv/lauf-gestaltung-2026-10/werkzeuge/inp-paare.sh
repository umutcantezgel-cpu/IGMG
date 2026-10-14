#!/usr/bin/env bash
# Reaktion auf Eingaben (INP, Labor) verschränkt: je Runde alle Hauptansichten auf 3100 (Ausgangsstand), dann 3500
# (Prüfling), je 1 Lauf; RUNDEN Runden (Standard 3). Ergebnis: protokolle/C-inp-3100-rN.* und C-inp-3500-rN.*,
# Zusammenfassung über inp-auswertung (Median je Route und Server). Aufruf: bash inp-paare.sh [RUNDEN]
set -u
S=${SCRATCHPAD:-/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad}
export PATH=$S/node24/bin:$PATH
W=/home/user/IGMG/_werkstatt/werkzeuge
P=/home/user/IGMG/_werkstatt/protokolle
RUNDEN=${1:-3}
for r in $(seq 1 "$RUNDEN"); do
  for port in 3100 3500; do
    echo "$(date -u +%T) Runde $r · $port · Last $(cut -d' ' -f1 /proc/loadavg)"
    node "$W/inp.mjs" --routen "$W/routen-hauptansichten.json" --basis "http://127.0.0.1:$port" --laeufe 1 --protokoll "$P/C-inp-$port-r$r" > /dev/null 2>> "$P/C-inp.log"
  done
done
python3 - "$P" "$RUNDEN" <<'PY'
import json, statistics, sys
p, runden = sys.argv[1], int(sys.argv[2])
daten = {}
for port in ('3100', '3500'):
    for r in range(1, runden + 1):
        try:
            j = json.load(open(f'{p}/C-inp-{port}-r{r}.json'))
        except FileNotFoundError:
            continue
        for route in j['routen']:
            d = daten.setdefault(route['pfad'], {'3100': [], '3500': [], 'eingaben': {}})
            for lauf in route['laeufe']:
                if lauf['inpMs'] is not None:
                    d[port].append(lauf['inpMs'])
                if port == '3500':
                    for k, v in lauf.get('jeEingabeMs', {}).items():
                        d['eingaben'].setdefault(k, []).append(v)
med = lambda w: round(statistics.median(w)) if w else None
zeilen = ['# Reaktion auf Eingaben (INP, Labor) verschränkt · 3100 gegen 3500', '',
          'Telefon 390×844, CPU 4×; je Runde ein Lauf je Route und Server; Median über die Runden. Schwelle 200 ms.', '',
          '| Route | INP 3100 (ms) | INP 3500 (ms) | Läufe 3100 | Läufe 3500 | 3500 ≤ 200 | längste Eingabe 3500 (Median ms) |', '|---|---|---|---|---|---|---|']
ok = 0
for pfad, d in daten.items():
    m0, m1 = med(d['3100']), med(d['3500'])
    ok += 1 if m1 is not None and m1 <= 200 else 0
    eing = ', '.join(f'{k} {med(v)}' for k, v in sorted(d['eingaben'].items(), key=lambda kv: -med(kv[1]))[:2])
    zeilen.append(f"| {pfad} | {m0} | {m1} | {d['3100']} | {d['3500']} | {'ja' if m1 is not None and m1 <= 200 else 'nein'} | {eing} |")
zeilen += ['', f'3500 ≤ 200 ms auf {ok} von {len(daten)} Routen.']
open(f'{p}/C-inp.md', 'w').write('\n'.join(zeilen) + '\n')
json.dump(daten, open(f'{p}/C-inp.json', 'w'), ensure_ascii=False, indent=1)
print('\n'.join(zeilen))
PY
