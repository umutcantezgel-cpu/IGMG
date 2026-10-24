# Datenschutz-Folgenabschätzung – Nachtrag Lern-App (Art. 35 DSGVO)

> **ENTWURF – vor Veröffentlichung durch Datenschutz/Recht prüfen (MENSCHEN LM-08, MN-11).** Dieser Nachtrag ergänzt die DSFA der Lernplattform (`dsfa-lernplattform.md`) um die Lern-App unter `/lern-app/…`. Er ist die fachliche Vorarbeit des Laufs „Lern-App“ (Etappe L0), ersetzt **nicht** die Stellungnahme der oder des Datenschutzbeauftragten (Art. 35 Abs. 2) und ist keine Rechtsberatung. Bis zur Bestätigung bleiben die Schalter `lernapp_sync`, `lernapp_gruppen`, `lernapp_rangliste`, `lernapp_statistik` und `push_lernapp` in der Produktion **aus** (KERN 4.0 §6, ADR 0035). Alles in eckigen Klammern `[ ]` ist offen; `[prüfen]` ist nicht belegt. Der Code der Lern-App entsteht ab Etappe L1; Verweise auf Code und Tests sind deshalb **geplant**, nicht belegt.

| | |
| --- | --- |
| Verarbeitung | Lern-App der Gemeinde: Sprachkurse de/tr/ar, Wissenskurs (nur Deutsch), Koran-Arabisch; ohne Konto lokal auf dem Gerät, mit Konto Abgleich, Lerngruppen, Schreibabgaben, freiwillige Bestenliste ab 16, Erinnerungen; Spracherkennung nur im Browser; anonyme Fehlermeldungen; Aufnahmen von Sprecherinnen und Sprechern |
| Verantwortlicher | [Name und Rechtsform – Vorstand], [Anschrift] |
| Datenschutzbeauftragte/r | [Datenschutzbeauftragte/r – Angaben von der Gemeinde] |
| Version, Stand | Entwurf 0.1, 20.10.2026 · Branch `claude/trusting-lovelace-6nfolz`, Commit `c2dc80c` (Lern-App-Code noch nicht auf dem Branch; Schema-Entwurf der Etappe L1 im Arbeitsbaum) |
| Beteiligte | [Vorstand], [Bildung], [Technik], [Ansprechperson Kinderschutz], [DSB], [Imam/Hoca für den Wissenskurs] |
| Zugehörige Dokumente | `dsfa-lernplattform.md` (Grund-DSFA, R-01 bis R-18, S-01 bis S-18, D-01 bis D-17), `einwilligung-lernapp.md` (Einwilligung `lernapp`, Zustimmung Bestenliste), `vereinbarung-sprecher-lernapp.md`, `loeschkonzept.md` §3.7 (L-37 bis L-53), `einwilligungen.md` (E1 bis E5, Push), `verarbeitungsverzeichnis-ergaenzung.md`; Regeln `_lernapp/KERN.md` §5 und §6; ADR 0037 bis 0045 |

## 1. Anlass und Schwellenwertprüfung

**Warum ein Nachtrag.** Die Lern-App verbindet Merkmale, bei denen eine DSFA nach Art. 35 Abs. 1 und 3 DSGVO angezeigt ist oder vorsorglich durchgeführt wird:

1. **Besondere Kategorien (Art. 9):** Der Fortschritt im Wissenskurs „Islamisches Wissen“ und im Pfad „Koran-Arabisch“ lässt auf die religiöse Überzeugung schließen (KERN 4.0 §6). Schon die Nutzung eines Kontos der Gemeinde für die Lern-App kann das tun.
2. **Kinder und Jugendliche** nutzen die App, mit und ohne Konto.
3. **Neue Technik:** Spracherkennung im Browser (Whisper), Offline-Speicher auf dem Gerät, Abgleich zwischen Geräten, eine eigene installierbare App (PWA).
4. **Bewertung und Vergleich:** XP, Lerntage, Abzeichen und eine freiwillige Bestenliste. Die Bestenliste ist eine **Ausnahme** von der Maßnahme zu R-08 der Grund-DSFA („keine Ranglisten“); sie beruht auf der Nutzerentscheidung L3-E02 (ADR 0043 Nr. 8).
5. **Stimme als personenbezogenes Datum:** Aufnahmen von Sprecherinnen und Sprechern werden veröffentlicht; auf ausdrücklichen Wunsch kann daraus eine synthetische Stimme entstehen.

**Ergebnis.** Die Gemeinde verfährt wie bei der Lernplattform vorsorglich. Weil Verantwortlicher, Konten, Gruppen, Hosting und Maßnahmen dieselben sind, wird die Lern-App als **Nachtrag** zur Grund-DSFA bewertet (Art. 35 Abs. 1 Satz 2: eine Abschätzung für ähnliche Verarbeitungsvorgänge) `[prüfen: DSB bestätigt, dass ein Nachtrag genügt]`.

**Geltungsbereich.** Alle Funktionen hinter den Schaltern `lernapp`, `lernapp_ungeprueft`, `lernapp_sprechen`, `lernapp_meldungen`, `lernapp_sync`, `lernapp_gruppen`, `lernapp_rangliste`, `lernapp_statistik` und `push_lernapp` sowie die Verwaltung der Lern-App (`/verwaltung/lernapp/**`). Für alles, was nicht eigens genannt ist, gilt die Grund-DSFA.

## 2. Systematische Beschreibung der Verarbeitung (Art. 35 Abs. 7 lit. a)

### 2.1 Zwei Betriebsarten

| Betriebsart | Was geschieht | Verarbeitung personenbezogener Daten durch die Gemeinde |
| --- | --- | --- |
| **Ohne Konto** (Standard, voll nutzbar) | Seiten, Kurspakete, Audio und Modelle kommen nur per GET vom eigenen Ursprung. Fortschritt, Wiederholungskarten, XP, Lerntage und Einstellungen liegen in der IndexedDB `igmg-lernapp` und in den Caches `igmg-lernapp-*` **auf dem Gerät**. Keine Cookies, keine Analyse, kein Personenbezug. Ein POST entsteht nur durch eine ausdrückliche Handlung: die anonyme Meldung (LA-V3). | **keine** über den Abruf der Website hinaus. Es bleiben die Server-Protokolle des Hosters wie bei der Website (Löschkonzept L-09) und bei einer Meldung die ALTCHA-Lösung und das Ratenfenster ohne IP im Klartext (L-05, T-05). |
| **Mit Konto, Einwilligung `lernapp` und Schalter** | Abgleich der Ereignisse zwischen Geräten, Zuweisungen der Lehrkraft, Lernwoche für Eltern, Schreibabgaben an die Lehrkraft, Bestenliste (ab 16, eigene Zustimmung), Erinnerungen per Push | ja, LA-V4 bis LA-V8 |

### 2.2 Verarbeitungsvorgänge

