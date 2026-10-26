# Stufe C – Gegenprüfung der Gruppe „Technik: Abgleich, Leistung, Betrieb, Bau“ (L8-05)

| | |
|---|---|
| Datum | 26.10.2026, 01:23–01:40 UTC |
| Stand | `d8ec7d5a` (Branch `claude/trusting-lovelace-6nfolz`, lokal gleich `origin/main`) |
| Geprüft | `_lernapp/protokolle/C-technik.md` (Prüfer Stufe C, Gruppe technik) |
| Kriterien | Z-L05, Z-L07, Z-L12, Z-L16 (Schwellen aus `_lernapp/ABNAHME.md`) |
| Umfang | Sprachkurse A1–B1 in 6 Richtungen (L3-E16); B2/C1 offener Ausbau, nicht Gegenstand |
| Nicht im Stand | N2 (Freigabe-Härtung), N3 (Auslieferung Wissen/Koran), N4 (Kleinkram); vermerkt, wo sie einen Befund beheben |
| Schrift | Keine arabische Schrift, keine religiösen Texte (KI-Regel 2, ADR 0040, `_lernapp/KERN.md` §2) |

## Ergebnis

| Z | Prüfer | Gegenprüfung | Urteil |
|---|---|---|---|
| Z-L05 | erfüllt | **erfüllt** | bestätigt |
| Z-L07 | erfüllt | **teilweise** | herabgestuft: Ladezeiten und Lighthouse wurden gemessen, bevor es echte Kursinhalte im Bau gab |
| Z-L12 | teilweise | **teilweise** | bestätigt |
| Z-L16 | teilweise | **teilweise** | bestätigt, mit zwei zusätzlichen Lücken: Vorschau ist eine der „beiden Betriebsarten“, und Koran-Arabisch ist im Beispielmodus nicht spielbar |

## 0. Vorgehen und eigene Läufe

- Nur gelesen und geprüft. Geschrieben habe ich nur diese Datei. Kein git add, commit, stash, checkout, reset, merge oder fetch.
  Die Arbeitsbäume unter `.claude/worktrees/` habe ich nicht angefasst. Kein MCP, kein Bau, keine E2E, kein Server.
- Umgebung: Node 24.21.0 aus dem Scratchpad. `TMPDIR` = `scratchpad/tmp-c-technik-gegen` mit vollem Pfad, ohne Symlink.
  Es gab keine Socket-Fehler.
- Rohdaten: `scratchpad/c-technik-gegen/` (`unit1.log`, `unit2.log`, `integration1.log`, `integration2.log`, `live/`).

| # | Befehl (in `web/`, `pnpm exec vitest run …`) | Ergebnis |
|---|---|---|
| U1 | `--project unit` `lernapp/zusammenfuehren`, `funktionen`, `lernapp/zusammenfuehrung`, verbose | rc 0, **78/78 grün** (zusammenfuehren 30, funktionen 10, zusammenfuehrung 38) |
| U2 | `--project unit` `umgebung`, `vercel-env-doku`, `lernapp/quellen`, `lernapp/audio-kette`, `lernapp/bau-datenbank`, `lernapp/buendel`, `lernapp/bundle-regeln`, `lernapp/proxy`, `startklar-meilensteine` | rc 0, **9 Dateien, 414/414 grün** |
| I1 | `--project integration` `lernapp-sync`, `lernapp-schalter`, `startklar`, `lernapp-pakete`, `lernapp-verwaltung`, `lernapp-einwilligung`, verbose | rc 0, **120/120 grün** (27 + 2 + 39 + 17 + 26 + 9), 93 s |
| I2 | `--project integration` `lernapp-testkurs-trennung`, `lernapp-anmelden`, `lernapp-gruppe`, `loeschen-lernapp`, verbose | rc 0, **37/37 grün** (5 + 8 + 20 + 4), 123 s |
| L1 | curl GET auf 23 Lern-App- und API-Adressen sowie `/api/health` (`live/status1.txt`) | Werte in den Abschnitten |
| L2 | Sweep `tor-stufe-c/sweep.txt` (61) und `lernapp-ohne-db.txt` (15) gegen die Produktion wiederholt (`live/sweep-live.txt`, `live/lernapp-ohne-db-live.txt`) | **61/61 und 15/15 gleich**, 41 × 200, 20 × 404, 0 × 5xx |
| L3 | JS je Route live: HTML von `/`, Hülle, Start, Lernpfad und Fortschritt; alle referenzierten Chunks geladen, je Datei gz -9 mit Node-zlib | siehe Z-L07 |
| L4 | 6 Kursverzeichnisse und 2 Einheitenpakete live, SHA-256 des Pakets gegen den Hash im Verzeichnis; 40 Koran-Pakete (de) | siehe Z-L16 |
| G1 | `git ls-tree`, `git diff --name-only` und `git merge-base` zwischen den Messständen `4d00cadf`, `fc95e675`, `fd11a59d` und `d8ec7d5a` | siehe Z-L07 |
| R1 | Eigener Routenvergleich (eigener Parser, nicht `c-technik/skripte/routen.py`): `bau-import-na3.log` (16.10.) gegen `tmp-n1/tor/bau-import.log` und `tor-stufe-c/bau-import.log` | siehe Z-L16 |

