# Stufe C – Gruppe „Technik: Abgleich, Leistung, Betrieb, Bau“ (L8-05)

| | |
|---|---|
| Datum | 26.10.2026 |
| Stand | `d8ec7d5a` (Branch `claude/trusting-lovelace-6nfolz`, gleich `origin/main`; Haupt-Checkout `/home/user/IGMG`) |
| Prüfer | Stufe C, Gruppe technik |
| Kriterien | Z-L05, Z-L07, Z-L12, Z-L16 |
| Umfang | Sprachkurse A1–B1 in 6 Richtungen (L3-E16); B2/C1 offener Ausbau, nicht Gegenstand |
| Nicht im Stand | Nacharbeiten N2 (Freigabe-Härtung), N3 (Auslieferung Wissen/Koran), N4 (Kleinkram) in eigenen Arbeitsbäumen; wo sie einen Befund beheben, steht das dabei |
| Live | `https://igmg-wetzlarer.vercel.app`, nur GET, 26.10.2026 zwischen 01:06 und 01:20 UTC |
| Schrift | Diese Datei enthält keine arabische Schrift und keine religiösen Texte (KI-Regel 2, ADR 0040, `_lernapp/KERN.md` §2) |

## 0. Vorgehen, Befehle, Grenzen

- Nur gelesen und geprüft. Geschrieben wurde nur diese Datei. Kein git add, commit, stash, checkout, reset oder merge.
  `git status` war nach allen Läufen leer. Die Arbeitsbäume unter `.claude/worktrees/` wurden nicht angefasst.
- Umgebung: Node 24.21.0 aus dem Scratchpad, `TMPDIR` = `scratchpad/tmp-c-technik`. Weil die Gruppe religion mit langem
  Pfad Socket-Fehler von `tsx` hatte, lief alles über den Symlink `/tmp/c-tech` auf diesen Ordner. Es gab keine Umgebungsfehler.
- Eigene Rohdaten: `scratchpad/c-technik/` (`unit*.log`, `integration*.log`, `live-*.txt|json`, `skripte/routen.py`).
- Nicht ausgeführt, weil das Briefing es verbietet: `next build`/`pnpm build`, E2E, Server starten, MCP-Werkzeuge. Bau-, E2E-
  und Budgetergebnisse stammen deshalb aus den Belegen des Orchestrators. Sie sind unten als solche gekennzeichnet und
  stichprobenhaft gegengeprüft.

| # | Befehl (in `web/`, `pnpm exec vitest run …`) | Ergebnis |
|---|---|---|
| T1 | `--project unit` mit 9 Dateien: `lernapp/zusammenfuehren`, `lernapp/zusammenfuehrung`, `funktionen`, `umgebung`, `vercel-env-doku`, `startklar-meilensteine`, `lernapp/bundle-regeln`, `lernapp/bau-datenbank`, `lernapp/proxy` | rc 0, **9/9 Dateien, 446/446 grün**, 3,2 s |
| T2 | wie T1, nur `zusammenfuehren`, `funktionen`, `umgebung`, `--reporter=verbose` | **143/143 grün**, darunter `zusammenfuehren` 30, `funktionen` 10 und `umgebung` 103 mit „LERNAPP_TESTKURS steht in VARIABLEN“. Damit ist der rote Fall aus `tor-n1.log` durch `ce439430` behoben |
| T3 | `--project unit` mit 7 von N1 berührten Dateien: `lernapp/audio-kette`, `buendel`, `inhalt-pruefer`, `religion-inhalt`, `tatoeba-ausschluss`, `lernapp-sw`, `root-sw` | rc 0, **108 grün, 1 todo** |
| T4 | `--project integration --reporter=verbose` mit 8 Dateien: `lernapp-sync` 27, `lernapp-schalter` 2, `lernapp-einwilligung` 9, `startklar` 39, `loeschen-lernapp` 4, `lernapp-verwaltung` 26, `lernapp-testkurs-trennung` 5, `lernapp-anmelden` 8 | rc 0, **120/120 grün**, 211,6 s |
| T5 | `--project integration` `lernapp-pakete` 17, `lernapp-gruppe` 20 | rc 0, **37/37 grün** |
| T6 | `--project integration` mit 4 von N1 berührten Dateien: `lernapp-audio`, `lernapp-entsperren`, `lernapp-import`, `lernapp-schreiben` | rc 0, **39/39 grün** |
| L1 | curl GET auf 11 Lern-App-Routen, alle 6 Kursverzeichnisse, die Pakete `tr.a1.e01` und `ar.b1.e16`, 40 Koran-Pakete (de), `/api/health` | Einzelwerte in den Abschnitten |
| L2 | Den Sweep des Import-Baus (`tor-stufe-c/sweep.txt`, 61 Adressen) und `lernapp-ohne-db.txt` (15 Adressen) gegen die Produktion wiederholt | **61/61 und 15/15 gleiche Statuscodes** (41 × 200, 20 × 404, 0 × 5xx) |
| G1 | `git diff` `6bb7b6d6..d8ec7d5a`, `bb873e8e..d8ec7d5a`, `60c07a36..d8ec7d5a` (Client-Dateien, Budget- und Messskripte) | siehe Z-L07 |
| R1 | `skripte/routen.py`: Routenliste des Import-Baus vom 16.10. (`scratchpad/bau-import-na3.log`, 1.887 Seiten) gegen N1 (`tmp-n1/tor/bau-import.log`, 2.328 Seiten) | siehe Z-L16 |

