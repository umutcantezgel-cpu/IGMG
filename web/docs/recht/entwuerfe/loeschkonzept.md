# Löschkonzept der Gemeinde-Plattform

> **ENTWURF – vor Veröffentlichung durch Datenschutz/Recht prüfen (MENSCHEN MN-11).** Dieses Konzept beschreibt, welche Daten wann und wie gelöscht werden. Es unterscheidet **beschlossene** Fristen (im Code umgesetzt), **Vorschläge** (nicht beschlossen, mit „Vorschlag“ markiert) und **Lücken** (Frist oder Routine fehlt). Dies ist keine Rechtsberatung. Alles in eckigen Klammern `[ ]` ist offen; `[prüfen]` ist rechtlich oder technisch zu klären.

Stand: 13.10.2026 · Stand des Codes: Branch `claude/trusting-lovelace-6nfolz`, Commit `bb8433d` · Bezug: Art. 5 Abs. 1 lit. e, Art. 17, Art. 25, Art. 32 DSGVO; `verarbeitungsverzeichnis-ergaenzung.md` (GP-01 bis GP-17), `dsfa-lernplattform.md` (D-01 bis D-17).

## 1. Grundsätze

1. **Speicherbegrenzung.** Personenbezogene Daten werden nur so lange gespeichert, wie der Zweck es verlangt. Die Fristen unten sind **Höchstfristen**; früher löschen ist immer erlaubt.
2. **Löschen heißt unwiderruflich.** Datensätze werden aus der Datenbank entfernt, nicht nur ausgeblendet. Ausnahme: Chat-Nachrichten, die **entfernt** wurden (Platzhalter), bleiben verschlüsselt bis zum Löschlauf (Lücke D-03).
3. **Aufbewahrungspflichten gehen vor** (Art. 17 Abs. 3 lit. b). Die Gemeinde kennt für die Lernplattform keine gesetzliche Aufbewahrungspflicht `[prüfen: steuerrechtliche Pflichten gelten für Spendenbelege, nicht für diese Daten; Rechtsberatung bestätigt]`. Besteht eine Pflicht, wird gesperrt (Zugriff nur für diesen Zweck) statt gelöscht.
4. **Kaskade.** Das Datenmodell löscht abhängige Zeilen mit (`onDelete: cascade`). Das gilt zum Beispiel für Anwesenheit, Fortschritt, Hifz, Fehlmeldung, Eltern-Kind-Zuordnung, Gruppenmitgliedschaft und Einwilligungen der Lernenden, sobald der Datensatz der Lernenden gelöscht wird. Ausnahme seit 13.10.: Der Einwilligungsnachweis bleibt ohne Namen bis zum Ablauf seiner Frist erhalten (L-15, D-14).
5. **Löschnachweis ohne Personendaten.** Das Audit-Protokoll hält Art und Kennung der Löschung fest, nie Namen oder Inhalte (z. B. `eingang.frist_geloescht`).
6. **Fristen beschließt der Vorstand** nach Rat der Datenschutzbeauftragten ([Datenschutzbeauftragte/r – Angaben von der Gemeinde]); jede Änderung wird in diesem Konzept und in der Datenschutzerklärung nachgeführt.

## 2. Technische Umsetzung

| Baustein | Was er tut | Wann | Beleg |
| --- | --- | --- | --- |
| **Wartungsroute `loeschfristen`** (`/api/wartung/loeschfristen`) | löscht abgelaufene Eingänge, versendete Mails, Papierkorb, Melderdaten, Einladungen, Verifikationen, ALTCHA-Lösungen, Ratenfenster, nicht übernommene Direkt-Uploads **und** ruft den Chat-Löschlauf auf. Idempotent; eine Datenbanksperre verhindert parallele Läufe | täglich 01:00 UTC per Vercel-Cron (`GET`, `CRON_SECRET`); zusätzlich täglich 03:17 (Container-Uhr) vom lokalen Takt (`POST`, `WARTUNG_TOKEN`) | `web/src/app/api/wartung/loeschfristen/route.ts`, `web/src/lib/eingaenge/loeschlauf.ts`, `vercel.json`, `betrieb/lokal/takt/takt.sh` |
| **Chat-Löschlauf** (`chatLoeschlauf`) | löscht Nachrichten nach 90 Tagen bzw. 30 Tage nach Gruppenende und **erledigte** Meldungen nach Ablauf von `loeschen_ab`; vermerkt den Lauf im Moderationsprotokoll (Anzahl, keine Inhalte) | im Löschlauf | `web/src/lib/chat/dienst.ts`, Test `web/tests/integration/chat.test.ts` („Löschfristen (S-12)“) |
| **Takt `/api/wartung/takt`** | räumt Push-Abos auf (12 Monate ohne Erfolg) und Einmal-Schlüssel (3 Tage) | jede Minute durch den lokalen Server | `web/src/lib/push/abo.ts` (`fuehreTaktAus`) |
| **Aufrufwege** | `GET` nur mit `CRON_SECRET`, `POST` nur mit `WARTUNG_TOKEN` (je mindestens 32 Zeichen, Vergleich in konstanter Zeit); ohne Token gesperrt | – | `web/src/lib/wartung/zugang.ts` |
| **Löschung auf Antrag** (Konto, Eltern) | Konto: Feld `konto_profil.loeschen_ab`; Lernende: `lernende.loeschen_ab` | **Lücke:** Löschroutine für beide Felder fehlt in diesem Stand | siehe L-10, L-16 |

