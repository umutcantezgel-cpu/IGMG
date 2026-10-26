# GO-LIVE – Lern-App: Schalter je Funktion

**Stand:** 21.10.2026 (Pakete L8-03 und L8-04), Nachtrag 26.10.2026 (Nacharbeit N5 nach Stufe C: L3-E12b, AUSNAHME N-4). Die
Lern-App ist in der Produktion **an** – ohne Personendaten, der Fortschritt bleibt auf dem Gerät (Entscheidung des Nutzers vom
21.10.2026, `ENTSCHEIDUNGEN.md` L3-E12b, Fortschreibung von L3-E12a; Code `IN_PRODUKTION_AN`). Alle
Schalter mit Personendaten sind in der Produktion **aus**, bis Menschen sie freigeben (KERN 4.0 §6). Die Auflagen der
Sicherheitsprüfung S-L3 (`berichte/s-l3.md`, 21.10.2026: 0 kritisch, 0 hoch, 1 × mittel latent, 4 × niedrig) stehen je Schalter
in der Spalte „Voraussetzung“ und gesammelt im Abschnitt „Auflagen der Sicherheitsprüfung S-L3“.

Quellen dieser Liste (bei Widerspruch gilt der Code):

- `web/src/lib/funktionen-regeln.ts`: `IN_PRODUKTION_AN`, `MIT_PERSONENDATEN`, `VORAUSSETZUNGEN` (Sperren)
- `web/src/lib/startklar/gemeinde.ts` und `web/src/lib/startklar/lernapp.ts`: Vorbehalt je Schalter, Karte „Lern-App“ im
  Startklar-Cockpit
- `KERN.md` §6, `MENSCHEN.md` (LM-01…LM-36), ADR 0035 (Schalter), ADR 0041 (Stichprobe), ADR 0042 (Sprechen)
- `berichte/s-l3.md` (Auflagen M-1, N-1…N-4, Hinweise H-1…H-8)
- Gesamtliste der Website: `web/docs/GO-LIVE.md` (Abschnitt G); dort G1 für Datenbank und Geheimnisse (auch
  `ALTCHA_GEHEIMNIS`), G4 für `KONTEN`, `LERNPLATTFORM`, `PUSH`
- Handbücher: `web/docs/handbuch/lernapp-lernende.md`, `lernapp-lehrkraefte.md`, `lernapp-sprachpruefung.md`,
  `lernapp-imam-hoca.md`

## So wird geschaltet

1. **Umgebung (Vorrang):** Vercel › Projekt › Settings › Environment Variables (Production): `FUNKTION_<NAME>=an` bzw. `=aus`,
   danach neu bereitstellen. `<NAME>` ist der Schalter in Großbuchstaben, z. B. `FUNKTION_LERNAPP_SYNC`.
2. **Einstellung:** sonst gilt der Wert aus der Verwaltung (Einstellung `funktionen`, Startklar-Cockpit
   `/verwaltung/startklar`, Recht `einstellung.bearbeiten`).
3. **Standard:** sonst Entwicklung und Vorschau **an**, Produktion **aus** – außer den Schaltern in `IN_PRODUKTION_AN`.

- **Ausgeschaltet heißt:** Seiten und Routen antworten mit 404, Links und Knöpfe verschwinden (ADR 0035). AUSNAHME S-L3 N-4
  (Abschnitt „Ausnahme N-4“): statische Dateien unter `/lern-app/` (Modelle, Symbole) bleiben abrufbar; unter `/lern-app/sw.js`
  liefert der Proxy bei `FUNKTION_LERNAPP=aus` den Abmelde-Worker.
- **Sperre:** Ein Schalter wirkt nur, wenn alle seine Voraussetzungen wirken. Das Cockpit meldet Schalter, die an sind, aber
  gesperrt bleiben.
- **Auflagen S-L3:** Eine Auflage mit der Frist „vor dem Einschalten“ ist im Code noch **nicht** als Sperre hinterlegt. Wer
  schaltet, prüft sie in dieser Liste; erst mit der Behebung (Commit, Test) ist der Schalter frei.
- **Prüfpunkt nach jedem Schritt:** Das Startklar-Cockpit führt den Schalter ohne offenen Vorbehalt, und `pnpm startklar` ist
  grün.

## Schalter

