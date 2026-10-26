# Stufe C – Vollständigkeitskritik zum Bericht des Endprüfers (L8-05)

| | |
|---|---|
| Datum | 26.10.2026, 21:45–22:10 UTC |
| Stand | Code `e0292127`; Branch-Kopf beim Lesen `6b6fd41e` (= `e0292127` + `berichte/stufe-c.md`); live `data-bau="e02921275d3b"`. Nachtrag: Während meiner Prüfung kam `d93bb18a` hinzu (21:53 UTC). Er bestätigt L3-E17 und legt L3-E18 (Z-L19) und L3-E19 (Z-L02) fest; berücksichtigt in den Abschnitten „Ergebnis“, 2.1 und 4 |
| Rolle | Vollständigkeitskritik nach dem Endprüfer. Ich prüfe nur und schreibe nur diese Datei; `berichte/stufe-c.md` bleibt unverändert |
| Gegenstand | `_lernapp/berichte/stufe-c.md` gegen jede Teilbedingung in `_lernapp/ABNAHME.md` und gegen Tor L8 (`PLAN.md` §14) |
| Mittel | Dateien und `git diff`/`git log`, Logs (`tor-final/`, `n9b/`, `tor-website-kopf.log`, `n9b-merge-unit.log`), curl GET gegen die Live-Adresse, `python3 -I` |
| Schrift | Diese Datei enthält keine arabische Schrift und keine religiösen Texte (KI-Regel 2, ADR 0040, `_lernapp/KERN.md` §2) |

Pfade unter `scratchpad/` meinen `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/`.

## Ergebnis in Kürze

1. **Zahlen und Zitate des Endprüfers stimmen.** Ich habe sie stichprobenhaft gegen die Logs geprüft: Nummern der
   E2E-Tests, 885 + 201 / 9 / 127, 12/12, 159/0/45, 663/0/7, 194 Dateien und 3.717 Unit-Tests. Auch die Zählung
   16 erfüllt / 3 AUSNAHME / 3 teilweise stimmt.
2. **Z-L06 hielt auf dem Stand des Berichts formal nicht.** Der Status hing an L3-E17, damals noch ein „Vorschlag“, und
   ABNAHME kennt keinen bedingten Status. `d93bb18a` hat L3-E17 inzwischen bestätigt; damit ist Z-L06 **erfüllt**. Offen
   bleibt nur der Prüfumfang (Abschnitt 2.1).
3. **Zwei „erfüllt“ halten, brauchen aber eine ausdrückliche Auslegung:**
   - Z-L01: Gezählt wird aus den Dateien, nicht was ausgeliefert wird. Die Lemmata live liegen bei tr 91,8 % und ar 94,5 %.
     Das fehlt im Bericht.
   - Z-L05: Ohne Konto bzw. ohne Einwilligung antwortet die Route mit 401 bzw. 403, nicht mit 404.
4. **Größte Lücke ist das Urteil gegen Tor L8.** `PLAN.md` §14 verlangt: „Z-L01…Z-L22 erfüllt oder als AUSNAHME mit Grund
   und Ersatz“. „Abgenommen mit Auflagen“ mit drei „teilweise“ sieht das Tor nicht vor. Punkt 2 der Liste „Vor der Übergabe
   nötig“ will Z-L07 ausdrücklich als „teilweise“ weiterführen; das widerspricht dem Tor. Z-L19 ist seit `d93bb18a` (L3-E18)
   als AUSNAHME entschieden. Offen sind noch Z-L07 und Z-L16.
5. **Die Liste „Vor der Übergabe nötig“ ist unvollständig.** Es fehlen:
   - das Nachführen von ABNAHME.md, das Fertigstellen von BERICHT.md und das neue ABSCHLUSS.md;
   - die Auslegung zu Z-L01;
   - der Prüfumfang am Endstand für Integration und Website-E2E;
   - der Hinweis, dass die Probe zu Z-L19 nicht wiederholbar ist.

## 1. Teilbedingungen der „erfüllt“-Kriterien: Was im Bericht belegt ist und worauf es beruht