**Hinweise zum Betrieb.**

- Fällt der lokale Takt aus, laufen die täglichen Löschungen weiter (Vercel-Cron); Push-Abos und Einmal-Schlüssel werden dann **nicht** aufgeräumt, bis der Takt zurückkehrt.
- Das Startklar-Cockpit sollte melden, wenn der Löschlauf länger als 2 Tage nicht gelaufen ist `[prüfen: Prüfung vorhanden?]`.
- Der Vercel-Cron setzt voraus, dass `CRON_SECRET` gesetzt ist (`web/docs/deploy/VERCEL-ENV.md`).

## 3. Fristen je Datenart

Spalte „Stand“: **umgesetzt** = im Code; **Vorschlag** = nicht beschlossen, nicht umgesetzt; **Lücke** = Frist oder Routine fehlt. Spalte „Frist“ bei Vorschlägen: `[Frist – Vorstand/DSB entscheiden: Vorschlag …]`.

### 3.1 Bestand (Vorlauf), zur Vollständigkeit

| Nr. | Datenart | Frist | Auslöser | Technische Umsetzung | Stand |
| --- | --- | --- | --- | --- | --- |
| L-01 | Eingänge: Voranmeldung, Mitgliedsantrag, Kontakt, Moschee-Anfrage | 180 Tage nach Abschluss (Erledigt/Abgelehnt); Veranstaltungsanmeldung 30 Tage nach dem Termin; nicht abgeschlossene spätestens 365 Tage nach Eingang | Abschluss bzw. Termin; Höchstfrist ab Eingang | Spalte `eingang.loeschen_ab`, Löschlauf; Fristen je Art einstellbar (Einstellung `loeschfristen`), Standard in `web/src/lib/eingaenge/fristen.ts`; Kaskade löscht Einwilligungen und Notizen | umgesetzt |
| L-02 | Mail-Ausgang | versendete Mails 30 Tage nach Versand; **nicht zustellbare** (ohne `gesendet_am`) [Frist – Vorschlag 90 Tage nach Eingang] | Versand | Löschlauf (`MAIL_AUFBEWAHRUNG_TAGE`); für nicht versendete Mails keine Routine | umgesetzt (versendet) / Lücke (nicht versendet) |
| L-03 | Meldungen über das Meldeformular (Tickets): Angaben der meldenden Person | 180 Tage nach „Gelöst“ oder „Geschlossen“; das Ticket bleibt | Abschluss | Löschlauf (`MELDER_FRIST_TAGE`) | umgesetzt |
| L-04 | Papierkorb: Veranstaltungen, Nachrichten, Ankündigungen, Kurse; Medien im Papierkorb | 30 Tage; Medien nur, wenn nirgends mehr verwendet | Verschieben in den Papierkorb | Löschlauf (`PAPIERKORB_TAGE`) | umgesetzt |
| L-05 | ALTCHA-Lösungen, Ratenfenster (Prüfwerte, nie IP im Klartext) | bis Ablauf bzw. 1 Tag nach Fensterbeginn | Ablauf | Löschlauf (`raeumeAltchaAuf`, `raeumeRatenAuf`) | umgesetzt |
| L-06 | Einladungen (Name, E-Mail); Verifikationen (Passwort-Links, Bestätigungs-Token) | Einladung 30 Tage nach Annahme, Widerruf oder Ablauf; Verifikation sofort nach Ablauf | Annahme, Widerruf, Ablauf | Löschlauf (`raeumeKontenAuf`) | umgesetzt |
| L-07 | Direkt-Uploads großer PDF-Dateien, nie übernommen | nach Ablauf der Frist des Uploads | Ablauf | Löschlauf (`raeumeDirektEingaengeAuf`, mit Zeitbudget) | umgesetzt |
| L-08 | Audit-Protokoll (wer hat wann was getan; keine Personendaten in den Details) | keine Frist im Code [Frist – Vorschlag 12 Monate] | Zeitpunkt | Löschlauf `gemeindeLoeschlauf` (`src/lib/loeschen/gemeinde.ts`): Audit-Einträge älter als 12 Monate | umgesetzt 13.10. (Frist Vorschlag, D-16) |
| L-09 | Server-Protokolle des Hosters (Vercel) | [Frist – Hoster und Vorstand; prüfen: Aufbewahrung laut Anbieter] | Zeitpunkt | beim Hoster | offen |