| Nr. | Vorgang | Zweck | Daten (Auszug) | Zugriff |
| --- | --- | --- | --- | --- |
| LA-V1 | Lernen ohne Konto | Lernen, auch offline | Lernprofile auf dem Gerät (ohne Passwort, mehrere je Familiengerät), Ereignisprotokoll, Kartenstand, Einstellungen; nur in IndexedDB und Cache Storage | nur das Gerät; die Gemeinde hat keinen Zugriff |
| LA-V2 | Sprechübungen mit Spracherkennung im Browser | Ausspracheprobe ohne Note | Mikrofonaufnahme im Browser, Abschrift im Worker; Modelldateien per GET vom eigenen Ursprung | nur das Gerät; keine Übertragung, auch nicht an Lehrkräfte (§6) |
| LA-V3 | Anonyme Meldung „Fehler melden“ | Inhalte verbessern | Aufgabenschlüssel, Kategorie, Zeitpunkt; kein Konto, kein Gerätebezug. Nur angemeldete Personen ab 16 können optional ihre eigene Antwort mitschicken | Redaktion (`/verwaltung/lernapp/meldungen`) |
| LA-V4 | Abgleich mit Konto (`lernapp_sync`) | gleicher Stand auf mehreren Geräten | Lernprofil; Ereignisse (Geräte-UUID, laufende Nummer, Zeitpunkt, Lerntag, Art: Bewertung, Lektion, XP, Pause, Einstellung, Einstufung, Tagesziel); abgeleiteter Kartenstand und Lerntage. **Keine** Antworttexte, **keine** Aufnahmen | die Person selbst; Eltern sehen die Lernwoche ihres Kindes; Lehrkraft siehe LA-V5 |
| LA-V5 | Lerngruppe: Zuweisungen, Stand, Gruppenziel (`lernapp_gruppen`) | Unterricht begleiten | Zuweisung als `aufgabe` mit Bezug `lernapp`, Erledigt-Vermerk (`aufgabe_erledigt`), Stand der zugewiesenen Einheiten; Gruppenziel als Summe der XP **ohne Namen** | Lehrkraft der eigenen Gruppe, nur für Lernende, die mit Einwilligung `lernapp` abgleichen |
| LA-V6 | Schreibabgaben (B1 bis C1) | Rückmeldung der Lehrkraft | Text und Kommentar der Lehrkraft **verschlüsselt** (AES-256-GCM, T-01), Bewertung nach Prüfliste, Zeitpunkt, Löschdatum; bei Kindern unter 16 bis D-L16 **kein Kommentar** (nur Prüfliste und Einstufung); ein vorher gespeicherter Kommentar erreicht das Kind nicht mehr (die Auskunft nach Art. 15/20 bleibt vollständig) | nur die Lehrkraft der eigenen Gruppe, solange die Mitgliedschaft läuft und die Einwilligung die Abgabe deckt, und die Person selbst; andere Lernende nie |
| LA-V7 | Bestenliste (`lernapp_rangliste`) | freiwilliger Vergleich in Gruppe oder Familie | Zustimmung, Anzeigename (Vorname und Initial, S-14), XP der laufenden Woche | Teilnehmende derselben Gruppe bzw. Familie, die selbst zugestimmt haben; nur ab 16 |
| LA-V8 | Erinnerungen (`push_lernapp`) | Lernen nicht vergessen, auf Wunsch | Push-Abo wie Bestand (Thema `lernapp`), neutraler Text ohne Serienbezug | Server, Push-Dienst des Browsers (wie V8 der Grund-DSFA) |
| LA-V9 | Statistik ohne Personenbezug | Inhalte und Schwierigkeit verbessern | Tagessummen je Kurs, Einheit und Kennzahl (`lernapp_statistik_tag`); angezeigt nur ab n ≥ 10. Optional anonyme Telemetrie ohne Konto (`lernapp_statistik`, Opt-in) | Bildung, Leitung (Recht `lernapp.statistik.lesen`) |
| LA-V10 | Prüfung der Inhalte | Qualität und religiöse Freigabe | Konten der Prüfenden (Rollen `sprachpruefung`, `religioese_pruefung`), Urteile mit Kennung der prüfenden Person, Inhalts-Hash, Zeitpunkt; öffentlich nur die Rolle („geprüft von zwei Gelehrten der Gemeinde“) | Redaktion, Prüfende, Verlauf in `freigabe` |
| LA-V11 | Sprecherinnen und Sprecher | Audio der Sprachkurse | Aufnahmen (Stimme), Name oder Pseudonym, unterschriebene Vereinbarung (Scan), Zuordnung `mensch:<id>` im Audio-Manifest; optional Trainingsdaten und Stimmmodell (nur lokal) | Audio-Studio der Verwaltung; die Aufnahmen werden als Teil der Kurse öffentlich (CC BY-SA 4.0) |
| LA-V12 | Anmeldung im Bereich der Lern-App | Konto in der installierten App (iOS hat eine eigene Cookie-Ablage) | wie Konten der Grund-DSFA (V2), gleicher Sitzungscookie; die statischen Seiten der Lern-App lesen und setzen keine Cookies, den Kontostand holt der Client über `/api/lernapp/sitzung` (ADR 0037 Nr. 4) | Person selbst |

### 2.3 Betroffene

Lernende jeden Alters ohne Konto (bei der Gemeinde fallen keine Daten an), Kontoinhaber: Erwachsene, Jugendliche ab 16, Kinder unter 16 mit Kinderkonto (Einwilligung der Eltern), Eltern, Lehrkräfte, Prüfende (Sprache, Religion), Redaktion, Sprecherinnen und Sprecher (nur Erwachsene, siehe Vereinbarung). Geschätzte Zahl: [Zahl der Konten in der Lern-App – Bildung].

### 2.4 Datenfluss (vereinfacht)

```
Gerät ohne Konto:  Browser --GET--> eigener Ursprung (Seiten, Pakete, Audio, Modelle)
                   IndexedDB igmg-lernapp + Caches igmg-lernapp-*   (bleibt auf dem Gerät)
                   Mikrofon -> Worker (Whisper) -> Markierung im Zielsatz   (bleibt auf dem Gerät)
                   nur auf Klick: POST /api/lernapp/meldung (Aufgabenschlüssel, Kategorie, ALTCHA)

Gerät mit Konto:   POST /api/lernapp/sync (Ereignisse) --TLS--> Vercel fra1 --> Neon (Frankfurt)
                   Gruppe/Schreibabgabe/Bestenliste über /api/lernapp/* (Sitzung, Einwilligung, Schalter)
                   Push wie Bestand: Server --> Push-Dienst des Browsers (ohne Inhalt)

Verwaltung:        Audio-Studio (Mikrofon) --> Blob lernapp (öffentlich, nur Kursaudio)
                   Training einer eigenen Stimme: nur lokal, nur mit Modul B der Sprecher-Vereinbarung
```

### 2.5 Technik und Orte

- Wie Grund-DSFA §2.4: Next.js auf Vercel (`fra1`), PostgreSQL bei Neon, Vercel Blob `[prüfen: Regionen, Verzeichnis 2.1 bis 2.3]`. Neu ist der öffentliche Blob-Speicher `lernapp` für Kursaudio (ohne Daten der Lernenden).
- Eigenes Wurzel-Layout `/lern-app/[ui]` mit `ui` aus de, tr, ar; eigener Service Worker mit Scope `/lern-app/`; IndexedDB `igmg-lernapp` (ADR 0037, 0038).
- Kopfzeilen nur unter `/lern-app/:pfad*` (ADR 0042, Fortschreibung S2): CSP mit `'wasm-unsafe-eval'`, `worker-src 'self'` ohne `blob:`, `media-src 'self' blob:`; `Cross-Origin-Opener-Policy: same-origin` und `Cross-Origin-Embedder-Policy: require-corp`. Mikrofon (`Permissions-Policy`) nur auf `…/ueben`, `…/wiederholen` und im Audio-Studio der Verwaltung.
- Whisper-Modelle statisch vom eigenen Ursprung (`/lern-app/modelle/…`), `allowRemoteModels = false`; keine Anfrage an `huggingface.co` oder `cdn.jsdelivr.net`.
- Keine Laufzeit-KI auf dem Server oder bei Dritten (KERN 4.0 §1).

