# Verarbeitungsverzeichnis (Vorlage)

Stand: 11.10.2026, Nachtrag 28.10.2026 (Marktstart IGMG: 2.6 bis 2.8). Zugehörig zu AUFTRAG V-11.

> **Vorlage zur fachlichen Prüfung. Dies ist keine Rechtsberatung.** Die Angaben beschreiben den Stand des Codes und der Anbieter-Dokumentation, soweit sie belegt sind. Sie ersetzen keine Prüfung durch eine Rechtsberatung oder die Datenschutzbeauftragte bzw. den Datenschutzbeauftragten. Alles in eckigen Klammern `[ ]` ist offen. Alles mit `[prüfen]` ist nicht belegt.

## 1. Verantwortliche Stelle

- **Name und Rechtsform:** [Name und Rechtsform – Vorstand] (Beleg: `web/drizzle/seeds/bereiche/rechtliches.ts`, Angaben im Impressum)
- **Anschrift, Telefon, E-Mail:** [Anschrift], [Telefonnummer], [E-Mail-Adresse] (gleicher Beleg)
- **Datenschutzbeauftragte/r:** [Angaben von der Gemeinde] (gleicher Beleg, Feld „datenschutzbeauftragte“)

## 2. Auftragsverarbeiter und Dienste

Auftragsverarbeiter sind Anbieter, die Daten im Auftrag der Gemeinde verarbeiten. Die Spalten „Vertrag“ und „Drittland“ beschreiben, was zu tun ist. Wo ein Anbieter die Angabe nicht belegt, steht „[prüfen]“.

### 2.1 Vercel: Hosting, Funktionen und Logs

