#!/bin/bash
# Messlauf der Lern-App (L8-02): EIN Produktionsbau mit allen Schaltern der Lern-App, Testkurs und Seeds wie in der
# Lern-App-E2E (scripts/e2e-datenbank.mjs, eigene Wegwerf-Datenbank), Server auf eigenem Port, alle Messungen, Server per
# gemerkter PID beenden, .next und .env löschen – alles unter EINEM Schloss (gemeinsames bau.lock), damit nie zwei .next
# gleichzeitig existieren und der Lauf wiederholbar ist. Danach endet das Skript und gibt das Schloss frei.
#
# Aufruf (im Arbeitsbaum): MESS_ENV=<.env-Vorlage> bash _lernapp/werkzeuge/leistung/messlauf.sh [teile …]
#   teile: budget messen lighthouse inp axe whisper last (Standard: alle in dieser Reihenfolge); dazu lighthouse-echt und
#     inp-echt (Stufe C N6: Start, Lernpfade und Spieler echter Lektionen, routen.mjs `ECHT`; nur auf Anforderung)
#   MESS_ENV=<datei>: .env-Vorlage mit Datenbank, Mail und Geheimnissen (Pflicht; wird nach web/.env kopiert, danach gelöscht)
#   MESS_FILTER=<regulärer Ausdruck>: nur Routen, deren Pfad passt (Lighthouse und axe; Nachmessung nach einer Behebung)
#   MESS_ZIEL=<ordner>: Ausgabe (Standard $TMPDIR/leistung); dort lauf.log mit `uptime` je Schritt
#   MESS_HALTEN=<sekunden>: Server nach den Messungen weiterlaufen lassen (Ende mit `touch <ziel>/stopp`; Standard aus)
#   MESS_AUFTRAG_S=<sekunden>: Auftragsschleife einschalten (Standard 0 = aus). Solange sie läuft, hält der Lauf das
#     gemeinsame Schloss und führt jedes Skript aus, das als <ziel>/auftrag.sh erscheint (im Ordner web/, mit der Umgebung
#     des Laufs) – nur mit eigenem, nicht geteiltem MESS_ZIEL verwenden. Ende mit `touch <ziel>/stopp` oder nach der Zeit.
#   MESS_PLATTE_WARTEN=<sekunden>: höchstens so lange auf 4 GB freien Platz warten (Standard 1800); MESS_PLATTE_MB=<MiB>
#   MESS_SCRATCH=<ordner>: Ablage der Sitzung mit node24/ (Node 24), bau.lock (gemeinsames Schloss) und
#     e2e-echt/pw-browsers (Chromium der Playwright-Version aus web/); einzeln: MESS_NODE_BIN, MESS_SCHLOSS, MESS_BROWSER
# Voraussetzungen: PostgreSQL (127.0.0.1:5432, Rolle igmg) und Mailpit laufen; `pnpm install` in web/ (die Werkzeuge
# importieren aus web/node_modules – den Verweis _lernapp/werkzeuge/leistung/node_modules legt das Skript selbst an).
# Ergebnisse: <ziel>/{budget,messen,lighthouse,inp,a11y,whisper-netz,lasttest}.{md,json}; Rohdaten bleiben außerhalb des Repos.
set -u
S=${MESS_SCRATCH:-/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad}
SCHLOSS=${MESS_SCHLOSS:-$S/bau.lock}
HIER=$(cd "$(dirname "$0")" && pwd)
W=$(cd "$HIER/../../../web" && pwd)
export PATH=${MESS_NODE_BIN:-$S/node24/bin}:$HOME/.local/bin:$PATH NEXT_TELEMETRY_DISABLED=1
export E2E_PORT=${E2E_PORT:-3224}
export E2E_DATABASE_URL=${E2E_DATABASE_URL:-postgres://igmg:igmg-lokal@127.0.0.1:5432/igmg_lernapp_d_e2e}
export TMPDIR=${TMPDIR:-$S/tmp-l8d}
# Browser der Playwright-Version aus web/ (die Umgebung setzt PLAYWRIGHT_BROWSERS_PATH auf ältere Builds); MESS_BROWSER setzt ihn anders
export PLAYWRIGHT_BROWSERS_PATH=${MESS_BROWSER:-$S/e2e-echt/pw-browsers}
export MESS_ZIEL=${MESS_ZIEL:-$TMPDIR/leistung}
export MESS_BASIS=http://localhost:$E2E_PORT
mkdir -p "$TMPDIR" "$MESS_ZIEL"
if [ -z "${MESS_ENV:-}" ] || [ ! -f "$MESS_ENV" ]; then
  echo "MESS_ENV fehlt: Pfad einer .env-Vorlage angeben (Datenbank, Mail, Geheimnisse; wird nie eingecheckt)" >&2
  exit 2
fi
export MESS_ENV
# Die Werkzeuge (.mjs) importieren aus web/node_modules über einen Verweis neben sich (per .gitignore ausgeschlossen)
[ -d "$W/node_modules" ] || { echo "web/node_modules fehlt: erst \`pnpm install --frozen-lockfile\` in web/" >&2; exit 2; }
ln -sfn ../../../web/node_modules "$HIER/node_modules"

# Vor dem Schloss: mindestens 4 GB frei abwarten (andere Läufe räumen ihr .next auf), höchstens MESS_PLATTE_WARTEN Sekunden
# Mindestplatz vor dem Bau: 4 GB (dezimal, Auftrag: „mindestens 4 GB frei“) = 3815 MiB; MESS_PLATTE_MB setzt ihn anders
PLATTE_MIN=${MESS_PLATTE_MB:-3815}
platte_mb() { df --output=avail -BM / | tail -1 | tr -dc 0-9; }
if [ -z "${MESS_IM_SCHLOSS:-}" ]; then
  ende=$((SECONDS + ${MESS_PLATTE_WARTEN:-1800}))
  until [ "$(platte_mb)" -ge "$PLATTE_MIN" ]; do
    if [ $SECONDS -ge $ende ]; then
      echo "[$(date -u +%H:%M:%S)] ABBRUCH vor dem Schloss: nur $(platte_mb) MB frei (mindestens $PLATTE_MIN MiB)" | tee -a "$MESS_ZIEL/lauf.log"
      exit 3
    fi
    timeout 20 tail -f /dev/null
  done
  # Unter das gemeinsame Schloss: das Skript startet sich selbst einmal unter flock (ein Aufruf für Bau, Messung, Aufräumen)
  exec env MESS_IM_SCHLOSS=1 flock "$SCHLOSS" bash "$0" "$@"
fi

L=$MESS_ZIEL/lauf.log
TEILE=${*:-budget messen lighthouse inp axe whisper last}
protokoll() { echo "[$(date -u +%H:%M:%S)] $* · $(uptime | sed 's/.*load average/load average/')" | tee -a "$L"; }

frei_mb=$(platte_mb)
if [ "$frei_mb" -lt "$PLATTE_MIN" ]; then
  protokoll "ABBRUCH: nur ${frei_mb} MB frei (mindestens $PLATTE_MIN MiB vor dem Bau)"
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
trap 'exit 143' TERM INT

protokoll "Beginn: Stand $(git -C "$W" rev-parse --short HEAD), Teile: $TEILE, frei ${frei_mb} MB"
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
# Zwischenspeicher des Baus und .next/server (Kopie liegt in .next/standalone, ≈ 1,4 GB) braucht der Server nicht (Platte knapp)
rm -rf .next/cache .next/server

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
      '/lern-app/tr/de-aus-tr/ueben?l=de-aus-tr.a1.test.l01' > "$MESS_ZIEL/messen.txt" 2>&1 ;;
    lighthouse) node "$HIER/lighthouse.mjs" --routen "$MESS_ZIEL/routen-lighthouse.json" --laeufe 3 > "$MESS_ZIEL/lighthouse.txt" 2>&1 ;;
    lighthouse-echt) node "$HIER/routen.mjs" lighthouse-echt "$KONTEN" "${MESS_FILTER:-}" > "$MESS_ZIEL/routen-lighthouse-echt.json" &&
      node "$HIER/lighthouse.mjs" --routen "$MESS_ZIEL/routen-lighthouse-echt.json" --laeufe 3 --aus lighthouse-echt \
        > "$MESS_ZIEL/lighthouse-echt.txt" 2>&1 ;;
    inp-echt) node "$HIER/inp-spieler.mjs" --laeufe 3 --drossel 6 --echt > "$MESS_ZIEL/inp-echt.txt" 2>&1 ;;
    inp) node "$HIER/inp-spieler.mjs" --laeufe 3 --drossel 6 > "$MESS_ZIEL/inp.txt" 2>&1 ;;
    axe) node "$HIER/a11y.mjs" --routen "$MESS_ZIEL/routen-axe.json" > "$MESS_ZIEL/a11y.txt" 2>&1 ;;
    whisper) node "$HIER/whisper-netz.mjs" > "$MESS_ZIEL/whisper-netz.txt" 2>&1 ;;
    last) node "$HIER/lasttest-sync.mjs" --konten 200 --pakete 3 --ereignisse 40 > "$MESS_ZIEL/lasttest.txt" 2>&1 ;;
    *) protokoll "unbekannter Teil: $teil"; continue ;;
  esac
  protokoll "Ende $teil rc=$?"