| Schalter | Personendaten | Stand Produktion | Wirkt nur mit | Voraussetzung vor dem Einschalten | Wer gibt frei |
|---|---|---|---|---|---|
| `lernapp` | nein (Fortschritt nur auf dem Gerät) | **an** (L3-E12b) | – | erledigt: Nutzerentscheidung 21.10.2026; zum Abschalten `FUNKTION_LERNAPP=aus` (dann Abmelde-Worker unter `/lern-app/sw.js`). **S-L3 N-4** als AUSNAHME mit Grund und Ersatz (26.10.2026, Abschnitt „Ausnahme N-4“): Modelle und Symbole unter `/lern-app/` bleiben bei „aus“ abrufbar und sind ungebremst | Nutzer bzw. Vorstand |
| `lernapp_ungeprueft` | nein | **an** (O-1, ADR 0041 Nr. 8) | `lernapp` | Einheiten nach automatischer Prüfung und KI-Gegenprüfung zeigen den Hinweis „noch nicht von Muttersprachlern geprüft“; abgelehnte Einträge und Einträge mit `religionsbezug` ohne zwei Freigaben bleiben unsichtbar. S-L3: keine Auflage | Vorstand (LM-11; Standard ja) |
| `lernapp_meldungen` | nein (anonym, nur Aufgabenschlüssel und Kategorie, ALTCHA) | **an**, wirkt aber erst nach G1 | `lernapp`; Datenbank und `ALTCHA_GEHEIMNIS` (`web/docs/GO-LIVE.md` G1) | **offen: G1.** Ohne Datenbank antwortet die Melde-Route mit 404, ohne `ALTCHA_GEHEIMNIS` mit 503 (`api/lernapp/meldung/route.ts`); die Produktion läuft noch ohne Datenbank (Beispielmodus). Danach Bearbeitung der Meldungen unter Verwaltung › Lern-App › Meldungen (braucht G2). S-L3: keine Auflage (Hinweis H-1: Körper als Strom mit Grenze lesen, Löschfrist offener Meldungen) | Technik (G1), dann Redaktion |
| `lernapp_sprechen` | nein (Aufnahme bleibt im Arbeitsspeicher des Geräts) | aus | `lernapp` | Gerätetest Sprechen und Audioformat auf iPhone, Android-Mittelklasse und Laptop (LM-07, MN-19); Whisper-Modell und Ort bestätigt (LM-27). **S-L3 N-4** mitdenken: Mit dem Schalter laden mehr Geräte die Modelle (≈ 95 MB); Ratenregel oder Modell-Route vorher, Kosten beobachten (LM-15) | Technik nach Gerätetest |
| `lernapp_sync` | **ja** (Ereignisprotokoll auf dem Server, Art. 9 DSGVO) | aus | `lernapp`, `konten` | DSFA-Nachtrag Lern-App, Einwilligungstext `lernapp`, Datenschutzerklärung und Löschfristen (LM-08; Entwürfe in `web/docs/recht/entwuerfe/`); `konten` nach `web/docs/GO-LIVE.md` G4. **S-L3 N-2 vor dem Einschalten beheben:** Einwilligung `lernapp` erteilen und widerrufen (eigene Person ab 16, Eltern für Kinder); der Widerruf löscht den Lernstand auf dem Server; Export nach Art. 15/20 mit den Lern-App-Daten | DSB / Recht, dann Vorstand |
| `lernapp_gruppen` | **ja** (Zuweisungen, Stand der Gruppe; Schreibabgaben noch nicht aktiv) | aus | `lernapp`, `lernplattform` | DSFA-Nachtrag (LM-08); `lernplattform` nach G4; Lehrkräfte geschult (LM-14, Handbuch `web/docs/handbuch/lernapp-lehrkraefte.md`). **S-L3 M-1 vor dem Einschalten beheben:** Lerntage und XP je Kurs trennen; Stand der Lehrkraft nur aus den Kursen der eigenen Zuweisungen, Gruppenziel nur aus Sprachkursen. **N-2** wie bei `lernapp_sync` (Stand und „erledigt“ kommen nur über den Abgleich). **N-3** bis zur Abnahme: XP je Lerntag kappen. Hinweise H-2 (Last, L8-02) und H-5 (Gruppenziel nur bis gestern) | DSB / Recht, Vorstand, Bildung |
| `lernapp_rangliste` | **ja** (Anzeigename und XP aus Sprachkursen, nur ab 16, mit eigener Zustimmung) | aus | `lernapp`, `lernapp_gruppen` | Entscheidung zur Bestenliste (LM-10) und DSFA-Nachtrag zu R-08 (LM-08). Für Konten unter 16 ist die Bestenliste im Code gesperrt, nicht über den Schalter. **S-L3 M-1 und N-3 vor dem Einschalten beheben:** Bestenliste nur aus XP der Sprachkurse, gekappt je Lerntag. Hinweis H-6: Version des Zustimmungstexts nach LM-08/LM-10 heben und Zustimmungen neu einholen | Vorstand, DSB |
| `lernapp_statistik` | grenzwertig (IP-Adresse) | aus | `lernapp` | Entscheidung der Datenschutzbeauftragten; nur Summen mit n ≥ 10, nur mit Opt-in (KERN 4.0 §6). S-L3: keine Auflage (Route noch nicht gebaut) | DSB |
| `push_lernapp` | **ja** (Push-Abonnement) | aus | `lernapp`, `push` | wie Web Push: Push-Themen und Drittland-Hinweis (MN-11, MN-17); neutraler Text ohne Serienbezug; für Kinder nur mit Einwilligung `push_kind` der Eltern. S-L3: keine Auflage (Erinnerung noch nicht gebaut) | Vorstand, DSB |

