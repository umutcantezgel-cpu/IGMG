# ENTSCHEIDUNGEN – Lauf „Lern-App“

Format wie `_gemeinde/ENTSCHEIDUNGEN.md`. L2-E01…L2-E06 gelten fort, soweit hier nichts anderes steht; insbesondere
L2-E04 (Vercel-Import ohne Einstellungen) und L2-E06 (Audio über eine eigene Route) gelten auch für die Lern-App.

- **L3-E01…L3-E08** sind die Entscheidungen des Nutzers vom 16.10.2026, wörtlich aus dem genehmigten Plan.
- **L3-E09…L3-E12** führen sie aus oder regeln, was der Nutzer nicht entschieden hat.
- **Status je Eintrag:** „vom Nutzer bestätigt“ oder „Standard bis zur Antwort“. Ein Standard läuft ohne Warten weiter; die
  offene Frage steht in `MENSCHEN.md`.

## L3-E01 · 2026-10-16 · Nutzer · Fiqh-Inhalte: KI-Entwurf nach hanefitischen Quellen, zwei Freigaben
- **Entscheidung (wörtlich):** „Die KI entwirft Lektionen und Übungen **streng nach benannten hanefitischen Quellen, mit
  Quellenangabe je Aussage**. **Nichts wird sichtbar, bevor zwei Prüfer (Imam/Hoca) jeden Baustein freigegeben haben.**“
- **Begründung:**
  - Die Entscheidung hebt für deutsche Wissenslektionen das Verbot aus ADR 0030 Nr. 4 und `_gemeinde/KERN.md` auf („Kein Agent
    schreibt … Fiqh-Erklärungen“).
  - Gegen das Risiko erfundener Quellenangaben (Plan §7) wirken drei Schritte: Beleg je Aussage, Belegprüfung durch einen
    zweiten Agenten und zwei unabhängige menschliche Freigaben.
- **Folgen:**
  - Ausführung als KI-Regel 2 (L3-E09, ADR 0040). ADR 0030 bekommt den Status „Nr. 4 fortgeschrieben durch ADR 0040“.
  - Neue Zwei-Prüfer-Freigabe, gebunden an den Inhalts-Hash; die bestehende Freigabe kennt nur eine Prüfung.
  - Quellen nach dem Lizenzbefund: OpenITI nur lokal; ausgeliefert werden eigene deutsche Aussagen mit Zitierangabe
    (KERN §2.4).
  - Prüfaufwand ≈ 200 h Imam- und Hoca-Zeit. Deshalb wird gestaffelt veröffentlicht, Reinheit und Gebet zuerst (LM-03).
- **Status:** vom Nutzer bestätigt (16.10.2026).

## L3-E02 · 2026-10-16 · Nutzer · Spielerisches sanft und ohne Druck – Ausnahme von „keine Ranglisten“
- **Entscheidung (wörtlich):** „**Sanft, ohne Druck:** XP, Tagesziel, Serie mit Pause-Tagen und ohne Schuld-Mitteilungen,
  Abzeichen, Lernpfad, Wiederholung nach Vergessenskurve. Bestenliste freiwillig, nur in der eigenen Gruppe oder Familie;
  **für Kinder aus**.“
- **Ausnahme:** Drei bestehende Regeln gelten in der Lern-App mit dieser einen Ausnahme:
  - `_gemeinde/KERN.md` (Gestaltung: „keine Ranglisten“)
  - die Liste „bewusst abgelehnt“ im Gemeinde-AUFTRAG („Ranglisten, Serien-Druck, Punktevergleich“)
  - DSFA Lernplattform R-08 („keine Ranglisten, keine Punktevergleiche“)

  Außerhalb der Lern-App bleiben sie unverändert.
- **Grenzen der Bestenliste:**
  - Nur in der eigenen Gruppe oder Familie und nur, wenn alle angezeigten Personen mindestens 16 Jahre alt sind und selbst
    zugestimmt haben (Opt-in). Die Lehrkraft bzw. die Familie muss sie erlauben.
  - Inhalt: Wochen-XP, Vorname + Initial, keine Medaillen. Austritt ist jederzeit möglich.
  - Für Konten unter 16 ist sie im Code gesperrt, nicht nur über einen Schalter.
  - Standard in Gruppen ist ein Gruppenziel ohne Namen. Der Schalter `lernapp_rangliste` bleibt in der Produktion aus (LM-10).
- **Was unverändert bleibt:**
  - Keine hochzählenden Zahlen; XP stehen statisch.
  - Keine Herzen, Ligen, globalen Ranglisten und kein Zeitdruck.
  - Keine Schuld- oder Verlusttexte (Wortlaut-Test).
- **Begründung:**
  - Entscheidung des Nutzers.
  - Die Grenzen setzen „freiwillig“ und „für Kinder aus“ technisch um (Plan §2.5, `PLAN.md` §8).
  - Opt-in statt bloßem Ausblenden, weil „freiwillig“ eine eigene Zustimmung verlangt.
- **Folgen:** ADR 0043; Bewegung B-28…B-35 (KERN §10); DSFA-Nachtrag zu R-08 (LM-08).
- **Status:** Die Entscheidung ist vom Nutzer bestätigt. Die Grenzen (Opt-in ab 16, Gruppenziel als Standard, Schalter aus)
  sind Standard bis zur Antwort.

## L3-E03 · 2026-10-16 · Nutzer · Sprachinhalte: KI-Entwurf nach GER, offene Daten, Stichproben
- **Entscheidung (wörtlich):** „KI-Entwurf nach GER, ergänzt um offene Daten (Tatoeba, Wiktionary). Muttersprachler prüfen
  stichprobenweise. Audio per Open-Source-Sprachausgabe (Piper), später durch Aufnahmen ersetzbar. **Kein Koran-/Hadith-Text in
  der Sprachausgabe.**“