---

## 1. Z-L05 Abgleich – bestätigt: erfüllt

**Schwelle:**
- Die Vereinigung ist deterministisch, idempotent, kommutativ und assoziativ.
- Zwei Geräte mit widersprüchlichen Bewertungen zeigen nach dem Abgleich denselben Kartenstand.
- Abgleich nur mit Konto, Einwilligung `lernapp` und Schalter (sonst 404).
- Konten bleiben getrennt.

**Selbst nachvollzogen:**
- **Eigenschaften der Vereinigung:** `tests/unit/lernapp/zusammenfuehren.test.ts:130–143` grün (U1): idempotent, kommutativ,
  assoziativ, jeweils als fast-check-Eigenschaft über `kanonisch(…)`. Grün ist auch `:145` („Ableitung hängt nur von der
  Menge ab“). Die Generatoren `:93–127` lassen Schlüssel absichtlich kollidieren: 3 Geräte, `seq` ≤ 15.
- **Determinismus im Code:** `src/lib/lernapp/ereignisse/zusammenfuehren.ts:29–42`. Ohne Uhr und ohne Zufall: Unter gleichem
  Schlüssel gewinnt die kanonisch kleinere Fassung, danach kommt eine totale Ordnung.
- **Schalter, Anmeldung, Einwilligung, Konten (I1, `lernapp-sync` 27/27):**
  - „Schalter lernapp_sync, lernapp oder konten aus → 404 ohne Körper (Sync und Sitzung)“ (`:142`)
  - „ohne Anmeldung 401“ und „ohne Einwilligung lernapp 403; Widerruf wirkt sofort“
  - „Trennung zwischen Konten“ und „Anfrage für ein anderes Konto als die Sitzung → 409“
  - „zwei Geräte lernen offline dieselbe Karte unterschiedlich und zeigen nach dem Abgleich denselben Stand wie der Server“
    (`:564–583`: gut/nochmal/schwer auf A und B, danach Karten lokal A = lokal B = Server)
  - Dazu `lernapp-einwilligung` 9/9 und `loeschen-lernapp` 4/4 grün (I1, I2).
- **Reihenfolge der Prüfungen** in `src/app/api/lernapp/sync/route.ts`: 404 (`:66`), 403 Ursprung (`:67`), 401 (`:69`),
  403 Einwilligung (`:71`), 409 (`:78`).
  - Die Lesart „sonst 404“ = Schalter, „Fehler“ = Konto und Einwilligung deckt ADR 0038 Nr. 5
    (`web/docs/adr/0038-…md:48`: „sonst 404 bzw. Fehler“).
  - Der Zweck der Schwelle, kein Abgleich ohne Konto und ohne Einwilligung, ist erfüllt. Kein Befund.
- **E2E zwei Kontexte (Belege des Orchestrators, eingesehen):** `zwei-geraete.spec.ts:77` desktop grün in
  `tor-stufe-c/e2e2.log:143`, `tmp-n1/tor/e2e2.log:141` und `tmp-n1/tor/e2e3.log:140`. telefon ist absichtlich übersprungen.
  Seit `6bb7b6d6` hat sich nichts am Abgleich geändert: `git diff --stat 6bb7b6d6..d8ec7d5a` über `sync/`, `lokal/`,
  `ereignisse/`, `api/lernapp/`, `funktionen*` und `startklar/` ist leer.
- **Live:** `GET /api/lernapp/sitzung` → 404, Körper 0 B. `GET /api/lernapp/sync` → 405 (nur POST, nicht geprüft).