Zusammen: **16 Unit-Dateien mit 554 grünen Tests und 14 Integrationsdateien mit 196 grünen Tests**, alle auf `d8ec7d5a`.

---

## 1. Z-L05 Abgleich

**Schwelle (kurz):** Die Vereinigung ist deterministisch, idempotent, kommutativ und assoziativ. Zwei Geräte mit
widersprüchlichen Bewertungen zeigen nach dem Abgleich denselben Kartenstand. Abgleich nur mit Konto, Einwilligung
`lernapp` und Schalter (sonst 404). Konten bleiben getrennt.

**Status: erfüllt**

**Belege**

- **Eigenschaftstests (T1/T2):** `tests/unit/lernapp/zusammenfuehren.test.ts:130–143`. Mit fast-check grün: „idempotent“
  (`vereinige(a, a)` = `vereinige(a)`), „kommutativ“, „assoziativ“. Zusätzlich grün: „Ableitung hängt nur von der Menge ab:
  Reihenfolge und Abgleichsweg sind gleichgültig“ (`:145`) und „Widerspruch unter gleichem Schlüssel: kanonisch kleinere
  Fassung gewinnt, unabhängig von der Reihenfolge“ (`:77`). Die Generatoren decken alle Ereignisarten, 3 Geräte und
  Listen bis 30 ab (`:96–127`). Auch „Karten: zwei Geräte bewerten dieselbe Karte – beide Bewertungen zählen“ ist grün.
- **Integration Sync (T4, `lernapp-sync` 27/27):**
  - „Schalter lernapp_sync, lernapp oder konten aus → 404 ohne Körper (Sync und Sitzung)“
  - „ohne Anmeldung 401“
  - „ohne Einwilligung lernapp 403; Widerruf wirkt sofort“
  - „Kind unter 16: ohne Einwilligung der Eltern abgelehnt“
  - „idempotent: dieselbe Anfrage zweimal schreibt einmal“
  - „Trennung zwischen Konten: Ereignisse, Karten und Zeiger bleiben je Konto“
  - „S-L1 M-1: Anfrage für ein anderes Konto als die Sitzung → 409 „konto“; nichts wird geschrieben“
  - „geteiltes Gerät: Profil an A, danach Sitzung B – kein Abgleich in das Konto B“
  - „Client: zwei Geräte lernen offline dieselbe Karte unterschiedlich und zeigen nach dem Abgleich denselben Stand wie der Server“

  Dazu `lernapp-einwilligung` 9/9 und `loeschen-lernapp` 4/4 grün.
- **Code:** `src/app/api/lernapp/sync/route.ts:66` liefert ohne Datenbank oder ohne wirksamen Schalter `lernapp_sync` eine
  404. Der Schalter setzt `lernapp` und `konten` voraus (`src/lib/funktionen-regeln.ts:95`). Ohne Sitzung kommt 401 (`:69`),
  ohne Einwilligung 403 (`:71`), bei fremdem Konto 409 (`:78`). Die Sitzung `src/app/api/lernapp/sitzung/route.ts:20` liefert
  ebenfalls 404, wenn der Schalter aus ist.
  - **Lesart „sonst 404“:** 404 gilt für den Schalter. Fehlen Konto oder Einwilligung, folgen 401 und 403. So steht es in
    ADR 0038 (`web/docs/adr/0038-…md:48`: „sonst 404 bzw. Fehler“), und so ist es getestet. Das ist kein Befund.