- **Folgen:**
  - **KI-Inhalte in Sprachkursen sind erlaubt**, auch Hocharabisch, voll vokalisiert, und Übersetzungen innerhalb der
    Sprachkurse. Die Ablehnung „KI-erzeugte Übersetzungen“ im Gemeinde-AUFTRAG meinte religiöse Übersetzungen; für diese gilt
    sie weiter (L3-E09).
  - **Jede Einheit wird geprüft:** automatische Prüfer, KI-Gegenprüfung, Rückübersetzung und Religionswächter (KERN §3).
    Koran- und Hadith-Wortlaut ist im Sprachkurs verboten.
  - **Offene Daten nach dem Lizenzbefund (ADR 0045):**
    - Tatoeba-Sätze (CC BY 2.0 FR) mit Nennung je Satz.
    - kaikki/Wiktionary (CC BY-SA 4.0), ohne die Zitat-Beispiele.
    - Häufigkeitslisten unter CC BY-SA 4.0.
    - Tatoeba-Audio nur mit freier Lizenz; für tr und ar gibt es keines.
  - **Lizenz:** Lerninhalte unter CC BY-SA 4.0 (L0-E02).
  - **GER:** eigene „Ich kann …“-Beschreibungen mit dem Hinweis „orientiert am GER (Europarat 2001/2020)“ (L0-E19).
  - **Muttersprachliche Stichprobe** nach ADR 0041 (LM-01). Bis zur bestandenen Stichprobe einer Einheit gilt der Standard
    aus Plan §6 (ML-02): Veröffentlicht wird nach automatischer Prüfung und KI-Gegenprüfung, mit dem Hinweis „noch nicht von
    Muttersprachlern geprüft“ (Schalter `lernapp_ungeprueft`, O-1/LM-11). Abgelehnte Einträge sind nie sichtbar; Einträge mit
    Religionsbezug erst nach zwei religiösen Freigaben (L3-E09).
  - **Teil „Piper“:** überholt durch den Lizenzbefund, siehe L3-E10.
- **Status:** vom Nutzer bestätigt. Die Stimmenwahl (L3-E10) und die Veröffentlichung vor der Stichprobe (O-1) sind
  Standard bis zur Antwort.

## L3-E04 · 2026-10-16 · Nutzer · Niveau A1–C1
- **Entscheidung (wörtlich):** „**A1–C1** je Zielsprache.“
- **Folgen:**
  - Rahmenplan je Zielsprache; die Abnahme der Rahmenpläne ist LM-02.
  - Mengen laut `PLAN.md` §5.1: 72 Einheiten je Zielsprache. Plan §3.1 nannte 195; das ist durch die Verfeinerung
    überholt.
  - Wissen und Koran-Arabisch haben eigene Stufen statt GER-Niveaus.
- **Status:** vom Nutzer bestätigt.

## L3-E05 · 2026-10-16 · Nutzer · Platzierung: eigener Bereich, PWA, ohne Konto voll nutzbar
- **Entscheidung (wörtlich):** „**Eigener Bereich in der bestehenden Web-App**, als PWA installierbar. Gleiche Konten;
  Lehrkräfte weisen ihren Gruppen Lektionen zu. **Ohne Konto voll nutzbar** (Fortschritt auf dem Gerät, offline).“
- **Folgen:**
  - **Bereich und PWA:** Adresse `/lern-app/[ui]` (L3-E11, ADR 0037). Eigenes Manifest und eigener Service Worker mit Scope
    `/lern-app/`; der Root-SW behält die Caches `igmg-lernapp-*`.
  - **Konten:** gleiche Konten wie die Website; Anmeldung im Scope der Lern-App (O-7).
  - **Lokal zuerst:** Ereignisprotokoll in IndexedDB. Der Abgleich läuft nur mit Konto, Einwilligung und Schalter
    (ADR 0038). Ohne Konto gibt es Export und Import als Datei.
  - **Zuweisungen** laufen über die Tabelle `aufgabe` mit dem Bezug `lernapp`.
- **Status:** vom Nutzer bestätigt.

## L3-E06 · 2026-10-16 · Nutzer · Sprechen und Schreiben (C1) im Browser
- **Entscheidung (wörtlich):** „**Open Source im Browser:** Whisper lokal, nichts verlässt das Gerät. Schreiben mit
  Musterlösung, Prüfliste und Selbstbewertung; optional korrigiert die Lehrkraft.“
- **Folgen:**
  - **Sprechen (ADR 0042):** transformers.js im Worker mit Xenova/whisper-base q8 (≈ 77 MB, fester Commit), ausgeliefert vom
    eigenen Ursprung, `allowRemoteModels=false`.
    - Das Modell lädt nur nach Klick, mit Größenangabe. whisper-small kommt nur nach einem Praxistest (L0-E08).
    - CSP `'wasm-unsafe-eval'` und Mikrofon gibt es nur unter `/lern-app`.
    - Sprechen ist außer in C1 optional und abschaltbar; Rückfall ist die Selbstbewertung.
  - **Schreiben:** keine KI-Bewertung. Die Korrektur durch die Lehrkraft setzt Konto, Gruppe und Schalter `lernapp_gruppen`
    voraus; der Text wird verschlüsselt gespeichert.
- **Status:** vom Nutzer bestätigt.

## L3-E07 · 2026-10-16 · Nutzer · Arabisch: Hocharabisch und Pfad „Koran-Arabisch“
- **Entscheidung (wörtlich):** „Hocharabisch (Fusha) **und** ein Pfad ‚Koran-Arabisch‘ aus den vorhandenen Koran-Wortdaten
  (nur freigegebene Bedeutungen).“