| Z | Teilbedingungen der Schwelle ohne Beleg im Bericht | Beleg im Bericht beruht auf | Bewertung der Kritik |
|---|---|---|---|
| Z-L01 | Die Auslegung „Menge“ fehlt: In den Dateien oder ausgeliefert? Die Lemmata live fehlen | `mengen.md` vom Stand `ee75cbc1`, also vor dem Tor. Seitdem hat sich nur eine Zeile geändert (`f4029d4b`, Ablenker `ar.b1.e14`), die Zahlen gelten weiter. Übersetzungen selbst gezählt | hält nach den Dateien; Auslegung festhalten (Abschnitt 2.2) |
| Z-L03 | „0 Bedeutungen von Agenten“ und „Wurzeln nur aus der eigenen Tabelle mit zwei Freigaben“ | C-religion bzw. C-religion-gegen (älterer Stand) und live | hält. Eigene Probe live: Koran de, 40 Einheiten, erste mit `bedeutungen: 0` und 0 Lektionen; `islam` 0 Einheiten |
| Z-L04 | – | `n9b/e2e4.log`, live | hält. Nr. 14/16/17/29 und 117/119/120/130 sowie `regression.spec:31` (45/140) sind grün. Lern-App-Worker live ist **byte-gleich** mit `web/public/lern-app/sw.js` am Endstand (SHA-256 `791b88b2…`). Der Root-Worker trägt die Präfixregel `igmg-lernapp-` |
| Z-L05 | „Konten getrennt“ und „Einwilligung `lernapp`“ fehlen im Bericht | C-technik: `lernapp-sync` 27/27 auf älterem Stand; Integration im Tor `e06a648b` grün | hält. Der Abgleich-Code ist seit `d8ec7d5a` unverändert (eigener `git diff`, leer). Wortlaut der Schwelle: „sonst 404“ gilt nur für den Schalter. Ohne Konto antwortet die Route mit 401, ohne Einwilligung mit 403 (`lernapp-sync.test.ts:191`). In ABNAHME klarstellen |
| Z-L06 | „keine Zeitgrenzen“ hing an L3-E17 (beim Bericht noch Vorschlag). Prüfumfang „alle Lern-App-Routen“ | `n9b/e2e4.log`, Code | auf dem Stand des Berichts **teilweise**; seit `d93bb18a` (L3-E17 bestätigt) erfüllt. Prüfumfang offen (Abschnitt 2.1) |
| Z-L08 | – | Beleg Z-L08 auf Bau 1 (`515a463f`, vor N9a); E2E nur desktop | hält. Hinweis wie im Bericht. Live gilt `spracherkennung: false`, das Modell wird in der Produktion also nie geladen |
| Z-L09 | Sechs der zehn Teilbedingungen fehlen im Bericht: keine Freitext-Kommunikation; Bestenliste nur mit eigener Zustimmung; Lehrkraft nur eigene Gruppe; Abgleich von Kinderkonten nur mit Einwilligung der Eltern; Push nur mit `push_kind` (nur als Code genannt); Bildkarten ohne Fotos und Gesichter | C-oberflaeche(-gegen) auf `d8ec7d5a`, im Bericht nicht zitiert | hält (Abschnitt 2.4) |
| Z-L10 | „0 sichtbare Einträge mit `religionsbezug` … auch bei `lernapp_ungeprueft` an“ | – | hält. `tests/unit/lernapp/freigabe-zwei.test.ts:257` prüft Schalter an und aus, mit und ohne Formelliste; Unit am Endstand grün |
| Z-L11 | „keine hochzählenden Zahlen“ | C-oberflaeche; `bewegung-regeln` in der Unit am Endstand | hält. Neu seit dem Tor ist nur der Chevron `group-open:rotate-180 motion-safe:` im Lernpfad (Muster wie auf der Website). Der Ring in `OfflineEinheit` ist B-27 (`_gemeinde/KERN.md`) |
| Z-L12 | Cockpit-Karte nur über C-technik belegt | C-technik, Integration im Tor | hält (Abschnitt 2.3) |
| Z-L13 | „Harakat nicht abgeschnitten“; „Seiten mit arabischem Inhalt nach der RTL-Eingrenzung unverändert“ | C-oberflaeche auf `d8ec7d5a` | hält. Seit dem Tor ist in `globals.css` nur `zeichnen-bei-sicht` hinzugekommen. `barrierefreiheit.spec` (Koran-Seiten) ist am Endstand grün (`tor-website-kopf.log`) |
| Z-L14 | „Namensnennung je Eintrag 100 %“ (der Prüfer meldet „Quelle und Lizenz“) | `tor-final/pruefen.log`; Inhalte seitdem gleich | hält. Eigene Probe live, Paket `de-aus-tr/de.a1.e05`: 21 Tatoeba- und 37 Wiktionary-Einträge, alle mit Namensnennung, Paket `CC-BY-SA-4.0`. **Hinweis, im Bericht nicht genannt:** `ar.b1.e10`/`e11` (Vereinswahlen, Staat, Verfassung) sind mit Hinweis live, obwohl OF-10 offen ist. `de.b1.e16` bleibt aus demselben Grund Entwurf. Steht in `MENSCHEN.md` (Nachträge Stufe C) |
| Z-L17 | „100 % der ausgelieferten Posten im Verzeichnis (Abgleich gegen `package.json`)“ | C-lizenzen | hält. Seit dem 23.10. gibt es keinen Commit an `web/package.json` oder `pnpm-lock.yaml`. `quellen.spec:71` ist offline auf beiden Projekten grün (Nr. 22 und 124) |
| Z-L18 | KELLY, SUBTLEX-DE, DeReWo, Shamela, Hisn al-Muslim, kaikki mit `ref` | Der Bericht nennt nur `ausschluss` (OpenITI, QAC) | hält. Die übrigen Ausschlüsse prüft `inhalt/pruefer/lizenz.ts:28–42` (`AUSGESCHLOSSENE_QUELLEN`), im Tor 0/0/0 |
| Z-L20 | – | 0 Clips, `stimmen.ts` | hält, weil es 0 Clips gibt |
| Z-L22 | „jede Version bei Aufnahme ≥ 14 Tage alt“; „Dev-Build von onnxruntime-web im Lockfile fixiert“ | C-lizenzen | hält. Seit C-lizenzen keine Änderung an den Abhängigkeiten. Lockfile `onnxruntime-web@1.31.0-dev.20260914-8d85527a0`. Die vier `requirements*.txt` haben 0 ungepinnte Zeilen |

