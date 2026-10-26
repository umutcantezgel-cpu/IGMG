# Stufe C – Endprüfung der Lern-App (L8-05)

| | |
|---|---|
| Datum | 26.10.2026, 21:00–21:45 UTC |
| Stand | `e0292127` (Branch `claude/trusting-lovelace-6nfolz` = `main` = `origin/main`) |
| Rolle | **Endprüfer Stufe C, frisch** (L3-E12): an diesem Lauf nicht beteiligt, urteilt unabhängig |
| Kriterien | Z-L01…Z-L22 aus `_lernapp/ABNAHME.md`; Umfang Sprachkurse A1–B1 in 6 Richtungen (L3-E16), B2/C1 offener Ausbau; Freigabe nach L3-E15 |
| Grundlage | Protokolle `_lernapp/protokolle/C-*.md` (Prüfer und Gegenprüfer je Gruppe); Nacharbeit N1–N9 (`PRUEFPUNKT.md`, Commits); Logs volles Tor (`tor-final/`, Stand `e06a648b`), N9a (`tmp-n9a/s3/e2e-voll.log`), N9b (`n9b/e2e4.log`, Bau 5 aus `78f79978`); `_lernapp/berichte/leistung.md`; `_lernapp/belege/Z-L08-sprechen-datenfluss.md` |
| Live | `https://igmg-wetzlarer.vercel.app`, nur GET mit curl, 21:04–21:36 UTC. Die meisten Proben liefen auf `data-bau="b20c0f24c073"` (N9a live, ohne N9b). Gegenüber dem Endstand unterscheidet sich der App-Code darin nur in `Sprechen.tsx`, `schreibmarke.ts`, `format.ts` und drei Textschlüsseln. Ab 21:36 UTC trägt live `data-bau="e02921275d3b"` (= Endstand); nachgeprüft: Spieler ohne `Set-Cookie`, Verzeichnisse unverändert (42/43 Einheiten, 0 Audio, alle mit Hinweis) |
| Schrift | Diese Datei enthält keine arabische Schrift und keine religiösen Texte (KI-Regel 2, ADR 0040, `_lernapp/KERN.md` §2) |

## Eigene Proben (Auswahl)

- **Endstand-Prüfungen selbst gefahren:** Religion-Prüfung grün (6.645 Dateien, Wächter über 405 Lern-App-Dateien);
  `sprachen:pruefen` grün (Lern-App 892 Schlüssel de/tr/ar). Logs des Orchestrators am Endstand gelesen: Unit 194 Dateien, 3.717
  grün; `pnpm typen` grün.
- **Inhalte:** Eigene Zählung über `web/inhalte/lernapp/**` (Python, nur Dateien):
  - Übersetzungen A1–B1 je Richtung 100 % der Zielsätze und Lemmata. Es fehlen nur die Vorkurs-Sätze der jeweils anderen
    Ausgangssprache (`de.a1.e00-ar` 59 und `de.a1.e00-tr` 7), die nicht zur Richtung gehören.
  - 4 von 68.534 Satzübersetzungen sind gleich dem Zielsatz. Alle vier sind Buchstabiersätze („J – A – N“) und damit
    zulässig.
  - `de.b1.e04.s0071` in de-aus-tr ist jetzt türkisch.
  - 0 Einträge mit `religionsbezug` in den Sprachkursen.
  - Wissenskurs: 26 Dateien, 0 arabische Zeichen, 2.124 Aussagen mit Belegen (keine leer), 4.603 Belege, alle `sinngemaess`.
  - Lektionstexte: 0 Spendenaufrufe; einzige Adresse `personel@example.org`.
