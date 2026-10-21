# PRÜFPUNKT – Lern-App

- **Stand 21.10.2026 08:10 UTC:** L2-Gegenprüfung Runde 2 **frei** (`wf_42e62a63-56e`; Mängelrunde fc096a5…65863b8:
  Lizenztexte neben den Whisper-Gewichten, Sprechübung lädt nie still nach, Sprachangaben der Barrierefreiheits-Namen u. a.;
  Rest nur niedrig: @huggingface/jinja-Hinweis → Lizenzverzeichnis L8, Überspringen späterer schrift_*-Hörbeispiele,
  Doppelcode Options-/Wahlgruppe, E2E „Vorrat geräumt“, 5 Tatoeba-IDs mit Koran-4-Gramm in QUELLE.md/TATOEBA_AUSSCHLUSS
  nachtragen). In den Branch gemergt (f5a9d04), KERN §9/PLAN §3.6 angeglichen (8db5dad). **Tor L2 läuft:**
  `scratchpad/tor-l2.sh` → `scratchpad/tor-l2.log` (check, Sprachen, Religion, Wortlaut; Import-Bau + Sweep + Crawl;
  Produktionsbau mit Budget, TBT-Nachmessung und allen Lern-App-E2E; Website-E2E entfällt, da L2 keine gemeinsamen
  Website-Dateien ändert). Danach Push → Preview `success` → FF `main`. Parallel: L3-06 `wf_a48f4bea-ac5`, A1 `wf_4786ad44-05d`.
- **Stand 21.10.2026 07:25 UTC:** Alle Läufe brachen um 06:10 am Sitzungslimit ab (≈ 8 Mio. Tokens in 70 min – das
  Nutzungslimit ist der Engpass; deshalb jetzt höchstens 4 Agenten gleichzeitig und ein Inhalts-Handbuch statt Volllektüre).
  Gesichert: L2-Zusammenführung fertig (7000ba4, Ergebnis `scratchpad/l2/z-ergebnis.json`), L3-06 als ZWISCHENSTAND 37bd915
  (Arbeitsbaum B), Inhalte A1: Wortschatzpläne, Vorkurse de/tr/ar, Entwürfe e01/e02 je Sprache (Zweig `lernapp-inhalte-a1`;
  Rückgaben `scratchpad/l3/a1/ergebnisse-*.json`, Hinweise `hinweise-*.md`). **Laufen:** L2-Gegenprüfung `wf_42e62a63-56e`
  (`args.z` überspringt die Zusammenführung), L3-06-Fortsetzung `wf_a48f4bea-ac5`, A1 weiter `wf_4786ad44-05d`
  (`scratchpad/lernapp-a1-weiter.workflow.js`: Handbuch `_lernapp/werkzeuge/inhalte-handbuch.md` + Tabu-Prüfer je Wortform/
  Sprache, dann je Sprache `lernapp-inhalte.workflow.js` mit `entworfen: [e01, e02]`, Übersetzung beider Richtungen in einem
  Agenten). Bei Abbruch: fertige Einheiten aus `git log` des Inhalts-Zweigs ablesen → neuer Lauf mit `entworfen`/`nur` je
  Sprache. Nach L2-Freigabe: Tor L2 (ohne Website-E2E; TBT ruhig nachmessen), FF `main`.
- **Stand 21.10.2026 05:00 UTC:** L2-Fortsetzung `wf_1f7fcaa5-0e5` läuft (Vorlauf `wf_4f8764fb-9ea` durfte nichts ausführen):
  zuerst die Vorab-Befunde (Test `verwaltung-tickets` für `sprachpruefung`, Spieler „zusätzlich“ 61,2 > 60 KB, `SchriftWahl` ohne
  Überspringen, `GrammatikTipp` lang/dir, E2E auf HEAD), dann Schlussprüfungen einmal, Gegenprüfung. **Parallel L3-07 A1:**
  Arbeitsbaum `.claude/worktrees/inhalte-a1` (Zweig `lernapp-inhalte-a1`, von f2f300f mit den L3-02-Prüfern), Skript
  `scratchpad/lernapp-inhalte.workflow.js` je Zielsprache (Wortschatzplan + Vorkurs → je Einheit Entwurf → Lektorat →
  Übersetzung je Richtung → Rückübersetzung → Schlussprüfung; Commits je Schritt unter `flock scratchpad/git-inhalte.lock`):
  de `wf_4a1a7939-e1c`, tr `wf_0267c2e7-6d3`, ar `wf_12395403-e3e`. Bei Abbruch: Wortschatzplan liegt in
  `scratchpad/l3/a1/plan-<ziel>.json` → neuer Lauf mit `plan` und `nur` (offene Einheiten), nicht Resume.
  **Parallel L3-06 Verwaltung v1:** `wf_610ed0fe-4c5` (`scratchpad/lernapp-l3-06.workflow.js`, Arbeitsbaum B
  `agent-ac6673f9…` nach Merge von Zweig A; Gegenprüfung + höchstens eine Mängelrunde). L3-05 (Thorsten-ONNX, braucht
  ≈ 2 GB Venv für den Export) erst nach dem L2-Merge, wenn die Platte wieder frei ist.
