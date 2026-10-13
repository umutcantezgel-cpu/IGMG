# Löschkonzept der Gemeinde-Plattform

> **ENTWURF – vor Veröffentlichung durch Datenschutz/Recht prüfen (MENSCHEN MN-11).** Dieses Konzept beschreibt, welche Daten wann und wie gelöscht werden. Es unterscheidet **beschlossene** Fristen (im Code umgesetzt), **Vorschläge** (nicht beschlossen, mit „Vorschlag“ markiert) und **Lücken** (Frist oder Routine fehlt). Dies ist keine Rechtsberatung. Alles in eckigen Klammern `[ ]` ist offen; `[prüfen]` ist rechtlich oder technisch zu klären.

Stand: 13.10.2026 · Stand des Codes: Branch `claude/trusting-lovelace-6nfolz`, Commit `bb8433d` · Bezug: Art. 5 Abs. 1 lit. e, Art. 17, Art. 25, Art. 32 DSGVO; `verarbeitungsverzeichnis-ergaenzung.md` (GP-01 bis GP-17), `dsfa-lernplattform.md` (D-01 bis D-17).

## 1. Grundsätze

1. **Speicherbegrenzung.** Personenbezogene Daten werden nur so lange gespeichert, wie der Zweck es verlangt. Die Fristen unten sind **Höchstfristen**; früher löschen ist immer erlaubt.
2. **Löschen heißt unwiderruflich.** Datensätze werden aus der Datenbank entfernt, nicht nur ausgeblendet. Ausnahme: Chat-Nachrichten, die **entfernt** wurden (Platzhalter), bleiben verschlüsselt bis zum Löschlauf (Lücke D-03).
3. **Aufbewahrungspflichten gehen vor** (Art. 17 Abs. 3 lit. b). Die Gemeinde kennt für die Lernplattform keine gesetzliche Aufbewahrungspflicht `[prüfen: steuerrechtliche Pflichten gelten für Spendenbelege, nicht für diese Daten; Rechtsberatung bestätigt]`. Besteht eine Pflicht, wird gesperrt (Zugriff nur für diesen Zweck) statt gelöscht.
4. **Kaskade.** Das Datenmodell löscht abhängige Zeilen mit (`onDelete: cascade`). Das gilt zum Beispiel für Anwesenheit, Fortschritt, Hifz, Fehlmeldung, Eltern-Kind-Zuordnung, Gruppenmitgliedschaft und Einwilligungen der Lernenden, sobald der Datensatz der Lernenden gelöscht wird. Der Einwilligungsnachweis geht dabei verloren (D-14).
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
| L-08 | Audit-Protokoll (wer hat wann was getan; keine Personendaten in den Details) | keine Frist im Code [Frist – Vorschlag 12 Monate] | Zeitpunkt | keine Routine | Lücke (D-16) |
| L-09 | Server-Protokolle des Hosters (Vercel) | [Frist – Hoster und Vorstand; prüfen: Aufbewahrung laut Anbieter] | Zeitpunkt | beim Hoster | offen |

### 3.2 Konten

| Nr. | Datenart | Frist | Auslöser | Technische Umsetzung | Stand |
| --- | --- | --- | --- | --- | --- |
| L-10 | Gemeinde-, Eltern-, Lehrkraft- und Schülerkonto samt Profil, Rollen, Einwilligungen des Kontos, Push-Abos des Kontos | **innerhalb von 30 Tagen** nach Löschantrag (Art. 17); bei Ausscheiden einer Lehrkraft [Frist – Vorschlag 30 Tage] | Antrag in „Mein Bereich“ (setzt `loeschen_ab`) bzw. Ausscheiden | Konto löschen (Kaskade: Sitzungen, Rollen, Profil, Einwilligungen, Abos); Chat-Absender werden anonymisiert (`absender_id` wird `null`) | Frist umgesetzt in der Oberfläche; **Löschroutine fehlt** im Löschlauf [prüfen: Konten-Paket] |
| L-11 | Kinderzugang (Benutzername, Passwort-Hash, Anzeigename) | mit dem Austritt des Kindes aus allen Gruppen [Frist – Vorschlag 30 Tage danach] oder auf Wunsch der Eltern (über die Gemeinde) | Austritt, Wunsch der Eltern | wie L-10 | Vorschlag / Lücke |
| L-12 | Sitzungen | absolut 8 h (Verwaltung), 12 h (Lehrkraft, Kind), 30 Tage (übrige) ab Anmeldung | Ablauf | beim Laden der Sitzung geprüft und gelöscht (`ladeKonto`); [prüfen: Bereinigung abgelaufener Sitzungszeilen, die nie wieder geladen werden] | teilweise |
| L-13 | Gesperrtes Konto | bleibt bis zur Entscheidung [Frist – Vorschlag 6 Monate, dann Löschung oder Entsperrung] | Sperre | `user.gesperrt_am`; Sitzungen enden sofort | Vorschlag |
| L-14 | Konten ohne Anmeldung | [Frist – Vorschlag 24 Monate ohne Anmeldung, Vorwarnung per E-Mail 30 Tage vorher] | Zeit seit letzter Anmeldung | keine Routine | Vorschlag / Lücke (D-16) |
| L-15 | Einwilligungsnachweise (Art, Textversion, Zeit, erteilende Person; ohne Namen der Kinder) | nach Widerruf oder Löschung der Lernenden [Frist – Vorschlag bis Ablauf der Verjährung: 3 Jahre ab Ende des Jahres] | Widerruf, Löschung | derzeit Kaskade: Nachweis wird mit den Lernenden gelöscht | Lücke (D-14) |

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
