#!/usr/bin/env bash
# Endstand-Messung (Stufe C am endgültigen Stand): Dev 3200 stoppen (Speicher), 3500 aus REV bauen, Stufe-C-Schritte
# 1–3 und 5–11, bei ruhiger Last Schritt 12 (Lighthouse verschränkt) und INP-Paare, zuletzt die E2E-Suite (Port 3700,
# Postgres, Mailpit). Protokolle: _gemeinde/protokolle/C-* (Stufe C) und C-endstand.log (Ablauf).
# Aufruf: bash endstand.sh REV [--ab teil]   Teile: bau, c1, c2, ruhe, e2e · OHNE_RUHE=1 überspringt Lighthouse und INP
set -u
REV=${1:?REV}
AB=${3:-bau}
S=${SCRATCHPAD:-/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad}
W=/home/user/IGMG/_gemeinde/werkzeuge
P=/home/user/IGMG/_gemeinde/protokolle
LOG=$P/C-endstand.log
export PATH=$S/node24/bin:$PATH COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1
s() { echo "== $(date -u +%T) $* · Last $(cut -d' ' -f1 /proc/loadavg)" | tee -a "$LOG"; }
teile=(bau c1 c2 ruhe e2e)
start=0; for i in "${!teile[@]}"; do [ "${teile[$i]}" = "$AB" ] && start=$i; done
soll() { for i in "${!teile[@]}"; do [ "${teile[$i]}" = "$1" ] && [ "$i" -ge "$start" ] && return 0; done; return 1; }

s "ENDSTAND REV=$REV ab $AB"
if soll bau; then
  s "Dev 3200 stoppen (Speicher für Build und Messungen)"
  for p in $(ps -eo pid,args | grep -E "next dev -p 3200|next-server" | grep -v grep | awk '{print $1}'); do
    [ "$(readlink /proc/$p/cwd)" = /home/user/IGMG/web ] && kill "$p"
  done
  sleep 3
  s "3500 bauen"
  bash "$S/head/e4-bau.sh" "$REV"; grep -E "BAU_RC|health|ANMELDUNG_RC" "$S/head/e4-bau.log" | tee -a "$LOG"
  grep -q "^BAU_RC=0" "$S/head/e4-bau.log" || { s "ABBRUCH: Build rot"; exit 1; }
fi
if soll c1; then s "Stufe C 1–3"; bash "$W/stufe-c.sh" "$REV" --ab 1 --bis 3; fi
if soll c2; then s "Stufe C 5–11"; bash "$W/stufe-c.sh" "$REV" --ab 5 --bis 11; fi
if soll ruhe && [ "${OHNE_RUHE:-0}" != 1 ]; then
  s "warten auf ruhige Last (1-min < 1,5, höchstens 15 min)"
  for i in $(seq 1 90); do awk '{exit !($1 < 1.5)}' /proc/loadavg && break; sleep 10; done
  s "Stufe C 12 Lighthouse verschränkt (5 Runden)"
  LH_RUNDEN=5 bash "$W/stufe-c.sh" "$REV" --ab 12 --bis 12
  s "INP-Paare (3 Runden)"
  bash "$W/inp-paare.sh" 3 >> "$LOG" 2>&1
fi
if soll e2e; then
  s "E2E-Suite (Port 3700) gegen den Build im Worktree bau-head"
  ( cd "$S/e2e" && nohup ./mailpit --smtp 127.0.0.1:1025 --listen 127.0.0.1:8025 > "$S/e2e/mailpit.log" 2>&1 & echo $! > "$S/e2e/mailpit.pid" )
  sleep 2
  (
    . "$S/e2e/umgebung.sh"
    cd "$S/bau-head/web" || exit 1
    rm -rf test-results
    pnpm exec playwright test --reporter=list,json > "$S/e2e/endstand-vollauf.log" 2>&1
    echo "E2E_RC=$?" >> "$LOG"
    cp test-results/ergebnis.json "$S/e2e/endstand-ergebnis.json" 2>/dev/null
  )
  kill "$(cat "$S/e2e/mailpit.pid")" 2>/dev/null
  grep -E "passed|failed|skipped|flaky" "$S/e2e/endstand-vollauf.log" | tail -4 | tee -a "$LOG"
fi
s "ENDSTAND FERTIG"