**Gegenbeispiele gesucht, keins mit Wirkung auf die Schwelle:**
- Der Server schreibt mit `onConflictDoNothing` (`src/lib/lernapp/sync/server.ts:475`), bei gleichem Schlüssel mit anderem
  Inhalt also „erster gewinnt“. Der Client nimmt dagegen die kanonisch kleinere Fassung.
- Das kann nur auseinanderlaufen, wenn ein Gerät eine Folgenummer wiederverwendet. Ein Import in ein neues Profil bekommt
  eine eigene Geräte-UUID (`src/lib/lernapp/lokal/export.ts:13–15`). Geklemmte Fassungen überschreibt der Client
  (`lokal/sync.ts:177–181`).
- Die Schwelle betrifft zwei Geräte, also verschiedene Schlüssel, und die sind getestet. Nur ein Hinweis, keine Lücke.

**Lücken:** keine. **Nacharbeit:** keine.

---

## 2. Z-L07 Leistung – herabgestuft: teilweise

**Schwelle:**
- Budgets nach KERN §9.
- LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1.
- Lighthouse Leistung ≥ 90 und Zugänglichkeit 100 auf den Messrouten.
- Whisper lädt erst nach dem Klick.

**Was trägt (bestätigt):**
- **JS-Budgets** (inhaltsunabhängig):
  - Die Budgetläufe `tor-stufe-c.log:52–56` (6bb7b6d6) und `tmp-n1/tor/budget.txt` (bb873e8e) melden „Alle Budgets
    eingehalten“: Spieler-Chunk 37,3 KB, Übungstypen ≤ 11,6 KB, Tastatur 1,5 KB.
  - Beide Stände enthalten die echten Inhalte: `git merge-base --is-ancestor a3521abe 6bb7b6d6` gilt, 426 Dateien unter
    `web/inhalte/lernapp`.
  - Seit `fc95e675` ist keine Datei mit `"use client"` geändert worden (G1, 24 Quelldateien geprüft).
- **Eigene Live-Messung (L3)**, Produktion, Chunks aus dem HTML, gz -9 je Datei. Der `noModule`-Polyfill
  `0c0hxoamwjsbw.js` (38,6 KB) zählt nicht, weil moderne Browser ihn nicht laden (KERN §9:226).

  | Route | gesamt KB | eigener Anteil KB | Budget | Bericht |
  |---|---|---|---|---|
  | Grundstock (8 Dateien) | 135,6 | – | – | 135,3 |
  | Hülle `/lern-app/de/quellen` | 144,0 | 8,4 | eigen ≤ 20 | 143,8/8,4 |
  | Start `/lern-app/de` | 149,6 | 14,0 | ≤ 180, eigen ≤ 30 | 149,3/14,0 |
  | Lernpfad `/lern-app/ar/de-aus-ar` | 154,8 | 19,2 | ≤ 180, eigen ≤ 30 | 154,6/19,2 |
  | Fortschritt `/lern-app/de/fortschritt` | 153,5 | 17,9 | ≤ 180, eigen ≤ 30 | 153,3/17,9 |

  Die Budgets halten also auch auf dem echten Vercel-Bau. Spieler und Typ-Chunks laden dynamisch; per curl nicht messbar.
- **Whisper nur nach Klick:** Lauf 3 auf `fd11a59d` (leistung.md §7). Seither keine Änderung am Sprechmodul:
  `git log fd11a59d..d8ec7d5a -- web/src/components/lernapp/sprechen web/src/lib/lernapp/sprechen` ist leer.

**Widerlegt: Die Ladezeiten gelten nicht für den heutigen Inhalt**

1. **Gemessen wurde ohne echte Kursinhalte.** Lighthouse, LCP, CLS und INP stammen aus Lauf 1 (`4d00cadf`) und Lauf 2
   (`fc95e675`, leistung.md:7, 24, 100).
   - `git ls-tree -r --name-only fc95e675 -- web/inhalte/lernapp` ergibt **19 Dateien**: Rahmen, Schemas, Aussprache,
     Koran-Pfad, Symbole. Kein `sprache/`, kein `uebersetzung/`, kein `islam/`.
   - Die Kursinhalte kamen erst mit dem Merge `a3521abe` (24.10. 20:35), danach. `git merge-base --is-ancestor a3521abe
     fc95e675` ist falsch.
   - Damals stand der Seed-Testkurs unter `<kurs>.a1.e01` (`git show 4d00cadf:web/drizzle/seeds/lernapp-test.ts:170–172`,
     „Testeinheit: Alltag“).
   - Der Lernpfad zeigte also eine Einheit statt heute 42–43 je Richtung (254 live). Der Spieler lud das Testpaket mit
     ≈ 16 KB und 4 Lektionen (`tmp-n1/tor/db-verzeichnis-*.json`: 16.039–16.177 B).
