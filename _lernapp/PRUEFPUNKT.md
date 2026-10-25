# PRÜFPUNKT – Lern-App

- **Stand 25.10.2026 07:55 UTC:**
  - **Prüfer-Mängelrunde frei:** bbdae93c, Gegenprüfung 2 ohne Mangel kritisch, hoch oder mittel. Gemergt und auf `main` (645e76cd). Damit ist das Paket Prüfer-Fehlalarme abgeschlossen.
  - **Neu:** `lernapp-inhalte.workflow.js` kennt `args.seriell` (Einheiten nacheinander, nur 1 Agent zur Zeit) für die Taktregel. Sicherung: `….bak-seriell`.
  - **Neu gestartet:** B1 ar `wf_e5e700c1-be1`, seriell.
    - `entworfen` e01–e03, `lektoriert` e01.
    - e04 setzt den Teilentwurf f6faaa73 fort.
  - **Es laufen:** B1 de `wf_335727f4-a16` (2 Plätze) und B1 ar (1 Platz).
  - **Taktung:** Fenster bis 11:10. Auslastung 0,13 um 07:51, Taktlinie 0,30.
  - **Warteschlange:** B1 tr, B2 de.

- **Stand 25.10.2026 07:25 UTC – nach Leerlauf fortgesetzt:**
  - **Leerlauf 00:41–07:23:** Mehrere Worker-Neustarts unterbrachen jedes Mal die Freigabe des Plan-Modus. Das Fenster 01:00–06:00 blieb ungenutzt (Auslastung 0,03).
  - **Neu gestartet:**
    - B1 de `wf_335727f4-a16`: übersprungen werden `lektoriert` e01–e16 und `uebersetzt` e01–e09. Offen: Übersetzungen e10–e16, Rückübersetzungen, Schlussprüfung.
    - Prüfer-Mängelrunde `lernapp-pruefer-maengel` (1 Agent, danach Gegenprüfung 2).
  - **Taktung:** Fenster 06:00–11:00, Auslastung 0,03 um 07:23 bei einer Taktlinie von 0,25.
  - **Warteschlange:** B1 ar, B1 tr, B2 de, sobald die Mängelrunde fertig ist und die Auslastung es trägt.

- **Stand 25.10.2026 00:42 UTC – vor dem Reset angehalten (Taktregel):**
  - Auslastung 0,96 um 00:39; das Fenster wäre gegen 00:47 leer gewesen.
  - B1 de `wf_22e98787-c97` direkt nach dem Commit 5f12bf3c angehalten; Arbeitsbaum sauber.
  - **B1 de fertig:**
    - Entwürfe und Lektorate e01–e16.
    - Übersetzungen e01–e09 in beiden Richtungen.
    - Offen: Übersetzungen e10–e16, alle Rückübersetzungen, Schlussprüfung.
  - **Nach dem Reset 01:00 (neues Fenster), Warteschlange in dieser Reihenfolge, nach der Taktregel (≈ 2 Agenten):**
    1. **B1 de fortsetzen:** Args wie `wf_22e98787-c97`, aber `lektoriert` e01–e16 und `uebersetzt` e01–e09.
    2. Prüfer-Mängelrunde (`scratchpad/lernapp-pruefer-maengel.workflow.js`, Args `{scratchpad}`; 1 Agent, erst wenn Luft ist).
    3. B1 ar.
    4. B1 tr.
    5. B2 de.

- **Stand 24.10.2026 23:35 UTC – Container-Neustart ≈ 23:28, B1 de neu gestartet:**
  - **B1 de seit 20:05 (Arbeitsbaum sauber):**
    - Entwürfe e11–e16 fertig, damit e01–e16.
    - Lektorate e01, e02 und e09–e14 fertig, damit e01–e14.
    - Übersetzungen e03–e08 in beiden Richtungen fertig.
  - **Neu gestartet:** B1 de `wf_22e98787-c97`.
    - Übersprungen: `entworfen` e01–e16, `lektoriert` e01–e14, `uebersetzt` e03–e08.
    - Offen: Lektorat e15/e16, Übersetzungen e01/e02 und e09–e16, alle Rückübersetzungen, Schlussprüfung.
  - **Taktung:**
    - Auslastung 0,76 um 23:30, Taktlinie 0,63, Reset 01:00.
    - Kontrolle um 00:40 (`trig_01NhNvX1yWuSHAoP9iTD4GY4`): bei ≥ 0,93 direkt nach dem nächsten Commit anhalten.
  - **Warteschlange** unverändert (siehe unten): Prüfer-Mängelrunde, B1 ar, B1 tr, B2 de. Start nach dem Reset nach der Taktregel.

