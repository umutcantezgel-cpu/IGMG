# Verarbeitungsverzeichnis: Ergänzung für die Gemeinde-Plattform (Art. 30 DSGVO)

> **ENTWURF – vor Veröffentlichung durch Datenschutz/Recht prüfen (MENSCHEN MN-11).** Ergänzt `web/docs/recht/VERARBEITUNGSVERZEICHNIS.md` (Vorlage vom 11.10.2026, bleibt unverändert). Ein Verarbeitungsverzeichnis wird nicht veröffentlicht; es ist der Aufsichtsbehörde auf Anfrage vorzulegen (Art. 30 Abs. 4). Dies ist keine Rechtsberatung. Alles in eckigen Klammern `[ ]` ist offen; `[prüfen]` ist nicht belegt.

Stand: 13.10.2026 · Stand des Codes: Branch `claude/trusting-lovelace-6nfolz`, Commit `bb8433d` · Bezug: AUFTRAG §2, §3.5, §3.6, §5.

## 1. Verantwortlicher und Datenschutzbeauftragte/r

- **Verantwortlicher:** [Name und Rechtsform – Vorstand], [Anschrift], [Telefonnummer], [E-Mail-Adresse] (wie im Impressum, Seed `rechtliches.ts`).
- **Vertretungsberechtigte:** [Vertretungsberechtigte – Vorstand].
- **Datenschutzbeauftragte/r:** [Datenschutzbeauftragte/r – Angaben von der Gemeinde] `[prüfen: Benennungspflicht nach § 38 BDSG]`.
- **Gemeinsam Verantwortliche (Art. 26):** keine vorgesehen `[prüfen: Rolle des Zentralverbands, falls Daten dorthin gehen]`.

## 2. Wie dieses Verzeichnis aufgebaut ist

- Je Verarbeitungstätigkeit eine Tabelle mit den Angaben nach Art. 30 Abs. 1: Zweck, betroffene Personen, Datenkategorien, Empfänger, Drittland, Löschfristen, Maßnahmen (Art. 32).
- Die Kennungen `GP-01` bis `GP-17` gelten für die Gemeinde-Plattform. Maßnahmen `T-01` bis `T-15` stehen einmal in Abschnitt 3 und werden in den Tabellen nur genannt.
- **Funktionsschalter:** Jede Tabelle nennt den Schalter (ADR 0035). In der **Produktion sind alle Schalter aus**; ein Eintrag gilt ab dem Einschalten.
- Fristen: Wo ein Vorschlag steht, ist er **nicht beschlossen** („Vorschlag – Vorstand/DSB entscheiden“). Die Gesamtübersicht der Fristen steht im Löschkonzept (`loeschkonzept.md`, Kennungen `L-nn`).
- Die Rollen der Verwaltung: `administration`, `redaktion`, `organisationsredaktion`, `bildung`, `mitgliederverwaltung`, `leitung`, `religioese_pruefung`, `kinderschutz`. Gemeinde-Rollen: `gemeinde`, `eltern`, `lehrkraft`, `schueler`.

## 3. Gemeinsame technische und organisatorische Maßnahmen (Art. 32)

