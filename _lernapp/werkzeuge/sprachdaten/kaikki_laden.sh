#!/usr/bin/env bash
# S7: kaikki.org-Dateien im Strom laden, hashen, kürzen. Kein Rohabzug auf der Platte.
set -uo pipefail
S=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/l0/S7
SK=$S/skripte; A=$S/auszug/kaikki; T=$S/tmp/kaikki; M=$S/dl/meta
SHA=$M/kaikki-upstream.sha256
K=https://kaikki.org/dictionary
lauf() { # name url art(plain|gz) sprachen uebers
  local n=$1 u=$2 art=$3 sp=$4 ue=$5
  curl -sS -I "$u" | grep -i -E '^(content-length|last-modified|etag)' > "$T/$n.hdr"
  if [ "$art" = gz ]; then
    curl -sS -f "$u" | python3 -I "$SK/hashtee.py" "$SHA" "$(basename $u)" | gzip -dc \
      | python3 -I "$SK/kaikki_reduzieren.py" "$(echo $n | cut -d- -f1)" "$sp" "$ue" "$T/$n.stat.json" 2> "$T/$n.log" \
      | gzip -6 > "$A/$n.jsonl.gz"
  else
    curl -sS -f --compressed "$u" | python3 -I "$SK/hashtee.py" "$SHA" "$(basename $u)" \
      | python3 -I "$SK/kaikki_reduzieren.py" "$(echo $n | cut -d- -f1)" "$sp" "$ue" "$T/$n.stat.json" 2> "$T/$n.log" \
      | gzip -6 > "$A/$n.jsonl.gz"
  fi
  echo "$n rc=${PIPESTATUS[*]} $(date -u +%H:%M:%S)" >> "$T/fertig.txt"
}
: > "$SHA"; : > "$T/fertig.txt"
lauf en-deu "$K/German/kaikki.org-dictionary-German.jsonl" plain de - &
lauf en-tur "$K/Turkish/kaikki.org-dictionary-Turkish.jsonl" plain tr - &
lauf en-ara "$K/Arabic/kaikki.org-dictionary-Arabic.jsonl" plain ar - &
lauf de-wikt "$K/downloads/de/de-extract.jsonl.gz" gz de,tr,ar tr,ar &
wait
lauf tr-wikt "$K/downloads/tr/tr-extract.jsonl.gz" gz tr,de,ar de,ar
echo ALLES >> "$T/fertig.txt"
