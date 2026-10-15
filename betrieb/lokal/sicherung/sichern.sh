#!/bin/sh
# Tägliche Sicherung: pg_dump (nur lesen) → gzip → age-verschlüsselt. Behalten werden die SICHERUNG_TAGE (Standard 30)
# neuesten gültigen Sicherungen.
# S3 (Sicherheitsprüfung): „ok“ nur, wenn JEDER Schritt der Kette gelingt (pg_dump, gzip, age – ohne `pipefail`, das
# nicht jede Shell kennt, über Statusdateien) und die Datei die Mindestgröße hat. Eine fehlgeschlagene Sicherung wird
# verworfen und nie mitgezählt: Die Rotation löscht nur, was über die Zahl der neuesten gültigen Sicherungen hinausgeht –
# eine Fehlerserie räumt die guten Sicherungen also nicht weg. Auffällig kleine Sicherungen (unter der Hälfte der
# vorigen) bleiben liegen, werden aber als Fehler gemeldet.
# Volatile Tabellen ohne Wert für eine Wiederherstellung (Sitzungen, Einmal-Links, Ratenzähler) nur als Struktur.
set -eu
: "${SICHERUNG_DATABASE_URL:?fehlt}" "${AGE_EMPFAENGER:?fehlt}"
ZIEL="${SICHERUNG_ZIEL:-/daten}"
MELDEN="${SICHERUNG_MELDEN:-/sicherung/melden.sh}"
MINDEST="${SICHERUNG_MINDESTGROESSE:-4096}"
BEHALTEN="${SICHERUNG_TAGE:-30}"
ziel="$ZIEL/igmg-$(date +%Y%m%d-%H%M).sql.gz.age"
status="$(mktemp -d)"
aufraeumen() { rm -rf "$status"; }
trap aufraeumen EXIT

fehler() {
  rm -f "$ziel.teil"
  /bin/sh "$MELDEN" sicherung fehler 0
  echo "$(date -Iseconds) Sicherung FEHLER: $1" >&2
  exit 0
}

vorige=$(ls -1t "$ZIEL"/igmg-*.sql.gz.age 2>/dev/null | head -n 1 || true)

{
  pg_dump --no-owner --no-privileges \
    --exclude-table-data=public.session --exclude-table-data=public.verification \
    --exclude-table-data=public.ratenbegrenzung --exclude-table-data=public.rate_limit \
    "$SICHERUNG_DATABASE_URL"
  echo $? >"$status/pg_dump"
} | {
  gzip -9
  echo $? >"$status/gzip"
} | age -r "$AGE_EMPFAENGER" -o "$ziel.teil" || fehler "age"

[ "$(cat "$status/pg_dump" 2>/dev/null || echo 1)" = 0 ] || fehler "pg_dump"
[ "$(cat "$status/gzip" 2>/dev/null || echo 1)" = 0 ] || fehler "gzip"
groesse=$(stat -c %s "$ziel.teil" 2>/dev/null || echo 0)
[ "$groesse" -ge "$MINDEST" ] || fehler "zu klein ($groesse Bytes)"
[ "$(head -c 21 "$ziel.teil")" = "age-encryption.org/v1" ] || fehler "kein age-Container"

mv "$ziel.teil" "$ziel"
sha256sum "$ziel" >"$ziel.sha256"

# Rotation: nur über die Zahl der neuesten gültigen Sicherungen hinaus (Fehlschläge legen keine Datei an)
ls -1t "$ZIEL"/igmg-*.sql.gz.age | tail -n +"$((BEHALTEN + 1))" | while read -r alt; do
  rm -f "$alt" "$alt.sha256"
done

if [ -n "$vorige" ] && [ -f "$vorige" ] && [ "$((groesse * 2))" -lt "$(stat -c %s "$vorige")" ]; then
  /bin/sh "$MELDEN" sicherung fehler "$groesse"
  echo "$(date -Iseconds) Sicherung AUFFÄLLIG: $ziel ist kleiner als die Hälfte der vorigen – bitte prüfen" >&2
  exit 0
fi
/bin/sh "$MELDEN" sicherung ok "$groesse"
echo "$(date -Iseconds) Sicherung ok: $ziel"