- **Live:**
  - 6 Kursverzeichnisse: je A1 13 (mit Vorkurs), A2 14, B1 15 bzw. 16 (ar). `hinweis: true` 254/254, `audio` 0, keine Test- oder
    e16-Einheit außer dem freigegebenen `ar.b1.e16`.
  - `islam` 0 Einheiten.
  - Koran de/tr je 40 Einheiten, alle 80 Pakete 200, 0 Bedeutungen, 0 Lektionen, kein Audio.
  - Stichprobe 12 Pakete: 0 `audio`, 0 `test:ton`, 0 `religionsbezug`, Hörübungen enthalten (also „Audio folgt“).
  - Kopfzeilen von 8 Lern-App-Adressen: 0 `Set-Cookie`, CSP `connect-src 'self'`, Mikrofon nur auf `…/ueben` und
    `…/wiederholen`.
  - `/lern-app/ar` mit `dir="rtl"`; Website `/ar` 404.
  - Schalter-Routen `gruppe`, `anmelden`, `/api/lernapp/sitzung|gruppe|schreiben` 404; `/lern-app/sw-abmelden.js` 200.
  - Whisper `config.json` und `tokenizer_config.json` mit der SHA-256 aus `QUELLE.md`.
  - Menüpunkt `/lern-app/de` bzw. `/lern-app/tr` im Kopf der Website.
- **Bau-Ausgabe des Endstands** (Arbeitsbaum `l3-05`, nur gelesen, `.next` aus `e0292127`): `.nft.json` nach
  `@img/sharp-libvips` durchsucht:
  - Lern-App öffentlich (`lern-app/**`, `api/lernapp/**`): 0 von 24 Funktionen.
  - Verwaltung › Lern-App: 11 von 12 Seiten; frei ist nur der Route-Handler `aufnahme/[id]`.
  - Mein Bereich › Unterricht › Lern-App: ebenfalls mit libvips.
  - Alle Seiten: 176 von 191 tragen libvips. Frei sind nur die 13 Seiten der Lern-App mit eigenem Wurzel-Layout und die
    beiden Fehlerseiten.
  - Ursache ist die Website-Hülle unter `[locale]`, nicht Code der Lern-App (siehe Z-L19).
- **Code gelesen:**
  - `rechte/schutzrollen.ts` (religiöse Prüfung nie mit Administration, nie an sich selbst) und `lernapp/freigabe.ts`
    (Administration zählt nie).
  - `formelliste.ts` (Freigabe nur mit Status und zwei Freigaben).
  - `inhalt/pruefer/uebersetzung.ts`.
  - `audio/stimmen.ts` (Freigabe erst nach Hörabnahme).
  - `offline.spec.ts` (Stufe speichern, Wiederholen ohne Netz, Bauwechsel G-1).
  - `zugaenglichkeit.spec.ts`.
  - `tastatur.spec.ts`: alle 26 Übungstypen kommen darin vor.
  - `sprechen/Sprechen.tsx`.

## Ergebnis je Kriterium