### 2.6 Rollen und Rechte (Ergänzung zu Grund-DSFA §2.5)

| Wer | Darf in der Lern-App |
| --- | --- |
| Person ohne Konto | alles lokal; anonyme Meldung |
| Lernende mit Konto (ab 16 oder Erwachsene) | eigenen Stand abgleichen, exportieren, löschen; Einwilligung `lernapp` in „Mein Bereich › Konto“ selbst erteilen und widerrufen (ab 16 auch mit Wirkung für eine noch laufende Einwilligung der Eltern); Schreibabgaben an die eigene Lehrkraft; Bestenliste nur mit eigener Zustimmung, Rücknahme auch in „Mein Bereich“ |
| Kind mit Kinderkonto (unter 16) | eigenen Stand abgleichen, wenn die Eltern `lernapp` erteilt haben; die Einwilligung erteilen und widerrufen nur die Eltern; **keine** Bestenliste (im Code gesperrt); keine eigene Antwort in Meldungen |
| Eltern | Lernwoche des eigenen Kindes (Lerntage, erledigte Lektionen, XP); keine Bestenliste des Kindes; Einwilligungen verwalten, auch `lernapp` für das Kind (nur sorgeberechtigt, mit bestätigtem Bezug, mit Einvernehmen; ab 16 entscheidet das Kind) |
| Lehrkraft (Gruppenleitung) | Einheiten zuweisen; Stand der Lernenden der **eigenen** Gruppe, die abgleichen; Schreibabgaben der eigenen Gruppe lesen und kommentieren; Gruppenziel setzen; Bestenliste der Gruppe einschalten |
| `bildung` | Inhalte bearbeiten und veröffentlichen, Audio-Studio, Statistik; **keine** Schreibabgaben `[Entscheidung D-L06]` |
| `sprachpruefung` | Inhalte der eigenen Sprachen prüfen |
| `religioese_pruefung` | Wissensbausteine und Einträge mit Religionsbezug prüfen; die Administration ersetzt das nie (`NIE_PER_ADMINISTRATION`) |
| `administration` | wie Grund-DSFA; Vorschlag: **kein** Lesen von Schreibabgaben (D-L06); ein Konto mit Administration hat nie Gruppenzugang – auch nicht als Altbestand mit Gruppenleitung oder Kontoart Eltern, Lehrkraft, Schüler (S-L2 N-1; Startklar `gemeinde.administration-gruppenzugang` Rot in der Produktion) |
| `leitung` | Statistik ohne Personenbezug lesen |

Geplante Belege: `web/src/lib/rechte/matrix.ts` und `gruppen.ts` (Erweiterung in L1), Integrationstests der Gruppenisolation und Rechte-Matrix (PLAN §13).

### 2.7 Speicherfristen (Gesamtübersicht `loeschkonzept.md` §3.7)

Lernstand mit Konto 12 Monate nach der letzten Aktivität in der Lern-App und mit dem Konto; Ereignisse älter als 12 Monate werden in den Kartenstand verdichtet; Schreibabgaben 12 Monate nach der Abgabe, beim Austritt aus der Gruppe von ihr gelöst (danach liest sie keine Lehrkraft mehr, auch nach einem Wiedereintritt nicht), nach Widerruf von `lernapp` gelöscht, soweit keine geltende Einwilligung sie deckt, jederzeit selbst löschbar (auch unter „Mein Bereich › Konto“, wenn die Gruppen ausgeschaltet sind; Stand S-L2-Auflagen, ADR 0042 Nr. 17); Meldungen ohne Personenbezug, die mitgeschickte Antwort spätestens bei Erledigung; Statistik ohne Personenbezug; Sprecheraufnahmen bis zum Widerruf; Gerätespeicher in der Hand der Person.

Nach Widerruf von `lernapp` oder dem Ende des Eltern-Kind-Bezugs (Stand SL2-Rest, ADR 0042 Nr. 23 und 24): Deckt keine geltende Einwilligung mehr, werden Lernstand auf dem Server, Zustimmung zur Bestenliste und Familien-Bestenliste **sofort** gelöscht; Schreibabgaben, die nur die beendete Einwilligung deckte, ebenso. Der Stand auf dem Gerät bleibt.

### 2.8 Funktionsschalter und Cockpit-Sperren (KERN 4.0 §6)

| Schalter | Personendaten | Vorschau | Produktion | Sperre im Cockpit |
| --- | --- | --- | --- | --- |
| `lernapp` | nein | an | an nach Abnahme | – |
| `lernapp_ungeprueft` | nein | an | an | – |
| `lernapp_sprechen` | nein (lokal) | an | aus bis Gerätetest (LM-07) | – |
| `lernapp_meldungen` | nein | an | an | – |
| `lernapp_sync` | ja | an | **aus** | `konten` an, dieser Nachtrag bestätigt (LM-08) |
| `lernapp_gruppen` | ja | an | **aus** | `lernplattform` an, LM-08 |
| `lernapp_rangliste` | ja | an | **aus** | `lernapp_gruppen` an, LM-10 |
| `lernapp_statistik` | grenzwertig (IP) | an | **aus** | Entscheidung der DSB (D-L08) |
| `push_lernapp` | ja | an | **aus** | wie `push` |

## 3. Notwendigkeit und Verhältnismäßigkeit (Art. 35 Abs. 7 lit. b)

### 3.1 Zweck und Alternativen

| Zweck | Alternative | Warum diese Lösung |
| --- | --- | --- |
| Lernen | Lernen nur mit Konto (wie viele Lern-Apps) | **ohne Konto voll nutzbar** ist die datensparsamste Form; das Konto ist ein Angebot, keine Bedingung (L3-E05) |
| Mehrere Geräte | Datei-Export und -Import | bleibt als Weg ohne Konto (ADR 0038 Nr. 8); der Abgleich ist für Familien und Lerngruppen bequemer |
| Begleitung durch die Lehrkraft | Papier, Gespräch im Unterricht | Zuweisungen und Stand nur der eigenen Gruppe, nur mit Einwilligung; ohne Einwilligung bleibt der Unterricht wie bisher |
| Schreiben mit Rückmeldung | KI-Bewertung | keine Laufzeit-KI (ADR 0042); die Abgabe geht verschlüsselt nur an die eigene Lehrkraft |
| Sprechen üben | Spracherkennung beim Hersteller des Browsers oder auf einem Server | die Aufnahme verlässt das Gerät nie (L3-E06) |
| Motivation | Bestenliste für alle | Standard ist das Gruppenziel ohne Namen; die Bestenliste ist freiwillig, nur ab 16 und nur in Gruppe oder Familie (§4) |
| Fehler in Inhalten finden | Meldung mit Konto oder Kontaktformular | anonyme Meldung mit nur Aufgabenschlüssel und Kategorie (§7) |