## 2. Nachprüfung der drei schwächsten „erfüllt“

### 2.1 Z-L06 Zugänglichkeit → auf dem Stand des Berichts **teilweise**, seit `d93bb18a` **erfüllt**

- **Bedingung offen:** `ENTSCHEIDUNGEN.md:340` lautet: „L3-E17 … (Vorschlag, vom Orchestrator zu bestätigen)“. Unter „Folge“
  steht: „Z-L06 ‚keine Zeitgrenzen‘ gilt mit dieser Ausnahme als erfüllt, **sofern der Orchestrator sie bestätigt**; sonst
  wäre eine einstellbare Länge nötig“. Der Endprüfer „trägt das mit“, kann die Bestätigung aber nicht ersetzen. Die
  Statusliste der ABNAHME kennt kein „erfüllt unter Bedingung“.
- **Selbst bestätigt** (`n9b/e2e4.log`, Bau 5 aus `78f79978`; bis zum Endstand haben sich nur `leistung.md` und
  `whisper-netz.mjs` geändert):
  - axe-Matrix `zugaenglichkeit.spec`: 13 Tests auf telefon (Nr. 70–105) und 13 auf desktop (Nr. 172–195), alle grün. Die
    Spec prüft auch den Überlauf (`:36–44`, `scrollWidth − clientWidth` = 0).
  - `tastatur.spec`: alle 10 Desktop-Tests grün (Nr. 180–197). Die Kommentare nennen alle 26 Typen. In `tastatur.spec.ts`
    und `tastatur.ts` stehen weder `.click(`, `.fill(` noch `locator.focus()`.
  - `typen-b:453` „Höchstlänge 15 s“ ist zweimal grün (Nr. 202, 203).
  - Übersprungen sind auf desktop nur die Varianten „per Tippen“ (laufen auf telefon) und die Bildschirmfotos.
