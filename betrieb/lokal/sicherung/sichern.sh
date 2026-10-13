#!/bin/sh
# Tägliche Sicherung: pg_dump (nur lesen) → gzip → age-verschlüsselt; Rotation nach SICHERUNG_TAGE (Standard 30).
set -eu
: "${SICHERUNG_DATABASE_URL:?fehlt}" "${AGE_EMPFAENGER:?fehlt}"
ziel="/daten/igmg-$(date +%Y%m%d-%H%M).sql.gz.age"
if pg_dump --no-owner --no-privileges "$SICHERUNG_DATABASE_URL" | gzip -9 | age -r "$AGE_EMPFAENGER" -o "$ziel.teil"; then
  mv "$ziel.teil" "$ziel"
  sha256sum "$ziel" > "$ziel.sha256"
  find /daten -name 'igmg-*.sql.gz.age*' -mtime +"${SICHERUNG_TAGE:-30}" -delete
  /bin/sh /sicherung/melden.sh sicherung ok "$(stat -c %s "$ziel")"
  echo "$(date -Iseconds) Sicherung ok: $ziel"
else
  rm -f "$ziel.teil"
  /bin/sh /sicherung/melden.sh sicherung fehler 0
  echo "$(date -Iseconds) Sicherung FEHLER" >&2
fi
