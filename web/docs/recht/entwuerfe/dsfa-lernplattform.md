# Datenschutz-Folgenabschätzung: Lernplattform mit Gruppenchat und Push (Art. 35 DSGVO)

> **ENTWURF – vor Veröffentlichung durch Datenschutz/Recht prüfen (MENSCHEN MN-11).** Dieser Entwurf ist die fachliche Vorarbeit der Gemeinde-Plattform. Er ersetzt **nicht** die Stellungnahme der oder des Datenschutzbeauftragten (Art. 35 Abs. 2) und ist keine Rechtsberatung. Bis zur Bestätigung bleibt der Schalter `chat` in der Produktion **aus** (Cockpit-Sperre, ADR 0035). Alles in eckigen Klammern `[ ]` ist offen; `[prüfen]` ist nicht belegt.

| | |
| --- | --- |
| Verarbeitung | Lernplattform der Moscheekurse mit Konten, Anwesenheit, Fortschritt und Hifz, moderiertem Gruppen- und Elternkanal, Meldungen und Web Push |
| Verantwortlicher | [Name und Rechtsform – Vorstand], [Anschrift] |
| Datenschutzbeauftragte/r | [Datenschutzbeauftragte/r – Angaben von der Gemeinde] |
| Version, Stand | Entwurf 0.1, 13.10.2026 · Code-Stand: Branch `claude/trusting-lovelace-6nfolz`, Commit `bb8433d` |
| Beteiligte | [Vorstand], [Bildung], [Technik], [Ansprechperson Kinderschutz], [DSB] |
| Zugehörige Dokumente | `verarbeitungsverzeichnis-ergaenzung.md` (GP-01 bis GP-17), `datenschutz-v2-bausteine.md`, `einwilligungen.md`, `schutzkonzept-geruest.md`, `loeschkonzept.md` |

## 1. Anlass und Schwellenwertprüfung

**Warum eine DSFA.** Die Verarbeitung verbindet mehrere Merkmale, bei denen eine DSFA nach Art. 35 Abs. 1 und 3 DSGVO angezeigt ist oder vorsorglich durchgeführt wird:

1. **Kinder und Jugendliche** (10 bis 15 Jahre) als schutzbedürftige Betroffene; Kommunikation zwischen Kindern und Erwachsenen.
2. **Besondere Kategorien (Art. 9):** Teilnahme an religiöser Bildung, Fortschritt und Hifz-Prüfungen lassen Rückschlüsse auf die religiöse Überzeugung zu.
3. **Neue Technik:** Web Push über Browser-Dienste, Chat mit Moderation, lokaler Server.
4. **Mitlesen und Beobachten:** Lehrkräfte lesen im Gruppenkanal mit; Anwesenheit und Fortschritt werden erfasst (Gefahr von Leistungsdruck und Kontrolle).

**Ergebnis.** Es wird eine DSFA durchgeführt `[prüfen: Muss-Liste der Aufsichtsbehörde nach Art. 35 Abs. 4; Kriterien der Leitlinien des Europäischen Datenschutzausschusses: schutzbedürftige Betroffene, sensible Daten, neue Technologie]`. Ob die Verarbeitung „umfangreich“ im Sinn von Art. 35 Abs. 3 lit. b ist, wird dabei offen gelassen: Die Gemeinde verfährt vorsorglich.

**Geltungsbereich.** Die DSFA umfasst die Funktionen hinter den Schaltern `konten`, `lernplattform`, `chat`, `echtzeit` und `push`. Gruppenchat und Push sind die Teile mit dem höchsten Risiko; sie bleiben bis zur Freigabe aus.

## 2. Systematische Beschreibung der Verarbeitung (Art. 35 Abs. 7 lit. a)

### 2.1 Verarbeitungsvorgänge

| Nr. | Vorgang | Zweck | Daten (Auszug) | Zugriff |
| --- | --- | --- | --- | --- |
| V1 | Voranmeldung → Aufnahme der Lernenden, Einladung der Eltern | Kursplätze vergeben | Name, Geburtsdatum, Anschrift (verschlüsselt); Eltern-Kontakt | Bildung |
| V2 | Konten (Eltern, Lehrkraft, Schüler ab 16, Kinderzugang) | Zugang zu „Mein Bereich“ | E-Mail bzw. Benutzername, Passwort-Hash, Rollen, Sitzung | Person selbst, Verwaltung `gemeindekonto.*` |
| V3 | Termine, Anwesenheit, Fehlmeldungen | Unterricht organisieren | Status je Termin, Notiz (verschlüsselt), Fehlmeldung | Gruppenleitung, Eltern (Kind), Kind (selbst) |
| V4 | Fortschritt und Hifz | Lernstand dokumentieren | Stufe, Status, Sure/Verse, Bewertung 1 bis 5 | Lehrkraft (Erfassen), Eltern (Kind), Kind (selbst) |
| V5 | Einwilligungen | Nachweis, Widerruf | Art, Textversion (SHA-256), Zeit, erteilende Person | Eltern, Bildung |
| V6 | Gruppenchat, Elternkanal | Kommunikation in der Gruppe | Text ≤ 500 Zeichen (verschlüsselt), Absender | Kanalmitglieder, Gruppenleitung |
| V7 | Meldung, Moderation, Protokoll | Kinderschutz | Meldung, Kontext ±10 (verschlüsselt), Protokollzeilen | Gruppenleitung, Rolle `kinderschutz` |
| V8 | Web Push | Erinnerungen auf Wunsch | Push-Adresse (verschlüsselt), Themen | Server, Push-Dienst des Browsers |
| V9 | Sicherung, Spiegel, Takt (lokaler Server) | Verfügbarkeit | verschlüsselte Sicherung, Medien | Technik |