- **Folgen:**
  - **Bedeutungen** nur aus `quran_wortbedeutung`, von Menschen verfasst (MN-05) und im Lern-App-Pfad sichtbar erst mit zwei
    Freigaben zum aktuellen Stand (genehmigter Plan §3.1 „wie Wissen mit zwei Freigaben“, O-11, LM-13). Die Pipeline erzeugt
    dafür nur eine Arbeitsliste für die Hoca.
  - **Audio** nur aus `quran_wortzeit` freigegebener Rezitationen, nie Sprachausgabe.
  - **Wurzeln:**
    - Der Quranic Arabic Corpus wird nicht verwendet (Lizenzbefund: Änderungsverbot, nur Forschung).
    - Stattdessen entsteht eine eigene Wurzeltabelle aus den Tanzil-Formen: lokal mit CAMeL Tools vorgeschlagen, mit Wiktionary
      abgeglichen, von der benannten Lehrkraft fachlich geprüft und mit zwei Freigaben, unter CC BY-SA 4.0 (L0-E12, LM-31).
  - **Arabische Oberfläche:** Dort ist der Pfad ausgeblendet; die Bedeutungen gibt es auf Deutsch oder Türkisch.
- **Status:** vom Nutzer bestätigt. Die Wurzeltabelle (L0-E12) und die Freigaberegel für Bedeutungen (O-11) sind Standard bis
  zur Antwort.

## L3-E08 · 2026-10-16 · Nutzer · Oberfläche Deutsch, Türkisch, Arabisch
- **Entscheidung (wörtlich):** „**Deutsch, Türkisch, Arabisch** (Arabisch voll von rechts nach links). Die übrige Website
  bleibt DE/TR/EN.“
- **Folgen:**
  - `ar` kommt nicht zu den Sprachen der Website; eigene Texte in `web/messages/lernapp/{de,tr,ar}.json`.
  - Regeln für Rechts-nach-links: KERN §7.
  - Noto Sans Arabic nur im Lern-App-Layout (ADR 0044). Die globale Regel `[dir=rtl]` in `globals.css` wird eingegrenzt.
  - Die Verwaltung bleibt deutsch; nur die Prüfoberfläche Sprache wird dreisprachig (O-3, Fortschreibung ADR 0016).
- **Status:** vom Nutzer bestätigt.

## L3-E09 · 2026-10-16 · Orchestrator · KI-Regel 2: Wissen mit zwei Freigaben, Verbotsliste
- **Entscheidung:** KI-Regel 2 (ADR 0040) schreibt ADR 0030 Nr. 4 fort.
  - **Erlaubt** ist der KI-Entwurf für:
    - Sprachkursinhalte (L3-E03)
    - deutsche Aussagen und Quizfragen des Wissenskurses, nur aus gelieferten Passagen benannter hanefitischer Werke (Glaube:
      maturiditisch), mit Beleg je Aussage
  - **Verboten** bleibt, was KERN §2.2 aufzählt, unter anderem:
    - religiöse Texte auf Arabisch
    - Übersetzungen von Versen, Hadithen und Bittgebeten
    - Koran-Wortbedeutungen und Tajwid-Texte
    - Fatwa-Funktion, Frage-Bot und Einzelfall-Fatwas
    - arabische Schrift in den Inhaltsdateien von Wissenskurs und Koran-Pfad (Arabisch nur aus gepinnten Daten über Verweise)
    - Sprachausgabe für religiöse Texte
  - **Freigabe im Wissenskurs:**
    - zwei Prüfungen „ok“ zum aktuellen Inhalts-Hash, von zwei verschiedenen Personen mit `religioese_pruefung`; keine davon
      ist Verfasser
    - jeder Beleg am Original bestätigt
    - die Administration ersetzt keine Prüfung
    - eine Änderung setzt beide Freigaben zurück
    - eine Lektion ist nur sichtbar, wenn alle Bausteine geprüft sind
  - **Ebenfalls zwei Freigaben:** Einträge mit Religionsbezug in Sprachkursen, die Liste erlaubter Alltagsformeln,
    Koran-Wortbedeutungen im Lern-App-Pfad und die eigene Wurzeltabelle (genehmigter Plan §2.3 „Freigabe ×2“, §3.1; O-2,
    O-11).
  - **Religionswächter:** Koran- und Hadith-N-Gramm schon ab 4 aufeinanderfolgenden Wörtern (genehmigter Plan §3.4, O-10).
- **Begründung:**
  - Der Nutzer erlaubt den KI-Entwurf nur für Wissen mit Quellen und zwei Freigaben (L3-E01) und für Sprachinhalte (L3-E03).
    Zu allem anderen aus ADR 0030 hat er nichts geändert; es bleibt verboten.
  - Dass Koran-Wortbedeutungen, Tajwid-Texte sowie Vers- und Hadith-Übersetzungen nur menschlich bleiben, stammt aus der
    Verfeinerung durch den zweiten Planungs-Agenten.
  - Wo der genehmigte Plan zwei Freigaben bzw. die Schwelle 4 nennt (§2.3, §3.1, §3.4), gilt er vor den schwächeren
    Vorschlägen im Entwurf der Verfeinerung (O-2, O-10, O-11).
- **Folgen:**
  - ADR 0040; KERN §2 und §3; Werkzeuge Religionswächter und Belegprüfer.
  - Test „0 sichtbar ohne zwei Freigaben“ (Integration und Abfrage am Live-Stand).
  - KI-Regel 2 steht in jedem Briefing.
- **Status:** Der Kern (KI-Entwurf mit Quellenangabe, zwei Freigaben) ist vom Nutzer bestätigt (L3-E01). Die Verbotsliste
  und die Freigaberegeln im Einzelnen sind Standard bis zur Antwort.