### 3.2 Konten

| Nr. | Datenart | Frist | Auslöser | Technische Umsetzung | Stand |
| --- | --- | --- | --- | --- | --- |
| L-10 | Gemeinde-, Eltern-, Lehrkraft- und Schülerkonto samt Profil, Rollen, Einwilligungen des Kontos, Push-Abos des Kontos | **innerhalb von 30 Tagen** nach Löschantrag (Art. 17); bei Ausscheiden einer Lehrkraft [Frist – Vorschlag 30 Tage] | Antrag in „Mein Bereich“ (setzt `loeschen_ab`) bzw. Ausscheiden | Konto löschen (Kaskade: Sitzungen, Rollen, Profil, Einwilligungen, Abos); Chat-Absender werden anonymisiert (`absender_id` wird `null`) | Frist umgesetzt in der Oberfläche; **Löschroutine fehlt** im Löschlauf [prüfen: Konten-Paket] |
| L-11 | Kinderzugang (Benutzername, Passwort-Hash, Anzeigename) | mit dem Austritt des Kindes aus allen Gruppen [Frist – Vorschlag 30 Tage danach] oder auf Wunsch der Eltern (über die Gemeinde) | Austritt, Wunsch der Eltern | wie L-10 | Vorschlag / Lücke |
| L-12 | Sitzungen | absolut 8 h (Verwaltung), 12 h (Lehrkraft, Kind), 30 Tage (übrige) ab Anmeldung | Ablauf | beim Laden der Sitzung geprüft und gelöscht (`ladeKonto`); [prüfen: Bereinigung abgelaufener Sitzungszeilen, die nie wieder geladen werden] | teilweise |
| L-13 | Gesperrtes Konto | bleibt bis zur Entscheidung [Frist – Vorschlag 6 Monate, dann Löschung oder Entsperrung] | Sperre | `user.gesperrt_am`; Sitzungen enden sofort | Vorschlag |
| L-14 | Konten ohne Anmeldung | [Frist – Vorschlag 24 Monate ohne Anmeldung, Vorwarnung per E-Mail 30 Tage vorher] | Zeit seit letzter Anmeldung | Löschlauf: Gemeindekonten ohne Rolle nach 24 Monaten ohne Anmeldung, Vorwarnung per Mail 30 Tage vorher (Kinderkonten über die Eltern, nie an `.invalid`; `src/lib/konto/inaktiv.ts`) | umgesetzt 13.10. (Frist Vorschlag, D-16) |
| L-15 | Einwilligungsnachweise (Art, Textversion, Zeit, erteilende Person; ohne Namen der Kinder) | nach Widerruf oder Löschung der Lernenden [Frist – Vorschlag bis Ablauf der Verjährung: 3 Jahre ab Ende des Jahres] | Widerruf, Löschung | Einwilligungen bleiben beim Löschen der Lernenden ohne Namen erhalten (Migration 0012); Löschlauf am 1. 1. des vierten Folgejahres (`src/lib/loeschen/fristen.ts`) | umgesetzt 13.10. (Frist Vorschlag, D-14) |

### 3.3 Lernplattform

| Nr. | Datenart | Frist | Auslöser | Technische Umsetzung | Stand |
| --- | --- | --- | --- | --- | --- |
| L-16 | Stammdaten der Lernenden (Name, Geburtsdatum, Anschrift verschlüsselt; Anzeigename; Tag des 16. Geburtstags; Status) | [Frist – Vorschlag 12 Monate nach dem Austritt aus allen Gruppen] | Austritt (Status `beendet`) | `lernende.loeschen_ab` setzen; Löschroutine mit Kaskade (L-17, L-18, L-19) | Vorschlag / **Lücke** (D-10) |
| L-17 | Anwesenheit (mit Notiz, verschlüsselt), Fehlmeldungen | mit L-16 bzw. [Frist – Vorschlag Ende des Schuljahres plus 12 Monate, früher als L-16 möglich] | Schuljahresende, Austritt | Kaskade bzw. eigene Routine | Vorschlag / Lücke |
| L-18 | Lernfortschritt, Hifz-Einträge (Art. 9) | mit L-16; auf Wunsch der Eltern früher; Bescheinigung vorher möglich | Austritt, Wunsch | Kaskade | Vorschlag / Lücke |
| L-19 | Eltern-Kind-Zuordnung, Gruppenmitgliedschaft | mit L-16 | Austritt | Kaskade | Vorschlag / Lücke |
| L-20 | Gruppen, Unterrichtstermine, Lehrplan (ohne Personenbezug) | unbefristet; Gruppen archivieren (`status: archiviert`) | Gruppenende | – | beschlossen (kein Personenbezug) |
| L-21 | Einwilligung am 16. Geburtstag | Eigene Einwilligung binnen 30 Tagen; bei Ausbleiben [Folge – Entscheidung D-11, Vorschlag: Chat und Push pausieren] | 16. Geburtstag (`lernende.sechzehn_am`) | Erweiterung des Löschlaufs laut Plan; im Code dieses Standes nicht umgesetzt | Lücke (D-11) |