### 3.2 Rechtsgrundlagen

- **Ohne Konto:** Die Gemeinde verarbeitet keine personenbezogenen Daten der Lernenden; alles bleibt auf dem Gerät `[prüfen: Einordnung, D-L01]`. Das Speichern in IndexedDB und im Service Worker ist für den ausdrücklich gewünschten Dienst unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG) `[prüfen]`. Server-Protokolle des Hosters wie bei der Website (Art. 6 Abs. 1 lit. f).
- **Sprechübungen:** keine Verarbeitung durch die Gemeinde; der Browser fragt nach der Freigabe des Mikrofons.
- **Anonyme Meldung:** Aufgabenschlüssel und Kategorie sind keine personenbezogenen Daten. ALTCHA und Ratenbegrenzung: Art. 6 Abs. 1 lit. f (Schutz vor Missbrauch), IP nie im Klartext (T-05). Die optional mitgeschickte eigene Antwort (nur angemeldet ab 16): Art. 6 Abs. 1 lit. a, durch eigenes Ankreuzen `[prüfen]`.
- **Mit Konto:** Einwilligung `lernapp` (Art. 6 Abs. 1 lit. a, Art. 9 Abs. 2 lit. a, **ausdrücklich**); für Kinder unter 16 durch die Sorgeberechtigten (Art. 8); ab 16 selbst; einzeln und widerrufbar (Art. 7). Art. 9 Abs. 2 lit. d ergänzend `[prüfen: Rechtsberatung, D-L14]`.
- **Bestenliste:** eigene, gesonderte Zustimmung (Art. 6 Abs. 1 lit. a), nur ab 16.
- **Erinnerungen:** bestehende Einwilligungen `push` bzw. `push_kind` (Grund-DSFA, `einwilligungen.md` E4).
- **Prüfende:** Mitwirkung im Ehrenamt (Art. 6 Abs. 1 lit. b oder f) `[prüfen]`.
- **Sprecherinnen und Sprecher:** Vereinbarung (Art. 6 Abs. 1 lit. b) und Einwilligung (lit. a); Training oder Klonen einer synthetischen Stimme nur mit gesonderter, ausdrücklicher Einwilligung (Modul B der Vereinbarung).
- **Statistik:** Summen ohne Personenbezug; ihre Bildung aus Ereignissen von Konten ist eine Weiterverarbeitung, vereinbar nach Art. 6 Abs. 4 `[prüfen]`. Telemetrie ohne Konto nur mit Opt-in (Art. 6 Abs. 1 lit. a; § 25 Abs. 1 TDDDG) und erst nach Entscheidung der DSB.
- **Keine Kopplung (Art. 7 Abs. 4):** Die Lern-App ist ohne Konto voll nutzbar; die Teilnahme am Unterricht hängt nicht von `lernapp` ab.

### 3.3 Datenminimierung und Speicherbegrenzung

- Keine Freitext-Kommunikation zwischen Personen; Schreibabgaben nur an die eigene Lehrkraft.
- Keine Sprachaufnahmen auf dem Server; keine freie Abschrift auf dem Bildschirm (ADR 0042, Fortschreibung S2 Nr. 2).
- Ereignisse enthalten Bewertungen (richtig, mit Hilfe, falsch), nicht den Wortlaut der Antworten.
- Tagesziel in XP oder Lektionen, **nicht** in Minuten: keine Messung der Lernzeit (ADR 0043).
- Anzeigename Vorname und Initial; Gruppenziel ohne Namen; Statistik nur ab n ≥ 10.
- Ereignisse älter als 12 Monate werden verdichtet; Lernstand 12 Monate nach der letzten Aktivität gelöscht.
- Meldungen ohne Konto- und Gerätebezug.
- Keine Tracker, keine Drittanfragen, keine Werbung, keine Spendenaufrufe in der Lern-App (L0-E17).
- Vorschlag: Lehrkräfte und Eltern sehen Lerntage, nicht Uhrzeiten (D-L13).

### 3.4 Transparenz und Betroffenenrechte

- Datenschutzerklärung: neuer Abschnitt „Lern-App“ `[Baustein ergänzen – DSB; Vorlage datenschutz-v2-bausteine.md]` mit kindgerechter Kurzfassung.
- In der App: Seite „Einstellungen“ mit „Wo liegen meine Daten?“, Export als Datei, „Lokale Daten löschen“ und, mit Konto, Abgleich aus- und einschalten und die Einwilligung widerrufen `[Texte in web/messages/lernapp/{de,tr,ar}.json, L1/L7]`.
- Auskunft und Löschung mit Konto über „Mein Bereich“ wie Bestand; Export der Server-Daten (Art. 15, Art. 20) als Datei – mit Lernprofil, Ereignissen, Kartenstand, Lerntagen, Zustimmung zur Bestenliste und Schreibabgaben (gebaut, `web/src/lib/lernapp/export.ts`).
- Einwilligung `lernapp` erteilen und widerrufen in „Mein Bereich“ (gebaut, S-L3 N-2): ab 16 unter „Konto › Lern-App“, für Kinder unter „Meine Kinder“; Wortlaut als Entwurf mit Version und Hash; Erteilen nur mit `lernapp_sync` oder `lernapp_gruppen`, Widerruf immer. Die Einstellungen der Lern-App verweisen dorthin.
- Eltern üben die Rechte der Kinder aus, Jugendliche ab 16 selbst.

### 3.5 Auftragsverarbeitung und Drittland

Keine neuen Auftragsverarbeiter: Vercel, Neon und Vercel Blob wie bisher (Verzeichnis, Abschnitt 2). Der Blob-Speicher `lernapp` enthält nur öffentliches Kursaudio. Push-Dienste der Browser wie Grund-DSFA §3.5 (Drittland, D-17). Die Spracherkennung läuft auf dem Gerät; es gibt keinen Dienst eines Dritten. Training einer synthetischen Stimme nur lokal; braucht es dafür Rechenzeit bei einem Anbieter (GPU, LM-26), ist das eine neue Verarbeitung mit eigener Prüfung `[prüfen]`.

### 3.6 Kinderrechte

Erwägungsgrund 38: keine Werbung, kein Profiling, keine Verhaltensauswertung für Dritte. Zusätzlich in der Lern-App (KERN 4.0 §5): keine Bestenliste unter 16 (im Code gesperrt, nicht über einen Schalter); Erinnerungen standardmäßig aus und für Kinder nur mit `push_kind`; keine Herzen, keine Ligen, keine Schuld- oder Verlusttexte (Test `sanfte-texte`); Pausetage; keine externen Links in Lektionen; Hinweis auf die Sitzungslänge; Kinder können die Lern-App ohne Konto voll nutzen.

## 4. Ausnahme zu R-08: Bestenliste in Gruppe oder Familie

**Ausgangslage.** Die Grund-DSFA nennt als Maßnahme zu R-08 (Überwachung und Leistungsdruck) „keine Ranglisten, keine Punktevergleiche“. Der Nutzer hat für die Lern-App entschieden: „Bestenliste freiwillig, nur in der eigenen Gruppe oder Familie; für Kinder aus“ (L3-E02, ADR 0043 Nr. 8). Für die Lernplattform und die übrige Website bleibt R-08 unverändert.