### 2.2 Betroffene

Kinder und Jugendliche in den Kursen (Kinderkonto unter 16 Jahren; Mindestalter im Chat 10), ihre Eltern bzw. Sorgeberechtigten, Lehrkräfte und Aufsichtspersonen, Ansprechpersonen Kinderschutz, die Bildungsverwaltung. Geschätzte Zahl: [Zahl der Lernenden, Gruppen und Lehrkräfte – Bildung].

### 2.3 Datenfluss (vereinfacht)

```
Kind / Eltern / Lehrkraft  --TLS-->  Vercel (Frankfurt, fra1): Website + Funktionen
                                         |-- Neon (Frankfurt): Datenbank; schutzwürdige Felder AES-256-GCM
                                         |-- Vercel Blob: Medien, Audio (öffentlich, ohne Personendaten der Kinder)
                                         |-- SMTP-Anbieter: Mails ohne Inhalt
                                         `-- Push-Dienst des Browsers (Google/Mozilla/Apple/Microsoft): verschlüsselte Nachricht ohne Inhalt
Lokaler Server (Gemeindehaus):  Takt (kein Personenbezug) -> Vercel;  Sicherung (verschlüsselt) <- Neon (Leserolle);
                                Medienspiegel <- Blob;  Echtzeit-Signal (nur "Kanal hat Neues") -> Browser