| Z | Thema | Status | Beleg (konkret) | Offen |
|---|---|---|---|---|
| Z-L01 | Umfang Sprachkurse | **erfüllt** (Umfang A1–B1, L3-E16) | **Mengen:** `berichte/mengen.md` (N7, `mengen.mjs` mit Stufenauswahl), je Zielsprache: de 42/336/2.800/11.333, tr 42/336/2.758 (98,5 %)/11.488, ar 42/336/2.800/11.363 gegen 42/336/2.800/11.200; freigegeben jede Menge ≥ 95 %. Inhalte seit dem Tor unverändert (`git diff e06a648b e0292127 -- web/inhalte/lernapp` leer). **Übersetzungen:** eigene Zählung 100 % je Richtung. **Weiteres:** Vorkurse und Einstufungsbank vorhanden; Einstufung überspringt den Vorkurs (N7). **Live:** 6 Kurse A1–B1 | Hinweis: Rund ein Drittel der tr/ar-Sätze ist Vorrat ohne Aufgabe; live sind es 67,6 % (tr) und 67,8 % (ar) des Satzziels. Das ist regelkonform, gehört aber in den BERICHT |
| Z-L02 | Wissenskurs | **AUSNAHME** (Menge) | 26 von 28 Einheiten entworfen (92,9 % < 95 %); `islam.vertiefung.e04/e05` zurückgestellt, weil kein Werk benannt ist (LM-04, `lehrplan/WISSEN.md` §2). Alle Aussagen belegt, nur `sinngemaess`, 0 arabische Schrift (eigene Zählung). Live 0 Einheiten sichtbar. Zwei Freigaben erzwungen: Administration zählt nie und kann sich die Rolle nicht selbst geben (N2, `schutzrollen.ts`, `freigabe.ts`). Auslieferungsweg nach zwei Freigaben belegt (N3; E2E `zugaenglichkeit.spec` „Wissens- und Koran-Kurs“ mit Seed-Freigaben, de/tr/ar × 390/1440 grün). **Grund:** LM-04. **Ersatz:** Die Einheiten bleiben unsichtbar zurückgestellt | Die AUSNAHME 26/28 ist noch nicht in ABNAHME/ENTSCHEIDUNGEN festgehalten (Vorschlag der Gegenprüfung) |
| Z-L03 | Koran-Arabisch | **erfüllt** | Live 80/80 Koran-Pakete 200 (vorher 78 × 404, behoben in N3) mit nur `stelle`, `text`, `vorkommen` je Wortform; 0 Bedeutungen, 0 Lektionen, kein Audio. Keine Wurzeltabelle, 0 Bedeutungen von Agenten (C-religion, bestätigt). Integration `lernapp-koran` grün im vollen Tor | Bedeutungen und Wurzeln nur durch Menschen (LM-13, LM-31) |
| Z-L04 | Offline | **erfüllt** (echte Geräte und iOS: UMGEBUNGSAUSNAHME LM-07/MN-19, Ersatz Telefon-Emulation) | `offline.spec` an Bau 5 telefon und desktop grün (`n9b/e2e4.log` Nr. 14/16/17/29, 117/119/120/130): Einheit speichern + Lektion ohne Netz; „Stufe offline speichern“ mit Abbruch; Stufe gespeichert, Netz weg (`setOffline` und Abklemmen auch im SW): andere Einheit, Hörübung aus dem Bündel, **Wiederholen bis fertig**; **Bauwechsel G-1** (Kursvorrat `igmg-lernapp-kurse-v…` überlebt, ehrliche Anzeige, Wiederherstellung). `regression.spec:31` Root-SW-Update behält die Vorräte (beide grün). Live: Lern-App-Worker = Repo-Datei, Vorräte `schale`, `kurse`, `pakete`, `audio`, `modelle`; Root-Worker mit Präfixregel `igmg-lernapp-` | – |
| Z-L05 | Abgleich | **erfüllt** | Unit `zusammenfuehren` mit Eigenschaftstests (idempotent, kommutativ, assoziativ). Integration `lernapp-sync` im vollen Tor grün (3.878/3.878). E2E `zwei-geraete.spec:77` desktop grün an Bau 5. Abgleich-Code seit `d8ec7d5a` unverändert (`git diff` leer). Live `/api/lernapp/sitzung` 404 (Schalter aus) | – |
| Z-L06 | Zugänglichkeit | **erfüllt** (Screenreader: UMGEBUNGSAUSNAHME LM-19; Bedingung: L3-E17 bestätigen) | **axe-Matrix** `zugaenglichkeit.spec` (alle Lern-App-Routen mit echten Inhalten, einschließlich Wiederholen, Tipps, Wortschatz, Fortschritt, Einstufung, Wissen, Koran, Vorkurs `schrift_latein`) × de/tr/ar × 390/1440: 26/26 Tests grün an Bau 5, 0 ernste/kritische Befunde, 0 px Überlauf. **Tastatur:** `tastatur.spec` (nur Tab/Pfeile/Enter/Leertaste, alle 26 Typen, Nachspuren „auf Papier“, Wiederholen mit axe, Fokusreihenfolge de/ar), Fokusring-Helfer mit Selbsttest, desktop grün. Ziehen nie nötig. **Zeitgrenze:** Antworten haben keine Frist. Die Aufnahme endet nach 15 s; die Grenze wird angekündigt (N9b, E2E „Höchstlänge 15 s“), und „Noch einmal“ ist unbegrenzt möglich. Als WCAG-2.2.1-Ausnahme „wesentlich“ trage ich das mit (L3-E17) | (1) L3-E17 steht noch als „Vorschlag“. (2) Niedrig: Nach „zu leise“ bzw. „kein Mikrofon“ setzt `Sprechen.tsx` die Phase auf `start`, ohne den Fokus auf „Aufnehmen“ zu legen; der Fokus geht verloren (Gegenprüfung N9b, im Code bestätigt) |
| Z-L07 | Leistung | **teilweise** | **Budgets** (Bau 5, `n9b/budget4.txt`): alle eingehalten, u. a. Spieler +54,5 KB, ungünstigste erste Aufgabe +58,7 KB ≤ 60, Lernpfad ar 160,4 KB gesamt / 25,1 KB eigen, Typen ≤ 10,1 KB, Tastatur 1,5 KB. **LCP/CLS:** LCP 1,9–2,1 s, CLS ≤ 0,007. **Lighthouse:** Zugänglichkeit 100; Leistung **80–89** (N8.3). **INP:** Spieler 168–216 ms (Streuung ± 30 ms um die Grenze), Lernpfad-Szenarien 112–200 ms (N9a Nachtrag). **Whisper:** erst nach dem Klick (Beleg Z-L08) | Lighthouse-Leistung < 90 auf allen Messrouten. INP des Spielers B1 einmal 216 ms. Gemessen auf einem rund 20 % langsameren Rechner unter Last; keine Messung auf ruhigem Rechner oder gegen live (PageSpeed). Vorschläge N8.7 Nr. 1–2 offen |
| Z-L08 | Datenfluss | **erfüllt** | **Beleg** `belege/Z-L08-sprechen-datenfluss.md` (echter Worker, echtes Whisper-Modell, Aufnahme und Erkennung, Mitschrift am Draht): nur GET an den eigenen Ursprung, 0 fremd, 0 Cookies, 11 Modelldateien je einmal erst nach dem Klick, Erkennung lokal (blob). **E2E an Bau 5:** `netzprotokoll.spec:32/58` (einschließlich Einstufung, Wissen, Koran, Wiederholungsrunde) und `melden.spec:26` (POST nur beim Senden) grün. **Live:** 0 `Set-Cookie`, `connect-src 'self'` | Hinweis: Netzprotokoll nur desktop; der Beleg mit echtem Modell stammt von Bau 1 (`515a463f`, vor N9a). Der SW-Umbau aus N9a ändert keine Ziele, die CSP sperrt Dritte |
| Z-L09 | Kinderschutz | **erfüllt** | **E2E an Bau 5 mit Schaltern** GRUPPEN/RANGLISTE: `gruppe.spec:155` (Kind ohne Bestenliste, 54,7 s) und `:317` (Schreibabgabe nur an die Lehrkraft) grün; `mein-bereich-lernen.spec:184` (Eltern nur eigenes Kind) grün. **Integration:** `lernapp-verwaltung:370` (Kinderkonto meldet, Antwort verworfen; N5). **Code:** Bestenliste ab 16 im Code (`gruppe/regeln.ts:40–78`), `push_kind`. **Inhalte:** 0 externe Links, 0 Spendenaufrufe (eigene Suche) | Hinweis: `gruppe.spec:155` war im vollen Tor einmal unter Last rot; einzeln und an Bau 5 grün |
| Z-L10 | Religion-Prüfung | **erfüllt** | Religion-Prüfung am Endstand selbst gefahren: grün. `lernapp:pruefen` im Tor: religion 0/0/0, religionsbezug 0 blockierend (3 „Mensch“ nur im unsichtbaren `tr.b1.e16`). **N2:** Formelliste nur mit Status `freigegeben` und zwei Freigaben (`formelliste.ts:60`), lateinische Formel-Kandidaten, Wächter für den Friedensgruß mit Artikel und umgekehrt (`religion-waechter.test.ts:315`). 0 `religionsbezug` in Sprachkurs-Dateien und Live-Stichprobe | Formelliste wartet auf zwei religiöse Freigaben (LM-09) |
| Z-L11 | Bewegung | **erfüllt** | `bewegung-regeln` und `bewegung-bausteine` in der Unit des Endstands grün. Register B-28…B-35 in KERN §10, jede mit reduzierter Variante | Hinweis (Pflege): Die Glossar-Einblendung `LesenFragen.tsx:63` steht nicht im Register; eine reduzierte Variante hat sie |
| Z-L12 | Betrieb | **erfüllt** | **Schalter:** wie KERN §6. `lernapp` ist nachgetragen (L3-E12b, KERN §6 Zeile 181); Schalter mit Personendaten sind live aus (Routen 404). **S-L3 N-4:** AUSNAHME mit Grund und Ersatz in GO-LIVE; Abmelde-Worker live 200. **Weitere Belege:** Cockpit-Karte und Integration Schalter → 404 (C-technik). startklar mit Datenbank in der Integration: 0 Fehler | startklar in der echten Produktion erst mit Datenbank und Geheimnissen (13 Umgebungsfehler = MN-00, Menschen) |
| Z-L13 | Sprachen und RTL | **erfüllt** | `sprachen:pruefen` am Endstand selbst grün. `rtl-regeln` und `sanfte-texte` in der Unit. Live `html lang="ar" dir="rtl"`, Website de/tr/en, `/ar` 404. Überlauf 0 px auf allen Lern-App-Routen in ar bei 390 px (axe-Matrix) | – |
| Z-L14 | Inhaltsprüfer | **erfüllt** | `lernapp:pruefen` (Tor, Inhalte seitdem unverändert): 0 blockierend, Quelle und Lizenz 100 %, Dubletten 0/0/0. Neue Prüfer `uebersetzung` und `paketbau` (N7) mit 0/0/0. 15 `menschlich_klaeren` nur in den Entwürfen `de.b1.e16`/`tr.b1.e16`. Restfragen B1, OF-10 und R-06 in `MENSCHEN.md` (Z. 91–98) | – |
| Z-L15 | Audio | **AUSNAHME** (L3-E10: keine freigegebene Stimme) | **Ersatz** „Audio folgt“, Hörübungen ohne Sackgasse übersprungen (`engine/sitzung.ts`, `Spieler.tsx:303`, Units). Live 0 Audio in allen 6 Verzeichnissen und in 12 Paketen, 0 `test:ton`. Damit ist der Befund L15-1 (Testtöne in echten Einheiten) behoben (N1). Hörübungen sind enthalten und werden übersprungen | Erst mit Hörabnahme (LM-06) bzw. Stimmen tr/ar (LM-24/25) und Blob-Token |
| Z-L16 | Bau | **teilweise** | **Volles Tor** (`e06a648b`): Import-Bau wie Vercel 609 s, 2.438 Seiten (16.10.: 1.887); Sweep 0 × 5xx; Pakete 334/334 mit gleichem Hash; Lern-App ohne DB 16 × 200; Vorschau-Bau 647 s, 2.779 Seiten. **Website- und Lern-App-E2E 1.222:** selbst nachgezählt 885 + 201 grün, 9 rot, 127 übersprungen; 8 Cüz-Zeitgrenzen nach `f56f74bd` 12/12 grün, `gruppe:155` einzeln grün. **Endstand:** Lern-App-E2E 159/0/45 an Bau 5. Produktionsbau `e0292127` rc 0. Website-E2E nach dem Menüpunkt „Sprachen lernen“ (barrierefreiheit, datenschutz, suche, veranstaltungen, startseite, pwa; telefon und desktop): **663 grün, 0 rot, 7 übersprungen**, rc 0 (`tor-website-kopf.log`, 21:35 UTC). Die Bereitstellung `e0292127` ist live. **Beispielmodus:** live (Produktion ohne Datenbank) | **Offen:** Vercel-Bauzeit ≤ 15 min nicht belegt (Ersatz: lokaler Bau wie Vercel 609 s). **Hinweis:** Die Cüz-Seiten brauchen im E2E 28–35 s statt 16–20 s; die Prüfung bleibt gleich, die Zeitgrenze ist verdreifacht |
| Z-L17 | Lizenzverzeichnis und Namensnennung | **erfüllt** | Live `/lern-app/de/quellen`: Tatoeba, Wiktionary/kaikki, Whisper, onnxruntime mit ThirdPartyNotices, SIL OFL, Thorsten, CC BY-SA 4.0. `/quellen` mit Lern-App-Teil. ORT-ThirdPartyNotices offline zusammen mit dem Download der Sprachprüfung (N4, `sw.js:508`; Beleg Z-L08: die Datei wird mitgeladen). `quellen.spec:71` offline grün (beide Projekte). Pakete frei abrufbar als JSON mit Lizenzangabe | – |
| Z-L18 | Ausschlüsse | **erfüllt** | `lernapp:pruefen` ausschluss/lizenz 0/0/0. Eigene `git grep`: OpenITI-Marke nur als synthetische Probe im lokalen Werkzeugtest; NC nur in `daten/hanafi-quellen/QUELLE.md` als Begründung „nie ausgeliefert“; 0 Quranic-Arabic-Corpus-Verweise in Inhalten/Daten/public | – |
| Z-L19 | Werkzeuge nur lokal | **teilweise** | **Behoben (N4):** `lernapp-audio.ts` ohne sharp (`lib/medien/typ.ts`). Regeltest `lernapp/bundle-regeln` folgt dem Modulgraphen aller Lern-App-Startpunkte. 0 Sprachausgabe in Browser, Bau und Funktion; Client und `web/public` ohne GPL-Code (C-lizenzen). **Eigene Probe der Bau-Ausgabe:** öffentliche Lern-App 0/24 Funktionen mit libvips | **Befund:** 11 von 12 Seitenfunktionen unter `verwaltung/(geschuetzt)/lernapp/**` tragen `@img/sharp-libvips` (LGPL-3.0) im `.nft.json`, z. B. das Audio-Studio; dasselbe gilt für Mein Bereich › Unterricht › Lern-App. Ursache ist die Website-Hülle: Alle Seiten unter `[locale]` tragen libvips (176 von 191 Seiten). Frei sind die Seiten der Lern-App mit eigenem Layout und die Route-Handler. ADR 0042 Nr. 10 (Fortschreibung N4) zählt Verwaltung › Lern-App ausdrücklich zu den Lern-App-Funktionen und nennt die Bau-Ausgabe als offenen Beleg. M-060 deckt nur die Website |
| Z-L20 | Herkunft der Stimmen | **erfüllt** | 0 Clips ausgeliefert (live). Eine registrierte Stimme (Thorsten, de) mit Kette aus Daten CC0, Modell Apache-2.0, Commit und zwei SHA-256 (`audio/stimmen.ts:47–66`); `hoerabnahme: 'offen'`, daher nicht freigegeben. Paketbau nur mit freigegebener Stimme, Testtöne nur im Testkurs (N1) | – |
| Z-L21 | Qualität der Stimmen und religiöse Sperre | **AUSNAHME** (keine Stimme eingesetzt, L3-E10) | **Ersatz** „Audio folgt“, wirksam (live 0 Audio). Religiöse Sperre erfüllt: 0 Audio zu Wissen und Koran (live), Audio nur ohne `religionsbezug` (C-religion, bestätigt) | Hörabnahme LM-06; ar-Vokalisierungstest erst mit einer arabischen Stimme |
| Z-L22 | Versionen und Modelle | **erfüllt** | `@huggingface/transformers` 4.3.0 und `next` 16.4.2 exakt gepinnt (L3-E14). **Python-Werkzeuge:** alle vier `requirements*.txt` ohne ungepinnte Zeile, mit `--hash` (N4, CAMeL 1 Pin, 2 Hashes). **Whisper:** `64da572`, `allowRemoteModels: false` (`sprechen/modell.ts:91`, im ausgelieferten Worker gesetzt); live SHA-256 gleich (2 Stichproben) | – |