## Weitere Freigaben ohne eigenen Schalter

Diese Punkte entscheiden, **was** in der eingeschalteten Lern-App sichtbar ist. Ohne sie ist nichts Ungeprüftes sichtbar; sie
sind keine Hindernisse für den Schalter `lernapp`.

| Punkt | Stand | Voraussetzung | Wer gibt frei |
|---|---|---|---|
| Wissenskurs (Lektionen) | unsichtbar, bis alle Bausteine einer Lektion zwei Freigaben zum aktuellen Hash haben | zwei Konten mit `religioese_pruefung` (MN-24), Prüfung zuerst Taharah und Salah (LM-03); Handbuch `web/docs/handbuch/lernapp-imam-hoca.md`. **S-L3 M-1 spätestens, bevor die erste Lektion ausgeliefert wird** (L6), auch wenn `lernapp_gruppen` aus ist | Imam und Hoca (je zwei verschiedene Personen, nie die verfassende) |
| Sprachkurs-Einträge mit `religionsbezug`, Liste erlaubter Alltagsformeln | gesperrt | zwei religiöse Freigaben (KERN 4.0 §2.3, LM-09) | Imam und Hoca |
| Koran-Arabisch: Bedeutungen und Wurzeln | nur Wortformen ohne Bedeutung | Bedeutungen von Menschen verfasst (MN-05, LM-13), Wurzeltabelle geprüft (LM-31); je zwei Freigaben. **S-L3 M-1 spätestens, bevor Lektionen des Pfads ausgeliefert werden** | Hoca verfasst, zwei andere Personen mit `religioese_pruefung` geben frei |
| Muttersprachliche Stichprobe je Einheit | Hinweis „noch nicht geprüft“ (`lernapp_ungeprueft`) | Konten mit Rolle `sprachpruefung`, je Sprache ≥ 2 Personen (LM-01); Prüfsprachen unter Verwaltung › Lern-App › Prüfende; Handbuch `web/docs/handbuch/lernapp-sprachpruefung.md` (dort auch S-L3 H-8: Prüfsprachen der Administration) | Muttersprachliche Prüfende |
| Audio Deutsch | Sprachausgabe Thorsten freigegeben; Hörabnahme offen (LM-06) | Blob-Speicher `lernapp` verbunden, `LERNAPP_BLOB_BASIS` gesetzt (LM-15); Bündel hochgeladen | Technik; Hörabnahme Nutzer bzw. Vorstand |
| Audio Türkisch und Arabisch | „Audio folgt“ (Hörübungen werden übersprungen) | eigene Aufnahmen oder eigene Stimme mit bestandener Prüfkette (LM-24…LM-26). **S-L3 N-1 vor der ersten echten Sprecher-Vereinbarung** (X-02, X-03) bzw. bis zur Abnahme: Vereinbarungen privat ablegen, nicht in der Mediathek; Hinweis H-4: Sprecherin samt Aufnahmen entfernen können | Vorstand, Technik, Muttersprachler |
| Bildkarten | Motive ohne Freigabe blockieren den Import | Motivliste freigeben (LM-34) | Redaktion |
| Lizenz der Lerninhalte | CC BY-SA 4.0, Namensnennung auf `/quellen` und `/lern-app/[ui]/quellen` (L8-03); je Satz und Eintrag dort für jede Einheit auf dem Gerät, offline aus dem Paket | Bestätigung (LM-12) | Vorstand / Recht |