### 3.4 Gruppenchat

| Nr. | Datenart | Frist | Auslöser | Technische Umsetzung | Stand |
| --- | --- | --- | --- | --- | --- |
| L-22 | Chat-Nachrichten (verschlüsselt) | **90 Tage** nach dem Senden, **spätestens 30 Tage nach dem Ende der Gruppe** | Zeit; Gruppenende (`gruppe.ende`) | `chatLoeschlauf` | umgesetzt (S-12) |
| L-23 | Entfernte Nachrichten (Platzhalter) | wie L-22; der verschlüsselte Text bleibt bis dahin [Entscheidung D-03: sofort überschreiben, außer bei offener Meldung] | Entfernen durch die Leitung | derzeit `entfernt_am` gesetzt, Chiffrat bleibt | Lücke (D-03) |
| L-24 | Meldungen samt verschlüsseltem Kontext (±10) und Freitext | **1 Jahr nach Abschluss** (Status „erledigt“); **offene** Meldungen [Höchstfrist – Vorschlag 12 Monate nach Eingang, Entscheidung D-05] | Abschluss | `chatLoeschlauf` (`loeschen_ab` wird nur bei „erledigt“ gesetzt) | umgesetzt (erledigt) / Lücke (offen) |
| L-25 | Moderationsprotokoll (Zeitpunkt, Maßnahme, Grund, Kennungen, Hash; keine Chat-Texte) | [Frist – Vorschlag 3 Jahre ab Eintrag, Entscheidung D-04] | Zeit | Trigger erlaubt `DELETE` nur, wenn der Löschlauf `igmg.loeschlauf = '1'` setzt (Migration `0009`); keine Routine nutzt das | Lücke (D-04) |
| L-26 | Stummschaltungen, Bestätigung der Regeln, Gelesen-Stand | Stummschaltung bis zum Ablauf; Regel-Bestätigungen mit dem Konto; Gelesen-Stand wird nicht verwendet | Zeit, Kontolöschung | Kaskade mit dem Konto bzw. dem Kanal | umgesetzt (Kaskade) |

### 3.5 Push, Newsletter und weitere Funktionen

| Nr. | Datenart | Frist | Auslöser | Technische Umsetzung | Stand |
| --- | --- | --- | --- | --- | --- |
| L-27 | Push-Abos (Adresse verschlüsselt, Schlüssel, Themen); Einmal-Schlüssel | Abo: bis Abschalten; **12 Monate** ohne erfolgreiche Zustellung; sofort bei 404/410 oder nach 5 Fehlern; Einmal-Schlüssel 3 Tage | Abschalten (Seite oder Browser), Zeit, Fehler | `entferneAbo`, `sendeAnAbo`, Aufräumen im Minutentakt (`fuehreTaktAus`) | umgesetzt |
| L-28 | Newsletter-Abos | unbestätigte [Frist – Vorschlag 7 Tage]; abgemeldete: Nachweis [Frist – Vorschlag 3 Jahre ab Ende des Jahres der Abbestellung] | Eintragung, Abbestellung | keine Routine | Lücke (D-13) |
| L-29 | Hatim-Teile (Konto-Verknüpfung), Dienstplan-Einträge, Aufgaben, Urkunden | mit dem Konto bzw. den Lernenden; Aufbewahrung der Hatim [Frist – Vorstand] | Kontolöschung | Kaskade bzw. `set null` (Hatim) | umgesetzt (Kaskade), Frist offen |

### 3.6 Audio, Medien und Infrastruktur