**Zählung:** 16 erfüllt, 3 AUSNAHME mit wirksamem Ersatz (Z-L02, Z-L15, Z-L21), 3 teilweise (Z-L07, Z-L16, Z-L19), 0 offen.

## Nacharbeit N1–N9 gegen die Lücken der Gruppen (selbst nachgeprüft)

Geschlossen und am Endstand oder live bestätigt:

| Lücke | Kriterium | geschlossen durch | Beleg der Nachprüfung |
|---|---|---|---|
| Testeinheit statt `*.a1.e01`, Testtöne in echten Einheiten | Z-L15/Z-L20 | N1 | live 0 Audio, keine Testeinheit |
| Administration zählt als religiöse Freigabe | Z-L02 | N2 | Code `schutzrollen.ts`, `freigabe.ts` |
| Formelliste nicht erzwungen | Z-L10 | N2 | Code `formelliste.ts:60` |
| Auslieferungsweg Wissen fehlt; Koran 78 × 404 | Z-L02/Z-L03 | N3 | E2E Wissen; live 80/80 Koran-Pakete |
| sharp in der Audio-Action | Z-L19 | N4 | Code `lernapp-audio.ts` |
| ORT-Drittlizenzen nicht offline | Z-L17 | N4 | `sw.js:508` |
| CAMeL ungepinnt | Z-L22 | N4 | `requirements-camel.txt` |
| Kinder-Meldung ohne Test; `gruppe.spec` nie grün | Z-L09 | N5 | Integration und E2E |
| L3-E12b und S-L3 N-4 offen | Z-L12 | N5 | ENTSCHEIDUNGEN, GO-LIVE, live |
| Kopie des Quellsatzes als Übersetzung; Paketbau verwirft still; Mengenbericht veraltet | Z-L01/Z-L14 | N7 | Prüfer `uebersetzung`/`paketbau`, eigene Zählung |
| Bauwechsel G-1; Stufe speichern; Wiederholen ohne Netz | Z-L04 | N9a | `offline.spec` |
| axe-Matrix unvollständig; Tastatur nur per `focus()`; Nachspuren mit der Maus; 15 s ohne Hinweis | Z-L06 | N9b | `zugaenglichkeit.spec`, `tastatur.spec` |
| Netzprotokoll ohne echtes Modell | Z-L08 | N9b | Beleg Z-L08 |