## Auflagen der Sicherheitsprüfung S-L3

Bericht: `berichte/s-l3.md` (Stand `7c7058d`, Code gleich `3f8c9cf`). „Freigabe mit Auflagen“: Das Kriterium „S-L3 ohne
hoch/kritisch“ ist erfüllt; die Auflagen binden die Schalter wie folgt. Stand aller Auflagen am 21.10.2026: **offen**.

| Nr. | Schwere | Betrifft | Frist | Behebung (Kurzfassung, Einzelheiten im Bericht) |
|---|---|---|---|---|
| M-1 | mittel (latent) | `lernapp_gruppen`, `lernapp_rangliste`; Wissenskurs und Koran-Arabisch | vor dem Einschalten von `lernapp_gruppen` oder `lernapp_rangliste` **und** spätestens, bevor Lektionen von Wissenskurs oder Koran-Arabisch ausgeliefert werden (L6) | `lernapp_tag` je Kurs; Bestenliste und Gruppenziel nur Sprachkurse (D-L04), Stand der Lehrkraft nur Kurse der eigenen Zuweisungen (D-L03), Lernwoche der Eltern darf alle Kurse zeigen. Bis dahin harte Sperre im Startklar-Cockpit (Rot, wenn `lernapp_gruppen` oder `lernapp_rangliste` an ist und `islam`/`koran` sichtbare Lektionen haben) und Integrationstest „Wissens-XP erscheint weder in der Bestenliste noch im Stand der Lehrkraft“ |
| N-1 | niedrig | Audio-Studio (Sprecher-Vereinbarung), ebenso Rezitations-Werkstatt der Website | bis zur Abnahme (L8-05) oder AUSNAHME mit Grund; praktisch vor der ersten echten Vereinbarung | Vereinbarungen privat unter `lernapp/vereinbarungen/…` ohne Zeile in `medium`, Abruf nur mit `lernapp.audio.bearbeiten`, `private, no-store`, `Content-Disposition: attachment`; vorhandene Vereinbarungs-Medien umziehen |
| N-2 | niedrig (latent) | `lernapp_sync` (und damit `lernapp_gruppen`, `lernapp_rangliste`) | vor dem Einschalten von `lernapp_sync` (setzt LM-08 voraus) | Erteilen und Widerrufen der Einwilligung `lernapp` mit Textversion in „Mein Bereich“ und in den Einstellungen der Lern-App; Widerruf löscht in einer Transaktion Profil, Zustimmung und Familie (Audit); Export um die Lern-App-Tabellen; Integrationstest „Widerruf → 0 Zeilen, nächster Abgleich 403“ |
| N-3 | niedrig | `lernapp_gruppen` (Gruppenziel), `lernapp_rangliste` | bis zur Abnahme (L8-05) oder AUSNAHME; für `lernapp_rangliste` vor dem Einschalten | XP je Lerntag für Gruppe und Bestenliste kappen (z. B. ≤ 500 XP, ≤ 30 Lektionen), XP nur mit passendem Lektionsereignis zählen; Unit-Test der Kappung |
| N-4 | niedrig | `lernapp` (an), `lernapp_sprechen` | bis zur Abnahme (L8-05) oder AUSNAHME mit Grund – **AUSNAHME seit 26.10.2026** (Abschnitt „Ausnahme N-4“); für `lernapp_sprechen` Ratenregel vor dem Einschalten | Modelle über eine Route mit Schalterprüfung **oder** Ratenregel der Vercel-Firewall für `/lern-app/modelle/*` (Ausnahme in ADR 0035/0042 festhalten); beim Abschalten einen Abmelde-Worker als `sw.js` ausliefern – **Abmelde-Worker umgesetzt** (N5) |

### Ausnahme N-4 (26.10.2026)

- **Befund:** Statische Dateien unter `/lern-app/` liefert Next vor jeder Route aus (`public/lern-app/`: Modelle ≈ 95 MB,
  Symbole, `sw.js`). Bei `lernapp` aus bleiben sie mit 200 abrufbar; „ausgeschaltet heißt 404“ gilt dort nicht.