- **Stand 24.10.2026 20:55 UTC – A1 und A2 live (L3-E15):**
  - **Freigabe:** Der Nutzer hat den Commit ausdrücklich erlaubt, „auch für alle zukünftigen Punkte“.
    - A1 de/tr/ar: 3bd40c46.
    - A2 de/tr/ar: 304ec310.
    - Inhaltszweig gemergt (a3521abe) und auf `main`.
  - **Nachprüfung `tor-a1a2` grün:**
    - check 3.563, Sprachen, Religion, Wortlaut.
    - `lernapp:pruefen`: 302 Dateien, 0 blockierend, 0 menschlich_klaeren, 288 Warnungen.
    - Import in die Bau-Datenbank: 269 Dateien, 94.694 Einträge.
  - **Live** (https://igmg-wetzlarer.vercel.app/lern-app/pakete/tr-aus-de): 27 Einheiten (A1 mit Vorkurs + A2), `hinweis: true`.
    B1 und Wissen bleiben verborgen (Entwurf).
  - **Künftig:** Jede Stufe geht nach ihrer Schlussprüfung auf `automatisch_geprueft`. Danach Inhaltszweig mergen, schlanke
    Nachprüfung, Push.

- **Stand 24.10.2026 20:10 UTC – nach dem Limit (≈ 17:20, Reset 20:00) und einem zweiten Plan-Modus fortgesetzt:**
  - **Fertig seit 17:15:**
    - Prüfer-Fehlalarme umgesetzt (2362830f im Inhaltszweig).
      - menschlich_klaeren sinkt von 94 auf 0, Warnungen von 697 auf 286.
      - Echte Treffer bleiben Treffer: Gegenproben mit Bier/Wein samt Klitika, imām ohne Hamza, bombardıman.
      - Religionswächter unverändert.
    - B1-Lektorate: de e03–e08, tr e03–e08, ar e01.
  - **Durch den Plan-Modus (≈ 16:13–16:39) nur als Plan erhalten:**
    - Lektorat de/tr e01–e02 sowie die Entwürfe de e11–e16, tr e09–e16 und ar e02–e16.
    - Zuordnung in `scratchpad/l3/b1/planmodus-plaene.md`.
  - **Neu gestartet:**
    - B1 de `wf_617404b6-0c6`.
    - B1 tr `wf_29e1505e-683`.
    - B1 ar `wf_f769aa01-ec0`.
    - B2 de `wf_efd14149-f78`.
    - Prüfer, nur Gegenprüfung: `wf_7cde5edd-950`.
  - **20:12 – Taktregel (Nutzer: nicht mehr Agenten, als das Limit trägt):**
    - Auslastung 0,05 nach 9 Minuten bei ≈ 8 Agenten; das Fenster wäre damit gegen 22:50 leer gewesen.
    - Gestoppt: B1 tr `wf_29e1505e-683` (Entwürfe e09/e10 erst angefangen) und B2 de `wf_efd14149-f78` (Plan erst angefangen).
    - Beide warten; wieder starten mit denselben Args, sobald die Auslastung unter der Taktlinie liegt.
    - Es laufen B1 de, B1 ar und die Prüfer-Gegenprüfung.
    - Die Regel steht in CLAUDE.md und im stündlichen Trigger.
  - **20:28 – nachgemessen:**
    - Auslastung 0,17 um 20:26 bei ≈ 5 Agenten (≈ 0,7 %/min); die Taktlinie liegt bei 0,08.
    - B1 ar an der Einheitengrenze gestoppt, nach den Entwürfen e02 (817f1c5e) und e03 (b9074ac7).
    - Es läuft nur noch B1 de (2 Plätze).
    - **Warteschlange** in dieser Reihenfolge, jeweils erst wenn die Auslastung unter der Taktlinie liegt:
      1. Prüfer-Mängelrunde (1 Agent): `scratchpad/lernapp-pruefer-maengel.workflow.js`, Args `{scratchpad}`.
      2. B1 ar (`entworfen` e01–e03, `lektoriert` e01; e04 ist ZWISCHENSTAND f6faaa73 – im Hinweis: Teilentwurf fortsetzen, nicht neu).
      3. B1 tr (Args wie `wf_29e1505e-683`).
      4. B2 de (Args wie `wf_efd14149-f78`).
  - **Prüfer-Gegenprüfung (`wf_7cde5edd-950`): keine Freigabe**, 1 Mangel „mittel“ (Urteil in `scratchpad/pruefer-fa/urteil1.json`):
    - Weil Register-Nebeneinträge gar nicht mehr melden, verstummen auch 3 echte derbe bzw. sexuelle Formen (tr 2, de 1), die im Inhalt 0-mal vorkommen.
    - Behebung: den Hinweis behalten, wenn die markierten Lesarten derselben Ausgabe überwiegen.
    - Dazu niedrig: die Verluste bei ǧinsiyya (Adjektivform), R-06/R-08 ohne Artikel und li-ḥaǧǧ im Handbuch nennen; den Test mit -hu an Tāʾ marbūṭa berichtigen.

- **Stand 24.10.2026 16:50 UTC – Plan-Modus der Umgebung (≈ 16:20–16:40) beendet:**
  - Die vier Inhaltsläufe haben den Plan-Modus überstanden und schreiben wieder (z. B. Lektorat de.b1.e03, 3d87f6a6); kein Neustart nötig.
  - Prüfer-Fehlalarme: Der erste Lauf (`wf_9ea7a6d0-99a`) war blockiert und hat nichts geändert, aber die Ursachen analysiert:
    - ar: zuerst das ganze bekannte Wort (kabīra, baʿīd, ǧinsiyya).
    - R-10: Hamza-verträglicher Vergleich nur in religionsbezug.
    - de: Kompositum-Grenze; tr: Endungsgrammatik.
    - Register: Nebeneinträge melden nicht.
    - Neu gestartet mit dieser Analyse als Fortsetzung: `wf_eb033b1b-1a6`.
  - **17:15 – A2 ar fertig** (Schlussprüfung 8ce35c2f):
    - 14 Einheiten, 900/900 Lemmata, 3.685 Sätze, 2.038 Aufgaben; 0 blockierend, 0 menschlich_klaeren.
    - Die im Plan-Modus nur geplanten Rückübersetzungs-Korrekturen e05–e11 (115) hat die Schlussprüfung eingespielt.
    - Figuren-Kanon angeglichen; tr-Monatsnamen nach TDK.
    - Damit ist A2 in allen drei Zielsprachen fertig.
  - **Neu gestartet:** B2 de `wf_b4af519e-267` (Wortschatzplan gegen A1–B1, dann Einheiten).

- **Stand 24.10.2026 16:20 UTC – nach dem Limit (≈ 12:30, Reset 15:00; Neustart verspätet) fortgesetzt:**
  - **Fertig seit 10:35:**
    - L8-02: Gegenprüfung Runde 2 frei, gemergt (29518e3b). ABNAHME Z-L07 an KERN §9 angeglichen und erfüllt (28ef4aec).
      Nachprüfung grün: check 3.550, Sprachen, Religion, Wortlaut.
    - Wissen: alle 26 nicht zurückgestellten Einheiten belegt. Prüfübersicht `_lernapp/berichte/wissen-pruefuebersicht.md`
      im Inhaltszweig (aec9b868, nachgezählt a5057899): 2.124 Aussagen, 4.603 Belege, 1.041 Quizfragen.
    - A2 ar: Übersetzung 14/14, Rückübersetzung e01–e04.
    - B1 de: Entwurf e01–e10.
    - B1 tr: Entwurf e01–e07.
    - B1 ar: Plan.
  - **Neu gestartet:**
    - A2 ar `wf_862e1c91-ba6`: Rückübersetzung e05–e14, Schlussprüfung.
    - B1 de `wf_7c8c3db2-799`.
    - B1 tr `wf_aa554cf8-939`.
    - B1 ar `wf_64a40a30-ea4`.
    - Prüfer-Fehlalarme `wf_9ea7a6d0-99a`: Klitika, Teilwörter und Register in tabu/religionsbezug, mit Gegenprobe und Gegenprüfung; Religionswächter unverändert.

- **Stand 24.10.2026 10:35 UTC – nach dem Limit (≈ 07:00, Reset 10:00) fortgesetzt:**
  - **Fertig:**
    - A2 tr Schlussprüfung (da8c5eb6): A2 de und tr sind komplett.
    - Nachprüfung SL2-Rest grün: check 3.534, Integration 3.847, Sprachen, Religion, Wortlaut.
    - L8-02 Bericht (a0dafd59 im Arbeitsbaum l8):
      - Budgets eingehalten, Zugänglichkeit 100 auf 25 Routen.
      - INP ≤ 200 ms bei CPU ×6, axe 0 Befunde.
      - Lasttest mit 200 Konten: 0 % Fehler, Idempotenz erfüllt.
      - CLS-Behebung mit Regeltest.
    - Wissen: Nachprüfung aufbau.e03/e04 (Neufassung Nūr al-Īḍāḥ), Belegprüfung vertiefung.e02/e03, Entwürfe vertiefung.e06–e08.
      Damit sind alle 26 nicht zurückgestellten Einheiten entworfen.
    - A2 ar: Übersetzung e01–e10.
    - B1 de: Plan (1.300 Lemmata) und Entwurf e01–e04.
    - B1 tr: Plan (1.284 Lemmata) und Entwurf e02; ZWISCHENSTAND e01 842b8764.
  - **Neu gestartet:**
    - L8-02, nur Gegenprüfung: `wf_79c7e194-b7c`.
    - A2 ar `wf_9a516d04-ac5`.
    - Wissen `wf_456ab194-786`: Belegprüfung vertiefung.e06–e08.
    - B1 de `wf_9be04472-043`.
    - B1 tr `wf_76e3ba35-b92`.
    - B1 ar `wf_9f4d5430-d19`: neu, mit Plan.

- **Stand 24.10.2026 05:45 UTC – nach dem Limit (≈ 20:50, Reset 00:00) fortgesetzt:**
  - **Fertig seit 19:15:**
    - A1-Schlussprüfungen de/tr/ar: 0 blockierend; 87613b1e, 2a770dab, 9ca48e68.
    - A2 de ganz fertig mit Schlussprüfung (98ca45a4).
    - A2 tr: Rückübersetzung 14/14.
    - A2 ar: Lektorat 14/14, Übersetzung e01–e04.
    - Wissen: Belegprüfung aufbau.e05–e09 und vertiefung.e01; Entwurf vertiefung.e03.
    - SL2-Rest: Gegenprüfung frei. Gemergt (ac219eb0) und auf `main`; Nachprüfung `tor-sl2r` läuft.
  - **A1-Freigabe:**
    - Der Nutzer hat „mit Hinweis freischalten“ gewählt.
    - Der Status `automatisch_geprueft` ist in 120 A1-Dateien in `inhalte-a1` gestaged.
    - Den Commit hat das Sicherheitssystem verweigert; er wartet auf die ausdrückliche Erlaubnis des Nutzers. Agenten committen nur eigene Pfade.
  - **Befund Wissen:** Der OpenITI-Text von Nūr al-Īḍāḥ (1985) ist im Zakat- und Hadsch-Teil eine moderne Neufassung.
    - aufbau.e05/e06 sind umgestellt.
    - aufbau.e03/e04 werden nachgeprüft.
    - Ob die Ausgabe dort als Nūr al-Īḍāḥ gelten darf, entscheiden Menschen (LM-33).
  - **ZWISCHENSTÄNDE:** 97fefbf2 (Schlussprüfung tr a2) und 4fd1a56c (L8-02). `l8/web/.next` gelöscht; Platte 4,0 GB.
  - **Neu gestartet:**
    - L8-02 `wf_ff02609b-5e6`.
    - A2 tr Schlussprüfung `wf_3280987a-763`.
    - A2 ar `wf_7d07ca5d-7b8`: Übersetzung ab e05.
    - Wissen `wf_7ea03fc1-7b0`: Belegprüfung vertiefung.e02/e03, Nachprüfung aufbau.e03/e04, Entwurf vertiefung.e05–e08.
    - **B1 de** `wf_de00d99a-aa8`: Wortschatzplan, Entwürfe, ….

- **Stand 23.10.2026 19:15 UTC – nach dem Limit (≈ 15:45, Reset 19:00) fortgesetzt:**
  - **Seit 14:40 fertig:**
    - A1: alle Rückübersetzungen; nur noch die Schlussprüfungen offen.
    - A2: tr übersetzt 14/14; de übersetzt 14/14, Rückübersetzung e01–e06; ar Lektorat e01–e12.
    - Wissen: Entwürfe aufbau.e08/e09 und vertiefung.e01/e02.
    - SL2-Rest inhaltlich vollständig (bis bc19b357): Einwilligung `lernapp` in Mein Bereich mit Folgen und Export,
      Ende des Eltern-Kind-Bezugs, N-1 in der Tiefe, Altkommentare, Unterlagen, E2E, Rechte-Matrix.
    - L8-02: Messlauf gebaut (099246e6).
  - **ZWISCHENSTAND:** bd7eb8c0 (Lektorat ar.a2.e13, Rückübersetzung tr.a2.e01).
  - **Neu gestartet:**
    - Code `wf_8ab7649c-4f4`: SL2-R direkt zur Gegenprüfung; L8-02 Messung, Behebungen, Bericht.
    - A1 `wf_6ef18884-7cf`: nur Schlussprüfungen.
    - A2 tr `wf_dde03572-87d`: Rückübersetzung.
    - A2 de `wf_2024ffa1-d8b`: Rückübersetzung ab e07.
    - A2 ar `wf_06bd2e7e-e2d`: Lektorat e13/e14, dann Übersetzung.
    - Wissen `wf_35720fcc-b98`: Belegprüfung aufbau.e05–e09 und vertiefung.e01/e02; Entwurf und Belegprüfung vertiefung.e03.

- **Stand 23.10.2026 14:45 UTC – nach dem Limit (≈ 10:05, Reset 14:00) fortgesetzt:**
  - **S-L2-Auflagen:** frei, gemergt (0569a47f), auf `main`. Nachprüfung `tor-sl2` grün: check 3.533, Integration 3.815,
    Sprachen, Religion, Wortlaut. L-03 deckt die Lern-App-Zeilen L-37…L-49 im Löschkonzept (2e44bd7b). PLAN §19 nachgeführt.
  - **ZWISCHENSTÄNDE:**
    - Wissen: `islam.aufbau.e08` (95cbeced).
    - SL2-Rest: 7f2e22ab, ccbf72a0.
    - L8-02: Messwerkzeuge d860551b.
  - **Neu gestartet:**
    - Code `wf_b9da0927-417`: L8-02 Leistung und SL2-Rest (Einwilligung `lernapp` erteilen/widerrufen, N-1 in der Tiefe), je mit Gegenprüfung.
    - A1 `wf_3cf13d0f-0b6`: Rückübersetzung de e06–e12, tr e07–e12, ar e12, dann Schlussprüfungen.
    - A2 tr `wf_bfb3b7c8-ff3`: Übersetzung ab e11.
    - A2 de `wf_2805cc83-c2f`: Übersetzung ab e13.
    - A2 ar `wf_d81814c3-758`: Lektorat ab e06, dann Übersetzung.
    - Wissen `wf_e78497ec-5c4`: Belegprüfung aufbau.e05–e07, Entwurf + Belegprüfung e08, e09, vertiefung.e01–e03.

- **Stand 23.10.2026 09:20 UTC – nach dem Limit (≈ 05:40, Reset 09:00) fortgesetzt:**
  - **Nachprüfung `tor-sec` (93b9fe9d):**
    - check (3.531), Integration (3.797), Sprachen, Religion, Bau und Lern-App-E2E (102, mit Korrekturweg) grün.
    - Wortlaut war rot, nur wegen der Fortschreibung des Entwurfs `dsfa-lernapp.md`. Neue Ausnahme L-03 für die eigenen
      Rechtsentwürfe der Lern-App (a154f9ee); seitdem rc=0, auf `main`.
  - **Neu gestartet:**
    - SL2-Auflagen `wf_24b447df-5a8`: Fortsetzung ab ccba9991 → Bau → Gegenprüfung.
    - A1 `wf_84665c23-405`: ar-Übersetzung e12 und Rückübersetzungen.
    - A2 tr `wf_1621e466-9c1`: Übersetzung ab e07.
    - A2 de `wf_e2d4d3d4-b46`: Übersetzung ab e09.
    - A2 ar `wf_4ab22015-647`: Entwurf ab e13; e13 als ZWISCHENSTAND fbdaf58f.
    - Wissen `wf_cfbfeb2d-fd6`: Belegprüfung aufbau.e05, dann Entwurf und Belegprüfung von aufbau.e06–e09 und
      vertiefung.e01–e03; vertiefung.e04 (siyar) bleibt zurückgestellt.
  - **Stand vor dem Limit:**
    - A1: ar übersetzt e01–e11.
    - A2: tr übersetzt e01–e06, de übersetzt e01–e08, ar Entwurf e01–e12.
    - Wissen: grund e01–e11 und aufbau e01–e04 belegt.

- **Stand 23.10.2026 05:00 UTC – SICHERHEITSUPDATE + Fortsetzung:** `next@16.4.0` war von zwei kritischen
  (GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr) und einer hohen Lücke (GHSA-p3m5-59mp-jv5r) betroffen; deshalb brach der
  Upgrade-Hinweis von Next Agenten-Bauten ab. Update auf 16.4.2 (93b9fe9d, Patch übernommen, ADR 0001 + ENTSCHEIDUNGEN L3-E14)
  zusammen mit L5-03 (gemergt 8a01d44b; Runde 2 nur „E2E nicht gelaufen“) auf `main`. Nachprüfung `scratchpad/tor-sec.sh`
  läuft (check, volle Integration, Sprachen, Religion, Wortlaut, Bau + Lern-App-E2E inkl. Korrekturweg). S-L2 `wf_65accf27-c57`
  (nur Bericht). Inhalte neu: A1 `wf_af7506e9-a2e`, A2 tr `wf_d2839e45-5c2`, A2 de `wf_f9b3049c-752`, A2 ar `wf_413afa87-b89`,
  Wissen `wf_c2ab81ac-bb7` (Belegprüfung grund.e09–e11, aufbau.e01–e05). Stand vor dem Limit (19:55): A1 Lektorat ar 12/12,
  Übersetzung ar e01–e05; A2 tr/de Lektorat 14/14, Übersetzung tr e01–e02, de e01–e03; A2 ar Entwurf e01–e08; Wissen
  Entwürfe grund e01–e11, aufbau e01–e05.
- **Stand 22.10.2026 19:00 UTC – nach dem Limit (≈ 15:07, Reset 18:00) fortgesetzt.** Seit 14:07 fertig: A1 Übersetzung tr
  12/12, Rückübersetzung tr e01–e06; A2 tr Lektorat e01–e10, A2 de Lektorat e01–e13, A2 ar Entwurf e01–e04; Wissen Belegprüfung
  grund.e07/e08 (Taharah/Salah komplett), Entwürfe grund.e09–e11 (akaid) und aufbau.e01 (sawm). Neu gestartet: Code
  `wf_6009b738-73c` (L5-03: Bau-Agent brach dreimal am Limit ab; Stand bb4d8ecb wird als `bau` übergeben → Gegenprüfung,
  Mängelrunde, Runde 2, S-L2), A1 `wf_7a7acd04-a95`, A2 tr `wf_59719522-a89`, A2 de `wf_b085f11b-25f`, A2 ar
  `wf_172e0f41-ed5`, Wissen `wf_beaac09f-25a` (Belegprüfung grund.e09–e11/aufbau.e01, Entwurf + Belegprüfung aufbau.e02–e05).
- **Stand 22.10.2026 14:30 UTC – Wissen Taharah/Salah komplett:** islam.grund.e01–e08 entworfen und belegt (Belegprüfung e07
  9aeb7618, e08 83548b3d; offene Punkte je Einheit für die zwei religiösen Prüfenden in den Rückgaben). Nächste Wissens-Runde
  `wf_5335754d-111`: islam.grund.e09–e11 (Glaube, maturiditisch) und islam.aufbau.e01–e05. Übrige Läufe wie im Eintrag darunter.
- **Stand 22.10.2026 14:20 UTC – nach dem Limit (≈ 11:17, Reset 13:00) fortgesetzt:** L4-03 + Restliste (D) frei (Runde 2 nur
  niedrig) und gemergt (2691947c; Typen, Lern-App-Unit 1.880, betroffene Integration grün nach angepasster Paket-Erwartung).
  Seit 10:22 fertig: A1 Übersetzung tr e03–e08; A2 tr und de Entwurf 14/14, Lektorat de e01–e03; A2 ar Plan (900 Lemmata);
  Wissen Entwurf e08, Belegprüfung e01–e06. Neu gestartet: Code `wf_4afbc8e5-8a0` (nur L5-03, Bau bis 7f282514 fertig → Abschluss,
  Gegenprüfung, S-L2; Bau löscht `.next/server` sofort), A1 `wf_5bd88056-51e`, A2 tr `wf_6308344a-216`, A2 de `wf_6776c4e2-d8d`,
  A2 ar `wf_916462a9-3a6`, Wissen `wf_666fb295-949` (neu `belegt` überspringt die Belegprüfung e01–e06). Platte 3,7 GB; Bau
  und Lern-App-E2E der Nachprüfung gemeinsam mit L5-03.
- **Stand 22.10.2026 10:25 UTC – nach dem Limit (≈ 05:05, Reset 08:00) fortgesetzt:** Nachprüfung `tor-l6.sh` auf 39479a4f:
  check, Sprachen, Religion, Wortlaut, Bau und Lern-App-E2E (99) grün; Integration grün bis auf die veraltete
  Startklar-Erwartung (behoben d933267e). Neu gestartet mit Fortsetzung: Code `wf_17f4825f-3e9` (B = L5-03 ab ZWISCHENSTAND
  df44ca6a; D = L4-03 ab d79c5624, Restliste a–d fertig 13ecc675…d4f4b9d6), A1 `wf_2d4b54ef-b43` (Übersetzung de 12/12,
  Rückübersetzung de e01–e05 übersprungen; neu `rueckgeprueft`), A2 tr `wf_c72a6ddc-e7a` (Entwurf e01–e08 fertig), A2 de
  `wf_34ea39f3-580` (Entwurf e01–e10 fertig), A2 ar `wf_8e47d992-8e7` (Plan, Arbeitsordner `scratchpad/l3/a2/plan-ar-werk`),
  Wissen `wf_1c6b2621-2c1` (Entwürfe e01–e07 fertig → Belegprüfung; e08 setzt die Teildatei fort). Platte 3,9 GB.
- **Stand 22.10.2026 04:50 UTC – L6-Code und L8-03/04 frei und auf `main`:** L8-03/04 (Gegenprüfung Runde 2 frei; ad61cd9c +
  Lizenz bei Tatoeba-Nennungen a1e0106c), L6-02/03 Zwei-Prüfer-Freigabe (Runde 2 frei, Migration 0022 lernapp_tag_kurs, S-L3 M-1;
  6bec2eb0) und L6-05/06 Koran-Arabisch-Pfad (Runde 2 frei; 39479a4f, Hash/Status der Koran-Bedeutung nur aus
  `lib/lernapp/paket/koran`). Beim Merge gefunden und behoben: Tabellenzahl 131, Rechte-Matrix ohne `religioesPruefen`,
  `eintragEntsperren` und `lernapp-gruppe` (seit L3-06b/L7 rot). `main` = 39479a4f. Nachprüfung `scratchpad/tor-l6.sh` läuft
  einmal (check, volle Integration, Sprachen, Religion, Wortlaut, Bau + Lern-App-E2E). **Restliste (niedrig, späteres
  Nacharbeitspaket):** `raeumeAuf` im Vorrat nie aufgerufen (alte Paketfassungen auf der Quellen-Seite); Prüfweg für
  Sprachkurs-Einträge mit Religionsbezug, Wissens-Tipps, Formelliste, Wurzeltabelle (bis dahin gesperrt); Warnung bei
  Rollenkombination Prüfung + Administration/Befunde; Verweis bei Überlauf in /verwaltung/freigaben; Verfasser = nur letzte
  Speicherung; E2E Koran-Lektion mit zwei Freigaben; Umfang Koran-Pfad 40 statt ≈ 10 Einheiten (Teil 30: 820 von 1.420 Formen
  fehlen) – Entscheidung offen. Läuft weiter: A1 `wf_a71357bf-3d3`, A2 tr `wf_6fd0e1b9-fdb`, A2 de `wf_d74ea6c7-421`, Wissen
  `wf_4a678e4a-1d2`. **Neu gestartet (04:48):** Code `wf_04a7453f-2f1` (`scratchpad/lernapp-l5-code.workflow.js`; B = L5-03
  Korrekturweg der Lehrkraft, D = L4-03 Geschichten/Lesen/Abzeichen + Restliste a–d; danach S-L2 nur Bericht) und A2 ar
  `wf_ca33604e-544` (Plan `scratchpad/l3/a2/plan-ar.json`, dann Einheiten).
- **Stand 22.10.2026 04:15 UTC – nach dem Limit (21.10. 23:05) fortgesetzt:** A1 `wf_a71357bf-3d3` (Lektorat ar e01–e10 fertig,
  Übersetzung tr e01–e02/de e01–e08 fertig), A2 tr `wf_6fd0e1b9-fdb` (Entwurf e01–e02; e03/e04 Teildateien), A2 de
  `wf_d74ea6c7-421` (Entwurf e01–e04), L6 Wissen `wf_4a678e4a-1d2` (Entwürfe islam.grund.e01–e04 übersprungen → Belegprüfung;
  e05–e08 Entwurf + Belegprüfung), L6-Code `wf_26fa68e8-998` (B ZWISCHENSTAND c6cf0d6a, C 91998b9e; Gegenprüfung 1 aus
  `scratchpad/code/*-urteil1.json` übersprungen, nur Mängelrunde mit `fortsetzungM` + Runde 2), L8-03/04 `wf_d113d6eb-3e3` (D bis
  e00589a9, ebenso). Neue Skript-Argumente: `urteil1`, `fortsetzungM` (Code), `entworfen` (Wissen). Dienste gestartet; Platte 4,2 GB.
- **Stand 21.10.2026 22:15 UTC – Pause beendet (Nutzer: „proceed“), alle Läufe mit Fortsetzung neu:** A1 `wf_ffae8228-28c`,
  A2 tr `wf_1cf78737-174`, A2 de `wf_e29686b6-423`, L6-Code `wf_2b3cf6ea-6c8` (B ab 6b44dbd inkl. M-1 aus S-L3, C ab 64eabf5),
  L6 Wissen `wf_45c0afe2-3ea` (Lehrplan 86bbf89 übersprungen, Entwürfe islam.grund.e01–e08), L8-03/04 `wf_9b549efc-4d5` (D ab
  e2e4c6e). S-L3-Bericht übernommen (1e55d44). Trigger wieder an. Platte 4,4 GB (pnpm-Store bereinigt, Metadaten-Cache gelöscht).
- **Stand 21.10.2026 20:10 UTC – PAUSE auf Wunsch des Nutzers** („jetzt kannst du, nachdem diese fertig sind, Pause machen“):
  Die sechs laufenden Läufe dürfen zu Ende laufen; danach nur noch sichern (ZWISCHENSTAND/Ergebnisse, Commit, Push), KEINE neuen
  Läufe. Die stündliche Fortsetzung `trig_01RDCdCmysfNvQyECcSRCERP` ist ausgeschaltet. Weiter erst auf Nachricht des Nutzers –
  dann ab diesem Eintrag und dem darunter (Läufe, Fortsetzungsmuster) fortsetzen und den Trigger wieder einschalten.
- **Stand 21.10.2026 20:00 UTC – volle Parallelität (Nutzer: „Kontingent ausnutzen, so schnell wie möglich“):** zusätzlich zu A1
  `wf_12f884de-7f4` laufen A2 tr `wf_fd62088d-a9a` und A2 de `wf_0721383a-474` (`lernapp-inhalte.workflow.js`, Stufe a2,
  Pläne in `scratchpad/l3/a2/`), L6-Code `wf_4959ff23-faa` (B: L6-02/03 Zwei-Prüfer + Oberfläche; C: L6-05/06 Koran-Pfad,
  Wurzel-Werkzeug), L6-Inhalte `wf_58942dda-d6b` (Quellen lokal, Lehrplan 28 Einheiten, Entwürfe Taharah/Salah mit
  Belegprüfung, im Arbeitsbaum `inhalte-a1`), L8 `wf_938d7ff4-4a8` (S-L3-Bericht nach `scratchpad/s-l3/`, D = `.claude/worktrees/l8`
  L8-03/04 Lizenzen, Mengen, GO-LIVE, Handbücher). ≈ 12 Agenten gleichzeitig. Bei Abbruch: Arbeitsbäume ZWISCHENSTAND, je Lauf
  neu mit `fortsetzung`/`entworfen`/`lektoriert`/`uebersetzt`.
- **Stand 21.10.2026 19:45 UTC – L7 fertig:** L7-01 Spielelemente (41 Abzeichen, Tagesziel XP/Lektionen, Serie mit Pausetagen
  und Ruhezeit, Abschluss als eigener Chunk) und L7-02 Gruppen/Lehrkräfte/Eltern (Bestenliste ab 16 mit Zustimmung, Zuweisungen,
  Schüler-Start; Schalter in Produktion aus), beide Gegenprüfung Runde 2 frei; gemergt (665f599), ADR 0043 fortgeschrieben,
  `main` = 3b868df. Nachprüfung `scratchpad/tor-l7.sh` läuft einmal. Läuft weiter: A1 `wf_12f884de-7f4`. Danach: L8-Teile, die
  nicht von Inhalten abhängen (Sicherheit, Leistung, Datenfluss), sonst A1 abschließen → L3-08 → Tor L3 → L4.
- **Stand 21.10.2026 18:15 UTC:** Nach dem Limit (≈ 15:30–17:00) fortgesetzt. A1: Entwurf tr/de 12/12, ar e01–e07 (e08 als
  Teildatei); Lektorat tr 12/12, de e01–e08; Übersetzung tr e01/e02. Neuer Lauf `wf_12f884de-7f4` (`entworfen`, `lektoriert`,
  `uebersetzt`; Ergebnisse `scratchpad/l3/a1/ergebnisse-lauf3.json`). L7 ZWISCHENSTÄNDE 80f2147 (B) und 71848a8 (C), Fortsetzung
  `wf_45510daf-d44`. Danach: L7 mergen + Push auf `main`; nach der A1-Schlussprüfung Inhalte mergen, L3-08, Tor L3.
- **Stand 21.10.2026 15:10 UTC:** Nachprüfung L3-05/L3-06b grün bis auf einen veralteten Schaltertest (behoben, 5d59217 =
  `main`). A1 `wf_742961e7-df9`: 30 Entwürfe, 20 Lektorate, 4 Übersetzungen. **L7 gestartet** `wf_5180ee0e-539`
  (`scratchpad/lernapp-l7.workflow.js`; B = L7-01 Spielelemente, C = `l3-05` = L7-02 Gruppen/Lehrkräfte/Eltern; je
  Gegenprüfung + höchstens eine Mängelrunde). Nach Abschluss: Merge, schlanke Nachprüfung, Push auf `main` (L3-E12a).
- **Stand 21.10.2026 14:40 UTC:** Lern-App in der Produktion an (a023cf1, Nutzer: „Die App ist ein Teil der Seite!“, „ich
  erlaube dir alles“) – live https://igmg-wetzlarer.vercel.app/lern-app/de 200. **L3-05 Sprachausgabe de** (Gegenprüfung Runde 2
  frei; Bericht `_lernapp/berichte/l3-05-sprachausgabe.md`; Hochrechnung A1 de ≈ 29 min Erzeugung, ≈ 16 MB; Upload wartet auf
  Blob-Token LM-15) und **L3-06b Nacharbeit** (Runde 2 frei) gemergt, `main` = 62af151. Nachprüfung `scratchpad/tor-l3b.sh` läuft
  einmal (check, Religion, Wortlaut, Bau + Lern-App-E2E inkl. audio-buendel). Läuft weiter: A1 `wf_742961e7-df9`. Danach: L3-08
  (Audio de A1 nach Merge der Inhalte), Tor L3, dann L4.