| Feld          | Angabe                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rolle         | Auftragsverarbeiter für Hosting, Auslieferung, Funktionen, Build- und Laufzeitprotokolle [prüfen: Rollenzuordnung im Vertrag]                                                                                                                                                                                                                                                                                                                  |
| Daten         | Verbindungsdaten bei jedem Seitenaufruf (Adresse des Aufrufs, Zeitpunkt, Antwortstatus). Ob die IP-Adresse in den Protokollen steht, ist [prüfen]. Build-Protokolle und Deployment-Angaben. Konten der Technik-Mitglieder im Vercel-Team.                                                                                                                                                                                                      |
| Region        | Funktionen laufen in `fra1` (Frankfurt), gesetzt in `vercel.json` (Zeile 3, Schlüssel `regions`). Ohne diese Angabe wäre die Standardregion `iad1` (Belege: https://vercel.com/docs/llms-full.txt; https://vercel.com/docs/functions/configuring-functions/region). Laut Vercel-Doku bleiben statische Dateien standardmäßig in allen Regionen verteilt (https://vercel.com/docs/llms-full.txt). Ort der Logs und Protokollspeicher: [prüfen]. |
| Vertrag (AVV) | Auftragsverarbeitungsvertrag über die Vercel-Vertragsbedingungen für das Team [prüfen: Ort des Vertrags und Akzeptanzweg; die Vercel-Doku zu DPA wurde nicht gefunden]. Verantwortlich: Vorstand.                                                                                                                                                                                                                                              |
| Drittland     | Sitz des Vertragspartners und Übermittlung in ein Drittland [prüfen]. Grundlage laut Vercel (EU-US Data Privacy Framework oder Standardvertragsklauseln) [prüfen: nicht in der Vercel-Doku gefunden].                                                                                                                                                                                                                                          |

### 2.2 Neon: Datenbank

| Feld          | Angabe                                                                                                                                                                                                                                                                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rolle         | Auftragsverarbeiter für die Datenbank. Vertragspartner: [prüfen: direkt bei Neon oder über den Vercel Marketplace].                                                                                                                                                                                                                                   |
| Daten         | Alle Inhalte der Website-Datenbank: Veranstaltungsanmeldungen und weitere Formulareingänge (verschlüsselt, siehe Seed „Sicherheit“), Konten der Verwaltung, Sitzungen, Audit-Protokoll, Ratenfenster mit nicht umkehrbaren IP-Prüfwerten, Warteschlange des Mail-Ausgangs (ADR 0018, Festlegungen; `web/src/lib/umgebung.ts` Eintrag `DATABASE_URL`). |
| Region        | Ziel laut ADR 0018: `aws-eu-central-1` (Frankfurt). Die Vercel-Doku belegt diese Region nicht [prüfen: im Neon-Dashboard nachsehen].                                                                                                                                                                                                                  |
| Vertrag (AVV) | Auftragsverarbeitungsvertrag mit dem Vertragspartner aus der Zeile „Rolle“ [prüfen]. Verantwortlich: Vorstand.                                                                                                                                                                                                                                        |
| Drittland     | [prüfen].                                                                                                                                                                                                                                                                                                                                             |

**Offene Frage:** Enthalten Vorschau-Zweige Kopien echter Personendaten? Falls ja, ist jede Vorschau ein eigener Verarbeitungsort und muss in diese Liste [prüfen].

### 2.3 Vercel Blob: Medien

| Feld          | Angabe                                                                                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rolle         | Auftragsverarbeiter für den Medienspeicher, über Vercel [prüfen: Rolle und Vertragspartner].                                                                                                                                                                                   |
| Daten         | Hochgeladene Bilder und PDF-Dateien (Aushänge). Beim Hochladen entfernt die App Angaben wie EXIF und GPS (`web/src/lib/medien/verarbeiten.ts`, Zeilen 5–14).                                                                                                                   |
| Region        | Ziel laut ADR 0020: Frankfurt (`fra1`). Die Vercel-Doku nennt für `vercel blob create-store` den Standard `iad1` und belegt `fra1` nicht (https://vercel.com/docs/cli/blob) [prüfen].                                                                                          |
| Stand         | Im Code gibt es den Adapter `BlobSpeicher` (`web/src/lib/storage/index.ts`, Zeilen 96 und 124–125). Die Startprüfung meldet `blob` dagegen als „noch nicht angebunden“ (`web/src/lib/umgebung.ts`, Zeilen 829–835). Die Technik klärt, ob der Speicher produktiv ist [prüfen]. |
| Vertrag (AVV) | Über Vercel, wie in 2.1 [prüfen].                                                                                                                                                                                                                                              |
| Drittland     | [prüfen].                                                                                                                                                                                                                                                                      |

### 2.4 SMTP-Anbieter: Mailversand

| Feld          | Angabe                                                                                                                                                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anbieter      | [Anbieter – offen, ML-10 in `_archiv/lauf-gestaltung-2026-10/MENSCHEN.md`]                                                                                                                                                                                            |
| Rolle         | Auftragsverarbeiter für den Versand der Bestätigungs- und Benachrichtigungsmails.                                                                                                                                                                                     |
| Daten         | E-Mail-Adresse der Empfänger, Betreff und Text der Mail (Bestätigung mit Veranstaltung, Termin und Datum). Laut Seed enthält die Benachrichtigung der Ehrenamtlichen keine Formulardaten, nur einen Hinweis und einen Link (`rechtliches.ts`, Abschnitt „Empfänger“). |
| Region        | [prüfen: EU-Anbieter, Standort der Server].                                                                                                                                                                                                                           |
| Vertrag (AVV) | Vertrag mit dem gewählten Anbieter, vor dem Livegang [prüfen]. Verantwortlich: Vorstand.                                                                                                                                                                              |
| Drittland     | [prüfen].                                                                                                                                                                                                                                                             |
| Hinweis       | In der Produktion ist der Versand ohne `SMTP_HOST` nicht möglich (`web/src/lib/mail/transport.ts`, Zeilen 12–20).                                                                                                                                                     |

### 2.5 GitHub: Quellcode

| Feld          | Angabe                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Rolle         | Hosting des Quellcodes und der Versionsverwaltung. Keine Verarbeitung von Besucherdaten.                                                                           |
| Daten         | Keine Personendaten der Besucher. Konten der Technik-Mitglieder [prüfen: Rolle]. Geheimnisse und Umgebungsdateien stehen nicht im Repository (AUFTRAG, Grenze G4). |
| Region        | [prüfen].                                                                                                                                                          |
| Vertrag (AVV) | [prüfen], nur falls Personendaten im Konto verarbeitet werden.                                                                                                     |

### 2.6 Hinweis: Kartendienst OpenStreetMap (nicht im Auftrag genannt)

Dieser Dienst steht nicht in der Aufzählung von V-11. Er ist aber ein Empfänger, sobald er eingebunden ist. Die Karte lädt erst nach einem Klick, dabei wird die IP-Adresse übertragen (Seed `rechtliches.ts`, Abschnitt „Empfänger“).

- **Stand im Code:** `web/src/components/website/kontakt/Anfahrt.tsx` nutzt `KarteNachKlick` mit `osmEinbettung` aus `web/src/components/website/kontakt/karte.ts`.
- **Nachtrag 28.10.2026:** `KarteNachKlick` ist jetzt eine Hülle um `NachKlick` (`web/src/components/website/einbettung/NachKlick.tsx`). Die CSP erlaubt `frame-src https://www.openstreetmap.org` (`web/src/lib/sicherheit/header.ts`, `RAHMEN_QUELLEN`; ADR 0012, Nachtrag). Die Karte lädt mit `referrerPolicy="no-referrer"`, also ohne Herkunftsseite. Sie erscheint erst, wenn die Koordinaten bestätigt sind (M-010); bis dahin steht ein Platzhalter.
- **Datenschutzerklärung:** Der Seed (`rechtliches.ts`, Abschnitt „Empfänger“) beschreibt die Karte; der Prüfhinweis ist auf den Stand vom 28.10.2026 gebracht (ENTWURF, M-111).
- **Zu klären:** Rolle (eigenständiger Verantwortlicher, kein Auftragsverarbeiter) [prüfen].

### 2.7 YouTube-Videos nach Klick (Marktstart, 28.10.2026)

Seit dem Marktstart zeigt die Seite „Hadsch & Umra“ (`/hadsch-umra`, tr `/hac-umre`, en `/hajj-umrah`) Videos von IGMG Reisen. Sie laden erst nach einem Klick. Auf `/islamisches-wissen` stehen Videos nur als Link „Auf YouTube ansehen“, ohne Einbettung.

| Feld                 | Angabe                                                                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dienst               | YouTube (Google) über die Adresse `https://www.youtube-nocookie.com/embed/<id>` (`web/src/lib/einbettung/youtube.ts`).                                                                                                          |
| Auslöser             | Nur der Klick auf „Video laden“ (`NachKlick`). Vor dem Klick lädt die Seite nichts von Google, auch kein Vorschaubild (eigener Platzhalter; K-14).                                                                              |
| Daten                | IP-Adresse und Herkunftsseite. Wegen `referrerPolicy="strict-origin-when-cross-origin"` geht nur die Adresse der Website mit, ohne Pfad (E2E-Beleg `tests/e2e/hadsch-umra.spec.ts`). Was Google danach speichert, ist [prüfen]. |
| Rolle                | Eigenständiger Verantwortlicher, kein Auftragsverarbeiter [prüfen].                                                                                                                                                             |
| Rechtsgrundlage      | Klick als Einwilligung bzw. ausdrücklicher Wunsch [prüfen: Rechtsberatung, G-08].                                                                                                                                               |
| Drittland            | [prüfen].                                                                                                                                                                                                                       |
| Datenschutzerklärung | Entwurfsabsatz „Videos (Entwurf)“ im Seed `rechtliches.ts` (Abschnitt „Empfänger“), dazu der Hinweistext am Knopf (`messages/bereiche/einbettung.json`). Vor dem Livegang prüfen (M-111).                                       |

### 2.8 Abrufe beim Dachverband ohne Personendaten (Marktstart, 28.10.2026)

Die Website ruft Daten der IGMG nur serverseitig ab, per Cron oder auf Knopfdruck in der Verwaltung, nie beim Seitenaufruf (K-14). Dabei werden keine Personendaten übertragen oder gespeichert.

| Abruf                                                                                                       | Was                                                                                               | Daten der Besucher                                                      | Gespeichert                                                                                                   |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Hutba-Feed (`/api/wartung/dachverband-abgleich`, `web/src/lib/dachverband/feed.ts`)                         | RSS-Feed der Freitagspredigten auf igmg.org: nur Titel, Datum und Link                            | keine; eigener User-Agent, `credentials: 'omit'`, keine Weiterleitungen | Einträge im Seiteninhalt `dachverband`, Audit `dachverband.abgleich` ohne Personendaten                       |
| IGMG-Gebetskalender (`/api/wartung/gebetszeiten-abgleich`, `web/src/lib/gebetszeiten/quellen/igmg-feed.ts`) | Gebetszeiten für Wetzlar (Stadt-ID 20238) über den offiziellen Zugang, sobald er vorliegt (M-100) | keine; Schlüssel nur als Kopfzeile, `credentials: 'omit'`               | Tabelle `gebetszeit_abgleich` (Laufprotokoll ohne Personendaten, nach 90 Tagen gelöscht) und `gebetszeit_tag` |

Die Hinweis-Mails zum Abgleich gehen an Konten der Verwaltung mit dem Recht `gebetszeiten.bearbeiten`; sie fallen unter den Mailversand (2.4).

### 2.9 Nicht eingesetzt (bewusst)

Die App nutzt keine Analyse- oder Messdienste von Vercel. Die Pakete `@vercel/analytics` und `@vercel/speed-insights` sind nicht eingebunden (`web/package.json`, `web/src`). Die AUFTRAG-Leitplanke Datenschutz verbietet sie (AUFTRAG §4, „Datenschutz“).

## 3. Offene Punkte

1. AV-Verträge abschließen oder akzeptieren und den Nachweis ablegen (Vercel, Neon, SMTP-Anbieter). Verantwortlich: Vorstand. Siehe ML-12.
2. Drittlandgrundlagen für Vercel und Neon belegen [prüfen].
3. Region der Vercel-Logs und der Blob-Speicher bestätigen [prüfen].
4. Aufbewahrungsfrist der Vercel-Logs und Inhalt (IP-Adresse ja oder nein) festlegen [prüfen].
5. Status des Blob-Adapters klären (Widerspruch in 2.3). Die Karte ist eingebaut und lädt nur nach Klick (2.6).
6. Vorschau-Zweige: Enthalten sie echte Personendaten [prüfen]?
7. Angaben zur verantwortlichen Stelle und zur Datenschutzbeauftragten ergänzen.
8. YouTube nach Klick (2.7) und Karte (2.6): Rolle, Rechtsgrundlage und Drittland prüfen; Entwurf der Datenschutzerklärung freigeben (M-111), bevor weitere Videos eingebunden werden.

## 4. Belege

- `web/src/lib/umgebung.ts`, `web/.env.example`, `web/docs/adr/0018` bis `0022`, `web/docs/deploy/VERCEL.md`.
- `vercel.json` (Repository-Wurzel, Schlüssel `regions` und `crons`).
- `web/drizzle/seeds/bereiche/rechtliches.ts`: Angaben der verantwortlichen Stelle und der Abschnitte „Empfänger“ und „Sicherheit“ (nur gelesen).
- `web/src/lib/storage/index.ts`, `web/src/lib/medien/verarbeiten.ts`, `web/src/lib/mail/transport.ts`.
- Vercel-Doku (nur gelesen): https://vercel.com/docs/llms-full.txt, https://vercel.com/docs/functions/configuring-functions/region, https://vercel.com/docs/cli/blob.
