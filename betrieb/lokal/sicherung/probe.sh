#!/bin/sh
# Monatliche Wiederherstellungsprobe: neueste Sicherung entschlüsseln und in eine Wegwerf-Datenbank einspielen.
# Erfolg heißt: Tabellen vorhanden und Inhalte zählbar. Der private Schlüssel liegt nur auf dem Server (Modus 600).
set -eu
neueste=$(ls -1t /daten/igmg-*.sql.gz.age 2>/dev/null | head -n 1 || true)
if [ -z "$neueste" ] || [ ! -f /schluessel/probe.key ]; then
  /bin/sh /sicherung/melden.sh probe fehler 0; echo "Keine Sicherung oder kein Schlüssel"; exit 0
fi
sha256sum -c "$neueste.sha256" >/dev/null
export PGDATA=/tmp/probe PGPORT=55432
rm -rf "$PGDATA"; mkdir -p "$PGDATA"; chown postgres "$PGDATA"
su postgres -c "initdb -D $PGDATA -A trust >/dev/null && pg_ctl -D $PGDATA -o '-p $PGPORT' -w start >/dev/null"
if age -d -i /schluessel/probe.key "$neueste" | gunzip | psql -q -h /var/run/postgresql -p $PGPORT -U postgres -d postgres >/dev/null 2>&1 \
  && [ "$(psql -tA -h /var/run/postgresql -p $PGPORT -U postgres -d postgres -c "select count(*) from information_schema.tables where table_schema='public'")" -gt 50 ]; then
  /bin/sh /sicherung/melden.sh probe ok "$(stat -c %s "$neueste")"; echo "Probe ok"
else
  /bin/sh /sicherung/melden.sh probe fehler 0; echo "Probe FEHLER" >&2
fi
su postgres -c "pg_ctl -D $PGDATA -w stop >/dev/null"; rm -rf "$PGDATA"