- **E2E zwei Geräte (Belege des Orchestrators, eingesehen):** `tests/e2e/lernapp/zwei-geraete.spec.ts:77` lief desktop grün:
  - `tor-stufe-c/e2e2.log:143` (Stand `6bb7b6d6`, 30,8 s)
  - `tmp-n1/tor/e2e2.log:141` (`bb873e8e`, 20,3 s)
  - `tmp-n1/tor/e2e3.log:140` (`0f2d7c31`, 26,1 s)

  Das Projekt „telefon“ wird absichtlich übersprungen (`:78`, „einmal je Lauf genügt“). Der Test spielt auf zwei Kontexten
  dieselbe Karte, einmal richtig und einmal zuerst daneben. Er verlangt vorher ungleiche und nachher gleiche Kartenstände
  sowie die Summe der Wiederholungen (`:107–120`). Nach N1 zielt er auf die Testeinheit (`tests/e2e/lernapp/hilfen.ts:16,19`:
  `tr-aus-de.a1.test.l01`, `tr.a1.test.w001`).
- **Live:** `GET /api/lernapp/sitzung` → **404** (der Schalter `lernapp_sync` ist in der Produktion aus).
  `GET /api/lernapp/sync` → 405, weil die Route nur POST kennt. POST wurde nach Briefing nicht geprüft.

**Lücken:** keine.

**Nacharbeit:** keine.

---

## 2. Z-L07 Leistung

**Schwelle (kurz):** Budgets nach KERN §9:
- Hülle eigen ≤ 20 KB
- Start/Lernpfad/Fortschritt eigen ≤ 30 KB, gesamt ≤ 180 KB
- Spieler zusätzlich ≤ 60 KB, gesamt ≤ 210 KB
- Übungstyp ≤ 15 KB, Tastatur ≤ 10 KB

Dazu LCP, INP und CLS, Lighthouse ≥ 90 und Zugänglichkeit 100, Whisper erst nach Klick. In der ABNAHME steht bereits
„erfüllt (24.10.2026)“.

**Status: erfüllt (am 26.10. bestätigt; Hinweis zu den Messwerkzeugen)**

**Belege**

- **Budgetlauf nach dem Bericht (Beleg des Orchestrators, eingesehen):**
  - `tor-stufe-c/budget.txt` (Stand `6bb7b6d6`) und `tmp-n1/tor/budget.txt` (Stand `bb873e8e`) sind bis auf den Port gleich:
    - Grundstock 135,3 KB
    - Hülle eigen 8,4
    - Start 149,3/14,0
    - Lernpfad 154,6/19,2
    - Fortschritt 153,3/17,9
    - Spieler 192,2 (+55,4)
    - Spieler-Chunk 37,3 KB
    - Übungstypen höchstens 11,6, Tastatur 1,5
    - „Alle Budgets eingehalten.“
  - Die Werte decken sich mit `_lernapp/berichte/leistung.md:71–83`.
  - Der N1-Lauf misst schon die Testeinheit: `scripts/lernapp-budget.mjs:34–35` steht seit `bb873e8e` auf
    `de-aus-tr.a1.test.l01/l02` (`git show bb873e8e:web/scripts/lernapp-budget.mjs`).
- **Nichts berührt die Budgets seit dem Bericht (G1):**
  - `git diff --name-only 60c07a36..d8ec7d5a -- web/src` (60c07a36 ist der letzte Commit an `leistung.md`) ergibt 20
    Dateien. **Keine davon ist eine Client-Datei.** Es sind Quellenseiten, die Audio-Route, Prüfer, Import, Pakete,
    Audio-Studio, `umgebung.ts` und `stimmen.ts`; `stimmen.ts` wird nur von Server-Dateien importiert.
  - `package.json`, Lockfile und `globals.css` sind unverändert. `next.config.ts` hat nur einen Kommentar geändert.
  - Seit dem letzten Budgetlauf (`bb873e8e`) wurde keine Datei mit `"use client"` geändert.
- **`scripts/messen.mjs:24`** (Lighthouse-Weg) steht ebenfalls auf `a1.test`.

**Lücken (Hinweis, kein Verfehlen):**

- Die Messwerkzeuge in `_lernapp/werkzeuge/leistung/` zielen noch auf `a1.e01`. Seit N1 ist das die echte Einheit mit
  8 Lektionen, nicht mehr die Testeinheit. Fundstellen:
  - `routen.mjs:13–14`
  - `inp-spieler.mjs:57, 85, 106`
  - `whisper-netz.mjs:57`
  - `lasttest-sync.mjs:86, 100, 103`
  - `messlauf.sh:146`

  Ein erneuter Lauf misst dann andere Inhalte. Die Selektoren der Testeinheit können ins Leere laufen.
  **Bekannt, N4 stellt um** (PRÜFPUNKT 26.10. 00:20, „Gegenprüfung 2: … die Messwerkzeuge Z-L07 suchen noch `a1.e01`“).
- Die Lighthouse- und INP-Tabellen in `leistung.md` (z. B. `:79–80`, `:113–115`) nennen Routen mit `a1.e01`. Gemessen
  wurde damals die Testeinheit. Das JS-Budget hängt nicht vom Inhalt ab und ist damit nicht betroffen. LCP und INP auf
  echten Einheiten sind nicht neu gemessen.