| Nr. | Maßnahme | Beleg |
| --- | --- | --- |
| T-01 | Verschlüsselung schutzwürdiger Felder (AES-256-GCM, Schlüsselnummer für Rotation, Schlüssel aus der Umgebung, nicht in der Datenbank) | `web/src/lib/krypto/index.ts`, Test `web/tests/unit/krypto.test.ts` |
| T-02 | Transportverschlüsselung (TLS bei Vercel; Caddy mit TLS beim optionalen Echtzeit-Signal) | `web/docs/deploy/VERCEL.md`, `betrieb/lokal/echtzeit/Caddyfile` `[prüfen: Konfiguration]` |
| T-03 | Rechte- und Gruppenkonzept; jede Server Action prüft serverseitig; Chat-Inhalte nie über „Administration darf alles“ | `web/src/lib/rechte/{matrix,gruppen,gemeinde,pruefe}.ts`, Tests `web/tests/unit/rechte/*`, `web/tests/integration/chat.test.ts` |
| T-04 | Zwei-Faktor-Pflicht für Verwaltung und Lehrkräfte; absolute Sitzungsgrenzen 8 h / 12 h / 12 h (Kind) / 30 Tage; Sperren beendet Sitzungen sofort | `web/src/lib/rechte/sitzung.ts`, `web/src/lib/auth/optionen.ts`, Test `web/tests/integration/verwaltung-benutzer.test.ts` („Sperren“) |
| T-05 | Ratenbegrenzung (Anmeldung, Zwei-Faktor, Passwort-Link, Formulare, Push-Abo, Chat 10/min und 200/Tag); IP nie im Klartext (nicht umkehrbarer Prüfwert) | `web/src/lib/auth/optionen.ts`, `web/src/lib/validierung/ratenbegrenzung.ts`, `web/src/lib/chat/regeln.ts` |
| T-06 | Funktionsschalter: Personendaten-Funktionen in Produktion aus; Cockpit-Sperren (`chat` nur mit bestätigter DSFA, Schutzkonzept und zwei Erwachsenen je Gruppe; `push` nur mit VAPID) | `web/src/lib/funktionen.ts`, ADR 0035, Test `web/tests/unit/funktionen.test.ts` |
| T-07 | Audit-Protokoll der Verwaltungsaktionen ohne Personendaten in den Details | `web/src/lib/audit`, `web/src/lib/db/schema/system.ts` |
| T-08 | Unveränderliches Moderationsprotokoll mit Hash-Kette (Trigger gegen UPDATE/DELETE) | `web/drizzle/migrations/0009_trigger_und_pruefungen.sql`, `web/src/lib/chat/hashkette.ts`, Test `chat.test.ts` (S-10) |
| T-09 | Datenminimierung: Anzeigename Vorname + Initial, im Klartext nur der Tag des 16. Geburtstags, keine IP in Sitzungen, keine Tracker, kein Standort am Server | `web/src/lib/chat/regeln.ts` (`chatName`), `web/src/lib/db/schema/lernen.ts`, ADR 0028 |
| T-10 | Löschkonzept mit täglichem Löschlauf (Vercel-Cron 01:00 UTC und lokaler Takt 03:17) und Sperre gegen Parallelläufe | `web/src/app/api/wartung/loeschfristen/route.ts`, `vercel.json`, `betrieb/lokal/takt/takt.sh`, `loeschkonzept.md` |
| T-11 | Verschlüsselte Sicherung (age), 30 Tage Rotation, monatliche Wiederherstellungsprobe, Überwachung | `betrieb/lokal/` (siehe GP-14) |
| T-12 | Sicherheitskopfzeilen: CSP, Permissions-Policy (Standort nur auf Gebetszeiten-Seiten, Mikrofon/Kamera nur Verwaltung), keine Drittanbieter-Anfragen auf öffentlichen Seiten | `web/src/proxy.ts`, `web/next.config.ts`, Test `web/tests/unit/kopfzeilen-pfade.test.ts` |
| T-13 | Keine Inhalte und Namen in E-Mails, Push-Nachrichten und Protokollen (S-16) | `web/src/server/actions/chat.ts`, `web/src/lib/push/senden.ts` |
| T-14 | Verpflichtung der Ehrenamtlichen auf Vertraulichkeit, Einweisung, Berechtigung nur nach Aufgabe | [organisatorisch – Vorstand; Muster fehlt] |
| T-15 | Verfahren bei Datenpannen (Meldung an die Aufsichtsbehörde binnen 72 Stunden, Art. 33; Information Betroffener, Art. 34) | [organisatorisch – Vorstand/DSB; Verfahren fehlt] |

**Offene Punkte zu den Maßnahmen:** T-14 und T-15 sind organisatorisch und noch nicht beschrieben. T-02 ist für Caddy zu prüfen, sobald `echtzeit` eingeschaltet wird.

## 4. Verarbeitungstätigkeiten

### GP-01 Gemeinde-Konto (Gemeinde, Eltern, Schüler ab 16)

| Feld | Angabe |
| --- | --- |
| Zweck | Registrierung, Anmeldung und Nutzung von „Mein Bereich“ (Lesezeichen, Benachrichtigungen, Eltern-Portal, Lernweg) |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. b DSGVO (Nutzungsbedingungen); Sicherheit: lit. f; Cookies: § 25 Abs. 2 Nr. 2 TDDDG |
| Betroffene | Mitglieder und Besucher der Gemeinde ab 16 Jahren, Eltern, Schüler ab 16 |
| Datenkategorien | E-Mail-Adresse, Name, Anzeigename, Passwort-Hash, Sprache, Rollen; Sitzung (Zeiten, Browserkennung, **keine IP**); optional Zwei-Faktor-Geheimnis und Ersatzcodes; Einladungen (Name, E-Mail) |
| Besondere Kategorien | keine; die Zugehörigkeit zur Gemeinde kann Rückschlüsse auf die Religion zulassen `[prüfen: Konto der Gemeinde-Mitglieder, Art. 9]` |
| Empfänger | Vercel (Hosting), Neon (Datenbank), [SMTP-Anbieter] (E-Mail-Versand): Auftragsverarbeiter |
| Drittland | [prüfen] (siehe Verzeichnis Abschnitt 2.1, 2.2, 2.4) |
| Löschfristen | Konto: 30 Tage nach Löschantrag; Einladungen 30 Tage nach Annahme/Widerruf/Ablauf; abgelaufene Passwort-Links sofort; Sitzungen nach Grenzen; inaktive Konten [Frist – Vorschlag 24 Monate ohne Anmeldung] (`L-10` bis `L-14`) |
| Maßnahmen | T-01, T-03, T-04, T-05, T-06, T-09, T-10 |
| Schalter | `konten` |
| Belege | `web/src/lib/db/schema/{auth,konten}.ts`, `web/src/lib/auth/optionen.ts`, `web/src/lib/rechte/{gemeinde,sitzung}.ts` |
| Offen | Löschroutine für `konto_profil.loeschenAb` im Löschlauf `[prüfen: Konten-Paket]` |

