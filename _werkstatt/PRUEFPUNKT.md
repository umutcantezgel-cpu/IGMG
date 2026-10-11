# PRÜFPUNKT

- **Nächster exakter Schritt (21:50 UTC):** Drei Hintergrundläufe abwarten:
  (1) Sichtabnahme-Workflow wf_bf54f379-640 (fünf frische Opus-Prüfer + Gegenprüfer + Synthese) → `_werkstatt/berichte/SICHTABNAHME-E3.md` schreiben → H-B-Pakete je Welle (disjunkte Schreibrechte; globals.css/Sprachdateien durch Opus);
  (2) Vorab-Prüfung für den Fast-Forward von 63a56f3 (`$SCRATCHPAD/ff/vorab.sh 63a56f3`: vercel build --prod ohne DB, pnpm check, geheimnisse:pruefen; Protokoll `$SCRATCHPAD/ff/vorab-63a56f3.log`) → bei Grün `git push origin 63a56f3:main` (Fast-Forward), danach Produktion per Vercel-MCP lesen (list_deployments, get_runtime_errors);
  (3) Kür-Welle A wf_54b18887-dba (K-04 Suche, K-05 OG-Bilder, K-10 Quran, K-12 Formulare Mitglied/Meldung, K-14 Rechtstexte; Haiku bauen, Opus nimmt ab, eine Nachbesserungsrunde) → Berichte ablegen, Text-/Tokenbedarf einarbeiten, Stufe A, Commit.
  Danach H-V08 (`$SCRATCHPAD/head/auftrag-v08.md`), H-L01, Kür-Welle B (K-06/K-20 Druck, K-07 Mobilmenü, K-16/K-17 Verwaltung, K-18 Anmeldung, K-19 Kalender-Abo – erst nach den H-B-Paketen, weil Dateien überlappen).
- **B-05:** eigener `SeitenUebergang` (L-E10) mit Morph (O-13); im Entwicklungsserver nachgewiesen (`werkzeuge/vt-status.mjs`: ready, Namen alt/neu). Nachweis am Produktions-Build im E3-TOR.
- **Laufende Pakete:** wf_bf54f379-640 (Sichtabnahme), wf_54b18887-dba (Kür-Welle A), Vorab-Prüfung FF 63a56f3.
- **Offene Pakete:** H-V08-Nachweis, H-L01, H-D04, H-B (nach Sichtabnahme), Kür K-02…K-20 (PLAN 1.1), Bilder der Verwaltung (Anmeldestand neu erzeugen).
- **Letzter grüner Commit:** 63a56f3 (Branch; Vorschau READY; Vorab-Prüfung läuft) · 8d79ddc (Unit grün, geheimnisse grün) · 93a0b3d (E3-Tor-Prüfling, Lauf grün außer 8c) · fe97c33 (main, unverändert).
- **Server:** 3100 Ausgangsstand (PID 18692, Routen-Cache bereinigt 21:17) · 3200 Entwicklung · 3400 E3-Tor-Prüfling 93a0b3d · 3500 HEAD bc4b5b7 (PID-Datei `$SCRATCHPAD/head/server.pid`). Postgres 16 lokal (5432).
- **Wiederaufnahme (L5):** Branch `claude/blissful-edison-x3j16w` holen, dann STATUS.md (Einrichtung) und diese Datei lesen.