| Nr. | Datenart | Frist | Auslöser | Technische Umsetzung | Stand |
| --- | --- | --- | --- | --- | --- |
| L-30 | Rezitationen und Aufnahmen (Stimme der Rezitierenden), Zeitmarken | bis Widerruf bzw. Vertragsende; danach Entfernung binnen [Frist – Vorschlag 14 Tage] | Widerruf, Kündigung der Vereinbarung | Rezitation deaktivieren, `quran_audio`-Zeilen und Dateien in Blob löschen; Spiegel von Hand (L-32) | Verfahren (Hand) |
| L-31 | Personenfotos (Medien mit Personenbezug) | bis Widerruf; danach Entfernung binnen [Frist – Vorschlag 14 Tage] | Widerruf | Medium löschen (Datei und Varianten); Papierkorb 30 Tage umgehen: endgültig löschen; Spiegel von Hand | Verfahren (Hand) |
| L-32 | **Medienspiegel** auf dem lokalen Server (Bilder, PDF, Audio) | **30 Tage** nach Löschung in Vercel Blob (`SPIEGEL_LOESCHFRIST_TAGE`) | Löschung in Blob, Widerruf | `spiegel.mjs`: Marke `<datei>.geloescht` beim ersten Fehlen, nach Frist Datei, `.sha256` und Marke entfernen; bei sofortigem Bedarf (Widerruf) Handverfahren im Volume `spiegel` | umgesetzt (D-06) |
| L-33 | Sicherungen der Datenbank (verschlüsselt mit `age`) | **30 Tage** Rotation (`SICHERUNG_TAGE`) | Alter | `find … -mtime +30 -delete` in `sichern.sh` | umgesetzt |
| L-34 | Wiederherstellungsprobe (Wegwerf-Datenbank) | nach der Probe sofort | Ende der Probe | `probe.sh` löscht das Verzeichnis `/tmp/probe` | umgesetzt |
| L-35 | Container-Protokolle des lokalen Servers (keine Personendaten) | 3 Dateien à 5 MB je Dienst (Rotation) | Größe | Docker `json-file`, `max-size`, `max-file` | umgesetzt |
| L-36 | Gerätespeicher (localStorage, Cache des Service Workers) | beim Gerät der Person; kein Zugriff der Gemeinde | Person löscht Websitedaten | – | beschlossen |

### 3.7 Lern-App

Ergänzung vom 20.10.2026 (Lauf „Lern-App“, Etappe L0), **Entwurf**. Grundlage: `_lernapp/KERN.md` §6 (12 Monate nach der letzten Aktivität, kaskadierend mit dem Konto; Schreibabgaben nach 12 Monaten; ältere Ereignisse werden verdichtet), ADR 0038 Nr. 10, ADR 0042 Nr. 11, `dsfa-lernapp.md`, `einwilligung-lernapp.md`, `vereinbarung-sprecher-lernapp.md`. Der Code der Lern-App entsteht ab Etappe L1; „geplant“ heißt: Frist festgelegt, Routine noch nicht gebaut; „umgesetzt“ nennt die Etappe, in der die Routine entstand (Stand L1 vom 20.10.2026). Ohne Konto speichert die Gemeinde keine Daten der Lernenden; alles liegt auf dem Gerät (L-37).