- Aus der ABNAHME weiter offen: TBT unter Last und die PageSpeed-Gegenprüfung nach Bereitstellung.

**Nacharbeit:**
1. N4 abwarten: Messwerkzeuge auf `<kurs>.a1.test` umstellen. Ist der Testkurs im Bau ohne Datenbank nicht importiert,
   gezielt mit `LERNAPP_TESTKURS=1` messen.
2. Danach einmal `messlauf.sh` mit Lighthouse und INP für die drei Spieler-Routen wiederholen und die Routennamen in
   `leistung.md` angleichen. Das Kriterium bleibt erfüllt.

---

## 3. Z-L12 Betrieb

**Schwelle (kurz):**
- Produktionsschalter wie KERN §6: ausgeschaltet heißt 404 und die Links verschwinden.
- startklar grün mit Produktionsschaltern.
- Cockpit-Karte „Lern-App“ mit Schalter, Blob, Prüfenden und Einheiten je Status.
- Integration Schalter → 404.

**Status: teilweise**

**Belege**

- **Schalter im Code:** `src/lib/funktionen-regeln.ts:40`:
  `IN_PRODUKTION_AN = ['hadith_gesamt', 'lernapp', 'lernapp_ungeprueft', 'lernapp_meldungen']`. In der Produktion ist sonst
  alles aus (`:43–46`). Weitere Regeln:
  - `MIT_PERSONENDATEN` (`:69–83`) enthält `lernapp_sync`, `lernapp_gruppen`, `lernapp_rangliste`, `lernapp_statistik` und
    `push_lernapp`.
  - Die Sperren `VORAUSSETZUNGEN` (`:91–100`):
    - jeder Lern-App-Schalter braucht `lernapp`
    - `lernapp_sync` braucht `konten`
    - `lernapp_gruppen` braucht `lernplattform` und `konten`
    - `lernapp_rangliste` braucht `lernapp_gruppen`
    - `push_lernapp` braucht `push`

  Unit `funktionen` 10/10 grün (T2), darunter „Produktion: Lern-App an (Nutzer 21.10.2026)“ und „Funktionen mit
  Personendaten sind in der Produktion nie standardmäßig an“.

  Abgleich mit `_lernapp/KERN.md:181–189`:

  | Schalter | KERN §6 Produktion | Code | Live (26.10.) |
  |---|---|---|---|
  | `lernapp` | an nach Abnahme | an (seit `a023cf1`, 21.10.) | `/lern-app/{de,tr,ar}` 200, Manifest 200 |
  | `lernapp_ungeprueft` | an | an | alle 254 Einheiten der 6 Verzeichnisse mit `hinweis: true` |
  | `lernapp_sprechen` | aus | aus | `…/ueben`: `"spracherkennung":false` |
  | `lernapp_meldungen` | an | an | `…/ueben`: Knopf „Fehler melden“ im RSC-Anteil; die Melde-Route kennt nur POST (405) |
  | `lernapp_sync` | aus | aus | `/api/lernapp/sitzung` 404 |
  | `lernapp_gruppen` | aus | aus | `/lern-app/de/gruppe` 404, `/api/lernapp/gruppe` 404, `/api/lernapp/schreiben` 404, `schreibabgabe` = `$undefined` |
  | `lernapp_rangliste` | aus | aus | `/api/lernapp/gruppe?rangliste=1` 404 (über `lernapp_gruppen`) |
  | `lernapp_statistik` | aus | aus | Route nicht gebaut (GO-LIVE) |
  | `push_lernapp` | aus | aus | nicht live prüfbar (Push aus) |

  Dazu `/lern-app/de/anmelden` 404, weil `konten` aus ist (`src/app/lern-app/[ui]/anmelden/page.tsx`, `verlangeKontenSeite`).