## L3-E10 · 2026-10-16 · Orchestrator · Sprachausgabe nur für Sprachkurse; Stimmen nach Lizenzbefund
- **Entscheidung:**
  - **Wo:** Sprachausgabe gibt es nur für Inhalte der Sprachkurse und der Schrift-Vorkurse. Es gibt sie nie für Koran,
    Hadith, Bittgebete, nie für Einträge mit Religionsbezug, nie im Wissenskurs und nie im Koran-Arabisch-Pfad.
  - **Welche Stimmen:** nur Stimmen mit freier Kette aus Daten, Basismodell und Gewichten (L0-E01, L0-E03):

    | Sprache | Standard | Übergang oder Ersatz |
    |---|---|---|
    | de | Coqui-VITS Thorsten (Apache-2.0, Daten CC0, von Grund auf trainiert) | Hörvergleich mit Piper de_DE-mls-medium (CC BY 4.0) (L0-E04) |
    | tr | Ziel: eigene Aufnahmen (2–4 h, Einwilligung einschließlich KI-Synthese) und eine eigene Stimme von einem sauberen Startpunkt (L0-E07) | Coqui tr glow-tts (MIT, Daten CC0); Chatterbox (MIT) nur bei besserer Hörprobe (L0-E05) |
    | ar | eigene Stimme, trainiert auf ClArTTS (CC BY 4.0), optional mit dem Arabic Speech Corpus; Eingabe immer voll vokalisiert (L0-E06) | Chatterbox nur nach bestandenem Vokalisierungstest (Harakat, Schadda, Tanwin), sonst arabische Übungen ohne Sprachausgabe („Audio folgt“) |

  - **Ausgeschlossen:**
    - alle Piper-Stimmen außer de_DE-mls-medium (Ketten über en_US-lessac „nur Forschung“ bzw. ryan CC BY-NC-SA):
      Thorsten-Piper, kerstin, karlsson, pavoque, ar_JO-kareem, tr_TR-dfki; fahrettin und fettah wurden am 30.12.2025 entfernt
    - MMS-TTS, XTTS-v2, ArTST, kikiri-turkish und Community-Stimmen ohne belegte Datenherkunft
  - **Engines** (piper1-gpl, espeak-ng, Coqui) laufen nur lokal beim Erzeugen, nie im Browser und nie im Vercel-Bau.
  - **Menschliche Aufnahmen** ersetzen die Sprachausgabe je Text-Hash, nur mit Sprecher-Vereinbarung (ADR 0029 Nr. 4).
- **Begründung:**
  - Der Nutzer hat Open-Source-Sprachausgabe mit Piper gewählt, später durch Aufnahmen ersetzbar, und Koran-/Hadith-Text darin
    ausgeschlossen (L3-E03).
  - Der Lizenzbefund (31 Primärquellen) zeigt: Die Piper-Stimmen für de, tr und ar sind fast alle über Ketten mit
    „nur Forschung“ oder NC-SA trainiert und damit nicht nutzbar. Die Empfehlung des Lizenzberichts erfüllt das Ziel des
    Nutzers ohne dieses Risiko.
  - „Nur Sprachkurse“ folgt aus ADR 0030 Nr. 8 (keine Sprachausgabe für Koran oder Hadith) und dem Plan: Koran-Arabisch ohne
    Sprachausgabe, Wissen ohne Audio.
- **Folgen:**
  - ADR 0039 (Lern-Audio) und ADR 0040 (Verbot).
  - Spike S3 prüft die Stimmen dieser Tabelle statt der Piper-Stimmen: Hörprobe, Echtzeitfaktor, Vokalisierungstest
    Arabisch.
  - Namensnennung je Stimme in der App und auf `/quellen`. Bei Chatterbox wird das Wasserzeichen offengelegt; Klonen nur mit
    eingewilligter Referenzstimme.
  - Der Nutzer erfährt im nächsten Bericht von der Abweichung vom Wortlaut „Piper“ (LM-06).
- **Status:** „Kein Koran-/Hadith-Text in der Sprachausgabe“ ist vom Nutzer bestätigt. „Nur Sprachkurse“ und die
  Stimmenwahl sind Standard bis zur Antwort (L0-E03…L0-E07, LM-06).

## L3-E11 · 2026-10-16 · Orchestrator · Adresse `/lern-app/[ui]`
- **Entscheidung:** Die Lern-App liegt unter `/lern-app/{de|tr|ar}/…` mit eigenem Wurzel-Layout außerhalb von `[locale]`. Der
  Plan (§1, §2.1) nannte `/app/[ui]`.
  - **Weiterleitungen:** `/lern-app` → 308 auf `/lern-app/de`; `/(tr|en)/lern-app/…` → 308 auf `/lern-app/(tr|de)/…`.
  - **Kurse:** `tr-aus-de`, `ar-aus-de`, `de-aus-tr`, `ar-aus-tr`, `de-aus-ar`, `tr-aus-ar`, `islam`, `koran`.
  - **Sprachen:** Oberflächen- und Ausgangssprache sind getrennte Einstellungen; Standard: gleich.
  - **Anmeldung** im Scope unter `/lern-app/[ui]/anmelden` (O-7). Manifest je Oberflächensprache mit `scope: /lern-app/`.
- **Begründung:**
  - Kein Ordner `web/src/app/app/…`, und die Adresse ist sprechender.
  - Ein statisches Segment hat Vorrang vor `[locale]`. So bleiben das Website-Routing und die vorgerenderten Seiten
    unberührt (Verfeinerung; `PLAN.md` §3.1–3.2).
  - Die Anmeldung muss im Scope liegen, weil installierte iOS-PWAs eine eigene Cookie-Ablage haben.
- **Folgen:**
  - ADR 0037; Proxy-Ausnahme vor dem Sprach-Routing; Header-Regel `/lern-app/:pfad*`; Spike S1.
  - Jede Nennung von `/app` im genehmigten Plan gilt als `/lern-app`.
- **Status:** Standard bis zur Antwort. Das ist eine Abweichung vom genehmigten Plan in der Adresse, nicht im Inhalt.

