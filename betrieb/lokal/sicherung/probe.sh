#!/bin/sh
# Monatliche Wiederherstellungsprobe ohne privaten Schlüssel auf dem Server (DSFA D-08):
#  1. Die neueste verschlüsselte Sicherung ist unversehrt (Prüfsumme) und ein age-Container (Kopfzeile).
#  2. Ein frischer Abzug derselben Datenbank (pg_dump, nur lesen – wie die tägliche Sicherung) lässt sich in eine
#     Wegwerf-Datenbank einspielen; Erfolg heißt: Tabellen vorhanden. Danach wird alles gelöscht.
# Das Entschlüsseln prüft der Vorstand vierteljährlich mit seinem eigenen Schlüssel (LIESMICH, „Wiederherstellen“).
#  3. (S3) Die neueste Sicherung ist nicht leer: Mindestgröße und mindestens halb so groß wie die vorige – ein
#     abgebrochener Abzug fiele sonst erst beim Wiederherstellen auf.
set -eu
: "${SICHERUNG_DATABASE_URL:?fehlt}"
MINDEST="${SICHERUNG_MINDESTGROESSE:-4096}"
neueste=$(ls -1t /daten/igmg-*.sql.gz.age 2>/dev/null | head -n 1 || true)
vorige=$(ls -1t /daten/igmg-*.sql.gz.age 2>/dev/null | sed -n 2p || true)
if [ -z "$neueste" ] || ! sha256sum -c "$neueste.sha256" >/dev/null 2>&1 \
  || [ "$(head -c 21 "$neueste")" != "age-encryption.org/v1" ] \
  || [ "$(stat -c %s "$neueste")" -lt "$MINDEST" ] \
  || { [ -n "$vorige" ] && [ "$(($(stat -c %s "$neueste") * 2))" -lt "$(stat -c %s "$vorige")" ]; }; then
  /bin/sh /sicherung/melden.sh probe fehler 0; echo "Probe FEHLER: keine unversehrte, vollständige Sicherung" >&2; exit 0
fi
export PGDATA=/tmp/probe PGPORT=55432
rm -rf "$PGDATA"; mkdir -p "$PGDATA"; chown postgres "$PGDATA"
su postgres -c "initdb -D $PGDATA -A trust >/dev/null && pg_ctl -D $PGDATA -o '-p $PGPORT' -w start >/dev/null"
if pg_dump --no-owner --no-privileges "$SICHERUNG_DATABASE_URL" | psql -q -h /var/run/postgresql -p $PGPORT -U postgres -d postgres >/dev/null 2>&1 \
  && [ "$(psql -tA -h /var/run/postgresql -p $PGPORT -U postgres -d postgres -c "select count(*) from information_schema.tables where table_schema='public'")" -gt 50 ]; then
  /bin/sh /sicherung/melden.sh probe ok "$(stat -c %s "$neueste")"; echo "Probe ok"
else
  /bin/sh /sicherung/melden.sh probe fehler 0; echo "Probe FEHLER" >&2
fi
su postgres -c "pg_ctl -D $PGDATA -w stop >/dev/null"; rm -rf "$PGDATA"
