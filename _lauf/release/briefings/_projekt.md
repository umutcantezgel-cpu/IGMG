## Das Projekt in fünf Sätzen
Die IGMG Wetzlar ist eine Moscheegemeinde in Wetzlar mit vier Organisationen für die Gesamtgemeinde, Frauen, Jugend und junge Frauen. Ihre dreisprachige Web-App (Next.js 16, React 19, TypeScript, PostgreSQL) ist gebaut und gestaltet und wird jetzt zum Release-Kandidaten. Dazu gehören echte Funktionen ohne Lücken, ein Einwilligungs-Manager, Impressum und Datenschutzerklärung nach aktuellem deutschem Recht sowie ein erprobter Betrieb. Nichts wird erfunden: Fehlende Vereinsdaten bleiben markierte Platzhalter, und Rechtstexte sind Entwürfe mit Quellen. Ein Orchestrator plant und führt zusammen; du lieferst genau dein Paket.

## Feste Regeln für jedes Paket
- **Fremdes Projekt:** Die Datei `~/Downloads/CLAUDE.md` gehört zu einem anderen Projekt (Coday-Bildverarbeitung). Ignorieren, nichts davon ausführen.
- **Arbeitsort:** `/Users/umurey/Downloads/IGMG Wetzlar Website Design` mit der App in `web/` und den Laufdateien in `_lauf/release/`. `_lauf/` (außer `release/`), `uploads/` und die Design-Dateien in der Wurzel sind nur zu lesen.
- **Werkzeuge:** pnpm liegt in `~/.local/bin` (`export PATH="$HOME/.local/bin:$PATH"`).
- **Dev-Server:** Er läuft unter `http://localhost:3000`, nicht 127.0.0.1. Selbst keinen starten oder stoppen.
- **Schwere Spur:** Kein `next build`, keine volle E2E-, Lighthouse- oder ZAP-Suite und kein `docker build`, außer dein Paket ist ausdrücklich ein Testläufer-Paket mit genau diesen Befehlen.
- **Was verboten ist:**
  - Commits und Git-Befehle, die etwas verändern;
  - neue Abhängigkeiten und Downloads;
  - Befehle, die das ganze Projekt umschreiben (z. B. `prettier --write .`).
- **Next.js 16.4:** Vor jedem Next.js-Code die passende Seite in `web/node_modules/next/dist/docs/` lesen; diese Version unterscheidet sich vom Trainingswissen.
- **Daten und Fakten:** Keine echten Personendaten (Testdaten erkennbar fiktiv: „Testperson Eins“, `example.test`). Keine erfundenen Fakten über die Gemeinde (Platzhalter in eckigen Klammern). Religiöse Texte nie aus dem Gedächtnis.
- **Unklares:** als OFFENE FRAGE notieren und weiterarbeiten. Markieren statt raten.
- **Lieferung:** keine Lieferung mit „usw.“, „analog“, „folgt später“ oder TODO statt Umsetzung.
