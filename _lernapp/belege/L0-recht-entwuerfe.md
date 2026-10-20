# Beleg L0-04 – Rechtsentwürfe der Lern-App (DSFA-Nachtrag, Einwilligung, Sprecher-Vereinbarung, Löschfristen)

- **Etappe:** L0, Paket L0-04 (`PLAN.md` §14). In diesem Lauf kein Commit. Geschrieben wurden nur die vier Entwürfe unter
  `web/docs/recht/entwuerfe/` (drei neu, eine Ergänzung) und diese Datei.
- **Stand:** 20.10.2026, Branch `claude/trusting-lovelace-6nfolz`, HEAD `c2dc80c`.
- **Bezug:**
  - `_lernapp/KERN.md` §1, §4, §5, §6 (Kinderschutz, Datenschutz, Schalter); KI-Regel 2 (§2, ADR 0040)
  - ADR 0037 Nr. 4, 0038 Nr. 5/8/10, 0039 Nr. 7–9, 0041 Nr. 9, 0042 Nr. 7/9/11 mit Fortschreibung S2, 0043 Nr. 4/8, 0045 Nr. 2/11
  - Lizenzbericht `berichte/lizenzen-l0.md` (L0-E03, L0-E07), Teilbericht `berichte/lizenzen-l0-stimmen.md` §2.3 und D6
  - MENSCHEN LM-06, LM-08, LM-10, LM-22, LM-26; Vorlauf MN-11
  - Muster: `web/docs/recht/entwuerfe/{dsfa-lernplattform,einwilligungen,loeschkonzept,vereinbarung-rezitation}.md`
- **KI-Regel 2:** Die Entwürfe enthalten keine religiösen Texte und keine arabische Schrift. Türkisch und Arabisch der
  Einwilligung sind als Übersetzungsaufgabe markiert; die arabische Fassung gehört später nur nach
  `web/messages/lernapp/ar.json` (KERN §3).

## 1. Ziel

1. DSFA-Nachtrag Lern-App als Entwurf (LM-08): Verarbeitungen ohne und mit Konto, Art. 9, Kinder, Ausnahme zu R-08
   (Bestenliste), Whisper lokal, anonyme Meldungen, Löschfristen, Risiken und Maßnahmen, Schalter nach KERN §6.
2. Einwilligungstext `lernapp` für Erwachsene, Eltern für Kinder und Jugendliche ab 16, in klarer Sprache (de; tr und ar als
   Übersetzungsaufgabe).
3. Vereinbarung für Sprecherinnen und Sprecher der Sprachkurse: Nutzung, Veröffentlichung unter CC BY-SA 4.0, Widerruf,
   Namensnennung, gesonderte Einwilligung in Training oder Klonen einer synthetischen Stimme, Kinder ausgeschlossen.
4. Löschfristen der Lern-App als eigener Abschnitt im Löschkonzept, ohne Bestandstext zu ändern.
5. Wortlaut-Prüfung (`_gemeinde/werkzeuge/wortlaut.mjs`): neue Entwürfe nur unter G-01, kein Bestandstext verändert.

## 2. Vorgehen (Befehle)

Gelesen: AUFTRAG, KERN, PLAN (§0–§3, §5, §11, §12, §14 L0, §16–§18), MENSCHEN, ADR 0037–0045 mit allen Abschnitten
„Fortschreibung durch Spike …“, Lizenzbericht und Teilbericht Stimmen, die vier Muster-Entwürfe, `wortlaut.mjs`
(Absatzbildung, Ausnahme G-01), Beleg S2 §3.9 (Netzprotokoll). Zum Abgleich der Namen gelesen, nicht verändert: der
Schema-Entwurf der Etappe L1 im Arbeitsbaum `agent-a212ace6efc9226bb` (`lernapp-nutzung.ts`, `lernapp_meldung`,
`lernapp_sprecher`).

