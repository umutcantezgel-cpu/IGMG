#!/usr/bin/env bash
# Prüfauftrag ADR 0017 (D04): Erfasst revalidateTag die beim Bau vorgerenderten Seiten?
# Voraussetzung: `pnpm build` in web/, PostgreSQL aus docker compose läuft, Port 3100 frei.
# Ablauf: Server starten → Titel in der DB ändern → Seite (alt) → Wartungsroute → Seite (neu) → zurücksetzen.
set -euo pipefail
cd "$(dirname "$0")/../../web"
source ../_lauf/werkzeuge/umgebung.sh
PORT=3100 CACHE_ERNEUERN_BEIM_START=0 node scripts/start-standalone.mjs > /tmp/igmg-adr0017-server.log 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null; pkill -P $SERVER 2>/dev/null || true' EXIT
for _ in $(seq 1 30); do curl -sf -o /dev/null http://localhost:3100/api/health && break; sleep 1; done
DB=$(docker ps -q --filter name=db)
sql() { docker exec "$DB" psql -U igmg -d igmg -tAc "$1" >/dev/null; }
TOKEN=$(awk -F= '/^WARTUNG_TOKEN=/{print substr($0, index($0,"=")+1)}' .env)
h1() { curl -s "http://localhost:3100$1" | grep -o '<h1[^>]*>[^<]*' | sed 's/<h1[^>]*>//' | head -1; }
liste() { curl -s http://localhost:3100/veranstaltungen | grep -c 'DB geändert' || true; }
post() { curl -s -o /dev/null -w '%{http_code}' -X POST "$@" http://localhost:3100/api/wartung/cache-erneuern; }
setze() { sql "update veranstaltung set titel = jsonb_set(titel, '{de}', '\"$1\"') where slug='arabisch-sprachkurs'"; }
D=/veranstaltungen/arabisch-sprachkurs
echo "# ADR 0017 – Prüfauftrag D04 · $(date '+%Y-%m-%d %H:%M') · Build $(cat .next/BUILD_ID)"
echo
echo "1. Vor der Änderung, Detail-h1: \`$(h1 $D)\`"
setze 'Arabisch Sprachkurs (DB geändert)'
echo "2. Titel nur in der DB geändert, ohne Erneuerung – Detail-h1: \`$(h1 $D)\` · Treffer in Liste: $(liste)"
echo "3. Wartungsroute ohne Token: HTTP $(post)"
echo "4. Wartungsroute mit falschem Token: HTTP $(post -H 'authorization: Bearer falsch')"
echo "5. Wartungsroute mit Token: HTTP $(post -H "authorization: Bearer $TOKEN")"
echo "6. Danach Detail-h1 (de): \`$(h1 $D)\`"
echo "7. Danach Detail-h1 (tr, Rückfall de): \`$(h1 /tr/etkinlikler/arabisch-sprachkurs)\`"
echo "8. Danach Treffer in Liste: $(liste)"
echo "9. Danach iCal-Feed: \`$(curl -s http://localhost:3100/api/ical/de/veranstaltungen | tr -d '\r' | perl -0pe 's/\n //g' | grep -o 'SUMMARY:.*Arabisch.*' | head -1)\`"
setze 'Arabisch Sprachkurs'
post -H "authorization: Bearer $TOKEN" >/dev/null
echo "10. Zurückgesetzt und erneuert – Detail-h1: \`$(h1 $D)\` · Treffer in Liste: $(liste)"
