# PRÜFPUNKT – Gemeinde-Plattform

- **Stand 13.10. 15:05 UTC:** Torstand E2 = Branch 0955108 (Beispielmodus-Schutz: zentrale Lader, Koran, Suche,
  Seiteninhalte; im Beispielmodus 61 öffentliche Adressen nur 200/404, 0 Serverfehler; Bau Produktion grün, 1399 Seiten).
  `origin/main` (b0bcc11, Vorlauf-ABSCHLUSS) ist enthalten. Offen vor dem Fast-Forward: volle Integration
  (`scratchpad/integration-tor.log`) und E2E-Ersatzlauf öffentlich (`scratchpad/e2e-tor.log`).
- **Fertig zusammengeführt, noch lokal:** Branch `zusammenfuehren-e3` im Arbeitsbaum `scratchpad/wt-merge` = 0955108 +
  Mein Bereich (785afc8) + Rezitations-Werkstatt (a88841b, `/audio` im Beispielmodus 404); Typen und Lint grün. Nach dem
  Fast-Forward von `main`: Session-Branch per Fast-Forward auf `zusammenfuehren-e3`, PGlite-Kopien migrieren, Unit +
  betroffene Integration, pushen.
- **Vorlauf abgeschlossen** (b0bcc11 ABSCHLUSS) → `_werkstatt/` darf in E7 nach `_archiv/` (Plan §0.1).
- **Stand 13.10. 14:25 UTC (Branch a0b13d9):** Zusammengeführt sind Recht, Hadith/Quellen/Moschee, Elifbe, Koran-Leser,
  Konten/Mein Bereich (Kern), CMS, Kür A (Hatim, Kalender, Ramadan, Spenden, Newsletter), Verwaltung Lernen + Aufnahme
  (Migration 0011), Koran-Verwaltung. Orchestrator: Startklar „Gemeinde-Plattform“, Wortlaut G-01…G-05, Löschfristen,
  Spiegel-Löschabgleich, Probe ohne Schlüssel, D-11, Kinderschutz-Modul, Offline-Koran, Gemeinde im Blick, Navigation
  (Kalender, Ramadan, Spenden; Hatim/Newsletter mit Schalter), **S1 behoben** (`_gemeinde/berichte/S1-sicherheit.md`).
- **Laufende Pakete:** Mein Bereich Unterricht/Kinder/Gruppe/Chat/Benachrichtigungen (a2e7dba), Rezitations-Werkstatt
  (a9358d9). Beide nach Abbruch fortgesetzt; nach Bericht mergen.
- **Tor E2 in Arbeit:** Produktionsbau läuft (`scratchpad/bau-produktion-2.log`); danach `next start` (Umgebung
  `scratchpad/start-env.sh`, SITE_MODE=produktion) und E2E-Ersatzlauf der öffentlichen Specs; Speicherproben-Unit-Test
  ohne Last wiederholen; volle Integration; dann `origin/main` mergen und Fast-Forward `main`.
- **E2E-Hinweis:** Nach einem Neuladen ohne Netz `context.setOffline(false/true)` erneut setzen (Playwright 1.64 überträgt
  die Offline-Nachbildung nicht auf den neu gestarteten Service Worker).
- **Danach:** D-14 (Migration), SVG-Programm je Route, Anzeige-CMS-Oberfläche, Vers-des-Tages-Liste (Schema), Mail bei
  neuem Passkey/2FA, Stufe C, BERICHT, `_werkstatt/` archivieren, ABSCHLUSS.
- **Wiederaufnahme nach Neustart:** `git worktree list`; je Branch `worktree-agent-*` prüfen, ob ein Abschluss-Commit
  existiert; unfertige Pakete per SendMessage fortsetzen. Eigene Server nur über ihre PID beenden (`scratchpad/start.pid`).