```sh
export PATH=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/node24/bin:$PATH   # Node 24.21.0
SP=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/l0

# (a) Ausgangslage vor dem Schreiben
node _gemeinde/werkzeuge/wortlaut.mjs --basis b702c7c --stand HEAD --protokoll $SP/recht/wortlaut-vorher-head

# (b) Entwürfe geschrieben (Write) und Löschkonzept ergänzt (Edit: nur Einfügung von §3.7 vor „## 4. Löschen auf Antrag“)

# (c) Arabische Schrift: dieselbe Zeichenklasse wie religion-pruefung.mjs, auf den vier Dateien und diesem Beleg
node -e '…' <Dateien>   # Zeichenklasse U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFE je Zeile

# (d) Wortlaut wie vorgegeben (HEAD), dazu der Arbeitsstand und HEAD als Basis
node _gemeinde/werkzeuge/wortlaut.mjs --basis b702c7c --stand HEAD         --protokoll $SP/wortlaut
node _gemeinde/werkzeuge/wortlaut.mjs --basis b702c7c --stand ARBEITSSTAND --protokoll $SP/wortlaut-arbeitsstand
node _gemeinde/werkzeuge/wortlaut.mjs --basis HEAD    --stand ARBEITSSTAND --protokoll $SP/recht/wortlaut-head-gegen-arbeitsstand
git diff --numstat -- web/docs/recht/entwuerfe/loeschkonzept.md
```

**Zu `git add -N`:** nicht nötig und nicht gemacht. `--stand HEAD` liest nur den Commit und sieht die unversionierten
Entwürfe nicht. `--stand ARBEITSSTAND` liest den Arbeitsbaum und nimmt neue Dateien über
`git ls-files -o --exclude-standard` auf. So blieb der Index des Hauptarbeitsbaums unberührt, und ein `git reset` entfällt.
Der Lauf (d) mit HEAD als Basis belegt zusätzlich, dass im Löschkonzept kein bestehender Absatz verändert wurde. Bei der Basis
`b702c7c` gab es die Datei noch nicht, dort ist jeder Absatz „neu“.

## 3. Ergebnisse

### 3.1 Dateien

| Datei | Art | Zeilen | Wörter | SHA-256 (Endstand) |
|---|---|---|---|---|
| `web/docs/recht/entwuerfe/dsfa-lernapp.md` | neu | 310 | 5.521 | `641f2fd80cb9…` |
| `web/docs/recht/entwuerfe/einwilligung-lernapp.md` | neu | 155 | 2.023 | `83d0c1aedf3c…` |
| `web/docs/recht/entwuerfe/vereinbarung-sprecher-lernapp.md` | neu | 133 | 2.559 | `8693490ba016…` (Gegenprüfung 20.10.: Vermerk zur Option „nur Lern-App“ in § 2 Nr. 3 und Anlage 2; vorher 2.500 Wörter, `e1f30f5e140a…`) |
| `web/docs/recht/entwuerfe/loeschkonzept.md` | ergänzt um §3.7 „Lern-App“ (+38 Zeilen, −0) | 184 | 3.652 | `a897d0773599…` |

Alle vier tragen oben den Kasten „ENTWURF – vor Veröffentlichung … prüfen“; der Abschnitt im Löschkonzept trägt zusätzlich
„Ergänzung vom 20.10.2026 …, **Entwurf**“.

### 3.2 Inhalt im Überblick

