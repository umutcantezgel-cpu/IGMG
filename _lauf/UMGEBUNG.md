# UMGEBUNG (P0.2) – Stand 2026-10-11 01:48

| Werkzeug | Ergebnis |
|---|---|
| Betriebssystem | macOS (Darwin 25.6.0), arm64, 14 Kerne, 24 GB RAM |
| Node.js | v24.14.1 (LTS-Linie 24) |
| npm | 11.11.0 |
| corepack | 0.34.6 |
| pnpm | 12.11.2 über corepack in ~/.local/bin (E-006) |
| Git | 2.54.0 (Apple Git-157) |
| GitHub CLI | 2.102.0, angemeldet als umutcantezgel-cpu; Repo umutcantezgel-cpu/IGMG ist öffentlich |
| Docker | Engine 29.5.2, Compose 5.1.4; CLI unter /Applications/Docker.app/Contents/Resources/bin (nicht im PATH) |
| Lokale Datenbank | PostgreSQL in Docker (Docker läuft) – PGlite bleibt Rückfall und Testoption |
| Python | 3.9.6 (nur Hilfsskripte) |
| Playwright-Browser | im Cache ~/Library/Caches/ms-playwright: chromium-1208 chromium-1223 chromium-1228 chromium-1234 chromium-1243 chromium_headless_shell-1208 chromium_headless_shell-1223 chromium_headless_shell-1228 chromium_headless_shell-1234 chromium_headless_shell-1243 ffmpeg-1011 firefox-1509 firefox-1522 webkit-2248 webkit-2287  |
| Haiku-Probeauftrag | erfolgreich: Unteragent meldet „Haiku 5.5, claude-haiku-5-5“, liest _lauf/ korrekt, antwortet BEREIT |
| Workflow-Unteragenten | laufen mit model: 'haiku', effort: 'max' (Erkundungs-Workflow wf_ddb8a36f-a50) |
| Next.js DevTools MCP | **nicht verbunden**. Baumeister prüfen per Typprüfung; web/.mcp.json mit next-devtools-mcp wird in P2 angelegt und wirkt ab der nächsten Sitzung |
| Netz | erreichbar (npm-Registry, GitHub, unpkg für Bildreferenzen) |

## Hinweise
- Alle Befehle mit `export PATH="$HOME/.local/bin:/Applications/Docker.app/Contents/Resources/bin:$PATH"`.
- Die fremde ~/Downloads/CLAUDE.md wird in jede Sitzung geladen und ist irrelevant (E-002).