## L3-E12 · 2026-10-16 · Nutzer/Orchestrator · Arbeitsweise
- **Entscheidung:**
  - **Ohne Anhalten und ohne Rückfrage:** Etappen L0–L8 mit Tor je Etappe (`PLAN.md` §14). Prüfstufen sind Arbeitsschritte,
    keine Haltepunkte. Was Menschen entscheiden, läuft mit dem Standard aus `MENSCHEN.md` weiter (wie L2-E01).
  - **Branch:** Gearbeitet wird auf `claude/trusting-lovelace-6nfolz` (Sitzungsvorgabe). `origin/main` wird zu Beginn jeder
    Welle und vor jedem Fast-Forward hineingemergt, nie per Rebase oder Force.
  - **`main` nur per Fast-Forward nach grünem Tor** (Fortschreibung L2-E02). Zum Tor gehören:
    - Bau Vorschau und Produktion, `pnpm check`, Integration, `sprachen:pruefen`, startklar mit Produktionsschaltern
    - `lernapp:pruefen`, Religion-Prüfung mit Wächter
    - Regeltests (Rechts-nach-links, Budgets, sanfte Texte, Bewegung)

    Nie erzwungen, kein Deploy von Hand; bei Rot ein Revert-Commit.
  - **Prüfstufen:** A je Paket, B je Etappe. S (Sicherheit, frischer Agent) an L1, L5 und L8. Am Ende Stufe C mit frischem
    Endprüfer.
  - **Parallelität:**
    - höchstens 2 Code-Agenten gleichzeitig in Arbeitsbäumen
    - Inhalts-Agenten ohne Bau bis 6 gleichzeitig
    - Sprachausgabe nur in Zeitfenstern ohne Bau und E2E
  - **Gemeinsame Dateien ändert nur der Orchestrator:** `routing.ts`, `proxy.ts`, `next.config.ts`, `header.ts`,
    `public/sw.js`, `globals.css`, `matrix.ts`, `funktionen-regeln.ts`, `tags.ts`, Schemas und Migrationen, `package.json`,
    `religion-pruefung.mjs`, `sprachen-pruefen.mjs`, KERN.
  - **Sichern:** Push nach jeder Welle und mindestens stündlich (ZWISCHENSTAND). STATUS und PRUEFPUNKT nach jedem Schritt.
  - **Platte** (7,0 GB frei, gemessen 16.10.2026):
    - Werkzeuge und Modelle liegen im Scratchpad.
    - Downloads werden im Strom gefiltert; Audio geht direkt in den Blob.
    - Nach jedem Merge werden `.next` und `test-results` gelöscht.
  - **Veröffentlichung** der Inhalte gestaffelt.
  - **Alte Werkstätten:** `_gemeinde/` ist abgeschlossen (ABSCHLUSS f2dc1a1, 16.10.2026); dort ändern sich nur Verweise.
    `_archiv/` bleibt unverändert.
- **Begründung:** genehmigter Plan §4 („ohne Anhalten; Tor je Etappe; höchstens 2 Bau-Agenten gleichzeitig“), L2-E01 und
  L2-E02 des Vorlaufs, Ressourcen laut `PLAN.md` §15.
- **Status:**
  - Vom Nutzer bestätigt: ohne Anhalten, Tor je Etappe, höchstens 2 Bau-Agenten, Branch und Fast-Forward (Plan „Lern-App“
    vom 16.10.2026; L2-E01/L2-E02 vom 13.10.2026).
  - Standard bis zur Antwort: bis zu 6 Inhalts-Agenten, die Liste der gemeinsamen Dateien und die Plattenregeln.

## L3-E10a · 2026-10-20 · Orchestrator · Stimmen nach Spike S3 (Fortschreibung von L3-E10)
- **de:** Coqui-VITS Thorsten über eigenen ONNX-Export (Echtzeitfaktor ≈ 0,33); Piper de_DE-mls nicht verwendet.
- **tr:** glow-tts zurückgestellt (Datensatz „Talent_TR_Male“ ohne belegte Rechte, LM-24); Chatterbox kein Übergang;
  „Audio folgt“ bis eigene Aufnahmen (LM-26 a, vorgezogen) oder schriftliche Bestätigung der Rechte.
- **ar:** Chatterbox hat den Vokalisierungstest nicht bestanden; „Audio folgt“ bis eigene ClArTTS-Stimme oder Aufnahmen.
- **Folgen:** Hörübungen tr/ar werden bis dahin übersprungen (KERN §4 „Ohne Audio“); Z-L15 kann für tr/ar nur mit Aufnahmen
  erfüllt werden (AUSNAHME mit Grund, ADR 0039 OFFENE FRAGE). Beleg `belege/S3-stimmen.md`; ADR 0045 Fortschreibung S3/S8.

## L3-E13 · 2026-10-21 · Orchestrator · Reihenfolge der Einheiten und Ablage des Vorkurses
- **Ablage:** Der Schrift-Vorkurs einer Zielsprache steht je Ausgangssprache als eigene Einheit `<kurs>.a1.e00-<ausgang>` mit
  `nurFuerAusgang` (das Schema erlaubt dort nur eine Sprache; die Rahmenpläne nennen `fuer` mit bis zu zwei).
- **Reihenfolge:** `reihenfolge` = Einheitennummer + 1; der Vorkurs hat 1, `e01` hat 2 usw. So sortieren Einheiten auch bei
  gleichem Rang eindeutig; die Bestandsdateien und das Inhalts-Handbuch (`_lernapp/werkzeuge/inhalte-handbuch.md`) folgen dem.
- **Begründung:** Rückgaben der Vorkurs- und Entwurfs-Agenten (L3-07, 21.10.2026); keine Schemaänderung nötig.
- **Status:** Standard bis zur Antwort der Redaktion (LM-02); die zwei Warnungen „Vorkurs-Einheit ohne Eintrag im Rahmenplan“
  bleiben gewollt.

## L3-E12a · 2026-10-21 · Nutzer · Einfach auf `main` pushen (Fortschreibung von L3-E12)
- **Entscheidung (Nutzer, wörtlich):** „eigentlich will ich jetzt schon live haben weil ist eh eine test domain“ und
  „einfach auf main pushen!“.
- **Folge:** Fertige Stände gehen per Fast-Forward auf `main`, ohne auf ein Tor zu warten; nie erzwungen, kein Deploy von Hand.
  Prüfungen laufen schlank danach (nur Betroffenes, keine Testschleifen); Rotes wird gezielt nachgezogen, bei Ausfall der
  Produktion Revert-Commit. Die Lern-App bleibt in Produktion hinter `FUNKTION_LERNAPP`, bis der Nutzer anders entscheidet.
  (Fortgeschrieben durch L3-E12b: Der Nutzer hat noch am 21.10.2026 anders entschieden.)