**Grenzen der Ausnahme:**

| Merkmal | Regel | Geplanter Beleg |
| --- | --- | --- |
| Ort | nur in einer Lerngruppe der Gemeinde oder in einer Familie; keine öffentliche oder globale Liste, keine Ligen | Integrationstest |
| Einschalten | die Lehrkraft für die Gruppe, die Eltern für die Familie; Schalter `lernapp_rangliste` (Produktion aus, setzt `lernapp_gruppen` voraus) | Schaltertest |
| Zustimmung | jede Person stimmt **vorher selbst** zu (Opt-in, nicht Abmeldung); jederzeit widerrufbar, die Person verschwindet sofort | Integrationstest „nur mit Zustimmung“ |
| Alter | nur ab 16; Konten unter 16 erscheinen nie und sehen keine Bestenliste; die Sperre steht im Code (`sechzehnAm`, `istKind`) | Integrationstest „keine Bestenliste unter 16“, E2E „Kind ohne Bestenliste“ |
| Inhalt | XP der laufenden Woche, Vorname und Initial; keine Medaillen, kein Verlauf, keine Lernzeit | Unit-Test |
| Eltern | sehen die Lernwoche ihres Kindes, nie eine Bestenliste mit dem Kind | Integrationstest |

**Zusätzliches Risiko.** Wochen-XP aus dem Wissenskurs oder dem Koran-Arabisch-Pfad lassen in einer Liste mit Namen Rückschlüsse auf religiöses Lernen zu (Art. 9). Vorschlag (D-L04): Die Bestenliste zählt nur XP aus den Sprachkursen.

**Bewertung.** Mit diesen Grenzen ist die Ausnahme nach Einschätzung dieses Entwurfs vertretbar: Wer erscheint, hat als Person ab 16 selbst zugestimmt; der Kreis ist klein und bekannt; Kinder sind technisch ausgeschlossen. Restrisiko **gering bis mittel** (Gruppendruck, sich doch anzumelden; Vergleich in Familien) `[DSB bestätigt]`. Bis LM-10 und die Bestätigung dieses Nachtrags bleibt `lernapp_rangliste` aus.

## 5. Spracherkennung im Browser (Whisper lokal)

1. **Ablauf:** Die Aufnahme entsteht im Browser und geht an einen Worker auf demselben Gerät. Er erkennt die Wörter mit Whisper (`Xenova/whisper-base` q8, ADR 0042). Die App markiert nur die Wörter des Zielsatzes; eine freie Abschrift zeigt sie nie.
2. **Keine Übermittlung:** Die Aufnahme verlässt das Gerät nie, auch nicht zur Lehrkraft (KERN 4.0 §6). Die Modelldateien kommen per GET vom eigenen Ursprung (`allowRemoteModels = false`, `localModelPath` `/lern-app/modelle/`). Laden erst nach Klick, mit Größenangabe (≈ 95 MB) und Gerätecheck.
3. **Nur eigener Ursprung:** Die CSP der Lern-App lässt nur Ressourcen vom eigenen Ursprung zu (`worker-src 'self'` ohne `blob:`, kein `'unsafe-eval'`). Zusätzlich gelten unter `/lern-app` COOP `same-origin` und COEP `require-corp`: Jede geladene Ressource muss das ausdrücklich erlauben, und kein fremdes Fenster teilt sich den Prozess mit der App. Fremde Einbettungen sind damit doppelt ausgeschlossen `[Header-Test und E2E in L1 belegen]`.
4. **Beleg aus Spike S2** (`_lernapp/belege/S2-whisper-im-browser.md` §3.9): In 27 Läufen gingen 1.410 Anfragen von Seite, Worker und ORT-Threads nur an den eigenen Ursprung; keine Anfrage an `huggingface.co`, `cdn.jsdelivr.net` oder einen anderen Host. Abnahme Z-L08 prüft das als E2E-Netzprotokoll, auch nach dem Laden des Modells.
5. **Speicher:** Vorschlag (D-L12 a): Die Aufnahme liegt nur im Arbeitsspeicher, bis die Übung endet, und wird nicht in IndexedDB oder im Cache gespeichert `[in L5 belegen]`.
6. **Keine Entscheidung mit Wirkung:** Die Rückmeldung heißt „Ausspracheprobe“; es gibt keine Note und keine Folgen. Lernende bewerten sich selbst (ADR 0038 Nr. 3). Art. 22 DSGVO ist nicht berührt `[prüfen]`.
7. **Kalibrierung (L5):** Schwellen werden mit Aufnahmen echter Lernender neu eingestellt. Teilnahme nur mit eigener Einwilligung; die Aufnahme bleibt auf dem Gerät, notiert werden nur Zahlen. Vorschlag: nur Erwachsene, keine Kinder `[Einwilligungstext für die Probe – L5]`.
8. **Ergebnis:** Für diesen Teil verarbeitet die Gemeinde keine personenbezogenen Daten. Er ist hier dokumentiert, weil er das Vertrauen in die App trägt und weil eine spätere Änderung (z. B. Abschrift an die Lehrkraft) eine neue Prüfung auslösen würde.

## 6. Anonyme Meldungen

1. **Inhalt:** nur Aufgabenschlüssel (z. B. `ar.a1.e03.s0042`) und Kategorie (Schema-Entwurf L1: Antwort hätte stimmen sollen, Fehler im Zieltext, Fehler in der Übersetzung, Fehler im Audio, anstößig, Sonstiges), dazu der Zeitpunkt. Kein Konto, keine Geräte-Kennung, kein Lernstand (genehmigter Plan §2.7, ADR 0041 Nr. 9).
2. **Schutz vor Missbrauch:** ALTCHA und Ratenbegrenzung mit nicht umkehrbarem Prüfwert statt IP (T-05, L-05). Schalter `lernapp_meldungen`.
3. **Eigene Antwort:** Nur angemeldete Personen ab 16 können ihre Antwort optional mitschicken, durch eigenes Ankreuzen; ohne Konto und bei Kindern nie (KERN 4.0 §5). Auch diese Meldung wird **ohne** Kontobezug gespeichert. Risiko: Die Antwort kann persönliche Angaben enthalten. Vorschlag (D-L07): höchstens [200] Zeichen, Hinweis „Bitte keine persönlichen Angaben“, Löschung des Antwortfelds bei Erledigung, spätestens 12 Monate nach Eingang.
4. **Ergebnis:** Ohne Antwort sind Meldungen keine personenbezogenen Daten `[prüfen: Rückschluss über Zeitpunkt und Aufgabe bei sehr kleinen Gruppen]`.

## 7. Risikoanalyse (Art. 35 Abs. 7 lit. c)

Skala und Begriffe wie Grund-DSFA §4. „Vorher“ = ohne die Maßnahmen aus §8; „Rest“ = nach den Maßnahmen, wie sie geplant sind (noch nicht im Code belegt).