- **Prüfumfang uneinheitlich:** Für Z-L19 zählt der Bericht Verwaltung › Lern-App nach ADR 0042 Nr. 10 zur Lern-App. Für
  Z-L06 („alle Lern-App-Routen“) wendet er das nicht an.
  - Ohne axe im E2E sind fünf Seiten: `/verwaltung/lernapp` (Übersicht), `…/befunde`, `…/kurse/[kurs]`, `…/pruefende` und
    `…/quellen` (grep über `tests/e2e`).
  - Mit axe sind Meldungen (`melden.spec:103`), Sprachprüfung (`verwaltung-sprachpruefung.spec:56/88/128`), Audio-Studio
    (`verwaltung-audio.spec:110`), Religiöse Prüfung und Mein Bereich › Lehrkraft (`gruppe.spec`, de/tr/en).
  - Entweder den Umfang ausdrücklich auf `/lern-app/**` begrenzen (die Verwaltung gibt es nur auf Deutsch) oder die fünf
    Seiten in die axe-Prüfung aufnehmen.
- **Der Fokusverlust** in `Sprechen.tsx` (WCAG 2.4.3) ist im Bericht richtig als niedrig eingestuft.

**Vorschlag:** Auf dem Stand des Berichts war Z-L06 **teilweise**. Seit `d93bb18a` steht L3-E17 in ENTSCHEIDUNGEN als „vom
Orchestrator bestätigt“. Damit ist Z-L06 **erfüllt**, mit der WCAG-Ausnahme „wesentlich“. In ABNAHME stehen sollen der
Verweis auf L3-E17 und der festgelegte Prüfumfang.

### 2.2 Z-L01 Umfang → hält nach den Dateien; die Auslegung fehlt

- `berichte/mengen.md` (Stand `ee75cbc1`): de 42/336/2.800/11.333, tr 42/336/2.758/11.488, ar 42/336/2.800/11.363 gegen
  42/336/2.800/11.200, Übersetzungen je Richtung 100 %. Danach hat sich nur `f4029d4b` geändert (eine Zeile, Ablenker); die
  Zahlen gelten also am Endstand.
- In derselben Datei steht **ausgeliefert** (Tabelle „Freigegeben, in Aufgaben verwiesen und live“):

  | Ziel | Sätze live (% des Ziels) | Lemmata live (% des Ziels) |
  |---|---:|---:|
  | de | 83,3 | 95,2 |
  | tr | **67,6** | **91,8** |
  | ar | **67,8** | **94,5** |

  `mengen.md` sagt selbst: Der Vorrat „erreicht kein Gerät, denn der Paketbau übernimmt nur verwiesene Einträge“.
- Der Bericht nennt nur die Sätze (tr/ar). Dass **die Lemmata live bei tr und ar unter Ziel − 5 % liegen**, fehlt.
- Die Spalte „Beleg“ der ABNAHME sieht einen Mengenbericht „aus den Inhaltsdateien“ vor. Gemessen daran ist „erfüllt“
  vertretbar. Wer die Schwelle aber als „bei Lernenden vorhanden“ liest, kommt für tr und ar auf „teilweise“.
- **Vorschlag:** Die Auslegung („Menge = Inhaltsdateien; Vorrat zählt“) in ABNAHME festhalten und die Live-Anteile von
  Sätzen **und** Lemmata in den BERICHT übernehmen. Alternativ entscheidet der Nutzer die Auslegung.
- Live geprobt: Das Verzeichnis `de-aus-tr` hat 42 Einheiten, Einheit `de.a1.e05` mit `hinweis: true` und `audio: []`.

