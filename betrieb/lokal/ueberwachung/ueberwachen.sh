#!/bin/sh
# Ausfall-Meldung ohne Personendaten: nur „Website antwortet nicht“ bzw. „wieder erreichbar“.
set -u
fehler=0
gemeldet=0
mail() {
  printf 'To: %s\nFrom: %s\nSubject: %s\n\n%s\n' "$TECHNIK_MAIL" "$MAIL_ABSENDER" "$1" "$2" |
    msmtp --host="$SMTP_HOST" --port="${SMTP_PORT:-587}" --tls=on --auth=on --user="$SMTP_USER" --passwordeval='printf %s "$SMTP_PASS"' \
      --from="$MAIL_ABSENDER" "$TECHNIK_MAIL" || echo "$(date -Iseconds) Mail fehlgeschlagen"
}
while true; do
  if curl -fsS -m 20 "${APP_URL}/api/health" >/dev/null 2>&1; then
    [ "$gemeldet" = 1 ] && mail "IGMG Website wieder erreichbar" "Die Website antwortet seit $(date '+%d.%m.%Y %H:%M') wieder."
    fehler=0; gemeldet=0
  else
    fehler=$((fehler + 1))
    if [ "$fehler" -ge 3 ] && [ "$gemeldet" = 0 ]; then
      mail "IGMG Website antwortet nicht" "Seit etwa 15 Minuten antwortet ${APP_URL}/api/health nicht. Bitte Vercel-Status und Deployment prüfen (BETRIEB.md)."
      gemeldet=1
    fi
  fi
  sleep 300
done