## L3-E12b · 2026-10-21 · Nutzer · Lern-App in der Produktion an (Fortschreibung von L3-E12a)
- **Entscheidung (Nutzer, wörtlich):** „Die App ist ein Teil der Seite!“ und „ich erlaube dir alles“ (21.10.2026, vermerkt in
  `PRUEFPUNKT.md` „Stand 21.10.2026 14:40 UTC“). Umgesetzt mit `a023cf1` (21.10.2026): `IN_PRODUKTION_AN` in
  `web/src/lib/funktionen-regeln.ts`.
- **Folge:**
  - In der Produktion standardmäßig **an**, ohne Angabe in der Umgebung: `lernapp`; `lernapp_ungeprueft` (Einheiten nach
    automatischer Prüfung mit dem Hinweis „noch nicht von Muttersprachlern geprüft“, L3-E15, ADR 0041 Nr. 8);
    `lernapp_meldungen` (anonym, nur Aufgabenschlüssel und Kategorie; wirkt erst mit Datenbank und `ALTCHA_GEHEIMNIS`, G1).
    Dazu `hadith_gesamt` der Website.
  - Alle Schalter mit Personendaten bleiben in der Produktion **aus**, bis Menschen sie freigeben (KERN §6, `MIT_PERSONENDATEN`):
    `lernapp_sync`, `lernapp_gruppen`, `lernapp_rangliste`, `lernapp_statistik`, `push_lernapp`. Ebenso `lernapp_sprechen`
    bis zum Gerätetest (LM-07).
  - Der Fortschritt bleibt ohne Konto auf dem Gerät; die Produktion läuft ohne Datenbank im Beispielmodus (G1 offen).
  - Abschalten bleibt jederzeit möglich: `FUNKTION_LERNAPP=aus` in der Umgebung und neu bereitstellen (GO-LIVE „So wird
    geschaltet“). Dann liefert der Proxy unter `/lern-app/sw.js` den Abmelde-Worker (S-L3 N-4, GO-LIVE „Ausnahme N-4“).
- **Nachgetragen:** am 26.10.2026 nach der Endabnahme (Stufe C, Z-L12: `protokolle/C-technik.md` Lücke 2); KERN §6 ist
  entsprechend fortgeschrieben.

## L3-E14 – Sicherheits-Fixes ohne Mindestreife (23.10.2026)
- **Anlass:** `next@16.4.0` (Produktion) ist von zwei kritischen und einer hohen Lücke betroffen (GHSA-2464-fhr4-w9xw,
  GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r); der Upgrade-Hinweis von Next brach dadurch Bauten unter Agenten mit
  `SecurityFatalError` ab.
- **Entscheidung:** Ein Sicherheits-Fix einer festgelegten Abhängigkeit (gleiche Haupt- und Nebenversion, Patch-Stufe) wird
  sofort eingespielt; die Mindestreife von 14 Tagen (L0-E10) gilt dafür nicht. Next steht auf 16.4.2 (ADR 0001, Fortschreibung
  23.10.2026).

## L3-E15 · 2026-10-24 · Nutzer · Sprachstufen mit Hinweis freischalten, auch künftig
- **Entscheidung (Nutzer):**
  - Am 23.10. wählte er „Mit Hinweis freischalten (Empfehlung)“ für A1.
  - Am 24.10. erlaubte er den Commit ausdrücklich, wörtlich: „Ja, und auch für alle zukünftigen Punkte. Ja, du hast meine
    Erlaubnis, meine vollständige Erlaubnis, das Projekt so optimal zu machen, wie nur möglich.“
- **Folge:**
  - Eine Sprachstufe einer Zielsprache wird nach bestandener Schlussprüfung auf `automatisch_geprueft` gesetzt. Das heißt
    0 blockierend und 0 menschlich_klaeren, Religionswächter rc=0.
  - Danach ist sie in der Produktion mit dem Hinweis „automatisch geprüft, noch nicht von Muttersprachlern geprüft“ sichtbar
    (Schalter `lernapp_ungeprueft`).
  - Erste Anwendung: A1 de/tr/ar (3bd40c46) und A2 de/tr/ar (304ec310), live seit dem 24.10.2026 um ≈ 20:45 UTC.
  - Muttersprachler-Prüfung (LM-02) und das Wissen mit zwei Freigaben (L3-E09) bleiben unberührt: Wissen wird nie ohne zwei
    menschliche Freigaben sichtbar.

## L3-E16 · 2026-10-25 · Nutzer · Umfang der Sprachkurse vorerst bis B1
- **Entscheidung (Nutzer, wörtlich):** „Bis B1 reicht erstmal“.
- **Folge:**
  - Die Sprachkurse werden in allen sechs Richtungen bis einschließlich B1 fertiggestellt und freigeschaltet (L3-E15).
  - B2 und C1 werden vorerst nicht weiter erstellt. Die vorhandenen B2-Entwürfe de e01–e12 und der Wortschatzplan B2 de bleiben als Entwurf (unsichtbar) für eine spätere Fortsetzung erhalten.
  - Z-L01 (Umfang A1–C1) gilt für die Abnahme als „Umfang A1–B1 nach Nutzerentscheidung“. B2/C1 stehen als offener Ausbau im BERICHT.
  - Nach B1 tr/ar folgen L8-05 (Stufe C), BERICHT und ABSCHLUSS.