Nicht geschlossen:

- Lighthouse-Leistung ≥ 90 (Z-L07).
- Vercel-Bauzeit (Z-L16).
- libvips in den Funktionen der Lern-App-Teile innerhalb der Website-Hülle (Z-L19). Das ist neu gefunden: Die Lücke aus
  C-lizenzen ist im Modulgraphen geschlossen, in der Bau-Ausgabe aber nicht.

## Vor der Übergabe nötig

1. **Z-L19:** Eine der beiden Lösungen wählen:
   - die Ausnahme M-060 in ENTSCHEIDUNGEN und ADR 0042 Nr. 10 ausdrücklich auf die Lern-App-Teile innerhalb der
     Website-Hülle erstrecken (Verwaltung › Lern-App, Mein Bereich › Unterricht › Lern-App);
   - oder ermitteln, welches Modul der `[locale]`-Hülle sharp in alle Seiten zieht, und es dort lösen.

   In beiden Fällen das `.nft.json` der Lern-App-Funktionen als Regel auf die Bau-Ausgabe prüfen (öffentliche Lern-App:
   0 Treffer verlangt).
2. **Z-L07:** Lighthouse mobil für Start, Lernpfad de/ar und Spieler A1/B1/ar auf ruhigem Rechner oder gegen die
   Live-Adresse (PageSpeed) nachmessen, sobald `e0292127` live ist. Bleibt die Leistung unter 90, Z-L07 als Auflage
   „teilweise“ in ABNAHME und BERICHT führen. Behebungswege: N8.7 Nr. 1–2.
