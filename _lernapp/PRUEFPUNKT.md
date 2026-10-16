# PRÜFPUNKT – Lern-App

- **Stand 16.10.2026 15:05 UTC – L0 Grundlagen läuft.** `main` = f2dc1a1 (ABSCHLUSS Gemeinde-Plattform, 21/21).
  - **Erledigt in L0:** Werkstatt `_lernapp/` übernommen (AUFTRAG, KERN 4.0, PLAN, ABNAHME Z-L01…Z-L22, MENSCHEN LM-01…LM-36,
    ENTSCHEIDUNGEN L3-E01…L3-E12, STATUS); Berichte `berichte/plan-2026-10-16.md`, `plan-verfeinerung-2026-10-16.md`,
    `lizenzen-l0*.md` (arabische Schrift entfernt); ADR 0037–0045 in `web/docs/adr/`, Vermerke in 0009/0012/0014/0016/0025/0030;
    CLAUDE.md-Block „Lern-App“; `.vercelignore` um `_lernapp`.
  - **Nächste Schritte:** (a) DSFA-Nachtrag Lern-App und Vorlage Sprecher-Vereinbarung als Entwurf unter
    `web/docs/recht/entwuerfe/`; (b) Spikes S1–S8 mit Belegen in `_lernapp/belege/` (höchstens 2 Code-Agenten; S1 Wurzel-Layout
    `/lern-app/[ui]` + Proxy + RTL, S2 Whisper, S3 Stimmen nach L3-E10, S4 Opus/Safari, S5 große Dateien, S6 `idb` + SW-Scope,
    S7 Tatoeba/kaikki/Häufigkeit im Strom gefiltert, S8 OpenITI nur lokal); (c) Werkzeuge im Scratchpad; (d) Tor L0 → FF `main`;
    danach L1 Kern (`PLAN.md` §14).
  - **Nach einem Abbruch:** offene Arbeitsbäume als ZWISCHENSTAND committen, laufende Workflows mit `resumeFromRunId`
    fortsetzen, dann hier weitermachen.

## Frühere Stände
- **Stand 16.10.2026 `[Uhrzeit]` UTC – L0 Grundlagen läuft.** `main` = f2dc1a1 (ABSCHLUSS Gemeinde-Plattform).
  - **Erledigt:**
    - Plan genehmigt, Verfeinerung `scratchpad/lernapp-entwurf-plan-agent.md`.
    - Lizenzprüfung `wf_cf9ab8d3-fce`: `scratchpad/lernapp-l0/LIZENZEN.md`, `stimmen.md`, `sprachdaten.md`,
      `modelle-schriften-werkzeuge.md`, `hanafi-quellen.md`.
    - Schritt 0 (ABSCHLUSS Gemeinde-Plattform).
    - Werkstatt-Entwurf in `scratchpad/lernapp-l0/entwurf/` (alle Dateien der Werkstatt, ADR 0037–0045, CLAUDE.md-Block),
      gegengeprüft auf Widersprüche.
  - **Nächste Schritte in dieser Reihenfolge:**
    1. **Werkstatt übernehmen:**
       - `entwurf/_lernapp/*` nach `_lernapp/` kopieren (AUFTRAG, KERN, PLAN, ABNAHME, MENSCHEN, ENTSCHEIDUNGEN, STATUS,
         PRUEFPUNKT; fertig fortgeschrieben); `.vercelignore` um `_lernapp` ergänzen.
       - CLAUDE.md: Block „Gemeinde-Plattform“ durch `entwurf/CLAUDE-block.md` ersetzen.
       - Den genehmigten Plan (Abschnitt „Plan „Lern-App““) nach `_lernapp/berichte/plan-2026-10-16.md` sichern und den Pfad
         in AUFTRAG eintragen.
       - Den Entwurf des Planungs-Agenten (`scratchpad/lernapp-entwurf-plan-agent.md`) nach
         `_lernapp/berichte/plan-verfeinerung-2026-10-16.md` sichern.
       - Lizenzbericht und Teilberichte nach `_lernapp/berichte/lizenzen-l0*.md` übernehmen.
       - **Vorher arabische Schrift durch Umschrift oder Beschreibung ersetzen**, sonst wird die Religion-Prüfung rot:
         - genehmigter Plan Z. 200
         - Entwurf des Planungs-Agenten Z. 351, 386, 388, 570
         - LIZENZEN.md Z. 109, 118, 126
         - hanafi-quellen.md Z. 122, 128, 130, 180, 181, 242
         - stimmen.md Z. 256
       - `node _gemeinde/werkzeuge/religion-pruefung.mjs` grün, dann Commit und Push.
    2. **ADRs (PLAN L0-03, L0-04):**
       - `entwurf/adr/0037-…` bis `0045-…` nach `web/docs/adr/` übernehmen.
       - Status-Vermerke: ADR 0030 („Nr. 4 für die Lern-App fortgeschrieben durch ADR 0040“), 0009 (ergänzt durch 0045),
         0012 (CSP der Lern-App → 0042), 0014 (→ 0044), 0016 (Prüfoberfläche Sprache → 0041, O-3), 0025 (→ 0045).
       - DSFA-Nachtrag Lern-App als Entwurf unter `web/docs/recht/entwuerfe/` (Art. 9, Ausnahme zu R-08, Löschfristen) und
         Vorlage der Sprecher-Vereinbarung mit Einwilligung in KI-Sprachsynthese.
    3. **MENSCHEN und ABNAHME** sind mit Schritt 1 übernommen (LM-01…LM-36 mit Standard, Z-L01…Z-L22). Platzhalter in eckigen
       Klammern im Lauf füllen.
    4. **Spikes S1–S8** mit Belegen in `_lernapp/belege/`, höchstens 2 Code-Agenten gleichzeitig:
       - S1 Wurzel-Layout `/lern-app/[ui]`, Proxy, Rechts-nach-links
       - S2 Whisper base/small de/tr/ar
       - S3 Stimmen nach L3-E10: Coqui-VITS Thorsten gegen de_DE-mls, Coqui tr glow-tts gegen Chatterbox,
         Vokalisierungstest Chatterbox ar
       - S4 Opus auf Safari
       - S5 Auslieferung großer Dateien
       - S6 `idb` und SW-Scope neben dem Root-SW
       - S7 Tatoeba-, kaikki- und Häufigkeitsauszüge mit SHA, im Strom gefiltert
       - S8 OpenITI nur lokal, Passagen-Index lokal
    5. **Werkzeuge** im Scratchpad einrichten (STATUS, Einrichtung Punkt 2).
    6. **Tor L0:** ADRs angenommen, 8 Spike-Belege, Religion-Prüfung grün, MENSCHEN eingetragen, Lizenztabelle übernommen,
       Entscheidungen L3-E01…L3-E12 eingetragen. Danach Commit, Push und Fast-Forward `main` nach grünem Tor (L3-E12).
  - **Danach:** L1 Kern (`PLAN.md` §14).
  - **Nach einem Abbruch:** offene Arbeitsbäume als ZWISCHENSTAND committen und laufende Workflows mit `resumeFromRunId`
    fortsetzen. Dann hier weitermachen.