## L3-E17 · 2026-10-26 · Paket N9b, vom Orchestrator bestätigt (26.10.2026, Vollmacht des Nutzers) · Höchstlänge der Sprechaufnahme und WCAG 2.2.1
- **Anlass:** Die Sprechübung beendet eine Aufnahme nach 15 s selbst (`MAX_AUFNAHME_MS`, ADR 0042, Fortschreibung S2:
  Schutz vor Halluzination). Z-L06 verlangt „keine Zeitgrenzen“; WCAG 2.2.1 verlangt bei einer Zeitgrenze Abschalten,
  Anpassen oder Verlängern, sofern keine Ausnahme greift. Das Ankündigen allein (N9b, `Sprechen.tsx`) erfüllt den Auftrag,
  nicht den Wortlaut von 2.2.1 (Gegenprüfung N9b).
- **Einordnung:** Ausnahme „wesentlich“ (essential) nach 2.2.1.
  - Die 15 s sind das Erkennungsfenster einer einzelnen Äußerung, keine Frist für die Antwort. Die Aufnahme beginnt erst auf
    Knopfdruck; die Bedenkzeit davor ist unbegrenzt. Eine längere Aufnahme würde das lokale Modell zu erfundenen Abschriften
    treiben (S2), die Übung also verfälschen.
  - Nichts geht verloren: Die Aufnahme bis zur Grenze bleibt, wird angehört bzw. erkannt, und „Noch einmal“ ist unbegrenzt
    möglich, ohne Wertung des Zeitbedarfs.
  - „Ich kann gerade nicht sprechen“ überspringt ohne Wertung; ohne Sprachprüfung gibt es die Selbstbewertung.
  - Die Grenze steht vorher sichtbar unter dem Knopf (`aria-describedby`), die Ansage beim Start nennt sie, das selbsttätige
    Ende wird angesagt (Test `typen-b.spec.ts` „Höchstlänge 15 s“).
- **Folge:** Z-L06 „keine Zeitgrenzen“ gilt mit dieser Ausnahme als erfüllt. Bestätigt am 26.10.2026 nach dem Urteil des
  frischen Endprüfers (`berichte/stufe-c.md`). Eine einstellbare Länge (bis zum 30-s-Fenster von Whisper) bleibt ein möglicher
  Ausbau; er bräuchte eine erneute Prüfung gegen S2.

## L3-E18 · 2026-10-26 · Orchestrator (Vollmacht des Nutzers; Bestätigung durch Menschen: MENSCHEN LM-37) · libvips in Lern-App-Seiten der Website-Hülle (Z-L19)
- **Anlass:** Der frische Endprüfer (Stufe C, `berichte/stufe-c.md`) fand libvips (`@img/sharp-libvips`, LGPL-3.0) in der Bau-Ausgabe
  von 11 der 12 Seiten unter Verwaltung › Lern-App und unter Mein Bereich › Unterricht › Lern-App. Die Ursache liegt in der
  Website-Hülle `[locale]`: Die Server-Actions für Medien und Rezitationen binden `lib/medien/verarbeiten.ts` (sharp) ein, und das
  Tracing nimmt sharp in fast alle Funktionen der Website auf (176 von 191 Seiten). Für die Website gilt dafür bereits die
  menschliche Ausnahme **M-060** (`_lauf/MENSCHEN.md`, ADR 0001 „Lizenz-Ausnahmen“): libvips liegt als eigene, dynamisch
  gebundene Bibliothek nur auf dem Server, nie im Browser.
- **Entscheidung:** M-060 gilt auch für die Lern-App-Seiten innerhalb der Website-Hülle (Verwaltung › Lern-App, Mein Bereich ›
  Unterricht › Lern-App). Diese Seiten sind Teil der Website und erben ihre Funktionen. Für die **öffentliche Lern-App** mit eigenem
  Wurzel-Layout (`/lern-app/**`, 13 Seiten, Pakete, Audio, Service Worker) bleibt Z-L19 unverändert streng: 0 Treffer in der
  Bau-Ausgabe, 0 GPL/LGPL in Client-Bündeln und `web/public` (Regeltest `lernapp/bundle-regeln`, Prüfung des Endprüfers).
- **Warum keine Änderung am Tracing jetzt:** Ein Ausschluss von sharp aus dem Tracing einzelner Routen (`outputFileTracingExcludes`)
  würde die Uploads der Verwaltung auf Vercel brechen, wenn die Action in einer ausgeschlossenen Funktion läuft. Der saubere Weg ist
  ein Umbau der Website-Hülle (Actions mit sharp nur in den Upload-Seiten); das gehört zum Lauf der Website, nicht zur Abnahme der
  Lern-App, und steht als Ausbau in ABSCHLUSS.
- **Folge:** Z-L19 gilt als AUSNAHME mit Ersatz: öffentliche Lern-App frei; libvips nur serverseitig in der Website-Hülle nach M-060.
  ADR 0042 Nr. 10 ist entsprechend fortgeschrieben.

## L3-E19 · 2026-10-26 · Orchestrator (Vollmacht des Nutzers) · Wissenskurs mit 26 von 28 Einheiten (Z-L02)
- **Anlass:** Z-L02 verlangt 28 Einheiten (≥ Ziel − 5 %, also mindestens 27). Zwei Einheiten (Siyar) sind zurückgestellt, bis die
  Gemeinde die Werke benennt (LM-04); ohne benannte Werke dürfen keine Belege entstehen (KI-Regel 2, KERN §2.4).
- **Entscheidung:** Z-L02 gilt als AUSNAHME mit Ersatz: 26 Einheiten entworfen und belegt, die zwei zurückgestellten sind unsichtbar
  und im Lehrplan als „zurückgestellt (LM-04)“ geführt. Sichtbar ist ohnehin nichts ohne zwei menschliche Freigaben (LM-03).


