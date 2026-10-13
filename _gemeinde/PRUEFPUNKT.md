# PRÜFPUNKT – Gemeinde-Plattform

- **Stand 13.10. 09:10 UTC (Branch be5e405 + Hadith-Teile be8bf38):** Zusammengeführt sind Recht, Hadith/Quellen/Moschee,
  Elifbe, Koran-Leser, Konten/Mein Bereich. Lange Bukhari-Bücher stehen in Teilen zu je 100 Hadithen
  (`/hadith/bukhari/[buch]/teil/[teil]`).
- **Laufende Pakete (Worktree-Branches `worktree-agent-<id>`):**
  - CMS-Kern und Module (a24e520) – Migration ggf. auf `0011_*` neu erzeugen.
  - Kür: Hatim, Kalender, Ramadan, Spenden, Newsletter (aad315d).
  - Verwaltung Lernen + Aufnahme aus Voranmeldung (a4cbd4b) – Gruppen, Lernende, Lehrplan, Gemeinde-Konten, Löschlauf.
  - Mein Bereich: Unterricht, Kinder, Gruppe/Chat, Benachrichtigungen, Beispieldaten (a2e7dba).
  - Koran-Verwaltung: Ausgaben, Wortbedeutungen, Tajwid-Texte, Hadith-Übersetzungen/Listen (a68d2a2).
  - Rezitations-Werkstatt: Aufnahme/Upload, Versgrenzen, Mitklopfen, Prüfwiedergabe, Import (a9358d9).
- **Orchestrator erledigt seit 09:10:** Startklar „Gemeinde-Plattform“ (570ebd8), Wortlaut G-01…G-05 (23f3a96),
  Medienspiegel-Löschabgleich D-06 (01299d8), Löschfristen D-04/05/10/13/16 (7150de5), Kinderschutz-Modul (ced6d43),
  Probe ohne privaten Schlüssel D-08/D-09 (00872a4), Offline-Koran (in Arbeit: sw.js, offline.ts, E2E quran-offline).
  Probebau Produktion grün (1211 Seiten, /quran/2 84 KB gz).
- **Orchestrator parallel:** Startklar-Prüfungen (Schalter, Sicherung, Kette, Takt, lokaler Server), wortlaut-Ausnahmen,
  Medienspiegel-Löschabgleich (D-06); danach Zusammenführen CMS → Kür → Lernen-Verwaltung → Mein Bereich, Navigation
  (Kalender, Hatim, Ramadan, Spenden), Tor E2 (check, Integration, sprachen, Religion, Build beider Betriebsarten,
  E2E lokal, S1) → Fast-Forward `main` mit Produktionsschaltern aus.
- **Danach:** E3–E7 nach PLAN (Koran-Verwaltung + Rezitations-Werkstatt, Anzeige-CMS-Oberfläche, Gemeinde im Blick,
  Kinderschutz-Verwaltung, SVG-Programm je Route, Offline-Koran, Passkey, Stufe C, BERICHT, ABSCHLUSS).
- **Wiederaufnahme nach Neustart:** `git worktree list`; je Branch `worktree-agent-*` prüfen, ob ein Abschluss-Commit
  existiert; unfertige Pakete per SendMessage (Agent-ID aus Branchname) fortsetzen oder neu starten.
