#!/usr/bin/env bash
# Abschlussbilder für Galerie und Blindvergleich aus dem Stufe-C-Bildsatz übernehmen (Hauptansichten 390/768/1440,
# Momente B-06…B-09 Lauf 1 und reduziert, Seitenwechsel Nachricht). Danach galerie.mjs ausführen.
# Aufruf: bash abschluss-kopieren.sh
set -u
S=${SCRATCHPAD:-/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad}
Q=$S/bilder/stufe-c
Z=/home/user/IGMG/_werkstatt/bilder/abschluss
W=/home/user/IGMG/_werkstatt/werkzeuge
for name in $(python3 -c "
import json
for r in json.load(open('$W/routen-hauptansichten.json')):
    print(r['pfad'].strip('/').replace('/', '_') or 'start')
"); do
  [ -d "$Q/bildsatz/$name" ] || { echo "fehlt: $Q/bildsatz/$name"; continue; }
  rm -rf "${Z:?}/${name:?}"
  cp -a "$Q/bildsatz/$name" "$Z/$name"
  echo "Ansicht $name: $(find "$Z/$name" -name '*.jpg' | wc -l) Bilder"
done
for m in b06 b07 b08 b09; do
  rm -rf "${Z:?}/momente/${m:?}"
  mkdir -p "$Z/momente/$m"
  cp "$Q/momente/$m"-l1-*.jpg "$Z/momente/$m/" 2>/dev/null
  cp "$Q/momente/$m"-reduziert.jpg "$Z/momente/$m/" 2>/dev/null
  echo "Moment $m: $(ls "$Z/momente/$m" | wc -l) Bilder"
done
if [ -d "$Q/seitenwechsel/nachricht" ]; then
  rm -rf "${Z:?}/seitenwechsel/nachricht"
  mkdir -p "$Z/seitenwechsel"
  cp -a "$Q/seitenwechsel/nachricht" "$Z/seitenwechsel/nachricht"
  echo "Seitenwechsel: $(ls "$Z/seitenwechsel/nachricht" | wc -l) Bilder"
fi