- **Stand 21.10.2026 13:45 UTC – Nachprüfung L3-06 grün:** Unit 3.302 grün, Integration (betroffen) 642 grün, Bau + E2E Lern-App
  und Verwaltung 82 grün, Sprachen/Religion grün; Lint (erzeugte Modell-Dateien ausgenommen) und Wortlaut (Ausnahme L-02) nach
  6726e8e grün. `main` = 6726e8e, Produktion `success`. **Offen beim Nutzer:** Lern-App in der Produktion einschalten – die
  Codeänderung (`lernapp` in `IN_PRODUKTION_AN`) blockiert die Rechteprüfung der Sitzung (Funktionsschalter); Alternative
  `FUNKTION_LERNAPP=an` im Vercel-Projekt (nicht im Konto des Vercel-Zugangs dieser Sitzung). Laufen weiter: A1
  `wf_742961e7-df9`, L3-05/L3-06b `wf_f1e759ee-f9a`.
- **Stand 21.10.2026 13:15 UTC – `main` = a777af9 auf Wunsch des Nutzers ohne abgeschlossenes Tor** („jetzt schon live, ist eh
  eine Test-Domain“; Ausnahme von L3-E12 nur für diesen Schritt). Vorschau-Bau dieses Stands auf Vercel `success`. Das schlanke
  Tor `scratchpad/tor-l3a.sh` (check, betroffene Integration, Sprachen/Religion/Wortlaut, ein Bau mit Lern-App- und
  Verwaltungs-E2E) läuft als Nachprüfung; rote Befunde werden gezielt nachgezogen. Nutzer: keine unnötigen Testschleifen.
