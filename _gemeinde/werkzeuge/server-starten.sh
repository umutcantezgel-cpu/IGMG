#!/usr/bin/env bash
# Startet den eingefrorenen Produktions-Server (Ausgangsstand E0) auf Port 3100 mit PGlite zur Laufzeit.
# Aufruf:  _gemeinde/werkzeuge/server-starten.sh [start|stop|status]
# Standard: start. Wartet bis zu 60 s auf /api/health und meldet dann PID und Adresse.
# Umgebung (optional):
#   SERVERORDNER  Ordner mit server.js (Standard: Scratchpad/basis-standalone, eingefroren aus .next/standalone)
#   LOKAL_ENV     Datei mit den Laufzeitwerten (Standard: Scratchpad/lokal.env, außerhalb des Repos, nie committen)
# Protokoll des Servers: Scratchpad/server.log. PID: Scratchpad/server.pid.
# Hinweis: Der Server läuft mit BAU_PGLITE=1 gegen die Kopie .pglite-bau im SERVERORDNER (keine Postgres-Datenbank).
set -euo pipefail

SCRATCHPAD_STANDARD=/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad
SCRATCHPAD="${SCRATCHPAD:-$SCRATCHPAD_STANDARD}"
ORDNER="${SERVERORDNER:-$SCRATCHPAD/basis-standalone}"
ENV_DATEI="${LOKAL_ENV:-$SCRATCHPAD/lokal.env}"
PID_DATEI="$SCRATCHPAD/server.pid"
LOG="$SCRATCHPAD/server.log"
PORT="$(grep -E '^PORT=' "$ENV_DATEI" | head -1 | cut -d= -f2)"
BASIS="http://127.0.0.1:${PORT}"

laeuft() {
  [ -f "$PID_DATEI" ] && kill -0 "$(cat "$PID_DATEI")" 2>/dev/null
}

gesund() {
  curl --noproxy '*' -fsS "$BASIS/api/health" >/dev/null 2>&1
}

start() {
  if laeuft; then
    echo "läuft bereits (PID $(cat "$PID_DATEI")) unter $BASIS"
    return 0
  fi
  if [ ! -f "$ORDNER/server.js" ]; then
    echo "server.js fehlt in $ORDNER" >&2
    return 1
  fi
  echo "== $(date -u +%FT%TZ) Start aus $ORDNER" >> "$LOG"
  (
    cd "$ORDNER"
    set -a
    # shellcheck disable=SC1090
    . "$ENV_DATEI"
    set +a
    exec node server.js >> "$LOG" 2>&1
  ) &
  echo $! > "$PID_DATEI"
  for _ in $(seq 1 60); do
    if gesund; then
      echo "bereit: $BASIS · PID $(cat "$PID_DATEI") · Protokoll $LOG"
      return 0
    fi
    if ! laeuft; then
      echo "Server beendet, bevor er antwortete. Siehe $LOG" >&2
      return 1
    fi
    sleep 1
  done
  echo "Server antwortet nach 60 s nicht auf /api/health. Siehe $LOG" >&2
  return 1
}

stop() {
  # Schutz des eingefrorenen Ausgangsstands (Port 3100): ohne eigenen SCRATCHPAD/SERVERORDNER nur mit ausdrücklicher Freigabe
  if [ "$ORDNER" = "$SCRATCHPAD_STANDARD/basis-standalone" ] && [ "${AUSGANGSSTAND_STOPPEN:-0}" != "1" ]; then
    echo "Verweigert: Das würde den eingefrorenen Ausgangsstand (3100) beenden. Eigenen SCRATCHPAD und SERVERORDNER setzen" >&2
    echo "oder bewusst AUSGANGSSTAND_STOPPEN=1 angeben." >&2
    return 1
  fi
  if laeuft; then
    local pid
    pid="$(cat "$PID_DATEI")"
    kill "$pid" 2>/dev/null || true
    for _ in $(seq 1 15); do kill -0 "$pid" 2>/dev/null || break; sleep 1; done
    kill -9 "$pid" 2>/dev/null || true
    echo "gestoppt: PID $pid"
  else
    echo "nicht gestartet"
  fi
  rm -f "$PID_DATEI"
}

status() {
  if laeuft && gesund; then
    echo "läuft: PID $(cat "$PID_DATEI") · $BASIS · /api/health ok"
  else
    echo "nicht bereit unter $BASIS"
    return 1
  fi
}

case "${1:-start}" in
  start) start ;;
  stop) stop ;;
  status) status ;;
  *) echo "Aufruf: $0 [start|stop|status]" >&2; exit 2 ;;
esac