| Nr. | Datenart | Frist | Auslöser | Technische Umsetzung | Stand |
| --- | --- | --- | --- | --- | --- |
| L-37 | Gerätespeicher der Lern-App: IndexedDB `igmg-lernapp` (Profile, Ereignisse, Kartenstand, Einstellungen), Caches `igmg-lernapp-*` (Hülle, Pakete, Audio, Whisper-Modelle) | beim Gerät der Person; kein Zugriff der Gemeinde | Person löscht in der App oder im Browser | „Lokale Daten löschen“ und Export als Datei in den Einstellungen; beim Abmelden die Frage, ob der Lernstand auf dem Gerät gelöscht werden soll [Vorschlag, D-L12] | beschlossen (kein Zugriff) / Vorschlag (Knöpfe) |
| L-38 | Lernstand mit Konto: `lernapp_profil`, `lernapp_ereignis`, `lernapp_karte`, `lernapp_tag`, `lernapp_tag_kurs` | **12 Monate** nach der letzten Aktivität in der Lern-App; mit dem Konto; nach Widerruf der Einwilligung `lernapp` oder Ende des Eltern-Kind-Bezugs **sofort**, sobald keine geltende Einwilligung mehr deckt (deckt noch die des anderen Elternteils bzw. im Übergang nach dem 16. Geburtstag die eigene, bleibt er) | letzte Aktivität (`zuletztAktivAm`), Kontolöschung, Widerruf, Ende des Eltern-Kind-Bezugs | Löschlauf `gemeindeLoeschlauf` (`src/lib/loeschen/gemeinde.ts`): Profil löschen, Ereignisse, Karten und Lerntage folgen über die Fremdschlüssel; Kontolöschung kaskadiert; nach Widerruf bzw. Bezugsende `folgenDesWiderrufs` (`src/lib/lernapp/schreiben/folgen.ts`) in einer Transaktion unter der Sperre des Abgleichs, Audit nur mit Anlass; der nächste Abgleich antwortet 403, der Stand auf dem Gerät bleibt (L-37) | Frist nach KERN 4.0 §6 / umgesetzt (L1-01: 12 Monate und Kontolöschung; SL2-Rest, S-L3 N-2: Widerruf und Bezugsende) |
| L-39 | Einzelne Ereignisse älter als 12 Monate | Bewertungen werden in den Kartenstand verdichtet (`lernapp_karte.basis`), danach gelöscht; die übrigen Ereignisarten (Lektion, XP, Ziel, Pause) bleiben bis L-38, weil Serie und Abzeichen aus ihnen abgeleitet werden | Alter | Löschlauf `verdichteLernapp` (`src/lib/lernapp/sync/verdichten.ts`) unter der Sperre des Abgleichs (ADR 0038 Nr. 10) | umgesetzt (L1-05) |
| L-40 | Schreibabgaben (Text und Kommentar verschlüsselt, Bewertung nach Prüfliste) | **12 Monate** nach der Abgabe; mit dem Konto; jederzeit durch die Person selbst (Lern-App, „Mein Bereich › Konto“); nach Widerruf von `lernapp` oder Ende des Eltern-Kind-Bezugs **sofort**, soweit keine geltende Einwilligung die Abgabe schon zur Zeit der Abgabe deckt; beim Austritt aus der Gruppe von ihr gelöst (keine Lehrkraft liest sie danach) | Abgabe (`loeschenAb`), Kontolöschung, Löschen durch die Person, Widerruf, Ende des Eltern-Kind-Bezugs, Austritt | Löschlauf `gemeindeLoeschlauf` (`lernapp_schreibabgabe.loeschen_ab`, spätestens 12 Monate nach `eingereicht_am`); Kaskade mit dem Konto; `folgenDesWiderrufs` bzw. `folgenNachBezugsende` und `loeseAbgabenVonGruppe` (`src/lib/lernapp/schreiben/folgen.ts`), Audit nur mit Anzahl und Anlass | Frist nach KERN 4.0 §6 / umgesetzt (L1-01 Löschlauf; L5-03 Abgabe und Selbstlöschung; S-L2-Auflagen Austritt und Widerruf; SL2-Rest Bezugsende) |
| L-41 | Zuweisungen der Lehrkraft (`aufgabe` mit Bezug `lernapp`) und Erledigt-Vermerke | wie L-29; zusätzlich [Frist – Vorschlag 12 Monate nach Ende der Gruppe] | Kontolöschung, Gruppenende | Kaskade bzw. Löschlauf | Vorschlag |
| L-42 | Zustimmung zur Bestenliste; Anzeige der Wochen-XP | Zustimmung bis zur Rücknahme (in der Gruppe der Lern-App oder in „Mein Bereich › Konto“) oder bis zum Widerruf von `lernapp`, Nachweis wie L-15; Wochenwerte werden aus den Ereignissen berechnet und **nicht** als Verlauf gespeichert | Rücknahme, Widerruf, Kontolöschung | Zeile löschen (`blendeAus`, `folgenDesWiderrufs`); Ableitung aus L-38 | Vorschlag / Rücknahme und Widerruf umgesetzt (SL2-Rest) |
| L-43 | Einwilligungsnachweis `lernapp` (Art, Textversion `lernapp…/2026-10-entwurf+sha256:…`, Sprache, Zeit, erteilende Person, Einvernehmen bei Eltern) | wie L-15; das Ende des Eltern-Kind-Bezugs beendet die Einwilligung dieses Elternteils (Nachweis bleibt wie L-15) | Widerruf, Ende des Eltern-Kind-Bezugs, Löschung | wie L-15 (`src/lib/loeschen/fristen.ts`); Erteilen und Widerruf in „Mein Bereich“ (`src/server/actions/lernapp-einwilligung.ts`, `kinder.ts`) | Verfahren wie Bestand / Erteilen und Widerruf umgesetzt (SL2-Rest, S-L3 N-2) |
| L-44 | Anonyme Meldungen (`lernapp_meldung`: Aufgabenschlüssel, Kategorie, Zeitpunkt, Status) | kein Personenbezug; [Frist – Vorschlag 12 Monate nach Erledigung] | Erledigung | Löschlauf | Vorschlag |
| L-45 | Feld „eigene Antwort“ einer Meldung (nur angemeldet ab 16, ohne Kontobezug gespeichert) | bei Erledigung der Meldung, spätestens [12 Monate] nach Eingang | Erledigung, Zeit | Löschlauf setzt das Feld leer | Vorschlag (D-L07) |
| L-46 | ALTCHA-Lösungen und Ratenfenster von Meldung und Abgleich | wie L-05 | Ablauf | wie L-05 | Verfahren wie Bestand |
| L-47 | Statistik ohne Personenbezug (`lernapp_statistik_tag`: Tagessummen je Kurs, Bereich, Kennzahl); anonyme Telemetrie (`lernapp_statistik`) | Summen: [Frist – Vorschlag 3 Jahre]; Telemetrie: [Entscheidung D-L08, Vorschlag: nicht einschalten] | Zeit | Löschlauf | Vorschlag |
| L-48 | Push-Abos mit Thema `lernapp` | wie L-27 | wie L-27 | wie L-27 | Verfahren wie Bestand |
| L-49 | Prüfungen der Inhalte (`lernapp_pruefung`, `lernapp_stichprobe`, Verlauf in `freigabe`) mit Kennung der prüfenden Person | solange der geprüfte Stand ausgeliefert wird, danach [Frist – Vorschlag 3 Jahre]; bei Löschung des Kontos der prüfenden Person Kennung pseudonymisieren statt löschen | Ablösung des Stands, Kontolöschung | Löschlauf | Vorschlag (D-L10) |
| L-50 | Aufnahmen von Sprecherinnen und Sprechern (Clips, Bündel im Blob `lernapp`, Einträge im Audio-Manifest); Rohaufnahmen einer Sitzung | Aufnahmen bis Widerruf oder Ende der Vereinbarung, dann Entfernung binnen [Frist – Vorschlag 14 Tage]; Rohaufnahmen nach Schnitt und Freigabe, spätestens [3 Monate] nach der Sitzung | Widerruf, Kündigung, Zeit | Bündel neu bauen, Dateien im Blob löschen; Medienspiegel L-32 (Hand), Sicherungen L-33; Kopien Dritter unter CC BY-SA 4.0 nicht rückholbar | Verfahren (Hand) / Vorschlag |
| L-51 | Eintrag der sprechenden Person (`lernapp_sprecher`: Name oder Pseudonym) und unterschriebene Vereinbarung (Scan) | bis [Frist – Vorschlag 3 Jahre] nach dem Ende der Vereinbarung (Nachweis) | Ende der Vereinbarung | Medium und Eintrag löschen | Vorschlag |
| L-52 | Synthetische Stimme (Modul B): Trainingsdaten, Referenzaufnahme, Stimmmodell mit Zwischenständen, nur lokal | bei Widerruf von Modul B oder der ganzen Vereinbarung binnen [Frist – Vorschlag 14 Tage]; erzeugte Clips wie L-50 | Widerruf, Kündigung | Löschung auf den Rechnern der Gemeinde mit Datum im Fallprotokoll | Verfahren (Hand) / Vorschlag |
| L-53 | Sprachaufnahmen der Lernenden bei Sprechübungen | werden **nie** übertragen; [Vorschlag: nur im Arbeitsspeicher bis zum Ende der Übung, keine Ablage im Gerätespeicher] | Ende der Übung | Worker im Browser (ADR 0042) | beschlossen (KERN 4.0 §6) / Vorschlag (D-L12) |

