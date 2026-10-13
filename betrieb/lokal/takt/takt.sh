#!/bin/sh
# Minutentakt (ADR 0034, MN-18): Gebetserinnerungen jede Minute, Mail-Ausgang alle 5 Minuten, Löschfristen täglich 03:17.
# Fehler bleiben im Protokoll (docker compose logs takt); die Website arbeitet auch ohne diesen Takt weiter.
set -u
: "${APP_URL:?APP_URL fehlt}" "${WARTUNG_TOKEN:?WARTUNG_TOKEN fehlt}"
rufe() {
  curl -fsS -m 50 -X POST -H "Authorization: Bearer ${WARTUNG_TOKEN}" "${APP_URL}$1" >/dev/null 2>&1 || echo "$(date -Iseconds) Fehler: $1"
}
while true; do
  rufe /api/wartung/takt
  minute=$(date +%M)
  case "$minute" in *0|*5) rufe /api/wartung/mail-ausgang ;; esac
  [ "$(date +%H:%M)" = "03:17" ] && rufe /api/wartung/loeschfristen
  sleep $((60 - $(date +%S)))
done