## L3-E20 · 2026-10-26 · Orchestrator (Vollmacht des Nutzers; Gegenmessung durch Menschen: MENSCHEN LM-39) · Lighthouse-Leistung auf dem Messrechner (Z-L07)
- **Anlass:** Der Endprüfer führte Z-L07 als „teilweise“: Lighthouse-Leistung 80–89 statt ≥ 90, gemessen auf einem langsameren
  Rechner unter Last. Die Messung live (`berichte/leistung.md`, Abschnitt „Schluss“) bestätigt: Budgets, LCP, CLS und
  Zugänglichkeit 100 halten; die Note hängt an TBT. TBT entsteht hier aus der simulierten Drosselung ×4 auf einem Rechner mit
  `benchmarkIndex` ≈ 1.450–1.600 (L8 ≈ 1.850); derselbe Code lag dort über 90. Die Live-Messung fand dazu einen echten Fehler:
  LCP 5,7 s auf dem Lernpfad durch den spät gezeichneten Block „Stufe offline speichern“; er ist behoben (b9e581e8).
- **Entscheidung:** Z-L07 gilt als AUSNAHME mit Ersatz: Budgets (KERN §9), LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms (Median) und
  Lighthouse-Zugänglichkeit 100 sind erfüllt. Die Lighthouse-Leistung ≥ 90 erreichen live Start und Lernpfad de (92); der
  RTL-Lernpfad lag unter Last bei 88, die Übungsseiten bei 83–90 (TBT 300–560 ms) – auf diesem Messrechner nicht sicher ≥ 90. Ein
  Mensch misst auf einem Referenzgerät bzw. mit PageSpeed Insights gegen (LM-39); liegt die Note dort unter 90, wird TBT der
  Startseite und des Spielers weiter gesenkt (Vorschläge `leistung.md` N8.7).

## L3-E21 · 2026-10-26 · Orchestrator (Vollmacht des Nutzers; Bestätigung im Dashboard: MENSCHEN LM-38) · Beleg der Vercel-Bauzeit (Z-L16)
- **Anlass:** Z-L16 verlangt einen Vercel-Bau ≤ 15 min. Die Bauzeit steht nur im Vercel-Dashboard; die Werkzeuge dieses Laufs
  sehen das Projekt nicht (Vercel-Verbindung ohne Zugriff, GitHub ohne Deployments-API).
- **Entscheidung:** Als Beleg gilt die Zeit vom Push auf `main` bis zum Wechsel von `data-bau` auf der Test-Domain – eine
  Obergrenze für Warteschlange, Bau und Bereitstellung. Gemessen: `b9e581e8`, Push 22:01:17 UTC, live 22:12:41 UTC, also
  **11 min 24 s ≤ 15 min** (`scratchpad/live-b9e581e8.log`, Abfrage alle 20 s). Andere Stände brauchten 20–34 min (`390b6715`:
  22:23:42 → 22:43:36), weil mehrere Vercel-Projekte und die Vorschau des Branches dasselbe Repository nacheinander bauen
  (Warteschlange, nicht Bauzeit); jede Messung ist eine Obergrenze, die kleinste zählt. Dazu lokal der Bau wie ein frischer
  Vercel-Import: 609 s. Z-L16 ist damit **erfüllt**; LM-38 bestätigt die Zahl im Dashboard und räumt überzählige Projekte auf.

## L3-E22 · 2026-10-27 · Nutzer · Wissenskurs auf der Test-Domain als gekennzeichneter Entwurf (Fortschreibung von L3-E09)
- **Auftrag (Nutzer, 27.10.2026, Plan freigegeben):** Den Wissenskurs auf `igmg-wetzlarer.vercel.app` erreichbar machen – deutlich
  als ungeprüfter Entwurf gekennzeichnet; für den späteren öffentlichen Start bleibt die Sperre bis zu zwei Freigaben per
  Schalter umkehrbar.
- **Umsetzung (Branch `lernapp-wissen-vorschau`):**
  - Wissens-Import (`web/src/lib/lernapp/inhalt/wissen-import.ts`): alle 26 Dateien (146 Lektionen, 2.124 Aussagen, 4.603
    Belege, 1.041 Quizfragen) im Status „Entwurf“, ohne Prüfungen; läuft in jedem Bau nach dem Sprach-Import. Werk, Verfasser
    und Version-URI aus `web/daten/hanafi-quellen/QUELLE.md`. Koran- und Hadith-Verweise der Aussagen werden noch nicht
    übernommen (keine Spalte).
  - Neuer Schalter `lernapp_wissen_vorschau` (ohne Personendaten, braucht `lernapp`), in der Produktion **an**
    (`IN_PRODUKTION_AN`). An: Lektionen ohne zwei Freigaben erscheinen als „Entwurf zur Prüfung“ (Hinweis auf Kurs-, Übungs-
    und Wiederholungsseite, Vermerk „Entwurf“ statt Prüfvermerk, Marke an der Einheit, Startseite); nie, wenn ein Baustein
    zurückgezogen ist, eine Person mit der Rolle Einwand erhoben hat oder ein Beleg fehlt. Geprüfte Lektionen tragen weiter den
    Prüfvermerk. Aus: wieder allein die Sperre bis zu zwei Freigaben; offline gespeicherte Entwürfe verlassen die Geräte.
  - Das Startklar-Cockpit warnt in der Produktion, solange die Vorschau an ist.
- **Vor dem öffentlichen Start:** `FUNKTION_LERNAPP_WISSEN_VORSCHAU=aus` setzen und neu bereitstellen – oder alle Lektionen von
  zwei Gelehrten prüfen lassen (LM-03). Ohne Datenbank (Beispielmodus) können Imam und Hoca die Entwürfe nur ansehen, nicht
  freigeben (G1, G2).
- **S-L3 M-1** (Frist „bevor Lektionen des Wissenskurses ausgeliefert werden“) ist erledigt (`a96939db`, Integrationstest
  `web/tests/integration/lernapp-gruppe.test.ts` „S-L3 M-1“).
- **Nicht umgesetzt (Teil E des Plans):** `lernapp_sprechen` bleibt aus. S-L3 N-4 verlangt vorher eine Ratenregel der
  Vercel-Firewall für `/lern-app/modelle/*` (z. B. 20 Anfragen je 10 min und IP) oder eine Modell-Route mit Schalterprüfung;
  die Firewall-Regel ist eine Änderung an der Produktion und wartet auf die Bestätigung des Nutzers.