### GP-02 Konten der Lehrkräfte, der Gruppenleitung und der neuen Verwaltungsrollen

| Feld | Angabe |
| --- | --- |
| Zweck | Unterricht organisieren, Gruppen leiten, Chat moderieren; Verwaltungsrollen `leitung`, `religioese_pruefung`, `kinderschutz` |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. b oder f DSGVO; § 26 BDSG gilt nicht für Ehrenamtliche `[prüfen: Rechtsberatung]` |
| Betroffene | Lehrkräfte, Aufsichtspersonen, Imam/Hoca, Ansprechpersonen Kinderschutz, Vorstand (Rolle Leitung) |
| Datenkategorien | wie GP-01; Rollen, Gruppenzuordnung (`gruppen_leitung`: Lehrkraft oder Aufsicht), Zwei-Faktor-Geheimnis, Audit-Einträge zu ihren Aktionen |
| Besondere Kategorien | keine |
| Empfänger | wie GP-01 |
| Drittland | [prüfen] |
| Löschfristen | mit Ausscheiden: Konto binnen [Frist – Vorschlag 30 Tage]; Audit-Einträge: [Frist – offen, `L-08`]; Einsichtsvermerk Führungszeugnis: siehe Schutzkonzept |
| Maßnahmen | T-03, T-04 (Zwei-Faktor Pflicht, 12 h bzw. 8 h), T-07, T-14 |
| Schalter | `konten`, `lernplattform` |
| Belege | `web/src/lib/rechte/matrix.ts`, `web/src/lib/rechte/gruppen.ts` |
| Offen | Führungszeugnis und Schulung gehören in das Schutzkonzept (MN-10); Verpflichtungserklärung (T-14) |

### GP-03 Kinderkonto (Kind unter 16)

| Feld | Angabe |
| --- | --- |
| Zweck | Anmeldung des Kindes zum Lernweg und, wenn die Eltern es erlauben, zum Gruppenchat |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. a DSGVO, Art. 8 (Einwilligung der Sorgeberechtigten), getrennte Einwilligung „Kinderkonto“ |
| Betroffene | Kinder unter 16 Jahren (Mindestalter im Chat: 10 Jahre); Eltern |
| Datenkategorien | Benutzername, Passwort-Hash, interne Adresse `k-…@konto.invalid` (nie zustellbar; der Mail-Ausgang weist `.invalid` ab), Anzeigename (Vorname + Initial), Sitzung (12 h) |
| Besondere Kategorien | Teilnahme an religiöser Bildung (siehe GP-06) |
| Empfänger | wie GP-01; kein Versand von E-Mails an das Kind |
| Drittland | [prüfen] |
| Löschfristen | mit dem Austritt des Kindes bzw. auf Wunsch der Eltern (Eltern löschen Kinderzugänge über die Gemeinde); mit dem 16. Geburtstag eigene Einwilligung binnen 30 Tagen (`L-11`, `L-21`) |
| Maßnahmen | T-01, T-03, T-04, T-05, T-06, T-09 |
| Schalter | `konten`, `lernplattform` |
| Belege | ADR 0026, `web/src/lib/db/schema/konten.ts` (`istKind`) |
| Offen | Folge, wenn die Einwilligung nach 30 Tagen am 16. Geburtstag fehlt (DSFA D-11) |

### GP-04 Aufnahme der Lernenden (Voranmeldung → Lernende, Eltern-Einladung)

| Feld | Angabe |
| --- | --- |
| Zweck | Aufnahme angenommener Voranmeldungen in die Kurse, Einladung der Eltern |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen, Vereinbarung über die Teilnahme) |
| Betroffene | Kinder, Eltern, ggf. Geschwisterkinder |
| Datenkategorien | Vor- und Nachname, Geburtsdatum, Anschrift (**verschlüsselt**), Anzeigename und Tag des 16. Geburtstags (Klartext), Eltern 1 und 2 (Name, Telefon, E-Mail), Herkunft (Eingang), Status, Aufnahme (wer, wann) |
| Besondere Kategorien | siehe GP-06 |
| Empfänger | Bildungsverwaltung (Rolle `bildung`), Lehrkräfte der Gruppe (nur Anzeigename); Auftragsverarbeiter wie GP-01 |
| Drittland | [prüfen] |
| Löschfristen | Voranmeldung ohne Aufnahme: 180 Tage nach Abschluss (Bestand); aufgenommene Lernende: [Frist – Vorschlag 12 Monate nach Austritt] (`L-01`, `L-16`) |
| Maßnahmen | T-01, T-03, T-04, T-09, T-10 |
| Schalter | `lernplattform` |
| Belege | `web/src/lib/db/schema/lernen.ts` (`lernende`, `eltern_kind`), `web/src/lib/eingaenge/fristen.ts` |
| Offen | Löschroutine `lernende.loeschenAb` fehlt im Löschlauf; Kaskade löscht beim Löschen der Lernenden auch deren Einwilligungsnachweise (siehe GP-07) |

### GP-05 Unterricht: Termine, Anwesenheit, Fehlmeldungen