- **Stand 21.10.2026 02:10 UTC:** Container-Neustart während der L2-Zusammenführung. Fertig und gesichert: L2-01, L2-02,
  L2-03/04, L3-02 (`scratchpad/l2/{a1,b1,a2,b2}-ergebnis.json`); Zusammenführung im Arbeitsbaum `agent-a212ace6…` bis f2f300f
  committet. Läuft: `wf_4f8764fb-9ea` (nur Schlussprüfungen der Zusammenführung, dann Gegenprüfung). Danach: Merge in den Branch,
  schlankes Tor (Website-E2E nur bei Änderung gemeinsamer Website-Dateien), FF `main`, dann L3-Inhalte A1.
- **Stand 20.10.2026 22:50 UTC – Tor L1 grün, FF `main`.** check, Import-Bau + Sweep + Crawl (0 × 5xx), E2E Website 1.007 grün,
  Lern-App 53 grün (mit `FUNKTION_LERNAPP=an`, `FUNKTION_LERNAPP_SYNC=an` in der E2E-.env – ohne sie ist die Lern-App im
  Produktionsbau absichtlich aus), Vorschau-Bau 2.394 Seiten, Preview `success`. Wortlaut-Ausnahme L-01 (neue Lern-App-Texte).
  Läuft: L2 + L3-02 `wf_aa43196a-88f`.
- **Stand 20.10.2026 21:35 UTC:** L1 fertig geprüft (Gegenprüfung Runde 2 frei, S-L1 ohne hoch/kritisch; 4 niedrige Reste) und in
  den Branch gemergt (06651b3, gepusht 092786a). **Tor L1 läuft:** `scratchpad/tor-l1-teil1.sh` (check, Sprachen, Religion,
  Wortlaut, Import-Bau + Sweep + Crawl; Integration lief voll in L1 auf demselben Code), danach `scratchpad/tor-l1-teil2.sh`
  (voller E2E, Vorschau-Bau; unter `flock bau.lock`); Ergebnis in `scratchpad/tor-l1.log`. Danach Preview `success` → FF `main`.
  **Parallel gestartet:** L2 + L3-02 `wf_aa43196a-88f` (`scratchpad/lernapp-l2.workflow.js`; A: L2-01 → L2-03/04, B: L2-02 →
  L3-02; dann Zusammenführung, Gegenprüfung).
- **Stand 20.10.2026 19:45 UTC:** L3-01 fertig (95d4d24), L3-04 fertig (0b29073: Sprachdaten gepinnt). Läuft: L1
  `wf_84111110-109`. **Für L3-02 vormerken:** `lernapp:pruefen` mit Auszugs-SHA-Prüfung vor jedem Lauf, „kein examples/ref in
  web/daten/kaikki“, N-Gramm-Wächter (b/c) mit den 38 Tatoeba-IDs aus `web/daten/tatoeba/QUELLE.md` als Positivproben,
  Import-Ausschluss dieser Sätze; CAMeL-Schritt ZIP → Top 50.000 als Skript nachziehen. Volle kaikki-Auszüge (116 MB) bleiben
  bis L5 im Scratchpad.