3. **Z-L16:** Bauzeit der Vercel-Bereitstellung von `e0292127` ablesen und belegen (Werkzeuge des Orchestrators, sonst
   Mensch).
4. **Z-L06:**
   - L3-E17 vom Status „Vorschlag“ auf „bestätigt“ setzen.
   - Niedrig: In `Sprechen.tsx` nach „zu leise“ und „kein Mikrofon“ den Fokus mit `fokusAufAufnehmen()` auf „Aufnehmen“
     legen; dazu einen E2E-Schritt.
5. **Z-L02:** AUSNAHME „26/28, LM-04, Ersatz: zurückgestellt und unsichtbar“ in ABNAHME/ENTSCHEIDUNGEN festhalten.

## Nur Menschen

- **LM-01/LM-02:** Muttersprachliche Stichproben und Rahmenpläne de/tr/ar; Redaktionsfragen B1 (`MENSCHEN.md`). Bis dahin
  live mit dem Hinweis „noch nicht von Muttersprachlern geprüft“ (254/254 Einheiten `hinweis: true`).
- **LM-03 mit MN-24:** zwei Konten `religioese_pruefung` für Wissenskurs, Formelliste (LM-09), Koran-Bedeutungen (LM-13) und
  Wurzeltabelle (LM-31). Bis dahin ist nichts davon sichtbar.
