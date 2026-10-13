STATUS · Branch claude/trusting-lovelace-6nfolz · Etappe 5–7/7 · main c581594 live (Anzeige, Erzählansichten, D-14…D-17) · Läuft: Sichtabnahme Z-04 · Nächster Schritt: Befundpakete, Stufe C, BERICHT

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
- 2026-10-13 · Zusammengeführt: Recht/Handbücher, Hadith/Quellen/Moschee, Elifbe, Koran-Leser, Konten, CMS, Kür A, Verwaltung Lernen (0011), Koran-Verwaltung, Mein Bereich (Unterricht/Kinder/Chat/Push), Rezitations-Werkstatt. S1-Sicherheitsprüfung: alle Befunde behoben.
- 2026-10-13 · Tor E2: Typen, Lint, Unit, Integration (1633), Sprachen, Religion 0, Wortlaut 0, Bau Produktion (1399 Seiten); Befund „Beispielmodus 500 bei unbekannten Adressen“ (auch live) behoben – 61 Adressen nur 200/404.
- 2026-10-13 15:15 UTC · Gestartet: O-B01/H-B01…B08 Bewegung + SVG je Route; O-K05 Anzeige-CMS + D-14…D-17 + Mail bei Passkey/2FA + Vers/Hadith des Tages (Migration 0012).
- 2026-10-13 16:00 UTC · Nutzer: „so viel live wie möglich“; Bukhari-Gesamt freigeschaltet (MN-06 entschieden). Live-Prüfung (4 Prüfer + Gegenprüfung) fand weiße Verwaltungs-/Konto-Seiten und 500er der Konto-APIs (auth stürzte ohne BETTER_AUTH_SECRET beim Import ab) – behoben.
- 2026-10-13 18:20 UTC · Dritter Abbruch am Sitzungslimit; Pakete gesichert und fortgesetzt. Bewegung/SVG und Erzählansichten gemergt.
- 2026-10-13 19:00 UTC · Fast-Forward `main` 8cbd2a6 → 2ee3e80, live `dpl_ErTf52ypPHU5hC21df6S2nGAMQh6`.
- 2026-10-13 20:00 UTC · Fast-Forward `main` 2ee3e80 → c581594, live `dpl_FC6GBM8cpj3WLm3KBQvU8d9i2xFB`; Sichtabnahme gestartet.
