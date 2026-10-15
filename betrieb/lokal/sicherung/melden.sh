#!/bin/sh
# Meldung an das Cockpit: melden.sh <art> <ok|fehler> <bytes>
# Das Token geht über die Standardeingabe an curl, nie als Argument (sonst stünde es in der Prozessliste, S3)
printf 'Authorization: Bearer %s\n' "${WARTUNG_TOKEN}" | curl -fsS -m 20 -X POST -H @- -H 'content-type: application/json' \
  -d "{\"art\":\"$1\",\"ok\":$([ "$2" = ok ] && echo true || echo false),\"bytes\":${3:-0}}" \
  "${APP_URL}/api/wartung/lokal-meldung" >/dev/null 2>&1 || echo "$(date -Iseconds) Meldung ans Cockpit fehlgeschlagen"
