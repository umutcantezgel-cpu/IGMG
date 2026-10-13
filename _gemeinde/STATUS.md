STATUS · Branch claude/trusting-lovelace-6nfolz · Etappe 2–6/7 parallel · Welle 1 (6 Pakete in Arbeitsbäumen) · Orchestrator: Mein Ort, Push, Chat-Kern, Unterricht-Kern, Echtzeit, Server-Kit, Hatim/Kalender/GiroCode fertig · Nächster Schritt: Pakete zusammenführen, Tor E2

# STATUS – Lauf „Gemeinde-Plattform“

## Einrichtung (für neu aufgesetzte Umgebungen wiederholen)
1. `S=<Scratchpad>`; Node 24.21.0: `curl -sSfL https://nodejs.org/dist/v24.21.0/node-v24.21.0-linux-x64.tar.xz | tar -xJ --strip-components=1 -C $S/node24`; `export PATH=$S/node24/bin:$PATH`.
2. `cd web && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install --frozen-lockfile`.
3. Werkzeuge: `_gemeinde/werkzeuge` (Abhängigkeiten nach `$S/werkzeuge-nm`, siehe LIESMICH.md); Chromium `/opt/pw-browsers`.

## Verlauf
- 2026-10-13 04:2x UTC · Start nach Freigabe des Plans; Sofortstart ohne Warten (L2-E01); `_gemeinde/` angelegt, `origin/main` (b0bcc11, ABSCHLUSS Vorlauf) gemergt.
- 2026-10-13 · E1: Datenmodell, Rechte, Schalter, Inhaltsimport (Koran 6236 Verse/77433 Wörter, Tajwid, 3 Übersetzungen, Bukhari 7580) fertig; KERN 3.0, MENSCHEN, ABNAHME, PLAN, Religion-Prüfung (grün).
- 2026-10-13 · Welle 1 gestartet (Arbeitsbäume): O-Q01 Koran-Leser, O-A01/A02 Konten + Mein Bereich, H-D01/H-R01/H-I01 Hadith + Quellen + Moschee 2026, O-E01 Elifbe + /lernen.
- 2026-10-13 · Orchestrator fertig: H-G01 Mein Ort, O-P01 Push, O-C01 Chat-Kern (S-01…S-17), O-L02 Unterricht-Kern, O-S01 Server-Kit, O-C02 Echtzeit, Kern Hatim/besondere Tage/GiroCode, ADRs angenommen. Gestartet: O-M01 CMS (Arbeitsbaum), H-R02/R03 Recht + Handbücher (Arbeitsbaum).