- **LM-04:** Werke für `islam.vertiefung.e04/e05` benennen und über e06/e08 entscheiden; Editionsrechte.
- **LM-09 / LM-02 und LM-03:** OF-10 (`de.b1.e16`) und R-06 „Pilz“ (`tr.b1.e16`) entscheiden. Beide Einheiten bleiben bis
  dahin Entwurf.
- **Stimmen und Audio:** Hörabnahme Thorsten (LM-06); Stimmen tr/ar (LM-24, LM-25); Blob-Token für Audio.
- **Geräte:**
  - LM-07 und MN-19: Gerätetest Sprechen auf iPhone, Android und Laptop. Bis dahin bleibt `lernapp_sprechen` in der
    Produktion aus.
  - LM-19: Screenreader-Prüfung mit NVDA, VoiceOver und TalkBack.
- **MN-00 / G1:** Produktionsdatenbank und Geheimnisse (startklar in der Produktion); Freigabe der Schalter mit
  Personendaten (Abgleich, Gruppen, Rangliste, Statistik, Push) nach KERN §6; DSFA-Nachtrag (LM-08).

## Urteil

**Gesamt: abgenommen mit Auflagen.** Am Endstand `e0292127` sind 16 der 22 Kriterien erfüllt. Drei sind als begründete AUSNAHME mit wirksamem Ersatz belegt: Z-L02, weil der Wissenskurs bis zur Benennung der Werke 26 von 28 Einheiten umfasst (LM-04), sowie Z-L15 und Z-L21 mit „Audio folgt“, solange keine Stimme die Hörabnahme bestanden hat. Die Sprachkurse A1–B1 sind in allen sechs Richtungen vollständig: je Zielsprache 42 Einheiten, 336 Stationen, 2.758–2.800 Lemmata und 11.333–11.488 Sätze, Übersetzungen zu 100 %. Sie sind live mit dem Hinweis „noch nicht von Muttersprachlern geprüft“. Wissensinhalte, Koran-Bedeutungen und Audio sind ohne zwei menschliche Freigaben bzw. ohne Hörabnahme nicht sichtbar. Offline, Abgleich, Zugänglichkeit, Datenfluss, Kinderschutz, Religion-Prüfung, Inhaltsprüfer und Lizenzen habe ich mit eigenen Proben an Code, Logs und live bestätigt. Die Lücken der Gruppenprotokolle sind am Endstand geschlossen, darunter Bauwechsel G-1, „Stufe offline speichern“, die axe-Matrix, das Netzprotokoll mit echtem Modell, die Testtöne und die Formelliste.