2. **Die heutigen Pakete sind viel größer.** Live (L4):
   - `tr.a1.e01`: 114.911 B, 8 Lektionen, 123 Aufgaben, gz 12,9 KB
   - `ar.b1.e16`: 254.118 B, gz 28,5 KB
   - größte Einheit `ar.b1.e01`: 385.964 B
   - Median je Richtung ≈ 190–275 KB, also 7- bis 24-mal das Testpaket.
3. **Der Spieler prüft das ganze Paket vor der ersten Aufgabe.** `src/lib/lernapp/lokal/pakete.ts:41`:
   `PaketSchema.safeParse(roh)` über alle Lektionen, dazu der SHA-256 des Pakets. Das läuft im Hauptthread und wächst mit dem
   Paket.
   - Der Spieler ar lag schon mit dem kleinen Paket bei **genau 90** (leistung.md:109), mit TBT 264–337 ms auf allen
     Spieler-Routen.
   - Ob Lighthouse ≥ 90 und LCP ≤ 2,5 s auf den Messrouten mit echten Einheiten halten, ist **nicht geprüft**.
4. Dasselbe gilt für Lernpfad (43 statt 1 Einheit), Tipps (echte Tipps statt Testtipp, 176,5 von 180 KB JS),
   Wissenskurs und INP-Szenarien (l01/l03 der Testeinheit). Auch dort stammen die Zahlen aus einem Bau ohne Kursinhalte.
5. Der Vorschlag des Prüfers, die Werkzeuge „auf `<kurs>.a1.test` umzustellen“, würde wieder nur das 16-KB-Testpaket
   messen. Das reicht nicht, um diese Lücke zu schließen.

**Hinweis zur Messweise des Spieler-Budgets (kein Verfehlen):**
- `spielerZusaetzlich` (`scripts/lernapp-budget.mjs:208`) zählt den Typ-Chunk der ersten
  Aufgabe mit. Gemessen wird nur `auswahl` mit 2,0 KB.
- **136 echte Lektionen beginnen mit `geschichte`** (9,9 KB), darunter `ar.a1.e01.l06`. Eigene Zählung über
  `web/inhalte/lernapp/sprache/*/*/*.json`: auswahl 432, grammatik_tipp 392, paare 138, geschichte 136, Rest 34.
- Mit derselben Rechnung wären das ≈ 55,4 − 2,0 + 9,9 ≈ 63 KB „zusätzlich“, also über 60. Die Route gesamt bliebe mit
  ≈ 200 KB unter 210.
- KERN §9:233–234 führt den Übungstyp als eigene Zeile mit ≤ 15 KB. Gemeint ist wohl „Spielerkern ohne Typ“. Messweise oder
  Wortlaut sollten das klarstellen.

**Lücken:**
1. LCP, CLS, INP und Lighthouse (Leistung ≥ 90, Zugänglichkeit 100) sind auf dem aktuellen Stand mit echten Kursinhalten
   nicht gemessen. Alle Ladezeitwerte in leistung.md stammen aus einem Bau ohne Sprach-, Wissens- und Übersetzungsinhalte.
2. Die Messwerkzeuge zielen noch auf `a1.e01` (`_lernapp/werkzeuge/leistung/routen.mjs:13–14`, `inp-spieler.mjs`,
   `whisper-netz.mjs`, `lasttest-sync.mjs`, `messlauf.sh:146`). **N4 stellt sie um**, aber auf die Testeinheit (siehe 5.).
3. Hinweis: Die Messweise „Spieler zusätzlich“ hängt vom Typ der ersten Aufgabe ab (siehe oben).
4. Aus der ABNAHME weiter offen: TBT unter Last und PageSpeed nach der Bereitstellung.