| Feld | Angabe |
| --- | --- |
| Zweck | Unterricht organisieren, Anwesenheit führen, Eltern informieren |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. b DSGVO; für die religiöse Bildung Art. 9 Abs. 2 lit. a (ausdrückliche Einwilligung) und lit. d `[prüfen]` |
| Betroffene | Lernende, Eltern, Lehrkräfte |
| Datenkategorien | Termine (kein Personenbezug), Anwesenheit (anwesend, fehlt, entschuldigt, verspätet), kurze Notiz (**verschlüsselt**, höchstens 500 Zeichen), Fehlmeldung der Eltern (Datum bis 60 Tage voraus, Grund: krank, Familie, Schule, sonstiges), erfassende Person und Zeitpunkt |
| Besondere Kategorien | Gesundheitsbezug möglich (Fehlmeldung „krank“, Notiz): `[prüfen: Art. 9 Abs. 1 Gesundheitsdaten; Hinweis an Lehrkräfte: keine Diagnosen eintragen]` |
| Empfänger | Lehrkräfte und Aufsicht der Gruppe (Erfassen), Eltern des Kindes und das Kind selbst (nur eigene Anwesenheit) |
| Drittland | [prüfen] |
| Löschfristen | Anwesenheit, Notizen, Fehlmeldungen: mit den Lernenden bzw. [Frist – Vorschlag Ende des Schuljahres plus 12 Monate] (`L-17`) |
| Maßnahmen | T-01, T-03, T-09, T-10 |
| Schalter | `lernplattform` |
| Belege | `web/src/lib/lernen/dienst.ts`, Test `web/tests/integration/lernen.test.ts` (Gruppenisolation, Fehlmeldung → entschuldigt) |
| Offen | Frist für Anwesenheit/Notizen; Gesundheitsbezug der Fehlmeldung `[prüfen]` |

### GP-06 Lernfortschritt und Hifz

| Feld | Angabe |
| --- | --- |
| Zweck | Lernstand je Stufe des Lehrplans festhalten, Hifz-Prüfungen dokumentieren, Eltern informieren |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a DSGVO (ausdrückliche Einwilligung der Sorgeberechtigten bzw. ab 16 der Jugendlichen); ergänzend lit. d `[prüfen]` |
| Betroffene | Lernende |
| Datenkategorien | Stufe (Elifbe, Koran-Lesen, Tajwid, Ilmihal, Hifz), Status (begonnen, sicher, abgeschlossen), Datum, Lehrkraft; Hifz: Sure, von/bis Vers, Bewertung 1 bis 5, Datum, Lehrkraft |
| Besondere Kategorien | **Ja:** religiöse Bildung und Praxis; Rückschluss auf die religiöse Überzeugung (Art. 9 Abs. 1) |
| Empfänger | Lehrkraft der Gruppe (Erfassen und Sehen, **nicht** die Aufsicht), Eltern, das Kind selbst. Kein Vergleich unter Kindern, keine Rangliste |
| Drittland | [prüfen] |
| Löschfristen | mit den Lernenden: [Frist – Vorschlag 12 Monate nach Austritt]; Bescheinigungen auf Wunsch der Eltern vorher (`L-18`) |
| Maßnahmen | T-01 (Stammdaten), T-03 (Gruppenrechte `fortschritt.erfassen` nur Lehrkraft), T-09 |
| Schalter | `lernplattform` |
| Belege | `web/src/lib/rechte/gruppen.ts` (`NUR_LEHRKRAFT`), `web/src/lib/db/schema/lernen.ts`, Test `lernen.test.ts` |
| Offen | Rechtsgrundlage Art. 9 Abs. 2 lit. d: Rechtsberatung; DSFA (`dsfa-lernplattform.md`) |

### GP-07 Verwaltung der Einwilligungen

| Feld | Angabe |
| --- | --- |
| Zweck | Nachweis und Steuerung der Einwilligungen (Art. 7 Abs. 1), sofortige Wirkung des Widerrufs |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. c i. V. m. Art. 7 Abs. 1 DSGVO (Nachweispflicht); lit. f |
| Betroffene | Eltern, Lernende, Konten, Push-Abonnenten |
| Datenkategorien | Art (`lernplattform`, `kinderkonto`, `gruppenchat`, `push_kind`, `push`, `newsletter`, `personenfotos`, `chat_regeln`), Textversion mit SHA-256 des Wortlauts, Sprache, Haken „sorgeberechtigt und im Einvernehmen“, erteilende Person, Zeitpunkt, Widerruf |
| Besondere Kategorien | keine (Bezug zu GP-06) |
| Empfänger | Eltern (eigene), Bildungsverwaltung, Auftragsverarbeiter wie GP-01 |
| Drittland | [prüfen] |
| Löschfristen | Nachweis nach Widerruf bzw. Löschung: [Frist – Vorschlag bis zum Ablauf der Verjährung, 3 Jahre ab Jahresende] (`L-15`) |
| Maßnahmen | T-03, T-06, T-09 |
| Schalter | `konten`, `lernplattform`, `chat`, `push`, `newsletter` |
| Belege | `web/src/lib/db/schema/konten.ts` (`konto_einwilligung`), Test `chat.test.ts` (S-03) |
| Offen | `konto_einwilligung.lernende_id` hat `onDelete: cascade`: Mit den Lernenden verschwindet auch der Nachweis. Entscheidung D-14 |

