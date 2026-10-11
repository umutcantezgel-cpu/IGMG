# STATUS

**Statuszeile:** Phase P4 · Welle B fertig (B01–B07) · Welle C: C01, C02, C03, C06, C08–C10, C12–C16 fertig · Z 0/12 · nächster Schritt: Bündel 3 (C04, C05 Seiteninhalte, C10b Meldung, A23b Bedienabläufe, B10 Übersetzungsprüfung), parallel C07 Gebetszeiten und C11 Medien (Orchestrator), danach C17–C19, Tor B/C

## Prüfpunkt (2026-10-11, ~09:15)
- **Erledigt seit letztem Prüfpunkt:**
  - Bündel 2 (Haiku, L1 9–10/10): C01 Übersicht, C02 Neuigkeiten, C03 Ankündigungen (+ Block auf „Nachrichten“, E-033), C06 Kurse, C09 Postfach, C10 Tickets; Module freigeschaltet, Zähler Postfach/Tickets in der Seitenleiste
  - C12 Benutzer und Rollen (Orchestrator): Einladen (Mail + Link einmalig), Rollen, Sperren (Migration 0005 `user.gesperrt_am`, Better-Auth-Hook), Zwei-Faktor zurücksetzen, endgültig löschen, „Mein Konto“ (Passwort, Ersatzcodes)
  - Löschlauf: Papierkorb nach 30 Tagen (E-036), Melderdaten geschlossener Tickets nach 180 Tagen (E-037); Papierkorb-Sperre beim Speichern von Veranstaltungen
  - Vorbereitung Bündel 3: Route `/meldung` (tr `/bildirim`, en `/report`), Stubs `messages/bereiche/meldung.json`, `messages/verwaltung/seiteninhalte-organisationen.json`, `pruefeEinsendung()`
  - Belege: `_lauf/belege/welle-c/abnahme-buendel-2-c12.md`
- **Laufende Pakete:** keine
- **Nächster Schritt:** Commit/Push, Dev-Server neu starten, Bündel 3 starten
- **Dienste lokal:** `docker compose --profile entwicklung up -d db mailpit` (PostgreSQL 127.0.0.1:5432, Mailpit 127.0.0.1:8025); Dev-Server 127.0.0.1:3000 (Hintergrund)
- **Umgebung je Befehl:** `source _lauf/werkzeuge/umgebung.sh` (pnpm, Docker ohne Keychain-Helper, Telemetrie aus)

## Offene Punkte für spätere Pakete
- Medienwahl im Rich-Text-Editor (`bildAuswahl`) → C11; Neuigkeiten-Bild (`bildId`) → C11
- SP-A-03 Proxy-Vertrauen für `x-forwarded-for` (Ratenbegrenzung, Better Auth) → P5
- Passkey-Registrierung und -Anmeldung (Client-Plugin) → offen (M-092), Anmeldung bisher nur mit Authenticator-App
- Passwort vergessen (Selbstbedienung) → offen (M-092); bis dahin Administration: Zwei-Faktor zurücksetzen bzw. neu einladen
- TOTP-Wiederverwendung im selben Zeitfenster (Lichtung b) → Sicherheitsprüfer Tor P3/P5
- Redirect in Verwaltungsseiten liefert HTTP 200 + Client-Umleitung (gestreamt) – prüfen, ob 307 möglich (D05)

## Fortsetzung in neuer Sitzung
Zuerst lesen: `_lauf/STATUS.md`, `_lauf/KERN.md`, `_lauf/PLAN.md`, `web/docs/MUSTER.md`, `_lauf/ENTSCHEIDUNGEN.md`. Plan: `/Users/umurey/.claude/plans/auftrag-f-r-claude-code-linear-snowglobe.md`.