**Nacharbeit:**
1. Nach N4 einmal `messlauf.sh` mit Lighthouse (mobil, 3 Läufe) und INP auf dem Merge-Stand mit den echten Inhalten laufen
   lassen. Mindestens messen:
   - Lernpfad `/lern-app/ar/de-aus-ar` mit 43 Einheiten
   - Spieler `…/ueben?l=de-aus-tr.a1.e01.l01` (echt, ≈ 126 KB)
   - Spieler der größten Einheit `ar-aus-de` `ar.b1.e01` (386 KB)
   - eine Lektion, die mit `geschichte` beginnt (z. B. `…a1.e01.l06`)
   - Tipps einer echten Einheit, Wortschatz und Fortschritt mit gefülltem lokalem Stand

   Die Testeinheit nur zusätzlich zum Vergleich. Verfehlt der Spieler 90 oder 2,5 s, die Lektionen einzeln mit
   `LektionSchema` beim Öffnen prüfen statt des ganzen `PaketSchema`, oder die Prüfung in einen Worker legen. Danach
   leistung.md fortschreiben. Ist alles eingehalten, wird Z-L07 erfüllt.
2. `lernapp-budget.mjs` um eine Spieler-Route mit `geschichte` als erster Aufgabe ergänzen. Den Spielerkern ohne Typ-Chunk
   ausweisen, und den Wortlaut in KERN §9 klarstellen (Orchestrator).
3. Querverweis an die Gruppe Oberfläche (Z-L06): Der axe-Lauf in leistung.md §6 lief ebenfalls auf dem Bau ohne
   Kursinhalte (`4d00cadf`).

---

## 3. Z-L12 Betrieb – bestätigt: teilweise

**Schwelle:**
- Produktionsschalter wie KERN §6: ausgeschaltet heißt 404, und die Links verschwinden.
- startklar grün mit Produktionsschaltern.
- Cockpit-Karte „Lern-App“ mit Schalter, Blob, Prüfenden und Einheiten je Status.

**Selbst nachvollzogen:**
- **Schalter im Code:** `src/lib/funktionen-regeln.ts:40`:
  `IN_PRODUKTION_AN = ['hadith_gesamt', 'lernapp', 'lernapp_ungeprueft', 'lernapp_meldungen']`, dazu `standardFuer` `:43–46`.
  Unit `funktionen` 10/10 grün (U1).
- **Live (L1), 01:26 UTC:**

  | Adresse | Status |
  |---|---|
  | `/lern-app/{de,tr,ar}` | 200 |
  | `/lern-app` | 308 |
  | `/lern-app/de/manifest.webmanifest` | 200 |
  | `/lern-app/sw.js` | 200 |
  | `/api/lernapp/sitzung`, `/api/lernapp/gruppe`, `/api/lernapp/schreiben` | 404, Körper 0 B |
  | `/lern-app/de/gruppe`, `/lern-app/de/anmelden`, `/lern-app/de/statistik` | 404 |
  | `/api/lernapp/meldung` | 405 (nur POST) |
  | `/api/health` | 503 `{"status":"fehler"}` |

  - Die Schalterstände decken sich mit KERN §6 (`_lernapp/KERN.md:181–189`) für alle Schalter außer `lernapp` (siehe Lücke 2).
  - In allen 6 Verzeichnissen tragen alle 254 Einheiten `hinweis: true` (`lernapp_ungeprueft` an).
  - `/api/health` liefert 503, weil keine Datenbank antwortet (`src/app/api/health/route.ts:21`). G1 ist offen, das ist
    Umgebung.
- **Links verschwinden:** `src/app/[locale]/(website)/lernen/page.tsx:31` setzt den Link nur bei `funktionAn('lernapp')`.
  `lernapp-schalter` „aus: kein Service Worker, kein Manifest-Link“ ist grün (I1).
- **Schalter → 404 (Integration, grün):**
  - `lernapp-pakete` „Schalter lernapp aus → 404 für Verzeichnis, Paket und Audio“ (I1)
  - `lernapp-sync` „… → 404 ohne Körper“ (I1)
  - `lernapp-anmelden` „Schalter konten oder lernapp aus → 404“ (I2)
  - `lernapp-gruppe` „ohne `lernapp_gruppen` 404“ (I2)
  - `lernapp-testkurs-trennung` „Audio-Route … öffentliche Test-Domain: 404“ (I2)
- **startklar mit Produktionsschaltern:**
  - `startklar.test.ts:302` „saubere Produktionslage ist startklar (keine Fehler)“ mit `produktionsUmgebung()` (`:32–57`,
    ohne `FUNKTION_*`)
  - `:450` „Lern-App (KERN 4.0 §6): Produktion ohne Angaben ohne Befund“
  - Beide grün (I1, 39/39). Die Karte selbst kennt nur `ok`, `hinweis` und `warnung` (`src/lib/startklar/lernapp.ts:51, 72,
    92, 128, 164, 184, 199, 224`); `fehler` gibt es nur, wenn sie nicht lesbar ist (`pruefungen.ts:230–236`).
  - Die CLI ohne Datenbank (`tor-stufe-c/startklar.log:13–96`, eingesehen) zeigt 13 Fehler, alle Umgebung: 11 Variablen,
    `SPEICHER` und die Datenbank. Die Simulation `scratchpad/env-import.sh` entfernt diese Variablen absichtlich.