- **startklar mit Produktionsschaltern:**
  - *CLI ohne Datenbank* (`tor-stufe-c/startklar.log`, Beleg des Orchestrators): „2 OK, 1 Hinweise, 2 Warnungen, 13 Fehler,
    3 manuell“. **Alle 13 Fehler sind Umgebung:**
    - die fehlenden Geheimnisse und Werte `BETTER_AUTH_SECRET`, `DATABASE_URL`, `EINGANG_SCHLUESSEL`, `RATE_GEHEIMNIS`,
      `ALTCHA_GEHEIMNIS`, `WARTUNG_TOKEN`, `CRON_SECRET`, `MAIL_TRANSPORT`, `MAIL_ABSENDER`, `SMTP_HOST` und `PROXY_VERTRAUEN`
    - `SPEICHER=dateisystem`
    - „Datenbank nicht verbunden“

    Die Simulation eines frischen Imports (`scratchpad/env-import.sh`) entfernt diese Werte absichtlich. Die
    Adresse `igmg-neu.vercel.app` stammt aus derselben Simulation. **Kein Fehler betrifft die Lern-App.** Ohne Datenbank
    entfallen ihre Prüfungen (`src/lib/startklar/pruefungen.ts:230` läuft nur mit Datenbank).
  - *Integration mit Datenbank (T4, `startklar` 39/39):*
    - „saubere Produktionslage ist startklar (keine Fehler)“ (`tests/integration/startklar.test.ts:302`) mit den
      Standardschaltern der Produktion, also `lernapp` an
    - „Lern-App (KERN 4.0 §6): Produktion ohne Angaben ohne Befund; gesperrte Schalter melden, Abgleich als Vorbehalt“ (`:450`)
    - „S-L2 M-1: Gruppen der Lern-App ohne Entscheidung D-L16 – Fehler in produktion“
  - *Echte Produktion:* `GET /api/health` → **503** `{"status":"fehler"}`. Die Produktion läuft ohne Datenbank, also im
    Beispielmodus (G1 offen, `_lernapp/GO-LIVE.md:44, 88`). Das ist eine erwartbare Umgebungslage und kein Befund des Codes.
- **Cockpit-Karte (Code):** `src/lib/startklar/lernapp.ts` meldet folgende Punkte:
  - Schalter (`:47–63`, 6 Schalter `:19–26`)
  - Blob `LERNAPP_BLOB_BASIS` (`:66–78`)
  - Prüfende religiös ≥ 2 (`:80–99`)
  - Unabhängigkeit (`:101–135`)
  - Sprachprüfung je Sprache (`:137–171`)
  - Einheiten je Status (`:173–191`)
  - offene Meldungen (`:193–203`)
  - Abgleichsgrenzen (`:205–231`)

  Eingehängt ist die Karte in `src/lib/startklar/pruefungen.ts:230` und auf der Seite
  `src/app/[locale]/verwaltung/(geschuetzt)/startklar/page.tsx:16–25` (Bereich `lernapp`). Die Texte stehen in
  `messages/verwaltung/startklar.json:34, 44`.

  Integration `lernapp-verwaltung` „Cockpit-Karte: Schalter, Blob, Prüfende, Einheiten, Meldungen, Grenzen“ und
  „Cockpit-Hinweis: religiöse Prüfung zusammen mit Administration …“ sind grün (T4).
- **Integration Schalter → 404 (T4/T5, alle grün):**
  - `lernapp-schalter`: „aus: kein Service Worker, kein Manifest-Link, Manifest 404 ohne Vorhalten“
  - `lernapp-pakete`: „Schalter lernapp aus → 404 für Verzeichnis, Paket und Audio“
  - `lernapp-sync`: „Schalter lernapp_sync, lernapp oder konten aus → 404 ohne Körper“
  - `lernapp-anmelden`: „Schalter konten oder lernapp aus → 404“
  - `lernapp-gruppe`: „ohne `lernapp_gruppen` 404“
  - `lernapp-testkurs-trennung`: „Audio-Route: Testbündel nur, solange der Testkurs importiert ist (öffentliche
    Test-Domain: 404)“

**Lücken**

1. **„Ausgeschaltet heißt 404“ gilt nicht für statische Dateien unter `/lern-app/`.** Betroffen sind `sw.js`, die Symbole und
   die Modelle mit ≈ 95 MB. Das ist S-L3 N-4 (`_lernapp/berichte/s-l3.md:134–146`). Die Frist lautet „bis zur Abnahme
   (L8-05) oder AUSNAHME mit Grund“ (`_lernapp/GO-LIVE.md:42, 79`). Es gibt keinen Commit, der N-4 behebt
   (`git log --grep=N-4`). Live liefert `/lern-app/sw.js` 200, wie erwartet, weil `lernapp` an ist. **N2–N4 decken N-4
   nicht ab.**
2. **Dokumentation widerspricht dem Code beim Schalter `lernapp`:**
   - KERN §6 (`_lernapp/KERN.md:181`) sagt „an nach Abnahme“.
   - `ENTSCHEIDUNGEN.md:289` (L3-E12a) sagt „bleibt in Produktion hinter `FUNKTION_LERNAPP`, bis der Nutzer anders
     entscheidet“.
   - Code und Produktion haben `lernapp` seit `a023cf1` an. Grund ist die Nutzerentscheidung vom 21.10. („Die App ist ein
     Teil der Seite!“). Sie ist nur im Commit, in `PRUEFPUNKT.md:522` und in GO-LIVE vermerkt; GO-LIVE beruft sich dabei
     fälschlich auf L3-E12a.
   - Der Text der Cockpit-Karte `src/lib/startklar/lernapp.ts:60` („in der Produktion bis zur Abnahme“) ist veraltet.