| Entwurf | Kern |
|---|---|
| DSFA-Nachtrag | Zwei Betriebsarten (ohne Konto: keine Verarbeitung durch die Gemeinde über den Abruf hinaus; mit Konto: LA-V4 bis LA-V8); 12 Vorgänge LA-V1 bis LA-V12; Rechtsgrundlagen einschließlich § 25 Abs. 2 Nr. 2 TDDDG `[prüfen]`; eigener Abschnitt zur Ausnahme von R-08 mit Grenzen (Ort, Opt-in, ab 16 im Code, Wochen-XP, keine Medaillen); Whisper lokal mit Netzprotokoll aus S2 (1.410 Anfragen, nur eigener Ursprung); anonyme Meldungen; Risiken R-L01 bis R-L15; Maßnahmen M-L01 bis M-L18 (geplant bzw. Vorschlag); Bedingungen für das Einschalten je Schalter; offene Entscheidungen D-L01 bis D-L15 |
| Einwilligung `lernapp` | EL1 Erwachsene, EL2 Eltern für ein Kind unter 16 (mit Haken „Einvernehmen“), EL3 ab 16, EL4 Zustimmung zur Bestenliste (nur ab 16); Art. 9 ausdrücklich; „ohne Konto voll nutzbar“ als Freiwilligkeit; Widerruf mit Folgen; Hinweistexte ohne Einwilligung (ohne Konto, Sprechen, Melden, geteiltes Gerät); tr und ar als Übersetzungsaufgabe |
| Sprecher-Vereinbarung | Modul A (Pflicht): Aufnahmen nur von Sprachkurs-Texten ohne `religionsbezug`, Nutzung in der Lern-App, Veröffentlichung unter CC BY-SA 4.0 mit Aufklärung (unwiderruflich für Dritte, Persönlichkeitsrecht nicht mitlizenziert `[prüfen]`), Option „nur Lern-App“; Modul B (freiwillig, gesondert): B1 Training, B2 Klonen mit Referenzaufnahme, nur Sprachkurse, nie religiöse Texte, nur lokal, Modell nicht veröffentlicht, Kennzeichnung „synthetische Stimme“; Widerruf je Modul mit Fristen; nur Volljährige |
| Löschkonzept §3.7 | L-37 bis L-53 (Gerätespeicher, Lernstand 12 Monate nach letzter Aktivität, Verdichtung, Schreibabgaben 12 Monate, Zuweisungen, Bestenliste ohne Verlauf, Nachweise, Meldungen und Antwortfeld, ALTCHA, Statistik, Push, Prüfprotokolle, Sprecheraufnahmen, Vereinbarung, Stimmmodell, Aufnahmen der Lernenden); Widerrufstabelle; Löschen auf Antrag; Lücken |

### 3.3 Prüfungen

| Prüfung | Ergebnis |
|---|---|
| Arabische Schrift (Zeichenklasse aus `religion-pruefung.mjs`) in den vier Entwürfen und in diesem Beleg | 0 Zeilen |
| `git diff --numstat` Löschkonzept | 38 Zeilen hinzugefügt, 0 entfernt |
| Querverweise | D-L01…D-L15 und M-L01…M-L18 je einmal definiert, alle Verweise aufgelöst; L-37…L-53 im DSFA-Nachtrag richtig genannt |
| `religion-pruefung.mjs` | nicht aussagekräftig vor dem Commit (liest nur `git ls-files`); ersetzt durch die Zeichenprüfung oben |

**Wortlaut** (`wortlaut.mjs` 1.0, Endstand der Entwürfe, Laufzeit je ≈ 20 s):

| Lauf | Basis → Stand | rc | Befunde „hoch“ offen | Ausnahme-Einheiten | Rechtstexte gleich / geändert / neu / entfernt | Lern-App-Entwürfe |
|---|---|---|---|---|---|---|
| (a) vorher | `b702c7c` → HEAD `c2dc80c` | 0 | 0 | 690 | 710 / 8 / 1.203 / 0 | – (Ausgangslage; die 8 „geändert“ sind Bestand mit Ausnahme) |
| (d1) wie vorgegeben | `b702c7c` → HEAD `c2dc80c` | 0 | 0 | 690 | 710 / 8 / 1.203 / 0 | nicht sichtbar (unversioniert); Löschkonzept wie HEAD (32 Absätze) |
| (d2) Arbeitsstand | `b702c7c` → ARBEITSSTAND | 0 | 0 | 693 | 710 / 8 / 1.381 / 0 | DSFA 69, Einwilligung 65, Vereinbarung 37, Löschkonzept 39 Absätze, alle „neu“ unter **G-01** |
| (d3) gegen HEAD | HEAD `c2dc80c` → ARBEITSSTAND | 0 | 0 | 4 | 1.873 / **0** / 178 / **0** | Löschkonzept: **32 gleich, 7 neu**, 0 geändert, 0 entfernt; drei neue Dateien unter G-01 |

