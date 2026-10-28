#!/bin/sh
# Minutentakt (ADR 0034, MN-18): Gebetserinnerungen jede Minute, Mail-Ausgang alle 5 Minuten, Löschfristen täglich 03:17,
# IGMG-Abgleich der Gebetszeiten täglich 21:07 (ADR 0048; nur wenn in der Verwaltung eingeschaltet).
# Fehler bleiben im Protokoll (docker compose logs takt); die Website arbeitet auch ohne diesen Takt weiter.
set -u
: "${APP_URL:?APP_URL fehlt}" "${WARTUNG_TOKEN:?WARTUNG_TOKEN fehlt}"
# Das Token geht über die Standardeingabe an curl, nie als Argument (sonst stünde es in der Prozessliste, S3)
rufe() {
  printf 'Authorization: Bearer %s\n' "${WARTUNG_TOKEN}" | curl -fsS -m 50 -X POST -H @- "${APP_URL}$1" >/dev/null 2>&1 \
    || echo "$(date -Iseconds) Fehler: $1"
}
while true; do
  rufe /api/wartung/takt
  minute=$(date +%M)
  case "$minute" in *0|*5) rufe /api/wartung/mail-ausgang ;; esac
  [ "$(date +%H:%M)" = "03:17" ] && rufe /api/wartung/loeschfristen
  [ "$(date +%H:%M)" = "21:07" ] && rufe '/api/wartung/gebetszeiten-abgleich?nurAktiv=1'
  sleep $((60 - $(date +%S)))
done