### GP-08 Gruppenchat und Elternkanal

| Feld | Angabe |
| --- | --- |
| Zweck | moderierte Kommunikation in der Lerngruppe (Gruppenkanal: Lernende und Lehrkräfte; Elternkanal: Eltern und Lehrkräfte) |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. a DSGVO (Einwilligung; bei Kindern unter 16 durch die Sorgeberechtigten, Art. 8); Moderation: lit. f |
| Betroffene | Lernende ab 10, Eltern, Lehrkräfte |
| Datenkategorien | Nachricht (Text bis 500 Zeichen, **verschlüsselt**), Absender (Konto, Anzeigename Vorname + Initial), Zeit, Entfernt-Vermerk mit Grund, Stummschaltung (bis, von, Grund), Bestätigung der Regeln (Version, Zeit), Gelesen-Stand (Tabelle vorhanden, derzeit nicht verwendet, nie für andere sichtbar) |
| Besondere Kategorien | Inhalte können alles enthalten, auch Religiöses oder Gesundheitsbezogenes; Hinweis in den Regeln: keine persönlichen Daten teilen |
| Empfänger | Mitglieder des jeweiligen Kanals; Gruppenleitung (Mitlesen, Moderation); **nicht** Administration (Ausschluss `NIE_PER_ADMINISTRATION`) |
| Drittland | [prüfen] (Optional: Echtzeit-Signal ohne Inhalt, siehe GP-14) |
| Löschfristen | Nachrichten 90 Tage nach Senden, spätestens 30 Tage nach Gruppenende; entfernte Nachrichten wie Nachrichten (Text bleibt verschlüsselt bis dahin) (`L-22` bis `L-26`) |
| Maßnahmen | T-01, T-03, T-05, T-06, T-08, T-13; Kinderschutz S-01 bis S-18 (`dsfa-lernplattform.md` §5) |
| Schalter | `chat`, optional `echtzeit` |
| Belege | `web/src/lib/chat/{regeln,dienst,hashkette}.ts`, `web/src/lib/db/schema/chat.ts`, `web/src/server/actions/chat.ts`, Tests `chat.test.ts`, `chat-regeln.test.ts` |
| Offen | Lesen ohne Einwilligung (D-01); entfernte Nachrichten (D-03) |

### GP-09 Meldungen, Moderation und Moderationsprotokoll (Kinderschutz)

| Feld | Angabe |
| --- | --- |
| Zweck | Schutz der Kinder, Bearbeitung von Meldungen, Nachvollziehbarkeit der Moderation |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. f DSGVO (Schutz der Kinder); Meldungen an das Jugendamt nur nach gesetzlicher Grundlage `[prüfen: § 8a SGB VIII, § 4 KKG; Schutzkonzept]` |
| Betroffene | meldende Personen, gemeldete Personen, Kinder im Kontext |
| Datenkategorien | Meldung (Grund: beleidigung, bedrohung, unangemessen, spam, sonstiges; Freitext **verschlüsselt**; Kontext = gemeldete Nachricht ±10 **verschlüsselt**; meldende Person, Status, Bearbeiter, Zeiten), Moderationsprotokoll (Zeitpunkt, Kanal, Nachricht-Nr., Akteur, Aktion, Grund, Hash) |
| Besondere Kategorien | möglich (Inhalt des Kontexts) |
| Empfänger | Gruppenleitung (E-Mail ohne Inhalt; Einsicht), Rolle `kinderschutz` (Einsicht, Bearbeitung, Protokoll); jede Einsicht wird protokolliert |
| Drittland | [prüfen] |
| Löschfristen | erledigte Meldungen 1 Jahr nach Abschluss; offene Meldungen: [Höchstfrist – Entscheidung D-05]; Moderationsprotokoll: [Frist – Entscheidung D-04, Vorschlag 3 Jahre] (`L-24`, `L-25`) |
| Maßnahmen | T-01, T-03, T-07, T-08, T-13 |
| Schalter | `chat` |
| Belege | `dienst.ts` (`meldeNachricht`, `meldungsKontext`, `bearbeiteMeldung`, `protokolliereModeration`), `matrix.ts` (Rolle `kinderschutz`), Test `chat.test.ts` (S-07 bis S-11) |
| Offen | Meldungen gegen Gruppenleitungen erreichen alle Gruppenleitungen (D-02); Kinderschutz kann nicht gezielt entfernen oder pausieren, nur Notfall-Pause (D-02) |

### GP-10 Web Push

