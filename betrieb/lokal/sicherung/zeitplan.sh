#!/bin/sh
# Täglich 02:43 Sicherung, am 1. des Monats 04:13 Wiederherstellungsprobe. Ergebnis geht ans Startklar-Cockpit.
set -u
while true; do
  jetzt=$(date +%H:%M)
  [ "$jetzt" = "02:43" ] && /bin/sh /sicherung/sichern.sh
  [ "$jetzt" = "04:13" ] && [ "$(date +%d)" = "01" ] && /bin/sh /sicherung/probe.sh
  sleep $((60 - $(date +%S)))
done
