#!/usr/bin/env bash
# S7: Tatoeba-Wochenexport im Strom filtern. Kein Vollabzug wird gespeichert.
set -euo pipefail
S=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/l0/S7
SK=$S/skripte
A=$S/auszug/tatoeba
M=$S/dl/meta
T=$S/tmp/tatoeba
mkdir -p "$A" "$M" "$S/tmp/tatoeba"
B=https://downloads.tatoeba.org/exports
SHA=$M/tatoeba-upstream.sha256
: > "$SHA"
: > "$M/tatoeba-header.txt"

hole() { # url name -> stdout (roh, wie ausgeliefert)
  curl -sS -f -D "$S/tmp/tatoeba/hdr" "$1" | python3 -I "$SK/hashtee.py" "$SHA" "$2"
  { echo "== $2 $1"; grep -i -E '^(content-length|last-modified|etag)' "$S/tmp/tatoeba/hdr"; } >> "$M/tatoeba-header.txt"
}

# 1) direkte Paar-Links (Teilmengen je Sprachpaar, klein)
for p in deu/deu-tur deu/deu-ara tur/tur-ara; do
  n=$(basename $p)
  hole "$B/per_language/${p}_links.tsv.bz2" "${n}_links.tsv.bz2" | bzcat > "$T/links_${n}.tsv"
done
L="$T/links_deu-tur.tsv $T/links_deu-ara.tsv $T/links_tur-ara.tsv"

# 2) Sätze je Sprache, nur IDs aus den Paaren
for l in deu tur ara; do
  hole "$B/per_language/$l/${l}_sentences_detailed.tsv.bz2" "${l}_sentences_detailed.tsv.bz2" \
    | bzcat | python3 -I "$SK/tatoeba_filter.py" saetze $l $L > "$A/saetze_${l}.tsv"
done

# 3) CC0-Teilmenge (tur hat keine CC0-Datei: HTTP 404)
for l in deu ara; do
  hole "$B/per_language/$l/${l}_sentences_CC0.tsv.bz2" "${l}_sentences_CC0.tsv.bz2" \
    | bzcat | python3 -I "$SK/tatoeba_filter.py" ids $l $L > "$S/tmp/tatoeba/cc0_${l}.tsv"
done
curl -sS -o /dev/null -w "tur_sentences_CC0.tsv.bz2 HTTP %{http_code}\n" "$B/per_language/tur/tur_sentences_CC0.tsv.bz2" >> "$M/tatoeba-header.txt"

# 4) Tags je Sprache
for l in deu tur ara; do
  hole "$B/per_language/$l/${l}_tags.tsv.bz2" "${l}_tags.tsv.bz2" \
    | bzcat | python3 -I "$SK/tatoeba_filter.py" ids $l $L > "$S/tmp/tatoeba/tags_${l}.tsv"
done

# 5) Bewertungen (users_sentences.csv, unkomprimiert ~99 MB, nur im Strom)
hole "$B/users_sentences.csv" "users_sentences.csv" \
  | python3 -I "$SK/tatoeba_filter.py" bewert $L > "$S/tmp/tatoeba/bewertungen.tsv"

# 6) Nur Zählung: indirekte Paare über Englisch (Links je Sprache zu eng), nichts gespeichert außer IDs
for l in deu tur ara; do
  hole "$B/per_language/$l/${l}-eng_links.tsv.bz2" "${l}-eng_links.tsv.bz2" | bzcat > "$S/tmp/tatoeba/links_${l}-eng.tsv"
done
echo fertig