3. Die startklar-CLI wurde nicht mit Datenbank und Produktionsschaltern ausgeführt, auch nicht vom Orchestrator. Belegt ist
   das nur über die Integration (Ersatz, gleiche Funktion `fuehreStartklarAus`).

**Nacharbeit**

1. N-4 entscheiden, Orchestrator, vor der ABNAHME:
   - *Entweder* AUSNAHME in ABNAHME und GO-LIVE eintragen.
     - Grund: `lernapp` ist nach der Nutzerentscheidung in der Produktion an; die Dateien enthalten keine Personendaten.
     - Ersatz: Kosten beobachten (LM-15); beim Abschalten ein Abmelde-Worker als `sw.js`.
   - *Oder* eine Ratenregel der Vercel-Firewall für `/lern-app/modelle/*` setzen und den Abmelde-Worker bauen.
2. Entscheidung L3-E12b in `ENTSCHEIDUNGEN.md` eintragen: „`lernapp` in der Produktion an, 21.10.2026, Nutzer“. KERN §6
   Zeile `lernapp` fortschreiben (nur der Orchestrator). Den Text in `lernapp.ts:60` mit N4 angleichen.
3. Im vollen Tor nach N2–N4 einmal `pnpm startklar` mit Datenbank und Produktionsumgebung ohne `FUNKTION_*` laufen lassen.
   Erwartet sind 0 Fehler aus den Bereichen Lern-App und Gemeinde. Umgebungsfehler werden getrennt ausgewiesen.

---

## 4. Z-L16 Bau

**Schwelle (kurz):**
- Vercel-Bau ≤ 15 min.
- Beide Betriebsarten grün; Beispielmodus ohne Datenbank spielbar.
- Bestehende Suiten der Website ohne Rückschritt.
- Vorgerenderte Seiten der Website vollständig (16.10.: 1.887).

**Status: teilweise**

**Belege**

- **Bauzeit (Belege des Orchestrators, eingesehen):** Der Import-Bau wie auf Vercel (`scripts/vercel-bau.mjs`, ohne
  `DATABASE_URL`, PGlite) lief auf 4 Kernen:
  - **693 s** auf `6bb7b6d6` (`tor-stufe-c.log`: „importbau rc=0 dauer=693s“; kompiliert in 87 s, TypeScript 88 s, Seiten 3,0 min)
  - **636 s** auf `bb873e8e` (`tmp-n1/tor/lauf.log`; kompiliert in 58 s, TypeScript 93 s, Seiten 2,9 min)

  Beide liegen unter 900 s, die Reserve beträgt 23–29 %. Zum Vergleich: S1 am 16.10. brauchte 194 s
  (`_lernapp/belege/S1-S6-…md:106`).

  Die tatsächliche Dauer auf Vercel ist **nicht geprüft**: kein Zugriff auf die Bauprotokolle ohne MCP.
- **Vercel baut den aktuellen Stand erfolgreich (live):**
  - Kursverzeichnis `tr-aus-de`: `tr.a1.e01` = „Begrüßung und Vorstellung“, 8 Lektionen, Audio 0, `hinweis: true`.
    Das Paket hat den Hash `7f428832…bf1c9` und liefert 200 mit 114.911 B, 8 Lektionen, 123 Aufgaben und
    `immutable`. **Der Hash ist gleich dem N1-Import-Bau** (`tmp-n1/tor/bau-import.log`) und ungleich dem Stand
    `6bb7b6d6` (`73e75db9…`, damals die Testeinheit).
  - `ar-aus-de` und `ar-aus-tr` haben je B1 16 Einheiten. `ar.b1.e16` „Wir kochen für Gäste“ liefert 200 mit 8 Lektionen und
    105 Aufgaben. B1 ar kam erst mit `5404aa06`, N1 mit `25515a23`. **Die Produktion zeigt also beides, das ist der
    Merge-Stand.**
  - In allen 6 Richtungen gibt es **keine Testeinheit** (`.test`), und `a1.e01` ist echt:
    - de-aus-tr und de-aus-ar: „Hallo, wer bist du? – Begrüßung und Vorstellung“
    - tr und ar: „Begrüßung und Vorstellung“

    Mengen: A1 13, A2 14, B1 15 (tr, de) bzw. 16 (ar). Alle Einheiten tragen `hinweis: true`.