Protokolle: `$SP/wortlaut.{json,md}` (d1), `$SP/wortlaut-arbeitsstand.{json,md}` (d2),
`$SP/recht/wortlaut-head-gegen-arbeitsstand.md` (d3); Konsolenausgaben `$SP/recht/*.log`.

## 4. Entscheidungsvorschläge zu offenen Punkten der ADRs und Pläne

| Bezug | Offener Punkt | Vorschlag (Standard bis zur Antwort) |
|---|---|---|
| ADR 0038 Nr. 10, Folgen („`lernapp_sync` aus bis DSFA-Nachtrag und Einwilligungstext, LM-08“) | Entwürfe fehlten | liegen vor; `lernapp_sync` bleibt in der Produktion aus, bis die Bedingungen aus DSFA-Nachtrag §9 erfüllt sind (u. a. Löschlauf L-38/L-39 gebaut, Text mit Version eingebaut). Löschung nach Widerruf binnen 30 Tagen; der lokale Stand bleibt |
| ADR 0038 Nr. 7 | Frage „Lokalen Fortschritt übernehmen?“ | ist **keine** Einwilligung und steht erst nach EL1–EL3 (Einwilligung §2 Nr. 2) |
| ADR 0039 Nr. 8, ADR 0045 Nr. 11, L0-E07 | Vorlage der Sprecher-Vereinbarung mit KI-Synthese | Vorlage `vereinbarung-sprecher-lernapp.md` mit Modul A/B. Schema in L1/L3: `lernapp_sprecher` mit getrennten Feldern für B1 (Training) und B2 (Klonen) statt nur `kiSyntheseErlaubt`; Lizenz je Clip im Paket, falls die Option „nur Lern-App“ gewählt wird. Abweichung vom Teilbericht D6, von L0-E07, LM-26 und der Tabelle in ADR 0045 Nr. 11 (dort jeweils „CC0 oder Rechteübertragung“): Standard ist CC BY-SA 4.0 wie die Kurse, das Trainingsrecht kommt aus Modul B (Recht prüft, D-L11). **Gegenprüfung 20.10.:** Die Option „nur Lern-App“ widerspricht KERN 4.0 §1 und ADR 0045 Nr. 2 (ausgeliefertes Audio nur CC0, CC BY oder CC BY-SA); sie bleibt in der Vorlage als offener Punkt markiert und wird ohne Entscheidung des Nutzers nicht angeboten |
| ADR 0041 Nr. 9 | eigene Antwort in Meldungen | höchstens 200 Zeichen, Hinweis „keine persönlichen Angaben“, Feld bei Erledigung leeren, spätestens nach 12 Monaten (D-L07, L-45) |
| ADR 0042 Nr. 7 | Speicherung der Aufnahme auf dem Gerät | nur im Arbeitsspeicher bis zum Ende der Übung, keine Ablage in IndexedDB oder Cache (D-L12, L-53); in L5 belegen |
| ADR 0042, Fortschreibung S2 Nr. 2 | Kalibrierung mit Aufnahmen echter Lernender (L5) | nur Erwachsene, eigener kurzer Einwilligungstext in L5, nur Zahlen notiert |
| ADR 0043 Nr. 8, Folgen („DSFA-Nachtrag zu R-08 und Einwilligungstext `lernapp`“) | Ausnahme von R-08 | DSFA-Nachtrag §4 mit Grenzen; Vorschlag: Bestenliste zählt nur XP aus Sprachkursen (D-L04); „Familie“ = Eltern-Kind-Zuordnung des Bestands (D-L05); Zustimmung als eigene Art `lernapp_bestenliste` oder Profileinstellung (EL4, Festlegung in L7) |
| ADR 0043 Nr. 4 | Erinnerungen | bestehende Einwilligungen `push`/`push_kind`; Kind-Push erst, wenn D-07 der Grund-DSFA im Abo-Weg erzwungen ist |
| ADR 0035, KERN §6 | Cockpit-Sperre `lernapp_sync` | wie bei `chat`: Sperre, bis „DSFA-Nachtrag Lern-App bestätigt“ als Einstellung gesetzt ist (L1) |
| PLAN §14 L0-04 | Dateiname `[vereinbarung-lernapp-aufnahme.md]` | nach Briefing `vereinbarung-sprecher-lernapp.md`; PLAN und LM-06 (bisher Verweis auf `vereinbarung-rezitation.md`) nachziehen (Orchestrator) |
| `verarbeitungsverzeichnis-ergaenzung.md`, `datenschutz-v2-bausteine.md` | Lern-App fehlt | nicht Teil dieses Auftrags. Vorschlag: Einträge GP-18 ff. aus LA-V1…LA-V12 und ein Baustein „Lern-App“ für die Datenschutzerklärung in einem eigenen Paket (L1 oder L7) |
| MENSCHEN LM-08 | Stand | Entwürfe liegen vor; Standard bleibt „Schalter mit Personendaten in der Produktion aus“ |

