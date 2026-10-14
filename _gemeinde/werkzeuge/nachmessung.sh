#!/usr/bin/env bash
# Nachmessung nach dem Endstand (Neubau auf 3500): JS und Lighthouse /gebetszeiten (5 Läufe), INP verschränkt
# (3 Runden), Funktionsliste F-03 (Gebetszeiten), E2E-Teilsuite mit Menü und Gebetszeiten (Port 3700, Build im
# Worktree bau-head), Abschluss-Bildsatz der Hauptansichten mit 3 s Wartezeit (Jetzt-Marke des Tagesbogens).
# Aufruf: bash nachmessung.sh REV
set -u
REV=${1:?REV}
S=${SCRATCHPAD:-/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad}
W=/home/user/IGMG/_gemeinde/werkzeuge
P=/home/user/IGMG/_gemeinde/protokolle
LOG=$P/C3-nachmessung.log
export PATH=$S/node24/bin:$PATH COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1
s() { echo "== $(date -u +%T) $* · Last $(cut -d' ' -f1 /proc/loadavg)" | tee -a "$LOG"; }
ruhe() { for i in $(seq 1 60); do awk '{exit !($1 < 1.5)}' /proc/loadavg && break; sleep 10; done; }
s "NACHMESSUNG REV=$REV"
ruhe
s "Lighthouse /gebetszeiten (3500, 5 Läufe)"
echo '[{"name":"gebetszeiten","pfad":"/gebetszeiten"}]' > "$S/routen-gebetszeiten.json"
node "$W/lighthouse.mjs" --routen "$S/routen-gebetszeiten.json" --laeufe 5 --basis http://127.0.0.1:3500 --protokoll "$P/C3-lh-gebetszeiten" >> "$LOG" 2>&1; echo "   rc=$?" >> "$LOG"
ruhe
s "INP verschränkt (3 Runden)"
bash "$W/inp-paare.sh" 3 >> "$LOG" 2>&1
cp "$P/C-inp.md" "$P/C3-inp.md"
s "Funktionsliste F-03 (3500)"
node "$W/funktionsliste.mjs" --basis http://127.0.0.1:3500 --nur F-03 --protokoll "$P/C3-funktionsliste-f03" >> "$LOG" 2>&1; echo "   rc=$?" >> "$LOG"
s "Abschluss-Bildsatz Hauptansichten (--warte 3000)"
node "$W/bildsatz.mjs" --routen "$W/routen-hauptansichten.json" --aus "$S/bilder/abschluss-warte" --basis http://127.0.0.1:3500 --warte 3000 --protokoll "$P/C3-bildsatz-abschluss" >> "$LOG" 2>&1; echo "   rc=$?" >> "$LOG"
s "E2E-Teilsuite: Menü (datenschutz, veranstaltungen, suche) und Gebetszeiten"
( cd "$S/e2e" && nohup ./mailpit --smtp 127.0.0.1:1025 --listen 127.0.0.1:8025 > "$S/e2e/mailpit.log" 2>&1 & echo $! > "$S/e2e/mailpit.pid" )
sleep 2
(
  . "$S/e2e/umgebung.sh"
  cd "$S/bau-head/web" || exit 1
  pnpm exec playwright test --workers=1 tests/e2e/datenschutz.spec.ts tests/e2e/veranstaltungen.spec.ts tests/e2e/suche.spec.ts $(ls tests/e2e | grep -i gebetszeit | sed 's#^#tests/e2e/#') --reporter=list > "$S/e2e/nachmessung.log" 2>&1
  echo "   E2E_RC=$?" >> "$LOG"
)
kill "$(cat "$S/e2e/mailpit.pid")" 2>/dev/null
grep -E "passed|failed|flaky|skipped" "$S/e2e/nachmessung.log" | tail -4 | tee -a "$LOG"
s "NACHMESSUNG FERTIG"