| Nr. | Risiko | Vorher (Schwere/Wahrsch.) | Maßnahmen | Rest |
| --- | --- | --- | --- | --- |
| R-L01 | **Offenlegung der religiösen Überzeugung** über den Stand im Wissenskurs oder im Koran-Arabisch-Pfad (Leck, Fehlsicht, Bestenliste) | hoch / gering | M-L01, M-L02, M-L05, M-L06, M-L09; Vorschlag D-L03, D-L04 | gering |
| R-L02 | **Leistungsdruck und Vergleich** durch XP, Serie, Bestenliste (Ausnahme zu R-08) | mittel / mittel | M-L07, M-L08, §4 | gering bis mittel |
| R-L03 | **Suchtmuster und Druck bei Kindern** (Serien, Erinnerungen) | mittel / mittel | M-L08, M-L10 | gering |
| R-L04 | **Unwirksame Einwilligung** (Kind willigt selbst ein, nur ein Elternteil) | mittel / mittel | M-L03; Kinderkonto nur über die Eltern, Haken „Einvernehmen“ (wie R-07) | mittel (wie D-12) |
| R-L05 | **Persönliche Angaben in Schreibabgaben** (auch Art. 9 durch eigene Inhalte) | mittel / mittel | M-L04, M-L06; Hinweis in der Aufgabe; Themen ohne private Angaben `[Inhaltsleitfaden LM-09]` | gering |
| R-L06 | **Unbeabsichtigte Übermittlung** von Sprachaufnahmen oder Drittanfragen (Modelle von fremden Hosts) | hoch / gering | M-L11, M-L12 | gering |
| R-L07 | **Fehlbewertung beim Sprechen** (schwache Erkennung für tr und ar, Frust) | gering / hoch | keine Note, Selbstbewertung, Arabisch ohne automatische Rückmeldung (ADR 0042, Fortschreibung S2), Rückfall „Ich kann gerade nicht sprechen“ | gering |
| R-L08 | **Geteilte Geräte:** lokale Profile ohne Passwort; nach dem Abmelden bleibt der lokale Stand | mittel / mittel | M-L13 | gering bis mittel |
| R-L09 | **Rückschluss auf Einzelne** aus Gruppenziel oder Statistik kleiner Gruppen | gering / mittel | M-L14 | gering |
| R-L10 | **Zu lange Speicherung** (Ereignisse, Schreibabgaben, Sicherungen, Gerätespeicher) | mittel / mittel | M-L15; Sicherungen 30 Tage (L-33); Gerätespeicher in der Hand der Person | gering bis mittel (bis der Löschlauf der Lern-App gebaut und getestet ist) |
| R-L11 | **Missbrauch der anonymen Meldung** (Massenmeldungen, persönliche Angaben in der Antwort) | gering / mittel | §6, M-L16 | gering |
| R-L12 | **Missbrauch der Stimme** von Sprecherinnen und Sprechern (Klonen durch Dritte); Widerruf nach Veröffentlichung unter CC BY-SA 4.0 nicht vollständig durchsetzbar | mittel / gering | M-L17, M-L18; Vereinbarung mit Aufklärung; nur Erwachsene | mittel (Lizenz unwiderruflich; D-L11) |
| R-L13 | **Insider:** Lehrkraft sieht mehr als nötig (fremde Gruppe, ganzer Stand statt Zuweisungen) | mittel / gering | M-L05; Gruppenisolation; Zwei-Faktor für Lehrkräfte (T-04) | gering |
| R-L14 | **Unbefugter Zugriff** auf den Abgleich (Kontoübernahme, fremde Ereignisse) | mittel / gering | M-L09; R-14 der Grund-DSFA | gering |
| R-L15 | **Telemetrie** übermittelt IP-Adressen | gering / mittel | Schalter `lernapp_statistik` aus; Opt-in; Entscheidung der DSB (D-L08) | gering, solange aus |

## 8. Maßnahmen M-L01 bis M-L18 (geplant)

Status: **geplant** = in PLAN, KERN oder ADR festgelegt, Code ab L1; **Vorschlag** = dieser Entwurf. Testnamen nach `_lernapp/PLAN.md` §13.

| Nr. | Maßnahme | Umsetzung (geplant) | Beleg (Test) | Status |
| --- | --- | --- | --- | --- |
| M-L01 | Ohne Konto keine Server-Daten; kein POST ohne ausdrückliche Handlung | Lern-App-Seiten statisch ohne Cookies (ADR 0037 Nr. 4); lokale Datenhaltung `web/src/lib/lernapp/lokal/*` | E2E-Netzprotokoll ohne Konto (Z-L08) | geplant |
| M-L02 | Abgleich nur mit Sitzung, Einwilligung `lernapp`, Schalter, gleichem Ursprung, Zod-Prüfung; sonst 404 | `/api/lernapp/sync` (ADR 0038 Nr. 5) | Integration Sync (Einwilligung, Schalter 404, Isolation, Bremse) | geplant |
| M-L03 | Kinderkonten gleichen nur mit der Einwilligung `lernapp` der Eltern ab; ab 16 eigene Einwilligung binnen 30 Tagen | Prüfung in der Sync-Route; `src/lib/konto/sechzehn.ts` wie D-11 | Integration | geplant / Vorschlag (D-L09) |
| M-L04 | Schreibabgaben verschlüsselt; nur Lehrkraft der eigenen Gruppe; Löschung nach 12 Monaten | `lernapp_schreibabgabe` (`textVerschluesselt`, `loeschenAb`), `web/src/lib/krypto` | Integration „Schreibabgabe verschlüsselt“, E2E Schreibabgabe | geplant |
| M-L05 | Lehrkraft sieht nur die eigene Gruppe und nur Lernende mit Einwilligung | `web/src/lib/rechte/gruppen.ts` | Integration Zuweisung, E2E Lehrkraft → Schüler*in → Lehrkraft | geplant |
| M-L06 | Administration liest keine Schreibabgaben | Recht für Schreibabgaben in `NIE_PER_ADMINISTRATION` | Unit Rechte-Matrix | Vorschlag (D-L06) |
| M-L07 | Bestenliste nur nach §4 | `lernapp_rangliste`; Sperre `sechzehnAm`/`istKind` im Code | Integration „keine Bestenliste unter 16“, „nur mit Zustimmung“; E2E Kind ohne Bestenliste | geplant |
| M-L08 | Spielelemente ohne Druck: keine Herzen, Ligen, Zeitgrenzen; Pausetage; keine Schuldtexte | ADR 0043 | Unit `sanfte-texte`, Regeltest „keine hochzählenden Zahlen“ | geplant |
| M-L09 | Bremse 30 Anfragen je Minute und Konto; Uhrzeit-Klemme; höchstens 500 Ereignisse und 256 KB je Anfrage | Sync-Route | Integration Bremse | geplant |
| M-L10 | Erinnerungen standardmäßig aus; neutraler Text; Kinder nur mit `push_kind` | ADR 0043 Nr. 4, Push-Bestand | Integration Push | geplant (D-07 der Grund-DSFA beachten) |
| M-L11 | Aufnahme verlässt das Gerät nie; Modelle nur vom eigenen Ursprung | Worker `whisper.worker.ts`, `allowRemoteModels = false` | E2E `sprechen` mit Attrappen-Worker; Netzprotokoll nach dem Laden | geplant |
| M-L12 | Kopfzeilen nur unter `/lern-app` (CSP, COOP, COEP); Mikrofon nur auf Übungsrouten | `cspLernApp()` in `web/src/lib/sicherheit/header.ts` | Header-Test, E2E `crossOriginIsolated` | geplant |
| M-L13 | Geteilte Geräte: Abmelden fragt „Lernstand auf diesem Gerät löschen?“; „Lokale Daten löschen“ in den Einstellungen; Hinweis bei Familienprofilen | Lern-App-Einstellungen | E2E | Vorschlag (D-L12) |
| M-L14 | Statistik nur ab n ≥ 10; Gruppenziel ohne Namen, erst ab [3] Teilnehmenden mit Einwilligung | `lernapp_statistik_tag`; Gruppenansicht | Integration „Statistik ohne Bezug“ | geplant / Vorschlag |
| M-L15 | Löschlauf Lern-App: Lernstand 12 Monate nach letzter Aktivität, Schreibabgaben 12 Monate, Verdichtung alter Ereignisse, Kaskade mit dem Konto | `web/src/lib/loeschen/gemeinde.ts` | Integration Löschlauf | geplant |
| M-L16 | Meldung: nur Schlüssel und Kategorie; Antwort optional ab 16, kurz, gelöscht bei Erledigung | `/api/lernapp/meldung`, `lernapp_meldung` | Integration | geplant / Vorschlag (D-L07) |
| M-L17 | Sprecher-Vereinbarung Pflicht vor jeder Veröffentlichung einer Aufnahme; KI-Synthese nur mit Modul B | `lernapp_sprecher.vereinbarungMediumId` (Pflicht), `kiSyntheseErlaubt` | Unit `audio-stimmen` (jeder Clip mit zugelassener Stimme oder `mensch:<id>` mit Vereinbarung, Z-L20) | geplant |
| M-L18 | Synthetische Stimme: nur lokal trainiert, Modell nicht veröffentlicht, nur für Sprachkurse, nie für religiöse Inhalte, als synthetisch gekennzeichnet | Werkzeug `_lernapp/werkzeuge/tts/`, Quellenseite | Unit `audio-stimmen` | Vorschlag (D-L11) |