- **Cockpit-Karte:** `src/lib/startklar/lernapp.ts` mit Schalter, Blob, Prüfenden, Unabhängigkeit, Sprachprüfung, Einheiten
  je Status, Meldungen und Grenzen.
  - Eingehängt in `pruefungen.ts:230`.
  - Auf der Seite `src/app/[locale]/verwaltung/(geschuetzt)/startklar/page.tsx:16–25` im Bereich `lernapp`.
  - `lernapp-verwaltung` „Cockpit-Karte: Schalter, Blob, Prüfende, Einheiten, Meldungen, Grenzen“ grün (I1).

**Lücken (wie der Prüfer, alle selbst bestätigt):**
1. **S-L3 N-4 offen:**
   - Statische Dateien unter `/lern-app/` (`sw.js`, Symbole, 12 Modelldateien mit ≈ 95 MB) liefert Next vor dem Proxy aus.
     Der Matcher `src/proxy.ts:116` schließt `lern-app/(pakete|audio|modelle)` und Pfade mit Punkt aus. Bei `lernapp` aus
     bleiben sie also mit 200 abrufbar.
   - Die Frist lautet „bis zur Abnahme oder AUSNAHME mit Grund“ (`_lernapp/GO-LIVE.md:42, 79`).
   - `git log --all --grep=N-4` findet nur `fa191630` (GO-LIVE) und `324cfc49` (S-L1), keinen Fix.
   - Der Umfang von N2–N4 (`PRUEFPUNKT.md:62–75`) enthält N-4 nicht.
   - Live nicht widerlegbar, weil `lernapp` an ist.
2. **Dokumentation widerspricht dem Code:**
   - KERN §6 `:181` sagt „an nach Abnahme“.
   - `ENTSCHEIDUNGEN.md:289` (L3-E12a) sagt „bleibt in Produktion hinter `FUNKTION_LERNAPP`, bis der Nutzer anders
     entscheidet“. Ein Eintrag L3-E12b fehlt.
   - Der Code ist seit `a023cf1b` (21.10., „Die App ist ein Teil der Seite!“) an.
   - Der Cockpit-Text `lernapp.ts:60` sagt „in der Produktion bis zur Abnahme“.
3. startklar mit Datenbank und Produktionsumgebung ist nur über die Integration belegt (PGlite, synthetische Umgebung). Die
   CLI lief nie so; in der echten Produktion fehlt die Datenbank.

**Nacharbeit:** wie der Prüfer.
1. N-4 vor der ABNAHME entscheiden (Orchestrator bzw. Nutzer):
   - *Entweder* AUSNAHME mit Grund (Nutzerentscheidung `lernapp` an, keine Personendaten) und Ersatz (Kostenbeobachtung
     LM-15, Abmelde-`sw.js` beim Abschalten).
   - *Oder* Firewall-Ratenregel für `/lern-app/modelle/*` und Abmelde-Worker.
   - Nicht in N2–N4.
2. L3-E12b in `ENTSCHEIDUNGEN.md` eintragen, KERN §6 Zeile `lernapp` fortschreiben (Orchestrator). `lernapp.ts:60` mit N4
   angleichen.
3. Im vollen Tor nach N2–N4 `pnpm startklar` mit Datenbank in der Produktionsumgebung ohne `FUNKTION_*`. Erwartet sind 0
   Fehler aus Lern-App und Gemeinde, Umgebungsfehler getrennt ausgewiesen.

---

## 4. Z-L16 Bau – bestätigt: teilweise

**Schwelle:**
- Vercel-Bau ≤ 15 min.
- Beide Betriebsarten grün; Beispielmodus ohne Datenbank spielbar.
- Bestehende Suiten der Website ohne Rückschritt.
- Vorgerenderte Seiten der Website vollständig (1.887).

**Selbst nachvollzogen:**
- **Bauzeit (Belege, eingesehen):**
  - `tor-stufe-c.log:41` „importbau rc=0 dauer=693s“. Gemessen nach dem Schloss, ohne Wartezeit
    (`tor-stufe-c.sh:19–22`: `A=$(date +%s)` nach `flock` und `rm -rf .next`).
  - `tmp-n1/tor/lauf.log:22` „dauer=636s“.
  - Zum Vergleich S1 194 s (`_lernapp/belege/S1-S6-…md:106`).
  - Die Vercel-Dauer selbst ist **nicht geprüft**.