| Feld | Angabe |
| --- | --- |
| Zweck | Erinnerungen und Hinweise auf Wunsch der Person (Gebet, Ankündigung, Gruppe, Unterricht) |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG; Kinder unter 16: Einwilligung „Push für das Kind“ durch die Sorgeberechtigten |
| Betroffene | Besucher, Konten, Kinder |
| Datenkategorien | Push-Adresse des Browsers (**verschlüsselt**; Eindeutigkeit über HMAC), Schlüssel `p256dh` und `auth`, Sprache, Themen, Gebete, Vorlauf (Minuten), Einwilligungsversion, letzter Erfolg, Fehlerzähler, optional Konto-Verknüpfung; Einmal-Schlüssel gegen Doppelversand |
| Besondere Kategorien | keine; Nachrichten enthalten nie Namen oder Inhalte |
| Empfänger | **Push-Dienste der Browser** (Google, Mozilla, Apple, Microsoft): sehen Adresse, Zeitpunkt, Größe, IP des Servers, Kontaktadresse; Inhalt unlesbar (RFC 8291) |
| Drittland | **Ja** (USA): [Grundlage prüfen: Data Privacy Framework je Anbieter, Standardvertragsklauseln; Art. 49 Abs. 1 lit. a] |
| Löschfristen | bis Abschalten; 12 Monate ohne Erfolg; sofort bei 404/410 bzw. nach 5 Fehlern; Einmal-Schlüssel 3 Tage (`L-27`) |
| Maßnahmen | T-01, T-05, T-06, T-13; Nutzlast ohne Inhalt |
| Schalter | `push`, `push_gebet` |
| Belege | `web/src/lib/push/*`, `web/src/app/api/push/abo/route.ts`, ADR 0034, Tests `push.test.ts` |
| Offen | Kind-Push ohne `push_kind`-Prüfung im Abo-Weg (D-07); Einwilligungsversion nur aus dem deutschen Text (D-15); Push-Einwilligungstext und Konto-Verknüpfung (D-17) |

### GP-11 Newsletter

| Feld | Angabe |
| --- | --- |
| Zweck | Neuigkeiten per E-Mail auf Wunsch (Double-Opt-in) |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. a DSGVO; § 7 Abs. 2 Nr. 3 UWG `[prüfen]` |
| Betroffene | Abonnenten |
| Datenkategorien | E-Mail (**verschlüsselt**, HMAC), Sprache, Themen, Token-Hash, Einwilligungsversion, Zeiten von Eintragung, Bestätigung, Abbestellung |
| Besondere Kategorien | keine |
| Empfänger | [SMTP-Anbieter] (Auftragsverarbeiter) |
| Drittland | [prüfen] |
| Löschfristen | unbestätigte [Frist – Vorschlag 7 Tage]; abgemeldete: Nachweis [Frist – Vorschlag 3 Jahre] (`L-28`) |
| Maßnahmen | T-01, T-05, T-06 |
| Schalter | `newsletter` |
| Belege | `web/src/lib/db/schema/gemeinde.ts` (`newsletter_abo`, `newsletter_ausgabe`) |
| Offen | Löschroutine fehlt; Mail-Vorlage ohne Messpixel beim Bau prüfen |

### GP-12 Gebetszeiten „Mein Ort“ (Standort)

| Feld | Angabe |
| --- | --- |
| Zweck | Gebetszeiten und Qibla für den Ort der Besucherin oder des Besuchers berechnen |
| Rechtsgrundlage | keine Verarbeitung durch den Verantwortlichen; Zugriff auf den Standort nach Zustimmung im Browser (§ 25 Abs. 1 TDDDG); Merken: § 25 Abs. 2 Nr. 2 TDDDG |
| Betroffene | Besucher |
| Datenkategorien | Standort auf zwei Nachkommastellen gerundet, nur im Gerät; bei „Ort merken“ im Gerätespeicher (`igmg-gebetszeiten-ort`) |
| Besondere Kategorien | keine |
| Empfänger | **keine**; es gibt keine Übertragung an den Server und keine Geokodierung durch Dritte |
| Drittland | keines durch die Website; die Standortbestimmung selbst liegt beim Browser/Betriebssystem |
| Löschfristen | keine serverseitig; „Vergessen“ löscht den Gerätespeicher |
| Maßnahmen | T-09, T-12 (`geolocation=(self)` nur auf Gebetszeiten-Pfaden); E2E mit Netz-Abhörung |
| Schalter | keiner (öffentliche Funktion ohne Personendaten) |
| Belege | `MeinOrtRechner.tsx`, `web/src/lib/gebetszeiten/ort.ts`, ADR 0028, Tests `gebetszeiten-ort.test.ts`, `kopfzeilen-pfade.test.ts`, E2E `gebetszeiten-mein-ort.spec.ts` |
| Offen | `[prüfen: Einordnung Art. 4 Nr. 2]`; die Dokumentation dient dem Nachweis, dass keine Verarbeitung stattfindet |

### GP-13 Audio und Rezitationen