## 5. Offene Fragen für die DSB (LM-08) und Recht (LM-22, LM-26)

1. **D-L01** Ohne Konto: keine Verarbeitung durch die Gemeinde? § 25 Abs. 2 Nr. 2 TDDDG für IndexedDB und Service Worker.
2. **D-L02** Eine Einwilligung `lernapp` für Abgleich und Lehrkraft-Sicht, oder zwei Kästchen?
3. **D-L03** Was sieht die Lehrkraft? (Vorschlag: nur zugewiesene Einheiten; Wissenskurs und Koran-Arabisch nur bei Zuweisung.)
4. **D-L04/D-L05** Bestenliste nur mit XP aus Sprachkursen; Definition „Familie“.
5. **D-L06** Schreibabgaben nicht für `administration`/`bildung` (`NIE_PER_ADMINISTRATION`).
6. **D-L07** Antwortfeld der Meldung: Länge und Frist.
7. **D-L08** Anonyme Telemetrie ohne Konto (Vorschlag: nicht einschalten).
8. **D-L09** 16. Geburtstag ohne eigene Einwilligung binnen 30 Tagen (Vorschlag: Abgleich pausieren).
9. **D-L10** Prüfprotokolle: Frist; Kennung beim Löschen eines Prüfkontos pseudonymisieren statt löschen.
10. **D-L11** Sprecher: CC BY-SA 4.0 gegen Widerruf (Art. 7 Abs. 3, Art. 17 Abs. 2), Persönlichkeitsrecht an der Stimme bei
    Weiternutzung durch Dritte (Abschnitt 2(b)(1) der Lizenz), Kennzeichnung synthetischer Inhalte (Art. 50 KI-Verordnung),
    Stimmdaten als biometrische Daten (Art. 4 Nr. 14), § 32 Abs. 3 Satz 3 UrhG, Einordnung nach §§ 73, 85 UrhG; 16- und
    17-Jährige (Vorschlag: nur Volljährige).
11. **D-L12/D-L13** Aufnahme nur im Arbeitsspeicher; Abmelden mit Frage nach lokalem Löschen; Eltern und Lehrkräfte sehen nur
    Lerntage, keine Uhrzeiten.
12. **D-L14** Art. 9 Abs. 2 lit. d ergänzend zur ausdrücklichen Einwilligung?
13. **D-L15** Sprachen der Einwilligung (Lern-App de/tr/ar, „Mein Bereich“ de/tr/en).
14. Einwilligung: Frist der Server-Löschung nach Widerruf (Vorschlag 30 Tage), Umgang mit offenen Schreibabgaben, ob Eltern ab
    dem 16. Geburtstag die Lernwoche weiter sehen.