- **Seiten vollständig (R1, eigener Parser):**
  - 200 Routengruppen am 16.10. gegen 237 in N1 und 6bb7b6d6.
  - **Fehlend: keine. Weniger Pfade: keine. Mehr Pfade außerhalb der Lern-App: keine. Neu: 37, alle mit „lern“ im Pfad.**
  - Seiten: `bau-import-na3.log` 1.887; `tor-stufe-c/bau-import.log` und `tmp-n1/tor/bau-import.log` je 2.328.
- **Live gleich dem Merge-Stand (L4):**
  - `tr-aus-de`, `tr-aus-ar`, `de-aus-tr`, `de-aus-ar` je A1 13, A2 14, B1 15; `ar-aus-de`, `ar-aus-tr` je B1 16.
  - Keine `.test`-Einheit, alle 254 mit Hinweis.
  - `tr.a1.e01` „Begrüßung und Vorstellung“ mit Hash `7f428832…`. Das sind 114.911 B, 8 Lektionen und 123 Aufgaben,
    `immutable`, `x-vercel-cache: HIT`. **Der SHA-256 des Körpers stimmt mit dem Hash im Verzeichnis überein** und ist
    gleich `tmp-n1/tor/import-verzeichnis-tr-aus-de.json`.
  - `ar.b1.e16`: 200, 8 Lektionen, 105 Aufgaben.
  - Ein falscher Hash liefert 404.
  - B1 ar (`5404aa06`) liegt weder in `6bb7b6d6` noch in `bb873e8e` (`git merge-base`). Vercel hat also einen Stand gebaut, den
    lokal niemand gebaut hat.
- **Beispielmodus live:** Die Wiederholung (L2) ergibt 61/61 und 15/15 gleiche Statuscodes, 0 × 5xx.
- **Suiten:**
  - check 3.565 und Integration 3.847 grün auf `6bb7b6d6` (`tor-stufe-c.log:4–10`).
  - `tor-n1.log` auf 25515a23 hatte 1 roten Fall (`umgebung`). Auf `d8ec7d5a` sind `umgebung` und `vercel-env-doku` grün (U2).
  - Die von 6bb7b6d6..d8ec7d5a berührten Website-Dateien (`(website)/quellen/page.tsx`, `verzeichnis.ts`,
    `messages/bereiche/quellen.json`, `next.config.ts`: nur ein Kommentar) sind über `lernapp/quellen` und `audio-kette`
    grün (U2). `/quellen` liefert live 200.
- **E2E (Belege):** `netzprotokoll.spec.ts:10` desktop grün (`tmp-n1/tor/e2e2.log:86`, `e2e3.log:83`). `offline.spec.ts:11`
  ist auf telefon und desktop grün (`e2e2.log:17, 91`, `e2e3.log:17, 85`).

**Lücken:**
1. **Vercel-Bauzeit nicht belegt.** Es gibt nur den lokalen Nachbau mit 636–693 s und 23–29 % Reserve. Der Trend steigt:
   194 s → 693 s in 9 Tagen. N3 bringt mehr Koran-Pakete, B2/C1 kommt später.
2. **„Beide Betriebsarten“ heißt Vorschau und Produktion** (ADR 0022: `SITE_MODE` `vorschau` | `produktion`;
   `_gemeinde/AUFTRAG.md:546` „V-02-Build beider Betriebsarten“).
   - Der Prüfer rechnete „Produktion mit und ohne Datenbank“ als beide Betriebsarten. Das ist ungenau.
   - Der letzte Vorschau-Bau ist vom 20.10. (`tor-l1.log`: „vorschau rc=0“, 2.394 Seiten), vor allen Inhalten.
   - Für den heutigen Stand ist dieser Teil damit **offen**, nicht nur ein Nebenbefund.
3. **Beispielmodus nicht vollständig spielbar** (neu als Lücke dieses Kriteriums; der Prüfer führte es als Nebenbefund):
   - Live liefern **39 von 40 Koran-Paketen (de) 404**; nur `koran.grund.e01` liefert 200 (`live/koran-status.txt`, Hashes
     aus dem Live-Verzeichnis `/lern-app/pakete/koran/de`).
   - Koran-Arabisch ist ab e02 ohne Datenbank also nicht spielbar. **N3 behebt das** (N3-a: Koran-Paketparameter aller
     Einheiten im Beispielmodus).
   - Für die Sprachkurse ist „spielbar“ nur über HTTP, die Paketintegrität und das Netzprotokoll belegt. Einen
     Browser-Durchlauf im Bau ohne Datenbank gibt es nicht.