### 2.3 Z-L12 Betrieb → hält; zwei Hinweise fehlen im Bericht

- **Schalter:**
  - `web/src/lib/funktionen-regeln.ts:41` setzt `IN_PRODUKTION_AN` auf `hadith_gesamt`, `lernapp`, `lernapp_ungeprueft` und
    `lernapp_meldungen`. Das entspricht KERN §6 mit Fortschreibung L3-E12b.
  - Live am 26.10. gegen 21:50 UTC, Bau `e02921275d3b`:
    - `…/ueben` liefert `spracherkennung: false`, also ist `lernapp_sprechen` wie verlangt aus. `Permissions-Policy`
      enthält `microphone=(self)`.
    - 404 bei `/lern-app/de/gruppe` und `/lern-app/de/anmelden` sowie bei `/api/lernapp/sitzung|gruppe|schreiben|statistik`.
    - `/api/lernapp/meldung` liefert auf GET 405 (die Route ist an); `/lern-app/sw-abmelden.js` liefert 200.
- **Cockpit-Karte:**
  - `web/src/lib/startklar/lernapp.ts` meldet Schalter, Blob, Prüfende (religiös, unabhängig, je Sprache), Einheiten je
    Status, Meldungen und Grenzen. Getestet in `tests/integration/lernapp-verwaltung.test.ts:719`.
  - Die Karte zeigt 6 der 9 Lern-App-Schalter. Rangliste, Statistik und `push_lernapp` meldet `startklar/gemeinde.ts:46–64`
    mit ihren Sperren.
- **startklar mit Produktionsschaltern:**
  - `tests/integration/startklar.test.ts:302` („saubere Produktionslage ist startklar“) und `:450` („Lern-App … Produktion
    ohne Angaben ohne Befund“) liefen im Tor `e06a648b` grün.
  - Der Code von `startklar` hat sich seitdem nicht geändert (`git diff e06a648b e0292127` ohne `startklar`).
- **Hinweise, die im Bericht fehlen:**
  - Live antwortet `/api/health` mit **503** `{"status":"fehler"}`, weil die Datenbank fehlt. Das steht weder in GO-LIVE
    noch im BERICHT.
  - `lernapp_meldungen` ist in der Produktion an, wirkt ohne Datenbank aber nicht. `_lernapp/GO-LIVE.md:46` dokumentiert
    das; zu „Betrieb“ gehört es in den Bericht.

### 2.4 Ergänzend: Z-L09 Kinderschutz (Beleg im Bericht dünn, die Sache hält)

- **Code unverändert:** `git diff d8ec7d5a e0292127` ist leer für `lib/lernapp/gruppe`, `lib/lernapp/schreiben`,
  `lib/lernapp/sync`, `meldung.ts`, `einwilligung.ts` und `app/api/lernapp`. Damit gelten die Belege aus
  C-oberflaeche-gegen (Unit und Integration grün, Code gelesen) weiter. Die Integration lief im Tor grün.
- **Selbst gelesen:**
  - `gruppe/regeln.ts:70–83`: Eintrag in der Bestenliste nur ab 16, mit eigener Zustimmung und mit Einwilligung; sehen
    darf die Liste nur, wer selbst darin steht.
  - `schreiben/kinderschutz.ts`: Kommentar an Kinder hart gesperrt (`ENTSCHEIDUNG_D_L16 = null`).
  - `lernapp-verwaltung.test.ts:370`: Kinderkonto, die Antwort wird verworfen.
- **E2E an Bau 5:** `gruppe.spec:155` (Nr. 97), `gruppe.spec:317` (Nr. 104), `mein-bereich-lernen.spec:184` (Nr. 178) und
  der Kinderzugang `rahmen.spec:284` (Nr. 152) sind grün.
- **Hinweis zur Teilbedingung „keine Freitext-Kommunikation“:** Lehrkräfte können Lernenden ab 16 einen Freitext-Kommentar
  zurückgeben (`schreiben/dienst.ts:459–477`). C-oberflaeche-gegen ordnet das als „einseitig, KERN §5 bezieht sich auf
  unter 16“ ein. Diese Auslegung gehört in den Bericht, ebenso D-L16 (offen, LM-08).
