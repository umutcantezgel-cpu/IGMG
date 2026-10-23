#!/bin/bash
# Messlauf der Lern-App (L8-02): EIN Produktionsbau mit allen Schaltern der Lern-App, Testkurs und Seeds wie in der
# Lern-App-E2E (scripts/e2e-datenbank.mjs, eigene Wegwerf-Datenbank), Server auf eigenem Port, alle Messungen, Server per
# gemerkter PID beenden, .next und .env löschen – alles unter EINEM Schloss (gemeinsames bau.lock), damit nie zwei .next
# gleichzeitig existieren und der Lauf wiederholbar ist.
#
# Aufruf (im Arbeitsbaum): bash _lernapp/werkzeuge/leistung/messlauf.sh [teile …]
#   teile: budget messen lighthouse inp axe whisper last (Standard: alle in dieser Reihenfolge)
#   MESS_FILTER=<regulärer Ausdruck>: nur Routen, deren Pfad passt (Lighthouse und axe; Nachmessung nach einer Behebung)
#   MESS_ZIEL=<ordner>: Ausgabe (Standard $TMPDIR/leistung); dort lauf.log mit `uptime` je Schritt
# Voraussetzungen: PostgreSQL (127.0.0.1:5432, Rolle igmg) und Mailpit laufen; .env-Vorlage eines Arbeitsbaums (MESS_ENV).
# Ergebnisse: <ziel>/{budget,messen,lighthouse,inp,a11y,whisper-netz,lasttest}.{md,json}; Rohdaten bleiben außerhalb des Repos.
set -u
S=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad
HIER=$(cd "$(dirname "$0")" && pwd)
W=$(cd "$HIER/../../../web" && pwd)
export PATH=$S/node24/bin:$HOME/.local/bin:$PATH NEXT_TELEMETRY_DISABLED=1
export E2E_PORT=${E2E_PORT:-3224}
export E2E_DATABASE_URL=${E2E_DATABASE_URL:-postgres://igmg:igmg-lokal@127.0.0.1:5432/igmg_lernapp_d_e2e}
export TMPDIR=${TMPDIR:-$S/tmp-l8d}
export PLAYWRIGHT_BROWSERS_PATH=${PLAYWRIGHT_BROWSERS_PATH:-$S/e2e-echt/pw-browsers}
export MESS_ZIEL=${MESS_ZIEL:-$TMPDIR/leistung}
export MESS_BASIS=http://localhost:$E2E_PORT
MESS_ENV=${MESS_ENV:-/home/user/IGMG/.claude/worktrees/agent-a360d92e270ea9f2f/web/.env}
mkdir -p "$TMPDIR" "$MESS_ZIEL"

# Unter das gemeinsame Schloss: das Skript startet sich selbst einmal unter flock (ein Aufruf für Bau, Messung und Aufräumen)
if [ -z "${MESS_IM_SCHLOSS:-}" ]; then
  exec env MESS_IM_SCHLOSS=1 flock "$S/bau.lock" bash "$0" "$@"
fi

L=$MESS_ZIEL/lauf.log
TEILE=${*:-budget messen lighthouse inp axe whisper last}
protokoll() { echo "[$(date -u +%H:%M:%S)] $* · $(uptime | sed 's/.*load average/load average/')" | tee -a "$L"; }

frei_gb=$(df --output=avail -BG / | tail -1 | tr -dc 0-9)
if [ "$frei_gb" -lt 4 ]; then
  protokoll "ABBRUCH: nur ${frei_gb} GB frei (mindestens 4 GB vor dem Bau)"
  exit 3
fi

cd "$W" || exit 1
SERVER=
aufraeumen() {
  if [ -n "$SERVER" ] && kill -0 "$SERVER" 2>/dev/null; then
    kill -TERM "$SERVER"
    timeout 30 tail --pid="$SERVER" -f /dev/null
    protokoll "Server (PID $SERVER) beendet"
  fi
  rm -rf "$W/.next" "$W/test-results" "$W/.env"
  protokoll "aufgeräumt (.next, test-results, .env)"
}
trap aufraeumen EXIT

protokoll "Beginn: Stand $(git -C "$W" rev-parse --short HEAD), Teile: $TEILE, frei ${frei_gb} GB"
rm -rf .next test-results

# .env aus der Vorlage (nie eingecheckt), Adresse und Schalter für diesen Lauf
install -m 600 "$MESS_ENV" .env
sed -i -E '/^(APP_URL|BETTER_AUTH_URL|FUNKTION_LERNAPP[A-Z_]*|FUNKTION_KONTEN|MEDIEN_VERZEICHNIS|PROXY_VERTRAUEN)=/d' .env
mkdir -p "$TMPDIR/medien"
cat >> .env <<EOF
APP_URL=http://localhost:$E2E_PORT
BETTER_AUTH_URL=http://localhost:$E2E_PORT
FUNKTION_KONTEN=an
FUNKTION_LERNAPP=an
FUNKTION_LERNAPP_SYNC=an
FUNKTION_LERNAPP_SPRECHEN=an
FUNKTION_LERNAPP_MELDUNGEN=an
FUNKTION_LERNAPP_GRUPPEN=an
MEDIEN_VERZEICHNIS=$TMPDIR/medien
EOF

# Wegwerf-Datenbank mit Seeds, Inhalten und Testkurs (wie die E2E), dann EIN Bau gegen sie
node scripts/e2e-datenbank.mjs > "$MESS_ZIEL/datenbank.log" 2>&1 || { protokoll "Datenbank rc=$?"; exit 1; }
protokoll "Datenbank bereit"
DATABASE_URL=$E2E_DATABASE_URL pnpm build > "$MESS_ZIEL/bau.log" 2>&1
rc=$?
protokoll "Bau rc=$rc"
[ $rc -eq 0 ] || exit 1

# Server (standalone wie Docker, E2E und Betrieb) auf eigenem Port; PID gemerkt
PORT=$E2E_PORT APP_URL=$MESS_BASIS BETTER_AUTH_URL=$MESS_BASIS DATABASE_URL=$E2E_DATABASE_URL PROXY_VERTRAUEN=1 \
  node scripts/start-standalone.mjs > "$MESS_ZIEL/server.log" 2>&1 &
SERVER=$!
echo "$SERVER" > "$MESS_ZIEL/server.pid"
if ! curl -sf -o /dev/null --retry 120 --retry-delay 1 --retry-connrefused --retry-all-errors "$MESS_BASIS/api/health"; then
  protokoll "Server nicht erreichbar"
  exit 1
fi
protokoll "Server bereit (PID $SERVER)"

# Anmeldungen für Mein Bereich und Routenlisten
export BEISPIEL_PASSWORT=$(openssl rand -base64 24)
node "$HIER/konten.mjs" >> "$L" 2>&1 || protokoll "Anmeldungen fehlgeschlagen (Mein Bereich wird ausgelassen)"
unset BEISPIEL_PASSWORT
KONTEN=$MESS_ZIEL/konten.json
[ -f "$KONTEN" ] || echo '{}' > "$KONTEN"
node "$HIER/routen.mjs" lighthouse "$KONTEN" "${MESS_FILTER:-}" > "$MESS_ZIEL/routen-lighthouse.json"
node "$HIER/routen.mjs" axe "$KONTEN" "${MESS_FILTER:-}" > "$MESS_ZIEL/routen-axe.json"

# Aufwärmen: jede Route einmal holen (Produktion ist warm; die erste Anfrage füllt nur Zwischenspeicher)
node -e '
const r = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
Promise.all(r.map((x) => fetch(process.env.MESS_BASIS + x.pfad).then((a) => a.arrayBuffer()).catch(() => null))).then(() => console.log(`aufgewärmt: ${r.length} Routen`));
' "$MESS_ZIEL/routen-lighthouse.json" >> "$L" 2>&1

for teil in $TEILE; do
  protokoll "Beginn $teil"
  case $teil in
    budget) node scripts/lernapp-budget.mjs "$MESS_BASIS" --aus "$MESS_ZIEL/budget.json" > "$MESS_ZIEL/budget.txt" 2>&1 ;;
    messen) MESSEN_ZIEL=$MESS_ZIEL/messen node scripts/messen.mjs "$MESS_BASIS" /lern-app/de /lern-app/ar/de-aus-ar \
      '/lern-app/tr/de-aus-tr/ueben?l=de-aus-tr.a1.e01.l01' > "$MESS_ZIEL/messen.txt" 2>&1 ;;
    lighthouse) node "$HIER/lighthouse.mjs" --routen "$MESS_ZIEL/routen-lighthouse.json" --laeufe 3 > "$MESS_ZIEL/lighthouse.txt" 2>&1 ;;
    inp) node "$HIER/inp-spieler.mjs" --laeufe 3 --drossel 6 > "$MESS_ZIEL/inp.txt" 2>&1 ;;
    axe) node "$HIER/a11y.mjs" --routen "$MESS_ZIEL/routen-axe.json" > "$MESS_ZIEL/a11y.txt" 2>&1 ;;
    whisper) node "$HIER/whisper-netz.mjs" > "$MESS_ZIEL/whisper-netz.txt" 2>&1 ;;
    last) node "$HIER/lasttest-sync.mjs" --konten 200 --pakete 3 --ereignisse 40 > "$MESS_ZIEL/lasttest.txt" 2>&1 ;;
    *) protokoll "unbekannter Teil: $teil"; continue ;;
  esac
  protokoll "Ende $teil rc=$?"
done
protokoll "Messungen fertig"