**Widerruf in der Lern-App (Ergänzung zu §4 Nr. 7).**

| Einwilligung | Wirkung |
| --- | --- |
| `lernapp` (Erwachsene, Eltern, ab 16) | Abgleich endet sofort; Lernstand auf dem Server binnen [30 Tagen] gelöscht (L-38); Schreibabgaben nach Entscheidung (L-40); lokaler Stand bleibt (L-37) |
| Zustimmung zur Bestenliste | Person verschwindet sofort aus der Liste (L-42) |
| Push mit Thema `lernapp` | Abo wird gelöscht (L-48) |
| Sprecher-Vereinbarung, Modul A | Aufnahmen binnen [14 Tagen] aus der Lern-App (L-50) |
| Sprecher-Vereinbarung, Modul B | Stimmmodell und Trainingsdaten binnen [14 Tagen] gelöscht, erzeugte Clips entfernt (L-52) |

**Löschen auf Antrag.** Die Löschung eines Kontos nach §4 umfasst L-38 bis L-42 (Kaskade). Meldungen (L-44) und Statistik (L-47) haben keinen Kontobezug und sind davon nicht betroffen.

**Lücken (Lern-App).** Löschung auf dem Server nach Widerruf von `lernapp` (L-38, L-40; Technik, L7 mit der Einwilligungsoberfläche); Löschlauf für L-41, L-44, L-45 und L-47 (Technik, L7); Knöpfe „Lokale Daten löschen“ und Export als Datei (L-37: Export und Import in den Einstellungen umgesetzt in L1, „Lokale Daten löschen“ L7); Frist nach Widerruf und Umgang mit offenen Schreibabgaben (DSB); Prüfprotokolle (D-L10); Rohaufnahmen und Stimmmodell (Verfahren der Technik); Verschwinden widerrufener Aufnahmen auf den Geräten der Lernenden (Service Worker der Lern-App, L1).

## 4. Löschen auf Antrag (Art. 17) und Auskunft (Art. 15)

