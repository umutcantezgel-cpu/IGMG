# PRÜFPUNKT – Gemeinde-Plattform

- **Stand 13.10. 08:35 UTC:** Alle Pakete brachen um ≈ 06:00 UTC am Sitzungslimit ab; ihre Arbeit ist in den Arbeitsbäumen
  als Commit „ZWISCHENSTAND …“ auf den Branches `worktree-agent-*` gesichert. Pakete wurden fortgesetzt (SendMessage):
  Konten (adda99e), Koran-Leser (a4ada8d), Hadith/Quellen/Moschee (ad7cbf8), Elifbe (a1feebc), CMS (a24e520),
  Recht/Handbücher (ae898de), Kür (aad315d).
- **Orchestrator parallel:** Chat-Oberfläche (Komponente mit adaptivem Abruf), Unterricht-Actions/Komponenten (Anwesenheit),
  danach Zusammenführen in der Reihenfolge Recht → Hadith → Elifbe → Koran → Konten → CMS → Kür, Migrationen neu nummerieren,
  Navigation, Mein-Bereich-Anbindung, Startklar-Prüfungen, Tor E2, Fast-Forward `main`.
- **Wiederaufnahme nach Neustart:** `git worktree list`; je Branch `worktree-agent-*` prüfen, ob ein Abschluss-Commit nach dem
  ZWISCHENSTAND existiert; unfertige Pakete per SendMessage (Agent-ID aus Branchname) fortsetzen oder neu starten.