| Feld | Angabe |
| --- | --- |
| Zweck | Rezitationen abspielen (Player, Vers- und Wort-Hervorhebung); Aufnahmen herstellen und mit Versgrenzen abgleichen |
| Rechtsgrundlage | Stimme der Rezitierenden: Art. 6 Abs. 1 lit. a bzw. lit. b DSGVO (Vereinbarung über Rechte und Stimme) `[prüfen]`; Hörer: Art. 6 Abs. 1 lit. f (Auslieferung, siehe Hosting) |
| Betroffene | Rezitierende (Imam, Hafız, Hoca), Hörer |
| Datenkategorien | Audiodatei (Inhalts-Hash, Dauer, MIME), Name der Rezitierenden, Lizenz, Vereinbarung als Datei, Zeitmarken (Vers, Wort), Quelle der Zeitmarke; bei Hörern nur die Verbindungsdaten des Abrufs |
| Besondere Kategorien | keine; die Stimme ist personenbezogen, aber nicht biometrisch im Sinn von Art. 9, solange sie nicht zur Identifizierung dient |
| Empfänger | Vercel Blob (öffentlicher Speicher `audio`, Frankfurt), lokaler Medienspiegel; Hörer weltweit über die Website |
| Drittland | über Vercel: [prüfen] |
| Löschfristen | bis Widerruf bzw. Vertragsende; danach Entfernung binnen [Frist – Vorschlag 14 Tage]; Sicherungen rotieren nach 30 Tagen; **Spiegel nur von Hand** (`L-30`, `L-32`) |
| Maßnahmen | T-03 (`rezitation.bearbeiten`), T-12 (Mikrofon nur Verwaltung), Aktivierung nur mit hinterlegter Vereinbarung (Datenbankprüfung) |
| Schalter | `rezitation_<id>` je Rezitation |
| Belege | ADR 0029, `web/src/lib/db/schema/quran.ts` (`quran_rezitation`, `quran_audio`, `quran_verszeit`, `quran_wortzeit`) |
| Offen | Vereinbarung (`vereinbarung-rezitation.md`) unterschreiben (MN-03); Medienspiegel löscht nie (D-06) |

### GP-14 Lokaler Helfer-Server

| Feld | Angabe |
| --- | --- |
| Zweck | tägliche Sicherung, Medienspiegel, Takt, Überwachung, optional Echtzeit-Signal, Anzeige im Gebetsraum |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. f DSGVO (Verfügbarkeit, Integrität, Art. 32) |
| Betroffene | alle Personen, deren Daten in der Datenbank oder im Medienspeicher liegen |
| Datenkategorien | **Sicherung:** gesamte Datenbank als verschlüsselte Datei (`age`), Prüfsummen; **Spiegel:** Bilder, PDF, Audio samt Prüfsummen; **Takt und Überwachung:** keine Personendaten; **Echtzeit:** Signal „Kanal hat Neues“ und Token je Kanal (10 Minuten), keine Inhalte |
| Besondere Kategorien | in der Sicherung enthalten, nur als Chiffrat bzw. innerhalb der verschlüsselten Datei |
| Empfänger | Technik der Gemeinde ([Personen – Vorstand]); eigener Betrieb, kein Auftragsverarbeiter |
| Drittland | keines |
| Löschfristen | Sicherungen 30 Tage (Rotation); Wiederherstellungsprobe: Wegwerf-Datenbank wird nach der Probe gelöscht; Medienspiegel [Frist – Entscheidung D-06]; Container-Protokolle 3 × 5 MB (`L-33` bis `L-35`) |
| Maßnahmen | T-11; Sicherung mit Leserolle (nur `SELECT`); Zugang zu `.env` Modus 600; physischer Schutz [Raum, Schlüssel – Vorstand] |
| Schalter | `echtzeit` (nur das Signal) |
| Belege | `betrieb/lokal/LIESMICH.md`, `docker-compose.yml`, `sicherung/*`, `spiegel/spiegel.mjs`, ADR 0036 |
| Offen | Verwahrung des privaten Schlüssels (Vorstand); privater Schlüssel auf dem Server für die Probe (D-08); Wiederherstellung und bereits gelöschte Daten (D-09) |

### GP-15 Personenfotos und Medien mit Personenbezug

| Feld | Angabe |
| --- | --- |
| Zweck | Veröffentlichung von Fotos auf der Website |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. a DSGVO; §§ 22, 23 KUG `[prüfen]` |
| Betroffene | abgebildete Personen, Kinder (Einwilligung der Sorgeberechtigten) |
| Datenkategorien | Bild (EXIF und GPS werden beim Hochladen entfernt), Bildrechte-Angabe, Alt-Text, Einwilligungsvermerk (Art `personenfotos`) |
| Besondere Kategorien | möglich (religiöse Praxis auf Bildern) `[prüfen]` |
| Empfänger | Öffentlichkeit; Vercel Blob; lokaler Medienspiegel |
| Drittland | [prüfen] |
| Löschfristen | bis Widerruf; Papierkorb 30 Tage; Spiegel nur von Hand (`L-04`, `L-31`, `L-32`) |
| Maßnahmen | T-03 (`medium.hochladen`, `medium.loeschen`), Bildverarbeitung entfernt Metadaten |
| Schalter | keiner |
| Belege | `web/src/lib/medien/verarbeiten.ts`, `web/src/server/actions/medien.ts` |
| Offen | Haken „Einwilligung liegt vor“ (K-29) ist noch zu bauen |

### GP-16 Gemeinsame Hatim