Drei Kriterien bleiben teilweise; sie sind die Auflagen:
- **Z-L07 Leistung:** Die Lighthouse-Leistung liegt bei 80–89 statt ≥ 90, gemessen auf einem langsameren Rechner unter Last. Budgets, LCP, CLS und INP sind im Wesentlichen eingehalten.
- **Z-L19:** Die Lern-App-Seiten in Verwaltung und Mein Bereich tragen über die Website-Hülle libvips (LGPL-3.0) in der Bau-Ausgabe. Die öffentliche Lern-App ist frei davon.
- **Z-L16:** Die Vercel-Bauzeit ≤ 15 min ist nicht belegt. Bau und Website-E2E des Endstands sind grün (663/0), und der Endstand ist live.

Vor der Übergabe sind diese drei Punkte zu beheben oder ausdrücklich zu entscheiden. Außerdem ist die Ausnahme L3-E17 (Aufnahme bis 15 s) zu bestätigen. Was nur Menschen tun können, steht in `MENSCHEN.md`: Muttersprachler-Stichproben, zwei religiöse Prüfende, Werke für den Wissenskurs, Hörabnahme der Stimmen, Gerätetest und Screenreader, Produktionsdatenbank und Geheimnisse. Solange diese Schritte fehlen, ist nichts Ungeprüftes sichtbar.
