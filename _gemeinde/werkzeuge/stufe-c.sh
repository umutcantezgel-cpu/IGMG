#!/usr/bin/env bash
# Stufe C (ABNAHME Z-01–Z-12): Endprüfung am Prüfling REV auf Server 127.0.0.1:3500 (Build über head/e4-bau.sh REV,
# Worktree $SCRATCHPAD/bau-head). Vorlage: E3-Tor-Lauf (tor-e3/skripte/lauf-e3tor.sh). Alle schweren Schritte nacheinander.
# Protokolle nach _werkstatt/protokolle/C-*, Bilder nach $SCRATCHPAD/bilder/stufe-c/, Prüfskripte in werkzeuge/ und werkzeuge/tor/.
# Aufruf: bash stufe-c.sh REV [--ab SCHRITT] [--bis SCHRITT]   (SCHRITT 1 bis 12; 12 = Lighthouse verschränkt, LH_RUNDEN)
# Sicherheit: nur lesende Abrufe und Formularprüfungen bis zur Serverprüfung (funktionsliste.mjs zählt POSTs);
# keine echten Sendungen, keine Geheimnisse in Protokollen (lokal.env wird nie ausgegeben).
set -u
REV=${1:?REV}
shift
AB=1; BIS=99
while [ $# -gt 0 ]; do case "$1" in --ab) AB=$2; shift 2;; --bis) BIS=$2; shift 2;; *) shift;; esac; done
S=${SCRATCHPAD:-/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad}
export PATH=$S/node24/bin:$PATH COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1 VERCEL_TELEMETRY_DISABLED=1
B=http://127.0.0.1:3500
B0=http://127.0.0.1:3100
P=/home/user/IGMG/_werkstatt/protokolle
W=/home/user/IGMG/_werkstatt/werkzeuge
K=$W/tor
R=$W/routen-stufe-c.json
RH=$W/routen-hauptansichten.json
RT=$W/routen-tr.json
RE=$W/routen-en.json
BI=$S/bilder/stufe-c
WT=$S/bau-head
LOG=$P/C-lauf.log
# Tageslicht für den Tagesbogen (B-06 zeichnet nachts keine Linie): feste Browser-Uhr am Nachmittag
UHR_TAG=2026-10-12T14:10:00+02:00
schritt() { echo "== $(date -u +%H:%M:%S) $*" | tee -a "$LOG"; }
rc() { echo "   rc=$1" | tee -a "$LOG"; }
soll() { [ "$AB" -le "$1" ] && [ "$BIS" -ge "$1" ]; }
mkdir -p "$BI"
schritt "STUFE C REV=$REV (Worktree $(git -C "$WT" log --oneline -1 2>/dev/null | cut -c1-60)) ab $AB bis $BIS"
[ "$(git -C "$WT" rev-parse --short HEAD)" = "$(git -C /home/user/IGMG rev-parse --short "$REV")" ] || { schritt "ABBRUCH: Worktree steht nicht auf $REV (erst head/e4-bau.sh $REV)"; exit 1; }
curl -s -o /dev/null --max-time 10 "$B/api/health" || { schritt "ABBRUCH: 3500 antwortet nicht"; exit 1; }

if soll 1; then
schritt "1a Bildsatz normal (25 Routen: 13 Haupt-/Zustandsansichten + 12 Stichprobe, 390/768/1440)"
node "$W/bildsatz.mjs" --routen "$R" --aus "$BI/bildsatz" --basis "$B" --protokoll "$P/C-bildsatz" > "$P/C-bildsatz.log" 2>&1; rc $?
schritt "1b Bildsatz reduziert (25 Routen)"
node "$W/bildsatz.mjs" --routen "$R" --aus "$BI/bildsatz-reduziert" --reduziert --basis "$B" --protokoll "$P/C-bildsatz-reduziert" > "$P/C-bildsatz-reduziert.log" 2>&1; rc $?
schritt "1c Bildsatz Türkisch vollständig (11 Hauptansichten)"
node "$W/bildsatz.mjs" --routen "$RT" --aus "$BI/bildsatz-tr" --basis "$B" --protokoll "$P/C-bildsatz-tr" > "$P/C-bildsatz-tr.log" 2>&1; rc $?
schritt "1d Bildsatz Englisch (3 Ansichten)"
node "$W/bildsatz.mjs" --routen "$RE" --aus "$BI/bildsatz-en" --basis "$B" --protokoll "$P/C-bildsatz-en" > "$P/C-bildsatz-en.log" 2>&1; rc $?
fi

if soll 2; then
for br in 390 1440; do
  schritt "2a axe WCAG 2.2 AA $br (25 Routen)"
  node "$W/a11y.mjs" --routen "$R" --breite $br --basis "$B" --protokoll "$P/C-a11y-$br" > "$P/C-a11y-$br.log" 2>&1; rc $?
  node "$K/axe-regeln3.mjs" --routen "$R" --breite $br --basis "$B" --protokoll "$P/C-axe-regeln-$br" > /dev/null 2> "$P/C-axe-regeln-$br.log"; rc "$? (Regeln)"
done
schritt "2b axe Türkisch 390 und Englisch 1440"
node "$K/axe-regeln3.mjs" --routen "$RT" --breite 390 --basis "$B" --protokoll "$P/C-axe-regeln-tr-390" > /dev/null 2> "$P/C-axe-regeln-tr-390.log"; rc $?
node "$K/axe-regeln3.mjs" --routen "$RE" --breite 1440 --basis "$B" --protokoll "$P/C-axe-regeln-en-1440" > /dev/null 2> "$P/C-axe-regeln-en-1440.log"; rc $?
schritt "2c Tastatur 390 (mit Hauptaufgaben) und 1440"
if [ -f "$W/tastatur.mjs" ]; then
  node "$W/tastatur.mjs" --routen "$RH" --breite 390 --aufgaben --basis "$B" --protokoll "$P/C-tastatur-390" > "$P/C-tastatur-390.log" 2>&1; rc $?
  node "$W/tastatur.mjs" --routen "$RH" --breite 1440 --basis "$B" --protokoll "$P/C-tastatur-1440" > "$P/C-tastatur-1440.log" 2>&1; rc $?
else echo "   tastatur.mjs fehlt" | tee -a "$LOG"; fi
schritt "2d Telefonmenü: Fokus im Kreis, Escape (F-18)"
node "$W/menue-fokus.mjs" --basis "$B" --pfad / --bilder "$BI/menue" > "$P/C-menue-fokus.json" 2> "$P/C-menue-fokus.log"; rc $?
fi

if soll 3; then
schritt "3 Konsole 390 (25 Routen + Türkisch + Englisch)"
BASIS="$B" node "$K/konsole3.mjs" --routen "$R" --basis "$B" --protokoll "$P/C-konsole" > /dev/null 2> "$P/C-konsole.log"; rc $?
BASIS="$B" node "$K/konsole3.mjs" --routen "$RT" --basis "$B" --protokoll "$P/C-konsole-tr" > /dev/null 2> "$P/C-konsole-tr.log"; rc $?
BASIS="$B" node "$K/konsole3.mjs" --routen "$RE" --basis "$B" --protokoll "$P/C-konsole-en" > /dev/null 2> "$P/C-konsole-en.log"; rc $?
schritt "3b Statuscodes: unbekannte Adressen 404, Hauptansichten 200, Gesundheit"
{ for u in /gibt-es-nicht /veranstaltungen/gibt-es-nicht /nachrichten/gibt-es-nicht /organisationen/gibt-es-nicht /quran/999 /tr/etkinlikler/gibt-es-nicht /api/health; do
    echo "$u $(curl -s -o /dev/null -w '%{http_code}' --max-time 60 "$B$u")"; done
  python3 -c "import json;[print(r['pfad']) for r in json.load(open('$R'))]" | while read u; do echo "$u $(curl -s -o /dev/null -w '%{http_code}' --max-time 60 "$B$u")"; done
} > "$P/C-statuscodes.txt" 2>&1; rc $?
fi

if soll 4; then
schritt "4 Lighthouse mobil, gepaart je Route: 3 Läufe Ausgangsstand 3100, dann 3 Läufe Prüfling 3500 (Z-08)"
mkdir -p "$S/stufe-c/lh"
python3 -c "
import json
r=json.load(open('$RH'))
for i,x in enumerate(r): json.dump([x], open('$S/stufe-c/lh/route-%02d.json'%i,'w'), ensure_ascii=False)
"
for f in "$S"/stufe-c/lh/route-*.json; do
  n=$(basename "$f" .json)
  echo "   $(date -u +%T) $n · Last $(cut -d' ' -f1 /proc/loadavg)" >> "$LOG"
  node "$W/lighthouse.mjs" --routen "$f" --laeufe 3 --basis "$B0" --protokoll "$S/stufe-c/lh/$n-3100" > /dev/null 2>> "$P/C-lighthouse.log"
  node "$W/lighthouse.mjs" --routen "$f" --laeufe 3 --basis "$B" --protokoll "$S/stufe-c/lh/$n-3500" > /dev/null 2>> "$P/C-lighthouse.log"
done
rc "fertig · Last $(cut -d' ' -f1 /proc/loadavg)"
fi

if soll 12; then
# Verschränkt (H-L01, Nachmessung): je Runde ein Lauf je Route auf 3100 und direkt danach auf 3500, LH_RUNDEN Runden
# (Standard 5). Lastschwankungen treffen so beide Seiten gleich. Auswertung: lh-paare.py (Median, Spanne, Paarregel).
RUNDEN=${LH_RUNDEN:-5}
schritt "12 Lighthouse mobil verschränkt: $RUNDEN Runden × 11 Routen × (3100, 3500), je 1 Lauf (Z-08)"
LV=$S/stufe-c/lh-v
mkdir -p "$LV"
python3 -c "
import json
r=json.load(open('$RH'))
for i,x in enumerate(r): json.dump([x], open('$LV/route-%02d.json'%i,'w'), ensure_ascii=False)
"
for runde in $(seq 1 "$RUNDEN"); do
  for f in "$LV"/route-??.json; do
    n=$(basename "$f" .json)
    echo "   $(date -u +%T) Runde $runde $n · Last $(cut -d' ' -f1 /proc/loadavg)" >> "$LOG"
    node "$W/lighthouse.mjs" --routen "$f" --laeufe 1 --basis "$B0" --protokoll "$LV/$n-3100-r$runde" > /dev/null 2>> "$P/C-lighthouse-v.log"
    node "$W/lighthouse.mjs" --routen "$f" --laeufe 1 --basis "$B" --protokoll "$LV/$n-3500-r$runde" > /dev/null 2>> "$P/C-lighthouse-v.log"
  done
done
python3 "$W/lh-paare.py" "$LV" "$P/C-lighthouse-v" >> "$LOG" 2>&1; rc "$? · Last $(cut -d' ' -f1 /proc/loadavg)"
fi

if soll 5; then
schritt "5a B-05 Seitenwechsel: vt-status /nachrichten, /veranstaltungen, / und drei Paare ohne Karte"
node "$W/vt-status.mjs" "$B" /nachrichten > "$P/C-vt-nachrichten.json" 2> "$P/C-vt-nachrichten.log"; rc $?
node "$W/vt-status.mjs" "$B" /veranstaltungen '[data-morph-karte^="v-"] a' > "$P/C-vt-veranstaltungen.json" 2> "$P/C-vt-veranstaltungen.log"; rc $?
node "$W/vt-status.mjs" "$B" / '[data-morph-karte^="n-"] a' > "$P/C-vt-start.json" 2> "$P/C-vt-start.log"; rc $?
node "$W/vt-probe2.mjs" "$B" '[["/","/veranstaltungen","klick"],["/veranstaltungen","/","klick"],["/impressum","/datenschutz","klick"]]' > "$P/C-vt-b05.json" 2> "$P/C-vt-b05.log"; rc $?
schritt "5b B-05 reduzierte Bewegung (keine Überblendung)"
BASIS="$B" node "$K/vt-reduziert3.mjs" > "$P/C-vt-reduziert.json" 2> "$P/C-vt-reduziert.log"; rc $?
schritt "5c B-05 Zeitlupe Nachricht und Veranstaltung (5 Bilder)"
BASIS="$B" OUT="$BI/seitenwechsel/nachricht" VON=/nachrichten SELEKTOR='a[href*="neue-gebetszeiten-fuer-den-winter"]' ZIEL=/nachrichten/neue-gebetszeiten-fuer-den-winter SCHRITT=700 PROTOKOLL="$P/C-vt-zeitlupe-nachricht" node "$K/vt-zeitlupe3.mjs" > "$P/C-vt-zeitlupe-nachricht.log" 2>&1; rc $?
BASIS="$B" OUT="$BI/seitenwechsel/veranstaltung" VON=/veranstaltungen SELEKTOR='a[href*="arabisch-sprachkurs"]' ZIEL=/veranstaltungen/arabisch-sprachkurs SCHRITT=700 PROTOKOLL="$P/C-vt-zeitlupe-veranstaltung" node "$K/vt-zeitlupe3.mjs" > "$P/C-vt-zeitlupe-veranstaltung.log" 2>&1; rc $?
fi

if soll 6; then
schritt "6a Momente B-06..B-09: Bilder (2 Läufe), Bildrate CPU 4× (3 Läufe), reduziert; B-06 bei Tageslicht ($UHR_TAG)"
for z in b06 b07 b08 b09; do
  u=""; [ "$z" = b06 ] && u="$UHR_TAG"
  UHR="$u" node "$K/momente4.mjs" --ziel "$z" --modus bilder --laeufe 2 --aus "$BI/momente" --basis "$B" --protokoll "$P/C-momente-$z" > /dev/null 2> "$P/C-momente-$z.log"; rc "$? ($z bilder)"
  UHR="$u" node "$K/momente4.mjs" --ziel "$z" --modus bildrate --laeufe 3 --basis "$B" --protokoll "$P/C-bildrate-$z" > /dev/null 2> "$P/C-bildrate-$z.log"; rc "$? ($z bildrate)"
  UHR="$u" node "$K/momente4.mjs" --ziel "$z" --modus reduziert --aus "$BI/momente" --basis "$B" --protokoll "$P/C-reduziert-$z" > /dev/null 2> "$P/C-reduziert-$z.log"; rc "$? ($z reduziert)"
done
schritt "6b bewegung: Start, Über uns, Projekte, Organisation (reduziert, Bildrate, Einzelbilder), Über uns/Projekte mit Scrollen"
for pfad in / /ueber-uns /projekte /organisationen/ana-teskilati; do
  name=$(echo "$pfad" | sed 's#^/##; s#/#_#g'); [ -z "$name" ] && name=start
  BILDORDNER="$BI/bewegung" node "$K/bewegung3.mjs" --route "$pfad" --dauer 2000 --basis "$B" --protokoll "$P/C-bewegung-$name" > "$P/C-bewegung-$name.log" 2>&1; rc "$? ($pfad)"
done
for pfad in /ueber-uns /projekte; do
  name=$(echo "$pfad" | sed 's#^/##; s#/#_#g')
  BILDORDNER="$BI/bewegung" node "$K/bewegung3.mjs" --route "$pfad" --dauer 2000 --scrollen --basis "$B" --protokoll "$P/C-bewegung-$name-scrollen" > "$P/C-bewegung-$name-scrollen.log" 2>&1; rc "$? ($pfad scrollen)"
done
schritt "6c B-10 Leiste: Wechsel 390/1440/aufgeklappt, reduziert, Erstladen"
node "$K/leiste3.mjs" --breite 390 --modus wechsel --aus "$BI/leiste/wechsel-390" --basis "$B" --protokoll "$P/C-leiste-390" > /dev/null 2> "$P/C-leiste-390.log"; rc $?
node "$K/leiste3.mjs" --breite 1440 --modus wechsel --aus "$BI/leiste/wechsel-1440" --basis "$B" --protokoll "$P/C-leiste-1440" > /dev/null 2> "$P/C-leiste-1440.log"; rc $?
node "$K/leiste3.mjs" --breite 390 --modus wechsel --aufgeklappt --aus "$BI/leiste/wechsel-390-aufgeklappt" --basis "$B" --protokoll "$P/C-leiste-390-aufgeklappt" > /dev/null 2> "$P/C-leiste-390-aufgeklappt.log"; rc $?
node "$K/leiste3.mjs" --breite 390 --modus reduziert --aus "$BI/leiste/reduziert" --basis "$B" --protokoll "$P/C-leiste-reduziert-390" > /dev/null 2> "$P/C-leiste-reduziert-390.log"; rc $?
node "$K/leiste-pruef3.mjs" --basis "$B" --modus erstladen --breite 390 --zeit 2026-10-12T12:09:50Z --aus "$BI/leiste/erstladen" > "$P/C-leiste-erstladen-390.json" 2> "$P/C-leiste-erstladen-390.log"; rc $?
fi

if soll 7; then
schritt "7a freie Werte: alle seit 9ebb4bc geänderten .ts/.tsx/.css unter web/src (Worktree $REV)"
git -C /home/user/IGMG diff --name-only --diff-filter=AMR 9ebb4bc "$REV" -- web/src | grep -E '\.(tsx?|css)$' | sed "s#^#$WT/#" > "$P/C-geaenderte-dateien.txt"
wc -l < "$P/C-geaenderte-dateien.txt" | tee -a "$LOG"
xargs -a "$P/C-geaenderte-dateien.txt" node "$W/freie-werte.mjs" --protokoll "$P/C-freie-werte" > "$P/C-freie-werte.log" 2>&1; rc $?
schritt "7b SVG-Prüfung (Worktree $REV)"
WURZEL="$WT" node "$K/svg3.mjs" --protokoll "$P/C-svg" > "$P/C-svg.log" 2>&1; rc $?
schritt "7c Wortlaut Rechts- und Einwilligungstexte 9ebb4bc gegen $REV (H-R01)"
node "$W/wortlaut.mjs" --basis 9ebb4bc --stand "$REV" --protokoll "$P/C-wortlaut" > "$P/C-wortlaut.log" 2>&1; rc $?
fi

if soll 8; then
schritt "8a pnpm release:check (typen, lint, unit, integration, sprachen, geheimnisse; startklar ohne DATABASE_URL übersprungen)"
(cd "$WT/web" && env -u DATABASE_URL pnpm release:check --protokoll "$P/C-release-check") > "$P/C-release-check.log" 2>&1; rc $?
schritt "8b pnpm startklar gegen Kopie der Prüflings-Datenbank: entwicklung und produktion (JSON, ohne Werte)"
rm -rf "$S/stufe-c/pglite-startklar" && mkdir -p "$S/stufe-c" && cp -a "$S/head/standalone/.pglite-bau" "$S/stufe-c/pglite-startklar"
(cd "$WT/web" && env -u DATABASE_URL pnpm -s startklar --json --betriebsart entwicklung --pglite "$S/stufe-c/pglite-startklar") > "$P/C-startklar-entwicklung.json" 2> "$P/C-startklar-entwicklung.log"; rc $?
(cd "$WT/web" && env -u DATABASE_URL pnpm -s startklar --json --betriebsart produktion --pglite "$S/stufe-c/pglite-startklar") > "$P/C-startklar-produktion.json" 2> "$P/C-startklar-produktion.log"; rc "$? (produktion: Fehler sind Menschen-Aufgaben, Abgleich MENSCHEN.md)"
fi

if soll 9; then
schritt "9 Funktionsliste F-01…F-24 gepaart: Ausgangsstand 3100, dann Prüfling 3500 (Verwaltung mit Anmeldestand)"
node "$W/funktionsliste.mjs" --basis "$B0" --protokoll "$P/C-funktionsliste-3100" --bilder "$BI/funktionsliste-3100" --hinweis "Stufe C, Ausgangsstand 9ebb4bc" > "$P/C-funktionsliste-3100.log" 2>&1; rc "$? (3100)"
node "$W/funktionsliste.mjs" --basis "$B" --protokoll "$P/C-funktionsliste-3500" --bilder "$BI/funktionsliste-3500" --zustand "$S/head/verwaltung-werkzeug/verwaltung-state.json" --hinweis "Stufe C, Prüfling $REV" > "$P/C-funktionsliste-3500.log" 2>&1; rc "$? (3500)"
fi

if soll 10; then
schritt "10 V-02: vercel build in Archivkopie von $REV, preview und production (ohne DB, wie das Projekt heute)"
KO=$S/stufe-c/kopie
rm -rf "${KO:?}" && mkdir -p "$KO" && git -C /home/user/IGMG archive "$REV" | tar -xf - -C "$KO"
(cd "$KO" && git init -q && mkdir -p .vercel && echo '{"projectId":"prj_sim","orgId":"team_sim","settings":{"framework":"services","nodeVersion":"24.x"}}' > .vercel/project.json)
(cd "$KO" && APP_URL=https://igmg-five.vercel.app PROXY_VERTRAUEN=1 "$S/vcli/node_modules/.bin/vercel" build --yes --non-interactive) > "$P/C-vercel-build-preview.log" 2>&1; rc "$? (preview)"
(cd "$KO" && APP_URL=https://igmg-five.vercel.app PROXY_VERTRAUEN=1 "$S/vcli/node_modules/.bin/vercel" build --prod --yes --non-interactive) > "$P/C-vercel-build-production.log" 2>&1; rc "$? (production)"
for f in symbol-512.png source-serif-4-latin-600-normal.woff atkinson-hyperlegible-next-latin-700-normal.woff; do
  n=$(grep -rl "$f" "$KO/web/.next/server/app" --include='*.nft.json' 2>/dev/null | grep -c opengraph-image)
  echo "   NFT $f in $n OG-Spuren" | tee -a "$LOG"
done
grep -E "cron|crons|regions|fra1" "$KO/.vercel/output/config.json" 2>/dev/null | head -5 >> "$LOG"
fi

if soll 11; then
schritt "11 Register-Abgleich: Animationen im CSS gegen KERN K-007 (B-01…B-12)"
grep -oE "@keyframes [a-z-]+" "$WT/web/src/app/globals.css" | sort -u > "$P/C-keyframes.txt"
grep -rhoE "animate-\[?[a-z-]+" "$WT/web/src" --include=*.tsx | sort | uniq -c | sort -rn > "$P/C-animate-klassen.txt"
wc -l "$P/C-keyframes.txt" "$P/C-animate-klassen.txt" | tee -a "$LOG"
fi

schritt "STUFE C FERTIG (ab $AB bis $BIS)"