## 9. Bedingungen für das Einschalten

| Schalter | Bedingung |
| --- | --- |
| `lernapp_sync` | `konten` an; dieser Nachtrag von der DSB bestätigt; Einwilligungstext `lernapp` freigegeben und mit Version eingebaut; Abschnitt „Lern-App“ der Datenschutzerklärung veröffentlicht; Löschlauf der Lern-App gebaut und getestet (M-L15); M-L01 bis M-L03 und M-L09 belegt |
| `lernapp_gruppen` | wie `lernapp_sync`; `lernplattform` an; M-L04 bis M-L06 belegt; Lehrkräfte geschult (LM-14) |
| `lernapp_rangliste` | `lernapp_gruppen` an; Entscheidung LM-10; Zustimmungstext freigegeben; M-L07 belegt; Entscheidung D-L04 und D-L05 |
| `lernapp_statistik` | Entscheidung der DSB (D-L08); Text für das Opt-in |
| `push_lernapp` | wie `push`; Kind-Push nur mit `push_kind` erzwungen (D-07 der Grund-DSFA) |
| Veröffentlichung menschlicher Aufnahmen | unterschriebene Vereinbarung hinterlegt (M-L17); bei synthetischer Stimme Modul B und M-L18 |

## 10. Restrisiko und Bewertung

**Ergebnis dieses Entwurfs.** Ohne Konto entsteht bei der Gemeinde kein Personenbezug über den Abruf der Website hinaus; dort ist das Risiko **gering**. Mit Konto liegt das Restrisiko nach den geplanten Maßnahmen bei **gering bis mittel** (Schwerpunkte: Art. 9 über den Wissenskurs, Einwilligung für Kinder, Löschlauf noch nicht gebaut). Die Bestenliste bleibt mit den Grenzen aus §4 **gering bis mittel**. Für Sprecherinnen und Sprecher bleibt ein **mittleres** Restrisiko, weil eine Veröffentlichung unter CC BY-SA 4.0 nicht zurückgeholt werden kann; die Vereinbarung klärt darüber auf. Ein **hohes** Restrisiko, das eine vorherige Konsultation der Aufsichtsbehörde (Art. 36) auslösen würde, sieht der Entwurf nicht `[prüfen: DSB entscheidet]`.

**Überprüfung.** Mindestens jährlich und bei jeder wesentlichen Änderung (Art. 35 Abs. 11), insbesondere: Abschrift oder Aufnahme an die Lehrkraft, Laufzeit-KI, neue Vergleichsfunktionen, Telemetrie, Training einer Stimme bei einem Anbieter, Wechsel des Hosters.

## 11. Offene Entscheidungen