1. **Eingang.** Anträge kommen über „Mein Bereich“ (Löschantrag) oder per E-Mail an [E-Mail-Adresse]. Für Kinder stellen die Eltern den Antrag (Kinderzugänge löschen die Eltern über die Gemeinde).
2. **Prüfung** durch [zuständige Person – Bildung/Vorstand] binnen [Frist – Vorschlag 7 Tage]: Wer stellt den Antrag (Identität, Sorgeberechtigung)? Gibt es eine Aufbewahrungspflicht? Hängt eine Meldung des Kinderschutzes an den Daten? Dann wird gesperrt, nicht gelöscht, und die Person erfährt den Grund.
3. **Löschung** spätestens **30 Tage** nach Eingang des Antrags (so steht es in „Mein Bereich“; die gesetzliche Frist für die Antwort beträgt einen Monat, Art. 12 Abs. 3).
4. **Umfang:** Konto, Profil, Einwilligungen (Nachweis nach L-15), Push-Abos, Lesezeichen im Konto; bei Lernenden zusätzlich L-16 bis L-19. Chat-Nachrichten der Person werden anonymisiert (Absender entfällt) und laufen nach L-22 aus.
5. **Bestätigung** an die antragstellende Person [Vorlage – Vorstand]. Das Audit-Protokoll hält fest, **dass** gelöscht wurde, nicht was.
6. **Sicherungen:** Gelöschte Daten bleiben bis zu 30 Tage in den verschlüsselten Sicherungen und verschwinden mit der Rotation. Die Person wird darüber informiert.
7. **Widerruf einer Einwilligung** (Art. 7 Abs. 3) hat folgende Wirkung:

| Einwilligung | Wirkung |
| --- | --- |
| Lernplattform | digitale Erfassung endet; Daten nach Absprache löschen (L-16 bis L-19); abhängige Funktionen enden [Entscheidung DSB] |
| Kinderkonto | Zugang gesperrt und gelöscht (L-11) |
| Gruppenchat | Schreiben endet **sofort** (S-03); Nachrichten laufen nach L-22 aus; Lesen: Entscheidung D-01 |
| Push (auch für das Kind) | Abo wird gelöscht (L-27) |
| Newsletter | Abbestellung sofort; Nachweis nach L-28 |
| Personenfotos | Foto entfernen binnen [14 Tage] (L-31, L-32) |
| Rezitation (Vereinbarung) | Aufnahme deaktivieren und entfernen (L-30, L-32) |

## 5. Sicherungen, Spiegel und Wiederherstellung

- **Rotation:** Sicherungen 30 Tage; der Schlüssel für die Entschlüsselung liegt beim Vorstand. Ohne den Anwendungsschlüssel `EINGANG_SCHLUESSEL` sind die Felder, die die Anwendung zusätzlich verschlüsselt, auch in einer Wiederherstellung unlesbar.
- **Medienspiegel:** hält alles, was je in Blob lag (L-32). Handverfahren bei Widerruf: [Technik] löscht Datei und Prüfsumme; Nachweis im Fallprotokoll.
- **Wiederherstellung (D-09):** Nach jeder Wiederherstellung führt die Technik **sofort** den Löschlauf aus und wendet alle Löschanträge, Widerrufe und Austritte an, die seit dem Datum der Sicherung eingegangen sind (Liste aus dem E-Mail-Postfach und dem Audit-Protokoll). Erst danach geht die Website wieder in den Betrieb.

## 6. Kontrolle und Nachweis

| Prüfung | Wie oft | Wer |
| --- | --- | --- |
| Löschlauf gelaufen (Antwort der Route, Cockpit) | täglich automatisch; Stichprobe wöchentlich | Technik |
| Stichprobe: älteste Chat-Nachricht, älteste Meldung, älteste Push-Abo-Zeile nicht über Frist | monatlich | Technik, [Ansprechperson Kinderschutz] |
| Tests: `web/tests/integration/wartung-cron.test.ts`, `chat.test.ts` (Löschfristen), `push.test.ts` | bei jeder Änderung | Entwicklung |
| Überprüfung dieses Konzepts und der Fristen | jährlich und bei neuen Funktionen | Vorstand, DSB |

## 7. Lücken und Entscheidungen (Zusammenfassung)

| Lücke | Entscheidung | Wer |
| --- | --- | --- |
| Löschroutine Konto nach Antrag (L-10), Lernende nach Austritt (L-16 bis L-19), Newsletter (L-28), Moderationsprotokoll (L-25), nicht versendete Mails (L-02), 16. Geburtstag (L-21) | Routinen im Löschlauf ergänzen (Technik) und Fristen beschließen | Technik, Vorstand, DSB |
| Entfernte Nachrichten (L-23), offene Meldungen (L-24) | D-03, D-05 | DSB, Kinderschutz |
| Einwilligungsnachweis nach Löschung (L-15) | D-14 | DSB |
| Medienspiegel (L-32) | D-06 | Technik, DSB |
| Frist Audit-Protokoll, inaktive Konten, Server-Protokolle (L-08, L-09, L-14) | D-16 | Vorstand, DSB |
| Verfahren nach Wiederherstellung (§5) | D-09 | Technik, DSB |