- **Grund der Ausnahme:** `lernapp` ist nach der Nutzerentscheidung vom 21.10.2026 in der Produktion **an** (L3-E12b); die
  Dateien sind ohnehin öffentlich gedacht und enthalten keine Personendaten und keine Inhalte außer Modellgewichten (Lizenz
  ADR 0042), Programmcode und App-Symbolen. Die Modelle lädt nur die Sprechübung, und `lernapp_sprechen` ist in der Produktion
  aus (LM-07).
- **Ersatz:**
  1. *Abmelde-Worker (umgesetzt, N5):* Bei `FUNKTION_LERNAPP=aus` in der Umgebung liefert der Proxy unter `/lern-app/sw.js`
     die Datei `public/lern-app/sw-abmelden.js` (`web/src/proxy.ts`, Matcher mit Ausnahme für genau diese Datei). Geräte holen
     sie bei der nächsten Update-Prüfung: Sie löscht die Vorräte `igmg-lernapp-*` außer den Modellen, meldet sich ab und lädt
     offene Seiten der Lern-App neu; der Lernstand in IndexedDB bleibt. Tests: `tests/unit/lernapp/lernapp-sw-abmelden.test.ts`,
     `tests/unit/lernapp/proxy.test.ts`. Abschalten nur über die Einstellung im Cockpit (ohne Umgebung) ersetzt den Worker
     **nicht** – zum vollständigen Abschalten immer die Umgebung setzen (das Cockpit sagt es im Hinweis zum Schalter).
  2. *Kosten beobachten (LM-15):* Datentransfer des Vercel-Projekts für `/lern-app/modelle/*` nach der Tarifentscheidung
     (LM-15) monatlich ansehen (Vercel › Usage › Data Transfer bzw. Observability); bei auffälligen Abrufen eine Ratenregel der
     Vercel-Firewall für `/lern-app/modelle/*` (z. B. 20 Anfragen je 10 min und IP) setzen.
- **Bleibt offen:** Ratenregel oder Modell-Route mit Schalterprüfung **vor** dem Einschalten von `lernapp_sprechen` (dann
  laden viele Geräte die Modelle); Symbole und Modelle antworten bei „aus“ weiter mit 200.

Hinweise ohne Frist (bei Gelegenheit): H-1 Meldungen (Strom mit Grenze, Löschfrist), H-2 Last der Gruppenroute (Lasttest
L8-02), H-3 Obergrenze der Vorräte auf dem Gerät, H-4 Sprecherin samt Aufnahmen entfernen, H-5 Gruppenziel nur bis gestern,
H-6 Version des Zustimmungstexts, H-7 „Profil von diesem Gerät löschen“ in den Einstellungen, H-8 Prüfsprachen der
Administration im Handbuch Sprachprüfung (erledigt in L8-04) und im Audit-Bericht des Cockpits.

## Reihenfolge beim Freischalten (Vorschlag)

1. `lernapp`, `lernapp_ungeprueft`, `lernapp_meldungen` – an (seit 21.10.2026, L3-E12b). N-4 als AUSNAHME (26.10.2026). Ohne Datenbank
   (Beispielmodus) zeigt die Lern-App nur die Inhalte, die beim Bau eingespielt wurden; „Fehler melden“ wirkt erst nach G1.
2. G1 der Website (`web/docs/GO-LIVE.md`: Datenbank, Geheimnisse samt `ALTCHA_GEHEIMNIS`) und G2 (Verwaltungskonten) –
   danach kommen Meldungen an, und Sprachprüfung, religiöse Prüfung und Audio-Studio sind bedienbar.
3. `lernapp_sprechen` – nach dem Gerätetest (LM-07) und N-4.
4. `KONTEN` und `LERNPLATTFORM` der Website (G4), dann `lernapp_sync` nach LM-08 und N-2, danach `lernapp_gruppen` nach
   M-1 (und N-3).
5. `lernapp_rangliste` – nur nach LM-10, M-1 und N-3.
6. `push_lernapp` – nach `PUSH` (G4).
7. `lernapp_statistik` – nur nach Entscheidung der DSB.

**Abschalten** geht jederzeit: `FUNKTION_<NAME>=aus` setzen und neu bereitstellen. Was dann schon auf dem Server liegt,
regelt das Löschkonzept (`web/docs/recht/entwuerfe/loeschkonzept.md` §3.7, Entwurf bis LM-08). Der Fortschritt auf den Geräten
bleibt in jedem Fall erhalten.