4. **Website-E2E seit dem 20.10. nicht gelaufen.** Letzter Lauf: `e2e-l1-lauf.log`, 1.007 grün. Spätere Läufe umfassten nur
   `tests/e2e/lernapp` (`tor-l6`, `tor-l7`, Stufe C, N1), obwohl sich gemeinsame Website-Dateien geändert haben.
5. Den Merge-Stand `25515a23`…`d8ec7d5a` (B1 ar und N1) hat lokal niemand gebaut. Die Seitenzahl fehlt.
6. Nebenbefund (Gruppe Oberfläche/Verwaltung): Die roten Lern-App-E2E aus `tmp-n1/tor/e2e3.log:403–408` wurden nur zum Teil
   wiederholt (`e2e4.log`).
   - `rahmen.spec.ts:284` und `verwaltung-religioes.spec.ts:117` blieben ungeprüft.
   - `verwaltung-sprachpruefung.spec.ts:44` ist auch in `e2e4.log:21` rot.

**Nacharbeit:**
1. Die Dauer des Vercel-Produktionsbaus von `main` ablesen (Dashboard › Deployments › Build Logs oder `vercel inspect --logs`
   mit Zeitlimit, kein MCP; Orchestrator oder Mensch) und in die ABNAHME eintragen. Nach N2–N4 erneut. Über ≈ 12 min als
   Risiko für B2/C1 in den BERICHT.
2. Im geplanten „Volle E2E und Import-Bau auf dem Merge-Stand“ (PRÜFPUNKT, nach N2–N4) Folgendes ausführen:
   - **Vorschau-Bau** (`VERCEL_ENV=preview` bzw. `SITE_MODE=vorschau`)
   - **volle Website-E2E** gegen 1.007 grün vom 20.10.
   - Lern-App-E2E
   - Import-Bau mit Seitenzahl, Sweep und Routenvergleich
3. Nach N3 die 40 Koran-Pakete live erneut abrufen (erwartet 40 × 200). Dazu einen Rauchtest im Beispielmodus:
   `lektion.spec.ts`, `offline.spec.ts` und `koran.spec.ts` gegen den Import-Bau ohne `DATABASE_URL`. Ersatzweise
   protokolliert ein Mensch eine gespielte Lektion auf der Test-Domain.
4. `verwaltung-sprachpruefung` stabilisieren, `rahmen.spec.ts:284` und `verwaltung-religioes.spec.ts:117` wiederholen
   (Gruppe Oberfläche/Verwaltung).

---

## 5. Zusammenfassung

| Z | Status | Urteil | Kern |
|---|---|---|---|
| Z-L05 | erfüllt | bestätigt | Eigenschaftstests grün (U1). Sync-Integration 27/27 (I1): Schalter → 404, 401, 403, 409, Konten getrennt, zwei Geräte gleich dem Server. E2E zwei Kontexte grün in 3 Läufen. Code am Abgleich seit 6bb7b6d6 unverändert |
| Z-L07 | teilweise | herabgestuft | JS-Budgets erfüllt, auch live nachgemessen; Whisper erfüllt. LCP/CLS/INP/Lighthouse stammen aus Bauten ohne Kursinhalte (`fc95e675`: 19 Dateien unter `web/inhalte/lernapp`, Testpaket 16 KB statt heute 115–386 KB, die vollständig mit Zod geprüft werden). Spieler ar lag bei 90. Neu messen mit echten Einheiten |
| Z-L12 | teilweise | bestätigt | Schalter in Code und live wie KERN §6 außer der nicht nachgetragenen Nutzerentscheidung `lernapp`. Cockpit-Karte vollständig. startklar in der Integration 0 Fehler. S-L3 N-4 offen, nicht in N2–N4 |
| Z-L16 | teilweise | bestätigt | Seiten vollständig (selbst verglichen). Import-Bau lokal 636–693 s. Live = Merge-Stand. Offen: Vercel-Dauer, Vorschau-Bau seit 20.10. (eine der beiden Betriebsarten), Koran im Beispielmodus 39/40 × 404 (N3), Website-E2E seit 20.10. |
