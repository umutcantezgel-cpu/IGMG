STATUS · Branch claude/trusting-lovelace-6nfolz · Etappe 0/7 (E0 Start) · Welle 0 · Pflicht 0/≈70 · Kür 0 · Kriterien 0/21 · Ausnahmen 0 · Bestand grün (main b0bcc11) · Vercel grün · Nächster Schritt: Einrichtung + Kundschafter

# STATUS – Lauf „Gemeinde-Plattform“

## Einrichtung (für neu aufgesetzte Umgebungen wiederholen)
1. `S=<Scratchpad>`; Node 24.21.0: `curl -sSfL https://nodejs.org/dist/v24.21.0/node-v24.21.0-linux-x64.tar.xz | tar -xJ --strip-components=1 -C $S/node24`; `export PATH=$S/node24/bin:$PATH`.
2. `cd web && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install --frozen-lockfile`.
3. Werkzeuge: `_gemeinde/werkzeuge` (Abhängigkeiten nach `$S/werkzeuge-nm`, siehe LIESMICH.md); Chromium `/opt/pw-browsers`.

## Verlauf
- 2026-10-13 04:2x UTC · Start nach Freigabe des Plans; Sofortstart ohne Warten (L2-E01); `_gemeinde/` angelegt, `origin/main` (b0bcc11, ABSCHLUSS Vorlauf) gemergt.
