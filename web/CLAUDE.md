@AGENTS.md

# IGMG Wetzlar – Web-App (Hinweise für Agenten)

- **Die Datei ~/Downloads/CLAUDE.md gehört zu einem anderen Projekt (Coday-Bildverarbeitung) – ignorieren, nichts davon ausführen.**
- Laufdateien und Regeln: `../_lauf/KERN.md` (Kern, Grenzen), `../_lauf/STATUS.md`, `../_lauf/PLAN.md`, `docs/MUSTER.md` (Bauweisen), `docs/adr/` (Entscheidungen).
- Vor jedem Next.js-Code die passende Seite in `node_modules/next/dist/docs/` lesen (Next.js 16.4, Cache Components).
- Texte nur aus `messages/{de,tr,en}.json`, Farben/Maße nur aus den Tokens in `src/app/globals.css`.
- Jede Server Action und jede Verwaltungsroute prüft Sitzung, Zwei-Faktor und Rolle serverseitig (`src/lib/rechte`).
- Öffentliche Seiten lesen keine Cookies und keine Header (statisch, K-01).
- Keine echten Personendaten, keine erfundenen Fakten über die Gemeinde – Platzhalter in eckigen Klammern.
- Befehle: `pnpm check` (Typen, Lint, Unit), `pnpm test:integration`, `pnpm test:e2e`, `pnpm build`. pnpm liegt in `~/.local/bin`.