- **Personen-Piktogramme in Oberflächensymbolen** (C-oberflaeche-gegen Nr. 4, LM-34): Die Entscheidung steht nicht in der
  Liste „Nur Menschen“.

## 3. Weitere eigene Proben (bestätigend)

- **E2E im vollen Tor:**
  - `tor-final/e2e.log`: 885 grün, 8 rot, 125 übersprungen. `e2e-rest.log`: 201 grün, 1 rot, 2 übersprungen. Rot sind
    8 × Cüz und 1 × `gruppe:155`.
  - Wiederholungen: `e2e-wdh3.log` 12/12 grün (deckt alle 8 Cüz-Fälle), `e2e-wdh2.log` 2/2 grün.
  - Kleinigkeit: `tor-final/zusammenfassung.md` zählt „7× Cüz“; richtig sind 8 (7 in Lauf 1, 1 im Rest). Der Bericht nennt
    richtig 8.
- **Endstand:**
  - `scratchpad/n9b-merge-unit.log` (21:01 UTC, `/home/user/IGMG/web`): 194 Dateien, 3.717 grün.
  - `n9b/tor4.status`: Bau 5 aus `78f79978`, Lern-App-E2E 159/0/45, Budget eingehalten. Der E2E lief mit dem
    **Whisper-Worker als Attrappe** (`lernapp:modelle … Worker ATTRAPPE`); das deckt der Beleg Z-L08 ab.
  - `tor-website-kopf.log`: 663/0/7 aus nur sechs Spezifikationen. Der Bau dafür lief mit `E2E_ATTRAPPEN=1`. Der Bericht
    nennt ihn „Produktionsbau `e0292127` rc 0“; genauer ist „Testbau mit Attrappen“.
- **Live, ohne Cookies:** Paket `de-aus-tr/de.a1.e05` liefert 200 und `application/json` ohne `Set-Cookie`.

## 4. „Vor der Übergabe nötig“ – Vollständigkeit

Die fünf Punkte des Endprüfers sind berechtigt. Es fehlen:

1. **Tor L8 statt „Auflagen“** (`PLAN.md` §14, Zeile „Tor L8“):
   - Z-L07, Z-L16 und Z-L19 müssen vor der Übergabe **erfüllt** sein oder als **AUSNAHME mit Grund und Ersatz**
     eingetragen werden.
   - Punkt 2 („… Z-L07 als Auflage ‚teilweise‘ in ABNAHME und BERICHT führen“) ist so nicht zulässig. Vorschlag:
     AUSNAHME mit Grund (Lighthouse-Leistung 80–89 auf einem langsameren Rechner unter Last) und Ersatz (Budgets, LCP, CLS,
     INP, Lighthouse-Zugänglichkeit 100). Andernfalls entscheidet der Nutzer.
   - Ebenso Z-L16: Vercel-Bauzeit, Ersatz lokaler Bau 609 s.
   - Z-L19 ist mit `d93bb18a` (L3-E18) als AUSNAHME entschieden; Bestätigung durch Menschen über LM-37.
   - Das Urteil „abgenommen mit Auflagen“ ist danach anzupassen.
2. **ABNAHME.md nachführen:**
   - Kopf „Stand: 16.10.2026, L0 – noch nicht geprüft“; 21 Kriterien stehen noch auf „offen“.
   - Z-L07 steht dort auf „erfüllt (24.10.2026)“ und widerspricht damit dem Bericht („teilweise“).
   - Alle Spalten „Status“ und „Beleg“ sind durch die gefundenen Belege zu ersetzen, wie es der Kopf der Datei verlangt.
     Der Bericht nennt nur die AUSNAHME zu Z-L02.