- **Beide Betriebsarten (Belege des Orchestrators):**
  - *Produktion mit Datenbank:* „bau rc=0“ auf `6bb7b6d6` (`tor-stufe-c.log`) und in 4 N1-Läufen (349–355 s,
    `tmp-n1/tor/lauf.log`).
  - *Produktion ohne Datenbank* (Import): rc 0 auf `6bb7b6d6` und `bb873e8e`. Auf `bb873e8e` wird der Testkurs nicht
    importiert, weil `LERNAPP_TESTKURS` nicht gesetzt ist; die Zeile „Lern-App-Testkurs“ fehlt im Log, auf `6bb7b6d6` stand
    noch „51 neu, 171 geändert“.
  - *Vorschau:* Der letzte belegte Vorschau-Bau ist von Tor L1 am 20.10. („vorschau rc=0“, 2.394 Seiten, `scratchpad/tor-l1.log`).
- **Beispielmodus ohne Datenbank:**
  - Lokal (`tor-stufe-c/lernapp-ohne-db.txt`): 13 × 200, 1 × 308, 1 × 404 (Manifest ohne Oberfläche, gewollt).
  - **Live wiederholt (L2): 15/15 gleich.** Die Produktion *ist* der Beispielmodus (`/api/health` 503). Seiten,
    Lernpfade, `…/ueben`, `…/wiederholen`, `…/einstufung`, `…/tipps`, `/fortschritt`, `/wortschatz` und `/quellen` liefern 200.
    Die Pakete sind vollständig: siehe oben.
  - Dass der Spieler dafür nur statische GETs braucht, belegt die E2E „ohne Konto: nur GET an den eigenen Ursprung, keine API,
    keine Cookies“. Sie war desktop grün in `tmp-n1/tor/e2e2.log:86` und `e2e3.log:83`, ebenso „Einheit offline speichern,
    Netz abklemmen“ (telefon und desktop).
- **Suiten ohne Rückschritt:**
  - Voll auf `6bb7b6d6` (`tor-stufe-c.log`): check mit 179 Dateien und **3.565 grün**, Integration mit 89 Dateien und
    **3.847 grün** (vorher Tor a1a2 3.565, Tor L6 3.767). Sprachen, Religion, Wortlaut und `lernapp:pruefen` mit rc 0.
  - Nach N1 war `tor-n1.log` mit 1 Fall rot (`umgebung`, `LERNAPP_TESTKURS`). **Auf `d8ec7d5a` grün (T2).**
  - Die von N1 berührten Unit- und Integrationsdateien sind auf `d8ec7d5a` grün (T1, T3–T6).
  - Live-Sweep der Website (L2): 61/61 wie im Import-Bau.
- **Vorgerenderte Seiten (R1):** 2.328 auf `6bb7b6d6` und `bb873e8e` gegenüber 1.887 am 16.10. Der Routenvergleich der
  Bauprotokolle ergibt:
  - **keine Route vom 16.10. fehlt**
  - **keine hat weniger Pfade**
  - keine Website-Route hat mehr Pfade
  - neu sind nur 37 Routen der Lern-App und ihrer Verwaltung, darunter 222 Einheitenpakete, 8 Kursverzeichnisse und
    5 × 24 Kursseiten

  Die Website ist also vollständig.

**Lücken**

1. **Vercel-Bauzeit nicht direkt belegt.** Der vorgesehene Beleg „Bauprotokolle Vorschau und Produktion“ fehlt. Es gibt nur
   den lokalen Nachbau mit 636–693 s. Der Bau wächst: 194 s am 16.10., 693 s am 25.10. Mit N3 (78 weitere Koran-Pakete)
   und später B2/C1 schrumpft die Reserve.
2. **Website-E2E seit Tor L1 (20.10., 1.007 grün, `scratchpad/e2e-l1-lauf.log`) nicht mehr gelaufen.** Seither haben sich
   gemeinsame Website-Dateien geändert, z. B. `src/app/[locale]/(website)/quellen/page.tsx`, `next.config.ts` und die
   Startklar-Seite. Die Stufe-C-E2E umfasste nur `tests/e2e/lernapp` und `mein-bereich-lernen.spec.ts`.
3. **Vorschau-Bau** seit Tor L1 nicht belegt.
4. **Der Merge-Stand (`25515a23`…`d8ec7d5a`) wurde lokal nicht gebaut.** Die N1-Läufe liefen ohne die Freigabe B1 ar.
   Vercel hat ihn gebaut (live). Die lokale Seitenzahl für diesen Stand fehlt; zu erwarten sind ≈ 2.360 Seiten
   (+ 2 × 16 Pakete B1 ar).
5. **„Spielbar“ ohne Datenbank** ist nur über HTTP, Paketinhalt und den Schluss aus dem Netzprotokoll belegt. Es gibt keinen
   Browser-Durchlauf einer Lektion im Bau ohne Datenbank, denn alle E2E laufen mit Datenbank.