- **Stand 21.10.2026 12:20 UTC:** Nach dem Limit (09:35–12:00) fortgesetzt. A1: Entwürfe tr e01–e12, de e01–e08, ar e01–e02,
  Lektorat tr e01/e02; neuer Lauf `wf_742961e7-df9` (`lernapp-a1-weiter.workflow.js` mit `ohneVorbereitung`, `entworfen`,
  `lektoriert`; Ergebnisse früherer Läufe `scratchpad/l3/a1/ergebnisse-*.json`, Hinweise `hinweise-*.md`). Code
  `wf_f1e759ee-f9a`: L3-06b nur Gegenprüfung (Bau `scratchpad/l3-06b-bau.json`), L3-05 Fortsetzung ab 7440de3. Entscheidung
  L3-E13 (Vorkurs `e00-<ausgang>`, `reihenfolge` = Nummer + 1), ADR 0041 Fortschreibung (Export der Korrekturen). Danach:
  gemeinsames Tor L3-05/06/06b → FF `main`.
- **Stand 21.10.2026 09:15 UTC:** Produktion `success` für `main` = acf6e34 (Tor L2). **L3-06 Verwaltung v1 fertig**
  (`wf_a48f4bea-ac5`, Gegenprüfung Runde 2 frei; Mängelrunde 6f84750), in den Branch gemergt (32a3e96), CSP-Ausnahme
  `media-src blob:` unter `/verwaltung/lernapp` in KERN §6/ADR 0042 Nr. 14 (091dc51). Noch kein Tor für L3-06 – es läuft
  gemeinsam mit L3-05/L3-06b (volle Unit, volle Integration, volle E2E Website + Lern-App, da `next.config.ts` und die
  Verwaltung berührt sind; Import-Bau + Sweep; Vorschau) und dann FF `main`. **Laufen:** A1 `wf_4786ad44-05d` (tr-Entwürfe
  e03–e12 fertig), L3-05 + L3-06b `wf_446a5c88-ea5` (`scratchpad/lernapp-l3-05-06b.workflow.js`; C = `.claude/worktrees/l3-05`
  Zweig `lernapp-l3-05`, B = `agent-ac6673f9…`). Blob-Token lokal leer → Audio-Upload bleibt Menschen-Schritt (LM-15).
- **Stand 21.10.2026 08:30 UTC – Tor L2 grün, FF `main`.** `scratchpad/tor-l2.log`: check grün (ein Prüfer-Test riss unter Last
  die 5-s-Grenze → 30 s, 15d0a36), Sprachen, Religion, Wortlaut rc=0, Import-Bau 2.048 Seiten, Sweep/Crawl ohne 5xx, Budgets
  eingehalten, Lern-App-E2E 73 grün, Vorschau `success`. TBT unter Last 321/268/334 ms (CPU-Index 1.680–1.960 statt ≈ 2.900) –
  kein Tor-Kriterium L2, ruhige Nachmessung bis L8 (LZ-06). Laufen weiter: L3-06 `wf_a48f4bea-ac5`, A1 `wf_4786ad44-05d`.
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