| Nr. | Frage | Vorschlag des Entwurfs | Wer entscheidet |
| --- | --- | --- | --- |
| D-L01 | Einordnung „ohne Konto“: Liegt eine Verarbeitung durch die Gemeinde vor, wenn alles auf dem Gerät bleibt? Reicht § 25 Abs. 2 Nr. 2 TDDDG für IndexedDB und Service Worker? | keine Verarbeitung durch die Gemeinde; Speicherung unbedingt erforderlich; Hinweis in der Datenschutzerklärung | DSB |
| D-L02 | Eine Einwilligung `lernapp` für Abgleich **und** Sichtbarkeit für die Lehrkraft, oder zwei Kästchen (Art. 6 Abs. 1 lit. a „für einen oder mehrere bestimmte Zwecke“)? | eine Einwilligung wie KERN 4.0 §5, Gruppen-Sichtbarkeit im Text ausdrücklich genannt; bei Zweifel zweites Kästchen „Lehrkraft meiner Gruppe darf meinen Stand sehen“ | DSB |
| D-L03 | Was sieht die Lehrkraft? | nur zugewiesene Einheiten (erledigt, Datum, Quote) und eingereichte Schreibabgaben; Wissenskurs und Koran-Arabisch nur, wenn sie zugewiesen sind | Bildung, DSB |
| D-L04 | Zählt die Bestenliste XP aus Wissenskurs und Koran-Arabisch? | nein, nur Sprachkurse (Art. 9) | Vorstand, DSB |
| D-L05 | Was ist eine „Familie“ für die Bestenliste (technisch)? | Eltern-Kind-Zuordnung aus dem Bestand; nur Personen ab 16 mit eigener Zustimmung | Bildung |
| D-L06 | Dürfen `administration` oder `bildung` Schreibabgaben lesen? | nein; Recht in `NIE_PER_ADMINISTRATION` | DSB, Technik |
| D-L07 | Eigene Antwort in Meldungen: Länge, Frist | höchstens [200] Zeichen; Löschung bei Erledigung, spätestens 12 Monate | DSB |
| D-L08 | Anonyme Telemetrie ohne Konto (`lernapp_statistik`) | nicht einschalten; Statistik nur aus Konten mit Einwilligung als Summen | DSB |
| D-L09 | Folge, wenn am 16. Geburtstag die eigene Einwilligung binnen 30 Tagen fehlt | Abgleich pausieren, lokaler Stand bleibt; Hinweis an die Person (wie D-11) | Vorstand, DSB |
| D-L10 | Prüfprotokolle (`lernapp_pruefung`, `freigabe`): Frist und Personenbezug nach Löschung des Kontos einer prüfenden Person | aufbewahren, solange der geprüfte Stand ausgeliefert wird, danach 3 Jahre; Kennung beim Löschen des Kontos pseudonymisieren, damit „zwei verschiedene Personen“ prüfbar bleibt | DSB, Imam/Vorstand |
| D-L11 | Sprecher: CC BY-SA 4.0 und Widerruf; Persönlichkeitsrecht an der Stimme bei Weiternutzung durch Dritte (Abschnitt 2(b)(1) der Lizenz); Kennzeichnung synthetischer Audioinhalte nach Art. 50 KI-Verordnung (EU) 2024/1689; Veröffentlichung eines Stimmmodells | CC BY-SA 4.0 mit ausdrücklicher Aufklärung; Stimmmodell nie veröffentlichen; synthetische Clips als „synthetische Stimme“ kennzeichnen `[prüfen: Rechtsberatung]` | Recht, DSB (LM-22, LM-26) |
| D-L12 | Geteilte Geräte und Aufnahmen: (a) Aufnahme nur im Arbeitsspeicher? (b) Abmelden mit Frage nach lokalem Löschen? | (a) ja; (b) ja | Technik, DSB |
| D-L13 | Uhrzeiten: Sehen Eltern und Lehrkräfte Zeitpunkte oder nur Lerntage? | nur Lerntage; die Uhrzeit braucht nur die Wiederholungsplanung | Bildung, DSB |
| D-L14 | Art. 9 Abs. 2 lit. d (religiöse Organisation) ergänzend zur Einwilligung? | nur ergänzend; Grundlage bleibt die ausdrückliche Einwilligung | Recht |
| D-L15 | Sprachen der Einwilligung: Lern-App de/tr/ar, „Mein Bereich“ de/tr/en | Text in de, tr, ar und en; Version je angezeigter Sprache (wie D-15) | DSB, Bildung |
| D-L16 | Kommentar der Lehrkraft zu einer Schreibabgabe eines Kindes (unter 16): Freitext einer erwachsenen Person an ein einzelnes Kind, jederzeit änderbar, ohne zweiten Erwachsenen (die Aufsicht sieht Schreibabgaben bewusst nicht) und ohne Meldeweg. ADR 0042 Nr. 11 lässt den Kommentar zu; zu KERN 4.0 §5 („keine Freitext-Kommunikation zwischen Personen“) besteht eine Spannung (Gegenprüfung L5-03, S-L2 M-1). **Bis zur Entscheidung technisch gesperrt** (S-L2-Auflagen, ADR 0042 Nr. 18, 20 und 21): Abgaben in der Einwilligungslage „eltern“ bekommen nur Prüfliste und Einstufung; Dienst und Action lehnen einen Kommentar ab, das Formular blendet das Feld aus; ein vorher gespeicherter Kommentar erreicht das Kind nicht mehr (die Auskunft nach Art. 15/20 bleibt vollständig, sie ist kein Kanal der Lehrkraft zum Kind). Startklar meldet Rot in der Betriebsart Produktion (Warnung in Vorschau/Entwicklung), solange `lernapp_gruppen` an ist und die Entscheidung nicht in `web/src/lib/lernapp/schreiben/kinderschutz.ts` (`ENTSCHEIDUNG_D_L16`) eingetragen ist. Auch `kommentarAnKinder: true` öffnet den Kommentar erst, wenn alle Schutzmaßnahmen aus (b) umgesetzt und in `UMGESETZTE_SCHUTZMASSNAHMEN` eingetragen sind; bis dahin warnt Startklar mit der Liste der fehlenden. | (a) bei Kindern dauerhaft kein Kommentar (Sperre bleibt, Eintrag mit `kommentarAnKinder: false`) oder (b) Kommentar zulassen nur zusammen mit Schutzmaßnahmen: Kommentar und Prüfliste auch den sorgeberechtigten Eltern zeigen **oder** Knopf „Kommentar melden“ an Lehrkräfte und Kinderschutz (wie S-07/S-08), Fassungen anhängen statt ersetzen, Bremse für Rückgaben, Zeitfenster wie S-06 erwägen `[Entscheidung Kinderschutz]` | Kinderschutz, DSB, Bildung (LM-08) |
| D-L17 | Wechsel der Lehrkraft bei laufender Mitgliedschaft: Sieht die neue Lehrkraft frühere Abgaben samt Rückmeldung der vorigen? | ja, Abgaben sind an die Gruppe gebunden (wie das Gruppenbuch; eine zweite erwachsene Person sieht so auch frühere Rückmeldungen); nach dem Austritt nie mehr (umgesetzt S-L2-Auflagen) | Bildung, DSB |

## 12. Konsultation, Freigabe, Überprüfung

- **Stellungnahme der DSB (Art. 35 Abs. 2):** [Datum, Name, Ergebnis – DSB].
- **Standpunkt der Betroffenen (Art. 35 Abs. 9):** Eltern, Lehrkräfte und Jugendliche ab 16 werden zur Bestenliste und zur Sichtbarkeit für Lehrkräfte angehört [Termin, Form – Bildung].
- **Entscheidung des Verantwortlichen:** [Datum, Name – Vorstand]: Maßnahmen und Restrisiko akzeptiert / nicht akzeptiert.
- **Vorherige Konsultation (Art. 36):** [nicht erforderlich / erforderlich – DSB].
- **Nächste Überprüfung:** [Datum, spätestens ein Jahr nach Freigabe; außerdem nach Etappe L7 (Gruppen, Bestenliste) mit Code-Belegen].

| Version | Datum | Änderung |
| --- | --- | --- |
| 0.1 | 20.10.2026 | Entwurf aus Plan, KERN 4.0 und ADR 0037 bis 0045 (Etappe L0); Code der Lern-App noch nicht gebaut; keine Bewertung durch die DSB |

## 13. Belege

- Regeln und Pläne: `_lernapp/AUFTRAG.md` §2 (L3-E02, L3-E05, L3-E06), §4; `_lernapp/KERN.md` §1, §4, §5, §6; `_lernapp/PLAN.md` §3.7 bis §3.9, §11, §13; `_lernapp/MENSCHEN.md` LM-07, LM-08, LM-10, LM-22, LM-26.
- ADR: `web/docs/adr/0035`, `0037` (Fortschreibung S1), `0038` (Nr. 1, 5, 8, 10), `0039` (Nr. 8, 9), `0041` (Nr. 9), `0042` (Nr. 7, 9, Fortschreibung S2), `0043` (Nr. 4, 8), `0045` (Nr. 11).
- Belege der Spikes: `_lernapp/belege/S2-whisper-im-browser.md` (§3.9 Netzprotokoll, §3.10 CSP), `_lernapp/belege/S1-S6-wurzel-layout-und-sw.md` (IndexedDB je Ursprung).
- Grund-DSFA und Bestand: `dsfa-lernplattform.md` (R-07, R-08, R-14, D-07, D-11, D-12, D-15), `einwilligungen.md`, `loeschkonzept.md`, `verarbeitungsverzeichnis-ergaenzung.md` (T-01 bis T-15).
- Geplanter Code (Etappe L1): Schema `web/src/lib/db/schema/{lernapp,lernapp-nutzung}.ts`, Migrationen 0017 bis 0019, Löschlauf `web/src/lib/loeschen/gemeinde.ts`, Routen `web/src/app/api/lernapp/*`.