6. Hinweis, nicht dieses Kriterium:
   - Lern-App-E2E `verwaltung-sprachpruefung.spec.ts:44` (desktop) ist in 5 Läufen in Folge rot, jedes Mal mit anderer
     Ursache: Seite geschlossen, `goto`-Zeitgrenze, Weiterleitung nach dem zweiten Faktor auf `/verwaltung`. Belege:
     `tor-stufe-c/e2e2.log`, `tmp-n1/tor/e2e2–4.log`. Grün war sie zuletzt in `tor-l6` und `tor-l7`.
   - In `e2e3.log` waren außerdem `rahmen.spec.ts:284` (Kinderzugang) und `verwaltung-religioes.spec.ts:117` rot und wurden
     nicht wiederholt. Das gehört zur Gruppe Oberfläche/Verwaltung.
   - Koran-Pakete live: nur 1 von 40 (de) liefert 200, die übrigen 39 nicht. **N3 behebt das** (Lern-App, nicht Website).

**Nacharbeit**

1. Die Dauer des Produktionsbaus von `main` auf Vercel ablesen und in der ABNAHME eintragen, Orchestrator oder Mensch. Wege:
   Dashboard › Deployments › Build Logs oder `vercel inspect <url> --logs` mit Zeitlimit, kein MCP. Danach den Bau nach
   N2–N4 erneut ablesen. Liegt die Dauer über ≈ 12 min, im BERICHT als Risiko für B2/C1 vermerken.
2. Das im PRÜFPUNKT geplante „Volle E2E und Import-Bau auf dem Merge-Stand“ nach N2–N4 ausführen:
   - **volle Website-E2E und Lern-App-E2E** (Website-Ergebnis gegen 1.007 grün vom 20.10.)
   - Import-Bau mit Seitenzahl, Sweep und Routenvergleich (`skripte/routen.py` gegen `bau-import-na3.log`)
   - im selben Lauf ein Vorschau-Bau (`VERCEL_ENV=preview`)
3. Ein Rauchtest im Beispielmodus: z. B. Playwright `lektion.spec.ts` und `offline.spec.ts` gegen den Import-Bau ohne
   `DATABASE_URL` mit `LERNAPP_TESTKURS=1`. Ersatzweise spielt ein Mensch eine Lektion auf der Test-Domain und vermerkt sie
   im Protokoll.
4. `verwaltung-sprachpruefung` stabilisieren (Weiterleitung nach dem zweiten Faktor, Zeitgrenzen unter Last). Gehört zur
   Gruppe Oberfläche/Verwaltung.

---

## 5. Zusammenfassung

| Z | Status | Beleg kurz |
|---|---|---|
| Z-L05 | erfüllt | Unit `zusammenfuehren`: idempotent, kommutativ, assoziativ mit fast-check grün (30/30). Integration `lernapp-sync` 27/27: Schalter → 404, 401, 403, 409, Konten getrennt, zwei Geräte. E2E `zwei-geraete` desktop grün in 3 Läufen (6bb7b6d6, bb873e8e, 0f2d7c31). Live `/api/lernapp/sitzung` 404 |
| Z-L07 | erfüllt | Budgets am 6bb7b6d6 und bb873e8e gleich (Spieler 192,2/+55,4, Chunk 37,3 KB, „Alle Budgets eingehalten“). Seit `leistung.md` keine Client-Datei geändert. Hinweis: Messwerkzeuge unter `_lernapp/werkzeuge/leistung` noch auf `a1.e01`, N4 stellt um |
| Z-L12 | teilweise | Schalter in Code und live wie KERN §6. `lernapp` ist schon an, nach Nutzerentscheidung vom 21.10., aber nicht in KERN und ENTSCHEIDUNGEN nachgetragen. Cockpit-Karte vollständig. Integration Schalter → 404 grün. startklar mit Datenbank in der Integration 0 Fehler; die CLI ohne Datenbank zeigt nur 13 Umgebungsfehler. Offen: S-L3 N-4 (Frist Abnahme, nicht in N2–N4) |
| Z-L16 | teilweise | Import-Bau 693/636 s (< 900 s). Beide Produktionsbauten rc 0. Seiten 2.328, keine Website-Route fehlt. Live = Merge-Stand (`tr.a1.e01` echt, Hash wie N1; B1 ar 16). Beispielmodus live 15/15, Sweep 61/61. Offen: Vercel-Bauzeit nicht belegt, Website-E2E und Vorschau-Bau seit 20.10. nicht gelaufen, kein Spieldurchlauf ohne Datenbank, Merge-Stand lokal nicht gebaut |