```

### 2.4 Technik und Orte

- Anwendung: Next.js auf Vercel (Region `fra1`), Datenbank PostgreSQL bei Neon (Ziel Frankfurt), Medien in Vercel Blob (Ziel Frankfurt) `[prüfen: Regionen, siehe Verzeichnis 2.1 bis 2.3]`.
- Anmeldung mit Better Auth; Benutzernamen für Kinder; Zwei-Faktor (TOTP) Pflicht für Verwaltung und Lehrkräfte.
- Chat: Abruf mit `GET /api/mein/chat/[kanal]?nach=<id>` ohne Cache; optional Signal über Centrifugo auf dem lokalen Server.
- Lokaler Server im Gemeindehaus [Ort – Vorstand] mit Docker Compose (`betrieb/lokal/`).

### 2.5 Rollen und Rechte

| Wer | Darf |
| --- | --- |
| Kind (Schüler) | eigene Daten lesen; im Gruppenkanal lesen/schreiben (unter Bedingungen S-03 bis S-06, S-15); melden |
| Eltern | Daten des eigenen Kindes lesen; Fehlmeldung; Elternkanal; Einwilligungen und Kinderzugang verwalten; melden |
| Lehrkraft (Gruppenleitung) | Anwesenheit, Fortschritt, Hifz der eigenen Gruppe; Gruppen- und Elternkanal lesen/schreiben; moderieren; Meldungen der Gruppe |
| Aufsicht (Gruppenleitung) | Anwesenheit; moderieren; **kein** Fortschritt |
| Bildung | Gruppen, Lernende, Lehrplan, Aufnahme; **keine** Chats |
| `kinderschutz` | Meldungen lesen und bearbeiten (Kontext ±10), Moderationsprotokoll lesen, Notfall-Pause; **kein** gezieltes Entfernen und kein Pausieren einzelner Kanäle |
| `administration` | alles außer `meldung.chat.*` und `moderationsprotokoll.lesen` (Ausschlussliste `NIE_PER_ADMINISTRATION`); Notfall-Pause erlaubt |
| `leitung` | Cockpit lesen, ändern nichts |

Belege: `web/src/lib/rechte/matrix.ts`, `gruppen.ts`; Tests `web/tests/unit/rechte/*`, `web/tests/integration/chat.test.ts`.

### 2.6 Speicherfristen (Auszug; Gesamtübersicht `loeschkonzept.md`)

Chat-Nachrichten 90 Tage, spätestens 30 Tage nach Gruppenende; Meldungen 1 Jahr nach Abschluss; Push-Abos bis Abschalten, 12 Monate ohne Erfolg; Konto 30 Tage nach Löschantrag; Lernende [Frist – Vorschlag 12 Monate nach Austritt]; Sicherungen 30 Tage.

### 2.7 Freigabe

Funktionsschalter `konten`, `lernplattform`, `chat`, `echtzeit`, `push` sind in der Produktion **aus**. Das Cockpit sperrt `chat`, solange DSFA, Schutzkonzept und mindestens zwei Erwachsene je Gruppe fehlen (ADR 0035); `push` nur mit gesetztem VAPID-Schlüssel.

## 3. Notwendigkeit und Verhältnismäßigkeit (Art. 35 Abs. 7 lit. b)

### 3.1 Zweck und Alternativen

| Zweck | Alternative | Warum die Plattform |
| --- | --- | --- |
| Anwesenheit und Fortschritt | Papierliste, Tabelle bei der Lehrkraft | Papier und private Tabellen sind schwer zu schützen und zu löschen; die Plattform hat Rechte, Verschlüsselung, Fristen |
| Elternkontakt | E-Mail-Verteiler, Messenger der Lehrkraft | privater Messenger: kein Schutz, keine Fristen, keine Moderation; **das ist das Risiko, das die Plattform vermeiden soll** |
| Gruppenchat der Kinder | gar kein Chat; Kinder chatten ohnehin in privaten Gruppen | der moderierte Chat ist die geschützte Alternative zu privaten Gruppen; er ist optional und einzeln widerrufbar |
| Push | Seite öffnen und nachsehen, E-Mail | Push ist freiwillig und ohne Inhalt; Mail ist der Rückfall |

Der Chat kann ganz **ausgeschaltet** bleiben (`chatModus: aus`, Schalter `chat`); die Lernplattform funktioniert ohne ihn.

### 3.2 Rechtsgrundlagen

- Anmeldung, Gruppen, Termine, Anwesenheit: Art. 6 Abs. 1 lit. b DSGVO.
- Lernplattform mit Konto, Fortschritt, Hifz, Kinderkonto, Gruppenchat, Push: **Einwilligung** (Art. 6 Abs. 1 lit. a, Art. 9 Abs. 2 lit. a); bei Kindern unter 16 durch die Sorgeberechtigten (Art. 8); einzeln und widerrufbar (Art. 7).
- Art. 9 Abs. 2 lit. d ergänzend `[prüfen: Rechtsberatung]`.
- Moderation, Meldungen, Protokoll: Art. 6 Abs. 1 lit. f (Schutz der Kinder); Interessenabwägung: [durch DSB zu bestätigen].
- Keine Kopplung (Art. 7 Abs. 4): Die Teilnahme am Unterricht hängt nicht von Plattform, Chat oder Push ab.

### 3.3 Datenminimierung und Speicherbegrenzung

Anzeigename nur Vorname + Initial; im Klartext nur der Tag des 16. Geburtstags; keine IP-Adressen in Sitzungen; keine Lesebestätigungen, keine Online-Anzeige; keine Bilder oder Dateien im Chat; keine Ranglisten; Notizen höchstens 500 Zeichen; Chat-Texte 90 Tage; Standort nie am Server; keine Tracker.

### 3.4 Transparenz und Betroffenenrechte

Datenschutzerklärung v2 (`datenschutz-v2-bausteine.md`) mit kindgerechter Fassung (Art. 12 Abs. 1); Chat-Regeln für Kinder (`chatRegeln` in `web/messages/bereiche/chat.json`); Einwilligungen mit Widerruf an der gleichen Stelle (`einwilligungen.md`); Auskunft/Export und Löschantrag in „Mein Bereich“; Eltern üben die Rechte der Kinder aus, die Jugendlichen ab 16 selbst.

### 3.5 Auftragsverarbeitung und Drittland

Auftragsverarbeiter: Vercel, Neon, SMTP-Anbieter (Verzeichnis, Abschnitt 2). Push-Dienste der Browser: Empfänger mit Drittlandbezug (USA), die Nachrichten sind verschlüsselt und ohne Inhalt; Grundlage [prüfen]. Der lokale Server ist ein eigener Betrieb.

### 3.6 Kinderrechte

Erwägungsgrund 38 DSGVO verlangt besonderen Schutz von Kindern bei Marketing, Profilen und Diensten; hier: keine Werbung, kein Profiling, keine Verhaltensauswertung für Dritte. Die Plattform verlangt altersgerechte Texte und beteiligt die Kinder über Regeln und Meldeknopf. Barrierefreiheit der Texte und Dialoge (Tastatur, Bildschirmleser, Kontrast): `/barrierefreiheit` `[prüfen: Anwendbarkeit des BFSG auf die Gemeinde; unabhängig davon Ziel WCAG 2.1 AA]`.

## 4. Risikoanalyse (Art. 35 Abs. 7 lit. c)

Skala: gering, mittel, hoch (Einschätzung dieses Entwurfs; durch die DSB zu bestätigen). „Vorher“ = ohne die Maßnahmen von §5 und §6; „Rest“ = nach den Maßnahmen, wie sie im Code belegt sind. Schutzgüter: Rechte und Freiheiten der Kinder, insbesondere körperliche und seelische Unversehrtheit, Privatsphäre, Religionsfreiheit.

| Nr. | Risiko | Vorher (Schwere/Wahrsch.) | Maßnahmen | Rest |
| --- | --- | --- | --- | --- |
| R-01 | **Anbahnung durch Erwachsene (Cybergrooming):** Kontaktaufnahme zu Kindern, Wechsel in private Kanäle | hoch / mittel | S-01, S-02, S-05, S-06, S-09, S-11, S-14, Verhaltenskodex, Führungszeugnis, Schulung (§6) | mittel (restlich durch Erwachsene mit Gruppenzugang; organisatorisch zu mindern) |
| R-02 | **Mobbing und Beleidigung unter Kindern** | mittel / hoch | S-04, S-06, S-07, S-09, S-13, S-15, Mitlesen | gering |
| R-03 | **Preisgabe persönlicher Daten** (Adresse, Telefon, Schule) durch Kinder, Verleitung | hoch / mittel | S-05 (nur Text), S-14 (Vorname + Initial), S-15 (Regel), Mitlesen, Schulung | mittel |
| R-04 | **Schädliche oder unangemessene Inhalte und Links** | mittel / mittel | S-05 (nur Text, Links nur als Text), S-07, S-09 | gering |
| R-05 | **Unbefugter Zugriff auf Chats** (Administration, Technik, Angreifer) | hoch / gering | S-11, S-16, T-01, T-03, T-04 | gering bis mittel (Technik mit Schlüsselzugriff in der Hosting-Umgebung, D-08) |
| R-06 | **Offenlegung der religiösen Zugehörigkeit oder Teilnahme** (Datenleck, Fehlsicht) | hoch / gering | Gruppenrechte, T-01, T-03, Funktionsschalter, Sicherung verschlüsselt | gering |
| R-07 | **Unwirksame Einwilligung** (nur ein Elternteil; Kind gibt sich als Elternteil aus; Kind legt Konto selbst an) | mittel / mittel | S-03; Einladung der Eltern aus der Voranmeldung; Haken „im Einvernehmen“; getrennte Einwilligungen | mittel (Nachweis des Einvernehmens ist nur ein Haken, D-12) |
| R-08 | **Überwachung und Leistungsdruck** (Mitlesen, Anwesenheit, Fortschritt, Vergleich) | mittel / mittel | keine Ranglisten, keine Punktevergleiche, Fortschritt nur für Lehrkraft/Eltern/Kind, Transparenz (Regel 6), Mitlesen nur im Gruppenkanal | gering |
| R-09 | **Falsche Sichtbarkeit** (Eltern sehen fremdes Kind, Gruppenwechsel) | hoch / gering | Gruppenrechte `darfInGruppe`, Tests der Gruppenisolation | gering |
| R-10 | **Zu lange Speicherung, Löschung unwirksam** (Sicherungen, Spiegel, Kaskaden) | mittel / mittel | S-12, Löschlauf, Rotation 30 Tage | mittel (Medienspiegel D-06; Wiederherstellung D-09; Fehlen von Löschroutinen D-04, D-10, D-13) |
| R-11 | **Missbrauch durch Insider** (Lehrkraft, Aufsicht, Ehrenamtliche): Mitlesen, Kontext-Einsicht, Meldung gegen die eigene Person | hoch / gering | S-02 (zwei Erwachsene), S-10, S-11 (Einsicht protokolliert), T-04 (Zwei-Faktor), Verhaltenskodex | mittel (**Meldung erreicht die gemeldete Lehrkraft**, D-02) |
| R-12 | **Ausfall, Verlust, Manipulation** (Schlüsselverlust, Ausfall Vercel, Manipulation des Protokolls) | mittel / gering | T-08 (Hash-Kette), T-11 (Sicherung, Probe), Schlüsselverwahrung | gering bis mittel (Verlust von `EINGANG_SCHLUESSEL` macht verschlüsselte Daten unlesbar) |
| R-13 | **Push:** Mitlesen durch Dritte am Bildschirm, Metadaten bei US-Diensten | mittel / mittel | Nutzlast ohne Inhalt und Namen (S-16), Opt-in, nur bekannte Push-Dienste, Kind nur mit Elternfreigabe | mittel (Kind-Push noch nicht erzwungen, D-07; Drittland, D-17) |
| R-14 | **Kontoübernahme** (Passwortweitergabe unter Kindern, schwache Passwörter) | mittel / mittel | Passwort ≥ 12 Zeichen, Ratenbegrenzung, Kind-Sitzung 12 h, Eltern setzen zurück, S-18 | gering bis mittel |
| R-15 | **Standort** (Missbrauch von Koordinaten) | mittel / gering | Standort nur im Gerät, gerundet, nie ins Netz | gering |
| R-16 | **Gelöschte Daten kehren zurück** (nach Wiederherstellung einer Sicherung) | mittel / gering | Rotation 30 Tage; Verfahren nach Wiederherstellung (D-09) | mittel, bis D-09 entschieden ist |
| R-17 | **Eltern untereinander** (Elternkanal: Namen und Äußerungen sichtbar) | gering / mittel | Vorname + Initial, Regeln, Moderation, Elternkanal nur mit Einwilligung zur Nutzung | gering |
| R-18 | **Gemeinsam genutzte Geräte** (Familien-PC, Gemeinde-Computer): Sitzungen und Gerätespeicher | mittel / mittel | Sitzung des Kindes 12 h, Abmelden-Knopf, Hinweis in den Regeln, keine Daten im Gerätespeicher außer Auswahl | gering bis mittel |

## 5. Maßnahmen zum Kinderschutz S-01 bis S-18 (Verweis auf Code und Tests)

Status: **belegt** = Funktion und Test vorhanden; **teilweise** = Funktion vorhanden, Oberfläche oder Prüfung offen; **offen**. Pfade unter `web/`. Tests: `tests/integration/chat.test.ts` (PGlite), `tests/unit/chat-regeln.test.ts`, `tests/unit/rechte/*`.

| Nr. | Maßnahme | Umsetzung im Code | Beleg (Test) | Status |
| --- | --- | --- | --- | --- |
| S-01 | Nur Gruppen- und Elternkanal; keine Direktnachrichten, keine eigenen Gruppen | `src/lib/db/schema/chat.ts` (`chat_kanal` eindeutig je Gruppe und Art; keine Tabelle für Direktnachrichten); `src/lib/chat/dienst.ts` (`kanaeleDerGruppe`); `src/lib/rechte/gruppen.ts` | „genau ein Gruppen- und ein Elternkanal je Gruppe“; „Kind schreibt in den Gruppenkanal, liest den Elternkanal nicht …“ | belegt |
| S-02 | Kanal nur mit mindestens zwei Erwachsenen aktiv | `MIN_ERWACHSENE` in `regeln.ts`; `ladeKanal` zählt `gruppen_leitung`; `schreibGrund` → `zuWenigeErwachsene` | „S-02: mit nur einer erwachsenen Leitung ist der Kanal zu“ | belegt; Anlage-Prüfung in der Gruppenverwaltung (H-L01) und Cockpit-Sperre offen |
| S-03 | Kinder unter 16 nur mit Elterneinwilligung; Widerruf wirkt sofort | `schreibLage` prüft `konto_einwilligung` (`gruppenchat`, nicht widerrufen) bei **jeder** Nachricht | „S-03: Widerruf der Elterneinwilligung wirkt sofort“ | teilweise: gilt fürs **Schreiben**; **Lesen** bleibt erlaubt (D-01) |
| S-04 | Mindestalter je Gruppe, nie unter 10; keine Kindergartengruppen | `MINDESTALTER_UNTERGRENZE = 10`, `alterAus`, `schreibGrund` → `zuJung` | „S-04: unter dem Mindestalter nur lesen“; „Mindestalter nie unter 10“ | belegt (Lesen unter dem Mindestalter ist gewollt) |
| S-05 | Nur Text bis 500 Zeichen; keine Bilder oder Dateien; Links nur als Text | `bereinigeText`, `pruefeText`, `MAX_ZEICHEN`; Prüfung der verschlüsselten Länge in der Datenbank (`chat_nachricht_laenge`); keine Tabelle für Anhänge | „S-05: nur Text bis 500 Zeichen, Steuer- und Richtungszeichen entfernt“; „zu lang oder leer wird abgewiesen“ | belegt |
| S-06 | Öffnungszeiten 08–20 Uhr (je Gruppe einstellbar), außerhalb nur lesen | `imFenster`, `gruppe.chat_von`/`chat_bis` (Standard 08:00/20:00); Leitung darf außerhalb schreiben | „S-06: Öffnungszeiten, auch über Mitternacht“; „außerhalb der Öffnungszeiten nur lesen – Leitung darf schreiben“ | belegt |
| S-07 | Melden in zwei Schritten, mit Hilfehinweis | Dienst `meldeNachricht` (Grund, Freitext, Kontext); Texte `chatRegeln.melden` und `chatRegeln.hilfe` (Nummer gegen Kummer 116 111) | „S-07/S-08: Melden sichert ±10 Nachrichten verschlüsselt“ | teilweise: Dienst und Texte belegt, **Oberfläche (H-C01) offen** |
| S-08 | Meldungen an Lehrkräfte und Rolle `kinderschutz`; Mail ohne Inhalt | `src/server/actions/chat.ts` (`meldeChatNachricht`: Mail-Ausgang nur mit Art und Pfad); `leitungsAdressen` | Dienstebene getestet; Mail-Weg der Action [prüfen: Test ergänzen] | teilweise; siehe D-02 (alle Gruppenleitungen) |
| S-09 | Entfernen, Stummschalten, Pausieren, Mitglied entfernen – immer mit Grund | `entferneNachricht`, `stummschalten`, `setzeKanalPause` (Grund 3 bis 300 Zeichen, Protokollzeile in derselben Transaktion) | „S-09: Stummschalten nur durch Leitung, mit Grund“; „S-09: Entfernen hinterlässt Platzhalter“ | teilweise: **„Mitglied entfernen“** (Aktion `mitglied_entfernt` im Schema) hat im Dienst noch keine Funktion [prüfen] |
| S-10 | Unveränderliches Moderationsprotokoll mit Hash-Kette | Trigger `moderationsprotokoll_schutz` (Migration `0009`); `src/lib/chat/hashkette.ts`; Sperre `pg_advisory_xact_lock` | „S-10: Protokoll unveränderlich (Trigger) und Kette intakt“; „erkennt Änderung, Lücke und Austausch“ | belegt; Prüfung der Kette im Cockpit [prüfen] |
| S-11 | Administration liest keine Chats; `kinderschutz` sieht nur den Meldekontext (±10), mit Audit | `NIE_PER_ADMINISTRATION` in `matrix.ts`; `meldungsKontext` protokolliert `kontext_eingesehen` | „Administration hat kein Leserecht auf Chats und Meldungen“; „S-11: Kontext lesen protokolliert die Einsicht“ | belegt; Oberfläche (H-C02) offen |
| S-12 | Nachrichten 90 Tage, spätestens 30 Tage nach Gruppenende; Meldungen 1 Jahr | `chatLoeschlauf` in `dienst.ts`; Route `/api/wartung/loeschfristen` | „Nachrichten nach 90 Tagen und 30 Tage nach Gruppenende“ | teilweise: D-03, D-04, D-05 |
| S-13 | Rate 10 pro Minute und 200 pro Tag | `RATE_MINUTE`, `RATE_TAG`, `rateUeberschritten` | „S-13: höchstens 10 Nachrichten je Minute“ | belegt |
| S-14 | Keine Lesebestätigungen, keine Online-Anzeige; Name = Vorname + Initial | `chatName`; `ChatNachricht` ohne Lesestatus; `chat_gelesen` vorhanden, aber unbenutzt | „Abruf: Text entschlüsselt, Name Vorname + Initial, keine Lesebestätigung“; „S-14: Vorname + Initial“ | belegt |
| S-15 | Kindgerechte Regeln bestätigen | `REGELN_VERSION`, `bestaetigeRegeln`, `schreibGrund` → `regelnFehlen`; Texte `chatRegeln` (de/tr/en) | „S-15: ohne bestätigte Regeln kein Schreiben“ | teilweise: Texte geliefert, Oberfläche (H-C01) offen; bei Textänderung `REGELN_VERSION` erhöhen |
| S-16 | Text verschlüsselt; nie in Push, Mail oder Logs | `verschluessele`/`entschluessele` (AES-256-GCM); Push-Nutzlast nur Art und Pfad (`senden.ts`); Mail nur Art und Pfad | „Text liegt nur verschlüsselt in der Datenbank (S-16)“; `push.test.ts` (Nutzlast) | belegt |
| S-17 | Notfall-Pause für alle Chats | `setzeNotfallpause`, `notfallpauseAktiv` (immer frisch aus der Datenbank); Recht `chat.notfallpause` | „S-17: Notfall-Pause sperrt alle Kanäle sofort, auch für die Leitung“ | belegt |
| S-18 | Sperren beendet alle Sitzungen sofort | `kontoSperren` (`src/server/actions/benutzer.ts`) setzt `gesperrt_am`; `ladeKonto` verweigert gesperrte Konten | `tests/integration/verwaltung-benutzer.test.ts` „sperren: Sitzungen enden …“ | belegt für Konten der Verwaltung; für Gemeinde-Konten Oberfläche (`gemeindekonto.bearbeiten`) offen |

## 6. Weitere Maßnahmen

### 6.1 Technisch (siehe Verzeichnis, Abschnitt 3)

T-01 Verschlüsselung, T-03 Rechte, T-04 Zwei-Faktor und Sitzungsgrenzen, T-05 Ratenbegrenzung, T-06 Funktionsschalter, T-08 Hash-Kette, T-11 Sicherung, T-12 Kopfzeilen. Zusätzlich Gruppenisolation (Test `lernen.test.ts`) und Push ohne Inhalt.

### 6.2 Organisatorisch (Schutzkonzept, `schutzkonzept-geruest.md`)

| Nr. | Maßnahme | Wer | Stand |
| --- | --- | --- | --- |
| O-01 | Schutzkonzept beschließen, zwei Ansprechpersonen Kinderschutz benennen | Vorstand (MN-10) | offen |
| O-02 | Erweitertes Führungszeugnis aller Lehrkräfte, Aufsichten und Ansprechpersonen; Einsichtsvermerk | Vorstand | offen |
| O-03 | Verhaltenskodex im digitalen Raum unterschreiben lassen | Bildung | offen |
| O-04 | Schulung vor Freischaltung des Lehrkraft-Kontos, danach [Intervall] | Kinderschutz | offen |
| O-05 | Interventionsplan und Dokumentation (Fallprotokoll außerhalb des Chats) | Kinderschutz | Gerüst vorhanden |
| O-06 | Elterninformation (Elternabend) und Einwilligungsverfahren | Bildung | offen |
| O-07 | Verpflichtung der Ehrenamtlichen auf Vertraulichkeit (T-14); Datenpannenverfahren (T-15) | Vorstand, DSB | offen |
| O-08 | Hilfenummern und Meldewege veröffentlichen (Nummer gegen Kummer 116 111 ist öffentlich; weitere [Platzhalter]) | Vorstand | teilweise (`chatRegeln.hilfe`) |
| O-09 | Aufnahme in das Verarbeitungsverzeichnis; Datenschutzerklärung v2 veröffentlichen | DSB | Entwurf vorhanden |
| O-10 | Test auf echten Geräten (iOS, Android) vor Einschalten (MN-19) | Technik | offen |

## 7. Restrisiko und Bewertung

**Ergebnis dieses Entwurfs.** Nach den Maßnahmen im Code bleibt das Restrisiko für die Lernplattform ohne Chat **gering bis mittel** (Schwerpunkte: Art. 9, Löschroutinen, Einwilligungsnachweis). Für den Gruppenchat und Push bleibt es **mittel**; es kann auf **gering** sinken, wenn die Bedingungen B-1 bis B-8 erfüllt sind. Ein **hohes** Restrisiko, das eine vorherige Konsultation der Aufsichtsbehörde (Art. 36) auslösen würde, sieht der Entwurf bei Erfüllung der Bedingungen nicht `[prüfen: DSB entscheidet]`.

**Bedingungen für das Einschalten von `chat`:**

| Nr. | Bedingung |
| --- | --- |
| B-1 | Schutzkonzept beschlossen, Ansprechpersonen benannt (MN-10) |
| B-2 | Jede Gruppe hat mindestens zwei Erwachsene mit erweitertem Führungszeugnis, Schulung und unterschriebenem Verhaltenskodex |
| B-3 | Entscheidungen D-01 bis D-09 getroffen und umgesetzt |
| B-4 | Einwilligungstexte (`einwilligungen.md`) und Datenschutzerklärung v2 freigegeben und veröffentlicht |
| B-5 | Kindgerechte Chat-Regeln und Melden-Oberfläche vorhanden und mit Kindern probegelesen |
| B-6 | Eltern informiert (Elternabend, Elternbrief) |
| B-7 | Test auf echten Geräten (MN-19); Sichtprüfung der Chat-Oberfläche |
| B-8 | Diese DSFA durch die DSB bestätigt |

**Bedingungen für `push`:** VAPID-Schlüssel gesetzt (MN-17), Drittlandgrundlage der Push-Dienste belegt (D-17), Kind-Push nur mit `push_kind` (D-07), Einwilligungstext geprüft.

**Überprüfung.** Mindestens jährlich und bei jeder wesentlichen Änderung (Art. 35 Abs. 11): neue Kanäle, Bilder im Chat, neue Rollen, Echtzeit, Wechsel des Hosters.

## 8. Offene Entscheidungen

| Nr. | Frage | Befund im Code | Vorschlag des Entwurfs | Wer entscheidet |
| --- | --- | --- | --- | --- |
| D-01 | Dürfen Kinder im Gruppenkanal **lesen**, wenn die Einwilligung fehlt oder widerrufen wurde? | `ladeNachrichten` prüft nur das Gruppenrecht; `schreibLage` sperrt nur das Schreiben (Test S-03) | Lesen **ebenfalls sperren**, solange keine gültige Einwilligung „Gruppenchat“ vorliegt (Kinder unter 16) | DSB, Vorstand |
| D-02 | Meldung gegen eine Lehrkraft oder Aufsicht | `meldeChatNachricht` schickt die Hinweis-Mail an **alle** Gruppenleitungen und an `kinderschutz`; `kinderschutz` kann nur die Notfall-Pause setzen, nicht gezielt entfernen, nicht pausieren | Meldegrund „Verhalten einer Aufsichtsperson“ nur an `kinderschutz`; Rolle `kinderschutz` darf Kanal pausieren, Nachrichten entfernen und Mitglieder sperren | Kinderschutz, Technik |
| D-03 | Entfernte Nachrichten | `entferneNachricht` setzt nur `entfernt_am`; das Chiffrat bleibt bis zum Löschlauf | Chiffrat sofort überschreiben, außer die Nachricht gehört zu einer offenen Meldung | DSB, Technik |
| D-04 | Moderationsprotokoll: Frist und Löschroutine – **umgesetzt 13.10.:** Löschlauf nach 3 Jahren mit Kettenanker (`src/lib/loeschen/gemeinde.ts`) | Trigger erlaubt Löschen nur im Löschlauf (`igmg.loeschlauf = '1'`); keine Routine setzt das | 3 Jahre ab Eintrag; Löschlauf ergänzen | Vorstand, DSB |
| D-05 | Höchstfrist offener Meldungen – **umgesetzt 13.10.:** Löschung nach 12 Monaten, Hinweis im Startklar-Cockpit ab 11 Monaten | `loeschen_ab` wird erst bei `erledigt` gesetzt; offene Meldungen bleiben unbegrenzt | Höchstfrist 12 Monate nach Eingang, davor Erinnerung an `kinderschutz` | Kinderschutz, DSB |
| D-06 | Medienspiegel löscht nie – **umgesetzt 13.10.:** Löschabgleich mit Marke und 30 Tagen Frist | `betrieb/lokal/spiegel/spiegel.mjs` (`loeschAbgleich`; Schutz bei leerer Blob-Liste) | Löschen im Spiegel nach 30 Tagen, wenn die Datei in Blob nicht mehr existiert; bis dahin Handverfahren bei Widerruf | Technik, DSB |
| D-07 | Push für Kinder nur mit Elternfreigabe | `api/push/abo/route.ts` kennt nur „mit Konto/ohne Konto“; `push_kind` wird nicht geprüft | Für Kinderkonten Themen `chat` und `unterricht` nur mit gültiger Einwilligung `push_kind`; sonst Abo abweisen | Technik |
| D-08 | Privater age-Schlüssel auf dem lokalen Server (für die monatliche Probe) | `docker-compose.yml`: Volume `./schluessel:/schluessel:ro`, `probe.sh` | Schlüssel **nicht** auf dem Server; Probe manuell durch den Vorstand oder mit separatem Test-Schlüsselpaar und Test-Sicherung | Vorstand, Technik |
| D-09 | Gelöschte Daten nach einer Wiederherstellung | keine Löschprotokoll-Regel | Nach jeder Wiederherstellung sofort Löschlauf und alle Löschanträge und Widerrufe seit dem Sicherungsdatum erneut anwenden; Liste führen | Technik, DSB |
| D-10 | Frist für Lernende, Anwesenheit, Fortschritt, Hifz, Fehlmeldungen nach Austritt – **umgesetzt 13.10.:** Löschlauf löscht Lernende ab `loeschen_ab` (beim Austritt +12 Monate) | `lernende.loeschen_ab` vorhanden, keine Routine | 12 Monate nach Austritt; Bescheinigung vorher auf Wunsch | Vorstand, DSB |
| D-11 | Folge, wenn am 16. Geburtstag die eigene Einwilligung binnen 30 Tagen fehlt | im Plan vorgesehen (Cron), im Code dieses Standes nicht umgesetzt | Funktionen Chat und Push pausieren, Lesen der eigenen Daten bleibt; nach [60] Tagen Hinweis an Eltern | Vorstand, DSB |
| D-12 | Nachweis von Sorgeberechtigung und Einvernehmen | Haken `einvernehmen_bestaetigt`, Einladung per E-Mail an Eltern aus der Voranmeldung | Haken genügt mit Hinweis; bei Zweifel Rückfrage durch Bildung; kein Ausweis-Upload | DSB |
| D-13 | Löschroutinen für Newsletter und nicht zustellbare Mails – **teilweise umgesetzt 13.10.:** nicht zustellbare Mails nach 30 Tagen; Newsletter mit dem Newsletter-Paket | `loescheAbgelaufene` löscht nur versendete Mails; Newsletter ohne Routine | Routinen ergänzen (siehe Löschkonzept L-02, L-28) | Technik |
| D-14 | Einwilligungsnachweis nach Löschung der Lernenden | `konto_einwilligung.lernende_id` mit `onDelete: cascade` | Nachweis (ohne Namen) bis zum Ablauf der Verjährung aufbewahren (3 Jahre ab Jahresende) | DSB |
| D-15 | Einwilligungsversion je Sprache | `speichereAbo` bildet die Version aus dem deutschen Text | Version aus dem tatsächlich angezeigten Text der Sprache bilden | Technik |
| D-16 | Fristen für Audit-Protokoll, Server-Protokolle und inaktive Konten – **teilweise umgesetzt 13.10.:** Audit 12 Monate; inaktive Konten offen | keine Fristen im Code | Audit 12 Monate, Server-Protokolle laut Hoster, inaktive Konten 24 Monate mit Vorwarnung | Vorstand, DSB |
| D-17 | Push-Einwilligungstext: Konten-Verknüpfung, Push-Dienst Microsoft, Drittland | Text nennt „Google, Mozilla oder Apple“; Code erlaubt auch Microsoft; Konten-Abos tragen `benutzer_id` | Text anpassen (neue Fassung, neue Einwilligung); Drittlandgrundlage belegen | DSB, Technik |

## 9. Konsultation, Freigabe, Überprüfung

- **Stellungnahme der DSB (Art. 35 Abs. 2):** [Datum, Name, Ergebnis – DSB].
- **Standpunkt der Betroffenen (Art. 35 Abs. 9):** Eltern und Lehrkräfte werden angehört [Termin, Form – Bildung]; Kinder über die Probe der Chat-Regeln.
- **Entscheidung des Verantwortlichen:** [Datum, Name – Vorstand]: Maßnahmen und Restrisiko akzeptiert / nicht akzeptiert.
- **Vorherige Konsultation (Art. 36):** [nicht erforderlich / erforderlich – DSB].
- **Nächste Überprüfung:** [Datum, spätestens ein Jahr nach Freigabe].

| Version | Datum | Änderung |
| --- | --- | --- |
| 0.1 | 13.10.2026 | Entwurf aus dem Code-Stand; keine Bewertung durch die DSB |

## 10. Belege

- Pläne: `_gemeinde/AUFTRAG.md` §2.2, 2.7, 2.8, 3.5, 3.6, 5; `_gemeinde/MENSCHEN.md` MN-10, MN-11, MN-17, MN-19.
- Code: `web/src/lib/chat/{regeln,dienst,hashkette}.ts`; `web/src/lib/db/schema/{chat,konten,lernen,push}.ts`; `web/src/lib/rechte/{matrix,gruppen,sitzung,gemeinde}.ts`; `web/src/lib/push/*`; `web/src/server/actions/chat.ts`; `web/drizzle/migrations/0009_trigger_und_pruefungen.sql`; `betrieb/lokal/*`.
- ADR: `web/docs/adr/0026`, `0027`, `0028`, `0029`, `0034`, `0035`, `0036`.
- Tests: `web/tests/integration/{chat,lernen,push,verwaltung-benutzer}.test.ts`; `web/tests/unit/{chat-regeln,push,kopfzeilen-pfade,funktionen}.test.ts`; `web/tests/unit/rechte/*`.