- **Stand 20.10.2026 19:15 UTC:** L3-01 fast fertig (e2ddb83): Leitfaden, Rahmen de/tr/ar, Kontrast alle 6 Richtungen; Lektorat de
  und ar freigegeben. Läuft: Lektorat tr `wf_51cc17de-642` (zweimal am Inhaltsfilter gescheitert, jetzt ohne Tabu-Lexikon) und L1
  `wf_84111110-109`. Offene niedrige Lektoratspunkte (de: Einwohnerantrag, „Gemeinde“ als Kommune; ar: Wochentag-Wortfeld, ayy,
  Plural-Hinweiswort, Monatsnamenreihe) gehen in die Entwurfsphase L3-07 bzw. LM-02.
- **Automatische Fortsetzung (Nutzer 20.10.2026: „ja“):** stündlicher Routine-Trigger `trig_01RDCdCmysfNvQyECcSRCERP`
  („Lern-App: automatisch weitermachen“, Minute 2) weckt diese Sitzung nach Limit oder Neustart. Am Ende des Laufs (ABSCHLUSS)
  oder auf Wunsch des Nutzers löschen (`delete_trigger`).
- **Stand 20.10.2026 16:45 UTC:** `main` = 685439b (Tor L0). L1: Fundament fertig (1c54bc6), Engine fertig; ZWISCHENSTÄNDE
  8bff270 (L1-03 Oberfläche, ungeprüft) und b007831 (L1-05 nach 509392a/daf34a1). Laufen: L1 `wf_84111110-109` (A1/B1 aus
  `scratchpad/l1/{a1,b1}-ergebnis.json`, A2/B2 mit Fortsetzungs-Vorspann, dann Zusammenführung, Gegenprüfung ∥ S-L1) und
  Rahmen-Rest `wf_c8ce5c1d-a27` (Kontrast tr/ar, Lektorat de/tr/ar; Lektorat zitiert keine Tabu-Wörter wegen Inhaltsfilter).
- **Stand 20.10.2026 14:10 UTC – Tor L0 grün, `main` = 685439b (FF).** ADR 0037–0045 angenommen mit Fortschreibungen;
  L3-E10a (tr/ar „Audio folgt“). Laufen: L1 `wf_6a6cc605-b14`, Rahmen `wf_422b0a15-ec2` (ar, Kontrast, Lektorat). Danach: Rahmen
  prüfen und committen; L1 mergen, volles Tor einmal, FF; dann L2 + L3-02 ff. (Nutzer 20.10.: keine unnötigen Tests/Schleifen –
  Agenten testen nur Betroffenes, volle Suiten einmal im Tor.)
- **Stand 20.10.2026 13:00 UTC:** Branch 09b094d. Platte nach Aufräumen von S3 (Chatterbox-Gewichte, Venv) 7,6 GB frei;
  PostgreSQL + Mailpit laufen. Laufen: `wf_7b96226b-f3b` (L0-Rest: S3-Beleg ∥ Recht → Gegenprüfung,
  `scratchpad/lernapp-l0-rest.workflow.js`), `wf_422b0a15-ec2` (Rahmen ab ar), `wf_6a6cc605-b14` (L1 mit
  `fortsetzungA1` + `b1` aus `scratchpad/l1/b1-ergebnis.json`). Ergebnisse früherer L0-Spikes: `scratchpad/l0/ergebnisse.json`.
- **Stand 20.10.2026 12:45 UTC:** Alle drei Workflows brachen am 17.10. am Sitzungslimit ab; danach Neustart des Workers.
  Gesichert: Beleg S8 + Werkzeug openiti-passagen 1.1.0 (28 Tests grün), Rahmenpläne de/tr (Entwurf vor Lektorat; je 72
  Einheiten, Budgets stimmen). L1-Stand: Engine B1 fertig (`agent-ac6673f9…`), Fundament A1 committet bis 12831cc ohne
  Schlussprüfungen. Weiter: neue Läufe nur für offene Agenten (L0-Rest: S3-Beleg, Recht, Gegenprüfung; Rahmen-Resume ab ar;
  L1 mit `args.b1Datei` und `args.fortsetzungA1`), siehe Plan „Fortsetzung 17.10., 19:30“.