| Feld | Angabe |
| --- | --- |
| Zweck | Abschnitte (Cüz) einer gemeinsamen Hatim übernehmen |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a DSGVO (religiöse Praxis) |
| Betroffene | Konten, die einen Abschnitt übernehmen |
| Datenkategorien | Konto-Verknüpfung je Cüz, Zeitpunkt der Übernahme und der Fertigmeldung; öffentlich nur Zahlen |
| Besondere Kategorien | **Ja** (religiöse Praxis) |
| Empfänger | Redaktion der Hatim (Rolle `redaktion`/`administration`: `hatim.bearbeiten`) |
| Drittland | [prüfen] |
| Löschfristen | mit dem Konto; Aufbewahrung der Hatim [Frist – Vorstand] |
| Maßnahmen | T-03, T-06, T-09 |
| Schalter | `hatim` |
| Belege | `web/src/lib/db/schema/gemeinde.ts` (`hatim_teil`) |
| Offen | Oberfläche noch nicht gebaut |

### GP-17 Weitere kontenbezogene Funktionen (Kür)

| Feld | Angabe |
| --- | --- |
| Zweck | Lesezeichen-Synchronisierung, Ehrenamt-Dienstplan, QR-Check-in, Hausaufgaben, Urkunden mit Prüfcode |
| Rechtsgrundlage | Art. 6 Abs. 1 lit. a oder b DSGVO je nach Funktion `[prüfen]` |
| Betroffene | Konten, Lernende, Ehrenamtliche |
| Datenkategorien | Lesezeichen (Sure, Vers), Dienst-Eintragungen, Check-in-Hash, Aufgabenstatus, Urkunden (Art, Titel, Prüfcode) |
| Besondere Kategorien | möglich (Lesezeichen, Urkunden zur religiösen Bildung) |
| Empfänger | je Funktion die zuständige Rolle |
| Drittland | [prüfen] |
| Löschfristen | mit dem Konto bzw. den Lernenden (Kaskade) |
| Maßnahmen | T-03, T-06 |
| Schalter | je Funktion; vor dem Einschalten Eintrag ergänzen |
| Belege | `web/src/lib/db/schema/{gemeinde,lernen}.ts` |
| Offen | Eintrag bei Einschalten aktualisieren |

## 5. Empfänger und Auftragsverarbeiter (Ergänzung zu Abschnitt 2 des Verzeichnisses)

| Dienst | Rolle | Daten | Drittland | Vertrag |
| --- | --- | --- | --- | --- |
| Push-Dienste der Browser (Google, Mozilla, Apple, Microsoft) | Empfänger, voraussichtlich eigene Verantwortliche des Browser-Dienstes `[prüfen]` | Push-Adresse, Zeitpunkt, Größe, IP des Servers; Inhalt verschlüsselt | Ja (USA) | kein Vertrag der Gemeinde möglich; Grundlage [prüfen] |
| Vercel Blob, öffentlicher Speicher `audio` | Auftragsverarbeiter (über Vercel) | Audiodateien, Pfade mit Inhalts-Hash | [prüfen] | wie Vercel, Abschnitt 2.1 des Verzeichnisses |
| Lokaler Server im Gemeindehaus | eigener Betrieb | Sicherung, Spiegel, Takt, Überwachung | keines | [Verpflichtung der Technik – T-14] |
| Centrifugo, Caddy (optional) | eigener Betrieb | Signal „Kanal hat Neues“ | keines | wie lokaler Server; `[prüfen: Hoster der Domain für DynDNS]` |
| DynDNS-Anbieter (nur für Echtzeit) | Auftragsverarbeiter `[prüfen]` | IP-Adresse des Gemeindehauses | [prüfen] | [prüfen] |

## 6. Offene Punkte

1. Entscheidungen D-01 bis D-17 aus `dsfa-lernplattform.md` §8 (Lesen nach Widerruf, Meldungen gegen Leitung, Löschroutinen, Medienspiegel, Schlüssel, Kind-Push).
2. Fristen mit „Vorschlag“ beschließen (Vorstand/DSB) und in `loeschkonzept.md` festschreiben.
3. T-14 (Verpflichtung der Ehrenamtlichen) und T-15 (Datenpannen-Verfahren) beschreiben.
4. DSFA bestätigen lassen; erst danach den Schalter `chat` einschalten.
5. Drittlandgrundlage der Push-Dienste belegen; Einwilligungstext der Push-Funktion prüfen (`datenschutz-v2-bausteine.md` Baustein 5).
6. Verarbeitungen GP-16 und GP-17 beim Einschalten der Funktionen vervollständigen.

## 7. Belege

- Code: Pfade je Tabelle. Pläne: `_gemeinde/AUFTRAG.md` §2.2 bis 2.9, §3.5, §3.6, §5. Entscheidungen: ADR 0026, 0027, 0028, 0029, 0034, 0035, 0036 in `web/docs/adr/`.
- Der lokale Server und seine Fristen: `betrieb/lokal/LIESMICH.md`. Betrieb und Schlüssel: `web/docs/BETRIEB.md`.