done
protokoll "Messungen fertig"

# MESS_HALTEN=<sekunden>: Server danach weiterlaufen lassen (Nachmessung einzelner Werkzeuge gegen denselben Bau), bis die
# Datei <ziel>/stopp existiert oder die Zeit um ist; erst dann beenden und aufräumen (weiter unter demselben Schloss)
if [ -n "${MESS_HALTEN:-}" ]; then
  protokoll "Server bleibt bis zu ${MESS_HALTEN} s (Ende: touch $MESS_ZIEL/stopp)"
  ende=$((SECONDS + MESS_HALTEN))
  until [ -f "$MESS_ZIEL/stopp" ] || [ $SECONDS -ge $ende ]; do timeout 10 tail -f /dev/null; done
  rm -f "$MESS_ZIEL/stopp"
fi

# MESS_AUFTRAG_S=<sekunden> (nur auf ausdrücklichen Wunsch, Standard 0 = aus): Aufträge gegen den laufenden Server, weiter
# unter demselben Schloss – ein Skript als <ziel>/auftrag.sh ablegen; es läuft im Ordner web/ mit der Umgebung des Laufs.
# Ende mit `touch <ziel>/stopp` oder nach MESS_AUFTRAG_S Sekunden. Ohne die Variable endet der Lauf hier und gibt das
# gemeinsame Schloss frei.
AUFTRAG_S=${MESS_AUFTRAG_S:-0}
if [ "$AUFTRAG_S" -gt 0 ] 2>/dev/null; then
  ende=$((SECONDS + AUFTRAG_S))
  protokoll "Auftragsschleife für höchstens ${AUFTRAG_S} s (Skript: $MESS_ZIEL/auftrag.sh, Ende: touch $MESS_ZIEL/stopp)"
  until [ -f "$MESS_ZIEL/stopp" ] || [ $SECONDS -ge $ende ]; do
    if [ -f "$MESS_ZIEL/auftrag.sh" ]; then
      mv "$MESS_ZIEL/auftrag.sh" "$MESS_ZIEL/auftrag-laeuft.sh"
      protokoll "Auftrag beginnt: $(head -1 "$MESS_ZIEL/auftrag-laeuft.sh")"
      (cd "$W" && bash "$MESS_ZIEL/auftrag-laeuft.sh") >> "$MESS_ZIEL/auftrag.log" 2>&1
      protokoll "Auftrag Ende rc=$?"
    fi
    timeout 10 tail -f /dev/null
  done
  rm -f "$MESS_ZIEL/stopp"
fi
