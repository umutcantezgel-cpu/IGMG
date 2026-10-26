STATUS · Branch claude/trusting-lovelace-6nfolz · Etappe L8 abgeschlossen · main = Abschluss-Commit Lern-App (App-Endstand 390b6715) · Läuft: nichts – Lauf abgeschlossen am 26.10.2026 · Nächster Schritt: Übergabe an Menschen (`MENSCHEN.md`, `GO-LIVE.md`, `ABSCHLUSS.md`)

# STATUS – Lauf „Lern-App“

## Einrichtung (für neu aufgesetzte Umgebungen wiederholen)
1. **Grundlage wie im Vorlauf** (`_gemeinde/STATUS.md`, „Einrichtung“): Node 24.21.0 im Scratchpad vor `PATH`,
   `pnpm install --frozen-lockfile` in `web`, Werkzeuge aus `_gemeinde/werkzeuge`, Chromium `/opt/pw-browsers`. Echte E2E mit
   PostgreSQL und Mailpit nach `web/tests/e2e/LIESMICH.md`.
2. **Werkzeuge der Lern-App:** nur im Scratchpad, nie im Repository, nichts davon wird ausgeliefert (KERN §1, Lizenzbefund).
   `[in L0 einrichten und Pfade eintragen]`
   - Sprachausgabe: Python-Umgebung mit Coqui TTS (MPL-2.0) und gruut (MIT); piper1-gpl und espeak-ng (GPL) nur für das
     Training eigener Stimmen; opus-tools bzw. ffmpeg.
   - Prüfer: LanguageTool (de), Zemberek (tr), Mishkal und CAMeL Tools (ar), Hunspell-CLI.
   - Quellen: OpenITI-Auszüge der benannten Werke nur lokal (CC BY-NC-SA 4.0).
3. **Platte:** 7,0 GB frei (16.10.2026); Budget `PLAN.md` §15. Downloads im Strom filtern, nach jedem Merge `.next` und
   `test-results` löschen.

## Verlauf
- 2026-10-16 · Nutzer: Auftrag „Lern-App“ mit acht Entscheidungen (AUFTRAG §2); Plan genehmigt.
- 2026-10-16 · Verfeinerung durch den zweiten Planungs-Agenten (`scratchpad/lernapp-entwurf-plan-agent.md`, wird `PLAN.md`,
  gesichert als `berichte/plan-verfeinerung-2026-10-16.md`):
  - Adresse `/lern-app/[ui]`, Zwei-Prüfer-Freigabe, KI-Regel 2 (ADR 0040)
  - Ereignisprotokoll mit FSRS-Nachspielen, Mengen
  - ADR 0037–0045, Spikes S1–S8, LM-01…LM-20, O-1…O-9
- 2026-10-16 · L0 Lizenzprüfung, Workflow `wf_cf9ab8d3-fce`, 31 Primärquellen gegengeprüft. Ergebnis in
  `scratchpad/lernapp-l0/LIZENZEN.md` mit vier Teilberichten:
  - Piper-Stimmen weitgehend nicht nutzbar; OpenITI nur lokal; Quranic Arabic Corpus nicht verwenden.
  - 19 Entscheidungen für Menschen (L0-E01…L0-E19).
- 2026-10-16 · Lauf „Gemeinde-Plattform“ abgeschlossen: Abschlussurteil 21/21 auf e68f658, ABSCHLUSS f2dc1a1 auf `main`
  (Schritt 0 des Plans).
- 2026-10-16 · L0 Werkstatt-Entwurf in `scratchpad/lernapp-l0/entwurf/`: AUFTRAG, KERN 4.0, ENTSCHEIDUNGEN L3-E01…L3-E12,
  PLAN, ABNAHME (Z-L01…Z-L22), MENSCHEN (LM-01…LM-36), STATUS, PRUEFPUNKT, CLAUDE.md-Block, ADR 0037–0045.
- 2026-10-16 · Gegenprüfung der Entwürfe: Widersprüche behoben. Wo der genehmigte Plan strenger ist als der Entwurf der
  Verfeinerung, gilt er: zwei Freigaben auch für Sprachkurs-Einträge mit Religionsbezug, Formelliste, Koran-Bedeutungen und
  Wurzeltabelle; Hadith-N-Gramm ab 4 Wörtern (O-2, O-10, O-11).
- 2026-10-17 … 2026-10-26 · Etappen L0–L8 nach `PLAN.md` §14; Verlauf je Stand in `PRUEFPUNKT.md`, Commits auf dem Branch.
- 2026-10-26 · Stufe C (L8-05): fünf Prüfgruppen mit Gegenprüfung, Nacharbeit N1–N9, volles Tor (`e06a648b`), frischer Endprüfer
  „abgenommen mit Auflagen“ (`berichte/stufe-c.md`), Vollständigkeitskritik (`protokolle/C-endpruefer-kritik.md`).
- 2026-10-26 · Auflagen behoben bzw. entschieden: Fokus „Sprechen“ (243aecfe), LCP Lernpfad (b9e581e8), Beschriftung A1–B1
  (0e3a03a0), L3-E17…L3-E21; Schluss-Tor am Endstand; ABNAHME, BERICHT (Urteil wörtlich, Galerie live), ABSCHLUSS. Lauf beendet,
  CLAUDE.md-Block entfernt, stündlicher Trigger beendet.