3. **BERICHT.md fertigstellen:**
   - Der Entwurf stammt von 09:15 UTC (`528b0af2`); die Galerie zeigt den Bau `25ce3abf`, also den Stand vor N8 und N9.
     Das Endurteil fehlt.
   - Den Vorführpfad (`AUFTRAG.md` §6) am Endstand durchgehen: Station 1 hat jetzt den Menüpunkt im Kopf. Station 3 hat sich
     durch N9a geändert (Stufe speichern, Bauwechsel). Stationen 6 und 7 laufen nur im Beispielmodus.
   - Übernehmen: die Hinweise zu Z-L01 (Vorrat, Lemmata live), zu Z-L12 (`/api/health` 503, Meldungen ohne Datenbank) und
     zu Z-L14 (`ar.b1.e10`/`e11` mit OF-10 offen).
4. **ABSCHLUSS.md fehlt:** `PLAN.md` L8-05 nennt `_lernapp/ABSCHLUSS.md` als Ergebnis.
5. **Z-L01:** Die Auslegung der Mengen in ABNAHME festhalten (Abschnitt 2.2).
6. **Z-L06:** Den Prüfumfang „alle Lern-App-Routen“ festlegen. Bei Einschluss der Verwaltung fünf Seiten mit axe
   nachprüfen (Abschnitt 2.1).
7. **Prüfumfang am Endstand offenlegen:**
   - Integration und die übrigen Website-E2E liefen zuletzt am Tor-Stand `e06a648b`. Das betrifft Koran, Hadith, Elifbe,
     Verwaltung, Konto und Chat, zusammen 406 Website-Tests auf beiden Projekten (gezählt in `tor-final/e2e*.log`).
   - Danach kamen N8, N9a und N9b sowie der Kopfmenü-Commit `1482184c`, der alle Website-Seiten berührt. Am Endstand liefen
     nur sechs Website-Spezifikationen.
   - Für „bestehende Suiten der Website ohne Rückschritt“ (Z-L16) am Endstand: das im Bericht nennen oder nachholen.
8. **Z-L19 ist nicht wiederholbar:**
   - Die Probe des Endprüfers lief auf der Ausgabe des Attrappen-Baus im Arbeitsbaum `l3-05`.
   - `tor-website-kopf.sh` hat `.next` am Ende gelöscht, das Verzeichnis gibt es nicht mehr.
   - Der Regeltest auf die Bau-Ausgabe aus Punkt 1 des Endprüfers soll deshalb gegen einen echten Produktionsbau laufen
     und sein Log ablegen.
9. **MENSCHEN.md und GO-LIVE.md:**
   - Kann der Orchestrator die Vercel-Bauzeit nicht ablesen, gehört sie als Aufgabe in MENSCHEN.
   - LM-34 um die Personen-Piktogramme in Oberflächensymbolen ergänzen.
   - In GO-LIVE die Entscheidungen L3-E17 und L3-E18 nachtragen. `d93bb18a` hat nur ENTSCHEIDUNGEN, MENSCHEN und ADR 0042
     geändert, nicht GO-LIVE und nicht ABNAHME.

## 5. Nicht selbst nachgeprüft

- Z-L07: Messwerte zu Lighthouse und INP (`leistung.md` N8/N9a, `tmp-n8/`). Ich habe sie nicht nachgemessen; das Kriterium
  ist ohnehin „teilweise“.
- Z-L19: Zählung `@img/sharp-libvips` in `.nft.json`. Die Bau-Ausgabe ist gelöscht (siehe 4.8).
- Z-L08: Den Beleg mit echtem Modell habe ich nur gelesen, nicht wiederholt.
- Z-L16: Die Vercel-Bauzeit ist ohne die Werkzeuge des Orchestrators nicht zugänglich.
- Z-L13: Harakat und Sichtvergleich gibt es nur aus C-oberflaeche (`d8ec7d5a`). Seither gibt es keine einschlägige
  CSS-Änderung, aber keine neue Sichtprüfung.
- Z-L11: Eine Browserprüfung mit `reducedMotion` in der Lern-App gibt es nicht (Hinweis aus C-oberflaeche-gegen).
- Z-L14: Die Abarbeitung jeder einzelnen Befundzeile aus C-inhalte-gegen habe ich nicht nachgeprüft.
