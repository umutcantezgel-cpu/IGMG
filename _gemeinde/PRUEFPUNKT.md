# PRÜFPUNKT – Gemeinde-Plattform

- **Läuft:** Welle 1 in vier Arbeitsbäumen (Koran-Leser, Konten/Mein Bereich, Hadith/Quellen/Moschee 2026, Elifbe/Lernen). Ihre Branches nach Abschluss in `claude/trusting-lovelace-6nfolz` mergen.
- **Orchestrator parallel:** H-G01 Gebetszeiten „Mein Ort“; danach Navigation (Menüpunkte Hadith, Elifbe, Lernen), Tor E2 (Typen, Lint, Unit, Integration, Build, E2E-Auswahl, S1-Sicherheitsprüfung), Fast-Forward `main`.
- **Danach:** Welle 2 (E3/E4): Lernplattform, Chat, CMS, Push, Rezitations-Werkstatt.
- **Wiederaufnahme nach Neustart:** Branch holen, `_gemeinde/STATUS.md` (Einrichtung), diese Datei; `git worktree list` und `git branch -a` zeigen die Paket-Branches (worktree-agent-*); fertige Branches mergen, fehlende Pakete neu starten (Briefing `_gemeinde/pakete/BRIEFING-GEMEINSAM.md`).