- **Stand 17.10.2026 09:30 UTC:** Branch a312562 (S2 in ADR 0042: COOP/COEP für ganz `/lern-app`, `worker-src 'self'`
  ohne `blob:`, Modelle statisch, Arabisch ohne automatische Rückmeldung mit base). Laufen parallel: `wf_6a33ebb6-16f` (S3, S8,
  Recht, Gegenprüfung), `wf_422b0a15-ec2` (Rahmen → Kontrast → Lektorat) und **L1** `wf_b140f343-3db`
  (`scratchpad/lernapp-l1.workflow.js`; Arbeitsbäume A = `agent-a212ace6…` Fundament → Oberfläche → Zusammenführung,
  B = `agent-ac6673f9…` Engine → Pakete/Sync; Bau unter `flock scratchpad/bau.lock`; PostgreSQL + Mailpit laufen). Nach
  Abbruch: Arbeitsbäume als ZWISCHENSTAND committen, alle drei per `resumeFromRunId` fortsetzen.
- **Stand 17.10.2026 09:10 UTC:** Beide Workflows brachen am 16.10. abends am Sitzungslimit ab. Gesichert: Beleg S2 (Whisper),
  Inhaltsleitfaden (`_lernapp/lehrplan/INHALTSLEITFADEN.md`, `web/inhalte/lernapp/rahmen/leitfaden.json`). Läuft: Fortsetzung
  `wf_6a33ebb6-16f` (S3, S8, Recht, Gegenprüfung) und `wf_422b0a15-ec2` (Rahmen de/tr/ar → Kontrast → Lektorat) per
  `resumeFromRunId`. Danach wie unten (ADR 0042/0045/0040 fortschreiben, Tor L0, FF `main`, L1 starten).
- **Stand 16.10.2026 19:05 UTC:** Branch ddf3f38 (gepusht; `main` = e9aab6e). Erledigt seit 18:45: Belege S1/S6, S4, S5, S7
  committet; Abhängigkeiten nach PLAN §12 gepinnt (8ba44d9, 1bff4d9: ts-fsrs, idb, fastest-levenshtein, noto-sans-arabic,
  fast-check, fake-indexeddb); Spike-Entscheidungen S1/S4/S5/S6/S7 als „Fortschreibung“ in ADR 0037/0038/0039/0044/0045,
  KERN §9 Budgets (eigener Anteil über Next-Grundstock; Spieler-Route ≤ 210 KB). Läuft: `wf_6a33ebb6-16f` (S2, S3, S8,
  Recht, Gegenprüfung). **Danach:** Belege S2/S3/S8 + Rechtsentwürfe committen; ihre Entscheidungen in ADR 0042/0045/0040
  übernehmen; Gegenprüfungsmängel beheben; ADR-Status „angenommen“; Tor L0 (Religion, Wortlaut, Unit); FF `main`; dann
  PostgreSQL/Mailpit starten (`scratchpad/e2e-echt/start.sh`) und L1 per Workflow
  `scratchpad/lernapp-l1.workflow.js` (Arbeitsbäume A = `agent-a212ace6…`, B = `agent-ac6673f9…`; Bau nur unter
  `flock scratchpad/bau.lock`).
- **Stand 16.10.2026 18:45 UTC:** `main` = e9aab6e. Workflow `wf_6a33ebb6-16f` brach am Sitzungslimit ab: fertig sind S1+S6
  (Code im Arbeitsbaum `agent-a212ace6…`, ZWISCHENSTAND b7cc3ad/072c65a), S4, S5 und S7; Belege dazu in `_lernapp/belege/`
  committet. Läuft: Fortsetzung desselben Workflows per `resumeFromRunId` (S2 Whisper, S3 Stimmen, S8 Quellen lokal,
  Rechtsentwürfe, Gegenprüfung). Danach: Belege und Entwürfe committen, Spike-Entscheidungen in ADR 0037/0038/0044 und
  KERN §9 (Budgets als Anteil über dem Next-Grundstock ≈ 136 KB gz), Tor L0, FF `main`, L1.
- **Stand 16.10.2026 15:15 UTC:** `main` = 5a41a56 (Werkstatt + ADR 0037–0045). Läuft: Workflow „lernapp-l0-spikes“
  `wf_6a33ebb6-16f` (S1+S6 Code im Arbeitsbaum `agent-a212ace6…`, S4/S5 Recherche, S2 Whisper, S7 Sprachdaten, S3 Stimmen, S8
  Quellen lokal, Rechtsentwürfe; danach Gegenprüfung). Nach Abbruch: Arbeitsbaum als ZWISCHENSTAND committen, Workflow mit
  `resumeFromRunId` fortsetzen. Danach: Belege committen, Entscheidungen in die ADRs, Tor L0, FF `main`, L1.
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