15. Bestätigung, dass ein Nachtrag zur DSFA der Lernplattform genügt (Art. 35 Abs. 1 Satz 2), und die Bewertung der
    Restrisiken (DSFA-Nachtrag §10).

## 6. Risiken

- **Code noch nicht gebaut:** Der Nachtrag stützt sich auf PLAN, KERN, ADRs und den Schema-Entwurf von L1. Weicht L1 ab
  (Tabellennamen, Felder, Kategorien der Meldung), sind §2.2, §8 und L-37 bis L-53 nachzuziehen; die Maßnahmen sind deshalb
  „geplant“, nicht „belegt“. Nach Tor L1 und L7 mit Code-Belegen fortschreiben (DSFA-Nachtrag §12).
- **Rechtsaussagen ungeprüft:** Alle Stellen mit `[prüfen]` sind Einschätzungen ohne Rechtsberatung (u. a. TDDDG, Art. 9
  Abs. 2 lit. d, KI-Verordnung Art. 50, CC BY-SA 4.0 und Persönlichkeitsrecht, § 32 UrhG). Keine Aussage ist als gesichert zu
  lesen, bevor DSB oder Rechtsberatung sie bestätigt haben.
- **Unwiderrufliche Lizenz:** Für Sprecheraufnahmen bleibt auch nach Aufklärung ein mittleres Restrisiko (R-L12). Wird die
  Option „nur Lern-App“ gewählt, braucht das Kurspaket eine Lizenz je Clip (ADR 0039 Nr. 1 sieht Lizenz je Eintrag vor). Die
  Option widerspricht KERN 4.0 §1 (ausgeliefertes Audio nur CC0, CC BY, CC BY-SA); sie setzt eine Entscheidung des Nutzers
  voraus (Nachtrag der Gegenprüfung vom 20.10.2026).
- **Wortlaut-Werkzeug:** G-01 deckt nur Status „neu“ in `web/docs/recht/entwuerfe/`. Ändert ein späterer Lauf diese Entwürfe
  und prüft gegen eine Basis, in der sie schon stehen, ergibt das Befunde „hoch“, bis eine eigene Ausnahme eingetragen ist.
- **Falle beim Schreiben:** Backslash-u-Escapes im Text eines Schreibwerkzeugs werden zu echten Zeichen. In diesem Beleg
  entstanden so in einer Befehlszeile die Grenzzeichen der arabischen Blöcke; die Zeile nennt jetzt Codepunkte als „U+…“,
  die Prüfung danach ergab 0. Für Werkstattdateien Codepunkte nur als „U+…“ schreiben.
- **Übersetzungen:** tr und ar fehlen bewusst (Übersetzungsaufgabe); ohne sie kann `lernapp_sync` in diesen Oberflächen nicht
  eingeschaltet werden.

## 7. Aufräumen

- Keine Server und keine Hintergrundprozesse gestartet; nichts zu beenden.
- Keine Downloads, keine Werkzeuge, keine Modelle, kein venv.
- Scratchpad `SP = /tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/l0`:
  - behalten: `wortlaut.{json,md}` (≈ 11 MB, vorgegebenes Protokoll), `wortlaut-arbeitsstand.{json,md}` (≈ 11 MB),
    `recht/wortlaut-head-gegen-arbeitsstand.md` (0,36 MB), `recht/*.log`
  - gelöscht: doppelte Protokolle des Vorher-Laufs und das JSON des Laufs gegen HEAD (≈ 21 MB)
- Platte nach der Arbeit: 7,1 GB frei (`df -h /`).
- Arbeitsbaum: drei neue Dateien unter `web/docs/recht/entwuerfe/`, `loeschkonzept.md` geändert (nur Einfügung), dieser
  Beleg neu. Nichts committet, Index unverändert.
